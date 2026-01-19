import { v4 as uuidv4 } from 'uuid';
import { TimeEntry, Project } from '../types';
import { publishTimeEntryEvent, publishProjectEvent } from '../kafka/producer';
import { getTimeEntries, getProject, getProjects, upsertTimeEntry, upsertProject } from '../kafka/consumer';
import * as validation from '../utils/validation';

export async function clockIn(
  userId: string,
  projectId: string,
  notes?: string,
  isBillable?: boolean,
  tags?: string[]
): Promise<{ entry: TimeEntry; error?: string }> {
  const userError = validation.validateUserId(userId);
  if (userError) {
    return { entry: null as any, error: userError.message };
  }

  const projectError = validation.validateProjectId(projectId);
  if (projectError) {
    return { entry: null as any, error: projectError.message };
  }

  const notesError = validation.validateNotes(notes);
  if (notesError) {
    return { entry: null as any, error: notesError.message };
  }

  // Check if user already has an active entry
  const activeEntry = getTimeEntries().find(
    (e) => e.userId === userId && e.status === 'active'
  );
  if (activeEntry) {
    return {
      entry: null as any,
      error: `User ${userId} already has an active time entry. Clock out first.`,
    };
  }

  const entryId = uuidv4();
  const clockInTime = Date.now();

  await publishTimeEntryEvent({
    eventType: 'CLOCK_IN',
    timestamp: clockInTime,
    userId,
    projectId,
    entryId,
    data: { clockInTime, notes, isBillable, tags },
  });

  const entry = {
    id: entryId,
    userId,
    projectId,
    clockInTime,
    status: 'active' as const,
    notes,
    isBillable,
    tags,
  };

  // Upsert to local state to support in-memory mode without Kafka
  upsertTimeEntry(entryId, entry);

  return {
    entry,
  };
}

export async function clockOut(
  entryId: string,
  notes?: string
): Promise<{ entry: TimeEntry | null; error?: string }> {
  const entryError = validation.validateEntryId(entryId);
  if (entryError) {
    return { entry: null, error: entryError.message };
  }

  const notesError = validation.validateNotes(notes);
  if (notesError) {
    return { entry: null, error: notesError.message };
  }

  const entries = getTimeEntries();
  const entry = entries.find((e) => e.id === entryId);

  if (!entry) {
    return { entry: null, error: `Time entry ${entryId} not found` };
  }

  if (entry.status === 'completed') {
    return { entry: null, error: 'This entry is already clocked out' };
  }

  const clockOutTime = Date.now();
  const duration = clockOutTime - entry.clockInTime - (entry.breakTime || 0);

  if (duration < 60000) {
    // Less than 1 minute
    return {
      entry: null,
      error: 'Entry duration must be at least 1 minute',
    };
  }

  await publishTimeEntryEvent({
    eventType: 'CLOCK_OUT',
    timestamp: clockOutTime,
    userId: entry.userId,
    projectId: entry.projectId,
    entryId,
    data: { clockOutTime, duration, notes },
  });

  const updatedEntry = {
    ...entry,
    clockOutTime,
    duration,
    status: 'completed' as const,
    notes: notes || entry.notes,
  };

  upsertTimeEntry(entryId, updatedEntry);

  return {
    entry: updatedEntry,
  };
}

export async function createProject(
  name: string,
  description: string,
  hourlyRate?: number
): Promise<{ project: Project | null; error?: string }> {
  const nameError = validation.validateProjectName(name);
  if (nameError) {
    return { project: null, error: nameError.message };
  }

  if (description && typeof description !== 'string') {
    return { project: null, error: 'Description must be a string' };
  }

  if (hourlyRate && (typeof hourlyRate !== 'number' || hourlyRate < 0)) {
    return { project: null, error: 'Hourly rate must be a positive number' };
  }

  const projectId = uuidv4();
  const createdAt = Date.now();

  await publishProjectEvent(projectId, name);

  const project: Project = {
    id: projectId,
    name,
    description: description || '',
    hourlyRate,
    createdAt,
  };

  upsertProject(projectId, project);

  return { project };
}

export function getAllTimeEntries(): TimeEntry[] {
  return getTimeEntries();
}

export function getActiveTimeEntry(userId: string): TimeEntry | undefined {
  return getTimeEntries().find((e) => e.userId === userId && e.status === 'active');
}

export function generateTimesheet(userId: string): any {
  const entries = getTimeEntries().filter(
    (e) => e.userId === userId && e.status === 'completed'
  );

  if (entries.length === 0) {
    return {
      userId,
      period: new Date().toISOString().split('T')[0],
      projects: [],
      totalHours: 0,
      totalRevenue: 0,
    };
  }

  const projectHours = new Map<string, number>();
  let totalBreakTime = 0;

  entries.forEach((entry) => {
    const duration = entry.duration || 0;
    totalBreakTime += entry.breakTime || 0;
    const hours = duration / (1000 * 60 * 60);
    const current = projectHours.get(entry.projectId) || 0;
    projectHours.set(entry.projectId, current + hours);
  });

  const projects = Array.from(projectHours.entries()).map(([projectId, hours]) => {
    const project = getProject(projectId);
    return {
      projectId,
      projectName: project?.name || 'Unknown',
      totalHours: parseFloat(hours.toFixed(2)),
      revenue: project?.hourlyRate
        ? parseFloat((hours * project.hourlyRate).toFixed(2))
        : undefined,
    };
  });

  const totalHours = projects.reduce((sum, p) => sum + p.totalHours, 0);
  const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);

  return {
    userId,
    period: new Date().toISOString().split('T')[0],
    projects,
    totalHours: parseFloat(totalHours.toFixed(2)),
    totalRevenue: totalRevenue > 0 ? parseFloat(totalRevenue.toFixed(2)) : undefined,
    breakTime: totalBreakTime,
  };
}

export function getAllProjects() {
  return getProjects();
}
