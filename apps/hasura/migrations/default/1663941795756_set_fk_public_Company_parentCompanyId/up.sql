alter table "public"."Company"
  add constraint "Company_parentCompanyId_fkey"
  foreign key ("parentCompanyId")
  references "public"."Company"
  ("id") on update restrict on delete restrict;
