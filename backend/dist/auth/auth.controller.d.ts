import { AuthService } from './auth.service';
import { UserService } from './user.service';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    register(email: string, password: string, username?: string): Promise<{
        access_token: string;
        user: import("../user.entity").User;
    }>;
}
