import { Course } from './api';

// Define types for our WebSocket events
export interface CourseUpdate {
  id: number;
  x?: number;
  y?: number;
  semester?: number | null;
  name?: string;
  credits?: number;
  type?: 'uni_core' | 'faculty_core' | 'cs_core' | 'stream' | 'elective';
  topics?: string[];
  references?: string[];
}

export interface WebSocketEvents {
  connect: () => void;
  disconnect: () => void;
  userJoined: (data: { userId: number }) => void;
  userLeft: (data: { userId: number }) => void;
  courseMoved: (data: { course: CourseUpdate }) => void;
  courseUpdated: (data: { course: CourseUpdate }) => void;
  courseAdded: (data: { course: Course }) => void;
  courseDeleted: (data: { courseId: number }) => void;
  error: (data: { message: string }) => void;
  roomJoined: (data: { roomId: string }) => void;
  roomLeft: (data: { roomId: string }) => void;
}

class WebSocketClient {
  private socket: any = null;
  private token: string | null = null;
  private roomId: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  async connect() {
    if (!this.token) {
      console.error('No token provided for WebSocket connection');
      return;
    }

    // Disconnect existing connection if any
    if (this.socket) {
      this.socket.disconnect();
    }

    // Dynamically import socket.io-client to avoid TypeScript issues
    const io = (await import('socket.io-client')).default;

    // Connect to WebSocket server with authentication token
    this.socket = io('http://localhost:3001', {
      auth: {
        token: this.token
      },
      transports: ['websocket']
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit('joinRoom', { roomId });
    this.roomId = roomId;
  }

  leaveRoom() {
    if (!this.socket || !this.roomId) {
      return;
    }

    this.socket.emit('leaveRoom', { roomId: this.roomId });
    this.roomId = null;
  }

  moveCourse(courseId: number, fromSemester: string, toSemester: string) {
    if (!this.socket || !this.roomId) {
      console.error('Not connected to a room');
      return;
    }

    this.socket.emit('courseMoved', {
      courseId,
      fromSemester,
      toSemester,
      roomId: this.roomId
    });
  }

  updateCourse(courseId: number, updates: Partial<Course>) {
    if (!this.socket || !this.roomId) {
      console.error('Not connected to a room');
      return;
    }

    this.socket.emit('courseUpdated', {
      courseId,
      updates,
      roomId: this.roomId
    });
  }

  addCourse(course: Partial<Course>) {
    if (!this.socket || !this.roomId) {
      console.error('Not connected to a room');
      return;
    }

    this.socket.emit('courseAdded', {
      course,
      roomId: this.roomId
    });
  }

  deleteCourse(courseId: number) {
    if (!this.socket || !this.roomId) {
      console.error('Not connected to a room');
      return;
    }

    this.socket.emit('courseDeleted', {
      courseId,
      roomId: this.roomId
    });
  }

  on<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]) {
    if (!this.socket) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.on(event, callback);
  }

  off<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]) {
    if (!this.socket) {
      return;
    }

    this.socket.off(event, callback);
  }
}

export const websocket = new WebSocketClient();
export {};