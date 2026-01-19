import { Request, Response } from 'express';
import * as timekeepingService from '../services/timekeeping';
import { ApiResponse } from '../types';

function sendResponse<T>(res: Response, success: boolean, data?: T, error?: string, statusCode = 200) {
  const response: ApiResponse<T> = {
    success,
    timestamp: Date.now(),
  };
  if (data) response.data = data;
  if (error) response.error = error;
  res.status(statusCode).json(response);
}

export async function clockIn(req: Request, res: Response) {
  try {
    const { userId, projectId, notes, isBillable, tags } = req.body;

    const result = await timekeepingService.clockIn(userId, projectId, notes, isBillable, tags);
    
    if (result.error) {
      return sendResponse(res, false, undefined, result.error, 400);
    }

    sendResponse(res, true, result.entry, undefined, 201);
  } catch (error) {
    console.error('Clock in error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}

export async function clockOut(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await timekeepingService.clockOut(id, notes);
    
    if (result.error) {
      return sendResponse(res, false, undefined, result.error, 400);
    }

    sendResponse(res, true, result.entry);
  } catch (error) {
    console.error('Clock out error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const { name, description, hourlyRate } = req.body;

    const result = await timekeepingService.createProject(name, description, hourlyRate);
    
    if (result.error) {
      return sendResponse(res, false, undefined, result.error, 400);
    }

    sendResponse(res, true, result.project, undefined, 201);
  } catch (error) {
    console.error('Create project error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}

export function getTimeEntries(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    const entries = timekeepingService.getAllTimeEntries();
    
    const filtered = userId 
      ? entries.filter(e => e.userId === userId)
      : entries;

    sendResponse(res, true, filtered);
  } catch (error) {
    console.error('Get time entries error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}

export function getActiveEntry(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return sendResponse(res, false, undefined, 'User ID is required', 400);
    }

    const entry = timekeepingService.getActiveTimeEntry(String(userId));
    sendResponse(res, true, entry || null);
  } catch (error) {
    console.error('Get active entry error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}

export function getTimesheet(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return sendResponse(res, false, undefined, 'User ID is required', 400);
    }

    const timesheet = timekeepingService.generateTimesheet(String(userId));
    sendResponse(res, true, timesheet);
  } catch (error) {
    console.error('Get timesheet error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}

export function getProjects(req: Request, res: Response) {
  try {
    const projects = timekeepingService.getAllProjects();
    sendResponse(res, true, projects);
  } catch (error) {
    console.error('Get projects error:', error);
    sendResponse(res, false, undefined, 'Internal server error', 500);
  }
}
