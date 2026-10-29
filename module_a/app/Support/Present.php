<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Преобразование моделей в JSON-структуры ответов API.
 */
class Present
{
    public static function url(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return str_starts_with($path, '/') ? rtrim(config('app.url'), '/').$path : $path;
    }

    public static function date($value): ?string
    {
        return $value?->toIso8601String();
    }

    /** Дата для текстов уведомлений/писем — в часовом поясе пользователей (APP_DISPLAY_TIMEZONE). */
    public static function human($value): string
    {
        return $value->copy()->timezone(config('app.display_timezone'))->format('d.m.Y H:i');
    }

    public static function user(User $user): array
    {
        $user->loadMissing('clubs');

        return [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'faculty' => $user->faculty,
            'course' => $user->course,
            'avatar_url' => self::url($user->avatar_url),
            'role' => $user->role,
            'is_blocked' => (bool) $user->is_blocked,
            'email_verified' => $user->email_verified_at !== null,
            'is_representative' => $user->clubs->contains(fn ($c) => (bool) $c->pivot->verified),
            'clubs' => $user->clubs->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'verified' => (bool) $c->pivot->verified,
                'verified_at' => $c->pivot->verified_at ? Carbon::parse($c->pivot->verified_at)->toIso8601String() : null,
            ])->values(),
            'created_at' => self::date($user->created_at),
        ];
    }
}
