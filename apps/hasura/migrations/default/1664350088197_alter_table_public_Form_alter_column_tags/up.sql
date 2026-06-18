ALTER TABLE "public"."Form" ALTER COLUMN "tags" TYPE text[];
alter table "public"."Form" alter column "tags" drop not null;
