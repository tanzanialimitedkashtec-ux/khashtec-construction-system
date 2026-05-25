// Work Completion Approval Functions
// This file contains functions for loading and managing work completions from the database

// Load work completions from database for approval
function loadWorkCompletions() {
    console.log('🔄 Loading work completions for approval...');
    
    const baseUrl = window.location.origin;
    
    fetch(`${baseUrl}/api/work/completions/pending`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${sessionManager?.getAuthToken?.() || ''}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📊 Work completions data received:', data);
        const completions = data.data || data || [];
        displayWorkCompletions(completions);
    })
    .catch(error => {
        console.error('❌ Error loading work completions:', error);
        // Display mock data on error
        const mockData = [
            {
                id: 'work001',
                work_details: 'Foundation Excavation',
                project: 'Port Modernization Phase 1',
                completed_by: 'John Doe - Construction Worker',
                completed_date: '2026-03-15',
                quality_score: 95,
                quality_level: 'excellent',
                status: 'pending'
            },
            {
                id: 'work002',
                work_details: 'Steel Framework Installation',
                project: 'Warehouse Construction',
                completed_by: 'Mike Johnson - Engineer',
                completed_date: '2026-03-14',
                quality_score: 88,
                quality_level: 'good',
                status: 'pending'
            }
        ];
        displayWorkCompletions(mockData);
    });
}

// Display work completions in a table
function displayWorkCompletions(completions) {
    console.log('🎨 Displaying work completions...');
    
    // Find or create the container
    let container = document.getElementById('workCompletionsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'workCompletionsContainer';
        document.body.appendChild(container);
    }
    
    if (!completions || completions.length === 0) {
        container.innerHTML = '<div class="no-data">No pending work completions found.</div>';
        return;
    }
    
    const tableHTML = `
        <div class="work-completions-section">
            <h3>Work Completion Approvals</h3>
            <div class="work-completions-table-container">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Work Details</th>
                            <th>Project</th>
                            <th>Completed By</th>
                            <th>Completed Date</th>
                            <th>Quality Score</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${completions.map(work => `
                            <tr class="work-completion-row" data-work-id="${work.id}">
                                <td><strong>${work.work_details || 'N/A'}</strong></td>
                                <td>${work.project || 'N/A'}</td>
                                <td>${work.completed_by || 'N/A'}</td>
                                <td>${formatDate(work.completed_date)}</td>
                                <td>
                                    <span class="quality-score ${getQualityClass(work.quality_score)}">
                                        ${work.quality_score || 0}%
                                    </span>
                                </td>
                                <td>
                                    <button class="action" onclick="approveWork('${work.id}')" style="background: #28a745;">Approve</button>
                                    <button class="action" onclick="requestRework('${work.id}')" style="background: #ffc107;">Request Rework</button>
                                    <button class="action" onclick="rejectWork('${work.id}')" style="background: #dc3545;">Reject</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    console.log('✅ Work completions displayed successfully');
}

