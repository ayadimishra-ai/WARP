alter table "public"."Question"
  add constraint "Question_parentQuestionId_fkey"
  foreign key ("parentQuestionId")
  references "public"."Question"
  ("id") on update restrict on delete restrict;
