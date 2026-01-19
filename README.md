# TimeFlow - Professional Timekeeping Application

TimeFlow is a modern, full-stack timekeeping solution designed for efficient time tracking, project management, and reporting.

---

## 🚀 How to Run (Manual Setup)

*1. Install dependencies*

Open a terminal and run:

cd backend
npm install
cd ../frontend
npm install

*2. Build the Backend*

cd ../backend
npm run build

*3. Start the Backend*

npm start
The backend server will run on [http://localhost:3000](http://localhost:3000).

*4. Start the Frontend*

Open a new terminal window:

cd frontend
npm start
The frontend will run on [http://localhost:3000](http://localhost:3000) (or [http://localhost:3001](http://localhost:3001) if using Docker).

---

## ⚡ One-Click Setup (Windows)

You can use the included batch script for a full setup:

1. Ensure *Node.js* is installed.
2. Double-click run-app.bat in the project root.
   - Installs dependencies for both backend and frontend
   - Builds frontend and backend
   - Starts the backend server (serving both API and frontend)
3. Open your browser to [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Setup

If you have Docker installed:

docker-compose up --build

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:3000](http://localhost:3000)

To stop services:

docker-compose down

---

## 🛠️ System Flow & Deep Architecture

### 1. *Frontend (React)*
- Users interact with the UI to clock in/out, create projects, and view timesheets.
- All user actions trigger API requests to the backend via REST endpoints.
- The frontend is built with React and TypeScript, using Axios for HTTP requests.

### 2. *Backend (Node.js + Express)*
- The backend exposes RESTful APIs for time entries, projects, and reports.
- On each API call (e.g., clock in/out, create project), the backend:
  - Validates input using utility functions.
  - Processes business logic (e.g., prevents multiple active entries per user).
  - Publishes events to Kafka topics (if Kafka is available).
  - Updates in-memory storage for immediate data access.

### 3. *Kafka (Event Streaming Layer)*

- *Producer:* Backend publishes events (e.g., CLOCK_IN, CLOCK_OUT, PROJECT_CREATED) to Kafka topics.
- *Consumer:* Backend consumes these events and reconstructs the in-memory state (event sourcing pattern).
- *Topics:*
  - time-entry-events: All time entry actions.
  - project-events: Project creation events.
- *Graceful Fallback:* If Kafka is unavailable, the app automatically runs in in-memory mode within 5 seconds - no configuration needed.

#### Running with Kafka (Optional)

To enable Kafka event streaming:

1. Install Java JDK 17+ (e.g., `winget install Microsoft.OpenJDK.17`)
2. Download and extract Apache Kafka to `C:\kafka`
3. Start Zookeeper: `bin\windows\zookeeper-server-start.bat config\zookeeper.properties`
4. Start Kafka: `bin\windows\kafka-server-start.bat config\server.properties`
5. Create topics:
   - `bin\windows\kafka-topics.bat --create --topic time-entry-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1`
   - `bin\windows\kafka-topics.bat --create --topic project-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1`

Or use Docker: `docker-compose up -d zookeeper kafka`

### 4. *In-Memory Storage*
- All time entries and projects are stored in memory using JavaScript Maps.
- On startup, the backend can rebuild state by replaying Kafka events (if available).
- This enables resilience and fast access, but data is lost if the server restarts without Kafka.

### 5. *Static File Serving*
- The backend also serves the built frontend (React) as static files.
- Any unknown route falls back to index.html for client-side routing.

---

## 🔄 Full Process Flow

1. *User clocks in via frontend*
   - Frontend sends POST /api/time-entries/clock-in with user/project info.
   - Backend validates, checks for active entry, creates a new entry, publishes a CLOCK_IN event, and updates in-memory state.
2. *User clocks out*
   - Frontend sends POST /api/time-entries/clock-out/:id.
   - Backend validates, calculates duration, publishes a CLOCK_OUT event, and updates in-memory state.
3. *Project creation*
   - Frontend sends POST /api/projects.
   - Backend validates, creates project, publishes PROJECT_CREATED event, and updates in-memory state.
4. *Reporting*
   - Frontend requests timesheet data via /api/timesheets?userId=....
   - Backend aggregates completed entries, calculates hours and revenue, and returns a summary.
5. *Kafka Event Flow*
   - All state-changing actions are published as events.
   - Consumers listen and update in-memory Maps, ensuring eventual consistency and recoverability.

---

## 🧩 Project Structure

- /frontend: React application (UI)
- /backend: Node.js Express server (API & static file serving)
- /backend/src/kafka: Kafka integration (producer/consumer)
- /backend/src/services: Business logic
- /backend/src/types: TypeScript types and interfaces

---

## 🌐 Environment Variables

*Backend (.env):*
KAFKA_BROKER=localhost:9092
PORT=3000

*Frontend (.env):*
REACT_APP_API_URL=http://localhost:3000


