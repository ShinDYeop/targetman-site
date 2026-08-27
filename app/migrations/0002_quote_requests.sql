CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  contract_type TEXT NOT NULL DEFAULT '',
  term_months TEXT NOT NULL DEFAULT '',
  annual_km TEXT NOT NULL DEFAULT '',
  owner_type TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  timing TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  call_window TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  src TEXT NOT NULL DEFAULT '',
  marketing_optin INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests (created_at DESC);
