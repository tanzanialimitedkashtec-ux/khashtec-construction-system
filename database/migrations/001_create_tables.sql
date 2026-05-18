-- KASHTEC Construction Management System - Complete Database Schema
-- This file contains all table definitions and seed data
-- Version: 3.0 - Railway Compatible (NO unsupported commands)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  service_type VARCHAR(100),
  custom_service TEXT,
  additional_info TEXT,
  password VARCHAR(255) NOT NULL,
  role ENUM('Customer', 'Managing Director', 'HR Manager', 'Finance Manager', 'Project Manager', 'Real Estate Manager', 'HSE Manager', 'Office Assistant', 'Worker') DEFAULT 'Customer',
  department ENUM('Management', 'Human Resources', 'Finance', 'Project Management', 'Real Estate', 'Health & Safety', 'Administrative', 'Workers', 'Clients') DEFAULT 'Clients',
  registration_date DATE,
  status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_department (department),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status ENUM('Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Planning',
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  manager_id INT,
  client_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_manager (manager_id),
  INDEX idx_client (client_id),
  INDEX idx_dates (start_date, end_date)
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  employee_id VARCHAR(50) UNIQUE,
  position VARCHAR(255),
  department VARCHAR(100),
  salary DECIMAL(10,2),
  hire_date DATE,
  status ENUM('Active', 'Inactive', 'Terminated') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department),
  INDEX idx_status (status)
);

-- Employee details table for personal information
CREATE TABLE IF NOT EXISTS employee_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  full_name VARCHAR(255) NOT NULL,
  gmail VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  nida VARCHAR(50) UNIQUE,
  passport VARCHAR(50),
  contract_type VARCHAR(100),
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_gmail (gmail),
  INDEX idx_nida (nida),
  INDEX idx_employee_id (employee_id)
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  type ENUM('Residential', 'Commercial', 'Industrial', 'Land', 'Mixed Use') DEFAULT 'Residential',
  price DECIMAL(12,2),
  status ENUM('Available', 'Sold', 'Under Offer', 'Rented', 'Off Market') DEFAULT 'Available',
  size_sqm DECIMAL(10,2),
  bedrooms INT,
  bathrooms INT,
  parking_spaces INT,
  year_built INT,
  agent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_location (location),
  INDEX idx_price (price)
);

-- Financial Transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('Income', 'Expense', 'Transfer') NOT NULL,
  category VARCHAR(100),
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  project_id INT,
  property_id INT,
  created_by INT,
  status ENUM('Pending', 'Approved', 'Rejected', 'Processed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_date (date),
  INDEX idx_status (status)
);

-- HSE Incidents table
CREATE TABLE IF NOT EXISTS hse_incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_number VARCHAR(50) UNIQUE,
  type ENUM('Accident', 'Near Miss', 'Injury', 'Illness', 'Property Damage', 'Environmental') NOT NULL,
  severity ENUM('Minor', 'Moderate', 'Major', 'Critical', 'Fatal') NOT NULL,
  location VARCHAR(255),
  description TEXT NOT NULL,
  root_cause TEXT,
  immediate_actions TEXT,
  preventive_measures TEXT,
  incident_date DATETIME,
  reported_by INT,
  project_id INT,
  status ENUM('Open', 'Under Investigation', 'Closed', 'Follow-up Required') DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  INDEX idx_incident_number (incident_number),
  INDEX idx_type (type),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_date (incident_date)
);

-- PPE Issuance table
CREATE TABLE IF NOT EXISTS ppe_issuance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  ppe_type ENUM('Helmet', 'Gloves', 'Boots', 'Vest', 'Goggles', 'Mask', 'Harness', 'Ear Plugs', 'Other') NOT NULL,
  ppe_condition ENUM('New', 'Good', 'Replacement') DEFAULT 'New',
  issue_date DATE,
  return_date DATE,
  issued_by INT,
  project_id INT,
  notes TEXT,
  status ENUM('Issued', 'Returned', 'Lost', 'Damaged') DEFAULT 'Issued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  INDEX idx_employee (employee_id),
  INDEX idx_ppe_type (ppe_type),
  INDEX idx_status (status),
  INDEX idx_issue_date (issue_date)
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  category ENUM('Document', 'Image', 'Video', 'Other') DEFAULT 'Document',
  uploaded_by INT,
  reference_type VARCHAR(100),
  reference_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_category (category)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT,
  file_type VARCHAR(100),
  category ENUM('Contract', 'Plan', 'Report', 'Invoice', 'Permit', 'Certificate', 'Other') DEFAULT 'Other',
  project_id INT,
  uploaded_by INT,
  status ENUM('Draft', 'Pending', 'Approved', 'Rejected') DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project (project_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_category (category),
  INDEX idx_status (status)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('Info', 'Warning', 'Error', 'Success') DEFAULT 'Info',
  recipient_id INT,
  sender_id INT,
  related_type VARCHAR(100),
  related_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recipient (recipient_id),
  INDEX idx_sender (sender_id),
  INDEX idx_read (is_read),
  INDEX idx_priority (priority),
  INDEX idx_created (created_at)
);

-- Authentication table for department login
CREATE TABLE IF NOT EXISTS authentication (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  manager_name VARCHAR(255),
  status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
  last_login TIMESTAMP NULL,
  login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_department_code (department_code),
  INDEX idx_status (status),
  INDEX idx_role (role)
);

-- Insert department authentication records with bcrypt-hashed passwords
INSERT IGNORE INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status) VALUES
('MD', 'md@kashtec.com', '$2a$12$XhtyjBmSQhLUiujs5z8eJOcqttKbz8ETU.EFoK2W7z.GsGdbGk2zS', 'Managing Director', 'Managing Director Office', 'Dr. John Smith', 'Active'),
('ADMIN', 'admin@kashtec.com', '$2a$12$SfQ9DSzkHjfdTehs/TK74uc4O23wu67DMN4gjJQeTA65OSULeXkNK', 'Director of Administration', 'Administration', 'Director of Administration', 'Active'),
('HR', 'hr@manager0501', '$2a$12$u4hD21O0QZtvEvbIvdJjh..2QiVqgRl8DknMbNVqC1KBFRvrxH0Mi', 'HR Manager', 'Human Resources', 'HR Manager', 'Active'),
('HSE', 'hse@manager0501', '$2a$12$WWPko/z72pyYTbUln8Xi3etvBABCFnLF0LrJJQTSKJzTQyxFkWAxG', 'HSE Manager', 'Health & Safety', 'HSE Manager', 'Active'),
('FINANCE', 'finance@manager0501', '$2a$12$nh9qCec.Nvna8qmCiB0tre2oMGNEFE5XPcZEWQSrfj4QyQGipufm6', 'Finance Manager', 'Finance', 'Finance Manager', 'Active'),
('PROJECT', 'pm@manager0501', '$2a$12$ra/f342th7SdNvMcQQpLtOCYrLhT2p2eoiRvM3mEdFCi/Dq/hL6E6', 'Project Manager', 'Project Management', 'Project Manager', 'Active'),
('REALESTATE', 'realestate@manager0501', '$2a$12$RUiTHJSgb6D0WEE9eEgV/O7g67aIi6r4JwI9ibzVAGrn7RTIFNJZW', 'Real Estate Manager', 'Real Estate', 'Real Estate Manager', 'Active'),
('ASSISTANT', 'assistant@kashtec.com', '$2a$12$rA44utD7vBN.8JKXKoHugOo9hEcnNGi4WXrP8Zk4HanG9FpFzvZ/2', 'Admin Assistant', 'Administration', 'Admin Assistant', 'Active');

-- Office Portal table for department management
CREATE TABLE IF NOT EXISTS office_portal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL,
  department_code VARCHAR(50) UNIQUE NOT NULL,
  manager_email VARCHAR(255),
  description TEXT,
  settings JSON,
  status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department_code (department_code),
  INDEX idx_status (status)
);

-- Insert initial office portal data
INSERT IGNORE INTO office_portal (department_name, department_code, manager_email, description, settings, status) VALUES
('Human Resources', 'HR', 'hr@manager0501', 'HR Department manages employee relations, recruitment, training, and compliance', '{"theme": "blue", "notifications": true}', 'Active'),
('Project Management', 'PM', 'pm@manager0501', 'Project Management oversees all construction projects, timelines, and resource allocation', '{"theme": "green", "notifications": true}', 'Active'),
('Finance', 'FINANCE', 'finance@manager0501', 'Finance Department handles budgeting, accounting, and financial reporting', '{"theme": "orange", "notifications": true}', 'Active'),
('Operations', 'OPS', 'operations@manager0501', 'Operations Department manages daily operations, logistics, and field coordination', '{"theme": "purple", "notifications": true}', 'Active'),
('Real Estate', 'REALESTATE', 'realestate@manager0501', 'Real Estate Department handles property acquisitions, sales, and facility management', '{"theme": "red", "notifications": true}', 'Active'),
('Health & Safety', 'HSE', 'hse@manager0501', 'HSE Department ensures workplace safety, compliance, and incident reporting', '{"theme": "yellow", "notifications": true}', 'Active'),
('Administration', 'ADMIN', 'admin@kashtec.com', 'System Administration provides IT support, user management, and system configuration', '{"theme": "gray", "notifications": true}', 'Active');

-- PPE (Personal Protective Equipment) table
CREATE TABLE IF NOT EXISTS ppe_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  ppe_type ENUM('Helmet', 'Gloves', 'Boots', 'Vest', 'Goggles', 'Mask', 'Harness', 'Ear Plugs', 'Other') NOT NULL,
  quantity INT DEFAULT 0,
  min_quantity INT DEFAULT 5,
  item_condition ENUM('New', 'Good', 'Worn', 'Damaged') DEFAULT 'Good',
  last_inspected DATE,
  storage_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (ppe_type),
  INDEX idx_condition (item_condition),
  INDEX idx_quantity (quantity)
);

-- Policy Management Tables
CREATE TABLE IF NOT EXISTS policies (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  submitted_by VARCHAR(255) NOT NULL,
  submitted_by_role VARCHAR(100),
  submission_date DATE,
  impact ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  status ENUM('Pending', 'Approved', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  approved_by VARCHAR(255),
  approved_date DATE,
  rejection_reason TEXT,
  revision_request TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_date (submission_date)
);

CREATE TABLE IF NOT EXISTS policy_revisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_id VARCHAR(50) NOT NULL,
  revision_request TEXT NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  requested_by_role VARCHAR(100),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  response TEXT,
  response_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_policy_id (policy_id),
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by)
);

