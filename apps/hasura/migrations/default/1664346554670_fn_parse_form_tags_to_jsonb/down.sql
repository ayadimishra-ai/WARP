-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE FUNCTION fn_parse_form_tags_to_jsonb(form_row public."Form")
-- RETURNS JSONB AS $$
--   SELECT to_json(form_row.tags)
-- $$ LANGUAGE sql STABLE;

DROP FUNCTION IF EXISTS fn_parse_form_tags_to_jsonb(form_row public."Form");