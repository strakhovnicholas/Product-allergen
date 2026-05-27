import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const BASE_URL = API_BASE_URL;

type ValidationDetail = {
  field?: string;
  message?: string;
};

type BackendErrorPayload = {
  status?: number;
  message?: string;
  error?: string;
  errorType?: string;
  details?: ValidationDetail[];
};

export class ApiRequestError extends Error {
  status: number;
  rawBody: string;
  payload?: BackendErrorPayload;

  constructor(message: string, status: number, rawBody: string, payload?: BackendErrorPayload) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.rawBody = rawBody;
    this.payload = payload;
  }
}

function prettifyFieldName(field?: string) {
  const map: Record<string, string> = {
    email: 'Email',
    password: 'Пароль',
    fullName: 'ФИО',
    country: 'Город',
    age: 'Возраст',
    weight: 'Вес',
    height: 'Рост',
    wellbeingScore: 'Самочувствие',
    symptomName: 'Симптом',
    severity: 'Сила симптома',
    medicineName: 'Лекарство',
    dosage: 'Дозировка',
    unit: 'Единица измерения',
    foodName: 'Продукт',
    amount: 'Количество',
    content: 'Текст',
    date: 'Дата',
  };
  if (!field) return 'Поле';
  return map[field] ?? field;
}

function extractSpringValidationMessage(message: string) {
  const fieldMatch = message.match(/on field '([^']+)'/i);
  const field = fieldMatch?.[1];

  const defaultMessages = Array.from(
    message.matchAll(/default message \[([^\]]+)\]/gi)
  )
    .map((match) => match[1]?.trim())
    .filter(Boolean) as string[];

  const normalizedField = (field ?? '').toLowerCase();
  const meaningfulMessages = defaultMessages.filter((item) => {
    const normalized = item.toLowerCase();
    if (!item || item.length < 3) return false;
    if (normalized === normalizedField) return false;
    if (normalized === 'email' || normalized === 'password') return false;
    return true;
  });

  const humanMessage =
    meaningfulMessages.find((item) => /[А-Яа-я]/.test(item)) ??
    meaningfulMessages[meaningfulMessages.length - 1] ??
    defaultMessages[defaultMessages.length - 1];

  if (!humanMessage) return null;

  if (field) {
    return `Проверьте поле ${prettifyFieldName(field)}: ${humanMessage}`;
  }
  return humanMessage;
}

function formatBackendError(rawText: string, status: number) {
  let payload: BackendErrorPayload | undefined;
  try {
    payload = JSON.parse(rawText) as BackendErrorPayload;
  } catch {
    payload = undefined;
  }

  if (payload?.details?.length) {
    const lines = payload.details.map((detail) => {
      const fieldLabel = prettifyFieldName(detail.field);
      const detailMessage = detail.message?.trim() || 'Некорректное значение';
      return `- ${fieldLabel}: ${detailMessage}`;
    });
    return {
      message: `Проверьте заполнение полей:\n${lines.join('\n')}`,
      payload,
    };
  }

  if (payload?.message?.includes('Field error in object')) {
    const parsed = extractSpringValidationMessage(payload.message);
    if (parsed) {
      return { message: parsed, payload };
    }
  }

  if (payload?.message === 'validation.failed') {
    return {
      message: 'Проверьте введенные данные: одно или несколько полей заполнены некорректно.',
      payload,
    };
  }

  if (status === 400) {
    return {
      message: 'Некорректные данные. Проверьте поля формы и попробуйте снова.',
      payload,
    };
  }

  if (status === 401) {
    return {
      message: 'Сессия истекла. Войдите в аккаунт снова.',
      payload,
    };
  }

  if (status === 403) {
    return {
      message: 'Недостаточно прав для выполнения этого действия.',
      payload,
    };
  }

  if (status === 404) {
    return {
      message: 'Запрашиваемые данные не найдены.',
      payload,
    };
  }

  if (status >= 500) {
    return {
      message: 'Сервер временно недоступен. Попробуйте позже.',
      payload,
    };
  }

  const baseMessage =
    payload?.message?.trim() ||
    payload?.error?.trim() ||
    `Ошибка запроса (${status}). Попробуйте еще раз.`;

  return { message: baseMessage, payload };
}

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const setRefreshToken = (token: string | null) => {
  memoryRefreshToken = token;
};

export const clearAuthTokens = async () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
};

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const storedRefresh = await AsyncStorage.getItem('refreshToken');
    const refreshToken = memoryRefreshToken || storedRefresh;

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    const nextAccessToken = body?.accessToken as string | undefined;
    const nextRefreshToken =
      (body?.refreshToken as string | undefined) || refreshToken;

    if (!nextAccessToken) {
      return null;
    }

    memoryAccessToken = nextAccessToken;
    memoryRefreshToken = nextRefreshToken;
    await AsyncStorage.multiSet([
      ['accessToken', nextAccessToken],
      ['refreshToken', nextRefreshToken],
    ]);

    return nextAccessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    auth?: boolean;
    skipAuthRefresh?: boolean;
    silentErrors?: boolean;
  } = {}
): Promise<T> {
  const storageAccessToken = await AsyncStorage.getItem('accessToken');
  const accessToken = memoryAccessToken || storageAccessToken;

  const buildHeaders = (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.auth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const sendRequest = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: buildHeaders(token),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let res = await sendRequest(accessToken);

  const canRefresh =
    options.auth &&
    !options.skipAuthRefresh &&
    res.status === 401 &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register') &&
    !path.startsWith('/auth/refresh');

  if (canRefresh) {
    const nextAccessToken = await refreshAccessToken();

    if (nextAccessToken) {
      res = await sendRequest(nextAccessToken);
    } else {
      await clearAuthTokens();
    }
  }

  if (!res.ok) {
    const text = await res.text();
    const { message, payload } = formatBackendError(text, res.status);
    if (!options.silentErrors) {
      console.log('API ERROR:', message);
    }
    throw new ApiRequestError(message, res.status, text, payload);
  }

  if (res.status === 204) return {} as T;

  return res.json();
}