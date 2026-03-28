import { apiRequest } from './client';

export type RegisterRequest = {
  email: string;
  password: string;
  fullName?: string;
  country?: string;
  timezone?: string;
};

export type RegisterResponse = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function registerApi(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>('/api/user/registration', {
    method: 'POST',
    body: payload,
  });
}

export async function loginApi(payload: LoginRequest) {
  return apiRequest<LoginResponse>('/api/login', {
    method: 'POST',
    body: payload,
  });
}

export async function refreshTokenApi(refreshToken: string) {
  return apiRequest<{ accessToken: string; expiresIn: number }>('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function logoutApi(refreshToken: string) {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken, logoutFromAllDevices: false },
    auth: true,
  });
}