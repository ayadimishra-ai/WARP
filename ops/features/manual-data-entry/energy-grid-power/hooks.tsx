import axios from "axios";
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetLocationsAndAddressesQuery } from "~/graphql/queries/get-addresses-by-userid-and-orgid.generated";
import { useGetAddressesQuery } from "~/graphql/queries/get-addresses.generated";
import { useGetOrgDataQuery } from "~/graphql/queries/get-organization-data.generated";
import { useGetPlatformFeatureFlagsQuery } from "~/graphql/queries/get-platform-feature-flags.generated";
import { useGetActivityDataEnergyGridPowerPaginatedQuery } from "~/graphql/queries/internal/get-activity-data-energy-grid-power-paginated.generated";
import { apiClientWithAuth } from "~/lib/fetcher";
import { Month } from "~/lib/shared/constants/input.constant";
import { UPLOAD_TYPES, UploadType } from "~/shared/constants/activity.constant";
import {
  energyGridPowerFormUpdated,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import {
  FORM_MODE_PREPOPULATE,
  FORM_MODE_STANDARD,
  PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
} from "~/utils/const";
import { FormMode } from "./listing";

type RowData = Record<string, string | number | null | undefined | boolean>; // Use 'any' for metadata field which can be an object

interface UseEnergyGridPowerDataProps {
  organizationId: string;
  userId: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  activity?: string;
  uploadType?: UploadType;
  isOrganizationAdmin?: boolean;
}

interface UseEnergyGridPowerDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  refetch: () => void;
  allCount: number;
  aiUploadedCount: number;
  manualEntryCount: number;
}

interface UseEnergyGridPowerOrgDataReturn {
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

  // If selected year is the current year, show from January to previous month (exclude current month)
  if (selectedYearNum === currentYear) {
    return monthNames.slice(0, currentMonth);
  }

  return monthNames;
};

/**
 * Custom hook to fetch Energy Grid Power data
 * NOT IN USE CURRENTLY, WILL REMOVE ONCE REQUIREMENT FINALIZED
 */
