import axios from 'axios';

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'https://carrier-os-server.vercel.app';
export const API_SERVER_URL = RAW_BASE_URL.replace(/\/api\/?$/, '');
export const API_BASE_URL = `${API_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const scanJobs = async () => {
  const response = await api.post('/jobs/scan');
  return response.data;
};

export const generateInterviewPrep = async (applicationId: string) => {
  const response = await api.post('/ai/generate-interview-prep', { applicationId });
  return response.data;
};

export const generateApplication = async (jobId: string) => {
  const response = await api.post('/ai/generate-application', { jobId });
  return response.data;
};

export const triggerAutoApply = async (applicationId: string) => {
  const response = await api.post(`/applications/${applicationId}/auto-apply`);
  return response.data;
};

export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const getResumes = async () => {
  const response = await api.get('/resumes');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getObservabilityStats = async () => {
  const response = await api.get('/dashboard/observability');
  return response.data;
};

export const updateMe = async (data: any) => {
  const response = await api.put('/auth/me', data);
  return response.data;
};

export const saveResume = async (data: any) => {
  const response = await api.put('/resumes', data);
  return response.data;
};

export const createApplication = async (jobId: string) => {
  const response = await api.post('/applications', { jobId });
  return response.data;
};

export const parseResumeFile = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/resumes/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCareerHealthScore = async () => {
  const response = await api.get('/ai/health-score');
  return response.data;
};

export const getExecutionTraces = async () => {
  const response = await api.get('/ai/traces');
  return response.data;
};

export default api;
