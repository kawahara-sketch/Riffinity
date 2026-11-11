CREATE TABLE IF NOT EXISTS devices (
 endpoint TEXT PRIMARY KEY,
 subscription TEXT NOT NULL,
 token_hash TEXT NOT NULL,
 hour INTEGER NOT NULL DEFAULT 21,
 enabled INTEGER NOT NULL DEFAULT 1,
 completed_day TEXT,
 freezes INTEGER NOT NULL DEFAULT 0,
 streak INTEGER NOT NULL DEFAULT 0,
 last_sent_day TEXT,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_devices_hour ON devices(enabled,hour);
