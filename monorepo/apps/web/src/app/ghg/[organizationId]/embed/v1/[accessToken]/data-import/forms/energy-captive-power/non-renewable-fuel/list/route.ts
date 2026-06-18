import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { Order_By } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { isOrganizationAdmin as checkIsOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "@/modules/ghg/utils/const";

// Use master keys from CaptiveActivityConstant for pre-populating default rows
const FUEL_TYPE_MASTER_KEY = "Energy_CaptivePower_NonRenewable_FuelType";
const FUEL_TYPE_UOM_MASTER_KEY =
  "Energy_CaptivePower_NonRenewable_FuelType_UOM";
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

interface FuelTypeMasterData {
  label: string;
  value: string;
}

interface UOMData {
  label: string;
  value: string;
  group: string[]; // Array of fuel type values this UOM belongs to
}

// ============================================================================
// Master Data Functions
// ============================================================================

/**
 * Get fuel types for a specific location from master data
 * Priority:
 * 1. OrgActivityMaster with organization_address_id (location-specific)
 * 2. OrgActivityMaster with organization_id only (org-level)
 * No fallback to ActivityMaster — unconfigured locations return [] and
 * generatePrePopulatedRows will emit 1 empty skeleton row for them.
 */
function getFuelTypesForLocation(
  locationId: string,
  organizationId: string,
  orgActivityMasterRecords: Array<{
    organization_id?: string | null;
    organization_address_id?: string | null;
    master_key: string;
    master_data: any;
  }>
): SelectOption[] {
  // Priority 1: Check for location-specific master data
  const locationSpecificRecord = orgActivityMasterRecords.find(
    (record) =>
      record.master_key === FUEL_TYPE_MASTER_KEY &&
      record.organization_address_id === locationId
  );

  if (locationSpecificRecord?.master_data) {
    const fuelTypes = extractFuelTypes(locationSpecificRecord.master_data);
    if (fuelTypes.length > 0) return fuelTypes;
  }

  // Priority 2: Check for org-level master data (no organization_address_id)
  const orgLevelRecord = orgActivityMasterRecords.find(
    (record) =>
      record.master_key === FUEL_TYPE_MASTER_KEY &&
      record.organization_id === organizationId &&
      !record.organization_address_id
  );

  if (orgLevelRecord?.master_data) {
    const fuelTypes = extractFuelTypes(orgLevelRecord.master_data);
    if (fuelTypes.length > 0) return fuelTypes;
  }

  // No OrgActivityMaster data found — return empty array.
  // Caller will generate 1 empty skeleton row per year × month for this location.
  return [];
}

/**
 * Extract fuel types from master_data
 * master_data format: [{ "label": "Coal", "value": "coal" }, ...]
 */
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

/**
 * Build a map of fuelTypeLabel → UoM options from ActivityMaster data.
 * UoM items have a `group` array listing the fuel-type values they belong to.
 */
function buildFuelUnitOptionsMap(
  activityMasters: Array<{ master_key: string; master_data: unknown }>,
  orgActivityMasters: Array<{
    organization_id?: string | null;
    organization_address_id?: string | null;
    master_key: string;
    master_data: unknown;
  }>,
  organizationId: string
): Record<string, SelectOption[]> {
  // Get fuel type data for mapping labels
  const fuelTypeMaster = activityMasters.find(
    (m) => m.master_key === FUEL_TYPE_MASTER_KEY
  );
  const fuelTypeData = Array.isArray(fuelTypeMaster?.master_data)
    ? (fuelTypeMaster.master_data as any[])
    : [];

  // Get UOM data - prioritize organization data
  let uomData: any[] = [];

  // Check organization-level UOM data first
  const orgUomMaster = orgActivityMasters.find(
    (m) =>
      m.master_key === FUEL_TYPE_UOM_MASTER_KEY &&
      m.organization_id === organizationId &&
      !m.organization_address_id
  );

  if (orgUomMaster?.master_data && Array.isArray(orgUomMaster.master_data)) {
    uomData = orgUomMaster.master_data as any[];
  } else {
    // Fallback to global UOM data
    const globalUomMaster = activityMasters.find(
      (m) => m.master_key === FUEL_TYPE_UOM_MASTER_KEY
    );
    if (
      globalUomMaster?.master_data &&
      Array.isArray(globalUomMaster.master_data)
    ) {
      uomData = globalUomMaster.master_data as any[];
    }
  }

  const optionsMap: Record<string, SelectOption[]> = {};

  // Initialize map for each fuel type
  for (const fuelType of fuelTypeData) {
    if (fuelType?.label) {
      optionsMap[fuelType.label] = [];
    }
  }

  // Map UOM options to fuel types based on the group array
  for (const uom of uomData) {
    if (uom?.label && uom?.value && Array.isArray(uom?.group)) {
      // Find fuel types that match the group values
      for (const groupValue of uom.group) {
        const matchedFuelType = fuelTypeData.find(
          (ft) => ft?.value === groupValue
        );
        if (matchedFuelType?.label) {
          optionsMap[matchedFuelType.label] =
            optionsMap[matchedFuelType.label] || [];
          optionsMap[matchedFuelType.label].push({
            label: uom.label,
            value: uom.value,
          });
        }
      }
    }
  }

  return optionsMap;
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
  formMode?: "standard" | "prepopulate";
}

// ============================================================================
// Pre-population Logic (Server-side)
// ============================================================================

/**
 * Generate pre-populated rows for all locations
 * Match key: location × year × month × fuel_type
 * If a location has OrgActivityMaster fuel types, generate rows for each fuel type.
 * If a location has NO OrgActivityMaster data, generate 1 empty row per year × month.
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
  }>,
  configuredLocationIds: Set<string>
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
    // Only generate skeleton rows for OrgActivityMaster-configured locations
    if (!configuredLocationIds.has(location.value)) return;

    // Get fuel types for this location (OrgActivityMaster only, no ActivityMaster fallback)
    const fuelTypesForLocation = getFuelTypesForLocation(
      location.value,
      organizationId,
      orgActivityMasterRecords
    );

    // Skip if no fuel types — location is configured but has no fuel type master data
    if (fuelTypesForLocation.length === 0) return;

    const fuelTypesToGenerate = fuelTypesForLocation;

    // Generate for each year from baseline to current
    for (let year = baselineYear; year <= currentYear; year++) {
      // Determine months for this year
      let monthsToGenerate: string[] = [];

      if (year === baselineYear) {
        // For baseline year, start from financial year month
        const startIndex = monthNames.findIndex(
          (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
        );
        if (startIndex !== -1) {
          monthsToGenerate = monthNames.slice(startIndex);
        } else {
          monthsToGenerate = monthNames;
        }
      } else if (year === currentYear) {
        // For current year, only up to previous month
        monthsToGenerate = monthNames.slice(0, currentMonth);
      } else {
        // For other years, all months
        monthsToGenerate = monthNames;
      }

      // Generate rows for each month and fuel type
      monthsToGenerate.forEach((month) => {
        fuelTypesToGenerate.forEach((fuelType) => {
          prePopulatedRows.push({
            // No `id` for pre-populated rows - they don't exist in DB yet
            // Use _isPrePopulated flag to identify them
            task_request_id: "",
            location: location.label,
            locationId: location.value,
            year: year.toString(),
            month: month,
            typeOfFuelUsed: fuelType.label || "",
            quantityOfFuelConsumed: "",
            UoMForTheQuantityOfFuelConsumed: "",
            qualityOfFuel: "",
            unitOfEnergyGenerated: "",
            createdByUserName: "",
            updatedByUserName: "",
            metadata: null,
            updatedAt: "",
            status: "pending_data",
            _isPrePopulated: true,
            _isMasterDataValue: true,
            hasExistingData: false,
            _locationHasMasterData: configuredLocationIds.has(location.value),
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
 * Match key: ${location}|${year}|${month}|${fuel_type} (normalized, case-insensitive)
 * If ANY data exists for a location-year-month-fuel_type combination, exclude that prepopulated row
 */
function mergeWithExistingData(
  prePopulatedRows: RowData[],
  existingData: RowData[]
): RowData[] {
  // Create a Set of existing location-year-month-fuel_type combinations for fast lookup
  const existingCombinations = new Set<string>();

  existingData.forEach((row) => {
    const location = normalizeForComparison(row.location);
    const year = normalizeForComparison(row.year);
    const month = normalizeForComparison(row.month);
    const fuelType = normalizeForComparison(row.typeOfFuelUsed);

    const key = `${location}|${year}|${month}|${fuelType}`;
    existingCombinations.add(key);
  });

  // Filter out pre-populated rows that have existing data for the same combination
  const filteredPrePopulated = prePopulatedRows.filter((row) => {
    const location = normalizeForComparison(row.location);
    const year = normalizeForComparison(row.year);
    const month = normalizeForComparison(row.month);
    const fuelType = normalizeForComparison(row.typeOfFuelUsed);

    const key = `${location}|${year}|${month}|${fuelType}`;
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
 * - Standard mode: updatedAt (Desc), Year (Desc), Month (Desc), Location (Asc), Fuel Type (Asc)
 * - Prepopulate mode: Year (Desc), Month (Desc), Location (Asc), Fuel Type (Asc)
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
      if (updatedAtA !== updatedAtB) return updatedAtB - updatedAtA;
    }

    // 1. Year (descending)
    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearA !== yearB) return yearB - yearA;

    // 2. Month (descending)
    const monthA = monthOrder[a.month as string] || 0;
    const monthB = monthOrder[b.month as string] || 0;
    if (monthA !== monthB) return monthB - monthA;

    // 3. Location (ascending)
    const locationA = String(a.location || "").toLowerCase();
    const locationB = String(b.location || "").toLowerCase();
    if (locationA !== locationB) return locationA.localeCompare(locationB);

    // 4. Fuel Type (ascending)
    const fuelTypeA = String(a.typeOfFuelUsed || "").toLowerCase();
    const fuelTypeB = String(b.typeOfFuelUsed || "").toLowerCase();
    return fuelTypeA.localeCompare(fuelTypeB);
  });
}

