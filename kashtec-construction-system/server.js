const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const path = require('path');

const fs = require('fs');

require('dotenv').config();



// Global error protection

process.on('uncaughtException', err => {

  console.error('❌ Uncaught Exception:', err);

});



process.on('unhandledRejection', err => {

  console.error('❌ Unhandled Rejection:', err);

});



// Import environment configuration

const config = require('./config/environment');



// Import routes

const authRoutes = require('./backend/routes/auth');

const employeeRoutes = require('./backend/routes/employees');

const projectRoutes = require('./backend/routes/projects');

const documentRoutes = require('./backend/routes/documents');

const notificationRoutes = require('./backend/routes/notifications');

const apiRoutes = require('./backend/routes/api');

const policyRoutes = require('./backend/routes/policies');

const seniorHiringRoutes = require('./backend/routes/seniorHiring');

const workforceBudgetRoutes = require('./backend/routes/workforceBudget');

const workRoutes = require('./backend/routes/work');

const scheduleMeetingsRoutes = require('./backend/routes/scheduleMeetings');

const workerAccountRoutes = require('./backend/routes/workerAccounts');



const app = express();

const PORT = config.PORT;



// Trust proxy for Railway deployment

app.set('trust proxy', 1);



// Security middleware

app.use(helmet({

    contentSecurityPolicy: {

        directives: {

            defaultSrc: ["'self'"],

            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

            fontSrc: ["'self'", "https://fonts.gstatic.com"],

            imgSrc: ["'self'", "data:", "https://picsum.photos"],

            scriptSrc: ["'self'", "'unsafe-inline'"],

            connectSrc: ["'self'"]

        }

    }

}));



// Rate limiting

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 100, // limit each IP to 100 requests per windowMs

    message: 'Too many requests from this IP, please try again later.',

    trustProxy: true,

    standardHeaders: true,

    legacyHeaders: false,

});

app.use('/api/', limiter);



// CORS configuration with CSP headers

app.use(cors({

    origin: config.CORS_ORIGIN,

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization']

}));



// CSP headers to allow inline scripts and API calls

app.use((req, res, next) => {

    res.setHeader('Content-Security-Policy', 

        "default-src 'self'; " +

        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +

        "script-src-attr 'unsafe-inline'; " +

        "style-src 'self' 'unsafe-inline'; " +

        "img-src 'self' data: https:; " +

        "font-src 'self'; " +

        "connect-src 'self' ws: wss: https:;"

    );

    next();

});



// Body parsing middleware

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Static files with proper MIME types

app.use(express.static(path.join(__dirname, 'frontend/public'), {

    setHeaders: (res, path) => {

        if (path.endsWith('.js')) {

            res.setHeader('Content-Type', 'application/javascript');

        } else if (path.endsWith('.css')) {

            res.setHeader('Content-Type', 'text/css');

        } else if (path.endsWith('.html')) {

            res.setHeader('Content-Type', 'text/html');

        }

    }

}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Ensure uploads directory exists

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {

    fs.mkdirSync(uploadsDir, { recursive: true });

}



// Root route - serve main frontend page

app.get('/', (req, res) => {

    console.log('🏠 Root route accessed, serving department.html');

    const departmentPath = path.join(__dirname, 'frontend/public/department.html');

    console.log('📁 Department path:', departmentPath);

    

    // Check if file exists

    if (require('fs').existsSync(departmentPath)) {

        res.sendFile(departmentPath);

    } else {

        console.error('❌ department.html not found at:', departmentPath);

        res.status(404).send('Frontend not found - department.html missing');

    }

});



// Simple health check endpoint for Railway (no database dependency)

app.get('/api/health', (req, res) => {

    res.status(200).json({

        status: 'OK',

        timestamp: new Date().toISOString(),

        environment: process.env.NODE_ENV,

        port: PORT,

        uptime: process.uptime(),

        version: process.env.npm_package_version || '1.0.0',

        memory: {

            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,

            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100

        }

    });

});



// Root health check for Railway - minimal response

app.get('/health', (req, res) => {

    res.status(200).send('OK');

});



// Debug route to check database tables

app.get('/debug/db', async (req, res) => {

  try {

    const db = require('./database/config/database');

    const [rows] = await db.execute('SHOW TABLES');

    console.log('🔍 DEBUG - Tables found:', rows);

    console.log('🔍 DEBUG - Type:', typeof rows);

    console.log('🔍 DEBUG - Is array?', Array.isArray(rows));

    res.json({

      success: true,

      tableCount: rows.length,

      tables: Array.isArray(rows) ? rows.map(table => Object.values(table)[0]) : [],

      raw: rows

    });

  } catch (err) {

    console.error('🔥 DEBUG ERROR:', err);

    res.status(500).json({ error: err.message });

  }

});



// Safe debug route

app.get('/debug/tables', async (req, res) => {

  try {

    const db = require('./database/config/database');

    const [rows] = await db.execute('SHOW TABLES');

    console.log("📊 Tables:", rows);

    res.json(rows);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});



// Simple ping endpoint for Railway

app.get('/ping', (req, res) => {

    res.status(200).send('pong');

});



// Comprehensive API status endpoint

app.get('/api/status', async (req, res) => {

    try {

        console.log('🔍 API status check requested');

        

        // Check database connection

        let dbStatus = 'disconnected';

        let dbError = null;

        let tables = [];

        

        try {

            const db = require('./database/config/database');

            await db.execute('SELECT 1');

            dbStatus = 'connected';

            

            // Get table list

            const [tableRows] = await db.execute('SHOW TABLES');

            tables = Array.from(tableRows).map(table => Object.values(table)[0]);

            console.log('✅ Database connected, tables:', tables);

        } catch (error) {

            dbError = error.message;

            console.error('❌ Database connection failed:', error);

        }

        

        // Check authentication table specifically

        let authTableStatus = 'not_found';

        if (tables.includes('authentication')) {

            try {

                const db = require('./database/config/database');

                const [authRows] = await db.execute('SELECT COUNT(*) as count FROM authentication');

                authTableStatus = `exists (${authRows[0].count} records)`;

            } catch (error) {

                authTableStatus = 'error';

                console.error('❌ Authentication table check failed:', error);

            }

        }

        

        const status = {

            success: true,

            timestamp: new Date().toISOString(),

            server: {

                status: 'running',

                uptime: process.uptime(),

                memory: process.memoryUsage(),

                node_version: process.version,

                environment: process.env.NODE_ENV || 'development'

            },

            database: {

                status: dbStatus,

                error: dbError,

                tables: tables,

                table_count: tables.length,

                authentication_table: authTableStatus

            },

            api: {

                auth_endpoint: '/api/auth - working',

                test_endpoint: '/api/auth/test - available',

                status_endpoint: '/api/status - working',

                tables_endpoint: '/api/tables - available'

            },

            routes: {

                auth: 'mounted',

                employees: 'mounted',

                projects: 'mounted',

                documents: 'mounted',

                notifications: 'mounted'

            }

        };

        

        console.log('✅ API status check completed');

        res.status(200).json(status);

        

    } catch (error) {

        console.error('❌ API status check failed:', error);

        res.status(500).json({

            success: false,

            error: error.message,

            timestamp: new Date().toISOString()

        });

    }

});



// Table verification endpoint

app.get('/api/tables', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const [rows] = await db.execute('SHOW TABLES');

        console.log('📊 Raw table rows from API:', rows);

        const tableNames = Array.from(rows).map(table => Object.values(table)[0]);

        res.status(200).json({

            success: true,

            tables: tableNames,

            count: rows.length,

            raw: rows

        });

    } catch (error) {

        console.error('❌ Table verification error:', error);

        res.status(500).json({

            success: false,

            error: error.message

        });

    }

});



// Global error handler for async functions

const asyncHandler = (fn) => (req, res, next) => {

    Promise.resolve(fn(req, res, next)).catch(next);

};



// API Routes with consistent error handling

app.use('/api/auth', asyncHandler(async (req, res, next) => {

    return authRoutes(req, res, next);

}));



app.use('/api/employees', asyncHandler(async (req, res, next) => {

    return employeeRoutes(req, res, next);

}));



app.use('/api/worker-accounts', asyncHandler(async (req, res, next) => {

    return workerAccountRoutes(req, res, next);

}));



app.use('/api/projects', asyncHandler(async (req, res, next) => {

    return projectRoutes(req, res, next);

}));



app.use('/api/documents', asyncHandler(async (req, res, next) => {

    return documentRoutes(req, res, next);

}));



app.use('/api/notifications', asyncHandler(async (req, res, next) => {

    return notificationRoutes(req, res, next);

}));



app.use('/api/policies', asyncHandler(async (req, res, next) => {

    return policyRoutes(req, res, next);

}));



// Import authentication middleware

const { authenticateToken } = require('./backend/src/middleware/auth');



// Mount department-specific routes to their correct handlers

app.use('/api/hr', authenticateToken, asyncHandler(async (req, res, next) => {

    return employeeRoutes(req, res, next); // Use employeeRoutes for HR department

}));



app.use('/api/hr/work', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for HR work items

}));



