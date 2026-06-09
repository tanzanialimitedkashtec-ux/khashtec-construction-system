// Financial Strategies Frontend Logic

// Ensure Chart.js is loaded
if (!document.getElementById('chartjs-script')) {
    const script = document.createElement('script');
    script.id = 'chartjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    document.head.appendChild(script);
}
function showFinancialStrategiesForm() {
    showContent(`
        <div class="fs-card" style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 25px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0; color: #1a4a7a; font-size: 22px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 28px;">💰</span> Financial Strategies
                </h3>
                <button type="button" id="toggleFinancialStrategiesFormBtn" onclick="toggleFinancialStrategiesForm()" class="fs-btn fs-btn-primary">
                    <i class="fas fa-edit"></i> 📝 Open Financial Strategy Form
                </button>
            </div>
            
            <div class="fs-header-banner" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(30,60,114,0.2);">
                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Project Financial Planning & Feasibility</h4>
                <p style="margin: 0; font-size: 12px; opacity: 0.9; line-height: 1.5; max-width: 800px;">Evaluate project costs, define revenue strategies (Build-to-Sell or Build-to-Rent), calculate potential ROI and IRR, and outline financial targets to ensure profitability.</p>
            </div>
            
            <div id="financialStrategiesFormContainer" style="display: none;">
                <form id="financialStrategiesForm" onsubmit="return submitFinancialStrategiesForm(event)">
                                   <!-- Integration with Projects -->
                    <div class="fs-section">
                        <h5>🏗️ Project Integration</h5>
                        <div class="fs-grid">
                            <div class="fs-input-group">
                                <label>Select Project *</label>
                                <select id="fsProjectId" required onchange="updateProjectName()">
                                    <option value="">Loading projects...</option>
                                </select>
                                <input type="hidden" id="fsProjectName" value="">
                            </div>
                        </div>
                    </div>

                    <!-- Cost Estimation Fields -->
                    <div class="fs-section">
                        <h5>💵 Cost Estimations</h5>
                        <div class="fs-grid">
                            <div class="fs-input-group">
                                <label>Land Acquisition Cost (TZS) *</label>
                                <input type="number" id="fsLandCost" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Estimated Construction Cost (TZS) *</label>
                                <input type="number" id="fsConstructionCost" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Permits, Legal & Architecture Fees (TZS) *</label>
                                <input type="number" id="fsPermitsFees" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Contingency Reserve (%) *</label>
                                <input type="number" id="fsContingencyPercent" required min="0" max="100" step="0.1" value="10" oninput="calculateFinancials()">
                            </div>
                        </div>
                        <div class="fs-summary-box">
                            <strong>Total Estimated Project Cost: </strong>
                            <span id="fsTotalCostDisplay">TZS 0.00</span>
                        </div>
                    </div>

                    <!-- Funding / Capital -->
                    <div class="fs-section">
                        <h5>🏦 Funding Structure</h5>
                        <div class="fs-grid">
                            <div class="fs-input-group">
                                <label>Developer Equity / Own Capital (TZS) *</label>
                                <input type="number" id="fsDeveloperEquity" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Bank Loan / Debt Amount (TZS) *</label>
                                <input type="number" id="fsBankLoanAmount" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Annual Interest Rate (%) *</label>
                                <input type="number" id="fsInterestRate" required min="0" step="0.1" value="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Loan Repayment Period (Years) *</label>
                                <input type="number" id="fsRepaymentYears" required min="0" value="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Grace Period (Months) *</label>
                                <input type="number" id="fsGracePeriod" required min="0" value="0">
                            </div>
                        </div>
                    </div>

                    <!-- Revenue Strategies -->
                    <div class="fs-section">
                        <h5>📈 Revenue Strategies</h5>
                        <div class="fs-grid" style="margin-bottom: 15px;">
                            <div class="fs-input-group">
                                <label>Strategy Type *</label>
                                <select id="fsRevenueStrategy" required onchange="toggleRevenueFields(); calculateFinancials()">
                                    <option value="build_to_sell">Build to Sell</option>
                                    <option value="build_to_rent">Build to Rent</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="fs-grid" id="buildToSellFields">
                            <div class="fs-input-group">
                                <label>Targeting Selling Price per Unit (TZS)</label>
                                <input type="number" id="fsSellingPriceUnit" min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Number of Units</label>
                                <input type="number" id="fsTotalUnits" min="1" value="1" oninput="calculateFinancials()">
                            </div>
                        </div>

                        <div class="fs-grid" id="buildToRentFields" style="display: none;">
                            <div class="fs-input-group">
                                <label>Expected Monthly Rent per Unit (TZS)</label>
                                <input type="number" id="fsMonthlyRentUnit" min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Target Occupancy (%)</label>
                                <input type="number" id="fsTargetOccupancy" min="0" max="100" value="90" step="1" oninput="calculateFinancials()">
                            </div>
                            <div class="fs-input-group">
                                <label>Number of Units</label>
                                <input type="number" id="fsRentTotalUnits" min="1" value="1" oninput="calculateFinancials()">
                            </div>
                        </div>
                        
                        <div class="fs-summary-box">
                            <strong>Total Estimated Revenue: </strong>
                            <span id="fsTotalRevenueDisplay">TZS 0.00</span>
                        </div>
                    </div>

                    <!-- Financial Targets -->
                    <div class="fs-section">
                        <h5>🎯 Financial Targets & Auto-Calculations</h5>
                        <p style="font-size: 11px; color: #6c757d; margin-bottom: 15px; border-left: 3px solid #ffc107; padding-left: 10px;">These fields are automatically calculated based on your inputs, but you can adjust them to set explicit targets.</p>
                        <div class="fs-grid">
                            <div class="fs-input-group">
                                <label>Target Return on Investment (ROI) % *</label>
                                <input type="number" id="fsTargetRoi" required step="0.1">
                            </div>
                            <div class="fs-input-group">
                                <label>Target Internal Rate of Return (IRR) % *</label>
                                <input type="number" id="fsTargetIrr" required step="0.1">
                            </div>
                            <div class="fs-input-group">
                                <label>Minimum DSCR *</label>
                                <input type="number" id="fsMinimumDscr" required step="0.01">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="fs-btn fs-btn-success">💾 Save Financial Strategy</button>
                        <button type="button" onclick="document.getElementById('financialStrategiesForm').reset(); calculateFinancials();" class="fs-btn fs-btn-warning">🔄 Clear Form</button>
                        <button type="button" onclick="toggleFinancialStrategiesForm()" class="fs-btn fs-btn-danger">❌ Close Form</button>
                    </div>n>
                    </div>
                </form>
            </div>

            <!-- Dashboard Section -->
            <div id="financialStrategiesDashboard" style="margin-top: 25px; display: none;">
                <h4 style="margin: 0 0 15px 0;">📊 Financial Overview Dashboard</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1; min-width: 300px; background: white; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px;">
                        <h5 style="margin: 0 0 10px 0; color: #0b3d91; text-align: center; font-size: 12px;">Costs vs Funding Structure</h5>
                        <canvas id="financialStructureChart" style="max-height: 250px;"></canvas>
                    </div>
                    <div style="flex: 1; min-width: 300px; background: white; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px;">
                        <h5 style="margin: 0 0 10px 0; color: #0b3d91; text-align: center; font-size: 12px;">Profitability Targets (ROI & IRR)</h5>
                        <canvas id="profitabilityTargetsChart" style="max-height: 250px;"></canvas>
                    </div>
                </div>
            </div>

            <div style="margin-top: 35px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; gap: 8px; flex-wrap: wrap;">
                    <h4 style="margin: 0; color: #1a4a7a;">📋 Recorded Financial Strategies</h4>
                    <button type="button" class="fs-btn fs-btn-primary" onclick="loadFinancialStrategies()">🔄 Refresh Data</button>
                </div>
                <div class="fs-table-container">
                    <table id="financialStrategiesTable" class="fs-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Project Name</th>
                                <th>Land Cost (TZS)</th>
                                <th>Construction Cost (TZS)</th>
                                <th>Permits & Fees (TZS)</th>
                                <th>Contingency (%)</th>
                                <th>Total Cost (TZS)</th>
                                <th>Developer Equity (TZS)</th>
                                <th>Bank Loan (TZS)</th>
                                <th>Interest Rate (%)</th>
                                <th>Repayment (Yrs)</th>
                                <th>Grace Period (Mo)</th>
                                <th>Strategy</th>
                                <th>Sell Price/Unit (TZS)</th>
                                <th>Rent/Unit/Mo (TZS)</th>
                                <th>Occupancy (%)</th>
                                <th>Target ROI (%)</th>
                                <th>Target IRR (%)</th>
                                <th>Min DSCR</th>
                                <th>Date Created</th>
                            </tr>
                        </thead>
                        <tbody id="financialStrategiesTbody">
                            <tr>
                                <td colspan="20" style="text-align: center; padding: 20px;">Loading records...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <style>
            .fs-section {
                background: #fdfdfd;
                border: 1px solid #eaeaea;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                transition: box-shadow 0.3s ease;
            }
            .fs-section:hover {
                box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            }
            .fs-section h5 {
                color: #2a5298;
                margin-bottom: 15px;
                font-size: 14px;
                border-bottom: 2px solid #e1e8f0;
                padding-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .fs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            .fs-input-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .fs-input-group label {
                font-size: 11px;
                font-weight: 600;
                color: #444;
            }
            .fs-input-group input, .fs-input-group select {
                padding: 10px 12px;
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 13px;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .fs-input-group input:focus, .fs-input-group select:focus {
                border-color: #2a5298;
                box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
                outline: none;
            }
            .fs-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .fs-btn-primary { background: #007bff; color: white; }
            .fs-btn-primary:hover { background: #0056b3; transform: translateY(-1px); }
            .fs-btn-success { background: #28a745; color: white; }
            .fs-btn-success:hover { background: #218838; transform: translateY(-1px); }
            .fs-btn-warning { background: #ffc107; color: #212529; }
            .fs-btn-warning:hover { background: #e0a800; transform: translateY(-1px); }
            .fs-btn-danger { background: #dc3545; color: white; }
            .fs-btn-danger:hover { background: #c82333; transform: translateY(-1px); }
            
            .fs-summary-box {
                background: #f0f4f8;
                padding: 12px 15px;
                border-radius: 6px;
                margin-top: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-left: 4px solid #2a5298;
            }
            .fs-summary-box strong { color: #333; font-size: 13px; }
            .fs-summary-box span { color: #1e3c72; font-weight: 700; font-size: 15px; }

            .fs-table-container {
                overflow: auto;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                max-height: 500px;
            }
            .fs-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                text-align: left;
                font-size: 11px;
                white-space: nowrap;
            }
            .fs-table th {
                padding: 12px 15px;
                background: #f8f9fa;
                color: #333;
                font-weight: 600;
                border-bottom: 2px solid #dee2e6;
                position: sticky;
                top: 0;
                z-index: 10;
                box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
            }
            .fs-table td {
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
            }
            .fs-table tbody tr:hover td {
                background: #f1f7fd;
            }
        </style>
    `);

    loadProjectsForFinancials();
    setTimeout(loadFinancialStrategies, 100);
}

