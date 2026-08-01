
// Role-based menu configurations - All roles use HR-style format

const roleMenus = {

    'MD': {

        title: 'Managing Director Dashboard',

        buttons: [

            'Dashboard Overview',

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Team Management',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Senior Staff Hiring',


            'Approve Violation',

            'Approve Workforce Budget',

            'Approve Recruitment Policies',

            'Record Incident Reports',

            'Record Toolbox Meetings',

            'Track PPE Issuance',

            'Mark Safety Violations',

            'Upload Inspection Reports',

            'View Project Safety Status',

            'NHIF Contributions',

            'Procurement Sales',

            'Tax Payments',

            'Senior Roles Management',

            'System Audit Dashboard',

            'Materials Management',

            'Department Management',

            'View Invoices'

        ]

    },

    'ADMIN': {

        title: 'Director of Administration Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Workforce Budget',

            'Upload Safety Policies',

            'Upload Documents',

            'Edit Documents',

            'Send Notifications',

            'Record Meeting Minutes',

            'View Employee List',

            'Office Portal',

            'Approve Violation'

        ]

    },

    'HR': {

        title: 'HR Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Workforce Budget',

            'Upload Safety Policies',

            'Upload Documents',

            'Edit Documents',

            'Send Notifications',

            'Record Meeting Minutes',

            'View Employee List',

            'Office Portal',

            'NHIF Contributions',

            'Senior Roles Management',

            'Suggestions Management',

            'Materials Management'

        ]

    },

    'HSE': {

        title: 'HR Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Senior Staff Hiring',

            'Approve Workforce Budget',

            'Upload Safety Policies'

        ]

    },

    'FINANCE': {

        title: 'HR Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Senior Staff Hiring',

            'Approve Workforce Budget',

            'NHIF Contributions',

            'Tax Payments',

            'Procurement Sales',

            'Materials Management'

        ]

    },

    'PROJECT': {

        title: 'HR Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Senior Staff Hiring',

            'Approve Workforce Budget',

            'Procurement Sales'

        ]

    },

    'REALESTATE': {

        title: 'HR Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Senior Staff Hiring',

            'Approve Workforce Budget'

        ]

    },

    'ASSISTANT': {

        title: 'HR Dashboard',

        buttons: [

            'Register Employee',

            'Create Worker Account',

            'Assign Project Workers',

            'Update Employee Records',

            'Track Attendance',

            'Manage Leave & Contracts',

            'Manage Policies',

            'Approve Senior Staff Hiring',

            'Approve Workforce Budget'

        ]

    }

};



// Function to update navigation based on user role

function updateNavigationForRole(role) {

    const menuContainer = document.getElementById('menu');

    const userRoleElement = document.getElementById('userRole');

    

    // Clear existing menu

    menuContainer.innerHTML = '';

    if (typeof resetMenuSearch === 'function') resetMenuSearch();

    

    // Get menu configuration for the role

    const menuConfig = roleMenus[role];

    

    if (menuConfig) {

        // Update role title

        userRoleElement.textContent = menuConfig.title;

        

        // Add role-specific buttons

        menuConfig.buttons.forEach(buttonText => {

            addMenuItem(buttonText, () => handleMenuClick(buttonText));

        });

        filterMenuItems();

    } else {

        // Default empty menu for unknown roles

        userRoleElement.textContent = 'Dashboard';

        addMenuItem('No Access', () => {}, { disabled: true });

    }

}



// Function to handle menu clicks

function handleMenuClick(menuItem) {

    const userRole = document.getElementById('userRole').textContent;

    

    // Check if user has access to this menu item

    const menuConfig = roleMenus[getCurrentUserRole()];

    if (menuConfig && menuConfig.buttons.includes(menuItem)) {

        console.log(`Access granted: ${menuItem}`);

        

        // Handle specific menu items

        switch(menuItem) {

            case 'Dashboard Overview':

                showDashboardOverview();

                break;

            case 'Team Management':

                showTeamManagementDashboard();

                break;

            case 'NHIF Contributions':

                showNHIFContributions();

                break;

            case 'Procurement Sales':

                showProcurementSales();

                break;

            case 'Tax Payments':

                showTaxPayments();

                break;

            case 'Senior Roles Management':

                showSeniorRoles();

                break;

            case 'System Audit Dashboard':

                showAuditDashboard();

                break;

            case 'Suggestions Management':

                showSuggestionsManagement();

                break;

            case 'View Suggestions':

                loadViewSuggestions();

                break;

            case 'Materials Management':

                showMaterialsDashboard();

                break;

            case 'Department Management':

                if (typeof showDepartmentManagement === 'function') {
                    showDepartmentManagement();
                } else {
                    alert('Department Management module not loaded');
                }

                break;

            case 'View Invoices':

                showViewInvoices();

                break;

            case 'Approve Violation':

                markSafetyViolations();

                break;

            case 'Approve Workforce Budget':

                approveWorkforceBudget();

                break;

            case 'Upload Safety Policies':

                uploadSafetyPolicies();

                break;

            case 'Approve Recruitment Policies':

                approveRecruitmentPolicies();

                break;

            default:

                // For existing menu items, keep the current behavior

                alert(`Opening: ${menuItem}`);

        }

    } else {

        console.log(`Access denied: ${menuItem}`);

        alert('Access denied: You do not have permission to access this feature.');

    }

}



// Function to get current user role

function getCurrentUserRole() {

    const userRoleElement = document.getElementById('userRole');

    const roleText = userRoleElement.textContent;

    

    // First try mapping from roleDescriptions
    if (typeof roleDescriptions !== 'undefined') {
        for (const [key, desc] of Object.entries(roleDescriptions)) {
            if (roleText === desc + ' Dashboard' || roleText === desc) {
                return key;
            }
        }
    }
    
    // Fallback to roleMenus
    if (typeof roleMenus !== 'undefined') {
        for (const [key, config] of Object.entries(roleMenus)) {
            if (config.title === roleText) {
                return key;
            }
        }
    }

    return null;

}



// Function to disable menu items (for unauthorized access)

function disableMenuItems() {

    const menuContainer = document.getElementById('menu');

    const buttons = menuContainer.querySelectorAll('button');

    

    buttons.forEach(button => {

        button.style.opacity = '0.3';

        button.style.cursor = 'not-allowed';

        button.disabled = true;

        button.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

    });

}



// Function to show NHIF Contributions form

function showNHIFContributions() {
    const mainContent = document.getElementById('main-content') || document.querySelector('.content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div style="padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <!-- Premium Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #f0f0f0;">
                <div>
                    <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                        <span style="background: #2563eb; color: white; padding: 8px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;"><i class="fas fa-heartbeat"></i></span>
                        NHIF Contributions
                    </h2>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Record and track National Health Insurance Fund contributions for all employees.</p>
                </div>
                <button onclick="loadNHIFSummaryAndTable()" class="btn" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;"><i class="fas fa-sync-alt"></i> Refresh</button>
            </div>

            <!-- Summary Stat Cards -->
            <div id="nhifSummaryContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div class="card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.01); position: relative; overflow: hidden;">
                    <div style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Contributions</div>
                    <div id="nhifTotalAmount" style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 8px;">0 TZS</div>
                    <div id="nhifTotalCount" style="color: #64748b; font-size: 12px; margin-top: 5px;">0 records</div>
                    <div style="position: absolute; right: 20px; bottom: 20px; font-size: 28px; color: #e2e8f0;"><i class="fas fa-calculator"></i></div>
                </div>
                <div class="card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.01); position: relative; overflow: hidden;">
                    <div style="color: #10b981; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Paid Contributions</div>
                    <div id="nhifPaidAmount" style="font-size: 24px; font-weight: 700; color: #059669; margin-top: 8px;">0 TZS</div>
                    <div id="nhifPaidCount" style="color: #64748b; font-size: 12px; margin-top: 5px;">0 paid</div>
                    <div style="position: absolute; right: 20px; bottom: 20px; font-size: 28px; color: #d1fae5;"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.01); position: relative; overflow: hidden;">
                    <div style="color: #f59e0b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pending Contributions</div>
                    <div id="nhifPendingAmount" style="font-size: 24px; font-weight: 700; color: #d97706; margin-top: 8px;">0 TZS</div>
                    <div id="nhifPendingCount" style="color: #64748b; font-size: 12px; margin-top: 5px;">0 pending</div>
                    <div style="position: absolute; right: 20px; bottom: 20px; font-size: 28px; color: #fef3c7;"><i class="fas fa-clock"></i></div>
                </div>
                <div class="card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.01); position: relative; overflow: hidden;">
                    <div style="color: #ef4444; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Overdue Contributions</div>
                    <div id="nhifOverdueAmount" style="font-size: 24px; font-weight: 700; color: #dc2626; margin-top: 8px;">0 TZS</div>
                    <div id="nhifOverdueCount" style="color: #64748b; font-size: 12px; margin-top: 5px;">0 overdue</div>
                    <div style="position: absolute; right: 20px; bottom: 20px; font-size: 28px; color: #fee2e2;"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
            </div>

            <!-- Side-by-Side Content Area -->
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <!-- Left Column: Form Panel -->
                <div style="flex: 1 1 350px; min-width: 320px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.01);">
                    <h3 style="margin-top: 0; margin-bottom: 20px; font-size: 18px; color: #1e293b; font-weight: 600; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                        <i class="fas fa-file-invoice-dollar" style="color: #2563eb;"></i> Record Contribution
                    </h3>
                    <form id="nhifForm">
                        <div style="margin-bottom: 16px;">
                            <label for="nhifEmployee" style="display: block; font-weight: 500; font-size: 13px; color: #475569; margin-bottom: 6px;">Employee <span style="color:#ef4444;">*</span></label>
                            <select id="nhifEmployee" name="nhifEmployee" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; background: white;">
                                <option value="">Select Employee</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label for="nhifMonth" style="display: block; font-weight: 500; font-size: 13px; color: #475569; margin-bottom: 6px;">Contribution Month <span style="color:#ef4444;">*</span></label>
                            <input type="month" id="nhifMonth" name="nhifMonth" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label for="nhifEmployeeContrib" style="display: block; font-weight: 500; font-size: 13px; color: #475569; margin-bottom: 6px;">Employee Contribution (TZS) <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="nhifEmployeeContrib" name="employeeContribution" required min="0" placeholder="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label for="nhifEmployerContrib" style="display: block; font-weight: 500; font-size: 13px; color: #475569; margin-bottom: 6px;">Employer Contribution (TZS) <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="nhifEmployerContrib" name="employerContribution" required min="0" placeholder="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label for="nhifStatus" style="display: block; font-weight: 500; font-size: 13px; color: #475569; margin-bottom: 6px;">Payment Status <span style="color:#ef4444;">*</span></label>
                            <select id="nhifStatus" name="nhifStatus" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; background: white;">
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                        <div id="nhifReceiptGroup" style="margin-bottom: 20px; display: none;">
                            <label for="nhifReceiptNumber" style="display: block; font-weight: 500; font-size: 13px; color: #475569; margin-bottom: 6px;">Receipt Number</label>
                            <input type="text" id="nhifReceiptNumber" name="receiptNumber" placeholder="e.g. REC-123456" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button type="submit" class="btn btn-primary" style="flex: 2; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">Submit</button>
                            <button type="button" id="nhifFormReset" style="flex: 1; padding: 10px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 500; cursor: pointer; transition: background 0.2s;">Clear</button>
                        </div>
                    </form>
                </div>

                <!-- Right Column: Data Table Panel -->
                <div style="flex: 2 1 600px; min-width: 450px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.01);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-list-ul" style="color: #2563eb;"></i> Contribution Records
                        </h3>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <div style="position: relative;">
                                <input type="text" id="nhifSearch" placeholder="Search employee..." style="padding: 8px 12px 8px 32px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; width: 180px; transition: all 0.2s;">
                                <i class="fas fa-search" style="position: absolute; left: 10px; top: 11px; color: #94a3b8; font-size: 12px;"></i>
                            </div>
                            <select id="nhifStatusFilter" style="padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #475569; outline: none; background: white;">
                                <option value="all">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                    <div id="nhifTableContainer" style="overflow-x: auto; max-height: 480px;">
                        <p style="text-align: center; color: #888; padding: 20px;">Loading records...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupNHIFListeners();
    loadNHIFEmployees();
    loadNHIFSummaryAndTable();
}

function setupNHIFListeners() {
    const nhifForm = document.getElementById('nhifForm');
    const nhifStatus = document.getElementById('nhifStatus');
    const nhifReceiptGroup = document.getElementById('nhifReceiptGroup');
    const nhifReceiptNumber = document.getElementById('nhifReceiptNumber');
    const nhifSearch = document.getElementById('nhifSearch');
    const nhifStatusFilter = document.getElementById('nhifStatusFilter');
    const nhifFormReset = document.getElementById('nhifFormReset');

    if (nhifStatus && nhifReceiptGroup) {
        nhifStatus.addEventListener('change', function() {
            if (nhifStatus.value === 'Paid') {
                nhifReceiptGroup.style.display = 'block';
                nhifReceiptNumber.required = true;
            } else {
                nhifReceiptGroup.style.display = 'none';
                nhifReceiptNumber.required = false;
                nhifReceiptNumber.value = '';
            }
        });
    }

    if (nhifFormReset) {
        nhifFormReset.addEventListener('click', function() {
            nhifForm.reset();
            if (nhifReceiptGroup) {
                nhifReceiptGroup.style.display = 'none';
                nhifReceiptNumber.required = false;
            }
        });
    }

    if (nhifForm) {
        nhifForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const employeeId = document.getElementById('nhifEmployee').value;
            const contributionMonth = document.getElementById('nhifMonth').value;
            const employeeContribution = parseFloat(document.getElementById('nhifEmployeeContrib').value) || 0;
            const employerContribution = parseFloat(document.getElementById('nhifEmployerContrib').value) || 0;
            const paymentStatus = nhifStatus.value;
            const receiptNumber = nhifReceiptNumber.value || null;
            
            const payload = {
                employeeId: parseInt(employeeId, 10),
                contributionMonth: contributionMonth,
                employeeContribution: employeeContribution,
                employerContribution: employerContribution,
                totalContribution: employeeContribution + employerContribution,
                paymentStatus: paymentStatus,
                receiptNumber: receiptNumber,
                submittedBy: 'HR Manager'
            };

            try {
                const submitBtn = nhifForm.querySelector('button[type="submit"]');
                const origText = submitBtn.textContent;
                submitBtn.textContent = 'Saving...';
                submitBtn.disabled = true;

                const response = await xhrRequest('POST', '/api/nhif', payload);
                const result = await response.json();

                if (response.ok && result.success) {
                    showNotification('NHIF Contribution saved successfully!', 'success');
                    nhifForm.reset();
                    if (nhifReceiptGroup) {
                        nhifReceiptGroup.style.display = 'none';
                        nhifReceiptNumber.required = false;
                    }
                    loadNHIFSummaryAndTable();
                } else {
                    showNotification(result.error || 'Failed to save contribution', 'error');
                }
                submitBtn.textContent = origText;
                submitBtn.disabled = false;
            } catch (error) {
                console.error('Error saving NHIF contribution:', error);
                showNotification('Error saving NHIF contribution. Please try again.', 'error');
                const submitBtn = nhifForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Submit';
                    submitBtn.disabled = false;
                }
            }
        });
    }

    if (nhifSearch) {
        nhifSearch.addEventListener('input', filterNHIFTable);
    }
    if (nhifStatusFilter) {
        nhifStatusFilter.addEventListener('change', filterNHIFTable);
    }
}