/**
 * Check if a row has AI extracted data
 */
function hasAIExtractedData(metadata: unknown): boolean {
  if (!metadata) return false;

  try {
    const metaObj =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return !!(
      metaObj?.AIExtractedData &&
      Object.keys(metaObj.AIExtractedData).length > 0
    );
  } catch {
    return false;
  }
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
        case "typeOfFuelUsed":
          compareResult = String(a.typeOfFuelUsed || "")
            .toLowerCase()
            .localeCompare(String(b.typeOfFuelUsed || "").toLowerCase());
          break;
        case "quantityOfFuelConsumed":
          compareResult =
            (Number(a.quantityOfFuelConsumed) || 0) -
            (Number(b.quantityOfFuelConsumed) || 0);
          break;
        case "UoMForTheQuantityOfFuelConsumed":
          compareResult = String(a.UoMForTheQuantityOfFuelConsumed || "")
            .toLowerCase()
            .localeCompare(
              String(b.UoMForTheQuantityOfFuelConsumed || "").toLowerCase()
            );
          break;
        case "qualityOfFuel":
          compareResult =
            (Number(a.qualityOfFuel) || 0) - (Number(b.qualityOfFuel) || 0);
          break;
        case "unitOfEnergyGeneratedInKwh":
          compareResult =
            (Number(a.unitOfEnergyGenerated) || 0) -
            (Number(b.unitOfEnergyGenerated) || 0);
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
 * Apply global filter to merged data
 */
function applyGlobalFilter(data: RowData[], globalFilter: string): RowData[] {
  if (!globalFilter || globalFilter.trim() === "") return data;

  const searchValue = globalFilter.trim().toLowerCase();
  const numericValue = Number(searchValue);
  const isNumeric = !isNaN(numericValue) && searchValue !== "";

  return data.filter((row) => {
    // Search in key fields
    const searchableFields = [
      row.location,
      row.month,
      row.typeOfFuelUsed,
      row.UoMForTheQuantityOfFuelConsumed,
      row.qualityOfFuel,
      row.createdByUserName,
      row.updatedByUserName,
    ];

    // Text search
    const textMatch = searchableFields.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(searchValue)
    );

    // Numeric search for year and quantities
    // Guard against empty/null values because Number("") === 0 which would
    // incorrectly match searches for 0. Only compare when the field is non-empty.
    const valueIsSet = (v: unknown) =>
      v !== null && v !== undefined && String(v).trim() !== "";

    const numericMatch =
      isNumeric &&
      ((valueIsSet(row.year) && Number(row.year) === numericValue) ||
        (valueIsSet(row.quantityOfFuelConsumed) &&
          Number(row.quantityOfFuelConsumed) === numericValue) ||
        (valueIsSet(row.unitOfEnergyGenerated) &&
          Number(row.unitOfEnergyGenerated) === numericValue));

    return textMatch || numericMatch;
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
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

// ============================================================================
// API postHandler
// ============================================================================

async function postHandler(
  req: NextRequest,
  userSession?: TUserSession
): Promise<NextResponse> {
  const body: ListRequestBody = await req.json();

  const {
    pagination = { pageIndex: 0, pageSize: 10 },
    sorting = [],
    globalFilter = "",
    uploadType = "all",
    activity = "energy",
    formMode = FORM_MODE_STANDARD,
  } = body;

  const organizationId = userSession?.organizationId || "";
  const userId = userSession?.userId || "";

  if (!organizationId) {
    return NextResponse.json(
      {
        success: false,
        message: "Organization ID is required",
      },
      { status: 400 }
    );
  }

  const sdk = await getGraphQlServerSDK();

  // Step 1: Fetch locations based on user role
  const locationOptions: Array<{ value: string; label: string }> = [];
  const organizationAddressIds: string[] = [];
  const isOrganizationAdmin = checkIsOrganizationAdmin(
    userSession?.userRole || ""
  );

  if (isOrganizationAdmin) {
    // For admin users, fetch all organization addresses
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
      addNewEntryLocationOptions: locationOptions,
      fuelTypeOptions: [],
      fuelUnitOptionsMap: {},
      baselineYear: undefined,
      financialYearMonth: undefined,
      shouldDisableAddNewEntry: false,
    });
  }

  // Step 2: Fetch organization baseline year and financial month
  const orgResult = await sdk.getOrgData({ organizationId });
  const organization = orgResult.Organization?.[0];
  const baselineYear = organization?.Baselineyear;
  const financialYearMonth = organization?.FinancialYearMonth;

  // Step 3: Fetch master data for fuel types and UOMs
  const masterDataResult = await sdk.getActivityMasterDataForDefaultRows({
    organizationId,
    organizationAddressIds,
    masterKeys: DEFAULT_MASTER_KEYS,
  });

  const orgActivityMasterRecords = masterDataResult.OrgActivityMaster || [];
  const activityMasterRecords = masterDataResult.ActivityMaster || [];

  // Build set of location IDs that have fuel-type master data in OrgActivityMaster.
  // A NULL organization_address_id means the config applies to ALL accessible locations.
  const configuredLocationIds = new Set<string>();
  const hasOrgLevelFuelTypeConfig = orgActivityMasterRecords.some(
    (record) =>
      record.master_key === FUEL_TYPE_MASTER_KEY &&
      record.organization_id === organizationId &&
      !record.organization_address_id
  );
  if (hasOrgLevelFuelTypeConfig) {
    locationOptions.forEach((loc) => configuredLocationIds.add(loc.value));
  } else {
    orgActivityMasterRecords.forEach((record) => {
      if (
        record.organization_address_id &&
        record.master_key === FUEL_TYPE_MASTER_KEY
      ) {
        configuredLocationIds.add(record.organization_address_id);
      }
    });
  }

  // Build OrgActivityMaster fuel type values per location for per-value lock comparison.
  // A row's fuel type is locked only if the value matches an OrgActivityMaster entry.
  const orgMasterFuelValuesByLocation = new Map<string, Set<string>>();
  locationOptions.forEach((loc) => {
    const values = getFuelTypesForLocation(
      loc.value,
      organizationId,
      orgActivityMasterRecords
    );
    orgMasterFuelValuesByLocation.set(
      loc.value,
      new Set(values.map((v) => v.label.toLowerCase().trim()))
    );
  });

  // Step 4: Fetch ALL existing captive power non-renewable data (no pagination at DB level)
  const existingDataResult =
    await sdk.getActivityDataEnergyCaptivePowerNonRenewableFuelPaginated({
      organization_address_ids: organizationAddressIds,
      limit: 10000, // Fetch all records
      offset: 0,
      order_by: [{ updated_at: Order_By.DescNullsLast }],
      activityFilter: {},
    });

  // Step 5: Transform existing data to RowData format
  const existingData: RowData[] = (
    existingDataResult.GHGEnergy_CaptivePower_NonRenewable || []
  ).map((nonRenewable: any) => {
    const captivePower = nonRenewable.GHGEnergy_CaptivePower || {};
    const taskRequest = captivePower.TaskRequest || {};
    const locationName = taskRequest.OrganizationAddress?.Address?.name || "";

    return {
      id: nonRenewable.id || "",
      task_request_id: taskRequest.id || "",
      location: locationName,
      locationId: taskRequest.organization_address_id || "",
      year: taskRequest.year?.toString() || "",
      month: taskRequest.month || "",
      typeOfFuelUsed: nonRenewable.type_of_fuel_used || "",
      quantityOfFuelConsumed: nonRenewable.quantity_of_fuel_consumed ?? "",
      UoMForTheQuantityOfFuelConsumed:
        nonRenewable.quantity_of_fuel_consumed_uom || "",
      qualityOfFuel: nonRenewable.quality_of_fuel || "",
      unitOfEnergyGenerated: nonRenewable.unit_of_energy_generated_in_kwh ?? "",
      createdByUserName:
        nonRenewable.CreatedByUser?.name || nonRenewable.created_by || "",
      updatedByUserName: nonRenewable.UpdatedByUser?.name || "",
      metadata: nonRenewable.metadata ?? null,
      updatedAt: nonRenewable.updated_at || "",
      status: captivePower.status ?? "saved",
      _isPrePopulated: false,
      hasExistingData: true,
      _locationHasMasterData: configuredLocationIds.has(
        taskRequest.organization_address_id || ""
      ),
      _isMasterDataValue: (() => {
        const locId = taskRequest.organization_address_id || "";
        const orgValues = orgMasterFuelValuesByLocation.get(locId);
        const fuelValue = (nonRenewable.type_of_fuel_used || "")
          .toLowerCase()
          .trim();
        return orgValues && orgValues.size > 0 && orgValues.has(fuelValue);
      })(),
    };
  });

  // Step 6: Generate pre-populated rows (with fuel types from master data)
  // Only generate pre-populated rows if formMode is "prepopulate"
  let prePopulatedRows: RowData[] = [];
  if (formMode === FORM_MODE_PREPOPULATE) {
    prePopulatedRows = generatePrePopulatedRows(
      locationOptions,
      baselineYear,
      financialYearMonth,
      organizationId,
      orgActivityMasterRecords,
      configuredLocationIds
    );
  }

  // Step 7: Merge pre-populated rows with existing data
  // For "standard" mode, only use existing data
  let dataToUse: RowData[];
  if (formMode === FORM_MODE_STANDARD) {
    dataToUse = existingData;
  } else {
    dataToUse = mergeWithExistingData(prePopulatedRows, existingData);

    // Non-configured locations (not in OrgActivityMaster) get general skeleton rows
    // (location × month × year, no fuel type) so they appear in the table.
    if (!hasOrgLevelFuelTypeConfig && baselineYear && financialYearMonth) {
      const nonConfiguredLocations = locationOptions.filter(
        (loc) => !configuredLocationIds.has(loc.value)
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
              dataToUse.push({
                task_request_id: "",
                location: loc.label,
                locationId: loc.value,
                year: String(year),
                month,
                typeOfFuelUsed: "",
                quantityOfFuelConsumed: "",
                UoMForTheQuantityOfFuelConsumed: "",
                qualityOfFuel: "",
                unitOfEnergyGenerated: "",
                createdByUserName: "",
                updatedByUserName: "",
                metadata: null,
                updatedAt: "",
                status: "pending_data",
                _isPrePopulated: true,
                _isMasterDataValue: false,
                hasExistingData: false,
                _locationHasMasterData: false,
              });
            }
          }
        }
      }
    }
  }

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

  // Step 13: Build fuel type options for dropdown
  // BOTH Standard and Prepopulate modes: Get fuel types from ActivityMaster (global) only
  // The dropdown should always show ALL available fuel types from ActivityMaster
  // OrgActivityMaster is only used for pre-populating rows, not for limiting dropdown options
  let fuelTypeOptions: SelectOption[] = [];

  const globalFuelTypeMaster = activityMasterRecords.find(
    (record) => record.master_key === FUEL_TYPE_MASTER_KEY
  );
  if (globalFuelTypeMaster?.master_data) {
    fuelTypeOptions = extractFuelTypes(globalFuelTypeMaster.master_data);
  }

  // Step 14: Build fuel unit options map
  const fuelUnitOptionsMap = buildFuelUnitOptionsMap(
    activityMasterRecords,
    orgActivityMasterRecords,
    organizationId
  );

  // Step 15: Create filtered location options for "Add new entry" dropdown
  // In prepopulate mode, exclude locations that already have master data in OrgActivityMaster
  let addNewEntryLocationOptions = locationOptions;
  let shouldDisableAddNewEntry = false;

  if (formMode === FORM_MODE_PREPOPULATE) {
    // Check for an org-level record (organization_address_id is null).
    // A null address means the config applies to ALL accessible locations,
    // so there are no remaining locations for "Add new entry".
    const hasOrgLevelConfig = orgActivityMasterRecords.some(
      (record) =>
        record.master_key === FUEL_TYPE_MASTER_KEY &&
        record.organization_id === organizationId &&
        !record.organization_address_id
    );

    if (hasOrgLevelConfig) {
      // Org-level config covers every location → nothing left to add
      addNewEntryLocationOptions = [];
      shouldDisableAddNewEntry = true;
    } else {
      // Location-specific config: exclude locations that already have a record
      const locationsWithMasterData = new Set<string>();

      orgActivityMasterRecords.forEach((record) => {
        if (
          record.organization_address_id &&
          record.master_key === FUEL_TYPE_MASTER_KEY
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
    fuelTypeOptions,
    fuelUnitOptionsMap,
    baselineYear,
    financialYearMonth,
    shouldDisableAddNewEntry,
  });
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
