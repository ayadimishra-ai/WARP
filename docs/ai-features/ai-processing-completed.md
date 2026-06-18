# AI Processing Completed — Unified Endpoint

## Overview

Single endpoint called by AI-Services (Python) when any curation type finishes processing for a `FormInvitation`. Replaces the legacy `web-curation-for-processing` and `document-processing-completed` endpoints.

---

## Endpoint

`POST /api/AI/ai-processing-completed`

**Input:** `processingIds` — array of record IDs from any of the three curation tables. A single call may contain IDs from multiple tables and multiple invitations.

**Rate limit:** 60 requests per minute per unique (email address, IP address) pair. The rate limit is enforced per combination — for example, if `user@example.com` makes requests from IP `1.2.3.4`, those count toward one limit bucket; requests from `user@example.com` at IP `5.6.7.8` count toward a separate bucket. Progressive delay is disabled for this endpoint.

**Examples:**
- Same email, different IPs: `user@example.com` from `1.2.3.4` (60 req/min) and `user@example.com` from `5.6.7.8` (separate 60 req/min limit).
- Different emails, same IP: `user1@example.com` from `1.2.3.4` (60 req/min) and `user2@example.com` from `1.2.3.4` (separate 60 req/min limit).

---

## Curation Types

| Type | Table | Writes answers? | Triggers completion % |
|------|-------|-----------------|-----------------------|
| AIBulkDocumentProcessing | AIBulkDocumentProcessing | Yes | Yes |
| WebCuration | WebCuration | No — suggestions only | No |
| OPSToIQCuration | OPSToIQCuration | Yes | Yes |

WebCuration only generates AI suggestions. Answers are written to `FormSubmissions` when the user accepts a suggestion, so completion percentage is recalculated at that point — not during curation completion.

---

## Processing Flow

### 1. Fetch
All three curation tables are queried simultaneously using the provided `processingIds`. Results are normalized into a unified record shape regardless of their origin table.

### 2. Build updates
Type-specific DB update objects are prepared:
- **AIBulkDocumentProcessing** — source file statuses are fetched and embedded; `emailSendAt` timestamp is recorded (ISO 8601 UTC format) as the processing completion time when this step executes. Note: This timestamp does NOT represent the actual SMTP email send time (which occurs later in step 6c, Send completion email). If the invitation fails the gate check (step 3), no email is sent but the timestamp remains as the processing completion time. If the email is sent, SMTP delays/retries may cause the actual delivery time to differ from this persisted value; `requestStatus` → `Completed`.
- **WebCuration** — `status` → `Completed`.
- **OPSToIQCuration** — `status` → `Completed`.

### 3. Completion gate
For each invitation in the batch, the status of all triggered curation types is checked:

- A curation type passes the gate if its row does not exist (was never triggered) **or** its `status` is `Completed`.
- All triggered types must pass before the invitation is eligible for email and `FormInvitation.status` update.
- If the status lookup query fails, **all emails in the batch are skipped** — a fail-safe that prevents premature notifications.

### 4. Write
**Transaction semantics:** The FormInvitation status update (FormInvitation.status → Invited for gated invitations) and processing row completions (WebCuration/AIBulkDocumentProcessing/OPSToIQCuration → Completed) are combined into a single `updateFormInvitationStatusBulkbyId` call to maintain atomicity. If the mutation fails, all updates are rolled back by Hasura's transaction handling, preventing inconsistent state.

**Failure scenarios & recovery:**
- If the combined mutation fails entirely, no state changes are persisted. The API returns a 400 error with details. Callers should retry the entire request with the same `processingIds`.
- If individual updates within the mutation fail due to constraint violations or missing records, the entire transaction is rolled back. Check logs for the specific error.
- **Idempotency:** The endpoint is designed to be idempotent — reprocessing the same `processingIds` is safe. Already-completed processing rows will not cause errors.

**Observability:**
- All mutations are logged via `aiLogger` with `processingIds`, invitation counts, and duration.
- Monitor `aiProcessingCompleted FATAL ERROR` log entries for failures.
- Use the returned error message to diagnose mutation issues (e.g., constraint violations, missing foreign keys).

**Recovery strategy:**
- Automatic retries: Implement exponential backoff in the AI-Services caller.
- Manual reconciliation: Query processing tables to identify stuck rows (status ≠ Completed) and re-invoke the API with those IDs.
- No compensating rollback is needed — the mutation is atomic and will not leave partial state.

