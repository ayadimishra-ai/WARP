/**
 * Unified email notification service for the Monthly Activity Summary domain.
 *
 * US-8  notifyOrgAdminsOnDataUpload        — upload notification to Org Admins
 * US-9  notifyLocationExecutivesOnApproval — approval notification to Location Executives
 * US-10 sendUploadPendingReminders("1st")  — 1st-of-month scheduled reminder
 * US-11 sendUploadPendingReminders("10th") — 10th-of-month scheduled reminder
 *
 * Design principles:
 *   • Self-contained — does NOT depend on other notification services.
 *   • Raw SQL only — follows the domain convention (GetOPSDBContext).
 *   • Shared utils (fetchEmailTemplate, sendEmail, saveEmailLog) used as-is.
 */

import { sql } from "drizzle-orm";
import type { ApproveParams } from "@/modules/ghg/lib/monthly-activity-summary/types";
import { jsonToExcelBuffer } from "@/modules/ghg/lib/excel/excel.service";
import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";
import { uploadFileBufferToS3ForAI } from "@/modules/ghg/utils/file-storage/server.service";
import {
  dynamicEmailHeader,
  fetchEmailTemplate,
  saveEmailLog,
  sendEmail,
} from "@/modules/ghg/utils/email.util";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";
import { logger } from "@/modules/ghg/utils/logger";
import { MASEmailTemplateCodes } from "./monthly-activity-summary-email.constants";

// ─── Validation ────────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Allows only alphanumeric + underscore to prevent SQL injection on activity codes.
const SAFE_ACTIVITY_CODE_REGEX = /^[a-zA-Z0-9_]+$/;

// ─── Internal types ─────────────────────────────────────────────────────────────

interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

interface ActivityExcelRow {
  Location: string;
  Activity: string;
  Year: number | string;
  Month: string;
}

interface PendingCombo {
  locationName: string;
  activityName: string;
  year: number;
  month: string;
}

// One row per unique LocationExecutive who has ≥1 pending upload for the month.
interface PendingUser {
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

export type ReminderType = "1st" | "10th";

// ─── Private DB helpers ─────────────────────────────────────────────────────────

async function fetchOrgAdmins(organizationId: string): Promise<SimpleUser[]> {
  if (!UUID_REGEX.test(organizationId)) return [];
  const db = await GetOPSDBContext();
  const rows = (await db.execute(
    sql.raw(`
      SELECT id::text, name, email
      FROM   "AppUser"
      WHERE  organization_id = '${organizationId}'
        AND  role            = 'OrganizationAdmin'
        AND  is_deleted      = false
        AND  email IS NOT NULL
        AND  TRIM(email)    <> ''
      ORDER BY updated_at DESC
    `)
  )) as any[];
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    email: String(r.email),
  }));
}

/**
 * Resolves the human-readable activity name from its code via the Activity table.
 * Used by US-8 as a fallback when the caller doesn't pass activityName explicitly,
 * so the email deep-link payload always carries a usable name.
 * Returns "" when the code is invalid or the activity isn't found.
 */
async function fetchActivityNameByCode(activityCode: string): Promise<string> {
  if (!SAFE_ACTIVITY_CODE_REGEX.test(activityCode)) return "";
  const db = await GetOPSDBContext();
  const rows = (await db.execute(
    sql.raw(`
      SELECT name
      FROM   "Activity"
      WHERE  code        = '${activityCode}'
        AND  is_deleted  IS NOT TRUE
      LIMIT  1
    `)
  )) as Array<{ name: unknown }>;
  return rows.length ? String(rows[0].name ?? "") : "";
}

/**
 * Returns all active Location Executives assigned to a specific location + activity.
 * Used by US-9 to find recipients per approved location.
 *
 * `activities` is a JSONB array of activity codes on UserOrganizationAddressMapping.
 * The @> operator checks containment: activities @> ["fuel_consumption"] → true.
 */
async function fetchLocationExecutives(
  locationId: string,
  activityCode: string
): Promise<SimpleUser[]> {
  if (
    !UUID_REGEX.test(locationId) ||
    !SAFE_ACTIVITY_CODE_REGEX.test(activityCode)
  )
    return [];
  const db = await GetOPSDBContext();
  const rows = (await db.execute(
    sql.raw(`
      SELECT DISTINCT au.id::text, au.name, au.email, au.updated_at
      FROM   "UserOrganizationAddressMapping" uoam
      JOIN   "AppUser" au ON au.id = uoam.user_id
      JOIN   "Activity" act
        ON   act.code       = '${activityCode}'
        AND  act.is_deleted IS NOT TRUE
      WHERE  uoam.organization_address_id = '${locationId}'
        AND  uoam.activities @> jsonb_build_array(COALESCE(act.parent_code, act.code))
        AND  au.role       = 'LocationExecutive'
        AND  au.is_deleted = false
        AND  au.email IS NOT NULL
        AND  TRIM(au.email) <> ''
      ORDER BY au.updated_at DESC
    `)
  )) as any[];
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    email: String(r.email),
  }));
}

