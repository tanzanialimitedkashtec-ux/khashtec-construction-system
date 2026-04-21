// ===== OFFICE PORTAL INTEGRATION =====
class OfficePortalIntegration {
    constructor() {
        this.portalUsers = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Office Portal Integration initialized');
    }

    // Automatically assign new employee to office portal
    async assignEmployeeToPortal(employeeData) {
        try {
            // Check if employee already exists in portal
            const existingUser = await this.findUserInPortal(employeeData.email);
            
            if (!existingUser) {
                // Create office portal user entry
                const portalUser = {
                    id: `USR-${Date.now()}`,
                    name: employeeData.full_name,
                    email: employeeData.email,
                    phone: employeeData.phone,
                    role: this.mapRoleToPortal(employeeData.position),
                    department: employeeData.department,
                    employeeId: employeeData.emp_id,
                    position: employeeData.position,
                    serviceType: 'Internal Services',
                    customService: employeeData.position,
                    location: 'Main Office',
                    registrationDate: new Date().toLocaleDateString(),
                    status: 'Active',
                    profileImage: `https://picsum.photos/seed/${employeeData.email}/200/200.jpg`,
                    accessLevel: this.getAccessLevel(employeeData.position),
                    permissions: this.getPermissions(employeeData.position),
                    lastLogin: null,
                    createdAt: new Date().toISOString(),
                    assignedBy: 'System',
                    assignmentType: 'Employee Registration'
                };

                // Save to database via API
                const result = await window.ApiService.createOfficePortalUser(portalUser);
                
                if (result.success) {
                    console.log('Employee automatically assigned to office portal:', portalUser.name);
                    NotificationManager.show(
                        `${employeeData.full_name} has been automatically added to the Office Portal!`, 
                        'success', 
                        'Office Portal Updated'
                    );
                    
                    // Send welcome notification
                    await this.sendWelcomeNotification(portalUser);
                    
                    return portalUser;
                } else {
                    throw new Error(result.error || 'Failed to assign to portal');
                }
            } else {
                console.log('Employee already exists in office portal:', existingUser.name);
                return existingUser;
            }
        } catch (error) {
            console.error('Office portal assignment error:', error);
            NotificationManager.show(error.message, 'error', 'Portal Assignment Error');
            throw error;
        }
    }

    // Automatically assign worker to office portal
    async assignWorkerToPortal(workerData) {
        try {
            // Check if worker already exists in portal
            const existingUser = await this.findUserInPortal(workerData.email);
            
            if (!existingUser) {
                // Create office portal user entry
                const portalUser = {
                    id: `USR-${Date.now()}`,
                    name: workerData.fullName,
                    email: workerData.email,
                    phone: workerData.phone,
                    role: this.mapRoleToPortal(workerData.accountType || 'Worker'),
                    department: workerData.department,
                    employeeId: workerData.employeeId || `WRK-${Date.now().toString().slice(-6)}`,
                    position: workerData.accountType || 'Worker',
                    serviceType: 'Field Services',
                    customService: workerData.department,
                    location: workerData.location || 'Field Operations',
                    registrationDate: new Date().toLocaleDateString(),
                    status: 'Active',
                    profileImage: `https://picsum.photos/seed/${workerData.email}/200/200.jpg`,
                    accessLevel: this.getAccessLevel(workerData.accountType || 'Worker'),
                    permissions: this.getPermissions(workerData.accountType || 'Worker'),
                    lastLogin: null,
                    createdAt: new Date().toISOString(),
                    assignedBy: 'System',
                    assignmentType: 'Worker Registration'
                };

                // Save to database via API
                const result = await window.ApiService.createOfficePortalUser(portalUser);
                
                if (result.success) {
                    console.log('Worker automatically assigned to office portal:', portalUser.name);
                    NotificationManager.show(
                        `${workerData.fullName} has been automatically added to the Office Portal!`, 
                        'success', 
                        'Office Portal Updated'
                    );
                    
                    // Send welcome notification
                    await this.sendWelcomeNotification(portalUser);
                    
                    return portalUser;
                } else {
                    throw new Error(result.error || 'Failed to assign to portal');
                }
            } else {
                console.log('Worker already exists in office portal:', existingUser.name);
                return existingUser;
            }
        } catch (error) {
            console.error('Office portal assignment error:', error);
            NotificationManager.show(error.message, 'error', 'Portal Assignment Error');
            throw error;
        }
    }

