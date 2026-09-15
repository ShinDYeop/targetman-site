-- 차량별 견적. 견적표 사진 여러 장(photo 칸에 쉼표로 이어 붙임)과 설명 글이 본체입니다.
CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  trim TEXT NOT NULL DEFAULT '',
  contract TEXT NOT NULL DEFAULT '리스',
  term_months INTEGER NOT NULL DEFAULT 0,
  monthly_from INTEGER NOT NULL DEFAULT 0,
  quoted_at TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_estimates_sort ON estimates (sort_order DESC, id DESC);