app.use('/api/finance', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for Finance department

}));



app.use('/api/hse', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for HSE department

}));



app.use('/api/project/work', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for Project department

}));



app.use('/api/project', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for Project department

}));



app.use('/api/realestate', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for Real Estate department

}));



app.use('/api/admin', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next); // Use workRoutes for Admin department

}));



app.use('/api/senior-hiring', asyncHandler(async (req, res, next) => {

    return seniorHiringRoutes(req, res, next);

}));



app.use('/api/workforce-budget', asyncHandler(async (req, res, next) => {

    return workforceBudgetRoutes(req, res, next);

}));



app.use('/api/work', authenticateToken, asyncHandler(async (req, res, next) => {

    return workRoutes(req, res, next);

}));



app.use('/api/meetings', authenticateToken, asyncHandler(async (req, res, next) => {

    return scheduleMeetingsRoutes(req, res, next);

}));



app.use('/api', asyncHandler(async (req, res, next) => {

    return apiRoutes(req, res, next);

}));



// Simple API health check

app.get('/api/health', (req, res) => {

    res.status(200).json({

        status: 'OK',

        message: 'API is running',

        timestamp: new Date().toISOString(),

        environment: process.env.NODE_ENV || 'development'

    });

});



// Simple test endpoint to verify API is working

app.get('/api/test', (req, res) => {

    res.status(200).json({

        message: 'API test endpoint working',

        timestamp: new Date().toISOString(),

        method: req.method,

        url: req.url,

        headers: req.headers

    });

});



// Test POST endpoint

app.post('/api/test', (req, res) => {

    res.status(200).json({

        message: 'API POST test endpoint working',

        timestamp: new Date().toISOString(),

        method: req.method,

        body: req.body,

        headers: req.headers

    });

});



// Site Reports API endpoints

app.post('/api/site-reports', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

            projectId,

            reportDate,

            weatherConditions,

            siteSupervisor,

            workersPresent,

            workCompleted,

            siteIssues,

            safetyIncidents,

            materialsUsed,

            equipmentUsed,

            nextDayPlan

        } = req.body;



        // Validate required fields

        if (!projectId || !reportDate || !weatherConditions || !siteSupervisor || 

            !workersPresent || !workCompleted || !nextDayPlan) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert site report

        const [result] = await db.execute(`

            INSERT INTO site_reports (

                project_id, report_date, weather_conditions, site_supervisor,

                workers_present, work_completed, site_issues, safety_incidents,

                materials_used, equipment_used, next_day_plan, status, created_by

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)

        `, [

            projectId, reportDate, weatherConditions, siteSupervisor,

            workersPresent, workCompleted, siteIssues, safetyIncidents,

            materialsUsed, equipmentUsed, nextDayPlan, siteSupervisor

        ]);



        res.status(201).json({

            success: true,

            message: 'Site report submitted successfully',

            reportId: result.insertId

        });



    } catch (error) {

        console.error('Error submitting site report:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to submit site report',

            error: error.message

        });

    }

});



app.get('/api/site-reports', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { projectId } = req.query;



        let query = `

            SELECT sr.*, p.name as project_name 

            FROM site_reports sr 

            LEFT JOIN projects p ON sr.project_id = p.id

            ORDER BY sr.report_date DESC

        `;

        let params = [];



        if (projectId) {

            query += ` WHERE sr.project_id = ?`;

            params = [projectId];

        }



        const [reports] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            reports: reports

        });



    } catch (error) {

        console.error('Error fetching site reports:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch site reports',

            error: error.message

        });

    }

});



app.get('/api/site-reports/:id', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const reportId = req.params.id;



        const [reports] = await db.execute(`

            SELECT sr.*, p.name as project_name 

            FROM site_reports sr 

            LEFT JOIN projects p ON sr.project_id = p.id

            WHERE sr.id = ?

        `, [reportId]);



        if (reports.length === 0) {

            return res.status(404).json({

                success: false,

                message: 'Site report not found'

            });

        }



        res.status(200).json({

            success: true,

            report: reports[0]

        });



    } catch (error) {

        console.error('Error fetching site report:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch site report',

            error: error.message

        });

    }

});



// Projects API endpoints

app.post('/api/projects', async (req, res) => {

    try {

        console.log('Project creation endpoint called');

        console.log('Request body:', req.body);

        

        const db = require('./database/config/database');

        const {

            projectName,

            projectCode,

            clientName,

            projectType,

            projectStartDate,

            projectEndDate,

            contractValue,

            projectManager,

            projectDescription,

            keyDeliverables,

            siteLocation,

            priorityLevel

        } = req.body;



        console.log('Extracted fields:', {

            projectName, projectCode, clientName, projectType, projectStartDate, 

            projectEndDate, contractValue, projectManager, projectDescription, 

            keyDeliverables, siteLocation, priorityLevel

        });



        // Validate required fields

        if (!projectName || !projectCode || !clientName || !projectType || 

            !projectStartDate || !projectEndDate || !contractValue || 

            !projectManager || !projectDescription || !siteLocation || !priorityLevel) {

            console.log('Project validation failed - missing fields:', {

                projectName: !!projectName,

                projectCode: !!projectCode,

                clientName: !!clientName,

                projectType: !!projectType,

                projectStartDate: !!projectStartDate,

                projectEndDate: !!projectEndDate,

                contractValue: !!contractValue,

                projectManager: !!projectManager,

                projectDescription: !!projectDescription,

                siteLocation: !!siteLocation,

                priorityLevel: !!priorityLevel

            });

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Generate project ID

        const projectId = 'PRJ' + Date.now();



        // Insert project

        const [result] = await db.execute(`

            INSERT INTO projects (

                id, name, description, location, start_date, end_date,

                status, budget, manager_id, client_name, project_code,

                project_type, contract_value, key_deliverables, priority_level,

                created_at, updated_at

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())

        `, [

            projectId, projectName, projectDescription, siteLocation,

            projectStartDate, projectEndDate, 'Planning', contractValue,

            projectManager, clientName, projectCode, projectType,

            contractValue, keyDeliverables, priorityLevel

        ]);



        res.status(201).json({

            success: true,

            message: 'Project created successfully',

            projectId: projectId

        });



    } catch (error) {

        console.error('Error creating project:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to create project',

            error: error.message

        });

    }

});



app.get('/api/projects', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const [projects] = await db.execute(`

            SELECT id, name, description, location, start_date, end_date,

                   status, budget, client_name, project_code, project_type,

                   contract_value, priority_level, created_at, updated_at

            FROM projects 

            ORDER BY created_at DESC

        `);



        res.status(200).json({

            success: true,

            projects: projects

        });



    } catch (error) {

        console.error('Error fetching projects:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch projects',

            error: error.message

        });

    }

});



// Worker Assignments API endpoints

app.post('/api/work/assignments', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

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

        } = req.body;



        // Validate required fields

        if (!employee_id || !project_id || !role_in_project || !start_date) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert worker assignment

        const [result] = await db.execute(`

            INSERT INTO worker_assignments (

                employee_id, 

                employee_name, 

                project_id, 

                project_name, 

                role_in_project, 

                start_date, 

                end_date, 

                assignment_notes, 

                assigned_by,

                assigned_by_role,

                created_at

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())

        `, [

            employee_id, employee_name, project_id, project_name, role_in_project,

            start_date, end_date, assignment_notes, assigned_by, assigned_by_role

        ]);



        res.status(201).json({

            success: true,

            message: 'Worker assignment created successfully',

            assignmentId: result.insertId

        });



    } catch (error) {

        console.error('Error creating worker assignment:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to create worker assignment',

            error: error.message

        });

    }

});