export const useEnergyGridPowerData = ({
  organizationId,
  userId,
  pagination,
  sorting,
  globalFilter,
  activity = "energy",
  uploadType = UPLOAD_TYPES.ALL,
  isOrganizationAdmin = false,
}: UseEnergyGridPowerDataProps): UseEnergyGridPowerDataReturn => {
  // 1️ Fetch user's organization locations (for non-admin users)
  const { data: locationsData } = useGetLocationsAndAddressesQuery({
    variables: { organizationId, userId },
    skip: !organizationId || !userId || isOrganizationAdmin,
  });

  // 1a️ Fetch all organization addresses (for admin users)
  const { data: adminAddressesData } = useGetAddressesQuery({
    variables: {
      organisationAddressId: organizationId,
    },
    skip: !organizationId || !isOrganizationAdmin,
  });

  // 2️ Build location options and extract IDs
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

  // 3️ Build order_by for GraphQL (GridPower level fields)
  const orderBy = useMemo(() => {
    if (!sorting || sorting.length === 0) {
      // Default sorting: Primary by updated_at DESC, Secondary by year DESC, then month DESC
      return [
        { updated_at: "desc_nulls_last" as const },
        { TaskRequest: { year: "desc" as const } },
        { TaskRequest: { month: "desc" as const } },
      ];
    }

    return sorting.map((sort) => {
      const direction = sort.desc
        ? ("desc_nulls_last" as const)
        : ("asc_nulls_last" as const);

      const numericdirection = sort.desc
        ? ("desc_nulls_last" as const)
        : ("asc_nulls_first" as const);

      const fieldMap: Record<string, any> = {
        year: { TaskRequest: { year: direction } },
        month: { TaskRequest: { month: direction } },
        location: { TaskRequest: { organization_address_id: direction } },
        nameOfDistributionCompany: { Name_of_Distribution_Company: direction },
        powerConsumedThroughGridKwh: {
          PowerConsumed_through_Grid_Kwh: numericdirection,
        },
        nameOfCompanyPPARenewable: { NameOfCompany_PPA_Renewable: direction },
        powerPurchasedThroughPPAKwhRenewable: {
          PowerPurchased_through_PPA_Kwh_Renewable: numericdirection,
        },
        nameOfCompanyPPANonRenewable: {
          NameOfCompany_PPA_NonRenewable: direction,
        },
        powerPurchasedThroughPPAKwhNonRenewable: {
          PowerPurchased_through_PPA_Kwh_NonRenewable: numericdirection,
        },
        nameOfCompanyForREC: { Name_of_company_for_REC: direction },
        powerPurchasedThroughRECKwh: {
          PowerPurchased_through_REC_Kwh: numericdirection,
        },
        createdByUserName: { created_by: direction },
        updatedByUserName: { updated_by: direction },
        updatedAt: { updated_at: direction },
      };

      const mappedField = fieldMap[sort.id];
      return mappedField || { [sort.id]: direction };
    });
  }, [sorting]);

  // 4️ Build activity filter for global search (for GridPower level query)
  const activityFilter = useMemo(() => {
    if (!globalFilter || globalFilter.trim() === "") return {};

    const searchValue = globalFilter.trim();
    const numericValue = Number(searchValue);
    const isNumeric = !isNaN(numericValue) && searchValue !== "";

    return {
      _or: [
        // Search in TaskRequest month (through relationship)
        { TaskRequest: { month: { _ilike: `%${searchValue}%` } } },

        // Search in TaskRequest year (through relationship, if numeric)
        ...(isNumeric
          ? [{ TaskRequest: { year: { _eq: numericValue } } }]
          : []),

        // Search in location name (through TaskRequest relationship)
        {
          TaskRequest: {
            OrganizationAddress: {
              Address: { name: { _ilike: `%${searchValue}%` } },
            },
          },
        },

        // Search in grid power text fields (direct fields)
        { Name_of_Distribution_Company: { _ilike: `%${searchValue}%` } },
        { NameOfCompany_PPA_Renewable: { _ilike: `%${searchValue}%` } },
        { NameOfCompany_PPA_NonRenewable: { _ilike: `%${searchValue}%` } },
        { Name_of_company_for_REC: { _ilike: `%${searchValue}%` } },

        // Search in created by user name (using actual relationship name from schema)
        { AppUser: { name: { _ilike: `%${searchValue}%` } } },

        // Search in updated by user name (using actual relationship name from schema)
        { appUserByUpdatedBy: { name: { _ilike: `%${searchValue}%` } } },

        // Search in grid power numeric fields (if numeric)
        ...(isNumeric
          ? [
              { PowerConsumed_through_Grid_Kwh: { _eq: numericValue } },
              {
                PowerPurchased_through_PPA_Kwh_Renewable: { _eq: numericValue },
              },
              {
                PowerPurchased_through_PPA_Kwh_NonRenewable: {
                  _eq: numericValue,
                },
              },
              { PowerPurchased_through_REC_Kwh: { _eq: numericValue } },
            ]
          : []),
      ],
    };
  }, [globalFilter]);

  // 4a️ Build uploadType filter (server-side metadata filter)
  const uploadTypeFilter = useMemo(() => {
    if (uploadType === UPLOAD_TYPES.ALL) {
      // Show both AI uploaded and manual entries (no filter needed)
      return {};
    }

    if (uploadType === UPLOAD_TYPES.AI_UPLOADED) {
      // Filter for records with AIExtractedData key in metadata
      return {
        metadata: { _contains: { AIExtractedData: {} } },
      };
    }

    if (uploadType === UPLOAD_TYPES.MANUAL_ENTRY) {
      // Filter for records WITHOUT AIExtractedData (manual entries only)
      // Exclude any record that has metadata containing AIExtractedData
      return {
        _or: [
          { metadata: { _is_null: true } },
          { metadata: { _eq: "{}" } },
          { _not: { metadata: { _contains: { AIExtractedData: {} } } } },
        ],
      };
    }

    return {};
  }, [uploadType]);

  // 5 Fetch paginated GraphQL data
  const { data, loading, error, refetch } =
    useGetActivityDataEnergyGridPowerPaginatedQuery({
      variables: {
        organization_address_ids: organizationAddressIds,
        limit: 10000, // Fetch all records to properly merge with pre-populated rows client-side
        offset: 0,
        order_by: orderBy,
        activityFilter: activityFilter,
        uploadTypeFilter: uploadTypeFilter,
      },
      skip: organizationAddressIds.length === 0,
      fetchPolicy: "network-only",
    });

  if (error) console.error("GraphQL Error:", error);

  // 6 Transform data for table
  const tableData = useMemo<RowData[]>(() => {
    if (!data?.GHGEnergyConsumption_GridPower) return [];

    // Data is already at GridPower level - no need to flatten
    return data.GHGEnergyConsumption_GridPower.map((gridPower: any) => {
      const taskRequest = gridPower.TaskRequest || {};
      const locationName = taskRequest.OrganizationAddress?.Address?.name || "";

      return {
        id: gridPower.id || "", // Grid power record ID (uuid)
        task_request_id: taskRequest.id || "", // Task request ID (uuid)
        location: locationName,
        year: taskRequest.year?.toString() || "",
        month: taskRequest.month,
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
        updatedByUserName:
          gridPower.UpdatedByUser?.name || gridPower.updated_by || "",
        metadata: gridPower.metadata ?? null, // Include metadata for AI extracted data highlighting
        updatedAt: gridPower.updated_at || "",
      };
    });
  }, [data]);

  const rowCount = data?.totalCount?.length || 0;

  // Extract counts from GraphQL response
  const allCount = data?.allCount?.length || 0;
  const aiUploadedCount = data?.aiUploadedCount?.length || 0;
  const manualEntryCount = data?.manualEntryCount?.length || 0;

  return {
    data: tableData,
    loading,
    rowCount,
    locationOptions,
    refetch,
    allCount,
    aiUploadedCount,
    manualEntryCount,
  };
};

