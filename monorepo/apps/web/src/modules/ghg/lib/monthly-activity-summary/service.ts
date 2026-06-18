import { unstable_cache } from "next/cache";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { isOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import {
  approveActivityTaskRequests,
  queryDistinctDataYears,
  queryLatestDataMonth,
  queryLatestDataYear,
  queryLocations,
  queryMonthsWithData,
  queryTaskRequestSummary,
  YearMonthFilterParams,
} from "./queries";
import { queryTaskRequestSummaryFromCache } from "./cache-queries";
import {
  ApproveParams,
  ApproveResponse,
  FiltersResponse,
  FilterYear,
  StatusCounts,
  SummaryParams,
  SummaryResponse,
  TaskRequestRow,
  YearType,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts FinancialYearMonth to a 1-based month number.
 * The DB stores it as a full month name (e.g. "April"), NOT a number.
 */
const MONTH_NAME_TO_NUM: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function parseFinancialYearStartMonth(
  value: string | null | undefined
): number {
  if (!value) return 4; // default: April
  // Handle numeric strings like "4"
  const asInt = parseInt(value, 10);
  if (!isNaN(asInt) && asInt >= 1 && asInt <= 12) return asInt;
  // Handle month name strings like "April"
  return MONTH_NAME_TO_NUM[value.toLowerCase()] ?? 4;
}

// ─── Org data ──────────────────────────────────────────────────────────────────

async function fetchOrgData(organizationId: string) {
  const sdk = await getGraphQlServerSDK();
  const result = await sdk.getOrgData({ organizationId });
  return result.Organization?.[0] ?? null;
}

// ─── Year options builder ──────────────────────────────────────────────────────

/**
 * Builds year select options from a pre-computed list of FY start years that
 * actually have data in the DB. Only years present in `dataYears` are included,
 * so the dropdown never shows empty periods. Sorted descending (newest first).
 *
 * Financial year (startMonth=4):
 *   { value: "2025", label: "April 2025 to March 2026" }
 *
 * Calendar year (startMonth=1):
 *   { value: "2025", label: "2025" }
 */
function buildYearOptions(
  dataYears: number[],
  startMonth: number,
  yearType: YearType
): FilterYear[] {
  if (dataYears.length === 0) return [];

  if (yearType === "financial" && startMonth !== 1) {
    const startMonthName = new Date(2000, startMonth - 1, 1).toLocaleString(
      "en-US",
      { month: "long" }
    );
    const endMonthIdx = startMonth - 2; // 0-based index of last month in FY
    const endMonthName = new Date(2000, endMonthIdx, 1).toLocaleString(
      "en-US",
      { month: "long" }
    );

    return dataYears.map((year) => ({
      value: String(year),
      label: `${startMonthName} ${year} to ${endMonthName} ${year + 1}`,
    }));
  }

  return dataYears.map((year) => ({
    value: String(year),
    label: String(year),
  }));
}

// ─── Current default year ──────────────────────────────────────────────────────

/** Returns a list of all years from BaselineYear to current year, inclusive. If BaselineYear is null/undefined, returns only current year. */
function BaselinetoCurrentyearlist(BaselineYear: number | null | undefined, startMonth: number, yearType: YearType): number[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  
  let currentYear = y;
  if (yearType === "financial" && startMonth !== 1) {
    currentYear = m >= startMonth ? y : y - 1;
  }
  
  // If baseline year is null/undefined/blank, return only current year
  if (!BaselineYear) {
    return [currentYear];
  }
  
  // Generate array of years from baseline to current year
  const years: number[] = [];
  const startYear = BaselineYear;
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
}

// ─── Cache tag helpers ────────────────────────────────────────────────────────

/**
 * Returns the Next.js cache tag used to scope summary query results per org.
 * Used both when writing to cache (unstable_cache) and when busting it
 * (revalidateTag after an approve action).
 */
export function summaryCacheTag(organizationId: string): string {
  return `monthly-summary:${organizationId}`;
}

/**
 * Returns the Next.js cache tag used to scope filter results per org.
 * Shared by both the initial load and year-change calls so that a new upload
 * or approve that changes available years/months can be busted together.
 */
export function filtersCacheTag(organizationId: string): string {
  return `monthly-filters:${organizationId}`;
}

// ─── Filters cache TTL ────────────────────────────────────────────────────────
//
// Filters (locations, year list, monthsWithData) change only when new data is
// uploaded or approved — both are relatively infrequent compared to summary
// queries.  30 seconds gives a meaningful speedup for repeated page loads /
// year switches without ever showing stale data for more than half a minute.
// The tag lets us bust early when needed (e.g. after approve).
const FILTERS_CACHE_TTL_SECONDS = 30;

// ─── Cached summary query wrapper ─────────────────────────────────────────────

/**
 * Cache TTL for the summary query in seconds.
 *
 * 5 seconds is deliberately short:
 *  - Prevents hammering the DB on rapid filter changes / tab switches
 *  - Data never feels stale to the user (approval or upload reflects
 *    within one cache cycle at most)
 *  - The approve route explicitly calls revalidateTag() so the cache
 *    is busted immediately after any approval, making the TTL a safety
 *    net for bulk-upload changes only
 */
const SUMMARY_CACHE_TTL_SECONDS = 5;

/**
 * Builds a unique cache key that identifies one specific summary query.
 *
 * The key encodes every dimension that affects the query result:
 *   org + locations (post-intersection) + year + yearType + months + tab + page
 *
 * IMPORTANT: effectiveLocationIds (already intersected with session.mappings)
 * are used here — NOT the raw client-supplied locationIds — so two users
 * with different location access in the same org can never see each other's
 * data through a shared cache entry.
 *
 * Pros:
 * Debounce effect →	Rapid filter changes (user clicks year, then month, then tab quickly) don't hammer the DB for the same combination
 * Tag-based bust	Approve → instant invalidation. No stale data after approval.
 * Scoped by user → effectiveLocationIds (post-permission-intersection) and activityCodes are in the key, so two users in the same org with different access never share a cache entry
 * No infrastructure	Run  → Runs in the Next.js server process memory — no Redis or external cache needed
 */
function buildSummaryCacheKey(
  organizationId: string,
  effectiveLocationIds: string[],
  yearMonthFilter: YearMonthFilterParams,
  tab: string,
  pageIndex: number,
  pageSize: number,
  activityCodes: string[] | undefined,
  search: string | undefined,
  statusFilter: string | null | undefined
): string[] {
  return [
    "monthly-summary",
    organizationId,
    [...effectiveLocationIds].sort().join(","), // sort for stable key regardless of client order
    String(yearMonthFilter.year),
    yearMonthFilter.yearType,
    String(yearMonthFilter.startMonth),
    [...yearMonthFilter.months].sort().join(","),
    tab,
    String(pageIndex),
    String(pageSize),
    // Include activity codes in cache key so location-executives with different
    // activity permissions never share a cache entry.
    activityCodes !== undefined
      ? [...activityCodes].sort().join(",")
      : "__org__",
    // Include search so different search queries get separate cache entries.
    search && search.trim().length > 0
      ? search.trim().toLowerCase()
      : "__no_search__",
    // Include statusFilter so different status filters get separate cache entries.
    statusFilter ? statusFilter : "__all__",
  ];
}

/**
 * Thin async wrapper around queryTaskRequestSummary so that unstable_cache
 * can wrap a plain serialisable function (no class instances or closures).
 */
async function runSummaryQuery(
  params: Parameters<typeof queryTaskRequestSummary>[0]
) {
  return queryTaskRequestSummary(params);
}

/**
 * Thin async wrapper around queryTaskRequestSummaryFromCache so that
 * unstable_cache can wrap a plain serialisable function.
 */
async function runCacheSummaryQuery(
  params: Parameters<typeof queryTaskRequestSummaryFromCache>[0]
) {
  return queryTaskRequestSummaryFromCache(params);
}

function toStatusCounts(row: any): StatusCounts {
  return {
    total: Number(row?.summary_total ?? 0),
    pending: Number(row?.summary_pending ?? 0),
    approved: Number(row?.summary_approved ?? 0),
    rejected: Number(row?.summary_rejected ?? 0),
  };
}

const EMPTY_SUMMARY: StatusCounts = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

// ─── Public service functions ──────────────────────────────────────────────────

/**
 * Returns filter options for the UI (locations, year list, yearType).
 * Called once on page mount and again when the user changes the year dropdown.
 *
 * Cached per (org × user-locations × yearOverride) for 30 seconds.
 * Two separate cache paths:
 *   1. Initial load  (yearOverride = undefined) — heavy: locations + year list +
 *      latestDataYear + defaultMonth + monthsWithData.
 *   2. Year change   (yearOverride = <number>)  — lighter: only defaultMonth +
 *      monthsWithData change; locations/years/yearType are the same.
 *
 * The cache does NOT affect correctness of filter changes — it only caches the
 * DB reads that build the static option lists.  User-driven filter selections
 * (selectedLocations, selectedMonths, selectedYear) live entirely in client
 * state and are never cached.
 */
export async function getFilters(
  session: TUserSession,
  yearOverride?: number,
  locationIds?: string[]
): Promise<FiltersResponse> {
  const addressIds = (session.mappings ?? []).map(
    (m) => m.organization_address_id
  );

  // Intersect client-supplied locationIds with the user's accessible addresses
  // so the monthsWithData scope matches what the summary table will actually show.
  // If no locationIds are supplied (or the list is empty), fall back to all addresses.
  const effectiveAddressIds =
    locationIds && locationIds.length > 0
      ? locationIds.filter((id) => addressIds.includes(id))
      : addressIds;

  // Cache key encodes every dimension that affects the result.
  // addressIds are sorted so two users with the same locations in different
  // order share a cache entry.
  const cacheKey = [
    "monthly-filters",
    session.organizationId,
    [...addressIds].sort().join(","),
    [...effectiveAddressIds].sort().join(","),
    String(yearOverride ?? "default"),
  ];

  return unstable_cache(
    () => _getFiltersUncached(session, yearOverride, effectiveAddressIds),
    cacheKey,
    {
      revalidate: FILTERS_CACHE_TTL_SECONDS,
      tags: [filtersCacheTag(session.organizationId)],
    }
  )();
}

/** Internal uncached implementation — called only by the cached wrapper above. */
async function _getFiltersUncached(
  session: TUserSession,
  yearOverride?: number,
  effectiveAddressIds?: string[]
): Promise<FiltersResponse> {
  const orgData = await fetchOrgData(session.organizationId);

  const startMonth = parseFinancialYearStartMonth(
    orgData?.FinancialYearMonth as string | null
  );

  // Determine YEAR TYPE based on financial year start month:
  // if it starts in January, it's a calendar year;
  // otherwise, it's a financial year.
  const yearType: YearType = startMonth === 1 ? "calendar" : "financial";

  const addressIds = (session.mappings ?? []).map(
    (m) => m.organization_address_id
  );

  // Locations, year list, and latest data year are always scoped to ALL user
  // addresses so the dropdowns remain stable regardless of which locations are
  // selected.  Only monthsWithData and defaultMonth are scoped to the caller's
  // effective selection so the month tiles reflect real availability.
  const scopedAddressIds = effectiveAddressIds ?? addressIds;

  const [locationRows, dataYears, latestDataYear] = await Promise.all([
    queryLocations(session.organizationId, addressIds),
    queryDistinctDataYears(session.organizationId, addressIds, startMonth),
    queryLatestDataYear(session.organizationId, addressIds, startMonth),
  ]);

  const locations = (locationRows as any[]).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));

  // Default to the latest year that has real data; fall back to the current FY.
  // Get the current year from the range of available years.
  const availableYearRange = BaselinetoCurrentyearlist(
    orgData?.Baselineyear,
    startMonth,
    yearType
  );
  const currentYear =
    availableYearRange[availableYearRange.length - 1] ??
    new Date().getFullYear();
  const defaultYear = latestDataYear ?? currentYear;

  // Always return years from baseline->current range.
  const years = buildYearOptions(availableYearRange, startMonth, yearType);

  // For monthsWithData, use yearOverride if provided (user changed year dropdown),
  // otherwise use the default year.
  const yearForMonths = yearOverride ?? defaultYear;

  // Find the latest month with data in the default year.
  // Runs after defaultYear is resolved so the year filter is accurate.
  // scopedAddressIds limits results to the caller's selected locations so that
  // month tiles only turn green when the selected location(s) actually have data.
  // To revert to no-month-preselection: remove this call and set defaultMonth: null.
  const [defaultMonth, monthsWithData] = await Promise.all([
    queryLatestDataMonth(session.organizationId, scopedAddressIds, {
      year: yearForMonths,
      yearType,
      startMonth,
      months: [],
    }),
    queryMonthsWithData(session.organizationId, scopedAddressIds, {
      year: yearForMonths,
      yearType,
      startMonth,
      months: [],
    }),
  ]);

  return {
    locations,
    years,
    financialYearStartMonth: startMonth,
    yearType,
    defaultYear,
    defaultMonth,
    monthsWithData,
  };
}

