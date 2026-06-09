-- Migration: Create financial_strategies table
-- Adds a table to store project-level financial strategy inputs and assumptions

CREATE TABLE IF NOT EXISTS financial_strategies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NULL,
  units INT DEFAULT 0,
  revenue_strategy VARCHAR(50) NULL,
  target_selling_price_per_unit DECIMAL(15,2) NULL,
  expected_monthly_rent_per_unit DECIMAL(15,2) NULL,
  target_occupancy_percent DECIMAL(5,2) NULL,
  land_acquisition_cost DECIMAL(15,2) DEFAULT 0,
  estimated_construction_cost DECIMAL(15,2) DEFAULT 0,
  permits_fees DECIMAL(15,2) DEFAULT 0,
  legal_fees DECIMAL(15,2) DEFAULT 0,
  architecture_fees DECIMAL(15,2) DEFAULT 0,
  contingency_reserve_percent DECIMAL(5,2) DEFAULT 0,
  developer_equity DECIMAL(15,2) DEFAULT 0,
  bank_loan_amount DECIMAL(15,2) DEFAULT 0,
  annual_interest_rate DECIMAL(5,2) DEFAULT 0,
  loan_repayment_period_years INT DEFAULT 0,
  grace_period_months INT DEFAULT 0,
  operating_expenses_percent DECIMAL(5,2) DEFAULT 30,
  target_roi_percent DECIMAL(5,2) DEFAULT 0,
  target_irr_percent DECIMAL(5,2) DEFAULT 0,
  min_dscr DECIMAL(5,2) DEFAULT 0,
  created_by VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