// ============================================================================
// Server-Side Data Fetching Hook (with Pre-population)
// ============================================================================

interface UseEnergyGridPowerServerDataProps {
  organizationId: string;
  accessToken: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  uploadType?: string; // "all" | "pending_data" | "ai_uploaded" | "manual_entry"
  activity?: string;
  formMode?: "standard" | "prepopulate"; // "standard" = existing data only, "prepopulate" = with pre-populated rows
  skip?: boolean; // Skip data fetching when true
}

interface UseEnergyGridPowerServerDataReturn {
  data: RowData[];
  loading: boolean;
  totalCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  addNewEntryLocationOptions: Array<{ value: string; label: string }>;
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
 * Server-side hook to fetch Energy Grid Power data with pre-population
 * This fetches merged data (existing + pre-populated) from the server
 */
export const useEnergyGridPowerServerData = ({
  organizationId,
  accessToken,
  pagination,
  sorting,
  globalFilter,
  uploadType = "all",
  activity = "energy",
  formMode = FORM_MODE_STANDARD,
  skip = false,
}: UseEnergyGridPowerServerDataProps): UseEnergyGridPowerServerDataReturn => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [locationOptions, setLocationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [addNewEntryLocationOptions, setAddNewEntryLocationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
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
  const [fetchKey, setFetchKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!organizationId || !accessToken || skip) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClientWithAuth.post(
        `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-grid-power/list`,
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
      }
    } catch (error) {
      console.error("Error fetching grid power data:", error);
      setData([]);
      setTotalCount(0);
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
  }, [fetchData, fetchKey]);

  const refetch = useCallback(() => {
    setFetchKey((prev) => prev + 1);
  }, []);

  return {
    data,
    loading,
    totalCount,
    locationOptions,
    addNewEntryLocationOptions,
    baselineYear,
    financialYearMonth,
    counts,
    refetch,
    shouldDisableAddNewEntry,
  };
};

