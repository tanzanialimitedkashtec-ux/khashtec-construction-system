// Department management frontend logic
(function(){
  function getContentEl(){
    return document.getElementById('contentArea') || document.querySelector('.content') || document.body;
  }

  async function loadDepartments(){
    try{
      const res = await fetch('/api/departments');
      const data = await res.json();
      // Normalize possible shapes
      // Accept: [ ... ], { success:true, data:[...] }, { rows:[...] }, {0:[...]} (mysql2 rows), or fallback
      let rows = [];
      if (Array.isArray(data)) {
        rows = data;
      } else if (Array.isArray(data?.data)) {
        rows = data.data;
      } else if (Array.isArray(data?.rows)) {
        rows = data.rows;
      } else if (Array.isArray(data?.[0])) {
        rows = data[0];
      } else if (data && typeof data === 'object') {
        // Sometimes API may return single object; put into array
        rows = [data];
      }
      console.log('Departments loaded:', rows);
      renderDepartmentsTable(rows);
    }catch(err){
      console.error('Failed to load departments:', err);
      renderDepartmentsTable([]);
    }
  }

  function renderDepartmentsTable(items){
    const tableBody = document.getElementById('departmentsTableBody');
    if(!tableBody) return;

    if(!Array.isArray(items)){
      try{
        items = Array.from(items);
      }catch(_){
        items = [];
      }
    }

    if(items.length === 0){
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999">No departments found</td></tr>';
      return;
    }

    const html = items.map(d => `
      <tr>
        <td>${d.id ?? ''}</td>
        <td>${d.code ?? d.department_code ?? ''}</td>
        <td>${d.name ?? d.department_name ?? ''}</td>
        <td>${d.manager_email ?? ''}</td>
        <td><span class="badge" style="background:${(d.status||'Active')==='Active'?'#28a745':((d.status||'')==='Inactive'?'#6c757d':'#ffc107')}">${d.status || 'Active'}</span></td>
        <td>${new Date(d.created_at || Date.now()).toLocaleString()}</td>
        <td>
          <button type="button" class="btn btn-secondary delete-dept-btn" data-id="${d.id}" style="background:#dc3545;color:white;padding:4px 8px;font-size:8px;border-radius:4px;border:none;cursor:pointer">Delete</button>
        </td>
      </tr>
    `).join('');
    tableBody.innerHTML = html;

    // Attach event listeners for delete buttons
    tableBody.querySelectorAll('.delete-dept-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this department?')) {
          try {
            const res = await fetch(`/api/departments/${id}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data?.error || 'Failed to delete department');
            }
            alert('Department deleted successfully');
            await loadDepartments();
          } catch (err) {
            console.error('Failed to delete department:', err);
            alert('Error: ' + err.message);
          }
        }
      });
    });
  }

  async function submitDepartment(e){
    e.preventDefault();
    const form = e.target.closest('form') || document.getElementById('departmentForm');
    if(!form) return;

    const payload = {
      name: form.departmentName.value.trim(),
      code: form.departmentCode.value.trim(),
      managerEmail: form.managerEmail.value.trim() || null,
      description: form.description.value.trim() || null,
      status: form.status.value
    };

    if(!payload.name || !payload.code){
      alert('Please provide Department Name and Code');
      return;
    }

    try{
      const res = await fetch('/api/departments',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok){
        throw new Error(data?.error || 'Failed to create department');
      }
      // Refresh list and reset form
      form.reset();
      await loadDepartments();
      alert('Department saved successfully');
      // Close form like risk management UX
      if (typeof hideDepartmentForm === 'function') {
        hideDepartmentForm();
      }
    }catch(err){
      console.error('Failed to save department:', err);
      alert('Error: '+ err.message);
    }
  }

  function showDepartmentManagement(){
    const el = getContentEl();
    el.innerHTML = `
      <div style="padding:16px">
        <h2 style="margin-top:0">Department Management</h2>
        <div class="card">
          <h3 style="margin:0 0 12px 0">Departments</h3>
          <div style="margin: 6px 0 12px 0; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" id="newDepartmentBtn" class="btn btn-primary">+ New Department</button>
            <button type="button" id="reloadDepartmentsBtn" class="btn btn-secondary">Reload</button>
          </div>
          <div class="department-table-container">
            <table class="department-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Manager Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="departmentsTableBody"></tbody>
            </table>
          </div>
        </div>
        <div id="departmentFormContainer" class="card hidden"></div>
      </div>
    `;

    const reloadBtn = document.getElementById('reloadDepartmentsBtn');
    if(reloadBtn){ reloadBtn.addEventListener('click', loadDepartments); }
    const newBtn = document.getElementById('newDepartmentBtn');
    if(newBtn){ newBtn.addEventListener('click', showDepartmentForm); }

    loadDepartments();
  }

  function showDepartmentForm(){
    const container = document.getElementById('departmentFormContainer');
    if (!container) return;
    const autoDeptCode = `DPT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    container.classList.remove('hidden');
    container.innerHTML = `
      <h4 style="margin:0 0 12px 0">Add Department</h4>
      <form id="departmentForm" style="display:flex;flex-direction:column;gap:10px">
        <div>
          <label>Department Name</label>
          <input type="text" name="departmentName" placeholder="e.g. Human Resources" required />
        </div>
        <div>
          <label>Department Code</label>
          <input type="text" name="departmentCode" value="${autoDeptCode}" readonly style="background-color: #f8f9fa; cursor: not-allowed; font-weight: bold; color: #555;" required />
        </div>
        <div>
          <label>Manager Email</label>
          <input type="email" name="managerEmail" placeholder="e.g. hr@kashtec.com" />
        </div>
        <div>
          <label>Status</label>
          <select name="status">
            <option value="Active" selected>Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" rows="3" placeholder="Short description..."></textarea>
        </div>
        <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
          <button type="submit">Save Department</button>
          <button type="button" onclick="hideDepartmentForm()">Cancel</button>
        </div>
      </form>
    `;
    const form = document.getElementById('departmentForm');
    if(form){ form.addEventListener('submit', submitDepartment); }
  }

  function hideDepartmentForm(){
    const container = document.getElementById('departmentFormContainer');
    if (!container) return;
    container.classList.add('hidden');
    container.innerHTML = '';
  }

  // Expose globally for menu integration
  window.showDepartmentManagement = showDepartmentManagement;
  window.hideDepartmentForm = hideDepartmentForm;
  window.showDepartmentForm = showDepartmentForm;

  // Global helper for luggage purchase deletion from department page buttons
  window.deletePurchase_API = async function(purchaseId) {
    if (!confirm(`Are you sure you want to delete purchase: ${purchaseId}?`)) return;

    try {
      if (window.KashTecAPI && typeof window.KashTecAPI.delete === 'function') {
        const resp = await window.KashTecAPI.delete(`/luggage-purchases/${purchaseId}`);
        if (resp && resp.success) {
          alert(`Purchase ${purchaseId} deleted successfully!`);
          if (typeof window.loadLuggagePurchases === 'function') {
            await window.loadLuggagePurchases();
          } else {
            window.location.reload();
          }
          return;
        }
        throw new Error((resp && resp.message) || 'Failed to delete purchase');
      }

      const base = (window.KashTecAPI && window.KashTecAPI.baseUrl) ? window.KashTecAPI.baseUrl : '';
      const url = `${base}/api/luggage-purchases/${purchaseId}`;
      const response = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const json = await response.json().catch(() => null);

      if (response.ok && json && json.success !== false) {
        alert(`Purchase ${purchaseId} deleted successfully!`);
        if (typeof window.loadLuggagePurchases === 'function') {
          await window.loadLuggagePurchases();
        } else {
          window.location.reload();
        }
        return;
      }

      throw new Error((json && json.message) || `Delete failed (status ${response.status})`);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert(`Error deleting purchase: ${error.message || error}`);
    }
  };

  // Global helper to delete luggage campaigns (used by inline onclick buttons)
  window.deleteCampaign = async function(campaignId) {
    if (!confirm(`Are you sure you want to delete campaign: ${campaignId}? This action cannot be undone.`)) return;

    try {
      // Prefer centralized API helper when available
      if (window.KashTecAPI && typeof window.KashTecAPI.delete === 'function') {
        const resp = await window.KashTecAPI.delete(`/luggage-campaigns/${campaignId}`);
        console.log('🗑️ deleteCampaign via KashTecAPI:', resp);
        if (resp && resp.success) {
          alert('Campaign deleted successfully!');
          if (typeof window.loadLuggageCampaigns === 'function') {
            await window.loadLuggageCampaigns();
          } else {
            window.location.reload();
          }
          return;
        }
        throw new Error((resp && (resp.error || resp.message)) || 'Failed to delete campaign');
      }

      // Fallback: call DELETE directly
      const base = (window.KashTecAPI && window.KashTecAPI.baseUrl) ? window.KashTecAPI.baseUrl : (window.location.origin + '/api');
      const url = `${base}/luggage-campaigns/${campaignId}`;
      const token = (window.sessionManager && window.sessionManager.getAuthToken && window.sessionManager.getAuthToken()) || localStorage.getItem('authToken') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, { method: 'DELETE', headers });
      const text = await response.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text }; }

      console.log('🗑️ deleteCampaign fetch fallback:', response.status, response.statusText, json);

      if (!response.ok) {
        throw new Error((json && (json.error || json.message)) || `HTTP ${response.status}`);
      }

      if (json && json.success) {
        alert('Campaign deleted successfully!');
        if (typeof window.loadLuggageCampaigns === 'function') {
          await window.loadLuggageCampaigns();
        } else {
          window.location.reload();
        }
        return;
      }

      throw new Error((json && (json.error || json.message)) || 'Failed to delete campaign');
    } catch (err) {
      console.error('❌ Error deleting campaign:', err);
      alert('Error deleting campaign: ' + (err.message || err));
    }
  };

  // Global helper to record PPE returns (used by inline onclick buttons)
  window.recordPpeReturn = async function(ppeId) {
    if (!confirm(`Are you sure you want to record return for PPE ID: ${ppeId}?`)) return;

    try {
      // Prefer centralized API helper when available
      if (window.KashTecAPI && typeof window.KashTecAPI.put === 'function') {
        try {
          const returnDate = new Date().toISOString().split('T')[0];
          const payload = { status: 'Returned', return_date: returnDate };
          // Try HSE-scoped endpoint first
          let resp = await window.KashTecAPI.put(`/work/hse/ppe/${ppeId}`, payload).catch(() => null);
          if (!resp) {
            resp = await window.KashTecAPI.put(`/work/ppe/${ppeId}`, payload).catch(() => null);
          }
          console.log('🔁 recordPpeReturn response via KashTecAPI:', resp);
          if (resp && (resp.success || resp.message)) {
            alert('PPE return recorded successfully!');
            if (typeof window.loadPpeRecords === 'function') await window.loadPpeRecords(); else window.location.reload();
            return;
          }
        } catch (e) {
          console.warn('⚠️ KashTecAPI.put attempts failed:', e.message);
        }
      }

      // Fallback: call API directly
      const base = (window.KashTecAPI && window.KashTecAPI.baseUrl) ? window.KashTecAPI.baseUrl : (window.location.origin + '/api');
      const url = `${base}/work/hse/ppe/${ppeId}`;
      const token = (window.sessionManager && window.sessionManager.getAuthToken && window.sessionManager.getAuthToken()) || localStorage.getItem('authToken') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const returnDate = new Date().toISOString().split('T')[0];
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'Returned', return_date: returnDate })
      });

      const text = await response.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text }; }

      console.log('🔁 recordPpeReturn fetch fallback:', response.status, response.statusText, json);

      if (!response.ok) {
        throw new Error((json && (json.error || json.message)) || `HTTP ${response.status}`);
      }

      if (json && (json.success || json.message)) {
        alert('PPE return recorded successfully!');
        if (typeof window.loadPpeRecords === 'function') await window.loadPpeRecords(); else window.location.reload();
        return;
      }

      throw new Error((json && (json.error || json.message)) || 'Failed to record PPE return');
    } catch (err) {
      console.error('❌ Error recording PPE return:', err);
      alert('Error recording PPE return: ' + (err.message || err));
    }
  };

  async function viewProject(projectId) {
    try {
      const baseUrl = (window.KashTecAPI && window.KashTecAPI.baseUrl) ? window.KashTecAPI.baseUrl : window.location.origin;
      const token = (window.KashTecAPI && typeof window.KashTecAPI.getAuthToken === 'function')
        ? window.KashTecAPI.getAuthToken()
        : (window.sessionManager && typeof window.sessionManager.getAuthToken === 'function')
          ? window.sessionManager.getAuthToken()
          : localStorage.getItem('authToken') || '';

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${baseUrl}/api/projects/${projectId}`, { headers });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((json && (json.error || json.message)) || `HTTP ${response.status}`);
      }

      const project = (json && json.project) ? json.project : (json && json.data) ? json.data : json;
      if (!project) {
        throw new Error('Project not found');
      }

      const body = document.body;
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 720px; width: 95%;">
          <div class="modal-header" style="background: #0b3d91; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin:0;">Project Details</h3>
              <small style="opacity:.85;">ID: ${project.id}</small>
            </div>
            <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding: 20px; background: #fff;">
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px;">
              <div><strong>Name</strong><div>${project.name || project.project_name || 'N/A'}</div></div>
              <div><strong>Status</strong><div>${project.status || 'N/A'}</div></div>
              <div><strong>Project Code</strong><div>${project.project_code || project.code || 'N/A'}</div></div>
              <div><strong>Project Type</strong><div>${project.project_type || project.type || 'N/A'}</div></div>
              <div><strong>Client</strong><div>${project.client_name || project.client || 'N/A'}</div></div>
              <div><strong>Manager</strong><div>${project.project_manager || project.manager || 'N/A'}</div></div>
              <div><strong>Location</strong><div>${project.location || 'N/A'}</div></div>
              <div><strong>Priority</strong><div>${project.priority_level || project.priority || 'N/A'}</div></div>
              <div><strong>Start Date</strong><div>${project.start_date || 'N/A'}</div></div>
              <div><strong>End Date</strong><div>${project.end_date || 'N/A'}</div></div>
              <div><strong>Budget</strong><div>${project.contract_value != null ? Number(project.contract_value).toLocaleString() : 'N/A'}</div></div>
            </div>
            <div style="margin-bottom: 16px;">
              <strong>Description</strong>
              <p style="margin: 8px 0 0; white-space: pre-wrap;">${project.description || 'No description provided.'}</p>
            </div>
          </div>
          <div class="modal-footer" style="padding: 14px 20px; background: #f1f3f5; border-radius: 0 0 8px 8px; text-align: right;">
            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="background: #6c757d; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Close</button>
          </div>
        </div>
      `;
      body.appendChild(modal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.remove();
      });
    } catch (err) {
      console.error('Error loading project details:', err);
      if (window.customAlert) {
        window.customAlert(`Failed to load project details. ${err.message || err}`, 'Error', 'error');
      } else {
        alert(`Failed to load project details. ${err.message || err}`);
      }
    }
  }

  async function deleteProject(projectId) {
    if (!confirm(`Are you sure you want to delete project ${projectId}? This action cannot be undone.`)) {
      return;
    }

    try {
      const baseUrl = (window.KashTecAPI && window.KashTecAPI.baseUrl) ? window.KashTecAPI.baseUrl : window.location.origin;
      const token = (window.KashTecAPI && typeof window.KashTecAPI.getAuthToken === 'function')
        ? window.KashTecAPI.getAuthToken()
        : (window.sessionManager && typeof window.sessionManager.getAuthToken === 'function')
          ? window.sessionManager.getAuthToken()
          : localStorage.getItem('authToken') || '';

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((json && (json.error || json.message)) || `HTTP ${response.status}`);
      }

      if (window.customAlert) {
        window.customAlert('Project deleted successfully.', 'Success', 'success');
      } else {
        alert('Project deleted successfully.');
      }

      if (typeof window.loadProjects === 'function') {
        await window.loadProjects();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      if (window.customAlert) {
        window.customAlert(`Failed to delete project. ${err.message || err}`, 'Error', 'error');
      } else {
        alert(`Failed to delete project. ${err.message || err}`);
      }
    }
  }

  window.viewProject = viewProject;
  window.deleteProject = deleteProject;

  // Optional: if contentArea exists and a global flag set later, we could auto-run
})();

