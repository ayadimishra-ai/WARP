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
import { useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery } from "@/modules/ghg/graphql/queries/internal/get-activity-data-energy-captive-power-renewable-paginated.generated";
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

interface UsePrePopulatedRenewableDataProps {
  organizationId: string;
  accessToken: string;
  pagination: MRT_PaginationState;
  sorting?: MRT_SortingState;
  globalFilter: string;
  uploadType?: string; // Add uploadType support
  statusFilter?: string; // Keep backward compatibility
  activity?: string; // Add activity support
  formMode?: string; // Add form mode support
  skip?: boolean; // Add skip support
  enabled?: boolean;
}

interface UseEnergyCaptivePowerRenewableDataProps {
  organizationId: string;
  userId: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  activity?: string;
  isOrganizationAdmin?: boolean;
  enabled?: boolean;
}

interface UseEnergyCaptivePowerRenewableDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  technologyOptions: Array<{ value: string; label: string }>;
  baselineYear?: number;
  financialYearMonth?: string;
  refetch: () => void;
}

interface UsePrePopulatedRenewableDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  allCount: number;
  pendingCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  locationsForAddNew: Array<{ value: string; label: string }>;
  technologyOptions: Array<{ value: string; label: string }>;
  addNewEntryTechnologyOptions: Array<{ value: string; label: string }>;
  baselineYear?: number;
  financialYearMonth?: string;
  refetch: () => void;
  isConfigured: boolean;
  prepopulateMode: string | null;
  // Compatibility aliases for listing component
  totalCount: number;
  addNewEntryLocationOptions: Array<{ value: string; label: string }>;
  counts: {
    allCount: number;
    pendingCount: number;
  };
  shouldDisableAddNewEntry: boolean;
}

/**
 * Hook to handle message events for delete operations
 */
interface UseDeleteMessageHandlerProps {
  organizationId: string;
  accessToken: string;
  refetch: () => void;
  onError: (message: string) => void;
  onSavingChange: (isSaving: boolean) => void;
  onRefetchCompleted?: () => void;
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

  if (!selectedYear) {
    return monthNames;
  }

  const selectedYearNum = Number(selectedYear);
  const baselineYearNum = baselineYear || currentYear;

  if (selectedYearNum === baselineYearNum && financialYearMonth) {
    const financialMonthIndex = monthNames.findIndex(
      (m) => m.toLowerCase() === financialYearMonth.toLowerCase()
    );
    if (financialMonthIndex !== -1) {
      return monthNames.slice(financialMonthIndex);
    }
  }

  if (selectedYearNum === currentYear) {
    return monthNames.slice(0, currentMonth);
  }

  return monthNames;
};

/**
 * Standard mode hook (no pre-population): server-side paginated existing records.
 */
