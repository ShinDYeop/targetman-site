-- 사진 보관. R2(객체 저장소) 대신 D1에 직접 넣습니다.
-- 이 사이트는 사진이 장당 100KB 안팎이라 이 규모에서는 D1로 충분합니다.
-- key 형식은 기존과 같아서(img/xxxx.jpg) 이미 등록된 글을 손볼 필요가 없습니다.
CREATE TABLE IF NOT EXISTS photos (
  key        TEXT PRIMARY KEY,
  mime       TEXT NOT NULL,
  bytes      BLOB NOT NULL,
  size       INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT ''
);
