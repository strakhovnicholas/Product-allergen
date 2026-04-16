import { apiRequest } from './client';

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
};

export async function registerApi(
  payload: RegisterRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function loginApi(
  payload: LoginRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}