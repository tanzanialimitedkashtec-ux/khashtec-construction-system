const express = require('express');
const router = express.Router();

// Mock employee data (in production, use real database)
let employees = [
    {
        id: 1,
        fullName: 'John Smith',
        gmail: 'john.smith@kashtec.com',
        phone: '+255 712 345 678',
        department: 'Construction',
        jobCategory: 'Project Manager',
        status: 'active',
        registrationDate: '2024-01-15',
        profileImage: 'https://picsum.photos/seed/johnsmith/80/80.jpg'
    },
    {
        id: 2,
        fullName: 'Sarah Johnson',
        gmail: 'sarah.johnson@kashtec.com',
        phone: '+255 713 456 789',
        department: 'HR',
        jobCategory: 'HR Manager',
        status: 'active',
        registrationDate: '2024-01-20',
        profileImage: 'https://picsum.photos/seed/sarahjohnson/80/80.jpg'
    }
];

// Get all employees
router.get('/', (req, res) => {
    const { department, status, search } = req.query;
    
    let filteredEmployees = employees;
    
    if (department) {
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.department.toLowerCase() === department.toLowerCase()
        );
    }
    
    if (status) {
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.status.toLowerCase() === status.toLowerCase()
        );
    }
    
    if (search) {
        const searchTerm = search.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.fullName.toLowerCase().includes(searchTerm) ||
            emp.gmail.toLowerCase().includes(searchTerm) ||
            emp.department.toLowerCase().includes(searchTerm)
        );
    }
    
    res.json({
        employees: filteredEmployees,
        total: filteredEmployees.length
    });
});

// Get employee by ID
router.get('/:id', (req, res) => {
    const employee = employees.find(emp => emp.id === parseInt(req.params.id));
    
    if (!employee) {
        return res.status(404).json({
            error: 'Employee not found'
        });
    }
    
    res.json(employee);
});

// Create new employee
router.post('/', (req, res) => {
    const { fullName, gmail, phone, department, jobCategory, status = 'active' } = req.body;
    
    // Validate input
    if (!fullName || !gmail || !phone || !department || !jobCategory) {
        return res.status(400).json({
            error: 'All required fields must be provided'
        });
    }
    
    // Check if employee already exists
    const existingEmployee = employees.find(emp => emp.gmail === gmail);
    if (existingEmployee) {
        return res.status(409).json({
            error: 'Employee with this email already exists'
        });
    }
    
    // Create new employee
    const newEmployee = {
        id: employees.length + 1,
        fullName,
        gmail,
        phone,
        department,
        jobCategory,
        status,
        registrationDate: new Date().toISOString().split('T')[0],
        profileImage: `https://picsum.photos/seed/${fullName.replace(/\s/g, '')}/80/80.jpg`
    };
    
    employees.push(newEmployee);
    
    res.status(201).json({
        message: 'Employee created successfully',
        employee: newEmployee
    });
});

// Update employee
router.put('/:id', (req, res) => {
    const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));
    
    if (employeeIndex === -1) {
        return res.status(404).json({
            error: 'Employee not found'
        });
    }
    
    const { fullName, gmail, phone, department, jobCategory, status } = req.body;
    
    // Update employee
    employees[employeeIndex] = {
        ...employees[employeeIndex],
        ...(fullName && { fullName }),
        ...(gmail && { gmail }),
        ...(phone && { phone }),
        ...(department && { department }),
        ...(jobCategory && { jobCategory }),
        ...(status && { status })
    };
    
    res.json({
        message: 'Employee updated successfully',
        employee: employees[employeeIndex]
    });
});

// Delete employee
router.delete('/:id', (req, res) => {
    const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));
    
    if (employeeIndex === -1) {
        return res.status(404).json({
            error: 'Employee not found'
        });
    }
    
    const deletedEmployee = employees.splice(employeeIndex, 1)[0];
    
    res.json({
        message: 'Employee deleted successfully',
        employee: deletedEmployee
    });
});

// Get employee statistics
router.get('/stats/overview', (req, res) => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
    
    // Department breakdown
    const departmentStats = {};
    employees.forEach(emp => {
        departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
    });
    
    // Job category breakdown
    const jobStats = {};
    employees.forEach(emp => {
        jobStats[emp.jobCategory] = (jobStats[emp.jobCategory] || 0) + 1;
    });
    
    res.json({
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        departments: departmentStats,
        jobCategories: jobStats,
        recentRegistrations: employees
            .filter(emp => emp.registrationDate)
            .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
            .slice(0, 5)
    });
});

module.exports = router;