window.toggleEmailPayslipsForm = function toggleEmailPayslipsForm(){
    const container = document.getElementById('emailPayslipsFormContainer');
    if (!container) return;
    const isHidden = container.classList.contains('hidden');

    if (isHidden) {
        const srcEmp = document.getElementById('payslipEmployee');
        const dstEmp = document.getElementById('emailPayslipsEmployee');
        const srcMon = document.getElementById('payslipMonth');
        const dstMon = document.getElementById('emailPayslipsMonth');
        if (srcEmp && dstEmp) {
            dstEmp.innerHTML = srcEmp.innerHTML;
            dstEmp.value = srcEmp.value;
        }
        if (srcMon && dstMon) {
            dstMon.innerHTML = srcMon.innerHTML;
            dstMon.value = srcMon.value;
        }
    }

    container.classList.toggle('hidden');
}

window.submitEmailPayslipsForm = function submitEmailPayslipsForm(event){
    if (event) event.preventDefault();
    const emailEmp = document.getElementById('emailPayslipsEmployee');
    const emailMon = document.getElementById('emailPayslipsMonth');
    const mainEmp = document.getElementById('payslipEmployee');
    const mainMon = document.getElementById('payslipMonth');
    if (emailEmp && mainEmp) mainEmp.value = emailEmp.value;
    if (emailMon && mainMon) mainMon.value = emailMon.value;

    if (typeof window.emailPayslips === 'function') {
        window.emailPayslips();
    }
    const container = document.getElementById('emailPayslipsFormContainer');
    if (container) container.classList.add('hidden');
    return false;
}

