// ===== NEW FEATURES FRONTEND FUNCTIONS =====

// ===== CLAIMS MANAGEMENT =====

async function loadClaimsManagement() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Claims Management</h3><p>API service not available</p></div>');
            return;
        }

// ===== ASSETS & EQUIPMENT MANAGEMENT =====

async function loadAssetsEquipment() {
    try {
        if (!window.apiService) {
            console.error('apiService not available');
            showContent('<div class="card"><h3>Asset & Equipment Management</h3><p>API service not available</p></div>');
            return;
        }

        const response = await window.apiService.get('/assets-equipment');
        const assets = response || [];

        let html = `
            <div class="card">
                <h3>Asset & Equipment Management</h3>
                <button onclick="showAssetForm()">+ New Asset/Equipment</button>
                <div class="department-table-container" style="margin-top:20px;">
                    <table class="department-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Condition</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        assets.forEach(asset => {
            html += `
                <tr>
                    <td>${asset.asset_code}</td>
                    <td>${asset.asset_name}</td>
                    <td>${asset.category}</td>
                    <td>${asset.condition}</td>
                    <td>${asset.status}</td>
                    <td>${asset.full_name || 'Unassigned'}</td>
                    <td>
                        <button onclick="viewAsset(${asset.id})">View</button>
                        <button onclick="editAsset(${asset.id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div id="assetFormContainer" class="card hidden"></div>
        `;

        showContent(html);
    } catch (error) {
        console.error('Error loading assets & equipment:', error);
        showContent('<div class="card"><h3>Asset & Equipment Management</h3><p>Error loading records. Please try again.</p></div>');
    }
}

function showAssetForm(assetId = null) {
    const container = document.getElementById('assetFormContainer');
    container.classList.remove('hidden');
    
    const html = `
        <h4>${assetId ? 'Edit Asset/Equipment' : 'New Asset/Equipment'}</h4>
        <form onsubmit="saveAsset(event, ${assetId})">
            <label>Asset Code:</label>
            <input type="text" id="assetCode" required>
            <label>Asset Name:</label>
            <input type="text" id="assetName" required>
            <label>Category:</label>
            <select id="assetCategory" required>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Tool">Tool</option>
                <option value="Furniture">Furniture</option>
                <option value="Plant">Plant</option>
                <option value="Generator">Generator</option>
                <option value="Other">Other</option>
            </select>
            <label>Asset Type:</label>
            <input type="text" id="assetType">
            <label>Description:</label>
            <textarea id="assetDescription"></textarea>
            <label>Serial Number:</label>
            <input type="text" id="assetSerial">
            <label>Purchase Date:</label>
            <input type="date" id="assetPurchaseDate">
            <label>Purchase Cost:</label>
            <input type="number" id="assetPurchaseCost" step="0.01">
            <label>Current Value:</label>
            <input type="number" id="assetCurrentValue" step="0.01">
            <label>Depreciation Method:</label>
            <select id="assetDepreciation">
                <option value="Straight Line">Straight Line</option>
                <option value="Declining Balance">Declining Balance</option>
                <option value="Units of Production">Units of Production</option>
                <option value="None">None</option>
            </select>
            <label>Useful Life (years):</label>
            <input type="number" id="assetLife" min="0">
            <label>Condition:</label>
            <select id="assetCondition">
                <option value="New">New</option>
                <option value="Good" selected>Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
            </select>
            <label>Location:</label>
            <input type="text" id="assetLocation">
            <label>Department:</label>
            <input type="text" id="assetDepartment">
            <label>Supplier:</label>
            <input type="text" id="assetSupplier">
            <label>Warranty Expiry:</label>
            <input type="date" id="assetWarranty">
            <label>Notes:</label>
            <textarea id="assetNotes"></textarea>
            <button type="submit">Save Asset</button>
            <button type="button" onclick="hideAssetForm()">Cancel</button>
        </form>
    `;
    
    container.innerHTML = html;
}

function hideAssetForm() {
    const el = document.getElementById('assetFormContainer');
    if (el) el.classList.add('hidden');
}

async function saveAsset(event, assetId = null) {
    event.preventDefault();
    
    const assetData = {
        asset_code: document.getElementById('assetCode').value,
        asset_name: document.getElementById('assetName').value,
        category: document.getElementById('assetCategory').value,
        asset_type: document.getElementById('assetType').value || null,
        description: document.getElementById('assetDescription').value || null,
        serial_number: document.getElementById('assetSerial').value || null,
        purchase_date: document.getElementById('assetPurchaseDate').value || null,
        purchase_cost: document.getElementById('assetPurchaseCost').value || null,
        current_value: document.getElementById('assetCurrentValue').value || null,
        depreciation_method: document.getElementById('assetDepreciation').value || 'Straight Line',
        useful_life_years: document.getElementById('assetLife').value || null,
        condition: document.getElementById('assetCondition').value,
        location: document.getElementById('assetLocation').value || null,
        department: document.getElementById('assetDepartment').value || null,
        supplier: document.getElementById('assetSupplier').value || null,
        warranty_expiry: document.getElementById('assetWarranty').value || null,
        notes: document.getElementById('assetNotes').value || null,
        created_by: getCurrentUserId()
    };

    try {
        if (assetId) {
            await window.apiService.put(`/assets-equipment/${assetId}`, assetData);
        } else {
            await window.apiService.post('/assets-equipment', assetData);
        }
        hideAssetForm();
        loadAssetsEquipment();
        customAlert('Asset saved successfully', 'Success', 'success');
    } catch (error) {
        console.error('Error saving asset:', error);
        customAlert('Error saving asset', 'Error', 'error');
    }
}


        const response = await window.apiService.get('/claims-management');
        const claims = response || [];

        let html = `
            <div class="card">
                <h3>Claims Management</h3>
                <button onclick="showClaimForm()">+ New Claim</button>
                <div class="department-table-container" style="margin-top:20px;">
                    <table class="department-table">
                        <thead>
                            <tr>
                                <th>Claim #</th>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        claims.forEach(claim => {
            html += `
                <tr>
                    <td>${claim.claim_number}</td>
                    <td>${claim.claim_type}</td>
                    <td>${claim.title}</td>
                    <td>${claim.claim_date}</td>
                    <td>${claim.status}</td>
                    <td>
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
                <div class="department-table-container" style="margin-top:20px;">
                    <table class="department-table">
                        <thead>
                            <tr>
                                <th>Case #</th>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        cases.forEach(caseRecord => {
            html += `
                <tr>
                    <td>${caseRecord.case_number}</td>
                    <td>${caseRecord.full_name || 'N/A'}</td>
                    <td>${caseRecord.incident_type}</td>
                    <td>${caseRecord.incident_date}</td>
                    <td>${caseRecord.severity}</td>
                    <td>${caseRecord.status}</td>
                    <td>
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
                <div class="department-table-container" style="margin-top:20px;">
                    <table class="department-table">
                        <thead>
                            <tr>
                                <th>Req #</th>
                                <th>Position</th>
                                <th>Department</th>
                                <th>Type</th>
                                <th>Level</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        requisitions.forEach(req => {
            html += `
                <tr>
                    <td>${req.requisition_number}</td>
                    <td>${req.position_title}</td>
                    <td>${req.department}</td>
                    <td>${req.position_type}</td>
                    <td>${req.experience_level}</td>
                    <td>${req.status}</td>
                    <td>
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
                <button onclick="showRiskForm()" class="btn btn-primary">+ New Risk</button>
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; border: 1px solid #031865de;">Risk #</th>
                            <th style="padding: 10px; border: 1px solid #031865de;">Title</th>
                            <th style="padding: 10px; border: 1px solid #031865de">Category</th>
                            <th style="padding: 10px; border: 1px solid #031865de;">Probability</th>
                            <th style="padding: 10px; border: 1px solid #031865de;">Impact</th>
                            <th style="padding: 10px; border: 1px solid #031865de;">Status</th>
                            <th style="padding: 10px; border: 1px solid #031865de;">Actions</th>
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

// ========== VIEW SUGGESTIONS TABLE ==========

async function loadViewSuggestions() {
    try {
        if (!window.apiService) {
            showContent('<div class="card"><h3>View Suggestions</h3><p>API service not available</p></div>');
            return;
        }

        const suggestions = (await window.apiService.get('/suggestions-view')) || [];
        const isMD = _isMDRole();

        const statusLabel = {
            'pending': 'Submitted',
            'under-review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'implemented': 'Implemented'
        };

        const statusColor = {
            'pending': '#ffc107',
            'under-review': '#17a2b8',
            'approved': '#28a745',
            'rejected': '#dc3545',
            'implemented': '#6f42c1'
        };

        const categoryLabel = {
            'safety': 'Safety',
            'productivity': 'Productivity',
            'cost-saving': 'Cost Saving',
            'quality': 'Quality',
            'environment': 'Environment',
            'training': 'Training',
            'equipment': 'Technology',
            'process': 'Process Improvement',
            'other': 'Other'
        };

        const priorityLabel = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'urgent': 'Critical'
        };

        const priorityColor = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545'
        };

        let html = '<div class="card">';
        html += '<h3>View Suggestions</h3>';
        if (isMD) {
            html += '<p style="color:#555;margin-bottom:15px;">As Managing Director, you can approve or reject suggestions from all departments.</p>';
        } else {
            html += '<p style="color:#555;margin-bottom:15px;">Suggestions submitted by all departments.</p>';
        }

        html += '<table style="width:100%;margin-top:10px;border-collapse:collapse;">';
        html += '<thead><tr style="background:#f4f4f4;">';
        html += '<th style="padding:10px;border:1px solid #ddd;">#</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Title</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Category</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Department</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Submitted By</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Priority</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Status</th>';
        html += '<th style="padding:10px;border:1px solid #ddd;">Date</th>';
        if (isMD) {
            html += '<th style="padding:10px;border:1px solid #ddd;">Actions</th>';
        }
        html += '</tr></thead><tbody>';

        if (suggestions.length === 0) {
            const colspan = isMD ? 9 : 8;
            html += '<tr><td colspan="' + colspan + '" style="padding:20px;text-align:center;border:1px solid #ddd;">No suggestions found.</td></tr>';
        }

        suggestions.forEach(function(s, idx) {
            var sLabel = statusLabel[s.status] || s.status || 'Unknown';
            var sColor = statusColor[s.status] || '#6c757d';
            var cLabel = categoryLabel[s.category] || s.category || 'N/A';
            var pLabel = priorityLabel[s.priority] || s.priority || 'N/A';
            var pColor = priorityColor[s.priority] || '#6c757d';
            var submitter = s.submitted_by_name || s.employee_name || 'Unknown';
            var dept = s.department || 'N/A';
            var dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A';

            html += '<tr>';
            html += '<td style="padding:10px;border:1px solid #ddd;">' + (idx + 1) + '</td>';
            html += '<td style="padding:10px;border:1px solid #ddd;cursor:pointer;color:#007bff;" onclick="viewSuggestionDetail(' + s.id + ')">' + _escHtml(s.title) + '</td>';
            html += '<td style="padding:10px;border:1px solid #ddd;">' + _escHtml(cLabel) + '</td>';
            html += '<td style="padding:10px;border:1px solid #ddd;">' + _escHtml(dept) + '</td>';
            html += '<td style="padding:10px;border:1px solid #ddd;">' + _escHtml(submitter) + '</td>';
            html += '<td style="padding:10px;border:1px solid #ddd;"><span style="color:' + pColor + ';font-weight:bold;">' + _escHtml(pLabel) + '</span></td>';
            html += '<td style="padding:10px;border:1px solid #ddd;"><span style="background:' + sColor + ';color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;">' + _escHtml(sLabel) + '</span></td>';
            html += '<td style="padding:10px;border:1px solid #ddd;">' + dateStr + '</td>';

            if (isMD) {
                html += '<td style="padding:10px;border:1px solid #ddd;white-space:nowrap;">';
                if (s.status === 'pending' || s.status === 'under-review') {
                    html += '<button onclick="approveSuggestion(' + s.id + ')" style="background:#28a745;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;margin-right:4px;">Approve</button>';
                    html += '<button onclick="rejectSuggestion(' + s.id + ')" style="background:#dc3545;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">Reject</button>';
                } else {
                    html += '<span style="color:#999;font-size:12px;">' + _escHtml(sLabel) + '</span>';
                }
                html += '</td>';
            }

            html += '</tr>';
        });

        html += '</tbody></table></div>';

        showContent(html);
    } catch (error) {
        console.error('Error loading view suggestions:', error);
        showContent('<div class="card"><h3>View Suggestions</h3><p>Error loading suggestions. Please try again.</p></div>');
    }
}

function viewSuggestionDetail(id) {
    if (!window.apiService) return;
    window.apiService.get('/suggestions-view').then(function(suggestions) {
        var s = (suggestions || []).find(function(item) { return item.id === id; });
        if (!s) { alert('Suggestion not found'); return; }

        var statusLabel = {
            'pending': 'Submitted', 'under-review': 'Under Review',
            'approved': 'Approved', 'rejected': 'Rejected', 'implemented': 'Implemented'
        };
        var categoryLabel = {
            'safety': 'Safety', 'productivity': 'Productivity', 'cost-saving': 'Cost Saving',
            'quality': 'Quality', 'environment': 'Environment', 'training': 'Training',
            'equipment': 'Technology', 'process': 'Process Improvement', 'other': 'Other'
        };

        var html = '<table style="width:100%;border-collapse:collapse;">';
        html += _detailRow('Title', s.title);
        html += _detailRow('Category', categoryLabel[s.category] || s.category);
        html += _detailRow('Department', s.department || 'N/A');
        html += _detailRow('Submitted By', s.submitted_by_name || s.employee_name || 'Unknown');
        html += _detailRow('Priority', s.priority);
        html += _detailRow('Status', statusLabel[s.status] || s.status);
        html += _detailRow('Description', s.description);
        if (s.reviewer_name) html += _detailRow('Reviewed By', s.reviewer_name);
        if (s.reviewed_date) html += _detailRow('Reviewed Date', new Date(s.reviewed_date).toLocaleDateString());
        if (s.rejection_reason) html += _detailRow('Rejection Reason', s.rejection_reason);
        html += _detailRow('Date Submitted', s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A');
        html += '</table>';

        if (typeof showViewModal === 'function') {
            showViewModal('Suggestion Details', html);
        } else {
            _showSuggestionModal('Suggestion Details', html);
        }
    }).catch(function(err) {
        console.error('Error viewing suggestion detail:', err);
    });
}

function _showSuggestionModal(title, bodyHtml) {
    var overlay = document.createElement('div');
    overlay.className = 'form-overlay';
    overlay.innerHTML = '<div class="form-container" style="max-width:600px;">' +
        '<div class="form-header"><h3>' + _escHtml(title) + '</h3>' +
        '<button onclick="this.closest(\'.form-overlay\').remove()" class="close-btn">&times;</button></div>' +
        '<div style="padding:15px;">' + bodyHtml + '</div></div>';
    document.body.appendChild(overlay);
}

function _detailRow(label, value) {
    return '<tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;width:35%;vertical-align:top;">' +
        _escHtml(label) + '</td><td style="padding:8px;border:1px solid #eee;">' +
        _escHtml(value || '') + '</td></tr>';
}

function _escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _isMDRole() {
    if (typeof currentRole !== 'undefined' && currentRole === 'MD') return true;
    if (typeof getCurrentUserRole === 'function') {
        var role = getCurrentUserRole();
        if (role === 'MD') return true;
    }
    var el = document.getElementById('userRole');
    if (el) {
        var text = (el.textContent || '').trim();
        if (text.indexOf('Managing Director') !== -1 || text === 'MD Dashboard') return true;
    }
    if (typeof sessionManager !== 'undefined' && sessionManager.getCurrentUser) {
        var user = sessionManager.getCurrentUser();
        if (user && (user.role === 'MD' || user.role === 'Managing Director')) return true;
    }
    return false;
}

async function approveSuggestion(id) {
    if (!confirm('Are you sure you want to approve this suggestion?')) return;
    try {
        await window.apiService.request('/suggestions-view/' + id + '/approve', {
            method: 'PUT',
            body: JSON.stringify({ reviewed_by: 'MD' })
        });
        if (typeof showNotification === 'function') {
            showNotification('Suggestion approved successfully!', 'success');
        } else {
            alert('Suggestion approved successfully!');
        }
        loadViewSuggestions();
    } catch (error) {
        console.error('Error approving suggestion:', error);
        alert('Error approving suggestion. Please try again.');
    }
}

async function rejectSuggestion(id) {
    var reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return;
    try {
        await window.apiService.request('/suggestions-view/' + id + '/reject', {
            method: 'PUT',
            body: JSON.stringify({ reviewed_by: 'MD', rejection_reason: reason })
        });
        if (typeof showNotification === 'function') {
            showNotification('Suggestion rejected.', 'info');
        } else {
            alert('Suggestion rejected.');
        }
        loadViewSuggestions();
    } catch (error) {
        console.error('Error rejecting suggestion:', error);
        alert('Error rejecting suggestion. Please try again.');
    }
}

// View/edit functions
function editClaim(id) { showClaimForm(id); }
function editNssf(id) { showNssfForm(id); }
function editDiscipline(id) { showDisciplineForm(id); }
function editResource(id) { showResourceForm(id); }
function editTalent(id) { showTalentForm(id); }
function editPromotion(id) { showPromotionForm(id); }
function editRisk(id) { showRiskForm(id); }

function showViewModal(title, bodyHtml) {
    var existing = document.getElementById('viewDetailModal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'viewDetailModal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    var modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:8px;padding:30px;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,0.3);';

    modal.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:2px solid #2196F3;padding-bottom:10px;">' +
            '<h3 style="margin:0;color:#2196F3;">' + title + '</h3>' +
            '<button onclick="document.getElementById(\'viewDetailModal\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#666;">&times;</button>' +
        '</div>' +
        bodyHtml;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function detailRow(label, value) {
    var display = (value !== null && value !== undefined && value !== '') ? value : 'N/A';
    return '<tr><td style="padding:8px 12px;font-weight:bold;color:#555;white-space:nowrap;vertical-align:top;">' + label + '</td>' +
           '<td style="padding:8px 12px;">' + display + '</td></tr>';
}

function formatDate(val) {
    if (!val) return 'N/A';
    var d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(val) {
    if (!val && val !== 0) return 'N/A';
    return parseFloat(val).toLocaleString('en-US', { style: 'currency', currency: 'TZS' });
}

function statusBadge(status) {
    if (!status) return 'N/A';
    var colors = {
        'Pending': '#ff9800', 'Under Review': '#2196F3', 'Approved': '#4CAF50', 'Rejected': '#f44336',
        'Paid': '#4CAF50', 'Open': '#ff9800', 'Under Investigation': '#2196F3', 'Closed': '#9E9E9E',
        'Appealed': '#ff5722', 'In Progress': '#2196F3', 'Mitigated': '#4CAF50', 'Accepted': '#8BC34A',
        'Available': '#4CAF50', 'Assigned': '#2196F3', 'In Maintenance': '#ff9800', 'Retired': '#9E9E9E',
        'Lost': '#f44336', 'Filled': '#4CAF50', 'On Hold': '#ff9800', 'Implemented': '#4CAF50'
    };
    var color = colors[status] || '#757575';
    return '<span style="background:' + color + ';color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;">' + status + '</span>';
}

async function viewClaim(id) {
    try {
        var claim = await window.apiService.get('/claims-management/' + id);
        if (!claim) { customAlert('Claim not found', 'Error', 'error'); return; }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Claim #', claim.claim_number) +
            detailRow('Employee', claim.full_name || 'N/A') +
            detailRow('Type', claim.claim_type) +
            detailRow('Title', claim.title) +
            detailRow('Description', claim.description) +
            detailRow('Claim Date', formatDate(claim.claim_date)) +
            detailRow('Incident Date', formatDate(claim.incident_date)) +
            detailRow('Incident Location', claim.incident_location) +
            detailRow('Amount Claimed', formatCurrency(claim.amount_claimed)) +
            detailRow('Amount Approved', formatCurrency(claim.amount_approved)) +
            detailRow('Priority', claim.priority) +
            detailRow('Status', statusBadge(claim.status)) +
            detailRow('Witness Names', claim.witness_names) +
            detailRow('Approved By', claim.approved_by) +
            detailRow('Approved Date', formatDate(claim.approved_date)) +
            detailRow('Payment Date', formatDate(claim.payment_date)) +
            detailRow('Notes', claim.notes) +
            detailRow('Created', formatDate(claim.created_at)) +
            '</table>';
        showViewModal('Claim Details - ' + claim.claim_number, html);
    } catch (error) {
        console.error('Error viewing claim:', error);
        customAlert('Error loading claim details', 'Error', 'error');
    }
}

async function viewNssf(id) {
    try {
        var reg = await window.apiService.get('/nssf-registration/' + id);
        if (!reg) { customAlert('Registration not found', 'Error', 'error'); return; }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Reg #', reg.registration_number) +
            detailRow('Employee', reg.full_name || 'N/A') +
            detailRow('NSSF #', reg.nssf_number) +
            detailRow('Registration Date', formatDate(reg.registration_date)) +
            detailRow('Employer Contribution Rate', reg.employer_contribution_rate ? reg.employer_contribution_rate + '%' : 'N/A') +
            detailRow('Employee Contribution Rate', reg.employee_contribution_rate ? reg.employee_contribution_rate + '%' : 'N/A') +
            detailRow('Monthly Salary', formatCurrency(reg.monthly_salary)) +
            detailRow('Monthly Contribution', formatCurrency(reg.monthly_contribution)) +
            detailRow('Status', statusBadge(reg.status)) +
            detailRow('Last Contribution Date', formatDate(reg.last_contribution_date)) +
            detailRow('Total Contributions', formatCurrency(reg.total_contributions)) +
            detailRow('Notes', reg.notes) +
            detailRow('Created', formatDate(reg.created_at)) +
            '</table>';
        showViewModal('NSSF Registration - ' + reg.registration_number, html);
    } catch (error) {
        console.error('Error viewing NSSF registration:', error);
        customAlert('Error loading NSSF details', 'Error', 'error');
    }
}

async function viewDiscipline(id) {
    try {
        var dc = await window.apiService.get('/discipline-monitoring/' + id);
        if (!dc) { customAlert('Discipline case not found', 'Error', 'error'); return; }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Case #', dc.case_number) +
            detailRow('Employee', dc.full_name || 'N/A') +
            detailRow('Incident Type', dc.incident_type) +
            detailRow('Incident Date', formatDate(dc.incident_date)) +
            detailRow('Incident Location', dc.incident_location) +
            detailRow('Description', dc.description) +
            detailRow('Severity', dc.severity) +
            detailRow('Reported By', dc.reporter_name || 'N/A') +
            detailRow('Witnesses', dc.witnesses) +
            detailRow('Status', statusBadge(dc.status)) +
            detailRow('Disciplinary Action', dc.disciplinary_action) +
            detailRow('Action Date', formatDate(dc.action_date)) +
            detailRow('Action Notes', dc.action_notes) +
            detailRow('Appeal Status', dc.appeal_status) +
            detailRow('Appeal Date', formatDate(dc.appeal_date)) +
            detailRow('Appeal Notes', dc.appeal_notes) +
            detailRow('Resolved By', dc.resolver_name || 'N/A') +
            detailRow('Resolved Date', formatDate(dc.resolved_date)) +
            detailRow('Notes', dc.notes) +
            detailRow('Created', formatDate(dc.created_at)) +
            '</table>';
        showViewModal('Discipline Case - ' + dc.case_number, html);
    } catch (error) {
        console.error('Error viewing discipline case:', error);
        customAlert('Error loading discipline details', 'Error', 'error');
    }
}

async function viewResource(id) {
    try {
        var res = await window.apiService.get('/office-resources/' + id);
        if (!res) { customAlert('Resource not found', 'Error', 'error'); return; }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Resource Code', res.resource_code) +
            detailRow('Name', res.resource_name) +
            detailRow('Type', res.resource_type) +
            detailRow('Description', res.description) +
            detailRow('Serial Number', res.serial_number) +
            detailRow('Purchase Date', formatDate(res.purchase_date)) +
            detailRow('Purchase Cost', formatCurrency(res.purchase_cost)) +
            detailRow('Current Value', formatCurrency(res.current_value)) +
            detailRow('Condition', res.condition) +
            detailRow('Location', res.location) +
            detailRow('Department', res.department) +
            detailRow('Status', statusBadge(res.status)) +
            detailRow('Assigned To', res.full_name || 'Unassigned') +
            detailRow('Assigned Date', formatDate(res.assigned_date)) +
            detailRow('Expected Return', formatDate(res.expected_return_date)) +
            detailRow('Actual Return', formatDate(res.actual_return_date)) +
            detailRow('Return Condition', res.return_condition) +
            detailRow('Maintenance Notes', res.maintenance_notes) +
            detailRow('Created', formatDate(res.created_at)) +
            '</table>';
        showViewModal('Office Resource - ' + res.resource_code, html);
    } catch (error) {
        console.error('Error viewing resource:', error);
        customAlert('Error loading resource details', 'Error', 'error');
    }
}

async function viewTalent(id) {
    try {
        var req = await window.apiService.get('/talent-acquisition/' + id);
        if (!req) { customAlert('Requisition not found', 'Error', 'error'); return; }
        var salaryRange = 'N/A';
        if (req.salary_range_min || req.salary_range_max) {
            salaryRange = formatCurrency(req.salary_range_min) + ' - ' + formatCurrency(req.salary_range_max);
        }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Requisition #', req.requisition_number) +
            detailRow('Position Title', req.position_title) +
            detailRow('Department', req.department) +
            detailRow('Position Type', req.position_type) +
            detailRow('Experience Level', req.experience_level) +
            detailRow('Number of Positions', req.number_of_positions) +
            detailRow('Job Description', req.job_description) +
            detailRow('Requirements', req.requirements) +
            detailRow('Salary Range', salaryRange) +
            detailRow('Request Date', formatDate(req.request_date)) +
            detailRow('Requested By', req.requester_name || 'N/A') +
            detailRow('Priority', req.priority) +
            detailRow('Status', statusBadge(req.status)) +
            detailRow('Approved By', req.approver_name || 'N/A') +
            detailRow('Approval Date', formatDate(req.approval_date)) +
            detailRow('Hiring Manager', req.hiring_manager_name || 'N/A') +
            detailRow('Budget Code', req.budget_code) +
            detailRow('Expected Start Date', formatDate(req.expected_start_date)) +
            detailRow('Notes', req.notes) +
            detailRow('Created', formatDate(req.created_at)) +
            '</table>';
        showViewModal('Talent Requisition - ' + req.requisition_number, html);
    } catch (error) {
        console.error('Error viewing talent requisition:', error);
        customAlert('Error loading requisition details', 'Error', 'error');
    }
}

async function viewPromotion(id) {
    try {
        var promo = await window.apiService.get('/promotions/' + id);
        if (!promo) { customAlert('Promotion not found', 'Error', 'error'); return; }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Promotion #', promo.promotion_number) +
            detailRow('Employee', promo.full_name || 'N/A') +
            detailRow('Promotion Type', promo.promotion_type) +
            detailRow('Current Position', promo.current_position) +
            detailRow('Current Department', promo.current_department) +
            detailRow('Current Salary', formatCurrency(promo.current_salary)) +
            detailRow('New Position', promo.new_position) +
            detailRow('New Department', promo.new_department) +
            detailRow('New Salary', formatCurrency(promo.new_salary)) +
            detailRow('Effective Date', formatDate(promo.effective_date)) +
            detailRow('Reason', promo.reason) +
            detailRow('Performance Rating', promo.performance_rating) +
            detailRow('Recommended By', promo.recommender_name || 'N/A') +
            detailRow('Recommendation Date', formatDate(promo.recommendation_date)) +
            detailRow('Approved By', promo.approver_name || 'N/A') +
            detailRow('Approval Date', formatDate(promo.approval_date)) +
            detailRow('Status', statusBadge(promo.status)) +
            detailRow('Benefits Change', promo.benefits_change) +
            detailRow('Responsibilities Change', promo.responsibilities_change) +
            detailRow('Notes', promo.notes) +
            detailRow('Created', formatDate(promo.created_at)) +
            '</table>';
        showViewModal('Promotion Details - ' + promo.promotion_number, html);
    } catch (error) {
        console.error('Error viewing promotion:', error);
        customAlert('Error loading promotion details', 'Error', 'error');
    }
}

async function viewRisk(id) {
    try {
        var risk = await window.apiService.get('/risk-management/' + id);
        if (!risk) { customAlert('Risk not found', 'Error', 'error'); return; }
        var html = '<table style="width:100%;border-collapse:collapse;">' +
            detailRow('Risk #', risk.risk_number) +
            detailRow('Title', risk.risk_title) +
            detailRow('Category', risk.risk_category) +
            detailRow('Description', risk.risk_description) +
            detailRow('Probability', risk.probability) +
            detailRow('Impact', risk.impact) +
            detailRow('Project', risk.project_name || 'N/A') +
            detailRow('Department', risk.department) +
            detailRow('Identified By', risk.identified_by_name || 'N/A') +
            detailRow('Identified Date', formatDate(risk.identified_date)) +
            detailRow('Status', statusBadge(risk.status)) +
            detailRow('Mitigation Strategy', risk.mitigation_strategy) +
            detailRow('Contingency Plan', risk.contingency_plan) +
            detailRow('Owner', risk.owner_name || 'N/A') +
            detailRow('Review Date', formatDate(risk.review_date)) +
            detailRow('Likelihood After Mitigation', risk.likelihood_after_mitigation) +
            detailRow('Impact After Mitigation', risk.impact_after_mitigation) +
            detailRow('Cost of Mitigation', formatCurrency(risk.cost_of_mitigation)) +
            detailRow('Potential Loss', formatCurrency(risk.potential_loss)) +
            detailRow('Notes', risk.notes) +
            detailRow('Created', formatDate(risk.created_at)) +
            '</table>';
        showViewModal('Risk Details - ' + risk.risk_number, html);
    } catch (error) {
        console.error('Error viewing risk:', error);
        customAlert('Error loading risk details', 'Error', 'error');
    }
}