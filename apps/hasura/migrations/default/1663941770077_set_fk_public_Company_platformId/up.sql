alter table "public"."Company"
  add constraint "Company_platformId_fkey"
  foreign key ("platformId")
  references "public"."Platform"
  ("id") on update restrict on delete restrict;
