# WARP File Index

Every non-trivial file listed with a one-line purpose statement. Files in `node_modules/`, `generated/`, `.next/`, and binary assets are excluded.

Paths are relative to the repository root (`/tmp/warp_live/uigw-snowkap_warp-911d40f4a302/`).

---

## Root Config

| File | Purpose |
|---|---|
| `package.json` | Monorepo root: workspace definitions, shared devDeps, Turborepo scripts, Yarn/Node engine constraints |
| `turbo.json` | Turborepo pipeline: task dependencies, output caching, global env var declarations |
| `Dockerfile` | Production Docker image: Node 20, installs all workspaces, builds `apps/web`, exposes port 3000 |
| `README.md` | Developer quick-start: script reference for dev, build, codegen, lint |
| `TURBO_README.md` | Boilerplate Turborepo starter documentation |
| `yarn.lock` | Yarn lockfile — all resolved dependency versions |
| `package-lock.json` | npm lockfile (present alongside yarn.lock — [QA] dual lockfiles suggest inconsistent usage) |

---

## Apps / hasura

| File | Purpose |
|---|---|
| `apps/hasura/package.json` | Hasura app package: scripts for `hasura console`, `hasura deploy`, `hasura migrate apply` |
| `apps/hasura/config.yaml` | Hasura CLI config: endpoint (production App Runner URL), metadata directory, action webhook base URL |
| `apps/hasura/docker-compose.yaml` | Local dev: PostgreSQL 12 + Hasura v2.10.0 with auto-applied migrations and metadata |
| `apps/hasura/README.md` | Hasura app documentation |

### Hasura Migrations

All files at `apps/hasura/migrations/default/<timestamp_name>/up.sql`:

