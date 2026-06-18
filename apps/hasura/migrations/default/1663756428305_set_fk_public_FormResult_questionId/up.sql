alter table "public"."FormResult"
  add constraint "FormResult_questionId_fkey"
  foreign key ("questionId")
  references "public"."Question"
  ("id") on update restrict on delete restrict;
