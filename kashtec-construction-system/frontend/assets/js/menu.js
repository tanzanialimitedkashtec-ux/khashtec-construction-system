// ===== MENU MANAGEMENT =====
class MenuManager {
    static loadMenu(role) {
        const menu = document.getElementById('menu');
        if (!menu) return;

        menu.innerHTML = '';

        const menuItems = this.getMenuItems(role);
        menuItems.forEach(item => {
            const menuItem = document.createElement('a');
            menuItem.href = '#';
            menuItem.className = 'menu-item';
            menuItem.textContent = item.label;
            menuItem.onclick = () => item.action();
            menu.appendChild(menuItem);
        });
    }

    static getMenuItems(role) {
        const menus = {
            MD: [
                { label: 'Approve Recruitment Policies', action: () => this.loadModule('md') },
                { label: 'Approve Senior Staff Hiring', action: () => this.loadModule('md') },
                { label: 'Approve Workforce Budget', action: () => this.loadModule('md') },
                { label: 'Manage Staff', action: () => this.loadModule('md') },
                { label: 'Generate Workforce Report', action: () => this.loadModule('md') }
            ],
            ADMIN: [
                { label: 'Manage Staff', action: () => this.loadModule('admin') },
                { label: 'Company Documents', action: () => this.loadModule('admin') },
                { label: 'Review Pending Approvals', action: () => this.loadModule('admin') },
                { label: 'Monitor Compliance', action: () => this.loadModule('admin') },
                { label: 'Export Staff Data', action: () => this.loadModule('admin') }
            ],
            HR: [
                { label: 'Register Employee', action: () => this.loadModule('hr') },
                { label: 'Create Worker Account', action: () => this.loadModule('hr') },
                { label: 'Assign Project Workers', action: () => this.loadModule('hr') },
                { label: 'Update Employee Records', action: () => this.loadModule('hr') },
                { label: 'Track Attendance', action: () => this.loadModule('hr') },
                { label: 'Manage Leave Requests', action: () => this.loadModule('hr') },
                { label: 'Manage Contracts', action: () => this.loadModule('hr') }
            ],
            HSE: [
                { label: 'Record Incident Reports', action: () => this.loadModule('hse') },
                { label: 'Upload Safety Policies', action: () => this.loadModule('hse') },
                { label: 'Record Toolbox Meetings', action: () => this.loadModule('hse') },
                { label: 'Manage PPE Issuance', action: () => this.loadModule('hse') },
                { label: 'Mark Safety Violations', action: () => this.loadModule('hse') },
                { label: 'Upload Inspection Reports', action: () => this.loadModule('hse') }
            ],
            FINANCE: [
                { label: 'Budget Management', action: () => this.loadModule('finance') },
                { label: 'Process Payroll', action: () => this.loadModule('finance') },
                { label: 'Generate Financial Reports', action: () => this.loadModule('finance') },
                { label: 'Manage Expenses', action: () => this.loadModule('finance') },
                { label: 'Tax Planning', action: () => this.loadModule('finance') }
            ],
            PROJECT: [
                { label: 'Create New Project', action: () => this.loadModule('projects') },
                { label: 'Track Project Progress', action: () => this.loadModule('projects') },
                { label: 'Assign Tasks', action: () => this.loadModule('projects') },
                { label: 'Request Workforce', action: () => this.loadModule('projects') },
                { label: 'Record Site Reports', action: () => this.loadModule('projects') },
                { label: 'Approve Completed Work', action: () => this.loadModule('projects') }
            ],
            REALESTATE: [
                { label: 'Add Property', action: () => this.loadModule('realestate') },
                { label: 'Edit Property Details', action: () => this.loadModule('realestate') },
                { label: 'Register Client', action: () => this.loadModule('realestate') },
                { label: 'Record Sale', action: () => this.loadModule('realestate') },
                { label: 'Generate Reports', action: () => this.loadModule('realestate') }
            ],
            ASSISTANT: [
                { label: 'Upload Documents', action: () => this.loadModule('assistant') },
                { label: 'Edit Documents', action: () => this.loadModule('assistant') },
                { label: 'Schedule Meetings', action: () => this.loadModule('assistant') },
                { label: 'Send Notifications', action: () => this.loadModule('assistant') },
                { label: 'Record Meeting Minutes', action: () => this.loadModule('assistant') },
                { label: 'View Employee List', action: () => this.loadModule('assistant') },
                { label: 'Office Portal', action: () => this.loadModule('assistant') }
            ]
        };

        return menus[role] || [];
    }

    static loadModule(department) {
        // Dynamic module loading based on department
        NotificationManager.show(`Loading ${department} module...`, 'info', 'Module Loading');
        
        // This would load the specific module content
        // For now, show a placeholder
        const moduleContent = {
            md: '<h3>Managing Director Module</h3><p>MD functionality will be loaded here...</p>',
            admin: '<h3>Director of Administration Module</h3><p>Admin functionality will be loaded here...</p>',
            hr: '<h3>Human Resources Module</h3><p>HR functionality will be loaded here...</p>',
            hse: '<h3>Health & Safety Module</h3><p>HSE functionality will be loaded here...</p>',
            finance: '<h3>Finance Module</h3><p>Finance functionality will be loaded here...</p>',
            projects: '<h3>Projects Module</h3><p>Project functionality will be loaded here...</p>',
            realestate: '<h3>Real Estate Module</h3><p>Real Estate functionality will be loaded here...</p>',
            assistant: '<h3>Admin Assistant Module</h3><p>Assistant functionality will be loaded here...</p>'
        };

        UIController.showContent(moduleContent[department] || '<h3>Module Not Found</h3><p>This module is not available.</p>');
    }
}

// Export for global use
window.MenuManager = MenuManager;
