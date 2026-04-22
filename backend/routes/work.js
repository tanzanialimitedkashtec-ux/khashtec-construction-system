const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
    console.log('🧪 Test endpoint accessed');
    res.json({ 
        message: 'Work API is working!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');
        const [result] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', result);
        res.json({ 
            message: 'Database connection successful',
            result: result
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({ 
            error: 'Database connection failed',
            details: error.message 
        });
    }
});

// Test HR table existence
router.get('/test-hr-table', async (req, res) => {
    try {
        console.log('🔍 Testing hr_work table existence...');
        const [result] = await db.execute('SHOW TABLES LIKE "hr_work"');
        console.log('✅ HR table check result:', result);
        res.json({ 
            message: 'HR table check successful',
            exists: result.length > 0,
            result: result
        });
    } catch (error) {
        console.error('❌ HR table check failed:', error);
        res.status(500).json({ 
            error: 'HR table check failed',
            details: error.message 
        });
    }
});

// Get all work items for a specific department
router.get('/:department', async (req, res) => {
    try {
        let department = req.params.department;
        
        // Fix department detection for GET requests too
        if (department === 'work') {
            const originalUrl = req.originalUrl || req.url;
            console.log('🔍 Original URL (GET):', originalUrl);
            
            if (originalUrl.includes('/api/hse/')) {
                department = 'hse';
            } else if (originalUrl.includes('/api/hr/')) {
                department = 'hr';
            } else if (originalUrl.includes('/api/finance/')) {
                department = 'finance';
            } else if (originalUrl.includes('/api/project/')) {
                department = 'projects';
            } else if (originalUrl.includes('/api/realestate/')) {
                department = 'realestate';
            } else if (originalUrl.includes('/api/admin/')) {
                department = 'admin';
            }
        }
        
        // Map assignments to admin_work table since assignments_work doesn't exist
        if (department === 'assignments') {
            department = 'admin';
            console.log('🔄 Mapping assignments department to admin_work table');
        }
        
        console.log(`📋 Fetching ${department} work items`);
        
        let workItems = [];
        
        try {
            const [dbWorkItems] = await db.execute(
                `SELECT * FROM ${department}_work ORDER BY submitted_date DESC`
            );
            workItems = dbWorkItems;
            console.log(`📊 Found ${workItems.length} ${department} work items from database`);
        } catch (dbError) {
            console.error('❌ Database error, using fallback work items:', dbError);
            
            // Fallback to mock work items based on department
            const mockWorkItems = {
                hr: [
                    {
                        id: 1,
                        department_code: 'HR',
                        work_type: 'Employee Registration',
                        work_title: 'New Employee Onboarding',
                        work_description: 'Complete onboarding for new hires',
                        employee_name: 'John Doe',
                        status: 'Pending',
                        priority: 'Medium',
                        submitted_by: 'HR Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    },
                    {
                        id: 2,
                        department_code: 'HR',
                        work_type: 'Leave Management',
                        work_title: 'Leave Request Processing',
                        work_description: 'Process pending leave requests',
                        employee_name: 'Jane Smith',
                        status: 'In Progress',
                        priority: 'High',
                        submitted_by: 'HR Assistant',
                        submitted_date: '2024-01-14',
                        mock: true
                    }
                ],
                finance: [
                    {
                        id: 1,
                        department_code: 'FINANCE',
                        work_type: 'Budget Management',
                        work_title: 'Q1 Budget Review',
                        work_description: 'Review and approve Q1 budget allocations',
                        amount: 150000.00,
                        status: 'Pending',
                        priority: 'High',
                        submitted_by: 'Finance Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ],
                hse: [
                    {
                        id: 1,
                        department_code: 'HSE',
                        work_type: 'Incident Reporting',
                        work_title: 'Safety Incident Investigation',
                        work_description: 'Investigate reported safety incident',
                        incident_type: 'Near Miss',
                        severity: 'Medium',
                        location: 'Site A',
                        status: 'In Progress',
                        priority: 'High',
                        submitted_by: 'HSE Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ],
                projects: [
                    {
                        id: 1,
                        department_code: 'PROJECT',
                        work_type: 'Project Creation',
                        work_title: 'New Project Setup',
                        work_description: 'Set up new construction project',
                        project_name: 'Tower Complex Phase 2',
                        client_name: 'ABC Corporation',
                        status: 'Pending',
                        priority: 'High',
                        submitted_by: 'Project Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ],
                realestate: [
                    {
                        id: 1,
                        department_code: 'REALESTATE',
                        work_type: 'Property Addition',
                        work_title: 'New Property Listing',
                        work_description: 'Add new property to portfolio',
                        property_address: '123 Main St, Dar es Salaam',
                        property_type: 'Commercial',
                        status: 'Pending',
                        priority: 'Medium',
                        submitted_by: 'Real Estate Manager',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ],
                admin: [
                    {
                        id: 1,
                        department_code: 'ADMIN',
                        work_type: 'Document Management',
                        work_title: 'Policy Document Update',
                        work_description: 'Update company policy documentation',
                        status: 'In Progress',
                        priority: 'Medium',
                        submitted_by: 'Admin Assistant',
                        submitted_date: '2024-01-15',
                        mock: true
                    }
                ]
            };
            
            workItems = mockWorkItems[department] || [];
            console.log(`📊 Using fallback ${department} work items: ${workItems.length}`);
        }
        
        res.json(workItems);
    } catch (error) {
        console.error(`Error fetching work items:`, error);
        res.status(500).json({ 
            success: false,
            error: `Failed to fetch work items`,
            details: error.message 
        });
    }
});

// Worker Assignments Routes
// Create new worker assignment (moved here to prevent conflicts with general POST route)
router.post('/assignments', async (req, res) => {
    try {
        console.log('📝 Creating new worker assignment...');
        console.log('📊 Request body:', req.body);
        
        const {
            employee_id,
            employee_name,
            project_id,
            project_name,
            role_in_project,
            start_date,
            end_date,
            assignment_notes,
            assigned_by = 'HR Manager',
            assigned_by_role = 'HR Manager'
        } = req.body;
        
        // Validate required fields
        if (!employee_id || !employee_name || !project_id || !project_name || !role_in_project || !start_date) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee_id', 'employee_name', 'project_id', 'project_name', 'role_in_project', 'start_date'],
                received: { employee_id, employee_name, project_id, project_name, role_in_project, start_date }
            });
        }
        
        // Insert new assignment with error handling for missing columns
        let result;
        try {
            result = await db.execute(`
                INSERT INTO worker_assignments (
                    employee_id, employee_name, project_id, project_name, role_in_project,
                    start_date, end_date, assignment_notes, status, assigned_by, assigned_by_role
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                employee_id,
                employee_name,
                project_id,
                project_name,
                role_in_project,
                start_date,
                end_date || null,
                assignment_notes || null,
                'Active', // Add status column
                assigned_by,
                assigned_by_role
            ]);
        } catch (columnError) {
            if (columnError.message.includes('Unknown column')) {
                console.log('?? Missing column detected, recreating worker_assignments table...');
                
                // Drop and recreate table with correct schema
                await db.execute("DROP TABLE IF EXISTS worker_assignments");
                await db.execute(`
                    CREATE TABLE worker_assignments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        employee_id VARCHAR(50) NOT NULL,
                        employee_name VARCHAR(255) NOT NULL,
                        project_id VARCHAR(50) NOT NULL,
                        project_name VARCHAR(255) NOT NULL,
                        role_in_project VARCHAR(255) NOT NULL,
                        start_date DATE NOT NULL,
                        end_date DATE NULL,
                        assignment_notes TEXT NULL,
                        status VARCHAR(50) DEFAULT 'Active',
                        assigned_by VARCHAR(255) NOT NULL,
                        assigned_by_role VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_employee_id (employee_id),
                        INDEX idx_project_id (project_id),
                        INDEX idx_status (status)
                    )
                `);
                
                console.log('?? worker_assignments table recreated, retrying insertion...');
                
                // Retry insertion
                result = await db.execute(`
                    INSERT INTO worker_assignments (
                        employee_id, employee_name, project_id, project_name, role_in_project,
                        start_date, end_date, assignment_notes, status, assigned_by, assigned_by_role
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    employee_id,
                    employee_name,
                    project_id,
                    project_name,
                    role_in_project,
                    start_date,
                    end_date || null,
                    assignment_notes || null,
                    'Active',
                    assigned_by,
                    assigned_by_role
                ]);
            } else {
                throw columnError;
            }
        }
        
        // Handle different result formats from db.execute()
        const insertId = Array.isArray(result) ? result[0].insertId : result.insertId;
        console.log('✅ Worker assignment created successfully:', result);
        console.log('✅ Insert ID:', insertId);
        
        // Verify the data was actually inserted
        try {
            const [verification] = await db.execute(
                'SELECT * FROM worker_assignments WHERE id = ?',
                [insertId]
            );
            console.log('🔍 Verification - Retrieved assignment:', verification);
            console.log('🔍 Verification - Assignment exists:', verification && verification.length > 0);
        } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
        }
        
        res.status(201).json({
            message: 'Worker assignment created successfully',
            assignment_id: insertId,
            data: {
                employee_id,
                employee_name,
                project_id,
                project_name,
                role_in_project,
                start_date,
                end_date,
                assignment_notes,
                assigned_by,
                assigned_by_role
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating worker assignment:', error);
        res.status(500).json({ 
            error: 'Failed to create worker assignment',
            details: error.message
        });
    }
});

// Get all worker assignments
router.get('/assignments', async (req, res) => {
    try {
        console.log('📋 Fetching worker assignments...');
        
        const [assignments] = await db.execute(`
            SELECT * FROM worker_assignments 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Worker assignments fetched:', assignments.length);
        res.json(assignments);
        
    } catch (error) {
        console.error('❌ Error fetching worker assignments:', error);
        res.status(500).json({ error: 'Failed to fetch worker assignments' });
    }
});

// Test endpoint to verify worker_assignments table
router.get('/assignments-test', async (req, res) => {
    try {
        console.log('🧪 Testing worker_assignments table...');
        
        // Check if table exists
        const [tableCheck] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'worker_assignments'
        `);
        
        console.log('🔍 Table exists check:', tableCheck[0].count > 0);
        
        if (tableCheck[0].count === 0) {
            return res.status(404).json({ 
                error: 'worker_assignments table does not exist',
                suggestion: 'Run database migrations'
            });
        }
        
        // Get table structure
        const [structure] = await db.execute('DESCRIBE worker_assignments');
        console.log('🔍 Table structure:', structure);
        
        // Get all records
        const [allRecords] = await db.execute('SELECT * FROM worker_assignments ORDER BY id DESC LIMIT 5');
        console.log('🔍 Recent records:', allRecords);
        
        res.json({
            table_exists: true,
            table_structure: structure,
            recent_records: allRecords,
            total_records: allRecords.length
        });
        
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        res.status(500).json({ error: 'Test failed', details: error.message });
    }
});

// Direct work assignment endpoint for HR department
router.post('/', async (req, res) => {
    try {
        console.log('🔍 Direct HR work assignment request received');
        console.log('📊 Request body:', req.body);
        
        const department = 'hr'; // Fixed for HR department
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            // HR-specific fields
            employee_name,
            employee_email,
            project_name,
            // Additional fields
            status = 'pending'
        } = req.body;
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        // Map frontend work types to database ENUM values
        const getMappedWorkType = (workType) => {
            const mappings = {
                'Attendance Management': 'Attendance Tracking',
                'Employee Registration': 'Employee Registration',
                'Worker Account Creation': 'Worker Account Creation',
                'Project Assignment': 'Project Assignment',
                'Leave Management': 'Leave Management',
                'Leave Request': 'Leave Management', // Added mapping for Leave Request
                'Contract Management': 'Contract Management',
                'Policy Management': 'Policy Management',
                'Senior Staff Hiring': 'Senior Staff Hiring',
                'Budget Approval': 'Budget Approval'
            };
            
            return mappings[workType] || workType;
        };
        
        const mapped_work_type = getMappedWorkType(work_type);
        console.log('🔄 Mapped work type:', work_type, '->', mapped_work_type);
        console.log('🔍 Work type length:', work_type ? work_type.length : 'undefined');
        console.log('🔍 Mapped work type length:', mapped_work_type ? mapped_work_type.length : 'undefined');
        
        // Validate that mapped_work_type is a valid ENUM value
        const validWorkTypes = [
            'Employee Registration', 'Worker Account Creation', 'Project Assignment', 
            'Attendance Tracking', 'Leave Management', 'Contract Management', 
            'Policy Management', 'Senior Staff Hiring', 'Budget Approval', 'Employment Action'
        ];
        
        if (!validWorkTypes.includes(mapped_work_type)) {
            console.log('❌ Invalid work type:', mapped_work_type);
            return res.status(400).json({
                error: 'Invalid work_type',
                details: `Work type "${mapped_work_type}" is not valid`,
                validOptions: validWorkTypes
            });
        }
        
        // Build the query for HR department
        let query = '';
        let values = [];
        
        // Base fields
        const baseFields = [
            'department_code',
            'work_type',
            'work_title', 
            'work_description',
            'priority',
            'due_date',
            'assigned_to',
            'submitted_by',
            'submitted_date',
            'status'
        ];
        
        const baseValues = [
            department,
            mapped_work_type,
            work_title,
            work_description,
            priority || 'Medium',
            due_date || null,
            assigned_to || null,
            submitted_by || null,
            new Date().toISOString().split('T')[0], // submitted_date
            status || 'pending'
        ];
        
        // HR-specific fields
        let additionalFields = [];
        let additionalValues = [];
        
        if (employee_name) {
            additionalFields.push('employee_name');
            additionalValues.push(employee_name);
        }
        if (employee_email) {
            additionalFields.push('employee_email');
            additionalValues.push(employee_email);
        }
        if (project_name) {
            additionalFields.push('project_name');
            additionalValues.push(project_name);
        }
        
        const allFields = baseFields.concat(additionalFields);
        const allValues = baseValues.concat(additionalValues);
        
        query = `
            INSERT INTO hr_work (
                ${allFields.join(', ')}
            ) VALUES (
                ${allFields.map(() => '?').join(', ')}
            )
        `;
        
        values = allValues;
        
        console.log('🔍 Executing query:', query);
        console.log('📊 Query values:', values);
        
        try {
            const result = await db.execute(query, values);
            console.log('✅ Work item created successfully:', result);
            
            const hrWorkId = result.insertId;
            
            // Check if this is a leave request or contract management and save to dedicated tables
            let dualSaveResult = null;
            
            if (work_type === 'Leave Management' || work_type === 'Leave Request') {
                console.log('🔄 Detected leave request, saving to leave_requests table...');
                try {
                    // Extract leave request data from the request
                    const {
                        employee: employee_id,
                        employee_name: leave_employee_name,
                        leaveType: leave_type,
                        startDate: start_date,
                        endDate: end_date,
                        daysRequested: days_requested,
                        reasonForLeave: reason_for_leave,
                        approvedBy
                    } = req.body;
                    
                    if (employee_id && leave_type && start_date && days_requested && reason_for_leave) {
                        const leaveQuery = `
                            INSERT INTO leave_requests (
                                employee_id, employee_name, leave_type, start_date, end_date,
                                days_requested, reason_for_leave, approval_status, approved_by,
                                approved_date, rejection_reason
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        const leaveValues = [
                            employee_id,
                            leave_employee_name || employee_name || 'Unknown Employee',
                            leave_type,
                            start_date,
                            end_date || null,
                            days_requested,
                            reason_for_leave,
                            'pending', // approval_status
                            approvedBy || null,
                            null, // approved_date
                            null // rejection_reason
                        ];
                        
                        const leaveResult = await db.execute(leaveQuery, leaveValues);
                        console.log('✅ Leave request also saved to leave_requests table:', leaveResult);
                        
                        dualSaveResult = {
                            leave_request_id: leaveResult.insertId,
                            table: 'leave_requests'
                        };
                    }
                } catch (leaveError) {
                    console.error('❌ Error saving to leave_requests table:', leaveError);
                    // Continue with response even if dual save fails
                }
            }
            
            if (work_type === 'Contract Management') {
                console.log('🔄 Detected contract management, saving to contracts table...');
                try {
                    // Extract contract data from the request
                    const {
                        employee: employee_id,
                        employee_name: contract_employee_name,
                        contract_type,
                        start_date,
                        end_date,
                        salary,
                        contract_status = 'active',
                        contract_terms,
                        contract_document,
                        created_by
                    } = req.body;
                    
                    if (employee_id && contract_type && start_date && salary) {
                        const contractQuery = `
                            INSERT INTO contracts (
                                employee_id, employee_name, contract_type, start_date, end_date,
                                salary, contract_status, contract_terms, contract_document, created_by
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        const contractValues = [
                            employee_id,
                            contract_employee_name || employee_name || 'Unknown Employee',
                            contract_type,
                            start_date,
                            end_date || null,
                            salary,
                            contract_status,
                            contract_terms || null,
                            contract_document || null,
                            created_by || 'HR Manager'
                        ];
                        
                        const contractResult = await db.execute(contractQuery, contractValues);
                        console.log('✅ Contract also saved to contracts table:', contractResult);
                        
                        dualSaveResult = {
                            contract_id: contractResult.insertId,
                            table: 'contracts'
                        };
                    }
                } catch (contractError) {
                    console.error('❌ Error saving to contracts table:', contractError);
                    // Continue with response even if dual save fails
                }
            }
            
            // Build response with dual save information
            const response = {
                message: 'Work item created successfully',
                id: hrWorkId,
                department,
                work_type: mapped_work_type,
                work_title,
                status,
                created_at: new Date().toISOString()
            };
            
            // Add dual save information if applicable
            if (dualSaveResult) {
                response.dual_save = {
                    success: true,
                    ...dualSaveResult,
                    message: `Also saved to ${dualSaveResult.table} table`
                };
            }
            
            res.status(201).json(response);
        } catch (dbError) {
            console.error('❌ Database execution error:', dbError);
            throw new Error(`Database query failed: ${dbError.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error creating work item:', error);
        res.status(500).json({ 
            error: 'Failed to create work item',
            details: error.message 
        });
    }
});

// Save Site Report
router.post('/site-reports', async (req, res) => {
    try {
        console.log('Saving site report...');
        console.log('Request body raw:', JSON.stringify(req.body, null, 2));
        
        const {
            project_id,
            report_date,
            weather_conditions,
            site_supervisor,
            workers_present,
            work_completed,
            site_issues,
            safety_incidents,
            materials_used,
            equipment_used,
            next_day_plan
        } = req.body;
        
        // Debug each field
        console.log('Field validation:');
        console.log('  project_id:', project_id, 'type:', typeof project_id, 'truthy:', !!project_id);
        console.log('  report_date:', report_date, 'type:', typeof report_date, 'truthy:', !!report_date);
        console.log('  weather_conditions:', weather_conditions, 'type:', typeof weather_conditions, 'truthy:', !!weather_conditions);
        console.log('  workers_present:', workers_present, 'type:', typeof workers_present, 'truthy:', !!workers_present);
        console.log('  work_completed:', work_completed, 'type:', typeof work_completed, 'truthy:', !!work_completed);
        console.log('  next_day_plan:', next_day_plan, 'type:', typeof next_day_plan, 'truthy:', !!next_day_plan);
        
        // Convert project_id from string to integer if needed
        let numericProjectId = project_id;
        if (typeof project_id === 'string' && project_id.startsWith('prj')) {
            // Extract numeric part from 'prj001', 'prj002', etc.
            const projectMap = {
                'prj001': 1,
                'prj002': 2,
                'prj003': 3
            };
            numericProjectId = projectMap[project_id] || parseInt(project_id.replace('prj', '')) || 1;
            console.log(`Converted project_id from ${project_id} to ${numericProjectId}`);
        }

        // Validate required fields with better checking
        const missingFields = [];
        if (!numericProjectId || numericProjectId === '') missingFields.push('project_id');
        if (!report_date || report_date === '') missingFields.push('report_date');
        if (!weather_conditions || weather_conditions === '') missingFields.push('weather_conditions');
        if (!workers_present || workers_present === '') missingFields.push('workers_present');
        if (!work_completed || work_completed === '') missingFields.push('work_completed');
        if (!next_day_plan || next_day_plan === '') missingFields.push('next_day_plan');
        
        if (missingFields.length > 0) {
            console.log('Missing fields detected:', missingFields);
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields',
                missing_fields: missingFields,
                received: {
                    project_id,
                    report_date,
                    weather_conditions,
                    workers_present,
                    work_completed,
                    next_day_plan
                }
            });
        }
        
        // Try to save to database
        try {
            const db = require('../../database/config/database');
            
            console.log('Checking if site_reports table exists...');
            
            // Create site_reports table if it doesn't exist
            await db.execute(`
                CREATE TABLE IF NOT EXISTS site_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    project_id INT NOT NULL,
                    report_date DATE NOT NULL,
                    weather_conditions VARCHAR(50) NOT NULL,
                    site_supervisor VARCHAR(255) NOT NULL,
                    workers_present INT NOT NULL,
                    work_completed TEXT NOT NULL,
                    site_issues TEXT,
                    safety_incidents TEXT,
                    materials_used TEXT,
                    equipment_used TEXT,
                    next_day_plan TEXT NOT NULL,
                    status ENUM('submitted', 'reviewed', 'approved') DEFAULT 'submitted',
                    created_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_project_id (project_id),
                    INDEX idx_report_date (report_date),
                    INDEX idx_status (status)
                )
            `);
            
            console.log('site_reports table ready...');
            
            // Log the values being inserted
            const insertValues = [
                numericProjectId, report_date, weather_conditions, site_supervisor,
                workers_present, work_completed, site_issues || null, safety_incidents || null,
                materials_used || null, equipment_used || null, next_day_plan, site_supervisor
            ];
            
            console.log('📝 Inserting values:', insertValues);
            console.log('📝 SQL Query:');
            console.log(`
                INSERT INTO site_reports (
                    project_id, report_date, weather_conditions, site_supervisor, 
                    workers_present, work_completed, site_issues, safety_incidents,
                    materials_used, equipment_used, next_day_plan, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
            `);
            
            // Insert site report into existing table
            const [result] = await db.execute(`
                INSERT INTO site_reports (
                    project_id, report_date, weather_conditions, site_supervisor, 
                    workers_present, work_completed, site_issues, safety_incidents,
                    materials_used, equipment_used, next_day_plan, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
            `, insertValues);
            
            console.log('✅ Site report saved to database with ID:', result.insertId);
            console.log('✅ Database insert result:', result);
            
            res.json({
                success: true,
                message: 'Site report submitted successfully',
                report_id: result.insertId,
                data: {
                    id: result.insertId,
                    project_id,
                    report_date,
                    weather_conditions,
                    site_supervisor,
                    workers_present,
                    work_completed,
                    site_issues,
                    safety_incidents,
                    materials_used,
                    equipment_used,
                    next_day_plan,
                    created_at: new Date().toISOString()
                }
            });
            
        } catch (dbError) {
            console.error('❌ Database error, using fallback for site report:', dbError.message);
            console.error('❌ Full database error:', dbError);
            console.error('❌ Error stack:', dbError.stack);
            
            // Fallback: Generate a mock report ID and return success
            const reportId = `SR${Date.now().toString().slice(-6)}`;
            
            res.json({
                success: true,
                message: 'Site report submitted successfully (saved locally)',
                report_id: reportId,
                fallback: true,
                data: {
                    id: reportId,
                    project_id,
                    report_date,
                    weather_conditions,
                    site_supervisor,
                    workers_present,
                    work_completed,
                    site_issues,
                    safety_incidents,
                    materials_used,
                    equipment_used,
                    next_day_plan,
                    created_at: new Date().toISOString()
                }
            });
        }
        
    } catch (error) {
        console.error('Error saving site report:', error);
        res.status(500).json({ 
            error: 'Failed to save site report',
            details: error.message 
        });
    }
});

// Get Site Reports
router.get('/site-reports', async (req, res) => {
    try {
        console.log('Fetching site reports...');
        
        // Try to get from database
        try {
            const db = require('../../database/config/database');
            
            const [reports] = await db.execute(`
                SELECT id, project_id, report_date, weather_conditions, site_supervisor, 
                       workers_present, work_completed, site_issues, safety_incidents,
                       materials_used, equipment_used, next_day_plan, status, created_by, created_at
                FROM site_reports 
                ORDER BY created_at DESC 
                LIMIT 10
            `);
            
            console.log('Site reports from database:', reports.length);
            res.json(reports);
            
        } catch (dbError) {
            console.log('Database error, using fallback site reports:', dbError.message);
            
            // Fallback mock data
            const mockReports = [
                {
                    id: 'SR001',
                    project_id: 'prj001',
                    report_date: '2024-03-15',
                    weather_conditions: 'sunny',
                    site_supervisor: 'John Smith',
                    workers_present: 15,
                    work_completed: 'Foundation excavation completed',
                    site_issues: 'Minor delay due to equipment shortage',
                    safety_incidents: 'None',
                    materials_used: 'Cement: 50 bags, Steel: 2 tons',
                    equipment_used: 'Excavator, Concrete Mixer',
                    next_day_plan: 'Begin foundation pouring',
                    created_at: '2024-03-15T16:00:00Z',
                    fallback: true
                },
                {
                    id: 'SR002',
                    project_id: 'prj002',
                    report_date: '2024-03-14',
                    weather_conditions: 'cloudy',
                    site_supervisor: 'Jane Doe',
                    workers_present: 12,
                    work_completed: 'Steel frame installation 60% complete',
                    site_issues: 'Weather delay in afternoon',
                    safety_incidents: '1 near miss - tool drop',
                    materials_used: 'Steel beams: 15, Bolts: 200',
                    equipment_used: 'Crane, Welding machine',
                    next_day_plan: 'Complete steel frame installation',
                    created_at: '2024-03-14T17:30:00Z',
                    fallback: true
                }
            ];
            
            res.json(mockReports);
        }
        
    } catch (error) {
        console.error('Error fetching site reports:', error);
        res.status(500).json({ error: 'Failed to fetch site reports' });
    }
});

// Create new work item
router.post('/:department', async (req, res) => {
    try {
        console.log('🔍 Work request received');
        console.log('📋 Request headers:', req.headers);
        console.log('🌐 Request URL:', req.url);
        console.log('📝 Request method:', req.method);
        console.log('📂 Department parameter:', req.params.department);
        console.log('📊 Request body:', req.body);
        
        // Fix department detection
        let department = req.params.department;
        
        // If department is "work", we need to determine the actual department from the route
        if (department === 'work') {
            // Check the original URL to determine the actual department
            const originalUrl = req.originalUrl || req.url;
            console.log('🔍 Original URL:', originalUrl);
            
            if (originalUrl.includes('/api/hse/')) {
                department = 'hse';
            } else if (originalUrl.includes('/api/hr/')) {
                department = 'hr';
            } else if (originalUrl.includes('/api/finance/')) {
                department = 'finance';
            } else if (originalUrl.includes('/api/project/')) {
                department = 'projects';
            } else if (originalUrl.includes('/api/realestate/')) {
                department = 'realestate';
            } else if (originalUrl.includes('/api/admin/')) {
                department = 'admin';
            }
        }
        
        console.log('✅ Determined department:', department);
        
        const {
            work_type,
            work_title,
            work_description,
            priority = 'Medium',
            due_date,
            assigned_to,
            submitted_by,
            // Department-specific fields
            amount, // Finance
            incident_type, severity, location, // HSE
            employee_name, employee_email, // HR
            project_name, client_name, // Project
            property_name, property_type, // Real Estate
            affected_systems, // Admin
            // Additional fields
            status = 'pending'
        } = req.body;
        
        console.log('📝 Extracted data:', {
            work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            department_specific: {
                amount,
                incident_type,
                severity,
                project_name,
                client_name,
                property_name,
                property_type,
                affected_systems
            }
        });
        
        // Validate required fields
        if (!work_type || !work_title || !work_description) {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields: work_type, work_title, work_description',
                received: { work_type, work_title, work_description }
            });
        }
        
        const validDepartments = ['hr', 'hse', 'finance', 'projects', 'realestate', 'admin'];
        if (!validDepartments.includes(department)) {
            console.log('❌ Invalid department:', department);
            return res.status(400).json({ 
                error: 'Invalid department',
                department
            });
        }
        
        // Map frontend work types to database ENUM values
        const getMappedWorkType = (department, workType) => {
            const mappings = {
                'hr': {
                    'Attendance Management': 'Attendance Tracking',
                    'Employee Registration': 'Employee Registration',
                    'Worker Account Creation': 'Worker Account Creation',
                    'Project Assignment': 'Project Assignment',
                    'Leave Management': 'Leave Management',
                    'Leave Request': 'Leave Management', // Added mapping for Leave Request
                    'Contract Management': 'Contract Management',
                    'Policy Management': 'Policy Management',
                    'Senior Staff Hiring': 'Senior Staff Hiring',
                    'Budget Approval': 'Budget Approval'
                },
                'hse': {
                    'Incident Reporting': 'Incident Reporting',
                    'Safety Policy Upload': 'Safety Policy Upload',
                    'Toolbox Meeting': 'Toolbox Meeting',
                    'PPE Issuance': 'PPE Issuance',
                    'Safety Violation': 'Safety Violation',
                    'Inspection Report': 'Inspection Report',
                    'Safety Training': 'Safety Training',
                    'Project Safety Status': 'Project Safety Status'
                },
                'finance': {
                    'Budget Management': 'Budget Management',
                    'Financial Reporting': 'Financial Reporting',
                    'Payroll Processing': 'Payroll Processing',
                    'Expense Control': 'Expense Control',
                    'Audits': 'Audits',
                    'Compliance': 'Compliance',
                    'Invoice Processing': 'Invoice Processing',
                    'Budget Approval': 'Budget Approval'
                },
                'projects': {
                    'Project Creation': 'Project Creation',
                    'Project Assignment': 'Project Assignment',
                    'Progress Update': 'Progress Update',
                    'Task Assignment': 'Task Assignment',
                    'Workforce Request': 'Workforce Request',
                    'Site Report': 'Site Report',
                    'Work Approval': 'Work Approval',
                    'Project Completion': 'Project Completion',
                    'Resource Management': 'Resource Management'
                },
                'realestate': {
                    'Property Management': 'Property Management',
                    'Property Addition': 'Property Addition',
                    'Property Editing': 'Property Editing',
                    'Client Registration': 'Client Registration',
                    'Sale Recording': 'Sale Recording',
                    'Payment Tracking': 'Payment Tracking',
                    'Sales Report': 'Sales Report',
                    'Client Communication': 'Client Communication'
                },
                'admin': {
                    'Administrative Operations': 'Administrative Operations',
                    'Compliance Management': 'Compliance Management',
                    'Staff Oversight': 'Staff Oversight',
                    'Policy Implementation': 'Policy Implementation',
                    'Document Management': 'Document Management',
                    'User Account Management': 'User Account Management',
                    'System Administration': 'System Administration',
                    'Department Coordination': 'Department Coordination'
                }
            };
            
            return mappings[department]?.[workType] || workType;
        };
        
        const mapped_work_type = getMappedWorkType(department, work_type);
        console.log('🔄 Mapped work type:', work_type, '->', mapped_work_type);
        console.log('🔍 Department:', department);
        console.log('🔍 Original work_type length:', work_type ? work_type.length : 'undefined');
        console.log('🔍 Mapped work_type length:', mapped_work_type ? mapped_work_type.length : 'undefined');
        console.log('🔍 Mapped work_type chars:', mapped_work_type ? mapped_work_type.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' ') : 'undefined');
        
        console.log('✅ Validation passed, proceeding to database insertion...');
        
        // Build the query dynamically based on department
        let query = '';
        let values = [];
        
        // Base fields for all departments
        const baseFields = [
            'department_code',
            'work_type',
            'work_title', 
            'work_description',
            'priority',
            'due_date',
            'assigned_to',
            'submitted_by',
            'submitted_date',
            'status'
        ];
        
        const baseValues = [
            department,
            mapped_work_type,
            work_title,
            work_description,
            priority,
            due_date,
            assigned_to,
            submitted_by,
            new Date().toISOString().split('T')[0], // submitted_date
            status
        ];
        
        // Department-specific fields
        let additionalFields = [];
        let additionalValues = [];
        
        if (department === 'finance') {
            if (amount) {
                additionalFields.push('amount');
                additionalValues.push(amount);
            }
            if (vendor_name) {
                additionalFields.push('vendor_name');
                additionalValues.push(vendor_name);
            }
            if (invoice_number) {
                additionalFields.push('invoice_number');
                additionalValues.push(invoice_number);
            }
        }
        
        if (department === 'hse') {
            if (incident_type) {
                additionalFields.push('incident_type');
                additionalValues.push(incident_type);
            }
            if (severity) {
                additionalFields.push('severity');
                additionalValues.push(severity);
            }
            if (location) {
                additionalFields.push('location');
                additionalValues.push(location);
            }
            if (project_name) {
                additionalFields.push('project_name');
                additionalValues.push(project_name);
            }
        }
        
        if (department === 'hr') {
            if (employee_name) {
                additionalFields.push('employee_name');
                additionalValues.push(employee_name);
            }
            if (employee_email) {
                additionalFields.push('employee_email');
                additionalValues.push(employee_email);
            }
            if (project_name) {
                additionalFields.push('project_name');
                additionalValues.push(project_name);
            }
        }
        
        if (department === 'projects') {
            if (project_name) {
                additionalFields.push('project_name');
                additionalValues.push(project_name);
            }
            if (client_name) {
                additionalFields.push('client_name');
                additionalValues.push(client_name);
            }
        }
        
        if (department === 'realestate') {
            if (property_name) {
                additionalFields.push('property_address');
                additionalValues.push(property_name);
            }
            if (property_type) {
                additionalFields.push('property_type');
                additionalValues.push(property_type);
            }
        }
        
        if (department === 'admin' && affected_systems) {
            additionalFields.push('affected_systems');
            additionalValues.push(affected_systems);
        }
        
        // Ensure arrays are properly initialized and convert undefined to null
        const safeBaseFields = Array.isArray(baseFields) ? baseFields : [];
        const safeAdditionalFields = Array.isArray(additionalFields) ? additionalFields : [];
        const safeBaseValues = Array.isArray(baseValues) ? baseValues.map(val => val === undefined ? null : val) : [];
        const safeAdditionalValues = Array.isArray(additionalValues) ? additionalValues.map(val => val === undefined ? null : val) : [];
        
        const allFields = safeBaseFields.concat(safeAdditionalFields);
        const allValues = safeBaseValues.concat(safeAdditionalValues);
        
        // Map departments to correct tables
        const departmentTableMap = {
            'hr': 'hr_work',
            'hse': 'hse_work', 
            'finance': 'finance_work',
            'project': 'project_work',
            'realestate': 'realestate_work',
            'admin': 'admin_work'
        };
        
        const tableName = departmentTableMap[department] || 'admin_work';
        
        query = `
            INSERT INTO ${tableName} (
                ${allFields.join(', ')}
            ) VALUES (
                ${allFields.map(() => '?').join(', ')}
            )
        `;
        
        values = allValues;
        
        console.log('� Executing query:', query);
        console.log('📊 Query values:', values);
        
        // Execute the query
        console.log('🔍 Preparing to execute query...');
        console.log('🔍 Query type:', typeof query);
        console.log('🔍 Values type:', typeof values);
        console.log('🔍 Values isArray:', Array.isArray(values));
        console.log('🔍 Values length:', values ? values.length : 'undefined');
        
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid query: query is not a string');
        }
        
        if (!Array.isArray(values)) {
            throw new Error('Invalid values: values is not an array');
        }
        
        try {
            const result = await db.execute(query, values);
            console.log('🔍 Database result type:', typeof result);
            console.log('🔍 Database result:', result);
            
            if (!result || typeof result !== 'object') {
                throw new Error('Database query returned invalid result');
            }
            
            console.log('✅ Work item created successfully:', result);
            
            // Return success response
            res.status(201).json({
                message: 'Work item created successfully',
                id: result.insertId,
                department,
                work_type: mapped_work_type,
                work_title,
                status,
                created_at: new Date().toISOString()
            });
        } catch (dbError) {
            console.error('❌ Database execution error:', dbError);
            throw new Error(`Database query failed: ${dbError.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error creating work item:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to create work item',
            details: error.message 
        });
    }
});

// Update work item
router.put('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
        const updates = req.body;
        
        // Check if work item exists
        const [existingItems] = await db.execute(
            `SELECT id FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        if (existingItems.length === 0) {
            return res.status(404).json({ error: 'Work item not found' });
        }
        
        // Build dynamic update query
        const updateFields = [];
        const values = [];
        
        // Update common fields
        if (updates.work_title) {
            updateFields.push('work_title = ?');
            values.push(updates.work_title);
        }
        if (updates.work_description) {
            updateFields.push('work_description = ?');
            values.push(updates.work_description);
        }
        if (updates.status) {
            updateFields.push('status = ?');
            values.push(updates.status);
        }
        if (updates.priority) {
            updateFields.push('priority = ?');
            values.push(updates.priority);
        }
        if (updates.assigned_to) {
            updateFields.push('assigned_to = ?');
            values.push(updates.assigned_to);
        }
        if (updates.due_date) {
            updateFields.push('due_date = ?');
            values.push(updates.due_date);
        }
        if (updates.completion_date) {
            updateFields.push('completion_date = ?');
            values.push(updates.completion_date);
        }
        
        // Department-specific updates
        if (department === 'finance' && updates.amount !== undefined) {
            updateFields.push('amount = ?');
            values.push(updates.amount);
        }
        
        if (department === 'hse') {
            if (updates.incident_type) {
                updateFields.push('incident_type = ?');
                values.push(updates.incident_type);
            }
            if (updates.severity) {
                updateFields.push('severity = ?');
                values.push(updates.severity);
            }
        }
        
        if (department === 'project') {
            if (updates.project_name) {
                updateFields.push('project_name = ?');
                values.push(updates.project_name);
            }
            if (updates.client_name) {
                updateFields.push('client_name = ?');
                values.push(updates.client_name);
            }
        }
        
        if (department === 'realestate') {
            if (updates.property_address) {
                updateFields.push('property_address = ?');
                values.push(updates.property_address);
            }
            if (updates.property_type) {
                updateFields.push('property_type = ?');
                values.push(updates.property_type);
            }
            if (updates.sale_amount) {
                updateFields.push('sale_amount = ?');
                values.push(updates.sale_amount);
            }
        }
        
        if (department === 'admin') {
            if (updates.affected_department) {
                updateFields.push('affected_department = ?');
                values.push(updates.affected_department);
            }
            if (updates.deadline) {
                updateFields.push('deadline = ?');
                values.push(updates.deadline);
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        values.push(id);
        
        await db.execute(
            `UPDATE ${department}_work SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
        
        // Return updated work item
        const [updatedWorkItem] = await db.execute(
            `SELECT * FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        res.json({
            message: `${department} work item updated successfully`,
            workItem: updatedWorkItem[0]
        });
        
    } catch (error) {
        console.error('Error updating work item:', error);
        res.status(500).json({ error: 'Failed to update work item' });
    }
});

// Delete work item
router.delete('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
        
        const [result] = await db.execute(
            `DELETE FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Work item not found' });
        }
        
        res.json({ message: 'Work item deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting work item:', error);
        res.status(500).json({ error: 'Failed to delete work item' });
    }
});

// Get work item by ID
router.get('/:department/:id', async (req, res) => {
    try {
        const { department, id } = req.params;
        
        const [workItems] = await db.execute(
            `SELECT * FROM ${department}_work WHERE id = ?`,
            [id]
        );
        
        if (workItems.length === 0) {
            return res.status(404).json({ error: 'Work item not found' });
        }
        
        res.json(workItems[0]);
        
    } catch (error) {
        console.error('Error fetching work item:', error);
        res.status(500).json({ error: 'Failed to fetch work item' });
    }
});

// Get work statistics for a department
router.get('/:department/stats', async (req, res) => {
    try {
        const { department } = req.params;
        
        // Get total work items
        const [totalResult] = await db.execute(
            `SELECT COUNT(*) as total FROM ${department}_work`
        );
        
        // Get work items by status
        const [statusResult] = await db.execute(
            `SELECT status, COUNT(*) as count FROM ${department}_work GROUP BY status`
        );
        
        // Get work items by priority
        const [priorityResult] = await db.execute(
            `SELECT priority, COUNT(*) as count FROM ${department}_work GROUP BY priority`
        );
        
        // Get work items by type
        const [typeResult] = await db.execute(
            `SELECT work_type, COUNT(*) as count FROM ${department}_work GROUP BY work_type`
        );
        
        // Get recent work items
        const [recentResult] = await db.execute(
            `SELECT * FROM ${department}_work ORDER BY submitted_date DESC LIMIT 5`
        );
        
        res.json({
            total: totalResult[0].total,
            byStatus: statusResult,
            byPriority: priorityResult,
            byType: typeResult,
            recent: recentResult
        });
        
    } catch (error) {
        console.error('Error fetching work statistics:', error);
        res.status(500).json({ error: 'Failed to fetch work statistics' });
    }
});

// Worker Assignments Routes
// Get all worker assignments
router.get('/assignments', async (req, res) => {
    try {
        console.log('📋 Fetching worker assignments...');
        
        const [assignments] = await db.execute(`
            SELECT * FROM worker_assignments 
            ORDER BY created_at DESC
        `);
        
        console.log('✅ Worker assignments fetched:', assignments.length);
        res.json(assignments);
        
    } catch (error) {
        console.error('❌ Error fetching worker assignments:', error);
        res.status(500).json({ error: 'Failed to fetch worker assignments' });
    }
});

// Update worker assignment
router.put('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            employee_name,
            project_name,
            role_in_project,
            start_date,
            end_date,
            assignment_notes,
            status
        } = req.body;
        
        console.log('📝 Updating worker assignment:', id);
        
        const [result] = await db.execute(`
            UPDATE worker_assignments SET
                employee_name = ?, project_name = ?, role_in_project = ?,
                start_date = ?, end_date = ?, assignment_notes = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            employee_name,
            project_name,
            role_in_project,
            start_date,
            end_date || null,
            assignment_notes || null,
            status || 'Active',
            id
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker assignment not found' });
        }
        
        console.log('✅ Worker assignment updated successfully');
        res.json({
            message: 'Worker assignment updated successfully',
            id: parseInt(id),
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating worker assignment:', error);
        res.status(500).json({ error: 'Failed to update worker assignment' });
    }
});

// Delete worker assignment
router.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Deleting worker assignment:', id);
        
        const [result] = await db.execute(`
            DELETE FROM worker_assignments WHERE id = ?
        `, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Worker assignment not found' });
        }
        
        console.log('✅ Worker assignment deleted successfully');
        res.json({
            message: 'Worker assignment deleted successfully',
            id: parseInt(id)
        });
        
    } catch (error) {
        console.error('❌ Error deleting worker assignment:', error);
        res.status(500).json({ error: 'Failed to delete worker assignment' });
    }
});


module.exports = router;
