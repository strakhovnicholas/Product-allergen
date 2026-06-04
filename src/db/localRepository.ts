import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase, newLocalId } from './database';
import { nowAppDateTimeString } from '../utils/datetime';
import type { Profile } from '../api/profileApi';
import type {
  CommonFeeling,
  CommonFeelingRequest,
  Food,
  FoodRequest,
  Medicine,
  MedicineRequest,
  Note,
  NoteRequest,
  Symptom,
  SymptomRequest,
} from '../api/diaryApi';

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toBool(value: number | null | undefined): boolean {
  return value === 1;
}

export async function saveProfileLocal(profile: Profile, userId: string) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile (
      user_id, full_name, age, weight, height, gender, country, predisposition,
      doctor_notes, smoker, alcohol, sports, allergies_json, chronic_diseases_json,
      medications_regular_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    userId,
    profile.fullName ?? '',
    profile.age ?? null,
    profile.weight ?? null,
    profile.height ?? null,
    profile.gender ?? null,
    profile.country ?? null,
    profile.predisposition ?? 'NONE',
    profile.doctorNotes ?? null,
    profile.smoker ? 1 : 0,
    profile.alcohol ? 1 : 0,
    profile.sports ? 1 : 0,
    JSON.stringify(profile.allergies ?? []),
    JSON.stringify(profile.chronicDiseases ?? []),
    JSON.stringify(profile.medicationsRegular ?? []),
    Date.now(),
  );
}

export async function getProfileLocal(): Promise<Profile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    user_id: string;
    full_name: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    gender: string | null;
    country: string | null;
    predisposition: string | null;
    doctor_notes: string | null;
    smoker: number;
    alcohol: number;
    sports: number;
    allergies_json: string;
    chronic_diseases_json: string;
    medications_regular_json: string;
  }>('SELECT * FROM user_profile LIMIT 1');

  if (!row) return null;
  return {
    userId: row.user_id,
    fullName: row.full_name,
    age: row.age ?? undefined,
    weight: row.weight ?? undefined,
    height: row.height ?? undefined,
    gender: row.gender ?? undefined,
    country: row.country ?? undefined,
    predisposition: (row.predisposition as Profile['predisposition']) ?? 'NONE',
    doctorNotes: row.doctor_notes ?? undefined,
    smoker: toBool(row.smoker),
    alcohol: toBool(row.alcohol),
    sports: toBool(row.sports),
    allergies: parseJsonArray(row.allergies_json),
    chronicDiseases: parseJsonArray(row.chronic_diseases_json),
    medicationsRegular: parseJsonArray(row.medications_regular_json),
  };
}

export async function getFoodByDateLocal(date: string): Promise<Food[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    local_id: string;
    server_id: string | null;
    food_name: string;
    category: string | null;
    amount: number;
    unit: string;
    intake_time: string;
    reaction_occurred: number;
    reaction_description: string | null;
    components_json: string;
  }>('SELECT * FROM food_intake WHERE intake_time LIKE ? ORDER BY intake_time DESC', `${date}%`);

  return rows.map((r) => ({
    foodIntakeId: r.server_id ?? r.local_id,
    foodName: r.food_name,
    category: r.category ?? undefined,
    amount: r.amount,
    unit: r.unit as Food['unit'],
    intakeTime: r.intake_time,
    reactionOccurred: toBool(r.reaction_occurred),
    reactionDescription: r.reaction_description ?? undefined,
    components: parseJsonArray(r.components_json),
  }));
}

export async function getFoodInRangeLocal(from: string, to: string): Promise<Food[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    local_id: string;
    server_id: string | null;
    food_name: string;
    category: string | null;
    amount: number;
    unit: string;
    intake_time: string;
    reaction_occurred: number;
    reaction_description: string | null;
    components_json: string;
  }>(
    'SELECT * FROM food_intake WHERE substr(intake_time, 1, 10) >= ? AND substr(intake_time, 1, 10) <= ? ORDER BY intake_time DESC',
    from.slice(0, 10),
    to.slice(0, 10),
  );
  return rows.map((r) => ({
    foodIntakeId: r.server_id ?? r.local_id,
    foodName: r.food_name,
    category: r.category ?? undefined,
    amount: r.amount,
    unit: r.unit as Food['unit'],
    intakeTime: r.intake_time,
    reactionOccurred: toBool(r.reaction_occurred),
    reactionDescription: r.reaction_description ?? undefined,
    components: parseJsonArray(r.components_json),
  }));
}

