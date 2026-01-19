import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export async function clockIn(
  userId: string, 
  projectId: string, 
  notes?: string,
  isBillable?: boolean,
  tags?: string[]
) {
  const response = await api.post('/api/time-entries/clock-in', {
    userId,
    projectId,
    notes,
    isBillable,
    tags,
  });
  return response.data.data;
}

export async function clockOut(entryId: string, notes?: string) {
  const response = await api.post(`/api/time-entries/clock-out/${entryId}`, {
    notes,
  });
  return response.data.data;
}

export async function getTimeEntries() {
  const response = await api.get('/api/time-entries');
  return response.data.data || [];
}

export async function getActiveEntry(userId: string) {
  const response = await api.get('/api/time-entries/active', {
    params: { userId },
  });
  return response.data.data;
}

export async function getTimesheet(userId: string) {
  const response = await api.get('/api/timesheets', {
    params: { userId },
  });
  return response.data.data;
}

export async function createProject(
  name: string,
  description: string,
  hourlyRate?: number
) {
  const response = await api.post('/api/projects', {
    name,
    description,
    hourlyRate,
  });
  return response.data.data;
}

export async function getProjects() {
  const response = await api.get('/api/projects');
  return response.data.data;
}
