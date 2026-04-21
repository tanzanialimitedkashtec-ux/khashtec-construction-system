// ===== MANAGING DIRECTOR MODULE =====
class MDDepartment {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // MD-specific event listeners
        console.log('MD Department initialized');
    }

    approveRecruitmentPolicies() {
        FormManager.showCustomForm(
            'Approve Recruitment Policy',
            [
                { name: 'policyName', type: 'text', label: 'Policy Name', required: true },
                { name: 'description', type: 'textarea', label: 'Description', required: true },
                { name: 'action', type: 'select', label: 'Action', required: true, options: [
                    { value: 'approve', label: 'Approve' },
                    { value: 'reject', label: 'Reject' },
                    { value: 'revision', label: 'Request Revision' }
                ]}
            ],
            (data) => {
                NotificationManager.show(`Policy ${data.policyName} ${data.action}ed successfully!`, 'success', 'Policy Processed');
            }
        );
    }

    approveSeniorHiring() {
        FormManager.showCustomForm(
            'Senior Staff Hiring Approval',
            [
                { name: 'candidateName', type: 'text', label: 'Candidate Name', required: true },
                { name: 'position', type: 'text', label: 'Position', required: true },
                { name: 'salary', type: 'number', label: 'Proposed Salary', required: true },
                { name: 'action', type: 'select', label: 'Decision', required: true, options: [
                    { value: 'approve', label: 'Approve' },
                    { value: 'reject', label: 'Reject' },
                    { value: 'interview', label: 'Request Interview' }
                ]}
            ],
            (data) => {
                NotificationManager.show(`Hiring decision for ${data.candidateName} processed!`, 'success', 'Hiring Processed');
            }
        );
    }

    approveWorkforceBudget() {
        FormManager.showCustomForm(
            'Workforce Budget Approval',
            [
                { name: 'department', type: 'text', label: 'Department', required: true },
                { name: 'budgetAmount', type: 'number', label: 'Budget Amount (TZS)', required: true },
                { name: 'period', type: 'select', label: 'Budget Period', required: true, options: [
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'annually', label: 'Annually' }
                ]},
                { name: 'action', type: 'select', label: 'Action', required: true, options: [
                    { value: 'approve', label: 'Approve' },
                    { value: 'modify', label: 'Request Modification' },
                    { value: 'reject', label: 'Reject' }
                ]}
            ],
            (data) => {
                NotificationManager.show(`Budget for ${data.department} ${data.action}ed!`, 'success', 'Budget Processed');
            }
        );
    }

    manageStaff() {
        NotificationManager.show('Opening staff management dashboard...', 'info', 'Staff Management');
    }

    generateWorkforceReport() {
        FormManager.showCustomForm(
            'Generate Workforce Report',
            [
                { name: 'reportType', type: 'select', label: 'Report Type', required: true, options: [
                    { value: 'summary', label: 'Staff Summary' },
                    { value: 'attendance', label: 'Attendance Report' },
                    { value: 'performance', label: 'Performance Report' },
                    { value: 'payroll', label: 'Payroll Report' }
                ]},
                { name: 'period', type: 'select', label: 'Period', required: true, options: [
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'yearly', label: 'Yearly' }
                ]},
                { name: 'format', type: 'select', label: 'Format', required: true, options: [
                    { value: 'pdf', label: 'PDF' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'word', label: 'Word' }
                ]}
            ],
            (data) => {
                NotificationManager.show(`Generating ${data.reportType} report for ${data.period}...`, 'info', 'Report Generation');
            }
        );
    }
}

// Export for global use
window.MDDepartment = MDDepartment;
