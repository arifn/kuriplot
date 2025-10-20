import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly userService;
    constructor(jwtService: JwtService, userService: UserService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private validateWebSocket;
    private extractTokenFromHeader;
    private extractTokenFromWebSocket;
}
