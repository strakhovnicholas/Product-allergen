import { apiRequest } from './client';

export type UserProfile = {
  fullName?: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  smoking?: boolean;
  alcohol?: string | boolean;
  sport?: boolean;
  heredity?: boolean;
};

export type UpdateUserProfileRequest = {
  fullName?: string;
  age?: number;
  weight?: number;
  height?: number;
  smoking?: boolean;
  alcohol?: string | boolean;
  sport?: boolean;
  heredity?: boolean;
};

export async function getUserProfileApi(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/info', {
    method: 'GET',
    auth: true,
  });
}

export async function updateUserProfileApi(
  payload: UpdateUserProfileRequest
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/profile/edit', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}