/**
 * Returns aggregated summary data for the requested tab and filters.
 * Called whenever the user changes a filter or switches tabs.
 */
export async function getSummaryData(
  session: TUserSession,
  params: SummaryParams
): Promise<SummaryResponse> {
  // Resolve org settings for year filter
  const orgData = await fetchOrgData(session.organizationId);
  const startMonth = parseFinancialYearStartMonth(
    orgData?.FinancialYearMonth as string | null
  );

  // Resolve effective location IDs (intersection of user access + selection)
  const userAddressIds = session.mappings.map((m) => m.organization_address_id);
  const effectiveLocationIds =
    params.locationIds.length > 0
      ? params.locationIds.filter((id) => userAddressIds.includes(id))
      : userAddressIds;

  if (effectiveLocationIds.length === 0) {
    return {
      summary: EMPTY_SUMMARY,
      rows: [],
      totalCount: 0,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    };
  }

  // Get the current year from the available year range
  const yearRange = BaselinetoCurrentyearlist(orgData?.Baselineyear, startMonth, params.yearType);
  const currentYear = yearRange[yearRange.length - 1] ?? new Date().getFullYear();

  const yearMonthFilter: YearMonthFilterParams = {
    year: params.year || currentYear,
    yearType: params.yearType,
    startMonth,
    months: params.months,
  };

  // Determine which activities to include in the summary:
  //   - org-admin: undefined → query uses OrganizationActivityMapping (all org activities)
  //   - location-executive: deduplicated list from session.mappings[].activities
  const activityCodes = isOrganizationAdmin(session.userRole)
    ? undefined
    : [...new Set(session.mappings.flatMap((m) => m.activities ?? []))];

  // Cache key — uniquely identifies this exact query combination.
  // Using effectiveLocationIds (post-intersection) is critical for security:
  // two users in the same org with different location access must not share
  // a cache entry. activityCodes ensures location-executives with different
  // activity permissions also get separate cache entries.
  const summaryCacheKey = buildSummaryCacheKey(
    session.organizationId,
    effectiveLocationIds,
    yearMonthFilter,
    params.tab,
    params.pageIndex,
    params.pageSize,
    activityCodes,
    params.search,
    params.statusFilter
  );

  let rawRows: any[] = [];
  try {
    rawRows = (await unstable_cache(
      () =>
        runCacheSummaryQuery({
          organizationId: session.organizationId,
          effectiveLocationIds,
          yearMonthFilter,
          tab: params.tab,
          pageIndex: params.pageIndex,
          pageSize: params.pageSize,
          activityCodes,
          search: params.search,
          statusFilter: params.statusFilter,
        }),
      summaryCacheKey,
      {
        revalidate: SUMMARY_CACHE_TTL_SECONDS,
        tags: [summaryCacheTag(session.organizationId)],
      }
    )()) as any[];
  } catch (err) {
    console.error(
      "[summary-cache] cache query failed, falling back to live query:",
      err
    );
    rawRows = (await runSummaryQuery({
      organizationId: session.organizationId,
      effectiveLocationIds,
      yearMonthFilter,
      tab: params.tab,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      activityCodes,
      search: params.search,
      statusFilter: params.statusFilter,
    })) as any[];
  }

  // The final SELECT uses summary_counts (1 row) LEFT JOIN grouped so the
  // summary badge totals are preserved even when grouped is empty (e.g. user
  // clicks "Pending For Approval" but every record is already approved). In
  // that case the single returned row has NULL activity_code — drop it here
  // so the table renders "No records to display".
  const rows: TaskRequestRow[] = rawRows
    .filter((r) => r.activity_code != null)
    .map((r) => ({
      activityCode: String(r.activity_code),
      activityName: String(r.activity_name),
      ...(params.tab === "location_wise" && {
        locationId: String(r.location_id),
        locationName: String(r.location_name),
      }),
      totalRecords: Number(r.total_records),
      pending: Number(r.pending),
      approved: Number(r.approved),
      rejected: Number(r.rejected),
    }));

  const summary =
    rawRows.length > 0 ? toStatusCounts(rawRows[0]) : EMPTY_SUMMARY;
  const totalCount = rawRows.length > 0 ? Number(rawRows[0].total_count) : 0;

  return {
    summary,
    rows,
    totalCount,
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
  };
}

