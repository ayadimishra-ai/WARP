import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetActivityMasterDataByKeyQuery } from "@/modules/ghg/graphql/queries/get-activity-master-data-by-key.generated";
import { useGetLocationsAndAddressesQuery } from "@/modules/ghg/graphql/queries/get-addresses-by-userid-and-orgid.generated";
import { useGetAddressesQuery } from "@/modules/ghg/graphql/queries/get-addresses.generated";
import { useGetOrgDataQuery } from "@/modules/ghg/graphql/queries/get-organization-data.generated";
import { useGetPlatformFeatureFlagsQuery } from "@/modules/ghg/graphql/queries/get-platform-feature-flags.generated";
import { useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery } from "@/modules/ghg/graphql/queries/internal/get-activity-data-energy-captive-power-non-renewable-paginated.generated";
import { Order_By } from "@/modules/ghg/graphql/shared/types";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import {
  energyCaptivePowerFormUpdated,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import {
  FORM_MODE_PREPOPULATE,
  FORM_MODE_STANDARD,
  PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
} from "@/modules/ghg/utils/const";

type RowData = Record<string, string | number | null | undefined>;

interface UseEnergyCaptivePowerNonRenewableFuelDataProps {
  organizationId: string;
  userId: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  activity?: string;
  isOrganizationAdmin?: boolean;
  enabled?: boolean;
}

interface UseEnergyCaptivePowerNonRenewableFuelDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  fuelTypeOptions: Array<{ value: string; label: string }>;
  fuelUnitOptionsMap: Record<string, Array<{ value: string; label: string }>>;
  refetch: () => void;
}

interface UsePrePopulatedNonRenewableFuelDataProps {
  organizationId: string;
  accessToken: string;
  pagination: MRT_PaginationState;
  globalFilter: string;
  statusFilter: string;
  enabled?: boolean;
}

interface UsePrePopulatedNonRenewableFuelDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  allCount: number;
  pendingCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  locationsForAddNew: Array<{ value: string; label: string }>;
  fuelTypeOptions: Array<{ value: string; label: string }>;
  fuelUnitOptionsMap: Record<string, Array<{ value: string; label: string }>>;
  baselineYear?: number;
  financialYearMonth?: string;
  refetch: () => void;
  isConfigured: boolean;
}

interface UseEnergyCaptivePowerNonRenewableFuelOrgDataReturn {
  baselineYear?: number;
  financialYearMonth?: string;
  loading: boolean;
  error?: any;
}

/**
 * Helper function to get month options based on selected year and baseline financial month
 */
export const getMonthOptionsForYear = (
  selectedYear: string | number | undefined | null,
  baselineYear?: number,
  financialYearMonth?: string
): string[] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const monthNames = Month.map((m) => m);

  // If no year selected, return all months
  if (!selectedYear) {
    return monthNames;
  }

  const selectedYearNum = Number(selectedYear);
  const baselineYearNum = baselineYear || currentYear;

  // If selected year is the baseline year, start from financial year month
  if (selectedYearNum === baselineYearNum && financialYearMonth) {
    const financialMonthIndex = monthNames.findIndex(
      (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
    );
    if (financialMonthIndex !== -1) {
      // If the baseline year is the current year, cap the end at currentMonth
      const endIndex =
        selectedYearNum === currentYear ? currentMonth : monthNames.length;
      return monthNames.slice(financialMonthIndex, endIndex);
    }
  }

  // If selected year is the current year, show from January to previous month (exclude current month)
  if (selectedYearNum === currentYear) {
    return monthNames.slice(0, currentMonth);
  }

  // For other years, show all months
  return monthNames;
};

/**
 * Helper function to get UoM options based on selected fuel type
 * Returns UoM options that are valid for the selected fuel type
 */
export const getUomOptionsForFuelType = (
  selectedFuelType: string | undefined | null,
  fuelUnitOptionsMap: Record<string, Array<{ value: string; label: string }>>
): Array<{ value: string; label: string }> => {
  // If no fuel type selected or map is empty, return empty array
  if (!selectedFuelType || Object.keys(fuelUnitOptionsMap).length === 0) {
    return [];
  }

  // Return the UoM options for the selected fuel type
  return fuelUnitOptionsMap[selectedFuelType] || [];
};

/**
 * Helper function to get UoM label from value
 * Since the value might have trailing spaces, we find the corresponding label
 */
