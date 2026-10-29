<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Одна запись на пару «пользователь ↔ мероприятие» — запрет двойной регистрации
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['active', 'cancelled', 'cancelled_by_organizer'])->default('active');
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->unique(['event_id', 'user_id']);
        });

        // Не более одной реакции каждого типа от пользователя на мероприятие
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['like', 'interested']);
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['event_id', 'user_id', 'type']);
        });

        // Отметки об отправленных напоминаниях (24h / 1h), чтобы не дублировать
        Schema::create('event_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('kind', ['24h', '1h']);
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['event_id', 'user_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_reminders');
        Schema::dropIfExists('reactions');
        Schema::dropIfExists('registrations');
    }
};
