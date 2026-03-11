// Frontend Database API Connector
class DatabaseAPI {
    constructor() {
        this.baseURL = window.location.origin + '/api';
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // GET requests
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST requests
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT requests
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE requests
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Users
    async getUsers() {
        return this.get('/users');
    }

    async addUser(userData) {
        return this.post('/users', userData);
    }

    // Projects
    async getProjects() {
        return this.get('/projects');
    }

    async addProject(projectData) {
        return this.post('/projects', projectData);
    }

    async updateProject(id, projectData) {
        return this.put(`/projects/${id}`, projectData);
    }

    // Employees
    async getEmployees() {
        return this.get('/employees');
    }

    // Properties
    async getProperties() {
        return this.get('/properties');
    }

    // Financial Transactions
    async getTransactions() {
        return this.get('/transactions');
    }

    async addTransaction(transactionData) {
        return this.post('/transactions', transactionData);
    }

    // HSE Incidents
    async getIncidents() {
        return this.get('/incidents');
    }

    // Dashboard Statistics
    async getDashboardStats() {
        return this.get('/dashboard/stats');
    }

    // Database Health Check
    async checkDatabaseHealth() {
        return this.get('/db-health');
    }
}

// Create global instance
window.dbAPI = new DatabaseAPI();

// Utility functions for UI
window.DatabaseUI = {
    // Load and display users
    async loadUsers() {
        try {
            const response = await window.dbAPI.getUsers();
            if (response.success) {
                this.displayUsers(response.data);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError('Failed to load users');
        }
    },

    // Load and display projects
    async loadProjects() {
        try {
            const response = await window.dbAPI.getProjects();
            if (response.success) {
                this.displayProjects(response.data);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.showError('Failed to load projects');
        }
    },

    // Load and display dashboard stats
    async loadDashboardStats() {
        try {
            const response = await window.dbAPI.getDashboardStats();
            if (response.success) {
                this.displayStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.showError('Failed to load dashboard statistics');
        }
    },

    // Display users in table
    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.department}</td>
                <td><span class="status ${user.status.toLowerCase()}">${user.status}</span></td>
            </tr>
        `).join('');
    },

    // Display projects in table
    displayProjects(projects) {
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;

        tbody.innerHTML = projects.map(project => `
            <tr>
                <td>${project.id}</td>
                <td>${project.name}</td>
                <td>${project.location}</td>
                <td><span class="status ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span></td>
                <td>${project.budget ? 'TZS ' + Number(project.budget).toLocaleString() : 'N/A'}</td>
                <td>${project.manager_name || 'N/A'}</td>
            </tr>
        `).join('');
    },

    // Display dashboard statistics
    displayStats(stats) {
        const elements = {
            totalUsers: document.getElementById('totalUsers'),
            totalProjects: document.getElementById('totalProjects'),
            totalProperties: document.getElementById('totalProperties'),
            totalIncome: document.getElementById('totalIncome')
        };

        if (elements.totalUsers) elements.totalUsers.textContent = stats.users || 0;
        if (elements.totalProjects) elements.totalProjects.textContent = stats.projects || 0;
        if (elements.totalProperties) elements.totalProperties.textContent = stats.properties || 0;
        if (elements.totalIncome) elements.totalIncome.textContent = 'TZS ' + Number(stats.total_income || 0).toLocaleString();
    },

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    },

    // Show success message
    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        } else {
            console.log('Success:', message);
        }
    },

    // Check database connection
    async checkDatabaseConnection() {
        try {
            const response = await window.dbAPI.checkDatabaseHealth();
            const statusElement = document.getElementById('dbStatus');
            
            if (statusElement) {
                if (response.status === 'OK') {
                    statusElement.innerHTML = '<span style="color: green;">✅ Connected</span>';
                } else {
                    statusElement.innerHTML = '<span style="color: red;">❌ Disconnected</span>';
                }
            }
        } catch (error) {
            const statusElement = document.getElementById('dbStatus');
            if (statusElement) {
                statusElement.innerHTML = '<span style="color: red;">❌ Error</span>';
            }
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check database connection on page load
    window.DatabaseUI.checkDatabaseConnection();
    
    // Load dashboard stats if dashboard elements exist
    if (document.getElementById('totalUsers') || document.getElementById('totalProjects')) {
        window.DatabaseUI.loadDashboardStats();
    }
});