CREATE TABLE IF NOT EXISTS policy_rejections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_id VARCHAR(50) NOT NULL,
  rejection_reason TEXT NOT NULL,
  rejected_by VARCHAR(255) NOT NULL,
  rejected_by_role VARCHAR(100),
  rejection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_department BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_policy_id (policy_id),
  INDEX idx_rejected_by (rejected_by),
  INDEX idx_notified (notified_department)
);

-- Senior Staff Hiring Tables
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

CREATE TABLE IF NOT EXISTS senior_hiring_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(50) NOT NULL,
  approved_by VARCHAR(255) NOT NULL,
  approved_by_role VARCHAR(100),
  approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comments TEXT,
  final_decision ENUM('Approved', 'Rejected', 'More Info Required') DEFAULT 'Approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request_id (request_id),
  INDEX idx_approved_by (approved_by),
  INDEX idx_decision (final_decision)
);

CREATE TABLE IF NOT EXISTS senior_hiring_rejections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(50) NOT NULL,
  rejection_reason TEXT NOT NULL,
  rejected_by VARCHAR(255) NOT NULL,
  rejected_by_role VARCHAR(100),
  rejection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_hr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request_id (request_id),
  INDEX idx_rejected_by (rejected_by),
  INDEX idx_notified (notified_hr)
);

CREATE TABLE IF NOT EXISTS senior_hiring_info_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(50) NOT NULL,
  info_required TEXT NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  requested_by_role VARCHAR(100),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Provided', 'Closed') DEFAULT 'Pending',
  response TEXT,
  response_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request_id (request_id),
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by)
);

-- Workforce Budget Tables
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

CREATE TABLE IF NOT EXISTS workforce_budget_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id VARCHAR(50) NOT NULL,
  approved_by VARCHAR(255) NOT NULL,
  approved_by_role VARCHAR(100),
  approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comments TEXT,
  final_decision ENUM('Approved', 'Rejected', 'Modification Required') DEFAULT 'Approved',
  approved_amount DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_budget_id (budget_id),
  INDEX idx_approved_by (approved_by),
  INDEX idx_decision (final_decision)
);

CREATE TABLE IF NOT EXISTS workforce_budget_rejections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id VARCHAR(50) NOT NULL,
  rejection_reason TEXT NOT NULL,
  rejected_by VARCHAR(255) NOT NULL,
  rejected_by_role VARCHAR(100),
  rejection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_finance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_budget_id (budget_id),
  INDEX idx_rejected_by (rejected_by),
  INDEX idx_notified (notified_finance)
);

CREATE TABLE IF NOT EXISTS workforce_budget_modifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id VARCHAR(50) NOT NULL,
  modification_request TEXT NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  requested_by_role VARCHAR(100),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  response TEXT,
  response_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_budget_id (budget_id),
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by)
);

-- Clients Table for Real Estate Department
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(50) UNIQUE NOT NULL,
  client_type ENUM('individual', 'company', 'investor') NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  nida_number VARCHAR(50) NOT NULL,
  tin_number VARCHAR(50),
  physical_address TEXT NOT NULL,
  property_interest ENUM('residential', 'commercial', 'investment', 'agricultural'),
  budget_range ENUM('below-50m', '50m-100m', '100m-500m', 'above-500m'),
  additional_notes TEXT,
  registered_by VARCHAR(255) NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'prospective') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_client_id (client_id),
  INDEX idx_client_type (client_type),
  INDEX idx_status (status),
  INDEX idx_registered_by (registered_by),
  INDEX idx_registration_date (registration_date)
);

-- Department Work Tables
CREATE TABLE IF NOT EXISTS hr_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'HR',
  work_type ENUM('Employee Registration', 'Worker Account Creation', 'Project Assignment', 'Attendance Tracking', 'Leave Management', 'Contract Management', 'Policy Management', 'Senior Staff Hiring', 'Budget Approval', 'Employment Action') DEFAULT 'Employee Registration',
  work_title VARCHAR(255) NOT NULL,
  work_description TEXT,
  employee_name VARCHAR(255),
  employee_email VARCHAR(255),
  project_name VARCHAR(255),
  status ENUM('Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  submitted_by VARCHAR(255),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  due_date DATE,
  completion_date TIMESTAMP NULL,
  approved_by VARCHAR(255),
  approved_date DATE,
  rejection_reason TEXT,
  revision_request TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department_code),
  INDEX idx_work_type (work_type),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS finance_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'FINANCE',
  work_type ENUM('Budget Management', 'Financial Reporting', 'Payroll Processing', 'Expense Control', 'Audits', 'Compliance', 'Invoice Processing', 'Budget Approval') DEFAULT 'Budget Management',
  work_title VARCHAR(255) NOT NULL,
  work_description TEXT,
  amount DECIMAL(15,2),
  vendor_name VARCHAR(255),
  invoice_number VARCHAR(100),
  status ENUM('Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  submitted_by VARCHAR(255),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  due_date DATE,
  completion_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department_code),
  INDEX idx_work_type (work_type),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS hse_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'HSE',
  work_type ENUM('Incident Reporting', 'Safety Policy Upload', 'Toolbox Meeting', 'PPE Issuance', 'Safety Violation', 'Inspection Report', 'Safety Training', 'Project Safety Status') DEFAULT 'Incident Reporting',
  work_title VARCHAR(255) NOT NULL,
  work_description TEXT,
  incident_type VARCHAR(100),
  severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  location VARCHAR(255),
  project_name VARCHAR(255),
  status ENUM('Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  submitted_by VARCHAR(255),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  due_date DATE,
  completion_date TIMESTAMP NULL,
  approved_by VARCHAR(255),
  approved_date DATE,
  rejection_reason TEXT,
  revision_request TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department_code),
  INDEX idx_work_type (work_type),
  INDEX idx_severity (severity),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS projects_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'PROJECT',
  work_type ENUM('Project Creation', 'Project Assignment', 'Progress Update', 'Task Assignment', 'Workforce Request', 'Site Report', 'Work Approval', 'Project Completion', 'Resource Management') DEFAULT 'Project Creation',
  work_title VARCHAR(255) NOT NULL,
  work_description TEXT,
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  project_phase ENUM('Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Planning',
  status ENUM('Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  submitted_by VARCHAR(255),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  due_date DATE,
  completion_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department_code),
  INDEX idx_work_type (work_type),
  INDEX idx_project_phase (project_phase),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS realestate_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'REALESTATE',
  work_type ENUM('Property Addition', 'Property Editing', 'Client Registration', 'Sale Recording', 'Payment Tracking', 'Sales Report', 'Property Management', 'Client Communication') DEFAULT 'Property Addition',
  work_title VARCHAR(255) NOT NULL,
  work_description TEXT,
  property_address VARCHAR(255),
  property_type VARCHAR(100),
  client_name VARCHAR(255),
  sale_amount DECIMAL(15,2),
  status ENUM('Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  submitted_by VARCHAR(255),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  due_date DATE,
  completion_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department_code),
  INDEX idx_work_type (work_type),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS admin_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'ADMIN',
  work_type ENUM('Administrative Operations', 'Compliance Management', 'Staff Oversight', 'Policy Implementation', 'Document Management', 'Document Upload', 'Project Creation', 'Safety Policy Upload', 'Toolbox Meeting', 'PPE Issuance', 'Safety Violation', 'Inspection Report', 'Budget Management', 'Expense Report', 'Property Management', 'Client Registration', 'User Account Management', 'System Administration', 'Department Coordination') DEFAULT 'Administrative Operations',
  work_title VARCHAR(255) NOT NULL,
  work_description TEXT,
  affected_department VARCHAR(100),
  deadline DATE,
  status ENUM('Pending', 'In Progress', 'Completed', 'Rejected', 'Revision Requested') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  submitted_by VARCHAR(255),
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_to VARCHAR(255),
  due_date DATE,
  completion_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department_code),
  INDEX idx_work_type (work_type),
  INDEX idx_affected_department (affected_department),
  INDEX idx_submitted_by (submitted_by),
  INDEX idx_due_date (due_date)
);

-- Work Comments and Actions Tables
CREATE TABLE IF NOT EXISTS work_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT NOT NULL,
  work_table VARCHAR(50) NOT NULL,
  comment TEXT NOT NULL,
  commented_by VARCHAR(255) NOT NULL,
  commented_by_role VARCHAR(100),
  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_work_id (work_id),
  INDEX idx_work_table (work_table),
  INDEX idx_commented_by (commented_by)
);

-- Mission & Vision Management Table
CREATE TABLE IF NOT EXISTS mission_vision (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mission_statement TEXT NOT NULL,
  mission_category VARCHAR(100),
  mission_last_reviewed DATE,
  vision_statement TEXT NOT NULL,
  vision_timeframe VARCHAR(50),
  vision_last_reviewed DATE,
  core_values JSON,
  additional_values TEXT,
  short_term_objectives TEXT,
  long_term_objectives TEXT,
  stakeholder_focus JSON,
  communication_strategy TEXT,
  integration_strategy TEXT,
  review_frequency VARCHAR(50),
  next_review_date DATE,
  success_metrics TEXT,
  notes TEXT,
  submitted_by VARCHAR(255),
  submitted_date DATE,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_submitted_date (submitted_date)
);

-- Leadership Management Table
CREATE TABLE IF NOT EXISTS leadership_management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  current_holder VARCHAR(255) NOT NULL,
  reports_to VARCHAR(255) NOT NULL,
  leadership_level VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  responsibilities JSON,
  strategic_thinking VARCHAR(50),
  decision_making VARCHAR(50),
  communication_skills VARCHAR(50),
  team_leadership VARCHAR(50),
  succession_status VARCHAR(50),
  potential_successors TEXT,
  development_timeline TEXT,
  kpis TEXT,
  review_frequency VARCHAR(50),
  last_review_date DATE,
  notes TEXT,
  submitted_by VARCHAR(255),
  submitted_date DATE,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_submitted_date (submitted_date)
);

-- Long-Term Growth Strategy Table
CREATE TABLE IF NOT EXISTS long_term_growth (
  id INT AUTO_INCREMENT PRIMARY KEY,
  growth_title VARCHAR(255) NOT NULL,
  growth_category VARCHAR(100) NOT NULL,
  timeframe VARCHAR(50) NOT NULL,
  target_markets JSON,
  expansion_strategy TEXT,
  investment_requirements TEXT,
  risk_assessment TEXT,
  milestones JSON,
  success_metrics TEXT,
  implementation_plan TEXT,
  notes TEXT,
  submitted_by VARCHAR(255),
  submitted_date DATE,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_growth_category (growth_category),
  INDEX idx_submitted_date (submitted_date)
);

