// ===== API CONTROLLERS =====
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===== AUTHENTICATION CONTROLLER =====
class AuthController {
    static async login(req, res) {
        try {
            const { username, password, role } = req.body;
            
            if (!username || !password || !role) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields' 
                });
            }
            
            // For demo, check against hardcoded users
            // In production, this would query the database
            const validCredentials = [
                { username: 'md', password: '$2b$10$12$MD5hash', role: 'MD' },
                { username: 'admin', password: '$2b$10$12$ADMINhash', role: 'ADMIN' },
                { username: 'hr', password: '$2b$10$12$HRhash', role: 'HR' },
                { username: 'hse', password: '$2b$10$12$HSEhash', role: 'HSE' },
                { username: 'finance', password: '$2b$10$12$FINANCEhash', role: 'FINANCE' },
                { username: 'projects', password: '$2b$10$12$PROJECThash', role: 'PROJECT' },
                { username: 'realestate', password: '$2b$10$12$REALESTATEhash', role: 'REALESTATE' },
                { username: 'assistant', password: '$2b$10$12$ASSISTANThash', role: 'ASSISTANT' }
            ];
            
            const user = validCredentials.find(u => u.username === username && u.password === password && u.role === role);
            
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid credentials' 
                });
            }
            
            // Generate JWT token
            const token = jwt.sign(
                { id: user.username, role: user.role },
                process.env.JWT_SECRET || 'fallback-secret-key',
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                token,
                user: { id: user.username, role: user.role }
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    static async verifyToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                error: 'No token provided' 
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }
    }
}

// ===== OFFICE PORTAL CONTROLLER =====
class OfficePortalController {
    static async getUsers(req, res) {
        try {
            const connection = await db.getConnection();
            const [users] = await connection.query('SELECT * FROM office_portal_users ORDER BY created_at DESC');
            connection.release();
            res.json({ success: true, data: users });
        } catch (error) {
            console.error('Fetch portal users error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch portal users' 
            });
        }
    }

    static async createUser(req, res) {
        try {
            const userData = req.body;
            
            if (!userData.name || !userData.email) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields' 
                });
            }
            
            const connection = await db.getConnection();
            
            // Check if user already exists
            const [existing] = await connection.query(
                'SELECT id FROM office_portal_users WHERE email = ?',
                [userData.email]
            );
            
            if (existing.length > 0) {
                connection.release();
                return res.status(400).json({ 
                    success: false, 
                    error: 'User already exists in portal' 
                });
            }
            
            await connection.query(
                'INSERT INTO office_portal_users (id, name, email, phone, role, department, employee_id, position, service_type, location, registration_date, status, profile_image, access_level, created_at, assigned_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    userData.id || `USR-${Date.now()}`,
                    userData.name,
                    userData.email,
                    userData.phone,
                    userData.role,
                    userData.department,
                    userData.employeeId,
                    userData.position,
                    userData.serviceType,
                    userData.location,
                    userData.registrationDate || new Date().toLocaleDateString(),
                    userData.status || 'Active',
                    userData.profileImage,
                    userData.accessLevel,
                    new Date().toISOString(),
                    userData.assignedBy || 'System'
                ]
            );
            
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Portal user created successfully',
                data: userData
            });
        } catch (error) {
            console.error('Create portal user error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create portal user' 
            });
        }
    }

    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const connection = await db.getConnection();
            await connection.query('UPDATE office_portal_users SET ? WHERE id = ?', [updates, id]);
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Portal user updated successfully' 
            });
        } catch (error) {
            console.error('Update portal user error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to update portal user' 
            });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            const connection = await db.getConnection();
            await connection.query('DELETE FROM office_portal_users WHERE id = ?', [id]);
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Portal user deleted successfully' 
            });
        } catch (error) {
            console.error('Delete portal user error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to delete portal user' 
            });
        }
    }

    static async sendNotification(req, res) {
        try {
            const notificationData = req.body;
            
            const connection = await db.getConnection();
            await connection.query(
                'INSERT INTO office_portal_notifications (user_id, type, title, message, priority, channels, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    notificationData.userId,
                    notificationData.type,
                    notificationData.title,
                    notificationData.message,
                    notificationData.priority,
                    JSON.stringify(notificationData.channels),
                    notificationData.scheduledAt
                ]
            );
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Notification sent successfully' 
            });
        } catch (error) {
            console.error('Send notification error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send notification' 
            });
        }
    }

    static async getNotifications(req, res) {
        try {
            const { userId } = req.query;
            
            let query = 'SELECT * FROM office_portal_notifications';
            let params = [];
            
            if (userId) {
                query += ' WHERE user_id = ?';
                params.push(userId);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const connection = await db.getConnection();
            const [notifications] = await connection.query(query, params);
            connection.release();
            
            res.json({ success: true, data: notifications });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch notifications' 
            });
        }
    }

    static async getStatistics(req, res) {
        try {
            const connection = await db.getConnection();
            
            const [totalUsers] = await connection.query('SELECT COUNT(*) as count FROM office_portal_users');
            const [activeUsers] = await connection.query('SELECT COUNT(*) as count FROM office_portal_users WHERE status = "Active"');
            const [byDepartment] = await connection.query('SELECT department, COUNT(*) as count FROM office_portal_users GROUP BY department');
            const [byRole] = await connection.query('SELECT role, COUNT(*) as count FROM office_portal_users GROUP BY role');
            
            connection.release();
            
            res.json({ 
                success: true, 
                data: {
                    totalUsers: totalUsers[0].count,
                    activeUsers: activeUsers[0].count,
                    byDepartment,
                    byRole
                }
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch statistics' 
            });
        }
    }
}

