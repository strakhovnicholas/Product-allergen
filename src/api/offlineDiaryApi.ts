/**
 * Offline-first API: reads/writes SQLite first, enqueues sync, pushes when online.
 */
export type {
  CommonFeeling,
  CommonFeelingRequest,
  EntityId,
  Food,
  FoodCatalogItem,
  FoodCategory,
  FoodComponentSymptomsResponse,
  FoodRequest,
  Medicine,
  MedicineRequest,
  Note,
  NoteRequest,
  Symptom,
  SymptomRequest,
  UserProfile,
} from './diaryApi';

import type {
  CommonFeeling,
  CommonFeelingRequest,
  EntityId,
  Food,
  FoodComponentSymptomsResponse,
  FoodRequest,
  Medicine,
  MedicineRequest,
  Note,
  NoteRequest,
  Symptom,
  SymptomRequest,
} from './diaryApi';
import { analyzeFoodAndSymptomsApi as remoteAnalyze } from './diaryApi';
import * as local from '../db/localRepository';
import { enqueueSync } from '../offline/syncQueue';
import { isOnline } from '../offline/network';
import { syncInBackground } from '../offline/syncService';
import { analyzeFoodAndSymptomsLocal } from '../domain/foodComponentAnalyzer';
import { nowAppDateTimeString, toAppDateTimeString, toAppDayKey } from '../utils/datetime';

function triggerSync() {
  void syncInBackground();
}

export async function getFoodByDateApi(date: string): Promise<Food[]> {
  return local.getFoodByDateLocal(date);
}

export async function getFoodByPeriodApi(fromIso: string, toIso: string): Promise<Food[]> {
  return local.getFoodInRangeLocal(fromIso.slice(0, 19), toIso.slice(0, 19));
}

export async function getFoodApi(): Promise<Food[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  return local.getFoodInRangeLocal(
    toAppDateTimeString(monthAgo),
    toAppDateTimeString(now),
  );
}

export async function createFoodApi(payload: FoodRequest): Promise<Food> {
  const { localId, intakeTime } = await local.insertFoodLocal(payload);
  await enqueueSync('food', localId, 'UPSERT', { ...payload, intakeTime, localId });
  triggerSync();
  const list = await local.getFoodByDateLocal(intakeTime.slice(0, 10));
  return (
    list.find((f) => String(f.foodIntakeId) === localId) ?? {
      foodIntakeId: localId,
      foodName: payload.foodName,
      category: payload.category,
      amount: payload.amount,
      unit: payload.unit,
      intakeTime,
      reactionOccurred: payload.reactionOccurred,
      reactionDescription: payload.reactionDescription,
      components: payload.components ?? [],
    }
  );
}

export async function updateFoodApi(foodIntakeId: EntityId, payload: FoodRequest): Promise<Food> {
  await local.updateFoodLocal(foodIntakeId, payload);
  await enqueueSync('food', String(foodIntakeId), 'UPSERT', payload, String(foodIntakeId));
  triggerSync();
  const intakeTime = payload.intakeTime.slice(0, 19);
  return {
    foodIntakeId,
    foodName: payload.foodName,
    category: payload.category,
    amount: payload.amount,
    unit: payload.unit,
    intakeTime,
    reactionOccurred: payload.reactionOccurred,
    reactionDescription: payload.reactionDescription,
    components: payload.components ?? [],
  };
}

export async function deleteFoodApi(foodIntakeId: EntityId): Promise<void> {
  await local.deleteFoodLocal(foodIntakeId);
  await enqueueSync('food', String(foodIntakeId), 'DELETE', { id: foodIntakeId }, String(foodIntakeId));
  triggerSync();
}

export async function getSymptomsByDateRangeApi(fromIso: string, toIso: string): Promise<Symptom[]> {
  return local.getSymptomsByDateRangeLocal(fromIso.slice(0, 19), toIso.slice(0, 19));
}

export async function getSymptomsByDateApi(date: string) {
  return getSymptomsByDateRangeApi(`${date}T00:00:00`, `${date}T23:59:59`);
}

export async function getSymptomsApi(): Promise<Symptom[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  return getSymptomsByDateRangeApi(toAppDateTimeString(monthAgo), toAppDateTimeString(now));
}

export async function createSymptomApi(payload: SymptomRequest): Promise<Symptom> {
  const { localId, startTime } = await local.insertSymptomLocal(payload);
  await enqueueSync('symptom', localId, 'UPSERT', { ...payload, startTime, localId });
  triggerSync();
  return {
    id: localId,
    symptomsId: localId,
    symptomName: payload.symptomName,
    severity: payload.severity,
    startTime,
    endTime: payload.endTime,
  };
}

export async function updateSymptomApi(symptomsId: EntityId, payload: SymptomRequest): Promise<Symptom> {
  const { localId, startTime } = await local.updateSymptomLocal(symptomsId, payload);
  await enqueueSync('symptom', localId, 'UPSERT', { ...payload, startTime, localId }, String(symptomsId));
  triggerSync();
  return {
    id: localId,
    symptomsId: localId,
    symptomName: payload.symptomName,
    severity: payload.severity,
    startTime,
    endTime: payload.endTime?.slice(0, 19),
  };
}

export async function deleteSymptomApi(symptomsId: EntityId): Promise<void> {
  await local.deleteSymptomLocal(symptomsId);
  await enqueueSync('symptom', String(symptomsId), 'DELETE', { id: symptomsId }, String(symptomsId));
  triggerSync();
}

export async function getMedicinesByDateApi(date: string) {
  return getIntakeMedicinesByPeriodApi(`${date}T00:00:00`, `${date}T23:59:59`);
}

