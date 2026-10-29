# Пульс — афиша студенческих мероприятий

Конкурсное задание «Веб-дизайн и разработка». Верифицированные представители Комьюнити публикуют мероприятия,
студенты просматривают афишу, регистрируются («Пойду») и ставят реакции.

| Папка / файл | Содержимое |
|---|---|
| `module_a/` | API: Laravel 12, PHP 8.2+, MySQL; миграции, сидеры, SQL-дамп `database/dump.sql`, Postman-коллекция `StudentEvents.postman_collection.json` |
| `module_b/` | Клиент: React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router + Motion; исходники в `src/`, собранная версия в `dist/` |
| `setup.bat` / `setup.sh` | Первичная установка (зависимости, `.env`, база, сидеры) |
| `start.bat` / `start.sh` | Запуск API, планировщика напоминаний и клиента |

## Требования

| ПО | Версия | Проверка |
|---|---|---|
| PHP | 8.2+ с расширениями `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip` | `php -v`, `php -m` |
| Composer | 2.x | `composer --version` |
| MySQL / MariaDB | MySQL 8.0+ / MariaDB 10.6+ | `mysql --version` |
| Node.js | 20.19+ или 22.12+ (npm 10+) | `node -v` |

Проверено: macOS (PHP 8.5, MySQL 8.0, Node 24). Целевая платформа: Windows 10+ (PHP 8.3, MySQL 8.4, Node 22).

## Быстрый старт (Windows)

1. Запустите MySQL. По умолчанию используется пользователь `root` без пароля. Если пароль есть, после первого
   запуска `setup.bat` впишите его в `module_a\.env` (`DB_PASSWORD=`) и запустите `setup.bat` ещё раз.
2. Двойной клик по **`setup.bat`**. Он выполнит `composer install`, создаст `.env` и ключ, создаст базу `student_events`,
   запустит миграции и сидеры, а затем `npm ci` для клиента.
3. Двойной клик по **`start.bat`**. Откроются три окна: API (`http://127.0.0.1:8000`), планировщик напоминаний и клиент
   (`http://localhost:5173`). Браузер откроется сам.
   Чтобы запустить собранную версию из `dist`, используйте `start.bat preview`.

На macOS / Linux те же шаги выполняют `./setup.sh` и `./start.sh` (или `./start.sh preview`).

## Ручной запуск

### Модуль А — API

```bash
cd module_a
composer install
cp .env.example .env            # Windows: copy .env.example .env
php artisan key:generate
php artisan db:create           # создаёт базу из DB_DATABASE (или создайте её вручную, utf8mb4)
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Настройки БД в `module_a/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_events
DB_USERNAME=root
DB_PASSWORD=
```

Вместо миграций можно импортировать дамп: `mysql -u root student_events < module_a/database/dump.sql`.
Даты мероприятий в дампе отсчитываются от момента его создания, поэтому рекомендуемый способ — сидеры:
они строят даты относительно текущего момента.

**Планировщик напоминаний.** Команда `events:remind` рассылает уведомления за 24 ч и за 1 ч до начала, запуск раз в минуту.
Держите открытым отдельное окно с командой:

```bash
php artisan schedule:work
```

Разовый запуск вручную: `php artisan events:remind`.

**Эмулированные письма.** При `MAIL_MAILER=log` письма (подтверждение email, восстановление пароля, отмена или изменение
мероприятия) записываются в **`module_a/storage/logs/laravel.log`**. Ссылки в письмах ведут на клиент (`FRONTEND_URL`).
При `APP_DEBUG=true` ответ на регистрацию дополнительно содержит `debug_verify_url`, а клиент показывает
кнопку «Подтвердить email (демо)».

### Модуль Б — клиент

```bash
cd module_b
npm ci
npm run dev        # разработка: http://localhost:5173
npm run build      # сборка в dist/
npm run preview    # запуск собранной версии: http://localhost:5173
```

Клиент обращается к API по относительному пути `/api`, а Vite проксирует `/api` и `/uploads` на `http://127.0.0.1:8000`.
Адрес API меняется в `module_b/.env` (`API_PROXY_TARGET`, см. `.env.example`).

