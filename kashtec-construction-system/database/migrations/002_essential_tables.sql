-- Essential Tables Migration - Fix for broken 001_create_tables.sql
-- This creates the minimum required tables for the system to function

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role ENUM('admin', 'hr', 'finance', 'projects', 'operations', 'realestate') DEFAULT 'hr',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  contract_value DECIMAL(15,2) NOT NULL,
  manager VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('planning', 'in_progress', 'completed', 'on_hold') DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  employee_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  department VARCHAR(100),
  salary DECIMAL(10,2),
  email VARCHAR(255),
  phone VARCHAR(50),
  status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department),
  INDEX idx_status (status)
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  description TEXT,
  status ENUM('Available', 'Sold', 'Under Contract') DEFAULT 'Available',
  owner VARCHAR(255),
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  industry VARCHAR(100),
  client_type VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Senior Hiring Requests table
CREATE TABLE IF NOT EXISTS senior_hiring_requests (
  id VARCHAR(50) PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  proposed_salary VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  experience TEXT,
  hr_recommendation TEXT,
  position_level ENUM('Senior', 'Manager', 'Director') DEFAULT 'Senior',
  requested_by VARCHAR(255) NOT NULL,
  requested_by_role VARCHAR(100),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Approved', 'Rejected', 'More Info Requested') DEFAULT 'Pending',
  approved_by VARCHAR(255),
  approved_date TIMESTAMP,
  rejection_reason TEXT,
  more_info_request TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by),
  INDEX idx_department (department),
  INDEX idx_date (request_date)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIME NULL,
  check_out_time TIME NULL,
  attendance_status ENUM('present', 'absent', 'late', 'sick', 'annual', 'permission') NOT NULL,
  notes TEXT,
  marked_by VARCHAR(255),
  marked_by_role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_id (employee_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_attendance_status (attendance_status),
  INDEX idx_marked_by (marked_by),
  UNIQUE KEY unique_employee_date (employee_id, attendance_date)
);

-- Schedule Meetings table
CREATE TABLE IF NOT EXISTS schedule_meetings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meeting_title VARCHAR(255) NOT NULL,
  meeting_type ENUM('board', 'management', 'department', 'project', 'client', 'training', 'general') NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  organizing_department ENUM('management', 'hr', 'finance', 'projects', 'operations', 'realestate') NOT NULL,
  expected_attendees INT DEFAULT 1,
  meeting_description TEXT,
  projector_required BOOLEAN DEFAULT FALSE,
  whiteboard_required BOOLEAN DEFAULT FALSE,
  refreshments_required BOOLEAN DEFAULT FALSE,
  parking_required BOOLEAN DEFAULT FALSE,
  status ENUM('Scheduled', 'Confirmed', 'Cancelled', 'Completed', 'Postponed') DEFAULT 'Scheduled',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_meeting_date (meeting_date),
  INDEX idx_meeting_type (meeting_type),
  INDEX idx_department (organizing_department),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by)
);

-- Meeting Minutes table
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id INT NOT NULL,
  meeting_title VARCHAR(255) NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_type ENUM('board', 'management', 'department', 'project', 'client', 'training', 'general') NOT NULL,
  location VARCHAR(255),
  organizing_department ENUM('management', 'hr', 'finance', 'projects', 'operations', 'realestate') NOT NULL,
  attendees TEXT,
  minutes_content TEXT NOT NULL,
  action_items TEXT,
  decisions_made TEXT,
  next_steps TEXT,
  follow_up_date DATE,
  status ENUM('Draft', 'Pending Review', 'Approved', 'Distributed') DEFAULT 'Draft',
  prepared_by VARCHAR(255) NOT NULL,
  reviewed_by VARCHAR(255),
  approved_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES schedule_meetings(id) ON DELETE CASCADE,
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_meeting_date (meeting_date),
  INDEX idx_status (status)
);

-- Workforce Budgets table
CREATE TABLE IF NOT EXISTS workforce_budgets (
  id VARCHAR(50) PRIMARY KEY,
  budget_period VARCHAR(100) NOT NULL,
  total_proposed DECIMAL(15,2) NOT NULL,
  salaries_wages DECIMAL(15,2) NOT NULL,
  training_development DECIMAL(15,2) NOT NULL,
  employee_benefits DECIMAL(15,2) NOT NULL,
  recruitment_costs DECIMAL(15,2) NOT NULL,
  submitted_by VARCHAR(255) NOT NULL,
  submitted_by_role VARCHAR(100),
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Approved', 'Rejected', 'Modification Requested') DEFAULT 'Pending',
  approved_by VARCHAR(255),
  approved_date TIMESTAMP,
  rejection_reason TEXT,
  modification_request TEXT,
  current_headcount INT DEFAULT 0,
  justification TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_period (budget_period),
  INDEX idx_date (submission_date)
);

-- Insert essential sample data
INSERT IGNORE INTO users (name, email, password, role, status) VALUES
('HR Manager', 'hr@manager0501', '$2a$12$AFEzay0Y3Bk8j1VTLuHVjOIf/zVCfj0S9jlJkKQuBX7wFViBPe8Mm', 'hr', 'active'),
('Admin', 'admin@kashtec.com', '$2a$12$AFEzay0Y3Bk8j1VTLuHVjOIf/zVCfj0S9jlJkKQuBX7wFViBPe8Mm', 'admin', 'active');

INSERT IGNORE INTO senior_hiring_requests (id, candidate_name, proposed_salary, department, experience, position_level, requested_by, requested_by_role) VALUES
('proj-manager-001', 'John Smith', 'TZS 5,000,000', 'Projects', '10+ years in construction management', 'Manager', 'HR Manager', 'HR Manager'),
('senior-engineer-001', 'Jane Doe', 'TZS 4,500,000', 'Operations', '15+ years in civil engineering', 'Senior', 'HR Manager', 'HR Manager');

INSERT IGNORE INTO workforce_budgets (id, budget_period, total_proposed, salaries_wages, training_development, employee_benefits, recruitment_costs, submitted_by, submitted_by_role, current_headcount, justification) VALUES
('q2-2026-workforce', 'Q2 2026 Workforce Budget', 50000000.00, 30000000.00, 5000000.00, 10000000.00, 5000000.00, 'Finance Manager', 'Finance Manager', 25, 'Q2 workforce expansion for new projects'),
('q3-2026-workforce', 'Q3 2026 Workforce Budget', 55000000.00, 33000000.00, 5500000.00, 11000000.00, 5500000.00, 'Finance Manager', 'Finance Manager', 28, 'Q3 workforce expansion and training programs');
