import { ValidationError } from '../types';

export function validateUserId(userId: string): ValidationError | null {
  if (!userId || typeof userId !== 'string') {
    return { field: 'userId', message: 'User ID is required and must be a string' };
  }
  if (userId.length < 2 || userId.length > 50) {
    return { field: 'userId', message: 'User ID must be between 2 and 50 characters' };
  }
  return null;
}

export function validateProjectId(projectId: string): ValidationError | null {
  if (!projectId || typeof projectId !== 'string') {
    return { field: 'projectId', message: 'Project ID is required and must be a string' };
  }
  return null;
}

export function validateProjectName(name: string): ValidationError | null {
  if (!name || typeof name !== 'string') {
    return { field: 'name', message: 'Project name is required' };
  }
  if (name.length < 2 || name.length > 100) {
    return { field: 'name', message: 'Project name must be between 2 and 100 characters' };
  }
  return null;
}

export function validateEntryId(entryId: string): ValidationError | null {
  if (!entryId || typeof entryId !== 'string') {
    return { field: 'entryId', message: 'Entry ID is required' };
  }
  return null;
}

export function validateNotes(notes?: string): ValidationError | null {
  if (notes && typeof notes !== 'string') {
    return { field: 'notes', message: 'Notes must be a string' };
  }
  if (notes && notes.length > 500) {
    return { field: 'notes', message: 'Notes must not exceed 500 characters' };
  }
  return null;
}
