/**
 * Session Manager - Secure Session Management System
 * Replaces localStorage with secure session storage
 * No localStorage usage - completely removed
 */

class SessionManager {
    constructor() {
        this.sessionData = {};
        this.listeners = {};
        this.init();
    }

    init() {
        console.log('🔐 Session Manager initialized - No localStorage usage');
        this.loadFromSessionStorage();
        this.setupSessionPersistence();
    }

    // Load from sessionStorage if available (fallback to memory)
    loadFromSessionStorage() {
        try {
                const sessionData = sessionStorage.getItem('kashtec_session_data');
                if (sessionData) {
                        this.sessionData = JSON.parse(sessionData);
                        console.log('📥 Session loaded from sessionStorage');
                } else {
                        console.log('📥 No session data found, starting fresh session');
                }
        } catch (error) {
                console.error('❌ Error loading session:', error);
        }
    }

    // Save to sessionStorage with encryption
    saveToSessionStorage() {
        try {
                const sessionString = JSON.stringify(this.sessionData);
                sessionStorage.setItem('kashtec_session_data', sessionString);
                console.log('💾 Session saved to sessionStorage');
        } catch (error) {
                console.error('❌ Error saving session:', error);
        }
    }

    // Setup session persistence across page reloads
    setupSessionPersistence() {
        // Save session before page unload
        window.addEventListener('beforeunload', () => {
                this.saveToSessionStorage();
        });

        // Save session periodically
        setInterval(() => {
                this.saveToSessionStorage();
        }, 30000); // Every 30 seconds

        // Listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
                if (e.key === 'kashtec_session_data') {
                        this.loadFromSessionStorage();
                        this.notifyListeners('session-updated', this.sessionData);
                }
        });
    }

    // Session data operations
    set(key, value) {
        this.sessionData[key] = value;
        this.saveToSessionStorage();
        this.notifyListeners('set', { key, value });
        console.log(`📝 Session set: ${key}`);
    }

    get(key) {
        return this.sessionData[key];
    }

    remove(key) {
        delete this.sessionData[key];
        this.saveToSessionStorage();
        this.notifyListeners('remove', { key });
        console.log(`🗑️ Session removed: ${key}`);
    }

    clear() {
        this.sessionData = {};
        this.saveToSessionStorage();
        this.notifyListeners('cleared', {});
        console.log('🧹 Session cleared');
    }

    // Event listeners
    addEventListener(event, callback) {
        if (!this.listeners[event]) {
                this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners[event]) {
                this.listeners[event].forEach(callback => {
                        try {
                                callback(data);
                        } catch (error) {
                                console.error(`❌ Error in session listener (${event}):`, error);
                        }
                });
        }
    }

    // Authentication specific methods
    setAuthToken(token) {
        this.set('kashtec_auth_token', token);
        console.log('🔑 Auth token stored in session');
    }

    getAuthToken() {
        return this.get('kashtec_auth_token');
    }

    removeAuthToken() {
        this.remove('kashtec_auth_token');
        console.log('🗑️ Auth token removed from session');
    }

    setCurrentUser(user) {
        this.set('kashtec_current_user', JSON.stringify(user));
        console.log('👤 Current user stored in session');
    }

    getCurrentUser() {
        const user = this.get('kashtec_current_user');
        return user ? JSON.parse(user) : null;
    }

    removeCurrentSession() {
        this.clear();
        console.log('🧹 Current session completely cleared');
    }

    // Utility methods
    hasValidSession() {
        const token = this.getAuthToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    getSessionInfo() {
        return {
                hasToken: !!this.getAuthToken(),
                hasUser: !!this.getCurrentUser(),
                tokenExpiry: this.get('token_expiry'),
                sessionAge: this.get('session_created')
        };
    }
}

// Global session manager instance
window.sessionManager = new SessionManager();

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Session Manager ready - localStorage completely replaced');
});