-- Investment Management Table
CREATE TABLE IF NOT EXISTS investment_management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investment_title VARCHAR(255) NOT NULL,
  investment_type ENUM('equity', 'fixed-income', 'real-estate', 'project', 'equipment', 'cash-reserve', 'other') NOT NULL,
  asset_class VARCHAR(100),
  investment_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TZS',
  investment_date DATE NOT NULL,
  expected_return DECIMAL(6,2),
  risk_level ENUM('low', 'medium', 'high', 'very-high') DEFAULT 'medium',
  status ENUM('planned', 'active', 'paused', 'closed') DEFAULT 'planned',
  maturity_date DATE,
  allocation_percentage DECIMAL(5,2),
  counterparty VARCHAR(255),
  investment_objective TEXT,
  notes TEXT,
  submitted_by VARCHAR(255),
  submitted_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_investment_type (investment_type),
  INDEX idx_status (status),
  INDEX idx_investment_date (investment_date),
  INDEX idx_risk_level (risk_level)
);

CREATE TABLE IF NOT EXISTS work_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT NOT NULL,
  work_table VARCHAR(50) NOT NULL,
  action_type ENUM('Created', 'Assigned', 'In Progress', 'Completed', 'Rejected', 'Revision Requested', 'Approved') DEFAULT 'Created',
  action_description TEXT,
  action_by VARCHAR(255) NOT NULL,
  action_by_role VARCHAR(100),
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_action_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_work_id (work_id),
  INDEX idx_work_table (work_table),
  INDEX idx_action_type (action_type),
  INDEX idx_action_by (action_by)
);

CREATE TABLE IF NOT EXISTS work_rejections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT NOT NULL,
  work_table VARCHAR(50) NOT NULL,
  rejection_reason TEXT NOT NULL,
  rejection_details TEXT,
  rejected_by VARCHAR(255) NOT NULL,
  rejected_by_role VARCHAR(100),
  rejection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified_submitter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_work_id (work_id),
  INDEX idx_work_table (work_table),
  INDEX idx_rejected_by (rejected_by),
  INDEX idx_notified (notified_submitter)
);

CREATE TABLE IF NOT EXISTS work_revisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id INT NOT NULL,
  work_table VARCHAR(50) NOT NULL,
  revision_request TEXT NOT NULL,
  revision_details TEXT,
  requested_by VARCHAR(255) NOT NULL,
  requested_by_role VARCHAR(100),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  response TEXT,
  response_date TIMESTAMP NULL,
  responded_by VARCHAR(255),
  responded_by_role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_work_id (work_id),
  INDEX idx_work_table (work_table),
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by),
  INDEX idx_response_date (response_date)
);

-- Schedule Meeting table
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

-- Worker Accounts table
CREATE TABLE IF NOT EXISTS worker_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  work_email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  department ENUM('projects', 'admin', 'finance', 'hr', 'hse', 'realestate') NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  account_type ENUM('staff', 'worker', 'contractor') NOT NULL,
  access_level ENUM('basic', 'standard', 'supervisor') NOT NULL,
  temporary_password VARCHAR(255) NOT NULL,
  account_notes TEXT,
  profile_picture VARCHAR(255),
  id_document VARCHAR(255),
  contract_document VARCHAR(255),
  status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  INDEX idx_employee_id (employee_id),
  INDEX idx_work_email (work_email),
  INDEX idx_department (department),
  INDEX idx_account_type (account_type),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Worker Assignments table
CREATE TABLE IF NOT EXISTS worker_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  project_id VARCHAR(50) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  role_in_project VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  assignment_notes TEXT,
  status ENUM('Active', 'Completed', 'Transferred', 'On Hold', 'Terminated') DEFAULT 'Active',
  assigned_by VARCHAR(255) NOT NULL,
  assigned_by_role VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_employee_id (employee_id),
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_assigned_by (assigned_by)
);

-- Insert sample worker assignment data
INSERT IGNORE INTO worker_assignments (
  employee_id, 
  employee_name, 
  project_id, 
  project_name, 
  role_in_project, 
  start_date, 
  end_date, 
  assignment_notes, 
  status, 
  assigned_by, 
  assigned_by_role
) VALUES
('emp001', 'John Doe', 'proj001', 'Dar es Salaam Port Modernization', 'Site Supervisor', '2026-01-15', NULL, 'Leading the port modernization team', 'Active', 'HR Manager', 'HR Manager'),
('emp002', 'Jane Smith', 'proj002', 'Residential Buildings - Kinondoni', 'Project Manager', '2026-02-01', '2026-03-15', 'Successfully completed residential project', 'Completed', 'HR Manager', 'HR Manager'),
('emp003', 'Mike Johnson', 'proj003', 'Fukayosi Real Estate Project', 'Construction Worker', '2026-01-20', NULL, 'Skilled labor for real estate development', 'Active', 'HR Manager', 'HR Manager'),
('emp004', 'Sarah Wilson', 'proj004', 'Road Construction - Bagamoyo', 'Engineer', '2026-03-01', NULL, 'Road construction and infrastructure work', 'Active', 'HR Manager', 'HR Manager');

-- Insert sample mission & vision data
INSERT IGNORE INTO mission_vision (
    mission_statement, 
    mission_category, 
    mission_last_reviewed, 
    vision_statement, 
    vision_timeframe, 
    vision_last_reviewed, 
    core_values, 
    additional_values, 
    short_term_objectives, 
    long_term_objectives, 
    stakeholder_focus, 
    communication_strategy, 
    integration_strategy, 
    review_frequency, 
    next_review_date, 
    success_metrics, 
    notes, 
    submitted_by, 
    submitted_date, 
    status
) VALUES (
    'To deliver exceptional construction services that exceed client expectations through innovation, quality craftsmanship, and sustainable practices.', 
    'quality', 
    '2024-03-15', 
    'To become East Africa\'s leading construction company known for sustainable development, innovative solutions, and community impact.', 
    '10-years', 
    '2024-03-15', 
    '["integrity", "excellence", "innovation", "teamwork", "customer-focus"]', 
    'Continuous learning and environmental stewardship', 
    'Expand operations to 3 new regions, achieve 20% revenue growth', 
    'Establish presence in 5 African countries, become carbon neutral', 
    '["customers", "employees", "community", "environment"]', 
    'Quarterly town halls, monthly newsletters, intranet portal', 
    'Performance reviews aligned with values, training programs', 
    'annual', 
    '2025-03-15', 
    'Client satisfaction scores, employee engagement, revenue growth, environmental impact', 
    'Mission and vision reviewed and approved by board of directors', 
    'Managing Director', 
    '2024-01-01', 
    'active'
);

-- Insert sample leadership management data
INSERT IGNORE INTO leadership_management (
    position, 
    department, 
    current_holder, 
    reports_to, 
    leadership_level, 
    appointment_date, 
    responsibilities, 
    strategic_thinking, 
    decision_making, 
    communication_skills, 
    team_leadership, 
    succession_status, 
    potential_successors, 
    development_timeline, 
    kpis, 
    review_frequency, 
    last_review_date, 
    notes, 
    submitted_by, 
    submitted_date, 
    status
) VALUES (
    'Chief Executive Officer', 
    'Executive Office', 
    'John Smith', 
    'Board of Directors', 
    'c-suite', 
    '2024-01-01', 
    '["strategic-planning", "team-management", "financial-oversight"]', 
    'expert', 
    'expert', 
    'expert', 
    'expert', 
    'identified', 
    'Jane Doe, Mike Johnson', 
    '12-month development plan', 
    'Revenue growth, Market expansion, Team satisfaction', 
    'quarterly', 
    '2024-03-15', 
    'Strategic leader with 10+ years experience', 
    'Managing Director', 
    '2024-01-01', 
    'active'
);

-- Insert sample long-term growth strategy data
INSERT IGNORE INTO long_term_growth (
    growth_title, 
    growth_category, 
    timeframe, 
    target_markets, 
    expansion_strategy, 
    investment_requirements, 
    risk_assessment, 
    milestones, 
    success_metrics, 
    implementation_plan, 
    notes, 
    submitted_by, 
    submitted_date, 
    status
) VALUES (
    'East African Expansion Strategy', 
    'market-expansion', 
    '5-years', 
    '["Kenya", "Uganda", "Rwanda", "Burundi", "South Sudan"]', 
    'Strategic partnerships with local construction firms, government infrastructure projects, commercial real estate development', 
    'USD 50M for equipment, partnerships, and local operations setup', 
    'Political stability, currency fluctuations, regulatory compliance, local competition', 
    '["Year 1: Market research and partnerships", "Year 1-3: Project acquisition", "Year 4-6: Scale operations"]', 
    'Market share growth, revenue targets, project completion rates, local employment creation', 
    'Phase 1: Research and partnerships, Phase 2: Pilot projects, Phase 3: Scale operations', 
    'Aligned with company vision to become East Africa\'s leading construction company', 
    'Managing Director', 
    '2024-01-01', 
    'active'
);

-- Insert sample investment management data
INSERT IGNORE INTO investment_management (
    investment_title,
    investment_type,
    asset_class,
    investment_amount,
    currency,
    investment_date,
    expected_return,
    risk_level,
    status,
    maturity_date,
    allocation_percentage,
    counterparty,
    investment_objective,
    notes,
    submitted_by,
    submitted_date
) VALUES (
    'Equipment Upgrade Fund',
    'equipment',
    'Construction Equipment',
    125000000.00,
    'TZS',
    '2026-02-01',
    12.50,
    'medium',
    'active',
    '2028-02-01',
    20.00,
    'KashTec Capital',
    'Modernize fleet to improve project delivery times and reduce maintenance costs.',
    'Aligned with operational efficiency targets.',
    'Finance Manager',
    '2026-02-01'
);

-- Insert admin user (only if not exists)
INSERT IGNORE INTO users (name, email, password, role, status) VALUES
('Admin User', 'admin@kashtec.co.tz', 'admin123', 'Managing Director', 'Active');

-- Insert sample policy for HR to approve
INSERT IGNORE INTO policies (id, title, description, submitted_by, submitted_by_role, impact, status) VALUES
('digital-recruitment', 'Digital Recruitment Platform Policy', 'Implementation of online job portal and digital application system', 'HR Department', 'HR Manager', 'High', 'Pending');

