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
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>💰 Financial Strategies</h3>
                <button type="button" id="toggleFinancialStrategiesFormBtn" onclick="toggleFinancialStrategiesForm()" class="action" style="background: #007bff;">
                    📝 Open Financial Strategy Form
                </button>
            </div>
            
            <div class="form-header" style="background: linear-gradient(135deg, #0b3d91 0%, #1a4a7a 100%); color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px;">Project Financial Planning & Feasibility</h4>
                <p style="margin: 0; font-size: 9px; opacity: 0.9; line-height: 1.4;">Evaluate project costs, define revenue strategies (Build-to-Sell or Build-to-Rent), calculate potential ROI and IRR, and outline financial targets to ensure profitability.</p>
            </div>
            
            <div id="financialStrategiesFormContainer" style="display: none;">
                <form id="financialStrategiesForm" onsubmit="return submitFinancialStrategiesForm(event)">
                    
                    <!-- Integration with Projects -->
                    <div class="form-section">
                        <h5>🏗️ Project Integration</h5>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Select Project *</label>
                                <select id="fsProjectId" required onchange="updateProjectName()">
                                    <option value="">Loading projects...</option>
                                </select>
                                <input type="hidden" id="fsProjectName" value="">
                            </div>
                        </div>
                    </div>

                    <!-- Cost Estimation Fields -->
                    <div class="form-section">
                        <h5>💵 Cost Estimations</h5>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Land Acquisition Cost (TZS) *</label>
                                <input type="number" id="fsLandCost" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Estimated Construction Cost (TZS) *</label>
                                <input type="number" id="fsConstructionCost" required min="0" oninput="calculateFinancials()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Permits, Legal & Architecture Fees (TZS) *</label>
                                <input type="number" id="fsPermitsFees" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Contingency Reserve (%) *</label>
                                <input type="number" id="fsContingencyPercent" required min="0" max="100" step="0.1" value="10" oninput="calculateFinancials()">
                            </div>
                        </div>
                        <div class="form-group" style="background: #e9ecef; padding: 10px; border-radius: 5px;">
                            <strong>Total Estimated Project Cost: </strong>
                            <span id="fsTotalCostDisplay">TZS 0</span>
                        </div>
                    </div>

                    <!-- Funding / Capital -->
                    <div class="form-section">
                        <h5>🏦 Funding Structure</h5>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Developer Equity / Own Capital (TZS) *</label>
                                <input type="number" id="fsDeveloperEquity" required min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Bank Loan / Debt Amount (TZS) *</label>
                                <input type="number" id="fsBankLoanAmount" required min="0" oninput="calculateFinancials()">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Annual Interest Rate (%) *</label>
                                <input type="number" id="fsInterestRate" required min="0" step="0.1" value="0" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Loan Repayment Period (Years) *</label>
                                <input type="number" id="fsRepaymentYears" required min="0" value="0" oninput="calculateFinancials()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Grace Period (Months) *</label>
                            <input type="number" id="fsGracePeriod" required min="0" value="0">
                        </div>
                    </div>

                    <!-- Revenue Strategies -->
                    <div class="form-section">
                        <h5>📈 Revenue Strategies</h5>
                        <div class="form-group">
                            <label>Strategy Type *</label>
                            <select id="fsRevenueStrategy" required onchange="toggleRevenueFields(); calculateFinancials()">
                                <option value="build_to_sell">Build to Sell</option>
                                <option value="build_to_rent">Build to Rent</option>
                            </select>
                        </div>
                        
                        <div class="form-row" id="buildToSellFields">
                            <div class="form-group">
                                <label>Targeting Selling Price per Unit (TZS)</label>
                                <input type="number" id="fsSellingPriceUnit" min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Number of Units</label>
                                <input type="number" id="fsTotalUnits" min="1" value="1" oninput="calculateFinancials()">
                            </div>
                        </div>

                        <div class="form-row" id="buildToRentFields" style="display: none;">
                            <div class="form-group">
                                <label>Expected Monthly Rent per Unit (TZS)</label>
                                <input type="number" id="fsMonthlyRentUnit" min="0" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Target Occupancy (%)</label>
                                <input type="number" id="fsTargetOccupancy" min="0" max="100" value="90" step="1" oninput="calculateFinancials()">
                            </div>
                            <div class="form-group">
                                <label>Number of Units</label>
                                <input type="number" id="fsRentTotalUnits" min="1" value="1" oninput="calculateFinancials()">
                            </div>
                        </div>
                        
                        <div class="form-group" style="background: #e9ecef; padding: 10px; border-radius: 5px;">
                            <strong>Total Estimated Revenue: </strong>
                            <span id="fsTotalRevenueDisplay">TZS 0</span>
                        </div>
                    </div>

                    <!-- Financial Targets -->
                    <div class="form-section">
                        <h5>🎯 Financial Targets & Auto-Calculations</h5>
                        <p style="font-size: 10px; color: #666; margin-bottom: 15px;">These fields are automatically calculated based on your inputs, but you can adjust them to set explicit targets.</p>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Target Return on Investment (ROI) % *</label>
                                <input type="number" id="fsTargetRoi" required step="0.1">
                            </div>
                            <div class="form-group">
                                <label>Target Internal Rate of Return (IRR) % *</label>
                                <input type="number" id="fsTargetIrr" required step="0.1">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Minimum Debt Service Coverage Ratio (DSCR) *</label>
                            <input type="number" id="fsMinimumDscr" required step="0.01">
                        </div>
                    </div>

                    <div class="form-row">
                        <button type="submit" class="action" style="background: #28a745;">💾 Save Financial Strategy</button>
                        <button type="button" onclick="document.getElementById('financialStrategiesForm').reset(); calculateFinancials();" class="action" style="background: #ffc107;">🔄 Clear Form</button>
                        <button type="button" onclick="toggleFinancialStrategiesForm()" class="action" style="background: #dc3545; margin-left: 10px;">Close Form</button>
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

            <div style="margin-top: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;">
                    <h4 style="margin: 0;">📋 Recorded Financial Strategies</h4>
                    <button type="button" class="action" style="background: #0b3d91;" onclick="loadFinancialStrategies()">🔄 Refresh Data</button>
                </div>
                <div style="overflow: auto; border: 1px solid #dee2e6; border-radius: 5px;">
                    <table id="financialStrategiesTable" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Project Name</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Total Cost (Est)</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Strategy</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Target ROI (%)</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Target IRR (%)</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Min DSCR</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6;">Date Created</th>
                            </tr>
                        </thead>
                        <tbody id="financialStrategiesTbody">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 10px;">Loading records...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <style>
            .form-section {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                margin: 15px 0;
            }
            
            .form-section h5 {
                color: #0b3d91;
                margin-bottom: 10px;
                font-size: 11px;
                border-bottom: 2px solid #0b3d91;
                padding-bottom: 5px;
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 10px;">Loading records...</td></tr>';
        
        const response = await fetch('/api/financial-strategies', {
            headers: {
                'Authorization': `Bearer ${KashTecAPI.getAuthToken()}`
            }
        });
        
        const resData = await response.json();
        
        if (!response.ok || !resData.success) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 10px; color: red;">Failed to load records.</td></tr>`;
            return;
        }

        const records = resData.data;
        if (!records || records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 10px;">No financial strategies found.</td></tr>';
            return;
        }

        let html = '';
        records.forEach(r => {
            const land = parseFloat(r.land_acquisition_cost) || 0;
            const construction = parseFloat(r.estimated_construction_cost) || 0;
            const fees = parseFloat(r.permits_fees) || 0;
            const contPercent = parseFloat(r.contingency_reserve_percent) || 0;
            
            const baseCost = land + construction + fees;
            const totalCost = baseCost + (baseCost * (contPercent/100));
            
            html += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${r.project_name || ('Project ' + r.project_id)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">TZS ${totalCost.toLocaleString()}</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${r.revenue_strategy === 'build_to_sell' ? 'Build to Sell' : 'Build to Rent'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${r.target_roi_percent}%</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${r.target_irr_percent}%</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${r.minimum_dscr}</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${new Date(r.created_at).toLocaleDateString()}</td>
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
        document.getElementById('financialStrategiesTbody').innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 10px; color: red;">Error connecting to server.</td></tr>';
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
