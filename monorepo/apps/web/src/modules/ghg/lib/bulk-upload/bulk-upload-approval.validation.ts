import { sql } from "drizzle-orm";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";

// ─── Constants ────────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_MONTHS = new Set([
  "january", "february", "march", "april",   "may",      "june",
  "july",    "august",   "september", "october", "november", "december",
]);

// ─── Sentinel code for approval-lock errors ───────────────────────────────────
// Used by isApprovalLockError() to distinguish this specific error from other
// CustomErrors so upload routes can render the correct error sheet and response.
export const APPROVAL_LOCK_ERROR_CODE = "APPROVAL_LOCK";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthYearPair {
  month: string; // Sentence case e.g. "April"
  year: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Throws a 422 CustomError (APPROVAL_LOCK_ERROR_CODE) if any
 * ActivityTaskRequest record for the given
 * (organizationAddressId, activityCode, month/year) combinations has
 * already been approved (status = 'approved').
 *
 * This enforces the requirement from User Story 5E and 6 (requirements.md):
 *   "Once data is approved, the Location Executive can no longer upload or
 *    modify data for that same month, location, and activity."
 *
 * Single entry-point (called from getTaskRequestActvityTaskRequestId in
 * excel.service.ts) — do NOT add per-route duplicate checks.
 */
export async function assertNoApprovalLock(
  organizationAddressId: string,
  activityCode: string,
  monthYearPairs: MonthYearPair[],
  // When provided, the query additionally requires that at least one row exists
  // in this GHG data table under the approved ATR. This prevents false-positive
  // blocks when a sibling activity sharing the same parent ActivityTaskRequest
  // gets approved — the parent ATR becomes 'approved' but this activity has no
  // data rows yet, so the upload should still be allowed.
  ghgDataTableName?: string,
  // When provided alongside ghgDataTableName, the EXISTS check is scoped to
  // this specific record ID. This prevents false-positive locks when multiple
  // records exist for the same ATR and only one of them is approved — editing
  // a different (non-approved) record should still be allowed.
  ghgRecordId?: string
): Promise<void> {
  if (!monthYearPairs.length) return;

  // ── Input validation (SQL injection prevention) ───────────────────────────
  if (!UUID_REGEX.test(organizationAddressId)) {
    throw new Error("assertNoApprovalLock: invalid organizationAddressId");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(activityCode)) {
    throw new Error("assertNoApprovalLock: invalid activityCode");
  }
  if (ghgDataTableName !== undefined && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(ghgDataTableName)) {
    throw new Error("assertNoApprovalLock: invalid ghgDataTableName");
  }
  if (ghgRecordId !== undefined && !UUID_REGEX.test(ghgRecordId)) {
    throw new Error("assertNoApprovalLock: invalid ghgRecordId");
  }

  // Sanitise each pair: only accept known month names and valid years.
  const safePairs = monthYearPairs
    .map(({ month, year }) => ({
      month: String(month).trim().toLowerCase(),
      year: Number(year),
    }))
    .filter(
      ({ month, year }) =>
        VALID_MONTHS.has(month) && Number.isInteger(year) && year > 1900 && year < 2200
    );

  if (!safePairs.length) return;

  const pairConditions = safePairs
    .map(({ month, year }) => `(tr.year = ${year} AND LOWER(tr.month) = '${month}')`)
    .join(" OR ");

  // When ghgDataTableName is provided, require a row with status='approved' in
  // that specific table — not just any row. This prevents false-positive blocks
  // caused by sibling activities sharing the same parent ATR: if energy_captive_power
  // is approved the shared 'energy' ATR becomes 'approved', but fuel-consumption rows
  // may still be 'saved'. The status guard ensures only the specific sub-activity's
  // own approval triggers the lock.
  // When ghgRecordId is also provided, scope the check to that exact record so that
  // editing one non-approved entry is not blocked by a sibling approved entry under
  // the same ATR.
  const dataExistsClause = ghgDataTableName
    ? `AND EXISTS (
        SELECT 1 FROM "${ghgDataTableName}" ghg
        WHERE ghg.activity_task_request_id = atr.id
          AND ghg.status = 'approved'
          ${ghgRecordId ? `AND ghg.id = '${ghgRecordId}'` : ""}
      )`
    : "";

  // ── DB query — find any approved month/year in the upload ────────────────
  const query = `
    SELECT LOWER(tr.month) AS month, tr.year
    FROM "ActivityTaskRequest" atr
    JOIN "TaskRequest" tr  ON tr.id  = atr.task_request_id
    JOIN "Activity"    act ON act.id = atr.activity_id
    WHERE
      atr.organization_address_id = '${organizationAddressId}'
      AND atr.is_deleted IS NOT TRUE
      AND LOWER(act.code) = '${activityCode.toLowerCase()}'
      AND atr.status = 'approved'
      AND (${pairConditions})
      ${dataExistsClause}
    LIMIT 10
  `;

  const db = await GetOPSDBContext();
  const rows = (await db.execute(sql.raw(query))) as any[];

  if (rows.length === 0) return; // No approved records — upload is allowed.

  const lockedPairs: MonthYearPair[] = rows.map((row: any) => ({
    month: String(row.month).charAt(0).toUpperCase() + String(row.month).slice(1),
    year: Number(row.year),
  }));

  // Throw with the sentinel code so upload routes can detect this specific
  // error via isApprovalLockError() and produce the correct error-sheet response.
  throw CustomError({
    statusCode: 422,
    code: APPROVAL_LOCK_ERROR_CODE as any,
    message: "Data for this month and location has already been approved and cannot be modified",
    data: { lockedPairs },
  });
}

/**
 * Returns true when the thrown error is an approval-lock error.
 * Used by upload routes to branch into the error-sheet response path.
 */
export function isApprovalLockError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as any).isCustomError === true &&
    (err as any).code === APPROVAL_LOCK_ERROR_CODE
  );
}