-- Insert sample senior hiring requests
INSERT IGNORE INTO senior_hiring_requests (id, candidate_name, proposed_salary, department, experience, hr_recommendation, position_level, requested_by, requested_by_role, status) VALUES
('proj-manager-001', 'Eng. Michael K. Johnson', 'TZS 3,500,000/month', 'Projects Department', 'Highly qualified candidate with extensive experience in large-scale construction projects. Proven track record in project delivery and team management.', 'Manager', 'HR Department', 'HR Manager', 'Pending'),
('finance-manager-001', 'Sarah M. Kimario', 'TZS 2,800,000/month', 'Finance Department', 'Qualified candidate with CPA certification and experience in construction industry finance. Strong analytical skills and leadership capabilities.', 'Manager', 'HR Department', 'HR Manager', 'Pending');

-- Insert sample workforce budget request
INSERT IGNORE INTO workforce_budgets (id, budget_period, total_proposed, salaries_wages, training_development, employee_benefits, recruitment_costs, submitted_by, submitted_by_role, current_headcount, justification, status) VALUES
('q2-2026-workforce', 'April - June 2026', 61500000.00, 45000000.00, 5000000.00, 8000000.00, 3500000.00, 'Finance Department', 'Finance Manager', 45, 'Budget covers quarterly salaries, training programs, employee benefits, and recruitment costs for expanding project portfolio. Includes 5% increase for cost of living adjustments.', 'Pending');

-- Insert sample department work records
INSERT IGNORE INTO hr_work (department_code, work_type, work_title, work_description, employee_name, employee_email, project_name, status, priority, submitted_by, submitted_date, due_date) VALUES
('HR', 'Employee Registration', 'New Employee Registration', 'Register new employee in HR system', 'John Doe', 'john.doe@kashtec.com', 'HR System Setup', 'Completed', 'Medium', 'HR Manager', '2026-03-22', '2026-03-25'),
('HR', 'Policy Management', 'Policy Approval Required', 'Approve recruitment policy for digital platform', 'HR Manager', 'hr@manager0501', 'Digital Recruitment Policy', 'Pending', 'High', 'HR Manager', '2026-03-22', '2026-03-23'),
('HR', 'Senior Staff Hiring', 'Project Manager Position', 'Hire experienced project manager', 'Eng. Michael K. Johnson', 'michael.johnson@kashtec.com', 'Project Management', 'Pending', 'High', 'HR Manager', '2026-03-22', '2026-03-24');

INSERT IGNORE INTO finance_work (department_code, work_type, work_title, work_description, amount, vendor_name, invoice_number, status, priority, submitted_by, submitted_date, due_date) VALUES
('FINANCE', 'Budget Management', 'Q2 2026 Workforce Budget', 'Approve quarterly workforce budget allocations', 61500000.00, 'Finance Department', 'BUD-2026-Q2', 'Pending', 'High', 'Finance Manager', '2026-03-22', '2026-03-25'),
('FINANCE', 'Financial Reporting', 'Monthly Financial Report', 'Generate monthly financial statements for management', 0, 'Finance Department', 'FR-2026-03', 'In Progress', 'Medium', 'Finance Manager', '2026-03-22', '2026-03-23');

INSERT IGNORE INTO hse_work (department_code, work_type, work_title, work_description, incident_type, severity, location, project_name, status, priority, submitted_by, submitted_date, due_date) VALUES
('HSE', 'Incident Reporting', 'Safety Incident Report', 'Report workplace safety incident', 'Near Miss', 'Medium', 'Construction Site A', 'Building A', 'Pending', 'High', 'HSE Manager', '2026-03-22', '2026-03-23'),
('HSE', 'Safety Policy Upload', 'New Safety Policy', 'Upload updated safety procedures', 'Policy Update', 'High', 'All Sites', 'Company Wide', 'Pending', 'High', 'HSE Manager', '2026-03-22', '2026-03-24'),
('HSE', 'Toolbox Meeting', 'Weekly Safety Meeting', 'Conduct weekly toolbox talk with crew', 'Safety Meeting', 'Medium', 'Construction Site A', 'Building A', 'Pending', 'Medium', 'HSE Manager', '2026-03-22', '2026-03-25'),
('HSE', 'Inspection Report', 'Monthly Safety Inspection', 'Conduct monthly safety inspection', 'Inspection', 'High', 'Construction Site A', 'Building A', 'Pending', 'High', 'HSE Manager', '2026-03-22', '2026-03-25');

INSERT IGNORE INTO projects_work (department_code, work_type, work_title, work_description, project_name, client_name, project_phase, status, priority, submitted_by, submitted_date, due_date) VALUES
('PROJECT', 'Project Creation', 'New Building Project', 'Start construction of new office building', 'Office Building Project', 'ABC Corporation', 'Planning', 'Pending', 'High', 'Project Manager', '2026-03-22', '2026-04-01'),
('PROJECT', 'Workforce Request', 'Additional Workers', 'Request 5 additional workers for construction', 'Office Building Project', 'ABC Corporation', 'In Progress', 'Pending', 'Medium', 'Project Manager', '2026-03-22', '2026-03-25');

INSERT IGNORE INTO realestate_work (department_code, work_type, work_title, work_description, property_address, property_type, client_name, sale_amount, status, priority, submitted_by, submitted_date, due_date) VALUES
('REALESTATE', 'Property Addition', 'New Property Listing', 'Add commercial property to portfolio', '123 Main Street', 'Commercial', 'XYZ Company', 500000000.00, 'Pending', 'Medium', 'Real Estate Manager', '2026-03-22', '2026-03-30'),
('REALESTATE', 'Client Registration', 'New Client Registration', 'Register new client in system', '456 Oak Avenue', 'Residential', 'John Smith', 0, 'Completed', 'Low', 'Real Estate Manager', '2026-03-22', '2026-03-23');

INSERT IGNORE INTO admin_work (department_code, work_type, work_title, work_description, affected_department, deadline, status, priority, submitted_by, submitted_date, due_date) VALUES
('ADMIN', 'Administrative Operations', 'System Update', 'Update system security protocols', 'All Departments', '2026-03-25', 'Pending', 'High', 'Admin', '2026-03-22', '2026-03-25'),
('ADMIN', 'Compliance Management', 'Compliance Audit', 'Annual compliance audit preparation', 'All Departments', '2026-03-30', 'In Progress', 'High', 'Admin', '2026-03-22', '2026-03-30');

-- Attendance Management Table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIME NULL,
  check_out_time TIME NULL,
  attendance_status ENUM('present', 'absent', 'late', 'sick', 'annual', 'permission') NOT NULL,
  notes TEXT NULL,
  marked_by VARCHAR(255) NOT NULL,
  marked_by_role VARCHAR(100) DEFAULT 'HR Manager',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_employee_id (employee_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_attendance_status (attendance_status),
  INDEX idx_marked_by (marked_by),
  
  -- Unique constraint to prevent duplicate attendance for same employee on same date
  UNIQUE KEY unique_employee_date (employee_id, attendance_date)
);

-- Insert sample attendance data
INSERT IGNORE INTO attendance (
  employee_id, employee_name, attendance_date, check_in_time, check_out_time, 
  attendance_status, notes, marked_by, marked_by_role
) VALUES
('emp001', 'John Doe', CURDATE(), '08:00:00', '17:00:00', 'present', 'Regular work day', 'HR Manager', 'HR Manager'),
('emp002', 'Jane Smith', CURDATE(), '08:30:00', '17:00:00', 'late', 'Traffic delay', 'HR Manager', 'HR Manager'),
('emp003', 'Mike Johnson', CURDATE(), NULL, NULL, 'sick', 'Fever and headache', 'HR Manager', 'HR Manager'),
('emp004', 'Sarah Wilson', CURDATE(), '08:00:00', '16:00:00', 'permission', 'Left early for personal appointment', 'HR Manager', 'HR Manager');

-- Leave Management Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  leave_type ENUM('annual', 'sick', 'maternity', 'paternity', 'compassionate', 'study', 'unpaid') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT NOT NULL,
  reason_for_leave TEXT NOT NULL,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by VARCHAR(255),
  approved_date TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key relationship to employees table
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_employee_id (employee_id),
  INDEX idx_leave_type (leave_type),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_approval_status (approval_status),
  INDEX idx_created_at (created_at)
);

-- Insert sample leave request data
INSERT IGNORE INTO leave_requests (
  employee_id, employee_name, leave_type, start_date, end_date, days_requested, 
  reason_for_leave, approval_status, approved_by
) VALUES
('emp001', 'John Doe', 'annual', '2026-04-15', '2026-04-19', 5, 'Family vacation planned for Easter holiday', 'pending', NULL),
('emp002', 'Jane Smith', 'sick', '2026-03-25', '2026-03-26', 2, 'Medical appointment and recovery', 'approved', 'HR Manager'),
('emp003', 'Mike Johnson', 'compassionate', '2026-04-01', '2026-04-02', 2, 'Family emergency - attending funeral', 'approved', 'HR Manager'),
('emp004', 'Sarah Wilson', 'study', '2026-05-10', '2026-05-12', 3, 'Professional development course attendance', 'pending', NULL);

-- Contract Management Table
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  contract_type ENUM('permanent', 'temporary', 'contract', 'probation', 'internship') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  salary DECIMAL(12,2) NOT NULL,
  contract_status ENUM('active', 'expired', 'terminated', 'renewed') DEFAULT 'active',
  contract_terms TEXT,
  contract_document VARCHAR(255),
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key relationship to employees table
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_employee_id (employee_id),
  INDEX idx_contract_type (contract_type),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_contract_status (contract_status),
  INDEX idx_created_at (created_at)
);

-- Insert sample contract data
INSERT IGNORE INTO contracts (
  employee_id, employee_name, contract_type, start_date, end_date, salary, 
  contract_status, contract_terms, created_by
) VALUES
('emp001', 'John Doe', 'permanent', '2025-01-15', NULL, 2500000.00, 'active', 'Full-time permanent employment with standard benefits including health insurance, annual leave, and pension contributions', 'HR Manager'),
('emp002', 'Jane Smith', 'contract', '2025-03-01', '2025-12-31', 2200000.00, 'active', 'Fixed-term contract for project duration with possibility of extension based on performance', 'HR Manager'),
('emp003', 'Mike Johnson', 'probation', '2025-02-01', '2025-05-01', 1800000.00, 'renewed', 'Probation period successfully completed and converted to permanent contract', 'HR Manager'),
('emp004', 'Sarah Wilson', 'temporary', '2025-04-01', '2025-06-30', 2000000.00, 'active', 'Temporary contract for special project with competitive hourly rate and overtime benefits', 'HR Manager');

-- Meeting Minutes table
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meeting_title VARCHAR(255) NOT NULL,
  meeting_type ENUM('board', 'management', 'department', 'project', 'client', 'training', 'general') NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  attendees TEXT,
  minutes_content TEXT NOT NULL,
  action_items TEXT,
  recorded_by VARCHAR(255) NOT NULL,
  recording_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('draft', 'final', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_meeting_date (meeting_date),
  INDEX idx_meeting_type (meeting_type),
  INDEX idx_status (status),
  INDEX idx_recorded_by (recorded_by)
);