### Postman

Импортируйте `module_a/StudentEvents.postman_collection.json`. Запросы «Вход …» сохраняют токены в переменные коллекции
автоматически. У каждого запроса есть описание, коллекцию можно прогнать целиком (Run collection).

## Тестовые учётные записи

| Роль | Email | Пароль |
|---|---|---|
| Администратор | admin@example.com | `Admin12345` |
| Представитель «RoboTech» и «Добро» | rep1@example.com | `password123` |
| Представитель «Буревестник» | rep2@example.com | `password123` |
| Представитель «Маска» | rep3@example.com | `password123` |
| Студент без верификации (проверка 403) | student@example.com | `password123` |
| Заблокированный (проверка 403) | blocked@example.com | `password123`. Вход запрещён (403 USER_BLOCKED); для проверки остальных эндпоинтов есть демо-токен `Authorization: Bearer blocked-demo-token` |
| Студенты | student1@example.com … student8@example.com | `password123` |

## Тестовые данные (сидеры)

- 4 Комьюнити, 6 категорий (Спорт, Наука, Культура, Образование, Развлечения, Волонтёрство);
- 13 мероприятий: 8 опубликованных (4 будущих, 1 идёт сейчас, 3 прошедших), 3 черновика, 2 отменённых с причиной;
  среди них одно с заполненными местами (Турнир по волейболу, `EVENT_FULL`) и одно онлайн;
- регистрации и реакции, чтобы счётчики не были пустыми; уведомления у студентов (`event_cancelled`, `registration_confirmed` и др.);
- обложки — SVG в `module_a/public/uploads/covers`.

## API — основное

- Префикс `/api`, JSON. Авторизация: `Authorization: Bearer <access_token>`. Access-токен живёт 60 минут, refresh-токен 30 дней;
  при обновлении (`POST /api/auth/refresh`) выдаётся новая пара, а старый refresh-токен отзывается.
- Ошибки: `{"error": {"code": "EVENT_FULL", "message": "…", "fields": {…}}}`; статусы 401 / 403 (`FORBIDDEN`, `NOT_VERIFIED`,
  `USER_BLOCKED`) / 404 / 409 (`ALREADY_REGISTERED`, `EVENT_FULL`, `EVENT_STARTED`, `EVENT_CANCELLED`) / 422 (`VALIDATION_ERROR`).
- Списки: `{"data": [...], "meta": {"page", "per_page", "total", "last_page"}}`, параметры `page` и `per_page` (по умолчанию 12).
- Статус мероприятия `draft / published / cancelled`; состояние `scheduled / ongoing / finished` вычисляется по датам (поле `state`).
- Дополнительно к ТЗ: API администратора `/api/admin/*` (блокировка пользователей, верификация представителей, Комьюнити, категории),
  загрузка изображений `POST /api/uploads`, `POST /api/me/notifications/read-all`.

## Клиент — страницы

| Путь | Страница |
|---|---|
| `/` | Афиша: фильтры (категория, Комьюнити, формат, даты, «только предстоящие»), поиск, сортировка, «Показать ещё» |
| `/events/:id` | Карточка мероприятия: «Пойду», реакции, состояния (отменено / мест нет / прошло), управление для представителя |
| `/login`, `/register`, `/verify-email`, `/password-reset` | Вход, регистрация с валидацией, подтверждение email с автовходом, восстановление пароля |
| `/me` | Профиль, статус и Комьюнити, смена пароля, выход |
| `/me/registrations`, `/me/reactions`, `/me/notifications` | Регистрации (предстоящие / прошедшие), реакции, уведомления |
| `/me/events`, `/me/events/new`, `/me/events/:id/edit`, `/me/events/:id/participants` | Для представителей: мероприятия, форма с превью, участники с экспортом в TXT / CSV |

Светлая (по умолчанию) и тёмная темы переключаются кнопкой в шапке. Вёрстка адаптивная: компьютер, планшет, смартфон.