| Migration | Purpose |
|---|---|
| `1663739678179_create_table_public_Platform/up.sql` | Creates Platform table; installs pgcrypto, set_current_timestamp_updated_at trigger function |
| `1663739903859_create_table_public_Role/up.sql` | Creates Role table (composite PK: id, name) |
| `1663739929536_alter_table_public_Role_add_unique_name/up.sql` | Adds unique constraint on Role.name |
| `1663740304697_create_table_public_User/up.sql` | Creates User table with platformId FK (later removed) |
| `1663740980689_create_table_public_Company/up.sql` | Creates Company table |
| `1663741146225_alter_table_public_User_alter_column_platformId/up.sql` | Makes User.platformId nullable |
| `1663741190565_alter_table_public_User_add_column_compnayId/up.sql` | Adds User.compnayId [QA: typo] nullable UUID column |
| `1663741237220_set_fk_public_User_compnayId/up.sql` | Adds FK User.compnayId → Company.id |
| `1663741346908_alter_table_public_User_alter_column_compnayId/up.sql` | Renames compnayId → companyId (FK constraint retains typo name) |
| `1663741609376_create_table_public_Form/up.sql` | Creates Form table |
| `1663742229707_create_table_public_Section/up.sql` | Creates Section table with self-referential sectionId |
| `1663742271480_set_fk_public_Section_sectionId/up.sql` | Adds FK Section.sectionId → Section.id (self-ref) |
| `1663742487185_create_table_public_Question/up.sql` | Creates Question table |
| `1663743207753_create_table_public_FormField/up.sql` | Creates FormField table (UI field definitions) |
| `1663743558195_create_table_public_FormInvitation/up.sql` | Creates FormInvitation table |
| `1663745125758_alter_table_public_FormInvitation_add_column_status/up.sql` | Adds FormInvitation.status text column |
| `1663745271905_create_table_public_FormSubmission/up.sql` | Creates FormSubmission table |
| `1663756305853_create_table_public_FormResult/up.sql` | Creates FormResult table (score storage) |
| `1663756354991_set_fk_public_FormResult_submissionId/up.sql` | FK FormResult.submissionId → FormSubmission.id |
| `1663756379138_set_fk_public_FormResult_sectionId/up.sql` | FK FormResult.sectionId → Section.id |
| `1663756428305_set_fk_public_FormResult_questionId/up.sql` | FK FormResult.questionId → Question.id |
| `1663756719369_create_table_public_Answer/up.sql` | Creates Answer table |
| `1663756888237_create_table_public_AnswerFile/up.sql` | Creates AnswerFile table (S3 file attachments) |
| `1663757772475_create_table_public_EmailTemplate/up.sql` | Creates EmailTemplate table |
| `1663857665964_create_table_public_UserRole/up.sql` | Creates UserRole junction table |
| `1663857830360_alter_table_public_UserRole_alter_column_Role/up.sql` | Renames UserRole.Role → UserRole.RoleName |
| `1663941706160_alter_table_public_Company_add_column_parentCompanyId/up.sql` | Adds Company.parentCompanyId for hierarchical companies |
| `1663941727338_alter_table_public_Company_add_column_platformId/up.sql` | Adds Company.platformId |
| `1663941770077_set_fk_public_Company_platformId/up.sql` | FK Company.platformId → Platform.id |
| `1663941795756_set_fk_public_Company_parentCompanyId/up.sql` | FK Company.parentCompanyId → Company.id (self-ref) |
| `1663941983723_alter_table_public_User_drop_column_platformId/up.sql` | Removes User.platformId (platform tenancy moved to Company) |
| `1663942185692_alter_table_public_Platform_add_column_expiry/up.sql` | Adds Platform.expiry for license management |
| `1663942269652_alter_table_public_EmailTemplate_add_column_subject/up.sql` | Adds EmailTemplate.subject |
| `1663942293332_alter_table_public_EmailTemplate_add_column_ccEmails/up.sql` | Adds EmailTemplate.ccEmails text[] |
| `1663942570944_create_table_public_EmailConfig/up.sql` | Creates EmailConfig table (immediately renamed) |
| `1663942604348_rename_table_public_EmailConfig/up.sql` | Renames EmailConfig → EmailConfiguration |
| `1663943937165_alter_table_public_UserRole_alter_column_RoleName/up.sql` | Renames UserRole.RoleName → UserRole.roleName (final name) |
| `1663944025747_alter_table_public_Answer_add_column_submissionId/up.sql` | Adds Answer.submissionId to link answers to submissions |
| `1663944087900_set_fk_public_Answer_submissionId/up.sql` | FK Answer.submissionId → FormSubmission.id |
| `1664176531300_alter_table_public_Company_add_column_created_by/up.sql` | Adds Company.created_by audit column |
| `1664176550337_alter_table_public_Company_add_column_updated_by/up.sql` | Adds Company.updated_by audit column |
| `1664176636192_alter_table_public_User_add_column_created_by/up.sql` | Adds User.created_by |
| `1664176657616_alter_table_public_User_add_column_updated_by/up.sql` | Adds User.updated_by |
| `1664176730705_alter_table_public_Answer_add_column_created_by/up.sql` | Adds Answer.created_by |
| `1664176745416_alter_table_public_Answer_add_column_updated_by/up.sql` | Adds Answer.updated_by |
| `1664177309581_alter_table_public_FormInvitation_add_column_created_by/up.sql` | Adds FormInvitation.created_by |
| `1664177323007_alter_table_public_FormInvitation_add_column_updated_by/up.sql` | Adds FormInvitation.updated_by |
| `1664180634687_create_table_public_CompanyForm/up.sql` | Creates CompanyForm join table (Company ↔ Form many-to-many) |
| `1664184822502_alter_table_public_Company_add_column_country/up.sql` | Adds Company.country |
| `1664186779277_alter_table_public_Company_add_column_isActive/up.sql` | Adds Company.isActive boolean |
| `1664188233834_alter_table_public_User_add_column_isActive/up.sql` | Adds User.isActive boolean |
| `1664192880245_create_table_public_GlobalMaster/up.sql` | Creates GlobalMaster table (platform config blobs) |
| `1664206165422_alter_table_public_EmailConfiguration_add_column_fromEmail/up.sql` | Adds EmailConfiguration.fromEmail |
| `1664206246782_alter_table_public_EmailConfiguration_alter_column_fromEmail/up.sql` | Makes EmailConfiguration.fromEmail NOT NULL |
| `1664264620561_alter_table_public_Platform_drop_column_origin/up.sql` | Drops Platform.origin (scalar) |
| `1664264640706_alter_table_public_Platform_add_column_origin/up.sql` | Re-adds Platform.origin as text[] (array of allowed origins) |
| `1664284310860_alter_table_public_User_add_unique_email/up.sql` | Adds unique constraint on User.email |
| `1664346554670_fn_parse_form_tags_to_jsonb/up.sql` | Creates fn_parse_form_tags_to_jsonb computed field function |
| `1664347865797_fn_parse_platform_origin_to_jsonb/up.sql` | Creates fn_parse_platform_origin_to_jsonb function |
| `1664350088197_alter_table_public_Form_alter_column_tags/up.sql` | Changes Form.tags from NOT NULL to nullable |
| `1664368828308_alter_table_public_FormInvitation_add_column_durationFrom/up.sql` | Adds FormInvitation.durationFrom date |
| `1664368845803_alter_table_public_FormInvitation_add_column_durationTo/up.sql` | Adds FormInvitation.durationTo date |
| `1664370295664_fn_parse_question_tags_to_jsonb/up.sql` | Creates fn_parse_question_tags_to_jsonb function |
| `1664370532963_fn_parse_section_tags_to_jsonb/up.sql` | Creates fn_parse_section_tags_to_jsonb function |
| `1664374822481_alter_table_public_FormSubmission_alter_column_submittedBy/up.sql` | Makes FormSubmission.submittedBy nullable |
| `1664374837267_alter_table_public_FormSubmission_alter_column_approvedBy/up.sql` | Makes FormSubmission.approvedBy nullable |
| `1664456698177_create_table_public_FormDetails/up.sql` | Creates FormDetails one-to-one extension of Form |
| `1665026897880_alter_table_public_Form_add_column_calc/up.sql` | Adds Form.calc JSON for form-level scoring formula |
| `1665026986182_alter_table_public_Question_add_column_parentQuestionId/up.sql` | Adds Question.parentQuestionId for nested questions |
| `1665027217341_set_fk_public_Question_parentQuestionId/up.sql` | FK Question.parentQuestionId → Question.id |
| `1665633644054_alter_table_public_Answer_add_column_status/up.sql` | Adds Answer.status with default 'draft' |
| `1669625513767_alter_table_public_FormResult_alter_column_recommendation/up.sql` | Renames FormResult.recommendation → recommendations [QA: column not in original CREATE] |
| `1669824103603_alter_table_public_FormField_add_column_tags/up.sql` | Adds FormField.tags jsonb |
| `1675430176768_insert_into_public_GlobalMaster/up.sql` | Seeds SendSuccessEmailOnSubmissionFormList config for a specific platform |
| `1741883117000_optimize_answer_query/up.sql` | Adds composite indexes on Answer and Interim_Answer (questionId, submissionId) |
| `1741955243000_optimize_invitation_details_query/up.sql` | Adds 10 performance indexes across FormInvitation, FormSubmission, Section, Question, FormField, ReviewerDetailsMapping, MakerCheckerRemarks |
| `chat_search_migration.sql` | [Not in numbered sequence] Adds FTS + trigram search to AIConversations and AIMessages tables; creates search_conversations_fts() and search_conversations_fts_cursor() functions |

