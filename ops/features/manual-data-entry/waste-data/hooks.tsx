import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetActivityDataWastePaginatedQuery } from "~/graphql/queries/get-activity-data-waste-paginated.generated";
import { useGetActivityMasterDataByKeyQuery } from "~/graphql/queries/get-activity-master-data-by-key.generated";
import { useGetLocationsAndAddressesQuery } from "~/graphql/queries/get-addresses-by-userid-and-orgid.generated";
import { useGetAddressesQuery } from "~/graphql/queries/get-addresses.generated";
import { useGetOrgDataQuery } from "~/graphql/queries/get-organization-data.generated";
import { useGetPlatformFeatureFlagsQuery } from "~/graphql/queries/get-platform-feature-flags.generated";
import { useGetWasteMasterQuery } from "~/graphql/queries/get-waste-master-details.generated";
import { apiClientWithAuth } from "~/lib/fetcher";
import { Month } from "~/lib/shared/constants/input.constant";
import { UploadType } from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import {
  postParentMessage,
  wasteDataFormUpdated,
} from "~/shared/services/platform-window-message-service";
import {
  FORM_MODE_PREPOPULATE,
  FORM_MODE_STANDARD,
  PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
} from "~/utils/const";
import type { FormMode } from "./listing";

// reuse the same RowData alias from other hooks
type RowData = Record<string, string | number | null | undefined>;

interface UseWasteDataProps {
  organizationId: string;
  userId: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
  activity?: string;
  uploadType?: UploadType;
  isOrganizationAdmin?: boolean;
}

interface UseWasteDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  refetch: () => void;
  allCount: number;
  aiUploadedCount: number;
  manualEntryCount: number;
  // Master data options
  wasteDisposalManagedByOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteQuantityUomOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalLocationDistanceUomOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalTransportFuelUsedOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalTransportRoadVehicleTypeOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteTransportationManagedByOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalTransportModeOfTransportOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalMechanismOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteTypeOptions: Array<{ value: string; label: string; group?: string[] }>;
}

// helper is identical to energy hook, kept for listing component
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

