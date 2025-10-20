# Kuriplot - Curriculum Planning Application

A full-stack web application for planning and managing academic curricula with real-time collaboration features.

## Features

- **Drag & Drop Interface**: Intuitive course planning with visual semester columns
- **Real-time Collaboration**: WebSocket-based live updates for multiple users
- **Authentication**: JWT-based user authentication and authorization
- **Course Management**: Create, edit, delete, and organize courses
- **Credit Tracking**: Automatic credit calculation per semester
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, React-Konva, Socket.io-client
- **Backend**: NestJS, TypeScript, TypeORM, SQLite
- **Real-time**: Socket.io for WebSocket communication
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone git@github.com:arifn/Kuriplot.git
cd kuriplot
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:3001

### Demo Account

Use these credentials to log in:
- **Email**: demo@example.com
- **Password**: demo123

## Development

### Local Development Setup

1. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Start development servers:
```bash
# Backend (from backend directory)
npm run start:dev

# Frontend (from frontend directory)
npm start
```

### Environment Variables

Create `.env` files in both backend and frontend directories if needed:

**Backend (.env)**:
```
NODE_ENV=development
DATABASE_PATH=curriculum.db
JWT_SECRET=your-secret-key
```

## API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Course Endpoints

- `GET /courses` - Get all courses
- `POST /courses` - Create new course
- `GET /courses/:id` - Get course by ID
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### WebSocket Events

- `joinRoom` - Join collaboration room
- `leaveRoom` - Leave collaboration room
- `courseMoved` - Course position/semester changed
- `courseUpdated` - Course details updated
- `courseAdded` - New course added
- `courseDeleted` - Course deleted

## Deployment

### Production Deployment

1. Build and deploy:
```bash
docker-compose -f docker-compose.yml up -d
```

2. The application will be available at:
- Frontend: http://your-vps-ip
- Backend: http://your-vps-ip:3001

### Environment Configuration

For production, consider setting these environment variables:

```yaml
# docker-compose.yml
environment:
  - NODE_ENV=production
  - JWT_SECRET=your-production-secret
  - DATABASE_PATH=/app/data/curriculum.db
```

## Project Structure

```
kuriplot/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── collaboration/  # WebSocket collaboration
│   │   ├── course/         # Course management
│   │   └── plans/          # Academic plans
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   └── services/       # API and WebSocket services
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.