import { consumer, isKafkaAvailable } from './client';
import { TimeEntry, Project } from '../types';

const timeEntries = new Map<string, TimeEntry>();
const projects = new Map<string, Project>();

export async function startConsumers() {
  if (!isKafkaAvailable()) {
    console.log('⚠ Kafka consumers not started - Kafka unavailable');
    return;
  }

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'time-entry-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'project-events', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          
          if (topic === 'time-entry-events') {
            handleTimeEntryEvent(data);
          } else if (topic === 'project-events') {
            handleProjectEvent(data);
          }
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      },
    });
    
    console.log('✓ Kafka consumers started');
  } catch (error) {
    console.log('⚠ Could not start Kafka consumers:', error instanceof Error ? error.message : String(error));
  }
}

function handleTimeEntryEvent(event: any) {
  const { eventType, entryId, userId, projectId, data } = event;

  if (eventType === 'CLOCK_IN') {
    timeEntries.set(entryId, {
      id: entryId,
      userId,
      projectId,
      clockInTime: data.clockInTime,
      status: 'active',
    });
    console.log(`Time entry ${entryId} clocked in`);
  } else if (eventType === 'CLOCK_OUT') {
    const entry = timeEntries.get(entryId);
    if (entry) {
      entry.clockOutTime = data.clockOutTime;
      entry.duration = data.clockOutTime - entry.clockInTime;
      entry.status = 'completed';
      console.log(`Time entry ${entryId} clocked out. Duration: ${entry.duration}ms`);
    }
  }
}

function handleProjectEvent(event: any) {
  const { eventType, projectId, projectName } = event;

  if (eventType === 'PROJECT_CREATED') {
    projects.set(projectId, {
      id: projectId,
      name: projectName,
      description: '',
      createdAt: Date.now(),
    });
    console.log(`Project ${projectName} created`);
  }
}

export function getTimeEntries() {
  return Array.from(timeEntries.values());
}

export function getTimeEntry(id: string) {
  return timeEntries.get(id);
}

export function getProjects() {
  return Array.from(projects.values());
}

export function getProject(id: string) {
  return projects.get(id);
}

export function upsertTimeEntry(id: string, entry: TimeEntry) {
  timeEntries.set(id, entry);
}

export function upsertProject(id: string, project: Project) {
  projects.set(id, project);
}