app.get('/api/work/assignments', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { projectId, employeeId } = req.query;



        let query = `

            SELECT * FROM worker_assignments 

            WHERE 1=1

        `;

        let params = [];



        if (projectId) {

            query += ` AND project_id = ?`;

            params.push(projectId);

        }



        if (employeeId) {

            query += ` AND employee_id = ?`;

            params.push(employeeId);

        }



        query += ` ORDER BY created_at DESC`;



        const [assignments] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            assignments: assignments

        });



    } catch (error) {

        console.error('Error fetching worker assignments:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch worker assignments',

            error: error.message

        });

    }

});



// Task Assignments API endpoints

app.post('/api/task-assignments', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

            projectId,

            taskName,

            assignedTo,

            taskPriority,

            taskStartDate,

            taskDueDate,

            taskDescription,

            estimatedHours,

            requiredSkills,

            taskMaterials

        } = req.body;



        // Validate required fields

        if (!projectId || !taskName || !assignedTo || !taskPriority || 

            !taskStartDate || !taskDueDate || !taskDescription) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert task assignment

        const [result] = await db.execute(`

            INSERT INTO task_assignments (

                project_id, task_name, assigned_to, task_priority,

                start_date, due_date, task_description, estimated_hours,

                required_skills, materials_equipment, created_by

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `, [

            projectId, taskName, assignedTo, taskPriority,

            taskStartDate, taskDueDate, taskDescription, estimatedHours,

            requiredSkills, taskMaterials, assignedTo

        ]);



        res.status(201).json({

            success: true,

            message: 'Task assigned successfully',

            taskId: result.insertId

        });



    } catch (error) {

        console.error('Error assigning task:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to assign task',

            error: error.message

        });

    }

});



app.get('/api/task-assignments', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { projectId } = req.query;



        let query = `

            SELECT ta.*, p.name as project_name 

            FROM task_assignments ta 

            LEFT JOIN projects p ON ta.project_id = p.id

            ORDER BY ta.due_date ASC

        `;

        let params = [];



        if (projectId) {

            query += ` WHERE ta.project_id = ?`;

            params = [projectId];

        }



        const [tasks] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            tasks: tasks

        });



    } catch (error) {

        console.error('Error fetching task assignments:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch task assignments',

            error: error.message

        });

    }

});



// Workforce Requests API endpoints

app.post('/api/workforce-requests', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

            projectId,

            requestType,

            workersNeeded,

            workDuration,

            jobCategories,

            workforceJustification,

            workforceStartDate,

            workforceEndDate,

            specialRequirements

        } = req.body;



        // Validate required fields

        if (!projectId || !requestType || !workersNeeded || !workDuration || 

            !jobCategories || !workforceJustification || !workforceStartDate) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert workforce request

        const [result] = await db.execute(`

            INSERT INTO workforce_requests (

                project_id, request_type, workers_needed, duration,

                job_categories, justification, start_date, end_date,

                special_requirements, requested_by

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `, [

            projectId, requestType, workersNeeded, workDuration,

            jobCategories, workforceJustification, workforceStartDate,

            workforceEndDate, specialRequirements, 'Current User'

        ]);



        res.status(201).json({

            success: true,

            message: 'Workforce request submitted successfully',

            requestId: result.insertId

        });



    } catch (error) {

        console.error('Error submitting workforce request:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to submit workforce request',

            error: error.message

        });

    }

});



app.get('/api/workforce-requests', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { projectId } = req.query;



        let query = `

            SELECT wr.*, p.name as project_name 

            FROM workforce_requests wr 

            LEFT JOIN projects p ON wr.project_id = p.id

            ORDER BY wr.created_at DESC

        `;

        let params = [];



        if (projectId) {

            query += ` WHERE wr.project_id = ?`;

            params = [projectId];

        }



        const [requests] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            requests: requests

        });



    } catch (error) {

        console.error('Error fetching workforce requests:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch workforce requests',

            error: error.message

        });

    }

});



// Work Approvals API endpoints

app.post('/api/work-approvals', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

            workId,

            projectId,

            completedBy,

            completionDate,

            qualityAssessment,

            complianceCheck,

            approvalComments,

            safetyCompliance,

            timeCompletion,

            qualityScore

        } = req.body;



        // Validate required fields

        if (!workId || !projectId || !completedBy || !completionDate || 

            !qualityAssessment || !complianceCheck || !approvalComments) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert work approval

        const [result] = await db.execute(`

            INSERT INTO work_approvals (

                work_id, project_id, completed_by, completion_date,

                quality_assessment, compliance_check, approval_comments,

                safety_compliance, time_completion, quality_score, approved_by

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `, [

            workId, projectId, completedBy, completionDate,

            qualityAssessment, complianceCheck, approvalComments,

            safetyCompliance, timeCompletion, qualityScore, 'Current User'

        ]);



        res.status(201).json({

            success: true,

            message: 'Work approval submitted successfully',

            approvalId: result.insertId

        });



    } catch (error) {

        console.error('Error submitting work approval:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to submit work approval',

            error: error.message

        });

    }

});



app.get('/api/work-approvals', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { projectId } = req.query;



        let query = `

            SELECT wa.*, p.name as project_name 

            FROM work_approvals wa 

            LEFT JOIN projects p ON wa.project_id = p.id

            ORDER BY wa.created_at DESC

        `;

        let params = [];



        if (projectId) {

            query += ` WHERE wa.project_id = ?`;

            params = [projectId];

        }



        const [approvals] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            approvals: approvals

        });



    } catch (error) {

        console.error('Error fetching work approvals:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch work approvals',

            error: error.message

        });

    }

});



// Project Progress Updates API endpoints

app.post('/api/project-progress-updates', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

            projectId,

            progressPercentage,

            status,

            progressReport,

            completedMilestones,

            nextMilestones,

            budgetUsed,

            issues

        } = req.body;



        // Validate required fields

        if (!projectId || !progressPercentage || !status) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert progress update

        const [result] = await db.execute(`

            INSERT INTO project_progress_updates (

                project_id, progress_percentage, status, progress_report,

                completed_milestones, next_milestones, budget_used, issues, updated_by

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

        `, [

            projectId, progressPercentage, status, progressReport,

            completedMilestones, nextMilestones, budgetUsed, issues, 'Current User'

        ]);



        res.status(201).json({

            success: true,

            message: 'Progress update saved successfully',

            updateId: result.insertId

        });



    } catch (error) {

        console.error('Error saving progress update:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to save progress update',

            error: error.message

        });

    }

});



app.get('/api/project-progress-updates', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { projectId } = req.query;



        let query = `

            SELECT ppu.*, p.name as project_name 

            FROM project_progress_updates ppu 

            LEFT JOIN projects p ON ppu.project_id = p.id

            ORDER BY ppu.update_date DESC

        `;

        let params = [];



        if (projectId) {

            query += ` WHERE ppu.project_id = ?`;

            params = [projectId];

        }



        const [updates] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            updates: updates

        });



    } catch (error) {

        console.error('Error fetching progress updates:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch progress updates',

            error: error.message

        });

    }

});



// Meeting Minutes API endpoints

