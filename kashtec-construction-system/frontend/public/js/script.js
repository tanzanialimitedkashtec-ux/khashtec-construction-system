function toggleHSE(){
    var x = document.getElementById("hse");
    if(x.classList.contains("hidden")){
        x.classList.remove("hidden");
    }else{
        x.classList.add("hidden");
    }
}

function submitForm(){
    alert("Thank you for contacting KASHTEC Tanzania Limited!");
    return false;
}

function toggleServiceDescription() {
    var serviceType = document.getElementById("serviceType");
    var customServiceGroup = document.getElementById("customServiceGroup");
    var customService = document.getElementById("customService");
    
    if (serviceType.value === "custom") {
        customServiceGroup.style.display = "block";
        customService.required = true;
    } else {
        customServiceGroup.style.display = "none";
        customService.required = false;
        customService.value = "";
    }
}

function submitAccountForm() {
    var fullName = document.getElementById("fullName").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var location = document.getElementById("location").value;
    var serviceType = document.getElementById("serviceType");
    var customService = document.getElementById("customService").value;
    var additionalInfo = document.getElementById("additionalInfo").value;
    
    // Get selected service text
    var selectedService = serviceType.options[serviceType.selectedIndex].text;
    
    // Validate required fields
    if (!fullName || !email || !phone || !location || !serviceType.value) {
        alert("Please fill in all required fields marked with *");
        return false;
    }
    
    // If custom service is selected, validate that it's filled
    if (serviceType.value === "custom" && !customService) {
        alert("Please describe your required service");
        return false;
    }
    
    // Create user object
    var userData = {
        fullName: fullName,
        email: email,
        phone: phone,
        location: location,
        serviceType: selectedService,
        customService: customService,
        additionalInfo: additionalInfo,
        password: "password123", // Default password for demo
        memberSince: new Date().toLocaleDateString(),
        lastLogin: new Date().toLocaleString()
    };
    
    // Save user to session
    sessionManager.set('kashtec_user_' + email, JSON.stringify(userData));
    sessionManager.setCurrentUser(userData);
    
    // Automatically add to Office Portal directory
    addToOfficePortal(userData);
    
    // Create success message
    var message = "Account Registration Successful!\n\n";
    message += "Welcome to KASHTEC Tanzania Limited!\n\n";
    message += "Your account has been created with:\n";
    message += "Email: " + email + "\n";
    message += "Default Password: password123\n\n";
    message += "You can now login to access your customer portal.\n\n";
    message += "You have been automatically added to the Office Portal directory!";
    
    alert(message);
    
    // Reset form
    document.getElementById("accountForm").reset();
    toggleServiceDescription();
    
    // Show login section
    showLoginSection();
    
    return false;
}

// Authentication and Navigation Functions
function showLoginSection() {
    hideAllSections();
    document.getElementById("login").classList.remove("hidden");
    updateNavigation("login");
}

function showAccountSection() {
    hideAllSections();
    document.getElementById("account").classList.remove("hidden");
    updateNavigation("register");
}

function showCustomerPortal() {
    hideAllSections();
    document.getElementById("customerPortal").classList.remove("hidden");
    updateNavigation("portal");
    loadUserData();
}

function hideAllSections() {
    document.getElementById("account").classList.add("hidden");
    document.getElementById("login").classList.add("hidden");
    document.getElementById("customerPortal").classList.add("hidden");
}

function updateNavigation(state) {
    var registerNav = document.getElementById("registerNav");
    var loginNav = document.getElementById("loginNav");
    var portalNav = document.getElementById("portalNav");
    
    // Hide all navigation items first
    registerNav.classList.add("hidden");
    loginNav.classList.add("hidden");
    portalNav.classList.add("hidden");
    
    // Show appropriate navigation items based on state
    if (state === "register") {
        registerNav.classList.remove("hidden");
        loginNav.classList.remove("hidden");
    } else if (state === "login") {
        registerNav.classList.remove("hidden");
        loginNav.classList.remove("hidden");
    } else if (state === "portal") {
        portalNav.classList.remove("hidden");
    }
}

