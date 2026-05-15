-- Migration: Drop duplicate materials tables (singular vs plural)
-- Issue: Database had both 'material_in' and 'materials_in', 'material_out' and 'materials_out'
-- Solution: Drop the singular (duplicate) tables. Keep the plural ones used by the backend.

-- Drop duplicate table (singular)
DROP TABLE IF EXISTS material_in;

-- Drop duplicate table (singular)
DROP TABLE IF EXISTS material_out;

-- Verify correct tables remain
-- materials_inventory, materials_in, materials_out should remain
