-- Create PostgreSQL extensions for Academy Management System

-- UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full text search extension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Case-insensitive text extension
CREATE EXTENSION IF NOT EXISTS "citext";

-- Enable row-level security
-- This will be configured per table as needed