-- Insert sample meeting minutes data
INSERT IGNORE INTO meeting_minutes (
  meeting_title, meeting_type, meeting_date, meeting_time,
  attendees, minutes_content, action_items, recorded_by, status
) VALUES
('Monthly Management Review', 'management', CURDATE(), '10:00',
  'Dr. John Smith, HR Manager, Finance Manager, Project Manager', 
  'Monthly review of project progress, financial status, and operational challenges.',
  '1. Review Q2 budget proposals\n2. Approve new project timeline\n3. Address staffing issues',
  'Admin Assistant', 'draft');

-- Site Reports table
CREATE TABLE IF NOT EXISTS site_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  report_date DATE NOT NULL,
  weather_conditions ENUM('Sunny', 'Cloudy', 'Rainy', 'Windy') NOT NULL,
  site_supervisor VARCHAR(255) NOT NULL,
  workers_present INT NOT NULL,
  work_completed TEXT NOT NULL,
  site_issues TEXT,
  safety_incidents TEXT,
  materials_used VARCHAR(500),
  equipment_used VARCHAR(500),
  next_day_plan TEXT NOT NULL,
  photos_files TEXT,
  status ENUM('Draft', 'Submitted', 'Reviewed', 'Approved') DEFAULT 'Draft',
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_date (project_id, report_date),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Task Assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  assigned_to VARCHAR(255) NOT NULL,
  task_priority ENUM('urgent', 'high', 'medium', 'low') NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  task_description TEXT NOT NULL,
  estimated_hours DECIMAL(5,2),
  required_skills VARCHAR(500),
  materials_equipment TEXT,
  status ENUM('assigned', 'in-progress', 'completed', 'on-hold', 'cancelled') DEFAULT 'assigned',
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Workforce Requests table
CREATE TABLE IF NOT EXISTS workforce_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  request_type ENUM('additional', 'replacement', 'specialized', 'temporary') NOT NULL,
  workers_needed INT NOT NULL,
  duration VARCHAR(100) NOT NULL,
  job_categories TEXT NOT NULL,
  justification TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  special_requirements TEXT,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  requested_by VARCHAR(255),
  approved_by VARCHAR(255),
  approval_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_requested_by (requested_by),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Work Approvals table
CREATE TABLE IF NOT EXISTS work_approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_id VARCHAR(50) NOT NULL,
  project_id INT NOT NULL,
  completed_by VARCHAR(255) NOT NULL,
  completion_date DATE NOT NULL,
  quality_assessment ENUM('excellent', 'good', 'acceptable', 'poor') NOT NULL,
  compliance_check ENUM('fully-compliant', 'minor-issues', 'major-issues', 'non-compliant') NOT NULL,
  approval_comments TEXT NOT NULL,
  safety_compliance ENUM('compliant', 'minor-violations', 'major-violations') DEFAULT 'compliant',
  time_completion ENUM('on-time', 'early', 'delayed') DEFAULT 'on-time',
  quality_score DECIMAL(5,2),
  status ENUM('pending', 'approved', 'rejected', 'rework-requested') DEFAULT 'pending',
  approved_by VARCHAR(255),
  approval_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_work_id (work_id),
  INDEX idx_project_id (project_id),
  INDEX idx_completed_by (completed_by),
  INDEX idx_status (status),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Project Progress Updates table
CREATE TABLE IF NOT EXISTS project_progress_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  progress_percentage DECIMAL(5,2) NOT NULL,
  status ENUM('on-track', 'at-risk', 'delayed', 'completed', 'on-hold') NOT NULL,
  progress_report TEXT,
  completed_milestones VARCHAR(500),
  next_milestones VARCHAR(500),
  budget_used DECIMAL(15,2),
  issues TEXT,
  update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_update_date (update_date),
  INDEX idx_updated_by (updated_by),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Driver Management Table
CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  description TEXT,
  years_of_experience INT NOT NULL,
  license_type ENUM('class-a', 'class-b', 'class-c', 'class-d', 'international') NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  nida_number VARCHAR(50) NOT NULL,
  passport_number VARCHAR(50),
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  residential_address TEXT NOT NULL,
  region ENUM('dar-es-salaam', 'arusha', 'mwanza', 'mbeya', 'tanga', 'morogoro', 'dodoma', 'kilimanjaro', 'tabora', 'kigoma', 'singida', 'shinyanga', 'mara', 'manyara', 'rukwa', 'njombe', 'katavi', 'simiyu', 'geita', 'lindi', 'mtwara', 'pwani', 'iringa', 'ruvuma', 'songwe'),
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_number VARCHAR(50) NOT NULL,
  emergency_relationship ENUM('spouse', 'parent', 'sibling', 'child', 'friend', 'relative') NOT NULL,
  blood_group ENUM('a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-'),
  license_issue_date DATE NOT NULL,
  license_expiry_date DATE NOT NULL,
  employment_status ENUM('full-time', 'part-time', 'contract', 'temporary') NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(12,2),
  payment_method ENUM('bank-transfer', 'mobile-money', 'cash', 'cheque'),
  bank_details TEXT,
  medical_certificate ENUM('valid', 'expired', 'pending', 'not-required'),
  medical_expiry_date DATE,
  driver_status ENUM('active', 'on-leave', 'suspended', 'terminated') NOT NULL,
  assigned_vehicle VARCHAR(50),
  skills TEXT,
  employment_history TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_driver_id (driver_id),
  INDEX idx_full_name (full_name),
  INDEX idx_license_type (license_type),
  INDEX idx_phone_number (phone_number),
  INDEX idx_email_address (email_address),
  INDEX idx_nida_number (nida_number),
  INDEX idx_driver_status (driver_status),
  INDEX idx_employment_status (employment_status),
  INDEX idx_hire_date (hire_date),
  INDEX idx_license_expiry (license_expiry_date),
  INDEX idx_region (region)
);

-- Company Vehicles/Fleet Management Table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  track_number VARCHAR(50) UNIQUE NOT NULL,
  car_name VARCHAR(255) NOT NULL,
  brand_name ENUM('toyota', 'nissan', 'mitsubishi', 'isuzu', 'ford', 'mazda', 'honda', 'bmw', 'mercedes', 'volkswagen', 'other') NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  plate_number VARCHAR(50) NOT NULL,
  car_details TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_driver VARCHAR(50),
  registration_date DATE NOT NULL,
  vehicle_type ENUM('pickup', 'suv', 'sedan', 'van', 'truck', 'motorcycle') NOT NULL,
  fuel_type ENUM('petrol', 'diesel', 'hybrid', 'electric') NOT NULL,
  color VARCHAR(50),
  year_of_manufacture INT,
  odometer_reading INT,
  insurance_status ENUM('insured', 'pending', 'expired', 'not-required') NOT NULL,
  vehicle_status ENUM('active', 'maintenance', 'inactive', 'retired') NOT NULL,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key relationship to drivers table
  FOREIGN KEY (assigned_driver) REFERENCES drivers(driver_id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_track_number (track_number),
  INDEX idx_car_name (car_name),
  INDEX idx_brand_name (brand_name),
  INDEX idx_registration_number (registration_number),
  INDEX idx_plate_number (plate_number),
  INDEX idx_assigned_driver (assigned_driver),
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_fuel_type (fuel_type),
  INDEX idx_vehicle_status (vehicle_status),
  INDEX idx_insurance_status (insurance_status),
  INDEX idx_registration_date (registration_date)
);

-- Transport Costs Table for Fleet Management
CREATE TABLE IF NOT EXISTS transport_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cost_type ENUM('maintenance', 'extra') NOT NULL,
    category ENUM('service_maintenance', 'repair', 'fuel', 'toll_fees', 'tyre_replacement', 'insurance', 'other') NOT NULL,
    description TEXT NOT NULL,
    vehicle_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TZS',
    date_incurred DATE NOT NULL,
    provider VARCHAR(255),
    invoice_number VARCHAR(100),
    payment_status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
    approved_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_cost_type (cost_type),
    INDEX idx_category (category),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_date_incurred (date_incurred),
    INDEX idx_payment_status (payment_status)
);

-- Sample Vehicles Data
INSERT IGNORE INTO vehicles (id, track_number, car_name, brand_name, registration_number, plate_number, car_details, description, assigned_driver, registration_date, vehicle_type, fuel_type, color, year_of_manufacture, odometer_reading, insurance_status, vehicle_status, additional_notes) VALUES
(1, 'TK001', 'Toyota Hilux', 'toyota', 'T123456', 'ABC123', 'Double cabin pickup truck', 'Reliable pickup for construction site transport', 'driver001', '2023-01-15', 'pickup', 'diesel', 'White', 2022, 15000, 'insured', 'active', 'Regular maintenance schedule'),
(2, 'TK002', 'Nissan Patrol', 'nissan', 'T789012', 'XYZ789', '4x4 SUV', 'Heavy duty SUV for rough terrain', 'driver002', '2023-03-20', 'suv', 'diesel', 'Black', 2023, 8000, 'insured', 'active', 'Off-road capable');

-- Language Campaigns Table
CREATE TABLE IF NOT EXISTS language_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  language_name VARCHAR(100) NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_units_available INT NOT NULL,
  units_sold INT DEFAULT 0,
  campaign_status ENUM('Draft', 'Active', 'Completed', 'Cancelled') DEFAULT 'Draft',
  start_date DATE,
  end_date DATE,
  campaign_description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key relationship to users table
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_campaign_name (campaign_name),
  INDEX idx_language_name (language_name),
  INDEX idx_language_code (language_code),
  INDEX idx_campaign_status (campaign_status),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

-- Language Purchases Table
CREATE TABLE IF NOT EXISTS language_purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(50),
  units_purchased INT NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('Bank Transfer', 'Cash', 'Mobile Money', 'Credit Card', 'Other') DEFAULT 'Bank Transfer',
  buyer_address TEXT,
  purchase_notes TEXT,
  purchase_status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Refunded') DEFAULT 'Pending',
  purchase_date DATE NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key relationships
  FOREIGN KEY (campaign_id) REFERENCES language_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_buyer_name (buyer_name),
  INDEX idx_buyer_email (buyer_email),
  INDEX idx_buyer_phone (buyer_phone),
  INDEX idx_purchase_status (purchase_status),
  INDEX idx_purchase_date (purchase_date),
  INDEX idx_payment_method (payment_method),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