export const getUomLabelFromValue = (
  uomValue: string | undefined | null,
  fuelUnitOptionsMap: Record<string, Array<{ value: string; label: string }>>,
  selectedFuelType: string | undefined | null
): string => {
  if (!uomValue || !selectedFuelType) {
    return uomValue || "";
  }

  // Get UoM options for the selected fuel type
  const uomOptions = fuelUnitOptionsMap[selectedFuelType] || [];

  // Find the option with matching value (accounting for whitespace differences)
  const matchedOption = uomOptions.find(
    (option) => option.value.trim() === (uomValue as string).trim()
  );

  // Return the label if found, otherwise return the original value
  return matchedOption?.label || uomValue;
};

export const useEnergyCaptivePowerNonRenewableFuelData = ({
  organizationId,
  userId,
  pagination,
  sorting,
  globalFilter,
  activity = "energy",
  isOrganizationAdmin = false,
  enabled = true,
}: UseEnergyCaptivePowerNonRenewableFuelDataProps): UseEnergyCaptivePowerNonRenewableFuelDataReturn => {
  // Fetch activity master data for dropdown options
  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.energy_captive_power,
    },
    skip: !enabled,
  });

  // Fetch user's organization locations (for non-admin users)
  const { data: locationsData } = useGetLocationsAndAddressesQuery({
    variables: {
      organizationId,
      userId,
    },
    skip: !enabled || !organizationId || !userId || isOrganizationAdmin,
  });

  // Fetch all organization addresses (for admin users)
  const { data: adminAddressesData } = useGetAddressesQuery({
    variables: {
      organisationAddressId: organizationId,
    },
    skip: !enabled || !organizationId || !isOrganizationAdmin,
  });

  // Helper function to extract options from activity master data
  const extractMasterDataOptions = useCallback(
    (masterKey: string): Array<{ value: string; label: string }> => {
      if (!activityMasterData?.ActivityMaster) return [];

      const masterData = activityMasterData.ActivityMaster.find(
        (master) => master.master_key === masterKey
      );

      if (!masterData?.master_data) return [];

      const options = Array.isArray(masterData.master_data)
        ? masterData.master_data.map((item: any) => ({
            value: item.value || item,
            label: item.label || item.value || item,
          }))
        : [];

      // Sort alphabetically by label
      return options.sort((a, b) => a.label.localeCompare(b.label));
    },
    [activityMasterData]
  );

  // Build location options and extract IDs
  const { locationOptions, organizationAddressIds } = useMemo(() => {
    if (isOrganizationAdmin) {
      // For admin users, use OrganizationAddress directly
      if (!adminAddressesData?.OrganizationAddress)
        return { locationOptions: [], organizationAddressIds: [] };

      const options: Array<{ value: string; label: string }> = [];
      const ids: string[] = [];

      adminAddressesData.OrganizationAddress.forEach((address) => {
        const id = address.id || "";
        const name = address.Address?.name || "";
        if (id && name) {
          options.push({ value: id, label: name });
          ids.push(id);
        }
      });

      return { locationOptions: options, organizationAddressIds: ids };
    } else {
      // For non-admin users, use UserOrganizationAddressMapping
      if (!locationsData?.UserOrganizationAddressMapping)
        return { locationOptions: [], organizationAddressIds: [] };

      const options: Array<{ value: string; label: string }> = [];
      const ids: string[] = [];

      locationsData.UserOrganizationAddressMapping.forEach((mapping) => {
        const id = mapping.organization_address_id || "";
        const name = mapping.OrganizationAddress?.Address?.name || "";
        if (id && name && mapping.activities.includes(activity)) {
          options.push({ value: id, label: name });
          ids.push(id);
        }
      });

      return { locationOptions: options, organizationAddressIds: ids };
    }
  }, [locationsData, adminAddressesData, activity, isOrganizationAdmin]);

  // Extract dropdown options from activity master data
  const fuelTypeOptions = useMemo(
    () => extractMasterDataOptions("Energy_CaptivePower_NonRenewable_FuelType"),
    [extractMasterDataOptions]
  );

  // Build fuel unit options map grouped by fuel type
  // UoM options have a 'group' array that contains the fuel type values they belong to
  const fuelUnitOptionsMap = useMemo(() => {
    if (!activityMasterData?.ActivityMaster) return {};

    // Get fuel type master data to map label -> value
    const fuelTypeMasterData = activityMasterData.ActivityMaster.find(
      (master) =>
        master.master_key === "Energy_CaptivePower_NonRenewable_FuelType"
    );
    const fuelTypeData = fuelTypeMasterData?.master_data || [];

    // Get UoM master data with group information
    const uomMasterData = activityMasterData.ActivityMaster.find(
      (master) =>
        master.master_key === "Energy_CaptivePower_NonRenewable_FuelType_UOM"
    );
    const uomData = uomMasterData?.master_data || [];

    // Create a map: fuelTypeLabel -> UoM options
    const optionsMap: Record<
      string,
      Array<{ value: string; label: string }>
    > = {};

    // Initialize map with all fuel types (use label as key since that's what's selected in dropdown)
    fuelTypeData.forEach((fuelType: any) => {
      const fuelTypeLabel = fuelType.label || fuelType.value || fuelType;
      const fuelTypeValue = fuelType.value || fuelType;
      optionsMap[fuelTypeLabel] = [];

      // Find UoM options that belong to this fuel type
      uomData.forEach((uom: any) => {
        const uomGroups = uom.group || [];
        // Check if this UoM belongs to the current fuel type
        if (uomGroups.includes(fuelTypeValue)) {
          optionsMap[fuelTypeLabel].push({
            value: uom.value || uom,
            label: uom.label || uom.value || uom,
          });
        }
      });
    });

    return optionsMap;
  }, [activityMasterData]);

  // Build order_by for GraphQL based on sorting state
  // Now sorting on GHGEnergy_CaptivePower_NonRenewable fields directly
  const orderBy = useMemo(() => {
    if (!sorting || sorting.length === 0) {
      // Default: Sort by updated_at DESC (recently modified first), then year/month descending
      return [
        { updated_at: Order_By.Desc },
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: { month: Order_By.Desc },
          },
        },
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: { year: Order_By.Desc },
          },
        },
      ];
    }

    return sorting.map((sort) => {
      const direction = sort.desc ? Order_By.Desc : Order_By.Asc;

      // Map frontend column keys to GraphQL field names
      // For nested fields (through relationships), use nested objects
      switch (sort.id) {
        case "year":
          return {
            GHGEnergy_CaptivePower: {
              TaskRequest: { year: direction },
            },
          };
        case "month":
          return {
            GHGEnergy_CaptivePower: {
              TaskRequest: { month: direction },
            },
          };
        case "location":
          return {
            GHGEnergy_CaptivePower: {
              TaskRequest: {
                OrganizationAddress: {
                  Address: { name: direction },
                },
              },
            },
          };
        case "typeOfFuelUsed":
          return { Type_of_Fuel_Used: direction };
        case "quantityOfFuelConsumed":
          return { Quantity_of_fuel_consumed: direction };
        case "qualityOfFuel":
          return { Quality_of_fuel: direction };
        case "unitOfEnergyGeneratedInKwh":
          return { Unit_of_Energy_Generated_in_Kwh: direction };
        default:
          return { [sort.id]: direction };
      }
    });
  }, [sorting]);

  // Build activity filter for global search
  // Now filters on GHGEnergy_CaptivePower_NonRenewable level with nested TaskRequest access
  const activityFilter = useMemo(() => {
    if (!globalFilter || globalFilter.trim() === "") return {};

    const searchValue = globalFilter.trim();
    const numericValue = Number(searchValue);
    const isNumeric = !isNaN(numericValue) && searchValue !== "";

    return {
      _or: [
        // Search in month (through parent relationship)
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: { month: { _ilike: `%${searchValue}%` } },
          },
        },

        // Search in year (if numeric, through parent relationship)
        ...(isNumeric
          ? [
              {
                GHGEnergy_CaptivePower: {
                  TaskRequest: { year: { _eq: numericValue } },
                },
              },
            ]
          : []),

        // Search in location name (through parent relationship)
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: {
              OrganizationAddress: {
                Address: { name: { _ilike: `%${searchValue}%` } },
              },
            },
          },
        },

        // Search in fuel type (direct field on GHGEnergy_CaptivePower_NonRenewable)
        { Type_of_Fuel_Used: { _ilike: `%${searchValue}%` } },

        // Search in quantity of fuel consumed (if numeric, direct field)
        ...(isNumeric
          ? [{ Quantity_of_fuel_consumed: { _eq: numericValue } }]
          : []),

        // Search in UoM for quantity of fuel consumed (direct field)
        { Quantity_of_fuel_consumed_uom: { _ilike: `%${searchValue}%` } },

        // Search in quality of fuel (if numeric, direct field)
        ...(isNumeric ? [{ Quality_of_fuel: { _eq: numericValue } }] : []),

        // Search in unit of energy generated in kwh (if numeric, direct field)
        ...(isNumeric
          ? [{ Unit_of_Energy_Generated_in_Kwh: { _eq: numericValue } }]
          : []),
      ],
    };
  }, [globalFilter]);

  // Fetch paginated data - now uses GHGEnergy_CaptivePower_NonRenewable directly
  const { data, loading, refetch } =
    useGetActivityDataEnergyCaptivePowerNonRenewableFuelPaginatedQuery({
      variables: {
        organization_address_ids: organizationAddressIds,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        order_by: orderBy,
        activityFilter: activityFilter,
      },
      skip: !enabled || organizationAddressIds.length === 0,
      fetchPolicy: "network-only", // Force fresh data from server
    });

  // Transform fetched data to table format
  // Data now comes from GHGEnergy_CaptivePower_NonRenewable directly
  const tableData = useMemo<RowData[]>(() => {
    if (!data?.GHGEnergy_CaptivePower_NonRenewable) {
      return [];
    }

    // Transform non-renewable fuel records directly
    const transformed = data.GHGEnergy_CaptivePower_NonRenewable.map(
      (nonRenewableFuel) => {
        const captivePower = nonRenewableFuel.GHGEnergy_CaptivePower;
        const taskRequest = captivePower?.TaskRequest;
        const locationName =
          taskRequest?.OrganizationAddress?.Address?.name || "";

        return {
          // Keys must match the camelCase conversion from column codes
          id: nonRenewableFuel.id || "", // Non-Renewable Fuel record ID
          location: locationName,
          year: taskRequest?.year?.toString() || "",
          month: taskRequest?.month || "",
          typeOfFuelUsed: nonRenewableFuel.type_of_fuel_used || "",
          quantityOfFuelConsumed:
            nonRenewableFuel.quantity_of_fuel_consumed ?? "",
          UoM_for_the_quantity_of_fuel_consumed:
            nonRenewableFuel.quantity_of_fuel_consumed_uom || "",
          qualityOfFuel: nonRenewableFuel.quality_of_fuel ?? "0",
          unitOfEnergyGeneratedInKwh:
            nonRenewableFuel.unit_of_energy_generated_in_kwh ?? "",
          createdByUserName: nonRenewableFuel.CreatedByUser?.name || "",
          updatedByUserName: nonRenewableFuel.UpdatedByUser?.name || "",
          updatedAt: nonRenewableFuel.updated_at || "",
        };
      }
    );
    return transformed;
  }, [data]);

  // Get total count from totalCount aggregate query
  const rowCount = data?.totalCount?.aggregate?.count || 0;

  return {
    data: tableData,
    loading,
    rowCount,
    locationOptions,
    fuelTypeOptions,
    fuelUnitOptionsMap,
    refetch: refetch || (() => {}),
  };
};

