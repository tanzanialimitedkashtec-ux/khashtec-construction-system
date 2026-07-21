-- KASHTEC Construction System - Database Backup
-- Generated: 2026-07-19T10:56:19.043Z
-- Database: railway
-- Host: interchange.proxy.rlwy.net

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table: accountants
-- ----------------------------
DROP TABLE IF EXISTS `accountants`;
CREATE TABLE `accountants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `department` enum('Finance','Accounting','Administration') DEFAULT 'Finance',
  `reporting_to` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `employment_type` enum('Full-Time','Part-Time','Contract','Intern') DEFAULT 'Full-Time',
  `professional_qualification` enum('CPA','ACCA','CIMA','Bachelor Degree','Diploma','Certificate') DEFAULT NULL,
  `years_of_experience` int DEFAULT '0',
  `additional_certifications` text,
  `status` enum('Active','Inactive','On Leave','Terminated') DEFAULT 'Active',
  `notes` text,
  `financial_reporting` json DEFAULT NULL,
  `bookkeeping` json DEFAULT NULL,
  `regulatory` json DEFAULT NULL,
  `system_access` json DEFAULT NULL,
  `role` varchar(50) DEFAULT 'Accountant',
  `submitted_by` int NOT NULL,
  `submitted_by_role` varchar(100) NOT NULL,
  `submitted_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_email` (`email`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_employment_type` (`employment_type`),
  KEY `idx_qualification` (`professional_qualification`),
  KEY `idx_submitted_by` (`submitted_by`),
  CONSTRAINT `accountants_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `accountants_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in accountants

-- ----------------------------
-- Table: admin_work
-- ----------------------------
DROP TABLE IF EXISTS `admin_work`;
CREATE TABLE `admin_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) DEFAULT 'ADMIN',
  `work_type` enum('Administrative Operations','Compliance Management','Staff Oversight','Policy Implementation','Document Management','Document Upload','Project Creation','Safety Policy Upload','Toolbox Meeting','PPE Issuance','Safety Violation','Inspection Report','Budget Management','Expense Report','Property Management','Client Registration','User Account Management','System Administration','Department Coordination') DEFAULT 'Administrative Operations',
  `work_title` varchar(255) NOT NULL,
  `work_description` text,
  `affected_department` varchar(100) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Rejected','Revision Requested') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department_code`),
  KEY `idx_work_type` (`work_type`),
  KEY `idx_affected_department` (`affected_department`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in admin_work

-- ----------------------------
-- Table: assets_equipment
-- ----------------------------
DROP TABLE IF EXISTS `assets_equipment`;
CREATE TABLE `assets_equipment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_code` varchar(50) NOT NULL,
  `asset_name` varchar(255) NOT NULL,
  `category` enum('IT Equipment','Office Equipment','Heavy Machinery','Vehicle','Tool','Furniture','Plant','Generator','Other') NOT NULL,
  `asset_type` varchar(100) DEFAULT NULL,
  `description` text,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `current_value` decimal(12,2) DEFAULT NULL,
  `depreciation_method` enum('Straight Line','Declining Balance','Units of Production','None') DEFAULT 'Straight Line',
  `useful_life_years` int DEFAULT NULL,
  `condition` enum('New','Good','Fair','Poor','Damaged') DEFAULT 'Good',
  `location` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` enum('Available','In Use','Maintenance','Retired','Lost') DEFAULT 'Available',
  `assigned_to` int DEFAULT NULL,
  `assigned_date` date DEFAULT NULL,
  `expected_return_date` date DEFAULT NULL,
  `actual_return_date` date DEFAULT NULL,
  `return_condition` enum('New','Good','Fair','Poor','Damaged') DEFAULT NULL,
  `supplier` varchar(255) DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `maintenance_schedule` json DEFAULT NULL,
  `maintenance_notes` text,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_code` (`asset_code`),
  KEY `created_by` (`created_by`),
  KEY `idx_asset_code` (`asset_code`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_department` (`department`),
  CONSTRAINT `assets_equipment_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_equipment_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in assets_equipment

-- ----------------------------
-- Table: attendance
-- ----------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `attendance_status` varchar(50) NOT NULL DEFAULT 'present',
  `department` varchar(100) DEFAULT NULL,
  `notes` text,
  `marked_by` varchar(255) DEFAULT NULL,
  `marked_by_role` varchar(100) DEFAULT NULL,
  `hours_worked` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_date` (`attendance_date`),
  KEY `idx_status` (`attendance_status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in attendance

-- ----------------------------
-- Table: audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `entity_name` varchar(255) DEFAULT NULL,
  `description` text,
  `performed_by` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in audit_logs

-- ----------------------------
-- Table: authentication
-- ----------------------------
DROP TABLE IF EXISTS `authentication`;
CREATE TABLE `authentication` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nav_access` varchar(255) DEFAULT 'All',
  `failed_attempts` int DEFAULT '0',
  `lockout_until` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `department_code` (`department_code`),
  KEY `idx_email` (`email`),
  KEY `idx_department_code` (`department_code`),
  KEY `idx_status` (`status`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=7938 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `authentication` (`id`, `department_code`, `email`, `password_hash`, `role`, `department_name`, `manager_name`, `status`, `last_login`, `login_attempts`, `locked_until`, `created_at`, `updated_at`, `nav_access`, `failed_attempts`, `lockout_until`) VALUES
(1, 'MD', 'kashtectz@gmail.com', '$2a$12$qYG1sFaEmkmYMaf3OtVG5.zGlLdH5dY9tfMApcsxWMHd6CZQyGHDG', 'Managing Director', 'Managing Director', 'K.M. kayungilo', 'Active', '2026-07-19 06:14:35', 0, NULL, '2026-06-01 09:34:26', '2026-07-19 06:14:35', NULL, 0, NULL),
(2, 'ADMIN', 'admin@kashtec.com', '$2a$12$u6PW.jhy0/RN6xCBD8IcAupzxxeogxf3sheaeQm1RUevCl.BStPmq', 'Director of Administration', 'Administration', 'Director of Administration', 'Active', '2026-07-16 07:00:43', 0, NULL, '2026-06-01 09:34:26', '2026-07-16 07:00:43', 'All', 0, NULL),
(3, 'HR', 'hr@manager0501', '$2a$12$kh/jJEXotTFazfPdDfvtUu/rTUoNzUulmo0gBxyMUznzl5Cnl.X1C', 'HR Manager', 'HR', 'HR Manager', 'Active', '2026-07-14 04:06:00', 0, NULL, '2026-06-01 09:34:26', '2026-07-14 04:06:00', 'All', 0, NULL),
(4, 'HSE', 'hse@manager0501', '$2a$12$Ju7KnyHUC7aYlQdPyygjPuly4JAxNkgau61OD0DBFo8Twk4YuadC2', 'HSE Manager', 'Health & Safety', 'HSE Manager', 'Active', '2026-07-15 00:58:36', 0, NULL, '2026-06-01 09:34:26', '2026-07-15 00:58:36', 'All', 0, NULL),
(5, 'FINANCE', 'finance@manager0501', '$2a$12$erijjsoL4iop4djBA3Y9q.czZCLC.SAwo43z1ajVq3PGk34jqkJsG', 'Finance Manager', 'Finance', 'farhaothman', 'Active', '2026-07-17 08:09:54', 0, NULL, '2026-06-01 09:34:26', '2026-07-18 18:41:58', NULL, 1, NULL),
(6, 'PROJECT', 'pm@manager0501', '$2a$12$hnIhglIHwfIkNjPZOIOEtO.YuCd3tNBxSL96wjgXJWiXTtHbhEwBq', 'Project Manager', 'Project', 'Technical12', 'Active', '2026-07-14 02:35:19', 0, NULL, '2026-06-01 09:34:26', '2026-07-15 00:20:41', NULL, 1, NULL),
(7, 'REALESTATE', 'realestate@manager0501', '$2a$12$5vKxkZPe9NixoVfGSWunh.LvUg8K5s6Y2JSVhQKEjaZNXM9M1g1fC', 'Real Estate Manager', 'Real Estate', 'Real Estate Manager', 'Active', '2026-07-17 04:32:42', 0, NULL, '2026-06-01 09:34:26', '2026-07-17 04:32:42', NULL, 0, NULL),
(8, 'ASSISTANT', 'assistant@kashtec.com', '$2a$12$b95IZ2AY.W5QCuRhVeMo.OB8jeAxyApJ4.7x.nPUXuA21QuS0Hw8W', 'Admin Assistant', 'Administration', 'Admin Assistant', 'Active', '2026-07-16 06:59:21', 0, NULL, '2026-06-01 09:34:26', '2026-07-19 06:57:53', NULL, 0, NULL),
(7662, 'DEPT-5548-4S7F', 'latifaidd20@gmail.com', '$2a$12$oNligfG64fKhHJxcuUhohOEe3pXvPTUBrfoIkQaE2P2MntGYKOAGC', 'HR Manager', 'HR', 'latifa', 'Active', '2026-07-19 06:57:54', 0, NULL, '2026-07-13 15:46:15', '2026-07-19 06:57:54', '[]', 0, NULL),
(7751, 'DEPT-8070-5DAD', 'chrispingolden@gmail.com', '$2a$12$pAQiuqohXAWgDRLAP0MGzufAGeJdr9EOHNdFfPteO/2hgHOIJ6D4C', 'Project Manager', 'Project', 'chrispin', 'Active', '2026-07-14 03:45:47', 0, NULL, '2026-07-14 03:45:18', '2026-07-14 03:45:47', NULL, 0, NULL),
(7816, 'DEPT-5353-G5CH', 'realestate@manager0502', '$2a$12$dsdqGqx2mk7ou0SNg2Ir8eT1gDhNlG05fUmJOqw/NxUCvzW6BgdiW', 'Real Estate Manager', 'Real Estate', 'chrispin', 'Active', '2026-07-15 01:32:42', 0, NULL, '2026-07-15 01:03:15', '2026-07-15 01:32:42', NULL, 0, NULL),
(7857, 'DEPT-MD', 'md@kashtec.com', '$2a$12$WVq.5CVVD6TNvpdwhlixE.KPbCi7mAUVfy1QPVRdZQ9Id7t9oLFDW', 'Managing Director', 'Managing Director', 'Managing Director', 'Active', NULL, 0, NULL, '2026-07-16 04:58:48', '2026-07-19 06:57:53', 'All', 0, NULL);

-- ----------------------------
-- Table: claims
-- ----------------------------
DROP TABLE IF EXISTS `claims`;
CREATE TABLE `claims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `claim_number` varchar(50) DEFAULT NULL,
  `claim_type` enum('Medical','Travel','Equipment','Damage','Overtime','Benefit','Other') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'TZS',
  `description` text NOT NULL,
  `incident_date` date DEFAULT NULL,
  `submission_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `supporting_documents` text,
  `status` enum('Pending','Under Review','Approved','Rejected','Paid') DEFAULT 'Pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_amount` decimal(12,2) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `claim_number` (`claim_number`),
  KEY `created_by` (`created_by`),
  KEY `idx_claim_number` (`claim_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_claim_type` (`claim_type`),
  KEY `idx_submission_date` (`submission_date`),
  CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in claims

-- ----------------------------
-- Table: claims_management
-- ----------------------------
DROP TABLE IF EXISTS `claims_management`;
CREATE TABLE `claims_management` (
  `id` int NOT NULL AUTO_INCREMENT,
  `claim_number` varchar(50) NOT NULL,
  `employee_id` int DEFAULT NULL,
  `claim_type` enum('Medical','Accident','Insurance','Workers Compensation','Other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `claim_date` date NOT NULL,
  `incident_date` date DEFAULT NULL,
  `incident_location` varchar(255) DEFAULT NULL,
  `amount_claimed` decimal(12,2) DEFAULT NULL,
  `amount_approved` decimal(12,2) DEFAULT NULL,
  `status` enum('Pending','Under Review','Approved','Rejected','Paid') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `supporting_documents` text,
  `witness_names` text,
  `approved_by` int DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `claim_number` (`claim_number`),
  KEY `approved_by` (`approved_by`),
  KEY `created_by` (`created_by`),
  KEY `idx_claim_number` (`claim_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_claim_type` (`claim_type`),
  KEY `idx_claim_date` (`claim_date`),
  CONSTRAINT `claims_management_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `claims_management_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `claims_management_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in claims_management

-- ----------------------------
-- Table: clients
-- ----------------------------
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(50) NOT NULL,
  `client_type` enum('individual','company','investor') NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `nida_number` varchar(50) NOT NULL,
  `tin_number` varchar(50) DEFAULT NULL,
  `physical_address` text NOT NULL,
  `property_interest` enum('residential','commercial','investment','agricultural') DEFAULT NULL,
  `budget_range` enum('below-50m','50m-100m','100m-500m','above-500m') DEFAULT NULL,
  `additional_notes` text,
  `registered_by` varchar(255) NOT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive','prospective') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  `profile_image_data` longblob,
  `profile_image_mime` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id` (`client_id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_client_type` (`client_type`),
  KEY `idx_status` (`status`),
  KEY `idx_registered_by` (`registered_by`),
  KEY `idx_registration_date` (`registration_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in clients

-- ----------------------------
-- Table: contracts
-- ----------------------------
DROP TABLE IF EXISTS `contracts`;
CREATE TABLE `contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `contract_type` enum('permanent','temporary','contract','probation','internship') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `salary` decimal(12,2) NOT NULL,
  `contract_status` enum('active','expired','terminated','renewed') DEFAULT 'active',
  `contract_terms` text,
  `contract_document` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_contract_type` (`contract_type`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_contract_status` (`contract_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4029 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in contracts

-- ----------------------------
-- Table: department_budgets
-- ----------------------------
DROP TABLE IF EXISTS `department_budgets`;
CREATE TABLE `department_budgets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` varchar(50) NOT NULL,
  `budget_period` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `salaries_wages` decimal(15,2) DEFAULT '0.00',
  `office_supplies` decimal(15,2) DEFAULT '0.00',
  `equipment_tools` decimal(15,2) DEFAULT '0.00',
  `training_development` decimal(15,2) DEFAULT '0.00',
  `travel_transport` decimal(15,2) DEFAULT '0.00',
  `miscellaneous` decimal(15,2) DEFAULT '0.00',
  `total_budget` decimal(15,2) NOT NULL,
  `budget_justification` text,
  `status` enum('Draft','Submitted','Under Review','Approved','Rejected') DEFAULT 'Draft',
  `created_by` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_department` (`department`),
  KEY `idx_period` (`budget_period`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in department_budgets

-- ----------------------------
-- Table: departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `manager_email` varchar(255) DEFAULT NULL,
  `description` text,
  `status` enum('Active','Inactive','Maintenance') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in departments

-- ----------------------------
-- Table: discipline_monitoring
-- ----------------------------
DROP TABLE IF EXISTS `discipline_monitoring`;
CREATE TABLE `discipline_monitoring` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_number` varchar(50) NOT NULL,
  `employee_id` int NOT NULL,
  `incident_type` enum('Absenteeism','Late Arrival','Misconduct','Policy Violation','Insubordination','Theft','Harassment','Safety Violation','Other') NOT NULL,
  `incident_date` datetime NOT NULL,
  `incident_location` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `severity` enum('Minor','Moderate','Major','Critical') NOT NULL,
  `reported_by` int NOT NULL,
  `witnesses` text,
  `evidence_documents` text,
  `status` enum('Open','Under Investigation','Closed','Appealed') DEFAULT 'Open',
  `disciplinary_action` enum('Warning','Written Warning','Suspension','Demotion','Termination','None','Other') DEFAULT 'None',
  `action_date` date DEFAULT NULL,
  `action_notes` text,
  `appeal_status` enum('None','Filed','Under Review','Approved','Rejected') DEFAULT 'None',
  `appeal_date` date DEFAULT NULL,
  `appeal_notes` text,
  `resolved_by` int DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_number` (`case_number`),
  KEY `idx_case_number` (`case_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_incident_type` (`incident_type`),
  KEY `idx_incident_date` (`incident_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in discipline_monitoring

-- ----------------------------
-- Table: discipline_records
-- ----------------------------
DROP TABLE IF EXISTS `discipline_records`;
CREATE TABLE `discipline_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `incident_date` date NOT NULL,
  `reported_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `incident_type` enum('Attendance Violation','Misconduct','Safety Breach','Harassment','Theft','Fraud','Conflict of Interest','Substance Abuse','Performance Issue','Other') NOT NULL,
  `severity` enum('Minor','Moderate','Major','Critical') DEFAULT 'Minor',
  `description` text NOT NULL,
  `witnesses` text,
  `evidence` text,
  `action_taken` enum('Verbal Warning','Written Warning','Suspension','Demotion','Termination','None','Other') DEFAULT 'None',
  `action_date` date DEFAULT NULL,
  `suspension_days` int DEFAULT '0',
  `reviewed_by` int DEFAULT NULL,
  `reviewer_comments` text,
  `follow_up_date` date DEFAULT NULL,
  `follow_up_status` enum('Pending','Completed','Overdue') DEFAULT 'Pending',
  `status` enum('Open','Closed','Under Review','Appealed') DEFAULT 'Open',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `created_by` (`created_by`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_incident_type` (`incident_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_incident_date` (`incident_date`),
  CONSTRAINT `discipline_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `discipline_records_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `discipline_records_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in discipline_records

-- ----------------------------
-- Table: documents
-- ----------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_data` longblob,
  `file_mime` varchar(100) DEFAULT NULL,
  `category` enum('Contract','Plan','Report','Invoice','Permit','Certificate','Other') DEFAULT 'Other',
  `project_id` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `status` enum('Draft','Pending','Approved','Rejected') DEFAULT 'Draft',
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_expiry_date` (`expiry_date`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in documents

-- ----------------------------
-- Table: drivers
-- ----------------------------
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `description` text,
  `years_of_experience` int DEFAULT NULL,
  `license_type` varchar(50) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `driver_status` enum('Active','Inactive','On Leave','Suspended') DEFAULT 'Active',
  `hire_date` date DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `assigned_vehicle` varchar(100) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `emergency_phone` varchar(50) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `nida_number` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `residential_address` text,
  `region` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_number` varchar(50) DEFAULT NULL,
  `emergency_relationship` varchar(50) DEFAULT NULL,
  `license_issue_date` date DEFAULT NULL,
  `license_expiry_date` date DEFAULT NULL,
  `employment_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `blood_group` varchar(10) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `bank_details` text,
  `medical_certificate` varchar(50) DEFAULT NULL,
  `medical_expiry_date` date DEFAULT NULL,
  `skills` text,
  `employment_history` text,
  `additional_notes` text,
  `passport_number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `driver_id` (`driver_id`),
  KEY `idx_driver_id` (`driver_id`),
  KEY `idx_driver_status` (`driver_status`),
  KEY `idx_license_type` (`license_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in drivers

-- ----------------------------
-- Table: employee_details
-- ----------------------------
DROP TABLE IF EXISTS `employee_details`;
CREATE TABLE `employee_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `gmail` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `nida` varchar(50) DEFAULT NULL,
  `passport` varchar(50) DEFAULT NULL,
  `contract_type` varchar(100) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `passport_image` varchar(255) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_image_data` longblob,
  `profile_image_mime` varchar(100) DEFAULT NULL,
  `cv_path` varchar(255) DEFAULT NULL,
  `cv_data` longblob,
  `cv_mime` varchar(100) DEFAULT NULL,
  `agreement_path` varchar(255) DEFAULT NULL,
  `agreement_data` longblob,
  `agreement_mime` varchar(100) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gmail` (`gmail`),
  UNIQUE KEY `nida` (`nida`),
  KEY `idx_gmail` (`gmail`),
  KEY `idx_nida` (`nida`),
  KEY `idx_employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `employee_details` (`id`, `employee_id`, `full_name`, `gmail`, `phone`, `nida`, `passport`, `contract_type`, `profile_image`, `passport_image`, `address`, `created_at`, `updated_at`, `profile_image_data`, `profile_image_mime`, `cv_path`, `cv_data`, `cv_mime`, `agreement_path`, `agreement_data`, `agreement_mime`, `notes`) VALUES
(1, 1, 'LATIFA IDD SHABAN', 'latifaidd20@gmail.com', '0617923048', '20010320338220000110', '', 'temporary', '', NULL, NULL, '2026-07-15 02:36:30', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, 'FARHA OTHMAN DUNGA', 'farhaothman74@gmail.com', '0625532986', '19970508151290000113', '', 'temporary', '', NULL, NULL, '2026-07-15 02:52:23', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, 'ZUBEDA KOMBO NOTI', 'zubedakombo083@gmail.com', '0782755255', '20050731121220000112', '', 'temporary', '', NULL, NULL, '2026-07-15 02:56:01', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 4, 'HAMIDA SELEMANI ISSA', 'hamidaselemani140@gmail.com', '0754517023', '19901204312010000313', '', 'temporary', '', NULL, NULL, '2026-07-15 03:02:48', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 5, 'MFAUME MOHAMED SENGE', 'mohamedmfaume@gmail.com', '0767821112', '19950806454380000321', '', 'temporary', '', NULL, NULL, '2026-07-16 05:03:06', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 7, 'ATHANAS KALIKITI DANIEL', 'akniel2606@gmail.com', '0622743828', '200000626451110000228', '', 'temporary', '', NULL, NULL, '2026-07-16 05:11:23', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 8, 'CELVIN KONGO STEVEN WARIOBA', 'celvins863@gmail.com', '0623956135', '19990217312010000124', '', 'temporary', '', NULL, NULL, '2026-07-16 05:52:45', '2026-07-16 07:31:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 10, 'brayan', 'bray@gmail.com', '0628701663', '1234567898765434567', '', 'temporary', '/api/profile-image/10', NULL, NULL, '2026-07-16 06:01:26', '2026-07-16 07:31:03', X'ffd8ffe000104a46494600010100000100010000ffdb0084000a0a0a0a0a0a0b0c0c0b0f100e100f16141313141622181a181a182233202520202520332d372c292c372d5140383840515e4f4a4f5e716565718f888fbbbbfb010a0a0a0a0a0a0b0c0c0b0f100e100f16141313141622181a181a182233202520202520332d372c292c372d5140383840515e4f4a4f5e716565718f888fbbbbfbffc20011080306040803012200021101031101ffc4003000000301010101000000000000000000000102030004050601010101010100000000000000000000000001020304ffda000c03010002100310000002f3c86cb11860acad8a662ad674a3368a18c36cb20337a254c156c22da541d093c75b8e03e9f449e9e278633a9d272bc22d6e6e8d271e98e5e42f771f5d869ed5ea852317b2d39e4aed9077689e5e3d5e97e03b0a4f69ebb715784ea2cf96511d2f8c8e89416a6fc9d44793d4f3b699d7de84958cf26a53658d222c3b61c810428a20d445a242edd35cdb657b73511992926040bb4d68aaf6e46c4cb640438338338410106b4bac4ede1eac5ece3a74dd790bdfc77071d11a1d759428caa52d36d0f1791b06ad40f9926602e294d3a011b11a4f2328daa4e00209baf92d27af8538e0285b5e564887473dd292acaa3e57a5e7ef4b8edd7eae2f579dd3e88f2ce66514995439f0ef6991842489e8c3a79bba7cc988fd33b666526de3ad0084bd4783d3f3f685a1ba693636303a5a373f42c35a4ce075286c2306006606a18850adabbd5f282464a50ecc5056863352ac2d7c8e4ea44216c0cd9268ed6ae6c8be8f0fa879dd5cbd5847a79d5af479cdede2dd5b39f30aed8857119c0a1d0657113149d5691a460e924c3ead8342b024a6cbba198085498950b2d11efc9d599d8c5791f11269da75c7cbdbe7eee527a5425c97442b2f7722be274204cbae0b68e667e4d86c767b73b6569c31d775af29d04ce27d3e676519f175a750a4f54c3a41e0979f5d6d968b009ad2acb2c1ac04e2d2a46063aa8caf899b24b5e579eaece9a87a39a8549e78a65a22a3cd576144a92d9065556cb30e6c8b815599c7476279e0eae1ed8ede2e9d979fdfc2dabeaee5d9d79e08de75e0d0c408699144050e0c639c7565c640c2d75ace902b5b3769032b528751d5818911baf8fb24f47cfaf1e5ea3f9344f4723e64bcdf5b82b8d9774d6c351e9e6ac763d1bcf0609122b4d079de871ed3d8f4b9eab9927ccbd65938ca79ef0eaac682d5f5fcaf5332fcd5e1cbd18c7cbd2899ba6993322664a378d2599654c5f080e0165374f2da0c5e60c1b546c4c3047cac3d2182301862263800d0e81a792d452d55f4f98e03d5c96646a9d9c3ef78443b38facece3eb3cd2c74bc3bab97a835960c1f137c2803856cd0c66f23623314036e57526e75b34a268afb003806d8a26115951a45c656da6c23bbabccf4f181cdd5c470634e9a93a10b5231dbdbe17661e8c70e739fa68871725cf6a87a16493e98f981d6fe674e014ae8980d5ae9f4490782ead659a81600c5898c6bad8f4f19c0bdbc9aa41b241d3a8e275adb24f4523817a23ba86ea48bad8bb596359ba60f301c438a83a2240686468d9152f26533fa0f1484e82c9ba1a2a307bb8bd8c006f3799b36d9e1b6aba5e202ac20ab1cd9b53cdc499c9c951813607469b687d27151e569b43ba2dcbe8f37279ccc9d876632bbc09d8c44a9a1d3cae9dfe72217f43cdbe57e5bf5e5e32da5d47d9f1fd2c3b39a9c9ce76f3df9a3854a7a2dd83622b8313cc2948235e1d198db188b5275c6948f5d5183c2818056b53cd8dd0d7e72295413b386e52b3ae1288edd3975bc9b5d953a5ebd06ccaa38397a50d018d95e6b4ad1b318b98435490d22d5d7c55ed389fbf9c940de5e0dd5cfa22b0b41d593a7b39b9b9b445b6ebd3d973e65d5cc301a6c3a6ea938dc52a569683a246d36a270133298951a4f653663cd2a79fd65156abc81e1b975759677e7664853453a39edceaf1e8c96bc6717a32851e7ece0d3d131a62049355b9fa509429cfd2f62cc48692b8b82c02d2d2f53b9c768b0e8547f3bd2e6dde404f4ab9f4238cb5e88f573cb61c995a17e6db7673f6e6d406c49cfa38777b7c8a4f75685352d585710ec21c69db58d52c5563a74cebd0bd889c04435f33935a5414b5572ad8bd3ceb9bd0793a6d8f4f413ca57351169999417c364f2dad6c510b4ca933c5765934dd286dad5752516a998a8e6956b3551b530201d5cde865a6dcd9bd01676ac4b6b34c2f99c6f46a95206d4a25a4eecdcfc25fcff0047934e35c3beabe80b71ca6abe1cb1bcf49727a1c7d2cdc3ec6d030f0a8ad49d22ea92c669d7c9d7006398d0b46de12cbd759b00606da522d988a574efe79ec37772f4e674586e77794fc9d4f49edad1358dd34188b32a4bb637adcd66394bb54928956ebf2caddf91abd8f252846a96b11429d11a89796e2c33cbbb2e0154d458d12955f2ecda007c3a179659d4c282279858032db3c753d34330999a7055402283ae0a8c777673b7037276f2518196ce94958c476c4ed4dcdc10f4fcfe8c08ae9e4ca7a10e6c6db6afacbe675739eaa53cee6e886e7dcbf3e4e95828d1c2e09ca3e5054c5ce8af1993b0f2d312c0f2e2578dd37a20b5ab9b22d6755e466daa8daf22d9f8713d9e28f3ad168fbb114c91e881aee5e7e9e51f19c0775b07a5e51b66946a4d515ce46baa68d4518a3de564e70d05e98d2616144a75f1f4e53e4f4f9a58ebb9c63368b93699a9b34dade81e3cbd389c69dfc31a3dfc762a67a45a3135bc955958c959981159580b8e0b3093a6735cad21a8624ec786e70f579e6d3ccebb660b406368c7229380702b3ce6cad4a194d8056c30eb898608c010d24c51a2f5d0d06c49adf983942be054de35cc8ced2d56bf37449d91e86e39f1c91e8db3ad3326b668e73d4c25c1c45e76869e9cd9249516768c8ba752ac4adf9fa65e56642d4e4b05746cf439f9bb7379ec93d4a5786b56b72f4e4c693c5c9527331eeae2de86af2c6dbd1ece3d1ebcb84a095044e1d3ce4f11a3d254204a8b49d454750622d00840762a06cc60c051b07620eee4eac23cce9b6c0d0c54076b70c5010c2e206c4506cca95b764d739e8d35ce3a4472cbbb1e52fabcf73c3ab2d676d9016528f2a511a911c46487135e548546554a944ea4e460394d56eae5ede64d49e65d5348b1ea4d014ea255aac734f6d126ebab496154e8e4a4583f3c842da92ab21af2bc4d24fa46a97add75af329d5c52ae2a57e3eda9e7d1e461baecec0db04200278690622b6c0254c8d821b6dad0db0010065a2156d98cad38652b58ec2502d65cb54c9a18a0a3b653b1932ba8183d0cd76a57ada50f9d54b352e7c4858101659650eb597cde6f6792e789976b19814a34a946369c2b0391ac6d1138aea4681975f2a4dd969bb0a727473d7963aa99b25d698bcdd82b8bbf9936943b38f6055b4db185c355d1048fd9c1d077f077f2e50bf3f4938f5ccbf561cede764034c97e6b2d789ec4f8b4f637068e06a4ba69da397a166469e649b3bc9cfaa88aae8a480854eb462170d85d851c4202349442a3147194ac282d498d2d81ce309d649e6c2312212034dd2d1a969a2ca42c1a8906b1060edab2b626b612c16a92f1f07b5cb73e791b5ccbae299b1338626a4acd23c9cca325638d0b2f464cf6e6e4787a1c55d8f0be06554d28c63a8be3f7f16f5d027739a7d93a8adf9eb6de9270ef5b6678d7ebe5aa5939a3a33532875cb9aba63d2d6b74c1f0a6599499d08b6517535764dcf7bc30f531e6c7d9d1f3cf49ca53a96679476b2f027acb5e5afa8a79a7d04ae2dd32964ae040c2b30d232ba22822a986855dab6c0dd3cf87a25961d145939c2b40c54621eabd53a3a12a21f4694cf362ed3a5638c29d8c76363849db5445923cae3f6bcb4961b58e8699269d128766382ab5179da92b1fbb5b8953a2117e4e8e53a63e7f4f47790fc8ad9b43e5fa5e468da2dd2d63a6968bad206d47d4f3ad876ee19c9d8dcbd24f93a63a7574cdf032a21137e6b7a2d0b65554b91a158d3a79f5dfa3a3d3c17d158c9c6c093254a6d80ad31d8630331ca908209c7a81e7727b64f19fd7d1e4f17d008f9a3e8f02202286d818b0a594186561bad3972d656ec8f54df9f4e99d96c1a538801054251037e327a678fa46ca6cc461b0c623009364f9bbe67ce2fa3e7334cad6512938664e8c1285724a21af41b87b38d6e2a716e5e7c94e86bf36af669c7d5e71aa1af3f8de3d85d2d5295a5a0acea47b78fbb26c871148b9cd7e66d1ae3a31626c908eae6e6eb5b739c6c32740ce4b87d0e1d2db9765ec295ed4a1a18a3d64743349e1d4eadb00e04c180760107003031d8071373f488f9be7fa1f01131c075c143818e36d81e8707ab371ec55cec2e360a23a6e5ed15e6f4371c773f2d54ca899d1eae2b9d74e5b5941b599949865b18c71d6dcb5b25f3ff49e024693b5cd119730df92b8b7096ca1269f4a5e46c5647ac7181b61e91ac33f33428c74d898d2b4e87643ab2e7876f35b5ab0c655d6924b32dafcdd5cb6fa41c610b73f4a653cab692a6dd1d316cba39d655d739d438ecac85bb6df2eb1b2a1d012893661494d82856330344101db1b6c6db070c1d94cca20f87eef31e00f47cf44c546d899594db63a3d2e0ee9d123719d2b67b11b30c1dab8d9f8f3513b1ae79da4668da665e8a250cd34b3a5e0e8e18ea456c90969d2a9e17bbe1dcf2d035cb63b1171d01d013cebaa72d155b348a188a7616f07096d130cb469b40706bbf1dc921d3e7d5d213d4e828610d5ed4e7e8e6d2d4e329d1d3e77a58193d0e57bca9a41e5b09d239fb7cde9d29afa4cb3e8e9b80ea92abec3539dd2b8ed4c0e025250e570da6c36521c982ea07c3515c90e570570291b21e0f3fd2f931c236a28c131c4eeeb85f3d22032d191c67461b0034d89c03bd0e44ea506d59699a564e693ceba6bc8e7653cfb6b3df314b991207f03d8f1ae71cd66561ce104015d2b03a83645ba4f454945742419c480be00a73ad29209d1d7c6f2f64da180e7d3e91d5fa2b9fa4ec1b8adcfa544ce8b83d3f5f0d703dfc9d365f8fa972e7b369790f54e928209dbb932f7ba1e95b9889692e8073d10af4b42d72c08026519132b30c8e518c0e01c460145caf2b0acc073580a508567697c9f3be8b86cf281c98111d57f37be6eb8a4d33c9d6ad0c74086ae8d164aa0ca999e54b0a58393b381114465bb2742a0ea444e9e5a6b3d44867cfe1b4b51996988841cccb4524436a80ea9a7695aad599493854b44946e774eee73cf975459ed938a19f525b372464aa28d4ebc9093a6bca15559682b2d84b74cbcb52c1e885a4cc766b0cf124b0a7e4ee5ae3c759df86de866c11b1c5bb165974c2a3e5366855250db581861b2e1b0c361831b15874ec8d0b4575238aba324c8206673cff27e8b90f135c491f4797aa6caed367651a69d364aeee2b9150e9e35cdf4025c93552870f6f2c465d5cf67176d38ee7b6be75f3ab866aea8f4f95ac731c73928e7126e1ad59563a0cdadd585e642562aad9a9715195b2c5c6b19e748d58f44afd7ce02d24cb352b672c8a55452425674a21c6665ad15451b29b539aba1f0839682ab6106b54e9d2238f5b68f94ef44a9438614209685715d96cc4606ca1d942c30d801f021642534c8d1a39214010c0469d4665c04c4a70f5f96aa70ceb1194a904af3e3b3d57e4ea96b86a48d9212fc5b3bf529e758ede2abeb1cf3b31e5dfaf95579bb28ccfab93d0b13c6e8e564bed88b6da11ca920fb418cc669d82ab85c758a715526c729ede40bce88a1a86cc252510ea9a3926608406b4d05a2273c46fcf42c6748ac292a2e2c0c443238dce6f4793a65a45c0ba18a653bd3604c36149c233132e08d82851e6ac15e33252958842439a550a42d4c0a2669928aca2b2b8402290e4bcdede15d869a38694b2546e2ef3614e9eacbcaaf5702da2d4b7923df28e56e8639bac127dbc143b013a9069b209f472ccf3166c662e97208f7167b0293bd891ea68f3e8876524994b88c1c0f1ac14205e94eb88f772b908d6759970b469aecc433b202b8c287081b102b3d00683386cd0091e0574d7975a3c3a67bbe6ea6919959b276a00e06060b0d40ec9860657cab3a91284206c4c40305a2b30c810a8ac44ae196c5acdc5218d40c79fc7d9c534841524346aa353d23496cf3a55b49b2e487a40e27922f4539ad63c29226ba535e95792e8451758e63c5a54bf375e79ad96593d9691c8bb9ba3aadcf446acb9726bf374edca7a79ca679e535c362f3a29bcfb311f30ca6335abc9d2b6498a8aaf7b54d932d3a21611a51c9526196ca11624f3eeb63a86373fa3c6297b907236ab42d5c3bbb1e6d274ce98a9ac308c439b13600403620d9804130203972e66624e9a2a26d629d83b30255817cc0c7118ec70f07a9e5cd22522b678d4aece26a24af5e30be937159685725394a4914e8f22cf55785d7a22f35e8af35737b6463ac4b929266f03a67a79ea0d5e553d2e14b1d31e94b20b65ca6ecab886b2b0ece539861bba8863be13a625ba61783cdd36b7cb9dba6c481baf2de3649b4ef03b395a5a71fa1c15cfd32bee2d00c9f66377f9dd16f427239d252a576daba55d673dce36d97cf656cd3b0006033abd65314a68696fb6ac41418ac19d1d55f6a0c32156c2833094a4a48364d43ad00642d3a0e3627e37b7e4cd4274459da38ecaf3d62843ace7d28bc86e90edcaf5d26043275482d51302cbba22529c32d72c4ac9413ba3f4c62475f9cb9338dd32c97e4795774f36110fb4e9e65b572eeb99cef98dd32e9caedd3cf4bd7c5d55cb0f4bc654cd24369eab5789a2f1cd5da98e2ae7e8b26dda357cbeb8f68a9d1ade05f4652727573f60db6d5db636d8db63834df35b0c660c1c615b658b4b31ab1b18172068c1d8d0c550ec065d8495252bd2142aad0b16d1796c028f447095641c1df05f1d5d1a59d663f47158ea7e6b4b57d31d4126b4501ca69e44381332f38dce4eb05d16283342b644a91d31ca3bf8e867d035fa6cf346074e893ad431265319a4d216d497a3ba0ba3f471f56abaea68397ae51e4c7bf9f1125b52d24da3d55f0a56095733c74987a0b07e8e6ae9db5ba36892a5f8e4ecd1b5bb6d5b6c6db1e662d9a7060b4e414a749c27a24abad912e547c9aaba6c3e526c405764c06154697595ec1cbd1250db4382837442c665032b04f2b9bd5f2a6d55c5445112bed781ed4df51834b19759b3845e4888ed6738ede84f365dde6673124681d6a4c93262c232dd05b4ed27a1e40dabd597b0e9e3f438353cd9db64ec5d2274d5eb1ac47aa153555e4b5b9af6d913a7769b6a92cd254874f52785bd2e388f54bd238419e6500a52e6d0d46e8b52ab7d36daddb61793b572e5b540db6d36d8db63cecad9b35be5e6ea354ca508d29800a98650eca17912f48d43b6b02d1000cd7657867436057514309700c356363004600a2f9bea417c95aa4dcd1f589d50b476ac767a75f4f35878d35ccdda7633435c9e0f40c799cbee85f16beaaa7907d5e74e467d9c8b25e20d3a911d32a39487b3949d9e6f6f6ee789bd2f3e047d3e5153ac107ebd941bd08d429d9b481e5a2f7a3cb4e626f0af4e6aa79dd4d1c47ba1992ef4e8b7ccaf6729ca2bd91cd7e7bd5db6d5db636d8db636d8db636d8db63cdcab9d59e144a10c60418600d8003c47c30762351283106c85635944db9ca3c6c51596c3811032ca292a8b8a92be42c5186181cbc3ebf24d7007655a6287d146b3959467553c949bea11c3d39bbae642fcf62e702eab10dd00827421ccd69ccc6eb66471fbbb53e73a3d2071caa305dd92e82bcd63d21e3dcbf6f8d63d45e3e92db6b611e8e693a635ad295203399d7cd7e357eb9d0db64db65db6371f669118eadb65db636d8db636d8db636d8db63ce70d9b9b1363850c05db0360007124ba05c30d447181882a3138d504acee382b630d80a5650fa80a63609d1254646090a104091eb27274d50948a67a1e513b346925a3ca92f67670d65eb3cf8e8443629764e7164b116989b3e455b02579eb3b3716b2f4e7e8b97875e3cc9fae8700eee0387adee793d1d686b791db1dc9e558f6a1c4876ee2c58abc3539fab4b9006c987d361b6c6db2edb1b6c6db1b6c6db1b6c6db1b6c6db1c2d8e693b191a266452db00620c0008d82e8e33abd86359cbb9980c393a87b4ec88acb4f9180a44a6d1a1520d9a554238895b6c0201460e08b481c5d1cd34ab51371d4b93375492bcc25195cc0e6f6d7ce367a2bc9d250aeb0e561816490aad88d88c8c161cfdd1b9af6fcff46f1eaf1d152bb31b8bd4d2f85d7e8739e1fa14a1ccacb932d905a256dbd67e5d9ee1f0ee7a8386e5c62269d427618cc15d22532329db1b6c6db1b6c6db1b6c721853369b6a008003a00201b614198c51c675719d0d83124e7694b12714bcad624eea4f3a428d94d238ec32a59b6c2ad313d4cb234d2619282324bcfbab35cd2be9ae4a04cda89656456169325118401b0cd3255b99ebadb9a91d0fccf65da46c70ad62a373c55f99ce3e88f0f4e7e95397a6e6fd7e2f44bea26b00accb6453ce6877082d336365e7e3318ec8f5f1d9c7d1cfde217433f05cedaf0e3d37f298f5779be80438133003291de18bee725f45c7db2f9eda99a632431b5453b001001b025490692b0d44719d5ec8d1949ca92957498e8bc3a2ccac05474261965d2ae1afcb53a0a9b08c0072876c00d811e9d2f03d44dcfa09d634e9322e2d128f6b1e327b6d35e2eece69a4d8cd00c2265d6b38c94a45a2f91c2f29d855928b291bcaf4f87598fabe5fa1be7db0ebe289d39fac1dbf3de81eb71f140f529e750ed55a03a22e5a37c73799ee63c1eeee438b97d0f26a1e8737a311e2f4d4f329d38516f3cefaf9d63d1af92a7b5bcab1ddb9ec1cd3014a833e3cdcf5cee5d1b26db010301a446040a0812cae3bab53ba94c8c824de72c1994b7573de88644d3755983a143205d1cabc5e9f281b2929a792810297431b49ac71b0254497555e8b029a93a1360a2a332a0b6155d93952bd4be5f374f9b9d750e632d9e0ebd3a6c31506555d67d6e5686b9f74f7a079fcfec44f1fb2f339387ad87e7ef81c9ea707a91ba38392bd49af590e86994d1a9cbc4e955b064095929cce71f99dfc90dd89d27370f7f01baa3da44554d979cec7e4b1d5b971dac367470c1c08030133280100c419d5c774a5848c1474273a24a9b62b685e9e744491ccb30446c40acb8a906c032cad970d8319811a4c05738c70a00e0b074c4019d1858821685879861dd094cad49e4fae63e42fd1c2bd2d06cefa9f99e5bacd6885dac5f42973dddfe5fac99f4ca21e538baa5d5622d24b6c7479bc8d55b47b7cd4bf7f8ddc7a9cfc28779f3e877ac2c387d60ea93ca61d18e55ec07870fa081c3d160412a0e2e7aad3762da27ab8a6db3adb60ed8c0e1559403630560d11c7757b158e02b2093694ad862948d4b156b023a93570a15b1315583456b1032ca17118e21054271ac704c142b9c46656401961a4d2a684ed2bb652758b9568da9b0c94d37a8fcffd3f9f1e2256759d2816526c316b71b1eef0f642393d5f1faecf4b938207b2de6f49d651ec95fcff00566bcbafa393cef23e8bce25d34c4797b780e7ee4ea5e65b79c7a15f33aa3da9f0f75933d589baf39d9b82c74657165707872ea7ab66c0cd846db1ac4136c80d94a2ce821ca2bcf2da93a23d11ec3b1165653996d29674d8cf372d49bd8518088ea0c09ceea25ea2b32a040be06b1043a662846b36c046292bbf2d4ba320f1d8d1722dc3012b304ee8369629483558a14a1950e7f9efaaf14f34d32cd9b01efd12f2f5315ad615b22d59dc7145fb0971fa9c64ba78bae5ebb6a8bd1a365b71dcace98f338faf50a53139f408e0bdc1c09a0bd9d3cee9ddd1e148fa54f27b0b25a82cadca71dc5ab65606384236344826db19594462a2ab2836caf68d92ac0d876c05602a51562ae9019496a41acb05615594036200e95a91c1b900c80a9d91189b41d936d8c7625ae92aad520234e9ab3628570e814381310438e0052310b637994e16b63b35a93a4d51e6e3956b19e6d73585b86c7af3ecebd013bf4e7c85ad2cfcbed997ece1f30faa5f07d33a537224eb414e519363859774e5f0e7dc8bd3a889e6f3d415e8ae214c0238597d2bf9cd1e96e0a59d7a582655ceb1d8d8e00200ac05565002852fcdd074aed666950c0832ba929da72a6384700768b9545c1040ad3a9a80981023b6361ac3860ed8c7636cc13b4b2c622bc82d505402ac90dd0ab27240ca11919c52541cade62aae0b5c30ef379aa3cde1d91ac6646b2b0abd9e725272767472d6aeb354e3ee56a970f54cb1e909c9cfd9e6cbd5d3c563be9e556cee787555f4d22e0e58f17a793e729edf388b54272e8e33873d4ea37c724a9c8bd7b931ec306cddb60e040a50d80082050c09f4c5ceb688ab9564019684dd61825562b6589675149c0c480826d884e3589065183959311820a8519a5660d586584e5b6279d256a735c6c5ac98ae591a080e8a5b72ccece3e749a59badb35a25cb9560ba34b464795995ac674647a49ec7268cf227a1cf1caad2d5f56be75d3874db3aadf8fa2b9f9e8dac749ae3c85f4f9153bf8ea7b89e2fa84dfab203cd13bf7374ae9d31cbe6fb9c09e5f60eaac498497403cfde862368367553cae5f6c04a022b7514301710023160b22dd3cbd2391cd65d5c094041b126b49aa31a13d4c4d6ca41d88db0361898a6129b21c09b62060e639030784ac54876508703b238092060c0e1eff2ce26e565ebd269b20ac2abaea065642ca65a3ca83bcdc67464728d6576e9998af47366479ba97474ba1c0b68b45a6d5d0154e9e8e2ba5807d49f37679e72b47ad6dd9cdce9ef9f95f417d8e6a5d38face3797dde5557ae36016009d1418e3919d31bb538ea9794495af383a36c28602ab0152883c5917a2dc4e96eae7e93432d58c2e876c0c703026c3046015d8db606d8d8e010c0c41887336005319534e862084a91c6318ed45908f9588fcff5715806d5d0f3d15dd526a20895586188233a34aef371de6c8e5715ede2e8b8e958d3327cde8c4e3b4f495f37d3b5d7807d4e3d073bcd7ab46f334b4df66f399b3ae2f523dba93e1f47cb4e7a1ec59d1e69dcde6f3afa1d3e354f51393a919d71408f433639f15c693598e7abe311ab60208200ad8504099c01948c711f1b88586a6c0830c61b4108e61b1b6c65186d2a0db631c44cd84ba9326c0e77594614062418a8ed279594b0a1c039ba7c2b22a5753593e8e3cd90bd3a9e2b014b4a83aa1348c34b421a0bab0ec8c36525fa79ad71500f2cad516ba673a6ac9ac803339bcfe7fb5b4f19fbb8ac6513d39fab8ed2d6bcfebd73f0f771aafa3c9d962cee891f37d1f3d63db1f50e41d7081d1e5d8f5f79b6ae9cb918e33436c0c7036c4ce586795400e02b6154e171c35e152af27b18114b940eac0ca49207416570620019842a85f47a85298a1d02d24214794aa7127504cca438809568c03292a1387ca796e6071eaf47270c5bae72d413186ee9a5749e16869b75cd71b5619b464695ca619e543a3a39ecc5176e795a8200d84b48574a4a9aa9af311a5a54e4f48d7cfbfafc3a90f5b86d51e450afea79be98d3e6468f376490f7caf7239fab1e227b9cebe5774bb8963a3acce8b830418e306c2e60ab9f09980a94d139b28db633cc97783d5da54428eb403e1330063818e1431016c09592235869a7bf194a26a058293470128e12ac1cae6c744e8a2dd4510de677785a89996c37e7f68e29740073325332520e9309d1cfd01efe1f42c0959aa557b2270f4b88e67763328cc62a79c7693140a6090a1049adce357ae33beaf2d3aa22b73db29727a3acf0e3eef0e9c5db2ebb79456529b4ba6ba1b1b918ea01b092bf242e6d2d5934b6d8d6071b1c638803845070a1d544ea2241d440d8cca47a409d6dc8f6746882ba44a6991ccf14130504f1413cb32ad01b30487a1cf84364a8940c2310312a16561529852794e0e523502907a3dcfe3cb2b2cec24f658b1b72199fa65e1b74505ea4a5991d04ece4ea83ce404b2d4e4fcd875e46c19c642d2a436421d9d7657845a6b169216f64e56d590ea89228d0bc9e8e3c8dddcba2dc259dcde7f4574804c40a1c578ca74f4dfa02999198033602bccd4982a36003900655c08809452694514a91b6c2ec073072ba42ada58a2a6862af589202724a87071cb8184639a14b28fa54566c02ad804aa674651e1fa3e3eb2485a1d1cfefc6f07b203a0ad74541b007c6398d830ee8c1956055f189bced4a0e290ef5c6bca7ee9e5c9668a7522264cfc86cec3cef25080ad802814995f02d1d5d724aeac1eea4b619423dbace21d32d58519435e27a778778376e21815c464d97050e5933e0ec5063800a2b0570065854a2918f4722f4b49d1ca3560c49e724cb6452718ec6230708adda3d118a4c4c44315ca5a6a963371cab28c40d95910538abce89da994a9d5ebcb8f37cfe893ea0ece7ebb18ec12a46652665619831a1689d4b3d2b38d6679da5e81b66e07135b03987563863e9ac79b6af9f27a3b93a30a8e77b1f1589db0a70ac60c07789ae94952d9af48239b4423d66bcf17e5d29e8703d7a9b87151b291b00ec29d909d83b636d942ec01b43eda80d8873ed2eaec17dac2bb0cdb036c98ec4f6cb9b6464da55b6ca92d9336d0c3652bb0e7619f6b176c30d86f076a81dac5bec7bdf37b4b59ed6755f6b1f6c63b145d863b0e7615360d760ed81d3b4afb6cd3b636d8db60ed904365e68ed197693aa9b658ed22a6d4db619b642bb297d8b0dba59cb6c3cc6db635d8aeda4ffc40002ffda000c030100020003000000215aad0fbf9f87a42a2dbf2ea9f7ff005ad6e20d41e7fe52737b00c272e422acdc125053dc8b184971ca103f0408a3a5bc0f04840f0af4a70f1b7d3c6fe2107b846b90775a72b0948dc2843d30b210bbd902f156bd5882611bb16395ab275a844dc4943eef844da2c301e2aa47c6b9d94e5922f9a74b4a11c53ada61a8c6015630599800c4418aa2f42090af7ff71f265babe6dcf4426512ebc3dc3646f2582e97b59295df1173a87243148f291c7b97d8b242690fb621fa82afd76356b3e902ec57df10cc812aac02204f882db0a1042246d4bee632dd6ad17215797b0527b63f51c58769f5dd1eae6683656c5b3ba3641946d6cbfdc588b045476a9eedd9e49ad4d25ec83d012cc15f864098f9fedf0d62a589126cd310c60752fb5199ebe2b3f9e488d588ea2c01bb753e187745c47f2fcd0729428cc1e2bfc12cf8a89d9e3b475b083ea9fdf2148412c60610d1e6d699656d6958239094470785880167055c254b3c46952fafd4b5e74739525617789ba584036ddbfb1f6db27bd0820190251850caf1edd483c4a3aace0c23dd2f4127c50e733f244e727263b7141474f32a3aedf6aef5a11754d2d15fd2ddcbb7a553a409213f4b8f070688bbf87778ee9566774177e3580c5f25f65679c4060c94f8d8b81ff25f6d318135ac09237ea4ce0a40b71d75b540acf5420fa896120c3793d947c174b835d1c0e49145c10e136cfb41dc04bf1f1daee242897cd0768d659607d25857dc520a1cc492526ea00efd329009f56bbab45ff171f3df9b3e70539f51368cecb5876621d9c0b285b260576a81f6604eb0b0c695b14f4439f215afc37aec53b76c6bb13e6ebf0f5a31feb3af1c898865df22f831374b684022a56126b81cf38be8b01ab4e73c83737219acf9d9fbc2a665b5d9e17112b60403d1b842ee882c3fab9aa35c8ccf28f138eb2d06ff007aad6893c71875ebe7f73ce18004114214f3c0ac6e58f3c6ae4e37c7c3a71d9a261163d7d4c3d0d775ab9ffcbf77ab36da3878cfb6dbc44c2c03c7dc040f428014110d00212d7954d4d3b0bb274fb44afa902205d308cc5fbbf0b05b6542fc9b7e6ce1f7bad7fde401bccec1c31bd313bc520410120db697f25dc54a683a07b7487aa49e10d0417af3497e83dcef8fb438490515ce739b461d41f3f4d730ef4527ff0077cbadcaf3fb59d4641edcc7d5ebed37ae551e9f9d343623445b9c02ab102ad4d9f21e19cd2a21785c37c75d6a86c3064c4b3db1eb2a36869199df1e96d85c690e35ae04133618b5b034b1792633801089275777e5fac39383bfa3b5d4984ec46c71975d70b40f2aa49d0b88e5bd7c44d3b4e54dbd8d156f02105dce74dabb2a0504cedacbec5be971dd46fc729b4e3b5b4115d771f7fa75a550d912294dc79839e20267b07858e883acd6e3230aa1b9f571096eaaacd8ef35d3992b304018830b4d032c0124061f87315d549816985bff00a2e28abf873a07b0aa845751b45a71919f6da1c22a4d727d62ac2194d780b3ee21560c11041f2b9c2ee176dcb08c52950b8a96566495c190f3270ba99424d01633277d882e02a9576b6595b8cf27b1a091469849f48b0e5e1469059f627a8e7716eb17844d128554f62b6d2b3a0080caf1bcbea6e33985717d3f8e6a194cbea580d7293d7fa1216e1cbd53937d09472b9c4ab138e2d02750896370a7741fb8cb97e7a4e3f9b6b8930dce91c3cf3cf173eec377b2aa6a0577b996c42faa1ead64b3da4f3c17dde99bca3c2a3e6cbd384b7dbb8f91dbcd99ac52e9d6e31ebcf3c2fb2c983d8bc708519ace05cfafba69e647353d912e1c8ea3c72748d0e25682f0e5372df05ac58291c5278173c988f3cf3dc2b8a7cba0f14adb446ad542ed2ebf97664bbb29fdd6d70752533a375481912eb7bd9ac1ed5ce16d47a6f3cf3cf3cf3c021b9628e5db8dab5218ae4989ec51e8e902ff0083695831ead51186ef02bc7abdfe6e838996150c37cb1b47cf3cf3cf3cf2df82cb23bf96b28e08a0ad742085bb01a557346f551136226f8e9c767d461d5cd344c1ee94c5b8be71f3cf3cf3cf3cf3cffe78f1b7b592b1da1273f69ca62d7f4ab4629f5b57f765b666bff7dbed23bcf7b486199278869696593bf9c30d3cf3cf37e302b6ae924215d2bd845ddaf87fe142777bdd1fec6aacdb68c3a1c08fef30f123ac1f91e3a06554945de73dfbb4dc702dda62ca9671abdf5e7595c97aa3a3def979bb6a446dfdb1d0ec019f396451a469a49d611c9c63aa81a37f5a7d3630d3cdc7f27e99799c47793a5d3743ab82304c1d80eb75ad8fdf2e02390025f516a3421d2faf377d4d0dd92910c8f7fd3e75541b8e2b717da5767d97e7584c838e091b8e6ae2a6814c61dfda5b4d0cbc18f41473b8ff00c48748e51f65d81b81d8e09aa570725820a1751b85971f9e0ab2d030e26e2be5ac964d0d4dd7fa3684945f0a5481c5d186637077a9bd5345997d20b1066730aa23fdf61f2eb5946ecba8df6792425bce0e36dba35bdecbdf76d8dda1d29af31886155e3a3341538182d15c416dbc18f2e29e1c7b4c59f0db216ab1fcde4574228f63d965d77741ec567d8cadfccfa1989edce00189040eca6f6b019b969722c7ff00e2cb66f54730efdc7781bba492a8e996b4d96576a64440de2487d15448d003a6471559be4846e5a1b01539ec26ff00e5001b18abfbf4da742c1dea4b69db2b69040159457b4b9999aa7058a8ee633a23cb19da63e036a727c332c70117072ba231f31430928ffa41f6f9f77cb200014a22aacd4927da58975979a692fa126a36989a6364bd1c8e72fb23a6c056066134c8113606dd96a29704476ea2f4bb6dbdc32ffc7987924626906b04d77fe93c650b53a8bce97fbdbd1811fe0ec2332d6087735301ebca8a9a69f26f17a518b134fb1cbf470e1379959e7da9e4aa9ba4bf0c8d93deb5c18717f9b943ed2f98b8dc40323b4cf0b20e2f2be6d335abcd479e53cf3ae96d5851681a7d843ea37148e5a709e41f3be388fd518f74669392c94c4b976d8003a15f59110a2b665950cdd57de4d5619dc85aeb5961a4383ea2471e80a19e24c374fb8ed35c59c8c35985cd0ed5eec43b0eec14504559d16bf1ee23cfeebaf3cc0e82a25b79451a59864c30c8164a099e537d375884b278c91d80d33090df91eda30d04594a10e740827c91a278400a31c37d11e4c7a8e9bb9bf3135e62e775d36f3c186d2dd49e3daf3479c529293e32e1ff00d28cfa28f6973c38ef2f338201941f645b67ce5d72a2bcdc800ba1673cb77936df4e40c5496dd681fd4100f12b6a23b94e7a28bdf7df007fc800721f2086172189c06389efa1f5d022700fbf7df0df75d87d83d05e7bf83f0c087c0017bf8dd8400fffc40002ffda000c03010002000300000010891c67cb8c85dc3fccb7831a54d64402b7b5f93c10fd33205f7546adedd91017baf464cce9d58c1d86ac393c47c8ead53c82a38466fb99a0ae211710141f20ff008c85db895d431ad3f2f310610001588dc0ebd2054249caa6353cc426e06ae026c3e67dc31fe3618b5f5b731b63185dceca81b2e0bc20ddd8dd4c264f1cba9b7f7b84b72320a54ba880fdf6bfd9ae66ba95909e28963e584cde0382c5fe9c9aaf988facd0080e9fd014cdebba6d2f7b5fe4dc27c93d3770a7b8090d378eca84ecee9ff212ecf44863b64a7e6519c1a4df03b33c09462738997c043dde674f726c06bab2fc12035490a98ea4074e7b978f861971322f3d1a05fb8fd90213dee41b2bf837e56e4db77a101a1220a899fc5cc33cabd7ad9005fa43ad71ba1df05ce02186c5afd28061fe65267371bf76b6d4d49a7382bf7bca7abed938700f705f367bdb1c453aea242ef9478a891cf84a514b92e196935616cd951e421ee58f89e221373f9370066d30474338799c953696f62b97f1be38a0a74c90a7c4ff007cdd89559f09b77042cd66ba6769bb7f06ce3a72baacc0b9eff514328bd0eb9e7a1f4143098a4d1baddb77ba2be7b981ab47e091a23b873e6ac3b24b62d6c152c9474d01724940e37aa68bdcf0cbbe2dba0d5dacff0031e89cc8bf9a014c71c9898db68b65733d186e3b2cde433a393431403322f0f2b5ad1693e134275ae58aa066796c3736dd0d0dcb29cf4cb61fa264e83332307657311c93bb5cf55b32be99a00aa5c1b8c97657c3d8c50962b91254b99aa65150a24df32d2e123973e6788c9d80236c71e14b43d03f78c38c3adc8b35b36cb6ee25fec50fc0b84d0bf449924165fd7da27a07f95f4220a6b03e90f3a469c3dbe54397a6249e5264c7653279fb0a2847d3cbe25d13f477d7e6e6d7cf481c13bfcf33688c3afdcef27ecfef557b68a5273cbe03af27c9f745dbdcc7e9e7a5f579d6a955137d1f59df0dccbb861bc5d162e51640994fba958fc1311311dcab74c59bc1acd41d2fcd1193b361431c66a45b45f124b6c1e1ff00adf855969027a2b37bc4a7d464911335daeadd10d5dafd7d57de9c7b9103e597ea289db37a9eee8608e17508749248ceb6ddd72e90c6c1c0d106cb275694dc5ac8aa9da6a6ce32ecf9614db29dd2d021d72de361f7773ae9d56a0b8b8b1b9265572b929eb3a8b3b7e3b7d8e90faf4e212675bd5f6568ff001e926171acc257ee8e10223b354c03d60f0b4a0d4865c654633889fad59150cda935788ce5be3703e77f52ba2694829d0270f4a29569ad22eede7b59c8600349f7baf33e2b7944f3ee1c26172e35fd2fa3b32ab85792b8effe291e26456c04cad7d383a0d3c8528a47e2acdfdde7d80fe8b4db2f9475961143ec1abeea3d2f797d5311f40318e53a94ae0ab8a0f8f9152d690ca6151284ed04ceeaa0e82c1e4b0d9738664f45517505860db4a745f2a850615c3b6527f9e329484d2fc67e21b2402088b615abef504e28b59bad5d2f91f032e060b2977c4225941804b27127166bd2cdd7c1c05a49ae8e464faf429031e4233b78ea0639d703bad20f0ae57cf6455f506672fb7ed865f7c52ba75d7ba91f2171d6b47286da64bf160f1ab7c4506f337e5cd2cf48cee919cb21020eaa9a18f6b0797cc045782ddd6027c6b89e335f7eb17903c167ddf2fee9e5a065fe4f8f91a94c76cf25fdeaf5adcc031f3528c0000001c9abf745c3d8100bbd9aadbb9a9a4e5dd2d43af47467eb92582e792ac218e7d9763d453950df8632bf7676ea5aa30000054c33373b1d860849f85a244d64784ff3771b0a8523799dd57c4a166c8ff46f6ad9b5718ae29ec83a6370df800aa600001383d3f88d5c2efa37c81ae263b0eea7b7961706d1761539a7c6c303502db27dbd52a95fed54fa353836b5800000000000f2f8fb9fdb18a36dfec7768baaa3a9b10e81395dc9637e1d0a6f076bd46ad748994944dc1958b2c40427d400000000000278dbcef47c7f4ca64b5e43f5e1eb58f966458c055101ff00df675e7e24d69aea8bc5deb23192e547c1cd000000000000000c07ae51703832e91236f795159a99d0a958ee5f1c15be53e7ba3106ef9a0bc0648f7cb140cd56afdaeda94f20c2000000081309d5107af3f55912b69dce15cfbfa0b75cbdc59a59e61ead85a68b6e9fee0b7c43a14c21c59ef2166b280a38efb1ccb0b7fbf5a2dfbada60bb563d9f96f4291eb19d1f1cb7abcd052d155500ed29491ee0410a51b9ccae9df0a0bcdf188b9e300893c23ee76302af949536112449724a3ff2ed51b0091003ca13239c5236df67a3bfb8703f4ef27cbf7742403953d7acdfe37f87bb8ea97b4d1c80cb9582fd17a143038668075943f9f583c3935358056a04089a9caa5cdb5094347f16bceb80ec87df7c667e78f59e5151b8a640e3e07e3527b89586095fd71f5c8ffdbad92f1d31a9525ac0cb71cfb300bdd2516e7f17418dba23895b037c2cd9a62b144416ee8a8d32b67bccd4bd08515231683cb9c2c9b45537ff002ccddf710ebda795579106faf6516fd18bc8b7959e60d64bb1f6651e1f07713f65e93f4f61607b00f67cdc3ed7a597996a5730f4e1f1fee2c9d7dd22ff001b370edd1e9c8e5fca0eda8470ba75a3b6076681e5eea4e1d534c7d8a72b803a05d91fd8aceacdbfa5133a2759f19b3cd03475f21c9b78d0f900886f993815b51ec8bfbada808cf8e4742b269bb40cfc685aab359626ad8dd0c0ca3f5ce81655a081dc81e531c49f5902629a7695118954b38d8e4be147155a4916a71f00759168b2456f4b1b39cab6d8edbd958fcf82be7d30834f1c387c4cc5f77347e2ca74db86d0aa593d42265477e490aeb1b95ba10803b06cfc819cb997a26b00ad8d93cec28f39809ccbe7e5c0e01f3e4547a2a68114d8b0fae1ab1d411aa993713272b5bf32c5c8840f77d5b2193b782f1e5a287a46ac4c63c8188dfa10ccfb6c13c223daac3f663dd58b9c4d14be93b621ab2d9f8a15ec662a5e53b7535783996b954ec2b85772433855d303566f7be59d4b3c31440c2623a919555166bc3ae62b6d31ae829404b98857ac977fda328e1f37fee9db106d0c320c03c459553e2b41b457eefed366afd200e74d25da457ffba83859e46a33ff000cc9765da7d2e41e2a3e9d9f473684dcc2922171508442f3a67ccf9e51577608edd212e71aa3b37a53be58c83d5eb9e56f7fe8eb9fcaf7ccb2a031e213d1aa38cc44475db06efe080df12932ae2bedf3a0cb68eadc729a4c762aef057a2793ebcdcafc6e38284abd983bd986ad30cdfc87b0f3c8037ff79d8a00607200fe0c305f7c076309e88184101c05e0007be05d8df763fe2fa1f7cfa10c00c1821720f1c0fd0fffc4002e1100020201040104030101000104030000000102110310122131410420225113306132718114233352344291ffda0008010201013f006e8ec69243f26395a4b472a3b9128a43426d10958d5b5acea0a53f09156f931fc571d12addc18a5cff00d32a942777d3e0c191e5c71952bf234df92292949333cd3cb249f08b85bbe89e455b62aa27a7c0b2f2fa1fa3f4fba2f6f289c5cb1ca3174dc5a44bd2e7c76e50a4764571fc1cea4992c2e4d3aafe9960a1cc656ada3d1cd4ae2fb4b8252a5628d243b37dae3b22a9694db121da5c2b23bb73ddac90c455aa2a8458d8a57ac893a64646e370ddf424ca48e9b211a6d8c9c9d8a4dd33969f2465449d98d7c8ad73a72c334bba31c3773e1764a492a89231cbe48ceae768f449c71bb5dbd3d6ce7049c2ee5c106ee8bb6423be7187db3163fc78e31be914f75d97c1eaf347243645f37c8b1be1cba1cf7e4497f94c93bb259a734937d18d5ae7cf47a45153fe9b6e49e9cd928b524e3d89b6b955a5e8e718f6c7971a7646519ab4f56ed885a355d0e499765b175c8df1a644fb2258dd3e4ae46f6ab37da4c4d313a13e0cb1e5c9113724a87de91549177ac999a315093ae6869d1e0714a09a3d238ce1d74708ddf251a7d7665a70bfae48c7d3e194b23e5b36fa46e5536ad0a32c192327e3a317e5cff3df4ac64a1bdd39492fa17a6c70e5ae119a76a54b830e272f9b27867da8ba64fd2bc705293e5be11496380be34d7627693d65dc3fe8f485b93637d92e3b1294dba30e370bb7debb2bce8b466c9589bba2cef4ae0963dd8f694b04e29eea64e29ab5d97a648ef8d0e3f04978211a46d4326d53168b9a428a8bb13ddecee7ff00119d378e492b3141dab44f039476c52eca4a0a27a54e193f8d0d5a29195b58e75dd3252b542b64f746318cfbab47a173526ab8631e5b7c227926e1357da671254cc1083c6ad72d7641ec547aaf9462ff00a2dce0e5e118313ccae4ea28e952e8e84ed13e9d782ed59bb4b4dd599a0e4951860e3157edaf658a2ed8fa2d23b45d222ed1955c52259bf1d27cb44b3ce2a2f8f973d09d92135ab64d71a6da8d906397822d571a5e8955d0a59632f97284ae4d9d36648ed9bfef261bfcc97f473845d4a6931f2ad313964748f53e971c56e53516c8a5bbfe26cc996595a94bb4a8c3b70fa78cfbb47e79395d21ed69cba7f42eccbe95a96e8bf8b21b938a574512f8ce9f298f0c250d95484a38e292e1237596f83a25926b2cea4fb663cbbe1b1f0cdee12517e4cb394322b7c129476ee8d7fe087abe529221923216685f629c5ba4c94947b18b5dc58bb6c97d91a714ed11284a8f5599628afb7d18314f3cdb6f8f2c9c71b69574a85c0d8c8c932c6e936c72dc452b1d344550e2d7241793d4ce58f14a51ecc19f2a95cb24b6ff0079149495a7c31ba2da6e90b2ed7b5e928a92a663c318b72f2cf558bf2e45b271dd5cab166c9e9aa12e576cc728ce11947a6acf5ca32845a926d3e79141b4dc7e8c3084b2253b488ac7f8b670e29512d89bda9d0c4d0eeb926da37bfb639b9b56ff0096429c534d3277bba145d723b8ab372ab667f5189b6a304ddf6cc4fe51b5fd67a84ff252f28e6dd973c50528becf4f8f1fa8f93e1a7ca46c8b5ca1c126ea5c1174c9b8c9464df084fe9da22f46c538cad26264796cdad89d3a22ed086e91930e4cf9ddda4aad908471c146287076f56b822a8dc648b9a4a22c54a28714b93bd3b4396c8da4d8e7ea32e58c27d3f1467f4ea1152af342538414887cd26dbeb96272ddb5be2fb32421269d725313ed793239fe1938ff00aa2ff1f2dbde646fd4e1524be50e2497947a57925e92708f77c13c7922ea51688e3a85a92e518e504dee85b31422f14d41be7ec58669f265f8b490a1270735e191a9616dbaa253b22de9e9a6d4abc32d163e51eaa724947c18304b2cafa8aed98a9e6ca7accb25b71a5ff5917c1860b2cb637da3d37a79e0591c9ab7c2a1c94e2e29d3322945d11656ee2e887c6549f05d11926913c90a714ac8c7ca4724093a4c50b69fd096d16556edf22fb7ae475212a12b63455691ad1d35c89a2c8f2f5f5339a85455d98d4da4a6f91277b53e04941704dec7ba9ed6c966c6a176931c53dafc19a4e38a6d76a2cc71964df4aea2d9e864e3ea12f124d3124ba47abcdf925b62fe28dcd189a552a4ff008cf4b92f742bfa5593c2a744316d8d22783741c57167fe8649f6658471b492e6b939b314a31946fab134d5a676f49c14a74d0924a8c7e9d63c929ddd9eae9b4f6f0909b723d27a79c24f24f8e2921c5cbc9c62b72fa2792591f3d78445255b89cd107294b845b6c5f42c4d493bb435f489776c548645d37ff49489bdb962ff008c836d2bd5ed7dd1b8f8a6dd8e4293b1316894a4edbf238c6ba1210f928cf2cf2c93b52a4cf4d393bbe63f6fc10517ca7c11fc9ba7696df066c9f8e1d129bc8b9ecf4d965286c92e970cabf8b3161c7893d91abec87a4c50cbf923ff0084768c9e921084da6db2186599ed8f8e4c3e8f26d95aa661f4eb1f3e44bdb3c30c8eda32fa3a8b711636ed5d35f66084b1c29b2e852649b528b13b4659a84252fa20e3eaa0e175247a7f44e13939f8e87371b4d5ff004535564e2a71a6658ac527c0ae52d239651b492e44da5695b44656f495a3c7649b87f44f711ff5244ba27556c87a98538ca3ca7d8fd463526aa4d09c5edeedaba628afa1b62c7b96e3278da995b7bece3c155c97c098dd220ed7b24ec586094d2e37118a8d2436e9d3e68961cb7737c7db63c1bd41c198e3b229157ece08c231ff00292d6cbf62d32fa684edf4c58da5c9b551546431be28f52bff0069989ca392325da7a6568fcdb528bea87ead2e2289cdce56cc3869393ee844255688a4e2462ed992f814db8d390f1ff4ff005f13f1e5c13bddf1625b9ae5f44a371ab3245fe39224af34dbe98be2ee873c89db69cabc10f5134a9f3a38d92ba5b78a2506fa21c3699e0e8bb664ff002415456ac685a33d52cb39c229371a30c1e38243f6310b494fc239fb2a5f66f9a1665e550a49f4f54495a1a698dd2e49f3164785637f91b8b5f121e9b1429d5b4eed96d9ea9d6dfa14e0ff00d4b817e3bff7c18f2635c256fecc92cf1f9427c18e6a57f6462924fb6c8aa542544e0dc7fa8846df235b558e3bd5c5f24e53ba9336a8c535e0728a576a8cdea3c47a13dccb29f94d7bef4688a6eadfb1f43b4ad8847676c48dbc9b7462621c921cec451c14992814e2432bba6262d248972c98dd2269331a692b377d99b32cdbe6dbfc71e22bff00b330456cc99a5d4570bed9bd36db24a7c579313c98d6e6ed3f06d592319c234fc986709251bf925ca19c946d3247e0c84b6c8cbb7f1da77c90caa389ca6fa1ca79a6be97827744452db24cfc98f2ae78687c328ad242766e16915ec670c51e497024db3c97a4a5b4dc391763748b10b5bd1c531c5a213ae1f42113e99526c92aa44851a424a2669c5c270bf934c518cd471375e518272ffe0a4949336ec9b4ddd3f042da69a484bc1e9d28e3a6d7238e28cf7797f4426945257488b4ccb963895bedf488fa96fc23f229ae070df175d9b5d53e078964828eeae6c8c618f848f84e4f8ff84d6d1a13a4c53be5946d438a634faa1c25e1316393f0461236336b29eac4edd27a79124bd938a95fd94d24b481276ca1248e346f4b2ce18e2884bffd5eaea24e69b37ed56425ba16f8a3d47a9fc996e127b63d1f99cf2c2bb723036fd4e35fd336078a4f26e5514da23cb20d2eba3d37cf2c9be5243847e910c6d4794882a6d3d3d47e2c95f2f922182fa9193e12a5e0c52f8b64a52949b6c53d9cd90c9bdba323a9b4a346e72777c936ecc30fc9269fd13f84e514589a7a71ecbd68a1c058d296e195ee93484d49f22e1310cb148de6e42917a262763891768465324b6b5c2b37393b64d4de09c61db32619e251dcbfd2b3d1fa6c8f346738b518f3c9ff00a5c50cbf962b93262fc90945bed1387e2c9282774c84a951831ecc308f0a5db1baa441fc512e29fd1ea5e4da9413a7dd0a0d7324d1bdc54689c5ce49af28cb929ed5e052649fc4c33d934c936ed88494f831c7f1a7cf2ccd1ac8fdb7fa68a2ab462d72be0dd15c792d9129336264a3288d974467ec52a37590ec4656f71931b973634e26283505b977c8e1175690f84377a4f1e277ba29b63c38953505684591e8f5196e3509abbe52660cb704a4fe44e6e726d8c8db4628ad99255f2698aecc9c246186fe45087298daddd7041635cdf249d3e495b9366e4df742637427657eb6ad7b169314796c48a2c769f029b92aae4944921458a4290b91c48f047bd32cae5a6d4eb814ac76ba1cd5a4cbae0b64d27486da755c576266f57449d45f252ddc320a539b4df22c136fb546d8a9d4ae91f9236d46261f23c10f0a8f57050846bcb30c3e28945da14129c931c5c593c7704d89d8929781c52f27cd74c8c9dd35ecb2f4bd652a370992e04d68865a6d8cdc27aed2fecadcc69243b13a212d624a5b536376f9d22267fa4c5892572ec56c5c2e4dcc73e6887c93365caccd093f3c22307274910c718ffda1cb69926e4618afc69d72c8c14547f8b4cb0729465292db1958a9b6e2649d3e3c0e4dbb6cdd713e6d72fb1c3e968da6e871e05b974c4f4ba2efdb67c9f8438afa12e3451af64a293bd50ac439690aa27e11b1f8438d762b44657a2e119b25be1962b7e06abc09907cb376e4e910a44a375f564b173c708c1824b2394c4941bae86f926d6d6ed18a2d7cb828dae4c789ee4daa44749e4dbc256c9ca2e3c8e4a35439c2576b93be8ff31b446692bab172ad69c69b3e98af46afdcd589244852d1f66d451cd93f625a4ae32b429c25c346de7824dd899ba1325171643bd33647d237698aff00f08dc9b689f1c117da2d75a27a4eca2516e12daae5e08c2e159172424ad27d142ec9ff009e04d8f24a26f972f7317fee45952e98e35d895a7487fe1266e6f8a546392db5ecbe4e7f4d8d594bd97c927c0f446d72e84eb87a4b9270f288e4944b53e4a43879446dae48ae4738f2af91fcb864a5ba554e97058a6946911e592e049aa65f0592c8a3cfd18b37e58eeaa26fc9bd2373625624d32dbd32cda6921b64e378a26df8b44534893a12b62a86321b652a92e0cf08c2945518e3c5fdfb6b57a2d6af56c43d10c7a242e07176c526aaf865e9b7f85242953d1376659b846d45b14db9f2aac9ee528d746e717528be7a170f9271db4fec8e5db2e7a1a8bab1b2e87bab85c928bb139aedf1f44f27ca29f060945ca5bd5abe07dbaeaf44e529525c21c926d1097764a499bb8aa39624325cb23c12768845b9a464c6a68fc6d7e9af73d23aad1eb74c694950d4a2f9e50af9ae50989a243e88cc5f63937c796664d6d518938e49c952af16465b65cbb316284fe5bad1960a5e6a858138fc8e12b14935c89b5212268cb26b889285bdc97041bada9f93fc3a4db75cb2db1cf645b37b95ba21dd78b3f1d39d3b4ba1639fe253235b55f647968d96e8fc0dbe5332e250a7131c25366cda96d236d21a17ed5ab10fdd22da14acdabb4e8716dabfff00a8841c9b43835a5723ba42556fc89537fd36f1d3a3f0e392e51082c49453b2717cc9b37dc6e85352d1c1ef83f090a89d5128a8f436e2d2ed32185294aa5d72463b98b192c5ba2d37454631c50aedf26553dedb549747a7fb6f83235285d89594c52daad8b249bb1414a772776249748bf721b2ff009fa1f1adf258c5d7b9ad13a371637a256cdb476c97c4dd24bbe19169a38249d51b7e34858e7190935137b1645e49cd0da93eb8258138a6bb6628c54946ba4c9a719da5deb2c7b9c5df4ec75b5dfd0a2a3c2e88c6c508c6263a6c708c950f1ed4dd98ff00d7e86e8bd134fce95cfb642ece96968621ead0cbd28ad545b15243567471226f6ae3967295354ce9d1b65b770b9674c95bff0082251e0e64e9116f1afc7285ff004c6aa28ae6c92b4fecd938ab62b23d1295c9f3c10ae5344be2ea3d511dd2e1c8d8a2b817464bdb48dbb2b9e48c94bddb9229bf2ce9d6e654bec54bf421e8cf1a35eccbc50a691baf9d699bb913be89ba1b1caf772466ab964a5d57d929397641a7f29f8691271d8e8ba2934345977d892538a2306e4f974ba446b4638ee438b8ae483b4ebc1083b7675a460df3625f7ace0e4d511c728cbdbcfd8950efc097df3ed5ab17b1f62eb565e924a4a98e0e246490b2714297f4dcc925276d11a88fe4383ae1924d78172f9e88c6bb6465724894a49b4cc599aa8df07191f0cdb2ded5f034d34a870e7a1c26e69479be4582516df6430a8d3b626f768936f911962e51a4c78e716a2998e14b9ecfc75726c8c1bfe2172b6afb3afd2bf527d8c5ec44849aff009a31ae44f44e29d37c9386e6da1c651ed09917637429265d1bcec789735c11c4aaa4c87a7845df2f9b258f7b76950f1bfc8be2d46e850ae4e6d3d13e5d9c5e922969621fb1a292fd35fa9ba42e168afdb435ab28aa1def6745d92a3e51e6b86299bcdc2dac548b4589b42c95da22e0d6b451b4e49369f46f4398bb422914515fb59ff3dab47c8db13b17b168cf3aa194b759292b1b14a91bac928d747026cdc268b42d6cc73e699b6d155c143959c50d5938b4cdb244568996bd9457e84d7eb75a21af627a34514b4671438ee7c128b4ce747d7b6d8a42909d8c8be484f844d5c53149f4cbfe1c1452638f4c48926fa628521ad28e4b65dfb68ad125db4395f8628ff5fb56bd0f48e8f4684f92fdb249aa1432756a88c5450c8a43845f81e14ee992c535e0af6d916f4463911769a1a2b4b66f65c5ad3946e2d14345145697ee4bfe8956b7aad58f48e8fdb65965884f462d16949f846d8fd236c7ff00aa1417748fc2a5276878945d50d56b8fb13e065a29328da56967034254b4775c68ca121e9457e95ec7a2fd897b2c5d688bf64a2a438336b145918e9670c4b9d1a1f6559432c53629968972f44cb3bd287fa57b968ff5dfb6ecb1317b69148b2c4f4b68532d162745a650d14569659c15a5bfd685a343bd10bd974f87a375adfb370df2959dbf6346e14b56e8df13747ed12ca93e0ded89899435a23865315e94515ecb370bbfd6b4ad1eb7ec7cf3c1cf542545e95ec9229fd9d69686cbd6c4c93bd1e884c93f8ba21271762a6ac97625a589f3c968ad1b11456ad1ca1499bbf44745a3435ad97af5a25ee675ad328a45a3962e0dd7a31e88476a84a884ba1be44fa45c5f9286b45268dcab5b6594515a515fa1705a42d19d8d15eeaf63d58f44de94ce0b43950e6d916218f442133349469fd90ca845f0728c791dd4b4a1a2b4b2915a4791e945084ff9ad7b1f443b2d2e3d8c48a28dbfa5bf672514851b64b10e34210c63d169960e714d78395c323362c97c342ed91893ec8657174f942945f4c7ecbd223d1ea99626fdd7447fed8e5f42fdcff44552d1c14896171e57225a3f6c9b8e3725e18b2c27c4d7fe512c6eae0ed16fcf6472d7647246b862ef9ed892724bc58928bb2595df2b8212531a28ad3734290a4b56515fa1a146fbfd8f57cfbe0ade9295105f631e352e894251f765ff00f1e65b4432b8f29d0b2427fed57f49627dc5da398b2199aec8b5c3375a1ae082a1ce49b232dc343450d68a46ef72f6a17e8a1f1e05c9b95d0dd17637ef5c8952d1479b62e345c22d32504df1c128b5aa3d4dc7025e5b3918a4426e2f8629c327fb54fec9617dc5da12947a16469f22c9684f8d170ec739ff00c21913ef87a50d3fda84c5fa25d0a55e4524bc9fd7fa71c7ce8e4a242df2c6725b16ae11fa1423f428a5e0f55cb8a28693363fad13a2191c7a629c25c4b864b15f4ec719448e46bb23345d8c8439bf63fdc996596596597a5147637a5fb52b74255a7fa91d212b1942bd2862d33dca4ebc0994743ff850c526466fc32338cb8912c57cc794550b238f6292909d09eb26393b2b57faf92f557ed6ff004638d2bd26e91054bf436aeac4364b9b3f1a278df862c735c9283db6c6abc14b552688e471e991c909f12258ed5c5d9cc591ccd7629a7d337b14b9d1c13fd8fb17e86e84ecb43d38f6a8ee696bfee7a457be38d295e937517a51450e368c98ad70cf945d509325d0e56f4ba165947a67e58cd5491f8bcc5da1a71647235d90e559746e5fa1fb1f6c5d210fd8b468e931fbd98bce92ff002cc7e748f5fa727f9f749148690df2349323d68cf0464d3e18929c16e563e24d7f48748c84672fb3ffc4002c1100020202010401030402030100000000000102111021310312204130225161041332714252408191a1ffda0008010301013f0012c3f06b142d78c9d26f2b8169d1b441dc53c49da4c9bb93ca8a7b676ac53c37ba3f2724d51d37aa12b6376c5438d73c0ddbf82487845d8d61bc6ef0ce94aac94549128b8bc761c0db1e7d8d8b29784d5c5ac568435b19d2bac37f4b456108f7890d95b16cb3923c97aacc65716a434970fc2d16843c3111c5a7a638945acb204674f7c0e2a4870698a4cbc21e58b818848aaf0925cd0d68f433a6d38d662f635189f49542c7250de12a1a38c2cc7897f43c2ca5625432871382394d9699dbf6cd36d8b45b3a73a74f82afcd8c4c5b12382fc1915a6cea43fd71d3d4b2c766c6471636c62499a487b686455f84791f2fc1a22a9618b0d27e0d8b62d31f8a3be4bdf9b195a225d177e36c7a8a1f0871a9bfc91fe4b3438e24ed8b51b1b34365aa13431e99daa8d245e6dd8df7165ec4f4268a2cb45d1262cd8e4275b22d486bcb4fe04b09561639c2d8a1f926264a298a290f916b12acaaa1d1659b36265d889142c36885c9d0f4c42b121b1b2934336278b1b4f0b8a1fd239e84efc1b13f911ce138bd0ed3a381b16196acbb170c62e04f67299dac914eac5b88d962674e5baf0ea688a6c83a9326d5a788891763545e2d1645e86d157867255a3b5d2ae44992745e2be654292e5243714adad8e4d8f2cd8bf922893b145b8b65d322ef0e362a4a86b428134935588b5622f125685a1476d9310951671b1bb1126453c23b45c8c90a3a38a2c9375ac2f0af81668b3de8936f42b2cb22f34af1da3e291dad89578b438263850911b48ba13645ba97f586e909f7904d3da1a4f82b12d3c58a4ce36296d09a151265278f458e43ba159bc531e5f8323963627b2cbc558950be5a287122b4509223b957e1e27c0b4d61de3ba86ed895e11ca12d8c521e1ba427ac7b1ec4515894533b18d579450f0c7e287f074fa3ee42edfb23e9fb23f67a72f44ff4affc5d9284a3ca6b2f2dd10fe712ec973428acb3b4d09fa1c5ec4b45158b1089588970217187eb35e4c42cbf0d6684863cc7a6e447a6a236596c5264666a5a68eafe9d3570e7ec34d65123a7fcb1cad8a92d62cb672235650ab34768d685c8e848650968a29a78b2f12d2f18ac318f2c5e365e3a70eedb12ac3f152a14aceb7454fea5ce1e36c82a1e1219432f5849b1268518be5533f6ebda1c5a1ba3b98f673852a3929a4292c5e7b98a6c93b5e317426b0c796bc5e62ad90551c6fceda14d9d6e9afe6bfecac213c3c7dcf5962d0a4dae4d9eb126512d3a1718a4c7122ad14961acb4d782c5785bc35f0558bf4ea1056937ec5d2a9fe30848edb3b0ed634561a1e853f44e3daf2b08a3928ac343d911f38958f458d5b285147f963843e5614ae427652f0a17c17f07e9a09cedf089294b75a1e1368fdc71e55a2138cc48ed251c3c38d928d13dc50cf659762d218878b12a588f24b9132d0ddbc2c5d222edb63950e4dbc2147b04ca69552650958d57fc2fd3afa17e49f52a3da86f1da2517c92e9f64ad109684c6d58e36388f4593da25c0c6cbc27978af6c4f67044961ab3b4a4561ab231a649ec8b1e1ef0db8fb149bf47d2f94492ad3f0a2b143c28d94312bd0e2d7847e98457e0e4ed2b3657b45b8a626db1244a3689c68ba2c9b1e1884c4310e3b1e1ed090f5869a2c5878b25c918e8a3d8f4cbbc2524ac52d9f4bf4358af248fa52e589bb1f386ec71f6b3d2ea4a51ed7e88af06462ca26882a6d9fb893db3bef81b52271a2c9723284495622f3f71de16e222956c731cdbc69651435624d6392af36f0a7f7449a7c613f24da2526c438e17058d63a2abc2f11dc50e3243926b646a871b1c3abd37ab6884d4d7e49bd32c93ca472892228e04cbb598357b63976e92a14b7f81af062f0bc228abf0ad1af868ba2de3d61f04236c8e19dea1c8d7bc46d1092e193e94594e1a2d8a7aa64ea32b47565ffd24f1c086f6290f659784cbc265a68b2ed656ca168bd8c4f17b2e99ec6ebe0468794f2961718674d684263638a92a3f72515bd8a519f051677fe4bb1c6e389ff1b256f672359f63f545e10c5c8f42dd91a2ce4e178597858624558ca7f0d8de6bc1e590fe2bc1228974f5affd1753b6948b52568945a2027b270256dd1d48c61d26ff001a172369890d517b2dde50b0c5ad09159ac5aba1d58c4243bf0e2c4931fc5596b2b0b1d3e3c222a3b7ecc708c95490fa7d89b8b1f5bb52b2338b5684f81c95114bb9c99d69b9bfc23834b0dd8c8af0431e562e8bb1c92fec92dac6d08e06c5e9e28adf8b122bf3f021e385843e4e9b18b284e8b18ca56593952db2537254b8c3f0978551785b2b44791da794847e45c9484b787117c0959450d35eb17af143e05b632988645d3c32321531a3684c722f12ea28e96d926dbb6771631ba2ef178644962c5a123d8ced6b3ecbc2b7e0d53f3a6c6d475485bdf6a2d7d86dbf863843e73d37686868fd3d4afee4fa2dd8e0e2aab0e497b1f5521f55c85878b1a126c6a90d571c166ec586b115e0f6316ca2b097c571fb0dd8abd8dfdbe55c0f309532ad58c837095a21d752fc128b912e93bba2504f988fa517e85d081fb11f43e9225d06b87638b4f68a6cfe229b631b2ade8691559716bd0a3e3229a74245097c6fe0787c210f2864686d3fef08e94eb4f81a58977c96968e875dc528cad8a6a5c1244e1428b6c7068a3b49457b1f4a3eb44ba32bbe4ed7866868add896d94aef08e7c6b2d15f0df9a1e10f6c43af25e1dc39396ace8a8ae9a6526ed229a137ed919426dc6d5a1f4a2380e3454bee5499dac69a2508cb944ba36b4c942517b450d3c365a1aac515865b2cb2d7cabc9e11496c6a87e0f0bc1913a77db4f814312826ed8a097045b4f0d59da34ca259ab3add255696cee698dddbc28d14ecb17857822cbf81a7f1abc313f078b2cbc417734849b92439ae9c6e4c84e32569d9aca28a2b0e299280d51126ad1d485498b5268a2beccfa8bb2989e3845dbf2af1b2f0dbe13d097e50e5f85e2f3c8b0fc10fca13709290ff0053d2aba764fa8fa92b621b7f71757a91e24c5faa92ab5643afd397f9532cb2cbcc90867563f4d9354d33963c72769bc699da5311659685f037fd0dde2bc1f82c4be1acd610f0f16d70d9df3ff691dd2ff667ee496bb9b42fd476c1511eab924c4ecac75bf8b4354c476b45bf65979a36279876b97d57585c0d8be579597f25f850f928653f0e9cdc7fa23d48bf677225248ea4d0ca3ea5f91bd623db52b7c2d0b81ba42cb8a1c4a23c62be6795e2b29e1795782455090c794cd9dd2fbb2e5f778a251a19567694f0d59c1626362f0dfccc7846b2fc395b584af359e47112d3742d2f56fc133b50e28ac462e4e8fda9fd8ec9ff00ab21d06d5c9d1fb71893564a2d1b485866d1652c5965d95af0a3d7c6fe3d71b35a76376562fc22d96bec73b794bc2bef8e9c6b6210c6892125deacea46328d3249c5d11e10c59a79486fcb452287e6c486ab0bc6b3cfc2b79b459b28d239643a77b6310b0c90f4ec94efd938a69b123b62e336ded5522a515c16218d1daf35e17e0fcd94dbd0efc2fc6be25a2cd62d16ca6c5d393f443a2972344d084f0c90d0dd3d8a58f65a64fa571ee4b29acd783d66cb1db652ae737e0b9277428b7e08bc5979b2fc52f0d178ee688f5fee467686c908586319d48ec69a14da2df226a90fa8c83544da6f4b11db18b158966349db1bdbc3476ffd8d2f26af82428fdc7f32dfc12788ce50e0875d3d3d17842658f1d6754292638df06d1166c4f45956c508c5724d508bc21a28af0b1b7f05ba1b4b8f9d6bce4e9612b24223d57123d48c84cbf0eb72684da3ba2caae0b2c69a2356365ea8508f6a251edc263161a147e37f1257ec6a8a75624de12f81bb78eed521e39c47a8d72464a5c3cb68ea3b7e09b4269946cd1b2cb2ef447a5d3fec9f49c5dae0626292f82fca86be05c8d37e8717f63f0be19bc2564b5e7df2fbb3be5fecc726f96c979293429a1d4869c4d16d09ab1489f5755e11e4af9a8a2b14566cbc255e6dd0dde3f8c70c5f03837438b2b295e1a149a14aca4ff0768d1748bf08e91d28a71b7e0bfe0de52f826fd622ad92795f02638a64a03831c6b178e70a4d0a5f663a653c562b0ba934aafc2cbf35c0d0fcd2b1aa29fc0dd2cafa6387e6e6da4a969623c959b1a521f4c7118be97672ef2a4d0a48d158487c6179ae3c170318bc5f2c4e8ab92b17c13f585ca27eb0fe18f3e516f0d2cbe70b117ba1e98f1211ffc4003c100001030302040503020503050002030001000211031221103104204151132232617130819142521423a1b1f03340624382c1d1f105e17292a2ffda0008010100013f024341ba274e882769d391a890ae1cbba2dd7f4ea1140c9011c39745080d4e0a0a709c9e2f1053816120e969ec808ea87a15fd82a5e6df4957da8bafc26885d53aa01ba6f1569db0aa7123f4a2a8b6fa8d0a1050ad4138e43539a0b7d953318444a2d52dfeba5469dd38e9929e62188efa448d009384e302d1f442b7ba38273cacdd1d07234e728f6d080b28cf20d1a11d91d5be609b84c25032ab508cb7651a0d00d256542d9a8145b29da0d004374ed06b3a91a1388d76d7876df507b679365ba7266426a234e24479a07babceb44f4477545a6d4420d80ad94d6b5ba3cc04e32a3504b48210e2bbb532bdfb3501a3df60544973c928754e30bf8a83042a9c4788c2d60ca87b69fa7f5261901118551b6bf4a400979e889932b7c68d7273644f55e86fb9e590a55ca514e0295b04196ca0e71d9446fa52a17d3ab52ec3072ee6353c9ba221374850a3490bc404764e721df43b2a63c882d8e135e8195568c799aa1469d15abca15ea4943d2baa051cea069b1444ab42004a3a8d1dbf26dc9c27acfc6814271cc68e4c30e4ddd3c695e3c274f2533e709b4438dc54229a2511af107cd1a311d3a69c2344fdb47bc354baa9ca62ea515fc3cbc9270ad0361a1a7d94c355421ce90864aaa40160e9aef9d18fee9ccbb2396390e8d306539d719d2e706900e17451ad36ee790ec8910214681ddd16f51a6fa7d96506a216e8e1356e506f900437454c14c7ab93e9756e96808ba1171d421a60494756e743a14358d5fbebb23c940b58f05c4a06544045fd9373a3822dca6ee9e4464a065577f96d4743a34b6c07d96e253f05bee9b84f2364156c316fcbd136848938fee9a6cf4a75772f54a636d0829928eb13281c695e9f8671b1d0ea1d09dec82bcb63dc22ea6fdc19e58c6b129ac92bc383bab022c8d2a37861c108ff005391a0060e42a23903a1435ca234ba0ea4ce1536a78430152173c284f8f320438028840c2a6f0ae4fa3396ab8a95850a390ec343a52dcf238a1d50d0e8ed76d07242654737629b55f51ed0495086855b3a557ba42b88982a795a669c2a7599e1e4e42ab56f77b2655696e7741e2f2b655f3013690ea8b1ba04d0d272503459b235bd93ea91f84ccf995312fd3654df25df94511050376ca98c6b5d97308d2250477d251109dfe9d33f3cbe196318ef29b95405ae8220e832b0a610c8505423b9f95250d19443e954797411b04d20a3a423a41e4852a0273575454754d77455cb1cf1603108ae199fabec9eeb6993d7655170a1ce61c625785888554786e84d79694ca9283b439d1a13f086ca34dd7ca768130ca2142b542db52899d00ee8e8393a69c37a8e8e310823841155048d61363aaa96cf97b694b7569b884ca5ed2bf86cee8d073729b56dc1d2a7944a73c9e4b6f9c8c654a1e6202c00152ea9a25577b5a2deabc40c3287114ec93baa959d50aa0dfe58f74dc044f9e35aa2d7b87be9079256f44fb143905a1bbe53dc5c73a0dd480a10c2bcca351c542a9e1cb6cfdb9f9d6945ed0eda5710287887c0302dfea879b72a504f53af4415d2ae086c1175aae1d916ca22d442d960a680ca4276556a97ba7a226e5c2f12280703d57f1ed244353c36afeaf32b0f54cf27c263f929ec9fba6ecb6d01844eb25377e50c2f203449470a42719d30d45d286daee341ba7e9c27ac8f6d2bbe4aa0f0ec75551351455510f3a0b809e8a75a351c01a236794e854e36d5ec137261909c25a5385a6350a310ac54990f0884c700aa71218d86ee854bc9b93c635a23f96df8d2a197841c154e218d6ee9c6e93a7451c948487b7b8e48e4e9abf65d2574e59421420891089951a9d60a880144a76e9a8b1e3d4d30bc38f745345c7d939ee76270a150e00d4a65ff008555961b74a7692c24c7957114fc8c7fd8a730da02a4c870b90d41213585f71ed94d30899e599509811e4a351d49d735567f88f27485b22741aec8a604edf4e1aab5920f5ea9f5c1f2b53d49b653abb9cd0131fe51a402b8a65ae1a0279291b5e0a6b46e54685ce6abe5f6adb2890aa904a1a40d5b20828856aa9b8463b691a70e6ea7f09efb05c531eea84b95475ad944f20213f4194c743c278b5e4691c804a2331a07c404f74e0277443987d384d32d2a60a2d9ca6e0b555e329787e1dbd170c29bdffccd9712da57ff002dd84096a84c19478aa54a908de156a9e2389d07a19f0a83e458765604f743e98f75b29d6ad2f06df30323a6a3902ea8189d4f284e3a46a0229a811d96e57843ba7021534e4df4e9c399647651a717e86f25aa1007b2a55edc38ca0e0ed918551cd4da4e6559399d2a10d944a6b5c7a22c726bba3b408aa4e0f6c7544275ae722d8cead52fa66e614fa8e7ee552aa19baa950d43eca39211d28b45bb275169f6559be93f94cb732ad0adef84d6b4a7881e5c2bdfee879b74ea646464277fe1047e806f2051a15c3f0fe3dde70d8087559854f184edc94d7c2c100a730c9c2ca28e80a73a75b4bad03b20d0c101121a8beea931d5784082e2e1b230170ad0faadba213e2e31a4693cbd50d5c9ba8128a2d5b6a113ca1ce521d84dc35754ddd1545f63fd90470b8b386a00bb01780ff64411ba1ba80ddd39f3a53a7510627faa98d789ff0053eca9346ea54a30535b1acdae90bc573c4153d138e14a099ea51239227485d54e10ce947d2144a73422c83ec9a7cc004fa72c9eaa9132ad29cc7349c6132044f556a731a7708b011e42a0cc2b02f0a7aaf0d16c2dd06633bad8ae89ac73cc35a49e68943780a34734b40776521f84e65b94c9543c2f0e30b89686d4706190ae1b14e8e9ca012709adb5a3ba30d12554aa5cef6549b8b9522c171776c279b9065d0180dd19d7747922207212a5140a2ba26eda4a720a9d2f17e17f0f4bb2a945adeba36dd3a20541951856c7553d93bbac2a5c45982aa712cb30aabae2a8187fcab53e9dc158ea62e8fbf644e8d304154a0b011d5423fea8d1f51ac74155df7bd31e5bf0bc4074dca85b2ca841426b07656899469b5dd13a841969413b73a346a0f6d08c7ca1a0739bb14ca959db225d0492aa7454479d4c04d81b68ed91a3766578859e5a9f94eaac037470d1ee855720e6b828f7d1ca11705be542a359d41d7379db840a67a82ade96a635ef7794657b260f2fdd13006539bd422a11d46ea853f32f955ab5f81b202537d21754532a596968f3754741a57f0e45808c6da42bb25341255ba1ca7682251588528194ed785bb23a23808b4d507a2731cd716e92b742dda15d984df31f84e6c977b0e42d8394746537bb60bc4ad4b05537b9ee6ddf6442accb1f1d34f0ddd970d52d65ae053eb760af00e5070395c5343a110e2d93d10129adb741a90a7a6ad74fce99572749d95463dbbe8d225621128694f3e5fc681a4e02a745b1e6c9500230e781db29fe796f50a961c8b801253012b21552fc93f6421cd05556788c23af4d1dd346b48cacacf54efd2aa074e131b78cab5cd5282233a008355a50a4a10528bc9619dd7035295306775e133897bde1d0116f82e7b538e5300cfba14bc494f69a6e83c8c01be63f6546a36092556ade263a68d083ba28d6349d1cfbe27a0d18e2cdbaee8a6e02a8ee88fa574e718473a338771df0bc3344487650a8e99395e24ed2b13efdd3a9dc7a230dc4205bd959d428b1a9af2d32bc56918df4ea9d8432e84e110a932f7c1501a9f6bfc9ba787537b4f4e8a6402b8a6cb67b2a0cb892a142385016d908d62e7e539ec2c2a90ca8d2722391e3aa61404ecac84215cae9d080427b6c711cc3ba77ab1d531b6a0a626551d9cfee89fe64a7e0c8eaa930e0bb7d0a0dde531d63cd3fc69eaa87e51f514c1251421bac2c0d97dd39a014027092a9f077d17be7654283aaba02a7c2536b7cc2556a54695373adcf45b1473951a6eae20e136a380c14f7cb7dd7454bcc15d639710cf11a1e1368bcc6155e09d4e907fe7d906f53b27192a350537cce011d764501a52a4ca8c203497a320e426980e11ba217898d2ec6804f29ceb4bc21077210ad2e13b2e29edb20152a8bbc8aad48c054fd124aaa3cc4947ccec264b555f3441d49ce8699f05af919fce8f331ec215070a6f9289357d9a9a0030aa36e042a156dfe5bfecab7a7098ff0dd2136bb0ef845dd93ef1989590fceda427d36804a060af14a738aa7be8ec34aa67109db26365c8614a9404a217541714df4b942c690a17b2070c3d8c1d2e0d12554aa5e7d952f47dd1192a944c152869dd719ea6235ea16c4a6e32ac10ad20a63b395beca0ab50da13e4c084da4aa0c81d34dcfba15dcc6160eab83a8c66e554e337b554aafa9b94d69a8e0d4fa74d97d2f53e4427b2201690634e89b07e5422bf47dd32a1a6708bee712a9558690ed9527063be42adc5f88c2c03e539d71851cb43d69ceb8a8d272b1a14ca8f67a4c2f338ca95746b1a030b7e41c9251d386a64b93e835793f7146d7b610635a13aa764530dc33ba70c6346073fb610796985735ac8b45ddf4636e2021f0bf5fd9155db0e9eeae3a06dd81ba636004506c60e950bb66a7dd66837d36234779b1d349954841d090bc4f301a1d18b8ad87cea349413332d57109e493a538b42ace97264dc215e5536c0c9ce85712ebaa268eebc9df42729b48bb2535b18d1e40125092e1ee9ac84709ea14285908c742a870eda937155878754c198546aff385477f90b89a94df4841cca7944a9c29532bf4393f39d184da553a9b029f41cf718c04ea562b54c276adc11a046251434ce977956eba6ca352a0c4a0dc2f7d2674769be9d146152ac2dbadcecbc52f7fb14410e84255474e820e14da1792a35b9829d4e7d394ca2e83d0a74ce775ea6fb8d289fe60d0d48ad1a715e96fceb468d8dcee74685546c9dad41e7286fa152a75070a70b2a9b25c1c7a691a05581a908b4b775d743ad3c3a554c128683467960a1be936893b27f10e21d6f7d0925041d055360754f6dd60685fd1bbab3ab9521e644a94fa0f732f8f2b53621615d76c8e9e2b86274353c96fbca6ba32561cc394c6ca8553a2cda99b105441f6566547955b0e62699c279f39f6471a3f65d3485d3465a3d49d1d35828850b65ba3a6e8360494e0230bc4726ba790e8d08e942887799db20c67609dc3b4cc60a739f7194c727ee50697fc28828f99301dbbecbc2753f34fca69b82af49d97744242216c51e2bcbb657baa55c1c39710f0e303a68d8b84af1a9c7a95278aaf31b26aabd028c684c27798c92a0485dd674eaa74985748f6d1a7270bc4570de5020ca3a54682d3ac4a8d5e2434fb6b284b8a320cc61533808382ad59af9a7d3ba2c2d07b774347694ea5b185e34f445ee726b6d4e59dd4985440f12e79556bd3b0b188ee9c3a2a6d4e512ad5002fb223dd35b7ce6165bee347e621021a99bbbe0a932b74d3a7405aab875b7b7ee9b55c7b20eff884f7b7f6cab9bfb15fff0000bc472c696484da6d8f360a34c5e402a1744634df95eef28528a0743cf4aa32c68942a073f746a16f44e3e2c94596e8da9634853274a36c6908b9b9ca76e876471cf1e5065708eb2ae7ae16cab71135046c178e2df94d75b28bb752ae52a54afbe834d94f552bae8c31a79d85d1b273dced4727fd31f29d12bcba521bab6427dcdc2671103216e98eb5791dec8b47ee41a222651dd04c29a2347141b84e5b39150a9cdddd1c08555a2d6a893089e90814c305384184da772b0041d011073889d28faa15a672882153613b2c8c2a261a8665784d635c004c606fcaf0dbd427db71b556a629d8828509a8b1ceb7cb95528d5a593b3935972b661bdd16c4a75270131f6d2348e5088fa01650ade4870544e484f7e63a23a35b7382149a3a2885e27f324952abfaf59e7c8d94a356a3b771d7a2ca2b75b69d976d371aca95281531ff00a4d729053c41d0e14ace8137d0e4fce74d951fefa56a773546929a9c0ca6c8727fa8a6b4f654c6320614228ba5da3d14eade56da0023db74e3f954dd0a64a7e7ec9d984e0014f646426b70b010d06fa3a8b65406b820f6658ed81c279603832a9111013a6fd953eab8732d4e3e62827173b0d09940820a730d5aa01d8055385c7902b4e9c25a5fb23440c8394fbf89f2ed08537f41b60aad403694cf99341ee9afab5411db74fc152982703729d2a9da1cdbc18ec9f6dde5db56a3cf12546bb6874060c85fc4f708d473f609ed82bc421b6a267ea4288e5df4cf395f3a871941c610e88f9b73f75b23a4ae88266c7e34883a52f4a6e511e52a5610694021ba2d94da7d4eea10529eeeca7281c228a84ed1a6188ba4ae813b22740d746e9bbc152b74fb9a9b55c3aa6bc3c02aa0f302aa743a33d95c6e4cebf09800d9546029b48da110404df1dfd202a6cb5befdf91be53210aaea8e894db68cf546a1a272dc1caaef2f33dd79804d263ca611992a10df08e4aaa2a794bf481df463653b18e71bf21e50db9c020d0d10156da3403af21fa01675eb84ca05dba6d060e8bc31d9784d5e185fc384684642b602f6d0044fb21a85d0e8e6c9dd60285b68152f56a06534d8e5e378624653f882f61681ba8851192a4950a1121b9420a29cf6857171f64da41dfad7f0dee993001446163aabae38d938e84f9401a3ba261b99a1308b91ce50c216d4105783e684d686ec9ef00af530fb2954baa82994c919c280134071d645c075d2395954b0a350bf7552a5d0220765599e1ba2ff2fb20cfe58918476db4184c392aa938cf4513ad391947279c21a741c83463a1e13aab47ba26727e98477439036553a4a35850a342c69e89fc3cec8d27b564299e405044762b74e892a54a8d297ab46af48d93b3a093844807df4056e8b0af05cef514da447ea469bc9df08520de89e1642a752edf756894f6919e8aaef0bd234275265537d87d918ee8e4e8c6b9e309d4dede8ae84d79763aa1d9665533e6cedb27b1cd7105536130153a5193ba2a30a98f2eadaac353eff48ecae3b68748d250ca2d1f442d868365d51e4df43a4ca3a48b623e846ad626b106c6b0a1428d61109d44393e840c6b03dd111086104708c108a1ad3fd47fe2b7d1aed0b46fb227a35477d18c2f3014b2943772be555a8011892983ca35f0dbd558c3fa5399e19908567054df7055fc959ca54ae835eba4ebc23bd4115519fcc81f2a40f2b7ee553f4fdd546f51a35aeab61bb109adc81a75470d54dd88d2bd4b5bb48eaa4cae1eb8a820fa93886a9e72a73ca77d022a7e83774e286a4e835254e93f48681b29ac4d680808fa3088d602ab467288828147281c2185d27eda3b0a565043d0ff0085ee9a80ca1829f45e197fe9953a4126135a2933fbaa2db89aae1f09e6d6972a026a4943d9062b137cc6139ae8f2ee980d82edd713485b78dc26d6000eeab7f38b08118dd39b047c284084492b6e493a50c3a548704f05db7dd1a6e6aa3fe9fdd54f415428f88ecfa428010786bc6ae3253411ad4a4c7f44293daef29c81298d2e804fb952ae572944ce871a420d719c6dc85051b9fa81d082ebcf1c94981ef0d2e89eabc3cbf3e9e709ac94d03b26b547d3850a342155a17642220c1d01532876d1d96a0234281f268113a3aa1b434f447256cb87ff00513bf98e8e8a939a18d55439f81b26b0b1dea12820161099434e23fd17a060a6be1542dba9bbf2aad872d4077479031eed9a51a5507e82baa6ef85e66e1360b022a9f555765448f0842a95f1e4fcadf3d551aaf888c2851acaca68cb89c4a6303237d91a1507e92ad2359214ca3308218cc263da1f24797a84eb671c8343f4023c850d4940231a3e9f866d907e34692c131be3484799a13428faf0a1150abd1904e93d97f7437d918ca3b29521364ad869384e3951ab5a5db0429f865bfd50634b67b8555b65b6e0285c48d9c151b8b65da16c04cdf3d9744d716cc8fbae21ef7e2d30158efda7f09b4ea7ed2acee42b59dc22d693bab59dd1c1432a9500cc9dd0c2955981c27a85203a07dd1cb536a16fc26965441ad08851923a2a0f6f869cea454a0e9289217899f644a851c8fa6d788207cafe0811ebca7f03502fe00f57ff0044ee1dd477dbba29870653e9bdb1f0ad471a6da0faa54adf526795efa4e0db69c6114da35aa3240968c2cb4af02b06dce690253b7e5098d43598570577641c50fa442b542217114baad94e8dc8cadc279d18a6514728b7aa18dd536def458d222150a76b32ab8967dd6c21713e81f2a8d4b99ee15617dadf74068e0e84c4556796d530bc7a9dd1ab53f7279702d21c634ddbf08ead309954541be74c754ea8d71b1a88695dfe0e94a8464eea347b1a7d934167dd01940bc9f2c269214b9ca23a239434f105f69ec9a419f95d975d7a2201c1d8aad4bc374744c6176c11a55846178357f621c2d43bafe0bfe6bf8367ee2bf816fef2bf801fbffa2fe00fef0bf807fef0bf82abec8f0b5c7e84ea4f6eed3a47286947df508f3c36d11baa1c43a89c6d330ab38f1950963721b2aa71355ecb1df9e41a04d1a9504a014a0f41d3f54a7b6556a761d210fe9b68428d2d0023d135a0653b6284920154e98a6d8ea56c174558f90adc05c57fa7f74d7bdbb154a6a5504a84d47cc50c271eaaabaf7b8e855d8857263fcdedd55b0e209db56d2715e1c22d7774491f2a8fa914fd9df08029953ca2775705728bf75684e3698541cddbdb4982879828474ae7f99e95c2fa4e9d796a536bf709b0360a397ff5a08c69df534d8edd80fd91e1281fd309dc00fd2ffca3c1d707d329bc0d63d82fe06ac6ed5fc1d468e85556b9b87373acf3c75d0a0e236c29254a0a930bcaf01b6a2d829a33cf08e107a6d440cfd3856aad46e6a736d2864aeca56e365084ca379e89acefa3b62b866cba7b6874e28f94054b8801b6b9567f88446c34e1dd0f4d735c6341a718ef4808656c504f6c01f275765ad7fd8e94e95b93be981b94ed93a94b07ee54bd5f645627eead569508a66da571b14da629880bdb4a5e9fbe8468f8739c3a82a891716af7449015e1033c835eda77d6208503ff009cb1ac69f394fa6da820aabc0b8659e64e05a60e39828ea51cf254aeda94a9b2c00b46fa01803aa71f0c58d545d7304aaac1baa631a0d30b1a95d55c535ea7e9c285c5d2fd48219d02d903d1472527f8673b235ae7b63d2a57f114d557f886741b6bc27a09f753903471b415509aaf91a377d1fab04cb7ba0bc561ea8d568db2837f51dd3b3a1963f09f531b2a2d6c7b8d3a68ed90db4224843be8e36b4954763a94e1151eff0065c313e21f744ab84fc2e8510338281f7d7aaba24a9db0ba7dd1eabb727f751919e6dd6da405b69568b2a887055a8ba93a3902194e33cfc3361be23bec994fc474ab437f0aa6d0868116caa8d7b764093fad0f17d8a0fe87054a70d0141ca7e84a0e40a2ab32e6108e09410d374d1050d5e3ca56cd1a788f8dd15d10e46bdcdd8aa55dcd27b95e3d4fdc9f59f51b0b2d3a6df284ca7edad3a02c6ba72ab320fcab552a71e628a1d34233a03e152b8ee536ea8f12773abfb6a4c184ea81a31ba65789072a4bcc954bd28b80dd78f2e86a715d0aa40346160e1068071d94340ed95993054e4fb2eba3a41406e10c1dd7bade0f75d02eabd96358fa5dd15c452f1187b8d9119e43ce0176c9cdc3698521817881cb73a8d0c754fe19aed91f1293937889f2d46a32df334dcd41c1c139029a610281d09d36d0e928390321155c4547218432a74929a4857c91a54a826de88f75bead5b2953a8a76e5cd9f8513ba1e9d6343e9d3c279e8a939cc16b86154878856b9bba881a0508a27a27eca9e1e2742617552ae8ca7b9c4e7b20d94479ca010c14f65dd55842bae4dc8941d84fb95ee0bd5055d390881ea9f65199f6cea06ca373d55ae8f521881a1dd745edf52615e3ba994e5c553b2a1ec72a3e970a26a84dfd4e4f4c6112790208b507c1846da821caad1b3e130bd991b23fbdbf708190b629a5374b94ac6a7919a719feb1410432a392f30885b2dd5b851054f44ec691a6135c6113714146af22546135a30b09cdf29f84da569442e9a795d9ec9d58018dd07b9d29b9769d4afe25ebc41d51a8d0a9a7f656ad8844040ca0efe6690b0dfb94fb63d9344eebc5217883a85e5e8506c64151dd9f84e2e9ec98fbb1af4d7b2393f58ba3aac7f5ea87c8476552832b7a8fe155e02a372c3704423ac693af09ff0051dec8fa0426fba71928050a106eb529ddf2a4b4e426d4070acb66cd8f45218ff6430514d4d0a11d0140ea42850869c566ab9411a472ce874940270c26eda4add0127d912a9593e65b994746b6510ba26dd2401b854e9d8dff0092aaeb5bf28e72154ba9bb0705071071b15e238eea8c653db29ac01186a246c9c0b71a75d297a07e51c94d0bc155e033fee549d329ccb36d931da3c973cfb2a19307a2b57863ba348a2d23a292bc4721554b3e0ebdb9b6d31acca95705bf2170982b78838947cdb7db49f741caad0a55b710eeeabd07d2741414f370a2699f72a2d4e2821a01cafa61dba750fda839ec4e6b6afb14da45b83f656a68ca01144a9528395e81950885082386929c4b9eef9d0729e51ba26022fc2df0a2708b44357b0471e551a4656edf74ddd330728a636e4046cafc239dd78aea4e23709cfbcca6eead84da6e4d0aab8369fbca9248caadebfb2a847963a04504d617cc0d913fc81f1098f7e02615b2732a55df017f0f1b128ec9c1eee9840bad54ff00960c6eb87cb9ce71caf12ea9036594c98ce97b4ee15ac72f0fdd58e4cc635e8baae9a7653a4e9d13bffd2b4999ecbd90eda144f9655cd3d102de8e423b8fba3b8d9741ba09cfb7a277875db6b9711c13a9e5be60a39022b87c536fc276dc92a54eb2a5615a11685b68c1a3ca7395cae572ba107fba6540742805c53ada7a81a11239a3406328b8b901a4a3b4a677d47b05d4684e9d5042a39c40f7d2a54b41ee807bb75194df504d64372805070b88916a1e5d0099cc63404c4293184dbaa8cf454d801d2e952a740617eb2ad06efc2cb534da4142d774d5cc338d9531013a5a578a50ac81c63ea1c84320fbaba10d4b9a4650f0fe17860ec559ee13410514dea8a6c4ec88ec642e2f879fe6307ceb1a1542ae2d574eb2a74952a54ea74841a80d2a6f0ac560562b1415b263fb26bd6fa714e2e80a10e5d82bb906908654aeaa4a3e56041d76804342ac62020eb9bee8ee53748c26b4eebcc7d953770e038bb283ee3946de8a8b205c539d0a632efb044d94dce3ea3b2739cedca3c81154dd02103e64374e7590838112bcbdf4370cc2707dd7029ad8680ab3807c7b2c77430347d4e89af713a3a3aa8a65785d8a648dd053a3cc02ae19f65be0a66df49d1112ad69ea8320efa39b3909bb6741b9d1fbfdd0db1d9026ff0075c4f0a1d2e6087756ff00e9111cb4c4346875952549532a3df4074ca843576eaa54b57884fea4df13a43935fd0882b08b544209830aa602a87f988aca944c68708ba02104cac4e804aea8fa8a219087b220ab7427ca1030b3ba158a24b8a6edb651d81d009d95a5aa9dc4aa8ef3650308998d3c5c06a9264a158363cb2512f7e5da1454268b8842d6ed09d0e561e9b68d956b4ee15adda106b4744465aab7fa47e5088107a21b2b19504f58551b61d6d69e89ad0ddb43b22c7f6573826d53227aa953a15831e5574edd56df47bab1cbc370da13458dff0037d25d72f134db47fa53320c764e13f30802e191f7557850fbba3bbaa94dd4cdae19d5a25c10e5c05e213e90835fd500a340e8305360ab55aadd1c7ca8eeba43bd3fd93a9449b41f84db9a7784ce203fc951aa4d3eb2deea651d29fa171061ab724ea11df4779954110d518940a928081a36dbe4eda3475d24ac14ef48f9d27a20a216c99e60426d188bcfd93a93a9b2e8024fdd1040b8aa552e67b84f992a9507d6f484f61a6e2d3b8d22d701d5373a092142856af0dc558d6af0da516c2a66422d9527af26ee67cae2249854b65fcca9b7a506bdaec2e2331f40e7a234da7db96d89503b69fd94a9e6ff00daec829d2a676d8210ec140c3a0e813f654baa3be8e5c45135c000e47755387ab4b76aa74c3ef9786c09549b99e5944c94c8d634acc9829950b307f283d074a8509e1382225071a463a22da757d954a0e6fc2a75a3c8ed935d63a271d34609404055df7184370390a1119575a11f314dc2708c8d9372e44e617450a13b68d48c2e88c74434bb4f17a3440552ab00a45adcf5f74ee35ce2d9e813ea9aa23a26cb36444f9bf2a9f11e04c353dee73893b9415e0c4044c12adc2690d69532340b2765099909cdc26fabe135d29d82ae9d8218194764d645a53ccb8954998f950baaacd969f6e779869281f2f45785781bce87e86ca79b6d0941af694e64a2d077ce9b94f54b64edf4721ba0571567ed05cb6e6ea9a50d665144263907a6bd5e251b4e9109f4ee10887d2f84cab29f459536c270733c87a6ca93ae62a2171153c367b945ca0a6a197a38509d94f3d131bd7488422765bb96d09d0753a0251cb5415082e9b28274665b0ac580b33774d90201f94e12a32a2026869993011ee8b766fdd1a62106ab554c4267a023b2a03d4138794fc69083650006da085570cfba68954dbd1546dac26553d955f49f8e7a9b81f9513e623caa3329d981dce87e94ea27a26116ccfca93dba2b88c15f65f853a7dcaf84e3854f647476df29b8530253dd73e798ab2655ee63953ad283a7528a763285441eaf4da813c0225076615a9cd0774fe1fab5539eaaad2b82a4d2d308791b255479a84b958e054e1620f74cb0327aa25304caca735418d0efa644157e72a56fc804a6b5a3d4aadad6f97aea3650495646747e57444952d744a2e014a9519d18e0e2792aeea9dc068c75a55574b6d1d50410c6a02a994d549c65713e803b941710ee9cf0094448852fea32803b939e62e88448199c2ba3a65483f844e90a7db4c21d31d560cade3db651ecbf0b758d6a7a534168dd3b476fa5636d33cf08055a9ff387fc9338667ffe5781504c7440ab944ec9d2a116e57982bde9b5c8dd0a8614c14c75c11d1d086426b72b89a9fa47dd0f4dc42236d1f4c0882ad941d06d530d4f311dd3649ca7630a9d3b8fb223745788600519d1a7502536106929b4894e6dbd5428303a054e9dc9bc1dcdcba156a3e13c899d761b2ddd85110bae909db2928393d34bbaab732b3c9b266bd749974f4d29eeaab2f6fba26cc1e89e6e33f4468795f92d51faa4c0eeadb7afd93bcce6fe5473000755b9995f95f644adcc238da274ea9fd3e5038ca9df086c864a032b8a3803e804e6dc15396b266e29be91dd3f876bfe51ba9982a5021d828b158ac0bc256c68f545ca67478ca6ecb61b2b0e6e9f7570bad5536dd5c25b8d95421cd368842ab3aab7071ba9fd286e9862a410aa34263ac695fc3973242b72a351b281032b642a5a0c269ca2f71ea89f7417adc21546bac002981013f89aacb63a27d42ef33b24a9d094cf84e7cba1304cad9ca242b648402dbe574e489469c301c6e82b647dd06c6b80117ce02884c54c69528b5e6655460621f5cb1a4a70910ac7011726b6dd96dcb31d57aba8fee87c847e4a3a644e31f2811f254cf45d57ebeb84600286cb309a10d9717bb759e60bdc2f59f322eb5435c36dd55a16e59f841c83caba775b208a722a994d3a3da80c2ab5c30ee9b5e58e77b2baf7ca131b4aa6d3e24c273599002b0740afb5bb661401f74ea80154c02fb944b8c9589f654b880c6c144f9895446492dc27483ec822d02154b776e92826c294ca7393b20c6b1d29c4ec9b8213c788f39ea9f47c317740a0956e99cfbab1c5c2d4c6b80404a380b6f32f2b9aad4e0a0f64e9646112822d2ed934614c360273a14ca7b611080b51128321a494c7809aebcef09de41812539956b3bd3f4b32797fb7d19f65f60817346c14fb85f9457e163d9627004a023b22999c94742ba2e8b8bfd3a3b0e43408ea134e9b29cf95133829fc35370d954a2fa3ee1078283a1074a94514d30e2135c9ae5d16cb88135613dc18db3f299de309d585a6de8a93ed05d09d57cbee531a4c0fca2d333188556816366edd06925169030b60d3d540b4ca128eea9bdce862abfb42b144a2b3b6a364041f3041ed2a43baa3d55a50b69997e7d93abbab43366f64ef281efc9480bb28a69b82b61ab31007caa734d9e9ca65403d5dd712f021a0aa55bcbe64f3791ecad3a533e57fc15276542934e51e1df2bf8770eaa05b944289429c27d3fbab3b764d72d902ae23709a6e13cbf751f4375f082ff23924f44d1ec5347949b728cb9bb0531d423f7e4f790bf09e761dd3301143745745d1715e907df476df0a740ba6b283907207420a15ecc3861788ca853a9b2abb1d13e93a9fba6d4cab90704e470f40a6957613dc067b2cb5aeaa77526a3894dd8b7461069908795788e9dd338a2c6c2e25d4a07ee4ddd54c61414e76210509a5cdd935e6d23aa940437e53b1e6ec89528269c8555ec2d6c1cf5d1ac2bd49c437f0adbb74f01bb22492985ad6dcefc226e7130baaa7b2aef8f2f740d94daa85373c64f95186b7fb22d1b1d93fc9734a8ccac1db4bb1efa6ca4980a8e309fc47ed54eb3baa2e2f4c64a0c68d0a2230a04e109eba7a908688d4e83403bfd49513d501f7407b14f676909be51b63dd3515f95f72bee54a27dd0f33c9436d1bba3bae8ba2e204d37720287242328542374da93b141eae448ea8d31d1071a24ba271b27d46bda5d29c7cde5c2656eeae40a3ba09a86d3d17afccef4aab50bc9fdab235632ef4fabb2142a924586428cad90129b6cf99358cb439cfdf655203806a7010535c23645833951d13e1a708c461192c65bd020c754df60a32a14754021a36a74286eaa35a5c087653aca7464373b22c7154dbc2810fdd3032a3b2501e0cc8ddb84f89de55e2309cdb8c94f1fcb54ebc3223657788e6caa9fe99441a9e629cc4d6c3423ab585d250194e718036d3654ad8c94c3c9128340d472f5f8d0737f6d76d2565cec1400eebeebe657d8e87e02d86fa7d8afb15f75f94f38c2605b2cf5411dd0db470991dc23a3b4694103a90ad45846c85523d483c1d8a92ae529cc6bb7011a6cf64ea6de88354eb4db29e6d1350ff00daab552f3ec8681d017a8ec99e270d527a8438a759525d0e71ec8eea531b738342a917185d4765d49557cb4be532650cc94e13b2a91b04c5e2b40571877647d90db929b6f85e089006fd53816aa76e6e4c12ddf0b8b7330d62a4ea2d63ef6c984d30539e5c826b3129d1309f1622478415275af05557dc2d0a2022dc2a609c2f01ced91e1ed124a854698b4caf05a082aa51717121161072820a98faa10d5f7ba2d288201fe698ff00365e7c7f307dd098cf2efb7e506ed2bf0beeb7eab13ba8eb6e9f8d09eca7bac2fcafca765c9abf50f85be134c9d02ea9cabb6da8efcea5029a5053a6142845aa1030ae53a93a468c6caab5fc2c37d4a4b8cb8a89580a75a148577b83ea4613bb26d27382eaa9bc376dd15e18226f1b2a427e02ad52f216cb66033ba986a731d27ca9c03447544a69f2c427765600d33bab5426b254163a1526889ea5381b9cee8d550cbae85c3c110556a0ca9e6504aa94df4f0e11a0185246979884e7486aa387fa55d251d0343761ba6371baa8e2c6e020a945bab981dbaacd68680075d291c7d72602b9f0e24408504f96f3eeadccb4fb2bef2f6f409afc869df52611bcfb4a0df344edbffeb4ebb853dcaffb8afca00762a3fc3a1ca1018308b648c08d3f29c606c82082b07d90df41d114e5c536435da9d1ae40a95720ed484428d4953c802ab56ef2b7d3fdf40a472fbce5439654656c742e90042f35b6eca34bc103b26799f27a2a8e3e576e837cae7c20d2f283b16a9fe623e69d1a32b87f2bc18552931d71ea99befb21100278964426dbd109c809f43c26388e89e4bccbb257b28f2ac23baa955d56d98c041b805350e85548c11d74f13643887a351efc14da44c271b1d0d4d3235adba0c71e8a9ba0c1fa01e077081076e6f189f432502e7021c20cf657e70d36f7284031839fc23119f2b7fa95e289d94a82547b14f12df4ce506c00202fb2d97dc2fcfd963b943ee7531d61102710bac1fb426323f48d2a76d42654eebaebd174555b73484753a35eae4c63ea6db775fc37fcb29cd7d2df6ee83b98eb08dacf527d42ff0061db9674311a36cb4924dfd15fe31f36fb2adc23a936e8413d963e265593b2a5c39f1181fb15c5d0a7460b4e8edd0f3085b14c06ab9ad556ea734ae95702df7404657a8a0378db4634bb65e19168f644984d3611dd35f764884439e729b01601dd5487b1cd95e0347ea92aa0b4cf744a09e20a1e94040434c9eab782a02680996408011d8a39a63bcaa63cbadb7bca71b5ba36b7440cf348184c6da395d5a701b2aeafd8fe14d6f75e33f7c2f1bbb57894e24b32835aff00d0404c6b5a31a7c2fcafb2fb05f014fbc2ff00b94ffc8adb7fefa159ee167b856e65c47b687ecbae79203c48dd523b83d351a39712cb5d7743a94746994c01a001ad460bbca8b4b54ea74841853eac7a07dd649ca88d23501362511a621536e42afc5db4bc32df316ad91f0bc068b3f984eea9d275cd69c4afe1db422a5c486f75c6dd545dfa02885d53191929c10df089cc943cc495626a390a1530fd81894241de506775e10896a0ca92340e97c760ab7957940f728114c6f995c403e5c14504fcae19b49c1de21d82844e611435ca69232ae27129b48c64f2d6f4a8510a99cf300d1b0d37d0bc37729d5699e84aa65eed800d50aab9c36d978d3bb7080bc4d810a6d99b44a9f8531d54fba95f63a0fb2fb2123aafff00aa73a36255bdc67dd37d3a4fb940fca1f65f74542f9d4b4b7215320e7aea115baaacbda4721d012131f201572b95c160aa94a36563d5aeecbc179fd29bc31ea50e19a17136d9d9056e834222142030a3ce8b642b159183bacb69a925667d952873c055ea9bdb31e55e353a90de90b89a81cd34d901a0ab2559fd131c0ee9e255de188853720aef240509aef64485eea0ca2d2e00ab8d330131f39d09129ef24991f0aab6183cc9b055adab4a0aa9c206c43954600f31b20c94ea54e8f0e677210385692e959eaa9e08244a392504cb642a96801a116f98473112213596a7d3bb21329dbcfdd3ab342f1dbd885752fd84aa43ad807f75b27bc3775e35f8b257863ab5abf3a12bee549ca953853fe4a0867a05df10b7ec8f4dcfb23bcff43ac953ee869baff31ae4b4a04b374d001df076e40b64e5c432d75dd0ea75a152df295722f5486274fecaa7fc64140fee0a7de50746e136b0f755cb1e25bea46993ec8d23d916ba7629b4dffb4fe1398f1d0a70eea17550834c280e01112e129ed168b4fd9589f4cca9f2b58d6fca71f146d94c36f445d4c86b1ad19dd5701b4dc2c09cc71f4f54da2f6fab0aecaffa67b94c6ccf7e89f49d4e27a84d6b9d80808941a9acdd6fd131b19409bbaa79b9c9b0d313a3ab343539d2250fe7437a2f0053985471e55c41007ba77641a7b2a8f75489e8a9d3bcc2a745b4c12728f99c4f74ca25fec13a3a2caa2d3709c2abeb6b4744c61065c7ebf7d375633f6841acfda3495e1876e0201add8727e51d0a8c21f6436e887c0d3eebf2511b8fca28fc2fb1fca0bee51fbf2bbd29ae6bc6553905c0f2ee16eaa36e05a7aa2d2d3077446b09ad530b74c76029572b961382972cac28055815aa342d69dc04ee1d9fa708d320eca133743cb2892e299869413a772865a9a5c3014615389cec9d54bfcbfa65530c31022171ae6ba1adf505c2c9adb2abc20a749c4bb2a8d173dd85598efd472bc1a819728a628fa7cea8d22fcf64ee1c1b93a816c2a565b29ef0d84e26e94c4082156a721ad6a650bb74c6d8d0b709c480d70dd0979b9c8510e74ae200a74ed6f554e8dea9d1731da0a0c0abd474968c00994cb8ab1b49b3d5079ba5097d4bbbff00b10676e4ca8e6c7b2b86dff852ff00d854cfb82b3efa0dba21f017d82fbfe117c5445147e029931ff943eea7dd1e59f6c426fd91711b053e20de0ab9ccc141c0adb428e556a77891ea1a4284d1a06c900054e8b69b7392774f21aec20e52a503a4a83db48950efdcefca8f72ad71eaad74eeac3dd58ac46902bc32365176e9cd372f0e4a345dd93e43482329b74e1530554100260929e6c4caaee8871246f0a8398da971089a4f1b8549aca6c9554b1f507ca735af002a94c39842a54fc36eae0e8803083bf4bb74f14ecdb276549a6cf7469c33dc265d1b7459653298e0edb601032aae1e535344055298a9ba6b43440e47b03c414d686885549738f64ca4cb06132331b74ff60fc3500766956e7064a68f9f74046ff9e63a650f5bae073b29cc754d69033bce9f743e10f81a1309e2e1785b047e023e675a3609c046434219024674df53a625bec5300f99ea9e434ff745939622c2e6f9bfa20cb3a95be35d938755568dde66efd46835a6df05b27d451ab2139b253a1a36caf110a883d1780a94bcca6ac756ab08762405e6570ea811df9c85909b53b84d7348f2945ad76e17f094ccdb85fc3d9d55506530381469b1db85e1b593098d0f79372a9e46aa4e73f744ba224abf3ba155c10e29ca9f11798d5cf8308025c5ca9c3910004c73baabfac27570ff002f4eaa9805d138407872670a0b8caa6dfa467a7fb1b6770837080036fa1f85f95fe6e8daede15b1e9213b78ddd29a2042fba1f087db47c969854cee115f8471b657940831bedd5076de53ca742272374db73fa4f5500e230b61a1435dd6c88ec9cd0ef5b657f0f4ffe617f0cceef4ca4c666155df4790d44ca2517108542b2772a81808395cae5846158a14bc157bbd95ce5e65950a14218d9378978df2995e97c273c38e365925404297555a954b30150a2583cc32b88c9b553a70d4fc04d6f88f4e6c05e23a5532e8b9378a78c5c9bc6776af1e9109af6b9d09a15422fc959de53ea5a329b8ca6f529d52e010ec86029ff0079bfd2ff00365f952a3cc4e0afcafba03d90f81a39d0f1d940b8a28947ec8886e00dd31b19313ca740ad0791cbedfd34df4f950b3a009c554395302539c4e4a9454201342a74de765246088572952a503a10a15aa142850a142850a3b2679130827757366275750a67309d4ed0b88385c3d3812ad46931dd139a18c4df33f055b09d521c9a7a842ad4e8e52f57a2e941fe4884d0083de1526b8260cf35c55ea47fb92493013db0244a2e0d086da1d33d57d97e57e34080f65f644c04e87b6e40e3de13aabc1830af073254fba007b2109c4f41952660f284393a946241c4219ffe727db53807e14aa825bf09c654284506a14a17986d1f85754fdd1a07b978abc55e24a6be107a9533cc472c22d09d49b9c04dabc452a905f03a4ec9bc716c788cfb8d932ab5fb2acee8bcf3882144696185c4dd6ae1696e4aa9e56a82f72b20469b280adca1b194c26df94dd821529b704e5483d799c8697157ab87fb512d116952ec8447e9819df4edcbf9d4285b7b230411280001550163a7f089151a7b809aff000dd1eebee87c8417572c6084d2493cadff002341a109e220a6881c9f7434705e568caa9504405ba844284c6f7e42814008511a495e2a150b93480ae45e1033a4ce9088e6af4bc467b8d952bc0700edbbfbaa35dd41d1bb7b2bdb55328da665650d4d362abc35edde133847537653842a9e508495642b4a2d9108082074081ebd13eb5cf3841cee9210af55bd50e30f56a1c4d3283d8762890178ad250239a4ab8af115e148fa5f6e78eba774563d97e17e351f2bf0bec82eb8ef129c3a754592db4e55ad1b04e6349cb421f74d4139a0a2d8f3139f64d10dfefa1d5a87242850a15b2add0944ac004a6d2b8cb91a76fc2b51408952a51287a7477c261f2a3c830bc4857b8a1ee815250577312a5029eef06ab87e93942d78ee8cb0ee854784de23baa45afd91f13308557ecfa708546f7d4c2aad6d43ea854e916a1b26a6f741b2abb8329c774c6b06632ba27e02f11ca992e1a5cfeeae285442b7ba15ca15daaf69ebf42e72f10af102b877e535bcc85469f6fa5f95f728bba000940fdb4fbafb2fb273ad1287e7df428fc68137e4fd0fc26f9f27ec9a7cd1ed3f4a51d1fd0209db23b214af19c764ea2ea7f1a4a2537652a4a6acf3dc8390780af94102a55da3cc2b94a95c5b6e65dd932a39a709b53c412a8b43de01552ea551cc3d170f58b3cd099c5d377b2969ea9f469bb70bc0737d2f2ae78dd5675adf750d79994c16b4041391c3420202e31d2e854ae2e0d50b882a13596b40509d80af74e0aa65cf950a615c55e85454dc1cdfa52bc4210abecbc40ac6d4ce536901be747b9ffa47dd7f38774d35ff00fa84f5e5fb69d4a6f5f9ea82087c21f65dc2682096f4d0afb847ec57f9ba1f1c851d7fcc226c1b7c420fc7f9854faaff002792679a15767ea4d77ba9f74197fc6ae6b4992d6cab59fb07e17854ceed0bf86a31104277067f4bc7dd3e93dbbb61371ac2851a11a840a054eb29c4b8ea13b2d2109617e01f94c790edd70c73f195c45265521fdc2736c6ae16907973ddb0425b96e1378e734c1ca6718c76f85e2d20dbae4eae2a1cec853a5d11c041479d012f9ec9a24a7318eddabf85a632308d22abd2a9396954592ff850a1573034a4cb58142a9ba04a639ce30a15d1b390af5075438b3d5a9bc4532ae69d8f3f5d58d2d9ca384ef19db0856d7f7fca6b5c3d4ee7fc68fe9938fea838931184348f643edc85123b95fea65db268b4c744dff328721e5d8442a7e90a54e8ed9119f7e69d0d0a7be47c2145a3bf2390435ffa9f64ea549c0cb027709fb4fe51a551bbb0a9e51ca342e857c9d63429d8aa1c8b7f2b847775d1714e86c2e19ae3f09f86af53906408446578a26135e770bc4ee9b58296992133d3f2bc66523e64dab4dfb3872784cec8d1f74f6162ac65ca9b2e70088508b1a7a2770ed3b6153a364a220277a9373d501a5dee85578fd48714eea10e259d50a8c775d1cf6b536a3502348a8dda55d5bdd35b54fa890390985e7f61fd503333d17e395831fe6cbefa0f8e43a19f746e6633eca5b333ba63a761b21a9479420502a74dd79bf0b623af24e55d3cc4a77ffcb29823907afec8a9427328b184c9603f65e0511fa3fba1c352fdbfd57f0f4aef4a3c3501fa7faaf02867c9fd578745db363ee98da61f6d4a5fdd560c0e36a351a080bc51eebc52a67729a79494c0d2f0a1a60902500dbeaf69544cf94eeb88e0def320aa748b0642e28e2170f4e4ca213f0d2832e2ac8002a86c42a8ea983f96d1dd4ab1a427f094f7182ace269ecfb87ba1c496ff00a94d32ad376c75e21ebc4a2ff53553a6c06e6951a1308674aa60293baa225df0ad4e1013b757140606a1ef1d4ab8abd07a0f3dd7f3d343bf51e5261f9d95d9c7f4570986426171cc9d3f3c834db90a3a113baf49f2f5f654c5a000869e6e88191a6da9d072ca952a54a30742a63f28191abb6e61ea28a847b2261344e4a73a02688c944c955334c81d952a67aa2171349cc37ee1571b3935d70d4140f2129a53aad9467af44d72a7eb691df5abc2d37a6f0e6984e1d1710736aa0ccca2154a01e870cfbc28c9ec30abbad62a7c63da99c64ee132bd376c55a0a341bb856bdbd503e5caad520aba9bb76a680d6c21a3add942f0cae203bb1446570ecf2cf750ab18d29b2e7850a14272150a15142ca131e6df9cb41dd3db2216163db9021f2a10fb69774d0a28e806640410ff002349fee8e243761bae91cb1cd3ce4993d9007aa1b0fa1ee9bb945130340dea517f41ba03bab8ca68e4f65c470845ddba206d283a74940e92a538a6a71bb740aa1e6700bf9ccff9042bb7ae0eb5a1ac28d1b8c832a9b2d6a8570984c1d5745c5bf0a98b880ad551d626719519d5338dfdcd4de2691fd49fc4b4e1a83a9bb75e0d239088e4664e900a7f0d49dfa57816ec8b0855e505419b950a142aa542a4d97a851f4ff3ca10f8414ec808d0e9f9d3f087c21b68580e7aa7344b794e02b7dcfd934ffebfdaf558fea9bb22539d2808c94ea85d86aa6cb7e55c649dc2699ca952a742b75c6f0f6d52460150e0a63741c81572b95da5d6fcf653282a357c170716ca671149fd516b5dbaf04b7d0e84d73f6705c4bdbb14ca6245aed4533792ba2dcae2dd3523a2e159bb942ae7cca9b6e7050a11c20eec50a8e08574daad5e52a1531d55cd989e52c6bb709dc2523ec850b040569451c05532e50a833cb3a47d5fbe8105f6d261d94dd4ab74fca0821a9e47090aedb7fc2f8c0fee98206874f85b1fae56d94364f74e10109cfbf6d931b08ba04a9b7ccdd9336c0dd48da74943acebc4d1f199ee13b1bb53dc0c08d24acaca716f97e179cec21068eae5fca1d4a60a6e3eb4ea6d7b23b6c9f80a9f195a99de42a7c6b7f5884fe2a9b460ca156955f52148372c2a4f51ad57da43531b2abfff008f764b4caa74ec6805543011cb895c33305ca142adeda06c00a1070e855ee09b5caa2f0f627f0c1f99caf0aab3d2f4da9547a82155a5483cb634f44ee1c3baaa944b1ddd426b6d680a3e91e4203a6efce810e638f6505dbfe17a5d1d235184df64353cb09c2e8e5b7a4e15b9fa3277089f6f7d0721d93dd684155ab3e405536464efa3c8032bd39196944e016ecadba1c31ac2edaf15c34b6e67e139b0a028d254c8f8e40a9136b6e395c60f2dc3aaa0dbddb6c8b53840942a26bdecd8a6715fb820ea6fd8a008f84e3e2549e8a8b61ba44aabc3b5e9fc1bdbb653596b40509d809d972632e7050aae1aa0abdc3aa64b9b2552aa68a6f14c77b20e69d8ac234c14ea0efd2e214f10cf74cac48f336107b4eaec3494eaaebcf654dc1e7d3c8040e6cbbac0fea898701a1d7249eda05f84395e096e113f6539f2ff00e934bfcd9c744341c8759d1c5cc7142b37ae10fad988851dd6c351524c009c6021e248b8f55ea32aabf3633754e9067cea7dc6163da165be66ec9ae042bc6dd5789983ca1717c2b6be5beb4e696b883d358431a06b8ec10a0eeb854e9b59f2828f1185a7aaa54c327e539711810a952972b13df694da83ba159d616dd92a932215b58f9d8ffb26f10e18a8d4d734ec752d053a8f6558c288549b8950a11a4d3d13f85ec832000abe02a5b6e839c09829bc4d46fba6f16d3be136a31db1d0b014692b6a355224eeb8875ad57b0ee1536b465bac733c1230aec7545dd879944bf43a38076e9bd7e50d1bcce684f6c988fba88ffe693a0d4e8757548741821452711d346d3832e329c48181255d5bf6a13d75d82b64677449ff00c9e6707f42ad1fa9e98e6b7a944f96774c2d3b04fbc9c180a2dc7529c4fa5bbff64c6067275885bfbaf480400a3ab161ff002bd58726dcdf853a4a0815c633f9a4f7cab02b15a50a6e9d952616ccc1e5694fc3a7ba3dd3fccf549b0c956c8553869c8285175f042a4c9a9f08e02a15a996813944029fc38fd2614f114bfe699c434fb6950dad28d400c10aca6fd8c20d811ac28d38832e40c263713f750aabad4dae42a7c63fba6f19fb826d5a6ed9da121bba796d528f0e0ec506da00d27e8f44d168f75f9e56a6fd90fa054ead439def6dc416a1e15d372817dd784eb88f2c7cab2afeefeab6531c90e215bbca1b731635793f6957b622d52f3b00d08363cc4ca2eedba103ff0071cae12b24439664ce5000655a3b29d6534294e72aefbddf1a8439827f9a99fca7d490214a6d4cda74855cd8d5c38f27caaafb29954c12e94caf569f5954f8da6ec1c15829d458e4ca4e63bd585c4bb60bc463b76a631b320f33f011f35ce4d61240ee500a1573e6d283772a346d5a8dfd49d55eeddc83ca6d6f742aabda5151f53fcdb509bf210e73fe4a3a421fe63492ed8e3ba6f5cffef53aded798b1594facab19b5c851ff009610103089812be77427007dfea3a1bfa4213d940745d92aa3a301460f7583809a461aa54ab94abb9234b87f81344a27a23855eada206e81cea39c2053fc9523dd1dd5deea8b811a556de5a134765c63a18b8767904a708053a6e5c3d6aa3672a7c6fef09dc5d268c650e2438f99594aa214cb36cab94eb4d98caabc35e30555e16ab5b004aa2c37931b61427e027799c55a98cb5a02850a139c6ec2154f54d378959083ca1550abf5c269f75d11000f844c47bf27f928a28eae98c20f18b617893307e5330d576a7643d4bf1d5431f9d4e558101f5bd217bafbac2073fd15cb2a0a21050541d25192837ba27b2d956ab60449264aea39073855da30e8571eba5281f85465cab37c3a80fb20ec2ae7c6a8c67ba6c0c2e20c3501854a9c37e516a215e2729af236299c5386e85563d59fb4a92370819e42c6f6468ae218f03656aa4cb9e1422142a981a42653b5815a9fe55e2350f94d92ef8fa3f9d3f0bfcd93ba209a8fa47f854e7fba9f6c923932bfc84547240382889b7b053c8e98c09573bf6ba55b3bf281f5a3aaa8ee8a54b8a0093050620c501614c4e15d9e8ae57696cac0592898556a86a7b8bcc9d3a8e41ca340880e690554639b884dc985e91b2a0f8327684fa9e239a9ce2012a870d7ff00310639ae25c15669794d64b8050a155c0473954193255ab629b55ec4de25a7d4a90639d21557ba981025338b61c1c1520f23f8763fa21c3593088211d3883a5165cf1a42af2a16426081ce480aef91cde93d534a0540288feebfbea4e1641c9df43ac7fb52bee89cfc72d4740c6e80d36fcaf13d95eaf57a9527b21b28f75034cac22e556bf409c493251d0f28e709a2df2d4123ba3c2b376234dccdda9cddedda153559fd17071e0855bd07e14cf452e09af70f520657127a2013196b02855b74d7b826bc3d70b52ca9f3a3e831dd11a1529e58e43887b70e6a6d663baf244a75109d49c0615463ae3eda70ccddca3484ea2c7744fe18fe94083cc764cda7a947cd11dd5e3ff9cc102bc521db20e0edb91de9520ffed33733d8690a34c0420edf509f69ee8140ce794ac92a31086a70b7d0c1dd164ab6d41ad5850ad50d5852a51aad1bb823c433ba3c4f609cf73b73a9d0a1c8351c80a2e1807aa0ec2b955a6dcbc2a47d4554373951ad6d3b7faaa9c400d81e6c6e8bbb20e11b26bae3941cdca7825d2a9b65e028509f45aee8aa70c63caa852892427632a971d55a63754f8ca6fc1c1520a2d053f8569c856f11476f326715387361020f257873d3a9764c6dad039a930b74f9e42adf72acf7c7b219767a6bfe6da840ab5ae31308870dd332d99595be8403ec50001c0c2ff275381283637dd7a7a49253761a428471f2ac19fddee86e3e3941f54eea7db3b26efb463e9bdd38e5395b20e572c950ad0a07644070822556e11b05cd31f2a54a9e66fd422e6fc655224aca2670acb53e6570f01be60aa51fd87ffd2ea6ee884857ee98f12bc80485e2754ca9276d6142ad86a61b64f75e6794c7be9ec5338dfde99558fd8e8fa4d72342a33d0e5e3d567adaa9d56d4d93cdad29cdbf20aa6ca9789d947214cd9520e1bca355a0c2730bb20ca636a0dcf3476e708b0874b73f09b588dd31cd3e944da30d4da8e1be56fcbfdd39a1c3e539af3d364e6919bbd947450a3422632ac9dca021c71d39a14738d09e89ee8c75e49086fbe919fa1c7d7ffa43eea50a9dd074f30df9c72b536980242735398ee8bcdd560a6ed09ecedb27020e7ec9dbe0af642cc056631b2b8edb28a8ddd0a810a8d985be9c499c232150697364ab554c04daaf6990551fff0020f182a9f154dda4029ac6b261711910110f69544b8b64a9d08d230501085570dd4537ed82a9b4b46aeab1fa50aa0efce51c095e6ee102ae7d23f2a5953d933c80a155c100d3d34f144c6a17b2ff00256fd34fb295fe7c7fb3257b953719d42d960ac7d0af57c1a65dd7a2719249d787a46ad48e9d4fb27be99aa4539b7fd8b535f0b055a9ec946891d50c26bd3e90a831ba7d0753390beca0145e5ad8e88bc94d25c8b4f456da046e5521ef94e70128897929d9fbaa4cb5a02217107a2854592ef8509b5aa3362a9f1c3f584fe347e94389ce50a8c7af0bf6985e61ea0819d8eb1a3888f36cbc307d255cfa6615e1fec558e6ec8559f505e1b5de929ada9f1ce7220a323aff00541c3a7f6575a7396af0f6b329b55c102c7fb209d54cecbf96ff00629ac7b5dedaf5d3b7f93acfd7c77e43a5433e553a4e9d741a4724e9c5d6f16a63d2ddb90beca7e1b7afa9501e695683ba7522ddb3f5da86ca507ac14fa44fa51ff9355a7a2a6e5bee9fc2b5de9309d44d3394f7dc9fe5184c2e14e2152727be153a8ca7973becaa546bdf8506365e1b6e693d10d91c05572f50a93219f28b516ab53df6942a0281ec9b5dcd4de21a7750c72878db2afef8d71181b754439cd0854e8e469b5c3ca98da83e158d2a00dbe9384a3e5cca99cc944b3677f446991b20e7370bc407d411a40fa4a0d81cd3f46e1df9dd981dca308efbe50da54e84c0d30a560a1a421acc21f2a7b8523bae32bd8cb47a9dc94693aa380685c4d0a3c3d21d6a39516c350551f6045ca7e80e56a6690a4ca0f582bc3ec8e103a63aaa9c235de9552839b8409ea9adcef08f883044fbae20590deb0bff000995010aa3ce21502e2e0aa9e88b1c3741b261428509f809f93a50679655aa10738267111ba0fa6f5e17ed30bceddc22361dd7f32670a2771cd202b8737f9b6b77ee571c63e253ae9f2a151aec10bc312808c0d67b735edce469dbfa723b646213b30134c8e52d956f7283602db57193eda40df4851a6cb2341c84b4024aad53c47976ac6de6170f40506fbf52b89a9fc4711ff1d826a24344a73ae33a51a73e628d19d91691bea3967409a9aae57050a0a9842a7758722ceda4e8608ca7f0e0fa53a9b99baf18b6255671ade7852a9019eebaaa34e9c35c171787ca0e3283c0c8dd34dc11d2b9808051261065ad015aaae0215084da81c87b26d67351af2c3f45b9f32398845e07bf347f91a7f759991dbfaaa65ffa821035fba3807e111e981b2ba64723b6fb6c806067b75598689df09be9e5b500049406b1c9289d1e606375b699e8ba29d0f2ce806571d5bfe98fbf270147fea1fb2e278a16b98cfbbbb2a23aad93df71d18dbddec86860ee9ec6fe93f442626eda4269775d234f32153bac3916692be0a99f504ea0d765aaa5170c6c8d32d4c1baa43cf2e1e542b530c96aa8e9f313128e329a7b2e1dae2d94fc2bc2ac0b8e9c3b65ff0008e956917a75273770a21bf283dc1364b41436fa36f6c2b5d9e886f18c76e696f7e507908070a48dff00fa9b8746d0de5b08f49fb2b322731fdd34412399ec276dd455085e0e76509cfb535e49db4756685797662069b685050147d0b7aa0aabfc36dc9ee2e25c750253f88fe506370d8fb9597901010aabba0d37c04d018d84f79e8536a19dcacf528265369a7b27d070db3cb3a35332e89d67be83585852426d50561c8d3ec882107295bee13e831db2752b270a93d94f0e1ba7d2a645c13813b950b878bbcdb2a75e5ae6b5b08bf7ca06e57a2046170ed86cf7e4201553876b97f0aeb82b611edf4e395dd07bac6c87946790140a94358cf2e1472c6909e1c0e255ee098f96928540e225a10c27d66ec999cdb1abdd27d95deda0e62a74985d34e36b5ceb06c348400952d68c2f0bf92eaeff00fb42a2dfd48bad1a08531b2bdc7b68ddd04133d2114435db842837ba670c1c7d4bf8367ee2aa70ec69805cbc167ba03f6884cc6da4a054e972dd6da140420e41eb0e4ea5fb51b988394af94fa0d76c9d44b70aab5e3e109596aa2e01860ccac9f2af4e614a6b6e6e1016b40e68557013728381fa31cc422c3329c339cf64000359414a0503f52391e486e178e7ac2f1fbb7e57894ff62f1e716a64fed0d5d937213ddfa7aea1d98d095287214d7858281855de29d39fc2273a4a682e200dcaa7c0b1b9764ae3ab5cf14c7e9fee982d6a73ae3a31b77c2b211c6870f4104dd868426e5ff03fbaa3d538da2513fd515101058528093859cca086928fca9d23db40f8ea9b5160a752ec8934e03903852b74ea0d76caa70e42682d42932dc7a90964c830a374c68d8954e910ff006fa15b74dd91cec8b80ff616e47247e35940a0ef752a4737f835fe9a4a944e0a0f24e5a31b94633e495d3cad6217753f61a5a22138da17ce87a289f9436500e748e43ec886b9010a171352f7c0386e874fff001f4a5e5ffb57155fc1663d47654c5ce551ff00a468d65e7d9400139d08e5414e54fcc9b4bba1a154bf59eea875555d9011f8c268eba3e6dc26bb694d467be56404d3a6fa4616c829d233a07157bb0b0edd783fb70bd3b8585283ba14fa01de94e0ea6af7444a1e64585b9546a8d89ca952a391c602c9727f95a579ba7e501e68edf407fb0941ca54ab95cae53eea55ca7dd5cae52a54a24f452ec1fd2b7d95b9de791ee977f6d01ca8d63aadf49531a6cb073a71357c3a703728e874e199e0d168ebb95c555f16a9ec30133cad9d1ad2e30106868c228ee5526cc956af09a774d6b46c10d5fe92a9e1a98eb58e3a4498fceb524ec9c4dcd8e88394a10a54fb699efa5c881d0acedaeea0ab907215160a7d1076c221ec390a41425183ba7f0cd3e9458e61d94a7303903529ec6536b35dbe0a0a42c6955c9aab1110a106f2ff00444f60a5dd7eb0e4254ba270aec20f90ae572b95cae5713ecaf31ee813d79453ff0097f4080b791e7a2c1d0ed283b6d01508696fba8d37c21d9155ea789509e9a1d386a5e2d41d864ae2aa78744f738080930aa741a536da3485637b720435abe9fba1b0465123250c0d7c2047ba7d17744646146149138500c6560e13813b00a6d30b7417baceb8d08956f62a4841e9b53bac14ea20e4287337d4c1dd3a8fed4646ea251a60a1e2d3f70af945ce00263fba71972605538169120e79234ff2346ec5c51f32738ec3e91d5c6029d6dcca874a734fe79a0985613d5581428fa04da8e546ae6c8409d903cdb1d02e32adadb475d4e9c252f0a97fc8eeb8dabe255f66e1521d51324aa4dca1ca11e57fa9a135a485647508799f1d06fa8c9d213a982852845850f744e55ceba15532ec2a4f29cfb46e9ae0fd365ba8852aee4d90720f5828b0221c35df7468f646e6e0e8448850e67554f1250c9541b2f1edcdbaf6d2dea1650de3b7d576c98e1f6e68d2147d6a8e74cf4432b6d2f1c93c8359227b2aaf351c4f27074fc4ac2761955eaf8549ceebd343e5642098d80872f4d635dea26b9b03ccaa168d931b68cee77d69fab9611a6acee9cc72346ef9429786b6196aa459d144e9f744e820225d76134ce85429840abd0328b015610bcd7474595bee8d1fda510e6eeb74ef64c5c3968dfaf2ff009952a7900e6f57c28822399e0c185eaf9fee9a6473c7d270b8ff00a9f654d8f07391a788d984ea92eb796251bb10e4250c2df4c23853af1756d6d9a9d385a3e1d207a9c95c755b9e183f4a609727eea90f368394f6e6a5b93a0cba7b7252ea7e842b516a737088731c9b51cc85e208ceebaa6bc68469050398d362a54680a0e5328b4282d58d6adad223752e256cbb26d4a8cdb2829d495995bfd076cb21aa7ca3b943d67dbff3cb56436423e713fa931f87639270a4db72260737ab7389d90c177ca66d3a04690766565847ca7bad8108968886e4a39f940cc15d74eba412b61c9d5390db5acfbde4ea570b4fc4acd1d374f3631ceec13897124f54cc309d29370821c81753a0d5e61a5531e54e303ee10103929e1bf4c8053a9a2d845bd5649466edf641c48ca699089d0ace5026349528852a535e6742c051109f206119bfcc8bbd935d7145b1d552790bffc400291001000202010401040301010101000000010011213141105161718191a1b1f020c1d1e1f13040ffda0008010100013f21947a0bf0e90e25b648949df72b172aed02e30e67280e86d8274a89a7128d75e5eba3b82d94bf5d222e033c416a4ca539e60d91163c8778b5082abad414d0c7eb53c4f38f789b28f5b945d64dc69a060c9575d0333d31e8238aa99230fd9352fbcb8837b895b602babbaf51a35042d0cae612cee32fa946331bb71c78e831b72eaa77484d46b99c2740403984f8033ee0a8d4ccef2e201b3081f06fcf40950038e9b620475157106d3ff886a162f737d387f86d4cb3163dfa163a310b1c83a9430ca5a89b9b958bb833730c4a981c41d06710aabc44bb95a08a666fb9e216b95d571e6382678085a0a623735d2d4c10ce2216af88c4271cd7d3298ee2665d404e712849474f65399cc7875a13ff008742196362e2b4ed739c749cea3d90af312530eeab117d29eb12d9716def20cb10591bc9d24aef99a87eb32d85ef14e235974df4c5f047074c6da4b4def86a58acd7de3865810bcbc4019f738bcc6cc85bf932d81642e6d62fc4b37725b16806372a09a9a7b8ceb9834797133cca370e9c1b8ff23a5741a6e5d1315d1910328924e2f8f88e55359993d2fa5bd4c03bac6058c0b65bdf12e9800d462e99331ef706be62f0c45599551c6cfa7414854a214b51da659152b306129e966e53bd0c543b0639264c1f4e012cee541ec23c885b9112012e6e8625567a552a9ed7366e10bcf50768b9806de823a8b970dc70f32faa2be5820b8652df04d856a18f42cd5305c7302e04d4254a962bd17aef3c081dcdd7a15038989d8425158624a2d2e7ba30f9e87b9cf6818e15c768028a9b686e27261c040e1411ad40086c5e289e304141dd8675edee3d12af2e6189c1a463c871129aed39895da54638e81d0b718c712c7b986e0ca0aac8f74b54d11d4b32f8eacc219437be871a98e846d12fbca06a056e7ca65789873a805e26c438105b1d3e67c331ee624f3d0b5aefd2ad42cfce76950dc9a0119387aac3730b6b30512ce6523167244cd75a8ad586220ca7681398efa0981332075188f5fdc0a5649b6c72722b372c945a6a96e8150b4822c32f49729786e18d4ce405207b51547954a8a6230830477798aecccc146c97712e09689a9c61eb44a9872b2f0396e509cf3d258f7062e5cb851e12dc3512da7994af85efb4b6ef99a32a54bb701bd18a64eac81962ee2545e8cc2cf4d1051482ce02e9b8b353744c6ad326d65d3d3884f5123d0594f40946f9844c1713609deb9c94665a8c12ef9961cc3784b9b78953325948eed40f7c4630d5e21334cadee391ef114cabe650a5e658ee710b3329ccb518c235783a9c1f3129832bd3fb118f4bdaa98464465b89551e6398c0adb16e6424a874309b748c547f9d02a13694171b254dd4df27cc6f1671d6daf9256621c929d303533ad08a35c2e219625c96d6e03bd945c57989ba8312b1411910af7613a8500ec661b1ea5637a251c4365e085e73f74d25c4148aeb69321815679944eee6c9da53d25399908c05e74c5c59993c2119b9536016e6d2bbc7cf2d8cac416cc01cc467052c2194c4085316f51d5a3e4958732a4bbe6c841a233312e0c32d42937a993130fccec9844384a6935e6513011be5398b89817cb485cc34f7150133a91f945a35f6ed1d3c6c65838e6101bb852b3d0a5e267987100da67109dd2f351968c74b829c133c77d25bcca0ca83ee1974d4c32cb0b2ae085c1fa7455126a0a4683d0daf6204367bb33e26688fac24b48ed2357885c5e0992c59da62654884f0e2a98880c4b5ac939303b114a6497274b997a67b9b786e63a0c5028e4d5f83ccb54b34f8b8011c1506ddba4ccf912ab3bb8ab15d9b8c6d6bb5ca93b9650655e421a89086ef83f78ec9737cf4ec724c51e37eb89b4a84b8ad668e3896256f79c40d2a58e56552505769561de5c1a3a3514c328b85c4dcef45353df37f0993b1c404129cca9a99ae81978dc47cc2acb98d92b612a5f9d4b5168c4e72f554c8541413bd89750a1b9d9e6a32b842a9f94ce933b61f540189b814932aae92dd372d9751672477484691ce3d10b6c1b6620175da58c236ccc631d22f0435ac89bbe950c6a52b500331b0e3b4515d3433982e1648477dd5a608cb5e2157703eb306c96cbf4861ee4fbf2586c9a19973cc4adc612bb3731da1860794b8be2345324b0ef000f24545d197ad4b6297adcb0ef302228dcafeaf98b799798542e16e21ea07c39751e96c2030b1b355ec4b68e56041bdb51dab52a5f44ee1d7b8138eae627450f94dd4324c769cbe24b7a2ee54e2146319e619dea50ac9ea0ad797a5a12cfb7579892c8527688cfb710ce81dc985ce267848efb03a997d67a04c8157442cc6634bac5746473d07fe83662ae6bd9e6503b5cc2606b93511ccdf4d230634c6d7d05e8a5626fa0a663d89c2037d4ca82929f329336caccb7694158cb9e823575033039419999cc56d84a335b47691db16660052bfa96d78a5ef2e6ee4cd79668698c9ee473058e25710b95310788e3923e311ef3882a0ef6ead8860f98237311ce3a2a50554652b530369e865adca9a1994c8b87b65254abade309f411115772dd6f44659a8b9e9a8f3057436974eccec95fda02b004a9cf4bc1a177147cba034d510bb48b4ec45103d743517a09798b589b97184ab254ae26e60511af6525dc982656f7788aaee19e2672005c0a2ca4c80c20ab70755e8232fb5cf435fa76cb61baca5eef785c9cedaea0b4236817fca65dc487139885f40b0c2214aefbf4c20df1d34b0159ef32e3512f30b4d1286666d99c5af1a949d1e6550478255a7e2737b1296c568899945dc8619e9453cc7a15295b9e5146201e3a15684f1d0001b54af996f281cf9890e039ed1199cbfcca98253c0c6a72975b862c54826e24a0b02d6853d08fd21720bdcdecc2dceaee78cb44dae5769c4a9df17177d2830ccc907c22072557c21008778cb5e54f31cc67dc5fc6414bbabcc7af1e799ce07d48693d20b66d708b55d0d41894cdd4c177d2ea3329a2c324c180ae5b6de5871867887623a5b9817dc8d1410d32c96dcc39e8c3a24452ee5748c73eb42159419da54d3c8e0eef132021d6265b6a640516d473599c2254c0ae8fa9579752ea88c735ed1231b752b351adccab941964a5798113105edc4b3537029279e8669cccff699ef98e6169de06e6fb6dccddc3698939b8f516ca4bca2b4118d0663df1edda3617885dca3434ae5f10474af980f717ed125414fd252ee94889a092cdf3c4135120991332a1715f5953099934f33223a677266118c0b83b44a8263422533f13247a4ac08dcec871659f51772cb88c4b0a16f752e292590b297e9a56a34f50dd9f98b1071df3120845ef0af963ff86728daea7dd0828c894a1da0b1e28113dcc7698e09c4d4a0b86f81be80f114868fcc355518023a5f1292b73370380b848261f9879afa5e3cf521caf13d5398d2d823ece1a25e56d95e073a798993df88658d8ffc44a3c4a834a65aea712afa34fccc36cd10c8044230adef0c8b997f74577e982910b896ce232ec5cb0aaadf596edfc119dc7e2253a8c0d6be6276af55178d7100b26fc4a0e138777420aec8bb6f5cc4b2ef04a53d2306b75a97791fb1fec47172b53c0890f9491c6556e4c4a82f1d9632e535c4f62d93cafa4cbc543e1e8d9e84bb940a2166612e52ed115cfd1178e70f4d1a3bb1a9663a712984023000c65051d37812f2c5774206cede0f72e7c603b70c4474015e26521ca5aca7683a9f4399762ccb7c84019cfbccb9057a996a2aa0f12dd9a9ba38e227cdd0a033516db8b58e8448e427212dc4cf0f24541c56656dd5c111ab43b86ef12a655af4cb8e3e60fb42d50f3d2a01042a2f198a16ac465651fbcb92853da6a33d433542ecf373255e65e27a4b14b25a97b654a87233532c3be807ba14128bbc062ba0405a230506ce236ad732c1898137b8c311ac986631174455cdb536a2bb4a96350696e48eddc94c17884eeb0163bdf5892af1d12ada67180dbfb8981c70b997af0ad3bd41cf997dc9921da5ba72aeec5f5283779833e786120773ca0312b8b854b410ad19831624b677373984ee62e5a6eb32eec84b3059e06f26a04228b92e0d62651660b7b8ef11a2d81c167787128991f4b4a52d5647f293880422e93dca086c1dd53b4a8f92e0887fa459b9ec4a996353c330a9506da73b994b5571015c9b82db2cef2932c92a51264e8768dcc4db4c58b31562e5c4b53957e66e4a315b8cd70efc4bc3eff3003ac080869b8b25772a7101fa6ef2bf88aa8d4d41a20950a3a5ea7b470b03889598f801418f1d156da546d05128c22c61595e65dbd0d6a732d9ee3874e805eed7999bb6c6a644afe25b500f88d85e38c6bb097dde7796d1adcb03954c4058efa3d6486d87a683da0b7b868ca7a0619eaab604e003e91a039e7c46e98261d8e250cd25ca1e6a129c42708ce52c72111cdaa98d1cb8996378a9637b1d0e19678840e58f30c824c476404623a10deb728cc651824d21f3118e9dcfd771351be97884689d8c16b8644afef732881c612eab6aae288f7b98faf3256cbe076832eccdb8710dfc1777f3c4d4c50d5ff333f6d42f4932843cc5b8e2510f302cd2f70c70fac698c308d32b73c42e1fb0f5280fcca20a83025233613eba612bbca030a88b150cd97b31c88cf8fa3d8943ea412a9b6b1de6d97646fd08bf88ed2d3983894ebbcdfb6ebd4ced867102656225e82b5572b6dd5ce082be8c453386fe22d5c114f13798dc92d8cee364c910452188b784e2215156af12df80d92908ab2f5501a725c54e1adcbd33398e7c54f60f11853a94a0fbd4abd902b51292e65f4b60d33598a8cc7d642dea520c554a533f925481a84e1b994954ed2f63258a8187150ecadda0a46107028e4a85d47a11bdc4f19146652d718ac789785b98bb8d8352a311e854b7a1dd0dcc01bd4b72c006e06253334dc07d2159710068237cd114fd135d379470bb4b4672ecf70ca2865941f28817c338d531bf4cd077340b8ed2ec980839ed3e08972dc464df10202cc6e62606108057c22f851a602b55ca907e6396cceea265044191c84b944c47e920017d22413bc111bd6c8ba722b3199c5c3f424aef171ec802877caa1a200897a89d5867c98876054f085e33c4c3c219666a3f1988e5b47291a4c1ee1cca8fd7d0a6fa0238f983995cc59690096ab9e08bb341b956d53c92ce73d55c1b0aa96fd5732e7c21e4e6620d8d3e2645ee5d7c471ac326f04b8b5c91b7a376ed1b567915830052a0ce8989ab604a8ab836e612cb67ed299d8964a22726e3860d02de604c37c92a68b9cfccab44c7b855950cb3b1af334e6e59af696778288a3de1a8a6b89b44947504e96efd1bfe4c7b204a344da983107b35071388d06d73d31378b2c08882a0e8a80ae84aab69c622f622a26e40fcc034951124627293f1291f98a9447a85bd4c72114ee5d94ea68a5171085463894c3b70cee6f9f846f34094054168e2e01117f1337820e6ec9068d3332885e7fa96bde4d815b7e661e46f987744604c7318c6ab9be9653b45e8953881599e625b30b2001d4709f88a89d06b31736f52848d4704c055c5d0348e09b9b65c90bbdbce3dca113615ee615cdcc7b251a3873d3738b70f68802f50b8c296910ab5363810f41c4ba3f53a116f9af72b9863c353882061b9983de8e352d66170b567101e67794566f30776662df1385cbd9d8860f67fb955c6febe225184e753080e21895c445f5b9dbe2e31570788ea611c319a102ba154dee1645e67f516277c46237b9de5ea966494b06dfb4aa2188944a04d2cb82eee1262242df89cce2f7325c83a0bf12e7642d6eb4fb42e3a2cf98b98830f3292ef22755229ca8112d34080dc70ca54412d59f17fe51ada3501dc10fc42ba930e263ed0058ef31ed700c597fb469c6b894a519862a657d11904af29e62572cc4cd8f50267a9e5026f51966603ccacdcfbd0c6afa53697022cb85a2f52b48a0ab94abb11cb1c66663be98963350727b80d17c4ef2d505db12edefca06dcf621e6b83b54418331c280ee9f4107ca287ff00642b0b620b424223986b700a4d3a82826c6e2601857672c2f4bde105b22ae509a591a0d6708041515107241b61bcc020bd1da5341f6883d8defbc29e5ff22e7ee4bfaa1b359960afefda1886087b37e6157bfaca52df1cd40f3cf78d1c117a4c208989614ae86d959440a9e74a7d25420c650012f91695995bf6a8a37156b3b52ebcad0d3057b959332d77c71d28e078cc0652e518843cbccca60d20b65ccbcb079873382beb99dbd2b3100cde221ef983ccf242fcc3533ef8956521858c283ef38950bcf306843071da35e6a0f32e6136f7ed2b67ed5332a694fd7b468b8b4bd5ff00713165ee647d69fdc47223d415095404c158a095343f13d6430cc7c41de3cea6c0e4a88d188d25f7dcbaaa3a9549835177184044967985214f132e8d741a1233998dbe788b0310c3e61cade593c450e7e63e6e3f71666e370b181840be620e1e652bd4c453cc194636b5c42aafe0f44a67906710005ac386603f4523c26c4d055fd65d6f73984f9619e1e6a63b9eec50207f1062f31e2e05cb99a073a9867bcc2d743a38e21b33df3072c660d83b9a860c369d1d686254611fa1583662501cb0097be112e3cc08b7fec672c7862a95e628abbbd9c43b17fb4cdc225d3ca60a2b2a5223df1363997a959029ea0a9767688a88c9a63b1aa266e0c0e6601ea0d34a8c0855cba9dc837b925e8ce637810eee0f7212ead97d1945cc089f0995350b53732afd32d0787f311ab17a8dca2f30ceea5ad82c28f52623b4cfc740d984c5c1995533646603d1752eb85dc0b3c2a897c6e9967679be4573370db305d4699e99a8951cee107ff896f89b6e1dac3a3ccf6ccc751f085a254a59cb04fed0e1260300c1f329bb9baa2c266525f68ff0a81882916bbbd43691f30cb352f4bff23ddadf43f84ac8b1fee55fa8e0d1e66c1c46aee7b2e2b5bc6e2a976cee9a431cf69b42f532578fa270b642c1ccb7c6186751c644503985d5acb4565d9198bb8831c77f11f7e552a58bc9a634dea086a1f54da39d4a4820976a98c76c809b422e990401011e7d07d4cac55b52e744da072b6515394f9888e21700fc4b86772a55df1102fc477c6bcc0b29c8c3e179d6615e5bb8c4b485bc128df0a653ff00b2c5a47f6dcee10e8ed1d170f5b5df5381d799e0c4110badf6814e66210a899e3cc0dac5bb6658010ec56e471996f658ad67280d993f9cfcc060311a4b205a5108692985e75b3a6204be946aa62069981fc5e86040742d324ca8ee6a7462d8433a9e13e944cdea5c5afcb1394ac43efd1ccdc495fc2a1681198b99ee2b515aabb997edf442d97d9cc2fb4da038b94a21abcc1a94d31c4a22dd6a576540c2df98a0ff009302b9ddc04baf5ff203807303f7b98ef712826654e05740c37b5039e226823cbda67b69986e7d21957d7994bc4b99e89cc94216ab51820745f646025e3c912b7c5403a8f84152d21dd5a8b050efc7477531ce20b8224e4c1965ea58eaf32ef8ef29eb1f339703a988416f70fc4afadc54b0795ee33e7381ec8cdf72030e6b31b519ae63e177986419e5dd2fa20c142230172f0b0565cb31b6ce929728838238e21d65564895d1b4c88a676dfbc150ab31dea0a37f78e6616f88c289ba6bf93a152efa71d1f31a868eaf544c465795c4d5c4aece9a66e0cc14d4af3d6b12fa24e265a83e2662654b353b2258f3cc5f0693c1e635b88a731b3298dcc69dfb9bab4c5388caed223be514dbe61e798fbdd152db86f9cee5e9f1f5f32f1f0e86646d4b589b9f865de7b912c1ed11a4aa38627997994a1e4c53a4a6007d1259bbf5530261320882ccca40779ed2fde05d432b26352c2f8482b14ca2bccb16a255783984f42fa9caab9a1f12a7b988998308f6868776e3b625d7d083bb68ef30d340e67ceccf5a8ab9c9e639937b871f860bdc17d88d12ae0694b3a891fe0b4964df14ca8159da23a61021bc39eead47b02ce1f529a651d4dcc5325622b24b45beec1c37a8e672151dcfff00034bae6269970789a629112925d9d6beb09c36f11d296cb3185863a33cc72f5f9eacec4b4c183967f939becc41c62059f7852bc144a891a7996e8f7362206ca97b8b9e07cc7b1c41d5e08d1daf304afc40d6b31976ea7d021861dc02aac6712b1cb3012e737863822cb7996793cc4f0d4483032dcb16fed9776b2a461ad733437286a489ef2937f9cc86d326a5ad98875151fbcb2cc5bb64634f7fa44c7e2639601d557c4de6db98ae91e49731a60dce1152eb1c474514a436f78962ee104d85bd301070efbc200b8543d26152966516acb1a95507e7b3ff008dc5689a52d1c5c6038605f42bde14b848354b2aa27f3a553b7a1965111fa60952a5a6a16a68cb1dc16cf0cc8e03d452e5caabbbb8c2657a274370e552ef3f59940fa441ccbdb95204afe0d9489d166e7151aebb1e065e4a214966dbfc4d05dd448792ee335cf30151dffc9637cdc1570df4330d3d851cb102998112c9601591e7fd8dac3ba5456fbe5842849f7e9289dc028bfa20712a181bf32e55c5322d892a90f295567b8f85dc080a263491bf3328eac6ee535ae8c7246562ca72ee9a99cd0f70e49fd90e2be9e89fdf45a4cc06d1bcf242a4731dc47da67f7613dc2541e658a3c4a2c3a85d3082677c755ff153275184a732de7a8c8a72e9dbf90c1f10744373588aadcc38dce20e58c31159d90da41cbb772e2c33cc20e7a512b70c28d76f5ccde608609e72e180959812a54a207d2244ea2b78e226e2d02c3b45abfa9c1c416ab80d2bc46f0f7f3ccc66fb3d429b1ce180faa64b529414acc53d218181cddb11604a1176b8f12efac067799b2330ca11cf13236ddaeec5df1acb8b8307996db8cc4e63b8c0058e6213c2255cf68fa5e77015a90bf4e2521a1a875515ff00495cee194201c971097f28b99705279a6e3a54cc9a67d9aa71189967c4f37b4cb1793fc9800506a00d96b2b30339e8548f315798d4b0c07b91e43127da14fea0e0c9499732818e8a9364db52c25819f042873379812d05ee5900c1fdca52e7c43a31ea16cc98971212999a8b80c3551a083bccdccad9c6a73d0b61b65c62575eb4f338d4a95ccd93370c43f48c5fcc11a5d4c8c01d0255e254d41977364a22111187de739e817711f51507d032e7d1cccbf99a693365de2b89426f5dfa026711af76a39a3b4a06221ac103cc7b6b6c7ae812008f042f632da8316554143395b0c5f0aa0028277257386938cdff00502411263ea09963d47c0a496b9a03d676a359f2cc6691762a5bd01971620d6c0e06e1d230d1d8db2c9cd4bca148b5d5b0a74e6fdca96efd12ec17cbe2202b894e7994388918f6c58728b07fc8cd14e3f79bd2bf11e14cf696ce64b0a19897294f79a5581baef0aa2ee086ce328094c5cc173515e3f973198c0ca841a22dc2f4e16126212c7a139dc775e7ab254e0d96c9f8995c13c609570c46232996b558a8f40608038832fa1d0e84c7f1a8c3018aad4007640ab18ed876d66050309ac014bd79f1322fb807c44b5126e2d2735291be6504b016388417b979cee617e4899d8e5a8b85d7d489cf5c8135b943b9a8c6bbd416e8888d9752f5296e4ca2d28b8f81cfc4a33f9e9971f5530d3f042a1327d106bffb86d25b086837f8ca784af794e7bbbce4ab728df823ee76d462af3da29887ee2847a4c53b2eee26582f881dd62391005dcc8c22d1a942ba12192e70778eafab14cc33a0947009ee09548c5d39f626708c6a6665a6c407b85b09d336896dc743de7cca6faa7f1352a1968c4046932aa3583b47bc4c2f045e20c6efa672201f73b8966efecc40d0cb2ceb819ff3f87771dd43999261d51b43bd170dab3aabadcdff0011b41f306a2dd6a3926f899c3d9a8aca7cfa96517c44d063a0a804f79494c4235c20e30e8e0dcda4f52b10590d17b2383b0823031d14c15755c0d54bac132d67ccd71de2ab8fc9305c2fa95f28edc8bcc55cb37d6ff08d96f132cb83d9b9c71d918d2ac424f6ae520955ad31c1e1f8205c103be04a1c4c76265b696a289f9c7cfcdcce8a279af44742aa19eacf7659d0d4c02e5dc44d45dae54ccd51ea71e9945f8a9f840d110a4977f07a8cd23e88a3bb598af3185600f960ef35f44b026e6fc11e292eff0054e48a3df9e19c87ea306c73c9298c274ac4cd7a822e5cc0cc0b9a823a3a25cd461ae945a6c66e67c71aeea8132c3cf04114eefca0aadf44b82b6470d43f595170e89e26cb002cfa4af0fd6760fee63c095d6aba10e8f442a07b4ac8d4b1f310ade61942f1b7d506af05404cff00c94188001084eb0ef996106e06da6f04e74d92b8332ea908f712c4789f831016b9783cb1ec82b291d07106a402d6a10ba5c7c4373218b3b5d358bf0f48e8d3fac66c0815a57b877a04c2611973e2101de9f8e87fa3bcec96626f874a9da55658257a23d87516a0c8ae6fe25f0440244ddd7454155e451707055b736906389c93866925126d2c15001e252f5a8f24789c90fee7f71c97da59b43215dfa39656bd74e819e4e163cb6f5ff12b47c2c40ba7bddc37fefcb6ab3b0ffb32583018c29a8ade7ab737d0a65afccb577117899d4aaa69dc7721832d99826036f68e7037ee6f7bcbb8c35d0232ce88bc6a64b25198fcc01ffcb36f68db88db89741b8ee3139223e1afbc37cffec1b8c31fd4c2a6326a2c04319513a4b17571c916a2cafbf7f10e60a30c33455441a9e4a941375b8e5a8295f10239dd2bf4828711a606e3b202f97ec54618bc4f3cfc5a816c014984e666c571b6744163c37fd4fcc98c542f9a4c02886c877cc4829bdde99eabe273cd72c7549513f566e72ca89a90101c1997863103331162660d91c1389cb12c08aaa0e5f52f5ea71ed297d4bb294769712eec3b4c13bafac103bf714c1ddfd7bcef3b4e3e6211ef70378c8fd6633dafa37e23df06e57db38ee7a99ffd34c5a0a3632bae88d30403d823635d0ed1dd41539e8a8cca18fc9ee7a926576cd8e994c47ca7b74cf6b957b8cd65283bcadcf785ea997d45fe432891aa5caee56f317fe21fd436fc7cc5b556258d1cc34e8e66299786c83c31fcca24c5b77511fe9e8f18abc4b425057315abb732af158770517808ebb58f44cd4c05971df1502d788902894788e3d9a9b4a575b88566f11ef6b8758bc44ccb7139eddc7152f0fdae51b6632ef3731f942d4654c7786e5af481cc2e53897f9a170ccdea0d6f743dc38b700db41cc5b06b97a98b8cfa99a2b0bc67ed2e39578cce3dce7c1030f52a3c950756e7c6634e103e860995e58b926bc15104c9b71fa4acbd92d621fb4ef8db2f73b1389fec42d8e600289fec79037b61f6313f3378269388cdeb8f247a66083e12d7835d4cc712e3996bebff00733b30c50042b1defda61d04a35515b6a76ed14e0f66514edece605d3e07134d09053012f88e363ae99074aa83d18b090c665b0d901aed2e6f337b26612b166ae57287674b825623892f322a69c4ba97a8ad86fde2bdf4a589de6fef3e6236f918e6154ee70bde1ae62a0bcd4372e96118eba8aafe679951b616edee0debff00517354cf11e20cfb74c881e2e1215a60ef195779224a8b24190b8f6980b9e595dce1087c1871d704c1be664d545068b82a2ee064fda9f74989de5b6cbd799388e40b7c37ff00255ccde637c3c39d92cfbbed38f71012a8ddf981980ba4aedde62db68bcf1cccd3a3cc1c4bc25c16942fe52f971a95c62d964d82b89786f9677fa4bfb4edf59d8871ee7fb0d6670f9958eca80609ab9b0952be8c26d37fc9ea2acabb67d898208a6ce22e4950ea2b499d74c0616a9dba84328bbb94ff00b492f830733b5d077e077cc12010ce3a1df88aa5dc2b3092dbc4cae7cf2643cc16d4c31e63e220f7865dc28aa7111f590b74c92d56e3a732f6f667a105ea29e7a0711434158545f215b9861310d30b40c665d50e207b31658194df6869339c5435d8820f519b077841cce0b96010422de9ccdb08e65ef00827688cdf13b236af15980f7f30cec1b98b589895e6355e054ef3266176ee5b02880ac50429b2feb39fcfda0b4d29abf88e7b3184e6bbc05ab5ff00c7107b1ce0976fa9c7b8a2cd442f0b4f329069ea0c42eab17387d951f67b83b2fa856fb9e7e2735357e71a8e3d13b4de39b9de7c6895f621ff00b3df047e8105f844591ed066ff00b98beca7cc61989b874ae9a8c5ed8158054e5c7c4cf52ddc0c0a9b95d1663262232e27e50894a57ec9be1e72b56fedb8324e8088352ff103aba85b7b3a305c4a89e21b985c74c1f4a51c6aa03212bc3e652155a99b1b979c4beb3232ed2838dc13b406786440a5c3210a442a7079947da3648387b42b7dce805c460f01f423672f617cbe8dc2da67198b4666f8aa849c24ddae38858076c4d9de1195c7881b19551a13cc0306809682b716abccc85e7b4a202390f66560601e3b4b1698b83f18caed7d1c1f505b75865051c0e23e076ebc4119968f7205cc777fb99ca2569d7a98d77397f53bad26c4d6e777c4367a9f931d9073973e262856651383f1079fa4e31ccc79a3e6175e7f1317ac7695f1cb3d733eff00887e3753b7b98af7e25fc4e37cc2c70f3da654566d8135bb3580a7edd0ab104ba60fa05f58e349986a108651852fa30578ab164d2649e5a9e9896745ba01589bdcdf3034c6baa7f3330c8f0cc1b373fea1406dbbc5478f87505c2cee4a45589be6512c8665769863d0de70c0e768868639946fbcc0a9894df88471d1441f5861dc2d8e63ab7017e259cba3ca5a27a56d61b834688ac55518c5db17cc869f701b66d41ed34e664371f5958b9a659455b8a03424b339282f913b744b3abc40c0ef98c8239370d1dd86c9ab8c5f5c7a9572ee2b232f6b56da8f39ae25bf329b80df44a81e2899eab52c2dc1e7a100417b22e99f74b45242e1196594f340ab37c4dd667860d547f44dd56b6cef0e13bb38e731def5de2b7e581c76974b77a2155567697e1a9785f1994ab6cc89f4891abc05fb836321b66476bd7a9f3bc13ff09cf9d4b20318ef044bc871825ee53ba8ed6ff6e6d8c8848f899f83abb8e1ee4d9b948bda182de84d4ceb962414e23ae183a03a1474c4a8150b8a5da60914fb43aefc91a72f2880fa7458ba73ccb9a86b300798709b9728932c69297158768e3dd32b5f32d656f119612ee7334eb60cd3a9813a51343995446aa6060f932dacda373034f9be598f12983d9c4441e13679944210dd24d7b80406a34c06e6c61ba796663351c2c4d11df78c6dd412bbc2e9b53ed0ce8b01504c0bf71f5a61160a26c4db0a5cb00e4fd1b8ecbe2e584705e231c0d4d79d630e7700bbd3b711c8ec6207080ccb640408f118b62980725916868978304a2a12bc7d51bab78e236cc4fc4737d899bdea763ee55f84767bb39597403b6634f825bddfacc3bf8cce39c41f6bfc7c4e09fa659c78a7cc2dcab3c7696aa36643d13ff272952580d47fcf85bb0bd101b0a17840b4b421b3f56ce0e7b47e07d42d1ff8f89ff6f4ea598825310157cbeb164acdb08308232972fa2f1b6e3c1010a2fb83288352b99fa4304e997e4cbe98c4ae6399b4c930d9c8c1b6efeb34e7d4a3d8c60512aa61b8f68e204a4ca29b88887332c49c4ef255115e3ad4cbcc676d9dd895744e194b8c24ca8ca6b12177cce16a35da24aa83425aa1bf32f71e21d3de60b2ff00604b1ad5a398341a39f2c6d99bb9b01b33332938dcab22440151f94463da18d4c1a8d772ac52a6a712b0f8bfac02b314edd44e5066f031e27c4dcbe45fd115aca6e69d481de6e77cf7010fb4e1eecac87ce22a5b1bd5ea1cbdb516a2cfc4218ef51be61323f7832bba5ad63d9ad5f6852adcb9f572ff00c265c768b68ade20556edcb020edfc47fee9953c6204c975b6f897d8e799898cf8a8dba418d66502f7c2067eb8ff0071035d08c745056cd4be308b08204ef004af7958098e898efa7474ea3585133d68f8e97ca214a7cc5e750719e62a0e3fd9927f640817c90d5ca951371c98ccc93bc4ce7aef512948f2e21b4405470aa3a2e6a25cc60e9ef52f0c33bc0878bcc5f66196761e61d22f22906ae3da60301edc4c636bbd30179b50b697260bd3b6704cc3b446ee825d456678815f530b8181730f1a898748aaed1fea1b582b418d2d73da13ae9fdc5d2dd6a773399e0482d49780a896caf0fda85b4e330808b5667714e66bf4256c4c3862fc4ee1f117ed169711a089616bd4a558b4576dc07996fe67afac3cb0963c4bfbcbb0fb4bb9fac07bf198825452d9c5d4fcc1c97af04af1b8df712e1b673e639bdb30c468fbc732d46bc1d5e1c4774056440bcd3749cffd9fa07398482574f04ae3bae8a12fa7b510dcbf283794a4d456532ad53595211d2f88f39448760976ff006a67b7da652811e1232c65c189c11d47179e20ce2e561da02a89603a036770337c4ec620bc1b952cf88e054cc20285f79b6552e5788aabe63a2237778face2f4ea1c0f1510bb620cad06fc184555947d88e8066b9312c40f75171ac3146015da0e46184344c9185ac4e58ef3683b74dfa3ca563bee0c5036271311ff00a40ae217b28e194a81ccb8c151fb20c536c7417c3f332367f6877baa95143998943aef07a3c47c6228d372e014415b7df1983ccb88e2a241cb9861b8ccf10a0ed79c768e1dd1f4f70001db9996b8218d199c6e5ea5fbe87a867e9f311d2af88bb6a7c5c40abf5ee521db6c5c5f4417d43304accd87389dd89bf539e6f8e9bf0b1566bb87882ce3c521eab969a7dcb1823989288779812e338e979d8e2db18dc78e1156427d9104af1329842034310cb46db6bda3590fc3f116f11c242beabb798a4bb1aff72a265770f11e0c7df5076198609c54c66898214e37c1366e25f0fcca2d97626c8cc0b67c9516e51eb2def998a516be20d43b741579423885f5598ba54b52df680f67b370e02c0e341b86946094bd6f3539e21c302b533ed982988d5b18fbcc6119e60d31f303f78546981907c4c03be27ca2515ce6653de364ce560fed312d6ea6f7cc45af9b882f6c172f4567ae65ce211d7b80148af312b395e21a97d2ee012ef01314f58b982e717ff532c68942a0f10b87a8579e9882be5008b585e61ddbe095fe4b8ba7f6c54ad2698cc589df44d3d7788bd3f49d8fcc5fac41fdb9ab50449d9779b6ebb992076cac3cc7cfa3a91661365a98080768040768952d4521711742a5ee5583b94b8943043d9332df6f8b0fd0bbc6757dd3352d6ee52665b4725cb749294ec4c7b86a57227a8532aa28b00a94c06ddc6a372d9f101bb1a9709a8cc2ad2991655e6681a212f31338bccbcf4184370caf99cdc2940e6adca0005bc51d13f24c735dbde3cfca162e7ee95c82a445ed2d82db98bd267c4604bd9be35189de28ef3886e11e2982187cced991e2516896c6842d77159cf32ea9e5d30561b5f32868a4c4ecc406a9c985000a08528259b9ca0f4ccb9e25cad1a7bc3a654bbce7b6596100ce31b84589da712ea677f68b79bd45d042b5c4be4f467ef0b978f897f985f8f9e7cc792b46ff003327e7eb2bc06747fb2e386fe8dc06375dea50dec1de17afea19472130b0d57c43b77ed346e1fb896b0b7e937fb991f11eab9cd642052bebfc198a9890e227885c14dca096c8937631cca3170a77603682d7713b9b9f421a7062d9cf74e5377b1994c9e20ddd5a9badccb70e825b4cdf3f3049892d61de0b24da64bec540aa445ec27c47054597062506a618facb3ad4718831db52b9846647b20dc7411dc42802545d0435361a89761068389455cc85f32b4b8da2269b09751028cd272f478c100d777f5310195b7ae20b1dc10ef0ec20451c32b31af2ca44f10336ad078811b27bb05a18957391df69a1dc45d65a00c01989c7c8685ca0b04f32f5d6ea2bc279f4207534bcff0072abb3a0f10d2dce07fb8622cfa84731c67e7fb96d871da63a183102f2b2e83c4e50bed2a04774e01c1da1707c1dc380b688241a3c7292972c6bb23e502f570fd0959bdaf9ed39e5671ea5abdbe9334a9747fd8f43631982970b0a332e62f5b8cd234f7042bbb34902b7b6140798d47d8f52f5a975497333ee01ccb99d4a8b6309b27d930426452995358d6e09e353296255380b67d2e1328ee36a5667f45378a32cc9320f040ca3b553b8c1c43285cbdfdce6553e6c8dd525287bcab46884752ef8097be43092c3d1ea5e1a081026e5cb013e67e3095b8dc2aa2e501ab861534a860bd42ab3c311b96369169aef344b20f1155602edcc1cba710ed7b17b13220b4829519711cca80ed98e8a3bc7ef45cc3f504d48d83f3fc9637c9e3fb86e1a1fb4c187caf1ee5acafb08bf7eac7b66593cafd26514d1656859a5a1c730672649c1da5895328c06177d0077b81643e7eb158117b79063b08ead2fdc5bdafd198793e638ec82f730f6fac0ae1968ff00b32c2f8d4b067e2a7ca39c1f8991f1e23c04ac735d2e5cbe979946a66f88ba787d61131aa42d458beb2b69b185b799dd7c422f04552caac35079a506e2001f88ac7922c18101528a82e7722b26ef6959560cff008845582f1518b66d26165dee533281123605cd108b8a165213fba3eb69b667516aa6aa7b8d9667b960871cccada43316e04a0af9666eb1e66d9a3bc04945be21175a608af0ea7e3e117e7485dc4c620a5bc6f1895cfb95af1702073e260ab6b88604df68dcc214ca3d93bab97a458b984070b9cdeb57e102a36c68e2066ce60c26bb4712e299da2bc5e7a71d1893ccfccee3279f10fb7117d254ff0065e37a95cc3bb856f355880157dc158b81576abb8141a432f5dbe6797ccd6b72cce5be66f8806732f9b7c44571bfdc4ac5a773d4318b84c99d7b9dae5e33366547dffe40029d887ee65d767b88c1308bff00c9467531bff22dcab5e62bdbef3725c99f22fc4e197fc0dc35731a60f936788ae2f71a9ca29169e604ae1730f0def02e99dd0ef30b4cdf24e2b81ae195e11f5349a4851e6554aac6a392d1328670b3b405939a258a314789b8ba6425005985eac87d0988ee902e441cc835009dea2d7db3329a9b44e637c1c4094658ea907e476ed1a86c464a945e63348d407c2576c4c2fa84ce68b854f962ba295999336e01e26069627c4050e170eb68e7bc1b9e255b5aa8dde2345da09be618519fc228795cb617028b85be277ad5f30e0b94b798ab7de5461cc220fbb0ca419a99ba3abc63a19cb85c4b73d0c4ed1fdef1df699b789cd9eb306f6afdba9a8e7130657105e3508e358f19c660bae796069a7c71de10adef2b2a96caf8087887a9a764c172daa48388558c7eb7159fd11f72bdc73fb52b46aec0ac4a80d1e2885d40f39d471d90c9fa9ee05938cc185d2f3cc10defa9410c2c5e187241ab3b350b41a6ce95927108a1622531422b5f998452c1b51dd71af00f38677572b8095dd89966562dc7866d85577044964a8cabb487c15e37de25841f7bda03153491da05b9d8634f66b5c413764133eb3b60b8b982abbc6ee19dc8b865ddeab032450af7944347794a8700a2a1915ed291073195775328f408655e25178ccb3c4c9ed7b4b1c90dfb84fc6f352ea5915e7698a33053653b8aa0f443269acc75b2fe1861e6574f0435da340e4ea2b300f508b2e33f1ccd9f3141c8dc1daef10282191f12c6bbc7faa56bdc2da8996dcb4d07d62155fa8cbe2bfc873d3ebd2e5917cd675fd4f663cc25d2e284efd1d4ba95bb667e5f587627ddfc44efff00b0bdd7cce5e5fb4a0cbb99bce27dfccc16bfea5da0a2eb35550a58eb1963c84f35996d50bf0ca71f9882545735fb8d06a7b6c82750ab9086cd99ef11c4f98715022a377ee6a7c04c4473d4307b84b8afa387885bbd9da662d4cb6565f32858f9371ec32c23b9dd6200b22d2a65166321de6198239868046ae6b10c9deffc4b5c08d7a040772a9790f8a195e6ad443dc70dab3152fbc01951a9ac73dccc2d9305703310f10e2d5ee2b50f72fbd4702f69531de2858a9e61cbbb2bfb9a9cbd434b09608b789e085d25c006dd39f73215d84631970f64a713207c4d3b56ed62bbf6dcbb11e4646c6790302663789a1c7986fe2321dba52167fca021c2f700b9692f68b2f772c0d221eb8162415710c5ab7297383de22b4394d01515e12d351561aee37fe4a8ee84dcfded38ef8976f76b10fa1ef2f29c5659dd79cf47bf69ac539e239dd33dcaa543ea805be67f919d3db5da673c12f3e22da7da7957bca32592dfe3bc040adc39fcfd22015e2b22c6e9e6359d4b79afa4e76402f63d453b4554f2f454149e38ccc986387895d237fb97d332c14619e9ab70d742905956e0c41a6e9ef1edadc6c83dd31ddb8798e0a5ec9c4d5b47eb3b8ccaee22895724fb098a70c334ca746003ded16036cad278c4398e5ab8ce56c332fa97597e7c4715f048311e5954096608d4e0151f151ef81badc152c9dc2c2562655e0843858ca0e5db3299293e025082b303c47eb131f0861de1f618bf84056b8d42f4dd8f9102b85ad046ccb1ee532e59a1deccb755d9f7732fce1fbcbda0034f32b1bdcf6621085fda607662f6c2a384aa80499eef5372db1c2661a086e6f5c42319f98a5b5933bf682ad88d9d05890f23be9fc5d0d9a2c336b8c788400a097c4cf319cc4efbf306fe8d7da0d5bc1353b74495de78ac4ac87e9a9edb7bcf7f4ef1ecfd097ffb0febe67ef963435f151b6d61ea279f49471bee54a9baeee6882b8559cf8f10977761c9bffc8eefbf9cb2c79fa267fe307c9f1fe4f6227fe27094d17d89872a9dff00ae868ea7916e33b9de38e93cc330a09431e930e2c862e1e487c620fe932159f12d95f0626168e5d7d2529c11350e6d464b7a2a3650b1c263885c5f3e653ed0c57a851dae64449cc5a8ad3409df2a9da3c1da69e632b5d424e75e2665b3afa8b061500d5821280b58acf209c6d53c208ae794a58a1fe563ae819f11aa2f13c20a884dcce523319f5251c23c156fb44ab6f253519c8d3cc43aee5ed51d0a6712d50775e212dcccaa95ed2feeb8633b12ae615a62f5282a453c35186dd4a83ee086e1a851e8225aa3e8343332cc610a580dccefbfe0814ccb57f0054ac788b58fdc437f795d9fe895fac1d6e6dcb64e0ed38ad70eecd1357c798f951df9657c66614f307c00b5fea1bdbb172f3875e48e6a90e347cee77dfee25e90db577f78620c0edfdccf17f1332cc8f627cc3636b71da009af8ef1c2dfbcc1c3e9316603132839825790811c94f3d05fcfe60cb08a6495d994f47d48a5e0cc58bf2427f2f42d533dcde1f701d9f1386cca9b6606204aa8f5c4101f8103975d928ea3bcb72d31e201e77118c95c5bdc7efe0859271329c5598ee1886a614ccc4c7bdce05389c04d8ce3b55a2a5a938808789a4b1cb3a4011ac421898131985552a9a33a8c77de23d94b71da678b4c35c464e0846b06a23b71821854797b440dbdc6afdea106569a19480ef30c5808c46e6d617e61a6b56098dd188eb8d270ca309960b65685332b62c9327ff038f5ee197f59bffb98fedcfc7d30c1c7ee608608a05bda14358c5daaddb69177e1a6892eb52fec4f59eecdf9f13bd65f3c4e70e7bf04b74dbcc764ff00b31617e95f12dbf3fee2df6af50b60fd6a771133e7e638ab0a768fccca9bde6dc12c391968a652d8c04d0237de17acefde7cb8d188b4c955ed1d9708ef825ae31dfbc744e5e672f33698d69c3e7a6f1f30d32a96458185208c45184f4f189ca1f2978b1426eb8db08c07988895b13a7af733f17cce4e20d351c986f32809898ed7cb02d5ed1ab8868378b8e28ee0b8ebb97bb60ad0a4d73896b2f24a20e096eb01bcd434f86ca1db1399de09efc4a098bf5e11b358022d178932a7a51554316aaa81cfde5ef3b9e608aa96f112364338a0bee59c732b2e92e23c44adcef22cc04e06e0f8c32b73633048bcc52ec254a17bb1037c218c97167f84048dcc202984e99ffe068f13ed3d7a9cdcff00be666e043b99771ee732f6405f1031ad4d20379165dccd324ebc73294570c797fc98ef93b47fd87b5fa399a6d1c0bff25e285d9715ac10c765e229d15de0a61425dddbf327093ed3630fca2e783b84b0c6fcb446b6673dc9c1337dee078fa32bc7d5099bfd63a78bface1cfbe6698fb470983b377ee6fcb8c5b3dfde2caadcc1182c9427187a3de779352ac3d020af7d4b39971a60867702fa03bcd7419df4d4e65c73378e80870546de255bd2d75c442b42704bf6e628a079e217110c1372840273de57d62fbc2a27697cb28dc08b92a423a8f12f5f2bf5e2544370408cdc392570b75b81825902db0b9df38578965d622bdca2869baf32d10b651f0cb02118cee03ac8dc52d645e0448ae6d1d5aaa62f056543f76abd439bed2be86067c6406b5ea6934c0487d98f52d8ea5533833ee55bd5d93b135105ff00c30014c9bac7d60990d76cc77e6e6cf895026015ed1c04f3f31c92707f582000b5bb33cc6ac3d4bcfd529a113461d1061806d5755343813e67955002c2a057e0f30c84aef129d7e19e49f485e51ee2d55a18b01f1e33063ef6a3e43e67ef6945fe4998b739b71f4258251c6161dfe631b454aa9fbb8952983750c15f8ddc1463bee9f49a0c3cc31cbcccfee66a6e0a63c9e4c144d45cfda6b104d4bb1cc3b2038577218edf87d2358df6bfb8099fbcb3a7a8c589d75b4416be3966134eba02372aa186a1abadc193a1db1186a0815a0215b5397b4df10ea1c37041dd0b656faf3c398cde25e71d029da02b70329d8856a012eb96080dc813058b6b1ed58a7d670449adb1307cbd40fb4c033d84b990253ec1c4a00151b4617af994ac767bb44cf6b94477d09925a8b3093125c1b0160c78822ba50ee5880a5c8fe9c433852e543ad9778b9649f12eb518c8802cfe4f04bc176cc72fc5f797fba81dbcea13016ba87f7345db0310159b5f699ad8432c2eebc4c209ca6bbb82e7b40c5fff007331b2ef987830d684f77f2cf97e6525d5f5f98e554cbb45f02f88ff00e08a0fc9834557c7694e6be63ff8a7a500b4293d609d862a350aa91cf2f681ff007c435bfef30aed2dbdb388ba578666c378f88768f64d30f24c0bfeb1cccbec99740d4555cb89aea0824b39d47f9e6ecc7794e3a21de784de6653b688138b6fea5db59798d9021846aa5406048cdf1ea18e1956f6958bb465c2ebb425b7f952f68dd8e47a4510d5b71897a986b298825b47cc064b370d8fc626b8132dd410703aef1e22b3174f7a9822cc1e0ac13ef965e20cb8e2c1709297a9b6823610055a6fa58c192caa6183b0dc68670a4aa33982244a8af301661e2520879b151f895068de3a0dc0b788bed2bf007e61068dd4d7500d40be039967032ef3572afe423007d271f1ea7dde2138b2e1a6076ba8a999706fa071aad99b0f8c01ce73509a03f87799ef0bb64f820719fc932ddcbce603bdb5c4a707ca21ff003b962abf25c5576be3314194e038ef9801b4a998069dd4f4c5af3e8b95bfe99e4fa223963e11ae07e84c7c35ed95d9f59efed88343c7dea29b8efcc55185843f306abfb8ef9afa44fd26599a4afccecf64e751ddc608c404dc033496741d239718f336057e27888ebbfd2e77c3d95f98bd07de0586d803ca8c0132c3cc1dccc1995a3bcf9894d7152bac166989655b83b73994805e7177b8a05b5f332ca003695c5f11d9ab25577e60a571b3034c93dcec98801bec8e659d04a50b205ca2ccb550c50b976f30b551a88f93a9a103e882146d7307cd563dcf0c02f994722e5d112ab8364080a062ccab4805c7684d9bfa48217a732fee5820facf12dd273099452a076ef288a0b7530752c172bb8087dcc48ac1fcaea0f260ab2996ad4fe5f8af52cfa234ed465c57c6973763596e61c4f11d9df89b30bda6cbefbf52fba8e50e351d18a0c5ad87b5b81ae3c107388e92afef997708fd4250a527c905e61df03f30773f32ff002b9974e7ec9b53d7a08a9ab070646ffc9c5adfef68af0b1f203de1e78ede5f73e4fa472e7f012bb6210c68789f7f2fa8d0d5b5ea3944aed11568d887ed11c99fbb06f1da29b570c1ccc28ff7957d492a52e0e3c74544c25b61899181dbf611eb47925dd62ef99e01dc9c907bff00938e0aab1cc6b85ea5fc0cf982a373a2b714fe7a4a47e9936ab2ba8690cd6643350cc00c86619b487066f716c72b022e88e30132bbc70b68dd6a89e58e62c7aed68f50119ead3881e1d9141c7e49758171a3bc7da19c5d63125688ef7ff11aa988bdca44cbbb54a2a618bb7887a022e3d140a6589f730ac44487a21bbddd04dc604a09631715d5ce4807bf53c7ee0326841cfaa305ca60aa61da0c4ed744cab8399b0ef6bd4cb71db172417c13eec5c05ffefbc3be26df9f710a5d67bf9836777821b20fc42aa7fe22e693dfdc22aa13460974bc5b99cdd7f52ce2abc13381fb883f6e14f2400dd1f48780f654f0b3f49e21395fd49eb1e770be4be433de3759a38e20600cd14db5e65b65fc4af71f30895b5690c727ef98b0d36f5de719bf99933bef4511f15f1de7383fd8176c9a580020e335b83185525c3e7f12f26be08df983a8c34f5f683eb8f0c41acce48f32a12330511693e950923296a0e530f726db47cc1cf533f10061b8d9744ac62898b57b202ac8edb8eb84aa0df1096ed1070326631edda2681960a327133f3cd4b963cbb8a2aea26855019c59776554774a957b3c41432b1333c4de12a58ceeeb55bda24b31fd4c4a95cf6973c3ee80655da5f82cacfb941b90a5588b42fc4b2dbde10ad4aa19cc72aa8312e06d8961e2789254571b6384fb83037dccfb68a8716a8e895e589bac2aef2b4117de78df78fcb9b956cc2c7a3ffc0710cdac4c9c7f501d4d1295c3616f3c135dafceea3aff0059bc67f12f378edab8ed15f1788db9fcbcc4296f406d0acd3ec8565583bee7b13f59f27c9fbde0d83e503ff481f43dfe65e6ff006dc05b5ad6622afc47ff002d82f503602ea8e5f583c53eb05556fa46d97c7ccfcf9ccfaa79c475dcae35534ef99610a725ee59b04f702feb05bff81348f0bbc12db5c90912a6dee0d6260dc3498cbfbced1c46d2dd1a8ec0ac4d40193f8987285c7502bdf456e1c214654c11391f589a383da593bde586008e92e5fe93ca52711180697546a760ac10415a852ede2347dddb0c052de63ccb23e12ee68cc186cc080abad4145c6e38c32adc592f4cce3210438c62548bd1d31baf40c0b665e60f03714ab66263d567b8964ac150ca9fbde57bc0679806c981bc6feb2ce0e9c002aa7f888fb9895b40b6c18099c965ead18fff000166ee505f79404b5bc625f2c839ede0bef17368beeb95cb66f68e7337aff27afb4d7fe46b9af99970d57389d9c5c7b2fe950d3895b26b98d38d165b87d464d2c9df32ab20e39873f912d5a620c63ea436602525b75c4200aef9b73323e096ef7cc36d140b4eee0f1d39edf797b16061ff00b01ecfd66d8bf887c1ea2772bdb3e4ce79f897c1e7a75dbf30557ddf6dcd4aef1f94d9ef3a315281b778e37a94820d3f30ce393e20de25dabbca3099ff006444a6933da794b8650e5d102bf8c2030e19f5695e1fe12c6e030618c0a7a350511c327c4545d4d2dfe661d9943827c4ec19f32e622745a8d3021c106f571885a948751bf11472226bb12deefc4022666302e6674333814e20b58f2709c02ed285369af61f6ca841d4b03a2ccc73da6f55391b20eedbcba276281152d006a751b2bccb7ff8a09497282bff00100003ff00c0e1d17ea114f5e2608543e9e20564f598d5e7ef32ee3fb72f1f1e89dfb7898aeefac5a2f48eaebf5ea0825f63b392dfdcca530d6d87d305104e8e3987e99cf0bf2cd75f5431c07de02537ccdc69ccfd5c6b622052a2c3618ce2a16872b17bdb58994d178cb5f6cc70679ef99beff820df3f4979e2feb3f4b2eebe3c13193130110a35db6f33d4b6788005501f48e77f783f6a2479fb4df6bf706f577eaa586a5e8cb730150939e7eb1eef8370ee5f4263d57ddb17f421501be7b474ab97a1a0699dfc1e50984f3d552650a986a2fbb1d85918bd3327895d06d144b2b489db103ac3f78adb77772e08410e4892e6ea6db659785cb1f30608838b986f604be0094aed1434788e607dcabf21171e7cc7834ee1eee5246f8d57a88395b185ab5732c99dcab1f486abb23c5292cfff004e7ff370f5bef28ee59f67c47e9d1fdef2e7e7eac7cd7ccb6b9fa54f18df786bf5f898eff444653ee4158f071e66b81fb50cf0fa7feccda7d7a43c57a8f88b015019d54a9dbf331b7532b2eaf134f970eebbe273a2f388f1a9f3f5ff0020bb9fb89876fcc7cf8dcf93dea63d819dcaaafcb3734fedc61bfa6d8378b0f982ef98fd5f5979ca0fef68b5aee7830807b74b246af6a896511e8328f42a6666c7fd82ed2f3885ba4e993104e967186c661d632c319c2bc8bdcab6cdf30794bf70b00d9c757ed9c2b2f046c02e03d7a37938a1a3107b885130bc44ab2137188d8ab7e65e3e2b29c2dccfaf04d89cc772fe414a724134ff00f902b90f52b1a599ef7e09eb13e3fd88b106d9902def76cce2fbd44a54ac7a97d9e78252ab063bccd73f483dc7e6517b7da5a6d11f9430f27ee22c6c7f32975955c43dc066cc789520c9b8543b53e9801feca20ab89e02bccc26926bc41d81f585e6501025d6c8f9af98dd7fb89ebed13d1f79977f11975ff62307ff007fc892b2d668d4362e0c67bc469d1778859a71d9d4c734f4c2bcc0bffb2ddd7e5337387b4bc7dffd97cf1a8f404b654b7e8c0e33e102e5e988ddade76b381059b352a416b88100f3130b312a54aa9da574373c73310332917c4572de6b3f58a83c4b3f5ba25029bd25a838f29a3ea8ae570004a975a1280751845e255187b86148712b71b506f71ccdcc538416395fda1abbdc793906b0fe152a695dd9812d3981c3bc846c7ffb852b41033dee674bf074751dd2e6ac85e16a72e888a257266f131aff00acd65f996d637e099f9f732707de7c1f59f4429e079c4318b4f7f49a70f30d31f30a58a53c556ce2647511bb2bd32827cc6c4f8912c2d6d9e483dd45ff008cf697a456cc1bd4bb728a00cbcc42c56aab371f47b62fd3e84b2fb661debeb13dd8a2abedb9a3f98ff5f5869f1dea21d8980d1da01176f2f765625788e2b1b95bddb39ff215dc0a8cd64c7219a8d111f8cfc4dede595b4cba1b4033f022918b64bea60aed11d112a831e498e1f9845103085f4c25cc9d2b36cad435065cdc06aee52571f864615f594e9472fc90bcdd5f12dc5cbb9b40a87441d938c53e22544ae22c352938980de6773b8647c74956bb67655a9815a6672066e51b32ef1f73fc94dfb5352b00b52a72f8224c32a54a95d0ee4ae5b92131b9ff00e468fba787e2a6b8df6fe0d4a5bc9ef12fd7d095787da5b6fdff00e46d98b0e7e88ef1fd6341c939d5f9257c202ba588173c325f68de5bb423b4676ba54a0479625cb3196c4bee63414380cc57ff0093432fe09df7e1abf72b29a1ff008a9445db5a7df71f8afbce5cbe7d41ecfd08355fdb159cbf623bc7d88597aff257bcfd58ff00510cb751f430363e7981d0b2360d02b1393734713dfeeed295704461c30e961621faa22c38824660b8952e39dcec4bcf1265957061a88aa520b2ee2747128ebd2bf3d7e63be61f88f17060b778e89dbe10853bcea1db1e46a6ae0f514548d4abb812a8e30cbb477da58698b32c9ae67ec6a81f3736cab8cc942d389634e6a64d2c58cb605288c4f3b311b21331de547f85bde05cc03610ec417f883c8a879981c47e22c7a13f7bce05fbb35ff0b8dec6577f825ce12b4d57b9677f6cc0de1f8d41bcd7e481fafdef033c2015af3dbf32e95a289cbbe60d973e6fd894e41f31cde0facb1907f32cbfd50bacddd73b95107cfd88f82cfa135afa1355545eae19aab7ed35d8f6dca0721c2f8f32a45c68311ad8ebe847e75b9fbffb3599b950251304614a8c346735eb50e250aca10eea6f1914eeb352e5b31298dae3a1f821b379971f1fc451a8221bd12da1f58eb2b9e8630832c011b4f284561dbfb30ab781def2769ab7d475cb698060f1304e5e605c04e92ec90ece60ea172e734a6d01871016bde6360474396571cf31507afa4b2b205bea1525027c7d667589e103a44125a2e661a2334c2e03cc19c4a79a829b952a54afe42ef2d99e807dd93b39f132cad3c704cc3e74a6f1f98a68d78cc19dbfbc46a37e7bcfdc117bdbf4884366ac97cf6d89ea65e36c6575860e7267dccb17f56053f2d305700943c967ac4b79ee7171c5d623c5a7d7717550a7e9ee5714fc4144ce076fcdcdff009fec7ebe5d4ee738db03fb808fba99f37e6781c7d512bb6e964e3c47a6738178f662c533dbd9b6683cc3835599e3f489cc08b1b972fad4250427199d95a8f70976dc7e73e3ff0021ee5f8bc81666fe94abfe2fc4b28f305bfbdc4ee7d1f896e350bbd99f3364bfe439bb4e3a2fe00bb84c4b9eb1d54aa1a4cc346c04adabb9e65d5da5a5f44d6c727b207a48883dab89946ccb307430e21896bd844532cb96665cb3e9334d7f49410ea065c4ed0a35994581b58e4be5d2cdf1f1027b5667263bac1da30cc3237a3e6773cbd5f4a6d5a86a8f4a952a54a8e7d654a95a6fe08a8b4be08d8b4f8e819d45ebfb89c9ff00b1cf7fac6b9afacc5e3947c1f4cc23920ad0dc5aa30bcb9a963b9ff61e118709256f4cf33e5f9c128ff237afac5ea6646a83781a23577b8b755066e8aa8d3c7da7de79fbff0091ef5f2ee7d7e58eb97d6a34763ef37dff00153067ebcc0b294ecea2ae6daf6b61e7f3e677235f79e1ac7115fdbff930290fe906d71ebfb952a546c402d7f10016e3bc58f69e853925edff002001558feba5c5e655cf1d042106a7af26feb1afedff00b26ae019767d496832c98950562540e831412041eb47a6d0c4789b2639aed312d656e268d14a867a7960dbe108cf888f9d651f613e825296332809642f8b45d14409c220a0f3188ecdc36ddf3d686399a5b3b7005ba8f5fcc6e3ae609db36a201b45d7777091ed1dfa4af29139952838a4d7fd50ba98ed126b8cc3a6632ed88de16274ca97da61db53476f88cdfdd90c6338ea42df8eeb32dbe286146567b4b1d7f6975f5ed2fcfd498edf48fd43eb305abc15982bb8b9be483c03dcd723e2a366f7e7717138f6f3af822ae96f3a8bb3ea962988dae3d3703b0b4c067c7109386d529b999f3be7bfa9878fccc5f9e671dfdcf4fd23476af732f7f8c4a5d62ef3cca2afef177f9ff27ebbb2fe9f622d11e773044a6d8ffac0da453ee59fbf898971c75d9fea22bbcbefa2e65cbf32e202912775268572ff00b0843737fa4bd09de554e6b510177444a9e5ca5257efff007365fbd05ecfb67fd225a3700dda1abfc9997ec3c37fea17143b5dcc8cb4c40214d45f23a17afe18a383bef07aea614ccc2aad4c15fb513370c5f7f33299e254e86531bd5c4c533dde301cac011c13783318e08caaf77cc9c7c44510629a7c8619f6f07fc98243c9921a57d68c769575c796b153365418c031217dd7e2647b99c16973025831e7e3101d31b36ea54d4268e927741ef07a8c35df1a956ef7b7f1c87050e82fccd42b1fa2160b92b0552978ba353ebf59c1c2a6fb3c7698be7fb205bab3c6e7bfd7eb02fb3f150f41f5054dfd27ef98e26dbfed817bdfb88bc7dea11a0eef0ca6ab67ae15cc1b4635529fbbe8a9740e532be3c4415292ec378c663e2253383cccf9fc54f5f6ef165b2bdcca73f89de7c543b4f799717f79e9e4f3d3efd036830022a25cd397031b940f73ae54bf501bb5cc210854fde74d1ca0b5cc58381032fea36040c1f6cc4166e2d30e5d9a43b838d43c5e655595fa3e6305dcfd265f9e65c1eb032ea2f4b2c14be15f2658df76feb1bca00f87a20ec991d3284171ac8b8097aec9c132968cace11656ce0a4bfeee2726d79d40e1fa983188b52dd14c75ed10b7647beaee76630c022e96a2b1e2a15008d635c4b3490e2d3825e4ed9957917f4e803eb303c4007d7a596303a11767480e67387a75e3a733f7ccd52fdc6ac76f01302b182b77d0fdc332fbfa31e333c8f922932d134d8fbc39dd7d252f2ceea330c6cf129cd128ed261d1f7946e35766a7919f2d4cf5faf2cdfefda1416ad5eb9b711a390aacdeeae550da8e26bdf8cb39cfde55fafa4a0f7e22758f9ccffdcc35fa4bd4b8af45cb9708423305a3d4ab936766173763aaca81096067104ac8a99fb1e9d57317f6a1d81ac854cbb2292f258b52bfdfee5135063988228b18492d65bfe98d64010614e90f43d03a6190d071fef42c33572b9ff24c12fe6823ae8daa2f446af89444d9634f9cc8f64d1f399f487e6000e2142622399c87f31e8d1e270a3dcbcd5de0944970c116a52713313b92867477096f85f88561a854e0a3d112d8217db3a19cd8549df1d15de331fe4938953d46bc63e637c2c5637dbe3737b2e3dfeffecfdc44bc9f4838a547e49c1b5efda68d79b76c669dfed1fda88f784fc724bed6f98fe57de5519c7d09c7fca8c9a774a49bbc869aef1bbfda9fb89555afcc41e37de31973fef620b2bbee960989145170cc3cccc7f81d0e8bc4a8757a10212b1f13955e72c47b2bf5946658bafc40c03c47b8fbc20de79331731613884706ee57f730822fa0294c73a712120f4751093de36e65dc40a7f4ef079314150d8c4d6d5ecc228093653c38977eac8247c4b45e4752a113f12a89de612039d197e2db4462faf12966af31966bbc0e8477e2b0c1d6c7b6576bd4ced871fc4ca06684f84416c113d9d1911587680952ef9598e1fc799fbe67f7f3d1fde22876facdebeccde37f98a05bf29e799f44cbb3f9207842bbfd08e50dfd7132337dbe918e5fa6e65dd23e1f7983457c90c66fe8b9864bc7c4fcbbf8e8fdc47eb5f42645f15bd112fccfdc769afdb94dc5376f88d9ad7bde01e62d8e89baaeec7fb387a76fcff039b1556dafc4dcad9463cc2e8b3abee8812b8fe442105d65c4e56b69988ffc963b3f303277ea5caffaca5acfa965ff0011745cf64437a23260bf70c78fb4219a35e389ee6a02f05865da6869ae3dc14680b9eeb0f0ca60f74cb6b006c72f32f83f7772fdfd384336077a4cb0956991bfb92bc788c4510df4d7896552d798f24f98970411e83cb4c93bcb7b5731c85212c7e92f2b48f11966d936e252359195a7751a5ac444a101ccb211aba368e5263be6693bf13610d47f85476208e11e061de5ac2b33c00422bf81d3f7c4dfed4f5f69a7eb1bf399fbe6712deb1c765620d835579985f1f8c41e981e0838efea7eee1a9afdcc7555d37cc731215caa52a5176c9fdcc5e7f12cf1f56536a94367e2781d19ddf7627feb2acfd0863eba26bdf89b6b3e789c262f6f68744e970d9b6730417341df6f4ae815474d7554c1f3cc7ac68587a89c466efa7d67b161e5c426e269adaf625103d31887eee00a58b4e252fd0229535dca9459cf980957befa978ffb3235f68ef92b59ac4b97310ead62e254f04a7998ef3d6352bda5aefa9ce20f80171fb054fb9b7ee5cae22458d2665359d0b8b98a5a88e6353d19907a2362069691cc692ec34750caec626659acc60294449872d180b7145ac4df41251116ce957afd24e7d19940a72930f450094e6d0172331d75a00e3a73d3f7cc68ca84e63f21111763b8ebf49876facbe25fef31a0e46f8fd619d57a8abc10f97c4f89f7864b73f8e9f489bfd620307b11c4ac85b2b1f5992a5b8cb854459b5aa95c7d65b68fe67d7e92d79e39b879d7da1fd7cb3e0c7d09ddf77fa89fac7ebe599737999e3ed17410fa99cc7773f79fe07f8f8877e9ae8c390ba817418505ba8674c200225834be204e01c2ff00c8be3711794f75c4ce25f7d6a7ef6957fd436a034bedf59a016a6ae5652fce609651adb05b1f0aafccae2267961ebedfecba973532984429f0c20a95493885ea36aab8944aaaeccde8c6f0fca297bee6294d0c7de086a9d88788808ac78331d98b4d6225c55967ad24a586a67d2fb26adbdcc905c0f5d910394a08710e695aee8e646f3771665c033822c133c9dc14a6b167998a5a4d5602c330ce1a7663a8b0253a83f7e13e13c91951ea21d283de6b51dc51ec0ee61c0e8d643db3032a1957bb1fda20f7f497705da54d0cbc563b4a77485789ec43fae89e253fbb7dc45baf5888a12f9a20157fd0ed11d84627957d583e4fa5c7df7f561dbebffb171e3ed3eefbc71e3f307eb1317f99bfdc1198b0715f30702abd3168a12dd5c64bafb4fda679945195f89874bf1d6ec598bcb9bfde2550ec609dba5f5667fae5ed8afd60550030525d34b3d39deae04e57b198db7cbc2078caed5dc0b95fba81f2fd6616ed804d5f92584c59b2af11bee91e0a98e6f8e660c155d70fcc1709b1a1edf481aaaef3f59827edcfd623a27230b1b127c93da782e6929f389a1275e18435084aa3038fe64e5c25dfc4ce398e2454e44a46540bcc90ca485f34d907c8336957886fe17e998b4b79963055323179872476945d9032b2ba3c254c15f9963b54642e618618945b9a85fc30354fae9a08c1ad01165eb899eaa78d0974e46025ff0027f6e21cfde518063c151d3459bacc6e12f8fbc47cf40a9edfe4cb98edbbf474e63f1fe7a89bc7c1b95677f0608fbbfc4478ccc5e3eb3dbef2df3f683efeb1628fb7fb2957c7dbe679fbff0084758c7e6271af1b6387f6d9ade3ccf70763d67984d3a37493013b7150797742f2d040502d7dc40b5af330c255e2a3538ed7728e0bcf1f897a0ef9eb5d476a3f1c4b304a815da52f70d435c5e196ef6bed103879bf043bbfd4fdef2bf752fcc02633c713e96f552afaa37848ba2c57bc05c13e269b9f8e893cfcce4664d4a4a8681f2fe21084b9a88981bc987c470f6c30ca5b2a10a8c1af7704a061bca5c79704462f73b21e7a5b08e324de9537af8cae9831fad12318e238e952a2476c224d7f908f99566bd466ea712a3fdbe8e66b1446ec60b7d077e1053144bff0e21d3c73f58f37f78df98fafbc7c546a3c75bd7e09faed2cbab2e3e9a7eaccfef11afafd59df4fe26eff00bd7c4a53fafa4b51bfc4479b8a73fd740f3f78700fa9f113654d3bde53f6ae6b175e0db28763eece7b7e65fb82a9a9fd77ed12aa1bf9bfa5c6fb55e6f101a40f8400060848b82e607b979ede2e58a7176bf32a89a99ebfbff3f884f00890605bc1df1717058198755fe21ace47cc1d16bb7683a95ac63d4a5ee6bff23db2bd172fcf13f7bc22bf6a7be13265184559dc04b2bde3d4421084bea9a9c70226866a7965de522f32a0f95b9a4d085e8d47bb6732e1e23b33136ea270fce4b3abc6a8dca7655cb5d0cfd0c2db3a82de5094a20aacc648e53354c2217bca23a3d2d1977f31a908ace21f4b8540859860f73cd53e7fe15d3dff009389fb889fb72fb57d237e63f31f9fa9d17b9e241abfd2ff00a82305ab97c7739973198f8fa76f71f2d3fac4e78afbb01fb983c7d889fb53e3f32d65b2e68ac731554b583729872ad47fbea2a8aadb5bdc787d897899891a6eb9995280c39d2bfdcc63b1cbb5e5a81a86f9d43063a0053985a6352bb63d6f5fcc2374d6eb12fbd76f9d4695e79f70b557b97fa6216ebfefb842be0a4bf996b8964a370deb8f10f343b92827eb12e01ae65b98e01307cc045cbc11d25b07eb11843a08308420c70aadf1bf5103b38997d4a6b5e172d37cb06c2edd453cd95a18dbe22a8ee61c9ce8074777469b95523213c04174d4b6fe19c98974acc0a03abf71da982b7d6635724a87075193ea3bfd4de7a2a3e2de855b827888e213adc0f8bebea1e3ed3c7fd8f9fbc7e6be91f8fcc6e1a3b7d635c4302f2d0e788cbafa45e58db33b1f4f13dd8d3b137bc3711e73ff0066b3fa4dbfd430dfcff938a0dc0de0f8c11b66ae21e25789a88761319459fb5d16f5561958735f98580af0315f5251591b0c57f0ae83bfe15fc42043f7d45811e4f760ae45133d1f49a61af71e7d8eaa7fed0f58b744f304fdc73f495ef1c25ae883da545e0c103180dbbed127c3e2335ecea741060cbfe06b62a316c25723316dbbe3733f60e2f887e654cc688972e75529b0cc1aa88d41b653a2912a7ba2ae1311cd6630399ae6e1b50278e383ab957e9986837d52e0d9172fa77736a7405131d777f12a52f8bb7e2274e4c0c60725ca739e67ef79fbde7bfbcf7738afc609bd7da3a09973de654223c47e2678bfa547f731aeff0079fbb7fb954d14fb44e262bd79dbf11c04e6fcb2c4c70c359a94e6aa9f69f8fccbdfde30aaaeb9d10a03b7fab378514fa041bbfbc4beff00bd8899f9ead7f13a9d0200cbfdef2e5cb3f836b1b7129b13dbfd9bbab057877fc1895ec9e07ef04ffd962c67068208d515d5e661ff006a53c4f099f48129080304e097e930defa6058db2c45bdfa1e83a106283061061d3229d389c96ebfdc6e4a662193bce032d2e59e39cb3195a887b99b26850cf492516a0f842364570e7130542172e5f98d48bfbcb5bc84728331005c46183e916555d9c91dbdadc0bf811b47ea72c45d821a5caf8950de89932a259db139480d8d9d3887ed74fdcc689dfd88beb8d4df456571c34aea1ac7f6cfdc11bf3f525f9fbf4f8fefa9556425a0f2e772fadbbf6c78c6b88edcfb7b4f5f105aa2f90394968c954b976dc19865469c4fb7939f896aad63e658b8851fd4705b978ef16d5ca95d3e7a9d02e166ff00f7fe4bcf7fee65a30fddda597dc732bd3f89709c711018aa7703939bbf2bccc0337ee1c458a8acb5373d4b14271ebe6545e7792541ef0068977c4f37a17db29da7c65b01f17078ce5d777cceca76231e849a4621d083d030e8210e80aa59c6050370bec813018f919401aa820ce7e11f6d65046455e899cdaf98ba7e21b08caf81a3fb9f7ea3648c6ce028c8b8d781d17055ec9b9ccacf96802c61f9271a33974765962f28261fe0985e08ee6ac2ed866074a952a58dd7c4e7f58a1fea199fb89f982f75f398e4a0def825b587d47db0a48031c389fb82567fef4372bf6a2621050056df2b05c712f6f92775225ebb68f12851c6d8ae783ecdc546406267fdff00130f1ec94b5931f499f575f59a685ef8ba8ddab2203502b3eff7b4496edd1a836c133e574de55f1c4b279acbdfb8167efde707edc53f798bff006094c02de7bea3b9b1e58c12c5296eeed0e3f91d1972c538fe15e603da6d82198accb3d03bd843c495843b3007c05a690bc23297d18c669d08418421084b84f62a9d01430b22c331845cca9a18a987c29b86b87768381e65500bae3b4b9783182352c7b66faea0ee90a5823b708372a30cd67e77a428add1da7e29e23983f241c4fa0d92657042a8bec86c8a23bfa1802b7747b26497d1dae5022768db5079966bf49f4ef94149e1ccf7f79c4fdc47e3e63005d37da267fece39fa44d7fb3e9f4b95fb534ea23f6c9c82670d4d52ff003001c0eecacb9de23e03b27069f5cdf40ccfa7f902ecbdfd585e4ac3e84423a3be6fc40028ec8102712e5e7d4a1fafbca6f7f9f894f9fb4a5d0fa99de1ac7c625a9557346bd7be61d6a14fb4e5f31fdf3d352b26326bc40154076945b95fc6a08e267a6e51a394af30dcb372c3712763b4a8727130b90843f8f23e7fcc577884168cbe8f4660ba9083062e83350731cef87880ee15b8bff08970cad38c60c3e1de5eacde3d2790096391bed2b2cb2f8e3a004b4da1e096eb9864c35dd88c998268c63aaf2d7d215097631a231abde58d91606e63ee9823a882923886e27ea51b28998e979c4a5f4ec4aa8844db28546eb2cce63273188f787ed4b0edf99ab6bae7a73d7dba27dbbcf5f68cfdc153f598eca5a702cabdb57684822fc415bba4bbb869b6bd779672f3f2fa9cd5dca6683c13bfe7fc94e0e70f10a4c67b7fb3f7dcb65bf6ff0090ce9f1fece1cfebb472cfc3fd98db5877fe4c18f60ff6537c72cbf1a8bcdf7e39677c9dbff22f6c57da2b8f1c7998efff0059553f7d74afe66e54d4a26b3713354478e9d936941e2142aaa6db25cb9e60f4cc1f401e62b0b56d5f32fa100d0cf684df1542f3d2e318eefa1d087418421d1648c6a5847b20584a998328f9434a496c551bf27da5239a1046a0d7ca6402b329af2d46d1c9c114c1e68a19b2840bc9110d06255a9ce89e1c3a35b1e31557a357f7e33147985c1fac653ce159a883323dd7c906017a225329a82b51bae6744ca3ef2bd2beca22a1778d93501f3362af70fa690fdad4d7689dfef2bf489ebf31f1fe422588f98816942d690a6d5ca7f88a705ce2fef50d89372fedbf736f96ef9652a8d54cb831de2d967f632a4274ed27b3fdb325d55fe23f44261fd09f1c6bbfb94fa73dbd4e2bcebfd8bb78d5cfebed3f6a5fef9e9fbeba7efb9dfa93ed2d601dfe262eb9813f7d455370ff002401291b8097735698e19aa302a61a086612f3012e635707fa8bd7d495f7ec7c4bfc70af4998c1d5210842108421d778fca62cf1cb1852af8851a422148c44c0c70a164cc58ed304b0423004af13522f372a7bb2dd3c9f496799a395478e23a808e1dddc0b11c25746662c5f14ad7999cf6e86c6611c2a6fb13914a2b7a09d7c3dc9cc87cc0e8abcc11e7a3a05ee64250556e6e218b1ab96275e26c90ec58bcb35db100500f5d3f7333ff93f7bc7cfde31f8fcca7f7133e7ea4c70392fd4486d3bd19edccc01dc6ca4bd4b4b879eef32d55671cb1dd8e2a53a1481de1e5655071fb6cfda9fbee1cfdd9c6bd1fecf3f566158f897ff005efea7e9e257d3f32abe3e84d57e3fb665f3fdb3e7a5ba1f597fc86d773cc05320ddfd5945560d625683518bb974cf79994d88817ccad39889ae8d37d073e62ac543b616701de1a8ca64eff08b1e96f45d7fb059ceddeab7529b1973d03e4744455f39807a2421d08741d2e0cde738971a5d403ca62cc41ce65028d100b253de2186618db02c99f74f69949550a61c62338418d7b6a009e773e606dac2cca70b7120e12fcba753e4c59479953dcc0801c461e305b2ee91225d72cda6135ac481b4d44edff08bcf9dc81646d938c4dfa38189266f735ae9fb9e97105a841dabc9df13f71d1f53eb31e3f32bc4278fb4a80d5bbf2fe239952f0a99bfc444a0af04ef9fb732e14b5d8ffb03035aec4a1c9a7ef3958056dadf895ac678ff00b31e6beed4dbaafea63ebf78e77bfc13535398f7fbcbc7d8fee7a6cfccfdf507b7fe4e25c29f32b17676a88cbe2eeb9e2212d5fe3a9fdcafdef08d3f53fa826b2d25ff005315735afdf516fa699e8c8d9200cc2679d32b133cb102e764cf3a8de234ee1899b985902e23fcebd47a288ef529fb70b4ad1f8082a5e0c755cc712cd78e0859631ba152a1d04210e8b8ba56fbcc1a608d5c7b251b9da73de7fd110b329844d9508b986224cbaaf12fa890e515cc4014037299faca0ab296d04b9e33c08d8d4b4b6e2464b4a87a03997b52c4e215a979c433383a44d7ef3c344f29cf4ae5652056babfb7fc2ea233fc7898f0e53fd88505aea7ef69ebed199f3f898f13d212bff222e9aee818804c2f3947fa3d43a80f465876fb779bf3f82777e4ff0091dc38484a5e731ea0176bef1cbe7f131416e7ef3bfde507662cc50c4199f7b8d0f92a3c877f7446a2f1c2f2a6e567f71369f6e883b95d5bdb7c768a0197ed2871cba9503ccffd40fdec4a1f0fe260d7c462c97c1128d9330359a889e50b83c213c251a944a9808672fb40ca53f5d47af1fafba0dd2eab83fea636bea082dc047f11a3a61b86e00e21528501203f04af1d08425cb9717450f94d93ef83d71095e264c39821b81085de728c6c7308b5744a0486753d3a80d8618cc2077b819f794c25a3899fc462b3b7e226c71998f30ccd4c395840f99552bde3283211215865fc36fbbf1352c29369057ff161b7e505a5a3bf2c1674134e7f83f133e7f133252c7dcafda8ff007d06bb4f67e20fe92ef1bf12ff00ef8802b227cb1715d6de3b03e65ec02f870ffd8faf866339f6ff00440edbbc1ee21ff7bcbb7466f1b080ec2faf294718d8f6be25684ffb3bfedce5fdfa4e73bfc4af1ff2025d2d8f32a36b1e3de0df10fd7698814f8656beb97e3fecb92ed3b4329eced99cf6960b62ab6cb263a1b25fbcaedd38654cc18dec9980811977c426d656e2f445a8a61fa5f2ceddec1c4200712d7b5be9946c61afaa071577772c455f2e22ae5f507b65193b7dc06f1fde0efbc1832fa2e64c2f006fdcd01ccd5170a2f0ef07b4a23dfa5dc628730bdd8841ccc5de342392706e026055841580dd2f98c343ba5bba778962ad182592b82771f4987f8629fee325ad9cb33bb1895c8998ac9997b5da065654a9b42038c444b62c40f536fe6a95d4adf96db952bf49fdcfded3bcaba7c4c7b4ad6b12ab70cbb6f13749d067a27b3f10b7fc8fd7f52f6dfb7fc95ff089aa5e92bbce36796578f444dfbdf767837c1da57763f3367bfe09c7e09dfef2b3fb8996bede21ff0004a3dff6cb1f8bff0025b5fa1c4e5fd2a5aa64bb83194ee5020566fb41de4f920c093c5e594ac08f84c3cc32ab4b995cc468ac4f32ae0450ce6cc46ca9bc583c32b9bb9ee2cb3c44d2fe660b261556af1dd7fc9b3e10d56659dc85c34b23c88379771e7de64410d4f09ae18dbcc8f8b63c74db224a3fea64af21ed014348e5be638727796d5330435e679a870b22c970d3c418c6a00d4a9c4eecc5ab9dd418aa772525094065a7dac1760fb4b2abf4974fbd026d61113b3506ea2860ce252ed37c1058a8c00382a051fc2ba144dae78c875fdc4d75a9faa944a9573d4c4b0a6ebe9094234e07445052ce138cc3413e6768522e20bf713e7afa40793fa2563f6d88f3db2cac98f44a3be2f2caaaa33583b4c169afcb2b3e7f128ac66f503e9cbfd40acfcfa95afc779a3fd72caab1e5cbfd4c3930fe082633f5fee5e169bf7e63460a51e45faa725f0dc4e06fccb728382b3f32f3961fccb02f30f44b6fa592c955667626998867a95332bb4816ae58588cf851e736194addc036c53ea091780255dddbe236a9bc009f5977db88b15af08caca1a9f5198e52e0a0f113a1abed8288f054158c978bb3f32cd065580abeaf79b67b4a5abdcec79e09c8a5e0f84bd36d9053bf8862794b67ba19d10a63d91c5e6277a0b43d3bf2ea2d81e65d61c742f22119d4635106f6e21328232c5750f9adc173abd11768b8497427335d2a5757783319381ddc4f6bd7efea6aff00a9f69f1f5867cfd8817ff2054aaf12bf58cfdc4aef3ebf888b2b246ebfd8be7efd0a317505edf69ed14ffbc4ff00a25318f44a2dbed9ef3e34e3b138c386fe662f81afa4c630a5e0efe67f94b0f8d61fecc79cd7cce5d392dfea62eeac2fa097555eb3fdcbf9c7ee65b3befda794c73295f6622430538a6dbf8896555e358af70dd4fd1894bcd4b9f7106fe741156f946937162956733953da59aaea29f0816e7a4257997de66429e668f112f336931136c78e97798d3db2ff00c1ff005332f199fdc4f98d570db2a834425dd99330e0205cd648748762be3a37d06fcefb10e1fa9776bf989ad3ca621edefc118c2e4e22a72a4c10db1ad5545ce6e226920567fb9b5449d8864d6e0bb4b8265094ca93a5ef03ccf89316031a0afd222331e4d4b5ccb1ccb30ccd2af137d6768a58aaee3c0e08a1b4a118e500f46497d2cd97123d28084b45c29fe9e9acf4f17c6895cdff00b29e683cc0f6fb997fc9af1ea57c47f6fa3d2b9fcc7e7f113312b962ff000ba65a53984feaa5aebb4ee8e19c93ef7f53e33b3f59f7b7ff00265da567efdf5e93cb8971f22b1ce88a8c07058bbedec852caecfdef2e10ef289e0c435108a394dc0a983247836c3c299c4c18816b3894653804733d659e08a136e86ae17dc97f1feb21157399b559f530f62100626b0a48ee718e9b253fa8a620f1d07454876809927de2dd8e79ba9b48630d40e26017080e6981b71133d6a3e96f12a34da5fd228a4c2166d94df1de0cb35a82106612ea342219dcb6ea2cc59823de65d5a38d5e207c4ba014364ceafaca4289449c066718663fe445f24d56ee65ccc938c8731c6d9be8aafbbda18ec4ae6a939653c5bf89ca3bf13c7fd4aab32da7ef6885b9625dd1f89cff0093ed1fa74fdcf4d463ab89fa447bbf58cc009de0df3f7e94d06575fbda5567c3fec1d57175089350f2e83a4d76e373687e5965377bb1c5798f0707b76f12e6595294c35e630da2fc1430d5b6dabb9be84a4fba007329a254bcd4b9ec66197623945c32ab1de2ae0414e48571a8a2ce2c789301bc54acbc09b8b0747155b7d0e9ecab110030cc1f3f3d57369b81025510741d38bb886b3fc454f15ee06cd42e4db97a310637a9091a77f305e51b61b0b968d5cc16cc1abe144856603bc4abc4d302b2b985d32de6587dcbf9831620ed112ca6aa254587b895a8c17c8977d0050b83b5f10e3103a33dfc4b87c103774b292af70a9b665e4b78dc24827f73d2839a9fa59befc7c4affc44dde38cee5d1aed72cc186ffa9f2aa9e3f83a8e6574a31ffb044dff0091205c932d4bf7d36df38dc46e798ee6dc16b47895580c46fa66171b8baa6fdc517df2fad6c5ef8e8202575dca95002bbe25eedc1566135345c4165bef336ba36419ccd4ca32ef3302670d67308ba1e4397fc4b5078dee6661952cbf68310ea4136aed0875cfd866086037acfb8d36f989411dcfe847a0a0eeca8c0faccb0e606d2a5ae87a9841bfbcafb70500df79a7b840e55b950dfc46a9cc57425691a332d5885bdc18db31de185ca3c4a286587788d619e7609de5910142e06dc094cf50cb48e26b121be3a60f92e9be2fcce37f497f9f6cf8df2cb577974e5cf199dea8d6f71ee6ef6ea03b05aef33b2b4d779e3f1d7c7e3abfb72a7ee23513f589fb50678b6bc301edf667b97da7dba579e8ae9a750f131d2badc081009a18c00c3ed1537b843ea1dd9c4f79854c3996cc9a25c52a388995812d6395eaee0f98d0897b3d98b6cc2e50da4ab39e821084d261021d5b7c512c15d69cd7c43366a3696ca777a9b3e33fc12e3797182554a648bcee1830468d336e62ee9d45aa01652b444a03ef0a68eccc63412bc477732c1dbb47d88906a283be61e68bb21de408e225acea2d7863b942630ca5d9a7dc530886c4a850a87982b6a74e873fdcb387e9325f07de2ddb56c6d56af6261bc6f59978bafac3a533f7c74dfee3a7ee27b278731aec6ef11ae7efd3f712a24d897c712f34bef3813bff00cee1061d2a54f4e952a54d7f0dc0a8027a4cedf24089ec78c732e05e3ef1d4c2e225905ef1b73b271a2b63ccc14bb80ca1519a82b1cca64c03acce2e20c233b7716134e9faf4710b4919f6cf88cc57eb2fd350e8487426e410875c89b55966acbbf860ba8d3c7961d4fe0fe353530f4d38966c95d388f1cd5ec8551c45868b52dcb52e666e0e789552ed3c4ee7046370db539232ded326f317980856b11dac91b4aa83652593b82967ee0c0dc39b0ed1cb1b955c1174ed67237bac4aec19cfb86d5f7ccda72bde78df4e6a73d1c6e62efb71028768ab68c74fb957d3cc19654783cd44aff93426e538a3e902c72e6b983cf8970717c12859d55cc4a1ff002592f12a79e9dfc4ba6bcca5da5280c6b198aef801e62b56dafe6a5c1186c17702ddc61897a936425d43f49f41ccab0bc4adc338a96611b5c45b02abcce4ad43d412a25da1c4c28cba9c2c5f3cc7a8d9d32f8834bbda8a5655fd7af767bf51210994da3debab474b2f62114f888a157418e5c4230e3f81a7cf4bfe35fc04aa8558aa8292109c8859b6ec3e929b1e997d8de4a9aa97c4cc87151588817169aa962a17652e30cc46e0b737906e64e263125da3dab6e52a1a4ac2a3daa8c1a9ccffc4002910010003000300020201050100030100000100112131415161718191a110b1c1d1e1f0203040f1ffda0008010100013f106aff003104ae3c8be439959552bc403a897a5994542a24df2534553186190bcc0a02d58300f128447772088042db1c962018f111952f0f234e9bf606fdcfae629664553b15aa8b87645c0d916a025f1189d241ec653aafee92cbe60e0babf233f2a442dd079e2a2f685a1aa21a9ea98bd54f1e3353c8ff0072f28a6bbb25aa0bbe8083f24a2d1fe5038ad376806f6a975571977638b69fb960eb30f163cf3f51c383036683a599156200a24121012eed9d47a96cb35fba8a2a2ec17f01197591fbab7f70ed1492ee972d864a8369f89a8158655cf6c00b209dcd52f88a482155f1c4a2ddf6360c67c5d46a7805c44f9817dd747f411096167972b04e798cdea025ef5a28e6d198ae21a8870093363cbd87b5a04bb0a6fa517d96d3c90194752a2b51aad3ae65755ec03c216efc9142096f8a8ed8a4b5341f328b0b02c8da6799c450d39c8d01114ba025d6e289566474b22553c459696694c3bd09269c34d9712aef7511426d85ca5d6c68be150ae78c5ab62772e1140726fcc1111c14b355334a4e55306c279c40a38ad940835972ab5d9549146b6d8ee288a8d5e18303c9b501582e8ccb884f0cafb9298f3bb50911f50882d6c74d99ccb7f708952015576c1c9dcd5f48e8e0128a85427710d93a605296785b61977c4f5751a474a8a42152ec7895d4c0455e63051dfe8307865a840565169054382c481757570da147f661a7d5e5c1a2a8dbd14d1519666f64a160b52c25900fdea9fc54b9555b6d965e229d4db5291e8a4b9503608341ae135037fdd15c40e430dfd3360ac12a6c9db8adfaad88c42d8282b88d57b10e57632ba8f582acb6a536bbfd423a39699022454cb49c710028a847041f1dc49357c898b1cde1d3615e31e667fb59b423720d3d56d4b57283f70e98c8fa63440396a1b452ebb8d0452b2ec6a9bf9f22aed662319d242e363d1afa4a1358d436594ab62e664a01285da7c7352c28ce11443f48a937677016e3c9fcc572168c5e31c812c8ef9e25ed31cf897b1909df040a2e9b1c00f9957731dc2a176adbf04c0095951571eca32374d77552f27bcc2a87fc120d0d7f940d0b26c65aed471d31087aae3925e73b817108e96b0be88d079396a734c41a0b27013c96692a096bf4fd351da1eb1aac1ee3fdaf65c14891de138f510806c30b77076e3669df328de60b6d14876e75db39ecb11687bfc401dd3fb65e3ff98c48ca95a3fc449acb75e5aa8d53eaa2ee10368fb1037630a825c5c54d14db828504a6ae211fa9547225ce1771d32ec33dad770bb39d21423443e730c252d1171f31b194cb3154b59d057021e952cd396be230e4dce207cd381a800a803114905dc69502f28ba60468557021a8245554fbe6317aa297c152ccdc5cdc3e676fdb356d60c0165d70f702dfa883a4109bcdfd44151457b7f6e4c68bbf38888d899dda983cd22e84542819517e03f997b636b6e729fb6090380d231692588a0f2436aa58ace9650d2a2daf003f72976bbf9ff4058808538434b42094dc2517c3f29708a70df503150ee0a9d9b85729e13b0bfe8ae1f227262eada1c89e9957d133689f8e935640a9e52c28365c0afd5e62c1595cc2e1a9c24432e3cc65ef31dcb2bd393f7886ee515c150c9ec0081bd620404b15a15844b72b837824041c2b08cd904529c1dc730517504dbc12f9ac8395853f52bf5ddfd2d26ab80ff786ebb896b1e10d0a82f2bf4ab8d459cd54c13ada830ea3605725d46c82d148da1acafc4aa442fed9944a145f1bf0414d2afa320a5dc12b30e0f61503a9871604a2d54a940aa01297c986391db71853ea1e667532e2eb3b1ba96fb34c34357c4cc96cec81f10945f1a019e6986baa16428262c6697e6a5ec8dd2cd56a4da7718c11502c4b1506f77c40d767c30d6a76f727bf320a2c068c3daa8ef69b8ef74890805d0b3e98750a8af32d84aad5eb0da9e0a97b31c4796c60519742bd60ecac4e1a421e26f50c721e7f64b3538bd50f6e2d99ee09cc6e177319176a80b3ac9922810fd90cba606e37bf3c80bd6a27e216cb4090ba0fd3631be7fa5360ac54b5d91db2b6f2ff00414e7219800f995464fe2942371291b0228a1b186a769fb19714515dbc402d96dcca4a814bd9021400cf66685fcd3102d8e6f92a15e6b95a8869c91db96c1be2c816ca6c4ae2b7561598d458c456e1b87e62abdef3fd165f012aa585f192b39072552c1e62b0d7d4c02e481e442407161d92eb6175bc63e202b158ee59984ef11eed291b91410fcca2d20167c27b104ddedc34b91ce2818d7e028e81e125d8e2193c4149a890ae2cc910000e5e23f5b8838a8ac0762ed6dc1adba227d022b5772ed5f58b9f558703a094a0e25bcaec562aad5082db086deb983fda231b12807d6c4137b054b90fda033f8218c31a965ac1b2b392b88eee6f7a8f2652a536512eb2713d7ebc6b62120da5e1cbfa7971167b39aa3420c38960a69b965ef7b715ab0f297951b4adb0512a0d53fa57351dcab95f04a9b5255189d9a2c27ed1ac60d52b3fac8127c4677d14086de1c11f79c7c2a0585870cb879751cbabe8b5952a3c56ff003c41389a797217a5363bd97c55fa8a72ab19c3d89f16b25af968d38507b9df4107614328b164a2a730519549a83528eecc9ac1f94823fa54014e0ea10a7e13883ae61dafa8c671a908950d3c35c90d0b8558db7cb88bf236bb60aaa6c2c5415b983abbc947e33acba3f92028fb28c5391a7c4010ed5c7f449ce061c894caf1e154ad541790176912819b8f1beda65b394c1ee256da37f8886a0b222842fa19b1139958280fcc41c2a104fa22abe52b5f04dd859040dbe1961b2f9591680f60b53c403afb232a1de82e2a77a77951818a672cebf6fb1b78741ec35bf2ac12399ab3e108241c0a3f086eb44f223b76b482a50c703280660b69036225c1bba2e3a280ac078beea5ae59cf304d16545d07e0fa2341a5b9282b2733ba858e9595f01653a7708da1e128122aab29657511871dcc481f6a8a8d185c653960b016c38d492e381064ad65a30652fb70595b327d879f997e7503b813f0cbcb488c4bc881056a36d8f14e0532f3dc3456834f92e23e920aa885176f72b90b0fab9512df4f0214e0214f4c09037b4bb0705f171fef56bc6190edb78114ab54fcd0d584cb0740aac5a869eb1eaf4945f72e028f3c30215e7506ddc34a8e6e39d107d8ba8f3a7a380f02c109aa8f32ab930077174f171d85a98855862a364d1d551b017a0e32077c8c00427795a3f370f3b9734c36d017e37689b1e2a9aa9b05659040e0c9552e8f498bc428af7f3905a964f9871d89acd86930100966ec5bc48fddd8b961a224b0cef286b16ace61ebc115c78e23e7f821e23c2e0956579481af99666811308cb48bbac82a21d12cedf753c5ce85d4d16e201601e207f49155b9b81657ee38a2787c71643174bd4e887860fc10753f702ee2e328dba0a238c9d007dcadcb9dbd618aaf36e12a5df301d1f3e7a8546b0f083958b98759d541bfe5574256d440a6171eac8b78cd1a422329c1a5fc3028f9a5971a4bf659dc23755ac22e790caeae3d2c8edcef66b133e26987c1168ab563456a20155d1a8c3c18e856e22fc4544e023cac79468770170190ad0c37f30a0d98e2ad51241dec4bbff6ca8a50e22c43c9145d7f417c1c62f6601444b802312780ff0009960f87f889fc6c10fd12738c51fc2142dd7465fd69cb2c393e494f38707dc4ae9666f12a2a255fcb50a52842cf98802adf988f361d954df440941c256c06adbdc6aed6c233d4ce65bfba8c45bb6b056ca652e64d29384196a97e125d66c5d536f314a26efc8ab552292ac4c00d3f1646800cad10a5d45b310b1e9375e81c3e65ec1b5426210a0a827815d7dc0c0dd3f5281b2975db14c843af6b717bee3114b112e9c6b72dfa60167684e463f8469082f522e216b41b3f9c2c0755dce5651c0c2a68f2fa98bc42027841a00d2083b9dfb22d836ffb41c5665a40afc4d252c2cf983a5b5ec615addd32c2681c11f51d01115b30b7c45136c8e1a82f636809456c13759ec2dbe23f732ce7fe1957e0542dde5096bce204514d4642b065f2155386ae0089542fd43748e7c0e88c053502d9b4ee54e9407d238dc74e0a1de8e61750afb1c47b029f332e2ec5c01d415d2ee22853b9f70346a613297aab96a89652f3cf98496ca0046cb6c5a8c0399d91347ca3ae9c9cb388fc04e6455bb95028d09e2985583b4350d828880ac5da58b61ac7eab58dab1a9ba86aef09442149afaee398e1880be06511f4445d712bedaa465f7a3f84179fcc2e58792ef11e4f98b98a67a59745a72540a84f97b8c9329fd30d35e204b4595bb9f11d50ba801b610b77016b5dfd2e72caf8790af207c74cb9cf72a9a6117b2fe27a23895705237f72d2ca52c205a1f26be3655800744275cc151c8712ed542eb0518acaf8cd059bc9b502411d8797e98944532b65adc515c8f72a6874173fd926f904d0ba417955fb587cbe36bcbd80880c5a39f98c6ea8b615d0e438789ca4775035fa95d801d796d256885d06d5478279d3170a47bb4e6a36f00638bee358c29442c782ae047cab3ab22da55fdb0409b34caa671776ec76eeeb892aca2addfdc2d272510ce19a5ad42c0b95c816d8b71a58b57c4b266c292886c6e6ac297688d7bb81f819785edfb2cae6e54fc83caf23f2a1a60bb657d1996478b3b955bfd37794c69362e3ebf65c1d260194d5b94a5e21a3bb2fd498946d7e242ccf914ba148afd71168be972eba015c4b1e0dfe9834c38bae3c32f4b4ff00a40529914dca162ee1372b094e812221793217f10d646557d8c6d82adf3c96242ef363ca674150162be92a53dd2252a570b1f08a55cdea039632d5c60452943cb11240a1b072b0e285bdf505765de64f0cec59b36d39ed8afc3687950f8620a1acdb53005d90bfb78252655d7c6c4b1549eb4472ae2a55ecc2eac347214da732e4d43add1fb6574d1425b5500b5976ac8ab8133284a397c36122637cdb7661490c6a5c8a35cee0460e915126dbbe2c88024b052585d9f703690ab82a3aea77d605f274c62fa7f89f2a2fa3e6e140979f8845fe2e1f26cb36b8b405c155871c95d2e419b301cb2c8e25495ad446516596f8a9d639addf29179280bec23b710b691ed2aef5293282fd16c7f32860db1f4f230a68f5654ad549df27e8e627422f785d784bd2c1bc2e60f351ba6a167535d29e5c4eb75195675516d15c257195b2837251f9272a6208bb6f8845073038830a6839847099f8b8947b3d613aa5027c370e973c12eb9478fc595dcde29e36034ad85630aaf4ac5c58dab89d5e47402c4ae08d338273c760d950daf607eafb06915e60fbe66b9b0965b72ca06dcb263d7c16ec0a7ee14ba08f9cf90e54362844b5e1925616161692acd1c42442d42eb3ee540b53d4c1726eb858a4516ee50f8419422cacaf7e1626d7c3c43691690421c660e8ad8cc12828fbee0d1dd5ca12355701bb0a352ea3979f88622e38cb0f10ab0a816f8a8686806d4ac0283aff003104db3a035b1b143cf30cc860935fc11c00b54b2111754bf894c1e63141c2aa19893c4e6bc9cbd3d4ab7692e08f0dd3f152cd92358fa07639f384a8436a71399ab4fd7fb7cc59e3615fe25b416d70f560f3f34722d2a1dab8335dd7eb88bcd8a62d42ad255306f465d44254c66f1a4bad36af811a36b4e65cf27e22e10b94c38d115a0b7ccaf4f80ccabe70ea2ba7a089558b77947f98e38ba86d31865dab845bee18ca2216695a733e02398877d406cbbf58028b8b73c94e9230357d4d8bb5a76787b08750b000c6a69f12804f10babe18e79fb8bc44e91137ea5048eb7ad1c2f90f558963c574983ea580ba5348ad4860496c363ddd53092940b41b4b166f5c4825ebfb2142970632dadc0e2ae773deadf89915196fe86ae7d4cda6cade9d85368f65ddd60aeab863716b235f256dd5cbf1592d404b2a41777b3c10ab62eb7cc61eca2e531e75752950aab5da2a6de092e126d4c1ec12664baf227242a7ba45bb5d832a9ad188264b46feb29a656aca1116103017657d45299b02c7891f50d540aab6e53a58f234e50daa8c0701aaaba652c5e0814f5b8c366b2a50c5be117aa9eec1473b2cd437710d0bf2e580d18dcb1b635e971116d4603baa6655bb7b96135cf28001ca06208eb37984fad23a3135533a9d44fe03b676b7d5ce47eaa60b5360b1cedda3d875183f4dc000ec79f6721506abf31015a3001c9016e4bc107046953f2f39340263865a32c7cb87525c272461b1346082f3286f1671130e98edf9b9e70cca0b0f1491bd0b78e383f0a6b1579140bd3d82f16393e99c6d6111ed90b8e147e7989b4ec84aa2481709a29316ef481c63759a872583ec2864574889be798d41b37361ef6f67d11c5ee4600d5c256ba1b4f1fa8954b184286e674673b8c79acf861a55eb9b813e0a4a2b6e0268c728ad88366a3d6c5ec6541772d3040ff2417c945d92d7e629868a524237a01516aa850eeb659de0d29d90d832eb12be34a5196b76874ca84fab7b895285380ee3a55d7e410d0823c1a4b6057a74fdca2c9f8d182b58d3037f0aea24b95bb18400a0ba6dc005aa3a90a7dd9692e965db2816d5fd4097c2d8b655ca085ba9a59d53f31ef4b7a2007ac91d9d9a938f2a0c47da76facc75b16c9bf9dbf540469a4d5be22416d391f221a9b83d9f01714aa64020eea7b8da95cf849b4836df26ad3cf60b5e2120652690f005c62b398c7f5dfc0f025dc5ad629e1324586e04b38b97fc970c7d42b1142a2b6be22dc68012d9554eb0a954a178ce62253f27ac9425c864505ec16c4a42a27bfb9ea03df8f096474e210a3bc32805cd406d4b2c7ae22ca79feab91dba08fd6ad17822805f378468abd4042a0801c1e413b4714370dc239b18ae0e1da58de410194b14c2bb508591b056e8952c29a58f25f2476a1b258c855edce067972c47ba25bf24116cec0392df6a572820d1f9826151d3745a7a21ba0a2e5634625f8fed7012e460e777a2173c32d291000b29a251bcace385bdc425454ff88f38b057be665d44d256eda217ff0021661bbfcc3c375b2b787230d5def9ccb42a91a06bc2c50629b3d6e06d1734373d62aaea21200c5fc9136be0d976f5738796afd9e442f100a96226a5c7021d803a3264444fc3844b904ffdc979eac714468523c52bfbc12d14f4846127aa72563a65a854c7477e062e35f886b93307ee10205e17b05a16d5543b2994d3533e401ae05dbbfa818255f9e2077278e081eaa42dfe0c7eba946c3c9c3495c911fc22bc12ea115512df8a4f202b89cc0b8cb3659b9f12ecf97646955594893ad4e8e759493675e91644ecc50fdda0eda37e9b8b75014917adabfb228d573144d07c4a4f7bf720148872f97612c201e065aa732fba87f181cdca2be58253397a8b502cf9321944801dc0e52aa2658051d0a89f176633922fc35efd5d44182ae7cea3216db972fb5738ef3463b9e7bbee564f654711c47ccca8e189685af25a9509e77135e8943d0a8bca621de035c451fa4a7f16512f4e52cc2d94343ceee2aab1f3461585705d7e822410ec3fe22dac4bd157dcf2caddedea55b56bbf2441f55060e13ac802ea68808b468c2d8095e1f922f59463c8654c41f44010d116aae094b1b426bd11e29e0fc304ea82ba2ea1f6ca4042e5164b41e50b555be5cd37b35c89f50417a85c4086b47d2d8b5d6724c1f308cb1cb1b56672ad2be251d14932272d9a67102f33b6322c22516b04b619a087a98ebe61e567419bdda68faa5f0892a7106e28a0e5ec16f84073459641683a0f199756ea07908d80d9cd69a4a50dbe0e23eb6dc43c65ae3a7b260b5a7a7ee7b02eb8849a72594800874d8973557c0be51a7cd0f30e0b772bce115bbbdfe91a5e965416f55ca9696ae6b17811055963e865c1452c157508de979064e285a9587d1096ee6e9e658ecc3128ad7e4d3045da35704f6dfbb30fd5a798a7e636216811a7591e029eb25eb5b584d938883c6c24946095e32e1b894ea53f3d29ab0296092cb189f5137df38c40bcb572911b6782ea1174ab2e6d0cd673fabe12d5d050703c8f3d54aa430dad62c628a8e917a02c7825ae355719a051dc45f25a1e447cbe560ff8fdcd22a18c5c2c508e25cf16510cc5117e6a280974ed4a24e394512db841f22ec4b87465f0c295d5454b109c600f0f31dee85f9062a5735ccedb1b695cb2ddfd553e291f74f0e0bcb8d321718359f77035952c72c66ca0156c6ae76e589e4def16c1dcb584380515071a82de6882f6286bcc58ad2e9bea090e12a1b571ef4d9176a157b11612c658caee4183b22f19be44a39be3208609b2b0202b0d4bd79382d787b320259cbb7b4b662b6a630dc02d38b05f6a0ce308956fd9edcc4dddddfc1022c440d99605df0190d05bd44703933e81cc050bee1f9621f1216d80c0e089c5cf4b9024509296a5a09c7361f0965cdac0fb6005fb51014b6fe8820b0fcdc5e00ca176c3627cc0984a8f34690c452210e101ef97e0952f7cfd4600e9bdf98da29752bc14093812d5b906e86f86a085955c867631be5d7be2e5a79712f1d56395e22381f47372f176abb54b94c657dcbab83c82519fdd2f99576b0cd42d0cf957885ab24b2873fdb1302a68057da96983bbc4a5206a8392d74e619b812f925c05e0bcd9556be12bb186eddc11b08bac81e05dc96f2c28030a800701c7b1681f0978161fecc4405d8a75772ba53e097614355ef53205d9184343402b854a274597dbec368239c5a4204799df351ee10eca46d0dbb8d3177320e98a529a29981a7c4b555c168ece6377bc54687d5bb975b83d4bd6463bcb896dea1235821967e2520692e6dc3c957784e478b857c590c638355962e947730a1e60cc61162d32e16fb88d7e694ed50bebea1955b5a635c95996d392f650c2e3112a42d5e4772e1fb32842a159f106f5d829a4d6aa6bd21102d2d4b718c50f8a4e3a34f1d849a0a21a6c0951140aad2fc35950c18cc9481eedf54c362144d00d9e91a43abca5c8a2bb2f7d6190384783e4c7e75a161ee303c00c6158e2b8fa96c339790a67451d9d9084a5a4fec46d361516678dafe2142ef85d9c104a0451ad4894974bf85cb80ba1570d1e7025ce0a39941692ad6a4b843153aaa3684c23b0d9ed25a4c646f1b5816b0047d8003f5342f871f112abf88c5ccbfd3a909b9c1b2f0a57ce4a8de3b860a1bf91975022c9b11700d555d4bba59479d8dcd4d3f82152438b434fc5c1ac2e44aa7e2a773ad69e7c462146caae92237a5e8d80a34449d6fb3a5be1eb1a858a3e88e45b5b173b3db10aa6aadcde97004d35e615662c077aa5c7ba890f8bc768f49813615309c2a95e9e45e050c7d0468757cd26cbf1ef966ed8d04683e1b33484296877ed40d37681fb8ef6dc7eea2b0d43f98016e052a721e1353b0414812cb317974c636d2118cc9704acf483526d10e4fe8148803f925ad7de3106b5682157d2e34c8b69a9bb1eead58c5da1b0658b52d6d9a910e8b0a5ff00311cb22529cf4a953f294cb34c712d15fcc2a26c900c09c9bf11a5becd9ae0abef636f4b77d99d6ff89cf71d5b26df2aa181d8cb5a8116b1b4880b945a0a97047d6d84ab8746c6ea8bfe656b37459e5253b08df40ecb428e81a95bf13698a9a4361921d40514a557c7e2635c28ae0f2a22a196bef83ea5524223a83c620822a91606fcbb28c5401976d502b026184570ed3d0f50988a4e601534c8a0db1cad2c2da352bbc8287c9702b615e415b1861a0fa6bbe7859f1572bcad73af302cdcaf9b3a6d772811de4046d554efb9b96031442b88c72809d4eea04e6de271d6aa4fbc1f82314c41596c0f457f44e79b6d4a55657567cc641e132514e713a32c0385ee69bad39861c45537cda0878361e0cb64619b4252595d1771b1c18d7500f53b30d3f0a69003886bec97c08c38adbcb4e64490d79f60915a4d947dbe07f982b76b2fd4a05be88f91ab89bbaa1ecb1abccea6e1eb0ea03bd3fdd8658064a4a555065b2af806eb4b7ca7a10e5c55fd9ec35ed85d80615a9363b7efee2d872e0abdba1d5654195a6f999c980133a510772bfd9e62b2c29eb861d7e0c070c5c37d659afe2261d6df31aab5de70dd970348368f68eb6d9aae57916d6b6191edebf48bbf994ef2edc31375f4381fa88dbc5d370baa102a7bd262764de7a20ec159c5a96b2c59b28aeaae9c89a90bdaf25d75aab08b36b6a71597782f5876569ea0202c4532865b9d112c418d82f338dc428fcf70ae5017cf31beaaa08b8db92d2e2a7e01f736ddbcca609f98416fef04c0f77a6305a118743a71581384c00327382d82d7a16a86073de45851b5622deb34b5660d3d4f15db3497425ceea005e01a7d40536f63b49d8ce032a6c9034ffb2e255c77e8421c1a8f32cf5fe232f54152ac2abac52d86597dc328e8c1f81e7e5854a3c7328a5864e4ab9c5ab5f70c425b04d60d30cb96076a92cfa6151ddc4b83e3df89694356956b8367055ab38ef9392896a572e8652686857cd763c0d4a034580c7ece3888177c1fed2e4a8b96fa5eea370e2ede297a3da6eaa1942fc73d515c4490ac2c5f6a6f9288efc16aa2ae325906aa1e98e25928060e3fee0c07aee309a5a7f711bb8097c972ee85165fa43837a43f444f82d188d6713272a1d2f820dcdb621e8cd0c4c733b8176658b54607f86e35aebed7b791a2932540669e4b3d3b2620a2aae1bfd1c470341e65a28dfaf15346a23845d9179cd12e7e2a16ee04c8e512ce1edea6803dec0d28de24cf1b7952cc6eaac21739ec70b32c2514d06c02a876236076f586d44152aa87c9b183ba7b97e9d8acc6ff008e610a86e16c85fb6dce3eaa04a954ae6302867558e89532b4ef7fe0c00b0081d3d2e0bb2c228aee285ec347104d5e59ae6edb1e0c8afd24d57ba2c5092af8e7eea8951cbb7d4c47e61b580a214fd212f9a22ebcaad859f7a85c5ebb4408382b7a95e12392a129626d1e12e438049a2e528f68443c7d473089052ed2b4c6755e316002ac1cbcbf5163d57ee3adb5b0a976132ab81adcbb9e4fa4357545c3354a8d03a71f04505ee14aaab8a15625b97b32ff001069e189d11c831e669fb978948015cb87ab04350e8b12a21230805820735188c5e789677094b2f4a2685297bc476aea98049fbe13cc6298150c3a1036e05072a00d797d792e3d3df83d45cbbfec4d062dbbfd137adacbd20506cc84290f72a5348783734036d8b0641f6e59d603913621c48168d27dc1bb96be5e018d6b05db57efd7ddcbda252dcf5a255b0e28c2d6e5cba0fe4f01039b6d6b887cb2b9e1cd0d8b6a3a8e0e17019d55daacbcabe211162c437e798d617974270938f004180375b0087758e46c235c3c3e4a60d2dc2a7a28094b4d539cfaca84ea027bff000839a13ef99760dca1320b539a88374c3c95f15fd028a9fb364776f09fb1751175478899d228185ec1fde1e7839a95b6aacea33edd2bfde6b0295fcec4f830a5a1f4878d7d1717c577670f10c59014364e08aa73d62af45123816b4ae59c41a0d170cb9b5283bbc942ae22cd3d845038b5b2e2de5d86b0fb32986aba5e4086f8a8b825c68ff51e08952bc10947360abf599d769cd9711e379959a861394e9a83e8f3bec32ad40b63d3f528e67c1caec4de1fa969b31094ab2eddc7283e9297a5a7e3b9595b5f816e332bbebeb509252e3c5334a1a973cd934a1ca8bad1ef0402aaa00e2fba8005acfb52721ea311ce9ecb8b947e90ca65e15e2ddcaea8568b47c628b18a82f8e58818283c5acbf52e19c304d8e81f623c96f2709755c2441695d4f33da9c037ba1ecf041922da561970407162bcf538b89bc446aa3dd3b3e8984f998021c6c0a702c1e15dc0f161e2c7e0358d3eee742a23ab8e8e9d13a097a0afb0d7c2f99638510baa2050c2e2076f05c45816556f034b1d5448b1b760865917148d4b745ab11d94af7ca85d94c75ff31ab00fc2a645a4b39caf1ccaac5594e6583fbf88b56a8baa6506380fb9a5106ec420cb86d7b97015d44b1fc53078c479f1b4d7f78e83c976552240da9235e2af8b8badf978a3fcb3d426b872a0f7f9fccba80f8cf9fa8f4152adf4e9bf597dd7d128a065c5bcd6dcd8c9565c9a7c7c644069a75f11740e07fc421a4357145f3b0a195f11884512b0b7c2e5c5a536d7d40a0b411fd4018c4b65c23f5716ef521f9b7cae2152a530677f47316e30128012f4b2d476bd2200b1c088c4456b4f66876d43379bc8a925d506b7ec0ee449be02ee6e541c438bf883925ea401bbc39bd8fc5cabe0ddc150adaaf2ac662f1e48eea289d2524f212b001eadeb0c00ac8e276ba74a077c2a5eb5142277865903bfe10c029c971842e337dd8c141aee918bad11eae1c2225504ae2823a86a81b5072ccbaab5c3f1c24b68727d5915752415ddaff3074ebfc4e0d50b61280008bbe252c1ccb6a1060bb6e497369f640019a3c31643f3803619d547831b09582ab772e33e8f79379f8874565bb813c489cfc44591b56ac45b718459da2ac58ef0007cb19383a87dd84b4d25dd0d25ff008d9d4a3188105af98d434c815bb255dcac1fd4ab8cd7f462f94201464e3a8050ad53761b8c68793655d3104a4b18c02730f400f5dbf309354683f51cf678e4232adbee7315b77188614894d91d89ac2fa94b5dc29297289619e31145ba80ed8ea849a053dbf50e943f1a730e0aa2f3f1f64b80393f6dd151b943bbfaeea50410482d367dc020ea6cc2620518e7177543cd5c290456b2ed23461b05568637b5575d473c9623be54e9bbdd0bfc4b5333adb8b5e140397ab66445559d5fb36a79e4debf5177600ddaabf8f67a0d41a97f3190b4659775f894d3541e5e02c5ec37026b9af2f88f61040a9ee5971553fd4a8dde7f7872f8cd18c2eae5aeab08808e64fad96df3270f711e83a437a5d918b0e52a19f0b21bb66c43834e50a4b6d37f1e21d52c4c4db99df12fbad1094a94c100824dea73294e81f316cbed9c175b7095d59f866545687b04bfcb63dd0023e97bd85d425aeaec9f5611b3c0f24651f52952abfb25028c4985b4cadb634346f3d4e153ca394c301b7fdbe234581c02e018a94e9da4ab353fabc5440ef0092d341577eb2e765439879e58fdcbccaa0c5350b399cf2a2df336f824382ce23c6fa97e085b72e3569973950957a1e465b297a3007cb0c4e8d0451ca5ceb0c2f14a9c3aa8bed7a6809e7d4b917ac25646d195aa75500b0e67755f3ec1d55adca30b3ae3255c86e43ca3f510814a79630e5b8968163b2de47ba8f3713233d88c10433bb2368bc30a47f89aa6b36155ca5d545c05df1026cb43ca78730dd2fda7a16d0802688ef0b5ac6aff00dc46e253f1650cb23c34b1e6292d04065470a2e7d223770ca56a44328a1f138f5cd0d712eea1d61dcac92c7d70e711b429ceb4086202a2930ac6365e5bb610743bae4d664da062304a5388c8b2694fc2d8a5fa05dde7d0dd4a0b5e529c78aa35b3607711b079fefc4ad42ce4aedf3dcac14ce3e3f3156a2add61f3915a5f7e5dccda870d05a3f7c7dc6f8a2a94e0e2d7472cd9959e134dda0d8b414671d57a7292882cb8d4f61ad45fd4a80b2a0ab9c3d96fce45dfa6010807c319d3976a020d543f4cb905954096e3e6eca62bac7366dc7817c742ff00c98aa742025ce12946aa1c2f8540a944e61461573557f2970288a1c95410e68d7f71597b8401663623ce4f9c0e2572854a097b3d31001e255bc307e2083f711b55b51a76cb4309baa3f4aa97a37710b84a2ae1f72522b88838badff223686a57a2611a65fb189a41af971adf6c7569b4cc798b50e71709d89f2e132657b9a7318269e6e678aeddf70971125b2f20ff0002bbb6cb84e1961fd062f90658ce3b34f20a63ca0189e3e21b1b18e2c0269829570ac7d2e04714355beea0c80b725dd715025c7d895408891c4da8feee51d7588c1b78892d39cc6346ac2add22a70184bd40b559ff00ae6fe65591fa95b844a9d98c70037f130079b85912b25aedfbf82229e5e401d79384c6a406c2b7b41cae514df8344da191bd244d1c165edd7c4e7fa43d60e928b455d7cc5a688b5457ccac8d231e4c954a43c9664b117437c25f62d58b39d888050d391a161028b4f3597b71ea99450e21026e4787c455111f780f78ca9b6a81d9a31a8c96e094a78be186a32ec5f861d6a820c3b6d08a14dc16250b763e38d8f958d663491d480744f172b9f883e08988ebe652585ac1b45b7db02d2d96a35f55c6c056cdb5a5d1cc3f374d2b9b228ba0a74e3c890d2b9b12e029799f32a60a08ef6d24da82b08090a2cce2ee852ffbeacea7430a3130102583c6f4d7f76373ee1d5f14c059c3842d8229ab09415bf31d665e0151905c2afec4a901f4ecb4629e8858ca1c60c002bc93baa517a03393d9776f92c00db61d722b05c37c96e2fdb13735e6122a828c050e3422b3355c777854752928d827882aa80e4d616b415068bf44cee85be93c8c352cd9e4d67598bbcb2ecaa3183d8cb125d1e2c1fcc3e23002ed990dcb8599636c2a8ad6503d78c79348173b8f2e4d83791972d971b16cba34a8f60605e988b6e5bd9339edee526b81d9c9b397888c6dfcc61a8addead171ba739712bb0abcfe83fe665733da9f77308d70ccd6294128be8d67e42a005348e8e0d25a34e8c0d47543a54409c3a6169aebb0ce14338209e87a1d966dd5e051f8a9419cca3973c005dc2a5ef1b226558e2574554c65559dcd522d3f06c55571d3f5e12ac36f4ff9f5330bd1fc73045fb761db9fa661d1338c86c1ad8632250322861c1cac136894dc53d129508937f99917216ac288d10adcab8968692af777b97a52bb1e216cbdd61503b2fbb89f12c300fcd0c5d68b45bab2e2846d48f94b378881050d762990abbe286e3691c9f100ab9a8dcd429115fcc510ca956d8cf87e20709d1e3f5010d866312b920d5f7cc15ab87c8d2557953c846c0e45b47ac704d629e435ca55f5919d3af0ed216360b3cdc44ae7ea5f1fa7763bbd6585a7427e1c6ecd91a8591c8363055891eeb7d97849468ab86f9044e081a1334dc98756c4414bbee5956b71bd9739a07e98b09a867264c605e30f6c5f4f5e8f88237a2179429fcc4ee0bc7df72e85abfc4a5240ee6432c14b5e520bad5eb11a5e91a22ac0f86016d7047b32b43e8e2289142c3505a85a7b2e4cb70be58178497b3445f49736235ec006ef08148a2591985658a39960300e5c33028494293635d739b2ea782abfa3cc77a479786344718efb2f2067e935b7dc4df552cc0ee56ae8ad7c41a362905719bacdd08f9f8631b82b2c4bc65d71308e61988b151b4f0800f69dade2502fbe21574cb0d637293b21c5296bca160c7b1225311b615e454c6ebe60b9497150d85131861d2d642ddb5900d504b6c29c805001e0c20f92be0b88b14489d16191a1823c9ebe4a990ac6a565867ee0e10452dabb1db8529956df4895b850ae77d73ecc13869f6eecf98059c79725e08026bdb0a29ad6e5e3d4642b29f29ec5dabad37168b5dec3059b2cc713623d81fb4bafe64b05d8699730d4fa882e12e84264f2151e1842bcc8f2469d46fd8f215d5095ea03d1f04dbc382a3b7ee16047d18a2fb588f6f9996eb1718a56f1059889578c8f66060797ee3c35aebe86a5000061ca4372ea532c2b638a8b31fac7351eed7ed4f600bb82bd15e455e3c100139f447127306e24b6d525d90b6a9a4287eac7981cee957d2445097ac69ae6bea5f2dece9a4785955fd84021c2f9f5b106a77ecdc0218000e822cea97bc0f2b2f7a2fc6577596fd310ab6b809bc540db17f20c3ad5741530ef7771e5bc23e86c2e5bcb4a06c20dcf983b7034c7928152bcc85435673fcc199e57ccbea01a6c0b6add29e129b412ef107a801577fa94019dbe458670bd99b546db9c2ebab9ce4a693e0ac68e667b18c3923caaaf23649f5b1525d23b4ad5e328d87e2620957df12d41da6a7a2e340f030e6a149a29f256f257129428eba5b6d22c03688283757ae4a2c7e138dc529caa7756c3116726c5bf03aca04e11a4dddca39a1379faf90256d64ae2bfa56a510a9f4c837156a60a95bdc00c083c84f0cfe818764a231ce3a88980ecb7ab81b8158b0550a29d05e669c4024e5381d6f714abd860753d8fe35588d3f9b38c941552eb6965f571f22e1e56dfc7dc1e92d6b51b4e48a3167f812a47881f4d6c11347f32c6d16b41f70724651c44f9cf4594d1355ddde791d92d662abd7ca4bc45754ab5bb3b1294abae085c148aedb7b50944cd3c6a34b6e08222372f8ae1813d899231af7fb0844121c55978c05b475e2cb41a77e0626adbd5dab39210a1b2fe4968802517b32fb96320a3cc6a8628a5bfb85ae0eeecadf9b88f39ca3ee2296580edaea2100003f286c42cea5323545f9a8b72aa822cc512d79b5c01a6a705e3cf62aa066b8b3170b17098b1ddb5b0ac84851bd2cbb15c15b572e7c7f270a8341db340dda1a7324b8cd54a1e207c41c0132ccca63849184025614d6d128a9455145700f60102ad5591ca9bb0aa2ea60a5bec12952d543497dec5071a2c9a7eb59d3e77118b75cc6aa3b08fc4a2b969171e197a6859505656d5f571d68f72c0975ecbf9c218d682172006fdcb008101a89a5abfb9412a85c9972e2fa5cb86e7b1a65ddc5856e0ca08a154d218f32b42cc2a0bd01fcc0639a94afe80440bb844aa95f44d4a9ad716f6c3b7fa0204fe933e6297297c0f903a6c25ed4ee25c73a4a6e8bc4e2f98493a514aec78c07e87eb2540fd9799bb32045de288307236251e387a3fcc5f533b0ba7d61c0e86e1baa4a0e555a9b4dcbff52cecc7ea98222b63f342f12a2cba8fb8128b507455ed4b5e407d440bbd1c9b69bbb9bf440dc5df48d5619d3f6804db55636eda8d9ad0111c4555138617bd4baea084512fd61c10db65476b115bb52b0a8b5f92b4a8f4712b6cd6e5abe88bd7e14148ff0094a44a9b8bb78f88d06956641dafdc6d08be6e0ba31e799601ac13ca5ef1213804b5e10f056c0fe0c08ad51c375d1f04455c8ffb46b34e4e2534ced0db7c23bccba8808ee3ab16ccd8b43f0b70f04bcf2202856d95950335bb29e00bcba9602526be650aaef16dab5aa80a61fe9b3ec8c8af61a4de4e7f1868597db071564bb5db923895b812315a4fc700f8caefc6e0059535daed54bcd5350de25d3008a59383a627655e4af876f9885869ae62b082c629b505b32bd5c07aba276b5fd048dd5d4523320850b69bb465b8c57508d1af7105102ab958c53c42a29c426944288760e2bf313762569ac2e2725ad8e59aed3865e6c7951bb0b01e10ee0defb396eaf5e90253c061464508e47578c4085554e5a3f151975615825970f03de62bc7f41ad511341699c1adf4427444d17cc299ced949c732eb9e2182a70b26537d4aa6a20cf10a22052b9fe180a03cf658ccadbeef8860fd0c6b88961b7cbc83561df8144d16d94bcde67222de2d71bee5a5d77546bf3dc13f9dac6e177068d7571a8ba3cca12cee006fab90aabc20fc5128a834210f5d2a7cd469584e3910f6e01464a66b3f91a992c00a3e09750d50627c24ff00032bb525fa15570a0500545d0c5ea518b00cf12bc5a2bbeebb8a331afd6d1c5a89dbfa82052460ef1c91e1188a977cdc46b37beb964035dc42cfca568f12893487e3605683caff0012c0aa5128a10cc00f7183ba8558157d84ef795fa531730cf91625510a8c79bbf1394bedd54709a68a5b16d439795a0444507bff002085a28b0ab60adc22ab8e612a61dddfc4ac43be489b5dad6723c0472d0826bb4872cb6870a732f09ece57d4bfb7142816db0745784ad25da622d5a0c8fc9ad7ec3da7fb30d0fa914b9a229f52de3b9ff8dc40ac797cacfc1c129ff3cb28538f3b16d3dcb730745d18939ece8c5145fea06482e550b89134894c79fe36602b29256c5029a14ba975a36b12035be2376a6b760a593044594050b174d44b66cb5ff982e1d2a5d1634d2afc268b353c2916b1141379d2263984257bccc94282d96280b61b6bb51c0069073f136f7e04c41dbf486ef514365171f82d1abe2345edd02005951ced3ebb855697c23119c3894c4138c8019c439aa964e86a5905fe96b3c942f11c8bac383982bcb00ae848e806bb56459538e0230ba2017931e04f09e191da7307364bfaaafd2dea25023b2b0ee540f6d612474a8fb8e955b52959ac1e62dc7a0ddd9503939a8b2f2732c64a13f4dcab5b1089180d2f087d1697c383f404a822d721944b4266018326872b00ce27d050cfd97fd0b1a3567a4b8f1902acb3f05b1854836fd1f1f732a554441dff006c45436787f534d5f79a9dd7bd65b993b1720f732cbbcafe116b5e4a3bdabfba4a2522ce080915d15227efd4b02a1ab534a2245a9e9e532bb8c1f7a55e49430597b751d7c69580aee9e1e199c625d4c00b89c2b9678f89afa2174ce6555ba91c0f09526baa8afe6f3c4bdad28e62f4e5b72d0d1c3329805df7f52f29742b98d8793cd7876a2ee78b95bc72432daab456128ce07fb886e9564d08f2a9f7fec56817a7ca9c9288d5e1222e99655776431db832a9ba770bf703192b45b130af4027ee09147a750b0b869093587eec2115fe83fa8706a0e89919fb86f9da2261246db84cd9d8db1080bd60a349c4a1f5838b4b7687de19117b6c439627026c26fb9433cc4add53025edfb10a4c53161aae51557e06f99810f623af91165c536ebe60dbbd9ee42705b9a857ea4bad656036253edc009ba9683de25c6a29c71387d9cff418a94c127fdd94b359c77b330afb2a0d72bb0a2babe66d162d6bc5c298c529cdb226b64b36cb2cf11847145ab4e57ca04277c60a488bd62000befc8eb61528f255de04d54d352c8a1113d65833da54b98b8879177bf50ade63d89dd9adfab2981847b81558a8ef75d0b8f027cc07b2a840a2706047eb010f71695934cb25c5984b3ea2a75469fde08cb6d794dd5226ca5470fc9c8fd91392115160f216e2dda85d0141a59abd3ba7393886d9b55dec5cad3b43f923f4540ea512beebafcac0dc6ab335fdc55a2a9a9c6f6200eb36081cbfe4869069dcdd59544761cac00383b88ab0365b3e04a28f7c5415a9a1a473a4bf8203e49f4dfab9ef8852862c277ab94ddf33b838b3c9bcbf62e73419d7f68e9f965d15185422396ea30dd777e54b2cba600dfd8a54ea00e5966de1dc2032c745ebd1c7a11e58e908750023c24c52e941ab1aeb1230885eb054f0f375154bd16825072523e80b8671d09d3a6d1b28169e6cf9e2e2095526f1f0b72c29443b5c4bff00128b5f352941c1dfc92969daa90d13f3a4af7ac556bea25dd77798e32c8149086c3225fc339261a9411c7cafb7c2296d1940755d4ba7cb2d22c69cc2a2dc9752ad8df72f04a01eac47ee8d7bd98b45b87eccb9af302ca83e5f89fb96d314e59178d455c450dedcaceb5c0c779f007201704be6885d747f88a6ae057cd8908b2e320e5177dfee6d3b6c02dcb38628572dcbdd4827b2f4945d6b510013db8a68a659710020da8482a85e90f195db4e2d581b5d6b328752e798dc23a4980006e8fe8f5111a9a63e4c399dbd91695537e5c5ca6da2aee25ab8548a4a04c784445b94ab79cc42ad3e2158df0ba02554155be8e5627ebfd1af63745bdf00e583e60e9f9a6173cca2843c8ca5300e2a1872ad5f9e6365434131fe65ee86b78d71628948ec0064b51e448735eb238029af87c1129d1402151e0a8fae868ae44b88e1609e086d52179ab0abf2b00b5025b00135c44b2ca8af620ad0fbf9843040d2be6a20d14bb225d9b59ce0034f5ea64a6718ac109029dbe88b6c091cda5e1f7442f408ce0bb0a1ed5e08a16628058dce3ea21ac3e5105788c4c0bc4a7117c9480bc06af466e0bbfcb18968568f9c94f4ba2a3ee0815b7f981b06eca854cb1b5a7e97934a6685a81d7edea21014550b4d6726afb362aabce6ed38f6594e90bf7ebfb83b6414d77dd426e280aff883a54dc4d715db96f637761c184ec3a38bcb9c7c42c3419ac7b2f98de86c1f3538800813fee6a5756a2dc95a14015136f7111de0a31726edf27d41b7c4e2e88d8da81cc548b44b5f089419913a237294f99a533ab988abd97530677fe4854a0d6bf1283c01443b87baba1b000099730aaea122149b6d449c83adfa3dccc96a00869a9e054b2f865b27c054a2868ad12cdf65c81f1d4c8af692e1145700f61a57615f99deb28912b0318597dbd312db4e3b82d4422b3a079854dd590367b7dca87bc303849d495b215194abb96585b00ef928c30ed8d183c173631845bdd211d8f835835cbcdb52a0da9dc596f5a15141e0aa8f4de184bbb636081e5507c20b10c96858322b642b1cc3e50b4c5818c0448a813c483aea21f330ac21c25c87995a3612ee3857705cabaed1b86a45e98add312060875851ea178ea10e47bf512d4cb5438b32b42539d5d5c16ae8be1970eda32fd457b45e597e46f2b02719c12f61b5ca8650c1b018a54f8afa2384a8cf0bee26442b77f794e6892da71782814f117d0156ddbf2a2b749a3e2e5e74d401e876fdd4ada15568840d5771c43f902c0d18f3048df3170d3b719db3b479339ea5fa83c5f6dbf93920dcaea81f3ca6bc4ba434b60925748c1295b50db0308526c5c756b32375606ab10e9bff00c4228474ba510a134a726a359cfe73a8fd4a28beafc1a8c6d2f3750452c9629c64d81ecd075f8ea203d9a7db5f8194a76e4c5a08c04f9ebb94aaa5d030d1bc1c18727ed40b34b5b81a1ed07fb4a14792f1003a2afe20559eabf1a4058220d3f8a96a1b68dfdc248ad5393e7e65246db291828dd8694ee3a00f04405f4c0ac39a89528b1ad8ebf895443f2951f546df3089c400e6255e00972d3a70431702a40c2618a5dfea5df6d13d977e5c58d292f26fdae04696a6afe7fc9050b656a39264dab65400b5db63575bc8fcb3f295373ea294377e457791f32d05d244e314770687372a1a964dcf2b98616527d91c16ad17f37054bb95087540ff0057440a16a9fb8e0bc42f381e236b7587743a954b47152dcb5d6464682cb08ed618863b2856793280050791d0a636a95a23424fc03d2e0cb28075dc5f54bf6e6c142c63677631630db03cc9296df0a94572ee6d3b89f6f22dbf85c58109d21a4d156b52b2ad8e6416a8e9746a56de5ab788035c086efe08438ca43d5ab9410af3605754b7250257c421c52a0e2a564754fe1e22669c71db1b8bedcef683fb96419743e5951e4bdc362ea564e658384879755abf0422c22c82f7842da674f53597b31305e43c1fbd647e1854738255a3d3f4469fb0f253fdad568ac4e1d2160d353714734ec61eb2af177fb2b62fa4d23544fe12e4c853577964b2710756475d8037b3a2557ee9f58e61c4b4f1347f55ce0fd436156a27dabe4834a5f0347ecaeaa64cac22d4fdb5e415a6bb1e534f7092d90d063f8b947699e0f6ce28815227afe4fccb45c229ebff00efdb29ad1bab5470e75e5fa954629741da217815aedf990ae60bcb92c05b5f662f3baf2d07cea5508e3a06b60b7ae67876532fcd4caad6a9292bed8eb7b5006a8079c898557c251ca2ac0d2d0b1c051af38803f13d41e10102d8e1b963f8956b886b63bdd7d23553c8abe919b1a0f0d7bfd25502a148f569c828a43ec9504cba61e63d1e92af4f0f24e0d8aab17f52f948f112996dd1d8b8fc0966126f9c5c14a20399f0ae02945d29d8ead1f30a1c9320bd4f90c11864765916ef12a03ff36c4810b47c4f97b300531cb66d8dd5635320df1b4d56442e1b968b360c791a595231e0864d6aee0e91cad3d9ad88c61b94042c1ba50ca41b471f32caf4e23e9d58277e732c04a0c673e417ac78fa9bfba2a7374a4de3e610b75b1fdd5d2a0446210b96670e8bed805957c4b2eb6839b2b488dc7e2db71d09c04e485068f0eedcaed40e1b893f77518f42b888aea26b0975ca79f1ba7a8ac047652acac24ac20b2da234128ee11165c04baa63d5d5ed3f3551f215db01a5942d717178808768ac094fe6b600d3caabc84add1ef8d57f897b4f32ff0046971eae85fe0e53eaea508a1a22d2a162b75c8c20812f8e1605c15d598091857685b76f1fd084b94c75456aa804c5edc19a3780b2360abbbfbd945d4169a2112da30a1d115fa9698a2a880cdaa06ef8abdb80b7b2d604b80a914a8f57c265f09ac4001a2a940654dcc0e974f43f52a909d822dddf15eacab5004a6975c51313a2e3307c7cc71b743855a9ec6c065ba0e2509416d38b6b17405430285790a50fcc0142ea94e5cff30e40e5c9d7e2a6b96cb5ad557b2d52a2e87947d512d958ee2e9c0fc9ec2f676bf938dd3a1b300a92da07aa55718947311e798a19c290efb73e0dd8a96ca028895c41a564b744facf67ea656ee541b52d581d49cb7487e621bd40a26a8fb096009c18c670dcba8fe931a42858862fe5c2fb0ff5f218667ca95d42ea90baf6d15a37501a3d24041bb518a725bbab2325848839375b787a82b2fa56cb7431a8750d719c2e913d24016c79b86aeb8a65c091c930028a10dac252eb88309a28957ee4056aeacaeea0f47628ba805a4bd2a71e363cdb701aa2a2e0c1795b9f6331c1628568c7ea51d7e3660b94128aa72c701294213160b7c4025229c5e102bad2300954ea850fd44c3d44d27157042d5de273ed8dc3509b5c30943d29d1178541fea95c65d447ac4058bc02706c63f7c6c4b491e544accc1c5f770616af4f6a5c70cffa5cb22d366462f21af66d645e582d5f2b863ca75ecaddcdd12815d2f3a615fdecc565af7383c902e260a62944e3e6f25e2e9c1dd0c5e68aef6e2064e5df2454fbd55b0d2393a55f9bb653d6d141aa22eae2c502d73734594df5f3b2dce4da840969547dd6b8bf3f99756d5406f158f31e6165af0a21478c1655ff006858372ee8b8374b9d970de44df2ec77f3f73884550c5db794668992f686ea77ae5e785613ad32d7a721f6c6820e92aafb5a8c01b5f2fc7b1d95a601d1bf9b3ee01a36693cef4fdbb2d9cbcf387ccad5d0051ec7b97d553d7585f9b7916b70d2b8fb839b04f82228da255ff4cfed2da29aac13de6ae3943062b7ef5984ea2b1a0c5296eac2a3f56442a7c6d38fabd1c8d05954dcb4b59f5c4a2ae7442241b6a6a0a2ba81b7f32a1edbd7214898f1d4a0e769b29d8d3538b03e983be6a2d20855457b48f60ee89736df370199d4ba02d42485ce5a7735651198031158f8c66b17c7a4bfee60ff00b2b288cd0d650d240a9d895529699c5a963be3a950462ed495c5d9cd1f9b9db15a4b8ffcbfdf52fd854f00c896088048c50e2a1a0c218ee709c979014bce47cf04a888d026d5cbff00152c0a40368a99486fe9389f0c141ef3f72b12d0947abbf135508b01b12ca2a8d26339ac56118824c4d21fee95f18969fa3f10437fc20584a269d287d47362d54a26f2162b30783cb942631772052ac2e0148bdd2b705c16adec0a59c8b743117b0a0ea34497c0940b5c3c7c426f478aee5a9ae81e4fe657f55b02041a222fcb93f28a9ec61da75f89668d3c54b5db1c7fe226abef61a4a74b3461faa9c88be8042007ea99662dd302006bf25800847436590d1394e42159b2990b11ba1777591aa8086bc220cd1cdf371eb100beb100fcf7cdfe4835622fc11b44d7132e35c97b0158bf3aafb8ad37b7c6aa010048d454ac6d794786f04f0d151654ad4e02d870eea147bbc44116f66b91fa8aed5596955bac2c4943c5f15c1039576baae02ef896045d00f9fc476b5469ae4542c6baf3e1d43c028a7df018c66d623c8657cf0cbe70510d5a9c9bcefc8dc0d4b863cb9af581dac720202a83a3234181abd68baa985f0d62fb7dd5c22a68b8d598dfe65802804e549c95738d2fbbecbb26e91fe6fa96adc3420b9f11041771768ddbb7349d2b87e4fa85aac5705c89da55c55545395562f3e8a6b8fc3b068b630a1a7eb259771e04c3e2643e2d825e4bef518c8844b1e999a8775e422ffa60d1571b54bfb0dfd3b2c25308dee0ecb97d556e71acc6f693f32e1039e62e995188dd802d81bdc8eaa9c8175011903914528615bfbe5295ac3540653bee26a103a517cadaa3569e9b5dde6ca85daaab387b8db2281350f80829f0e6713b30bd223b0078d8a08639f20fb69802d9d046257cb345550a2a5d64b6c6bbae980bcc08ba3d12ae2ecaa971ca704b83c5ae252bdc3fc404d22a2d9470e250c29ba43458d7f72c8510d2ad3fd1045593c6e5b3ad017c0a8e323b438e9049aca35d1f08817bea24aa6b175d5c78154edd793fb458144c8364f2c3e0c43d3e4d2f32d2e3703d6260262ed70df50e15b4acb5140bbca76dc56acd032b79881404a9cc452c8375515e20b587c9b966fd7ece600520e3d61ee803f110ba82983bc0bfc6c6921ff99a4237c9a77a632ba60caacf23ae46a3d83bdc6a9a70d5f3d9cc0a15ccac4630a5bdf192efa41a965d617668a77f371bb42fb39108d0f428f4589bc3a0e7e0be1843c5af89671e41f56dd7b2c865389f04053104c1e5a8b80e756af82e17a4ab02c6d65e9db2b75c3f56c6ae0a2ee69ad0b76dab97422fa000b59afe235d383e5af53e6720de03bc713a72c0347ccd32af6605ee0c401dcce3d291fa65539384f851c7cf87e2317d8ecac1b47764dca5e8175d635f4cd880f26843ca259cbee21da7c8a3f04b3e529955d623142e20906ed5983393fa2e9d2fe62dd457e09b09446095bf3315ea7711f14aa3fabfc405c5ed44a325d69e0bb9b52ac7bc37718fb7e230e864e7dab2bee039161eb55eca311895cc1d445403566d8740343be48edd52e31111f00b0ca00bfb20b8a407c176137c83bc29857bbe626a1c232e60ccd4750160ab5544a9f6891c9cde8a8480d0b18c170e01280da4b85f90c94a8a9e630be862d2502d9c5b2901a063d247960c57947b505010e435d3d952974b20d0e3ee42915489712a34abde1883cd50d5b0b0ef62a3e10da4b42194777188d547fcc0af9571034229a3f27844eaa8385d7ea59f338f0b817a607f688cc550c0a5d20a79f843811936aeca9be616d7064525ecbce32373616f6a7b7c239c581f21860fd5317a7e21dad51cd50aa83c6cad85735191a55acf59cc4a169b576d4ae30aeca8202807254d56f73666df3f3c8827583e19db2c3dafeea04596a83538c5cd46aeda12212da1b63e782a0aa82a26ecf88088ba80ae8af8952c9663765a94e71d8dc159e74c83b422edbb5885d6a4116d4a2fcb4ba716f714d6cf5cbec9cbbe238841f7cb701b77d556caf2000a895c377b8a1c17b54ddab04dd6b9fc0e2a002d516b5b9e6c0766a734711b0ad92a837cbd32576b720a96b8e61604d2fd51571a3c5a1471de54a425355a0bcd86beaa4726507c8ae965bfe25820ade945128a3b425aaecd953605eaf5767db1a02c5a2921fc0983fefaf6c2c2c8de3a8ab48e4757898d68e46704a349b4b801b9f0b83f06a09a860397c6ca232a2e9c87bd9bf9982385917ddc8f71f30a0b8134184eaca9870149e23af5c9329b7f0cb829db88ee7e3ad70295ae9d5fd302d8422344243526f157020e1a3f5b3c0d8a5e0631b6a0191d5c4c9a2feebbc8eded56f32e28be20b25aac2dd20774b16e36dd4593aa152e628b11b5e4452e872ca80d524258773b10697f51005d39c730556d74f59522da713c1b7083a33f444b74b38f75b5f9929c8b517d47a8ab7c4ba5c097d10698bc30d3d4121c2a8d57b95767aa96165d4fdc8b9c0d0f464b51cbb206b5994abbdb60b438671aaca895278d823d305e2d965f803e032b6d89ad6c49766b0002e88c4e1657d6c2b07dbb12c4726b1fa81e129c776ed80ded03a7a2d0a122cf382a42f3d9a8ecd19f04afd901dda63f3465c60a5774e08cb1303931c93d0391f197e45711895f6171aaafdb396e6bf4d894020cf39f6365afb594b472bed7227721471cbac957d4879fc77d64cf400576e3d0b952de545a2fc08ab8a4198ab95a6e646bb6fc05c69a545010b53795395b52eeb440ecd391b0551c19e72fea2b2732ade0e60d50ff00b859aaa8585f10c6626d9a349a9dce47168cbaa2580d374ae74bcca34f20ed2feaba22ea3c282e3ce2e5a469e721c2225034dbc2d73c1d47066d6e68792854f88e28dab3bc9530e078bc5263290d86fd954056a917d25d5ab6d7e10d2a17595ce79f5d463c4d3d01e06d92a67e54dd307cbb8a14a0d4b3ee225bd84dfe31a0d17b0d3bf12a4b88252c42710468416efb0b04a56ae56b65da8faf111be78612b384aab2b627f0f11e23773a3970b6d0545f465b810257346cf31196b63451a277b0604de16c67310c54afdfaed4df36ac1cd0d0f25410ff00d78a7738360a01b3820aa7fa6add4b5e44e05a6f2074f6d7e67650aeab475815f6a0e8369c4322a5811398ab5fcb282b6982b895080736a542dac213816fcac5161086e4aaeb1bcbe2005606cf9668a2b4430912fbc0506ab2ef20524721a0ef61f775826108e18eb818cfa5c83d8d5427375297600e559706353bb784bd4fc8581254435565eed70cb2e05ba85436460d2246e8f6c1adbe01a54411347031f92085bf298aa416f1b952575e20167de842a5aab565c755e1728ef560b808a4b8513d84b62724698f8e79a2e5ae3d96ec682d5ad2e1634461f6c50b63f7339a4c859797ab34a5f5a59babac6220a0b760bbb14b060d9f6012f812eff9983bfc1dcedbff002e516e1c8f761fbc85821a2a52ef62015c5085dcf834710eab97fb4b53ff005420ab7b05704e094a2b3a0834238e6ce9e72e389357e4f93136d6d9dfccf0386f30e18ad52b7f7b1630b134eb7a8b8f819114ce9f17936b41ba06b8f88096ed5e9dcbd1562a3ed28e6a3a34150d61fde0b7606503bbaad6510a19a70cf3fb915cd5eb4ed396a9e21ad620e5bc8c18bd05d1f6410355705dc59414177c33989a3da7179f719481cf2d9bf23d554cf7b42bdadf6d2a58087fff0095d863ff006ef246d638bcf736a3bd11f6b040f25a7f4245058c75cbc7afcfc426daaa986b57ccded93838fa997201eb615f246b4b68ff006991bbb87504287629e71c9327c1c7bc2cd5ae1d8ac8340fa41ea56e442e87046d6d9ce712b59e16123dfb9e30579674b1a78e25bce69f88eed7651ea59501ab75598452db1571325e9c9102ebee075ac1583e698b0bdd0ae8f89715f5e42b66fb12a21bd1d92a3f304fc830d8bd235502aa41d518128bf6c216b9446d14de51c9aea172775bebc9b5c082af1c9637f7588eb29d38d1d7e664f5ae3d8b7d8a0f82aab60d9cda398b6e3089f645aaa1e3c5fee1e74bf2e36559e54f8d65cf73a62f8804385832695621c00b0edb31199621b0b38bc998280c874200aed1c1c9ed80a7b62250a6a19b6e535e1cc1f887920b6ae053ded3f24bf435a5fe2112e576751d97954fa7e633d953e3b601f5acfa32e0bc563eb8826400a3c23e50325f141218b7f35f821bb756732fe57cd77ec2b67671f012cbb5f35f7d645515e71c559188f8066dbe7ed8d61c58b7966f3b5cc2bbb655ae42f3aabe62dba003cab4524e3cc11776ca2a9f771e54d2ec6a538a68dba74809e006582b7fbe33c63cb716adfbc897f52addac3ea6ce11d579b5f68c400e42aeb578c966d2acbcb2abd975e00795eddc541e12b7c88738032870e6164c5e1ff65c1f644508ede5c62332b3eba6c97736a25a856f5ce5c0f200571ec3f1522d528f5dc0094d242efbd5cab3522a8b39141888e327ac8da262b9df952968953e0bff001912f51bdf9e25ac11bcdd91d86bd7109e92f70e108bdadaf4e32735f94dd81465fb50c81597f69706112d91a3bf2fea182e519b1e6b584179745466b6fc0be21b7e96e3641cb8730db04cfbee1982a31397b5556cb06ce2b334aeb6077d28ebc88b5ccb5977756e26479be98d80d8e220a0030590029df7fc89d87f934a1300953a39fe6396bc499229b6df2143ae5b631c7935fcc235e684422f8a6e5d0252ca90eb8a706f158d1194750a4bd817d7b3e8b0782000456b1121df2af04e59c70ce25fb31065972a0d2b200bb43a601274dfb8eb4f0e6a62aa70ebea5046976a97f31664a56b05501c80a9be97c590fcff003321a186408a898bb76e3f52ac8ee7928f90d3d32ece0e6a19b91c8f85c16c546d1f28457969bf716550a9e7010480a56c73d8559bde03b0203859550168fd630c41a26205e6e425ec5df552e3260116052bac41ad2f5cefa85688a2a6b4e1002e1ebfe52fa1ae67e59bd5c9c2db2a082addc73114b522419a22f4e3f8a7f99d96aae138e7a96e5fbed9777fda1a6f7dc4e1dfa87cdaf1d8732fc429191a62fd41f6e4c61bd00fc284957aa2722100a7355caeb197755c2a671e7bfb8b54987d57910c45178bf98691460f03c17f49040a67665b4e807e6a22855d787bd5fea54393eb87c67e6a5b18a3635577b93a015799e5bf88be02d9cd6b9c1152de1934a9cedff7df888af6e9d3ced7aa9caedea2171ba5c4510ddc5b92517e5b0032e1ccca6b80f504dc1456dc87c7466f45fe8a854b069e0f98d79a33607622b4f2ae70f23d8476d161d3f9ba211deaf9c535098ceae64ec27c5ca8c2af22d409c0fdc05e900666afd1341ad2c525cb80f4a94a9d236fd7b36e5e077ed8b2d6b23d21c30174cb6da9ccd531cc6c8016e1f545472eccaf8578cd57662ebe5dd7f78e03ac605c10588c02a803c62c8d5b9e2638b6334e7630005ce79f9202d89507a62252c7d31168ae9f65f8a11636fe45743c8d7fcf8b8a0aa32fd9b26ec14eaa54b07db8eddafe275d0adc7bc82e29fb251b47438848e37bcc4e2fcffb95b428739953a3680980a2d29dcdce4105adcbae88cc000095c42283e082865b0e8811e7a540ecdd5d1298babc9b58dd9d4a94759516c05609561bda4e3547ce23a90b4052ca486c30382028d07314a063feee3dd4a6bf981556584b4aaf6a958712e2ba2d8237aa2dc07ee8ef1858fcccda871dd46d751cc0ebbd15b2d82d5082fb0c7f1109eb50423cca98423f840897183b674c259fb9a3b9c234b775fa835f92699f225e7473f51c569ef6ad669c42b134873531eb9fc40a470b27880fc30ce03ced4e1f886245ab8b55547ff5918dbd54576d0f2ebb73335bb576ecf390b513fb92e8bf88be42af7ff72c63741bbef309b2eb775f2fbb273cae4eeb587e6e5b03ef575a34b5b9092bcc0554c7ca1cfa9dd7ee55205af1d5ad3f6c25b2d4fcba30b5701a2abfbc650e8355afcb388394ab81b511dfeeeb3ba543b4aa85f088a077fb659efb347b3e7ea51459baab0f56e5cff30df32c11a2b82a76a53572e637fcca9969f24105e7d5a7e09b116ba228dc961e9426e5d983951157eb6c99098f95e6542155aa477050a6ee188e8045ee3698ee6196546166f74415005d887a96ff000e0c7102639c45785d223aa0cd1b236083d89d6fdfe1c7d1142969d7fd20d03f39dcf5167290e31fd4e5023751602e19c9a768da611520acaf881aec96e2a04225ad18a36829fbf921b98347a628e1ec791e18b06e10571e6e98a0263430be6baa7fbb34ab5a87012f841c4ac21ebea0053d04e21d16cb5838570a75cd18e018282eaaafcb04a07751c4510d5822f141ccb22686fe0f583e121687b9bed3641d414a775ca10ab1d65fa90d4b3107aed95599e09712da4a57301e5d54beb9db48418ab717193c9d159b1c63c95779942e686bea1db5ee4a8acbc34f172d715457d6b0fc205a38f22a93b75504eb323c02940a95b7714295572841ca2e5819b2a1a05918b5687f7995fd108991586e59010149aa8a4b136be619d82d36004f053f79fd230a946afdb006a8e2843fb5fe26ab8fec7128f18a95ab3fd3fcca1be6bdeeb1c941a74c6fbac68895a3439f9f4095a13a2f46b53fc90a65880a1c0787bce4d2fe95fcc13af36c70ce5c7df315a06ac7a0e4fbc811b1ed9dbd6d70554202cb89c084b70c5228b60f6bc4d764c67bbf37b9cba3a540e0785832145b4f4f4fd0c2ac1ba5af470bfee20d12b496c3342bea02a9a73f846ed84e4aecad7658056094a2d1be60112a37bb4703f3114a1476050aae5aa65888dd013b75deaa1d08a3bc15d4d6a9746602e83588a164bdf29fb9482c957572eab99542edb382e46cd87d96c0082076afaed02be08052e714bf22250aaa7fbe1a285aee40b42ae0507054fba37e21d69a832cb978b9535f08331b24641c517b47647d6169a43e066416b5cdaba5a972e3b8432a73e7a1e1defc860e90c46bafc18a5c27b2d6aa8614093e62e1085081b83fa8eaa80f184d5cf6502b4b96ccaf8619056fa9b45d3985f3b80717309c704d9c2bcb2b058b3061e8c048efcd28f4759624937cc2502bb644a5a6a4e525c0db57f51db8191415c451d76b27cc186ab41d78b01748510453110fe3a9629c56b29bd985979b150d05dd4c6f7bbe822205c253a572b9561bae7e6034a26a88d5a858da6bad79db2814850210810f804e2b516fd636591d464d2e87fe03c267e739628205005a794ee1cc12edd0e6d992eb4f92316d042d93c75f30d83c1b62975cece9b2e0a8829412954594a71e980af5768395b075968980dc9c2324d5887302d623deee0c6680be0a7233ea955df353dd7ea169ae6593f64b45f1ea310555bb6741c904b0710bdfbc8e2a3dec8ba5dc6434f3506bb519c1f410e87a4c7dbe8815554fc1ff00aa1c14c533f7fb96eac6b3b590520b5c5f2fb2d514f43b5c823411bb292afdff000c2b06af6342bbf9cc6235c9c6b55d46ecafaf9af20a1c3cb5c7dc28757d7cf76c15098e5e0a7822281551375ecbfd4bc42141bc0a8d47aa057cf18bd5c1afc8176a0ae5892edaab3adb705816c4510bb5baa9aaa50581fedfe650449651f5c840b542abbe5b21c146df1c6cabac3cfaf3c40c039b3fb3b881601bcaabf5eb002aae346d75035555b6b3f503711a78da42b1daf61a3afddca6d5496dba76df2f9584a5658376babeadb9a5c5ebb31430aa3c3c88595a4d92d2b8d945ea8581b3db70997a7815fccbd5df2523f73e8691da9b3826a7e918dd27c3141111b131b816633243cc389e4ea9ece2de21ac03771870b94e290da878b358fb0d8037e98b2a8db5c7e262e07b907e129b52c9c29695d1b5fb828ff98160072f99703e4d87383e59f11dab89407deb201705fb8f640ce21ac22a8d563e0521a7b8461da2e89aa722bd2143a7dc805f117c3131d26dd7112c5789c2002745bb03e59e21748ec62d8031036bc255050dd3f0428103c9443a8eb0f96e1dc9a853861982b299cb74b494c6a96ccf226cf9210d6163e636392c0394610a17f535ba6d8dd3633b619ad787c8d3ea6ee70c821d84ad8d420f5db470c336083db0a29d1bf6b730ba3e09406da47914d6eaf6a04406c25b9845ab64110aa7313a82cbf1b36180d15ac8f0688e14f93ab639e57d64bf06ba981ca7703dd81cd3755580be5f044423b10b6b6cd6e0d04a31e3639ab2f7e61d3bf619bbf1cb7100f2c2fc3b86b5a34bee28061e2a1e2e51f41b530148515ab83b31605a400287025022acf1b87fb60ddd255bfe1d65e71ff95c1136877ff7fb88bae137f9b2e23873c95c14e5b12ba4c0f0793f3d31283a157aa6f84f12128030c3aaa7fc4dc822a0ed78fea05d1cc55cb2aedeaa555835e7d3cb2c5aece8c2bcbf123c8713af93c417e5e5dd18b102ed00d6b28707eac94edc76c351a308b0402ed8174b312169a56db26944b02dd79ae7187850f0566c51e5556fe1104d32b81d4791af600ac5a63b1a340fd9c5f84bb34e82cba1398b66c5395d6458015ef4fccc07b736c6842178052c1d4c04c6a57451cd4ac9906deb0dabcab4d95182d4bed354512a551eb0dc85a35fb35fda084575c5bfcc201f8852ac15ec3f8d4b50c6a7cafb11dc9e1fe86eaa6f9c9c995a2588788382ce8a5744346579f0fa82bdd0a8f840a78ea90d50828c22e96bc51b3a0c637891de5bccb22da165f00cbcf282e3f012b3bcf1d6ce8c2ffb9f7259cb8e4835e4c66b9ca84478a1650dcfb2b22e381e5f9949bf386e5a514b27d77c532a728ac6a72dcb0c420259d370753f9414b4c03676c3b70bbf717a45a10957b8127b74a87409b34e8804a9628f6228717971026d3fb65868ae426b2de48486bea20072d6792fe940b8d8ad128aa9748a9ae7c850e12821a2edca5e056bcb565c3913f61de299bda29886cdb8cba183425d0a07c7ac774147cf4427cc6c55e60caa84f4b98c0f979c570e580e2428b23ed78d9641db17ea1e6b494495730cf6de6518558b65f716b6baafe130dca3063bab85330963254884a9f1d4194ead146fc27b9d6be0230380ff0079f1ee0416742ff0f617a8b88a6a2334f5ec40d1714aada8519e24087742f516a22f2b2af7f1afe261a78fd1b91b79eeb6e96ffd8f44746ae86f926169d08b11e9a87c25d2869072abe2a1b250d7fee03450528f3a2f9e88806f23ff009942ed4ad6fb229827003ae26cd3bae780ff00b1851b6ae6d39e25b3d01674b476cec713cad07211069c7f7182583741ce5712d57828de2576166df9b7cc08ab2dcaf3b2b74302920f139d2b36d4dbbc2fcc2ad6012252e2eec54a7f7000d1cdd332029695d8ab84f378970962aee5facbeec2aeff00f7ea6ab1dec95f67059aa2bb2008b82d9a1d0e75f60188e2a9e3359655e3e6122aeaef0a836fb65d7c814fb444cd7906bb4af1d0897fa82a6cb6fd4643f091e22b6583f0c39a62672df339d6918de63d4d4ab9c458290b4a094986bea365b983522e141c148dbb21978f88dae8b23c176e1c108414189001045535a1df982bf822e12b1314e7b3b51b5ea88af7942fb65f4ec0e50bcb37617312a4367c592c555b63de12feaa25669bb6704150d66461bed1e20fe2e55f197a9823f4b064b45ce28b3ae576978edd890dae08dc16450ecdd97474a49770ead53a13870e03ddc429a6ac3c022b5cb943dd28611dc74754d12d71bf12ed0839788f6058a596f534e7ab1d1b52d2e3d023f2bb9646e16781d842d7816cc46570bddc9461ed7da5f82266744636b45fc5e46b2f5330204629a1df8cba0850957d21c8bc85cf43728deab7aee01bac0c301c150b3ea51ba97e140afcc21a6234ac75772a16c367db0b58eafaa5af5c5c7dab1ce25a116df0436f80583a18d06c9ba3f3fd3e4c2a52207b1e5f1142147c94d871dfbfd116d65153e03bb274838701df12fd36dffc04bc01b7be5e20aec052dbaeee446f7abb55a6d91757894607bd4003682a02fcc5a760d3f9ff001174ad6ec7daea601b55fb16a2dd745729835d7e4b9c59564def9ff17025156bdb21576109f43383fc44a1bbd94d6d73938d2d36fe61c5b294c6af112853981e3a4bc1101add606db5eb45bb089c6b585a64c4cbe02c4b6c71576ff74f246044aad46cce78c89ab94ba1f6eae004d0597def1a720158ba53e0fa8e83f07fa468dbd93ad1a8ff00c6041c79b6311c07bcb4a2097a2e9f194c0852c7e2507f77260ad1d3cb0289fdaa75a85bdf09453057e036cc2c69bc10d246a3f23f67fb8d60ff00459171a1650c0b8e71b08e8f8a8e8af4ec9a615b538c681fe2760ab2e5cc0d9ac3939b698603960772b8c0762e9d349744ca8d416603c1e330b7255ca1936890578cd3cd2305fc443cc69a42dab5f31b3bf82e7ea13bb697c4ed051b128374e5970ae4eb7dc0efb82bcad65aa91cfa42b2b5455ca545b8b84e01710d0aebce73fa9b74156ca000ab5f312210b96cee5468b70826d337edf251dec0df5621a2a8d1cdc412dabcc07d452fc438560f2767b15dad2204523b3655d855ce4027bc88e2165fa9b1c12da3c95c24a348f2aa21fe7904c0c8916d82912f1b9d245e7ac13cab8ebe412635e934b004d5f61f72bf566a022d0bae3c203aa8abf1093b81dba3dd8b436005c06161205e63632c9b6035dd41bb9c0e8b95e77957aca5aad266382a1e83793ba39a816bbff1993ea0be76e708b30a34554a861fc9a82118590ffe1546c89d35eff52d59676d15f0f3074386feb3999c6eb8c31802975745602bd83ce600df849f04782b7d553096ad67ca9f251cf2474ee75bf03e46d4d2d8f1dd9fdb253415995d6cec5acea6bc4440c52a83d040c14ae29dae66d234be7f9e216c518557cd0c8856d94db5eafd40a4c1ed7c46ed451671bd4772b6aee2ec97ef3e92afbccb03e0df20aa40d16396fd87b33520a554aa379b97d979a388f0db34a60688a29e1d58bda211d28e71619a8d0bac046952da9ebb7c25c07545bf1ec4a6f83f530efdf20921c6e51ae734950d0bc45bc39a881054a0172f812c9455957cd4af16ee21facea2505afe6dfd12b775c792f563b8236207c2544454283c48e4e4f14c3c114478a6087bdcbea134a823b1791d9c566573eb392cc7b5a8f120c91f4f2543415e932271c619c37c8e24029a646a0d05d128403aadcc60fa890abadb9798b9171c76b857697b2843e6a35899db28005d916d5783c131055be7c9418a8ea1bb9a72f196828200673e40bd7b7428439ae48e5193b167d4056e598e5aca32893156ac0a664b78d6820a237baf095b6448af485fe22e6a18c02462bed21b06ca2c72b5cabc256761558cf4af656b96eee5adbf0e4ab1aaccc86f4101f71a5f914def18f7bebf0cac8aa959ca3812d6136f94efdb6a9a81f79badb98f82d9bc4a36700b7315bbc85da5c1d54530bb1f87c473c8cabdb9874b19cf402ca985dade1c40060f6cad3a41b4bbbdabe0b8078cca554b3c5bd1b155253270888945dcbba6f91f8256d967a1222ac535f10210cba211956cb967ff0047cc5aa92fe515bd3754eb4f3f12cd3dd5f2695c4777e3556ec82a145ad3514c4a435c9679f260659cf7c4fef2315c12bce05cb60cb104ab2ed58ab428bab838b953a464e536a99cc1f89479557fb21c5f3781d684edbbbf778ff797b660e52b96cbe429bd3e9143456e0fbd5c6a4ed434d8034f2000735187317306a00a30e1f3c5910113e5635f7e06345952d061e5f38b96cfc8f6a22aa2c23ba30a95450310bc4d749e7f7ce7501184d13d9d9f7290a63f2fd6bdf041c367bea62d01edcba41b6622aebb3502b414c3402aaaa616177e1bf8cee5c83485c283c1c5cd9d0f0b81c5c429883b987ee54a149a28ff0052ebc85cc87e655c52fb592dd87031008e1a1340fd4675f3041e24bf47cc71fae27915f5291e1ef6a73a031081467ea3a2d75d750c97de59c73a8cbae08e864bad5bb882d172a7469a227cba89cf33ed42f3c0f9051e83e83dbf28aed7cb058daba4aa0b08ae81b7362f029b38ca23f7bad370656f54f14791fee340aae01aa028f7b0ad22436e66b4b5b57db85905abb74fcc63d52d7c5c5b433836d6cbf22ede40ec6c2405e4f889cd8d52b81831bb59a88b7b52a4615d41748ca396506c2106d185785c86842aee511047a055ac3855b4db6e29072ae96128259429b221c3e213906d555f71d687afa32950864fb5cd80fbee23cdabec46ff004c7cc24ec8fe58f268a5e6ca01bd5e033a2e045e10bab54bc8bd4b5ede071ec6411615e0866ea99eae1fe8dd64291c370078d97de432f6e57314efff00a2e0394415aaef0216b828aca0321dd71141975a6b1ca2d31cde4f9800563784d7b01512ddde5eaa202449765d016ad5d11a6a56d5bcb5ea04d50300340bd9b89bb6145a68d166df3124ed421b4e4a645038d5eed578868d36e23015f5e4d88f9c2fc7088058b602aa6e3408847abcf04d6e3a604a3e794e2bb962c6672bbec7901c1e0c61b63699452f7505ac978dfb45e38664975ceaa9bf3990edeb3df4770a951aa6bb53254abcb41f7b9332ad04ec1af1b9407c5be469b0be2ee052b25af4e0f8ad94b4d3afd1eb0b0837cca0913815b00b05acdd72c565ae8e2a8e17918829c1c7aaf602aacdf525b8a15b2ca8ae17fbde6051bfa5ef1e42b98c37d3f99c5cd898730bb35fa9e23d9dcb870b182c74ec9769784fafb83577a9a1371256e42882a9a21761cc0e9884d43c6dfe214e14eddfdb05afbe32574bfba866414972547065d76cbecb8ea1a73914c07dd4b0ac015380736b12ee0f2f0bf9f881cc1a57085c6880cd55cd00711c4b9ce6bcb6196454bac195552e8ca8c7016186a45da5c78397c92167ba80b4f6b1a2685d87303ce3da50ca370263f6e50f7b2fc2280402dd06b4e2357c5d56857040e212d5e611cf75b7804ae94ab26c50174e8944042ea9664de4292d44a057d6254f713fb26bebe075e970ad167e2bb210cddfd1a8f55fa100aa44a5312e72d75962d654ba9d08a22255b06a61d43d198cd67cac4b9e5d0e941dfdc0ad3b53c6b92870e4fd467c0621ac606d61e076bec5d46a536c394015c4137d37402519a7b708ed5dfd5153e7fa89affb9d9c8edef11069597ffd164a02260eb7a464b9735753d9c165d18ecba15b2dcbe3d115ddd37ce42c3cf7f52d46815fc5119417070083e1e05b5b778bd5d4292bb7af05cb5e0d45a7c3955e41c97c2d0726af325f9a42150eafe32572b0105a4a51c42e617df39b4cae4c47b787603208d456bae2106850addcb958d29dd9f3d7d4d6a12f3957ea2077a32abbebea788bae22b50cb3e1bfaaaaf82322d0aa6daeaeae2a3ba6ded363785b4399c22a42dd3a5b8ea372702f6c35654dad90afc35d611219883540717b6fccae1ce6b33b70c41d1fd8e594e80e86ff00f17301437c2dd36ad4ade0cb6a90517d006abb0695ad4b57f7112056f35abae2e0896e9fe51e1c8efec546eea5e597d5f026f75c3b02c03613c494868b84a5b8a953c5412908d9411483c9da9c108c9d31a35eb0f143792ce68204361a81ca2f9ebbaee2505f3f3a44398a7cc2f09fcd3fb94bf508239310d783b27f36ac1fe5624bc63aa5c528c5c4fd44028be0450ab734681817815715eee133e31e1c043631bcf587c0b8e0aa1a602cb65614412b4f4256ce75d859f498a1c11c0ec725ce682bee1c937a6042db23a792a1d80667cc72b42a9e63e2815750d60776f28043190ab3efb946a5ddb517c9669eeb16c275951a2f98d58b00bf1ccb034da197f739c5f51edc050e9c5cae3b429bbdb8ec4e43c44bf2b5c53a6d172e6d706d00af11e14612461c4755cfc7b0634f50a7572b307d0576ca48a0d3ecd9c04240b7ba4b3e805777dac076c1efe22b0bb2ef5acbb7bfd465547fa21f280a1f2c5b14642a8352dc7ff25f494e5b79511576da2c1e0a85aaf38be9a6cc85565a9479ccadfcb99c79cfe20b801d9c0965f0bd2fe88a0379a7eae74c616dadd7d771b02be4517b1d61e96d77cee56897c2aa93083080a0a0e9465ff2c44c1f57945f44b169e02eeeb7a95b4ed8979295e36bb75db73300c6e1f130da8b79f2e36c85cf671b0e705bf63551da53d49780380839bfc5f693138eac0bde5fc408a4bd005d14a0ac62ba660b55dec4a90adad4630a3da305a703e05c49720c0a6b25f01cc43627ec20a599ef2fe8942e1a51505930e89c576bc52828953038b9869a76c36ba02deeb76751b857ae94e97b1184a5ad7b0a05da87142a76c71c02ebefb007942b2e5f3b8f7ff5f7e220f773fafad63d6f2bf47920a3a7100600e441fb39fe8831b541f6c0f6a81eff00486a1b65255cb10792d7ee296e67967e4d9ddc6b23ab9cf3e4a108a84436e2b20f817644c7011d17f6453b3c8b6e1d06e4d1827cd201c3b9b0bac262d676c6f94143a8142da2d751041af4263083855e63505a0958158f8100a12983d2a06d8c0bf6fa5ba94f0e5adbcc84add3bbb12e832ecb5a87f631e5842aa94a87dc4d8845a6eaa306a6f440565b4fd4069c75260d15a8e588ab2e291a91df2136ca8096881fdea5ba6173612de9c45a63f2affa367ff99a82960175c690d7e857cc94b48fe5572107c8baac4a71884b861625a7ea1d5c8eecc5aaf605c50b95c2eb96651c153c2f1359c2bc4b1cca0ab20e840729f31aa2f0617a9ce5120000383fa8340087d2b45be7082e83d570b1a6203b38d717ff0090b18fcf0aeeb59b6a6c6f655afe58556a8b1bf2eed9451edf36af79eb88565f06bc5cbc2f7c224a43c17ad2cebcd73d79903ba07cdab7c74c4526a6d3a7ab61cb8ba0a2c797bc65dac5aaab38296e254da38bacaa2f86a281d95cbf1c2fb716e950a6c7dad81c94e166535f47b04d299db7ef15cc5b40dcad7c12ac46d53df2228059bafb55105cd61a82a9d9f5525adfadd66ce1e82cd2cca96a80d973df10085883c0259cc0e756c7479cb1d9d819ca9203b65d5dd2f880359bc8beff00d8d36a276210818edf165ef33b3305f45730ad8b43dba16b085d55b8aac0b21a1a6de859010b5a154e95777c55cc2f0097a69a96135af7b6c62aa5266f4e65a72d75437c71e04c0357edff009d8d7fb4ff00137503f29f40fd4a442ac5b1ea14e0f984bcedfd2ff4bb6546268227d917bc777d5901743efe1e60d6bd6c2fb0327d907882c4df6b98a3ba9e07fdd112965bebb3ea16abdca73fc22b6578689bd3e5e199fbd0295f197c57c20917a3392bc92c8e146c280f16af6345c48575f797ea085aae3d1f73896f54f87c4ae60707dc28155b9bc612c02f31a7f42b897ab46049244b21c02d4309ca02c5275ce282e5cdbecbd04b51a0118add2306d090648976d4b941d597462dbb868af7d9ca4d3231cf15ed2740bc21a5d704f4407bda2366092be3c1f1ecadc68876dcaca00d41c9080d69487ee34179c26e354b0bd8ecc75b297ba8acc300667352ba050b39e2e3213fc9113c8696dca32255b85eea0804b704e9e55d0962babace2215ac6dca34028e4cc655bf1058911a705ed0434566f9ea1b62e94cd80233576ae4279237e6881407ff001351ab9be5a710260e9f18c9f84ffe4597422abc72880b0aba9b57b6dcd7fa217d7ea0f7c128523b7570b19860fbd6b6ca1b457d39eb604bd48f63f75135976d6042c7958d4bd9cb2536443481cb65243b2a1fb0e6b2f8658b53b0daa2081d3c5285783f411c12dd12f8ae0577167715b637c809e7d3571e410650ec0057d29d100178cb68e71d2c0bb4176bf7be4f885346cf2c27b9edb3423755b4b6ef9b6cbbc19ba025f260ac5aa073c5b9a74f932e90d2e35d0e5599485a5f1554dc0a6d452ab731c966178a273d3cc5a2fc2ab65f1a92e8c7f2a029bb7b7032873f902dcac82c152c7286e63ccfddaed28aec425ed31029c736de474d706b60af25334dbac0bdcce88cb690b2fb2fee1e05f2302be953547fe2e5c7379c8fbf314b59ff008bae7eee3a86f39eff00e152e043dd959de3dce44b1181b7d96b16334fabdbeadc8b05bb19298ea17bfd0ca88d36ae8946f3d24af58272181dc6f9945a86e9684ee9d2a6acd8a54b775e6e29aba8b6f2fd3c1f98b5cf2f037f14989b88585fc3197aa555c1c2df81b23f2d1b18d3c952abbd07ed87a736164dcd0906b7042948ae001cf32b9eae1c54a97325a4d7c4b6e01b09e17a9b8125057e080573ef21700d3de3c816f878898905001e12f603b028e46053175791a3d28ab9582a37db70951652a25f91209985f04a0d414140dbb770f75ec0f35005d775be0107badd31bbfa8b99cc11c63cb0b9a027efd8a109a9ed28ad03469f6a5a441a5fd1f89502be67ee06237318b676caa865195883309629b12ef17a3ddce16b0737d95463baa4ad5ddc2af2a2d74119a28608512ec6530b4b76c084c915e81f046b846ae08c361134f9719dc180f7f80646a88f23cc6bcab93ffbd6a1260557cf76c1e46abe5496408b5538fac510a8ee4a8b02c69cfdc5a594f1eef150a703d7c9e398d24b940e7f944a3b446e5396235781b4e6ef11db15f0dbabfa9514920a6f38bc48875b72f804ac6555c00552c0ceea370d542ad5e4ca6083667177dee0baa079e81f1f51d523158523876a8962cdce1b4df1b6fb671fcc7060572de3a29f0377cc411e07a7c6da41636b4a4e5f52f865a9602c51cf915c5b96b4e03e66a96bc9d19773c9fed1ec7d7452dfa8cc52a310ae3cb4ae816ec1beaa50e14037e3c67a46cb0f00686555cee01bc0b70bcb1b3816aeef0dfcc674ca145557876ae54a876a8d6aa8fdcbd6b516f5b43e6a59394725e2f8688818a5e223c91247494de07939d96d9cf0f08aeef410687d98ff00264294bfd85a7f024c4a06b70d12eaea17d5aa35d21b6d64da466235836a2bc971575342f690dafb3f99c31d30f254aafccd073c4df77d2034f350597c8d5471613290cd7b3280d2cd268200b654a0c2895b745c1c33e0310560db52368bb09c41cea94a1e269969c6460b2fd4b6302d029a84c7f246b6eac7dc616d40a768892164ba8fa10c83b9522b933e80f9e41b9995c4513ceaad6aa016f2d1c087a9f88678df131666ceebf53d4952360f0f2587ee05bc2e22524c4ab81d485185d4de43606c953032a105eb67420b72a5db579022556d9f328c02e08c3c26afbeb2a2f3e1514ccd57c09ab2d070b6ebcd2e6d1816ba48f29df1407844614ab1419697b210ac62e51dbf60c41112c656dcd74b1ddb6a8a20bd93d83d9551e1095a74bfaf21a4181dff00f81da94b2dcb6a1d0aac05e55f08585d05cfc201b340e155e744c0daccbd7f5f0c6c82b135adf250da50fc823b77539add8adeec7635d2b5ab952764a688470e01a6e230d6e13f38605e09a481b4654a4282374bc05b37f503d4fb75038faafa20930ba5c94746f905fc58d31c3891017716b9bf2c87990946c53d73d525482aab521fe3a959a156f45331e0ba58d6bbedbb1b596b4b4d36eaf89795c33d3b2d0714a290fc1129b3455559cd546089e4e658831792e4d6aae236b402f799f493203cd5538bb883bde9cb6f0c2c7af92b5edca5de058aa53570254bc019b0e572562816b9add64dc97cbbf39fd82b6e053e4751ae88623bca5dada0b56979760c40bc79b2ecff0064169daedfcd91ea425f0b2daf539551ccbaaaa5fbdfeecb105c37e0fec541b0eff9ff002cbec2251c97c214363f4c1b234ca9e0ab388a96cb99a466cc004c8cb92c47917d44e61a2d4b59794c09c3006e92cb0862c7608b8bfb80b0163c0bb06281e41c990c0de14ff30b8399bed06421877fdee563917824b69dd7507b2fa317ea982eeab9233ac2a3a006b165ca742c1108eca8f504e04d9bc41e32585611c8bf10d0dae5ef8b1681b71106d1161c73772c788f718acf9462de435096ad8792ec3f2e132ac14d01f045b22839029b62906e47fa1b0f4a95be02dbdc38aefbe040560ae8c5458f06fa09616dfa3862bb5bacf2bcacbeda0aad573cc5b5295c52bfd10cf137100f27e0e983a72f594276c4b9a8483028ff00e1592bb072425f95f658583c62aeae351c4bbe2553e16aace5ff00f065cdf9038555302f6c34fdee8d4945fef04ab6d3c1e12b58d946e56f7e2e57ed1f25cbd0f961d3b55e5c1cad97d963d9fc9618a5abfdbd65517be32ce7cc345165ba56c084d01a14fd1a41a0fea2d79e261749579d3e7ea6193ad2f952b688cb4ee17d2d7d5e90bcbae98d9b9b346b2d99fbf25b0842aeae0c7fbc29aabd9ffc47d87eb190d8a7f6ec4612ad4d2bcdefe595f9b7ad0a08eda9dd7e2ed84aa94e1e7c5731ab520a149a14d03b08b70041966a9c10d2a6cd1cd5743b60f5afae92e8b534afe7be92a287053c94e9b84b67646eea4afef2d459c8db870892c316aab3ca77136bb58c1d149e79446d51d78778283ac94abdef4737cbe2e59760aeafde56d288993f9525b6d1dd059de17c46e92d7cac7889a01a282b61d5cae2f2ccacfaea3a1c70effeb13e01497fc787e202aa36deacfbbc315dc1e5149f63c4af3008513528355f025463f40250611ee4a95512dfe23062f86ea9eb5cc38fb84f2232f0f318afe7f4c60d128cbbaef9185d5995c32fcd23c114b1f1bbb4c5e0afa8d3d3b5b6bfd5c1343a92a8b01b350221b0dc47b15c712caab1747465095684cd4c6031e3ecea520ff2189e91acea20d3c046d5a0d1ead94b8b416d816c064afb1b1f3a4d56ed82055d6403305dca2c1f592ad1a39706b5af86516bf70850bfd75168db29570e2f01295340a2b0e50afed82ad13897b40187772d8ecfd0f094b5195c678c4aa472bcb17b93743cb0b4986bff00d2b843c4b94220dd5bd3d86c6057ff0082f1510c7bf25fa41f4c0c1402f6ae1957e8614eb7f72c298efe5832850149dac0adcab9874e4572e12956d075c096b2b85a9645b4b68a1403779968d207b7f03989b6c6eab2afe65422856de30ee29c2cbe1be6e7196c5a3bdcfcda2771853a0e7859f27704e210f3673f4f716f0aec3e6256c0d05395a50bcb05dd7fac4a9b6998affe76cbfe414aa13be3658efe2b9a32daf40baae7c21dd9d3a16daf4821aa444f20ba2cae5829fd6bf4c11fb0812e803abcd5addb28af01dad379d8f3f80f8654f15c0a11bc8d0195e16bcd9e103694ba77689852eae9d0fc5e4555ea08ed3c3c351c19dd1d6129f22fb0709b2cf306860715f81055b9e5ff00804c8e4af012c9f0cb842bd096b7fcb28e072405abb2f2e285857ee9f9eac85c5b5c0fc7e3fc40d9b9412bc628e00f814916decca20fe465dafabff284d3ab9557f6cbec86e1e041e209baae1bca46a8e8caaebb8a2bc2a5347d9a41e07105bcff0074ca15699794cc342aa1d5424a7071d12ad53f4a4140fbacff00528a20f107fdc140e3460731e6610877f107e5c5b0f9373a223f0994a3f50399e9c4e6a6ea73f700616236479ef6dee24536772e2dfcf11ae8c790276e3bbc168d1b01be8806b8bfe09608643d285c6568d95110babd413a76f9859847d08a02e9761ec0aeea3ab84ba2f0215ec780e07f98aaa9ea1c5cf3387db185aa540f2c4bb2ac17a4471a10ee20ddff00fa6eb56179aba4b5d73d5e6af6ea00ab00857059d24a7a4d8116b6415aea9f95f8239cd0ad5bafe089a6b1f798758f1ad16fed81541459ea8fcf04a67255dadbe0e229caade5439510b71bb72eda250db6562764bc62c39bad52aee6c1ef0d6fdb1696a15e0723a15614c697eefa57d93155f42dbb5c75f08d71b5be3b3cb0736fbd3fdeae5c290b4ba5bec42a03bbd1ff000455a0040e0e6275529dbaa89651ced618ddfd6c414646d9eae38c3a4b9c6ec183d51752b21477c01d0059d7ac6050fad5e9e46a85e5c3f339846ad2f070ce7ee5a143766750fb651695332d55b4ecd0a1e2cbabde50db8ad41a380a3347ee23c11aecd59592bd8b40e36854aa28f272ff008261b697dd5c27675e05b3f501af6280d3ecb8a8d17f4427cac7cebe66a9ee329fb2133420be1b94bda0074c736829ee58dba55c75d71cd7f69b36e9afdb112c3af57a8d56d73c03e2367da868fbe44562f9b12e8b72c8f870b4fc482e94e0aaa1836766e1a1b29381660203d6c4f427cac50e0df1c7044dfd92c578c12554071874ae24a7789d0d0dc74ae970658d91f02e1eef6d52e21279ada7f441e4b947a7b8b6b0216fe1e54bc20116ac65d55711141545ba36d3e6a2fe38b5cbb445b0367901e069772848bda000176711716fdca3bc6ad8835a4530af58d2dc8e9859386b18c65d47752550b70ef082d87ff90b684ef4fb2aaaa1adbe42d5771d1554c2ca118c0d5975853f98f80196ef42e0d4b1b280d32963f739b4d58b541cb51fed8e5a0fe2e7ae0b7c03c5c05a2cc726eafe9e25ae63aea7328e3db117e5de5daf75fdc48bf009cf7bc4d5b4a678df257acea5d815b75900a390b4ed3f9b943dbe3aaf7866c1b57d429514e406abe1c41a92ab6b295a4322d61ec3e1531a425f4fc89614b5d0b859a05bafd74c63dc414e8ac6a5b2b8f59fd991f2cf6601efc4dd175d1af91e1986eab4d5b7799f30f2ee5f471a5114ba7c5d1de9d2546140d5ea8ea05f63b7069d4a1b0396058aa6c9dad6fb6efcfc4735784d7274d25565bcfe5852f1140743cb650aca536de12f9dd25ec7dba7d1c8d962b56e7fc23488ff009f8213c2cde0d8f8948d7b5ecfeee23c1fbc6667e751b85d93bd4398f6d937ca8a4ba1fc0d86b994ab4378c7b98ea5af1105ca112de8b0fbb84e78b437f61709404b7ddfb365cf4a543aaf2acbbdce2de208b55da0039ae499961eb8ca52ca219a29638eb6120f8836563a12b712a1b1662a49e8a2983ded405c557dc313d5c1aee5ed884579bb9a278298cd9a6dd6d6588412aa6c43462aa967ccd0f8e613d3c4f3000009c13e32881ccc77f954de770830c6543656d64af982a0c45c4bb5ae2066e9b7ee22615403135002bf9ea5099403d022934bfddc4c98abb805b2fe624489185468434810204386894fb716b195b9487011ff00ef613d6bccee0d54d774237041c073b77ea51775ced1cbf6ca5816fc337e560f7161526b625b7f965cfb679e9382ab7df20ce05b5b6ed50ab89814665761f112dd155bfe04b80af90d1c96684a4709db15cc102f904bb792d4d0ae847cf7f5169a11bcbd1f3fbc0229d74b6b9617923782cb615f21cb037ef35b0edd44ce8bf35873b081192b2e22e44ea82f0b0e8b02a0e281e6424a28bbfc40eb4f5aa023ebd461c501fec87cd88963a3b10e2faa953adb49f1b1850a452721b70279962e22b9e0d60ad5a75c4f57cc6ca021161c9fb4ee65d0f52dbd9718ad33a3cfc4085a2b705b738aad828ab8c8e5a4aae3c9f6ff001300a3e16be760e47ff3a089aad2c20723fc4d163ca90a7ab3d815571ec7807d31c639196d396231b05c30d60d640fabd976d7a0b307741015ae782ba85a885aa09e013558ccda0ba2cd2aea19768f215610564e3c305652a53d4a314c5a7e0f9627ee50d61583831b2ad7ac11dc0853977ac740e3a23824ada956a4f9c88843da642bfd028ed074a6c77c0814390ab963176cc625d0e635686acedf3896c5f3048190ecd86c88bea690f72b1b03c5c06b2571fda7572c44fb2598b2a31047ab180004c7065a52eea425229d09c25a9805d0e4c24141a05ed4a47c9fce5ed5dbdf84186c8618250efde72bf30f87057d112aea93e6c00b0f6584a6a67c8265ff00315d7bf9808fe5a203872dc7a571af7731ccdff4bfd0a480e154015702ba622aec67047ffa816d9e85c6977b04767e02b8a765aab874e4c53fe1fe597faeb33f047be6fb6eff006ca0e4afe3feca6a390b6e0e288161a6c50ff60d96b1eb689e7ed99750d37bfb85ccbfd44154d1fc3fd5406ecaf35917a83be12028eef85f0621488268e1c5697096d7e81db4d7b282a2ff00591d51149e9b86fa30811c6a9d1d41703a3e9c57e61536a0452a3ecb3c9eed2fff006448d157565e8e600029d6827de5cb470e9f3443bbe6572a136cd3e0888a177195ba47592f73c81400dd3597cc7cc3656b6f92fae654b5a2c6b50ad4b2a4b0a6ff00b542bad0af2a4e167515a6dc9f15070283e86ae20e16adfc0d5dfcca1d83af43b942b0e86e9fd1c40345685a3a83db4a70d5bf8236a6badecb7fafe8343a1c273c8fc9d4ec074ba7f0b1aad94144ea47ae9415a55bce6c5494be22ed6ff047655f1fbfb402af25ca4636bf0e2e5255ecab70b4f25e2fb5121da22a9843d29becd506d0a407111f743adf9b86641f3712cb5f3a942b623fbb1880fddc402b9788ea94c42d2e65313660e2e153d96bf11cb6589cfaa8150fe45fe1880b36abb33e21629bd73c3e4eb232db41e60e17144a548bdc61fa09d38b2c7bfe8924813aae01e254a1c0ddca5cf97d0f624851adc4b83014f327b99ac7c9aed5cd3595327e930e177ccdebf820dadb61121ca806847d1a607063a55274571f959938e67dec1751082e2716462b303fd0189123703714ef2e430115f88ae593801ffc443aecf4c1842703dea7006cce3bced8acbe17f89f4734eff7a8d28ade8adfc1d4e1b17f1f7eb3d179e177f16c1de778d2fb739a052f7fd1286d70ef32f4ff0033cc8e31f995b66f2d273129c7843e45a5b5c46a34b741d1b56ff683d3385761738d943577d9faa7c8f459de3c57f166aee52848eadcef200402c56284b1654a602af276b53e1e586d4a576def096c39345748ed5f25ebd6230afdc64f8836b74be5e2fb801aed1ae961a282ae77f69ca83296aebf2b286e89ef430d86071e811df9b50795745f894720a295a67110156b1f1c55fd32f1940fc05c684bba504774f65862f4a82b52dc2f6aa820a1682ba0ab1352ad030fdda88ba36e5a7c744ca15c7f10c19627e5839e567f406186715116698e5f4565cd2bc78b0b4e2cbef44420f20490160e4e553c97c9c5b637eb1fda17dbd8c087b22e5d3505aea3f5354a59fcca06c8abca2288e32ecd203f31a31d8ced9d4f426e5fd93b260e4e6ef136215cbfd1e5dbf602232a1b1db7919730e386de38b8c5471f7bcf649b9ac68bcf1f601296e0ed33595d8c74a2704ef7c59c8c22eb9a9a942af7904965e30212b38a8acb62d7a7d17337561004415fbbb5e99013c86cc4b795c1672b1be8b98a62147344bcf815f69789451fad307ea10e2b4ad824bc60f980aa21bcade6707e17f71f84bbda5c221e8c7d4cc8c6df966c1145aafcb380b92aae2e1b1f70462f8630c30c57f4fcff004b817291005ade25052265049606a2ecc476df9f530e4781810bce1cd165f85c07f05bb8357f0da084803e8a3f1038376df3fea67a517e10a543c0d1ebd8ea953e51ec55b779ecde7e61b306e88fd710da5aa8d6c1c12e9962a9a829425f6300aa2704c6e151d316f7654ea9d988efa2beca40e6e1d73aa9dfd551e128a010b0c3eef21bdd152870cbc34f88c091cb4e6d7a218077daeedf44ac1a9028af03fc4572db368ce03a1076264e02abe317f11a1fe0f0aea545d30c0e0ead8802fecb51bdc59a57e215fa4e1caa5e01f47c449c2fd362e20e00cb015baeff00c5c5e5481b6f8e6bdf62fc8dd216c1c0fc40e542f1d40bfc1b822a892f6cb4012dea36b070f81004aeeeed80a2cac2b252a684656a4edc8857c0e25201eff7080465a777c04cf2c61636f3ff0099b4976ffea97ec006f80d220019280ed4b3519182e15fb678f856b00cc055079d0980bfcaff006c59eb7c2aaad22dfab03047565ff8a68354defa6c472c0b70b43eed72f4715c03d0b2140e378f20e36c0771b7118abbc8941e5434230b1b25bc4f9a7ab0b98c2e8d1b637d32b5790d1f8365b7b129dfc427b6805f230c11e86171e62344dd4541bac882ba4b7d1a84a3069cc29e192152e014b87674407a99be7b0b2ac134a5594c6e0a611ba4236045010e222857e388857c01fbf23eebb575d09f925b297ff92238ad5a458aa05a966a1b016436705a303e40039c1f6cb28a4b6a701dabfcc6a2dd1339c8abf70b430398c82ce57e250468231ea938c1f781d2f98a411fc90ab13ee50f71a57f430c5e05bc15052d0d1f96745fdce14a6f6feea2c0d2c1021f32c42cef340217d8f5d13b5e7ebfdb369acbf30fdc7e0cc355fcb14a8a769c8b0a4fce9cce4a1f96dcdfa46b824f4fb0a1ca9c2a875c3157434f934877411b1c16d7dc541bbf4970bbb7d0a7ecb69a85c8760af071887971d609706b9fccb0b146ef402546836eba1457184c9174958ca7d610349744ab6ebbb82b246ae57db034ee97ba2da5a56ea0c1282c5461bd398a508114df73e5f22120de38135e5f2b294a0b5dff00d88dece42c595f09c0c6eab95479381740abec2f28870940702b46b0f2341b6dea5a0382d570d5d1fe25f52b014a797b842619888aa708ac6955a4ed73df3513b161cb807843d0906eefe2106e92dad657ac1444469e5ddb5425b4d393af72ae3014f9862fc32dd7e3fdc2d55f883cf3fc4b29b4d714227510805e1e896c0614ddd21bf8462a2e1aac2f9bc1c418400000c060046bdf7febf89403f19fd8ff002c3aa13328de8c3559bfb617fbedde7b3fc7f8e89cdc18dbabd63ac32c83e3ee22cfcffeef25b36628a7eec21d90e292a1b12facfa89e7fa059ce478ac173045b08000e38fb88053963bcb50b68e2f89a7907f486ed51ac9b857592ca517bb50d155b27cdd84b1074dd43adcb14a9c1ac6713eb11656d1210c64357342d8df9452c94d69c33162b339210807c4e4a94fdc06316ebe3a949617d1612a29f8fea49a0ce201169900e88f4ce54c0de2d7c2ca1bad7d72c1181f04a811697bec8b05a5e32d4cc0470f0163e2aa35f960b3501f32b5e9e3f51a730a2b1758d46b76bad4ad20d38eb34feb4398196b4789345d8560f8cac410e9ab5e1ef107335d4d388de6ac9f1c40007076dbfccb2b9cfacffb2c42cfdeff0012d5ed80e59941ecd6c0be42d0fd133e12682c3b5115a5f462b3b8d97a9a2a5c702ace1e0ff92b556ab1b2727915aebd8ba1f9e3ed95a95803c0181e637181d1d34e7e4f0206691fa2c6f39194f0d71580fa4cca82d84b4e0aebe512e887b5dd59884a15bd6dbcfb72816ce02ea8e1f90855d751a51197c9c95ff1292bda4891297a647edc03a42f855efb617890d53bcd51e6151234ef0a6bf4440a56f9d7ff00c23d522d58b7e884bb77e34b9a8280f005aef675139038c7181c24f94ab6abb797be93529672b6ae5c388d18d69a001aff000ce09605a96fee6816c72dfca12c084033b27c47f26f3e0efc9717ce95d111020297a7c12f444ad536f7f17c4c4b0fa6ad2f4f5963b6eed7be22d1b2fdfbf088393bdf97c2103ab7bfa62960793819d2e9f32ee7d2a9fe1c7f883feebff315c40a2dacbf568fdc69076e86815c1a238502a8de6e0955d4c656667f6025f5dff9ff00902b6d7c3d2c04eb4b51af15dc53de9c6f54adb32a3136980da9929a6eafcc2f03976475d63c29993b78c618223ea152a353c7f982967e2e7eccb384bdf7ea8cb7ca0b50645eed34e1aebee7ff00c04c421f37711b4fb300a0cf655a4b57982f117b2aa276d604fcace089b8fb2871f4a83cb624ae77a255d556a398e371c5c28f1f9c1872376849b479db29472ca01934a526fcdb41f0a68646107d11851575f70f1ea88683b77bf214688587d255a53ee617ce2b068fce5c7f70e1e8e30eb9658ff40a94ae7fdd8512b714236e0f2704507846b3a85d94a4ab2002b2b6f1bf46a208a566fb6e515ab80a92eae62a62c18a8d939eccfa475674461a5f336b5b95b419472b2b5d23720ba4695c2d836d000fd731cf66f9fe5fd4dbc7ee9ff30babfe4ff6f3081688a4ab96bfbce1ab83c2b8ebc41dc2595baee5ebecc8631fb0780d8bc787c5f24144b2050d251f51143c05ab512ca57e3ffe9f5191e05de047807e204de9197d548107c657b2a857d3bfec1e460dd68a1720438c297791f5af53babaf3c8ca2d1a6ebb3fb712b3950e6967e21295f954b77e3d8b6b41f20f82d8d97632d8e24703f534082a8b55165559af96abebe09995a39f0ffc212201acb05d7812f5a889d59590a23a5b5342a1687aff0098094c39d221c54e48e16bc21bee71880f0dad2cdfed1132e14bbb6fa36aea189b62ad86ebce4e762bd0b7e573d65efa7a0dafdbc4152962ec1a1fb7365506c4f7a94505ff000f8e7a8e1e316bcffb02a9eb7baf3e085397fc7e0f09aa01515653c15283338b254515cfede59f6cf13715eff2b1774793023079f765cfc7c542b8a3cae746ee280da57141fde1f13f041557ff007e087b1df7d63c5719faff00b0dba7617aea0a03bcce582ed8a7aaf28866aa78a2add6a10ac0ab59a447c1549f77dc75a50bec942b746aaff97b828dd72b047d9b06ecbf905cac944101ec517edb5a9d41ca94ca394ece6b9c3f3ec1f16ff419960692be6764bfd9df72e05d36133d507cf08aaf966d55aad8eb25815ca7f8e7fa0b40c117716260b79320779fe8d6f0e0ff002c15c73cc5e20d81a414c623fa96913851adace7252b97c73a95569574f3364197f50318b5d0382e0ee52cc4243540f7db0e54b9647c406ef36c04bbe58dc285c2505d04956d84211d7820c1c8ec10c28d9258b35ff0c11f8cd8ed18b374b374a5dfd08fc67c538cad767d2ed7ca826daaf2560b7f11c714ca5a533585cd28972a5bd03ff7ed9f7ee0eff10f5cf3bac5bf97e77f49400838165fd1032b51b40eda6006f5002a1cafe795e7fb957b4f65fcb7dc7579147144562dd5e98873fa8076ca383f84f19865beeeef92ea062e1fc89fa76a0e5f22fd4a55077b6f032de7f10c08b52ff5cfefa22b373c32570db08a0fccb77f71fb1e70958066e2bbaf9ce48167c14261c06b08d415453807f54c37ee7358fbf08581abcffc2ba21de012d6d640fc91a25a0ac3812ed60d7a062764c5595c14014762b92252065d2afcd95000754705170fe19714e45e38fcb034015bd92ea9dab45ab08945abba18940a2275c57e0f635f462b2bdcaff135f99e4aa97862e265a60b9af7029115fefa8aa9b81d15b5fef44200a4bbf07c40df8e6dff00dcb1c2b3c4ff001197985918ca3aff00170e46d103e5aa3fdb1f4272b38cff00510bb38b95e1ae25704fc2d7f04cdb0e20839c6708b2cafc67d6a152efdd096f052de7d1e4ed1e08b428e50a4d4d6bdd42bc57d8409510750d11e118dffd9a9c4078fa47c8491839b0c5cb0d82d4e0b2a3d65b65cd053eef89651511ebc5a6c532ec12e7cad596283f3e43d1232b3001427f468dd2c65d2488a9aeb01000adc80ce0dc54014a5fe6180ea8fccdedad68ce8e3e02d772aaa9f9c4e5ea39926dc3c623fabb380def94986688d0e32f348545fcc9500d22d41e9ddfa3fa714cb6a0b970b095e517e13796c6374bf44c251c10c29cff00b98fc65d3527d1f4405aa5525ba48b9737fc4e1238fe97fd2d6f7eff00eb3e0feb0fdc2fe8fe0875acde30ff00b2d37eca71fb6741afb2d9bd8ca78a3fbc0ada0de76289c4ba7011cdff006090766b7a6df10094d36f6b1eff00700119f1b3ba5f3ec1a7479392b8e29ea7a1d6a1fccda3da3cfaa371e20aa52d525a3cacf3c86a387e66ad480cbc7940ca99799545e5974d8c387e25dca572c7a2720543d21c7e2bc8565800a74b471bf50d806f65e9ee77017568f18b7c07446a7d039e8afaea12cac5d81bb93f2715450ce58b782a71fc32dec945c1d51a880ba46bfd67ccbcba71d5aca3b58fa5bd612f8b0df1be63266e3b21f070fd425e2b68bdefa3881475bbdb6d86aa2bec2eedfccb659804a75097e6347f3bff00bd857827398fcbfde0d5b7f97fbc5c1c75515bd4206bb67d57095f8df6bc88d390a796e5fe26344020b685ff00351a960fa3fc432a680e8a84afe062a9586345102bf52802f0a7f818c4ace589db8166d07491656486d3af2e7562df570a2db5fa227e3ed60ab60e580a763ec67b765a3581fb253155f0f4c0691fd31e86094b2a990f8ed099c2b5c06de21f3c3a8c54179201d3e656977c66c4a952ef1cd7b066428f898dc0aed4ae4b452f6a0a8e3555113112a0f40f634b7c153b6113798081871032dad88cede1e1298cdc656238b9d0bcd78d45107f860e4370ff000c439591456b809a72b811d11fea831a0c7d2e18eeaf8cb897631c7a7c86b0e788071c864a938353bd09ae5d1f44df5c22da8dac82f52ea5fb06df97e2ff0089434adfdb1d7e7f70e0196af75fa8b757de16dcdf17c787027295a7b51d5831e6154e9bef042c2a5a2d4da4db306a9f7fefb01aef9ae325863f05727ddf138f02b3ebac4f2a1a7143bd0da22baf0d36a8d2be7dc0826d55babe9bf32f565519bc7e3d656cbe4a3fc7089c2b71e82170e3e6286d2fb700d97b7d1f5f52d657d0a4609cbf046f80d1b56afc0fed3a62a99ea7f8234bbde7cbe082ca29693fb8c03254595f92897b87c6d1cc2d32da38e3f0b8d2343b72d4a546ab48aded8cc88e28366ad97afac9cbd68dfec1795a4300a4b0f16a9b3a3fb4a56f9b2be3ae7e227c83a2be2dfdf88db4a50f7576e703d12f4014e0d0f882b4dc235b0c1af7139b9c8d40ac36f3e273c53fe6bfc11e0af947fcce604f7fde0afa9d04eff996d00da91e9ff7290c85ade3f07e21c2567445a01a73c36fcb2a0ca6e0c8a89f6119e685fcbd4738c0bc0b54bd844d2eaba6a06a9d261f19706165975654fa25a9d3da22f2ddb3d56295b2cbe1d12e0b55ea14b2a556978c099e8c01a17be96ee8ddfc554bac36faf315fc612c33285fb17ac8d5fe154bcec38f576d24e25c0eff00f842e95ebc9fbb2e7c63ebfe4196c19be016b61a0f9b55f10535569f9f25875d44cf75572692df11828df31254004e3513afb9c90c11b81752d2362291691a929daf6a8aba80fdc2de0a522f52b5f471285f26bfd008a9a9e7d081e8b715cd936fac2aac23a90615dca1b5f4cb8c58e91fdc30d660c3087832dadaaa1801165752ff00f0430db08b514dc2f35083dd59aa854e66308b7d7fa2c7fa703b9fafe604be6afe88365f5fa33b879d7ea1755c3e508945b682f1efcb298a176af51deca1f846f2cb6b8aab7c3eecbf8207e4a7fb416d6c95611aafb96b0405e315797df51ab88f755d5155fc4e252f9ec79f3ea3d8069d1ac88f195c818b3d60a22ab5afbeb1b58fe6afd607170014166d63e6fd86aefc1b0f6d6dcb0246c6be05cc5d87adb4ad963470f2c89f80dbd688fc25a539fcfcc66855d8377f6ca52eae8abfbe8ff2ce1a007e8ff6c3609072b238e8972a9e7fc08e8abfee557e99e0d9a076efb6060b2851c9e393ea3d868ddd1b5dd87bd8ce66c0ae55c9afb7c85a04e2330bbd25270d79b066ab1a115adeacb0af65b4b3c70a9e642d70f89400ba2eeb3ee181efbe5ff981f957fe2e719f8ff84b1abd17f6f9f44a5b4e4f3ff10e16b1a828bba7e6ae1ffaf082920ff35f7f70c1fdfe226e2fcd5fb2a500518129003c0e1fc45e458b21e020888b8b53f58f1aaf6c533891628348dd4ba52cb4baaf187c8bb8822f5ae9b3920082db7a4243b1e0feeb8045b65a7262097758dbf9b4c86ae68ada035aa9bdb9660b727f06f352e4a26a54f480ea9b42a14dfc4006263ada51a738b77751a165cedb94c07b888e4f9dcd2e24de6e1093429e09b573d8430b15473c430589c48b037c3a4d02e21c22fe34c2f68178711e6d40fc310975fe8750304b97a85529b51ae9f713e4a331dfda29505200ff001a99364d186a5a91bed9c72177b0b8166be421d2ef918186d179f7f30da17e25af24ded6e283cfed4b0f6a2a3d455821623fd3ae28a3ed8a75e09f0643eaf7e58e10a00950b8200256ec340ddfed9dfe3ed8f36f3f3b085f40bb44cc6a02297f26e1149a23609f39d7c32c5adae1aa1bf731e2b77abe602f87956a57f79c0e57aec4c6297ced0a595cdead9857a69c6b9a815ab0aabe10de66f9c7ca1e79e4c737c0491037e066aeadcb6c43e1e4c0162db9ca15e51f2bf0b556c3a3544b538d5c732ad57dbb66ea9a5aecac972966cfe437d66f5005f4ae8516ce99d78fff009154b5d22c7f11e1cb55944f7e6271d6fa3c9e1d11d568b5fbfed6639d7bcc9c589bdd536d3a57fec5dee3e04f6a0d55ba1c0bdd974448399fab2e3cf29cee871734d716d5f45b6e260baac971e62b633e3fc71102e11ef97a7bf7f13d1139f8fb60517c2eeff766e387fb1efdc6b8e3ff0071f2cd8d73c675f044f20d06cab32eef89bcd94165f1f7289800b5f7dfb8c020de8f37eb395ad7bf044725e56802294d0c25ab3e2441702c32f30d50ba0f672de36f44a4c1fa9069e156b47f741516dbe96e4ad4a0f08ae5f04005a52d9585bcf796333fe95abcae5999851cff0041cc7d374bc135d5c0eaa3474afd4450f0daf87dc039271e857ea0bab73e5834bafcd44a20b5bfd22f95c47224db555c5022917ee241f17f244aa55192b12ef90c9536b9476ff4257a3d5fe022ac5e860d2c2d6334655dc9530c73093cc6781382b4c0259d64bc9c1065d2560829e5eb02e676dc2f2e9065ba8de5b8bd25bbfae1943552b2b9bc32e05bc7e5708e1390ed7b0dc37032ef87600d2fe125d863ecb1ebe19c0d191cc745b115917cc69d6962ad80817cd18078b1273d880e092cb830fbb03dd5d8ca7f5aa21f698228c9c5177fa82d0e88962155ec26d398fe096dabaf0c233fce61fb8536155f184b74b7718a5dead640aa736c969f26c40e14a0b5f0f3c259d551eca1a00fdcc29d1bfb49e0729456e0c07c1b477e9d82e80238b1ff001184af00fc408bd01b46544051ad8873f32dcee62f9af821c911bb1cd37b47f9620552dea0da3dc53b4550e26d73012e943838dfbfb788480685e68ff2bbe210700f5c3f8f88346d3fb7feadfd408e8f7fdc9a898d709959df92cad38e76ace2146dcfedf9e92cb581ef9fc0ee61bbaa5fafe4976e09cf56dd129450de396e75f30bec2ad261f10d05da7e287f984b51714ab31bcc465ca958d9547411941c83cb62c275efb769351b70700faa6c82055fe7d344b8a432d347e1982643e1fa88b1502ce3075dcdd61de617b96a3ce42fa876e5e4ff0070f0de75edf638fe7feb1d2a9fa870714bf443b10955453f32a1014695d135dbec72364969ceee105100fa8ec4802c0274f736127a5c968cc6acb789bb4e2fc25452b5bc57aca985f765bb0ef587d2d88bd235dd0955eca12d46cb1d1657d04e13f24cba3823a22b6904eb9baf4c15121c2dbb2f1871118912cfada8996af33422f98d6e1c9f3e2f89632f73a1fda210e77c51a6022b5c20b3e100b905c6a22ea9487fec893525a75e7185490afb3ee59377b28096127cd97ecbb99aabd7d852db8191f7e2aa98437bfc4246731f334e195306eb39888b7a8984b057f10fbcb5c6e500c6247d9dd468082b5c86176af4483408c7334a512beca57a134af20ced04b287c112f518b1cbf111de410239fd0c2626ac6713731bf8e788b5c4057a62a9037c8a4037fcc5b48f4c1c2177b01c44fe9828677c43e4a05cb9a590bb44aee016a9fe99df3fb6e20bc7edb81b6ffb66d835beeb9f1396fd1ca228361cf0e7e255c90a0024226e7d82dce283c27b58fbaf4c97b793570cda4fd8ff00d95bcc3bd60db47cb7c3126342f0e75100dfe52b3f5f505b8a0caf3e195461cf34f1f994d13fed7c784a5fc3be4e95180168d7f70c6d3450bec78d85d51fc3fee1b6ff00403af5944aa7daff0010b60fec5fe65c859bac5c46adc1e8cfd406e55f22e071bf5124ab8671af5dc6c754a657617296bf5cbdc7e0845d055c202ce4bcf61487182d6b12adb5742ed73c1322e2d52f9679509d0b4302efd60e6e6810f8a36518fb2587a50c6136e5135295a072ad63530be4d41469eeb20b88bab888fafc6432c6d1a2fecc2aa0a45e362ce0f9901a54008eeb821bf97f72dfbdfdbfe894e7feb2bafc7fc94377bfcf30f6a2358afd2a8271c600ab7bf5d9d14a8d9e8c2e8097fe84f27e460776d8725bd0f3c8c8baab897c95616eca39bb16928e4d56cabc42b45556281144709c72bbf89b5805a0159eacbcd0b4da45b42bb83915ad2134304dd0a7a026ca8be2fbf2b33aa5d72812ae84c5d62ff7a8ddba9c70841aec4756625b45c5b872e1d67094e0d51f56ff0088e309f49849967c6a6c6e14614376380dac200158fd90530202ab948d5fae40f85521928e9b2c88dc3c81a9331749bd6f6c4b07c14d58bd0fcf71a1ba36005092c516f61b08a21edfa02214756c28c8508b6c68c3460dce889fe8b497ebe70810d5107e2110394d603073a1543c0c2154a32fa88ea52538cc69b529055e6c2f8be3b1f2022e5251851f980d504f49cda1f705fb1ca4e449fdbe706727c73e10dbf3f4417068f3584d0a5b7e61f9618d9d797fcb010a514eb5102a85dea8aad21b450a956da72e38efc946ed7bf2e775155081d2ee70c5b965e7c79b345cc8fe5b188f618d158ce9dfa9e6ca6b33feca20a83841383427e8ce11bd66fec622e9e84e091343da1c7e121560874d85eca1c12c4aa27403f99b4b7d327102fbf70d379ff972e50af28e5be01cce1dbdba5afaf47cc3d122952507a97a9408f0b22bdbf31afa4c2e566c51e8e0d8d7015fb53817cb97fda7f888c6b9ad07cdaa2eec92ab4be3b1856932848ff6e8dae5a61e40282702a8bd6a3b8616429d9c28325c46c1ef5796d2c2c2b44aa25535bf079f73f01f3cff00b28ff07fafb941f8ff00d5f2c6adb78c61bef8ff00d90f7a955080e300d97aadaa0f8c288b2d51a268c2ca454008f4728b95df12f0dd787811acb154dbfa577e469f74a48704aeaa3a83ce00b3b7ce4095f06b5650e1c8958fdac25a56959761fa8f553cdffe5852e87cad3fb10be75f3b7fb60f968be803f5702fdabe76d1aad28aebfe4696a717cf8fb88e01f1c15c9ac583aae09f398359cb2b9b3c7c3d9516ba23732b708a33233d2388a8b6e74972b7b9b4ad02927832c9e5c0c2e61ab34b4c0f27335546309a9ca450cdd9cad4af76aa436d4c93270a1d0a24340efe96c4a2a3c4cddf4ba253c6d1a03e6321f5d8b7d8682e9e28a9b30664a81d78233b6dcd1156f0250695095570400d8a7a533ed847baa9be4747dc2ad4417f6c1d9598e544bb7c25760c4ac284409031fb8aab844685c03b4365d41dd1f75afed80af2afed9c3a6fed9a3e7e75fd4735acc2dff04b79386efaaea6bab6ceb08f2d3f39d8bb67196fdbc88bb4afcb7373b8ff001fef2cea34eecf489aebc70934a9c4deb30be65d4fed25a5dba7aad7807df72a462ef92915f6d97888f21b99607ab0480d7a172da94f1fed47c41496d01381f28c53d158bcf840b4bd8aa3f8ea7c5169a5b4a1730d781faff4608167f150d57c102df65ee396414dc1fe289788c135afd58df5c47455953686ed2b00b082f46f5cb1ba0cbe77e3b62e8bce5ffb0b6118b21f6a1c1128eff2f018197f3ea7928ef5a246834077133d12f3b37b0000a0280e025d112081e98162b6b29f9bfd7c7105d05bcb5454fb61bbd7cb3e78ff00042b2b333aa3d600c1d65f9eb0780eb8bfeecbd33ea1f043d3fe7efc3fa07c4c0addfdb2b67ec78b8db79d581a0559ea11b90ed4efecc270daf6095043c2aff0c96052dd0baf97a848b389050ab7bf325bd53ab1ff0090ff00ac4be08bf3b3935f8395fa3b865aada9d13060c3a7fd4e7b8d5b6bfc12baa2bf5739397eeba8c50a37877e18ea5fe6c751beadc6ad397f2cbffadaf5f44ae33b5fe87fd0cfe92f989d8b8944f961a4b57e0c284522804570a3b5aeb060f56b2b7d580a42735c173a40fd93240224b42325e91c22071e4b9a2d2e328d77b16a9749e04ae93822e9557918b4d057f41cc2d9f67c4b9b692f829c59a42022cd402380afe8970d52f88c25e60abd0c2b60cbdbd1fc467089a3e9015989620d5dec212a77f61d9b1c9c42d8697ca72bf9a09373832ee8f6a52d0f1fa2567c3f820a5833bac3f6c076e39a5ff3001063df6a96a5edd3b73e205e45a4179443769dac3b7dcbade08e5d05fdc08dd79e541bf4f2fba83ba1ba93081b0362aaff00eec31b3c36e56b1e6569c4d626ff007f860825ac2f21b65ee52cdd6d6f45efdabf920157508a001d2b64a58b25eb5fc2a6d005f3e8257953a7af9595aabbc5bfb42a6555addbf23ecc86c3b8079e7d953105705ff2cdc561f078fc4586afd3fea621c2b78f3f1080d5d2ff007e2e5d62b17c55705208adcbc3820944bf65dd640baa50061ce6d156f4f001c38907eac943ad6fd9cbceb0a08ec5bc54dee2ac7069fed96a57bbbfdd94bf99beddefdc3e4eeffd94cdaff7fdd95f82bf47c12bddf7fd4d3df9e77dfa26c3fcff0099c1ca2abea1b65957af625f9e4e723de358045cf88a26ca3d9ba0f9c7312d14056c05fbc46a2ffc300ff9f3f443f3b794994dd17f4a8e3cd2d0ba386956ba95f2d5d563ecaec740fd1ff7195de728306fa7c5462c0ef8103c63ca01229f588ded5d0e58e56bc3a12d4dc5b1e18fb508a2bfeb9ac7fa55d5b0ee3aaefea7357e5e4b3a460f500daa190c0d622781e2d8959f225ea357dd56401436818726c43d3ba89d9aedb6b8974dc174900000c2a23c89f681dfd12ba5d9630af85f6cd219752d8522180a0840a9f62663c9a8c44683a23b6f8f8d8689fd1fea0292c976f9d83f6fdc84e5a254bf49b9ccc67cbf101a258814fc0d4ca8e588a82c1471c461fa85d1134fbadd35b7e67e85fca5d36d5fed3e557fe751ea9ebc85bc89db02293fc8ce72ad0170bae0290175ad7309e8e3b59ace838804d6ff0023fc476d1575b19639b45967bcc166b6f4147e7d9c14fe36b7987e82f5f908d0148f54ca077012d65db14a0d839917457bef6cedc2ad977a1f8a23b203145b301080f7b08d0d0f09c7c11a49a079d978e37c4455a02873cf40c6409a2f6fe18188cb15e1fe23441e6afb3fb311c2dfa77fbd4ab5f0fc7fa6207c67d67c8ca2aaa88138bf3b8bfbfee7377b0b60a3652b3e1656083778e59fea52dadf2f2c77f44fc5397e5ff529ded1bf2cf4dddf97c97cdfbbf2c6b6f777e5f229b7befcb0207bd1f9abb7e0a94a85bb0b8fb4956e0bc34a1baf9b3f5039cbac7fd40fcfbf2f91c3798ae280f0a2e8f6214d5f8b43bbeeb4798ed40b137c6d5354c74e48535f4b5e7cdc02757e6ce21e9f4c3a8d3a5fdc5df57f37fe228d7f81fdc818b41daeafaa40db86f996f5658f4222da18a869ace62e5712f445cb72952d70f31503e45642aee5bf12a9c9109ac7eedc2b8dbe60b66c63b5059fb8b889cb83e3fa168d16b96348453002000fccbc0a5b29d860444085f9cbff00087bc4b250a0e5ac042c56bd0c523446a9e7ea5269575fe9f94389fe87300bb978f82228a0fcd056bc044e2d3b8f98325437e5861a3955fca67d24443b109f170cc00895d1904351608f1fd4aa17015c316327a34a012d8b2c48a11cff00b988b7cfe90341fb963617b3962ca61e87a9d779f8255d0e3e3081bc78d796fdcf301fdb5110df36db08c6052dd82317aba62dbbcfa3c2003b2126dcf3c96f928ba56d017fe08970373f4793d0e1d89b3fdd0b37a1b7f94af8fd19fc4a20fb396a0eef914aa789714f2b83f639445c80a14fe4ab9afc0b85a5f7505d1a3838f8116a80f356eab165cd91486ea19cea3538514302806536932b03b5addd132eed5c21c0e88450d364350168bf1105002fe2ad6f5f6622abb555c6a6ae0aefd0353d600d7f4dafb09e4eb9ff00c542bb929baa87c8e6556fc6dc46f87618179029f3750a851fc57fc08d52f22af8b7c7c11eca546885ae05c5a90ba11bdbc36a1d65029feabecd851dfc7fc25577f1f4cade6bafa85fbd57d4524d6bfa551017215b735b45752f505b971d8c4286d42855bf6ca023f1fe595107841161dd9c640d15f1894bd2f8bff7265009022f9406655cce90403be051025b7846bde22689da03166d5f0304077ce098cfaf027c3fa42932b8459510a15b9fd52a6361fd1a82bfa54a984003a17a750fc48a84399f1972065d1c311c657e723e64d97fba452a55fc8953027eaa0a83ba833726d7a57d0382231f2c3ae44433700c33250e7ee46a8e818363e236ae0e259707a0bf495f1a1875f0aa3af68b67392ce2122e794561a7a4a01b166ef8b185345e73a54d8fb7c428837ffc1df56c83081e4ed3d9f6758d4b7773236fe8636e775dd483e3797b4b0b55e6b97ca9605b673cd10dfae57057dce3c29d16fc400851dfa7d475f0ee9564186f6bb2cb3cddecb6fc9e42cde968a4681b8e175a9ca5ebc95a61a1babb8137aedf41eca340361b7e0de201e1bbbe4879761a5005d1550add2473376de62a504d0df3e7f7cb8d0869c3e17ea1aba557c358b54977c038bbd7442dbc35f0f205a720aa2b25c4316a6c145d48ac74b352b3e2342d6d752fccb89a85dd6037f719685245e51d86d04c964d5c9e9b5f264dca650bcbfc46ed5445068db7e438dee1bf8fef30a7e490e13068abf0b57bff0022021d8b8d2736c827905072b8035be76884c502176e7cdff81391ed7f20f7c2095a538337e3f5307b0e5ebe107509ac0b1ad22396de534b1dcd2ea51ae2269ac5b3800accf83d875fc7d7acbfc51df933eab9f89f0c3ab857fe7f6814b6dfbf3120ad6c6db01d316fcb06ca7985717511ef9f6240047f6875390a5368f5e7d439c4723eca1cfea237f962bcb29e8bf6c06ba3ba22df292c8fc15b943c666a6c8f0f68b8ce2c1643b1f0be1985c573eb2a4d8ef766aa3a2359ec8618ea88081c6f5b25065e352bafddcd525388c8d46a875929e04dea6ae7acab86d7d807ca55fd70b0c6b543c2cb96a04e04a65023e58e6caeef23347dbaa1ac49b5285abab847847c63f19d950ab88d83df35e10058ff00697b71870b1c5144085c6ade5159fc988f4d731263eb974da3c32ee4017c12fd0c56b288b45ec549b978a255001a4032b318a0c8dd76bd46e8f2f77042b361823c4b58bc65a7c15ad2e5b84fbb5737ea72a98d2d7eb09c71cfc2db802d4fb2bd854dbfce129b82bc5ebadaec26c82af7665263d3943615a52ace76e1e442acb0d55785e4b271fa7e76cca4d5f155f7cf0c025867a877d46c21741a83f4b37f93d9622c4029cadb5d114d78d09aeedbe4c53c50ca0558e88a54899f2721ef41516cdb77ad71f1330ae57a6087a14bdffc12cac72f90695365452f0c6387825cba39e5be631184eda2f1df061981ed701d6e5a166cd1469bebe4d3829a5ff77ac3058db58d5e5f84320e9dd2cda20b0c2958b38dc1aecab7d4f64956eb7adf2c5e8bb59cdafab117e975f2bcfa8d6f558d7be11047a67c1ff6514a6a3ad0f2c3b3820ac0e562078d3fdca5fb7fccc2f9e77e65fcdff16ffa256ff67fcc03dcff001ec29c7ebc2152f0727c1efdca62bf1e0cb0722a7528cf83d97c0fc2a50a2d3ec007a4e0b111617c28596ca96855f22161b1f40cad1d7d4a4db859de43fa5a99ca5fed17ec5f6647b17f242ec92169772d1865c1ec5213991ed7f0c7ba61559e44608eb2e8437265682c24b40d443b14ce5f9e4bea956bac6020126f28c84a5209bbcdfa62b53a87446596fd1c14954deae8f44bdef250466cef9c6a1ff4919ea25c86764f81a2938155ba96da57305753b3790f34cac95dbf53601347c1fd225e754e718cafe92ed3bf8ec06d092b0920831adce7db5709936df12f41c20522e92c60a5aa628712a2bb59988c84a51be9805bdacaa6e996a6e88bc76ef10700d8eb942bdd58e227b440eb2da51c7ee5f68f945dbf738d6b381d6705dfd95fc4441b75d7fcb2b748379adbfa2550d0d41d45d5eecfe2a09c2a3a0e4ca93e6ad51e2f54f71d1b4ab7cfc633182888b7e6b995587b5c8758517620a2cf28f0b335a91886531c3e7091e75b6369741adff084de0283a1950a03aaf20da1d2ca3dcb283667f821eb5bfc7ee02d82a34f26fc132005dfc2eeed32a82275bd68d80f6258f8d5abaf9505aec2b815aacf8a8a0336eefafb46d50fa4fecae08ad26e791fda2b4a586796ff003014d6d67aa72c78524e333e0fa22a94d5659d7d4e128aae3e1eb0e003dabf3d9afcefdfcb0deb1e7e7e273765da5fcbe42f7f9aefe094ebdfa7cf4448579f15fe082fe4ba5f2ffa2071d47f965fdfdf97cfa256b5b5865a15b2ee2ac36b60ed11096d3762b548bf5ccf996f8b8d0956773a714f0ec7c0470864b2e33d87eaf64071d7a4baafe842e208ff00a69f25cb3f3f70c21632ab3dbb4731608a973557b2d31291db9afe81641435906ea01ab86a5f332d5c707a84b44a64405b17c5c1a8df732f3e32a1d231f991ecd5570950c2813a3384beee5bac18ae975b1bec9f961d6df35d41b43baa96a337e991e0ae0f97d8f7117bb33e5f9661452b1fe596f5a07c7b1198750ea51a98530afc05ff009600cb47eb20f2f59f9e582c4ae59c44af2338608541bfcb14440220dd6894a9e9497f6fe6397156acaaad74cd27f0388fa54ee3f5b2e9612e278891bb0f5cb60c7f50e068ba6b34761cea55d689435ee0d058f9089f3940e63bab06c8f4faeefbb1dd2cdbff0050597775aa2a28a1763f2ccaed87388adabe51a510b4bb71aabf50b576ef008ed402febe4185b097851d135f189d4eeda017ae8a96117500ae821a9608be85247464a1ef28ce9aa7d9b0816ac946bf0c291474038b8286e6baaba5d638af27b44aa56e9cbee8f32189fc1775f2cae1c8823967df50f207a308f1f70382ce9ef6b6e50a3a3a998707cc5052d4d0edf2f846c15e2af22dd45881cb61ff0078d85b55a72f8475128687c5bfbb0fa72e93abeb116bcfcfb15f3c658717e7ccbe2b333ba76cf3cebfdb339d45fcc75f6df97c9f6fdbfe0955ff00b880f533f47b2836f07e8f7ed83841aa03a42829a56fd131e28ad7c3cfcc0a6cb3cee908a3d42ddb324b9a07f444695f8b941cca88d82afc392ecb34cad942f50b05784352075ae2552ad94a6c628433ac36b7737af71b763fcc5fe8a8d56ed51bf4c2dce0e7db051651f9974cfd3a47b8e8d4ba3da63835d88e67c6a33257d8a2ea5d6c11a8944b3027d3a835e4a95f36a8748936626da0bc97352e01e590862cee12a2e7092f59cb6e2187137e8c376b40a365dcd6b94174da9ec91bd762312e066427c5696807344b5e53cae89df073510180014e8988b08ce0c0bfa96f5d77ed81bc7592b91a9fe868a3ca20841c176f1f12bc768d47e9b1f08908a866de1e0c7589eb940a7c0482582a5c341d34d547f56c7badb6783aa80d8bdad0cc0707c9598fcaa07db758695f290b01bc046ce6bed8d7fe57f11314b9cd289c7359f94c6feca89f9788143707272f9b868b2ff47c272e6450c6e50b46b74f1086bd742ac3000829a689c8284ac17265a48d5c70455739a28a6a93544d4e14386556743738a5abc23e8f42159805d3fcc1cacc5cf5f2c6f1ab302bb474bd3d30fa25973b67f961296cd55fd9d1048df34fb76b009ae2bef4e84e2ced507407988793483eb8837674b3f80853ecea7cbb85d9bcba2bfe11b2f1f61fc106b2aa8cf83d614eddf052d940d6f43ede025ddb7f9ff503dcff001ff606f9fe3fec0df8ebfdc3fefdd76fc4a08aa9e94a5fd64a2f0ea2aeab53e672df025952df1ef989297c8f95399d468775cbec53bea1da6f07dcd1548b55651dd0c11411652846c1b334347702837f390bcae417ee5a3921a45571002cbfa25a353d5be7e23e8ef2ba807482bebbb2acaafef15b1a8c257ff6a29e854d00d210b87b60d54b8e39c90adaa610c4bec887710da8bd8af2a13a75033e944ae10231738ce08b247984be834cee4530271b7f244e00244e00750f89f120e687a4b0e6014ee709097e6d954b2304c66436a9d8038a258817364a4a4d17ead8382dab0b472c4f615b025b7ab0fcc6c08031713e550c7f693756aa47d8ef94813818144cb89727e4c16d755069c451a626cbabe88bb39445ea3c5a92801904f2ba66d71e5dc13c14d150d81ba69c9575cf48ca95e146c304cc60f825d3d6fe58ef3f8b41fd7c610d51cfc6b2a0df56d637bdf936dac80d5175dd288fe05f35c9f3e477fea5b9b4f8c23a6fa7aae67078f3fe128ce16f47b8a03a2eecb866da083383791f171b5d585596cadf17131989ceafcd1df52a7e63928ba83d33d0b7de7840805d9fb1b006ca77cab9468ded2ff444305494e05d57dc0628530e07cc2d1b5355bbb3c7c44406ce41e09fe63717763f23fd40a783e69fe6f766a1c00540ced62c066d60fd12b99f67f7469be429a6957fda702d8563467a0945a3afc0f7ed94e2004ba45d36cd283b07afaea128438ab3856bf7384634305dc330fe7fbb01a33e43fcb01f77fb7dfc4a3f2af1ff009c119aba9a6d9c7c2bd8b270a00029a0a805f9df06008ab2e8f05b8bf4712c309c488c3c7e65df1d7c47be4dac21f75d732dc16e22a30f23c9701392e280fd3ccba88bfe510769420b74b65074e4db664bc51b2d90b51f0f0466d461deaa2876ad042b4063fe23e089777f0aef6090f2233004e6c55078445add8e207bdc3f30b52de2e319254bf171a4a3b9f506cc451256b3114cda21e798542f9665c3a1a97030360e4b9fddbd94ef474745412aad55f2238a0e23321123f2d9e2cb11167328abf251a46a59351b6409f9f51a1a38f4c0806c3e59e4e4b29e7e18501b5b609201bda10789a0ac30574712f49d6637ae5ffc870048de5670ae970812fba6b29dc82bf2ca45e9e5e095e58d176dc08b0c9c7882979dca638994ea0a9fd332549049e12e18ab54af3f8d947c7f7587debb544fdff69de7f05f317dfe58d16987e08d5b8587805eefcca1926c5178569f2304525b74ad532d7dafd27cff0007f96136eafabde655838584501f87abe475c3f34ea7037dcd7f12fafa9a0d4be6e2c29d885d710a050bd2faf628ad2ebb0b71f08c7a36c1692ca53467c8cc29c7007f0228aa7ae0a2e1886a81eb11614af05e977514f346582b294a61eebe66055700214bdef2f9af827232c3d57b2bb36f48e67ccbb2e6f30abc2a07fbaad57960f0b824820d5a615ff710a0055fd0e6dfb981eb79f2ff00a2108ac7178bf8809c70b7201d494b8a6d7a051051b7209efb65b3eff6c0a56c5efccb5b6d7ae28f096ea566fc1d7dc194d219f0f61923baf89eca5432bdd7ee5ca388c18fff00b644a38b650de9e68b08c0685e4dfdc60fa0591f6d547d8c364061474d0621c1535cc6a541b1c90cd8c83d18da82d22745c5fe9f01c7ca1509bb1cfe2731bd3b8d3a221401abe4f2777fb21ebcc53aa73ffc4142801454763489ddb17b36fd2d724598a1f1c8151afd5c5751543e3737177970960bb88ebab694351a8c59740f49605a9e4620dbc4fd45b6c1d400b055ff00962a0d052ccc6525110872ff000999451f18a4486ceca764f6aee1680f85c33ee45e972fe72b58714bc3fcb50881db0699ec62ef82f51dd9954f7dabe0942fbd5a1f39055810ae71c821d312e72a07bd95d00a82379b72d6125b2585a322fb6631884469355f314bc1a4fa847785af2a74f8b6caf4fdc3e34f82887c35f04b0f3fbb12f9fe6259bf7ad44ecf7a3fcb2b6bfeb30d6cf6bfc194837c58bb8df03c23a827068d104f78fcb1bb2ff96bf8205079ce146fcc01852b79b762868e879e3f5fe2350e500aca19a78fd487eb9689c7dc1fbca84af1f6be462f9065052759ee9072cfa5cd8129b14bf806054a06e44bb4bd7b8520395554a7e692ac727196e9f9837a8dd272aeac6e9dedf4c34b002de0f66a005bb38f4b9a96c1000c7a9ca6595f41cb46d645e1e0c5aab75d89738e05f174d3b6237632cb3d7454cd37a5dbfa8a316072f5f0253a7474f4f989c0a9aad3ab5d1140fdab1bb97b6905d5179c8ed063575e273f5ab6583c2d424f9168e2cef625f5f796f58e5de65794976caace566df810bf26c8c53c83f962ee67c95166eedf258c7be48abf0bd991576efea2b343dc0dd20d8091a18dc3c0d314e2e3badcf24050012f2556c9c09ca1e57a8965b93f2cb9e73fa10a546b9784bab3dd2bbd5e11da030e17fd427b051041b15ff8907b4b8bbfa807cc3073caf5f668266d02fa2e7c9e21a59e042d5be03a9722d15dbfea12ae504c1115fe7c18c2112d4d95490632c385fee3057fcb2e01dc522a6e4baf1702d94052dc50f025a450f5cc53871f110435ebb94859c1103ca8e70adeb70a36b3b8922d2e62059eaa3586a2b2a5f865b90f656da87c17913c34cb419bd88c41f21a55ade8c6e0383d22e3972a4ebd1b4b10d68b5b120539df5c15702f56bf57aa9c07ac135f84a2ca80504d25d9b97c51fe2259f81fd0c09409299a9c54af54b69e4e33408845afc3a2656d1f729adfe725666ff043e38f0955759f5acf72b9e766f5bfcb367fac218d06f8403e3df585503760b560e8cc5fa19da8e70a5ff32852e8b76dbfc4deaf9f082d00a6d352979e470cd9d20ebc4ca4585a80d1c641027da77dde238d5e784a38fb3aafd7cca5ab4fda7c47ce825014838bf2cff265a1634e80ae1771b20a8c52a84e04f155fc07ac60d805abd5b2ab407fe0c8e81d725a1e5c4bc672ec9c84a4b04a5783b5a8d162b3c9cfb66ba066120b25674dfed95659e2ec60fc12e6b1f7330128d3d12e8cb1034df9be5b86d6f5b7ff00184d9dda21ebd53b95f839713ef075231b345fb61dd5681dd173b9425df97f129802b0515ff114dba456be20303d3b2f88bc10415b1e0a9c30204e070b7de236c2fd59bf50b0dddc431991a73644b6e5f11c04730e616e00db646bc8c2361b220e5a858955cbb044ee2277393b9bb20aa2003c77d495c42f452afcb1d8876d6d9abc46cc7162121af12d1557b565821b7e58d5fe14958fd4e48bcc5ff24436b3b4509ffc20fb26dcb2b5f17fb89d5647373de19b7c7974c68182ec1b38ee27d29cf1141697311fe89cab815a5fdbb7a18a9a8604ab582bfab95dad4ab75f4473b1aba4e2550b2176ee2955c74cbe97c8792b2657819339a8c150f2ee2a39f108b2b4b75d5ca1516406811182071b29b687cf62e3c6eb06b5dc4c12dfa8ac35f4b861219b0bbd7265ea50b9467287b90a77d9c6d534aadc0a20b1ab45cc966162adc1f79db138277b07fcb2915e96783db35494e3a884ad254a95186058ed95b05d9fb1b11f1f6cf9fe59575ca7e89f5fa8a1797f96556e17db13787ed9d2adf0309c80f78f500cbab3cb6a5eef85ab57d88a51c717844ace5e04a05b43eaff00a82e0b8219b36044f6df69c1ed597bd59411da838a8c398062dad45331c95bf9ee53687e7633296b935866a8f357ba940bb34ae995790900fc4508edacf0b5877446f62db717f64b6d8f1651e1398dde1f6afb6343ab5bd2ba25864b5f03cacf404df5a5da5a5014b013a5a2a0775ecc3879a1c51c0a8aa8d299acb7d1ab1f14db09769ea5a41b6a7478469e807801c25fcc88d6705ca35556a03f9805bdb45fd917402edbcb858ac2085fa0c4eb5d1e39fc3c7c42d6295585cd30962bf0a35fb302b81bc2bbe9be54765763ebafdc05d017f0261ccf92aa0357bc974112c8b428b39257469ec600d365fea145519a3e600594f03c624c5f12348131db259a3b711fdb90f96364495b75b9721c4e742357600e55851440aa751b6076e266ac2d4b5705a1f1eca06f0388dd52c33b610697f3509f5c8d68ec05f584a4cb8c86887e389793b4ea793babe7d07d4541848c2da30f586a5a34e5e51818a6faedbaac9415aaaa55a756653d1413b09a6e95e76370017e212dbab36366dd44ebe4c4385eb5b70a554a2c6a8b582b4577ec56a20c2be4c263715e8d27a4737f57c4b44a903b28b82e58d558be4aaadf979011535f67c3d60e8063dd5c7f6b9c2247d8e905e7515372bb389c4ae405d46fa85783ee71c600434c0be897c28e076a6b8e95b771ebd0c4b0045791047fa18a8916b0a20d9c94b8b4b0654c16abd1a97ef906c140739868b4bf784a11e7f4173401df34fd4bab734ef2c4a2de99fdb918797ed06145bf11f00fad63639e1b6d8e07ba82beb5f82e21683bce3bfb88e99ddb0fb43cd62369aea2b582cb6ab9b6442dfef4cb29b4fa584d5452eaa81be65818f3eb95f4ce458ef53fde1efabcbfea6cb8ddde0e5d41055038ae6bc085d8f14af676b1ac205b2cb1945452eda7476cf6a58b5100a6ac703e25a4ad137d1ff7142283caae2d282ed455cb0be889ce2ed36be6010e5390e5f5f82296aa542f5582b95e2595a23ce05bf3127ee00fe69fc111a5536bb39bee28a5d2bb6abb6259ded497f75fda370b9237630fb7c231b8d80db17488f67156121abe170c88bcd00f16bcb3a0f969cff371eb342eaddd8a282bed31d62d3b03cb16563c47a48db1fe2215407475882c55946b2b4b550087a1282559730d8b4c4232b55a632d174e8ca9550d7995b65a6528ce66f053fe567d9928a9dce6716dd799a0dd33f1fb2a3bdaebbb016ebf7280be113e86ff008902fd055791e73d813171de0950569320268fd1b51e8717df89a4a7348220187b65dbebb3f01fc100f53086f1a7c82684e3c06be588138514a793f6f2ca7903b9c0dac87a8c814657c91a0722a0d57d4bc19959a334da2b4fe025aaff002d9b2fb453e785f6b290e17539ad7f1dc7897194ec6b018d2015d9f72e5e0eb1a290e7322535b594612ec165ead3c9474db9735ec5fac2f82394ecbead5b4c8c053ad20ba07e77b8b9ac918d04602d9fe8c5da2d5788c46c35dd71f821581a2afd6017ed5cc7615f067dcfe8e8748f9c0b2a1437ec1d8afc74fb67db5965fd1048a9a6b58715c1f337804ed5fed2b8a54e3c0c89cd4a6be48f6003c2fedf72ae342ef6febc888b41ee081cdaf5590897acb39c98d3a17bcb027873ba6514b579cbe4d76b4da984f0685e82d8bd5cfaa0e4e065552e2d38dbe0d1ddb8dd0fcc0f44f2ff00d90e79bea1d5efe9cfccab07f675fde6cdafc87f6815a17fb7fbcb859539edfdf12d2cafa1f3d4fa9c36f38797d011140c3a7f6548aba2df37ddf804a40100cbb039b7e7235b0e4a75d7a11c699f8a0f78e618be8aa8ed1f53822ef550a479e04880da37ee9f4f59c1c05d9dd3fe637b2c7b4feecee03dbb7be3227da82703569c6ce2f3b6bb280af6ff0010ea6a561a39559ab72fab954783e6bb6f2cd7e67795afe52c96b222029cfdcdfad3df91ee8806600b1156ee6e85169ec68a54803f0d80a71bf265a1ec11b2952bb6820939e6aae5352fdbf79dccb1fed020477f5c80b2b3c3f9a5ec4fa3a8e76aebeba23b0d55608caf50c83f6a1fb7d8555130275bb9522c8560f95fcc3203608d7ed86a99c4b3fa3f36155fb50c8fa04e742a7e5e222409a4a8ac15a28036728e0fcc5ccc5104b4a5fcc08dc0b128bbb9dd86af9d8fb8431ea2c75f52bb2d014ffcfd44fbc786a8b81ae47873efb512b45d31d272377111e4bf18868129d973020ebbab15f71695e2e5b851f35385039b654f442aa1dddc170b9d362d2e1cd444b8bceb25c10b050043ef0c4c27508b51f89462b73b29ec94a278bcce7af2c450c482480154111aa9715406e2279116afe62d35c041270b9f50deef4a80317a0f595a30156eef87b2ca00195a7fd1304cb975b6b4dff701551abef7cef729e0a87cdb4bed13006c3581599ef93101bf387e7e628720beb6b1fc6aab960aff00c58f37c3f3acabac5f9c446b852baa08f84b30ad61169af37789b5a4bb2f081b54e5e3fccc1f93100e2dd9b69c307222057c5428b240c38baaff0082201695fa1fdb01e2163d0edbc05c5e4b9a6928e7ff0009b1c9c3adbd7ccd06458574f7512ace4eb77fb78fd45d05de8d567ebfcb029dc71dfee900f6de7857cd7534a2015d8072d3ccab83594b3ec13f50a05cae802d2ab0a9af49c328e9a827ee1406d422d34f54ba9c2a1cad7ded30613221696520c812cbf7307cb50a775b6dce535225e2e7674cf5258f71a5e9aca80efc9116dbf1012365472177bfe4887828801f4462acd5d1e4c3c0c2218a816df0967d4bf8c85ab6739d144ed65be85f4c1d0cf8b4be58bd91a9767869f0710bc355cf9654b17ae14c4a917d8c725c30aac270e403a732a21e1670978b7d545629c4fe6e5d040db5ef808ca69668a0adfcd19096679ae725e4d3d1774bd7e23cf1fd0e7b639994ec31fedd4f4d21c354eea1bf2e307c458a88602e689424c1a537c2a5136e97fdfe65da3a57030052b2a88d5145ae3a81202dd1d7cc69384ea06871809e88507219a68c972b03aac8a53d5e4da106529ce540e1a61f7c07392f82c94d5f3b1f25288ae19cac3cda2e52848e9fa974b61ecc83bae2dcc5b4151e59356aec79647a61ea5893962b2b48094e7bb00a145dabc129b4caf0e33e662cbeb6d38d9f5cf970f61916d9f4ed05c6565eb8e6b7c75135a50acac7d8ad8168561e110a1be5d85f2df860df05f2cba01e551cd7cb042ffc73378e3e0d655570795acc68fdec5ca97ed96da70f0a0b94dfcb99ac49145fce998b9fb72a6e83ce3e5136d7f633a544baeaf3a8122afb1209b291e97fe259f1bde1174c5809931bd5b6fea3952e852a1f6f2fe09c124dbe41b6bc2bf7284a80c22496cdd1b97bab20af179938023f853a968b1d60657f9890d0a410574b5970a0841a40da8d1ff336606f042d5fe2a1fb3029cce42983d612a22f6fac6d5975d30dbb9129a59080c2383b65d0d033fda5a6ff003cd81643ad64bcabcc8e0be19ab9b962708162c52ec82955fb96fbf4f6a34e0f8c98025404084b3a5fcf236f81f9bb32d585183fde7ba1a3ea513e3fbd8052e09d10182e5cc57e5049fbc3e19771e1711a1653543e36423bd41542dddfa0990135d27c966ddedecf5176207d044d152fb65dabf2a8d707d4f64b8763e38af06c48a7c0abb44c561e72a6f080b72a45d840354f164b1e0dc99bf50a179fbc5869a355002faaa2b85942eae2200bfa80a1556078100d3903c9cf5009c7db113b4a38940decbc2948fc85d690eb84bc5e9708d3be9992b360a60ed5ecabbfc232e93e32f06a3b58fc9337ad727293c82e2197d0bbded8d3be5609039bff004ba5d8361d1669c8bb011c42a99c900a52c69e90f8f2237ab6ab8b7dec65c955d052c01ace44f1b37435dcadbc24a7f967f3133df8550acf08521a1c71c76c37fc3a7db03f3f071f96727bf061295f5e426ffe58e6a57dbb07197f6a8dfb53f4351ba4e6f6006b33f2f32b2dc7e551c5371ea91b1162ad068e257d3a99b7e5f50d685ff30a6afc0d5fe8867582bcfefb52aeb3f0ff00a9d3f4adcf88fc3ebc8bddfbff00b2f6155f886597e5712a8d0a81382031c12aa0adff005fdffdb0cdfe65c4059196fbfe8d28821c0e659df0aec402e0f62596833348a9e589112534dbcc1bb98263387cbb9771951f11b06e7498a07ee380458085f09c44a42baac25f8211f13634a93be22f7c4569940ac6bf6b8215b29577d5134559413901f97589c85f88acdba5fb65ae7d32722982e52159773e7cf6c09c55702a057eb09a7aa2afcdec0b502ea5b974dab97c6c3cfc06d6acaa81754c8317726b7d45ff0044803427086c60536779062a3630071f6e6a6775625b7ab9c8c55cc35e988b9e2d6eff00571f44776125ed6222116dba54a110190696a2e34d7785cd7ed82d02e252f60adf372da0d10deb6b32f9a98e0e5f388cd9a40cae6a71e04d1f18d471764ca9e898857822582066fb4f21ddab55710bea95551c304571e4975f53fa0f16d72b0970d8f498e63621179a56d4c56053878797de46c52b88d05bdb04af8d5d85357000b0cab3a70fc44bcb77b6e6f2ce6b94f0c2555bbb55e887f1fa8037bafc04fdbf88a1cbfd4abcfe228a200a1d9f177e40e485ed775ce32ba3b60ae799ce9b7ee129785eae11f5475c9f978867473dcc3456f86c980056840ec4a8790d2707c3f316d8effef926c573f0ff00a9e25a83eec7768b1a3c71f3c7eb8252fe5ffbbfeec42fd5fb6e5f9bfe2a6791e6fc81e4dbdedb808b5aa271df1f3c4cb0aa9756edcb70732f2228e0bfdefdcb13d1565cf70607fbff00ac4094b022d4f9570a84e6ae1f0250551098acb88fcfc54bb4fed07842711d910b067e511a0d73995e33100ae5ce03cc01c15f097b6af09bfa963a10878b07a373286fc4969937a5ee722bc96a8abfa113373e87887c86e7ce55d7c4b183310af421bdf61cea74953295f9843751f6bd6143256e3dd96d6453f32dc68f6a72e5f30012c1551a1ccc28e61e4efe89676e5f317e6755e0972e5ca1fe9dd752b9c942f2c8b68a8fca4acf896965b72ca5f6eaedb8840a8af50d1860e93eb08a62debfe40496d84650f0d90410a7eb983540f93844102def054cacb881f57503a40bdf905cb5b2a75243bd520aa213b7c87e6cd577f48550f6421ac3197d105034770dbc2c69e02394a30421072e7a950a4e5695138adbb5b8311b56d042f42906b2e66968e168d2cf7d84036a831cb5004178c41762afc8e82e20daded5c4bdb6aa1e04ad2d6bef89968eb75f113935fe2358ecfd4ba69d42eb8327b1fa3094e7cbe2a8ada58a6a3860028baa5b72c89a2cb97a7e0a9f69b057d8da8355a2f08355750acd970bcf0869ad834b65dd1ee998946a12fa14b4a71aff0030c2aa92e742cffd4452269753b557131d17a5edbe6a159a8abdf7c10556ee2fe3e639adbcfb961a9d861ef9e4791f97fc94345d8fdbdb2e0972bc959a756440379a7083bde6e2ba97e3f11d207731f72d817d4f6caa82d6b14f9334cb723c4138e53774ef7dd8d57db91c906c0d2e058eab12c406e5ab4028af9993413b585a01e6050733dc556d0a688ce10c7163e4bcb74dd30a3528b55854c93ab9833a235ef88fc4e54f41388db9433c0bd8f8810ca23ba2e5f61abef50776b6fea5edfac2d1d570df2e934fd427ae97f51dcdb0dbe66fb80ef887919cc2ec657117b55afba80d68d460b8d3c140e700b1126872f2bdafcb0ba9b91179a83f20b1b86a73fd2e55c20586cc6f22842190be0499f30839b2cfd1d10da280de50c02048019c32e58bb7913e270eb0d8044965b50a00c8557038a22696958bc16ac2461d806ae31684c58167520556686a280e666cb80db4ca3c431a5211d423b15e0a4435798fdc1300b7f138297165511752ab59ffd9', 'image/jpeg', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 9, 'Test Employee', 'test@test.com', NULL, NULL, NULL, NULL, '/api/profile-image/9', NULL, NULL, '2026-07-16 06:49:19', '2026-07-16 07:31:03', X'ffd8ffe000104a46494600010100000100010000ffdb0084000a0a0a0a0a0a0b0c0c0b0f100e100f16141313141622181a181a182233202520202520332d372c292c372d5140383840515e4f4a4f5e716565718f888fbbbbfb010a0a0a0a0a0a0b0c0c0b0f100e100f16141313141622181a181a182233202520202520332d372c292c372d5140383840515e4f4a4f5e716565718f888fbbbbfbffc20011080306040803012200021101031101ffc4003000000301010101000000000000000000000102030004050601010101010100000000000000000000000001020304ffda000c03010002100310000002f3c86cb11860acad8a662ad674a3368a18c36cb20337a254c156c22da541d093c75b8e03e9f449e9e278633a9d272bc22d6e6e8d271e98e5e42f771f5d869ed5ea852317b2d39e4aed9077689e5e3d5e97e03b0a4f69ebb715784ea2cf96511d2f8c8e89416a6fc9d44793d4f3b699d7de84958cf26a53658d222c3b61c810428a20d445a242edd35cdb657b73511992926040bb4d68aaf6e46c4cb640438338338410106b4bac4ede1eac5ece3a74dd790bdfc77071d11a1d759428caa52d36d0f1791b06ad40f9926602e294d3a011b11a4f2328daa4e00209baf92d27af8538e0285b5e564887473dd292acaa3e57a5e7ef4b8edd7eae2f579dd3e88f2ce66514995439f0ef6991842489e8c3a79bba7cc988fd33b666526de3ad0084bd4783d3f3f685a1ba693636303a5a373f42c35a4ce075286c2306006606a18850adabbd5f282464a50ecc5056863352ac2d7c8e4ea44216c0cd9268ed6ae6c8be8f0fa879dd5cbd5847a79d5af479cdede2dd5b39f30aed8857119c0a1d0657113149d5691a460e924c3ead8342b024a6cbba198085498950b2d11efc9d599d8c5791f11269da75c7cbdbe7eee527a5425c97442b2f7722be274204cbae0b68e667e4d86c767b73b6569c31d775af29d04ce27d3e676519f175a750a4f54c3a41e0979f5d6d968b009ad2acb2c1ac04e2d2a46063aa8caf899b24b5e579eaece9a87a39a8549e78a65a22a3cd576144a92d9065556cb30e6c8b815599c7476279e0eae1ed8ede2e9d979fdfc2dabeaee5d9d79e08de75e0d0c408699144050e0c639c7565c640c2d75ace902b5b3769032b528751d5818911baf8fb24f47cfaf1e5ea3f9344f4723e64bcdf5b82b8d9774d6c351e9e6ac763d1bcf0609122b4d079de871ed3d8f4b9eab9927ccbd65938ca79ef0eaac682d5f5fcaf5332fcd5e1cbd18c7cbd2899ba6993322664a378d2599654c5f080e0165374f2da0c5e60c1b546c4c3047cac3d2182301862263800d0e81a792d452d55f4f98e03d5c96646a9d9c3ef78443b38facece3eb3cd2c74bc3bab97a835960c1f137c2803856cd0c66f23623314036e57526e75b34a268afb003806d8a26115951a45c656da6c23bbabccf4f181cdd5c470634e9a93a10b5231dbdbe17661e8c70e739fa68871725cf6a87a16493e98f981d6fe674e014ae8980d5ae9f4490782ead659a81600c5898c6bad8f4f19c0bdbc9aa41b241d3a8e275adb24f4523817a23ba86ea48bad8bb596359ba60f301c438a83a2240686468d9152f26533fa0f1484e82c9ba1a2a307bb8bd8c006f3799b36d9e1b6aba5e202ac20ab1cd9b53cdc499c9c951813607469b687d27151e569b43ba2dcbe8f37279ccc9d876632bbc09d8c44a9a1d3cae9dfe72217f43cdbe57e5bf5e5e32da5d47d9f1fd2c3b39a9c9ce76f3df9a3854a7a2dd83622b8313cc2948235e1d198db188b5275c6948f5d5183c2818056b53cd8dd0d7e72295413b386e52b3ae1288edd3975bc9b5d953a5ebd06ccaa38397a50d018d95e6b4ad1b318b98435490d22d5d7c55ed389fbf9c940de5e0dd5cfa22b0b41d593a7b39b9b9b445b6ebd3d973e65d5cc301a6c3a6ea938dc52a569683a246d36a270133298951a4f653663cd2a79fd65156abc81e1b975759677e7664853453a39edceaf1e8c96bc6717a32851e7ece0d3d131a62049355b9fa509429cfd2f62cc48692b8b82c02d2d2f53b9c768b0e8547f3bd2e6dde404f4ab9f4238cb5e88f573cb61c995a17e6db7673f6e6d406c49cfa38777b7c8a4f75685352d585710ec21c69db58d52c5563a74cebd0bd889c04435f33935a5414b5572ad8bd3ceb9bd0793a6d8f4f413ca57351169999417c364f2dad6c510b4ca933c5765934dd286dad5752516a998a8e6956b3551b530201d5cde865a6dcd9bd01676ac4b6b34c2f99c6f46a95206d4a25a4eecdcfc25fcff0047934e35c3beabe80b71ca6abe1cb1bcf49727a1c7d2cdc3ec6d030f0a8ad49d22ea92c669d7c9d7006398d0b46de12cbd759b00606da522d988a574efe79ec37772f4e674586e77794fc9d4f49edad1358dd34188b32a4bb637adcd66394bb54928956ebf2caddf91abd8f252846a96b11429d11a89796e2c33cbbb2e0154d458d12955f2ecda007c3a179659d4c282279858032db3c753d34330999a7055402283ae0a8c777673b7037276f2518196ce94958c476c4ed4dcdc10f4fcfe8c08ae9e4ca7a10e6c6db6afacbe675739eaa53cee6e886e7dcbf3e4e95828d1c2e09ca3e5054c5ce8af1993b0f2d312c0f2e2578dd37a20b5ab9b22d6755e466daa8daf22d9f8713d9e28f3ad168fbb114c91e881aee5e7e9e51f19c0775b07a5e51b66946a4d515ce46baa68d4518a3de564e70d05e98d2616144a75f1f4e53e4f4f9a58ebb9c63368b93699a9b34dade81e3cbd389c69dfc31a3dfc762a67a45a3135bc955958c959981159580b8e0b3093a6735cad21a8624ec786e70f579e6d3ccebb660b406368c7229380702b3ce6cad4a194d8056c30eb898608c010d24c51a2f5d0d06c49adf983942be054de35cc8ced2d56bf37449d91e86e39f1c91e8db3ad3326b668e73d4c25c1c45e76869e9cd9249516768c8ba752ac4adf9fa65e56642d4e4b05746cf439f9bb7379ec93d4a5786b56b72f4e4c693c5c9527331eeae2de86af2c6dbd1ece3d1ebcb84a095044e1d3ce4f11a3d254204a8b49d454750622d00840762a06cc60c051b07620eee4eac23cce9b6c0d0c54076b70c5010c2e206c4506cca95b764d739e8d35ce3a4472cbbb1e52fabcf73c3ab2d676d9016528f2a511a911c46487135e548546554a944ea4e460394d56eae5ede64d49e65d5348b1ea4d014ea255aac734f6d126ebab496154e8e4a4583f3c842da92ab21af2bc4d24fa46a97add75af329d5c52ae2a57e3eda9e7d1e461baecec0db04200278690622b6c0254c8d821b6dad0db0010065a2156d98cad38652b58ec2502d65cb54c9a18a0a3b653b1932ba8183d0cd76a57ada50f9d54b352e7c4858101659650eb597cde6f6792e789976b19814a34a946369c2b0391ac6d1138aea4681975f2a4dd969bb0a727473d7963aa99b25d698bcdd82b8bbf9936943b38f6055b4db185c355d1048fd9c1d077f077f2e50bf3f4938f5ccbf561cede764034c97e6b2d789ec4f8b4f637068e06a4ba69da397a166469e649b3bc9cfaa88aae8a480854eb462170d85d851c4202349442a3147194ac282d498d2d81ce309d649e6c2312212034dd2d1a969a2ca42c1a8906b1060edab2b626b612c16a92f1f07b5cb73e791b5ccbae299b1338626a4acd23c9cca325638d0b2f464cf6e6e4787a1c55d8f0be06554d28c63a8be3f7f16f5d027739a7d93a8adf9eb6de9270ef5b6678d7ebe5aa5939a3a33532875cb9aba63d2d6b74c1f0a6599499d08b6517535764dcf7bc30f531e6c7d9d1f3cf49ca53a96679476b2f027acb5e5afa8a79a7d04ae2dd32964ae040c2b30d232ba22822a986855dab6c0dd3cf87a25961d145939c2b40c54621eabd53a3a12a21f4694cf362ed3a5638c29d8c76363849db5445923cae3f6bcb4961b58e8699269d128766382ab5179da92b1fbb5b8953a2117e4e8e53a63e7f4f47790fc8ad9b43e5fa5e468da2dd2d63a6968bad206d47d4f3ad876ee19c9d8dcbd24f93a63a7574cdf032a21137e6b7a2d0b65554b91a158d3a79f5dfa3a3d3c17d158c9c6c093254a6d80ad31d8630331ca908209c7a81e7727b64f19fd7d1e4f17d008f9a3e8f02202286d818b0a594186561bad3972d656ec8f54df9f4e99d96c1a538801054251037e327a678fa46ca6cc461b0c623009364f9bbe67ce2fa3e7334cad6512938664e8c1285724a21af41b87b38d6e2a716e5e7c94e86bf36af669c7d5e71aa1af3f8de3d85d2d5295a5a0acea47b78fbb26c871148b9cd7e66d1ae3a31626c908eae6e6eb5b739c6c32740ce4b87d0e1d2db9765ec295ed4a1a18a3d64743349e1d4eadb00e04c180760107003031d8071373f488f9be7fa1f01131c075c143818e36d81e8707ab371ec55cec2e360a23a6e5ed15e6f4371c773f2d54ca899d1eae2b9d74e5b5941b599949865b18c71d6dcb5b25f3ff49e024693b5cd119730df92b8b7096ca1269f4a5e46c5647ac7181b61e91ac33f33428c74d898d2b4e87643ab2e7876f35b5ab0c655d6924b32dafcdd5cb6fa41c610b73f4a653cab692a6dd1d316cba39d655d739d438ecac85bb6df2eb1b2a1d012893661494d82856330344101db1b6c6db070c1d94cca20f87eef31e00f47cf44c546d899594db63a3d2e0ee9d123719d2b67b11b30c1dab8d9f8f3513b1ae79da4668da665e8a250cd34b3a5e0e8e18ea456c90969d2a9e17bbe1dcf2d035cb63b1171d01d013cebaa72d155b348a188a7616f07096d130cb469b40706bbf1dc921d3e7d5d213d4e828610d5ed4e7e8e6d2d4e329d1d3e77a58193d0e57bca9a41e5b09d239fb7cde9d29afa4cb3e8e9b80ea92abec3539dd2b8ed4c0e025250e570da6c36521c982ea07c3515c90e570570291b21e0f3fd2f931c236a28c131c4eeeb85f3d22032d191c67461b0034d89c03bd0e44ea506d59699a564e693ceba6bc8e7653cfb6b3df314b991207f03d8f1ae71cd66561ce104015d2b03a83645ba4f454945742419c480be00a73ad29209d1d7c6f2f64da180e7d3e91d5fa2b9fa4ec1b8adcfa544ce8b83d3f5f0d703dfc9d365f8fa972e7b369790f54e928209dbb932f7ba1e95b9889692e8073d10af4b42d72c08026519132b30c8e518c0e01c460145caf2b0acc073580a508567697c9f3be8b86cf281c98111d57f37be6eb8a4d33c9d6ad0c74086ae8d164aa0ca999e54b0a58393b381114465bb2742a0ea444e9e5a6b3d44867cfe1b4b51996988841cccb4524436a80ea9a7695aad599493854b44946e774eee73cf975459ed938a19f525b372464aa28d4ebc9093a6bca15559682b2d84b74cbcb52c1e885a4cc766b0cf124b0a7e4ee5ae3c759df86de866c11b1c5bb165974c2a3e5366855250db581861b2e1b0c361831b15874ec8d0b4575238aba324c8206673cff27e8b90f135c491f4797aa6caed367651a69d364aeee2b9150e9e35cdf4025c93552870f6f2c465d5cf67176d38ee7b6be75f3ab866aea8f4f95ac731c73928e7126e1ad59563a0cdadd585e642562aad9a9715195b2c5c6b19e748d58f44afd7ce02d24cb352b672c8a55452425674a21c6665ad15451b29b539aba1f0839682ab6106b54e9d2238f5b68f94ef44a9438614209685715d96cc4606ca1d942c30d801f021642534c8d1a39214010c0469d4665c04c4a70f5f96aa70ceb1194a904af3e3b3d57e4ea96b86a48d9212fc5b3bf529e758ede2abeb1cf3b31e5dfaf95579bb28ccfab93d0b13c6e8e564bed88b6da11ca920fb418cc669d82ab85c758a715526c729ede40bce88a1a86cc252510ea9a3926608406b4d05a2273c46fcf42c6748ac292a2e2c0c443238dce6f4793a65a45c0ba18a653bd3604c36149c233132e08d82851e6ac15e33252958842439a550a42d4c0a2669928aca2b2b8402290e4bcdede15d869a38694b2546e2ef3614e9eacbcaaf5702da2d4b7923df28e56e8639bac127dbc143b013a9069b209f472ccf3166c662e97208f7167b0293bd891ea68f3e8876524994b88c1c0f1ac14205e94eb88f772b908d6759970b469aecc433b202b8c287081b102b3d00683386cd0091e0574d7975a3c3a67bbe6ea6919959b276a00e06060b0d40ec9860657cab3a91284206c4c40305a2b30c810a8ac44ae196c5acdc5218d40c79fc7d9c534841524346aa353d23496cf3a55b49b2e487a40e27922f4539ad63c29226ba535e95792e8451758e63c5a54bf375e79ad96593d9691c8bb9ba3aadcf446acb9726bf374edca7a79ca679e535c362f3a29bcfb311f30ca6335abc9d2b6498a8aaf7b54d932d3a21611a51c9526196ca11624f3eeb63a86373fa3c6297b907236ab42d5c3bbb1e6d274ce98a9ac308c439b13600403620d9804130203972e66624e9a2a26d629d83b30255817cc0c7118ec70f07a9e5cd22522b678d4aece26a24af5e30be937159685725394a4914e8f22cf55785d7a22f35e8af35737b6463ac4b929266f03a67a79ea0d5e553d2e14b1d31e94b20b65ca6ecab886b2b0ece539861bba8863be13a625ba61783cdd36b7cb9dba6c481baf2de3649b4ef03b395a5a71fa1c15cfd32bee2d00c9f66377f9dd16f427239d252a576daba55d673dce36d97cf656cd3b0006033abd65314a68696fb6ac41418ac19d1d55f6a0c32156c2833094a4a48364d43ad00642d3a0e3627e37b7e4cd4274459da38ecaf3d62843ace7d28bc86e90edcaf5d26043275482d51302cbba22529c32d72c4ac9413ba3f4c62475f9cb9338dd32c97e4795774f36110fb4e9e65b572eeb99cef98dd32e9caedd3cf4bd7c5d55cb0f4bc654cd24369eab5789a2f1cd5da98e2ae7e8b26dda357cbeb8f68a9d1ade05f4652727573f60db6d5db636d8db63834df35b0c660c1c615b658b4b31ab1b18172068c1d8d0c550ec065d8495252bd2142aad0b16d1796c028f447095641c1df05f1d5d1a59d663f47158ea7e6b4b57d31d4126b4501ca69e44381332f38dce4eb05d16283342b644a91d31ca3bf8e867d035fa6cf346074e893ad431265319a4d216d497a3ba0ba3f471f56abaea68397ae51e4c7bf9f1125b52d24da3d55f0a56095733c74987a0b07e8e6ae9db5ba36892a5f8e4ecd1b5bb6d5b6c6db1e662d9a7060b4e414a749c27a24abad912e547c9aaba6c3e526c405764c06154697595ec1cbd1250db4382837442c665032b04f2b9bd5f2a6d55c5445112bed781ed4df51834b19759b3845e4888ed6738ede84f365dde6673124681d6a4c93262c232dd05b4ed27a1e40dabd597b0e9e3f438353cd9db64ec5d2274d5eb1ac47aa153555e4b5b9af6d913a7769b6a92cd254874f52785bd2e388f54bd238419e6500a52e6d0d46e8b52ab7d36daddb61793b572e5b540db6d36d8db63cecad9b35be5e6ea354ca508d29800a98650eca17912f48d43b6b02d1000cd7657867436057514309700c356363004600a2f9bea417c95aa4dcd1f589d50b476ac767a75f4f35878d35ccdda7633435c9e0f40c799cbee85f16beaaa7907d5e74e467d9c8b25e20d3a911d32a39487b3949d9e6f6f6ee789bd2f3e047d3e5153ac107ebd941bd08d429d9b481e5a2f7a3cb4e626f0af4e6aa79dd4d1c47ba1992ef4e8b7ccaf6729ca2bd91cd7e7bd5db6d5db636d8db636d8db636d8db63cdcab9d59e144a10c60418600d8003c47c30762351283106c85635944db9ca3c6c51596c3811032ca292a8b8a92be42c5186181cbc3ebf24d7007655a6287d146b3959467553c949bea11c3d39bbae642fcf62e702eab10dd00827421ccd69ccc6eb66471fbbb53e73a3d2071caa305dd92e82bcd63d21e3dcbf6f8d63d45e3e92db6b611e8e693a635ad295203399d7cd7e357eb9d0db64db65db6371f669118eadb65db636d8db636d8db636d8db63ce70d9b9b1363850c05db0360007124ba05c30d447181882a3138d504acee382b630d80a5650fa80a63609d1254646090a104091eb27274d50948a67a1e513b346925a3ca92f67670d65eb3cf8e8443629764e7164b116989b3e455b02579eb3b3716b2f4e7e8b97875e3cc9fae8700eee0387adee793d1d686b791db1dc9e558f6a1c4876ee2c58abc3539fab4b9006c987d361b6c6db2edb1b6c6db1b6c6db1b6c6db1b6c6db1c2d8e693b191a266452db00620c0008d82e8e33abd86359cbb9980c393a87b4ec88acb4f9180a44a6d1a1520d9a554238895b6c0201460e08b481c5d1cd34ab51371d4b93375492bcc25195cc0e6f6d7ce367a2bc9d250aeb0e561816490aad88d88c8c161cfdd1b9af6fcff46f1eaf1d152bb31b8bd4d2f85d7e8739e1fa14a1ccacb932d905a256dbd67e5d9ee1f0ee7a8386e5c62269d427618cc15d22532329db1b6c6db1b6c6db1b6c721853369b6a008003a00201b614198c51c675719d0d83124e7694b12714bcad624eea4f3a428d94d238ec32a59b6c2ad313d4cb234d2619282324bcfbab35cd2be9ae4a04cda89656456169325118401b0cd3255b99ebadb9a91d0fccf65da46c70ad62a373c55f99ce3e88f0f4e7e95397a6e6fd7e2f44bea26b00accb6453ce6877082d336365e7e3318ec8f5f1d9c7d1cfde217433f05cedaf0e3d37f298f5779be80438133003291de18bee725f45c7db2f9eda99a632431b5453b001001b025490692b0d44719d5ec8d1949ca92957498e8bc3a2ccac05474261965d2ae1afcb53a0a9b08c0072876c00d811e9d2f03d44dcfa09d634e9322e2d128f6b1e327b6d35e2eece69a4d8cd00c2265d6b38c94a45a2f91c2f29d855928b291bcaf4f87598fabe5fa1be7db0ebe289d39fac1dbf3de81eb71f140f529e750ed55a03a22e5a37c73799ee63c1eeee438b97d0f26a1e8737a311e2f4d4f329d38516f3cefaf9d63d1af92a7b5bcab1ddb9ec1cd3014a833e3cdcf5cee5d1b26db010301a446040a0812cae3bab53ba94c8c824de72c1994b7573de88644d3755983a143205d1cabc5e9f281b2929a792810297431b49ac71b0254497555e8b029a93a1360a2a332a0b6155d93952bd4be5f374f9b9d750e632d9e0ebd3a6c31506555d67d6e5686b9f74f7a079fcfec44f1fb2f339387ad87e7ef81c9ea707a91ba38392bd49af590e86994d1a9cbc4e955b064095929cce71f99dfc90dd89d27370f7f01baa3da44554d979cec7e4b1d5b971dac367470c1c08030133280100c419d5c774a5848c1474273a24a9b62b685e9e744491ccb30446c40acb8a906c032cad970d8319811a4c05738c70a00e0b074c4019d1858821685879861dd094cad49e4fae63e42fd1c2bd2d06cefa9f99e5bacd6885dac5f42973dddfe5fac99f4ca21e538baa5d5622d24b6c7479bc8d55b47b7cd4bf7f8ddc7a9cfc28779f3e877ac2c387d60ea93ca61d18e55ec07870fa081c3d160412a0e2e7aad3762da27ab8a6db3adb60ed8c0e1559403630560d11c7757b158e02b2093694ad862948d4b156b023a93570a15b1315583456b1032ca17118e21054271ac704c142b9c46656401961a4d2a684ed2bb652758b9568da9b0c94d37a8fcffd3f9f1e2256759d2816526c316b71b1eef0f642393d5f1faecf4b938207b2de6f49d651ec95fcff00566bcbafa393cef23e8bce25d34c4797b780e7ee4ea5e65b79c7a15f33aa3da9f0f75933d589baf39d9b82c74657165707872ea7ab66c0cd846db1ac4136c80d94a2ce821ca2bcf2da93a23d11ec3b1165653996d29674d8cf372d49bd8518088ea0c09ceea25ea2b32a040be06b1043a662846b36c046292bbf2d4ba320f1d8d1722dc3012b304ee8369629483558a14a1950e7f9efaaf14f34d32cd9b01efd12f2f5315ad615b22d59dc7145fb0971fa9c64ba78bae5ebb6a8bd1a365b71dcace98f338faf50a53139f408e0bdc1c09a0bd9d3cee9ddd1e148fa54f27b0b25a82cadca71dc5ab65606384236344826db19594462a2ab2836caf68d92ac0d876c05602a51562ae9019496a41acb05615594036200e95a91c1b900c80a9d91189b41d936d8c7625ae92aad520234e9ab3628570e814381310438e0052310b637994e16b63b35a93a4d51e6e3956b19e6d73585b86c7af3ecebd013bf4e7c85ad2cfcbed997ece1f30faa5f07d33a537224eb414e519363859774e5f0e7dc8bd3a889e6f3d415e8ae214c0238597d2bf9cd1e96e0a59d7a582655ceb1d8d8e00200ac05565002852fcdd074aed666950c0832ba929da72a6384700768b9545c1040ad3a9a80981023b6361ac3860ed8c7636cc13b4b2c622bc82d505402ac90dd0ab27240ca11919c52541cade62aae0b5c30ef379aa3cde1d91ac6646b2b0abd9e725272767472d6aeb354e3ee56a970f54cb1e909c9cfd9e6cbd5d3c563be9e556cee787555f4d22e0e58f17a793e729edf388b54272e8e33873d4ea37c724a9c8bd7b931ec306cddb60e040a50d80082050c09f4c5ceb688ab9564019684dd61825562b6589675149c0c480826d884e3589065183959311820a8519a5660d586584e5b6279d256a735c6c5ac98ae591a080e8a5b72ccece3e749a59badb35a25cb9560ba34b464795995ac674647a49ec7268cf227a1cf1caad2d5f56be75d3874db3aadf8fa2b9f9e8dac749ae3c85f4f9153bf8ea7b89e2fa84dfab203cd13bf7374ae9d31cbe6fb9c09e5f60eaac498497403cfde862368367553cae5f6c04a022b7514301710023160b22dd3cbd2391cd65d5c094041b126b49aa31a13d4c4d6ca41d88db0361898a6129b21c09b62060e639030784ac54876508703b238092060c0e1eff2ce26e565ebd269b20ac2abaea065642ca65a3ca83bcdc67464728d6576e9998af47366479ba97474ba1c0b68b45a6d5d0154e9e8e2ba5807d49f37679e72b47ad6dd9cdce9ef9f95f417d8e6a5d38face3797dde5557ae36016009d1418e3919d31bb538ea9794495af383a36c28602ab0152883c5917a2dc4e96eae7e93432d58c2e876c0c703026c3046015d8db606d8d8e010c0c41887336005319534e862084a91c6318ed45908f9588fcff5715806d5d0f3d15dd526a20895586188233a34aef371de6c8e5715ede2e8b8e958d3327cde8c4e3b4f495f37d3b5d7807d4e3d073bcd7ab46f334b4df66f399b3ae2f523dba93e1f47cb4e7a1ec59d1e69dcde6f3afa1d3e354f51393a919d71408f433639f15c693598e7abe311ab60208200ad8504099c01948c711f1b88586a6c0830c61b4108e61b1b6c65186d2a0db631c44cd84ba9326c0e77594614062418a8ed279594b0a1c039ba7c2b22a5753593e8e3cd90bd3a9e2b014b4a83aa1348c34b421a0bab0ec8c36525fa79ad71500f2cad516ba673a6ac9ac803339bcfe7fb5b4f19fbb8ac6513d39fab8ed2d6bcfebd73f0f771aafa3c9d962cee891f37d1f3d63db1f50e41d7081d1e5d8f5f79b6ae9cb918e33436c0c7036c4ce586795400e02b6154e171c35e152af27b18114b940eac0ca49207416570620019842a85f47a85298a1d02d24214794aa7127504cca438809568c03292a1387ca796e6071eaf47270c5bae72d413186ee9a5749e16869b75cd71b5619b464695ca619e543a3a39ecc5176e795a8200d84b48574a4a9aa9af311a5a54e4f48d7cfbfafc3a90f5b86d51e450afea79be98d3e6468f376490f7caf7239fab1e227b9cebe5774bb8963a3acce8b830418e306c2e60ab9f09980a94d139b28db633cc97783d5da54428eb403e1330063818e1431016c09592235869a7bf194a26a058293470128e12ac1cae6c744e8a2dd4510de677785a89996c37e7f68e29740073325332520e9309d1cfd01efe1f42c0959aa557b2270f4b88e67763328cc62a79c7693140a6090a1049adce357ae33beaf2d3aa22b73db29727a3acf0e3eef0e9c5db2ebb79456529b4ba6ba1b1b918ea01b092bf242e6d2d5934b6d8d6071b1c638803845070a1d544ea2241d440d8cca47a409d6dc8f6746882ba44a6991ccf14130504f1413cb32ad01b30487a1cf84364a8940c2310312a16561529852794e0e523502907a3dcfe3cb2b2cec24f658b1b72199fa65e1b74505ea4a5991d04ece4ea83ce404b2d4e4fcd875e46c19c642d2a436421d9d7657845a6b169216f64e56d590ea89228d0bc9e8e3c8dddcba2dc259dcde7f4574804c40a1c578ca74f4dfa02999198033602bccd4982a36003900655c08809452694514a91b6c2ec073072ba42ada58a2a6862af589202724a87071cb8184639a14b28fa54566c02ad804aa674651e1fa3e3eb2485a1d1cfefc6f07b203a0ad74541b007c6398d830ee8c1956055f189bced4a0e290ef5c6bca7ee9e5c9668a7522264cfc86cec3cef25080ad802814995f02d1d5d724aeac1eea4b619423dbace21d32d58519435e27a778778376e21815c464d97050e5933e0ec5063800a2b0570065854a2918f4722f4b49d1ca3560c49e724cb6452718ec6230708adda3d118a4c4c44315ca5a6a963371cab28c40d95910538abce89da994a9d5ebcb8f37cfe893ea0ece7ebb18ec12a46652665619831a1689d4b3d2b38d6679da5e81b66e07135b03987563863e9ac79b6af9f27a3b93a30a8e77b1f1589db0a70ac60c07789ae94952d9af48239b4423d66bcf17e5d29e8703d7a9b87151b291b00ec29d909d83b636d942ec01b43eda80d8873ed2eaec17dac2bb0cdb036c98ec4f6cb9b6464da55b6ca92d9336d0c3652bb0e7619f6b176c30d86f076a81dac5bec7bdf37b4b59ed6755f6b1f6c63b145d863b0e7615360d760ed81d3b4afb6cd3b636d8db60ed904365e68ed197693aa9b658ed22a6d4db619b642bb297d8b0dba59cb6c3cc6db635d8aeda4ffc40002ffda000c030100020003000000215aad0fbf9f87a42a2dbf2ea9f7ff005ad6e20d41e7fe52737b00c272e422acdc125053dc8b184971ca103f0408a3a5bc0f04840f0af4a70f1b7d3c6fe2107b846b90775a72b0948dc2843d30b210bbd902f156bd5882611bb16395ab275a844dc4943eef844da2c301e2aa47c6b9d94e5922f9a74b4a11c53ada61a8c6015630599800c4418aa2f42090af7ff71f265babe6dcf4426512ebc3dc3646f2582e97b59295df1173a87243148f291c7b97d8b242690fb621fa82afd76356b3e902ec57df10cc812aac02204f882db0a1042246d4bee632dd6ad17215797b0527b63f51c58769f5dd1eae6683656c5b3ba3641946d6cbfdc588b045476a9eedd9e49ad4d25ec83d012cc15f864098f9fedf0d62a589126cd310c60752fb5199ebe2b3f9e488d588ea2c01bb753e187745c47f2fcd0729428cc1e2bfc12cf8a89d9e3b475b083ea9fdf2148412c60610d1e6d699656d6958239094470785880167055c254b3c46952fafd4b5e74739525617789ba584036ddbfb1f6db27bd0820190251850caf1edd483c4a3aace0c23dd2f4127c50e733f244e727263b7141474f32a3aedf6aef5a11754d2d15fd2ddcbb7a553a409213f4b8f070688bbf87778ee9566774177e3580c5f25f65679c4060c94f8d8b81ff25f6d318135ac09237ea4ce0a40b71d75b540acf5420fa896120c3793d947c174b835d1c0e49145c10e136cfb41dc04bf1f1daee242897cd0768d659607d25857dc520a1cc492526ea00efd329009f56bbab45ff171f3df9b3e70539f51368cecb5876621d9c0b285b260576a81f6604eb0b0c695b14f4439f215afc37aec53b76c6bb13e6ebf0f5a31feb3af1c898865df22f831374b684022a56126b81cf38be8b01ab4e73c83737219acf9d9fbc2a665b5d9e17112b60403d1b842ee882c3fab9aa35c8ccf28f138eb2d06ff007aad6893c71875ebe7f73ce18004114214f3c0ac6e58f3c6ae4e37c7c3a71d9a261163d7d4c3d0d775ab9ffcbf77ab36da3878cfb6dbc44c2c03c7dc040f428014110d00212d7954d4d3b0bb274fb44afa902205d308cc5fbbf0b05b6542fc9b7e6ce1f7bad7fde401bccec1c31bd313bc520410120db697f25dc54a683a07b7487aa49e10d0417af3497e83dcef8fb438490515ce739b461d41f3f4d730ef4527ff0077cbadcaf3fb59d4641edcc7d5ebed37ae551e9f9d343623445b9c02ab102ad4d9f21e19cd2a21785c37c75d6a86c3064c4b3db1eb2a36869199df1e96d85c690e35ae04133618b5b034b1792633801089275777e5fac39383bfa3b5d4984ec46c71975d70b40f2aa49d0b88e5bd7c44d3b4e54dbd8d156f02105dce74dabb2a0504cedacbec5be971dd46fc729b4e3b5b4115d771f7fa75a550d912294dc79839e20267b07858e883acd6e3230aa1b9f571096eaaacd8ef35d3992b304018830b4d032c0124061f87315d549816985bff00a2e28abf873a07b0aa845751b45a71919f6da1c22a4d727d62ac2194d780b3ee21560c11041f2b9c2ee176dcb08c52950b8a96566495c190f3270ba99424d01633277d882e02a9576b6595b8cf27b1a091469849f48b0e5e1469059f627a8e7716eb17844d128554f62b6d2b3a0080caf1bcbea6e33985717d3f8e6a194cbea580d7293d7fa1216e1cbd53937d09472b9c4ab138e2d02750896370a7741fb8cb97e7a4e3f9b6b8930dce91c3cf3cf173eec377b2aa6a0577b996c42faa1ead64b3da4f3c17dde99bca3c2a3e6cbd384b7dbb8f91dbcd99ac52e9d6e31ebcf3c2fb2c983d8bc708519ace05cfafba69e647353d912e1c8ea3c72748d0e25682f0e5372df05ac58291c5278173c988f3cf3dc2b8a7cba0f14adb446ad542ed2ebf97664bbb29fdd6d70752533a375481912eb7bd9ac1ed5ce16d47a6f3cf3cf3cf3c021b9628e5db8dab5218ae4989ec51e8e902ff0083695831ead51186ef02bc7abdfe6e838996150c37cb1b47cf3cf3cf3cf2df82cb23bf96b28e08a0ad742085bb01a557346f551136226f8e9c767d461d5cd344c1ee94c5b8be71f3cf3cf3cf3cf3cffe78f1b7b592b1da1273f69ca62d7f4ab4629f5b57f765b666bff7dbed23bcf7b486199278869696593bf9c30d3cf3cf37e302b6ae924215d2bd845ddaf87fe142777bdd1fec6aacdb68c3a1c08fef30f123ac1f91e3a06554945de73dfbb4dc702dda62ca9671abdf5e7595c97aa3a3def979bb6a446dfdb1d0ec019f396451a469a49d611c9c63aa81a37f5a7d3630d3cdc7f27e99799c47793a5d3743ab82304c1d80eb75ad8fdf2e02390025f516a3421d2faf377d4d0dd92910c8f7fd3e75541b8e2b717da5767d97e7584c838e091b8e6ae2a6814c61dfda5b4d0cbc18f41473b8ff00c48748e51f65d81b81d8e09aa570725820a1751b85971f9e0ab2d030e26e2be5ac964d0d4dd7fa3684945f0a5481c5d186637077a9bd5345997d20b1066730aa23fdf61f2eb5946ecba8df6792425bce0e36dba35bdecbdf76d8dda1d29af31886155e3a3341538182d15c416dbc18f2e29e1c7b4c59f0db216ab1fcde4574228f63d965d77741ec567d8cadfccfa1989edce00189040eca6f6b019b969722c7ff00e2cb66f54730efdc7781bba492a8e996b4d96576a64440de2487d15448d003a6471559be4846e5a1b01539ec26ff00e5001b18abfbf4da742c1dea4b69db2b69040159457b4b9999aa7058a8ee633a23cb19da63e036a727c332c70117072ba231f31430928ffa41f6f9f77cb200014a22aacd4927da58975979a692fa126a36989a6364bd1c8e72fb23a6c056066134c8113606dd96a29704476ea2f4bb6dbdc32ffc7987924626906b04d77fe93c650b53a8bce97fbdbd1811fe0ec2332d6087735301ebca8a9a69f26f17a518b134fb1cbf470e1379959e7da9e4aa9ba4bf0c8d93deb5c18717f9b943ed2f98b8dc40323b4cf0b20e2f2be6d335abcd479e53cf3ae96d5851681a7d843ea37148e5a709e41f3be388fd518f74669392c94c4b976d8003a15f59110a2b665950cdd57de4d5619dc85aeb5961a4383ea2471e80a19e24c374fb8ed35c59c8c35985cd0ed5eec43b0eec14504559d16bf1ee23cfeebaf3cc0e82a25b79451a59864c30c8164a099e537d375884b278c91d80d33090df91eda30d04594a10e740827c91a278400a31c37d11e4c7a8e9bb9bf3135e62e775d36f3c186d2dd49e3daf3479c529293e32e1ff00d28cfa28f6973c38ef2f338201941f645b67ce5d72a2bcdc800ba1673cb77936df4e40c5496dd681fd4100f12b6a23b94e7a28bdf7df007fc800721f2086172189c06389efa1f5d022700fbf7df0df75d87d83d05e7bf83f0c087c0017bf8dd8400fffc40002ffda000c03010002000300000010891c67cb8c85dc3fccb7831a54d64402b7b5f93c10fd33205f7546adedd91017baf464cce9d58c1d86ac393c47c8ead53c82a38466fb99a0ae211710141f20ff008c85db895d431ad3f2f310610001588dc0ebd2054249caa6353cc426e06ae026c3e67dc31fe3618b5f5b731b63185dceca81b2e0bc20ddd8dd4c264f1cba9b7f7b84b72320a54ba880fdf6bfd9ae66ba95909e28963e584cde0382c5fe9c9aaf988facd0080e9fd014cdebba6d2f7b5fe4dc27c93d3770a7b8090d378eca84ecee9ff212ecf44863b64a7e6519c1a4df03b33c09462738997c043dde674f726c06bab2fc12035490a98ea4074e7b978f861971322f3d1a05fb8fd90213dee41b2bf837e56e4db77a101a1220a899fc5cc33cabd7ad9005fa43ad71ba1df05ce02186c5afd28061fe65267371bf76b6d4d49a7382bf7bca7abed938700f705f367bdb1c453aea242ef9478a891cf84a514b92e196935616cd951e421ee58f89e221373f9370066d30474338799c953696f62b97f1be38a0a74c90a7c4ff007cdd89559f09b77042cd66ba6769bb7f06ce3a72baacc0b9eff514328bd0eb9e7a1f4143098a4d1baddb77ba2be7b981ab47e091a23b873e6ac3b24b62d6c152c9474d01724940e37aa68bdcf0cbbe2dba0d5dacff0031e89cc8bf9a014c71c9898db68b65733d186e3b2cde433a393431403322f0f2b5ad1693e134275ae58aa066796c3736dd0d0dcb29cf4cb61fa264e83332307657311c93bb5cf55b32be99a00aa5c1b8c97657c3d8c50962b91254b99aa65150a24df32d2e123973e6788c9d80236c71e14b43d03f78c38c3adc8b35b36cb6ee25fec50fc0b84d0bf449924165fd7da27a07f95f4220a6b03e90f3a469c3dbe54397a6249e5264c7653279fb0a2847d3cbe25d13f477d7e6e6d7cf481c13bfcf33688c3afdcef27ecfef557b68a5273cbe03af27c9f745dbdcc7e9e7a5f579d6a955137d1f59df0dccbb861bc5d162e51640994fba958fc1311311dcab74c59bc1acd41d2fcd1193b361431c66a45b45f124b6c1e1ff00adf855969027a2b37bc4a7d464911335daeadd10d5dafd7d57de9c7b9103e597ea289db37a9eee8608e17508749248ceb6ddd72e90c6c1c0d106cb275694dc5ac8aa9da6a6ce32ecf9614db29dd2d021d72de361f7773ae9d56a0b8b8b1b9265572b929eb3a8b3b7e3b7d8e90faf4e212675bd5f6568ff001e926171acc257ee8e10223b354c03d60f0b4a0d4865c654633889fad59150cda935788ce5be3703e77f52ba2694829d0270f4a29569ad22eede7b59c8600349f7baf33e2b7944f3ee1c26172e35fd2fa3b32ab85792b8effe291e26456c04cad7d383a0d3c8528a47e2acdfdde7d80fe8b4db2f9475961143ec1abeea3d2f797d5311f40318e53a94ae0ab8a0f8f9152d690ca6151284ed04ceeaa0e82c1e4b0d9738664f45517505860db4a745f2a850615c3b6527f9e329484d2fc67e21b2402088b615abef504e28b59bad5d2f91f032e060b2977c4225941804b27127166bd2cdd7c1c05a49ae8e464faf429031e4233b78ea0639d703bad20f0ae57cf6455f506672fb7ed865f7c52ba75d7ba91f2171d6b47286da64bf160f1ab7c4506f337e5cd2cf48cee919cb21020eaa9a18f6b0797cc045782ddd6027c6b89e335f7eb17903c167ddf2fee9e5a065fe4f8f91a94c76cf25fdeaf5adcc031f3528c0000001c9abf745c3d8100bbd9aadbb9a9a4e5dd2d43af47467eb92582e792ac218e7d9763d453950df8632bf7676ea5aa30000054c33373b1d860849f85a244d64784ff3771b0a8523799dd57c4a166c8ff46f6ad9b5718ae29ec83a6370df800aa600001383d3f88d5c2efa37c81ae263b0eea7b7961706d1761539a7c6c303502db27dbd52a95fed54fa353836b5800000000000f2f8fb9fdb18a36dfec7768baaa3a9b10e81395dc9637e1d0a6f076bd46ad748994944dc1958b2c40427d400000000000278dbcef47c7f4ca64b5e43f5e1eb58f966458c055101ff00df675e7e24d69aea8bc5deb23192e547c1cd000000000000000c07ae51703832e91236f795159a99d0a958ee5f1c15be53e7ba3106ef9a0bc0648f7cb140cd56afdaeda94f20c2000000081309d5107af3f55912b69dce15cfbfa0b75cbdc59a59e61ead85a68b6e9fee0b7c43a14c21c59ef2166b280a38efb1ccb0b7fbf5a2dfbada60bb563d9f96f4291eb19d1f1cb7abcd052d155500ed29491ee0410a51b9ccae9df0a0bcdf188b9e300893c23ee76302af949536112449724a3ff2ed51b0091003ca13239c5236df67a3bfb8703f4ef27cbf7742403953d7acdfe37f87bb8ea97b4d1c80cb9582fd17a143038668075943f9f583c3935358056a04089a9caa5cdb5094347f16bceb80ec87df7c667e78f59e5151b8a640e3e07e3527b89586095fd71f5c8ffdbad92f1d31a9525ac0cb71cfb300bdd2516e7f17418dba23895b037c2cd9a62b144416ee8a8d32b67bccd4bd08515231683cb9c2c9b45537ff002ccddf710ebda795579106faf6516fd18bc8b7959e60d64bb1f6651e1f07713f65e93f4f61607b00f67cdc3ed7a597996a5730f4e1f1fee2c9d7dd22ff001b370edd1e9c8e5fca0eda8470ba75a3b6076681e5eea4e1d534c7d8a72b803a05d91fd8aceacdbfa5133a2759f19b3cd03475f21c9b78d0f900886f993815b51ec8bfbada808cf8e4742b269bb40cfc685aab359626ad8dd0c0ca3f5ce81655a081dc81e531c49f5902629a7695118954b38d8e4be147155a4916a71f00759168b2456f4b1b39cab6d8edbd958fcf82be7d30834f1c387c4cc5f77347e2ca74db86d0aa593d42265477e490aeb1b95ba10803b06cfc819cb997a26b00ad8d93cec28f39809ccbe7e5c0e01f3e4547a2a68114d8b0fae1ab1d411aa993713272b5bf32c5c8840f77d5b2193b782f1e5a287a46ac4c63c8188dfa10ccfb6c13c223daac3f663dd58b9c4d14be93b621ab2d9f8a15ec662a5e53b7535783996b954ec2b85772433855d303566f7be59d4b3c31440c2623a919555166bc3ae62b6d31ae829404b98857ac977fda328e1f37fee9db106d0c320c03c459553e2b41b457eefed366afd200e74d25da457ffba83859e46a33ff000cc9765da7d2e41e2a3e9d9f473684dcc2922171508442f3a67ccf9e51577608edd212e71aa3b37a53be58c83d5eb9e56f7fe8eb9fcaf7ccb2a031e213d1aa38cc44475db06efe080df12932ae2bedf3a0cb68eadc729a4c762aef057a2793ebcdcafc6e38284abd983bd986ad30cdfc87b0f3c8037ff79d8a00607200fe0c305f7c076309e88184101c05e0007be05d8df763fe2fa1f7cfa10c00c1821720f1c0fd0fffc4002e1100020201040104030101000104030000000102110310122131410420225113306132718114233352344291ffda0008010201013f006e8ec69243f26395a4b472a3b9128a43426d10958d5b5acea0a53f09156f931fc571d12addc18a5cff00d32a942777d3e0c191e5c71952bf234df92292949333cd3cb249f08b85bbe89e455b62aa27a7c0b2f2fa1fa3f4fba2f6f289c5cb1ca3174dc5a44bd2e7c76e50a4764571fc1cea4992c2e4d3aafe9960a1cc656ada3d1cd4ae2fb4b8252a5628d243b37dae3b22a9694db121da5c2b23bb73ddac90c455aa2a8458d8a57ac893a64646e370ddf424ca48e9b211a6d8c9c9d8a4dd33969f2465449d98d7c8ad73a72c334bba31c3773e1764a492a89231cbe48ceae768f449c71bb5dbd3d6ce7049c2ee5c106ee8bb6423be7187db3163fc78e31be914f75d97c1eaf347243645f37c8b1be1cba1cf7e4497f94c93bb259a734937d18d5ae7cf47a45153fe9b6e49e9cd928b524e3d89b6b955a5e8e718f6c7971a7646519ab4f56ed885a355d0e499765b175c8df1a644fb2258dd3e4ae46f6ab37da4c4d313a13e0cb1e5c9113724a87de91549177ac999a315093ae6869d1e0714a09a3d238ce1d74708ddf251a7d7665a70bfae48c7d3e194b23e5b36fa46e5536ad0a32c192327e3a317e5cff3df4ac64a1bdd39492fa17a6c70e5ae119a76a54b830e272f9b27867da8ba64fd2bc705293e5be11496380be34d7627693d65dc3fe8f485b93637d92e3b1294dba30e370bb7debb2bce8b466c9589bba2cef4ae0963dd8f694b04e29eea64e29ab5d97a648ef8d0e3f04978211a46d4326d53168b9a428a8bb13ddecee7ff00119d378e492b3141dab44f039476c52eca4a0a27a54e193f8d0d5a29195b58e75dd3252b542b64f746318cfbab47a173526ab8631e5b7c227926e1357da671254cc1083c6ad72d7641ec547aaf9462ff00a2dce0e5e118313ccae4ea28e952e8e84ed13e9d782ed59bb4b4dd599a0e4951860e3157edaf658a2ed8fa2d23b45d222ed1955c52259bf1d27cb44b3ce2a2f8f973d09d92135ab64d71a6da8d906397822d571a5e8955d0a59632f97284ae4d9d36648ed9bfef261bfcc97f473845d4a6931f2ad313964748f53e971c56e53516c8a5bbfe26cc996595a94bb4a8c3b70fa78cfbb47e79395d21ed69cba7f42eccbe95a96e8bf8b21b938a574512f8ce9f298f0c250d95484a38e292e1237596f83a25926b2cea4fb663cbbe1b1f0cdee12517e4cb394322b7c129476ee8d7fe087abe529221923216685f629c5ba4c94947b18b5dc58bb6c97d91a714ed11284a8f5599628afb7d18314f3cdb6f8f2c9c71b69574a85c0d8c8c932c6e936c72dc452b1d344550e2d7241793d4ce58f14a51ecc19f2a95cb24b6ff0079149495a7c31ba2da6e90b2ed7b5e928a92a663c318b72f2cf558bf2e45b271dd5cab166c9e9aa12e576cc728ce11947a6acf5ca32845a926d3e79141b4dc7e8c3084b2253b488ac7f8b670e29512d89bda9d0c4d0eeb926da37bfb639b9b56ff0096429c534d3277bba145d723b8ab372ab667f5189b6a304ddf6cc4fe51b5fd67a84ff252f28e6dd973c50528becf4f8f1fa8f93e1a7ca46c8b5ca1c126ea5c1174c9b8c9464df084fe9da22f46c538cad26264796cdad89d3a22ed086e91930e4cf9ddda4aad908471c146287076f56b822a8dc648b9a4a22c54a28714b93bd3b4396c8da4d8e7ea32e58c27d3f1467f4ea1152af342538414887cd26dbeb96272ddb5be2fb32421269d725313ed793239fe1938ff00aa2ff1f2dbde646fd4e1524be50e2497947a57925e92708f77c13c7922ea51688e3a85a92e518e504dee85b31422f14d41be7ec58669f265f8b490a1270735e191a9616dbaa253b22de9e9a6d4abc32d163e51eaa724947c18304b2cafa8aed98a9e6ca7accb25b71a5ff5917c1860b2cb637da3d37a79e0591c9ab7c2a1c94e2e29d3322945d11656ee2e887c6549f05d11926913c90a714ac8c7ca4724093a4c50b69fd096d16556edf22fb7ae475212a12b63455691ad1d35c89a2c8f2f5f5339a85455d98d4da4a6f91277b53e04941704dec7ba9ed6c966c6a176931c53dafc19a4e38a6d76a2cc71964df4aea2d9e864e3ea12f124d3124ba47abcdf925b62fe28dcd189a552a4ff008cf4b92f742bfa5593c2a744316d8d22783741c57167fe8649f6658471b492e6b939b314a31946fab134d5a676f49c14a74d0924a8c7e9d63c929ddd9eae9b4f6f0909b723d27a79c24f24f8e2921c5cbc9c62b72fa2792591f3d78445255b89cd107294b845b6c5f42c4d493bb435f489776c548645d37ff49489bdb962ff008c836d2bd5ed7dd1b8f8a6dd8e4293b1316894a4edbf238c6ba1210f928cf2cf2c93b52a4cf4d393bbe63f6fc10517ca7c11fc9ba7696df066c9f8e1d129bc8b9ecf4d965286c92e970cabf8b3161c7893d91abec87a4c50cbf923ff0084768c9e921084da6db2186599ed8f8e4c3e8f26d95aa661f4eb1f3e44bdb3c30c8eda32fa3a8b711636ed5d35f66084b1c29b2e852649b528b13b4659a84252fa20e3eaa0e175247a7f44e13939f8e87371b4d5ff004535564e2a71a6658ac527c0ae52d239651b492e44da5695b44656f495a3c7649b87f44f711ff5244ba27556c87a98538ca3ca7d8fd463526aa4d09c5edeedaba628afa1b62c7b96e3278da995b7bece3c155c97c098dd220ed7b24ec586094d2e37118a8d2436e9d3e68961cb7737c7db63c1bd41c198e3b229157ece08c231ff00292d6cbf62d32fa684edf4c58da5c9b551546431be28f52bff0069989ca392325da7a6568fcdb528bea87ead2e2289cdce56cc3869393ee844255688a4e2462ed992f814db8d390f1ff4ff005f13f1e5c13bddf1625b9ae5f44a371ab3245fe39224af34dbe98be2ee873c89db69cabc10f5134a9f3a38d92ba5b78a2506fa21c3699e0e8bb664ff002415456ac685a33d52cb39c229371a30c1e38243f6310b494fc239fb2a5f66f9a1665e550a49f4f54495a1a698dd2e49f3164785637f91b8b5f121e9b1429d5b4eed96d9ea9d6dfa14e0ff00d4b817e3bff7c18f2635c256fecc92cf1f9427c18e6a57f6462924fb6c8aa542544e0dc7fa8846df235b558e3bd5c5f24e53ba9336a8c535e0728a576a8cdea3c47a13dccb29f94d7bef4688a6eadfb1f43b4ad8847676c48dbc9b7462621c921cec451c14992814e2432bba6262d248972c98dd2269331a692b377d99b32cdbe6dbfc71e22bff00b330456cc99a5d4570bed9bd36db24a7c579313c98d6e6ed3f06d592319c234fc986709251bf925ca19c946d3247e0c84b6c8cbb7f1da77c90caa389ca6fa1ca79a6be97827744452db24cfc98f2ae78687c328ad242766e16915ec670c51e497024db3c97a4a5b4dc391763748b10b5bd1c531c5a213ae1f42113e99526c92aa44851a424a2669c5c270bf934c518cd471375e518272ffe0a4949336ec9b4ddd3f042da69a484bc1e9d28e3a6d7238e28cf7797f4426945257488b4ccb963895bedf488fa96fc23f229ae070df175d9b5d53e078964828eeae6c8c618f848f84e4f8ff84d6d1a13a4c53be5946d438a634faa1c25e1316393f0461236336b29eac4edd27a79124bd938a95fd94d24b481276ca1248e346f4b2ce18e2884bffd5eaea24e69b37ed56425ba16f8a3d47a9fc996e127b63d1f99cf2c2bb723036fd4e35fd336078a4f26e5514da23cb20d2eba3d37cf2c9be5243847e910c6d4794882a6d3d3d47e2c95f2f922182fa9193e12a5e0c52f8b64a52949b6c53d9cd90c9bdba323a9b4a346e72777c936ecc30fc9269fd13f84e514589a7a71ecbd68a1c058d296e195ee93484d49f22e1310cb148de6e42917a262763891768465324b6b5c2b37393b64d4de09c61db32619e251dcbfd2b3d1fa6c8f346738b518f3c9ff00a5c50cbf962b93262fc90945bed1387e2c9282774c84a951831ecc308f0a5db1baa441fc512e29fd1ea5e4da9413a7dd0a0d7324d1bdc54689c5ce49af28cb929ed5e052649fc4c33d934c936ed88494f831c7f1a7cf2ccd1ac8fdb7fa68a2ab462d72be0dd15c792d9129336264a3288d974467ec52a37590ec4656f71931b973634e26283505b977c8e1175690f84377a4f1e277ba29b63c38953505684591e8f5196e3509abbe52660cb704a4fe44e6e726d8c8db4628ad99255f2698aecc9c246186fe45087298daddd7041635cdf249d3e495b9366e4df742637427657eb6ad7b169314796c48a2c769f029b92aae4944921458a4290b91c48f047bd32cae5a6d4eb814ac76ba1cd5a4cbae0b64d27486da755c576266f57449d45f252ddc320a539b4df22c136fb546d8a9d4ae91f9236d46261f23c10f0a8f57050846bcb30c3e28945da14129c931c5c593c7704d89d8929781c52f27cd74c8c9dd35ecb2f4bd652a370992e04d68865a6d8cdc27aed2fecadcc69243b13a212d624a5b536376f9d22267fa4c5892572ec56c5c2e4dcc73e6887c93365caccd093f3c22307274910c718ffda1cb69926e4618afc69d72c8c14547f8b4cb0729465292db1958a9b6e2649d3e3c0e4dbb6cdd713e6d72fb1c3e968da6e871e05b974c4f4ba2efdb67c9f8438afa12e3451af64a293bd50ac439690aa27e11b1f8438d762b44657a2e119b25be1962b7e06abc09907cb376e4e910a44a375f564b173c708c1824b2394c4941bae86f926d6d6ed18a2d7cb828dae4c789ee4daa44749e4dbc256c9ca2e3c8e4a35439c2576b93be8ff31b446692bab172ad69c69b3e98af46afdcd589244852d1f66d451cd93f625a4ae32b429c25c346de7824dd899ba1325171643bd33647d237698aff00f08dc9b689f1c117da2d75a27a4eca2516e12daae5e08c2e159172424ad27d142ec9ff009e04d8f24a26f972f7317fee45952e98e35d895a7487fe1266e6f8a546392db5ecbe4e7f4d8d594bd97c927c0f446d72e84eb87a4b9270f288e4944b53e4a43879446dae48ae4738f2af91fcb864a5ba554e97058a6946911e592e049aa65f0592c8a3cfd18b37e58eeaa26fc9bd2373625624d32dbd32cda6921b64e378a26df8b44534893a12b62a86321b652a92e0cf08c2945518e3c5fdfb6b57a2d6af56c43d10c7a242e07176c526aaf865e9b7f85242953d1376659b846d45b14db9f2aac9ee528d746e717528be7a170f9271db4fec8e5db2e7a1a8bab1b2e87bab85c928bb139aedf1f44f27ca29f060945ca5bd5abe07dbaeaf44e529525c21c926d1097764a499bb8aa39624325cb23c12768845b9a464c6a68fc6d7e9af73d23aad1eb74c694950d4a2f9e50af9ae50989a243e88cc5f63937c796664d6d518938e49c952af16465b65cbb316284fe5bad1960a5e6a858138fc8e12b14935c89b5212268cb26b889285bdc97041bada9f93fc3a4db75cb2db1cf645b37b95ba21dd78b3f1d39d3b4ba1639fe253235b55f647968d96e8fc0dbe5332e250a7131c25366cda96d236d21a17ed5ab10fdd22da14acdabb4e8716dabfff00a8841c9b43835a5723ba42556fc89537fd36f1d3a3f0e392e51082c49453b2717cc9b37dc6e85352d1c1ef83f090a89d5128a8f436e2d2ed32185294aa5d72463b98b192c5ba2d37454631c50aedf26553dedb549747a7fb6f83235285d89594c52daad8b249bb1414a772776249748bf721b2ff009fa1f1adf258c5d7b9ad13a371637a256cdb476c97c4dd24bbe19169a38249d51b7e34858e7190935137b1645e49cd0da93eb8258138a6bb6628c54946ba4c9a719da5deb2c7b9c5df4ec75b5dfd0a2a3c2e88c6c508c6263a6c708c950f1ed4dd98ff00d7e86e8bd134fce95cfb642ece96968621ead0cbd28ad545b15243567471226f6ae3967295354ce9d1b65b770b9674c95bff0082251e0e64e9116f1afc7285ff004c6aa28ae6c92b4fecd938ab62b23d1295c9f3c10ae5344be2ea3d511dd2e1c8d8a2b817464bdb48dbb2b9e48c94bddb9229bf2ce9d6e654bec54bf421e8cf1a35eccbc50a691baf9d699bb913be89ba1b1caf772466ab964a5d57d929397641a7f29f8691271d8e8ba2934345977d892538a2306e4f974ba446b4638ee438b8ae483b4ebc1083b7675a460df3625f7ace0e4d511c728cbdbcfd8950efc097df3ed5ab17b1f62eb565e924a4a98e0e246490b2714297f4dcc925276d11a88fe4383ae1924d78172f9e88c6bb6465724894a49b4cc599aa8df07191f0cdb2ded5f034d34a870e7a1c26e69479be4582516df6430a8d3b626f768936f911962e51a4c78e716a2998e14b9ecfc75726c8c1bfe2172b6afb3afd2bf527d8c5ec44849aff009a31ae44f44e29d37c9386e6da1c651ed09917637429265d1bcec789735c11c4aaa4c87a7845df2f9b258f7b76950f1bfc8be2d46e850ae4e6d3d13e5d9c5e922969621fb1a292fd35fa9ba42e168afdb435ab28aa1def6745d92a3e51e6b86299bcdc2dac548b4589b42c95da22e0d6b451b4e49369f46f4398bb422914515fb59ff3dab47c8db13b17b168cf3aa194b759292b1b14a91bac928d747026cdc268b42d6cc73e699b6d155c143959c50d5938b4cdb244568996bd9457e84d7eb75a21af627a34514b4671438ee7c128b4ce747d7b6d8a42909d8c8be484f844d5c53149f4cbfe1c1452638f4c48926fa628521ad28e4b65dfb68ad125db4395f8628ff5fb56bd0f48e8f4684f92fdb249aa1432756a88c5450c8a43845f81e14ee992c535e0af6d916f4463911769a1a2b4b66f65c5ad3946e2d14345145697ee4bfe8956b7aad58f48e8fdb65965884f462d16949f846d8fd236c7ff00aa1417748fc2a5276878945d50d56b8fb13e065a29328da56967034254b4775c68ca121e9457e95ec7a2fd897b2c5d688bf64a2a438336b145918e9670c4b9d1a1f6559432c53629968972f44cb3bd287fa57b968ff5dfb6ecb1317b69148b2c4f4b68532d162745a650d14569659c15a5bfd685a343bd10bd974f87a375adfb370df2959dbf6346e14b56e8df13747ed12ca93e0ded89899435a23865315e94515ecb370bbfd6b4ad1eb7ec7cf3c1cf542545e95ec9229fd9d69686cbd6c4c93bd1e884c93f8ba21271762a6ac97625a589f3c968ad1b11456ad1ca1499bbf44745a3435ad97af5a25ee675ad328a45a3962e0dd7a31e88476a84a884ba1be44fa45c5f9286b45268dcab5b6594515a515fa1705a42d19d8d15eeaf63d58f44de94ce0b43950e6d916218f442133349469fd90ca845f0728c791dd4b4a1a2b4b2915a4791e945084ff9ad7b1f443b2d2e3d8c48a28dbfa5bf672514851b64b10e34210c63d169960e714d78395c323362c97c342ed91893ec8657174f942945f4c7ecbd223d1ea99626fdd7447fed8e5f42fdcff44552d1c14896171e57225a3f6c9b8e3725e18b2c27c4d7fe512c6eae0ed16fcf6472d7647246b862ef9ed892724bc58928bb2595df2b8212531a28ad3734290a4b56515fa1a146fbfd8f57cfbe0ade9295105f631e352e894251f765ff00f1e65b4432b8f29d0b2427fed57f49627dc5da398b2199aec8b5c3375a1ae082a1ce49b232dc343450d68a46ef72f6a17e8a1f1e05c9b95d0dd17637ef5c8952d1479b62e345c22d32504df1c128b5aa3d4dc7025e5b3918a4426e2f8629c327fb54fec9617dc5da12947a16469f22c9684f8d170ec739ff00c21913ef87a50d3fda84c5fa25d0a55e4524bc9fd7fa71c7ce8e4a242df2c6725b16ae11fa1423f428a5e0f55cb8a28693363fad13a2191c7a629c25c4b864b15f4ec719448e46bb23345d8c8439bf63fdc996596596597a5147637a5fb52b74255a7fa91d212b1942bd2862d33dca4ebc0994743ff850c526466fc32338cb8912c57cc794550b238f6292909d09eb26393b2b57faf92f557ed6ff004638d2bd26e91054bf436aeac4364b9b3f1a278df862c735c9283db6c6abc14b552688e471e991c909f12258ed5c5d9cc591ccd7629a7d337b14b9d1c13fd8fb17e86e84ecb43d38f6a8ee696bfee7a457be38d295e937517a51450e368c98ad70cf945d509325d0e56f4ba165947a67e58cd5491f8bcc5da1a71647235d90e559746e5fa1fb1f6c5d210fd8b468e931fbd98bce92ff002cc7e748f5fa727f9f749148690df2349323d68cf0464d3e18929c16e563e24d7f48748c84672fb3ffc4002c1100020202010401030402030100000000000102111021310312204130225161041332714252408191a1ffda0008010301013f0012c3f06b142d78c9d26f2b8169d1b441dc53c49da4c9bb93ca8a7b676ac53c37ba3f2724d51d37aa12b6376c5438d73c0ddbf82487845d8d61bc6ef0ce94aac94549128b8bc761c0db1e7d8d8b29784d5c5ac568435b19d2bac37f4b456108f7890d95b16cb3923c97aacc65716a434970fc2d16843c3111c5a7a638945acb204674f7c0e2a4870698a4cbc21e58b818848aaf0925cd0d68f433a6d38d662f635189f49542c7250de12a1a38c2cc7897f43c2ca5625432871382394d9699dbf6cd36d8b45b3a73a74f82afcd8c4c5b12382fc1915a6cea43fd71d3d4b2c766c6471636c62499a487b686455f84791f2fc1a22a9618b0d27e0d8b62d31f8a3be4bdf9b195a225d177e36c7a8a1f0871a9bfc91fe4b3438e24ed8b51b1b34365aa13431e99daa8d245e6dd8df7165ec4f4268a2cb45d1262cd8e4275b22d486bcb4fe04b09561639c2d8a1f926264a298a290f916b12acaaa1d1659b36265d889142c36885c9d0f4c42b121b1b2934336278b1b4f0b8a1fd239e84efc1b13f911ce138bd0ed3a381b16196acbb170c62e04f67299dac914eac5b88d962674e5baf0ea688a6c83a9326d5a788891763545e2d1645e86d157867255a3b5d2ae44992745e2be654292e5243714adad8e4d8f2cd8bf922893b145b8b65d322ef0e362a4a86b428134935588b5622f125685a1476d9310951671b1bb1126453c23b45c8c90a3a38a2c9375ac2f0af81668b3de8936f42b2cb22f34af1da3e291dad89578b438263850911b48ba13645ba97f586e909f7904d3da1a4f82b12d3c58a4ce36296d09a151265278f458e43ba159bc531e5f8323963627b2cbc558950be5a287122b4509223b957e1e27c0b4d61de3ba86ed895e11ca12d8c521e1ba427ac7b1ec4515894533b18d579450f0c7e287f074fa3ee42edfb23e9fb23f67a72f44ff4affc5d9284a3ca6b2f2dd10fe712ec973428acb3b4d09fa1c5ec4b45158b1089588970217187eb35e4c42cbf0d6684863cc7a6e447a6a236596c5264666a5a68eafe9d3570e7ec34d65123a7fcb1cad8a92d62cb672235650ab34768d685c8e848650968a29a78b2f12d2f18ac318f2c5e365e3a70eedb12ac3f152a14aceb7454fea5ce1e36c82a1e1219432f5849b1268518be5533f6ebda1c5a1ba3b98f673852a3929a4292c5e7b98a6c93b5e317426b0c796bc5e62ad90551c6fceda14d9d6e9afe6bfecac213c3c7dcf5962d0a4dae4d9eb126512d3a1718a4c7122ad14961acb4d782c5785bc35f0558bf4ea1056937ec5d2a9fe30848edb3b0ed634561a1e853f44e3daf2b08a3928ac343d911f38958f458d5b285147f963843e5614ae427652f0a17c17f07e9a09cedf089294b75a1e1368fdc71e55a2138cc48ed251c3c38d928d13dc50cf659762d218878b12a588f24b9132d0ddbc2c5d222edb63950e4dbc2147b04ca69552650958d57fc2fd3afa17e49f52a3da86f1da2517c92e9f64ad109684c6d58e36388f4593da25c0c6cbc27978af6c4f67044961ab3b4a4561ab231a649ec8b1e1ef0db8fb149bf47d2f94492ad3f0a2b143c28d94312bd0e2d7847e98457e0e4ed2b3657b45b8a626db1244a3689c68ba2c9b1e1884c4310e3b1e1ed090f5869a2c5878b25c918e8a3d8f4cbbc2524ac52d9f4bf4358af248fa52e589bb1f386ec71f6b3d2ea4a51ed7e88af06462ca26882a6d9fb893db3bef81b52271a2c9723284495622f3f71de16e222956c731cdbc69651435624d6392af36f0a7f7449a7c613f24da2526c438e17058d63a2abc2f11dc50e3243926b646a871b1c3abd37ab6884d4d7e49bd32c93ca472892228e04cbb598357b63976e92a14b7f81af062f0bc228abf0ad1af868ba2de3d61f04236c8e19dea1c8d7bc46d1092e193e94594e1a2d8a7aa64ea32b47565ffd24f1c086f6290f659784cbc265a68b2ed656ca168bd8c4f17b2e99ec6ebe0468794f2961718674d684263638a92a3f72515bd8a519f051677fe4bb1c6e389ff1b256f672359f63f545e10c5c8f42dd91a2ce4e178597858624558ca7f0d8de6bc1e590fe2bc1228974f5affd1753b6948b52568945a2027b270256dd1d48c61d26ff001a172369890d517b2dde50b0c5ad09159ac5aba1d58c4243bf0e2c4931fc5596b2b0b1d3e3c222a3b7ecc708c95490fa7d89b8b1f5bb52b2338b5684f81c95114bb9c99d69b9bfc23834b0dd8c8af0431e562e8bb1c92fec92dac6d08e06c5e9e28adf8b122bf3f021e385843e4e9b18b284e8b18ca56593952db2537254b8c3f0978551785b2b44791da794847e45c9484b787117c0959450d35eb17af143e05b632988645d3c32321531a3684c722f12ea28e96d926dbb6771631ba2ef178644962c5a123d8ced6b3ecbc2b7e0d53f3a6c6d475485bdf6a2d7d86dbf863843e73d37686868fd3d4afee4fa2dd8e0e2aab0e497b1f5521f55c85878b1a126c6a90d571c166ec586b115e0f6316ca2b097c571fb0dd8abd8dfdbe55c0f309532ad58c837095a21d752fc128b912e93bba2504f988fa517e85d081fb11f43e9225d06b87638b4f68a6cfe229b631b2ade8691559716bd0a3e3229a74245097c6fe0787c210f2864686d3fef08e94eb4f81a58977c96968e875dc528cad8a6a5c1244e1428b6c7068a3b49457b1f4a3eb44ba32bbe4ed7866868add896d94aef08e7c6b2d15f0df9a1e10f6c43af25e1dc39396ace8a8ae9a6526ed229a137ed919426dc6d5a1f4a2380e3454bee5499dac69a2508cb944ba36b4c942517b450d3c365a1aac515865b2cb2d7cabc9e11496c6a87e0f0bc1913a77db4f814312826ed8a097045b4f0d59da34ca259ab3add255696cee698dddbc28d14ecb17857822cbf81a7f1abc313f078b2cbc417734849b92439ae9c6e4c84e32569d9aca28a2b0e299280d51126ad1d485498b5268a2beccfa8bb2989e3845dbf2af1b2f0dbe13d097e50e5f85e2f3c8b0fc10fca13709290ff0053d2aba764fa8fa92b621b7f71757a91e24c5faa92ab5643afd397f9532cb2cbcc90867563f4d9354d33963c72769bc699da5311659685f037fd0dde2bc1f82c4be1acd610f0f16d70d9df3ff691dd2ff667ee496bb9b42fd476c1511eab924c4ecac75bf8b4354c476b45bf65979a36279876b97d57585c0d8be579597f25f850f928653f0e9cdc7fa23d48bf677225248ea4d0ca3ea5f91bd623db52b7c2d0b81ba42cb8a1c4a23c62be6795e2b29e1795782455090c794cd9dd2fbb2e5f778a251a19567694f0d59c1626362f0dfccc7846b2fc395b584af359e47112d3742d2f56fc133b50e28ac462e4e8fda9fd8ec9ff00ab21d06d5c9d1fb71893564a2d1b485866d1652c5965d95af0a3d7c6fe3d71b35a76376562fc22d96bec73b794bc2bef8e9c6b6210c6892125deacea46328d3249c5d11e10c59a79486fcb452287e6c486ab0bc6b3cfc2b79b459b28d239643a77b6310b0c90f4ec94efd938a69b123b62e336ded5522a515c16218d1daf35e17e0fcd94dbd0efc2fc6be25a2cd62d16ca6c5d393f443a2972344d084f0c90d0dd3d8a58f65a64fa571ee4b29acd783d66cb1db652ae737e0b9277428b7e08bc5979b2fc52f0d178ee688f5fee467686c908586319d48ec69a14da2df226a90fa8c83544da6f4b11db18b158966349db1bdbc3476ffd8d2f26af82428fdc7f32dfc12788ce50e0875d3d3d17842658f1d6754292638df06d1166c4f45956c508c5724d508bc21a28af0b1b7f05ba1b4b8f9d6bce4e9612b24223d57123d48c84cbf0eb72684da3ba2caae0b2c69a2356365ea8508f6a251edc263161a147e37f1257ec6a8a75624de12f81bb78eed521e39c47a8d72464a5c3cb68ea3b7e09b4269946cd1b2cb2ef447a5d3fec9f49c5dae0626292f82fca86be05c8d37e8717f63f0be19bc2564b5e7df2fbb3be5fecc726f96c979293429a1d4869c4d16d09ab1489f5755e11e4af9a8a2b14566cbc255e6dd0dde3f8c70c5f03837438b2b295e1a149a14aca4ff0768d1748bf08e91d28a71b7e0bfe0de52f826fd622ad92795f02638a64a03831c6b178e70a4d0a5f663a653c562b0ba934aafc2cbf35c0d0fcd2b1aa29fc0dd2cafa6387e6e6da4a969623c959b1a521f4c7118be97672ef2a4d0a48d158487c6179ae3c170318bc5f2c4e8ab92b17c13f585ca27eb0fe18f3e516f0d2cbe70b117ba1e98f1211ffc4003c100001030302040503020503050002030001000211031221103104204151132232617130819142521423a1b1f03340624382c1d1f105e17292a2ffda0008010100013f024341ba274e882769d391a890ae1cbba2dd7f4ea1140c9011c39745080d4e0a0a709c9e2f1053816120e969ec808ea87a15fd82a5e6df4957da8bafc26885d53aa01ba6f1569db0aa7123f4a2a8b6fa8d0a1050ad4138e43539a0b7d953318444a2d52dfeba5469dd38e9929e62188efa448d009384e302d1f442b7ba38273cacdd1d07234e728f6d080b28cf20d1a11d91d5be609b84c25032ab508cb7651a0d00d256542d9a8145b29da0d004374ed06b3a91a1388d76d7876df507b679365ba7266426a234e24479a07babceb44f4477545a6d4420d80ad94d6b5ba3cc04e32a3504b48210e2bbb532bdfb3501a3df60544973c928754e30bf8a83042a9c4788c2d60ca87b69fa7f5261901118551b6bf4a400979e889932b7c68d7273644f55e86fb9e590a55ca514e0295b04196ca0e71d9446fa52a17d3ab52ec3072ee6353c9ba221374850a3490bc404764e721df43b2a63c882d8e135e8195568c799aa1469d15abca15ea4943d2baa051cea069b1444ab42004a3a8d1dbf26dc9c27acfc6814271cc68e4c30e4ddd3c695e3c274f2533e709b4438dc54229a2511af107cd1a311d3a69c2344fdb47bc354baa9ca62ea515fc3cbc9270ad0361a1a7d94c355421ce90864aaa40160e9aef9d18fee9ccbb2396390e8d306539d719d2e706900e17451ad36ee790ec8910214681ddd16f51a6fa7d96506a216e8e1356e506f900437454c14c7ab93e9756e96808ba1171d421a60494756e743a14358d5fbebb23c940b58f05c4a06544045fd9373a3822dca6ee9e4464a065577f96d4743a34b6c07d96e253f05bee9b84f2364156c316fcbd136848938fee9a6cf4a75772f54a636d0829928eb13281c695e9f8671b1d0ea1d09dec82bcb63dc22ea6fdc19e58c6b129ac92bc383bab022c8d2a37861c108ff005391a0060e42a23903a1435ca234ba0ea4ce1536a78430152173c284f8f320438028840c2a6f0ae4fa3396ab8a95850a390ec343a52dcf238a1d50d0e8ed76d07242654737629b55f51ed0495086855b3a557ba42b88982a795a669c2a7599e1e4e42ab56f77b2655696e7741e2f2b655f3013690ea8b1ba04d0d272503459b235bd93ea91f84ccf995312fd3654df25df94511050376ca98c6b5d97308d2250477d251109dfe9d33f3cbe196318ef29b95405ae8220e832b0a610c8505423b9f95250d19443e954797411b04d20a3a423a41e4852a0273575454754d77455cb1cf1603108ae199fabec9eeb6993d7655170a1ce61c625785888554786e84d79694ca9283b439d1a13f086ca34dd7ca768130ca2142b542db52899d00ee8e8393a69c37a8e8e310823841155048d61363aaa96cf97b694b7569b884ca5ed2bf86cee8d073729b56dc1d2a7944a73c9e4b6f9c8c654a1e6202c00152ea9a25577b5a2deabc40c3287114ec93baa959d50aa0dfe58f74dc044f9e35aa2d7b87be9079256f44fb143905a1bbe53dc5c73a0dd480a10c2bcca351c542a9e1cb6cfdb9f9d6945ed0eda5710287887c0302dfea879b72a504f53af4415d2ae086c1175aae1d916ca22d442d960a680ca4276556a97ba7a226e5c2f12280703d57f1ed244353c36afeaf32b0f54cf27c263f929ec9fba6ecb6d01844eb25377e50c2f203449470a42719d30d45d286daee341ba7e9c27ac8f6d2bbe4aa0f0ec75551351455510f3a0b809e8a75a351c01a236794e854e36d5ec137261909c25a5385a6350a310ac54990f0884c700aa71218d86ee854bc9b93c635a23f96df8d2a197841c154e218d6ee9c6e93a7451c948487b7b8e48e4e9abf65d2574e59421420891089951a9d60a880144a76e9a8b1e3d4d30bc38f745345c7d939ee76270a150e00d4a65ff008555961b74a7692c24c7957114fc8c7fd8a730da02a4c870b90d41213585f71ed94d30899e599509811e4a351d49d735567f88f27485b22741aec8a604edf4e1aab5920f5ea9f5c1f2b53d49b653abb9cd0131fe51a402b8a65ae1a0279291b5e0a6b46e54685ce6abe5f6adb2890aa904a1a40d5b20828856aa9b8463b691a70e6ea7f09efb05c531eea84b95475ad944f20213f4194c743c278b5e4691c804a2331a07c404f74e0277443987d384d32d2a60a2d9ca6e0b555e329787e1dbd170c29bdffccd9712da57ff002dd84096a84c19478aa54a908de156a9e2389d07a19f0a83e458765604f743e98f75b29d6ad2f06df30323a6a3902ea8189d4f284e3a46a0229a811d96e57843ba7021534e4df4e9c399647651a717e86f25aa1007b2a55edc38ca0e0ed918551cd4da4e6559399d2a10d944a6b5c7a22c726bba3b408aa4e0f6c7544275ae722d8cead52fa66e614fa8e7ee552aa19baa950d43eca39211d28b45bb275169f6559be93f94cb732ad0adef84d6b4a7881e5c2bdfee879b74ea646464277fe1047e806f2051a15c3f0fe3dde70d8087559854f184edc94d7c2c100a730c9c2ca28e80a73a75b4bad03b20d0c101121a8beea931d5784082e2e1b230170ad0faadba213e2e31a4693cbd50d5c9ba8128a2d5b6a113ca1ce521d84dc35754ddd1545f63fd90470b8b386a00bb01780ff64411ba1ba80ddd39f3a53a7510627faa98d789ff0053eca9346ea54a30535b1acdae90bc573c4153d138e14a099ea51239227485d54e10ce947d2144a73422c83ec9a7cc004fa72c9eaa9132ad29cc7349c6132044f556a731a7708b011e42a0cc2b02f0a7aaf0d16c2dd06633bad8ae89ac73cc35a49e68943780a34734b40776521f84e65b94c9543c2f0e30b89686d4706190ae1b14e8e9ca012709adb5a3ba30d12554aa5cef6549b8b9522c171776c279b9065d0180dd19d7747922207212a5140a2ba26eda4a720a9d2f17e17f0f4bb2a945adeba36dd3a20541951856c7553d93bbac2a5c45982aa712cb30aabae2a8187fcab53e9dc158ea62e8fbf644e8d304154a0b011d5423fea8d1f51ac74155df7bd31e5bf0bc4074dca85b2ca841426b07656899469b5dd13a841969413b73a346a0f6d08c7ca1a0739bb14ca959db225d0492aa7454479d4c04d81b68ed91a3766578859e5a9f94eaac037470d1ee855720e6b828f7d1ca11705be542a359d41d7379db840a67a82ade96a635ef7794657b260f2fdd13006539bd422a11d46ea853f32f955ab5f81b202537d21754532a596968f3754741a57f0e45808c6da42bb25341255ba1ca7682251588528194ed785bb23a23808b4d507a2731cd716e92b742dda15d984df31f84e6c977b0e42d8394746537bb60bc4ad4b05537b9ee6ddf6442accb1f1d34f0ddd970d52d65ae053eb760af00e5070395c5343a110e2d93d10129adb741a90a7a6ad74fce99572749d95463dbbe8d225621128694f3e5fc681a4e02a745b1e6c9500230e781db29fe796f50a961c8b801253012b21552fc93f6421cd05556788c23af4d1dd346b48cacacf54efd2aa074e131b78cab5cd5282233a008355a50a4a10528bc9619dd7035295306775e133897bde1d0116f82e7b538e5300cfba14bc494f69a6e83c8c01be63f6546a36092556ade263a68d083ba28d6349d1cfbe27a0d18e2cdbaee8a6e02a8ee88fa574e718473a338771df0bc3344487650a8e99395e24ed2b13efdd3a9dc7a230dc4205bd959d428b1a9af2d32bc56918df4ea9d8432e84e110a932f7c1501a9f6bfc9ba787537b4f4e8a6402b8a6cb67b2a0cb892a142385016d908d62e7e539ec2c2a90ca8d2722391e3aa61404ecac84215cae9d080427b6c711cc3ba77ab1d531b6a0a626551d9cfee89fe64a7e0c8eaa930e0bb7d0a0dde531d63cd3fc69eaa87e51f514c1251421bac2c0d97dd39a014027092a9f077d17be7654283aaba02a7c2536b7cc2556a54695373adcf45b1473951a6eae20e136a380c14f7cb7dd7454bcc15d639710cf11a1e1368bcc6155e09d4e907fe7d906f53b27192a350537cce011d764501a52a4ca8c203497a320e426980e11ba217898d2ec6804f29ceb4bc21077210ad2e13b2e29edb20152a8bbc8aad48c054fd124aaa3cc4947ccec264b555f3441d49ce8699f05af919fce8f331ec215070a6f9289357d9a9a0030aa36e042a156dfe5bfecab7a7098ff0dd2136bb0ef845dd93ef1989590fceda427d36804a060af14a738aa7be8ec34aa67109db26365c8614a9404a217541714df4b942c690a17b2070c3d8c1d2e0d12554aa5e7d952f47dd1192a944c152869dd719ea6235ea16c4a6e32ac10ad20a63b395beca0ab50da13e4c084da4aa0c81d34dcfba15dcc6160eab83a8c66e554e337b554aafa9b94d69a8e0d4fa74d97d2f53e4427b2201690634e89b07e5422bf47dd32a1a6708bee712a9558690ed9527063be42adc5f88c2c03e539d71851cb43d69ceb8a8d272b1a14ca8f67a4c2f338ca95746b1a030b7e41c9251d386a64b93e835793f7146d7b610635a13aa764530dc33ba70c6346073fb610796985735ac8b45ddf4636e2021f0bf5fd9155db0e9eeae3a06dd81ba636004506c60e950bb66a7dd66837d36234779b1d349954841d090bc4f301a1d18b8ad87cea349413332d57109e493a538b42ace97264dc215e5536c0c9ce85712ebaa268eebc9df42729b48bb2535b18d1e40125092e1ee9ac84709ea14285908c742a870eda937155878754c198546aff385477f90b89a94df4841cca7944a9c29532bf4393f39d184da553a9b029f41cf718c04ea562b54c276adc11a046251434ce977956eba6ca352a0c4a0dc2f7d2674769be9d146152ac2dbadcecbc52f7fb14410e84255474e820e14da1792a35b9829d4e7d394ca2e83d0a74ce775ea6fb8d289fe60d0d48ad1a715e96fceb468d8dcee74685546c9dad41e7286fa152a75070a70b2a9b25c1c7a691a05581a908b4b775d743ad3c3a554c128683467960a1be936893b27f10e21d6f7d0925041d055360754f6dd60685fd1bbab3ab9521e644a94fa0f732f8f2b53621615d76c8e9e2b86274353c96fbca6ba32561cc394c6ca8553a2cda99b105441f6566547955b0e62699c279f39f6471a3f65d3485d3465a3d49d1d35828850b65ba3a6e8360494e0230bc4726ba790e8d08e942887799db20c67609dc3b4cc60a739f7194c727ee50697fc28828f99301dbbecbc2753f34fca69b82af49d97744242216c51e2bcbb657baa55c1c39710f0e303a68d8b84af1a9c7a95278aaf31b26aabd028c684c27798c92a0485dd674eaa74985748f6d1a7270bc4570de5020ca3a54682d3ac4a8d5e2434fb6b284b8a320cc61533808382ad59af9a7d3ba2c2d07b774347694ea5b185e34f445ee726b6d4e59dd4985440f12e79556bd3b0b188ee9c3a2a6d4e512ad5002fb223dd35b7ce6165bee347e621021a99bbbe0a932b74d3a7405aab875b7b7ee9b55c7b20eff884f7b7f6cab9bfb15fff0000bc472c696484da6d8f360a34c5e402a1744634df95eef28528a0743cf4aa32c68942a073f746a16f44e3e2c94596e8da9634853274a36c6908b9b9ca76e876471cf1e5065708eb2ae7ae16cab71135046c178e2df94d75b28bb752ae52a54afbe834d94f552bae8c31a79d85d1b273dced4727fd31f29d12bcba521bab6427dcdc2671103216e98eb5791dec8b47ee41a222651dd04c29a2347141b84e5b39150a9cdddd1c08555a2d6a893089e90814c305384184da772b0041d011073889d28faa15a672882153613b2c8c2a261a8665784d635c004c606fcaf0dbd427db71b556a629d8828509a8b1ceb7cb95528d5a593b3935972b661bdd16c4a75270131f6d2348e5088fa01650ade4870544e484f7e63a23a35b7382149a3a2885e27f324952abfaf59e7c8d94a356a3b771d7a2ca2b75b69d976d371aca95281531ff00a4d729053c41d0e14ace8137d0e4fce74d951fefa56a773546929a9c0ca6c8727fa8a6b4f654c6320614228ba5da3d14eade56da0023db74e3f954dd0a64a7e7ec9d984e0014f646426b70b010d06fa3a8b65406b820f6658ed81c279603832a9111013a6fd953eab8732d4e3e62827173b0d09940820a730d5aa01d8055385c7902b4e9c25a5fb23440c8394fbf89f2ed08537f41b60aad403694cf99341ee9afab5411db74fc152982703729d2a9da1cdbc18ec9f6dde5db56a3cf12546bb6874060c85fc4f708d473f609ed82bc421b6a267ea4288e5df4cf395f3a871941c610e88f9b73f75b23a4ae88266c7e34883a52f4a6e511e52a5610694021ba2d94da7d4eea10529eeeca7281c228a84ed1a6188ba4ae813b22740d746e9bbc152b74fb9a9b55c3aa6bc3c02aa0f302aa743a33d95c6e4cebf09800d9546029b48da110404df1dfd202a6cb5befdf91be53210aaea8e894db68cf546a1a272dc1caaef2f33dd79804d263ca611992a10df08e4aaa2a794bf481df463653b18e71bf21e50db9c020d0d10156da3403af21fa01675eb84ca05dba6d060e8bc31d9784d5e185fc384684642b602f6d0044fb21a85d0e8e6c9dd60285b68152f56a06534d8e5e378624653f882f61681ba8851192a4950a1121b9420a29cf6857171f64da41dfad7f0dee993001446163aabae38d938e84f9401a3ba261b99a1308b91ce50c216d4105783e684d686ec9ef00af530fb2954baa82994c919c280134071d645c075d2395954b0a350bf7552a5d0220765599e1ba2ff2fb20cfe58918476db4184c392aa938cf4513ad391947279c21a741c83463a1e13aab47ba26727e98477439036553a4a35850a342c69e89fc3cec8d27b564299e405044762b74e892a54a8d297ab46af48d93b3a093844807df4056e8b0af05cef514da447ea469bc9df08520de89e1642a752edf756894f6919e8aaef0bd234275265537d87d918ee8e4e8c6b9e309d4dede8ae84d79763aa1d9665533e6cedb27b1cd7105536130153a5193ba2a30a98f2eadaac353eff48ecae3b68748d250ca2d1f442d868365d51e4df43a4ca3a48b623e846ad626b106c6b0a1428d61109d44393e840c6b03dd111086104708c108a1ad3fd47fe2b7d1aed0b46fb227a35477d18c2f3014b2943772be555a8011892983ca35f0dbd558c3fa5399e19908567054df7055fc959ca54ae835eba4ebc23bd4115519fcc81f2a40f2b7ee553f4fdd546f51a35aeab61bb109adc81a75470d54dd88d2bd4b5bb48eaa4cae1eb8a820fa93886a9e72a73ca77d022a7e83774e286a4e835254e93f48681b29ac4d680808fa3088d602ab467288828147281c2185d27eda3b0a565043d0ff0085ee9a80ca1829f45e197fe9953a4126135a2933fbaa2db89aae1f09e6d6972a026a4943d9062b137cc6139ae8f2ee980d82edd713485b78dc26d6000eeab7f38b08118dd39b047c284084492b6e493a50c3a548704f05db7dd1a6e6aa3fe9fdd54f415428f88ecfa428010786bc6ae3253411ad4a4c7f44293daef29c81298d2e804fb952ae572944ce871a420d719c6dc85051b9fa81d082ebcf1c94981ef0d2e89eabc3cbf3e9e709ac94d03b26b547d3850a342155a17642220c1d01532876d1d96a0234281f268113a3aa1b434f447256cb87ff00513bf98e8e8a939a18d55439f81b26b0b1dea12820161099434e23fd17a060a6be1542dba9bbf2aad872d4077479031eed9a51a5507e82baa6ef85e66e1360b022a9f555765448f0842a95f1e4fcadf3d551aaf888c2851acaca68cb89c4a6303237d91a1507e92ad2359214ca3308218cc263da1f24797a84eb671c8343f4023c850d4940231a3e9f866d907e34692c131be3484799a13428faf0a1150abd1904e93d97f7437d918ca3b29521364ad869384e3951ab5a5db0429f865bfd50634b67b8555b65b6e0285c48d9c151b8b65da16c04cdf3d9744d716cc8fbae21ef7e2d30158efda7f09b4ea7ed2acee42b59dc22d693bab59dd1c1432a9500cc9dd0c2955981c27a85203a07dd1cb536a16fc26965441ad08851923a2a0f6f869cea454a0e9289217899f644a851c8fa6d788207cafe0811ebca7f03502fe00f57ff0044ee1dd477dbba29870653e9bdb1f0ad471a6da0faa54adf526795efa4e0db69c6114da35aa3240968c2cb4af02b06dce690253b7e5098d43598570577641c50fa442b542217114baad94e8dc8cadc279d18a6514728b7aa18dd536def458d222150a76b32ab8967dd6c21713e81f2a8d4b99ee15617dadf74068e0e84c4556796d530bc7a9dd1ab53f7279702d21c634ddbf08ead309954541be74c754ea8d71b1a88695dfe0e94a8464eea347b1a7d934167dd01940bc9f2c269214b9ca23a239434f105f69ec9a419f95d975d7a2201c1d8aad4bc374744c6176c11a55846178357f621c2d43bafe0bfe6bf8367ee2bf816fef2bf801fbffa2fe00fef0bf807fef0bf82abec8f0b5c7e84ea4f6eed3a47286947df508f3c36d11baa1c43a89c6d330ab38f1950963721b2aa71355ecb1df9e41a04d1a9504a014a0f41d3f54a7b6556a761d210fe9b68428d2d0023d135a0653b6284920154e98a6d8ea56c174558f90adc05c57fa7f74d7bdbb154a6a5504a84d47cc50c271eaaabaf7b8e855d8857263fcdedd55b0e209db56d2715e1c22d7774491f2a8fa914fd9df08029953ca2775705728bf75684e3698541cddbdb4982879828474ae7f99e95c2fa4e9d796a536bf709b0360a397ff5a08c69df534d8edd80fd91e1281fd309dc00fd2ffca3c1d707d329bc0d63d82fe06ac6ed5fc1d468e85556b9b87373acf3c75d0a0e236c29254a0a930bcaf01b6a2d829a33cf08e107a6d440cfd3856aad46e6a736d2864aeca56e365084ca379e89acefa3b62b866cba7b6874e28f94054b8801b6b9567f88446c34e1dd0f4d735c6341a718ef4808656c504f6c01f275765ad7fd8e94e95b93be981b94ed93a94b07ee54bd5f645627eead569508a66da571b14da629880bdb4a5e9fbe8468f8739c3a82a891716af7449015e1033c835eda77d6208503ff009cb1ac69f394fa6da820aabc0b8659e64e05a60e39828ea51cf254aeda94a9b2c00b46fa01803aa71f0c58d545d7304aaac1baa631a0d30b1a95d55c535ea7e9c285c5d2fd48219d02d903d1472527f8673b235ae7b63d2a57f114d557f886741b6bc27a09f753903471b415509aaf91a377d1fab04cb7ba0bc561ea8d568db2837f51dd3b3a1963f09f531b2a2d6c7b8d3a68ed90db4224843be8e36b4954763a94e1151eff0065c313e21f744ab84fc2e8510338281f7d7aaba24a9db0ba7dd1eabb727f751919e6dd6da405b69568b2a887055a8ba93a3902194e33cfc3361be23bec994fc474ab437f0aa6d0868116caa8d7b764093fad0f17d8a0fe87054a70d0141ca7e84a0e40a2ab32e6108e09410d374d1050d5e3ca56cd1a788f8dd15d10e46bdcdd8aa55dcd27b95e3d4fdc9f59f51b0b2d3a6df284ca7edad3a02c6ba72ab320fcab552a71e628a1d34233a03e152b8ee536ea8f12773abfb6a4c184ea81a31ba65789072a4bcc954bd28b80dd78f2e86a715d0aa40346160e1068071d94340ed95993054e4fb2eba3a41406e10c1dd7bade0f75d02eabd96358fa5dd15c452f1187b8d9119e43ce0176c9cdc3698521817881cb73a8d0c754fe19aed91f1293937889f2d46a32df334dcd41c1c139029a610281d09d36d0e928390321155c4547218432a74929a4857c91a54a826de88f75bead5b2953a8a76e5cd9f8513ba1e9d6343e9d3c279e8a939cc16b86154878856b9bba881a0508a27a27eca9e1e2742617552ae8ca7b9c4e7b20d94479ca010c14f65dd55842bae4dc8941d84fb95ee0bd5055d390881ea9f65199f6cea06ca373d55ae8f521881a1dd745edf52615e3ba994e5c553b2a1ec72a3e970a26a84dfd4e4f4c6112790208b507c1846da821caad1b3e130bd991b23fbdbf708190b629a5374b94ac6a7919a719feb1410432a392f30885b2dd5b851054f44ec691a6135c6113714146af22546135a30b09cdf29f84da569442e9a795d9ec9d58018dd07b9d29b9769d4afe25ebc41d51a8d0a9a7f656ad8844040ca0efe6690b0dfb94fb63d9344eebc5217883a85e5e8506c64151dd9f84e2e9ec98fbb1af4d7b2393f58ba3aac7f5ea87c8476552832b7a8fe155e02a372c3704423ac693af09ff0051dec8fa0426fba71928050a106eb529ddf2a4b4e426d4070acb66cd8f45218ff6430514d4d0a11d0140ea42850869c566ab9411a472ce874940270c26eda4add0127d912a9593e65b994746b6510ba26dd2401b854e9d8dff0092aaeb5bf28e72154ba9bb0705071071b15e238eea8c653db29ac01186a246c9c0b71a75d297a07e51c94d0bc155e033fee549d329ccb36d931da3c973cfb2a19307a2b57863ba348a2d23a292bc4721554b3e0ebdb9b6d31acca95705bf2170982b78838947cdb7db49f741caad0a55b710eeeabd07d2741414f370a2699f72a2d4e2821a01cafa61dba750fda839ec4e6b6afb14da45b83f656a68ca01144a9528395e81950885082386929c4b9eef9d0729e51ba26022fc2df0a2708b44357b0471e551a4656edf74ddd330728a636e4046cafc239dd78aea4e23709cfbcca6eead84da6e4d0aab8369fbca9248caadebfb2a847963a04504d617cc0d913fc81f1098f7e02615b2732a55df017f0f1b128ec9c1eee9840bad54ff00960c6eb87cb9ce71caf12ea9036594c98ce97b4ee15ac72f0fdd58e4cc635e8baae9a7653a4e9d13bffd2b4999ecbd90eda144f9655cd3d102de8e423b8fba3b8d9741ba09cfb7a277875db6b9711c13a9e5be60a39022b87c536fc276dc92a54eb2a5615a11685b68c1a3ca7395cae572ba107fba6540742805c53ada7a81a11239a3406328b8b901a4a3b4a677d47b05d4684e9d5042a39c40f7d2a54b41ee807bb75194df504d64372805070b88916a1e5d0099cc63404c4293184dbaa8cf454d801d2e952a740617eb2ad06efc2cb534da4142d774d5cc338d9531013a5a578a50ac81c63ea1c84320fbaba10d4b9a4650f0fe17860ec559ee13410514dea8a6c4ec88ec642e2f879fe6307ceb1a1542ae2d574eb2a74952a54ea74841a80d2a6f0ac560562b1415b263fb26bd6fa714e2e80a10e5d82bb906908654aeaa4a3e56041d76804342ac62020eb9bee8ee53748c26b4eebcc7d953770e038bb283ee3946de8a8b205c539d0a632efb044d94dce3ea3b2739cedca3c81154dd02103e64374e7590838112bcbdf4370cc2707dd7029ad8680ab3807c7b2c77430347d4e89af713a3a3aa8a65785d8a648dd053a3cc02ae19f65be0a66df49d1112ad69ea8320efa39b3909bb6741b9d1fbfdd0db1d9026ff0075c4f0a1d2e6087756ff00e9111cb4c4346875952549532a3df4074ca843576eaa54b57884fea4df13a43935fd0882b08b544209830aa602a87f988aca944c68708ba02104cac4e804aea8fa8a219087b220ab7427ca1030b3ba158a24b8a6edb651d81d009d95a5aa9dc4aa8ef3650308998d3c5c06a9264a158363cb2512f7e5da1454268b8842d6ed09d0e561e9b68d956b4ee15adda106b4744465aab7fa47e5088107a21b2b19504f58551b61d6d69e89ad0ddb43b22c7f6573826d53227aa953a15831e5574edd56df47bab1cbc370da13458dff0037d25d72f134db47fa53320c764e13f30802e191f7557850fbba3bbaa94dd4cdae19d5a25c10e5c05e213e90835fd500a340e8305360ab55aadd1c7ca8eeba43bd3fd93a9449b41f84db9a7784ce203fc951aa4d3eb2deea651d29fa171061ab724ea11df4779954110d518940a928081a36dbe4eda3475d24ac14ef48f9d27a20a216c99e60426d188bcfd93a93a9b2e8024fdd1040b8aa552e67b84f992a9507d6f484f61a6e2d3b8d22d701d5373a092142856af0dc558d6af0da516c2a66422d9527af26ee67cae2249854b65fcca9b7a506bdaec2e2331f40e7a234da7db96d89503b69fd94a9e6ff00daec829d2a676d8210ec140c3a0e813f654baa3be8e5c45135c000e47755387ab4b76aa74c3ef9786c09549b99e5944c94c8d634acc9829950b307f283d074a8509e1382225071a463a22da757d954a0e6fc2a75a3c8ed935d63a271d34609404055df7184370390a1119575a11f314dc2708c8d9372e44e617450a13b68d48c2e88c74434bb4f17a3440552ab00a45adcf5f74ee35ce2d9e813ea9aa23a26cb36444f9bf2a9f11e04c353dee73893b9415e0c4044c12adc2690d69532340b2765099909cdc26fabe135d29d82ae9d8218194764d645a53ccb8954998f950baaacd969f6e779869281f2f45785781bce87e86ca79b6d0941af694e64a2d077ce9b94f54b64edf4721ba0571567ed05cb6e6ea9a50d665144263907a6bd5e251b4e9109f4ee10887d2f84cab29f459536c270733c87a6ca93ae62a2171153c367b945ca0a6a197a38509d94f3d131bd7488422765bb96d09d0753a0251cb5415082e9b28274665b0ac580b33774d90201f94e12a32a2026869993011ee8b766fdd1a62106ab554c4267a023b2a03d4138794fc69083650006da085570cfba68954dbd1546dac26553d955f49f8e7a9b81f9513e623caa3329d981dce87e94ea27a26116ccfca93dba2b88c15f65f853a7dcaf84e3854f647476df29b8530253dd73e798ab2655ee63953ad283a7528a763285441eaf4da813c0225076615a9cd0774fe1fab5539eaaad2b82a4d2d308791b255479a84b958e054e1620f74cb0327aa25304caca735418d0efa644157e72a56fc804a6b5a3d4aadad6f97aea3650495646747e57444952d744a2e014a9519d18e0e2792aeea9dc068c75a55574b6d1d50410c6a02a994d549c65713e803b941710ee9cf0094448852fea32803b939e62e88448199c2ba3a65483f844e90a7db4c21d31d560cade3db651ecbf0b758d6a7a534168dd3b476fa5636d33cf08055a9ff387fc9338667ffe5781504c7440ab944ec9d2a116e57982bde9b5c8dd0a8614c14c75c11d1d086426b72b89a9fa47dd0f4dc42236d1f4c0882ad941d06d530d4f311dd3649ca7630a9d3b8fb223745788600519d1a7502536106929b4894e6dbd5428303a054e9dc9bc1dcdcba156a3e13c899d761b2ddd85110bae909db2928393d34bbaab732b3c9b266bd749974f4d29eeaab2f6fba26cc1e89e6e33f4468795f92d51faa4c0eeadb7afd93bcce6fe5473000755b9995f95f644adcc238da274ea9fd3e5038ca9df086c864a032b8a3803e804e6dc15396b266e29be91dd3f876bfe51ba9982a5021d828b158ac0bc256c68f545ca67478ca6ecb61b2b0e6e9f7570bad5536dd5c25b8d95421cd368842ab3aab7071ba9fd286e9862a410aa34263ac695fc3973242b72a351b281032b642a5a0c269ca2f71ea89f7417adc21546bac002981013f89aacb63a27d42ef33b24a9d094cf84e7cba1304cad9ca242b648402dbe574e489469c301c6e82b647dd06c6b80117ce02884c54c69528b5e6655460621f5cb1a4a70910ac7011726b6dd96dcb31d57aba8fee87c847e4a3a644e31f2811f254cf45d57ebeb84600286cb309a10d9717bb759e60bdc2f59f322eb5435c36dd55a16e59f841c83caba775b208a722a994d3a3da80c2ab5c30ee9b5e58e77b2baf7ca131b4aa6d3e24c273599002b0740afb5bb661401f74ea80154c02fb944b8c9589f654b880c6c144f9895446492dc27483ec822d02154b776e92826c294ca7393b20c6b1d29c4ec9b8213c788f39ea9f47c317740a0956e99cfbab1c5c2d4c6b80404a380b6f32f2b9aad4e0a0f64e9646112822d2ed934614c360273a14ca7b611080b51128321a494c7809aebcef09de41812539956b3bd3f4b32797fb7d19f65f60817346c14fb85f9457e163d9627004a023b22999c94742ba2e8b8bfd3a3b0e43408ea134e9b29cf95133829fc35370d954a2fa3ee1078283a1074a94514d30e2135c9ae5d16cb88135613dc18db3f299de309d585a6de8a93ed05d09d57cbee531a4c0fca2d333188556816366edd06925169030b60d3d540b4ca128eea9bdce862abfb42b144a2b3b6a364041f3041ed2a43baa3d55a50b69997e7d93abbab43366f64ef281efc9480bb28a69b82b61ab31007caa734d9e9ca65403d5dd712f021a0aa55bcbe64f3791ecad3a533e57fc15276542934e51e1df2bf8770eaa05b944289429c27d3fbab3b764d72d902ae23709a6e13cbf751f4375f082ff23924f44d1ec5347949b728cb9bb0531d423f7e4f790bf09e761dd3301143745745d1715e907df476df0a740ba6b283907207420a15ecc3861788ca853a9b2abb1d13e93a9fba6d4cab90704e470f40a6957613dc067b2cb5aeaa77526a3894dd8b7461069908795788e9dd338a2c6c2e25d4a07ee4ddd54c61414e76210509a5cdd935e6d23aa940437e53b1e6ec89528269c8555ec2d6c1cf5d1ac2bd49c437f0adbb74f01bb22492985ad6dcefc226e7130baaa7b2aef8f2f740d94daa85373c64f95186b7fb22d1b1d93fc9734a8ccac1db4bb1efa6ca4980a8e309fc47ed54eb3baa2e2f4c64a0c68d0a2230a04e109eba7a908688d4e83403bfd49513d501f7407b14f676909be51b63dd3515f95f72bee54a27dd0f33c9436d1bba3bae8ba2e204d37720287242328542374da93b141eae448ea8d31d1071a24ba271b27d46bda5d29c7cde5c2656eeae40a3ba09a86d3d17afccef4aab50bc9fdab235632ef4fabb2142a924586428cad90129b6cf99358cb439cfdf655203806a7010535c23645833951d13e1a708c461192c65bd020c754df60a32a14754021a36a74286eaa35a5c087653aca7464373b22c7154dbc2810fdd3032a3b2501e0cc8ddb84f89de55e2309cdb8c94f1fcb54ebc3223657788e6caa9fe99441a9e629cc4d6c3423ab585d250194e718036d3654ad8c94c3c9128340d472f5f8d0737f6d76d2565cec1400eebeebe657d8e87e02d86fa7d8afb15f75f94f38c2605b2cf5411dd0db470991dc23a3b4694103a90ad45846c85523d483c1d8a92ae529cc6bb7011a6cf64ea6de88354eb4db29e6d1350ff00daab552f3ec8681d017a8ec99e270d527a8438a759525d0e71ec8eea531b738342a917185d4765d49557cb4be532650cc94e13b2a91b04c5e2b40571877647d90db929b6f85e089006fd53816aa76e6e4c12ddf0b8b7330d62a4ea2d63ef6c984d30539e5c826b3129d1309f1622478415275af05557dc2d0a2022dc2a609c2f01ced91e1ed124a854698b4caf05a082aa51717121161072820a98faa10d5f7ba2d288201fe698ff00365e7c7f307dd098cf2efb7e506ed2bf0beeb7eab13ba8eb6e9f8d09eca7bac2fcafca765c9abf50f85be134c9d02ea9cabb6da8efcea5029a5053a6142845aa1030ae53a93a468c6caab5fc2c37d4a4b8cb8a89580a75a148577b83ea4613bb26d27382eaa9bc376dd15e18226f1b2a427e02ad52f216cb66033ba986a731d27ca9c03447544a69f2c427765600d33bab5426b254163a1526889ea5381b9cee8d550cbae85c3c110556a0ca9e6504aa94df4f0e11a0185246979884e7486aa387fa55d251d0343761ba6371baa8e2c6e020a945bab981dbaacd68680075d291c7d72602b9f0e24408504f96f3eeadccb4fb2bef2f6f409afc869df52611bcfb4a0df344edbffeb4ebb853dcaffb8afca00762a3fc3a1ca1018308b648c08d3f29c606c82082b07d90df41d114e5c536435da9d1ae40a95720ed484428d4953c802ab56ef2b7d3fdf40a472fbce5439654656c742e90042f35b6eca34bc103b26799f27a2a8e3e576e837cae7c20d2f283b16a9fe623e69d1a32b87f2bc18552931d71ea99befb21100278964426dbd109c809f43c26388e89e4bccbb257b28f2ac23baa955d56d98c041b805350e85548c11d74f13643887a351efc14da44c271b1d0d4d3235adba0c71e8a9ba0c1fa01e077081076e6f189f432502e7021c20cf657e70d36f7284031839fc23119f2b7fa95e289d94a82547b14f12df4ce506c00202fb2d97dc2fcfd963b943ee7531d61102710bac1fb426323f48d2a76d42654eebaebd174555b73484753a35eae4c63ea6db775fc37fcb29cd7d2df6ee83b98eb08dacf527d42ff0061db9674311a36cb4924dfd15fe31f36fb2adc23a936e8413d963e265593b2a5c39f1181fb15c5d0a7460b4e8edd0f3085b14c06ab9ad556ea734ae95702df7404657a8a0378db4634bb65e19168f644984d3611dd35f764884439e729b01601dd5487b1cd95e0347ea92aa0b4cf744a09e20a1e94040434c9eab782a02680996408011d8a39a63bcaa63cbadb7bca71b5ba36b7440cf348184c6da395d5a701b2aeafd8fe14d6f75e33f7c2f1bbb57894e24b32835aff00d0404c6b5a31a7c2fcafb2fb05f014fbc2ff00b94ffc8adb7fefa159ee167b856e65c47b687ecbae79203c48dd523b83d351a39712cb5d7743a94746994c01a001ad460bbca8b4b54ea74841853eac7a07dd649ca88d23501362511a621536e42afc5db4bc32df316ad91f0bc068b3f984eea9d275cd69c4afe1db422a5c486f75c6dd545dfa02885d53191929c10df089cc943cc495626a390a1530fd81894241de506775e10896a0ca92340e97c760ab7957940f728114c6f995c403e5c14504fcae19b49c1de21d82844e611435ca69232ae27129b48c64f2d6f4a8510a99cf300d1b0d37d0bc37729d5699e84aa65eed800d50aab9c36d978d3bb7080bc4d810a6d99b44a9f8531d54fba95f63a0fb2fb2123aafff00aa73a36255bdc67dd37d3a4fb940fca1f65f74542f9d4b4b7215320e7aea115baaacbda4721d012131f201572b95c160aa94a36563d5aeecbc179fd29bc31ea50e19a17136d9d9056e834222142030a3ce8b642b159183bacb69a925667d952873c055ea9bdb31e55e353a90de90b89a81cd34d901a0ab2559fd131c0ee9e255de188853720aef240509aef64485eea0ca2d2e00ab8d330131f39d09129ef24991f0aab6183cc9b055adab4a0aa9c206c43954600f31b20c94ea54e8f0e677210385692e959eaa9e08244a392504cb642a96801a116f98473112213596a7d3bb21329dbcfdd3ab342f1dbd885752fd84aa43ad807f75b27bc3775e35f8b257863ab5abf3a12bee549ca953853fe4a0867a05df10b7ec8f4dcfb23bcff43ac953ee869baff31ae4b4a04b374d001df076e40b64e5c432d75dd0ea75a152df295722f5486274fecaa7fc64140fee0a7de50746e136b0f755cb1e25bea46993ec8d23d916ba7629b4dffb4fe1398f1d0a70eea17550834c280e01112e129ed168b4fd9589f4cca9f2b58d6fca71f146d94c36f445d4c86b1ad19dd5701b4dc2c09cc71f4f54da2f6fab0aecaffa67b94c6ccf7e89f49d4e27a84d6b9d80808941a9acdd6fd131b19409bbaa79b9c9b0d313a3ab343539d2250fe7437a2f0053985471e55c41007ba77641a7b2a8f75489e8a9d3bcc2a745b4c12728f99c4f74ca25fec13a3a2caa2d3709c2abeb6b4744c61065c7ebf7d375633f6841acfda3495e1876e0201add8727e51d0a8c21f6436e887c0d3eebf2511b8fca28fc2fb1fca0bee51fbf2bbd29ae6bc6553905c0f2ee16eaa36e05a7aa2d2d3077446b09ad530b74c76029572b961382972cac28055815aa342d69dc04ee1d9fa708d320eca133743cb2892e299869413a772865a9a5c3014615389cec9d54bfcbfa65530c31022171ae6ba1adf505c2c9adb2abc20a749c4bb2a8d173dd85598efd472bc1a819728a628fa7cea8d22fcf64ee1c1b93a816c2a565b29ef0d84e26e94c4082156a721ad6a650bb74c6d8d0b709c480d70dd0979b9c8510e74ae200a74ed6f554e8dea9d1731da0a0c0abd474968c00994cb8ab1b49b3d5079ba5097d4bbbff00b10676e4ca8e6c7b2b86dff852ff00d854cfb82b3efa0dba21f017d82fbfe117c5445147e029931ff943eea7dd1e59f6c426fd91711b053e20de0ab9ccc141c0adb428e556a77891ea1a4284d1a06c900054e8b69b7392774f21aec20e52a503a4a83db48950efdcefca8f72ad71eaad74eeac3dd58ac46902bc32365176e9cd372f0e4a345dd93e43482329b74e1530554100260929e6c4caaee8871246f0a8398da971089a4f1b8549aca6c9554b1f507ca735af002a94c39842a54fc36eae0e8803083bf4bb74f14ecdb276549a6cf7469c33dc265d1b7459653298e0edb601032aae1e535344055298a9ba6b43440e47b03c414d686885549738f64ca4cb06132331b74ff60fc3500766956e7064a68f9f74046ff9e63a650f5bae073b29cc754d69033bce9f743e10f81a1309e2e1785b047e023e675a3609c046434219024674df53a625bec5300f99ea9e434ff745939622c2e6f9bfa20cb3a95be35d938755568dde66efd46835a6df05b27d451ab2139b253a1a36caf110a883d1780a94bcca6ac756ab08762405e6570ea811df9c85909b53b84d7348f2945ad76e17f094ccdb85fc3d9d55506530381469b1db85e1b593098d0f79372a9e46aa4e73f744ba224abf3ba155c10e29ca9f11798d5cf8308025c5ca9c3910004c73baabfac27570ff002f4eaa9805d138407872670a0b8caa6dfa467a7fb1b6770837080036fa1f85f95fe6e8daede15b1e9213b78ddd29a2042fba1f087db47c969854cee115f8471b657940831bedd5076de53ca742272374db73fa4f5500e230b61a1435dd6c88ec9cd0ef5b657f0f4ffe617f0cceef4ca4c666155df4790d44ca2517108542b2772a81808395cae5846158a14bc157bbd95ce5e65950a14218d9378978df2995e97c273c38e365925404297555a954b30150a2583cc32b88c9b553a70d4fc04d6f88f4e6c05e23a5532e8b9378a78c5c9bc6776af1e9109af6b9d09a15422fc959de53ea5a329b8ca6f529d52e010ec86029ff0079bfd2ff00365f952a3cc4e0afcafba03d90f81a39d0f1d940b8a28947ec8886e00dd31b19313ca740ad0791cbedfd34df4f950b3a009c554395302539c4e4a9454201342a74de765246088572952a503a10a15aa142850a142850a3b2679130827757366275750a67309d4ed0b88385c3d3812ad46931dd139a18c4df33f055b09d521c9a7a842ad4e8e52f57a2e941fe4884d0083de1526b8260cf35c55ea47fb92493013db0244a2e0d086da1d33d57d97e57e34080f65f644c04e87b6e40e3de13aabc1830af073254fba007b2109c4f41952660f284393a946241c4219ffe727db53807e14aa825bf09c654284506a14a17986d1f85754fdd1a07b978abc55e24a6be107a9533cc472c22d09d49b9c04dabc452a905f03a4ec9bc716c788cfb8d932ab5fb2acee8bcf3882144696185c4dd6ae1696e4aa9e56a82f72b20469b280adca1b194c26df94dd821529b704e5483d799c8697157ab87fb512d116952ec8447e9819df4edcbf9d4285b7b230411280001550163a7f089151a7b809aff000dd1eebee87c8417572c6084d2493cadff002341a109e220a6881c9f7434705e568caa9504405ba844284c6f7e42814008511a495e2a150b93480ae45e1033a4ce9088e6af4bc467b8d952bc0700edbbfbaa35dd41d1bb7b2bdb55328da665650d4d362abc35edde133847537653842a9e508495642b4a2d9108082074081ebd13eb5cf3841cee9210af55bd50e30f56a1c4d3283d8762890178ad250239a4ab8af115e148fa5f6e78eba774563d97e17e351f2bf0bec82eb8ef129c3a754592db4e55ad1b04e6349cb421f74d4139a0a2d8f3139f64d10dfefa1d5a87242850a15b2add0944ac004a6d2b8cb91a76fc2b51408952a51287a7477c261f2a3c830bc4857b8a1ee815250577312a5029eef06ab87e93942d78ee8cb0ee854784de23baa45afd91f13308557ecfa708546f7d4c2aad6d43ea854e916a1b26a6f741b2abb8329c774c6b06632ba27e02f11ca992e1a5cfeeae285442b7ba15ca15daaf69ebf42e72f10af102b877e535bcc85469f6fa5f95f728bba000940fdb4fbafb2fb273ad1287e7df428fc68137e4fd0fc26f9f27ec9a7cd1ed3f4a51d1fd0209db23b214af19c764ea2ea7f1a4a2537652a4a6acf3dc8390780af94102a55da3cc2b94a95c5b6e65dd932a39a709b53c412a8b43de01552ea551cc3d170f58b3cd099c5d377b2969ea9f469bb70bc0737d2f2ae78dd5675adf750d79994c16b4041391c3420202e31d2e854ae2e0d50b882a13596b40509d80af74e0aa65cf950a615c55e85454dc1cdfa52bc4210abecbc40ac6d4ce536901be747b9ffa47dd7f38774d35ff00fa84f5e5fb69d4a6f5f9ea82087c21f65dc2682096f4d0afb847ec57f9ba1f1c851d7fcc226c1b7c420fc7f9854faaff002792679a15767ea4d77ba9f74197fc6ae6b4992d6cab59fb07e17854ceed0bf86a31104277067f4bc7dd3e93dbbb61371ac2851a11a840a054eb29c4b8ea13b2d2109617e01f94c790edd70c73f195c45265521fdc2736c6ae16907973ddb0425b96e1378e734c1ca6718c76f85e2d20dbae4eae2a1cec853a5d11c041479d012f9ec9a24a7318eddabf85a632308d22abd2a9396954592ff850a1573034a4cb58142a9ba04a639ce30a15d1b390af5075438b3d5a9bc4532ae69d8f3f5d58d2d9ca384ef19db0856d7f7fca6b5c3d4ee7fc68fe9938fea838931184348f643edc85123b95fea65db268b4c744dff328721e5d8442a7e90a54e8ed9119f7e69d0d0a7be47c2145a3bf2390435ffa9f64ea549c0cb027709fb4fe51a551bbb0a9e51ca342e857c9d63429d8aa1c8b7f2b847775d1714e86c2e19ae3f09f86af53906408446578a26135e770bc4ee9b58296992133d3f2bc66523e64dab4dfb3872784cec8d1f74f6162ac65ca9b2e70088508b1a7a2770ed3b6153a364a220277a9373d501a5dee85578fd48714eea10e259d50a8c775d1cf6b536a3502348a8dda55d5bdd35b54fa890390985e7f61fd503333d17e395831fe6cbefa0f8e43a19f746e6633eca5b333ba63a761b21a9479420502a74dd79bf0b623af24e55d3cc4a77ffcb29823907afec8a9427328b184c9603f65e0511fa3fba1c352fdbfd57f0f4aef4a3c3501fa7faaf02867c9fd578745db363ee98da61f6d4a5fdd560c0e36a351a080bc51eebc52a67729a79494c0d2f0a1a60902500dbeaf69544cf94eeb88e0def320aa748b0642e28e2170f4e4ca213f0d2832e2ac8002a86c42a8ea983f96d1dd4ab1a427f094f7182ace269ecfb87ba1c496ff00a94d32ad376c75e21ebc4a2ff53553a6c06e6951a1308674aa60293baa225df0ad4e1013b757140606a1ef1d4ab8abd07a0f3dd7f3d343bf51e5261f9d95d9c7f4570986426171cc9d3f3c834db90a3a113baf49f2f5f654c5a000869e6e88191a6da9d072ca952a54a30742a63f28191abb6e61ea28a847b2261344e4a73a02688c944c955334c81d952a67aa2171349cc37ee1571b3935d70d4140f2129a53aad9467af44d72a7eb691df5abc2d37a6f0e6984e1d1710736aa0ccca2154a01e870cfbc28c9ec30abbad62a7c63da99c64ee132bd376c55a0a341bb856bdbd503e5caad520aba9bb76a680d6c21a3add942f0cae203bb1446570ecf2cf750ab18d29b2e7850a14272150a15142ca131e6df9cb41dd3db2216163db9021f2a10fb69774d0a28e806640410ff002349fee8e243761bae91cb1cd3ce4993d9007aa1b0fa1ee9bb945130340dea517f41ba03bab8ca68e4f65c470845ddba206d283a74940e92a538a6a71bb740aa1e6700bf9ccff9042bb7ae0eb5a1ac28d1b8c832a9b2d6a8570984c1d5745c5bf0a98b880ad551d626719519d5338dfdcd4de2691fd49fc4b4e1a83a9bb75e0d239088e4664e900a7f0d49dfa57816ec8b0855e505419b950a142aa542a4d97a851f4ff3ca10f8414ec808d0e9f9d3f087c21b68580e7aa7344b794e02b7dcfd934ffebfdaf558fea9bb22539d2808c94ea85d86aa6cb7e55c649dc2699ca952a742b75c6f0f6d52460150e0a63741c81572b95da5d6fcf653282a357c170716ca671149fd516b5dbaf04b7d0e84d73f6705c4bdbb14ca6245aed4533792ba2dcae2dd3523a2e159bb942ae7cca9b6e7050a11c20eec50a8e08574daad5e52a1531d55cd989e52c6bb709dc2523ec850b040569451c05532e50a833cb3a47d5fbe8105f6d261d94dd4ab74fca0821a9e47090aedb7fc2f8c0fee98206874f85b1fae56d94364f74e10109cfbf6d931b08ba04a9b7ccdd9336c0dd48da74943acebc4d1f199ee13b1bb53dc0c08d24acaca716f97e179cec21068eae5fca1d4a60a6e3eb4ea6d7b23b6c9f80a9f195a99de42a7c6b7f5884fe2a9b460ca156955f52148372c2a4f51ad57da43531b2abfff008f764b4caa74ec6805543011cb895c33305ca142adeda06c00a1070e855ee09b5caa2f0f627f0c1f99caf0aab3d2f4da9547a82155a5483cb634f44ee1c3baaa944b1ddd426b6d680a3e91e4203a6efce810e638f6505dbfe17a5d1d235184df64353cb09c2e8e5b7a4e15b9fa3277089f6f7d0721d93dd684155ab3e405536464efa3c8032bd39196944e016ecadba1c31ac2edaf15c34b6e67e139b0a028d254c8f8e40a9136b6e395c60f2dc3aaa0dbddb6c8b53840942a26bdecd8a6715fb820ea6fd8a008f84e3e2549e8a8b61ba44aabc3b5e9fc1bdbb653596b40509d809d972632e7050aae1aa0abdc3aa64b9b2552aa68a6f14c77b20e69d8ac234c14ea0efd2e214f10cf74cac48f336107b4eaec3494eaaebcf654dc1e7d3c8040e6cbbac0fea898701a1d7249eda05f84395e096e113f6539f2ff00e934bfcd9c744341c8759d1c5cc7142b37ae10fad988851dd6c351524c009c6021e248b8f55ea32aabf3633754e9067cea7dc6163da165be66ec9ae042bc6dd5789983ca1717c2b6be5beb4e696b883d358431a06b8ec10a0eeb854e9b59f2828f1185a7aaa54c327e539711810a952972b13df694da83ba159d616dd92a932215b58f9d8ffb26f10e18a8d4d734ec752d053a8f6558c288549b8950a11a4d3d13f85ec832000abe02a5b6e839c09829bc4d46fba6f16d3be136a31db1d0b014692b6a355224eeb8875ad57b0ee1536b465bac733c1230aec7545dd879944bf43a38076e9bd7e50d1bcce684f6c988fba88ffe693a0d4e8757548741821452711d346d3832e329c48181255d5bf6a13d75d82b64677449ff00c9e6707f42ad1fa9e98e6b7a944f96774c2d3b04fbc9c180a2dc7529c4fa5bbff64c6067275885bfbaf480400a3ab161ff002bd58726dcdf853a4a0815c633f9a4f7cab02b15a50a6e9d952616ccc1e5694fc3a7ba3dd3fccf549b0c956c8553869c8285175f042a4c9a9f08e02a15a996813944029fc38fd2614f114bfe699c434fb6950dad28d400c10aca6fd8c20d811ac28d38832e40c263713f750aabad4dae42a7c63fba6f19fb826d5a6ed9da121bba796d528f0e0ec506da00d27e8f44d168f75f9e56a6fd90fa054ead439def6dc416a1e15d372817dd784eb88f2c7cab2afeefeab6531c90e215bbca1b731635793f6957b622d52f3b00d08363cc4ca2eedba103ff0071cae12b24439664ce5000655a3b29d6534294e72aefbddf1a8439827f9a99fca7d490214a6d4cda74855cd8d5c38f27caaafb29954c12e94caf569f5954f8da6ec1c15829d458e4ca4e63bd585c4bb60bc463b76a631b320f33f011f35ce4d61240ee500a1573e6d283772a346d5a8dfd49d55eeddc83ca6d6f742aabda5151f53fcdb509bf210e73fe4a3a421fe63492ed8e3ba6f5cffef53aded798b1594facab19b5c851ff009610103089812be77427007dfea3a1bfa4213d940745d92aa3a301460f7583809a461aa54ab94abb9234b87f81344a27a23855eada206e81cea39c2053fc9523dd1dd5deea8b811a556de5a134765c63a18b8767904a708053a6e5c3d6aa3672a7c6fef09dc5d268c650e2438f99594aa214cb36cab94eb4d98caabc35e30555e16ab5b004aa2c37931b61427e027799c55a98cb5a02850a139c6ec2154f54d378959083ca1550abf5c269f75d11000f844c47bf27f928a28eae98c20f18b617893307e5330d576a7643d4bf1d5431f9d4e558101f5bd217bafbac2073fd15cb2a0a21050541d25192837ba27b2d956ab60449264aea39073855da30e8571eba5281f85465cab37c3a80fb20ec2ae7c6a8c67ba6c0c2e20c3501854a9c37e516a215e2729af236299c5386e85563d59fb4a92370819e42c6f6468ae218f03656aa4cb9e1422142a981a42653b5815a9fe55e2350f94d92ef8fa3f9d3f0bfcd93ba209a8fa47f854e7fba9f6c923932bfc84547240382889b7b053c8e98c09573bf6ba55b3bf281f5a3aaa8ee8a54b8a0093050620c501614c4e15d9e8ae57696cac0592898556a86a7b8bcc9d3a8e41ca340880e690554639b884dc985e91b2a0f8327684fa9e239a9ce2012a870d7ff00310639ae25c15669794d64b8050a155c0473954193255ab629b55ec4de25a7d4a90639d21557ba981025338b61c1c1520f23f8763fa21c3593088211d3883a5165cf1a42af2a16426081ce480aef91cde93d534a0540288feebfbea4e1641c9df43ac7fb52bee89cfc72d4740c6e80d36fcaf13d95eaf57a9527b21b28f75034cac22e556bf409c493251d0f28e709a2df2d4123ba3c2b376234dccdda9cddedda153559fd17071e0855bd07e14cf452e09af70f520657127a2013196b02855b74d7b826bc3d70b52ca9f3a3e831dd11a1529e58e43887b70e6a6d663baf244a75109d49c0615463ae3eda70ccddca3484ea2c7744fe18fe94083cc764cda7a947cd11dd5e3ff9cc102bc521db20e0edb91de9520ffed33733d8690a34c0420edf509f69ee8140ce794ac92a31086a70b7d0c1dd164ab6d41ad5850ad50d5852a51aad1bb823c433ba3c4f609cf73b73a9d0a1c8351c80a2e1807aa0ec2b955a6dcbc2a47d4554373951ad6d3b7faaa9c400d81e6c6e8bbb20e11b26bae3941cdca7825d2a9b65e028509f45aee8aa70c63caa852892427632a971d55a63754f8ca6fc1c1520a2d053f8569c856f11476f326715387361020f257873d3a9764c6dad039a930b74f9e42adf72acf7c7b219767a6bfe6da840ab5ae31308870dd332d99595be8403ec50001c0c2ff275381283637dd7a7a49253761a428471f2ac19fddee86e3e3941f54eea7db3b26efb463e9bdd38e5395b20e572c950ad0a07644070822556e11b05cd31f2a54a9e66fd422e6fc655224aca2670acb53e6570f01be60aa51fd87ffd2ea6ee884857ee98f12bc80485e2754ca9276d6142ad86a61b64f75e6794c7be9ec5338dfde99558fd8e8fa4d72342a33d0e5e3d567adaa9d56d4d93cdad29cdbf20aa6ca9789d947214cd9520e1bca355a0c2730bb20ca636a0dcf3476e708b0874b73f09b588dd31cd3e944da30d4da8e1be56fcbfdd39a1c3e539af3d364e6919bbd947450a3422632ac9dca021c71d39a14738d09e89ee8c75e49086fbe919fa1c7d7ffa43eea50a9dd074f30df9c72b536980242735398ee8bcdd560a6ed09ecedb27020e7ec9dbe0af642cc056631b2b8edb28a8ddd0a810a8d985be9c499c232150697364ab554c04daaf6990551fff0020f182a9f154dda4029ac6b261711910110f69544b8b64a9d08d230501085570dd4537ed82a9b4b46aeab1fa50aa0efce51c095e6ee102ae7d23f2a5953d933c80a155c100d3d34f144c6a17b2ff00256fd34fb295fe7c7fb3257b953719d42d960ac7d0af57c1a65dd7a2719249d787a46ad48e9d4fb27be99aa4539b7fd8b535f0b055a9ec946891d50c26bd3e90a831ba7d0753390beca0145e5ad8e88bc94d25c8b4f456da046e5521ef94e70128897929d9fbaa4cb5a02217107a2854592ef8509b5aa3362a9f1c3f584fe347e94389ce50a8c7af0bf6985e61ea0819d8eb1a3888f36cbc307d255cfa6615e1fec558e6ec8559f505e1b5de929ada9f1ce7220a323aff00541c3a7f6575a7396af0f6b329b55c102c7fb209d54cecbf96ff00629ac7b5dedaf5d3b7f93acfd7c77e43a5433e553a4e9d741a4724e9c5d6f16a63d2ddb90beca7e1b7afa9501e695683ba7522ddb3f5da86ca507ac14fa44fa51ff9355a7a2a6e5bee9fc2b5de9309d44d3394f7dc9fe5184c2e14e2152727be153a8ca7973becaa546bdf8506365e1b6e693d10d91c05572f50a93219f28b516ab53df6942a0281ec9b5dcd4de21a7750c72878db2afef8d71181b754439cd0854e8e469b5c3ca98da83e158d2a00dbe9384a3e5cca99cc944b3677f446991b20e7370bc407d411a40fa4a0d81cd3f46e1df9dd981dca308efbe50da54e84c0d30a560a1a421acc21f2a7b8523bae32bd8cb47a9dc94693aa380685c4d0a3c3d21d6a39516c350551f6045ca7e80e56a6690a4ca0f582bc3ec8e103a63aaa9c235de9552839b8409ea9adcef08f883044fbae20590deb0bff000995010aa3ce21502e2e0aa9e88b1c3741b261428509f809f93a50679655aa10738267111ba0fa6f5e17ed30bceddc22361dd7f32670a2771cd202b8737f9b6b77ee571c63e253ae9f2a151aec10bc312808c0d67b735edce469dbfa723b646213b30134c8e52d956f7283602db57193eda40df4851a6cb2341c84b4024aad53c47976ac6de6170f40506fbf52b89a9fc4711ff1d826a24344a73ae33a51a73e628d19d91691bea3967409a9aae57050a0a9842a7758722ceda4e8608ca7f0e0fa53a9b99baf18b6255671ade7852a9019eebaaa34e9c35c171787ca0e3283c0c8dd34dc11d2b9808051261065ad015aaae0215084da81c87b26d67351af2c3f45b9f32398845e07bf347f91a7f759991dbfaaa65ffa821035fba3807e111e981b2ba64723b6fb6c806067b75598689df09be9e5b500049406b1c9289d1e606375b699e8ba29d0f2ce806571d5bfe98fbf270147fea1fb2e278a16b98cfbbbb2a23aad93df71d18dbddec86860ee9ec6fe93f442626eda4269775d234f32153bac3916692be0a99f504ea0d765aaa5170c6c8d32d4c1baa43cf2e1e542b530c96aa8e9f313128e329a7b2e1dae2d94fc2bc2ac0b8e9c3b65ff0008e956917a75273770a21bf283dc1364b41436fa36f6c2b5d9e886f18c76e696f7e507908070a48dff00fa9b8746d0de5b08f49fb2b322731fdd34412399ec276dd455085e0e76509cfb535e49db4756685797662069b685050147d0b7aa0aabfc36dc9ee2e25c750253f88fe506370d8fb9597901010aabba0d37c04d018d84f79e8536a19dcacf528265369a7b27d070db3cb3a35332e89d67be83585852426d50561c8d3ec882107295bee13e831db2752b270a93d94f0e1ba7d2a645c13813b950b878bbcdb2a75e5ae6b5b08bf7ca06e57a2046170ed86cf7e4201553876b97f0aeb82b611edf4e395dd07bac6c87946790140a94358cf2e1472c6909e1c0e255ee098f96928540e225a10c27d66ec999cdb1abdd27d95deda0e62a74985d34e36b5ceb06c348400952d68c2f0bf92eaeff00fb42a2dfd48bad1a08531b2bdc7b68ddd04133d2114435db842837ba670c1c7d4bf8367ee2aa70ec69805cbc167ba03f6884cc6da4a054e972dd6da140420e41eb0e4ea5fb51b988394af94fa0d76c9d44b70aab5e3e109596aa2e01860ccac9f2af4e614a6b6e6e1016b40e68557013728381fa31cc422c3329c339cf64000359414a0503f52391e486e178e7ac2f1fbb7e57894ff62f1e716a64fed0d5d937213ddfa7aea1d98d095287214d7858281855de29d39fc2273a4a682e200dcaa7c0b1b9764ae3ab5cf14c7e9fee982d6a73ae3a31b77c2b211c6870f4104dd868426e5ff03fbaa3d538da2513fd515101058528093859cca086928fca9d23db40f8ea9b5160a752ec8934e03903852b74ea0d76caa70e42682d42932dc7a90964c830a374c68d8954e910ff006fa15b74dd91cec8b80ff616e47247e35940a0ef752a4737f835fe9a4a944e0a0f24e5a31b94633e495d3cad6217753f61a5a22138da17ce87a289f9436500e748e43ec886b9010a171352f7c0386e874fff001f4a5e5ffb57155fc1663d47654c5ce551ff00a468d65e7d9400139d08e5414e54fcc9b4bba1a154bf59eea875555d9011f8c268eba3e6dc26bb694d467be56404d3a6fa4616c829d233a07157bb0b0edd783fb70bd3b8585283ba14fa01de94e0ea6af7444a1e64585b9546a8d89ca952a391c602c9727f95a579ba7e501e68edf407fb0941ca54ab95cae53eea55ca7dd5cae52a54a24f452ec1fd2b7d95b9de791ee977f6d01ca8d63aadf49531a6cb073a71357c3a703728e874e199e0d168ebb95c555f16a9ec30133cad9d1ad2e30106868c228ee5526cc956af09a774d6b46c10d5fe92a9e1a98eb58e3a4498fceb524ec9c4dcd8e88394a10a54fb699efa5c881d0acedaeea0ab907215160a7d1076c221ec390a41425183ba7f0cd3e9458e61d94a7303903529ec6536b35dbe0a0a42c6955c9aab1110a106f2ff00444f60a5dd7eb0e4254ba270aec20f90ae572b95cae5713ecaf31ee813d79453ff0097f4080b791e7a2c1d0ed283b6d01508696fba8d37c21d9155ea789509e9a1d386a5e2d41d864ae2aa78744f738080930aa741a536da3485637b720435abe9fba1b0465123250c0d7c2047ba7d17744646146149138500c6560e13813b00a6d30b7417baceb8d08956f62a4841e9b53bac14ea20e4287337d4c1dd3a8fed4646ea251a60a1e2d3f70af945ce00263fba71972605538169120e79234ff2346ec5c51f32738ec3e91d5c6029d6dcca874a734fe79a0985613d5581428fa04da8e546ae6c8409d903cdb1d02e32adadb475d4e9c252f0a97fc8eeb8dabe255f66e1521d51324aa4dca1ca11e57fa9a135a485647508799f1d06fa8c9d213a982852845850f744e55ceba15532ec2a4f29cfb46e9ae0fd365ba8852aee4d90720f5828b0221c35df7468f646e6e0e8448850e67554f1250c9541b2f1edcdbaf6d2dea1650de3b7d576c98e1f6e68d2147d6a8e74cf4432b6d2f1c93c8359227b2aaf351c4f27074fc4ac2761955eaf8549ceebd343e5642098d80872f4d635dea26b9b03ccaa168d931b68cee77d69fab9611a6acee9cc72346ef9429786b6196aa459d144e9f744e820225d76134ce85429840abd0328b015610bcd7474595bee8d1fda510e6eeb74ef64c5c3968dfaf2ff009952a7900e6f57c28822399e0c185eaf9fee9a6473c7d270b8ff00a9f654d8f07391a788d984ea92eb796251bb10e4250c2df4c23853af1756d6d9a9d385a3e1d207a9c95c755b9e183f4a609727eea90f368394f6e6a5b93a0cba7b7252ea7e842b516a737088731c9b51cc85e208ceebaa6bc68469050398d362a54680a0e5328b4282d58d6adad223752e256cbb26d4a8cdb2829d495995bfd076cb21aa7ca3b943d67dbff3cb56436423e713fa931f87639270a4db72260737ab7389d90c177ca66d3a04690766565847ca7bad8108968886e4a39f940cc15d74eba412b61c9d5390db5acfbde4ea570b4fc4acd1d374f3631ceec13897124f54cc309d29370821c81753a0d5e61a5531e54e303ee10103929e1bf4c8053a9a2d845bd5649466edf641c48ca699089d0ace5026349528852a535e6742c051109f206119bfcc8bbd935d7145b1d552790bffc400291001000202010401040301010101000000010011213141105161718191a1b1f020c1d1e1f13040ffda0008010100013f21947a0bf0e90e25b648949df72b172aed02e30e67280e86d8274a89a7128d75e5eba3b82d94bf5d222e033c416a4ca539e60d91163c8778b5082abad414d0c7eb53c4f38f789b28f5b945d64dc69a060c9575d0333d31e8238aa99230fd9352fbcb8837b895b602babbaf51a35042d0cae612cee32fa946331bb71c78e831b72eaa77484d46b99c2740403984f8033ee0a8d4ccef2e201b3081f06fcf40950038e9b620475157106d3ff886a162f737d387f86d4cb3163dfa163a310b1c83a9430ca5a89b9b958bb833730c4a981c41d06710aabc44bb95a08a666fb9e216b95d571e6382678085a0a623735d2d4c10ce2216af88c4271cd7d3298ee2665d404e712849474f65399cc7875a13ff008742196362e2b4ed739c749cea3d90af312530eeab117d29eb12d9716def20cb10591bc9d24aef99a87eb32d85ef14e235974df4c5f047074c6da4b4def86a58acd7de3865810bcbc4019f738bcc6cc85bf932d81642e6d62fc4b37725b16806372a09a9a7b8ceb9834797133cca370e9c1b8ff23a5741a6e5d1315d1910328924e2f8f88e55359993d2fa5bd4c03bac6058c0b65bdf12e9800d462e99331ef706be62f0c45599551c6cfa7414854a214b51da659152b306129e966e53bd0c543b0639264c1f4e012cee541ec23c885b9112012e6e8625567a552a9ed7366e10bcf50768b9806de823a8b970dc70f32faa2be5820b8652df04d856a18f42cd5305c7302e04d4254a962bd17aef3c081dcdd7a15038989d8425158624a2d2e7ba30f9e87b9cf6818e15c768028a9b686e27261c040e1411ad40086c5e289e304141dd8675edee3d12af2e6189c1a463c871129aed39895da54638e81d0b718c712c7b986e0ca0aac8f74b54d11d4b32f8eacc219437be871a98e846d12fbca06a056e7ca65789873a805e26c438105b1d3e67c331ee624f3d0b5aefd2ad42cfce76950dc9a0119387aac3730b6b30512ce6523167244cd75a8ad586220ca7681398efa0981332075188f5fdc0a5649b6c72722b372c945a6a96e8150b4822c32f49729786e18d4ce405207b51547954a8a6230830477798aecccc146c97712e09689a9c61eb44a9872b2f0396e509cf3d258f7062e5cb851e12dc3512da7994af85efb4b6ef99a32a54bb701bd18a64eac81962ee2545e8cc2cf4d1051482ce02e9b8b353744c6ad326d65d3d3884f5123d0594f40946f9844c1713609deb9c94665a8c12ef9961cc3784b9b78953325948eed40f7c4630d5e21334cadee391ef114cabe650a5e658ee710b3329ccb518c235783a9c1f3129832bd3fb118f4bdaa98464465b89551e6398c0adb16e6424a874309b748c547f9d02a13694171b254dd4df27cc6f1671d6daf9256621c929d303533ad08a35c2e219625c96d6e03bd945c57989ba8312b1411910af7613a8500ec661b1ea5637a251c4365e085e73f74d25c4148aeb69321815679944eee6c9da53d25399908c05e74c5c59993c2119b9536016e6d2bbc7cf2d8cac416cc01cc467052c2194c4085316f51d5a3e4958732a4bbe6c841a233312e0c32d42937a993130fccec9844384a6935e6513011be5398b89817cb485cc34f7150133a91f945a35f6ed1d3c6c65838e6101bb852b3d0a5e267987100da67109dd2f351968c74b829c133c77d25bcca0ca83ee1974d4c32cb0b2ae085c1fa7455126a0a4683d0daf6204367bb33e26688fac24b48ed2357885c5e0992c59da62654884f0e2a98880c4b5ac939303b114a6497274b997a67b9b786e63a0c5028e4d5f83ccb54b34f8b8011c1506ddba4ccf912ab3bb8ab15d9b8c6d6bb5ca93b9650655e421a89086ef83f78ec9737cf4ec724c51e37eb89b4a84b8ad668e3896256f79c40d2a58e56552505769561de5c1a3a3514c328b85c4dcef45353df37f0993b1c404129cca9a99ae81978dc47cc2acb98d92b612a5f9d4b5168c4e72f554c8541413bd89750a1b9d9e6a32b842a9f94ce933b61f540189b814932aae92dd372d9751672477484691ce3d10b6c1b6620175da58c236ccc631d22f0435ac89bbe950c6a52b500331b0e3b4515d3433982e1648477dd5a608cb5e2157703eb306c96cbf4861ee4fbf2586c9a19973cc4adc612bb3731da1860794b8be2345324b0ef000f24545d197ad4b6297adcb0ef302228dcafeaf98b799798542e16e21ea07c39751e96c2030b1b355ec4b68e56041bdb51dab52a5f44ee1d7b8138eae627450f94dd4324c769cbe24b7a2ee54e2146319e619dea50ac9ea0ad797a5a12cfb7579892c8527688cfb710ce81dc985ce267848efb03a997d67a04c8157442cc6634bac5746473d07fe83662ae6bd9e6503b5cc2606b93511ccdf4d230634c6d7d05e8a5626fa0a663d89c2037d4ca82929f329336caccb7694158cb9e823575033039419999cc56d84a335b47691db16660052bfa96d78a5ef2e6ee4cd79668698c9ee473058e25710b95310788e3923e311ef3882a0ef6ead8860f98237311ce3a2a50554652b530369e865adca9a1994c8b87b65254abade309f411115772dd6f44659a8b9e9a8f3057436974eccec95fda02b004a9cf4bc1a177147cba034d510bb48b4ec45103d743517a09798b589b97184ab254ae26e60511af6525dc982656f7788aaee19e2672005c0a2ca4c80c20ab70755e8232fb5cf435fa76cb61baca5eef785c9cedaea0b4236817fca65dc487139885f40b0c2214aefbf4c20df1d34b0159ef32e3512f30b4d1286666d99c5af1a949d1e6550478255a7e2737b1296c568899945dc8619e9453cc7a15295b9e5146201e3a15684f1d0001b54af996f281cf9890e039ed1199cbfcca98253c0c6a72975b862c54826e24a0b02d6853d08fd21720bdcdecc2dceaee78cb44dae5769c4a9df17177d2830ccc907c22072557c21008778cb5e54f31cc67dc5fc6414bbabcc7af1e799ce07d48693d20b66d708b55d0d41894cdd4c177d2ea3329a2c324c180ae5b6de5871867887623a5b9817dc8d1410d32c96dcc39e8c3a24452ee5748c73eb42159419da54d3c8e0eef132021d6265b6a640516d473599c2254c0ae8fa9579752ea88c735ed1231b752b351adccab941964a5798113105edc4b3537029279e8669cccff699ef98e6169de06e6fb6dccddc3698939b8f516ca4bca2b4118d0663df1edda3617885dca3434ae5f10474af980f717ed125414fd252ee94889a092cdf3c4135120991332a1715f5953099934f33223a677266118c0b83b44a8263422533f13247a4ac08dcec871659f51772cb88c4b0a16f752e292590b297e9a56a34f50dd9f98b1071df3120845ef0af963ff86728daea7dd0828c894a1da0b1e28113dcc7698e09c4d4a0b86f81be80f114868fcc355518023a5f1292b73370380b848261f9879afa5e3cf521caf13d5398d2d823ece1a25e56d95e073a798993df88658d8ffc44a3c4a834a65aea712afa34fccc36cd10c8044230adef0c8b997f74577e982910b896ce232ec5cb0aaadf596edfc119dc7e2253a8c0d6be6276af55178d7100b26fc4a0e138777420aec8bb6f5cc4b2ef04a53d2306b75a97791fb1fec47172b53c0890f9491c6556e4c4a82f1d9632e535c4f62d93cafa4cbc543e1e8d9e84bb940a2166612e52ed115cfd1178e70f4d1a3bb1a9663a712984023000c65051d37812f2c5774206cede0f72e7c603b70c4474015e26521ca5aca7683a9f4399762ccb7c84019cfbccb9057a996a2aa0f12dd9a9ba38e227cdd0a033516db8b58e8448e427212dc4cf0f24541c56656dd5c111ab43b86ef12a655af4cb8e3e60fb42d50f3d2a01042a2f198a16ac465651fbcb92853da6a33d433542ecf373255e65e27a4b14b25a97b654a87233532c3be807ba14128bbc062ba0405a230506ce236ad732c1898137b8c311ac986631174455cdb536a2bb4a96350696e48eddc94c17884eeb0163bdf5892af1d12ada67180dbfb8981c70b997af0ad3bd41cf997dc9921da5ba72aeec5f5283779833e786120773ca0312b8b854b410ad19831624b677373984ee62e5a6eb32eec84b3059e06f26a04228b92e0d62651660b7b8ef11a2d81c167787128991f4b4a52d5647f293880422e93dca086c1dd53b4a8f92e0887fa459b9ec4a996353c330a9506da73b994b5571015c9b82db2cef2932c92a51264e8768dcc4db4c58b31562e5c4b53957e66e4a315b8cd70efc4bc3eff3003ac080869b8b25772a7101fa6ef2bf88aa8d4d41a20950a3a5ea7b470b03889598f801418f1d156da546d05128c22c61595e65dbd0d6a732d9ee3874e805eed7999bb6c6a644afe25b500f88d85e38c6bb097dde7796d1adcb03954c4058efa3d6486d87a683da0b7b868ca7a0619eaab604e003e91a039e7c46e98261d8e250cd25ca1e6a129c42708ce52c72111cdaa98d1cb8996378a9637b1d0e19678840e58f30c824c476404623a10deb728cc651824d21f3118e9dcfd771351be97884689d8c16b8644afef732881c612eab6aae288f7b98faf3256cbe076832eccdb8710dfc1777f3c4d4c50d5ff333f6d42f4932843cc5b8e2510f302cd2f70c70fac698c308d32b73c42e1fb0f5280fcca20a83025233613eba612bbca030a88b150cd97b31c88cf8fa3d8943ea412a9b6b1de6d97646fd08bf88ed2d3983894ebbcdfb6ebd4ced867102656225e82b5572b6dd5ce082be8c453386fe22d5c114f13798dc92d8cee364c910452188b784e2215156af12df80d92908ab2f5501a725c54e1adcbd33398e7c54f60f11853a94a0fbd4abd902b51292e65f4b60d33598a8cc7d642dea520c554a533f925481a84e1b994954ed2f63258a8187150ecadda0a46107028e4a85d47a11bdc4f19146652d718ac789785b98bb8d8352a311e854b7a1dd0dcc01bd4b72c006e06253334dc07d2159710068237cd114fd135d379470bb4b4672ecf70ca2865941f28817c338d531bf4cd077340b8ed2ec980839ed3e08972dc464df10202cc6e62606108057c22f851a602b55ca907e6396cceea265044191c84b944c47e920017d22413bc111bd6c8ba722b3199c5c3f424aef171ec802877caa1a200897a89d5867c98876054f085e33c4c3c219666a3f1988e5b47291a4c1ee1cca8fd7d0a6fa0238f983995cc59690096ab9e08bb341b956d53c92ce73d55c1b0aa96fd5732e7c21e4e6620d8d3e2645ee5d7c471ac326f04b8b5c91b7a376ed1b567915830052a0ce8989ab604a8ab836e612cb67ed299d8964a22726e3860d02de604c37c92a68b9cfccab44c7b855950cb3b1af334e6e59af696778288a3de1a8a6b89b44947504e96efd1bfe4c7b204a344da983107b35071388d06d73d31378b2c08882a0e8a80ae84aab69c622f622a26e40fcc034951124627293f1291f98a9447a85bd4c72114ee5d94ea68a5171085463894c3b70cee6f9f846f34094054168e2e01117f1337820e6ec9068d3332885e7fa96bde4d815b7e661e46f987744604c7318c6ab9be9653b45e8953881599e625b30b2001d4709f88a89d06b31736f52848d4704c055c5d0348e09b9b65c90bbdbce3dca113615ee615cdcc7b251a3873d3738b70f68802f50b8c296910ab5363810f41c4ba3f53a116f9af72b9863c353882061b9983de8e352d66170b567101e67794566f30776662df1385cbd9d8860f67fb955c6febe225184e753080e21895c445f5b9dbe2e31570788ea611c319a102ba154dee1645e67f516277c46237b9de5ea966494b06dfb4aa2188944a04d2cb82eee1262242df89cce2f7325c83a0bf12e7642d6eb4fb42e3a2cf98b98830f3292ef22755229ca8112d34080dc70ca54412d59f17fe51ada3501dc10fc42ba930e263ed0058ef31ed700c597fb469c6b894a519862a657d11904af29e62572cc4cd8f50267a9e5026f51966603ccacdcfbd0c6afa53697022cb85a2f52b48a0ab94abb11cb1c66663be98963350727b80d17c4ef2d505db12edefca06dcf621e6b83b54418331c280ee9f4107ca287ff00642b0b620b424223986b700a4d3a82826c6e2601857672c2f4bde105b22ae509a591a0d6708041515107241b61bcc020bd1da5341f6883d8defbc29e5ff22e7ee4bfaa1b359960afefda1886087b37e6157bfaca52df1cd40f3cf78d1c117a4c208989614ae86d959440a9e74a7d25420c650012f91695995bf6a8a37156b3b52ebcad0d3057b959332d77c71d28e078cc0652e518843cbccca60d20b65ccbcb079873382beb99dbd2b3100cde221ef983ccf242fcc3533ef8956521858c283ef38950bcf306843071da35e6a0f32e6136f7ed2b67ed5332a694fd7b468b8b4bd5ff00713165ee647d69fdc47223d415095404c158a095343f13d6430cc7c41de3cea6c0e4a88d188d25f7dcbaaa3a9549835177184044967985214f132e8d741a1233998dbe788b0310c3e61cade593c450e7e63e6e3f71666e370b181840be620e1e652bd4c453cc194636b5c42aafe0f44a67906710005ac386603f4523c26c4d055fd65d6f73984f9619e1e6a63b9eec50207f1062f31e2e05cb99a073a9867bcc2d743a38e21b33df3072c660d83b9a860c369d1d686254611fa1583662501cb0097be112e3cc08b7fec672c7862a95e628abbbd9c43b17fb4cdc225d3ca60a2b2a5223df1363997a959029ea0a9767688a88c9a63b1aa266e0c0e6601ea0d34a8c0855cba9dc837b925e8ce637810eee0f7212ead97d1945cc089f0995350b53732afd32d0787f311ab17a8dca2f30ceea5ad82c28f52623b4cfc740d984c5c1995533646603d1752eb85dc0b3c2a897c6e9967679be4573370db305d4699e99a8951cee107ff896f89b6e1dac3a3ccf6ccc751f085a254a59cb04fed0e1260300c1f329bb9baa2c266525f68ff0a81882916bbbd43691f30cb352f4bff23ddadf43f84ac8b1fee55fa8e0d1e66c1c46aee7b2e2b5bc6e2a976cee9a431cf69b42f532578fa270b642c1ccb7c6186751c644503985d5acb4565d9198bb8831c77f11f7e552a58bc9a634dea086a1f54da39d4a4820976a98c76c809b422e990401011e7d07d4cac55b52e744da072b6515394f9888e21700fc4b86772a55df1102fc477c6bcc0b29c8c3e179d6615e5bb8c4b485bc128df0a653ff00b2c5a47f6dcee10e8ed1d170f5b5df5381d799e0c4110badf6814e66210a899e3cc0dac5bb6658010ec56e471996f658ad67280d993f9cfcc060311a4b205a5108692985e75b3a6204be946aa62069981fc5e86040742d324ca8ee6a7462d8433a9e13e944cdea5c5afcb1394ac43efd1ccdc495fc2a1681198b99ee2b515aabb997edf442d97d9cc2fb4da038b94a21abcc1a94d31c4a22dd6a576540c2df98a0ff009302b9ddc04baf5ff203807303f7b98ef712826654e05740c37b5039e226823cbda67b69986e7d21957d7994bc4b99e89cc94216ab51820745f646025e3c912b7c5403a8f84152d21dd5a8b050efc7477531ce20b8224e4c1965ea58eaf32ef8ef29eb1f339703a988416f70fc4afadc54b0795ee33e7381ec8cdf72030e6b31b519ae63e177986419e5dd2fa20c142230172f0b0565cb31b6ce929728838238e21d65564895d1b4c88a676dfbc150ab31dea0a37f78e6616f88c289ba6bf93a152efa71d1f31a868eaf544c465795c4d5c4aece9a66e0cc14d4af3d6b12fa24e265a83e2662654b353b2258f3cc5f0693c1e635b88a731b3298dcc69dfb9bab4c5388caed223be514dbe61e798fbdd152db86f9cee5e9f1f5f32f1f0e86646d4b589b9f865de7b912c1ed11a4aa38627997994a1e4c53a4a6007d1259bbf5530261320882ccca40779ed2fde05d432b26352c2f8482b14ca2bccb16a255783984f42fa9caab9a1f12a7b988998308f6868776e3b625d7d083bb68ef30d340e67ceccf5a8ab9c9e639937b871f860bdc17d88d12ae0694b3a891fe0b4964df14ca8159da23a61021bc39eead47b02ce1f529a651d4dcc5325622b24b45beec1c37a8e672151dcfff00034bae6269970789a629112925d9d6beb09c36f11d296cb3185863a33cc72f5f9eacec4b4c183967f939becc41c62059f7852bc144a891a7996e8f7362206ca97b8b9e07cc7b1c41d5e08d1daf304afc40d6b31976ea7d021861dc02aac6712b1cb3012e737863822cb7996793cc4f0d4483032dcb16fed9776b2a461ad733437286a489ef2937f9cc86d326a5ad98875151fbcb2cc5bb64634f7fa44c7e2639601d557c4de6db98ae91e49731a60dce1152eb1c474514a436f78962ee104d85bd301070efbc200b8543d26152966516acb1a95507e7b3ff008dc5689a52d1c5c6038605f42bde14b848354b2aa27f3a553b7a1965111fa60952a5a6a16a68cb1dc16cf0cc8e03d452e5caabbbb8c2657a274370e552ef3f59940fa441ccbdb95204afe0d9489d166e7151aebb1e065e4a214966dbfc4d05dd448792ee335cf30151dffc9637cdc1570df4330d3d851cb102998112c9601591e7fd8dac3ba5456fbe5842849f7e9289dc028bfa20712a181bf32e55c5322d892a90f295567b8f85dc080a263491bf3328eac6ee535ae8c7246562ca72ee9a99cd0f70e49fd90e2be9e89fdf45a4cc06d1bcf242a4731dc47da67f7613dc2541e658a3c4a2c3a85d3082677c755ff153275184a732de7a8c8a72e9dbf90c1f10744373588aadcc38dce20e58c31159d90da41cbb772e2c33cc20e7a512b70c28d76f5ccde608609e72e180959812a54a207d2244ea2b78e226e2d02c3b45abfa9c1c416ab80d2bc46f0f7f3ccc66fb3d429b1ce180faa64b529414acc53d218181cddb11604a1176b8f12efac067799b2330ca11cf13236ddaeec5df1acb8b8307996db8cc4e63b8c0058e6213c2255cf68fa5e77015a90bf4e2521a1a875515ff00495cee194201c971097f28b99705279a6e3a54cc9a67d9aa71189967c4f37b4cb1793fc9800506a00d96b2b30339e8548f315798d4b0c07b91e43127da14fea0e0c9499732818e8a9364db52c25819f042873379812d05ee5900c1fdca52e7c43a31ea16cc98971212999a8b80c3551a083bccdccad9c6a73d0b61b65c62575eb4f338d4a95ccd93370c43f48c5fcc11a5d4c8c01d0255e254d41977364a22111187de739e817711f51507d032e7d1cccbf99a693365de2b89426f5dfa026711af76a39a3b4a06221ac103cc7b6b6c7ae812008f042f632da8316554143395b0c5f0aa0028277257386938cdff00502411263ea09963d47c0a496b9a03d676a359f2cc6691762a5bd01971620d6c0e06e1d230d1d8db2c9cd4bca148b5d5b0a74e6fdca96efd12ec17cbe2202b894e7994388918f6c58728b07fc8cd14e3f79bd2bf11e14cf696ce64b0a19897294f79a5581baef0aa2ee086ce328094c5cc173515e3f973198c0ca841a22dc2f4e16126212c7a139dc775e7ab254e0d96c9f8995c13c609570c46232996b558a8f40608038832fa1d0e84c7f1a8c3018aad4007640ab18ed876d66050309ac014bd79f1322fb807c44b5126e2d2735291be6504b016388417b979cee617e4899d8e5a8b85d7d489cf5c8135b943b9a8c6bbd416e8888d9752f5296e4ca2d28b8f81cfc4a33f9e9971f5530d3f042a1327d106bffb86d25b086837f8ca784af794e7bbbce4ab728df823ee76d462af3da29887ee2847a4c53b2eee26582f881dd62391005dcc8c22d1a942ba12192e70778eafab14cc33a0947009ee09548c5d39f626708c6a6665a6c407b85b09d336896dc743de7cca6faa7f1352a1968c4046932aa3583b47bc4c2f045e20c6efa672201f73b8966efecc40d0cb2ceb819ff3f87771dd43999261d51b43bd170dab3aabadcdff0011b41f306a2dd6a3926f899c3d9a8aca7cfa96517c44d063a0a804f79494c4235c20e30e8e0dcda4f52b10590d17b2383b0823031d14c15755c0d54bac132d67ccd71de2ab8fc9305c2fa95f28edc8bcc55cb37d6ff08d96f132cb83d9b9c71d918d2ac424f6ae520955ad31c1e1f8205c103be04a1c4c76265b696a289f9c7cfcdcce8a279af44742aa19eacf7659d0d4c02e5dc44d45dae54ccd51ea71e9945f8a9f840d110a4977f07a8cd23e88a3bb598af3185600f960ef35f44b026e6fc11e292eff0054e48a3df9e19c87ea306c73c9298c274ac4cd7a822e5cc0cc0b9a823a3a25cd461ae945a6c66e67c71aeea8132c3cf04114eefca0aadf44b82b6470d43f595170e89e26cb002cfa4af0fd6760fee63c095d6aba10e8f442a07b4ac8d4b1f310ade61942f1b7d506af05404cff00c94188001084eb0ef996106e06da6f04e74d92b8332ea908f712c4789f831016b9783cb1ec82b291d07106a402d6a10ba5c7c4373218b3b5d358bf0f48e8d3fac66c0815a57b877a04c2611973e2101de9f8e87fa3bcec96626f874a9da55658257a23d87516a0c8ae6fe25f0440244ddd7454155e451707055b736906389c93866925126d2c15001e252f5a8f24789c90fee7f71c97da59b43215dfa39656bd74e819e4e163cb6f5ff12b47c2c40ba7bddc37fefcb6ab3b0ffb32583018c29a8ade7ab737d0a65afccb577117899d4aaa69dc7721832d99826036f68e7037ee6f7bcbb8c35d0232ce88bc6a64b25198fcc01ffcb36f68db88db89741b8ee3139223e1afbc37cffec1b8c31fd4c2a6326a2c04319513a4b17571c916a2cafbf7f10e60a30c33455441a9e4a941375b8e5a8295f10239dd2bf4828711a606e3b202f97ec54618bc4f3cfc5a816c014984e666c571b6744163c37fd4fcc98c542f9a4c02886c877cc4829bdde99eabe273cd72c7549513f566e72ca89a90101c1997863103331162660d91c1389cb12c08aaa0e5f52f5ea71ed297d4bb294769712eec3b4c13bafac103bf714c1ddfd7bcef3b4e3e6211ef70378c8fd6633dafa37e23df06e57db38ee7a99ffd34c5a0a3632bae88d30403d823635d0ed1dd41539e8a8cca18fc9ee7a926576cd8e994c47ca7b74cf6b957b8cd65283bcadcf785ea997d45fe432891aa5caee56f317fe21fd436fc7cc5b556258d1cc34e8e66299786c83c31fcca24c5b77511fe9e8f18abc4b425057315abb732af158770517808ebb58f44cd4c05971df1502d788902894788e3d9a9b4a575b88566f11ef6b8758bc44ccb7139eddc7152f0fdae51b6632ef3731f942d4654c7786e5af481cc2e53897f9a170ccdea0d6f743dc38b700db41cc5b06b97a98b8cfa99a2b0bc67ed2e39578cce3dce7c1030f52a3c950756e7c6634e103e860995e58b926bc15104c9b71fa4acbd92d621fb4ef8db2f73b1389fec42d8e600289fec79037b61f6313f3378269388cdeb8f247a66083e12d7835d4cc712e3996bebff00733b30c50042b1defda61d04a35515b6a76ed14e0f66514edece605d3e07134d09053012f88e363ae99074aa83d18b090c665b0d901aed2e6f337b26612b166ae57287674b825623892f322a69c4ba97a8ad86fde2bdf4a589de6fef3e6236f918e6154ee70bde1ae62a0bcd4372e96118eba8aafe679951b616edee0debff00517354cf11e20cfb74c881e2e1215a60ef195779224a8b24190b8f6980b9e595dce1087c1871d704c1be664d545068b82a2ee064fda9f74989de5b6cbd799388e40b7c37ff00255ccde637c3c39d92cfbbed38f71012a8ddf981980ba4aedde62db68bcf1cccd3a3cc1c4bc25c16942fe52f971a95c62d964d82b89786f9677fa4bfb4edf59d8871ee7fb0d6670f9958eca80609ab9b0952be8c26d37fc9ea2acabb67d898208a6ce22e4950ea2b499d74c0616a9dba84328bbb94ff00b492f830733b5d077e077cc12010ce3a1df88aa5dc2b3092dbc4cae7cf2643cc16d4c31e63e220f7865dc28aa7111f590b74c92d56e3a732f6f667a105ea29e7a0711434158545f215b9861310d30b40c665d50e207b31658194df6869339c5435d8820f519b077841cce0b96010422de9ccdb08e65ef00827688cdf13b236af15980f7f30cec1b98b589895e6355e054ef3266176ee5b02880ac50429b2feb39fcfda0b4d29abf88e7b3184e6bbc05ab5ff00c7107b1ce0976fa9c7b8a2cd442f0b4f329069ea0c42eab17387d951f67b83b2fa856fb9e7e2735357e71a8e3d13b4de39b9de7c6895f621ff00b3df047e8105f844591ed066ff00b98beca7cc61989b874ae9a8c5ed8158054e5c7c4cf52ddc0c0a9b95d1663262232e27e50894a57ec9be1e72b56fedb8324e8088352ff103aba85b7b3a305c4a89e21b985c74c1f4a51c6aa03212bc3e652155a99b1b979c4beb3232ed2838dc13b406786440a5c3210a442a7079947da3648387b42b7dce805c460f01f423672f617cbe8dc2da67198b4666f8aa849c24ddae38858076c4d9de1195c7881b19551a13cc0306809682b716abccc85e7b4a202390f66560601e3b4b1698b83f18caed7d1c1f505b75865051c0e23e076ebc4119968f7205cc777fb99ca2569d7a98d77397f53bad26c4d6e777c4367a9f931d9073973e262856651383f1079fa4e31ccc79a3e6175e7f1317ac7695f1cb3d733eff00887e3753b7b98af7e25fc4e37cc2c70f3da654566d8135bb3580a7edd0ab104ba60fa05f58e349986a108651852fa30578ab164d2649e5a9e9896745ba01589bdcdf3034c6baa7f3330c8f0cc1b373fea1406dbbc5478f87505c2cee4a45589be6512c8665769863d0de70c0e768868639946fbcc0a9894df88471d1441f5861dc2d8e63ab7017e259cba3ca5a27a56d61b834688ac55518c5db17cc869f701b66d41ed34e664371f5958b9a659455b8a03424b339282f913b744b3abc40c0ef98c8239370d1dd86c9ab8c5f5c7a9572ee2b232f6b56da8f39ae25bf329b80df44a81e2899eab52c2dc1e7a100417b22e99f74b45242e1196594f340ab37c4dd667860d547f44dd56b6cef0e13bb38e731def5de2b7e581c76974b77a2155567697e1a9785f1994ab6cc89f4891abc05fb836321b66476bd7a9f3bc13ff09cf9d4b20318ef044bc871825ee53ba8ed6ff6e6d8c8848f899f83abb8e1ee4d9b948bda182de84d4ceb962414e23ae183a03a1474c4a8150b8a5da60914fb43aefc91a72f2880fa7458ba73ccb9a86b300798709b9728932c69297158768e3dd32b5f32d656f119612ee7334eb60cd3a9813a51343995446aa6060f932dacda373034f9be598f12983d9c4441e13679944210dd24d7b80406a34c06e6c61ba796663351c2c4d11df78c6dd412bbc2e9b53ed0ce8b01504c0bf71f5a61160a26c4db0a5cb00e4fd1b8ecbe2e584705e231c0d4d79d630e7700bbd3b711c8ec6207080ccb640408f118b62980725916868978304a2a12bc7d51bab78e236cc4fc4737d899bdea763ee55f84767bb39597403b6634f825bddfacc3bf8cce39c41f6bfc7c4e09fa659c78a7cc2dcab3c7696aa36643d13ff272952580d47fcf85bb0bd101b0a17840b4b421b3f56ce0e7b47e07d42d1ff8f89ff6f4ea598825310157cbeb164acdb08308232972fa2f1b6e3c1010a2fb83288352b99fa4304e997e4cbe98c4ae6399b4c930d9c8c1b6efeb34e7d4a3d8c60512aa61b8f68e204a4ca29b88887332c49c4ef255115e3ad4cbcc676d9dd895744e194b8c24ca8ca6b12177cce16a35da24aa83425aa1bf32f71e21d3de60b2ff00604b1ad5a398341a39f2c6d99bb9b01b33332938dcab22440151f94463da18d4c1a8d772ac52a6a712b0f8bfac02b314edd44e5066f031e27c4dcbe45fd115aca6e69d481de6e77cf7010fb4e1eecac87ce22a5b1bd5ea1cbdb516a2cfc4218ef51be61323f7832bba5ad63d9ad5f6852adcb9f572ff00c265c768b68ade20556edcb020edfc47fee9953c6204c975b6f897d8e799898cf8a8dba418d66502f7c2067eb8ff0071035d08c745056cd4be308b08204ef004af7958098e898efa7474ea3585133d68f8e97ca214a7cc5e750719e62a0e3fd9927f640817c90d5ca951371c98ccc93bc4ce7aef512948f2e21b4405470aa3a2e6a25cc60e9ef52f0c33bc0878bcc5f66196761e61d22f22906ae3da60301edc4c636bbd30179b50b697260bd3b6704cc3b446ee825d456678815f530b8181730f1a898748aaed1fea1b582b418d2d73da13ae9fdc5d2dd6a773399e0482d49780a896caf0fda85b4e330808b5667714e66bf4256c4c3862fc4ee1f117ed169711a089616bd4a558b4576dc07996fe67afac3cb0963c4bfbcbb0fb4bb9fac07bf198825452d9c5d4fcc1c97af04af1b8df712e1b673e639bdb30c468fbc732d46bc1d5e1c4774056440bcd3749cffd9fa07398482574f04ae3bae8a12fa7b510dcbf283794a4d456532ad53595211d2f88f39448760976ff006a67b7da652811e1232c65c189c11d47179e20ce2e561da02a89603a036770337c4ec620bc1b952cf88e054cc20285f79b6552e5788aabe63a2237778face2f4ea1c0f1510bb620cad06fc184555947d88e8066b9312c40f75171ac3146015da0e46184344c9185ac4e58ef3683b74dfa3ca563bee0c5036271311ff00a40ae217b28e194a81ccb8c151fb20c536c7417c3f332367f6877baa95143998943aef07a3c47c6228d372e014415b7df1983ccb88e2a241cb9861b8ccf10a0ed79c768e1dd1f4f70001db9996b8218d199c6e5ea5fbe87a867e9f311d2af88bb6a7c5c40abf5ee521db6c5c5f4417d43304accd87389dd89bf539e6f8e9bf0b1566bb87882ce3c521eab969a7dcb1823989288779812e338e979d8e2db18dc78e1156427d9104af1329842034310cb46db6bda3590fc3f116f11c242beabb798a4bb1aff72a265770f11e0c7df5076198609c54c66898214e37c1366e25f0fcca2d97626c8cc0b67c9516e51eb2def998a516be20d43b741579423885f5598ba54b52df680f67b370e02c0e341b86946094bd6f3539e21c302b533ed982988d5b18fbcc6119e60d31f303f78546981907c4c03be27ca2515ce6653de364ce560fed312d6ea6f7cc45af9b882f6c172f4567ae65ce211d7b80148af312b395e21a97d2ee012ef01314f58b982e717ff532c68942a0f10b87a8579e9882be5008b585e61ddbe095fe4b8ba7f6c54ad2698cc589df44d3d7788bd3f49d8fcc5fac41fdb9ab50449d9779b6ebb992076cac3cc7cfa3a91661365a98080768040768952d4521711742a5ee5583b94b8943043d9332df6f8b0fd0bbc6757dd3352d6ee52665b4725cb749294ec4c7b86a57227a8532aa28b00a94c06ddc6a372d9f101bb1a9709a8cc2ad2991655e6681a212f31338bccbcf4184370caf99cdc2940e6adca0005bc51d13f24c735dbde3cfca162e7ee95c82a445ed2d82db98bd267c4604bd9be35189de28ef3886e11e2982187cced991e2516896c6842d77159cf32ea9e5d30561b5f32868a4c4ecc406a9c985000a08528259b9ca0f4ccb9e25cad1a7bc3a654bbce7b6596100ce31b84589da712ea677f68b79bd45d042b5c4be4f467ef0b978f897f985f8f9e7cc792b46ff003327e7eb2bc06747fb2e386fe8dc06375dea50dec1de17afea19472130b0d57c43b77ed346e1fb896b0b7e937fb991f11eab9cd642052bebfc198a9890e227885c14dca096c8937631cca3170a77603682d7713b9b9f421a7062d9cf74e5377b1994c9e20ddd5a9badccb70e825b4cdf3f3049892d61de0b24da64bec540aa445ec27c47054597062506a618facb3ad4718831db52b9846647b20dc7411dc42802545d0435361a89761068389455cc85f32b4b8da2269b09751028cd272f478c100d777f5310195b7ae20b1dc10ef0ec20451c32b31af2ca44f10336ad078811b27bb05a18957391df69a1dc45d65a00c01989c7c8685ca0b04f32f5d6ea2bc279f4207534bcff0072abb3a0f10d2dce07fb8622cfa84731c67e7fb96d871da63a183102f2b2e83c4e50bed2a04774e01c1da1707c1dc380b688241a3c7292972c6bb23e502f570fd0959bdaf9ed39e5671ea5abdbe9334a9747fd8f43631982970b0a332e62f5b8cd234f7042bbb34902b7b6140798d47d8f52f5a975497333ee01ccb99d4a8b6309b27d930426452995358d6e09e353296255380b67d2e1328ee36a5667f45378a32cc9320f040ca3b553b8c1c43285cbdfdce6553e6c8dd525287bcab46884752ef8097be43092c3d1ea5e1a081026e5cb013e67e3095b8dc2aa2e501ab861534a860bd42ab3c311b96369169aef344b20f1155602edcc1cba710ed7b17b13220b4829519711cca80ed98e8a3bc7ef45cc3f504d48d83f3fc9637c9e3fb86e1a1fb4c187caf1ee5acafb08bf7eac7b66593cafd26514d1656859a5a1c730672649c1da5895328c06177d0077b81643e7eb158117b79063b08ead2fdc5bdafd198793e638ec82f730f6fac0ae1968ff00b32c2f8d4b067e2a7ca39c1f8991f1e23c04ac735d2e5cbe979946a66f88ba787d61131aa42d458beb2b69b185b799dd7c422f04552caac35079a506e2001f88ac7922c18101528a82e7722b26ef6959560cff008845582f1518b66d26165dee533281123605cd108b8a165213fba3eb69b667516aa6aa7b8d9667b960871cccada43316e04a0af9666eb1e66d9a3bc04945be21175a608af0ea7e3e117e7485dc4c620a5bc6f1895cfb95af1702073e260ab6b88604df68dcc214ca3d93bab97a458b984070b9cdeb57e102a36c68e2066ce60c26bb4712e299da2bc5e7a71d1893ccfccee3279f10fb7117d254ff0065e37a95cc3bb856f355880157dc158b81576abb8141a432f5dbe6797ccd6b72cce5be66f8806732f9b7c44571bfdc4ac5a773d4318b84c99d7b9dae5e33366547dffe40029d887ee65d767b88c1308bff00c9467531bff22dcab5e62bdbef3725c99f22fc4e197fc0dc35731a60f936788ae2f71a9ca29169e604ae1730f0def02e99dd0ef30b4cdf24e2b81ae195e11f5349a4851e6554aac6a392d1328670b3b405939a258a314789b8ba6425005985eac87d0988ee902e441cc835009dea2d7db3329a9b44e637c1c4094658ea907e476ed1a86c464a945e63348d407c2576c4c2fa84ce68b854f962ba295999336e01e26069627c4050e170eb68e7bc1b9e255b5aa8dde2345da09be618519fc228795cb617028b85be277ad5f30e0b94b798ab7de5461cc220fbb0ca419a99ba3abc63a19cb85c4b73d0c4ed1fdef1df699b789cd9eb306f6afdba9a8e7130657105e3508e358f19c660bae796069a7c71de10adef2b2a96caf8087887a9a764c172daa48388558c7eb7159fd11f72bdc73fb52b46aec0ac4a80d1e2885d40f39d471d90c9fa9ee05938cc185d2f3cc10defa9410c2c5e187241ab3b350b41a6ce95927108a1622531422b5f998452c1b51dd71af00f38677572b8095dd89966562dc7866d85577044964a8cabb487c15e37de25841f7bda03153491da05b9d8634f66b5c413764133eb3b60b8b982abbc6ee19dc8b865ddeab032450af7944347794a8700a2a1915ed291073195775328f408655e25178ccb3c4c9ed7b4b1c90dfb84fc6f352ea5915e7698a33053653b8aa0f443269acc75b2fe1861e6574f0435da340e4ea2b300f508b2e33f1ccd9f3141c8dc1daef10282191f12c6bbc7faa56bdc2da8996dcb4d07d62155fa8cbe2bfc873d3ebd2e5917cd675fd4f663cc25d2e284efd1d4ba95bb667e5f587627ddfc44efff00b0bdd7cce5e5fb4a0cbb99bce27dfccc16bfea5da0a2eb35550a58eb1963c84f35996d50bf0ca71f9882545735fb8d06a7b6c82750ab9086cd99ef11c4f98715022a377ee6a7c04c4473d4307b84b8afa387885bbd9da662d4cb6565f32858f9371ec32c23b9dd6200b22d2a65166321de6198239868046ae6b10c9deffc4b5c08d7a040772a9790f8a195e6ad443dc70dab3152fbc01951a9ac73dccc2d9305703310f10e2d5ee2b50f72fbd4702f69531de2858a9e61cbbb2bfb9a9cbd434b09608b789e085d25c006dd39f73215d84631970f64a713207c4d3b56ed62bbf6dcbb11e4646c6790302663789a1c7986fe2321dba52167fca021c2f700b9692f68b2f772c0d221eb8162415710c5ab7297383de22b4394d01515e12d351561aee37fe4a8ee84dcfded38ef8976f76b10fa1ef2f29c5659dd79cf47bf69ac539e239dd33dcaa543ea805be67f919d3db5da673c12f3e22da7da7957bca32592dfe3bc040adc39fcfd22015e2b22c6e9e6359d4b79afa4e76402f63d453b4554f2f454149e38ccc986387895d237fb97d332c14619e9ab70d742905956e0c41a6e9ef1edadc6c83dd31ddb8798e0a5ec9c4d5b47eb3b8ccaee22895724fb098a70c334ca746003ded16036cad278c4398e5ab8ce56c332fa97597e7c4715f048311e5954096608d4e0151f151ef81badc152c9dc2c2562655e0843858ca0e5db3299293e025082b303c47eb131f0861de1f618bf84056b8d42f4dd8f9102b85ad046ccb1ee532e59a1deccb755d9f7732fce1fbcbda0034f32b1bdcf6621085fda607662f6c2a384aa80499eef5372db1c2661a086e6f5c42319f98a5b5933bf682ad88d9d05890f23be9fc5d0d9a2c336b8c788400a097c4cf319cc4efbf306fe8d7da0d5bc1353b74495de78ac4ac87e9a9edb7bcf7f4ef1ecfd097ffb0febe67ef963435f151b6d61ea279f49471bee54a9baeee6882b8559cf8f10977761c9bffc8eefbf9cb2c79fa267fe307c9f1fe4f6227fe27094d17d89872a9dff00ae868ea7916e33b9de38e93cc330a09431e930e2c862e1e487c620fe932159f12d95f0626168e5d7d2529c11350e6d464b7a2a3650b1c263885c5f3e653ed0c57a851dae64449cc5a8ad3409df2a9da3c1da69e632b5d424e75e2665b3afa8b061500d5821280b58acf209c6d53c208ae794a58a1fe563ae819f11aa2f13c20a884dcce523319f5251c23c156fb44ab6f253519c8d3cc43aee5ed51d0a6712d50775e212dcccaa95ed2feeb8633b12ae615a62f5282a453c35186dd4a83ee086e1a851e8225aa3e8343332cc610a580dccefbfe0814ccb57f0054ac788b58fdc437f795d9fe895fac1d6e6dcb64e0ed38ad70eecd1357c798f951df9657c66614f307c00b5fea1bdbb172f3875e48e6a90e347cee77dfee25e90db577f78620c0edfdccf17f1332cc8f627cc3636b71da009af8ef1c2dfbcc1c3e9316603132839825790811c94f3d05fcfe60cb08a6495d994f47d48a5e0cc58bf2427f2f42d533dcde1f701d9f1386cca9b6606204aa8f5c4101f8103975d928ea3bcb72d31e201e77118c95c5bdc7efe0859271329c5598ee1886a614ccc4c7bdce05389c04d8ce3b55a2a5a938808789a4b1cb3a4011ac421898131985552a9a33a8c77de23d94b71da678b4c35c464e0846b06a23b71821854797b440dbdc6afdea106569a19480ef30c5808c46e6d617e61a6b56098dd188eb8d270ca309960b65685332b62c9327ff038f5ee197f59bffb98fedcfc7d30c1c7ee608608a05bda14358c5daaddb69177e1a6892eb52fec4f59eecdf9f13bd65f3c4e70e7bf04b74dbcc764ff00b31617e95f12dbf3fee2df6af50b60fd6a771133e7e638ab0a768fccca9bde6dc12c391968a652d8c04d0237de17acefde7cb8d188b4c955ed1d9708ef825ae31dfbc744e5e672f33698d69c3e7a6f1f30d32a96458185208c45184f4f189ca1f2978b1426eb8db08c07988895b13a7af733f17cce4e20d351c986f32809898ed7cb02d5ed1ab8868378b8e28ee0b8ebb97bb60ad0a4d73896b2f24a20e096eb01bcd434f86ca1db1399de09efc4a098bf5e11b358022d178932a7a51554316aaa81cfde5ef3b9e608aa96f112364338a0bee59c732b2e92e23c44adcef22cc04e06e0f8c32b73633048bcc52ec254a17bb1037c218c97167f84048dcc202984e99ffe068f13ed3d7a9cdcff00be666e043b99771ee732f6405f1031ad4d20379165dccd324ebc73294570c797fc98ef93b47fd87b5fa399a6d1c0bff25e285d9715ac10c765e229d15de0a61425dddbf327093ed3630fca2e783b84b0c6fcb446b6673dc9c1337dee078fa32bc7d5099bfd63a78bface1cfbe6698fb470983b377ee6fcb8c5b3dfde2caadcc1182c9427187a3de779352ac3d020af7d4b39971a60867702fa03bcd7419df4d4e65c73378e80870546de255bd2d75c442b42704bf6e628a079e217110c1372840273de57d62fbc2a27697cb28dc08b92a423a8f12f5f2bf5e2544370408cdc392570b75b81825902db0b9df38578965d622bdca2869baf32d10b651f0cb02118cee03ac8dc52d645e0448ae6d1d5aaa62f056543f76abd439bed2be86067c6406b5ea6934c0487d98f52d8ea5533833ee55bd5d93b135105ff00c30014c9bac7d60990d76cc77e6e6cf895026015ed1c04f3f31c92707f582000b5bb33cc6ac3d4bcfd529a113461d1061806d5755343813e67955002c2a057e0f30c84aef129d7e19e49f485e51ee2d55a18b01f1e33063ef6a3e43e67ef6945fe4998b739b71f4258251c6161dfe631b454aa9fbb8952983750c15f8ddc1463bee9f49a0c3cc31cbcccfee66a6e0a63c9e4c144d45cfda6b104d4bb1cc3b2038577218edf87d2358df6bfb8099fbcb3a7a8c589d75b4416be3966134eba02372aa186a1abadc193a1db1186a0815a0215b5397b4df10ea1c37041dd0b656faf3c398cde25e71d029da02b70329d8856a012eb96080dc813058b6b1ed58a7d670449adb1307cbd40fb4c033d84b990253ec1c4a00151b4617af994ac767bb44cf6b94477d09925a8b3093125c1b0160c78822ba50ee5880a5c8fe9c433852e543ad9778b9649f12eb518c8802cfe4f04bc176cc72fc5f797fba81dbcea13016ba87f7345db0310159b5f699ad8432c2eebc4c209ca6bbb82e7b40c5fff007331b2ef987830d684f77f2cf97e6525d5f5f98e554cbb45f02f88ff00e08a0fc9834557c7694e6be63ff8a7a500b4293d609d862a350aa91cf2f681ff007c435bfef30aed2dbdb388ba578666c378f88768f64d30f24c0bfeb1cccbec99740d4555cb89aea0824b39d47f9e6ecc7794e3a21de784de6653b688138b6fea5db59798d9021846aa5406048cdf1ea18e1956f6958bb465c2ebb425b7f952f68dd8e47a4510d5b71897a986b298825b47cc064b370d8fc626b8132dd410703aef1e22b3174f7a9822cc1e0ac13ef965e20cb8e2c1709297a9b6823610055a6fa58c192caa6183b0dc68670a4aa33982244a8af301661e2520879b151f895068de3a0dc0b788bed2bf007e61068dd4d7500d40be039967032ef3572afe423007d271f1ea7dde2138b2e1a6076ba8a999706fa071aad99b0f8c01ce73509a03f87799ef0bb64f820719fc932ddcbce603bdb5c4a707ca21ff003b962abf25c5576be3314194e038ef9801b4a998069dd4f4c5af3e8b95bfe99e4fa223963e11ae07e84c7c35ed95d9f59efed88343c7dea29b8efcc55185843f306abfb8ef9afa44fd26599a4afccecf64e751ddc608c404dc033496741d239718f336057e27888ebbfd2e77c3d95f98bd07de0586d803ca8c0132c3cc1dccc1995a3bcf9894d7152bac166989655b83b73994805e7177b8a05b5f332ca003695c5f11d9ab25577e60a571b3034c93dcec98801bec8e659d04a50b205ca2ccb550c50b976f30b551a88f93a9a103e882146d7307cd563dcf0c02f994722e5d112ab8364080a062ccab4805c7684d9bfa48217a732fee5820facf12dd273099452a076ef288a0b7530752c172bb8087dcc48ac1fcaea0f260ab2996ad4fe5f8af52cfa234ed465c57c6973763596e61c4f11d9df89b30bda6cbefbf52fba8e50e351d18a0c5ad87b5b81ae3c107388e92afef997708fd4250a527c905e61df03f30773f32ff002b9974e7ec9b53d7a08a9ab070646ffc9c5adfef68af0b1f203de1e78ede5f73e4fa472e7f012bb6210c68789f7f2fa8d0d5b5ea3944aed11568d887ed11c99fbb06f1da29b570c1ccc28ff7957d492a52e0e3c74544c25b61899181dbf611eb47925dd62ef99e01dc9c907bff00938e0aab1cc6b85ea5fc0cf982a373a2b714fe7a4a47e9936ab2ba8690cd6643350cc00c86619b487066f716c72b022e88e30132bbc70b68dd6a89e58e62c7aed68f50119ead3881e1d9141c7e49758171a3bc7da19c5d63125688ef7ff11aa988bdca44cbbb54a2a618bb7887a022e3d140a6589f730ac44487a21bbddd04dc604a09631715d5ce4807bf53c7ee0326841cfaa305ca60aa61da0c4ed744cab8399b0ef6bd4cb71db172417c13eec5c05ffefbc3be26df9f710a5d67bf9836777821b20fc42aa7fe22e693dfdc22aa13460974bc5b99cdd7f52ce2abc13381fb883f6e14f2400dd1f48780f654f0b3f49e21395fd49eb1e770be4be433de3759a38e20600cd14db5e65b65fc4af71f30895b5690c727ef98b0d36f5de719bf99933bef4511f15f1de7383fd8176c9a580020e335b83185525c3e7f12f26be08df983a8c34f5f683eb8f0c41acce48f32a12330511693e950923296a0e530f726db47cc1cf533f10061b8d9744ac62898b57b202ac8edb8eb84aa0df1096ed1070326631edda2681960a327133f3cd4b963cbb8a2aea26855019c59776554774a957b3c41432b1333c4de12a58ceeeb55bda24b31fd4c4a95cf6973c3ee80655da5f82cacfb941b90a5588b42fc4b2dbde10ad4aa19cc72aa8312e06d8961e2789254571b6384fb83037dccfb68a8716a8e895e589bac2aef2b4117de78df78fcb9b956cc2c7a3ffc0710cdac4c9c7f501d4d1295c3616f3c135dafceea3aff0059bc67f12f378edab8ed15f1788db9fcbcc4296f406d0acd3ec8565583bee7b13f59f27c9fbde0d83e503ff481f43dfe65e6ff006dc05b5ad6622afc47ff002d82f503602ea8e5f583c53eb05556fa46d97c7ccfcf9ccfaa79c475dcae35534ef99610a725ee59b04f702feb05bff81348f0bbc12db5c90912a6dee0d6260dc3498cbfbced1c46d2dd1a8ec0ac4d40193f8987285c7502bdf456e1c214654c11391f589a383da593bde586008e92e5fe93ca52711180697546a760ac10415a852ede2347dddb0c052de63ccb23e12ee68cc186cc080abad4145c6e38c32adc592f4cce3210438c62548bd1d31baf40c0b665e60f03714ab66263d567b8964ac150ca9fbde57bc0679806c981bc6feb2ce0e9c002aa7f888fb9895b40b6c18099c965ead18fff000166ee505f79404b5bc625f2c839ede0bef17368beeb95cb66f68e7337aff27afb4d7fe46b9af99970d57389d9c5c7b2fe950d3895b26b98d38d165b87d464d2c9df32ab20e39873f912d5a620c63ea436602525b75c4200aef9b73323e096ef7cc36d140b4eee0f1d39edf797b16061ff00b01ecfd66d8bf887c1ea2772bdb3e4ce79f897c1e7a75dbf30557ddf6dcd4aef1f94d9ef3a315281b778e37a94820d3f30ce393e20de25dabbca3099ff006444a6933da794b8650e5d102bf8c2030e19f5695e1fe12c6e030618c0a7a350511c327c4545d4d2dfe661d9943827c4ec19f32e622745a8d3021c106f571885a948751bf11472226bb12deefc4022666302e6674333814e20b58f2709c02ed285369af61f6ca841d4b03a2ccc73da6f55391b20eedbcba276281152d006a751b2bccb7ff8a09497282bff00100003ff00c0e1d17ea114f5e2608543e9e20564f598d5e7ef32ee3fb72f1f1e89dfb7898aeefac5a2f48eaebf5ea0825f63b392dfdcca530d6d87d305104e8e3987e99cf0bf2cd75f5431c07de02537ccdc69ccfd5c6b622052a2c3618ce2a16872b17bdb58994d178cb5f6cc70679ef99beff820df3f4979e2feb3f4b2eebe3c13193130110a35db6f33d4b6788005501f48e77f783f6a2479fb4df6bf706f577eaa586a5e8cb730150939e7eb1eef8370ee5f4263d57ddb17f421501be7b474ab97a1a0699dfc1e50984f3d552650a986a2fbb1d85918bd3327895d06d144b2b489db103ac3f78adb77772e08410e4892e6ea6db659785cb1f30608838b986f604be0094aed1434788e607dcabf21171e7cc7834ee1eee5246f8d57a88395b185ab5732c99dcab1f486abb23c5292cfff004e7ff370f5bef28ee59f67c47e9d1fdef2e7e7eac7cd7ccb6b9fa54f18df786bf5f898eff444653ee4158f071e66b81fb50cf0fa7feccda7d7a43c57a8f88b015019d54a9dbf331b7532b2eaf134f970eebbe273a2f388f1a9f3f5ff0020bb9fb89876fcc7cf8dcf93dea63d819dcaaafcb3734fedc61bfa6d8378b0f982ef98fd5f5979ca0fef68b5aee7830807b74b246af6a896511e8328f42a6666c7fd82ed2f3885ba4e993104e967186c661d632c319c2bc8bdcab6cdf30794bf70b00d9c757ed9c2b2f046c02e03d7a37938a1a3107b885130bc44ab2137188d8ab7e65e3e2b29c2dccfaf04d89cc772fe414a724134ff00f902b90f52b1a599ef7e09eb13e3fd88b106d9902def76cce2fbd44a54ac7a97d9e78252ab063bccd73f483dc7e6517b7da5a6d11f9430f27ee22c6c7f32975955c43dc066cc789520c9b8543b53e9801feca20ab89e02bccc26926bc41d81f585e6501025d6c8f9af98dd7fb89ebed13d1f79977f11975ff62307ff007fc892b2d668d4362e0c67bc469d1778859a71d9d4c734f4c2bcc0bffb2ddd7e5337387b4bc7dffd97cf1a8f404b654b7e8c0e33e102e5e988ddade76b381059b352a416b88100f3130b312a54aa9da574373c73310332917c4572de6b3f58a83c4b3f5ba25029bd25a838f29a3ea8ae570004a975a1280751845e255187b86148712b71b506f71ccdcc538416395fda1abbdc793906b0fe152a695dd9812d3981c3bc846c7ffb852b41033dee674bf074751dd2e6ac85e16a72e888a257266f131aff00acd65f996d637e099f9f732707de7c1f59f4429e079c4318b4f7f49a70f30d31f30a58a53c556ce2647511bb2bd32827cc6c4f8912c2d6d9e483dd45ff008cf697a456cc1bd4bb728a00cbcc42c56aab371f47b62fd3e84b2fb661debeb13dd8a2abedb9a3f98ff5f5869f1dea21d8980d1da01176f2f765625788e2b1b95bddb39ff215dc0a8cd64c7219a8d111f8cfc4dede595b4cba1b4033f022918b64bea60aed11d112a831e498e1f9845103085f4c25cc9d2b36cad435065cdc06aee52571f864615f594e9472fc90bcdd5f12dc5cbb9b40a87441d938c53e22544ae22c352938980de6773b8647c74956bb67655a9815a6672066e51b32ef1f73fc94dfb5352b00b52a72f8224c32a54a95d0ee4ae5b92131b9ff00e468fba787e2a6b8df6fe0d4a5bc9ef12fd7d095787da5b6fdff00e46d98b0e7e88ef1fd6341c939d5f9257c202ba588173c325f68de5bb423b4676ba54a0479625cb3196c4bee63414380cc57ff0093432fe09df7e1abf72b29a1ff008a9445db5a7df71f8afbce5cbe7d41ecfd08355fdb159cbf623bc7d88597aff257bcfd58ff00510cb751f430363e7981d0b2360d02b1393734713dfeeed295704461c30e961621faa22c38824660b8952e39dcec4bcf1265957061a88aa520b2ee2747128ebd2bf3d7e63be61f88f17060b778e89dbe10853bcea1db1e46a6ae0f514548d4abb812a8e30cbb477da58698b32c9ae67ec6a81f3736cab8cc942d389634e6a64d2c58cb605288c4f3b311b21331de547f85bde05cc03610ec417f883c8a879981c47e22c7a13f7bce05fbb35ff0b8dec6577f825ce12b4d57b9677f6cc0de1f8d41bcd7e481fafdef033c2015af3dbf32e95a289cbbe60d973e6fd894e41f31cde0facb1907f32cbfd50bacddd73b95107cfd88f82cfa135afa1355545eae19aab7ed35d8f6dca0721c2f8f32a45c68311ad8ebe847e75b9fbffb3599b950251304614a8c346735eb50e250aca10eea6f1914eeb352e5b31298dae3a1f821b379971f1fc451a8221bd12da1f58eb2b9e8630832c011b4f284561dbfb30ab781def2769ab7d475cb698060f1304e5e605c04e92ec90ece60ea172e734a6d01871016bde6360474396571cf31507afa4b2b205bea1525027c7d667589e103a44125a2e661a2334c2e03cc19c4a79a829b952a54afe42ef2d99e807dd93b39f132cad3c704cc3e74a6f1f98a68d78cc19dbfbc46a37e7bcfdc117bdbf4884366ac97cf6d89ea65e36c6575860e7267dccb17f56053f2d305700943c967ac4b79ee7171c5d623c5a7d7717550a7e9ee5714fc4144ce076fcdcdff009fec7ebe5d4ee738db03fb808fba99f37e6781c7d512bb6e964e3c47a6738178f662c533dbd9b6683cc3835599e3f489cc08b1b972fad4250427199d95a8f70976dc7e73e3ff0021ee5f8bc81666fe94abfe2fc4b28f305bfbdc4ee7d1f896e350bbd99f3364bfe439bb4e3a2fe00bb84c4b9eb1d54aa1a4cc346c04adabb9e65d5da5a5f44d6c727b207a48883dab89946ccb307430e21896bd844532cb96665cb3e9334d7f49410ea065c4ed0a35994581b58e4be5d2cdf1f1027b5667263bac1da30cc3237a3e6773cbd5f4a6d5a86a8f4a952a54a8e7d654a95a6fe08a8b4be08d8b4f8e819d45ebfb89c9ff00b1cf7fac6b9afacc5e3947c1f4cc23920ad0dc5aa30bcb9a963b9ff61e118709256f4cf33e5f9c128ff237afac5ea6646a83781a23577b8b755066e8aa8d3c7da7de79fbff0091ef5f2ee7d7e58eb97d6a34763ef37dff00153067ebcc0b294ecea2ae6daf6b61e7f3e677235f79e1ac7115fdbff930290fe906d71ebfb952a546c402d7f10016e3bc58f69e853925edff002001558feba5c5e655cf1d042106a7af26feb1afedff00b26ae019767d496832c98950562540e831412041eb47a6d0c4789b2639aed312d656e268d14a867a7960dbe108cf888f9d651f613e825296332809642f8b45d14409c220a0f3188ecdc36ddf3d686399a5b3b7005ba8f5fcc6e3ae609db36a201b45d7777091ed1dfa4af29139952838a4d7fd50ba98ed126b8cc3a6632ed88de16274ca97da61db53476f88cdfdd90c6338ea42df8eeb32dbe286146567b4b1d7f6975f5ed2fcfd498edf48fd43eb305abc15982bb8b9be483c03dcd723e2a366f7e7717138f6f3af822ae96f3a8bb3ea962988dae3d3703b0b4c067c7109386d529b999f3be7bfa9878fccc5f9e671dfdcf4fd23476af732f7f8c4a5d62ef3cca2afef177f9ff27ebbb2fe9f622d11e773044a6d8ffac0da453ee59fbf898971c75d9fea22bbcbefa2e65cbf32e202912775268572ff00b0843737fa4bd09de554e6b510177444a9e5ca5257efff007365fbd05ecfb67fd225a3700dda1abfc9997ec3c37fea17143b5dcc8cb4c40214d45f23a17afe18a383bef07aea614ccc2aad4c15fb513370c5f7f33299e254e86531bd5c4c533dde301cac011c13783318e08caaf77cc9c7c44510629a7c8619f6f07fc98243c9921a57d68c769575c796b153365418c031217dd7e2647b99c16973025831e7e3101d31b36ea54d4268e927741ef07a8c35df1a956ef7b7f1c87050e82fccd42b1fa2160b92b0552978ba353ebf59c1c2a6fb3c7698be7fb205bab3c6e7bfd7eb02fb3f150f41f5054dfd27ef98e26dbfed817bdfb88bc7dea11a0eef0ca6ab67ae15cc1b4635529fbbe8a9740e532be3c4415292ec378c663e2253383cccf9fc54f5f6ef165b2bdcca73f89de7c543b4f799717f79e9e4f3d3efd036830022a25cd397031b940f73ae54bf501bb5cc210854fde74d1ca0b5cc58381032fea36040c1f6cc4166e2d30e5d9a43b838d43c5e655595fa3e6305dcfd265f9e65c1eb032ea2f4b2c14be15f2658df76feb1bca00f87a20ec991d3284171ac8b8097aec9c132968cace11656ce0a4bfeee2726d79d40e1fa983188b52dd14c75ed10b7647beaee76630c022e96a2b1e2a15008d635c4b3490e2d3825e4ed9957917f4e803eb303c4007d7a596303a11767480e67387a75e3a733f7ccd52fdc6ac76f01302b182b77d0fdc332fbfa31e333c8f922932d134d8fbc39dd7d252f2ceea330c6cf129cd128ed261d1f7946e35766a7919f2d4cf5faf2cdfefda1416ad5eb9b711a390aacdeeae550da8e26bdf8cb39cfde55fafa4a0f7e22758f9ccffdcc35fa4bd4b8af45cb9708423305a3d4ab936766173763aaca81096067104ac8a99fb1e9d57317f6a1d81ac854cbb2292f258b52bfdfee5135063988228b18492d65bfe98d64010614e90f43d03a6190d071fef42c33572b9ff24c12fe6823ae8daa2f446af89444d9634f9cc8f64d1f399f487e6000e2142622399c87f31e8d1e270a3dcbcd5de0944970c116a52713313b92867477096f85f88561a854e0a3d112d8217db3a19cd8549df1d15de331fe4938953d46bc63e637c2c5637dbe3737b2e3dfeffecfdc44bc9f4838a547e49c1b5efda68d79b76c669dfed1fda88f784fc724bed6f98fe57de5519c7d09c7fca8c9a774a49bbc869aef1bbfda9fb89555afcc41e37de31973fef620b2bbee960989145170cc3cccc7f81d0e8bc4a8757a10212b1f13955e72c47b2bf5946658bafc40c03c47b8fbc20de79331731613884706ee57f730822fa0294c73a712120f4751093de36e65dc40a7f4ef079314150d8c4d6d5ecc228093653c38977eac8247c4b45e4752a113f12a89de612039d197e2db4462faf12966af31966bbc0e8477e2b0c1d6c7b6576bd4ced871fc4ca06684f84416c113d9d1911587680952ef9598e1fc799fbe67f7f3d1fde22876facdebeccde37f98a05bf29e799f44cbb3f9207842bbfd08e50dfd7132337dbe918e5fa6e65dd23e1f7983457c90c66fe8b9864bc7c4fcbbf8e8fdc47eb5f42645f15bd112fccfdc769afdb94dc5376f88d9ad7bde01e62d8e89baaeec7fb387a76fcff039b1556dafc4dcad9463cc2e8b3abee8812b8fe442105d65c4e56b69988ffc963b3f303277ea5caffaca5acfa965ff0011745cf64437a23260bf70c78fb4219a35e389ee6a02f05865da6869ae3dc14680b9eeb0f0ca60f74cb6b006c72f32f83f7772fdfd384336077a4cb0956991bfb92bc788c4510df4d7896552d798f24f98970411e83cb4c93bcb7b5731c85212c7e92f2b48f11966d936e252359195a7751a5ac444a101ccb211aba368e5263be6693bf13610d47f85476208e11e061de5ac2b33c00422bf81d3f7c4dfed4f5f69a7eb1bf399fbe6712deb1c765620d835579985f1f8c41e981e0838efea7eee1a9afdcc7555d37cc731215caa52a5176c9fdcc5e7f12cf1f56536a94367e2781d19ddf7627feb2acfd0863eba26bdf89b6b3e789c262f6f68744e970d9b6730417341df6f4ae815474d7554c1f3cc7ac68587a89c466efa7d67b161e5c426e269adaf625103d31887eee00a58b4e252fd0229535dca9459cf980957befa978ffb3235f68ef92b59ac4b97310ead62e254f04a7998ef3d6352bda5aefa9ce20f80171fb054fb9b7ee5cae22458d2665359d0b8b98a5a88e6353d19907a2362069691cc692ec34750caec626659acc60294449872d180b7145ac4df41251116ce957afd24e7d19940a72930f450094e6d0172331d75a00e3a73d3f7cc68ca84e63f21111763b8ebf49876facbe25fef31a0e46f8fd619d57a8abc10f97c4f89f7864b73f8e9f489bfd620307b11c4ac85b2b1f5992a5b8cb854459b5aa95c7d65b68fe67d7e92d79e39b879d7da1fd7cb3e0c7d09ddf77fa89fac7ebe599737999e3ed17410fa99cc7773f79fe07f8f8877e9ae8c390ba817418505ba8674c200225834be204e01c2ff00c8be3711794f75c4ce25f7d6a7ef6957fd436a034bedf59a016a6ae5652fce609651adb05b1f0aafccae2267961ebedfecba973532984429f0c20a95493885ea36aab8944aaaeccde8c6f0fca297bee6294d0c7de086a9d88788808ac78331d98b4d6225c55967ad24a586a67d2fb26adbdcc905c0f5d910394a08710e695aee8e646f3771665c033822c133c9dc14a6b167998a5a4d5602c330ce1a7663a8b0253a83f7e13e13c91951ea21d283de6b51dc51ec0ee61c0e8d643db3032a1957bb1fda20f7f497705da54d0cbc563b4a77485789ec43fae89e253fbb7dc45baf5888a12f9a20157fd0ed11d84627957d583e4fa5c7df7f561dbebffb171e3ed3eefbc71e3f307eb1317f99bfdc1198b0715f30702abd3168a12dd5c64bafb4fda679945195f89874bf1d6ec598bcb9bfde2550ec609dba5f5667fae5ed8afd60550030525d34b3d39deae04e57b198db7cbc2078caed5dc0b95fba81f2fd6616ed804d5f92584c59b2af11bee91e0a98e6f8e660c155d70fcc1709b1a1edf481aaaef3f59827edcfd623a27230b1b127c93da782e6929f389a1275e18435084aa3038fe64e5c25dfc4ce398e2454e44a46540bcc90ca485f34d907c8336957886fe17e998b4b79963055323179872476945d9032b2ba3c254c15f9963b54642e618618945b9a85fc30354fae9a08c1ad01165eb899eaa78d0974e46025ff0027f6e21cfde518063c151d3459bacc6e12f8fbc47cf40a9edfe4cb98edbbf474e63f1fe7a89bc7c1b95677f0608fbbfc4478ccc5e3eb3dbef2df3f683efeb1628fb7fb2957c7dbe679fbff0084758c7e6271af1b6387f6d9ade3ccf70763d67984d3a37493013b7150797742f2d040502d7dc40b5af330c255e2a3538ed7728e0bcf1f897a0ef9eb5d476a3f1c4b304a815da52f70d435c5e196ef6bed103879bf043bbfd4fdef2bf752fcc02633c713e96f552afaa37848ba2c57bc05c13e269b9f8e893cfcce4664d4a4a8681f2fe21084b9a88981bc987c470f6c30ca5b2a10a8c1af7704a061bca5c79704462f73b21e7a5b08e324de9537af8cae9831fad12318e238e952a2476c224d7f908f99566bd466ea712a3fdbe8e66b1446ec60b7d077e1053144bff0e21d3c73f58f37f78df98fafbc7c546a3c75bd7e09faed2cbab2e3e9a7eaccfef11afafd59df4fe26eff00bd7c4a53fafa4b51bfc4479b8a73fd740f3f78700fa9f113654d3bde53f6ae6b175e0db28763eece7b7e65fb82a9a9fd77ed12aa1bf9bfa5c6fb55e6f101a40f8400060848b82e607b979ede2e58a7176bf32a89a99ebfbff3f884f00890605bc1df1717058198755fe21ace47cc1d16bb7683a95ac63d4a5ee6bff23db2bd172fcf13f7bc22bf6a7be13265184559dc04b2bde3d4421084bea9a9c70226866a7965de522f32a0f95b9a4d085e8d47bb6732e1e23b33136ea270fce4b3abc6a8dca7655cb5d0cfd0c2db3a82de5094a20aacc648e53354c2217bca23a3d2d1977f31a908ace21f4b8540859860f73cd53e7fe15d3dff009389fb889fb72fb57d237e63f31f9fa9d17b9e241abfd2ff00a82305ab97c7739973198f8fa76f71f2d3fac4e78afbb01fb983c7d889fb53e3f32d65b2e68ac731554b583729872ad47fbea2a8aadb5bdc787d897899891a6eb9995280c39d2bfdcc63b1cbb5e5a81a86f9d43063a0053985a6352bb63d6f5fcc2374d6eb12fbd76f9d4695e79f70b557b97fa6216ebfefb842be0a4bf996b8964a370deb8f10f343b92827eb12e01ae65b98e01307cc045cbc11d25b07eb11843a08308420c70aadf1bf5103b38997d4a6b5e172d37cb06c2edd453cd95a18dbe22a8ee61c9ce8074777469b95523213c04174d4b6fe19c98974acc0a03abf71da982b7d6635724a87075193ea3bfd4de7a2a3e2de855b827888e213adc0f8bebea1e3ed3c7fd8f9fbc7e6be91f8fcc6e1a3b7d635c4302f2d0e788cbafa45e58db33b1f4f13dd8d3b137bc3711e73ff0066b3fa4dbfd430dfcff938a0dc0de0f8c11b66ae21e25789a88761319459fb5d16f5561958735f98580af0315f5251591b0c57f0ae83bfe15fc42043f7d45811e4f760ae45133d1f49a61af71e7d8eaa7fed0f58b744f304fdc73f495ef1c25ae883da545e0c103180dbbed127c3e2335ecea741060cbfe06b62a316c25723316dbbe3733f60e2f887e654cc688972e75529b0cc1aa88d41b653a2912a7ba2ae1311cd6630399ae6e1b50278e383ab957e9986837d52e0d9172fa77736a7405131d777f12a52f8bb7e2274e4c0c60725ca739e67ef79fbde7bfbcf7738afc609bd7da3a09973de654223c47e2678bfa547f731aeff0079fbb7fb954d14fb44e262bd79dbf11c04e6fcb2c4c70c359a94e6aa9f69f8fccbdfde30aaaeb9d10a03b7fab378514fa041bbfbc4beff00bd8899f9ead7f13a9d0200cbfdef2e5cb3f836b1b7129b13dbfd9bbab057877fc1895ec9e07ef04ffd962c67068208d515d5e661ff006a53c4f099f48129080304e097e930defa6058db2c45bdfa1e83a106283061061d3229d389c96ebfdc6e4a662193bce032d2e59e39cb3195a887b99b26850cf492516a0f842364570e7130542172e5f98d48bfbcb5bc84728331005c46183e916555d9c91dbdadc0bf811b47ea72c45d821a5caf8950de89932a259db139480d8d9d3887ed74fdcc689dfd88beb8d4df456571c34aea1ac7f6cfdc11bf3f525f9fbf4f8fefa9556425a0f2e772fadbbf6c78c6b88edcfb7b4f5f105aa2f90394968c954b976dc19865469c4fb7939f896aad63e658b8851fd4705b978ef16d5ca95d3e7a9d02e166ff00f7fe4bcf7fee65a30fddda597dc732bd3f89709c711018aa7703939bbf2bccc0337ee1c458a8acb5373d4b14271ebe6545e7792541ef0068977c4f37a17db29da7c65b01f17078ce5d777cceca76231e849a4621d083d030e8210e80aa59c6050370bec813018f919401aa820ce7e11f6d65046455e899cdaf98ba7e21b08caf81a3fb9f7ea3648c6ce028c8b8d781d17055ec9b9ccacf96802c61f9271a33974765962f28261fe0985e08ee6ac2ed866074a952a58dd7c4e7f58a1fea199fb89f982f75f398e4a0def825b587d47db0a48031c389fb82567fef4372bf6a2621050056df2b05c712f6f92775225ebb68f12851c6d8ae783ecdc546406267fdff00130f1ec94b5931f499f575f59a685ef8ba8ddab2203502b3eff7b4496edd1a836c133e574de55f1c4b279acbdfb8167efde707edc53f798bff006094c02de7bea3b9b1e58c12c5296eeed0e3f91d1972c538fe15e603da6d82198accb3d03bd843c495843b3007c05a690bc23297d18c669d08418421084b84f62a9d01430b22c331845cca9a18a987c29b86b87768381e65500bae3b4b9783182352c7b66faea0ee90a5823b708372a30cd67e77a428add1da7e29e23983f241c4fa0d92657042a8bec86c8a23bfa1802b7747b26497d1dae5022768db5079966bf49f4ef94149e1ccf7f79c4fdc47e3e63005d37da267fece39fa44d7fb3e9f4b95fb534ea23f6c9c82670d4d52ff003001c0eecacb9de23e03b27069f5cdf40ccfa7f902ecbdfd585e4ac3e84423a3be6fc40028ec8102712e5e7d4a1fafbca6f7f9f894f9fb4a5d0fa99de1ac7c625a9557346bd7be61d6a14fb4e5f31fdf3d352b26326bc40154076945b95fc6a08e267a6e51a394af30dcb372c3712763b4a8727130b90843f8f23e7fcc577884168cbe8f4660ba9083062e83350731cef87880ee15b8bff08970cad38c60c3e1de5eacde3d2790096391bed2b2cb2f8e3a004b4da1e096eb9864c35dd88c998268c63aaf2d7d215097631a231abde58d91606e63ee9823a882923886e27ea51b28998e979c4a5f4ec4aa8844db28546eb2cce63273188f787ed4b0edf99ab6bae7a73d7dba27dbbcf5f68cfdc153f598eca5a702cabdb57684822fc415bba4bbb869b6bd779672f3f2fa9cd5dca6683c13bfe7fc94e0e70f10a4c67b7fb3f7dcb65bf6ff0090ce9f1fece1cfebb472cfc3fd98db5877fe4c18f60ff6537c72cbf1a8bcdf7e39677c9dbff22f6c57da2b8f1c7998efff0059553f7d74afe66e54d4a26b3713354478e9d936941e2142aaa6db25cb9e60f4cc1f401e62b0b56d5f32fa100d0cf684df1542f3d2e318eefa1d087418421d1648c6a5847b20584a998328f9434a496c551bf27da5239a1046a0d7ca6402b329af2d46d1c9c114c1e68a19b2840bc9110d06255a9ce89e1c3a35b1e31557a357f7e33147985c1fac653ce159a883323dd7c906017a225329a82b51bae6744ca3ef2bd2beca22a1778d93501f3362af70fa690fdad4d7689dfef2bf489ebf31f1fe422588f98816942d690a6d5ca7f88a705ce2fef50d89372fedbf736f96ef9652a8d54cb831de2d967f632a4274ed27b3fdb325d55fe23f44261fd09f1c6bbfb94fa73dbd4e2bcebfd8bb78d5cfebed3f6a5fef9e9fbeba7efb9dfa93ed2d601dfe262eb9813f7d455370ff002401291b8097735698e19aa302a61a086612f3012e635707fa8bd7d495f7ec7c4bfc70af4998c1d5210842108421d778fca62cf1cb1852af8851a422148c44c0c70a164cc58ed304b0423004af13522f372a7bb2dd3c9f496799a395478e23a808e1dddc0b11c25746662c5f14ad7999cf6e86c6611c2a6fb13914a2b7a09d7c3dc9cc87cc0e8abcc11e7a3a05ee64250556e6e218b1ab96275e26c90ec58bcb35db100500f5d3f7333ff93f7bc7cfde31f8fcca7f7133e7ea4c70392fd4486d3bd19edccc01dc6ca4bd4b4b879eef32d55671cb1dd8e2a53a1481de1e5655071fb6cfda9fbee1cfdd9c6bd1fecf3f566158f897ff005efea7e9e257d3f32abe3e84d57e3fb665f3fdb3e7a5ba1f597fc86d773cc05320ddfd5945560d625683518bb974cf79994d88817ccad39889ae8d37d073e62ac543b616701de1a8ca64eff08b1e96f45d7fb059ceddeab7529b1973d03e4744455f39807a2421d08741d2e0cde738971a5d403ca62cc41ce65028d100b253de2186618db02c99f74f69949550a61c62338418d7b6a009e773e606dac2cca70b7120e12fcba753e4c59479953dcc0801c461e305b2ee91225d72cda6135ac481b4d44edff08bcf9dc81646d938c4dfa38189266f735ae9fb9e97105a841dabc9df13f71d1f53eb31e3f32bc4278fb4a80d5bbf2fe239952f0a99bfc444a0af04ef9fb732e14b5d8ffb03035aec4a1c9a7ef3958056dadf895ac678ff00b31e6beed4dbaafea63ebf78e77bfc13535398f7fbcbc7d8fee7a6cfccfdf507b7fe4e25c29f32b17676a88cbe2eeb9e2212d5fe3a9fdcafdef08d3f53fa826b2d25ff005315735afdf516fa699e8c8d9200cc2679d32b133cb102e764cf3a8de234ee1899b985902e23fcebd47a288ef529fb70b4ad1f8082a5e0c755cc712cd78e0859631ba152a1d04210e8b8ba56fbcc1a608d5c7b251b9da73de7fd110b329844d9508b986224cbaaf12fa890e515cc4014037299faca0ab296d04b9e33c08d8d4b4b6e2464b4a87a03997b52c4e215a979c433383a44d7ef3c344f29cf4ae5652056babfb7fc2ea233fc7898f0e53fd88505aea7ef69ebed199f3f898f13d212bff222e9aee818804c2f3947fa3d43a80f465876fb779bf3f82777e4ff0091dc38484a5e731ea0176bef1cbe7f131416e7ef3bfde507662cc50c4199f7b8d0f92a3c877f7446a2f1c2f2a6e567f71369f6e883b95d5bdb7c768a0197ed2871cba9503ccffd40fdec4a1f0fe260d7c462c97c1128d9330359a889e50b83c213c251a944a9808672fb40ca53f5d47af1fafba0dd2eab83fea636bea082dc047f11a3a61b86e00e21528501203f04af1d08425cb9717450f94d93ef83d71095e264c39821b81085de728c6c7308b5744a0486753d3a80d8618cc2077b819f794c25a3899fc462b3b7e226c71998f30ccd4c395840f99552bde3283211215865fc36fbbf1352c29369057ff161b7e505a5a3bf2c1674134e7f83f133e7f133252c7dcafda8ff007d06bb4f67e20fe92ef1bf12ff00ef8802b227cb1715d6de3b03e65ec02f870ffd8faf866339f6ff00440edbbc1ee21ff7bcbb7466f1b080ec2faf294718d8f6be25684ffb3bfedce5fdfa4e73bfc4af1ff2025d2d8f32a36b1e3de0df10fd7698814f8656beb97e3fecb92ed3b4329eced99cf6960b62ab6cb263a1b25fbcaedd38654cc18dec9980811977c426d656e2f445a8a61fa5f2ceddec1c4200712d7b5be9946c61afaa071577772c455f2e22ae5f507b65193b7dc06f1fde0efbc1832fa2e64c2f006fdcd01ccd5170a2f0ef07b4a23dfa5dc628730bdd8841ccc5de342392706e026055841580dd2f98c343ba5bba778962ad182592b82771f4987f8629fee325ad9cb33bb1895c8998ac9997b5da065654a9b42038c444b62c40f536fe6a95d4adf96db952bf49fdcfded3bcaba7c4c7b4ad6b12ab70cbb6f13749d067a27b3f10b7fc8fd7f52f6dfb7fc95ff089aa5e92bbce36796578f444dfbdf767837c1da57763f3367bfe09c7e09dfef2b3fb8996bede21ff0004a3dff6cb1f8bff0025b5fa1c4e5fd2a5aa64bb83194ee5020566fb41de4f920c093c5e594ac08f84c3cc32ab4b995cc468ac4f32ae0450ce6cc46ca9bc583c32b9bb9ee2cb3c44d2fe660b261556af1dd7fc9b3e10d56659dc85c34b23c88379771e7de64410d4f09ae18dbcc8f8b63c74db224a3fea64af21ed014348e5be638727796d5330435e679a870b22c970d3c418c6a00d4a9c4eecc5ab9dd418aa772525094065a7dac1760fb4b2abf4974fbd026d61113b3506ea2860ce252ed37c1058a8c00382a051fc2ba144dae78c875fdc4d75a9faa944a9573d4c4b0a6ebe9094234e07445052ce138cc3413e6768522e20bf713e7afa40793fa2563f6d88f3db2cac98f44a3be2f2caaaa33583b4c169afcb2b3e7f128ac66f503e9cbfd40acfcfa95afc779a3fd72caab1e5cbfd4c3930fe082633f5fee5e169bf7e63460a51e45faa725f0dc4e06fccb728382b3f32f3961fccb02f30f44b6fa592c955667626998867a95332bb4816ae58588cf851e736194addc036c53ea091780255dddbe236a9bc009f5977db88b15af08caca1a9f5198e52e0a0f113a1abed8288f054158c978bb3f32cd065580abeaf79b67b4a5abdcec79e09c8a5e0f84bd36d9053bf8862794b67ba19d10a63d91c5e6277a0b43d3bf2ea2d81e65d61c742f22119d4635106f6e21328232c5750f9adc173abd11768b8497427335d2a5757783319381ddc4f6bd7efea6aff00a9f69f1f5867cfd8817ff2054aaf12bf58cfdc4aef3ebf888b2b246ebfd8be7efd0a317505edf69ed14ffbc4ff00a25318f44a2dbed9ef3e34e3b138c386fe662f81afa4c630a5e0efe67f94b0f8d61fecc79cd7cce5d392dfea62eeac2fa097555eb3fdcbf9c7ee65b3befda794c73295f6622430538a6dbf8896555e358af70dd4fd1894bcd4b9f7106fe741156f946937162956733953da59aaea29f0816e7a4257997de66429e668f112f336931136c78e97798d3db2ff00c1ff005332f199fdc4f98d570db2a834425dd99330e0205cd648748762be3a37d06fcefb10e1fa9776bf989ad3ca621edefc118c2e4e22a72a4c10db1ad5545ce6e226920567fb9b5449d8864d6e0bb4b8265094ca93a5ef03ccf89316031a0afd222331e4d4b5ccb1ccb30ccd2af137d6768a58aaee3c0e08a1b4a118e500f46497d2cd97123d28084b45c29fe9e9acf4f17c6895cdff00b29e683cc0f6fb997fc9af1ea57c47f6fa3d2b9fcc7e7f113312b962ff000ba65a53984feaa5aebb4ee8e19c93ef7f53e33b3f59f7b7ff00265da567efdf5e93cb8971f22b1ce88a8c07058bbedec852caecfdef2e10ef289e0c435108a394dc0a983247836c3c299c4c18816b3894653804733d659e08a136e86ae17dc97f1feb21157399b559f530f62100626b0a48ee718e9b253fa8a620f1d07454876809927de2dd8e79ba9b48630d40e26017080e6981b71133d6a3e96f12a34da5fd228a4c2166d94df1de0cb35a82106612ea342219dcb6ea2cc59823de65d5a38d5e207c4ba014364ceafaca4289449c066718663fe445f24d56ee65ccc938c8731c6d9be8aafbbda18ec4ae6a939653c5bf89ca3bf13c7fd4aab32da7ef6885b9625dd1f89cff0093ed1fa74fdcf4d463ab89fa447bbf58cc009de0df3f7e94d06575fbda5567c3fec1d57175089350f2e83a4d76e373687e5965377bb1c5798f0707b76f12e6595294c35e630da2fc1430d5b6dabb9be84a4fba007329a254bcd4b9ec66197623945c32ab1de2ae0414e48571a8a2ce2c789301bc54acbc09b8b0747155b7d0e9ecab110030cc1f3f3d57369b81025510741d38bb886b3fc454f15ee06cd42e4db97a310637a9091a77f305e51b61b0b968d5cc16cc1abe144856603bc4abc4d302b2b985d32de6587dcbf9831620ed112ca6aa254587b895a8c17c8977d0050b83b5f10e3103a33dfc4b87c103774b292af70a9b665e4b78dc24827f73d2839a9fa59befc7c4affc44dde38cee5d1aed72cc186ffa9f2aa9e3f83a8e6574a31ffb044dff0091205c932d4bf7d36df38dc46e798ee6dc16b47895580c46fa66171b8baa6fdc517df2fad6c5ef8e8202575dca95002bbe25eedc1566135345c4165bef336ba36419ccd4ca32ef3302670d67308ba1e4397fc4b5078dee6661952cbf68310ea4136aed0875cfd866086037acfb8d36f989411dcfe847a0a0eeca8c0faccb0e606d2a5ae87a9841bfbcafb70500df79a7b840e55b950dfc46a9cc57425691a332d5885bdc18db31de185ca3c4a286587788d619e7609de5910142e06dc094cf50cb48e26b121be3a60f92e9be2fcce37f497f9f6cf8df2cb577974e5cf199dea8d6f71ee6ef6ea03b05aef33b2b4d779e3f1d7c7e3abfb72a7ee23513f589fb50678b6bc301edf667b97da7dba579e8ae9a750f131d2badc081009a18c00c3ed1537b843ea1dd9c4f79854c3996cc9a25c52a388995812d6395eaee0f98d0897b3d98b6cc2e50da4ab39e821084d261021d5b7c512c15d69cd7c43366a3696ca777a9b3e33fc12e3797182554a648bcee1830468d336e62ee9d45aa01652b444a03ef0a68eccc63412bc477732c1dbb47d88906a283be61e68bb21de408e225acea2d7863b942630ca5d9a7dc530886c4a850a87982b6a74e873fdcb387e9325f07de2ddb56c6d56af6261bc6f59978bafac3a533f7c74dfee3a7ee27b278731aec6ef11ae7efd3f712a24d897c712f34bef3813bff00cee1061d2a54f4e952a54d7f0dc0a8027a4cedf24089ec78c732e05e3ef1d4c2e225905ef1b73b271a2b63ccc14bb80ca1519a82b1cca64c03acce2e20c233b7716134e9faf4710b4919f6cf88cc57eb2fd350e8487426e410875c89b55966acbbf860ba8d3c7961d4fe0fe353530f4d38966c95d388f1cd5ec8551c45868b52dcb52e666e0e789552ed3c4ee7046370db539232ded326f317980856b11dac91b4aa83652593b82967ee0c0dc39b0ed1cb1b955c1174ed67237bac4aec19cfb86d5f7ccda72bde78df4e6a73d1c6e62efb71028768ab68c74fb957d3cc19654783cd44aff93426e538a3e902c72e6b983cf8970717c12859d55cc4a1ff002592f12a79e9dfc4ba6bcca5da5280c6b198aef801e62b56dafe6a5c1186c17702ddc61897a936425d43f49f41ccab0bc4adc338a96611b5c45b02abcce4ad43d412a25da1c4c28cba9c2c5f3cc7a8d9d32f8834bbda8a5655fd7af767bf51210994da3debab474b2f62114f888a157418e5c4230e3f81a7cf4bfe35fc04aa8558aa8292109c8859b6ec3e929b1e997d8de4a9aa97c4cc87151588817169aa962a17652e30cc46e0b737906e64e263125da3dab6e52a1a4ac2a3daa8c1a9ccffc4002910010003000300020201050100030100000100112131415161718191a110b1c1d1e1f0203040f1ffda0008010100013f106aff003104ae3c8be439959552bc403a897a5994542a24df2534553186190bcc0a02d58300f128447772088042db1c962018f111952f0f234e9bf606fdcfae629664553b15aa8b87645c0d916a025f1189d241ec653aafee92cbe60e0babf233f2a442dd079e2a2f685a1aa21a9ea98bd54f1e3353c8ff0072f28a6bbb25aa0bbe8083f24a2d1fe5038ad376806f6a975571977638b69fb960eb30f163cf3f51c383036683a599156200a24121012eed9d47a96cb35fba8a2a2ec17f01197591fbab7f70ed1492ee972d864a8369f89a8158655cf6c00b209dcd52f88a482155f1c4a2ddf6360c67c5d46a7805c44f9817dd747f411096167972b04e798cdea025ef5a28e6d198ae21a8870093363cbd87b5a04bb0a6fa517d96d3c90194752a2b51aad3ae65755ec03c216efc9142096f8a8ed8a4b5341f328b0b02c8da6799c450d39c8d01114ba025d6e289566474b22553c459696694c3bd09269c34d9712aef7511426d85ca5d6c68be150ae78c5ab62772e1140726fcc1111c14b355334a4e55306c279c40a38ad940835972ab5d9549146b6d8ee288a8d5e18303c9b501582e8ccb884f0cafb9298f3bb50911f50882d6c74d99ccb7f708952015576c1c9dcd5f48e8e0128a85427710d93a605296785b61977c4f5751a474a8a42152ec7895d4c0455e63051dfe8307865a840565169054382c481757570da147f661a7d5e5c1a2a8dbd14d1519666f64a160b52c25900fdea9fc54b9555b6d965e229d4db5291e8a4b9503608341ae135037fdd15c40e430dfd3360ac12a6c9db8adfaad88c42d8282b88d57b10e57632ba8f582acb6a536bbfd423a39699022454cb49c710028a847041f1dc49357c898b1cde1d3615e31e667fb59b423720d3d56d4b57283f70e98c8fa63440396a1b452ebb8d0452b2ec6a9bf9f22aed662319d242e363d1afa4a1358d436594ab62e664a01285da7c7352c28ce11443f48a937677016e3c9fcc572168c5e31c812c8ef9e25ed31cf897b1909df040a2e9b1c00f9957731dc2a176adbf04c0095951571eca32374d77552f27bcc2a87fc120d0d7f940d0b26c65aed471d31087aae3925e73b817108e96b0be88d079396a734c41a0b27013c96692a096bf4fd351da1eb1aac1ee3fdaf65c14891de138f510806c30b77076e3669df328de60b6d14876e75db39ecb11687bfc401dd3fb65e3ff98c48ca95a3fc449acb75e5aa8d53eaa2ee10368fb1037630a825c5c54d14db828504a6ae211fa9547225ce1771d32ec33dad770bb39d21423443e730c252d1171f31b194cb3154b59d057021e952cd396be230e4dce207cd381a800a803114905dc69502f28ba60468557021a8245554fbe6317aa297c152ccdc5cdc3e676fdb356d60c0165d70f702dfa883a4109bcdfd44151457b7f6e4c68bbf38888d899dda983cd22e84542819517e03f997b636b6e729fb6090380d231692588a0f2436aa58ace9650d2a2daf003f72976bbf9ff4058808538434b42094dc2517c3f29708a70df503150ee0a9d9b85729e13b0bfe8ae1f227262eada1c89e9957d133689f8e935640a9e52c28365c0afd5e62c1595cc2e1a9c24432e3cc65ef31dcb2bd393f7886ee515c150c9ec0081bd620404b15a15844b72b837824041c2b08cd904529c1dc730517504dbc12f9ac8395853f52bf5ddfd2d26ab80ff786ebb896b1e10d0a82f2bf4ab8d459cd54c13ada830ea3605725d46c82d148da1acafc4aa442fed9944a145f1bf0414d2afa320a5dc12b30e0f61503a9871604a2d54a940aa01297c986391db71853ea1e667532e2eb3b1ba96fb34c34357c4cc96cec81f10945f1a019e6986baa16428262c6697e6a5ec8dd2cd56a4da7718c11502c4b1506f77c40d767c30d6a76f727bf320a2c068c3daa8ef69b8ef74890805d0b3e98750a8af32d84aad5eb0da9e0a97b31c4796c60519742bd60ecac4e1a421e26f50c721e7f64b3538bd50f6e2d99ee09cc6e177319176a80b3ac9922810fd90cba606e37bf3c80bd6a27e216cb4090ba0fd3631be7fa5360ac54b5d91db2b6f2ff00414e7219800f995464fe2942371291b0228a1b186a769fb19714515dbc402d96dcca4a814bd9021400cf66685fcd3102d8e6f92a15e6b95a8869c91db96c1be2c816ca6c4ae2b7561598d458c456e1b87e62abdef3fd165f012aa585f192b39072552c1e62b0d7d4c02e481e442407161d92eb6175bc63e202b158ee59984ef11eed291b91410fcca2d20167c27b104ddedc34b91ce2818d7e028e81e125d8e2193c4149a890ae2cc910000e5e23f5b8838a8ac0762ed6dc1adba227d022b5772ed5f58b9f558703a094a0e25bcaec562aad5082db086deb983fda231b12807d6c4137b054b90fda033f8218c31a965ac1b2b392b88eee6f7a8f2652a536512eb2713d7ebc6b62120da5e1cbfa7971167b39aa3420c38960a69b965ef7b715ab0f297951b4adb0512a0d53fa57351dcab95f04a9b5255189d9a2c27ed1ac60d52b3fac8127c4677d14086de1c11f79c7c2a0585870cb879751cbabe8b5952a3c56ff003c41389a797217a5363bd97c55fa8a72ab19c3d89f16b25af968d38507b9df4107614328b164a2a730519549a83528eecc9ac1f94823fa54014e0ea10a7e13883ae61dafa8c671a908950d3c35c90d0b8558db7cb88bf236bb60aaa6c2c5415b983abbc947e33acba3f92028fb28c5391a7c4010ed5c7f449ce061c894caf1e154ad541790176912819b8f1beda65b394c1ee256da37f8886a0b222842fa19b1139958280fcc41c2a104fa22abe52b5f04dd859040dbe1961b2f9591680f60b53c403afb232a1de82e2a77a77951818a672cebf6fb1b78741ec35bf2ac12399ab3e108241c0a3f086eb44f223b76b482a50c703280660b69036225c1bba2e3a280ac078beea5ae59cf304d16545d07e0fa2341a5b9282b2733ba858e9595f01653a7708da1e128122aab29657511871dcc481f6a8a8d185c653960b016c38d492e381064ad65a30652fb70595b327d879f997e7503b813f0cbcb488c4bc881056a36d8f14e0532f3dc3456834f92e23e920aa885176f72b90b0fab9512df4f0214e0214f4c09037b4bb0705f171fef56bc6190edb78114ab54fcd0d584cb0740aac5a869eb1eaf4945f72e028f3c30215e7506ddc34a8e6e39d107d8ba8f3a7a380f02c109aa8f32ab930077174f171d85a98855862a364d1d551b017a0e32077c8c00427795a3f370f3b9734c36d017e37689b1e2a9aa9b05659040e0c9552e8f498bc428af7f3905a964f9871d89acd86930100966ec5bc48fddd8b961a224b0cef286b16ace61ebc115c78e23e7f821e23c2e0956579481af99666811308cb48bbac82a21d12cedf753c5ce85d4d16e201601e207f49155b9b81657ee38a2787c71643174bd4e887860fc10753f702ee2e328dba0a238c9d007dcadcb9dbd618aaf36e12a5df301d1f3e7a8546b0f083958b98759d541bfe5574256d440a6171eac8b78cd1a422329c1a5fc3028f9a5971a4bf659dc23755ac22e790caeae3d2c8edcef66b133e26987c1168ab563456a20155d1a8c3c18e856e22fc4544e023cac79468770170190ad0c37f30a0d98e2ad51241dec4bbff6ca8a50e22c43c9145d7f417c1c62f6601444b802312780ff0009960f87f889fc6c10fd12738c51fc2142dd7465fd69cb2c393e494f38707dc4ae9666f12a2a255fcb50a52842cf98802adf988f361d954df440941c256c06adbdc6aed6c233d4ce65bfba8c45bb6b056ca652e64d29384196a97e125d66c5d536f314a26efc8ab552292ac4c00d3f1646800cad10a5d45b310b1e9375e81c3e65ec1b5426210a0a827815d7dc0c0dd3f5281b2975db14c843af6b717bee3114b112e9c6b72dfa60167684e463f8469082f522e216b41b3f9c2c0755dce5651c0c2a68f2fa98bc42027841a00d2083b9dfb22d836ffb41c5665a40afc4d252c2cf983a5b5ec615addd32c2681c11f51d01115b30b7c45136c8e1a82f636809456c13759ec2dbe23f732ce7fe1957e0542dde5096bce204514d4642b065f2155386ae0089542fd43748e7c0e88c053502d9b4ee54e9407d238dc74e0a1de8e61750afb1c47b029f332e2ec5c01d415d2ee22853b9f70346a613297aab96a89652f3cf98496ca0046cb6c5a8c0399d91347ca3ae9c9cb388fc04e6455bb95028d09e2985583b4350d828880ac5da58b61ac7eab58dab1a9ba86aef09442149afaee398e1880be06511f4445d712bedaa465f7a3f84179fcc2e58792ef11e4f98b98a67a59745a72540a84f97b8c9329fd30d35e204b4595bb9f11d50ba801b610b77016b5dfd2e72caf8790af207c74cb9cf72a9a6117b2fe27a23895705237f72d2ca52c205a1f26be3655800744275cc151c8712ed542eb0518acaf8cd059bc9b502411d8797e98944532b65adc515c8f72a6874173fd926f904d0ba417955fb587cbe36bcbd80880c5a39f98c6ea8b615d0e438789ca4775035fa95d801d796d256885d06d5478279d3170a47bb4e6a36f00638bee358c29442c782ae047cab3ab22da55fdb0409b34caa671776ec76eeeb892aca2addfdc2d272510ce19a5ad42c0b95c816d8b71a58b57c4b266c292886c6e6ac297688d7bb81f819785edfb2cae6e54fc83caf23f2a1a60bb657d1996478b3b955bfd37794c69362e3ebf65c1d260194d5b94a5e21a3bb2fd498946d7e242ccf914ba148afd71168be972eba015c4b1e0dfe9834c38bae3c32f4b4ff00a40529914dca162ee1372b094e812221793217f10d646557d8c6d82adf3c96242ef363ca674150162be92a53dd2252a570b1f08a55cdea039632d5c60452943cb11240a1b072b0e285bdf505765de64f0cec59b36d39ed8afc3687950f8620a1acdb53005d90bfb78252655d7c6c4b1549eb4472ae2a55ecc2eac347214da732e4d43add1fb6574d1425b5500b5976ac8ab8133284a397c36122637cdb7661490c6a5c8a35cee0460e915126dbbe2c88024b052585d9f703690ab82a3aea77d605f274c62fa7f89f2a2fa3e6e140979f8845fe2e1f26cb36b8b405c155871c95d2e419b301cb2c8e25495ad446516596f8a9d639addf29179280bec23b710b691ed2aef5293282fd16c7f32860db1f4f230a68f5654ad549df27e8e627422f785d784bd2c1bc2e60f351ba6a167535d29e5c4eb75195675516d15c257195b2837251f9272a6208bb6f8845073038830a6839847099f8b8947b3d613aa5027c370e973c12eb9478fc595dcde29e36034ad85630aaf4ac5c58dab89d5e47402c4ae08d338273c760d950daf607eafb06915e60fbe66b9b0965b72ca06dcb263d7c16ec0a7ee14ba08f9cf90e54362844b5e1925616161692acd1c42442d42eb3ee540b53d4c1726eb858a4516ee50f8419422cacaf7e1626d7c3c43691690421c660e8ad8cc12828fbee0d1dd5ca12355701bb0a352ea3979f88622e38cb0f10ab0a816f8a8686806d4ac0283aff003104db3a035b1b143cf30cc860935fc11c00b54b2111754bf894c1e63141c2aa19893c4e6bc9cbd3d4ab7692e08f0dd3f152cd92358fa07639f384a8436a71399ab4fd7fb7cc59e3615fe25b416d70f560f3f34722d2a1dab8335dd7eb88bcd8a62d42ad255306f465d44254c66f1a4bad36af811a36b4e65cf27e22e10b94c38d115a0b7ccaf4f80ccabe70ea2ba7a089558b77947f98e38ba86d31865dab845bee18ca2216695a733e02398877d406cbbf58028b8b73c94e9230357d4d8bb5a76787b08750b000c6a69f12804f10babe18e79fb8bc44e91137ea5048eb7ad1c2f90f558963c574983ea580ba5348ad4860496c363ddd53092940b41b4b166f5c4825ebfb2142970632dadc0e2ae773deadf89915196fe86ae7d4cda6cade9d85368f65ddd60aeab863716b235f256dd5cbf1592d404b2a41777b3c10ab62eb7cc61eca2e531e75752950aab5da2a6de092e126d4c1ec12664baf227242a7ba45bb5d832a9ad188264b46feb29a656aca1116103017657d45299b02c7891f50d540aab6e53a58f234e50daa8c0701aaaba652c5e0814f5b8c366b2a50c5be117aa9eec1473b2cd437710d0bf2e580d18dcb1b635e971116d4603baa6655bb7b96135cf28001ca06208eb37984fad23a3135533a9d44fe03b676b7d5ce47eaa60b5360b1cedda3d875183f4dc000ec79f6721506abf31015a3001c9016e4bc107046953f2f39340263865a32c7cb87525c272461b1346082f3286f1671130e98edf9b9e70cca0b0f1491bd0b78e383f0a6b1579140bd3d82f16393e99c6d6111ed90b8e147e7989b4ec84aa2481709a29316ef481c63759a872583ec2864574889be798d41b37361ef6f67d11c5ee4600d5c256ba1b4f1fa8954b184286e674673b8c79acf861a55eb9b813e0a4a2b6e0268c728ad88366a3d6c5ec6541772d3040ff2417c945d92d7e629868a524237a01516aa850eeb659de0d29d90d832eb12be34a5196b76874ca84fab7b895285380ee3a55d7e410d0823c1a4b6057a74fdca2c9f8d182b58d3037f0aea24b95bb18400a0ba6dc005aa3a90a7dd9692e965db2816d5fd4097c2d8b655ca085ba9a59d53f31ef4b7a2007ac91d9d9a938f2a0c47da76facc75b16c9bf9dbf540469a4d5be22416d391f221a9b83d9f01714aa64020eea7b8da95cf849b4836df26ad3cf60b5e2120652690f005c62b398c7f5dfc0f025dc5ad629e1324586e04b38b97fc970c7d42b1142a2b6be22dc68012d9554eb0a954a178ce62253f27ac9425c864505ec16c4a42a27bfb9ea03df8f096474e210a3bc32805cd406d4b2c7ae22ca79feab91dba08fd6ad17822805f378468abd4042a0801c1e413b4714370dc239b18ae0e1da58de410194b14c2bb508591b056e8952c29a58f25f2476a1b258c855edce067972c47ba25bf24116cec0392df6a572820d1f9826151d3745a7a21ba0a2e5634625f8fed7012e460e777a2173c32d291000b29a251bcace385bdc425454ff88f38b057be665d44d256eda217ff0021661bbfcc3c375b2b787230d5def9ccb42a91a06bc2c50629b3d6e06d1734373d62aaea21200c5fc9136be0d976f5738796afd9e442f100a96226a5c7021d803a3264444fc3844b904ffdc979eac714468523c52bfbc12d14f4846127aa72563a65a854c7477e062e35f886b93307ee10205e17b05a16d5543b2994d3533e401ae05dbbfa818255f9e2077278e081eaa42dfe0c7eba946c3c9c3495c911fc22bc12ea115512df8a4f202b89cc0b8cb3659b9f12ecf97646955594893ad4e8e759493675e91644ecc50fdda0eda37e9b8b75014917adabfb228d573144d07c4a4f7bf720148872f97612c201e065aa732fba87f181cdca2be58253397a8b502cf9321944801dc0e52aa2658051d0a89f176633922fc35efd5d44182ae7cea3216db972fb5738ef3463b9e7bbee564f654711c47ccca8e189685af25a9509e77135e8943d0a8bca621de035c451fa4a7f16512f4e52cc2d94343ceee2aab1f3461585705d7e822410ec3fe22dac4bd157dcf2caddedea55b56bbf2441f55060e13ac802ea68808b468c2d8095e1f922f59463c8654c41f44010d116aae094b1b426bd11e29e0fc304ea82ba2ea1f6ca4042e5164b41e50b555be5cd37b35c89f50417a85c4086b47d2d8b5d6724c1f308cb1cb1b56672ad2be251d14932272d9a67102f33b6322c22516b04b619a087a98ebe61e567419bdda68faa5f0892a7106e28a0e5ec16f84073459641683a0f199756ea07908d80d9cd69a4a50dbe0e23eb6dc43c65ae3a7b260b5a7a7ee7b02eb8849a72594800874d8973557c0be51a7cd0f30e0b772bce115bbbdfe91a5e965416f55ca9696ae6b17811055963e865c1452c157508de979064e285a9587d1096ee6e9e658ecc3128ad7e4d3045da35704f6dfbb30fd5a798a7e636216811a7591e029eb25eb5b584d938883c6c24946095e32e1b894ea53f3d29ab0296092cb189f5137df38c40bcb572911b6782ea1174ab2e6d0cd673fabe12d5d050703c8f3d54aa430dad62c628a8e917a02c7825ae355719a051dc45f25a1e447cbe560ff8fdcd22a18c5c2c508e25cf16510cc5117e6a280974ed4a24e394512db841f22ec4b87465f0c295d5454b109c600f0f31dee85f9062a5735ccedb1b695cb2ddfd553e291f74f0e0bcb8d321718359f77035952c72c66ca0156c6ae76e589e4def16c1dcb584380515071a82de6882f6286bcc58ad2e9bea090e12a1b571ef4d9176a157b11612c658caee4183b22f19be44a39be3208609b2b0202b0d4bd79382d787b320259cbb7b4b662b6a630dc02d38b05f6a0ce308956fd9edcc4dddddfc1022c440d99605df0190d05bd44703933e81cc050bee1f9621f1216d80c0e089c5cf4b9024509296a5a09c7361f0965cdac0fb6005fb51014b6fe8820b0fcdc5e00ca176c3627cc0984a8f34690c452210e101ef97e0952f7cfd4600e9bdf98da29752bc14093812d5b906e86f86a085955c867631be5d7be2e5a79712f1d56395e22381f47372f176abb54b94c657dcbab83c82519fdd2f99576b0cd42d0cf957885ab24b2873fdb1302a68057da96983bbc4a5206a8392d74e619b812f925c05e0bcd9556be12bb186eddc11b08bac81e05dc96f2c28030a800701c7b1681f0978161fecc4405d8a75772ba53e097614355ef53205d9184343402b854a274597dbec368239c5a4204799df351ee10eca46d0dbb8d3177320e98a529a29981a7c4b555c168ece6377bc54687d5bb975b83d4bd6463bcb896dea1235821967e2520692e6dc3c957784e478b857c590c638355962e947730a1e60cc61162d32e16fb88d7e694ed50bebea1955b5a635c95996d392f650c2e3112a42d5e4772e1fb32842a159f106f5d829a4d6aa6bd21102d2d4b718c50f8a4e3a34f1d849a0a21a6c0951140aad2fc35950c18cc9481eedf54c362144d00d9e91a43abca5c8a2bb2f7d6190384783e4c7e75a161ee303c00c6158e2b8fa96c339790a67451d9d9084a5a4fec46d361516678dafe2142ef85d9c104a0451ad4894974bf85cb80ba1570d1e7025ce0a39941692ad6a4b843153aaa3684c23b0d9ed25a4c646f1b5816b0047d8003f5342f871f112abf88c5ccbfd3a909b9c1b2f0a57ce4a8de3b860a1bf91975022c9b11700d555d4bba59479d8dcd4d3f82152438b434fc5c1ac2e44aa7e2a773ad69e7c462146caae92237a5e8d80a34449d6fb3a5be1eb1a858a3e88e45b5b173b3db10aa6aadcde97004d35e615662c077aa5c7ba890f8bc768f49813615309c2a95e9e45e050c7d0468757cd26cbf1ef966ed8d04683e1b33484296877ed40d37681fb8ef6dc7eea2b0d43f98016e052a721e1353b0414812cb317974c636d2118cc9704acf483526d10e4fe8148803f925ad7de3106b5682157d2e34c8b69a9bb1eead58c5da1b0658b52d6d9a910e8b0a5ff00311cb22529cf4a953f294cb34c712d15fcc2a26c900c09c9bf11a5becd9ae0abef636f4b77d99d6ff89cf71d5b26df2aa181d8cb5a8116b1b4880b945a0a97047d6d84ab8746c6ea8bfe656b37459e5253b08df40ecb428e81a95bf13698a9a4361921d40514a557c7e2635c28ae0f2a22a196bef83ea5524223a83c620822a91606fcbb28c5401976d502b026184570ed3d0f50988a4e601534c8a0db1cad2c2da352bbc8287c9702b615e415b1861a0fa6bbe7859f1572bcad73af302cdcaf9b3a6d772811de4046d554efb9b96031442b88c72809d4eea04e6de271d6aa4fbc1f82314c41596c0f457f44e79b6d4a55657567cc641e132514e713a32c0385ee69bad39861c45537cda0878361e0cb64619b4252595d1771b1c18d7500f53b30d3f0a69003886bec97c08c38adbcb4e64490d79f60915a4d947dbe07f982b76b2fd4a05be88f91ab89bbaa1ecb1abccea6e1eb0ea03bd3fdd8658064a4a555065b2af806eb4b7ca7a10e5c55fd9ec35ed85d80615a9363b7efee2d872e0abdba1d5654195a6f999c980133a510772bfd9e62b2c29eb861d7e0c070c5c37d659afe2261d6df31aab5de70dd970348368f68eb6d9aae57916d6b6191edebf48bbf994ef2edc31375f4381fa88dbc5d370baa102a7bd262764de7a20ec159c5a96b2c59b28aeaae9c89a90bdaf25d75aab08b36b6a71597782f5876569ea0202c4532865b9d112c418d82f338dc428fcf70ae5017cf31beaaa08b8db92d2e2a7e01f736ddbcca609f98416fef04c0f77a6305a118743a71581384c00327382d82d7a16a86073de45851b5622deb34b5660d3d4f15db3497425ceea005e01a7d40536f63b49d8ce032a6c9034ffb2e255c77e8421c1a8f32cf5fe232f54152ac2abac52d86597dc328e8c1f81e7e5854a3c7328a5864e4ab9c5ab5f70c425b04d60d30cb96076a92cfa6151ddc4b83e3df89694356956b8367055ab38ef9392896a572e8652686857cd763c0d4a034580c7ece3888177c1fed2e4a8b96fa5eea370e2ede297a3da6eaa1942fc73d515c4490ac2c5f6a6f9288efc16aa2ae325906aa1e98e25928060e3fee0c07aee309a5a7f711bb8097c972ee85165fa43837a43f444f82d188d6713272a1d2f820dcdb621e8cd0c4c733b8176658b54607f86e35aebed7b791a2932540669e4b3d3b2620a2aae1bfd1c470341e65a28dfaf15346a23845d9179cd12e7e2a16ee04c8e512ce1edea6803dec0d28de24cf1b7952cc6eaac21739ec70b32c2514d06c02a876236076f586d44152aa87c9b183ba7b97e9d8acc6ff008e610a86e16c85fb6dce3eaa04a954ae6302867558e89532b4ef7fe0c00b0081d3d2e0bb2c228aee285ec347104d5e59ae6edb1e0c8afd24d57ba2c5092af8e7eea8951cbb7d4c47e61b580a214fd212f9a22ebcaad859f7a85c5ebb4408382b7a95e12392a129626d1e12e438049a2e528f68443c7d473089052ed2b4c6755e316002ac1cbcbf5163d57ee3adb5b0a976132ab81adcbb9e4fa4357545c3354a8d03a71f04505ee14aaab8a15625b97b32ff001069e189d11c831e669fb978948015cb87ab04350e8b12a21230805820735188c5e789677094b2f4a2685297bc476aea98049fbe13cc6298150c3a1036e05072a00d797d792e3d3df83d45cbbfec4d062dbbfd137adacbd20506cc84290f72a5348783734036d8b0641f6e59d603913621c48168d27dc1bb96be5e018d6b05db57efd7ddcbda252dcf5a255b0e28c2d6e5cba0fe4f01039b6d6b887cb2b9e1cd0d8b6a3a8e0e17019d55daacbcabe211162c437e798d617974270938f004180375b0087758e46c235c3c3e4a60d2dc2a7a28094b4d539cfaca84ea027bff000839a13ef99760dca1320b539a88374c3c95f15fd028a9fb364776f09fb1751175478899d228185ec1fde1e7839a95b6aacea33edd2bfde6b0295fcec4f830a5a1f4878d7d1717c577670f10c59014364e08aa73d62af45123816b4ae59c41a0d170cb9b5283bbc942ae22cd3d845038b5b2e2de5d86b0fb32986aba5e4086f8a8b825c68ff51e08952bc10947360abf599d769cd9711e379959a861394e9a83e8f3bec32ad40b63d3f528e67c1caec4de1fa969b31094ab2eddc7283e9297a5a7e3b9595b5f816e332bbebeb509252e3c5334a1a973cd934a1ca8bad1ef0402aaa00e2fba8005acfb52721ea311ce9ecb8b947e90ca65e15e2ddcaea8568b47c628b18a82f8e58818283c5acbf52e19c304d8e81f623c96f2709755c2441695d4f33da9c037ba1ecf041922da561970407162bcf538b89bc446aa3dd3b3e8984f998021c6c0a702c1e15dc0f161e2c7e0358d3eee742a23ab8e8e9d13a097a0afb0d7c2f99638510baa2050c2e2076f05c45816556f034b1d5448b1b760865917148d4b745ab11d94af7ca85d94c75ff31ab00fc2a645a4b39caf1ccaac5594e6583fbf88b56a8baa6506380fb9a5106ec420cb86d7b97015d44b1fc53078c479f1b4d7f78e83c976552240da9235e2af8b8badf978a3fcb3d426b872a0f7f9fccba80f8cf9fa8f4152adf4e9bf597dd7d128a065c5bcd6dcd8c9565c9a7c7c644069a75f11740e07fc421a4357145f3b0a195f11884512b0b7c2e5c5a536d7d40a0b411fd4018c4b65c23f5716ef521f9b7cae2152a530677f47316e30128012f4b2d476bd2200b1c088c4456b4f66876d43379bc8a925d506b7ec0ee449be02ee6e541c438bf883925ea401bbc39bd8fc5cabe0ddc150adaaf2ac662f1e48eea289d2524f212b001eadeb0c00ac8e276ba74a077c2a5eb5142277865903bfe10c029c971842e337dd8c141aee918bad11eae1c2225504ae2823a86a81b5072ccbaab5c3f1c24b68727d5915752415ddaff3074ebfc4e0d50b61280008bbe252c1ccb6a1060bb6e497369f640019a3c31643f3803619d547831b09582ab772e33e8f79379f8874565bb813c489cfc44591b56ac45b718459da2ac58ef0007cb19383a87dd84b4d25dd0d25ff008d9d4a3188105af98d434c815bb255dcac1fd4ab8cd7f462f94201464e3a8050ad53761b8c68793655d3104a4b18c02730f400f5dbf309354683f51cf678e4232adbee7315b77188614894d91d89ac2fa94b5dc29297289619e31145ba80ed8ea849a053dbf50e943f1a730e0aa2f3f1f64b80393f6dd151b943bbfaeea50410482d367dc020ea6cc2620518e7177543cd5c290456b2ed23461b05568637b5575d473c9623be54e9bbdd0bfc4b5333adb8b5e140397ab66445559d5fb36a79e4debf5177600ddaabf8f67a0d41a97f3190b4659775f894d3541e5e02c5ec37026b9af2f88f61040a9ee5971553fd4a8dde7f7872f8cd18c2eae5aeab08808e64fad96df3270f711e83a437a5d918b0e52a19f0b21bb66c43834e50a4b6d37f1e21d52c4c4db99df12fbad1094a94c100824dea73294e81f316cbed9c175b7095d59f866545687b04bfcb63dd0023e97bd85d425aeaec9f5611b3c0f24651f52952abfb25028c4985b4cadb634346f3d4e153ca394c301b7fdbe234581c02e018a94e9da4ab353fabc5440ef0092d341577eb2e765439879e58fdcbccaa0c5350b399cf2a2df336f824382ce23c6fa97e085b72e3569973950957a1e465b297a3007cb0c4e8d0451ca5ceb0c2f14a9c3aa8bed7a6809e7d4b917ac25646d195aa75500b0e67755f3ec1d55adca30b3ae3255c86e43ca3f510814a79630e5b8968163b2de47ba8f3713233d88c10433bb2368bc30a47f89aa6b36155ca5d545c05df1026cb43ca78730dd2fda7a16d0802688ef0b5ac6aff00dc46e253f1650cb23c34b1e6292d04065470a2e7d223770ca56a44328a1f138f5cd0d712eea1d61dcac92c7d70e711b429ceb4086202a2930ac6365e5bb610743bae4d664da062304a5388c8b2694fc2d8a5fa05dde7d0dd4a0b5e529c78aa35b3607711b079fefc4ad42ce4aedf3dcac14ce3e3f3156a2add61f3915a5f7e5dccda870d05a3f7c7dc6f8a2a94e0e2d7472cd9959e134dda0d8b414671d57a7292882cb8d4f61ad45fd4a80b2a0ab9c3d96fce45dfa6010807c319d3976a020d543f4cb905954096e3e6eca62bac7366dc7817c742ff00c98aa742025ce12946aa1c2f8540a944e61461573557f2970288a1c95410e68d7f71597b8401663623ce4f9c0e2572854a097b3d31001e255bc307e2083f711b55b51a76cb4309baa3f4aa97a37710b84a2ae1f72522b88838badff223686a57a2611a65fb189a41af971adf6c7569b4cc798b50e71709d89f2e132657b9a7318269e6e678aeddf70971125b2f20ff0002bbb6cb84e1961fd062f90658ce3b34f20a63ca0189e3e21b1b18e2c0269829570ac7d2e04714355beea0c80b725dd715025c7d895408891c4da8feee51d7588c1b78892d39cc6346ac2add22a70184bd40b559ff00ae6fe65591fa95b844a9d98c70037f130079b85912b25aedfbf82229e5e401d79384c6a406c2b7b41cae514df8344da191bd244d1c165edd7c4e7fa43d60e928b455d7cc5a688b5457ccac8d231e4c954a43c9664b117437c25f62d58b39d888050d391a161028b4f3597b71ea99450e21026e4787c455111f780f78ca9b6a81d9a31a8c96e094a78be186a32ec5f861d6a820c3b6d08a14dc16250b763e38d8f958d663491d480744f172b9f883e08988ebe652585ac1b45b7db02d2d96a35f55c6c056cdb5a5d1cc3f374d2b9b228ba0a74e3c890d2b9b12e029799f32a60a08ef6d24da82b08090a2cce2ee852ffbeacea7430a3130102583c6f4d7f76373ee1d5f14c059c3842d8229ab09415bf31d665e0151905c2afec4a901f4ecb4629e8858ca1c60c002bc93baa517a03393d9776f92c00db61d722b05c37c96e2fdb13735e6122a828c050e3422b3355c777854752928d827882aa80e4d616b415068bf44cee85be93c8c352cd9e4d67598bbcb2ecaa3183d8cb125d1e2c1fcc3e23002ed990dcb8599636c2a8ad6503d78c79348173b8f2e4d83791972d971b16cba34a8f60605e988b6e5bd9339edee526b81d9c9b397888c6dfcc61a8addead171ba739712bb0abcfe83fe665733da9f77308d70ccd6294128be8d67e42a005348e8e0d25a34e8c0d47543a54409c3a6169aebb0ce14338209e87a1d966dd5e051f8a9419cca3973c005dc2a5ef1b226558e2574554c65559dcd522d3f06c55571d3f5e12ac36f4ff9f5330bd1fc73045fb761db9fa661d1338c86c1ad8632250322861c1cac136894dc53d129508937f99917216ac288d10adcab8968692af777b97a52bb1e216cbdd61503b2fbb89f12c300fcd0c5d68b45bab2e2846d48f94b378881050d762990abbe286e3691c9f100ab9a8dcd429115fcc510ca956d8cf87e20709d1e3f5010d866312b920d5f7cc15ab87c8d2557953c846c0e45b47ac704d629e435ca55f5919d3af0ed216360b3cdc44ae7ea5f1fa7763bbd6585a7427e1c6ecd91a8591c8363055891eeb7d97849468ab86f9044e081a1334dc98756c4414bbee5956b71bd9739a07e98b09a867264c605e30f6c5f4f5e8f88237a2179429fcc4ee0bc7df72e85abfc4a5240ee6432c14b5e520bad5eb11a5e91a22ac0f86016d7047b32b43e8e2289142c3505a85a7b2e4cb70be58178497b3445f49736235ec006ef08148a2591985658a39960300e5c33028494293635d739b2ea782abfa3cc77a479786344718efb2f2067e935b7dc4df552cc0ee56ae8ad7c41a362905719bacdd08f9f8631b82b2c4bc65d71308e61988b151b4f0800f69dade2502fbe21574cb0d637293b21c5296bca160c7b1225311b615e454c6ebe60b9497150d85131861d2d642ddb5900d504b6c29c805001e0c20f92be0b88b14489d16191a1823c9ebe4a990ac6a565867ee0e10452dabb1db8529956df4895b850ae77d73ecc13869f6eecf98059c79725e08026bdb0a29ad6e5e3d4642b29f29ec5dabad37168b5dec3059b2cc713623d81fb4bafe64b05d8699730d4fa882e12e84264f2151e1842bcc8f2469d46fd8f215d5095ea03d1f04dbc382a3b7ee16047d18a2fb588f6f9996eb1718a56f1059889578c8f66060797ee3c35aebe86a5000061ca4372ea532c2b638a8b31fac7351eed7ed4f600bb82bd15e455e3c100139f447127306e24b6d525d90b6a9a4287eac7981cee957d2445097ac69ae6bea5f2dece9a4785955fd84021c2f9f5b106a77ecdc0218000e822cea97bc0f2b2f7a2fc6577596fd310ab6b809bc540db17f20c3ad5741530ef7771e5bc23e86c2e5bcb4a06c20dcf983b7034c7928152bcc85435673fcc199e57ccbea01a6c0b6add29e129b412ef107a801577fa94019dbe458670bd99b546db9c2ebab9ce4a693e0ac68e667b18c3923caaaf23649f5b1525d23b4ad5e328d87e2620957df12d41da6a7a2e340f030e6a149a29f256f257129428eba5b6d22c03688283757ae4a2c7e138dc529caa7756c3116726c5bf03aca04e11a4dddca39a1379faf90256d64ae2bfa56a510a9f4c837156a60a95bdc00c083c84f0cfe818764a231ce3a88980ecb7ab81b8158b0550a29d05e669c4024e5381d6f714abd860753d8fe35588d3f9b38c941552eb6965f571f22e1e56dfc7dc1e92d6b51b4e48a3167f812a47881f4d6c11347f32c6d16b41f70724651c44f9cf4594d1355ddde791d92d662abd7ca4bc45754ab5bb3b1294abae085c148aedb7b50944cd3c6a34b6e08222372f8ae1813d899231af7fb0844121c55978c05b475e2cb41a77e0626adbd5dab39210a1b2fe4968802517b32fb96320a3cc6a8628a5bfb85ae0eeecadf9b88f39ca3ee2296580edaea2100003f286c42cea5323545f9a8b72aa822cc512d79b5c01a6a705e3cf62aa066b8b3170b17098b1ddb5b0ac84851bd2cbb15c15b572e7c7f270a8341db340dda1a7324b8cd54a1e207c41c0132ccca63849184025614d6d128a9455145700f60102ad5591ca9bb0aa2ea60a5bec12952d543497dec5071a2c9a7eb59d3e77118b75cc6aa3b08fc4a2b969171e197a6859505656d5f571d68f72c0975ecbf9c218d682172006fdcb008101a89a5abfb9412a85c9972e2fa5cb86e7b1a65ddc5856e0ca08a154d218f32b42cc2a0bd01fcc0639a94afe80440bb844aa95f44d4a9ad716f6c3b7fa0204fe933e6297297c0f903a6c25ed4ee25c73a4a6e8bc4e2f98493a514aec78c07e87eb2540fd9799bb32045de288307236251e387a3fcc5f533b0ba7d61c0e86e1baa4a0e555a9b4dcbff52cecc7ea98222b63f342f12a2cba8fb8128b507455ed4b5e407d440bbd1c9b69bbb9bf440dc5df48d5619d3f6804db55636eda8d9ad0111c4555138617bd4baea084512fd61c10db65476b115bb52b0a8b5f92b4a8f4712b6cd6e5abe88bd7e14148ff0094a44a9b8bb78f88d06956641dafdc6d08be6e0ba31e799601ac13ca5ef1213804b5e10f056c0fe0c08ad51c375d1f04455c8ffb46b34e4e2534ced0db7c23bccba8808ee3ab16ccd8b43f0b70f04bcf2202856d95950335bb29e00bcba9602526be650aaef16dab5aa80a61fe9b3ec8c8af61a4de4e7f1868597db071564bb5db923895b812315a4fc700f8caefc6e0059535daed54bcd5350de25d3008a59383a627655e4af876f9885869ae62b082c629b505b32bd5c07aba276b5fd048dd5d4523320850b69bb465b8c57508d1af7105102ab958c53c42a29c426944288760e2bf313762569ac2e2725ad8e59aed3865e6c7951bb0b01e10ee0defb396eaf5e90253c061464508e47578c4085554e5a3f151975615825970f03de62bc7f41ad511341699c1adf4427444d17cc299ced949c732eb9e2182a70b26537d4aa6a20cf10a22052b9fe180a03cf658ccadbeef8860fd0c6b88961b7cbc83561df8144d16d94bcde67222de2d71bee5a5d77546bf3dc13f9dac6e177068d7571a8ba3cca12cee006fab90aabc20fc5128a834210f5d2a7cd469584e3910f6e01464a66b3f91a992c00a3e09750d50627c24ff00032bb525fa15570a0500545d0c5ea518b00cf12bc5a2bbeebb8a331afd6d1c5a89dbfa82052460ef1c91e1188a977cdc46b37beb964035dc42cfca568f12893487e3605683caff0012c0aa5128a10cc00f7183ba8558157d84ef795fa531730cf91625510a8c79bbf1394bedd54709a68a5b16d439795a0444507bff002085a28b0ab60adc22ab8e612a61dddfc4ac43be489b5dad6723c0472d0826bb4872cb6870a732f09ece57d4bfb7142816db0745784ad25da622d5a0c8fc9ad7ec3da7fb30d0fa914b9a229f52de3b9ff8dc40ac797cacfc1c129ff3cb28538f3b16d3dcb730745d18939ece8c5145fea06482e550b89134894c79fe36602b29256c5029a14ba975a36b12035be2376a6b760a593044594050b174d44b66cb5ff982e1d2a5d1634d2afc268b353c2916b1141379d2263984257bccc94282d96280b61b6bb51c0069073f136f7e04c41dbf486ef514365171f82d1abe2345edd02005951ced3ebb855697c23119c3894c4138c8019c439aa964e86a5905fe96b3c942f11c8bac383982bcb00ae848e806bb56459538e0230ba2017931e04f09e191da7307364bfaaafd2dea25023b2b0ee540f6d612474a8fb8e955b52959ac1e62dc7a0ddd9503939a8b2f2732c64a13f4dcab5b1089180d2f087d1697c383f404a822d721944b4266018326872b00ce27d050cfd97fd0b1a3567a4b8f1902acb3f05b1854836fd1f1f732a554441dff006c45436787f534d5f79a9dd7bd65b993b1720f732cbbcafe116b5e4a3bdabfba4a2522ce080915d15227efd4b02a1ab534a2245a9e9e532bb8c1f7a55e49430597b751d7c69580aee9e1e199c625d4c00b89c2b9678f89afa2174ce6555ba91c0f09526baa8afe6f3c4bdad28e62f4e5b72d0d1c3329805df7f52f29742b98d8793cd7876a2ee78b95bc72432daab456128ce07fb886e9564d08f2a9f7fec56817a7ca9c9288d5e1222e99655776431db832a9ba770bf703192b45b130af4027ee09147a750b0b869093587eec2115fe83fa8706a0e89919fb86f9da2261246db84cd9d8db1080bd60a349c4a1f5838b4b7687de19117b6c439627026c26fb9433cc4add53025edfb10a4c53161aae51557e06f99810f623af91165c536ebe60dbbd9ee42705b9a857ea4bad656036253edc009ba9683de25c6a29c71387d9cff418a94c127fdd94b359c77b330afb2a0d72bb0a2babe66d162d6bc5c298c529cdb226b64b36cb2cf11847145ab4e57ca04277c60a488bd62000befc8eb61528f255de04d54d352c8a1113d65833da54b98b8879177bf50ade63d89dd9adfab2981847b81558a8ef75d0b8f027cc07b2a840a2706047eb010f71695934cb25c5984b3ea2a75469fde08cb6d794dd5226ca5470fc9c8fd91392115160f216e2dda85d0141a59abd3ba7393886d9b55dec5cad3b43f923f4540ea512beebafcac0dc6ab335fdc55a2a9a9c6f6200eb36081cbfe4869069dcdd59544761cac00383b88ab0365b3e04a28f7c5415a9a1a473a4bf8203e49f4dfab9ef8852862c277ab94ddf33b838b3c9bcbf62e73419d7f68e9f965d15185422396ea30dd777e54b2cba600dfd8a54ea00e5966de1dc2032c745ebd1c7a11e58e908750023c24c52e941ab1aeb1230885eb054f0f375154bd16825072523e80b8671d09d3a6d1b28169e6cf9e2e2095526f1f0b72c29443b5c4bff00128b5f352941c1dfc92969daa90d13f3a4af7ac556bea25dd77798e32c8149086c3225fc339261a9411c7cafb7c2296d1940755d4ba7cb2d22c69cc2a2dc9752ad8df72f04a01eac47ee8d7bd98b45b87eccb9af302ca83e5f89fb96d314e59178d455c450dedcaceb5c0c779f007201704be6885d747f88a6ae057cd8908b2e320e5177dfee6d3b6c02dcb38628572dcbdd4827b2f4945d6b510013db8a68a659710020da8482a85e90f195db4e2d581b5d6b328752e798dc23a4980006e8fe8f5111a9a63e4c399dbd91695537e5c5ca6da2aee25ab8548a4a04c784445b94ab79cc42ad3e2158df0ba02554155be8e5627ebfd1af63745bdf00e583e60e9f9a6173cca2843c8ca5300e2a1872ad5f9e6365434131fe65ee86b78d71628948ec0064b51e448735eb238029af87c1129d1402151e0a8fae868ae44b88e1609e086d52179ab0abf2b00b5025b00135c44b2ca8af620ad0fbf9843040d2be6a20d14bb225d9b59ce0034f5ea64a6718ac109029dbe88b6c091cda5e1f7442f408ce0bb0a1ed5e08a16628058dce3ea21ac3e5105788c4c0bc4a7117c9480bc06af466e0bbfcb18968568f9c94f4ba2a3ee0815b7f981b06eca854cb1b5a7e97934a6685a81d7edea21014550b4d6726afb362aabce6ed38f6594e90bf7ebfb83b6414d77dd426e280aff883a54dc4d715db96f637761c184ec3a38bcb9c7c42c3419ac7b2f98de86c1f3538800813fee6a5756a2dc95a14015136f7111de0a31726edf27d41b7c4e2e88d8da81cc548b44b5f089419913a237294f99a533ab988abd97530677fe4854a0d6bf1283c01443b87baba1b000099730aaea122149b6d449c83adfa3dccc96a00869a9e054b2f865b27c054a2868ad12cdf65c81f1d4c8af692e1145700f61a57615f99deb28912b0318597dbd312db4e3b82d4422b3a079854dd590367b7dca87bc303849d495b215194abb96585b00ef928c30ed8d183c173631845bdd211d8f835835cbcdb52a0da9dc596f5a15141e0aa8f4de184bbb636081e5507c20b10c96858322b642b1cc3e50b4c5818c0448a813c483aea21f330ac21c25c87995a3612ee3857705cabaed1b86a45e98add312060875851ea178ea10e47bf512d4cb5438b32b42539d5d5c16ae8be1970eda32fd457b45e597e46f2b02719c12f61b5ca8650c1b018a54f8afa2384a8cf0bee26442b77f794e6892da71782814f117d0156ddbf2a2b749a3e2e5e74d401e876fdd4ada15568840d5771c43f902c0d18f3048df3170d3b719db3b479339ea5fa83c5f6dbf93920dcaea81f3ca6bc4ba434b60925748c1295b50db0308526c5c756b32375606ab10e9bff00c4228474ba510a134a726a359cfe73a8fd4a28beafc1a8c6d2f3750452c9629c64d81ecd075f8ea203d9a7db5f8194a76e4c5a08c04f9ebb94aaa5d030d1bc1c18727ed40b34b5b81a1ed07fb4a14792f1003a2afe20559eabf1a4058220d3f8a96a1b68dfdc248ad5393e7e65246db291828dd8694ee3a00f04405f4c0ac39a89528b1ad8ebf895443f2951f546df3089c400e6255e00972d3a70431702a40c2618a5dfea5df6d13d977e5c58d292f26fdae04696a6afe7fc9050b656a39264dab65400b5db63575bc8fcb3f295373ea294377e457791f32d05d244e314770687372a1a964dcf2b98616527d91c16ad17f37054bb95087540ff0057440a16a9fb8e0bc42f381e236b7587743a954b47152dcb5d6464682cb08ed618863b2856793280050791d0a636a95a23424fc03d2e0cb28075dc5f54bf6e6c142c63677631630db03cc9296df0a94572ee6d3b89f6f22dbf85c58109d21a4d156b52b2ad8e6416a8e9746a56de5ab788035c086efe08438ca43d5ab9410af3605754b7250257c421c52a0e2a564754fe1e22669c71db1b8bedcef683fb96419743e5951e4bdc362ea564e658384879755abf0422c22c82f7842da674f53597b31305e43c1fbd647e1854738255a3d3f4469fb0f253fdad568ac4e1d2160d353714734ec61eb2af177fb2b62fa4d23544fe12e4c853577964b2710756475d8037b3a2557ee9f58e61c4b4f1347f55ce0fd436156a27dabe4834a5f0347ecaeaa64cac22d4fdb5e415a6bb1e534f7092d90d063f8b947699e0f6ce28815227afe4fccb45c229ebff00efdb29ad1bab5470e75e5fa954629741da217815aedf990ae60bcb92c05b5f662f3baf2d07cea5508e3a06b60b7ae67876532fcd4caad6a9292bed8eb7b5006a8079c898557c251ca2ac0d2d0b1c051af38803f13d41e10102d8e1b963f8956b886b63bdd7d23553c8abe919b1a0f0d7bfd25502a148f569c828a43ec9504cba61e63d1e92af4f0f24e0d8aab17f52f948f112996dd1d8b8fc0966126f9c5c14a20399f0ae02945d29d8ead1f30a1c9320bd4f90c11864765916ef12a03ff36c4810b47c4f97b300531cb66d8dd5635320df1b4d56442e1b968b360c791a595231e0864d6aee0e91cad3d9ad88c61b94042c1ba50ca41b471f32caf4e23e9d58277e732c04a0c673e417ac78fa9bfba2a7374a4de3e610b75b1fdd5d2a0446210b96670e8bed805957c4b2eb6839b2b488dc7e2db71d09c04e485068f0eedcaed40e1b893f77518f42b888aea26b0975ca79f1ba7a8ac047652acac24ac20b2da234128ee11165c04baa63d5d5ed3f3551f215db01a5942d717178808768ac094fe6b600d3caabc84add1ef8d57f897b4f32ff0046971eae85fe0e53eaea508a1a22d2a162b75c8c20812f8e1605c15d598091857685b76f1fd084b94c75456aa804c5edc19a3780b2360abbbfbd945d4169a2112da30a1d115fa9698a2a880cdaa06ef8abdb80b7b2d604b80a914a8f57c265f09ac4001a2a940654dcc0e974f43f52a909d822dddf15eacab5004a6975c51313a2e3307c7cc71b743855a9ec6c065ba0e2509416d38b6b17405430285790a50fcc0142ea94e5cff30e40e5c9d7e2a6b96cb5ad557b2d52a2e87947d512d958ee2e9c0fc9ec2f676bf938dd3a1b300a92da07aa55718947311e798a19c290efb73e0dd8a96ca028895c41a564b744facf67ea656ee541b52d581d49cb7487e621bd40a26a8fb096009c18c670dcba8fe931a42858862fe5c2fb0ff5f218667ca95d42ea90baf6d15a37501a3d24041bb518a725bbab2325848839375b787a82b2fa56cb7431a8750d719c2e913d24016c79b86aeb8a65c091c930028a10dac252eb88309a28957ee4056aeacaeea0f47628ba805a4bd2a71e363cdb701aa2a2e0c1795b9f6331c1628568c7ea51d7e3660b94128aa72c701294213160b7c4025229c5e102bad2300954ea850fd44c3d44d27157042d5de273ed8dc3509b5c30943d29d1178541fea95c65d447ac4058bc02706c63f7c6c4b491e544accc1c5f770616af4f6a5c70cffa5cb22d366462f21af66d645e582d5f2b863ca75ecaddcdd12815d2f3a615fdecc565af7383c902e260a62944e3e6f25e2e9c1dd0c5e68aef6e2064e5df2454fbd55b0d2393a55f9bb653d6d141aa22eae2c502d73734594df5f3b2dce4da840969547dd6b8bf3f99756d5406f158f31e6165af0a21478c1655ff006858372ee8b8374b9d970de44df2ec77f3f73884550c5db794668992f686ea77ae5e785613ad32d7a721f6c6820e92aafb5a8c01b5f2fc7b1d95a601d1bf9b3ee01a36693cef4fdbb2d9cbcf387ccad5d0051ec7b97d553d7585f9b7916b70d2b8fb839b04f82228da255ff4cfed2da29aac13de6ae3943062b7ef5984ea2b1a0c5296eac2a3f56442a7c6d38fabd1c8d05954dcb4b59f5c4a2ae7442241b6a6a0a2ba81b7f32a1edbd7214898f1d4a0e769b29d8d3538b03e983be6a2d20855457b48f60ee89736df370199d4ba02d42485ce5a7735651198031158f8c66b17c7a4bfee60ff00b2b288cd0d650d240a9d895529699c5a963be3a950462ed495c5d9cd1f9b9db15a4b8ffcbfdf52fd854f00c896088048c50e2a1a0c218ee709c979014bce47cf04a888d026d5cbff00152c0a40368a99486fe9389f0c141ef3f72b12d0947abbf135508b01b12ca2a8d26339ac56118824c4d21fee95f18969fa3f10437fc20584a269d287d47362d54a26f2162b30783cb942631772052ac2e0148bdd2b705c16adec0a59c8b743117b0a0ea34497c0940b5c3c7c426f478aee5a9ae81e4fe657f55b02041a222fcb93f28a9ec61da75f89668d3c54b5db1c7fe226abef61a4a74b3461faa9c88be8042007ea99662dd302006bf25800847436590d1394e42159b2990b11ba1777591aa8086bc220cd1cdf371eb100beb100fcf7cdfe4835622fc11b44d7132e35c97b0158bf3aafb8ad37b7c6aa010048d454ac6d794786f04f0d151654ad4e02d870eea147bbc44116f66b91fa8aed5596955bac2c4943c5f15c1039576baae02ef896045d00f9fc476b5469ae4542c6baf3e1d43c028a7df018c66d623c8657cf0cbe70510d5a9c9bcefc8dc0d4b863cb9af581dac720202a83a3234181abd68baa985f0d62fb7dd5c22a68b8d598dfe65802804e549c95738d2fbbecbb26e91fe6fa96adc3420b9f11041771768ddbb7349d2b87e4fa85aac5705c89da55c55545395562f3e8a6b8fc3b068b630a1a7eb259771e04c3e2643e2d825e4bef518c8844b1e999a8775e422ffa60d1571b54bfb0dfd3b2c25308dee0ecb97d556e71acc6f693f32e1039e62e995188dd802d81bdc8eaa9c8175011903914528615bfbe5295ac3540653bee26a103a517cadaa3569e9b5dde6ca85daaab387b8db2281350f80829f0e6713b30bd223b0078d8a08639f20fb69802d9d046257cb345550a2a5d64b6c6bbae980bcc08ba3d12ae2ecaa971ca704b83c5ae252bdc3fc404d22a2d9470e250c29ba43458d7f72c8510d2ad3fd1045593c6e5b3ad017c0a8e323b438e9049aca35d1f08817bea24aa6b175d5c78154edd793fb458144c8364f2c3e0c43d3e4d2f32d2e3703d6260262ed70df50e15b4acb5140bbca76dc56acd032b79881404a9cc452c8375515e20b587c9b966fd7ece600520e3d61ee803f110ba82983bc0bfc6c6921ff99a4237c9a77a632ba60caacf23ae46a3d83bdc6a9a70d5f3d9cc0a15ccac4630a5bdf192efa41a965d617668a77f371bb42fb39108d0f428f4589bc3a0e7e0be1843c5af89671e41f56dd7b2c865389f04053104c1e5a8b80e756af82e17a4ab02c6d65e9db2b75c3f56c6ae0a2ee69ad0b76dab97422fa000b59afe235d383e5af53e6720de03bc713a72c0347ccd32af6605ee0c401dcce3d291fa65539384f851c7cf87e2317d8ecac1b47764dca5e8175d635f4cd880f26843ca259cbee21da7c8a3f04b3e529955d623142e20906ed5983393fa2e9d2fe62dd457e09b09446095bf3315ea7711f14aa3fabfc405c5ed44a325d69e0bb9b52ac7bc37718fb7e230e864e7dab2bee039161eb55eca311895cc1d445403566d8740343be48edd52e31111f00b0ca00bfb20b8a407c176137c83bc29857bbe626a1c232e60ccd4750160ab5544a9f6891c9cde8a8480d0b18c170e01280da4b85f90c94a8a9e630be862d2502d9c5b2901a063d247960c57947b505010e435d3d952974b20d0e3ee42915489712a34abde1883cd50d5b0b0ef62a3e10da4b42194777188d547fcc0af9571034229a3f27844eaa8385d7ea59f338f0b817a607f688cc550c0a5d20a79f843811936aeca9be616d7064525ecbce32373616f6a7b7c239c581f21860fd5317a7e21dad51cd50aa83c6cad85735191a55acf59cc4a169b576d4ae30aeca8202807254d56f73666df3f3c8827583e19db2c3dafeea04596a83538c5cd46aeda12212da1b63e782a0aa82a26ecf88088ba80ae8af8952c9663765a94e71d8dc159e74c83b422edbb5885d6a4116d4a2fcb4ba716f714d6cf5cbec9cbbe238841f7cb701b77d556caf2000a895c377b8a1c17b54ddab04dd6b9fc0e2a002d516b5b9e6c0766a734711b0ad92a837cbd32576b720a96b8e61604d2fd51571a3c5a1471de54a425355a0bcd86beaa4726507c8ae965bfe25820ade945128a3b425aaecd953605eaf5767db1a02c5a2921fc0983fefaf6c2c2c8de3a8ab48e4757898d68e46704a349b4b801b9f0b83f06a09a860397c6ca232a2e9c87bd9bf9982385917ddc8f71f30a0b8134184eaca9870149e23af5c9329b7f0cb829db88ee7e3ad70295ae9d5fd302d8422344243526f157020e1a3f5b3c0d8a5e0631b6a0191d5c4c9a2feebbc8eded56f32e28be20b25aac2dd20774b16e36dd4593aa152e628b11b5e4452e872ca80d524258773b10697f51005d39c730556d74f59522da713c1b7083a33f444b74b38f75b5f9929c8b517d47a8ab7c4ba5c097d10698bc30d3d4121c2a8d57b95767aa96165d4fdc8b9c0d0f464b51cbb206b5994abbdb60b438671aaca895278d823d305e2d965f803e032b6d89ad6c49766b0002e88c4e1657d6c2b07dbb12c4726b1fa81e129c776ed80ded03a7a2d0a122cf382a42f3d9a8ecd19f04afd901dda63f3465c60a5774e08cb1303931c93d0391f197e45711895f6171aaafdb396e6bf4d894020cf39f6365afb594b472bed7227721471cbac957d4879fc77d64cf400576e3d0b952de545a2fc08ab8a4198ab95a6e646bb6fc05c69a545010b53795395b52eeb440ecd391b0551c19e72fea2b2732ade0e60d50ff00b859aaa8585f10c6626d9a349a9dce47168cbaa2580d374ae74bcca34f20ed2feaba22ea3c282e3ce2e5a469e721c2225034dbc2d73c1d47066d6e68792854f88e28dab3bc9530e078bc5263290d86fd954056a917d25d5ab6d7e10d2a17595ce79f5d463c4d3d01e06d92a67e54dd307cbb8a14a0d4b3ee225bd84dfe31a0d17b0d3bf12a4b88252c42710468416efb0b04a56ae56b65da8faf111be78612b384aab2b627f0f11e23773a3970b6d0545f465b810257346cf31196b63451a277b0604de16c67310c54afdfaed4df36ac1cd0d0f25410ff00d78a7738360a01b3820aa7fa6add4b5e44e05a6f2074f6d7e67650aeab475815f6a0e8369c4322a5811398ab5fcb282b6982b895080736a542dac213816fcac5161086e4aaeb1bcbe2005606cf9668a2b4430912fbc0506ab2ef20524721a0ef61f775826108e18eb818cfa5c83d8d5427375297600e559706353bb784bd4fc8581254435565eed70cb2e05ba85436460d2246e8f6c1adbe01a54411347031f92085bf298aa416f1b952575e20167de842a5aab565c755e1728ef560b808a4b8513d84b62724698f8e79a2e5ae3d96ec682d5ad2e1634461f6c50b63f7339a4c859797ab34a5f5a59babac6220a0b760bbb14b060d9f6012f812eff9983bfc1dcedbff002e516e1c8f761fbc85821a2a52ef62015c5085dcf834710eab97fb4b53ff005420ab7b05704e094a2b3a0834238e6ce9e72e389357e4f93136d6d9dfccf0386f30e18ad52b7f7b1630b134eb7a8b8f819114ce9f17936b41ba06b8f88096ed5e9dcbd1562a3ed28e6a3a34150d61fde0b7606503bbaad6510a19a70cf3fb915cd5eb4ed396a9e21ad620e5bc8c18bd05d1f6410355705dc59414177c33989a3da7179f719481cf2d9bf23d554cf7b42bdadf6d2a58087fff0095d863ff006ef246d638bcf736a3bd11f6b040f25a7f4245058c75cbc7afcfc426daaa986b57ccded93838fa997201eb615f246b4b68ff006991bbb87504287629e71c9327c1c7bc2cd5ae1d8ac8340fa41ea56e442e87046d6d9ce712b59e16123dfb9e30579674b1a78e25bce69f88eed7651ea59501ab75598452db1571325e9c9102ebee075ac1583e698b0bdd0ae8f89715f5e42b66fb12a21bd1d92a3f304fc830d8bd235502aa41d518128bf6c216b9446d14de51c9aea172775bebc9b5c082af1c9637f7588eb29d38d1d7e664f5ae3d8b7d8a0f82aab60d9cda398b6e3089f645aaa1e3c5fee1e74bf2e36559e54f8d65cf73a62f8804385832695621c00b0edb31199621b0b38bc998280c874200aed1c1c9ed80a7b62250a6a19b6e535e1cc1f887920b6ae053ded3f24bf435a5fe2112e576751d97954fa7e633d953e3b601f5acfa32e0bc563eb8826400a3c23e50325f141218b7f35f821bb756732fe57cd77ec2b67671f012cbb5f35f7d645515e71c559188f8066dbe7ed8d61c58b7966f3b5cc2bbb655ae42f3aabe62dba003cab4524e3cc11776ca2a9f771e54d2ec6a538a68dba74809e006582b7fbe33c63cb716adfbc897f52addac3ea6ce11d579b5f68c400e42aeb578c966d2acbcb2abd975e00795eddc541e12b7c88738032870e6164c5e1ff65c1f644508ede5c62332b3eba6c97736a25a856f5ce5c0f200571ec3f1522d528f5dc0094d242efbd5cab3522a8b39141888e327ac8da262b9df952968953e0bff001912f51bdf9e25ac11bcdd91d86bd7109e92f70e108bdadaf4e32735f94dd81465fb50c81597f69706112d91a3bf2fea182e519b1e6b584179745466b6fc0be21b7e96e3641cb8730db04cfbee1982a31397b5556cb06ce2b334aeb6077d28ebc88b5ccb5977756e26479be98d80d8e220a0030590029df7fc89d87f934a1300953a39fe6396bc499229b6df2143ae5b631c7935fcc235e684422f8a6e5d0252ca90eb8a706f158d1194750a4bd817d7b3e8b0782000456b1121df2af04e59c70ce25fb31065972a0d2b200bb43a601274dfb8eb4f0e6a62aa70ebea5046976a97f31664a56b05501c80a9be97c590fcff003321a186408a898bb76e3f52ac8ee7928f90d3d32ece0e6a19b91c8f85c16c546d1f28457969bf716550a9e7010480a56c73d8559bde03b0203859550168fd630c41a26205e6e425ec5df552e3260116052bac41ad2f5cefa85688a2a6b4e1002e1ebfe52fa1ae67e59bd5c9c2db2a082addc73114b522419a22f4e3f8a7f99d96aae138e7a96e5fbed9777fda1a6f7dc4e1dfa87cdaf1d8732fc429191a62fd41f6e4c61bd00fc284957aa2722100a7355caeb197755c2a671e7bfb8b54987d57910c45178bf98691460f03c17f49040a67665b4e807e6a22855d787bd5fea54393eb87c67e6a5b18a3635577b93a015799e5bf88be02d9cd6b9c1152de1934a9cedff7df888af6e9d3ced7aa9caedea2171ba5c4510ddc5b92517e5b0032e1ccca6b80f504dc1456dc87c7466f45fe8a854b069e0f98d79a33607622b4f2ae70f23d8476d161d3f9ba211deaf9c535098ceae64ec27c5ca8c2af22d409c0fdc05e900666afd1341ad2c525cb80f4a94a9d236fd7b36e5e077ed8b2d6b23d21c30174cb6da9ccd531cc6c8016e1f545472eccaf8578cd57662ebe5dd7f78e03ac605c10588c02a803c62c8d5b9e2638b6334e7630005ce79f9202d89507a62252c7d31168ae9f65f8a11636fe45743c8d7fcf8b8a0aa32fd9b26ec14eaa54b07db8eddafe275d0adc7bc82e29fb251b47438848e37bcc4e2fcffb95b428739953a3680980a2d29dcdce4105adcbae88cc000095c42283e082865b0e8811e7a540ecdd5d1298babc9b58dd9d4a94759516c05609561bda4e3547ce23a90b4052ca486c30382028d07314a063feee3dd4a6bf981556584b4aaf6a958712e2ba2d8237aa2dc07ee8ef1858fcccda871dd46d751cc0ebbd15b2d82d5082fb0c7f1109eb50423cca98423f840897183b674c259fb9a3b9c234b775fa835f92699f225e7473f51c569ef6ad669c42b134873531eb9fc40a470b27880fc30ce03ced4e1f886245ab8b55547ff5918dbd54576d0f2ebb73335bb576ecf390b513fb92e8bf88be42af7ff72c63741bbef309b2eb775f2fbb273cae4eeb587e6e5b03ef575a34b5b9092bcc0554c7ca1cfa9dd7ee55205af1d5ad3f6c25b2d4fcba30b5701a2abfbc650e8355afcb388394ab81b511dfeeeb3ba543b4aa85f088a077fb659efb347b3e7ea51459baab0f56e5cff30df32c11a2b82a76a53572e637fcca9969f24105e7d5a7e09b116ba228dc961e9426e5d983951157eb6c99098f95e6542155aa477050a6ee188e8045ee3698ee6196546166f74415005d887a96ff000e0c7102639c45785d223aa0cd1b236083d89d6fdfe1c7d1142969d7fd20d03f39dcf5167290e31fd4e5023751602e19c9a768da611520acaf881aec96e2a04225ad18a36829fbf921b98347a628e1ec791e18b06e10571e6e98a0263430be6baa7fbb34ab5a87012f841c4ac21ebea0053d04e21d16cb5838570a75cd18e018282eaaafcb04a07751c4510d5822f141ccb22686fe0f583e121687b9bed3641d414a775ca10ab1d65fa90d4b3107aed95599e09712da4a57301e5d54beb9db48418ab717193c9d159b1c63c95779942e686bea1db5ee4a8acbc34f172d715457d6b0fc205a38f22a93b75504eb323c02940a95b7714295572841ca2e5819b2a1a05918b5687f7995fd108991586e59010149aa8a4b136be619d82d36004f053f79fd230a946afdb006a8e2843fb5fe26ab8fec7128f18a95ab3fd3fcca1be6bdeeb1c941a74c6fbac68895a3439f9f4095a13a2f46b53fc90a65880a1c0787bce4d2fe95fcc13af36c70ce5c7df315a06ac7a0e4fbc811b1ed9dbd6d70554202cb89c084b70c5228b60f6bc4d764c67bbf37b9cba3a540e0785832145b4f4f4fd0c2ac1ba5af470bfee20d12b496c3342bea02a9a73f846ed84e4aecad7658056094a2d1be60112a37bb4703f3114a1476050aae5aa65888dd013b75deaa1d08a3bc15d4d6a9746602e83588a164bdf29fb9482c957572eab99542edb382e46cd87d96c0082076afaed02be08052e714bf22250aaa7fbe1a285aee40b42ae0507054fba37e21d69a832cb978b9535f08331b24641c517b47647d6169a43e066416b5cdaba5a972e3b8432a73e7a1e1defc860e90c46bafc18a5c27b2d6aa8614093e62e1085081b83fa8eaa80f184d5cf6502b4b96ccaf8619056fa9b45d3985f3b80717309c704d9c2bcb2b058b3061e8c048efcd28f4759624937cc2502bb644a5a6a4e525c0db57f51db8191415c451d76b27cc186ab41d78b01748510453110fe3a9629c56b29bd985979b150d05dd4c6f7bbe822205c253a572b9561bae7e6034a26a88d5a858da6bad79db2814850210810f804e2b516fd636591d464d2e87fe03c267e739628205005a794ee1cc12edd0e6d992eb4f92316d042d93c75f30d83c1b62975cece9b2e0a8829412954594a71e980af5768395b075968980dc9c2324d5887302d623deee0c6680be0a7233ea955df353dd7ea169ae6593f64b45f1ea310555bb6741c904b0710bdfbc8e2a3dec8ba5dc6434f3506bb519c1f410e87a4c7dbe8815554fc1ff00aa1c14c533f7fb96eac6b3b590520b5c5f2fb2d514f43b5c823411bb292afdff000c2b06af6342bbf9cc6235c9c6b55d46ecafaf9af20a1c3cb5c7dc28757d7cf76c15098e5e0a7822281551375ecbfd4bc42141bc0a8d47aa057cf18bd5c1afc8176a0ae5892edaab3adb705816c4510bb5baa9aaa50581fedfe650449651f5c840b542abbe5b21c146df1c6cabac3cfaf3c40c039b3fb3b881601bcaabf5eb002aae346d75035555b6b3f503711a78da42b1daf61a3afddca6d5496dba76df2f9584a5658376babeadb9a5c5ebb31430aa3c3c88595a4d92d2b8d945ea8581b3db70997a7815fccbd5df2523f73e8691da9b3826a7e918dd27c3141111b131b816633243cc389e4ea9ece2de21ac03771870b94e290da878b358fb0d8037e98b2a8db5c7e262e07b907e129b52c9c29695d1b5fb828ff98160072f99703e4d87383e59f11dab89407deb201705fb8f640ce21ac22a8d563e0521a7b8461da2e89aa722bd2143a7dc805f117c3131d26dd7112c5789c2002745bb03e59e21748ec62d8031036bc255050dd3f0428103c9443a8eb0f96e1dc9a853861982b299cb74b494c6a96ccf226cf9210d6163e636392c0394610a17f535ba6d8dd3633b619ad787c8d3ea6ee70c821d84ad8d420f5db470c336083db0a29d1bf6b730ba3e09406da47914d6eaf6a04406c25b9845ab64110aa7313a82cbf1b36180d15ac8f0688e14f93ab639e57d64bf06ba981ca7703dd81cd3755580be5f044423b10b6b6cd6e0d04a31e3639ab2f7e61d3bf619bbf1cb7100f2c2fc3b86b5a34bee28061e2a1e2e51f41b530148515ab83b31605a400287025022acf1b87fb60ddd255bfe1d65e71ff95c1136877ff7fb88bae137f9b2e23873c95c14e5b12ba4c0f0793f3d31283a157aa6f84f12128030c3aaa7fc4dc822a0ed78fea05d1cc55cb2aedeaa555835e7d3cb2c5aece8c2bcbf123c8713af93c417e5e5dd18b102ed00d6b28707eac94edc76c351a308b0402ed8174b312169a56db26944b02dd79ae7187850f0566c51e5556fe1104d32b81d4791af600ac5a63b1a340fd9c5f84bb34e82cba1398b66c5395d6458015ef4fccc07b736c6842178052c1d4c04c6a57451cd4ac9906deb0dabcab4d95182d4bed354512a551eb0dc85a35fb35fda084575c5bfcc201f8852ac15ec3f8d4b50c6a7cafb11dc9e1fe86eaa6f9c9c995a2588788382ce8a5744346579f0fa82bdd0a8f840a78ea90d50828c22e96bc51b3a0c637891de5bccb22da165f00cbcf282e3f012b3bcf1d6ce8c2ffb9f7259cb8e4835e4c66b9ca84478a1650dcfb2b22e381e5f9949bf386e5a514b27d77c532a728ac6a72dcb0c420259d370753f9414b4c03676c3b70bbf717a45a10957b8127b74a87409b34e8804a9628f6228717971026d3fb65868ae426b2de48486bea20072d6792fe940b8d8ad128aa9748a9ae7c850e12821a2edca5e056bcb565c3913f61de299bda29886cdb8cba183425d0a07c7ac774147cf4427cc6c55e60caa84f4b98c0f979c570e580e2428b23ed78d9641db17ea1e6b494495730cf6de6518558b65f716b6baafe130dca3063bab85330963254884a9f1d4194ead146fc27b9d6be0230380ff0079f1ee0416742ff0f617a8b88a6a2334f5ec40d1714aada8519e24087742f516a22f2b2af7f1afe261a78fd1b91b79eeb6e96ffd8f44746ae86f926169d08b11e9a87c25d2869072abe2a1b250d7fee03450528f3a2f9e88806f23ff009942ed4ad6fb229827003ae26cd3bae780ff00b1851b6ae6d39e25b3d01674b476cec713cad07211069c7f7182583741ce5712d57828de2576166df9b7cc08ab2dcaf3b2b74302920f139d2b36d4dbbc2fcc2ad6012252e2eec54a7f7000d1cdd332029695d8ab84f378970962aee5facbeec2aeff00f7ea6ab1dec95f67059aa2bb2008b82d9a1d0e75f60188e2a9e3359655e3e6122aeaef0a836fb65d7c814fb444cd7906bb4af1d0897fa82a6cb6fd4643f091e22b6583f0c39a62672df339d6918de63d4d4ab9c458290b4a094986bea365b983522e141c148dbb21978f88dae8b23c176e1c108414189001045535a1df982bf822e12b1314e7b3b51b5ea88af7942fb65f4ec0e50bcb37617312a4367c592c555b63de12feaa25669bb6704150d66461bed1e20fe2e55f197a9823f4b064b45ce28b3ae576978edd890dae08dc16450ecdd97474a49770ead53a13870e03ddc429a6ac3c022b5cb943dd28611dc74754d12d71bf12ed0839788f6058a596f534e7ab1d1b52d2e3d023f2bb9646e16781d842d7816cc46570bddc9461ed7da5f82266744636b45fc5e46b2f5330204629a1df8cba0850957d21c8bc85cf43728deab7aee01bac0c301c150b3ea51ba97e140afcc21a6234ac75772a16c367db0b58eafaa5af5c5c7dab1ce25a116df0436f80583a18d06c9ba3f3fd3e4c2a52207b1e5f1142147c94d871dfbfd116d65153e03bb274838701df12fd36dffc04bc01b7be5e20aec052dbaeee446f7abb55a6d91757894607bd4003682a02fcc5a760d3f9ff001174ad6ec7daea601b55fb16a2dd745729835d7e4b9c59564def9ff17025156bdb21576109f43383fc44a1bbd94d6d73938d2d36fe61c5b294c6af112853981e3a4bc1101add606db5eb45bb089c6b585a64c4cbe02c4b6c71576ff74f246044aad46cce78c89ab94ba1f6eae004d0597def1a720158ba53e0fa8e83f07fa468dbd93ad1a8ff00c6041c79b6311c07bcb4a2097a2e9f194c0852c7e2507f77260ad1d3cb0289fdaa75a85bdf09453057e036cc2c69bc10d246a3f23f67fb8d60ff00459171a1650c0b8e71b08e8f8a8e8af4ec9a615b538c681fe2760ab2e5cc0d9ac3939b698603960772b8c0762e9d349744ca8d416603c1e330b7255ca1936890578cd3cd2305fc443cc69a42dab5f31b3bf82e7ea13bb697c4ed051b128374e5970ae4eb7dc0efb82bcad65aa91cfa42b2b5455ca545b8b84e01710d0aebce73fa9b74156ca000ab5f312210b96cee5468b70826d337edf251dec0df5621a2a8d1cdc412dabcc07d452fc438560f2767b15dad2204523b3655d855ce4027bc88e2165fa9b1c12da3c95c24a348f2aa21fe7904c0c8916d82912f1b9d245e7ac13cab8ebe412635e934b004d5f61f72bf566a022d0bae3c203aa8abf1093b81dba3dd8b436005c06161205e63632c9b6035dd41bb9c0e8b95e77957aca5aad266382a1e83793ba39a816bbff1993ea0be76e708b30a34554a861fc9a82118590ffe1546c89d35eff52d59676d15f0f3074386feb3999c6eb8c31802975745602bd83ce600df849f04782b7d553096ad67ca9f251cf2474ee75bf03e46d4d2d8f1dd9fdb253415995d6cec5acea6bc4440c52a83d040c14ae29dae66d234be7f9e216c518557cd0c8856d94db5eafd40a4c1ed7c46ed451671bd4772b6aee2ec97ef3e92afbccb03e0df20aa40d16396fd87b33520a554aa379b97d979a388f0db34a60688a29e1d58bda211d28e71619a8d0bac046952da9ebb7c25c07545bf1ec4a6f83f530efdf20921c6e51ae734950d0bc45bc39a881054a0172f812c9455957cd4af16ee21facea2505afe6dfd12b775c792f563b8236207c2544454283c48e4e4f14c3c114478a6087bdcbea134a823b1791d9c566573eb392cc7b5a8f120c91f4f2543415e932271c619c37c8e24029a646a0d05d128403aadcc60fa890abadb9798b9171c76b857697b2843e6a35899db28005d916d5783c131055be7c9418a8ea1bb9a72f196828200673e40bd7b7428439ae48e5193b167d4056e598e5aca32893156ac0a664b78d6820a237baf095b6448af485fe22e6a18c02462bed21b06ca2c72b5cabc256761558cf4af656b96eee5adbf0e4ab1aaccc86f4101f71a5f914def18f7bebf0cac8aa959ca3812d6136f94efdb6a9a81f79badb98f82d9bc4a36700b7315bbc85da5c1d54530bb1f87c473c8cabdb9874b19cf402ca985dade1c40060f6cad3a41b4bbbdabe0b8078cca554b3c5bd1b155253270888945dcbba6f91f8256d967a1222ac535f10210cba211956cb967ff0047cc5aa92fe515bd3754eb4f3f12cd3dd5f2695c4777e3556ec82a145ad3514c4a435c9679f260659cf7c4fef2315c12bce05cb60cb104ab2ed58ab428bab838b953a464e536a99cc1f89479557fb21c5f3781d684edbbbf778ff797b660e52b96cbe429bd3e9143456e0fbd5c6a4ed434d8034f2000735187317306a00a30e1f3c5910113e5635f7e06345952d061e5f38b96cfc8f6a22aa2c23ba30a95450310bc4d749e7f7ce7501184d13d9d9f7290a63f2fd6bdf041c367bea62d01edcba41b6622aebb3502b414c3402aaaa616177e1bf8cee5c83485c283c1c5cd9d0f0b81c5c429883b987ee54a149a28ff0052ebc85cc87e655c52fb592dd87031008e1a1340fd4675f3041e24bf47cc71fae27915f5291e1ef6a73a031081467ea3a2d75d750c97de59c73a8cbae08e864bad5bb882d172a7469a227cba89cf33ed42f3c0f9051e83e83dbf28aed7cb058daba4aa0b08ae81b7362f029b38ca23f7bad370656f54f14791fee340aae01aa028f7b0ad22436e66b4b5b57db85905abb74fcc63d52d7c5c5b433836d6cbf22ede40ec6c2405e4f889cd8d52b81831bb59a88b7b52a4615d41748ca396506c2106d185785c86842aee511047a055ac3855b4db6e29072ae96128259429b221c3e213906d555f71d687afa32950864fb5cd80fbee23cdabec46ff004c7cc24ec8fe58f268a5e6ca01bd5e033a2e045e10bab54bc8bd4b5ede071ec6411615e0866ea99eae1fe8dd64291c370078d97de432f6e57314efff00a2e0394415aaef0216b828aca0321dd71141975a6b1ca2d31cde4f9800563784d7b01512ddde5eaa202449765d016ad5d11a6a56d5bcb5ea04d50300340bd9b89bb6145a68d166df3124ed421b4e4a645038d5eed578868d36e23015f5e4d88f9c2fc7088058b602aa6e3408847abcf04d6e3a604a3e794e2bb962c6672bbec7901c1e0c61b63699452f7505ac978dfb45e38664975ceaa9bf3990edeb3df4770a951aa6bb53254abcb41f7b9332ad04ec1af1b9407c5be469b0be2ee052b25af4e0f8ad94b4d3afd1eb0b0837cca0913815b00b05acdd72c565ae8e2a8e17918829c1c7aaf602aacdf525b8a15b2ca8ae17fbde6051bfa5ef1e42b98c37d3f99c5cd898730bb35fa9e23d9dcb870b182c74ec9769784fafb83577a9a1371256e42882a9a21761cc0e9884d43c6dfe214e14eddfdb05afbe32574bfba866414972547065d76cbecb8ea1a73914c07dd4b0ac015380736b12ee0f2f0bf9f881cc1a57085c6880cd55cd00711c4b9ce6bcb6196454bac195552e8ca8c7016186a45da5c78397c92167ba80b4f6b1a2685d87303ce3da50ca370263f6e50f7b2fc2280402dd06b4e2357c5d56857040e212d5e611cf75b7804ae94ab26c50174e8944042ea9664de4292d44a057d6254f713fb26bebe075e970ad167e2bb210cddfd1a8f55fa100aa44a5312e72d75962d654ba9d08a22255b06a61d43d198cd67cac4b9e5d0e941dfdc0ad3b53c6b92870e4fd467c0621ac606d61e076bec5d46a536c394015c4137d37402519a7b708ed5dfd5153e7fa89affb9d9c8edef11069597ffd164a02260eb7a464b9735753d9c165d18ecba15b2dcbe3d115ddd37ce42c3cf7f52d46815fc5119417070083e1e05b5b778bd5d4292bb7af05cb5e0d45a7c3955e41c97c2d0726af325f9a42150eafe32572b0105a4a51c42e617df39b4cae4c47b787603208d456bae2106850addcb958d29dd9f3d7d4d6a12f3957ea2077a32abbebea788bae22b50cb3e1bfaaaaf82322d0aa6daeaeae2a3ba6ded363785b4399c22a42dd3a5b8ea372702f6c35654dad90afc35d611219883540717b6fccae1ce6b33b70c41d1fd8e594e80e86ff00f17301437c2dd36ad4ade0cb6a90517d006abb0695ad4b57f7112056f35abae2e0896e9fe51e1c8efec546eea5e597d5f026f75c3b02c03613c494868b84a5b8a953c5412908d9411483c9da9c108c9d31a35eb0f143792ce68204361a81ca2f9ebbaee2505f3f3a44398a7cc2f09fcd3fb94bf508239310d783b27f36ac1fe5624bc63aa5c528c5c4fd44028be0450ab734681817815715eee133e31e1c043631bcf587c0b8e0aa1a602cb65614412b4f4256ce75d859f498a1c11c0ec725ce682bee1c937a6042db23a792a1d80667cc72b42a9e63e2815750d60776f28043190ab3efb946a5ddb517c9669eeb16c275951a2f98d58b00bf1ccb034da197f739c5f51edc050e9c5cae3b429bbdb8ec4e43c44bf2b5c53a6d172e6d706d00af11e14612461c4755cfc7b0634f50a7572b307d0576ca48a0d3ecd9c04240b7ba4b3e805777dac076c1efe22b0bb2ef5acbb7bfd465547fa21f280a1f2c5b14642a8352dc7ff25f494e5b79511576da2c1e0a85aaf38be9a6cc85565a9479ccadfcb99c79cfe20b801d9c0965f0bd2fe88a0379a7eae74c616dadd7d771b02be4517b1d61e96d77cee56897c2aa93083080a0a0e9465ff2c44c1f57945f44b169e02eeeb7a95b4ed8979295e36bb75db73300c6e1f130da8b79f2e36c85cf671b0e705bf63551da53d49780380839bfc5f693138eac0bde5fc408a4bd005d14a0ac62ba660b55dec4a90adad4630a3da305a703e05c49720c0a6b25f01cc43627ec20a599ef2fe8942e1a51505930e89c576bc52828953038b9869a76c36ba02deeb76751b857ae94e97b1184a5ad7b0a05da87142a76c71c02ebefb007942b2e5f3b8f7ff5f7e220f773fafad63d6f2bf47920a3a7100600e441fb39fe8831b541f6c0f6a81eff00486a1b65255cb10792d7ee296e67967e4d9ddc6b23ab9cf3e4a108a84436e2b20f817644c7011d17f6453b3c8b6e1d06e4d1827cd201c3b9b0bac262d676c6f94143a8142da2d751041af4263083855e63505a0958158f8100a12983d2a06d8c0bf6fa5ba94f0e5adbcc84add3bbb12e832ecb5a87f631e5842aa94a87dc4d8845a6eaa306a6f440565b4fd4069c75260d15a8e588ab2e291a91df2136ca8096881fdea5ba6173612de9c45a63f2affa367ff99a82960175c690d7e857cc94b48fe5572107c8baac4a71884b861625a7ea1d5c8eecc5aaf605c50b95c2eb96651c153c2f1359c2bc4b1cca0ab20e840729f31aa2f0617a9ce5120000383fa8340087d2b45be7082e83d570b1a6203b38d717ff0090b18fcf0aeeb59b6a6c6f655afe58556a8b1bf2eed9451edf36af79eb88565f06bc5cbc2f7c224a43c17ad2cebcd73d79903ba07cdab7c74c4526a6d3a7ab61cb8ba0a2c797bc65dac5aaab38296e254da38bacaa2f86a281d95cbf1c2fb716e950a6c7dad81c94e166535f47b04d299db7ef15cc5b40dcad7c12ac46d53df2228059bafb55105cd61a82a9d9f5525adfadd66ce1e82cd2cca96a80d973df10085883c0259cc0e756c7479cb1d9d819ca9203b65d5dd2f880359bc8beff00d8d36a276210818edf165ef33b3305f45730ad8b43dba16b085d55b8aac0b21a1a6de859010b5a154e95777c55cc2f0097a69a96135af7b6c62aa5266f4e65a72d75437c71e04c0357edff009d8d7fb4ff00137503f29f40fd4a442ac5b1ea14e0f984bcedfd2ff4bb6546268227d917bc777d5901743efe1e60d6bd6c2fb0327d907882c4df6b98a3ba9e07fdd112965bebb3ea16abdca73fc22b6578689bd3e5e199fbd0295f197c57c20917a3392bc92c8e146c280f16af6345c48575f797ea085aae3d1f73896f54f87c4ae60707dc28155b9bc612c02f31a7f42b897ab46049244b21c02d4309ca02c5275ce282e5cdbecbd04b51a0118add2306d090648976d4b941d597462dbb868af7d9ca4d3231cf15ed2740bc21a5d704f4407bda2366092be3c1f1ecadc68876dcaca00d41c9080d69487ee34179c26e354b0bd8ecc75b297ba8acc300667352ba050b39e2e3213fc9113c8696dca32255b85eea0804b704e9e55d0962babace2215ac6dca34028e4cc655bf1058911a705ed0434566f9ea1b62e94cd80233576ae4279237e6881407ff001351ab9be5a710260e9f18c9f84ffe4597422abc72880b0aba9b57b6dcd7fa217d7ea0f7c128523b7570b19860fbd6b6ca1b457d39eb604bd48f63f75135976d6042c7958d4bd9cb2536443481cb65243b2a1fb0e6b2f8658b53b0daa2081d3c5285783f411c12dd12f8ae0577167715b637c809e7d3571e410650ec0057d29d100178cb68e71d2c0bb4176bf7be4f885346cf2c27b9edb3423755b4b6ef9b6cbbc19ba025f260ac5aa073c5b9a74f932e90d2e35d0e5599485a5f1554dc0a6d452ab731c966178a273d3cc5a2fc2ab65f1a92e8c7f2a029bb7b7032873f902dcac82c152c7286e63ccfddaed28aec425ed31029c736de474d706b60af25334dbac0bdcce88cb690b2fb2fee1e05f2302be953547fe2e5c7379c8fbf314b59ff008bae7eee3a86f39eff00e152e043dd959de3dce44b1181b7d96b16334fabdbeadc8b05bb19298ea17bfd0ca88d36ae8946f3d24af58272181dc6f9945a86e9684ee9d2a6acd8a54b775e6e29aba8b6f2fd3c1f98b5cf2f037f14989b88585fc3197aa555c1c2df81b23f2d1b18d3c952abbd07ed87a736164dcd0906b7042948ae001cf32b9eae1c54a97325a4d7c4b6e01b09e17a9b8125057e080573ef21700d3de3c816f878898905001e12f603b028e46053175791a3d28ab9582a37db70951652a25f91209985f04a0d414140dbb770f75ec0f35005d775be0107badd31bbfa8b99cc11c63cb0b9a027efd8a109a9ed28ad03469f6a5a441a5fd1f89502be67ee06237318b676caa865195883309629b12ef17a3ddce16b0737d95463baa4ad5ddc2af2a2d74119a28608512ec6530b4b76c084c915e81f046b846ae08c361134f9719dc180f7f80646a88f23cc6bcab93ffbd6a1260557cf76c1e46abe5496408b5538fac510a8ee4a8b02c69cfdc5a594f1eef150a703d7c9e398d24b940e7f944a3b446e5396235781b4e6ef11db15f0dbabfa9514920a6f38bc48875b72f804ac6555c00552c0ceea370d542ad5e4ca6083667177dee0baa079e81f1f51d523158523876a8962cdce1b4df1b6fb671fcc7060572de3a29f0377cc411e07a7c6da41636b4a4e5f52f865a9602c51cf915c5b96b4e03e66a96bc9d19773c9fed1ec7d7452dfa8cc52a310ae3cb4ae816ec1beaa50e14037e3c67a46cb0f00686555cee01bc0b70bcb1b3816aeef0dfcc674ca145557876ae54a876a8d6aa8fdcbd6b516f5b43e6a59394725e2f8688818a5e223c91247494de07939d96d9cf0f08aeef410687d98ff00264294bfd85a7f024c4a06b70d12eaea17d5aa35d21b6d64da466235836a2bc971575342f690dafb3f99c31d30f254aafccd073c4df77d2034f350597c8d5471613290cd7b3280d2cd268200b654a0c2895b745c1c33e0310560db52368bb09c41cea94a1e269969c6460b2fd4b6302d029a84c7f246b6eac7dc616d40a768892164ba8fa10c83b9522b933e80f9e41b9995c4513ceaad6aa016f2d1c087a9f88678df131666ceebf53d4952360f0f2587ee05bc2e22524c4ab81d485185d4de43606c953032a105eb67420b72a5db579022556d9f328c02e08c3c26afbeb2a2f3e1514ccd57c09ab2d070b6ebcd2e6d1816ba48f29df1407844614ab1419697b210ac62e51dbf60c41112c656dcd74b1ddb6a8a20bd93d83d9551e1095a74bfaf21a4181dff00f81da94b2dcb6a1d0aac05e55f08585d05cfc201b340e155e744c0daccbd7f5f0c6c82b135adf250da50fc823b77539add8adeec7635d2b5ab952764a688470e01a6e230d6e13f38605e09a481b4654a4282374bc05b37f503d4fb75038faafa20930ba5c94746f905fc58d31c3891017716b9bf2c87990946c53d73d525482aab521fe3a959a156f45331e0ba58d6bbedbb1b596b4b4d36eaf89795c33d3b2d0714a290fc1129b3455559cd546089e4e658831792e4d6aae236b402f799f493203cd5538bb883bde9cb6f0c2c7af92b5edca5de058aa53570254bc019b0e572562816b9add64dc97cbbf39fd82b6e053e4751ae88623bca5dada0b56979760c40bc79b2ecff0064169daedfcd91ea425f0b2daf539551ccbaaaa5fbdfeecb105c37e0fec541b0eff9ff002cbec2251c97c214363f4c1b234ca9e0ab388a96cb99a466cc004c8cb92c47917d44e61a2d4b59794c09c3006e92cb0862c7608b8bfb80b0163c0bb06281e41c990c0de14ff30b8399bed06421877fdee563917824b69dd7507b2fa317ea982eeab9233ac2a3a006b165ca742c1108eca8f504e04d9bc41e32585611c8bf10d0dae5ef8b1681b71106d1161c73772c788f718acf9462de435096ad8792ec3f2e132ac14d01f045b22839029b62906e47fa1b0f4a95be02dbdc38aefbe040560ae8c5458f06fa09616dfa3862bb5bacf2bcacbeda0aad573cc5b5295c52bfd10cf137100f27e0e983a72f594276c4b9a8483028ff00e1592bb072425f95f658583c62aeae351c4bbe2553e16aace5ff00f065cdf9038555302f6c34fdee8d4945fef04ab6d3c1e12b58d946e56f7e2e57ed1f25cbd0f961d3b55e5c1cad97d963d9fc9618a5abfdbd65517be32ce7cc345165ba56c084d01a14fd1a41a0fea2d79e261749579d3e7ea6193ad2f952b688cb4ee17d2d7d5e90bcbae98d9b9b346b2d99fbf25b0842aeae0c7fbc29aabd9ffc47d87eb190d8a7f6ec4612ad4d2bcdefe595f9b7ad0a08eda9dd7e2ed84aa94e1e7c5731ab520a149a14d03b08b70041966a9c10d2a6cd1cd5743b60f5afae92e8b534afe7be92a287053c94e9b84b67646eea4afef2d459c8db870892c316aab3ca77136bb58c1d149e79446d51d78778283ac94abdef4737cbe2e59760aeafde56d288993f9525b6d1dd059de17c46e92d7cac7889a01a282b61d5cae2f2ccacfaea3a1c70effeb13e01497fc787e202aa36deacfbbc315dc1e5149f63c4af3008513528355f025463f40250611ee4a95512dfe23062f86ea9eb5cc38fb84f2232f0f318afe7f4c60d128cbbaef9185d5995c32fcd23c114b1f1bbb4c5e0afa8d3d3b5b6bfd5c1343a92a8b01b350221b0dc47b15c712caab1747465095684cd4c6031e3ecea520ff2189e91acea20d3c046d5a0d1ead94b8b416d816c064afb1b1f3a4d56ed82055d6403305dca2c1f592ad1a39706b5af86516bf70850bfd75168db29570e2f01295340a2b0e50afed82ad13897b40187772d8ecfd0f094b5195c678c4aa472bcb17b93743cb0b4986bff00d2b843c4b94220dd5bd3d86c6057ff0082f1510c7bf25fa41f4c0c1402f6ae1957e8614eb7f72c298efe5832850149dac0adcab9874e4572e12956d075c096b2b85a9645b4b68a1403779968d207b7f03989b6c6eab2afe65422856de30ee29c2cbe1be6e7196c5a3bdcfcda2771853a0e7859f27704e210f3673f4f716f0aec3e6256c0d05395a50bcb05dd7fac4a9b6998affe76cbfe414aa13be3658efe2b9a32daf40baae7c21dd9d3a16daf4821aa444f20ba2cae5829fd6bf4c11fb0812e803abcd5addb28af01dad379d8f3f80f8654f15c0a11bc8d0195e16bcd9e103694ba77689852eae9d0fc5e4555ea08ed3c3c351c19dd1d6129f22fb0709b2cf306860715f81055b9e5ff00804c8e4af012c9f0cb842bd096b7fcb28e072405abb2f2e285857ee9f9eac85c5b5c0fc7e3fc40d9b9412bc628e00f814916decca20fe465dafabff284d3ab9557f6cbec86e1e041e209baae1bca46a8e8caaebb8a2bc2a5347d9a41e07105bcff0074ca15699794cc342aa1d5424a7071d12ad53f4a4140fbacff00528a20f107fdc140e3460731e6610877f107e5c5b0f9373a223f0994a3f50399e9c4e6a6ea73f700616236479ef6dee24536772e2dfcf11ae8c790276e3bbc168d1b01be8806b8bfe09608643d285c6568d95110babd413a76f9859847d08a02e9761ec0aeea3ab84ba2f0215ec780e07f98aaa9ea1c5cf3387db185aa540f2c4bb2ac17a4471a10ee20ddff00fa6eb56179aba4b5d73d5e6af6ea00ab00857059d24a7a4d8116b6415aea9f95f8239cd0ad5bafe089a6b1f798758f1ad16fed81541459ea8fcf04a67255dadbe0e229caade5439510b71bb72eda250db6562764bc62c39bad52aee6c1ef0d6fdb1696a15e0723a15614c697eefa57d93155f42dbb5c75f08d71b5be3b3cb0736fbd3fdeae5c290b4ba5bec42a03bbd1ff000455a0040e0e6275529dbaa89651ced618ddfd6c414646d9eae38c3a4b9c6ec183d51752b21477c01d0059d7ac6050fad5e9e46a85e5c3f339846ad2f070ce7ee5a143766750fb651695332d55b4ecd0a1e2cbabde50db8ad41a380a3347ee23c11aecd59592bd8b40e36854aa28f272ff008261b697dd5c27675e05b3f501af6280d3ecb8a8d17f4427cac7cebe66a9ee329fb2133420be1b94bda0074c736829ee58dba55c75d71cd7f69b36e9afdb112c3af57a8d56d73c03e2367da868fbe44562f9b12e8b72c8f870b4fc482e94e0aaa1836766e1a1b29381660203d6c4f427cac50e0df1c7044dfd92c578c12554071874ae24a7789d0d0dc74ae970658d91f02e1eef6d52e21279ada7f441e4b947a7b8b6b0216fe1e54bc20116ac65d55711141545ba36d3e6a2fe38b5cbb445b0367901e069772848bda000176711716fdca3bc6ad8835a4530af58d2dc8e9859386b18c65d47752550b70ef082d87ff90b684ef4fb2aaaa1adbe42d5771d1554c2ca118c0d5975853f98f80196ef42e0d4b1b280d32963f739b4d58b541cb51fed8e5a0fe2e7ae0b7c03c5c05a2cc726eafe9e25ae63aea7328e3db117e5de5daf75fdc48bf009cf7bc4d5b4a678df257acea5d815b75900a390b4ed3f9b943dbe3aaf7866c1b57d429514e406abe1c41a92ab6b295a4322d61ec3e1531a425f4fc89614b5d0b859a05bafd74c63dc414e8ac6a5b2b8f59fd991f2cf6601efc4dd175d1af91e1986eab4d5b7799f30f2ee5f471a5114ba7c5d1de9d2546140d5ea8ea05f63b7069d4a1b0396058aa6c9dad6fb6efcfc4735784d7274d25565bcfe5852f1140743cb650aca536de12f9dd25ec7dba7d1c8d962b56e7fc23488ff009f8213c2cde0d8f8948d7b5ecfeee23c1fbc6667e751b85d93bd4398f6d937ca8a4ba1fc0d86b994ab4378c7b98ea5af1105ca112de8b0fbb84e78b437f61709404b7ddfb365cf4a543aaf2acbbdce2de208b55da0039ae499961eb8ca52ca219a29638eb6120f8836563a12b712a1b1662a49e8a2983ded405c557dc313d5c1aee5ed884579bb9a278298cd9a6dd6d6588412aa6c43462aa967ccd0f8e613d3c4f3000009c13e32881ccc77f954de770830c6543656d64af982a0c45c4bb5ae2066e9b7ee22615403135002bf9ea5099403d022934bfddc4c98abb805b2fe624489185468434810204386894fb716b195b9487011ff00ef613d6bccee0d54d774237041c073b77ea51775ced1cbf6ca5816fc337e560f7161526b625b7f965cfb679e9382ab7df20ce05b5b6ed50ab89814665761f112dd155bfe04b80af90d1c96684a4709db15cc102f904bb792d4d0ae847cf7f5169a11bcbd1f3fbc0229d74b6b9617923782cb615f21cb037ef35b0edd44ce8bf35873b081192b2e22e44ea82f0b0e8b02a0e281e6424a28bbfc40eb4f5aa023ebd461c501fec87cd88963a3b10e2faa953adb49f1b1850a452721b70279962e22b9e0d60ad5a75c4f57cc6ca021161c9fb4ee65d0f52dbd9718ad33a3cfc4085a2b705b738aad828ab8c8e5a4aae3c9f6ff001300a3e16be760e47ff3a089aad2c20723fc4d163ca90a7ab3d815571ec7807d31c639196d396231b05c30d60d640fabd976d7a0b307741015ae782ba85a885aa09e013558ccda0ba2cd2aea19768f215610564e3c305652a53d4a314c5a7e0f9627ee50d61583831b2ad7ac11dc0853977ac740e3a23824ada956a4f9c88843da642bfd028ed074a6c77c0814390ab963176cc625d0e635686acedf3896c5f3048190ecd86c88bea690f72b1b03c5c06b2571fda7572c44fb2598b2a31047ab180004c7065a52eea425229d09c25a9805d0e4c24141a05ed4a47c9fce5ed5dbdf84186c8618250efde72bf30f87057d112aea93e6c00b0f6584a6a67c8265ff00315d7bf9808fe5a203872dc7a571af7731ccdff4bfd0a480e154015702ba622aec67047ffa816d9e85c6977b04767e02b8a765aab874e4c53fe1fe597faeb33f047be6fb6eff006ca0e4afe3feca6a390b6e0e288161a6c50ff60d96b1eb689e7ed99750d37bfb85ccbfd44154d1fc3fd5406ecaf35917a83be12028eef85f0621488268e1c5697096d7e81db4d7b282a2ff00591d51149e9b86fa30811c6a9d1d41703a3e9c57e61536a0452a3ecb3c9eed2fff006448d157565e8e600029d6827de5cb470e9f3443bbe6572a136cd3e0888a177195ba47592f73c81400dd3597cc7cc3656b6f92fae654b5a2c6b50ad4b2a4b0a6ff00b542bad0af2a4e167515a6dc9f15070283e86ae20e16adfc0d5dfcca1d83af43b942b0e86e9fd1c40345685a3a83db4a70d5bf8236a6badecb7fafe8343a1c273c8fc9d4ec074ba7f0b1aad94144ea47ae9415a55bce6c5494be22ed6ff047655f1fbfb402af25ca4636bf0e2e5255ecab70b4f25e2fb5121da22a9843d29becd506d0a407111f743adf9b86641f3712cb5f3a942b623fbb1880fddc402b9788ea94c42d2e65313660e2e153d96bf11cb6589cfaa8150fe45fe1880b36abb33e21629bd73c3e4eb232db41e60e17144a548bdc61fa09d38b2c7bfe8924813aae01e254a1c0ddca5cf97d0f624851adc4b83014f327b99ac7c9aed5cd3595327e930e177ccdebf820dadb61121ca806847d1a607063a55274571f959938e67dec1751082e2716462b303fd0189123703714ef2e430115f88ae593801ffc443aecf4c1842703dea7006cce3bced8acbe17f89f4734eff7a8d28ade8adfc1d4e1b17f1f7eb3d179e177f16c1de778d2fb739a052f7fd1286d70ef32f4ff0033cc8e31f995b66f2d273129c7843e45a5b5c46a34b741d1b56ff683d3385761738d943577d9faa7c8f459de3c57f166aee52848eadcef200402c56284b1654a602af276b53e1e586d4a576def096c39345748ed5f25ebd6230afdc64f8836b74be5e2fb801aed1ae961a282ae77f69ca83296aebf2b286e89ef430d86071e811df9b50795745f894720a295a67110156b1f1c55fd32f1940fc05c684bba504774f65862f4a82b52dc2f6aa820a1682ba0ab1352ad030fdda88ba36e5a7c744ca15c7f10c19627e5839e567f406186715116698e5f4565cd2bc78b0b4e2cbef44420f20490160e4e553c97c9c5b637eb1fda17dbd8c087b22e5d3505aea3f5354a59fcca06c8abca2288e32ecd203f31a31d8ced9d4f426e5fd93b260e4e6ef136215cbfd1e5dbf602232a1b1db7919730e386de38b8c5471f7bcf649b9ac68bcf1f601296e0ed33595d8c74a2704ef7c59c8c22eb9a9a942af7904965e30212b38a8acb62d7a7d17337561004415fbbb5e99013c86cc4b795c1672b1be8b98a62147344bcf815f69789451fad307ea10e2b4ad824bc60f980aa21bcade6707e17f71f84bbda5c221e8c7d4cc8c6df966c1145aafcb380b92aae2e1b1f70462f8630c30c57f4fcff004b817291005ade25052265049606a2ecc476df9f530e4781810bce1cd165f85c07f05bb8357f0da084803e8a3f1038376df3fea67a517e10a543c0d1ebd8ea953e51ec55b779ecde7e61b306e88fd710da5aa8d6c1c12e9962a9a829425f6300aa2704c6e151d316f7654ea9d988efa2beca40e6e1d73aa9dfd551e128a010b0c3eef21bdd152870cbc34f88c091cb4e6d7a218077daeedf44ac1a9028af03fc4572db368ce03a1076264e02abe317f11a1fe0f0aea545d30c0e0ead8802fecb51bdc59a57e215fa4e1caa5e01f47c449c2fd362e20e00cb015baeff00c5c5e5481b6f8e6bdf62fc8dd216c1c0fc40e542f1d40bfc1b822a892f6cb4012dea36b070f81004aeeeed80a2cac2b252a684656a4edc8857c0e25201eff7080465a777c04cf2c61636f3ff0099b4976ffea97ec006f80d220019280ed4b3519182e15fb678f856b00cc055079d0980bfcaff006c59eb7c2aaad22dfab03047565ff8a68354defa6c472c0b70b43eed72f4715c03d0b2140e378f20e36c0771b7118abbc8941e5434230b1b25bc4f9a7ab0b98c2e8d1b637d32b5790d1f8365b7b129dfc427b6805f230c11e86171e62344dd4541bac882ba4b7d1a84a3069cc29e192152e014b87674407a99be7b0b2ac134a5594c6e0a611ba4236045010e222857e388857c01fbf23eebb575d09f925b297ff92238ad5a458aa05a966a1b016436705a303e40039c1f6cb28a4b6a701dabfcc6a2dd1339c8abf70b430398c82ce57e250468231ea938c1f781d2f98a411fc90ab13ee50f71a57f430c5e05bc15052d0d1f96745fdce14a6f6feea2c0d2c1021f32c42cef340217d8f5d13b5e7ebfdb369acbf30fdc7e0cc355fcb14a8a769c8b0a4fce9cce4a1f96dcdfa46b824f4fb0a1ca9c2a875c3157434f934877411b1c16d7dc541bbf4970bbb7d0a7ecb69a85c8760af071887971d609706b9fccb0b146ef402546836eba1457184c9174958ca7d610349744ab6ebbb82b246ae57db034ee97ba2da5a56ea0c1282c5461bd398a508114df73e5f22120de38135e5f2b294a0b5dff00d88dece42c595f09c0c6eab95479381740abec2f28870940702b46b0f2341b6dea5a0382d570d5d1fe25f52b014a797b842619888aa708ac6955a4ed73df3513b161cb807843d0906eefe2106e92dad657ac1444469e5ddb5425b4d393af72ae3014f9862fc32dd7e3fdc2d55f883cf3fc4b29b4d714227510805e1e896c0614ddd21bf8462a2e1aac2f9bc1c418400000c060046bdf7febf89403f19fd8ff002c3aa13328de8c3559bfb617fbedde7b3fc7f8e89cdc18dbabd63ac32c83e3ee22cfcffeef25b36628a7eec21d90e292a1b12facfa89e7fa059ce478ac173045b08000e38fb88053963bcb50b68e2f89a7907f486ed51ac9b857592ca517bb50d155b27cdd84b1074dd43adcb14a9c1ac6713eb11656d1210c64357342d8df9452c94d69c33162b339210807c4e4a94fdc06316ebe3a949617d1612a29f8fea49a0ce201169900e88f4ce54c0de2d7c2ca1bad7d72c1181f04a811697bec8b05a5e32d4cc0470f0163e2aa35f960b3501f32b5e9e3f51a730a2b1758d46b76bad4ad20d38eb34feb4398196b4789345d8560f8cac410e9ab5e1ef107335d4d388de6ac9f1c40007076dbfccb2b9cfacffb2c42cfdeff0012d5ed80e59941ecd6c0be42d0fd133e12682c3b5115a5f462b3b8d97a9a2a5c702ace1e0ff92b556ab1b2727915aebd8ba1f9e3ed95a95803c0181e637181d1d34e7e4f0206691fa2c6f39194f0d71580fa4cca82d84b4e0aebe512e887b5dd59884a15bd6dbcfb72816ce02ea8e1f90855d751a51197c9c95ff1292bda4891297a647edc03a42f855efb617890d53bcd51e6151234ef0a6bf4440a56f9d7ff00c23d522d58b7e884bb77e34b9a8280f005aef675139038c7181c24f94ab6abb797be93529672b6ae5c388d18d69a001aff000ce09605a96fee6816c72dfca12c084033b27c47f26f3e0efc9717ce95d111020297a7c12f444ad536f7f17c4c4b0fa6ad2f4f5963b6eed7be22d1b2fdfbf088393bdf97c2103ab7bfa62960793819d2e9f32ee7d2a9fe1c7f883feebff315c40a2dacbf568fdc69076e86815c1a238502a8de6e0955d4c656667f6025f5dff9ff00902b6d7c3d2c04eb4b51af15dc53de9c6f54adb32a3136980da9929a6eafcc2f03976475d63c29993b78c618223ea152a353c7f982967e2e7eccb384bdf7ea8cb7ca0b50645eed34e1aebee7ff00c04c421f37711b4fb300a0cf655a4b57982f117b2aa276d604fcace089b8fb2871f4a83cb624ae77a255d556a398e371c5c28f1f9c1872376849b479db29472ca01934a526fcdb41f0a68646107d11851575f70f1ea88683b77bf214688587d255a53ee617ce2b068fce5c7f70e1e8e30eb9658ff40a94ae7fdd8512b714236e0f2704507846b3a85d94a4ab2002b2b6f1bf46a208a566fb6e515ab80a92eae62a62c18a8d939eccfa475674461a5f336b5b95b419472b2b5d23720ba4695c2d836d000fd731cf66f9fe5fd4dbc7ee9ff30babfe4ff6f3081688a4ab96bfbce1ab83c2b8ebc41dc2595baee5ebecc8631fb0780d8bc787c5f24144b2050d251f51143c05ab512ca57e3ffe9f5191e05de047807e204de9197d548107c657b2a857d3bfec1e460dd68a1720438c297791f5af53babaf3c8ca2d1a6ebb3fb712b3950e6967e21295f954b77e3d8b6b41f20f82d8d97632d8e24703f534082a8b55165559af96abebe09995a39f0ffc212201acb05d7812f5a889d59590a23a5b5342a1687aff0098094c39d221c54e48e16bc21bee71880f0dad2cdfed1132e14bbb6fa36aea189b62ad86ebce4e762bd0b7e573d65efa7a0dafdbc4152962ec1a1fb7365506c4f7a94505ff000f8e7a8e1e316bcffb02a9eb7baf3e085397fc7e0f09aa01515653c15283338b254515cfede59f6cf13715eff2b1774793023079f765cfc7c542b8a3cae746ee280da57141fde1f13f041557ff007e087b1df7d63c5719faff00b0dba7617aea0a03bcce582ed8a7aaf28866aa78a2add6a10ac0ab59a447c1549f77dc75a50bec942b746aaff97b828dd72b047d9b06ecbf905cac944101ec517edb5a9d41ca94ca394ece6b9c3f3ec1f16ff419960692be6764bfd9df72e05d36133d507cf08aaf966d55aad8eb25815ca7f8e7fa0b40c117716260b79320779fe8d6f0e0ff002c15c73cc5e20d81a414c623fa96913851adace7252b97c73a95569574f3364197f50318b5d0382e0ee52cc4243540f7db0e54b9647c406ef36c04bbe58dc285c2505d04956d84211d7820c1c8ec10c28d9258b35ff0c11f8cd8ed18b374b374a5dfd08fc67c538cad767d2ed7ca826daaf2560b7f11c714ca5a533585cd28972a5bd03ff7ed9f7ee0eff10f5cf3bac5bf97e77f49400838165fd1032b51b40eda6006f5002a1cafe795e7fb957b4f65fcb7dc7579147144562dd5e98873fa8076ca383f84f19865beeeef92ea062e1fc89fa76a0e5f22fd4a55077b6f032de7f10c08b52ff5cfefa22b373c32570db08a0fccb77f71fb1e70958066e2bbaf9ce48167c14261c06b08d415453807f54c37ee7358fbf08581abcffc2ba21de012d6d640fc91a25a0ac3812ed60d7a062764c5595c14014762b92252065d2afcd95000754705170fe19714e45e38fcb034015bd92ea9dab45ab08945abba18940a2275c57e0f635f462b2bdcaff135f99e4aa97862e265a60b9af7029115fefa8aa9b81d15b5fef44200a4bbf07c40df8e6dff00dcb1c2b3c4ff001197985918ca3aff00170e46d103e5aa3fdb1f4272b38cff00510bb38b95e1ae25704fc2d7f04cdb0e20839c6708b2cafc67d6a152efdd096f052de7d1e4ed1e08b428e50a4d4d6bdd42bc57d8409510750d11e118dffd9a9c4078fa47c8491839b0c5cb0d82d4e0b2a3d65b65cd053eef89651511ebc5a6c532ec12e7cad596283f3e43d1232b3001427f468dd2c65d2488a9aeb01000adc80ce0dc54014a5fe6180ea8fccdedad68ce8e3e02d772aaa9f9c4e5ea39926dc3c623fabb380def94986688d0e32f348545fcc9500d22d41e9ddfa3fa714cb6a0b970b095e517e13796c6374bf44c251c10c29cff00b98fc65d3527d1f4405aa5525ba48b9737fc4e1238fe97fd2d6f7eff00eb3e0feb0fdc2fe8fe0875acde30ff00b2d37eca71fb6741afb2d9bd8ca78a3fbc0ada0de76289c4ba7011cdff006090766b7a6df10094d36f6b1eff00700119f1b3ba5f3ec1a7479392b8e29ea7a1d6a1fccda3da3cfaa371e20aa52d525a3cacf3c86a387e66ad480cbc7940ca99799545e5974d8c387e25dca572c7a2720543d21c7e2bc8565800a74b471bf50d806f65e9ee77017568f18b7c07446a7d039e8afaea12cac5d81bb93f2715450ce58b782a71fc32dec945c1d51a880ba46bfd67ccbcba71d5aca3b58fa5bd612f8b0df1be63266e3b21f070fd425e2b68bdefa3881475bbdb6d86aa2bec2eedfccb659804a75097e6347f3bff00bd857827398fcbfde0d5b7f97fbc5c1c75515bd4206bb67d57095f8df6bc88d390a796e5fe26344020b685ff00351a960fa3fc432a680e8a84afe062a9586345102bf52802f0a7f818c4ace589db8166d07491656486d3af2e7562df570a2db5fa227e3ed60ab60e580a763ec67b765a3581fb253155f0f4c0691fd31e86094b2a990f8ed099c2b5c06de21f3c3a8c54179201d3e656977c66c4a952ef1cd7b066428f898dc0aed4ae4b452f6a0a8e3555113112a0f40f634b7c153b6113798081871032dad88cede1e1298cdc656238b9d0bcd78d45107f860e4370ff000c439591456b809a72b811d11fea831a0c7d2e18eeaf8cb897631c7a7c86b0e788071c864a938353bd09ae5d1f44df5c22da8dac82f52ea5fb06df97e2ff0089434adfdb1d7e7f70e0196af75fa8b757de16dcdf17c787027295a7b51d5831e6154e9bef042c2a5a2d4da4db306a9f7fefb01aef9ae325863f05727ddf138f02b3ebac4f2a1a7143bd0da22baf0d36a8d2be7dc0826d55babe9bf32f565519bc7e3d656cbe4a3fc7089c2b71e82170e3e6286d2fb700d97b7d1f5f52d657d0a4609cbf046f80d1b56afc0fed3a62a99ea7f8234bbde7cbe082ca29693fb8c03254595f92897b87c6d1cc2d32da38e3f0b8d2343b72d4a546ab48aded8cc88e28366ad97afac9cbd68dfec1795a4300a4b0f16a9b3a3fb4a56f9b2be3ae7e227c83a2be2dfdf88db4a50f7576e703d12f4014e0d0f882b4dc235b0c1af7139b9c8d40ac36f3e273c53fe6bfc11e0af947fcce604f7fde0afa9d04eff996d00da91e9ff7290c85ade3f07e21c2567445a01a73c36fcb2a0ca6e0c8a89f6119e685fcbd4738c0bc0b54bd844d2eaba6a06a9d261f19706165975654fa25a9d3da22f2ddb3d56295b2cbe1d12e0b55ea14b2a556978c099e8c01a17be96ee8ddfc554bac36faf315fc612c33285fb17ac8d5fe154bcec38f576d24e25c0eff00f842e95ebc9fbb2e7c63ebfe4196c19be016b61a0f9b55f10535569f9f25875d44cf75572692df11828df31254004e3513afb9c90c11b81752d2362291691a929daf6a8aba80fdc2de0a522f52b5f471285f26bfd008a9a9e7d081e8b715cd936fac2aac23a90615dca1b5f4cb8c58e91fdc30d660c3087832dadaaa1801165752ff00f0430db08b514dc2f35083dd59aa854e66308b7d7fa2c7fa703b9fafe604be6afe88365f5fa33b879d7ea1755c3e508945b682f1efcb298a176af51deca1f846f2cb6b8aab7c3eecbf8207e4a7fb416d6c95611aafb96b0405e315797df51ab88f755d5155fc4e252f9ec79f3ea3d8069d1ac88f195c818b3d60a22ab5afbeb1b58fe6afd607170014166d63e6fd86aefc1b0f6d6dcb0246c6be05cc5d87adb4ad963470f2c89f80dbd688fc25a539fcfcc66855d8377f6ca52eae8abfbe8ff2ce1a007e8ff6c3609072b238e8972a9e7fc08e8abfee557e99e0d9a076efb6060b2851c9e393ea3d868ddd1b5dd87bd8ce66c0ae55c9afb7c85a04e2330bbd25270d79b066ab1a115adeacb0af65b4b3c70a9e642d70f89400ba2eeb3ee181efbe5ff981f957fe2e719f8ff84b1abd17f6f9f44a5b4e4f3ff10e16b1a828bba7e6ae1ffaf082920ff35f7f70c1fdfe226e2fcd5fb2a500518129003c0e1fc45e458b21e020888b8b53f58f1aaf6c533891628348dd4ba52cb4baaf187c8bb8822f5ae9b3920082db7a4243b1e0feeb8045b65a7262097758dbf9b4c86ae68ada035aa9bdb9660b727f06f352e4a26a54f480ea9b42a14dfc4006263ada51a738b77751a165cedb94c07b888e4f9dcd2e24de6e1093429e09b573d8430b15473c430589c48b037c3a4d02e21c22fe34c2f68178711e6d40fc310975fe8750304b97a85529b51ae9f713e4a331dfda29505200ff001a99364d186a5a91bed9c72177b0b8166be421d2ef918186d179f7f30da17e25af24ded6e283cfed4b0f6a2a3d455821623fd3ae28a3ed8a75e09f0643eaf7e58e10a00950b8200256ec340ddfed9dfe3ed8f36f3f3b085f40bb44cc6a02297f26e1149a23609f39d7c32c5adae1aa1bf731e2b77abe602f87956a57f79c0e57aec4c6297ced0a595cdead9857a69c6b9a815ab0aabe10de66f9c7ca1e79e4c737c0491037e066aeadcb6c43e1e4c0162db9ca15e51f2bf0b556c3a3544b538d5c732ad57dbb66ea9a5aecac972966cfe437d66f5005f4ae8516ce99d78fff009154b5d22c7f11e1cb55944f7e6271d6fa3c9e1d11d568b5fbfed6639d7bcc9c589bdd536d3a57fec5dee3e04f6a0d55ba1c0bdd974448399fab2e3cf29cee871734d716d5f45b6e260baac971e62b633e3fc71102e11ef97a7bf7f13d1139f8fb60517c2eeff766e387fb1efdc6b8e3ff0071f2cd8d73c675f044f20d06cab32eef89bcd94165f1f7289800b5f7dfb8c020de8f37eb395ad7bf044725e56802294d0c25ab3e2441702c32f30d50ba0f672de36f44a4c1fa9069e156b47f741516dbe96e4ad4a0f08ae5f04005a52d9585bcf796333fe95abcae5999851cff0041cc7d374bc135d5c0eaa3474afd4450f0daf87dc039271e857ea0bab73e5834bafcd44a20b5bfd22f95c47224db555c5022917ee241f17f244aa55192b12ef90c9536b9476ff4257a3d5fe022ac5e860d2c2d6334655dc9530c73093cc6781382b4c0259d64bc9c1065d2560829e5eb02e676dc2f2e9065ba8de5b8bd25bbfae1943552b2b9bc32e05bc7e5708e1390ed7b0dc37032ef87600d2fe125d863ecb1ebe19c0d191cc745b115917cc69d6962ad80817cd18078b1273d880e092cb830fbb03dd5d8ca7f5aa21f698228c9c5177fa82d0e88962155ec26d398fe096dabaf0c233fce61fb8536155f184b74b7718a5dead640aa736c969f26c40e14a0b5f0f3c259d551eca1a00fdcc29d1bfb49e0729456e0c07c1b477e9d82e80238b1ff001184af00fc408bd01b46544051ad8873f32dcee62f9af821c911bb1cd37b47f9620552dea0da3dc53b4550e26d73012e943838dfbfb788480685e68ff2bbe210700f5c3f8f88346d3fb7feadfd408e8f7fdc9a898d709959df92cad38e76ace2146dcfedf9e92cb581ef9fc0ee61bbaa5fafe4976e09cf56dd129450de396e75f30bec2ad261f10d05da7e287f984b51714ab31bcc465ca958d9547411941c83cb62c275efb769351b70700faa6c82055fe7d344b8a432d347e1982643e1fa88b1502ce3075dcdd61de617b96a3ce42fa876e5e4ff0070f0de75edf638fe7feb1d2a9fa870714bf443b10955453f32a1014695d135dbec72364969ceee105100fa8ec4802c0274f736127a5c968cc6acb789bb4e2fc25452b5bc57aca985f765bb0ef587d2d88bd235dd0955eca12d46cb1d1657d04e13f24cba3823a22b6904eb9baf4c15121c2dbb2f1871118912cfada8996af33422f98d6e1c9f3e2f89632f73a1fda210e77c51a6022b5c20b3e100b905c6a22ea9487fec893525a75e7185490afb3ee59377b28096127cd97ecbb99aabd7d852db8191f7e2aa98437bfc4246731f334e195306eb39888b7a8984b057f10fbcb5c6e500c6247d9dd468082b5c86176af4483408c7334a512beca57a134af20ced04b287c112f518b1cbf111de410239fd0c2626ac6713731bf8e788b5c4057a62a9037c8a4037fcc5b48f4c1c2177b01c44fe9828677c43e4a05cb9a590bb44aee016a9fe99df3fb6e20bc7edb81b6ffb66d835beeb9f1396fd1ca228361cf0e7e255c90a0024226e7d82dce283c27b58fbaf4c97b793570cda4fd8ff00d95bcc3bd60db47cb7c3126342f0e75100dfe52b3f5f505b8a0caf3e195461cf34f1f994d13fed7c784a5fc3be4e95180168d7f70c6d3450bec78d85d51fc3fee1b6ff00403af5944aa7daff0010b60fec5fe65c859bac5c46adc1e8cfd406e55f22e071bf5124ab8671af5dc6c754a657617296bf5cbdc7e0845d055c202ce4bcf61487182d6b12adb5742ed73c1322e2d52f9679509d0b4302efd60e6e6810f8a36518fb2587a50c6136e5135295a072ad63530be4d41469eeb20b88bab888fafc6432c6d1a2fecc2aa0a45e362ce0f9901a54008eeb821bf97f72dfbdfdbfe894e7feb2bafc7fc94377bfcf30f6a2358afd2a8271c600ab7bf5d9d14a8d9e8c2e8097fe84f27e460776d8725bd0f3c8c8baab897c95616eca39bb16928e4d56cabc42b45556281144709c72bbf89b5805a0159eacbcd0b4da45b42bb83915ad2134304dd0a7a026ca8be2fbf2b33aa5d72812ae84c5d62ff7a8ddba9c70841aec4756625b45c5b872e1d67094e0d51f56ff0088e309f49849967c6a6c6e14614376380dac200158fd90530202ab948d5fae40f85521928e9b2c88dc3c81a9331749bd6f6c4b07c14d58bd0fcf71a1ba36005092c516f61b08a21edfa02214756c28c8508b6c68c3460dce889fe8b497ebe70810d5107e2110394d603073a1543c0c2154a32fa88ea52538cc69b529055e6c2f8be3b1f2022e5251851f980d504f49cda1f705fb1ca4e449fdbe706727c73e10dbf3f4417068f3584d0a5b7e61f9618d9d797fcb010a514eb5102a85dea8aad21b450a956da72e38efc946ed7bf2e775155081d2ee70c5b965e7c79b345cc8fe5b188f618d158ce9dfa9e6ca6b33feca20a83841383427e8ce11bd66fec622e9e84e091343da1c7e121560874d85eca1c12c4aa27403f99b4b7d327102fbf70d379ff972e50af28e5be01cce1dbdba5afaf47cc3d122952507a97a9408f0b22bdbf31afa4c2e566c51e8e0d8d7015fb53817cb97fda7f888c6b9ad07cdaa2eec92ab4be3b1856932848ff6e8dae5a61e40282702a8bd6a3b8616429d9c28325c46c1ef5796d2c2c2b44aa25535bf079f73f01f3cff00b28ff07fafb941f8ff00d5f2c6adb78c61bef8ff00d90f7a955080e300d97aadaa0f8c288b2d51a268c2ca454008f4728b95df12f0dd787811acb154dbfa577e469f74a48704aeaa3a83ce00b3b7ce4095f06b5650e1c8958fdac25a56959761fa8f553cdffe5852e87cad3fb10be75f3b7fb60f968be803f5702fdabe76d1aad28aebfe4696a717cf8fb88e01f1c15c9ac583aae09f398359cb2b9b3c7c3d9516ba23732b708a33233d2388a8b6e74972b7b9b4ad02927832c9e5c0c2e61ab34b4c0f27335546309a9ca450cdd9cad4af76aa436d4c93270a1d0a24340efe96c4a2a3c4cddf4ba253c6d1a03e6321f5d8b7d8682e9e28a9b30664a81d78233b6dcd1156f0250695095570400d8a7a533ed847baa9be4747dc2ad4417f6c1d9598e544bb7c25760c4ac284409031fb8aab844685c03b4365d41dd1f75afed80af2afed9c3a6fed9a3e7e75fd4735acc2dff04b79386efaaea6bab6ceb08f2d3f39d8bb67196fdbc88bb4afcb7373b8ff001fef2cea34eecf489aebc70934a9c4deb30be65d4fed25a5dba7aad7807df72a462ef92915f6d97888f21b99607ab0480d7a172da94f1fed47c41496d01381f28c53d158bcf840b4bd8aa3f8ea7c5169a5b4a1730d781faff4608167f150d57c102df65ee396414dc1fe289788c135afd58df5c47455953686ed2b00b082f46f5cb1ba0cbe77e3b62e8bce5ffb0b6118b21f6a1c1128eff2f018197f3ea7928ef5a246834077133d12f3b37b0000a0280e025d112081e98162b6b29f9bfd7c7105d05bcb5454fb61bbd7cb3e78ff00042b2b333aa3d600c1d65f9eb0780eb8bfeecbd33ea1f043d3fe7efc3fa07c4c0addfdb2b67ec78b8db79d581a0559ea11b90ed4efecc270daf6095043c2aff0c96052dd0baf97a848b389050ab7bf325bd53ab1ff0090ff00ac4be08bf3b3935f8395fa3b865aada9d13060c3a7fd4e7b8d5b6bfc12baa2bf5739397eeba8c50a37877e18ea5fe6c751beadc6ad397f2cbffadaf5f44ae33b5fe87fd0cfe92f989d8b8944f961a4b57e0c284522804570a3b5aeb060f56b2b7d580a42735c173a40fd93240224b42325e91c22071e4b9a2d2e328d77b16a9749e04ae93822e9557918b4d057f41cc2d9f67c4b9b692f829c59a42022cd402380afe8970d52f88c25e60abd0c2b60cbdbd1fc467089a3e9015989620d5dec212a77f61d9b1c9c42d8697ca72bf9a09373832ee8f6a52d0f1fa2567c3f820a5833bac3f6c076e39a5ff3001063df6a96a5edd3b73e205e45a4179443769dac3b7dcbade08e5d05fdc08dd79e541bf4f2fba83ba1ba93081b0362aaff00eec31b3c36e56b1e6569c4d626ff007f860825ac2f21b65ee52cdd6d6f45efdabf920157508a001d2b64a58b25eb5fc2a6d005f3e8257953a7af9595aabbc5bfb42a6555addbf23ecc86c3b8079e7d953105705ff2cdc561f078fc4586afd3fea621c2b78f3f1080d5d2ff007e2e5d62b17c55705208adcbc3820944bf65dd640baa50061ce6d156f4f001c38907eac943ad6fd9cbceb0a08ec5bc54dee2ac7069fed96a57bbbfdd94bf99beddefdc3e4eeffd94cdaff7fdd95f82bf47c12bddf7fd4d3df9e77dfa26c3fcff0099c1ca2abea1b65957af625f9e4e723de358045cf88a26ca3d9ba0f9c7312d14056c05fbc46a2ffc300ff9f3f443f3b794994dd17f4a8e3cd2d0ba386956ba95f2d5d563ecaec740fd1ff7195de728306fa7c5462c0ef8103c63ca01229f588ded5d0e58e56bc3a12d4dc5b1e18fb508a2bfeb9ac7fa55d5b0ee3aaefea7357e5e4b3a460f500daa190c0d622781e2d8959f225ea357dd56401436818726c43d3ba89d9aedb6b8974dc174900000c2a23c89f681dfd12ba5d9630af85f6cd219752d8522180a0840a9f62663c9a8c44683a23b6f8f8d8689fd1fea0292c976f9d83f6fdc84e5a254bf49b9ccc67cbf101a258814fc0d4ca8e588a82c1471c461fa85d1134fbadd35b7e67e85fca5d36d5fed3e557fe751ea9ebc85bc89db02293fc8ce72ad0170bae0290175ad7309e8e3b59ace838804d6ff0023fc476d1575b19639b45967bcc166b6f4147e7d9c14fe36b7987e82f5f908d0148f54ca077012d65db14a0d839917457bef6cedc2ad977a1f8a23b203145b301080f7b08d0d0f09c7c11a49a079d978e37c4455a02873cf40c6409a2f6fe18188cb15e1fe23441e6afb3fb311c2dfa77fbd4ab5f0fc7fa6207c67d67c8ca2aaa88138bf3b8bfbfee7377b0b60a3652b3e1656083778e59fea52dadf2f2c77f44fc5397e5ff529ded1bf2cf4dddf97c97cdfbbf2c6b6f777e5f229b7befcb0207bd1f9abb7e0a94a85bb0b8fb4956e0bc34a1baf9b3f5039cbac7fd40fcfbf2f91c3798ae280f0a2e8f6214d5f8b43bbeeb4798ed40b137c6d5354c74e48535f4b5e7cdc02757e6ce21e9f4c3a8d3a5fdc5df57f37fe228d7f81fdc818b41daeafaa40db86f996f5658f4222da18a869ace62e5712f445cb72952d70f31503e45642aee5bf12a9c9109ac7eedc2b8dbe60b66c63b5059fb8b889cb83e3fa168d16b96348453002000fccbc0a5b29d860444085f9cbff00087bc4b250a0e5ac042c56bd0c523446a9e7ea5269575fe9f94389fe87300bb978f82228a0fcd056bc044e2d3b8f98325437e5861a3955fca67d24443b109f170cc00895d1904351608f1fd4aa17015c316327a34a012d8b2c48a11cff00b988b7cfe90341fb963617b3962ca61e87a9d779f8255d0e3e3081bc78d796fdcf301fdb5110df36db08c6052dd82317aba62dbbcfa3c2003b2126dcf3c96f928ba56d017fe08970373f4793d0e1d89b3fdd0b37a1b7f94af8fd19fc4a20fb396a0eef914aa789714f2b83f639445c80a14fe4ab9afc0b85a5f7505d1a3838f8116a80f356eab165cd91486ea19cea3538514302806536932b03b5addd132eed5c21c0e88450d364350168bf1105002fe2ad6f5f6622abb555c6a6ae0aefd0353d600d7f4dafb09e4eb9ff00c542bb929baa87c8e6556fc6dc46f87618179029f3750a851fc57fc08d52f22af8b7c7c11eca546885ae05c5a90ba11bdbc36a1d65029feabecd851dfc7fc25577f1f4cade6bafa85fbd57d4524d6bfa551017215b735b45752f505b971d8c4286d42855bf6ca023f1fe595107841161dd9c640d15f1894bd2f8bff7265009022f9406655cce90403be051025b7846bde22689da03166d5f0304077ce098cfaf027c3fa42932b8459510a15b9fd52a6361fd1a82bfa54a984003a17a750fc48a84399f1972065d1c311c657e723e64d97fba452a55fc8953027eaa0a83ba833726d7a57d0382231f2c3ae44433700c33250e7ee46a8e818363e236ae0e259707a0bf495f1a1875f0aa3af68b67392ce2122e794561a7a4a01b166ef8b185345e73a54d8fb7c428837ffc1df56c83081e4ed3d9f6758d4b7773236fe8636e775dd483e3797b4b0b55e6b97ca9605b673cd10dfae57057dce3c29d16fc400851dfa7d475f0ee9564186f6bb2cb3cddecb6fc9e42cde968a4681b8e175a9ca5ebc95a61a1babb8137aedf41eca340361b7e0de201e1bbbe4879761a5005d1550add2473376de62a504d0df3e7f7cb8d0869c3e17ea1aba557c358b54977c038bbd7442dbc35f0f205a720aa2b25c4316a6c145d48ac74b352b3e2342d6d752fccb89a85dd6037f719685245e51d86d04c964d5c9e9b5f264dca650bcbfc46ed5445068db7e438dee1bf8fef30a7e490e13068abf0b57bff0022021d8b8d2736c827905072b8035be76884c502176e7cdff81391ed7f20f7c2095a538337e3f5307b0e5ebe107509ac0b1ad22396de534b1dcd2ea51ae2269ac5b3800accf83d875fc7d7acbfc51df933eab9f89f0c3ab857fe7f6814b6dfbf3120ad6c6db01d316fcb06ca7985717511ef9f6240047f6875390a5368f5e7d439c4723eca1cfea237f962bcb29e8bf6c06ba3ba22df292c8fc15b943c666a6c8f0f68b8ce2c1643b1f0be1985c573eb2a4d8ef766aa3a2359ec8618ea88081c6f5b25065e352bafddcd525388c8d46a875929e04dea6ae7acab86d7d807ca55fd70b0c6b543c2cb96a04e04a65023e58e6caeef23347dbaa1ac49b5285abab847847c63f19d950ab88d83df35e10058ff00697b71870b1c5144085c6ade5159fc988f4d731263eb974da3c32ee4017c12fd0c56b288b45ec549b978a255001a4032b318a0c8dd76bd46e8f2f77042b361823c4b58bc65a7c15ad2e5b84fbb5737ea72a98d2d7eb09c71cfc2db802d4fb2bd854dbfce129b82bc5ebadaec26c82af7665263d3943615a52ace76e1e442acb0d55785e4b271fa7e76cca4d5f155f7cf0c025867a877d46c21741a83f4b37f93d9622c4029cadb5d114d78d09aeedbe4c53c50ca0558e88a54899f2721ef41516cdb77ad71f1330ae57a6087a14bdffc12cac72f90695365452f0c6387825cba39e5be631184eda2f1df061981ed701d6e5a166cd1469bebe4d3829a5ff77ac3058db58d5e5f84320e9dd2cda20b0c2958b38dc1aecab7d4f64956eb7adf2c5e8bb59cdafab117e975f2bcfa8d6f558d7be11047a67c1ff6514a6a3ad0f2c3b3820ac0e562078d3fdca5fb7fccc2f9e77e65fcdff16ffa256ff67fcc03dcff001ec29c7ebc2152f0727c1efdca62bf1e0cb0722a7528cf83d97c0fc2a50a2d3ec007a4e0b111617c28596ca96855f22161b1f40cad1d7d4a4db859de43fa5a99ca5fed17ec5f6647b17f242ec92169772d1865c1ec5213991ed7f0c7ba61559e44608eb2e8437265682c24b40d443b14ce5f9e4bea956bac6020126f28c84a5209bbcdfa62b53a87446596fd1c14954deae8f44bdef250466cef9c6a1ff4919ea25c86764f81a2938155ba96da57305753b3790f34cac95dbf53601347c1fd225e754e718cafe92ed3bf8ec06d092b0920831adce7db5709936df12f41c20522e92c60a5aa628712a2bb59988c84a51be9805bdacaa6e996a6e88bc76ef10700d8eb942bdd58e227b440eb2da51c7ee5f68f945dbf738d6b381d6705dfd95fc4441b75d7fcb2b748379adbfa2550d0d41d45d5eecfe2a09c2a3a0e4ca93e6ad51e2f54f71d1b4ab7cfc633182888b7e6b995587b5c8758517620a2cf28f0b335a91886531c3e7091e75b6369741adff084de0283a1950a03aaf20da1d2ca3dcb283667f821eb5bfc7ee02d82a34f26fc132005dfc2eeed32a82275bd68d80f6258f8d5abaf9505aec2b815aacf8a8a0336eefafb46d50fa4fecae08ad26e791fda2b4a586796ff003014d6d67aa72c78524e333e0fa22a94d5659d7d4e128aae3e1eb0e003dabf3d9afcefdfcb0deb1e7e7e273765da5fcbe42f7f9aefe094ebdfa7cf4448579f15fe082fe4ba5f2ffa2071d47f965fdfdf97cfa256b5b5865a15b2ee2ac36b60ed11096d3762b548bf5ccf996f8b8d0956773a714f0ec7c0470864b2e33d87eaf64071d7a4baafe842e208ff00a69f25cb3f3f70c21632ab3dbb4731608a973557b2d31291db9afe81641435906ea01ab86a5f332d5c707a84b44a64405b17c5c1a8df732f3e32a1d231f991ecd5570950c2813a3384beee5bac18ae975b1bec9f961d6df35d41b43baa96a337e991e0ae0f97d8f7117bb33e5f9661452b1fe596f5a07c7b1198750ea51a98530afc05ff009600cb47eb20f2f59f9e582c4ae59c44af2338608541bfcb14440220dd6894a9e9497f6fe6397156acaaad74cd27f0388fa54ee3f5b2e9612e278891bb0f5cb60c7f50e068ba6b34761cea55d689435ee0d058f9089f3940e63bab06c8f4faeefbb1dd2cdbff0050597775aa2a28a1763f2ccaed87388adabe51a510b4bb71aabf50b576ef008ed402febe4185b097851d135f189d4eeda017ae8a96117500ae821a9608be85247464a1ef28ce9aa7d9b0816ac946bf0c291474038b8286e6baaba5d638af27b44aa56e9cbee8f32189fc1775f2cae1c8823967df50f207a308f1f70382ce9ef6b6e50a3a3a998707cc5052d4d0edf2f846c15e2af22dd45881cb61ff0078d85b55a72f8475128687c5bfbb0fa72e93abeb116bcfcfb15f3c658717e7ccbe2b333ba76cf3cebfdb339d45fcc75f6df97c9f6fdbfe0955ff00b880f533f47b2836f07e8f7ed83841aa03a42829a56fd131e28ad7c3cfcc0a6cb3cee908a3d42ddb324b9a07f444695f8b941cca88d82afc392ecb34cad942f50b05784352075ae2552ad94a6c628433ac36b7737af71b763fcc5fe8a8d56ed51bf4c2dce0e7db051651f9974cfd3a47b8e8d4ba3da63835d88e67c6a33257d8a2ea5d6c11a8944b3027d3a835e4a95f36a8748936626da0bc97352e01e590862cee12a2e7092f59cb6e2187137e8c376b40a365dcd6b94174da9ec91bd762312e066427c5696807344b5e53cae89df073510180014e8988b08ce0c0bfa96f5d77ed81bc7592b91a9fe868a3ca20841c176f1f12bc768d47e9b1f08908a866de1e0c7589eb940a7c0482582a5c341d34d547f56c7badb6783aa80d8bdad0cc0707c9598fcaa07db758695f290b01bc046ce6bed8d7fe57f11314b9cd289c7359f94c6feca89f9788143707272f9b868b2ff47c272e6450c6e50b46b74f1086bd742ac3000829a689c8284ac17265a48d5c70455739a28a6a93544d4e14386556743738a5abc23e8f42159805d3fcc1cacc5cf5f2c6f1ab302bb474bd3d30fa25973b67f961296cd55fd9d1048df34fb76b009ae2bef4e84e2ced507407988793483eb8837674b3f80853ecea7cbb85d9bcba2bfe11b2f1f61fc106b2aa8cf83d614eddf052d940d6f43ede025ddb7f9ff503dcff001ff606f9fe3fec0df8ebfdc3fefdd76fc4a08aa9e94a5fd64a2f0ea2aeab53e672df025952df1ef989297c8f95399d468775cbec53bea1da6f07dcd1548b55651dd0c11411652846c1b334347702837f390bcae417ee5a3921a45571002cbfa25a353d5be7e23e8ef2ba807482bebbb2acaafef15b1a8c257ff6a29e854d00d210b87b60d54b8e39c90adaa610c4bec887710da8bd8af2a13a75033e944ae10231738ce08b247984be834cee4530271b7f244e00244e00750f89f120e687a4b0e6014ee709097e6d954b2304c66436a9d8038a258817364a4a4d17ead8382dab0b472c4f615b025b7ab0fcc6c08031713e550c7f693756aa47d8ef94813818144cb89727e4c16d755069c451a626cbabe88bb39445ea3c5a92801904f2ba66d71e5dc13c14d150d81ba69c9575cf48ca95e146c304cc60f825d3d6fe58ef3f8b41fd7c610d51cfc6b2a0df56d637bdf936dac80d5175dd288fe05f35c9f3e477fea5b9b4f8c23a6fa7aae67078f3fe128ce16f47b8a03a2eecb866da083383791f171b5d585596cadf17131989ceafcd1df52a7e63928ba83d33d0b7de7840805d9fb1b006ca77cab9468ded2ff444305494e05d57dc0628530e07cc2d1b5355bbb3c7c44406ce41e09fe63717763f23fd40a783e69fe6f766a1c00540ced62c066d60fd12b99f67f7469be429a6957fda702d8563467a0945a3afc0f7ed94e2004ba45d36cd283b07afaea128438ab3856bf7384634305dc330fe7fbb01a33e43fcb01f77fb7dfc4a3f2af1ff009c119aba9a6d9c7c2bd8b270a00029a0a805f9df06008ab2e8f05b8bf4712c309c488c3c7e65df1d7c47be4dac21f75d732dc16e22a30f23c9701392e280fd3ccba88bfe510769420b74b65074e4db664bc51b2d90b51f0f0466d461deaa2876ad042b4063fe23e089777f0aef6090f2233004e6c55078445add8e207bdc3f30b52de2e319254bf171a4a3b9f506cc451256b3114cda21e798542f9665c3a1a97030360e4b9fddbd94ef474745412aad55f2238a0e23321123f2d9e2cb11167328abf251a46a59351b6409f9f51a1a38f4c0806c3e59e4e4b29e7e18501b5b609201bda10789a0ac30574712f49d6637ae5ffc870048de5670ae970812fba6b29dc82bf2ca45e9e5e095e58d176dc08b0c9c7882979dca638994ea0a9fd332549049e12e18ab54af3f8d947c7f7587debb544fdff69de7f05f317dfe58d16987e08d5b8587805eefcca1926c5178569f2304525b74ad532d7dafd27cff0007f96136eafabde655838584501f87abe475c3f34ea7037dcd7f12fafa9a0d4be6e2c29d885d710a050bd2faf628ad2ebb0b71f08c7a36c1692ca53467c8cc29c7007f0228aa7ae0a2e1886a81eb11614af05e977514f346582b294a61eebe66055700214bdef2f9af827232c3d57b2bb36f48e67ccbb2e6f30abc2a07fbaad57960f0b824820d5a615ff710a0055fd0e6dfb981eb79f2ff00a2108ac7178bf8809c70b7201d494b8a6d7a051051b7209efb65b3eff6c0a56c5efccb5b6d7ae28f096ea566fc1d7dc194d219f0f61923baf89eca5432bdd7ee5ca388c18fff00b644a38b650de9e68b08c0685e4dfdc60fa0591f6d547d8c364061474d0621c1535cc6a541b1c90cd8c83d18da82d22745c5fe9f01c7ca1509bb1cfe2731bd3b8d3a221401abe4f2777fb21ebcc53aa73ffc4142801454763489ddb17b36fd2d724598a1f1c8151afd5c5751543e3737177970960bb88ebab694351a8c59740f49605a9e4620dbc4fd45b6c1d400b055ff00962a0d052ccc6525110872ff000999451f18a4486ceca764f6aee1680f85c33ee45e972fe72b58714bc3fcb50881db0699ec62ef82f51dd9954f7dabe0942fbd5a1f39055810ae71c821d312e72a07bd95d00a82379b72d6125b2585a322fb6631884469355f314bc1a4fa847785af2a74f8b6caf4fdc3e34f82887c35f04b0f3fbb12f9fe6259bf7ad44ecf7a3fcb2b6bfeb30d6cf6bfc194837c58bb8df03c23a827068d104f78fcb1bb2ff96bf8205079ce146fcc01852b79b762868e879e3f5fe2350e500aca19a78fd487eb9689c7dc1fbca84af1f6be462f9065052759ee9072cfa5cd8129b14bf806054a06e44bb4bd7b8520395554a7e692ac727196e9f9837a8dd272aeac6e9dedf4c34b002de0f66a005bb38f4b9a96c1000c7a9ca6595f41cb46d645e1e0c5aab75d89738e05f174d3b6237632cb3d7454cd37a5dbfa8a316072f5f0253a7474f4f989c0a9aad3ab5d1140fdab1bb97b6905d5179c8ed063575e273f5ab6583c2d424f9168e2cef625f5f796f58e5de65794976caace566df810bf26c8c53c83f962ee67c95166eedf258c7be48abf0bd991576efea2b343dc0dd20d8091a18dc3c0d314e2e3badcf24050012f2556c9c09ca1e57a8965b93f2cb9e73fa10a546b9784bab3dd2bbd5e11da030e17fd427b051041b15ff8907b4b8bbfa807cc3073caf5f668266d02fa2e7c9e21a59e042d5be03a9722d15dbfea12ae504c1115fe7c18c2112d4d95490632c385fee3057fcb2e01dc522a6e4baf1702d94052dc50f025a450f5cc53871f110435ebb94859c1103ca8e70adeb70a36b3b8922d2e62059eaa3586a2b2a5f865b90f656da87c17913c34cb419bd88c41f21a55ade8c6e0383d22e3972a4ebd1b4b10d68b5b120539df5c15702f56bf57aa9c07ac135f84a2ca80504d25d9b97c51fe2259f81fd0c09409299a9c54af54b69e4e33408845afc3a2656d1f729adfe725666ff043e38f0955759f5acf72b9e766f5bfcb367fac218d06f8403e3df585503760b560e8cc5fa19da8e70a5ff32852e8b76dbfc4deaf9f082d00a6d352979e470cd9d20ebc4ca4585a80d1c641027da77dde238d5e784a38fb3aafd7cca5ab4fda7c47ce825014838bf2cff265a1634e80ae1771b20a8c52a84e04f155fc07ac60d805abd5b2ab407fe0c8e81d725a1e5c4bc672ec9c84a4b04a5783b5a8d162b3c9cfb66ba066120b25674dfed95659e2ec60fc12e6b1f7330128d3d12e8cb1034df9be5b86d6f5b7ff00184d9dda21ebd53b95f839713ef075231b345fb61dd5681dd173b9425df97f129802b0515ff114dba456be20303d3b2f88bc10415b1e0a9c30204e070b7de236c2fd59bf50b0dddc431991a73644b6e5f11c04730e616e00db646bc8c2361b220e5a858955cbb044ee2277393b9bb20aa2003c77d495c42f452afcb1d8876d6d9abc46cc7162121af12d1557b565821b7e58d5fe14958fd4e48bcc5ff24436b3b4509ffc20fb26dcb2b5f17fb89d5647373de19b7c7974c68182ec1b38ee27d29cf1141697311fe89cab815a5fdbb7a18a9a8604ab582bfab95dad4ab75f4473b1aba4e2550b2176ee2955c74cbe97c8792b2657819339a8c150f2ee2a39f108b2b4b75d5ca1516406811182071b29b687cf62e3c6eb06b5dc4c12dfa8ac35f4b861219b0bbd7265ea50b9467287b90a77d9c6d534aadc0a20b1ab45cc966162adc1f79db138277b07fcb2915e96783db35494e3a884ad254a95186058ed95b05d9fb1b11f1f6cf9fe59575ca7e89f5fa8a1797f96556e17db13787ed9d2adf0309c80f78f500cbab3cb6a5eef85ab57d88a51c717844ace5e04a05b43eaff00a82e0b8219b36044f6df69c1ed597bd59411da838a8c398062dad45331c95bf9ee53687e7633296b935866a8f357ba940bb34ae995790900fc4508edacf0b5877446f62db717f64b6d8f1651e1398dde1f6afb6343ab5bd2ba25864b5f03cacf404df5a5da5a5014b013a5a2a0775ecc3879a1c51c0a8aa8d299acb7d1ab1f14db09769ea5a41b6a7478469e807801c25fcc88d6705ca35556a03f9805bdb45fd917402edbcb858ac2085fa0c4eb5d1e39fc3c7c42d6295585cd30962bf0a35fb302b81bc2bbe9be54765763ebafdc05d017f0261ccf92aa0357bc974112c8b428b39257469ec600d365fea145519a3e600594f03c624c5f12348131db259a3b711fdb90f96364495b75b9721c4e742357600e55851440aa751b6076e266ac2d4b5705a1f1eca06f0388dd52c33b610697f3509f5c8d68ec05f584a4cb8c86887e389793b4ea793babe7d07d4541848c2da30f586a5a34e5e51818a6faedbaac9415aaaa55a756653d1413b09a6e95e76370017e212dbab36366dd44ebe4c4385eb5b70a554a2c6a8b582b4577ec56a20c2be4c263715e8d27a4737f57c4b44a903b28b82e58d558be4aaadf979011535f67c3d60e8063dd5c7f6b9c2247d8e905e7515372bb389c4ae405d46fa85783ee71c600434c0be897c28e076a6b8e95b771ebd0c4b0045791047fa18a8916b0a20d9c94b8b4b0654c16abd1a97ef906c140739868b4bf784a11e7f4173401df34fd4bab734ef2c4a2de99fdb918797ed06145bf11f00fad63639e1b6d8e07ba82beb5f82e21683bce3bfb88e99ddb0fb43cd62369aea2b582cb6ab9b6442dfef4cb29b4fa584d5452eaa81be65818f3eb95f4ce458ef53fde1efabcbfea6cb8ddde0e5d41055038ae6bc085d8f14af676b1ac205b2cb1945452eda7476cf6a58b5100a6ac703e25a4ad137d1ff7142283caae2d282ed455cb0be889ce2ed36be6010e5390e5f5f82296aa542f5582b95e2595a23ce05bf3127ee00fe69fc111a5536bb39bee28a5d2bb6abb6259ded497f75fda370b9237630fb7c231b8d80db17488f67156121abe170c88bcd00f16bcb3a0f969cff371eb342eaddd8a282bed31d62d3b03cb16563c47a48db1fe2215407475882c55946b2b4b550087a1282559730d8b4c4232b55a632d174e8ca9550d7995b65a6528ce66f053fe567d9928a9dce6716dd799a0dd33f1fb2a3bdaebbb016ebf7280be113e86ff008902fd055791e73d813171de0950569320268fd1b51e8717df89a4a7348220187b65dbebb3f01fc100f53086f1a7c82684e3c06be588138514a793f6f2ca7903b9c0dac87a8c814657c91a0722a0d57d4bc19959a334da2b4fe025aaff002d9b2fb453e785f6b290e17539ad7f1dc7897194ec6b018d2015d9f72e5e0eb1a290e7322535b594612ec165ead3c9474db9735ec5fac2f82394ecbead5b4c8c053ad20ba07e77b8b9ac918d04602d9fe8c5da2d5788c46c35dd71f821581a2afd6017ed5cc7615f067dcfe8e8748f9c0b2a1437ec1d8afc74fb67db5965fd1048a9a6b58715c1f337804ed5fed2b8a54e3c0c89cd4a6be48f6003c2fedf72ae342ef6febc888b41ee081cdaf5590897acb39c98d3a17bcb027873ba6514b579cbe4d76b4da984f0685e82d8bd5cfaa0e4e065552e2d38dbe0d1ddb8dd0fcc0f44f2ff00d90e79bea1d5efe9cfccab07f675fde6cdafc87f6815a17fb7fbcb859539edfdf12d2cafa1f3d4fa9c36f38797d011140c3a7f6548aba2df37ddf804a40100cbb039b7e7235b0e4a75d7a11c699f8a0f78e618be8aa8ed1f53822ef550a479e04880da37ee9f4f59c1c05d9dd3fe637b2c7b4feecee03dbb7be3227da82703569c6ce2f3b6bb280af6ff0010ea6a561a39559ab72fab954783e6bb6f2cd7e67795afe52c96b222029cfdcdfad3df91ee8806600b1156ee6e85169ec68a54803f0d80a71bf265a1ec11b2952bb6820939e6aae5352fdbf79dccb1fed020477f5c80b2b3c3f9a5ec4fa3a8e76aebeba23b0d55608caf50c83f6a1fb7d8555130275bb9522c8560f95fcc3203608d7ed86a99c4b3fa3f36155fb50c8fa04e742a7e5e222409a4a8ac15a28036728e0fcc5ccc5104b4a5fcc08dc0b128bbb9dd86af9d8fb8431ea2c75f52bb2d014ffcfd44fbc786a8b81ae47873efb512b45d31d272377111e4bf18868129d973020ebbab15f71695e2e5b851f35385039b654f442aa1dddc170b9d362d2e1cd444b8bceb25c10b050043ef0c4c27508b51f89462b73b29ec94a278bcce7af2c450c482480154111aa9715406e2279116afe62d35c041270b9f50deef4a80317a0f595a30156eef87b2ca00195a7fd1304cb975b6b4dff701551abef7cef729e0a87cdb4bed13006c3581599ef93101bf387e7e628720beb6b1fc6aab960aff00c58f37c3f3acabac5f9c446b852baa08f84b30ad61169af37789b5a4bb2f081b54e5e3fccc1f93100e2dd9b69c307222057c5428b240c38baaff0082201695fa1fdb01e2163d0edbc05c5e4b9a6928e7ff0009b1c9c3adbd7ccd06458574f7512ace4eb77fb78fd45d05de8d567ebfcb029dc71dfee900f6de7857cd7534a2015d8072d3ccab83594b3ec13f50a05cae802d2ab0a9af49c328e9a827ee1406d422d34f54ba9c2a1cad7ded30613221696520c812cbf7307cb50a775b6dce535225e2e7674cf5258f71a5e9aca80efc9116dbf1012365472177bfe4887828801f4462acd5d1e4c3c0c2218a816df0967d4bf8c85ab6739d144ed65be85f4c1d0cf8b4be58bd91a9767869f0710bc355cf9654b17ae14c4a917d8c725c30aac270e403a732a21e1670978b7d545629c4fe6e5d040db5ef808ca69668a0adfcd19096679ae725e4d3d1774bd7e23cf1fd0e7b639994ec31fedd4f4d21c354eea1bf2e307c458a88602e689424c1a537c2a5136e97fdfe65da3a57030052b2a88d5145ae3a81202dd1d7cc69384ea06871809e88507219a68c972b03aac8a53d5e4da106529ce540e1a61f7c07392f82c94d5f3b1f25288ae19cac3cda2e52848e9fa974b61ecc83bae2dcc5b4151e59356aec79647a61ea5893962b2b48094e7bb00a145dabc129b4caf0e33e662cbeb6d38d9f5cf970f61916d9f4ed05c6565eb8e6b7c75135a50acac7d8ad8168561e110a1be5d85f2df860df05f2cba01e551cd7cb042ffc73378e3e0d655570795acc68fdec5ca97ed96da70f0a0b94dfcb99ac49145fce998b9fb72a6e83ce3e5136d7f633a544baeaf3a8122afb1209b291e97fe259f1bde1174c5809931bd5b6fea3952e852a1f6f2fe09c124dbe41b6bc2bf7284a80c22496cdd1b97bab20af179938023f853a968b1d60657f9890d0a410574b5970a0841a40da8d1ff336606f042d5fe2a1fb3029cce42983d612a22f6fac6d5975d30dbb9129a59080c2383b65d0d033fda5a6ff003cd81643ad64bcabcc8e0be19ab9b962708162c52ec82955fb96fbf4f6a34e0f8c98025404084b3a5fcf236f81f9bb32d585183fde7ba1a3ea513e3fbd8052e09d10182e5cc57e5049fbc3e19771e1711a1653543e36423bd41542dddfa0990135d27c966ddedecf5176207d044d152fb65dabf2a8d707d4f64b8763e38af06c48a7c0abb44c561e72a6f080b72a45d840354f164b1e0dc99bf50a179fbc5869a355002faaa2b85942eae2200bfa80a1556078100d3903c9cf5009c7db113b4a38940decbc2948fc85d690eb84bc5e9708d3be9992b360a60ed5ecabbfc232e93e32f06a3b58fc9337ad727293c82e2197d0bbded8d3be5609039bff004ba5d8361d1669c8bb011c42a99c900a52c69e90f8f2237ab6ab8b7dec65c955d052c01ace44f1b37435dcadbc24a7f967f3133df8550acf08521a1c71c76c37fc3a7db03f3f071f96727bf061295f5e426ffe58e6a57dbb07197f6a8dfb53f4351ba4e6f6006b33f2f32b2dc7e551c5371ea91b1162ad068e257d3a99b7e5f50d685ff30a6afc0d5fe8867582bcfefb52aeb3f0ff00a9d3f4adcf88fc3ebc8bddfbff00b2f6155f886597e5712a8d0a81382031c12aa0adff005fdffdb0cdfe65c4059196fbfe8d28821c0e659df0aec402e0f62596833348a9e589112534dbcc1bb98263387cbb9771951f11b06e7498a07ee380458085f09c44a42baac25f8211f13634a93be22f7c4569940ac6bf6b8215b29577d5134559413901f97589c85f88acdba5fb65ae7d32722982e52159773e7cf6c09c55702a057eb09a7aa2afcdec0b502ea5b974dab97c6c3cfc06d6acaa81754c8317726b7d45ff0044803427086c60536779062a3630071f6e6a6775625b7ab9c8c55cc35e988b9e2d6eff00571f44776125ed6222116dba54a110190696a2e34d7785cd7ed82d02e252f60adf372da0d10deb6b32f9a98e0e5f388cd9a40cae6a71e04d1f18d471764ca9e898857822582066fb4f21ddab55710bea95551c304571e4975f53fa0f16d72b0970d8f498e63621179a56d4c56053878797de46c52b88d05bdb04af8d5d85357000b0cab3a70fc44bcb77b6e6f2ce6b94f0c2555bbb55e887f1fa8037bafc04fdbf88a1cbfd4abcfe228a200a1d9f177e40e485ed775ce32ba3b60ae799ce9b7ee129785eae11f5475c9f978867473dcc3456f86c980056840ec4a8790d2707c3f316d8effef926c573f0ff00a9e25a83eec7768b1a3c71f3c7eb8252fe5ffbbfeec42fd5fb6e5f9bfe2a6791e6fc81e4dbdedb808b5aa271df1f3c4cb0aa9756edcb70732f2228e0bfdefdcb13d1565cf70607fbff00ac4094b022d4f9570a84e6ae1f0250551098acb88fcfc54bb4fed07842711d910b067e511a0d73995e33100ae5ce03cc01c15f097b6af09bfa963a10878b07a373286fc4969937a5ee722bc96a8abfa113373e87887c86e7ce55d7c4b183310af421bdf61cea74953295f9843751f6bd6143256e3dd96d6453f32dc68f6a72e5f30012c1551a1ccc28e61e4efe89676e5f317e6755e0972e5ca1fe9dd752b9c942f2c8b68a8fca4acf896965b72ca5f6eaedb8840a8af50d1860e93eb08a62debfe40496d84650f0d90410a7eb983540f93844102def054cacb881f57503a40bdf905cb5b2a75243bd520aa213b7c87e6cd577f48550f6421ac3197d105034770dbc2c69e02394a30421072e7a950a4e5695138adbb5b8311b56d042f42906b2e66968e168d2cf7d84036a831cb5004178c41762afc8e82e20daded5c4bdb6aa1e04ad2d6bef89968eb75f113935fe2358ecfd4ba69d42eb8327b1fa3094e7cbe2a8ada58a6a3860028baa5b72c89a2cb97a7e0a9f69b057d8da8355a2f08355750acd970bcf0869ad834b65dd1ee998946a12fa14b4a71aff0030c2aa92e742cffd4452269753b557131d17a5edbe6a159a8abdf7c10556ee2fe3e639adbcfb961a9d861ef9e4791f97fc94345d8fdbdb2e0972bc959a756440379a7083bde6e2ba97e3f11d207731f72d817d4f6caa82d6b14f9334cb723c4138e53774ef7dd8d57db91c906c0d2e058eab12c406e5ab4028af9993413b585a01e6050733dc556d0a688ce10c7163e4bcb74dd30a3528b55854c93ab9833a235ef88fc4e54f41388db9433c0bd8f8810ca23ba2e5f61abef50776b6fea5edfac2d1d570df2e934fd427ae97f51dcdb0dbe66fb80ef887919cc2ec657117b55afba80d68d460b8d3c140e700b1126872f2bdafcb0ba9b91179a83f20b1b86a73fd2e55c20586cc6f22842190be0499f30839b2cfd1d10da280de50c02048019c32e58bb7913e270eb0d8044965b50a00c8557038a22696958bc16ac2461d806ae31684c58167520556686a280e666cb80db4ca3c431a5211d423b15e0a4435798fdc1300b7f138297165511752ab59ffd9', 'image/jpeg', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 12, 'KAYIKU MOTO KAYUNGILO', 'kayikuk@gmail.com', '0714417181', '19840810141160000229', '', 'permanent', '', NULL, NULL, '2026-07-16 08:46:12', '2026-07-16 08:46:12', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(18, 13, 'SELEMAN SAID MTAUNI', 'mtaunisulley12@gmail.com', '0783914604', '19940207151130000120', '', 'temporary', '', NULL, NULL, '2026-07-16 08:54:52', '2026-07-16 08:54:52', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(19, 14, 'KILONGE AZIZ KILONGE', 'kilaziz96@gmail.com', '0685679967', '19970815151080000122', '', 'temporary', '', NULL, NULL, '2026-07-16 09:03:54', '2026-07-16 09:03:54', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(20, 15, 'RITTA DEUS MLEMINGWA', 'rithamlemingwa@gmail.com', '0628327987', '20060827151060000118', '', 'temporary', '', NULL, NULL, '2026-07-16 09:08:57', '2026-07-16 09:08:57', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(21, 16, 'SOLOMON ZEPHANIA NDULU', 'solomonzephania@gmail.com', '0624927692', '20051212161090000222', '', 'temporary', '', NULL, NULL, '2026-07-16 09:13:09', '2026-07-16 09:13:09', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(22, 17, 'HERIETH EMMANUEL MASHAMBA', 'mashambaherieth26@gmail.com', '0719572686', '200200320451150000313', '', 'temporary', '', NULL, NULL, '2026-07-16 09:40:12', '2026-07-16 09:40:12', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(23, 18, 'DENIS JOHN MUSHI', 'mushidenis910@gmail.com', '0628839609', '20011227253160000125', '', 'temporary', '', NULL, NULL, '2026-07-16 09:49:31', '2026-07-16 09:49:31', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(24, 19, 'JUMA KINGU MALEKELA', 'malexkingu43@gmail.com', '0714462627', '19900713141220000523', '', 'temporary', '', NULL, NULL, '2026-07-16 10:20:22', '2026-07-16 10:20:22', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(25, 20, 'AMINA ABDALLAH MPILI', 'mpiliamina42@gmail.com', '0686464297', '20000612618130000110', '', 'temporary', '', NULL, NULL, '2026-07-16 10:30:34', '2026-07-16 10:30:34', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL),
(26, 21, 'PATSON AUGUSTINO MALLYA', 'malyason13@gmail.com', '0693353523', '20011010231210000121', '', 'temporary', '', NULL, NULL, '2026-07-16 10:35:52', '2026-07-16 10:35:52', NULL, NULL, '', NULL, NULL, '', NULL, NULL, NULL);

-- ----------------------------
-- Table: employee_payments
-- ----------------------------
DROP TABLE IF EXISTS `employee_payments`;
CREATE TABLE `employee_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(50) DEFAULT 'bank_transfer',
  `payment_date` date NOT NULL,
  `status` varchar(50) DEFAULT 'Processed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_id` varchar(100) DEFAULT NULL,
  `mpesa_phone` varchar(50) DEFAULT NULL,
  `bank_account` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `simulated` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_emp_payment_date` (`employee_id`,`payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in employee_payments

-- ----------------------------
-- Table: employees
-- ----------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT '0.00',
  `hire_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('Active','Inactive','Terminated','Suspended') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `employees` (`id`, `user_id`, `employee_id`, `position`, `department`, `salary`, `hire_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'EMP1784093790750', 'hr', 'hr', '0.00', '2026-07-14 21:00:00', NULL, 'Active', '2026-07-15 02:36:30', '2026-07-15 02:36:30'),
(2, NULL, 'EMP1784094743029', 'finance', 'finance', '0.00', '2026-07-14 21:00:00', NULL, 'Active', '2026-07-15 02:52:23', '2026-07-15 02:52:23'),
(3, NULL, 'EMP1784094961825', 'finance', 'finance', '0.00', '2026-07-14 21:00:00', NULL, 'Active', '2026-07-15 02:56:01', '2026-07-15 02:56:01'),
(4, NULL, 'EMP1784095368443', 'admin', 'admin', '0.00', '2026-07-14 21:00:00', NULL, 'Active', '2026-07-15 03:02:48', '2026-07-15 03:02:48'),
(5, NULL, 'EMP1784188986991', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 05:03:06', '2026-07-16 05:03:06'),
(7, NULL, 'EMP1784189483232', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 05:11:23', '2026-07-16 05:11:23'),
(8, NULL, 'EMP1784191965611', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 05:52:45', '2026-07-16 05:52:45'),
(12, NULL, 'EMP1784202372353', 'management', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 08:46:12', '2026-07-16 08:46:12'),
(13, NULL, 'EMP1784202892132', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 08:54:52', '2026-07-16 08:54:52'),
(14, NULL, 'EMP1784203434053', 'hse', 'hse', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 09:03:54', '2026-07-16 09:03:54'),
(15, NULL, 'EMP1784203737549', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 09:08:57', '2026-07-16 09:08:57'),
(16, NULL, 'EMP1784203989231', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 09:13:09', '2026-07-16 09:13:09'),
(17, NULL, 'EMP1784205612683', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 09:40:12', '2026-07-16 09:40:12'),
(18, NULL, 'EMP1784206171646', 'engineering', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 09:49:31', '2026-07-16 09:49:31'),
(19, NULL, 'EMP1784208022226', 'driver', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 10:20:22', '2026-07-16 10:20:22'),
(20, NULL, 'EMP1784208634722', 'construction', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 10:30:34', '2026-07-16 10:30:34'),
(21, NULL, 'EMP1784208952532', 'engineering', 'projects', '0.00', '2026-07-15 21:00:00', NULL, 'Active', '2026-07-16 10:35:52', '2026-07-16 10:35:52');

-- ----------------------------
-- Table: file_uploads
-- ----------------------------
DROP TABLE IF EXISTS `file_uploads`;
CREATE TABLE `file_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `category` enum('Document','Image','Video','Other') DEFAULT 'Document',
  `uploaded_by` int DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reference` (`reference_type`,`reference_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_category` (`category`),
  CONSTRAINT `file_uploads_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in file_uploads

-- ----------------------------
-- Table: finance_work
-- ----------------------------
DROP TABLE IF EXISTS `finance_work`;
CREATE TABLE `finance_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) DEFAULT 'FINANCE',
  `work_type` enum('Budget Management','Financial Reporting','Payroll Processing','Expense Control','Audits','Compliance','Invoice Processing','Budget Approval') DEFAULT 'Budget Management',
  `work_title` varchar(255) NOT NULL,
  `work_description` text,
  `amount` decimal(15,2) DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Rejected','Revision Requested') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_method` varchar(30) DEFAULT NULL,
  `recipient_phone` varchar(30) DEFAULT NULL,
  `bank_account` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `payment_status` varchar(30) DEFAULT NULL,
  `payment_transaction_id` varchar(100) DEFAULT NULL,
  `payment_simulated` tinyint(1) DEFAULT '0',
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department_code`),
  KEY `idx_work_type` (`work_type`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in finance_work

-- ----------------------------
-- Table: financial_strategies
-- ----------------------------
DROP TABLE IF EXISTS `financial_strategies`;
CREATE TABLE `financial_strategies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `land_acquisition_cost` decimal(15,2) DEFAULT '0.00',
  `estimated_construction_cost` decimal(15,2) DEFAULT '0.00',
  `permits_fees` decimal(15,2) DEFAULT '0.00',
  `contingency_reserve_percent` decimal(5,2) DEFAULT '0.00',
  `developer_equity` decimal(15,2) DEFAULT '0.00',
  `bank_loan_amount` decimal(15,2) DEFAULT '0.00',
  `annual_interest_rate` decimal(5,2) DEFAULT '0.00',
  `loan_repayment_period_years` int DEFAULT '0',
  `grace_period_months` int DEFAULT '0',
  `revenue_strategy` enum('build_to_sell','build_to_rent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'build_to_sell',
  `target_selling_price_per_unit` decimal(15,2) DEFAULT '0.00',
  `expected_monthly_rent_per_unit` decimal(15,2) DEFAULT '0.00',
  `target_occupancy_percent` decimal(5,2) DEFAULT '0.00',
  `target_roi_percent` decimal(10,2) DEFAULT '0.00',
  `target_irr_percent` decimal(10,2) DEFAULT '0.00',
  `minimum_dscr` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in financial_strategies

-- ----------------------------
-- Table: financial_transactions
-- ----------------------------
DROP TABLE IF EXISTS `financial_transactions`;
CREATE TABLE `financial_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('Income','Expense','Transfer') NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `project_id` int DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Processed') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_method` varchar(50) DEFAULT 'full-payment',
  `installment_period` int DEFAULT NULL,
  `down_payment` decimal(15,2) DEFAULT NULL,
  `monthly_installment` decimal(15,2) DEFAULT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `sales_agreement` varchar(255) DEFAULT NULL,
  `receipt_file` varchar(500) DEFAULT NULL,
  `receipt_data` longtext,
  `receipt_mimetype` varchar(100) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `property_id` (`property_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_type` (`type`),
  KEY `idx_category` (`category`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `financial_transactions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_transactions_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_transactions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in financial_transactions

-- ----------------------------
-- Table: hr_work
-- ----------------------------
DROP TABLE IF EXISTS `hr_work`;
CREATE TABLE `hr_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) DEFAULT 'HR',
  `work_type` enum('Employee Registration','Worker Account Creation','Project Assignment','Attendance Tracking','Leave Management','Contract Management','Policy Management','Senior Staff Hiring','Budget Approval','Employment Action') DEFAULT 'Employee Registration',
  `work_title` varchar(255) NOT NULL,
  `work_description` text,
  `employee_name` varchar(255) DEFAULT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Rejected','Revision Requested') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `rejection_reason` text,
  `revision_request` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department_code`),
  KEY `idx_work_type` (`work_type`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in hr_work

-- ----------------------------
-- Table: hse_incidents
-- ----------------------------
DROP TABLE IF EXISTS `hse_incidents`;
CREATE TABLE `hse_incidents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incident_number` varchar(50) DEFAULT NULL,
  `type` enum('Accident','Near Miss','Injury','Illness','Property Damage','Environmental') NOT NULL,
  `severity` enum('Minor','Moderate','Major','Critical','Fatal') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `root_cause` text,
  `immediate_actions` text,
  `preventive_measures` text,
  `incident_date` datetime DEFAULT NULL,
  `reported_by` int DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  `status` enum('Open','Under Investigation','Closed','Follow-up Required') DEFAULT 'Open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `incident_number` (`incident_number`),
  KEY `reported_by` (`reported_by`),
  KEY `project_id` (`project_id`),
  KEY `idx_incident_number` (`incident_number`),
  KEY `idx_type` (`type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`incident_date`),
  CONSTRAINT `hse_incidents_ibfk_1` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `hse_incidents_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in hse_incidents

-- ----------------------------
-- Table: hse_work
-- ----------------------------
DROP TABLE IF EXISTS `hse_work`;
CREATE TABLE `hse_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) DEFAULT 'HSE',
  `work_type` enum('Incident Reporting','Safety Policy Upload','Toolbox Meeting','PPE Issuance','Safety Violation','Inspection Report','Safety Training','Project Safety Status') DEFAULT 'Incident Reporting',
  `work_title` varchar(255) NOT NULL,
  `work_description` text,
  `incident_type` varchar(100) DEFAULT NULL,
  `severity` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `location` varchar(255) DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Rejected','Revision Requested') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `rejection_reason` text,
  `revision_request` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department_code`),
  KEY `idx_work_type` (`work_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `hse_work` (`id`, `department_code`, `work_type`, `work_title`, `work_description`, `incident_type`, `severity`, `location`, `project_name`, `status`, `priority`, `submitted_by`, `submitted_date`, `assigned_to`, `due_date`, `completion_date`, `approved_by`, `approved_date`, `rejection_reason`, `revision_request`, `created_at`, `updated_at`) VALUES
(1, 'hse', 'Safety Policy Upload', 'Safety Policy - LEADERSHIP', 'Safety Policy: LEADERSHIP\n\nCategory: ppe-policy\nDescription: 23ertgy\nCompliance Level: recommended\nApplicable To: field-operations\nTraining Required: \nEffective Date: 2026-07-15\nReview Date: 2026-08-07\nUploaded By: HSE Manager', 'Policy Update', 'Medium', NULL, NULL, 'Pending', 'Medium', 'HSE Manager', '2026-07-14 21:00:00', 'HSE Manager', '2026-07-14 21:00:00', NULL, NULL, NULL, NULL, NULL, '2026-07-15 00:59:12', '2026-07-15 00:59:12');

-- ----------------------------
-- Table: inspections
-- ----------------------------
DROP TABLE IF EXISTS `inspections`;
CREATE TABLE `inspections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `inspection_type` enum('Safety','Quality','Progress','Environmental','Equipment') NOT NULL,
  `inspection_date` date NOT NULL,
  `inspector_name` varchar(255) NOT NULL,
  `inspector_role` varchar(100) DEFAULT NULL,
  `inspection_status` enum('Scheduled','In Progress','Completed','Failed','Cancelled') DEFAULT 'Scheduled',
  `overall_score` decimal(5,2) DEFAULT NULL,
  `findings` text,
  `recommendations` text,
  `follow_up_required` tinyint(1) DEFAULT '0',
  `follow_up_date` date DEFAULT NULL,
  `next_inspection_date` date DEFAULT NULL,
  `weather_conditions` varchar(100) DEFAULT NULL,
  `site_conditions` varchar(255) DEFAULT NULL,
  `compliance_level` enum('Fully Compliant','Partially Compliant','Non-Compliant','Not Applicable') DEFAULT NULL,
  `risk_level` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_inspection_type` (`inspection_type`),
  KEY `idx_inspection_date` (`inspection_date`),
  KEY `idx_status` (`inspection_status`),
  KEY `idx_inspector` (`inspector_name`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in inspections

-- ----------------------------
-- Table: investment_management
-- ----------------------------
DROP TABLE IF EXISTS `investment_management`;
CREATE TABLE `investment_management` (
  `id` int NOT NULL AUTO_INCREMENT,
  `investment_title` varchar(255) NOT NULL,
  `investment_type` enum('equity','fixed-income','real-estate','project','equipment','cash-reserve','other') NOT NULL,
  `asset_class` varchar(100) DEFAULT NULL,
  `investment_amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'TZS',
  `investment_date` date NOT NULL,
  `expected_return` decimal(6,2) DEFAULT NULL,
  `risk_level` enum('low','medium','high','very-high') DEFAULT 'medium',
  `status` enum('planned','active','paused','closed') DEFAULT 'planned',
  `maturity_date` date DEFAULT NULL,
  `allocation_percentage` decimal(5,2) DEFAULT NULL,
  `counterparty` varchar(255) DEFAULT NULL,
  `investment_objective` text,
  `notes` text,
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_investment_type` (`investment_type`),
  KEY `idx_status` (`status`),
  KEY `idx_investment_date` (`investment_date`),
  KEY `idx_risk_level` (`risk_level`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `investment_management` (`id`, `investment_title`, `investment_type`, `asset_class`, `investment_amount`, `currency`, `investment_date`, `expected_return`, `risk_level`, `status`, `maturity_date`, `allocation_percentage`, `counterparty`, `investment_objective`, `notes`, `submitted_by`, `submitted_date`, `created_at`, `updated_at`) VALUES
(1, 'Equipment Upgrade Fund', 'equipment', 'Construction Equipment', '125000000.00', 'TZS', '2026-01-31 21:00:00', '12.50', 'medium', 'active', '2028-01-31 21:00:00', '20.00', 'KashTec Capital', 'Modernize fleet to improve project delivery times and reduce maintenance costs.', 'Aligned with operational efficiency targets.', 'Finance Manager', '2026-01-31 21:00:00', '2026-07-14 23:51:53', '2026-07-14 23:51:53');

-- ----------------------------
-- Table: invoices
-- ----------------------------
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(100) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `due_date` date NOT NULL,
  `priority` varchar(50) DEFAULT 'Medium',
  `status` varchar(50) DEFAULT 'Pending',
  `submitted_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `idx_status` (`status`),
  KEY `idx_invoice_number` (`invoice_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in invoices

-- ----------------------------
-- Table: language_campaigns
-- ----------------------------
DROP TABLE IF EXISTS `language_campaigns`;
CREATE TABLE `language_campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(255) NOT NULL,
  `language_name` varchar(100) NOT NULL,
  `language_code` varchar(10) NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_units_available` int NOT NULL,
  `units_sold` int DEFAULT '0',
  `campaign_status` enum('Draft','Active','Completed','Cancelled') DEFAULT 'Draft',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `campaign_description` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaign_name` (`campaign_name`),
  KEY `idx_language_name` (`language_name`),
  KEY `idx_language_code` (`language_code`),
  KEY `idx_campaign_status` (`campaign_status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `language_campaigns_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in language_campaigns

-- ----------------------------
-- Table: language_payment_tracking
-- ----------------------------
DROP TABLE IF EXISTS `language_payment_tracking`;
CREATE TABLE `language_payment_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracking_reference` varchar(50) NOT NULL,
  `purchase_id` int DEFAULT NULL,
  `purchase_reference` varchar(50) DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `language` varchar(100) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `payment_method` enum('cash','card','bank_transfer','company_sponsored','installment') DEFAULT 'company_sponsored',
  `payment_status` enum('pending','partial','paid','refunded','cancelled') DEFAULT 'pending',
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `balance_amount` decimal(10,2) DEFAULT '0.00',
  `payment_schedule` enum('full_payment','monthly_installments','quarterly_installments','custom') DEFAULT 'full_payment',
  `total_installments` int DEFAULT '1',
  `paid_installments` int DEFAULT '0',
  `next_payment_date` date DEFAULT NULL,
  `next_payment_amount` decimal(10,2) DEFAULT NULL,
  `payment_history` json DEFAULT NULL,
  `approval_status` enum('pending_approval','approved','rejected','processed') DEFAULT 'pending_approval',
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `finance_notes` text,
  `hr_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_reference` (`tracking_reference`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_purchase` (`purchase_id`),
  KEY `idx_status` (`payment_status`,`approval_status`),
  KEY `idx_payment_date` (`next_payment_date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `language_payment_tracking` (`id`, `tracking_reference`, `purchase_id`, `purchase_reference`, `employee_id`, `employee_name`, `department`, `language`, `course_name`, `total_amount`, `currency`, `payment_method`, `payment_status`, `amount_paid`, `balance_amount`, `payment_schedule`, `total_installments`, `paid_installments`, `next_payment_date`, `next_payment_amount`, `payment_history`, `approval_status`, `approved_by`, `approved_date`, `finance_notes`, `hr_notes`, `created_at`, `updated_at`) VALUES
(1, 'LPT202605663', 2, NULL, 'EMP002', 'Jane Smith', NULL, 'Swahili', 'Swahili Communication Skills', '800.00', 'USD', 'company_sponsored', 'pending', '0.00', '800.00', 'full_payment', 1, 0, NULL, '0.00', '', 'pending_approval', NULL, NULL, NULL, NULL, '2026-05-13 07:55:55', '2026-05-13 07:55:55'),
(2, 'LPT202605940', 1, NULL, 'EMP001', 'John Doe', NULL, 'English', 'English Proficiency Program', '1500.00', 'USD', 'company_sponsored', 'pending', '0.00', '1500.00', 'full_payment', 1, 0, NULL, '0.00', '', 'pending_approval', NULL, NULL, NULL, NULL, '2026-05-13 10:04:08', '2026-05-13 10:04:08'),
(3, 'LPT202605081', 2, NULL, 'EMP002', 'Jane Smith', NULL, 'Swahili', 'Swahili Communication Skills', '800.00', 'USD', 'company_sponsored', 'pending', '0.00', '800.00', 'full_payment', 1, 0, NULL, '0.00', '', 'pending_approval', NULL, NULL, NULL, NULL, '2026-05-13 10:54:48', '2026-05-13 10:54:48'),
(4, 'LPT202605241', 3, NULL, 'EMP005', 'Robert Chen', NULL, 'English', 'English Proficiency Program', '2000.00', 'USD', 'company_sponsored', 'pending', '0.00', '2000.00', 'full_payment', 1, 0, NULL, '0.00', '', 'pending_approval', NULL, NULL, NULL, NULL, '2026-05-13 10:56:24', '2026-05-13 10:56:24');

-- ----------------------------
-- Table: language_purchases
-- ----------------------------
DROP TABLE IF EXISTS `language_purchases`;
CREATE TABLE `language_purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `buyer_name` varchar(255) NOT NULL,
  `buyer_email` varchar(255) NOT NULL,
  `buyer_phone` varchar(50) DEFAULT NULL,
  `units_purchased` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` enum('Bank Transfer','Cash','Mobile Money','Credit Card','Other') DEFAULT 'Bank Transfer',
  `buyer_address` text,
  `purchase_notes` text,
  `purchase_status` enum('Pending','Confirmed','Completed','Cancelled','Refunded') DEFAULT 'Pending',
  `purchase_date` date NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_buyer_name` (`buyer_name`),
  KEY `idx_buyer_email` (`buyer_email`),
  KEY `idx_buyer_phone` (`buyer_phone`),
  KEY `idx_purchase_status` (`purchase_status`),
  KEY `idx_purchase_date` (`purchase_date`),
  KEY `idx_payment_method` (`payment_method`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `language_purchases_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `language_campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `language_purchases_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in language_purchases

-- ----------------------------
-- Table: leadership_management
-- ----------------------------
DROP TABLE IF EXISTS `leadership_management`;
CREATE TABLE `leadership_management` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `current_holder` varchar(255) NOT NULL,
  `reports_to` varchar(255) NOT NULL,
  `leadership_level` varchar(50) NOT NULL,
  `appointment_date` date NOT NULL,
  `responsibilities` json DEFAULT NULL,
  `strategic_thinking` varchar(50) DEFAULT NULL,
  `decision_making` varchar(50) DEFAULT NULL,
  `communication_skills` varchar(50) DEFAULT NULL,
  `team_leadership` varchar(50) DEFAULT NULL,
  `succession_status` varchar(50) DEFAULT NULL,
  `potential_successors` text,
  `development_timeline` text,
  `kpis` text,
  `review_frequency` varchar(50) DEFAULT NULL,
  `last_review_date` date DEFAULT NULL,
  `notes` text,
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` date DEFAULT NULL,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  `profile_image_data` longblob,
  `profile_image_mime` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`),
  KEY `idx_submitted_date` (`submitted_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `leadership_management` (`id`, `position`, `department`, `current_holder`, `reports_to`, `leadership_level`, `appointment_date`, `responsibilities`, `strategic_thinking`, `decision_making`, `communication_skills`, `team_leadership`, `succession_status`, `potential_successors`, `development_timeline`, `kpis`, `review_frequency`, `last_review_date`, `notes`, `submitted_by`, `submitted_date`, `status`, `created_at`, `updated_at`, `profile_image`, `profile_image_data`, `profile_image_mime`) VALUES
(1, 'Chief Executive Officer', 'Executive Office', 'John Smith', 'Board of Directors', 'c-suite', '2023-12-31 21:00:00', 'strategic-planning,team-management,financial-oversight', 'expert', 'expert', 'expert', 'expert', 'identified', 'Jane Doe, Mike Johnson', '12-month development plan', 'Revenue growth, Market expansion, Team satisfaction', 'quarterly', '2024-03-14 21:00:00', 'Strategic leader with 10+ years experience', 'Managing Director', '2023-12-31 21:00:00', 'active', '2026-07-14 23:51:53', '2026-07-14 23:51:53', NULL, NULL, NULL);

-- ----------------------------
-- Table: leave_requests
-- ----------------------------
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `leave_type` enum('annual','sick','maternity','paternity','compassionate','study','unpaid') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_requested` int NOT NULL,
  `reason_for_leave` text NOT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_leave_type` (`leave_type`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_approval_status` (`approval_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `leave_requests` (`id`, `employee_id`, `employee_name`, `leave_type`, `start_date`, `end_date`, `days_requested`, `reason_for_leave`, `approval_status`, `approved_by`, `approved_date`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 'emp001', 'John Doe', 'annual', '2026-04-14 21:00:00', '2026-04-18 21:00:00', 5, 'Family vacation planned for Easter holiday', 'pending', NULL, NULL, NULL, '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(2, 'emp002', 'Jane Smith', 'sick', '2026-03-24 21:00:00', '2026-03-25 21:00:00', 2, 'Medical appointment and recovery', 'approved', 'HR Manager', NULL, NULL, '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(3, 'emp003', 'Mike Johnson', 'compassionate', '2026-03-31 21:00:00', '2026-04-01 21:00:00', 2, 'Family emergency - attending funeral', 'approved', 'HR Manager', NULL, NULL, '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(4, 'emp004', 'Sarah Wilson', 'study', '2026-05-09 21:00:00', '2026-05-11 21:00:00', 3, 'Professional development course attendance', 'pending', NULL, NULL, NULL, '2026-07-14 23:51:53', '2026-07-14 23:51:53');

-- ----------------------------
-- Table: login_audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `login_audit_logs`;
CREATE TABLE `login_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `action` varchar(50) NOT NULL DEFAULT 'login',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `status` varchar(50) NOT NULL DEFAULT 'success',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_action` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `login_audit_logs` (`id`, `user_id`, `email`, `user_name`, `role`, `department_name`, `action`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES
(1, NULL, 'fianance@manager0501', NULL, NULL, NULL, 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0', 'failed', '2026-07-14 06:04:08'),
(2, NULL, 'fianance@manager0501', NULL, NULL, NULL, 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0', 'failed', '2026-07-14 06:04:28'),
(3, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.241', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-14 06:04:42'),
(4, NULL, 'fianance@manager0501', NULL, NULL, NULL, 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0', 'failed', '2026-07-14 06:05:04'),
(5, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0', 'success', '2026-07-14 06:05:14'),
(6, NULL, 'finance@managwr0501', NULL, NULL, NULL, 'login', '152.233.13.166', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36', 'failed', '2026-07-14 07:20:43'),
(7, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '152.233.13.166', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36', 'success', '2026-07-14 07:20:54'),
(8, 1, 'md@kashtec.com', 'manager', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-14 10:16:30'),
(9, 8, 'assistant@kashtec.com', 'Admin Assistant', 'Admin Assistant', 'Administration', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-14 23:53:35'),
(10, NULL, 'bray@gmail.com', NULL, NULL, NULL, 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-15 00:06:44'),
(11, NULL, 'bray@gmail.com', NULL, NULL, NULL, 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-15 00:06:51'),
(12, NULL, 'bray@gmail.com', NULL, NULL, NULL, 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-15 00:06:53'),
(13, NULL, 'bray@gmail.com', NULL, NULL, NULL, 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-15 00:06:58'),
(14, NULL, 'bray@gmail.com', NULL, NULL, NULL, 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-15 00:07:00'),
(15, 6, 'pm@manager0501', 'Technical12', 'Project Manager', 'Project', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-15 00:20:41'),
(16, 8, 'assistant@kashtec.com', 'Admin Assistant', 'Admin Assistant', 'Administration', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 00:20:58'),
(17, 4, 'hse@manager0501', 'HSE Manager', 'HSE Manager', 'Health & Safety', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 00:21:40'),
(18, 4, 'hse@manager0501', 'HSE Manager', 'HSE Manager', 'Health & Safety', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 00:58:36'),
(19, 1, 'md@kashtec.com', 'manager', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 00:59:43'),
(20, 7816, 'realestate@manager0502', 'chrispin', 'Real Estate Manager', 'Real Estate', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 01:03:52'),
(21, 1, 'md@kashtec.com', 'manager', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 01:31:30'),
(22, 7816, 'realestate@manager0502', 'chrispin', 'Real Estate Manager', 'Real Estate', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 01:32:42'),
(23, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-15 02:21:51'),
(24, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-15 02:21:59'),
(25, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-15 02:24:34'),
(26, 1, 'md@kashtec.com', 'manager', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 12:17:06'),
(27, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 12:18:43'),
(28, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 12:39:58'),
(29, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-15 13:05:47'),
(30, 1, 'md@kashtec.com', 'manager', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 03:01:32'),
(31, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', 'success', '2026-07-16 03:15:56'),
(32, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.241', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-16 04:15:37'),
(33, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.241', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-16 04:19:19'),
(34, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 04:50:26'),
(35, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 04:58:48'),
(36, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 05:04:03'),
(37, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 05:17:21'),
(38, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 05:41:06'),
(39, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 05:47:04'),
(40, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 05:48:16'),
(41, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 05:53:24'),
(42, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 05:56:32'),
(43, NULL, 'K.M. kayungilo', NULL, NULL, NULL, 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-16 05:57:02'),
(44, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 05:57:21'),
(45, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:09:00'),
(46, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:10:28'),
(47, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:15:04'),
(48, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:20:53'),
(49, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:21:51'),
(50, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-16 06:27:19'),
(51, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-16 06:28:49'),
(52, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:41:49'),
(53, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:42:31'),
(54, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:53:17'),
(55, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:54:00'),
(56, 8, 'assistant@kashtec.com', 'Admin Assistant', 'Admin Assistant', 'Administration', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 06:59:21'),
(57, 2, 'admin@kashtec.com', 'Director of Administration', 'Director of Administration', 'Administration', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 07:00:43'),
(58, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 07:16:25'),
(59, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 07:59:01'),
(60, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 07:59:50'),
(61, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 08:21:33'),
(62, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 08:27:32'),
(63, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 08:29:42'),
(64, NULL, 'latifaidd20@gmail.comL', NULL, NULL, NULL, 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'failed', '2026-07-16 08:50:21'),
(65, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 08:50:31'),
(66, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-16 09:26:43'),
(67, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.68.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'success', '2026-07-16 10:17:51'),
(68, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 10:29:03'),
(69, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 11:04:33'),
(70, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 11:13:05'),
(71, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 13:11:22'),
(72, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 13:12:04'),
(73, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 14:37:49'),
(74, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 17:04:50'),
(75, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-16 18:50:44'),
(76, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 03:00:40'),
(77, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 04:02:31'),
(78, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 04:30:15'),
(79, 7, 'realestate@manager0501', 'Real Estate Manager', 'Real Estate Manager', 'Real Estate', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-17 04:32:12'),
(80, 7, 'realestate@manager0501', 'Real Estate Manager', 'Real Estate Manager', 'Real Estate', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 04:32:42'),
(81, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 04:58:01'),
(82, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 07:59:17'),
(83, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'failed', '2026-07-17 08:09:43'),
(84, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 08:09:54'),
(85, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-17 12:22:58'),
(86, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 16:25:35'),
(87, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 16:25:46'),
(88, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 22:55:36'),
(89, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 23:03:39'),
(90, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-17 23:04:18'),
(91, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-18 05:12:53'),
(92, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-18 06:49:06'),
(93, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-18 07:22:01'),
(94, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-18 08:00:33'),
(95, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.241', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-18 12:13:02'),
(96, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.241', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-18 12:14:26'),
(97, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-18 16:59:14'),
(98, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-18 18:37:32'),
(99, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-18 18:40:48'),
(100, NULL, 'Technical12', NULL, NULL, NULL, 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'failed', '2026-07-18 18:41:34');

INSERT INTO `login_audit_logs` (`id`, `user_id`, `email`, `user_name`, `role`, `department_name`, `action`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES
(101, 5, 'finance@manager0501', 'farhaothman', 'Finance Manager', 'Finance', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'failed', '2026-07-18 18:41:58'),
(102, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-18 18:42:52'),
(103, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-19 03:59:42'),
(104, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '46.151.193.242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', 'success', '2026-07-19 05:44:15'),
(105, 1, 'kashtectz@gmail.com', 'K.M. kayungilo', 'Managing Director', 'Managing Director', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-19 06:14:35'),
(106, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '152.233.15.120', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-19 06:15:03'),
(107, 7662, 'latifaidd20@gmail.com', 'latifa', 'HR Manager', 'HR', 'login', '46.151.193.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'success', '2026-07-19 06:57:54');

-- ----------------------------
-- Table: long_term_growth
-- ----------------------------
DROP TABLE IF EXISTS `long_term_growth`;
CREATE TABLE `long_term_growth` (
  `id` int NOT NULL AUTO_INCREMENT,
  `growth_title` varchar(255) NOT NULL,
  `growth_category` varchar(100) NOT NULL,
  `timeframe` varchar(50) NOT NULL,
  `target_markets` json DEFAULT NULL,
  `expansion_strategy` text,
  `investment_requirements` text,
  `risk_assessment` text,
  `milestones` json DEFAULT NULL,
  `success_metrics` text,
  `implementation_plan` text,
  `notes` text,
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` date DEFAULT NULL,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_growth_category` (`growth_category`),
  KEY `idx_submitted_date` (`submitted_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `long_term_growth` (`id`, `growth_title`, `growth_category`, `timeframe`, `target_markets`, `expansion_strategy`, `investment_requirements`, `risk_assessment`, `milestones`, `success_metrics`, `implementation_plan`, `notes`, `submitted_by`, `submitted_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'East African Expansion Strategy', 'market-expansion', '5-years', 'Kenya,Uganda,Rwanda,Burundi,South Sudan', 'Strategic partnerships with local construction firms, government infrastructure projects, commercial real estate development', 'USD 50M for equipment, partnerships, and local operations setup', 'Political stability, currency fluctuations, regulatory compliance, local competition', 'Year 1: Market research and partnerships,Year 1-3: Project acquisition,Year 4-6: Scale operations', 'Market share growth, revenue targets, project completion rates, local employment creation', 'Phase 1: Research and partnerships, Phase 2: Pilot projects, Phase 3: Scale operations', 'Aligned with company vision to become East Africa\'s leading construction company', 'Managing Director', '2023-12-31 21:00:00', 'active', '2026-07-14 23:51:53', '2026-07-14 23:51:53');

-- ----------------------------
-- Table: luggage_campaigns
-- ----------------------------
DROP TABLE IF EXISTS `luggage_campaigns`;
CREATE TABLE `luggage_campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(255) NOT NULL,
  `luggage_name` varchar(100) NOT NULL,
  `luggage_code` varchar(10) NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_units_available` int NOT NULL DEFAULT '0',
  `units_sold` int DEFAULT '0',
  `campaign_status` enum('Draft','Active','Completed','Cancelled') DEFAULT 'Draft',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `campaign_description` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_units` int NOT NULL DEFAULT '0',
  `description` text,
  `status` enum('planning','active','completed','cancelled') DEFAULT 'planning',
  PRIMARY KEY (`id`),
  KEY `idx_campaign_name` (`campaign_name`),
  KEY `idx_luggage_name` (`luggage_name`),
  KEY `idx_luggage_code` (`luggage_code`),
  KEY `idx_campaign_status` (`campaign_status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `luggage_campaigns_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in luggage_campaigns

-- ----------------------------
-- Table: luggage_payment_tracking
-- ----------------------------
DROP TABLE IF EXISTS `luggage_payment_tracking`;
CREATE TABLE `luggage_payment_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracking_reference` varchar(50) NOT NULL,
  `purchase_id` int DEFAULT NULL,
  `purchase_reference` varchar(50) DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `luggage` varchar(100) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `total_amount` decimal(20,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `payment_method` enum('cash','card','bank_transfer','company_sponsored','installment') DEFAULT 'company_sponsored',
  `payment_status` enum('pending','partial','paid','refunded','cancelled') DEFAULT 'pending',
  `amount_paid` decimal(20,2) NOT NULL,
  `balance_amount` decimal(20,2) NOT NULL,
  `payment_schedule` enum('full_payment','monthly_installments','quarterly_installments','custom') DEFAULT 'full_payment',
  `total_installments` int DEFAULT '1',
  `paid_installments` int DEFAULT '0',
  `next_payment_date` date DEFAULT NULL,
  `next_payment_amount` decimal(20,2) DEFAULT NULL,
  `payment_history` json DEFAULT NULL,
  `approval_status` enum('pending_approval','approved','rejected','processed') DEFAULT 'pending_approval',
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `finance_notes` text,
  `hr_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_stage` varchar(100) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `bank_reference` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `notes` text,
  `payment_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_reference` (`tracking_reference`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_purchase` (`purchase_id`),
  KEY `idx_status` (`payment_status`,`approval_status`),
  KEY `idx_payment_date` (`next_payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in luggage_payment_tracking

-- ----------------------------
-- Table: luggage_purchases
-- ----------------------------
DROP TABLE IF EXISTS `luggage_purchases`;
CREATE TABLE `luggage_purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `buyer_name` varchar(255) NOT NULL,
  `buyer_email` varchar(255) NOT NULL,
  `buyer_phone` varchar(50) DEFAULT NULL,
  `luggage_name` varchar(100) DEFAULT NULL,
  `units_purchased` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` enum('Bank Transfer','Cash','Mobile Money','Credit Card','Other') DEFAULT 'Bank Transfer',
  `buyer_address` text,
  `purchase_notes` text,
  `purchase_status` enum('Pending','Confirmed','Completed','Cancelled','Refunded') DEFAULT 'Pending',
  `purchase_date` date NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_buyer_name` (`buyer_name`),
  KEY `idx_buyer_email` (`buyer_email`),
  KEY `idx_buyer_phone` (`buyer_phone`),
  KEY `idx_purchase_status` (`purchase_status`),
  KEY `idx_purchase_date` (`purchase_date`),
  KEY `idx_payment_method` (`payment_method`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `luggage_purchases_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `luggage_campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `luggage_purchases_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in luggage_purchases

-- ----------------------------
-- Table: materials
-- ----------------------------
DROP TABLE IF EXISTS `materials`;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `track_number` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `description` text,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_track_number` (`track_number`),
  KEY `created_by` (`created_by`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in materials

-- ----------------------------
-- Table: materials_in
-- ----------------------------
DROP TABLE IF EXISTS `materials_in`;
CREATE TABLE `materials_in` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `track_number` varchar(100) NOT NULL,
  `receipt_date` date NOT NULL,
  `quantity_received` decimal(12,2) NOT NULL,
  `unit_of_measure` enum('Bag','KG','Ton','Piece','Meter','Square Meter','Cubic Meter','Liter','Roll','Box','Set','Sheet') DEFAULT 'Piece',
  `unit_price` decimal(12,2) NOT NULL,
  `total_cost` decimal(15,2) NOT NULL,
  `transport_cost` decimal(12,2) DEFAULT '0.00',
  `transport_issue` text,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_contact` varchar(255) DEFAULT NULL,
  `supplier_tin` varchar(50) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `purchase_order_number` varchar(100) DEFAULT NULL,
  `delivery_note_number` varchar(100) DEFAULT NULL,
  `delivery_condition` enum('Good','Damaged','Partial','Rejected') DEFAULT 'Good',
  `quality_check_status` enum('Pending','Passed','Failed','Conditional') DEFAULT 'Pending',
  `quality_remarks` text,
  `received_by` varchar(255) NOT NULL,
  `received_by_role` varchar(100) DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `warehouse_location` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `track_number` (`track_number`),
  KEY `created_by` (`created_by`),
  KEY `idx_track_number` (`track_number`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_receipt_date` (`receipt_date`),
  KEY `idx_supplier_name` (`supplier_name`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_quality_status` (`quality_check_status`),
  CONSTRAINT `materials_in_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials_inventory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `materials_in_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `materials_in_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in materials_in

-- ----------------------------
-- Table: materials_inventory
-- ----------------------------
DROP TABLE IF EXISTS `materials_inventory`;
CREATE TABLE `materials_inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `material_category` enum('Cement','Sand','Gravel','Steel/Rebar','Bricks','Blocks','Timber','Pipes','Electrical','Paint','Roofing','Tiles','Glass','Hardware','Tools','Safety Equipment','Other') DEFAULT 'Other',
  `description` text,
  `unit_of_measure` enum('Bag','KG','Ton','Piece','Meter','Square Meter','Cubic Meter','Liter','Roll','Box','Set','Sheet') DEFAULT 'Piece',
  `current_stock` decimal(12,2) DEFAULT '0.00',
  `min_stock_level` decimal(12,2) DEFAULT '10.00',
  `max_stock_level` decimal(12,2) DEFAULT '1000.00',
  `reorder_point` decimal(12,2) DEFAULT '50.00',
  `storage_location` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `supplier_contact` varchar(255) DEFAULT NULL,
  `unit_cost` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Discontinued','Out of Stock','Low Stock') DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_code` (`material_code`),
  KEY `created_by` (`created_by`),
  KEY `idx_material_code` (`material_code`),
  KEY `idx_material_name` (`material_name`),
  KEY `idx_category` (`material_category`),
  KEY `idx_status` (`status`),
  KEY `idx_storage_location` (`storage_location`),
  CONSTRAINT `materials_inventory_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in materials_inventory

-- ----------------------------
-- Table: materials_out
-- ----------------------------
DROP TABLE IF EXISTS `materials_out`;
CREATE TABLE `materials_out` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `track_number` varchar(100) NOT NULL,
  `issue_date` date NOT NULL,
  `quantity_out` decimal(12,2) NOT NULL,
  `unit_of_measure` enum('Bag','KG','Ton','Piece','Meter','Square Meter','Cubic Meter','Liter','Roll','Box','Set','Sheet') DEFAULT 'Piece',
  `unit_price` decimal(12,2) DEFAULT '0.00',
  `total_value` decimal(15,2) DEFAULT '0.00',
  `issue_type` enum('Project Use','Sale','Transfer','Waste','Damage','Return to Supplier') DEFAULT 'Project Use',
  `issued_to` varchar(255) NOT NULL,
  `issued_to_role` varchar(100) DEFAULT NULL,
  `issued_to_department` enum('Management','Human Resources','Finance','Project Management','Real Estate','Health & Safety','Administrative','Workers','Clients','External') DEFAULT 'Project Management',
  `project_id` int DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `purpose` text,
  `authorized_by` varchar(255) NOT NULL,
  `authorized_by_role` varchar(100) DEFAULT NULL,
  `delivery_method` enum('Company Vehicle','Supplier Delivery','Third Party','Self Pickup') DEFAULT 'Company Vehicle',
  `delivery_receipt_number` varchar(100) DEFAULT NULL,
  `condition_on_issue` enum('New','Good','Fair','Damaged') DEFAULT 'New',
  `return_expected` tinyint(1) DEFAULT '0',
  `expected_return_date` date DEFAULT NULL,
  `actual_return_date` date DEFAULT NULL,
  `return_condition` enum('Good','Damaged','Partial','Not Returned') DEFAULT 'Not Returned',
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `track_number` (`track_number`),
  KEY `created_by` (`created_by`),
  KEY `idx_track_number` (`track_number`),
  KEY `idx_material_id` (`material_id`),
  KEY `idx_issue_date` (`issue_date`),
  KEY `idx_issue_type` (`issue_type`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_issued_to` (`issued_to`),
  CONSTRAINT `materials_out_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials_inventory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `materials_out_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `materials_out_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in materials_out

-- ----------------------------
-- Table: meeting_minutes
-- ----------------------------
DROP TABLE IF EXISTS `meeting_minutes`;
CREATE TABLE `meeting_minutes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meeting_id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `meeting_date` date NOT NULL,
  `meeting_time` time DEFAULT NULL,
  `attendees` text,
  `minutes_content` text,
  `action_items` text,
  `decisions` text,
  `next_steps` text,
  `created_by` varchar(255) DEFAULT NULL,
  `status` enum('draft','submitted','approved','archived') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meeting_id` (`meeting_id`),
  KEY `idx_meeting_date` (`meeting_date`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in meeting_minutes

-- ----------------------------
-- Table: mission_vision
-- ----------------------------
DROP TABLE IF EXISTS `mission_vision`;
CREATE TABLE `mission_vision` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mission_statement` text NOT NULL,
  `mission_category` varchar(100) DEFAULT NULL,
  `mission_last_reviewed` date DEFAULT NULL,
  `vision_statement` text NOT NULL,
  `vision_timeframe` varchar(50) DEFAULT NULL,
  `vision_last_reviewed` date DEFAULT NULL,
  `core_values` json DEFAULT NULL,
  `additional_values` text,
  `short_term_objectives` text,
  `long_term_objectives` text,
  `stakeholder_focus` json DEFAULT NULL,
  `communication_strategy` text,
  `integration_strategy` text,
  `review_frequency` varchar(50) DEFAULT NULL,
  `next_review_date` date DEFAULT NULL,
  `success_metrics` text,
  `notes` text,
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` date DEFAULT NULL,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_submitted_date` (`submitted_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `mission_vision` (`id`, `mission_statement`, `mission_category`, `mission_last_reviewed`, `vision_statement`, `vision_timeframe`, `vision_last_reviewed`, `core_values`, `additional_values`, `short_term_objectives`, `long_term_objectives`, `stakeholder_focus`, `communication_strategy`, `integration_strategy`, `review_frequency`, `next_review_date`, `success_metrics`, `notes`, `submitted_by`, `submitted_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'To deliver exceptional construction services that exceed client expectations through innovation, quality craftsmanship, and sustainable practices.', 'quality', '2024-03-14 21:00:00', 'To become East Africa\'s leading construction company known for sustainable development, innovative solutions, and community impact.', '10-years', '2024-03-14 21:00:00', 'integrity,excellence,innovation,teamwork,customer-focus', 'Continuous learning and environmental stewardship', 'Expand operations to 3 new regions, achieve 20% revenue growth', 'Establish presence in 5 African countries, become carbon neutral', 'customers,employees,community,environment', 'Quarterly town halls, monthly newsletters, intranet portal', 'Performance reviews aligned with values, training programs', 'annual', '2025-03-14 21:00:00', 'Client satisfaction scores, employee engagement, revenue growth, environmental impact', 'Mission and vision reviewed and approved by board of directors', 'Managing Director', '2023-12-31 21:00:00', 'active', '2026-07-14 23:51:53', '2026-07-14 23:51:53');

-- ----------------------------
-- Table: nhif_contributions
-- ----------------------------
DROP TABLE IF EXISTS `nhif_contributions`;
CREATE TABLE `nhif_contributions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `contribution_month` date NOT NULL,
  `employee_contribution` decimal(10,2) NOT NULL,
  `employer_contribution` decimal(10,2) NOT NULL,
  `total_contribution` decimal(10,2) NOT NULL,
  `payment_status` enum('Pending','Paid','Overdue') DEFAULT 'Pending',
  `payment_date` date DEFAULT NULL,
  `receipt_number` varchar(100) DEFAULT NULL,
  `submitted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_contribution_month` (`contribution_month`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `nhif_contributions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `nhif_contributions_ibfk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `nhif_contributions_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in nhif_contributions

-- ----------------------------
-- Table: notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'Info',
  `recipient_id` int DEFAULT NULL,
  `recipient_role` varchar(100) DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `related_type` varchar(100) DEFAULT NULL,
  `related_id` int DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `priority` varchar(50) DEFAULT 'Medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `recipient_type` enum('all','department','role','individual') DEFAULT 'all',
  `recipients` text,
  `sent_by` varchar(255) DEFAULT 'System',
  `status` enum('sent','scheduled','draft','failed') DEFAULT 'sent',
  `read_rate` decimal(5,2) DEFAULT '0.00',
  `sent_date` date DEFAULT NULL,
  `scheduled_date` datetime DEFAULT NULL,
  `category` varchar(50) DEFAULT 'system',
  `department` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_read` (`is_read`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notifications` (`id`, `title`, `message`, `type`, `recipient_id`, `recipient_role`, `sender_id`, `related_type`, `related_id`, `reference_id`, `reference_type`, `is_read`, `priority`, `created_at`, `updated_at`, `recipient_type`, `recipients`, `sent_by`, `status`, `read_rate`, `sent_date`, `scheduled_date`, `category`, `department`) VALUES
(1, 'Safety Update', 'Project safety table initialized with 0 records', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 00:21:48', '2026-07-15 00:21:48', 'role', 'MD', 'HSE Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(2, 'Safety Update', 'Project safety table initialized with 0 records', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 00:58:45', '2026-07-15 00:58:45', 'role', 'MD', 'HSE Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(3, 'Document Update', 'New document uploaded: Safety Policy - LEADERSHIP', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 00:59:17', '2026-07-15 00:59:17', 'role', 'MD', 'Admin Assistant', 'sent', '0.00', NULL, NULL, 'md', NULL),
(4, 'New Employee Registered', 'New employee LATIFA IDD SHABAN has been registered in hr department as hr.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 02:36:30', '2026-07-15 02:36:30', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(5, 'HR Update', 'New employee "LATIFA IDD SHABAN" registered in hr department as hr', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 02:36:30', '2026-07-15 02:36:30', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(6, 'New Employee Registered', 'New employee FARHA OTHMAN DUNGA has been registered in finance department as finance.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 02:52:23', '2026-07-15 02:52:23', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(7, 'HR Update', 'New employee "FARHA OTHMAN DUNGA" registered in finance department as finance', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 02:52:23', '2026-07-15 02:52:23', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(8, 'New Employee Registered', 'New employee ZUBEDA KOMBO NOTI has been registered in finance department as finance.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 02:56:01', '2026-07-15 02:56:01', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(9, 'HR Update', 'New employee "ZUBEDA KOMBO NOTI" registered in finance department as finance', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 02:56:01', '2026-07-15 02:56:01', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(10, 'New Employee Registered', 'New employee HAMIDA SELEMANI ISSA has been registered in admin department as admin.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 03:02:48', '2026-07-15 03:02:48', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(11, 'HR Update', 'New employee "HAMIDA SELEMANI ISSA" registered in admin department as admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-15 03:02:48', '2026-07-15 03:02:48', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(12, 'New Employee Registered', 'New employee MFAUME MOHAMED SENGE has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:03:07', '2026-07-16 05:03:07', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(13, 'HR Update', 'New employee "MFAUME MOHAMED SENGE" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:03:07', '2026-07-16 05:03:07', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(14, 'New Employee Registered', 'New employee KAYIKU MOTO KAYUNGILO has been registered in projects department as management.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:08:36', '2026-07-16 05:08:36', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(15, 'HR Update', 'New employee "KAYIKU MOTO KAYUNGILO" registered in projects department as management', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:08:36', '2026-07-16 05:08:36', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(16, 'New Employee Registered', 'New employee ATHANAS KALIKITI DANIEL has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:11:23', '2026-07-16 05:11:23', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(17, 'HR Update', 'New employee "ATHANAS KALIKITI DANIEL" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:11:23', '2026-07-16 05:11:23', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(18, 'Employee Updated', 'Employee #6 updated - KAYIKU MOTO KAYUNGILO', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Medium', '2026-07-16 05:21:17', '2026-07-16 05:29:43', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(19, 'HR Update', 'Employee record updated: KAYIKU MOTO KAYUNGILO in projects', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:21:17', '2026-07-16 05:21:17', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(20, 'Employee Deleted', 'Employee #6 removed from system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Medium', '2026-07-16 05:23:11', '2026-07-16 05:29:49', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(21, 'HR Update', 'Employee #6 has been deleted from the system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:23:11', '2026-07-16 05:23:11', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(22, 'New Employee Registered', 'New employee CELVIN KONGO STEVEN WARIOBA has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:52:45', '2026-07-16 05:52:45', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(23, 'HR Update', 'New employee "CELVIN KONGO STEVEN WARIOBA" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:52:45', '2026-07-16 05:52:45', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(24, 'New Employee Registered', 'New employee Chrispin Golden has been registered in admin department as it.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:54:26', '2026-07-16 05:54:26', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(25, 'HR Update', 'New employee "Chrispin Golden" registered in admin department as it', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:54:26', '2026-07-16 05:54:26', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(26, 'Employee Updated', 'Employee #9 updated - Chrispin Golden', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:55:24', '2026-07-16 05:55:24', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(27, 'HR Update', 'Employee record updated: Chrispin Golden in admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 05:55:24', '2026-07-16 05:55:24', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(28, 'New Employee Registered', 'New employee brayan has been registered in hse department as it.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:01:27', '2026-07-16 06:01:27', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(29, 'HR Update', 'New employee "brayan" registered in hse department as it', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:01:27', '2026-07-16 06:01:27', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(30, 'Employee Updated', 'Employee #9 updated - Chrispin Golden', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:09:31', '2026-07-16 06:09:31', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(31, 'HR Update', 'Employee record updated: Chrispin Golden in admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:09:31', '2026-07-16 06:09:31', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(32, 'Employee Updated', 'Employee #9 updated - Chrispin Golden', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:21:24', '2026-07-16 06:21:24', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(33, 'HR Update', 'Employee record updated: Chrispin Golden in admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:21:24', '2026-07-16 06:21:24', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(34, 'Employee Updated', 'Employee #9 updated - Chrispin Golden', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:42:18', '2026-07-16 06:42:18', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(35, 'HR Update', 'Employee record updated: Chrispin Golden in admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:42:18', '2026-07-16 06:42:18', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(36, 'New Employee Registered', 'New employee grayson has been registered in hse department as it.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:43:52', '2026-07-16 06:43:52', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(37, 'HR Update', 'New employee "grayson" registered in hse department as it', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:43:52', '2026-07-16 06:43:52', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(38, 'Employee Updated', 'Employee #9 updated - Chrispin Golden', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:45:57', '2026-07-16 06:45:57', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(39, 'HR Update', 'Employee record updated: Chrispin Golden in admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:45:57', '2026-07-16 06:45:57', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(40, 'Employee Updated', 'Employee #9 updated - Chrispin Golden', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:53:47', '2026-07-16 06:53:47', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(41, 'HR Update', 'Employee record updated: Chrispin Golden in admin', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 06:53:47', '2026-07-16 06:53:47', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(42, 'Employee Deleted', 'Employee #9 removed from system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 07:04:56', '2026-07-16 07:04:56', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(43, 'HR Update', 'Employee #9 has been deleted from the system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 07:04:56', '2026-07-16 07:04:56', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(44, 'Employee Deleted', 'Employee #10 removed from system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 07:05:20', '2026-07-16 07:05:20', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(45, 'HR Update', 'Employee #10 has been deleted from the system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 07:05:20', '2026-07-16 07:05:20', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(46, 'Employee Deleted', 'Employee #11 removed from system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 07:05:31', '2026-07-16 07:05:31', 'all', 'system', 'System', 'sent', '0.00', NULL, NULL, 'system', NULL),
(47, 'HR Update', 'Employee #11 has been deleted from the system', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 07:05:31', '2026-07-16 07:05:31', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(48, 'New Employee Registered', 'New employee KAYIKU MOTO KAYUNGILO has been registered in projects department as management.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 08:46:12', '2026-07-16 08:46:12', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(49, 'HR Update', 'New employee "KAYIKU MOTO KAYUNGILO" registered in projects department as management', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 08:46:12', '2026-07-16 08:46:12', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(50, 'New Employee Registered', 'New employee SELEMAN SAID MTAUNI has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 08:54:52', '2026-07-16 08:54:52', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(51, 'HR Update', 'New employee "SELEMAN SAID MTAUNI" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 08:54:52', '2026-07-16 08:54:52', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(52, 'New Employee Registered', 'New employee KILONGE AZIZ KILONGE has been registered in hse department as hse.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:03:54', '2026-07-16 09:03:54', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(53, 'HR Update', 'New employee "KILONGE AZIZ KILONGE" registered in hse department as hse', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:03:54', '2026-07-16 09:03:54', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(54, 'New Employee Registered', 'New employee RITTA DEUS MLEMINGWA has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:08:57', '2026-07-16 09:08:57', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(55, 'HR Update', 'New employee "RITTA DEUS MLEMINGWA" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:08:57', '2026-07-16 09:08:57', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(56, 'New Employee Registered', 'New employee SOLOMON ZEPHANIA NDULU has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:13:09', '2026-07-16 09:13:09', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(57, 'HR Update', 'New employee "SOLOMON ZEPHANIA NDULU" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:13:09', '2026-07-16 09:13:09', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(58, 'New Employee Registered', 'New employee HERIETH EMMANUEL MASHAMBA has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:40:12', '2026-07-16 09:40:12', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(59, 'HR Update', 'New employee "HERIETH EMMANUEL MASHAMBA" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:40:12', '2026-07-16 09:40:12', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(60, 'New Employee Registered', 'New employee DENIS JOHN MUSHI has been registered in projects department as engineering.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:49:31', '2026-07-16 09:49:31', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(61, 'HR Update', 'New employee "DENIS JOHN MUSHI" registered in projects department as engineering', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 09:49:31', '2026-07-16 09:49:31', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(62, 'New Employee Registered', 'New employee JUMA KINGU MALEKELA has been registered in projects department as driver.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 10:20:22', '2026-07-16 10:20:22', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(63, 'HR Update', 'New employee "JUMA KINGU MALEKELA" registered in projects department as driver', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 10:20:22', '2026-07-16 10:20:22', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(64, 'New Employee Registered', 'New employee AMINA ABDALLAH MPILI has been registered in projects department as construction.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 10:30:34', '2026-07-16 10:30:34', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(65, 'HR Update', 'New employee "AMINA ABDALLAH MPILI" registered in projects department as construction', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 10:30:34', '2026-07-16 10:30:34', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL),
(66, 'New Employee Registered', 'New employee PATSON AUGUSTINO MALLYA has been registered in projects department as engineering.', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 10:35:52', '2026-07-16 10:35:52', 'role', 'hr', 'System', 'sent', '0.00', NULL, NULL, 'hr', NULL),
(67, 'HR Update', 'New employee "PATSON AUGUSTINO MALLYA" registered in projects department as engineering', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Medium', '2026-07-16 10:35:52', '2026-07-16 10:35:52', 'role', 'MD', 'HR Department', 'sent', '0.00', NULL, NULL, 'md', NULL);

-- ----------------------------
-- Table: nssf_registration
-- ----------------------------
DROP TABLE IF EXISTS `nssf_registration`;
CREATE TABLE `nssf_registration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_number` varchar(50) NOT NULL,
  `employee_id` int NOT NULL,
  `nssf_number` varchar(50) NOT NULL,
  `registration_date` date NOT NULL,
  `employer_contribution_rate` decimal(5,2) DEFAULT '10.00',
  `employee_contribution_rate` decimal(5,2) DEFAULT '10.00',
  `monthly_salary` decimal(12,2) DEFAULT NULL,
  `monthly_contribution` decimal(12,2) DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended','Terminated') DEFAULT 'Active',
  `registration_certificate` varchar(255) DEFAULT NULL,
  `last_contribution_date` date DEFAULT NULL,
  `total_contributions` decimal(15,2) DEFAULT '0.00',
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  UNIQUE KEY `nssf_number` (`nssf_number`),
  KEY `created_by` (`created_by`),
  KEY `idx_registration_number` (`registration_number`),
  KEY `idx_nssf_number` (`nssf_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `nssf_registration_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nssf_registration_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in nssf_registration

-- ----------------------------
-- Table: nssf_registrations
-- ----------------------------
DROP TABLE IF EXISTS `nssf_registrations`;
CREATE TABLE `nssf_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `nssf_number` varchar(50) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `contribution_rate` decimal(5,2) DEFAULT '20.00',
  `employer_contribution` decimal(12,2) DEFAULT '0.00',
  `employee_contribution` decimal(12,2) DEFAULT '0.00',
  `total_contribution` decimal(12,2) DEFAULT '0.00',
  `status` enum('Active','Inactive','Suspended','Closed') DEFAULT 'Active',
  `registered_by` int DEFAULT NULL,
  `last_contribution_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nssf_number` (`nssf_number`),
  KEY `registered_by` (`registered_by`),
  KEY `idx_nssf_number` (`nssf_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `nssf_registrations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nssf_registrations_ibfk_2` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in nssf_registrations

-- ----------------------------
-- Table: office_portal
-- ----------------------------
DROP TABLE IF EXISTS `office_portal`;
CREATE TABLE `office_portal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) NOT NULL,
  `department_code` varchar(50) NOT NULL,
  `manager_email` varchar(255) DEFAULT NULL,
  `description` text,
  `settings` json DEFAULT NULL,
  `status` enum('Active','Inactive','Maintenance') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `department_code` (`department_code`),
  KEY `idx_department_code` (`department_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `office_portal` (`id`, `department_name`, `department_code`, `manager_email`, `description`, `settings`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Human Resources', 'HR', 'hr@manager0501', 'HR Department manages employee relations, recruitment, training, and compliance', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(2, 'Project Management', 'PM', 'pm@manager0501', 'Project Management oversees all construction projects, timelines, and resource allocation', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(3, 'Finance', 'FINANCE', 'finance@manager0501', 'Finance Department handles budgeting, accounting, and financial reporting', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(4, 'Operations', 'OPS', 'operations@manager0501', 'Operations Department manages daily operations, logistics, and field coordination', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(5, 'Real Estate', 'REALESTATE', 'realestate@manager0501', 'Real Estate Department handles property acquisitions, sales, and facility management', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(6, 'Health & Safety', 'HSE', 'hse@manager0501', 'HSE Department ensures workplace safety, compliance, and incident reporting', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53'),
(7, 'Administration', 'ADMIN', 'admin@kashtec.com', 'System Administration provides IT support, user management, and system configuration', '[object Object]', 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53');

-- ----------------------------
-- Table: office_resources
-- ----------------------------
DROP TABLE IF EXISTS `office_resources`;
CREATE TABLE `office_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_code` varchar(50) NOT NULL,
  `resource_name` varchar(255) NOT NULL,
  `resource_type` enum('Computer','Printer','Desk','Chair','Phone','Vehicle','Equipment','Software License','Office Supplies','Other') NOT NULL,
  `description` text,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(12,2) DEFAULT NULL,
  `current_value` decimal(12,2) DEFAULT NULL,
  `condition` enum('New','Good','Fair','Poor','Damaged') DEFAULT 'Good',
  `location` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` enum('Available','Assigned','In Maintenance','Retired','Lost') DEFAULT 'Available',
  `assigned_to` int DEFAULT NULL,
  `assigned_date` date DEFAULT NULL,
  `expected_return_date` date DEFAULT NULL,
  `actual_return_date` date DEFAULT NULL,
  `return_condition` enum('New','Good','Fair','Poor','Damaged') DEFAULT NULL,
  `maintenance_notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `resource_code` (`resource_code`),
  KEY `created_by` (`created_by`),
  KEY `idx_resource_code` (`resource_code`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`),
  CONSTRAINT `office_resources_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `office_resources_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in office_resources

-- ----------------------------
-- Table: payment_attachments
-- ----------------------------
DROP TABLE IF EXISTS `payment_attachments`;
CREATE TABLE `payment_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `description` text,
  `uploaded_by` int NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_uploaded_at` (`uploaded_at`),
  CONSTRAINT `payment_attachments_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payment_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payment_attachments

-- ----------------------------
-- Table: payment_history
-- ----------------------------
DROP TABLE IF EXISTS `payment_history`;
CREATE TABLE `payment_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `status` enum('pending_finance_approval','approved','rejected','processed','paid','cancelled') NOT NULL,
  `changed_by` int NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_status` (`status`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payment_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payment_history

-- ----------------------------
-- Table: payment_requests
-- ----------------------------
DROP TABLE IF EXISTS `payment_requests`;
CREATE TABLE `payment_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(50) NOT NULL,
  `employee_id` int NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `employee_email` varchar(255) NOT NULL,
  `employee_phone` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` enum('TZS','USD') DEFAULT 'TZS',
  `equivalent_amount_tzs` decimal(15,2) NOT NULL,
  `exchange_rate` decimal(10,6) DEFAULT '1.000000',
  `description` text NOT NULL,
  `notes` text,
  `payment_type` enum('salary','bonus','allowance','reimbursement','overtime','commission','severance','other') DEFAULT 'salary',
  `urgency` enum('low','normal','high','urgent') DEFAULT 'normal',
  `payment_method` enum('bank_transfer','mobile_money','cash','cheque') DEFAULT 'bank_transfer',
  `expected_payment_date` date DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `project_code` varchar(50) DEFAULT NULL,
  `work_order_number` varchar(100) DEFAULT NULL,
  `status` enum('pending_finance_approval','approved','rejected','processed','paid','cancelled') DEFAULT 'pending_finance_approval',
  `approved_by` int DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `finance_notes` text,
  `payment_reference` varchar(100) DEFAULT NULL,
  `actual_amount` decimal(15,2) DEFAULT NULL,
  `actual_currency` enum('TZS','USD') DEFAULT NULL,
  `processed_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `submitted_by` int NOT NULL,
  `submitted_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_number` (`tracking_number`),
  KEY `approved_by` (`approved_by`),
  KEY `submitted_by` (`submitted_by`),
  KEY `idx_tracking_number` (`tracking_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_currency` (`currency`),
  KEY `idx_payment_type` (`payment_type`),
  KEY `idx_urgency` (`urgency`),
  KEY `idx_department` (`department`),
  KEY `idx_submitted_date` (`submitted_date`),
  KEY `idx_expected_payment_date` (`expected_payment_date`),
  CONSTRAINT `payment_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `payment_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_requests_ibfk_3` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payment_requests

-- ----------------------------
-- Table: payment_requests_history
-- ----------------------------
DROP TABLE IF EXISTS `payment_requests_history`;
CREATE TABLE `payment_requests_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `status` enum('pending_finance_approval','approved','rejected','processed','paid','cancelled') NOT NULL,
  `changed_by` int NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_status` (`status`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `payment_requests_history_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payment_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_requests_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payment_requests_history

-- ----------------------------
-- Table: payment_tracking
-- ----------------------------
DROP TABLE IF EXISTS `payment_tracking`;
CREATE TABLE `payment_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(50) NOT NULL,
  `purchase_id` int NOT NULL,
  `payment_stage` enum('Initiated','Processing','Confirmed','Completed','Failed') NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `bank_reference` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `tracking_notes` text,
  `payment_date` date NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_number` (`tracking_number`),
  KEY `idx_tracking_number` (`tracking_number`),
  KEY `idx_purchase_id` (`purchase_id`),
  KEY `idx_payment_stage` (`payment_stage`),
  KEY `idx_payment_reference` (`payment_reference`),
  KEY `idx_bank_reference` (`bank_reference`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `payment_tracking_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `language_purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_tracking_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payment_tracking

-- ----------------------------
-- Table: payroll_records
-- ----------------------------
DROP TABLE IF EXISTS `payroll_records`;
CREATE TABLE `payroll_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payroll_month` varchar(20) NOT NULL,
  `payment_date` date NOT NULL,
  `payroll_type` enum('regular','overtime','bonus','termination') DEFAULT 'regular',
  `total_employees` int NOT NULL DEFAULT '0',
  `total_gross` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_deductions` decimal(15,2) NOT NULL DEFAULT '0.00',
  `net_payment` decimal(15,2) NOT NULL DEFAULT '0.00',
  `processed_by` varchar(255) DEFAULT NULL,
  `status` enum('draft','processed','approved','paid') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payroll_month` (`payroll_month`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payroll_records

-- ----------------------------
-- Table: payslip_records
-- ----------------------------
DROP TABLE IF EXISTS `payslip_records`;
CREATE TABLE `payslip_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `payroll_month` varchar(20) NOT NULL,
  `basic_salary` decimal(15,2) DEFAULT '0.00',
  `allowances` decimal(15,2) DEFAULT '0.00',
  `gross_salary` decimal(15,2) DEFAULT '0.00',
  `nssf_deduction` decimal(15,2) DEFAULT '0.00',
  `paye_tax` decimal(15,2) DEFAULT '0.00',
  `other_deductions` decimal(15,2) DEFAULT '0.00',
  `net_salary` decimal(15,2) DEFAULT '0.00',
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `emailed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_employee_month` (`employee_id`,`payroll_month`),
  KEY `idx_payroll_month` (`payroll_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in payslip_records

-- ----------------------------
-- Table: policies
-- ----------------------------
DROP TABLE IF EXISTS `policies`;
CREATE TABLE `policies` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `submitted_by` varchar(255) NOT NULL,
  `submitted_by_role` varchar(100) DEFAULT NULL,
  `submission_date` date DEFAULT NULL,
  `impact` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `status` enum('Pending','Approved','Rejected','Revision Requested') DEFAULT 'Pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `rejection_reason` text,
  `revision_request` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(100) DEFAULT 'General',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_date` (`submission_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `policies` (`id`, `title`, `description`, `submitted_by`, `submitted_by_role`, `submission_date`, `impact`, `status`, `approved_by`, `approved_date`, `rejection_reason`, `revision_request`, `created_at`, `updated_at`, `category`) VALUES
('digital-recruitment', 'Digital Recruitment Platform Policy', 'Implementation of online job portal and digital application system', 'HR Department', 'HR Manager', NULL, 'High', 'Pending', NULL, NULL, NULL, NULL, '2026-07-17 23:01:11', '2026-07-17 23:01:11', 'General');

-- ----------------------------
-- Table: policy_rejections
-- ----------------------------
DROP TABLE IF EXISTS `policy_rejections`;
CREATE TABLE `policy_rejections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policy_id` varchar(50) NOT NULL,
  `rejection_reason` text NOT NULL,
  `rejected_by` varchar(255) NOT NULL,
  `rejected_by_role` varchar(100) DEFAULT NULL,
  `rejection_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notified_department` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_rejected_by` (`rejected_by`),
  KEY `idx_notified` (`notified_department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in policy_rejections

-- ----------------------------
-- Table: policy_revisions
-- ----------------------------
DROP TABLE IF EXISTS `policy_revisions`;
CREATE TABLE `policy_revisions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policy_id` varchar(50) NOT NULL,
  `revision_request` text NOT NULL,
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `response` text,
  `response_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in policy_revisions

-- ----------------------------
-- Table: ppe_inventory
-- ----------------------------
DROP TABLE IF EXISTS `ppe_inventory`;
CREATE TABLE `ppe_inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `item_type` varchar(50) DEFAULT NULL,
  `ppe_type` varchar(50) DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `min_quantity` int DEFAULT '5',
  `item_condition` enum('New','Good','Worn','Damaged') DEFAULT 'Good',
  `last_inspected` date DEFAULT NULL,
  `storage_location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `min_stock_level` int NOT NULL DEFAULT '10',
  `unit_price` decimal(10,2) DEFAULT '0.00',
  `supplier` varchar(255) DEFAULT NULL,
  `last_restocked` date DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`ppe_type`),
  KEY `idx_condition` (`item_condition`),
  KEY `idx_quantity` (`quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in ppe_inventory

-- ----------------------------
-- Table: ppe_issuance
-- ----------------------------
DROP TABLE IF EXISTS `ppe_issuance`;
CREATE TABLE `ppe_issuance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `ppe_type` enum('Helmet','Gloves','Boots','Vest','Goggles','Mask','Harness','Ear Plugs','Other') NOT NULL,
  `ppe_condition` varchar(50) DEFAULT 'new',
  `issue_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `issued_by` varchar(255) DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  `notes` text,
  `status` varchar(50) DEFAULT 'Issued',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `issuance_id` varchar(50) DEFAULT NULL,
  `worker_name` varchar(255) DEFAULT NULL,
  `worker_id` varchar(50) DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `ppe_items` json DEFAULT NULL,
  `worker_signature` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `issued_by` (`issued_by`),
  KEY `project_id` (`project_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_ppe_type` (`ppe_type`),
  KEY `idx_status` (`status`),
  KEY `idx_issue_date` (`issue_date`),
  CONSTRAINT `ppe_issuance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ppe_issuance_ibfk_3` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in ppe_issuance

-- ----------------------------
-- Table: procurement_sales
-- ----------------------------
DROP TABLE IF EXISTS `procurement_sales`;
CREATE TABLE `procurement_sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_title` varchar(255) NOT NULL,
  `procurement_type` varchar(50) NOT NULL,
  `item_description` text NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) DEFAULT '0.00',
  `total_budget` decimal(12,2) NOT NULL,
  `purpose` text NOT NULL,
  `urgency_level` varchar(50) DEFAULT 'Normal',
  `expected_delivery_date` date DEFAULT NULL,
  `supplier_requirements` text,
  `technical_specifications` text,
  `budget_allocation` varchar(100) DEFAULT NULL,
  `department` varchar(100) NOT NULL,
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) NOT NULL,
  `justification` text,
  `approval_requirements` varchar(50) DEFAULT 'Standard',
  `status` varchar(50) DEFAULT 'Pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_date` timestamp NULL DEFAULT NULL,
  `review_comments` text,
  `approved_budget` decimal(12,2) DEFAULT NULL,
  `rejection_reason` text,
  `submitted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_procurement_type` (`procurement_type`),
  KEY `idx_urgency_level` (`urgency_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in procurement_sales

-- ----------------------------
-- Table: project_progress_updates
-- ----------------------------
DROP TABLE IF EXISTS `project_progress_updates`;
CREATE TABLE `project_progress_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `progress_percentage` decimal(5,2) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `progress_report` text,
  `completed_milestones` varchar(500) DEFAULT NULL,
  `next_milestones` varchar(500) DEFAULT NULL,
  `budget_used` decimal(15,2) DEFAULT NULL,
  `issues` text,
  `update_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `report` text,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_update_date` (`update_date`),
  KEY `idx_updated_by` (`updated_by`),
  CONSTRAINT `project_progress_updates_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in project_progress_updates

-- ----------------------------
-- Table: project_safety
-- ----------------------------
DROP TABLE IF EXISTS `project_safety`;
CREATE TABLE `project_safety` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `safety_score` int DEFAULT '0',
  `days_without_incident` int DEFAULT '0',
  `open_violations` int DEFAULT '0',
  `ppe_compliance` int DEFAULT '0',
  `last_inspection_date` date DEFAULT NULL,
  `risk_level` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `status` enum('Active','Inactive','Pending','Suspended') DEFAULT 'Active',
  `total_inspections` int DEFAULT '0',
  `total_incidents` int DEFAULT '0',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_risk_level` (`risk_level`),
  KEY `idx_status` (`status`),
  KEY `idx_safety_score` (`safety_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in project_safety

-- ----------------------------
-- Table: projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('Planning','In Progress','Completed','On Hold','Cancelled') DEFAULT 'Planning',
  `contract_value` decimal(15,2) DEFAULT NULL,
  `priority_level` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `project_manager` varchar(255) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `project_code` varchar(50) DEFAULT NULL,
  `project_type` varchar(100) DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `actual_cost` decimal(15,2) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `key_deliverables` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_code` (`project_code`),
  KEY `idx_status` (`status`),
  KEY `idx_manager` (`manager_id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_priority` (`priority_level`),
  KEY `idx_project_manager` (`project_manager`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in projects

-- ----------------------------
-- Table: projects_work
-- ----------------------------
DROP TABLE IF EXISTS `projects_work`;
CREATE TABLE `projects_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) DEFAULT 'PROJECT',
  `work_type` enum('Project Creation','Project Assignment','Progress Update','Task Assignment','Workforce Request','Site Report','Work Approval','Project Completion','Resource Management') DEFAULT 'Project Creation',
  `work_title` varchar(255) NOT NULL,
  `work_description` text,
  `project_name` varchar(255) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `project_phase` enum('Planning','In Progress','Testing','Completed','On Hold','Cancelled') DEFAULT 'Planning',
  `status` enum('Pending','In Progress','Completed','Rejected','Revision Requested') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department_code`),
  KEY `idx_work_type` (`work_type`),
  KEY `idx_project_phase` (`project_phase`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in projects_work

-- ----------------------------
-- Table: promotions
-- ----------------------------
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `promotion_number` varchar(50) NOT NULL,
  `employee_id` int NOT NULL,
  `current_position` varchar(255) NOT NULL,
  `current_department` varchar(100) NOT NULL,
  `current_salary` decimal(12,2) DEFAULT NULL,
  `new_position` varchar(255) NOT NULL,
  `new_department` varchar(100) DEFAULT NULL,
  `new_salary` decimal(12,2) DEFAULT NULL,
  `promotion_type` enum('Promotion','Transfer','Demotion','Salary Increase','Role Change') NOT NULL,
  `effective_date` date NOT NULL,
  `reason` text NOT NULL,
  `performance_rating` varchar(50) DEFAULT NULL,
  `recommended_by` int NOT NULL,
  `recommendation_date` date NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Implemented') DEFAULT 'Pending',
  `benefits_change` text,
  `responsibilities_change` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promotion_number` (`promotion_number`),
  KEY `idx_promotion_number` (`promotion_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_effective_date` (`effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in promotions

-- ----------------------------
-- Table: properties
-- ----------------------------
DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `type` enum('Residential','Commercial','Industrial','Land','Mixed Use') DEFAULT 'Residential',
  `price` decimal(12,2) DEFAULT NULL,
  `status` enum('Available','Sold','Under Offer','Rented','Off Market') DEFAULT 'Available',
  `size_sqm` decimal(10,2) DEFAULT NULL,
  `bedrooms` int DEFAULT NULL,
  `bathrooms` int DEFAULT NULL,
  `parking_spaces` int DEFAULT NULL,
  `year_built` int DEFAULT NULL,
  `agent_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_reason` text,
  `utilities` varchar(255) DEFAULT NULL,
  `zoning` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `agent_id` (`agent_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_location` (`location`),
  KEY `idx_price` (`price`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in properties

-- ----------------------------
-- Table: realestate_work
-- ----------------------------
DROP TABLE IF EXISTS `realestate_work`;
CREATE TABLE `realestate_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) DEFAULT 'REALESTATE',
  `work_type` enum('Property Addition','Property Editing','Client Registration','Sale Recording','Payment Tracking','Sales Report','Property Management','Client Communication') DEFAULT 'Property Addition',
  `work_title` varchar(255) NOT NULL,
  `work_description` text,
  `property_address` varchar(255) DEFAULT NULL,
  `property_type` varchar(100) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `sale_amount` decimal(15,2) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Rejected','Revision Requested') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department_code`),
  KEY `idx_work_type` (`work_type`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in realestate_work

-- ----------------------------
-- Table: risk_management
-- ----------------------------
DROP TABLE IF EXISTS `risk_management`;
CREATE TABLE `risk_management` (
  `id` int NOT NULL AUTO_INCREMENT,
  `risk_number` varchar(50) NOT NULL,
  `risk_title` varchar(255) NOT NULL,
  `risk_category` enum('Financial','Operational','Safety','Legal','Reputational','Strategic','Technical','Environmental','Other') NOT NULL,
  `risk_description` text NOT NULL,
  `probability` enum('Very Low','Low','Medium','High','Very High') NOT NULL,
  `impact` enum('Very Low','Low','Medium','High','Very High') NOT NULL,
  `project_id` int DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `identified_by` int NOT NULL,
  `identified_date` date NOT NULL,
  `mitigation_strategy` text,
  `contingency_plan` text,
  `owner` int DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `status` enum('Open','In Progress','Mitigated','Closed','Accepted') DEFAULT 'Open',
  `likelihood_after_mitigation` enum('Very Low','Low','Medium','High','Very High') DEFAULT NULL,
  `impact_after_mitigation` enum('Very Low','Low','Medium','High','Very High') DEFAULT NULL,
  `cost_of_mitigation` decimal(12,2) DEFAULT NULL,
  `potential_loss` decimal(15,2) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `risk_number` (`risk_number`),
  KEY `idx_risk_number` (`risk_number`),
  KEY `idx_risk_category` (`risk_category`),
  KEY `idx_status` (`status`),
  KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in risk_management

-- ----------------------------
-- Table: risk_register
-- ----------------------------
DROP TABLE IF EXISTS `risk_register`;
CREATE TABLE `risk_register` (
  `id` int NOT NULL AUTO_INCREMENT,
  `risk_number` varchar(50) DEFAULT NULL,
  `risk_title` varchar(255) NOT NULL,
  `risk_category` enum('Financial','Operational','Strategic','Compliance','Safety','Environmental','Reputational','Technical','Market','Other') NOT NULL,
  `probability` enum('Very Low','Low','Medium','High','Very High') DEFAULT 'Low',
  `impact` enum('Very Low','Low','Medium','High','Very High') DEFAULT 'Low',
  `risk_level` enum('Low','Medium','High','Critical') DEFAULT 'Low',
  `description` text NOT NULL,
  `root_causes` text,
  `consequences` text,
  `mitigation_plan` text,
  `contingency_plan` text,
  `risk_owner` varchar(255) NOT NULL,
  `risk_owner_department` varchar(100) DEFAULT NULL,
  `status` enum('Open','Mitigated','Accepted','Transferred','Closed') DEFAULT 'Open',
  `review_date` date DEFAULT NULL,
  `next_review_date` date DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  `residual_risk_level` enum('Low','Medium','High','Critical') DEFAULT 'Low',
  `lessons_learned` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `risk_number` (`risk_number`),
  KEY `project_id` (`project_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_risk_number` (`risk_number`),
  KEY `idx_risk_category` (`risk_category`),
  KEY `idx_status` (`status`),
  KEY `idx_risk_level` (`risk_level`),
  KEY `idx_review_date` (`review_date`),
  CONSTRAINT `risk_register_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `risk_register_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in risk_register

-- ----------------------------
-- Table: salary_structures
-- ----------------------------
DROP TABLE IF EXISTS `salary_structures`;
CREATE TABLE `salary_structures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `housing_allowance` decimal(15,2) DEFAULT '0.00',
  `transport_allowance` decimal(15,2) DEFAULT '0.00',
  `medical_allowance` decimal(15,2) DEFAULT '0.00',
  `other_allowances` decimal(15,2) DEFAULT '0.00',
  `gross_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_salary` (`employee_id`),
  KEY `idx_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in salary_structures

-- ----------------------------
-- Table: schedule_meetings
-- ----------------------------
DROP TABLE IF EXISTS `schedule_meetings`;
CREATE TABLE `schedule_meetings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meeting_title` varchar(255) NOT NULL,
  `meeting_type` enum('board','management','department','project','client','training','general') NOT NULL,
  `meeting_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `organizing_department` enum('management','hr','finance','projects','operations','realestate') NOT NULL,
  `expected_attendees` int DEFAULT '1',
  `meeting_description` text,
  `projector_required` tinyint(1) DEFAULT '0',
  `whiteboard_required` tinyint(1) DEFAULT '0',
  `refreshments_required` tinyint(1) DEFAULT '0',
  `parking_required` tinyint(1) DEFAULT '0',
  `status` enum('Scheduled','Confirmed','Cancelled','Completed','Postponed') DEFAULT 'Scheduled',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meeting_date` (`meeting_date`),
  KEY `idx_meeting_type` (`meeting_type`),
  KEY `idx_department` (`organizing_department`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in schedule_meetings

-- ----------------------------
-- Table: senior_hiring_approval
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_approval`;
CREATE TABLE `senior_hiring_approval` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `proposed_salary` varchar(50) NOT NULL,
  `experience` text,
  `hr_recommendation` text,
  `status` enum('pending','approved','rejected','info_requested') DEFAULT 'pending',
  `request_date` date NOT NULL,
  `approval_date` date DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `requested_by` varchar(255) NOT NULL DEFAULT 'HR Manager',
  `requested_by_role` varchar(100) DEFAULT 'HR',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`),
  KEY `idx_date` (`request_date`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `senior_hiring_approval` (`id`, `candidate_name`, `position`, `department`, `proposed_salary`, `experience`, `hr_recommendation`, `status`, `request_date`, `approval_date`, `approved_by`, `requested_by`, `requested_by_role`, `created_at`, `updated_at`) VALUES
(1, 'John Smith', 'Project Manager', 'Projects', '150000', '10 years in construction management', 'Highly recommended for leadership role', 'pending', '2026-04-14 21:00:00', NULL, NULL, 'HR Manager', 'HR', '2026-07-14 23:51:54', '2026-07-14 23:51:54'),
(2, 'Sarah Johnson', 'Senior Engineer', 'Operations', '120000', '8 years in structural engineering', 'Excellent technical skills and project experience', 'pending', '2026-04-15 21:00:00', NULL, NULL, 'HR Manager', 'HR', '2026-07-14 23:51:54', '2026-07-14 23:51:54'),
(3, 'Michael Chen', 'Finance Director', 'Finance', '180000', '12 years in financial management', 'Strong leadership background in construction finance', 'pending', '2026-04-16 21:00:00', NULL, NULL, 'HR Manager', 'HR', '2026-07-14 23:51:54', '2026-07-14 23:51:54');

-- ----------------------------
-- Table: senior_hiring_approvals
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_approvals`;
CREATE TABLE `senior_hiring_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(50) NOT NULL,
  `approved_by` varchar(255) NOT NULL,
  `approved_by_role` varchar(100) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `comments` text,
  `final_decision` enum('Approved','Rejected','More Info Required') DEFAULT 'Approved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_decision` (`final_decision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_hiring_approvals

-- ----------------------------
-- Table: senior_hiring_info_request
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_info_request`;
CREATE TABLE `senior_hiring_info_request` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `info_request` text NOT NULL,
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) DEFAULT NULL,
  `request_date` date NOT NULL,
  `response` text,
  `response_date` date DEFAULT NULL,
  `responded_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `senior_hiring_info_request_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `senior_hiring_approval` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_hiring_info_request

-- ----------------------------
-- Table: senior_hiring_info_requests
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_info_requests`;
CREATE TABLE `senior_hiring_info_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(50) NOT NULL,
  `info_required` text NOT NULL,
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Provided','Closed') DEFAULT 'Pending',
  `response` text,
  `response_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_hiring_info_requests

-- ----------------------------
-- Table: senior_hiring_rejection
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_rejection`;
CREATE TABLE `senior_hiring_rejection` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `rejection_reason` text NOT NULL,
  `rejected_by` varchar(255) NOT NULL,
  `rejected_by_role` varchar(100) DEFAULT NULL,
  `rejection_date` date NOT NULL,
  `notified_hr` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `senior_hiring_rejection_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `senior_hiring_approval` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_hiring_rejection

-- ----------------------------
-- Table: senior_hiring_rejections
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_rejections`;
CREATE TABLE `senior_hiring_rejections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` varchar(50) NOT NULL,
  `rejection_reason` text NOT NULL,
  `rejected_by` varchar(255) NOT NULL,
  `rejected_by_role` varchar(100) DEFAULT NULL,
  `rejection_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notified_hr` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_rejected_by` (`rejected_by`),
  KEY `idx_notified` (`notified_hr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_hiring_rejections

-- ----------------------------
-- Table: senior_hiring_requests
-- ----------------------------
DROP TABLE IF EXISTS `senior_hiring_requests`;
CREATE TABLE `senior_hiring_requests` (
  `id` varchar(50) NOT NULL,
  `candidate_name` varchar(255) NOT NULL,
  `proposed_salary` varchar(50) NOT NULL,
  `department` varchar(100) NOT NULL,
  `experience` text,
  `hr_recommendation` text,
  `position_level` enum('Senior','Manager','Director') DEFAULT 'Senior',
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Approved','Rejected','More Info Requested') DEFAULT 'Pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `more_info_request` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`),
  KEY `idx_department` (`department`),
  KEY `idx_date` (`request_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_hiring_requests

-- ----------------------------
-- Table: senior_roles
-- ----------------------------
DROP TABLE IF EXISTS `senior_roles`;
CREATE TABLE `senior_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `senior_role_type` enum('Manager','Senior Manager','Director','Senior Director','VP','C-Level','Other') NOT NULL,
  `proposed_title` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `proposed_salary` decimal(12,2) NOT NULL,
  `effective_date` date NOT NULL,
  `reason_for_promotion` text,
  `responsibilities` text,
  `qualifications` text,
  `experience` text,
  `achievements` text,
  `reporting_structure` text,
  `budget_impact` text,
  `submitted_by` int NOT NULL,
  `submitted_by_role` varchar(100) NOT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `status` enum('Pending','Under Review','Approved','Rejected','Implemented','Cancelled') DEFAULT 'Pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_date` timestamp NULL DEFAULT NULL,
  `review_comments` text,
  `approved_salary` decimal(12,2) DEFAULT NULL,
  `rejection_reason` text,
  `final_title` varchar(255) DEFAULT NULL,
  `sent_to_md_by` int DEFAULT NULL,
  `sent_to_md_date` timestamp NULL DEFAULT NULL,
  `attachments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `updated_by` (`updated_by`),
  KEY `sent_to_md_by` (`sent_to_md_by`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_senior_role_type` (`senior_role_type`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `senior_roles_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `senior_roles_ibfk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `senior_roles_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `senior_roles_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `senior_roles_ibfk_5` FOREIGN KEY (`sent_to_md_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in senior_roles

-- ----------------------------
-- Table: site_reports
-- ----------------------------
DROP TABLE IF EXISTS `site_reports`;
CREATE TABLE `site_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `report_date` date NOT NULL,
  `weather_conditions` enum('Sunny','Cloudy','Rainy','Windy') NOT NULL,
  `site_supervisor` varchar(255) NOT NULL,
  `workers_present` int NOT NULL,
  `work_completed` text NOT NULL,
  `site_issues` text,
  `safety_incidents` text,
  `materials_used` varchar(500) DEFAULT NULL,
  `equipment_used` varchar(500) DEFAULT NULL,
  `next_day_plan` text NOT NULL,
  `photos_files` text,
  `status` enum('Draft','Submitted','Reviewed','Approved') DEFAULT 'Draft',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_date` (`project_id`,`report_date`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `site_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in site_reports

-- ----------------------------
-- Table: suggestion_comments
-- ----------------------------
DROP TABLE IF EXISTS `suggestion_comments`;
CREATE TABLE `suggestion_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `suggestion_id` int NOT NULL,
  `comment` text NOT NULL,
  `commented_by` int NOT NULL,
  `commented_by_role` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_suggestion_id` (`suggestion_id`),
  KEY `idx_commented_by` (`commented_by`),
  CONSTRAINT `suggestion_comments_ibfk_1` FOREIGN KEY (`suggestion_id`) REFERENCES `suggestions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `suggestion_comments_ibfk_2` FOREIGN KEY (`commented_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in suggestion_comments

-- ----------------------------
-- Table: suggestion_votes
-- ----------------------------
DROP TABLE IF EXISTS `suggestion_votes`;
CREATE TABLE `suggestion_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `suggestion_id` int NOT NULL,
  `vote_type` enum('up','down') NOT NULL,
  `voted_by` int NOT NULL,
  `voted_by_role` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_suggestion_vote` (`suggestion_id`,`voted_by`),
  KEY `idx_suggestion_id` (`suggestion_id`),
  KEY `idx_voted_by` (`voted_by`),
  CONSTRAINT `suggestion_votes_ibfk_1` FOREIGN KEY (`suggestion_id`) REFERENCES `suggestions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `suggestion_votes_ibfk_2` FOREIGN KEY (`voted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in suggestion_votes

-- ----------------------------
-- Table: suggestions
-- ----------------------------
DROP TABLE IF EXISTS `suggestions`;
CREATE TABLE `suggestions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('safety','productivity','cost-saving','quality','environment','training','equipment','process','other') NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL,
  `description` text NOT NULL,
  `current_situation` text,
  `proposed_solution` text,
  `expected_benefits` text,
  `resources_required` text,
  `timeline` varchar(255) DEFAULT NULL,
  `status` enum('pending','under-review','approved','rejected','implemented') DEFAULT 'pending',
  `admin_feedback` text,
  `admin_decision` varchar(255) DEFAULT NULL,
  `decision_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `department` varchar(100) DEFAULT NULL,
  `submitted_by_name` varchar(255) DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_category` (`category`),
  KEY `idx_priority` (`priority`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `suggestions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in suggestions

-- ----------------------------
-- Table: talent_acquisition
-- ----------------------------
DROP TABLE IF EXISTS `talent_acquisition`;
CREATE TABLE `talent_acquisition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requisition_number` varchar(50) NOT NULL,
  `position_title` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `position_type` enum('Full Time','Part Time','Contract','Temporary','Intern') NOT NULL,
  `experience_level` enum('Entry Level','Mid Level','Senior Level','Executive','Intern') NOT NULL,
  `number_of_positions` int DEFAULT '1',
  `job_description` text,
  `requirements` text,
  `salary_range_min` decimal(12,2) DEFAULT NULL,
  `salary_range_max` decimal(12,2) DEFAULT NULL,
  `requested_by` int NOT NULL,
  `request_date` date NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','In Progress','On Hold','Filled') DEFAULT 'Pending',
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `budget_code` varchar(50) DEFAULT NULL,
  `expected_start_date` date DEFAULT NULL,
  `hiring_manager` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_number` (`requisition_number`),
  KEY `idx_requisition_number` (`requisition_number`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_request_date` (`request_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in talent_acquisition

-- ----------------------------
-- Table: talent_acquisitions
-- ----------------------------
DROP TABLE IF EXISTS `talent_acquisitions`;
CREATE TABLE `talent_acquisitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requisition_number` varchar(50) DEFAULT NULL,
  `position_title` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `job_description` text NOT NULL,
  `requirements` text,
  `employment_type` enum('Full-time','Part-time','Contract','Internship') DEFAULT 'Full-time',
  `salary_range` varchar(100) DEFAULT NULL,
  `vacancies` int DEFAULT '1',
  `posting_date` date DEFAULT NULL,
  `closing_date` date DEFAULT NULL,
  `status` enum('Draft','Open','Closed','On Hold','Filled','Cancelled') DEFAULT 'Draft',
  `posted_by` int DEFAULT NULL,
  `hiring_manager` varchar(255) DEFAULT NULL,
  `candidates_count` int DEFAULT '0',
  `source` enum('Internal','External','Referral','Job Board','Agency') DEFAULT 'Internal',
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_number` (`requisition_number`),
  KEY `posted_by` (`posted_by`),
  KEY `idx_requisition_number` (`requisition_number`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_posting_date` (`posting_date`),
  CONSTRAINT `talent_acquisitions_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in talent_acquisitions

-- ----------------------------
-- Table: task_assignments
-- ----------------------------
DROP TABLE IF EXISTS `task_assignments`;
CREATE TABLE `task_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `assigned_to` varchar(255) NOT NULL,
  `task_priority` enum('urgent','high','medium','low') NOT NULL,
  `start_date` date NOT NULL,
  `due_date` date NOT NULL,
  `task_description` text NOT NULL,
  `estimated_hours` decimal(5,2) DEFAULT NULL,
  `required_skills` varchar(500) DEFAULT NULL,
  `materials_equipment` text,
  `status` enum('assigned','in-progress','completed','on-hold','cancelled') DEFAULT 'assigned',
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `task_assignments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in task_assignments

-- ----------------------------
-- Table: tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `task_description` text,
  `assigned_to` varchar(255) NOT NULL,
  `task_priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `task_status` enum('Not Started','In Progress','Completed','On Hold','Cancelled') DEFAULT 'Not Started',
  `start_date` date NOT NULL,
  `due_date` date NOT NULL,
  `estimated_hours` decimal(5,2) DEFAULT NULL,
  `actual_hours` decimal(5,2) DEFAULT NULL,
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `required_skills` text,
  `task_materials` text,
  `dependencies` text,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_status` (`task_status`),
  KEY `idx_priority` (`task_priority`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in tasks

-- ----------------------------
-- Table: tax_payments
-- ----------------------------
DROP TABLE IF EXISTS `tax_payments`;
CREATE TABLE `tax_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tax_type` enum('PAYE','VAT','Corporate Tax','Withholding Tax','Skills Development Levy','Service Levy','Other') NOT NULL,
  `tax_period` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `penalties` decimal(12,2) DEFAULT '0.00',
  `interest` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` enum('Bank Transfer','Cash','Cheque','Mobile Money','Other') DEFAULT 'Bank Transfer',
  `payment_reference` varchar(100) DEFAULT NULL,
  `payment_status` enum('Paid','Pending','Overdue','Cancelled','Refunded') DEFAULT 'Paid',
  `description` text,
  `department` varchar(100) NOT NULL,
  `recorded_by` int NOT NULL,
  `recorded_by_role` varchar(100) NOT NULL,
  `attachments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_tax_type` (`tax_type`),
  KEY `idx_tax_period` (`tax_period`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_department` (`department`),
  CONSTRAINT `tax_payments_ibfk_1` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`),
  CONSTRAINT `tax_payments_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in tax_payments

-- ----------------------------
-- Table: team_members
-- ----------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `member_role` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_member` (`team_id`,`employee_id`),
  KEY `idx_team_id` (`team_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in team_members

-- ----------------------------
-- Table: teams
-- ----------------------------
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `description` text,
  `leader_employee_id` int DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_leader_employee_id` (`leader_employee_id`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`leader_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in teams

-- ----------------------------
-- Table: transport_costs
-- ----------------------------
DROP TABLE IF EXISTS `transport_costs`;
CREATE TABLE `transport_costs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cost_type` enum('maintenance','extra') NOT NULL,
  `category` enum('service_maintenance','repair','fuel','toll_fees','tyre_replacement','insurance','other') NOT NULL,
  `description` text NOT NULL,
  `vehicle_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'TZS',
  `date_incurred` date NOT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','approved','paid','rejected') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_cost_type` (`cost_type`),
  KEY `idx_category` (`category`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_date_incurred` (`date_incurred`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `transport_costs_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transport_costs_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in transport_costs

-- ----------------------------
-- Table: users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `service_type` varchar(100) DEFAULT NULL,
  `custom_service` text,
  `additional_info` text,
  `password` varchar(255) NOT NULL,
  `role` enum('Customer','Managing Director','HR Manager','Finance Manager','Project Manager','Real Estate Manager','HSE Manager','Office Assistant','Worker') DEFAULT 'Customer',
  `department` enum('Management','Human Resources','Finance','Project Management','Real Estate','Health & Safety','Administrative','Workers','Clients') DEFAULT 'Clients',
  `registration_date` date DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_department` (`department`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `location`, `service_type`, `custom_service`, `additional_info`, `password`, `role`, `department`, `registration_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@kashtec.co.tz', NULL, NULL, NULL, NULL, NULL, 'admin123', 'Managing Director', 'Clients', NULL, 'Active', '2026-07-14 23:51:53', '2026-07-14 23:51:53');

-- ----------------------------
-- Table: vehicles
-- ----------------------------
DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `track_number` varchar(50) NOT NULL,
  `car_name` varchar(255) NOT NULL,
  `brand_name` enum('toyota','nissan','mitsubishi','isuzu','ford','mazda','honda','bmw','mercedes','volkswagen','other') NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `plate_number` varchar(50) NOT NULL,
  `car_details` text NOT NULL,
  `description` text NOT NULL,
  `assigned_driver` varchar(50) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `vehicle_type` enum('pickup','suv','sedan','van','truck','motorcycle') NOT NULL,
  `fuel_type` enum('petrol','diesel','hybrid','electric') NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `year_of_manufacture` int DEFAULT NULL,
  `odometer_reading` int DEFAULT NULL,
  `insurance_status` enum('insured','pending','expired','not-required') NOT NULL,
  `vehicle_status` enum('active','maintenance','inactive','retired') NOT NULL,
  `additional_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `track_number` (`track_number`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `assigned_driver` (`assigned_driver`),
  KEY `idx_track_number` (`track_number`),
  KEY `idx_car_name` (`car_name`),
  KEY `idx_brand_name` (`brand_name`),
  KEY `idx_registration_number` (`registration_number`),
  KEY `idx_plate_number` (`plate_number`),
  KEY `idx_vehicle_status` (`vehicle_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`assigned_driver`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in vehicles

-- ----------------------------
-- Table: violations
-- ----------------------------
DROP TABLE IF EXISTS `violations`;
CREATE TABLE `violations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `violation_id` varchar(50) NOT NULL,
  `date` datetime NOT NULL,
  `project` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `severity` varchar(20) NOT NULL,
  `violators` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text,
  `immediate_action` text,
  `corrective_action` varchar(50) DEFAULT NULL,
  `action_deadline` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `reported_by` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `violation_id` (`violation_id`),
  KEY `idx_violation_project` (`project`),
  KEY `idx_violation_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in violations

-- ----------------------------
-- Table: work_actions
-- ----------------------------
DROP TABLE IF EXISTS `work_actions`;
CREATE TABLE `work_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_id` int NOT NULL,
  `work_table` varchar(50) NOT NULL,
  `action_type` enum('Created','Assigned','In Progress','Completed','Rejected','Revision Requested','Approved') DEFAULT 'Created',
  `action_description` text,
  `action_by` varchar(255) NOT NULL,
  `action_by_role` varchar(100) DEFAULT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `next_action_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_work_id` (`work_id`),
  KEY `idx_work_table` (`work_table`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_action_by` (`action_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in work_actions

-- ----------------------------
-- Table: work_approvals
-- ----------------------------
DROP TABLE IF EXISTS `work_approvals`;
CREATE TABLE `work_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_id` varchar(50) NOT NULL,
  `project_id` int DEFAULT NULL,
  `completed_by` varchar(255) NOT NULL,
  `completion_date` date NOT NULL,
  `quality_assessment` enum('excellent','good','acceptable','poor') NOT NULL,
  `compliance_check` enum('fully-compliant','minor-issues','major-issues','non-compliant') NOT NULL,
  `approval_comments` text NOT NULL,
  `safety_compliance` enum('compliant','minor-violations','major-violations') DEFAULT 'compliant',
  `time_completion` enum('on-time','early','delayed') DEFAULT 'on-time',
  `quality_score` decimal(5,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected','rework-requested') DEFAULT 'pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_table` varchar(50) DEFAULT NULL,
  `source_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_work_id` (`work_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_completed_by` (`completed_by`),
  KEY `idx_status` (`status`),
  CONSTRAINT `work_approvals_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in work_approvals

-- ----------------------------
-- Table: work_comments
-- ----------------------------
DROP TABLE IF EXISTS `work_comments`;
CREATE TABLE `work_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_id` int NOT NULL,
  `work_table` varchar(50) NOT NULL,
  `comment` text NOT NULL,
  `commented_by` varchar(255) NOT NULL,
  `commented_by_role` varchar(100) DEFAULT NULL,
  `comment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_internal` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_work_id` (`work_id`),
  KEY `idx_work_table` (`work_table`),
  KEY `idx_commented_by` (`commented_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in work_comments

-- ----------------------------
-- Table: work_completions
-- ----------------------------
DROP TABLE IF EXISTS `work_completions`;
CREATE TABLE `work_completions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_details` varchar(255) NOT NULL,
  `project` varchar(255) DEFAULT NULL,
  `completed_by` varchar(255) DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `quality_score` int DEFAULT '0',
  `quality_level` varchar(50) DEFAULT NULL,
  `status` enum('pending','approved','rejected','rework_requested') DEFAULT 'pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_notes` text,
  `approval_date` datetime DEFAULT NULL,
  `rework_reason` text,
  `rework_requested_by` varchar(255) DEFAULT NULL,
  `rework_request_date` datetime DEFAULT NULL,
  `rejection_reason` text,
  `rejected_by` varchar(255) DEFAULT NULL,
  `rejection_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_table` varchar(50) DEFAULT 'work_completions',
  `source_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_completed_date` (`completed_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in work_completions

-- ----------------------------
-- Table: work_rejections
-- ----------------------------
DROP TABLE IF EXISTS `work_rejections`;
CREATE TABLE `work_rejections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_id` int NOT NULL,
  `work_table` varchar(50) NOT NULL,
  `rejection_reason` text NOT NULL,
  `rejection_details` text,
  `rejected_by` varchar(255) NOT NULL,
  `rejected_by_role` varchar(100) DEFAULT NULL,
  `rejection_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notified_submitter` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_work_id` (`work_id`),
  KEY `idx_work_table` (`work_table`),
  KEY `idx_rejected_by` (`rejected_by`),
  KEY `idx_notified` (`notified_submitter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in work_rejections

-- ----------------------------
-- Table: work_revisions
-- ----------------------------
DROP TABLE IF EXISTS `work_revisions`;
CREATE TABLE `work_revisions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_id` int NOT NULL,
  `work_table` varchar(50) NOT NULL,
  `revision_request` text NOT NULL,
  `revision_details` text,
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `response` text,
  `response_date` timestamp NULL DEFAULT NULL,
  `responded_by` varchar(255) DEFAULT NULL,
  `responded_by_role` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_work_id` (`work_id`),
  KEY `idx_work_table` (`work_table`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`),
  KEY `idx_response_date` (`response_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in work_revisions

-- ----------------------------
-- Table: worker_accounts
-- ----------------------------
DROP TABLE IF EXISTS `worker_accounts`;
CREATE TABLE `worker_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `work_email` varchar(255) NOT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `department` enum('projects','admin','finance','hr','hse','realestate') DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `account_type` enum('staff','worker','contractor') NOT NULL,
  `access_level` enum('basic','standard','supervisor') NOT NULL,
  `temporary_password` varchar(255) NOT NULL,
  `account_notes` text,
  `profile_picture` text,
  `id_document` text,
  `contract_document` text,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_document_data` longblob,
  `id_document_mime` varchar(100) DEFAULT NULL,
  `contract_document_data` longblob,
  `contract_document_mime` varchar(100) DEFAULT NULL,
  `profile_picture_data` longblob,
  `profile_picture_mime` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_work_email` (`work_email`),
  KEY `idx_department` (`department`),
  KEY `idx_account_type` (`account_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in worker_accounts

-- ----------------------------
-- Table: worker_action
-- ----------------------------
DROP TABLE IF EXISTS `worker_action`;
CREATE TABLE `worker_action` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `action_type` enum('suspend','terminate','demote') NOT NULL,
  `action_date` date NOT NULL,
  `reason_category` enum('misconduct','performance','violation','redundancy','restructuring','other') NOT NULL,
  `action_details` text NOT NULL,
  `suspension_days` int DEFAULT NULL,
  `final_payment_date` date DEFAULT NULL,
  `md_notes` text,
  `decided_by` varchar(255) NOT NULL,
  `decided_date` date NOT NULL,
  `status` enum('pending','executed','cancelled') DEFAULT 'executed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in worker_action

-- ----------------------------
-- Table: worker_assignments
-- ----------------------------
DROP TABLE IF EXISTS `worker_assignments`;
CREATE TABLE `worker_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `project_id` varchar(50) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `role_in_project` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `assignment_notes` text,
  `status` varchar(50) DEFAULT 'Active',
  `assigned_by` varchar(255) NOT NULL,
  `assigned_by_role` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in worker_assignments

-- ----------------------------
-- Table: workflow_history
-- ----------------------------
DROP TABLE IF EXISTS `workflow_history`;
CREATE TABLE `workflow_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instance_id` varchar(100) NOT NULL,
  `previous_state` varchar(100) DEFAULT NULL,
  `new_state` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `actor` varchar(100) NOT NULL,
  `comments` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `workflow_history_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `workflow_instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workflow_history

-- ----------------------------
-- Table: workflow_instances
-- ----------------------------
DROP TABLE IF EXISTS `workflow_instances`;
CREATE TABLE `workflow_instances` (
  `id` varchar(100) NOT NULL,
  `workflow_name` varchar(100) NOT NULL,
  `current_state` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `payload_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workflow_instances

-- ----------------------------
-- Table: workforce_budget_approvals
-- ----------------------------
DROP TABLE IF EXISTS `workforce_budget_approvals`;
CREATE TABLE `workforce_budget_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `budget_id` varchar(50) NOT NULL,
  `approved_by` varchar(255) NOT NULL,
  `approved_by_role` varchar(100) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `comments` text,
  `final_decision` enum('Approved','Rejected','Modification Required') DEFAULT 'Approved',
  `approved_amount` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_budget_id` (`budget_id`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_decision` (`final_decision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workforce_budget_approvals

-- ----------------------------
-- Table: workforce_budget_modifications
-- ----------------------------
DROP TABLE IF EXISTS `workforce_budget_modifications`;
CREATE TABLE `workforce_budget_modifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `budget_id` varchar(50) NOT NULL,
  `modification_request` text NOT NULL,
  `requested_by` varchar(255) NOT NULL,
  `requested_by_role` varchar(100) DEFAULT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `response` text,
  `response_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_budget_id` (`budget_id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workforce_budget_modifications

-- ----------------------------
-- Table: workforce_budget_rejections
-- ----------------------------
DROP TABLE IF EXISTS `workforce_budget_rejections`;
CREATE TABLE `workforce_budget_rejections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `budget_id` varchar(50) NOT NULL,
  `rejection_reason` text NOT NULL,
  `rejected_by` varchar(255) NOT NULL,
  `rejected_by_role` varchar(100) DEFAULT NULL,
  `rejection_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notified_finance` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_budget_id` (`budget_id`),
  KEY `idx_rejected_by` (`rejected_by`),
  KEY `idx_notified` (`notified_finance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workforce_budget_rejections

-- ----------------------------
-- Table: workforce_budgets
-- ----------------------------
DROP TABLE IF EXISTS `workforce_budgets`;
CREATE TABLE `workforce_budgets` (
  `id` varchar(50) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `budget_period` varchar(100) NOT NULL,
  `total_proposed` decimal(15,2) NOT NULL,
  `salaries_wages` decimal(15,2) NOT NULL,
  `training_development` decimal(15,2) NOT NULL,
  `employee_benefits` decimal(15,2) NOT NULL,
  `recruitment_costs` decimal(15,2) NOT NULL,
  `travel_transport` decimal(15,2) DEFAULT '0.00',
  `miscellaneous` decimal(15,2) DEFAULT '0.00',
  `submitted_by` varchar(255) NOT NULL,
  `submitted_by_role` varchar(100) DEFAULT NULL,
  `submission_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Approved','Rejected','Modification Requested') DEFAULT 'Pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `modification_request` text,
  `current_headcount` int DEFAULT '0',
  `justification` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_period` (`budget_period`),
  KEY `idx_date` (`submission_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workforce_budgets

-- ----------------------------
-- Table: workforce_requests
-- ----------------------------
DROP TABLE IF EXISTS `workforce_requests`;
CREATE TABLE `workforce_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `request_type` enum('additional','replacement','specialized','temporary') NOT NULL,
  `workers_needed` int NOT NULL,
  `duration` varchar(100) NOT NULL,
  `job_categories` text NOT NULL,
  `justification` text NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `special_requirements` text,
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending',
  `requested_by` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`),
  CONSTRAINT `workforce_requests_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- No data in workforce_requests

SET FOREIGN_KEY_CHECKS = 1;

-- Backup complete
