CREATE TABLE IF NOT EXISTS yar_devices (
  device_id TEXT PRIMARY KEY,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  events INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS yar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  event TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_yar_devices_last_seen ON yar_devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_yar_events_created_at ON yar_events(created_at);
