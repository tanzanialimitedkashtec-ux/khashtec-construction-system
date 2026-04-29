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
    
    // Here you would normally send the data to a server
    // For now, just show a success message
    alert("Account request submitted successfully! We will contact you soon.");
    return false;
}

// ===== PROJECT PROGRESS FUNCTIONS =====

// Load projects into the select dropdown
async function loadProjects() {
    try {
        const response = await window.ApiService.get('/projects');
        const projectSelect = document.getElementById('progressProject');
        
        if (response.projects && response.projects.length > 0) {
            projectSelect.innerHTML = '<option value="">Select Project to Update</option>';
            
            response.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `${project.name} - ${project.location}`;
                projectSelect.appendChild(option);
            });
        } else {
            projectSelect.innerHTML = '<option value="">No projects available</option>';
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
        const projectSelect = document.getElementById('progressProject');
        projectSelect.innerHTML = '<option value="">Failed to load projects</option>';
    }
}

// Load project details when a project is selected
async function loadProjectDetails() {
    const projectSelect = document.getElementById('progressProject');
    const progressForm = document.getElementById('progressUpdateForm');
    const projectId = projectSelect.value;
    
    if (!projectId) {
        progressForm.classList.add('hidden');
        return;
    }
    
    try {
        // Use apiService to get project details
        const project = await window.apiService.get(`/projects/${projectId}`);
        console.log('Project details loaded:', project);
        
        // Show the progress form
        progressForm.classList.remove('hidden');
        console.log('Progress form shown');
        
        // Pre-fill current project data
        const progressField = document.getElementById('progressPercentage');
        const statusField = document.getElementById('projectStatus');
        
        console.log('Form fields found:', {
            progressField: !!progressField,
            statusField: !!statusField,
            actual_cost: project.actual_cost,
            status: project.status
        });
        
        if (project.actual_cost !== undefined && project.actual_cost !== null) {
            progressField.value = project.actual_cost;
            console.log('Set progress percentage to:', project.actual_cost);
        } else {
            progressField.value = '0';
            console.log('Set progress percentage to 0 (null actual_cost)');
        }
        
        if (project.status) {
            statusField.value = project.status;
            console.log('Set status to:', project.status);
        }
        
        console.log('Form field values after setting:', {
            progress: progressField.value,
            status: statusField.value
        });
        
        // Pre-fill other fields with empty values for now
        document.getElementById('progressReport').value = '';
        document.getElementById('completedMilestones').value = '';
        document.getElementById('nextMilestones').value = '';
        document.getElementById('budgetUsed').value = '';
        document.getElementById('projectIssues').value = '';
        
        // Load recent progress updates
        loadProgressUpdates(projectId);
        
    } catch (error) {
        console.error('Failed to load project details:', error);
        progressForm.classList.add('hidden');
        alert('Failed to load project details. Please try again.');
    }
}

// Save project progress
async function saveProjectProgress() {
    const projectSelect = document.getElementById('progressProject');
    const projectId = projectSelect.value;
    
    if (!projectId) {
        alert('Please select a project first');
        return false;
    }
    
    const progressData = {
        progressPercentage: parseInt(document.getElementById('progressPercentage').value),
        status: document.getElementById('projectStatus').value,
        progressReport: document.getElementById('progressReport').value,
        completedMilestones: document.getElementById('completedMilestones').value,
        nextMilestones: document.getElementById('nextMilestones').value,
        budgetUsed: parseFloat(document.getElementById('budgetUsed').value) || 0,
        issues: document.getElementById('projectIssues').value,
        updateDate: new Date().toISOString()
    };
    
    try {
        await window.apiService.addProjectProgress(projectId, progressData);
        
        // Reset form
        document.getElementById('progressForm').reset();
        
        // Reload updates
        loadProgressUpdates(projectId);
        
        return false;
    } catch (error) {
        console.error('Failed to save project progress:', error);
        alert('Failed to save project progress. Please try again.');
        return false;
    }
}

// Wrapper function for form submission
function saveProjectProgressSubmit() {
    saveProjectProgress();
    return false;
}

// Load recent progress updates
async function loadProgressUpdates(projectId) {
    try {
        // Check if apiService is available
        if (!window.apiService || !window.apiService.getProjectProgressUpdates) {
            console.error('apiService or getProjectProgressUpdates method not available');
            const updateList = document.querySelector('.update-list');
            if (updateList) {
                updateList.innerHTML = '<div class="update-item">apiService not loaded</div>';
            }
            return;
        }
        
        const response = await window.apiService.getProjectProgressUpdates(projectId);
        const updateList = document.querySelector('.update-list');
        
        if (response.updates && response.updates.length > 0) {
            updateList.innerHTML = '';
            
            response.updates.slice(0, 5).forEach(update => {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                updateItem.innerHTML = `
                    <strong>${update.projectName || 'Project'}</strong>
                    <span>Updated: ${new Date(update.updateDate).toLocaleDateString()}</span>
                    <span>Progress: ${update.progressPercentage}% (${update.status})</span>
                `;
                updateList.appendChild(updateItem);
            });
        } else {
            updateList.innerHTML = '<div class="update-item">No recent updates available</div>';
        }
    } catch (error) {
        console.error('Failed to load progress updates:', error);
        const updateList = document.querySelector('.update-list');
        updateList.innerHTML = '<div class="update-item">Failed to load updates</div>';
    }
}

