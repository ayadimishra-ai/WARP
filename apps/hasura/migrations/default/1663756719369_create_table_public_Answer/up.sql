CREATE TABLE "public"."Answer" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "questionId" uuid NOT NULL, "data" jsonb NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."Answer" IS E'Question answered';
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_Answer_updated_at"
BEFORE UPDATE ON "public"."Answer"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_Answer_updated_at" ON "public"."Answer" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