/**
 * Hook to fetch organization data for Energy Captive Power Non-Renewable Fuel manual entry
 * Returns baseline year and financial year month for dynamic filtering
 */
export const useEnergyCaptivePowerNonRenewableFuelOrgData =
  (): UseEnergyCaptivePowerNonRenewableFuelOrgDataReturn => {
    const params = useParams();
    const organizationId = params?.organizationId as string;

    const {
      data: orgData,
      loading,
      error,
    } = useGetOrgDataQuery({
      variables: {
        organizationId: organizationId,
      },
      skip: !organizationId,
    });

    const organization = orgData?.Organization?.[0];

    return {
      baselineYear: organization?.Baselineyear,
      financialYearMonth: organization?.FinancialYearMonth,
      loading,
      error,
    };
  };

/**
 * Interface for useDeleteMessageHandler hook
 */
interface UseDeleteMessageHandlerProps {
  organizationId: string;
  accessToken: string;
  refetch: () => void;
  onError: (message: string) => void;
  onSavingChange: (isSaving: boolean) => void;
  // optional callback executed after refetch completes (e.g. to reset table selection)
  onRefetchCompleted?: () => void;
}

/**
 * Hook to handle message events for delete operations
 */
export const useDeleteMessageHandler = ({
  organizationId,
  accessToken,
  refetch,
  onError,
  onSavingChange,
  onRefetchCompleted,
}: UseDeleteMessageHandlerProps): void => {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let messageData: { type: string; data: any } = {
        type: "",
        data: "",
      };
      if (event.data) {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "confirm-delete-form-entry-true") {
            // User confirmed the delete action - now actually delete from DB
            const { selectedRowIdsToDelete, organizationAddressId } =
              messageData.data || {};

            if (
              selectedRowIdsToDelete &&
              selectedRowIdsToDelete.length > 0 &&
              organizationAddressId
            ) {
              try {
                onError("");
                onSavingChange(true);

                const response = await apiClientWithAuth
                  .post(
                    `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/non-renewable-fuel`,
                    {
                      action: "delete",
                      selectedRowIdsToDelete: selectedRowIdsToDelete,
                      organizationAddressId: organizationAddressId,
                    }
                  )
                  .then((response) => {
                    if (
                      response?.statusText === "OK" &&
                      response?.status === 200
                    ) {
                      return response.data;
                    }
                    throw new Error("Delete API request failed");
                  });

                if (response.success) {
                  // Refetch data after successful deletion
                  refetch();
                  // Allow caller to reset UI state (for example: table.resetRowSelection())
                  try {
                    onRefetchCompleted?.();
                  } catch (err) {
                    console.warn("onRefetchCompleted callback failed:", err);
                  }
                  // Show success popup using window parent message
                  postParentMessage(
                    energyCaptivePowerFormUpdated(true, "Non-Renewable Fuel")
                  );
                  onSavingChange(false);
                } else {
                  const errorMsg =
                    response.message || "Failed to delete records";
                  onError(errorMsg);
                  onSavingChange(false);
                }
              } catch (error: any) {
                // apiExceptionGuard returns { code, error: { message, ... } };
                // older paths put the message at the top level. Check both
                // so users see the real reason (e.g. RULE-008 422 approval lock)
                // instead of "Request failed with status code N".
                const data = error?.response?.data;
                const errorMsg =
                  data?.error?.message ||
                  data?.message ||
                  error?.message ||
                  "Error occurred while deleting records";
                onError(errorMsg);
                console.error("Delete error:", error);
                onSavingChange(false);
              }
            }
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    organizationId,
    accessToken,
    refetch,
    onError,
    onSavingChange,
    onRefetchCompleted,
  ]);
};

