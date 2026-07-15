-- ============================================================
-- Migration 006: Consolidate runtime schema changes from work.js
-- These columns are added by work.js at request time via ALTER TABLE.
-- Moving them here ensures the schema is defined in one place.
-- ============================================================

-- ppe_issuance: Add columns that work.js dynamically adds
-- The table already exists in 001_create_tables.sql with ENUM types.
-- work.js widens these to VARCHAR and adds extra columns at runtime.

ALTER TABLE ppe_issuance
    MODIFY COLUMN ppe_condition VARCHAR(50) DEFAULT 'new',
    MODIFY COLUMN status VARCHAR(50) DEFAULT 'Issued',
    MODIFY COLUMN issued_by VARCHAR(255);

-- Add columns that work.js adds dynamically (ignore if they already exist)
-- worker_name, worker_id, project, department, ppe_items, worker_signature
SET @dbname = DATABASE();

-- Helper: Add column only if it does not already exist
-- MySQL doesn't have IF NOT EXISTS for ADD COLUMN, so we use a procedure

DELIMITER //
CREATE PROCEDURE IF NOT EXISTS add_column_if_not_exists(
    IN tbl VARCHAR(64),
    IN col VARCHAR(64),
    IN col_def VARCHAR(255)
)
BEGIN
    SET @col_exists = 0;
    SELECT COUNT(*) INTO @col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col;

    IF @col_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', col, ' ', col_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//
DELIMITER ;

-- ppe_issuance extra columns
CALL add_column_if_not_exists('ppe_issuance', 'worker_name', 'VARCHAR(255)');
CALL add_column_if_not_exists('ppe_issuance', 'worker_id', 'VARCHAR(50)');
CALL add_column_if_not_exists('ppe_issuance', 'project', 'VARCHAR(255)');
CALL add_column_if_not_exists('ppe_issuance', 'department', 'VARCHAR(100)');
CALL add_column_if_not_exists('ppe_issuance', 'ppe_items', 'JSON');
CALL add_column_if_not_exists('ppe_issuance', 'worker_signature', 'VARCHAR(255)');

-- ppe_inventory: Widen ppe_type if it's an ENUM
CALL add_column_if_not_exists('ppe_inventory', 'category', 'VARCHAR(100)');
CALL add_column_if_not_exists('ppe_inventory', 'brand', 'VARCHAR(100)');
CALL add_column_if_not_exists('ppe_inventory', 'supplier', 'VARCHAR(255)');
CALL add_column_if_not_exists('ppe_inventory', 'location', 'VARCHAR(255)');
CALL add_column_if_not_exists('ppe_inventory', 'last_restocked', 'DATE');

-- worker_assignments extra columns
CALL add_column_if_not_exists('worker_assignments', 'worker_name', 'VARCHAR(255)');
CALL add_column_if_not_exists('worker_assignments', 'worker_id_number', 'VARCHAR(50)');
CALL add_column_if_not_exists('worker_assignments', 'phone', 'VARCHAR(20)');
CALL add_column_if_not_exists('worker_assignments', 'skills', 'TEXT');
CALL add_column_if_not_exists('worker_assignments', 'daily_rate', 'DECIMAL(10,2)');
CALL add_column_if_not_exists('worker_assignments', 'assignment_type', "VARCHAR(50) DEFAULT 'Regular'");

-- notifications extra columns
CALL add_column_if_not_exists('notifications', 'priority', "VARCHAR(20) DEFAULT 'normal'");
CALL add_column_if_not_exists('notifications', 'action_url', 'VARCHAR(500)');
CALL add_column_if_not_exists('notifications', 'action_type', 'VARCHAR(50)');
CALL add_column_if_not_exists('notifications', 'reference_id', 'INT');
CALL add_column_if_not_exists('notifications', 'reference_type', 'VARCHAR(50)');
CALL add_column_if_not_exists('notifications', 'is_read', 'TINYINT(1) DEFAULT 0');

-- Clean up
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
