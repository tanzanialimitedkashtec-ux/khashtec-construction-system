const db = require('./config/database');

async function createTable() {
    try {
        await db.connect();

        const sql = `
            CREATE TABLE IF NOT EXISTS financial_strategies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id VARCHAR(100),
                project_name VARCHAR(255),
                land_acquisition_cost DECIMAL(15, 2) DEFAULT 0,
                estimated_construction_cost DECIMAL(15, 2) DEFAULT 0,
                permits_fees DECIMAL(15, 2) DEFAULT 0,
                contingency_reserve_percent DECIMAL(5, 2) DEFAULT 0,
                developer_equity DECIMAL(15, 2) DEFAULT 0,
                bank_loan_amount DECIMAL(15, 2) DEFAULT 0,
                annual_interest_rate DECIMAL(5, 2) DEFAULT 0,
                loan_repayment_period_years INT DEFAULT 0,
                grace_period_months INT DEFAULT 0,
                revenue_strategy ENUM('build_to_sell', 'build_to_rent') NOT NULL,
                target_selling_price_per_unit DECIMAL(15, 2) DEFAULT 0,
                expected_monthly_rent_per_unit DECIMAL(15, 2) DEFAULT 0,
                target_occupancy_percent DECIMAL(5, 2) DEFAULT 0,
                target_roi_percent DECIMAL(10, 2) DEFAULT 0,
                target_irr_percent DECIMAL(10, 2) DEFAULT 0,
                minimum_dscr DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await db.execute(sql);
        console.log('✅ Table financial_strategies created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
}

createTable();
