Curriculum Design Studio Architecture Plan

Executive Summary
This document outlines a high level technology stack and architecture for a Miro like canvas focused on curriculum design.
The canvas supports one boundary box containing eight semester boxes and an area for unallocated courses.
When a course is placed inside a semester, its semester field is set to that semester.

Technology evaluation and goals
- Build a scalable, responsive, and offline capable web application.
- Enable drag and drop of course items into eight semester bins.
- Provide a clean API layer and robust data model for courses and semesters.

Recommended technology stack
Frontend
- Framework: React + TypeScript
- Canvas library: Konva or Fabric.js (we recommend Konva for performance and simplicity)
- State management: Zustand or Redux Toolkit
- Styling: Tailwind CSS

Backend
- Runtime: Node.js with NestJS
- API style: REST (GraphQL is optional)
- Real-time: Y.js CRDT based synchronization over WebSocket
- Database: SQLite (file-based, zero-config, suitable for single-user or small team curriculum design)
- Cache: Redis
- Storage: S3 compatible object storage

Authentication and authorization
- JWT based auth with refresh tokens
- Role-based access control at route level

Deployment and hosting
- Docker containers with Docker Compose for development
- Kubernetes or cloud run for production
- CI/CD with GitHub Actions

Architecture overview
- There is a single page application (SPA) that renders a large canvas.
- The backend exposes REST endpoints and a real-time sync channel.
- A real-time sync layer (CRDT) keeps documents in sync across clients.
- Persistent data is stored in SQLite; frequently accessed data cached in Redis.
- Object storage is used for references/document attachments.

Data model overview
- Course: id, name, credits, topics JSON, references JSON, semester_id nullable, order
- Semester: id (1-8), name
- Relationships: Course.semester_id references Semester.id

Frontend architecture
- Canvas component using Konva for draggable course cards
- Eight semester bins rendered as bounded zones
- Unallocated area outside the boundary for unassigned courses
- Drag and drop events drive calls to the API to persist state

Backend architecture
- NestJS REST API for CRUD on courses and semesters
- Real-time sync gateway using Y.js with WebSocket
- SQLite database with proper indexing on course semester fields
- Redis cache for hot paths

Real-time collaboration strategy
- Use CRDT (Y.js) to ensure eventual consistency across clients
- WebSocket transport with presence awareness
- Conflict resolution handled by CRDT data types

API contract and persistence
- REST endpoints:
  - GET /courses, POST /courses, PUT /courses/{id}, PATCH /courses/{id}, DELETE /courses/{id}
  - GET /semesters, PATCH /courses/{id}/semester
- Data persistence: SQLite with tables course, semester, course_topic, course_reference

Deployment and CI/CD
- Dockerfile per service
- Docker Compose for local development
- Deploy to Kubernetes or serverless containers in cloud
- GitHub Actions workflows for build, test, and deploy

Non-functional considerations
- Offline support via local caching (IndexedDB) and optimistic UI
- Accessibility and keyboard navigation
- Observability: metrics, logging, and tracing

Risk assessment and mitigations
- Real-time sync latency: optimize CRDT operations
- Data model migrations: plan incremental changes

Architecture diagrams
```mermaid
graph LR
Client[Web Client]
API[Backend API]
DB[SQLite]
CRDT[Real-time Sync (CRDT)]
Auth[Auth Service]
Cache[Redis]
FileStore[S3]

Client --> API
API --> DB
API --> CRDT
CRDT --> Client
API --> Auth
Auth --> DB
API --> Cache
API --> FileStore
```

Implementation roadmap
- Phase 1 MVP: Canvas with 8 semesters and unallocated area; basic course CRUD
- Phase 2 Real-time sync and offline support
- Phase 3 Advanced features: topics and references management, rich search

Acceptance criteria
- Ability to create and move courses into eight semesters
- Real-time synchronization across multiple clients
- Data persisted in SQLite with correct schema

References
Notations and design decisions summarized in this document.
Frontend MVP plan
- Objectives: scaffold React + TypeScript app with Konva, implement CourseCard and SemesterBox drag-and-drop, and wire to mock REST API endpoints
- Key components:
  - CourseCard: draggable card with fields name, credits; color-coded by topic
  - SemesterBox: droppable target representing Semester 1-8
- Data flow:
  - Frontend stores local state for courses and their assigned semester
  - Mock REST endpoints simulate create/read/update for Course
- Milestones:
  - Setup React app skeleton with TypeScript
  - Integrate Konva and implement CourseCard and SemesterBox
  - Implement mock API client and connect to UI actions
  - Basic persistence to local in-memory store
- Acceptance criteria:
  - Drag CourseCard into a SemesterBox updates course.semester