-- Sample Data for Managing Director API Testing
-- KASHTEC Construction Management System

-- Insert Sample Projects
INSERT INTO projects (
    id, name, description, location, start_date, end_date,
    status, budget, manager_id, client_name, project_code,
    project_type, contract_value, key_deliverables, priority_level,
    created_at, updated_at
) VALUES 
('PRJ1705123456', 'Downtown Shopping Mall', 'Construction of 5-story shopping complex with modern amenities', 'Dar es Salaam City Center', '2024-01-01', '2024-12-31', 'Active', 2500000.00, 'MGR001', 'Tanzania Mall Developers', 'TM-001', 'Commercial', 2500000.00, 'Structure completion, Interior finishing, Safety certification', 'High', NOW(), NOW()),
('PRJ1705123457', 'Residential Apartment Complex', 'Construction of 200-unit residential complex with recreational facilities', 'Kigamboni, Dar es Salaam', '2024-02-01', '2025-02-28', 'Planning', 1800000.00, 'MGR002', 'Housing Tanzania Ltd', 'HT-002', 'Residential', 1800000.00, 'Building completion, Utilities installation, Landscaping', 'Medium', NOW(), NOW()),
('PRJ1705123458', 'Highway Bridge Construction', 'Construction of 500-meter highway bridge over river', 'Morogoro Highway', '2023-06-01', '2024-06-30', 'In Progress', 3200000.00, 'MGR001', 'Tanzania Highway Authority', 'TH-003', 'Infrastructure', 3200000.00, 'Bridge structure, Safety barriers, Road connection', 'High', NOW(), NOW()),
('PRJ1705123459', 'Office Complex Development', '10-story office building with parking facilities', 'Ubungo Business District', '2024-03-01', '2025-01-31', 'Planning', 2800000.00, 'MGR003', 'Business Properties Ltd', 'BP-004', 'Commercial', 2800000.00, 'Structure, MEP systems, Interior finishing', 'High', NOW(), NOW()),
('PRJ1705123460', 'School Construction Project', 'Construction of secondary school with sports facilities', 'Mikocheni, Dar es Salaam', '2024-01-15', '2024-08-15', 'Active', 1200000.00, 'MGR002', 'Ministry of Education', 'ME-005', 'Educational', 1200000.00, 'Classrooms, Laboratory, Sports ground', 'Medium', NOW(), NOW());

-- Insert Sample Employees
INSERT INTO employees (
    id, name, email, phone, department, position, hire_date, status,
    created_at, updated_at
) VALUES 
('EMP001', 'Sarah Johnson', 'sarah.johnson@kashtec.co.tz', '+255712345678', 'Management', 'Project Manager', '2023-01-15', 'Active', NOW(), NOW()),
('EMP002', 'Michael Chen', 'michael.chen@kashtec.co.tz', '+255712345679', 'Management', 'Project Manager', '2023-03-20', 'Active', NOW(), NOW()),
('EMP003', 'James Wilson', 'james.wilson@kashtec.co.tz', '+255712345680', 'Construction', 'Site Manager', '2022-06-10', 'Active', NOW(), NOW()),
('EMP004', 'Amina Hassan', 'amina.hassan@kashtec.co.tz', '+255712345681', 'Engineering', 'Senior Engineer', '2022-09-15', 'Active', NOW(), NOW()),
('EMP005', 'Peter Mwangi', 'peter.mwangi@kashtec.co.tz', '+255712345682', 'Construction', 'Project Supervisor', '2023-02-01', 'Active', NOW(), NOW()),
('EMP006', 'Grace Kimaro', 'grace.kimaro@kashtec.co.tz', '+255712345683', 'Safety', 'Safety Officer', '2023-04-10', 'Active', NOW(), NOW()),
('EMP007', 'David Mkapa', 'david.mkapa@kashtec.co.tz', '+255712345684', 'Finance', 'Financial Controller', '2022-11-20', 'Active', NOW(), NOW()),
('EMP008', 'Fatuma Ali', 'fatuma.ali@kashtec.co.tz', '+255712345685', 'Engineering', 'Structural Engineer', '2023-05-15', 'Active', NOW(), NOW()),
('EMP009', 'John Smith', 'john.smith@kashtec.co.tz', '+255712345686', 'Construction', 'Foreman', '2023-07-01', 'Active', NOW(), NOW()),
('EMP010', 'Maria Kessy', 'maria.kessy@kashtec.co.tz', '+255712345687', 'Administration', 'HR Manager', '2022-08-25', 'Active', NOW(), NOW());

