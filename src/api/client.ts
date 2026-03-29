import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
  statusCode?: number;
};

function buildUrl(endpoint: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = false,
    headers = {},
  } = options;

  const token = auth ? await AsyncStorage.getItem('auth_token') : null;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth && token && token !== 'undefined' && token !== 'null') {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(endpoint), {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.log('Сетевая ошибка:', error);
    throw new Error(
      'Не удалось подключиться к серверу. Проверь API_BASE_URL, сеть и доступность backend.'
    );
  }

  const rawText = await response.text();

  let data: T | ApiErrorPayload | null = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText) as T | ApiErrorPayload;
    } catch (error) {
      console.log('Ошибка разбора ответа сервера:', error);
      if (!response.ok) {
        throw new Error(
          `Сервер вернул некорректный ответ (${response.status}).`
        );
      }

      return rawText as T;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (data as ApiErrorPayload | null)?.message ||
      (data as ApiErrorPayload | null)?.error ||
      `Ошибка запроса к серверу (${response.status})`;

    throw new Error(errorMessage);
  }

  return data as T;
}