export const useWasteData = ({
  organizationId,
  userId,
  pagination,
  sorting,
  globalFilter,
  activity = "waste",
  isOrganizationAdmin = false,
}: UseWasteDataProps): UseWasteDataReturn => {
  // 0️ Fetch activity master data for dropdown options
  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.waste,
    },
  });

  // 0.1 Fetch waste master data for Types of Waste Generated dropdown
  const { data: wasteMasterData } = useGetWasteMasterQuery();

  // Helper function to extract options from activity master data
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
            group: item.group || [],
          }))
        : [];
    },
    [activityMasterData]
  );

  // Extract dropdown options for each waste field
  const wasteDisposalManagedByOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_managed_by"),
    [extractMasterDataOptions]
  );
  const wasteQuantityUomOptions = useMemo(
    () => extractMasterDataOptions("waste_quantity_UOM"),
    [extractMasterDataOptions]
  );
  const wasteDisposalLocationDistanceUomOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_location_distance_uom"),
    [extractMasterDataOptions]
  );
  const wasteDisposalTransportFuelUsedOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_tansport_fuel_used"),
    [extractMasterDataOptions]
  );
  const wasteDisposalTransportRoadVehicleTypeOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_tansport_road_vehicle_type"),
    [extractMasterDataOptions]
  );
  const wasteTransportationManagedByOptions = useMemo(
    () => extractMasterDataOptions("waste_transportation_managed_by"),
    [extractMasterDataOptions]
  );
  const wasteDisposalTransportModeOfTransportOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_tansport_mode_of_transport"),
    [extractMasterDataOptions]
  );
  const wasteDisposalMechanismOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_mechanism"),
    [extractMasterDataOptions]
  );

  const wasteTypeOptions = useMemo(() => {
    if (!wasteMasterData?.WasteMaster) return [];
    return wasteMasterData.WasteMaster.map((item) => ({
      value: item.name,
      label: item.name,
    }));
  }, [wasteMasterData]);

  // 1️ locations/address queries
  const { data: locationsData } = useGetLocationsAndAddressesQuery({
    variables: { organizationId, userId },
    skip: !organizationId || !userId || isOrganizationAdmin,
  });

  // console.log("locationsData from GraphQL:", locationsData);

  const { data: adminAddressesData } = useGetAddressesQuery({
    variables: { organisationAddressId: organizationId },
    skip: !organizationId || !isOrganizationAdmin,
  });

  const { locationOptions, organizationAddressIds } = useMemo(() => {
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
    } else {
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

  const orderBy = useMemo(() => {
    if (!sorting || sorting.length === 0) {
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
      const fieldMap: Record<string, any> = {
        year: { TaskRequest: { year: direction } },
        month: { TaskRequest: { month: direction } },
        location: { TaskRequest: { organization_address_id: direction } },
      };
      const mappedField = fieldMap[sort.id];
      return mappedField || { [sort.id]: direction };
    });
  }, [sorting]);

  const activityFilter = useMemo(() => {
    if (!globalFilter || globalFilter.trim() === "") return {};

    const searchValue = globalFilter.trim();
    const numericValue = Number(searchValue);
    const isNumeric = !isNaN(numericValue) && searchValue !== "";
    const isInteger = isNumeric && Number.isInteger(numericValue);
    const hasDecimalPoint = searchValue.includes(".");

    const getFloatRangeFilter = (val: number, str: string) => {
      const dotIndex = str.indexOf(".");
      const decimalPlaces = str.endsWith(".") ? 0 : str.length - dotIndex - 1;
      const step = Math.pow(10, -decimalPlaces);
      const upper = parseFloat((val + step).toFixed(decimalPlaces));
      return { _gte: val, _lt: upper };
    };

    return {
      _or: [
        // Search month/year/location via TaskRequest relationship
        { TaskRequest: { month: { _ilike: `%${searchValue}%` } } },
        ...(isInteger
          ? [{ TaskRequest: { year: { _eq: numericValue } } }]
          : []),
        {
          TaskRequest: {
            OrganizationAddress: {
              Address: { name: { _ilike: `%${searchValue}%` } },
            },
          },
        },

        // regular text fields on GHGWaste
        { Types_of_Waste_Generated: { _ilike: `%${searchValue}%` } },
        { Waste_Disposal_Managed_by: { _ilike: `%${searchValue}%` } },
        { Name_of_Third_Party: { _ilike: `%${searchValue}%` } },
        { Disposal_Mechanism: { _ilike: `%${searchValue}%` } },
        { Quantity_of_Waste_UoM: { _ilike: `%${searchValue}%` } },
        { Location_of_Waste_Disposal: { _ilike: `%${searchValue}%` } },
        { Who_Managed_Transportation_of_Waste: { _ilike: `%${searchValue}%` } },
        { Mode_of_Transport: { _ilike: `%${searchValue}%` } },
        {
          Vehicle_Type_Used_for_Road_Transport: { _ilike: `%${searchValue}%` },
        },
        { Fuel_Used: { _ilike: `%${searchValue}%` } },
        {
          DistOf_WasteDisposalLoction_from_FacilityLocation: {
            _ilike: `%${searchValue}%`,
          },
        },
        {
          DistOf_WasteDisposalLoction_from_FacilityLocation_UoM: {
            _ilike: `%${searchValue}%`,
          },
        },

        // numeric searches
        ...(isNumeric
          ? [
              hasDecimalPoint
                ? {
                    Quantity_of_Waste: getFloatRangeFilter(
                      numericValue,
                      searchValue
                    ),
                  }
                : { Quantity_of_Waste: { _eq: numericValue } },
            ]
          : []),
      ],
    };
  }, [globalFilter]);

  const { data, loading, error, refetch } =
    useGetActivityDataWastePaginatedQuery({
      variables: {
        organization_address_ids: organizationAddressIds,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        order_by: orderBy,
        activityFilter,
      },
      skip: organizationAddressIds.length === 0,
      fetchPolicy: "network-only",
    });

  // console.log("Total rows count:", data?.totalCount?.length);

  if (error) console.error("GraphQL Error (waste)", error);

  const tableData = useMemo<RowData[]>(() => {
    // console.log("raw waste response", data);
    return (
      data?.GHGWaste?.map((w: any) => ({
        id: w.id || "",
        Types_of_Waste_Generated: w.Types_of_Waste_Generated,
        Waste_Disposal_Managed_by: w.Waste_Disposal_Managed_by,
        Name_of_Third_Party: w.Name_of_Third_Party,
        Quantity_of_Waste: w.Quantity_of_Waste,
        Quantity_of_Waste_UoM: w.Quantity_of_Waste_UoM,
        Disposal_Mechanism: w.Disposal_Mechanism,
        Location_of_Waste_Disposal: w.Location_of_Waste_Disposal,
        Who_Managed_Transportation_of_Waste:
          w.Who_Managed_Transportation_of_Waste,
        Mode_of_Transport: w.Mode_of_Transport,
        Vehicle_Type_Used_for_Road_Transport:
          w.Vehicle_Type_Used_for_Road_Transport,
        Fuel_Used: w.Fuel_Used,
        DistOf_WasteDisposalLoction_from_FacilityLocation:
          w.DistOf_WasteDisposalLoction_from_FacilityLocation,
        DistOf_WasteDisposalLoction_from_FacilityLocation_UoM:
          w.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM,
        task_request_id: w.task_request_id || "",
        createdByUserName: w.CreatedByUser?.name || w.created_by || "",
        updatedByUserName: w.UpdatedByUser?.name || w.updated_by || "",
        year: w.TaskRequest?.year?.toString() || "",
        month: w.TaskRequest?.month,
        location: w.TaskRequest?.OrganizationAddress?.Address?.name || "",
        updatedAt: w.updated_at || "",
      })) ?? []
    );
  }, [data]);

  const rowCount = data?.totalCount?.length || 0;
  const allCount = rowCount;
  const aiUploadedCount = 0;
  const manualEntryCount = rowCount;

  return {
    data: tableData,
    loading,
    rowCount,
    locationOptions,
    refetch,
    allCount,
    aiUploadedCount,
    manualEntryCount,
    wasteDisposalManagedByOptions,
    wasteQuantityUomOptions,
    wasteDisposalLocationDistanceUomOptions,
    wasteDisposalTransportFuelUsedOptions,
    wasteDisposalTransportRoadVehicleTypeOptions,
    wasteTransportationManagedByOptions,
    wasteDisposalTransportModeOfTransportOptions,
    wasteDisposalMechanismOptions,
    wasteTypeOptions,
  };
};

