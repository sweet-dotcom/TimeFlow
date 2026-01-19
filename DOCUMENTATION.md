# TIMEFLOW
## Technical Documentation

---

**Document Version:** 1.0  
**Date:** January 19, 2026  
**Author:** Development Team  

---

## TABLE OF CONTENTS

1. Overview
2. System Architecture  
3. API Reference  
4. Data Models  
5. Frontend Components  
6. Kafka Integration  
7. Deployment Guide  

---

## 1. OVERVIEW

### 1.1 Introduction

TimeFlow is a professional full-stack timekeeping application designed for organizations to efficiently track work hours, manage projects, and generate comprehensive timesheets. The application leverages modern web technologies to deliver a seamless user experience.

### 1.2 Technology Stack

**Frontend Layer**
- React 18 with TypeScript
- Axios for HTTP requests
- CSS3 for styling

**Backend Layer**
- Node.js runtime environment
- Express.js web framework
- TypeScript for type safety

**Event Streaming**
- Apache Kafka for message queuing
- KafkaJS client library

**Containerization**
- Docker for container management
- Docker Compose for orchestration

### 1.3 Key Features

1. **Time Tracking** — Clock in and out functionality with automatic duration calculation
2. **Project Management** — Create and manage projects with hourly billing rates
3. **Timesheet Generation** — Automated timesheet reports with revenue calculations
4. **Real-time Events** — Kafka-powered event streaming for data consistency
5. **Event Sourcing** — Complete audit trail of all time entries
6. **Docker Support** — One-command deployment with Docker Compose

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Overview

The TimeFlow application follows a three-tier architecture consisting of a presentation layer (Frontend), business logic layer (Backend), and an event streaming layer (Kafka).

**System Diagram:**

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│     FRONTEND     │  HTTP   │     BACKEND      │ Events  │      KAFKA       │
│    React App     │────────▶│   Express.js     │────────▶│     Broker       │
│    Port 3001     │         │    Port 3000     │         │    Port 9092     │
│                  │         │                  │         │                  │
└──────────────────┘         └────────┬─────────┘         └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │   IN-MEMORY DB   │
                             │   Maps/Arrays    │
                             └──────────────────┘
```

### 2.2 Request Flow

The following describes how a typical request flows through the system:

**Step 1:** User interacts with the React user interface  
**Step 2:** Frontend sends an HTTP request to the backend REST API  
**Step 3:** Backend validates the input and processes business logic  
**Step 4:** Backend publishes an event to the appropriate Kafka topic  
**Step 5:** Kafka consumer processes the event and updates application state  
**Step 6:** Response is returned to the frontend for display  

### 2.3 Graceful Degradation

The application is designed to operate without Kafka. If the Kafka broker is unavailable, TimeFlow automatically switches to in-memory mode within 5 seconds. No manual configuration is required.

---

## 3. API REFERENCE

### 3.1 Base URL

All API endpoints are accessible at:

```
http://localhost:3000/api
```

### 3.2 Endpoints Summary

**Time Entry Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /time-entries/clock-in | Start a new time entry |
| POST | /time-entries/clock-out/:id | End an active time entry |
| GET | /time-entries | Retrieve all time entries |
| GET | /time-entries/active | Get active entry for user |

**Project Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /projects | Create a new project |
| GET | /projects | Retrieve all projects |

**Other Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /timesheets | Generate user timesheet |
| GET | /health | Server health check |

---

### 3.3 Endpoint Details

#### 3.3.1 Clock In

**Endpoint:** POST /api/time-entries/clock-in

**Description:** Starts tracking time for a user on a specific project.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier |
| projectId | string | Yes | Project to track time for |
| notes | string | No | Optional notes |
| isBillable | boolean | No | Whether entry is billable |
| tags | array | No | Array of tag strings |

**Example Request:**
```json
{
  "userId": "user-1",
  "projectId": "project-1",
  "notes": "Working on feature X",
  "isBillable": true,
  "tags": ["development"]
}
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": 1737270000000,
  "data": {
    "id": "entry-uuid",
    "userId": "user-1",
    "projectId": "project-1",
    "clockInTime": 1737270000000,
    "status": "active",
    "notes": "Working on feature X",
    "isBillable": true,
    "tags": ["development"]
  }
}
```

**Error Responses:**
- 400 Bad Request — User already has an active time entry
- 400 Bad Request — Invalid project ID

---

#### 3.3.2 Clock Out

**Endpoint:** POST /api/time-entries/clock-out/:id

**Description:** Stops tracking time for a specific entry.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Time entry ID to close |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| notes | string | No | Optional closing notes |

**Example Response:**
```json
{
  "success": true,
  "timestamp": 1737273600000,
  "data": {
    "id": "entry-uuid",
    "userId": "user-1",
    "projectId": "project-1",
    "clockInTime": 1737270000000,
    "clockOutTime": 1737273600000,
    "duration": 3600000,
    "status": "completed"
  }
}
```

---

#### 3.3.3 Get Time Entries

**Endpoint:** GET /api/time-entries

**Description:** Retrieves all time entries with optional user filtering.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | No | Filter by user ID |

**Example Response:**
```json
{
  "success": true,
  "timestamp": 1737270000000,
  "data": [
    {
      "id": "entry-1",
      "userId": "user-1",
      "projectId": "project-1",
      "clockInTime": 1737270000000,
      "clockOutTime": 1737273600000,
      "duration": 3600000,
      "status": "completed"
    }
  ]
}
```

---

#### 3.3.4 Get Active Entry

**Endpoint:** GET /api/time-entries/active

**Description:** Returns the currently active time entry for a user, or null if none exists.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID to check |

---

#### 3.3.5 Create Project

**Endpoint:** POST /api/projects

**Description:** Creates a new project.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Project name |
| description | string | Yes | Project description |
| hourlyRate | number | No | Billing rate per hour |

**Example Request:**
```json
{
  "name": "Website Redesign",
  "description": "Client website redesign project",
  "hourlyRate": 75
}
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": 1737270000000,
  "data": {
    "id": "project-uuid",
    "name": "Website Redesign",
    "description": "Client website redesign project",
    "hourlyRate": 75,
    "createdAt": 1737270000000
  }
}
```

---

#### 3.3.6 Get Projects

**Endpoint:** GET /api/projects

**Description:** Retrieves all projects.

---

#### 3.3.7 Get Timesheet

**Endpoint:** GET /api/timesheets

**Description:** Generates a timesheet summary for a user.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Example Response:**
```json
{
  "success": true,
  "timestamp": 1737270000000,
  "data": {
    "userId": "user-1",
    "period": "current",
    "projects": [
      {
        "projectId": "project-1",
        "projectName": "Website Redesign",
        "totalHours": 8.5,
        "revenue": 637.50
      }
    ],
    "totalHours": 8.5,
    "totalRevenue": 637.50
  }
}
```
```