/**
 * Approves all pending ActivityTaskRequest records for a given activity,
 * scoped to the active filters (year, months, locations).
 *
 * RULE-001: Caller must verify the user is OrganizationAdmin before calling.
 * RULE-002: Bulk operation — all pending records within the filter scope are approved.
 * RULE-004: locationIds are intersected with session.mappings server-side.
 */
export async function approveActivity(
  session: TUserSession,
  params: ApproveParams
): Promise<ApproveResponse> {
  const orgData = await fetchOrgData(session.organizationId);
  const startMonth = parseFinancialYearStartMonth(
    orgData?.FinancialYearMonth as string | null
  );

  // RULE-004: intersect client-supplied locationIds with user's accessible addresses
  const userAddressIds = session.mappings.map((m) => m.organization_address_id);
  const effectiveLocationIds =
    params.locationIds.length > 0
      ? params.locationIds.filter((id) => userAddressIds.includes(id))
      : userAddressIds;

  if (effectiveLocationIds.length === 0) {
    return { approvedCount: 0, approvedLocationIds: [], startMonth };
  }

  // Get the current year from the available year range
  const yearRange = BaselinetoCurrentyearlist(orgData?.Baselineyear, startMonth, params.yearType);
  const currentYear = yearRange[yearRange.length - 1] ?? new Date().getFullYear();

  const yearMonthFilter: YearMonthFilterParams = {
    year: params.year || currentYear,
    yearType: params.yearType,
    startMonth,
    months: params.months,
  };

  const { approvedCount, approvedLocationIds } = await approveActivityTaskRequests({
    organizationId: session.organizationId,
    effectiveLocationIds,
    activityCode: params.activityCode,
    yearMonthFilter,
    approvingUserId: session.userId,
  });

  return { approvedCount, approvedLocationIds, startMonth };
}