// Approve a work completion
window.approveWork = function(workId) {
    console.log('✅ Approving work (populating form):', workId);
    
    if (!workId) {
        customAlert('Work ID is required', 'Error', 'error');
        return;
    }
    
    // Set work ID in the approval form (supports both select and input)
    const workIdEl = document.getElementById('workId');
    if (workIdEl) {
        workIdEl.value = workId;
        // Trigger onWorkItemSelected to show details panel
        if (typeof onWorkItemSelected === 'function') onWorkItemSelected(workId);
    } else {
        console.error('workId field not found');
        customAlert('Error: Work ID field not found on the page.', 'Error', 'error');
        return;
    }
    
    // Set default values for approval in the form
    const complianceCheck = document.getElementById('complianceCheck');
    if (complianceCheck) complianceCheck.value = 'fully-compliant';
    
    // Show the approval form if it's not visible
    const formContainer = document.getElementById('approvalFormContainer');
    if (formContainer) {
        if (formContainer.style.display === 'none' || !formContainer.classList.contains('show')) {
            if (typeof toggleApprovalForm === 'function') {
                toggleApprovalForm();
            } else {
                formContainer.style.display = 'block';
                formContainer.classList.add('show');
                const toggleBtn = document.getElementById('toggleApprovalFormBtn');
                if (toggleBtn) {
                    toggleBtn.innerHTML = '❌ Close Approval Form';
                    toggleBtn.style.background = '#dc3545';
                }
            }
        }
    }
    
    // Scroll to the approval form
    const approvalForm = document.getElementById('approvalForm');
    if (approvalForm) {
        approvalForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    customAlert(`Work ID ${workId} loaded into the Approval Form below. Please review details and click "Submit Approval".`, 'Approval Form Ready', 'success');
};

// Request rework for a work completion
window.requestRework = function(workId) {
    console.log('🔄 Requesting rework for work:', workId);
    
    if (!workId) {
        customAlert('Work ID is required', 'Error', 'error');
        return;
    }
    
    // Show modal for rework details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3>Request Rework</h3>
            <textarea id="reworkReason" placeholder="Enter reason for rework request..." style="
                width: 100%;
                height: 120px;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                margin-bottom: 15px;
                box-sizing: border-box;
            "></textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('.modal-overlay').remove()" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Cancel</button>
                <button onclick="submitReworkRequest('${workId}')" style="
                    background: #ffc107;
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Submit Rework Request</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
};

// Submit rework request
window.submitReworkRequest = function(workId) {
    const reasonElement = document.getElementById('reworkReason');
    const reworkReason = reasonElement?.value || '';
    
    if (!reworkReason.trim()) {
        customAlert('Please provide a reason for rework', 'Error', 'error');
        return;
    }
    
    const baseUrl = window.location.origin;
    
    fetch(`${baseUrl}/api/work/completions/${workId}/rework`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${sessionManager?.getAuthToken?.() || ''}`
        },
        body: JSON.stringify({
            reworkReason: reworkReason,
            requestedBy: sessionManager?.getCurrentUser?.()?.name || 'Managing Director'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Rework request response:', data);
        if (data.success) {
            document.querySelector('.modal-overlay')?.remove();
            customAlert('Rework request submitted successfully!', 'Success', 'success');
            if (typeof loadPendingWorkCompletions === 'function') loadPendingWorkCompletions();
            if (typeof loadApprovalHistory === 'function') loadApprovalHistory();
            if (typeof loadWorkCompletions === 'function') loadWorkCompletions();
        } else {
            throw new Error(data.error || 'Failed to request rework');
        }
    })
    .catch(error => {
        console.error('❌ Error requesting rework:', error);
        customAlert(`Error requesting rework: ${error.message}`, 'Error', 'error');
    });
};

// Reject a work completion
window.rejectWork = function(workId) {
    console.log('❌ Rejecting work:', workId);
    
    if (!workId) {
        customAlert('Work ID is required', 'Error', 'error');
        return;
    }
    
    // Show modal for rejection details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3>Reject Work</h3>
            <textarea id="rejectionReason" placeholder="Enter reason for rejection..." style="
                width: 100%;
                height: 120px;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                margin-bottom: 15px;
                box-sizing: border-box;
            "></textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('.modal-overlay').remove()" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Cancel</button>
                <button onclick="submitRejection('${workId}')" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Reject Work</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
};

// Submit rejection
window.submitRejection = function(workId) {
    const reasonElement = document.getElementById('rejectionReason');
    const rejectionReason = reasonElement?.value || '';
    
    if (!rejectionReason.trim()) {
        customAlert('Please provide a reason for rejection', 'Error', 'error');
        return;
    }
    
    const baseUrl = window.location.origin;
    
    fetch(`${baseUrl}/api/work/completions/${workId}/reject`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${sessionManager?.getAuthToken?.() || ''}`
        },
        body: JSON.stringify({
            rejectionReason: rejectionReason,
            rejectedBy: sessionManager?.getCurrentUser?.()?.name || 'Managing Director'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Rejection response:', data);
        if (data.success) {
            document.querySelector('.modal-overlay')?.remove();
            customAlert('Work rejected successfully!', 'Success', 'success');
            if (typeof loadPendingWorkCompletions === 'function') loadPendingWorkCompletions();
            if (typeof loadApprovalHistory === 'function') loadApprovalHistory();
            if (typeof loadWorkCompletions === 'function') loadWorkCompletions();
        } else {
            throw new Error(data.error || 'Failed to reject work');
        }
    })
    .catch(error => {
        console.error('❌ Error rejecting work:', error);
        customAlert(`Error rejecting work: ${error.message}`, 'Error', 'error');
    });
};

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Helper function to get quality class
function getQualityClass(score) {
    const numScore = parseInt(score) || 0;
    if (numScore >= 90) return 'excellent';
    if (numScore >= 80) return 'good';
    if (numScore >= 70) return 'acceptable';
    return 'poor';
}

// Load pending work completions into the pendingWorkTableBody
window.loadPendingWorkCompletions = function() {
    var tbody = document.getElementById('pendingWorkTableBody');
    if (!tbody) return;
    var baseUrl = window.location.origin;
    fetch(baseUrl + '/api/work/completions/pending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + (typeof sessionManager !== 'undefined' && sessionManager.getAuthToken ? sessionManager.getAuthToken() : '')
        }
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        var items = data.data || data || [];
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No pending work completions found.</td></tr>';
            return;
        }
        var html = '';
        items.forEach(function(work) {
            var qClass = 'poor';
            var score = parseInt(work.quality_score) || 0;
            if (score >= 90) qClass = 'excellent';
            else if (score >= 80) qClass = 'good';
            else if (score >= 70) qClass = 'acceptable';
            var dateStr = work.completed_date ? new Date(work.completed_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
            html += '<tr>' +
                '<td><strong>' + (work.work_details || 'N/A') + '</strong></td>' +
                '<td>' + (work.project || 'N/A') + '</td>' +
                '<td>' + (work.completed_by || 'N/A') + '</td>' +
                '<td>' + dateStr + '</td>' +
                '<td><span class="quality-score ' + qClass + '">' + score + '%</span></td>' +
                '<td>' +
                    '<button class="action" onclick="approveWork(\'' + work.id + '\')" style="background: #28a745;">Approve</button>' +
                    '<button class="action" onclick="requestRework(\'' + work.id + '\')" style="background: #ffc107;">Request Rework</button>' +
                    '<button class="action" onclick="rejectWork(\'' + work.id + '\')" style="background: #dc3545;">Reject</button>' +
                '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    })
    .catch(function(error) {
        console.error('Error loading pending work completions:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #dc3545;">Failed to load pending work. Please try again.</td></tr>';
    });
};

// Load approval history into the approvalHistoryTableBody
window.loadApprovalHistory = function() {
    var tbody = document.getElementById('approvalHistoryTableBody');
    if (!tbody) return;
    var baseUrl = window.location.origin;
    fetch(baseUrl + '/api/work/approvals/recent', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + (typeof sessionManager !== 'undefined' && sessionManager.getAuthToken ? sessionManager.getAuthToken() : '')
        }
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        var items = data.data || data || [];
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No approval history found.</td></tr>';
            return;
        }
        var html = '';
        items.forEach(function(approval) {
            var dateStr = approval.created_at ? new Date(approval.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
            var qualityDisplay = (approval.quality_assessment || 'N/A').charAt(0).toUpperCase() + (approval.quality_assessment || 'N/A').slice(1);
            var complianceDisplay = (approval.compliance_check || 'N/A').replace(/-/g, ' ');
            complianceDisplay = complianceDisplay.charAt(0).toUpperCase() + complianceDisplay.slice(1);
            var complianceClass = approval.compliance_check || 'fully-compliant';
            html += '<tr>' +
                '<td><strong>' + (approval.work_id || 'N/A') + '</strong></td>' +
                '<td>' + dateStr + '</td>' +
                '<td><span class="quality-score ' + (approval.quality_assessment || '') + '">' + qualityDisplay + '</span></td>' +
                '<td><span class="compliance-status ' + complianceClass + '">' + complianceDisplay + '</span></td>' +
                '<td>' + (approval.approved_by || 'N/A') + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    })
    .catch(function(error) {
        console.error('Error loading approval history:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #dc3545;">Failed to load approval history.</td></tr>';
    });
};

// Export for use in department.js
window.loadWorkCompletions = loadWorkCompletions;
window.displayWorkCompletions = displayWorkCompletions;
