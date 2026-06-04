/**
 * In-browser persistence for diary (AsyncStorage JSON).
 * Replaces the no-op SQLite stub so web dev at localhost works.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

const STORAGE_KEY = '@product_allergen/web_db_v1';

type Row = Record<string, string | number | null>;
type TableName =
  | 'user_profile'
  | 'common_feeling'
  | 'symptom'
  | 'medicine_intake'
  | 'food_intake'
  | 'note'
  | 'sync_queue'
  | 'scan_history';

const TABLE_NAMES: TableName[] = [
  'user_profile',
  'common_feeling',
  'symptom',
  'medicine_intake',
  'food_intake',
  'note',
  'sync_queue',
  'scan_history',
];

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

function parseInsert(sql: string): { table: TableName; columns: string[] } | null {
  const match = normalizeSql(sql).match(
    /^INSERT (?:OR REPLACE )?INTO (\w+) \(([^)]+)\) VALUES \([^)]+\)$/i,
  );
  if (!match) return null;
  const table = match[1] as TableName;
  if (!TABLE_NAMES.includes(table)) return null;
  const columns = match[2].split(',').map((c) => c.trim());
  return { table, columns };
}

function rowFromInsert(columns: string[], params: (string | number | null)[]): Row {
  const row: Row = {};
  columns.forEach((col, i) => {
    row[col] = params[i] ?? null;
  });
  return row;
}

function primaryKeyFor(table: TableName): string {
  return table === 'user_profile' ? 'user_id' : table === 'sync_queue' ? 'id' : 'local_id';
}

function compareAsc(a: string | number | null | undefined, b: string | number | null | undefined) {
  return String(a ?? '').localeCompare(String(b ?? ''));
}

function compareDesc(a: string | number | null | undefined, b: string | number | null | undefined) {
  return compareAsc(b, a);
}

export class WebDatabase {
  private tables: Record<TableName, Row[]> = {
    user_profile: [],
    common_feeling: [],
    symptom: [],
    medicine_intake: [],
    food_intake: [],
    note: [],
    sync_queue: [],
    scan_history: [],
  };

  private ready: Promise<void>;

  constructor(private storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
  }) {
    this.ready = this.load();
  }

  private async load() {
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<Record<TableName, Row[]>>;
      for (const name of TABLE_NAMES) {
        if (Array.isArray(parsed[name])) {
          this.tables[name] = parsed[name]!;
        }
      }
    } catch {
      /* keep empty */
    }
  }

  private async persist() {
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tables));
  }

  private nextSyncId(): number {
    const ids = this.tables.sync_queue.map((r) => Number(r.id ?? 0));
    return (ids.length ? Math.max(...ids) : 0) + 1;
  }

  async execAsync(_sql: string) {
    await this.ready;
    await this.persist();
  }

  async runAsync(sql: string, ...params: (string | number | null)[]) {
    await this.ready;
    const q = normalizeSql(sql);

    const insert = parseInsert(sql);
    if (insert) {
      const row = rowFromInsert(insert.columns, params);
      const pk = primaryKeyFor(insert.table);
      const list = this.tables[insert.table];

      if (insert.table === 'sync_queue' && row.id == null) {
        row.id = this.nextSyncId();
      }

      if (q.startsWith('INSERT OR REPLACE')) {
        const idx = list.findIndex((r) => String(r[pk]) === String(row[pk]));
        if (idx >= 0) list[idx] = { ...list[idx], ...row };
        else list.push(row);
      } else {
        list.push(row);
      }
      await this.persist();
      return { changes: 1, lastInsertRowId: Number(row.id ?? 0) };
    }

    const deleteMatch = q.match(
      /^DELETE FROM (\w+) WHERE local_id = \? OR server_id = \?$/i,
    );
    if (deleteMatch) {
      const table = deleteMatch[1] as TableName;
      const id = String(params[0]);
      this.tables[table] = this.tables[table].filter(
        (r) => String(r.local_id) !== id && String(r.server_id ?? '') !== id,
      );
      await this.persist();
      return { changes: 1, lastInsertRowId: 0 };
    }

    const updateServerMatch = q.match(/^UPDATE (\w+) SET server_id = \? WHERE local_id = \?$/i);
    if (updateServerMatch) {
      const table = updateServerMatch[1] as TableName;
      const [serverId, localId] = params;
      const row = this.tables[table].find((r) => String(r.local_id) === String(localId));
      if (row) row.server_id = serverId == null ? null : String(serverId);
      await this.persist();
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (q === 'UPDATE sync_queue SET is_synced = 1, last_error = NULL WHERE id = ?') {
      const row = this.tables.sync_queue.find((r) => Number(r.id) === Number(params[0]));
      if (row) {
        row.is_synced = 1;
        row.last_error = null;
      }
      await this.persist();
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (q === 'UPDATE sync_queue SET last_error = ? WHERE id = ?') {
      const row = this.tables.sync_queue.find((r) => Number(r.id) === Number(params[1]));
      if (row) row.last_error = String(params[0]);
      await this.persist();
      return { changes: 1, lastInsertRowId: 0 };
    }

    await this.persist();
    return { changes: 0, lastInsertRowId: 0 };
  }

  async getAllAsync<T>(sql: string, ...params: (string | number)[]): Promise<T[]> {
    await this.ready;
    const q = normalizeSql(sql);
    let rows: Row[] = [];

    if (q === 'SELECT * FROM user_profile LIMIT 1') {
      rows = this.tables.user_profile.slice(0, 1);
    } else if (
      q ===
      'SELECT * FROM food_intake WHERE intake_time LIKE ? ORDER BY intake_time DESC'
    ) {
      const prefix = String(params[0]).replace('%', '');
      rows = this.tables.food_intake
        .filter((r) => String(r.intake_time).startsWith(prefix))
        .sort((a, b) => compareDesc(a.intake_time, b.intake_time));
    } else if (
      q ===
      'SELECT * FROM food_intake WHERE substr(intake_time, 1, 10) >= ? AND substr(intake_time, 1, 10) <= ? ORDER BY intake_time DESC'
    ) {
      const [fromDay, toDay] = params.map(String);
      rows = this.tables.food_intake
        .filter((r) => {
          const day = String(r.intake_time).slice(0, 10);
          return day >= fromDay && day <= toDay;
        })
        .sort((a, b) => compareDesc(a.intake_time, b.intake_time));
    } else if (
      q ===
      'SELECT * FROM symptom WHERE substr(start_time, 1, 10) >= ? AND substr(start_time, 1, 10) <= ? ORDER BY start_time DESC'
    ) {
      const [fromDay, toDay] = params.map(String);
      rows = this.tables.symptom
        .filter((r) => {
          const day = String(r.start_time).slice(0, 10);
          return day >= fromDay && day <= toDay;
        })
        .sort((a, b) => compareDesc(a.start_time, b.start_time));
    } else if (
      q ===
      'SELECT * FROM medicine_intake WHERE substr(intake_date, 1, 10) >= ? AND substr(intake_date, 1, 10) <= ? ORDER BY intake_date DESC'
    ) {
      const [fromDay, toDay] = params.map(String);
      rows = this.tables.medicine_intake
        .filter((r) => {
          const day = String(r.intake_date).slice(0, 10);
          return day >= fromDay && day <= toDay;
        })
        .sort((a, b) => compareDesc(a.intake_date, b.intake_date));
    } else if (q === 'SELECT * FROM note WHERE date LIKE ? ORDER BY date DESC') {
      const prefix = String(params[0]).replace('%', '');
      rows = this.tables.note
        .filter((r) => String(r.date).startsWith(prefix))
        .sort((a, b) => compareDesc(a.date, b.date));
    } else if (
      q ===
      'SELECT * FROM common_feeling WHERE substr(date_time, 1, 10) >= ? AND substr(date_time, 1, 10) <= ? ORDER BY date_time DESC'
    ) {
      const [fromDay, toDay] = params.map(String);
      rows = this.tables.common_feeling
        .filter((r) => {
          const day = String(r.date_time).slice(0, 10);
          return day >= fromDay && day <= toDay;
        })
        .sort((a, b) => compareDesc(a.date_time, b.date_time));
    } else if (
      q ===
      'SELECT * FROM common_feeling WHERE date_time LIKE ? ORDER BY updated_at DESC LIMIT 1'
    ) {
      const prefix = String(params[0]).replace('%', '');
      rows = this.tables.common_feeling
        .filter((r) => String(r.date_time).startsWith(prefix))
        .sort((a, b) => compareDesc(a.updated_at, b.updated_at))
        .slice(0, 1);
    } else if (
      q === 'SELECT local_id FROM common_feeling WHERE local_id = ? OR server_id = ? LIMIT 1'
    ) {
      const id = String(params[0]);
      const found = this.tables.common_feeling.find(
        (r) => String(r.local_id) === id || String(r.server_id ?? '') === id,
      );
      rows = found ? [{ local_id: found.local_id }] : [];
    } else if (
      q === 'SELECT local_id FROM symptom WHERE local_id = ? OR server_id = ? LIMIT 1'
    ) {
      const id = String(params[0]);
      const found = this.tables.symptom.find(
        (r) => String(r.local_id) === id || String(r.server_id ?? '') === id,
      );
      rows = found ? [{ local_id: found.local_id }] : [];
    } else if (q === 'SELECT * FROM medicine_intake WHERE local_id = ? OR server_id = ?') {
      const id = String(params[0]);
      rows = this.tables.medicine_intake.filter(
        (r) => String(r.local_id) === id || String(r.server_id ?? '') === id,
      );
    } else if (
      q === 'SELECT * FROM sync_queue WHERE is_synced = 0 ORDER BY created_at ASC LIMIT 50'
    ) {
      rows = this.tables.sync_queue
        .filter((r) => r.is_synced === 0 || r.is_synced === '0')
        .sort((a, b) => compareAsc(a.created_at, b.created_at))
        .slice(0, 50);
    }

    return rows as T[];
  }

  async getFirstAsync<T>(sql: string, ...params: (string | number)[]): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, ...params);
    return rows[0] ?? null;
  }
}

export async function createWebDatabase(storage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}): Promise<SQLiteDatabase> {
  const db = new WebDatabase(storage);
  await db.execAsync('');
  return db as unknown as SQLiteDatabase;
}
