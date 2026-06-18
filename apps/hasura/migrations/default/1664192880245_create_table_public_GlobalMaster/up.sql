CREATE TABLE "public"."GlobalMaster" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "platformId" UUID NOT NULL, "type" Text NOT NULL, "data" jsonb NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("platformId") REFERENCES "public"."Platform"("id") ON UPDATE restrict ON DELETE restrict);COMMENT ON TABLE "public"."GlobalMaster" IS E'Global Masters Data';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