// Initialize projects when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load projects if the progress project select exists
    const projectSelect = document.getElementById('progressProject');
    if (projectSelect) {
        loadProjects();
    }
    
    // Load worker assignments if the worker results exist
    const workerResults = document.getElementById('workerResults');
    if (workerResults) {
        loadWorkerAssignments();
    }
});

// ===== WORKER ASSIGNMENT FUNCTIONS =====

// Global variable to store assignments
let allAssignments = [];

// Load all worker assignments and stats
async function loadWorkerAssignments() {
    try {
        // Load assignments
        const assignments = await window.apiService.getWorkerAssignments();
        console.log('Raw assignments response:', assignments);
        
        // Ensure assignments is an array
        const assignmentsArray = Array.isArray(assignments) ? assignments : [];
        
        // Store assignments globally for filtering
        allAssignments = assignmentsArray;
        
        // Load stats
        const stats = await window.apiService.getWorkerAssignmentStats();
        
        // Update stats display
        updateWorkerStats(stats);
        
        // Load filters for dropdowns
        await loadFiltersForWorkerAssignments();
        
        // Display assignments
        displayWorkerAssignments(assignmentsArray);
        
        // Update allocation chart
        updateAllocationChart(assignmentsArray);
        
    } catch (error) {
        console.error('Failed to load worker assignments:', error);
        displayError('workerResults', 'Failed to load worker assignments');
    }
}

// Update worker statistics
function updateWorkerStats(stats) {
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
        statValues[0].textContent = stats.totalAssignedWorkers || 0;
        statValues[1].textContent = stats.activeProjects || 0;
        statValues[2].textContent = stats.activeTasks || 0;
    }
}

// Load projects and departments for filter dropdowns
async function loadFiltersForWorkerAssignments() {
    try {
        // Load projects
        const projects = await window.apiService.get('/projects');
        const projectFilter = document.getElementById('projectFilter');
        
        if (projects && projects.length > 0) {
            // Clear existing options except "All Projects"
            projectFilter.innerHTML = '<option value="">All Projects</option>';
            
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                projectFilter.appendChild(option);
            });
        }
        
        // Load departments from assignments
        const departmentFilter = document.getElementById('departmentFilter');
        const departments = [...new Set(allAssignments.map(a => a.department).filter(Boolean))];
        
        // Clear existing options except "All Departments"
        departmentFilter.innerHTML = '<option value="">All Departments</option>';
        
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            option.textContent = department;
            departmentFilter.appendChild(option);
        });
        
    } catch (error) {
        console.error('Failed to load filters:', error);
    }
}

// Display worker assignments
function displayWorkerAssignments(assignments) {
    const workerResults = document.getElementById('workerResults');
    
    // Ensure assignments is an array
    const assignmentsArray = Array.isArray(assignments) ? assignments : [];
    
    if (!assignmentsArray || assignmentsArray.length === 0) {
        workerResults.innerHTML = '<div class="no-results">No worker assignments found</div>';
        return;
    }
    
    workerResults.innerHTML = '';
    
    assignmentsArray.forEach(assignment => {
        const assignmentCard = document.createElement('div');
        assignmentCard.className = 'worker-assignment-card';
        assignmentCard.innerHTML = `
            <div class="assignment-header">
                <h5>${assignment.worker_name || 'Unknown Worker'}</h5>
                <span class="status-badge ${assignment.status ? assignment.status.toLowerCase() : 'active'}">${assignment.status || 'Active'}</span>
            </div>
            <div class="assignment-details">
                <div class="detail-row">
                    <span class="label">Project:</span>
                    <span class="value">${assignment.project_name || 'Unassigned'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Task:</span>
                    <span class="value">${assignment.task_description || 'No task description'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Employee ID:</span>
                    <span class="value">${assignment.worker_employee_id || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Assigned Date:</span>
                    <span class="value">${assignment.assigned_date || 'Recent'}</span>
                </div>
                ${assignment.notes ? `
                <div class="detail-row">
                    <span class="label">Notes:</span>
                    <span class="value">${assignment.notes}</span>
                </div>
                ` : ''}
                ${assignment.project_location ? `
                <div class="detail-row">
                    <span class="label">Location:</span>
                    <span class="value">${assignment.project_location}</span>
                </div>
                ` : ''}
            </div>
        `;
        workerResults.appendChild(assignmentCard);
    });
}

