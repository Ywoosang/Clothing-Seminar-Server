-- MySQL dump 10.13  Distrib 5.6.51, for Linux (x86_64)
--
-- Host: localhost    Database: wlearn
-- ------------------------------------------------------
-- Server version	5.6.51

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `wlearn`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `wlearn` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;

USE `wlearn`;

--
-- Table structure for table `Comment`
--

DROP TABLE IF EXISTS `Comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Comment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8_bin NOT NULL,
  `created_at` date NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `post_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `Comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `Post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comment`
--

LOCK TABLES `Comment` WRITE;
/*!40000 ALTER TABLE `Comment` DISABLE KEYS */;
INSERT INTO `Comment` VALUES (2,' 1','2021-07-26',4,2);
/*!40000 ALTER TABLE `Comment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER autoCommentDate 
    BEFORE INSERT ON Comment 
    FOR EACH ROW
    BEGIN
        SET NEW.created_at = NOW();
    END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `File`
--

DROP TABLE IF EXISTS `File`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `File` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(100) COLLATE utf8_bin NOT NULL,
  `mimetype` varchar(20) COLLATE utf8_bin NOT NULL,
  `url` varchar(300) COLLATE utf8_bin NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `post_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `File_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `File_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `Post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `File`
--

LOCK TABLES `File` WRITE;
/*!40000 ALTER TABLE `File` DISABLE KEYS */;
INSERT INTO `File` VALUES (2,'testfile','.txt','xxxx.com',4,2),(3,'5-CloudBasicsAmazonAWS_2021_AWSEducate.pdf','application/pdf','https://ywoosang-s3.s3.ap-northeast-2.amazonaws.com/1627333309408-5-CloudBasicsAmazonAWS_2021_AWSEducate.pdf',4,9),(4,'2주차_윤우상15.pdf','application/pdf','https://ywoosang-s3.s3.ap-northeast-2.amazonaws.com/1627551900012-2%EC%A3%BC%EC%B0%A8_%EC%9C%A4%EC%9A%B0%EC%83%8115.pdf',4,12),(5,'LAB-데이터베이스설계 (1).pdf','application/pdf','https://ywoosang-s3.s3.ap-northeast-2.amazonaws.com/1627577038370-LAB-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%84%A4%EA%B3%84%20%281%29.pdf',4,14);
/*!40000 ALTER TABLE `File` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Post`
--

DROP TABLE IF EXISTS `Post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Post` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(30) COLLATE utf8_bin NOT NULL,
  `content` text COLLATE utf8_bin NOT NULL,
  `created_at` date NOT NULL,
  `updated_at` date DEFAULT NULL,
  `user_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Post`
--

LOCK TABLES `Post` WRITE;
/*!40000 ALTER TABLE `Post` DISABLE KEYS */;
INSERT INTO `Post` VALUES (2,'Docker-MYSQL ','Docker-Node.js-MYSQL    ','2021-07-26','2021-07-26',4),(3,'1233','123123','2021-07-26','2021-07-26',4),(4,'aaddd','adfasdfsf','2021-07-26','2021-07-26',4),(5,'test post','post test','2021-07-26','2021-07-26',4),(6,'test post ','this post is for test ','2021-07-26','2021-07-26',4),(7,'test post ','this post is for test ','2021-07-26','2021-07-26',4),(8,'test post ','this post is for test ','2021-07-26','2021-07-26',4),(9,'test post ','this post is for test ','2021-07-26','2021-07-26',4),(10,'2312323','123123','2021-07-26','2021-07-26',4),(11,'2312312312323','asdasdasdafsdasd','2021-07-26','2021-07-26',4),(12,'asdasdasd','asdasd','2021-07-29','2021-07-29',4),(13,'테스트 포스팅','122343','2021-07-29','2021-07-29',4),(14,'치킨먹는 손지원','치킨을 먹자 냠냠','2021-07-29','2021-07-29',4);
/*!40000 ALTER TABLE `Post` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER autoPostDate 
    BEFORE INSERT ON Post 
    FOR EACH ROW
    BEGIN
        SET NEW.created_at = NOW();
        SET NEW.updated_at = NOW();
    END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(10) NOT NULL,
  `nickId` varchar(15) NOT NULL,
  `email` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (4,'ywoosang','Ywoosang','opellong13@gmail.com');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-01 17:13:41
