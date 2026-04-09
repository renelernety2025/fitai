import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authMe, getToken, setToken as saveToken, removeToken, registerExpoPushToken } from './api';

/**
 * Mobile push notifications temporarily disabled.
 *
 * The `expo-notifications` package was removed to unblock EAS dev build —
 * its autolinking adds `aps-environment` entitlement which requires Push
 * Notifications capability in the provisioning profile. That capability
 * isn't set up because APNs key upload was blocked by unrelated keyboard/
 * auth issues.
 *
 * TODO: Restore by:
 * 1. Upload APNs .p8 via `npx eas credentials` → iOS → Push Notifications
 * 2. `npm install expo-notifications@~0.32.16 --workspace=@fitai/mobile`
 * 3. Re-add `expo-notifications` to `app.json` plugins array
 * 4. Restore the real implementation from git history (commit before this fix)
 * 5. `npx eas build --clear-cache --profile development --platform ios`
 *
 * Web push (VAPID) continues to work — this only affects mobile.
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  return null;
}

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
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
          // Re-register expo token (idempotent — server upserts)
          registerForPushNotificationsAsync().then((pushToken) => {
            if (pushToken) registerExpoPushToken(pushToken).catch(() => {});
          });
        })
        .catch(() => removeToken())
        .finally(() => setIsLoading(false));
    });
  }, []);

  const login = useCallback(async (newToken: string, newUser: any) => {
    await saveToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    // Register expo push token in background
    registerForPushNotificationsAsync().then((pushToken) => {
      if (pushToken) registerExpoPushToken(pushToken).catch(() => {});
    });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

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
