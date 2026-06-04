import AsyncStorage from '@react-native-async-storage/async-storage';

import { MIGRATION_SQL } from './schema';
import { createWebDatabase } from './webDatabase';

let dbPromise: ReturnType<typeof createWebDatabase> | null = null;

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await createWebDatabase(AsyncStorage);
      await db.execAsync(MIGRATION_SQL);
      if (__DEV__) {
        console.info(
          '[Product-allergen] Web: дневник сохраняется в AsyncStorage (браузер). На телефоне — SQLite.',
        );
      }
      return db;
    })();
  }
  return dbPromise;
}

export function newLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