-- Insert Sample Work Assignments
INSERT INTO worker_assignments (
    employee_id, employee_name, project_id, project_name, role_in_project,
    start_date, end_date, assignment_notes, assigned_by, assigned_by_role, created_at
) VALUES 
('EMP003', 'James Wilson', 'PRJ1705123456', 'Downtown Shopping Mall', 'Site Manager', '2024-01-01', '2024-12-31', 'Overall site management and coordination', 'Sarah Johnson', 'Project Manager', NOW()),
('EMP004', 'Amina Hassan', 'PRJ1705123456', 'Downtown Shopping Mall', 'Senior Engineer', '2024-01-01', '2024-12-31', 'Structural engineering oversight', 'Sarah Johnson', 'Project Manager', NOW()),
('EMP005', 'Peter Mwangi', 'PRJ1705123456', 'Downtown Shopping Mall', 'Project Supervisor', '2024-01-01', '2024-12-31', 'Daily supervision and quality control', 'Sarah Johnson', 'Project Manager', NOW()),
('EMP006', 'Grace Kimaro', 'PRJ1705123456', 'Downtown Shopping Mall', 'Safety Officer', '2024-01-01', '2024-12-31', 'Safety compliance and inspections', 'Sarah Johnson', 'Project Manager', NOW()),
('EMP009', 'John Smith', 'PRJ1705123456', 'Downtown Shopping Mall', 'Foreman', '2024-01-01', '2024-12-31', 'On-site team coordination', 'James Wilson', 'Site Manager', NOW()),
('EMP008', 'Fatuma Ali', 'PRJ1705123458', 'Highway Bridge Construction', 'Structural Engineer', '2023-06-01', '2024-06-30', 'Bridge structural design and supervision', 'Michael Chen', 'Project Manager', NOW()),
('EMP003', 'James Wilson', 'PRJ1705123460', 'School Construction Project', 'Site Manager', '2024-01-15', '2024-08-15', 'Educational facility construction management', 'Michael Chen', 'Project Manager', NOW());

-- Insert Sample Task Assignments
INSERT INTO task_assignments (
    project_id, task_name, assigned_to, task_priority,
    start_date, due_date, task_description, estimated_hours,
    required_skills, materials_equipment, created_by
) VALUES 
('PRJ1705123456', 'Foundation Excavation', 'EMP009', 'High', '2024-01-01', '2024-01-15', 'Excavate foundation area to required depth', 160, 'Heavy equipment operation, Site supervision', 'Excavator, Dump trucks, Survey equipment', 'James Wilson'),
('PRJ1705123456', 'Concrete Foundation Pouring', 'EMP005', 'High', '2024-01-16', '2024-01-25', 'Pour concrete foundation for main structure', 200, 'Concrete work, Quality control', 'Concrete mixer, Reinforcement steel, Vibration equipment', 'James Wilson'),
('PRJ1705123456', 'Steel Structure Erection', 'EMP004', 'High', '2024-02-01', '2024-03-15', 'Erect steel frame for 5-story structure', 320, 'Steel fabrication, Crane operation', 'Crane, Welding equipment, Safety harnesses', 'Amina Hassan'),
('PRJ1705123458', 'Bridge Pillar Construction', 'EMP008', 'Critical', '2023-06-01', '2023-08-30', 'Construct concrete support pillars for bridge', 480, 'Bridge construction, Concrete technology', 'Concrete batching plant, Formwork, Pumping equipment', 'Fatuma Ali'),
('PRJ1705123460', 'Classroom Block Construction', 'EMP003', 'Medium', '2024-01-15', '2024-04-15', 'Construct main classroom building', 600, 'Educational construction, Project management', 'Construction materials, Safety equipment', 'James Wilson');

