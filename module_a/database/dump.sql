
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Спорт','sport','2026-10-29 05:17:54','2026-10-29 05:17:54'),(2,'Наука','science','2026-10-29 05:17:54','2026-10-29 05:17:54'),(3,'Культура','culture','2026-10-29 05:17:54','2026-10-29 05:17:54'),(4,'Образование','education','2026-10-29 05:17:54','2026-10-29 05:17:54'),(5,'Развлечения','fun','2026-10-29 05:17:54','2026-10-29 05:17:54'),(6,'Волонтёрство','volunteer','2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `club_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `club_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `club_user_club_id_user_id_unique` (`club_id`,`user_id`),
  KEY `club_user_user_id_foreign` (`user_id`),
  CONSTRAINT `club_user_club_id_foreign` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `club_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `club_user` WRITE;
/*!40000 ALTER TABLE `club_user` DISABLE KEYS */;
INSERT INTO `club_user` VALUES (1,1,2,1,'2026-10-29 05:00:00','2026-10-29 05:17:54','2026-10-29 05:17:54'),(2,4,2,1,'2026-10-29 05:00:00','2026-10-29 05:17:54','2026-10-29 05:17:54'),(3,2,3,1,'2026-10-29 05:00:00','2026-10-29 05:17:54','2026-10-29 05:17:54'),(4,3,4,1,'2026-10-29 05:00:00','2026-10-29 05:17:54','2026-10-29 05:17:54'),(5,1,5,0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `club_user` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `clubs` WRITE;
/*!40000 ALTER TABLE `clubs` DISABLE KEYS */;
INSERT INTO `clubs` VALUES (1,'Клуб робототехники «RoboTech»','Собираем роботов, участвуем в соревнованиях и проводим хакатоны.','2026-10-29 05:17:54','2026-10-29 05:17:54'),(2,'Спортивный клуб «Буревестник»','Турниры, тренировки и спортивные праздники для всех студентов.','2026-10-29 05:17:54','2026-10-29 05:17:54'),(3,'Театральная студия «Маска»','Студенческий театр: спектакли, импровизация, мастер-классы.','2026-10-29 05:17:54','2026-10-29 05:17:54'),(4,'Волонтёрский центр «Добро»','Экологические акции, помощь приютам и городские субботники.','2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `clubs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_verification_tokens_token_hash_unique` (`token_hash`),
  KEY `email_verification_tokens_user_id_foreign` (`user_id`),
  CONSTRAINT `email_verification_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `event_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `kind` enum('24h','1h') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_reminders_event_id_user_id_kind_unique` (`event_id`,`user_id`,`kind`),
  KEY `event_reminders_user_id_foreign` (`user_id`),
  CONSTRAINT `event_reminders_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_reminders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `event_reminders` WRITE;
/*!40000 ALTER TABLE `event_reminders` DISABLE KEYS */;
INSERT INTO `event_reminders` VALUES (1,4,10,'24h','2026-10-29 05:17:54'),(2,4,11,'24h','2026-10-29 05:17:54'),(3,4,12,'24h','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `event_reminders` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `club_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `created_by` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` enum('offline','online') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'offline',
  `capacity` int unsigned DEFAULT NULL,
  `cover_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `cancel_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_club_id_foreign` (`club_id`),
  KEY `events_category_id_foreign` (`category_id`),
  KEY `events_created_by_foreign` (`created_by`),
  KEY `events_status_starts_at_index` (`status`,`starts_at`),
  CONSTRAINT `events_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `events_club_id_foreign` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,1,2,2,'Хакатон «Умный кампус»','24 часа командной разработки решений для университетского кампуса.\nКоманды по 3–5 человек, менторы из IT-компаний, призы победителям.','2026-11-03 08:00:00','2026-11-04 08:00:00','Корпус А, коворкинг 3 этаж','offline',40,'/uploads/covers/robotics.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(2,2,1,3,'Турнир по волейболу','Отборочный турнир сборной университета по волейболу. Количество мест ограничено.','2026-11-01 08:00:00','2026-11-01 11:00:00','Спорткомплекс, зал №2','offline',3,'/uploads/covers/sport.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(3,1,4,2,'Онлайн-лекция «Нейросети без магии»','Простым языком о том, как устроены нейросети и как начать с ними работать. Трансляция в Zoom-подобной комнате.','2026-10-31 08:00:00','2026-10-31 10:00:00','https://meet.example.com/ai-lecture','online',NULL,'/uploads/covers/online.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(4,4,6,2,'Субботник в университетском парке','Приводим в порядок парк перед зимой. Перчатки и инвентарь выдаём на месте, чай — после работы.','2026-10-30 07:00:00','2026-10-30 10:00:00','Университетский парк, главный вход','offline',30,'/uploads/covers/volunteer.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(5,1,2,2,'Выставка студенческих роботов','Проекты участников клуба: от линейных роботов до манипуляторов. Можно попробовать управлять.','2026-10-29 07:00:00','2026-10-29 12:00:00','Главный корпус, атриум','offline',NULL,'/uploads/covers/science.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(6,2,1,3,'Осенний забег 5 км','Традиционный осенний забег. Медали всем финишировавшим.','2026-10-23 08:00:00','2026-10-23 10:00:00','Набережная, старт у лодочной станции','offline',100,'/uploads/covers/sport.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(7,3,3,4,'Спектакль «Вишнёвый сад»','Премьера сезона театральной студии по пьесе А. П. Чехова.','2026-10-19 08:00:00','2026-10-19 10:00:00','Актовый зал','offline',120,'/uploads/covers/culture.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(8,3,5,4,'Квиз «Кино и театр»','Командная интеллектуальная игра. Команды до 6 человек.','2026-10-26 08:00:00','2026-10-26 11:00:00','Студенческое кафе','offline',48,'/uploads/covers/fun.svg','published',NULL,'2026-10-22 05:00:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(9,1,4,2,'Мастер-класс по Arduino','Собираем первую схему на Arduino. Черновик — дата уточняется.','2026-11-12 08:00:00','2026-11-12 10:00:00','Лаборатория 214','offline',20,'/uploads/covers/robotics.svg','draft',NULL,NULL,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(10,2,1,3,'Зимний лыжный кросс','Кросс на 3 и 5 км. Прокат лыж предусмотрен.','2026-11-18 08:00:00','2026-11-18 10:00:00','Лыжная база «Снежинка»','offline',60,'/uploads/covers/sport.svg','draft',NULL,NULL,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(11,3,3,4,'Вечер импровизации','Открытая сцена: импров-игры со зрителями.','2026-11-10 08:00:00','2026-11-10 10:00:00','Малый зал','offline',NULL,'/uploads/covers/culture.svg','draft',NULL,NULL,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(12,3,3,4,'Литературный вечер','Чтение стихов и прозы студентами университета.','2026-11-02 08:00:00','2026-11-02 10:00:00','Актовый зал','offline',50,'/uploads/covers/culture.svg','cancelled','Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','2026-10-22 05:00:00','2026-10-28 05:00:00','2026-10-29 05:17:54','2026-10-29 05:17:54'),(13,4,6,2,'Экоакция «Сдай батарейку»','Сбор батареек и мелкой электроники на переработку.','2026-11-04 08:00:00','2026-11-04 10:00:00','Холл главного корпуса','offline',NULL,'/uploads/covers/volunteer.svg','cancelled','Перенос по просьбе партнёра — пункт приёма временно не работает.','2026-10-22 05:00:00','2026-10-28 05:00:00','2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_10_29_073144_create_personal_access_tokens_table',1),(5,'2026_10_29_100000_create_clubs_and_categories_tables',1),(6,'2026_10_29_100100_create_events_table',1),(7,'2026_10_29_100200_create_registrations_and_reactions_tables',1),(8,'2026_10_29_100300_create_notifications_and_auth_tokens_tables',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,7,'event_cancelled','Мероприятие отменено','«Литературный вечер» отменено. Причина: Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','{\"event_id\": 12}',NULL,'2026-10-29 05:17:54'),(2,9,'event_cancelled','Мероприятие отменено','«Литературный вечер» отменено. Причина: Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','{\"event_id\": 12}',NULL,'2026-10-29 05:17:54'),(3,5,'event_cancelled','Мероприятие отменено','«Литературный вечер» отменено. Причина: Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','{\"event_id\": 12}',NULL,'2026-10-29 05:17:54'),(4,10,'event_cancelled','Мероприятие отменено','«Экоакция «Сдай батарейку»» отменено. Причина: Перенос по просьбе партнёра — пункт приёма временно не работает.','{\"event_id\": 13}',NULL,'2026-10-29 05:17:54'),(5,11,'event_cancelled','Мероприятие отменено','«Экоакция «Сдай батарейку»» отменено. Причина: Перенос по просьбе партнёра — пункт приёма временно не работает.','{\"event_id\": 13}',NULL,'2026-10-29 05:17:54'),(6,5,'registration_confirmed','Регистрация подтверждена','Вы зарегистрированы на «Хакатон «Умный кампус»».','{\"event_id\": 1}','2026-10-28 05:00:00','2026-10-29 05:17:54'),(7,7,'registration_confirmed','Регистрация подтверждена','Вы зарегистрированы на «Хакатон «Умный кампус»».','{\"event_id\": 1}','2026-10-28 05:00:00','2026-10-29 05:17:54'),(8,8,'registration_confirmed','Регистрация подтверждена','Вы зарегистрированы на «Хакатон «Умный кампус»».','{\"event_id\": 1}','2026-10-28 05:00:00','2026-10-29 05:17:54'),(9,10,'event_reminder','Скоро мероприятие','«Субботник в университетском парке» начнётся менее чем через 24 часа.','{\"event_id\": 4}',NULL,'2026-10-29 05:17:54'),(10,11,'event_reminder','Скоро мероприятие','«Субботник в университетском парке» начнётся менее чем через 24 часа.','{\"event_id\": 4}',NULL,'2026-10-29 05:17:54'),(11,12,'event_reminder','Скоро мероприятие','«Субботник в университетском парке» начнётся менее чем через 24 часа.','{\"event_id\": 4}',NULL,'2026-10-29 05:17:54'),(12,5,'event_changed','Изменение в мероприятии','У «Онлайн-лекция «Нейросети без магии»» обновлена ссылка на трансляцию: https://meet.example.com/ai-lecture','{\"event_id\": 3}',NULL,'2026-10-29 05:17:54'),(13,3,'event_full','Все места заняты','На «Турнир по волейболу» зарегистрировано 100% участников.','{\"event_id\": 2}',NULL,'2026-10-29 05:17:54');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',6,'demo','1405fc0812b33ef3386926770fa8715d3df280853fc147d505a8c2d7bd269a33','[\"*\"]',NULL,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('like','interested') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reactions_event_id_user_id_type_unique` (`event_id`,`user_id`,`type`),
  KEY `reactions_user_id_foreign` (`user_id`),
  CONSTRAINT `reactions_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reactions` WRITE;
