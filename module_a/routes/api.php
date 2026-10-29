<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\PasswordController;
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
    //
});

// Эндпоинты для аутентифицированных пользователей: без токена — 401, заблокирован — 403 USER_BLOCKED
Route::middleware(['auth:sanctum', 'not_blocked'])->group(function () {
    Route::get('me', [MeController::class, 'show']);
    Route::post('me/password', [PasswordController::class, 'change']);
});
