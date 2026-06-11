(function () {

    function notify(message, type) {

        if (typeof window.showNotification === 'function') {

            window.showNotification(message, type || 'info');

            return;

        }

        if (typeof window.customAlert === 'function') {

            window.customAlert(message, 'Team Management', type || 'info');

            return;

        }

        alert(message);

    }



    function safeShowContent(html) {

        if (typeof window.showContent === 'function') {

            window.showContent(html);

            return;

        }

        const el = document.getElementById('contentArea');

        if (el) {

            el.innerHTML = html;

        }

    }



    function ensureApiServiceReady(retryFn) {

        if (!window.apiService || typeof window.apiService.get !== 'function') {

            setTimeout(retryFn, 1000);

            return false;

        }

        return true;

    }



    function unwrapArrayResponse(resp) {

        if (Array.isArray(resp)) return resp;

        if (resp && Array.isArray(resp.data)) return resp.data;

        if (resp && resp.success && Array.isArray(resp.data)) return resp.data;

        if (resp && resp.success && Array.isArray(resp.teams)) return resp.teams;

        return [];

    }



    function unwrapObjectResponse(resp) {

        if (!resp) return null;

        if (resp.success && resp.data) return resp.data;

        if (resp.data) return resp.data;

        return resp;

    }



    let cachedEmployees = null;

    let cachedTeams = [];



    async function fetchEmployees() {

        if (cachedEmployees) return cachedEmployees;

        const resp = await window.apiService.get('/employees');

        const employees = Array.isArray(resp) ? resp : (resp && resp.data && Array.isArray(resp.data) ? resp.data : []);

        cachedEmployees = employees;

        return employees;

    }



    function employeeDisplayName(e) {

        if (!e) return 'Unknown';

        return e.full_name || e.fullName || e.name || e.gmail || e.email || `Employee ${e.id}`;

    }



    function teamStatusBadge(status) {

        const s = (status || 'Active').toString();

        const cls = s.toLowerCase() === 'active' ? 'active' : 'inactive';

        return `<span class="status ${cls}">${s}</span>`;

    }



    async function loadTeams() {

        const resp = await window.apiService.get('/team-management/teams');

        const teams = unwrapArrayResponse(resp);

        cachedTeams = teams;

        return teams;

    }



    function renderTeamsTable(teams) {

        const tbody = document.getElementById('teamManagementTableBody');

        if (!tbody) return;



        if (!Array.isArray(teams) || teams.length === 0) {

            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">No teams found</td></tr>';

            return;

        }



        tbody.innerHTML = teams.map(t => {

            const memberCount = (t.member_count !== undefined && t.member_count !== null) ? t.member_count : '';

            const leader = t.leader_name || '—';

            const dept = t.department || '—';

            const desc = t.description ? String(t.description).slice(0, 80) : '—';



            return `

                <tr>

                    <td>${t.id}</td>

                    <td>${t.name || '—'}</td>

                    <td>${dept}</td>

                    <td>${leader}</td>

                    <td style="text-align:center;">${memberCount}</td>

                    <td>${teamStatusBadge(t.status)}</td>

                    <td>${desc}</td>

                    <td>

                        <button class="btn btn-secondary" onclick="showTeamMembers(${t.id})">Members</button>

                        <button class="btn btn-primary" onclick="showEditTeamForm(${t.id})">Edit</button>

                        <button class="btn btn-danger" onclick="deleteTeam(${t.id})">Delete</button>

                    </td>

                </tr>

            `;

        }).join('');

    }



    function applyTeamFilters() {

        const search = (document.getElementById('teamSearch')?.value || '').toLowerCase();

        const status = (document.getElementById('teamStatusFilter')?.value || '');



        const filtered = (cachedTeams || []).filter(t => {

            const name = (t.name || '').toLowerCase();

            const dept = (t.department || '').toLowerCase();

            const leader = (t.leader_name || '').toLowerCase();

            const statusOk = !status || (String(t.status || '').toLowerCase() === status.toLowerCase());

            const searchOk = !search || name.includes(search) || dept.includes(search) || leader.includes(search);

            return statusOk && searchOk;

        });



        renderTeamsTable(filtered);

    }



    async function refreshTeamDashboard() {

        try {

            const teams = await loadTeams();

            renderTeamsTable(teams);

            applyTeamFilters();

        } catch (error) {

            console.error('Error loading teams:', error);

            notify('Error loading teams. Please try again.', 'error');

            const tbody = document.getElementById('teamManagementTableBody');

            if (tbody) {

                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#dc3545;">${error.message || 'Failed to load teams'}</td></tr>`;

            }

        }

    }



    window.showTeamManagementDashboard = function showTeamManagementDashboard() {

        if (!ensureApiServiceReady(window.showTeamManagementDashboard)) return;



        safeShowContent(`

            <div class="card">

                <h3>Team Management</h3>

                <div style="display:flex;gap:10px;flex-wrap:wrap;margin:15px 0;align-items:center;">

                    <button class="btn btn-primary" onclick="showCreateTeamForm()">Create Team</button>

                    <button class="btn btn-secondary" onclick="refreshTeamDashboard()">Refresh</button>



                    <input id="teamSearch" type="text" placeholder="Search teams..." style="padding:8px;min-width:220px;">



                    <select id="teamStatusFilter" style="padding:8px;">

                        <option value="">All Status</option>

                        <option value="Active">Active</option>

                        <option value="Inactive">Inactive</option>

                    </select>

                </div>



                <div class="table-wrapper" style="overflow-x:auto;">

                    <table class="data-table" style="width:100%;">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Team Name</th>

                                <th>Department</th>

                                <th>Leader</th>

                                <th style="text-align:center;">Members</th>

                                <th>Status</th>

                                <th>Description</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody id="teamManagementTableBody">

                            <tr><td colspan="8" style="text-align:center;padding:20px;">Loading teams...</td></tr>

                        </tbody>

                    </table>

                </div>

            </div>

        `);



        setTimeout(() => {

            const searchEl = document.getElementById('teamSearch');

            if (searchEl) searchEl.addEventListener('input', applyTeamFilters);



            const statusEl = document.getElementById('teamStatusFilter');

            if (statusEl) statusEl.addEventListener('change', applyTeamFilters);



            refreshTeamDashboard();

        }, 50);

    };



    window.refreshTeamDashboard = refreshTeamDashboard;



    window.showCreateTeamForm = async function showCreateTeamForm() {

        if (!ensureApiServiceReady(window.showCreateTeamForm)) return;



        let employees = [];

        try {

            employees = await fetchEmployees();

        } catch (e) {

            console.error('Error loading employees for team form:', e);

        }



        const overlayId = `teamFormOverlay_${Date.now()}`;



        const optionsHtml = [`<option value="">Select Leader (optional)</option>`]

            .concat((employees || []).map(e => `<option value="${e.id}">${employeeDisplayName(e)}</option>`))

            .join('');



        const formHTML = `

            <div class="form-overlay" id="${overlayId}">

                <div class="form-container">

                    <div class="form-header">

                        <h3>Create Team</h3>

                        <button type="button" class="close-btn" onclick="closeTeamOverlay('${overlayId}')">&times;</button>

                    </div>

                    <form id="teamCreateForm">

                        <div class="form-group">

                            <label for="teamName">Team Name:</label>

                            <input type="text" id="teamName" required>

                        </div>

                        <div class="form-group">

                            <label for="teamDepartment">Department:</label>

                            <input type="text" id="teamDepartment" placeholder="e.g. Projects, Finance">

                        </div>

                        <div class="form-group">

                            <label for="teamLeader">Team Leader:</label>

                            <select id="teamLeader">${optionsHtml}</select>

                        </div>

                        <div class="form-group">

                            <label for="teamStatus">Status:</label>

                            <select id="teamStatus">

                                <option value="Active" selected>Active</option>

                                <option value="Inactive">Inactive</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="teamDescription">Description:</label>

                            <textarea id="teamDescription" rows="3" placeholder="Team purpose, scope, responsibilities..."></textarea>

                        </div>

                        <div class="form-actions">

                            <button type="submit" class="btn btn-primary">Save</button>

                            <button type="button" class="btn btn-secondary" onclick="closeTeamOverlay('${overlayId}')">Cancel</button>

                        </div>

                    </form>

                </div>

            </div>

        `;



        document.body.insertAdjacentHTML('beforeend', formHTML);



        setTimeout(() => {

            const form = document.getElementById('teamCreateForm');

            if (!form) return;



            form.addEventListener('submit', async (e) => {

                e.preventDefault();



                const payload = {

                    name: document.getElementById('teamName')?.value?.trim(),

                    department: document.getElementById('teamDepartment')?.value?.trim() || null,

                    leaderEmployeeId: document.getElementById('teamLeader')?.value ? Number(document.getElementById('teamLeader').value) : null,

                    status: document.getElementById('teamStatus')?.value || 'Active',

                    description: document.getElementById('teamDescription')?.value?.trim() || null

                };



                if (!payload.name) {

                    notify('Team name is required', 'error');

                    return;

                }



                try {

                    const btn = form.querySelector('button[type="submit"]');

                    if (btn) {

                        btn.disabled = true;

                        btn.textContent = 'Saving...';

                    }



                    const resp = await window.apiService.post('/team-management/teams', payload);

                    const created = unwrapObjectResponse(resp);



                    notify('Team created successfully', 'success');

                    closeTeamOverlay(overlayId);

                    await refreshTeamDashboard();



                    if (created && created.id) {

                        setTimeout(() => {

                            if (confirm('Do you want to add members to this team now?')) {

                                window.showTeamMembers(created.id);

                            }

                        }, 50);

                    }



                } catch (error) {

                    console.error('Error creating team:', error);

                    notify(error.message || 'Failed to create team', 'error');

                } finally {

                    const btn = form.querySelector('button[type="submit"]');

                    if (btn) {

                        btn.disabled = false;

                        btn.textContent = 'Save';

                    }

                }

            });

        }, 50);

    };



    window.showEditTeamForm = async function showEditTeamForm(teamId) {

        if (!ensureApiServiceReady(() => window.showEditTeamForm(teamId))) return;



        let team = null;

        try {

            const resp = await window.apiService.get(`/team-management/teams/${teamId}`);

            team = unwrapObjectResponse(resp);

        } catch (error) {

            console.error('Error loading team:', error);

            notify('Failed to load team details', 'error');

            return;

        }



        let employees = [];

        try {

            employees = await fetchEmployees();

        } catch (e) {

            console.error('Error loading employees for team edit form:', e);

        }



        const overlayId = `teamEditOverlay_${Date.now()}`;



        const optionsHtml = [`<option value="">Select Leader (optional)</option>`]

            .concat((employees || []).map(e => {

                const selected = team && team.leader_employee_id === e.id ? 'selected' : '';

                return `<option value="${e.id}" ${selected}>${employeeDisplayName(e)}</option>`;

            }))

            .join('');



        const formHTML = `

            <div class="form-overlay" id="${overlayId}">

                <div class="form-container">

                    <div class="form-header">

                        <h3>Edit Team</h3>

                        <button type="button" class="close-btn" onclick="closeTeamOverlay('${overlayId}')">&times;</button>

                    </div>

                    <form id="teamEditForm">

                        <div class="form-group">

                            <label for="teamEditName">Team Name:</label>

                            <input type="text" id="teamEditName" required value="${(team && team.name) ? String(team.name).replace(/"/g, '&quot;') : ''}">

                        </div>

                        <div class="form-group">

                            <label for="teamEditDepartment">Department:</label>

                            <input type="text" id="teamEditDepartment" value="${(team && team.department) ? String(team.department).replace(/"/g, '&quot;') : ''}">

                        </div>

                        <div class="form-group">

                            <label for="teamEditLeader">Team Leader:</label>

                            <select id="teamEditLeader">${optionsHtml}</select>

                        </div>

                        <div class="form-group">

                            <label for="teamEditStatus">Status:</label>

                            <select id="teamEditStatus">

                                <option value="Active" ${(team && team.status === 'Active') ? 'selected' : ''}>Active</option>

                                <option value="Inactive" ${(team && team.status === 'Inactive') ? 'selected' : ''}>Inactive</option>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="teamEditDescription">Description:</label>

                            <textarea id="teamEditDescription" rows="3">${(team && team.description) ? String(team.description) : ''}</textarea>

                        </div>

                        <div class="form-actions">

                            <button type="submit" class="btn btn-primary">Update</button>

                            <button type="button" class="btn btn-secondary" onclick="closeTeamOverlay('${overlayId}')">Cancel</button>

                        </div>

                    </form>

                </div>

            </div>

        `;



        document.body.insertAdjacentHTML('beforeend', formHTML);



        setTimeout(() => {

            const form = document.getElementById('teamEditForm');

            if (!form) return;



            form.addEventListener('submit', async (e) => {

                e.preventDefault();



                const payload = {

                    name: document.getElementById('teamEditName')?.value?.trim(),

                    department: document.getElementById('teamEditDepartment')?.value?.trim() || null,

                    leaderEmployeeId: document.getElementById('teamEditLeader')?.value ? Number(document.getElementById('teamEditLeader').value) : null,

                    status: document.getElementById('teamEditStatus')?.value || 'Active',

                    description: document.getElementById('teamEditDescription')?.value?.trim() || null

                };



                if (!payload.name) {

                    notify('Team name is required', 'error');

                    return;

                }



                try {

                    const btn = form.querySelector('button[type="submit"]');

                    if (btn) {

                        btn.disabled = true;

                        btn.textContent = 'Updating...';

                    }



                    await window.apiService.put(`/team-management/teams/${teamId}`, payload);



                    notify('Team updated successfully', 'success');

                    closeTeamOverlay(overlayId);

                    await refreshTeamDashboard();



                } catch (error) {

                    console.error('Error updating team:', error);

                    notify(error.message || 'Failed to update team', 'error');

                } finally {

                    const btn = form.querySelector('button[type="submit"]');

                    if (btn) {

                        btn.disabled = false;

                        btn.textContent = 'Update';

                    }

                }

            });

        }, 50);

    };



    window.deleteTeam = async function deleteTeam(teamId) {

        if (!ensureApiServiceReady(() => window.deleteTeam(teamId))) return;



        if (!confirm('Delete this team? This will also remove all team members.')) return;



        try {

            await window.apiService.delete(`/team-management/teams/${teamId}`);

            notify('Team deleted successfully', 'success');

            await refreshTeamDashboard();

        } catch (error) {

            console.error('Error deleting team:', error);

            notify(error.message || 'Failed to delete team', 'error');

        }

    };



    window.closeTeamOverlay = function closeTeamOverlay(overlayId) {

        const el = document.getElementById(overlayId);

        if (el) el.remove();

    };



    async function loadTeamMembers(teamId) {

        const resp = await window.apiService.get(`/team-management/teams/${teamId}/members`);

        return unwrapArrayResponse(resp);

    }



    function renderTeamMembersTable(members) {

        const tbody = document.getElementById('teamMembersTableBody');

        if (!tbody) return;



        if (!Array.isArray(members) || members.length === 0) {

            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No members yet</td></tr>';

            return;

        }



        tbody.innerHTML = members.map(m => {

            const name = m.full_name || `Employee ${m.employee_id}`;

            const role = m.member_role || 'Member';

            const status = m.status || 'Active';



            return `

                <tr>

                    <td>${m.id}</td>

                    <td>${name}</td>

                    <td>${m.department || '—'}</td>

                    <td>${m.position || '—'}</td>

                    <td>${role}</td>

                    <td>${teamStatusBadge(status)}</td>

                    <td>

                        <button class="btn btn-secondary" onclick="editTeamMember(${m.team_id}, ${m.id}, '${String(role).replace(/'/g, "\\'")}', '${String(status).replace(/'/g, "\\'")}')">Edit</button>

                        <button class="btn btn-danger" onclick="removeTeamMember(${m.team_id}, ${m.id})">Remove</button>

                    </td>

                </tr>

            `;

        }).join('');

    }



    window.showTeamMembers = async function showTeamMembers(teamId) {

        if (!ensureApiServiceReady(() => window.showTeamMembers(teamId))) return;



        let team = cachedTeams.find(t => Number(t.id) === Number(teamId));

        if (!team) {

            try {

                const resp = await window.apiService.get(`/team-management/teams/${teamId}`);

                team = unwrapObjectResponse(resp);

            } catch (e) {

                console.error('Error loading team details for members:', e);

            }

        }



        let employees = [];

        try {

            employees = await fetchEmployees();

        } catch (e) {

            console.error('Error loading employees for members modal:', e);

        }



        const overlayId = `teamMembersOverlay_${Date.now()}`;



        const overlayHTML = `

            <div class="form-overlay" id="${overlayId}">

                <div class="form-container" style="max-width: 900px;">

                    <div class="form-header">

                        <h3>Team Members - ${(team && team.name) ? team.name : 'Team'}</h3>

                        <button type="button" class="close-btn" onclick="closeTeamOverlay('${overlayId}')">&times;</button>

                    </div>



                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">

                        <button class="btn btn-secondary" onclick="reloadTeamMembers(${teamId})">Refresh Members</button>

                    </div>



                    <div class="table-wrapper" style="overflow-x:auto;">

                        <table class="data-table" style="width:100%;">

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>Name</th>

                                    <th>Department</th>

                                    <th>Position</th>

                                    <th>Role</th>

                                    <th>Status</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody id="teamMembersTableBody">

                                <tr><td colspan="7" style="text-align:center;padding:20px;">Loading members...</td></tr>

                            </tbody>

                        </table>

                    </div>



                    <hr style="margin: 15px 0;">



                    <form id="addTeamMemberForm">

                        <h4 style="margin-bottom:10px;">Add Member</h4>



                        <div class="form-group">

                            <label for="teamMemberEmployee">Employee:</label>

                            <select id="teamMemberEmployee" required></select>

                        </div>



                        <div class="form-group">

                            <label for="teamMemberRole">Member Role:</label>

                            <input type="text" id="teamMemberRole" placeholder="e.g. Supervisor, Engineer, Foreman">

                        </div>



                        <div class="form-group">

                            <label for="teamMemberStatus">Status:</label>

                            <select id="teamMemberStatus">

                                <option value="Active" selected>Active</option>

                                <option value="Inactive">Inactive</option>

                            </select>

                        </div>



                        <div class="form-actions">

                            <button type="submit" class="btn btn-primary">Add Member</button>

                            <button type="button" class="btn btn-secondary" onclick="closeTeamOverlay('${overlayId}')">Close</button>

                        </div>

                    </form>

                </div>

            </div>

        `;



        document.body.insertAdjacentHTML('beforeend', overlayHTML);



        async function populateEmployeeDropdown() {

            const select = document.getElementById('teamMemberEmployee');

            if (!select) return;



            let members = [];

            try {

                members = await loadTeamMembers(teamId);

            } catch {

                members = [];

            }



            const memberEmployeeIds = new Set((members || []).map(m => Number(m.employee_id)));



            const availableEmployees = (employees || []).filter(e => !memberEmployeeIds.has(Number(e.id)));



            select.innerHTML = ['<option value="">Select Employee</option>']

                .concat(availableEmployees.map(e => `<option value="${e.id}">${employeeDisplayName(e)}</option>`))

                .join('');

        }



        setTimeout(async () => {

            await reloadTeamMembers(teamId);

            await populateEmployeeDropdown();



            const form = document.getElementById('addTeamMemberForm');

            if (!form) return;



            form.addEventListener('submit', async (e) => {

                e.preventDefault();



                const employeeId = document.getElementById('teamMemberEmployee')?.value;

                const memberRole = document.getElementById('teamMemberRole')?.value?.trim() || null;

                const status = document.getElementById('teamMemberStatus')?.value || 'Active';



                if (!employeeId) {

                    notify('Please select an employee', 'error');

                    return;

                }



                try {

                    const btn = form.querySelector('button[type="submit"]');

                    if (btn) {

                        btn.disabled = true;

                        btn.textContent = 'Adding...';

                    }



                    await window.apiService.post(`/team-management/teams/${teamId}/members`, {

                        employeeId: Number(employeeId),

                        memberRole,

                        status

                    });



                    notify('Member added successfully', 'success');

                    document.getElementById('teamMemberEmployee').value = '';

                    document.getElementById('teamMemberRole').value = '';

                    document.getElementById('teamMemberStatus').value = 'Active';



                    await reloadTeamMembers(teamId);

                    await populateEmployeeDropdown();

                    await refreshTeamDashboard();



                } catch (error) {

                    console.error('Error adding member:', error);

                    notify(error.message || 'Failed to add member', 'error');

                } finally {

                    const btn = form.querySelector('button[type="submit"]');

                    if (btn) {

                        btn.disabled = false;

                        btn.textContent = 'Add Member';

                    }

                }

            });

        }, 50);

    };



    window.reloadTeamMembers = async function reloadTeamMembers(teamId) {

        if (!ensureApiServiceReady(() => window.reloadTeamMembers(teamId))) return;



        try {

            const members = await loadTeamMembers(teamId);

            renderTeamMembersTable(members);

        } catch (error) {

            console.error('Error loading members:', error);

            const tbody = document.getElementById('teamMembersTableBody');

            if (tbody) {

                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#dc3545;">${error.message || 'Failed to load members'}</td></tr>`;

            }

        }

    };



    window.removeTeamMember = async function removeTeamMember(teamId, memberId) {

        if (!ensureApiServiceReady(() => window.removeTeamMember(teamId, memberId))) return;



        if (!confirm('Remove this member from the team?')) return;



        try {

            await window.apiService.delete(`/team-management/teams/${teamId}/members/${memberId}`);

            notify('Member removed successfully', 'success');

            await reloadTeamMembers(teamId);

            await refreshTeamDashboard();

        } catch (error) {

            console.error('Error removing team member:', error);

            notify(error.message || 'Failed to remove member', 'error');

        }

    };



    window.editTeamMember = async function editTeamMember(teamId, memberId, currentRole, currentStatus) {

        if (!ensureApiServiceReady(() => window.editTeamMember(teamId, memberId, currentRole, currentStatus))) return;



        const memberRole = prompt('Member role:', currentRole || 'Member');

        if (memberRole === null) return;



        const status = prompt('Member status (Active/Inactive):', currentStatus || 'Active');

        if (status === null) return;



        const normalizedStatus = (String(status).toLowerCase() === 'inactive') ? 'Inactive' : 'Active';



        try {

            await window.apiService.put(`/team-management/teams/${teamId}/members/${memberId}`, {

                memberRole: memberRole.trim() || null,

                status: normalizedStatus

            });



            notify('Member updated successfully', 'success');

            await reloadTeamMembers(teamId);

            await refreshTeamDashboard();

        } catch (error) {

            console.error('Error updating team member:', error);

            notify(error.message || 'Failed to update member', 'error');

        }

    };



})();
