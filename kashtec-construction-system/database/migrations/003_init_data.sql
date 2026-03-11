-- Initialize database with sample data for frontend testing

USE kashtec_db;

-- Insert sample users if they don't exist
INSERT IGNORE INTO users (id, name, email, phone, location, service_type, role, department, password, status) VALUES
(1, 'John Michael', 'john.michael@kashtec.co.tz', '+255 754 123 001', 'Dar es Salaam', 'Management', 'Managing Director', 'Management', 'admin123', 'Active'),
(2, 'Mary Johnson', 'mary.johnson@kashtec.co.tz', '+255 754 123 002', 'Dar es Salaam', 'Management', 'HR Manager', 'Human Resources', 'admin123', 'Active'),
(3, 'Robert Kim', 'robert.kim@kashtec.co.tz', '+255 754 123 003', 'Dar es Salaam', 'Management', 'Finance Manager', 'Finance', 'admin123', 'Active'),
(4, 'Sarah Wilson', 'sarah.wilson@kashtec.co.tz', '+255 754 123 004', 'Dar es Salaam', 'Management', 'Project Manager', 'Project Management', 'admin123', 'Active'),
(5, 'David Brown', 'david.brown@kashtec.co.tz', '+255 754 123 005', 'Dar es Salaam', 'Management', 'Real Estate Manager', 'Real Estate', 'admin123', 'Active'),
(6, 'Lisa Davis', 'lisa.davis@kashtec.co.tz', '+255 754 123 006', 'Dar es Salaam', 'Management', 'HSE Manager', 'Health & Safety', 'admin123', 'Active'),
(7, 'James Miller', 'james.miller@kashtec.co.tz', '+255 754 123 007', 'Dar es Salaam', 'Management', 'Office Assistant', 'Administrative', 'admin123', 'Active');

-- Insert sample projects
INSERT IGNORE INTO projects (id, name, description, location, start_date, end_date, status, budget, manager_id, created_by) VALUES
(1, 'Masaki Complex', 'Luxury residential complex with modern amenities', 'Masaki, Dar es Salaam', '2024-01-15', '2024-12-31', 'In Progress', 500000000.00, 4, 1),
(2, 'Kigamboni Plaza', 'Commercial shopping center development', 'Kigamboni, Dar es Salaam', '2024-02-01', '2025-06-30', 'Planning', 800000000.00, 4, 1),
(3, 'Mikochi Industrial', 'Industrial warehouse construction', 'Mikocheni, Dar es Salaam', '2023-11-01', '2024-08-31', 'Completed', 300000000.00, 4, 1),
(4, 'Upanga Offices', 'Modern office building complex', 'Upanga, Dar es Salaam', '2024-03-01', '2024-10-31', 'In Progress', 250000000.00, 4, 1);

-- Insert sample employees
INSERT IGNORE INTO employees (id, user_id, employee_id, position, department, salary, hire_date, status) VALUES
(1, 1, 'EMP001', 'Managing Director', 'Management', 5000000.00, '2023-01-01', 'Active'),
(2, 2, 'EMP002', 'HR Manager', 'Human Resources', 3500000.00, '2023-02-01', 'Active'),
(3, 3, 'EMP003', 'Finance Manager', 'Finance', 4000000.00, '2023-01-15', 'Active'),
(4, 4, 'EMP004', 'Project Manager', 'Project Management', 3800000.00, '2023-03-01', 'Active'),
(5, 5, 'EMP005', 'Real Estate Manager', 'Real Estate', 3200000.00, '2023-04-01', 'Active'),
(6, 6, 'EMP006', 'HSE Manager', 'Health & Safety', 3000000.00, '2023-05-01', 'Active'),
(7, 7, 'EMP007', 'Office Assistant', 'Administrative', 1500000.00, '2023-06-01', 'Active');

-- Insert sample properties
INSERT IGNORE INTO properties (id, title, description, location, type, price, status, size_sqm, bedrooms, bathrooms, parking_spaces, agent_id) VALUES
(1, 'Modern Apartment - Masaki', '3-bedroom luxury apartment with sea view', 'Masaki, Dar es Salaam', 'Residential', 85000000, 'Available', 120, 3, 2, 1, 5),
(2, 'Commercial Space - City Center', 'Prime commercial space in business district', 'City Center, Dar es Salaam', 'Commercial', 150000000, 'Available', 250, 0, 2, 5, 5),
(3, 'Industrial Warehouse - Mikocheni', 'Large industrial warehouse with loading docks', 'Mikocheni, Dar es Salaam', 'Industrial', 200000000, 'Under Offer', 500, 0, 2, 10, 5),
(4, 'Land for Development - Kigamboni', 'Prime development land with sea access', 'Kigamboni, Dar es Salaam', 'Land', 100000000, 'Available', 2000, 0, 0, 0, 5);