// ===== EMPLOYEE CONTROLLER =====
class EmployeeController {
    static async getAll(req, res) {
        try {
            const connection = await db.getConnection();
            const [employees] = await connection.query('SELECT * FROM employees ORDER BY created_at DESC');
            connection.release();
            res.json(employees);
        } catch (error) {
            console.error('Fetch employees error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch employees' 
            });
        }
    }

    static async create(employeeData) {
        try {
            const { full_name, phone, email, position, department, job_category, contract, salary, hire_date, status } = employeeData;
            
            if (!full_name || !phone || !email || !position || !department) {
                return { 
                    success: false, 
                    error: 'Missing required fields' 
                };
            }
            
            const emp_id = `EMP${Date.now().toString().slice(-6)}`;
            
            const connection = await db.getConnection();
            await connection.query(
                'INSERT INTO employees (emp_id, full_name, phone, email, position, department, job_category, contract, salary, hire_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [emp_id, full_name, phone, email, position, department, job_category, contract, salary, hire_date, status, employeeData.user?.id || 'system']
            );
            connection.release();
            
            // Automatically assign to office portal
            try {
                const portalUser = {
                    emp_id,
                    full_name,
                    phone,
                    email,
                    position,
                    department
                };
                await this.assignToOfficePortal(portalUser);
            } catch (portalError) {
                console.error('Portal assignment error:', portalError);
                // Don't fail the employee creation if portal assignment fails
            }
            
            return { 
                success: true, 
                message: 'Employee created successfully and added to Office Portal', 
                emp_id 
            };
        } catch (error) {
            console.error('Employee creation error:', error);
            return { 
                success: false, 
                error: 'Failed to create employee' 
            };
        }
    }

    static async assignToOfficePortal(employeeData) {
        try {
            const connection = await db.getConnection();
            
            // Check if user already exists in portal
            const [existing] = await connection.query(
                'SELECT id FROM office_portal_users WHERE email = ?',
                [employeeData.email]
            );
            
            if (existing.length === 0) {
                // Map position to portal role
                const roleMapping = {
                    'Managing Director': 'Administrator',
                    'Director': 'Administrator',
                    'Manager': 'Manager',
                    'Supervisor': 'Supervisor',
                    'Engineer': 'Professional',
                    'Accountant': 'Professional',
                    'HR Manager': 'HR Staff',
                    'Safety Officer': 'Safety Staff',
                    'Project Manager': 'Project Staff',
                    'Sales Agent': 'Sales Staff',
                    'Administrative Assistant': 'Admin Staff'
                };
                
                const portalRole = roleMapping[employeeData.position] || 'Staff';
                const accessLevel = this.getAccessLevel(employeeData.position);
                
                await connection.query(
                    'INSERT INTO office_portal_users (id, name, email, phone, role, department, employee_id, position, service_type, location, registration_date, status, profile_image, access_level, created_at, assigned_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        `USR-${Date.now()}`,
                        employeeData.full_name,
                        employeeData.email,
                        employeeData.phone,
                        portalRole,
                        employeeData.department,
                        employeeData.emp_id,
                        employeeData.position,
                        'Internal Services',
                        'Main Office',
                        new Date().toLocaleDateString(),
                        'Active',
                        `https://picsum.photos/seed/${employeeData.email}/200/200.jpg`,
                        accessLevel,
                        new Date().toISOString(),
                        'System'
                    ]
                );
                
                console.log('Employee automatically assigned to office portal:', employeeData.full_name);
            }
            
            connection.release();
        } catch (error) {
            console.error('Office portal assignment error:', error);
            throw error;
        }
    }

    static getAccessLevel(position) {
        const accessLevels = {
            'Managing Director': 'Full Access',
            'Director': 'Full Access',
            'Manager': 'High Access',
            'Supervisor': 'Medium Access',
            'Engineer': 'Medium Access',
            'Accountant': 'Medium Access',
            'HR Manager': 'High Access',
            'Safety Officer': 'Medium Access',
            'Project Manager': 'High Access',
            'Sales Agent': 'Low Access',
            'Administrative Assistant': 'Medium Access'
        };
        
        return accessLevels[position] || 'Basic Access';
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const connection = await db.getConnection();
            await connection.query('UPDATE employees SET ? WHERE id = ?', [updates, id]);
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Employee updated successfully' 
            });
        } catch (error) {
            console.error('Employee update error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to update employee' 
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const connection = await db.getConnection();
            await connection.query('DELETE FROM employees WHERE id = ?', [id]);
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Employee deleted successfully' 
            });
        } catch (error) {
            console.error('Employee deletion error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to delete employee' 
            });
        }
    }
}

