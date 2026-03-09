// ===== APPROVAL SYSTEM =====
class ApprovalSystem {
    static approvalStates = new Map(); // Track approval states to prevent duplicates

    static async processApproval(approvalId, action, data = {}) {
        // Check if this approval is already being processed
        if (this.approvalStates.has(approvalId)) {
            NotificationManager.show('This approval is already being processed. Please wait...', 'warning', 'Processing');
            return false;
        }

        // Mark as being processed
        this.approvalStates.set(approvalId, 'processing');
        
        try {
            // Simulate API call to backend
            const response = await fetch(`${window.ApiService.baseURL}/approvals/${approvalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.ApiService.token}`
                },
                body: JSON.stringify({
                    action: action,
                    data: data,
                    processedBy: window.ApiService.getCurrentUser()?.id || 'system',
                    processedAt: new Date().toISOString()
                })
            });

            const result = await response.json();
            
            if (result.success) {
                NotificationManager.show(`Approval ${action}ed successfully!`, 'success', 'Approval Processed');
                this.approvalStates.delete(approvalId);
                
                // Refresh the approval list if it exists
                if (typeof window.loadApprovalList === 'function') {
                    window.loadApprovalList();
                }
                
                return true;
            } else {
                throw new Error(result.error || 'Approval failed');
            }
            
        } catch (error) {
            console.error('Approval processing error:', error);
            NotificationManager.show(error.message, 'error', 'Approval Error');
            this.approvalStates.delete(approvalId);
            return false;
        }
    }

    static async getApprovalDetails(approvalId) {
        try {
            const response = await fetch(`${window.ApiService.baseURL}/approvals/${approvalId}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to fetch approval details');
            }
        } catch (error) {
            console.error('Fetch approval details error:', error);
            throw error;
        }
    }

    static clearApprovalState(approvalId) {
        this.approvalStates.delete(approvalId);
    }
}

// Export for global use
window.ApprovalSystem = ApprovalSystem;
