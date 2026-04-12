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

export type RefreshTokenResponse = {
  accessToken: string;
  expiresIn: number;
};

export async function registerApi(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/registration', {
    method: 'POST',
    body: payload,
  });
}

export async function loginApi(
  payload: LoginRequest
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  return apiRequest<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function logoutApi(refreshToken: string): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    body: {
      refreshToken,
      logoutFromAllDevices: false,
    },
    auth: true,
  });
}