
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
INSERT INTO `categories` VALUES (1,'Спорт','sport','2026-10-29 06:55:55','2026-10-29 06:55:55'),(2,'Наука','science','2026-10-29 06:55:55','2026-10-29 06:55:55'),(3,'Культура','culture','2026-10-29 06:55:55','2026-10-29 06:55:55'),(4,'Образование','education','2026-10-29 06:55:55','2026-10-29 06:55:55'),(5,'Развлечения','fun','2026-10-29 06:55:55','2026-10-29 06:55:55'),(6,'Волонтёрство','volunteer','2026-10-29 06:55:55','2026-10-29 06:55:55');
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
INSERT INTO `club_user` VALUES (1,1,2,1,'2026-10-29 06:00:00','2026-10-29 06:55:55','2026-10-29 06:55:55'),(2,4,2,1,'2026-10-29 06:00:00','2026-10-29 06:55:55','2026-10-29 06:55:55'),(3,2,3,1,'2026-10-29 06:00:00','2026-10-29 06:55:55','2026-10-29 06:55:55'),(4,3,4,1,'2026-10-29 06:00:00','2026-10-29 06:55:55','2026-10-29 06:55:55'),(5,1,5,0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55');
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
INSERT INTO `clubs` VALUES (1,'Клуб робототехники «RoboTech»','Собираем роботов, участвуем в соревнованиях и проводим хакатоны.','2026-10-29 06:55:55','2026-10-29 06:55:55'),(2,'Спортивный клуб «Буревестник»','Турниры, тренировки и спортивные праздники для всех студентов.','2026-10-29 06:55:55','2026-10-29 06:55:55'),(3,'Театральная студия «Маска»','Студенческий театр: спектакли, импровизация, мастер-классы.','2026-10-29 06:55:55','2026-10-29 06:55:55'),(4,'Волонтёрский центр «Добро»','Экологические акции, помощь приютам и городские субботники.','2026-10-29 06:55:55','2026-10-29 06:55:55');
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
INSERT INTO `event_reminders` VALUES (1,4,10,'24h','2026-10-29 06:55:55'),(2,4,11,'24h','2026-10-29 06:55:55'),(3,4,12,'24h','2026-10-29 06:55:55');
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,1,2,2,'Хакатон «Умный кампус»','24 часа командной разработки решений для университетского кампуса.\nКоманды по 3–5 человек, менторы из IT-компаний, призы победителям.','2026-11-03 09:00:00','2026-11-04 09:00:00','Корпус А, коворкинг 3 этаж','offline',40,'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(2,2,1,3,'Турнир по волейболу','Отборочный турнир сборной университета по волейболу. Количество мест ограничено.','2026-11-01 09:00:00','2026-11-01 12:00:00','Спорткомплекс, зал №2','offline',3,'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(3,1,4,2,'Онлайн-лекция «Нейросети без магии»','Простым языком о том, как устроены нейросети и как начать с ними работать. Трансляция в Zoom-подобной комнате.','2026-10-31 09:00:00','2026-10-31 11:00:00','https://meet.example.com/ai-lecture','online',NULL,'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(4,4,6,2,'Субботник в университетском парке','Приводим в порядок парк перед зимой. Перчатки и инвентарь выдаём на месте, чай — после работы.','2026-10-30 08:00:00','2026-10-30 11:00:00','Университетский парк, главный вход','offline',30,'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(5,1,2,2,'Выставка студенческих роботов','Проекты участников клуба: от линейных роботов до манипуляторов. Можно попробовать управлять.','2026-10-29 08:00:00','2026-10-29 13:00:00','Главный корпус, атриум','offline',NULL,'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(6,2,1,3,'Осенний забег 5 км','Традиционный осенний забег. Медали всем финишировавшим.','2026-10-23 09:00:00','2026-10-23 11:00:00','Набережная, старт у лодочной станции','offline',100,'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(7,3,3,4,'Спектакль «Вишнёвый сад»','Премьера сезона театральной студии по пьесе А. П. Чехова.','2026-10-19 09:00:00','2026-10-19 11:00:00','Актовый зал','offline',120,'https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(8,3,5,4,'Квиз «Кино и театр»','Командная интеллектуальная игра. Команды до 6 человек.','2026-10-26 09:00:00','2026-10-26 12:00:00','Студенческое кафе','offline',48,'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(9,1,4,2,'Мастер-класс по Arduino','Собираем первую схему на Arduino. Черновик — дата уточняется.','2026-11-12 09:00:00','2026-11-12 11:00:00','Лаборатория 214','offline',20,'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&h=750&q=75','draft',NULL,NULL,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(10,2,1,3,'Зимний лыжный кросс','Кросс на 3 и 5 км. Прокат лыж предусмотрен.','2026-11-18 09:00:00','2026-11-18 11:00:00','Лыжная база «Снежинка»','offline',60,'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&h=750&q=75','draft',NULL,NULL,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(11,3,3,4,'Вечер импровизации','Открытая сцена: импров-игры со зрителями.','2026-11-10 09:00:00','2026-11-10 11:00:00','Малый зал','offline',NULL,'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&h=750&q=75','draft',NULL,NULL,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(12,3,3,4,'Литературный вечер','Чтение стихов и прозы студентами университета.','2026-11-02 09:00:00','2026-11-02 11:00:00','Актовый зал','offline',50,'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&h=750&q=75','cancelled','Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','2026-10-22 06:00:00','2026-10-28 06:00:00','2026-10-29 06:55:55','2026-10-29 06:55:55'),(13,4,6,2,'Экоакция «Сдай батарейку»','Сбор батареек и мелкой электроники на переработку.','2026-11-04 09:00:00','2026-11-04 11:00:00','Холл главного корпуса','offline',NULL,'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&h=750&q=75','cancelled','Перенос по просьбе партнёра — пункт приёма временно не работает.','2026-10-22 06:00:00','2026-10-28 06:00:00','2026-10-29 06:55:55','2026-10-29 06:55:55'),(14,2,1,3,'Блиц-турнир по шахматам','Швейцарская система, 7 туров по 5 минут.\nРейтинговые очки в зачёт спартакиады.','2026-11-02 12:00:00','2026-11-02 15:00:00','Шахматный клуб, ауд. 118','offline',32,'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(15,3,3,4,'Концерт студенческих групп','Шесть студенческих групп: от инди до металла. Вход свободный по регистрации.','2026-11-06 18:00:00','2026-11-06 21:00:00','Актовый зал','offline',200,'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(16,1,2,2,'Лекция «Как устроена Вселенная»','Астрофизик расскажет о тёмной материи и покажет звёздное небо в телескоп после лекции.','2026-11-04 17:00:00','2026-11-04 19:00:00','Планетарий, корпус Б','offline',80,'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(17,4,6,2,'День донора','Совместно со станцией переливания крови. Нужен паспорт, накануне — лёгкий ужин без жирного.','2026-11-07 10:00:00','2026-11-07 14:00:00','Медпункт, корпус А','offline',60,'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(18,3,5,4,'Киновечер «Классика на большом экране»','Показываем «Москва слезам не верит» и обсуждаем фильм за чаем.','2026-11-03 20:00:00','2026-11-03 23:00:00','Кинозал студгородка','offline',120,'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(19,1,5,2,'Турнир по киберспорту','CS2 и Dota 2, команды по 5 человек. Трансляция на большой экран.','2026-11-10 15:00:00','2026-11-10 21:00:00','Компьютерный класс 305','offline',40,'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(20,2,1,3,'Йога на рассвете','Мягкая практика для начинающих. Коврики выдаём, приходите за 10 минут.','2026-11-02 06:00:00','2026-11-02 07:00:00','Стадион, газон у северной трибуны','offline',25,'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(21,3,4,4,'Мастер-класс «Публичные выступления»','Голос, дыхание, работа с залом. Каждый участник выступит с короткой речью.','2026-11-05 16:00:00','2026-11-05 18:00:00','Малый зал','offline',30,'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(22,1,4,2,'Онлайн-воркшоп по Python','Пишем телеграм-бота с нуля. Понадобится ноутбук с установленным Python 3.12.','2026-11-08 18:00:00','2026-11-08 20:00:00','https://meet.example.com/python-workshop','online',NULL,'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(23,4,6,2,'Высадка деревьев в студгородке','Сажаем 40 саженцев клёна и липы. Инвентарь и перчатки на месте.','2026-11-13 11:00:00','2026-11-13 15:00:00','Студгородок, аллея у общежития №3','offline',50,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(24,2,1,3,'Кубок факультетов по футболу','Финал кубка: ИВТ против экономического факультета. Приходите болеть!','2026-11-09 17:00:00','2026-11-09 19:00:00','Футбольное поле университета','offline',120,'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(25,1,4,2,'Карьерная конференция «IT-старт»','Доклады от IT-компаний, стенды работодателей и быстрые собеседования на стажировки.','2026-11-16 13:00:00','2026-11-16 19:00:00','Конгресс-холл','offline',300,'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(26,1,2,2,'День открытых дверей научной лаборатории','Экскурсия по лаборатории и эффектные опыты от аспирантов.','2026-11-11 14:00:00','2026-11-11 17:00:00','Лаборатория химии, корпус В','offline',45,'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(27,3,5,4,'Вечер настольных игр','Колонизаторы, Каркассон, Мафия и ещё 30 игр из коллекции клуба.','2026-10-24 09:00:00','2026-10-24 13:00:00','Студенческое кафе','offline',40,'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(28,4,6,2,'Помощь приюту «Хвосты»','Выгул собак, уборка вольеров и сбор корма.','2026-10-21 09:00:00','2026-10-21 12:00:00','Приют «Хвосты», ул. Лесная, 12','offline',20,'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(29,1,4,2,'Стартап-митап','Студенческие команды питчат идеи, эксперты дают обратную связь.','2026-10-17 09:00:00','2026-10-17 12:00:00','Коворкинг, корпус А','offline',100,'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&h=750&q=75','published',NULL,'2026-10-22 06:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55');
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
INSERT INTO `notifications` VALUES (1,7,'event_cancelled','Мероприятие отменено','«Литературный вечер» отменено. Причина: Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','{\"event_id\": 12}',NULL,'2026-10-29 06:55:55'),(2,9,'event_cancelled','Мероприятие отменено','«Литературный вечер» отменено. Причина: Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','{\"event_id\": 12}',NULL,'2026-10-29 06:55:55'),(3,5,'event_cancelled','Мероприятие отменено','«Литературный вечер» отменено. Причина: Актовый зал закрыт на ремонт. Новая дата будет объявлена позже.','{\"event_id\": 12}',NULL,'2026-10-29 06:55:55'),(4,10,'event_cancelled','Мероприятие отменено','«Экоакция «Сдай батарейку»» отменено. Причина: Перенос по просьбе партнёра — пункт приёма временно не работает.','{\"event_id\": 13}',NULL,'2026-10-29 06:55:55'),(5,11,'event_cancelled','Мероприятие отменено','«Экоакция «Сдай батарейку»» отменено. Причина: Перенос по просьбе партнёра — пункт приёма временно не работает.','{\"event_id\": 13}',NULL,'2026-10-29 06:55:55'),(6,5,'registration_confirmed','Регистрация подтверждена','Вы зарегистрированы на «Хакатон «Умный кампус»».','{\"event_id\": 1}','2026-10-28 06:00:00','2026-10-29 06:55:55'),(7,7,'registration_confirmed','Регистрация подтверждена','Вы зарегистрированы на «Хакатон «Умный кампус»».','{\"event_id\": 1}','2026-10-28 06:00:00','2026-10-29 06:55:55'),(8,8,'registration_confirmed','Регистрация подтверждена','Вы зарегистрированы на «Хакатон «Умный кампус»».','{\"event_id\": 1}','2026-10-28 06:00:00','2026-10-29 06:55:55'),(9,10,'event_reminder','Скоро мероприятие','«Субботник в университетском парке» начнётся менее чем через 24 часа.','{\"event_id\": 4}',NULL,'2026-10-29 06:55:55'),(10,11,'event_reminder','Скоро мероприятие','«Субботник в университетском парке» начнётся менее чем через 24 часа.','{\"event_id\": 4}',NULL,'2026-10-29 06:55:55'),(11,12,'event_reminder','Скоро мероприятие','«Субботник в университетском парке» начнётся менее чем через 24 часа.','{\"event_id\": 4}',NULL,'2026-10-29 06:55:55'),(12,5,'event_changed','Изменение в мероприятии','У «Онлайн-лекция «Нейросети без магии»» обновлена ссылка на трансляцию: https://meet.example.com/ai-lecture','{\"event_id\": 3}',NULL,'2026-10-29 06:55:55'),(13,3,'event_full','Все места заняты','На «Турнир по волейболу» зарегистрировано 100% участников.','{\"event_id\": 2}',NULL,'2026-10-29 06:55:55');
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
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',6,'demo','1405fc0812b33ef3386926770fa8715d3df280853fc147d505a8c2d7bd269a33','[\"*\"]',NULL,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55');
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
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reactions` WRITE;
/*!40000 ALTER TABLE `reactions` DISABLE KEYS */;
INSERT INTO `reactions` VALUES (1,1,7,'like','2026-10-29 06:55:55'),(2,1,7,'interested','2026-10-29 06:55:55'),(3,1,8,'like','2026-10-29 06:55:55'),(4,1,8,'interested','2026-10-29 06:55:55'),(5,1,9,'interested','2026-10-29 06:55:55'),(6,1,10,'like','2026-10-29 06:55:55'),(7,1,11,'like','2026-10-29 06:55:55'),(8,1,13,'like','2026-10-29 06:55:55'),(9,1,5,'like','2026-10-29 06:55:55'),(10,2,8,'like','2026-10-29 06:55:55'),(11,2,9,'like','2026-10-29 06:55:55'),(12,2,10,'like','2026-10-29 06:55:55'),(13,2,10,'interested','2026-10-29 06:55:55'),(14,2,12,'like','2026-10-29 06:55:55'),(15,2,12,'interested','2026-10-29 06:55:55'),(16,2,14,'like','2026-10-29 06:55:55'),(17,2,5,'like','2026-10-29 06:55:55'),(18,3,10,'interested','2026-10-29 06:55:55'),(19,3,12,'like','2026-10-29 06:55:55'),(20,3,12,'interested','2026-10-29 06:55:55'),(21,3,5,'interested','2026-10-29 06:55:55'),(22,4,7,'like','2026-10-29 06:55:55'),(23,4,8,'like','2026-10-29 06:55:55'),(24,4,9,'like','2026-10-29 06:55:55'),(25,4,10,'like','2026-10-29 06:55:55'),(26,4,12,'like','2026-10-29 06:55:55'),(27,4,13,'like','2026-10-29 06:55:55'),(28,4,13,'interested','2026-10-29 06:55:55'),(29,4,5,'like','2026-10-29 06:55:55'),(30,5,9,'like','2026-10-29 06:55:55'),(31,5,12,'like','2026-10-29 06:55:55'),(32,5,12,'interested','2026-10-29 06:55:55'),(33,5,14,'like','2026-10-29 06:55:55'),(34,5,14,'interested','2026-10-29 06:55:55'),(35,5,5,'like','2026-10-29 06:55:55'),(36,5,5,'interested','2026-10-29 06:55:55'),(37,6,7,'interested','2026-10-29 06:55:55'),(38,6,9,'like','2026-10-29 06:55:55'),(39,6,5,'interested','2026-10-29 06:55:55'),(40,7,8,'like','2026-10-29 06:55:55'),(41,7,9,'like','2026-10-29 06:55:55'),(42,7,12,'like','2026-10-29 06:55:55'),(43,7,12,'interested','2026-10-29 06:55:55'),(44,7,14,'like','2026-10-29 06:55:55'),(45,7,14,'interested','2026-10-29 06:55:55'),(46,8,7,'like','2026-10-29 06:55:55'),(47,8,7,'interested','2026-10-29 06:55:55'),(48,8,8,'interested','2026-10-29 06:55:55'),(49,8,9,'like','2026-10-29 06:55:55'),(50,8,10,'like','2026-10-29 06:55:55'),(51,8,11,'interested','2026-10-29 06:55:55'),(52,8,13,'interested','2026-10-29 06:55:55'),(53,14,10,'interested','2026-10-29 06:55:55'),(54,14,11,'interested','2026-10-29 06:55:55'),(55,14,12,'interested','2026-10-29 06:55:55'),(56,14,14,'like','2026-10-29 06:55:55'),(57,14,14,'interested','2026-10-29 06:55:55'),(58,15,7,'interested','2026-10-29 06:55:55'),(59,15,9,'interested','2026-10-29 06:55:55'),(60,15,10,'like','2026-10-29 06:55:55'),(61,15,11,'interested','2026-10-29 06:55:55'),(62,15,12,'like','2026-10-29 06:55:55'),(63,15,13,'like','2026-10-29 06:55:55'),(64,15,13,'interested','2026-10-29 06:55:55'),(65,15,5,'like','2026-10-29 06:55:55'),(66,15,5,'interested','2026-10-29 06:55:55'),(67,16,7,'interested','2026-10-29 06:55:55'),(68,16,9,'like','2026-10-29 06:55:55'),(69,16,9,'interested','2026-10-29 06:55:55'),(70,16,10,'interested','2026-10-29 06:55:55'),(71,16,11,'like','2026-10-29 06:55:55'),(72,16,13,'like','2026-10-29 06:55:55'),(73,16,13,'interested','2026-10-29 06:55:55'),(74,16,14,'like','2026-10-29 06:55:55'),(75,16,14,'interested','2026-10-29 06:55:55'),(76,17,7,'interested','2026-10-29 06:55:55'),(77,17,8,'interested','2026-10-29 06:55:55'),(78,17,10,'interested','2026-10-29 06:55:55'),(79,17,11,'like','2026-10-29 06:55:55'),(80,17,11,'interested','2026-10-29 06:55:55'),(81,17,12,'like','2026-10-29 06:55:55'),(82,17,12,'interested','2026-10-29 06:55:55'),(83,17,13,'like','2026-10-29 06:55:55'),(84,17,13,'interested','2026-10-29 06:55:55'),(85,17,14,'like','2026-10-29 06:55:55'),(86,17,5,'like','2026-10-29 06:55:55'),(87,18,7,'like','2026-10-29 06:55:55'),(88,18,7,'interested','2026-10-29 06:55:55'),(89,18,9,'interested','2026-10-29 06:55:55'),(90,18,10,'like','2026-10-29 06:55:55'),(91,18,10,'interested','2026-10-29 06:55:55'),(92,18,12,'like','2026-10-29 06:55:55'),(93,18,14,'interested','2026-10-29 06:55:55'),(94,19,8,'interested','2026-10-29 06:55:55'),(95,19,9,'like','2026-10-29 06:55:55'),(96,19,9,'interested','2026-10-29 06:55:55'),(97,19,10,'interested','2026-10-29 06:55:55'),(98,19,12,'interested','2026-10-29 06:55:55'),(99,19,13,'interested','2026-10-29 06:55:55'),(100,19,14,'like','2026-10-29 06:55:55'),(101,19,5,'like','2026-10-29 06:55:55'),(102,20,8,'like','2026-10-29 06:55:55'),(103,20,9,'like','2026-10-29 06:55:55'),(104,20,9,'interested','2026-10-29 06:55:55'),(105,20,10,'interested','2026-10-29 06:55:55'),(106,20,11,'interested','2026-10-29 06:55:55'),(107,20,12,'like','2026-10-29 06:55:55'),(108,20,13,'like','2026-10-29 06:55:55'),(109,20,5,'interested','2026-10-29 06:55:55'),(110,21,7,'interested','2026-10-29 06:55:55'),(111,21,8,'like','2026-10-29 06:55:55'),(112,21,9,'like','2026-10-29 06:55:55'),(113,21,11,'like','2026-10-29 06:55:55'),(114,21,11,'interested','2026-10-29 06:55:55'),(115,21,12,'like','2026-10-29 06:55:55'),(116,21,5,'like','2026-10-29 06:55:55'),(117,22,9,'like','2026-10-29 06:55:55'),(118,22,9,'interested','2026-10-29 06:55:55'),(119,22,10,'interested','2026-10-29 06:55:55'),(120,22,13,'like','2026-10-29 06:55:55'),(121,22,13,'interested','2026-10-29 06:55:55'),(122,22,14,'like','2026-10-29 06:55:55'),(123,23,7,'like','2026-10-29 06:55:55'),(124,23,7,'interested','2026-10-29 06:55:55'),(125,23,8,'interested','2026-10-29 06:55:55'),(126,23,13,'like','2026-10-29 06:55:55'),(127,23,13,'interested','2026-10-29 06:55:55'),(128,23,14,'like','2026-10-29 06:55:55'),(129,24,7,'interested','2026-10-29 06:55:55'),(130,24,8,'interested','2026-10-29 06:55:55'),(131,24,10,'like','2026-10-29 06:55:55'),(132,24,10,'interested','2026-10-29 06:55:55'),(133,24,11,'like','2026-10-29 06:55:55'),(134,24,12,'like','2026-10-29 06:55:55'),(135,24,12,'interested','2026-10-29 06:55:55'),(136,24,14,'interested','2026-10-29 06:55:55'),(137,24,5,'interested','2026-10-29 06:55:55'),(138,25,7,'like','2026-10-29 06:55:55'),(139,25,8,'like','2026-10-29 06:55:55'),(140,25,8,'interested','2026-10-29 06:55:55'),(141,25,9,'interested','2026-10-29 06:55:55'),(142,25,10,'interested','2026-10-29 06:55:55'),(143,25,11,'interested','2026-10-29 06:55:55'),(144,26,8,'like','2026-10-29 06:55:55'),(145,26,10,'like','2026-10-29 06:55:55'),(146,26,13,'interested','2026-10-29 06:55:55'),(147,26,14,'like','2026-10-29 06:55:55'),(148,26,14,'interested','2026-10-29 06:55:55'),(149,26,5,'like','2026-10-29 06:55:55'),(150,27,7,'interested','2026-10-29 06:55:55'),(151,27,8,'interested','2026-10-29 06:55:55'),(152,27,11,'like','2026-10-29 06:55:55'),(153,27,12,'interested','2026-10-29 06:55:55'),(154,27,13,'like','2026-10-29 06:55:55'),(155,27,13,'interested','2026-10-29 06:55:55'),(156,27,14,'like','2026-10-29 06:55:55'),(157,28,8,'interested','2026-10-29 06:55:55'),(158,28,9,'interested','2026-10-29 06:55:55'),(159,28,10,'like','2026-10-29 06:55:55'),(160,28,12,'interested','2026-10-29 06:55:55'),(161,28,13,'like','2026-10-29 06:55:55'),(162,28,13,'interested','2026-10-29 06:55:55'),(163,28,14,'interested','2026-10-29 06:55:55'),(164,28,5,'like','2026-10-29 06:55:55'),(165,29,8,'interested','2026-10-29 06:55:55'),(166,29,12,'interested','2026-10-29 06:55:55'),(167,29,13,'like','2026-10-29 06:55:55'),(168,29,14,'like','2026-10-29 06:55:55'),(169,29,5,'like','2026-10-29 06:55:55');
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
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,7,'active','2026-10-26 01:22:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(2,1,8,'active','2026-10-27 00:38:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(3,1,9,'active','2026-10-26 20:23:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(4,1,10,'active','2026-10-28 05:47:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(5,1,11,'active','2026-10-28 05:32:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(6,1,5,'active','2026-10-25 00:03:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(7,2,7,'active','2026-10-27 23:27:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(8,2,12,'active','2026-10-26 23:52:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(9,2,13,'active','2026-10-27 21:23:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(10,3,8,'active','2026-10-25 23:02:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(11,3,9,'active','2026-10-23 21:01:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(12,3,14,'active','2026-10-25 05:18:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(13,3,5,'active','2026-10-24 03:10:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(14,4,10,'active','2026-10-27 02:36:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(15,4,11,'active','2026-10-26 04:10:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(16,4,12,'active','2026-10-26 03:50:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(17,5,7,'active','2026-10-27 22:49:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(18,5,13,'active','2026-10-25 01:34:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(19,6,7,'active','2026-10-23 23:56:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(20,6,8,'active','2026-10-25 20:22:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(21,6,10,'active','2026-10-26 22:11:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(22,6,5,'active','2026-10-26 05:31:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(23,7,7,'active','2026-10-26 00:52:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(24,7,9,'active','2026-10-24 22:55:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(25,7,11,'active','2026-10-24 20:29:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(26,7,13,'active','2026-10-28 04:25:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(27,7,14,'active','2026-10-28 03:55:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(28,8,8,'active','2026-10-26 20:30:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(29,8,12,'active','2026-10-28 00:35:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(30,8,9,'cancelled','2026-10-24 22:22:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(31,12,7,'cancelled_by_organizer','2026-10-27 04:18:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(32,12,9,'cancelled_by_organizer','2026-10-28 00:33:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(33,12,5,'cancelled_by_organizer','2026-10-28 03:15:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(34,13,10,'cancelled_by_organizer','2026-10-24 23:20:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(35,13,11,'cancelled_by_organizer','2026-10-26 20:03:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(36,14,7,'active','2026-10-26 03:19:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(37,14,8,'active','2026-10-23 22:27:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(38,15,8,'active','2026-10-25 03:23:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(39,15,9,'active','2026-10-24 22:29:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(40,15,10,'active','2026-10-24 22:41:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(41,16,9,'active','2026-10-23 22:49:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(42,16,10,'active','2026-10-26 23:34:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(43,16,11,'active','2026-10-25 23:57:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(44,16,12,'active','2026-10-24 04:55:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(45,17,7,'active','2026-10-28 04:13:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(46,17,8,'active','2026-10-25 22:23:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(47,17,9,'active','2026-10-28 01:31:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(48,17,10,'active','2026-10-26 23:02:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(49,17,11,'active','2026-10-27 00:16:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(50,18,8,'active','2026-10-27 02:52:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(51,18,9,'active','2026-10-28 04:44:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(52,18,10,'active','2026-10-25 23:53:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(53,18,11,'active','2026-10-26 05:28:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(54,18,12,'active','2026-10-28 01:38:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(55,18,13,'active','2026-10-28 01:15:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(56,19,9,'active','2026-10-28 00:06:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(57,19,10,'active','2026-10-26 23:01:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(58,19,11,'active','2026-10-28 01:34:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(59,19,12,'active','2026-10-28 03:40:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(60,19,13,'active','2026-10-26 21:21:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(61,19,14,'active','2026-10-23 23:08:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(62,20,7,'active','2026-10-25 23:12:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(63,20,8,'active','2026-10-27 21:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(64,21,8,'active','2026-10-27 21:17:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(65,21,9,'active','2026-10-24 03:19:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(66,21,10,'active','2026-10-25 22:03:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(67,22,9,'active','2026-10-27 00:19:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(68,22,10,'active','2026-10-27 01:50:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(69,22,11,'active','2026-10-27 00:55:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(70,23,7,'active','2026-10-27 21:26:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(71,23,8,'active','2026-10-23 22:48:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(72,23,9,'active','2026-10-28 00:15:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(73,23,10,'active','2026-10-27 23:57:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(74,23,11,'active','2026-10-28 05:43:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(75,24,8,'active','2026-10-25 01:04:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(76,24,9,'active','2026-10-26 02:43:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(77,24,10,'active','2026-10-27 04:35:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(78,24,11,'active','2026-10-26 04:30:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(79,24,12,'active','2026-10-27 04:03:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(80,24,13,'active','2026-10-27 22:35:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(81,25,9,'active','2026-10-26 23:28:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(82,25,10,'active','2026-10-25 05:53:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(83,25,11,'active','2026-10-24 21:47:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(84,25,12,'active','2026-10-23 22:05:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(85,25,13,'active','2026-10-25 21:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(86,25,14,'active','2026-10-28 02:42:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(87,26,7,'active','2026-10-24 23:00:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(88,26,8,'active','2026-10-26 05:14:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(89,27,8,'active','2026-10-26 04:26:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(90,27,9,'active','2026-10-25 01:34:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(91,27,10,'active','2026-10-25 01:50:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(92,28,9,'active','2026-10-26 22:40:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(93,28,10,'active','2026-10-27 21:08:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(94,28,11,'active','2026-10-28 04:45:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(95,28,12,'active','2026-10-27 00:49:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(96,29,7,'active','2026-10-26 02:39:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(97,29,8,'active','2026-10-25 23:08:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(98,29,9,'active','2026-10-25 23:13:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(99,29,10,'active','2026-10-25 01:29:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(100,29,11,'active','2026-10-26 22:45:00',NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55');
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
INSERT INTO `users` VALUES (1,'Администратор','admin@example.com','2026-10-29 06:00:00','$2y$12$iiOissJOwC8r3PQ2Tu2VtuUnNkSD81urkaN7Xga1VhCjbT3u.2Qdy','Администрация',NULL,NULL,'admin',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(2,'Алексей Смирнов','rep1@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Информатика и вычислительная техника',3,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(3,'Мария Иванова','rep2@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Физическая культура',2,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(4,'Дмитрий Козлов','rep3@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Филология',4,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(5,'Иван Петров','student@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Экономика',1,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(6,'Заблокированный Пользователь','blocked@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Юриспруденция',2,NULL,'student',1,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(7,'Анна Соколова','student1@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Прикладная математика',2,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(8,'Сергей Морозов','student2@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Информатика и вычислительная техника',1,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(9,'Елена Волкова','student3@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Журналистика',3,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(10,'Никита Лебедев','student4@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Физика',2,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(11,'Ольга Новикова','student5@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Психология',4,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(12,'Артём Фёдоров','student6@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Менеджмент',1,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(13,'Дарья Кузнецова','student7@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Дизайн',2,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55'),(14,'Максим Попов','student8@example.com','2026-10-29 06:00:00','$2y$12$9oggAEpL4IK9FBqn45IaNeXnAMPF5gCqbNY7Qmr39gSAsD8Ee6OEC','Биология',3,NULL,'student',0,NULL,'2026-10-29 06:55:55','2026-10-29 06:55:55');
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

