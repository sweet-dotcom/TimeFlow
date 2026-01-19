export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  clockInTime: number;
  clockOutTime?: number;
  duration?: number;
  status: 'active' | 'completed';
  notes?: string;
  breakTime?: number; // in milliseconds
  isBillable?: boolean;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  hourlyRate?: number;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  createdAt: number;
}

export interface TimeEntryEvent {
  eventType: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: number;
  userId: string;
  projectId: string;
  entryId: string;
  data: Record<string, any>;
}

export interface Timesheet {
  userId: string;
  period: string;
  projects: {
    projectId: string;
    projectName: string;
    totalHours: number;
    revenue?: number;
  }[];
  totalHours: number;
  totalRevenue?: number;
  breakTime?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