/**
 * Hook to fetch organization baseline year and financial month
 */
export const useEnergyGridPowerOrgData =
  (): UseEnergyGridPowerOrgDataReturn => {
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

export const useEnergyGridPowerFormMode = (): UseFormModeReturn => {
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
}; /**
 * Hook to handle auto-switching upload type tabs when search results change
 */
interface UseAutoSwitchUploadTypeProps {
  globalFilter: string;
  uploadType: UploadType;
  allCount: number;
  aiUploadedCount: number;
  manualEntryCount: number;
  onUploadTypeChange: (type: UploadType) => void;
}

export const useAutoSwitchUploadType = ({
  globalFilter,
  uploadType,
  allCount,
  aiUploadedCount,
  manualEntryCount,
  onUploadTypeChange,
}: UseAutoSwitchUploadTypeProps): void => {
  useEffect(() => {
    if (globalFilter && globalFilter.trim() !== "") {
      // When searching, switch to a tab that has results
      if (uploadType === UPLOAD_TYPES.ALL && allCount === 0) {
        // If "All" has no results, switch to AI Uploaded if it has results
        if (aiUploadedCount > 0) {
          onUploadTypeChange(UPLOAD_TYPES.AI_UPLOADED);
        } else if (manualEntryCount > 0) {
          onUploadTypeChange(UPLOAD_TYPES.MANUAL_ENTRY);
        }
      } else if (
        uploadType === UPLOAD_TYPES.AI_UPLOADED &&
        aiUploadedCount === 0
      ) {
        // If AI Uploaded has no results, switch to All if it has results
        if (allCount > 0) {
          onUploadTypeChange(UPLOAD_TYPES.ALL);
        } else if (manualEntryCount > 0) {
          onUploadTypeChange(UPLOAD_TYPES.MANUAL_ENTRY);
        }
      } else if (
        uploadType === UPLOAD_TYPES.MANUAL_ENTRY &&
        manualEntryCount === 0
      ) {
        // If Manual Entry has no results, switch to All if it has results
        if (allCount > 0) {
          onUploadTypeChange(UPLOAD_TYPES.ALL);
        } else if (aiUploadedCount > 0) {
          onUploadTypeChange(UPLOAD_TYPES.AI_UPLOADED);
        }
      }
    }
  }, [
    globalFilter,
    allCount,
    aiUploadedCount,
    manualEntryCount,
    uploadType,
    onUploadTypeChange,
  ]);
};

/**
 * Hook to handle message events for delete operations
 */
interface UseDeleteMessageHandlerProps {
  organizationId: string;
  accessToken: string;
  refetch: () => void;
  onError: (message: string) => void;
  onSavingChange: (isSaving: boolean) => void;
  // optional callback executed after refetch completes (e.g. to reset table selection)
  onRefetchCompleted?: () => void;
  FORM_MODE: FormMode;
}

export const useDeleteMessageHandler = ({
  organizationId,
  accessToken,
  refetch,
  onError,
  onSavingChange,
  onRefetchCompleted,
  FORM_MODE,
}: UseDeleteMessageHandlerProps): void => {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let messageData: { type: string; data: any } = {
        type: "",
        data: "",
      };
      if (event.data && FORM_MODE === FORM_MODE_STANDARD) {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "confirm-delete-form-entry-true") {
            // User confirmed the delete action - now actually delete from DB
            // Get delete IDs and organizationAddressId from the message data
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
                    `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-grid-power`,
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
                  await refetch();

                  // Allow caller to reset UI state (for example: table.resetRowSelection())
                  try {
                    onRefetchCompleted?.();
                  } catch (err) {
                    console.warn("onRefetchCompleted callback failed:", err);
                  }

                  // Show success popup using window parent message
                  postParentMessage(energyGridPowerFormUpdated(true));
                } else {
                  throw new Error(
                    response.message || "Delete operation failed"
                  );
                }
              } catch (err) {
                let errorMessage = "An error occurred while deleting records";
                if (axios.isAxiosError(err)) {
                  const data = err.response?.data;
                  errorMessage =
                    data?.error?.message || data?.message || err.message;
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
    FORM_MODE,
  ]);
};

