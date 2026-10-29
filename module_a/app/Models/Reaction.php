<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reaction extends Model
{
    public const TYPES = ['like', 'interested'];

    public const UPDATED_AT = null;

    protected $fillable = ['event_id', 'user_id', 'type'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