export const useEnergyCaptivePowerRenewableData = ({
  organizationId,
  userId,
  pagination,
  sorting,
  globalFilter,
  activity = "energy",
  isOrganizationAdmin = false,
  enabled = true,
}: UseEnergyCaptivePowerRenewableDataProps): UseEnergyCaptivePowerRenewableDataReturn => {
  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.energy_captive_power,
    },
    skip: !enabled,
  });

  const { data: locationsData } = useGetLocationsAndAddressesQuery({
    variables: {
      organizationId,
      userId,
    },
    skip: !enabled || !organizationId || !userId || isOrganizationAdmin,
  });

  const { data: adminAddressesData } = useGetAddressesQuery({
    variables: {
      organisationAddressId: organizationId,
    },
    skip: !enabled || !organizationId || !isOrganizationAdmin,
  });

  const { data: orgData, loading: orgLoading } = useGetOrgDataQuery({
    variables: {
      organizationId,
    },
    skip: !enabled || !organizationId,
  });

  const { locationOptions, organizationAddressIds } = useMemo(() => {
    if (!enabled) return { locationOptions: [], organizationAddressIds: [] };

    if (isOrganizationAdmin) {
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
    }

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
  }, [
    enabled,
    isOrganizationAdmin,
    adminAddressesData,
    locationsData,
    activity,
  ]);

  const technologyOptions = useMemo(() => {
    if (!enabled || !activityMasterData?.ActivityMaster) return [];

    const master = activityMasterData.ActivityMaster.find(
      (m) => m.master_key === "Energy_CaptivePower_Type_of_Technology_Used"
    );

    if (!master?.master_data || !Array.isArray(master.master_data)) return [];

    return master.master_data.map((item: any) => ({
      value: item.value || item,
      label: item.label || item.value || item,
    }));
  }, [enabled, activityMasterData]);

  const orderBy = useMemo(() => {
    if (!sorting || sorting.length === 0) {
      return [
        { updated_at: Order_By.Desc },
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: { year: Order_By.Desc },
          },
        },
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: { month: Order_By.Desc },
          },
        },
      ];
    }

    return sorting.map((sort) => {
      const direction = sort.desc ? Order_By.Desc : Order_By.Asc;

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
        case "typeOfTechnologyUsed":
          return { Type_of_Technology_Used: direction };
        case "yearOfInstallation":
          return { Year_of_installation: direction };
        case "unitOfEnergyGeneratedInKwh":
          return { Unit_of_Energy_Generated_in_Kwh: direction };
        default:
          return { [sort.id]: direction };
      }
    });
  }, [sorting]);

  const activityFilter = useMemo(() => {
    const searchValue = globalFilter?.trim() ?? "";
    if (searchValue === "") return {};

    const numericValue = Number(searchValue);
    const isNumeric = !Number.isNaN(numericValue);

    return {
      _or: [
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: { month: { _ilike: `%${searchValue}%` } },
          },
        },
        ...(isNumeric
          ? [
              {
                GHGEnergy_CaptivePower: {
                  TaskRequest: { year: { _eq: numericValue } },
                },
              },
            ]
          : []),
        {
          GHGEnergy_CaptivePower: {
            TaskRequest: {
              OrganizationAddress: {
                Address: { name: { _ilike: `%${searchValue}%` } },
              },
            },
          },
        },
        { Type_of_Technology_Used: { _ilike: `%${searchValue}%` } },
        ...(isNumeric ? [{ Year_of_installation: { _eq: numericValue } }] : []),
        ...(isNumeric
          ? [{ Unit_of_Energy_Generated_in_Kwh: { _eq: numericValue } }]
          : []),
      ],
    };
  }, [globalFilter]);

  const { data, loading, refetch } =
    useGetActivityDataEnergyCaptivePowerRenewablePaginatedQuery({
      variables: {
        organization_address_ids: organizationAddressIds,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        order_by: orderBy,
        activityFilter,
      },
      skip: !enabled || organizationAddressIds.length === 0,
      fetchPolicy: "network-only",
    });

  const tableData = useMemo<RowData[]>(() => {
    if (!data?.GHGEnergy_CaptivePower_Renewable) {
      return [];
    }

    return data.GHGEnergy_CaptivePower_Renewable.map((renewable) => {
      const captivePower = renewable.GHGEnergy_CaptivePower;
      const taskRequest = captivePower?.TaskRequest;
      const locationName =
        taskRequest?.OrganizationAddress?.Address?.name || "";

      return {
        id: renewable.id || "",
        location: locationName,
        year: taskRequest?.year?.toString() || "",
        month: taskRequest?.month || "",
        typeOfTechnologyUsed: renewable.type_of_technology_used || "",
        yearOfInstallation: renewable.year_of_installation || "",
        unitOfEnergyGeneratedInKwh:
          renewable.unit_of_energy_generated_in_kwh ?? "",
        GHGEnergyConsumption_CaptivePower_id:
          renewable.GHGEnergyConsumption_CaptivePower_id || "",
        createdByUserName: renewable.CreatedByUser?.name || "",
        updatedByUserName: renewable.UpdatedByUser?.name || "",
        updatedAt: renewable.updated_at || "",
      };
    });
  }, [data]);

  const org = orgData?.Organization?.[0];

  return {
    data: tableData,
    loading: enabled ? loading || orgLoading : false,
    rowCount: data?.totalCount?.length || 0,
    locationOptions,
    technologyOptions,
    baselineYear: org?.Baselineyear,
    financialYearMonth: org?.FinancialYearMonth,
    refetch: refetch || (() => {}),
  };
};

/**
 * Hook that fetches server-side pre-populated + merged data with pagination.
 * Calls the GET endpoint which handles skeleton generation, merging, filtering
 * and pagination on the server.
 */
