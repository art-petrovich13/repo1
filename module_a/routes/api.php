<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DictionaryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => ['status' => 'ok']);

// ---------- Аутентификация ----------
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::get('verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('verify-email/resend', [AuthController::class, 'resendVerification']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware(['auth:sanctum', 'not_blocked']);
    Route::post('password/forgot', [PasswordController::class, 'forgot']);
    Route::post('password/reset', [PasswordController::class, 'reset']);
});

// Публичные эндпоинты: токен необязателен, но если передан — учитывается (и проверяется блокировка)
Route::middleware(['auth.optional', 'not_blocked'])->group(function () {
    Route::get('clubs', [DictionaryController::class, 'clubs']);
    Route::get('categories', [DictionaryController::class, 'categories']);
    Route::get('events', [EventController::class, 'index']);
    Route::get('events/{id}', [EventController::class, 'show'])->whereNumber('id');
});

// Эндпоинты для аутентифицированных пользователей: без токена — 401, заблокирован — 403 USER_BLOCKED
Route::middleware(['auth:sanctum', 'not_blocked'])->group(function () {
    Route::get('me', [MeController::class, 'show']);
    Route::patch('me', [MeController::class, 'update']);
    Route::post('me/password', [PasswordController::class, 'change']);
    Route::get('me/registrations', [MeController::class, 'registrations']);
    Route::get('me/reactions', [MeController::class, 'reactions']);
    Route::get('me/notifications', [MeController::class, 'notifications']);
    Route::patch('me/notifications/{id}/read', [MeController::class, 'readNotification'])->whereNumber('id');
    Route::post('me/notifications/read-all', [MeController::class, 'readAllNotifications']);

    Route::post('events/{id}/register', [RegistrationController::class, 'store'])->whereNumber('id');
    Route::delete('events/{id}/register', [RegistrationController::class, 'destroy'])->whereNumber('id');
    Route::post('events/{id}/reactions', [ReactionController::class, 'store'])->whereNumber('id');
    Route::delete('events/{id}/reactions', [ReactionController::class, 'destroy'])->whereNumber('id');
});
