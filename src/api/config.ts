import Constants from 'expo-constants';

export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://79.133.178.179:8080';