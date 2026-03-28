import { apiRequest } from './client';

export type UserInfoRequest = {
  fullName: string;
  age: number;
  weight: number;
  height: number;
  gender: 'MALE' | 'FEMALE';
  country?: string;
  smoker?: boolean;
  alcohol?: boolean;
  sports?: boolean;
  chronicDiseases?: string[];
  allergies?: string[];
  predisposition?: string;
  medicationsRegular?: string[];
  doctorNotes?: string;
};

export type UserInfoResponse = {
  userId: string;
  fullName: string;
  age: number;
  weight: number;
  height: number;
  gender: 'MALE' | 'FEMALE';
  country?: string;
  smoker?: boolean;
  alcohol?: boolean;
  sports?: boolean;
  chronicDiseases?: string[];
  allergies?: string[];
  predisposition?: string;
  registeredAt: string;
  updatedAt: string;
};

export type ProfileEditRequest = {
  fullName?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
};

export async function createUserInfoApi(payload: UserInfoRequest) {
  return apiRequest<void>('/api/user/info', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getUserInfoApi() {
  return apiRequest<UserInfoResponse>('/api/user/info', {
    method: 'GET',
    auth: true,
  });
}

export async function editProfileApi(payload: ProfileEditRequest) {
  return apiRequest<void>('/api/user/profile/edit', {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}