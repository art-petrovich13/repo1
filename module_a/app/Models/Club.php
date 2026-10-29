<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Club extends Model
{
    protected $fillable = ['name', 'description'];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot(['verified', 'verified_at'])->withTimestamps();
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