**What gets updated:**
The atomic transaction updates:
1. `FormInvitation.status` → `Invited` for invitations that passed the completion gate (step 3).
2. All processing rows (WebCuration/AIBulkDocumentProcessing/OPSToIQCuration) → `Completed` for every processing ID in the request, whether or not their invitation passed the gate. Processing is marked complete once the AI work is done, independent of email eligibility.

### 5. Completion percentage
Recalculates and stores `FormInvitation.completion` (0–100 as string) for all invitations with AIBulkDocumentProcessing or OPSToIQCuration records. WebCuration invitations are excluded — see curation types table above.

### 6. Post-processing pipeline
Runs only if at least one invitation passed the gate. Steps are strictly ordered:

**a. Suggestion cleanup**
Normalizes numeric suggestion values (removes commas, parses integers). Upserts selected suggestions into `FormSubmission.Answers`. Runs for all invitations in the batch. Failure is logged but does not block email delivery.

**b. Cache AI statistics**
Calculates and stores `FormInvitation.metadata.dataStatsSummary` for each gated invitation. **This step is a best-effort operation**: failure per invitation is logged (via `aiLogger.error`) but does not block email delivery. If caching fails, the email template will render with a fallback message (e.g., "Statistics unavailable") rather than displaying the pre-cached summary. Statistics are recalculated in the background (step d) and will be available for subsequent views. Must attempt to complete before email to provide the best user experience.

**c. Send completion email**
Sends the appropriate template to each gated invitation. Template selection:

| Condition | Template |
|-----------|----------|
| OPS-only: No WebCuration or AIBulkDocumentProcessing rows exist in the DB with `status = Completed` (ignore soft-deleted rows and rows with status = Failed or Pending) | `DataCaptureCompleted-Reporting` |
| Assessment form | `AIProcessingCompleted-Assessment` |
| Reporting form | `AIProcessingCompleted-Reporting` |

**d. Background statistics recalculation**
Triggers `triggerAIStatisticsCalculation` for gated invitations. Fire-and-forget — does not block the response. Failure is logged only.

---

## Business Rules

**Multi-curation gate** — An invitation does not receive an email until every curation type that was triggered for it has completed. For example, if both WebCuration and OPSToIQCuration are active, a completion event from OPSToIQCuration will not send an email until WebCuration is also `Completed`.

**Fail-safe on status fetch failure** — If the query to check curation statuses fails, all emails in the batch are skipped. This prevents sending premature completion emails when the system cannot verify full completion.

**OPS-only email template** — When the only active curation for an invitation is OPSToIQCuration (no WebCuration row, no AIBulkDocumentProcessing row in the DB), the `DataCaptureCompleted-Reporting` template is used. This reflects data capture semantics rather than AI processing semantics.

**Statistics must be cached before email** — The email template calls `getAIProcessingStats()`, which reads from `FormInvitation.metadata.dataStatsSummary`. Without pre-caching, the email renders with zero values.

**Non-blocking post-processing failures** — Suggestion cleanup and statistics caching failures are logged and do not interrupt email delivery. Background statistics failure does not affect the API response.

**S3 error logging** — Fatal service-level errors are serialized and uploaded to the `exception-logs` S3 bucket in addition to being returned in the API response.

---

## Migration from Legacy Endpoints

| Legacy endpoint | Input | Replaced by |
|-----------------|-------|-------------|
| `POST /api/AI/web-curation-for-processing` | `body[0].invitationId` (invitation IDs) | `POST /api/AI/ai-processing-completed` with `body.processingIds` (WebCuration record IDs) |
| `POST /api/AI/document-processing-completed` | `body.bulkProcessingId` (processing record IDs) | `POST /api/AI/ai-processing-completed` with `body.processingIds` |

The key contract change for web curation: AI-Services must now send the `WebCuration.id` (the processing record ID) rather than the `FormInvitation.id`. This aligns web curation with the same input contract used by document and OPS-to-IQ curation.

---

## File Structure

```
apps/web/pages/api/AI/
  ai-processing-completed.ts          — API handler, input validation, rate limiting

packages/server/services/AI/ai-processing-completed/
  index.ts                            — Orchestrator: fetch → gate → write → pipeline
  processors.ts                       — Type-specific DB update builders per curation type
  post-pipeline.ts                    — Cleanup → stats cache → email → background stats
```
