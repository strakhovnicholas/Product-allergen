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
  comment?: string;
};

export type Symptom = {
  id: EntityId;
  symptomsId?: EntityId;
  symptomName: string;
  severity: number;
  startTime?: string;
  endTime?: string;
  possibleCause?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SymptomRequest = {
  symptomName: string;
  severity: number;
  startTime?: string;
  endTime?: string;
};

export type Medicine = {
  id: EntityId;
  medicineName: string;
  dosage: number;
  unit: 'MG' | 'ML' | 'TABLET' | 'DROP';
  intakeDate: string;
  intakeTime?: string;
  medicationType?: number;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MedicineRequest = {
  medicineName: string;
  dosage: number;
  unit: 'MG' | 'ML' | 'TABLET' | 'DROP';
  intakeDate: string;
};

export type Food = {
  foodIntakeId: EntityId;
  foodName: string;
  category?: string;
  amount: number;
  unit: 'GRAM' | 'PORTION' | 'PIECE' | 'MILLILITER';
  intakeTime: string;
  reactionOccurred?: boolean;
  reactionDescription?: string;
  createdAt?: string;
  components?: string[];
};

export type FoodRequest = {
  foodName: string;
  category: string;
  amount: number;
  unit: 'GRAM' | 'PORTION' | 'PIECE' | 'MILLILITER';
  intakeTime: string;
  reactionOccurred?: boolean;
  reactionDescription?: string;
  components?: string[];
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
  id?: EntityId;
  foodName: string;
  category?: string;
  components?: string[];
};

export type FoodCategory = {
  code: string;
  name: string;
  description?: string;
};

export type UserProfile = {
  userId: string;
  fullName?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  smoker?: boolean;
  alcohol?: boolean;
  sports?: boolean;
};

export type FoodComponentSymptomsResponse = {
  foodComponentName: string;
  symptomsName: string[];
};

function toBackendDateTime(value: Date) {
  return value.toISOString().slice(0, 19);
}

function toDateKey(dateTime?: string) {
  if (!dateTime) return '';
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return String(dateTime).slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function pickLatestCommonPerDate(list: CommonFeeling[]) {
  const latestByDate = new Map<string, CommonFeeling>();
  for (const item of list ?? []) {
    const key = toDateKey(item.dateTime);
    if (!key) continue;
    const prev = latestByDate.get(key);
    if (!prev) {
      latestByDate.set(key, item);
      continue;
    }
    const prevTs = new Date(prev.dateTime).getTime();
    const nextTs = new Date(item.dateTime).getTime();
    if (Number.isNaN(prevTs) || nextTs >= prevTs) {
      latestByDate.set(key, item);
    }
  }
  return Array.from(latestByDate.values()).sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
}

function mapSymptom(dto: any): Symptom {
  return {
    id: dto.id ?? dto.symptomsId,
    symptomsId: dto.symptomsId ?? dto.id,
    symptomName: dto.symptomName,
    severity: dto.severity,
    startTime: dto.startTime ?? dto.createdAt,
    endTime: dto.endTime ?? dto.updatedAt,
    possibleCause: dto.possibleCause,
    createdAt: dto.createdAt ?? dto.startTime,
    updatedAt: dto.updatedAt ?? dto.endTime,
  };
}

function mapMedicine(dto: any): Medicine {
  return {
    id: dto.id,
    medicineName: dto.medicineName,
    dosage: dto.dosage,
    unit: dto.unit,
    intakeDate: dto.intakeDate ?? dto.intakeTime,
    intakeTime: dto.intakeTime ?? dto.intakeDate,
    medicationType: dto.medicationType,
    reason: dto.reason,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mapFood(dto: any): Food {
  return {
    foodIntakeId: dto.foodIntakeId ?? dto.id,
    foodName: dto.foodName,
    category: dto.category,
    amount: dto.amount ?? 0,
    unit: dto.unit ?? 'GRAM',
    intakeTime: dto.intakeTime ?? dto.createdAt,
    reactionOccurred: dto.reactionOccurred,
    reactionDescription: dto.reactionDescription,
    createdAt: dto.createdAt,
    components: dto.components ?? [],
  };
}

export async function getUserProfileApi(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/info', { method: 'GET', auth: true });
}

export async function updateUserProfileApi(payload: Partial<UserProfile>): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/info', {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function getCommonFeelingsApi(): Promise<CommonFeeling[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  const list = await apiRequest<CommonFeeling[]>(
    `/api/feelings/common?from=${encodeURIComponent(toBackendDateTime(monthAgo))}&to=${encodeURIComponent(toBackendDateTime(now))}`,
    { method: 'GET', auth: true }
  );
  return pickLatestCommonPerDate(list ?? []);
}

export async function getCommonFeelingsByDateApi(date: string): Promise<CommonFeeling | null> {
  const item = await apiRequest<CommonFeeling | null>(
    `/api/feelings/common/by-date?date=${encodeURIComponent(date)}`,
    { method: 'GET', auth: true }
  );
  return item ?? null;
}

export async function createCommonFeelingApi(payload: CommonFeelingRequest): Promise<CommonFeeling> {
  const normalized = {
    dateTime: payload.dateTime.slice(0, 19),
    wellbeingScore: payload.wellbeingScore,
  };
  return apiRequest<CommonFeeling>('/api/feelings/common', {
    method: 'POST',
    body: { ...normalized, request: normalized },
    auth: true,
  });
}

export async function upsertCommonFeelingApi(payload: CommonFeelingRequest): Promise<CommonFeeling> {
  const dateKey = toDateKey(payload.dateTime || new Date().toISOString());
  if (!dateKey) {
    return createCommonFeelingApi(payload);
  }

  const existing = await getCommonFeelingsByDateApi(dateKey).catch(() => null);
  if (existing?.feelingId) {
    return updateCommonFeelingApi(existing.feelingId, payload);
  }

  return createCommonFeelingApi(payload);
}

export async function updateCommonFeelingApi(feelingId: EntityId, payload: CommonFeelingRequest): Promise<CommonFeeling> {
  const normalized = {
    dateTime: payload.dateTime.slice(0, 19),
    wellbeingScore: payload.wellbeingScore,
  };
  return apiRequest<CommonFeeling>(`/api/feelings/common/${feelingId}`, {
    method: 'PUT',
    body: { ...normalized, request: normalized },
    auth: true,
  });
}

export async function deleteCommonFeelingApi(feelingId: EntityId): Promise<void> {
  return apiRequest<void>(`/api/feelings/common/${feelingId}`, { method: 'DELETE', auth: true });
}

export async function getSymptomsApi(): Promise<Symptom[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);

  const list = await apiRequest<any[]>(
    `/api/feelings/symptoms/range?from=${encodeURIComponent(toBackendDateTime(monthAgo))}&to=${encodeURIComponent(toBackendDateTime(now))}`,
    { method: 'GET', auth: true }
  );
  return (list ?? []).map(mapSymptom);
}

export async function getSymptomsCatalogApi(): Promise<Symptom[]> {
  const list = await apiRequest<any[]>('/api/symptoms', { method: 'GET', auth: true });
  return (list ?? []).map(mapSymptom);
}

export async function getSymptomsByDateRangeApi(fromIso: string, toIso: string): Promise<Symptom[]> {
  const list = await apiRequest<any[]>(
    `/api/feelings/symptoms/range?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`,
    { method: 'GET', auth: true }
  );
  return (list ?? []).map(mapSymptom);
}

export async function createSymptomApi(payload: SymptomRequest): Promise<Symptom> {
  const normalized = {
    symptomName: payload.symptomName.trim(),
    severity: payload.severity,
    startTime: (payload.startTime ?? new Date().toISOString()).slice(0, 19),
    endTime: payload.endTime ? payload.endTime.slice(0, 19) : undefined,
  };
  const dto = await apiRequest<any>('/api/feelings/symptoms', {
    method: 'POST',
    body: { ...normalized, request: normalized, dto: normalized },
    auth: true,
  });
  return mapSymptom(dto);
}

export async function updateSymptomApi(symptomsId: EntityId, payload: SymptomRequest): Promise<Symptom> {
  const normalized = {
    symptomName: payload.symptomName.trim(),
    severity: payload.severity,
    startTime: payload.startTime ? payload.startTime.slice(0, 19) : undefined,
    endTime: payload.endTime ? payload.endTime.slice(0, 19) : undefined,
  };
  const dto = await apiRequest<any>(`/api/feelings/symptoms/${symptomsId}`, {
    method: 'PUT',
    body: { ...normalized, dto: normalized, request: normalized },
    auth: true,
  });
  return mapSymptom(dto);
}

export async function deleteSymptomApi(symptomsId: EntityId): Promise<void> {
  try {
    await apiRequest<void>(`/api/feelings/symptoms/${symptomsId}`, {
      method: 'DELETE',
      auth: true,
    });
  } catch (error) {
    const id = String(symptomsId);
    // Compatibility fallback for deployments with legacy numeric symptom IDs.
    if (/^\d+$/.test(id)) {
      await apiRequest<void>(`/api/symptoms/${id}`, {
        method: 'DELETE',
        auth: true,
      }).catch(() => {
        throw error;
      });
      return;
    }
    throw error;
  }
}

export async function getMedicinesCatalogApi() {
  return apiRequest<any[]>('/api/medicines', { method: 'GET', auth: true });
}

export async function getMedicinesApi(): Promise<Medicine[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  const list = await apiRequest<any[]>(
    `/api/feelings/medicines?from=${encodeURIComponent(toBackendDateTime(monthAgo))}&to=${encodeURIComponent(toBackendDateTime(now))}`,
    { method: 'GET', auth: true }
  );
  return (list ?? []).map(mapMedicine);
}

export async function getIntakeMedicinesByPeriodApi(fromIso: string, toIso: string): Promise<Medicine[]> {
  const list = await apiRequest<any[]>(
    `/api/feelings/medicines?from=${encodeURIComponent(fromIso.slice(0, 19))}&to=${encodeURIComponent(toIso.slice(0, 19))}`,
    { method: 'GET', auth: true }
  );
  return (list ?? []).map(mapMedicine);
}

export async function createMedicineApi(payload: MedicineRequest): Promise<Medicine> {
  const normalized = {
    medicineName: payload.medicineName.trim(),
    dosage: payload.dosage,
    unit: payload.unit,
    intakeDate: payload.intakeDate.slice(0, 19),
  };
  const dto = await apiRequest<any>('/api/feelings/medicines', {
    method: 'POST',
    body: normalized,
    auth: true,
  });
  return mapMedicine(dto);
}

export async function updateMedicineApi(id: EntityId, payload: Partial<MedicineRequest>): Promise<Medicine> {
  const normalized = {
    medicineName: payload.medicineName?.trim(),
    dosage: payload.dosage,
    unit: payload.unit,
    intakeDate: payload.intakeDate?.slice(0, 19),
  };
  const dto = await apiRequest<any>(`/api/feelings/medicines/${id}`, {
    method: 'PUT',
    body: normalized,
    auth: true,
  });
  return mapMedicine(dto);
}

export async function deleteMedicineApi(id: EntityId): Promise<void> {
  return apiRequest<void>(`/api/feelings/medicines/${id}`, { method: 'DELETE', auth: true });
}

export async function getFoodByDateApi(date: string): Promise<Food[]> {
  const list = await apiRequest<any[]>(
    `/api/feelings/food?date=${encodeURIComponent(date)}`,
    { method: 'GET', auth: true }
  );
  return (list ?? []).map(mapFood);
}

export async function getFoodApi(): Promise<Food[]> {
  const today = new Date().toISOString().slice(0, 10);
  return getFoodByDateApi(today);
}

export async function createFoodApi(payload: FoodRequest): Promise<Food> {
  const normalized = {
    foodName: payload.foodName.trim(),
    category: payload.category,
    amount: payload.amount,
    unit: payload.unit,
    intakeTime: payload.intakeTime.slice(0, 19),
    reactionOccurred: payload.reactionOccurred ?? false,
    reactionDescription: payload.reactionDescription?.trim() || null,
    components: payload.components ?? [],
  };
  const dto = await apiRequest<any>('/api/feelings/food', {
    method: 'POST',
    body: normalized,
    auth: true,
  });
  return mapFood(dto);
}

export async function updateFoodApi(foodIntakeId: EntityId, payload: FoodRequest): Promise<Food> {
  const normalized = {
    foodName: payload.foodName.trim(),
    category: payload.category,
    amount: payload.amount,
    unit: payload.unit,
    intakeTime: payload.intakeTime.slice(0, 19),
    createdAt: new Date().toISOString().slice(0, 19),
    reactionOccurred: payload.reactionOccurred ?? false,
    reactionDescription: payload.reactionDescription?.trim() || null,
    components: payload.components ?? [],
  };
  const dto = await apiRequest<any>(`/api/feelings/food/${foodIntakeId}`, {
    method: 'PUT',
    body: normalized,
    auth: true,
  });
  return mapFood(dto);
}

export async function deleteFoodApi(foodIntakeId: EntityId): Promise<void> {
  return apiRequest<void>(`/api/feelings/food/${foodIntakeId}`, { method: 'DELETE', auth: true });
}

export async function getNotesByDateApi(date: string): Promise<Note[]> {
  return apiRequest<Note[]>(
    `/api/feelings/notes?date=${encodeURIComponent(date)}`,
    { method: 'GET', auth: true }
  );
}

export async function getNotesApi(): Promise<Note[]> {
  const today = new Date().toISOString().slice(0, 10);
  return getNotesByDateApi(today);
}

export async function createNoteApi(payload: NoteRequest): Promise<Note> {
  const normalized = {
    content: payload.content.trim(),
    date: payload.date.slice(0, 19),
  };
  return apiRequest<Note>('/api/feelings/notes', {
    method: 'POST',
    body: normalized,
    auth: true,
  });
}

export async function updateNoteApi(noteId: EntityId, payload: NoteRequest): Promise<Note> {
  const normalized = {
    content: payload.content.trim(),
    date: payload.date.slice(0, 19),
  };
  return apiRequest<Note>(`/api/feelings/notes/${noteId}`, {
    method: 'PUT',
    body: normalized,
    auth: true,
  });
}

export async function deleteNoteApi(noteId: EntityId): Promise<void> {
  return apiRequest<void>(`/api/feelings/notes/${noteId}`, { method: 'DELETE', auth: true });
}

export async function searchFoodCatalogApi(prefix: string): Promise<FoodCatalogItem[]> {
  return apiRequest<FoodCatalogItem[]>(
    `/api/food/search?prefix=${encodeURIComponent(prefix)}`,
    { method: 'GET', auth: true }
  );
}

export async function getFoodCategoriesApi(): Promise<FoodCategory[]> {
  return apiRequest<FoodCategory[]>('/api/reference/food-categories', { method: 'GET', auth: true });
}

export async function analyzeFoodAndSymptomsApi(fromIso: string, toIso: string): Promise<FoodComponentSymptomsResponse[]> {
  return apiRequest<FoodComponentSymptomsResponse[]>(
    `/api/food-analyzer/analyze?from=${encodeURIComponent(fromIso.slice(0, 19))}&to=${encodeURIComponent(toIso.slice(0, 19))}`,
    { method: 'GET', auth: true }
  );
}

export async function getSymptomsByDateApi(date: string) {
  const from = `${date}T00:00:00`;
  const to = `${date}T23:59:59`;
  return getSymptomsByDateRangeApi(from, to);
}

export async function getMedicinesByDateApi(date: string) {
  const from = `${date}T00:00:00`;
  const to = `${date}T23:59:59`;
  return getIntakeMedicinesByPeriodApi(from, to);
}