export const SCHEMA = `
CREATE TABLE IF NOT EXISTS announced_events (
  event_key TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  announced_at TEXT NOT NULL,
  payload TEXT
);

CREATE INDEX IF NOT EXISTS idx_announced_events_type
  ON announced_events(event_type);
`
