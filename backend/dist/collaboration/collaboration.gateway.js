"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CollaborationGateway = class CollaborationGateway {
    server;
    userRooms = new Map();
    roomUsers = new Map();
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const userId = client.data.userId;
        if (userId) {
            const rooms = this.userRooms.get(userId);
            if (rooms) {
                rooms.forEach(roomId => {
                    const users = this.roomUsers.get(roomId);
                    if (users) {
                        users.delete(userId);
                        client.to(roomId).emit('userLeft', { userId });
                    }
                });
                this.userRooms.delete(userId);
            }
        }
    }
    handleJoinRoom(client, data) {
        const { roomId } = data;
        const userId = client.data.userId;
        if (!userId) {
            client.emit('error', { message: 'User not authenticated' });
            return;
        }
        client.join(roomId);
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
        client.to(roomId).emit('userJoined', { userId });
        client.emit('roomJoined', { roomId });
    }
    handleLeaveRoom(client, data) {
        const { roomId } = data;
        const userId = client.data.userId;
        if (!userId) {
            client.emit('error', { message: 'User not authenticated' });
            return;
        }
        client.leave(roomId);
        const userRooms = this.userRooms.get(userId);
        if (userRooms) {
            userRooms.delete(roomId);
        }
        const roomUsers = this.roomUsers.get(roomId);
        if (roomUsers) {
            roomUsers.delete(userId);
            client.to(roomId).emit('userLeft', { userId });
        }
        client.emit('roomLeft', { roomId });
    }
    handleCourseMoved(client, data) {
        const { roomId, course } = data;
        client.to(roomId).emit('courseMoved', { course });
    }
    handleCourseUpdated(client, data) {
        const { roomId, course } = data;
        client.to(roomId).emit('courseUpdated', { course });
    }
    handleCourseAdded(client, data) {
        const { roomId, course } = data;
        client.to(roomId).emit('courseAdded', { course });
    }
    handleCourseDeleted(client, data) {
        const { roomId, courseId } = data;
        client.to(roomId).emit('courseDeleted', { courseId });
    }
};
exports.CollaborationGateway = CollaborationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CollaborationGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, websockets_1.SubscribeMessage)('courseMoved'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleCourseMoved", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, websockets_1.SubscribeMessage)('courseUpdated'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleCourseUpdated", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, websockets_1.SubscribeMessage)('courseAdded'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleCourseAdded", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, websockets_1.SubscribeMessage)('courseDeleted'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleCourseDeleted", null);
exports.CollaborationGateway = CollaborationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], CollaborationGateway);
//# sourceMappingURL=collaboration.gateway.js.map