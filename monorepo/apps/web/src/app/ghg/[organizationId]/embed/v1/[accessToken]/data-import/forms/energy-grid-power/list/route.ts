import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { Order_By } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { GridPowerDetailsConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { isOrganizationAdmin as checkIsOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "@/modules/ghg/utils/const";

// ============================================================================
// Constants
// ============================================================================

// Use master keys from GridPowerDetailsConstant for pre-populating default rows
const DEFAULT_MASTER_KEYS = GridPowerDetailsConstant.defaultMasterKeys;

// ============================================================================
// Types
// ============================================================================

type RowData = Record<
  string,
  string | number | null | undefined | boolean | object
>;

interface DistributionCompanyMasterData {
  name_of_distribution_company: string;
}

// ============================================================================
// Master Data Functions
// ============================================================================

/**
 * Get distribution companies for a specific location from master data
 * Priority:
 * 1. OrgActivityMaster with organization_address_id (location-specific)
 * 2. OrgActivityMaster with organization_id only (org-level)
 * No fallback to ActivityMaster — unconfigured locations return [] and
 * generatePrePopulatedRows will emit 1 empty skeleton row for them.
 */
function getDistributionCompaniesForLocation(
  locationId: string,
  organizationId: string,
  orgActivityMasterRecords: Array<{
    organization_id?: string | null;
    organization_address_id?: string | null;
    master_key: string;
    master_data: any;
  }>
): string[] {
  // Priority 1: Check for location-specific master data
  const locationSpecificRecord = orgActivityMasterRecords.find(
    (record) =>
      DEFAULT_MASTER_KEYS.includes(
        record.master_key as (typeof DEFAULT_MASTER_KEYS)[number]
      ) && record.organization_address_id === locationId
  );

  if (locationSpecificRecord?.master_data) {
    const companies = extractDistributionCompanies(
      locationSpecificRecord.master_data
    );
    if (companies.length > 0) return companies;
  }

  // Priority 2: Check for org-level master data (no organization_address_id)
  const orgLevelRecord = orgActivityMasterRecords.find(
    (record) =>
      DEFAULT_MASTER_KEYS.includes(
        record.master_key as (typeof DEFAULT_MASTER_KEYS)[number]
      ) &&
      record.organization_id === organizationId &&
      !record.organization_address_id
  );

  if (orgLevelRecord?.master_data) {
    const companies = extractDistributionCompanies(orgLevelRecord.master_data);
    if (companies.length > 0) return companies;
  }

  // No OrgActivityMaster data found — return empty array.
  // Caller will generate 1 empty skeleton row per year × month for this location.
  return [];
}

/**
 * Extract distribution company names from master_data
 * master_data format: [{ "name_of_distribution_company": "Tata Power" }, ...]
 */
function extractDistributionCompanies(masterData: any): string[] {
  try {
    const data =
      typeof masterData === "string" ? JSON.parse(masterData) : masterData;

    if (!Array.isArray(data)) return [];

    return data
      .filter(
        (item: DistributionCompanyMasterData) =>
          item?.name_of_distribution_company
      )
      .map(
        (item: DistributionCompanyMasterData) =>
          item.name_of_distribution_company
      );
  } catch {
    return [];
  }
}

interface ListRequestBody {
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  sorting?: Array<{
    id: string;
    desc: boolean;
  }>;
  globalFilter?: string;
  uploadType?: "all" | "ai_uploaded" | "manual_entry" | "pending_data";
  activity?: string;
  formMode?: "standard" | "prepopulate"; // "standard" = existing data only, "prepopulate" = with pre-populated rows
}

  // Step 4: Fetch ALL existing grid power data (no pagination at DB level)
// Pre-population Logic (Server-side)
// ============================================================================

/**
 * Generate pre-populated rows for all locations
 * Match key: location × year × month × distribution_company
 * If a location has master data with distribution companies, generate rows for each company
 * If a location has NO master data, generate 1 row with null distribution company
 */
function generatePrePopulatedRows(
  locationOptions: Array<{ value: string; label: string }>,
  baselineYear: number | undefined,
  financialYearMonth: string | undefined,
  organizationId: string,
  orgActivityMasterRecords: Array<{
    organization_id?: string | null;
    organization_address_id?: string | null;
    master_key: string;
    master_data: any;
  }>
): RowData[] {
  if (!baselineYear || !financialYearMonth) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const monthNames = [...Month];

  const prePopulatedRows: RowData[] = [];

  // Generate for each location
  locationOptions.forEach((location) => {
    // Get distribution companies for this location (OrgActivityMaster only, no ActivityMaster fallback)
    const distributionCompanies = getDistributionCompaniesForLocation(
      location.value,
      organizationId,
      orgActivityMasterRecords
    );

    // If no distribution companies found, use [null] to generate 1 row per location/month
    const companiesToGenerate =
      distributionCompanies.length > 0 ? distributionCompanies : [null];

    // Generate for each year from baseline to current
    for (let year = baselineYear; year <= currentYear; year++) {
      let monthsToGenerate: string[] = [];

      if (year === baselineYear) {
        // For baseline year: start from financial year month to December
        const financialMonthIndex = monthNames.findIndex(
          (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
        );
        if (financialMonthIndex !== -1) {
          monthsToGenerate = monthNames.slice(financialMonthIndex);
        } else {
          monthsToGenerate = monthNames; // Fallback to all months
        }
      } else if (year === currentYear) {
        // For current year: January to previous month (exclude current month)
        monthsToGenerate = monthNames.slice(0, currentMonth);
      } else {
        // For other years: all 12 months
        monthsToGenerate = monthNames;
      }

      // Generate for each month
      monthsToGenerate.forEach((month) => {
        // Generate for each distribution company (or once with null if no master data)
        companiesToGenerate.forEach((company) => {
          prePopulatedRows.push({
            location: location.label,
            locationId: location.value,
            year: year.toString(),
            month: month,
            nameOfDistributionCompany: company,
            _isMasterDataValue: company !== null,
            powerConsumedThroughGridKwh: null,
            nameOfCompanyPPARenewable: null,
            powerPurchasedThroughPPAKwhRenewable: null,
            nameOfCompanyPPANonRenewable: null,
            powerPurchasedThroughPPAKwhNonRenewable: null,
            nameOfCompanyForREC: null,
            powerPurchasedThroughRECKwh: null,
            status: "pending_data",
            _isPrePopulated: true,
            hasExistingData: false,
          });
        });
      });
    }
  });

  return prePopulatedRows;
}

/**
 * Helper function to normalize a value for comparison (lowercase, trimmed)
 */
function normalizeForComparison(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .trim();
}

/**
 * Merge pre-populated rows with existing data
 * Match key: ${location}|${year}|${month} (normalized, case-insensitive)
 * If ANY data exists for a location-year-month combination, exclude ALL prepopulated rows for that combination
 */
function mergeWithExistingData(
  prePopulatedRows: RowData[],
  existingData: RowData[]
): RowData[] {
  // Create a Set of existing location-year-month combinations for fast lookup
  // We exclude distribution company from the key because if any data exists for a location-year-month,
  // we don't want to generate prepopulated rows for that combination regardless of distribution company
  const existingCombinations = new Set<string>();

  existingData.forEach((row) => {
    const key = `${normalizeForComparison(row.location)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    existingCombinations.add(key);
  });

  // Filter out pre-populated rows that have existing data for the same location-year-month combination
  const filteredPrePopulated = prePopulatedRows.filter((row) => {
    const key = `${normalizeForComparison(row.location)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    return !existingCombinations.has(key);
  });

  // Mark existing data rows
  const markedExistingData = existingData.map((row) => ({
    ...row,
    hasExistingData: true,
    _isPrePopulated: false,
  }));

  // Combine: existing data + remaining pre-populated skeletons
  return [...markedExistingData, ...filteredPrePopulated];
}

/**
 * Sort merged data based on mode:
 * - Standard mode: updatedAt (Desc), Year (Desc), Month (Desc), Location (Asc), Distribution Company (Asc)
 * - Prepopulate mode: Year (Desc), Month (Desc), Location (Asc), Distribution Company (Asc)
 */
function sortMergedData(
  data: RowData[],
  formMode: string = FORM_MODE_STANDARD
): RowData[] {
  const monthOrder: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  return data.sort((a, b) => {
    // Only sort by Updated At in STANDARD mode (Descending - newest first)
    if (formMode === FORM_MODE_STANDARD) {
      const updatedAtA = a.updatedAt
        ? new Date(String(a.updatedAt)).getTime()
        : 0;
      const updatedAtB = b.updatedAt
        ? new Date(String(b.updatedAt)).getTime()
        : 0;
      if (updatedAtA !== updatedAtB) {
        return updatedAtB - updatedAtA;
      }
    }

    // Sort by Year (Descending)
    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearA !== yearB) {
      return yearB - yearA;
    }

    // Sort by Month (Descending)
    const monthA = monthOrder[a.month as string] || 0;
    const monthB = monthOrder[b.month as string] || 0;
    if (monthA !== monthB) {
      return monthB - monthA;
    }

    // Sort by Location (Ascending)
    const locationA = String(a.location || "").toLowerCase();
    const locationB = String(b.location || "").toLowerCase();
    const locationCompare = locationA.localeCompare(locationB);
    if (locationCompare !== 0) {
      return locationCompare;
    }

    // Sort by Distribution Company (Ascending, nulls last)
    const companyA = String(a.nameOfDistributionCompany || "").toLowerCase();
    const companyB = String(b.nameOfDistributionCompany || "").toLowerCase();
    if (!companyA && companyB) return 1;
    if (companyA && !companyB) return -1;
    return companyA.localeCompare(companyB);
  });
}

/**
 * Apply dynamic sorting based on frontend sorting state
 * If no sorting state provided, use default sorting (updatedAt DESC in standard mode, Year/Month/Location in prepopulate mode)
 */
function applySorting(
  data: RowData[],
  sortingState: Array<{ id: string; desc: boolean }>,
  formMode: string = FORM_MODE_STANDARD
): RowData[] {
  const monthOrder: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // If no sorting state provided, use default sorting
  if (!sortingState || sortingState.length === 0) {
    return sortMergedData(data, formMode);
  }

  return data.sort((a, b) => {
    // Apply each sorting column in order
    for (const sort of sortingState) {
      const { id, desc } = sort;
      let compareResult = 0;

      switch (id) {
        case "year":
          compareResult = (Number(a.year) || 0) - (Number(b.year) || 0);
          break;
        case "month":
          compareResult =
            (monthOrder[a.month as string] || 0) -
            (monthOrder[b.month as string] || 0);
          break;
        case "location":
          compareResult = String(a.location || "")
            .toLowerCase()
            .localeCompare(String(b.location || "").toLowerCase());
          break;
        case "nameOfDistributionCompany":
          compareResult = String(a.nameOfDistributionCompany || "")
            .toLowerCase()
            .localeCompare(
              String(b.nameOfDistributionCompany || "").toLowerCase()
            );
          break;
        case "powerConsumedThroughGridKwh":
          compareResult =
            (Number(a.powerConsumedThroughGridKwh) || 0) -
            (Number(b.powerConsumedThroughGridKwh) || 0);
          break;
        case "nameOfCompanyPPARenewable":
          compareResult = String(a.nameOfCompanyPPARenewable || "")
            .toLowerCase()
            .localeCompare(
              String(b.nameOfCompanyPPARenewable || "").toLowerCase()
            );
          break;
        case "powerPurchasedThroughPPAKwhRenewable":
          compareResult =
            (Number(a.powerPurchasedThroughPPAKwhRenewable) || 0) -
            (Number(b.powerPurchasedThroughPPAKwhRenewable) || 0);
          break;
        case "nameOfCompanyPPANonRenewable":
          compareResult = String(a.nameOfCompanyPPANonRenewable || "")
            .toLowerCase()
            .localeCompare(
              String(b.nameOfCompanyPPANonRenewable || "").toLowerCase()
            );
          break;
        case "powerPurchasedThroughPPAKwhNonRenewable":
          compareResult =
            (Number(a.powerPurchasedThroughPPAKwhNonRenewable) || 0) -
            (Number(b.powerPurchasedThroughPPAKwhNonRenewable) || 0);
          break;
        case "nameOfCompanyForREC":
          compareResult = String(a.nameOfCompanyForREC || "")
            .toLowerCase()
            .localeCompare(String(b.nameOfCompanyForREC || "").toLowerCase());
          break;
        case "powerPurchasedThroughRECKwh":
          compareResult =
            (Number(a.powerPurchasedThroughRECKwh) || 0) -
            (Number(b.powerPurchasedThroughRECKwh) || 0);
          break;
        case "createdByUserName":
          compareResult = String(a.createdByUserName || "")
            .toLowerCase()
            .localeCompare(String(b.createdByUserName || "").toLowerCase());
          break;
        case "updatedByUserName":
          compareResult = String(a.updatedByUserName || "")
            .toLowerCase()
            .localeCompare(String(b.updatedByUserName || "").toLowerCase());
          break;
        case "updatedAt":
          compareResult =
            new Date(String(a.updatedAt || "")).getTime() -
            new Date(String(b.updatedAt || "")).getTime();
          break;
        default:
          compareResult = 0;
      }

      // If comparison result is not 0, apply direction and return
      if (compareResult !== 0) {
        return desc ? -compareResult : compareResult;
      }
    }

    return 0;
  });
}

/**
 * Check if a row has AI extracted data
 */
function hasAIExtractedData(metadata: unknown): boolean {
  if (!metadata) return false;
  try {
    const parsed =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return (
      parsed?.AIExtractedData && Object.keys(parsed.AIExtractedData).length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Apply global filter to merged data
 */
function applyGlobalFilter(data: RowData[], globalFilter: string): RowData[] {
  if (!globalFilter || globalFilter.trim() === "") return data;

  const searchValue = globalFilter.trim().toLowerCase();
  const numericValue = Number(searchValue);
  const isNumeric = !isNaN(numericValue) && searchValue !== "";

  return data.filter((row) => {
    // Search in text fields
    const textFields = [
      row.location,
      row.month,
      row.nameOfDistributionCompany,
      row.nameOfCompanyPPARenewable,
      row.nameOfCompanyPPANonRenewable,
      row.nameOfCompanyForREC,
      row.createdByUserName,
      row.updatedByUserName,
    ];

    for (const field of textFields) {
      if (field && String(field).toLowerCase().includes(searchValue)) {
        return true;
      }
    }

    // Search in year
    if (isNumeric && Number(row.year) === numericValue) {
      return true;
    }

    // Search in numeric fields
    if (isNumeric) {
      const numericFields = [
        row.powerConsumedThroughGridKwh,
        row.powerPurchasedThroughPPAKwhRenewable,
        row.powerPurchasedThroughPPAKwhNonRenewable,
        row.powerPurchasedThroughRECKwh,
      ];

      for (const field of numericFields) {
        if (
          field !== null &&
          field !== undefined &&
          Number(field) === numericValue
        ) {
          return true;
        }
      }
    }

    return false;
  });
}

/**
 * Apply upload type filter to merged data
 */
function applyUploadTypeFilter(data: RowData[], uploadType: string): RowData[] {
  switch (uploadType) {
    case "pending_data":
      return data.filter((row) => row.status === "pending_data");
    case "ai_uploaded":
      return data.filter(
        (row) =>
          row.status !== "pending_data" && hasAIExtractedData(row.metadata)
      );
    case "manual_entry":
      return data.filter(
        (row) =>
          row.status !== "pending_data" && !hasAIExtractedData(row.metadata)
      );
    case "all":
    default:
      return data;
  }
}

/**
 * Apply pagination to data
 */
function applyPagination(
  data: RowData[],
  pageIndex: number,
  pageSize: number
): RowData[] {
  const startIndex = pageIndex * pageSize;
  return data.slice(startIndex, startIndex + pageSize);
}

// ============================================================================
// API postHandler
// ============================================================================

async function postHandler(
  req: NextRequest,
  userSession?: TUserSession
): Promise<NextResponse> {
  if (!userSession) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const organizationId = userSession.organizationId;
  const userId = userSession.userId;
  const isOrgAdmin = checkIsOrganizationAdmin(userSession.userRole);

  // Parse request body
  const body: ListRequestBody = await req.json();
  const {
    pagination = { pageIndex: 0, pageSize: 10 },
    sorting = [],
    globalFilter = "",
    uploadType = "all",
    activity = "energy",
    formMode = FORM_MODE_PREPOPULATE,
  } = body;

  const sdk = await getGraphQlServerSDK();

  // Step 1: Fetch location options based on user role
  let locationOptions: Array<{ value: string; label: string }> = [];
  let organizationAddressIds: string[] = [];

  if (isOrgAdmin) {
    // For admin users, fetch all organization addresses
    const addressesResult = await sdk.getAddresses({
      organisationAddressId: organizationId,
    });

    if (addressesResult.OrganizationAddress) {
      addressesResult.OrganizationAddress.forEach((address: any) => {
        const id = address.id || "";
        const name = address.Address?.name || "";
        if (id && name) {
          locationOptions.push({ value: id, label: name });
          organizationAddressIds.push(id);
        }
      });
    }
  } else {
    // For non-admin users, fetch user's mapped addresses
    const locationsResult = await sdk.getLocationsAndAddresses({
      organizationId,
      userId,
    });

    if (locationsResult.UserOrganizationAddressMapping) {
      locationsResult.UserOrganizationAddressMapping.forEach((mapping: any) => {
        const id = mapping.organization_address_id || "";
        const name = mapping.OrganizationAddress?.Address?.name || "";
        if (id && name && mapping.activities?.includes(activity)) {
          locationOptions.push({ value: id, label: name });
          organizationAddressIds.push(id);
        }
      });
    }
  }

  if (organizationAddressIds.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      totalCount: 0,
      counts: {
        all: 0,
        pending_data: 0,
        ai_uploaded: 0,
        manual_entry: 0,
      },
      locationOptions,
    });
  }

  // Step 2: Fetch organization baseline year and financial month
  const orgResult = await sdk.getOrgData({ organizationId });
  const organization = orgResult.Organization?.[0];
  const baselineYear = organization?.Baselineyear;
  const financialYearMonth = organization?.FinancialYearMonth;

  // Step 3: Fetch master data for distribution companies
  const masterDataResult = await sdk.getActivityMasterDataForDefaultRows({
    organizationId,
    organizationAddressIds,
    masterKeys: [...DEFAULT_MASTER_KEYS],
  });

  const orgActivityMasterRecords = masterDataResult.OrgActivityMaster || [];

  // Build OrgActivityMaster distribution company values per location for per-value lock comparison.
  const orgMasterCompanyValuesByLocation = new Map<string, Set<string>>();
  locationOptions.forEach((loc) => {
    const companies = getDistributionCompaniesForLocation(
      loc.value,
      organizationId,
      orgActivityMasterRecords
    );
    orgMasterCompanyValuesByLocation.set(
      loc.value,
      new Set(companies.map((c) => c.toLowerCase().trim()))
    );
  });

    // Step 4: Fetch ALL existing grid power data (no pagination at DB level)
  const existingDataResult = await sdk.getActivityDataEnergyGridPowerPaginated({
    organization_address_ids: organizationAddressIds,
    limit: 10000, // Fetch all records
    offset: 0,
    order_by: [
      { updated_at: Order_By.DescNullsLast },
      { TaskRequest: { year: Order_By.Desc } },
      { TaskRequest: { month: Order_By.Desc } },
    ],
    activityFilter: {},
    uploadTypeFilter: {},
  });

  // Step 5: Transform existing data to RowData format
  const existingData: RowData[] = (
    existingDataResult.GHGEnergyConsumption_GridPower || []
  ).map((gridPower: any) => {
    const taskRequest = gridPower.TaskRequest || {};
    const locationName = taskRequest.OrganizationAddress?.Address?.name || "";

    return {
      id: gridPower.id || "",
      task_request_id: taskRequest.id || "",
      location: locationName,
      locationId: taskRequest.organization_address_id || "",
      year: taskRequest.year?.toString() || "",
      month: taskRequest.month || "",
      nameOfDistributionCompany: gridPower.grid_provider ?? "",
      powerConsumedThroughGridKwh: gridPower.grid_kwh ?? "",
      nameOfCompanyPPARenewable: gridPower.ppa_renewable_provider ?? "",
      powerPurchasedThroughPPAKwhRenewable: gridPower.ppa_renewable_kwh ?? "",
      nameOfCompanyPPANonRenewable: gridPower.ppa_nonrenewable_provider ?? "",
      powerPurchasedThroughPPAKwhNonRenewable:
        gridPower.ppa_nonrenewable_kwh ?? "",
      nameOfCompanyForREC: gridPower.rec_provider ?? "",
      powerPurchasedThroughRECKwh: gridPower.rec_kwh ?? "",
      createdByUserName:
        gridPower.CreatedByUser?.name || gridPower.created_by || "",
      updatedByUserName: gridPower.UpdatedByUser?.name || "",
      metadata: gridPower.metadata ?? null,
      updatedAt: gridPower.updated_at || "",
      status: gridPower.status ?? "saved",
      _isPrePopulated: false,
      hasExistingData: true,
      _isMasterDataValue: (() => {
        const locId = taskRequest.organization_address_id || "";
        const orgValues = orgMasterCompanyValuesByLocation.get(locId);
        const companyValue = (gridPower.grid_provider ?? "").toLowerCase().trim();
        return orgValues && orgValues.size > 0 && orgValues.has(companyValue);
      })(),
    };
  });

  // Step 6: Generate pre-populated rows (with distribution companies from master data)
  // Only generate pre-populated rows if formMode is "prepopulate"
  let prePopulatedRows: RowData[] = [];
  if (formMode === FORM_MODE_PREPOPULATE) {
    prePopulatedRows = generatePrePopulatedRows(
      locationOptions,
      baselineYear,
      financialYearMonth,
      organizationId,
      orgActivityMasterRecords
    );
  }

  // Step 7: Merge pre-populated rows with existing data
  // For "standard" mode, only use existing data
  const dataToUse =
    formMode === FORM_MODE_STANDARD
      ? existingData
      : mergeWithExistingData(prePopulatedRows, existingData);

  // Step 8: Apply dynamic sorting based on frontend sorting state
  const sortedData = applySorting(dataToUse, sorting, formMode);

  // Step 9: Apply global filter
  const filteredBySearch = applyGlobalFilter(sortedData, globalFilter);

  // Step 10: Calculate counts for each tab (before upload type filter)
  const counts = {
    all: filteredBySearch.length,
    pending_data: filteredBySearch.filter(
      (row) => row.status === "pending_data"
    ).length,
    ai_uploaded: filteredBySearch.filter(
      (row) => row.status !== "pending_data" && hasAIExtractedData(row.metadata)
    ).length,
    manual_entry: filteredBySearch.filter(
      (row) =>
        row.status !== "pending_data" && !hasAIExtractedData(row.metadata)
    ).length,
  };

  // Step 11: Apply upload type filter
  const filteredByUploadType = applyUploadTypeFilter(
    filteredBySearch,
    uploadType
  );

  // Step 12: Apply pagination
  const paginatedData = applyPagination(
    filteredByUploadType,
    pagination.pageIndex,
    pagination.pageSize
  );

  // Step 13: Create filtered location options for "Add new entry" dropdown
  // In prepopulate mode, exclude locations that already have master data in OrgActivityMaster
  let addNewEntryLocationOptions = locationOptions;
  let shouldDisableAddNewEntry = false;

  if (formMode === FORM_MODE_PREPOPULATE) {
    const hasOrgLevelConfig = orgActivityMasterRecords.some(
      (record) =>
        DEFAULT_MASTER_KEYS.includes(
          record.master_key as (typeof DEFAULT_MASTER_KEYS)[number]
        ) && !record.organization_address_id
    );

    if (hasOrgLevelConfig) {
      addNewEntryLocationOptions = [];
      shouldDisableAddNewEntry = true;
    } else {
      const locationsWithMasterData = new Set<string>();

      orgActivityMasterRecords.forEach((record) => {
        if (
          record.organization_address_id &&
          DEFAULT_MASTER_KEYS.includes(
            record.master_key as (typeof DEFAULT_MASTER_KEYS)[number]
          )
        ) {
          locationsWithMasterData.add(record.organization_address_id);
        }
      });

      addNewEntryLocationOptions = locationOptions.filter(
        (option) => !locationsWithMasterData.has(option.value)
      );
      shouldDisableAddNewEntry = addNewEntryLocationOptions.length === 0;
    }
  }

  return NextResponse.json({
    success: true,
    data: paginatedData,
    totalCount: filteredByUploadType.length,
    counts,
    locationOptions,
    addNewEntryLocationOptions,
    baselineYear,
    financialYearMonth,
    shouldDisableAddNewEntry,
  });
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
