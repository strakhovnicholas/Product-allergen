import { apiRequest } from './client';

export type ProfileRequest = {
  firstName: string;
  lastName: string;
  age: number;
  weight: number;
  gender: string;
  smoker: boolean;
  alcohol: boolean;
  sports: boolean;
  chronicDiseases: string[];
  allergies: string[];
};

export async function saveProfileApi(
  payload: ProfileRequest
): Promise<void> {
  return apiRequest<void>('/api/users/profile', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}