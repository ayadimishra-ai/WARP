CREATE TABLE "public"."FormResult" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "submissionId" UUID NOT NULL, "sectionId" UUID, "questionId" uuid, "score" Numeric(10,2) NOT NULL DEFAULT 0, PRIMARY KEY ("id") );COMMENT ON TABLE "public"."FormResult" IS E'Form submission result';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
