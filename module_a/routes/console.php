<?php

use Illuminate\Support\Facades\Schedule;

// Напоминания о мероприятиях (24 ч / 1 ч). Запуск планировщика: php artisan schedule:work
Schedule::command('events:remind')->everyMinute()->withoutOverlapping();
