<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\EmailVerificationToken;
use App\Models\User;
use App\Services\MailService;
use App\Services\TokenService;
use App\Support\Present;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        private readonly TokenService $tokens,
        private readonly MailService $mail,
    ) {}

    /** POST /api/auth/register — регистрация студента, email не подтверждён. */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:100'],
            'faculty' => ['required', 'string', 'max:150'],
            'course' => ['required', 'integer', 'between:1,6'],
        ], [
            'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        ]);

        $user = User::create($data + ['role' => 'student']);
        $verifyUrl = $this->sendVerification($user);

        $response = [
            'message' => 'Регистрация прошла успешно. Подтвердите email по ссылке из письма.',
            'user' => Present::user($user),
        ];
        if (config('app.debug')) {
            // Только для локальной разработки — письма эмулируются в лог
            $response['debug_verify_url'] = $verifyUrl;
        }

        return response()->json($response, 201);
    }

    /** GET /api/auth/verify-email?token=… или POST с {"token": "…"} — подтверждение email + автологин. */
    public function verifyEmail(Request $request): JsonResponse
    {
        $plain = (string) ($request->input('token') ?? $request->query('token'));
        if ($plain === '') {
            throw ApiException::validation(['token' => ['Токен обязателен']]);
        }

        $record = EmailVerificationToken::where('token_hash', hash('sha256', $plain))->first();
        if (! $record || $record->expires_at->isPast()) {
            throw ApiException::validation(['token' => ['Ссылка подтверждения недействительна или устарела']]);
        }

        $user = $record->user;
        $user->forceFill(['email_verified_at' => now()])->save();
        EmailVerificationToken::where('user_id', $user->id)->delete();

        if ($user->is_blocked) {
            throw new ApiException(403, 'USER_BLOCKED', 'Пользователь заблокирован');
        }

        return response()->json([
            'message' => 'Email подтверждён',
            'user' => Present::user($user),
        ] + $this->tokens->issue($user));
    }

    /** POST /api/auth/verify-email/resend — повторная отправка письма (ответ не раскрывает наличие email). */
    public function resendVerification(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $user = User::where('email', $data['email'])->whereNull('email_verified_at')->first();
        if ($user) {
            $this->sendVerification($user);
        }

        return response()->json(['message' => 'Если адрес зарегистрирован и не подтверждён, письмо отправлено повторно.']);
    }

    /** POST /api/auth/login */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ApiException::unauthorized('Неверный email или пароль');
        }
        if ($user->is_blocked) {
            throw new ApiException(403, 'USER_BLOCKED', 'Пользователь заблокирован');
        }
        if (! $user->email_verified_at) {
            throw new ApiException(403, 'NOT_VERIFIED', 'Email не подтверждён. Проверьте почту.');
        }

        return response()->json(['user' => Present::user($user)] + $this->tokens->issue($user));
    }

    /** POST /api/auth/refresh — {"refresh_token": "…"} */
    public function refresh(Request $request): JsonResponse
    {
        $data = $request->validate(['refresh_token' => ['required', 'string']]);
        $result = $this->tokens->refresh($data['refresh_token']);

        return response()->json(['user' => Present::user($result['user'])] + $result['tokens']);
    }

    /** POST /api/auth/logout — отзывает текущий access-токен и refresh-токен (если передан — только его, иначе все). */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()?->delete();
        $this->tokens->revokeRefresh($user, $request->input('refresh_token'));

        return response()->json(['message' => 'Вы вышли из аккаунта']);
    }

    private function sendVerification(User $user): string
    {
        EmailVerificationToken::where('user_id', $user->id)->delete();
        $plain = Str::random(64);
        EmailVerificationToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $plain),
            'expires_at' => now()->addDay(),
        ]);

        $url = MailService::frontendUrl('verify-email?token='.$plain);
        $this->mail->send($user->email, 'Подтверждение email — Афиша студенческих мероприятий',
            "Здравствуйте, {$user->name}!\n\nДля подтверждения email перейдите по ссылке:\n{$url}\n\nСсылка действительна 24 часа.");

        return $url;
    }
}
