-- Seed data for KASHTEC database
-- This should run after all tables are created

USE railway;

-- Insert sample users if they don't exist
INSERT IGNORE INTO users (id, name, email, phone, location, service_type, role, department, password, status) VALUES
(1, 'John Michael', 'john.michael@kashtec.co.tz', '+255 754 123 001', 'Dar es Salaam', 'Managing Director', 'Management', 'admin123', 'Active'),
(2, 'Mary Johnson', 'mary.johnson@kashtec.co.tz', '+255 754 123 002', 'Dar es Salaam', 'Management', 'HR Manager', 'Human Resources', 'admin123', 'Active'),
(3, 'Robert Kim', 'robert.kim@kashtec.co.tz', '+255 754 123 003', 'Dar es Salaam', 'Management', 'Finance Manager', 'Finance', 'admin123', 'Active'),
(4, 'Sarah Wilson', 'sarah.wilson@kashtec.co.tz', '+255 754 123 004', 'Dar es Salaam', 'Management', 'Project Manager', 'Project Management', 'admin123', 'Active'),
(5, 'David Brown', 'david.brown@kashtec.co.tz', '+255 754 123 005', 'Dar es Salaam', 'Management', 'Real Estate Manager', 'Real Estate', 'admin123', 'Active'),
(6, 'Lisa Davis', 'lisa.davis@kashtec.co.tz', '+255 754 123 006', 'Dar es Salaam', 'Management', 'HSE Manager', 'Health & Safety', 'admin123', 'Active'),
(7, 'James Miller', 'james.miller@kashtec.co.tz', '+255 754 123 007', 'Dar es Salaam', 'Management', 'Office Assistant', 'Administrative', 'admin123', 'Active');

-- Insert sample projects
INSERT IGNORE INTO projects (id, name, description, location, start_date, end_date, status, budget, manager_id, created_by) VALUES
(1, 'Masaki Complex', 'Luxury residential complex with modern amenities', 'Masaki, Dar es Salaam', '2024-01-15', '2024-12-31', 'In Progress', 500000000.00, 1, 1),
(2, 'Kigamboni Plaza', 'Commercial shopping center development', 'Kigamboni, Dar es Salaam', '2024-02-01', '2025-06-30', 'Planning', 800000000.00, 4, 1),
(3, 'Mikochi Industrial', 'Industrial warehouse construction', 'Mikocheni, Dar es Salaam', '2023-11-01', '2024-08-31', 'Completed', 300000000.00, 4, 1),
(4, 'Upanga Offices', 'Modern office building complex', 'Upanga, Dar es Salaam', '2024-03-01', '2024-10-31', 'In Progress', 250000000.00, 4, 1);
