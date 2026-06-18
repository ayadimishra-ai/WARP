import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { Order_By } from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { Month } from "~/lib/shared/constants/input.constant";
import { isOrganizationAdmin as checkIsOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "~/utils/const";

// Master keys for fuel consumption general module
const FUEL_TYPE_MASTER_KEY = "Energy_FuelPurchased_General_FuelType";
const FUEL_TYPE_UOM_MASTER_KEY = "Energy_FuelPurchased_General_FuelType_UOM";
const DEFAULT_MASTER_KEYS = [FUEL_TYPE_MASTER_KEY, FUEL_TYPE_UOM_MASTER_KEY];

// ============================================================================
// Types
// ============================================================================

type RowData = Record<
  string,
  string | number | null | undefined | boolean | object
>;

interface SelectOption {
  label: string;
  value: string;
}

// ============================================================================
// Master Data Functions
// ============================================================================

function extractFuelTypes(masterData: any): SelectOption[] {
  try {
    if (!Array.isArray(masterData)) return [];

    return masterData
      .map((item) => {
        if (typeof item === "object" && item.label && item.value) {
          return {
            label: String(item.label),
            value: String(item.value),
          };
        }
        return null;
      })
      .filter((item): item is SelectOption => Boolean(item));
  } catch {
    return [];
  }
}

// ============================================================================
// Pre-population Logic (Server-side)
// ============================================================================

function generatePrePopulatedRows(
  locationFuelTypeOptions: Array<{
    location: { value: string; label: string };
    fuelTypeOptions: SelectOption[];
  }>,
  baselineYear: number | undefined,
  financialYearMonth: string | undefined,
  configuredLocationIds: Set<string>
): RowData[] {
  if (!baselineYear || !financialYearMonth) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthNames = [...Month];

  const prePopulatedRows: RowData[] = [];

  locationFuelTypeOptions.forEach(({ location, fuelTypeOptions }) => {
    // Only generate skeleton rows for OrgActivityMaster-configured locations
    if (fuelTypeOptions.length === 0) return;

    const fuelTypesToGenerate = fuelTypeOptions;
    const locationHasMasterData = configuredLocationIds.has(location.value);

    for (let year = baselineYear; year <= currentYear; year++) {
      let monthsToGenerate: string[] = [];

      if (year === baselineYear) {
        const startIndex = monthNames.findIndex(
          (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
        );
        if (startIndex !== -1) {
          monthsToGenerate = monthNames.slice(startIndex);
        } else {
          monthsToGenerate = monthNames;
        }
      } else if (year === currentYear) {
        monthsToGenerate = monthNames.slice(0, currentMonth);
      } else {
        monthsToGenerate = monthNames;
      }

      monthsToGenerate.forEach((month) => {
        fuelTypesToGenerate.forEach((fuelType) => {
          prePopulatedRows.push({
            location: location.label,
            locationId: location.value,
            year: year.toString(),
            month,
            typeOfFuelPurchased: fuelType.label,
            quantityOfFuelConsumed: "",
            quantityOfFuelConsumedUom: "",
            qualityOfFuel: "",
            pointOfConsumption: "",
            createdByUserName: "",
            updatedByUserName: "",
            updatedAt: "",
            _isPrePopulated: 1,
            _isMasterDataValue: 1,
            _locationHasMasterData: locationHasMasterData,
          });
        });
      });
    }
  });

  return prePopulatedRows;
}

function normalizeForComparison(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function mergeWithExistingData(
  prePopulatedRows: RowData[],
  existingData: RowData[]
): RowData[] {
  const existingCombinations = new Set<string>();

  existingData.forEach((row) => {
    const location = normalizeForComparison(row.location);
    const year = normalizeForComparison(row.year);
    const month = normalizeForComparison(row.month);
    const fuelType = normalizeForComparison(row.typeOfFuelPurchased);

    const key = `${location}|${year}|${month}|${fuelType}`;
    existingCombinations.add(key);
  });

  const filteredPrePopulated = prePopulatedRows.filter((row) => {
    const location = normalizeForComparison(row.location);
    const year = normalizeForComparison(row.year);
    const month = normalizeForComparison(row.month);
    const fuelType = normalizeForComparison(row.typeOfFuelPurchased);

    const key = `${location}|${year}|${month}|${fuelType}`;
    return !existingCombinations.has(key);
  });

  return [...existingData, ...filteredPrePopulated];
}

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
        ? new Date(a.updatedAt as string).getTime()
        : 0;
      const updatedAtB = b.updatedAt
        ? new Date(b.updatedAt as string).getTime()
        : 0;
      if (updatedAtA !== updatedAtB) return updatedAtB - updatedAtA;
    }

    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearA !== yearB) return yearB - yearA;

    const monthA = monthOrder[a.month as string] || 0;
    const monthB = monthOrder[b.month as string] || 0;
    if (monthA !== monthB) return monthB - monthA;

    const locationA = String(a.location || "").toLowerCase();
    const locationB = String(b.location || "").toLowerCase();
    if (locationA !== locationB) return locationA.localeCompare(locationB);

    const fuelTypeA = String(a.typeOfFuelPurchased || "").toLowerCase();
    const fuelTypeB = String(b.typeOfFuelPurchased || "").toLowerCase();
    return fuelTypeA.localeCompare(fuelTypeB);
  });
}

