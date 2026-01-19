import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'timekeeping-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'timekeeping-group' });

let isKafkaConnected = false;

export async function initializeKafka() {
  try {
    await producer.connect();
    isKafkaConnected = true;
    console.log('✓ Kafka producer connected');
  } catch (error) {
    console.log('⚠ Kafka unavailable - running in in-memory mode');
    console.log('To use Kafka: Start Kafka broker on localhost:9092');
    isKafkaConnected = false;
  }
}

export function isKafkaAvailable() {
  return isKafkaConnected;
}

export async function closeKafka() {
  try {
    if (isKafkaConnected) {
      await producer.disconnect();
      await consumer.disconnect();
    }
  } catch (e) {
    // Ignore disconnect errors
  }
}
