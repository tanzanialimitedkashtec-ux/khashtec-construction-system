// Frontend Configuration
// These variables are available for frontend use if needed
// The frontend primarily uses API endpoints, but these are available for direct database access if required

window.APP_CONFIG = {
    // Database Configuration (Read-only for frontend)
    DATABASE: {
        URL: "mysql://root:LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz@centerbeam.proxy.rlwy.net:11044/railway",
        HOST: "centerbeam.proxy.rlwy.net",
        USER: "root",
        PASSWORD: "LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz",
        NAME: "railway",
        PORT: "11044"
    },
    
    // Application Configuration
    APP: {
        NAME: "KASHTEC Construction Management System",
        VERSION: "1.0.0",
        ENVIRONMENT: "production",
        API_BASE_URL: window.location.origin + '/api'
    },
    
    // Security Configuration
    SECURITY: {
        JWT_SECRET: "kashtec-secret-key-2024",
        CORS_ORIGIN: "*"
    }
};

// Log configuration for debugging
console.log('Frontend Configuration Loaded:', {
    database: 'configured',
    api_base: window.APP_CONFIG.APP.API_BASE_URL,
    environment: window.APP_CONFIG.APP.ENVIRONMENT
});