-- Insert Sample Workforce Requests
INSERT INTO workforce_requests (
    project_id, request_type, workers_needed, duration,
    job_categories, justification, start_date, end_date,
    special_requirements, requested_by, status, created_at
) VALUES 
('PRJ1705123457', 'Additional Workers', 15, '3 months', 'Electricians, Plumbers, Carpenters', 'Project phase requires additional skilled workers for interior finishing', '2024-02-01', '2024-04-30', 'Experience with high-rise construction', 'Michael Chen', 'Pending', NOW()),
('PRJ1705123459', 'Specialized Skills', 8, '2 months', 'HVAC Technicians, Elevator Installers', 'Office complex requires specialized systems installation', '2024-04-01', '2024-05-31', 'Certified technicians with commercial experience', 'Sarah Johnson', 'Pending', NOW()),
('PRJ1705123456', 'Temporary Workers', 20, '1 month', 'General Laborers', 'Increased workload due to accelerated timeline', '2024-01-20', '2024-02-20', 'Physically fit, able to work overtime', 'James Wilson', 'Approved', NOW());

-- Insert Sample Work Approvals
INSERT INTO work_approvals (
    work_id, project_id, completed_by, completion_date, quality_assessment,
    compliance_check, approval_comments, safety_compliance, time_completion,
    quality_score, status, created_at
) VALUES 
('WK001', 'PRJ1705123456', 'EMP009', '2024-01-14', 'Foundation excavation completed to specifications and depth requirements', 'Passed all safety and quality standards', 'Ready for foundation pouring phase', '100% compliance with safety protocols', 'Completed on schedule', 9.0, 'Pending', NOW()),
('WK002', 'PRJ1705123458', 'EMP008', '2024-01-10', 'Bridge pillar construction meets engineering specifications', 'All structural requirements met, quality checks passed', 'Structural integrity verified, ready for bridge deck', 'Excellent safety record maintained', 'Ahead of schedule by 3 days', 9.5, 'Pending', NOW()),
('WK003', 'PRJ1705123460', 'EMP003', '2024-01-12', 'Site preparation and grading completed according to plans', 'Compliance with environmental and building regulations', 'Site ready for foundation work', 'All safety measures implemented', 'On schedule', 8.8, 'Pending', NOW());

-- Insert Sample Leave Requests
INSERT INTO leave_requests (
    employee_id, leave_type, start_date, end_date, reason,
    status, created_at
) VALUES 
('EMP001', 'Annual Leave', '2024-02-01', '2024-02-07', 'Family vacation and personal time', 'Pending', NOW()),
('EMP004', 'Sick Leave', '2024-01-18', '2024-01-19', 'Medical appointment and recovery', 'Approved', NOW()),
('EMP007', 'Annual Leave', '2024-03-15', '2024-03-22', 'Travel and family commitments', 'Pending', NOW()),
('EMP010', 'Maternity Leave', '2024-04-01', '2024-06-30', 'Maternity leave as per company policy', 'Approved', NOW());

-- Insert Sample Budget Requests
INSERT INTO budget_requests (
    project_id, request_type, amount, justification, urgency,
    requested_by, status, created_at
) VALUES 
('PRJ1705123456', 'Additional Budget', 150000.00, 'Unforeseen site conditions requiring additional foundation work due to soil instability', 'High', 'Sarah Johnson', 'Pending', NOW()),
('PRJ1705123458', 'Budget Reallocation', 75000.00, 'Need for higher quality materials due to bridge load requirements change', 'Medium', 'Michael Chen', 'Pending', NOW()),
('PRJ1705123459', 'Contingency Fund', 200000.00, 'Price increase in steel and cement affecting project budget', 'High', 'Sarah Johnson', 'Pending', NOW());

