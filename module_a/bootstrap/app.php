<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\ForceJson;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prependToGroup('api', ForceJson::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Все ошибки /api/* — в едином JSON-формате {"error": {"code", "message", "fields"?}}
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*') || $request->expectsJson());

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiException::response(422, 'VALIDATION_ERROR', 'Ошибка валидации', $e->errors());
            }
        });
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiException::response(401, 'UNAUTHORIZED', 'Токен отсутствует, недействителен или истёк');
            }
        });
        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiException::response(403, 'FORBIDDEN', 'Недостаточно прав');
            }
        });
        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiException::response(404, 'NOT_FOUND', 'Ресурс не найден');
            }
        });
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if ($request->is('api/*')) {
                $codes = [405 => 'METHOD_NOT_ALLOWED', 413 => 'PAYLOAD_TOO_LARGE', 429 => 'TOO_MANY_REQUESTS'];
                $status = $e->getStatusCode();

                return ApiException::response($status, $codes[$status] ?? 'HTTP_ERROR', $e->getMessage() ?: 'Ошибка запроса');
            }
        });
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') && ! config('app.debug')) {
                return ApiException::response(500, 'SERVER_ERROR', 'Внутренняя ошибка сервера');
            }
        });
    })->create();
