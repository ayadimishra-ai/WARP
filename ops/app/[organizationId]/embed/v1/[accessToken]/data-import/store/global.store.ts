import { useEffect, useState } from "react";
import {
  ghgProductionDetailsType,
  KPIData,
  KPIDataType,
  KpiEmissionByFuelConsumptionType,
  KpiEmissionByMaterialConsumptionSupplierType,
  KpiEmissionByMaterialConsumptionType,
  KpiEmissionByPowerConsumptionType,
  KpiEmissionByPowerConsumptionVendorType,
  KpiEmissionByProductType,
  KpiEmissionByTransportationType,
  KpiEmissionByWasteGenerationType,
  KpiMainType,
} from "~/components/ghg-dashboard/common/types";
import {
  getQuarterDateVariables,
  getSixMonthsDateVariables,
  getThreeMonthsDateVariables,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { sanitize_compare_str_v3 } from "~/utils/comapre.util";
import { months } from "~/utils/date.util";
import { useDashboardStore } from "./dashboard.store";
import { CurrentPreviousYearMonthVariablesType } from "./types";

export const useGlobalFilters = () => {
  const { globalFilters, dbData, changeDashboardHandler } = useDashboardStore(
    (state) => ({
      globalFilters: state.globalFilters,
      dbData: state.dbData,
      changeDashboardHandler: state.changeDashboardHandler,
    })
  );

  useEffect(() => {
    const {
      selectedDuration,
      selectedLocations,
      selectedRegions,
      baseLineYear,
      baseLineMonth,
    } = globalFilters || {};

    let prevYear: KPIData = {
      emissionByFuelConsumption: [],
      emissionByMaterialConsumption: [],
      emissionByPowerConsumption: [],
      emissionByTransportation: [],
      emissionByWasteGeneration: [],
      main: [],
      emissionByMaterialConsumptionSuppliers: [],
      emissionByPowerConsumption_Vendors: [],
      emissionByProducts: [],
      productionDetail: [],
    };

    let currentYear: KPIData = {
      emissionByFuelConsumption: [],
      emissionByMaterialConsumption: [],
      emissionByPowerConsumption: [],
      emissionByTransportation: [],
      emissionByWasteGeneration: [],
      main: [],
      emissionByMaterialConsumptionSuppliers: [],
      emissionByPowerConsumption_Vendors: [],
      emissionByProducts: [],
      productionDetail: [],
    };

    let baselineKPIMainData: KpiMainType[] = [];
    let baseLineCurrentYearKPIMainData: KpiMainType[] = [];
    let baselineLocationKPIMainData: KpiMainType[] = [];
    let organizationLevelKPIMain: KpiMainType[] = []; // Organization Level Data from kpi main table NO Region and NO Location filter applied
    let previousYearOrganizationLevelKPIMain: KpiMainType[] = [];

    let organisationLevelKPIEmissionByProducts: KpiEmissionByProductType[] = [];
    let previousYearorganisationLevelKPIEmissionByProducts: KpiEmissionByProductType[] =
      [];

    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    const {
      kpiMain = [],
      kpiEmissionByFuelConsumption = [],
      kpiEmissionByMaterialConsumption = [],
      kpiEmissionByPowerConsumption = [],
      kpiEmissionByTransportation = [],
      kpiEmissionByWasteGeneration = [],
      kpiEmissionByMaterialConsumptionSuppliers = [],
      kpiEmissionByPowerConsumptionVendors = [],
      kpiEmissionByProducts = [],
      productionDetail = [],
    } = dbData || {};
    if (kpiMain && kpiMain.length > 0) {
      kpiMain?.forEach((kpiData: KpiMainType) => {
        const { year, month, address_id, region_id } = kpiData || {};

        // Base Line Current Year Data
        const baseLineCurrentYearFrom = baseLineYear; // i.e 2021
        const baseLineCurrentMonthFrom = baseLineMonth; // i.e 4 [April]
        const baseLineCurrentYearTo = baseLineYear + 1; // i.e 2022
        const baseLineCurrentMonthTo = baseLineMonth - 1; // 3 [March]
        if (
          (month >= baseLineCurrentMonthFrom &&
            year === baseLineCurrentYearFrom) ||
          (month <= baseLineCurrentMonthTo && year === baseLineCurrentYearTo)
        ) {
          baseLineCurrentYearKPIMainData.push(kpiData);
        }

        // Location Filter = Applied
        // Duration = Not Applied
        // Region = Applied
        // Base Line Current Year = 4 2021 3 2022
        if (
          (month >= baseLineCurrentMonthFrom &&
            year === baseLineCurrentYearFrom) ||
          (month <= baseLineCurrentMonthTo && year === baseLineCurrentYearTo)
        ) {
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            baselineLocationKPIMainData.push(kpiData);
          }
        }

        // Base Line Year to Current Year Data
        if (
          (year > baseLineCurrentYearFrom ||
            (year === baseLineCurrentYearFrom &&
              month >= baseLineCurrentMonthFrom)) &&
          (year < currentYearTo ||
            (year === currentYearTo && month <= currentMonthTo))
        ) {
          baselineKPIMainData.push(kpiData); // Base Line Year To Current Year
        }

        // Duration Filter
        // Current Year Data
        if (
          (year > currentYearFrom ||
            (year === currentYearFrom && month >= currentMonthFrom)) &&
          (year < currentYearTo ||
            (year === currentYearTo && month <= currentMonthTo))
        ) {
          organizationLevelKPIMain.push(kpiData); // For Organization Level

          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            currentYear.main.push(kpiData);
          }
        }

        // Previous Year Data
        if (
          (year > previousYearFrom ||
            (year === previousYearFrom && month >= previousMonthFrom)) &&
          (year < previousYearTo ||
            (year === previousYearTo && month <= previousMonthTo))
        ) {
          previousYearOrganizationLevelKPIMain.push(kpiData); // For Organization Level

          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            prevYear.main.push(kpiData);
          }
        }
      });
    }

    if (
      kpiEmissionByFuelConsumption &&
      kpiEmissionByFuelConsumption.length > 0
    ) {
      kpiEmissionByFuelConsumption?.forEach(
        (kpiData: KpiEmissionByFuelConsumptionType) => {
          const { year, month, address_id, region_id } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByFuelConsumption.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByFuelConsumption.push(kpiData);
            }
          }
        }
      );
    }
    if (productionDetail && productionDetail.length > 0) {
      productionDetail.forEach((productionItem: ghgProductionDetailsType) => {
        // Current Year Data
        const month =
          Number(
            months.findIndex((item) =>
              sanitize_compare_str_v3(item, productionItem?.TaskRequest?.month)
            )
          ) + 1;
        if (
          (productionItem.TaskRequest?.year > currentYearFrom ||
            (productionItem.TaskRequest?.year === currentYearFrom &&
              month >= currentMonthFrom)) &&
          (productionItem.TaskRequest?.year < currentYearTo ||
            (productionItem.TaskRequest?.year === currentYearTo &&
              month <= currentMonthTo))
        ) {
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === productionItem?.OrganizationAddress?.id
          );
          if (isAddressExist) {
            currentYear.productionDetail.push(productionItem);
          }
        }
        // Previous Year Data
        if (
          (productionItem.TaskRequest?.year > previousYearFrom ||
            (productionItem.TaskRequest?.year === previousYearFrom &&
              month >= previousMonthFrom)) &&
          (productionItem.TaskRequest?.year < previousYearTo ||
            (productionItem.TaskRequest?.year === previousYearTo &&
              month <= previousMonthTo))
        ) {
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === productionItem?.OrganizationAddress?.id
          );
          if (isAddressExist) {
            prevYear.productionDetail.push(productionItem);
          }
        }
      });
    }
    if (
      kpiEmissionByMaterialConsumption &&
      kpiEmissionByMaterialConsumption.length > 0
    ) {
      kpiEmissionByMaterialConsumption?.forEach(
        (kpiData: KpiEmissionByMaterialConsumptionType) => {
          const { year, month, address_id, region_id } = kpiData || {};
          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByMaterialConsumption.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByMaterialConsumption.push(kpiData);
            }
          }
        }
      );
    }

    if (
      kpiEmissionByPowerConsumption &&
      kpiEmissionByPowerConsumption.length > 0
    ) {
      kpiEmissionByPowerConsumption?.forEach(
        (kpiData: KpiEmissionByPowerConsumptionType) => {
          const { year, month, address_id, region_id } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByPowerConsumption.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByPowerConsumption.push(kpiData);
            }
          }
        }
      );
    }

    if (kpiEmissionByTransportation && kpiEmissionByTransportation.length > 0) {
      kpiEmissionByTransportation?.forEach(
        (kpiData: KpiEmissionByTransportationType) => {
          const { year, month, address_id, region_id } = kpiData || {};
          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByTransportation.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByTransportation.push(kpiData);
            }
          }
        }
      );
    }

    if (
      kpiEmissionByWasteGeneration &&
      kpiEmissionByWasteGeneration.length > 0
    ) {
      kpiEmissionByWasteGeneration?.forEach(
        (kpiData: KpiEmissionByWasteGenerationType) => {
          const { year, month, address_id, region_id } = kpiData || {};
          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByWasteGeneration.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByWasteGeneration.push(kpiData);
            }
          }
        }
      );
    }

    if (
      kpiEmissionByMaterialConsumptionSuppliers &&
      kpiEmissionByMaterialConsumptionSuppliers.length > 0
    ) {
      kpiEmissionByMaterialConsumptionSuppliers?.forEach(
        (kpiData: KpiEmissionByMaterialConsumptionSupplierType) => {
          const { year, month, address_id, region_id } = kpiData || {};
          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByMaterialConsumptionSuppliers.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByMaterialConsumptionSuppliers.push(kpiData);
            }
          }
        }
      );
    }

    if (
      kpiEmissionByPowerConsumptionVendors &&
      kpiEmissionByPowerConsumptionVendors.length > 0
    ) {
      kpiEmissionByPowerConsumptionVendors?.forEach(
        (kpiData: KpiEmissionByPowerConsumptionVendorType) => {
          const { year, month, address_id, region_id } = kpiData || {};
          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYear.emissionByPowerConsumption_Vendors.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              prevYear.emissionByPowerConsumption_Vendors.push(kpiData);
            }
          }
        }
      );
    }

    if (kpiEmissionByProducts && kpiEmissionByProducts.length > 0) {
      kpiEmissionByProducts?.forEach((kpiData: KpiEmissionByProductType) => {
        const { year, month, address_id, region_id } = kpiData || {};
        // Current Year Data
        if (
          (year > currentYearFrom ||
            (year === currentYearFrom && month >= currentMonthFrom)) &&
          (year < currentYearTo ||
            (year === currentYearTo && month <= currentMonthTo))
        ) {
          organisationLevelKPIEmissionByProducts.push(kpiData); // Org Level Data
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            currentYear.emissionByProducts.push(kpiData);
          }
        }

        // Previous Year Data
        if (
          (year > previousYearFrom ||
            (year === previousYearFrom && month >= previousMonthFrom)) &&
          (year < previousYearTo ||
            (year === previousYearTo && month <= previousMonthTo))
        ) {
          previousYearorganisationLevelKPIEmissionByProducts.push(kpiData); // Org Level Data
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            prevYear.emissionByProducts.push(kpiData);
          }
        }
      });
    }

    // TODO Last array
    changeDashboardHandler(
      currentYear,
      prevYear,
      baseLineYear,
      baseLineMonth,
      baselineKPIMainData,
      baseLineCurrentYearKPIMainData,
      organizationLevelKPIMain,
      previousYearOrganizationLevelKPIMain,
      organisationLevelKPIEmissionByProducts,
      previousYearorganisationLevelKPIEmissionByProducts,
      baselineLocationKPIMainData
    );
  }, [globalFilters, dbData]);

  return globalFilters;
};

