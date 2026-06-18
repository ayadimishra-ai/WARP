import { GraphQLClient, gql } from "graphql-request";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { getActivityFormMode } from "@/modules/ghg/lib/activity-form/activity-form-mode.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { isOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { FORM_MODE_STANDARD } from "@/modules/ghg/utils/const";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";

type PrePopulatedRow = Record<string, string | number | null | undefined>;
type SelectOption = { label: string; value: string };

const TECHNOLOGY_MASTER_KEY = "Energy_CaptivePower_Type_of_Technology_Used";

const GET_ACTIVITY_MASTER_DATA_FOR_DEFAULT_ROWS = gql`
  query getActivityMasterDataForDefaultRows(
    $organizationId: uuid
    $organizationAddressIds: [uuid!]
    $masterKeys: [String!]!
  ) {
    ActivityMaster(where: { master_key: { _in: $masterKeys } }) {
      master_key
      master_data
    }
    OrgActivityMaster(
      where: {
        master_key: { _in: $masterKeys }
        _or: [
          { organization_id: { _eq: $organizationId } }
          { organization_address_id: { _in: $organizationAddressIds } }
        ]
      }
    ) {
      organization_id
      organization_address_id
      master_key
      master_data
    }
  }
`;

type ActivityMasterDefaultRowsResponse = {
  ActivityMaster: Array<{
    master_key: string;
    master_data: unknown;
  }>;
  OrgActivityMaster: Array<{
    organization_id: string;
    organization_address_id?: string | null;
    master_key: string;
    master_data: unknown;
  }>;
};

