<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PDO;
use Throwable;

/**
 * Создаёт базу данных из .env (DB_DATABASE), если её нет. Не требует консольного клиента mysql.
 */
class CreateDatabase extends Command
{
    protected $signature = 'db:create';

    protected $description = 'Создать базу данных MySQL/MariaDB из настроек .env (если не существует)';

    public function handle(): int
    {
        $c = config('database.connections.'.config('database.default'));
        $name = $c['database'];

        try {
            $pdo = new PDO("mysql:host={$c['host']};port={$c['port']}", $c['username'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (Throwable $e) {
            $this->error("Не удалось создать базу «{$name}»: {$e->getMessage()}");
            $this->line('Проверьте, что MySQL запущен, и DB_USERNAME / DB_PASSWORD в module_a/.env.');

            return self::FAILURE;
        }

        $this->info("База данных «{$name}» готова");

        return self::SUCCESS;
    }
}
