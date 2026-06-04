import { getDatabase } from '../db/database';

export type SyncOperation = 'INSERT' | 'UPDATE' | 'UPSERT' | 'DELETE';

export async function enqueueSync(
  entityType: string,
  entityLocalId: string,
  operation: SyncOperation,
  payload: unknown,
  serverId?: string | null,
) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sync_queue (
      entity_type, entity_local_id, server_id, operation, payload_json, created_at, is_synced
    ) VALUES (?, ?, ?, ?, ?, ?, 0)`,
    entityType,
    entityLocalId,
    serverId ?? null,
    operation,
    JSON.stringify(payload),
    Date.now(),
  );
}

export async function getPendingSyncItems() {
  const db = await getDatabase();
  return db.getAllAsync<{
    id: number;
    entity_type: string;
    entity_local_id: string;
    server_id: string | null;
    operation: string;
    payload_json: string;
  }>('SELECT * FROM sync_queue WHERE is_synced = 0 ORDER BY created_at ASC LIMIT 50');
}

export async function markSyncItemDone(id: number) {
  const db = await getDatabase();
  await db.runAsync('UPDATE sync_queue SET is_synced = 1, last_error = NULL WHERE id = ?', id);
}

export async function markSyncItemError(id: number, error: string) {
  const db = await getDatabase();
  await db.runAsync('UPDATE sync_queue SET last_error = ? WHERE id = ?', error.slice(0, 500), id);
}
