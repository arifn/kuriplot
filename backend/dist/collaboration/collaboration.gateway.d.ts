import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
export declare class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userRooms;
    private roomUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        roomId: string;
    }): void;
    handleLeaveRoom(client: Socket, data: {
        roomId: string;
    }): void;
    handleCourseMoved(client: Socket, data: {
        roomId: string;
        course: CourseUpdate;
    }): void;
    handleCourseUpdated(client: Socket, data: {
        roomId: string;
        course: CourseUpdate;
    }): void;
    handleCourseAdded(client: Socket, data: {
        roomId: string;
        course: any;
    }): void;
    handleCourseDeleted(client: Socket, data: {
        roomId: string;
        courseId: number;
    }): void;
}
