<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\RefreshToken;
use App\Models\User;
use App\Services\MailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordController extends Controller
{
    private const RESET_TTL_MINUTES = 60;

    public function __construct(private readonly MailService $mail) {}

    /** POST /api/auth/password/forgot — ответ одинаковый, независимо от наличия email. */
    public function forgot(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $user = User::where('email', $data['email'])->first();
        $response = ['message' => 'Если такой email зарегистрирован, на него отправлено письмо со ссылкой для восстановления пароля.'];

        if ($user) {
            $plain = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => hash('sha256', $plain), 'created_at' => now()],
            );
            $url = MailService::frontendUrl('password-reset?token='.$plain);
            $this->mail->send($user->email, 'Восстановление пароля — Афиша студенческих мероприятий',
                "Здравствуйте, {$user->name}!\n\nДля установки нового пароля перейдите по ссылке:\n{$url}\n\nСсылка действительна 60 минут. Если вы не запрашивали восстановление — проигнорируйте письмо.");
        }

        return response()->json($response);
    }

    /** POST /api/auth/password/reset — {"token", "password", "password_confirmation"} */
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
        ]);

        $row = DB::table('password_reset_tokens')->where('token', hash('sha256', $data['token']))->first();
        if (! $row || now()->diffInMinutes($row->created_at, true) > self::RESET_TTL_MINUTES) {
            throw ApiException::validation(['token' => ['Ссылка восстановления недействительна или устарела']]);
        }

        $user = User::where('email', $row->email)->firstOrFail();
        $user->update(['password' => $data['password']]);
        // Переход по ссылке из письма подтверждает владение email
        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
        DB::table('password_reset_tokens')->where('email', $row->email)->delete();
        $this->revokeSessions($user);

        return response()->json(['message' => 'Пароль изменён. Войдите с новым паролем.']);
    }

    /** POST /api/me/password — {"current_password", "password", "password_confirmation"} */
    public function change(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed', 'different:current_password'],
        ]);

        $user = $request->user();
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ApiException::validation(['current_password' => ['Текущий пароль указан неверно']]);
        }

        $user->update(['password' => $data['password']]);
        // Остальные сессии завершаются, текущий access-токен остаётся рабочим
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Пароль успешно изменён']);
    }

    private function revokeSessions(User $user): void
    {
        $user->tokens()->delete();
        RefreshToken::where('user_id', $user->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }
}
