<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventReminder;
use App\Models\Registration;
use App\Models\User;
use App\Services\NotificationService;
use App\Support\EventPresenter;
use App\Support\Paginate;
use App\Support\Present;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Управление мероприятиями представителем Комьюнити.
 * Принадлежность мероприятия Комьюнити представителя проверяется на сервере при каждом запросе.
 */
class EventManageController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    /** GET /api/me/events — мероприятия всех Комьюнити, где пользователь верифицирован (включая черновики). */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', 'in:draft,published,cancelled'],
            'club_id' => ['nullable', 'integer'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);
        $user = $request->user();

        $query = Event::with(['club', 'category'])->withCounters()
            ->whereIn('club_id', $user->verifiedClubIds())
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('club_id'), fn ($q, $c) => $q->where('club_id', (int) $c))
            ->when($request->query('q'), fn ($q, $s) => $q->where('title', 'like', '%'.$s.'%'))
            ->orderByDesc('starts_at')
            ->orderByDesc('id');

        $presenter = null;

        return Paginate::response($query, $request,
            function (Event $e) use (&$presenter) {
                return $presenter->present($e);
            },
            function ($items) use (&$presenter, $user) {
                $presenter = EventPresenter::for($user, $items);
            },
        );
    }

    /** POST /api/events — создание черновика от имени Комьюнити, где пользователь верифицирован. */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        // Обычный студент не может публиковать мероприятия ни при каких условиях
        if (! $user->isRepresentative()) {
            throw ApiException::forbidden('Создавать мероприятия могут только верифицированные представители Комьюнити');
        }
        $data = $request->validate($this->rules(), $this->messages());

        if (! $user->isRepresentativeOf((int) $data['club_id'])) {
            throw ApiException::forbidden('Вы не верифицированы как представитель этого Комьюнити');
        }

        $event = Event::create($data + [
            'created_by' => $user->id,
            'status' => Event::STATUS_DRAFT,
            'format' => $data['format'] ?? 'offline',
        ]);

        return $this->eventResponse($user, $event, 201, 'Мероприятие создано как черновик');
    }

    /** PATCH /api/events/{id} — любые поля, кроме club_id и created_by. */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $event = $this->findManaged($user, $id);

        if ($request->has('club_id') && (int) $request->input('club_id') !== $event->club_id) {
            throw ApiException::validation(['club_id' => ['Комьюнити мероприятия изменить нельзя']]);
        }
        if ($event->status === Event::STATUS_CANCELLED) {
            throw ApiException::conflict('EVENT_CANCELLED', 'Отменённое мероприятие нельзя редактировать');
        }

        $rules = collect($this->rules($event))->except(['club_id'])
            ->map(fn ($r) => array_merge(['sometimes'], $r))->all();
        $data = $request->validate($rules, $this->messages());

        // Проверка порядка дат с учётом текущих значений
        $startsAt = isset($data['starts_at']) ? Carbon::parse($data['starts_at']) : $event->starts_at;
        $endsAt = isset($data['ends_at']) ? Carbon::parse($data['ends_at']) : $event->ends_at;
        if ($endsAt->lte($startsAt)) {
            throw ApiException::validation(['ends_at' => ['Дата окончания должна быть позже даты начала']]);
        }
        if (array_key_exists('capacity', $data) && $data['capacity'] !== null) {
            $registered = $event->activeRegistrationsCount();
            if ($data['capacity'] < $registered) {
                throw ApiException::validation(['capacity' => ["Вместимость не может быть меньше числа зарегистрированных ({$registered})"]]);
            }
        }

        $oldStartsAt = $event->starts_at->copy();
        $oldLocation = $event->location;
        $event->fill($data);
        $timeChanged = $event->isDirty('starts_at') && ! $event->starts_at->eq($oldStartsAt);
        $placeChanged = $event->isDirty('location');
        $event->save();

        if ($event->status === Event::STATUS_PUBLISHED && ($timeChanged || $placeChanged)) {
            $changes = [];
            if ($timeChanged) {
                $changes[] = "время: {$oldStartsAt->format('d.m.Y H:i')} → {$event->starts_at->format('d.m.Y H:i')}";
                // Напоминания нужно отправить заново по новому времени
                EventReminder::where('event_id', $event->id)->delete();
            }
            if ($placeChanged) {
                $changes[] = "место: {$oldLocation} → {$event->location}";
            }
            $this->notifications->notifyParticipants($event, 'event_changed', 'Изменение в мероприятии',
                "В мероприятии «{$event->title}» изменились ".implode('; ', $changes).'.', email: true);
        }

        return $this->eventResponse($user, $event, 200, 'Мероприятие обновлено');
    }

    /** POST /api/events/{id}/publish — черновик становится доступным в афише. */
    public function publish(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $event = $this->findManaged($user, $id);

        if ($event->status === Event::STATUS_PUBLISHED) {
            throw ApiException::conflict('ALREADY_PUBLISHED', 'Мероприятие уже опубликовано');
        }
        if ($event->status === Event::STATUS_CANCELLED) {
            throw ApiException::conflict('EVENT_CANCELLED', 'Отменённое мероприятие нельзя опубликовать');
        }
        if ($event->hasStarted()) {
            throw ApiException::conflict('EVENT_STARTED', 'Нельзя опубликовать мероприятие, время начала которого прошло');
        }

        $event->update(['status' => Event::STATUS_PUBLISHED, 'published_at' => now()]);

        return $this->eventResponse($user, $event, 200, 'Мероприятие опубликовано');
    }

    /** POST /api/events/{id}/cancel — {"reason": "…"}; уведомляет всех зарегистрированных. */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:255']]);
        $user = $request->user();
        $event = $this->findManaged($user, $id);

        if ($event->status === Event::STATUS_CANCELLED) {
            throw ApiException::conflict('EVENT_CANCELLED', 'Мероприятие уже отменено');
        }
        if ($event->status === Event::STATUS_PUBLISHED && now()->gte($event->ends_at)) {
            throw ApiException::conflict('EVENT_STARTED', 'Нельзя отменить уже завершившееся мероприятие');
        }

        DB::transaction(function () use ($event, $data) {
            $this->notifications->notifyParticipants($event, 'event_cancelled', 'Мероприятие отменено',
                "«{$event->title}» отменено. Причина: {$data['reason']}", email: true);

            $event->registrations()->where('status', Registration::STATUS_ACTIVE)
                ->update(['status' => Registration::STATUS_CANCELLED_BY_ORGANIZER, 'cancelled_at' => now()]);
            $event->update([
                'status' => Event::STATUS_CANCELLED,
                'cancel_reason' => $data['reason'],
                'cancelled_at' => now(),
            ]);
        });

        return $this->eventResponse($user, $event, 200, 'Мероприятие отменено');
    }

    /** DELETE /api/events/{id} — только черновики; опубликованные можно лишь отменить. */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $event = $this->findManaged($request->user(), $id);

        if ($event->status !== Event::STATUS_DRAFT) {
            throw ApiException::conflict('EVENT_NOT_DRAFT', 'Удалить можно только черновик. Опубликованное мероприятие можно отменить.');
        }
        $event->delete();

        return response()->json(['message' => 'Черновик удалён']);
    }

    /** GET /api/events/{id}/participants?status=active|cancelled|cancelled_by_organizer */
    public function participants(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['nullable', 'in:active,cancelled,cancelled_by_organizer']]);
        $event = $this->findManaged($request->user(), $id);

        $query = Registration::where('event_id', $event->id)
            ->with('user')
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderByRaw("status = 'active' desc")
            ->orderBy('registered_at');

        return Paginate::response($query, $request, fn (Registration $r) => [
            'id' => $r->id,
            'user_id' => $r->user_id,
            'name' => $r->user->name,
            'email' => $r->user->email,
            'faculty' => $r->user->faculty,
            'course' => $r->user->course,
            'registered_at' => Present::date($r->registered_at),
            'status' => $r->status,
        ], null, [
            'event' => ['id' => $event->id, 'title' => $event->title, 'capacity' => $event->capacity],
            'active_count' => $event->activeRegistrationsCount(),
        ]);
    }

    /**
     * Мероприятие, которым пользователь может управлять.
     * Чужой черновик — 404 (не раскрываем существование), чужое опубликованное — 403.
     */
    private function findManaged(User $user, int $id): Event
    {
        $event = Event::find($id);
        if (! $event) {
            throw ApiException::notFound('Мероприятие не найдено');
        }
        $allowed = $user->isRepresentativeOf($event->club_id) || $user->isAdmin();
        if (! $allowed) {
            throw $event->status === Event::STATUS_DRAFT
                ? ApiException::notFound('Мероприятие не найдено')
                : ApiException::forbidden('Вы не представитель Комьюнити этого мероприятия');
        }

        return $event;
    }

    private function rules(?Event $event = null): array
    {
        return [
            'club_id' => ['required', 'integer', 'exists:clubs,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'min:3', 'max:150'],
            'description' => ['required', 'string', 'max:5000'],
            'starts_at' => ['required', 'date', 'after:now'],
            'ends_at' => $event ? ['required', 'date'] : ['required', 'date', 'after:starts_at'],
            'location' => ['required', 'string', 'max:255'],
            'format' => ['required', 'in:offline,online'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'cover_url' => ['nullable', 'string', 'max:500', 'regex:#^(https?://|/uploads/)#'],
        ];
    }

    private function messages(): array
    {
        return [
            'starts_at.after' => 'Дата начала должна быть в будущем',
            'ends_at.after' => 'Дата окончания должна быть позже даты начала',
            'cover_url.regex' => 'Обложка должна быть ссылкой (http/https) или загруженным файлом',
        ];
    }

    private function eventResponse(User $user, Event $event, int $status, string $message): JsonResponse
    {
        $event = Event::with(['club', 'category'])->withCounters()->find($event->id);

        return response()->json([
            'message' => $message,
            'data' => EventPresenter::for($user, [$event])->present($event),
        ], $status);
    }
}
