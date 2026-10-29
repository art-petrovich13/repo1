# Афиша студенческих мероприятий

Конкурсное задание «Веб-дизайн и разработка».

| Папка | Содержимое |
|---|---|
| `module_a` | API: Laravel 12, PHP 8.2+, MySQL 8 / MariaDB, миграции, сидеры, Postman-коллекция `StudentEvents.postman_collection.json` |
| `module_b` | Клиентское приложение: React + TypeScript + Vite (исходники + собранная версия `dist`) |

## Требования

| ПО | Версия |
|---|---|
| PHP | 8.2+ (расширения: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip`) |
| Composer | 2.x |
| MySQL / MariaDB | MySQL 8.0+ / MariaDB 10.6+ |
| Node.js | 18+ (только для разработки/сборки `module_b`) |

## Модуль А — запуск API

```bash
cd module_a
composer install
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate
```

В `.env` проверьте доступ к БД (по умолчанию `root` без пароля, база `student_events`):

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_events
DB_USERNAME=root
DB_PASSWORD=
```

Создайте базу и заполните её:

```bash
mysql -u root -p -e "CREATE DATABASE student_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

API доступно по адресу `http://127.0.0.1:8000/api`.

### Планировщик напоминаний

Напоминания за 24 ч и за 1 ч до начала (команда `events:remind`, раз в минуту). В отдельном терминале:

```bash
php artisan schedule:work
```

Разовый запуск: `php artisan events:remind`.

### Эмулированные письма

`MAIL_MAILER=log` — письма (подтверждение email, восстановление пароля, отмена/изменение мероприятия)
записываются в `module_a/storage/logs/laravel.log`. Ссылки в письмах ведут на клиент (`FRONTEND_URL`).
При `APP_DEBUG=true` ответ `POST /api/auth/register` дополнительно содержит `debug_verify_url`.

### Postman

Импортируйте `module_a/StudentEvents.postman_collection.json`. Запросы «Вход …» сохраняют токены
в переменные коллекции автоматически. У каждого запроса есть описание использования.

## Тестовые учётные записи

| Роль | Email | Пароль |
|---|---|---|
| Администратор | admin@example.com | `Admin12345` |
| Представитель «RoboTech» и «Добро» | rep1@example.com | `password123` |
| Представитель «Буревестник» | rep2@example.com | `password123` |
| Представитель «Маска» | rep3@example.com | `password123` |
| Студент без верификации (проверка 403) | student@example.com | `password123` |
| Заблокированный (проверка 403) | blocked@example.com | `password123` — вход запрещён; демо-токен `blocked-demo-token` |
| Студенты | student1@example.com … student8@example.com | `password123` |

## Основные решения API

- Аутентификация: access-токен (Bearer, 60 мин) + refresh-токен (30 дней, ротация при обновлении).
- Ошибки: `{"error": {"code": "EVENT_FULL", "message": "…", "fields": {…}}}`; коды 401/403/404/409/422.
- Списки: `{"data": [...], "meta": {"page", "per_page", "total", "last_page"}}`.
- Статус мероприятия `draft / published / cancelled`; состояние `scheduled / ongoing / finished` вычисляется по датам (`state`).
- Загруженные изображения хранятся в `module_a/public/uploads` (без symlink — одинаково работает на Windows).
