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
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { UploadType } from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import {
    energyFuelPurchasedFormUpdated,
    postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import { PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE } from "@/modules/ghg/utils/const";

type RowData = Record<string, string | number | null | undefined>;

interface UseFuelConsumptionDataProps {
  organizationId: string;
  userId: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  activity?: string;
  uploadType?: UploadType;
  isOrganizationAdmin?: boolean;
}

interface UseFuelConsumptionDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  refetch: () => void;
  allCount: number;
  typeOfFuelPurchasedOptions: Array<{ value: string; label: string }>;
  quantityOfFuelConsumedUomOptions: Array<{ value: string; label: string }>;
  pointOfConsumptionOptions: Array<{ value: string; label: string }>;
  uomGrouping: any[];
  baselineYear?: number;
  financialYearMonth?: string;
}

export const getMonthOptionsForYear = (
  selectedYear: string | number | undefined | null,
  baselineYear?: number,
  financialYearMonth?: string
): string[] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthNames = Month.map((m) => m);

  if (!selectedYear) return monthNames;

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

export const useFuelConsumptionGeneralData = ({
  organizationId,
  userId,
  pagination,
  sorting,
  globalFilter,
  activity = "energy",
  isOrganizationAdmin = false,
}: UseFuelConsumptionDataProps): UseFuelConsumptionDataReturn => {
  const params = useParams();
  const accessToken = params?.accessToken as string;

  // Get dynamic form mode from GraphQL
  const { formMode } = useFuelConsumptionFormMode();

  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.energy_fuel_purchased,
    },
  });

  const extractMasterDataOptions = useCallback(
    (masterKey: string): Array<{ value: string; label: string }> => {
      if (!activityMasterData?.ActivityMaster) return [];
      const masterData = activityMasterData.ActivityMaster.find(
        (master) => master.master_key === masterKey
      );
      if (!masterData?.master_data) return [];
      return Array.isArray(masterData.master_data)
        ? masterData.master_data.map((item: any) => ({
            value: item.value || item,
            label: item.label || item.value || item,
          }))
        : [];
    },
    [activityMasterData]
  );

  const typeOfFuelPurchasedOptions = useMemo(
    () => extractMasterDataOptions("Energy_FuelPurchased_General_FuelType"),
    [extractMasterDataOptions]
  );

  const quantityOfFuelConsumedUomOptions = useMemo(
    () => extractMasterDataOptions("Energy_FuelPurchased_General_FuelType_UOM"),
    [extractMasterDataOptions]
  );

  /**
   * Fetches the raw UoM master data including 'group' fields.
   * This is used for dynamic UoM filtering (e.g., matching Petrol units to Petrol fuel).
   */
  const uomGrouping = useMemo(() => {
    if (!activityMasterData?.ActivityMaster) return [];
    const masterData = activityMasterData.ActivityMaster.find(
      (master) =>
        master.master_key === "Energy_FuelPurchased_General_FuelType_UOM"
    );
    return (masterData?.master_data as any[]) || [];
  }, [activityMasterData]);

  const pointOfConsumptionOptions = useMemo(
    () =>
      extractMasterDataOptions(
        "Energy_FuelPurchased_General_PointOfConsumption"
      ),
    [extractMasterDataOptions]
  );

  const { data: locationsData } = useGetLocationsAndAddressesQuery({
    variables: { organizationId, userId },
    skip: !organizationId || !userId || isOrganizationAdmin,
  });

  const { data: adminAddressesData } = useGetAddressesQuery({
    variables: { organisationAddressId: organizationId },
    skip: !organizationId || !isOrganizationAdmin,
  });

  const { locationOptions } = useMemo(() => {
    if (isOrganizationAdmin) {
      if (!adminAddressesData?.OrganizationAddress)
        return { locationOptions: [], organizationAddressIds: [] };
      const options: Array<{ value: string; label: string }> = [];
      adminAddressesData.OrganizationAddress.forEach((address) => {
        const id = address.id || "";
        const name = address.Address?.name || "";
        if (id && name) {
          options.push({ value: id, label: name });
        }
      });
      return { locationOptions: options, organizationAddressIds: [] };
    } else {
      if (!locationsData?.UserOrganizationAddressMapping)
        return { locationOptions: [], organizationAddressIds: [] };
      const options: Array<{ value: string; label: string }> = [];
      locationsData.UserOrganizationAddressMapping.forEach((mapping) => {
        const id = mapping.organization_address_id || "";
        const name = mapping.OrganizationAddress?.Address?.name || "";
        if (id && name && mapping.activities.includes(activity)) {
          options.push({ value: id, label: name });
        }
      });
      return { locationOptions: options, organizationAddressIds: [] };
    }
  }, [locationsData, adminAddressesData, activity, isOrganizationAdmin]);

  // Fetch data from the list API route
  const [tableData, setTableData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [apiUomGrouping, setApiUomGrouping] = useState<any[]>([]);
  const [apiFuelTypeOptions, setApiFuelTypeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const refetch = useCallback(async () => {
    if (!organizationId || !accessToken) return;

    setLoading(true);
    try {
      const response = await apiClientWithAuth.post(
        `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-fuel-consumption/general-purpose/list`,
        {
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
          },
          sorting, // Pass sorting state from parent
          globalFilter,
          formMode, // Pass dynamic formMode
        }
      );

      if (response?.data?.success) {
        setTableData(response.data.data || []);
        setRowCount(response.data.totalCount || 0);
        setAllCount(response.data.totalCount || 0);
        setApiUomGrouping(response.data.uomGrouping || []);
        setApiFuelTypeOptions(response.data.fuelTypeOptions || []);
      }
    } catch (error) {
      console.error("Error fetching fuel consumption data:", error);
      setTableData([]);
      setRowCount(0);
      setApiUomGrouping([]);
      setApiFuelTypeOptions([]);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    accessToken,
    pagination,
    sorting,
    globalFilter,
    formMode,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Fetch organization baseline year and financial month
  const { baselineYear, financialYearMonth } = useFuelConsumptionOrgData();

  return {
    data: tableData,
    loading,
    rowCount,
    locationOptions,
    refetch,
    allCount,
    typeOfFuelPurchasedOptions:
      apiFuelTypeOptions.length > 0
        ? apiFuelTypeOptions
        : typeOfFuelPurchasedOptions,
    quantityOfFuelConsumedUomOptions:
      apiUomGrouping.length > 0
        ? apiUomGrouping.map((uom: any) => ({
            label: uom.label || uom.value,
            value: uom.value || uom.label,
          }))
        : quantityOfFuelConsumedUomOptions,
    pointOfConsumptionOptions,
    uomGrouping: apiUomGrouping.length > 0 ? apiUomGrouping : uomGrouping,
    baselineYear,
    financialYearMonth,
  };
};

export const useFuelConsumptionOrgData = () => {
  const params = useParams();
  const organizationId = params?.organizationId as string;

  const {
    data: orgData,
    loading,
    error,
  } = useGetOrgDataQuery({
    variables: { organizationId },
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

interface UseDeleteMessageHandlerProps {
  organizationId: string;
  accessToken: string;
  refetch: () => void;
  onError: (message: string) => void;
  onSavingChange: (isSaving: boolean) => void;
  // optional callback executed after refetch completes (e.g. to reset table selection)
  onRefetchCompleted?: () => void;
}

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
      let messageData: { type: string; data: any } = { type: "", data: "" };
      if (event.data) {
        try {
          messageData = JSON.parse(event.data);
          if (messageData.type === "confirm-delete-form-entry-true") {
            const { selectedRowIdsToDelete, organizationAddressId } =
              messageData.data || {};

            if (selectedRowIdsToDelete?.length > 0 && organizationAddressId) {
              try {
                onError("");
                onSavingChange(true);

                const response = await apiClientWithAuth
                  .post(
                    `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-fuel-consumption/general-purpose`,
                    {
                      action: "delete",
                      selectedRowIdsToDelete,
                      organizationAddressId,
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
                  await refetch();
                  // Allow caller to reset UI state (for example: table.resetRowSelection())
                  try {
                    onRefetchCompleted?.();
                  } catch (err) {
                    console.warn("onRefetchCompleted callback failed:", err);
                  }
                  postParentMessage(energyFuelPurchasedFormUpdated(true)); // Generic form updated event
                } else {
                  throw new Error(
                    response.message || "Delete operation failed"
                  );
                }
              } catch (err) {
                // apiExceptionGuard returns { code, error: { message, ... } };
                // older paths put the message at the top level. Surface either
                // so users see the real reason (e.g. RULE-008 422 approval lock)
                // instead of "Request failed with status code N".
                const data = (err as any)?.response?.data;
                const apiMsg = data?.error?.message || data?.message;
                onError(
                  apiMsg ||
                    (err instanceof Error ? err.message : "An error occurred")
                );
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
    return () => window.removeEventListener("message", handleMessage);
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
// Form Mode and Server-Side Data Fetching (for Prepopulate Mode)
// ============================================================================

export type FormMode = "standard" | "prepopulate";

interface UseFormModeReturn {
  formMode: FormMode;
  loading: boolean;
}

export const useFuelConsumptionFormMode = (): UseFormModeReturn => {
  const params = useParams();
  const organizationId = params?.organizationId as string;

  const { data, loading, error } = useGetPlatformFeatureFlagsQuery({
    variables: {
      organizationId,
      type: PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
    },
    skip: !organizationId,
  });

  const formMode: FormMode = useMemo(() => {
    if (!data?.PlatformFeatureFlags || data.PlatformFeatureFlags.length === 0) {
      return "standard";
    }
    return data.PlatformFeatureFlags[0]?.feat_prepopulate_activity_form
      ? "prepopulate"
      : "standard";
  }, [data]);

  if (error) {
    console.error("Error fetching platform feature flags:", error);
  }

  return { formMode, loading };
};

interface UsePrePopulatedFuelConsumptionDataProps {
  organizationId: string;
  accessToken: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  statusFilter?: string;
  enabled?: boolean;
}

interface UsePrePopulatedFuelConsumptionDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  allCount: number;
  pendingCount: number;
  manualEntryCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  addNewEntryLocationOptions: Array<{ value: string; label: string }>;
  shouldDisableAddNewEntry: boolean;
  typeOfFuelPurchasedOptions: Array<{ value: string; label: string }>;
  quantityOfFuelConsumedUomOptions: Array<{ value: string; label: string }>;
  pointOfConsumptionOptions: Array<{ value: string; label: string }>;
  uomGrouping: any[];
  baselineYear?: number;
  financialYearMonth?: string;
  refetch: () => void;
  prepopulateMode?: string;
}

/**
 * Hook to fetch pre-populated fuel consumption data from the paginated API endpoint.
 * Used in "prepopulate" mode where skeleton rows are generated server-side from
 * OrgActivityMaster configuration for each location.
 */
export const usePrePopulatedFuelConsumptionData = ({
  organizationId,
  accessToken,
  pagination,
  sorting,
  globalFilter,
  statusFilter = "all",
  enabled = true,
}: UsePrePopulatedFuelConsumptionDataProps): UsePrePopulatedFuelConsumptionDataReturn => {
  const [allData, setAllData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get dynamic form mode from GraphQL
  const { formMode } = useFuelConsumptionFormMode();

  // Fetch master data for Point of Consumption options
  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.energy_fuel_purchased,
    },
  });

  const extractMasterDataOptions = useCallback(
    (masterKey: string): Array<{ value: string; label: string }> => {
      if (!activityMasterData?.ActivityMaster) return [];
      const masterData = activityMasterData.ActivityMaster.find(
        (master) => master.master_key === masterKey
      );
      if (!masterData?.master_data) return [];
      return Array.isArray(masterData.master_data)
        ? masterData.master_data.map((item: any) => ({
            value: item.value || item,
            label: item.label || item.value || item,
          }))
        : [];
    },
    [activityMasterData]
  );

  const pointOfConsumptionOptions = useMemo(
    () =>
      extractMasterDataOptions(
        "Energy_FuelPurchased_General_PointOfConsumption"
      ),
    [extractMasterDataOptions]
  );

  const refetch = useCallback(async () => {
    if (!organizationId || !accessToken || !enabled) return;

    setLoading(true);
    try {
      // Use POST with the same endpoint as useFuelConsumptionGeneralData
      const response = await apiClientWithAuth.post(
        `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-fuel-consumption/general-purpose/list`,
        {
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
          },
          sorting, // Pass sorting state
          globalFilter,
          statusFilter,
          formMode, // Pass dynamic formMode
        }
      );

      if (response?.data?.success) {
        setAllData(response.data);
      }
    } catch (error) {
      console.error(
        "Error fetching pre-populated fuel consumption data:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    accessToken,
    pagination,
    sorting,
    globalFilter,
    statusFilter,
    formMode,
    enabled,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const tableData = useMemo<RowData[]>(() => {
    if (!allData?.data) return [];
    return allData.data.map((row: any) => ({
      ...row,
    }));
  }, [allData]);

  return {
    data: tableData,
    loading,
    rowCount: allData?.totalCount || 0,
    allCount: allData?.allCount || 0,
    pendingCount: allData?.pendingCount || 0,
    manualEntryCount: allData?.manualEntryCount || 0,
    locationOptions: allData?.locationOptions || [],
    addNewEntryLocationOptions: allData?.locationsForAddNew || [],
    shouldDisableAddNewEntry:
      allData !== null && (allData?.locationsForAddNew?.length ?? 0) === 0,
    typeOfFuelPurchasedOptions: allData?.fuelTypeOptions || [],
    quantityOfFuelConsumedUomOptions: allData?.uomGrouping
      ? allData.uomGrouping.map((uom: any) => ({
          label: uom.label || uom.value,
          value: uom.value || uom.label,
        }))
      : [],
    pointOfConsumptionOptions,
    uomGrouping: allData?.uomGrouping || [],
    baselineYear: allData?.baselineYear,
    financialYearMonth: allData?.financialYearMonth,
    refetch,
    prepopulateMode: allData?.prepopulateMode,
  };
};
