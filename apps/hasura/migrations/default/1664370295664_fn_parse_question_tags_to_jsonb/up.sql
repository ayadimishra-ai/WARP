CREATE OR REPLACE FUNCTION fn_parse_question_tags_to_jsonb(data public."Question")
RETURNS JSONB AS $$
  SELECT to_jsonb(coalesce(data.tags  ,'{}'))
$$ LANGUAGE sql STABLE;
