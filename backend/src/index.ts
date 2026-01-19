import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeKafka, closeKafka } from './kafka/client';
import { startConsumers } from './kafka/consumer';
import * as timekeepingController from './controllers/timekeepingController';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.post('/api/time-entries/clock-in', timekeepingController.clockIn);
app.post('/api/time-entries/clock-out/:id', timekeepingController.clockOut);
app.get('/api/time-entries', timekeepingController.getTimeEntries);
app.get('/api/time-entries/active', timekeepingController.getActiveEntry);
app.get('/api/timesheets', timekeepingController.getTimesheet);
app.post('/api/projects', timekeepingController.createProject);
app.get('/api/projects', timekeepingController.getProjects);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve static frontend files
const frontendPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: Date.now(),
  });
});

// Initialize and start server
async function start() {
  try {
    // Try to initialize Kafka, but don't fail if it's not available
    try {
      await initializeKafka();
      // Start consumers without waiting - they'll run in background
      // If they fail, they'll just log and continue
      startConsumers()
        .then(() => console.log('Consumers started'))
        .catch(() => console.log('Consumers not started - Kafka may not be available'));
    } catch (kafkaError) {
      console.log('Kafka initialization skipped - using in-memory mode');
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down gracefully...');
      try {
        await closeKafka();
      } catch (e) {
        // Ignore errors during shutdown
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
