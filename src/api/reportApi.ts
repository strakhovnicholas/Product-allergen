import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshApi } from './authApi';
import { clearAuthTokens, setAccessToken, setRefreshToken } from './client';
import { API_BASE_URL } from './config';

const ANALYTICS_BASE_URL = API_BASE_URL;

function sanitizeFileName(value: string) {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return sanitizeFileName(decodeURIComponent(utf8Match[1]));
  }
  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return sanitizeFileName(plainMatch[1]);
  }
  return null;
}

function downloadOnWeb(payload: ArrayBuffer, fileName: string, mimeType: string) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const blob = new Blob([payload], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

async function analyticsRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean;
  } = {}
): Promise<T> {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${ANALYTICS_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Ошибка запроса (${res.status}). Попробуйте еще раз.`;
    try {
      const payload = JSON.parse(text) as { message?: string; error?: string };
      message = payload?.message?.trim() || payload?.error?.trim() || message;
    } catch {
      // ignore parse errors and keep generic message
    }
    throw new Error(message);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export type ReportType =
  | 'SUMMARY'
  | 'DETAILED'
  | 'FOOD_ANALYSIS'
  | 'SYMPTOM_ANALYSIS';

export type ReportFormat = 'PDF' | 'DOCX';

export type GeneratedReport = {
  id: string;
  reportType: ReportType;
  format: ReportFormat;
  status: 'READY' | 'PROCESSING' | 'FAILED';
  createdAt: string;
  downloadUrl?: string;
};

export type GenerateReportRequest = {
  reportType: ReportType;
  format: ReportFormat;
  dateFrom: string;
  dateTo: string;
};

export async function getGeneratedReportsApi(): Promise<GeneratedReport[]> {
  const paths = ['/api/reports', '/reports'];
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      return await analyticsRequest<GeneratedReport[]>(path, {
        method: 'GET',
        auth: true,
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Не удалось загрузить список отчетов');
    }
  }

  throw lastError ?? new Error('Не удалось загрузить список отчетов');
}

export async function generateReportApi(from: string, to: string): Promise<void> {
  const getAccessToken = async () => {
    const current = await AsyncStorage.getItem('accessToken');
    if (current) return current;

    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const refreshed = await refreshApi(refreshToken);
      if (!refreshed?.accessToken) return null;
      await AsyncStorage.multiSet([
        ['accessToken', refreshed.accessToken],
        ['refreshToken', refreshed.refreshToken || refreshToken],
      ]);
      setAccessToken(refreshed.accessToken);
      setRefreshToken(refreshed.refreshToken || refreshToken);
      return refreshed.accessToken;
    } catch {
      await clearAuthTokens();
      return null;
    }
  };

  let accessToken = await getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const query = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const endpoints = [`/api/reports/generate?${query}`, `/reports/generate?${query}`];

  let lastErrorMessage = '';
  for (const path of endpoints) {
    let res = await fetch(`${ANALYTICS_BASE_URL}${path}`, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshed = await refreshApi(refreshToken);
          accessToken = refreshed?.accessToken || null;
          if (accessToken) {
            const nextRefresh = refreshed?.refreshToken || refreshToken;
            await AsyncStorage.multiSet([
              ['accessToken', accessToken],
              ['refreshToken', nextRefresh],
            ]);
            setAccessToken(accessToken);
            setRefreshToken(nextRefresh);
            headers.Authorization = `Bearer ${accessToken}`;
            res = await fetch(`${ANALYTICS_BASE_URL}${path}`, {
              method: 'GET',
              headers,
            });
          }
        } catch {
          await clearAuthTokens();
        }
      }
    }

    if (!res.ok) {
      const text = await res.text();
      lastErrorMessage = text?.trim() || `Ошибка запроса (${res.status}) при генерации отчета.`;
      continue;
    }

    const reportBytes = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type')?.split(';')[0] || 'application/pdf';
    const extension = mimeType.includes('pdf') ? 'pdf' : mimeType.includes('word') ? 'docx' : 'bin';
    const fallbackName = sanitizeFileName(
      `medical_report_${from.slice(0, 10)}_${to.slice(0, 10)}.${extension}`
    );
    const fileName = extractFilename(res.headers.get('content-disposition')) || fallbackName;
    downloadOnWeb(reportBytes, fileName, mimeType);
    return;
  }

  throw new Error(lastErrorMessage || 'Не удалось сгенерировать отчет (500). Проверьте логи analytics-service.');
}