/**
 * Returns one row per unique LocationExecutive who has at least one pending
 * (location × activity) upload for the previous calendar month.
 *
 * Reminder rules enforced:
 *   Scenario C — deactivated LEs excluded (is_deleted = false on AppUser).
 *   Scenario D — deactivated activities excluded (is_deleted filter on Activity JOIN).
 *   Scenario E — mappings created on the scheduler run date excluded.
 *   Scenario F — orgs onboarded in the previous month excluded.
 *
 * Uses EXISTS to check for any pending combo per user — no per-combo rows returned,
 * so no application-level deduplication is needed.
 */
async function fetchPendingUsers(): Promise<PendingUser[]> {
  const db = await GetOPSDBContext();
  const rows = (await db.execute(
    sql.raw(`
      SELECT DISTINCT
        uoam.organization_id,
        au.id::text  AS user_id,
        au.name      AS user_name,
        au.email     AS user_email,
        au.updated_at
      FROM  "UserOrganizationAddressMapping" uoam
      JOIN  "AppUser" au
        ON  au.id         = uoam.user_id
        AND au.role       = 'LocationExecutive'
        AND au.is_deleted = false
        AND au.email     IS NOT NULL
        AND TRIM(au.email) <> ''
      JOIN  "OrganizationAddress" oa
        ON  oa.id          = uoam.organization_address_id
        AND oa.is_deleted IS NOT TRUE
      JOIN  "Organization" org ON org.id = uoam.organization_id
      WHERE
        -- Scenario E: exclude mappings first created on the scheduler run date
        uoam.created_at::date < CURRENT_DATE
        -- Scenario F: org must have been onboarded before the start of the previous month
        AND DATE_TRUNC('month', org.created_at) < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        -- Core check: at least one (location x activity) combo has no uploaded data for last month
        AND EXISTS (
          SELECT 1
          FROM   jsonb_array_elements(uoam.activities) AS elem
          JOIN   "Activity" act
            ON   act.code        = elem #>> '{}'
            AND  act.is_deleted  IS NOT TRUE
            AND  act.is_master   IS NOT TRUE
          WHERE  NOT EXISTS (
            SELECT 1
            FROM   "ActivityTaskRequest" atr
            JOIN   "TaskRequest"         tr   ON tr.id   = atr.task_request_id
            JOIN   "Activity"            act2 ON act2.id = atr.activity_id
            WHERE  atr.organization_address_id = uoam.organization_address_id
              AND  act2.code                   = elem #>> '{}'
              AND  atr.is_deleted             IS NOT TRUE
              AND  tr.year   = EXTRACT(YEAR  FROM (CURRENT_DATE - INTERVAL '1 month'))::int
              AND  LOWER(tr.month) = LOWER(TRIM(TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month')))
          )
        )
      ORDER BY au.updated_at DESC
    `)
  )) as any[];
  return rows.map((r) => ({
    organizationId: String(r.organization_id),
    userId: String(r.user_id),
    userName: String(r.user_name ?? ""),
    userEmail: String(r.user_email),
  }));
}

/**
 * Returns a map of locationId → name for all provided location IDs.
 */
async function fetchLocationNames(
  locationIds: string[]
): Promise<Map<string, string>> {
  const validIds = locationIds.filter((id) => UUID_REGEX.test(id));
  if (!validIds.length) return new Map();
  const db = await GetOPSDBContext();
  const inClause = validIds.map((id) => `'${id}'`).join(", ");
  const rows = (await db.execute(
    sql.raw(`
      SELECT oa.id::text, addr.name
      FROM   "OrganizationAddress" oa
      JOIN   "Addresses" addr ON addr.id = oa.address_id
      WHERE  oa.id IN (${inClause})
        AND  oa.is_deleted IS NOT TRUE
    `)
  )) as Array<{ id: string; name: unknown }>;
  const map = new Map<string, string>();
  // Normalise keys to lowercase so Map.get() matches regardless of client UUID casing.
  for (const row of rows) map.set(row.id.toLowerCase(), String(row.name ?? ""));
  return map;
}

/**
 * Returns distinct (locationId, month) pairs that are currently approved
 * for the given locations / activity / year.
 * Used when approveParams.months is empty (= all months approved).
 */
