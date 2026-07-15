-- Migration 007: Runtime Schema Additions
-- Moved from runtime route execution to migration system

-- Add missing columns for notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_date DATE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS scheduled_date DATETIME;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_by VARCHAR(255) DEFAULT 'System';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(50) DEFAULT 'all';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipients VARCHAR(255) DEFAULT 'All Staff';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Convert ENUM columns to VARCHAR to accept all values
ALTER TABLE notifications MODIFY COLUMN priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) DEFAULT 'Info';
