<div align="center">

# ✦ Пульс — афиша студенческих мероприятий

Студенческие Комьюнити публикуют события, студенты находят их в афише,
регистрируются в один клик и получают напоминания.

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## Содержание

- [Структура проекта](#структура-проекта)
- [Что нужно установить](#что-нужно-установить)
- [Запуск на Windows](#запуск-на-windows)
- [Запуск на macOS](#запуск-на-macos)
- [Ручной запуск (любая ОС)](#ручной-запуск-любая-ос)
- [Тестовые учётные записи](#тестовые-учётные-записи)
- [Письма, напоминания, Postman](#письма-напоминания-postman)
- [Частые проблемы](#частые-проблемы)
- [Коротко об API и страницах](#коротко-об-api-и-страницах)

---

## Структура проекта

```
competition/
├── module_a/                            API — Laravel 12 + MySQL
│   ├── app/                             контроллеры, сервисы, middleware, модели
│   ├── database/migrations, seeders     схема и тестовые данные
│   ├── database/dump.sql                SQL-дамп (запасной вариант)
│   └── StudentEvents.postman_collection.json
├── module_b/                            клиент — React + TypeScript + Vite + Tailwind
│   ├── src/                             исходники
│   └── dist/                            собранная версия
├── setup.bat · start.bat                установка и запуск (Windows)
├── setup.sh  · start.sh                 установка и запуск (macOS / Linux)
└── README.md
```

## Что нужно установить

| ПО | Версия | Зачем |
|---|---|---|
| **PHP** | 8.2 или новее | сервер API (модуль А) |
| **Composer** | 2.x | зависимости PHP |
| **MySQL** или MariaDB | MySQL 8.0+ / MariaDB 10.6+ | база данных |
| **Node.js** | 20.19+ или 22.12+ | клиент (модуль Б) |
| Git | любая | скачать проект (можно взять архивом) |

Нужные расширения PHP: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip`.

---

## Запуск на Windows

### 1. Проверить, что уже установлено

Откройте **PowerShell** и выполните по очереди:

```powershell
php -v
composer --version
mysql --version
node -v
git --version
```

Если команда выдаёт «не распознано как имя командлета», значит, программы нет. Поставьте её по шагу 2.

### 2. Установить недостающее

<details>
<summary><b>PHP</b> — установка и настройка php.ini</summary>

```powershell
winget install --id PHP.PHP.8.3 -e
```

Закройте и заново откройте PowerShell, проверьте `php -v`. Затем включите расширения и сертификаты
одним скриптом. Он создаёт `php.ini`, включает расширения, скачивает `cacert.pem` и прописывает `PHPRC`:

```powershell
$php = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter php.exe -Recurse | Select-Object -First 1).DirectoryName
Copy-Item "$php\php.ini-development" "$php\php.ini" -Force
Invoke-WebRequest https://curl.se/ca/cacert.pem -OutFile "$php\cacert.pem"
$ini = Get-Content "$php\php.ini"
$ini = $ini -replace '^;\s*extension_dir = "ext"', "extension_dir = `"$php\ext`""
foreach ($e in 'curl','fileinfo','mbstring','openssl','pdo_mysql','zip') { $ini = $ini -replace "^;extension=$e\s*$", "extension=$e" }
$ini = $ini -replace '^;?\s*curl\.cainfo\s*=.*', "curl.cainfo = `"$php\cacert.pem`""
$ini = $ini -replace '^;?\s*openssl\.cafile\s*=.*', "openssl.cafile = `"$php\cacert.pem`""
Set-Content "$php\php.ini" $ini -Encoding ASCII
[Environment]::SetEnvironmentVariable('PHPRC', $php, 'User'); $env:PHPRC = $php
php -m
```

В списке `php -m` должны быть `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `zip`.

> Если стоит **Open Server**, можно взять PHP и MySQL из него. Включите модули PHP 8.2+ и MySQL 8
> и добавьте папку PHP в `PATH`.

</details>

<details>
<summary><b>Composer</b></summary>

Скачайте и запустите **[Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe)**. На всех шагах жмите *Next*:
прокси не нужен, путь к `php.exe` установщик найдёт сам. Откройте **новый** терминал и проверьте `composer --version`.

</details>

<details>
<summary><b>MySQL, Node.js, Git</b></summary>

```powershell
winget install --id Oracle.MySQL -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Git.Git -e
```

Запомните пароль `root`, если задавали его при установке MySQL: он понадобится в `.env`.

</details>

### 3. Скачать проект

> ⚠️ Кладите проект в путь **только из латиницы и без пробелов**, например `C:\competition`.
> С кириллицей и пробелами в пути Composer на Windows часто падает с ошибкой «Permission denied».

```powershell
git clone https://github.com/art-petrovich13/repo1.git C:\competition
```

Или распакуйте архив проекта в `C:\competition`.

### 4. Установка и запуск

1. Убедитесь, что служба MySQL запущена.
2. Двойной клик по **`setup.bat`**. Скрипт выполнит `composer install`, создаст `.env` и ключ, создаст базу
   `student_events`, запустит миграции с сидерами, а затем `npm ci`.
3. Если у `root` в MySQL есть пароль, впишите его в `module_a\.env` (`DB_PASSWORD=`) и запустите `setup.bat` ещё раз.
4. Двойной клик по **`start.bat`**. Откроются три окна (API, планировщик, клиент), а браузер откроется
   на **http://localhost:5173**.

Чтобы запустить собранную версию из `dist`, выполните `start.bat preview`.

---

## Запуск на macOS

### 1. Установить Homebrew (если его нет)

Проверка: `brew -v`. Если команды нет:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

После установки выполните две команды `eval ...`, которые установщик напечатает в конце (для Apple Silicon).

### 2. Установить PHP, Composer, MySQL, Node.js

```bash
brew install php composer mysql node
```

Проверка:

```bash
php -v && composer --version && mysql --version && node -v
```

Расширения PHP из Homebrew уже включены, `php.ini` настраивать не нужно.

### 3. Запустить MySQL

```bash
brew services start mysql
```

По умолчанию у `root` нет пароля, и это совпадает с настройками проекта. Проверка: `mysql -u root -e "select version()"`.

> Если MySQL уже стоял и у `root` есть пароль, впишите его в `module_a/.env` (`DB_PASSWORD=`) после шага 4.

### 4. Скачать проект, установить и запустить

```bash
git clone https://github.com/art-petrovich13/repo1.git ~/competition
cd ~/competition
chmod +x setup.sh start.sh
./setup.sh      # composer install, .env, база, миграции + сидеры, npm ci
./start.sh      # API :8000 + планировщик + клиент :5173  (Ctrl+C — остановить всё)
```

Откройте **http://localhost:5173**. Собранная версия из `dist` запускается командой `./start.sh preview`.

---

## Ручной запуск (любая ОС)

Если скрипты не нужны, те же действия выполняются командами.

**Модуль А, один раз:**

```bash
cd module_a
composer install
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate
php artisan db:create         # создаёт базу из DB_DATABASE
php artisan migrate:fresh --seed
```

**Модуль Б, один раз:**

```bash
cd module_b
npm ci
```

**Запуск: три отдельных терминала**

| Терминал | Команда | Адрес |
|---|---|---|
| API | `cd module_a && php artisan serve --host=127.0.0.1 --port=8000` | http://127.0.0.1:8000/api |
| Напоминания | `cd module_a && php artisan schedule:work` | — |
| Клиент | `cd module_b && npm run dev` (или `npm run preview` для `dist`) | http://localhost:5173 |

Настройки БД лежат в `module_a/.env`: `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=student_events`, `DB_USERNAME=root`, `DB_PASSWORD=`.

Вместо миграций можно импортировать дамп `module_a/database/dump.sql`. Сидеры всё же предпочтительнее:
они строят даты мероприятий относительно текущего момента.

Сбросить базу к тестовым данным: `php artisan migrate:fresh --seed`.

---

## Тестовые учётные записи

| Роль | Email | Пароль |
|---|---|---|
| 🛡 Администратор | `admin@example.com` | `Admin12345` |
| ⭐ Представитель «RoboTech» и «Добро» | `rep1@example.com` | `password123` |
| ⭐ Представитель «Буревестник» | `rep2@example.com` | `password123` |
| ⭐ Представитель «Маска» | `rep3@example.com` | `password123` |
| 🎓 Студент без верификации (проверка 403) | `student@example.com` | `password123` |
| 🚫 Заблокированный | `blocked@example.com` | `password123`. Вход запрещён; для проверки 403 на остальных эндпоинтах есть демо-токен `Bearer blocked-demo-token` |
| 🎓 Студенты | `student1@example.com` … `student8@example.com` | `password123` |

> 💡 На странице входа (`/login`) есть блок **«Тестовые аккаунты»**: клик по аккаунту подставляет email и пароль в форму.

**Тестовые данные:** 4 Комьюнити, 6 категорий, 29 мероприятий (24 опубликованных: будущие, идущее, прошедшие;
3 черновика; 2 отменённых с причиной; одно с заполненными местами; онлайн-мероприятия), около 100 регистраций,
реакции и уведомления.

**Обложки** — фотографии с [Unsplash](https://unsplash.com), подключены ссылками (Unsplash License, бесплатное
использование). Если интернета нет, вместо фото показывается локальная SVG-обложка категории из
`module_a/public/uploads/covers`.

---

## Письма, напоминания, Postman

**📬 Эмулированные письма.** `MAIL_MAILER=log`: письма о подтверждении email, восстановлении пароля и об отмене или изменении
мероприятия записываются в **`module_a/storage/logs/laravel.log`**. При `APP_DEBUG=true` после регистрации клиент
показывает кнопку «Подтвердить email (демо)».

**⏰ Напоминания** за 24 ч и за 1 ч до начала: команда `events:remind`, её раз в минуту запускает `php artisan schedule:work`.
Разовый запуск: `php artisan events:remind`.

**🧪 Postman.** Импортируйте `module_a/StudentEvents.postman_collection.json`. Запросы «Вход …» сами сохраняют токены,
у каждого запроса есть описание, коллекцию можно прогнать целиком (*Run collection*).

---

## Частые проблемы

<details>
<summary><code>php</code> / <code>composer</code> «не распознано» (Windows)</summary>

Закройте **все** окна терминала и VS Code и откройте заново: так подтянется обновлённый `PATH`. Если не помогло,
выполните `& "$env:LOCALAPPDATA\Microsoft\WinGet\Links\php.exe" -v` и добавьте эту папку в `PATH`.
</details>

<details>
<summary>Composer: «Permission denied» при скачивании пакетов</summary>

Перенесите проект в путь без кириллицы и пробелов (`C:\competition`) и выполните:
`composer clear-cache`, затем `$env:COMPOSER_MAX_PARALLEL_HTTP = 1`, затем `composer install`.
Если ошибка повторится, добавьте папку проекта в исключения Защитника Windows.
</details>

<details>
<summary>«SSL certificate verify failed» / «Unable to find the wrapper https»</summary>

Не включён `openssl` или не указан `cacert.pem`. Выполните скрипт настройки PHP из раздела Windows.
</details>

<details>
<summary>«Access denied for user 'root'» / «Unknown database»</summary>

Проверьте `DB_USERNAME` и `DB_PASSWORD` в `module_a/.env`, затем выполните `php artisan db:create` и `php artisan migrate:fresh --seed`.
</details>

<details>
<summary>Порт 8000 или 5173 занят</summary>

API: `php artisan serve --port=8001`, тогда в `module_b/.env` укажите `API_PROXY_TARGET=http://127.0.0.1:8001`.
Клиент: `npm run dev -- --port 5174`.
</details>

<details>
<summary>Клиент открывается, но данные не грузятся</summary>

API должно работать на `127.0.0.1:8000`: проверьте окно `php artisan serve` и ответ http://127.0.0.1:8000/api/ping.
</details>

---

## Коротко об API и страницах

**API** (`/api`, JSON):
- **Авторизация:** `Authorization: Bearer <access_token>`. Access-токен живёт 60 минут, refresh-токен 30 дней (при обновлении выдаётся новая пара).
- **Ошибки:** `{"error": {"code", "message", "fields"}}` со статусами 401 / 403 (`FORBIDDEN`, `NOT_VERIFIED`, `USER_BLOCKED`) /
  404 / 409 (`ALREADY_REGISTERED`, `EVENT_FULL`, `EVENT_STARTED`, `EVENT_CANCELLED`) / 422 (`VALIDATION_ERROR`).
- **Списки:** `{"data": [...], "meta": {"page", "per_page", "total", "last_page"}}`, по умолчанию `page=1`, `per_page=12`.
- **Сверх ТЗ:** API администратора `/api/admin/*`, загрузка изображений `POST /api/uploads`.

**Клиент:**

| Путь | Что там |
|---|---|
| `/` | афиша: фильтры, поиск, сортировка, «Показать ещё» |
| `/events/:id` | карточка: «Пойду», реакции, состояния, управление для представителя |
| `/login` · `/register` · `/password-reset` | вход, регистрация с подтверждением email, восстановление пароля |
| `/me` · `/me/registrations` · `/me/reactions` · `/me/notifications` | личный кабинет |
| `/me/events` · `/me/events/new` · `/me/events/:id/edit` · `/me/events/:id/participants` | кабинет представителя |

Светлая (по умолчанию) и тёмная темы, адаптивная вёрстка для компьютера, планшета и смартфона.
