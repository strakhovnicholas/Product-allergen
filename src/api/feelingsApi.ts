import { apiRequest } from './client';

/* =========================
   САМОЧУВСТВИЕ
========================= */

export async function createCommonFeelingApi(payload: {
  dateTime: string;
  wellbeingScore: number;
}) {
  return apiRequest<void>('/api/feelings/common', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getCommonFeelingsByDateApi(date: string) {
  return apiRequest<any[]>(
    `/api/feelings/common/by-date?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}

/* =========================
   СИМПТОМЫ
========================= */

export async function createSymptomApi(payload: {
  symptomName: string;
  severity: number;
  startTime: string;
}) {
  return apiRequest<void>('/api/feelings/symptoms', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getSymptomsApi() {
  return apiRequest<any[]>('/api/symptoms', {
    method: 'GET',
    auth: true,
  });
}

/* =========================
   ЛЕКАРСТВА
========================= */

export async function createMedicineApi(payload: {
  medicineName: string;
  intakeTime: string;
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

/* =========================
   ПИТАНИЕ
========================= */

export async function createFoodApi(payload: {
  foodName: string;
  intakeTime: string;
}) {
  return apiRequest<void>('/api/feelings/food', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getFoodByDateApi(date: string) {
  return apiRequest<any[]>(
    `/api/feelings/food/by-date?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}

export async function searchFoodApi(query: string) {
  return apiRequest<any[]>(
    `/api/food/search?query=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}

/* =========================
   ЗАМЕТКИ
========================= */

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

export async function getNotesByDateApi(date: string) {
  return apiRequest<any[]>(
    `/api/feelings/notes/date?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}