import { apiRequest } from './client';

export async function createCommonFeelingApi(payload: {
  dateTime: string;
  wellbeingScore: number;
  mood?: number;
  energyLevel?: number;
  comment?: string;
}) {
  return apiRequest<void>('/api/feelings/common', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getCommonFeelingsApi(date: string) {
  return apiRequest<any[]>(`/api/feelings/common?date=${date}`, {
    method: 'GET',
    auth: true,
  });
}

export async function createSymptomApi(payload: {
  symptomName: string;
  severity: number;
  startTime: string;
  endTime?: string;
  possibleCause?: string;
}) {
  return apiRequest<void>('/api/feelings/symptoms', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getSymptomsApi() {
  return apiRequest<any[]>('/api/feelings/symptoms', {
    method: 'GET',
    auth: true,
  });
}

export async function createFoodApi(payload: {
  foodName: string;
  category?: string;
  amount?: number;
  unit?: string;
  intakeTime: string;
  reactionOccurred: boolean;
  reactionDescription?: string;
}) {
  return apiRequest<void>('/api/feelings/food', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getFoodApi() {
  return apiRequest<any[]>('/api/feelings/food', {
    method: 'GET',
    auth: true,
  });
}

export async function createNoteApi(payload: {
  content: string;
  date: string;
}) {
  return apiRequest<void>('/api/feelings/notes', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getNotesApi() {
  return apiRequest<any[]>('/api/feelings/notes', {
    method: 'GET',
    auth: true,
  });
}

export async function createMedicineApi(payload: {
  medicineName: string;
  dosage?: number;
  unit?: string;
  intakeTime: string;
  medicationType: number;
  reason?: string;
}) {
  return apiRequest<void>('/api/medicines', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getMedicinesApi() {
  return apiRequest<any[]>('/api/medicines', {
    method: 'GET',
    auth: true,
  });
}