ALTER TABLE users
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(id::text, '') || ' ' || 
			coalesce(slack_id, '') || ' ' || coalesce(nickname, '')`
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS users_search_idx
  ON users USING gin(search_vector);
