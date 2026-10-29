<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use App\Services\NotificationService;
use App\Support\EventPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegistrationController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    /** POST /api/events/{id}/register — кнопка «Пойду». */
    public function store(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        [$event, $becameFull] = DB::transaction(function () use ($id, $user) {
            // Блокировка строки мероприятия — защита от гонки за последнее место
            $event = Event::lockForUpdate()->find($id);
            $this->ensureVisible($event);

            if ($event->status === Event::STATUS_CANCELLED) {
                throw ApiException::conflict('EVENT_CANCELLED', 'Мероприятие отменено');
            }
            if ($event->hasStarted()) {
                throw ApiException::conflict('EVENT_STARTED', 'Мероприятие уже началось или прошло');
            }

            $registration = Registration::where('event_id', $event->id)->where('user_id', $user->id)->first();
            if ($registration?->status === Registration::STATUS_ACTIVE) {
                throw ApiException::conflict('ALREADY_REGISTERED', 'Вы уже зарегистрированы на это мероприятие');
            }
            if ($event->isFull()) {
                throw ApiException::conflict('EVENT_FULL', 'Свободных мест нет');
            }

            // Повторная регистрация после отмены — переиспользуем запись (уникальность пары user ↔ event)
            Registration::updateOrCreate(
                ['event_id' => $event->id, 'user_id' => $user->id],
                ['status' => Registration::STATUS_ACTIVE, 'registered_at' => now(), 'cancelled_at' => null],
            );

            return [$event, $event->isFull()];
        });

        $this->notifications->notify($user, 'registration_confirmed', 'Регистрация подтверждена',
            "Вы зарегистрированы на «{$event->title}». Начало: {$event->starts_at->format('d.m.Y H:i')}.", $event);

        if ($becameFull) {
            $this->notifications->notify($event->created_by, 'event_full', 'Все места заняты',
                "На «{$event->title}» зарегистрировано 100% участников ({$event->capacity} из {$event->capacity}).", $event);
        }

        return $this->eventResponse($request, $event, 201, 'Вы зарегистрированы на мероприятие');
    }

    /** DELETE /api/events/{id}/register — отмена регистрации (только до начала). */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $event = Event::find($id);
        $this->ensureVisible($event);

        $registration = Registration::where('event_id', $event->id)->where('user_id', $user->id)
            ->where('status', Registration::STATUS_ACTIVE)->first();
        if (! $registration) {
            throw ApiException::notFound('Активная регистрация не найдена');
        }
        if ($event->hasStarted()) {
            throw ApiException::conflict('EVENT_STARTED', 'Мероприятие уже началось — отмена регистрации невозможна');
        }

        $registration->update(['status' => Registration::STATUS_CANCELLED, 'cancelled_at' => now()]);

        return $this->eventResponse($request, $event, 200, 'Регистрация отменена');
    }

    private function ensureVisible(?Event $event): void
    {
        if (! $event || $event->status === Event::STATUS_DRAFT) {
            throw ApiException::notFound('Мероприятие не найдено');
        }
    }

    private function eventResponse(Request $request, Event $event, int $status, string $message): JsonResponse
    {
        $event = Event::with(['club', 'category'])->withCounters()->find($event->id);

        return response()->json([
            'message' => $message,
            'data' => EventPresenter::for($request->user(), [$event])->present($event),
        ], $status);
    }
}
