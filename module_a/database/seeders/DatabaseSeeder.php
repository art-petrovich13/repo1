<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Club;
use App\Models\Event;
use App\Models\EventReminder;
use App\Models\Notification;
use App\Models\Reaction;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * Тестовые данные. Учётные записи — см. README.md.
 * Даты мероприятий считаются относительно момента запуска сидера.
 */
class DatabaseSeeder extends Seeder
{
    public const ADMIN_PASSWORD = 'Admin12345';
    public const USER_PASSWORD = 'password123';
    public const BLOCKED_DEMO_TOKEN = 'blocked-demo-token';

    /** Ссылка на фото Unsplash по ID, обрезанное до 16:10. */
    public static function photo(string $id): string
    {
        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w=1200&h=750&q=75";
    }

    public function run(): void
    {
        $now = Carbon::now()->startOfHour();
        $userPassword = Hash::make(self::USER_PASSWORD);

        // ---------- Пользователи ----------
        $mkUser = fn (array $attrs) => User::create($attrs + [
            'password' => $userPassword,
            'email_verified_at' => $now,
            'role' => 'student',
        ]);

        $mkUser([
            'name' => 'Администратор', 'email' => 'admin@example.com', 'role' => 'admin',
            'password' => Hash::make(self::ADMIN_PASSWORD), 'faculty' => 'Администрация', 'course' => null,
        ]);

        $rep1 = $mkUser(['name' => 'Алексей Смирнов', 'email' => 'rep1@example.com', 'faculty' => 'Информатика и вычислительная техника', 'course' => 3]);
        $rep2 = $mkUser(['name' => 'Мария Иванова', 'email' => 'rep2@example.com', 'faculty' => 'Физическая культура', 'course' => 2]);
        $rep3 = $mkUser(['name' => 'Дмитрий Козлов', 'email' => 'rep3@example.com', 'faculty' => 'Филология', 'course' => 4]);

        $student = $mkUser(['name' => 'Иван Петров', 'email' => 'student@example.com', 'faculty' => 'Экономика', 'course' => 1]);
        $blocked = $mkUser(['name' => 'Заблокированный Пользователь', 'email' => 'blocked@example.com', 'faculty' => 'Юриспруденция', 'course' => 2, 'is_blocked' => true]);
        // Войти заблокированный не может (403 USER_BLOCKED), поэтому для проверки 403 на остальных
        // эндпоинтах ему заранее выдан бессрочный демо-токен: Authorization: Bearer blocked-demo-token
        $blocked->tokens()->create(['name' => 'demo', 'token' => hash('sha256', self::BLOCKED_DEMO_TOKEN), 'abilities' => ['*']]);

        $students = collect([
            ['Анна Соколова', 'Прикладная математика', 2],
            ['Сергей Морозов', 'Информатика и вычислительная техника', 1],
            ['Елена Волкова', 'Журналистика', 3],
            ['Никита Лебедев', 'Физика', 2],
            ['Ольга Новикова', 'Психология', 4],
            ['Артём Фёдоров', 'Менеджмент', 1],
            ['Дарья Кузнецова', 'Дизайн', 2],
            ['Максим Попов', 'Биология', 3],
        ])->map(fn ($s, $i) => $mkUser([
            'name' => $s[0], 'email' => 'student'.($i + 1).'@example.com', 'faculty' => $s[1], 'course' => $s[2],
        ]));

        // ---------- Справочники ----------
        $robo = Club::create(['name' => 'Клуб робототехники «RoboTech»', 'description' => 'Собираем роботов, участвуем в соревнованиях и проводим хакатоны.']);
        $sport = Club::create(['name' => 'Спортивный клуб «Буревестник»', 'description' => 'Турниры, тренировки и спортивные праздники для всех студентов.']);
        $theatre = Club::create(['name' => 'Театральная студия «Маска»', 'description' => 'Студенческий театр: спектакли, импровизация, мастер-классы.']);
        $volunteer = Club::create(['name' => 'Волонтёрский центр «Добро»', 'description' => 'Экологические акции, помощь приютам и городские субботники.']);

        $verify = fn (User $u, Club $c) => $u->clubs()->attach($c->id, ['verified' => true, 'verified_at' => $now]);
        $verify($rep1, $robo);
        $verify($rep1, $volunteer); // один представитель — несколько Комьюнити
        $verify($rep2, $sport);
        $verify($rep3, $theatre);
        // Студент состоит в клубе, но не верифицирован — для проверки 403
        $student->clubs()->attach($robo->id, ['verified' => false]);

        $cat = collect([
            'sport' => 'Спорт', 'science' => 'Наука', 'culture' => 'Культура',
            'education' => 'Образование', 'fun' => 'Развлечения', 'volunteer' => 'Волонтёрство',
        ])->map(fn ($name, $slug) => Category::create(['name' => $name, 'slug' => $slug]));

        // ---------- Мероприятия ----------
        $mkEvent = function (array $a) use ($now) {
            $status = $a['status'] ?? Event::STATUS_PUBLISHED;
            $starts = $now->copy()->addHours($a['in_hours']);

            return Event::create([
                'club_id' => $a['club']->id,
                'category_id' => $a['category']->id,
                'created_by' => $a['by']->id,
                'title' => $a['title'],
                'description' => $a['description'],
                'starts_at' => $starts,
                'ends_at' => $starts->copy()->addHours($a['duration'] ?? 2),
                'location' => $a['location'],
                'format' => $a['format'] ?? 'offline',
                'capacity' => $a['capacity'] ?? null,
                // Фото — ссылкой на Unsplash (бесплатная лицензия); без интернета клиент покажет SVG-обложку категории
                'cover_url' => isset($a['photo']) ? self::photo($a['photo']) : '/uploads/covers/'.$a['cover'].'.svg',
                'status' => $status,
                'cancel_reason' => $a['cancel_reason'] ?? null,
                'published_at' => $status === Event::STATUS_DRAFT ? null : $now->copy()->subDays(7),
                'cancelled_at' => $status === Event::STATUS_CANCELLED ? $now->copy()->subDay() : null,
            ]);
        };

        // Опубликованные — будущие
        $hackathon = $mkEvent([
            'club' => $robo, 'category' => $cat['science'], 'by' => $rep1, 'in_hours' => 24 * 5, 'duration' => 24,
            'photo' => '1504384308090-c894fdcc538d', 'title' => 'Хакатон «Умный кампус»', 'capacity' => 40, 'cover' => 'robotics',
            'location' => 'Корпус А, коворкинг 3 этаж',
            'description' => "24 часа командной разработки решений для университетского кампуса.\nКоманды по 3–5 человек, менторы из IT-компаний, призы победителям.",
        ]);
        $volleyball = $mkEvent([
            'club' => $sport, 'category' => $cat['sport'], 'by' => $rep2, 'in_hours' => 24 * 3, 'duration' => 3,
            'photo' => '1612872087720-bb876e2e67d1', 'title' => 'Турнир по волейболу', 'capacity' => 3, 'cover' => 'sport',
            'location' => 'Спорткомплекс, зал №2',
            'description' => 'Отборочный турнир сборной университета по волейболу. Количество мест ограничено.',
        ]);
        $aiLecture = $mkEvent([
            'club' => $robo, 'category' => $cat['education'], 'by' => $rep1, 'in_hours' => 24 * 2, 'duration' => 2,
            'photo' => '1498050108023-c5249f4df085', 'title' => 'Онлайн-лекция «Нейросети без магии»', 'format' => 'online', 'cover' => 'online',
            'location' => 'https://meet.example.com/ai-lecture',
            'description' => 'Простым языком о том, как устроены нейросети и как начать с ними работать. Трансляция в Zoom-подобной комнате.',
        ]);
        $subbotnik = $mkEvent([
            'club' => $volunteer, 'category' => $cat['volunteer'], 'by' => $rep1, 'in_hours' => 23, 'duration' => 3,
            'photo' => '1559027615-cd4628902d4a', 'title' => 'Субботник в университетском парке', 'capacity' => 30, 'cover' => 'volunteer',
            'location' => 'Университетский парк, главный вход',
            'description' => 'Приводим в порядок парк перед зимой. Перчатки и инвентарь выдаём на месте, чай — после работы.',
        ]);

        // Опубликованное — идёт сейчас
        $exhibition = $mkEvent([
            'club' => $robo, 'category' => $cat['science'], 'by' => $rep1, 'in_hours' => -1, 'duration' => 5,
            'photo' => '1485827404703-89b55fcc595e', 'title' => 'Выставка студенческих роботов', 'cover' => 'science',
            'location' => 'Главный корпус, атриум',
            'description' => 'Проекты участников клуба: от линейных роботов до манипуляторов. Можно попробовать управлять.',
        ]);

        // Опубликованные — прошедшие
        $pastRun = $mkEvent([
            'club' => $sport, 'category' => $cat['sport'], 'by' => $rep2, 'in_hours' => -24 * 6, 'duration' => 2,
            'photo' => '1452626038306-9aae5e071dd3', 'title' => 'Осенний забег 5 км', 'capacity' => 100, 'cover' => 'sport',
            'location' => 'Набережная, старт у лодочной станции',
            'description' => 'Традиционный осенний забег. Медали всем финишировавшим.',
        ]);
        $pastPlay = $mkEvent([
            'club' => $theatre, 'category' => $cat['culture'], 'by' => $rep3, 'in_hours' => -24 * 10, 'duration' => 2,
            'photo' => '1507924538820-ede94a04019d', 'title' => 'Спектакль «Вишнёвый сад»', 'capacity' => 120, 'cover' => 'culture',
            'location' => 'Актовый зал',
            'description' => 'Премьера сезона театральной студии по пьесе А. П. Чехова.',
        ]);
        $pastQuiz = $mkEvent([
            'club' => $theatre, 'category' => $cat['fun'], 'by' => $rep3, 'in_hours' => -24 * 3, 'duration' => 3,
            'photo' => '1527529482837-4698179dc6ce', 'title' => 'Квиз «Кино и театр»', 'capacity' => 48, 'cover' => 'fun',
            'location' => 'Студенческое кафе',
            'description' => 'Командная интеллектуальная игра. Команды до 6 человек.',
        ]);

        // Черновики
        $mkEvent([
            'club' => $robo, 'category' => $cat['education'], 'by' => $rep1, 'in_hours' => 24 * 14, 'status' => Event::STATUS_DRAFT,
            'photo' => '1553406830-ef2513450d76', 'title' => 'Мастер-класс по Arduino', 'capacity' => 20, 'cover' => 'robotics',
            'location' => 'Лаборатория 214',
            'description' => 'Собираем первую схему на Arduino. Черновик — дата уточняется.',
        ]);
        $mkEvent([
            'club' => $sport, 'category' => $cat['sport'], 'by' => $rep2, 'in_hours' => 24 * 20, 'status' => Event::STATUS_DRAFT,
            'photo' => '1551698618-1dfe5d97d256', 'title' => 'Зимний лыжный кросс', 'capacity' => 60, 'cover' => 'sport',
            'location' => 'Лыжная база «Снежинка»',
            'description' => 'Кросс на 3 и 5 км. Прокат лыж предусмотрен.',
        ]);
        $mkEvent([
            'club' => $theatre, 'category' => $cat['culture'], 'by' => $rep3, 'in_hours' => 24 * 12, 'status' => Event::STATUS_DRAFT,
            'photo' => '1503095396549-807759245b35', 'title' => 'Вечер импровизации', 'cover' => 'culture',
            'location' => 'Малый зал',
            'description' => 'Открытая сцена: импров-игры со зрителями.',
        ]);

        // Отменённые
        $cancelledConcert = $mkEvent([
            'club' => $theatre, 'category' => $cat['culture'], 'by' => $rep3, 'in_hours' => 24 * 4, 'status' => Event::STATUS_CANCELLED,
            'photo' => '1481627834876-b7833e8f5570', 'title' => 'Литературный вечер', 'capacity' => 50, 'cover' => 'culture',
            'cancel_reason' => 'Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.',
            'location' => 'Актовый зал',
            'description' => 'Чтение стихов и прозы студентами университета.',
        ]);
        $cancelledEco = $mkEvent([
            'club' => $volunteer, 'category' => $cat['volunteer'], 'by' => $rep1, 'in_hours' => 24 * 6, 'status' => Event::STATUS_CANCELLED,
            'photo' => '1611284446314-60a58ac0deb9', 'title' => 'Экоакция «Сдай батарейку»', 'cover' => 'volunteer',
            'cancel_reason' => 'Перенос по просьбе партнёра — пункт приёма временно не работает.',
            'location' => 'Холл главного корпуса',
            'description' => 'Сбор батареек и мелкой электроники на переработку.',
        ]);


        // Дополнительные опубликованные мероприятия — чтобы афиша была наполненной
        $more = [
            [$sport, 'sport', $rep2, 24 * 4 + 3, 3, 'Блиц-турнир по шахматам', 32, '1529699211952-734e80c4d42b', 'Шахматный клуб, ауд. 118', 'offline', "Швейцарская система, 7 туров по 5 минут.\nРейтинговые очки в зачёт спартакиады."],
            [$theatre, 'culture', $rep3, 24 * 8 + 9, 3, 'Концерт студенческих групп', 200, '1459749411175-04bf5292ceea', 'Актовый зал', 'offline', 'Шесть студенческих групп: от инди до металла. Вход свободный по регистрации.'],
            [$robo, 'science', $rep1, 24 * 6 + 8, 2, 'Лекция «Как устроена Вселенная»', 80, '1419242902214-272b3f66ee7a', 'Планетарий, корпус Б', 'offline', 'Астрофизик расскажет о тёмной материи и покажет звёздное небо в телескоп после лекции.'],
            [$volunteer, 'volunteer', $rep1, 24 * 9 + 1, 4, 'День донора', 60, '1615461066841-6116e61058f4', 'Медпункт, корпус А', 'offline', 'Совместно со станцией переливания крови. Нужен паспорт, накануне — лёгкий ужин без жирного.'],
            [$theatre, 'fun', $rep3, 24 * 5 + 11, 3, 'Киновечер «Классика на большом экране»', 120, '1489599849927-2ee91cede3ba', 'Кинозал студгородка', 'offline', 'Показываем «Москва слезам не верит» и обсуждаем фильм за чаем.'],
            [$robo, 'fun', $rep1, 24 * 12 + 6, 6, 'Турнир по киберспорту', 40, '1542751371-adc38448a05e', 'Компьютерный класс 305', 'offline', 'CS2 и Dota 2, команды по 5 человек. Трансляция на большой экран.'],
            [$sport, 'sport', $rep2, 24 * 3 + 21, 1, 'Йога на рассвете', 25, '1544367567-0f2fcb009e0b', 'Стадион, газон у северной трибуны', 'offline', 'Мягкая практика для начинающих. Коврики выдаём, приходите за 10 минут.'],
            [$theatre, 'education', $rep3, 24 * 7 + 7, 2, 'Мастер-класс «Публичные выступления»', 30, '1475721027785-f74eccf877e2', 'Малый зал', 'offline', 'Голос, дыхание, работа с залом. Каждый участник выступит с короткой речью.'],
            [$robo, 'education', $rep1, 24 * 10 + 9, 2, 'Онлайн-воркшоп по Python', null, '1461749280684-dccba630e2f6', 'https://meet.example.com/python-workshop', 'online', 'Пишем телеграм-бота с нуля. Понадобится ноутбук с установленным Python 3.12.'],
            [$volunteer, 'volunteer', $rep1, 24 * 15 + 2, 4, 'Высадка деревьев в студгородке', 50, '1416879595882-3373a0480b5b', 'Студгородок, аллея у общежития №3', 'offline', 'Сажаем 40 саженцев клёна и липы. Инвентарь и перчатки на месте.'],
            [$sport, 'sport', $rep2, 24 * 11 + 8, 2, 'Кубок факультетов по футболу', 120, '1574629810360-7efbbe195018', 'Футбольное поле университета', 'offline', 'Финал кубка: ИВТ против экономического факультета. Приходите болеть!'],
            [$robo, 'education', $rep1, 24 * 18 + 4, 6, 'Карьерная конференция «IT-старт»', 300, '1540575467063-178a50c2df87', 'Конгресс-холл', 'offline', 'Доклады от IT-компаний, стенды работодателей и быстрые собеседования на стажировки.'],
            [$robo, 'science', $rep1, 24 * 13 + 5, 3, 'День открытых дверей научной лаборатории', 45, '1532094349884-543bc11b234d', 'Лаборатория химии, корпус В', 'offline', 'Экскурсия по лаборатории и эффектные опыты от аспирантов.'],
            // Прошедшие
            [$theatre, 'fun', $rep3, -24 * 5, 4, 'Вечер настольных игр', 40, '1610890716171-6b1bb98ffd09', 'Студенческое кафе', 'offline', 'Колонизаторы, Каркассон, Мафия и ещё 30 игр из коллекции клуба.'],
            [$volunteer, 'volunteer', $rep1, -24 * 8, 3, 'Помощь приюту «Хвосты»', 20, '1543466835-00a7907e9de1', 'Приют «Хвосты», ул. Лесная, 12', 'offline', 'Выгул собак, уборка вольеров и сбор корма.'],
            [$robo, 'education', $rep1, -24 * 12, 3, 'Стартап-митап', 100, '1523580494863-6f3031224c94', 'Коворкинг, корпус А', 'offline', 'Студенческие команды питчат идеи, эксперты дают обратную связь.'],
        ];
        $extraEvents = [];
        foreach ($more as [$club, $catSlug, $by, $inHours, $duration, $title, $capacity, $photo, $location, $format, $description]) {
            $extraEvents[] = $mkEvent([
                'club' => $club, 'category' => $cat[$catSlug], 'by' => $by, 'in_hours' => $inHours, 'duration' => $duration,
                'title' => $title, 'capacity' => $capacity, 'photo' => $photo, 'location' => $location, 'format' => $format,
                'description' => $description,
            ]);
        }

        // ---------- Регистрации ----------
        $register = function (Event $e, User $u, string $status = Registration::STATUS_ACTIVE) use ($now) {
            Registration::create([
                'event_id' => $e->id, 'user_id' => $u->id, 'status' => $status,
                'registered_at' => $now->copy()->subDays(rand(1, 5))->subMinutes(rand(0, 600)),
            ]);
        };

        mt_srand(42);
        $s = $students->values();
        foreach ([$s[0], $s[1], $s[2], $s[3], $s[4], $student] as $u) {
            $register($hackathon, $u);
        }
        foreach ([$s[0], $s[5], $s[6]] as $u) { // 3 из 3 — EVENT_FULL
            $register($volleyball, $u);
        }
        foreach ([$s[1], $s[2], $s[7], $student] as $u) {
            $register($aiLecture, $u);
        }
        foreach ([$s[3], $s[4], $s[5]] as $u) {
            $register($subbotnik, $u);
        }
        foreach ([$s[0], $s[6]] as $u) {
            $register($exhibition, $u);
        }
        // Прошедшие — «посещённые»
        foreach ([$s[0], $s[1], $s[3], $student] as $u) {
            $register($pastRun, $u);
        }
        foreach ([$s[0], $s[2], $s[4], $s[6], $s[7]] as $u) {
            $register($pastPlay, $u);
        }
        foreach ([$s[1], $s[5]] as $u) {
            $register($pastQuiz, $u);
        }
        $register($pastQuiz, $s[2], Registration::STATUS_CANCELLED);
        // Регистрации на отменённые мероприятия
        foreach ([$s[0], $s[2], $student] as $u) {
            $register($cancelledConcert, $u, Registration::STATUS_CANCELLED_BY_ORGANIZER);
        }
        foreach ([$s[3], $s[4]] as $u) {
            $register($cancelledEco, $u, Registration::STATUS_CANCELLED_BY_ORGANIZER);
        }


        // Регистрации на дополнительные мероприятия
        foreach ($extraEvents as $i => $event) {
            $limit = $event->capacity ? min($event->capacity - 1, 2 + $i % 6) : 3 + $i % 4;
            foreach ($s->slice($i % 3, max(1, $limit))->values() as $u) {
                $register($event, $u);
            }
        }

        // ---------- Реакции ----------
        $published = [$hackathon, $volleyball, $aiLecture, $subbotnik, $exhibition, $pastRun, $pastPlay, $pastQuiz, ...$extraEvents];
        $reactors = $s->concat([$student]);
        foreach ($published as $event) {
            foreach ($reactors as $u) {
                foreach (Reaction::TYPES as $type) {
                    if (mt_rand(0, 100) < 40) {
                        Reaction::firstOrCreate(['event_id' => $event->id, 'user_id' => $u->id, 'type' => $type]);
                    }
                }
            }
        }
        Reaction::firstOrCreate(['event_id' => $hackathon->id, 'user_id' => $student->id, 'type' => 'like']);

        // ---------- Уведомления ----------
        $notify = fn (User $u, string $type, string $title, string $message, Event $e, ?Carbon $readAt = null) => Notification::create([
            'user_id' => $u->id, 'type' => $type, 'title' => $title, 'message' => $message,
            'payload' => ['event_id' => $e->id], 'read_at' => $readAt,
        ]);

        foreach ([[$cancelledConcert, [$s[0], $s[2], $student]], [$cancelledEco, [$s[3], $s[4]]]] as [$event, $users]) {
            foreach ($users as $u) {
                $notify($u, 'event_cancelled', 'Мероприятие отменено',
                    "«{$event->title}» отменено. Причина: {$event->cancel_reason}", $event);
            }
        }
        foreach ([$student, $s[0], $s[1]] as $u) {
            $notify($u, 'registration_confirmed', 'Регистрация подтверждена',
                "Вы зарегистрированы на «{$hackathon->title}».", $hackathon, $now->copy()->subDay());
        }
        foreach ([$s[3], $s[4], $s[5]] as $u) {
            $notify($u, 'event_reminder', 'Скоро мероприятие',
                "«{$subbotnik->title}» начнётся менее чем через 24 часа.", $subbotnik);
            EventReminder::create(['event_id' => $subbotnik->id, 'user_id' => $u->id, 'kind' => '24h']);
        }
        $notify($student, 'event_changed', 'Изменение в мероприятии',
            "У «{$aiLecture->title}» обновлена ссылка на трансляцию: {$aiLecture->location}", $aiLecture);
        $notify($rep2, 'event_full', 'Все места заняты',
            "На «{$volleyball->title}» зарегистрировано 100% участников.", $volleyball);
    }
}
