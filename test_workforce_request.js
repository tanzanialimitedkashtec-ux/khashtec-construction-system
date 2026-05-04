// Test script to verify workforce request API

async function testWorkforceRequest() {
    const baseUrl = 'http://localhost:8080';
    
    // Test case 1: Valid request with job categories
    const validRequest = {
        project: 'prj001',
        requestType: 'additional',
        workersNeeded: 5,
        duration: '2 weeks',
        jobCategories: ['construction', 'labor'],
        justification: 'Need additional workers for foundation work',
        startDate: '2026-05-01',
        endDate: '2026-05-15',
        specialRequirements: 'Experience with concrete work',
        submittedBy: 'Project Manager'
    };
    
    // Test case 2: Invalid request with empty job categories
    const invalidRequest = {
        project: 'prj001',
        requestType: 'additional',
        workersNeeded: 5,
        duration: '2 weeks',
        jobCategories: [],
        justification: 'Need additional workers for foundation work',
        startDate: '2026-05-01',
        endDate: '2026-05-15',
        specialRequirements: 'Experience with concrete work',
        submittedBy: 'Project Manager'
    };
    
    console.log('Testing valid workforce request...');
    try {
        const response = await fetch(`${baseUrl}/api/work/workforce-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validRequest)
        });
        
        const result = await response.json();
        console.log('Valid request result:', response.status, result);
    } catch (error) {
        console.error('Valid request error:', error.message);
    }
    
    console.log('\nTesting invalid workforce request (empty job categories)...');
    try {
        const response = await fetch(`${baseUrl}/api/work/workforce-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invalidRequest)
        });
        
        const result = await response.json();
        console.log('Invalid request result:', response.status, result);
    } catch (error) {
        console.error('Invalid request error:', error.message);
    }
}

testWorkforceRequest();
