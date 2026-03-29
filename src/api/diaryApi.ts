import { apiRequest } from './client';

export type EntityId = number | string;

export type CommonFeeling = {
  feelingId: EntityId;
  dateTime: string;
  wellbeingScore: number;
  mood?: number;
  energyLevel?: number;
  comment?: string;
};

export type CommonFeelingRequest = {
  dateTime: string;
  wellbeingScore: number;
  mood?: number;
  energyLevel?: number;
  comment?: string;
};

export type Symptom = {
  symptomsId: EntityId;
  symptomName: string;
  severity: number;
  startTime: string;
  endTime?: string;
  possibleCause?: string;
};

export type SymptomRequest = {
  symptomName: string;
  severity: number;
  startTime: string;
  endTime?: string;
  possibleCause?: string;
};

export type Medicine = {
  id: EntityId;
  medicineName: string;
  dosage?: number;
  unit?: string;
  intakeTime: string;
  medicationType?: number;
  reason?: string;
};

export type MedicineRequest = {
  medicineName: string;
  dosage?: number;
  unit?: string;
  intakeTime: string;
  medicationType?: number;
  reason?: string;
};

export type Food = {
  foodIntakeId: EntityId;
  foodName: string;
  category?: string;
  amount?: number;
  unit?: string;
  intakeTime: string;
  reactionOccurred: boolean;
  reactionDescription?: string;
};

export type FoodRequest = {
  foodName: string;
  category?: string;
  amount?: number;
  unit?: string;
  intakeTime: string;
  reactionOccurred: boolean;
  reactionDescription?: string;
};

export type Note = {
  noteId: EntityId;
  content: string;
  date: string;
};

export type NoteRequest = {
  content: string;
  date: string;
};

/* Common feelings */

export async function getCommonFeelingsApi(): Promise<CommonFeeling[]> {
  return apiRequest<CommonFeeling[]>('/api/feelings/common', {
    method: 'GET',
    auth: true,
  });
}

export async function createCommonFeelingApi(
  payload: CommonFeelingRequest
): Promise<CommonFeeling> {
  return apiRequest<CommonFeeling>('/api/feelings/common', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateCommonFeelingApi(
  feelingId: EntityId,
  payload: CommonFeelingRequest
): Promise<CommonFeeling> {
  return apiRequest<CommonFeeling>(`/api/feelings/common/${feelingId}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteCommonFeelingApi(
  feelingId: EntityId
): Promise<void> {
  return apiRequest<void>(`/api/feelings/common/${feelingId}`, {
    method: 'DELETE',
    auth: true,
  });
}

/* Symptoms */

export async function getSymptomsApi(): Promise<Symptom[]> {
  return apiRequest<Symptom[]>('/api/feelings/symptoms/all', {
    method: 'GET',
    auth: true,
  });
}

export async function createSymptomApi(
  payload: SymptomRequest
): Promise<Symptom> {
  return apiRequest<Symptom>('/api/feelings/symptoms', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateSymptomApi(
  symptomsId: EntityId,
  payload: SymptomRequest
): Promise<Symptom> {
  return apiRequest<Symptom>(`/api/feelings/symptoms/${symptomsId}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteSymptomApi(
  symptomsId: EntityId
): Promise<void> {
  return apiRequest<void>(`/api/feelings/symptoms/${symptomsId}`, {
    method: 'DELETE',
    auth: true,
  });
}

/* Medicines */

export async function getMedicinesApi(): Promise<Medicine[]> {
  return apiRequest<Medicine[]>('/api/medicines', {
    method: 'GET',
    auth: true,
  });
}

export async function createMedicineApi(
  payload: MedicineRequest
): Promise<Medicine> {
  return apiRequest<Medicine>('/api/medicines', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateMedicineApi(
  id: EntityId,
  payload: MedicineRequest
): Promise<Medicine> {
  return apiRequest<Medicine>(`/api/medicines/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteMedicineApi(id: EntityId): Promise<void> {
  return apiRequest<void>(`/api/medicines/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

/* Food */

export async function getFoodApi(): Promise<Food[]> {
  return apiRequest<Food[]>('/api/feelings/food', {
    method: 'GET',
    auth: true,
  });
}

export async function createFoodApi(payload: FoodRequest): Promise<Food> {
  return apiRequest<Food>('/api/feelings/food', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateFoodApi(
  foodIntakeId: EntityId,
  payload: FoodRequest
): Promise<Food> {
  return apiRequest<Food>(`/api/feelings/food/${foodIntakeId}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteFoodApi(
  foodIntakeId: EntityId
): Promise<void> {
  return apiRequest<void>(`/api/feelings/food/${foodIntakeId}`, {
    method: 'DELETE',
    auth: true,
  });
}

/* Notes */

export async function getNotesApi(): Promise<Note[]> {
  return apiRequest<Note[]>('/api/feelings/notes', {
    method: 'GET',
    auth: true,
  });
}

export async function createNoteApi(payload: NoteRequest): Promise<Note> {
  return apiRequest<Note>('/api/feelings/notes', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateNoteApi(
  noteId: EntityId,
  payload: NoteRequest
): Promise<Note> {
  return apiRequest<Note>(`/api/feelings/notes/${noteId}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteNoteApi(noteId: EntityId): Promise<void> {
  return apiRequest<void>(`/api/feelings/notes/${noteId}`, {
    method: 'DELETE',
    auth: true,
  });
}