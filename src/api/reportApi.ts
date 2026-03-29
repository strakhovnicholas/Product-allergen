import { apiRequest } from './client';

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
  return apiRequest<GeneratedReport[]>('/api/reports', {
    method: 'GET',
    auth: true,
  });
}

export async function generateReportApi(
  payload: GenerateReportRequest
): Promise<GeneratedReport> {
  return apiRequest<GeneratedReport>('/api/reports/generate', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}