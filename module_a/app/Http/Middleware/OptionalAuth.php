<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Для публичных эндпоинтов: если передан валидный Bearer-токен — определяет пользователя
 * (нужно для отметок is_registered / my_reactions), иначе запрос обрабатывается как гостевой.
 */
class OptionalAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken() && ($user = Auth::guard('sanctum')->user())) {
            Auth::setUser($user);
            $request->setUserResolver(fn () => $user);
        }

        return $next($request);
    }
}