// organization baseline & financial year hook (copied from energy-grid version)
interface UseWasteOrgDataReturn {
  baselineYear?: number;
  financialYearMonth?: string;
  loading: boolean;
  error?: any;
}

export const useWasteOrgData = (): UseWasteOrgDataReturn => {
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

// ============================================================================
// Master Data Options Hook (extracted for use with server-side data fetching)
// ============================================================================

interface UseWasteMasterOptionsReturn {
  wasteDisposalManagedByOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteQuantityUomOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalLocationDistanceUomOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalTransportFuelUsedOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalTransportRoadVehicleTypeOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteTransportationManagedByOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalTransportModeOfTransportOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteDisposalMechanismOptions: Array<{
    value: string;
    label: string;
    group?: string[];
  }>;
  wasteTypeOptions: Array<{ value: string; label: string; group?: string[] }>;
  refetchWasteTypes: () => void;
}

export const useWasteMasterOptions = (): UseWasteMasterOptionsReturn => {
  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.waste,
    },
  });

  const { data: wasteMasterData, refetch: refetchWasteTypes } =
    useGetWasteMasterQuery({
      fetchPolicy: "cache-and-network",
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
            group: item.group || [],
          }))
        : [];
    },
    [activityMasterData]
  );

  const wasteDisposalManagedByOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_managed_by"),
    [extractMasterDataOptions]
  );
  const wasteQuantityUomOptions = useMemo(
    () => extractMasterDataOptions("waste_quantity_UOM"),
    [extractMasterDataOptions]
  );
  const wasteDisposalLocationDistanceUomOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_location_distance_uom"),
    [extractMasterDataOptions]
  );
  const wasteDisposalTransportFuelUsedOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_tansport_fuel_used"),
    [extractMasterDataOptions]
  );
  const wasteDisposalTransportRoadVehicleTypeOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_tansport_road_vehicle_type"),
    [extractMasterDataOptions]
  );
  const wasteTransportationManagedByOptions = useMemo(
    () => extractMasterDataOptions("waste_transportation_managed_by"),
    [extractMasterDataOptions]
  );
  const wasteDisposalTransportModeOfTransportOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_tansport_mode_of_transport"),
    [extractMasterDataOptions]
  );
  const wasteDisposalMechanismOptions = useMemo(
    () => extractMasterDataOptions("waste_disposal_mechanism"),
    [extractMasterDataOptions]
  );

  const wasteTypeOptions = useMemo(() => {
    if (!wasteMasterData?.WasteMaster) return [];
    return wasteMasterData.WasteMaster.map((item) => ({
      value: item.name,
      label: item.name,
    }));
  }, [wasteMasterData]);

  return {
    wasteDisposalManagedByOptions,
    wasteQuantityUomOptions,
    wasteDisposalLocationDistanceUomOptions,
    wasteDisposalTransportFuelUsedOptions,
    wasteDisposalTransportRoadVehicleTypeOptions,
    wasteTransportationManagedByOptions,
    wasteDisposalTransportModeOfTransportOptions,
    wasteDisposalMechanismOptions,
    wasteTypeOptions,
    refetchWasteTypes,
  };
};