// ============================================================================
// Form Mode and Server-Side Data Fetching (Similar to Grid Power)
// ============================================================================

export type FormMode = "standard" | "prepopulate";

/**
 * Hook to dynamically determine form mode based on PlatformFeatureFlags table
 *
 * Logic:
 * - Check PlatformFeatureFlags table for organization_id
 * - If type = 'prepopulate_activity_data' AND feat_prepopulate_activity_form = true
 * - Then formMode = 'prepopulate' for all 5 activities (grid power, captive power renewable,
 *   captive power non renewable, fuel, waste)
 * - Otherwise formMode = 'standard'
 */
interface UseFormModeReturn {
  formMode: FormMode;
  loading: boolean;
  error?: any;
}

export const useEnergyCaptivePowerNonRenewableFuelFormMode =
  (): UseFormModeReturn => {
    const params = useParams();
    const organizationId = params?.organizationId as string;

    // Use GraphQL query to fetch platform feature flags
    const {
      data: featureFlagsData,
      loading,
      error,
    } = useGetPlatformFeatureFlagsQuery({
      variables: {
        organizationId,
        type: PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
      },
      skip: !organizationId,
      fetchPolicy: "cache-and-network", // Ensure fresh data
    });

    // Determine form mode based on feature flag
    const formMode = useMemo<FormMode>(() => {
      if (
        !featureFlagsData?.PlatformFeatureFlags ||
        featureFlagsData.PlatformFeatureFlags.length === 0
      ) {
        return FORM_MODE_STANDARD;
      }

      // Get the feature flag (should only be one due to query filter)
      const featureFlag = featureFlagsData.PlatformFeatureFlags[0];

      // Return 'prepopulate' if feature is enabled, otherwise 'standard'
      return featureFlag?.feat_prepopulate_activity_form === true
        ? FORM_MODE_PREPOPULATE
        : FORM_MODE_STANDARD;
    }, [featureFlagsData]);

    return {
      formMode,
      loading,
      error,
    };
  };

