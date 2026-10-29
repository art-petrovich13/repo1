<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Отправка писем. По умолчанию MAIL_MAILER=log — письма эмулируются
 * и записываются в storage/logs/laravel.log.
 */
class MailService
{
    public function send(string $to, string $subject, string $body): void
    {
        try {
            Mail::raw($body, fn ($m) => $m->to($to)->subject($subject));
        } catch (Throwable $e) {
            Log::warning("Не удалось отправить письмо на {$to}: {$e->getMessage()}");
        }
    }

    public static function frontendUrl(string $path): string
    {
        return rtrim(config('app.frontend_url'), '/').'/'.ltrim($path, '/');
    }
}
