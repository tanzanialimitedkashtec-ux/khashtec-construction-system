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
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999">No departments found</td></tr>';
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
      </tr>
    `).join('');
    tableBody.innerHTML = html;
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
          <div style="overflow:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th style="text-align:left;border-bottom:1px solid #2f4358;padding:8px">ID</th>
                  <th style="text-align:left;border-bottom:1px solid #2f4358;padding:8px">Code</th>
                  <th style="text-align:left;border-bottom:1px solid #2f4358;padding:8px">Name</th>
                  <th style="text-align:left;border-bottom:1px solid #2f4358;padding:8px">Manager Email</th>
                  <th style="text-align:left;border-bottom:1px solid #2f4358;padding:8px">Status</th>
                  <th style="text-align:left;border-bottom:1px solid #2f4358;padding:8px">Created</th>
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
          <input type="text" name="departmentCode" placeholder="e.g. HR" required />
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
  // Optional: if contentArea exists and a global flag set later, we could auto-run
})();