app.post('/api/meeting-minutes', async (req, res) => {

    try {

        console.log('🔍 Meeting minutes endpoint called');

        console.log('📝 Request body:', req.body);

        

        const db = require('./database/config/database');

        

        // First, let's check if table exists and has the right columns

        const [tableInfo] = await db.execute(`

            DESCRIBE meeting_minutes

        `);

        console.log('📊 Meeting minutes table structure:', tableInfo);

        

        const {

            meeting_title,

            meeting_type,

            meeting_date,

            meeting_time,

            attendees,

            meeting_agenda,

            meeting_notes,

            action_items,

            next_meeting_date,

            next_meeting_time,

            recorded_by

        } = req.body;



        console.log('🔍 Extracted fields - meeting_title:', meeting_title, 'meeting_type:', meeting_type);



        // Validate required fields

        if (!meeting_title || !meeting_type || !meeting_date || !meeting_time || !attendees) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Generate meeting minutes ID

        const minutesId = 'MIN' + Date.now();



        // Insert meeting minutes

        const [result] = await db.execute(`

            INSERT INTO meeting_minutes (

                meeting_id, meeting_title, meeting_date, meeting_type, location,

                organizing_department, attendees, minutes_content, action_items,

                decisions_made, next_steps, follow_up_date, status, prepared_by,

                reviewed_by, approved_by

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `, [

            1, // Default meeting_id (should reference an actual meeting)

            req.body.meeting_title || '', 

            req.body.meeting_date || '', 

            req.body.meeting_type || '',

            'Conference Room', // Default location

            'management', // Default organizing department

            req.body.attendees || '',

            req.body.meeting_notes || '', // Use meeting_notes as minutes_content

            req.body.action_items || null,

            req.body.decisions_made || null,

            req.body.next_steps || null,

            req.body.next_meeting_date || null,

            'Draft', // Default status

            req.body.recorded_by || 'Admin Assistant',

            null, // reviewed_by

            null  // approved_by

        ]);



        res.status(201).json({

            success: true,

            message: 'Meeting minutes saved successfully',

            minutesId: minutesId

        });



    } catch (error) {

        console.error('Error saving meeting minutes:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to save meeting minutes',

            error: error.message

        });

    }

});



app.get('/api/meeting-minutes', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const [minutes] = await db.execute(`

            SELECT * FROM meeting_minutes 

            ORDER BY meeting_date DESC, meeting_time DESC

        `);



        res.status(200).json({

            success: true,

            minutes: minutes

        });



    } catch (error) {

        console.error('Error fetching meeting minutes:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch meeting minutes',

            error: error.message

        });

    }

});



// Admin Work Documents API endpoints

app.get('/api/admin-work', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const [documents] = await db.execute(`

            SELECT * FROM admin_work 

            ORDER BY created_at DESC

        `);



        res.status(200).json({

            success: true,

            documents: documents

        });



    } catch (error) {

        console.error('Error fetching admin work documents:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch admin work documents',

            error: error.message

        });

    }

});



// Attendance API endpoints

app.post('/api/attendance', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const {

            employee_id,

            attendance_date,

            check_in_time,

            check_out_time,

            attendance_status,

            notes,

            marked_by,

            marked_by_role

        } = req.body;



        // Validate required fields

        if (!employee_id || !attendance_date || !attendance_status) {

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Insert attendance record

        const [result] = await db.execute(`

            INSERT INTO attendance (

                employee_id, employee_name, attendance_date, check_in_time, check_out_time,

                attendance_status, notes, marked_by, marked_by_role, created_at

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())

        `, [

            employee_id, req.body.employee_name || '', attendance_date, check_in_time, check_out_time,

            attendance_status, notes, marked_by, marked_by_role

        ]);



        res.status(201).json({

            success: true,

            message: 'Attendance recorded successfully',

            attendanceId: result.insertId

        });



    } catch (error) {

        console.error('Error recording attendance:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to record attendance',

            error: error.message

        });

    }

});



app.get('/api/attendance', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { employeeId, dateFrom, dateTo } = req.query;



        let query = `

            SELECT a.*, e.full_name as employee_name, e.department 

            FROM attendance a 

            LEFT JOIN employees e ON a.employee_id = e.employee_id

            WHERE 1=1

        `;

        let params = [];



        if (employeeId) {

            query += ` AND a.employee_id = ?`;

            params.push(employeeId);

        }



        if (dateFrom) {

            query += ` AND a.attendance_date >= ?`;

            params.push(dateFrom);

        }



        if (dateTo) {

            query += ` AND a.attendance_date <= ?`;

            params.push(dateTo);

        }



        query += ` ORDER BY a.attendance_date DESC`;



        const [attendance] = await db.execute(query, params);



        res.status(200).json({

            success: true,

            attendance: attendance

        });



    } catch (error) {

        console.error('Error fetching attendance:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch attendance',

            error: error.message

        });

    }

});



// Policy Management API endpoints

app.post('/api/policies/:policyId/approve', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { policyId } = req.params;

        const { approvedBy, comments } = req.body;



        // Update policy status to approved

        const [result] = await db.execute(`

            UPDATE company_policies 

            SET status = 'approved', approved_by = ?, approved_date = NOW(), 

                approval_comments = ?

            WHERE policy_id = ?

        `, [approvedBy, comments, policyId]);



        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: 'Policy not found'

            });

        }



        res.status(200).json({

            success: true,

            message: 'Policy approved successfully'

        });



    } catch (error) {

        console.error('Error approving policy:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to approve policy',

            error: error.message

        });

    }

});



app.post('/api/policies/:policyId/reject', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { policyId } = req.params;

        const { rejectedBy, rejectionReason, details } = req.body;



        // Update policy status to rejected

        const [result] = await db.execute(`

            UPDATE company_policies 

            SET status = 'rejected', rejected_by = ?, rejected_date = NOW(), 

                rejection_reason = ?, rejection_details = ?

            WHERE policy_id = ?

        `, [rejectedBy, rejectionReason, details, policyId]);



        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: 'Policy not found'

            });

        }



        res.status(200).json({

            success: true,

            message: 'Policy rejected successfully'

        });



    } catch (error) {

        console.error('Error rejecting policy:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to reject policy',

            error: error.message

        });

    }

});



app.post('/api/policies/:policyId/revision', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const { policyId } = req.params;

        const { requestedBy, revisionRequest, deadline } = req.body;



        // Update policy status to revision requested

        const [result] = await db.execute(`

            UPDATE company_policies 

            SET status = 'revision_requested', revision_requested_by = ?, 

                revision_request = ?, revision_deadline = ?, 

                revision_requested_date = NOW()

            WHERE policy_id = ?

        `, [requestedBy, revisionRequest, deadline, policyId]);



        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message: 'Policy not found'

            });

        }



        res.status(200).json({

            success: true,

            message: 'Policy revision requested successfully'

        });



    } catch (error) {

        console.error('Error requesting policy revision:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to request policy revision',

            error: error.message

        });

    }

});



























// Properties API endpoints

app.post('/api/properties', async (req, res) => {

    try {

        console.log('Properties endpoint called');

        console.log('Request body:', req.body);

        

        const db = require('./database/config/database');

        const {

            propertyName,

            propertyType,

            location,

            size,

            value,

            description,

            status,

            owner,

            contactInfo

        } = req.body;



        console.log('Extracted fields:', {

            propertyName, propertyType, location, size, value, description, status, owner, contactInfo

        });



        // Validate required fields

        if (!propertyName || !propertyType || !location || !size || !value) {

            console.log('Validation failed - missing fields:', {

                propertyName: !!propertyName,

                propertyType: !!propertyType,

                location: !!location,

                size: !!size,

                value: !!value

            });

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }



        // Generate property ID

        const propertyId = 'PROP' + Date.now();



        // Convert and validate numeric values

        const parsedPrice = parseFloat(value);

        const parsedSize = parseFloat(size);

        

        console.log('Parsed values:', {

            originalValue: value,

            parsedPrice: parsedPrice,

            originalSize: size,

            parsedSize: parsedSize,

            isNaNPrice: isNaN(parsedPrice),

            isNaNSize: isNaN(parsedSize)

        });

        

        // Validate numeric values

        if (isNaN(parsedPrice) || parsedPrice <= 0) {

            console.log('Invalid price value:', value);

            return res.status(400).json({

                success: false,

                message: 'Invalid price value'

            });

        }

        

        if (isNaN(parsedSize) || parsedSize <= 0) {

            console.log('Invalid size value:', size);

            return res.status(400).json({

                success: false,

                message: 'Invalid size value'

            });

        }



        // Insert property

        const [result] = await db.execute(`

            INSERT INTO properties (

                title, description, location, type, price, status, 

                size_sqm, created_at, updated_at

            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())

        `, [

            propertyName, description, location, propertyType, parsedPrice, 

            status || 'Available', parsedSize

        ]);



        res.status(201).json({

            success: true,

            message: 'Property created successfully',

            propertyId: propertyId

        });



    } catch (error) {

        console.error('Error creating property:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to create property',

            error: error.message

        });

    }

});



