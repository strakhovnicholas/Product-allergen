import * as SQLite from 'expo-sqlite';

import { DB_NAME, MIGRATION_SQL } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(MIGRATION_SQL);
      return db;
    })();
  }
  return dbPromise;
}

export function newLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
