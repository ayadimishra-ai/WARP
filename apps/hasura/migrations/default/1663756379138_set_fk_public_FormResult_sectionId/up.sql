alter table "public"."FormResult"
  add constraint "FormResult_sectionId_fkey"
  foreign key ("sectionId")
  references "public"."Section"
  ("id") on update restrict on delete restrict;
