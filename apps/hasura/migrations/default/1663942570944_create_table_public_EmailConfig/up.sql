CREATE TABLE "public"."EmailConfig" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "host" Text NOT NULL, "port" integer NOT NULL, "isSecure" boolean NOT NULL, "user" Text NOT NULL, "password" text NOT NULL, "platformId" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("platformId") REFERENCES "public"."Platform"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."EmailConfig" IS E'Platform Email Configuration';
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
CREATE TRIGGER "set_public_EmailConfig_updated_at"
BEFORE UPDATE ON "public"."EmailConfig"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_EmailConfig_updated_at" ON "public"."EmailConfig" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
