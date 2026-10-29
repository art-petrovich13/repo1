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
        $mkUser(['name' => 'Заблокированный Пользователь', 'email' => 'blocked@example.com', 'faculty' => 'Юриспруденция', 'course' => 2, 'is_blocked' => true]);

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
                'cover_url' => '/uploads/covers/'.$a['cover'].'.svg',
                'status' => $status,
                'cancel_reason' => $a['cancel_reason'] ?? null,
                'published_at' => $status === Event::STATUS_DRAFT ? null : $now->copy()->subDays(7),
                'cancelled_at' => $status === Event::STATUS_CANCELLED ? $now->copy()->subDay() : null,
            ]);
        };

        // Опубликованные — будущие
        $hackathon = $mkEvent([
            'club' => $robo, 'category' => $cat['science'], 'by' => $rep1, 'in_hours' => 24 * 5, 'duration' => 24,
            'title' => 'Хакатон «Умный кампус»', 'capacity' => 40, 'cover' => 'robotics',
            'location' => 'Корпус А, коворкинг 3 этаж',
            'description' => "24 часа командной разработки решений для университетского кампуса.\nКоманды по 3–5 человек, менторы из IT-компаний, призы победителям.",
        ]);
        $volleyball = $mkEvent([
            'club' => $sport, 'category' => $cat['sport'], 'by' => $rep2, 'in_hours' => 24 * 3, 'duration' => 3,
            'title' => 'Турнир по волейболу', 'capacity' => 3, 'cover' => 'sport',
            'location' => 'Спорткомплекс, зал №2',
            'description' => 'Отборочный турнир сборной университета по волейболу. Количество мест ограничено.',
        ]);
        $aiLecture = $mkEvent([
            'club' => $robo, 'category' => $cat['education'], 'by' => $rep1, 'in_hours' => 24 * 2, 'duration' => 2,
            'title' => 'Онлайн-лекция «Нейросети без магии»', 'format' => 'online', 'cover' => 'online',
            'location' => 'https://meet.example.com/ai-lecture',
            'description' => 'Простым языком о том, как устроены нейросети и как начать с ними работать. Трансляция в Zoom-подобной комнате.',
        ]);
        $subbotnik = $mkEvent([
            'club' => $volunteer, 'category' => $cat['volunteer'], 'by' => $rep1, 'in_hours' => 23, 'duration' => 3,
            'title' => 'Субботник в университетском парке', 'capacity' => 30, 'cover' => 'volunteer',
            'location' => 'Университетский парк, главный вход',
            'description' => 'Приводим в порядок парк перед зимой. Перчатки и инвентарь выдаём на месте, чай — после работы.',
        ]);

        // Опубликованное — идёт сейчас
        $exhibition = $mkEvent([
            'club' => $robo, 'category' => $cat['science'], 'by' => $rep1, 'in_hours' => -1, 'duration' => 5,
            'title' => 'Выставка студенческих роботов', 'cover' => 'science',
            'location' => 'Главный корпус, атриум',
            'description' => 'Проекты участников клуба: от линейных роботов до манипуляторов. Можно попробовать управлять.',
        ]);

        // Опубликованные — прошедшие
        $pastRun = $mkEvent([
            'club' => $sport, 'category' => $cat['sport'], 'by' => $rep2, 'in_hours' => -24 * 6, 'duration' => 2,
            'title' => 'Осенний забег 5 км', 'capacity' => 100, 'cover' => 'sport',
            'location' => 'Набережная, старт у лодочной станции',
            'description' => 'Традиционный осенний забег. Медали всем финишировавшим.',
        ]);
        $pastPlay = $mkEvent([
            'club' => $theatre, 'category' => $cat['culture'], 'by' => $rep3, 'in_hours' => -24 * 10, 'duration' => 2,
            'title' => 'Спектакль «Вишнёвый сад»', 'capacity' => 120, 'cover' => 'culture',
            'location' => 'Актовый зал',
            'description' => 'Премьера сезона театральной студии по пьесе А. П. Чехова.',
        ]);
        $pastQuiz = $mkEvent([
            'club' => $theatre, 'category' => $cat['fun'], 'by' => $rep3, 'in_hours' => -24 * 3, 'duration' => 3,
            'title' => 'Квиз «Кино и театр»', 'capacity' => 48, 'cover' => 'fun',
            'location' => 'Студенческое кафе',
            'description' => 'Командная интеллектуальная игра. Команды до 6 человек.',
        ]);

        // Черновики
        $mkEvent([
            'club' => $robo, 'category' => $cat['education'], 'by' => $rep1, 'in_hours' => 24 * 14, 'status' => Event::STATUS_DRAFT,
            'title' => 'Мастер-класс по Arduino', 'capacity' => 20, 'cover' => 'robotics',
            'location' => 'Лаборатория 214',
            'description' => 'Собираем первую схему на Arduino. Черновик — дата уточняется.',
        ]);
        $mkEvent([
            'club' => $sport, 'category' => $cat['sport'], 'by' => $rep2, 'in_hours' => 24 * 20, 'status' => Event::STATUS_DRAFT,
            'title' => 'Зимний лыжный кросс', 'capacity' => 60, 'cover' => 'sport',
            'location' => 'Лыжная база «Снежинка»',
            'description' => 'Кросс на 3 и 5 км. Прокат лыж предусмотрен.',
        ]);
        $mkEvent([
            'club' => $theatre, 'category' => $cat['culture'], 'by' => $rep3, 'in_hours' => 24 * 12, 'status' => Event::STATUS_DRAFT,
            'title' => 'Вечер импровизации', 'cover' => 'culture',
            'location' => 'Малый зал',
            'description' => 'Открытая сцена: импров-игры со зрителями.',
        ]);

        // Отменённые
        $cancelledConcert = $mkEvent([
            'club' => $theatre, 'category' => $cat['culture'], 'by' => $rep3, 'in_hours' => 24 * 4, 'status' => Event::STATUS_CANCELLED,
            'title' => 'Литературный вечер', 'capacity' => 50, 'cover' => 'culture',
            'cancel_reason' => 'Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.',
            'location' => 'Актовый зал',
            'description' => 'Чтение стихов и прозы студентами университета.',
        ]);
        $cancelledEco = $mkEvent([
            'club' => $volunteer, 'category' => $cat['volunteer'], 'by' => $rep1, 'in_hours' => 24 * 6, 'status' => Event::STATUS_CANCELLED,
            'title' => 'Экоакция «Сдай батарейку»', 'cover' => 'volunteer',
            'cancel_reason' => 'Перенос по просьбе партнёра — пункт приёма временно не работает.',
            'location' => 'Холл главного корпуса',
            'description' => 'Сбор батареек и мелкой электроники на переработку.',
        ]);

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

        // ---------- Реакции ----------
        $published = [$hackathon, $volleyball, $aiLecture, $subbotnik, $exhibition, $pastRun, $pastPlay, $pastQuiz];
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
