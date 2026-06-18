import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useGetActivityMasterDataByKeyQuery } from "@/modules/ghg/graphql/queries/get-activity-master-data-by-key.generated";
import { useGetLocationsAndAddressesQuery } from "@/modules/ghg/graphql/queries/get-addresses-by-userid-and-orgid.generated";
import { useGetOrgDataQuery } from "@/modules/ghg/graphql/queries/get-organization-data.generated";
import { useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery } from "@/modules/ghg/graphql/queries/internal/get-activity-data-energy-captive-power-renewable-fuel-paginated.generated";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";

type RowData = Record<string, string | number | null | undefined>;

interface UseEnergyCaptivePowerRenewableFuelDataProps {
  organizationId: string;
  userId: string;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  globalFilter: string;
}

interface UseEnergyCaptivePowerRenewableFuelDataReturn {
  data: RowData[];
  loading: boolean;
  rowCount: number;
  locationOptions: Array<{ value: string; label: string }>;
  fuelTypeOptions: Array<{ value: string; label: string }>;
  fuelUnitOptions: Array<{ value: string; label: string }>;
  refetch: () => void;
}

interface UseEnergyCaptivePowerRenewableFuelOrgDataReturn {
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
      return monthNames.slice(financialMonthIndex); // From financial month to December
    }
  }

  // If selected year is the current year, show from January to previous month (exclude current month)
  if (selectedYearNum === currentYear) {
    return monthNames.slice(0, currentMonth);
  }

  // For other years, show all months
  return monthNames;
};

export const useEnergyCaptivePowerRenewableFuelData = ({
  organizationId,
  userId,
  pagination,
  sorting,
  globalFilter,
}: UseEnergyCaptivePowerRenewableFuelDataProps): UseEnergyCaptivePowerRenewableFuelDataReturn => {
  // Fetch activity master data for dropdown options
  const { data: activityMasterData } = useGetActivityMasterDataByKeyQuery({
    variables: {
      master_key: ActivityMasterKey.energy_captive_power,
    },
  });

  // Fetch user's organization locations
  const { data: locationsData } = useGetLocationsAndAddressesQuery({
    variables: {
      organizationId,
      userId,
    },
    skip: !organizationId || !userId,
  });

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
          }))
        : [];
    },
    [activityMasterData]
  );

  // Build location options and extract IDs
  const { locationOptions, organizationAddressIds } = useMemo(() => {
    if (!locationsData?.UserOrganizationAddressMapping)
      return { locationOptions: [], organizationAddressIds: [] };

    const options: Array<{ value: string; label: string }> = [];
    const ids: string[] = [];

    locationsData.UserOrganizationAddressMapping.forEach((mapping) => {
      const id = mapping.organization_address_id || "";
      const name = mapping.OrganizationAddress?.Address?.name || "";
      if (id && name) {
        options.push({ value: id, label: name });
        ids.push(id);
      }
    });

    return { locationOptions: options, organizationAddressIds: ids };
  }, [locationsData]);

  // Extract dropdown options from activity master data
  const fuelTypeOptions = useMemo(
    () => extractMasterDataOptions("Energy_CaptivePower_Renewable_FuelType"),
    [extractMasterDataOptions]
  );

  const fuelUnitOptions = useMemo(
    () =>
      extractMasterDataOptions("Energy_CaptivePower_Renewable_FuelType_UOM"),
    [extractMasterDataOptions]
  );

  // Build order_by for GraphQL based on sorting state
  const orderBy = useMemo(() => {
    if (!sorting || sorting.length === 0) {
      return [{ year: "desc" as const, month: "desc" as const }];
    }

    return sorting.map((sort) => {
      const direction = sort.desc ? ("desc" as const) : ("asc" as const);

      // Map frontend column keys to GraphQL field names
      const fieldMap: Record<string, string> = {
        year: "year",
        month: "month",
        location: "organization_address_id",
      };

      const field = fieldMap[sort.id] || sort.id;
      return { [field]: direction };
    });
  }, [sorting]);

  // Build search pattern for GraphQL
  const searchPattern = useMemo(() => {
    return globalFilter ? `%${globalFilter}%` : "%%";
  }, [globalFilter]);

  // Fetch paginated data
  const { data, loading, refetch } =
    useGetActivityDataEnergyCaptivePowerRenewableFuelPaginatedQuery({
      variables: {
        organization_address_ids: organizationAddressIds,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        order_by: orderBy,
        search: searchPattern,
      },
      skip: organizationAddressIds.length === 0,
      fetchPolicy: "network-only", // Force fresh data from server
    });

  // Transform fetched data to table format
  const tableData = useMemo<RowData[]>(() => {
    if (!data?.TaskRequest) {
      return [];
    }

    // Return all TaskRequest records, even if they don't have energy_captive_power
    const transformed = data.TaskRequest.map((taskRequest: any) => {
      const locationName = taskRequest.OrganizationAddress?.Address?.name || "";

      // Get first energy_captive_power record or use empty values
      const captivePower = taskRequest.GHGEnergy_CaptivePowers?.[0] || {};
      const renewableDetails =
        captivePower.GHGEnergy_CaptivePower_Renewable_Fuels?.[0] || {};

      return {
        // Keys must match the camelCase conversion from column codes
        location: locationName,
        year: taskRequest.year?.toString() || "",
        month: taskRequest.month,
        typeOfFuelUsed: renewableDetails.Type_of_Fuel_Used || "",
        quantityOfFuelConsumed:
          renewableDetails.Quantity_of_fuel_consumed || "",
        UoM_for_the_quantity_of_fuel_consumed:
          renewableDetails.Quantity_of_fuel_consumed_uom || "",
        qualityOfFuel: renewableDetails.Quality_of_fuel || "",
        unitOfEnergyGeneratedInKwh:
          renewableDetails.Unit_of_Energy_Generated_in_Kwh || "",
      };
    });
    return transformed;
  }, [data]);

  // Get total count from totalCount query (fetches all IDs without limit/offset)
  const rowCount = data?.totalCount?.length || 0;

  return {
    data: tableData,
    loading,
    rowCount,
    locationOptions,
    fuelTypeOptions,
    fuelUnitOptions,
    refetch: refetch || (() => {}),
  };
};

/**
 * Hook to fetch organization data for Energy Captive Power Renewable Fuel manual entry
 * Returns baseline year and financial year month for dynamic filtering
 */
export const useEnergyCaptivePowerRenewableFuelOrgData =
  (): UseEnergyCaptivePowerRenewableFuelOrgDataReturn => {
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
