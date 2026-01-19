import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'timekeeping-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'timekeeping-group' });

export async function initializeKafka() {
  console.log('Kafka initialization skipped - using in-memory mode');
  // Kafka integration can be enabled later by uncommenting code below
  // For now, we'll use in-memory storage with console logging
}

export async function closeKafka() {
  await producer.disconnect();
  await consumer.disconnect();
}
