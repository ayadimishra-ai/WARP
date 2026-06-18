import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { Order_By } from "@/modules/ghg/graphql/shared/types";
import { getActivityFormMode } from "@/modules/ghg/lib/activity-form/activity-form-mode.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { isOrganizationAdmin as checkIsOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "@/modules/ghg/utils/const";

// ============================================================================
// Types
// ============================================================================

type RowData = Record<
  string,
  string | number | null | undefined | boolean | object
>;

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
  formMode?: "standard" | "prepopulate";
}

// ============================================================================
// Pre-population Logic (Server-side)
// ============================================================================

/**
 * Generate pre-populated rows for all locations
 * Match key: location x year x month
 * One row per location-year-month combination (no master data dimension)
 */
function generatePrePopulatedRows(
  locationOptions: Array<{ value: string; label: string }>,
  baselineYear: number | undefined,
  financialYearMonth: string | undefined
): RowData[] {
  if (!baselineYear || !financialYearMonth) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const monthNames = [...Month];

  const prePopulatedRows: RowData[] = [];

  locationOptions.forEach((location) => {
    for (let year = baselineYear; year <= currentYear; year++) {
      let monthsToGenerate: string[] = [];

      //   const financialMonthIndex = monthNames.findIndex(
      //     (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
      //   );
      //   if (financialMonthIndex !== -1) {
      //     monthsToGenerate = monthNames.slice(financialMonthIndex);
      //   } else {
      //     monthsToGenerate = monthNames;
      //   }
      // } else if (year === currentYear) {
      //   monthsToGenerate = monthNames.slice(0, currentMonth);
      // } else {
      //   monthsToGenerate = monthNames;
      // }
      const financialMonthIndex = monthNames.findIndex(
        (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
      );
      const startMonthIndex =
        year === baselineYear && financialMonthIndex !== -1
          ? financialMonthIndex
          : 0;
      const endMonthIndex =
        year === currentYear ? currentMonth : monthNames.length;

      monthsToGenerate =
        startMonthIndex < endMonthIndex
          ? monthNames.slice(startMonthIndex, endMonthIndex)
          : [];

      monthsToGenerate.forEach((month) => {
        prePopulatedRows.push({
          location: location.label,
          locationId: location.value,
          year: year.toString(),
          month: month,
          Types_of_Waste_Generated: null,
          Waste_Disposal_Managed_by: null,
          Name_of_Third_Party: null,
          Quantity_of_Waste: null,
          Quantity_of_Waste_UoM: null,
          Disposal_Mechanism: null,
          Location_of_Waste_Disposal: null,
          Who_Managed_Transportation_of_Waste: null,
          Mode_of_Transport: null,
          Vehicle_Type_Used_for_Road_Transport: null,
          Fuel_Used: null,
          DistOf_WasteDisposalLoction_from_FacilityLocation: null,
          DistOf_WasteDisposalLoction_from_FacilityLocation_UoM: null,
          status: "pending_data",
          _isPrePopulated: true,
          hasExistingData: false,
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
 */
function mergeWithExistingData(
  prePopulatedRows: RowData[],
  existingData: RowData[]
): RowData[] {
  const existingCombinations = new Set<string>();

  existingData.forEach((row) => {
    // const key = `${normalizeForComparison(row.location)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    const key = `${normalizeForComparison(row.locationId)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    existingCombinations.add(key);
  });

  const filteredPrePopulated = prePopulatedRows.filter((row) => {
    // const key = `${normalizeForComparison(row.location)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    const key = `${normalizeForComparison(row.locationId)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    return !existingCombinations.has(key);
  });

  const markedExistingData = existingData.map((row) => ({
    ...row,
    hasExistingData: true,
    _isPrePopulated: false,
  }));

  return [...markedExistingData, ...filteredPrePopulated];
}

const MONTH_ORDER: Record<string, number> = {
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

/**
 * Sort merged data: Year (Desc), Month (Desc), Location (Asc) — default fallback
 */
function sortMergedData(
  data: RowData[],
  formMode: string = FORM_MODE_STANDARD
): RowData[] {
  return data.sort((a, b) => {
    // Only sort by Updated At in STANDARD mode (Descending - newest first)
    if (formMode === FORM_MODE_STANDARD) {
      const updatedAtA = a.updatedAt
        ? new Date(a.updatedAt as string).getTime()
        : 0;
      const updatedAtB = b.updatedAt
        ? new Date(b.updatedAt as string).getTime()
        : 0;
      if (updatedAtA !== updatedAtB) {
        return updatedAtB - updatedAtA;
      }
    }

    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearA !== yearB) {
      return yearB - yearA;
    }

    const monthA = MONTH_ORDER[a.month as string] || 0;
    const monthB = MONTH_ORDER[b.month as string] || 0;
    if (monthA !== monthB) {
      return monthB - monthA;
    }

    const locationA = String(a.location || "").toLowerCase();
    const locationB = String(b.location || "").toLowerCase();
    return locationA.localeCompare(locationB);
  });
}

/**
 * Apply dynamic sorting based on frontend sorting state.
 * Falls back to default sort when no sorting state is provided.
 */
function applySorting(
  data: RowData[],
  sortingState: Array<{ id: string; desc: boolean }>,
  formMode: string = FORM_MODE_STANDARD
): RowData[] {
  if (!sortingState || sortingState.length === 0) {
    return sortMergedData(data, formMode);
  }

  return [...data].sort((a, b) => {
    for (const { id, desc } of sortingState) {
      let cmp = 0;
      switch (id) {
        case "year":
          cmp = (Number(a.year) || 0) - (Number(b.year) || 0);
          break;
        case "month":
          cmp =
            (MONTH_ORDER[a.month as string] || 0) -
            (MONTH_ORDER[b.month as string] || 0);
          break;
        case "location":
          cmp = String(a.location || "")
            .toLowerCase()
            .localeCompare(String(b.location || "").toLowerCase());
          break;
        case "Types_of_Waste_Generated":
          cmp = String(a.Types_of_Waste_Generated || "")
            .toLowerCase()
            .localeCompare(
              String(b.Types_of_Waste_Generated || "").toLowerCase()
            );
          break;
        case "Waste_Disposal_Managed_by":
          cmp = String(a.Waste_Disposal_Managed_by || "")
            .toLowerCase()
            .localeCompare(
              String(b.Waste_Disposal_Managed_by || "").toLowerCase()
            );
          break;
        case "Name_of_Third_Party":
          cmp = String(a.Name_of_Third_Party || "")
            .toLowerCase()
            .localeCompare(String(b.Name_of_Third_Party || "").toLowerCase());
          break;
        case "Quantity_of_Waste":
          cmp =
            (Number(a.Quantity_of_Waste) || 0) -
            (Number(b.Quantity_of_Waste) || 0);
          break;
        case "Quantity_of_Waste_UoM":
          cmp = String(a.Quantity_of_Waste_UoM || "")
            .toLowerCase()
            .localeCompare(String(b.Quantity_of_Waste_UoM || "").toLowerCase());
          break;
        case "Disposal_Mechanism":
          cmp = String(a.Disposal_Mechanism || "")
            .toLowerCase()
            .localeCompare(String(b.Disposal_Mechanism || "").toLowerCase());
          break;
        case "Location_of_Waste_Disposal":
          cmp = String(a.Location_of_Waste_Disposal || "")
            .toLowerCase()
            .localeCompare(
              String(b.Location_of_Waste_Disposal || "").toLowerCase()
            );
          break;
        case "Who_Managed_Transportation_of_Waste":
          cmp = String(a.Who_Managed_Transportation_of_Waste || "")
            .toLowerCase()
            .localeCompare(
              String(b.Who_Managed_Transportation_of_Waste || "").toLowerCase()
            );
          break;
        case "Mode_of_Transport":
          cmp = String(a.Mode_of_Transport || "")
            .toLowerCase()
            .localeCompare(String(b.Mode_of_Transport || "").toLowerCase());
          break;
        case "Vehicle_Type_Used_for_Road_Transport":
          cmp = String(a.Vehicle_Type_Used_for_Road_Transport || "")
            .toLowerCase()
            .localeCompare(
              String(b.Vehicle_Type_Used_for_Road_Transport || "").toLowerCase()
            );
          break;
        case "Fuel_Used":
          cmp = String(a.Fuel_Used || "")
            .toLowerCase()
            .localeCompare(String(b.Fuel_Used || "").toLowerCase());
          break;
        case "DistOf_WasteDisposalLoction_from_FacilityLocation":
          cmp =
            (Number(a.DistOf_WasteDisposalLoction_from_FacilityLocation) || 0) -
            (Number(b.DistOf_WasteDisposalLoction_from_FacilityLocation) || 0);
          break;
        case "DistOf_WasteDisposalLoction_from_FacilityLocation_UoM":
          cmp = String(
            a.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM || ""
          )
            .toLowerCase()
            .localeCompare(
              String(
                b.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM || ""
              ).toLowerCase()
            );
          break;
        case "createdByUserName":
          cmp = String(a.createdByUserName || "")
            .toLowerCase()
            .localeCompare(String(b.createdByUserName || "").toLowerCase());
          break;
        case "updatedByUserName":
          cmp = String(a.updatedByUserName || "")
            .toLowerCase()
            .localeCompare(String(b.updatedByUserName || "").toLowerCase());
          break;
        case "updatedAt":
          cmp =
            new Date(String(a.updatedAt || "")).getTime() -
            new Date(String(b.updatedAt || "")).getTime();
          break;
        default:
          cmp = 0;
      }
      if (cmp !== 0) return desc ? -cmp : cmp;
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
    const textFields = [
      row.location,
      row.month,
      row.Types_of_Waste_Generated,
      row.Waste_Disposal_Managed_by,
      row.Name_of_Third_Party,
      row.Disposal_Mechanism,
      row.Quantity_of_Waste_UoM,
      row.Location_of_Waste_Disposal,
      row.Who_Managed_Transportation_of_Waste,
      row.Mode_of_Transport,
      row.Vehicle_Type_Used_for_Road_Transport,
      row.Fuel_Used,
      row.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM,
      row.createdByUserName,
      row.updatedByUserName,
    ];

    for (const field of textFields) {
      if (field && String(field).toLowerCase().includes(searchValue)) {
        return true;
      }
    }

    if (isNumeric && Number(row.year) === numericValue) {
      return true;
    }

    if (isNumeric) {
      const numericFields = [
        row.Quantity_of_Waste,
        row.DistOf_WasteDisposalLoction_from_FacilityLocation,
      ];

      for (const field of numericFields) {
        const strField = String(field ?? "").trim();
        if (strField !== "" && strField.startsWith(searchValue)) {
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
// API Handler
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

  const body: ListRequestBody = await req.json();
  const {
    pagination = { pageIndex: 0, pageSize: 10 },
    sorting = [],
    globalFilter = "",
    uploadType = "all",
  } = body;

  // Hard-code the activity used for location access checks — never trust the
  // caller to provide this, as it would allow widening access to other activities.
  const activity = "waste";

  const sdk = await getGraphQlServerSDK();

  // Step 1: Fetch location options based on user role
  let locationOptions: Array<{ value: string; label: string }> = [];
  let organizationAddressIds: string[] = [];

  if (isOrgAdmin) {
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

  // Resolve form mode on the server from the platform feature-flag config.
  const { mode: resolvedFormMode } = await getActivityFormMode(organizationId);
  const effectiveFormMode: "standard" | "prepopulate" =
    isOrgAdmin || resolvedFormMode === "standard"
      ? FORM_MODE_STANDARD
      : FORM_MODE_PREPOPULATE;

  // Step 3: Fetch ALL existing waste data in pages to avoid 10k cap truncation
  const chunkSize = 1000;
  let offset = 0;
  let expectedTotalCount = 0;
  const existingWasteRows: any[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pageResult = await sdk.getActivityDataWastePaginated({
      organization_address_ids: organizationAddressIds,
      limit: chunkSize,
      offset,
      order_by: [
        { updated_at: Order_By.DescNullsLast },
        { TaskRequest: { year: Order_By.Desc } },
        { TaskRequest: { month: Order_By.Desc } },
      ],
      activityFilter: {},
    });

    const pageRows = pageResult.GHGWaste || [];
    if (offset === 0) {
      expectedTotalCount = pageResult.totalCount?.length || 0;
    }

    existingWasteRows.push(...pageRows);

    if (pageRows.length < chunkSize) break;
    if (
      expectedTotalCount > 0 &&
      existingWasteRows.length >= expectedTotalCount
    ) {
      break;
    }

    offset += chunkSize;
  }

  // Step 4: Transform existing data to RowData format
  const existingData: RowData[] = existingWasteRows.map((w: any) => {
    const taskRequest = w.TaskRequest || {};
    const locationName = taskRequest.OrganizationAddress?.Address?.name || "";

    return {
      id: w.id || "",
      task_request_id: taskRequest.id || "",
      location: locationName,
      locationId: taskRequest.organization_address_id || "",
      year: taskRequest.year?.toString() || "",
      month: taskRequest.month || "",
      Types_of_Waste_Generated: w.Types_of_Waste_Generated ?? "",
      Waste_Disposal_Managed_by: w.Waste_Disposal_Managed_by ?? "",
      Name_of_Third_Party: w.Name_of_Third_Party ?? "",
      Quantity_of_Waste: w.Quantity_of_Waste ?? "",
      Quantity_of_Waste_UoM: w.Quantity_of_Waste_UoM ?? "",
      Disposal_Mechanism: w.Disposal_Mechanism ?? "",
      Location_of_Waste_Disposal: w.Location_of_Waste_Disposal ?? "",
      Who_Managed_Transportation_of_Waste:
        w.Who_Managed_Transportation_of_Waste ?? "",
      Mode_of_Transport: w.Mode_of_Transport ?? "",
      Vehicle_Type_Used_for_Road_Transport:
        w.Vehicle_Type_Used_for_Road_Transport ?? "",
      Fuel_Used: w.Fuel_Used ?? "",
      DistOf_WasteDisposalLoction_from_FacilityLocation:
        w.DistOf_WasteDisposalLoction_from_FacilityLocation ?? "",
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM:
        w.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM ?? "",
      createdByUserName: w.CreatedByUser?.name || w.created_by || "",
      updatedByUserName: w.UpdatedByUser?.name || "",
      metadata: w.metadata ?? null,
      updatedAt: w.updated_at || "",
      status: w.status ?? "saved",
      _isPrePopulated: false,
      hasExistingData: true,
    };
  });

  // Step 5: Generate pre-populated rows (only in prepopulate mode)
  let prePopulatedRows: RowData[] = [];
  if (effectiveFormMode === FORM_MODE_PREPOPULATE) {
    prePopulatedRows = generatePrePopulatedRows(
      locationOptions,
      baselineYear,
      financialYearMonth
    );
  }

  // Step 6: Merge pre-populated rows with existing data
  const dataToUse =
    effectiveFormMode === FORM_MODE_STANDARD
      ? existingData
      : mergeWithExistingData(prePopulatedRows, existingData);

  // Step 7: Sort merged data
  const sortedData = applySorting(dataToUse, sorting, effectiveFormMode);

  // Step 8: Apply global filter
  const filteredBySearch = applyGlobalFilter(sortedData, globalFilter);

  // Step 9: Calculate counts for each tab (before upload type filter)
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

  // Step 10: Apply upload type filter
  const filteredByUploadType = applyUploadTypeFilter(
    filteredBySearch,
    uploadType
  );

  // Step 11: Apply pagination
  const paginatedData = applyPagination(
    filteredByUploadType,
    pagination.pageIndex,
    pagination.pageSize
  );

  // Step 12: Location options for "Add new entry"
  // Waste has no OrgActivityMaster entries, so all locations are available
  const addNewEntryLocationOptions = locationOptions;
  const shouldDisableAddNewEntry = false;

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
