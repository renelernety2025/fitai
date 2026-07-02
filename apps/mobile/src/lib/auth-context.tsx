import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authMe, getToken, setToken as saveToken, removeToken, setUnauthorizedHandler } from './api';

/**
 * Mobile push notifications are disabled (expo-notifications removed to
 * unblock the EAS dev build — missing APNs capability). Restore steps live
 * in docs/MOBILE-BUILD-CHECKLIST.md; the server endpoint
 * POST /users/expo-push-token (api.ts registerExpoPushToken) stays for it.
 * Web push (VAPID) is unaffected.
 */

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  updateUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken().then((stored) => {
      if (!stored) { setIsLoading(false); return; }
      setTokenState(stored);
      authMe()
        .then((u) => {
          setUser(u);
        })
        .catch((e: any) => {
          // Only logout on auth failure (401), not on network/server errors
          if (e?.message?.includes('401') || e?.message?.includes('Unauthorized')) {
            removeToken();
          }
        })
        .finally(() => setIsLoading(false));
    });
  }, []);

  const login = useCallback(async (newToken: string, newUser: any) => {
    await saveToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  // Any 401 anywhere in the API layer logs the session out cleanly
  // (previously only the initial authMe() 401 did).
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const updateUser = useCallback((next: any) => {
    setUser(next);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
