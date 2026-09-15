-- 고객이 각 출고 후기에 남기는 공개 댓글.
-- approved = 0 이면 관리자에게만 보이고, 사장님이 승인해야 사이트에 나갑니다.
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id  INTEGER NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',
  approved   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_comments_review ON comments (review_id, approved, id);
CREATE INDEX IF NOT EXISTS idx_comments_pending ON comments (approved, id);