export async function getMedicinesApi(): Promise<Medicine[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  return getIntakeMedicinesByPeriodApi(toAppDateTimeString(monthAgo), toAppDateTimeString(now));
}

export async function getIntakeMedicinesByPeriodApi(fromIso: string, toIso: string): Promise<Medicine[]> {
  return local.getMedicinesByPeriodLocal(fromIso.slice(0, 19), toIso.slice(0, 19));
}

export async function createMedicineApi(payload: MedicineRequest): Promise<Medicine> {
  const { localId, intakeDate } = await local.insertMedicineLocal(payload);
  await enqueueSync('medicine', localId, 'UPSERT', { ...payload, intakeDate, localId });
  triggerSync();
  return {
    id: localId,
    medicineName: payload.medicineName,
    dosage: payload.dosage,
    unit: payload.unit,
    intakeDate,
  };
}

export async function updateMedicineApi(id: EntityId, payload: Partial<MedicineRequest>): Promise<Medicine> {
  await local.updateMedicineLocal(id, payload);
  await enqueueSync('medicine', String(id), 'UPSERT', payload, String(id));
  triggerSync();
  const rows = await local.getMedicinesByPeriodLocal('1970-01-01T00:00:00', '2999-12-31T23:59:59');
  const found = rows.find((m) => String(m.id) === String(id));
  if (found) return found;
  return createMedicineApi(payload as MedicineRequest);
}

export async function deleteMedicineApi(id: EntityId): Promise<void> {
  await local.deleteMedicineLocal(id);
  await enqueueSync('medicine', String(id), 'DELETE', { id }, String(id));
  triggerSync();
}

export async function getNotesByDateApi(date: string): Promise<Note[]> {
  return local.getNotesByDateLocal(date);
}

export async function getNotesApi(): Promise<Note[]> {
  const today = toAppDayKey(new Date());
  return getNotesByDateApi(today);
}

export async function createNoteApi(payload: NoteRequest): Promise<Note> {
  const { localId, date } = await local.insertNoteLocal(payload);
  await enqueueSync('note', localId, 'UPSERT', { ...payload, date, localId });
  triggerSync();
  return { noteId: localId, content: payload.content, date };
}

export async function updateNoteApi(noteId: EntityId, payload: NoteRequest): Promise<Note> {
  await local.updateNoteLocal(noteId, payload);
  await enqueueSync('note', String(noteId), 'UPSERT', payload, String(noteId));
  triggerSync();
  return { noteId, content: payload.content, date: payload.date };
}

export async function deleteNoteApi(noteId: EntityId): Promise<void> {
  await local.deleteNoteLocal(noteId);
  await enqueueSync('note', String(noteId), 'DELETE', { id: noteId }, String(noteId));
  triggerSync();
}

export async function getCommonFeelingsApi(): Promise<CommonFeeling[]> {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  return local.getCommonFeelingsInRangeLocal(
    toAppDateTimeString(monthAgo),
    toAppDateTimeString(now),
  );
}

export async function getCommonFeelingsByDateApi(date: string): Promise<CommonFeeling | null> {
  return local.getCommonFeelingByDateLocal(date);
}

export async function getCommonFeelingsByPeriodApi(
  fromIso: string,
  toIso: string,
): Promise<CommonFeeling[]> {
  return local.getCommonFeelingsInRangeLocal(fromIso.slice(0, 19), toIso.slice(0, 19));
}

export async function createCommonFeelingApi(payload: CommonFeelingRequest): Promise<CommonFeeling> {
  const { localId, dateTime } = await local.insertCommonFeelingLocal(payload);
  await enqueueSync('common_feeling', localId, 'UPSERT', { ...payload, dateTime, localId });
  triggerSync();
  return { feelingId: localId, dateTime, wellbeingScore: payload.wellbeingScore };
}

export async function upsertCommonFeelingApi(payload: CommonFeelingRequest): Promise<CommonFeeling> {
  const dateKey = payload.dateTime.slice(0, 10);
  const existing = await getCommonFeelingsByDateApi(dateKey);
  if (existing?.feelingId) {
    return updateCommonFeelingApi(existing.feelingId, payload);
  }
  return createCommonFeelingApi(payload);
}

export async function updateCommonFeelingApi(
  feelingId: EntityId,
  payload: CommonFeelingRequest,
): Promise<CommonFeeling> {
  await local.updateCommonFeelingLocal(feelingId, payload);
  await enqueueSync('common_feeling', String(feelingId), 'UPSERT', payload, String(feelingId));
  triggerSync();
  return { feelingId, dateTime: payload.dateTime.slice(0, 19), wellbeingScore: payload.wellbeingScore };
}

export async function deleteCommonFeelingApi(feelingId: EntityId): Promise<void> {
  await local.deleteCommonFeelingLocal(feelingId);
  await enqueueSync('common_feeling', String(feelingId), 'DELETE', { id: feelingId }, String(feelingId));
  triggerSync();
}

/** Local food–symptom analyzer; uses server only if online and local empty. */
export async function analyzeFoodAndSymptomsApi(
  fromIso: string,
  toIso: string,
): Promise<FoodComponentSymptomsResponse[]> {
  const from = fromIso.slice(0, 19);
  const to = toIso.slice(0, 19);
  const localResult = await analyzeFoodAndSymptomsLocal(from, to);
  if (localResult.length > 0 || !(await isOnline())) {
    return localResult;
  }
  try {
    return await remoteAnalyze(fromIso, toIso);
  } catch {
    return localResult;
  }
}

// Stubs — catalog still from network when online
export { searchFoodCatalogApi, getFoodCategoriesApi, getSymptomsCatalogApi, getMedicinesCatalogApi } from './diaryApi';
