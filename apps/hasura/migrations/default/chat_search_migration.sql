-- ============================================
-- Chat Search Implementation - PostgreSQL Full-Text Search
-- ============================================
-- Execute this script in DBeaver on your Hasura database
-- ============================================

-- Step 1: Add search_vector columns
ALTER TABLE "AIConversations" 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE "AIMessages" 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create GIN indexes for fast searching
CREATE INDEX IF NOT EXISTS conversations_search_idx 
  ON "AIConversations" USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS messages_search_idx 
  ON "AIMessages" USING GIN (search_vector);

-- Step 3: Create trigger function for AIConversations
CREATE OR REPLACE FUNCTION "AIConversations_search_vector_update"()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    to_tsvector('pg_catalog.english', COALESCE(NEW.title, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger function for AIMessages (includes metadata)
CREATE OR REPLACE FUNCTION "AIMessages_search_vector_update"()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    to_tsvector('pg_catalog.english', 
      COALESCE(NEW.content, '') || ' ' || 
      COALESCE(NEW."rephrasedContent", '') || ' ' ||
      COALESCE(NEW.metadata->>'formattedContent', '')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Attach triggers to tables
DROP TRIGGER IF EXISTS conversations_search_update ON "AIConversations";
CREATE TRIGGER conversations_search_update
  BEFORE INSERT OR UPDATE ON "AIConversations"
  FOR EACH ROW
  EXECUTE FUNCTION "AIConversations_search_vector_update"();

DROP TRIGGER IF EXISTS messages_search_update ON "AIMessages";
CREATE TRIGGER messages_search_update
  BEFORE INSERT OR UPDATE ON "AIMessages"
  FOR EACH ROW
  EXECUTE FUNCTION "AIMessages_search_vector_update"();

-- Step 6: Backfill existing data
UPDATE "AIConversations" 
SET search_vector = to_tsvector('pg_catalog.english', COALESCE(title, ''))
WHERE search_vector IS NULL;

UPDATE "AIMessages" 
SET search_vector = to_tsvector('pg_catalog.english', 
  COALESCE(content, '') || ' ' || 
  COALESCE("rephrasedContent", '') || ' ' ||
  COALESCE(metadata->>'formattedContent', '')
)
WHERE search_vector IS NULL;

-- Step 7: Optimize tables
VACUUM ANALYZE "AIConversations";
VACUUM ANALYZE "AIMessages";

-- ============================================
-- HYBRID SEARCH: FTS + Trigram (pg_trgm)
-- ============================================

-- Step 8: Enable pg_trgm extension for fuzzy/partial matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 9: Create trigram indexes for partial word matching
CREATE INDEX IF NOT EXISTS conversations_title_trgm_idx 
  ON "AIConversations" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS messages_content_trgm_idx 
  ON "AIMessages" USING GIN (content gin_trgm_ops);

CREATE INDEX IF NOT EXISTS messages_rephrased_trgm_idx 
  ON "AIMessages" USING GIN ("rephrasedContent" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS messages_metadata_trgm_idx 
  ON "AIMessages" USING GIN ((metadata->>'formattedContent') gin_trgm_ops);

-- Step 10: Set similarity threshold (0.3 = 30% similarity required)
-- Lower = more fuzzy matches, Higher = stricter matches
-- Default 0.3 works well for typos and partial matches
SELECT set_limit(0.3);
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================
-- HYBRID SEARCH FUNCTIONS (FTS + Trigram)
-- ============================================
-- Searches using:
--   1. FTS (Full-Text Search) - Fast semantic word matching
--   2. Trigram (pg_trgm) - Fuzzy & partial word matching
--   3. ILIKE - Fallback for exact substring matches
-- ============================================

-- Function: Hybrid search conversations (no cursor)
CREATE OR REPLACE FUNCTION search_conversations_fts(
  search_text text,
  user_id_filter uuid,
  result_limit int DEFAULT 20
)
RETURNS SETOF "AIConversations"
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Lower trigram threshold slightly (helps short words)
  PERFORM set_config('pg_trgm.similarity_threshold', '0.15', true);

  RETURN QUERY
  SELECT DISTINCT c.*
  FROM "AIConversations" c
  LEFT JOIN "AIMessages" m
    ON m."conversationId" = c."conversationId"
  WHERE c."userId" = user_id_filter
    AND (
      TRIM(COALESCE(search_text, '')) = ''

      -- ========================
      -- 1️⃣ FTS
      -- ========================
      OR c.search_vector @@ plainto_tsquery('english', search_text)
      OR m.search_vector @@ plainto_tsquery('english', search_text)

      -- ========================
      -- 2️⃣ Trigram (fuzzy)
      -- ========================
      OR c.title % search_text
      OR m.content % search_text
      OR m."rephrasedContent" % search_text
      OR (m.metadata->>'formattedContent') % search_text

      -- ========================
      -- 3️⃣ ILIKE (hard fallback)
      -- ========================
      OR c.title ILIKE '%' || search_text || '%'
      OR m.content ILIKE '%' || search_text || '%'
      OR m."rephrasedContent" ILIKE '%' || search_text || '%'
      OR (m.metadata->>'formattedContent') ILIKE '%' || search_text || '%'
    )
  ORDER BY c."createdAt" DESC
  LIMIT result_limit;
END;
$$;


-- Function: Hybrid search conversations with cursor (pagination)
CREATE OR REPLACE FUNCTION search_conversations_fts_cursor(
  search_text text,
  user_id_filter uuid,
  cursor_time timestamptz,
  result_limit int DEFAULT 20
)
RETURNS SETOF "AIConversations"
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  PERFORM set_config('pg_trgm.similarity_threshold', '0.15', true);

  RETURN QUERY
  SELECT DISTINCT c.*
  FROM "AIConversations" c
  LEFT JOIN "AIMessages" m
    ON m."conversationId" = c."conversationId"
  WHERE c."userId" = user_id_filter
    AND c."createdAt" < cursor_time
    AND (
      TRIM(COALESCE(search_text, '')) = ''
      OR
      c.search_vector @@ plainto_tsquery('english', search_text)
      OR
      m.search_vector @@ plainto_tsquery('english', search_text)
      OR
      c.title % search_text
      OR
      m.content % search_text
      OR
      m."rephrasedContent" % search_text
      OR
      (m.metadata->>'formattedContent') % search_text
      OR
      c.title ILIKE '%' || search_text || '%'
      OR
      m.content ILIKE '%' || search_text || '%'
      OR
      m."rephrasedContent" ILIKE '%' || search_text || '%'
      OR
      (m.metadata->>'formattedContent') ILIKE '%' || search_text || '%'
    )
  ORDER BY c."createdAt" DESC
  LIMIT result_limit;
END;
$$;



-- ============================================
-- Verification Queries (Optional - Run to test)
-- ============================================

-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('AIConversations', 'AIMessages') 
  AND column_name = 'search_vector';

-- Check if indexes exist (FTS + Trigram)
SELECT indexname, tablename 
FROM pg_indexes 
WHERE indexname IN (
  'conversations_search_idx', 
  'messages_search_idx',
  'conversations_title_trgm_idx',
  'messages_content_trgm_idx',
  'messages_metadata_trgm_idx'
);

-- Check if pg_trgm extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';

-- Test Hybrid Search Scenarios:

-- Test 1: Full word match (should use FTS - fastest)
 SELECT * FROM search_conversations_fts('hpcl', '27f06b7b-9632-48f9-847f-7d068dabb09e'::uuid, 10);

-- Test 2: Partial word match (uses Trigram)
 SELECT * FROM search_conversations_fts('hp', '27f06b7b-9632-48f9-847f-7d068dabb09e'::uuid, 10);

-- Test 3: Typo match (uses Trigram fuzzy matching)
 SELECT * FROM search_conversations_fts('hpkl', '27f06b7b-9632-48f9-847f-7d068dabb09e'::uuid, 10);

-- Test 4: Substring in file name
 SELECT * FROM search_conversations_fts('report.pdf', '27f06b7b-9632-48f9-847f-7d068dabb09e'::uuid, 10);

-- Test 5: Empty search (returns all)
 SELECT * FROM search_conversations_fts('', '27f06b7b-9632-48f9-847f-7d068dabb09e'::uuid, 10);

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- DROP FUNCTION IF EXISTS search_conversations_fts(text, uuid, int);
-- DROP FUNCTION IF EXISTS search_conversations_fts_cursor(text, uuid, timestamptz, int);
-- DROP INDEX IF EXISTS conversations_title_trgm_idx;
-- DROP INDEX IF EXISTS messages_content_trgm_idx;
-- DROP INDEX IF EXISTS messages_rephrased_trgm_idx;
-- DROP INDEX IF EXISTS messages_metadata_trgm_idx;
-- DROP EXTENSION IF EXISTS pg_trgm;
-- DROP TRIGGER IF EXISTS conversations_search_update ON "AIConversations";
-- DROP TRIGGER IF EXISTS messages_search_update ON "AIMessages";
-- DROP FUNCTION IF EXISTS "AIConversations_search_vector_update"();
-- DROP FUNCTION IF EXISTS "AIMessages_search_vector_update"();
-- DROP INDEX IF EXISTS conversations_search_idx;
-- DROP INDEX IF EXISTS messages_search_idx;
-- ALTER TABLE "AIConversations" DROP COLUMN IF EXISTS search_vector;
-- ALTER TABLE "AIMessages" DROP COLUMN IF EXISTS search_vector;
