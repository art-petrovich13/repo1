<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Заблокированный пользователь получает 403 USER_BLOCKED на всех эндпоинтах, кроме GET /api/me.
 */
class EnsureNotBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_blocked && ! ($request->isMethod('GET') && $request->is('api/me'))) {
            throw new ApiException(403, 'USER_BLOCKED', 'Пользователь заблокирован');
        }

        return $next($request);
    }
}
