const fs = require('fs');
const path = './frontend/public/department.js';
let content = fs.readFileSync(path, 'utf8');

// The code defining sampleViolations starts at 'const sampleViolations = ['
// and ends after 'displayViolations(sampleViolations);'
// Let's use a regex to replace it

const regex = /const sampleViolations = \[\s*\{[\s\S]*?displayViolations\(sampleViolations\);\s*?\n/m;

const loadViolationsFunc = `
async function fetchAndDisplayViolations() {
    const violationsList = document.getElementById('violationsList');
    if (violationsList) {
        violationsList.innerHTML = '<tr><td colspan="14"><div class="loading">Loading violations from database...</div></td></tr>';
    }
    
    try {
        const response = await fetch('/api/violations', {
            headers: {
                'Authorization': \`Bearer \${sessionManager?.getAuthToken() || localStorage.getItem('authToken')}\`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch violations');
        
        const data = await response.json();
        if (data.success && data.violations) {
            // Map the DB fields to the format expected by displayViolations
            const formattedViolations = data.violations.map(v => ({
                id: v.violation_id,
                violationId: v.violation_id,
                date: v.date,
                project: v.project,
                type: v.type,
                severity: v.severity,
                violators: v.violators,
                location: v.location,
                description: v.description,
                immediateAction: v.immediate_action,
                correctiveAction: v.corrective_action,
                actionDeadline: v.action_deadline,
                status: v.status,
                reportedBy: v.reported_by
            }));
            displayViolations(formattedViolations);
        } else {
            displayViolations([]);
        }
    } catch (error) {
        console.error('Error fetching violations:', error);
        if (violationsList) {
            violationsList.innerHTML = '<tr><td colspan="14"><div class="error" style="color: red; text-align: center; padding: 20px;">Failed to load violations. Please try again.</div></td></tr>';
        }
    }
}

fetchAndDisplayViolations();
`;

if (regex.test(content)) {
    content = content.replace(regex, loadViolationsFunc);
    console.log("Successfully replaced sampleViolations with fetchAndDisplayViolations.");
} else {
    console.log("Could not find sampleViolations in department.js");
}

fs.writeFileSync(path, content, 'utf8');

// Now update approveViolation and rejectViolation
const approveRegex = /function approveViolation\(violationId\) \{[\s\S]*?\}/m;
const rejectRegex = /function rejectViolation\(violationId\) \{[\s\S]*?\}/m;

const newApprove = `async function approveViolation(violationId) {
    if(!confirm('Are you sure you want to approve this violation?')) return;
    try {
        const response = await fetch(\`/api/violations/\${violationId}/status\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${sessionManager?.getAuthToken() || localStorage.getItem('authToken')}\`
            },
            body: JSON.stringify({ status: 'resolved' })
        });
        if (response.ok) {
            customAlert(\`Violation ID: \${violationId} has been approved successfully.\`, "Approve Violation", "success");
            fetchAndDisplayViolations();
        } else {
            customAlert("Failed to approve violation.", "Error", "error");
        }
    } catch (error) {
        console.error(error);
        customAlert("An error occurred.", "Error", "error");
    }
}`;

const newReject = `async function rejectViolation(violationId) {
    if(!confirm('Are you sure you want to reject this violation?')) return;
    try {
        const response = await fetch(\`/api/violations/\${violationId}/status\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${sessionManager?.getAuthToken() || localStorage.getItem('authToken')}\`
            },
            body: JSON.stringify({ status: 'rejected' })
        });
        if (response.ok) {
            customAlert(\`Violation ID: \${violationId} has been rejected.\`, "Reject Violation", "warning");
            fetchAndDisplayViolations();
        } else {
            customAlert("Failed to reject violation.", "Error", "error");
        }
    } catch (error) {
        console.error(error);
        customAlert("An error occurred.", "Error", "error");
    }
}`;

if (approveRegex.test(content)) {
    content = content.replace(approveRegex, newApprove);
    console.log("Replaced approveViolation");
}
if (rejectRegex.test(content)) {
    content = content.replace(rejectRegex, newReject);
    console.log("Replaced rejectViolation");
}

fs.writeFileSync(path, content, 'utf8');
