-- Migration number: 0001_initial_schema
DROP TABLE IF EXISTS EvaluationResults;
DROP TABLE IF EXISTS Candidates;
DROP TABLE IF EXISTS Batches;
DROP TABLE IF EXISTS Jobs;

CREATE TABLE Jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    matrix TEXT, -- JSON string for AssessmentMatrix
    clusters INTEGER DEFAULT 3,
    requiredSkills TEXT, -- JSON string
    createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE Batches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    jobId TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active' | 'archived'
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (jobId) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Candidates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    jobTitle TEXT,
    batchId TEXT NOT NULL,
    skills TEXT, -- JSON string
    status TEXT DEFAULT 'processing', -- 'processing' | 'done' | 'failed' | 'accepted' | 'rejected'
    score INTEGER DEFAULT 0,
    summary TEXT,
    submissionDate TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (batchId) REFERENCES Batches(id) ON DELETE CASCADE
);

CREATE TABLE EvaluationResults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    criteria TEXT NOT NULL,
    description TEXT,
    score INTEGER NOT NULL,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id) ON DELETE CASCADE
);