// ===== PROPERTY CONTROLLER =====
class PropertyController {
    static async getAll(req, res) {
        try {
            const connection = await db.getConnection();
            const [properties] = await connection.query('SELECT * FROM properties ORDER BY created_at DESC');
            connection.release();
            res.json(properties);
        } catch (error) {
            console.error('Fetch properties error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch properties' 
            });
        }
    }

    static async create(req, res) {
        try {
            const { plot_number, type, location, area, price, status, description } = req.body;
            
            if (!plot_number || !type || !location || !area || !price) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields' 
                });
            }
            
            const propertyId = `PROP${Date.now().toString().slice(-6)}`;
            
            const connection = await db.getConnection();
            await connection.query(
                'INSERT INTO properties (plot_number, type, location, area, price, status, description, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [plot_number, type, location, area, price, status, description, req.user?.id || 'system']
            );
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Property created successfully', 
                property_id: propertyId 
            });
        } catch (error) {
            console.error('Property creation error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create property' 
            });
        }
    }
}

// ===== CLIENT CONTROLLER =====
class ClientController {
    static async getAll(req, res) {
        try {
            const connection = await db.getConnection();
            const [clients] = await connection.query('SELECT * FROM clients ORDER BY registration_date DESC');
            connection.release();
            res.json(clients);
        } catch (error) {
            console.error('Fetch clients error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch clients' 
            });
        }
    }

    static async create(req, res) {
        try {
            const { type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes } = req.body;
            
            if (!type || !full_name || !phone || !email) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields' 
                });
            }
            
            const clientId = `CLT${Date.now().toString().slice(-6)}`;
            
            const connection = await db.getConnection();
            await connection.query(
                'INSERT INTO clients (type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes, registered_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [type, full_name, company_name, phone, email, nida, tin, address, property_interest, budget_range, notes, req.user?.id || 'system']
            );
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Client created successfully', 
                client_id: clientId 
            });
        } catch (error) {
            console.error('Client creation error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create client' 
            });
        }
    }
}

// ===== PROJECT CONTROLLER =====
class ProjectController {
    static async getAll(req, res) {
        try {
            const connection = await db.getConnection();
            const [projects] = await connection.query('SELECT * FROM projects ORDER BY created_at DESC');
            connection.release();
            res.json(projects);
        } catch (error) {
            console.error('Fetch projects error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch projects' 
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, description, start_date, budget } = req.body;
            
            if (!name || !start_date) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields' 
                });
            }
            
            const projectId = `PROJ${Date.now().toString().slice(-6)}`;
            
            const connection = await db.getConnection();
            await connection.query(
                'INSERT INTO projects (name, description, start_date, budget, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, start_date, budget, 'planning', req.user?.id || 'system']
            );
            connection.release();
            
            res.json({ 
                success: true, 
                message: 'Project created successfully', 
                project_id: projectId 
            });
        } catch (error) {
            console.error('Project creation error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create project' 
            });
        }
    }
}

module.exports = {
    AuthController,
    OfficePortalController,
    EmployeeController,
    PropertyController,
    ClientController,
    ProjectController
};
