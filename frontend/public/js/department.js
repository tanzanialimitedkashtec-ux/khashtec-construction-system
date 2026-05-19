// Department management frontend logic
(function(){
  function getContentEl(){
    return document.getElementById('contentArea') || document.querySelector('.content') || document.body;
  }

  async function loadDepartments(){
    try{
      const res = await fetch('/api/departments');
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data.data || []);
      renderDepartmentsTable(rows);
    }catch(err){
      console.error('Failed to load departments:', err);
      renderDepartmentsTable([]);
    }
  }

  function renderDepartmentsTable(items){
    const tableBody = document.getElementById('departmentsTableBody');
    if(!tableBody) return;

    if(!Array.isArray(items) || items.length === 0){
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
        <div class="card" style="background:#1e2a38;color:#fff;padding:16px;border-radius:8px;margin-bottom:16px">
          <h3 style="margin-top:0">Add Department</h3>
          <form id="departmentForm">
            <div style="display:grid;grid-template-columns:repeat(2, minmax(200px,1fr));gap:12px">
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
              <div style="grid-column: 1 / -1">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Short description..."></textarea>
              </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button type="submit">Save Department</button>
              <button type="button" id="reloadDepartmentsBtn">Reload List</button>
            </div>
          </form>
        </div>

        <div class="card" style="background:#1e2a38;color:#fff;padding:16px;border-radius:8px">
          <h3 style="margin-top:0">Departments</h3>
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
      </div>
    `;

    const form = document.getElementById('departmentForm');
    if(form){ form.addEventListener('submit', submitDepartment); }
    const reloadBtn = document.getElementById('reloadDepartmentsBtn');
    if(reloadBtn){ reloadBtn.addEventListener('click', loadDepartments); }

    loadDepartments();
  }

  // Expose globally for menu integration
  window.showDepartmentManagement = showDepartmentManagement;
})();
