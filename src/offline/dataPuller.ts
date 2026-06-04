import {
  getCommonFeelingsApi,
  getIntakeMedicinesByPeriodApi,
  getSymptomsByDateRangeApi,
} from '../api/diaryApi';
import { getUserProfileApi } from '../api/profileApi';
import { getDatabase } from '../db/database';
import { saveProfileLocal } from '../db/localRepository';
import { isOnline } from './network';
import { extractUserIdFromToken } from '../utils/jwt';
import { toAppDateTimeString } from '../utils/datetime';

export async function pullRemoteDataToLocal(accessToken: string) {
  if (!(await isOnline())) return;

  const userId = extractUserIdFromToken(accessToken);
  if (!userId) return;

  try {
    const profile = await getUserProfileApi();
    await saveProfileLocal(profile, userId);
  } catch {
    // profile may not exist yet
  }

  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(now.getDate() - 30);
  const from = toAppDateTimeString(monthAgo);
  const to = toAppDateTimeString(now);

  const db = await getDatabase();

  try {
    const feelings = await getCommonFeelingsApi();
    for (const f of feelings) {
      const localId = String(f.feelingId);
      await db.runAsync(
        `INSERT OR REPLACE INTO common_feeling (local_id, server_id, date_time, wellbeing_score, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        localId,
        localId,
        f.dateTime.slice(0, 19),
        f.wellbeingScore,
        Date.now(),
      );
    }
  } catch {
    /* offline or server error */
  }

  try {
    const symptoms = await getSymptomsByDateRangeApi(from, to);
    for (const s of symptoms) {
      const sid = String(s.id ?? s.symptomsId);
      await db.runAsync(
        `INSERT OR REPLACE INTO symptom (local_id, server_id, symptom_name, severity, start_time, end_time, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        sid,
        sid,
        s.symptomName,
        s.severity,
        (s.startTime ?? from).slice(0, 19),
        s.endTime?.slice(0, 19) ?? null,
        Date.now(),
      );
    }
  } catch {
    /* ignore */
  }

  try {
    const medicines = await getIntakeMedicinesByPeriodApi(from, to);
    for (const m of medicines) {
      const mid = String(m.id);
      await db.runAsync(
        `INSERT OR REPLACE INTO medicine_intake (local_id, server_id, medicine_name, dosage, unit, intake_date, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        mid,
        mid,
        m.medicineName,
        m.dosage,
        m.unit,
        m.intakeDate.slice(0, 19),
        Date.now(),
      );
    }
  } catch {
    /* ignore */
  }
}
