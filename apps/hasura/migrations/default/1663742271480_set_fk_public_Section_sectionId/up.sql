alter table "public"."Section"
  add constraint "Section_sectionId_fkey"
  foreign key ("sectionId")
  references "public"."Section"
  ("id") on update restrict on delete restrict;
