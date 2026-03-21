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

-- Insert admin user (only if not exists)
INSERT IGNORE INTO users (name, email, password, role, status) VALUES
('Admin User', 'admin@kashtec.co.tz', 'admin123', 'Managing Director', 'Active');