window.emailPayslips = function emailPayslips() {
    const employeeId = document.getElementById('payslipEmployee').value;
    const month = document.getElementById('payslipMonth').value;

    if (!month) {
        if(typeof customAlert === 'function') {
            customAlert('Please select a payroll month.', 'Validation Error', 'error');
        } else {
            alert('Please select a payroll month.');
        }
        console.error('Email payslips failed: no month selected');
        return;
    }

    const baseUrl = window.location.origin;
    console.log('Emailing payslips for month:', month, 'employee:', employeeId || 'all');

    const token = typeof sessionManager !== 'undefined' ? sessionManager.getAuthToken() : (window.sessionManager ? window.sessionManager.getAuthToken() : '');
    
    fetch(`${baseUrl}/api/payroll/payslips/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ month, employeeId: employeeId || 'all' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log('Payslips emailed successfully:', data);
            if(typeof customAlert === 'function') {
                customAlert(`Payslips emailed successfully!\n\nMonth: ${month}\nRecords updated: ${data.updated || 0}`, 'Payslips Emailed', 'success');
            } else {
                alert(`Payslips emailed successfully!\n\nMonth: ${month}\nRecords updated: ${data.updated || 0}`);
            }
        } else {
            console.error('Failed to email payslips:', data.error);
            if(typeof customAlert === 'function') {
                customAlert(`Failed to email payslips: ${data.error}`, 'Error', 'error');
            } else {
                alert(`Failed to email payslips: ${data.error}`);
            }
        }
    })
    .catch(err => {
        console.error('Error emailing payslips:', err);
        if(typeof customAlert === 'function') {
            customAlert('Failed to email payslips due to a network error.', 'Error', 'error');
        } else {
            alert('Failed to email payslips due to a network error.');
        }
    });
};

window.handleGeneratePayslips = function handleGeneratePayslips(event){
    if (event) event.preventDefault();
    if (typeof window.generateIndividualPayslip === 'function') {
        window.generateIndividualPayslip();
    }
    return false;
};

window.generateIndividualPayslip = function generateIndividualPayslip() {
    const employeeId = document.getElementById('payslipEmployee').value;
    const month = document.getElementById('payslipMonth').value;

    if (!month) {
        if(typeof customAlert === 'function') customAlert('Please select a payroll month.', 'Validation Error', 'error');
        else alert('Please select a payroll month.');
        console.error('Payslip generation failed: no month selected');
        return;
    }

    const baseUrl = window.location.origin;
    const url = employeeId && employeeId !== 'all'
        ? `${baseUrl}/api/payroll/payslips/employee/${employeeId}/${encodeURIComponent(month)}`
        : `${baseUrl}/api/payroll/payslips/${encodeURIComponent(month)}`;

    console.log('Generating payslip(s) for month:', month, 'employee:', employeeId || 'all');
    
    const token = typeof sessionManager !== 'undefined' ? sessionManager.getAuthToken() : (window.sessionManager ? window.sessionManager.getAuthToken() : '');

    fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            let payslips = [];
            if (Array.isArray(data.data)) {
                payslips = data.data;
            } else if (data.data) {
                payslips = [data.data];
            }

            if (payslips.length === 0) {
                console.warn('No payslip data found for', month);
                if(typeof customAlert === 'function') customAlert('No payslip data found for the selected month. Process payroll first.', 'No Data', 'error');
                else alert('No payslip data found for the selected month. Process payroll first.');
                document.getElementById('payslipResults').innerHTML = '<p>No payslip data found. Please process payroll first.</p>';
                return;
            }

            console.log('Payslip data retrieved:', payslips.length, 'record(s)');
            if (typeof window.generatePayslipExcel === 'function') {
                window.generatePayslipExcel(payslips, month);
            }
        } else {
            console.error('Failed to fetch payslips:', data.error);
            if(typeof customAlert === 'function') customAlert(`Failed to fetch payslip data: ${data.error}`, 'Error', 'error');
            else alert(`Failed to fetch payslip data: ${data.error}`);
        }
    })
    .catch(err => {
        console.error('Error fetching payslips:', err);
        if(typeof customAlert === 'function') customAlert('Network error fetching payslip data. Please try again.', 'Error', 'error');
        else alert('Network error fetching payslip data. Please try again.');
    });
};

window.generatePayslipExcel = function generatePayslipExcel(payslips, month) {
    console.log('Generating Excel payslip for', payslips.length, 'employees, month:', month);

    const headers = ['Employee ID', 'Employee Name', 'Payroll Month', 'Basic Salary (TZS)', 'Allowances (TZS)', 'Gross Salary (TZS)', 'NSSF Deduction (TZS)', 'PAYE Tax (TZS)', 'Other Deductions (TZS)', 'Net Salary (TZS)'];
    const rows = payslips.map(p => [
        p.employee_id || '',
        p.employee_name || '',
        p.payroll_month || month,
        parseFloat(p.basic_salary || 0),
        parseFloat(p.allowances || 0),
        parseFloat(p.gross_salary || 0),
        parseFloat(p.nssf_deduction || 0),
        parseFloat(p.paye_tax || 0),
        parseFloat(p.other_deductions || 0),
        parseFloat(p.net_salary || 0)
    ]);

    const totals = ['', 'TOTALS', '', 0, 0, 0, 0, 0, 0, 0];
    rows.forEach(r => {
        for (let i = 3; i <= 9; i++) totals[i] += r[i];
    });
    rows.push(totals);

    let xmlRows = '';
    xmlRows += '<Row>';
    headers.forEach(h => { xmlRows += `<Cell><Data ss:Type="String">${h}</Data></Cell>`; });
    xmlRows += '</Row>';
    rows.forEach(row => {
        xmlRows += '<Row>';
        row.forEach((cell, idx) => {
            if (idx <= 2) {
                xmlRows += `<Cell><Data ss:Type="String">${String(cell).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</Data></Cell>`;
            } else {
                xmlRows += `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`;
            }
        });
        xmlRows += '</Row>';
    });

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#F8F9FA" ss:Pattern="Solid"/></Style>
  <Style ss:ID="currency"><NumberFormat ss:Format="#,##0.00"/></Style>
 </Styles>
 <Worksheet ss:Name="Payslips">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Payslips_' + month.replace(/\s+/g, '_') + '.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if(typeof customAlert === 'function') customAlert(`Payslips generated successfully!\n\nMonth: ${month}\nEmployees: ${payslips.length}\nFile: ${a.download}\n\nThe Excel file has been downloaded.`, 'Payslips Generated', 'success');
    else alert(`Payslips generated successfully!\n\nMonth: ${month}\nEmployees: ${payslips.length}\nFile: ${a.download}\n\nThe Excel file has been downloaded.`);

    const resultsDiv = document.getElementById('payslipResults');
    if (resultsDiv) {
        let tblHtml = `<h5>Payslip Details - ${month}</h5>
            <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="background:#f8f9fa;">
                <th style="padding:8px;border:1px solid #ddd;">Employee</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Basic</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Allowances</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Gross</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">NSSF</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">PAYE</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Net</th>
            </tr></thead><tbody>`;
        payslips.forEach(p => {
            tblHtml += `<tr>
                <td style="padding:8px;border:1px solid #ddd;">${p.employee_name || p.employee_id}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">TZS ${parseFloat(p.basic_salary || 0).toLocaleString()}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">TZS ${parseFloat(p.allowances || 0).toLocaleString()}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">TZS ${parseFloat(p.gross_salary || 0).toLocaleString()}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">TZS ${parseFloat(p.nssf_deduction || 0).toLocaleString()}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">TZS ${parseFloat(p.paye_tax || 0).toLocaleString()}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">TZS ${parseFloat(p.net_salary || 0).toLocaleString()}</td>
            </tr>`;
        });
        tblHtml += '</tbody></table>';
        resultsDiv.innerHTML = tblHtml;
    }
};

// Permission checking for Expense Management
document.addEventListener('DOMContentLoaded', function() {
    setInterval(function() {
        var role = null;
        if (typeof sessionManager !== 'undefined' && sessionManager.getUserRole) {
            role = sessionManager.getUserRole();
        } else if (typeof window.sessionManager !== 'undefined' && window.sessionManager.getUserRole) {
            role = window.sessionManager.getUserRole();
        } else if (typeof currentRole !== 'undefined') {
            role = currentRole;
        }

        var pendingBtn = document.querySelector(`button[onclick="showExpenseTab('pending', event)"]`);
        var confirmedBtn = document.querySelector(`button[onclick="showExpenseTab('confirmed', event)"]`);
        var allBtn = document.querySelector(`button[onclick="showExpenseTab('all', event)"]`);
        var newBtn = document.querySelector(`button[onclick="showExpenseTab('new', event)"]`);
        var expenseOverviewDiv = document.querySelector('.expense-overview');

        if (role === 'MD') {
            // MD: Pending and All expenses allowed
            if (pendingBtn) pendingBtn.style.display = 'inline-block';
            if (confirmedBtn) confirmedBtn.style.display = 'none';
            if (allBtn) allBtn.style.display = 'inline-block';
            if (newBtn) newBtn.style.display = 'none';
            if (expenseOverviewDiv) expenseOverviewDiv.style.display = 'none';
            
            // Force MD to the pending tab if they aren't on it (or all tab if they clicked it)
            if (pendingBtn && !pendingBtn.classList.contains('active') && allBtn && !allBtn.classList.contains('active')) {
                pendingBtn.click();
            }
        } else if (role === 'FINANCE' || role === 'Finance Manager' || role === 'Finance') {
            // Finance Manager: EVERYTHING EXCEPT pending expenses allowed
            if (pendingBtn) pendingBtn.style.display = 'none';
            if (confirmedBtn) confirmedBtn.style.display = 'inline-block';
            if (allBtn) allBtn.style.display = 'inline-block';
            if (newBtn) newBtn.style.display = 'inline-block';
            if (expenseOverviewDiv) expenseOverviewDiv.style.display = 'block';

            // If pending is active, force switch to Confirmed Expenses
            if (pendingBtn && pendingBtn.classList.contains('active')) {
                if (confirmedBtn) confirmedBtn.click();
            }
        } else {
            // Admins/Others
            if (pendingBtn) pendingBtn.style.display = 'inline-block';
            if (confirmedBtn) confirmedBtn.style.display = 'inline-block';
            if (allBtn) allBtn.style.display = 'inline-block';
            if (newBtn) newBtn.style.display = 'inline-block';
            if (expenseOverviewDiv) expenseOverviewDiv.style.display = 'block';
        }
    }, 1000);
});