// ============================================================================
// Server-Side Data Fetching Hook (with Pre-population)
// ============================================================================

interface UseEnergyCaptivePowerNonRenewableFuelServerDataProps {
  organizationId: string;
  accessToken: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  uploadType?: string;
  activity?: string;
  formMode?: FormMode;
  skip?: boolean;
}

interface UseEnergyCaptivePowerNonRenewableFuelServerDataReturn {
  data: RowData[];
  loading: boolean;
  totalCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  addNewEntryLocationOptions: Array<{ value: string; label: string }>;
  fuelTypeOptions: Array<{ value: string; label: string }>;
  fuelUnitOptionsMap: Record<string, Array<{ value: string; label: string }>>;
  baselineYear?: number;
  financialYearMonth?: string;
  counts: {
    all: number;
    pending_data: number;
    ai_uploaded: number;
    manual_entry: number;
  };
  refetch: () => void;
  shouldDisableAddNewEntry: boolean;
}

/**
 * Server-side hook to fetch Energy Captive Power Non-Renewable data with pre-population
 * This fetches merged data (existing + pre-populated) from the server
 */
export const useEnergyCaptivePowerNonRenewableFuelServerData = ({
  organizationId,
  accessToken,
  pagination,
  sorting,
  globalFilter,
  uploadType = "all",
  activity = "energy",
  formMode = FORM_MODE_STANDARD,
  skip = false,
}: UseEnergyCaptivePowerNonRenewableFuelServerDataProps): UseEnergyCaptivePowerNonRenewableFuelServerDataReturn => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [locationOptions, setLocationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [addNewEntryLocationOptions, setAddNewEntryLocationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [fuelUnitOptionsMap, setFuelUnitOptionsMap] = useState<
    Record<string, Array<{ value: string; label: string }>>
  >({});
  const [baselineYear, setBaselineYear] = useState<number | undefined>();
  const [financialYearMonth, setFinancialYearMonth] = useState<
    string | undefined
  >();
  const [counts, setCounts] = useState({
    all: 0,
    pending_data: 0,
    ai_uploaded: 0,
    manual_entry: 0,
  });
  const [shouldDisableAddNewEntry, setShouldDisableAddNewEntry] =
    useState(false);

  const fetchData = useCallback(async () => {
    if (!organizationId || !accessToken || skip) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClientWithAuth.post(
        `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/non-renewable-fuel/list`,
        {
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
          },
          sorting,
          globalFilter,
          uploadType,
          activity,
          formMode,
        }
      );

      if (response.data?.success) {
        setData(response.data.data || []);
        setTotalCount(response.data.totalCount || 0);
        setLocationOptions(response.data.locationOptions || []);
        setAddNewEntryLocationOptions(
          response.data.addNewEntryLocationOptions ||
            response.data.locationOptions ||
            []
        );
        setFuelTypeOptions(response.data.fuelTypeOptions || []);
        setFuelUnitOptionsMap(response.data.fuelUnitOptionsMap || {});
        setBaselineYear(response.data.baselineYear);
        setFinancialYearMonth(response.data.financialYearMonth);
        setCounts(
          response.data.counts || {
            all: 0,
            pending_data: 0,
            ai_uploaded: 0,
            manual_entry: 0,
          }
        );
        setShouldDisableAddNewEntry(
          response.data.shouldDisableAddNewEntry || false
        );
      } else {
        console.error("Server response error:", response.data?.message);
        setData([]);
        setTotalCount(0);
        setLocationOptions([]);
        setAddNewEntryLocationOptions([]);
        setFuelTypeOptions([]);
        setFuelUnitOptionsMap({});
        setCounts({ all: 0, pending_data: 0, ai_uploaded: 0, manual_entry: 0 });
        setShouldDisableAddNewEntry(false);
      }
    } catch (error) {
      console.error("Error fetching server data:", error);
      setData([]);
      setTotalCount(0);
      setLocationOptions([]);
      setAddNewEntryLocationOptions([]);
      setFuelTypeOptions([]);
      setFuelUnitOptionsMap({});
      setCounts({ all: 0, pending_data: 0, ai_uploaded: 0, manual_entry: 0 });
      setShouldDisableAddNewEntry(false);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    accessToken,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    globalFilter,
    uploadType,
    activity,
    formMode,
    skip,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    totalCount,
    locationOptions,
    addNewEntryLocationOptions,
    fuelTypeOptions,
    fuelUnitOptionsMap,
    baselineYear,
    financialYearMonth,
    counts,
    refetch,
    shouldDisableAddNewEntry,
  };
};