// Update allocation chart
function updateAllocationChart(assignments) {
    const allocationChart = document.querySelector('.allocation-chart');
    
    // Ensure assignments is an array
    const assignmentsArray = Array.isArray(assignments) ? assignments : [];
    
    if (!allocationChart || !assignmentsArray || assignmentsArray.length === 0) {
        return;
    }
    
    // Group assignments by project
    const projectGroups = {};
    assignmentsArray.forEach(assignment => {
        if (!projectGroups[assignment.project_name]) {
            projectGroups[assignment.project_name] = 0;
        }
        projectGroups[assignment.project_name]++;
    });
    
    // Clear existing chart
    allocationChart.innerHTML = '';
    
    // Create allocation bars
    Object.entries(projectGroups).forEach(([projectName, workerCount]) => {
        const allocationItem = document.createElement('div');
        allocationItem.className = 'allocation-item';
        
        // Calculate percentage based on max workers
        const maxWorkers = Math.max(...Object.values(projectGroups));
        const percentage = Math.round((workerCount / maxWorkers) * 100);
        
        allocationItem.innerHTML = `
            <span>${projectName}</span>
            <div class="allocation-bar">
                <div class="allocation-fill" style="width: ${percentage}%">${workerCount} workers</div>
            </div>
        `;
        
        allocationChart.appendChild(allocationItem);
    });
}

