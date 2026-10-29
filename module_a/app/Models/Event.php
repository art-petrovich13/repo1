<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'club_id', 'category_id', 'created_by', 'title', 'description', 'starts_at', 'ends_at',
        'location', 'format', 'capacity', 'cover_url', 'status', 'cancel_reason', 'published_at', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'published_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function activeRegistrations(): HasMany
    {
        return $this->registrations()->where('status', Registration::STATUS_ACTIVE);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    /** Счётчики: registrations_count, likes_count, interested_count. */
    public function scopeWithCounters(Builder $query): Builder
    {
        return $query->withCount([
            'activeRegistrations as registrations_count',
            'reactions as likes_count' => fn ($q) => $q->where('type', 'like'),
            'reactions as interested_count' => fn ($q) => $q->where('type', 'interested'),
        ]);
    }

    /**
     * Вычисляемое состояние для карточки: scheduled / ongoing / finished / cancelled / draft.
     */
    public function state(): string
    {
        if ($this->status !== self::STATUS_PUBLISHED) {
            return $this->status;
        }
        $now = now();
        if ($now->lt($this->starts_at)) {
            return 'scheduled';
        }

        return $now->lt($this->ends_at) ? 'ongoing' : 'finished';
    }

    public function hasStarted(): bool
    {
        return now()->gte($this->starts_at);
    }

    public function activeRegistrationsCount(): int
    {
        return $this->activeRegistrations()->count();
    }

    public function isFull(): bool
    {
        return $this->capacity !== null && $this->activeRegistrationsCount() >= $this->capacity;
    }
}
