CREATE TABLE "public"."FormField" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "field" text NOT NULL, "type" Text NOT NULL, "fieldOptions" jsonb NOT NULL, "interface" Text NOT NULL, "interfaceOptions" jsonb, "display" jsonb, "displayOptions" jsonb, "displayRules" JSONB, "validationRules" jsonb, "seqIndex" integer NOT NULL, "groupField" text NOT NULL, "formId" uuid NOT NULL, "sectionId" uuid, "questionId" UUID, PRIMARY KEY ("id") , FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."FormField" IS E'Form UI fields';
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
CREATE TRIGGER "set_public_FormField_updated_at"
BEFORE UPDATE ON "public"."FormField"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_FormField_updated_at" ON "public"."FormField" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
