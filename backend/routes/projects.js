const express = require('express');
const router = express.Router();

// Mock project data (in production, use real database)
let projects = [
    {
        id: 1,
        name: 'Kigali Tower Complex',
        client: 'Rwanda Development Board',
        location: 'Kigali, Rwanda',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        budget: 5000000,
        progress: 65,
        manager: 'John Smith',
        description: 'Construction of a modern office and residential complex',
        milestones: [
            { name: 'Foundation Complete', completed: true, date: '2024-03-15' },
            { name: 'Structure Complete', completed: true, date: '2024-06-30' },
            { name: 'Interior Finishing', completed: false, date: '2024-10-15' },
            { name: 'Final Inspection', completed: false, date: '2024-12-15' }
        ]
    },
    {
        id: 2,
        name: 'Dar es Salaam Port Expansion',
        client: 'Tanzania Ports Authority',
        location: 'Dar es Salaam, Tanzania',
        startDate: '2024-02-01',
        endDate: '2025-03-31',
        status: 'active',
        budget: 8500000,
        progress: 40,
        manager: 'Sarah Johnson',
        description: 'Expansion of port facilities and infrastructure',
        milestones: [
            { name: 'Site Preparation', completed: true, date: '2024-03-01' },
            { name: 'Dock Construction', completed: false, date: '2024-08-15' },
            { name: 'Equipment Installation', completed: false, date: '2024-12-01' },
            { name: 'Commissioning', completed: false, date: '2025-02-15' }
        ]
    }
];

// Get all projects
router.get('/', (req, res) => {
    const { status, manager, search } = req.query;
    
    let filteredProjects = projects;
    
    if (status) {
        filteredProjects = filteredProjects.filter(proj => 
            proj.status.toLowerCase() === status.toLowerCase()
        );
    }
    
    if (manager) {
        filteredProjects = filteredProjects.filter(proj => 
            proj.manager.toLowerCase().includes(manager.toLowerCase())
        );
    }
    
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredProjects = filteredProjects.filter(proj => 
            proj.name.toLowerCase().includes(searchTerm) ||
            proj.client.toLowerCase().includes(searchTerm) ||
            proj.location.toLowerCase().includes(searchTerm)
        );
    }
    
    res.json({
        projects: filteredProjects,
        total: filteredProjects.length
    });
});

// Get project by ID
router.get('/:id', (req, res) => {
    const project = projects.find(proj => proj.id === parseInt(req.params.id));
    
    if (!project) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }
    
    res.json(project);
});

// Create new project
router.post('/', (req, res) => {
    const { name, code, client, type, location, startDate, endDate, budget, manager, description, keyDeliverables, priority } = req.body;
    
    // Validate input
    if (!name || !client || !location || !startDate || !endDate || !budget || !manager) {
        return res.status(400).json({
            error: 'All required fields must be provided'
        });
    }
    
    // Create new project
    const newProject = {
        id: projects.length + 1,
        name,
        code: code || '',
        client,
        type: type || '',
        location,
        startDate,
        endDate,
        status: 'planning',
        budget: parseFloat(budget),
        progress: 0,
        manager,
        description: description || '',
        keyDeliverables: keyDeliverables || '',
        priority: priority || 'medium',
        milestones: []
    };
    
    projects.push(newProject);
    
    res.status(201).json({
        message: 'Project created successfully',
        project: newProject
    });
});

// Update project
router.put('/:id', (req, res) => {
    const projectIndex = projects.findIndex(proj => proj.id === parseInt(req.params.id));
    
    if (projectIndex === -1) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }
    
    const { name, client, location, startDate, endDate, status, budget, progress, manager, description } = req.body;
    
    // Update project
    projects[projectIndex] = {
        ...projects[projectIndex],
        ...(name && { name }),
        ...(client && { client }),
        ...(location && { location }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
        ...(budget && { budget: parseFloat(budget) }),
        ...(progress !== undefined && { progress: parseInt(progress) }),
        ...(manager && { manager }),
        ...(description !== undefined && { description })
    };
    
    res.json({
        message: 'Project updated successfully',
        project: projects[projectIndex]
    });
});

