import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
    getProfile(userId: string): Promise<{
        id: any;
        email: any;
        name: any;
        avatarUrl: any;
        level: any;
        isAdmin: any;
        createdAt: any;
    }>;
    private createToken;
    private toProfile;
}
//# sourceMappingURL=auth.service.d.ts.map