// ===== AUTHENTICATION MODULE =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.initializeFromSession();
        this.initializeEventListeners();
    }

    initializeFromSession() {
        // Check sessionStorage for authentication state
        const token = sessionStorage.getItem('kashtec_token');
        const userData = sessionStorage.getItem('kashtec_user');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
            } catch (error) {
                console.error('Invalid user data in session:', error);
                this.clearSession();
            }
        }
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    async handleLogin() {
        const roleSelect = document.getElementById('roleSelect');
        const selectedRole = roleSelect.value;
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        if (!selectedRole) {
            NotificationManager.show('Please select a role to continue.', 'error', 'Login Required');
            return;
        }

        try {
            const result = await this.login(username, password, selectedRole);
            this.showSystem();
            MenuManager.loadMenu(selectedRole);
            NotificationManager.show(`Welcome, ${selectedRole}!`, 'success', 'Login Success');
        } catch (error) {
            NotificationManager.show('Invalid username or password.', 'error', 'Login Failed');
        }
    }

    async login(username, password, role) {
        try {
            // Use API service to login
            const result = await window.ApiService.login(username, password, role);
            
            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                
                // Store in sessionStorage only
                sessionStorage.setItem('kashtec_token', result.token);
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
        // Clear all session data
        this.clearSession();
        
        // Use API service to logout
        window.ApiService.logout();
        
        // Redirect to login
        this.redirectToLogin();
    }

    clearSession() {
        sessionStorage.removeItem('kashtec_token');
        sessionStorage.removeItem('kashtec_user');
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    redirectToLogin() {
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('systemPage').classList.add('hidden');
    }

    showSystem() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('systemPage').classList.remove('hidden');
        document.getElementById('userRole').textContent = `${this.currentRole} Dashboard`;
        document.getElementById('userInfo').textContent = `Logged in as: ${this.currentRole}`;
    }
}

// Export for global use
window.AuthManager = new AuthManager();
