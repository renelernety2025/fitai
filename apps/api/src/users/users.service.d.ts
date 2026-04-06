import { PrismaService } from '../prisma/prisma.service';
import { UserLevel } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        avatarUrl: string | null;
        level: import(".prisma/client").$Enums.UserLevel;
        isAdmin: boolean;
    } | null>;
    findByEmail(email: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        avatarUrl: string | null;
        level: import(".prisma/client").$Enums.UserLevel;
        isAdmin: boolean;
    } | null>;
    createUser(data: {
        email: string;
        passwordHash: string;
        name: string;
        level?: UserLevel;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        avatarUrl: string | null;
        level: import(".prisma/client").$Enums.UserLevel;
        isAdmin: boolean;
    }>;
}
//# sourceMappingURL=users.service.d.ts.map