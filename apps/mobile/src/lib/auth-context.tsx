import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { authMe, getToken, setToken as saveToken, removeToken, registerExpoPushToken } from './api';

async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    console.warn('Push registration failed:', e);
    return null;
  }
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
