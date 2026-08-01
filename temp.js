async function loadTaxPaymentsTable() {
    // Find or create the container inside the tax form overlay
    let container = document.getElementById('taxPaymentsTableContainer');
    if (!container) {
        // Append a container after the form inside the overlay
        const formEl = document.getElementById('taxForm');
        if (!formEl) return;
        const formContainer = formEl.closest('.form-container');
        if (!formContainer) return;
        container = document.createElement('div');
        container.id = 'taxPaymentsTableContainer';
        container.style.cssText = 'margin-top:20px;max-height:300px;overflow-y:auto;';
        formContainer.appendChild(container);
    }

    container.innerHTML = '<p style="text-align:center;color:#888;padding:10px;">Loading tax payments...</p>';

    try {
        const payments = (await window.apiService.getTaxPayments()) || [];
        const records = Array.isArray(payments) ? payments : (payments.data || []);

        if (!records.length) {
            container.innerHTML = '<p style="text-align:center;color:#888;padding:10px;">No tax payment records found.</p>';
            return;
        }

        const statusColor = s => s === 'Paid' ? '#4CAF50' : s === 'Pending' ? '#FF9800' : s === 'Overdue' ? '#f44336' : '#607D8B';

        let html = `<h4 style="margin-bottom:10px;color:#0b3d91;">Recent Tax Payments</h4>
            <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                    <tr style="background:#0b3d91;color:white;">
                        <th style="padding:7px 8px;text-align:left;">#</th>
                        <th style="padding:7px 8px;text-align:left;">Type</th>
                        <th style="padding:7px 8px;text-align:right;">Amount (TZS)</th>
                        <th style="padding:7px 8px;text-align:left;">Period</th>
                        <th style="padding:7px 8px;text-align:left;">Due Date</th>
                        <th style="padding:7px 8px;text-align:left;">Method</th>
                        <th style="padding:7px 8px;text-align:left;">Reference</th>
                        <th style="padding:7px 8px;text-align:left;">Status</th>
                        <th style="padding:7px 8px;text-align:center;">Action</th>
                    </tr>
                </thead>
                <tbody>`;

        records.forEach((rec, idx) => {
            const bg = idx % 2 === 0 ? '#fff' : '#f8f9fa';
            const s = rec.payment_status || rec.status || '-';
            const sc = statusColor(s);
            const amount = rec.amount ? Number(rec.amount).toLocaleString() : '-';
            const dueDate = rec.due_date ? new Date(rec.due_date).toLocaleDateString() : '-';
            html += `<tr style="background:${bg};">
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${idx + 1}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.tax_type || rec.taxType || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${amount}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.tax_period || rec.taxPeriod || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${dueDate}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.payment_method || rec.paymentMethod || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">${rec.payment_reference || rec.paymentReference || '-'}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;">
                    <span style="background:${sc};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">${s}</span>
                </td>
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">
                    <button onclick='showTaxPayments(${JSON.stringify(rec).replace(/\'/g, "&#39;")})' style="background:#2196F3;color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">View</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('Error loading tax payments table:', err);
        container.innerHTML = '<p style="text-align:center;color:#c00;padding:10px;">Error loading tax payments.</p>';
    }
}



// ===== MATERIALS MANAGEMENT FUNCTIONS =====

function showMaterialsDashboard_old() {

    const contentArea = document.getElementById('contentArea');

    if (!contentArea) return;

    contentArea.innerHTML = `

        <div class="section">

            <div class="section-header">

                <h3>Materials Management Dashboard</h3>

                <button onclick="goBack()" class="back-btn">Back</button>

            </div>

            <div class="dashboard-cards">

