-- Create database schemas for Academy Management System

-- Core schema for main application tables
CREATE SCHEMA IF NOT EXISTS core;

-- Authentication schema for user management
CREATE SCHEMA IF NOT EXISTS auth;

-- Curriculum schema for educational content
CREATE SCHEMA IF NOT EXISTS curriculum;

-- Scheduling schema for session management
CREATE SCHEMA IF NOT EXISTS scheduling;

-- Locations schema for facility management
CREATE SCHEMA IF NOT EXISTS locations;

-- Audit schema for change tracking
CREATE SCHEMA IF NOT EXISTS audit;

-- Set default schema search path
ALTER DATABASE academy_db SET search_path TO core, auth, curriculum, scheduling, locations, audit, public;

-- Grant permissions to academy_user
GRANT USAGE ON SCHEMA core TO academy_user;
GRANT USAGE ON SCHEMA auth TO academy_user;
GRANT USAGE ON SCHEMA curriculum TO academy_user;
GRANT USAGE ON SCHEMA scheduling TO academy_user;
GRANT USAGE ON SCHEMA locations TO academy_user;
GRANT USAGE ON SCHEMA audit TO academy_user;

-- Grant create permissions for development
GRANT CREATE ON SCHEMA core TO academy_user;
GRANT CREATE ON SCHEMA auth TO academy_user;
GRANT CREATE ON SCHEMA curriculum TO academy_user;
GRANT CREATE ON SCHEMA scheduling TO academy_user;
GRANT CREATE ON SCHEMA locations TO academy_user;
GRANT CREATE ON SCHEMA audit TO academy_user;