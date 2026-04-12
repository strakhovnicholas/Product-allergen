import { apiRequest } from './client';

export type UserProfile = {
  fullName?: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  smoking?: boolean;
  alcohol?: boolean | string;
  sport?: boolean;
  heredity?: boolean;
};

export type UpdateUserProfileRequest = {
  fullName?: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  smoking?: boolean;
  alcohol?: boolean | string;
  sport?: boolean;
  heredity?: boolean;
};

export async function getUserProfileApi(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/info', {
    method: 'GET',
    auth: true,
  });
}

export async function createUserProfileApi(
  payload: UpdateUserProfileRequest
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/info', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateUserProfileApi(
  payload: UpdateUserProfileRequest
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/info', {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteUserProfileApi(): Promise<void> {
  return apiRequest<void>('/api/user/info', {
    method: 'DELETE',
    auth: true,
  });
}