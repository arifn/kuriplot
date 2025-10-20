import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend domain
  },
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of roomIds
  private roomUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up user from rooms
    const userId = client.data.userId;
    if (userId) {
      const rooms = this.userRooms.get(userId);
      if (rooms) {
        rooms.forEach(roomId => {
          const users = this.roomUsers.get(roomId);
          if (users) {
            users.delete(userId);
            // Notify other users in the room
            client.to(roomId).emit('userLeft', { userId });
          }
        });
        this.userRooms.delete(userId);
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const userId = client.data.userId;
    
    if (!userId) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    client.join(roomId);
    
    // Track user in room
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.add(roomId);
    }
    
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Set());
    }
    const roomUsers = this.roomUsers.get(roomId);
    if (roomUsers) {
      roomUsers.add(userId);
    }
    
    // Notify other users in the room
    client.to(roomId).emit('userJoined', { userId });
    
    client.emit('roomJoined', { roomId });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const userId = client.data.userId;
    
    if (!userId) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    client.leave(roomId);
    
    // Remove user from room tracking
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);
    }
    
    const roomUsers = this.roomUsers.get(roomId);
    if (roomUsers) {
      roomUsers.delete(userId);
      // Notify other users in the room
      client.to(roomId).emit('userLeft', { userId });
    }
    
    client.emit('roomLeft', { roomId });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('courseMoved')
  handleCourseMoved(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; course: CourseUpdate }) {
    const { roomId, course } = data;
    client.to(roomId).emit('courseMoved', { course });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('courseUpdated')
  handleCourseUpdated(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; course: CourseUpdate }) {
    const { roomId, course } = data;
    client.to(roomId).emit('courseUpdated', { course });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('courseAdded')
  handleCourseAdded(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; course: any }) {
    const { roomId, course } = data;
    client.to(roomId).emit('courseAdded', { course });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('courseDeleted')
  handleCourseDeleted(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; courseId: number }) {
    const { roomId, courseId } = data;
    client.to(roomId).emit('courseDeleted', { courseId });
  }
}