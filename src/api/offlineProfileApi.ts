import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile } from './profileApi';
import {
  getUserProfileApi as remoteGet,
  saveProfileApi as remoteSave,
  updateUserProfileApi as remoteUpdate,
} from './profileApi';
import { getProfileLocal, saveProfileLocal } from '../db/localRepository';
import { enqueueSync } from '../offline/syncQueue';
import { syncInBackground } from '../offline/syncService';
import { extractUserIdFromToken } from '../utils/jwt';

export type { Profile };
export type UserProfile = Profile;

async function getUserId(): Promise<string | null> {
  const token = await AsyncStorage.getItem('accessToken');
  return token ? extractUserIdFromToken(token) : null;
}

async function persistLocal(payload: Profile) {
  const userId = (await getUserId()) ?? payload.userId ?? 'local-user';
  await saveProfileLocal(payload, userId);
  await enqueueSync('profile', userId, 'UPSERT', payload, userId);
  void syncInBackground();
}

export async function getUserProfileApi(): Promise<Profile> {
  const local = await getProfileLocal();
  if (local?.fullName) return local;
  try {
    const remote = await remoteGet();
    const userId = (await getUserId()) ?? remote.userId ?? '';
    if (userId) await saveProfileLocal(remote, userId);
    return remote;
  } catch {
    return local ?? { fullName: '' };
  }
}

export async function saveProfileApi(payload: Profile): Promise<void> {
  await persistLocal(payload);
  try {
    await remoteSave(payload);
  } catch {
    /* saved locally */
  }
}

export async function updateUserProfileApi(payload: Profile): Promise<void> {
  await persistLocal(payload);
  try {
    await remoteUpdate(payload);
  } catch {
    /* saved locally */
  }
}
