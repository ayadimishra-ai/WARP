CREATE INDEX IF NOT EXISTS "idx_answer_question_submission" ON "public"."Answer" ("questionId", "submissionId");
CREATE INDEX IF NOT EXISTS "idx_interim_answer_question_submission" ON "public"."Interim_Answer" ("questionId", "submissionId");
