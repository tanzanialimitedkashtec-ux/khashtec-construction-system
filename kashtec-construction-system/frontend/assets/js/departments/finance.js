// ===== ENHANCED FINANCE DEPARTMENT =====
class FinanceDepartment {
    constructor() {
        this.currentReports = [];
        this.expenseData = [];
        this.budgetData = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Finance Department initialized with enhanced features');
    }

    // Enhanced Expense Management
    async submitExpenseReport(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const expenseData = {
            employeeId: formData.get('employeeId'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            description: formData.get('description'),
            date: formData.get('date'),
            receipt: formData.get('receipt'),
            status: 'pending'
        };

        try {
            const result = await window.ApiService.createExpense(expenseData);
            if (result.success) {
                NotificationManager.show('Expense report submitted successfully!', 'success', 'Expense Submitted');
                event.target.reset();
                this.loadExpenseReports();
            }
        } catch (error) {
            NotificationManager.show(error.message, 'error', 'Submission Error');
        }
    }

    // Advanced Financial Reporting
    financialReporting() {
        UIController.showContent(`
            <div class="card">
                <h3>Financial Reporting Dashboard</h3>
                <p><strong>Financial Authority:</strong> Generate comprehensive financial reports and analytics</p>
                
                <div class="reporting-controls">
                    <div class="date-range-selector">
                        <label>Date Range:</label>
                        <input type="date" id="reportStartDate" value="${this.getStartDate()}">
                        <input type="date" id="reportEndDate" value="${this.getEndDate()}">
                        <button class="action" onclick="FinanceDepartment.updateReports()">Update Reports</button>
                    </div>
                    
                    <div class="report-filters">
                        <select id="departmentFilter">
                            <option value="">All Departments</option>
                            <option value="projects">Projects</option>
                            <option value="hr">Human Resources</option>
                            <option value="hse">Health & Safety</option>
                            <option value="realestate">Real Estate</option>
                            <option value="admin">Administration</option>
                        </select>
                        
                        <select id="reportType">
                            <option value="summary">Summary Report</option>
                            <option value="detailed">Detailed Report</option>
                            <option value="comparative">Comparative Analysis</option>
                        </select>
                    </div>
                </div>
                
                <div class="report-tabs">
                    <button class="tab-btn active" onclick="FinanceDepartment.showFinanceReportTab('income')">Income Statement</button>
                    <button class="tab-btn" onclick="FinanceDepartment.showFinanceReportTab('balance')">Balance Sheet</button>
                    <button class="tab-btn" onclick="FinanceDepartment.showFinanceReportTab('cashflow')">Cash Flow</button>
                    <button class="tab-btn" onclick="FinanceDepartment.showFinanceReportTab('budget')">Budget vs Actual</button>
                    <button class="tab-btn" onclick="FinanceDepartment.showFinanceReportTab('expenses')">Expense Analysis</button>
                    <button class="tab-btn" onclick="FinanceDepartment.showFinanceReportTab('projections')">Projections</button>
                </div>
                
                <div id="incomeStatement" class="tab-content active">
                    ${this.generateIncomeStatement()}
                </div>
                
                <div id="balanceSheet" class="tab-content">
                    ${this.generateBalanceSheet()}
                </div>
                
                <div id="cashFlow" class="tab-content">
                    ${this.generateCashFlowStatement()}
                </div>
                
                <div id="budgetVsActual" class="tab-content">
                    ${this.generateBudgetComparison()}
                </div>
                
                <div id="expenseAnalysis" class="tab-content">
                    ${this.generateExpenseAnalysis()}
                </div>
                
                <div id="projections" class="tab-content">
                    ${this.generateFinancialProjections()}
                </div>
                
                <div class="report-actions">
                    <button class="action" onclick="FinanceDepartment.exportReport()">Export Report</button>
                    <button class="action" onclick="FinanceDepartment.printReport()">Print Report</button>
                    <button class="action" onclick="FinanceDepartment.scheduleReport()">Schedule Report</button>
                    <button class="action" onclick="FinanceDepartment.shareReport()">Share Report</button>
                </div>
            </div>
        `);
    }

    generateIncomeStatement() {
        return `
            <h4>Income Statement - ${this.getCurrentQuarter()} 2026</h4>
            <div class="income-statement">
                <div class="statement-section">
                    <h5>Revenue</h5>
                    <div class="revenue-items">
                        <div class="statement-item">
                            <span>Project Revenue</span>
                            <span class="amount positive">$2,450,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Real Estate Sales</span>
                            <span class="amount positive">$1,800,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Service Fees</span>
                            <span class="amount positive">$320,000</span>
                        </div>
                        <div class="statement-item total">
                            <span><strong>Total Revenue</strong></span>
                            <span class="amount positive"><strong>$4,570,000</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="statement-section">
                    <h5>Operating Expenses</h5>
                    <div class="expense-items">
                        <div class="statement-item">
                            <span>Salaries & Wages</span>
                            <span class="amount negative">-$1,200,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Materials & Supplies</span>
                            <span class="amount negative">-$850,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Equipment Rental</span>
                            <span class="amount negative">-$320,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Utilities</span>
                            <span class="amount negative">-$85,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Marketing</span>
                            <span class="amount negative">-$125,000</span>
                        </div>
                        <div class="statement-item total">
                            <span><strong>Total Operating Expenses</strong></span>
                            <span class="amount negative"><strong>-$2,580,000</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="statement-section">
                    <h5>Operating Income</h5>
                    <div class="statement-item total">
                        <span><strong>Gross Operating Income</strong></span>
                        <span class="amount positive"><strong>$1,990,000</strong></span>
                    </div>
                </div>
                
                <div class="statement-section">
                    <h5>Other Income/Expenses</h5>
                    <div class="statement-item">
                        <span>Interest Income</span>
                        <span class="amount positive">$45,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Interest Expense</span>
                        <span class="amount negative">-$78,000</span>
                    </div>
                </div>
                
                <div class="statement-section">
                    <h5>Net Income</h5>
                    <div class="statement-item total highlight">
                        <span><strong>Net Income</strong></span>
                        <span class="amount positive"><strong>$1,957,000</strong></span>
                    </div>
                </div>
            </div>
        `;
    }

    generateBalanceSheet() {
        return `
            <h4>Balance Sheet - ${this.getCurrentDate()}</h4>
            <div class="balance-sheet">
                <div class="balance-section">
                    <h5>Assets</h5>
                    <div class="asset-categories">
                        <h6>Current Assets</h6>
                        <div class="statement-item">
                            <span>Cash & Cash Equivalents</span>
                            <span class="amount">$1,250,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Accounts Receivable</span>
                            <span class="amount">$680,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Inventory</span>
                            <span class="amount">$420,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Prepaid Expenses</span>
                            <span class="amount">$85,000</span>
                        </div>
                        
                        <h6>Fixed Assets</h6>
                        <div class="statement-item">
                            <span>Equipment</span>
                            <span class="amount">$3,200,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Buildings</span>
                            <span class="amount">$5,800,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Land</span>
                            <span class="amount">$2,100,000</span>
                        </div>
                        
                        <div class="statement-item total">
                            <span><strong>Total Assets</strong></span>
                            <span class="amount"><strong>$13,535,000</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="balance-section">
                    <h5>Liabilities</h5>
                    <div class="liability-categories">
                        <h6>Current Liabilities</h6>
                        <div class="statement-item">
                            <span>Accounts Payable</span>
                            <span class="amount">-$420,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Short-term Loans</span>
                            <span class="amount">-$250,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Accrued Expenses</span>
                            <span class="amount">-$125,000</span>
                        </div>
                        
                        <h6>Long-term Liabilities</h6>
                        <div class="statement-item">
                            <span>Bank Loans</span>
                            <span class="amount">-$1,800,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Mortgage</span>
                            <span class="amount">-$2,400,000</span>
                        </div>
                        
                        <div class="statement-item total">
                            <span><strong>Total Liabilities</strong></span>
                            <span class="amount"><strong>-$4,995,000</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="balance-section">
                    <h5>Equity</h5>
                    <div class="equity-categories">
                        <div class="statement-item">
                            <span>Share Capital</span>
                            <span class="amount">$6,000,000</span>
                        </div>
                        <div class="statement-item">
                            <span>Retained Earnings</span>
                            <span class="amount">$2,540,000</span>
                        </div>
                        
                        <div class="statement-item total">
                            <span><strong>Total Equity</strong></span>
                            <span class="amount"><strong>$8,540,000</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCashFlowStatement() {
        return `
            <h4>Cash Flow Statement - ${this.getCurrentQuarter()} 2026</h4>
            <div class="cash-flow">
                <div class="flow-section">
                    <h5>Operating Activities</h5>
                    <div class="statement-item">
                        <span>Net Income</span>
                        <span class="amount positive">$1,957,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Depreciation</span>
                        <span class="amount positive">$185,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Change in Accounts Receivable</span>
                        <span class="amount negative">-$120,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Change in Inventory</span>
                        <span class="amount negative">-$85,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Change in Accounts Payable</span>
                        <span class="amount positive">$95,000</span>
                    </div>
                    <div class="statement-item total">
                        <span><strong>Net Cash from Operations</strong></span>
                        <span class="amount positive"><strong>$2,032,000</strong></span>
                    </div>
                </div>
                
                <div class="flow-section">
                    <h5>Investing Activities</h5>
                    <div class="statement-item">
                        <span>Equipment Purchase</span>
                        <span class="amount negative">-$450,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Property Sale</span>
                        <span class="amount positive">$125,000</span>
                    </div>
                    <div class="statement-item total">
                        <span><strong>Net Cash from Investing</strong></span>
                        <span class="amount negative"><strong>-$325,000</strong></span>
                    </div>
                </div>
                
                <div class="flow-section">
                    <h5>Financing Activities</h5>
                    <div class="statement-item">
                        <span>Loan Repayment</span>
                        <span class="amount negative">-$200,000</span>
                    </div>
                    <div class="statement-item">
                        <span>Dividend Payment</span>
                        <span class="amount negative">-$150,000</span>
                    </div>
                    <div class="statement-item total">
                        <span><strong>Net Cash from Financing</strong></span>
                        <span class="amount negative"><strong>-$350,000</strong></span>
                    </div>
                </div>
                
                <div class="flow-section highlight">
                    <div class="statement-item total">
                        <span><strong>Net Change in Cash</strong></span>
                        <span class="amount positive"><strong>$1,357,000</strong></span>
                    </div>
                </div>
            </div>
        `;
    }

    generateBudgetComparison() {
        return `
            <h4>Budget vs Actual Analysis - ${this.getCurrentQuarter()} 2026</h4>
            <div class="budget-comparison">
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Budget</th>
                                <th>Actual</th>
                                <th>Variance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Projects</td>
                                <td>$1,200,000</td>
                                <td>$1,150,000</td>
                                <td class="positive">+$50,000</td>
                                <td><span class="status-badge good">Under Budget</span></td>
                            </tr>
                            <tr>
                                <td>Human Resources</td>
                                <td>$450,000</td>
                                <td>$480,000</td>
                                <td class="negative">-$30,000</td>
                                <td><span class="status-badge warning">Over Budget</span></td>
                            </tr>
                            <tr>
                                <td>Health & Safety</td>
                                <td>$180,000</td>
                                <td>$165,000</td>
                                <td class="positive">+$15,000</td>
                                <td><span class="status-badge good">Under Budget</span></td>
                            </tr>
                            <tr>
                                <td>Real Estate</td>
                                <td>$350,000</td>
                                <td>$340,000</td>
                                <td class="positive">+$10,000</td>
                                <td><span class="status-badge good">Under Budget</span></td>
                            </tr>
                            <tr>
                                <td>Administration</td>
                                <td>$280,000</td>
                                <td>$290,000</td>
                                <td class="negative">-$10,000</td>
                                <td><span class="status-badge warning">Over Budget</span></td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Total</strong></td>
                                <td><strong>$2,460,000</strong></td>
                                <td><strong>$2,425,000</strong></td>
                                <td class="positive"><strong>+$35,000</strong></td>
                                <td><span class="status-badge good">Under Budget</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="budget-chart">
                    <canvas id="budgetChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    generateExpenseAnalysis() {
        return `
            <h4>Expense Analysis - ${this.getCurrentQuarter()} 2026</h4>
            <div class="expense-analysis">
                <div class="expense-summary">
                    <div class="summary-card">
                        <h5>Total Expenses</h5>
                        <div class="summary-amount">$2,425,000</div>
                        <div class="summary-change positive">-2.3% from last quarter</div>
                    </div>
                    <div class="summary-card">
                        <h5>Average Monthly</h5>
                        <div class="summary-amount">$808,333</div>
                        <div class="summary-change positive">-1.8% from last quarter</div>
                    </div>
                    <div class="summary-card">
                        <h5>Top Category</h5>
                        <div class="summary-amount">Salaries</div>
                        <div class="summary-change">49.5% of total</div>
                    </div>
                </div>
                
                <div class="expense-breakdown">
                    <h5>Expense Breakdown by Category</h5>
                    <div class="expense-categories">
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-name">Salaries & Wages</span>
                                <span class="category-amount">$1,200,000</span>
                            </div>
                            <div class="category-bar">
                                <div class="bar-fill" style="width: 49.5%"></div>
                            </div>
                            <span class="category-percentage">49.5%</span>
                        </div>
                        
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-name">Materials & Supplies</span>
                                <span class="category-amount">$850,000</span>
                            </div>
                            <div class="category-bar">
                                <div class="bar-fill" style="width: 35.1%"></div>
                            </div>
                            <span class="category-percentage">35.1%</span>
                        </div>
                        
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-name">Equipment Rental</span>
                                <span class="category-amount">$320,000</span>
                            </div>
                            <div class="category-bar">
                                <div class="bar-fill" style="width: 13.2%"></div>
                            </div>
                            <span class="category-percentage">13.2%</span>
                        </div>
                        
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-name">Utilities</span>
                                <span class="category-amount">$85,000</span>
                            </div>
                            <div class="category-bar">
                                <div class="bar-fill" style="width: 3.5%"></div>
                            </div>
                            <span class="category-percentage">3.5%</span>
                        </div>
                    </div>
                </div>
                
                <div class="expense-trends">
                    <h5>Monthly Expense Trends</h5>
                    <canvas id="expenseTrendChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    generateFinancialProjections() {
        return `
            <h4>Financial Projections - 2026</h4>
            <div class="financial-projections">
                <div class="projection-controls">
                    <select id="projectionScenario">
                        <option value="conservative">Conservative</option>
                        <option value="moderate" selected>Moderate</option>
                        <option value="aggressive">Aggressive</option>
                    </select>
                    <button class="action" onclick="FinanceDepartment.updateProjections()">Update Projections</button>
                </div>
                
                <div class="projection-summary">
                    <div class="projection-card">
                        <h5>Projected Revenue</h5>
                        <div class="projection-amount">$18,280,000</div>
                        <div class="projection-growth positive">+15.2% YoY</div>
                    </div>
                    <div class="projection-card">
                        <h5>Projected Expenses</h5>
                        <div class="projection-amount">$9,700,000</div>
                        <div class="projection-growth positive">+8.5% YoY</div>
                    </div>
                    <div class="projection-card">
                        <h5>Projected Net Income</h5>
                        <div class="projection-amount">$8,580,000</div>
                        <div class="projection-growth positive">+23.8% YoY</div>
                    </div>
                </div>
                
                <div class="quarterly-projections">
                    <h5>Quarterly Projections</h5>
                    <table>
                        <thead>
                            <tr>
                                <th>Quarter</th>
                                <th>Revenue</th>
                                <th>Expenses</th>
                                <th>Net Income</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Q1 2026</td>
                                <td>$4,570,000</td>
                                <td>$2,613,000</td>
                                <td>$1,957,000</td>
                                <td>42.8%</td>
                            </tr>
                            <tr>
                                <td>Q2 2026 (Projected)</td>
                                <td>$4,680,000</td>
                                <td>$2,690,000</td>
                                <td>$1,990,000</td>
                                <td>42.5%</td>
                            </tr>
                            <tr>
                                <td>Q3 2026 (Projected)</td>
                                <td>$4,520,000</td>
                                <td>$2,540,000</td>
                                <td>$1,980,000</td>
                                <td>43.8%</td>
                            </tr>
                            <tr>
                                <td>Q4 2026 (Projected)</td>
                                <td>$4,510,000</td>
                                <td>$2,857,000</td>
                                <td>$1,653,000</td>
                                <td>36.7%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="projection-chart">
                    <canvas id="projectionChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    // Utility methods
    getStartDate() {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        return date.toISOString().split('T')[0];
    }

    getEndDate() {
        return new Date().toISOString().split('T')[0];
    }

    getCurrentQuarter() {
        const month = new Date().getMonth();
        return `Q${Math.ceil((month + 1) / 3)}`;
    }

    getCurrentDate() {
        return new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Report management methods
    showFinanceReportTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        event.target.classList.add('active');
    }

    async updateReports() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const department = document.getElementById('departmentFilter').value;
        
        NotificationManager.show('Updating financial reports...', 'info', 'Processing');
        
        try {
            // Simulate API call to update reports
            await new Promise(resolve => setTimeout(resolve, 1000));
            NotificationManager.show('Financial reports updated successfully!', 'success', 'Reports Updated');
        } catch (error) {
            NotificationManager.show('Failed to update reports', 'error', 'Update Error');
        }
    }

    exportReport() {
        NotificationManager.show('Exporting financial report...', 'info', 'Exporting');
        // Implement export functionality
        setTimeout(() => {
            NotificationManager.show('Financial report exported successfully!', 'success', 'Export Complete');
        }, 1500);
    }

    printReport() {
        window.print();
        NotificationManager.show('Print dialog opened', 'info', 'Print');
    }

    scheduleReport() {
        FormManager.showCustomForm(
            'Schedule Financial Report',
            [
                { name: 'reportName', type: 'text', label: 'Report Name', required: true },
                { name: 'frequency', type: 'select', label: 'Frequency', required: true, options: [
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' }
                ]},
                { name: 'recipients', type: 'text', label: 'Email Recipients', placeholder: 'email1@example.com, email2@example.com' },
                { name: 'format', type: 'select', label: 'Format', options: [
                    { value: 'pdf', label: 'PDF' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'csv', label: 'CSV' }
                ]}
            ],
            (data) => {
                NotificationManager.show(`Report "${data.reportName}" scheduled successfully!`, 'success', 'Report Scheduled');
            }
        );
    }

    shareReport() {
        FormManager.showCustomForm(
            'Share Financial Report',
            [
                { name: 'recipient', type: 'text', label: 'Recipient Email', required: true },
                { name: 'subject', type: 'text', label: 'Subject', required: true },
                { name: 'message', type: 'textarea', label: 'Message', placeholder: 'Add a message...' },
                { name: 'includePassword', type: 'checkbox', label: 'Password protect' }
            ],
            (data) => {
                NotificationManager.show('Financial report shared successfully!', 'success', 'Report Shared');
            }
        );
    }
}

// Export for global use
window.FinanceDepartment = new FinanceDepartment();
