<?php

namespace App\Support;

use App\Models\Event;
use App\Models\Reaction;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Карточка мероприятия в ответах API. Для авторизованного пользователя добавляет
 * отметки is_registered / registration_status / my_reactions и признак can_manage.
 */
class EventPresenter
{
    private array $registrations = [];
    private array $reactions = [];
    private array $managedClubIds = [];

    /** @param iterable<Event> $events */
    public function __construct(private readonly ?User $user, iterable $events = [])
    {
        if (! $user) {
            return;
        }
        $ids = collect($events)->pluck('id')->all();
        if ($ids) {
            $this->registrations = Registration::where('user_id', $user->id)->whereIn('event_id', $ids)
                ->pluck('status', 'event_id')->all();
            $this->reactions = Reaction::where('user_id', $user->id)->whereIn('event_id', $ids)
                ->get(['event_id', 'type'])->groupBy('event_id')
                ->map(fn (Collection $g) => $g->pluck('type')->values()->all())->all();
        }
        $this->managedClubIds = $user->verifiedClubIds();
    }

    public static function for(?User $user, iterable $events): self
    {
        return new self($user, $events);
    }

    public function present(Event $e): array
    {
        $registered = $e->registrations_count ?? $e->activeRegistrationsCount();
        $likes = $e->likes_count ?? $e->reactions()->where('type', 'like')->count();
        $interested = $e->interested_count ?? $e->reactions()->where('type', 'interested')->count();

        $data = [
            'id' => $e->id,
            'title' => $e->title,
            'description' => $e->description,
            'club' => $e->club ? ['id' => $e->club->id, 'name' => $e->club->name] : null,
            'category' => $e->category ? ['id' => $e->category->id, 'name' => $e->category->name, 'slug' => $e->category->slug] : null,
            'starts_at' => Present::date($e->starts_at),
            'ends_at' => Present::date($e->ends_at),
            'location' => $e->location,
            'format' => $e->format,
            'capacity' => $e->capacity,
            'registrations_count' => $registered,
            'seats_left' => $e->capacity !== null ? max(0, $e->capacity - $registered) : null,
            'is_full' => $e->capacity !== null && $registered >= $e->capacity,
            'reactions' => ['like' => $likes, 'interested' => $interested],
            'popularity' => $registered + $likes + $interested,
            'cover_url' => Present::url($e->cover_url),
            'status' => $e->status,
            // Вычисляемое состояние: scheduled / ongoing / finished / cancelled / draft
            'state' => $e->state(),
            'cancel_reason' => $e->cancel_reason,
            'published_at' => Present::date($e->published_at),
            'created_at' => Present::date($e->created_at),
        ];

        if ($this->user) {
            $regStatus = $this->registrations[$e->id] ?? null;
            $data['is_registered'] = $regStatus === Registration::STATUS_ACTIVE;
            $data['registration_status'] = $regStatus;
            $data['my_reactions'] = $this->reactions[$e->id] ?? [];
            $data['can_manage'] = in_array($e->club_id, $this->managedClubIds, true);
        }

        return $data;
    }
}
