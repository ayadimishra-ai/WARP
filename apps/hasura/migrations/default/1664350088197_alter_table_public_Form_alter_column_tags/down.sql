alter table "public"."Form" alter column "tags" set not null;
ALTER TABLE "public"."Form" ALTER COLUMN "tags" TYPE ARRAY;
