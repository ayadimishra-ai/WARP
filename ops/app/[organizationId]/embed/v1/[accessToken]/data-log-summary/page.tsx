"use client";

import {
  ActionIcon,
  Autocomplete,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Loader,
  Paper,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import {
  IconCheck,
  IconDownload,
  IconFileAnalytics,
  IconSearch,
} from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUserSession } from "~/hooks/use-user-session";
import { useWarpContentSize } from "~/hooks/use-warp-content-size";
import {
  getUserRoleFromToken,
  ROLE_LOCATION_EXECUTIVE,
  ROLE_ORGANIZATION_ADMIN,
} from "~/utils/jwt/getUserDataFromToken";
import MainFilterBlock from "./MainFilterBlock";
import {
  MONTH_BADGE_TO_FULL,
  MONTH_FULL_TO_BADGE,
} from "./MainFilterBlockUtils";

import { apiClientWithAuth } from "~/lib/fetcher";

// ─── Types ────────────────────────────────────────────────────────────────────

type TStatus = "pending" | "approved" | "rejected";
type TabType = "activity_type" | "location_wise";

type TStatusCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

type TActivityRow = {
  activityCode: string;
  activityName: string;
  totalRecords: number;
  pending: number;
  approved: number;
  rejected: number;
};

type TLocationRow = {
  locationId: string;
  locationName: string;
  activityCode: string;
  activityName: string;
  totalRecords: number;
  pending: number;
  approved: number;
  rejected: number;
};

type TFilterData = {
  locations: { id: string; name: string }[];
  years: { value: string; label: string }[];
  financialYearStartMonth: number;
  yearType: "financial" | "calendar";
  defaultYear: number;
  // Lowercase full month name e.g. "april". Absent or null → no month pre-selected.
  defaultMonth?: string | null;
  // Lowercase month names that have at least one record in the selected year.
  monthsWithData: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Shape of the payload we encode into ?filters= server-side (see
// notifyOrgAdminsOnDataUpload in monthly-activity-summary-email.service.ts).
// Empty string / 0 indicate "field was unknown at email-send time" and are
// treated as absent here.
type TUrlFilters = {
  organizationAddressId?: string;
  activityName?: string;
  /**
   * All uploaded months from the email payload, latest first.
   * months[0] is the anchor used for calendar→financial-year conversion.
   */
  months?: string[];
  year?: number;
};

// Decodes a base64url-encoded JSON payload from ?filters=<…> into a TUrlFilters.
// Returns null when the param is missing, malformed, or not a JSON object.
const decodeUrlFilters = (): TUrlFilters | null => {
  if (typeof window === "undefined") return null;
  const encoded = new URLSearchParams(window.location.search).get("filters");
  if (!encoded) return null;
  try {
    // base64url → standard base64: swap chars and add the right amount of '=' padding.
    const standard = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = standard + "===".slice((standard.length + 3) % 4);
    const parsed = JSON.parse(atob(padded));
    return parsed && typeof parsed === "object"
      ? (parsed as TUrlFilters)
      : null;
  } catch {
    return null;
  }
};

// Lower-case full month name → 1-based month number. Used to translate the
// calendar (year, month) pair from the email deep-link into the financial-year
// start year that the data-log-summary year selector expects.
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

/**
 * Converts the calendar (year, month) pair carried in the email deep-link into
 * the financial-year start year used as the dropdown value.
 *
 *   yearType="calendar" or unknown month → return year unchanged.
 *   yearType="financial" + month before startMonth → year - 1
 *     e.g. January 2025 with FY starting in April → FY 2024-25 → 2024.
 *   yearType="financial" + month at/after startMonth → year unchanged.
 *
 * This mirrors the CASE expression in queryLatestDataYear that produces
 * filterData.defaultYear, so URL-driven and API-driven year values are aligned.
 */
const toFyStartYear = (
  calendarYear: number,
  monthName: string | undefined,
  yearType: "financial" | "calendar",
  financialYearStartMonth: number
): number => {
  if (yearType !== "financial" || !monthName) return calendarYear;
  const monthNum = MONTH_NAME_TO_NUM[monthName.toLowerCase()];
  if (!monthNum) return calendarYear;
  return monthNum < financialYearStartMonth ? calendarYear - 1 : calendarYear;
};

// Strips ?filters= after we've consumed it so a refresh doesn't re-apply the
// deep-link values over user-driven filter changes.
const stripFiltersFromUrl = () => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("filters")) return;
  url.searchParams.delete("filters");
  window.history.replaceState({}, "", url.toString());
};

const dotStyle = (color: string) => ({
  width: 8,
  height: 8,
  borderRadius: 999,
  backgroundColor: color,
});

const statusBadgeColor = (status: TStatus) => {
  if (status === "approved") return { bg: "#DCFCE7", text: "#00a63e" };
  if (status === "rejected") return { bg: "#FEE2E2", text: "#e7000b" };
  return { bg: "#FEF3C7", text: "#d08700" };
};

