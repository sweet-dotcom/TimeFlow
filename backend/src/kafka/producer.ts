import { producer } from './client';
import { TimeEntryEvent } from '../types';

export async function publishTimeEntryEvent(event: TimeEntryEvent) {
  try {
    await producer.send({
      topic: 'time-entry-events',
      messages: [
        {
          key: `${event.userId}-${event.projectId}`,
          value: JSON.stringify(event),
          partition: 0,
        },
      ],
    });
    console.log(`Published ${event.eventType} event for entry ${event.entryId}`);
  } catch (error) {
    console.warn('Warning: Could not publish to Kafka:', error);
    // Continue without Kafka
  }
}

export async function publishProjectEvent(projectId: string, projectName: string) {
  try {
    await producer.send({
      topic: 'project-events',
      messages: [
        {
          key: projectId,
          value: JSON.stringify({
            eventType: 'PROJECT_CREATED',
            timestamp: Date.now(),
            projectId,
            projectName,
          }),
          partition: 0,
        },
      ],
    });
  } catch (error) {
    console.warn('Warning: Could not publish project event to Kafka:', error);
    // Continue without Kafka
  }
}
