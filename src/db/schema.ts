export const DB_NAME = 'product_allergen.db';

export const MIGRATION_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS user_profile (
  user_id TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  age INTEGER,
  weight REAL,
  height INTEGER,
  gender TEXT,
  country TEXT,
  predisposition TEXT DEFAULT 'NONE',
  doctor_notes TEXT,
  smoker INTEGER DEFAULT 0,
  alcohol INTEGER DEFAULT 0,
  sports INTEGER DEFAULT 0,
  allergies_json TEXT DEFAULT '[]',
  chronic_diseases_json TEXT DEFAULT '[]',
  medications_regular_json TEXT DEFAULT '[]',
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS common_feeling (
  local_id TEXT PRIMARY KEY NOT NULL,
  server_id TEXT,
  date_time TEXT NOT NULL,
  wellbeing_score INTEGER NOT NULL,
  mood INTEGER,
  energy_level INTEGER,
  comment TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS symptom (
  local_id TEXT PRIMARY KEY NOT NULL,
  server_id TEXT,
  symptom_name TEXT NOT NULL,
  severity INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  possible_cause TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS medicine_intake (
  local_id TEXT PRIMARY KEY NOT NULL,
  server_id TEXT,
  medicine_name TEXT NOT NULL,
  dosage REAL NOT NULL,
  unit TEXT NOT NULL,
  intake_date TEXT NOT NULL,
  reason TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS food_intake (
  local_id TEXT PRIMARY KEY NOT NULL,
  server_id TEXT,
  food_name TEXT NOT NULL,
  category TEXT,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  intake_time TEXT NOT NULL,
  reaction_occurred INTEGER DEFAULT 0,
  reaction_description TEXT,
  components_json TEXT DEFAULT '[]',
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS note (
  local_id TEXT PRIMARY KEY NOT NULL,
  server_id TEXT,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_local_id TEXT NOT NULL,
  server_id TEXT,
  operation TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  is_synced INTEGER DEFAULT 0,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS scan_history (
  local_id TEXT PRIMARY KEY NOT NULL,
  raw_text TEXT NOT NULL,
  parsed_ingredients_json TEXT NOT NULL,
  verdict_json TEXT NOT NULL,
  product_name TEXT,
  score INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_intake_time ON food_intake(intake_time);
CREATE INDEX IF NOT EXISTS idx_symptom_start ON symptom(start_time);
CREATE INDEX IF NOT EXISTS idx_sync_pending ON sync_queue(is_synced, created_at);
`;
