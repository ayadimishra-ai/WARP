-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE FUNCTION fn_parse_platform_origin_to_jsonb(form_row public."Platform")
-- RETURNS JSONB AS $$
--   SELECT to_json(form_row.origin) as json_origin
-- $$ LANGUAGE sql STABLE;
DROP FUNCTION IF EXISTS fn_parse_platform_origin_to_jsonb(form_row public."Platform")