import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from '../user.entity';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(user: User): Promise<{
        access_token: string;
    }>;
    register(email: string, password: string, username?: string): Promise<{
        access_token: string;
        user: User;
    }>;
}
