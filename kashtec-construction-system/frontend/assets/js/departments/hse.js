// ===== ENHANCED HSE (HEALTH & SAFETY) DEPARTMENT =====
class HSEDepartment {
    constructor() {
        this.incidents = [];
        this.safetyProcedures = [];
        this.complianceChecks = [];
        this.trainingPrograms = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('HSE Department initialized with enhanced features');
    }

    // Enhanced Incident Management
    async loadIncidents() {
        try {
            const result = await window.ApiService.getIncidents();
            if (result.success) {
                this.incidents = result.data;
                this.renderIncidents();
            }
        } catch (error) {
            console.error('Load incidents error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    renderIncidents() {
        const container = document.getElementById('contentArea');
        if (!container) return;

        let html = `
            <div class="card">
                <h3>Health & Safety Management</h3>
                <p><strong>HSE Authority:</strong> Manage workplace safety, incidents, and compliance</p>
                
                <div class="hse-controls">
                    <div class="control-row">
                        <button class="action" onclick="HSEDepartment.reportIncident()">Report Incident</button>
                        <button class="action" onclick="HSEDepartment.showSafetyProcedures()">Safety Procedures</button>
                        <button class="action" onclick="HSEDepartment.showCompliance()">Compliance Checks</button>
                        <button class="action" onclick="HSEDepartment.showTraining()">Training Programs</button>
                    </div>
                    
                    <div class="filter-controls">
                        <select id="incidentSeverityFilter" onchange="HSEDepartment.filterIncidents()">
                            <option value="">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        
                        <select id="incidentStatusFilter" onchange="HSEDepartment.filterIncidents()">
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        
                        <select id="incidentTypeFilter" onchange="HSEDepartment.filterIncidents()">
                            <option value="">All Types</option>
                            <option value="injury">Injury</option>
                            <option value="near-miss">Near Miss</option>
                            <option value="property">Property Damage</option>
                            <option value="environmental">Environmental</option>
                        </select>
                        
                        <input type="text" placeholder="Search incidents..." id="incidentSearch" onkeyup="HSEDepartment.filterIncidents()">
                    </div>
                </div>
                
                <div class="hse-stats">
                    <div class="stat-card critical">
                        <h4>Critical Incidents</h4>
                        <div class="stat-value">${this.incidents.filter(i => i.severity === 'critical').length}</div>
                    </div>
                    <div class="stat-card high">
                        <h4>High Priority</h4>
                        <div class="stat-value">${this.incidents.filter(i => i.severity === 'high').length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Open Cases</h4>
                        <div class="stat-value">${this.incidents.filter(i => i.status === 'open').length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Resolved This Month</h4>
                        <div class="stat-value">${this.incidents.filter(i => i.resolvedThisMonth).length}</div>
                    </div>
                </div>
                
                <div class="incident-list">
                    <h4>Recent Incidents</h4>
                    ${this.generateIncidentList()}
                </div>
                
                <div class="safety-metrics">
                    <h4>Safety Performance Metrics</h4>
                    <canvas id="safetyMetricsChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    generateIncidentList() {
        const incidents = [
            {
                id: 'INC001',
                title: 'Fall from Scaffolding',
                type: 'injury',
                severity: 'critical',
                status: 'investigating',
                date: '2026-03-07',
                location: 'Project A - Building Site',
                reportedBy: 'John Smith',
                description: 'Worker fell from 2nd floor scaffolding, minor injuries sustained',
                actions: 'Emergency services called, worker transported to hospital'
            },
            {
                id: 'INC002',
                title: 'Near Miss - Falling Tool',
                type: 'near-miss',
                severity: 'medium',
                status: 'resolved',
                date: '2026-03-06',
                location: 'Project B - Construction Zone',
                reportedBy: 'Sarah Johnson',
                description: 'Hammer fell from height but no one was injured',
                actions: 'Tool safety procedures reviewed, additional training conducted'
            },
            {
                id: 'INC003',
                title: 'Chemical Spill',
                type: 'environmental',
                severity: 'high',
                status: 'open',
                date: '2026-03-05',
                location: 'Storage Area - Site C',
                reportedBy: 'Mike Wilson',
                description: 'Small chemical spill in storage area, contained immediately',
                actions: 'Area secured, cleanup initiated, investigation ongoing'
            }
        ];

        return incidents.map(incident => `
            <div class="incident-card ${incident.severity}" data-id="${incident.id}">
                <div class="incident-header">
                    <div class="incident-info">
                        <h5>${incident.title}</h5>
                        <span class="incident-id">${incident.id}</span>
                    </div>
                    <div class="incident-meta">
                        <span class="severity-badge ${incident.severity}">${incident.severity.toUpperCase()}</span>
                        <span class="status-badge ${incident.status}">${incident.status.toUpperCase()}</span>
                        <span class="type-badge ${incident.type}">${incident.type.replace('-', ' ').toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="incident-details">
                    <p><strong>Date:</strong> ${new Date(incident.date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> ${incident.location}</p>
                    <p><strong>Reported By:</strong> ${incident.reportedBy}</p>
                    <p><strong>Description:</strong> ${incident.description}</p>
                    <p><strong>Actions Taken:</strong> ${incident.actions}</p>
                </div>
                
                <div class="incident-timeline">
                    <h6>Incident Timeline</h6>
                    <div class="timeline-item">
                        <span class="timeline-date">${new Date(incident.date).toLocaleString()}</span>
                        <span class="timeline-event">Incident Reported</span>
                    </div>
                    ${incident.status === 'investigating' ? `
                        <div class="timeline-item">
                            <span class="timeline-date">${new Date().toLocaleString()}</span>
                            <span class="timeline-event">Investigation Started</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="incident-actions">
                    <button class="action" onclick="HSEDepartment.viewIncidentDetails('${incident.id}')">View Details</button>
                    <button class="action" onclick="HSEDepartment.updateIncident('${incident.id}')">Update</button>
                    <button class="action" onclick="HSEDepartment.assignInvestigator('${incident.id}')">Assign Investigator</button>
                    <button class="action" onclick="HSEDepartment.generateReport('${incident.id}')">Generate Report</button>
                </div>
            </div>
        `).join('');
    }

    reportIncident() {
        FormManager.showCustomForm(
            'Report New Incident',
            [
                { name: 'title', type: 'text', label: 'Incident Title', required: true },
                { name: 'type', type: 'select', label: 'Incident Type', required: true, options: [
                    { value: 'injury', label: 'Injury' },
                    { value: 'near-miss', label: 'Near Miss' },
                    { value: 'property', label: 'Property Damage' },
                    { value: 'environmental', label: 'Environmental' },
                    { value: 'theft', label: 'Theft' },
                    { value: 'fire', label: 'Fire' }
                ]},
                { name: 'severity', type: 'select', label: 'Severity', required: true, options: [
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                ]},
                { name: 'location', type: 'text', label: 'Location', required: true },
                { name: 'date', type: 'datetime-local', label: 'Date & Time', required: true },
                { name: 'reportedBy', type: 'text', label: 'Reported By', required: true },
                { name: 'description', type: 'textarea', label: 'Description', required: true },
                { name: 'immediateActions', type: 'textarea', label: 'Immediate Actions Taken' },
                { name: 'witnesses', type: 'text', label: 'Witnesses (comma separated)' },
                { name: 'attachments', type: 'file', label: 'Attach Photos/Documents' }
            ],
            async (data) => {
                try {
                    const result = await window.ApiService.createIncident(data);
                    if (result.success) {
                        NotificationManager.show('Incident reported successfully!', 'success', 'Incident Reported');
                        this.loadIncidents();
                    }
                } catch (error) {
                    NotificationManager.show(error.message, 'error', 'Report Error');
                }
            }
        );
    }

    showSafetyProcedures() {
        UIController.showContent(`
            <div class="card">
                <h3>Safety Procedures</h3>
                <p><strong>Safety Authority:</strong> Manage and update safety procedures and protocols</p>
                
                <div class="procedures-controls">
                    <div class="control-row">
                        <button class="action" onclick="HSEDepartment.createProcedure()">Create Procedure</button>
                        <button class="action" onclick="HSEDepartment.reviewProcedures()">Review Procedures</button>
                        <button class="action" onclick="HSEDepartment.procedureAudit()">Audit Procedures</button>
                        <button class="action" onclick="HSEDepartment.exportProcedures()">Export Procedures</button>
                    </div>
                    
                    <div class="procedure-filters">
                        <select id="procedureCategoryFilter" onchange="HSEDepartment.filterProcedures()">
                            <option value="">All Categories</option>
                            <option value="general">General Safety</option>
                            <option value="equipment">Equipment Safety</option>
                            <option value="chemical">Chemical Safety</option>
                            <option value="emergency">Emergency Procedures</option>
                            <option value="ppe">PPE Requirements</option>
                        </select>
                        
                        <select id="procedureStatusFilter" onchange="HSEDepartment.filterProcedures()">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="review">Under Review</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
                
                <div class="procedures-list">
                    <h4>Safety Procedures</h4>
                    ${this.generateProceduresList()}
                </div>
                
                <div class="procedure-compliance">
                    <h4>Compliance Status</h4>
                    <div class="compliance-overview">
                        <div class="compliance-item">
                            <span class="compliance-label">Total Procedures</span>
                            <span class="compliance-value">47</span>
                        </div>
                        <div class="compliance-item">
                            <span class="compliance-label">Active Procedures</span>
                            <span class="compliance-value">42</span>
                        </div>
                        <div class="compliance-item">
                            <span class="compliance-label">Under Review</span>
                            <span class="compliance-value">3</span>
                        </div>
                        <div class="compliance-item">
                            <span class="compliance-label">Last Updated</span>
                            <span class="compliance-value">March 1, 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    generateProceduresList() {
        const procedures = [
            {
                id: 'PROC001',
                title: 'Scaffolding Safety Protocol',
                category: 'equipment',
                status: 'active',
                lastUpdated: '2026-03-01',
                reviewDate: '2026-06-01',
                compliance: 95,
                description: 'Comprehensive scaffolding safety procedures including erection, use, and dismantling'
            },
            {
                id: 'PROC002',
                title: 'Chemical Handling Guidelines',
                category: 'chemical',
                status: 'active',
                lastUpdated: '2026-02-15',
                reviewDate: '2026-05-15',
                compliance: 88,
                description: 'Safe handling, storage, and disposal of hazardous chemicals'
            },
            {
                id: 'PROC003',
                title: 'Emergency Evacuation Plan',
                category: 'emergency',
                status: 'review',
                lastUpdated: '2026-01-20',
                reviewDate: '2026-04-20',
                compliance: 92,
                description: 'Site evacuation procedures and emergency response protocols'
            }
        ];

        return procedures.map(procedure => `
            <div class="procedure-card ${procedure.status}" data-id="${procedure.id}">
                <div class="procedure-header">
                    <div class="procedure-info">
                        <h5>${procedure.title}</h5>
                        <span class="procedure-id">${procedure.id}</span>
                    </div>
                    <div class="procedure-meta">
                        <span class="category-badge ${procedure.category}">${procedure.category.toUpperCase()}</span>
                        <span class="status-badge ${procedure.status}">${procedure.status.toUpperCase()}</span>
                        <span class="compliance-badge ${procedure.compliance >= 90 ? 'good' : procedure.compliance >= 70 ? 'fair' : 'poor'}">${procedure.compliance}%</span>
                    </div>
                </div>
                
                <div class="procedure-details">
                    <p><strong>Category:</strong> ${procedure.category}</p>
                    <p><strong>Last Updated:</strong> ${new Date(procedure.lastUpdated).toLocaleDateString()}</p>
                    <p><strong>Next Review:</strong> ${new Date(procedure.reviewDate).toLocaleDateString()}</p>
                    <p><strong>Compliance:</strong> ${procedure.compliance}%</p>
                    <p><strong>Description:</strong> ${procedure.description}</p>
                </div>
                
                <div class="procedure-actions">
                    <button class="action" onclick="HSEDepartment.viewProcedure('${procedure.id}')">View</button>
                    <button class="action" onclick="HSEDepartment.editProcedure('${procedure.id}')">Edit</button>
                    <button class="action" onclick="HSEDepartment.reviewProcedure('${procedure.id}')">Review</button>
                    <button class="action" onclick="HSEDepartment.printProcedure('${procedure.id}')">Print</button>
                </div>
            </div>
        `).join('');
    }

    showCompliance() {
        UIController.showContent(`
            <div class="card">
                <h3>Compliance Management</h3>
                <p><strong>Compliance Authority:</strong> Monitor and ensure regulatory compliance</p>
                
                <div class="compliance-dashboard">
                    <div class="compliance-overview">
                        <div class="overview-card">
                            <h4>Overall Compliance</h4>
                            <div class="overview-value">92.5%</div>
                            <div class="overview-change positive">+2.3% vs last month</div>
                        </div>
                        <div class="overview-card">
                            <h4>OSHA Compliance</h4>
                            <div class="overview-value">95%</div>
                            <div class="overview-change positive">+1.8% vs last month</div>
                        </div>
                        <div class="overview-card">
                            <h4>Environmental Compliance</h4>
                            <div class="overview-value">88%</div>
                            <div class="overview-change negative">-1.2% vs last month</div>
                        </div>
                        <div class="overview-card">
                            <h4>Safety Training</h4>
                            <div class="overview-value">96%</div>
                            <div class="overview-change positive">+3.1% vs last month</div>
                        </div>
                    </div>
                    
                    <div class="compliance-tabs">
                        <button class="tab-btn active" onclick="HSEDepartment.showComplianceTab('inspections')">Inspections</button>
                        <button class="tab-btn" onclick="HSEDepartment.showComplianceTab('audits')">Audits</button>
                        <button class="tab-btn" onclick="HSEDepartment.showComplianceTab('reports')">Reports</button>
                        <button class="tab-btn" onclick="HSEDepartment.showComplianceTab('certifications')">Certifications</button>
                    </div>
                    
                    <div id="inspectionsTab" class="tab-content active">
                        ${this.generateInspectionsList()}
                    </div>
                    
                    <div id="auditsTab" class="tab-content">
                        ${this.generateAuditsList()}
                    </div>
                    
                    <div id="reportsTab" class="tab-content">
                        ${this.generateComplianceReports()}
                    </div>
                    
                    <div id="certificationsTab" class="tab-content">
                        ${this.generateCertificationsList()}
                    </div>
                </div>
                
                <div class="compliance-actions">
                    <button class="action" onclick="HSEDepartment.scheduleInspection()">Schedule Inspection</button>
                    <button class="action" onclick="HSEDepartment.conductAudit()">Conduct Audit</button>
                    <button class="action" onclick="HSEDepartment.generateComplianceReport()">Generate Report</button>
                    <button class="action" onclick="HSEDepartment.updateCompliance()">Update Compliance</button>
                </div>
            </div>
        `);
    }

    generateInspectionsList() {
        const inspections = [
            {
                id: 'INSP001',
                type: 'Safety',
                location: 'Project A - Building Site',
                date: '2026-03-07',
                inspector: 'Safety Officer A',
                status: 'completed',
                score: 92,
                findings: 'Minor issues with PPE compliance, overall good safety standards',
                nextInspection: '2026-04-07'
            },
            {
                id: 'INSP002',
                type: 'Environmental',
                location: 'Project B - Storage Area',
                date: '2026-03-06',
                inspector: 'Environmental Officer B',
                status: 'scheduled',
                score: null,
                findings: 'Pending inspection',
                nextInspection: '2026-03-06'
            },
            {
                id: 'INSP003',
                type: 'Equipment',
                location: 'Project C - Workshop',
                date: '2026-03-05',
                inspector: 'Equipment Inspector C',
                status: 'completed',
                score: 88,
                findings: 'Some equipment requires maintenance, overall acceptable',
                nextInspection: '2026-04-05'
            }
        ];

        return `
            <h4>Recent Inspections</h4>
            <div class="inspections-table">
                <table>
                    <thead>
                        <tr>
                            <th>Inspection ID</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Inspector</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Next Inspection</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inspections.map(inspection => `
                            <tr>
                                <td>${inspection.id}</td>
                                <td>${inspection.type}</td>
                                <td>${inspection.location}</td>
                                <td>${new Date(inspection.date).toLocaleDateString()}</td>
                                <td>${inspection.inspector}</td>
                                <td><span class="status-badge ${inspection.status}">${inspection.status.toUpperCase()}</span></td>
                                <td>${inspection.score ? `${inspection.score}%` : 'N/A'}</td>
                                <td>${new Date(inspection.nextInspection).toLocaleDateString()}</td>
                                <td>
                                    <button class="action" onclick="HSEDepartment.viewInspection('${inspection.id}')">View</button>
                                    <button class="action" onclick="HSEDepartment.editInspection('${inspection.id}')">Edit</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    showTraining() {
        UIController.showContent(`
            <div class="card">
                <h3>Safety Training Programs</h3>
                <p><strong>Training Authority:</strong> Manage safety training and certification programs</p>
                
                <div class="training-dashboard">
                    <div class="training-stats">
                        <div class="stat-card">
                            <h4>Active Programs</h4>
                            <div class="stat-value">12</div>
                        </div>
                        <div class="stat-card">
                            <h4>Employees Trained</h4>
                            <div class="stat-value">245</div>
                        </div>
                        <div class="stat-card">
                            <h4>Completion Rate</h4>
                            <div class="stat-value">87%</div>
                        </div>
                        <div class="stat-card">
                            <h4>Certifications</h4>
                            <div class="stat-value">156</div>
                        </div>
                    </div>
                    
                    <div class="training-controls">
                        <div class="control-row">
                            <button class="action" onclick="HSEDepartment.createTraining()">Create Training</button>
                            <button class="action" onclick="HSEDepartment.scheduleTraining()">Schedule Session</button>
                            <button class="action" onclick="HSEDepartment.trackAttendance()">Track Attendance</button>
                            <button class="action" onclick="HSEDepartment.manageCertifications()">Certifications</button>
                        </div>
                    </div>
                    
                    <div class="training-list">
                        <h4>Training Programs</h4>
                        ${this.generateTrainingList()}
                    </div>
                    
                    <div class="training-calendar">
                        <h4>Training Schedule</h4>
                        <canvas id="trainingCalendar" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <div class="training-actions">
                    <button class="action" onclick="HSEDepartment.trainingReport()">Training Report</button>
                    <button class="action" onclick="HSEDepartment.skillGapAnalysis()">Skill Gap Analysis</button>
                    <button class="action" onclick="HSEDepartment.trainingBudget()">Budget Management</button>
                </div>
            </div>
        `);
    }

    generateTrainingList() {
        const trainingPrograms = [
            {
                id: 'TRN001',
                title: 'Basic Safety Orientation',
                type: 'mandatory',
                duration: '4 hours',
                participants: 45,
                completionRate: 92,
                nextSession: '2026-03-10',
                instructor: 'Safety Officer A'
            },
            {
                id: 'TRN002',
                title: 'Fall Protection Training',
                type: 'specialized',
                duration: '8 hours',
                participants: 28,
                completionRate: 89,
                nextSession: '2026-03-12',
                instructor: 'Safety Expert B'
            },
            {
                id: 'TRN003',
                title: 'Chemical Safety Handling',
                type: 'specialized',
                duration: '6 hours',
                participants: 35,
                completionRate: 94,
                nextSession: '2026-03-15',
                instructor: 'Chemical Safety Expert C'
            }
        ];

        return trainingPrograms.map(program => `
            <div class="training-card ${program.type}" data-id="${program.id}">
                <div class="training-header">
                    <div class="training-info">
                        <h5>${program.title}</h5>
                        <span class="training-id">${program.id}</span>
                    </div>
                    <div class="training-meta">
                        <span class="type-badge ${program.type}">${program.type.toUpperCase()}</span>
                        <span class="duration-badge">${program.duration}</span>
                    </div>
                </div>
                
                <div class="training-details">
                    <p><strong>Duration:</strong> ${program.duration}</p>
                    <p><strong>Participants:</strong> ${program.participants}</p>
                    <p><strong>Completion Rate:</strong> ${program.completionRate}%</p>
                    <p><strong>Next Session:</strong> ${new Date(program.nextSession).toLocaleDateString()}</p>
                    <p><strong>Instructor:</strong> ${program.instructor}</p>
                </div>
                
                <div class="training-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${program.completionRate}%"></div>
                    </div>
                    <span class="progress-text">${program.completionRate}% Complete</span>
                </div>
                
                <div class="training-actions">
                    <button class="action" onclick="HSEDepartment.viewTraining('${program.id}')">View Details</button>
                    <button class="action" onclick="HSEDepartment.editTraining('${program.id}')">Edit</button>
                    <button class="action" onclick="HSEDepartment.enrollEmployees('${program.id}')">Enroll Employees</button>
                    <button class="action" onclick="HSEDepartment.generateCertificate('${program.id}')">Generate Certificate</button>
                </div>
            </div>
        `).join('');
    }

    // Utility methods
    filterIncidents() {
        const severityFilter = document.getElementById('incidentSeverityFilter').value;
        const statusFilter = document.getElementById('incidentStatusFilter').value;
        const typeFilter = document.getElementById('incidentTypeFilter').value;
        const searchTerm = document.getElementById('incidentSearch').value.toLowerCase();
        
        let filteredIncidents = this.incidents;
        
        if (severityFilter) {
            filteredIncidents = filteredIncidents.filter(i => i.severity === severityFilter);
        }
        
        if (statusFilter) {
            filteredIncidents = filteredIncidents.filter(i => i.status === statusFilter);
        }
        
        if (typeFilter) {
            filteredIncidents = filteredIncidents.filter(i => i.type === typeFilter);
        }
        
        if (searchTerm) {
            filteredIncidents = filteredIncidents.filter(i => 
                i.title.toLowerCase().includes(searchTerm) ||
                i.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Re-render with filtered results
        this.incidents = filteredIncidents;
        this.renderIncidents();
    }

    async viewIncidentDetails(incidentId) {
        try {
            const incident = this.incidents.find(i => i.id === incidentId);
            if (!incident) {
                throw new Error('Incident not found');
            }
            
            FormManager.showCustomForm(
                `Incident Details - ${incident.title}`,
                [
                    { name: 'title', type: 'text', label: 'Incident Title', value: incident.title, readonly: true },
                    { name: 'type', type: 'text', label: 'Type', value: incident.type, readonly: true },
                    { name: 'severity', type: 'text', label: 'Severity', value: incident.severity, readonly: true },
                    { name: 'status', type: 'text', label: 'Status', value: incident.status, readonly: true },
                    { name: 'location', type: 'text', label: 'Location', value: incident.location, readonly: true },
                    { name: 'date', type: 'text', label: 'Date', value: new Date(incident.date).toLocaleString(), readonly: true },
                    { name: 'description', type: 'textarea', label: 'Description', value: incident.description, readonly: true }
                ],
                () => {},
                { showSubmit: false }
            );
        } catch (error) {
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    createProcedure() {
        FormManager.showCustomForm(
            'Create Safety Procedure',
            [
                { name: 'title', type: 'text', label: 'Procedure Title', required: true },
                { name: 'category', type: 'select', label: 'Category', required: true, options: [
                    { value: 'general', label: 'General Safety' },
                    { value: 'equipment', label: 'Equipment Safety' },
                    { value: 'chemical', label: 'Chemical Safety' },
                    { value: 'emergency', label: 'Emergency Procedures' },
                    { value: 'ppe', label: 'PPE Requirements' }
                ]},
                { name: 'description', type: 'textarea', label: 'Description', required: true },
                { name: 'steps', type: 'textarea', label: 'Procedure Steps', required: true },
                { name: 'requirements', type: 'textarea', label: 'Requirements/Prerequisites' },
                { name: 'reviewFrequency', type: 'select', label: 'Review Frequency', options: [
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'semi-annual', label: 'Semi-Annual' },
                    { value: 'annual', label: 'Annual' }
                ]},
                { name: 'attachments', type: 'file', label: 'Attach Documents' }
            ],
            (data) => {
                NotificationManager.show('Safety procedure created successfully!', 'success', 'Procedure Created');
            }
        );
    }

    scheduleInspection() {
        FormManager.showCustomForm(
            'Schedule Compliance Inspection',
            [
                { name: 'type', type: 'select', label: 'Inspection Type', required: true, options: [
                    { value: 'safety', label: 'Safety Inspection' },
                    { value: 'environmental', label: 'Environmental Inspection' },
                    { value: 'equipment', label: 'Equipment Inspection' },
                    { value: 'fire', label: 'Fire Safety Inspection' }
                ]},
                { name: 'location', type: 'text', label: 'Location/Project', required: true },
                { name: 'date', type: 'datetime-local', label: 'Inspection Date & Time', required: true },
                { name: 'inspector', type: 'select', label: 'Inspector', required: true, options: [
                    { value: 'inspector1', label: 'Safety Officer A' },
                    { value: 'inspector2', label: 'Environmental Officer B' },
                    { value: 'inspector3', label: 'Equipment Inspector C' }
                ]},
                { name: 'scope', type: 'textarea', label: 'Inspection Scope' },
                { name: 'notify', type: 'checkbox', label: 'Notify site manager' }
            ],
            (data) => {
                NotificationManager.show('Inspection scheduled successfully!', 'success', 'Inspection Scheduled');
            }
        );
    }
}

// Export for global use
window.HSEDepartment = new HSEDepartment();
