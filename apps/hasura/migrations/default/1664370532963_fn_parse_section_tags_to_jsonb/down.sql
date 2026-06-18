-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE FUNCTION fn_parse_section_tags_to_jsonb(data public."Section")
-- RETURNS JSONB AS $$
--   SELECT to_jsonb(coalesce(data.tags  ,'{}'))
-- $$ LANGUAGE sql STABLE;

DROP FUNCTION IF EXISTS fn_parse_section_tags_to_jsonb(data public."Section");
