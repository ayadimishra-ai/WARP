alter table "public"."User"
  add constraint "User_compnayId_fkey"
  foreign key ("compnayId")
  references "public"."Company"
  ("id") on update restrict on delete restrict;