/*!40000 ALTER TABLE `reactions` DISABLE KEYS */;
INSERT INTO `reactions` VALUES (1,1,10,'interested','2026-10-29 05:17:54'),(2,1,11,'like','2026-10-29 05:17:54'),(3,1,11,'interested','2026-10-29 05:17:54'),(4,1,12,'like','2026-10-29 05:17:54'),(5,1,12,'interested','2026-10-29 05:17:54'),(6,1,13,'like','2026-10-29 05:17:54'),(7,1,14,'like','2026-10-29 05:17:54'),(8,2,8,'interested','2026-10-29 05:17:54'),(9,2,9,'like','2026-10-29 05:17:54'),(10,2,11,'like','2026-10-29 05:17:54'),(11,2,11,'interested','2026-10-29 05:17:54'),(12,2,12,'like','2026-10-29 05:17:54'),(13,2,13,'like','2026-10-29 05:17:54'),(14,2,14,'interested','2026-10-29 05:17:54'),(15,3,8,'interested','2026-10-29 05:17:54'),(16,3,9,'like','2026-10-29 05:17:54'),(17,3,10,'interested','2026-10-29 05:17:54'),(18,3,11,'like','2026-10-29 05:17:54'),(19,3,12,'interested','2026-10-29 05:17:54'),(20,3,13,'like','2026-10-29 05:17:54'),(21,4,7,'like','2026-10-29 05:17:54'),(22,4,7,'interested','2026-10-29 05:17:54'),(23,4,8,'like','2026-10-29 05:17:54'),(24,4,10,'like','2026-10-29 05:17:54'),(25,4,11,'like','2026-10-29 05:17:54'),(26,4,12,'like','2026-10-29 05:17:54'),(27,4,12,'interested','2026-10-29 05:17:54'),(28,4,13,'interested','2026-10-29 05:17:54'),(29,4,14,'like','2026-10-29 05:17:54'),(30,5,7,'interested','2026-10-29 05:17:54'),(31,5,8,'like','2026-10-29 05:17:54'),(32,5,9,'like','2026-10-29 05:17:54'),(33,5,11,'like','2026-10-29 05:17:54'),(34,5,11,'interested','2026-10-29 05:17:54'),(35,5,13,'like','2026-10-29 05:17:54'),(36,5,14,'like','2026-10-29 05:17:54'),(37,5,5,'like','2026-10-29 05:17:54'),(38,6,8,'interested','2026-10-29 05:17:54'),(39,6,11,'interested','2026-10-29 05:17:54'),(40,6,12,'like','2026-10-29 05:17:54'),(41,6,14,'like','2026-10-29 05:17:54'),(42,6,14,'interested','2026-10-29 05:17:54'),(43,6,5,'like','2026-10-29 05:17:54'),(44,7,9,'interested','2026-10-29 05:17:54'),(45,7,10,'like','2026-10-29 05:17:54'),(46,7,11,'like','2026-10-29 05:17:54'),(47,7,12,'like','2026-10-29 05:17:54'),(48,7,12,'interested','2026-10-29 05:17:54'),(49,7,13,'interested','2026-10-29 05:17:54'),(50,7,14,'interested','2026-10-29 05:17:54'),(51,7,5,'interested','2026-10-29 05:17:54'),(52,8,8,'like','2026-10-29 05:17:54'),(53,8,8,'interested','2026-10-29 05:17:54'),(54,8,9,'like','2026-10-29 05:17:54'),(55,8,9,'interested','2026-10-29 05:17:54'),(56,8,10,'like','2026-10-29 05:17:54'),(57,8,10,'interested','2026-10-29 05:17:54'),(58,8,11,'interested','2026-10-29 05:17:54'),(59,8,12,'like','2026-10-29 05:17:54'),(60,8,13,'like','2026-10-29 05:17:54'),(61,8,5,'like','2026-10-29 05:17:54'),(62,1,5,'like','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `reactions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_tokens_token_hash_unique` (`token_hash`),
  KEY `refresh_tokens_user_id_foreign` (`user_id`),
  CONSTRAINT `refresh_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `status` enum('active','cancelled','cancelled_by_organizer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `registered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registrations_event_id_user_id_unique` (`event_id`,`user_id`),
  KEY `registrations_user_id_foreign` (`user_id`),
  CONSTRAINT `registrations_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,7,'active','2026-10-26 00:22:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(2,1,8,'active','2026-10-26 23:38:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(3,1,9,'active','2026-10-26 19:23:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(4,1,10,'active','2026-10-28 04:47:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(5,1,11,'active','2026-10-28 04:32:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(6,1,5,'active','2026-10-24 23:03:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(7,2,7,'active','2026-10-27 22:27:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(8,2,12,'active','2026-10-26 22:52:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(9,2,13,'active','2026-10-27 20:23:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(10,3,8,'active','2026-10-25 22:02:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(11,3,9,'active','2026-10-23 20:01:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(12,3,14,'active','2026-10-25 04:18:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(13,3,5,'active','2026-10-24 02:10:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(14,4,10,'active','2026-10-27 01:36:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(15,4,11,'active','2026-10-26 03:10:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(16,4,12,'active','2026-10-26 02:50:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(17,5,7,'active','2026-10-27 21:49:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(18,5,13,'active','2026-10-25 00:34:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(19,6,7,'active','2026-10-23 22:56:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(20,6,8,'active','2026-10-25 19:22:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(21,6,10,'active','2026-10-26 21:11:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(22,6,5,'active','2026-10-26 04:31:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(23,7,7,'active','2026-10-25 23:52:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(24,7,9,'active','2026-10-24 21:55:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(25,7,11,'active','2026-10-24 19:29:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(26,7,13,'active','2026-10-28 03:25:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(27,7,14,'active','2026-10-28 02:55:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(28,8,8,'active','2026-10-26 19:30:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(29,8,12,'active','2026-10-27 23:35:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(30,8,9,'cancelled','2026-10-24 21:22:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(31,12,7,'cancelled_by_organizer','2026-10-27 03:18:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(32,12,9,'cancelled_by_organizer','2026-10-27 23:33:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(33,12,5,'cancelled_by_organizer','2026-10-28 02:15:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(34,13,10,'cancelled_by_organizer','2026-10-24 22:20:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(35,13,11,'cancelled_by_organizer','2026-10-26 19:03:00',NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `faculty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course` tinyint unsigned DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('student','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Администратор','admin@example.com','2026-10-29 05:00:00','$2y$12$UTOxAyLXOYZhGEdxCNgDEOv6EYU2CR3VnhTpAJaxPey5PVAdmJOO2','Администрация',NULL,NULL,'admin',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(2,'Алексей Смирнов','rep1@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Информатика и вычислительная техника',3,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(3,'Мария Иванова','rep2@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Физическая культура',2,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(4,'Дмитрий Козлов','rep3@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Филология',4,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(5,'Иван Петров','student@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Экономика',1,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(6,'Заблокированный Пользователь','blocked@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Юриспруденция',2,NULL,'student',1,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(7,'Анна Соколова','student1@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Прикладная математика',2,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(8,'Сергей Морозов','student2@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Информатика и вычислительная техника',1,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(9,'Елена Волкова','student3@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Журналистика',3,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(10,'Никита Лебедев','student4@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Физика',2,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(11,'Ольга Новикова','student5@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Психология',4,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(12,'Артём Фёдоров','student6@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Менеджмент',1,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(13,'Дарья Кузнецова','student7@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Дизайн',2,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54'),(14,'Максим Попов','student8@example.com','2026-10-29 05:00:00','$2y$12$9lvgR693U33cwxEyyzjMzeiSAyNSKeL3crIYwvmk4CVM4FSRL8yBO','Биология',3,NULL,'student',0,NULL,'2026-10-29 05:17:54','2026-10-29 05:17:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