export async function insertFoodLocal(payload: FoodRequest, localId = newLocalId()) {
  const db = await getDatabase();
  const intakeTime = payload.intakeTime.slice(0, 19);
  await db.runAsync(
    `INSERT OR REPLACE INTO food_intake (
      local_id, food_name, category, amount, unit, intake_time,
      reaction_occurred, reaction_description, components_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    localId,
    payload.foodName.trim(),
    payload.category,
    payload.amount,
    payload.unit,
    intakeTime,
    payload.reactionOccurred ? 1 : 0,
    payload.reactionDescription ?? null,
    JSON.stringify(payload.components ?? []),
    Date.now(),
  );
  return { localId, intakeTime };
}

export async function updateFoodLocal(
  id: string | number,
  payload: FoodRequest,
  localIdHint?: string,
) {
  const db = await getDatabase();
  const localId = localIdHint ?? String(id);
  await insertFoodLocal(payload, localId);
  const serverId = String(id) !== localId ? String(id) : null;
  if (serverId) {
    await db.runAsync('UPDATE food_intake SET server_id = ? WHERE local_id = ?', serverId, localId);
  }
}

export async function deleteFoodLocal(id: string | number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM food_intake WHERE local_id = ? OR server_id = ?', String(id), String(id));
}

export async function getSymptomsByDateRangeLocal(from: string, to: string): Promise<Symptom[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    local_id: string;
    server_id: string | null;
    symptom_name: string;
    severity: number;
    start_time: string;
    end_time: string | null;
    possible_cause: string | null;
  }>(
    'SELECT * FROM symptom WHERE substr(start_time, 1, 10) >= ? AND substr(start_time, 1, 10) <= ? ORDER BY start_time DESC',
    from.slice(0, 10),
    to.slice(0, 10),
  );
  return rows.map(mapSymptomRow);
}

function mapSymptomRow(r: {
  local_id: string;
  server_id: string | null;
  symptom_name: string;
  severity: number;
  start_time: string;
  end_time: string | null;
  possible_cause: string | null;
}): Symptom {
  return {
    id: r.server_id ?? r.local_id,
    symptomsId: r.server_id ?? r.local_id,
    symptomName: r.symptom_name,
    severity: r.severity,
    startTime: r.start_time,
    endTime: r.end_time ?? undefined,
    possibleCause: r.possible_cause ?? undefined,
  };
}

export async function insertSymptomLocal(payload: SymptomRequest, localId = newLocalId()) {
  const db = await getDatabase();
  const startTime = (payload.startTime ?? nowAppDateTimeString()).slice(0, 19);
  await db.runAsync(
    `INSERT OR REPLACE INTO symptom (
      local_id, symptom_name, severity, start_time, end_time, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    localId,
    payload.symptomName.trim(),
    payload.severity,
    startTime,
    payload.endTime?.slice(0, 19) ?? null,
    Date.now(),
  );
  return { localId, startTime };
}

export async function updateSymptomLocal(id: string | number, payload: SymptomRequest) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ local_id: string }>(
    'SELECT local_id FROM symptom WHERE local_id = ? OR server_id = ? LIMIT 1',
    String(id),
    String(id),
  );
  return insertSymptomLocal(payload, row?.local_id ?? String(id));
}

export async function deleteSymptomLocal(id: string | number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM symptom WHERE local_id = ? OR server_id = ?', String(id), String(id));
}

export async function getMedicinesByPeriodLocal(from: string, to: string): Promise<Medicine[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    local_id: string;
    server_id: string | null;
    medicine_name: string;
    dosage: number;
    unit: string;
    intake_date: string;
    reason: string | null;
  }>(
    'SELECT * FROM medicine_intake WHERE substr(intake_date, 1, 10) >= ? AND substr(intake_date, 1, 10) <= ? ORDER BY intake_date DESC',
    from.slice(0, 10),
    to.slice(0, 10),
  );
  return rows.map((r) => ({
    id: r.server_id ?? r.local_id,
    medicineName: r.medicine_name,
    dosage: r.dosage,
    unit: r.unit as Medicine['unit'],
    intakeDate: r.intake_date,
    reason: r.reason ?? undefined,
  }));
}

