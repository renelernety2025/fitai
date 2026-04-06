import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            avatarUrl: any;
            level: any;
            isAdmin: any;
            createdAt: any;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: any;
            email: any;
            name: any;
            avatarUrl: any;
            level: any;
            isAdmin: any;
            createdAt: any;
        };
        accessToken: string;
    }>;
    getMe(req: any): Promise<{
        id: any;
        email: any;
        name: any;
        avatarUrl: any;
        level: any;
        isAdmin: any;
        createdAt: any;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map