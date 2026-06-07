-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  violation_id VARCHAR(50) UNIQUE NOT NULL,
  date DATETIME NOT NULL,
  project VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  violators VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  immediate_action TEXT,
  corrective_action VARCHAR(50),
  action_deadline DATE,
  status VARCHAR(20) DEFAULT 'pending',
  reported_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_violation_project (project),
  INDEX idx_violation_status (status)
);

-- Seed initial data matching the previous sampleViolations
INSERT INTO violations (
  violation_id, date, project, type, severity, violators, location, 
  description, immediate_action, corrective_action, action_deadline, status, reported_by
) VALUES 
(
  'VIO-2026-010', '2026-04-15 14:30:00', 'Masaki Residential Complex', 'procedure-violation', 'major', 
  'Patricia Johnson', 'Welding Area - Section B', 'Violation of welding safety procedures', 
  'Welding stopped, safety briefing conducted', 'warning', '2026-04-16', 'resolved', 'Patricia Johnson'
),
(
  'VIO-2026-011', '2026-04-18 09:30:00', 'Sports Complex', 'unsafe-act', 'critical', 
  'Thomas Anderson', 'Foundation Excavation', 'Unsafe excavation practices endangering workers', 
  'Work stopped, worker suspended pending investigation', 'suspension', '2026-04-20', 'pending', 'Thomas Anderson'
),
(
  'VIO-2026-012', '2026-04-22 11:45:00', 'Telecommunications Tower', 'improper-ppe', 'minor', 
  'Jennifer Lee', 'Tower Base Area', 'Improper use of safety harness', 
  'Work stopped, proper harness fitted', 'warning', '2026-04-23', 'resolved', 'Jennifer Lee'
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