function updatePasswordPlaceholder() {
    console.log('🔄 updatePasswordPlaceholder() called');
    var roleSelect = document.getElementById("loginRole");
    var passwordInput = document.getElementById("loginPassword");
    
    if (roleSelect && passwordInput) {
        var selectedRole = roleSelect.value;
        console.log('📝 Selected role:', selectedRole);
        
        var placeholders = {
            'Managing Director': 'admin',
            'Director of Administration': 'admin',
            'HR Manager': 'hr0501',
            'HSE Manager': 'hse0501',
            'Finance Manager': 'finance0501',
            'Project Manager': 'pm0501',
            'Real Estate Manager': 'realestate0501',
            'Admin Assistant': 'admin'
        };
        
        passwordInput.placeholder = placeholders[selectedRole] || 'Enter password';
        console.log('🔤 Password placeholder updated to:', passwordInput.placeholder);
    } else {
        console.error('❌ Could not find role select or password input');
    }
}

function handleLogin() {
    console.log('🔍 handleLogin function called');
    
    // Test if apiService is available
    console.log('🔍 apiService available:', typeof window.apiService);
    console.log('🔍 apiService object:', window.apiService);
    
    if (!window.apiService) {
        console.error('❌ apiService not found!');
        showNotification('API service not loaded. Please refresh the page.', 'error', 5000);
        return false;
    }
    
    // Get form values
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;
    var role = document.getElementById("loginRole").value;
    
    console.log('📝 Form data:', { email, password: '***', role });
    
    // Validate input
    if (!email || !password || !role) {
        showNotification('Please fill in all fields: email, password, and select your role', 'warning', 5000);
        return false;
    }
    
    // Show loading state
    var loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = "Authenticating...";
        loginBtn.style.opacity = '0.7';
    }
    
    // Direct API call without testing first
    console.log('🌐 Direct login attempt...');
    showNotification('Authenticating...', 'info', 3000);
    
    try {
        apiService.login(email, password, role)
        .then(response => {
            console.log('✅ Login successful:', response);
            
            // Reset button
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = "Login";
                loginBtn.style.opacity = '1';
            }
            
            // Show success
            showNotification(`Welcome ${response.user.department_name || role}! Login successful.`, 'success', 6000);
            
            // Store session
            sessionManager.setAuthToken(response.token);
            sessionManager.setCurrentUser(response.user);
            
            // Redirect to system page
            setTimeout(() => {
                // Hide login page and show system page
                document.getElementById("loginPage").classList.add("hidden");
                document.getElementById("systemPage").classList.remove("hidden");
                
                // Map full role names to short codes for menu system
                const roleMap = {
                    'Managing Director': 'MD',
                    'Director of Administration': 'ADMIN', 
                    'HR Manager': 'HR',
                    'HSE Manager': 'HSE',
                    'Finance Manager': 'FINANCE',
                    'Project Manager': 'PROJECT',
                    'Real Estate Manager': 'REALESTATE',
                    'Admin Assistant': 'ASSISTANT'
                };
                
                // Set global currentRole for menu system (not window.currentRole)
                currentRole = roleMap[role] || role;
                
                // Set user role display
                document.getElementById("userRole").innerText = role + " Dashboard";
                
                console.log('🔍 Setting currentRole:', currentRole, 'from role:', role);
                
                // Load menu based on role
                if (typeof loadMenu === 'function') {
                    loadMenu();
                }
                
                // Show welcome content
                showContent(`<div class="card">
                    <h3>Welcome to ${role} Dashboard</h3>
                    <p>Please select an option from the menu to get started.</p>
                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                        <h4>Quick Start:</h4>
                        <p>Choose a function from the left menu to manage your department operations.</p>
                    </div>
                </div>`);
                
                showNotification(`Welcome ${response.user.department_name || role}!`, 'success', 3000);
            }, 1500);
            
        })
        .catch(error => {
            console.error('❌ Login failed:', error);
            
            // Reset button
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = "Login";
                loginBtn.style.opacity = '1';
            }
            
            // Show error
            let errorMsg = 'Login failed. ';
            if (error.message.includes('No account found')) {
                errorMsg = 'Email not found. Check your credentials.';
            } else if (error.message.includes('Incorrect password')) {
                errorMsg = 'Wrong password. Try again.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMsg = 'Network error. Check internet connection.';
            } else {
                errorMsg = error.message || 'Unknown error occurred.';
            }
            
            showNotification(errorMsg, 'error', 8000);
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // Reset button
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
            loginBtn.style.opacity = '1';
        }
        
        // Show error
        showNotification('Login error: ' + (error.message || 'Unknown error'), 'error', 5000);
    }
    
    // Return false to prevent form submission and page reload
    return false;
}