async function fetchApprovedMonthsForLocations(
  locationIds: string[],
  activityCode: string,
  year: number
): Promise<Array<{ locationId: string; month: string }>> {
  const validIds = locationIds.filter((id) => UUID_REGEX.test(id));
  if (!validIds.length || !SAFE_ACTIVITY_CODE_REGEX.test(activityCode)) return [];
  const db = await GetOPSDBContext();
  const inClause = validIds.map((id) => `'${id}'`).join(", ");
  const rows = (await db.execute(
    sql.raw(`
      SELECT DISTINCT
        atr.organization_address_id::text AS location_id,
        INITCAP(TRIM(tr.month))           AS month
      FROM  "ActivityTaskRequest" atr
      JOIN  "TaskRequest" tr  ON tr.id  = atr.task_request_id
      JOIN  "Activity"    act ON act.id = atr.activity_id
      WHERE atr.organization_address_id IN (${inClause})
        AND act.code       = '${activityCode}'
        AND tr.year        = ${year}
        AND atr.status     = 'approved'
        AND atr.is_deleted IS NOT TRUE
    `)
  )) as any[];
  return rows.map((r) => ({
    locationId: String(r.location_id),
    month: String(r.month ?? ""),
  }));
}

/**
 * Bulk version of fetchPendingCombosForUser — fetches all pending
 * (location × activity) combos for every user in one query instead of N queries.
 * SQL logic is identical to the removed fetchPendingCombosForUser; only the WHERE
 * clause changes from = '${userId}' to IN (${idList}) and user_id is added to SELECT.
 */
async function fetchAllPendingCombosForUsers(
  userIds: string[]
): Promise<Map<string, PendingCombo[]>> {
  const validIds = userIds.filter((id) => UUID_REGEX.test(id));
  if (!validIds.length) return new Map();
  const idList = validIds.map((id) => `'${id}'`).join(", ");
  const db = await GetOPSDBContext();
  const rows = (await db.execute(
    sql.raw(`
      SELECT DISTINCT
        uoam.user_id::text AS user_id,
        addr.name          AS location_name,
        act.name           AS activity_name,
        EXTRACT(YEAR  FROM (CURRENT_DATE - INTERVAL '1 month'))::int        AS year,
        INITCAP(TRIM(TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month'))) AS month
      FROM  "UserOrganizationAddressMapping" uoam
      JOIN  "OrganizationAddress" oa
        ON  oa.id          = uoam.organization_address_id
        AND oa.is_deleted  IS NOT TRUE
      JOIN  "Addresses" addr ON addr.id = oa.address_id
      JOIN  LATERAL jsonb_array_elements(uoam.activities) AS elem ON true
      JOIN  "Activity" act
        ON  act.code       = elem #>> '{}'
        AND act.is_deleted  IS NOT TRUE
        AND act.is_master   IS NOT TRUE
      WHERE uoam.user_id IN (${idList})
        AND uoam.created_at::date < CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1
          FROM   "ActivityTaskRequest" atr
          JOIN   "TaskRequest"         tr   ON tr.id   = atr.task_request_id
          JOIN   "Activity"            act2 ON act2.id = atr.activity_id
          WHERE  atr.organization_address_id = uoam.organization_address_id
            AND  act2.code                   = elem #>> '{}'
            AND  atr.is_deleted             IS NOT TRUE
            AND  tr.year   = EXTRACT(YEAR  FROM (CURRENT_DATE - INTERVAL '1 month'))::int
            AND  LOWER(tr.month) = LOWER(TRIM(TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month')))
        )
    `)
  )) as any[];

  const map = new Map<string, PendingCombo[]>();
  for (const r of rows) {
    const key = String(r.user_id);
    const list = map.get(key) ?? [];
    list.push({
      locationName: String(r.location_name ?? ""),
      activityName: String(r.activity_name ?? ""),
      year: Number(r.year),
      month: String(r.month ?? ""),
    });
    map.set(key, list);
  }
  return map;
}

// ─── Excel + S3 helper ─────────────────────────────────────────────────────────

/**
 * Generates an Excel workbook from activity rows, uploads it to S3 under
 * the "email_attachments" path, and returns the public download URL.
 * Returns "" on any failure so callers can still send the email without a link.
 */
async function generateAndUploadEmailExcel(
  organizationId: string,
  rows: ActivityExcelRow[]
): Promise<string> {
  if (!rows.length) return "";
  try {
    const buffer = jsonToExcelBuffer([{ sheetName: "Activity Data", data: rows }]);
    if (!buffer) return "";
    const result = await uploadFileBufferToS3ForAI(
      organizationId,
      "email_attachments",
      buffer,
      "xlsx"
    );
    return result?.downloadUrl ?? "";
  } catch (err) {
    logger.warn("generateAndUploadEmailExcel: S3 upload failed", {
      organizationId,
      error: err instanceof Error ? err.message : String(err),
    });
    return "";
  }
}

// ─── Email feature-flag helpers ────────────────────────────────────────────────