export const useEmissionMainOrgLevel = (): {
  currentYearData: KpiMainType[];
  previousYearData: KpiMainType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<KpiMainType[]>([]);
  const [previousYearData, setPreviousYearData] = useState<KpiMainType[]>([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const { selectedDuration, baseLineYear, baseLineMonth } = globalFilters || {};
  const { kpiMain } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (kpiMain && kpiMain.length > 0) {
      let currentYearData: KpiMainType[] = [],
        previousYearData: KpiMainType[] = [];

      kpiMain?.forEach((kpiData: KpiMainType) => {
        const { year, month } = kpiData || {};

        // Current Year Data
        if (
          (year > currentYearFrom ||
            (year === currentYearFrom && month >= currentMonthFrom)) &&
          (year < currentYearTo ||
            (year === currentYearTo && month <= currentMonthTo))
        ) {
          currentYearData.push(kpiData);
        }

        // Previous Year Data
        if (
          (year > previousYearFrom ||
            (year === previousYearFrom && month >= previousMonthFrom)) &&
          (year < previousYearTo ||
            (year === previousYearTo && month <= previousMonthTo))
        ) {
          previousYearData.push(kpiData);
        }
      });

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [selectedDuration, kpiMain, baseLineYear, baseLineMonth]);

  return { currentYearData, previousYearData };
};

export const useEmissionByPowerConsumptionOrgLevel = (): {
  currentYearData: KpiEmissionByPowerConsumptionType[];
  previousYearData: KpiEmissionByPowerConsumptionType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByPowerConsumptionType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByPowerConsumptionType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const { selectedDuration, baseLineYear, baseLineMonth } = globalFilters || {};
  const { kpiEmissionByPowerConsumption } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByPowerConsumption &&
      kpiEmissionByPowerConsumption.length > 0
    ) {
      let currentYearData: KpiEmissionByPowerConsumptionType[] = [],
        previousYearData: KpiEmissionByPowerConsumptionType[] = [];

      kpiEmissionByPowerConsumption?.forEach(
        (kpiData: KpiEmissionByPowerConsumptionType) => {
          const { year, month } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            currentYearData.push(kpiData);
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            previousYearData.push(kpiData);
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [selectedDuration, kpiEmissionByPowerConsumption]);

  return { currentYearData, previousYearData };
};

export const useEmissionByTransportationOrgLevel = (): {
  currentYearData: KpiEmissionByTransportationType[];
  previousYearData: KpiEmissionByTransportationType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByTransportationType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByTransportationType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const { selectedDuration, baseLineYear, baseLineMonth } = globalFilters || {};
  const { kpiEmissionByTransportation } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (kpiEmissionByTransportation && kpiEmissionByTransportation.length > 0) {
      let currentYearData: KpiEmissionByTransportationType[] = [],
        previousYearData: KpiEmissionByTransportationType[] = [];

      kpiEmissionByTransportation?.forEach(
        (kpiData: KpiEmissionByTransportationType) => {
          const { year, month } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            currentYearData.push(kpiData);
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            previousYearData.push(kpiData);
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [selectedDuration, kpiEmissionByTransportation]);

  return { currentYearData, previousYearData };
};

export const useEmissionByWasteGenerationOrgLevel = (): {
  currentYearData: KpiEmissionByWasteGenerationType[];
  previousYearData: KpiEmissionByWasteGenerationType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByWasteGenerationType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByWasteGenerationType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const { selectedDuration, baseLineYear, baseLineMonth } = globalFilters || {};
  const { kpiEmissionByWasteGeneration } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByWasteGeneration &&
      kpiEmissionByWasteGeneration.length > 0
    ) {
      let currentYearData: KpiEmissionByWasteGenerationType[] = [],
        previousYearData: KpiEmissionByWasteGenerationType[] = [];

      kpiEmissionByWasteGeneration?.forEach(
        (kpiData: KpiEmissionByWasteGenerationType) => {
          const { year, month } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            currentYearData.push(kpiData);
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            previousYearData.push(kpiData);
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [
    selectedDuration,
    kpiEmissionByWasteGeneration,
    baseLineYear,
    baseLineMonth,
  ]);

  return { currentYearData, previousYearData };
};

export const useEmissionByFuelConsumptionOrgLevel = (): {
  currentYearData: KpiEmissionByFuelConsumptionType[];
  previousYearData: KpiEmissionByFuelConsumptionType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByFuelConsumptionType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByFuelConsumptionType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const { selectedDuration, baseLineYear, baseLineMonth } = globalFilters || {};
  const { kpiEmissionByFuelConsumption } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByFuelConsumption &&
      kpiEmissionByFuelConsumption.length > 0
    ) {
      let currentYearData: KpiEmissionByFuelConsumptionType[] = [],
        previousYearData: KpiEmissionByFuelConsumptionType[] = [];

      kpiEmissionByFuelConsumption?.forEach(
        (kpiData: KpiEmissionByFuelConsumptionType) => {
          const { year, month } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            currentYearData.push(kpiData);
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            previousYearData.push(kpiData);
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [selectedDuration, kpiEmissionByFuelConsumption]);

  return { currentYearData, previousYearData };
};

export const useEmissionByMaterialConsumptionOrgLevel = (): {
  currentYearData: KpiEmissionByMaterialConsumptionType[];
  previousYearData: KpiEmissionByMaterialConsumptionType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByMaterialConsumptionType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByMaterialConsumptionType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const { selectedDuration, baseLineYear, baseLineMonth } = globalFilters || {};
  const { kpiEmissionByMaterialConsumption } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByMaterialConsumption &&
      kpiEmissionByMaterialConsumption.length > 0
    ) {
      let currentYearData: KpiEmissionByMaterialConsumptionType[] = [],
        previousYearData: KpiEmissionByMaterialConsumptionType[] = [];

      kpiEmissionByMaterialConsumption?.forEach(
        (kpiData: KpiEmissionByMaterialConsumptionType) => {
          const { year, month } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            currentYearData.push(kpiData);
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            previousYearData.push(kpiData);
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [selectedDuration, kpiEmissionByMaterialConsumption]);

  return { currentYearData, previousYearData };
};

export const useEmissionMain = (): {
  currentYearData: KpiMainType[];
  previousYearData: KpiMainType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<KpiMainType[]>([]);
  const [previousYearData, setPreviousYearData] = useState<KpiMainType[]>([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const {
    selectedDuration,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  } = globalFilters || {};
  const { kpiMain } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (kpiMain && kpiMain.length > 0) {
      let currentYearData: KpiMainType[] = [],
        previousYearData: KpiMainType[] = [];

      kpiMain?.forEach((kpiData: KpiMainType) => {
        const { year, month, region_id, address_id } = kpiData || {};

        // Current Year Data
        if (
          (year > currentYearFrom ||
            (year === currentYearFrom && month >= currentMonthFrom)) &&
          (year < currentYearTo ||
            (year === currentYearTo && month <= currentMonthTo))
        ) {
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            currentYearData.push(kpiData);
          }
        }

        // Previous Year Data
        if (
          (year > previousYearFrom ||
            (year === previousYearFrom && month >= previousMonthFrom)) &&
          (year < previousYearTo ||
            (year === previousYearTo && month <= previousMonthTo))
        ) {
          // Location Filter
          const isAddressExist = selectedLocations?.find(
            (address) => address === address_id
          );
          // Region Filter
          const isRegionExist = selectedRegions?.find(
            (region: string) => region === region_id
          );
          if (isAddressExist && isRegionExist) {
            previousYearData.push(kpiData);
          }
        }
      });

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [
    selectedDuration,
    kpiMain,
    baseLineYear,
    baseLineMonth,
    selectedLocations,
    selectedRegions,
  ]);

  return { currentYearData, previousYearData };
};

export const useEmissionByPowerConsumption = (): {
  currentYearData: KpiEmissionByPowerConsumptionType[];
  previousYearData: KpiEmissionByPowerConsumptionType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByPowerConsumptionType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByPowerConsumptionType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const {
    selectedDuration,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  } = globalFilters || {};
  const { kpiEmissionByPowerConsumption } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByPowerConsumption &&
      kpiEmissionByPowerConsumption.length > 0
    ) {
      let currentYearData: KpiEmissionByPowerConsumptionType[] = [],
        previousYearData: KpiEmissionByPowerConsumptionType[] = [];

      kpiEmissionByPowerConsumption?.forEach(
        (kpiData: KpiEmissionByPowerConsumptionType) => {
          const { year, month, address_id, region_id } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYearData.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              previousYearData.push(kpiData);
            }
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [
    selectedDuration,
    kpiEmissionByPowerConsumption,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  ]);

  return { currentYearData, previousYearData };
};

export const useEmissionByTransportation = (): {
  currentYearData: KpiEmissionByTransportationType[];
  previousYearData: KpiEmissionByTransportationType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByTransportationType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByTransportationType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const {
    selectedDuration,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  } = globalFilters || {};
  const { kpiEmissionByTransportation } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (kpiEmissionByTransportation && kpiEmissionByTransportation.length > 0) {
      let currentYearData: KpiEmissionByTransportationType[] = [],
        previousYearData: KpiEmissionByTransportationType[] = [];

      kpiEmissionByTransportation?.forEach(
        (kpiData: KpiEmissionByTransportationType) => {
          const { year, month, region_id, address_id } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYearData.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              previousYearData.push(kpiData);
            }
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [
    selectedDuration,
    kpiEmissionByTransportation,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  ]);

  return { currentYearData, previousYearData };
};

export const useEmissionByWasteGeneration = (): {
  currentYearData: KpiEmissionByWasteGenerationType[];
  previousYearData: KpiEmissionByWasteGenerationType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByWasteGenerationType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByWasteGenerationType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const {
    selectedDuration,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  } = globalFilters || {};
  const { kpiEmissionByWasteGeneration } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByWasteGeneration &&
      kpiEmissionByWasteGeneration.length > 0
    ) {
      let currentYearData: KpiEmissionByWasteGenerationType[] = [],
        previousYearData: KpiEmissionByWasteGenerationType[] = [];

      kpiEmissionByWasteGeneration?.forEach(
        (kpiData: KpiEmissionByWasteGenerationType) => {
          const { year, month, region_id, address_id } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYearData.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              previousYearData.push(kpiData);
            }
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [
    selectedDuration,
    kpiEmissionByWasteGeneration,
    baseLineYear,
    baseLineMonth,
    selectedLocations,
    selectedRegions,
  ]);

  return { currentYearData, previousYearData };
};

export const useEmissionByFuelConsumption = (): {
  currentYearData: KpiEmissionByFuelConsumptionType[];
  previousYearData: KpiEmissionByFuelConsumptionType[];
} => {
  const [currentYearData, setCurrentYearData] = useState<
    KpiEmissionByFuelConsumptionType[]
  >([]);
  const [previousYearData, setPreviousYearData] = useState<
    KpiEmissionByFuelConsumptionType[]
  >([]);

  const { globalFilters, dbData } = useDashboardStore((store) => ({
    globalFilters: store.globalFilters,
    dbData: store.dbData,
  }));

  const {
    selectedDuration,
    selectedRegions,
    selectedLocations,
    baseLineYear,
    baseLineMonth,
  } = globalFilters || {};
  const { kpiEmissionByFuelConsumption } = dbData as KPIDataType;

  useEffect(() => {
    const {
      currentYearFrom,
      currentMonthFrom,
      currentYearTo,
      currentMonthTo,
      previousYearFrom,
      previousMonthFrom,
      previousYearTo,
      previousMonthTo,
    } = getCurrentPreviousYearMonthVariables({
      baseLineYear,
      baseLineMonth,
      selectedDuration,
    });

    if (
      kpiEmissionByFuelConsumption &&
      kpiEmissionByFuelConsumption.length > 0
    ) {
      let currentYearData: KpiEmissionByFuelConsumptionType[] = [],
        previousYearData: KpiEmissionByFuelConsumptionType[] = [];

      kpiEmissionByFuelConsumption?.forEach(
        (kpiData: KpiEmissionByFuelConsumptionType) => {
          const { year, month, region_id, address_id } = kpiData || {};

          // Current Year Data
          if (
            (year > currentYearFrom ||
              (year === currentYearFrom && month >= currentMonthFrom)) &&
            (year < currentYearTo ||
              (year === currentYearTo && month <= currentMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              currentYearData.push(kpiData);
            }
          }

          // Previous Year Data
          if (
            (year > previousYearFrom ||
              (year === previousYearFrom && month >= previousMonthFrom)) &&
            (year < previousYearTo ||
              (year === previousYearTo && month <= previousMonthTo))
          ) {
            // Location Filter
            const isAddressExist = selectedLocations?.find(
              (address) => address === address_id
            );
            // Region Filter
            const isRegionExist = selectedRegions?.find(
              (region: string) => region === region_id
            );
            if (isAddressExist && isRegionExist) {
              previousYearData.push(kpiData);
            }
          }
        }
      );

      setCurrentYearData(currentYearData);
      setPreviousYearData(previousYearData);
    }
  }, [
    selectedDuration,
    kpiEmissionByFuelConsumption,
    baseLineYear,
    baseLineMonth,
    selectedLocations,
    selectedRegions,
  ]);

  return { currentYearData, previousYearData };
};

const getCurrentPreviousYearMonthVariables = ({
  baseLineYear,
  baseLineMonth,
  selectedDuration,
}: {
  baseLineYear: number;
  baseLineMonth: number;
  selectedDuration: string | null;
}): CurrentPreviousYearMonthVariablesType => {
  let currentYearFrom = baseLineYear;
  let currentMonthFrom = 4;
  let currentYearTo = new Date().getFullYear();
  let currentMonthTo = 3;

  let previousYearFrom = baseLineYear;
  let previousMonthFrom = 4;
  let previousYearTo = new Date().getFullYear();
  let previousMonthTo = 3;

  switch (selectedDuration) {
    case "threemonths": {
      const {
        currentYearFromThree,
        currentMonthFromThree,
        currentYearToThree,
        currentMonthToThree,
        previousYearFromThree,
        previousMonthFromThree,
        previousYearToThree,
        previousMonthToThree,
      } = getThreeMonthsDateVariables();
      currentYearFrom = currentYearFromThree;
      currentMonthFrom = currentMonthFromThree;
      currentYearTo = currentYearToThree;
      currentMonthTo = currentMonthToThree;
      previousYearFrom = previousYearFromThree;
      previousMonthFrom = previousMonthFromThree;
      previousYearTo = previousYearToThree;
      previousMonthTo = previousMonthToThree;
      break;
    }
    case "sixmonths": {
      const {
        currentYearFromSix,
        currentMonthFromSix,
        currentYearToSix,
        currentMonthToSix,
        previousYearFromSix,
        previousMonthFromSix,
        previousYearToSix,
        previousMonthToSix,
      } = getSixMonthsDateVariables();

      currentYearFrom = currentYearFromSix;
      currentMonthFrom = currentMonthFromSix;
      currentYearTo = currentYearToSix;
      currentMonthTo = currentMonthToSix;
      previousYearFrom = previousYearFromSix;
      previousMonthFrom = previousMonthFromSix;
      previousYearTo = previousYearToSix;
      previousMonthTo = previousMonthToSix;
      break;
    }
    case "thisquarter": {
      const {
        currentYearFromQuarter,
        currentMonthFromQuarter,
        currentYearToQuarter,
        currentMonthToQuarter,
        previousYearFromQuarter,
        previousMonthFromQuarter,
        previousYearToQuarter,
        previousMonthToQuarter,
      } = getQuarterDateVariables();

      currentYearFrom = currentYearFromQuarter;
      currentMonthFrom = currentMonthFromQuarter;
      currentYearTo = currentYearToQuarter;
      currentMonthTo = currentMonthToQuarter;
      previousYearFrom = previousYearFromQuarter;
      previousMonthFrom = previousMonthFromQuarter;
      previousYearTo = previousYearToQuarter;
      previousMonthTo = previousMonthToQuarter;
      break;
    }
    case "thisyear": {
      // Current Year
      currentYearFrom =
        new Date().getMonth() > 3
          ? new Date().getFullYear()
          : new Date().getFullYear() - 1;
      currentMonthFrom = 4;
      currentYearTo = currentYearFrom + 1;
      currentMonthTo = 3;

      // Previous Year
      previousYearFrom = currentYearFrom - 1;
      previousMonthFrom = 4;
      previousYearTo = currentYearFrom;
      previousMonthTo = 3;

      break;
    }
    case "lastyear": {
      // Current Year [Actual Previous Year]
      currentYearFrom =
        new Date().getMonth() > 3
          ? new Date().getFullYear() - 1
          : new Date().getFullYear() - 2;
      currentMonthFrom = 4;
      currentYearTo = currentYearFrom + 1;
      currentMonthTo = 3;

      // Previous Year [Actual Previous's Previous Year]
      previousYearFrom = currentYearFrom - 1;
      previousMonthFrom = 4;
      previousYearTo = currentYearFrom;
      previousMonthTo = 3;
      break;
    }
    case "baseline": {
      // All Data
      currentYearFrom = baseLineYear;
      currentMonthFrom = baseLineMonth;
      currentYearTo = new Date().getFullYear();
      currentMonthTo = new Date().getMonth() + 1;

      // This is null
      previousYearFrom = new Date().getFullYear();
      previousMonthFrom = new Date().getMonth() + 1;
      previousYearTo = new Date().getFullYear();
      previousMonthTo = new Date().getMonth() + 1;
      break;
    }
    default:
      break;
  }

  return {
    currentYearFrom,
    currentMonthFrom,
    currentYearTo,
    currentMonthTo,
    previousYearFrom,
    previousMonthFrom,
    previousYearTo,
    previousMonthTo,
  };
};