// Filter assigned workers
function filterAssignedWorkers() {
    const searchTerm = document.getElementById('workerSearch').value.toLowerCase();
    const projectFilter = document.getElementById('projectFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    
    // Start with all assignments
    let filteredAssignments = [...allAssignments];
    
    // Filter by search term (worker name, project, task, employee ID, location)
    if (searchTerm) {
        filteredAssignments = filteredAssignments.filter(assignment => {
            const workerName = (assignment.worker_name || '').toLowerCase();
            const projectName = (assignment.project_name || '').toLowerCase();
            const taskDescription = (assignment.task_description || '').toLowerCase();
            const employeeId = (assignment.worker_employee_id || '').toLowerCase();
            const location = (assignment.project_location || '').toLowerCase();
            const notes = (assignment.notes || '').toLowerCase();
            
            return workerName.includes(searchTerm) ||
                   projectName.includes(searchTerm) ||
                   taskDescription.includes(searchTerm) ||
                   employeeId.includes(searchTerm) ||
                   location.includes(searchTerm) ||
                   notes.includes(searchTerm);
        });
    }
    
    // Filter by project
    if (projectFilter) {
        filteredAssignments = filteredAssignments.filter(assignment => 
            assignment.project_id == projectFilter
        );
    }
    
    // Filter by department
    if (departmentFilter) {
        filteredAssignments = filteredAssignments.filter(assignment => 
            assignment.department == departmentFilter
        );
    }
    
    // Display filtered results
    displayWorkerAssignments(filteredAssignments);
    
    // Update allocation chart based on filtered results
    updateAllocationChart(filteredAssignments);
    
    console.log(`Filtered ${allAssignments.length} assignments to ${filteredAssignments.length} results`);
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper function to display errors
function displayError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// ===== DOCUMENT MANAGEMENT FUNCTIONS =====
// Note: loadDocuments function is now in department.html to avoid conflicts

// Display documents function
function displayDocuments(documents) {
    const docsGrid = document.getElementById('docsGrid');
    if (!docsGrid) return;
    
    if (!documents || documents.length === 0) {
        docsGrid.innerHTML = '<div class="no-documents">No documents found</div>';
        return;
    }
    
    docsGrid.innerHTML = documents.map(doc => `
        <div class="doc-item" data-id="${doc.id}" data-department="${doc.affected_department}" data-type="${doc.work_type}">
            <div class="doc-info">
                <h5>${doc.work_title}</h5>
                <p>Type: ${doc.work_type} | Department: ${doc.affected_department || doc.department_code}</p>
                <p>Last Updated: ${new Date(doc.submitted_date).toLocaleDateString()}</p>
                <p>Status: ${doc.status || 'Active'}</p>
            </div>
            <div class="doc-actions">
                <button class="action edit-btn" onclick="editDoc('${doc.id}')">Edit</button>
                <button class="action view-btn" onclick="viewDoc('${doc.id}')">View</button>
                <button class="action download-btn" onclick="downloadDoc('${doc.id}')">Download</button>
            </div>
        </div>
    `).join('');
}

// Edit document
async function editDoc(docId) {
    try {
        // Check if KashTecAPI is available
        if (typeof KashTecAPI === 'undefined') {
            console.error('❌ KashTecAPI is not available');
            alert('API service not loaded. Please refresh page.');
            return;
        }
        
        console.log('Editing document:', docId);
        
        // Get document details
        const doc = await KashTecAPI.getDocument(docId);
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Document</h3>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editDocForm">
                        <div class="form-group">
                            <label>Document Title:</label>
                            <input type="text" id="editTitle" value="${doc.title || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Description:</label>
                            <textarea id="editDescription">${doc.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Status:</label>
                            <select id="editStatus">
                                <option value="active" ${doc.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${doc.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="archived" ${doc.status === 'archived' ? 'selected' : ''}>Archived</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="action">Save Changes</button>
                            <button type="button" class="action secondary" onclick="closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Handle form submission
        document.getElementById('editDocForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updateData = {
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDescription').value,
                status: document.getElementById('editStatus').value
            };
            
            await KashTecAPI.updateDocument(docId, updateData);
            closeModal();
            // Note: loadDocuments() is now in department.html
        });
        
    } catch (error) {
        console.error('Error editing document:', error);
        alert('Failed to edit document: ' + error.message);
    }
}

// View document
async function viewDoc(docId) {
    try {
        // Check if KashTecAPI is available
        if (typeof KashTecAPI === 'undefined') {
            console.error('❌ KashTecAPI is not available');
            alert('API service not loaded. Please refresh page.');
            return;
        }
        
        console.log('Viewing document:', docId);
        
        // Get document details
        const doc = await KashTecAPI.getDocument(docId);
        
        // Create view modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>View Document</h3>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="doc-details">
                        <h4>${doc.title}</h4>
                        <p><strong>Type:</strong> ${doc.type || 'PDF'}</p>
                        <p><strong>Department:</strong> ${doc.department || 'Admin'}</p>
                        <p><strong>Status:</strong> ${doc.status || 'active'}</p>
                        <p><strong>Last Updated:</strong> ${formatDate(doc.uploadedDate)}</p>
                        ${doc.description ? `<p><strong>Description:</strong> ${doc.description}</p>` : ''}
                        ${doc.work_type ? `<p><strong>Work Type:</strong> ${doc.work_type}</p>` : ''}
                    </div>
                    <div class="form-actions">
                        <button class="action" onclick="downloadDoc('${docId}')">Download</button>
                        <button class="action secondary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error viewing document:', error);
        alert('Failed to view document: ' + error.message);
    }
}

// Download document
async function downloadDoc(docId) {
    try {
        // Check if KashTecAPI is available
        if (typeof KashTecAPI === 'undefined') {
            console.error('❌ KashTecAPI is not available');
            alert('API service not loaded. Please refresh page.');
            return;
        }
        
        console.log('Downloading document:', docId);
        await KashTecAPI.downloadDocument(docId);
    } catch (error) {
        console.error('Error downloading document:', error);
        alert('Failed to download document: ' + error.message);
    }
}

// Filter documents by search
function filterDocs() {
    const searchTerm = document.getElementById('docSearchInput').value.toLowerCase();
    const docItems = document.querySelectorAll('.doc-item');
    
    docItems.forEach(item => {
        const title = item.querySelector('h5').textContent.toLowerCase();
        const description = item.querySelector('.doc-info').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Filter documents by department
function filterDocsByDept() {
    const deptFilter = document.getElementById('deptFilter').value;
    const docItems = document.querySelectorAll('.doc-item');
    
    docItems.forEach(item => {
        const department = item.getAttribute('data-department');
        
        if (!deptFilter || department === deptFilter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize document loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Previous initializations...
    const projectSelect = document.getElementById('progressProject');
    if (projectSelect) {
        loadProjects();
    }
    
    const workerResults = document.getElementById('workerResults');
    if (workerResults) {
        loadWorkerAssignments();
    }
    
    // Note: loadDocuments() is now in department.html
    const docsGrid = document.getElementById('docsGrid');
    if (docsGrid) {
        // loadDocuments(); // This is now handled by department.html
    }
});

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
    var account = document.getElementById("account");
    var login = document.getElementById("login");
    var customerPortal = document.getElementById("customerPortal");
    
    // Check if elements exist before trying to use them
    if (account) account.classList.add("hidden");
    if (login) login.classList.add("hidden");
    if (customerPortal) customerPortal.classList.add("hidden");
}

function updateNavigation(state) {
    var registerNav = document.getElementById("registerNav");
    var loginNav = document.getElementById("loginNav");
    var portalNav = document.getElementById("portalNav");
    
    // Check if elements exist before trying to use them
    if (!registerNav || !loginNav || !portalNav) {
        // Navigation elements not found in department portal - this is expected
        return;
    }
    
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
        
        // Show custom rejection modal instead of prompt
        showRejectionModal('Policy Rejection', 'Please enter rejection reason:', (rejectionReason) => {
            if (!rejectionReason) {
                showNotification('Rejection cancelled', 'info', 2000);
                return;
            }
            
            // Process rejection
            processPolicyRejection(policyId, rejectionReason, rejectedBy);
        });
    } catch (error) {
        console.error('❌ Error rejecting policy:', error);
        showNotification('Error rejecting policy: ' + error.message, 'error', 5000);
    }
}

async function processPolicyRejection(policyId, rejectionReason, rejectedBy) {
    try {
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
        console.error('❌ Error processing policy rejection:', error);
        showNotification('Error rejecting policy: ' + error.message, 'error', 5000);
    }
}

async function requestPolicyRevision(policyId) {
    try {
        console.log('🔄 Requesting revision for policy:', policyId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const requestedBy = currentUser.email || 'HR Manager';
        
        // Show custom revision modal instead of prompt
        showRevisionModal('Policy Revision Request', 'Please enter revision request details:', (revisionRequest) => {
            if (!revisionRequest) {
                showNotification('Revision request cancelled', 'info', 2000);
                return;
            }
            
            // Process revision request
            processPolicyRevision(policyId, revisionRequest, requestedBy);
        });
    } catch (error) {
        console.error('❌ Error requesting revision:', error);
        showNotification('Error requesting revision: ' + error.message, 'error', 5000);
    }
}

async function processPolicyRevision(policyId, revisionRequest, requestedBy) {
    try {
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
        console.error('❌ Error processing policy revision:', error);
        showNotification('Error requesting revision: ' + error.message, 'error', 5000);
    }
}


function showRevisionModal(title, message, callback) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #ffc107;">${title}</h3>
        <p style="margin: 0 0 20px 0; color: #666;">${message}</p>
        <textarea id="revisionRequest" rows="4" style="
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            resize: vertical;
            box-sizing: border-box;
        " placeholder="Enter detailed revision request..."></textarea>
        <div style="margin-top: 20px; text-align: right;">
            <button id="cancelRevision" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                margin-right: 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
            <button id="confirmRevision" style="
                background: #ffc107;
                color: #212529;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            ">Request Revision</button>
        </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .modal-overlay {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        #revisionRequest:focus {
            outline: none;
            border-color: #ffc107;
            box-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
        }
        #confirmRevision:hover {
            background: #e0a800;
        }
        #cancelRevision:hover {
            background: #5a6268;
        }
    `;
    
    modalOverlay.appendChild(modalContent);
    document.head.appendChild(style);
    document.body.appendChild(modalOverlay);
    
    // Add event listeners
    const confirmBtn = modalContent.querySelector('#confirmRevision');
    const cancelBtn = modalContent.querySelector('#cancelRevision');
    const textarea = modalContent.querySelector('#revisionRequest');
    
    // Auto-focus textarea
    setTimeout(() => textarea.focus(), 100);
    
    // Handle confirm
    confirmBtn.addEventListener('click', () => {
        const request = textarea.value.trim();
        if (request) {
            callback(request);
            closeModal();
        } else {
            showNotification('Please enter revision request details', 'warning', 3000);
            textarea.focus();
        }
    });
    
    // Handle cancel
    cancelBtn.addEventListener('click', closeModal);
    
    // Handle escape key
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    });
    
    // Handle overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    function closeModal() {
        modalOverlay.remove();
        style.remove();
    }
}

async function loadPolicies() {
    try {
        console.log('🔍 Loading policies...');
        
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/policies`, {
                headers: {
                        'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                }
        });
        
        const policies = await response.json();
        
        if (response.ok) {
                console.log('📋 Policies loaded:', policies);
                // Check if policies is an array before processing
                if (Array.isArray(policies)) {
                    displayPolicies(policies);
                } else {
                    console.warn('⚠️ Policies data is not an array:', policies);
                    displayPolicies([]); // Show empty state
                }
        } else {
                console.error('❌ Failed to load policies:', policies);
                showNotification('Failed to load policies: ' + (policies.error || 'Unknown error'), 'error', 5000);
        }
        
    } catch (error) {
        console.error('❌ Error loading policies:', error);
        showNotification('Error loading policies: ' + error.message, 'error', 5000);
    }
}

function displayPolicies(policies) {
    let html = '<div class="card"><h3>Policy Management</h3>';
    
    // Ensure policies is an array
    if (!Array.isArray(policies)) {
        console.warn('⚠️ displayPolicies received non-array data:', policies);
        policies = [];
    }
    
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
        
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/senior-hiring`, {
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
        
        // Show custom rejection modal instead of prompt
        showRejectionModal('Senior Hiring Rejection', 'Please enter rejection reason:', (rejectionReason) => {
            if (!rejectionReason) {
                showNotification('Rejection cancelled', 'info', 2000);
                return;
            }
            
            // Process rejection
            processSeniorHiringRejection(requestId, rejectionReason, rejectedBy);
        });
    } catch (error) {
        console.error('❌ Error rejecting senior hiring request:', error);
        showNotification('Error rejecting senior hiring request: ' + error.message, 'error', 5000);
    }
}

async function processSeniorHiringRejection(requestId, rejectionReason, rejectedBy) {
    try {
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
        console.error('❌ Error processing senior hiring rejection:', error);
        showNotification('Error rejecting senior hiring request: ' + error.message, 'error', 5000);
    }
}

async function requestMoreInfo(requestId) {
    try {
        console.log('🔄 Requesting more info for senior hiring request:', requestId);
        
        // Get current user
        const currentUser = sessionManager.getCurrentUser() || {};
        const requestedBy = currentUser.email || 'HR Manager';
        
        // Show custom info request modal instead of prompt
        showInfoRequestModal('Information Request', 'Please specify information required:', (infoRequired) => {
            if (!infoRequired) {
                showNotification('Info request cancelled', 'info', 2000);
                return;
            }
            
            // Process info request
            processSeniorHiringInfoRequest(requestId, infoRequired, requestedBy);
        });
    } catch (error) {
        console.error('❌ Error requesting more information:', error);
        showNotification('Error requesting more information: ' + error.message, 'error', 5000);
    }
}

async function processSeniorHiringInfoRequest(requestId, infoRequired, requestedBy) {
    try {
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
        console.error('❌ Error processing senior hiring info request:', error);
        showNotification('Error requesting more information: ' + error.message, 'error', 5000);
    }
}

// Additional custom modal for info requests
function showInfoRequestModal(title, message, callback) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease-out;
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #17a2b8;">${title}</h3>
        <p style="margin: 0 0 20px 0; color: #666;">${message}</p>
        <textarea id="infoRequest" rows="4" style="
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            resize: vertical;
            box-sizing: border-box;
        " placeholder="Enter information required..."></textarea>
        <div style="margin-top: 20px; text-align: right;">
            <button id="cancelInfoRequest" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                margin-right: 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
            <button id="confirmInfoRequest" style="
                background: #17a2b8;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Request Info</button>
        </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .modal-overlay {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        #infoRequest:focus {
            outline: none;
            border-color: #17a2b8;
            box-shadow: 0 0 5px rgba(23, 162, 184, 0.3);
        }
        #confirmInfoRequest:hover {
            background: #138496;
        }
        #cancelInfoRequest:hover {
            background: #5a6268;
        }
    `;
    
    modalOverlay.appendChild(modalContent);
    document.head.appendChild(style);
    document.body.appendChild(modalOverlay);
    
    // Add event listeners
    const confirmBtn = modalContent.querySelector('#confirmInfoRequest');
    const cancelBtn = modalContent.querySelector('#cancelInfoRequest');
    const textarea = modalContent.querySelector('#infoRequest');
    
    // Auto-focus textarea
    setTimeout(() => textarea.focus(), 100);
    
    // Handle confirm
    confirmBtn.addEventListener('click', () => {
        const info = textarea.value.trim();
        if (info) {
            callback(info);
            closeModal();
        } else {
            showNotification('Please enter information required', 'warning', 3000);
            textarea.focus();
        }
    });
    
    // Handle cancel
    cancelBtn.addEventListener('click', closeModal);
    
    // Handle escape key
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    });
    
    // Handle overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    function closeModal() {
        modalOverlay.remove();
        style.remove();
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
    
    // TODO: Load user data from API instead of localStorage
    var currentUser = sessionStorage.getItem('kashtec_user') || null;
    var rememberEmail = sessionStorage.getItem('kashtec_remember_email') || null;
    
    // Add event listeners to replace inline handlers
    var loginBtn = document.getElementById("loginBtn");
    console.log('🔍 Login button element (DOMContentLoaded):', loginBtn);
    console.log('🔍 Login button exists:', !!loginBtn);
    console.log('🔍 Login button type:', loginBtn ? loginBtn.tagName : 'null');
    console.log('🔍 Login button class:', loginBtn ? loginBtn.className : 'null');
    
    if (loginBtn && !loginBtn.hasAttribute('data-listener-attached')) {
        loginBtn.addEventListener('click', function(e) {
            console.log('🖱️ Login button clicked!', e);
            console.log('🖱️ Event type:', e.type);
            console.log('🖱️ Event target:', e.target);
            console.log('🖱️ Current target:', e.currentTarget);
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
        });
        loginBtn.setAttribute('data-listener-attached', 'true');
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
        document.getElementById("rememberMe").checked = true;
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

// Save Site Report function
async function saveSiteReport(event) {
    try {
        // Prevent default form submission
        event.preventDefault();
        
        console.log('Saving site report...');
        
        // Get form values
        const reportData = {
            project_id: document.getElementById('reportProject').value,
            report_date: document.getElementById('reportDate').value,
            weather_conditions: document.getElementById('weatherConditions').value,
            site_supervisor: document.getElementById('siteSupervisor').value,
            workers_present: document.getElementById('workersPresent').value,
            work_completed: document.getElementById('workCompleted').value,
            site_issues: document.getElementById('siteIssues').value,
            safety_incidents: document.getElementById('safetyIncidents').value,
            materials_used: document.getElementById('materialsUsed').value,
            equipment_used: document.getElementById('equipmentUsed').value,
            next_day_plan: document.getElementById('nextDayPlan').value
        };
        
        console.log('Site report data:', reportData);
        
        // Validate required fields
        if (!reportData.project_id || !reportData.report_date || !reportData.weather_conditions || 
            !reportData.workers_present || !reportData.work_completed || !reportData.next_day_plan) {
            alert('Please fill in all required fields marked with *');
            return false;
        }
        
        // Send data to backend
        const response = await window.apiService.post('/work/site-reports', reportData);
        
        console.log('Site report saved successfully:', response);
        
        // Show success message
        try {
            alert('Site report submitted successfully!');
        } catch (e) {
            console.error('Alert error:', e);
        }
        
        // Reset form
        document.getElementById('siteReportForm').reset();
        
        // Reload recent reports (if function exists)
        if (typeof loadRecentSiteReports === 'function') {
            loadRecentSiteReports();
        }
        
        return false; // Prevent form submission
        
    } catch (error) {
        console.error('Error saving site report:', error);
        try {
            alert('Failed to save site report. Please try again.');
        } catch (e) {
            console.error('Alert error:', e);
        }
        return false;
    }
}

// Work Approval functions
function approveWork(workId) {
    console.log('Approving work:', workId);
    
    // Populate the form with the work ID
    document.getElementById('workId').value = workId;
    
    // Set default values for approval
    document.getElementById('qualityAssessment').value = 'excellent';
    document.getElementById('complianceCheck').value = 'fully-compliant';
    document.getElementById('approvalComments').value = 'Work approved successfully. Quality meets all requirements.';
    
    // Scroll to the approval form
    document.getElementById('approvalForm').scrollIntoView({ behavior: 'smooth' });
    
    // Show success message
    try {
        alert(`Preparing approval for work item: ${workId}`);
    } catch (e) {
        console.error('Alert error:', e);
    }
}

function requestRework(workId) {
    console.log('Requesting rework for:', workId);
    
    // Populate the form with the work ID
    document.getElementById('workId').value = workId;
    
    // Set default values for rework
    document.getElementById('qualityAssessment').value = 'acceptable';
    document.getElementById('complianceCheck').value = 'minor-issues';
    document.getElementById('approvalComments').value = 'Rework required. Please address the identified issues before resubmission.';
    
    // Scroll to the approval form
    document.getElementById('approvalForm').scrollIntoView({ behavior: 'smooth' });
    
    // Show message
    try {
        alert(`Preparing rework request for work item: ${workId}`);
    } catch (e) {
        console.error('Alert error:', e);
    }
}

function rejectWork(workId) {
    console.log('Rejecting work:', workId);
    
    // Populate the form with the work ID
    document.getElementById('workId').value = workId;
    
    // Set default values for rejection
    document.getElementById('qualityAssessment').value = 'poor';
    document.getElementById('complianceCheck').value = 'non-compliant';
    document.getElementById('approvalComments').value = 'Work rejected. Significant issues need to be addressed.';
    
    // Scroll to the approval form
    document.getElementById('approvalForm').scrollIntoView({ behavior: 'smooth' });
    
    // Show message
    try {
        alert(`Preparing rejection for work item: ${workId}`);
    } catch (e) {
        console.error('Alert error:', e);
    }
}

async function saveWorkApproval(event) {
    try {
        // Prevent default form submission
        if (event) {
            event.preventDefault();
        }
        
        console.log('Saving work approval...');
        
        // Get form data
        const approvalData = {
            work_id: document.getElementById('workId').value,
            quality_assessment: document.getElementById('qualityAssessment').value,
            compliance_check: document.getElementById('complianceCheck').value,
            approval_comments: document.getElementById('approvalComments').value,
            safety_compliance: document.getElementById('safetyCompliance').value,
            time_completion: document.getElementById('timeCompletion').value
        };
        
        console.log('Work approval data:', approvalData);
        
        // Validate required fields
        if (!approvalData.work_id || !approvalData.quality_assessment || 
            !approvalData.compliance_check || !approvalData.approval_comments) {
            alert('Please fill in all required fields marked with *');
            return false;
        }
        
        // Send data to backend
        const response = await window.apiService.post('/work/approvals', approvalData);
        
        console.log('Work approval saved successfully:', response);
        
        // Show success message
        try {
            alert('Work approval submitted successfully!');
        } catch (e) {
            console.error('Alert error:', e);
        }
        
        // Reset form
        document.getElementById('approvalForm').reset();
        
        // Reload approvals (if function exists)
        if (typeof loadPendingApprovals === 'function') {
            loadPendingApprovals();
        }
        
        return false; // Prevent form submission
        
    } catch (error) {
        console.error('Error saving work approval:', error);
        try {
            alert('Failed to save work approval. Please try again.');
        } catch (e) {
            console.error('Alert error:', e);
        }
        return false;
    }
}

// ===== PROPERTY MANAGEMENT FUNCTIONS =====

// Load properties from database and populate the select dropdown
async function loadPropertiesForEdit() {
    try {
        console.log('Loading properties from database...');
        
        const response = await fetch('/api/properties/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const properties = await response.json();
        console.log('Properties loaded:', properties);
        
        const selectElement = document.getElementById('editPropertySelect');
        selectElement.innerHTML = '<option value="">Select Property</option>';
        
        if (properties && properties.length > 0) {
            properties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${property.title || property.plotNumber || 'Property ' + property.id} - ${property.location} (${property.status || 'Available'})`;
                selectElement.appendChild(option);
            });
        } else {
            console.log('No properties found in database');
        }
        
    } catch (error) {
        console.error('Error loading properties:', error);
        // Show error message to user
        const selectElement = document.getElementById('editPropertySelect');
        selectElement.innerHTML = '<option value="">Error loading properties</option>';
    }
}

// Load property details when a property is selected
async function loadPropertyDetails() {
    const propertyId = document.getElementById('editPropertySelect').value;
    
    if (!propertyId) {
        document.getElementById('propertyEditForm').classList.add('hidden');
        return;
    }
    
    try {
        console.log('Loading property details for ID:', propertyId);
        
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const property = await response.json();
        console.log('Property details loaded:', property);
        
        // Populate form fields with property data
        document.getElementById('editPlotNumber').value = property.plotNumber || extractPlotNumber(property.title) || '';
        document.getElementById('editPropertyType').value = property.type || 'residential';
        document.getElementById('editPropertyLocation').value = property.location || '';
        document.getElementById('editPropertyArea').value = property.size_sqm || property.area || '';
        document.getElementById('editPropertyPrice').value = property.price || '';
        document.getElementById('editPropertyStatus').value = property.status || 'available';
        document.getElementById('editTpNumber').value = property.tpNumber || '';
        document.getElementById('editPropertyDescription').value = property.description || '';
        
        // Show the edit form
        document.getElementById('propertyEditForm').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading property details:', error);
        alert('Error loading property details. Please try again.');
        document.getElementById('propertyEditForm').classList.add('hidden');
    }
}

// Save property edits to database
async function savePropertyEdits(event) {
    if (event) {
        event.preventDefault();
    }
    
    const propertyId = document.getElementById('editPropertySelect').value;
    
    if (!propertyId) {
        alert('Please select a property to edit');
        return false;
    }
    
    try {
        console.log('Saving property edits for ID:', propertyId);
        
        // Get form data
        const formData = {
            plotNumber: document.getElementById('editPlotNumber').value,
            type: document.getElementById('editPropertyType').value,
            location: document.getElementById('editPropertyLocation').value,
            area: document.getElementById('editPropertyArea').value,
            price: document.getElementById('editPropertyPrice').value,
            status: document.getElementById('editPropertyStatus').value,
            tpNumber: document.getElementById('editTpNumber').value,
            description: document.getElementById('editPropertyDescription').value,
            updateReason: document.getElementById('updateReason').value
        };
        
        console.log('Form data:', formData);
        
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Property updated successfully:', result);
        
        // Show success message
        customAlert(`Property ${formData.plotNumber} updated successfully!\n\nChanges have been saved and property status updated.`, "Property Updated", "success");
        
        // Reset form and hide it
        document.getElementById('editPropertyForm').reset();
        document.getElementById('propertyEditForm').classList.add('hidden');
        document.getElementById('editPropertySelect').value = '';
        
        // Reload properties to reflect changes
        loadPropertiesForEdit();
        
        return false;
        
    } catch (error) {
        console.error('Error saving property edits:', error);
        alert(`Error updating property: ${error.message}`);
        return false;
    }
}

// Helper function to extract plot number from title
function extractPlotNumber(title) {
    if (!title) return '';
    
    // Look for patterns like "Property PLOT-001" or "Property 001"
    const match = title.match(/(?:Property\s+)?(PLOT-?\d+|\d+)/i);
    return match ? match[1] : '';
}

// Initialize property loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load properties for edit form if the element exists
    const editPropertySelect = document.getElementById('editPropertySelect');
    if (editPropertySelect) {
        loadPropertiesForEdit();
    }
});
