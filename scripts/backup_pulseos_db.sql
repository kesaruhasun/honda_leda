-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: pulseos_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

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

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_date` date NOT NULL,
  `appointment_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointment_time` time(6) NOT NULL,
  `booking_date` datetime(6) NOT NULL,
  `end_time` time(6) DEFAULT NULL,
  `reason_for_visit` text COLLATE utf8mb4_unicode_ci,
  `room_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','IN_CONSULTATION','NO_SHOW','SCHEDULED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`appointment_id`),
  UNIQUE KEY `uq_doctor_slot` (`doctor_id`,`appointment_date`,`appointment_time`),
  KEY `FK8exap5wmg8kmb1g1rx3by21yt` (`patient_id`),
  CONSTRAINT `FK8exap5wmg8kmb1g1rx3by21yt` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  CONSTRAINT `FKmujeo4tymoo98cmf7uj3vsv76` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'2026-10-06',NULL,'09:30:00.000000','2026-10-05 19:23:30.800411','09:45:00.000000','Routine cardiac follow-up','204','COMPLETED',1,7),(2,'2026-10-06',NULL,'10:30:00.000000','2026-10-06 16:23:30.800484','10:45:00.000000','Chest pain and hypertension evaluation','204','IN_CONSULTATION',1,8),(3,'2026-10-07',NULL,'09:00:00.000000','2026-10-06 18:23:30.800524','09:15:00.000000','Post-op evaluation','204','CONFIRMED',1,9),(4,'2026-10-07',NULL,'10:00:00.000000','2026-10-06 19:23:30.800559','10:15:00.000000','Shortness of breath on exertion','204','COMPLETED',1,10),(5,'2026-10-09',NULL,'11:00:00.000000','2026-10-06 19:23:30.800583','11:15:00.000000','ECG consultation','204','SCHEDULED',1,11),(7,'2026-10-07','APT-1791388191508','10:30:00.000000','2026-10-07 21:19:51.508774','10:45:00.000000','Routine Consultation','Room 204','CANCELLED',1,7),(8,'2026-10-08','APT-1791388485145','10:00:00.000000','2026-10-07 21:24:45.145121','10:15:00.000000','Routine Consultation','Room 204','CANCELLED',1,7),(9,'2026-10-11','APT-1791544246191','09:00:00.000000','2026-10-09 16:40:46.191647','09:15:00.000000','Routine Consultation','Room 204','COMPLETED',1,7),(10,'2026-10-12','APT-1791727876309','09:00:00.000000','2026-10-11 19:41:16.309291','09:15:00.000000','High fever and couhg','Room 204','COMPLETED',1,22),(11,'2026-10-15','APT-1791768206775','10:00:00.000000','2026-10-12 06:53:26.775508','10:15:00.000000','Routine Consultation','Room 204','CANCELLED',1,7),(12,'2026-10-15','APT-1791768375937','10:30:00.000000','2026-10-12 06:56:15.937718','10:45:00.000000','Routine Consultation','Room 204','COMPLETED',1,54),(13,'2026-10-15','APT-1791770358901','11:00:00.000000','2026-10-12 07:29:18.901681','11:15:00.000000','Routine Consultation','Room 204','SCHEDULED',1,54),(14,'2026-10-15','APT-1791792958194','14:30:00.000000','2026-10-12 13:45:58.194324','14:45:00.000000','Routine Consultation','Suite 101','SCHEDULED',52,7),(15,'2026-10-16','APT-1791795170372','10:30:00.000000','2026-10-12 14:22:50.372582','10:45:00.000000','Routine Consultation','Room 204','SCHEDULED',1,7),(16,'2026-10-23','APT-1792173905208','09:00:00.000000','2026-10-16 23:35:05.208285','09:15:00.000000','Routine Consultation','Room 204','COMPLETED',1,58),(17,'2026-10-24','APT-1792174227460','10:00:00.000000','2026-10-16 23:40:27.460598','10:15:00.000000','Routine Consultation','Room 204','COMPLETED',1,58),(18,'2026-10-20','APT-1792311989540','10:00:00.000000','2026-10-18 13:56:29.540055','10:15:00.000000','Routine Consultation','Room 204','SCHEDULED',1,7);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archived_patients`
--

DROP TABLE IF EXISTS `archived_patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archived_patients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `archive_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archived_at` datetime(6) NOT NULL,
  `archived_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_group` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_notes` text COLLATE utf8mb4_unicode_ci,
  `nic_passport_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_patient_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archived_patients`
--

LOCK TABLES `archived_patients` WRITE;
/*!40000 ALTER TABLE `archived_patients` DISABLE KEYS */;
/*!40000 ALTER TABLE `archived_patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` bigint NOT NULL AUTO_INCREMENT,
  `budget` decimal(14,2) NOT NULL,
  `department_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manager_appointed_date` date DEFAULT NULL,
  `manager_id` bigint DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `UK_qyf2ekbfpnddm6f3rkgt39i9o` (`department_name`),
  UNIQUE KEY `UK_n6rq9sdwiiio8v8gn6n9cgqlx` (`manager_id`),
  CONSTRAINT `FK56q3esufky8u69xbmo4n63c4r` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,15000000.00,'Cardiology','Building B, Floor 2','2023-01-01',1),(2,8500000.00,'Outpatient Department (OPD)','Ground Floor, Main Wing',NULL,NULL),(3,25000000.00,'Pharmacy & Stores','Ground Floor, East Wing',NULL,NULL),(4,12000000.00,'Laboratory Services','Building A, Floor 1',NULL,NULL),(5,30000000.00,'General Surgery','Building C, Floor 3',NULL,NULL),(6,10000000.00,'Pediatrics','Building B, Floor 1',NULL,NULL),(7,5000000.00,'Finance & Hospital IT Operations','Administrative Tower, Level 4','2022-01-01',5);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_schedules`
--

DROP TABLE IF EXISTS `doctor_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_schedules` (
  `schedule_id` bigint NOT NULL AUTO_INCREMENT,
  `day_of_week` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` bigint NOT NULL,
  `end_time` time(6) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `max_patients` int DEFAULT NULL,
  `slot_duration_minutes` int DEFAULT NULL,
  `start_time` time(6) NOT NULL,
  PRIMARY KEY (`schedule_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_schedules`
--

LOCK TABLES `doctor_schedules` WRITE;
/*!40000 ALTER TABLE `doctor_schedules` DISABLE KEYS */;
INSERT INTO `doctor_schedules` VALUES (1,'MONDAY',51,'12:00:00.000000',_binary '',20,15,'08:00:00.000000');
/*!40000 ALTER TABLE `doctor_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `consultation_fee` decimal(10,2) NOT NULL,
  `doctor_license_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_available` bit(1) NOT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `UK_6lnii6hsm7pkw21i8cypk1612` (`doctor_license_no`),
  CONSTRAINT `FK596vk9rc5i8qx1efhefquv811` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (3500.00,'SLMC-48291',_binary '','Room 204','Cardiology',1),(2500.00,'SLMC-TEST-999',_binary '','Suite 101','Cardiology',47),(3200.00,'SLMC-89211',_binary '','Suite 305','Neurology',48),(2500.00,'SLMC',_binary '\0','Suite 101','Cardiology',49),(2500.00,'1234',_binary '','Suite 101','Cardiology',52),(2500.00,'111',_binary '','Suite 102','Cardiology',57);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_dispensations`
--

DROP TABLE IF EXISTS `drug_dispensations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_dispensations` (
  `dispensation_id` bigint NOT NULL AUTO_INCREMENT,
  `dispense_date` datetime(6) NOT NULL,
  `dispensed_qty` int NOT NULL,
  `drug_id` bigint NOT NULL,
  `pharmacist_id` bigint NOT NULL,
  `prescription_id` bigint DEFAULT NULL,
  PRIMARY KEY (`dispensation_id`),
  KEY `FK8igvb21tuhbfoahik5oil20ka` (`drug_id`),
  KEY `FKdn6x0l6uoi4hwr8636gaj5ghd` (`pharmacist_id`),
  KEY `FKhxoggmt8mo4g5uayj1nlt4hvi` (`prescription_id`),
  CONSTRAINT `FK8igvb21tuhbfoahik5oil20ka` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`),
  CONSTRAINT `FKdn6x0l6uoi4hwr8636gaj5ghd` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacists` (`employee_id`),
  CONSTRAINT `FKhxoggmt8mo4g5uayj1nlt4hvi` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_dispensations`
--

