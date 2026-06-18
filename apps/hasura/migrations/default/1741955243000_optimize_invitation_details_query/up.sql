-- Core Table Indexes
CREATE INDEX IF NOT EXISTS "idx_form_invitation_form_id" ON "public"."FormInvitation" ("formId");
CREATE INDEX IF NOT EXISTS "idx_form_submission_invitation_id" ON "public"."FormSubmission" ("invitationId");
CREATE INDEX IF NOT EXISTS "idx_section_form_id" ON "public"."Section" ("formId");
CREATE INDEX IF NOT EXISTS "idx_question_section_id" ON "public"."Question" ("sectionId");
CREATE INDEX IF NOT EXISTS "idx_form_field_section_id" ON "public"."FormField" ("sectionId");
CREATE INDEX IF NOT EXISTS "idx_form_field_question_id" ON "public"."FormField" ("questionId");
CREATE INDEX IF NOT EXISTS "idx_form_field_form_id" ON "public"."FormField" ("formId");

-- Reviewer Details Mapping Indexes
CREATE INDEX IF NOT EXISTS "idx_reviewer_details_mapping_invitation_id" ON "public"."ReviewerDetailsMapping" ("FormInvitationId");
CREATE INDEX IF NOT EXISTS "idx_reviewer_details_mapping_question_id" ON "public"."ReviewerDetailsMapping" ("questionId");

-- Maker Checker Remarks Indexes
CREATE INDEX IF NOT EXISTS "idx_maker_checker_remarks_mapping_id" ON "public"."MakerCheckerRemarks" ("ReviewerDetailsMappingId");
