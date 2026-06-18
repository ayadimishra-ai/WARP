export type TabType = "activity_type" | "location_wise";
export type YearType = "financial" | "calendar";

export interface SummaryParams {
  tab: TabType;
  locationIds: string[]; // empty = all user-accessible locations
  year: number;
  yearType: YearType;
  months: string[]; // lowercase month names, empty = all 12
  pageIndex: number;
  pageSize: number;
  /**
   * Free-text search string — only applied on the location_wise tab.
   * Filters both locationName and activityName (server-side ILIKE).
   * Absent or empty string = no search filter.
   */
  search?: string;
  /**
   * Optional status filter driven by clicking a summary badge.
   * "pending"  → only rows with pending > 0
   * "approved" → only rows with approved > 0
   * null / absent → no status filter
   */
  statusFilter?: "pending" | "approved" | null;
}

export interface StatusCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface TaskRequestRow {
  activityCode: string;
  activityName: string;
  locationId?: string; // location_wise tab only
  locationName?: string; // location_wise tab only
  totalRecords: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SummaryResponse {
  summary: StatusCounts;
  rows: TaskRequestRow[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface FilterLocation {
  id: string;
  name: string;
}

export interface FilterYear {
  value: string; // e.g. "2025"
  label: string; // e.g. "April 2025 to March 2026"
}

export interface FiltersResponse {
  locations: FilterLocation[];
  years: FilterYear[];
  financialYearStartMonth: number; // 1-based (1=Jan, 4=Apr)
  yearType: YearType;
  defaultYear: number; // FY start year of the latest year that has data (or current FY)
  // Lowercase full month name of the most recent month with data (e.g. "april").
  // null when no records exist. Optional so removing it from the API response
  // silently reverts the UI to no-month-preselection without breaking anything.
  defaultMonth: string | null;
  // Lowercase month names that have at least one record in the selected year.
  // Empty array when no data exists. Used to style month tiles in the filter bar.
  monthsWithData: string[];
}

// ─── Approve ──────────────────────────────────────────────────────────────────

export interface ApproveParams {
  activityCode: string;
  locationIds: string[]; // empty = all user-accessible locations
  year: number;
  yearType: YearType;
  months: string[]; // lowercase month names, empty = all 12
}

export interface ApproveResponse {
  approvedCount: number;
  approvedLocationIds: string[]; // location IDs that had records actually approved in this call
  startMonth: number; // org's FY start month (1=Jan, 4=Apr); needed to map FY months to calendar years
}

// ─── Export ──────────────────────────────────────────────────────────────────

export interface ExportParams {
  activityCode: string;
  activityName: string;
  locationIds: string[]; // empty = all user-accessible locations
  year: number;
  yearType: YearType;
  months: string[]; // lowercase month names, empty = all 12
  statusFilter?: "pending" | "approved" | null;
  clientDateTime?: string; // ISO 8601 from the browser; used for the file-name timestamp
}

export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
}