function toggleFinancialStrategiesForm() {
    const formContainer = document.getElementById('financialStrategiesFormContainer');
    const toggleBtn = document.getElementById('toggleFinancialStrategiesFormBtn');

    if (formContainer.style.display === 'none' || !formContainer.classList.contains('show')) {
        formContainer.style.display = 'block';
        formContainer.classList.add('show');
        toggleBtn.innerHTML = '❌ Close Financial Strategy Form';
        toggleBtn.style.background = '#dc3545';
    } else {
        formContainer.classList.remove('show');
        toggleBtn.innerHTML = '📝 Open Financial Strategy Form';
        toggleBtn.style.background = '#007bff';
        setTimeout(() => { formContainer.style.display = 'none'; }, 400);
    }
}

function toggleRevenueFields() {
    const strategy = document.getElementById('fsRevenueStrategy').value;
    if (strategy === 'build_to_sell') {
        document.getElementById('buildToSellFields').style.display = 'flex';
        document.getElementById('buildToRentFields').style.display = 'none';
    } else {
        document.getElementById('buildToSellFields').style.display = 'none';
        document.getElementById('buildToRentFields').style.display = 'flex';
    }
}

function calculateFinancials() {
    // Costs
    const landCost = parseFloat(document.getElementById('fsLandCost').value) || 0;
    const constructionCost = parseFloat(document.getElementById('fsConstructionCost').value) || 0;
    const permitsFees = parseFloat(document.getElementById('fsPermitsFees').value) || 0;
    const contingencyPercent = parseFloat(document.getElementById('fsContingencyPercent').value) || 0;
    
    const baseCost = landCost + constructionCost + permitsFees;
    const contingencyAmount = baseCost * (contingencyPercent / 100);
    const totalCost = baseCost + contingencyAmount;
    
    document.getElementById('fsTotalCostDisplay').innerText = `TZS ${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Funding / Debt
    const loanAmount = parseFloat(document.getElementById('fsBankLoanAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('fsInterestRate').value) || 0;
    const annualInterest = loanAmount * (interestRate / 100);

    // Revenue
    const strategy = document.getElementById('fsRevenueStrategy').value;
    let totalRevenue = 0;
    let netProfit = 0;
    let annualNOI = 0; // Net Operating Income

    if (strategy === 'build_to_sell') {
        const sellPrice = parseFloat(document.getElementById('fsSellingPriceUnit').value) || 0;
        const units = parseFloat(document.getElementById('fsTotalUnits').value) || 1;
        totalRevenue = sellPrice * units;
        
        // Simple ROI for build to sell
        netProfit = totalRevenue - totalCost;
        const estimatedRoi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
        document.getElementById('fsTargetRoi').value = estimatedRoi.toFixed(2);
        
        // DSCR is less relevant for direct sell, set default 0 if not set
    } else {
        const rentPrice = parseFloat(document.getElementById('fsMonthlyRentUnit').value) || 0;
        const rentUnits = parseFloat(document.getElementById('fsRentTotalUnits').value) || 1;
        const occupancy = parseFloat(document.getElementById('fsTargetOccupancy').value) || 0;
        
        // Annual Revenue
        const monthlyRevenue = rentPrice * rentUnits * (occupancy / 100);
        const annualRevenue = monthlyRevenue * 12;
        totalRevenue = annualRevenue; // Show annual revenue as total revenue proxy
        
        // Very basic NOI estimate (assuming 30% operating expenses)
        annualNOI = annualRevenue * 0.70;
        
        // Cash on Cash Return or Yield as ROI proxy
        const estimatedYield = totalCost > 0 ? (annualNOI / totalCost) * 100 : 0;
        document.getElementById('fsTargetRoi').value = estimatedYield.toFixed(2);
        
        // DSCR = NOI / Annual Debt Service (Interest + Principal estimate)
        // This is a highly simplified proxy DSCR calculation.
        const loanYears = parseFloat(document.getElementById('fsRepaymentYears').value) || 1;
        const annualPrincipal = loanAmount > 0 && loanYears > 0 ? loanAmount / loanYears : 0;
        const annualDebtService = annualInterest + annualPrincipal;
        
        if (annualDebtService > 0) {
            const dscr = annualNOI / annualDebtService;
            document.getElementById('fsMinimumDscr').value = dscr.toFixed(2);
        } else {
            document.getElementById('fsMinimumDscr').value = "0.00";
        }
    }
    
    document.getElementById('fsTotalRevenueDisplay').innerText = `TZS ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` + (strategy === 'build_to_rent' ? ' (Annual)' : '');
}

async function loadProjectsForFinancials() {
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        const select = document.getElementById('fsProjectId');
        
        const projects = Array.isArray(data) ? data : (data.data || data.projects || []);
        
        if (!projects || !projects.length) {
            select.innerHTML = '<option value="">No projects available</option>';
            return;
        }

        select.innerHTML = '<option value="">Select a Project...</option>';
        projects.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.project_name || p.name || 'Project ' + p.id}</option>`;
        });
    } catch (e) {
        console.error('Error loading projects:', e);
        document.getElementById('fsProjectId').innerHTML = '<option value="">Failed to load projects</option>';
    }
}