function getMonthOptionsForYear(
  year: number,
  baselineYear: number,
  financialYearMonth?: string
): string[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  if (year === baselineYear && financialYearMonth) {
    const idx = Month.findIndex(
      (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
    );
    if (idx !== -1) {
      if (year === currentYear) {
        return Month.slice(idx, currentMonth);
      }
      return Month.slice(idx);
    }
  }

  if (year === currentYear) {
    return Month.slice(0, currentMonth);
  }

  return [...Month];
}

async function getLocationOptions(
  userSession: TUserSession
): Promise<Array<{ value: string; label: string }>> {
  const sdk = await getGraphQlServerSDK();

  if (isOrganizationAdmin(userSession.userRole)) {
    const res = await sdk.getAddresses({
      organisationAddressId: userSession.organizationId,
    });

    return (res.OrganizationAddress ?? [])
      .filter((a) => a.id && a.Address?.name)
      .map((a) => ({ value: a.id!, label: a.Address!.name }));
  }

  const res = await sdk.getLocationsAndAddresses({
    organizationId: userSession.organizationId,
    userId: userSession.userId,
  });

  return (res.UserOrganizationAddressMapping ?? [])
    .filter(
      (m) =>
        m.organization_address_id &&
        m.OrganizationAddress?.Address?.name &&
        m.activities.includes("energy")
    )
    .map((m) => ({
      value: m.organization_address_id!,
      label: m.OrganizationAddress!.Address!.name,
    }));
}

async function fetchAllExistingRecords(
  organizationAddressIds: string[]
): Promise<PrePopulatedRow[]> {
  if (organizationAddressIds.length === 0) return [];

  const sdk = await getGraphQlServerSDK();
  const res = await sdk.getActivityDataEnergyCaptivePowerRenewablePaginated({
    organization_address_ids: organizationAddressIds,
    limit: 100000,
    offset: 0,
    order_by: [{ updated_at: "desc" as any }],
    activityFilter: {},
  });

  return (res.GHGEnergy_CaptivePower_Renewable ?? []).map((r) => {
    const cp = r.GHGEnergy_CaptivePower;
    const tr = cp?.TaskRequest;

    return {
      id: r.id ?? "",
      organizationAddressId: tr?.organization_address_id ?? "",
      location: tr?.OrganizationAddress?.Address?.name ?? "",
      year: tr?.year?.toString() ?? "",
      month: tr?.month ?? "",
      typeOfTechnologyUsed: (r as any).type_of_technology_used ?? "",
      yearOfInstallation: (r as any).year_of_installation ?? "",
      unitOfEnergyGeneratedInKwh:
        (r as any).unit_of_energy_generated_in_kwh ?? "",
      GHGEnergyConsumption_CaptivePower_id:
        r.GHGEnergyConsumption_CaptivePower_id ?? "",
      createdByUserName: (r as any).CreatedByUser?.name ?? "",
      updatedByUserName: (r as any).UpdatedByUser?.name ?? "",
      updatedAt: r.updated_at ?? "",
      status: cp?.status ?? "saved",
    };
  });
}

function normalizeMasterData(masterData: unknown): SelectOption[] {
  if (!Array.isArray(masterData)) return [];

  return masterData
    .map((item) => {
      if (typeof item === "string") {
        return { label: item, value: item };
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const label = String(record.label ?? record.value ?? "").trim();
        const value = String(record.value ?? record.label ?? "").trim();

        const displayLabel = label || value;
        if (!displayLabel) return null;

        return {
          label: displayLabel,
          value: displayLabel,
        };
      }

      return null;
    })
    .filter((item): item is SelectOption => Boolean(item));
}

function dedupeOptions(options: SelectOption[]): SelectOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = `${option.value.toLowerCase()}|${option.label.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getLocationsForAddNew(
  locations: SelectOption[],
  usedOrganizationAddressIds: Set<string>,
  hasOrgLevelConfig: boolean
): SelectOption[] {
  // Org-level config (NULL organization_address_id) applies to all accessible
  // locations, so no location should remain for manual "Add New Entry".
  if (hasOrgLevelConfig) {
    return [];
  }

  return locations.filter(
    ({ value: organizationAddressId }) =>
      !usedOrganizationAddressIds.has(organizationAddressId)
  );
}

async function getTechnologyOptionsByLocation(
  organizationId: string,
  locations: Array<{ value: string; label: string }>
): Promise<{
  technologyOptionsByLocation: Record<string, SelectOption[]>;
  technologyOptions: SelectOption[];
  activityMasterOptions: SelectOption[];
  usedOrganizationAddressIds: Set<string>;
  hasOrgLevelConfig: boolean;
  isConfigured: boolean;
  orgOnlyValuesByLocation: Record<string, Set<string>>;
}> {
  if (locations.length === 0) {
    return {
      technologyOptionsByLocation: {},
      technologyOptions: [],
      activityMasterOptions: [],
      usedOrganizationAddressIds: new Set<string>(),
      hasOrgLevelConfig: false,
      isConfigured: false,
      orgOnlyValuesByLocation: {},
    };
  }

  const serverEnv = await getServerEnv();
  const client = new GraphQLClient(serverEnv.NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL, {
    headers: {
      "x-hasura-admin-secret": serverEnv.HASURA_ADMIN_SECRET,
    },
  });

  const response = await client.request<ActivityMasterDefaultRowsResponse>(
    GET_ACTIVITY_MASTER_DATA_FOR_DEFAULT_ROWS,
    {
      organizationId,
      organizationAddressIds: locations.map((location) => location.value),
      masterKeys: [TECHNOLOGY_MASTER_KEY],
    }
  );

  const activityMasterOptions = dedupeOptions(
    response.ActivityMaster.filter(
      (master) => master.master_key === TECHNOLOGY_MASTER_KEY
    ).flatMap((master) => normalizeMasterData(master.master_data))
  );

  const orgLevelOptions = dedupeOptions(
    response.OrgActivityMaster.filter(
      (master) =>
        master.master_key === TECHNOLOGY_MASTER_KEY &&
        master.organization_id === organizationId &&
        !master.organization_address_id
    ).flatMap((master) => normalizeMasterData(master.master_data))
  );

  const hasOrgLevelConfig = response.OrgActivityMaster.some(
    (master) =>
      master.master_key === TECHNOLOGY_MASTER_KEY &&
      master.organization_id === organizationId &&
      !master.organization_address_id
  );

  const technologyOptionsByLocation: Record<string, SelectOption[]> = {};

  for (const location of locations) {
    const locationSpecificOptions = dedupeOptions(
      response.OrgActivityMaster.filter(
        (master) =>
          master.master_key === TECHNOLOGY_MASTER_KEY &&
          master.organization_address_id === location.value
      ).flatMap((master) => normalizeMasterData(master.master_data))
    );

    technologyOptionsByLocation[location.value] =
      locationSpecificOptions.length > 0
        ? locationSpecificOptions
        : orgLevelOptions.length > 0
          ? orgLevelOptions
          : activityMasterOptions;
  }

  // Collect all organization_address_ids that already have an entry in
  // OrgActivityMaster for this master key (non-null values only).
  const usedOrganizationAddressIds = new Set<string>(
    response.OrgActivityMaster.filter(
      (master) =>
        master.master_key === TECHNOLOGY_MASTER_KEY &&
        master.organization_address_id
    ).map((master) => master.organization_address_id!)
  );

  // OrgActivityMaster-only values per location (no ActivityMaster fallback).
  // Used to determine whether a specific row value should be locked.
  const orgOnlyValuesByLocation: Record<string, Set<string>> = {};
  for (const location of locations) {
    const locationSpecificOpts = dedupeOptions(
      response.OrgActivityMaster.filter(
        (master) =>
          master.master_key === TECHNOLOGY_MASTER_KEY &&
          master.organization_address_id === location.value
      ).flatMap((master) => normalizeMasterData(master.master_data))
    );
    const effectiveOrgOpts =
      locationSpecificOpts.length > 0 ? locationSpecificOpts : orgLevelOptions;
    orgOnlyValuesByLocation[location.value] = new Set(
      effectiveOrgOpts.map((o) => o.value.toLowerCase().trim())
    );
  }

  return {
    technologyOptionsByLocation,
    technologyOptions: dedupeOptions(
      Object.values(technologyOptionsByLocation).flat()
    ),
    activityMasterOptions,
    usedOrganizationAddressIds,
    hasOrgLevelConfig,
    isConfigured: response.OrgActivityMaster.length > 0,
    orgOnlyValuesByLocation,
  };
}

function generateSkeletonRows(
  locations: Array<{ value: string; label: string }>,
  technologyOptionsByLocation: Record<string, SelectOption[]>,
  baselineYear: number,
  financialYearMonth?: string
): PrePopulatedRow[] {
  const currentYear = new Date().getFullYear();
  const rows: PrePopulatedRow[] = [];

  for (const loc of locations) {
    const technologies = technologyOptionsByLocation[loc.value] ?? [];
    if (technologies.length === 0) continue;

    for (let year = baselineYear; year <= currentYear; year++) {
      const months = getMonthOptionsForYear(
        year,
        baselineYear,
        financialYearMonth
      );

      for (const month of months) {
        for (const technology of technologies) {
          rows.push({
            organizationAddressId: loc.value,
            location: loc.label,
            year: String(year),
            month,
            typeOfTechnologyUsed: technology.label,
            yearOfInstallation: "",
            unitOfEnergyGeneratedInKwh: "",
            _isPrePopulated: 1,
            _isMasterDataValue: 1,
            status: "pending_data",
          });
        }
      }
    }
  }

  return rows;
}

function mergeRows(
  existing: PrePopulatedRow[],
  skeletons: PrePopulatedRow[]
): PrePopulatedRow[] {
  const existingKeys = new Set<string>();

  for (const row of existing) {
    existingKeys.add(
      `${String(row.organizationAddressId ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}|${String(row.typeOfTechnologyUsed ?? "").toLowerCase()}`
    );
  }

  const filteredSkeletons = skeletons.filter((row) => {
    const key = `${String(row.organizationAddressId ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}|${String(row.typeOfTechnologyUsed ?? "").toLowerCase()}`;
    return !existingKeys.has(key);
  });

  const merged: PrePopulatedRow[] = [
    // Existing rows intentionally do NOT get _isPrePopulated so ManualEntryTable
    // treats them as regular rows — all non-locked fields render as editable inputs.
    ...existing.map((row) => ({ ...row, hasExistingData: 1 })),
    ...filteredSkeletons,
  ];

  const monthIndex = (month: string) =>
    Month.findIndex((m) => m.toLowerCase() === String(month).toLowerCase());

  merged.sort((a, b) => {
    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearB !== yearA) return yearB - yearA;

    const monthA = monthIndex(String(a.month ?? ""));
    const monthB = monthIndex(String(b.month ?? ""));
    if (monthB !== monthA) return monthB - monthA;

    return (
      String(a.location ?? "")
        .toLowerCase()
        .localeCompare(String(b.location ?? "").toLowerCase()) ||
      String(a.typeOfTechnologyUsed ?? "")
        .toLowerCase()
        .localeCompare(String(b.typeOfTechnologyUsed ?? "").toLowerCase())
    );
  });

  return merged;
}

/**
 * Generate skeleton rows for prepopulate_general mode: location × year × month only.
 * Technology column is left empty (user picks from dropdown).
 */
function generateGeneralSkeletonRows(
  locations: Array<{ value: string; label: string }>,
  baselineYear: number,
  financialYearMonth?: string
): PrePopulatedRow[] {
  const currentYear = new Date().getFullYear();
  const rows: PrePopulatedRow[] = [];

  for (const loc of locations) {
    for (let year = baselineYear; year <= currentYear; year++) {
      const months = getMonthOptionsForYear(
        year,
        baselineYear,
        financialYearMonth
      );

      for (const month of months) {
        rows.push({
          organizationAddressId: loc.value,
          location: loc.label,
          year: String(year),
          month,
          typeOfTechnologyUsed: "",
          yearOfInstallation: "",
          unitOfEnergyGeneratedInKwh: "",
          _isPrePopulated: 1,
          status: "pending_data",
        });
      }
    }
  }

  return rows;
}

/**
 * Merge existing rows with general skeletons using location|year|month key only.
 */
function mergeRowsGeneral(
  existing: PrePopulatedRow[],
  skeletons: PrePopulatedRow[]
): PrePopulatedRow[] {
  const existingKeys = new Set<string>();

  for (const row of existing) {
    existingKeys.add(
      `${String(row.organizationAddressId ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}`
    );
  }

  const filteredSkeletons = skeletons.filter((row) => {
    const key = `${String(row.organizationAddressId ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}`;
    return !existingKeys.has(key);
  });

  const merged: PrePopulatedRow[] = [
    ...existing.map((row) => ({ ...row, hasExistingData: 1 })),
    ...filteredSkeletons,
  ];

  const monthIndex = (month: string) =>
    Month.findIndex((m) => m.toLowerCase() === String(month).toLowerCase());

  merged.sort((a, b) => {
    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearB !== yearA) return yearB - yearA;

    const monthA = monthIndex(String(a.month ?? ""));
    const monthB = monthIndex(String(b.month ?? ""));
    if (monthB !== monthA) return monthB - monthA;

    return String(a.location ?? "")
      .toLowerCase()
      .localeCompare(String(b.location ?? "").toLowerCase());
  });

  return merged;
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

function sortMergedData(
  data: PrePopulatedRow[],
  formMode: string = FORM_MODE_STANDARD
): PrePopulatedRow[] {
  return [...data].sort((a, b) => {
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

    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;
    if (yearA !== yearB) return yearB - yearA;

    const monthA = MONTH_ORDER[String(a.month ?? "")] || 0;
    const monthB = MONTH_ORDER[String(b.month ?? "")] || 0;
    if (monthA !== monthB) return monthB - monthA;

    const locationCompare = String(a.location ?? "")
      .toLowerCase()
      .localeCompare(String(b.location ?? "").toLowerCase());
    if (locationCompare !== 0) return locationCompare;

    const techCompare = String(a.typeOfTechnologyUsed ?? "")
      .toLowerCase()
      .localeCompare(String(b.typeOfTechnologyUsed ?? "").toLowerCase());
    if (techCompare !== 0) return techCompare;

    // Final deterministic tie-breaker: id (ascending)
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
}

function applySorting(
  data: PrePopulatedRow[],
  sortingState: Array<{ id: string; desc: boolean }>,
  formMode: string = FORM_MODE_STANDARD
): PrePopulatedRow[] {
  if (!sortingState || sortingState.length === 0)
    return sortMergedData(data, formMode);

  return [...data].sort((a, b) => {
    for (const { id, desc } of sortingState) {
      let cmp = 0;
      switch (id) {
        case "year":
          cmp = (Number(a.year) || 0) - (Number(b.year) || 0);
          break;
        case "month":
          cmp =
            (MONTH_ORDER[String(a.month ?? "")] || 0) -
            (MONTH_ORDER[String(b.month ?? "")] || 0);
          break;
        case "location":
          cmp = String(a.location ?? "")
            .toLowerCase()
            .localeCompare(String(b.location ?? "").toLowerCase());
          break;
        case "typeOfTechnologyUsed":
          cmp = String(a.typeOfTechnologyUsed ?? "")
            .toLowerCase()
            .localeCompare(String(b.typeOfTechnologyUsed ?? "").toLowerCase());
          break;
        case "yearOfInstallation":
          cmp =
            (Number(a.yearOfInstallation) || 0) -
            (Number(b.yearOfInstallation) || 0);
          break;
        case "unitOfEnergyGeneratedInKwh":
          cmp =
            (Number(a.unitOfEnergyGeneratedInKwh) || 0) -
            (Number(b.unitOfEnergyGeneratedInKwh) || 0);
          break;
        case "createdByUserName":
          cmp = String(a.createdByUserName ?? "")
            .toLowerCase()
            .localeCompare(String(b.createdByUserName ?? "").toLowerCase());
          break;
        case "updatedByUserName":
          cmp = String(a.updatedByUserName ?? "")
            .toLowerCase()
            .localeCompare(String(b.updatedByUserName ?? "").toLowerCase());
          break;
        case "updatedAt":
          cmp =
            new Date(String(a.updatedAt ?? "")).getTime() -
            new Date(String(b.updatedAt ?? "")).getTime();
          break;
      }
      if (cmp !== 0) return desc ? -cmp : cmp;
    }
    return 0;
  });
}

function applySearch(
  rows: PrePopulatedRow[],
  search: string
): PrePopulatedRow[] {
  if (!search.trim()) return rows;

  const query = search.trim().toLowerCase();
  return rows.filter((row) => {
    const fields = [
      row.location,
      row.year,
      row.month,
      row.typeOfTechnologyUsed,
      row.yearOfInstallation,
      row.unitOfEnergyGeneratedInKwh,
    ];

    return fields.some((f) =>
      String(f ?? "")
        .toLowerCase()
        .includes(query)
    );
  });
}

async function getHandler(req: NextRequest, userSession: TUserSession) {
  const { searchParams } = new URL(req.url);

  const rawPageIndex = parseInt(searchParams.get("pageIndex") ?? "0", 10);
  const rawPageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
  const rawSearch = searchParams?.get("search") ?? "";
  const rawStatusFilter = searchParams?.get("statusFilter") ?? "all";
  const rawSorting = searchParams?.get("sorting") ?? "[]";
  let sorting: Array<{ id: string; desc: boolean }> = [];
  try {
    sorting = JSON.parse(rawSorting);
  } catch {
    sorting = [];
  }

  const pageIndex =
    Number.isFinite(rawPageIndex) && rawPageIndex >= 0 ? rawPageIndex : 0;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;
  const search =
    rawSearch === "undefined" || rawSearch === "null" ? "" : rawSearch;
  const statusFilter =
    rawStatusFilter === "pending_data" ? "pending_data" : "all";

  const sdk = await getGraphQlServerSDK();
  const orgRes = await sdk.getOrgData({
    organizationId: userSession.organizationId,
  });

  const org = orgRes.Organization?.[0];
  const baselineYear: number | undefined = org?.Baselineyear;
  const financialYearMonth: string | undefined = org?.FinancialYearMonth;

  // console.log(`Org Config (Backend) for org ${userSession.organizationId}:`, {
  //   baselineYear,
  //   financialYearMonth,
  // });

  const locations = await getLocationOptions(userSession);
  const addressIds = locations.map((l) => l.value);
  const existingRows = await fetchAllExistingRecords(addressIds);
  const {
    technologyOptionsByLocation,
    technologyOptions,
    activityMasterOptions,
    usedOrganizationAddressIds,
    hasOrgLevelConfig,
    orgOnlyValuesByLocation,
  } = await getTechnologyOptionsByLocation(
    userSession.organizationId,
    locations
  );

  // Annotate each existing DB row: lock typeOfTechnologyUsed only if its value
  // is one of the OrgActivityMaster values for that location.
  for (const row of existingRows) {
    const locId = String(row.organizationAddressId ?? "");
    const orgValues = orgOnlyValuesByLocation[locId];
    const techValue = String(row.typeOfTechnologyUsed ?? "").toLowerCase().trim();
    row._isMasterDataValue =
      orgValues && orgValues.size > 0 && orgValues.has(techValue) ? 1 : 0;
  }

  // Determine mode via PlatformFeatureFlags + optional OrgActivityMaster check
  const { isConfigured, mode: prepopulateMode } = await getActivityFormMode(
    userSession.organizationId,
    TECHNOLOGY_MASTER_KEY
  );

  // Admin users always use standard mode — no skeleton rows
  const effectivePrepopulateMode = isOrganizationAdmin(userSession.userRole)
    ? "standard"
    : prepopulateMode;

  // Keep the full mapped locations for existing flow. Only the "Add New Entry"
  // dropdown in prepopulate mode uses the filtered list, matched by the
  // OrganizationAddress primary key.
  const locationsForAddNew = getLocationsForAddNew(
    locations,
    usedOrganizationAddressIds,
    hasOrgLevelConfig
  );

  // Only generate skeleton rows for OrgActivityMaster-configured locations.
  // Org-level config (organization_address_id IS NULL) → all locations are configured.
  // Otherwise only location-specific configured locations get skeleton rows.
  const configuredLocations = hasOrgLevelConfig
    ? locations
    : locations.filter((loc) => usedOrganizationAddressIds.has(loc.value));

  let mergedRows: PrePopulatedRow[];
  if (baselineYear && locations.length > 0) {
    if (effectivePrepopulateMode === "prepopulate_with_key") {
      // Key-based skeletons for OrgActivityMaster-configured locations.
      const afterKeyMerge = mergeRows(
        existingRows,
        generateSkeletonRows(
          configuredLocations,
          technologyOptionsByLocation,
          baselineYear,
          financialYearMonth
        )
      );

      // Non-configured locations get general (location × month × year) skeleton rows.
      const nonConfiguredLocations = hasOrgLevelConfig
        ? []
        : locations.filter((loc) => !usedOrganizationAddressIds.has(loc.value));

      if (nonConfiguredLocations.length > 0) {
        const nonConfiguredIds = new Set(nonConfiguredLocations.map((l) => l.value));
        const existingKeys3 = new Set<string>(
          existingRows
            .filter((r) => nonConfiguredIds.has(String(r.organizationAddressId ?? "")))
            .map((r) =>
              `${String(r.organizationAddressId ?? "").toLowerCase()}|${String(r.year ?? "")}|${String(r.month ?? "").toLowerCase()}`
            )
        );
        const generalSkeletons = generateGeneralSkeletonRows(
          nonConfiguredLocations,
          baselineYear,
          financialYearMonth
        ).filter((row) => {
          const key = `${String(row.organizationAddressId ?? "").toLowerCase()}|${String(row.year ?? "")}|${String(row.month ?? "").toLowerCase()}`;
          return !existingKeys3.has(key);
        });
        mergedRows = [...afterKeyMerge, ...generalSkeletons];
      } else {
        mergedRows = afterKeyMerge;
      }
    } else if (effectivePrepopulateMode === "prepopulate_general") {
      // General: location × month × year only — still only configured locations.
      mergedRows = mergeRowsGeneral(
        existingRows,
        generateGeneralSkeletonRows(
          configuredLocations,
          baselineYear,
          financialYearMonth
        )
      );
    } else {
      // Standard mode — no skeleton generation
      mergedRows = existingRows.map((row) => ({ ...row, hasExistingData: 1 }));
    }
  } else {
    mergedRows = existingRows.map((row) => ({ ...row, hasExistingData: 1 }));
  }

  mergedRows = applySorting(mergedRows, sorting, effectivePrepopulateMode);

  // Apply search first to get the correct counts
  const searchedRows = applySearch(mergedRows, search);

  // Calculate counts based on searched rows
  const allCount = searchedRows.length;
  const pendingCount = searchedRows.filter(
    (r) => r.status === "pending_data"
  ).length;

  // Then apply status filtering for the actual data to return
  let filteredRows = searchedRows;
  if (statusFilter === "pending_data") {
    filteredRows = searchedRows.filter((r) => r.status === "pending_data");
  }

  const totalFilteredCount = filteredRows.length;
  const start = pageIndex * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);

  return NextResponse.json({
    success: true,
    data: pageRows,
    totalCount: totalFilteredCount,
    allCount,
    pendingCount,
    locations,
    locationsForAddNew,
    technologyOptions,
    activityMasterTechnologyOptions: activityMasterOptions,
    isConfigured,
    prepopulateMode: effectivePrepopulateMode,
    baselineYear: baselineYear ?? null,
    financialYearMonth: financialYearMonth ?? null,
  });
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(getHandler), {
    limitInterval: 1,
    maxRequestCount: 120,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
