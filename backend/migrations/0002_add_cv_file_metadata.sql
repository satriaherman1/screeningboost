-- Migration number: 0002_add_cv_file_metadata
-- Add file metadata columns to Candidates table for R2 storage

ALTER TABLE Candidates ADD COLUMN cvFileKey TEXT;
ALTER TABLE Candidates ADD COLUMN cvFileName TEXT;
ALTER TABLE Candidates ADD COLUMN cvFileSize INTEGER;
ALTER TABLE Candidates ADD COLUMN cvMimeType TEXT DEFAULT 'application/pdf';