app.get('/api/properties', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const [properties] = await db.execute(`

            SELECT * FROM properties 

            ORDER BY created_at DESC

        `);



        res.status(200).json({

            success: true,

            properties: properties

        });



    } catch (error) {

        console.error('Error fetching properties:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch properties',

            error: error.message

        });

    }

});



// Clients API endpoints

app.post('/api/clients', async (req, res) => {

    try {

        console.log('Clients endpoint called');

        console.log('Request body:', req.body);

        

        const db = require('./database/config/database');

        const {

            clientName,

            companyName,

            email,

            phone,

            address,

            industry,

            clientType,

            notes

        } = req.body;



        console.log('Extracted fields:', {

            clientName, companyName, email, phone, address, industry, clientType, notes

        });



        // Validate required fields

        if (!clientName || !email || !phone) {

            console.log('Validation failed - missing fields:', {

                clientName: !!clientName,

                email: !!email,

                phone: !!phone

            });

            return res.status(400).json({

                success: false,

                message: 'Missing required fields'

            });

        }

        

        // Validate email format

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            console.log('Invalid email format:', email);

            return res.status(400).json({

                success: false,

                message: 'Invalid email format'

            });

        }

        

        // Validate phone format (basic validation)

        const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;

        if (!phoneRegex.test(phone)) {

            console.log('Invalid phone format:', phone);

            return res.status(400).json({

                success: false,

                message: 'Invalid phone format'

            });

        }



        // Generate client ID

        const clientId = 'CLIENT' + Date.now();



        // Insert client

        const [result] = await db.execute(`

            INSERT INTO clients (

                client_id, client_type, full_name, company_name, phone_number,

                email_address, nida_number, physical_address, property_interest, additional_notes,

                registered_by, registration_date, status, created_at, updated_at

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())

        `, [

            clientId, clientType || 'individual', clientName, companyName, phone,

            email, 'NIDA' + Date.now(), address, industry, notes, 'Admin Assistant', 'active'

        ]);



        res.status(201).json({

            success: true,

            message: 'Client registered successfully',

            clientId: clientId

        });



    } catch (error) {

        console.error('Error creating client:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to register client',

            error: error.message

        });

    }

});



app.get('/api/clients', async (req, res) => {

    try {

        const db = require('./database/config/database');

        const [clients] = await db.execute(`

            SELECT * FROM clients 

            ORDER BY created_at DESC

        `);



        res.status(200).json({

            success: true,

            clients: clients

        });



    } catch (error) {

        console.error('Error fetching clients:', error);

        res.status(500).json({

            success: false,

            message: 'Failed to fetch clients',

            error: error.message

        });

    }

});



// Database health check

app.get('/api/db-health', async (req, res) => {

    try {

        const db = require('./database/config/database');

        

        // Simple database connection test

        const [result] = await db.execute('SELECT 1 as test');

        

        res.status(200).json({

            status: 'OK',

            database: 'Connected',

            timestamp: new Date().toISOString(),

            environment: process.env.NODE_ENV,

            result: result

        });

    } catch (error) {

        res.status(500).json({

            status: 'ERROR',

            database: 'Connection failed',

            message: error.message,

            timestamp: new Date().toISOString()

        });

    }

});



// Root route for Railway health check - MUST be first

app.get("/", (req, res) => {

  console.log("🔍 Root route accessed");

  res.status(200).json({

    status: 'OK',

    message: 'KASHTEC API is running',

    timestamp: new Date().toISOString()

  });

});



// Simple test route (no database)

app.get("/test", (req, res) => {

  console.log("🔍 Test route accessed");

  res.status(200).json({

    status: "OK",

    message: "Test route working",

    timestamp: new Date().toISOString()

  });

});



// Railway root health check

app.get('/_health', (req, res) => {

    res.status(200).json({

        status: 'OK',

        service: 'KASHTEC Construction Management System',

        timestamp: new Date().toISOString(),

        port: PORT,

        environment: process.env.NODE_ENV

    });

});



// API routes are already handled above - no need for duplicate routing



// Catch-all handler for any other requests - MUST be last

app.get('*', (req, res) => {

    console.log(`🔍 Catch-all route accessed: ${req.path}`);

    

    // If it's an API request, return 404

    if (req.path.startsWith('/api')) {

        return res.status(404).json({ 

            error: 'API endpoint not found',

            path: req.path,

            method: req.method,

            timestamp: new Date().toISOString()

        });

    }

    

    // For non-API requests, return 404 since index.html was deleted

    res.status(404).json({

        error: 'Page not found',

        message: 'The requested resource is not available',

        path: req.path,

        timestamp: new Date().toISOString()

    });

});



// Railway-specific catch-all handler (must be last)

app.use('*', (req, res, next) => {

    // Log the request for debugging

    console.log(`🔍 Railway request: ${req.method} ${req.path}`);

    

    // If it's an API request that wasn't handled

    if (req.path.startsWith('/api')) {

        return res.status(404).json({ 

            error: 'API endpoint not found',

            path: req.path,

            method: req.method,

            timestamp: new Date().toISOString()

        });

    }

    

    // For any other request, return 404 since index.html was deleted

    res.status(404).json({

        error: 'Page not found',

        message: 'The requested resource is not available',

        path: req.path,

        timestamp: new Date().toISOString()

    });

});



// Main error handling middleware (consolidated from multiple handlers)

app.use((err, req, res, next) => {

    console.error('❌ Error caught:', err);

    console.error('❌ Error stack:', err.stack);

    console.error('❌ Request URL:', req.url);

    console.error('❌ Request method:', req.method);

    

    // Don't send error details in production

    const isDev = process.env.NODE_ENV === 'development';

    

    res.status(err.status || 500).json({

        error: {

            message: isDev ? err.message : 'Internal Server Error',

            stack: isDev ? err.stack : undefined,

            timestamp: new Date().toISOString(),

            path: req.path,

            method: req.method

        }

    });

});



// 404 handler

