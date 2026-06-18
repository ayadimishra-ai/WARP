CREATE TABLE "public"."User" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "name" Text NOT NULL, "email" Text NOT NULL, "emailVerified" timestamptz, "phone" text, "phoneVerified" timestamptz, "image" text, "details" JSONB, "platformId" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("platformId") REFERENCES "public"."Platform"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."User" IS E'App user';
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
CREATE TRIGGER "set_public_User_updated_at"
BEFORE UPDATE ON "public"."User"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_User_updated_at" ON "public"."User" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
