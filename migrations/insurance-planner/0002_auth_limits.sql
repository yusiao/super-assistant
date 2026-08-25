ALTER TABLE users ADD COLUMN password_iterations INTEGER NOT NULL DEFAULT 20000;

CREATE TABLE IF NOT EXISTS auth_limits (
  rate_key TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL,
  window_started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_limits_updated_at_idx ON auth_limits(updated_at);
