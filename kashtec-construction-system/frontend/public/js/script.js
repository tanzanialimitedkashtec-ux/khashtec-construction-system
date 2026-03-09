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
    
    // Save user to localStorage
    localStorage.setItem('kashtec_user_' + email, JSON.stringify(userData));
    localStorage.setItem('kashtec_current_user', JSON.stringify(userData));
    
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

function handleLogin() {
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;
    var rememberMe = document.getElementById("rememberMe").checked;
    
    if (!email || !password) {
        alert("Please enter both email and password");
        return false;
    }
    
    // Retrieve user from sessionStorage
    var userData = sessionStorage.getItem('kashtec_user_' + email);
    
    if (!userData) {
        alert("No account found with this email. Please register first.");
        return false;
    }
    
    var user = JSON.parse(userData);
    
    // Simple password check (in real app, use proper hashing)
    if (password !== user.password) {
        alert("Incorrect password. Try again or use default password: password123");
        return false;
    }
    
    // Update last login
    user.lastLogin = new Date().toLocaleString();
    sessionStorage.setItem('kashtec_user_' + email, JSON.stringify(user));
    
    // Set current user
    sessionStorage.setItem('kashtec_current_user', JSON.stringify(user));
    
    if (rememberMe) {
        sessionStorage.setItem('kashtec_remember_email', email);
    } else {
        sessionStorage.removeItem('kashtec_remember_email');
    }
    
    alert("Login successful! Welcome to your customer portal.");
    
    // Show customer portal
    showCustomerPortal();
    
    // Reset login form
    document.getElementById("loginForm").reset();
    
    return false;
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem('kashtec_current_user');
        alert("You have been logged out successfully.");
        showLoginSection();
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

// Check if user is already logged in on page load
window.onload = function() {
    var currentUser = localStorage.getItem('kashtec_current_user');
    var rememberEmail = localStorage.getItem('kashtec_remember_email');
    
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
};
