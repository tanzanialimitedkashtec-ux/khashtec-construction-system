// ===== API CONNECTION TEST =====
// Test file to verify frontend-backend communication

// Test function to verify API connectivity
async function testAPIConnection() {
    console.log('🔍 Testing API Connection...');
    
    try {
        // Test 1: Get all department data
        console.log('📊 Testing: Get all department data...');
        const allData = await KashTecAPI.getAllDepartmentData();
        console.log('✅ All department data:', allData);
        
        // Test 2: Get department statistics
        console.log('📈 Testing: Get department statistics...');
        const stats = await KashTecAPI.getDepartmentStats();
        console.log('✅ Department statistics:', stats);
        
        // Test 3: Get HR work records
        console.log('👥 Testing: Get HR work records...');
        const hrWork = await KashTecAPI.getHRWork();
        console.log('✅ HR work records:', hrWork);
        
        // Test 4: Get policies
        console.log('📋 Testing: Get policies...');
        const policies = await KashTecAPI.getPolicies();
        console.log('✅ Policies:', policies);
        
        // Test 5: Legacy compatibility
        console.log('🔄 Testing: Legacy compatibility...');
        const projects = await KashTecAPI.getProjects();
        console.log('✅ Legacy projects:', projects);
        
        console.log('🎉 All API tests completed successfully!');
        
        // Show success message
        if (typeof customAlert === 'function') {
            customAlert('API connection test completed successfully! All endpoints are working.', 'Success', 'success');
        } else {
            alert('API connection test completed successfully! All endpoints are working.');
        }
        
    } catch (error) {
        console.error('❌ API connection test failed:', error);
        
        // Show error message
        if (typeof customAlert === 'function') {
            customAlert(`API connection test failed: ${error.message}`, 'Error', 'error');
        } else {
            alert(`API connection test failed: ${error.message}`);
        }
    }
}

// Test creating a sample HR work record
async function testCreateHRWork() {
    console.log('🧪 Testing: Create HR work record...');
    
    try {
        const sampleHRWork = {
            work_type: 'Employee Registration',
            work_title: 'Test Employee Registration',
            work_description: 'Test employee registration for API connectivity',
            employee_name: 'Test Employee',
            employee_email: 'test@kashtec.com',
            project_name: 'API Test Project',
            priority: 'Medium',
            submitted_by: 'API Tester',
            due_date: '2026-12-31'
        };
        
        const result = await KashTecAPI.createHRWork(sampleHRWork);
        console.log('✅ HR work record created:', result);
        
        if (typeof customAlert === 'function') {
            customAlert('HR work record created successfully!', 'Success', 'success');
        }
        
    } catch (error) {
        console.error('❌ Failed to create HR work record:', error);
        KashTecAPI.handleApiError(error, 'Create HR Work');
    }
}

// Test updating work status
async function testUpdateWorkStatus() {
    console.log('🔄 Testing: Update work status...');
    
    try {
        // First get some work records
        const hrWork = await KashTecAPI.getHRWork();
        
        if (hrWork.length > 0) {
            const firstWork = hrWork[0];
            const statusData = {
                status: 'Completed',
                assigned_to: 'API Tester',
                completion_date: new Date().toISOString()
            };
            
            const result = await KashTecAPI.updateWorkStatus('hr_work', firstWork.id, statusData);
            console.log('✅ Work status updated:', result);
            
            if (typeof customAlert === 'function') {
                customAlert('Work status updated successfully!', 'Success', 'success');
            }
        } else {
            console.log('ℹ️ No HR work records found to update');
        }
        
    } catch (error) {
        console.error('❌ Failed to update work status:', error);
        KashTecAPI.handleApiError(error, 'Update Work Status');
    }
}

// Export test functions
window.APITest = {
    testAPIConnection,
    testCreateHRWork,
    testUpdateWorkStatus
};

// Auto-run connection test when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 API Test module loaded. Run APITest.testAPIConnection() to test connectivity.');
});