-- Payment Tracking Table
CREATE TABLE IF NOT EXISTS payment_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  purchase_id INT NOT NULL,
  payment_stage ENUM('Initiated', 'Processing', 'Confirmed', 'Completed', 'Failed') NOT NULL,
  payment_reference VARCHAR(100),
  bank_reference VARCHAR(100),
  transaction_id VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  tracking_notes TEXT,
  payment_date DATE NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key relationships
  FOREIGN KEY (purchase_id) REFERENCES language_purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_tracking_number (tracking_number),
  INDEX idx_purchase_id (purchase_id),
  INDEX idx_payment_stage (payment_stage),
  INDEX idx_payment_reference (payment_reference),
  INDEX idx_bank_reference (bank_reference),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_payment_date (payment_date),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category ENUM('safety', 'productivity', 'cost-saving', 'quality', 'environment', 'training', 'equipment', 'process', 'other') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL,
  description TEXT NOT NULL,
  current_situation TEXT,
  proposed_solution TEXT,
  expected_benefits TEXT,
  resources_required TEXT,
  timeline VARCHAR(255),
  status ENUM('pending', 'under-review', 'approved', 'rejected', 'implemented') DEFAULT 'pending',
  admin_feedback TEXT,
  admin_decision VARCHAR(255),
  decision_date TIMESTAMP NULL,
  up_votes INT DEFAULT 0,
  down_votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_id (employee_id),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== NEW FORMS DATABASE TABLES =====
-- Created for NHIF, Procurement Sales, Enhanced Suggestions, Tax, and Senior Roles forms

-- NHIF Contributions Table
CREATE TABLE IF NOT EXISTS nhif_contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    contribution_month DATE NOT NULL,
    employee_contribution DECIMAL(10,2) NOT NULL,
    employer_contribution DECIMAL(10,2) NOT NULL,
    total_contribution DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Overdue') DEFAULT 'Pending',
    payment_date DATE NULL,
    receipt_number VARCHAR(100) NULL,
    submitted_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    updated_by INT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_contribution_month (contribution_month),
    INDEX idx_payment_status (payment_status)
);

-- Procurement Sales Table
CREATE TABLE IF NOT EXISTS procurement_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_title VARCHAR(255) NOT NULL,
    procurement_type ENUM('Goods', 'Services', 'Works', 'Consultancy') NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0,
    total_budget DECIMAL(12,2) NOT NULL,
    purpose TEXT NOT NULL,
    urgency_level ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
    expected_delivery_date DATE NULL,
    supplier_requirements TEXT NULL,
    technical_specifications TEXT NULL,
    budget_allocation VARCHAR(100) NULL,
    department VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_by_role VARCHAR(100) NOT NULL,
    justification TEXT NULL,
    approval_requirements ENUM('Standard', 'Enhanced', 'Board') DEFAULT 'Standard',
    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Procurement In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    reviewed_by INT NULL,
    reviewed_date TIMESTAMP NULL,
    review_comments TEXT NULL,
    approved_budget DECIMAL(12,2) NULL,
    rejection_reason TEXT NULL,
    submitted_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    updated_by INT NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_procurement_type (procurement_type),
    INDEX idx_urgency_level (urgency_level)
);

-- Suggestion Comments Table
CREATE TABLE IF NOT EXISTS suggestion_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suggestion_id INT NOT NULL,
    comment TEXT NOT NULL,
    commented_by INT NOT NULL,
    commented_by_role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (commented_by) REFERENCES users(id),
    INDEX idx_suggestion_id (suggestion_id),
    INDEX idx_commented_by (commented_by)
);

-- Suggestion Votes Table
CREATE TABLE IF NOT EXISTS suggestion_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suggestion_id INT NOT NULL,
    vote_type ENUM('up', 'down') NOT NULL,
    voted_by INT NOT NULL,
    voted_by_role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (voted_by) REFERENCES users(id),
    UNIQUE KEY unique_suggestion_vote (suggestion_id, voted_by),
    INDEX idx_suggestion_id (suggestion_id),
    INDEX idx_voted_by (voted_by)
);

-- Tax Payments Table
CREATE TABLE IF NOT EXISTS tax_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tax_type ENUM('PAYE', 'VAT', 'Corporate Tax', 'Withholding Tax', 'Skills Development Levy', 'Service Levy', 'Other') NOT NULL,
    tax_period VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE NULL,
    amount DECIMAL(12,2) NOT NULL,
    penalties DECIMAL(12,2) DEFAULT 0,
    interest DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('Bank Transfer', 'Cash', 'Cheque', 'Mobile Money', 'Other') DEFAULT 'Bank Transfer',
    payment_reference VARCHAR(100) NULL,
    payment_status ENUM('Paid', 'Pending', 'Overdue', 'Cancelled', 'Refunded') DEFAULT 'Paid',
    description TEXT NULL,
    department VARCHAR(100) NOT NULL,
    recorded_by INT NOT NULL,
    recorded_by_role VARCHAR(100) NOT NULL,
    attachments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    updated_by INT NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_tax_type (tax_type),
    INDEX idx_tax_period (tax_period),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_department (department)
);

-- Senior Roles Table
CREATE TABLE IF NOT EXISTS senior_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    senior_role_type ENUM('Manager', 'Senior Manager', 'Director', 'Senior Director', 'VP', 'C-Level', 'Other') NOT NULL,
    proposed_title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    proposed_salary DECIMAL(12,2) NOT NULL,
    effective_date DATE NOT NULL,
    reason_for_promotion TEXT NULL,
    responsibilities TEXT NULL,
    qualifications TEXT NULL,
    experience TEXT NULL,
    achievements TEXT NULL,
    reporting_structure TEXT NULL,
    budget_impact TEXT NULL,
    submitted_by INT NOT NULL,
    submitted_by_role VARCHAR(100) NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Implemented', 'Cancelled') DEFAULT 'Pending',
    reviewed_by INT NULL,
    reviewed_date TIMESTAMP NULL,
    review_comments TEXT NULL,
    approved_salary DECIMAL(12,2) NULL,
    rejection_reason TEXT NULL,
    final_title VARCHAR(255) NULL,
    sent_to_md_by INT NULL,
    sent_to_md_date TIMESTAMP NULL,
    attachments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    updated_by INT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (sent_to_md_by) REFERENCES users(id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_senior_role_type (senior_role_type),
    INDEX idx_priority (priority)
);

-- Accountants table for managing accountant roles and responsibilities
CREATE TABLE IF NOT EXISTS accountants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  department ENUM('Finance', 'Accounting', 'Administration') DEFAULT 'Finance',
  reporting_to VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  employment_type ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern') DEFAULT 'Full-Time',
  professional_qualification ENUM('CPA', 'ACCA', 'CIMA', 'Bachelor Degree', 'Diploma', 'Certificate') NULL,
  years_of_experience INT DEFAULT 0,
  additional_certifications TEXT NULL,
  status ENUM('Active', 'Inactive', 'On Leave', 'Terminated') DEFAULT 'Active',
  notes TEXT NULL,
  
  -- Financial Reporting Responsibilities (JSON array)
  financial_reporting JSON NULL,
  
  -- Bookkeeping Responsibilities (JSON array)
  bookkeeping JSON NULL,
  
  -- Regulatory Compliance Responsibilities (JSON array)
  regulatory JSON NULL,
  
  -- System Access Permissions (JSON array)
  system_access JSON NULL,
  
  -- Metadata
  role VARCHAR(50) DEFAULT 'Accountant',
  submitted_by INT NOT NULL,
  submitted_by_role VARCHAR(100) NOT NULL,
  submitted_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_email (email),
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_employment_type (employment_type),
  INDEX idx_qualification (professional_qualification),
  INDEX idx_submitted_by (submitted_by)
);

-- Team Management Tables
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NULL,
  description TEXT NULL,
  leader_employee_id INT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_leader_employee_id (leader_employee_id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  employee_id INT NOT NULL,
  member_role VARCHAR(100) NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_member (team_id, employee_id),
  INDEX idx_team_id (team_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status)
);

-- Sample Data for New Forms Tables (Optional)
-- NHIF Sample Data
INSERT IGNORE INTO nhif_contributions (employee_id, contribution_month, employee_contribution, employer_contribution, total_contribution, payment_status, payment_date, receipt_number) VALUES
(1, '2024-01-01', 50000.00, 100000.00, 150000.00, 'Paid', '2024-01-15', 'NHIF-2024-001'),
(2, '2024-01-01', 45000.00, 90000.00, 135000.00, 'Paid', '2024-01-16', 'NHIF-2024-002'),
(1, '2024-02-01', 50000.00, 100000.00, 150000.00, 'Pending', NULL, NULL);

-- Procurement Sales Sample Data
INSERT IGNORE INTO procurement_sales (request_title, procurement_type, item_description, quantity, unit_price, total_budget, purpose, urgency_level, expected_delivery_date, department, requested_by, requested_by_role, submitted_by) VALUES
('Office Computers Purchase', 'Goods', 'High-performance laptops for staff', 10, 2500000.00, 25000000.00, 'Replace outdated office equipment', 'Normal', '2024-02-15', 'IT', 'John Doe', 'IT Manager', 1),
('Website Development', 'Services', 'Company website redesign and development', 1, 15000000.00, 15000000.00, 'Improve online presence', 'High', '2024-03-01', 'Marketing', 'Jane Smith', 'Marketing Manager', 1);

-- Tax Payments Sample Data
INSERT IGNORE INTO tax_payments (tax_type, tax_period, payment_date, due_date, amount, penalties, interest, total_amount, payment_method, payment_reference, payment_status, department, recorded_by, recorded_by_role) VALUES
('PAYE', 'January 2024', '2024-01-15', '2024-01-10', 2500000.00, 0, 0, 2500000.00, 'Bank Transfer', 'TRRA-2024-001', 'Paid', 'Finance', 1, 'Finance Manager'),
('VAT', 'Q4 2023', '2024-01-20', '2024-01-31', 1800000.00, 0, 0, 1800000.00, 'Bank Transfer', 'TRRA-2024-002', 'Paid', 'Finance', 1, 'Finance Manager');

