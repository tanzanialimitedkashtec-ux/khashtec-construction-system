// ===== DIRECTOR OF ADMINISTRATION MODULE =====
class AdminDepartment {
    constructor() {
        this.initializeEventListeners();
        this.currentApprovals = [];
    }

    initializeEventListeners() {
        console.log('Admin Department initialized');
    }

    manageStaff() {
        UIController.showContent(`
            <div class="card">
                <h3>Staff Management</h3>
                <p><strong>Staff Management:</strong> View, monitor, and oversee all employee records and activities</p>
                
                <div class="staff-overview">
                    <div class="overview-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Employees:</span>
                            <span class="stat-value">156</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Active:</span>
                            <span class="stat-value active">142</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">On Leave:</span>
                            <span class="stat-value leave">8</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">New Hires:</span>
                            <span class="stat-value new">6</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    companyDocuments() {
        FormManager.showCustomForm(
            'Manage Company Documents',
            [
                { name: 'docType', type: 'select', label: 'Document Type', required: true, options: [
                    { value: 'crb', label: 'CRB Certificate' },
                    { value: 'tin', label: 'TIN Certificate' },
                    { value: 'vrn', label: 'VRN Certificate' },
                    { value: 'osha', label: 'OSHA Certificate' },
                    { value: 'license', label: 'Business License' }
                ]},
                { name: 'docName', type: 'text', label: 'Document Name', required: true },
                { name: 'expiryDate', type: 'date', label: 'Expiry Date', required: true },
                { name: 'upload', type: 'file', label: 'Upload Document', required: true }
            ],
            (data) => {
                NotificationManager.show(`Document ${data.docName} uploaded successfully!`, 'success', 'Document Uploaded');
            }
        );
    }

    reviewPendingApprovals() {
        this.loadApprovals();
    }

    async loadApprovals() {
        try {
            const response = await fetch(`${window.ApiService.baseURL}/approvals`);
            const result = await response.json();
            
            if (result.success) {
                this.currentApprovals = result.data;
                this.renderApprovalList();
            } else {
                throw new Error(result.error || 'Failed to fetch approvals');
            }
        } catch (error) {
            console.error('Load approvals error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    renderApprovalList() {
        const approvalListHTML = this.currentApprovals.map((approval) => {
            return `
                <div class="approval-item ${approval.urgent ? 'urgent' : ''}">
                    <h4>${approval.name}</h4>
                    <p>Employee ID: ${approval.employeeId} | Department: ${approval.department}</p>
                    <div class="approval-actions">
                        <button class="btn btn-primary" onclick="AdminDepartment.processApproval('${approval.id}', 'approve')">Approve</button>
                        <button class="btn btn-secondary" onclick="AdminDepartment.processApproval('${approval.id}', 'review')">Review</button>
                    </div>
                </div>
            `;
        }).join('');

        UIController.showContent(`
            <div class="card">
                <h3>Pending Approvals Dashboard</h3>
                <p><strong>Approval Management:</strong> Review and process all pending approval requests</p>
                
                <div class="approval-filters">
                    <h4>Filter Approvals</h4>
                    <div class="form-row">
                        <input type="text" placeholder="Search approvals..." onkeyup="AdminDepartment.filterApprovals()">
                        <select onchange="AdminDepartment.filterApprovals()">
                            <option value="">All Types</option>
                            <option value="contract">Contract Renewals</option>
                            <option value="performance">Performance Reviews</option>
                            <option value="salary">Salary Adjustments</option>
                            <option value="promotion">Promotions</option>
                        </select>
                    </div>
                </div>
                
                <div class="approval-list">
                    ${approvalListHTML}
                </div>
            </div>
        `);
    }

    monitorCompliance() {
        NotificationManager.show('Opening compliance monitoring dashboard...', 'info', 'Compliance Monitoring');
    }

    exportStaffData() {
        FormManager.showCustomForm(
            'Export Staff Data',
            [
                { name: 'dataType', type: 'select', label: 'Data Type', required: true, options: [
                    { value: 'all', label: 'All Data' },
                    { value: 'active', label: 'Active Employees' },
                    { value: 'payroll', label: 'Payroll Data' },
                    { value: 'performance', label: 'Performance Data' }
                ]},
                { name: 'format', type: 'select', label: 'Export Format', required: true, options: [
                    { value: 'excel', label: 'Excel' },
                    { value: 'pdf', label: 'PDF' },
                    { value: 'csv', label: 'CSV' }
                ]}
            ],
            (data) => {
                NotificationManager.show(`Exporting ${data.dataType} as ${data.format}...`, 'info', 'Exporting Data');
            }
        );
    }

    static filterApprovals() {
        // Implementation for filtering approvals
        console.log('Filtering approvals...');
    }

    static processApproval(approvalId, action) {
        NotificationManager.show(`Approval ${approvalId} ${action}ed successfully!`, 'success', 'Approval Processed');
    }
}

// Export for global use
window.AdminDepartment = AdminDepartment;
