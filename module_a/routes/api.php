<?php

use App\Http\Controllers\Api\AuthController;
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
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});