-- Accountants Sample Data
INSERT IGNORE INTO accountants (
  employee_id, name, email, phone, department, reporting_to, start_date, employment_type, 
  professional_qualification, years_of_experience, additional_certifications, status, notes,
  financial_reporting, bookkeeping, regulatory, system_access,
  submitted_by, submitted_by_role, submitted_date
) VALUES
(
  'ACC-2024-001', 'Jane Smith', 'jane.smith@khashtec.com', '+255 712 345 678', 'Finance', 'Senior Accountant - John Doe', '2024-01-15', 'Full-Time',
  'CPA', 5, 'Taxation Certificate, Financial Analysis Certification', 'Active', 'Senior accountant with expertise in financial reporting and tax compliance',
  '["monthly-reports", "quarterly-reports", "annual-reports", "budget-analysis", "cash-flow"]',
  '["accounts-payable", "accounts-receivable", "bank-reconciliation", "expense-tracking", "invoice-processing"]',
  '["tax-compliance", "financial-regulations", "trra-compliance", "audit-readiness", "internal-controls"]',
  '["accounting-software", "banking-portal", "tax-portal", "reporting-tools"]',
  1, 'Managing Director', '2024-01-15'
),
(
  'ACC-2024-002', 'Mary Johnson', 'mary.johnson@khashtec.com', '+255 713 456 789', 'Accounting', 'Finance Manager - Robert Kim', '2024-02-01', 'Full-Time',
  'ACCA', 3, 'Advanced Excel, QuickBooks Certification', 'Active', 'Detail-oriented accountant specializing in bookkeeping and payroll',
  '["monthly-reports", "profit-loss", "balance-sheet", "audit-support"]',
  '["accounts-payable", "accounts-receivable", "bank-reconciliation", "payroll-processing", "tax-calculations"]',
  '["tax-compliance", "policy-compliance", "documentation", "reporting-deadlines"]',
  '["accounting-software", "payroll-system", "document-management", "reporting-tools"]',
  1, 'Managing Director', '2024-02-01'
),
(
  'ACC-2024-003', 'David Wilson', 'david.wilson@khashtec.com', '+255 714 567 890', 'Finance', 'Senior Accountant - John Doe', '2024-03-10', 'Contract',
  'Bachelor Degree', 2, 'Financial Modeling Certificate, Data Analysis', 'Active', 'Junior accountant focusing on financial analysis and reporting',
  '["monthly-reports", "quarterly-reports", "budget-analysis", "cash-flow", "profit-loss"]',
  '["expense-tracking", "invoice-processing", "fixed-assets"]',
  '["financial-regulations", "internal-controls", "policy-compliance"]',
  '["accounting-software", "reporting-tools", "document-management"]',
  1, 'Managing Director', '2024-03-10'
);

-- Senior Roles Sample Data
INSERT IGNORE INTO senior_roles (employee_id, senior_role_type, proposed_title, department, proposed_salary, effective_date, reason_for_promotion, submitted_by, submitted_by_role) VALUES
(1, 'Manager', 'Senior Project Manager', 'Projects', 3500000.00, '2024-02-01', 'Outstanding performance and leadership in project management', 1, 'HR Manager'),
(2, 'Director', 'Finance Director', 'Finance', 8000000.00, '2024-03-01', 'Extensive experience in financial management and strategic planning', 1, 'HR Manager');

-- ===== PAYMENT MANAGEMENT SYSTEM =====

-- Payment Requests Table
CREATE TABLE IF NOT EXISTS payment_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id INT NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    employee_email VARCHAR(255) NOT NULL,
    employee_phone VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency ENUM('TZS', 'USD') DEFAULT 'TZS',
    equivalent_amount_tzs DECIMAL(15,2) NOT NULL,
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    description TEXT NOT NULL,
    notes TEXT,
    payment_type ENUM('salary', 'bonus', 'allowance', 'reimbursement', 'overtime', 'commission', 'severance', 'other') DEFAULT 'salary',
    urgency ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    payment_method ENUM('bank_transfer', 'mobile_money', 'cash', 'cheque') DEFAULT 'bank_transfer',
    expected_payment_date DATE,
    department VARCHAR(100),
    project_code VARCHAR(50),
    work_order_number VARCHAR(100),
    status ENUM('pending_finance_approval', 'approved', 'rejected', 'processed', 'paid', 'cancelled') DEFAULT 'pending_finance_approval',
    approved_by INT,
    approved_date DATE,
    finance_notes TEXT,
    payment_reference VARCHAR(100),
    actual_amount DECIMAL(15,2),
    actual_currency ENUM('TZS', 'USD'),
    processed_date DATE,
    paid_date DATE,
    submitted_by INT NOT NULL,
    submitted_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_currency (currency),
    INDEX idx_payment_type (payment_type),
    INDEX idx_urgency (urgency),
    INDEX idx_department (department),
    INDEX idx_submitted_date (submitted_date),
    INDEX idx_expected_payment_date (expected_payment_date)
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    status ENUM('pending_finance_approval', 'approved', 'rejected', 'processed', 'paid', 'cancelled') NOT NULL,
    changed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payment_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
);

-- Payment Attachments Table
CREATE TABLE IF NOT EXISTS payment_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    description TEXT,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payment_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_payment_id (payment_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_uploaded_at (uploaded_at)
);

-- Enhanced Notifications Table for Payment System
ALTER TABLE notifications ADD COLUMN recipient_role VARCHAR(100) AFTER recipient_id;
ALTER TABLE notifications ADD COLUMN reference_id INT AFTER related_id;
ALTER TABLE notifications ADD COLUMN reference_type VARCHAR(100) AFTER reference_id;

-- Payment Requests Sample Data
INSERT IGNORE INTO payment_requests (
    tracking_number, employee_id, employee_name, employee_email, employee_phone,
    amount, currency, equivalent_amount_tzs, exchange_rate, description, notes,
    payment_type, urgency, payment_method, expected_payment_date, department,
    project_code, status, submitted_by, submitted_date
) VALUES
('PAY-1XYZ2A3B4', 1, 'John Doe', 'john.doe@khashtec.com', '+255 712 345 678',
 2500000.00, 'TZS', 2500000.00, 1.000000, 'Monthly salary payment for January 2024', 'Regular monthly salary',
 'salary', 'normal', 'bank_transfer', '2024-01-25', 'Projects',
 'PRJ-001', 'pending_finance_approval', 1, '2024-01-15'),
('PAY-2YZ3B4C5D', 2, 'Jane Smith', 'jane.smith@khashtec.com', '+255 713 456 789',
 1500.00, 'USD', 3750000.00, 2500.000000, 'Performance bonus for Q4 2023', 'Exceeded sales targets',
 'bonus', 'high', 'bank_transfer', '2024-01-20', 'Sales',
 'SAL-001', 'approved', 1, '2024-01-10'),
('PAY-3Z4C5D6E7', 3, 'Mary Johnson', 'mary.johnson@khashtec.com', '+255 714 567 890',
 500000.00, 'TZS', 500000.00, 1.000000, 'Travel reimbursement for site visit', 'Travel to Dodoma project site',
 'reimbursement', 'normal', 'mobile_money', '2024-01-18', 'Projects',
 'PRJ-002', 'processed', 1, '2024-01-12');

-- ===== MATERIALS MANAGEMENT SYSTEM =====

-- Materials Inventory (Master catalog of all building materials)
CREATE TABLE IF NOT EXISTS materials_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_code VARCHAR(50) UNIQUE NOT NULL,
  material_name VARCHAR(255) NOT NULL,
  material_category ENUM('Cement', 'Sand', 'Gravel', 'Steel/Rebar', 'Bricks', 'Blocks', 'Timber', 'Pipes', 'Electrical', 'Paint', 'Roofing', 'Tiles', 'Glass', 'Hardware', 'Tools', 'Safety Equipment', 'Other') DEFAULT 'Other',
  description TEXT,
  unit_of_measure ENUM('Bag', 'KG', 'Ton', 'Piece', 'Meter', 'Square Meter', 'Cubic Meter', 'Liter', 'Roll', 'Box', 'Set', 'Sheet') DEFAULT 'Piece',
  current_stock DECIMAL(12,2) DEFAULT 0,
  min_stock_level DECIMAL(12,2) DEFAULT 10,
  max_stock_level DECIMAL(12,2) DEFAULT 1000,
  reorder_point DECIMAL(12,2) DEFAULT 50,
  storage_location VARCHAR(255),
  supplier_name VARCHAR(255),
  supplier_contact VARCHAR(255),
  unit_cost DECIMAL(12,2) DEFAULT 0,
  status ENUM('Active', 'Discontinued', 'Out of Stock', 'Low Stock') DEFAULT 'Active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_material_code (material_code),
  INDEX idx_material_name (material_name),
  INDEX idx_category (material_category),
  INDEX idx_status (status),
  INDEX idx_storage_location (storage_location)
);

