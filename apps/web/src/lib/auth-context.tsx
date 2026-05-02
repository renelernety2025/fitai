'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authMe, type UserData } from './api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('fitai_token');
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    authMe()
      .then((u) => setUser(u))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'Session expired' || msg.includes('401')) {
          localStorage.removeItem('fitai_token');
          setToken(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((newToken: string, newUser: UserData) => {
    localStorage.setItem('fitai_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fitai_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