-- Insert sample financial transactions
INSERT IGNORE INTO financial_transactions (id, type, category, description, amount, date, created_by, status) VALUES
(1, 'Income', 'Project Payment', 'Payment received for Masaki Complex Phase 1', 100000000.00, '2024-01-20', 3, 'Approved'),
(2, 'Expense', 'Salaries', 'Monthly salary payments - January 2024', 25000000.00, '2024-01-25', 3, 'Approved'),
(3, 'Income', 'Property Sale', 'Sale of apartment in Masaki', 85000000.00, '2024-02-01', 3, 'Approved'),
(4, 'Expense', 'Materials', 'Construction materials for Kigamboni Plaza', 50000000.00, '2024-02-10', 3, 'Approved'),
(5, 'Income', 'Project Payment', 'Payment received for Mikochi Industrial', 150000000.00, '2024-02-15', 3, 'Approved'),
(6, 'Expense', 'Equipment', 'Purchase of construction equipment', 75000000.00, '2024-02-20', 3, 'Approved');

-- Insert sample HSE incidents
INSERT IGNORE INTO hse_incidents (id, incident_number, type, severity, location, description, root_cause, immediate_actions, preventive_measures, incident_date, reported_by, project_id, status) VALUES
(1, 'INC001', 'Accident', 'Moderate', 'Masaki Complex Site', 'Worker slipped on wet surface', 'Rain water accumulation', 'Provided first aid, cleaned area', 'Install proper drainage, provide safety signs', '2024-01-15 10:30:00', 6, 1, 'Closed'),
(2, 'INC002', 'Near Miss', 'Minor', 'Kigamboni Plaza Site', 'Falling debris near workers', 'Improper material storage', 'Secured materials, evacuated area', 'Implement proper material storage procedures', '2024-02-05 14:20:00', 6, 2, 'Closed'),
(3, 'INC003', 'Injury', 'Major', 'Mikochi Industrial Site', 'Worker injured by machinery', 'Lack of proper training', 'Medical attention provided', 'Mandatory safety training for all operators', '2024-02-10 09:15:00', 6, 3, 'Follow-up Required');

-- Insert sample PPE issuance
INSERT IGNORE INTO ppe_issuance (id, issuance_number, employee_id, ppe_type, condition, issue_date, issued_by, project_id, notes, status) VALUES
(1, 'PPE001', 1, 'Helmet', 'New', '2024-01-01', 7, 1, 'Standard issue PPE', 'Issued'),
(2, 'PPE002', 2, 'Gloves', 'New', '2024-01-01', 7, 1, 'Standard issue PPE', 'Issued'),
(3, 'PPE003', 3, 'Boots', 'New', '2024-01-01', 7, 1, 'Standard issue PPE', 'Issued'),
(4, 'PPE004', 4, 'Vest', 'Replacement', '2024-01-15', 7, 2, 'Replacement for damaged vest', 'Issued'),
(5, 'PPE005', 5, 'Goggles', 'New', '2024-02-01', 7, 2, 'Safety equipment for site work', 'Issued');

-- Insert sample office portal users
INSERT IGNORE INTO office_portal_users (id, name, email, phone, role, department, employee_id, position, location, registration_date, status, access_level, permissions) VALUES
('user1', 'John Michael', 'john.michael@kashtec.co.tz', '+255 754 123 001', 'Managing Director', 'Management', 'EMP001', 'Managing Director', 'Dar es Salaam', '2023-01-01', 'Active', 'Full Access', '["all"]'),
('user2', 'Mary Johnson', 'mary.johnson@kashtec.co.tz', '+255 754 123 002', 'HR Manager', 'Human Resources', 'EMP002', 'HR Manager', 'Dar es Salaam', '2023-02-01', 'Active', 'Department Access', '["hr", "employees"]'),
('user3', 'Robert Kim', 'robert.kim@kashtec.co.tz', '+255 754 123 003', 'Finance Manager', 'Finance', 'EMP003', 'Finance Manager', 'Dar es Salaam', '2023-01-15', 'Active', 'Department Access', '["finance", "transactions"]'),
('user4', 'Sarah Wilson', 'sarah.wilson@kashtec.co.tz', '+255 754 123 004', 'Project Manager', 'Project Management', 'EMP004', 'Project Manager', 'Dar es Salaam', '2023-03-01', 'Active', 'Department Access', '["projects", "hse"]'),
('user5', 'David Brown', 'david.brown@kashtec.co.tz', '+255 754 123 005', 'Real Estate Manager', 'Real Estate', 'EMP005', 'Real Estate Manager', 'Dar es Salaam', '2023-04-01', 'Active', 'Department Access', '["properties", "sales"]'),
('user6', 'Lisa Davis', 'lisa.davis@kashtec.co.tz', '+255 754 123 006', 'HSE Manager', 'Health & Safety', 'EMP006', 'HSE Manager', 'Dar es Salaam', '2023-05-01', 'Active', 'Department Access', '["hse", "incidents"]'),
('user7', 'James Miller', 'james.miller@kashtec.co.tz', '+255 754 123 007', 'Office Assistant', 'Administrative', 'EMP007', 'Office Assistant', 'Dar es Salaam', '2023-06-01', 'Active', 'Basic Access', '["basic"]');
