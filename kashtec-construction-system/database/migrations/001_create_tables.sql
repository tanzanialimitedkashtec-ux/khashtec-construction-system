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
  registration_date DATE DEFAULT CURRENT_DATE,
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
INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status) VALUES
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
INSERT INTO office_portal (department_name, department_code, manager_email, description, settings, status) VALUES
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
  condition ENUM('New', 'Good', 'Worn', 'Damaged') DEFAULT 'Good',
  last_inspected DATE,
  storage_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (ppe_type),
  INDEX idx_condition (condition),
  INDEX idx_quantity (quantity)
);

-- Policy Management Tables
CREATE TABLE IF NOT EXISTS policies (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  submitted_by VARCHAR(255) NOT NULL,
  submitted_by_role VARCHAR(100),
  submission_date DATE DEFAULT CURRENT_DATE,
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

INSERT IGNORE INTO project_work (department_code, work_type, work_title, work_description, project_name, client_name, project_phase, status, priority, submitted_by, submitted_date, due_date) VALUES
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
  
  -- Foreign key relationship to schedule_meetings table
  FOREIGN KEY (meeting_id) REFERENCES schedule_meetings(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_meeting_date (meeting_date),
  INDEX idx_meeting_type (meeting_type),
  INDEX idx_department (organizing_department),
  INDEX idx_status (status),
  INDEX idx_prepared_by (prepared_by),
  INDEX idx_follow_up_date (follow_up_date)
);

-- Insert sample meeting minutes data
INSERT IGNORE INTO meeting_minutes (
  meeting_id, meeting_title, meeting_date, meeting_type, location, organizing_department,
  attendees, minutes_content, action_items, decisions_made, next_steps, follow_up_date,
  status, prepared_by, reviewed_by, approved_by
) VALUES
(1, 'Monthly Management Review', CURDATE(), 'management', 'Board Room', 'management',
  'Dr. John Smith, HR Manager, Finance Manager, Project Manager', 
  'Monthly review of project progress, financial status, and operational challenges.',
  '1. Review Q2 budget proposals\n2. Approve new project timeline\n3. Address staffing issues',
  'Budget approval deferred pending additional information. Project timeline approved with modifications.',
  'Schedule follow-up meeting for budget review next week. Update project documentation.',
  DATE_ADD(CURDATE(), INTERVAL 7 DAY),
  'Draft', 'Admin Assistant', NULL, NULL);
