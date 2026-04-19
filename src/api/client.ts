import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://185.240.102.95:8080';

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    auth?: boolean;
  } = {}
): Promise<T> {

  const token = await AsyncStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    console.log('API ERROR:', text);
    throw new Error(text || 'API error');
  }

  if (res.status === 204) return {} as T;

  return res.json();
}