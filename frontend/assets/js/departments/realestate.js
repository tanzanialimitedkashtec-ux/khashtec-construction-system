// ===== ENHANCED REAL ESTATE DEPARTMENT =====
class RealEstateDepartment {
    constructor() {
        this.currentProperties = [];
        this.clients = [];
        this.sales = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Real Estate Department initialized with enhanced features');
    }

    // Enhanced Property Management
    async loadProperties() {
        try {
            const result = await window.ApiService.getProperties();
            if (result.success) {
                this.currentProperties = result.data;
                this.renderProperties();
            }
        } catch (error) {
            console.error('Load properties error:', error);
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    renderProperties() {
        const container = document.getElementById('contentArea');
        if (!container) return;

        let html = `
            <div class="card">
                <h3>Real Estate Management Dashboard</h3>
                <p><strong>Real Estate Authority:</strong> Manage properties, clients, and sales transactions</p>
                
                <div class="property-controls">
                    <div class="control-row">
                        <button class="action" onclick="RealEstateDepartment.showAddProperty()">Add Property</button>
                        <button class="action" onclick="RealEstateDepartment.showClientManagement()">Manage Clients</button>
                        <button class="action" onclick="RealEstateDepartment.showSales()">Sales Dashboard</button>
                        <button class="action" onclick="RealEstateDepartment.showMarketing()">Marketing</button>
                    </div>
                    
                    <div class="filter-controls">
                        <select id="propertyTypeFilter" onchange="RealEstateDepartment.filterProperties()">
                            <option value="">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                            <option value="land">Land</option>
                        </select>
                        
                        <select id="propertyStatusFilter" onchange="RealEstateDepartment.filterProperties()">
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="pending">Pending</option>
                            <option value="under-contract">Under Contract</option>
                        </select>
                        
                        <input type="text" placeholder="Search properties..." id="propertySearch" onkeyup="RealEstateDepartment.filterProperties()">
                        <input type="number" placeholder="Min Price" id="minPrice" onchange="RealEstateDepartment.filterProperties()">
                        <input type="number" placeholder="Max Price" id="maxPrice" onchange="RealEstateDepartment.filterProperties()">
                    </div>
                </div>
                
                <div class="property-stats">
                    <div class="stat-card">
                        <h4>Total Properties</h4>
                        <div class="stat-value">${this.currentProperties.length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Available</h4>
                        <div class="stat-value">${this.currentProperties.filter(p => p.status === 'available').length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Sold This Month</h4>
                        <div class="stat-value">${this.currentProperties.filter(p => p.soldThisMonth).length}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Total Revenue</h4>
                        <div class="stat-value">$${this.calculateTotalRevenue().toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="property-grid">
                    <h4>Property Listings</h4>
                    ${this.generatePropertyGrid()}
                </div>
                
                <div class="property-map">
                    <h4>Property Locations</h4>
                    <div id="propertyMapContainer">
                        <canvas id="propertyMap" width="800" height="400"></canvas>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    generatePropertyGrid() {
        return this.currentProperties.map(property => `
            <div class="property-card ${property.status}" data-id="${property.id}">
                <div class="property-image">
                    <img src="${property.image || `https://picsum.photos/seed/${property.id}/300/200.jpg`}" alt="${property.name}">
                    <div class="property-status-badge ${property.status}">${property.status.toUpperCase()}</div>
                </div>
                
                <div class="property-details">
                    <h5>${property.name}</h5>
                    <p class="property-location">${property.location}</p>
                    <p class="property-type">${property.type}</p>
                    <p class="property-price">$${property.price.toLocaleString()}</p>
                    
                    <div class="property-features">
                        <span class="feature">🏠 ${property.bedrooms || 0} Beds</span>
                        <span class="feature">🚿 ${property.bathrooms || 0} Baths</span>
                        <span class="feature">📏 ${property.area || 0} sqft</span>
                    </div>
                    
                    <div class="property-description">
                        <p>${property.description || 'Beautiful property with excellent features and location.'}</p>
                    </div>
                </div>
                
                <div class="property-actions">
                    <button class="action" onclick="RealEstateDepartment.viewPropertyDetails('${property.id}')">View Details</button>
                    <button class="action" onclick="RealEstateDepartment.editProperty('${property.id}')">Edit</button>
                    <button class="action" onclick="RealEstateDepartment.scheduleViewing('${property.id}')">Schedule Viewing</button>
                    ${property.status === 'available' ? 
                        `<button class="action" onclick="RealEstateDepartment.markAsSold('${property.id}')">Mark as Sold</button>` : 
                        ''
                    }
                </div>
            </div>
        `).join('');
    }

    showAddProperty() {
        FormManager.showCustomForm(
            'Add New Property',
            [
                { name: 'name', type: 'text', label: 'Property Name', required: true },
                { name: 'type', type: 'select', label: 'Property Type', required: true, options: [
                    { value: 'residential', label: 'Residential' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'industrial', label: 'Industrial' },
                    { value: 'land', label: 'Land' }
                ]},
                { name: 'location', type: 'text', label: 'Location', required: true },
                { name: 'price', type: 'number', label: 'Price', required: true },
                { name: 'bedrooms', type: 'number', label: 'Bedrooms' },
                { name: 'bathrooms', type: 'number', label: 'Bathrooms' },
                { name: 'area', type: 'number', label: 'Area (sqft)' },
                { name: 'description', type: 'textarea', label: 'Description' },
                { name: 'features', type: 'text', label: 'Features (comma separated)' },
                { name: 'image', type: 'file', label: 'Property Image' }
            ],
            async (data) => {
                try {
                    const result = await window.ApiService.createProperty(data);
                    if (result.success) {
                        NotificationManager.show('Property added successfully!', 'success', 'Property Added');
                        this.loadProperties();
                    }
                } catch (error) {
                    NotificationManager.show(error.message, 'error', 'Add Error');
                }
            }
        );
    }

    showClientManagement() {
        UIController.showContent(`
            <div class="card">
                <h3>Client Management</h3>
                <p><strong>Client Authority:</strong> Manage real estate clients and their preferences</p>
                
                <div class="client-controls">
                    <div class="control-row">
                        <button class="action" onclick="RealEstateDepartment.showAddClient()">Add Client</button>
                        <button class="action" onclick="RealEstateDepartment.showClientSearch()">Search Clients</button>
                        <button class="action" onclick="RealEstateDepartment.showClientMatching()">Property Matching</button>
                        <button class="action" onclick="RealEstateDepartment.showClientFollowup()">Follow-up Schedule</button>
                    </div>
                    
                    <div class="client-filters">
                        <select id="clientTypeFilter" onchange="RealEstateDepartment.filterClients()">
                            <option value="">All Types</option>
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="renter">Renter</option>
                            <option value="investor">Investor</option>
                        </select>
                        
                        <select id="clientStatusFilter" onchange="RealEstateDepartment.filterClients()">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="hot-lead">Hot Lead</option>
                            <option value="closed">Closed</option>
                        </select>
                        
                        <input type="text" placeholder="Search clients..." id="clientSearch" onkeyup="RealEstateDepartment.filterClients()">
                    </div>
                </div>
                
                <div class="client-stats">
                    <div class="stat-card">
                        <h4>Total Clients</h4>
                        <div class="stat-value">156</div>
                    </div>
                    <div class="stat-card">
                        <h4>Active Buyers</h4>
                        <div class="stat-value">42</div>
                    </div>
                    <div class="stat-card">
                        <h4>Hot Leads</h4>
                        <div class="stat-value">18</div>
                    </div>
                    <div class="stat-card">
                        <h4>This Month</h4>
                        <div class="stat-value">23</div>
                    </div>
                </div>
                
                <div class="client-list">
                    <h4>Client Database</h4>
                    ${this.generateClientList()}
                </div>
                
                <div class="client-analytics">
                    <h4>Client Analytics</h4>
                    <canvas id="clientAnalyticsChart" width="400" height="200"></canvas>
                </div>
            </div>
        `);
    }

    generateClientList() {
        const clients = [
            { 
                id: 'CLT001', 
                name: 'John Smith', 
                type: 'buyer', 
                status: 'active', 
                phone: '+255 712 345 678', 
                email: 'john.smith@email.com',
                budget: '$500,000',
                preferences: 'Residential, 3+ bedrooms, City Center',
                lastContact: '2026-03-06'
            },
            { 
                id: 'CLT002', 
                name: 'Sarah Johnson', 
                type: 'seller', 
                status: 'hot-lead', 
                phone: '+255 713 456 789', 
                email: 'sarah.j@email.com',
                property: 'Villa in Masaki',
                lastContact: '2026-03-07'
            },
            { 
                id: 'CLT003', 
                name: 'Michael Wilson', 
                type: 'investor', 
                status: 'active', 
                phone: '+255 714 567 890', 
                email: 'm.wilson@invest.com',
                budget: '$2,000,000',
                preferences: 'Commercial properties, High ROI',
                lastContact: '2026-03-05'
            }
        ];

        return `
            <div class="client-grid">
                ${clients.map(client => `
                    <div class="client-card ${client.status}" data-id="${client.id}">
                        <div class="client-header">
                            <div class="client-info">
                                <h5>${client.name}</h5>
                                <span class="client-id">${client.id}</span>
                            </div>
                            <div class="client-meta">
                                <span class="type-badge ${client.type}">${client.type.toUpperCase()}</span>
                                <span class="status-badge ${client.status}">${client.status.replace('-', ' ').toUpperCase()}</span>
                            </div>
                        </div>
                        
                        <div class="client-details">
                            <p><strong>Phone:</strong> ${client.phone}</p>
                            <p><strong>Email:</strong> ${client.email}</p>
                            ${client.budget ? `<p><strong>Budget:</strong> ${client.budget}</p>` : ''}
                            ${client.property ? `<p><strong>Property:</strong> ${client.property}</p>` : ''}
                            ${client.preferences ? `<p><strong>Preferences:</strong> ${client.preferences}</p>` : ''}
                            <p><strong>Last Contact:</strong> ${new Date(client.lastContact).toLocaleDateString()}</p>
                        </div>
                        
                        <div class="client-actions">
                            <button class="action" onclick="RealEstateDepartment.viewClientDetails('${client.id}')">View Details</button>
                            <button class="action" onclick="RealEstateDepartment.contactClient('${client.id}')">Contact</button>
                            <button class="action" onclick="RealEstateDepartment.scheduleMeeting('${client.id}')">Schedule Meeting</button>
                            <button class="action" onclick="RealEstateDepartment.viewClientHistory('${client.id}')">History</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showSales() {
        UIController.showContent(`
            <div class="card">
                <h3>Sales Dashboard</h3>
                <p><strong>Sales Authority:</strong> Track sales performance and manage transactions</p>
                
                <div class="sales-overview">
                    <div class="overview-cards">
                        <div class="overview-card">
                            <h4>This Month</h4>
                            <div class="overview-value">$2,450,000</div>
                            <div class="overview-change positive">+18% vs last month</div>
                        </div>
                        <div class="overview-card">
                            <h4>Properties Sold</h4>
                            <div class="overview-value">12</div>
                            <div class="overview-change positive">+3 vs last month</div>
                        </div>
                        <div class="overview-card">
                            <h4>Average Sale Price</h4>
                            <div class="overview-value">$204,167</div>
                            <div class="overview-change positive">+5.2% vs last month</div>
                        </div>
                        <div class="overview-card">
                            <h4>Commission Earned</h4>
                            <div class="overview-value">$122,500</div>
                            <div class="overview-change positive">+18% vs last month</div>
                        </div>
                    </div>
                </div>
                
                <div class="sales-tabs">
                    <button class="tab-btn active" onclick="RealEstateDepartment.showSalesTab('current')">Current Sales</button>
                    <button class="tab-btn" onclick="RealEstateDepartment.showSalesTab('closed')">Closed Deals</button>
                    <button class="tab-btn" onclick="RealEstateDepartment.showSalesTab('pending')">Pending</button>
                    <button class="tab-btn" onclick="RealEstateDepartment.showSalesTab('analytics')">Analytics</button>
                </div>
                
                <div id="currentSalesTab" class="tab-content active">
                    ${this.generateCurrentSales()}
                </div>
                
                <div id="closedSalesTab" class="tab-content">
                    ${this.generateClosedSales()}
                </div>
                
                <div id="pendingSalesTab" class="tab-content">
                    ${this.generatePendingSales()}
                </div>
                
                <div id="analyticsSalesTab" class="tab-content">
                    ${this.generateSalesAnalytics()}
                </div>
                
                <div class="sales-actions">
                    <button class="action" onclick="RealEstateDepartment.createNewSale()">Create Sale</button>
                    <button class="action" onclick="RealEstateDepartment.salesReport()">Generate Report</button>
                    <button class="action" onclick="RealEstateDepartment.salesForecast()">Sales Forecast</button>
                </div>
            </div>
        `);
    }

    generateCurrentSales() {
        const currentSales = [
            { 
                id: 'SAL001', 
                property: 'Modern Villa - Masaki', 
                client: 'John Smith', 
                price: 850000, 
                status: 'under-contract',
                agent: 'Agent A',
                commission: 42500,
                expectedClose: '2026-03-15'
            },
            { 
                id: 'SAL002', 
                property: 'Commercial Office - City Center', 
                client: 'ABC Corporation', 
                price: 1200000, 
                status: 'negotiation',
                agent: 'Agent B',
                commission: 60000,
                expectedClose: '2026-03-20'
            },
            { 
                id: 'SAL003', 
                property: 'Apartment - Mikocheni', 
                client: 'Sarah Johnson', 
                price: 450000, 
                status: 'under-contract',
                agent: 'Agent C',
                commission: 22500,
                expectedClose: '2026-03-18'
            }
        ];

        return `
            <h4>Current Sales Transactions</h4>
            <div class="sales-table">
                <table>
                    <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Property</th>
                            <th>Client</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Agent</th>
                            <th>Commission</th>
                            <th>Expected Close</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentSales.map(sale => `
                            <tr>
                                <td>${sale.id}</td>
                                <td>${sale.property}</td>
                                <td>${sale.client}</td>
                                <td>$${sale.price.toLocaleString()}</td>
                                <td><span class="status-badge ${sale.status}">${sale.status.replace('-', ' ').toUpperCase()}</span></td>
                                <td>${sale.agent}</td>
                                <td>$${sale.commission.toLocaleString()}</td>
                                <td>${new Date(sale.expectedClose).toLocaleDateString()}</td>
                                <td>
                                    <button class="action" onclick="RealEstateDepartment.viewSaleDetails('${sale.id}')">View</button>
                                    <button class="action" onclick="RealEstateDepartment.updateSaleStatus('${sale.id}')">Update</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    showMarketing() {
        UIController.showContent(`
            <div class="card">
                <h3>Marketing & Promotion</h3>
                <p><strong>Marketing Authority:</strong> Manage property marketing and promotional campaigns</p>
                
                <div class="marketing-dashboard">
                    <div class="marketing-stats">
                        <div class="stat-card">
                            <h4>Active Listings</h4>
                            <div class="stat-value">28</div>
                        </div>
                        <div class="stat-card">
                            <h4>Views This Month</h4>
                            <div class="stat-value">15,420</div>
                        </div>
                        <div class="stat-card">
                            <h4>Inquiries</h4>
                            <div class="stat-value">342</div>
                        </div>
                        <div class="stat-card">
                            <h4>Conversion Rate</h4>
                            <div class="stat-value">3.2%</div>
                        </div>
                    </div>
                    
                    <div class="marketing-tools">
                        <h4>Marketing Tools</h4>
                        <div class="tool-grid">
                            <div class="tool-card">
                                <h5>Property Photography</h5>
                                <p>Professional photoshoots for properties</p>
                                <button class="action" onclick="RealEstateDepartment.schedulePhotoshoot()">Schedule Photoshoot</button>
                            </div>
                            
                            <div class="tool-card">
                                <h5>Virtual Tours</h5>
                                <p>360° virtual property tours</p>
                                <button class="action" onclick="RealEstateDepartment.createVirtualTour()">Create Tour</button>
                            </div>
                            
                            <div class="tool-card">
                                <h5>Social Media</h5>
                                <p>Post properties to social platforms</p>
                                <button class="action" onclick="RealEstateDepartment.manageSocialMedia()">Manage Social</button>
                            </div>
                            
                            <div class="tool-card">
                                <h5>Email Campaigns</h5>
                                <p>Targeted email marketing campaigns</p>
                                <button class="action" onclick="RealEstateDepartment.createEmailCampaign()">Create Campaign</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="campaign-manager">
                        <h4>Active Campaigns</h4>
                        <div class="campaign-list">
                            <div class="campaign-item">
                                <div class="campaign-info">
                                    <h5>Spring Sale 2026</h5>
                                    <p>Special discounts on selected properties</p>
                                </div>
                                <div class="campaign-stats">
                                    <span>Views: 5,420</span>
                                    <span>Clicks: 312</span>
                                    <span>Conversions: 18</span>
                                </div>
                                <div class="campaign-actions">
                                    <button class="action" onclick="RealEstateDepartment.editCampaign('camp001')">Edit</button>
                                    <button class="action" onclick="RealEstateDepartment.viewCampaignStats('camp001')">Stats</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="marketing-actions">
                    <button class="action" onclick="RealEstateDepartment.createNewCampaign()">New Campaign</button>
                    <button class="action" onclick="RealEstateDepartment.marketingReport()">Marketing Report</button>
                    <button class="action" onclick="RealEstateDepartment.audienceSegmentation">Audience Segmentation</button>
                </div>
            </div>
        `);
    }

    // Utility methods
    calculateTotalRevenue() {
        return this.currentProperties
            .filter(p => p.status === 'sold')
            .reduce((total, property) => total + (property.price || 0), 0);
    }

    filterProperties() {
        const typeFilter = document.getElementById('propertyTypeFilter').value;
        const statusFilter = document.getElementById('propertyStatusFilter').value;
        const searchTerm = document.getElementById('propertySearch').value.toLowerCase();
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        
        let filteredProperties = this.currentProperties;
        
        if (typeFilter) {
            filteredProperties = filteredProperties.filter(p => p.type === typeFilter);
        }
        
        if (statusFilter) {
            filteredProperties = filteredProperties.filter(p => p.status === statusFilter);
        }
        
        if (searchTerm) {
            filteredProperties = filteredProperties.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.location.toLowerCase().includes(searchTerm)
            );
        }
        
        filteredProperties = filteredProperties.filter(p => 
            (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice
        );
        
        // Re-render with filtered results
        this.currentProperties = filteredProperties;
        this.renderProperties();
    }

    async viewPropertyDetails(propertyId) {
        try {
            const property = this.currentProperties.find(p => p.id === propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            
            FormManager.showCustomForm(
                `Property Details - ${property.name}`,
                [
                    { name: 'name', type: 'text', label: 'Property Name', value: property.name, readonly: true },
                    { name: 'type', type: 'text', label: 'Type', value: property.type, readonly: true },
                    { name: 'location', type: 'text', label: 'Location', value: property.location, readonly: true },
                    { name: 'price', type: 'text', label: 'Price', value: `$${property.price.toLocaleString()}`, readonly: true },
                    { name: 'status', type: 'text', label: 'Status', value: property.status, readonly: true },
                    { name: 'description', type: 'textarea', label: 'Description', value: property.description || '', readonly: true }
                ],
                () => {},
                { showSubmit: false }
            );
        } catch (error) {
            NotificationManager.show(error.message, 'error', 'Error');
        }
    }

    scheduleViewing(propertyId) {
        FormManager.showCustomForm(
            'Schedule Property Viewing',
            [
                { name: 'property', type: 'text', label: 'Property', value: propertyId, readonly: true },
                { name: 'clientName', type: 'text', label: 'Client Name', required: true },
                { name: 'clientPhone', type: 'text', label: 'Client Phone', required: true },
                { name: 'viewingDate', type: 'datetime-local', label: 'Viewing Date & Time', required: true },
                { name: 'agent', type: 'select', label: 'Agent', required: true, options: [
                    { value: 'agent1', label: 'Agent A' },
                    { value: 'agent2', label: 'Agent B' },
                    { value: 'agent3', label: 'Agent C' }
                ]},
                { name: 'notes', type: 'textarea', label: 'Special Requirements' }
            ],
            (data) => {
                NotificationManager.show('Property viewing scheduled successfully!', 'success', 'Viewing Scheduled');
            }
        );
    }

    async markAsSold(propertyId) {
        FormManager.showCustomForm(
            'Mark Property as Sold',
            [
                { name: 'property', type: 'text', label: 'Property', value: propertyId, readonly: true },
                { name: 'buyerName', type: 'text', label: 'Buyer Name', required: true },
                { name: 'salePrice', type: 'number', label: 'Sale Price', required: true },
                { name: 'saleDate', type: 'date', label: 'Sale Date', required: true },
                { name: 'commissionRate', type: 'number', label: 'Commission Rate (%)', value: 5 },
                { name: 'notes', type: 'textarea', label: 'Sale Notes' }
            ],
            async (data) => {
                try {
                    NotificationManager.show('Property marked as sold successfully!', 'success', 'Property Sold');
                    this.loadProperties();
                } catch (error) {
                    NotificationManager.show(error.message, 'error', 'Sale Error');
                }
            }
        );
    }
}

// Export for global use
window.RealEstateDepartment = new RealEstateDepartment();
