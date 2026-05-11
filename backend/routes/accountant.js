const express = require('express');
const router = express.Router();
const db = require('../../database/config/database');

// ===== ACCOUNTANT MANAGEMENT =====

// POST - Create/update accountant details
router.post('/accountant', async (req, res) => {
    console.log('📝 POST /api/accountant accessed');
    console.log('📊 Request body:', req.body);
    
    const {
        name,
        employeeId,
        email,
        phone,
        department,
        reportingTo,
        startDate,
        employmentType,
        professionalQualification,
        yearsExperience = 0,
        additionalCertifications = '',
        notes = '',
        financialReporting = [],
        bookkeeping = [],
        regulatory = [],
        systemAccess = [],
        role = 'Accountant',
        submittedBy = 'Managing Director',
        submittedDate,
        status = 'active'
    } = req.body;
    
    // Validate required fields
    if (!name || !employeeId || !email || !phone || !department || !reportingTo || !startDate || !employmentType) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['name', 'employeeId', 'email', 'phone', 'department', 'reportingTo', 'startDate', 'employmentType']
        });
    }
    
    try {
        // Check if accountant already exists
        const existingAccountant = await db.execute(
            'SELECT id FROM accountants WHERE employee_id = ? OR email = ?',
            [employeeId, email]
        );
        
        let result;
        if (existingAccountant.length > 0) {
            // Update existing accountant
            await db.execute(`
                UPDATE accountants SET 
                    name = ?, phone = ?, department = ?, reporting_to = ?, 
                    start_date = ?, employment_type = ?, professional_qualification = ?,
                    years_of_experience = ?, additional_certifications = ?, notes = ?,
                    financial_reporting = ?, bookkeeping = ?, regulatory = ?, 
                    system_access = ?, status = ?, updated_by = ?,
                    submitted_by_role = ?, submitted_date = ?
                WHERE employee_id = ?
            `, [
                name, phone, department, reportingTo, startDate, employmentType,
                professionalQualification, yearsExperience, additionalCertifications, notes,
                JSON.stringify(financialReporting), JSON.stringify(bookkeeping), 
                JSON.stringify(regulatory), JSON.stringify(systemAccess), status, 1,
                submittedBy, submittedDate || new Date().toISOString().split('T')[0], employeeId
            ]);
            
            result = { 
                action: 'updated',
                id: existingAccountant[0].id,
                employee_id: employeeId,
                note: 'Accountant details updated successfully'
            };
        } else {
            // Insert new accountant
            const insertResult = await db.execute(`
                INSERT INTO accountants (
                    employee_id, name, email, phone, department, reporting_to,
                    start_date, employment_type, professional_qualification,
                    years_of_experience, additional_certifications, notes,
                    financial_reporting, bookkeeping, regulatory, system_access,
                    role, submitted_by, submitted_by_role, submitted_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                employeeId, name, email, phone, department, reportingTo,
                startDate, employmentType, professionalQualification,
                yearsExperience, additionalCertifications, notes,
                JSON.stringify(financialReporting), JSON.stringify(bookkeeping),
                JSON.stringify(regulatory), JSON.stringify(systemAccess),
                role, 1, submittedBy, submittedDate || new Date().toISOString().split('T')[0], status
            ]);
            
            result = { 
                action: 'created',
                id: insertResult.insertId,
                employee_id: employeeId,
                note: 'Accountant details created successfully'
            };
        }
        
        console.log('✅ Accountant details saved successfully:', result);
        
        res.json({
            success: true,
            message: `Accountant details ${result.action} successfully`,
            data: result
        });
        
    } catch (error) {
        console.error('❌ Error saving accountant details:', error);
        res.status(500).json({
            error: 'Failed to save accountant details',
            details: error.message
        });
    }
});

// GET - Retrieve accountant details
router.get('/accountant', async (req, res) => {
    console.log('📝 GET /api/accountant accessed');
    
    try {
        // Retrieve accountants from database
        const accountants = await db.execute(`
            SELECT id, employee_id, name, email, phone, department, reporting_to,
                   start_date, employment_type, professional_qualification, years_of_experience,
                   additional_certifications, notes, financial_reporting, bookkeeping,
                   regulatory, system_access, role, submitted_by, submitted_by_role,
                   submitted_date, status, created_at, updated_at
            FROM accountants 
            ORDER BY created_at DESC
        `);
        
        res.json({ 
            success: true, 
            data: accountants 
        });
        
    } catch (error) {
        console.error('❌ Error retrieving accountant details:', error);
        res.status(500).json({
            error: 'Failed to retrieve accountant details',
            details: error.message
        });
    }
});

module.exports = router;