app.use('*', (req, res) => {

    console.log('❌ 404 - Route not found:', req.method, req.url);

    

    if (req.path.startsWith('/api')) {

        return res.status(404).json({ 

            error: 'API endpoint not found',

            path: req.path,

            method: req.method,

            timestamp: new Date().toISOString(),

            available_routes: [

                'GET /',

                'GET /api/health',

                'GET /api/status',

                'GET /api/tables',

                'GET /ping',

                'POST /api/auth/login',

                'GET /api/auth/test',

                'GET /api/employees',

                'POST /api/employees',

                'GET /api/worker-accounts',

                'POST /api/worker-accounts',

                'GET /api/worker-accounts/:id',

                'PUT /api/worker-accounts/:id',

                'DELETE /api/worker-accounts/:id',

                'GET /api/worker-accounts/department/:department',

                'GET /api/worker-accounts/stats/overview',

                'GET /api/projects',

                'GET /api/documents',

                'GET /api/meetings',

                'POST /api/meetings',

                'GET /api/meetings/upcoming',

                'GET /api/meetings/department/:department',

                'GET /api/meetings/:id',

                'PUT /api/meetings/:id',

                'DELETE /api/meetings/:id',

                'PATCH /api/meetings/:id/status'

            ]

        });

    }

    

    // For non-API requests, return 404 HTML page

    res.status(404).send(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Page Not Found - KASHTEC</title>

            <style>

                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }

                .container { max-width: 600px; margin: 0 auto; }

                .logo { font-size: 2em; color: #0b3d91; margin-bottom: 20px; }

                .error-code { font-size: 4em; color: #dc3545; margin: 20px 0; }

                .message { color: #666; margin: 20px 0; }

                .btn { background: #0b3d91; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }

            </style>

        </head>

        <body>

            <div class="container">

                <div class="logo">🏗️ KASHTEC</div>

                <div class="error-code">404</div>

                <h1>Page Not Found</h1>

                <p class="message">The page you're looking for doesn't exist or has been moved.</p>

                <a href="/" class="btn">Go to Dashboard</a>

            </div>

        </body>

        </html>

    `);

});



// Graceful shutdown

process.on('SIGTERM', () => {

    console.log('SIGTERM received, shutting down gracefully');

    server.close(() => {

        console.log('Process terminated');

        process.exit(0);

    });

});



process.on('SIGINT', () => {

    console.log('SIGINT received, shutting down gracefully');

    server.close(() => {

        console.log('Process terminated');

        process.exit(0);

    });

});



// Start server - Railway compatible configuration

const SERVER_PORT = config.PORT;



console.log('🔍 Starting server configuration:');

console.log('📍 PORT from environment:', SERVER_PORT);

console.log('🔍 Node environment:', process.env.NODE_ENV);



if (!SERVER_PORT) {

    console.error('❌ ERROR: PORT environment variable is not set!');

    process.exit(1);

}



// Auto-run database migrations on startup with state machine parser

async function runMigrations() {

    try {

        console.log('=== AUTOMATIC DATABASE MIGRATION ===');

        console.log('Running migrations on server startup...');

        console.log('DEBUG: Migration function called successfully');

        

        const fs = require('fs').promises;

        const path = require('path');

        

        // Read the migration file

        const migrationPath = path.resolve(__dirname, 'database/migrations/001_create_tables.sql');

        console.log('Migration file path:', migrationPath);

        

        const migrationSQL = await fs.readFile(migrationPath, 'utf8');

        console.log('Migration SQL loaded, length:', migrationSQL.length);

        

        // Character-by-character SQL parsing with state machine

        console.log('=== STATE MACHINE SQL PARSING ===');

        console.log(`SQL file length: ${migrationSQL.length}`);

        

        function splitSqlStatements(sql) {

            const statements = [];

            let current = '';

            let inSingleQuote = false;

            let inDoubleQuote = false;

            let inBacktick = false;

            let inLineComment = false;

            let inBlockComment = false;

            let parenLevel = 0;

            

            for (let i = 0; i < sql.length; i++) {

                const char = sql[i];

                const prevChar = i > 0 ? sql[i - 1] : '';

                

                // Handle block comments /* */

                if (!inLineComment && !inSingleQuote && !inDoubleQuote && !inBacktick && char === '/' && i + 1 < sql.length && sql[i + 1] === '*') {

                    inBlockComment = true;

                }

                if (inBlockComment && !inSingleQuote && !inDoubleQuote && !inBacktick && char === '*' && i + 1 < sql.length && sql[i + 1] === '/') {

                    inBlockComment = false;

                }

                

                // Handle line comments --

                if (!inBlockComment && !inSingleQuote && !inDoubleQuote && !inBacktick && char === '-' && i + 1 < sql.length && sql[i + 1] === '-') {

                    inLineComment = true;

                }

                if (inLineComment && (char === '\n' || char === '\r')) {

                    inLineComment = false;

                }

                

                // Handle string literals and identifiers

                if (!inBlockComment && !inLineComment) {

                    if (char === "'" && !inDoubleQuote && !inBacktick && (i === 0 || prevChar !== '\\')) {

                        inSingleQuote = !inSingleQuote;

                    } else if (char === '"' && !inSingleQuote && !inBacktick && (i === 0 || prevChar !== '\\')) {

                        inDoubleQuote = !inDoubleQuote;

                    } else if (char === '`' && !inSingleQuote && !inDoubleQuote && (i === 0 || prevChar !== '\\')) {

                        inBacktick = !inBacktick;

                    } else if (char === '(' && !inSingleQuote && !inDoubleQuote && !inBacktick) {

                        parenLevel++;

                    } else if (char === ')' && !inSingleQuote && !inDoubleQuote && !inBacktick) {

                        parenLevel--;

                    }

                }

                

                // Split on semicolon when not in any special context

                if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick && !inLineComment && !inBlockComment && parenLevel === 0) {

                    const statement = current.trim();

                    if (statement && !statement.startsWith('--') && statement.length > 0) {

                        statements.push(statement);

                        if (statements.length <= 10) {

                            console.log(`Statement ${statements.length}: ${statement.substring(0, 100)}...`);

                        }

                    }

                    current = '';

                } else if (!inLineComment && !inBlockComment) {

                    current += char;

                }

            }

            

            // Add final statement if exists

            const finalStatement = current.trim();

            if (finalStatement && !finalStatement.startsWith('--') && finalStatement.length > 0) {

                statements.push(finalStatement);

            }

            

            return statements;

        }

        

        const statements = splitSqlStatements(migrationSQL);

        console.log(`=== STATE MACHINE: Found ${statements.length} statements ===`);

        

        // Warning if too few CREATE TABLE statements found

        const createTableCount = statements.filter(stmt => stmt.match(/^CREATE\s+TABLE/i)).length;

        if (createTableCount < 35) {

            console.warn(`WARNING: Only ${createTableCount} CREATE TABLE statements found! Expected 40+`);

        }

        

        // Log first few statements for debugging

        console.log('First 10 statements:');

        for (let i = 0; i < Math.min(10, statements.length); i++) {

            console.log(`${i + 1}: ${statements[i].substring(0, 150)}...`);

        }

        

        console.log(`=== MIGRATION EXECUTION ===`);

        

        const db = require('./database/config/database');

        let successCount = 0;

        let skippedCount = 0;

        

        // Execute statements

        for (let i = 0; i < statements.length; i++) {

            const statement = statements[i].trim();

            if (!statement) continue;

            

            try {

                await db.execute(statement);

                console.log(`Migration ${i + 1}/${statements.length}: SUCCESS`);

                successCount++;

            } catch (error) {

                if (error.message.includes('already exists') || 

                    error.message.includes('Duplicate entry') ||

                    error.message.includes('This command is not supported in the prepared statement protocol yet')) {

                    console.log(`Migration ${i + 1}: SKIPPED (${error.message})`);

                    skippedCount++;

                } else {

                    console.error(`Migration ${i + 1}: ERROR - ${error.message}`);

                }

            }

        }

        

        console.log('\n=== MIGRATION SUMMARY ===');

        console.log(`Successfully executed: ${successCount}`);

        console.log(`Skipped (existing): ${skippedCount}`);

        console.log(`Total statements: ${statements.length}`);

        

        // Verify key tables exist

        try {

            const [tables] = await db.execute('SHOW TABLES');

            const tableNames = Array.isArray(tables) ? tables.map(table => Object.values(table)[0]) : [];

            

            console.log(`\nDatabase contains ${tableNames.length} tables:`);

            tableNames.sort().forEach(table => console.log(`  - ${table}`));

            

            // Check for critical tables

            const criticalTables = [

                'users', 'projects', 'documents', 'contracts', 'employees', 'employee_details',

                'hr_work', 'clients', 'properties', 'workforce_budgets', 'authentication',

                'policies', 'notifications', 'file_uploads', 'financial_transactions',

                'hse_incidents', 'ppe_issuance', 'schedule_meetings', 'worker_accounts',

                'senior_hiring_requests', 'senior_hiring_approvals', 'senior_hiring_rejections',

                'senior_hiring_info_requests', 'workforce_budget_approvals', 'workforce_budget_rejections',

                'workforce_budget_modifications', 'policy_revisions', 'policy_rejections',

                'admin_work', 'finance_work', 'hse_work', 'projects_work', 'realestate_work',

                'work_comments', 'work_actions', 'work_rejections', 'work_revisions'

            ];

            const missingTables = criticalTables.filter(table => !tableNames.includes(table));

            

            if (missingTables.length > 0) {

                console.log(`\nWARNING: Missing critical tables: ${missingTables.join(', ')}`);

            } else {

                console.log('\nAll critical tables are present!');

            }

            

        } catch (verifyError) {

            console.log('Could not verify tables:', verifyError.message);

        }

        

        console.log('\n=== MIGRATION COMPLETE ===\n');

        

    } catch (error) {

        console.error('Migration failed:', error);

        console.log('Continuing server startup despite migration failure...\n');

    }

}



// Create authentication table directly

