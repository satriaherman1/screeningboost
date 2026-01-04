export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AssessmentCriteria {
  id: string;
  name: string;
  weight: number;
}

export type AssessmentMatrix = AssessmentCriteria[];

export type CandidateStatus = 'processing' | 'done' | 'failed' | 'accepted' | 'rejected';

export interface EvaluationResult {
  criteria: string;
  description: string;
  score: number; // 0-100 or percentage
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string; // e.g., Backend Engineer
  batch?: string;
  submissionDate?: string;
  skills: string[];
  status: CandidateStatus;
  score?: number;
  evaluation?: EvaluationResult[];
  summary?: string;
}

export interface Batch {
  id: string;
  name: string;
  jobId: string;
  description?: string;
  candidates: Candidate[];
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  matrix: AssessmentMatrix;
  clusters: number;
  requiredSkills: string[];
  batches: Batch[];
  createdAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  description: string;
  candidates: Candidate[];
  jobId: string;
  batchId: string;
}
