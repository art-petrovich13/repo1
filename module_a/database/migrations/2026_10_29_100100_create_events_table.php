<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('location');
            $table->enum('format', ['offline', 'online'])->default('offline');
            $table->unsignedInteger('capacity')->nullable(); // null — без ограничения мест
            $table->string('cover_url')->nullable();
            $table->enum('status', ['draft', 'published', 'cancelled'])->default('draft');
            $table->string('cancel_reason')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
