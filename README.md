# TimeFlow - Professional Timekeeping Application

TimeFlow is a modern, full-stack timekeeping solution designed for efficient time tracking, project management, and reporting.

## ?? How to Run (Windows)

**The easiest way to run the application is using the included start script:**

1. Ensure **Node.js** is installed on your computer.
2. Double-click the **un-app.bat** file in the main folder.
3. The script will automatically:
   - Install all dependencies.
   - Build the Frontend and Backend.
   - Start the server on **http://localhost:3000**.

---

## ?? How to Run (Docker)

If you have Docker installed, you can run the app in a containerized environment:

`ash
docker-compose up --build
``nThe app will be available at http://localhost:3000

---

## ? Features

- **Clock In/Out**: Track work sessions with "Billable" status and Tagging support.
- **Project Management**: Create projects with hourly rates and definitions.
- **Dashboard**: Real-time overview of active timers.
- **Timesheets**: View aggregated hours and calculated revenue.
- **Resilient Architecture**: Supports Apache Kafka for event streaming, but automatically falls back to In-Memory storage if Kafka is not available.

## ??? Tech Stack

- **Frontend**: React, TypeScript, Lucide Icons
- **Backend**: Node.js, Express, TypeScript
- **Architecture**: Event-Driven (Kafka) / Monolithic (Fallback)

## ?? Project Structure

- /frontend: React application (UI)
- /backend: Node.js Express server (API & Static File Serving)
- /kafka-events: Event definitions for streaming data