    // Find user in portal by email
    async findUserInPortal(email) {
        try {
            const result = await window.ApiService.getOfficePortalUsers();
            if (result.success) {
                return result.data.find(user => user.email === email);
            }
            return null;
        } catch (error) {
            console.error('Find user in portal error:', error);
            return null;
        }
    }

    // Map employee role to portal role
    mapRoleToPortal(position) {
        const roleMapping = {
            'Managing Director': 'Administrator',
            'Director': 'Administrator',
            'Manager': 'Manager',
            'Supervisor': 'Supervisor',
            'Engineer': 'Professional',
            'Technician': 'Technical Staff',
            'Accountant': 'Professional',
            'HR Manager': 'HR Staff',
            'Safety Officer': 'Safety Staff',
            'Project Manager': 'Project Staff',
            'Sales Agent': 'Sales Staff',
            'Administrative Assistant': 'Admin Staff',
            'Worker': 'Field Staff',
            'Laborer': 'Field Staff'
        };

        return roleMapping[position] || 'Staff';
    }

    // Get access level based on position
    getAccessLevel(position) {
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
            'Administrative Assistant': 'Medium Access',
            'Worker': 'Basic Access',
            'Laborer': 'Basic Access'
        };

        return accessLevels[position] || 'Basic Access';
    }

    // Get permissions based on position
    getPermissions(position) {
        const permissions = {
            'Managing Director': ['all'],
            'Director': ['view_all', 'edit_all', 'approve', 'manage_users'],
            'Manager': ['view_department', 'edit_department', 'approve_department'],
            'Supervisor': ['view_team', 'edit_team', 'report_team'],
            'Engineer': ['view_projects', 'edit_projects', 'report_projects'],
            'Accountant': ['view_finance', 'edit_finance', 'report_finance'],
            'HR Manager': ['view_hr', 'edit_hr', 'manage_employees'],
            'Safety Officer': ['view_safety', 'edit_safety', 'report_incidents'],
            'Project Manager': ['view_projects', 'edit_projects', 'manage_resources'],
            'Sales Agent': ['view_sales', 'edit_sales', 'view_clients'],
            'Administrative Assistant': ['view_admin', 'edit_admin', 'manage_documents'],
            'Worker': ['view_assignments', 'report_progress'],
            'Laborer': ['view_assignments', 'report_progress']
        };

        return permissions[position] || ['view_profile'];
    }

    // Send welcome notification to new portal user
    async sendWelcomeNotification(portalUser) {
        try {
            const notificationData = {
                userId: portalUser.id,
                type: 'welcome',
                title: 'Welcome to KASHTEC Office Portal',
                message: `Dear ${portalUser.name},\n\nYou have been automatically added to the KASHTEC Office Portal. You can now access your profile, view your assignments, and manage your work-related information.\n\nYour login credentials:\nEmail: ${portalUser.email}\nInitial Password: ${portalUser.employeeId}\n\nPlease change your password after first login.\n\nBest regards,\nKASHTEC Administration`,
                priority: 'normal',
                channels: ['email', 'portal'],
                scheduledAt: new Date().toISOString()
            };

            const result = await window.ApiService.sendNotification(notificationData);
            
            if (result.success) {
                console.log('Welcome notification sent to:', portalUser.email);
            }
        } catch (error) {
            console.error('Send welcome notification error:', error);
        }
    }

    // Bulk assign existing employees to portal
    async bulkAssignEmployeesToPortal() {
        try {
            NotificationManager.show('Starting bulk assignment to office portal...', 'info', 'Processing');
            
            const employeesResult = await window.ApiService.getEmployees();
            
            if (employeesResult.success) {
                const employees = employeesResult.data;
                let assignedCount = 0;
                let skippedCount = 0;
                
                for (const employee of employees) {
                    try {
                        await this.assignEmployeeToPortal(employee);
                        assignedCount++;
                    } catch (error) {
                        console.error('Failed to assign employee:', employee.full_name, error);
                        skippedCount++;
                    }
                }
                
                NotificationManager.show(
                    `Bulk assignment completed: ${assignedCount} assigned, ${skippedCount} skipped`, 
                    'success', 
                    'Bulk Assignment Complete'
                );
                
                return { assigned: assignedCount, skipped: skippedCount };
            }
        } catch (error) {
            console.error('Bulk assignment error:', error);
            NotificationManager.show('Bulk assignment failed', 'error', 'Error');
            throw error;
        }
    }

    // Get office portal statistics
    async getPortalStatistics() {
        try {
            const result = await window.ApiService.getOfficePortalUsers();
            
            if (result.success) {
                const users = result.data;
                
                const stats = {
                    totalUsers: users.length,
                    activeUsers: users.filter(u => u.status === 'Active').length,
                    inactiveUsers: users.filter(u => u.status === 'Inactive').length,
                    byDepartment: this.groupByDepartment(users),
                    byRole: this.groupByRole(users),
                    byAccessLevel: this.groupByAccessLevel(users),
                    recentAssignments: users.filter(u => {
                        const assignmentDate = new Date(u.createdAt);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return assignmentDate > thirtyDaysAgo;
                    }).length
                };
                
                return stats;
            }
            
            return null;
        } catch (error) {
            console.error('Get portal statistics error:', error);
            return null;
        }
    }

    // Group users by department
    groupByDepartment(users) {
        const grouped = {};
        users.forEach(user => {
            const dept = user.department || 'Unassigned';
            grouped[dept] = (grouped[dept] || 0) + 1;
        });
        return grouped;
    }

    // Group users by role
    groupByRole(users) {
        const grouped = {};
        users.forEach(user => {
            const role = user.role || 'Staff';
            grouped[role] = (grouped[role] || 0) + 1;
        });
        return grouped;
    }

    // Group users by access level
    groupByAccessLevel(users) {
        const grouped = {};
        users.forEach(user => {
            const level = user.accessLevel || 'Basic Access';
            grouped[level] = (grouped[level] || 0) + 1;
        });
        return grouped;
    }

    // Update portal user information
    async updatePortalUser(userId, updateData) {
        try {
            const result = await window.ApiService.updateOfficePortalUser(userId, updateData);
            
            if (result.success) {
                NotificationManager.show('Portal user updated successfully!', 'success', 'User Updated');
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Update portal user error:', error);
            NotificationManager.show(error.message, 'error', 'Update Error');
            throw error;
        }
    }

    // Remove user from portal
    async removeFromPortal(userId) {
        try {
            const result = await window.ApiService.deleteOfficePortalUser(userId);
            
            if (result.success) {
                NotificationManager.show('User removed from portal successfully!', 'success', 'User Removed');
                return true;
            } else {
                throw new Error(result.error || 'Failed to remove user');
            }
        } catch (error) {
            console.error('Remove from portal error:', error);
            NotificationManager.show(error.message, 'error', 'Removal Error');
            throw error;
        }
    }

    // Generate portal access report
    async generatePortalAccessReport() {
        try {
            const stats = await this.getPortalStatistics();
            
            if (stats) {
                const report = {
                    generatedAt: new Date().toISOString(),
                    totalUsers: stats.totalUsers,
                    activeUsers: stats.activeUsers,
                    inactiveUsers: stats.inactiveUsers,
                    recentAssignments: stats.recentAssignments,
                    departmentBreakdown: stats.byDepartment,
                    roleBreakdown: stats.byRole,
                    accessLevelBreakdown: stats.byAccessLevel,
                    summary: {
                        mostActiveDepartment: Object.keys(stats.byDepartment).reduce((a, b) => 
                            stats.byDepartment[a] > stats.byDepartment[b] ? a : b
                        ),
                        mostCommonRole: Object.keys(stats.byRole).reduce((a, b) => 
                            stats.byRole[a] > stats.byRole[b] ? a : b
                        ),
                        activationRate: ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) + '%'
                    }
                };
                
                return report;
            }
            
            return null;
        } catch (error) {
            console.error('Generate portal access report error:', error);
            return null;
        }
    }
}

// Create global instance
window.OfficePortalIntegration = new OfficePortalIntegration();
