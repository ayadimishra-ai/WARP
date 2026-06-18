CREATE TABLE "public"."Section" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "key" text NOT NULL, "content" text NOT NULL, "tags" Text[] NOT NULL, "weightage" Numeric(10,2) NOT NULL, "calc" jsonb, "sectionId" uuid NOT NULL, "formId" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."Section" IS E'Form section';
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
CREATE TRIGGER "set_public_Section_updated_at"
BEFORE UPDATE ON "public"."Section"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_Section_updated_at" ON "public"."Section" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