/**
 * Fetches the `send_emails` PlatformFeatureFlag row for each org in `orgIds`
 * and returns a Map<orgId, Record<templateCode, boolean>>.
 *
 * If no flag row exists for an org the map will have no entry for it —
 * callers treat a missing entry as "all emails enabled" (safe default).
 */
async function fetchEmailFeatureFlags(
  orgIds: string[]
): Promise<Map<string, Record<string, unknown>>> {
  if (!orgIds.length) return new Map();
  const validIds = orgIds.filter((id) => UUID_REGEX.test(id));
  if (!validIds.length) return new Map();

  const db = await GetOPSDBContext();
  const inClause = validIds.map((id) => `'${id}'`).join(", ");
  const rows = (await db.execute(
    sql.raw(`
      SELECT organization_id::text, metadata
      FROM   "PlatformFeatureFlags"
      WHERE  type            = 'send_emails'
        AND  is_deleted      = false
        AND  organization_id IN (${inClause})
    `)
  )) as Array<{ organization_id: string; metadata: unknown }>;

  const result = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (row.metadata && typeof row.metadata === "object") {
      result.set(row.organization_id, row.metadata as Record<string, unknown>);
    }
  }
  return result;
}

/**
 * Returns `true` only when the feature flag row exists, `EMAIL_TEMPLATES_TO_SEND`
 * is present, and the template key inside it is explicitly `true`.
 * In all other cases (no row, missing key, or key = false) emails are suppressed.
 */
function checkEmailEnabled(
  flags: Record<string, unknown> | undefined,
  templateCode: string
): boolean {
  if (!flags) return false;
  const templates = flags["EMAIL_TEMPLATES_TO_SEND"];
  if (!templates || typeof templates !== "object") return false;
  return (templates as Record<string, unknown>)[templateCode] === true;
}

/**
 * Reads `max_recipients` from the feature flag metadata.
 * Returns `null` when the key is absent — callers treat null as "no cap".
 * Non-positive or non-integer values are ignored (treated as no cap).
 * Safety rules:
 * 1. max_recipients absent or not a positive integer → no cap (unlimited).
 * 2. The cap is per function call per org, not a global running total — resets each time the endpoint is called.
 * 3. A capped run logs exactly how many were skipped, so it's visible in server logs
 */
function getMaxRecipients(
  flags: Record<string, unknown> | undefined
): number | null {
  if (!flags) return null;
  const val = flags["max_recipients"];
  if (typeof val === "number" && Number.isInteger(val) && val > 0) return val;
  return null;
}

// ─── Private utilities ──────────────────────────────────────────────────────────

function applyVariables(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(
    /{{\s*([^}]+)\s*}}/g,
    (_, key) => vars[key.trim()] ?? ""
  );
}