### Hasura Metadata

| File | Purpose |
|---|---|
| `apps/hasura/metadata/actions.graphql` | Hasura Action GraphQL definitions (empty) |
| `apps/hasura/metadata/actions.yaml` | Hasura Actions config (empty — no actions defined) |
| `apps/hasura/metadata/allow_list.yaml` | GraphQL operation allow list |
| `apps/hasura/metadata/api_limits.yaml` | API rate/depth limits |
| `apps/hasura/metadata/cron_triggers.yaml` | Hasura cron triggers (empty) |
| `apps/hasura/metadata/graphql_schema_introspection.yaml` | Introspection access control |
| `apps/hasura/metadata/inherited_roles.yaml` | Role inheritance definitions |
| `apps/hasura/metadata/network.yaml` | Network/TLS configuration |
| `apps/hasura/metadata/query_collections.yaml` | Named GraphQL query collections |
| `apps/hasura/metadata/remote_schemas.yaml` | Remote schema stitching config (empty) |
| `apps/hasura/metadata/rest_endpoints.yaml` | REST endpoint wrappers (empty) |
| `apps/hasura/metadata/version.yaml` | Metadata format version (3) |
| `apps/hasura/metadata/databases/databases.yaml` | Database connection configuration |
| `apps/hasura/metadata/databases/default/tables/tables.yaml` | List of tracked tables |
| `apps/hasura/metadata/databases/default/tables/public_Answer.yaml` | Answer table: relationships, permissions per role (Approver/Invitee can update their answers) |
| `apps/hasura/metadata/databases/default/tables/public_AnswerFile.yaml` | AnswerFile table: relationships |
| `apps/hasura/metadata/databases/default/tables/public_Company.yaml` | Company table: relationships, permissions, ManageCompany event trigger to AI webhook |
| `apps/hasura/metadata/databases/default/tables/public_CompanyForm.yaml` | CompanyForm table: relationships |
| `apps/hasura/metadata/databases/default/tables/public_EmailConfig.yaml` | EmailConfig table (old name): relationships [QA: duplicate of EmailConfiguration] |
| `apps/hasura/metadata/databases/default/tables/public_EmailConfiguration.yaml` | EmailConfiguration table: relationships |
| `apps/hasura/metadata/databases/default/tables/public_EmailTemplate.yaml` | EmailTemplate table: relationships |
| `apps/hasura/metadata/databases/default/tables/public_Form.yaml` | Form table: relationships, computed json_tags field, role permissions, Creator can insert/update |
| `apps/hasura/metadata/databases/default/tables/public_FormDetails.yaml` | FormDetails table: relationships, Creator can insert/update |
| `apps/hasura/metadata/databases/default/tables/public_FormField.yaml` | FormField table: relationships, Creator can insert/update fields |
| `apps/hasura/metadata/databases/default/tables/public_FormInvitation.yaml` | FormInvitation table: relationships, Inviter can create invitations for child companies |
| `apps/hasura/metadata/databases/default/tables/public_FormResult.yaml` | FormResult table: select-only for all roles (writes via admin SDK) |
| `apps/hasura/metadata/databases/default/tables/public_FormSubmission.yaml` | FormSubmission table: Invitee and Approver can insert/update submissions |
| `apps/hasura/metadata/databases/default/tables/public_GlobalMaster.yaml` | GlobalMaster table: select-only for all roles, platform-scoped |
| `apps/hasura/metadata/databases/default/tables/public_GroupForm.yaml` | GroupForm table: relationships only |
| `apps/hasura/metadata/databases/default/tables/public_Platform.yaml` | Platform table: computed json_origin, Platform role can update, limit 5 rows for non-Platform roles |
| `apps/hasura/metadata/databases/default/tables/public_Question.yaml` | Question table: relationships, computed json_tags |
| `apps/hasura/metadata/databases/default/tables/public_Role.yaml` | Role table: relationships |
| `apps/hasura/metadata/databases/default/tables/public_Section.yaml` | Section table: relationships, computed json_tags, hierarchical self-ref |
| `apps/hasura/metadata/databases/default/tables/public_User.yaml` | User table: relationships, ManageUser event triggers (Insert/Update/Delete) to AI webhook |
| `apps/hasura/metadata/databases/default/tables/public_UserRole.yaml` | UserRole table: all roles can select own rows only |

