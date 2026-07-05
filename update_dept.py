import sys
import re

filename = r"c:\Users\USER\Downloads\consultion system\frontend\public\department.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Access Management to MD menu
old_md_line = '"Manage Policies", "Approve Senior Staff Hiring", "User Account Management",'
new_md_line = '"Manage Policies", "Approve Senior Staff Hiring", "User Account Management", "Access Management",'
if old_md_line in content:
    content = content.replace(old_md_line, new_md_line)
else:
    print("Could not find MD menu line to replace")

# 2. Add to menuActionMap
old_map_line = '{ name: "User Account Management", func: () => userAccountManagement() },'
new_map_line = '{ name: "User Account Management", func: () => userAccountManagement() },\n        { name: "Access Management", func: () => accessManagement() },'
if old_map_line in content:
    content = content.replace(old_map_line, new_map_line)
else:
    print("Could not find menuActionMap line to replace")

# 3. Add accessManagement logic
access_management_js = """
// ===== ACCESS MANAGEMENT =====
window.accessManagement = async function() {
    console.log('🔄 Loading access management data...');
    showContent(`
        <div class="card fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Access Management</h3>
                <button class="btn btn-primary" onclick="openAccessModal()">
                    <i class="fas fa-plus"></i> Create New User
                </button>
            </div>
            
            <div class="table-container">
                <table class="data-table" id="accessUsersTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="accessUsersList">
                        <tr><td colspan="8" style="text-align: center;">Loading users...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Access Management Modal -->
        <div id="accessModal" class="modal" style="display:none;">
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="closeAccessModal()">&times;</span>
                <h2 id="accessModalTitle">Create New User</h2>
                <form id="accessForm" onsubmit="submitAccessForm(event)">
                    <input type="hidden" id="accessUserId">
                    
                    <div class="form-group">
                        <label for="accessName">Manager / User Name</label>
                        <input type="text" id="accessName" class="form-control" required placeholder="e.g. John Doe">
                    </div>
                    
                    <div class="form-group">
                        <label for="accessEmail">Email</label>
                        <input type="email" id="accessEmail" class="form-control" required placeholder="e.g. user@kashtec.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="accessPassword">Password <small id="accessPasswordHint" style="display:none; color: #888;">(Leave blank to keep current password)</small></label>
                        <input type="password" id="accessPassword" class="form-control" placeholder="Enter password">
                    </div>
                    
                    <div class="form-group">
                        <label for="accessRole">Role</label>
                        <select id="accessRole" class="form-control" required>
                            <option value="">Select Role</option>
                            <option value="Managing Director">Managing Director</option>
                            <option value="HSE Manager">HSE Manager</option>
                            <option value="HR Manager">HR Manager</option>
                            <option value="Finance Manager">Finance Manager</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Operations Manager">Operations Manager</option>
                            <option value="Real Estate Manager">Real Estate Manager</option>
                            <option value="Admin Assistant">Admin Assistant</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Auditor">Auditor</option>
                            <option value="Tax Manager">Tax Manager</option>
                            <option value="Worker">Worker</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="accessDepartment">Department</label>
                        <select id="accessDepartment" class="form-control">
                            <option value="">Select Department</option>
                            <option value="Managing Director">Managing Director</option>
                            <option value="HSE">HSE</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Project">Project</option>
                            <option value="Operations">Operations</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="Administration">Administration</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="accessStatus">Status</label>
                        <select id="accessStatus" class="form-control" required>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                    
                    <div class="form-actions" style="margin-top: 20px; text-align: right;">
                        <button type="button" class="btn btn-secondary" onclick="closeAccessModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="accessSubmitBtn">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    `);
    
    await fetchAccessUsers();
};

window.fetchAccessUsers = async function() {
    try {
        const token = sessionManager.getAuthToken();
        const res = await fetch('/api/auth/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch users');
        const users = await res.json();
        
        const tbody = document.getElementById('accessUsersList');
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.manager_name || '-'}</td>
                <td>${u.email}</td>
                <td><span class="status-badge" style="background: #3b82f620; color: #3b82f6;">${u.role}</span></td>
                <td>${u.department_name || '-'}</td>
                <td>
                    <span class="status-badge ${u.status === 'Active' ? 'success' : 'danger'}">
                        ${u.status || 'Active'}
                    </span>
                </td>
                <td>${u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                <td>
                    <button class="btn btn-small" onclick='openAccessModal(${JSON.stringify(u).replace(/'/g, "&#39;")})' style="background: #e2e8f0; color: #0f172a; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${u.status === 'Active' 
                        ? `<button class="btn btn-small btn-danger" onclick="suspendAccessUser(${u.id})" style="padding: 4px 8px; border-radius: 4px; font-size: 12px;">Disable</button>`
                        : ''}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById('accessUsersList');
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${err.message}</td></tr>`;
    }
};

window.openAccessModal = function(user = null) {
    const modal = document.getElementById('accessModal');
    const form = document.getElementById('accessForm');
    const hint = document.getElementById('accessPasswordHint');
    
    form.reset();
    
    if (user) {
        document.getElementById('accessModalTitle').textContent = 'Edit User';
        document.getElementById('accessUserId').value = user.id;
        document.getElementById('accessName').value = user.manager_name || '';
        document.getElementById('accessEmail').value = user.email || '';
        document.getElementById('accessRole').value = user.role || '';
        document.getElementById('accessDepartment').value = user.department_name || '';
        document.getElementById('accessStatus').value = user.status || 'Active';
        document.getElementById('accessPassword').required = false;
        hint.style.display = 'inline';
    } else {
        document.getElementById('accessModalTitle').textContent = 'Create New User';
        document.getElementById('accessUserId').value = '';
        document.getElementById('accessPassword').required = true;
        hint.style.display = 'none';
    }
    
    modal.style.display = 'flex';
};

window.closeAccessModal = function() {
    document.getElementById('accessModal').style.display = 'none';
};

window.submitAccessForm = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('accessSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    const id = document.getElementById('accessUserId').value;
    const payload = {
        manager_name: document.getElementById('accessName').value,
        email: document.getElementById('accessEmail').value,
        role: document.getElementById('accessRole').value,
        department_name: document.getElementById('accessDepartment').value,
        status: document.getElementById('accessStatus').value,
        password: document.getElementById('accessPassword').value
    };
    
    try {
        const token = sessionManager.getAuthToken();
        const url = id ? `/api/auth/users/${id}` : '/api/auth/users';
        const method = id ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save user');
        
        closeAccessModal();
        alert('User saved successfully!');
        await fetchAccessUsers();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save User';
    }
};

window.suspendAccessUser = async function(id) {
    if (!confirm('Are you sure you want to disable this user account?')) return;
    
    try {
        const token = sessionManager.getAuthToken();
        const res = await fetch(`/api/auth/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to disable user');
        }
        
        await fetchAccessUsers();
    } catch (err) {
        alert(err.message);
    }
};

// End Access Management
"""

# Inject before the very last </script> tag
if "</script>\n\n</body>" in content:
    content = content.replace("</script>\n\n</body>", f"{access_management_js}\n</script>\n\n</body>")
elif "</script>\n</body>" in content:
    content = content.replace("</script>\n</body>", f"{access_management_js}\n</script>\n</body>")
else:
    # Fallback, just append before </body>
    content = content.replace("</body>", f"<script>\n{access_management_js}\n</script>\n</body>")

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("department.html updated with accessManagement.")
