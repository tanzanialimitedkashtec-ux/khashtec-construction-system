// ===== DATABASE INITIALIZATION =====
const db = require('../config/database');

const createTables = async () => {
    try {
        const connection = await db.getConnection();
        
        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                full_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create employees table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                emp_id VARCHAR(20) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(100),
                position VARCHAR(100),
                department VARCHAR(50),
                job_category VARCHAR(50),
                contract VARCHAR(20),
                salary DECIMAL(12,2),
                hire_date DATE,
                status VARCHAR(20) DEFAULT 'active',
                cv_path VARCHAR(255),
                profile_path VARCHAR(255),
                created_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create projects table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                status VARCHAR(20) DEFAULT 'planning',
                budget DECIMAL(12,2),
                created_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create properties table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS properties (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plot_number VARCHAR(50) UNIQUE NOT NULL,
                type VARCHAR(50) NOT NULL,
                location VARCHAR(100) NOT NULL,
                area DECIMAL(10,2),
                price DECIMAL(12,2),
                status VARCHAR(20) DEFAULT 'available',
                survey_plans INT DEFAULT 0,
                tp_number VARCHAR(50),
                description TEXT,
                utilities TEXT,
                zoning VARCHAR(50),
                added_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create clients table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(20) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                company_name VARCHAR(100),
                phone VARCHAR(20),
                email VARCHAR(100),
                nida VARCHAR(50),
                tin VARCHAR(50),
                address TEXT,
                property_interest TEXT,
                budget_range VARCHAR(50),
                notes TEXT,
                registered_by VARCHAR(50),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create sales table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT,
                client_id INT,
                price DECIMAL(12,2) NOT NULL,
                date DATE NOT NULL,
                payment_method VARCHAR(50),
                installment_period INT,
                down_payment DECIMAL(12,2),
                monthly_installment DECIMAL(12,2),
                interest_rate DECIMAL(5,2),
                sales_agreement INT DEFAULT 0,
                payment_status VARCHAR(20) DEFAULT 'pending',
                commission_agent VARCHAR(100),
                notes TEXT,
                recorded_by VARCHAR(50),
                recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id),
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        `);
        
        // Create incidents table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS incidents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                time TIME NOT NULL,
                type VARCHAR(50) NOT NULL,
                severity VARCHAR(20) NOT NULL,
                location VARCHAR(100),
                project_id INT,
                description TEXT NOT NULL,
                injured_persons TEXT,
                witness_name VARCHAR(100),
                immediate_action TEXT,
                reported_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        `);
        
        // Create documents table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                file_path VARCHAR(255),
                expiry_date DATE,
                uploaded_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create attendance table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                employee_id INT NOT NULL,
                check_in TIME,
                check_out TIME,
                status VARCHAR(20) DEFAULT 'present',
                notes TEXT,
                marked_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        `);
        
        // Create leave_requests table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                leave_type VARCHAR(50) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                days INT NOT NULL,
                reason TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                approved_by VARCHAR(50),
                approved_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        `);
        
        console.log('All database tables created successfully');
        connection.release();
        
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    createTables().then(() => {
        console.log('Database initialization completed');
        process.exit(0);
    }).catch(error => {
        console.error('Database initialization failed:', error);
        process.exit(1);
    });
}

module.exports = { createTables };