// ============================================================================
// Pre-population Functions for Grid Power (CEAT POC)
// ============================================================================

/**
 * Generate all pre-populated row combinations for location × year × month
 * Note: Grid Power has NO technology dimension (unlike Captive Power)
 */
export const generatePrePopulatedRows = (
  locationOptions: Array<{ value: string; label: string }>,
  baselineYear: number | undefined,
  financialYearMonth: string | undefined
): RowData[] => {
  if (!baselineYear || !financialYearMonth) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const monthNames = Month.map((m) => m);

  const prePopulatedRows: RowData[] = [];

  // Generate for each location
  locationOptions.forEach((location) => {
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

      // Generate for each month (NO technology loop for Grid Power)
      monthsToGenerate.forEach((month) => {
        prePopulatedRows.push({
          location: location.label,
          year: year.toString(),
          month: month,
          nameOfDistributionCompany: null,
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
    }
  });

  return prePopulatedRows;
};

/**
 * Helper function to normalize a value for comparison (lowercase, trimmed)
 */
const normalizeForComparison = (value: any): string => {
  return String(value || "")
    .toLowerCase()
    .trim();
};

/**
 * Merge pre-populated rows with existing data
 * Match key: ${location}|${year}|${month} (normalized, case-insensitive)
 * Note: Grid Power has NO technology dimension (unlike Captive Power)
 */
export const mergeWithExistingData = (
  prePopulatedRows: RowData[],
  existingData: RowData[]
): RowData[] => {
  // Create a Set of existing combinations for fast lookup (normalized for case-insensitive comparison)
  const existingCombinations = new Set<string>();

  existingData.forEach((row) => {
    const key = `${normalizeForComparison(row.location)}|${normalizeForComparison(row.year)}|${normalizeForComparison(row.month)}`;
    existingCombinations.add(key);
  });

  // Filter out pre-populated rows that have existing data
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
};

/**
 * Hook to generate pre-populated rows and merge with existing data
 */
interface UsePrePopulatedDataProps {
  locationOptions: Array<{ value: string; label: string }>;
  baselineYear?: number;
  financialYearMonth?: string;
  existingData: RowData[];
  enabled?: boolean;
}

interface UsePrePopulatedDataReturn {
  mergedData: RowData[];
  totalCount: number;
}

export const usePrePopulatedData = ({
  locationOptions,
  baselineYear,
  financialYearMonth,
  existingData,
  enabled = false,
}: UsePrePopulatedDataProps): UsePrePopulatedDataReturn => {
  const mergedData = useMemo(() => {
    if (!enabled) {
      return existingData;
    }

    const prePopulated = generatePrePopulatedRows(
      locationOptions,
      baselineYear,
      financialYearMonth
    );

    const merged = mergeWithExistingData(prePopulated, existingData);

    // Sort by Year (Desc), Month (Desc), Location (Asc)
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

    return merged.sort((a, b) => {
      // Sort by Year (Descending)
      const yearA = Number(a.year) || 0;
      const yearB = Number(b.year) || 0;
      if (yearA !== yearB) {
        return yearB - yearA; // Descending (newer first)
      }

      // Sort by Month (Descending)
      const monthA = monthOrder[a.month as string] || 0;
      const monthB = monthOrder[b.month as string] || 0;
      if (monthA !== monthB) {
        return monthB - monthA; // Descending (most recent first)
      }

      // Sort by Location (Ascending)
      const locationA = String(a.location || "").toLowerCase();
      const locationB = String(b.location || "").toLowerCase();
      return locationA.localeCompare(locationB); // Ascending (alphabetical)
    });
  }, [
    enabled,
    locationOptions,
    baselineYear,
    financialYearMonth,
    existingData,
  ]);

  return {
    mergedData,
    totalCount: mergedData.length,
  };
};
