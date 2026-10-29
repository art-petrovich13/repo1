#!/usr/bin/env bash
# Первичная настройка (macOS / Linux)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT/module_a"
composer install --no-interaction
[ -f .env ] || { cp .env.example .env; php artisan key:generate --force; }
php artisan db:create
php artisan migrate:fresh --seed --force

cd "$ROOT/module_b"
npm ci
echo "Готово. Запуск: ./start.sh"
