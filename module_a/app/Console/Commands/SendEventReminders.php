<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\EventReminder;
use App\Models\Registration;
use App\Services\NotificationService;
use App\Support\Present;
use Illuminate\Console\Command;

/**
 * Напоминания участникам за 24 ч и за 1 ч до начала мероприятия.
 * Запускается планировщиком каждую минуту: php artisan schedule:work
 * Повторная отправка исключается таблицей event_reminders.
 */
class SendEventReminders extends Command
{
    protected $signature = 'events:remind';

    protected $description = 'Отправить напоминания о мероприятиях за 24 часа и за 1 час до начала';

    public function handle(NotificationService $notifications): int
    {
        $now = now();
        $sent = 0;

        $events = Event::where('status', Event::STATUS_PUBLISHED)
            ->whereBetween('starts_at', [$now, $now->copy()->addDay()])
            ->get();

        foreach ($events as $event) {
            $kind = $event->starts_at->lte($now->copy()->addHour()) ? '1h' : '24h';
            $text = $kind === '1h' ? 'начнётся менее чем через час' : 'начнётся менее чем через 24 часа';

            $registrations = Registration::where('event_id', $event->id)
                ->where('status', Registration::STATUS_ACTIVE)
                ->whereNotExists(fn ($q) => $q->from('event_reminders')
                    ->whereColumn('event_reminders.event_id', 'registrations.event_id')
                    ->whereColumn('event_reminders.user_id', 'registrations.user_id')
                    ->where('event_reminders.kind', $kind))
                ->get();

            foreach ($registrations as $registration) {
                $notifications->notify($registration->user_id, 'event_reminder', 'Скоро мероприятие',
                    "«{$event->title}» {$text}: ".Present::human($event->starts_at).", {$event->location}.", $event);

                // При часовом напоминании суточное уже неактуально — отмечаем оба
                foreach ($kind === '1h' ? ['24h', '1h'] : ['24h'] as $k) {
                    EventReminder::firstOrCreate(['event_id' => $event->id, 'user_id' => $registration->user_id, 'kind' => $k]);
                }
                $sent++;
            }
        }

        $this->info("Отправлено напоминаний: {$sent}");

        return self::SUCCESS;
    }
}
