import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if this is a WebSocket context
    if (context.getType() === 'ws') {
      return this.validateWebSocket(context);
    }
    
    // Handle HTTP context
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
      
      // Attach user to request object
      request.user = user;
      request.userId = user.id;
    } catch {
      return false;
    }
    
    return true;
  }

  private async validateWebSocket(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromWebSocket(client);
    
    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }
    
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOneById(payload.sub);
      
      if (!user) {
        throw new WsException('Unauthorized: Invalid token');
      }
      
      // Attach user to client object
      client.data = {
        ...client.data,
        userId: user.id,
        user: user,
      };
      
      return true;
    } catch (error) {
      throw new WsException('Unauthorized: Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.substring(7);
  }

  private extractTokenFromWebSocket(client: any): string | undefined {
    // Extract token from handshake headers
    const authHeader = client.handshake?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.substring(7);
  }
}