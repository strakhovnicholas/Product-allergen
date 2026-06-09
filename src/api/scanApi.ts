import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from './config';
import type { ScanAnalysisResult } from '../ocr/ingredientSafety';

export type ScanAnalysisResultDto = {
  productName?: string | null;
  composition?: string[] | null;
  dangerousComponents?: string[] | null;
  riskLevel?: string | null;
  clinicalNoteForDoctor?: string | null;
};

export type ScanAnalyzeResponseDto = {
  scanId?: number | null;
  analysis?: ScanAnalysisResultDto | null;
};

function sanitizeClinicalNote(text: string): string {
  if (/giga\s*chat|гига\s*чат/i.test(text)) {
    return 'Не удалось сформировать рекомендацию. Попробуйте снять этикетку заново.';
  }
  return text;
}

function mapRisk(
  riskLevel: string | null | undefined,
  dangerousCount: number,
  totalCount: number,
): Pick<ScanAnalysisResult, 'score' | 'riskLabel' | 'riskColor'> {
  const normalized = (riskLevel ?? '').trim().toUpperCase();
  const scoreFromCounts = () => {
    if (totalCount === 0) return 0;
    return Math.round((1 - dangerousCount / totalCount) * 100);
  };

  if (normalized.includes('HIGH') || normalized.includes('ВЫСОК')) {
    return { score: Math.min(scoreFromCounts(), 30), riskLabel: 'Высокий риск', riskColor: '#DC2626' };
  }
  if (normalized.includes('MEDIUM') || normalized.includes('СРЕД')) {
    return {
      score: Math.max(45, Math.min(scoreFromCounts(), 70)),
      riskLabel: 'Средний риск',
      riskColor: '#D97706',
    };
  }
  if (normalized.includes('LOW') || normalized.includes('НИЗК')) {
    return { score: Math.max(scoreFromCounts(), 80), riskLabel: 'Низкий риск', riskColor: '#16A34A' };
  }
  if (dangerousCount === 0 && totalCount > 0) {
    return { score: 85, riskLabel: 'Низкий риск', riskColor: '#16A34A' };
  }
  if (dangerousCount > totalCount / 2) {
    return { score: scoreFromCounts(), riskLabel: 'Высокий риск', riskColor: '#DC2626' };
  }
  if (dangerousCount > 0) {
    return { score: scoreFromCounts(), riskLabel: 'Средний риск', riskColor: '#D97706' };
  }
  return { score: 0, riskLabel: 'Средний риск', riskColor: '#D97706' };
}

export function mapScanAnalysisDto(dto: ScanAnalysisResultDto): ScanAnalysisResult {
  const ingredients = (dto.composition ?? []).filter(Boolean);
  const problematic = (dto.dangerousComponents ?? []).filter(Boolean);
  const { score, riskLabel, riskColor } = mapRisk(dto.riskLevel, problematic.length, ingredients.length);

  return {
    productName: dto.productName?.trim() || 'Продукт по этикетке',
    ingredients,
    problematic,
    score,
    riskLabel,
    riskColor,
    recommendation: sanitizeClinicalNote(
      dto.clinicalNoteForDoctor?.trim() ||
        (problematic.length
          ? `Обнаружены компоненты: ${problematic.join(', ')}. Обсудите продукт с врачом.`
          : 'По вашему профилю явных опасных компонентов не выявлено.'),
    ),
  };
}

/** POST /scans/analyze через gateway */
export async function analyzeLabelPhotoApi(imageUri: string): Promise<ScanAnalysisResult> {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Войдите в аккаунт, чтобы анализировать этикетку.');
  }

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'label.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(`${API_BASE_URL}/scans/analyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      let message = `Ошибка сервера (${res.status}).`;
      try {
        const json = JSON.parse(text) as { message?: string };
        if (json.message) message = json.message;
      } catch {
        if (text) message = text.slice(0, 300);
      }
      if (res.status === 502) {
        message = `${message} Сервис анализа временно недоступен — попробуйте позже.`;
      }
      throw new Error(message);
    }

    const payload = (await res.json()) as ScanAnalyzeResponseDto;
    if (!payload.analysis) {
      throw new Error('Сервер не вернул результат анализа.');
    }
    return mapScanAnalysisDto(payload.analysis);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Анализ занял слишком много времени. Попробуйте ещё раз.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