async function createAuthenticationTable() {

    try {

        console.log('🔧 Creating authentication table directly...');

        const db = require('./database/config/database');

        

        // First, drop the existing table to ensure clean recreation

        try {

            console.log('🗑️ Dropping existing authentication table...');

            await db.execute('DROP TABLE IF EXISTS authentication');

            console.log('✅ Existing authentication table dropped');

        } catch (dropError) {

            console.log('ℹ️ No existing table to drop:', dropError.message);

        }

        

        // Create authentication table

        const createAuthTableSQL = `

            CREATE TABLE authentication (

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

            )

        `;

        

        await db.execute(createAuthTableSQL);

        console.log('✅ Authentication table created successfully');

        

        // Insert authentication records with correct hashes

        const insertAuthSQL = `

            INSERT INTO authentication (department_code, email, password_hash, role, department_name, manager_name, status) VALUES

            ('MD', 'md@kashtec.com', '$2a$12$pkTstU3up/l5NQlFpHKTI.OkXHOAbbWzjel7kSuLF/gfyva/v7vti', 'Managing Director', 'Managing Director Office', 'Dr. John Smith', 'Active'),

            ('ADMIN', 'admin@kashtec.com', '$2a$12$u6PW.jhy0/RN6xCBD8IcAupzxxeogxf3sheaeQm1RUevCl.BStPmq', 'Director of Administration', 'Administration', 'Director of Administration', 'Active'),

            ('HR', 'hr@manager0501', '$2a$12$AFEzay0Y3Bk8j1VTLuHVjOIf/zVCfj0S9jlJkKQuBX7wFViBPe8Mm', 'HR Manager', 'Human Resources', 'HR Manager', 'Active'),

            ('HSE', 'hse@manager0501', '$2a$12$Ju7KnyHUC7aYlQdPyygjPuly4JAxNkgau61OD0DBFo8Twk4YuadC2', 'HSE Manager', 'Health & Safety', 'HSE Manager', 'Active'),

            ('FINANCE', 'finance@manager0501', '$2a$12$zxzP5s/IBL1f4niPlxi.mO54LXkZy9KSEfbXP83ceHMfscxqyXKdC', 'Finance Manager', 'Finance', 'Finance Manager', 'Active'),

            ('PROJECT', 'pm@manager0501', '$2a$12$QprpmBaruPb.D9tbcPYm8Or/gOfC2fwwk47WYcCktc8sC1/N/wN8G', 'Project Manager', 'Project Management', 'Project Manager', 'Active'),

            ('REALESTATE', 'realestate@manager0501', '$2a$12$zrRcx9zjrBEG.8yn0a7AyesG4QWpjRtc4DcnhLAFkVpTTi9KlEDM6', 'Real Estate Manager', 'Real Estate', 'Real Estate Manager', 'Active'),

            ('ASSISTANT', 'assistant@kashtec.com', '$2a$12$aYCuS6B19FTYsARmSIOwe.iuG93uq7HTsQhW/cuh8BawFb9HPn./S', 'Admin Assistant', 'Administration', 'Admin Assistant', 'Active')

        `;

        

        await db.execute(insertAuthSQL);

        console.log('✅ Authentication records with correct hashes inserted successfully');

        

        // Verify the HR record has the correct hash

        const verifyQuery = await db.execute('SELECT email, password_hash FROM authentication WHERE email = ?', ['hr@manager0501']);

        console.log('🔍 Verification - HR record:', verifyQuery[0]);

        

    } catch (error) {

        console.error('❌ Authentication table creation failed:', error);

        throw error;

    }

}



// Create HR work table directly if it doesn't exist

async function createHRWorkTable() {

    try {

        console.log('🔧 Creating hr_work table directly...');

        const db = require('./database/config/database');

        

        const createHRWorkTableSQL = `

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

            )

        `;

        

        await db.execute(createHRWorkTableSQL);

        console.log('✅ HR work table created successfully');

        

    } catch (error) {

        console.error('❌ HR work table creation failed:', error);

        throw error;

    }

}



// Create employee_details table for personal information

async function createEmployeeDetailsTable() {

    try {

        console.log('🔧 Creating employee_details table directly...');

        const db = require('./database/config/database');

        

        const createEmployeeDetailsTableSQL = `

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

              INDEX idx_gmail (gmail),

              INDEX idx_nida (nida),

              INDEX idx_employee_id (employee_id)

            )

        `;

        

        await db.execute(createEmployeeDetailsTableSQL);

        console.log('✅ Employee details table created successfully');

        

    } catch (error) {

        console.error('❌ Employee details table creation failed:', error);

        throw error;

    }

}



// Create missing properties and clients tables with correct schema

async function createPropertiesAndClientsTables() {

    try {

        console.log('Creating missing properties and clients tables...');

        const db = require('./database/config/database');

        

        // Create properties table

        const createPropertiesTableSQL = `

            CREATE TABLE IF NOT EXISTS properties (

                id INT AUTO_INCREMENT PRIMARY KEY,

                property_name VARCHAR(255) NOT NULL,

                property_type ENUM('residential', 'commercial', 'industrial', 'agricultural') NOT NULL,

                location VARCHAR(255) NOT NULL,

                size DECIMAL(10,2) NOT NULL,

                value DECIMAL(15,2) NOT NULL,

                status ENUM('Available', 'Sold', 'Under Offer', 'Rented', 'Off Market') DEFAULT 'Available',

                description TEXT,

                owner VARCHAR(255),

                contact_info VARCHAR(255),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                INDEX idx_property_type (property_type),

                INDEX idx_status (status),

                INDEX idx_location (location)

            )

        `;

        

        await db.execute(createPropertiesTableSQL);

        console.log('Properties table created successfully');

        

        // Create clients table

        const createClientsTableSQL = `

            CREATE TABLE IF NOT EXISTS clients (

                id INT AUTO_INCREMENT PRIMARY KEY,

                client_name VARCHAR(255) NOT NULL,

                client_type ENUM('individual', 'company') DEFAULT 'individual',

                company_name VARCHAR(255),

                phone VARCHAR(50) NOT NULL,

                email VARCHAR(255) NOT NULL,

                address TEXT,

                nida_number VARCHAR(50),

                tin_number VARCHAR(50),

                property_interest VARCHAR(255),

                budget_range VARCHAR(100),

                additional_notes TEXT,

                registered_by VARCHAR(255),

                registration_date DATE,

                status ENUM('Active', 'Inactive', 'Prospective') DEFAULT 'Active',

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                INDEX idx_client_type (client_type),

                INDEX idx_status (status),

                INDEX idx_registered_by (registered_by)

            )

        `;

        

        await db.execute(createClientsTableSQL);

        console.log('Clients table created successfully');

        

        console.log('Properties and clients tables created successfully');

        

    } catch (error) {

        console.error('Error creating properties and clients tables:', error);

        throw error;

    }

}



// Create missing worker_assignments table with correct schema

async function createWorkerAssignmentsTable() {

    try {

        console.log('Creating missing worker_assignments table...');

        const db = require('./database/config/database');

        

        // Create worker_assignments table

        const createWorkerAssignmentsTableSQL = `

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

                INDEX idx_start_date (start_date)

            )

        `;

        

        await db.execute(createWorkerAssignmentsTableSQL);

        console.log('Worker assignments table created successfully');

        

    } catch (error) {

        console.error('Error creating worker_assignments table:', error);

        throw error;

    }

}



// Create missing meeting_minutes table with correct schema

async function createMeetingMinutesTable() {

    try {

        console.log('Creating missing meeting_minutes table...');

        const db = require('./database/config/database');

        

        // Create meeting_minutes table

        const createMeetingMinutesTableSQL = `

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

                INDEX idx_meeting_id (meeting_id),

                INDEX idx_meeting_date (meeting_date),

                INDEX idx_meeting_type (meeting_type),

                INDEX idx_status (status)

            )

        `;

        

        await db.execute(createMeetingMinutesTableSQL);

        console.log('Meeting minutes table created successfully');

        

    } catch (error) {

        console.error('Error creating meeting_minutes table:', error);

        throw error;

    }

}



// Create missing senior hiring tables with correct singular names