function handleLogout() {
    // Show custom confirmation notification instead of alert
    showNotification('Logging out...', 'info', 2000);
    
    // Clear session data
    sessionManager.removeCurrentSession();
    
    // Reset current role
    currentRole = "";
    
    // Show logout success message
    setTimeout(() => {
        // Hide system page and show login page
        document.getElementById("systemPage").classList.add("hidden");
        document.getElementById("loginPage").classList.remove("hidden");
        
        // Clear form fields
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
        document.getElementById("loginRole").value = "";
        
        // Reset login button
        const loginBtn = document.getElementById("loginBtn");
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
            loginBtn.style.opacity = '1';
        }
        
        // Show logout success notification
        showNotification('You have been logged out successfully. Please login again.', 'success', 4000);
    }, 1000);
}

// HR Policy Management Functions
async function approvePolicy(policyId) {
    try {
        console.log('✅ Approving policy:', policyId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const approvedBy = currentUser.email || 'HR Manager';
        
        // Show loading notification
        showNotification('Approving policy...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/policies/${policyId}/approve`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ approvedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Policy approved successfully!', 'success', 4000);
                
                // Update UI to show approved status
                const policyElement = document.querySelector(`[data-policy-id="${policyId}"]`);
                if (policyElement) {
                        policyElement.classList.add('approved');
                        policyElement.querySelector('.status-badge').textContent = 'Approved';
                        policyElement.querySelector('.status-badge').style.background = '#28a745';
                }
                
                // Refresh policies list
                setTimeout(() => loadPolicies(), 2000);
        } else {
                showNotification('Failed to approve policy: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error approving policy:', error);
        showNotification('Error approving policy: ' + error.message, 'error', 5000);
    }
}

async function rejectPolicy(policyId) {
    try {
        console.log('❌ Rejecting policy:', policyId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const rejectedBy = currentUser.email || 'HR Manager';
        
        // Get rejection reason from user
        const rejectionReason = prompt('Please enter rejection reason:');
        if (!rejectionReason) {
                showNotification('Rejection cancelled', 'info', 2000);
                return;
        }
        
        // Show loading notification
        showNotification('Rejecting policy...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/policies/${policyId}/reject`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ rejectionReason, rejectedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Policy rejected successfully!', 'warning', 4000);
                
                // Update UI to show rejected status
                const policyElement = document.querySelector(`[data-policy-id="${policyId}"]`);
                if (policyElement) {
                        policyElement.classList.add('rejected');
                        policyElement.querySelector('.status-badge').textContent = 'Rejected';
                        policyElement.querySelector('.status-badge').style.background = '#dc3545';
                }
                
                // Refresh policies list
                setTimeout(() => loadPolicies(), 2000);
        } else {
                showNotification('Failed to reject policy: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error rejecting policy:', error);
        showNotification('Error rejecting policy: ' + error.message, 'error', 5000);
    }
}

async function requestPolicyRevision(policyId) {
    try {
        console.log('🔄 Requesting revision for policy:', policyId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const requestedBy = currentUser.email || 'HR Manager';
        
        // Get revision request from user
        const revisionRequest = prompt('Please enter revision request details:');
        if (!revisionRequest) {
                showNotification('Revision request cancelled', 'info', 2000);
                return;
        }
        
        // Show loading notification
        showNotification('Requesting revision...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/policies/${policyId}/revision`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ revisionRequest, requestedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Revision requested successfully!', 'info', 4000);
                
                // Update UI to show revision requested status
                const policyElement = document.querySelector(`[data-policy-id="${policyId}"]`);
                if (policyElement) {
                        policyElement.classList.add('revision-requested');
                        policyElement.querySelector('.status-badge').textContent = 'Revision Requested';
                        policyElement.querySelector('.status-badge').style.background = '#ffc107';
                }
                
                // Refresh policies list
                setTimeout(() => loadPolicies(), 2000);
        } else {
                showNotification('Failed to request revision: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error requesting revision:', error);
        showNotification('Error requesting revision: ' + error.message, 'error', 5000);
    }
}

async function loadPolicies() {
    try {
        console.log('🔍 Loading policies...');
        
        const response = await fetch('/api/policies', {
                headers: {
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                }
        });
        
        const policies = await response.json();
        
        if (response.ok) {
                console.log('📋 Policies loaded:', policies.length);
                displayPolicies(policies);
        } else {
                showNotification('Failed to load policies', 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error loading policies:', error);
        showNotification('Error loading policies: ' + error.message, 'error', 5000);
    }
}

function displayPolicies(policies) {
    let html = '<div class="card"><h3>Policy Management</h3>';
    
    if (policies.length === 0) {
        html += '<p>No policies found.</p>';
    } else {
        html += '<div class="policy-list">';
        
        policies.forEach(policy => {
                const statusClass = policy.status.toLowerCase().replace(' ', '-');
                const statusColor = {
                        'pending': '#ffc107',
                        'approved': '#28a745',
                        'rejected': '#dc3545',
                        'revision-requested': '#17a2b8'
                }[statusClass] || '#6c757d';
                
                html += `
                        <div class="policy-item" data-policy-id="${policy.id}">
                                <h5>${policy.title}</h5>
                                <p>${policy.description}</p>
                                <div class="policy-details">
                                        <span><strong>Submitted by:</strong> ${policy.submitted_by}</span>
                                        <span><strong>Date:</strong> ${policy.submission_date}</span>
                                        <span><strong>Impact:</strong> ${policy.impact}</span>
                                        <span class="status-badge" style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${policy.status}</span>
                                </div>
                                <div class="policy-actions">
                                        <button class="action" onclick="approvePolicy('${policy.id}')" style="background: #28a745;">Approve Policy</button>
                                        <button class="action" onclick="requestPolicyRevision('${policy.id}')" style="background: #ffc107;">Request Revision</button>
                                        <button class="action" onclick="rejectPolicy('${policy.id}')" style="background: #dc3545;">Reject</button>
                                </div>
                        </div>
                `;
        });
        
        html += '</div>';
    }
    
    html += '</div>';
    showContent(html);
}

// Senior Staff Hiring Functions
async function loadSeniorHiringRequests() {
    try {
        console.log('🔍 Loading senior hiring requests...');
        
        const response = await fetch('/api/senior-hiring', {
                headers: {
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                }
        });
        
        const requests = await response.json();
        
        if (response.ok) {
                console.log('📋 Senior hiring requests loaded:', requests.length);
                displaySeniorHiringRequests(requests);
        } else {
                showNotification('Failed to load senior hiring requests', 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error loading senior hiring requests:', error);
        showNotification('Error loading senior hiring requests: ' + error.message, 'error', 5000);
    }
}

function displaySeniorHiringRequests(requests) {
    let html = `<div class="card">
        <h3>Approve Senior Staff Hiring</h3>
        <p><strong>High-Level Authority:</strong> Approve hiring decisions for senior positions (Manager level and above)</p>
        
        <div class="hiring-section">
            <h4>Senior Staff Hiring Requests Pending Approval</h4>`;
    
    if (requests.length === 0) {
        html += '<p>No senior hiring requests pending approval.</p>';
    } else {
        requests.forEach(request => {
                const statusClass = request.status.toLowerCase().replace(' ', '-');
                const statusColor = {
                        'pending': '#ffc107',
                        'approved': '#28a745',
                        'rejected': '#dc3545',
                        'more-info-requested': '#17a2b8'
                }[statusClass] || '#6c757d';
                
                html += `
                        <div class="hiring-request">
                                <h5>${request.position_level} Position</h5>
                                <div class="candidate-info">
                                        <div class="form-row">
                                                <div class="form-group">
                                                        <label>Candidate Name</label>
                                                        <input type="text" value="${request.candidate_name}" readonly>
                                                </div>
                                                <div class="form-group">
                                                        <label>Proposed Salary</label>
                                                        <input type="text" value="${request.proposed_salary}" readonly>
                                                </div>
                                        </div>
                                        <div class="form-row">
                                                <div class="form-group">
                                                        <label>Department</label>
                                                        <input type="text" value="${request.department}" readonly>
                                                </div>
                                                <div class="form-group">
                                                        <label>Experience</label>
                                                        <input type="text" value="${request.experience}" readonly>
                                                </div>
                                        </div>
                                        <div class="form-group">
                                                <label>HR Recommendation</label>
                                                <textarea rows="3" readonly>${request.hr_recommendation}</textarea>
                                        </div>
                                </div>
                                <div class="hiring-actions">
                                        <button class="action" onclick="approveSeniorHire('${request.id}')" style="background: #28a745;">Approve Hiring</button>
                                        <button class="action" onclick="requestMoreInfo('${request.id}')" style="background: #ffc107;">Request More Info</button>
                                        <button class="action" onclick="rejectSeniorHire('${request.id}')" style="background: #dc3545;">Reject Hiring</button>
                                </div>
                        </div>
                `;
        });
    }
    
    html += `
            </div>
            
            <div class="approval-summary">
                <h4>Senior Hiring Authority</h4>
                <div class="authority-item">
                        <span>✅ Can approve all senior staff hires</span>
                </div>
                <div class="authority-item">
                        <span>✅ Can approve manager-level positions and above</span>
                </div>
                <div class="authority-item">
                        <span>✅ Final authority on senior recruitment</span>
                </div>
                <div class="authority-item restriction">
                        <span>❌ Cannot directly register workers (HR function)</span>
                </div>
            </div>
        </div>
    </div>`;
    
    showContent(html);
}

async function approveSeniorHire(requestId) {
    try {
        console.log('✅ Approving senior hiring request:', requestId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const approvedBy = currentUser.email || 'HR Manager';
        
        // Get comments from user
        const comments = prompt('Enter approval comments (optional):');
        
        // Show loading notification
        showNotification('Approving senior hiring request...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/senior-hiring/${requestId}/approve`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ approvedBy, comments })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Senior hiring request approved successfully!', 'success', 4000);
                
                // Refresh requests list
                setTimeout(() => loadSeniorHiringRequests(), 2000);
        } else {
                showNotification('Failed to approve senior hiring request: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error approving senior hiring request:', error);
        showNotification('Error approving senior hiring request: ' + error.message, 'error', 5000);
    }
}

async function rejectSeniorHire(requestId) {
    try {
        console.log('❌ Rejecting senior hiring request:', requestId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const rejectedBy = currentUser.email || 'HR Manager';
        
        // Get rejection reason from user
        const rejectionReason = prompt('Please enter rejection reason:');
        if (!rejectionReason) {
                showNotification('Rejection cancelled', 'info', 2000);
                return;
        }
        
        // Show loading notification
        showNotification('Rejecting senior hiring request...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/senior-hiring/${requestId}/reject`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ rejectionReason, rejectedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Senior hiring request rejected successfully!', 'warning', 4000);
                
                // Refresh requests list
                setTimeout(() => loadSeniorHiringRequests(), 2000);
        } else {
                showNotification('Failed to reject senior hiring request: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error rejecting senior hiring request:', error);
        showNotification('Error rejecting senior hiring request: ' + error.message, 'error', 5000);
    }
}

async function requestMoreInfo(requestId) {
    try {
        console.log('🔄 Requesting more info for senior hiring request:', requestId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const requestedBy = currentUser.email || 'HR Manager';
        
        // Get info request from user
        const infoRequired = prompt('Please specify information required:');
        if (!infoRequired) {
                showNotification('Info request cancelled', 'info', 2000);
                return;
        }
        
        // Show loading notification
        showNotification('Requesting more information...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/senior-hiring/${requestId}/request-info`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ infoRequired, requestedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Information request sent successfully!', 'info', 4000);
                
                // Refresh requests list
                setTimeout(() => loadSeniorHiringRequests(), 2000);
        } else {
                showNotification('Failed to request more information: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error requesting more information:', error);
        showNotification('Error requesting more information: ' + error.message, 'error', 5000);
    }
}

// Workforce Budget Functions
async function loadWorkforceBudgets() {
    try {
        console.log('🔍 Loading workforce budget requests...');
        
        const response = await fetch('/api/workforce-budget', {
                headers: {
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                }
        });
        
        const budgets = await response.json();
        
        if (response.ok) {
                console.log('📊 Workforce budget requests loaded:', budgets.length);
                displayWorkforceBudgets(budgets);
        } else {
                showNotification('Failed to load workforce budget requests', 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error loading workforce budget requests:', error);
        showNotification('Error loading workforce budget requests: ' + error.message, 'error', 5000);
    }
}

function displayWorkforceBudgets(budgets) {
    let html = `<div class="card">
        <h3>Approve Workforce Budget</h3>
        <p><strong>High-Level Authority:</strong> Review and approve annual workforce budget allocations</p>
        
        <div class="budget-section">
            <h4>Workforce Budget Proposals</h4>`;
    
    if (budgets.length === 0) {
        html += '<p>No workforce budget requests pending approval.</p>';
    } else {
        budgets.forEach(budget => {
                const statusClass = budget.status.toLowerCase().replace(' ', '-');
                const statusColor = {
                        'pending': '#ffc107',
                        'approved': '#28a745',
                        'rejected': '#dc3545',
                        'modification-requested': '#17a2b8'
                }[statusClass] || '#6c757d';
                
                html += `
                        <div class="budget-proposal">
                                <h5>${budget.budget_period}</h5>
                                <div class="budget-overview">
                                        <div class="budget-row">
                                                <span class="budget-category">Salaries & Wages:</span>
                                                <span class="budget-amount">TZS ${budget.salaries_wages.toLocaleString()}</span>
                                        </div>
                                        <div class="budget-row">
                                                <span class="budget-category">Training & Development:</span>
                                                <span class="budget-amount">TZS ${budget.training_development.toLocaleString()}</span>
                                        </div>
                                        <div class="budget-row">
                                                <span class="budget-category">Employee Benefits:</span>
                                                <span class="budget-amount">TZS ${budget.employee_benefits.toLocaleString()}</span>
                                        </div>
                                        <div class="budget-row">
                                                <span class="budget-category">Recruitment Costs:</span>
                                                <span class="budget-amount">TZS ${budget.recruitment_costs.toLocaleString()}</span>
                                        </div>
                                        <div class="budget-row total">
                                                <span class="budget-category">Total Proposed:</span>
                                                <span class="budget-amount">TZS ${budget.total_proposed.toLocaleString()}</span>
                                        </div>
                                </div>
                                
                                <div class="budget-details">
                                        <div class="form-group">
                                                <label>Submitted By</label>
                                                <input type="text" value="${budget.submitted_by}" readonly>
                                        </div>
                                        <div class="form-row">
                                                <div class="form-group">
                                                        <label>Budget Period</label>
                                                        <input type="text" value="${budget.budget_period}" readonly>
                                                </div>
                                                <div class="form-group">
                                                        <label>Current Headcount</label>
                                                        <input type="text" value="${budget.current_headcount}" readonly>
                                                </div>
                                        </div>
                                        <div class="form-group">
                                                <label>Justification</label>
                                                <textarea rows="4" readonly>${budget.justification}</textarea>
                                        </div>
                                </div>
                                
                                <div class="budget-actions">
                                        <button class="action" onclick="approveBudget('${budget.id}')" style="background: #28a745;">Approve Budget</button>
                                        <button class="action" onclick="modifyBudget('${budget.id}')" style="background: #ffc107;">Request Modification</button>
                                        <button class="action" onclick="rejectBudget('${budget.id}')" style="background: #dc3545;">Reject Budget</button>
                                </div>
                        </div>
                `;
        });
    }
    
    html += `
            </div>
            
            <div class="approval-summary">
                <h4>Budget Approval Authority</h4>
                <div class="authority-item">
                        <span>✅ Can approve workforce budgets up to TZS 100M</span>
                </div>
                <div class="authority-item">
                        <span>✅ Can modify budget allocations</span>
                </div>
                <div class="authority-item">
                        <span>✅ Final authority on workforce spending</span>
                </div>
            </div>
        </div>
    </div>`;
    
    showContent(html);
}

async function approveBudget(budgetId) {
    try {
        console.log('✅ Approving workforce budget:', budgetId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const approvedBy = currentUser.email || 'HR Manager';
        
        // Get comments from user
        const comments = prompt('Enter approval comments (optional):');
        
        // Get approved amount from user
        const approvedAmount = prompt('Enter approved amount (leave empty to use proposed):');
        
        // Show loading notification
        showNotification('Approving workforce budget...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/workforce-budget/${budgetId}/approve`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ approvedBy, comments, approvedAmount })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Workforce budget approved successfully!', 'success', 4000);
                
                // Refresh budgets list
                setTimeout(() => loadWorkforceBudgets(), 2000);
        } else {
                showNotification('Failed to approve workforce budget: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error approving workforce budget:', error);
        showNotification('Error approving workforce budget: ' + error.message, 'error', 5000);
    }
}

async function rejectBudget(budgetId) {
    try {
        console.log('❌ Rejecting workforce budget:', budgetId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const rejectedBy = currentUser.email || 'HR Manager';
        
        // Get rejection reason from user
        const rejectionReason = prompt('Please enter rejection reason:');
        if (!rejectionReason) {
                showNotification('Rejection cancelled', 'info', 2000);
                return;
        }
        
        // Show loading notification
        showNotification('Rejecting workforce budget...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/workforce-budget/${budgetId}/reject`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ rejectionReason, rejectedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Workforce budget rejected successfully!', 'warning', 4000);
                
                // Refresh budgets list
                setTimeout(() => loadWorkforceBudgets(), 2000);
        } else {
                showNotification('Failed to reject workforce budget: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error rejecting workforce budget:', error);
        showNotification('Error rejecting workforce budget: ' + error.message, 'error', 5000);
    }
}

async function modifyBudget(budgetId) {
    try {
        console.log('🔄 Requesting modification for workforce budget:', budgetId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const requestedBy = currentUser.email || 'HR Manager';
        
        // Get modification request from user
        const modificationRequest = prompt('Please specify modification required:');
        if (!modificationRequest) {
                showNotification('Modification request cancelled', 'info', 2000);
                return;
        }
        
        // Show loading notification
        showNotification('Requesting budget modification...', 'info', 2000);
        
        // Call API
        const response = await fetch(`/api/workforce-budget/${budgetId}/modify`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                },
                body: JSON.stringify({ modificationRequest, requestedBy })
        });
        
        const result = await response.json();
        
        if (response.ok) {
                showNotification('Budget modification requested successfully!', 'info', 4000);
                
                // Refresh budgets list
                setTimeout(() => loadWorkforceBudgets(), 2000);
        } else {
                showNotification('Failed to request budget modification: ' + result.error, 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error requesting budget modification:', error);
        showNotification('Error requesting budget modification: ' + error.message, 'error', 5000);
    }
}

function loadUserData() {
    var currentUser = sessionStorage.getItem('kashtec_current_user');
    
    if (!currentUser) {
        showLoginSection();
        return;
    }
    
    var user = JSON.parse(currentUser);
    
    // Update portal with user data
    document.getElementById("portalUserName").textContent = user.fullName;
    document.getElementById("portalUserEmail").textContent = user.email;
    document.getElementById("portalUserPhone").textContent = user.phone;
    document.getElementById("portalUserLocation").textContent = user.location;
    document.getElementById("portalUserService").textContent = user.serviceType;
    document.getElementById("memberSince").textContent = user.memberSince;
    document.getElementById("lastLogin").textContent = user.lastLogin;
}

// Automatically add registered users to Office Portal directory
function addToOfficePortal(userData) {
    // Get existing Office Portal users from sessionStorage
    var officePortalUsers = JSON.parse(sessionStorage.getItem('kashtec_office_portal_users') || '[]');
    
    // Check if user already exists in Office Portal
    var existingUser = officePortalUsers.find(function(user) {
        return user.email === userData.email;
    });
    
    if (!existingUser) {
        // Create Office Portal user entry
        var officeUser = {
            id: 'USR-' + Date.now(),
            name: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            location: userData.location,
            serviceType: userData.serviceType,
            customService: userData.customService,
            additionalInfo: userData.additionalInfo,
            role: 'Customer',
            department: 'Clients',
            registrationDate: new Date().toLocaleDateString(),
            status: 'Active',
            profileImage: 'https://via.placeholder.com/80x80/3498db/ffffff?text=' + userData.fullName.charAt(0).toUpperCase()
        };
        
        // Add to Office Portal users array
        officePortalUsers.push(officeUser);
        
        // Save updated Office Portal users
        sessionStorage.setItem('kashtec_office_portal_users', JSON.stringify(officePortalUsers));
        
        console.log('User automatically added to Office Portal:', userData.fullName);
    }
}

// Portal Action Functions
function viewProjects() {
    alert("Your projects will be displayed here. This feature is coming soon!");
}

function requestService() {
    alert("Service request form will be displayed here. This feature is coming soon!");
}

function updateProfile() {
    alert("Profile update form will be displayed here. This feature is coming soon!");
}

function viewInvoices() {
    alert("Your invoices will be displayed here. This feature is coming soon!");
}

function showForgotPassword() {
    alert("Password reset functionality will be implemented soon. For now, please use the default password: password123");
}

// Custom Notification System
function showNotification(message, type = 'info', duration = 5000) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        font-family: Arial, sans-serif;
    `;

    // Set colors based on type
    const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '✅' },
        error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '❌' },
        warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404', icon: '⚠️' },
        info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', icon: 'ℹ️' }
    };

    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.border = `1px solid ${color.border}`;
    notification.style.color = color.text;

    // Add CSS animation if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .custom-notification.success { border-left: 4px solid #28a745; }
            .custom-notification.error { border-left: 4px solid #dc3545; }
            .custom-notification.warning { border-left: 4px solid #ffc107; }
            .custom-notification.info { border-left: 4px solid #17a2b8; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            .notification-message {
                flex: 1;
                font-weight: 500;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
                padding: 0;
                margin-left: 10px;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM Content Loaded, initializing event listeners...');
    
    var currentUser = localStorage.getItem('kashtec_current_user');
    var rememberEmail = localStorage.getItem('kashtec_remember_email');
    
    // Add event listeners to replace inline handlers
    var loginBtn = document.getElementById("loginBtn");
    console.log('🔍 Login button element (DOMContentLoaded):', loginBtn);
    console.log('🔍 Login button exists:', !!loginBtn);
    console.log('🔍 Login button type:', loginBtn ? loginBtn.tagName : 'null');
    console.log('🔍 Login button class:', loginBtn ? loginBtn.className : 'null');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            console.log('🖱️ Login button clicked!', e);
            console.log('🖱️ Event type:', e.type);
            console.log('🖱️ Event target:', e.target);
            console.log('🖱️ Current target:', e.currentTarget);
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
        });
        console.log('✅ Login button event listener attached (DOMContentLoaded)');
        
        // Test if button is clickable
        loginBtn.addEventListener('mouseover', function() {
            console.log('🖱️ Mouse over login button');
        });
        
        // Test if button is focusable
        loginBtn.addEventListener('focus', function() {
            console.log('🎯 Login button focused');
        });
    } else {
        console.error('❌ Login button not found during DOMContentLoaded');
    }
    
    var logoutBtn = document.querySelector('button[onclick="logout()"]');
    if (logoutBtn) {
        logoutBtn.removeAttribute('onclick');
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Logout button event listener attached (DOMContentLoaded)');
    }
    
    // Test handleLogin function availability
    console.log('🔍 handleLogin function exists:', typeof handleLogin);
    
    if (currentUser) {
        showCustomerPortal();
    } else {
        // Check if we should show login or account section
        updateNavigation("register");
        
        // Pre-fill email if remembered
        if (rememberEmail) {
            document.getElementById("loginEmail").value = rememberEmail;
            document.getElementById("rememberMe").checked = true;
        }
    }
});

// Fallback for window.onload in case DOMContentLoaded doesn't work
window.onload = function() {
    console.log('🔍 Window loaded, checking for missed elements...');
    
    var loginBtn = document.getElementById("loginBtn");
    if (loginBtn && !loginBtn.hasAttribute('data-listener-attached')) {
        loginBtn.addEventListener('click', function(e) {
            console.log('🖱️ Login button clicked (window.onload)!', e);
            e.preventDefault();
            handleLogin();
        });
        loginBtn.setAttribute('data-listener-attached', 'true');
        console.log('✅ Login button event listener attached (window.onload fallback)');
    }
};
