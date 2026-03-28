// ===== API SERVICE FOR KASHTEC CONSTRUCTION SYSTEM =====
// This file replaces all localStorage usage with secure database API calls

// Dynamic API base URL - works in both development and production
const API_BASE_URL = window.location.origin === 'http://localhost:3000' || window.location.origin === 'https://localhost:3000'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

// ===== AUTHENTICATION =====
async function login(username, password, role) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        });
        
        const data = await response.json();
        if (data.success) {
            // Store token securely (TODO: Implement secure storage)
            sessionStorage.setItem('kashtec_token', data.token);
            sessionStorage.setItem('kashtec_user', JSON.stringify(data.user));
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
    }
}

function getAuthToken() {
    return sessionStorage.getItem('kashtec_token');
}

function getCurrentUser() {
    const user = sessionStorage.getItem('kashtec_user');
    return user ? JSON.parse(user) : null;
}

// ===== API HELPER FUNCTION =====
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Clear stored auth data and redirect to login
                sessionStorage.removeItem('kashtec_token');
                sessionStorage.removeItem('kashtec_user');
                window.location.reload(); // This will redirect to login
                throw new Error('Authentication expired. Please login again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// ===== COMPREHENSIVE DEPARTMENT DATA API =====

// Get all department data
async function getAllDepartmentData() {
    return await apiCall('/departments/all');
}

// Get department statistics
async function getDepartmentStats() {
    return await apiCall('/stats');
}

// ===== EMPLOYEE MANAGEMENT API =====

// Create new employee
async function createEmployee(employeeData) {
    return await apiCall('/employees', 'POST', employeeData);
}

// Get all employees
async function getEmployees() {
    return await apiCall('/employees');
}

// Update employee
async function updateEmployee(id, employeeData) {
    return await apiCall(`/employees/${id}`, 'PUT', employeeData);
}

// Delete employee
async function deleteEmployee(id) {
    return await apiCall(`/employees/${id}`, 'DELETE');
}

// ===== HR DEPARTMENT API =====

// Create HR work record
async function createHRWork(workData) {
    return await apiCall('/hr/work', 'POST', workData);
}

// Get HR work records
async function getHRWork() {
    return await apiCall('/hr/work');
}

// ===== FINANCE DEPARTMENT API =====

// Create Finance work record
async function createFinanceWork(workData) {
    return await apiCall('/finance/work', 'POST', workData);
}

// Get Finance work records
async function getFinanceWork() {
    return await apiCall('/finance/work');
}

// ===== HSE DEPARTMENT API =====

// Create HSE work record
async function createHSEWork(workData) {
    return await apiCall('/hse/work', 'POST', workData);
}

// Get HSE work records
async function getHSEWork() {
    return await apiCall('/hse/work');
}

// ===== PROJECT DEPARTMENT API =====

// Create Project work record
async function createProjectWork(workData) {
    return await apiCall('/project/work', 'POST', workData);
}

// Get Project work records
async function getProjectWork() {
    return await apiCall('/project/work');
}

// ===== REAL ESTATE DEPARTMENT API =====

// Create Real Estate work record
async function createRealEstateWork(workData) {
    return await apiCall('/realestate/work', 'POST', workData);
}

// Get Real Estate work records
async function getRealEstateWork() {
    return await apiCall('/realestate/work');
}

// ===== ADMIN DEPARTMENT API =====

// Create Admin work record
async function createAdminWork(workData) {
    return await apiCall('/admin/work', 'POST', workData);
}

// Get Admin work records
async function getAdminWork() {
    return await apiCall('/admin/work');
}

// ===== POLICIES API =====

// Get all policies
async function getPolicies() {
    return await apiCall('/policies');
}

// Get policy by ID
async function getPolicyById(id) {
    return await apiCall(`/policies/${id}`);
}

// Approve policy
async function approvePolicy(id, approvedBy) {
    return await apiCall(`/policies/${id}/approve`, 'POST', { approvedBy });
}

// Reject policy
async function rejectPolicy(id, rejectionReason, rejectedBy) {
    return await apiCall(`/policies/${id}/reject`, 'POST', { rejectionReason, rejectedBy });
}

// Request policy revision
async function requestPolicyRevision(id, revisionRequest, requestedBy) {
    return await apiCall(`/policies/${id}/revision`, 'POST', { revisionRequest, requestedBy });
}

// Get policy revisions
async function getPolicyRevisions(id) {
    return await apiCall(`/policies/${id}/revisions`);
}

// Get policy rejections
async function getPolicyRejections(id) {
    return await apiCall(`/policies/${id}/rejections`);
}

// ===== SENIOR HIRING API =====

// Create senior hiring request
async function createSeniorHiringRequest(hiringData) {
    return await apiCall('/senior-hiring', 'POST', hiringData);
}

// Get senior hiring requests
async function getSeniorHiringRequests() {
    return await apiCall('/senior-hiring');
}

// ===== WORKFORCE BUDGET API =====

// Create workforce budget
async function createWorkforceBudget(budgetData) {
    return await apiCall('/workforce-budget', 'POST', budgetData);
}

// Get workforce budgets
async function getWorkforceBudgets() {
    return await apiCall('/workforce-budget');
}

// ===== WORK STATUS UPDATES =====

// Update work status for any department
async function updateWorkStatus(tableName, id, statusData) {
    return await apiCall(`/work/${tableName}/${id}/status`, 'PUT', statusData);
}

// ===== LEGACY API COMPATIBILITY =====
// These functions maintain compatibility with existing frontend code

// Projects
async function getProjects() {
    try {
        const projectWork = await getProjectWork();
        return projectWork.map(work => ({
            id: work.id,
            name: work.project_name,
            description: work.work_description,
            client: work.client_name,
            status: work.project_phase,
            start_date: work.submitted_date,
            end_date: work.due_date
        }));
    } catch (error) {
        console.error('Error getting projects:', error);
        return { success: false, data: [] };
    }
}

// Task Assignments
async function getTaskAssignments() {
    try {
        const projectWork = await getProjectWork();
        return projectWork.map(work => ({
            id: work.id,
            taskName: work.work_title,
            assignedTo: work.assigned_to,
            project: work.project_name,
            status: work.status,
            dueDate: work.due_date
        }));
    } catch (error) {
        console.error('Error getting task assignments:', error);
        return { success: false, data: [] };
    }
}

// Properties
async function getProperties() {
    try {
        const realEstateWork = await getRealEstateWork();
        return realEstateWork.map(work => ({
            id: work.id,
            title: work.work_title,
            address: work.property_address,
            type: work.property_type,
            price: work.sale_amount,
            status: work.status
        }));
    } catch (error) {
        console.error('Error getting properties:', error);
        return { success: false, data: [] };
    }
}

// Financial Transactions
async function getFinancialTransactions() {
    try {
        const financeWork = await getFinanceWork();
        return financeWork.map(work => ({
            id: work.id,
            type: work.work_type,
            amount: work.amount,
            description: work.work_description,
            vendor: work.vendor_name,
            date: work.submitted_date,
            status: work.status
        }));
    } catch (error) {
        console.error('Error getting financial transactions:', error);
        return { success: false, data: [] };
    }
}

// ===== UTILITY FUNCTIONS =====

// Handle API errors consistently
function handleApiError(error, context = 'API operation') {
    console.error(`${context} error:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.message) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    // Show user-friendly error message
    if (typeof customAlert === 'function') {
        customAlert(errorMessage, 'Error', 'error');
    } else {
        alert(errorMessage);
    }
    
    return { success: false, error: errorMessage };
}

// Validate API response
function validateApiResponse(response, expectedType = 'object') {
    if (!response) {
        return { valid: false, error: 'No response received' };
    }
    
    if (typeof response !== expectedType) {
        return { valid: false, error: `Invalid response type. Expected ${expectedType}, got ${typeof response}` };
    }
    
    if (response.error) {
        return { valid: false, error: response.error };
    }
    
    return { valid: true, data: response };
}

// Export all functions for global use
window.KashTecAPI = {
    // Authentication
    login,
    getAuthToken,
    getCurrentUser,
    
    // Department Data
    getAllDepartmentData,
    getDepartmentStats,
    
    // HR Department
    createHRWork,
    getHRWork,
    
    // Finance Department
    createFinanceWork,
    getFinanceWork,
    
    // HSE Department
    createHSEWork,
    getHSEWork,
    
    // Project Department
    createProjectWork,
    getProjectWork,
    
    // Real Estate Department
    createRealEstateWork,
    getRealEstateWork,
    
    // Admin Department
    createAdminWork,
    getAdminWork,
    
    // Policies
    getPolicies,
    getPolicyById,
    approvePolicy,
    rejectPolicy,
    requestPolicyRevision,
    getPolicyRevisions,
    getPolicyRejections,
    
    // Senior Hiring
    createSeniorHiringRequest,
    getSeniorHiringRequests,
    
    // Workforce Budget
    createWorkforceBudget,
    getWorkforceBudgets,
    
    // Work Status
    updateWorkStatus,
    
    // Legacy Compatibility
    getProjects,
    getEmployees,
    getTaskAssignments,
    getProperties,
    getFinancialTransactions,
    
    // Utilities
    handleApiError,
    validateApiResponse,
    apiCall
};

async function createTaskAssignment(taskData) {
    return await apiCall('/task-assignments', 'POST', taskData);
}

async function updateTaskAssignment(taskId, taskData) {
    return await apiCall(`/task-assignments/${taskId}`, 'PUT', taskData);
}

// ===== WORKFORCE REQUESTS =====
async function getWorkforceRequests() {
    return await apiCall('/workforce-requests');
}

async function createWorkforceRequest(requestData) {
    return await apiCall('/workforce-requests', 'POST', requestData);
}

async function updateWorkforceRequest(requestId, requestData) {
    return await apiCall(`/workforce-requests/${requestId}`, 'PUT', requestData);
}

// ===== SITE REPORTS =====
async function getSiteReports() {
    return await apiCall('/site-reports');
}

async function createSiteReport(reportData) {
    return await apiCall('/site-reports', 'POST', reportData);
}

async function updateSiteReport(reportId, reportData) {
    return await apiCall(`/site-reports/${reportId}`, 'PUT', reportData);
}

// ===== WORK APPROVALS =====
async function getWorkApprovals() {
    return await apiCall('/work-approvals');
}

async function createWorkApproval(approvalData) {
    return await apiCall('/work-approvals', 'POST', approvalData);
}

async function updateWorkApproval(approvalId, approvalData) {
    return await apiCall(`/work-approvals/${approvalId}`, 'PUT', approvalData);
}

// ===== SALES MANAGEMENT =====
async function getSales() {
    return await apiCall('/sales');
}

async function createSale(saleData) {
    return await apiCall('/sales', 'POST', saleData);
}

async function updateSale(saleId, saleData) {
    return await apiCall(`/sales/${saleId}`, 'PUT', saleData);
}

// ===== NOTIFICATIONS =====
async function getNotifications() {
    return await apiCall('/notifications');
}

async function createNotification(notificationData) {
    return await apiCall('/notifications', 'POST', notificationData);
}

async function markNotificationRead(notificationId) {
    return await apiCall(`/notifications/${notificationId}/read`, 'PUT');
}

// ===== MEETINGS =====
async function getMeetings() {
    return await apiCall('/meetings');
}

async function createMeeting(meetingData) {
    return await apiCall('/meetings', 'POST', meetingData);
}

async function updateMeeting(meetingId, meetingData) {
    return await apiCall(`/meetings/${meetingId}`, 'PUT', meetingData);
}

async function deleteMeeting(meetingId) {
    return await apiCall(`/meetings/${meetingId}`, 'DELETE');
}

// ===== OFFICE PORTAL USERS =====
async function getOfficePortalUsers() {
    return await apiCall('/office-portal/users');
}

async function createOfficePortalUser(userData) {
    return await apiCall('/office-portal/users', 'POST', userData);
}

async function updateOfficePortalUser(userId, userData) {
    return await apiCall(`/office-portal/users/${userId}`, 'PUT', userData);
}

async function deleteOfficePortalUser(userId) {
    return await apiCall(`/office-portal/users/${userId}`, 'DELETE');
}

// ===== DASHBOARD STATISTICS =====
async function getDashboardStats() {
    return await apiCall('/dashboard/stats');
}

async function getOfficePortalStats() {
    return await apiCall('/office-portal/statistics');
}

// ===== ERROR HANDLING =====
function handleApiError(error, customMessage = 'Operation failed') {
    console.error('API Error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    customAlert(`${customMessage}: ${errorMessage}`, 'Error', 'error');
}

// ===== ENDPOINT VERIFICATION =====

// Verify all API endpoints are properly mapped
async function verifyAllEndpoints() {
    console.log('🔍 Verifying all API endpoints...');
    
    const endpoints = [
        // Authentication
        { method: 'POST', path: '/auth/login', name: 'Login' },
        
        // Department Work Endpoints
        { method: 'POST', path: '/hr/work', name: 'HR Work Creation' },
        { method: 'GET', path: '/hr/work', name: 'HR Work List' },
        { method: 'POST', path: '/finance/work', name: 'Finance Work Creation' },
        { method: 'GET', path: '/finance/work', name: 'Finance Work List' },
        { method: 'POST', path: '/hse/work', name: 'HSE Work Creation' },
        { method: 'GET', path: '/hse/work', name: 'HSE Work List' },
        { method: 'POST', path: '/project/work', name: 'Project Work Creation' },
        { method: 'GET', path: '/project/work', name: 'Project Work List' },
        { method: 'POST', path: '/realestate/work', name: 'Real Estate Work Creation' },
        { method: 'GET', path: '/realestate/work', name: 'Real Estate Work List' },
        { method: 'POST', path: '/admin/work', name: 'Admin Work Creation' },
        { method: 'GET', path: '/admin/work', name: 'Admin Work List' },
        
        // Data Endpoints
        { method: 'GET', path: '/departments/all', name: 'All Department Data' },
        { method: 'GET', path: '/stats', name: 'Department Statistics' },
        { method: 'GET', path: '/dashboard/stats', name: 'Dashboard Statistics' },
        
        // Employee Management
        { method: 'GET', path: '/employees', name: 'Employee List' },
        { method: 'POST', path: '/employees', name: 'Employee Creation' },
        
        // Project Management
        { method: 'GET', path: '/projects', name: 'Project List' },
        { method: 'POST', path: '/projects', name: 'Project Creation' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const url = `${API_BASE_URL}${endpoint.path}`;
            console.log(`🔍 Testing ${endpoint.name}: ${endpoint.method} ${url}`);
            
            const options = {
                method: endpoint.method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            // Add test data for POST requests
            if (endpoint.method === 'POST') {
                options.body = JSON.stringify({
                    test: true,
                    timestamp: new Date().toISOString()
                });
            }
            
            const response = await fetch(url, options);
            
            results.push({
                name: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                status: response.status,
                success: response.status < 400,
                url: url
            });
            
            console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
            
        } catch (error) {
            results.push({
                name: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                status: 'ERROR',
                success: false,
                error: error.message,
                url: `${API_BASE_URL}${endpoint.path}`
            });
            
            console.error(`${endpoint.name}: ERROR - ${error.message}`);
        }
    }
    
    return results;
}

// ===== UTILITY FUNCTIONS =====
function generateId(prefix = 'ID') {
    return `${prefix}${Date.now().toString().slice(-6)}`;
}

function formatDate(date = new Date()) {
    return date.toLocaleDateString();
}

function formatDateTime(date = new Date()) {
    return date.toLocaleString();
}

// ===== KASHTEC API OBJECT =====
// Global API object for frontend usage (using the exported window.KashTecAPI)
// Note: The actual KashTecAPI is exported at the end of the file (line 374)
// This duplicate object has been removed to prevent conflicts

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login, // Fixed: was apiLogin
        getAuthToken,
        getCurrentUser,
        apiCall,
        getEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        getProperties,
        createProperty,
        updateProperty,
        deleteProperty,
        getClients,
        createClient,
        updateClient,
        getProjects,
        createProject,
        updateProject,
        getTaskAssignments,
        createTaskAssignment,
        updateTaskAssignment,
        getWorkforceRequests,
        createWorkforceRequest,
        updateWorkforceRequest,
        getSiteReports,
        createSiteReport,
        updateSiteReport,
        getWorkApprovals,
        createWorkApproval,
        updateWorkApproval,
        getSales,
        createSale,
        updateSale,
        getNotifications,
        createNotification,
        markNotificationRead,
        getMeetings,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        getOfficePortalUsers,
        createOfficePortalUser,
        updateOfficePortalUser,
        deleteOfficePortalUser,
        getDashboardStats,
        getOfficePortalStats,
        handleApiError,
        generateId,
        formatDate,
        formatDateTime
    };
}