const StatusValueBadge = ({
  value,
  bg,
  color,
  fw = 400,
}: {
  value: number;
  bg: string;
  color: string;
  fw?: number;
}) => (
  <Badge radius="xl" variant="light" bg={bg} c={color} fz={14} fw={fw}>
    {value}
  </Badge>
);

// ─── Main component ───────────────────────────────────────────────────────────

const DataUploadLogSummary: React.FC = () => {
  const session = useUserSession();
  const params = useParams();
  useWarpContentSize();

  // ── Role detection ─────────────────────────────────────────────────────────
  // x-hasura-allowed-roles is an array at runtime (return type is broadened).
  // OrganizationAdmin → Approve + Export actions visible.
  // LocationExecutive (or any other role) → Export only.
  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isOrgAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);
  // isLocationExecutive kept for future explicit role checks if needed.
  const isLocationExecutive =
    Array.isArray(userRole) && userRole.includes(ROLE_LOCATION_EXECUTIVE);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterData, setFilterData] = useState<TFilterData | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [monthsWithData, setMonthsWithData] = useState<string[]>([]);
  // Status filter — null means "all"; set by clicking a summary badge.
  const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "approved" | null
  >(null);

  // ── Tab + pagination state ──────────────────────────────────────────────────
  // Location executives default to Location Wise so they can export per-location sheets.
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    isLocationExecutive ? "location_wise" : "activity_type"
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ── Approval state — tracks which rows are currently being approved ─────────
  // Key format: "<activityCode>" for activity_type tab,
  //             "<locationId>__<activityCode>" for location_wise tab.
  // Set allows multiple rows to operate independently at the same time.
  const [approvingKeys, setApprovingKeys] = useState<Set<string>>(new Set());

  // ── Export state — tracks which rows are currently being exported ──────────
  const [exportingKeys, setExportingKeys] = useState<Set<string>>(new Set());

  // ── Pending approval — holds row data while SPA confirmation popup is open ──
  const [pendingApproval, setPendingApproval] = useState<{
    activityCode: string;
    rowKey: string;
    locationIds: string[];
  } | null>(null);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState<TStatusCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [activityRows, setActivityRows] = useState<TActivityRow[]>([]);
  const [locationRows, setLocationRows] = useState<TLocationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  // isLoadingFilters starts false — setIsLoadingFilters(true) is called as the
  // very first line inside fetchFilters(), so loading only begins once we know
  // the session is available and the fetch is actually going out.
  // Initialising to true here caused a permanent loading state when session
  // was null on mount (embed context) and the effect early-returned without
  // ever calling setIsLoadingFilters(false).
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ── Location Wise search ────────────────────────────────────────────────────
  // Server-side ILIKE filter on locationName + activityName.
  // The raw input is held in locationSearch for the TextInput.
  // debouncedSearch drives the actual API call so we don’t fire a request
  // on every keystroke — only after the user pauses for 400 ms.
  // Both are cleared automatically when switching back to the Activity Type tab.
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(locationSearch);
      setPageIndex(0); // reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  // ── Derive location options for filter ─────────────────────────────────────
  const locationOptions = useMemo(
    () =>
      (filterData?.locations ?? []).map((l) => ({
        value: l.id,
        label: l.name,
      })),
    [filterData]
  );

  // ── Auth token ─────────────────────────────────────────────────────────────
  const getToken = () =>
    typeof window !== "undefined"
      ? (localStorage.getItem("access_token") ?? "")
      : "";

  // ── Fetch filters on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.organizationId) return;

    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const res = await apiClientWithAuth.get(
          "/api/v1/monthly-activity-summary/filters"
        );
        const json = await res.data;
        if (json.success) {
          const data: TFilterData = json.data;
          setFilterData(data);
          setMonthsWithData(data.monthsWithData ?? []);

          // Deep-link filters from email CTA (?filters=<base64url JSON>).
          // When present, they replace the API-driven defaults below; missing
          // fields fall through to the same defaults a fresh visit would use.
          const urlFilters = decodeUrlFilters();

          // ── Year ──
          // The email payload carries the *calendar* year of the uploaded data
          // (e.g. 2025 for "January 2025"), but this dropdown is keyed by the
          // *financial-year start year* (Jan-2025 belongs to FY 2024 when the
          // org's FY starts in April). Convert using months[0] as the anchor
          // (encoder sorts latest-first), so multi-month uploads still resolve
          // to the FY of their most recent month.
          const urlMonths =
            urlFilters?.months?.filter(
              (m) => typeof m === "string" && m.trim().length > 0
            ) ?? [];
          if (urlFilters?.year && urlFilters.year > 0) {
            const fyYear = toFyStartYear(
              urlFilters.year,
              urlMonths[0],
              data.yearType,
              data.financialYearStartMonth ?? 4
            );
            setSelectedYear(String(fyYear));
          } else {
            setSelectedYear(String(data.defaultYear));
          }

          // Helper: convert an array of lowercase full month names to 3-letter badge strings.
          const toBadges = (months: string[]) =>
            months
              .map(
                (m) =>
                  MONTH_FULL_TO_BADGE[m.charAt(0).toUpperCase() + m.slice(1)] ??
                  null
              )
              .filter((b): b is string => !!b);

          // ── Months ──
          // When a deep-link carries specific months, pre-select those.
          // Otherwise leave all months unselected (empty = all months in FY per API).
          if (urlMonths.length > 0) {
            const badges = toBadges(urlMonths);
            setSelectedMonths(badges.length > 0 ? badges : []);
          } else {
            setSelectedMonths([]);
          }

          // ── Location (single ID from the email payload becomes a 1-element selection) ──
          // Otherwise default to ALL locations so every checkbox is checked.
          if (urlFilters?.organizationAddressId) {
            setSelectedLocations([urlFilters.organizationAddressId]);
          } else {
            setSelectedLocations(data.locations.map((l) => l.id));
          }

          // ── Activity name → switch to Location Wise tab and pre-fill search ──
          // The Activity Type tab has no per-activity filter, but Location Wise
          // runs an ILIKE on activity_name + location_name, so dropping the
          // activity name into the search box scopes the table to that row.
          if (
            urlFilters?.activityName &&
            urlFilters.activityName.trim().length > 0
          ) {
            setActiveTab("location_wise");
            setLocationSearch(urlFilters.activityName);
            setDebouncedSearch(urlFilters.activityName);
          }

          // Consume the param so a manual refresh after the user adjusts
          // filters doesn't snap them back to the email's deep-link state.
          stripFiltersFromUrl();
        }
      } catch {
        // filters failed to load — leave defaults
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilters();
  }, [session?.organizationId]);

  // ── Fetch summary data ─────────────────────────────────────────────────────
  const fetchSummaryData = useCallback(async () => {
    if (!session?.organizationId || !selectedYear) return;

    setIsLoadingData(true);
    try {
      // Convert badge abbreviations to lowercase full month names
      const fullMonths = selectedMonths
        .map((badge) => (MONTH_BADGE_TO_FULL[badge] ?? badge).toLowerCase())
        .filter(Boolean);

      const body = {
        is_export: false,
        tab: activeTab,
        yearType: filterData?.yearType ?? "financial",
        year: selectedYear,
        locationIds: selectedLocations,
        months: fullMonths,
        pageIndex,
        pageSize,
        // Status filter from summary badge clicks
        ...(selectedStatus ? { statusFilter: selectedStatus } : {}),
        // Server-side search — only sent for the location_wise tab
        ...(activeTab === "location_wise" && debouncedSearch.trim().length > 0
          ? { search: debouncedSearch.trim() }
          : {}),
      };
      const res = await apiClientWithAuth.post(
        "/api/v1/monthly-activity-summary",
        body
      );
      const json = await res.data;

      if (json.success) {
        setSummary(
          json.data.summary ?? {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
          }
        );
        if (activeTab === "activity_type") {
          setActivityRows(json.data.rows ?? []);
          setTotalCount(json.data.totalCount ?? 0);
        } else {
          setLocationRows(json.data.rows ?? []);
          setTotalCount(json.data.totalCount ?? 0);
        }
      }
    } catch {
      // data fetch failed
    } finally {
      setIsLoadingData(false);
    }
  }, [
    session?.organizationId,
    selectedYear,
    activeTab,
    filterData?.yearType,
    pageIndex,
    pageSize,
    selectedLocations,
    selectedMonths,
    selectedStatus,
    debouncedSearch,
  ]);

  useEffect(() => {
    if (!isLoadingFilters && selectedYear) {
      fetchSummaryData();
    }
  }, [fetchSummaryData, isLoadingFilters, selectedYear]);

  // ── Shared badge colours ───────────────────────────────────────────────────
  const pendingColors = useMemo(() => statusBadgeColor("pending"), []);
  const approvedColors = useMemo(() => statusBadgeColor("approved"), []);
  const rejectedColors = useMemo(() => statusBadgeColor("rejected"), []);

  // ── Reusable column factories ──────────────────────────────────────────────
  const createStatusColumn = <T extends TActivityRow | TLocationRow>(
    status: TStatus,
    colors: { bg: string; text: string },
    includeFooter = false,
    footerValue?: number
  ): MRT_ColumnDef<T> => {
    const statusLabel =
      status === "pending"
        ? "Pending For Approval"
        : status.charAt(0).toUpperCase() + status.slice(1);
    return {
      accessorKey: status as any,
      header: statusLabel,
      size: status === "pending" ? 180 : 120,
      mantineTableHeadCellProps: { align: "center" },
      mantineTableBodyCellProps: { align: "center" },
      ...(includeFooter && {
        mantineTableFooterCellProps: { align: "center" },
      }),
      Header: () => (
        <Text style={{ color: colors.text }} fz={12} ta="center">
          {statusLabel.toUpperCase()}
        </Text>
      ),
      Cell: ({ cell }) => (
        <Flex justify="center">
          <StatusValueBadge
            value={cell.getValue<number>()}
            bg={colors.bg}
            color={colors.text}
          />
        </Flex>
      ),
      ...(includeFooter &&
        footerValue !== undefined && {
          Footer: () => (
            <Flex justify="center">
              <StatusValueBadge
                value={footerValue}
                bg={colors.bg}
                color={colors.text}
                fw={600}
              />
            </Flex>
          ),
        }),
    };
  };

  // ── Approve handler ────────────────────────────────────────────────────────
  const handleApprove = useCallback(
    async (activityCode: string, rowKey: string, locationIds: string[]) => {
      if (approvingKeys.has(rowKey) || !selectedYear) return;
      setApprovingKeys((prev) => new Set(prev).add(rowKey));
      try {
        const body = {
          activityCode,
          year: parseInt(selectedYear, 10),
          yearType: filterData?.yearType ?? "financial",
          locationIds,
          months: selectedMonths
            .map((badge) => (MONTH_BADGE_TO_FULL[badge] ?? badge).toLowerCase())
            .filter(Boolean),
        };
        const res = await apiClientWithAuth.post(
          "/api/v1/monthly-activity-summary/approve",
          body
        );
        const json = await res.data;
        if (json.success) {
          window.parent.postMessage(
            JSON.stringify({ type: "warp-approved-successfully" }),
            "*"
          );
          // Refresh the summary table to reflect new approved counts (RULE-010)
          fetchSummaryData();
        } else {
          notifications.show({
            title: "Approval failed",
            message:
              json.message ?? "Could not approve records. Please try again.",
            color: "red",
          });
        }
      } catch {
        notifications.show({
          title: "Approval failed",
          message: "Network error. Please try again.",
          color: "red",
        });
      } finally {
        setApprovingKeys((prev) => {
          const next = new Set(prev);
          next.delete(rowKey);
          return next;
        });
      }
    },
    [
      approvingKeys,
      selectedYear,
      filterData?.yearType,
      selectedMonths,
      fetchSummaryData,
    ]
  );

  // Listen for parent confirmation message after SPA popup, then proceed with approval if user confirmed.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "data-log-approval-confirmed" && pendingApproval) {
          handleApprove(
            pendingApproval.activityCode,
            pendingApproval.rowKey,
            pendingApproval.locationIds
          );
          setPendingApproval(null);
        }
      } catch {
        // ignore invalid messages
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pendingApproval, handleApprove]);
  // End Listen for parent confirmation message after SPA popup, then proceed with approval if user confirmed.7

  // ── Export handler ──────────────────────────────────────────────────────────
  const handleExport = useCallback(
    async (
      activityCode: string,
      activityName: string,
      rowKey: string,
      locationIds: string[]
    ) => {
      if (exportingKeys.has(rowKey) || !selectedYear) return;
      setExportingKeys((prev) => new Set(prev).add(rowKey));
      try {
        const body = {
          is_export: true,
          activityCode,
          activityName,
          year: parseInt(selectedYear, 10),
          yearType: filterData?.yearType ?? "financial",
          locationIds,
          months: selectedMonths
            .map((badge) => (MONTH_BADGE_TO_FULL[badge] ?? badge).toLowerCase())
            .filter(Boolean),
          ...(selectedStatus ? { statusFilter: selectedStatus } : {}),
          clientDateTime: (() => {
            const now = new Date();
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          })(),
        };
        const res = await apiClientWithAuth.post(
          "/api/v1/monthly-activity-summary",
          body
        );
        const json = await res.data;
        if (json.success && json.data?.downloadUrl) {
          // ─── Why window.open instead of fetch → blob ───────────────────────
          // Previous approach:
          //   1. fetch(downloadUrl) → Blob
          //   2. createObjectURL(blob) → link.click()
          //
          // Problem: The entire file had to be streamed through the client JS
          // context before the browser download bar appeared. If the user
          // navigated away (SPA route change) or did a hard refresh while the
          // fetch was in-flight, the request was cancelled and nothing was
          // downloaded — even though the server had already finished generating
          // the file and uploading it to S3.
          //
          // Fix: Hand the S3 pre-signed URL directly to the browser via
          // window.open. The browser's native download manager takes ownership
          // immediately and is completely independent of the React app lifecycle.
          // Navigation, component unmounts, or any JS activity can no longer
          // interrupt the download. For .xlsx files the browser always triggers
          // a download (it cannot render them inline), so no new tab is left
          // open. noopener + noreferrer are set as a security best practice.
          window.open(json.data.downloadUrl, "_blank", "noopener,noreferrer");

          notifications.show({
            title: "Export complete",
            message: `"${activityName}" exported successfully.`,
            color: "green",
          });
        } else {
          notifications.show({
            title: "Export failed",
            message: json.message ?? "Could not export data. Please try again.",
            color: "red",
          });
        }
      } catch {
        notifications.show({
          title: "Export failed",
          message: "Network error. Please try again.",
          color: "red",
        });
      } finally {
        setExportingKeys((prev) => {
          const next = new Set(prev);
          next.delete(rowKey);
          return next;
        });
      }
    },
    [
      exportingKeys,
      selectedYear,
      filterData?.yearType,
      selectedMonths,
      selectedStatus,
    ]
  );

  const createActionsColumn = <T extends TActivityRow | TLocationRow>(
    includeFooter = false
  ): MRT_ColumnDef<T> => ({
    accessorKey: "actions" as any,
    header: "Actions",
    maxSize: 80,
    mantineTableHeadCellProps: {
      align: "right",
    },
    mantineTableBodyCellProps: {
      align: "right",
    },
    enableSorting: false,
    ...(includeFooter && {
      mantineTableFooterCellProps: {
        align: "right",
      },
    }),
    ...(includeFooter && { mantineTableFooterCellProps: { align: "right" } }),
    Cell: ({ row }) => {
      const isActivityRow =
        "activityCode" in row.original && !("locationId" in row.original);
      const activityCode = row.original.activityCode;
      const activityName = row.original.activityName;
      const pendingCount = row.original.pending;

      // RULE-003: Location scope for approval.
      // Activity Type tab → use currently selected locations (all user locations if none selected).
      // Location Wise tab → scope to just this row's specific location.
      const locationIds = isActivityRow
        ? selectedLocations
        : [(row.original as TLocationRow).locationId];

      // Row key identifies this specific approve action for loading state tracking.
      const rowKey = isActivityRow
        ? activityCode
        : `${(row.original as TLocationRow).locationId}__${activityCode}`;

      // RULE-005: Approve button is disabled when there are no pending records.
      const allApproved = pendingCount === 0;
      const noRecords = row.original.totalRecords === 0;

      return (
        <Flex
          gap={12}
          justify="flex-end"
          align="center"
          direction="row"
          pr={isOrgAdmin ? 15 : 34}
        >
          {/* RULE-001: Approve button only visible for OrganizationAdmin */}
          {isOrgAdmin && (
            <Tooltip
              label={
                noRecords
                  ? "No data to approve"
                  : allApproved || selectedStatus === "approved"
                    ? "All the data has been approved"
                    : `Approve all pending data for "${activityName}"`
              }
              withArrow
            >
              <ActionIcon
                variant="transparent"
                bg="transparent"
                disabled={
                  allApproved ||
                  selectedStatus === "approved" ||
                  approvingKeys.has(rowKey) ||
                  exportingKeys.has(rowKey)
                }
                loading={approvingKeys.has(rowKey)}
                onClick={() => {
                  setPendingApproval({ activityCode, rowKey, locationIds });
                  window.parent.postMessage(
                    JSON.stringify({ type: "data-log-approval-confirm-popup" }),
                    "*"
                  );
                }}
              >
                <IconCheck
                  size={24}
                  color={
                    noRecords
                      ? "#adb5bd"
                      : allApproved || selectedStatus === "approved"
                        ? "#00a63e"
                        : "#003B52"
                  }
                />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip
            label={
              noRecords
                ? "No data available to export"
                : `Export data for "${activityName}"`
            }
            withArrow
          >
            <ActionIcon
              variant="transparent"
              color="#003B52"
              disabled={
                noRecords ||
                exportingKeys.has(rowKey) ||
                approvingKeys.has(rowKey)
              }
              loading={exportingKeys.has(rowKey)}
              onClick={() =>
                handleExport(activityCode, activityName, rowKey, locationIds)
              }
              styles={{
                root: {
                  backgroundColor: "transparent",
                },
              }}
            >
              <IconDownload size={24} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      );
    },
    ...(includeFooter && {
      Footer: () => (
        <Text
          fw={700}
          pl={activeTab === "activity_type" && isOrgAdmin ? 30 : 10}
        >
          -
        </Text>
      ),
    }),
  });

  // ── MRT Column definitions for Activity Type ──────────────────────────────
  const activityTypeColumns = useMemo<MRT_ColumnDef<TActivityRow>[]>(
    () => [
      {
        accessorKey: "activityName",
        header: "Activity Type",
        size: 200,
        mantineTableBodyCellProps: {
          style: { borderBottom: "1px solid #ebe6e7", overflow: "hidden" },
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return (
            <Tooltip label={value} position="top" withArrow openDelay={300}>
              <Flex align="center" gap={8} w="max-content">
                <Paper
                  styles={{ root: { ...dotStyle("#005c81"), flexShrink: 0 } }}
                />
                <Text fz={14} c="#122f47">
                  {value}
                </Text>
              </Flex>
            </Tooltip>
          );
        },
      },
      // Total column — hidden when a status filter is active
      ...(selectedStatus === null
        ? [
            {
              accessorKey: "totalRecords",
              header: "Total Data",
              size: 120,
              mantineTableHeadCellProps: { align: "center" },
              mantineTableBodyCellProps: { align: "center" },
              Cell: ({ cell }: { cell: any }) => (
                <Text fw={700} c="#122f47">
                  {cell.getValue() as number}
                </Text>
              ),
            } satisfies MRT_ColumnDef<TActivityRow>,
          ]
        : []),
      // Pending column — shown when no filter or pending filter is active
      ...(selectedStatus === null || selectedStatus === "pending"
        ? [
            createStatusColumn(
              "pending",
              pendingColors
            ) as MRT_ColumnDef<TActivityRow>,
          ]
        : []),
      // Approved column — shown when no filter or approved filter is active
      ...(selectedStatus === null || selectedStatus === "approved"
        ? [
            createStatusColumn(
              "approved",
              approvedColors
            ) as MRT_ColumnDef<TActivityRow>,
          ]
        : []),
      createActionsColumn<TActivityRow>(),
    ],
    [
      isOrgAdmin,
      summary,
      pendingColors,
      approvedColors,
      rejectedColors,
      handleApprove,
      approvingKeys,
      handleExport,
      exportingKeys,
      selectedLocations,
      selectedStatus,
    ]
  );

  // ── MRT Column definitions for Location Wise ──────────────────────────────
  const locationWiseColumns = useMemo<MRT_ColumnDef<TLocationRow>[]>(
    () => [
      {
        accessorKey: "locationName",
        header: "Location",
        size: 150,
        Cell: ({ cell }) => (
          <Text fz={14} c="#122f47" fw={600}>
            {cell.getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "activityName",
        header: "Activity Type",
        maxSize: 100,
        mantineTableBodyCellProps: {
          style: { borderBottom: "1px solid #ebe6e7", overflow: "hidden" },
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return (
            <Tooltip label={value} position="top" withArrow openDelay={300}>
              <Flex align="center" gap={8} w="max-content">
                <Paper
                  styles={{ root: { ...dotStyle("#005c81"), flexShrink: 0 } }}
                />
                <Text fz={14} c="#122f47">
                  {value}
                </Text>
              </Flex>
            </Tooltip>
          );
        },
      },
      // Total column — hidden when a status filter is active
      ...(selectedStatus === null
        ? [
            {
              accessorKey: "totalRecords",
              header: "Total Data",
              size: 120,
              mantineTableHeadCellProps: { align: "center" },
              mantineTableBodyCellProps: { align: "center" },
              Cell: ({ cell }: { cell: any }) => (
                <Text fw={700} c="#122f47">
                  {cell.getValue() as number}
                </Text>
              ),
            } satisfies MRT_ColumnDef<TLocationRow>,
          ]
        : []),
      // Pending column — shown when no filter or pending filter is active
      ...(selectedStatus === null || selectedStatus === "pending"
        ? [
            createStatusColumn(
              "pending",
              pendingColors
            ) as MRT_ColumnDef<TLocationRow>,
          ]
        : []),
      // Approved column — shown when no filter or approved filter is active
      ...(selectedStatus === null || selectedStatus === "approved"
        ? [
            createStatusColumn(
              "approved",
              approvedColors
            ) as MRT_ColumnDef<TLocationRow>,
          ]
        : []),
      createActionsColumn<TLocationRow>(),
    ],
    [
      isOrgAdmin,
      pendingColors,
      approvedColors,
      rejectedColors,
      handleApprove,
      approvingKeys,
      handleExport,
      exportingKeys,
      selectedLocations,
      selectedStatus,
    ]
  );

  // ── MRT Table for Activity Type ───────────────────────────────────────────
  const activityTypeTable = useMantineReactTable({
    columns: activityTypeColumns,
    data: activityRows,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: true,
    manualPagination: true,
    rowCount: totalCount,
    enableSorting: false,
    enableTopToolbar: false,
    enableRowSelection: false,
    state: {
      // Show the MRT skeleton while filters are still loading so the table
      // never flashes "No records to display" before the first data fetch.
      isLoading: isLoadingData || isLoadingFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    paginationDisplayMode: "pages",
    mantinePaginationProps: {
      withEdges: false,
      showRowsPerPage: true,
      rowsPerPageOptions: ["10", "25", "50"],
    },
    mantineTableHeadCellProps: {
      style: { borderBottom: "1px solid #ebe6e7" },
    },
    mantineTableBodyCellProps: {
      style: { borderBottom: "1px solid #ebe6e7" },
    },
    localization: {
      rowsPerPage: "Items per page:",
      noRecordsToDisplay: "No data available",
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    renderBottomToolbar: ({ table }) => {
      const { pageIndex: currentPageIndex, pageSize: currentPageSize } =
        table.getState().pagination;
      const startRow = currentPageIndex * currentPageSize + 1;
      const endRow = Math.min(
        totalCount,
        (currentPageIndex + 1) * currentPageSize
      );

      return (
        <Flex gap="sm" align={"center"} mr={15}>
          {table.getPrePaginationRowModel().rows?.length !== 0 && (
            <React.Fragment>
              <MRT_TablePagination table={table} />
              <Text
                c="#444"
                fz={14}
                ta="center"
                ml={-11}
                styles={{ root: { textWrap: "nowrap" } }}
              >
                {`${startRow}-${endRow} of ${totalCount}`}
              </Text>
            </React.Fragment>
          )}
        </Flex>
      );
    },
  });

  // ── MRT Table for Location Wise ───────────────────────────────────────────
  const locationWiseTable = useMantineReactTable({
    columns: locationWiseColumns,
    data: locationRows,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: true,
    manualPagination: true,
    rowCount: totalCount,
    enableSorting: false,
    enableTopToolbar: false,
    enableRowSelection: false,
    state: {
      // Show the MRT skeleton while filters are still loading so the table
      // never flashes "No records to display" before the first data fetch.
      isLoading: isLoadingData || isLoadingFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    paginationDisplayMode: "pages",
    mantinePaginationProps: {
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
      showRowsPerPage: true,
      rowsPerPageOptions: ["10", "25", "50"],
    },
    mantineTableHeadCellProps: {
      style: { borderBottom: "1px solid #ebe6e7" },
    },
    mantineTableBodyCellProps: {
      style: { borderBottom: "1px solid #ebe6e7" },
    },
    localization: {
      rowsPerPage: "Items per page:", // Change "Rows per page" to "Items per page"
      noRecordsToDisplay: "No data available",
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    renderBottomToolbar: ({ table }) => {
      const { pageIndex: currentPageIndex, pageSize: currentPageSize } =
        table.getState().pagination;
      const startRow = currentPageIndex * currentPageSize + 1;
      const endRow = Math.min(
        totalCount,
        (currentPageIndex + 1) * currentPageSize
      );

      return (
        <Flex gap="sm" align={"center"} mr={15}>
          {table.getPrePaginationRowModel().rows?.length !== 0 && (
            <React.Fragment>
              <MRT_TablePagination table={table} />
              <Text
                c="#444"
                fz={14}
                ta="center"
                ml={-11}
                styles={{
                  root: {
                    textWrap: "nowrap",
                  },
                }}
              >
                {`${startRow}-${endRow} of ${totalCount}`}
              </Text>
            </React.Fragment>
          )}
        </Flex>
      );
    },
  });

  // ── Reset to default ───────────────────────────────────────────────────────
  const handleResetToDefault = () => {
    setSelectedLocations(filterData?.locations.map((l) => l.id) ?? []);
    setSelectedYear(
      filterData?.defaultYear ? String(filterData.defaultYear) : null
    );
    // Restore months-with-data for the default year
    const mwd = filterData?.monthsWithData ?? [];
    setMonthsWithData(mwd);
    // Leave months unselected — empty = all months in FY per API
    setSelectedMonths([]);
    setSelectedStatus(null);
    setPageIndex(0);
  };

  // ── Tab switch ─────────────────────────────────────────────────────────────
  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    setPageIndex(0);
    // Clear both the visible search value and the debounced value immediately
    // so the next data fetch for the new tab has no residual search filter.
    setLocationSearch("");
    setDebouncedSearch("");
  };

  return (
    <Box mx={30} pt={30}>
      {/* ── Page header ── */}
      <Box mb={16}>
        <Flex align="center" gap="sm">
          <ThemeIcon radius="md" size={45} color="#122f47" variant="filled">
            <IconFileAnalytics />
          </ThemeIcon>
          <Box>
            <Text fz={24} fw={600} c="#122f47">
              All Monthly Activity Summary
            </Text>
            <Text fz={14} c="#666">
              Comprehensive overview of all ESG activities across locations and
              time periods
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* ── Filters ── */}
      {isLoadingFilters ? (
        <Flex justify="center" py={32}>
          <Loader size="sm" />
        </Flex>
      ) : (
        <MainFilterBlock
          baselineYear={
            filterData?.years.find((y) => y.value !== "all")
              ? parseInt(
                  filterData!.years[filterData!.years.length - 1].value,
                  10
                )
              : undefined
          }
          financialYearStartMonth={filterData?.financialYearStartMonth ?? 4}
          selectedYear={selectedYear}
          selectedLocations={selectedLocations}
          onLocationsChange={(vals) => {
            setSelectedLocations(vals);
            setSelectedStatus(null);
            setPageIndex(0);
            // Re-fetch monthsWithData scoped to the newly selected locations so
            // month tiles only show green when those specific locations have data.
            setMonthsWithData([]);
            const locationParam = vals.join(",");
            const yearParam = selectedYear ?? "";
            apiClientWithAuth
              .get(
                `/api/v1/monthly-activity-summary/filters?year=${yearParam}&locationIds=${locationParam}`
              )
              .then((r) => r.data)
              .then((json) => {
                if (json.success)
                  setMonthsWithData(json.data.monthsWithData ?? []);
              })
              .catch(() => {});
          }}
          locationOptions={locationOptions}
          selectedFinancialYear={selectedYear}
          onFinancialYearChange={(val) => {
            setSelectedYear(val);
            // Changing year resets month selection → default view shows all months of the new year
            setSelectedMonths([]);
            // Clear monthsWithData immediately so month tiles don't flash
            // green (stale data from the previous year) while the new fetch
            // is in-flight.
            setMonthsWithData([]);
            setSelectedStatus(null);
            setPageIndex(0);
            // Re-fetch months with data for the newly selected year
            if (val) {
              const locationParam = selectedLocations.join(",");
              apiClientWithAuth
                .get(
                  `/api/v1/monthly-activity-summary/filters?year=${val}&locationIds=${locationParam}`
                )
                .then((r) => r.data)
                .then((json) => {
                  if (json.success) {
                    const mwd: string[] = json.data.monthsWithData ?? [];
                    setMonthsWithData(mwd);
                    // Leave months unselected — empty = all months in FY per API
                  }
                })
                .catch(() => {});
            }
          }}
          selectedMonths={selectedMonths}
          onMonthsChange={(updater) => {
            setSelectedMonths((prev) => {
              const next = updater(prev);
              setSelectedStatus(null);
              setPageIndex(0);
              return next;
            });
          }}
          onResetToDefault={handleResetToDefault}
          summary={summary}
          monthsWithData={monthsWithData}
          selectedStatus={selectedStatus}
          onStatusChange={(status) => {
            setSelectedStatus(status);
            setPageIndex(0);
          }}
        />
      )}

      {/* ── Table card ── */}
      <Card
        withBorder
        radius="md"
        p={0}
        bg="#fbf9fa"
        styles={{
          root: {
            background: "#fff",
            borderRadius: 10,
            boxShadow:
              "rgba(159, 162, 191, 0.18) 0px 9px 16px, rgba(159, 162, 191, 0.32) 0px 2px 2px",
          },
        }}
      >
        {/* Card header with tab toggle */}
        <Flex
          p={15}
          justify="space-between"
          align="center"
          styles={{ root: { borderBottom: "1px solid #ebe6e7" } }}
        >
          <Box>
            <Text fz={20} fw={600} c="#122f47">
              {activeTab === "activity_type"
                ? "Activity Type Summary"
                : "Location Wise Activity Summary"}
            </Text>
            <Text fz={14} c="#666">
              {activeTab === "activity_type"
                ? "Breakdown by activity type"
                : "Breakdown by location and activity type"}
            </Text>
          </Box>

          <Flex gap={16} align="center" wrap="wrap" justify="flex-end">
            {/* Search input — only shown on Location Wise tab */}
            {activeTab === "location_wise" && (
              <Autocomplete
                className="search-autocomplete"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                leftSection={
                  <IconSearch
                    color={searchFocused ? "#005C81" : "#666"}
                    size={16}
                  />
                }
                value={locationSearch}
                onChange={(value) => setLocationSearch(value)}
                data={[]}
                style={{ width: 240 }}
                clearable
              />
            )}
            {/* Only org admins can toggle between tabs; location executives are fixed on Location Wise */}
            {isOrgAdmin && (
              <Button
                variant="unstyled"
                fw={600}
                className="noAnimationButton filledGradientButton"
                fz={12}
                h={36}
                lts="0.15rem"
                radius="xl"
                disabled={isLoadingFilters || isLoadingData}
                onClick={() =>
                  handleTabSwitch(
                    activeTab === "activity_type"
                      ? "location_wise"
                      : "activity_type"
                  )
                }
              >
                {activeTab === "activity_type"
                  ? "LOCATION WISE ACTIVITY SUMMARY"
                  : "ACTIVITY TYPE SUMMARY"}
              </Button>
            )}
          </Flex>
        </Flex>

        <Box className="SummaryTable">
          {/* ── Activity Type Table ── */}
          {activeTab === "activity_type" && (
            <MantineReactTable table={activityTypeTable} />
          )}

          {/* ── Location Wise Table ── */}
          {activeTab === "location_wise" && (
            <MantineReactTable table={locationWiseTable} />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default DataUploadLogSummary;