function updateProjectName() {
    const select = document.getElementById('fsProjectId');
    if (select.selectedIndex > 0) {
        document.getElementById('fsProjectName').value = select.options[select.selectedIndex].text;
    } else {
        document.getElementById('fsProjectName').value = '';
    }
}

async function submitFinancialStrategiesForm(event) {
    event.preventDefault();
    
    const data = {
        project_id: document.getElementById('fsProjectId').value,
        project_name: document.getElementById('fsProjectName').value,
        land_acquisition_cost: document.getElementById('fsLandCost').value,
        estimated_construction_cost: document.getElementById('fsConstructionCost').value,
        permits_fees: document.getElementById('fsPermitsFees').value,
        contingency_reserve_percent: document.getElementById('fsContingencyPercent').value,
        developer_equity: document.getElementById('fsDeveloperEquity').value,
        bank_loan_amount: document.getElementById('fsBankLoanAmount').value,
        annual_interest_rate: document.getElementById('fsInterestRate').value,
        loan_repayment_period_years: document.getElementById('fsRepaymentYears').value,
        grace_period_months: document.getElementById('fsGracePeriod').value,
        revenue_strategy: document.getElementById('fsRevenueStrategy').value,
        target_selling_price_per_unit: document.getElementById('fsSellingPriceUnit').value || 0,
        expected_monthly_rent_per_unit: document.getElementById('fsMonthlyRentUnit').value || 0,
        target_occupancy_percent: document.getElementById('fsTargetOccupancy').value || 0,
        target_roi_percent: document.getElementById('fsTargetRoi').value,
        target_irr_percent: document.getElementById('fsTargetIrr').value,
        minimum_dscr: document.getElementById('fsMinimumDscr').value
    };

    try {
        const response = await fetch('/api/financial-strategies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KashTecAPI.getAuthToken()}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            customAlert('Financial Strategy saved successfully!', 'Success', 'success');
            document.getElementById('financialStrategiesForm').reset();
            calculateFinancials();
            loadFinancialStrategies();
        } else {
            const err = await response.json();
            customAlert(`Failed to save: ${err.error || 'Unknown error'}`, 'Error', 'error');
        }
    } catch (e) {
        console.error('Submit error:', e);
        customAlert('Network error while saving.', 'Error', 'error');
    }
    
    return false;
}