async function createSeniorHiringTables() {

    try {

        console.log('Creating missing senior hiring tables...');

        const db = require('./database/config/database');

        

        // Create senior_hiring_approval table (singular, not plural)

        const createSeniorHiringApprovalTableSQL = `

            CREATE TABLE IF NOT EXISTS senior_hiring_approval (

                id INT AUTO_INCREMENT PRIMARY KEY,

                candidate_name VARCHAR(255) NOT NULL,

                position VARCHAR(255) NOT NULL,

                department VARCHAR(100) NOT NULL,

                proposed_salary VARCHAR(50) NOT NULL,

                experience TEXT,

                hr_recommendation TEXT,

                status ENUM('pending', 'approved', 'rejected', 'info_requested') DEFAULT 'pending',

                request_date DATE NOT NULL,

                approval_date DATE,

                approved_by VARCHAR(255),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                INDEX idx_status (status),

                INDEX idx_department (department),

                INDEX idx_request_date (request_date)

            )

        `;

        

        await db.execute(createSeniorHiringApprovalTableSQL);

        console.log('Senior hiring approval table created successfully');

        

        // Create senior_hiring_info_request table (singular, not plural)

        const createSeniorHiringInfoRequestTableSQL = `

            CREATE TABLE IF NOT EXISTS senior_hiring_info_request (

                id INT AUTO_INCREMENT PRIMARY KEY,

                hiring_request_id INT NOT NULL,

                info_request TEXT NOT NULL,

                requested_by VARCHAR(255) NOT NULL,

                requested_date DATE NOT NULL,

                status ENUM('pending', 'provided', 'closed') DEFAULT 'pending',

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                INDEX idx_hiring_request_id (hiring_request_id),

                INDEX idx_status (status)

            )

        `;

        

        await db.execute(createSeniorHiringInfoRequestTableSQL);

        console.log('Senior hiring info request table created successfully');

        

        // Create senior_hiring_rejection table (singular, not plural)

        const createSeniorHiringRejectionTableSQL = `

            CREATE TABLE IF NOT EXISTS senior_hiring_rejection (

                id INT AUTO_INCREMENT PRIMARY KEY,

                hiring_request_id INT NOT NULL,

                rejection_reason TEXT NOT NULL,

                rejected_by VARCHAR(255) NOT NULL,

                rejected_date DATE NOT NULL,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                INDEX idx_hiring_request_id (hiring_request_id)

            )

        `;

        

        await db.execute(createSeniorHiringRejectionTableSQL);

        console.log('Senior hiring rejection table created successfully');

        

        // Sample data will be added via API after startup
        console.log('Sample senior hiring data will be added via API after startup');

        

        console.log('All senior hiring tables created successfully');

        

    } catch (error) {

        console.error('Error creating senior hiring tables:', error);

        throw error;

    }

}



// Create missing workforce budget tables
async function createWorkforceBudgetTables() {
    try {
        console.log('Creating missing workforce budget tables...');
        const db = require('./database/config/database');
        
        // Create workforce_budgets table
        const createWorkforceBudgetsTableSQL = `
            CREATE TABLE IF NOT EXISTS workforce_budgets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                department VARCHAR(100) NOT NULL,
                total_budget DECIMAL(15,2) NOT NULL,
                salaries_wages DECIMAL(15,2) NOT NULL,
                training_development DECIMAL(15,2) NOT NULL,
                employee_benefits DECIMAL(15,2) NOT NULL,
                recruitment_costs DECIMAL(15,2) NOT NULL,
                status ENUM('pending', 'approved', 'rejected', 'modification_requested') DEFAULT 'pending',
                submission_date DATE NOT NULL,
                approved_by VARCHAR(255),
                approval_date DATE,
                justification TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_department (department),
                INDEX idx_submission_date (submission_date)
            )
        `;
        
        await db.execute(createWorkforceBudgetsTableSQL);
        console.log('Workforce budgets table created successfully');
        
        // Create workforce_budget_rejections table
        const createWorkforceBudgetRejectionsTableSQL = `
            CREATE TABLE IF NOT EXISTS workforce_budget_rejections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                budget_id INT NOT NULL,
                rejection_reason TEXT NOT NULL,
                rejected_by VARCHAR(255) NOT NULL,
                rejected_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_budget_id (budget_id)
            )
        `;
        
        await db.execute(createWorkforceBudgetRejectionsTableSQL);
        console.log('Workforce budget rejections table created successfully');
        
        // Create workforce_budget_modifications table
        const createWorkforceBudgetModificationsTableSQL = `
            CREATE TABLE IF NOT EXISTS workforce_budget_modifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                budget_id INT NOT NULL,
                modification_request TEXT NOT NULL,
                requested_by VARCHAR(255) NOT NULL,
                requested_date DATE NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_budget_id (budget_id),
                INDEX idx_status (status)
            )
        `;
        
        await db.execute(createWorkforceBudgetModificationsTableSQL);
        console.log('Workforce budget modifications table created successfully');
        
        // Sample workforce budget data will be added via API after startup
        console.log('Sample workforce budget data will be added via API after startup');
        
        console.log('All workforce budget tables created successfully');
        
    } catch (error) {
        console.error('Error creating workforce budget tables:', error);
        throw error;
    }
}



// Start server after migrations and authentication table creation

console.log('🚀 Starting KASHTEC server startup sequence...');



async function startServer() {

    try {

        console.log('🔄 Step 1: Running database migrations (including schedule_meetings and worker_accounts tables)...');

        await runMigrations();

        console.log('✅ Step 1 completed: All database tables created successfully (including worker_accounts table)');

        

        console.log('🔄 Step 2: Creating authentication table...');

        await createAuthenticationTable();

        console.log('✅ Step 2 completed: Authentication table ready');

        

        console.log(' Step 3: Creating employee details table...');

        await createEmployeeDetailsTable();

        console.log('Step 3 completed: Employee details table ready');
        
        console.log(' Step 4: Creating missing properties and clients tables...');

        await createPropertiesAndClientsTables();

        console.log(' Step 4 completed: Properties and clients tables ready');

        

        console.log('🔄 Step 5: Creating missing worker_assignments table...');

        await createWorkerAssignmentsTable();

        console.log('✅ Step 5 completed: Worker assignments table ready');

        

        console.log('🔄 Step 6: Creating missing meeting_minutes table...');

        await createMeetingMinutesTable();

        console.log('✅ Step 6 completed: Meeting minutes table ready');

        

        console.log('🔄 Step 7: Creating missing senior hiring tables...');

        await createSeniorHiringTables();

        console.log('✅ Step 7 completed: Senior hiring tables ready');

        

        console.log('🔄 Step 8: Creating missing workforce budget tables...');
        await createWorkforceBudgetTables();
        console.log('✅ Step 8 completed: Workforce budget tables ready');

        

        console.log('🔄 Step 9: Starting HTTP server...');

        const server = app.listen(SERVER_PORT, '0.0.0.0', () => {

            console.log('🚀 ' + config.APP_NAME);

            console.log('🌍 Environment: ' + config.NODE_ENV);

            console.log('📍 Server running on port ' + SERVER_PORT);

            console.log('🏠 URL: http://0.0.0.0:' + SERVER_PORT);

            console.log('📊 Health check: http://0.0.0.0:' + SERVER_PORT + '/api/health');

            console.log('🔍 API status: http://0.0.0.0:' + SERVER_PORT + '/api/status');

            console.log('🕒 Started at: ' + new Date().toLocaleString());

            console.log('✅ Server startup completed successfully!');

            console.log('🌐 All API endpoints are ready for requests');

            console.log('📅 Schedule meetings table is available for use');

            console.log('👷 Worker accounts table is available for use');

        });



        server.on('error', (error) => {

            console.error('❌ Server error:', error);

            if (error.code === 'EADDRINUSE') {

                console.error('❌ Port ' + SERVER_PORT + ' is already in use');

            }

            process.exit(1);

        });



        server.on('listening', () => {

            if (server) {

                const address = server.address();

                console.log('🔍 Server listening on ' + address.address + ':' + address.port);

                console.log('🔍 Ready to accept connections');

            } else {

                console.error('❌ Server variable is undefined in listening event');

            }

        });

        

        return server;

        

    } catch (error) {

        console.error('❌ Server startup failed:', error);

        console.error('❌ Error details:', error.message);

        console.error('❌ Error stack:', error.stack);

        process.exit(1);

    }

}



// Start the server

startServer();



// Handle unhandled promise rejections

process.on('unhandledRejection', (reason, promise) => {

    console.error('Unhandled Rejection at:', promise, 'reason:', reason);

});



// Handle uncaught exceptions

process.on('uncaughtException', (error) => {

    console.error('Uncaught Exception:', error);

    process.exit(1);

});



module.exports = app;

