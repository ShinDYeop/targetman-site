-- 스팸/무차별 대입 방어용 로그. 개인정보는 숫자만 남긴 전화 키로 제한하고
-- 24시간이 지나면 코드에서 지웁니다.
CREATE TABLE IF NOT EXISTS submit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  phone_key TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_submit_log_phone ON submit_log (phone_key, created_at);
CREATE INDEX IF NOT EXISTS idx_submit_log_time ON submit_log (created_at);

CREATE TABLE IF NOT EXISTS admin_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  ok INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_admin_attempts_time ON admin_attempts (created_at);
