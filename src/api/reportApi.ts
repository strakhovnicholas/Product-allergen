import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { refreshApi } from './authApi';
import { clearAuthTokens, setAccessToken, setRefreshToken } from './client';
import { API_BASE_URL } from './config';
import {
  assertPdfBytes,
  downloadReportToDevice,
  saveReportFile,
  type SavedReport,
} from '../services/reportFileSave';
import { toAppDayKey } from '../utils/datetime';

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

/** Период для analytics-service: от начала первого дня до конца последнего (включительно). */
export function normalizeReportPeriodQuery(from: string, to: string) {
  const fromDay = /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : toAppDayKey(from);
  const toDay = /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : toAppDayKey(to);
  return {
    from: `${fromDay}T00:00:00`,
    to: `${toDay}T23:59:59`,
  };
}

export async function getGeneratedReportsApi(): Promise<GeneratedReport[]> {
  const paths = ['/reports', '/api/reports'];
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

export async function generateReportApi(from: string, to: string): Promise<SavedReport> {
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

  const range = normalizeReportPeriodQuery(from, to);
  const query = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
  const endpoints = [`/reports/generate?${query}`];

  const fallbackName = sanitizeFileName(
    `medical_report_${from.slice(0, 10)}_${to.slice(0, 10)}.pdf`,
  );

  const requestReport = async (authHeaders: Record<string, string>) => {
    let lastPathError = '';

    for (const path of endpoints) {
      const url = `${ANALYTICS_BASE_URL}${path}`;

      if (Platform.OS !== 'web') {
        try {
          return await downloadReportToDevice(url, authHeaders, fallbackName);
        } catch (error) {
          lastPathError =
            error instanceof Error ? error.message : 'Не удалось скачать отчёт на устройство';
          continue;
        }
      }

      let res = await fetch(url, { method: 'GET', headers: authHeaders });

      if (!res.ok) {
        const text = await res.text();
        lastPathError = text?.trim() || `Ошибка запроса (${res.status}) при генерации отчета.`;
        continue;
      }

      const reportBytes = await res.arrayBuffer();
      assertPdfBytes(new Uint8Array(reportBytes));
      const mimeType = res.headers.get('content-type')?.split(';')[0] || 'application/pdf';
      const extension = mimeType.includes('pdf') ? 'pdf' : mimeType.includes('word') ? 'docx' : 'bin';
      const fileName =
        extractFilename(res.headers.get('content-disposition')) ||
        fallbackName.replace(/\.pdf$/i, `.${extension}`);
      return saveReportFile(reportBytes, fileName, mimeType);
    }

    throw new Error(lastPathError || 'Не удалось сгенерировать отчёт');
  };

  try {
    return await requestReport(headers);
  } catch (firstError) {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw firstError instanceof Error
        ? firstError
        : new Error('Не удалось сгенерировать отчёт');
    }

    try {
      const refreshed = await refreshApi(refreshToken);
      accessToken = refreshed?.accessToken || null;
      if (!accessToken) {
        throw firstError instanceof Error ? firstError : new Error('Не удалось сгенерировать отчёт');
      }

      const nextRefresh = refreshed?.refreshToken || refreshToken;
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', nextRefresh],
      ]);
      setAccessToken(accessToken);
      setRefreshToken(nextRefresh);
      headers.Authorization = `Bearer ${accessToken}`;
      return await requestReport(headers);
    } catch {
      await clearAuthTokens();
      throw firstError instanceof Error ? firstError : new Error('Не удалось сгенерировать отчёт');
    }
  }
}