// ===== NEW FEATURES FRONTEND FUNCTIONS =====

// ===== CLAIMS MANAGEMENT =====

async function loadClaimsManagement() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Claims Management</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/claims-management');
        const claims = response || [];

        let html = `
            <div class="card">
                <h3>Claims Management</h3>
                <button onclick="showClaimForm()">+ New Claim</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Claim #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Type</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Title</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        claims.forEach(claim => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${claim.claim_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${claim.claim_type}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${claim.title}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${claim.claim_date}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${claim.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewClaim(${claim.id})">View</button>
                        <button onclick="editClaim(${claim.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="claimFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading claims:', error);
        showContent('<div class="card"><h3>Claims Management</h3><p>Error loading claims. Please try again.</p></div>');
    }
}

function showClaimForm(claimId = null) {
    const container = document.getElementById('claimFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${claimId ? 'Edit Claim' : 'New Claim'}</h4>
        <form onsubmit="saveClaim(event, ${claimId})">
            <label>Employee:</label>
            <select id="claimEmployee" required>
                <option value="">Select Employee</option>
            </select>
            <label>Claim Type:</label>
            <select id="claimType" required>
                <option value="Medical">Medical</option>
                <option value="Accident">Accident</option>
                <option value="Insurance">Insurance</option>
                <option value="Workers Compensation">Workers Compensation</option>
                <option value="Other">Other</option>
            </select>
            <label>Title:</label>
            <input type="text" id="claimTitle" required>
            <label>Description:</label>
            <textarea id="claimDescription" required></textarea>
            <label>Claim Date:</label>
            <input type="date" id="claimDate" required>
            <label>Amount Claimed:</label>
            <input type="number" id="claimAmount" step="0.01">
            <label>Priority:</label>
            <select id="claimPriority">
                <option value="Low">Low</option>
                <option value="Medium" selected>Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
            </select>
            <button type="submit">Save Claim</button>
            <button type="button" onclick="hideClaimForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
    loadEmployeesForSelect('claimEmployee');
}

function hideClaimForm() {
    document.getElementById('claimFormContainer').classList.add('hidden');
}

async function saveClaim(event, claimId = null) {
    event.preventDefault();
    
    const claimData = {
        employee_id: document.getElementById('claimEmployee').value,
        claim_type: document.getElementById('claimType').value,
        title: document.getElementById('claimTitle').value,
        description: document.getElementById('claimDescription').value,
        claim_date: document.getElementById('claimDate').value,
        amount_claimed: document.getElementById('claimAmount').value || null,
        priority: document.getElementById('claimPriority').value,
        created_by: getCurrentUserId()
    };

    try {
        if (claimId) {
            await window.apiService.put(`/claims-management/${claimId}`, claimData);
        } else {
            await window.apiService.post('/claims-management', claimData);
        }
        hideClaimForm();
        loadClaimsManagement();
        customAlert('Claim saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving claim:', error);
        customAlert('Error saving claim', 'Error', 'error');
    }
}

// ===== NSSF REGISTRATION =====

async function loadNssfRegistration() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>NSSF Registration</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/nssf-registration');
        const registrations = response || [];

        let html = `
            <div class="card">
                <h3>NSSF Registration</h3>
                <button onclick="showNssfForm()">+ New Registration</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Reg #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Employee</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">NSSF #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Reg Date</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        registrations.forEach(reg => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${reg.registration_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${reg.full_name || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${reg.nssf_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${reg.registration_date}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${reg.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewNssf(${reg.id})">View</button>
                        <button onclick="editNssf(${reg.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="nssfFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading NSSF registrations:', error);
        showContent('<div class="card"><h3>NSSF Registration</h3><p>Error loading registrations. Please try again.</p></div>');
    }
}

