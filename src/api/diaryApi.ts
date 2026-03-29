import { apiRequest } from './client';

/* ===== Типы ===== */

export type CommonFeeling = {
  feelingId: number;
  dateTime: string;
  wellbeingScore: number;
  mood: number;
  energyLevel: number;
  comment?: string;
};

export type Symptom = {
  symptomsId: number;
  symptomName: string;
  severity: number;
  startTime: string;
  endTime?: string;
  possibleCause?: string;
};

export type Medicine = {
  id: number;
  medicineName: string;
  dosage: number;
  unit: string;
  intakeTime: string;
  reason?: string;
};

export type Food = {
  foodIntakeId: number;
  foodName: string;
  category: string;
  amount: number;
  unit: string;
  intakeTime: string;
  reactionOccurred: boolean;
  reactionDescription?: string;
};

export type Note = {
  noteId: number;
  content: string;
  date: string;
};

/* ===== API ===== */

export const getCommonFeelingsApi = () =>
  apiRequest<CommonFeeling[]>('/api/feelings/common', { auth: true });

export const getSymptomsApi = () =>
  apiRequest<Symptom[]>('/api/feelings/symptoms/all', { auth: true });

export const getMedicinesApi = () =>
  apiRequest<Medicine[]>('/api/medicines', { auth: true });

export const getFoodApi = () =>
  apiRequest<Food[]>('/api/feelings/food', { auth: true });

export const getNotesApi = () =>
  apiRequest<Note[]>('/api/feelings/notes', { auth: true });