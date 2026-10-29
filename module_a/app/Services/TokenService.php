<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Выдача пары токенов: access (Sanctum, короткий срок) + refresh (хранится хешем, ротация при обновлении).
 */
class TokenService
{
    public function issue(User $user): array
    {
        $accessTtl = (int) config('sanctum.access_ttl', 60);
        $access = $user->createToken('access', ['*'], now()->addMinutes($accessTtl));

        $refreshPlain = Str::random(64);
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $refreshPlain),
            'expires_at' => now()->addDays((int) config('sanctum.refresh_ttl_days', 30)),
        ]);

        return [
            'token_type' => 'Bearer',
            'access_token' => $access->plainTextToken,
            'expires_in' => $accessTtl * 60,
            'refresh_token' => $refreshPlain,
        ];
    }

    /** Проверяет refresh-токен, отзывает его и выдаёт новую пару. */
    public function refresh(string $plain): array
    {
        $token = RefreshToken::where('token_hash', hash('sha256', $plain))->first();

        if (! $token || $token->revoked_at || $token->expires_at->isPast()) {
            throw ApiException::unauthorized('Refresh-токен недействителен или истёк');
        }

        $user = $token->user;
        if ($user->is_blocked) {
            throw new ApiException(403, 'USER_BLOCKED', 'Пользователь заблокирован');
        }

        $token->update(['revoked_at' => now()]);

        return ['user' => $user, 'tokens' => $this->issue($user)];
    }

    public function revokeRefresh(User $user, ?string $plain): void
    {
        $query = RefreshToken::where('user_id', $user->id)->whereNull('revoked_at');
        if ($plain) {
            $query->where('token_hash', hash('sha256', $plain));
        }
        $query->update(['revoked_at' => now()]);
    }
}
