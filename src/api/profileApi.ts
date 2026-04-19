import { apiRequest } from './client';

export type Profile = {
  fullName: string;

  age?: number;
  weight?: number;
  height?: number; // ✅ ДОБАВИЛИ

  gender?: string;

  smoker?: boolean;
  alcohol?: boolean;
  sports?: boolean;

  chronicDiseases?: string[];
  allergies?: string[];
};

export async function getUserProfileApi(): Promise<Profile> {
  return apiRequest<Profile>('/api/user/info', {
    method: 'GET',
    auth: true,
  });
}

export async function updateUserProfileApi(
  payload: Profile
): Promise<void> {
  return apiRequest<void>('/api/user/info', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function saveProfileApi(
  payload: Profile
): Promise<void> {
  return apiRequest<void>('/api/user/info', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}