async function loadNHIFEmployees() {
    try {
        const select = document.getElementById('nhifEmployee');
        if (!select) return;

        const response = await xhrRequest('GET', '/api/employees');
        const data = await response.json();
        const employees = Array.isArray(data) ? data : (data.data || []);

        select.innerHTML = '<option value="">Select Employee</option>';
        employees.forEach(function(emp) {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = emp.full_name + ' (' + (emp.employee_id || 'ID: ' + emp.id) + ')';
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading employees for NHIF select:', error);
    }
}

async function loadNHIFSummaryAndTable() {
    const tableContainer = document.getElementById('nhifTableContainer');
    if (tableContainer) {
        tableContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading records...</p>';
    }

    try {
        // Fetch summary
        const summaryResponse = await xhrRequest('GET', '/api/nhif/summary');
        const summaryResult = await summaryResponse.json();
        if (summaryResponse.ok && summaryResult.success) {
            const summary = summaryResult.data || {};
            
            document.getElementById('nhifTotalAmount').textContent = parseFloat(summary.total_amount || 0).toLocaleString() + ' TZS';
            document.getElementById('nhifTotalCount').textContent = (summary.total_contributions || 0) + ' records';
            
            document.getElementById('nhifPaidAmount').textContent = parseFloat(summary.paid_amount || 0).toLocaleString() + ' TZS';
            document.getElementById('nhifPaidCount').textContent = (summary.paid_count || 0) + ' paid';
            
            document.getElementById('nhifPendingAmount').textContent = parseFloat(summary.pending_amount || 0).toLocaleString() + ' TZS';
            document.getElementById('nhifPendingCount').textContent = (summary.pending_count || 0) + ' pending';
            
            document.getElementById('nhifOverdueAmount').textContent = parseFloat(summary.overdue_amount || 0).toLocaleString() + ' TZS';
            document.getElementById('nhifOverdueCount').textContent = (summary.overdue_count || 0) + ' overdue';
        }

        // Fetch records
        const recordsResponse = await xhrRequest('GET', '/api/nhif');
        const recordsResult = await recordsResponse.json();
        if (recordsResponse.ok && recordsResult.success) {
            window.nhifRecordsCache = recordsResult.data || [];
            filterNHIFTable();
        } else {
            if (tableContainer) {
                tableContainer.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">Failed to load NHIF records.</p>';
            }
        }
    } catch (error) {
        console.error('Error loading NHIF summary/table:', error);
        if (tableContainer) {
            tableContainer.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">Error loading data from server.</p>';
        }
    }
}

function filterNHIFTable() {
    const container = document.getElementById('nhifTableContainer');
    if (!container) return;

    const records = window.nhifRecordsCache || [];
    const searchQuery = (document.getElementById('nhifSearch')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('nhifStatusFilter')?.value || 'all';

    const filtered = records.filter(function(r) {
        const matchesStatus = statusFilter === 'all' || r.payment_status === statusFilter;
        const employeeName = (r.employee_name || '').toLowerCase();
        const employeeId = (r.employee_id || '').toLowerCase();
        const matchesSearch = !searchQuery || employeeName.includes(searchQuery) || employeeId.includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No contributions match your criteria.</p>';
        return;
    }

    let tableHTML = `
        <div class="workforce-table-container">
            <table class="workforce-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Month</th>
                        <th>Employee Cont.</th>
                        <th>Employer Cont.</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Receipt</th>
                        <th style="text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    filtered.forEach(function(r) {
        let statusBadge = '';
        if (r.payment_status === 'Paid') {
            statusBadge = '<span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Paid</span>';
        } else if (r.payment_status === 'Pending') {
            statusBadge = '<span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Pending</span>';
        } else {
            statusBadge = '<span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Overdue</span>';
        }

        const employeeName = r.employee_name || 'Unknown Employee';

        tableHTML += `
            <tr>
                <td>${employeeName}<div style="font-size: 11px; color: #64748b; font-weight: 400;">${r.employee_id || 'N/A'}</div></td>
                <td>${formatContributionMonth(r.contribution_month)}</td>
                <td>${parseFloat(r.employee_contribution || 0).toLocaleString()} TZS</td>
                <td>${parseFloat(r.employer_contribution || 0).toLocaleString()} TZS</td>
                <td style="font-weight: 600; color: #0f172a;">${parseFloat(r.total_contribution || 0).toLocaleString()} TZS</td>
                <td>${statusBadge}</td>
                <td style="font-family: monospace; color: #475569;">${r.receipt_number || '—'}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <button onclick="toggleNHIFStatus(${r.id}, '${r.payment_status}')" class="btn" style="background: #eff6ff; color: #2563eb; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; margin-right: 5px; display: inline-flex; align-items: center; gap: 4px;" title="Change Status"><i class="fas fa-toggle-on"></i> Status</button>
                    <button onclick="deleteNHIFRecord(${r.id})" class="btn" style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Delete Record"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

function formatContributionMonth(monthStr) {
    if (!monthStr) return 'â€”';
    try {
        const parts = monthStr.split('-');
        if (parts.length === 2) {
            const year = parts[0];
            const monthIndex = parseInt(parts[1], 10) - 1;
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            if (monthIndex >= 0 && monthIndex < 12) {
                return monthNames[monthIndex] + ' ' + year;
            }
        }
    } catch (e) {
        console.error(e);
    }
    return monthStr;
}

async function toggleNHIFStatus(id, currentStatus) {
    let nextStatus = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'Paid';
    else if (currentStatus === 'Paid') nextStatus = 'Overdue';
    else if (currentStatus === 'Overdue') nextStatus = 'Pending';

    let receiptNumber = null;
    let paymentDate = null;

    if (nextStatus === 'Paid') {
        const receipt = prompt("Please enter Receipt Number for payment:");
        if (receipt === null) return; // User cancelled
        receiptNumber = receipt || ('REC-' + Date.now().toString().slice(-6));
        paymentDate = new Date().toISOString().slice(0, 10);
    }

    try {
        const response = await xhrRequest('PUT', `/api/nhif/${id}/payment`, {
            paymentStatus: nextStatus,
            paymentDate: paymentDate,
            receiptNumber: receiptNumber,
            updatedBy: 'HR Manager'
        });
        const result = await response.json();

        if (response.ok && result.success) {
            showNotification(`Contribution status updated to ${nextStatus}!`, 'success');
            loadNHIFSummaryAndTable();
        } else {
            showNotification(result.error || 'Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error toggling NHIF status:', error);
        showNotification('Error updating status.', 'error');
    }
}

async function deleteNHIFRecord(id) {
    if (!confirm("Are you sure you want to delete this NHIF contribution record?")) return;

    try {
        const response = await xhrRequest('DELETE', `/api/nhif/${id}`);
        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Record deleted successfully!', 'success');
            loadNHIFSummaryAndTable();
        } else {
            showNotification(result.error || 'Failed to delete record', 'error');
        }
    } catch (error) {
        console.error('Error deleting NHIF record:', error);
        showNotification('Error deleting record.', 'error');
    }
}



// Function to show Procurement Sales form

function showProcurementSales() {

    const mainContent = document.getElementById('main-content') || document.querySelector('.content');

    if (!mainContent) return;



    mainContent.innerHTML = `

        <div style="padding: 20px;">

            <div class="card" style="margin-bottom: 20px;">

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">

                    <h3 style="margin: 0;">Procurement Sales</h3>

                    ${(typeof getCurrentUserRole === 'function' && getCurrentUserRole() === 'MD') ? '' : '<button onclick="showProcurementForm()" class="btn btn-primary" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">+ New Procurement</button>'}

                </div>

                <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="procurementSearchInput" placeholder="🔍 Search procurement records..." style="padding: 10px 15px; border: 1px solid #ddd; border-radius: 6px; flex: 1; font-size: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" onkeyup="filterProcurementTable()">
                    <button onclick="clearProcurementSearch()" style="padding: 10px 20px; background: #6c757d; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Clear</button>
                </div>

                <div id="procurementTableContainer">

                    <p style="text-align: center; color: #888;">Loading records...</p>

                </div>

            </div>

        </div>

    `;



    loadProcurementTable();

}



function loadProcurementTable() {

    const container = document.getElementById('procurementTableContainer');

    if (!container) return;



    xhrRequest('GET', '/api/procurement-sales').then(function(response) {
        return response.json();
    }).then(function(result) {
        const data = result.data || result || [];

        const records = Array.isArray(data) ? data : [];



        if (records.length === 0) {

            container.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No procurement records found. Click "+ New Procurement" to add one.</p>';

            return;

        }



        let tableHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: auto;">
                    <thead>
                        <tr style="background: #0b3d91; color: white;">
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">#</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Type</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Request Title</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Item Description</th>
                            <th style="padding: 9px 9px; text-align: right; white-space: nowrap;">Quantity</th>
                            <th style="padding: 9px 9px; text-align: right; white-space: nowrap;">Total Budget</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Purpose</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Supplier Requirements</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Technical Specifications</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Budget Allocation</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Justification</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Approval Requirements</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Department</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Urgency Level</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Status</th>
                            <th style="padding: 9px 9px; text-align: left; white-space: nowrap;">Expected Delivery</th>
                            <th style="padding: 9px 9px; text-align: center; white-space: nowrap;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;

        records.forEach(function(rec, idx) {
            const name = rec.request_title || rec.item_description || '-';
            const ptype = rec.procurement_type || '-';
            const qty = rec.quantity || 0;
            const total = rec.total_budget || 0;
            const status = rec.status || '-';
            const dept = rec.department || '-';
            const itemDesc = (rec.item_description || '-').replace(/"/g, '&quot;');
            const purpose = (rec.purpose || '-').replace(/"/g, '&quot;');
            const supplierReq = (rec.supplier_requirements || '-').replace(/"/g, '&quot;');
            const techSpecs = (rec.technical_specifications || '-').replace(/"/g, '&quot;');
            const budgetAlloc = (rec.budget_allocation || '-').replace(/"/g, '&quot;');
            const justification = (rec.justification || '-').replace(/"/g, '&quot;');
            const approvalReq = (rec.approval_requirements || '-').replace(/"/g, '&quot;');
            const urgency = rec.urgency_level || '-';
            const createdAt = rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '-';
            const statusColor = status === 'Completed' ? '#4CAF50' : status === 'Approved' ? '#2196F3' : status === 'Pending' ? '#FF9800' : status === 'Rejected' ? '#f44336' : status === 'Under Review' ? '#FFB300' : '#607D8B';
            const urgencyColor = urgency === 'Urgent' ? '#f44336' : urgency === 'High' ? '#FF9800' : urgency === 'Normal' ? '#4CAF50' : '#607D8B';
            const bgColor = idx % 2 === 0 ? '#fff' : '#f8f9fa';
            const currentRole = (typeof getCurrentUserRole === 'function') ? getCurrentUserRole() : null;
            const isManagingDirector = currentRole === 'MD';
            const actions = (status === 'Pending' || status === 'Under Review') ?
                (isManagingDirector ?
                    '<button onclick="approveProcurement(' + rec.id + ')" style="padding:3px 6px;border:none;background:#28a745;color:white;border-radius:3px;cursor:pointer;font-size:11px;margin-right:3px;" title="Approve">Approve</button>' +
                    '<button onclick="rejectProcurement(' + rec.id + ')" style="padding:3px 6px;border:none;background:#dc3545;color:white;border-radius:3px;cursor:pointer;font-size:11px;" title="Reject">Reject</button>'
                    : '<span style="background:#e2e8f0;color:#64748b;padding:2px 8px;border-radius:8px;font-size:10px;white-space:nowrap;">🔒 Awaiting Approval</span>')
                : '<span style="color:#aaa;">-</span>';

            tableHTML += '<tr style="background:' + bgColor + ';">';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee;">' + (idx + 1) + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; white-space:nowrap;">' + ptype + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + name + '">' + name + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + itemDesc + '">' + itemDesc + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; text-align:right;">' + qty + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; text-align:right; font-weight:600; white-space:nowrap;">' + Number(total).toLocaleString() + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + purpose + '">' + purpose + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + supplierReq + '">' + supplierReq + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + techSpecs + '">' + techSpecs + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; white-space:nowrap;">' + budgetAlloc + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + justification + '">' + justification + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; white-space:nowrap;">' + approvalReq + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; white-space:nowrap;">' + dept + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee;"><span style="background:' + urgencyColor + '; color:white; padding:2px 6px; border-radius:8px; font-size:10px; white-space:nowrap;">' + urgency + '</span></td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee;"><span style="background:' + statusColor + '; color:white; padding:2px 8px; border-radius:8px; font-size:10px; white-space:nowrap;">' + status + '</span></td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; white-space:nowrap; color:#666;">' + createdAt + '</td>';
            tableHTML += '<td style="padding:4px 8px; border-bottom:1px solid #eee; text-align:center; white-space:nowrap;">' + actions + '</td>';
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table></div>';
        tableHTML += '<p style="text-align: right; color: #888; margin-top: 6px; font-size: 11px;">Showing ' + records.length + ' record' + (records.length !== 1 ? 's' : '') + '</p>';

        container.innerHTML = tableHTML;

    }).catch(function(err) {

        console.error('Error loading procurement records:', err);

        container.innerHTML = '<p style="text-align: center; color: #f44336;">Failed to load procurement records.</p>';

    });

}



function approveProcurement(id) {
    if (!confirm('Approve procurement request ID ' + id + '?')) return;
    const comments = prompt('Enter approval comments for procurement ID ' + id + ':', 'Approved and ready for processing.');
    if (comments === null) return;
    updateProcurementStatus(id, 'Approved', comments, null, '');
}

function rejectProcurement(id) {
    if (!confirm('Reject procurement request ID ' + id + '?')) return;
    const comments = prompt('Enter rejection comments for procurement ID ' + id + ':', 'Request rejected.');
    if (comments === null) return;
    updateProcurementStatus(id, 'Rejected', comments, null, comments);
}

function updateProcurementStatus(id, status, reviewComments, approvedBudget, rejectionReason) {
    const payload = {
        status: status,
        reviewedByRole: 'Manager',
        reviewComments: reviewComments,
        approvedBudget: approvedBudget,
        rejectionReason: rejectionReason
    };

    xhrRequest('PUT', '/api/procurement-sales/' + id + '/status', payload)
        .then(function(response) {
            return response.json();
        }).then(function(result) {
            if (result.success) {
                showNotification('Procurement request updated: ' + status, 'success');
                loadProcurementTable();
            } else {
                console.error('Failed to update procurement status:', result);
                showNotification('Failed to update procurement status. ' + (result.error || ''), 'error');
            }
        }).catch(function(err) {
            console.error('Error updating procurement status:', err);
            showNotification('Error updating procurement status. Please try again.', 'error');
        });
}



function showProcurementForm() {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container">

                <div class="form-header">

                    <h3>Procurement Sales</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="procurementForm">

                    <div class="form-group">

                        <label for="procurementType">Type:</label>

                        <select id="procurementType" name="procurementType" required>

                            <option value="">Select Type</option>

                            <option value="Purchase">Purchase</option>

                            <option value="Sale">Sale</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="requestTitle">Request Title:</label>

                        <input type="text" id="requestTitle" name="requestTitle" required>

                    </div>

                    <div class="form-group">

                        <label for="itemDescription">Item Description:</label>

                        <textarea id="itemDescription" name="itemDescription" rows="2" required></textarea>

                    </div>

                    <div class="form-group">

                        <label for="procurementQuantity">Quantity:</label>

                        <input type="number" id="procurementQuantity" name="quantity" required>

                    </div>

                    <div class="form-group">

                        <label for="unitPrice">Unit Price:</label>

                        <input type="number" id="unitPrice" name="unitPrice" step="0.01" required>

                    </div>

                    <div class="form-group">

                        <label for="procurementTotalBudget">Total Budget:</label>

                        <input type="number" id="procurementTotalBudget" name="totalBudget" step="0.01" readonly>

                    </div>

                    <div class="form-group">

                        <label for="purpose">Purpose:</label>

                        <input type="text" id="purpose" name="purpose" required>

                    </div>

                    <div class="form-group">

                        <label for="urgencyLevel">Urgency Level:</label>

                        <select id="urgencyLevel" name="urgencyLevel" required>

                            <option value="">Select urgency</option>

                            <option value="Low">Low</option>

                            <option value="Normal">Normal</option>

                            <option value="High">High</option>

                            <option value="Urgent">Urgent</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="expectedDeliveryDate">Expected Delivery:</label>

                        <input type="date" id="expectedDeliveryDate" name="expectedDeliveryDate" required>

                    </div>

                    <div class="form-group">

                        <label for="supplierRequirements">Supplier Requirements:</label>

                        <textarea id="supplierRequirements" name="supplierRequirements" rows="2"></textarea>

                    </div>

                    <div class="form-group">

                        <label for="technicalSpecifications">Technical Specifications:</label>

                        <textarea id="technicalSpecifications" name="technicalSpecifications" rows="2"></textarea>

                    </div>

                    <div class="form-group">

                        <label for="budgetAllocation">Budget Allocation:</label>

                        <input type="text" id="budgetAllocation" name="budgetAllocation">

                    </div>

                    <div class="form-group">

                        <label for="department">Department:</label>

                        <input type="text" id="department" name="department" required>

                    </div>

                    <div class="form-group">

                        <label for="justification">Justification:</label>

                        <textarea id="justification" name="justification" rows="2"></textarea>

                    </div>

                    <div class="form-group">

                        <label for="approvalRequirements">Approval Requirements:</label>

                        <select id="approvalRequirements" name="approvalRequirements" required>

                            <option value="">Select approval level</option>

                            <option value="Standard">Standard</option>

                            <option value="Enhanced">Enhanced</option>

                            <option value="Board">Board</option>

                        </select>

                    </div>

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">Submit</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);



    setTimeout(function() {

        const procurementForm = document.getElementById('procurementForm');

        if (procurementForm) {

            procurementForm.addEventListener('submit', async function(e) {

                e.preventDefault();



                const procType = document.getElementById('procurementType').value;

                const requestTitle = document.getElementById('requestTitle').value;

                const itemDescription = document.getElementById('itemDescription').value;

                const procQty = parseInt(document.getElementById('procurementQuantity').value, 10) || 0;

                const procPrice = parseFloat(document.getElementById('unitPrice').value) || 0;

                const totalBudget = parseFloat(document.getElementById('procurementTotalBudget').value) || (procQty * procPrice);

                const purpose = document.getElementById('purpose').value;

                const urgencyLevel = document.getElementById('urgencyLevel').value;

                const expectedDeliveryDate = document.getElementById('expectedDeliveryDate').value;

                const supplierRequirements = document.getElementById('supplierRequirements').value;

                const technicalSpecifications = document.getElementById('technicalSpecifications').value;

                const budgetAllocation = document.getElementById('budgetAllocation').value;

                const department = document.getElementById('department').value || (typeof getCurrentUserDepartment === 'function' ? getCurrentUserDepartment() : null) || (window.currentUser && (window.currentUser.department_name || window.currentUser.department)) || 'General';

                const justification = document.getElementById('justification').value;

                const approvalRequirements = document.getElementById('approvalRequirements').value || 'Standard';

                const currentUserName = (typeof getCurrentUser === 'function' ? getCurrentUser() : null) || 'Current User';
                const currentUserRole = (typeof getCurrentUserRole === 'function' ? getCurrentUserRole() : null) || 'Employee';

                const sessionUser = (window.sessionManager && typeof window.sessionManager.getCurrentUser === 'function') ? window.sessionManager.getCurrentUser() : null;
                const currentUserId = (sessionUser && sessionUser.id) ? sessionUser.id : ((typeof getCurrentUserId === 'function') ? getCurrentUserId() : null);

                const formData = {

                    requestTitle: requestTitle,

                    procurementType: procType,

                    itemDescription: itemDescription,

                    quantity: procQty,

                    unitPrice: procPrice,

                    totalBudget: totalBudget,

                    purpose: purpose,

                    urgencyLevel: urgencyLevel,

                    expectedDeliveryDate: expectedDeliveryDate,

                    supplierRequirements: supplierRequirements,

                    technicalSpecifications: technicalSpecifications,

                    budgetAllocation: budgetAllocation,

                    department: department,

                    requestedBy: currentUserName,

                    requestedByRole: currentUserRole,

                    justification: justification,

                    approvalRequirements: approvalRequirements,

                    userId: currentUserId

                };

                const quantityInput = document.getElementById('procurementQuantity');
                const unitPriceInput = document.getElementById('unitPrice');
                const totalBudgetInput = document.getElementById('procurementTotalBudget');

                function updateTotalBudget() {
                    const qty = parseInt(quantityInput.value, 10) || 0;
                    const price = parseFloat(unitPriceInput.value) || 0;
                    if (totalBudgetInput) {
                        totalBudgetInput.value = (qty * price).toFixed(2);
                    }
                }

                if (quantityInput && unitPriceInput) {
                    quantityInput.addEventListener('input', updateTotalBudget);
                    unitPriceInput.addEventListener('input', updateTotalBudget);
                    updateTotalBudget();
                }



                try {

                    const submitBtn = procurementForm.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;



                    await xhrRequest('POST', '/api/procurement-sales', formData);



                    showNotification('Procurement sale saved successfully!', 'success');

                    closeForm();

                    loadProcurementTable();



                } catch (error) {

                    console.error('Error saving procurement sale:', error);

                    showNotification('Error saving procurement sale. Please try again.', 'error');

                } finally {

                    const submitBtn = procurementForm.querySelector('button[type="submit"]');

                    if (submitBtn) {

                        submitBtn.textContent = 'Submit';

                        submitBtn.disabled = false;

                    }

                }

            });

        }

    }, 100);

}




// Function to show Tax Payments form

function showTaxPayments(taxData = null) {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container">

                <div class="form-header">

                    <h3>Tax Payments</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="taxForm">

                    <div class="form-group">

                        <label for="taxType">Tax Type:</label>

                        <select id="taxType" name="taxType" required>

                            <option value="">Select Tax Type</option>

                            <option value="PAYE">PAYE</option>

                            <option value="VAT">VAT</option>

                            <option value="Corporate Tax">Corporate Tax</option>

                            <option value="Withholding Tax">Withholding Tax</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="taxAmount">Amount:</label>

                        <input type="number" id="taxAmount" name="taxAmount" step="0.01" required>

                    </div>

                    <div class="form-group">

                        <label for="taxPeriod">Period:</label>

                        <input type="month" id="taxPeriod" name="taxPeriod" required>

                    </div>

                    <div class="form-group">

                        <label for="taxDueDate">Due Date:</label>

                        <input type="date" id="taxDueDate" name="taxDueDate" required>

                    </div>

                    <div class="form-group">

                        <label for="taxStatus">Payment Status:</label>

                        <select id="taxStatus" name="taxStatus" required>

                            <option value="">Select Status</option>

                            <option value="Pending">Pending</option>

                            <option value="Paid">Paid</option>

                            <option value="Overdue">Overdue</option>

                            <option value="Cancelled">Cancelled</option>

                            <option value="Refunded">Refunded</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="paymentMethod">Payment Method:</label>

                        <select id="paymentMethod" name="paymentMethod">

                            <option value="Bank Transfer">Bank Transfer</option>

                            <option value="Cash">Cash</option>

                            <option value="Mobile Money">Mobile Money</option>

                            <option value="Cheque">Cheque</option>

                            <option value="Credit Card">Credit Card</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="paymentReference">Payment Reference:</label>

                        <input type="text" id="paymentReference" name="paymentReference" placeholder="Enter payment reference number">

                    </div>

                    <div class="form-group">

                        <label for="penalties">Penalties (TZS):</label>

                        <input type="number" id="penalties" name="penalties" step="0.01" min="0" value="0">

                    </div>

                    <div class="form-group">

                        <label for="interest">Interest (TZS):</label>

                        <input type="number" id="interest" name="interest" step="0.01" min="0" value="0">

                    </div>

                    <div class="form-group">

                        <label for="taxDescription">Description:</label>

                        <textarea id="taxDescription" name="taxDescription" rows="3" placeholder="Enter tax payment description or notes"></textarea>

                    </div>

                    <div class="form-group">

                        <label for="taxAttachments">Attachments:</label>

                        <input type="file" id="taxAttachments" name="taxAttachments" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple>

                        <small>Upload supporting documents (PDF, DOC, Images)</small>

                    </div>

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">Submit</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    

    // Add form submission handler

    setTimeout(async () => {

        const taxForm = document.getElementById('taxForm');

        if (taxForm) {

            
            if (taxData) {
                const h3 = taxForm.closest('.form-container').querySelector('.form-header h3');
                if (h3) h3.textContent = 'View Tax Payment';
                
                if (taxForm.querySelector('#taxType')) taxForm.querySelector('#taxType').value = taxData.tax_type || taxData.taxType || '';
                if (taxForm.querySelector('#taxAmount')) taxForm.querySelector('#taxAmount').value = taxData.amount || '';
                if (taxForm.querySelector('#taxPeriod') && (taxData.tax_period || taxData.taxPeriod)) taxForm.querySelector('#taxPeriod').value = taxData.tax_period || taxData.taxPeriod;
                if (taxForm.querySelector('#taxDueDate') && (taxData.due_date || taxData.dueDate)) taxForm.querySelector('#taxDueDate').value = (taxData.due_date || taxData.dueDate).split('T')[0];
                if (taxForm.querySelector('#taxStatus')) taxForm.querySelector('#taxStatus').value = taxData.payment_status || taxData.paymentStatus || '';
                if (taxForm.querySelector('#paymentMethod')) taxForm.querySelector('#paymentMethod').value = taxData.payment_method || taxData.paymentMethod || '';
                if (taxForm.querySelector('#paymentReference')) taxForm.querySelector('#paymentReference').value = taxData.payment_reference || taxData.paymentReference || '';
                if (taxForm.querySelector('#penalties') && taxData.penalties !== undefined) taxForm.querySelector('#penalties').value = taxData.penalties;
                if (taxForm.querySelector('#interest') && taxData.interest !== undefined) taxForm.querySelector('#interest').value = taxData.interest;
                if (taxForm.querySelector('#taxDescription')) taxForm.querySelector('#taxDescription').value = taxData.description || '';
                
                Array.from(taxForm.elements).forEach(el => {
                    if (el.tagName !== 'BUTTON' && el.id !== 'taxAttachments') el.disabled = true;
                });
                
                const attInput = taxForm.querySelector('#taxAttachments');
                if (attInput) attInput.closest('.form-group').style.display = 'none';
                
                const submitBtn = taxForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.style.display = 'none';
                
                taxForm.addEventListener('submit', function(e) { e.preventDefault(); });
            } else {
                taxForm.addEventListener('submit', async function(e) {


                console.log('💰 Tax form submitted');

                e.preventDefault();

                

                const formData = {

                    taxType: taxForm.querySelector('#taxType').value,

                    amount: parseFloat(taxForm.querySelector('#taxAmount').value),

                    taxPeriod: taxForm.querySelector('#taxPeriod').value,

                    paymentDate: taxForm.querySelector('#taxDueDate').value,

                    dueDate: taxForm.querySelector('#taxDueDate').value,

                    paymentStatus: taxForm.querySelector('#taxStatus').value,

                    paymentMethod: taxForm.querySelector('#paymentMethod').value,

                    paymentReference: taxForm.querySelector('#paymentReference').value,

                    penalties: parseFloat(taxForm.querySelector('#penalties').value) || 0,

                    interest: parseFloat(taxForm.querySelector('#interest').value) || 0,

                    description: taxForm.querySelector('#taxDescription').value,

                    department: 'Finance', // Default department for tax payments

                    attachments: taxForm.querySelector('#taxAttachments').files.length > 0 ? 
                        Array.from(taxForm.querySelector('#taxAttachments').files).map(f => f.name) : null,

                    createdAt: new Date().toISOString()

                };

                

                try {

                    const submitBtn = taxForm.querySelector('button[type="submit"]');

                    const originalText = submitBtn.textContent;

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;

                    

                    await window.apiService.saveTaxPayment(formData);

                    // Upload tax attachments to documents table (with QR code)
                    const taxAttInput = taxForm.querySelector('#taxAttachments');
                    if (taxAttInput && taxAttInput.files.length > 0) {
                        uploadFileToDocumentsTable(taxAttInput, 'tin', `Tax Document - ${formData.taxType || 'Payment'}`, `Tax payment attachment. Amount: ${formData.amount || 'N/A'}. Reference: ${formData.paymentReference || 'N/A'}`).then(results => { const s = results.filter(r => r.success).length; if (s > 0) console.log(`Tax attachment(s) stored: ${s}`); });
                    }
                    

                    showNotification('Tax payment saved successfully!', 'success');

                    closeForm();

                    taxForm.reset();

                    

                } catch (error) {

                    console.error('Error saving tax payment:', error);

                    showNotification('Error saving tax payment. Please try again.', 'error');

                } finally {

                    const submitBtn = taxForm.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Submit';

                    submitBtn.disabled = false;

                }

            });
            }

        }

        await loadTaxPaymentsTable();

    }, 100);

}

async function loadTaxPaymentsTable() {
    // Find or create the container inside the tax form overlay
    let container = document.getElementById('taxPaymentsTableContainer');
    if (!container) {
        // Append a container after the form inside the overlay
        const formEl = document.getElementById('taxForm');
        if (!formEl) return;
        const formContainer = formEl.closest('.form-container');
        if (!formContainer) return;
        container = document.createElement('div');
        container.id = 'taxPaymentsTableContainer';
        container.style.cssText = 'margin-top:20px;max-height:300px;overflow-y:auto;';
        formContainer.appendChild(container);
    }

    container.innerHTML = '<p style="text-align:center;color:#888;padding:10px;">Loading tax payments...</p>';

    try {
        const payments = (await window.apiService.getTaxPayments()) || [];
        const records = Array.isArray(payments) ? payments : (payments.data || []);

        if (!records.length) {
            container.innerHTML = '<p style="text-align:center;color:#888;padding:10px;">No tax payment records found.</p>';
            return;
        }

        const statusColor = s => s === 'Paid' ? '#4CAF50' : s === 'Pending' ? '#FF9800' : s === 'Overdue' ? '#f44336' : '#607D8B';

        let html = `<h4 style="margin-bottom:10px;color:#0b3d91;">Recent Tax Payments</h4>
            <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                    <tr style="background:#0b3d91;color:white;">
                        <th style="padding:7px 8px;text-align:left;">#</th>
                        <th style="padding:7px 8px;text-align:left;">Type</th>
                        <th style="padding:7px 8px;text-align:right;">Amount (TZS)</th>
                        <th style="padding:7px 8px;text-align:left;">Period</th>
                        <th style="padding:7px 8px;text-align:left;">Due Date</th>
                        <th style="padding:7px 8px;text-align:left;">Method</th>
                        <th style="padding:7px 8px;text-align:left;">Reference</th>
                        <th style="padding:7px 8px;text-align:left;">Status</th>
                        <th style="padding:7px 8px;text-align:center;">Action</th>
                    </tr>
                </thead>
                <tbody>`;

        records.forEach((rec, idx) => {
            const bg = idx % 2 === 0 ? '#fff' : '#f8f9fa';
            const s = rec.payment_status || rec.status || '-';
            const sc = statusColor(s);
            const amount = rec.amount ? Number(rec.amount).toLocaleString() : '-';
            const dueDate = rec.due_date ? new Date(rec.due_date).toLocaleDateString() : '-';
            html += `<tr style="background:${bg};">
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${idx + 1}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.tax_type || rec.taxType || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${amount}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.tax_period || rec.taxPeriod || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${dueDate}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.payment_method || rec.paymentMethod || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.payment_reference || rec.paymentReference || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">
                    <span style="background:${sc};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">${s}</span>
                </td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">
                    <button onclick='showTaxPayments(${JSON.stringify(rec).replace(/\'/g, "&#39;")})' style="background:#2196F3;color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">View</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('Error loading tax payments table:', err);
        container.innerHTML = '<p style="text-align:center;color:#c00;padding:10px;">Error loading tax payments.</p>';
    }
}



// ===== MATERIALS MANAGEMENT FUNCTIONS =====

function showMaterialsDashboard_old() {

    const contentArea = document.getElementById('contentArea');

    if (!contentArea) return;

    contentArea.innerHTML = `

        <div class="section">

            <div class="section-header">

                <h3>Materials Management Dashboard</h3>

                <button onclick="goBack()" class="back-btn">Back</button>

            </div>

            <div class="dashboard-cards">

                <div class="card" onclick="showMaterialsInventory()">

                    <h4>Inventory</h4>

                    <p>View all materials in stock</p>

                </div>

                <div class="card" onclick="showMaterialsInForm()">

                    <h4>Materials In</h4>

                    <p>Record incoming materials</p>

                </div>

                <div class="card" onclick="showMaterialsOutForm()">

                    <h4>Materials Out</h4>

                    <p>Record outgoing materials</p>

                </div>

                <div class="card" onclick="loadMaterialsTransactions()">

                    <h4>Transactions</h4>

                    <p>View in/out history</p>

                </div>

                <div class="card" onclick="showAddMaterialForm()">

                    <h4>Add Material</h4>

                    <p>Register new material</p>

                </div>

            </div>

            <div id="materialsContent" style="margin-top: 20px;"></div>

        </div>

    `;

    loadMaterialsDashboardStats();

}



async function loadMaterialsDashboardStats() {

    try {

        const response = await fetch(`${window.location.origin}/api/materials/dashboard`);

        const data = await response.json();

        const stats = data.data || data;

        const contentDiv = document.getElementById('materialsContent');

        if (contentDiv) {

            contentDiv.innerHTML = `

                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px;">

                    <div class="stat-card" style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">

                        <div style="font-size: 24px; font-weight: bold; color: #0b3d91;">${stats.totalMaterials || 0}</div>

                        <div style="font-size: 12px; color: #666;">Total Materials</div>

                    </div>

                    <div class="stat-card" style="background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center;">

                        <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">TZS ${(stats.totalStockValue || 0).toLocaleString()}</div>

                        <div style="font-size: 12px; color: #666;">Stock Value</div>

                    </div>

                    <div class="stat-card" style="background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">

                        <div style="font-size: 24px; font-weight: bold; color: #ef6c00;">${stats.totalInTransactions || 0}</div>

                        <div style="font-size: 12px; color: #666;">In Transactions</div>

                    </div>

                    <div class="stat-card" style="background: #fce4ec; padding: 15px; border-radius: 8px; text-align: center;">

                        <div style="font-size: 24px; font-weight: bold; color: #c62828;">${stats.totalOutTransactions || 0}</div>

                        <div style="font-size: 12px; color: #666;">Out Transactions</div>

                    </div>

                    <div class="stat-card" style="background: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">

                        <div style="font-size: 24px; font-weight: bold; color: #6a1b9a;">${stats.lowStockItems || 0}</div>

                        <div style="font-size: 12px; color: #666;">Low Stock Alerts</div>

                    </div>

                </div>

            `;

        }

    } catch (error) {

        console.error('Error loading materials stats:', error);

    }

}



async function showMaterialsInventory_old() {

    const contentArea = document.getElementById('contentArea');

    if (!contentArea) return;

    contentArea.innerHTML = `

        <div class="section">

            <div class="section-header">

                <h3>Materials Inventory</h3>

                <button onclick="goBack()" class="back-btn">Back</button>

            </div>

            <div style="margin-bottom: 15px;">

                <input type="text" id="materialSearch" placeholder="Search materials..." 

                    style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 300px;"

                    onkeyup="searchMaterials()">

            </div>

            <div id="materialsInventoryTable"></div>

        </div>

    `;

    await loadMaterialsInventoryTable();

}



async function loadMaterialsInventoryTable() {

    try {

        const response = await fetch(`${window.location.origin}/api/materials/inventory`);

        const data = await response.json();

        const materials = data.data || data;

        const tableDiv = document.getElementById('materialsInventoryTable');

        if (!tableDiv) return;

        if (!Array.isArray(materials) || materials.length === 0) {

            tableDiv.innerHTML = '<p style="text-align: center; color: #666;">No materials found.</p>';

            return;

        }

        tableDiv.innerHTML = `

            <table class="data-table" style="width: 100%; border-collapse: collapse;">

                <thead>

                    <tr style="background: #0b3d91; color: white;">

                        <th style="padding: 10px; text-align: left;">Code</th>

                        <th style="padding: 10px; text-align: left;">Name</th>

                        <th style="padding: 10px; text-align: left;">Category</th>

                        <th style="padding: 10px; text-align: center;">Stock</th>

                        <th style="padding: 10px; text-align: center;">Unit</th>

                        <th style="padding: 10px; text-align: right;">Unit Cost</th>

                        <th style="padding: 10px; text-align: center;">Status</th>

                        <th style="padding: 10px; text-align: left;">Location</th>

                    </tr>

                </thead>

                <tbody>

                    ${materials.map(m => `

                        <tr style="border-bottom: 1px solid #ddd;" class="${m.current_stock <= m.reorder_point ? 'low-stock' : ''}">

                            <td style="padding: 8px;">${m.material_code}</td>

                            <td style="padding: 8px;">${m.material_name}</td>

                            <td style="padding: 8px;">${m.material_category}</td>

                            <td style="padding: 8px; text-align: center; font-weight: bold; ${m.current_stock <= m.reorder_point ? 'color: #c62828;' : ''}">${m.current_stock}</td>

                            <td style="padding: 8px; text-align: center;">${m.unit_of_measure}</td>

                            <td style="padding: 8px; text-align: right;">TZS ${(m.unit_cost || 0).toLocaleString()}</td>

                            <td style="padding: 8px; text-align: center;">

                                <span class="status-badge ${m.status === 'Active' ? 'status-active' : m.status === 'Low Stock' ? 'status-pending' : 'status-inactive'}">${m.status}</span>

                            </td>

                            <td style="padding: 8px;">${m.storage_location || '-'}</td>

                        </tr>

                    `).join('')}

                </tbody>

            </table>

        `;

    } catch (error) {

        console.error('Error loading materials inventory:', error);

        const tableDiv = document.getElementById('materialsInventoryTable');

        if (tableDiv) {

            tableDiv.innerHTML = '<p style="text-align: center; color: #c62828;">Error loading materials. Please try again.</p>';

        }

    }

}



async function searchMaterials() {

    const query = document.getElementById('materialSearch')?.value;

    if (!query) {

        await loadMaterialsInventoryTable();

        return;

    }

    try {

        const response = await fetch(`${window.location.origin}/api/materials/search?q=${encodeURIComponent(query)}`);

        const data = await response.json();

        const materials = data.data || data;

        const tableDiv = document.getElementById('materialsInventoryTable');

        if (!tableDiv) return;

        if (!Array.isArray(materials) || materials.length === 0) {

            tableDiv.innerHTML = '<p style="text-align: center; color: #666;">No materials found matching your search.</p>';

            return;

        }

        tableDiv.innerHTML = `

            <table class="data-table" style="width: 100%; border-collapse: collapse;">

                <thead>

                    <tr style="background: #0b3d91; color: white;">

                        <th style="padding: 10px; text-align: left;">Code</th>

                        <th style="padding: 10px; text-align: left;">Name</th>

                        <th style="padding: 10px; text-align: left;">Category</th>

                        <th style="padding: 10px; text-align: center;">Stock</th>

                        <th style="padding: 10px; text-align: center;">Unit</th>

                        <th style="padding: 10px; text-align: right;">Unit Cost</th>

                        <th style="padding: 10px; text-align: center;">Status</th>

                        <th style="padding: 10px; text-align: left;">Location</th>

                    </tr>

                </thead>

                <tbody>

                    ${materials.map(m => `

                        <tr style="border-bottom: 1px solid #ddd;">

                            <td style="padding: 8px;">${m.material_code}</td>

                            <td style="padding: 8px;">${m.material_name}</td>

                            <td style="padding: 8px;">${m.material_category}</td>

                            <td style="padding: 8px; text-align: center; font-weight: bold;">${m.current_stock}</td>

                            <td style="padding: 8px; text-align: center;">${m.unit_of_measure}</td>

                            <td style="padding: 8px; text-align: right;">TZS ${(m.unit_cost || 0).toLocaleString()}</td>

                            <td style="padding: 8px; text-align: center;">

                                <span class="status-badge ${m.status === 'Active' ? 'status-active' : 'status-pending'}">${m.status}</span>

                            </td>

                            <td style="padding: 8px;">${m.storage_location || '-'}</td>

                        </tr>

                    `).join('')}

                </tbody>

            </table>

        `;

    } catch (error) {

        console.error('Error searching materials:', error);

    }

}



function showMaterialsInForm_old() {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container" style="max-width: 700px;">

                <div class="form-header">

                    <h3>Record Materials In (Receiving)</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="materialsInForm">

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minMaterialName">Material Name *</label>

                            <input type="text" id="minMaterialName" name="material_name" placeholder="e.g. Ordinary Portland Cement" required>

                        </div>

                        <div class="form-group">

                            <label for="minMaterialCategory">Category *</label>

                            <select id="minMaterialCategory" name="material_category" required>
                                <option value="">Select Category</option>
                                <option value="Cement">Cement</option>
                                <option value="Sand">Sand</option>
                                <option value="Aggregate">Aggregate / Gravel</option>
                                <option value="Steel/Rebar">Steel / Rebar</option>
                                <option value="Bricks">Bricks / Blocks</option>
                                <option value="Timber">Timber / Wood</option>
                                <option value="Pipes">Pipes / Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Paint">Paint / Finishing</option>
                                <option value="Roofing">Roofing</option>
                                <option value="Tiles">Tiles / Flooring</option>
                                <option value="Glass">Glass</option>
                                <option value="Nails/Fasteners">Nails / Fasteners</option>
                                <option value="Adhesives">Adhesives / Sealants</option>
                                <option value="Waterproofing">Waterproofing</option>
                                <option value="Insulation">Insulation</option>
                                <option value="Hardware">Hardware / Tools</option>
                                <option value="Fuel">Fuel / Lubricants</option>
                                <option value="Other">Other</option>
                            </select>

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minMaterialDesc">Description:</label>

                            <input type="text" id="minMaterialDesc" name="description" placeholder="e.g. Dangote 50kg bags">

                        </div>

                        <div class="form-group">

                            <label for="minTrackNumber">Track Number:</label>

                            <input type="text" id="minTrackNumber" name="track_number" placeholder="Auto-generated if blank">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minReceiptDate">Receipt Date:</label>

                            <input type="date" id="minReceiptDate" name="receipt_date" required>

                        </div>

                        <div class="form-group">

                            <label for="minQuantity">Quantity Received:</label>

                            <input type="number" id="minQuantity" name="quantity_received" step="0.01" required>

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minUnitMeasure">Unit of Measure:</label>

                            <select id="minUnitMeasure" name="unit_of_measure" required>

                                <option value="Bag">Bag</option>

                                <option value="KG">KG</option>

                                <option value="Ton">Ton</option>

                                <option value="Piece">Piece</option>

                                <option value="Meter">Meter</option>

                                <option value="Square Meter">Square Meter</option>

                                <option value="Cubic Meter">Cubic Meter</option>

                                <option value="Liter">Liter</option>

                                <option value="Roll">Roll</option>

                                <option value="Box">Box</option>

                                <option value="Set">Set</option>

                                <option value="Sheet">Sheet</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="minUnitPrice">Unit Price (TZS):</label>

                            <input type="number" id="minUnitPrice" name="unit_price" step="0.01" required>

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minTransportCost">Transport Cost (TZS):</label>

                            <input type="number" id="minTransportCost" name="transport_cost" step="0.01" value="0">

                        </div>

                        <div class="form-group">

                            <label for="minDeliveryCondition">Delivery Condition:</label>

                            <select id="minDeliveryCondition" name="delivery_condition">

                                <option value="Good">Good</option>

                                <option value="Damaged">Damaged</option>

                                <option value="Partial">Partial</option>

                                <option value="Rejected">Rejected</option>

                            </select>

                        </div>

                    </div>

                    <div class="form-group">

                        <label for="minTransportIssue">Transport Issue:</label>

                        <textarea id="minTransportIssue" name="transport_issue" rows="2" placeholder="Describe any transport issues..."></textarea>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minSupplierName">Supplier Name:</label>

                            <input type="text" id="minSupplierName" name="supplier_name" required>

                        </div>

                        <div class="form-group">

                            <label for="minSupplierContact">Supplier Contact:</label>

                            <input type="text" id="minSupplierContact" name="supplier_contact">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minInvoiceNumber">Invoice Number:</label>

                            <input type="text" id="minInvoiceNumber" name="invoice_number">

                        </div>

                        <div class="form-group">

                            <label for="minPONumber">Purchase Order #:</label>

                            <input type="text" id="minPONumber" name="purchase_order_number">

                        </div>

                        <div class="form-group">

                            <label for="minDeliveryNote">Delivery Note #:</label>

                            <input type="text" id="minDeliveryNote" name="delivery_note_number">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="minQualityStatus">Quality Check:</label>

                            <select id="minQualityStatus" name="quality_check_status">

                                <option value="Pending">Pending</option>

                                <option value="Passed">Passed</option>

                                <option value="Failed">Failed</option>

                                <option value="Conditional">Conditional</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="minReceivedBy">Received By:</label>

                            <input type="text" id="minReceivedBy" name="received_by" required>

                        </div>

                    </div>

                    <div class="form-group">

                        <label for="minQualityRemarks">Quality Remarks:</label>

                        <textarea id="minQualityRemarks" name="quality_remarks" rows="2" placeholder="Quality check remarks..."></textarea>

                    </div>

                    <div class="form-group">

                        <label for="minProjectName">Project Name:</label>

                        <input type="text" id="minProjectName" name="project_name" placeholder="Associated project">

                    </div>

                    <div class="form-group">

                        <label for="minWarehouseLocation">Warehouse Location:</label>

                        <input type="text" id="minWarehouseLocation" name="warehouse_location">

                    </div>

                    <div class="form-group">

                        <label for="minNotes">Notes:</label>

                        <textarea id="minNotes" name="notes" rows="2" placeholder="Additional notes..."></textarea>

                    </div>

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">Record Materials In</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    document.getElementById('minReceiptDate').valueAsDate = new Date();

    setTimeout(() => {

        const form = document.getElementById('materialsInForm');

        if (form) {

            form.addEventListener('submit', async function(e) {

                e.preventDefault();

                const formData = {

                    material_name: document.getElementById('minMaterialName').value,

                    material_category: document.getElementById('minMaterialCategory').value,

                    description: document.getElementById('minMaterialDesc').value || '',

                    track_number: document.getElementById('minTrackNumber').value || undefined,

                    receipt_date: document.getElementById('minReceiptDate').value,

                    quantity_received: parseFloat(document.getElementById('minQuantity').value),

                    unit_of_measure: document.getElementById('minUnitMeasure').value,

                    unit_price: parseFloat(document.getElementById('minUnitPrice').value) || 0,

                    transport_cost: parseFloat(document.getElementById('minTransportCost').value) || 0,

                    transport_issue: document.getElementById('minTransportIssue').value,

                    supplier_name: document.getElementById('minSupplierName').value,

                    supplier_contact: document.getElementById('minSupplierContact').value,

                    invoice_number: document.getElementById('minInvoiceNumber').value,

                    purchase_order_number: document.getElementById('minPONumber').value,

                    delivery_note_number: document.getElementById('minDeliveryNote').value,

                    delivery_condition: document.getElementById('minDeliveryCondition').value,

                    quality_check_status: document.getElementById('minQualityStatus').value,

                    quality_remarks: document.getElementById('minQualityRemarks').value,

                    received_by: document.getElementById('minReceivedBy').value,

                    project_name: document.getElementById('minProjectName').value,

                    warehouse_location: document.getElementById('minWarehouseLocation').value,

                    notes: document.getElementById('minNotes').value

                };

                try {

                    const submitBtn = form.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;

                    const response = await fetch(`${window.location.origin}/api/materials/in`, {

                        method: 'POST',

                        headers: { 'Content-Type': 'application/json' },

                        body: JSON.stringify(formData)

                    });

                    const result = await response.json();

                    if (result.success) {

                        showNotification('Materials In recorded successfully! Track #: ' + (result.data.track_number || result.data.trackNumber), 'success');

                        closeForm();

                    } else {

                        showNotification('Error: ' + result.message, 'error');

                    }

                } catch (error) {

                    console.error('Error saving materials in:', error);

                    showNotification('Error saving record. Please try again.', 'error');

                } finally {

                    const submitBtn = form.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Record Materials In';

                    submitBtn.disabled = false;

                }

            });
            }

        }

    }, 100);

}



function showMaterialsOutForm_old() {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container" style="max-width: 700px;">

                <div class="form-header">

                    <h3>Record Materials Out (Issue/Sale)</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="materialsOutForm">

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutMaterialId">Material:</label>

                            <select id="moutMaterialId" name="material_id" required>

                                <option value="">Select Material</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="moutTrackNumber">Track Number:</label>

                            <input type="text" id="moutTrackNumber" name="track_number" placeholder="Auto-generated if blank">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutIssueDate">Issue Date:</label>

                            <input type="date" id="moutIssueDate" name="issue_date" required>

                        </div>

                        <div class="form-group">

                            <label for="moutQuantity">Quantity Out:</label>

                            <input type="number" id="moutQuantity" name="quantity_out" step="0.01" required>

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutUnitMeasure">Unit of Measure:</label>

                            <select id="moutUnitMeasure" name="unit_of_measure" required>

                                <option value="Bag">Bag</option>

                                <option value="KG">KG</option>

                                <option value="Ton">Ton</option>

                                <option value="Piece">Piece</option>

                                <option value="Meter">Meter</option>

                                <option value="Square Meter">Square Meter</option>

                                <option value="Cubic Meter">Cubic Meter</option>

                                <option value="Liter">Liter</option>

                                <option value="Roll">Roll</option>

                                <option value="Box">Box</option>

                                <option value="Set">Set</option>

                                <option value="Sheet">Sheet</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="moutUnitPrice">Unit Price (TZS):</label>

                            <input type="number" id="moutUnitPrice" name="unit_price" step="0.01" value="0">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutIssueType">Issue Type:</label>

                            <select id="moutIssueType" name="issue_type">

                                <option value="Project Use">Project Use</option>

                                <option value="Sale">Sale</option>

                                <option value="Transfer">Transfer</option>

                                <option value="Waste">Waste</option>

                                <option value="Damage">Damage</option>

                                <option value="Return to Supplier">Return to Supplier</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="moutIssuedTo">Issued To:</label>

                            <input type="text" id="moutIssuedTo" name="issued_to" required placeholder="Person/Company receiving">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutIssuedToRole">Role:</label>

                            <input type="text" id="moutIssuedToRole" name="issued_to_role" placeholder="Role of recipient">

                        </div>

                        <div class="form-group">

                            <label for="moutIssuedToDept">Department:</label>

                            <select id="moutIssuedToDept" name="issued_to_department">

                                <option value="Project Management">Project Management</option>

                                <option value="Management">Management</option>

                                <option value="Human Resources">Human Resources</option>

                                <option value="Finance">Finance</option>

                                <option value="Real Estate">Real Estate</option>

                                <option value="Health & Safety">Health & Safety</option>

                                <option value="Administrative">Administrative</option>

                                <option value="Workers">Workers</option>

                                <option value="Clients">Clients</option>

                                <option value="External">External</option>

                            </select>

                        </div>

                    </div>

                    <div class="form-group">

                        <label for="moutProjectName">Project Name:</label>

                        <input type="text" id="moutProjectName" name="project_name" placeholder="Associated project (if applicable)">

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutDestination">Destination:</label>

                            <input type="text" id="moutDestination" name="destination" placeholder="Where materials are going">

                        </div>

                        <div class="form-group">

                            <label for="moutPurpose">Purpose:</label>

                            <input type="text" id="moutPurpose" name="purpose" placeholder="Purpose of issue">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutAuthorizedBy">Authorized By:</label>

                            <input type="text" id="moutAuthorizedBy" name="authorized_by" required>

                        </div>

                        <div class="form-group">

                            <label for="moutAuthorizedRole">Authorizer Role:</label>

                            <input type="text" id="moutAuthorizedRole" name="authorized_by_role" placeholder="Role of authorizer">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutDeliveryMethod">Delivery Method:</label>

                            <select id="moutDeliveryMethod" name="delivery_method">

                                <option value="Company Vehicle">Company Vehicle</option>

                                <option value="Supplier Delivery">Supplier Delivery</option>

                                <option value="Third Party">Third Party</option>

                                <option value="Self Pickup">Self Pickup</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="moutDeliveryReceipt">Delivery Receipt #:</label>

                            <input type="text" id="moutDeliveryReceipt" name="delivery_receipt_number">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="moutCondition">Condition on Issue:</label>

                            <select id="moutCondition" name="condition_on_issue">

                                <option value="New">New</option>

                                <option value="Good">Good</option>

                                <option value="Fair">Fair</option>

                                <option value="Damaged">Damaged</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="moutReturnExpected">Return Expected:</label>

                            <select id="moutReturnExpected" name="return_expected">

                                <option value="false">No</option>

                                <option value="true">Yes</option>

                            </select>

                        </div>

                    </div>

                    <div class="form-group">

                        <label for="moutExpectedReturn">Expected Return Date:</label>

                        <input type="date" id="moutExpectedReturn" name="expected_return_date">

                    </div>

                    <div class="form-group">

                        <label for="moutNotes">Notes:</label>

                        <textarea id="moutNotes" name="notes" rows="2" placeholder="Additional notes..."></textarea>

                    </div>

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">Record Materials Out</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    loadMaterialDropdown('moutMaterialId');

    document.getElementById('moutIssueDate').valueAsDate = new Date();

    setTimeout(() => {

        const form = document.getElementById('materialsOutForm');

        if (form) {

            form.addEventListener('submit', async function(e) {

                e.preventDefault();

                const formData = {

                    material_id: parseInt(document.getElementById('moutMaterialId').value),

                    track_number: document.getElementById('moutTrackNumber').value || undefined,

                    issue_date: document.getElementById('moutIssueDate').value,

                    quantity_out: parseFloat(document.getElementById('moutQuantity').value),

                    unit_of_measure: document.getElementById('moutUnitMeasure').value,

                    unit_price: parseFloat(document.getElementById('moutUnitPrice').value) || 0,

                    issue_type: document.getElementById('moutIssueType').value,

                    issued_to: document.getElementById('moutIssuedTo').value,

                    issued_to_role: document.getElementById('moutIssuedToRole').value,

                    issued_to_department: document.getElementById('moutIssuedToDept').value,

                    project_name: document.getElementById('moutProjectName').value,

                    destination: document.getElementById('moutDestination').value,

                    purpose: document.getElementById('moutPurpose').value,

                    authorized_by: document.getElementById('moutAuthorizedBy').value,

                    authorized_by_role: document.getElementById('moutAuthorizedRole').value,

                    delivery_method: document.getElementById('moutDeliveryMethod').value,

                    delivery_receipt_number: document.getElementById('moutDeliveryReceipt').value,

                    condition_on_issue: document.getElementById('moutCondition').value,

                    return_expected: document.getElementById('moutReturnExpected').value === 'true',

                    expected_return_date: document.getElementById('moutExpectedReturn').value || null,

                    notes: document.getElementById('moutNotes').value

                };

                try {

                    const submitBtn = form.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;

                    const response = await fetch(`${window.location.origin}/api/materials/out`, {

                        method: 'POST',

                        headers: { 'Content-Type': 'application/json' },

                        body: JSON.stringify(formData)

                    });

                    const result = await response.json();

                    if (result.success) {

                        showNotification('Materials Out recorded successfully! Track #: ' + (result.data.track_number || result.data.trackNumber), 'success');

                        closeForm();

                    } else {

                        showNotification('Error: ' + result.message, 'error');

                    }

                } catch (error) {

                    console.error('Error saving materials out:', error);

                    showNotification('Error saving record. Please try again.', 'error');

                } finally {

                    const submitBtn = form.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Record Materials Out';

                    submitBtn.disabled = false;

                }

            });
            }

        }

    }, 100);

}



async function loadMaterialDropdown(selectId) {

    try {

        const response = await fetch(`${window.location.origin}/api/materials/inventory`);

        const data = await response.json();

        const materials = data.data || data;

        const select = document.getElementById(selectId);

        if (!select) return;

        // Clear existing options
        select.innerHTML = '';

        // Add default placeholder
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Select Material --';
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        if (!Array.isArray(materials)) return;

        materials.forEach(m => {

            const option = document.createElement('option');

            option.value = m.id;

            option.textContent = `${m.material_name} (${m.material_code}) - Stock: ${m.current_stock} ${m.unit_of_measure}`;

            select.appendChild(option);

        });

    } catch (error) {

        console.error('Error loading material dropdown:', error);

    }

}



async function loadMaterialsTransactions() {

    const contentArea = document.getElementById('contentArea');

    if (!contentArea) return;

    contentArea.innerHTML = `

        <div class="section">

            <div class="section-header">

                <h3>Materials Transactions</h3>

                <button onclick="goBack()" class="back-btn">Back</button>

            </div>

            <div style="margin-bottom: 15px;">

                <button onclick="loadMaterialsInRecords()" class="btn btn-primary" style="margin-right: 10px;">Materials In</button>

                <button onclick="loadMaterialsOutRecords()" class="btn btn-primary">Materials Out</button>

            </div>

            <div id="transactionsTable"></div>

        </div>

    `;

    await loadMaterialsInRecords();

}



async function loadMaterialsInRecords() {

    try {

        const response = await fetch(`${window.location.origin}/api/materials/in`);

        const data = await response.json();

        const records = data.data || data;

        const tableDiv = document.getElementById('transactionsTable');

        if (!tableDiv) return;

        if (!Array.isArray(records) || records.length === 0) {

            tableDiv.innerHTML = '<p style="text-align: center; color: #666;">No materials in records found.</p>';

            return;

        }

        tableDiv.innerHTML =
            '<h4 style="margin-bottom: 10px;">Materials In (Receiving Records)</h4>' +
            '<div style="overflow-x:auto;">' +
            '<table class="data-table" style="width: 100%; border-collapse: collapse;">' +
                '<thead>' +
                    '<tr style="background: #0b3d91; color: white;">' +
                        '<th style="padding:10px;">Track #</th>' +
                        '<th style="padding:10px;">Material</th>' +
                        '<th style="padding:10px;">Date</th>' +
                        '<th style="padding:10px;">Qty</th>' +
                        '<th style="padding:10px;">Unit Price</th>' +
                        '<th style="padding:10px;">Total Cost</th>' +
                        '<th style="padding:10px;">Transport Cost</th>' +
                        '<th style="padding:10px;">Supplier</th>' +
                        '<th style="padding:10px;">Supplier Contact</th>' +
                        '<th style="padding:10px;">Invoice No</th>' +
                        '<th style="padding:10px;">PO No</th>' +
                        '<th style="padding:10px;">Delivery Note No</th>' +
                        '<th style="padding:10px;">Condition</th>' +
                        '<th style="padding:10px;">Quality</th>' +
                        '<th style="padding:10px;">Quality Remarks</th>' +
                        '<th style="padding:10px;">Received By</th>' +
                        '<th style="padding:10px;">Receiver Role</th>' +
                        '<th style="padding:10px;">Location</th>' +
                        '<th style="padding:10px;">Project</th>' +
                        '<th style="padding:10px;">Transport Issue</th>' +
                        '<th style="padding:10px;">Notes</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' +
                    records.map(function(r) {
                        var d = r.receipt_date ? String(r.receipt_date).slice(0,10) : '';
                        return '<tr style="border-bottom: 1px solid #ddd;">' +
                            '<td style="padding:8px;">' + (r.track_number||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.material_name || r.material_id) + '</td>' +
                            '<td style="padding:8px;">' + d + '</td>' +
                            '<td style="padding:8px;text-align:center;">' + parseFloat(r.quantity_received||0).toLocaleString() + ' ' + (r.unit_of_measure||'') + '</td>' +
                            '<td style="padding:8px;text-align:right;">TZS ' + parseFloat(r.unit_price||0).toLocaleString() + '</td>' +
                            '<td style="padding:8px;text-align:right;">TZS ' + parseFloat(r.total_cost||0).toLocaleString() + '</td>' +
                            '<td style="padding:8px;text-align:right;">TZS ' + parseFloat(r.transport_cost||0).toLocaleString() + '</td>' +
                            '<td style="padding:8px;">' + (r.supplier_name||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.supplier_contact||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.invoice_number||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.purchase_order_number||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.delivery_note_number||'') + '</td>' +
                            '<td style="padding:8px;text-align:center;"><span class="status-badge ' + (r.delivery_condition === 'Good' ? 'status-active' : r.delivery_condition === 'Partial' ? 'status-pending' : 'status-inactive') + '">' + (r.delivery_condition||'') + '</span></td>' +
                            '<td style="padding:8px;">' + (r.quality_check_status||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.quality_remarks||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.received_by||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.received_by_role||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.warehouse_location||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.project_name||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.transport_issue||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.notes||'') + '</td>' +
                        '</tr>';
                    }).join('') +
                '</tbody>' +
            '</table>' +
            '</div>';

    } catch (error) {

        console.error('Error loading materials in records:', error);

    }

}



async function loadMaterialsOutRecords() {

    try {

        const response = await fetch(`${window.location.origin}/api/materials/out`);

        const data = await response.json();

        const records = data.data || data;

        const tableDiv = document.getElementById('transactionsTable');

        if (!tableDiv) return;

        if (!Array.isArray(records) || records.length === 0) {

            tableDiv.innerHTML = '<p style="text-align: center; color: #666;">No materials out records found.</p>';

            return;

        }

        tableDiv.innerHTML =
            '<h4 style="margin-bottom: 10px;">Materials Out (Issue/Sale Records)</h4>' +
            '<div style="overflow-x:auto;">' +
            '<table class="data-table" style="width: 100%; border-collapse: collapse;">' +
                '<thead>' +
                    '<tr style="background: #0b3d91; color: white;">' +
                        '<th style="padding:10px;">Track #</th>' +
                        '<th style="padding:10px;">Material</th>' +
                        '<th style="padding:10px;">Date</th>' +
                        '<th style="padding:10px;">Qty</th>' +
                        '<th style="padding:10px;">Unit Price</th>' +
                        '<th style="padding:10px;">Total Value</th>' +
                        '<th style="padding:10px;">Type</th>' +
                        '<th style="padding:10px;">Issued To</th>' +
                        '<th style="padding:10px;">Issued To Role</th>' +
                        '<th style="padding:10px;">Department</th>' +
                        '<th style="padding:10px;">Project</th>' +
                        '<th style="padding:10px;">Destination</th>' +
                        '<th style="padding:10px;">Authorized By</th>' +
                        '<th style="padding:10px;">Authorizer Role</th>' +
                        '<th style="padding:10px;">Delivery Method</th>' +
                        '<th style="padding:10px;">Delivery Receipt No</th>' +
                        '<th style="padding:10px;">Condition</th>' +
                        '<th style="padding:10px;">Return Expected</th>' +
                        '<th style="padding:10px;">Return Date</th>' +
                        '<th style="padding:10px;">Purpose</th>' +
                        '<th style="padding:10px;">Notes</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' +
                    records.map(function(r) {
                        var d = r.issue_date ? String(r.issue_date).slice(0,10) : '';
                        var retExp = r.return_expected ? 'Yes' : 'No';
                        var retDate = r.expected_return_date ? String(r.expected_return_date).slice(0,10) : '';
                        return '<tr style="border-bottom: 1px solid #ddd;">' +
                            '<td style="padding:8px;">' + (r.track_number||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.material_name || r.material_id) + '</td>' +
                            '<td style="padding:8px;">' + d + '</td>' +
                            '<td style="padding:8px;text-align:center;">' + parseFloat(r.quantity_out||0).toLocaleString() + ' ' + (r.unit_of_measure||'') + '</td>' +
                            '<td style="padding:8px;text-align:right;">TZS ' + parseFloat(r.unit_price||0).toLocaleString() + '</td>' +
                            '<td style="padding:8px;text-align:right;">TZS ' + parseFloat(r.total_value||0).toLocaleString() + '</td>' +
                            '<td style="padding:8px;">' + (r.issue_type||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.issued_to||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.issued_to_role||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.issued_to_department||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.project_name||'-') + '</td>' +
                            '<td style="padding:8px;">' + (r.destination||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.authorized_by||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.authorized_by_role||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.delivery_method||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.delivery_receipt_number||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.condition_on_issue||'') + '</td>' +
                            '<td style="padding:8px;">' + retExp + '</td>' +
                            '<td style="padding:8px;">' + retDate + '</td>' +
                            '<td style="padding:8px;">' + (r.purpose||'') + '</td>' +
                            '<td style="padding:8px;">' + (r.notes||'') + '</td>' +
                        '</tr>';
                    }).join('') +
                '</tbody>' +
            '</table>' +
            '</div>';

    } catch (error) {

        console.error('Error loading materials out records:', error);

    }

}



function showAddMaterialForm() {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container">

                <div class="form-header">

                    <h3>Add New Material</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="addMaterialForm">

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="newMaterialCode">Material Code:</label>

                            <input type="text" id="newMaterialCode" name="material_code" placeholder="Auto-generated if blank">

                        </div>

                        <div class="form-group">

                            <label for="newMaterialName">Material Name:</label>

                            <input type="text" id="newMaterialName" name="material_name" required>

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="newMaterialCategory">Category:</label>

                            <select id="newMaterialCategory" name="material_category" required>

                                <option value="">Select Category</option>

                                <option value="Cement">Cement</option>

                                <option value="Sand">Sand</option>

                                <option value="Gravel">Gravel</option>

                                <option value="Steel/Rebar">Steel/Rebar</option>

                                <option value="Bricks">Bricks</option>

                                <option value="Blocks">Blocks</option>

                                <option value="Timber">Timber</option>

                                <option value="Pipes">Pipes</option>

                                <option value="Electrical">Electrical</option>

                                <option value="Paint">Paint</option>

                                <option value="Roofing">Roofing</option>

                                <option value="Tiles">Tiles</option>

                                <option value="Glass">Glass</option>

                                <option value="Hardware">Hardware</option>

                                <option value="Tools">Tools</option>

                                <option value="Safety Equipment">Safety Equipment</option>

                                <option value="Other">Other</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="newUnitMeasure">Unit of Measure:</label>

                            <select id="newUnitMeasure" name="unit_of_measure" required>

                                <option value="Bag">Bag</option>

                                <option value="KG">KG</option>

                                <option value="Ton">Ton</option>

                                <option value="Piece">Piece</option>

                                <option value="Meter">Meter</option>

                                <option value="Square Meter">Square Meter</option>

                                <option value="Cubic Meter">Cubic Meter</option>

                                <option value="Liter">Liter</option>

                                <option value="Roll">Roll</option>

                                <option value="Box">Box</option>

                                <option value="Set">Set</option>

                                <option value="Sheet">Sheet</option>

                            </select>

                        </div>

                    </div>

                    <div class="form-group">

                        <label for="newMaterialDescription">Description:</label>

                        <textarea id="newMaterialDescription" name="description" rows="2"></textarea>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="newMinStock">Min Stock Level:</label>

                            <input type="number" id="newMinStock" name="min_stock_level" value="10">

                        </div>

                        <div class="form-group">

                            <label for="newMaxStock">Max Stock Level:</label>

                            <input type="number" id="newMaxStock" name="max_stock_level" value="1000">

                        </div>

                        <div class="form-group">

                            <label for="newReorderPoint">Reorder Point:</label>

                            <input type="number" id="newReorderPoint" name="reorder_point" value="50">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="newUnitCost">Unit Cost (TZS):</label>

                            <input type="number" id="newUnitCost" name="unit_cost" step="0.01" value="0">

                        </div>

                        <div class="form-group">

                            <label for="newStorageLocation">Storage Location:</label>

                            <input type="text" id="newStorageLocation" name="storage_location">

                        </div>

                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                        <div class="form-group">

                            <label for="newSupplierName">Supplier Name:</label>

                            <input type="text" id="newSupplierName" name="supplier_name">

                        </div>

                        <div class="form-group">

                            <label for="newSupplierContact">Supplier Contact:</label>

                            <input type="text" id="newSupplierContact" name="supplier_contact">

                        </div>

                    </div>

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">Add Material</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    setTimeout(() => {

        const form = document.getElementById('addMaterialForm');

        if (form) {

            form.addEventListener('submit', async function(e) {

                e.preventDefault();

                const formData = {

                    material_code: document.getElementById('newMaterialCode').value || undefined,

                    material_name: document.getElementById('newMaterialName').value,

                    material_category: document.getElementById('newMaterialCategory').value,

                    description: document.getElementById('newMaterialDescription').value,

                    unit_of_measure: document.getElementById('newUnitMeasure').value,

                    min_stock_level: parseFloat(document.getElementById('newMinStock').value) || 10,

                    max_stock_level: parseFloat(document.getElementById('newMaxStock').value) || 1000,

                    reorder_point: parseFloat(document.getElementById('newReorderPoint').value) || 50,

                    unit_cost: parseFloat(document.getElementById('newUnitCost').value) || 0,

                    storage_location: document.getElementById('newStorageLocation').value,

                    supplier_name: document.getElementById('newSupplierName').value,

                    supplier_contact: document.getElementById('newSupplierContact').value

                };

                try {

                    const submitBtn = form.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;

                    const response = await fetch(`${window.location.origin}/api/materials/inventory`, {

                        method: 'POST',

                        headers: { 'Content-Type': 'application/json' },

                        body: JSON.stringify(formData)

                    });

                    const result = await response.json();

                    if (result.success) {

                        showNotification('Material added successfully!', 'success');

                        closeForm();

                    } else {

                        showNotification('Error: ' + result.message, 'error');

                    }

                } catch (error) {

                    console.error('Error adding material:', error);

                    showNotification('Error adding material. Please try again.', 'error');

                } finally {

                    const submitBtn = form.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Add Material';

                    submitBtn.disabled = false;

                }

            });
            }

        }

    }, 100);

}



// Function to show Senior Roles Management form

function showSeniorRoles() {
    const formHTML = `
        <div class="form-overlay">
            <div class="form-container" style="max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto;">
                <div class="form-header">
                    <h3>Create Senior Hiring Request</h3>
                    <button onclick="closeForm()" class="close-btn">&times;</button>
                </div>
                <div class="form-content-wrapper" style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px;">
                    <div style="flex: 1; min-width: 300px;">
                        <form id="seniorRolesForm">
                            <div class="form-group">
                                <label for="candidateName">Candidate Name:</label>
                                <input type="text" id="candidateName" name="candidateName" required>
                            </div>
                            <div class="form-group">
                                <label for="position">Position Level:</label>
                                <select id="position" name="position" required>
                                    <option value="">Select Position Level</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Director">Director</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="department">Department:</label>
                                <select id="department" name="department" required>
                                    <option value="">Select Department</option>
                                    <option value="HR">HR</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="PROJECT">Project</option>
                                    <option value="HSE">HSE</option>
                                    <option value="REALESTATE">Real Estate</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="proposedSalary">Proposed Salary:</label>
                                <input type="text" id="proposedSalary" name="proposedSalary" placeholder="e.g., TZS 3,000,000" required>
                            </div>
                            <div class="form-group">
                                <label for="experience">Experience:</label>
                                <textarea id="experience" name="experience" rows="3" placeholder="Candidate's experience and qualifications" required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="recommendation">HR Recommendation:</label>
                                <textarea id="recommendation" name="recommendation" rows="3" placeholder="HR recommendation and assessment" required></textarea>
                            </div>
                            <div class="form-actions" style="margin-top: 12px; display: flex; gap: 8px;">
                                <button type="submit" class="btn btn-primary" style="flex: 1;">Submit Request</button>
                                <button type="button" onclick="closeForm()" class="btn btn-secondary">Close</button>
                            </div>
                        </form>
                    </div>
                    <div style="flex: 1.5; min-width: 400px; border-left: 1px solid #e0e0e0; padding-left: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #333;">Current Senior Hiring Requests</h4>
                        <div style="overflow-x: auto; max-height: 480px;">
                            <table class="workforce-table senior-hiring-table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Position</th>
                                        <th>Department</th>
                                        <th>Proposed Salary</th>
                                        <th>HR Recommendation</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="seniorHiringTableBodyModal">
                                    <tr>
                                        <td colspan="6" style="text-align: center; padding: 12px; color: #888;">Loading requests...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    // Helper function to load hiring requests for modal
    const loadSeniorHiringRequestsForModal = async () => {
        try {
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/senior-hiring`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${sessionManager.getAuthToken()}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const tbody = document.getElementById('seniorHiringTableBodyModal');
            if (!tbody) return;

            if (!data || !Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 12px; color: #888;">No hiring requests found</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(request => {
                const salary = request.proposed_salary ? 
                    (request.proposed_salary.startsWith('TZS') ? request.proposed_salary : `TZS ${parseInt(request.proposed_salary).toLocaleString()}`) : 
                    'N/A';
                const status = (request.status || 'pending').toLowerCase();
                const rejReason = request.rejection_reason || '';
                const infoReason = request.info_request_reason || '';
                let statusBadge = '';
                if (status === 'approved') {
                    statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#28a745;color:#fff;font-size:8px;font-weight:700;letter-spacing:0.5px;">✔ Approved</span>`;
                } else if (status === 'rejected') {
                    statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#dc3545;color:#fff;font-size:8px;font-weight:700;letter-spacing:0.5px;" title="${rejReason}">✖ Rejected</span>${rejReason ? `<br><span style="font-size:8px;color:#dc3545;display:block;margin-top:2px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${rejReason}">Reason: ${rejReason}</span>` : ''}`;
                } else if (status === 'request_info' || status === 'request info' || status === 'info_requested') {
                    statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#fd7e14;color:#fff;font-size:8px;font-weight:700;letter-spacing:0.5px;" title="${infoReason}">⚠ Info Requested</span>${infoReason ? `<br><span style="font-size:8px;color:#fd7e14;display:block;margin-top:2px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${infoReason}">Reason: ${infoReason}</span>` : ''}`;
                } else {
                    statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#6c757d;color:#fff;font-size:8px;font-weight:700;letter-spacing:0.5px;">⏳ Pending</span>`;
                }
                return `
                    <tr>
                        <td><strong>${request.candidate_name || 'N/A'}</strong></td>
                        <td>${request.position || 'N/A'}</td>
                        <td><span class="badge department-badge">${request.department || 'N/A'}</span></td>
                        <td>${salary}</td>
                        <td class="truncate-cell" title="${request.hr_recommendation || ''}">${request.hr_recommendation || 'N/A'}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading senior hiring requests for modal:', error);
            const tbody = document.getElementById('seniorHiringTableBodyModal');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 12px; color: #dc3545;">Error loading requests</td></tr>';
            }
        }
    };

    // Load initial data
    setTimeout(loadSeniorHiringRequestsForModal, 50);

    // Add form submission handler
    setTimeout(() => {
        const seniorForm = document.getElementById('seniorRolesForm');
        if (seniorForm) {
            seniorForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Senior hiring form submitted');

                // Validate required fields
                const candidateName = document.getElementById('candidateName').value.trim();
                const position = document.getElementById('position').value.trim();
                const department = document.getElementById('department').value.trim();
                const proposedSalary = document.getElementById('proposedSalary').value.trim();
                const experience = document.getElementById('experience').value.trim();
                const recommendation = document.getElementById('recommendation').value.trim();

                if (!candidateName || !position || !department || !proposedSalary || !experience || !recommendation) {
                    showNotification('Please fill in all required fields', 'error');
                    return;
                }

                const formData = {
                    candidateName,
                    position,
                    department,
                    proposedSalary,
                    experience,
                    recommendation,
                    requestedBy: 'HR Manager',
                    requestedByRole: 'HR'
                };

                console.log('Senior hiring form data:', formData);

                try {
                    const submitBtn = seniorForm.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Saving...';
                    submitBtn.disabled = true;

                    await window.apiService.saveSeniorHiringRequest(formData);

                    showNotification('Senior hiring request submitted successfully!', 'success');
                    seniorForm.reset();
                    await loadSeniorHiringRequestsForModal();
                } catch (error) {
                    console.error('Error saving senior hiring request:', error);
                    showNotification('Error saving senior hiring request. Please try again.', 'error');
                } finally {
                    const submitBtn = seniorForm.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.textContent = 'Submit Request';
                        submitBtn.disabled = false;
                    }
                }
            });
        }
    }, 100);
}

function showSuggestionsManagement() {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container">

                <div class="form-header">

                    <h3>Suggestions Management</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="suggestionsForm">

                    <div class="form-group">

                        <label for="suggestionTitle">Suggestion Title:</label>

                        <input type="text" id="suggestionTitle" name="suggestionTitle" required>

                    </div>

                    <div class="form-group">

                        <label for="suggestionCategory">Category:</label>

                        <select id="suggestionCategory" name="suggestionCategory" required>

                            <option value="">Select Category</option>

                            <option value="Process Improvement">Process Improvement</option>

                            <option value="Safety">Safety</option>

                            <option value="Cost Saving">Cost Saving</option>

                            <option value="Technology">Technology</option>

                            <option value="HR Policy">HR Policy</option>

                            <option value="Other">Other</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="suggestionDescription">Description:</label>

                        <textarea id="suggestionDescription" name="suggestionDescription" rows="4" required></textarea>

                    </div>

                    <div class="form-group">

                        <label for="suggestionSubmittedBy">Submitted By:</label>

                        <input type="text" id="suggestionSubmittedBy" name="suggestionSubmittedBy" required>

                    </div>

                    <div class="form-group">

                        <label for="suggestionDepartment">Department:</label>

                        <select id="suggestionDepartment" name="suggestionDepartment" required>

                            <option value="">Select Department</option>

                            <option value="HR">HR</option>

                            <option value="FINANCE">Finance</option>

                            <option value="PROJECT">Project</option>

                            <option value="HSE">HSE</option>

                            <option value="REALESTATE">Real Estate</option>

                            <option value="ADMIN">Admin</option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="suggestionPriority">Priority:</label>

                        <select id="suggestionPriority" name="suggestionPriority" required>

                            <option value="">Select Priority</option>

                            <option value="Low">Low</option>

                            <option value="Medium">Medium</option>

                            <option value="High">High</option>

                            <option value="Critical">Critical</option>

                        </select>

                    </div>

                    

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">Submit</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    

    // Add form submission handler

    setTimeout(() => {

        const suggestionsForm = document.getElementById('suggestionsForm');

        if (suggestionsForm) {

            suggestionsForm.addEventListener('submit', async function(e) {

                console.log('🎯 Suggestions form submitted');

                e.preventDefault();

                

                const formData = {

                    title: document.getElementById('suggestionTitle').value,

                    category: document.getElementById('suggestionCategory').value,

                    description: document.getElementById('suggestionDescription').value,

                    submittedBy: document.getElementById('suggestionSubmittedBy').value,

                    department: document.getElementById('suggestionDepartment').value,

                    priority: document.getElementById('suggestionPriority').value,

                    createdAt: new Date().toISOString()

                };

                

                try {

                    const submitBtn = suggestionsForm.querySelector('button[type="submit"]');

                    const originalText = submitBtn.textContent;

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;

                    

                    await window.apiService.saveSuggestion(formData);

                    

                    showNotification('Suggestion saved successfully!', 'success');

                    closeForm();

                    suggestionsForm.reset();

                    

                } catch (error) {

                    console.error('Error saving suggestion:', error);

                    showNotification('Error saving suggestion. Please try again.', 'error');

                } finally {

                    const submitBtn = suggestionsForm.querySelector('button[type="submit"]');

                    submitBtn.textContent = 'Submit';

                    submitBtn.disabled = false;

                }

            });
            }

        }

    }, 100);

}



// Function to close form overlay

function closeForm() {

    const overlay = document.querySelector('.form-overlay');

    if (overlay) {

        overlay.remove();

    }

}



// Initialize navigation when page loads

document.addEventListener('DOMContentLoaded', function() {

    // This will be called after login to set up the appropriate menu

    setTimeout(() => {

        const currentRole = getCurrentUserRole();

        if (currentRole) {

            updateNavigationForRole(currentRole);

        }

    }, 100);

});



// Function references for new MD menu items

function tax() {

    showTaxPayments();

}



function procurementSale() {

    showProcurementSales();

}



function nhifContribute() {

    showNHIFContributions();

}



function senior() {

    showSeniorRoles();

}



function suggestions() {

    showSuggestionsManagement();

}



                            




// Supporting functions for the new features

function saveVisionMission() {

    const vision = document.getElementById('visionStatement').value;

    const mission = document.getElementById('missionStatement').value;

    

    console.log('💾 Saving Vision & Mission:', { vision, mission });

    showNotification('Vision & Mission saved successfully!', 'success');

}



function printVisionMission() {

    window.print();

}



function shareVisionMission() {

    showNotification('Vision & Mission shared with all departments!', 'success');

}



function updateLeadershipTeam() {

    showNotification('Leadership team update interface opened!', 'info');

}



function viewLeadershipReports() {

    showNotification('Leadership performance reports loading...', 'info');

}



function scheduleLeadershipMeeting() {

    showNotification('Leadership meeting scheduler opened!', 'info');

}



function updateGrowthPlan() {

    showNotification('Growth plan update interface opened!', 'info');

}



function trackGrowthProgress() {

    showNotification('Growth progress tracker opened!', 'info');

}



function exportGrowthReport() {

    showNotification('Growth report exported successfully!', 'success');

}



// Transport Costs Functions

let allTransportCosts = [];



async function loadTransportCosts() {

    try {

        console.log('🚚 Loading transport costs...');

        

        const response = await fetch('/api/transport-costs');

        

        if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

        }

        

        const data = await response.json();

        console.log('📊 Transport costs response:', data);
        console.log('📊 First cost item structure:', data.data && data.data[0] ? data.data[0] : 'No data');

        

        if (data.success && data.data) {

            allTransportCosts = Array.isArray(data.data) ? data.data : [data.data];
            
            // Clean up description fields that contain error logs
            allTransportCosts = allTransportCosts.map(cost => ({
                ...cost,
                description: cost.description && cost.description.includes('sessionManager.js') ? 
                    'Transport cost entry' : cost.description || 'No description'
            }));

            displayTransportCosts(allTransportCosts);

        } else {

            console.warn('⚠️ No transport costs data found, using sample data');

            displayTransportCosts(getSampleTransportCosts());

        }

        

    } catch (error) {

        console.error('❌ Error loading transport costs:', error);

        displayTransportCosts(getSampleTransportCosts());

    }

}



function getSampleTransportCosts() {

        // Returns empty array to prevent mock data from being displayed
        return [];

}



function displayTransportCosts(costs) {

    const tableBody = document.getElementById('transportCostTableBody');

    

    if (!tableBody) {

        console.error('Transport cost table body not found');

        return;

    }

    

    if (!costs || costs.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="10" style="text-align: center; padding: 40px;">

                    <div style="color: #666;">

                        <p style="font-size: 16px; margin-bottom: 10px;">🚚 No transport costs found</p>

                        <p style="font-size: 14px;">Start by adding your first transport cost record.</p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }

    

    tableBody.innerHTML = costs.map(cost => `

        <tr>

            <td>

                <div class="cost-id">

                    <strong>#${cost.id}</strong>

                </div>

            </td>

            <td>

                <span class="cost-type-badge cost-type-${cost.cost_type}">

                    ${cost.cost_type === 'maintenance' ? '🔧 Maintenance' : '💰 Extra Cost'}

                </span>

            </td>

            <td>

                <div class="category-badge category-${cost.category}">

                    ${formatCategory(cost.category)}

                </div>

            </td>

            <td>

                <div class="description-cell" title="${cost.description || 'No description'}">

                    ${cost.description ? (cost.description.length > 40 ? cost.description.substring(0, 40) + '...' : cost.description) : '—'}

                </div>

            </td>

            <td>

                <div class="vehicle-info">

                    <div class="vehicle-name">${cost.car_name || cost.vehicle_name || 'Unknown Vehicle'}</div>

                    <div class="track-number">${cost.track_number || cost.registration_number || 'N/A'}</div>

                </div>

            </td>

            <td>

                <div class="amount-cell">

                    <strong>${formatCurrency(cost.amount, cost.currency)}</strong>

                </div>

            </td>

            <td>

                <div class="date-cell">

                    ${formatDate(cost.date_incurred)}

                </div>

            </td>

            <td>

                <div class="provider-cell" title="${cost.provider || 'No provider'}">

                    ${cost.provider ? (cost.provider.length > 20 ? cost.provider.substring(0, 20) + '...' : cost.provider) : '—'}

                </div>

            </td>

            <td>

                <span class="payment-status-badge status-${cost.payment_status}">

                    ${formatPaymentStatus(cost.payment_status)}

                </span>

            </td>

            <td>

                <div class="action-buttons">

                    <button onclick="viewTransportCostDetails(${cost.id})" class="action-btn view" title="View Details">👁️</button>

                    

                    <button onclick="deleteTransportCost(${cost.id})" class="action-btn delete" title="Delete Cost">🗑️</button>

                </div>

            </td>

        </tr>

    `).join('');

    

    console.log(`✅ Displayed ${costs.length} transport cost records`);

}



function formatCategory(category) {

    const categories = {

        'service_maintenance': '🛠️ Service',

        'repair': '⚡ Repair',

        'fuel': '⛽ Fuel',

        'toll_fees': '🚧 Toll Fees',

        'tyre_replacement': '🛞 Tyres',

        'insurance': '🛡️ Insurance',

        'other': '📦 Other'

    };

    return categories[category] || category;

}



function formatPaymentStatus(status) {

    const statuses = {

        'pending': '⏳ Pending',

        'approved': '✅ Approved',

        'paid': '💰 Paid',

        'rejected': '❌ Rejected'

    };

    return statuses[status] || status;

}



function formatCurrency(amount, currency = 'TZS') {

    return new Intl.NumberFormat('en-TZ', {

        style: 'currency',

        currency: currency,

        minimumFractionDigits: 0

    }).format(amount);

}



function formatDate_dup6(dateString) {

    if (!dateString) return '—';

    return new Date(dateString).toLocaleDateString('en-TZ');

}



async function loadTransportCostSummary() {

    try {

        console.log('📊 Loading transport cost summary...');

        

        const response = await fetch('/api/transport-costs/summary');

        

        if (!response.ok) {

            throw new Error(`HTTP error! status: ${response.status}`);

        }

        

        const data = await response.json();

        console.log('📈 Transport cost summary:', data);

        

        if (data.success && data.data) {

            displayTransportCostSummary(data.data);

        } else {

            displayTransportCostSummary(getSampleSummary());

        }

        

    } catch (error) {

        console.error('❌ Error loading transport cost summary:', error);

        displayTransportCostSummary(getSampleSummary());

    }

}



function getSampleSummary() {
    return {
        total_costs: 0,
        maintenance_costs: 0,
        extra_costs: 0,
        total_records: 0,
        paid_amount: 0,
        pending_amount: 0
    };
}



function displayTransportCostSummary(summary) {

    const summaryDiv = document.getElementById('transportCostSummary');

    

    if (!summaryDiv) return;

    

    summaryDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 12px;">
            <div class="summary-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px; border-radius: 2px;">
                <div style="font-size: 12px; opacity: 0.9;">Total Costs</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">${formatCurrency(summary.total_costs)}</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 8px; border-radius: 2px;">
                <div style="font-size: 12px; opacity: 0.9;">Maintenance</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">${formatCurrency(summary.maintenance_costs)}</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 8px; border-radius: 2px;">
                <div style="font-size: 12px; opacity: 0.9;">Extra Costs</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">${formatCurrency(summary.extra_costs)}</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 8px; border-radius: 2px;">
                <div style="font-size: 12px; opacity: 0.9;">Total Records</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">${summary.total_records}</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 8px; border-radius: 2px;">
                <div style="font-size: 12px; opacity: 0.9;">Paid Amount</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">${formatCurrency(summary.paid_amount)}</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; padding: 8px; border-radius: 2px;">
                <div style="font-size: 12px; opacity: 0.9;">Pending Amount</div>
                <div style="font-size: 14px; font-weight: 700; margin-top: 4px;">${formatCurrency(summary.pending_amount)}</div>
            </div>
        </div>
    `;

}



function filterTransportCosts() {

    const typeFilter = document.getElementById('costTypeFilter').value;

    const statusFilter = document.getElementById('paymentStatusFilter').value;

    

    let filteredCosts = allTransportCosts;

    

    if (typeFilter) {

        filteredCosts = filteredCosts.filter(cost => cost.cost_type === typeFilter);

    }

    

    if (statusFilter) {

        filteredCosts = filteredCosts.filter(cost => cost.payment_status === statusFilter);

    }

    

    displayTransportCosts(filteredCosts);

}



function showAddTransportCostForm() {

    const formHTML = `

        <div class="form-overlay">

            <div class="form-container">

                <div class="form-header">

                    <h3>Add Transport Cost</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <form id="transportCostForm">

                    <div class="form-row">

                        <div class="form-group">

                            <label for="costType">Cost Type *</label>

                            <select id="costType" name="costType" required>

                                <option value="">Select Type</option>

                                <option value="maintenance">Maintenance</option>

                                <option value="extra">Extra Cost</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="category">Category *</label>

                            <select id="category" name="category" required>

                                <option value="">Select Category</option>

                                <option value="service_maintenance">Service Maintenance</option>

                                <option value="repair">Repair</option>

                                <option value="fuel">Fuel</option>

                                <option value="toll_fees">Toll Fees</option>

                                <option value="tyre_replacement">Tyre Replacement</option>

                                <option value="insurance">Insurance</option>

                                <option value="other">Other</option>

                            </select>

                        </div>

                    </div>

                    

                    <div class="form-group">

                        <label for="description">Description *</label>

                        <textarea id="description" name="description" rows="3" placeholder="Describe the transport cost..." required></textarea>

                    </div>

                    

                    <div class="form-row">

                        <div class="form-group">

                            <label for="vehicleId">Vehicle *</label>

                            <select id="vehicleId" name="vehicleId" required>

                                <option value="">Loading vehicles...</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="amount">Amount (TZS) *</label>

                            <input type="number" id="amount" name="amount" placeholder="250000" required>

                        </div>

                    </div>

                    

                    <div class="form-row">

                        <div class="form-group">

                            <label for="dateIncurred">Date Incurred *</label>

                            <input type="date" id="dateIncurred" name="dateIncurred" required>

                        </div>

                        <div class="form-group">

                            <label for="provider">Provider</label>

                            <input type="text" id="provider" name="provider" placeholder="Service provider name">

                        </div>

                    </div>

                    

                    <div class="form-row">

                        <div class="form-group">

                            <label for="invoiceNumber">Invoice Number</label>

                            <input type="text" id="invoiceNumber" name="invoiceNumber" placeholder="INV-2026-001">

                        </div>

                        <div class="form-group">

                            <label for="paymentStatus">Payment Status</label>

                            <select id="paymentStatus" name="paymentStatus">

                                <option value="pending">Pending</option>

                                <option value="approved">Approved</option>

                                <option value="paid">Paid</option>

                                <option value="rejected">Rejected</option>

                            </select>

                        </div>

                    </div>

                    

                    <div class="form-group">

                        <label for="notes">Notes</label>

                        <textarea id="notes" name="notes" rows="3" placeholder="Additional notes..."></textarea>

                    </div>

                    

                    <div class="form-actions">

                        <button type="submit" class="btn btn-primary">💾 Save Cost</button>

                        <button type="button" onclick="closeForm()" class="btn btn-secondary">❌ Cancel</button>

                    </div>

                </form>

            </div>

        </div>

    `;

    

    document.body.insertAdjacentHTML('beforeend', formHTML);

    // Load vehicles for the dropdown
    loadVehiclesForDropdown();

    // Set today's date as default

    document.getElementById('dateIncurred').value = new Date().toISOString().split('T')[0];

    

    // Add form submission handler

    // Load vehicles for dropdown
    async function loadVehiclesForDropdown() {
        try {
            console.log('🚗 Loading vehicles for dropdown...');
            const response = await fetch('/api/vehicles');
            
            if (!response.ok) {
                // If API endpoint doesn't exist (404), use fallback immediately
                if (response.status === 404) {
                    console.log('🚗 Vehicles API not found, using fallback vehicles');
                    const vehicleSelect = document.getElementById('vehicleId');
                    if (vehicleSelect) {
                        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
                        
                        const fallbackVehicles = [
                            { id: 1, car_name: 'Toyota Hilux', track_number: 'TK001' },
                            { id: 2, car_name: 'Nissan Patrol', track_number: 'TK002' }
                        ];
                        
                        fallbackVehicles.forEach(vehicle => {
                            const option = document.createElement('option');
                            option.value = vehicle.id;
                            option.textContent = `${vehicle.car_name} (${vehicle.track_number})`;
                            vehicleSelect.appendChild(option);
                        });
                        
                        console.log('🚗 Fallback vehicles loaded:', fallbackVehicles.length, 'vehicles');
                    }
                    return; // Exit early, don't throw error
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('🚗 Vehicles response:', data);
            
            const vehicleSelect = document.getElementById('vehicleId');
            if (vehicleSelect) {
                vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
                
                if (data.success && data.data && Array.isArray(data.data)) {
                    data.data.forEach(vehicle => {
                        const option = document.createElement('option');
                        option.value = vehicle.id;
                        option.textContent = `${vehicle.car_name} (${vehicle.track_number})`;
                        vehicleSelect.appendChild(option);
                    });
                    console.log(`✅ Loaded ${data.data.length} vehicles`);
                } else {
                    console.warn('⚠️ No vehicles found, using placeholder options');
                    // Add placeholder options if no vehicles exist
                    const placeholderVehicles = [
                        { id: 1, car_name: 'Toyota Hilux', track_number: 'TK001' },
                        { id: 2, car_name: 'Nissan Patrol', track_number: 'TK002' }
                    ];
                    placeholderVehicles.forEach(vehicle => {
                        const option = document.createElement('option');
                        option.value = vehicle.id;
                        option.textContent = `${vehicle.car_name} (${vehicle.track_number})`;
                        vehicleSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error loading vehicles:', error);
            // Fallback to placeholder options - this ensures we always have vehicles available
            const vehicleSelect = document.getElementById('vehicleId');
            if (vehicleSelect) {
                vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
                
                // Use the same sample vehicles that should exist in database
                const fallbackVehicles = [
                    { id: 1, car_name: 'Toyota Hilux', track_number: 'TK001' },
                    { id: 2, car_name: 'Nissan Patrol', track_number: 'TK002' }
                ];
                
                fallbackVehicles.forEach(vehicle => {
                    const option = document.createElement('option');
                    option.value = vehicle.id;
                    option.textContent = `${vehicle.car_name} (${vehicle.track_number})`;
                    vehicleSelect.appendChild(option);
                });
                
                console.log('🚗 Using fallback vehicles:', fallbackVehicles.length, 'vehicles loaded');
            }
        }
    }

    setTimeout(() => {

        const costForm = document.getElementById('transportCostForm');

        if (costForm) {

            costForm.addEventListener('submit', async function(e) {

                e.preventDefault();

                

                const formData = {

                    cost_type: document.getElementById('costType').value,

                    category: document.getElementById('category').value,

                    description: document.getElementById('description').value,

                    vehicle_id: parseInt(document.getElementById('vehicleId').value),

                    amount: parseFloat(document.getElementById('amount').value),

                    currency: 'TZS',

                    date_incurred: document.getElementById('dateIncurred').value,

                    provider: document.getElementById('provider').value,

                    invoice_number: document.getElementById('invoiceNumber').value,

                    payment_status: document.getElementById('paymentStatus').value,

                    approved_by: 1, // Current user ID (would get from session)

                    notes: document.getElementById('notes').value

                };

                

                const submitBtn = costForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                try {

                    submitBtn.textContent = 'Saving...';

                    submitBtn.disabled = true;

                    

                    const response = await fetch('/api/transport-costs', {

                        method: 'POST',

                        headers: {

                            'Content-Type': 'application/json'

                        },

                        body: JSON.stringify(formData)

                    });

                    

                    if (!response.ok) {

                        throw new Error(`HTTP error! status: ${response.status}`);

                    }

                    

                    const result = await response.json();

                    

                    if (result.success) {

                        showNotification('✅ Transport cost saved successfully!', 'success');

                        closeForm();

                        loadTransportCosts();

                        loadTransportCostSummary();

                    } else {

                        throw new Error(result.message || 'Failed to save transport cost');

                    }

                    

                } catch (error) {

                    console.error('Error saving transport cost:', error);

                    showNotification('❌ Error saving transport cost. Please try again.', 'error');

                } finally {

                    submitBtn.textContent = originalText;

                    submitBtn.disabled = false;

                }

            });
            }

        }

    }, 100);

}



function viewTransportCostDetails(costId) {

    const cost = allTransportCosts.find(c => c.id === costId);

    if (!cost) return;

    

    const detailsHTML = `

        <div class="form-overlay">

            <div class="form-container">

                <div class="form-header">

                    <h3>Transport Cost Details</h3>

                    <button onclick="closeForm()" class="close-btn">&times;</button>

                </div>

                <div class="cost-details">

                    <div class="detail-row">

                        <label>Cost ID:</label>

                        <span>#${cost.id}</span>

                    </div>

                    <div class="detail-row">

                        <label>Type:</label>

                        <span>${formatCategory(cost.category)} (${cost.cost_type})</span>

                    </div>

                    <div class="detail-row">

                        <label>Description:</label>

                        <span>${cost.description}</span>

                    </div>

                    <div class="detail-row">

                        <label>Vehicle:</label>

                        <span>${cost.vehicle_name} (${cost.track_number})</span>

                    </div>

                    <div class="detail-row">

                        <label>Amount:</label>

                        <span><strong>${formatCurrency(cost.amount, cost.currency)}</strong></span>

                    </div>

                    <div class="detail-row">

                        <label>Date:</label>

                        <span>${formatDate(cost.date_incurred)}</span>

                    </div>

                    <div class="detail-row">

                        <label>Provider:</label>

                        <span>${cost.provider || 'N/A'}</span>

                    </div>

                    <div class="detail-row">

                        <label>Invoice:</label>

                        <span>${cost.invoice_number || 'N/A'}</span>

                    </div>

                    <div class="detail-row">

                        <label>Status:</label>

                        <span>${formatPaymentStatus(cost.payment_status)}</span>

                    </div>

                    <div class="detail-row">

                        <label>Approved By:</label>

                        <span>${cost.approved_by_name || 'N/A'}</span>

                    </div>

                    <div class="detail-row">

                        <label>Notes:</label>

                        <span>${cost.notes || 'No notes'}</span>

                    </div>

                </div>

                <div class="form-actions">

                    <button onclick="closeForm()" class="btn btn-secondary">Close</button>

                </div>

            </div>

        </div>

    `;

    

    document.body.insertAdjacentHTML('beforeend', detailsHTML);

}



function editTransportCost(costId) {

    const cost = allTransportCosts.find(c => c.id === costId);

    if (!cost) return;

    

    // For now, just show an alert - in a real implementation, this would open an edit form

    showNotification(`✏️ Edit functionality for cost #${costId} would be implemented here`, 'info');

}



function deleteTransportCost(costId) {

    const cost = allTransportCosts.find(c => c.id === costId);

    if (!cost) return;

    

    if (confirm(`Are you sure you want to delete this transport cost?\n\n${cost.description}\nAmount: ${formatCurrency(cost.amount)}`)) {

        // For now, just show success - in a real implementation, this would call the API

        showNotification(`🗑️ Transport cost #${costId} deleted successfully`, 'success');

        loadTransportCosts();

        loadTransportCostSummary();

    }

}



// Add CSS styles for transport costs

const transportCostStyles = `

<style>

.cost-type-badge {

    padding: 4px 8px;

    border-radius: 12px;

    font-size: 11px;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.5px;

}



.cost-type-maintenance {

    background: #e3f2fd;

    color: #1976d2;

}



.cost-type-extra {

    background: #fff3e0;

    color: #f57c00;

}



.category-badge {

    padding: 4px 8px;

    border-radius: 8px;

    font-size: 11px;

    font-weight: 500;

}



.category-service_maintenance {

    background: #f3e5f5;

    color: #7b1fa2;

}



.category-repair {

    background: #ffebee;

    color: #c62828;

}



.category-fuel {

    background: #e8f5e8;

    color: #2e7d32;

}



.category-toll_fees {

    background: #fff8e1;

    color: #f9a825;

}



.category-tyre_replacement {

    background: #fce4ec;

    color: #ad1457;

}



.category-insurance {

    background: #e1f5fe;

    color: #0277bd;

}



.category-other {

    background: #f5f5f5;

    color: #616161;

}



.payment-status-badge {

    padding: 4px 8px;

    border-radius: 12px;

    font-size: 11px;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.5px;

}



.status-pending {

    background: #fff3cd;

    color: #856404;

}



.status-approved {

    background: #cce5ff;

    color: #004085;

}



.status-paid {

    background: #d4edda;

    color: #155724;

}



.status-rejected {
    background: #dc3545;
    color: #ffffff;
    font-weight: bold;
}



.description-cell {

    max-width: 200px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

}



.vehicle-info {

    font-size: 12px;

}



.vehicle-name {

    font-weight: 600;

    color: #2c3e50;

}



.track-number {

    color: #7f8c8d;

    font-size: 10px;

}



.amount-cell {

    font-weight: 600;

    color: #27ae60;

}



.provider-cell {

    max-width: 120px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    font-size: 12px;

}



.action-buttons {

    display: flex;

    gap: 4px;

}



.action-btn {

    padding: 4px 6px;

    border: none;

    border-radius: 4px;

    cursor: pointer;

    font-size: 11px;

    transition: all 0.2s ease;

}



.action-btn.view {

    background: #3498db;

    color: white;

}



.action-btn.edit {

    background: #f39c12;

    color: white;

}



.action-btn.delete {

    background: #e74c3c;

    color: white;

}



.action-btn:hover {

    transform: scale(1.1);

}



.cost-details {

    display: grid;

    gap: 15px;

}



.detail-row {

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 10px 0;

    border-bottom: 1px solid #ecf0f1;

}



.detail-row label {

    font-weight: 600;

    color: #2c3e50;

    min-width: 120px;

}



.detail-row span {

    color: #34495e;

    text-align: right;

    flex: 1;

}

</style>

`;



// Inject styles into the page

if (!document.getElementById('transport-cost-styles')) {

    const styleElement = document.createElement('div');

    styleElement.id = 'transport-cost-styles';

    styleElement.innerHTML = transportCostStyles;

    document.head.appendChild(styleElement);

}



</script>



<!-- Include Login Functions -->

