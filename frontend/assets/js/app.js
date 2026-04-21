// ===== MAIN APPLICATION CONTROLLER =====
class App {
    constructor() {
        this.currentDepartment = null;
        this.initializeApp();
    }

    initializeApp() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        console.log('KASHTEC Construction Management System initialized');
        
        // Set up module loader
        this.setupModuleLoader();
        
        // Set up global error handling
        this.setupErrorHandling();
    }

    setupModuleLoader() {
        // Override MenuManager.loadModule to load actual department modules
        const originalLoadModule = MenuManager.loadModule;
        MenuManager.loadModule = (department) => {
            this.loadDepartmentModule(department);
        };
    }

    loadDepartmentModule(department) {
        this.currentDepartment = department;
        
        // Clear previous content
        UIController.showContent('<div class="loading">Loading module...</div>');
        
        // Load specific department module
        setTimeout(() => {
            switch (department) {
                case 'md':
                    this.loadMDModule();
                    break;
                case 'admin':
                    this.loadAdminModule();
                    break;
                case 'hr':
                    this.loadHRModule();
                    break;
                case 'hse':
                    this.loadHSEModule();
                    break;
                case 'finance':
                    this.loadFinanceModule();
                    break;
                case 'projects':
                    this.loadProjectsModule();
                    break;
                case 'realestate':
                    this.loadRealEstateModule();
                    break;
                case 'assistant':
                    this.loadAssistantModule();
                    break;
                default:
                    UIController.showContent('<div class="card"><h3>Module Not Found</h3><p>This module is not available.</p></div>');
            }
        }, 500);
    }

    loadMDModule() {
        const mdDept = new MDDepartment();
        UIController.showContent(`
            <div class="card">
                <h3>Managing Director Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="mdDept.approveRecruitmentPolicies()">Approve Policies</button>
                    <button class="btn btn-primary" onclick="mdDept.approveSeniorHiring()">Approve Hiring</button>
                    <button class="btn btn-primary" onclick="mdDept.approveWorkforceBudget()">Approve Budget</button>
                    <button class="btn btn-secondary" onclick="mdDept.manageStaff()">Manage Staff</button>
                    <button class="btn btn-secondary" onclick="mdDept.generateWorkforceReport()">Generate Report</button>
                </div>
            </div>
        `);
    }

    loadAdminModule() {
        const adminDept = new AdminDepartment();
        UIController.showContent(`
            <div class="card">
                <h3>Director of Administration Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="adminDept.manageStaff()">Manage Staff</button>
                    <button class="btn btn-primary" onclick="adminDept.companyDocuments()">Company Documents</button>
                    <button class="btn btn-primary" onclick="adminDept.reviewPendingApprovals()">Pending Approvals</button>
                    <button class="btn btn-secondary" onclick="adminDept.monitorCompliance()">Monitor Compliance</button>
                    <button class="btn btn-secondary" onclick="adminDept.exportStaffData()">Export Data</button>
                </div>
            </div>
        `);
    }

    loadHRModule() {
        UIController.showContent(`
            <div class="card">
                <h3>Human Resources Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="NotificationManager.show('HR module loading...', 'info')">Register Employee</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('HR module loading...', 'info')">Create Account</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('HR module loading...', 'info')">Assign Workers</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('HR module loading...', 'info')">Track Attendance</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('HR module loading...', 'info')">Manage Leave</button>
                </div>
            </div>
        `);
    }

    loadHSEModule() {
        UIController.showContent(`
            <div class="card">
                <h3>Health & Safety Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="NotificationManager.show('HSE module loading...', 'info')">Record Incident</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('HSE module loading...', 'info')">Upload Policy</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('HSE module loading...', 'info')">Toolbox Meeting</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('HSE module loading...', 'info')">Manage PPE</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('HSE module loading...', 'info')">Safety Violations</button>
                </div>
            </div>
        `);
    }

    loadFinanceModule() {
        UIController.showContent(`
            <div class="card">
                <h3>Finance Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="NotificationManager.show('Finance module loading...', 'info')">Budget Management</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Finance module loading...', 'info')">Process Payroll</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Finance module loading...', 'info')">Financial Reports</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('Finance module loading...', 'info')">Manage Expenses</button>
                </div>
            </div>
        `);
    }

    loadProjectsModule() {
        UIController.showContent(`
            <div class="card">
                <h3>Projects Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="NotificationManager.show('Projects module loading...', 'info')">Create Project</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Projects module loading...', 'info')">Track Progress</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Projects module loading...', 'info')">Assign Tasks</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('Projects module loading...', 'info')">Site Reports</button>
                </div>
            </div>
        `);
    }

    loadRealEstateModule() {
        UIController.showContent(`
            <div class="card">
                <h3>Real Estate Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="NotificationManager.show('Real Estate module loading...', 'info')">Add Property</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Real Estate module loading...', 'info')">Register Client</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Real Estate module loading...', 'info')">Record Sale</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('Real Estate module loading...', 'info')">Generate Reports</button>
                </div>
            </div>
        `);
    }

    loadAssistantModule() {
        UIController.showContent(`
            <div class="card">
                <h3>Admin Assistant Dashboard</h3>
                <div class="module-actions">
                    <button class="btn btn-primary" onclick="NotificationManager.show('Assistant module loading...', 'info')">Upload Documents</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Assistant module loading...', 'info')">Schedule Meetings</button>
                    <button class="btn btn-primary" onclick="NotificationManager.show('Assistant module loading...', 'info')">Send Notifications</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('Assistant module loading...', 'info')">Meeting Minutes</button>
                    <button class="btn btn-secondary" onclick="NotificationManager.show('Assistant module loading...', 'info')">Employee List</button>
                </div>
            </div>
        `);
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Application Error:', e);
            NotificationManager.show('An unexpected error occurred. Please try again.', 'error', 'System Error');
        });
    }
}

// Initialize the application
window.app = new App();
