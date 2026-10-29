#!/usr/bin/env bash
# Запуск API (8000), планировщика напоминаний и фронтенда (5173). Ctrl+C — остановить всё.
ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-dev}" # dev | preview

trap 'kill 0' EXIT
(cd "$ROOT/module_a" && php artisan serve --host=127.0.0.1 --port=8000) &
(cd "$ROOT/module_a" && php artisan schedule:work) &
(cd "$ROOT/module_b" && npm run "$MODE") &
wait
