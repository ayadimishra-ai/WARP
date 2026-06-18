CREATE OR REPLACE FUNCTION fn_parse_platform_origin_to_jsonb(form_row public."Platform")
RETURNS JSONB AS $$
  SELECT to_json(coalesce(form_row.origin)) as json_origin
$$ LANGUAGE sql STABLE;