async function loadFinancialStrategies() {
    try {
        const tbody = document.getElementById('financialStrategiesTbody');
        tbody.innerHTML = '<tr><td colspan="20" style="text-align: center; padding: 10px;">Loading records...</td></tr>';
        
        const response = await fetch('/api/financial-strategies', {
            headers: {
                'Authorization': `Bearer ${KashTecAPI.getAuthToken()}`
            }
        });
        
        const resData = await response.json();
        
        if (!response.ok || !resData.success) {
            tbody.innerHTML = `<tr><td colspan="20" style="text-align: center; padding: 10px; color: red;">Failed to load records.</td></tr>`;
            return;
        }

        const records = resData.data;
        if (!records || records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="20" style="text-align: center; padding: 10px;">No financial strategies found.</td></tr>';
            return;
        }

        const fmt = (val) => {
            const num = parseFloat(val) || 0;
            return num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        };

        let html = '';
        records.forEach((r, idx) => {
            const land = parseFloat(r.land_acquisition_cost) || 0;
            const construction = parseFloat(r.estimated_construction_cost) || 0;
            const fees = parseFloat(r.permits_fees) || 0;
            const contPercent = parseFloat(r.contingency_reserve_percent) || 0;
            const baseCost = land + construction + fees;
            const totalCost = baseCost + (baseCost * (contPercent / 100));

            const rowBg = idx % 2 === 0 ? '' : 'background: #f8f9fa;';
            const td = '';

            html += `<tr style="${rowBg}">
                <td style="${td} font-weight: bold;">${idx + 1}</td>
                <td style="${td} font-weight: 600; color: #1e3c72;">${r.project_name || ('Project ' + r.project_id)}</td>
                <td style="${td}">${fmt(r.land_acquisition_cost)}</td>
                <td style="${td}">${fmt(r.estimated_construction_cost)}</td>
                <td style="${td}">${fmt(r.permits_fees)}</td>
                <td style="${td}">${fmt(r.contingency_reserve_percent)}%</td>
                <td style="${td} font-weight: 700; color: #d9534f;">${fmt(totalCost)}</td>
                <td style="${td}">${fmt(r.developer_equity)}</td>
                <td style="${td}">${fmt(r.bank_loan_amount)}</td>
                <td style="${td}">${fmt(r.annual_interest_rate)}%</td>
                <td style="${td}">${r.loan_repayment_period_years || 0}</td>
                <td style="${td}">${r.grace_period_months || 0}</td>
                <td style="${td}"><span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: ${r.revenue_strategy === 'build_to_sell' ? '#d4edda; color: #155724' : '#cce5ff; color: #004085'};">${r.revenue_strategy === 'build_to_sell' ? 'Build to Sell' : 'Build to Rent'}</span></td>
                <td style="${td}">${fmt(r.target_selling_price_per_unit)}</td>
                <td style="${td}">${fmt(r.expected_monthly_rent_per_unit)}</td>
                <td style="${td}">${fmt(r.target_occupancy_percent)}%</td>
                <td style="${td}">${r.target_roi_percent}%</td>
                <td style="${td}">${r.target_irr_percent}%</td>
                <td style="${td}">${r.minimum_dscr}</td>
                <td style="${td}">${new Date(r.created_at).toLocaleDateString()}</td>
            </tr>`;
        });
        
        tbody.innerHTML = html;
        
        // Update charts with the fetched data
        const renderCharts = () => {
            try {
                if (typeof Chart !== 'undefined') updateFinancialCharts(records);
            } catch(err) {
                console.error('Error rendering charts:', err);
            }
        };

        if (typeof Chart !== 'undefined') {
            renderCharts();
        } else {
            // Wait for Chart.js to finish loading
            const chartScript = document.getElementById('chartjs-script');
            if (chartScript) {
                chartScript.addEventListener('load', renderCharts);
            } else {
                // Fallback polling if script wasn't found by ID for some reason
                let attempts = 0;
                const interval = setInterval(() => {
                    if (typeof Chart !== 'undefined') {
                        clearInterval(interval);
                        renderCharts();
                    }
                    if (++attempts > 20) clearInterval(interval); // give up after 2 seconds
                }, 100);
            }
        }
        
    } catch (e) {
        console.error('Error loading strategies:', e);
        document.getElementById('financialStrategiesTbody').innerHTML = '<tr><td colspan="20" style="text-align: center; padding: 10px; color: red;">Error connecting to server.</td></tr>';
    }
}

