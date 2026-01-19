import { producer, isKafkaAvailable } from './client';
import { TimeEntryEvent } from '../types';

export async function publishTimeEntryEvent(event: TimeEntryEvent) {
  if (!isKafkaAvailable()) {
    return; // Skip if Kafka not available
  }
  
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
    console.log(`✓ Published ${event.eventType} event to Kafka`);
  } catch (error) {
    console.log('⚠ Could not publish to Kafka:', error instanceof Error ? error.message : String(error));
  }
}

export async function publishProjectEvent(projectId: string, projectName: string) {
  if (!isKafkaAvailable()) {
    return; // Skip if Kafka not available
  }
  
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
    console.log('✓ Published PROJECT_CREATED event to Kafka');
  } catch (error) {
    console.log('⚠ Could not publish project event to Kafka:', error instanceof Error ? error.message : String(error));
  }
}