---

## 4. DATA MODELS

### 4.1 TimeEntry

The TimeEntry model represents a single time tracking record.

| Field | Data Type | Required | Description |
|-------|-----------|----------|-------------|
| id | string | Yes | Unique identifier (UUID format) |
| userId | string | Yes | ID of user who created entry |
| projectId | string | Yes | Associated project ID |
| clockInTime | number | Yes | Start time (Unix timestamp in ms) |
| clockOutTime | number | No | End time (Unix timestamp in ms) |
| duration | number | No | Duration in milliseconds |
| status | string | Yes | Either "active" or "completed" |
| notes | string | No | Optional notes or comments |
| isBillable | boolean | No | Whether time is billable to client |
| tags | string[] | No | Array of categorization tags |

### 4.2 Project

The Project model represents a billable project.

| Field | Data Type | Required | Description |
|-------|-----------|----------|-------------|
| id | string | Yes | Unique identifier (UUID format) |
| name | string | Yes | Project display name |
| description | string | Yes | Project description |
| hourlyRate | number | No | Billing rate per hour (USD) |
| createdAt | number | Yes | Creation timestamp (Unix ms) |

### 4.3 Timesheet

The Timesheet model represents an aggregated summary report.

| Field | Data Type | Description |
|-------|-----------|-------------|
| userId | string | User the timesheet belongs to |
| period | string | Time period covered |
| projects | array | Array of project summaries |
| totalHours | number | Sum of all hours worked |
| totalRevenue | number | Sum of all billable revenue |

**Project Summary Object:**

| Field | Data Type | Description |
|-------|-----------|-------------|
| projectId | string | Project identifier |
| projectName | string | Project display name |
| totalHours | number | Hours worked on project |
| revenue | number | Calculated revenue |

---

## 5. FRONTEND COMPONENTS

### 5.1 Directory Structure

The frontend source code is organized as follows:

```
frontend/src/
│
├── App.tsx                 Main application component
├── App.css                 Global application styles
├── index.tsx               Application entry point
├── index.css               Base CSS styles
│
├── components/
│   ├── ClockInOut.tsx      Time tracking controls
│   ├── ClockInOut.css
│   ├── CreateProject.tsx   Project creation form
│   ├── CreateProject.css
│   ├── Dashboard.tsx       Main dashboard view
│   ├── Dashboard.css
│   ├── TimeEntries.tsx     Time entries list
│   ├── TimeEntries.css
│   ├── Timesheet.tsx       Timesheet report view
│   ├── Timesheet.css
│   ├── UserSelector.tsx    User switching component
│   └── UserSelector.css
│
└── services/
    └── api.ts              API client using Axios
```

### 5.2 Component Descriptions

**Dashboard**

The main landing page displaying:
- Current user's clock status (active/inactive)
- Quick action buttons for common tasks
- Summary of recent time entries
- Navigation to other sections

**ClockInOut**

Time tracking control panel featuring:
- Project selection dropdown
- Clock In button (displayed when no active entry)
- Clock Out button with live timer (displayed when entry is active)
- Notes text input field
- Billable checkbox toggle