LOCK TABLES `drug_dispensations` WRITE;
/*!40000 ALTER TABLE `drug_dispensations` DISABLE KEYS */;
INSERT INTO `drug_dispensations` VALUES (1,'2026-10-06 18:23:31.183022',30,14,3,1),(2,'2026-10-06 18:23:31.183091',30,11,3,1);
/*!40000 ALTER TABLE `drug_dispensations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drugs`
--

DROP TABLE IF EXISTS `drugs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drugs` (
  `drug_id` bigint NOT NULL AUTO_INCREMENT,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage_form` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drug_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `generic_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reorder_level` int NOT NULL,
  `stock_quantity` int NOT NULL,
  `strength` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`drug_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drugs`
--

LOCK TABLES `drugs` WRITE;
/*!40000 ALTER TABLE `drugs` DISABLE KEYS */;
INSERT INTO `drugs` VALUES (3,'BAT-AZI-2026','Azithromycin 250mg','Antibiotic','TABLET','Azithromycin','2027-04-30','Azithromycin',NULL,'Standard Pharma',50,18,'500mg',110.00),(5,'BAT-AUG-2026','Augmentin 625mg','Antibiotic','TABLET','Augmentin 625mg','2027-06-30','Amoxicillin / Clavulanic Acid',NULL,'Standard Pharma',40,70,'500mg',125.00),(6,'BAT-PCM-2026','Paracetamol 500mg','Analgesic','TABLET','Paracetamol 500mg','2028-01-31','Acetaminophen',NULL,'Standard Pharma',200,1200,'500mg',8.50),(7,'BAT-IBU-2026','Ibuprofen 400mg','Analgesic','TABLET','Ibuprofen 400mg','2027-09-30','Ibuprofen',NULL,'Standard Pharma',60,350,'500mg',16.00),(8,'BAT-DIC-2026','Diclofenac Sodium 50mg','Analgesic','TABLET','Diclofenac Sodium 50mg','2026-11-30','Diclofenac Sodium',NULL,'Standard Pharma',50,20,'500mg',22.00),(9,'BAT-TRA-2026','Tramadol 50mg','Analgesic','TABLET','Tramadol 50mg','2027-05-15','Tramadol HCl',NULL,'Standard Pharma',30,80,'500mg',45.00),(10,'BAT-MEF-2026','Mefenamic Acid 500mg','Analgesic','TABLET','Mefenamic Acid 500mg','2027-11-20','Mefenamic Acid',NULL,'Standard Pharma',40,140,'500mg',28.00),(11,'BAT-AML-2026','Amlodipine 5mg','Cardiovascular','TABLET','Amlodipine 5mg','2027-12-31','Amlodipine Besylate',NULL,'Standard Pharma',80,400,'500mg',18.00),(12,'BAT-LOS-2026','Losartan Potassium 50mg','Cardiovascular','TABLET','Losartan Potassium 50mg','2028-02-28','Losartan Potassium',NULL,'Standard Pharma',60,290,'500mg',32.00),(13,'BAT-ATE-2026','Atenolol 50mg','Cardiovascular','TABLET','Atenolol 50mg','2026-10-31','Atenolol',NULL,'Standard Pharma',50,10,'500mg',15.00),(14,'BAT-ATV-2026','Atorvastatin 20mg','Cardiovascular','TABLET','Atorvastatin 20mg','2027-07-31','Atorvastatin Calcium',NULL,'Standard Pharma',50,280,'500mg',55.00),(15,'BAT-GTN-2026','Glyceryl Trinitrate 0.5mg SL','Cardiovascular','TABLET','Glyceryl Trinitrate 0.5mg SL','2027-03-31','Nitroglycerin',NULL,'Standard Pharma',30,65,'500mg',25.00),(16,'BAT-MET-2026','Metformin HCl 500mg','Antidiabetic','TABLET','Metformin HCl 500mg','2028-03-31','Metformin Hydrochloride',NULL,'Standard Pharma',100,540,'500mg',12.00),(17,'BAT-GLI-2026','Gliclazide 80mg','Antidiabetic','TABLET','Gliclazide 80mg','2027-09-15','Gliclazide',NULL,'Standard Pharma',50,210,'500mg',24.00),(18,'BAT-INS-2026','Human Insulin 100 IU/ml','Antidiabetic','TABLET','Human Insulin 100 IU/ml','2026-12-15','Biphasic Isophane Insulin',NULL,'Standard Pharma',25,8,'500mg',1450.00),(19,'BAT-SIT-2026','Sitagliptin 100mg','Antidiabetic','TABLET','Sitagliptin 100mg','2027-08-20','Sitagliptin Phosphate',NULL,'Standard Pharma',30,75,'500mg',180.00),(20,'BAT-CET-2026','Cetirizine HCl 10mg','Antihistamine','TABLET','Cetirizine HCl 10mg','2028-04-30','Cetirizine Dihydrochloride',NULL,'Standard Pharma',80,450,'500mg',14.00),(21,'BAT-SAL-2026','Salbutamol Inhaler 100mcg','Respiratory','TABLET','Salbutamol Inhaler 100mcg','2027-01-31','Salbutamol Sulfate',NULL,'Standard Pharma',40,18,'500mg',850.00),(22,'BAT-MON-2026','Montelukast Sodium 10mg','Respiratory','TABLET','Montelukast Sodium 10mg','2027-11-15','Montelukast Sodium',NULL,'Standard Pharma',40,160,'500mg',65.00),(23,'BAT-FEX-2026','Fexofenadine 120mg','Antihistamine','TABLET','Fexofenadine 120mg','2027-06-25','Fexofenadine HCl',NULL,'Standard Pharma',50,190,'500mg',58.00),(25,'BATCH001','Panadol','Painkiller','TABLET','Paracetamol','2028-12-31','Paracetamol','PAR001','Standard Pharma',20,100,'500mg',50.00),(26,'BCH-2026-001','Atorvation','General','Tablet','Atorvation','2027-12-31','Atorvation','DRG-011','State Pharmaceuticals Manufacturing Corporation',20,100,'20mg',25.00),(28,'BCH-2026-001','Amoxicillin','General','Tablet','Amoxicillin','2027-12-31','Amoxicillin','DRG-AMX-500','State Pharmaceuticals Manufacturing Corporation',20,100,'500mg',25.00),(29,'BCH-2026-001','Omeprazole','General','Tablet','Omeprazole','2027-12-31','Omeprazole','DRG - 033','State Pharmaceuticals Manufacturing Corporation',50,234,'20mg',30.00),(30,'BCH-2026-001','atirvaton','General','Tablet','atirvaton','2027-12-31','atirvaton','drg111','State Pharmaceuticals Manufacturing Corporation',20,99,'20mg',25.00);
/*!40000 ALTER TABLE `drugs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_qualifications`
--

DROP TABLE IF EXISTS `employee_qualifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_qualifications` (
  `employee_id` bigint NOT NULL,
  `qualification` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`employee_id`,`qualification`),
  CONSTRAINT `FKnles1upkcyh8gnmpxyksoairs` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_qualifications`
--

LOCK TABLES `employee_qualifications` WRITE;
/*!40000 ALTER TABLE `employee_qualifications` DISABLE KEYS */;
INSERT INTO `employee_qualifications` VALUES (1,'MBBS (Colombo)'),(1,'MD (Cardiology)'),(1,'MRCP (UK)'),(2,'Cert. Front Office Mgmt'),(2,'Diploma in Hospital Administration'),(3,'B.Pharm (Hons)'),(3,'Reg. Pharmacist SL'),(4,'BSc Medical Laboratory Science'),(4,'SLMC Registered MLT'),(5,'BSc (Hons) Software Engineering (SLIIT)'),(5,'CISA'),(6,'BSc Health Services Management');
/*!40000 ALTER TABLE `employee_qualifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `dept_joining_date` date NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_role` enum('DOCTOR','LAB_TECHNICIAN','PHARMACIST','RECEPTIONIST','SYSTEM_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `employment_type` enum('CONTRACT','FULL_TIME','INTERN','PART_TIME') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hire_date` date NOT NULL,
  `salary` decimal(12,2) NOT NULL,
  `supervision_date` date DEFAULT NULL,
  `employee_id` bigint NOT NULL,
  `department_id` bigint NOT NULL,
  `supervisor_id` bigint DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `UK_j9xgmd0ya5jmus09o0b8pqrpb` (`email`),
  KEY `FKgy4qe3dnqrm3ktd76sxp7n4c2` (`department_id`),
  KEY `FK2q9drrvhye5m5ivk5h6re2b4i` (`supervisor_id`),
  CONSTRAINT `FK2q9drrvhye5m5ivk5h6re2b4i` FOREIGN KEY (`supervisor_id`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `FK5eeilrk592kdr27j571wsg3k5` FOREIGN KEY (`employee_id`) REFERENCES `persons` (`person_id`),
  CONSTRAINT `FKgy4qe3dnqrm3ktd76sxp7n4c2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('2022-01-10','it25103999@my.sliit.lk','DOCTOR','FULL_TIME','2022-01-10',450000.00,NULL,1,1,NULL),('2023-03-15','it25100994@my.sliit.lk','RECEPTIONIST','FULL_TIME','2023-03-15',120000.00,NULL,2,2,NULL),('2022-06-01','it25100826@my.sliit.lk','PHARMACIST','FULL_TIME','2022-06-01',185000.00,NULL,3,3,NULL),('2023-02-01','it25103363@my.sliit.lk','LAB_TECHNICIAN','FULL_TIME','2023-02-01',165000.00,NULL,4,4,NULL),('2021-11-01','kesaruhasun@gmail.com','SYSTEM_ADMIN','FULL_TIME','2021-11-01',380000.00,NULL,5,7,NULL),('2023-04-01','it25101620@my.sliit.lk','RECEPTIONIST','FULL_TIME','2023-04-01',120000.00,NULL,6,2,NULL),('2026-10-11',NULL,'DOCTOR','FULL_TIME','2026-10-11',250000.00,NULL,47,1,NULL),('2026-10-11','dr.ayesha.perera@pulseos.lk','DOCTOR','FULL_TIME','2026-10-11',250000.00,NULL,48,1,NULL),('2026-10-11','kesaru@tekkeys.com','DOCTOR','FULL_TIME','2026-10-11',250000.00,NULL,49,1,NULL),('2026-10-11','lakshankavinda994@gmail.com','DOCTOR','FULL_TIME','2026-10-11',250000.00,NULL,51,1,NULL),('2026-10-11','kavinda@gmail.com','DOCTOR','FULL_TIME','2026-10-11',250000.00,NULL,52,1,NULL),('2026-10-12','kavinda1lakshan2@gmail.com','DOCTOR','FULL_TIME','2026-10-12',250000.00,NULL,57,1,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_drug_items`
--

DROP TABLE IF EXISTS `invoice_drug_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_drug_items` (
  `billed_qty` int NOT NULL,
  `sub_total` decimal(10,2) NOT NULL,
  `drug_id` bigint NOT NULL,
  `invoice_id` bigint NOT NULL,
  PRIMARY KEY (`drug_id`,`invoice_id`),
  KEY `FKla8cispfeiu3uis0802s08k3h` (`invoice_id`),
  CONSTRAINT `FKkjckys1mebt5hd31xcwt7njnv` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`),
  CONSTRAINT `FKla8cispfeiu3uis0802s08k3h` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_drug_items`
--

LOCK TABLES `invoice_drug_items` WRITE;
/*!40000 ALTER TABLE `invoice_drug_items` DISABLE KEYS */;
INSERT INTO `invoice_drug_items` VALUES (15,1650.00,3,17),(15,1650.00,3,18),(10,1250.00,5,12),(10,1250.00,5,17),(10,1250.00,5,19),(30,540.00,11,1),(30,1650.00,14,1);
/*!40000 ALTER TABLE `invoice_drug_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_lab_items`
--

DROP TABLE IF EXISTS `invoice_lab_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_lab_items` (
  `test_fee` decimal(10,2) NOT NULL,
  `invoice_id` bigint NOT NULL,
  `test_id` bigint NOT NULL,
  PRIMARY KEY (`invoice_id`,`test_id`),
  KEY `FKo893sxnclxfsvh25yududfwd0` (`test_id`),
  CONSTRAINT `FKe00ju6cu90hyixxuiiy9sodo9` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`),
  CONSTRAINT `FKo893sxnclxfsvh25yududfwd0` FOREIGN KEY (`test_id`) REFERENCES `lab_tests` (`test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_lab_items`
--

LOCK TABLES `invoice_lab_items` WRITE;
/*!40000 ALTER TABLE `invoice_lab_items` DISABLE KEYS */;
INSERT INTO `invoice_lab_items` VALUES (2200.00,1,1),(650.00,2,2);
/*!40000 ALTER TABLE `invoice_lab_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` bigint NOT NULL AUTO_INCREMENT,
  `billing_date` datetime(6) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `doctor_fee` decimal(10,2) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lab_fee` decimal(10,2) DEFAULT NULL,
  `net_amount` decimal(12,2) DEFAULT NULL,
  `payment_status` enum('CANCELLED','DRAFT','PAID','PARTIALLY_PAID','PENDING','VOIDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `pharmacy_fee` decimal(10,2) DEFAULT NULL,
  `tax_amount` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `UK_l1x55mfsay7co0r3m9ynvipd5` (`invoice_number`),
  KEY `FKngg5bc8atao2b9jehl9l8tdsw` (`appointment_id`),
  KEY `FKrpyotno5h237hyoaokuggqqog` (`patient_id`),
  CONSTRAINT `FKngg5bc8atao2b9jehl9l8tdsw` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `FKrpyotno5h237hyoaokuggqqog` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'2026-10-06 18:23:31.598655',0.00,3500.00,'2026-10-06','INV-2026-0001',2200.00,7890.00,'PAID',2190.00,0.00,7890.00,1,7),(2,'2026-10-06 19:08:31.806624',415.00,3500.00,'2026-10-06','INV-2026-0002',650.00,3735.00,'PENDING',0.00,0.00,4150.00,2,8),(3,'2026-10-08 22:53:42.726485',0.00,0.00,'2026-10-08','INV-1791480222726',1500.00,1500.00,'PENDING',0.00,0.00,1500.00,NULL,7),(4,'2026-10-08 22:59:37.306762',0.00,0.00,'2026-10-08','INV-1791479678116',0.00,1500.00,'PAID',0.00,0.00,1500.00,NULL,7),(5,'2026-10-09 20:45:58.170878',0.00,0.00,'2026-10-09','INV-1791558958170',0.00,8.50,'CANCELLED',8.50,0.00,8.50,NULL,7),(6,'2026-10-11 10:22:06.874045',0.00,0.00,'2026-10-11','INV-1791694326874',0.00,110.00,'PAID',110.00,0.00,110.00,NULL,7),(7,'2026-10-11 10:30:46.976809',0.00,3500.00,'2026-10-11','INV-1791694846976',2800.00,8490.00,'PAID',2190.00,0.00,8490.00,1,7),(8,'2026-10-11 11:19:04.398100',0.00,3500.00,'2026-10-11','INV-1791697744398',1200.00,4700.00,'PENDING',0.00,0.00,4700.00,5,11),(9,'2026-10-11 20:59:47.113449',0.00,0.00,'2026-10-11','INV-1791732587113',0.00,110.00,'PAID',110.00,0.00,110.00,NULL,7),(10,'2026-10-12 07:08:54.732814',0.00,0.00,'2026-10-12','INV-1791769134732',0.00,110.00,'PAID',110.00,0.00,110.00,NULL,54),(11,'2026-10-12 07:27:09.793169',0.00,0.00,'2026-10-12','INV-RX-13-29789',0.00,1500.00,'PENDING',1500.00,0.00,1500.00,12,54),(12,'2026-10-12 07:30:10.312913',125.00,0.00,'2026-10-12','INV-RX-14-10312',0.00,1125.00,'CANCELLED',1250.00,0.00,1250.00,13,54),(13,'2026-10-12 13:53:15.647936',0.00,0.00,'2026-10-12','INV-1791793395647',0.00,110.00,'PENDING',110.00,0.00,110.00,NULL,7),(14,'2026-10-12 13:57:02.301069',4702.50,3500.00,'2026-10-12','INV-1791793622301',0.00,47.50,'PENDING',1250.00,0.00,4750.00,13,54),(15,'2026-10-12 14:14:58.822160',0.00,0.00,'2026-10-12','INV-1791794698822',1500.00,1500.00,'PAID',0.00,0.00,1500.00,NULL,56),(16,'2026-10-16 23:46:54.949878',0.00,0.00,'2026-10-16','INV-1792174614949',0.00,983.50,'CANCELLED',983.50,0.00,983.50,NULL,58),(17,'2026-10-16 23:51:44.167920',0.00,3500.00,'2026-10-16','INV-RX-15-4167',1500.00,7900.00,'PAID',2900.00,0.00,7900.00,16,58),(18,'2026-10-17 00:21:04.910092',0.00,3500.00,'2026-10-16','INV-RX-17-64910',1500.00,6650.00,'PENDING',1650.00,0.00,6650.00,17,58),(19,'2026-10-18 13:57:17.921041',0.00,0.00,'2026-10-18','INV-RX-19-37921',0.00,1250.00,'PENDING',1250.00,0.00,1250.00,7,7);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_technicians`
--

DROP TABLE IF EXISTS `lab_technicians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_technicians` (
  `certification_level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lab_section` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `FK8cgb2my538cose5ap53d8vig` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_technicians`
--

LOCK TABLES `lab_technicians` WRITE;
/*!40000 ALTER TABLE `lab_technicians` DISABLE KEYS */;
INSERT INTO `lab_technicians` VALUES ('Senior Medical Technologist (MLT-1)','Hematology & Clinical Biochemistry',4);
/*!40000 ALTER TABLE `lab_technicians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_test_catalogs`
--

DROP TABLE IF EXISTS `lab_test_catalogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_test_catalogs` (
  `catalog_id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `measurement_unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `normal_range_max` double DEFAULT NULL,
  `normal_range_min` double DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sample_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `test_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`catalog_id`),
  UNIQUE KEY `UK_nm98clcjuebr8er090hgnl76h` (`test_code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_test_catalogs`
--

LOCK TABLES `lab_test_catalogs` WRITE;
/*!40000 ALTER TABLE `lab_test_catalogs` DISABLE KEYS */;
INSERT INTO `lab_test_catalogs` VALUES (1,'Hematology','10^3/uL',11,4.5,1500.00,'Whole Blood (EDTA)','LAB-FBC','Full Blood Count (FBC) with ESR'),(2,'Biochemistry','mg/dL',99,70,650.00,'Fluoride Plasma','LAB-FBS','Fasting Blood Sugar (FBS)'),(3,'Biochemistry','mg/dL',199,100,2800.00,'Serum','LAB-LIP','Lipid Profile Panel (Total, HDL, LDL, Triglycerides)'),(4,'Biochemistry','mg/dL',1.2,0.7,1200.00,'Serum','LAB-KFT','Serum Creatinine & Renal Profile (eGFR)'),(5,'Biochemistry','U/L',56,7,3200.00,'Serum','LAB-LFT','Liver Function Test (SGPT, SGOT, Bilirubin)'),(6,'Endocrinology','%',5.6,4,2200.00,'Whole Blood','LAB-HBA1C','HbA1c Glycated Hemoglobin'),(7,'Endocrinology','uIU/mL',4,0.4,2500.00,'Serum','LAB-TSH','Thyroid Stimulating Hormone (TSH)'),(8,'Pathology','HPF',5,0,800.00,'Midstream Urine','LAB-UFR','Urine Full Report (UFR) & Microscopy'),(9,'Serology','Index',0.9,0,2900.00,'Serum / Whole Blood','LAB-DENGUE','Dengue NS1 Antigen & Antibody Rapid');
/*!40000 ALTER TABLE `lab_test_catalogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `test_id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clinical_indication` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conduction_date` datetime(6) DEFAULT NULL,
  `flag` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lab_test_catalog_id` bigint DEFAULT NULL,
  `reference_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result_data` text COLLATE utf8mb4_unicode_ci,
  `result_value` double DEFAULT NULL,
  `sample_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `standard_fee` decimal(10,2) NOT NULL,
  `test_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `test_date` date NOT NULL,
  `test_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_status` enum('CANCELLED','COMPLETED','PROCESSING','REQUESTED','SAMPLE_COLLECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `urgency` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  `technician_id` bigint DEFAULT NULL,
  PRIMARY KEY (`test_id`),
  KEY `FKmpqxk5fdb5pw5vudj0aniue0k` (`appointment_id`),
  KEY `FK2cb4c4ihrxw7qanuj3n4seb6f` (`doctor_id`),
  KEY `FKl4ouv6hgecsaq5h6paubqr684` (`patient_id`),
  KEY `FKkc8f0cft8utn25h7u5ouhtlg0` (`technician_id`),
  CONSTRAINT `FK2cb4c4ihrxw7qanuj3n4seb6f` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`employee_id`),
  CONSTRAINT `FKkc8f0cft8utn25h7u5ouhtlg0` FOREIGN KEY (`technician_id`) REFERENCES `lab_technicians` (`employee_id`),
  CONSTRAINT `FKl4ouv6hgecsaq5h6paubqr684` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  CONSTRAINT `FKmpqxk5fdb5pw5vudj0aniue0k` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
INSERT INTO `lab_tests` VALUES (1,'Biochemistry','Routine lipid monitoring','2026-10-06 18:23:31.499853','NORMAL',NULL,'Total < 200 mg/dL, LDL < 130 mg/dL, HDL > 40 mg/dL','Normal lipid profile. Triglycerides well within desirable limits.','REQ-2026-1001','Total Cholesterol: 185 mg/dL, HDL: 48 mg/dL, LDL: 110 mg/dL, Triglycerides: 135 mg/dL',185,'Serum (Gold Top SST)',2800.00,'LAB-LIP','2026-10-06','Lipid Profile Panel','COMPLETED','mg/dL','ROUTINE',1,1,7,4),(2,'Biochemistry','Suspected Type 2 Diabetes & metabolic check','2026-10-12 14:35:15.081301','NORMAL',NULL,'70 - 99 mg/dL','','REQ-2026-1002','10x^u/L',NULL,'Fluoride Plasma (Grey Top)',650.00,'LAB-FBS','2026-10-06','Fasting Blood Sugar (FBS)','COMPLETED','mg/dL','ROUTINE',2,1,8,4),(3,'Hematology','Pre-operative screening workup',NULL,NULL,NULL,'WBC: 4.5-11.0, Hb: 13.5-17.5 g/dL',NULL,'REQ-2026-1003',NULL,NULL,'Whole Blood (EDTA Lavender Top)',1500.00,'LAB-FBC','2026-10-07','Full Blood Count (FBC) with ESR','CANCELLED','10^3/uL','ROUTINE',3,1,9,NULL),(4,'Biochemistry','Electrolyte and renal evaluation','2026-10-05 19:23:31.500021','NORMAL',NULL,'Creatinine: 0.7 - 1.2 mg/dL, eGFR > 90','Normal renal parameters. Preserved filtration capacity.','REQ-2026-1004','Serum Creatinine: 0.9 mg/dL, eGFR: 98 mL/min/1.73m²',0.9,'Serum (Gold Top SST)',1200.00,'LAB-KFT','2026-10-05','Serum Creatinine & Renal Profile','COMPLETED','mg/dL','ROUTINE',5,1,11,4),(5,'Biochemistry','Annual executive cardiovascular wellness screening','2026-10-06 17:23:31.500062','NORMAL',NULL,'Total < 200 mg/dL, LDL < 130 mg/dL, HDL > 40 mg/dL','Cardiac risk factors within normal clinical range. Annual review recommended.','REQ-2026-9091','Total Cholesterol: 192 mg/dL, HDL: 52 mg/dL, LDL: 114 mg/dL, Triglycerides: 130 mg/dL',192,'Serum (Gold Top SST)',2800.00,'LAB-LIP','2026-10-06','Lipid Profile Panel (Total, HDL, LDL, Triglycerides)','COMPLETED','mg/dL','ROUTINE',NULL,1,19,4),(6,'Hematology','Routine baseline hematology survey','2026-10-11 20:21:09.687760','NORMAL',NULL,'WBC: 4.5-11.0, Hb: 13.5-17.5 g/dL','','REQ-2026-9092','14 x10^3/uL',NULL,'Whole Blood (EDTA Lavender Top)',1500.00,'LAB-FBC','2026-10-06','Full Blood Count (FBC) with ESR','COMPLETED','10^3/uL','ROUTINE',NULL,1,19,4),(7,'Serology','Clinical Routine Assessment','2026-10-07 18:45:11.132970','NORMAL',9,'0.0 - 0.9 Index','','REQ-2026-3394','NS1: Negative | IgM: Negative | IgG: Negative',NULL,'Serum / Whole Blood',2900.00,'LAB-DENGUE','2026-10-07','Dengue NS1 Antigen & Antibody Rapid','COMPLETED','Index','URGENT',NULL,1,10,4),(8,'Hematology','Clinical Routine Assessment','2026-10-08 22:51:04.333775','ABNORMAL',1,'4.5 - 11.0 10^3/uL','wer','REQ-2026-1239','e',NULL,'Whole Blood (EDTA)',1500.00,'LAB-FBC','2026-10-08','Full Blood Count (FBC) with ESR','COMPLETED','10^3/uL','ROUTINE',NULL,1,22,4),(9,'Hematology','Patient initiated screening',NULL,NULL,1,'4.5 - 11.0 10^3/uL',NULL,'REQ-2026-1263',NULL,NULL,'Whole Blood (EDTA)',1500.00,'LAB-FBC','2026-10-08','Full Blood Count (FBC) with ESR','REQUESTED','10^3/uL','ROUTINE',NULL,1,7,NULL),(10,'Hematology','Clinical Routine Assessment','2026-10-11 13:01:24.033020','ABNORMAL',1,'4.5 - 11.0 10^3/uL','','REQ-2026-1151','12 10^3/uL',NULL,'Whole Blood (EDTA)',1500.00,'LAB-FBC','2026-10-11','Full Blood Count (FBC) with ESR','COMPLETED','10^3/uL','STAT',NULL,1,7,4),(11,'Hematology','Patient initiated screening',NULL,NULL,1,'4.5 - 11.0 10^3/uL',NULL,'REQ-2026-8694',NULL,NULL,'Whole Blood (EDTA)',1500.00,'LAB-FBC','2026-10-12','Full Blood Count (FBC) with ESR','REQUESTED','10^3/uL','ROUTINE',NULL,1,56,NULL),(12,'Hematology','Clinical Routine Assessment',NULL,NULL,1,'4.5 - 11.0 10^3/uL',NULL,'REQ-2026-9225',NULL,NULL,'Whole Blood (EDTA)',1500.00,'LAB-FBC','2026-10-12','Full Blood Count (FBC) with ESR','REQUESTED','10^3/uL','URGENT',NULL,1,8,NULL),(13,'Biochemistry','Ordered by Dr. Dr. Kavinda Rathnayaka: Full Blood Count (FBC) with ESR (ROUTINE)','2026-10-17 00:02:39.003513','NORMAL',NULL,'Standard reference interval','','REQ-2026-3954','8 x10^3/uL',NULL,'Venous Blood',1500.00,'LAB-GEN','2026-10-16','Diagnostic Pathology Investigation','COMPLETED',NULL,'ROUTINE',16,1,58,4),(14,'Biochemistry','Ordered by Dr. Dr. Kavinda Rathnayaka: Full Blood Count (FBC) with ESR (ROUTINE)','2026-10-17 00:22:18.559694','NORMAL',NULL,'Standard reference interval','','REQ-2026-3302','9 x10^3/uL',NULL,'Venous Blood',1500.00,'LAB-GEN','2026-10-16','Diagnostic Pathology Investigation','COMPLETED',NULL,'ROUTINE',17,1,58,4);
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` text COLLATE utf8mb4_unicode_ci,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Dear Kesaru Hasun,\n\nYour appointment has been confirmed.\n\nAppointment No: APT-1791770358901\nDoctor: Kavinda Rathnayaka\nDate: 2026-10-15\nTime: 11:00\n\nPlease arrive 15 minutes before your scheduled time.\n\nThank you,\nPulseOS Hospital Management System\n','APPOINTMENT_CREATED','kesaruhasun+patient@gmail.com','Kesaru Hasun','APT-1791770358901','SENT','PulseOS — Appointment Confirmed: APT-1791770358901','2026-10-12 07:29:18.908508'),(2,'Dear Nimal Perera,\n\nYour appointment has been confirmed.\n\nAppointment No: APT-1791792958194\nDoctor: Kavinda Lakshan\nDate: 2026-10-15\nTime: 14:30\n\nPlease arrive 15 minutes before your scheduled time.\n\nThank you,\nPulseOS Hospital Management System\n','APPOINTMENT_CREATED','chanulmalwatta@gmail.com','Nimal Perera','APT-1791792958194','SENT','PulseOS — Appointment Confirmed: APT-1791792958194','2026-10-12 13:45:58.200461'),(3,'Dear Nimal Perera,\n\nYour payment has been received successfully.\n\nInvoice: INV-2026-0001\nAmount: LKR 7890.00\nStatus: PAID\n\nThank you for choosing PulseOS Hospital.\n\nBest regards,\nPulseOS Billing Department\n','PAYMENT_CONFIRMED','chanulmalwatta@gmail.com','Nimal Perera','INV-2026-0001','SENT','PulseOS — Payment Receipt: INV-2026-0001','2026-10-12 13:52:17.588611'),(4,'Dear Pulara Thilakarathne,\n\nYour payment has been received successfully.\n\nInvoice: INV-1791794698822\nAmount: LKR 1500.00\nStatus: PAID\n\nThank you for choosing PulseOS Hospital.\n\nBest regards,\nPulseOS Billing Department\n','PAYMENT_CONFIRMED','pulara1805@gmail.com','Pulara Thilakarathne','INV-1791794698822','SENT','PulseOS — Payment Receipt: INV-1791794698822','2026-10-12 14:15:27.413656'),(5,'Dear Nimal Perera,\n\nYour appointment has been confirmed.\n\nAppointment No: APT-1791795170372\nDoctor: Kavinda Rathnayaka\nDate: 2026-10-16\nTime: 10:30\n\nPlease arrive 15 minutes before your scheduled time.\n\nThank you,\nPulseOS Hospital Management System\n','APPOINTMENT_CREATED','chanulmalwatta@gmail.com','Nimal Perera','APT-1791795170372','SENT','PulseOS — Appointment Confirmed: APT-1791795170372','2026-10-12 14:22:50.376738'),(6,'Dear kasun herath,\n\nYour appointment has been confirmed.\n\nAppointment No: APT-1792173905208\nDoctor: Kavinda Rathnayaka\nDate: 2026-10-23\nTime: 09:00\n\nPlease arrive 15 minutes before your scheduled time.\n\nThank you,\nPulseOS Hospital Management System\n','APPOINTMENT_CREATED','manetexts@gmail.com','kasun herath','APT-1792173905208','SENT','PulseOS — Appointment Confirmed: APT-1792173905208','2026-10-16 23:35:05.421197'),(7,'Dear kasun herath,\n\nYour appointment has been confirmed.\n\nAppointment No: APT-1792174227460\nDoctor: Kavinda Rathnayaka\nDate: 2026-10-24\nTime: 10:00\n\nPlease arrive 15 minutes before your scheduled time.\n\nThank you,\nPulseOS Hospital Management System\n','APPOINTMENT_CREATED','manetexts@gmail.com','kasun herath','APT-1792174227460','SENT','PulseOS — Appointment Confirmed: APT-1792174227460','2026-10-16 23:40:27.465593'),(8,'Dear Nimal Perera,\n\nYour appointment has been confirmed.\n\nAppointment No: APT-1792311989540\nDoctor: Kavinda Rathnayaka\nDate: 2026-10-20\nTime: 10:00\n\nPlease arrive 15 minutes before your scheduled time.\n\nThank you,\nPulseOS Hospital Management System\n','APPOINTMENT_CREATED','chanulmalwatta@gmail.com','Nimal Perera','APT-1792311989540','SENT','PulseOS — Appointment Confirmed: APT-1792311989540','2026-10-18 13:56:30.039167'),(9,'Dear Dr. Kavinda Lakshan,\n\nWelcome to the PulseOS Clinical Healthcare Network. Your physician profile and clinical credentials have been registered.\n\n== CLINICAL CREDENTIALS & ONBOARDING ==\nPhysician Name: Dr. Kavinda Lakshan\nMedical License No: 1234\nSpecialization: Cardiology\nConsultation Room: Suite 101\nConsultation Tariff: LKR 2500\n\n== PORTAL ACCESS CREDENTIALS ==\nPulseOS Portal URL: https://pulseos.tekkeys.com/login\nLogin Username / Email: lakshankavinda994@gmail.com\nTemporary Password: PulseDoc#6085\n\nSECURITY ADVISORY:\nFor hospital security compliance, please log in and change your temporary password immediately from your account profile settings.\n\nIf you require IT assistance or roster scheduling adjustments, please contact the Clinical Administration Office.\n\nWarm regards,\nPulseOS Hospital Administration & Clinical Directorate\n','DOCTOR_CREDENTIALS','lakshankavinda994@gmail.com','Dr. Kavinda Lakshan','1234','SENT','PulseOS — Medical Staff Credentialing & Portal Access','2026-10-11 21:47:33.504350'),(10,'Dear Dr. Kavinda Lakshan,\n\nWelcome to the PulseOS Clinical Healthcare Network. Your physician profile and clinical credentials have been registered.\n\n== CLINICAL CREDENTIALS & ONBOARDING ==\nPhysician Name: Dr. Kavinda Lakshan\nMedical License No: 1234\nSpecialization: Cardiology\nConsultation Room: Suite 101\nConsultation Tariff: LKR 2500\n\n== PORTAL ACCESS CREDENTIALS ==\nPulseOS Portal URL: https://pulseos.tekkeys.com/login\nLogin Username / Email: kavinda@gmail.com\nTemporary Password: PulseDoc#7750\n\nSECURITY ADVISORY:\nFor hospital security compliance, please log in and change your temporary password immediately from your account profile settings.\n\nIf you require IT assistance or roster scheduling adjustments, please contact the Clinical Administration Office.\n\nWarm regards,\nPulseOS Hospital Administration & Clinical Directorate\n','DOCTOR_CREDENTIALS','kavinda@gmail.com','Dr. Kavinda Lakshan','1234','SENT','PulseOS — Medical Staff Credentialing & Portal Access','2026-10-11 21:55:28.526277'),(11,'Dear Dr. now now,\n\nWelcome to the PulseOS Clinical Healthcare Network. Your physician profile and clinical credentials have been registered.\n\n== CLINICAL CREDENTIALS & ONBOARDING ==\nPhysician Name: Dr. now now\nMedical License No: 111\nSpecialization: Cardiology\nConsultation Room: Suite 102\nConsultation Tariff: LKR 2500\n\n== PORTAL ACCESS CREDENTIALS ==\nPulseOS Portal URL: https://pulseos.tekkeys.com/login\nLogin Username / Email: kavinda1lakshan2@gmail.com\nTemporary Password: PulseDoc#8198\n\nSECURITY ADVISORY:\nFor hospital security compliance, please log in and change your temporary password immediately from your account profile settings.\n\nIf you require IT assistance or roster scheduling adjustments, please contact the Clinical Administration Office.\n\nWarm regards,\nPulseOS Hospital Administration & Clinical Directorate\n','DOCTOR_CREDENTIALS','kavinda1lakshan2@gmail.com','Dr. now now','111','SENT','PulseOS — Medical Staff Credentialing & Portal Access','2026-10-12 14:15:12.234951');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_admissions`
--

DROP TABLE IF EXISTS `patient_admissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_admissions` (
  `admission_id` bigint NOT NULL AUTO_INCREMENT,
  `admission_date` datetime(6) NOT NULL,
  `bed_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discharge_date` datetime(6) DEFAULT NULL,
  `patient_id` bigint NOT NULL,
  `ward_id` bigint NOT NULL,
  PRIMARY KEY (`admission_id`),
  KEY `FKaa1acs5ftu14j8kgfvwl630gt` (`patient_id`),
  KEY `FK9e7sakowsseymahm1x04ma89m` (`ward_id`),
  CONSTRAINT `FK9e7sakowsseymahm1x04ma89m` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`ward_id`),
  CONSTRAINT `FKaa1acs5ftu14j8kgfvwl630gt` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_admissions`
--

LOCK TABLES `patient_admissions` WRITE;
/*!40000 ALTER TABLE `patient_admissions` DISABLE KEYS */;
INSERT INTO `patient_admissions` VALUES (1,'2026-10-04 19:23:30.384269','BED-04',NULL,9,1),(2,'2026-10-05 19:23:30.384343','CCU-02',NULL,13,2),(3,'2026-10-07 19:12:14.390890','BED-13','2026-10-18 13:57:38.196928',11,1);
/*!40000 ALTER TABLE `patient_admissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `blood_group` enum('AB_NEGATIVE','AB_POSITIVE','A_NEGATIVE','A_POSITIVE','B_NEGATIVE','B_POSITIVE','O_NEGATIVE','O_POSITIVE','UNKNOWN') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_archived` bit(1) NOT NULL,
  `medical_notes` text COLLATE utf8mb4_unicode_ci,
  `registration_date` date NOT NULL,
  `triage_priority` enum('EMERGENCY','ROUTINE','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`patient_id`),
  CONSTRAINT `FKh3eexyco9th1ca41hoekxs0sf` FOREIGN KEY (`patient_id`) REFERENCES `persons` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES ('None','O_POSITIVE','chanulmalwatta@gmail.com','Sunil Perera','+94779876543','Brother',_binary '\0',NULL,'2026-09-22','ROUTINE',7),('Penicillin, Aspirin','B_POSITIVE','sunethra.j@gmail.com','Sarath Jayawardena','+94718765432','Spouse',_binary '\0',NULL,'2026-09-11','URGENT',8),('Sulfa drugs','A_POSITIVE','kasun.w@gmail.com','Anura Wickramasinghe','+94787654321','Father',_binary '\0',NULL,'2026-10-06','EMERGENCY',9),('Ibuprofen','AB_POSITIVE','anula.r@gmail.com','Kamani Ratnayake','+94701234567','Daughter',_binary '\0',NULL,'2026-10-04','ROUTINE',10),('None','O_NEGATIVE','dilshan.f@gmail.com','Rohan Fernando','+94776543210','Brother',_binary '\0',NULL,'2026-09-16','URGENT',11),('None','A_NEGATIVE','sanduni.s@gmail.com','Champa Silva','+94761234567','Mother',_binary '\0',NULL,'2026-09-12','ROUTINE',12),('Latex','B_NEGATIVE','priyantha.k@gmail.com','Nayana Kumara','+94719876543','Spouse',_binary '\0',NULL,'2026-09-18','EMERGENCY',13),('Amoxicillin','O_POSITIVE','chathurika.m@gmail.com','Lal Mendis','+94751234567','Father',_binary '\0',NULL,'2026-09-24','ROUTINE',14),('Ciprofloxacin','AB_NEGATIVE','chaminda.b@gmail.com','Manel Bandara','+94723456789','Spouse',_binary '\0',NULL,'2026-09-30','URGENT',15),('None','B_POSITIVE','malini.d@gmail.com','Mohamed Rizwan','+94771239876','Spouse',_binary '\0',NULL,'2026-09-09','ROUTINE',16),('Codeine','A_POSITIVE','sarath.w@gmail.com','S. Shanmuganathan','+94719871234','Father',_binary '\0',NULL,'2026-10-03','URGENT',17),('None','O_POSITIVE','kumari.d@gmail.com','Sirisena Dissanayake','+94789012345','Father',_binary '\0',NULL,'2026-09-29','EMERGENCY',18),('None','O_POSITIVE','demo.patient@pulseos.lk','Nimal Perera','+94779876543','Brother',_binary '\0','Regular outpatient baseline consultation record.','2026-09-14','ROUTINE',19),('None','A_NEGATIVE','dulithmdivisekara@gmail.com','N/A','N/A','N/A',_binary '\0','','2026-10-06','ROUTINE',20),('None','AB_POSITIVE','yazimtariq@gmail.com','N/A','N/A','N/A',_binary '\0','','2026-10-06','ROUTINE',21),('None','AB_POSITIVE','dilmikashehan07@gmail.com','Anoma','0776564908','Mother',_binary '\0','','2026-10-06','ROUTINE',22),('None','O_POSITIVE','vinothranmika@gmail.com','N/A','N/A','N/A',_binary '\0','','2026-10-08','ROUTINE',24),('None','A_POSITIVE','kesaruhasun+patient@gmail.com','Tikiri','+94774608763','Mom',_binary '\0','','2026-10-12','ROUTINE',54),('None','B_POSITIVE','dilmikashehan18@gmail.com','chamind','0776564908','father',_binary '\0','','2026-10-12','ROUTINE',55),('None','O_POSITIVE','pulara1805@gmail.com','N/A','N/A','N/A',_binary '\0','','2026-10-12','ROUTINE',56),('None','B_POSITIVE','kasun45@gmail.com','N/A','N/A','N/A',_binary '\0','','2026-10-12','ROUTINE',58);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `amount_paid` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` datetime(6) NOT NULL,
  `payment_method` enum('BANK_TRANSFER','CARD','CASH','CREDIT_CARD','DEBIT_CARD','INSURANCE','PAYHERE_GATEWAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_id` bigint NOT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `UK_jwk4x78utnlycetjq9ulvm7tr` (`transaction_ref`),
  KEY `FKrbqec6be74wab8iifh8g3i50i` (`invoice_id`),
  CONSTRAINT `FKrbqec6be74wab8iifh8g3i50i` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,7890.00,'LKR','2026-10-06 18:33:31.798302','CASH','RCPT-2026-00891','SUCCESS','RCPT-2026-00891',1),(2,7890.00,'LKR','2026-10-08 21:18:16.812563','PAYHERE_GATEWAY','PH-RCP-1791474496902','SUCCESS','PH-INV-2026-0001-1791474496812',1),(3,1500.00,'LKR','2026-10-08 22:59:37.496497','CARD','RCP-1791480577496','SUCCESS','PAYHERE-SB-TEST-001',4),(4,110.00,'LKR','2026-10-11 10:24:25.136628','PAYHERE_GATEWAY','PH-RCP-1791694465144','SUCCESS','PH-INV-1791694326874-1791694465136',6),(5,8490.00,'LKR','2026-10-11 10:36:04.024253','CASH','RCP-1791695164024','SUCCESS','COUNTER-1791695163874',7),(6,110.00,'LKR','2026-10-11 21:00:09.981748','CARD','RCP-1791732609981','SUCCESS','PAYHERE-SB-VISA-609759',9),(7,110.00,'LKR','2026-10-12 07:11:27.801402','PAYHERE_GATEWAY','PH-RCP-1791769287803','SUCCESS','PH-INV-1791769134732-1791769287801',10),(9,7890.00,'LKR','2026-10-12 13:52:17.581570','PAYHERE_GATEWAY','PH-RCP-1791793337582','SUCCESS','PH-INV-2026-0001-1791793337581',1),(10,1500.00,'LKR','2026-10-12 14:15:27.407569','PAYHERE_GATEWAY','PH-RCP-1791794727407','SUCCESS','PH-INV-1791794698822-1791794727407',15),(11,7900.00,'LKR','2026-10-17 00:28:53.173960','CASH','RCP-1792177133173','SUCCESS','COUNTER-1792177132493',17);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_contacts`
--

DROP TABLE IF EXISTS `person_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_contacts` (
  `person_id` bigint NOT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`person_id`,`contact_number`),
  CONSTRAINT `FK29nrmysj85shhc8a2uqeiimxf` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_contacts`
--

LOCK TABLES `person_contacts` WRITE;
/*!40000 ALTER TABLE `person_contacts` DISABLE KEYS */;
INSERT INTO `person_contacts` VALUES (1,'+94112876543'),(1,'+94771239990'),(2,'+94718238190'),(3,'+94765008260'),(4,'+94773103363'),(5,'+94772103992'),(6,'+94719201620'),(7,'+94771234567'),(8,'+94712345678'),(9,'+94783456789'),(10,'+94704567890'),(11,'+94775678901'),(12,'+94766789012'),(13,'+94717890123'),(14,'+94758901234'),(15,'+94729012345'),(16,'+94770123456'),(17,'+94711234567'),(18,'+94782345678'),(19,'+94771234567'),(20,'077876234634'),(21,'0752939716'),(22,'0775772476'),(24,'0763643258'),(49,'0778762634'),(51,'0782631365'),(52,'0782631365'),(54,'0778762634'),(55,'0776564907'),(56,'0760514844'),(57,'1234567890'),(58,'0775768978');
/*!40000 ALTER TABLE `person_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `persons`
--

DROP TABLE IF EXISTS `persons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persons` (
  `person_type` varchar(31) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_id` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `date_of_birth` date NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('FEMALE','MALE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nic_passport_no` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`person_id`),
  UNIQUE KEY `UK_s4ysolw4e9vealwjvdwifpxc1` (`nic_passport_no`),
  UNIQUE KEY `uk_persons_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `persons`
--

LOCK TABLES `persons` WRITE;
/*!40000 ALTER TABLE `persons` DISABLE KEYS */;
INSERT INTO `persons` VALUES ('DOCTOR',1,'Colombo','2026-10-06 19:23:29.507691','1999-05-14','Kavinda','MALE','Rathnayaka','199912401829','it25103999@my.sliit.lk','$2a$10$IQ1AG.zuO07vPogJGblSfOnf9YmotQtLJ1nNjV8yrI4/OC5iiRmhC','10115','SLIIT Campus Road'),('RECEPTIONIST',2,'Kandy','2026-10-06 19:23:29.687251','2001-08-20','Dila','FEMALE','Somarathna','200165809124','it25100994@my.sliit.lk','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','20000','Peradeniya Road'),('PHARMACIST',3,'Colombo','2026-10-06 19:23:29.695948','2000-03-12','Harshika','FEMALE','Udumullage','200078403319','it25100826@my.sliit.lk','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','00300','Galle Road'),('LAB_TECHNICIAN',4,'Galle','2026-10-06 19:23:29.704747','2001-11-25','Nethuli','FEMALE','Thilakarathne','200155204481','it25103363@my.sliit.lk','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','80000','Wakwella Road'),('SYSTEM_ADMIN',5,'Malabe','2026-10-06 19:23:29.790877','2000-07-08','Kesaru','MALE','Dhanasinghe','200018902271','kesaruhasun@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','10115','New Kandy Road'),('RECEPTIONIST',6,'Nugegoda','2026-10-06 19:23:29.801815','2000-09-18','Chanul','MALE','Malwatta','200021405592','it25101620@my.sliit.lk','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','10250','High Level Road'),('PATIENT',7,'Colombo','2026-10-06 19:23:30.001338','1985-03-12','Nimal','MALE','Perera','198512304561','chanulmalwatta@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','00700','No. 15, Flower Road'),('PATIENT',8,'Kandy','2026-10-06 19:23:30.001467','1972-07-24','Sunethra','FEMALE','Jayawardena','197265408923','sunethra.j@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','20000','42 Hill Street'),('PATIENT',9,'Galle','2026-10-06 19:23:30.001757','1994-11-05','Kasun','MALE','Wickramasinghe','199423107845','kasun.w@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','80000','88 Beach Road'),('PATIENT',10,'Kurunegala','2026-10-06 19:23:30.001801','1965-02-18','Anula','FEMALE','Ratnayake','196589201234','anula.r@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','60000','12 Circular Road'),('PATIENT',11,'Negombo','2026-10-06 19:23:30.001957','1990-09-30','Dilshan','MALE','Fernando','199014506789','dilshan.f@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','11500','23 Main Street'),('PATIENT',12,'Malabe','2026-10-06 19:23:30.002002','2002-04-14','Sanduni','FEMALE','Silva','200278103456','sanduni.s@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','10115','55 Kaduwela Road'),('PATIENT',13,'Gampaha','2026-10-06 19:23:30.002045','1980-08-22','Priyantha','MALE','Kumara','198031209876','priyantha.k@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','11000','10 Station Road'),('PATIENT',14,'Panadura','2026-10-06 19:23:30.002088','1995-12-10','Chathurika','FEMALE','Mendis','199564208765','chathurika.m@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','12500','34 Cross Street'),('PATIENT',15,'Matara','2026-10-06 19:23:30.002129','1978-06-03','Chaminda','MALE','Bandara','197824105432','chaminda.b@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','81000','90 Beach Road'),('PATIENT',16,'Colombo','2026-10-06 19:23:30.002168','1988-10-15','Fathima','FEMALE','Rizwan','198875302198','malini.d@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','01000','17 Mosque Road'),('PATIENT',17,'Jaffna','2026-10-06 19:23:30.003880','1992-01-28','Ravi','MALE','Shanmuganathan','199219804321','sarath.w@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','40000','4 Hospital Road'),('PATIENT',18,'Badulla','2026-10-06 19:23:30.003978','2001-05-19','Niluka','FEMALE','Dissanayake','200181206543','kumari.d@gmail.com','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','90000','72 Passara Road'),('PATIENT',19,'Colombo 07','2026-10-06 19:23:30.004018','1990-05-12','Kasun','MALE','Perera','199012345678','demo.patient@pulseos.lk','$2a$10$PDpFqkPcJJ7sS5w1eqTD2ekdzBCwF7uhoFt1/BsCXO5WqI3CdQbUG','00700','No. 45, Temple Road'),('PATIENT',20,'Colombo','2026-10-06 22:00:54.533657','2026-10-01','Dulith','MALE','Divisekara','2000000000','dulithmdivisekara@gmail.com','Doti_123','10100','Wattegama Walawwa'),('PATIENT',21,'Colombo','2026-10-06 22:10:08.403094','2006-07-06','Rashid','MALE','Firdous','200619400176','yazimtariq@gmail.com','pass123','10100','Colombo'),('PATIENT',22,'Colombo','2026-10-06 22:13:28.507143','2004-09-18','Dila','MALE','Shehan','200408613000','dilmikashehan07@gmail.com','80328 598@Dila','10100','Aluthgama ,hapugasyaya ,mananwaththa ,mathale'),('PATIENT',24,'Colombo','2026-10-08 21:10:49.926426','2004-06-15','vinoth','MALE','perera','200427800761','vinothranmika@gmail.com','Vinoth7678','10100','202/2 ihalaibulgoda,ibulgod'),('DOCTOR',47,'Colombo','2026-10-11 20:07:14.629422','1985-01-01','Lalith','OTHER','Fernando','DOC-1791729434629','doc.1791729434629@pulseos.lk','$2a$10$defaultPulseOSDoctorPasswordHash',NULL,'Hospital Avenue'),('DOCTOR',48,'Colombo','2026-10-11 20:16:37.680761','1985-01-01','Ayesha','OTHER','Perera','DOC-1791729997680','dr.ayesha.perera@pulseos.lk','$2a$10$defaultPulseOSDoctorPasswordHash',NULL,'Hospital Avenue'),('DOCTOR',49,'Colombo','2026-10-11 20:24:17.781427','1985-01-01','Srya','OTHER','Kole','DOC-1791730457781','kesaru@tekkeys.com','$2a$10$defaultPulseOSDoctorPasswordHash',NULL,'Hospital Avenue'),('DOCTOR',51,'Colombo','2026-10-11 21:47:32.881513','1985-01-01','Kavinda','MALE','Lakshan','DOC-1791735452881','lakshankavinda994@gmail.com','$2a$10$qpproDVxc2aOw2zKo9mX1umjw6rE.tS/aBgbvgBuTZ42xEbB8.HDK',NULL,'Hospital Avenue'),('DOCTOR',52,'Colombo','2026-10-11 21:55:28.373824','1985-01-01','Kavinda','MALE','Lakshan','DOC-1791735928373','lakshan2kavinda1@gmail.com','$2a$10$.3mgyZMdV43VnNiSkA116.d8zpzLlr44llxPpPpQ7x01TdhsXcrZK',NULL,'Hospital Avenue'),('PATIENT',54,'Colombo','2026-10-12 06:55:34.625176','2004-12-01','Kesaru','MALE','Hasun','200433604583','kesaruhasun+patient@gmail.com','password123','10100','296/2 Nagahawatta, Meegoda'),('PATIENT',55,'Colombo','2026-10-12 14:05:58.729555','2026-10-12','chamar','FEMALE','sadaruwan','200408613789','dilmikashehan18@gmail.com','80328598@11','10100','aluthgama ,haugasyay ,mathale'),('PATIENT',56,'Colombo','2026-10-12 14:14:42.174500','2004-05-01','Pulara','FEMALE','Thilakarathne','200462201236','pulara1805@gmail.com','pulara##2','10100','Colombo'),('DOCTOR',57,'Colombo','2026-10-12 14:15:12.038884','1985-01-01','now','OTHER','now','DOC-1791794712038','kavinda1lakshan2@gmail.com','$2a$10$oDY3KdapcQFgn.Sq1pYMZuYvLcc5ADeSfPieRYcQ1C.HKjh4NpGOO',NULL,'Hospital Avenue'),('PATIENT',58,'Colombo','2026-10-12 14:28:23.868418','2026-10-12','kasun','FEMALE','herath','20060982001','manetexts@gmail.com','906756@d','10100','kaburupitiy,niyagal,panvila');
/*!40000 ALTER TABLE `persons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacists`
--

DROP TABLE IF EXISTS `pharmacists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacists` (
  `assigned_unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pharmacy_license_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `UK_dfia3qjgieb4s47yntb60t0n4` (`pharmacy_license_no`),
  CONSTRAINT `FKp7m8akq2xwa8vobqhvrgi6dxm` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacists`
--

LOCK TABLES `pharmacists` WRITE;
/*!40000 ALTER TABLE `pharmacists` DISABLE KEYS */;
INSERT INTO `pharmacists` VALUES ('Main Outpatient Dispensary','PHARM-7721',3);
/*!40000 ALTER TABLE `pharmacists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `dispensed_quantity` int DEFAULT NULL,
  `dosage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_days` int NOT NULL,
  `frequency` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructions` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_dispensed` bit(1) NOT NULL,
  `quantity` int NOT NULL,
  `drug_id` bigint NOT NULL,
  `prescription_id` bigint NOT NULL,
  PRIMARY KEY (`drug_id`,`prescription_id`),
  KEY `FK6uh7tdy2lv6sx34u1365acqsf` (`prescription_id`),
  CONSTRAINT `FK6uh7tdy2lv6sx34u1365acqsf` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`),
  CONSTRAINT `FKgpb69idyjpp6enuv5dubysnhb` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES (0,'500mg',5,'TDS','Take after meals with water',_binary '\0',15,3,16),(15,'500mg',5,'TDS','Take after meals with water',_binary '',15,3,18),(10,'500mg',5,'BD','Take as directed by consultant physician.',_binary '',10,5,14),(10,'500mg',5,'BD','Take as directed by consultant physician.',_binary '',10,5,15),(0,'500mg',5,'BD','Take as directed by consultant physician.',_binary '\0',10,5,19),(30,'5mg',30,'Once daily morning',NULL,_binary '',30,11,1),(30,'50mg',30,'Once daily',NULL,_binary '',30,12,2),(30,'20mg',30,'Once daily at bedtime',NULL,_binary '',30,14,1),(60,'500mg',30,'Twice daily with meals',NULL,_binary '',60,16,2);
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `prescription_id` bigint NOT NULL AUTO_INCREMENT,
  `doctor_instructions` text COLLATE utf8mb4_unicode_ci,
  `prescription_date` datetime(6) NOT NULL,
  `prescription_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`prescription_id`),
  KEY `FKe2fpvlkkcgcd40k4ufyyju2al` (`appointment_id`),
  KEY `FK24chc88e4so7cd6melh11rv6` (`doctor_id`),
  KEY `FKqydyol76jn1o37k1bdbkjgq74` (`patient_id`),
  CONSTRAINT `FK24chc88e4so7cd6melh11rv6` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`employee_id`),
  CONSTRAINT `FKe2fpvlkkcgcd40k4ufyyju2al` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `FKqydyol76jn1o37k1bdbkjgq74` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,'Take Atorvastatin at bedtime. Take Amlodipine in the morning after breakfast.','2026-10-06 17:23:30.905799',NULL,'DISPENSED',1,1,7),(2,'Avoid sodium intake. Take Losartan daily with breakfast.','2026-10-06 19:23:31.299469',NULL,'DISPENSED',2,1,8),(3,'Augmentin 625mg | 1 tab twice daily for 5 days','2026-10-07 19:13:15.013881','RX-1791380595013','DISPENSED',4,1,10),(4,'Concor 5mg | 1 tab twice daily for 5 days','2026-10-08 21:11:31.486715','RX-1791474091486','DISPENSED',2,1,8),(5,'Concor 5mg | 1 tab twice daily for 5 days','2026-10-10 19:40:33.290542','RX-1791641433290','DISPENSED',4,1,10),(6,'Glucophage 500mg | 1 tab twice daily for 5 days','2026-10-10 19:40:42.471931','RX-1791641442471','PENDING',5,1,11),(7,'Losec 20mg | 1 tab twice daily for 5 days','2026-10-10 19:40:56.240062','RX-1791641456240','DISPENSED',2,1,8),(8,'Glucophage 500mg | 1 tab twice daily for 5 days','2026-10-11 19:35:59.676146','RX-1791727559676','DISPENSED',4,1,10),(9,'Glucophage 500mg | 1 tab twice daily for 5 days','2026-10-11 19:36:06.265134','RX-1791727566265','PENDING',4,1,10),(10,'Panadol 500mg | 2 tab twice daily for 6 days','2026-10-11 19:36:34.953128','RX-1791727594953','PENDING',3,1,9),(11,'Panadol 500mg | 2 tab twice daily for 6 days','2026-10-11 19:36:37.301236','RX-1791727597301','PENDING',3,1,9),(12,'Concor 5mg | 1 tab twice daily for 7 days','2026-10-11 19:37:11.597115','RX-1791727631597','PENDING',1,1,7),(13,'Panadol 500mg | 1 tab twice daily for 5 days — Notes: After dinner','2026-10-12 06:58:38.950907','RX-1791768518950','DISPENSED',12,1,54),(14,'Augmentin 625mg | 1 tab twice daily for 5 days — Notes: After meals','2026-10-12 07:30:10.115693','RX-1791770410115','DISPENSED',13,1,54),(15,'Augmentin 625mg | 1 tab twice daily for 5 days','2026-10-16 23:51:44.019815','RX-1792174904019','DISPENSED',16,1,58),(16,'Evaluated for: Routine Consultation. Vital signs stable.','2026-10-17 00:17:02.606391','RX-1792176422606','PENDING',16,1,58),(17,'Panadol 500mg | 1 tab twice daily for 5 days','2026-10-17 00:21:04.897934','RX-1792176664897','PENDING',17,1,58),(18,'Evaluated for: Routine Consultation. Vital signs stable.','2026-10-17 00:21:31.704456','RX-1792176691704','DISPENSED',17,1,58),(19,'Augmentin 625mg | 1 tab twice daily for 5 days — Notes: take it before meals','2026-10-18 13:57:17.635238','RX-1792312037635','PENDING',7,1,7);
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_items` (
  `ordered_qty` int NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `drug_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`drug_id`,`order_id`),
  KEY `FKdlxkihwo0gv3ygmc02cgos2g4` (`order_id`),
  CONSTRAINT `FKdlxkihwo0gv3ygmc02cgos2g4` FOREIGN KEY (`order_id`) REFERENCES `purchase_orders` (`order_id`),
  CONSTRAINT `FKj5k8uknv11yhh06pehh6xwg0a` FOREIGN KEY (`drug_id`) REFERENCES `drugs` (`drug_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_items`
--

LOCK TABLES `purchase_order_items` WRITE;
/*!40000 ALTER TABLE `purchase_order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `order_id` bigint NOT NULL AUTO_INCREMENT,
  `delivery_status` enum('CANCELLED','DELIVERED','ORDERED','PENDING','SHIPPED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_date` date NOT NULL,
  `order_timestamp` datetime(6) NOT NULL,
  `total_cost` decimal(14,2) NOT NULL,
  `pharmacist_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `FK5oynsoo233pum6i41aw91pms7` (`pharmacist_id`),
  KEY `FKrpdasmb8y8xs5tiy4369xpinq` (`supplier_id`),
  CONSTRAINT `FK5oynsoo233pum6i41aw91pms7` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacists` (`employee_id`),
  CONSTRAINT `FKrpdasmb8y8xs5tiy4369xpinq` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receptionists`
--

DROP TABLE IF EXISTS `receptionists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receptionists` (
  `desk_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_block` enum('EVENING','MORNING','NIGHT','ROTATING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `FKp991i7g4v00nt1q3efskfnbd7` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receptionists`
--

LOCK TABLES `receptionists` WRITE;
/*!40000 ALTER TABLE `receptionists` DISABLE KEYS */;
INSERT INTO `receptionists` VALUES ('DESK-01','MORNING',2),('DESK-02','EVENING',6);
/*!40000 ALTER TABLE `receptionists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_phones`
--

DROP TABLE IF EXISTS `supplier_phones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_phones` (
  `supplier_id` bigint NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`supplier_id`,`phone_number`),
  CONSTRAINT `FKgu2ifoy0gm8fbss0fhfqgfcs3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_phones`
--

LOCK TABLES `supplier_phones` WRITE;
/*!40000 ALTER TABLE `supplier_phones` DISABLE KEYS */;
INSERT INTO `supplier_phones` VALUES (1,'+94112320356'),(2,'+94112636363'),(3,'+94114731731');
/*!40000 ALTER TABLE `supplier_phones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `street` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zip_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Colombo','orders@spc.gov.lk','No. 75, Sir Baron Jayathilake Mawatha','State Pharmaceuticals Corporation (SPC)','00100'),(2,'Ratmalana','supply@gsk.com.lk','121 Galle Road','GlaxoSmithKline Ceylon Ltd (GSK)','10390'),(3,'Colombo','distribution@hemas.com','Hemas House, Braybrooke Place','Hemas Pharmaceuticals (Pvt) Ltd','00200');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_admins`
--

DROP TABLE IF EXISTS `system_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_admins` (
  `admin_level` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `security_clearance` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` bigint NOT NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `FKhtruf3sfciy5xpy5sakstxkfj` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_admins`
--

LOCK TABLES `system_admins` WRITE;
/*!40000 ALTER TABLE `system_admins` DISABLE KEYS */;
INSERT INTO `system_admins` VALUES ('SUPER_ADMIN','TOP_SECRET',5);
/*!40000 ALTER TABLE `system_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `ward_id` bigint NOT NULL AUTO_INCREMENT,
  `bed_capacity` int NOT NULL,
  `current_occupancy` int NOT NULL,
  `ward_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_type` enum('GENERAL','ICU','ISOLATION','MATERNITY','PEDIATRIC','SURGICAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ward_id`),
  UNIQUE KEY `UK_2qo2a87fsr1o25txc2qen1l5r` (`ward_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wards`
--

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
INSERT INTO `wards` VALUES (1,20,12,'Surgical Ward A','SURGICAL'),(2,8,5,'Cardiology Care Unit (CCU)','ICU'),(3,15,8,'Pediatric Ward','PEDIATRIC'),(4,18,10,'Maternity Ward','MATERNITY'),(5,25,14,'General Medical Ward','GENERAL');
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-28 13:05:20
