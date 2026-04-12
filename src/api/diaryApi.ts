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

export type FoodCatalogItem = {
  id: EntityId;
  name: string;
  category?: string;
};

export type FoodCategory = {
  id: EntityId;
  name: string;
};


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


export async function getSymptomsApi(): Promise<Symptom[]> {
  return apiRequest<Symptom[]>('/api/symptoms', {
    method: 'GET',
    auth: true,
  });
}

export async function createSymptomApi(
  payload: SymptomRequest
): Promise<Symptom> {
  return apiRequest<Symptom>('/api/symptoms', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateSymptomApi(
  symptomsId: EntityId,
  payload: SymptomRequest
): Promise<Symptom> {
  return apiRequest<Symptom>(`/api/symptoms/${symptomsId}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function deleteSymptomApi(
  symptomsId: EntityId
): Promise<void> {
  return apiRequest<void>(`/api/symptoms/${symptomsId}`, {
    method: 'DELETE',
    auth: true,
  });
}


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

/* Заметки */

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

export async function searchFoodCatalogApi(
  prefix: string
): Promise<FoodCatalogItem[]> {
  return apiRequest<FoodCatalogItem[]>(
    `/api/food/search?prefix=${encodeURIComponent(prefix)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}

export async function getFoodCategoriesApi(): Promise<FoodCategory[]> {
  return apiRequest<FoodCategory[]>('/api/reference/food-categories', {
    method: 'GET',
    auth: true,
  });
}
export async function getCommonFeelingsByDateApi(date: string): Promise<CommonFeeling[]> {
  return apiRequest<CommonFeeling[]>(
    `/api/feelings/common/by-date?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}

export async function getFoodByDateApi(date: string): Promise<Food[]> {
  return apiRequest<Food[]>(
    `/api/feelings/food/by-date?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}

export async function getNotesByDateApi(date: string): Promise<Note[]> {
  return apiRequest<Note[]>(
    `/api/feelings/notes/date?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}