function showNssfForm(regId = null) {
    const container = document.getElementById('nssfFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${regId ? 'Edit Registration' : 'New Registration'}</h4>
        <form onsubmit="saveNssf(event, ${regId})">
            <label>Employee:</label>
            <select id="nssfEmployee" required>
                <option value="">Select Employee</option>
            </select>
            <label>NSSF Number:</label>
            <input type="text" id="nssfNumber" required>
            <label>Registration Date:</label>
            <input type="date" id="nssfRegDate" required>
            <label>Monthly Salary:</label>
            <input type="number" id="nssfSalary" step="0.01">
            <label>Employer Contribution Rate (%):</label>
            <input type="number" id="nssfEmployerRate" value="10" step="0.01">
            <label>Employee Contribution Rate (%):</label>
            <input type="number" id="nssfEmployeeRate" value="10" step="0.01">
            <button type="submit">Save Registration</button>
            <button type="button" onclick="hideNssfForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
    loadEmployeesForSelect('nssfEmployee');
}

function hideNssfForm() {
    document.getElementById('nssfFormContainer').classList.add('hidden');
}

async function saveNssf(event, regId = null) {
    event.preventDefault();
    
    const nssfData = {
        employee_id: document.getElementById('nssfEmployee').value,
        nssf_number: document.getElementById('nssfNumber').value,
        registration_date: document.getElementById('nssfRegDate').value,
        monthly_salary: document.getElementById('nssfSalary').value || null,
        employer_contribution_rate: document.getElementById('nssfEmployerRate').value,
        employee_contribution_rate: document.getElementById('nssfEmployeeRate').value,
        created_by: getCurrentUserId()
    };

    try {
        if (regId) {
            await window.apiService.put(`/nssf-registration/${regId}`, nssfData);
        } else {
            await window.apiService.post('/nssf-registration', nssfData);
        }
        hideNssfForm();
        loadNssfRegistration();
        customAlert('NSSF registration saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving NSSF registration:', error);
        customAlert('Error saving NSSF registration', 'Error', 'error');
    }
}

// ===== DISCIPLINE MONITORING =====

async function loadDisciplineMonitoring() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Discipline Monitoring</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/discipline-monitoring');
        const cases = response || [];

        let html = `
            <div class="card">
                <h3>Discipline Monitoring</h3>
                <button onclick="showDisciplineForm()">+ New Case</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Case #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Employee</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Type</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Severity</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        cases.forEach(caseRecord => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${caseRecord.case_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${caseRecord.full_name || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${caseRecord.incident_type}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${caseRecord.incident_date}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${caseRecord.severity}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${caseRecord.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewDiscipline(${caseRecord.id})">View</button>
                        <button onclick="editDiscipline(${caseRecord.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="disciplineFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading discipline cases:', error);
        showContent('<div class="card"><h3>Discipline Monitoring</h3><p>Error loading cases. Please try again.</p></div>');
    }
}

function showDisciplineForm(caseId = null) {
    const container = document.getElementById('disciplineFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${caseId ? 'Edit Case' : 'New Discipline Case'}</h4>
        <form onsubmit="saveDiscipline(event, ${caseId})">
            <label>Employee:</label>
            <select id="disciplineEmployee" required>
                <option value="">Select Employee</option>
            </select>
            <label>Incident Type:</label>
            <select id="disciplineType" required>
                <option value="Absenteeism">Absenteeism</option>
                <option value="Late Arrival">Late Arrival</option>
                <option value="Misconduct">Misconduct</option>
                <option value="Policy Violation">Policy Violation</option>
                <option value="Insubordination">Insubordination</option>
                <option value="Theft">Theft</option>
                <option value="Harassment">Harassment</option>
                <option value="Safety Violation">Safety Violation</option>
                <option value="Other">Other</option>
            </select>
            <label>Incident Date:</label>
            <input type="datetime-local" id="disciplineDate" required>
            <label>Location:</label>
            <input type="text" id="disciplineLocation">
            <label>Description:</label>
            <textarea id="disciplineDescription" required></textarea>
            <label>Severity:</label>
            <select id="disciplineSeverity" required>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
            </select>
            <label>Witnesses:</label>
            <textarea id="disciplineWitnesses"></textarea>
            <button type="submit">Save Case</button>
            <button type="button" onclick="hideDisciplineForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
    loadEmployeesForSelect('disciplineEmployee');
}

function hideDisciplineForm() {
    document.getElementById('disciplineFormContainer').classList.add('hidden');
}

async function saveDiscipline(event, caseId = null) {
    event.preventDefault();
    
    const disciplineData = {
        employee_id: document.getElementById('disciplineEmployee').value,
        incident_type: document.getElementById('disciplineType').value,
        incident_date: document.getElementById('disciplineDate').value,
        incident_location: document.getElementById('disciplineLocation').value || null,
        description: document.getElementById('disciplineDescription').value,
        severity: document.getElementById('disciplineSeverity').value,
        witnesses: document.getElementById('disciplineWitnesses').value || null,
        reported_by: getCurrentUserId()
    };

    try {
        if (caseId) {
            await window.apiService.put(`/discipline-monitoring/${caseId}`, disciplineData);
        } else {
            await window.apiService.post('/discipline-monitoring', disciplineData);
        }
        hideDisciplineForm();
        loadDisciplineMonitoring();
        customAlert('Discipline case saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving discipline case:', error);
        customAlert('Error saving discipline case', 'Error', 'error');
    }
}

// ===== OFFICE RESOURCES =====

async function loadOfficeResources() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Office Resources</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/office-resources');
        const resources = response || [];

        let html = `
            <div class="card">
                <h3>Office Resources</h3>
                <button onclick="showResourceForm()">+ New Resource</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Code</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Type</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Condition</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Assigned To</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        resources.forEach(resource => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${resource.resource_code}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${resource.resource_name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${resource.resource_type}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${resource.condition}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${resource.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${resource.full_name || 'Unassigned'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewResource(${resource.id})">View</button>
                        <button onclick="editResource(${resource.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="resourceFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading office resources:', error);
        showContent('<div class="card"><h3>Office Resources</h3><p>Error loading resources. Please try again.</p></div>');
    }
}

function showResourceForm(resourceId = null) {
    const container = document.getElementById('resourceFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${resourceId ? 'Edit Resource' : 'New Resource'}</h4>
        <form onsubmit="saveResource(event, ${resourceId})">
            <label>Resource Code:</label>
            <input type="text" id="resourceCode" required>
            <label>Resource Name:</label>
            <input type="text" id="resourceName" required>
            <label>Resource Type:</label>
            <select id="resourceType" required>
                <option value="Computer">Computer</option>
                <option value="Printer">Printer</option>
                <option value="Desk">Desk</option>
                <option value="Chair">Chair</option>
                <option value="Phone">Phone</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Equipment">Equipment</option>
                <option value="Software License">Software License</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Other">Other</option>
            </select>
            <label>Description:</label>
            <textarea id="resourceDescription"></textarea>
            <label>Serial Number:</label>
            <input type="text" id="resourceSerial">
            <label>Purchase Date:</label>
            <input type="date" id="resourcePurchaseDate">
            <label>Purchase Cost:</label>
            <input type="number" id="resourcePurchaseCost" step="0.01">
            <label>Condition:</label>
            <select id="resourceCondition">
                <option value="New">New</option>
                <option value="Good" selected>Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
            </select>
            <label>Location:</label>
            <input type="text" id="resourceLocation">
            <label>Department:</label>
            <input type="text" id="resourceDepartment">
            <button type="submit">Save Resource</button>
            <button type="button" onclick="hideResourceForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
}

function hideResourceForm() {
    document.getElementById('resourceFormContainer').classList.add('hidden');
}

async function saveResource(event, resourceId = null) {
    event.preventDefault();
    
    const resourceData = {
        resource_code: document.getElementById('resourceCode').value,
        resource_name: document.getElementById('resourceName').value,
        resource_type: document.getElementById('resourceType').value,
        description: document.getElementById('resourceDescription').value || null,
        serial_number: document.getElementById('resourceSerial').value || null,
        purchase_date: document.getElementById('resourcePurchaseDate').value || null,
        purchase_cost: document.getElementById('resourcePurchaseCost').value || null,
        condition: document.getElementById('resourceCondition').value,
        location: document.getElementById('resourceLocation').value || null,
        department: document.getElementById('resourceDepartment').value || null,
        created_by: getCurrentUserId()
    };

    try {
        if (resourceId) {
            await window.apiService.put(`/office-resources/${resourceId}`, resourceData);
        } else {
            await window.apiService.post('/office-resources', resourceData);
        }
        hideResourceForm();
        loadOfficeResources();
        customAlert('Resource saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving resource:', error);
        customAlert('Error saving resource', 'Error', 'error');
    }
}

// ===== TALENT ACQUISITION =====

async function loadTalentAcquisition() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Talent Acquisition</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/talent-acquisition');
        const requisitions = response || [];

        let html = `
            <div class="card">
                <h3>Talent Acquisition</h3>
                <button onclick="showTalentForm()">+ New Requisition</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Req #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Position</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Department</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Type</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Level</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        requisitions.forEach(req => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${req.requisition_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${req.position_title}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${req.department}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${req.position_type}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${req.experience_level}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${req.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewTalent(${req.id})">View</button>
                        <button onclick="editTalent(${req.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="talentFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading talent requisitions:', error);
        showContent('<div class="card"><h3>Talent Acquisition</h3><p>Error loading requisitions. Please try again.</p></div>');
    }
}

function showTalentForm(reqId = null) {
    const container = document.getElementById('talentFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${reqId ? 'Edit Requisition' : 'New Requisition'}</h4>
        <form onsubmit="saveTalent(event, ${reqId})">
            <label>Position Title:</label>
            <input type="text" id="talentPosition" required>
            <label>Department:</label>
            <input type="text" id="talentDepartment" required>
            <label>Position Type:</label>
            <select id="talentType" required>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Intern">Intern</option>
            </select>
            <label>Experience Level:</label>
            <select id="talentLevel" required>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
                <option value="Intern">Intern</option>
            </select>
            <label>Number of Positions:</label>
            <input type="number" id="talentNumber" value="1" required>
            <label>Job Description:</label>
            <textarea id="talentDescription"></textarea>
            <label>Requirements:</label>
            <textarea id="talentRequirements"></textarea>
            <label>Salary Range Min:</label>
            <input type="number" id="talentSalaryMin" step="0.01">
            <label>Salary Range Max:</label>
            <input type="number" id="talentSalaryMax" step="0.01">
            <label>Request Date:</label>
            <input type="date" id="talentRequestDate" required>
            <label>Priority:</label>
            <select id="talentPriority">
                <option value="Low">Low</option>
                <option value="Medium" selected>Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
            </select>
            <label>Budget Code:</label>
            <input type="text" id="talentBudgetCode">
            <label>Expected Start Date:</label>
            <input type="date" id="talentStartDate">
            <button type="submit">Save Requisition</button>
            <button type="button" onclick="hideTalentForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
}

function hideTalentForm() {
    document.getElementById('talentFormContainer').classList.add('hidden');
}

async function saveTalent(event, reqId = null) {
    event.preventDefault();
    
    const talentData = {
        position_title: document.getElementById('talentPosition').value,
        department: document.getElementById('talentDepartment').value,
        position_type: document.getElementById('talentType').value,
        experience_level: document.getElementById('talentLevel').value,
        number_of_positions: document.getElementById('talentNumber').value,
        job_description: document.getElementById('talentDescription').value || null,
        requirements: document.getElementById('talentRequirements').value || null,
        salary_range_min: document.getElementById('talentSalaryMin').value || null,
        salary_range_max: document.getElementById('talentSalaryMax').value || null,
        request_date: document.getElementById('talentRequestDate').value,
        priority: document.getElementById('talentPriority').value,
        budget_code: document.getElementById('talentBudgetCode').value || null,
        expected_start_date: document.getElementById('talentStartDate').value || null,
        requested_by: getCurrentUserId()
    };

    try {
        if (reqId) {
            await window.apiService.put(`/talent-acquisition/${reqId}`, talentData);
        } else {
            await window.apiService.post('/talent-acquisition', talentData);
        }
        hideTalentForm();
        loadTalentAcquisition();
        customAlert('Requisition saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving requisition:', error);
        customAlert('Error saving requisition', 'Error', 'error');
    }
}

// ===== PROMOTIONS =====

async function loadPromotions() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Promotions</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/promotions');
        const promotions = response || [];

        let html = `
            <div class="card">
                <h3>Promotions</h3>
                <button onclick="showPromotionForm()">+ New Promotion</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Promo #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Employee</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Type</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Current Position</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">New Position</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Effective Date</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        promotions.forEach(promo => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.promotion_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.full_name || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.promotion_type}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.current_position}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.new_position}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.effective_date}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${promo.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewPromotion(${promo.id})">View</button>
                        <button onclick="editPromotion(${promo.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="promotionFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading promotions:', error);
        showContent('<div class="card"><h3>Promotions</h3><p>Error loading promotions. Please try again.</p></div>');
    }
}

function showPromotionForm(promoId = null) {
    const container = document.getElementById('promotionFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${promoId ? 'Edit Promotion' : 'New Promotion'}</h4>
        <form onsubmit="savePromotion(event, ${promoId})">
            <label>Employee:</label>
            <select id="promotionEmployee" required>
                <option value="">Select Employee</option>
            </select>
            <label>Promotion Type:</label>
            <select id="promotionType" required>
                <option value="Promotion">Promotion</option>
                <option value="Transfer">Transfer</option>
                <option value="Demotion">Demotion</option>
                <option value="Salary Increase">Salary Increase</option>
                <option value="Role Change">Role Change</option>
            </select>
            <label>Current Position:</label>
            <input type="text" id="promotionCurrentPosition" required>
            <label>Current Department:</label>
            <input type="text" id="promotionCurrentDept" required>
            <label>Current Salary:</label>
            <input type="number" id="promotionCurrentSalary" step="0.01">
            <label>New Position:</label>
            <input type="text" id="promotionNewPosition" required>
            <label>New Department:</label>
            <input type="text" id="promotionNewDept">
            <label>New Salary:</label>
            <input type="number" id="promotionNewSalary" step="0.01">
            <label>Effective Date:</label>
            <input type="date" id="promotionEffectiveDate" required>
            <label>Reason:</label>
            <textarea id="promotionReason" required></textarea>
            <label>Performance Rating:</label>
            <input type="text" id="promotionRating">
            <label>Recommendation Date:</label>
            <input type="date" id="promotionRecDate" required>
            <button type="submit">Save Promotion</button>
            <button type="button" onclick="hidePromotionForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
    loadEmployeesForSelect('promotionEmployee');
}

function hidePromotionForm() {
    document.getElementById('promotionFormContainer').classList.add('hidden');
}

async function savePromotion(event, promoId = null) {
    event.preventDefault();
    
    const promotionData = {
        employee_id: document.getElementById('promotionEmployee').value,
        promotion_type: document.getElementById('promotionType').value,
        current_position: document.getElementById('promotionCurrentPosition').value,
        current_department: document.getElementById('promotionCurrentDept').value,
        current_salary: document.getElementById('promotionCurrentSalary').value || null,
        new_position: document.getElementById('promotionNewPosition').value,
        new_department: document.getElementById('promotionNewDept').value || null,
        new_salary: document.getElementById('promotionNewSalary').value || null,
        effective_date: document.getElementById('promotionEffectiveDate').value,
        reason: document.getElementById('promotionReason').value,
        performance_rating: document.getElementById('promotionRating').value || null,
        recommendation_date: document.getElementById('promotionRecDate').value,
        recommended_by: getCurrentUserId()
    };

    try {
        if (promoId) {
            await window.apiService.put(`/promotions/${promoId}`, promotionData);
        } else {
            await window.apiService.post('/promotions', promotionData);
        }
        hidePromotionForm();
        loadPromotions();
        customAlert('Promotion saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving promotion:', error);
        customAlert('Error saving promotion', 'Error', 'error');
    }
}

// ===== RISK MANAGEMENT =====

async function loadRiskManagement() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Risk Management</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/risk-management');
        const risks = response || [];

        let html = `
            <div class="card">
                <h3>Risk Management</h3>
                <button onclick="showRiskForm()">+ New Risk</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Risk #</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Title</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Category</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Probability</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Impact</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        risks.forEach(risk => {
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${risk.risk_number}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${risk.risk_title}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${risk.risk_category}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${risk.probability}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${risk.impact}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${risk.status}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="viewRisk(${risk.id})">View</button>
                        <button onclick="editRisk(${risk.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="riskFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading risks:', error);
        showContent('<div class="card"><h3>Risk Management</h3><p>Error loading risks. Please try again.</p></div>');
    }
}

function showRiskForm(riskId = null) {
    const container = document.getElementById('riskFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${riskId ? 'Edit Risk' : 'New Risk'}</h4>
        <form onsubmit="saveRisk(event, ${riskId})">
            <label>Risk Title:</label>
            <input type="text" id="riskTitle" required>
            <label>Risk Category:</label>
            <select id="riskCategory" required>
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Safety">Safety</option>
                <option value="Legal">Legal</option>
                <option value="Reputational">Reputational</option>
                <option value="Strategic">Strategic</option>
                <option value="Technical">Technical</option>
                <option value="Environmental">Environmental</option>
                <option value="Other">Other</option>
            </select>
            <label>Risk Description:</label>
            <textarea id="riskDescription" required></textarea>
            <label>Probability:</label>
            <select id="riskProbability" required>
                <option value="Very Low">Very Low</option>
                <option value="Low">Low</option>
                <option value="Medium" selected>Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
            </select>
            <label>Impact:</label>
            <select id="riskImpact" required>
                <option value="Very Low">Very Low</option>
                <option value="Low">Low</option>
                <option value="Medium" selected>Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
            </select>
            <label>Department:</label>
            <input type="text" id="riskDepartment">
            <label>Identified Date:</label>
            <input type="date" id="riskIdentifiedDate" required>
            <label>Mitigation Strategy:</label>
            <textarea id="riskMitigation"></textarea>
            <label>Contingency Plan:</label>
            <textarea id="riskContingency"></textarea>
            <label>Cost of Mitigation:</label>
            <input type="number" id="riskCost" step="0.01">
            <label>Potential Loss:</label>
            <input type="number" id="riskLoss" step="0.01">
            <button type="submit">Save Risk</button>
            <button type="button" onclick="hideRiskForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
}

function hideRiskForm() {
    document.getElementById('riskFormContainer').classList.add('hidden');
}

async function saveRisk(event, riskId = null) {
    event.preventDefault();
    
    const riskData = {
        risk_title: document.getElementById('riskTitle').value,
        risk_category: document.getElementById('riskCategory').value,
        risk_description: document.getElementById('riskDescription').value,
        probability: document.getElementById('riskProbability').value,
        impact: document.getElementById('riskImpact').value,
        department: document.getElementById('riskDepartment').value || null,
        identified_date: document.getElementById('riskIdentifiedDate').value,
        mitigation_strategy: document.getElementById('riskMitigation').value || null,
        contingency_plan: document.getElementById('riskContingency').value || null,
        cost_of_mitigation: document.getElementById('riskCost').value || null,
        potential_loss: document.getElementById('riskLoss').value || null,
        identified_by: getCurrentUserId()
    };

    try {
        if (riskId) {
            await window.apiService.put(`/risk-management/${riskId}`, riskData);
        } else {
            await window.apiService.post('/risk-management', riskData);
        }
        hideRiskForm();
        loadRiskManagement();
        customAlert('Risk saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving risk:', error);
        customAlert('Error saving risk', 'Error', 'error');
    }
}

// ===== HELPER FUNCTIONS =====

async function loadEmployeesForSelect(selectId) {
    try {
        if (!window.apiService) return;
        
        const response = await window.apiService.get('/employees');
        const employees = response || [];
        
        const select = document.getElementById(selectId);
        if (select) {
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.id;
                option.textContent = emp.full_name || `Employee ${emp.id}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

function getCurrentUserId() {
    // This should get the current user ID from session or token
    // For now, return a placeholder
    return 1;
}

function showContent(html) {
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.innerHTML = html;
    }
}

// Placeholder view/edit functions (to be implemented)
function viewClaim(id) { console.log('View claim:', id); }
function editClaim(id) { showClaimForm(id); }
function viewNssf(id) { console.log('View NSSF:', id); }
function editNssf(id) { showNssfForm(id); }
function viewDiscipline(id) { console.log('View discipline:', id); }
function editDiscipline(id) { showDisciplineForm(id); }
function viewResource(id) { console.log('View resource:', id); }
function editResource(id) { showResourceForm(id); }
function viewTalent(id) { console.log('View talent:', id); }
function editTalent(id) { showTalentForm(id); }
function viewPromotion(id) { console.log('View promotion:', id); }
function editPromotion(id) { showPromotionForm(id); }
function viewRisk(id) { console.log('View risk:', id); }
function editRisk(id) { showRiskForm(id); }