---

## Apps / web

### Root config

| File | Purpose |
|---|---|
| `apps/web/package.json` | Web app dependencies: Next.js 14, Mantine 5, Apollo Client, NextAuth, TanStack Table, all @warp/* packages |
| `apps/web/next.config.js` | Transpiles @warp/* packages, enables instrumentation hook, disables fs for browser |
| `apps/web/tsconfig.json` | TypeScript config extending tsconfig/nextjs.json |
| `apps/web/serverless.yml` | AWS Lambda/API Gateway deployment configuration |
| `apps/web/instrumentation.ts` | Next.js instrumentation hook: loads AWS Secrets Manager secrets at server boot before any request |
| `apps/web/next-env.d.ts` | Next.js TypeScript declarations (auto-generated) |
| `apps/web/README.md` | Web app README |

### Pages

| File | Route | Purpose |
|---|---|---|
| `apps/web/pages/_app.tsx` | — | App wrapper: Mantine provider, Apollo Client, NextAuth session |
| `apps/web/pages/_document.tsx` | — | Custom Document for Mantine SSR emotion extraction |
| `apps/web/pages/index.tsx` | `/` | Home page placeholder |
| `apps/web/pages/assesment.tsx` | `/assesment` | Assessment list page [QA: typo in filename] |
| `apps/web/pages/questionnaires.tsx` | `/questionnaires` | Questionnaire listing |
| `apps/web/pages/document-repository.tsx` | `/document-repository` | Document repository page |
| `apps/web/pages/pdf.tsx` | `/pdf` | PDF preview/generation page |
| `apps/web/pages/test.tsx` | `/test` | Ad-hoc test/debug page |
| `apps/web/pages/assessment/listing.tsx` | `/assessment/listing` | Assessment listing with status management |
| `apps/web/pages/form/listing.tsx` | `/form/listing` | Form listing |
| `apps/web/pages/form/[formId]/intro.tsx` | `/form/[formId]/intro` | Form introduction page |
| `apps/web/pages/form/[formId]/start.tsx` | `/form/[formId]/start` | Main form-filling UI |
| `apps/web/pages/form/[formId]/list.tsx` | `/form/[formId]/list` | Form field list view |
| `apps/web/pages/form/[formId]/_index.tsx` | redirect | Form index redirect |
| `apps/web/pages/form/[formId]/ajv-test.tsx` | `/form/[formId]/ajv-test` | AJV JSON schema validation test page |

### API Routes

| File | Method | Purpose |
|---|---|---|
| `apps/web/pages/api/auth/[...nextauth].ts` | NextAuth | Email/password login, JWT session management |
| `apps/web/pages/api/jwt.ts` | GET/POST | JWT utility endpoint |
| `apps/web/pages/api/hello.ts` | GET | Health-check placeholder |
| `apps/web/pages/api/saveAnswers/index.ts` | POST | Upsert form answers (delegates to server/services/save-Answers) |
| `apps/web/pages/api/submit-form.ts` | POST | Mark FormSubmission as Submitted |
| `apps/web/pages/api/calculate-score/index.ts` | POST | Score calculation: evaluates JSONata formulas per section/question, writes FormResult, generates Interim_Recommendations |
| `apps/web/pages/api/calculate-score/form-submission-email.ts` | POST | Send submission confirmation email after scoring |
| `apps/web/pages/api/calculate-score/reviewer-form-submission-email.ts` | POST | Send reviewer-specific email after scoring |
| `apps/web/pages/api/progress-report-score.ts` | POST | Progress report scoring: writes InterimFormLogs |
| `apps/web/pages/api/interiam/index.ts` | POST | Interim answer operations for re-opened submissions |
| `apps/web/pages/api/carry-forward-assessment-data/index.ts` | POST | Copy all answers from previous submission |
| `apps/web/pages/api/carry-forward-assessment-data-userwise/index.ts` | POST | User-scoped answer carry-forward |
| `apps/web/pages/api/carry-forward-suggestions.ts` | POST | Carry forward answers as AI suggestions |
| `apps/web/pages/api/v1/internal/post-form-submission.ts` | POST | Post-submission processing orchestrator: scores + progress report + error logging to S3 |
| `apps/web/pages/api/v1/platform/auth/signin.ts` | POST | Platform sign-in: validates credentials, builds Hasura JWT with company/platform/role/AI claims |
| `apps/web/pages/api/v1/platform/user/index.ts` | POST/PUT | Create or update user |
| `apps/web/pages/api/v1/platform/user/[userId].ts` | GET/PUT/DELETE | User CRUD by ID |
| `apps/web/pages/api/v1/platform/user/UpdateResetPasswordFlag.ts` | POST | Set must-reset-password flag |
| `apps/web/pages/api/v1/platform/company/index.ts` | POST/PUT | Create or update company (encrypts contact email) |
| `apps/web/pages/api/v1/platform/company/[companyId].ts` | GET/PUT/DELETE | Company CRUD by ID |
| `apps/web/pages/api/v1/platform/company/bulk.ts` | POST | Bulk company/user creation |
| `apps/web/pages/api/v1/platform/company/send-invitation.ts` | POST | Create and send FormInvitation |
| `apps/web/pages/api/v1/platform/company/addresses/save-address.ts` | POST | Save company address |
| `apps/web/pages/api/v1/platform/company/addresses/update-address.ts` | PUT | Update company address |
| `apps/web/pages/api/v1/platform/company/addresses/delete-address.ts` | DELETE | Delete company address |
| `apps/web/pages/api/v1/platform/emailsubscribed/index.ts` | GET/POST | Email subscription status management |
| `apps/web/pages/api/v1/ops/check-company-eligibility.ts` | GET | Check if company exists in OPs GHG calculator (calls NEXT_PUBLIC_PRO_API_URL) |
| `apps/web/pages/api/awss3/upload.ts` | POST | Multipart file upload to S3 (Busboy streaming) |
| `apps/web/pages/api/awss3/download.ts` | GET | Download file from S3 |
| `apps/web/pages/api/awss3/get-upload-url.ts` | GET | Pre-signed S3 upload URL |
| `apps/web/pages/api/awss3/get-download-url.ts` | GET | Pre-signed S3 download URL |
| `apps/web/pages/api/awss3/move-file.ts` | POST | Move/copy file within S3 |
| `apps/web/pages/api/upload-carry-forward-pdf.ts` | POST | Upload a carry-forward PDF to S3 |
| `apps/web/pages/api/email-invitation.ts` | POST | Send form invitation email |
| `apps/web/pages/api/khaitan-email-invitation.ts` | POST | Client-specific (Khaitan) invitation email variant |
| `apps/web/pages/api/Reviewer-email-invitation.ts` | POST | Send reviewer invitation email |
| `apps/web/pages/api/assigned-question-bulk-email-invitation.ts` | POST | Bulk email for question assignments |
| `apps/web/pages/api/answer-on-assigned-question-bulk-email.ts` | POST | Bulk email for answered questions |
| `apps/web/pages/api/question-assign-email-invitation.ts` | POST | Email when question is assigned |
| `apps/web/pages/api/question-response-email-invitation.ts` | POST | Email when question is answered |
| `apps/web/pages/api/comments-on-question-bulk-email.ts` | POST | Bulk email for question comments |
| `apps/web/pages/api/commentsubmission-email.ts` | POST | Email on comment submission |
| `apps/web/pages/api/commentsubmissionuser2-email.ts` | POST | Email to secondary user on comment |
| `apps/web/pages/api/assessmentapproved-email1.ts` | POST | Email when assessment is approved |
| `apps/web/pages/api/assessmentreopen-email.ts` | POST | Email when assessment is re-opened |
| `apps/web/pages/api/reviewer-aaproved-email.ts` | POST | Email when reviewer approves [QA: typo "aaproved"] |
| `apps/web/pages/api/reviewer-declined-email.ts` | POST | Email when reviewer declines |
| `apps/web/pages/api/reviewer-resubmit-email.ts` | POST | Email when reviewer requests resubmission |
| `apps/web/pages/api/reviewer-pending-emails-cron.ts` | GET | Cron: sends bulk reminder emails for pending reviewer actions |
| `apps/web/pages/api/new-user-created-email.ts` | POST | Welcome email to new user |
| `apps/web/pages/api/sending-email-from-db.ts` | POST | Generic send-by-template-type endpoint |
| `apps/web/pages/api/get-company-by-name-and-primary-contact.ts` | POST | Look up company by name and contact |
| `apps/web/pages/api/get-invited-assessmentlist-by-companyId.ts` | GET | Get assessments a company is invited to |
| `apps/web/pages/api/recommendation/email-on-manually-raising-the-recommendations.ts` | POST | Email when recommendation is manually raised |
| `apps/web/pages/api/recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee.ts` | POST | Email when action is taken on recommendation |
| `apps/web/pages/api/recommendation/email-when-the-actions-taken-on-the-recommendations-are-approved.ts` | POST | Email when recommendation action is approved |
| `apps/web/pages/api/recommendation/email-when-a-recommendation-is-reopened.ts` | POST | Email when recommendation is re-opened |
| `apps/web/pages/api/recommendation/reminder/recommendation-reminder-pre-duedate.ts` | GET/POST | Pre-due-date reminder emails for recommendations |
| `apps/web/pages/api/recommendation/reminder/recommendation-reminder-post-duedate.ts` | GET/POST | Post-due-date reminder emails for recommendations |
| `apps/web/pages/api/AI/AIprocessing.ts` | POST | Trigger AI document processing job |
| `apps/web/pages/api/AI/AI-dataStats-calculation.ts` | POST | Calculate AI data-fill statistics |
| `apps/web/pages/api/AI/AI-rara-document-validation.ts` | POST | Trigger RARA document validation |
| `apps/web/pages/api/AI/ai-processing-completed.ts` | POST | Callback: AI processing complete notification handler |
| `apps/web/pages/api/AI/document-processing-completed.ts` | POST | Callback: document processing complete |
| `apps/web/pages/api/AI/generate-background-report.ts` | POST | Generate AI background report |
| `apps/web/pages/api/AI/suggestion-answer-entry.ts` | POST | Write AI suggestion as form answer |
| `apps/web/pages/api/AI/suggestion-cleanup.ts` | POST | Remove stale AI suggestions |
| `apps/web/pages/api/AI/update-form-invitation.ts` | POST | Update form invitation AI metadata |
| `apps/web/pages/api/AI/update-invitation-and-skipped-status.ts` | POST | Update AI curation skipped status |
| `apps/web/pages/api/AI/update-invitation-web-curation-ai-bulk-processing.ts` | POST | Update web curation + bulk processing status |
| `apps/web/pages/api/AI/web-curation-for-processing.ts` | POST | Trigger web curation processing job |
| `apps/web/pages/api/AI/get-chat-subscription-status.ts` | GET | Get AI chat subscription status |
| `apps/web/pages/api/AI/ai-chat-subscription-notification.ts` | POST | Send AI chat subscription notification |
| `apps/web/pages/api/AI/get-formInvitation-detail.ts` | GET | Get invitation details for AI context |
| `apps/web/pages/api/AI/get-invitation-isdata-curation-skipped-status..ts` | GET | Check if AI curation is skipped [QA: double dot in filename] |
| `apps/web/pages/api/AI/calculate-completion-percentage.ts` | POST | Calculate % of AI-filled form fields |
| `apps/web/pages/api/AI/migrate-existing-invitations-stats.ts` | POST | One-off migration for AI stats |
| `apps/web/pages/api/AI/email-invitation.ts` | POST | Send AI-context invitation email |
| `apps/web/pages/api/rara/document-validation.ts` | POST | Validate document via RARA API |
| `apps/web/pages/api/rara/document-validation-comprehensive.ts` | POST | Comprehensive RARA validation |
| `apps/web/pages/api/rara/document-rating.ts` | POST | Rate document via RARA API |
| `apps/web/pages/api/rara/document-rating-single.ts` | POST | Rate single document |
| `apps/web/pages/api/rara/document-rating-direct.ts` | POST | Direct RARA rating |
| `apps/web/pages/api/webhooks/document-expiry-notifications.ts` | POST | Webhook: sends document expiry reminder emails (validates secret header) |
| `apps/web/pages/api/test/secrets-check.ts` | GET | Test that secrets are loaded correctly |
| `apps/web/pages/api/test-logs/index.ts` | POST | Test log upload endpoint |

---

## Packages / @warp/shared

| File | Purpose |
|---|---|
| `packages/shared/index.ts` | Package entry point |
| `packages/shared/constants/app.constants.ts` | All app-level constants: roles, status enums, platform config types, AI types, document status, form types |
| `packages/shared/constants/form-submission.constants.ts` | FormSubmissionStatus enum values |
| `packages/shared/constants/ai.constants.ts` | AI-specific constants |
| `packages/shared/constants/api.constants.ts` | API-related constants |
| `packages/shared/constants/status.ts` | Additional status constants |
| `packages/shared/types/auth.types.ts` | AuthSessionType (company, platform, user, accessToken) |
| `packages/shared/types/ai.types.ts` | AI-related TypeScript types |
| `packages/shared/utils/auth-session.util.ts` | parseHasuraClaims(), buildHasuraClaims(), getLocalStorageSession() |
| `packages/shared/utils/custom-error.util.ts` | CustomError() for structured API error responses |
| `packages/shared/utils/date.util.ts` | dayjs date formatting helpers |
| `packages/shared/utils/logger.util.ts` | Structured logging utility |
| `packages/shared/utils/number.utl.ts` | Number formatting [QA: typo in filename "utl"] |
| `packages/shared/utils/jwt-ai.util.ts` | AI JWT plan constants (PLAN_OPS_TO_IQ_CURATION) |
| `packages/shared/utils/dom-purifier/dom-purify.client.util.ts` | DOMPurify HTML sanitization wrapper |
| `packages/shared/utils/excel-form-fields-processor.ts` | Process FormField data for Excel export |
| `packages/shared/utils/excel-form-fields-processor_new.ts` | Newer variant of form fields Excel processor |
| `packages/shared/utils/excel-questions-processor.ts` | Process Question data for Excel export |
| `packages/shared/utils/excel-sections-processor.ts` | Process Section data for Excel export |
| `packages/shared/utils/form-field/index.ts` | Form field utility functions |
| `packages/shared/utils/form-field/constants.ts` | Form field constants |
| `packages/shared/utils/form-field/types.ts` | Form field TypeScript types |
| `packages/shared/utils/index.ts` | Utility barrel export |
| `packages/shared/validation/company.validation.ts` | Yup company validation schema |
| `packages/shared/validation/user.validation.ts` | Yup user validation schema |
| `packages/shared/validation/create-company.schema.ts` | Create company request Yup schema |
| `packages/shared/validation/create-user.schema.ts` | Create user request Yup schema |
| `packages/shared/validation/bulk-insert-company-with-users.schema.ts` | Bulk company+user insert Yup schema |
| `packages/shared/validation/invitation-new-company.schema.ts` | New company invitation Yup schema |
| `packages/shared/validation/invitation-new-user.schema.ts` | New user invitation Yup schema |
| `packages/shared/validation/select-create-user-validation.schema.ts` | Select/create user validation schema |
| `packages/shared/validation/send-invitation-select-existing-company.schema.ts` | Send invitation to existing company schema |
| `packages/shared/validation/send-invitation-select-existing-user.schema.ts` | Send invitation to existing user schema |
| `packages/shared/validation/api-get-s3-upload-url.schema.ts` | S3 upload URL request schema |

## Packages / @warp/configs

| File | Purpose |
|---|---|
| `packages/configs/index.ts` | Barrel export |
| `packages/configs/api.config.ts` | getGraphqlApiUrl(), getAppApiUrl() — reads NEXT_PUBLIC_* env vars [QA: console.log on every call] |
| `packages/configs/graphql.config.ts` | getHasuraAdminSecret() — reads HASURA_GRAPHQL_ADMIN_SECRET |
| `packages/configs/email.config.ts` | Email SMTP config env var readers |
| `packages/configs/nextauth.config.ts` | NextAuth secret accessor |
| `packages/configs/s3bucket.config.ts` | S3 bucket config env var readers |

## Packages / @warp/graphql

| File | Purpose |
|---|---|
| `packages/graphql/index.ts` | Package entry point |
| `packages/graphql/codegen.js` | graphql-code-generator config: introspects Hasura schema, generates types + React Apollo hooks + generic SDK |
| `packages/graphql/generated/types.ts` | All GraphQL types, input objects, enums (auto-generated) |
| `packages/graphql/generated/server.ts` | graphql-request SDK for server-side use with admin secret |
| `packages/graphql/generated/sdk.ts` | Apollo Client hooks for client-side React component use |
| `packages/graphql/generated/apollo-helpers.ts` | Apollo cache field policies helpers |
| `packages/graphql/queries/` | 181 `.gql` files — all GraphQL query operations |
| `packages/graphql/mutations/` | 112 `.gql` files — all GraphQL mutation operations |
| `packages/graphql/subscriptions/` | GraphQL subscription operations |
| `packages/graphql/provider/` | Apollo Client provider configuration |

## Packages / @warp/server

| File | Purpose |
|---|---|
| `packages/server/index.ts` | Package entry point |
| `packages/server/guards/api-error.guard.ts` | ApiErrorGuard HOF: wraps handler with try/catch, returns structured JSON error |
| `packages/server/guards/api-method.guard.ts` | ApiMethodGuard HOF: enforces HTTP method, returns 405 if wrong |
| `packages/server/guards/api-hasura-webhook-guard.ts` | Validates Hasura event trigger webhook requests |
| `packages/server/guards/embedded-auth-guard.ts` | Auth guard for embedded form views |
| `packages/server/libs/next-auth.ts` | NextAuth helper for server-side session access |
| `packages/server/services/aws-s3.service.ts` | upload(), uploadError(), download(), getUploadUrl(), getDownloadUrl(), moveFile() — all S3 operations |
| `packages/server/services/notification.service.ts` | sendEmail(), sendEmailFromTemplate() — Nodemailer SMTP email sending |
| `packages/server/services/company.service.ts` | createCompany(), updateCompany() — company persistence via Hasura SDK |
| `packages/server/services/user.service.ts` | createUser(), updateUser() — user persistence |
| `packages/server/services/invitation.service.ts` | Invitation creation and management service |
| `packages/server/services/invited-assessment-list.services.ts` | Get invited assessment list for a company |
| `packages/server/services/platform-sync.service.ts` | Platform data synchronization |
| `packages/server/services/addresses.service.ts` | Company address CRUD |
| `packages/server/services/isemailsubscribed.service.ts` | Email subscription status check |
| `packages/server/services/document-expiry-notification.service.ts` | Find expiring documents and send reminder emails |
| `packages/server/services/ai-chat-subscription-notification.service.ts` | AI chat subscription notification emails |
| `packages/server/services/ai-report.service.ts` | AI report generation service |
| `packages/server/services/carry-forward-suggestions.service.ts` | Carry forward AI suggestions from previous submission |
| `packages/server/services/save-Answers/saveAnswers.ts` | Core answer persistence: upsert answers, handle interim answers for re-opened submissions, carry-forward-as-suggestions detection |
| `packages/server/services/calculate-score/calculate-score.service.ts` | Score calculation service logic |
| `packages/server/services/carry-forward-assessment-data/carry-forward.service.ts` | Copy answers from previous submission |
| `packages/server/services/carry-forward-assessment-data/carry-forward-user-wise.service.ts` | User-scoped answer carry-forward |
| `packages/server/services/AI/AI-dataStats-calculation.ts` | AI data statistics calculation |
| `packages/server/services/AI/AI-rara-document-validation.ts` | RARA document validation service |
| `packages/server/services/AI/ai-processing-completed/index.ts` | AI processing completion handler entry |
| `packages/server/services/AI/ai-processing-completed/post-pipeline.ts` | Post-processing pipeline steps |
| `packages/server/services/AI/ai-processing-completed/processors.ts` | Individual processing step processors |
| `packages/server/services/AI/calculate-completion-percentage.ts` | AI form fill completion percentage calculation |
| `packages/server/services/AI/document-processing-completed.ts` | Document processing completion handler |
| `packages/server/services/AI/suggesstion-answer-entry.ts` | Write AI suggestion as answer [QA: typo "suggesstion"] |
| `packages/server/services/AI/suggestion-cleanup.ts` | Remove stale AI suggestions |
| `packages/server/services/AI/web-curation-for-processing.ts` | Web curation job trigger |
| `packages/server/util/display-rules.util.ts` | Evaluate FormField.displayRules (conditional field visibility) |
| `packages/server/util/email.util.ts` | Email composition utilities |

## Packages / @warp/client (representative selection)

| File | Purpose |
|---|---|
| `packages/client/index.ts` | Package entry point |
| `packages/client/layouts/MainLayout.tsx` | Primary app shell with navigation sidebar |
| `packages/client/types/page-types.ts` | NextPageType: Next.js page type with getLayout and title |
| `packages/client/libs/progressive-delay-rate-limit.ts` | withEmailOrIpRateLimitWithProgressiveDelay HOF for rate limiting |
| `packages/client/components/MonthYearPicker.tsx` | Month/year date picker |
| `packages/client/components/MonthYearRangePicker.tsx` | Month/year range date picker |
| `packages/client/components/PaginationFooter.tsx` | Table pagination footer |
| `packages/client/components/SortIcons.tsx` | Table sort direction icons |
| `packages/client/components/TooltipUtils.tsx` | Tooltip helper components |
| `packages/client/components/app/AppHeader.tsx` | Application header component |
| `packages/client/components/app/AppSidebar.tsx` | Application sidebar navigation |
| `packages/client/components/charts/ProgressReportChart.tsx` | amCharts 5 progress report chart |
| `packages/client/components/form/field-interface/Input.tsx` | Text input FormField renderer |
| `packages/client/components/form/field-interface/File.tsx` | File upload FormField renderer |
| `packages/client/components/form/field-interface/DateTime.tsx` | Date/time FormField renderer |
| `packages/client/components/form/field-interface/Badges.tsx` | Badge/tag display FormField renderer |
| `packages/client/components/form/field-interface/GroupAccordian.tsx` | Accordion group FormField renderer [QA: typo "Accordian"] |
| `packages/client/components/form/field-interface/CommonTable.tsx` | Table FormField renderer |
| `packages/client/components/form/field-interface/GroupRaw.tsx` | Raw group FormField renderer |
| `packages/client/components/form/field-interface/GroupWizard.tsx` | Wizard-style group FormField renderer |
| `packages/client/hooks/encryption-decryption.ts` | Client-side encrypt/decrypt utility (for email field encryption) |
| `packages/client/features/form/` | Form rendering engine feature module |
| `packages/client/features/assessment/` | Assessment management UI feature |
| `packages/client/features/invitation/` | Invitation management UI feature |
| `packages/client/features/questionnaire/` | Questionnaire builder feature |
| `packages/client/features/recommendation/` | Recommendation display and management feature |
| `packages/client/features/document-repository/` | Document repository v1 feature |
| `packages/client/features/document-repository-v2/` | Document repository v2 feature |
| `packages/client/features/settings/` | Platform and company settings feature |
| `packages/client/features/score-calculation/` | Score display feature |
| `packages/client/features/auth/` | Login and authentication UI |

## Packages / @warp/secrets

| File | Purpose |
|---|---|
| `packages/secrets/index.ts` | Re-exports loadEnvironment |
| `packages/secrets/load-environment.ts` | loadEnvironment(): fetches all secrets from AWS SM, merges into process.env; throws on failure |
| `packages/secrets/secrets-manager.service.ts` | AWS Secrets Manager client wrapper; calls GetSecretValue API |

## Workflows

| File | Purpose |
|---|---|
| `workflows/form-submission-workflow.v2.txt` | Design spec for the FormSubmission.status state machine and post-submission webhook (partially implemented; see workflows.md for implementation status) |