// Delete project
router.delete('/:id', (req, res) => {
    const projectIndex = projects.findIndex(proj => proj.id === parseInt(req.params.id));
    
    if (projectIndex === -1) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }
    
    const deletedProject = projects.splice(projectIndex, 1)[0];
    
    res.json({
        message: 'Project deleted successfully',
        project: deletedProject
    });
});

// Update project milestone
router.post('/:id/milestones', (req, res) => {
    const project = projects.find(proj => proj.id === parseInt(req.params.id));
    
    if (!project) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }
    
    const { name, date, completed = false } = req.body;
    
    if (!name || !date) {
        return res.status(400).json({
            error: 'Milestone name and date are required'
        });
    }
    
    const newMilestone = {
        name,
        date,
        completed,
        id: project.milestones.length + 1
    };
    
    project.milestones.push(newMilestone);
    
    // Update project progress based on completed milestones
    const completedMilestones = project.milestones.filter(m => m.completed).length;
    project.progress = Math.round((completedMilestones / project.milestones.length) * 100);
    
    res.status(201).json({
        message: 'Milestone added successfully',
        milestone: newMilestone,
        project
    });
});

// Get project statistics
router.get('/stats/overview', (req, res) => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(proj => proj.status === 'active').length;
    const completedProjects = projects.filter(proj => proj.status === 'completed').length;
    const planningProjects = projects.filter(proj => proj.status === 'planning').length;
    
    // Budget statistics
    const totalBudget = projects.reduce((sum, proj) => sum + proj.budget, 0);
    const averageProgress = projects.reduce((sum, proj) => sum + proj.progress, 0) / projects.length;
    
    // Manager breakdown
    const managerStats = {};
    projects.forEach(proj => {
        managerStats[proj.manager] = (managerStats[proj.manager] || 0) + 1;
    });
    
    // Upcoming milestones
    const upcomingMilestones = [];
    const today = new Date();
    
    projects.forEach(proj => {
        proj.milestones.forEach(milestone => {
            if (!milestone.completed && new Date(milestone.date) > today) {
                upcomingMilestones.push({
                    ...milestone,
                    project: proj.name,
                    manager: proj.manager
                });
            }
        });
    });
    
    upcomingMilestones.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        planning: planningProjects,
        totalBudget,
        averageProgress: Math.round(averageProgress),
        managers: managerStats,
        upcomingMilestones: upcomingMilestones.slice(0, 10),
        recentProjects: projects
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5)
    });
});

// Update project progress
router.put('/:id/progress', (req, res) => {
    const project = projects.find(proj => proj.id === parseInt(req.params.id));
    
    if (!project) {
        return res.status(404).json({
            success: false,
            error: 'Project not found'
        });
    }
    
    const { 
        progressPercentage, 
        status, 
        progressReport, 
        completedMilestones, 
        nextMilestones, 
        budgetUsed, 
        issues, 
        updateDate 
    } = req.body;
    
    // Update project progress
    if (progressPercentage !== undefined) {
        project.progress = parseInt(progressPercentage);
    }
    
    if (status) {
        project.status = status;
    }
    
    // Add progress update to history
    if (!project.progressUpdates) {
        project.progressUpdates = [];
    }
    
    const progressUpdate = {
        id: project.progressUpdates.length + 1,
        progressPercentage: progressPercentage || project.progress,
        status: status || project.status,
        progressReport: progressReport || '',
        completedMilestones: completedMilestones || '',
        nextMilestones: nextMilestones || '',
        budgetUsed: budgetUsed || 0,
        issues: issues || '',
        updateDate: updateDate || new Date().toISOString(),
        updatedBy: 'Project Authority'
    };
    
    project.progressUpdates.unshift(progressUpdate); // Add to beginning
    
    // Keep only last 10 updates
    if (project.progressUpdates.length > 10) {
        project.progressUpdates = project.progressUpdates.slice(0, 10);
    }
    
    res.json({
        success: true,
        message: 'Project progress updated successfully',
        project: project,
        update: progressUpdate
    });
});

// Get project progress updates
router.get('/:id/progress-updates', (req, res) => {
    const project = projects.find(proj => proj.id === parseInt(req.params.id));
    
    if (!project) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }
    
    res.json({
        projectName: project.name,
        updates: project.progressUpdates || []
    });
});

module.exports = router;
