<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Notification;
use App\Models\Reaction;
use App\Models\Registration;
use App\Support\EventPresenter;
use App\Support\Paginate;
use App\Support\Present;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /** GET /api/me — профиль (доступен и заблокированному пользователю). */
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => Present::user($request->user())]);
    }

    /** PATCH /api/me — name, faculty, course, avatar_url. Email и роль не меняются. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'faculty' => ['sometimes', 'required', 'string', 'max:150'],
            'course' => ['sometimes', 'required', 'integer', 'between:1,6'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:500', 'regex:#^(https?://|/uploads/)#'],
        ], [
            'avatar_url.regex' => 'Аватар должен быть ссылкой (http/https) или загруженным файлом',
        ]);

        $user = $request->user();
        $user->update($data);

        return response()->json(['message' => 'Профиль обновлён', 'data' => Present::user($user->fresh())]);
    }

    /**
     * GET /api/me/registrations?period=upcoming|past
     * upcoming — предстоящие (активные и отменённые организатором);
     * past — посещённые: прошедшие мероприятия с активной регистрацией.
     * Без period — все, кроме отменённых самим пользователем.
     */
    public function registrations(Request $request): JsonResponse
    {
        $request->validate(['period' => ['nullable', 'in:upcoming,past']]);
        $user = $request->user();

        $query = Registration::query()
            ->where('registrations.user_id', $user->id)
            ->join('events', 'events.id', '=', 'registrations.event_id')
            ->select('registrations.*')
            ->with(['event' => fn ($q) => $q->with(['club', 'category'])->withCounters()]);

        match ($request->query('period')) {
            'upcoming' => $query->where('events.starts_at', '>', now())
                ->whereIn('registrations.status', [Registration::STATUS_ACTIVE, Registration::STATUS_CANCELLED_BY_ORGANIZER])
                ->orderBy('events.starts_at'),
            'past' => $query->where('events.starts_at', '<=', now())
                ->where('registrations.status', Registration::STATUS_ACTIVE)
                ->orderByDesc('events.starts_at'),
            default => $query->where('registrations.status', '!=', Registration::STATUS_CANCELLED)
                ->orderByDesc('events.starts_at'),
        };

        $presenter = null;

        return Paginate::response($query, $request,
            function (Registration $r) use (&$presenter) {
                return [
                    'id' => $r->id,
                    'event_id' => $r->event_id,
                    'status' => $r->status,
                    'registered_at' => Present::date($r->registered_at),
                    'cancelled_at' => Present::date($r->cancelled_at),
                    'can_cancel' => $r->status === Registration::STATUS_ACTIVE && ! $r->event->hasStarted(),
                    'is_visited' => $r->status === Registration::STATUS_ACTIVE && $r->event->hasStarted(),
                    'event' => $presenter->present($r->event),
                ];
            },
            function ($items) use (&$presenter, $user) {
                $presenter = EventPresenter::for($user, $items->pluck('event'));
            },
        );
    }

    /** GET /api/me/reactions — реакции пользователя с привязкой к мероприятиям. */
    public function reactions(Request $request): JsonResponse
    {
        $request->validate(['type' => ['nullable', 'in:like,interested']]);
        $user = $request->user();

        $query = Reaction::where('user_id', $user->id)
            ->whereHas('event', fn ($q) => $q->where('status', '!=', Event::STATUS_DRAFT))
            ->with(['event' => fn ($q) => $q->with(['club', 'category'])->withCounters()])
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        $presenter = null;

        return Paginate::response($query, $request,
            function (Reaction $r) use (&$presenter) {
                return [
                    'id' => $r->id,
                    'event_id' => $r->event_id,
                    'type' => $r->type,
                    'created_at' => Present::date($r->created_at),
                    'event' => $presenter->present($r->event),
                ];
            },
            function ($items) use (&$presenter, $user) {
                $presenter = EventPresenter::for($user, $items->pluck('event'));
            },
        );
    }

    /** GET /api/me/notifications?unread=true — уведомления, новые сверху; meta.unread_count. */
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id)
            ->when($request->boolean('unread'), fn ($q) => $q->whereNull('read_at'))
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        $unread = Notification::where('user_id', $user->id)->whereNull('read_at')->count();

        return Paginate::response($query, $request, fn (Notification $n) => self::notification($n), null, ['unread_count' => $unread]);
    }

    /** PATCH /api/me/notifications/{id}/read */
    public function readNotification(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)->find($id);
        if (! $notification) {
            throw ApiException::notFound('Уведомление не найдено');
        }
        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['data' => self::notification($notification)]);
    }

    /** POST /api/me/notifications/read-all */
    public function readAllNotifications(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Все уведомления прочитаны', 'updated' => $count]);
    }

    private static function notification(Notification $n): array
    {
        return [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $n->title,
            'message' => $n->message,
            'payload' => $n->payload ?? (object) [],
            'event_id' => $n->payload['event_id'] ?? null,
            'is_read' => $n->read_at !== null,
            'read_at' => Present::date($n->read_at),
            'created_at' => Present::date($n->created_at),
        ];
    }
}
