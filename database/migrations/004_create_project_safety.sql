-- Project Safety Monitoring Table
-- Stores real-time safety metrics for each project
CREATE TABLE IF NOT EXISTS project_safety (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  project_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  safety_score INT DEFAULT 0,
  days_without_incident INT DEFAULT 0,
  open_violations INT DEFAULT 0,
  ppe_compliance INT DEFAULT 0,
  last_inspection_date DATE,
  risk_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  status ENUM('Active', 'Inactive', 'Pending', 'Suspended') DEFAULT 'Active',
  total_inspections INT DEFAULT 0,
  total_incidents INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  INDEX idx_project_id (project_id),
  INDEX idx_risk_level (risk_level),
  INDEX idx_status (status),
  INDEX idx_safety_score (safety_score)
);

-- Seed initial safety data from existing projects
INSERT INTO project_safety (project_id, project_name, location, safety_score, days_without_incident, open_violations, ppe_compliance, last_inspection_date, risk_level, status, total_inspections, total_incidents)
SELECT 
  p.id,
  p.name,
  p.location,
  FLOOR(70 + RAND() * 30),
  FLOOR(5 + RAND() * 60),
  FLOOR(RAND() * 8),
  FLOOR(75 + RAND() * 25),
  CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY,
  CASE 
    WHEN RAND() < 0.5 THEN 'Low'
    WHEN RAND() < 0.8 THEN 'Medium'
    ELSE 'High'
  END,
  p.status,
  FLOOR(1 + RAND() * 10),
  FLOOR(RAND() * 5)
FROM projects p
WHERE p.status IN ('Planning', 'In Progress')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
