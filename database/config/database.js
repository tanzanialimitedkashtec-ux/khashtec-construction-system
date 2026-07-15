// Production Database Configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.lastConnectionAttempt = 0;
        this.connectionCooldown = 5000; // 5 seconds cooldown between attempts
    }

    async connect() {
        const now = Date.now();
        
        // Prevent excessive connection attempts
        if (now - this.lastConnectionAttempt < this.connectionCooldown) {
            console.log('⏳ Database connection cooldown, skipping attempt');
            return false;
        }
        
        this.lastConnectionAttempt = now;

        try {
            // Reduce logging - only log essential info
            if (this.reconnectAttempts === 0) {
                console.log('🔗 Initializing database connection...');
            }
            
            // Debug environment variables (including Railway MySQL. prefixed variables)
            console.log('🔍 Environment Variables Debug:');
            console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
            console.log('  - MYSQL_URL:', process.env.MYSQL_URL ? 'SET' : 'MISSING');
            console.log('  - MySQL.MYSQL_URL:', process.env['MySQL.MYSQL_URL'] ? 'SET' : 'MISSING');
            console.log('  - MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? 'SET' : 'MISSING');
            console.log('  - MySQL.MYSQL_PUBLIC_URL:', process.env['MySQL.MYSQL_PUBLIC_URL'] ? 'SET' : 'MISSING');
            console.log('  - MYSQLUSER:', process.env.MYSQLUSER || 'MISSING');
            console.log('  - MySQL.MYSQLUSER:', process.env['MySQL.MYSQLUSER'] || 'MISSING');
            console.log('  - MYSQLHOST:', process.env.MYSQLHOST || 'MISSING');
            console.log('  - MySQL.MYSQLHOST:', process.env['MySQL.MYSQLHOST'] || 'MISSING');
            console.log('  - MYSQLPORT:', process.env.MYSQLPORT || 'MISSING');
            console.log('  - MySQL.MYSQLPORT:', process.env['MySQL.MYSQLPORT'] || 'MISSING');
            console.log('  - MYSQLDATABASE:', process.env.MYSQLDATABASE || 'MISSING');
            console.log('  - MySQL.MYSQLDATABASE:', process.env['MySQL.MYSQLDATABASE'] || 'MISSING');
            console.log('  - MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'SET' : 'MISSING');
            console.log('  - MySQL.MYSQLPASSWORD:', process.env['MySQL.MYSQLPASSWORD'] ? 'SET' : 'MISSING');
            
            // Use Railway's DATABASE_URL or construct from individual variables
            let databaseUrl = process.env.DATABASE_URL;
            
            // Check if DATABASE_URL contains unresolved variables
            if (!databaseUrl || databaseUrl.includes('${')) {
                databaseUrl = process.env['MySQL.MYSQL_URL'] || process.env.MYSQL_URL || process.env['MySQL.MYSQL_PUBLIC_URL'] || process.env.MYSQL_PUBLIC_URL;
            }
            
            // If still no valid URL, construct from individual variables (prioritize Railway MySQL. prefixed)
            if (!databaseUrl || databaseUrl.includes('${')) {
                const dbHost = process.env['MySQL.MYSQLHOST'] || process.env.MYSQLHOST || process.env.RAILWAY_PRIVATE_DOMAIN || process.env.DB_HOST;
                const dbPort = process.env['MySQL.MYSQLPORT'] || process.env.MYSQLPORT || process.env.DB_PORT || 3306;
                const dbUser = process.env['MySQL.MYSQLUSER'] || process.env.MYSQLUSER || process.env.DB_USER;
                const dbPassword = process.env['MySQL.MYSQLPASSWORD'] || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
                const dbName = process.env['MySQL.MYSQLDATABASE'] || process.env.MYSQLDATABASE || process.env.DB_NAME || "railway";
                
                if (dbUser && dbPassword && dbHost) {
                    databaseUrl = `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
                }
            }
            
            console.log('🔗 Database URL configured:', databaseUrl ? 'Available' : 'Missing');
            if (databaseUrl) {
                console.log('🔗 Database URL (safe):', databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
            }
            
            if (databaseUrl) {
                // Parse DATABASE_URL format: mysql://user:password@host:port/database
                const url = new URL(databaseUrl);
                
                this.pool = mysql.createPool({
                    host: url.hostname,
                    port: url.port || 3306,
                    user: url.username,
                    password: url.password,
                    database: url.pathname.substring(1),
                    waitForConnections: true,
                    connectionLimit: 5, // Reduced for Railway
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    idleTimeout: 300000, // 5 minutes
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            } else {
                // Fallback to individual environment variables
                const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || "centerbeam.proxy.rlwy.net";
                const dbPort = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
                const dbUser = process.env.MYSQLUSER || process.env.DB_USER || "root";
                const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "FpJJluFwvIzgsMTsfDZApQLznVVVIzJd";
                const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || "railway";
                
                console.log('🔗 Using fallback database config:', `${dbUser}@${dbHost}:${dbPort}/${dbName}`);
                
                this.pool = mysql.createPool({
                    host: dbHost,
                    port: dbPort,
                    user: dbUser,
                    password: dbPassword,
                    database: dbName,
                    waitForConnections: true,
                    connectionLimit: 5, // Reduced for Railway
                    queueLimit: 0,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 0,
                    idleTimeout: 300000, // 5 minutes
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
            }

            // Test connection with timeout
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000; // Reset delay
            
            if (this.reconnectAttempts === 0) {
                console.log('✅ Database connected successfully');
            } else {
                console.log('✅ Database reconnected successfully');
            }
            
            return true;
        } catch (error) {
            this.isConnected = false;
            this.reconnectAttempts++;
            
            // Only log errors at reasonable intervals to avoid spam
            if (this.reconnectAttempts === 1 || this.reconnectAttempts % 10 === 0) {
                console.error(`❌ Database connection failed (attempt ${this.reconnectAttempts}):`, error.message);
            }
            
            // Exponential backoff with jitter
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
                const jitter = Math.random() * 1000; // Add up to 1 second jitter
                setTimeout(() => this.connect(), this.reconnectDelay + jitter);
            } else if (this.reconnectAttempts === this.maxReconnectAttempts) {
                console.error('❌ Max reconnection attempts reached. Will retry periodically...');
                // Continue retrying but at longer intervals
                setInterval(() => this.connect(), 60000); // Retry every minute
            }
            
            return false;
        }
    }

    sendSystemNotificationEmail(query, params) {
        try {
            const queryStr = typeof query === 'string' ? query.trim() : '';
            if (!queryStr) return;
            const queryUpper = queryStr.toUpperCase();

            // Extract action, table, and column names
            let action = '';
            let table = '';
            let columns = [];
            
            if (queryUpper.startsWith('INSERT INTO')) {
                action = 'New Record Created';
                const tableMatch = queryStr.match(/INSERT\s+INTO\s+([^\s\(]+)/i);
                if (tableMatch) table = tableMatch[1];
                
                const colMatch = queryStr.match(/\(([^)]+)\)/);
                if (colMatch) {
                    columns = colMatch[1].split(',').map(c => c.trim().replace(/`/g, ''));
                }
            } else if (queryUpper.startsWith('UPDATE')) {
                action = 'Record Updated';
                const tableMatch = queryStr.match(/UPDATE\s+([^\s]+)/i);
                if (tableMatch) table = tableMatch[1];
                
                const setMatch = queryStr.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
                if (setMatch) {
                    const parts = setMatch[1].split(',');
                    columns = parts.map(p => p.split('=')[0].trim().replace(/`/g, ''));
                }
            } else if (queryUpper.startsWith('DELETE FROM')) {
                action = 'Record Deleted';
                const tableMatch = queryStr.match(/DELETE\s+FROM\s+([^\s]+)/i);
                if (tableMatch) table = tableMatch[1];
            }

            if (!action || !table) return;

            table = table.replace(/`/g, '');

            // Exclude internal/noisy tables
            const excludedTables = ['sessions', 'cache', 'logs', 'system_logs', 'authentication'];
            const lowerTable = table.toLowerCase();
            if (excludedTables.includes(lowerTable)) return;

            // ─── Complete human-readable message map for ALL modules ───
            const messageMap = {
                // ══════ Leadership & Strategy ══════
                leadership_management: {
                    created: { title: 'Leadership Update', msg: 'A new leadership management entry has been added to the system.' },
                    updated: { title: 'Leadership Update', msg: 'A leadership management record has been updated.' },
                    deleted: { title: 'Leadership Update', msg: 'A leadership management record has been removed.' }
                },
                mission_vision: {
                    created: { title: 'Mission & Vision Updated', msg: 'The company mission and vision statement has been updated.' },
                    updated: { title: 'Mission & Vision Updated', msg: 'The company mission and vision statement has been modified.' },
                    deleted: { title: 'Mission & Vision Removed', msg: 'A mission and vision entry has been removed.' }
                },
                long_term_growth: {
                    created: { title: 'New Growth Strategy', msg: 'A new long-term growth strategy has been created.' },
                    updated: { title: 'Growth Strategy Updated', msg: 'The long-term growth strategy has been updated.' },
                    deleted: { title: 'Growth Strategy Removed', msg: 'A long-term growth strategy has been removed.' }
                },
                financial_strategies: {
                    created: { title: 'New Financial Strategy', msg: 'A new financial strategy has been added to the system.' },
                    updated: { title: 'Financial Strategy Updated', msg: 'A financial strategy has been updated.' },
                    deleted: { title: 'Financial Strategy Removed', msg: 'A financial strategy has been removed from the system.' }
                },
                investment_management: {
                    created: { title: 'New Investment Recorded', msg: 'A new investment has been recorded in the system.' },
                    updated: { title: 'Investment Updated', msg: 'An investment record has been updated.' },
                    deleted: { title: 'Investment Removed', msg: 'An investment record has been removed from the system.' }
                },

                // ══════ People & HR ══════
                employees: {
                    created: { title: 'New Employee Registered', msg: 'A new employee has been registered in the system.' },
                    updated: { title: 'Employee Record Updated', msg: 'An employee record has been updated.' },
                    deleted: { title: 'Employee Removed', msg: 'An employee has been removed from the system.' }
                },
                employee_details: {
                    created: { title: 'Employee Details Added', msg: 'New employee details have been added.' },
                    updated: { title: 'Employee Details Updated', msg: 'Employee details have been updated.' },
                    deleted: { title: 'Employee Details Removed', msg: 'Employee details have been removed.' }
                },
                worker_accounts: {
                    created: { title: 'New Worker Account Created', msg: 'A new worker account has been created in the system.' },
                    updated: { title: 'Worker Account Updated', msg: 'A worker account has been updated.' },
                    deleted: { title: 'Worker Account Removed', msg: 'A worker account has been removed from the system.' }
                },
                worker_assignments: {
                    created: { title: 'Worker Assigned to Project', msg: 'A worker has been assigned to a project.' },
                    updated: { title: 'Worker Assignment Updated', msg: 'A worker project assignment has been updated.' },
                    deleted: { title: 'Worker Unassigned', msg: 'A worker has been removed from a project assignment.' }
                },
                workforce_requests: {
                    created: { title: 'Workforce Request Submitted', msg: 'A new workforce request has been submitted and is pending approval.' },
                    updated: { title: 'Workforce Request Updated', msg: 'A workforce request has been updated.' },
                    deleted: { title: 'Workforce Request Cancelled', msg: 'A workforce request has been cancelled.' }
                },
                workforce_budgets: {
                    created: { title: 'Workforce Budget Submitted', msg: 'A new workforce budget has been submitted for approval.' },
                    updated: { title: 'Workforce Budget Updated', msg: 'A workforce budget has been updated.' },
                    deleted: { title: 'Workforce Budget Removed', msg: 'A workforce budget has been removed.' }
                },
                workforce_budget_approvals: {
                    created: { title: 'Workforce Budget Approved', msg: 'A workforce budget has been approved.' },
                    updated: { title: 'Budget Approval Updated', msg: 'A workforce budget approval has been updated.' },
                    deleted: { title: 'Budget Approval Revoked', msg: 'A workforce budget approval has been revoked.' }
                },
                workforce_budget_rejections: {
                    created: { title: 'Workforce Budget Rejected', msg: 'A workforce budget has been rejected.' },
                    updated: { title: 'Budget Rejection Updated', msg: 'A workforce budget rejection has been updated.' },
                    deleted: { title: 'Budget Rejection Removed', msg: 'A workforce budget rejection has been removed.' }
                },
                workforce_budget_modifications: {
                    created: { title: 'Budget Modification Requested', msg: 'A modification has been requested for a workforce budget.' },
                    updated: { title: 'Budget Modification Updated', msg: 'A workforce budget modification has been updated.' },
                    deleted: { title: 'Budget Modification Removed', msg: 'A workforce budget modification has been removed.' }
                },
                senior_hiring_requests: {
                    created: { title: 'Senior Hiring Request Created', msg: 'A new senior staff hiring request has been submitted for approval.' },
                    updated: { title: 'Senior Hiring Request Updated', msg: 'A senior staff hiring request has been updated.' },
                    deleted: { title: 'Senior Hiring Request Cancelled', msg: 'A senior staff hiring request has been cancelled.' }
                },
                senior_hiring_approvals: {
                    created: { title: 'Senior Hiring Approved', msg: 'A senior staff hiring request has been approved.' },
                    updated: { title: 'Senior Hiring Approval Updated', msg: 'A senior hiring approval has been updated.' },
                    deleted: { title: 'Senior Hiring Approval Revoked', msg: 'A senior hiring approval has been revoked.' }
                },
                senior_hiring_rejections: {
                    created: { title: 'Senior Hiring Rejected', msg: 'A senior staff hiring request has been rejected.' },
                    updated: { title: 'Senior Hiring Rejection Updated', msg: 'A senior hiring rejection has been updated.' },
                    deleted: { title: 'Senior Hiring Rejection Removed', msg: 'A senior hiring rejection has been removed.' }
                },
                senior_hiring_info_requests: {
                    created: { title: 'More Info Requested for Hiring', msg: 'Additional information has been requested for a senior hiring request.' },
                    updated: { title: 'Hiring Info Request Updated', msg: 'A senior hiring information request has been updated.' },
                    deleted: { title: 'Hiring Info Request Removed', msg: 'A senior hiring information request has been removed.' }
                },
                attendance: {
                    created: { title: 'Attendance Recorded', msg: 'A new attendance record has been logged.' },
                    updated: { title: 'Attendance Updated', msg: 'An attendance record has been updated.' },
                    deleted: { title: 'Attendance Removed', msg: 'An attendance record has been removed.' }
                },
                leave_requests: {
                    created: { title: 'Leave Request Submitted', msg: 'A new leave request has been submitted and is pending approval.' },
                    updated: { title: 'Leave Request Updated', msg: 'A leave request has been updated.' },
                    deleted: { title: 'Leave Request Cancelled', msg: 'A leave request has been cancelled.' }
                },
                contracts: {
                    created: { title: 'New Contract Created', msg: 'A new employment contract has been created.' },
                    updated: { title: 'Contract Updated', msg: 'An employment contract has been updated.' },
                    deleted: { title: 'Contract Removed', msg: 'An employment contract has been removed.' }
                },
                users: {
                    created: { title: 'New User Account Created', msg: 'A new user account has been registered in the system.' },
                    updated: { title: 'User Account Updated', msg: 'A user account has been updated.' },
                    deleted: { title: 'User Account Removed', msg: 'A user account has been removed from the system.' }
                },
                talent_acquisition: {
                    created: { title: 'New Talent Acquisition Request', msg: 'A new talent acquisition request has been submitted.' },
                    updated: { title: 'Talent Acquisition Updated', msg: 'A talent acquisition request has been updated.' },
                    deleted: { title: 'Talent Acquisition Removed', msg: 'A talent acquisition request has been removed.' }
                },
                promotions: {
                    created: { title: 'Employee Promotion Submitted', msg: 'A new employee promotion has been submitted for review.' },
                    updated: { title: 'Promotion Updated', msg: 'An employee promotion record has been updated.' },
                    deleted: { title: 'Promotion Removed', msg: 'An employee promotion record has been removed.' }
                },
                discipline_monitoring: {
                    created: { title: 'Discipline Case Reported', msg: 'A new discipline case has been reported.' },
                    updated: { title: 'Discipline Case Updated', msg: 'A discipline case has been updated.' },
                    deleted: { title: 'Discipline Case Removed', msg: 'A discipline case has been removed.' }
                },
                claims_management: {
                    created: { title: 'New Claim Submitted', msg: 'A new claim has been submitted for processing.' },
                    updated: { title: 'Claim Updated', msg: 'A claim has been updated.' },
                    deleted: { title: 'Claim Removed', msg: 'A claim has been removed from the system.' }
                },

                // ══════ Operations & Projects ══════
                projects: {
                    created: { title: 'New Project Created', msg: 'A new project has been created in the system.' },
                    updated: { title: 'Project Updated', msg: 'A project has been updated.' },
                    deleted: { title: 'Project Removed', msg: 'A project has been removed from the system.' }
                },
                projects_work: {
                    created: { title: 'New Project Work Entry', msg: 'A new project work entry has been submitted.' },
                    updated: { title: 'Project Work Updated', msg: 'A project work entry has been updated.' },
                    deleted: { title: 'Project Work Removed', msg: 'A project work entry has been removed.' }
                },
                project_progress_updates: {
                    created: { title: 'Project Progress Updated', msg: 'A new project progress update has been recorded.' },
                    updated: { title: 'Progress Update Modified', msg: 'A project progress update has been modified.' },
                    deleted: { title: 'Progress Update Removed', msg: 'A project progress update has been removed.' }
                },
                task_assignments: {
                    created: { title: 'New Task Assigned', msg: 'A new task has been assigned to a team member.' },
                    updated: { title: 'Task Assignment Updated', msg: 'A task assignment has been updated.' },
                    deleted: { title: 'Task Unassigned', msg: 'A task assignment has been removed.' }
                },
                site_reports: {
                    created: { title: 'Site Report Submitted', msg: 'A new site report has been submitted.' },
                    updated: { title: 'Site Report Updated', msg: 'A site report has been updated.' },
                    deleted: { title: 'Site Report Removed', msg: 'A site report has been removed.' }
                },
                office_portal: {
                    created: { title: 'Office Portal Entry Created', msg: 'A new office portal entry has been created.' },
                    updated: { title: 'Office Portal Updated', msg: 'An office portal entry has been updated.' },
                    deleted: { title: 'Office Portal Entry Removed', msg: 'An office portal entry has been removed.' }
                },
                admin_work: {
                    created: { title: 'Administrative Task Created', msg: 'A new administrative task has been created.' },
                    updated: { title: 'Administrative Task Updated', msg: 'An administrative task has been updated.' },
                    deleted: { title: 'Administrative Task Removed', msg: 'An administrative task has been removed.' }
                },
                hr_work: {
                    created: { title: 'HR Task Created', msg: 'A new HR task has been submitted.' },
                    updated: { title: 'HR Task Updated', msg: 'An HR task has been updated.' },
                    deleted: { title: 'HR Task Removed', msg: 'An HR task has been removed.' }
                },
                work: {
                    created: { title: 'New Work Entry', msg: 'A new work entry has been submitted for processing.' },
                    updated: { title: 'Work Entry Updated', msg: 'A work entry has been updated.' },
                    deleted: { title: 'Work Entry Removed', msg: 'A work entry has been removed.' }
                },
                work_actions: {
                    created: { title: 'Work Action Taken', msg: 'An action has been taken on a work entry.' },
                    updated: { title: 'Work Action Updated', msg: 'A work action has been updated.' },
                    deleted: { title: 'Work Action Removed', msg: 'A work action has been removed.' }
                },
                work_approvals: {
                    created: { title: 'Work Approved', msg: 'A work entry has been approved.' },
                    updated: { title: 'Work Approval Updated', msg: 'A work approval has been updated.' },
                    deleted: { title: 'Work Approval Revoked', msg: 'A work approval has been revoked.' }
                },
                work_rejections: {
                    created: { title: 'Work Rejected', msg: 'A work entry has been rejected.' },
                    updated: { title: 'Work Rejection Updated', msg: 'A work rejection has been updated.' },
                    deleted: { title: 'Work Rejection Removed', msg: 'A work rejection has been removed.' }
                },
                work_revisions: {
                    created: { title: 'Work Revision Requested', msg: 'A revision has been requested for a work entry.' },
                    updated: { title: 'Work Revision Updated', msg: 'A work revision request has been updated.' },
                    deleted: { title: 'Work Revision Removed', msg: 'A work revision request has been removed.' }
                },
                work_comments: {
                    created: { title: 'Comment Added', msg: 'A new comment has been added to a work entry.' },
                    updated: { title: 'Comment Updated', msg: 'A comment on a work entry has been updated.' },
                    deleted: { title: 'Comment Removed', msg: 'A comment has been removed from a work entry.' }
                },

                // ══════ Safety & Compliance ══════
                hse_incidents: {
                    created: { title: 'Incident Report Filed', msg: 'A new safety incident report has been filed.' },
                    updated: { title: 'Incident Report Updated', msg: 'A safety incident report has been updated.' },
                    deleted: { title: 'Incident Report Removed', msg: 'A safety incident report has been removed.' }
                },
                hse_work: {
                    created: { title: 'HSE Task Created', msg: 'A new health, safety and environment task has been created.' },
                    updated: { title: 'HSE Task Updated', msg: 'A health, safety and environment task has been updated.' },
                    deleted: { title: 'HSE Task Removed', msg: 'A health, safety and environment task has been removed.' }
                },
                ppe_issuance: {
                    created: { title: 'PPE Issued', msg: 'Personal Protective Equipment has been issued to a worker.' },
                    updated: { title: 'PPE Issuance Updated', msg: 'A PPE issuance record has been updated.' },
                    deleted: { title: 'PPE Issuance Removed', msg: 'A PPE issuance record has been removed.' }
                },
                ppe_inventory: {
                    created: { title: 'PPE Inventory Added', msg: 'New PPE inventory has been added to the system.' },
                    updated: { title: 'PPE Inventory Updated', msg: 'PPE inventory levels have been updated.' },
                    deleted: { title: 'PPE Inventory Removed', msg: 'A PPE inventory item has been removed.' }
                },
                violations: {
                    created: { title: 'Safety Violation Reported', msg: 'A new safety violation has been reported.' },
                    updated: { title: 'Safety Violation Updated', msg: 'A safety violation record has been updated.' },
                    deleted: { title: 'Safety Violation Removed', msg: 'A safety violation record has been removed.' }
                },
                inspections: {
                    created: { title: 'Inspection Report Submitted', msg: 'A new inspection report has been submitted.' },
                    updated: { title: 'Inspection Report Updated', msg: 'An inspection report has been updated.' },
                    deleted: { title: 'Inspection Report Removed', msg: 'An inspection report has been removed.' }
                },
                policies: {
                    created: { title: 'New Policy Created', msg: 'A new company policy has been created.' },
                    updated: { title: 'Policy Updated', msg: 'A company policy has been updated.' },
                    deleted: { title: 'Policy Removed', msg: 'A company policy has been removed.' }
                },
                policy_revisions: {
                    created: { title: 'Policy Revision Submitted', msg: 'A revision has been submitted for a company policy.' },
                    updated: { title: 'Policy Revision Updated', msg: 'A policy revision has been updated.' },
                    deleted: { title: 'Policy Revision Removed', msg: 'A policy revision has been removed.' }
                },
                policy_rejections: {
                    created: { title: 'Policy Rejected', msg: 'A company policy has been rejected.' },
                    updated: { title: 'Policy Rejection Updated', msg: 'A policy rejection has been updated.' },
                    deleted: { title: 'Policy Rejection Removed', msg: 'A policy rejection has been removed.' }
                },
                compliance: {
                    created: { title: 'Compliance Record Created', msg: 'A new compliance record has been created.' },
                    updated: { title: 'Compliance Record Updated', msg: 'A compliance record has been updated.' },
                    deleted: { title: 'Compliance Record Removed', msg: 'A compliance record has been removed.' }
                },
                risk_management: {
                    created: { title: 'Risk Identified', msg: 'A new risk has been identified and recorded in the system.' },
                    updated: { title: 'Risk Assessment Updated', msg: 'A risk assessment has been updated.' },
                    deleted: { title: 'Risk Removed', msg: 'A risk record has been removed from the system.' }
                },

                // ══════ Finance & Accounting ══════
                finance_work: {
                    created: { title: 'Finance Task Created', msg: 'A new finance task has been submitted.' },
                    updated: { title: 'Finance Task Updated', msg: 'A finance task has been updated.' },
                    deleted: { title: 'Finance Task Removed', msg: 'A finance task has been removed.' }
                },
                financial_transactions: {
                    created: { title: 'Financial Transaction Recorded', msg: 'A new financial transaction has been recorded.' },
                    updated: { title: 'Financial Transaction Updated', msg: 'A financial transaction has been updated.' },
                    deleted: { title: 'Financial Transaction Removed', msg: 'A financial transaction has been removed.' }
                },
                payment_requests: {
                    created: { title: 'Payment Request Submitted', msg: 'A new payment request has been submitted and is pending approval.' },
                    updated: { title: 'Payment Request Updated', msg: 'A payment request has been updated.' },
                    deleted: { title: 'Payment Request Cancelled', msg: 'A payment request has been cancelled.' }
                },
                payment_tracking: {
                    created: { title: 'Payment Tracked', msg: 'A new payment has been recorded in the tracking system.' },
                    updated: { title: 'Payment Tracking Updated', msg: 'A payment tracking record has been updated.' },
                    deleted: { title: 'Payment Tracking Removed', msg: 'A payment tracking record has been removed.' }
                },
                payroll: {
                    created: { title: 'Payroll Processed', msg: 'A new payroll has been processed.' },
                    updated: { title: 'Payroll Updated', msg: 'A payroll record has been updated.' },
                    deleted: { title: 'Payroll Removed', msg: 'A payroll record has been removed.' }
                },
                invoices: {
                    created: { title: 'Invoice Created', msg: 'A new invoice has been created.' },
                    updated: { title: 'Invoice Updated', msg: 'An invoice has been updated.' },
                    deleted: { title: 'Invoice Removed', msg: 'An invoice has been removed.' }
                },
                budgets: {
                    created: { title: 'Budget Created', msg: 'A new budget has been created.' },
                    updated: { title: 'Budget Updated', msg: 'A budget has been updated.' },
                    deleted: { title: 'Budget Removed', msg: 'A budget has been removed.' }
                },
                tax: {
                    created: { title: 'Tax Record Created', msg: 'A new tax record has been created.' },
                    updated: { title: 'Tax Record Updated', msg: 'A tax record has been updated.' },
                    deleted: { title: 'Tax Record Removed', msg: 'A tax record has been removed.' }
                },
                procurement: {
                    created: { title: 'Procurement Order Created', msg: 'A new procurement order has been created.' },
                    updated: { title: 'Procurement Order Updated', msg: 'A procurement order has been updated.' },
                    deleted: { title: 'Procurement Order Removed', msg: 'A procurement order has been removed.' }
                },
                nhif: {
                    created: { title: 'NHIF Contribution Recorded', msg: 'A new NHIF contribution has been recorded.' },
                    updated: { title: 'NHIF Contribution Updated', msg: 'An NHIF contribution record has been updated.' },
                    deleted: { title: 'NHIF Contribution Removed', msg: 'An NHIF contribution record has been removed.' }
                },
                nssf_registration: {
                    created: { title: 'NSSF Registration Created', msg: 'A new NSSF registration has been created.' },
                    updated: { title: 'NSSF Registration Updated', msg: 'An NSSF registration has been updated.' },
                    deleted: { title: 'NSSF Registration Removed', msg: 'An NSSF registration has been removed.' }
                },
                audit_logs: {
                    created: { title: 'Audit Log Recorded', msg: 'A new audit log entry has been recorded.' },
                    updated: { title: 'Audit Log Updated', msg: 'An audit log entry has been updated.' },
                    deleted: { title: 'Audit Log Removed', msg: 'An audit log entry has been removed.' }
                },

                // ══════ Assets & Logistics ══════
                company_cars: {
                    created: { title: 'Company Car Registered', msg: 'A new company car has been registered in the system.' },
                    updated: { title: 'Company Car Updated', msg: 'A company car record has been updated.' },
                    deleted: { title: 'Company Car Removed', msg: 'A company car has been removed from the system.' }
                },
                drivers: {
                    created: { title: 'Driver Registered', msg: 'A new driver has been registered in the system.' },
                    updated: { title: 'Driver Record Updated', msg: 'A driver record has been updated.' },
                    deleted: { title: 'Driver Removed', msg: 'A driver has been removed from the system.' }
                },
                transport_costs: {
                    created: { title: 'Transport Cost Recorded', msg: 'A new transport cost has been recorded.' },
                    updated: { title: 'Transport Cost Updated', msg: 'A transport cost record has been updated.' },
                    deleted: { title: 'Transport Cost Removed', msg: 'A transport cost record has been removed.' }
                },
                properties: {
                    created: { title: 'New Property Added', msg: 'A new property has been added to the system.' },
                    updated: { title: 'Property Details Updated', msg: 'Property details have been updated.' },
                    deleted: { title: 'Property Removed', msg: 'A property has been removed from the system.' }
                },
                materials_inventory: {
                    created: { title: 'Material Added to Inventory', msg: 'A new material has been added to the inventory.' },
                    updated: { title: 'Inventory Updated', msg: 'A material inventory record has been updated.' },
                    deleted: { title: 'Material Removed from Inventory', msg: 'A material has been removed from the inventory.' }
                },
                materials_in: {
                    created: { title: 'Materials Received', msg: 'New materials have been received and recorded in the system.' },
                    updated: { title: 'Materials Receipt Updated', msg: 'A materials receipt record has been updated.' },
                    deleted: { title: 'Materials Receipt Removed', msg: 'A materials receipt record has been removed.' }
                },
                materials_out: {
                    created: { title: 'Materials Issued', msg: 'Materials have been issued out from the inventory.' },
                    updated: { title: 'Materials Issue Updated', msg: 'A materials issue record has been updated.' },
                    deleted: { title: 'Materials Issue Removed', msg: 'A materials issue record has been removed.' }
                },
                assets_equipment: {
                    created: { title: 'New Asset Registered', msg: 'A new asset or equipment has been registered.' },
                    updated: { title: 'Asset Record Updated', msg: 'An asset or equipment record has been updated.' },
                    deleted: { title: 'Asset Removed', msg: 'An asset or equipment has been removed from the system.' }
                },
                office_resources: {
                    created: { title: 'Office Resource Assigned', msg: 'A new office resource has been assigned.' },
                    updated: { title: 'Office Resource Updated', msg: 'An office resource assignment has been updated.' },
                    deleted: { title: 'Office Resource Removed', msg: 'An office resource assignment has been removed.' }
                },

                // ══════ Sales & Clients ══════
                clients: {
                    created: { title: 'New Client Registered', msg: 'A new client has been registered in the system.' },
                    updated: { title: 'Client Record Updated', msg: 'A client record has been updated.' },
                    deleted: { title: 'Client Removed', msg: 'A client has been removed from the system.' }
                },
                sales: {
                    created: { title: 'Sale Recorded', msg: 'A new sale has been recorded in the system.' },
                    updated: { title: 'Sale Updated', msg: 'A sale record has been updated.' },
                    deleted: { title: 'Sale Removed', msg: 'A sale record has been removed.' }
                },
                realestate_work: {
                    created: { title: 'Real Estate Task Created', msg: 'A new real estate task has been created.' },
                    updated: { title: 'Real Estate Task Updated', msg: 'A real estate task has been updated.' },
                    deleted: { title: 'Real Estate Task Removed', msg: 'A real estate task has been removed.' }
                },

                // ══════ Documents & Communication ══════
                schedule_meetings: {
                    created: { title: 'Meeting Scheduled', msg: 'A new meeting has been scheduled.' },
                    updated: { title: 'Meeting Updated', msg: 'A scheduled meeting has been updated.' },
                    deleted: { title: 'Meeting Cancelled', msg: 'A scheduled meeting has been cancelled.' }
                },
                meeting_minutes: {
                    created: { title: 'Meeting Minutes Recorded', msg: 'New meeting minutes have been recorded.' },
                    updated: { title: 'Meeting Minutes Updated', msg: 'Meeting minutes have been updated.' },
                    deleted: { title: 'Meeting Minutes Removed', msg: 'Meeting minutes have been removed.' }
                },
                documents: {
                    created: { title: 'Document Uploaded', msg: 'A new document has been uploaded to the system.' },
                    updated: { title: 'Document Updated', msg: 'A document has been updated.' },
                    deleted: { title: 'Document Removed', msg: 'A document has been removed from the system.' }
                },
                file_uploads: {
                    created: { title: 'File Uploaded', msg: 'A new file has been uploaded to the system.' },
                    updated: { title: 'File Updated', msg: 'An uploaded file has been updated.' },
                    deleted: { title: 'File Removed', msg: 'A file has been removed from the system.' }
                },
                luggage_companies: {
                    created: { title: 'Luggage Company Registered', msg: 'A new luggage company has been registered.' },
                    updated: { title: 'Luggage Company Updated', msg: 'A luggage company record has been updated.' },
                    deleted: { title: 'Luggage Company Removed', msg: 'A luggage company has been removed.' }
                },
                luggage_purchases: {
                    created: { title: 'Luggage Purchase Recorded', msg: 'A new luggage purchase has been recorded.' },
                    updated: { title: 'Luggage Purchase Updated', msg: 'A luggage purchase record has been updated.' },
                    deleted: { title: 'Luggage Purchase Removed', msg: 'A luggage purchase record has been removed.' }
                },
                suggestions: {
                    created: { title: 'New Suggestion Submitted', msg: 'A new suggestion has been submitted by a team member.' },
                    updated: { title: 'Suggestion Updated', msg: 'A suggestion has been updated.' },
                    deleted: { title: 'Suggestion Removed', msg: 'A suggestion has been removed.' }
                },
                notifications: {
                    created: { title: 'System Notification', msg: 'A new system notification has been sent.' },
                    updated: { title: 'Notification Updated', msg: 'A system notification has been updated.' },
                    deleted: { title: 'Notification Removed', msg: 'A system notification has been removed.' }
                },

                // ══════ General / Departments ══════
                departments: {
                    created: { title: 'New Department Created', msg: 'A new department has been created in the system.' },
                    updated: { title: 'Department Updated', msg: 'A department record has been updated.' },
                    deleted: { title: 'Department Removed', msg: 'A department has been removed from the system.' }
                }
            };

            // Determine the action key for the message map
            let actionKey = '';
            if (action === 'New Record Created') actionKey = 'created';
            else if (action === 'Record Updated') actionKey = 'updated';
            else if (action === 'Record Deleted') actionKey = 'deleted';

            let title = '';
            let notificationMessage = '';

            // Look up the table in the message map
            const tableMessages = messageMap[lowerTable];
            if (tableMessages && tableMessages[actionKey]) {
                title = tableMessages[actionKey].title;
                notificationMessage = tableMessages[actionKey].msg;
            } else {
                // Fallback for any table not in the map — still make it readable
                const readableName = table.replace(/_/g, ' ');
                title = `System Update: ${readableName}`;
                if (actionKey === 'created') notificationMessage = `A new ${readableName} entry has been added to the system.`;
                else if (actionKey === 'updated') notificationMessage = `A ${readableName} entry has been updated.`;
                else if (actionKey === 'deleted') notificationMessage = `A ${readableName} entry has been removed from the system.`;
                else notificationMessage = `A change has been made to ${readableName}.`;
            }

            // ── Special overrides for contextual status changes ──
            if (lowerTable === 'projects' && action === 'Record Updated') {
                const statusIdx = columns.findIndex(c => c.toLowerCase() === 'status');
                if (statusIdx !== -1 && (params[statusIdx] === 'Completed' || params[statusIdx] === 'Finished')) {
                    title = 'Project Completed';
                    notificationMessage = 'A project has been marked as completed. Congratulations!';
                }
            }
            if (lowerTable === 'materials_inventory' && action === 'Record Updated') {
                const statusIdx = columns.findIndex(c => c.toLowerCase() === 'status');
                if (statusIdx !== -1 && params[statusIdx] === 'Low Stock') {
                    title = '⚠️ Low Stock Alert';
                    notificationMessage = 'A material in the inventory has reached low stock levels. Please restock as soon as possible.';
                }
            }
            if (lowerTable === 'payment_requests' && action === 'Record Updated') {
                const statusIdx = columns.findIndex(c => c.toLowerCase() === 'status');
                if (statusIdx !== -1 && params[statusIdx] === 'Pending') {
                    title = 'Payment Pending Approval';
                    notificationMessage = 'A payment request is pending and waiting for approval.';
                }
            }

            // Add action buttons for requests and approvals
            let actionButtons = '';
            const requiresApproval = [
                'senior_hiring_requests', 
                'workforce_budgets', 
                'workforce_requests',
                'leave_requests', 
                'payment_requests',
                'work', 'hr_work', 'finance_work', 'realestate_work', 'admin_work',
                'worker_assignments', 'work_approvals', 'violations'
            ];

            if (requiresApproval.some(t => lowerTable.includes(t))) {
                const systemUrl = process.env.PUBLIC_URL || 'https://khashtec-construction-system-production.up.railway.app';

                actionButtons = `
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center;">
                        <p style="margin-bottom: 10px; color: #D32F2F; font-size: 16px; font-weight: bold;">Action Required for this Request</p>
                        <p style="margin-bottom: 20px; color: #555; font-size: 14px;">This request requires your attention. Please log in to the KASHTEC system to review, approve, reject, or request more information.</p>
                        <a href="${systemUrl}" style="display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: sans-serif;">Go to System Dashboard</a>
                    </div>
                `;
            }
            
            // Special override for notification table inserts
            if (lowerTable === 'notifications' && action === 'New Record Created') {
                title = (params && params.length > 0) ? params[0] : 'System Notification';
                const msg = (params && params.length > 1) ? params[1] : 'You have a new notification.';
                notificationMessage = `<span style="white-space: pre-wrap;">${msg}</span>`;
            }

            const https = require('https');
            
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY is not set. Skipping system notification email.');
                return;
            }
            
            const data = JSON.stringify({
                from: process.env.EMAIL_FROM || 'KASHTEC Notification <kashtec@kashtec.co.tz>',
                to: process.env.EMAIL_RECIPIENT || 'tanzanialimitedkashtec@gmail.com',
                subject: 'New System Notification: ' + title,
                html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="background-color: #1a237e; color: white; padding: 20px; text-align: center;">
                                <h2 style="margin: 0; font-size: 24px;">KASHTEC System Alert</h2>
                            </div>
                            <div style="padding: 25px; background-color: #ffffff;">
                                <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #2196F3; padding-bottom: 10px; display: inline-block;">${title}</h3>
                                <div style="margin: 20px 0; background-color: #f5f5f5; padding: 20px; border-left: 4px solid #2196F3; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 16px; color: #444; line-height: 1.5;">${notificationMessage}</p>
                                </div>
                                ${actionButtons}
                            </div>
                            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #eee;">
                                <p style="margin: 0; font-size: 12px; color: #888;">This is an automated system notification from KASHTEC Construction Management System.</p>
                            </div>
                        </div>`
            });

            const req = https.request({
                hostname: 'api.resend.com',
                port: 443,
                path: '/emails',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            }, (res) => {
                res.on('data', () => {}); // Consume data
            });

            req.on('error', (e) => console.error('Error sending Resend email:', e.message));
            req.write(data);
            req.end();
        } catch (err) {
            console.error('Failed to process system notification email:', err.message);
        }
    }

    async execute(query, params = []) {
        // Try to execute query with retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (!this.isConnected) {
                    await this.connect();
                }
                
                const [rows] = await this.pool.execute(query, params);

                return rows;
            } catch (error) {
                // Handle connection-specific errors
                if (this.isConnectionError(error) && attempt < 3) {
                    console.warn(`⚠️ Connection error on attempt ${attempt}, retrying...`);
                    this.isConnected = false;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Wait before retry
                    continue;
                }
                throw error;
            }
        }
    }

    isConnectionError(error) {
        const connectionErrors = [
            'PROTOCOL_CONNECTION_LOST',
            'ECONNRESET',
            'ENOTFOUND',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'Connection lost: The server closed the connection'
        ];
        
        return connectionErrors.some(err => 
            error.code === err || 
            error.message?.includes(err) ||
            error.code === 'PROTOCOL_CONNECTION_LOST'
        );
    }

    async query(sql, params = []) {
        // Use pool.query() instead of pool.execute() for DDL support
        // pool.execute() uses prepared statements which don't support ALTER TABLE, CREATE TABLE, etc.
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (!this.isConnected) {
                    await this.connect();
                }
                
                const [rows] = await this.pool.query(sql, params);
                
                return rows;
            } catch (error) {
                if (this.isConnectionError(error) && attempt < 3) {
                    console.warn(`⚠️ Connection error on query attempt ${attempt}, retrying...`);
                    this.isConnected = false;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
                throw error;
            }
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('Database connection closed');
        }
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected' };
            }
            
            const result = await this.execute('SELECT 1 as health');
            return { 
                status: 'connected', 
                timestamp: new Date().toISOString(),
                result: result[0]
            };
        } catch (error) {
            return { 
                status: 'error', 
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create singleton instance
const db = new Database();

// Don't auto-connect on module load - let server start first
// db.connect().catch(console.error);

module.exports = db;