-- Insert Sample Safety Incidents
INSERT INTO safety_incidents (
    project_id, incident_type, severity, description, action_taken,
    incident_date, reported_by, status, created_at
) VALUES 
('PRJ1705123456', 'Minor Injury', 'Low', 'Worker slipped on wet surface during concrete pouring, minor ankle sprain', 'First aid provided, area cleaned, additional safety measures implemented', '2024-01-10 14:30:00', 'EMP006', 'Closed', NOW()),
('PRJ1705123458', 'Equipment Failure', 'Medium', 'Crane malfunction during pillar construction, work suspended temporarily', 'Equipment inspected and repaired, safety certification renewed', '2024-01-08 10:15:00', 'EMP008', 'Closed', NOW()),
('PRJ1705123460', 'Near Miss', 'Low', 'Scaffolding collapse prevented through timely inspection', 'Scaffolding reinforced, additional safety protocols implemented', '2024-01-12 16:45:00', 'EMP003', 'Closed', NOW());

-- Insert Sample Compliance Issues
INSERT INTO compliance_issues (
    project_id, issue_type, description, severity_level, required_action,
    due_date, status, reported_date
) VALUES 
('PRJ1705123457', 'Safety Protocol', 'Missing safety barriers on elevated work areas as per initial site inspection', 'Medium', 'Install proper safety barriers and fall protection systems immediately', '2024-01-20', 'Open', '2024-01-12 11:00:00'),
('PRJ1705123459', 'Environmental', 'Inadequate dust control measures causing environmental concerns', 'High', 'Implement dust suppression systems and environmental monitoring', '2024-01-18', 'Open', '2024-01-11 09:30:00'),
('PRJ1705123456', 'Documentation', 'Delayed submission of quality assurance documentation', 'Low', 'Update and submit all pending QA documentation', '2024-01-25', 'Open', '2024-01-13 14:20:00');

-- Insert Sample Risk Assessments
INSERT INTO risk_assessments (
    project_id, risk_category, risk_description, risk_level, probability,
    impact, mitigation_plan, review_date
) VALUES 
('PRJ1705123456', 'Structural', 'Complex foundation requirements in soft soil conditions', 'High', 'Medium', 'High', 'Enhanced soil testing, deep foundation design, continuous monitoring', '2024-01-15 09:00:00'),
('PRJ1705123458', 'Safety', 'Working at heights during bridge construction', 'High', 'High', 'High', 'Advanced fall protection systems, regular safety training, strict supervision', '2024-01-10 08:30:00'),
('PRJ1705123459', 'Financial', 'Material price volatility affecting project budget', 'Medium', 'High', 'Medium', 'Price lock agreements, alternative suppliers, contingency planning', '2024-01-12 11:15:00'),
('PRJ1705123460', 'Schedule', 'Rainy season potentially delaying construction timeline', 'Medium', 'Medium', 'Medium', 'Weather monitoring, flexible scheduling, protective measures', '2024-01-14 13:45:00');

-- Insert Sample Audit Reports
INSERT INTO audit_reports (
    audit_type, compliance_score, findings, recommendations,
    audit_date, auditor
) VALUES 
('Safety Compliance', 92, 'Overall excellent safety record with minor gaps in documentation', 'Improve safety documentation process, implement digital reporting system', '2024-01-08 00:00:00', 'External Safety Consultant'),
('Quality Assurance', 88, 'Good quality standards but need improvement in material testing procedures', 'Enhance material testing protocols, implement quality tracking system', '2024-01-05 00:00:00', 'Internal Quality Auditor'),
('Financial Management', 95, 'Excellent budget control and financial reporting', 'Maintain current practices, consider implementing automated expense tracking', '2024-01-03 00:00:00', 'External Financial Auditor'),
('Environmental Compliance', 85, 'Good environmental practices but need improvement in waste management', 'Implement comprehensive waste management system, enhance environmental monitoring', '2024-01-07 00:00:00', 'Environmental Compliance Officer');