/**
 * Apply dynamic sorting based on frontend sorting state
 * If no sorting state provided, use default sorting (Year Desc, Month Desc, Location Asc, etc.)
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
        case "typeOfFuelPurchased":
          compareResult = String(a.typeOfFuelPurchased || "")
            .toLowerCase()
            .localeCompare(String(b.typeOfFuelPurchased || "").toLowerCase());
          break;
        case "quantityOfFuelConsumed":
          compareResult =
            (Number(a.quantityOfFuelConsumed) || 0) -
            (Number(b.quantityOfFuelConsumed) || 0);
          break;
        case "quantityOfFuelConsumedUom":
          compareResult = String(a.quantityOfFuelConsumedUom || "")
            .toLowerCase()
            .localeCompare(
              String(b.quantityOfFuelConsumedUom || "").toLowerCase()
            );
          break;
        case "qualityOfFuel":
          compareResult =
            (Number(a.qualityOfFuel) || 0) - (Number(b.qualityOfFuel) || 0);
          break;
        case "pointOfConsumption":
          compareResult = String(a.pointOfConsumption || "")
            .toLowerCase()
            .localeCompare(String(b.pointOfConsumption || "").toLowerCase());
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

function applyGlobalFilter(data: RowData[], globalFilter: string): RowData[] {
  if (!globalFilter || globalFilter.trim() === "") return data;

  const searchValue = globalFilter.trim().toLowerCase();
  const numericValue = Number(searchValue);
  const isNumeric = !isNaN(numericValue);

  return data.filter((row) => {
    const searchableFields = [
      row.location,
      row.month,
      row.typeOfFuelPurchased,
      row.quantityOfFuelConsumedUom,
      row.qualityOfFuel,
      row.pointOfConsumption,
      row.createdByUserName,
      row.updatedByUserName,
    ];

    const textMatch = searchableFields.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(searchValue)
    );

    const floatStartsWith = (fieldValue: unknown) =>
      String(fieldValue ?? "").startsWith(searchValue);

    const numericMatch =
      isNumeric &&
      (Number(row.year) === numericValue ||
        floatStartsWith(row.quantityOfFuelConsumed) ||
        floatStartsWith(row.qualityOfFuel));

    return textMatch || numericMatch;
  });
}

function applyPagination(
  data: RowData[],
  pageIndex: number,
  pageSize: number
): RowData[] {
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

// ============================================================================
// API Handler
// ============================================================================

async function handleRequest(
  req: NextRequest,
  userSession?: TUserSession
): Promise<NextResponse> {
  // Support both GET (query params) and POST (body) for flexibility
  let pageIndex = 0;
  let pageSize = 10;
  let statusFilter = "all";
  let formMode: "standard" | "prepopulate" = FORM_MODE_STANDARD;
  let globalFilter = "";
  let sorting: Array<{ id: string; desc: boolean }> = [];

  if (req.method === "GET") {
    const { searchParams } = new URL(req.url);
    pageIndex = parseInt(searchParams.get("pageIndex") ?? "0");
    pageSize = parseInt(searchParams.get("pageSize") ?? "10");
    statusFilter = searchParams?.get("statusFilter") ?? "all";
    const formModeParam = searchParams?.get("formMode");
    formMode =
      formModeParam === FORM_MODE_PREPOPULATE
        ? FORM_MODE_PREPOPULATE
        : FORM_MODE_STANDARD;
    globalFilter = searchParams?.get("search") ?? "";
  } else if (req.method === "POST") {
    const body = await req.json();
    pageIndex = body.pagination?.pageIndex ?? 0;
    pageSize = body.pagination?.pageSize ?? 10;
    statusFilter = body.statusFilter ?? "all";
    const formModeParam = body.formMode;
    formMode =
      formModeParam === FORM_MODE_PREPOPULATE
        ? FORM_MODE_PREPOPULATE
        : FORM_MODE_STANDARD;
    globalFilter = body.globalFilter ?? "";
    sorting = body.sorting ?? [];
  }

  const organizationId = userSession?.organizationId || "";
  const userId = userSession?.userId || "";

  if (!organizationId) {
    return NextResponse.json({
      success: false,
      message: "Organization ID is required",
    });
  }

  const sdk = await getGraphQlServerSDK();
  const isOrganizationAdmin = checkIsOrganizationAdmin(
    userSession?.userRole || ""
  );

  // Organization admins always use standard mode (no pre-population)
  if (isOrganizationAdmin) {
    formMode = FORM_MODE_STANDARD;
  }

  // Step 1: Fetch locations
  const locationOptions: Array<{ value: string; label: string }> = [];
  const organizationAddressIds: string[] = [];

  if (isOrganizationAdmin) {
    const adminResult = await sdk.getAddresses({
      organisationAddressId: organizationId,
    });

    if (adminResult.OrganizationAddress) {
      adminResult.OrganizationAddress.forEach((address: any) => {
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
        if (id && name && mapping.activities?.includes("energy")) {
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
      allCount: 0,
      pendingCount: 0,
      submittedCount: 0,
      locationOptions,
      locationsForAddNew: locationOptions,
      fuelTypeOptions: [],
      baselineYear: undefined,
      financialYearMonth: undefined,
      prepopulateMode: null,
    });
  }

  // Step 2: Fetch org data
  const orgResult = await sdk.getOrgData({ organizationId });
  const organization = orgResult.Organization?.[0];
  const baselineYear = organization?.Baselineyear;
  const financialYearMonth = organization?.FinancialYearMonth;

  // Step 3: Fetch master data
  const masterDataResult = await sdk.getActivityMasterDataForDefaultRows({
    organizationId,
    organizationAddressIds,
    masterKeys: DEFAULT_MASTER_KEYS,
  });

  const orgActivityMasterRecords = masterDataResult.OrgActivityMaster || [];
  const activityMasterRecords = masterDataResult.ActivityMaster || [];

  const orgFuelTypeMasterRecords = orgActivityMasterRecords.filter(
    (record) => record.master_key === FUEL_TYPE_MASTER_KEY
  );

  const hasOrgLevelFuelTypeConfig = orgFuelTypeMasterRecords.some(
    (record) => !record.organization_address_id
  );

  const configuredLocationIds = new Set<string>(
    orgFuelTypeMasterRecords
      .map((record) => record.organization_address_id)
      .filter((id): id is string => Boolean(id))
  );


  // Get fuel type options from ActivityMaster only (for dropdown display)
  let fuelTypeOptions: SelectOption[] = [];

  const globalFuelTypeMaster = activityMasterRecords.find(
    (record) => record.master_key === FUEL_TYPE_MASTER_KEY
  );
  if (globalFuelTypeMaster?.master_data) {
    fuelTypeOptions = extractFuelTypes(globalFuelTypeMaster.master_data);
  }

  // Get UOM grouping data from ActivityMaster only (for dropdown display)
  let uomGroupingData: any[] = [];

  const globalUomMaster = activityMasterRecords.find(
    (record) => record.master_key === FUEL_TYPE_UOM_MASTER_KEY
  );
  if (globalUomMaster?.master_data) {
    uomGroupingData = globalUomMaster.master_data;
  }

  const orgLevelFuelTypeMaster = orgFuelTypeMasterRecords.find(
    (record) => !record.organization_address_id
  );

  const fuelTypeOptionsByLocationId = new Map<string, SelectOption[]>();
  locationOptions.forEach((location) => {
    let resolvedFuelTypeOptions: SelectOption[] = [];

    if (orgLevelFuelTypeMaster?.master_data) {
      resolvedFuelTypeOptions = extractFuelTypes(
        orgLevelFuelTypeMaster.master_data
      );
    } else {
      const locationSpecificFuelTypeMaster = orgFuelTypeMasterRecords.find(
        (record) => record.organization_address_id === location.value
      );

      if (locationSpecificFuelTypeMaster?.master_data) {
        resolvedFuelTypeOptions = extractFuelTypes(
          locationSpecificFuelTypeMaster.master_data
        );
      }
    }

    // No ActivityMaster fallback — unconfigured locations map to []
    // and generatePrePopulatedRows will emit 1 empty skeleton row for them.
    fuelTypeOptionsByLocationId.set(location.value, resolvedFuelTypeOptions);
  });

  // Build OrgActivityMaster fuel type values per location for per-value lock comparison.
  const orgMasterFuelValuesByLocation = new Map<string, Set<string>>();
  for (const [locationId, options] of fuelTypeOptionsByLocationId) {
    orgMasterFuelValuesByLocation.set(
      locationId,
      new Set(options.map((o) => o.label.toLowerCase().trim()))
    );
  }

  // Step 4: Fetch existing data
  const existingDataResult =
    await sdk.getActivityDataEnergyFuelConsumptionGeneralPaginated({
      organization_address_ids: organizationAddressIds,
      limit: 10000,
      offset: 0,
      order_by: [{ updated_at: Order_By.DescNullsLast }],
      activityFilter: {},
    });

  const existingData: RowData[] = (
    existingDataResult.GHGEnergyConsumption_FuelPurchased_General || []
  ).map((f: any) => ({
    id: f.id || "",
    location:
      f.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.OrganizationAddress
        ?.Address?.name || "",
    locationId:
      f.GHGEnergyConsumption_FuelPurchased?.TaskRequest
        ?.organization_address_id || "",
    year:
      f.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.year?.toString() || "",
    month: f.GHGEnergyConsumption_FuelPurchased?.TaskRequest?.month || "",
    typeOfFuelPurchased: f.Type_of_Fuel_Purchased || "",
    quantityOfFuelConsumed: f.Quantity_of_fuel_Consumed ?? "",
    quantityOfFuelConsumedUom: f.Quantity_of_fuel_Consumed_uom || "",
    qualityOfFuel: f.Quality_of_fuel || "",
    pointOfConsumption: f.Point_of_Consumption || "",
    createdByUserName:
      f.GHGEnergyConsumption_FuelPurchased?.CreatedByUser?.name ||
      f.GHGEnergyConsumption_FuelPurchased?.created_by ||
      "",
    updatedByUserName:
      f.GHGEnergyConsumption_FuelPurchased?.UpdatedByUser?.name || "",
    updatedAt:
      f.updated_at || f.GHGEnergyConsumption_FuelPurchased?.updated_at || "",
    status: f.GHGEnergyConsumption_FuelPurchased?.status ?? "saved",
    _isPrePopulated: 0,
    _isMasterDataValue: (() => {
      const locId =
        f.GHGEnergyConsumption_FuelPurchased?.TaskRequest
          ?.organization_address_id || "";
      const orgValues = orgMasterFuelValuesByLocation.get(locId);
      const fuelValue = (f.Type_of_Fuel_Purchased || "").toLowerCase().trim();
      return orgValues && orgValues.size > 0 && orgValues.has(fuelValue) ? 1 : 0;
    })(),
  }));

  // Step 5: Generate pre-populated rows if in prepopulate mode
  let prePopulatedRows: RowData[] = [];
  if (formMode === FORM_MODE_PREPOPULATE) {
    prePopulatedRows = generatePrePopulatedRows(
      locationOptions.map((location) => ({
        location,
        fuelTypeOptions: fuelTypeOptionsByLocationId.get(location.value) || [],
      })),
      baselineYear,
      financialYearMonth,
      configuredLocationIds
    );
  }

  // Step 6: Merge data
  let mergedData: RowData[];
  if (formMode !== FORM_MODE_PREPOPULATE) {
    mergedData = existingData;
  } else {
    mergedData = mergeWithExistingData(prePopulatedRows, existingData);

    // Non-configured locations (no fuel type options) get general skeleton rows
    // (location × month × year, no fuel type) so they appear in the table.
    if (baselineYear && financialYearMonth) {
      const nonConfiguredLocations = locationOptions.filter(
        (loc) => (fuelTypeOptionsByLocationId.get(loc.value) ?? []).length === 0
      );
      if (nonConfiguredLocations.length > 0) {
        const nonConfiguredIds = new Set(nonConfiguredLocations.map((l) => l.value));
        const existingKeys3 = new Set<string>(
          existingData
            .filter((r) => nonConfiguredIds.has(String(r.locationId ?? "")))
            .map((r) =>
              `${String(r.locationId ?? "").toLowerCase()}|${String(r.year ?? "")}|${String(r.month ?? "").toLowerCase()}`
            )
        );
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const monthNames = [...Month];
        for (const loc of nonConfiguredLocations) {
          for (let year = baselineYear; year <= currentYear; year++) {
            let monthsToGenerate: string[];
            if (year === baselineYear) {
              const startIndex = monthNames.findIndex(
                (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
              );
              monthsToGenerate = startIndex !== -1 ? monthNames.slice(startIndex) : monthNames;
            } else if (year === currentYear) {
              monthsToGenerate = monthNames.slice(0, currentMonth);
            } else {
              monthsToGenerate = monthNames;
            }
            for (const month of monthsToGenerate) {
              const key = `${loc.value.toLowerCase()}|${year}|${month.toLowerCase()}`;
              if (existingKeys3.has(key)) continue;
              mergedData.push({
                location: loc.label,
                locationId: loc.value,
                year: String(year),
                month,
                typeOfFuelPurchased: "",
                quantityOfFuelConsumed: "",
                quantityOfFuelConsumedUom: "",
                qualityOfFuel: "",
                pointOfConsumption: "",
                createdByUserName: "",
                updatedByUserName: "",
                updatedAt: "",
                _isPrePopulated: 1,
                _isMasterDataValue: 0,
                _locationHasMasterData: false,
              });
            }
          }
        }
      }
    }
  }

  // Step 7: Apply dynamic sorting based on frontend sorting state
  const sortedData = applySorting(mergedData, sorting, formMode);

  // Step 8: Apply global filter
  const filteredData = applyGlobalFilter(sortedData, globalFilter);

  // Step 9: Apply status filter
  let statusFilteredData = filteredData;
  if (statusFilter === "pending") {
    statusFilteredData = filteredData.filter((r) => r._isPrePopulated === 1);
  } else if (statusFilter === "submitted") {
    statusFilteredData = filteredData.filter((r) => r._isPrePopulated === 0);
  }

  const allCount = filteredData.length;
  const pendingCount = filteredData.filter(
    (r) => r._isPrePopulated === 1
  ).length;
  const submittedCount = filteredData.filter(
    (r) => r._isPrePopulated === 0
  ).length;

  // Step 10: Apply pagination
  const paginatedData = applyPagination(
    statusFilteredData,
    pageIndex,
    pageSize
  );

  // Step 11: Locations available for add new entry
  // In prepopulate mode, allow only locations not covered by prepopulate skeleton rows.
  let locationsForAddNew: SelectOption[] = [];

  if (formMode === FORM_MODE_PREPOPULATE) {
    // Mirror the non-renewable pattern: exclude only OrgActivityMaster-configured locations.
    // Unconfigured locations appear in "Add new entry" since they have no locked fuel type.
    if (hasOrgLevelFuelTypeConfig) {
      locationsForAddNew = [];
    } else {
      locationsForAddNew = locationOptions.filter(
        (loc) => !configuredLocationIds.has(loc.value)
      );
    }
  } else {
    const usedLocationIds = new Set(
      existingData.map((row) => row.locationId).filter(Boolean) as string[]
    );
    locationsForAddNew = locationOptions.filter(
      (loc) => !usedLocationIds.has(loc.value)
    );
  }

  return NextResponse.json({
    success: true,
    data: paginatedData,
    totalCount: statusFilteredData.length,
    allCount,
    pendingCount,
    submittedCount,
    locationOptions,
    locationsForAddNew,
    fuelTypeOptions,
    uomGrouping: uomGroupingData,
    baselineYear,
    financialYearMonth,
    prepopulateMode: formMode === FORM_MODE_PREPOPULATE ? "prepopulate" : null,
  });
}

export const GET = apiExceptionGuard(apiAuthGuard(handleRequest));
export const POST = apiExceptionGuard(apiAuthGuard(handleRequest));
