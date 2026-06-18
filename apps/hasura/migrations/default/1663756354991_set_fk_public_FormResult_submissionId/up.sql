alter table "public"."FormResult"
  add constraint "FormResult_submissionId_fkey"
  foreign key ("submissionId")
  references "public"."FormSubmission"
  ("id") on update restrict on delete restrict;
