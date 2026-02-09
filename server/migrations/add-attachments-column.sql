-- Migration to add attachments column to applied_jobs table
-- Run this SQL script in your MySQL database

USE bidding_tracker; -- Replace with your actual database name

-- Add attachments column to applied_jobs table
ALTER TABLE applied_jobs
ADD COLUMN attachments JSON DEFAULT NULL
COMMENT 'Stores array of file attachment metadata (filename, originalName, size, mimetype, path)';

-- Verify the column was added
DESCRIBE applied_jobs;
