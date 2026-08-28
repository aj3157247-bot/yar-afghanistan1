CREATE TABLE IF NOT EXISTS direct_ads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT DEFAULT '',
  video TEXT DEFAULT '',
  text TEXT NOT NULL,
  link TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'inactive',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS direct_ad_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('impression','click')),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_direct_ads_active_dates ON direct_ads(status,start_date,end_date);
CREATE INDEX IF NOT EXISTS idx_direct_ad_events_ad ON direct_ad_events(ad_id,event_type);
