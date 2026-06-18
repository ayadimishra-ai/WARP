CREATE TABLE "public"."FormInvitation" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "email" Text NOT NULL, "companyId" uuid, "formId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, PRIMARY KEY ("id") , FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."FormInvitation" IS E'Form invitation details';
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
CREATE TRIGGER "set_public_FormInvitation_updated_at"
BEFORE UPDATE ON "public"."FormInvitation"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_FormInvitation_updated_at" ON "public"."FormInvitation" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