-- Materials In (Receiving/Purchasing records)
CREATE TABLE IF NOT EXISTS materials_in (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  track_number VARCHAR(100) UNIQUE NOT NULL,
  receipt_date DATE NOT NULL,
  quantity_received DECIMAL(12,2) NOT NULL,
  unit_of_measure ENUM('Bag', 'KG', 'Ton', 'Piece', 'Meter', 'Square Meter', 'Cubic Meter', 'Liter', 'Roll', 'Box', 'Set', 'Sheet') DEFAULT 'Piece',
  unit_price DECIMAL(12,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  transport_cost DECIMAL(12,2) DEFAULT 0,
  transport_issue TEXT,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_contact VARCHAR(255),
  supplier_tin VARCHAR(50),
  invoice_number VARCHAR(100),
  purchase_order_number VARCHAR(100),
  delivery_note_number VARCHAR(100),
  delivery_condition ENUM('Good', 'Damaged', 'Partial', 'Rejected') DEFAULT 'Good',
  quality_check_status ENUM('Pending', 'Passed', 'Failed', 'Conditional') DEFAULT 'Pending',
  quality_remarks TEXT,
  received_by VARCHAR(255) NOT NULL,
  received_by_role VARCHAR(100),
  project_id INT,
  project_name VARCHAR(255),
  warehouse_location VARCHAR(255),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materials_inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_track_number (track_number),
  INDEX idx_material_id (material_id),
  INDEX idx_receipt_date (receipt_date),
  INDEX idx_supplier_name (supplier_name),
  INDEX idx_project_id (project_id),
  INDEX idx_quality_status (quality_check_status)
);

-- Materials Out (Sales/Usage/Issue records)
CREATE TABLE IF NOT EXISTS materials_out (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  track_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  quantity_out DECIMAL(12,2) NOT NULL,
  unit_of_measure ENUM('Bag', 'KG', 'Ton', 'Piece', 'Meter', 'Square Meter', 'Cubic Meter', 'Liter', 'Roll', 'Box', 'Set', 'Sheet') DEFAULT 'Piece',
  unit_price DECIMAL(12,2) DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  issue_type ENUM('Project Use', 'Sale', 'Transfer', 'Waste', 'Damage', 'Return to Supplier') DEFAULT 'Project Use',
  issued_to VARCHAR(255) NOT NULL,
  issued_to_role VARCHAR(100),
  issued_to_department ENUM('Management', 'Human Resources', 'Finance', 'Project Management', 'Real Estate', 'Health & Safety', 'Administrative', 'Workers', 'Clients', 'External') DEFAULT 'Project Management',
  project_id INT,
  project_name VARCHAR(255),
  destination VARCHAR(255),
  purpose TEXT,
  authorized_by VARCHAR(255) NOT NULL,
  authorized_by_role VARCHAR(100),
  delivery_method ENUM('Company Vehicle', 'Supplier Delivery', 'Third Party', 'Self Pickup') DEFAULT 'Company Vehicle',
  delivery_receipt_number VARCHAR(100),
  condition_on_issue ENUM('New', 'Good', 'Fair', 'Damaged') DEFAULT 'New',
  return_expected BOOLEAN DEFAULT FALSE,
  expected_return_date DATE,
  actual_return_date DATE,
  return_condition ENUM('Good', 'Damaged', 'Partial', 'Not Returned') DEFAULT 'Not Returned',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materials_inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_track_number (track_number),
  INDEX idx_material_id (material_id),
  INDEX idx_issue_date (issue_date),
  INDEX idx_issue_type (issue_type),
  INDEX idx_project_id (project_id),
  INDEX idx_issued_to (issued_to)
);

-- Fix column precision for existing tables (Railway deployments)
ALTER TABLE materials_in MODIFY COLUMN total_cost DECIMAL(15,2) NOT NULL;
ALTER TABLE materials_out MODIFY COLUMN total_value DECIMAL(15,2) DEFAULT 0;

-- Insert sample materials inventory data
INSERT IGNORE INTO materials_inventory (material_code, material_name, material_category, description, unit_of_measure, current_stock, min_stock_level, max_stock_level, reorder_point, storage_location, supplier_name, supplier_contact, unit_cost, status) VALUES
('MAT-CEM-001', 'Ordinary Portland Cement', 'Cement', 'Dangote Cement 50kg bags for general construction', 'Bag', 500, 100, 2000, 200, 'Warehouse A - Section 1', 'Dangote Tanzania Ltd', '+255 222 123 456', 18500.00, 'Active'),
('MAT-SND-001', 'Fine River Sand', 'Sand', 'Clean washed river sand for mortar and plastering', 'Cubic Meter', 150, 50, 500, 80, 'Yard B - Sand Pile', 'Local Supplier', '+255 713 987 654', 45000.00, 'Active'),
('MAT-RBL-001', 'Steel Rebar 12mm', 'Steel/Rebar', 'High tensile steel reinforcement bars 12mm diameter', 'Meter', 2000, 500, 10000, 1000, 'Warehouse A - Section 3', 'Steel Rolling Mills', '+255 222 456 789', 8500.00, 'Active'),
('MAT-PVC-001', 'PVC Pressure Pipe 4 inch', 'Pipes', 'UPVC pressure pipe Class C, 4 inch diameter for water supply', 'Meter', 300, 100, 1000, 150, 'Warehouse C - Pipe Rack', 'P Pipe Industries', '+255 713 456 123', 12000.00, 'Active'),
('MAT-BRK-001', 'Clay Facing Bricks', 'Bricks', 'Red clay facing bricks 230x110x76mm', 'Piece', 10000, 2000, 50000, 5000, 'Yard B - Brick Stack', 'Kiln Masters Ltd', '+255 714 321 654', 350.00, 'Active'),
('MAT-TIM-001', 'Construction Timber 2x4', 'Timber', 'Treated pine timber 2x4 inches for formwork and framing', 'Meter', 500, 200, 2000, 300, 'Warehouse D - Timber Shed', 'Forest Products Ltd', '+255 715 654 321', 8000.00, 'Active'),
('MAT-ELC-001', 'Electrical Cable 2.5mm', 'Electrical', 'Twin and earth electrical cable 2.5mm for lighting circuits', 'Meter', 1000, 300, 5000, 500, 'Warehouse E - Electrical', 'Electro Supplies', '+255 716 123 789', 2500.00, 'Active'),
('MAT-PNT-001', 'Weather Shield Exterior Paint', 'Paint', 'White exterior weather shield paint 20 liter drums', 'Liter', 200, 50, 500, 80, 'Warehouse F - Paint Store', 'ColorMaster Paints', '+255 717 987 123', 15000.00, 'Active'),
('MAT-RFG-001', 'Galvanized Roofing Sheets', 'Roofing', 'Corrugated galvanized iron roofing sheets 3 meter length', 'Sheet', 300, 100, 1000, 150, 'Warehouse G - Roofing', 'Mabati Rolling Mills', '+255 718 456 987', 35000.00, 'Active'),
('MAT-TLE-001', 'Ceramic Floor Tiles', 'Tiles', '400x400mm ceramic floor tiles beige color', 'Square Meter', 500, 150, 2000, 250, 'Warehouse H - Tiles', 'Tile World Ltd', '+255 719 321 456', 22000.00, 'Active');

-- Insert sample materials in records
INSERT IGNORE INTO materials_in (material_id, track_number, receipt_date, quantity_received, unit_of_measure, unit_price, total_cost, transport_cost, transport_issue, supplier_name, supplier_contact, invoice_number, purchase_order_number, delivery_note_number, delivery_condition, quality_check_status, received_by, received_by_role, project_name, warehouse_location, notes) VALUES
(1, 'MIN-2026-0001', '2026-05-01', 200, 'Bag', 18500.00, 3700000.00, 150000.00, 'Minor delay due to road construction on Bagamoyo road', 'Dangote Tanzania Ltd', '+255 222 123 456', 'INV-DG-2026-001', 'PO-KT-2026-045', 'DN-DG-2026-089', 'Good', 'Passed', 'John Doe', 'Store Keeper', 'Dar es Salaam Port Modernization', 'Warehouse A - Section 1', 'Delivered on time, quality verified'),
(2, 'MIN-2026-0002', '2026-05-02', 50, 'Cubic Meter', 45000.00, 2250000.00, 80000.00, NULL, 'Local Supplier', '+255 713 987 654', 'INV-LS-2026-015', 'PO-KT-2026-046', 'DN-LS-2026-034', 'Good', 'Passed', 'Jane Smith', 'Procurement Officer', 'Residential Buildings - Kinondoni', 'Yard B - Sand Pile', 'Clean washed sand, approved by engineer'),
(3, 'MIN-2026-0003', '2026-05-03', 500, 'Meter', 8500.00, 4250000.00, 120000.00, 'Truck breakdown caused 2-day delay', 'Steel Rolling Mills', '+255 222 456 789', 'INV-SRM-2026-008', 'PO-KT-2026-047', 'DN-SRM-2026-012', 'Good', 'Passed', 'Mike Johnson', 'Site Supervisor', 'Office Building Project', 'Warehouse A - Section 3', 'High quality rebar with mill certificates'),
(4, 'MIN-2026-0004', '2026-05-04', 100, 'Meter', 12000.00, 1200000.00, 50000.00, NULL, 'P Pipe Industries', '+255 713 456 123', 'INV-PPI-2026-005', 'PO-KT-2026-048', 'DN-PPI-2026-007', 'Good', 'Passed', 'Sarah Wilson', 'Project Manager', 'Fukayosi Real Estate Project', 'Warehouse C - Pipe Rack', 'Pressure tested before acceptance'),
(5, 'MIN-2026-0005', '2026-05-05', 2000, 'Piece', 350.00, 700000.00, 60000.00, 'Some bricks damaged during offloading - 50 pieces broken', 'Kiln Masters Ltd', '+255 714 321 654', 'INV-KM-2026-011', 'PO-KT-2026-049', 'DN-KM-2026-015', 'Partial', 'Conditional', 'David Brown', 'Quantity Surveyor', 'Road Construction - Bagamoyo', 'Yard B - Brick Stack', '50 damaged bricks recorded and will be replaced by supplier');

-- Insert sample materials out records
INSERT IGNORE INTO materials_out (material_id, track_number, issue_date, quantity_out, unit_of_measure, unit_price, total_value, issue_type, issued_to, issued_to_role, issued_to_department, project_name, destination, purpose, authorized_by, authorized_by_role, delivery_method, delivery_receipt_number, condition_on_issue, return_expected, notes) VALUES
(1, 'MOUT-2026-0001', '2026-05-06', 50, 'Bag', 18500.00, 925000.00, 'Project Use', 'Eng. Michael K. Johnson', 'Site Engineer', 'Project Management', 'Dar es Salaam Port Modernization', 'Site A - Port Area', 'Foundation works for new warehouse', 'Project Manager', 'Project Manager', 'Company Vehicle', 'DR-2026-001', 'New', FALSE, 'Issued for Phase 1 foundation concrete'),
(3, 'MOUT-2026-0002', '2026-05-07', 200, 'Meter', 8500.00, 1700000.00, 'Project Use', 'Sarah Wilson', 'Site Supervisor', 'Project Management', 'Office Building Project', 'Site B - CBD', 'Column reinforcement for ground floor', 'Project Manager', 'Project Manager', 'Supplier Delivery', 'DR-2026-002', 'New', FALSE, 'Delivered directly to site by supplier truck'),
(4, 'MOUT-2026-0003', '2026-05-08', 30, 'Meter', 12000.00, 360000.00, 'Project Use', 'John Doe', 'Plumbing Supervisor', 'Project Management', 'Residential Buildings - Kinondoni', 'Site C - Kinondoni', 'Main water supply line installation', 'Project Manager', 'Project Manager', 'Company Vehicle', 'DR-2026-003', 'New', FALSE, 'Schedule 40 PVC pipes for potable water'),
(2, 'MOUT-2026-0004', '2026-05-09', 20, 'Cubic Meter', 45000.00, 900000.00, 'Project Use', 'Jane Smith', 'Mason Foreman', 'Workers', 'Road Construction - Bagamoyo', 'Site D - Bagamoyo Road', 'Mortar mixing for culvert construction', 'Site Engineer', 'Site Engineer', 'Company Vehicle', 'DR-2026-004', 'New', FALSE, 'Fine sand for cement mortar'),
(5, 'MOUT-2026-0005', '2026-05-10', 500, 'Piece', 350.00, 175000.00, 'Sale', 'ABC Hardware Ltd', 'Manager', 'External', NULL, 'ABC Hardware - Kariakoo', 'Retail sale to external customer', 'Sales Manager', 'Sales Manager', 'Third Party', 'DR-2026-005', 'New', FALSE, 'Sold as excess stock to external hardware store');
