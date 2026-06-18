CREATE TABLE "public"."FormSubmission" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "invitationId" UUID NOT NULL, "remarks" Text, "submittedBy" UUID NOT NULL, "approvedBy" UUID NOT NULL, "isActive" boolean NOT NULL DEFAULT true, PRIMARY KEY ("id") , FOREIGN KEY ("invitationId") REFERENCES "public"."FormInvitation"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("submittedBy") REFERENCES "public"."User"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("approvedBy") REFERENCES "public"."User"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."FormSubmission" IS E'Form submission';
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
CREATE TRIGGER "set_public_FormSubmission_updated_at"
BEFORE UPDATE ON "public"."FormSubmission"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_FormSubmission_updated_at" ON "public"."FormSubmission" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
