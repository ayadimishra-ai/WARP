/**
 * Business Rules — Monthly Activity Summary (All Monthly Activity Summary page)
 *
 * This file documents the authoritative business rules, validation constraints,
 * and scope decisions for the Monthly Activity Summary feature.
 * Add new rules here when the feature evolves across sprints.
 */

// ─── Roles ────────────────────────────────────────────────────────────────────

/**
 * RULE-001: Only OrganizationAdmin may approve activity data.
 * LocationExecutive (and all other roles) must NOT see or trigger the Approve action.
 * Enforced server-side on every approve request; the UI hides the button for
 * non-admin roles as a secondary safeguard.
 */

// ─── Approval action ──────────────────────────────────────────────────────────

/**
 * RULE-002: Approve is a BULK operation.
 * Clicking Approve on a row approves ALL records that are:
 *   - Matching the specific activity (by activity code, which is unique)
 *   - Within the currently active year filter (full financial or calendar year)
 *   - Within the currently active month filter (or all 12 months if none selected)
 *   - Within the currently active location filter (or all user-accessible
 *     locations if none selected)
 *   - Currently in Pending status (status IS NULL OR status = 'pending')
 *
 * Records already Approved or Rejected are NOT touched.
 */

/**
 * RULE-003: Approval scope is strictly bounded by active filters.
 * Approving data for (Activity A, Month M, Location L, Year Y) MUST NOT affect
 * data in any other combination of activity / month / location / year.
 */

/**
 * RULE-004: Location ID intersection — server-side security.
 * The locationIds supplied by the client are ALWAYS intersected with the
 * authenticated user's session.mappings before being used in any query.
 * A user cannot approve data for locations they do not have access to.
 */

/**
 * RULE-005: Approve button disabled state.
 * The Approve button must be DISABLED (greyed out) when the pending count for
 * that row is 0 (i.e. all records are already approved or there are no records).
 * This check is performed client-side using the live row data from the API.
 * The server also enforces this — approving with no pending records is a no-op
 * (0 rows updated) and returns approvedCount: 0.
 */

// ─── Status flow ──────────────────────────────────────────────────────────────

/**
 * RULE-006: V1 status flow is one-way: Pending → Approved.
 * There is NO Reject option in V1.
 * There is NO Unlock/Revert option — once approved, data stays approved.
 * If unlocking is required, it must be raised as a support ticket.
 */

/**
 * RULE-007: NULL / 'pending' / 'saved' status are all treated as Pending.
 * Applies to both ActivityTaskRequest rows and individual GHG data rows.
 * GHG tables were migrated to add a status column (DEFAULT 'saved') via
 * lib/query-migration/migration.sql. For display and business logic purposes,
 * NULL, 'pending', and 'saved' are all treated as Pending. All three are
 * targeted by approve queries and counted as pending in STATUS_COUNTS.
 */

// ─── Data lock (upload/edit restriction) ─────────────────────────────────────

/**
 * RULE-008 [LOCK RESTORED — upload blocked for approved month/year/location/activity]:
 * Uploading new GHG data for a month/year/location that already has approved
 * records is BLOCKED. The upload fails with a 422 error. An error Excel file
 * is generated, uploaded to S3, and a Failure record is written to import
 * history so the user can download it and see which periods are locked.
 *
 * This enforces User Story 5E and User Story 6 (Negative cases) from requirements.md:
 *   - "Once data is approved, the Location Executive can no longer upload or
 *      modify data for that same month, location, and activity."
 *   - "If the uploaded file contains records for a mix of approved and
 *      non-approved months/locations, the entire upload must fail —
 *      no partial uploads are allowed."
 *
 * Enforced centrally in getTaskRequestActvityTaskRequestId() in
 * lib/excel/excel.service.ts via assertNoApprovalLock().
 * Do NOT add per-route duplicate lock checks.
 */

/**
 * RULE-011: Approval propagates to individual GHG data rows.
 * When an Approve action targets an activity (RULE-002 scope), two writes occur:
 *   1. ActivityTaskRequest rows matching the filter → status = 'approved'
 *   2. All GHG rows linked via activity_task_request_id → status = 'approved'
 * Both writes happen in the same DB call sequence in approveActivityTaskRequests().
 * The summary page counts GHG rows, so the pending count drops to 0 only after
 * both the ATR and its GHG children are updated.
 */

/**
 * RULE-012: Summary counts come from individual GHG rows, not ATR rows.
 * The Monthly Activity Summary page counts rows from all GHG tables (via a
 * UNION ALL), matching the same record set shown on the activity-data-records page.
 * ATR row counts are no longer used for the summary display.
 */

// ─── Audit trail ─────────────────────────────────────────────────────────────

/**
 * RULE-009: Approval is tracked via updated_by + updated_at columns.
 * ActivityTaskRequest.updated_by is set to the approving user's ID.
 * ActivityTaskRequest.updated_at is set to the approval timestamp (via now()).
 * No dedicated approval log table exists in V1.
 *
 * [FUTURE SPRINT — TODO]: If 'who approved what and when' reporting is needed,
 * create an ActivityApprovalLog table in PostgreSQL with columns:
 *   id, approved_by (userId), approved_at, activity_code, organization_id,
 *   location_ids (jsonb), year, year_type, months (jsonb), approved_count
 */

// ─── Browser back button ──────────────────────────────────────────────────────

/**
 * RULE-010: Browser back button after approval must show latest state.
 * The summary page re-fetches data on mount. Because the Approve action
 * immediately refreshes the page data after success, the post-approval counts
 * are already reflected. If the user navigates away and returns, the page
 * re-fetches from the API, showing the current approved state.
 * There is no optimistic state cached in the browser — no stale re-submission risk.
 */
