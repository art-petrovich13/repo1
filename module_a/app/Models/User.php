<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name', 'email', 'password', 'faculty', 'course', 'avatar_url', 'role', 'is_blocked', 'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_blocked' => 'boolean',
            'course' => 'integer',
        ];
    }

    public function clubs(): BelongsToMany
    {
        return $this->belongsToMany(Club::class)->withPivot(['verified', 'verified_at'])->withTimestamps();
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /** ID Комьюнити, в которых пользователь верифицирован как представитель. */
    public function verifiedClubIds(): array
    {
        return $this->clubs()->wherePivot('verified', true)->pluck('clubs.id')->all();
    }

    public function isRepresentativeOf(int $clubId): bool
    {
        return in_array($clubId, $this->verifiedClubIds(), true);
    }

    public function isRepresentative(): bool
    {
        return $this->verifiedClubIds() !== [];
    }
}
