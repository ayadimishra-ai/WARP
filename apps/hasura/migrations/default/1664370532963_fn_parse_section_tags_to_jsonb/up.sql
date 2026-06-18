CREATE OR REPLACE FUNCTION fn_parse_section_tags_to_jsonb(data public."Section")
RETURNS JSONB AS $$
  SELECT to_jsonb(coalesce(data.tags  ,'{}'))
$$ LANGUAGE sql STABLE;
