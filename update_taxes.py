import re
import sys
import json

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update function signature
    content = re.sub(r'function showTaxPayments\(\)\s*\{', r'function showTaxPayments(taxData = null) {', content)

    # 2. Update form submission listener and view logic
    old_listener_pattern = r'(setTimeout\(\s*(?:async\s*)?\(\)\s*=>\s*\{\s*const taxForm = document\.getElementById\(\'taxForm\'\);\s*if\s*\(taxForm\)\s*\{\s*)taxForm\.addEventListener\(\'submit\',\s*async\s*function\(e\)\s*\{'
    
    new_listener = r'''\1
            if (taxData) {
                const h3 = taxForm.closest('.form-container').querySelector('.form-header h3');
                if (h3) h3.textContent = 'View Tax Payment';
                
                if (taxForm.querySelector('#taxType')) taxForm.querySelector('#taxType').value = taxData.tax_type || taxData.taxType || '';
                if (taxForm.querySelector('#taxAmount')) taxForm.querySelector('#taxAmount').value = taxData.amount || '';
                if (taxForm.querySelector('#taxPeriod') && (taxData.tax_period || taxData.taxPeriod)) taxForm.querySelector('#taxPeriod').value = taxData.tax_period || taxData.taxPeriod;
                if (taxForm.querySelector('#taxDueDate') && (taxData.due_date || taxData.dueDate)) taxForm.querySelector('#taxDueDate').value = (taxData.due_date || taxData.dueDate).split('T')[0];
                if (taxForm.querySelector('#taxStatus')) taxForm.querySelector('#taxStatus').value = taxData.payment_status || taxData.paymentStatus || '';
                if (taxForm.querySelector('#paymentMethod')) taxForm.querySelector('#paymentMethod').value = taxData.payment_method || taxData.paymentMethod || '';
                if (taxForm.querySelector('#paymentReference')) taxForm.querySelector('#paymentReference').value = taxData.payment_reference || taxData.paymentReference || '';
                if (taxForm.querySelector('#penalties') && taxData.penalties !== undefined) taxForm.querySelector('#penalties').value = taxData.penalties;
                if (taxForm.querySelector('#interest') && taxData.interest !== undefined) taxForm.querySelector('#interest').value = taxData.interest;
                if (taxForm.querySelector('#taxDescription')) taxForm.querySelector('#taxDescription').value = taxData.description || '';
                
                Array.from(taxForm.elements).forEach(el => {
                    if (el.tagName !== 'BUTTON' && el.id !== 'taxAttachments') el.disabled = true;
                });
                
                const attInput = taxForm.querySelector('#taxAttachments');
                if (attInput) attInput.closest('.form-group').style.display = 'none';
                
                const submitBtn = taxForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.style.display = 'none';
                
                taxForm.addEventListener('submit', function(e) { e.preventDefault(); });
            } else {
                taxForm.addEventListener('submit', async function(e) {
'''
    content = re.sub(old_listener_pattern, new_listener, content)

    # 3. Close the else block for the submit listener
    old_close_listener = r'(submitBtn\.disabled = false;\s*\}\s*\}\);)'
    new_close_listener = r'\1\n            }'
    content = re.sub(old_close_listener, new_close_listener, content)

    # 4. Add the View button to the table
    old_th_pattern = r'(<th style="padding:7px 8px;text-align:left;">Status</th>)'
    new_th = r'\1\n                        <th style="padding:7px 8px;text-align:center;">Action</th>'
    content = re.sub(old_th_pattern, new_th, content)

    old_td_pattern = r'(<td style="padding:6px 8px;border-bottom:1px solid #eee;">\s*<span style="background:\$\{sc\};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">\$\{s\}</span>\s*</td>)'
    
    new_td = r'''\1
                <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">
                    <button onclick='showTaxPayments(' + JSON.stringify(rec).replace(/'/g, "&#39;") + ')' style="background:#2196F3;color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;">View</button>
                </td>'''
    content = re.sub(old_td_pattern, new_td, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

update_file(r'c:\Users\USER\Downloads\consultion system\frontend\public\department.html')
try:
    update_file(r'c:\Users\USER\Downloads\consultion system\frontend\public\department.js')
except Exception as e:
    print('Failed js:', e)