// Global chart instances to destroy them before re-rendering
let fsStructureChartInstance = null;
let fsProfitabilityChartInstance = null;

function updateFinancialCharts(records) {
    const dashboard = document.getElementById('financialStrategiesDashboard');
    
    if (!records || records.length === 0) {
        dashboard.style.display = 'none';
        return;
    }
    
    dashboard.style.display = 'block';

    const labels = [];
    const totalCosts = [];
    const equity = [];
    const loans = [];
    
    const roi = [];
    const irr = [];

    // Reverse records to show oldest to newest left-to-right
    const chartData = [...records].reverse();

    chartData.forEach(r => {
        labels.push(r.project_name || ('Project ' + r.project_id));
        
        const land = parseFloat(r.land_acquisition_cost) || 0;
        const construction = parseFloat(r.estimated_construction_cost) || 0;
        const fees = parseFloat(r.permits_fees) || 0;
        const contPercent = parseFloat(r.contingency_reserve_percent) || 0;
        const baseCost = land + construction + fees;
        const total = baseCost + (baseCost * (contPercent / 100));
        
        totalCosts.push(total);
        equity.push(parseFloat(r.developer_equity) || 0);
        loans.push(parseFloat(r.bank_loan_amount) || 0);
        
        roi.push(parseFloat(r.target_roi_percent) || 0);
        irr.push(parseFloat(r.target_irr_percent) || 0);
    });

    // Destroy existing charts if any
    if (fsStructureChartInstance) fsStructureChartInstance.destroy();
    if (fsProfitabilityChartInstance) fsProfitabilityChartInstance.destroy();

    // 1. Structure Chart (Costs vs Funding)
    const ctxStructure = document.getElementById('financialStructureChart').getContext('2d');
    fsStructureChartInstance = new Chart(ctxStructure, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Est. Cost (TZS)',
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgb(220, 53, 69)',
                    borderWidth: 1,
                    data: totalCosts
                },
                {
                    label: 'Developer Equity (TZS)',
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgb(40, 167, 69)',
                    borderWidth: 1,
                    data: equity
                },
                {
                    label: 'Bank Loan (TZS)',
                    backgroundColor: 'rgba(0, 123, 255, 0.7)',
                    borderColor: 'rgb(0, 123, 255)',
                    borderWidth: 1,
                    data: loans
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                            return value;
                        }
                    }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
            }
        }
    });

    // 2. Profitability Targets Chart (ROI & IRR)
    const ctxProfitability = document.getElementById('profitabilityTargetsChart').getContext('2d');
    fsProfitabilityChartInstance = new Chart(ctxProfitability, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Target ROI (%)',
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgb(255, 193, 7)',
                    borderWidth: 1,
                    data: roi
                },
                {
                    label: 'Target IRR (%)',
                    backgroundColor: 'rgba(23, 162, 184, 0.7)',
                    borderColor: 'rgb(23, 162, 184)',
                    borderWidth: 1,
                    data: irr
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return value + '%'; }
                    }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
            }
        }
    });
}
