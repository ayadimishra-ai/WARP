# WARP Workflows

## Form Submission Workflow v2

**Source file**: `workflows/form-submission-workflow.v2.txt`

This document specifies the post-submission processing workflow for form submissions in WARP.

### Full text of the spec

```
1. Create new column in FormSubmission
    - Column Name : "status"
    - Type : Text
    - Values :
        > New (Default)
        > Submitted : When form submitted
        > InProgress : Post submission operation started
        > Successful : Post submission operations are successfully completed
        > Failed : Post submission operations are failed
2. Create New webhook endpoint for Hasura action
    - Table : FormSubmission
    - Trigger : Update
3. On form submit update status form submission to "Submitted"
```

### Implementation Status

The spec describes a design intent. Here is how it is implemented in the actual codebase:

#### 1. The `status` column

The `FormSubmission.status` column is defined in `packages/shared/constants/form-submission.constants.ts`:

```typescript
export const FormSubmissionStatus = {
  New: "New",
  Submitted: "Submitted",
  InProgress: "InProgress",
  Successful: "Successful",
  Failed: "Failed",
  Declined: "Declined",
  Resubmitted: "Re-submitted",
  Approved: "Approved",
};
```

Two extra statuses beyond the spec are implemented: `Declined` and `Re-submitted` (added for the reviewer workflow and resubmission flow respectively).

[QA] **No migration adds this column to `FormSubmission`**. The column is referenced extensively in application code but never appears in the numbered migration files. It was likely added via the Hasura console directly on the production database.

#### 2. The webhook / trigger

The spec says "Create New webhook endpoint for Hasura action — Table: FormSubmission, Trigger: Update".

**This Hasura event trigger is not present in the metadata**. Instead, the architecture uses a different approach:

- The web app calls `POST /api/submit-form` directly
- That route calls `sdk.updateSubmissionStatus({ submissionId, submissionStatus: "Submitted" })`
- The client (or an intermediate step) then separately calls `POST /api/v1/internal/post-form-submission` to trigger the post-submission processing

The Hasura event trigger approach (where the DB update would automatically fire the webhook) was described in the spec but not implemented. Instead, the caller is responsible for making both API calls.

#### 3. The state machine in practice

The full lifecycle of a `FormSubmission.status`:

```
(submission created)
        ↓
      "New"
        ↓ (user clicks submit → POST /api/submit-form)
    "Submitted"
        ↓ (POST /api/v1/internal/post-form-submission called)
    "InProgress"
        ↓ (score calculation + recommendations complete)
    "Successful"   ←—— or ——→   "Failed"
        ↓ (approver takes action)
    "Approved"
        ↓ (if approver declines)
    "Declined"
        ↓ (invitee resubmits)
  "Re-submitted"
```

#### 4. Post-submission processing steps

When `POST /api/v1/internal/post-form-submission` is called (`apps/web/pages/api/v1/internal/post-form-submission.ts`):

1. **Validate JWT**: Extracts and parses Hasura claims from `Authorization` header
2. **Accept parameters**: `formId`, `submissionId`, `invitationId`, `targetInvitationStatus`, and optionally `questionId`, `interimAnswerId`
3. **Process score calculation** (`processScoreCalculation()`):
   - Fetches full form tree (sections → questions → form fields → answers) from Hasura using admin SDK
   - Builds a tree of sections respecting the `sectionId` self-reference
   - For each section and question, evaluates the `calc` JSONata expression against the collected answers
   - Writes computed scores to `FormResult` table (upsert)
   - Generates `Interim_Recommendation` rows from `recommendationCalc` JSONata expressions in each FormField
   - Skips recommendations already marked `Closed`
4. **Process progress report** (`processProgressReportScore()`):
   - Similar tree traversal
   - Writes `InterimFormLogs` with progress report data per section/question
5. **Error handling**:
   - All exceptions are caught and uploaded to S3 (`exception-logs/` prefix) via `uploadError()`
   - The function does not throw after logging — it silently continues or returns an error response

---

## Invitation Status Workflow

The `FormInvitation.status` field tracks the overall state of an invitation (distinct from the submission status).

### Status Values (`FormInvitationStatus`)

```
Draft       → Invited → Submitted → Approved → Completed
                           ↓
                        Under Review
                           ↓
                        (re-open)
                           ↓
                        Processing → Completed / Failed
                                   → Uploaded
```

Full list of UI display labels (`FormInvitationUIStatus`):
- `Processing` — AI or post-submission processing in progress
- `Requested` — invitation requested but not yet sent
- `Started` — invitee has started filling the form
- `Responded` — invitee has responded/submitted
- `Approved` — approved by the Inviter/Approver
- `Completed` — full workflow complete
- `Failed` — post-submission processing failed
- `ReadyForReporting` — data ready for report generation
- `ReadyForAssessment` — data ready for assessment
- `InProgress` — currently in progress
- `PendingReview` — awaiting reviewer action
- `Declined` — reviewer declined
- `Accepted` — reviewer accepted
- `ReSubmitted` — invitee has resubmitted after decline
- `UnderReview` — currently under reviewer review

