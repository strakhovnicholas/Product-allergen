import { apiRequest } from './client';

export async function getDashboardStatsApi() {
  return apiRequest<{
    totalFoodEntries: number;
    totalReactions: number;
    avgWellbeing: number;
    avgMood: number;
    mostRiskyFood: string;
    safestFood: string;
  }>('/api/dashboard/stats', {
    method: 'GET',
    auth: true,
  });
}

export async function getSafeFoodsApi(payload: {
  lookBackDays?: number;
  minOccurrences?: number;
}) {
  return apiRequest<any[]>('/api/report/food/safe', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getDangerFoodsApi(payload: {
  lookBackDays?: number;
  reactionThreshold?: number;
}) {
  return apiRequest<any[]>('/api/report/food/danger', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function generateReportApi(payload: {
  reportType: 'SUMMARY' | 'DETAILED' | 'FOOD_ANALYSIS' | 'SYMPTOM_ANALYSIS';
  startDate: string;
  endDate: string;
  format: 'PDF' | 'DOCX';
}) {
  return apiRequest<{
    reportId: string;
    status: 'PROCESSING' | 'READY' | 'FAILED';
    createdAt: string;
  }>('/api/report/generate', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}