export async function insertMedicineLocal(payload: MedicineRequest, localId = newLocalId()) {
  const db = await getDatabase();
  const intakeDate = payload.intakeDate.slice(0, 19);
  await db.runAsync(
    `INSERT OR REPLACE INTO medicine_intake (
      local_id, medicine_name, dosage, unit, intake_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    localId,
    payload.medicineName.trim(),
    payload.dosage,
    payload.unit,
    intakeDate,
    Date.now(),
  );
  return { localId, intakeDate };
}

export async function updateMedicineLocal(id: string | number, payload: Partial<MedicineRequest>) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    local_id: string;
    medicine_name: string;
    dosage: number;
    unit: string;
    intake_date: string;
  }>('SELECT * FROM medicine_intake WHERE local_id = ? OR server_id = ?', String(id), String(id));
  if (!row) return;
  await insertMedicineLocal(
    {
      medicineName: payload.medicineName ?? row.medicine_name,
      dosage: payload.dosage ?? row.dosage,
      unit: (payload.unit ?? row.unit) as MedicineRequest['unit'],
      intakeDate: payload.intakeDate ?? row.intake_date,
    },
    row.local_id,
  );
}

export async function deleteMedicineLocal(id: string | number) {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM medicine_intake WHERE local_id = ? OR server_id = ?',
    String(id),
    String(id),
  );
}

export async function getNotesByDateLocal(date: string): Promise<Note[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    local_id: string;
    server_id: string | null;
    content: string;
    date: string;
  }>('SELECT * FROM note WHERE date LIKE ? ORDER BY date DESC', `${date}%`);
  return rows.map((r) => ({
    noteId: r.server_id ?? r.local_id,
    content: r.content,
    date: r.date,
  }));
}

export async function insertNoteLocal(payload: NoteRequest, localId = newLocalId()) {
  const db = await getDatabase();
  const date = payload.date.slice(0, 19);
  await db.runAsync(
    'INSERT OR REPLACE INTO note (local_id, content, date, updated_at) VALUES (?, ?, ?, ?)',
    localId,
    payload.content.trim(),
    date,
    Date.now(),
  );
  return { localId, date };
}

export async function updateNoteLocal(id: string | number, payload: NoteRequest) {
  await insertNoteLocal(payload, String(id));
}

export async function deleteNoteLocal(id: string | number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM note WHERE local_id = ? OR server_id = ?', String(id), String(id));
}

export async function getCommonFeelingsInRangeLocal(from: string, to: string): Promise<CommonFeeling[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    local_id: string;
    server_id: string | null;
    date_time: string;
    wellbeing_score: number;
    mood: number | null;
    energy_level: number | null;
    comment: string | null;
  }>(
    'SELECT * FROM common_feeling WHERE substr(date_time, 1, 10) >= ? AND substr(date_time, 1, 10) <= ? ORDER BY date_time DESC',
    from.slice(0, 10),
    to.slice(0, 10),
  );
  return rows.map((r) => ({
    feelingId: r.server_id ?? r.local_id,
    dateTime: r.date_time,
    wellbeingScore: r.wellbeing_score,
    mood: r.mood ?? undefined,
    energyLevel: r.energy_level ?? undefined,
    comment: r.comment ?? undefined,
  }));
}

export async function getCommonFeelingByDateLocal(date: string): Promise<CommonFeeling | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    local_id: string;
    server_id: string | null;
    date_time: string;
    wellbeing_score: number;
    mood: number | null;
  }>(
    'SELECT * FROM common_feeling WHERE date_time LIKE ? ORDER BY updated_at DESC LIMIT 1',
    `${date}%`,
  );
  if (!row) return null;
  return {
    feelingId: row.server_id ?? row.local_id,
    dateTime: row.date_time,
    wellbeingScore: row.wellbeing_score,
    mood: row.mood ?? undefined,
  };
}

export async function insertCommonFeelingLocal(payload: CommonFeelingRequest, localId = newLocalId()) {
  const db = await getDatabase();
  const dateTime = payload.dateTime.slice(0, 19);
  await db.runAsync(
    `INSERT OR REPLACE INTO common_feeling (
      local_id, date_time, wellbeing_score, updated_at
    ) VALUES (?, ?, ?, ?)`,
    localId,
    dateTime,
    payload.wellbeingScore,
    Date.now(),
  );
  return { localId, dateTime };
}

export async function updateCommonFeelingLocal(id: string | number, payload: CommonFeelingRequest) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ local_id: string }>(
    'SELECT local_id FROM common_feeling WHERE local_id = ? OR server_id = ? LIMIT 1',
    String(id),
    String(id),
  );
  await insertCommonFeelingLocal(payload, row?.local_id ?? String(id));
}

export async function deleteCommonFeelingLocal(id: string | number) {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM common_feeling WHERE local_id = ? OR server_id = ?',
    String(id),
    String(id),
  );
}

export async function saveScanHistoryLocal(entry: {
  localId: string;
  rawText: string;
  ingredients: string[];
  verdict: unknown;
  productName?: string;
  score: number;
}) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO scan_history (
      local_id, raw_text, parsed_ingredients_json, verdict_json, product_name, score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    entry.localId,
    entry.rawText,
    JSON.stringify(entry.ingredients),
    JSON.stringify(entry.verdict),
    entry.productName ?? null,
    entry.score,
    Date.now(),
  );
}

export async function upsertRemoteRows(db: SQLiteDatabase, table: string, rows: Record<string, unknown>[]) {
  // used by data puller - implemented per entity in dataPuller.ts
  void table;
  void rows;
  void db;
}
