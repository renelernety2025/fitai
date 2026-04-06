import { ReactNode } from 'react';
import { type UserData } from './api';
interface AuthContextType {
    user: UserData | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: UserData) => void;
    logout: () => void;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
//# sourceMappingURL=auth-context.d.ts.map