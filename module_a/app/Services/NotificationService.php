<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Notification;
use App\Models\Registration;
use App\Models\User;

/**
 * Создание уведомлений пользователей. Для важных событий (отмена, изменение)
 * дополнительно эмулируется отправка письма.
 */
class NotificationService
{
    public function __construct(private readonly MailService $mail) {}

    public function notify(User|int $user, string $type, string $title, string $message, Event $event, bool $email = false): Notification
    {
        $userId = $user instanceof User ? $user->id : $user;
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'payload' => ['event_id' => $event->id],
        ]);

        if ($email) {
            $user = $user instanceof User ? $user : User::find($userId);
            $url = MailService::frontendUrl('events/'.$event->id);
            $this->mail->send($user->email, $title, "{$message}\n\nПодробнее: {$url}");
        }

        return $notification;
    }

    /** Уведомление всем активным участникам мероприятия. */
    public function notifyParticipants(Event $event, string $type, string $title, string $message, bool $email = false, ?string $status = Registration::STATUS_ACTIVE): void
    {
        $event->registrations()->where('status', $status)->with('user')->get()
            ->each(fn (Registration $r) => $this->notify($r->user, $type, $title, $message, $event, $email));
    }
}
