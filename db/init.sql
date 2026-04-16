-- Seed data for BRM App
-- Note: GORM auto-migrates schema. This file seeds initial data.

-- Wait for tables to be created by the Go backend before inserting.
-- This seed is run AFTER the backend performs migrations on first start.
-- The backend uses an init function to seed if no users exist.

-- Seed is handled by Go backend's database/seed.go
-- This file exists for documentation and manual seeding reference.

SELECT 'Database initialized - seed data will be inserted by Go backend on first start' AS info;