---

## Answer Status Workflow

Individual answers (`Answer.status`) have their own status lifecycle:

```
"draft" (default) → "Submitted" → "Approved" / "Pending" / "Responded"
```

`QuestionStatus` constants: `Draft`, `Submitted`, `Approved`, `Pending`, `Responded`.

---

## AI Processing Workflows

Three AI processing pipeline types are tracked via `AIProcessingTypes`:

### 1. AIBulkDocumentProcessing

Triggered when an Inviter or AI administrator uploads documents to be processed for a form invitation:

1. Documents uploaded to S3 via `POST /api/awss3/upload`
2. `DocumentLogs` rows created with status `Uploading` → `Uploaded`
3. `POST /api/AI/AIprocessing` sends files to the AI microservice for ingestion
4. `SourceFiles` and `Sources` rows track the processing state
5. Status transitions: `Pending` → `Ingesting` → `Embedding` → `Curating` → `Success` / `Error`
6. On completion, AI microservice calls back `POST /api/AI/ai-processing-completed`
7. `Suggestions` rows are populated with AI-generated answers per FormField
8. Email sent to user via `POST /api/AI/email-invitation`

### 2. WebCuration

Triggered to fetch and process public web data about the company:

1. `POST /api/AI/web-curation-for-processing` initiates web scraping job
2. Status tracked in `AIProcessing` table with type `WebCuration`
3. Status: `Pending` → `Processing` → `Completed` / `Error`
4. On completion: `POST /api/AI/update-invitation-web-curation-ai-bulk-processing`
5. Web-curated suggestions are added to the `Suggestions` table

### 3. OPSToIQCuration

Triggered when a company is eligible for OPs (GHG calculator) data import:

1. Eligibility checked via `GET /api/v1/ops/check-company-eligibility`
2. If eligible, `POST /api/AI/update-invitation-and-skipped-status` initiates the curation
3. OPs data is fetched from the OPs PRO API and mapped to WARP form fields
4. Status tracked separately from AI user status (non-AI users can have OPS-to-IQ access)

### Document Expiry Notification Workflow

Automated webhook-triggered workflow for notifying users about expiring documents:

1. External scheduler calls `POST /api/webhooks/document-expiry-notifications`
2. Webhook validates `DOCUMENT_EXPIRY_NOTIFICATION_WEBHOOK_SECRET` header
3. `document-expiry-notification.service.ts` queries documents with expiry dates:
   - 5 days remaining → `reminder_5_days` alert
   - 20 days remaining → `reminder_20_days` alert
   - 30 days remaining → `reminder_30_days` alert
   - Already expired → `reminder_expired` alert
4. Sends emails to document owners and platform admins
5. Email types: `AIDocumentsExpired-User`, `AIDocumentsExpiringSoon-User`, `AIDocumentsExpired-Admin`, `AIDocumentsExpiringSoon-Admin`

---

## Recommendation Workflow

Generated during score calculation, tracked independently:

```
(score calculation runs)
        ↓
  Recommendation created ("Open" status)
        ↓ (portfolio company takes action)
  "Pending for approval"
        ↓ (Inviter approves action)
  "Closed"
        ↓ (if re-opened)
  "Reopened"
        ↓ (NA if not applicable)
  "NA"
```

Email notifications fire at each transition:
- `recommendation/email-on-manually-raising-the-recommendations.ts`
- `recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee.ts`
- `recommendation/email-when-the-actions-taken-on-the-recommendations-are-approved.ts`
- `recommendation/email-when-a-recommendation-is-reopened.ts`

---

## Carry-Forward Workflow

When a new assessment period begins, previous answers can be carried forward:

### Carry Forward as Answers
`POST /api/carry-forward-assessment-data` — copies all `Answer` rows from the previous submission to the new submission (same field mapping).

### Carry Forward User-wise
`POST /api/carry-forward-assessment-data-userwise` — carries forward only the answers entered by the current user.

### Carry Forward as Suggestions
When `FormInvitation.interimCheck.isCarryForwardAsSuggestionsInvitation` is `true`:
- `POST /api/carry-forward-suggestions` — previous answers are inserted as `Suggestions` rows instead of `Answer` rows
- The `saveAnswers` service detects this flag and skips the `Interim_Answer` upsert logic
- Users see previous answers as AI suggestions they can accept/reject rather than as pre-filled answers

---

## Maker-Checker Workflow (Reviewer Details)

For forms with reviewer assignment:

1. `ReviewerDetailsMapping` rows map reviewers to specific questions within an invitation
2. Reviewers receive email notifications
3. Reviewer actions (approve/decline/resubmit) trigger emails:
   - `reviewer-aaproved-email.ts` [QA: typo]
   - `reviewer-declined-email.ts`
   - `reviewer-resubmit-email.ts`
4. `MakerCheckerRemarks` stores audit trail of reviewer comments

`reviewer-pending-emails-cron.ts` is a cron-triggered endpoint that sends bulk reminder emails to reviewers who have pending actions.
