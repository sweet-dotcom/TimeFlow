import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'timekeeping-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  // Configure quick failure when Kafka is not available
  connectionTimeout: 3000,
  retry: {
    initialRetryTime: 100,
    retries: 2,
  },
  // Suppress noisy connection error logs when Kafka is unavailable
  logLevel: logLevel.ERROR,
  logCreator: () => ({ namespace, level, log }) => {
    // Only log critical errors, suppress connection refused messages
    if (level === logLevel.ERROR && log.message?.includes('Connection error')) {
      return; // Suppress connection errors since we handle them gracefully
    }
  },
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'timekeeping-group' });

let isKafkaConnected = false;

export async function initializeKafka() {
  try {
    // Use a timeout to prevent hanging if Kafka is unavailable
    const connectPromise = producer.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Kafka connection timeout')), 5000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    isKafkaConnected = true;
    console.log('✓ Kafka producer connected');
  } catch (error) {
    console.log('⚠ Kafka unavailable - running in in-memory mode');
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
