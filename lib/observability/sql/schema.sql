-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (arm64)
--
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projects_id` int NOT NULL,
  `memberships_id` int NOT NULL,
  `role` int NOT NULL,
  PRIMARY KEY (`id`,`projects_id`,`memberships_id`),
  KEY `fk_assignments_projects1_idx` (`projects_id`),
  KEY `fk_assignments_memberships1_idx` (`memberships_id`),
  CONSTRAINT `fk_assignments_memberships1` FOREIGN KEY (`memberships_id`) REFERENCES `memberships` (`id`),
  CONSTRAINT `fk_assignments_projects1` FOREIGN KEY (`projects_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `beacons`
--

DROP TABLE IF EXISTS `beacons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beacons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teams_id` int NOT NULL,
  `targets_id` int DEFAULT NULL,
  `triggered_by` int DEFAULT NULL,
  `stage` int NOT NULL,
  `uuid` varchar(45) NOT NULL,
  `url` text NOT NULL,
  `provider` int NOT NULL,
  `type` int NOT NULL,
  `ttfb` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fcp` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dcl` decimal(10,2) NOT NULL DEFAULT '0.00',
  `lcp` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tti` decimal(10,2) NOT NULL DEFAULT '0.00',
  `si` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cls` decimal(10,2) NOT NULL DEFAULT '0.00',
  `screenshots` json DEFAULT NULL,
  `mode` int NOT NULL,
  `performance_score` int NOT NULL DEFAULT '0',
  `accessibility_score` int NOT NULL DEFAULT '0',
  `best_practices_score` int NOT NULL DEFAULT '0',
  `seo_score` int NOT NULL DEFAULT '0',
  `pleasantness_score` int NOT NULL DEFAULT '0',
  `status` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`teams_id`),
  KEY `fk_performance_executions_targets1_idx` (`targets_id`),
  KEY `fk_performance_executions_teams1_idx` (`teams_id`),
  KEY `fk_performance_executions_assignments1_idx` (`triggered_by`),
  CONSTRAINT `fk_performance_executions_assignments1` FOREIGN KEY (`triggered_by`) REFERENCES `assignments` (`id`),
  CONSTRAINT `fk_performance_executions_targets1` FOREIGN KEY (`targets_id`) REFERENCES `targets` (`id`),
  CONSTRAINT `fk_performance_executions_teams1` FOREIGN KEY (`teams_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `engagement`
--

DROP TABLE IF EXISTS `engagement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `engagement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targets_id` int NOT NULL,
  `bounce_rate` int NOT NULL,
  `mode` int NOT NULL,
  `date_from` datetime NOT NULL,
  `date_to` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`targets_id`),
  KEY `fk_bounce_statistics_targets1_idx` (`targets_id`),
  CONSTRAINT `fk_bounce_statistics_targets1` FOREIGN KEY (`targets_id`) REFERENCES `targets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `users_id` int NOT NULL,
  `teams_id` int NOT NULL,
  `role` int NOT NULL,
  PRIMARY KEY (`id`,`users_id`,`teams_id`),
  KEY `fk_memberships_teams1_idx` (`teams_id`),
  KEY `fk_memberships_users1_idx` (`users_id`),
  CONSTRAINT `fk_memberships_teams1` FOREIGN KEY (`teams_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `fk_memberships_users1` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teams_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`,`teams_id`),
  KEY `fk_projects_teams2_idx` (`teams_id`),
  CONSTRAINT `fk_projects_teams2` FOREIGN KEY (`teams_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targets_id` int NOT NULL,
  `provider` int NOT NULL,
  `cron` varchar(45) NOT NULL,
  `next_execution` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`targets_id`),
  KEY `fk_schedules_targets2_idx` (`targets_id`),
  CONSTRAINT `fk_schedules_targets2` FOREIGN KEY (`targets_id`) REFERENCES `targets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statistics`
--

DROP TABLE IF EXISTS `statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targets_id` int NOT NULL,
  `provider` int NOT NULL,
  `period` int NOT NULL,
  `ttfb` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fcp` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dcl` decimal(10,2) NOT NULL DEFAULT '0.00',
  `lcp` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tti` decimal(10,2) NOT NULL DEFAULT '0.00',
  `si` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cls` decimal(10,2) NOT NULL DEFAULT '0.00',
  `mode` int NOT NULL,
  `count` int NOT NULL,
  `performance_score` int NOT NULL,
  `accessibility_score` int NOT NULL DEFAULT '0',
  `best_practices_score` int NOT NULL DEFAULT '0',
  `seo_score` int NOT NULL DEFAULT '0',
  `pleasantness_score` int NOT NULL DEFAULT '0',
  `date_from` datetime NOT NULL,
  `date_to` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`targets_id`),
  KEY `fk_performance_statistics_targets1_idx` (`targets_id`),
  CONSTRAINT `fk_performance_statistics_targets1` FOREIGN KEY (`targets_id`) REFERENCES `targets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `targets`
--

DROP TABLE IF EXISTS `targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `targets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projects_id` int NOT NULL,
  `stage` int NOT NULL,
  `provider` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` text,
  `lambda_arn` varchar(110) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`projects_id`),
  KEY `fk_targets_projects2_idx` (`projects_id`),
  CONSTRAINT `fk_targets_projects2` FOREIGN KEY (`projects_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub` varchar(45) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-27 13:00:31
