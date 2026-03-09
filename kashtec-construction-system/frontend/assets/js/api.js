// ===== API SERVICE =====
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token') || null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ===== AUTHENTICATION METHODS =====
    async login(username, password, role) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role })
            });

            const result = await response.json();
            
            if (result.success) {
                this.token = result.token;
                this.currentUser = result.user;
                
                // Store in sessionStorage (not localStorage)
                sessionStorage.setItem('kashtec_token', this.token);
                sessionStorage.setItem('kashtec_user', JSON.stringify(this.currentUser));
                
                return result;
            } else {
                throw new Error(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        // Clear session storage only
        sessionStorage.removeItem('kashtec_token');
        sessionStorage.removeItem('kashtec_user');
        this.token = null;
        this.currentUser = null;
    }

    // ===== EMPLOYEE METHODS =====
    async getEmployees() {
        try {
            const employees = await this.get('/employees');
            return employees;
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            throw error;
        }
    }

    async createEmployee(employeeData) {
        try {
            const response = await this.post('/employees', employeeData);
            
            if (response.success) {
                NotificationManager.show('Employee created successfully!', 'success', 'Success');
                return response;
            } else {
                throw new Error(response.error || 'Failed to create employee');
            }
        } catch (error) {
            console.error('Employee creation error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
            throw error;
        }
    }

    async updateEmployee(id, employeeData) {
        try {
            const response = await this.put(`/employees/${id}`, employeeData);
            
            if (response.success) {
                NotificationManager.show('Employee updated successfully!', 'success', 'Success');
                return response;
            } else {
                throw new Error(response.error || 'Failed to update employee');
            }
        } catch (error) {
            console.error('Employee update error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
            throw error;
        }
    }

    // ===== PROPERTY METHODS =====
    async getProperties() {
        try {
            const properties = await this.get('/properties');
            return properties;
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            throw error;
        }
    }

    async createProperty(propertyData) {
        try {
            const response = await this.post('/properties', propertyData);
            
            if (response.success) {
                NotificationManager.show('Property added successfully!', 'success', 'Success');
                return response;
            } else {
                throw new Error(response.error || 'Failed to create property');
            }
        } catch (error) {
            console.error('Property creation error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
            throw error;
        }
    }

    // ===== CLIENT METHODS =====
    async getClients() {
        try {
            const clients = await this.get('/clients');
            return clients;
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            throw error;
        }
    }

    async createClient(clientData) {
        try {
            const response = await this.post('/clients', clientData);
            
            if (response.success) {
                NotificationManager.show('Client registered successfully!', 'success', 'Success');
                return response;
            } else {
                throw new Error(response.error || 'Failed to create client');
            }
        } catch (error) {
            console.error('Client creation error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
            throw error;
        }
    }

    // ===== PROJECT METHODS =====
    async getProjects() {
        try {
            const projects = await this.get('/projects');
            return projects;
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            throw error;
        }
    }

    async createProject(projectData) {
        try {
            const response = await this.post('/projects', projectData);
            
            if (response.success) {
                NotificationManager.show('Project created successfully!', 'success', 'Success');
                return response;
            } else {
                throw new Error(response.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Project creation error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
            throw error;
        }
    }

    // ===== UTILITY METHODS =====
    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Export for global use
window.ApiService = new ApiService();