function getPreviousMonthDisplayName(): string {
  const prev = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  return prev.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function serializeError(err: unknown): string {
  return err instanceof Error
    ? `${err.message}\n${err.stack ?? ""}`
    : String(err ?? "");
}

// ─── [V2 PLACEHOLDER — Scenario C] ────────────────────────────────────────────
// If a LE is deactivated after the 1st-of-month reminder but before the 10th,
// the 10th reminder must be sent to the Org Admin only with a note that no
// active LE is assigned. fetchPendingUsers already excludes deactivated LEs
// (is_deleted = false), so the 10th email is simply skipped for them. The
// V2 work is to detect this case and notify the Org Admin separately.
// ──────────────────────────────────────────────────────────────────────────────

// ─── US-8: Data Uploaded → notify all Org Admins ──────────────────────────────

export interface NotifyOrgAdminsOnDataUploadParams {
  organizationId: string;
  organizationAddressId: string;
  activityCode: string;
  activityName?: string;
  /**
   * All distinct lower-case month names present in the upload (e.g.
   * ["january", "february"]). The email deep-link pre-selects every entry so
   * the admin sees the full uploaded period, not just one month.
   * Order: latest month first — the decoder uses months[0] as the anchor for
   * calendar→financial-year conversion.
   */
  months?: string[];
  year?: number;
  /**
   * All distinct (year, month) pairs from the upload, sorted in financial-year order.
   * When provided, the email Excel attachment uses these pairs so multi-year
   * uploads are represented correctly instead of being collapsed to one year.
   */
  yearMonthPairs?: Array<{ year: number; month: string }>;
  uploaderUserId: string;
}

/**
 * Sends one email per Org Admin when a Location Executive successfully uploads data.
 * Non-blocking — always call with .catch().
 */
export async function notifyOrgAdminsOnDataUpload(
  params: NotifyOrgAdminsOnDataUploadParams
): Promise<void> {
  const {
    organizationId,
    organizationAddressId,
    activityCode,
    activityName,
    months,
    year,
    yearMonthPairs,
    uploaderUserId,
  } = params;
  // Fall back to a DB lookup when the caller doesn't pass activityName.
  // The upstream Excel routes don't all forward this yet, and an empty name
  // in the deep-link payload would leave the data-log-summary search blank.
  let resolvedActivityName =
    activityName && activityName.trim().length > 0
      ? activityName
      : await fetchActivityNameByCode(activityCode);
  // Display override: legacy DB / constant value "Grid Power Details" is shown
  // as "Energy-Grid" in user-facing emails. Keeps DB and constant intact.
  if (resolvedActivityName === "Grid Power Details") {
    resolvedActivityName = "Energy-Grid";
  }
  const emailFlagsMap = await fetchEmailFeatureFlags([organizationId]);
  const orgEmailFlags = emailFlagsMap.get(organizationId);

  if (!checkEmailEnabled(orgEmailFlags, MASEmailTemplateCodes.DataUploaded)) {
    logger.info("notifyOrgAdminsOnDataUpload: disabled by feature flag", {
      organizationId,
      templateCode: MASEmailTemplateCodes.DataUploaded,
    });
    return;
  }
  const maxRecipients = getMaxRecipients(orgEmailFlags);

  const [templateData, admins, env, emailHeader] = await Promise.all([
    fetchEmailTemplate(MASEmailTemplateCodes.DataUploaded),
    fetchOrgAdmins(organizationId),
    getServerEnv(),
    dynamicEmailHeader(organizationId),
  ]);

  const template = templateData.EmailTemplates?.[0];
  if (!template) {
    logger.warn("notifyOrgAdminsOnDataUpload: email template not found", {
      code: MASEmailTemplateCodes.DataUploaded,
      organizationId,
    });
    return;
  }

  if (!admins.length) {
    logger.warn("notifyOrgAdminsOnDataUpload: no active OrgAdmin found", {
      organizationId,
    });
    return;
  }

  const filterPayload = JSON.stringify({
    organizationAddressId,
    activityName: resolvedActivityName,
    months: months ?? [],
    year: year ?? 0,
    // yearMonthPairs carries each uploaded (year, month) so the deep-link
    // receiver can scope both the year selector and the month pre-selection
    // correctly, even when the upload spans multiple calendar / FY years.
    // yearMonthPairs[].year is the CALENDAR year from the file; the receiver
    // converts it to the FY start year using the org's year type + FY start month.
    ...(yearMonthPairs?.length ? { yearMonthPairs } : {}),
  });
  const encodedFilters = Buffer.from(filterPayload, "utf-8").toString(
    "base64url"
  );
  // Build the final destination URL first, then wrap it in the login redirect
  // so that unauthenticated users land on login and are sent straight back here
  // after they authenticate. The parent SPA login page must read ?returnUrl=
  // and navigate to it after a successful login.
  const destination = `${env.NEXT_PUBLIC_SITE_URL}data-upload-logs/?filters=${encodedFilters}`;
  const ctaLink = `${env.NEXT_PUBLIC_SITE_URL}login?returnUrl=${encodeURIComponent(destination)}`;

  const copyrightYear = new Date().getFullYear().toString();

  // Generate Excel with uploaded activity rows and upload to S3 once for all admins.
  let excelDownloadUrl = "";
  try {
    const locationNamesMap = await fetchLocationNames([organizationAddressId]);
    const locationName = locationNamesMap.get(organizationAddressId.toLowerCase()) ?? "";
    const pairs =
      yearMonthPairs?.length
        ? yearMonthPairs
        : (months ?? []).map((m) => ({ year: year ?? new Date().getFullYear(), month: m }));
    const excelRows: ActivityExcelRow[] = pairs.map(({ year: y, month: m }) => ({
      Location: locationName,
      Activity: resolvedActivityName,
      Year: y,
      Month: m.charAt(0).toUpperCase() + m.slice(1).toLowerCase(),
    }));
    excelDownloadUrl = await generateAndUploadEmailExcel(organizationId, excelRows);
  } catch (err) {
    logger.warn("notifyOrgAdminsOnDataUpload: Excel generation failed", {
      organizationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
  const cappedAdmins =
    maxRecipients != null ? admins.slice(0, maxRecipients) : admins;
  if (maxRecipients != null && admins.length > maxRecipients) {
    logger.info(
      "notifyOrgAdminsOnDataUpload: recipient count capped by feature flag",
      {
        organizationId,
        total: admins.length,
        capped: maxRecipients,
      }
    );
  }

  for (const admin of cappedAdmins) {
    try {
      const subject = applyVariables(template.subject, {
        UserName: admin.name,
        activityName: resolvedActivityName,
      });
      const body = applyVariables(template.template, {
        UserName: admin.name,
        activityName: resolvedActivityName,
        reset: ctaLink,
        HeaderContent: emailHeader,
        copyrightYear,
        excelDownloadUrl,
      });
      const result = await sendEmail({
        to: admin.email,
        cc: template.cc_emails ?? [],
        bcc: template.bcc_emails ?? [],
        preparedEmaiTemplate: { subject, content: body },
      });

      await saveEmailLog([
        {
          emailTemplate: template as any,
          preparedEmaiTemplate: { content: body },
          result: result?.data ?? null,
          error: result.success ? undefined : serializeError(result.error),
          userEmail: admin.email,
          userId: admin.id,
          cc: template.cc_emails ?? [],
        },
      ]);
    } catch (err) {
      logger.error("notifyOrgAdminsOnDataUpload: failed for admin", {
        adminId: admin.id,
        organizationId,
        uploaderUserId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

// ─── US-9: Data Approved → notify Location Executives ─────────────────────────

export interface NotifyLocationExecutivesOnApprovalParams {
  organizationId: string;
  /** Locations actually approved (already intersected with session.mappings). */
  effectiveLocationIds: string[];
  activityCode: string;
  /** Reserved for Scenario I (Approved-by name) when deep links are implemented. */
  approverUserId: string;
  /** Reserved for period label when deep links are implemented. */
  approveParams: ApproveParams;
}

/**
 * Sends one email per unique Location Executive across all approved locations.
 * Non-blocking — always call with .catch().
 */
export async function notifyLocationExecutivesOnApproval(
  params: NotifyLocationExecutivesOnApprovalParams
): Promise<void> {
  const { organizationId, effectiveLocationIds, activityCode } = params;

  if (!effectiveLocationIds.length) {
    logger.info("notifyLocationExecutivesOnApproval: no location IDs — skipping", {
      organizationId,
      activityCode,
    });
    return;
  }

  const emailFlagsMap = await fetchEmailFeatureFlags([organizationId]);
  const orgEmailFlags = emailFlagsMap.get(organizationId);

  if (!checkEmailEnabled(orgEmailFlags, MASEmailTemplateCodes.DataApproved)) {
    logger.info(
      "notifyLocationExecutivesOnApproval: disabled by feature flag",
      {
        organizationId,
        templateCode: MASEmailTemplateCodes.DataApproved,
      }
    );
    return;
  }

  const maxRecipients = getMaxRecipients(orgEmailFlags);

  const [templateData, env, emailHeader] = await Promise.all([
    fetchEmailTemplate(MASEmailTemplateCodes.DataApproved),
    getServerEnv(),
    dynamicEmailHeader(organizationId),
  ]);

  const template = templateData.EmailTemplates?.[0];
  if (!template) {
    logger.warn(
      "notifyLocationExecutivesOnApproval: email template not found",
      {
        code: MASEmailTemplateCodes.DataApproved,
        organizationId,
      }
    );
    return;
  }

  const ctaLink = `${env.NEXT_PUBLIC_SITE_URL}login?returnUrl=${encodeURIComponent(`${env.NEXT_PUBLIC_SITE_URL}data-upload-logs`)}`; // ← US-9: approval CTA
  const copyrightYear = new Date().getFullYear().toString();

  // Resolve shared data once: activity name, location names, and the full set of
  // approved location×month pairs. Each exec's Excel is then filtered from this.
  const { year, months: approvedMonths } = params.approveParams;
  let resolvedActivityName = "";
  let locationNamesMap = new Map<string, string>();
  let allLocationMonthPairs: Array<{ locationId: string; month: string }> = [];
  try {
    const [namesMap, activityNameResolved] = await Promise.all([
      fetchLocationNames(effectiveLocationIds),
      fetchActivityNameByCode(activityCode),
    ]);
    resolvedActivityName = activityNameResolved;
    // Display override: legacy DB value "Grid Power Details" is shown as
    // "Energy-Grid" in user-facing emails. Keeps DB intact.
    if (resolvedActivityName === "Grid Power Details") {
      resolvedActivityName = "Energy-Grid";
    }
    locationNamesMap = namesMap;

    if (approvedMonths.length) {
      allLocationMonthPairs = effectiveLocationIds.flatMap((locationId) =>
        approvedMonths.map((m) => ({ locationId, month: m }))
      );
    } else {
      allLocationMonthPairs = await fetchApprovedMonthsForLocations(
        effectiveLocationIds,
        activityCode,
        year
      );
    }
  } catch (err) {
    logger.warn("notifyLocationExecutivesOnApproval: pre-flight data fetch failed", {
      organizationId,
      activityCode,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Collect unique LEs and track which approved locations each LE covers.
  // execLocationMap is used to filter the Excel to only that exec's locations.
  const uniqueExecs = new Map<string, SimpleUser>();
  const execLocationMap = new Map<string, string[]>();
  for (const locationId of effectiveLocationIds) {
    try {
      const execs = await fetchLocationExecutives(locationId, activityCode);
      for (const exec of execs) {
        if (!uniqueExecs.has(exec.id)) uniqueExecs.set(exec.id, exec);
        const existing = execLocationMap.get(exec.id) ?? [];
        existing.push(locationId);
        execLocationMap.set(exec.id, existing);
      }
    } catch (err) {
      logger.error(
        "notifyLocationExecutivesOnApproval: fetch failed for location",
        {
          locationId,
          activityCode,
          error: err instanceof Error ? err.message : String(err),
        }
      );
    }
  }

  if (!uniqueExecs.size) {
    logger.info(
      "notifyLocationExecutivesOnApproval: no active LocationExecutive found",
      {
        effectiveLocationIds,
        activityCode,
      }
    );
    return;
  }

  const allExecs = [...uniqueExecs.values()];
  const cappedExecs =
    maxRecipients != null ? allExecs.slice(0, maxRecipients) : allExecs;
  if (maxRecipients != null && allExecs.length > maxRecipients) {
    logger.info(
      "notifyLocationExecutivesOnApproval: recipient count capped by feature flag",
      {
        organizationId,
        activityCode,
        total: allExecs.length,
        capped: maxRecipients,
      }
    );
  }

  for (const exec of cappedExecs) {
    try {
      // Build an Excel scoped to only this exec's approved locations so they
      // don't see records from locations they don't own.
      const execLocationIds = new Set(execLocationMap.get(exec.id) ?? []);
      const execRows: ActivityExcelRow[] = allLocationMonthPairs
        .filter(({ locationId }) => execLocationIds.has(locationId))
        .map(({ locationId, month }) => ({
          Location: locationNamesMap.get(locationId) ?? "",
          Activity: resolvedActivityName,
          Year: year,
          Month: month.charAt(0).toUpperCase() + month.slice(1).toLowerCase(),
        }));
      const excelDownloadUrl = await generateAndUploadEmailExcel(organizationId, execRows).catch(
        (err) => {
          logger.warn("notifyLocationExecutivesOnApproval: per-exec Excel upload failed", {
            execId: exec.id,
            activityCode,
            error: err instanceof Error ? err.message : String(err),
          });
          return "";
        }
      );

      const subject = applyVariables(template.subject, {
        UserName: exec.name,
        activityName: resolvedActivityName,
      });
      const body = applyVariables(template.template, {
        UserName: exec.name,
        activityName: resolvedActivityName,
        reset: ctaLink,
        HeaderContent: emailHeader,
        copyrightYear,
        excelDownloadUrl,
      });

      const result = await sendEmail({
        to: exec.email,
        cc: template.cc_emails ?? [],
        bcc: template.bcc_emails ?? [],
        preparedEmaiTemplate: { subject, content: body },
      });

      if (!result.success) {
        logger.error("notifyLocationExecutivesOnApproval: sendEmail failed", {
          execEmail: exec.email,
          activityCode,
          error: serializeError(result.error),
        });
      }

      await saveEmailLog([
        {
          emailTemplate: template as any,
          preparedEmaiTemplate: { content: body },
          result: result?.data ?? null,
          error: result.success ? undefined : serializeError(result.error),
          userEmail: exec.email,
          userId: exec.id,
        },
      ]);
    } catch (err) {
      logger.error(
        "notifyLocationExecutivesOnApproval: send failed for executive",
        {
          execId: exec.id,
          activityCode,
          error: err instanceof Error ? err.message : String(err),
        }
      );
    }
  }
}

// ─── US-10 & US-11: Scheduled upload-pending reminders ────────────────────────

/**
 * Sends one reminder email per LocationExecutive who has any pending upload
 * for the previous calendar month.
 *
 * CRON routes:
 *   POST /api/v1/webhooks/reminders/upload-pending-first   → "1st"
 *   POST /api/v1/webhooks/reminders/upload-pending-tenth   → "10th"
 *
 * Scenario G: all Org Admins are CC'd on every reminder.
 */
export async function sendUploadPendingReminders(
  reminderType: ReminderType
): Promise<void> {
  const templateCode =
    reminderType === "1st"
      ? MASEmailTemplateCodes.UploadPendingReminder1st
      : MASEmailTemplateCodes.UploadPendingReminder10th;

  const monthDisplay = getPreviousMonthDisplayName();

  const [pendingUsers, templateData, env] = await Promise.all([
    fetchPendingUsers(),
    fetchEmailTemplate(templateCode),
    getServerEnv(),
  ]);

  const template = templateData.EmailTemplates?.[0];
  if (!template) {
    logger.error("sendUploadPendingReminders: email template not found", {
      code: templateCode,
    });
    return;
  }

  if (!pendingUsers.length) {
    logger.info(
      "sendUploadPendingReminders: no pending users — nothing to send",
      {
        reminderType,
        monthDisplay,
      }
    );
    return;
  }

  // Batch-fetch Org Admins and email headers once per unique org (Scenario G).
  const uniqueOrgIds = [...new Set(pendingUsers.map((u) => u.organizationId))];
  const orgAdminsMap = new Map<string, SimpleUser[]>();
  const orgHeadersMap = new Map<string, string>();
  await Promise.all(
    uniqueOrgIds.map(async (orgId) => {
      const [admins, header] = await Promise.all([
        fetchOrgAdmins(orgId),
        dynamicEmailHeader(orgId),
      ]);
      orgAdminsMap.set(orgId, admins);
      orgHeadersMap.set(orgId, header);
    })
  );

  // Batch-fetch email feature flags once for all orgs.
  const emailFlagsMap = await fetchEmailFeatureFlags(uniqueOrgIds);

  // Fetch all pending combos for every user in one query instead of N queries.
  const allPendingCombosMap = await fetchAllPendingCombosForUsers(
    pendingUsers.map((u) => u.userId)
  );

  const ctaLink = `${env.NEXT_PUBLIC_SITE_URL}login?returnUrl=${encodeURIComponent(`${env.NEXT_PUBLIC_SITE_URL}data-upload-logs`)}`; // ← US-10/11 reminder CTA
  const copyrightYear = new Date().getFullYear().toString();

  let successCount = 0;
  // Tracks emails sent per org in this run to enforce the max_recipients cap.
  const orgSentCountMap = new Map<string, number>();

  for (const user of pendingUsers) {
    const orgAdmins = orgAdminsMap.get(user.organizationId) ?? [];
    const emailHeader = orgHeadersMap.get(user.organizationId) ?? "";

    // Check per-org email feature flag for this reminder template.
    // Only send if the flag row exists and the key is explicitly true.
    const orgFlags = emailFlagsMap.get(user.organizationId);
    if (!checkEmailEnabled(orgFlags, templateCode)) {
      logger.info(
        "sendUploadPendingReminders: disabled by feature flag for org",
        {
          organizationId: user.organizationId,
          templateCode,
          reminderType,
        }
      );
      continue;
    }

    // Enforce per-org max_recipients cap.
    const maxRecipients = getMaxRecipients(orgFlags);
    const sentCount = orgSentCountMap.get(user.organizationId) ?? 0;
    if (maxRecipients != null && sentCount >= maxRecipients) {
      logger.info("sendUploadPendingReminders: per-org recipient cap reached", {
        organizationId: user.organizationId,
        reminderType,
        cap: maxRecipients,
      });
      continue;
    }

    // Scenario G: CC all Org Admins on the 10th reminder only.
    const ccEmails = [
      ...(template.cc_emails ?? []),
      ...(reminderType === "10th" ? orgAdmins.map((a) => a.email) : []),
    ];

    // Generate a per-user Excel listing their specific pending combos.
    let excelDownloadUrl = "";
    try {
      const pendingCombos = allPendingCombosMap.get(user.userId) ?? [];
      const excelRows: ActivityExcelRow[] = pendingCombos.map((combo) => ({
        Location: combo.locationName,
        Activity: combo.activityName,
        Year: combo.year,
        Month: combo.month,
      }));
      excelDownloadUrl = await generateAndUploadEmailExcel(
        user.organizationId,
        excelRows
      );
      console.log("Generated Excel URL for user", {
        userId: user.userId,
        organizationId: user.organizationId,
        excelDownloadUrl,
      });
    } catch (err) {
      logger.warn("sendUploadPendingReminders: Excel generation failed", {
        userId: user.userId,
        organizationId: user.organizationId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    try {
      const subject = applyVariables(template.subject, {
        UserName: user.userName,
      });
      const body = applyVariables(template.template, {
        UserName: user.userName,
        reset: ctaLink,
        monthYear: monthDisplay,
        HeaderContent: emailHeader,
        copyrightYear,
        excelDownloadUrl,
      });

      const result = await sendEmail({
        to: user.userEmail,
        cc: ccEmails,
        bcc: template.bcc_emails ?? [],
        preparedEmaiTemplate: { subject, content: body },
      });

      await saveEmailLog([
        {
          emailTemplate: template as any,
          preparedEmaiTemplate: { content: body },
          result: result?.data ?? null,
          error: result.success ? undefined : serializeError(result.error),
          userEmail: user.userEmail,
          userId: user.userId,
        },
      ]);

      orgSentCountMap.set(
        user.organizationId,
        (orgSentCountMap.get(user.organizationId) ?? 0) + 1
      );
      successCount++;
    } catch (err) {
      logger.error("sendUploadPendingReminders: send failed", {
        reminderType,
        userId: user.userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("sendUploadPendingReminders: completed", {
    reminderType,
    monthDisplay,
    totalUsers: pendingUsers.length,
    successCount,
  });
}
