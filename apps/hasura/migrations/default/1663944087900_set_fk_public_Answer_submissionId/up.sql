alter table "public"."Answer"
  add constraint "Answer_submissionId_fkey"
  foreign key ("submissionId")
  references "public"."FormSubmission"
  ("id") on update restrict on delete restrict;
