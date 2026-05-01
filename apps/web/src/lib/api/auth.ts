import { request } from './base';

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  level: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: UserData;
  accessToken: string;
}

export function authLogin(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authRegister(data: {
  email: string;
  password: string;
  name: string;
  level?: string;
}) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function authMe() {
  return request<UserData>('/auth/me');
}

export function authForgotPassword(email: string) {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function authResetPassword(token: string, newPassword: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
