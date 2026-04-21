// ===== ENHANCED PROJECT MANAGEMENT DEPARTMENT =====
class ProjectDepartment {
    constructor() {
        this.currentProjects = [];
        this.resources = [];
        this.schedule = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Project Department initialized with enhanced features');
    }

    // Enhanced Project Management
    async loadProjects() {
        try {
            const result = await window.ApiService.getProjects();
            if (result.success) {
                this.currentProjects = result.data;
                this.renderProjects();
            }
        } catch (error) {
            console.error('Load projects error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    renderProjects() {
        const container = document.getElementById('contentArea');
        if (!container) return;

        let html = `
            <div class="card">
                <h3>Project Management Dashboard</h3>
                <p><strong>Project Authority:</strong> Manage all construction projects, resources, and schedules</p>
                
                <div class="project-controls">
                    <div class="control-row">
                        <button class="action" onclick="ProjectDepartment.showCreateProject()">Create New Project</button>
                        <button class="action" onclick="ProjectDepartment.showResourceManagement()">Manage Resources</button>
                        <button class="action" onclick="ProjectDepartment.showSchedule()">Project Schedule</button>
                        <button class="action" onclick="ProjectDepartment.showQualityControl()">Quality Control</button>
                    </div>
                    
                    <div class="filter-controls">
                        <select id="projectStatusFilter" onchange="ProjectDepartment.filterProjects()">
                            <option value="">All Projects</option>
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                        
                        <select id="projectPriorityFilter" onchange="ProjectDepartment.filterProjects()">
                            <option value="">All Priorities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        
                        <input type="text" placeholder="Search projects..." id="projectSearch" onkeyup="ProjectDepartment.filterProjects()">
                    </div>
                </div>
                
                <div class="project-stats">
                    <div class="stat-card">
                        <h4>Total Projects</h4>
                        <div class="stat-value">${this.currentProjects.length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Active Projects</h4>
                        <div class="stat-value">${this.currentProjects.filter(p => p.status === 'active').length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>On Schedule</h4>
                        <div class="stat-value">${this.currentProjects.filter(p => p.onSchedule).length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Over Budget</h4>
                        <div class="stat-value">${this.currentProjects.filter(p => p.overBudget).length}</div>
                    </div>
                </div>
                
                <div class="project-list">
                    <h4>Active Projects</h4>
                    ${this.generateProjectList()}
                </div>
                
                <div class="project-timeline">
                    <h4>Project Timeline</h4>
                    <canvas id="projectTimeline" width="800" height="300"></canvas>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    generateProjectList() {
        return this.currentProjects.map(project => `
            <div class="project-card ${project.status}" data-id="${project.id}">
                <div class="project-header">
                    <div class="project-info">
                        <h5>${project.name}</h5>
                        <span class="project-id">${project.id}</span>
                    </div>
                    <div class="project-meta">
                        <span class="status-badge ${project.status}">${project.status.toUpperCase()}</span>
                        <span class="priority-badge ${project.priority}">${project.priority.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="project-details">
                    <p><strong>Client:</strong> ${project.client}</p>
                    <p><strong>Location:</strong> ${project.location}</p>
                    <p><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleDateString()}</p>
                    <p><strong>Expected Completion:</strong> ${new Date(project.endDate).toLocaleDateString()}</p>
                    <p><strong>Budget:</strong> $${project.budget.toLocaleString()}</p>
                    <p><strong>Progress:</strong> ${project.progress}%</p>
                </div>
                
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                    <span class="progress-text">${project.progress}% Complete</span>
                </div>
                
                <div class="project-team">
                    <h6>Team Members:</h6>
                    <div class="team-members">
                        ${project.team.map(member => `
                            <div class="team-member">
                                <img src="${member.avatar}" alt="${member.name}">
                                <span>${member.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="action" onclick="ProjectDepartment.viewProjectDetails('${project.id}')">View Details</button>
                    <button class="action" onclick="ProjectDepartment.editProject('${project.id}')">Edit Project</button>
                    <button class="action" onclick="ProjectDepartment.showProjectReports('${project.id}')">Reports</button>
                    <button class="action" onclick="ProjectDepartment.manageProjectTeam('${project.id}')">Manage Team</button>
                </div>
            </div>
        `).join('');
    }

    showCreateProject() {
        FormManager.showCustomForm(
            'Create New Project',
            [
                { name: 'name', type: 'text', label: 'Project Name', required: true },
                { name: 'client', type: 'text', label: 'Client Name', required: true },
                { name: 'location', type: 'text', label: 'Project Location', required: true },
                { name: 'startDate', type: 'date', label: 'Start Date', required: true },
                { name: 'endDate', type: 'date', label: 'Expected Completion', required: true },
                { name: 'budget', type: 'number', label: 'Budget', required: true },
                { name: 'priority', type: 'select', label: 'Priority', required: true, options: [
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                ]},
                { name: 'description', type: 'textarea', label: 'Project Description' },
                { name: 'projectManager', type: 'select', label: 'Project Manager', options: [
                    { value: 'pm1', label: 'John Smith' },
                    { value: 'pm2', label: 'Sarah Johnson' },
                    { value: 'pm3', label: 'Mike Wilson' }
                ]}
            ],
            async (data) => {
                try {
                    const result = await window.ApiService.createProject(data);
                    if (result.success) {
                        NotificationManager.show('Project created successfully!', 'success', 'Project Created');
                        this.loadProjects();
                    }
                } catch (error) {
                    NotificationManager.show(error.message, 'error', 'Creation Error');
                }
            }
        );
    }

    showResourceManagement() {
        UIController.showContent(`
            <div class="card">
                <h3>Resource Management</h3>
                <p><strong>Resource Authority:</strong> Manage equipment, materials, and human resources</p>
                
                <div class="resource-tabs">
                    <button class="tab-btn active" onclick="ProjectDepartment.showResourceTab('equipment')">Equipment</button>
                    <button class="tab-btn" onclick="ProjectDepartment.showResourceTab('materials')">Materials</button>
                    <button class="tab-btn" onclick="ProjectDepartment.showResourceTab('personnel')">Personnel</button>
                    <button class="tab-btn" onclick="ProjectDepartment.showResourceTab('vehicles')">Vehicles</button>
                </div>
                
                <div id="equipmentTab" class="tab-content active">
                    ${this.generateEquipmentList()}
                </div>
                
                <div id="materialsTab" class="tab-content">
                    ${this.generateMaterialsList()}
                </div>
                
                <div id="personnelTab" class="tab-content">
                    ${this.generatePersonnelList()}
                </div>
                
                <div id="vehiclesTab" class="tab-content">
                    ${this.generateVehiclesList()}
                </div>
                
                <div class="resource-actions">
                    <button class="action" onclick="ProjectDepartment.allocateResource()">Allocate Resource</button>
                    <button class="action" onclick="ProjectDepartment.requestResource()">Request Resource</button>
                    <button class="action" onclick="ProjectDepartment.maintenanceSchedule()">Maintenance Schedule</button>
                </div>
            </div>
        `);
    }

    generateEquipmentList() {
        const equipment = [
            { id: 'EQ001', name: 'Excavator CAT 320', status: 'available', location: 'Main Yard', condition: 'Good' },
            { id: 'EQ002', name: 'Concrete Mixer', status: 'in-use', location: 'Project A', condition: 'Good' },
            { id: 'EQ003', name: 'Crane 25 Ton', status: 'maintenance', location: 'Workshop', condition: 'Needs Service' },
            { id: 'EQ004', name: 'Bulldozer D6', status: 'available', location: 'Main Yard', condition: 'Excellent' }
        ];

        return `
            <h4>Equipment Inventory</h4>
            <div class="equipment-grid">
                ${equipment.map(item => `
                    <div class="equipment-card ${item.status}">
                        <div class="equipment-header">
                            <h5>${item.name}</h5>
                            <span class="equipment-id">${item.id}</span>
                        </div>
                        <div class="equipment-details">
                            <p><strong>Status:</strong> <span class="status-badge ${item.status}">${item.status}</span></p>
                            <p><strong>Location:</strong> ${item.location}</p>
                            <p><strong>Condition:</strong> ${item.condition}</p>
                        </div>
                        <div class="equipment-actions">
                            <button class="action" onclick="ProjectDepartment.viewEquipmentDetails('${item.id}')">Details</button>
                            <button class="action" onclick="ProjectDepartment.allocateEquipment('${item.id}')">Allocate</button>
                            ${item.status === 'maintenance' ? 
                                `<button class="action" onclick="ProjectDepartment.scheduleMaintenance('${item.id}')">Schedule Service</button>` : 
                                `<button class="action" onclick="ProjectDepartment.requestMaintenance('${item.id}')">Request Maintenance</button>`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showSchedule() {
        UIController.showContent(`
            <div class="card">
                <h3>Project Schedule</h3>
                <p><strong>Schedule Authority:</strong> Manage project timelines and milestones</p>
                
                <div class="schedule-controls">
                    <div class="view-controls">
                        <button class="action" onclick="ProjectDepartment.changeScheduleView('month')">Month View</button>
                        <button class="action" onclick="ProjectDepartment.changeScheduleView('week')">Week View</button>
                        <button class="action" onclick="ProjectDepartment.changeScheduleView('day')">Day View</button>
                        <button class="action" onclick="ProjectDepartment.changeScheduleView('gantt')">Gantt Chart</button>
                    </div>
                    
                    <div class="date-navigator">
                        <button class="action" onclick="ProjectDepartment.previousPeriod()">← Previous</button>
                        <span id="currentPeriod">March 2026</span>
                        <button class="action" onclick="ProjectDepartment.nextPeriod()">Next →</button>
                    </div>
                </div>
                
                <div class="schedule-calendar">
                    ${this.generateCalendarView()}
                </div>
                
                <div class="milestone-tracker">
                    <h4>Upcoming Milestones</h4>
                    <div class="milestone-list">
                        <div class="milestone-item critical">
                            <div class="milestone-date">Mar 15, 2026</div>
                            <div class="milestone-info">
                                <h5>Foundation Completion - Project A</h5>
                                <p>Critical milestone for main construction phase</p>
                            </div>
                            <div class="milestone-actions">
                                <button class="action" onclick="ProjectDepartment.updateMilestone('M001')">Update</button>
                            </div>
                        </div>
                        
                        <div class="milestone-item">
                            <div class="milestone-date">Mar 22, 2026</div>
                            <div class="milestone-info">
                                <h5>Material Delivery - Project B</h5>
                                <p>Steel and concrete delivery scheduled</p>
                            </div>
                            <div class="milestone-actions">
                                <button class="action" onclick="ProjectDepartment.updateMilestone('M002')">Update</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="schedule-actions">
                    <button class="action" onclick="ProjectDepartment.addMilestone()">Add Milestone</button>
                    <button class="action" onclick="ProjectDepartment.exportSchedule()">Export Schedule</button>
                    <button class="action" onclick="ProjectDepartment.shareSchedule()">Share Schedule</button>
                </div>
            </div>
        `);
    }

    generateCalendarView() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dates = [];
        
        // Generate calendar days for current month
        for (let i = 1; i <= 31; i++) {
            dates.push(i);
        }

        return `
            <div class="calendar-grid">
                <div class="calendar-header">
                    ${days.map(day => `<div class="day-header">${day}</div>`).join('')}
                </div>
                <div class="calendar-body">
                    ${dates.map(date => `
                        <div class="calendar-day ${date === 7 ? 'today' : ''}" data-date="${date}">
                            <div class="date-number">${date}</div>
                            <div class="day-events">
                                ${date === 5 ? '<div class="event project-a">Project A - Site Visit</div>' : ''}
                                ${date === 7 ? '<div class="event project-b critical">Project B - Deadline</div>' : ''}
                                ${date === 12 ? '<div class="event project-c">Project C - Inspection</div>' : ''}
                                ${date === 15 ? '<div class="event milestone">Foundation Complete</div>' : ''}
                                ${date === 22 ? '<div class="event delivery">Material Delivery</div>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showQualityControl() {
        UIController.showContent(`
            <div class="card">
                <h3>Quality Control</h3>
                <p><strong>Quality Authority:</strong> Ensure project quality standards and compliance</p>
                
                <div class="quality-dashboard">
                    <div class="quality-stats">
                        <div class="stat-card">
                            <h4>Inspections Completed</h4>
                            <div class="stat-value">47</div>
                            <div class="stat-change positive">+12% this month</div>
                        </div>
                        <div class="stat-card">
                            <h4>Quality Score</h4>
                            <div class="stat-value">94.5%</div>
                            <div class="stat-change positive">+2.3% improvement</div>
                        </div>
                        <div class="stat-card">
                            <h4>Defects Found</h4>
                            <div class="stat-value">23</div>
                            <div class="stat-change negative">+5 this week</div>
                        </div>
                        <div class="stat-card">
                            <h4>Compliance Rate</h4>
                            <div class="stat-value">98.2%</div>
                            <div class="stat-change positive">Above target</div>
                        </div>
                    </div>
                    
                    <div class="quality-tabs">
                        <button class="tab-btn active" onclick="ProjectDepartment.showQualityTab('inspections')">Inspections</button>
                        <button class="tab-btn" onclick="ProjectDepartment.showQualityTab('defects')">Defects</button>
                        <button class="tab-btn" onclick="ProjectDepartment.showQualityTab('compliance')">Compliance</button>
                        <button class="tab-btn" onclick="ProjectDepartment.showQualityTab('reports')">Reports</button>
                    </div>
                    
                    <div id="inspectionsTab" class="tab-content active">
                        ${this.generateInspectionsList()}
                    </div>
                    
                    <div id="defectsTab" class="tab-content">
                        ${this.generateDefectsList()}
                    </div>
                    
                    <div id="complianceTab" class="tab-content">
                        ${this.generateComplianceList()}
                    </div>
                    
                    <div id="reportsTab" class="tab-content">
                        ${this.generateQualityReports()}
                    </div>
                </div>
                
                <div class="quality-actions">
                    <button class="action" onclick="ProjectDepartment.scheduleInspection()">Schedule Inspection</button>
                    <button class="action" onclick="ProjectDepartment.reportDefect()">Report Defect</button>
                    <button class="action" onclick="ProjectDepartment.qualityAudit()">Quality Audit</button>
                    <button class="action" onclick="ProjectDepartment.generateQualityReport()">Generate Report</button>
                </div>
            </div>
        `);
    }

    generateInspectionsList() {
        const inspections = [
            { id: 'INS001', project: 'Project A', type: 'Foundation', date: '2026-03-07', status: 'passed', inspector: 'John Smith' },
            { id: 'INS002', project: 'Project B', type: 'Structural', date: '2026-03-06', status: 'failed', inspector: 'Sarah Johnson' },
            { id: 'INS003', project: 'Project C', type: 'Electrical', date: '2026-03-05', status: 'passed', inspector: 'Mike Wilson' }
        ];

        return `
            <h4>Recent Inspections</h4>
            <div class="inspections-table">
                <table>
                    <thead>
                        <tr>
                            <th>Inspection ID</th>
                            <th>Project</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Inspector</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inspections.map(inspection => `
                            <tr>
                                <td>${inspection.id}</td>
                                <td>${inspection.project}</td>
                                <td>${inspection.type}</td>
                                <td>${new Date(inspection.date).toLocaleDateString()}</td>
                                <td>${inspection.inspector}</td>
                                <td><span class="status-badge ${inspection.status}">${inspection.status}</span></td>
                                <td>
                                    <button class="action" onclick="ProjectDepartment.viewInspection('${inspection.id}')">View</button>
                                    <button class="action" onclick="ProjectDepartment.editInspection('${inspection.id}')">Edit</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Utility methods
    filterProjects() {
        const statusFilter = document.getElementById('projectStatusFilter').value;
        const priorityFilter = document.getElementById('projectPriorityFilter').value;
        const searchTerm = document.getElementById('projectSearch').value.toLowerCase();
        
        let filteredProjects = this.currentProjects;
        
        if (statusFilter) {
            filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
        }
        
        if (priorityFilter) {
            filteredProjects = filteredProjects.filter(p => p.priority === priorityFilter);
        }
        
        if (searchTerm) {
            filteredProjects = filteredProjects.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.client.toLowerCase().includes(searchTerm) ||
                p.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Re-render with filtered results
        this.currentProjects = filteredProjects;
        this.renderProjects();
    }

    async viewProjectDetails(projectId) {
        try {
            const project = this.currentProjects.find(p => p.id === projectId);
            if (!project) {
                throw new Error('Project not found');
            }
            
            FormManager.showCustomForm(
                `Project Details - ${project.name}`,
                [
                    { name: 'name', type: 'text', label: 'Project Name', value: project.name, readonly: true },
                    { name: 'client', type: 'text', label: 'Client', value: project.client, readonly: true },
                    { name: 'location', type: 'text', label: 'Location', value: project.location, readonly: true },
                    { name: 'status', type: 'text', label: 'Status', value: project.status, readonly: true },
                    { name: 'progress', type: 'text', label: 'Progress', value: `${project.progress}%`, readonly: true },
                    { name: 'budget', type: 'text', label: 'Budget', value: `$${project.budget.toLocaleString()}`, readonly: true },
                    { name: 'description', type: 'textarea', label: 'Description', value: project.description || '', readonly: true }
                ],
                () => {},
                { showSubmit: false }
            );
        } catch (error) {
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    scheduleInspection() {
        FormManager.showCustomForm(
            'Schedule Quality Inspection',
            [
                { name: 'project', type: 'select', label: 'Project', required: true, options: [
                    { value: 'proj-a', label: 'Project A' },
                    { value: 'proj-b', label: 'Project B' },
                    { value: 'proj-c', label: 'Project C' }
                ]},
                { name: 'type', type: 'select', label: 'Inspection Type', required: true, options: [
                    { value: 'foundation', label: 'Foundation' },
                    { value: 'structural', label: 'Structural' },
                    { value: 'electrical', label: 'Electrical' },
                    { value: 'plumbing', label: 'Plumbing' },
                    { value: 'final', label: 'Final Inspection' }
                ]},
                { name: 'date', type: 'datetime-local', label: 'Inspection Date & Time', required: true },
                { name: 'inspector', type: 'select', label: 'Inspector', required: true, options: [
                    { value: 'inspector1', label: 'John Smith' },
                    { value: 'inspector2', label: 'Sarah Johnson' },
                    { value: 'inspector3', label: 'Mike Wilson' }
                ]},
                { name: 'notes', type: 'textarea', label: 'Special Instructions' }
            ],
            (data) => {
                NotificationManager.show('Inspection scheduled successfully!', 'success', 'Inspection Scheduled');
            }
        );
    }
}

// Export for global use
window.ProjectDepartment = new ProjectDepartment();
