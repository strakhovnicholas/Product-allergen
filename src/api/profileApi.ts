import { apiRequest, ApiRequestError } from './client';

export type Profile = {
  userId?: string;
  fullName: string;

  age?: number;
  weight?: number;
  height?: number; // ✅ ДОБАВИЛИ

  gender?: string;
  country?: string;
  predisposition?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  doctorNotes?: string;
  medicationsRegular?: string[];

  smoker?: boolean;
  alcohol?: boolean;
  sports?: boolean;

  chronicDiseases?: string[];
  allergies?: string[];
};

export async function getUserProfileApi(): Promise<Profile> {
  try {
    return await apiRequest<Profile>('/api/user/info', {
      method: 'GET',
      auth: true,
      silentErrors: true,
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 500) {
      return {
        fullName: '',
      };
    }
    throw error;
  }
}

export async function updateUserProfileApi(
  payload: Profile,
  userId?: string
): Promise<void> {
  const path = userId
    ? `/api/user/info?userId=${encodeURIComponent(userId)}`
    : '/api/user/info';
  return apiRequest<void>(path, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function saveProfileApi(
  payload: Profile
): Promise<void> {
  const normalizedPayload: Profile = {
    country: 'Не указан',
    predisposition: 'NONE',
    ...payload,
    gender:
      payload.gender?.toUpperCase() === 'MALE'
        ? 'MALE'
        : payload.gender?.toUpperCase() === 'FEMALE'
          ? 'FEMALE'
          : payload.gender,
  };

  return apiRequest<void>('/api/user/info', {
    method: 'POST',
    body: normalizedPayload,
    auth: true,
  });
}