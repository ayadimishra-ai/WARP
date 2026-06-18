CREATE OR REPLACE FUNCTION fn_parse_form_tags_to_jsonb(form_row public."Form")
RETURNS JSONB AS $$
  SELECT to_json(coalesce(form_row.tags  ,'{}')) as json_tags
$$ LANGUAGE sql STABLE;
