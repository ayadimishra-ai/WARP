comment on column "public"."User"."platformId" is E'App user';
alter table "public"."User"
  add constraint "User_platformId_fkey"
  foreign key (platformId)
  references "public"."Platform"
  (id) on update restrict on delete restrict;
alter table "public"."User" alter column "platformId" drop not null;
alter table "public"."User" add column "platformId" uuid;
