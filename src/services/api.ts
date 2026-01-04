import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { Job, Batch, Candidate } from '../types';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// ... existing interfaces ...

export interface CreateJobPayload {
  title: string;
  description: string;
  department: string;
  matrix: Array<{ id: string; name: string; weight: number }>;
  clusters: number;
  requiredSkills: string[];
}

export interface CreateBatchPayload {
  name: string;
}

export interface UploadCandidatePayload {
  name: string;
  email?: string;
  cvText: string;
  cvFile?: string; // base64 encoded
  cvFileName?: string;
}

export interface UploadCandidatesPayload {
  candidates: UploadCandidatePayload[];
}

export interface GetResultsParams {
  jobId?: string;
  batchId?: string;
  status?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor - Add Token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and potentially redirect
          localStorage.removeItem('token');
          // We can dispatch an event or handle redirect in Context
          // window.location.href = '/login'; // Optional: force redirect
        }
        
        if (error.response) {
          console.error('API Error:', error.response.data);
        } else if (error.request) {
          console.error('Network Error:', error.message);
        } else {
          console.error('Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // --- AUTH ---

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  }

  // --- JOBS ---

  async getJobs(): Promise<Job[]> {
    const response = await this.api.get<Job[]>('/jobs');
    return response.data;
  }

  async createJob(payload: CreateJobPayload): Promise<Job> {
    const response = await this.api.post<Job>('/jobs', payload);
    return response.data;
  }

  // --- BATCHES ---

  async createBatch(jobId: string, payload: CreateBatchPayload): Promise<Batch> {
    const response = await this.api.post<Batch>(`/jobs/${jobId}/batches`, payload);
    return response.data;
  }

  // --- CANDIDATES ---

  async uploadCandidates(batchId: string, payload: UploadCandidatesPayload): Promise<Candidate[]> {
    const response = await this.api.post<Candidate[]>(`/batches/${batchId}/candidates`, payload);
    return response.data;
  }

  async downloadCV(candidateId: string): Promise<Blob> {
    const response = await this.api.get(`/candidates/${candidateId}/cv`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // --- RESULTS ---

  async getResults(params?: GetResultsParams): Promise<Candidate[]> {
    const response = await this.api.get<Candidate[]>('/results', { params });
    return response.data;
  }

  async updateCandidateStatus(candidateId: string, status: 'accepted' | 'rejected'): Promise<Candidate> {
    const response = await this.api.patch<Candidate>(`/candidates/${candidateId}/status`, { status });
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
