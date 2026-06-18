comment on column "public"."Platform"."origin" is E'Integration Platform';
alter table "public"."Platform" alter column "origin" drop not null;
alter table "public"."Platform" add column "origin" text;