// ============================================================================
// Form Mode Detection Hook
// ============================================================================

interface UseFormModeReturn {
  formMode: FormMode;
  loading: boolean;
  error?: any;
}

export const useWasteFormMode = (): UseFormModeReturn => {
  const params = useParams();
  const organizationId = params?.organizationId as string;

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
    fetchPolicy: "cache-and-network",
  });

  const formMode = useMemo<FormMode>(() => {
    if (
      !featureFlagsData?.PlatformFeatureFlags ||
      featureFlagsData.PlatformFeatureFlags.length === 0
    ) {
      return FORM_MODE_STANDARD;
    }

    const featureFlag = featureFlagsData.PlatformFeatureFlags[0];

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

interface UseWasteServerDataProps {
  organizationId: string;
  accessToken: string;
  pagination: MRT_PaginationState;
  sorting?: MRT_SortingState;
  globalFilter: string;
  uploadType?: string;
  activity?: string;
  formMode?: "standard" | "prepopulate";
  skip?: boolean;
}

interface UseWasteServerDataReturn {
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

export const useWasteServerData = ({
  organizationId,
  accessToken,
  pagination,
  sorting = [],
  globalFilter,
  uploadType = "all",
  activity = "waste",
  formMode = FORM_MODE_STANDARD,
  skip = false,
}: UseWasteServerDataProps): UseWasteServerDataReturn => {
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
        `/${organizationId}/embed/v1/${accessToken}/data-import/forms/waste/list`,
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
      console.error("Error fetching waste data:", error);
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
  const currentFormModeRef = useRef(FORM_MODE);
  useEffect(() => {
    currentFormModeRef.current = FORM_MODE;
  }, [FORM_MODE]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let messageData: { type: string; data: any } = {
        type: "",
        data: "",
      };
      if (event.data && currentFormModeRef.current === FORM_MODE_STANDARD) {
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
                    `/${organizationId}/embed/v1/${accessToken}/data-import/forms/waste`,
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
                  // postParentMessage(energyGridPowerFormUpdated(true));
                  postParentMessage(wasteDataFormUpdated(true));
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