export const usePrePopulatedRenewableData = ({
  organizationId,
  accessToken,
  pagination,
  sorting = [],
  globalFilter,
  uploadType = "all",
  statusFilter,
  activity = "energy",
  formMode = "standard",
  skip = false,
  enabled = true,
}: UsePrePopulatedRenewableDataProps): UsePrePopulatedRenewableDataReturn => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [locationOptions, setLocationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [locationsForAddNew, setLocationsForAddNew] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [technologyOptions, setTechnologyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [baselineYear, setBaselineYear] = useState<number | undefined>();
  const [financialYearMonth, setFinancialYearMonth] = useState<
    string | undefined
  >();
  const [isConfigured, setIsConfigured] = useState(false);
  const [prepopulateMode, setPrepopulateMode] = useState<string | null>(null);
  const [addNewEntryTechnologyOptions, setAddNewEntryTechnologyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [fetchKey, setFetchKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!enabled || skip || !organizationId || !accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const normalizedSearch =
        globalFilter && globalFilter !== "undefined" && globalFilter !== "null"
          ? globalFilter
          : "";

      // Use uploadType or statusFilter (uploadType takes precedence)
      const filterValue = uploadType || statusFilter || "all";

      const params = new URLSearchParams({
        pageIndex: String(pagination.pageIndex),
        pageSize: String(pagination.pageSize),
        search: normalizedSearch,
        statusFilter: filterValue,
        sorting: JSON.stringify(sorting),
      });

      const response = await apiClientWithAuth.get(
        `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/renewable/paginated?${params.toString()}`
      );

      const result = response.data;
      if (result.success) {
        setData(result.data ?? []);
        setRowCount(result.totalCount ?? 0);
        setAllCount(result.allCount ?? 0);
        setPendingCount(result.pendingCount ?? 0);
        setLocationOptions(result.locations ?? []);
        setLocationsForAddNew(result.locationsForAddNew ?? []);
        setTechnologyOptions(result.technologyOptions ?? []);
        setAddNewEntryTechnologyOptions(result.activityMasterTechnologyOptions ?? []);
        setBaselineYear(result.baselineYear ?? undefined);
        setFinancialYearMonth(result.financialYearMonth ?? undefined);
        setIsConfigured(!!result.isConfigured);
        setPrepopulateMode(result.prepopulateMode ?? null);
      }
    } catch (err) {
      console.error("Error fetching pre-populated renewable data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    accessToken,
    enabled,
    skip,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    globalFilter,
    uploadType,
    statusFilter,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    rowCount,
    totalCount: rowCount, // Add alias for compatibility
    allCount,
    pendingCount,
    locationOptions,
    addNewEntryLocationOptions: locationsForAddNew, // Add alias for compatibility
    locationsForAddNew,
    technologyOptions,
    addNewEntryTechnologyOptions,
    baselineYear,
    financialYearMonth,
    counts: { allCount, pendingCount }, // Add counts object for compatibility
    refetch,
    isConfigured,
    prepopulateMode,
    shouldDisableAddNewEntry: (locationsForAddNew?.length ?? 0) === 0, // Add shouldDisableAddNewEntry
  };
};

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
                    `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/renewable`,
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
                  console.log("Records deleted successfully:", response);
                  // Refetch data after successful deletion
                  await refetch();
                  // Allow caller to reset UI state (for example: table.resetRowSelection())
                  try {
                    onRefetchCompleted?.();
                  } catch (err) {
                    console.warn("onRefetchCompleted callback failed:", err);
                  }

                  // Show success popup using window parent message
                  postParentMessage(
                    energyCaptivePowerFormUpdated(true, "Renewable")
                  );
                } else {
                  throw new Error(
                    response.message || "Delete operation failed"
                  );
                }
              } catch (err) {
                let errorMessage = "An error occurred while deleting records";
                // apiExceptionGuard returns { code, error: { message, ... } };
                // older paths put the message at the top level. Surface either
                // so users see the real reason (e.g. RULE-008 422 approval lock)
                // instead of "Request failed with status code N".
                const data = (err as any)?.response?.data;
                const apiMsg = data?.error?.message || data?.message;
                if (apiMsg) {
                  errorMessage = apiMsg;
                } else if (err instanceof Error) {
                  errorMessage = err.message;
                }
                onError(errorMessage);
                console.error("Error deleting rows:", err);
              } finally {
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

// Export the FormMode type
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

// Hook to determine form mode (standard vs prepopulate)
export const useEnergyCaptivePowerRenewableFormMode = (): UseFormModeReturn => {
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
