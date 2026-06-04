import {
  createCommonFeelingApi,
  createFoodApi,
  createMedicineApi,
  createNoteApi,
  createSymptomApi,
  deleteCommonFeelingApi,
  deleteFoodApi,
  deleteMedicineApi,
  deleteNoteApi,
  deleteSymptomApi,
  updateCommonFeelingApi,
  updateFoodApi,
  updateMedicineApi,
  updateNoteApi,
  updateSymptomApi,
} from '../api/diaryApi';
import { updateUserProfileApi } from '../api/profileApi';
import { getDatabase } from '../db/database';
import { getPendingSyncItems, markSyncItemDone, markSyncItemError } from './syncQueue';
import { nowAppDateTimeString } from '../utils/datetime';
import { isOnline } from './network';

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (!(await isOnline())) {
    return { synced: 0, failed: 0 };
  }

  const pending = await getPendingSyncItems();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const payload = JSON.parse(item.payload_json);
      await processItem(item.entity_type, item.operation, payload, item.server_id, item.entity_local_id);
      await markSyncItemDone(item.id);
      synced += 1;
    } catch (e) {
      await markSyncItemError(item.id, e instanceof Error ? e.message : 'sync error');
      failed += 1;
    }
  }

  return { synced, failed };
}

async function processItem(
  entityType: string,
  operation: string,
  payload: Record<string, unknown>,
  serverId: string | null,
  localId: string,
) {
  if (operation === 'DELETE') {
    await processDelete(entityType, serverId ?? localId);
    return;
  }

  switch (entityType) {
    case 'profile':
      await updateUserProfileApi(payload as import('../api/profileApi').Profile);
      break;
    case 'food': {
      const dto = mapFoodPayload(payload);
      if (serverId) {
        const res = await updateFoodApi(serverId, dto);
        await updateServerId('food_intake', localId, res.foodIntakeId ?? serverId);
      } else {
        const res = await createFoodApi(dto);
        await updateServerId('food_intake', localId, String(res.foodIntakeId));
      }
      break;
    }
    case 'symptom': {
      const dto = mapSymptomPayload(payload);
      if (serverId) {
        const res = await updateSymptomApi(serverId, dto);
        await updateServerId('symptom', localId, String(res.id ?? res.symptomsId ?? serverId));
      } else {
        const res = await createSymptomApi(dto);
        await updateServerId('symptom', localId, String(res.id ?? res.symptomsId));
      }
      break;
    }
    case 'medicine': {
      const dto = mapMedicinePayload(payload);
      if (serverId) {
        const res = await updateMedicineApi(serverId, dto);
        await updateServerId('medicine_intake', localId, String(res.id ?? serverId));
      } else {
        const res = await createMedicineApi(dto);
        await updateServerId('medicine_intake', localId, String(res.id));
      }
      break;
    }
    case 'note': {
      const dto = mapNotePayload(payload);
      if (serverId) {
        const res = await updateNoteApi(serverId, dto);
        await updateServerId('note', localId, String(res.noteId ?? serverId));
      } else {
        const res = await createNoteApi(dto);
        await updateServerId('note', localId, String(res.noteId));
      }
      break;
    }
    case 'common_feeling': {
      const dto = mapFeelingPayload(payload);
      if (serverId) {
        const res = await updateCommonFeelingApi(serverId, dto);
        await updateServerId('common_feeling', localId, String(res.feelingId ?? serverId));
      } else {
        const res = await createCommonFeelingApi(dto);
        await updateServerId('common_feeling', localId, String(res.feelingId));
      }
      break;
    }
    default:
      break;
  }
}

async function processDelete(entityType: string, id: string) {
  switch (entityType) {
    case 'food':
      await deleteFoodApi(id);
      break;
    case 'symptom':
      await deleteSymptomApi(id);
      break;
    case 'medicine':
      await deleteMedicineApi(id);
      break;
    case 'note':
      await deleteNoteApi(id);
      break;
    case 'common_feeling':
      await deleteCommonFeelingApi(id);
      break;
    default:
      break;
  }
}

async function updateServerId(table: string, localId: string, serverId: string) {
  const db = await getDatabase();
  await db.runAsync(`UPDATE ${table} SET server_id = ? WHERE local_id = ?`, serverId, localId);
}

function mapFoodPayload(p: Record<string, unknown>) {
  return {
    foodName: String(p.foodName ?? ''),
    category: String(p.category ?? 'OTHER'),
    amount: Number(p.amount ?? 1),
    unit: (p.unit as 'GRAM') ?? 'GRAM',
    intakeTime: String(p.intakeTime ?? nowAppDateTimeString()),
    reactionOccurred: Boolean(p.reactionOccurred),
    reactionDescription: (p.reactionDescription as string) ?? undefined,
    components: (p.components as string[]) ?? [],
  };
}

function mapSymptomPayload(p: Record<string, unknown>) {
  return {
    symptomName: String(p.symptomName ?? ''),
    severity: Number(p.severity ?? 3),
    startTime: String(p.startTime ?? nowAppDateTimeString()),
    endTime: (p.endTime as string) ?? undefined,
  };
}

function mapMedicinePayload(p: Record<string, unknown>) {
  return {
    medicineName: String(p.medicineName ?? ''),
    dosage: Number(p.dosage ?? 1),
    unit: (p.unit as 'TABLET') ?? 'TABLET',
    intakeDate: String(p.intakeDate ?? nowAppDateTimeString()),
  };
}

function mapNotePayload(p: Record<string, unknown>) {
  return {
    content: String(p.content ?? ''),
    date: String(p.date ?? nowAppDateTimeString()),
  };
}

function mapFeelingPayload(p: Record<string, unknown>) {
  return {
    dateTime: String(p.dateTime ?? nowAppDateTimeString()),
    wellbeingScore: Number(p.wellbeingScore ?? 3),
    comment: (p.comment as string) ?? undefined,
  };
}

export async function syncInBackground() {
  try {
    await processSyncQueue();
  } catch (e) {
    console.log('sync error', e);
  }
}
