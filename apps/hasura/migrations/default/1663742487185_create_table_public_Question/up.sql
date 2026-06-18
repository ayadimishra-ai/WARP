CREATE TABLE "public"."Question" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "key" text NOT NULL, "content" Text NOT NULL, "tags" Text[] NOT NULL, "weightage" Numeric(10,2) NOT NULL, "calc" jsonb, "sectionId" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."Question" IS E'Form questions';
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
CREATE TRIGGER "set_public_Question_updated_at"
BEFORE UPDATE ON "public"."Question"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_Question_updated_at" ON "public"."Question" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
