# Backend

## Initialize

```bash
cd backend
npm install
```

## Build

```bash
npm run build
```

## Development (with hot reload)

```bash
npm run dev
```

## Architecture

The backend uses Express.js for HTTP APIs and KafkaJS for event streaming:

### Kafka Flow
- **Producer**: When clock in/out occurs, events are published to Kafka topics
- **Consumer**: Events are consumed and stored in memory (event sourcing pattern)
- **Topics**:
  - `time-entry-events`: Clock in/out events
  - `project-events`: Project creation events

### In-Memory Storage
Data is maintained in memory using Maps, rebuilt from Kafka events on startup.

---

# Frontend

## Initialize

```bash
cd frontend
npm install
```

## Development

```bash
npm start
```

Runs on `http://localhost:3000`

## Build

```bash
npm run build
```

Produces optimized production build in `build/` directory.

---

# Quick Start with Docker

```bash
# Build and start all services
docker-compose up --build

# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
```

Stop services:
```bash
docker-compose down
```

---

# Kafka Setup (Local)

If running without Docker:

1. Install Kafka from https://kafka.apache.org/
2. Start Zookeeper: `bin/zookeeper-server-start.sh config/zookeeper.properties`
3. Start Kafka: `bin/kafka-server-start.sh config/server.properties`

---

# Environment Variables

## Backend (.env)
```
KAFKA_BROKER=localhost:9092
PORT=3000
```

## Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000
```