-- Insert Sample Expenses
INSERT INTO expenses (
    project_id, category, amount, description, expense_date
) VALUES 
('PRJ1705123456', 'Labor', 450000.00, 'Monthly wages for construction workers', '2024-01-31'),
('PRJ1705123456', 'Materials', 280000.00, 'Steel and cement purchase for foundation work', '2024-01-25'),
('PRJ1705123456', 'Equipment', 85000.00, 'Crane rental and heavy equipment costs', '2024-01-20'),
('PRJ1705123458', 'Labor', 320000.00, 'Specialized labor for bridge construction', '2024-01-31'),
('PRJ1705123458', 'Materials', 410000.00, 'High-quality concrete and reinforcement materials', '2024-01-28'),
('PRJ1705123458', 'Subcontractors', 150000.00, 'Specialized bridge construction subcontractor', '2024-01-15'),
('PRJ1705123457', 'Materials', 120000.00, 'Initial material procurement for residential complex', '2024-01-30'),
('PRJ1705123460', 'Labor', 180000.00, 'Teaching staff and construction worker salaries', '2024-01-31');

-- Insert Sample Attendance Records
INSERT INTO attendance (
    employee_id, attendance_date, status, check_in, check_out
) VALUES 
('EMP001', '2024-01-15', 'Present', '08:00:00', '17:00:00'),
('EMP002', '2024-01-15', 'Present', '08:30:00', '17:30:00'),
('EMP003', '2024-01-15', 'Present', '07:45:00', '17:15:00'),
('EMP004', '2024-01-15', 'Present', '08:00:00', '17:00:00'),
('EMP005', '2024-01-15', 'Present', '07:30:00', '17:30:00'),
('EMP006', '2024-01-15', 'Present', '08:15:00', '17:15:00'),
('EMP007', '2024-01-15', 'Present', '08:00:00', '17:00:00'),
('EMP008', '2024-01-15', 'Present', '08:00:00', '17:00:00'),
('EMP009', '2024-01-15', 'Present', '07:00:00', '18:00:00'),
('EMP010', '2024-01-15', 'Absent', NULL, NULL),
('EMP001', '2024-01-14', 'Present', '08:00:00', '17:00:00'),
('EMP002', '2024-01-14', 'Present', '08:30:00', '17:30:00'),
('EMP003', '2024-01-14', 'Present', '07:45:00', '17:15:00'),
('EMP004', '2024-01-14', 'Present', '08:00:00', '17:00:00'),
('EMP005', '2024-01-14', 'Present', '07:30:00', '17:30:00');

-- Insert Sample Site Reports
INSERT INTO site_reports (
    project_id, report_date, weather_conditions, site_supervisor,
    workers_present, work_completed, site_issues, safety_incidents,
    materials_used, equipment_used, next_day_plan, status, created_by
) VALUES 
('PRJ1705123456', '2024-01-15', 'Sunny, 28°C', 'James Wilson', 45, 'Foundation excavation completed, formwork installation started', 'Minor delay due to equipment maintenance', 0, 'Concrete, reinforcement steel, formwork materials', 'Excavator, concrete mixer, welding equipment', 'Continue formwork installation, prepare for concrete pouring', 'Submitted', 'James Wilson'),
('PRJ1705123458', '2024-01-15', 'Partly cloudy, 25°C', 'Fatuma Ali', 32, 'Bridge pillar construction progressing, 70% completed', 'No major issues reported', 0, 'High-grade concrete, steel reinforcement, formwork', 'Concrete pump, crane, vibration equipment', 'Complete remaining pillar construction, begin bridge deck preparation', 'Submitted', 'Fatuma Ali'),
('PRJ1705123460', '2024-01-15', 'Light rain, 22°C', 'James Wilson', 28, 'Site grading completed, foundation layout marked', 'Rain delay for 2 hours, work resumed after weather improvement', 0, 'Gravel, sand, marking materials', 'Grader, survey equipment, compactor', 'Begin foundation excavation if weather permits', 'Submitted', 'James Wilson');
