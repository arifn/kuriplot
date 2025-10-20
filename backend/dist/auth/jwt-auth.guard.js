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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("./user.service");
const websockets_1 = require("@nestjs/websockets");
let JwtAuthGuard = class JwtAuthGuard {
    jwtService;
    userService;
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async canActivate(context) {
        if (context.getType() === 'ws') {
            return this.validateWebSocket(context);
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            return false;
        }
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userService.findOneById(payload.sub);
            if (!user) {
                return false;
            }
            request.user = user;
            request.userId = user.id;
        }
        catch {
            return false;
        }
        return true;
    }
    async validateWebSocket(context) {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromWebSocket(client);
        if (!token) {
            throw new websockets_1.WsException('Unauthorized: No token provided');
        }
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userService.findOneById(payload.sub);
            if (!user) {
                throw new websockets_1.WsException('Unauthorized: Invalid token');
            }
            client.data = {
                ...client.data,
                userId: user.id,
                user: user,
            };
            return true;
        }
        catch (error) {
            throw new websockets_1.WsException('Unauthorized: Invalid token');
        }
    }
    extractTokenFromHeader(request) {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return undefined;
        }
        return authHeader.substring(7);
    }
    extractTokenFromWebSocket(client) {
        const authHeader = client.handshake?.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return undefined;
        }
        return authHeader.substring(7);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map