**TimeEntries**

Historical time entries display:
- Sortable list of all time entries
- Filter options by date range and project
- Duration display in hours and minutes
- Entry details on click

**Timesheet**

Reporting and analytics view:
- Aggregated hours grouped by project
- Revenue calculations based on hourly rates
- Period selection (daily, weekly, monthly)
- Summary totals

**CreateProject**

Project management form:
- Project name input field
- Description textarea
- Hourly rate number input
- Form validation and submission

**UserSelector**

User context switching:
- Dropdown list of available users
- Current user display
- Session context management

---

## 6. KAFKA INTEGRATION

### 6.1 Overview

TimeFlow uses Apache Kafka for event streaming and implements an event sourcing pattern. This enables:

- **Durability** — All events are persisted in Kafka topics
- **Audit Trail** — Complete history of all state changes
- **Scalability** — Decoupled producers and consumers
- **Recovery** — State can be rebuilt by replaying events

### 6.2 Topics

The application uses two Kafka topics:

| Topic Name | Purpose |
|------------|---------|
| time-entry-events | All clock in/out actions |
| project-events | Project creation events |

### 6.3 Event Types

#### CLOCK_IN Event

Published when a user starts tracking time.

```json
{
  "eventType": "CLOCK_IN",
  "timestamp": 1737270000000,
  "userId": "user-1",
  "projectId": "project-1",
  "entryId": "entry-uuid",
  "data": {
    "notes": "Starting work",
    "isBillable": true
  }
}
```

#### CLOCK_OUT Event

Published when a user stops tracking time.

```json
{
  "eventType": "CLOCK_OUT",
  "timestamp": 1737273600000,
  "userId": "user-1",
  "projectId": "project-1",
  "entryId": "entry-uuid",
  "data": {
    "duration": 3600000
  }
}
```

#### PROJECT_CREATED Event

Published when a new project is created.

```json
{
  "eventType": "PROJECT_CREATED",
  "timestamp": 1737270000000,
  "data": {
    "id": "project-uuid",
    "name": "New Project",
    "description": "Project description",
    "hourlyRate": 100
  }
}
```

### 6.4 Event Sourcing Pattern

The application implements event sourcing as follows:

**Step 1:** User action triggers API call  
**Step 2:** Backend processes request and validates data  
**Step 3:** Event is published to appropriate Kafka topic  
**Step 4:** Kafka consumer receives and processes event  
**Step 5:** In-memory state is updated based on event  
**Step 6:** On application restart, all events are replayed to rebuild state  

This pattern ensures that the application state can always be reconstructed from the event log.

---

## 7. DEPLOYMENT GUIDE

### 7.1 Local Development

**Prerequisites:**
- Node.js version 18 or higher
- npm package manager

**Backend Setup:**

1. Navigate to the backend directory
2. Install dependencies
3. Start the development server

```bash
cd backend
npm install
npm run dev
```

The backend will start with hot-reload enabled on port 3000.

**Frontend Setup:**

1. Navigate to the frontend directory
2. Install dependencies
3. Start the development server

```bash
cd frontend
npm install
npm start
```

The frontend will start on port 3000 (or 3001 if 3000 is in use).

### 7.2 Production Build

**Build the Frontend:**

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build/` directory.

**Build and Start the Backend:**

```bash
cd backend
npm run build
npm start
```

The backend serves both the API and the static frontend files.

### 7.3 Docker Deployment

**Start All Services:**

```bash
docker-compose up --build
```

**Stop All Services:**

```bash
docker-compose down
```

**Service Ports:**

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Frontend | 3001 | http://localhost:3001 |
| Kafka Broker | 9092 | localhost:9092 |
| Zookeeper | 2181 | localhost:2181 |

### 7.4 Environment Variables

**Backend Configuration:**

| Variable | Default Value | Description |
|----------|---------------|-------------|
| PORT | 3000 | HTTP server port |
| KAFKA_BROKER | localhost:9092 | Kafka broker address |

**Frontend Configuration:**

| Variable | Default Value | Description |
|----------|---------------|-------------|
| REACT_APP_API_URL | http://localhost:3000 | Backend API base URL |

### 7.5 Quick Start Script (Windows)

For Windows users, a batch script is provided for one-click setup:

1. Ensure Node.js is installed on your system
2. Double-click `run-app.bat` in the project root
3. The script will:
   - Install all dependencies
   - Build the frontend
   - Build the backend
   - Start the server
4. Open your browser to http://localhost:3000

---

## 8. ERROR HANDLING

### 8.1 API Response Format

All API responses follow a consistent format.

**Successful Response:**

```json
{
  "success": true,
  "timestamp": 1737270000000,
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "timestamp": 1737270000000,
  "error": "Description of the error"
}
```

### 8.2 HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 500 | Internal Server Error | Server-side error occurred |

---

## 9. LICENSE

This project is licensed under the ISC License.

---

**END OF DOCUMENT**

---

*TimeFlow Technical Documentation*  
*Version 1.0 — January 2026*
