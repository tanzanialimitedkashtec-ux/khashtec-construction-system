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

-- Department Work Tables
CREATE TABLE IF NOT EXISTS hr_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'HR',
  work_type ENUM('Employee Registration', 'Worker Account Creation', 'Project Assignment', 'Attendance Tracking', 'Leave Management', 'Contract Management', 'Policy Management', 'Senior Staff Hiring', 'Budget Approval') DEFAULT 'Employee Registration',
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

CREATE TABLE IF NOT EXISTS project_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) DEFAULT 'PROJECT',
  work_type ENUM('Project Creation', 'Progress Update', 'Task Assignment', 'Workforce Request', 'Site Report', 'Work Approval', 'Project Completion', 'Resource Management') DEFAULT 'Project Creation',
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
  work_type ENUM('Administrative Operations', 'Compliance Management', 'Staff Oversight', 'Policy Implementation', 'Document Management', 'User Account Management', 'System Administration', 'Department Coordination') DEFAULT 'Administrative Operations',
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
