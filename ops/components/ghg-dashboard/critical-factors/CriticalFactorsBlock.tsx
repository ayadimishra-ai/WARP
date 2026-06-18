"use client";

import { Box, Card, Grid } from "@mantine/core";
import _ from "lodash";
import { useMemo } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import {
  useEmissionMain,
  useGlobalFilters,
} from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/global.store";
import {
  getLocationDetail,
  SelectedShowDataDataType,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import BlockHeading from "../common/BlockHeading";
import CriticalFactorsBanner from "../common/CriticalFactorsBanner";
import EmissionContributorBlock from "./EmissionContibutorBlock";
import FuelConsumptionTrendBlock from "./FuelConsumptionTrendBlock";
import PCEmissionIntensityBlock from "./PCEmissionIntensityBlock";
import PowerCTrendBlock from "./PowerCTrendBlock";
import PowerPurchaseBlock from "./PowerPurchaseBlock";
import PowerVendorsBlock from "./PowerVendorsBlock";
import ScopeThreeEmissionCategoriesBlock from "./ScopeThreeEmissionCategoriesBlock";
import ScopeThreeEmissionTable from "./ScopeThreeEmissionTable";
import SupplyCategoryBlock from "./SupplyCategoryBlock";
import UpDownStreamBlock from "./UpDownStreamBlock";

type ScopeData = {
  value: number;
  change: number;
  category?: string;
};

type Scope2Data = {
  value: number;
  change?: number;
  category?: string;
};

type CriticalFactorsBlockProps = {
  selectedShowData: Array<SelectedShowDataDataType>;
  isDownload: boolean;
};
interface GroupedEmissionsMap {
  [key: string]: {
    year: number;
    month: number;
    [category: string]: number | number;
  };
}

type KPIData = {
  emissionByFuelConsumption: any[];
  emissionByMaterialConsumption: any[];
  emissionByPowerConsumption: any[];
  emissionByTransportation: any[];
  emissionByWasteGeneration: any[];
  main: any[];
  emissionByMaterialConsumptionSuppliers: any[];
  emissionByPowerConsumption_Vendors: any[];
  emissionByProducts: any[];
};
interface DataItem {
  year: number;
  month: number;
  kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor: string;
  kpi_em_PowerPurchased_PPA_NonRenewable_vendor: string;
  kpi_em_PowerPurchased_NonRenewableSources_vendor: string;
  kpi_em_Emission_PowerPurchased_REC_vendor: string;
  kpi_em_Emission_PowerPurchased_PPA_Renewable: number;
  kpi_em_PowerPurchased_PPA_NonRenewable: number;
  kpi_em_PowerPurchased_NonRenewableSources: number;
  kpi_em_Emission_PowerPurchased_REC: number;
}

interface VendorData {
  year: number;
  month: number;
  value: number;
}

interface ProcessedData {
  [key: string]: VendorData[];
}
function CriticalFactorsBlock(props: CriticalFactorsBlockProps) {
  //get data from the global store where all data of every KPI is saved.
  const getStoreData = useDashboardStore((store) => store.current);
  const currentYearData: KPIData = getStoreData.currentYear as KPIData;
  const previousYearData: KPIData = getStoreData.previousYear as KPIData;
  const GlobalFilters = useGlobalFilters();
  const mainKpiData = useEmissionMain();
  const LocationData = getLocationDetail(
    mainKpiData.currentYearData,
    GlobalFilters
  );
  const withCML: boolean =
    LocationData.filter((items) => items.isCML == true).length == 0
      ? false
      : LocationData.filter((items) => items.isCML == true).length <
        LocationData.length;
  const onlyCML: boolean =
    LocationData.filter((items) => items.isCML == true).length ==
    LocationData.length;

  const getscopeOneEmissionData = () => {
    const currentYearScope1Em = currentYearData?.main
      .filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.reduce((acc, ele) => acc + ele.kpi_em_Total_Emission_Scope1, 0);
    if (previousYearData?.main?.length === 0)
      return [{ value: currentYearScope1Em }];
    else {
      const previousYearScope1Em = previousYearData?.main
        .filter((items) =>
          LocationData.some(
            (locationItem) =>
              locationItem.locationId == items.address_id &&
              locationItem.isCML == false
          )
        )
        ?.reduce((acc, ele) => acc + ele?.kpi_em_Total_Emission_Scope1, 0);
      const change = previousYearScope1Em
        ? ((currentYearScope1Em - previousYearScope1Em) * 100) /
          previousYearScope1Em
        : undefined;
      return [{ value: currentYearScope1Em, change }];
    }
  };
  const scopeOneEmissionData: Scope2Data[] = getscopeOneEmissionData();

  const EmissionContributorBlockScope1 = {
    power: currentYearData?.emissionByPowerConsumption
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.map((entry) => ({
        year: entry?.year,
        month: entry?.month,
        em_PowerConsumption: entry?.kpi_em_PowerConsumption_Scope1,
      })),
    fuel: currentYearData?.emissionByFuelConsumption
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.map((entry) => ({
        year: entry?.year,
        month: entry?.month,
        em_FuelConsumption: entry?.kpi_em_FuelConsumption_Scope1,
      })),
    transport: currentYearData?.emissionByTransportation
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.map((entry) => ({
        year: entry?.year,
        month: entry?.month,
        em_Transport: entry?.kpi_em_Transport_Scope1,
      })),
    waste: currentYearData?.emissionByWasteGeneration
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.map((entry) => ({
        year: entry?.year,
        month: entry?.month,
        em_WasteGeneration: entry?.kpi_em_WasteGeneration_Scope1,
      })),
  };

  const FuelConsumptionTreandBlockScope1 =
    currentYearData?.emissionByFuelConsumption
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.map((entry) => ({
        year: entry?.year,
        month: entry?.month,
        Diesel: entry?.kpi_em_Diesel_Consumption,
        Gasoline: entry?.kpi_em_Gasoline_Consumption,
        Biodiesel: entry?.kpi_em_Biodiesel_Consumption,
        Ethanol: entry?.kpi_em_Ethanol_Consumption,
        LPG: entry?.kpi_em_LPG_Consumption,
        CNG: entry?.kpi_em_CNG_Consumption,
        GaseousNitrogen: entry?.kpi_em_GaseousNitrogen_Consumption,
        GaseousOxygen: entry?.kpi_em_GaseousOxygen_Consumption,
        LiquidNitrogen: entry?.kpi_em_LiquidNitrogen_Consumption,
        CompressedAir: entry?.kpi_em_CompressedAir_Consumption,
        Electric: entry?.kpi_em_Electric_Consumption,
        JetFuel: entry?.kpi_em_JetFuel_Consumption,
        SAF: entry?.kpi_em_SAF_Consumption,
        Coal: entry?.kpi_em_Coal_Consumption,
        Petcoke: entry?.kpi_em_Petcoke_Consumption,
        NaturalGas: entry?.kpi_em_NaturalGas_Consumption,
        Biomass: entry?.kpi_em_Biomass_Consumption,
        Bagasse: entry?.kpi_em_Bagasse_Consumption,
        Kerosene: entry?.kpi_em_Kerosene_Consumption,
      }));

  const getscopeTwoEmissionData = () => {
    const currentYearRenewableResources =
      currentYearData?.emissionByPowerConsumption
        ?.filter((items) =>
          LocationData.some(
            (locationItem) =>
              locationItem.locationId == items.address_id &&
              locationItem.isCML == false
          )
        )
        ?.reduce(
          (acc, ele) => acc + ele?.kpi_em_PowerPurchased_RenewableSources,
          0
        );
    const currentYearNonRenewableResources =
      currentYearData?.emissionByPowerConsumption
        ?.filter((items) =>
          LocationData.some(
            (locationItem) =>
              locationItem.locationId == items.address_id &&
              locationItem.isCML == false
          )
        )
        ?.reduce(
          (acc, ele) => acc + ele?.kpi_em_PowerPurchased_NonRenewableSources,
          0
        );
    if (previousYearData?.emissionByPowerConsumption?.length === 0) {
      return [
        {
          category: "Renewable",
          value: currentYearRenewableResources,
        },
        {
          category: "Non-Renewable",
          value: currentYearNonRenewableResources,
        },
      ];
    } else {
      const previousYearRenewableResources =
        previousYearData?.emissionByPowerConsumption
          ?.filter((items) =>
            LocationData.some(
              (locationItem) =>
                locationItem.locationId == items.address_id &&
                locationItem.isCML == false
            )
          )
          ?.reduce(
            (acc, ele) => acc + ele?.kpi_em_PowerPurchased_RenewableSources,
            0
          );
      const previousYearNonRenewableResources =
        previousYearData?.emissionByPowerConsumption
          ?.filter((items) =>
            LocationData.some(
              (locationItem) =>
                locationItem.locationId == items.address_id &&
                locationItem.isCML == false
            )
          )
          ?.reduce(
            (acc, ele) => acc + ele?.kpi_em_PowerPurchased_NonRenewableSources,
            0
          );
      const renewableChange = previousYearRenewableResources
        ? ((currentYearRenewableResources - previousYearRenewableResources) *
            100) /
          previousYearRenewableResources
        : 0;
      const nonRenewableChange = previousYearNonRenewableResources
        ? ((currentYearNonRenewableResources -
            previousYearNonRenewableResources) *
            100) /
          previousYearNonRenewableResources
        : 0;
      return [
        {
          category: "Renewable",
          value: currentYearRenewableResources,
          change: renewableChange,
        },
        {
          category: "Non-Renewable",
          value: currentYearNonRenewableResources,
          change: nonRenewableChange,
        },
      ];
    }
  };
  const scopeTwoEmissionData: Scope2Data[] = getscopeTwoEmissionData();
  const PowerPurchaseBlockScope2 = currentYearData?.emissionByPowerConsumption
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == false
      )
    )
    ?.map((entry) => ({
      year: entry?.year,
      month: entry?.month,
      RenewableSources: entry?.kpi_em_PowerPurchased_RenewableSources,
      NonRenewableSources: entry?.kpi_em_PowerPurchased_NonRenewableSources,
    }));

  const getPowerVendorsBlockScope2Data = () => {
    const result: ProcessedData = {};
    const data = currentYearData?.emissionByPowerConsumption_Vendors
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.map((entry) => ({
        year: entry?.year,
        month: entry?.month,
        kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor:
          entry?.kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor,
        kpi_em_PowerPurchased_PPA_NonRenewable_vendor:
          entry?.kpi_em_PowerPurchased_PPA_NonRenewable_vendor,
        kpi_em_PowerPurchased_NonRenewableSources_vendor:
          entry?.kpi_em_PowerPurchased_NonRenewableSources_vendor,
        kpi_em_Emission_PowerPurchased_REC_vendor:
          entry?.kpi_em_Emission_PowerPurchased_REC_vendor,
        kpi_em_Emission_PowerPurchased_PPA_Renewable:
          entry?.kpi_em_Emission_PowerPurchased_PPA_Renewable,
        kpi_em_PowerPurchased_PPA_NonRenewable:
          entry?.kpi_em_PowerPurchased_PPA_NonRenewable,
        kpi_em_PowerPurchased_NonRenewableSources:
          entry?.kpi_em_PowerPurchased_NonRenewableSources,
        kpi_em_Emission_PowerPurchased_REC:
          entry?.kpi_em_Emission_PowerPurchased_REC,
      }));

    data?.forEach((item) => {
      const {
        year,
        month,
        kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor,
        kpi_em_PowerPurchased_PPA_NonRenewable_vendor,
        kpi_em_PowerPurchased_NonRenewableSources_vendor,
        kpi_em_Emission_PowerPurchased_REC_vendor,
        kpi_em_Emission_PowerPurchased_PPA_Renewable,
        kpi_em_PowerPurchased_PPA_NonRenewable,
        kpi_em_PowerPurchased_NonRenewableSources,
        kpi_em_Emission_PowerPurchased_REC,
      } = item;

      const vendors: string[] = [
        kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor,
        kpi_em_PowerPurchased_PPA_NonRenewable_vendor,
        kpi_em_PowerPurchased_NonRenewableSources_vendor,
        kpi_em_Emission_PowerPurchased_REC_vendor,
      ];

      vendors?.forEach((vendor) => {
        const key = vendor.trim() || "Others";
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push({
          year,
          month,
          value:
            key === kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor
              ? kpi_em_Emission_PowerPurchased_PPA_Renewable
              : key === kpi_em_PowerPurchased_PPA_NonRenewable_vendor
                ? kpi_em_PowerPurchased_PPA_NonRenewable
                : key === kpi_em_PowerPurchased_NonRenewableSources_vendor
                  ? kpi_em_PowerPurchased_NonRenewableSources
                  : key === kpi_em_Emission_PowerPurchased_REC_vendor
                    ? kpi_em_Emission_PowerPurchased_REC
                    : 0,
        });
      });
    });
    return result;
  };
  const PowerVendorsBlockScope2 = getPowerVendorsBlockScope2Data();

  const PowerCTrendBlockScope2 = currentYearData?.emissionByPowerConsumption
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == false
      )
    )
    ?.map((entry) => ({
      year: entry?.year,
      month: entry?.month,
      captive: entry?.kpi_em_CaptivePower || 0,
      //parseFloat(parseFloat(entry?.kpi_em_CaptivePower).toFixed(1)) || 0,
      purchased: entry?.kpi_em_TotalPowerPurchased || 0,
      //parseFloat(parseFloat(entry?.kpi_em_TotalPowerPurchased).toFixed(1)) || 0,
      total:
        (entry?.kpi_em_CaptivePower || 0) +
        (entry?.kpi_em_TotalPowerPurchased || 0),
      // (parseFloat(parseFloat(entry?.kpi_em_CaptivePower).toFixed(1)) || 0) +
      // (parseFloat(parseFloat(entry?.kpi_em_TotalPowerPurchased).toFixed(1)) || 0),
    }));

  let PCEmissionIntensityBlockScope2 = useMemo(() => {
    let emissionByPowerConsumption =
      currentYearData?.emissionByPowerConsumption.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      ) ?? [];

    if (!emissionByPowerConsumption.length) return [];

    const grouped = _.groupBy(
      emissionByPowerConsumption,
      (item) => `${item.year}-${item.month}`
    );

    const data = _.map(grouped, (items, key) => {
      const [year, month] = key.split("-");
      return {
        year: parseInt(year),
        month: parseInt(month),
        kpi_em_CaptivePower: _.sumBy(items, "kpi_em_CaptivePower"),
        kpi_CaptivePower_GeneratedUnits: _.sumBy(
          items,
          "kpi_CaptivePower_GeneratedUnits"
        ),
        kpi_em_TotalPowerPurchased: _.sumBy(
          items,
          "kpi_em_TotalPowerPurchased"
        ),
        kpi_TotalPowerPurchased_GeneratedUnits: _.sumBy(
          items,
          "kpi_TotalPowerPurchased_GeneratedUnits"
        ),
      };
    });
    return data.map((entry) => ({
      year: entry.year,
      month: entry.month,
      captive: Number(
        !!entry.kpi_em_CaptivePower && !!entry.kpi_CaptivePower_GeneratedUnits
          ? entry.kpi_em_CaptivePower / entry.kpi_CaptivePower_GeneratedUnits
          : 0
      ),
      purchased: Number(
        !!entry.kpi_em_TotalPowerPurchased &&
          !!entry.kpi_TotalPowerPurchased_GeneratedUnits
          ? entry.kpi_em_TotalPowerPurchased /
              entry.kpi_TotalPowerPurchased_GeneratedUnits
          : 0
      ),
    }));
  }, [currentYearData?.emissionByPowerConsumption]);
  // =======================================================================================================

  //#region Scope 3 Data Starts
  const getscopeThreeEmissionData = () => {
    const currentYearScope3Em = currentYearData?.main?.reduce(
      (acc, ele) => acc + ele?.kpi_em_Total_Emission_Scope3,
      0
    );
    if (previousYearData?.main?.length === 0)
      return [{ value: currentYearScope3Em }];
    else {
      const previousYearScope3Em = previousYearData?.main?.reduce(
        (acc, ele) => acc + ele?.kpi_em_Total_Emission_Scope3,
        0
      );
      const change = previousYearScope3Em
        ? ((currentYearScope3Em - previousYearScope3Em) * 100) /
          previousYearScope3Em
        : undefined;
      return [{ value: currentYearScope3Em, change }];
    }
  };

  //#region Scope 3 Emission Details Contribution from Suppliers
  const calculateContribution = (
    totalOfAllSuppliers: any,
    currentSupplier: any
  ) => {
    if (currentSupplier === 0 || totalOfAllSuppliers === 0) return 0;
    let data = (currentSupplier / totalOfAllSuppliers) * 100;
    return parseFloat(data.toFixed(1));
  };

  const totalOfAllSuppliers =
    currentYearData?.emissionByMaterialConsumptionSuppliers?.reduce(
      (acc, entry) => {
        acc.sumOfSuppliers +=
          entry?.kpi_em_MaterialProcurement_Scope3 +
          entry?.kpi_em_TansportUpstreamEmission;
        return acc;
      },
      { sumOfSuppliers: 0 }
    );
  const uniqueSupplierIdandCat: Record<string, any>[] = [];
  currentYearData?.emissionByMaterialConsumptionSuppliers?.map(
    (items: Record<string, any>) => {
      const supplierid =
        items.supplier_id === null || items.supplier_id == "null"
          ? "Self"
          : items.supplier_id;
      const cateogry =
        items?.supplier_category === null || items?.supplier_category === "null"
          ? "Self"
          : items?.supplier_category;
      if (
        uniqueSupplierIdandCat?.filter(
          (items) =>
            items.supplier_id == supplierid && items.category == cateogry
        ).length == 0
      ) {
        uniqueSupplierIdandCat.push({
          supplier_id: supplierid,
          category: cateogry,
        });
      }
    }
  );
  const currentEmisionBySuppliersTable: Record<string, any>[] = [];
  let totalEmissionValueBySuppliers = 0;
  uniqueSupplierIdandCat?.forEach((item: Record<string, any>) => {
    let categorytotalEmission: number = 0;
    let categorytransportEmission: number = 0;
    let currentSupplierData =
      currentYearData?.emissionByMaterialConsumptionSuppliers?.filter(
        (items: Record<string, any>) =>
          items.supplier_id == item.supplier_id &&
          items.supplier_category == item.category
      );
    if (item.supplier_id == "Self") {
      currentSupplierData =
        currentYearData?.emissionByMaterialConsumptionSuppliers?.filter(
          (items: Record<string, any>) =>
            (items.supplier_id == "null" || items.supplier_id == null) &&
            (item.supplier_category == "null" || item.supplier_category == null)
        );
    }
    currentSupplierData?.forEach((items: Record<string, any>) => {
      categorytotalEmission =
        categorytotalEmission + items?.kpi_em_MaterialProcurement_Scope3;
      categorytransportEmission =
        categorytransportEmission + items?.kpi_em_TansportUpstreamEmission;
    });
    currentEmisionBySuppliersTable.push({
      supplyCategory: item.category,
      id:
        item.supplier_id === null || item.supplier_id == "null"
          ? "Self"
          : item.supplier_id,
      name: currentSupplierData[0]?.supplier_name,
      contribution: calculateContribution(
        totalOfAllSuppliers?.sumOfSuppliers,
        categorytotalEmission + categorytransportEmission
      ),
      emission: categorytotalEmission.toFixed(1),
      transportEmission: categorytransportEmission.toFixed(1),
      totalEmission: (
        categorytotalEmission + categorytransportEmission
      ).toFixed(1),
    });
    totalEmissionValueBySuppliers =
      totalEmissionValueBySuppliers +
      (categorytotalEmission ? categorytotalEmission : 0) +
      (categorytransportEmission ? categorytransportEmission : 0);
  });
  //#endregion

  //#region  Scope 3 Emission Details Contribution from Categories
  //#region Line Chart
  const consolidatedEmissions: any[] = [];

  currentYearData?.main?.forEach((kpiMain) => {
    const consolidatedEntry = {
      year: kpiMain.year,
      month: kpiMain.month,
      upstream: 0,
      downstream: 0,
      employeeTravel: 0,
      businessTravel: 0,
      waste: 0,
      material: 0,
      wasteGeneration: 0,
      contractManufacturing: 0,
    };

    consolidatedEmissions.push(consolidatedEntry);
  });

  currentYearData?.emissionByTransportation
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == false
      )
    )
    ?.forEach((entry) => {
      const yearMonthKey = `${entry.year}-${entry.month}`;
      const consolidatedEntry = consolidatedEmissions?.find(
        (e) => e.year === entry.year && e.month === entry.month
      );

      if (consolidatedEntry) {
        consolidatedEntry.upstream +=
          entry.kpi_em_UpstreamTransport_Scope3 || 0;
        consolidatedEntry.downstream +=
          entry.kpi_em_DownstreamTransport_Scope3 || 0;
        consolidatedEntry.employeeTravel +=
          entry.kpi_em_EmployeeTravel_Scope3 || 0;
        consolidatedEntry.businessTravel +=
          entry.kpi_em_BusinessTravel_Scope3 || 0;
        consolidatedEntry.waste +=
          entry.kpi_em_Transport_WasteManagement_Scope3 || 0;
      }
    });
  currentYearData?.emissionByMaterialConsumption
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == false
      )
    )
    ?.forEach((entry) => {
      const consolidatedEntry = consolidatedEmissions.find(
        (e) => e.year === entry.year && e.month === entry.month
      );

      if (consolidatedEntry) {
        consolidatedEntry.material +=
          entry.kpi_em_MaterialProcurement_Scope3 || 0;
      }
    });

  currentYearData?.emissionByWasteGeneration
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == false
      )
    )
    ?.forEach((entry) => {
      // console.log("Entry=", entry.kpi_em_WasteGeneration_Scope3);
      const consolidatedEntry = consolidatedEmissions.find(
        (e) => e.year === entry.year && e.month === entry.month
      );

      if (consolidatedEntry) {
        consolidatedEntry.wasteGeneration +=
          entry?.kpi_em_WasteGeneration_Scope3 || 0;
      }
    });
  currentYearData?.main
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == true
      )
    )
    ?.forEach((entry) => {
      const consolidatedEntry = consolidatedEmissions?.find(
        (e) => e.year === entry.year && e.month === entry.month
      );
      if (consolidatedEntry) {
        consolidatedEntry.contractManufacturing +=
          entry.kpi_em_Total_Emission_Scope3 || 0;
      }
    });
  //#endregion
  //#region PieChart
  const cmldata = currentYearData?.main
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == true
      )
    )
    ?.reduce(
      (acc, entry) => {
        acc.sumOfcml = parseFloat(
          acc.sumOfcml + entry?.kpi_em_Total_Emission_Scope3
        );

        return acc;
      },
      {
        sumOfcml: 0,
      }
    );
  const Scope3ByCategoriesPieChart = currentYearData?.emissionByTransportation
    ?.filter((items) =>
      LocationData.some(
        (locationItem) =>
          locationItem.locationId == items.address_id &&
          locationItem.isCML == false
      )
    )
    ?.reduce(
      (acc, entry) => {
        acc.sumOfUpstream =
          acc.sumOfUpstream + entry?.kpi_em_UpstreamTransport_Scope3;
        acc.sumOfDownstream =
          acc.sumOfDownstream + entry?.kpi_em_DownstreamTransport_Scope3;
        acc.sumOfEmployeeTravel =
          acc.sumOfEmployeeTravel + entry?.kpi_em_EmployeeTravel_Scope3;
        acc.sumOfBussinessTravel =
          acc.sumOfBussinessTravel + entry?.kpi_em_BusinessTravel_Scope3;
        acc.sumOfTravelWasteManagement =
          acc.sumOfTravelWasteManagement +
          entry?.kpi_em_Transport_WasteManagement_Scope3;
        return acc;
      },
      {
        sumOfUpstream: 0,
        sumOfDownstream: 0,
        sumOfEmployeeTravel: 0,
        sumOfBussinessTravel: 0,
        sumOfTravelWasteManagement: 0,
      }
    );

  const materialProcurementScope3PieChart =
    currentYearData?.emissionByMaterialConsumption
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.reduce(
        (acc, entry) => {
          acc.sumOfMaterialProcurement = parseFloat(
            (
              acc.sumOfMaterialProcurement +
              entry?.kpi_em_MaterialProcurement_Scope3
            ).toFixed(1)
          );
          return acc;
        },
        { sumOfMaterialProcurement: 0 }
      );

  const wasteManagementScope3PieChart =
    currentYearData?.emissionByWasteGeneration
      ?.filter((items) =>
        LocationData.some(
          (locationItem) =>
            locationItem.locationId == items.address_id &&
            locationItem.isCML == false
        )
      )
      ?.reduce(
        (acc, entry) => {
          acc.sumOfWasteGeneration = parseFloat(
            (
              acc.sumOfWasteGeneration + entry.kpi_em_WasteGeneration_Scope3
            ).toFixed(1)
          );
          return acc;
        },
        { sumOfWasteGeneration: 0 }
      );
  let contributionFromCategoriesPieChartDataProp: Record<string, any> = {};
  if (withCML) {
    contributionFromCategoriesPieChartDataProp = {
      upstreamTransport: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfUpstream?.toFixed(1)
      ),
      downstreamTransport: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfDownstream?.toFixed(1)
      ),
      employeeTravel: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfEmployeeTravel?.toFixed(1)
      ),
      businessTravel: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfBussinessTravel?.toFixed(1)
      ),
      transportForWasteMgt: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfTravelWasteManagement?.toFixed(1)
      ),
      materialProcurement: parseFloat(
        materialProcurementScope3PieChart?.sumOfMaterialProcurement?.toFixed(1)
      ),
      wasteGeneration: parseFloat(
        wasteManagementScope3PieChart?.sumOfWasteGeneration?.toFixed(1)
      ),
      contractManufacturing: parseFloat(cmldata?.sumOfcml?.toFixed(1)), ///
    };
  } else if (!withCML && !onlyCML) {
    contributionFromCategoriesPieChartDataProp = {
      upstreamTransport: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfUpstream?.toFixed(1)
      ),
      downstreamTransport: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfDownstream?.toFixed(1)
      ),
      employeeTravel: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfEmployeeTravel?.toFixed(1)
      ),
      businessTravel: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfBussinessTravel?.toFixed(1)
      ),
      transportForWasteMgt: parseFloat(
        Scope3ByCategoriesPieChart?.sumOfTravelWasteManagement?.toFixed(1)
      ),
      materialProcurement: parseFloat(
        materialProcurementScope3PieChart?.sumOfMaterialProcurement?.toFixed(1)
      ),
      wasteGeneration: parseFloat(
        wasteManagementScope3PieChart?.sumOfWasteGeneration?.toFixed(1)
      ),
    };
  } else if (onlyCML) {
    contributionFromCategoriesPieChartDataProp = {
      contractManufacturing: parseFloat(cmldata?.sumOfcml?.toFixed(1)), ///
    };
  }
  //#endregion
  //#endregion

  //#region Scope 3 Emission Details Contribution from Upstream and Downstream
  //#region Line Chart
  const monthlyContributionFromUpstreamDownstream = currentYearData?.main?.map(
    (entry) => {
      return {
        year: entry?.year,
        month: entry?.month,
        upstream: entry?.kpi_em_Scope3_Cont_Upstream,
        downstream: entry?.kpi_em_Scope3_Cont_Downstream,
      };
    }
  );
  //#endregion
  //#region PieChart
  const upstreamDownstreamScope3Contribution = currentYearData?.main?.reduce(
    (acc, entry) => {
      acc.sumOfUpstream = parseFloat(
        acc.sumOfUpstream + entry?.kpi_em_Scope3_Cont_Upstream
      );
      acc.sumOfDownstream = parseFloat(
        acc.sumOfDownstream + entry?.kpi_em_Scope3_Cont_Downstream
      );
      return acc;
    },
    {
      sumOfUpstream: 0,
      sumOfDownstream: 0,
    }
  );

  const upstreamDownstreamScope3PieChart = [
    {
      category: "Upstream",
      value: upstreamDownstreamScope3Contribution?.sumOfUpstream,
    },
    {
      category: "Downstream",
      value: upstreamDownstreamScope3Contribution?.sumOfDownstream,
    },
  ];
  //#endregion
  //#endregion

  //#region Scope 3 Emission Details Contribution from Supply Category
  //#region piechart
  function groupEmissionsByCategory(data: any[]) {
    const categoryEmissionsMap = data?.reduce(
      (acc, entry) => {
        const category =
          entry.supplier_category === null || entry.supplier_category === "null"
            ? "Self"
            : entry.supplier_category;

        if (acc[category]) {
          acc[category] += entry?.kpi_em_MaterialProcurement_Scope3;
        } else {
          acc[category] = entry?.kpi_em_MaterialProcurement_Scope3;
        }
        return acc;
      },
      {} as { [key: string]: number }
    );

    return Object.keys(categoryEmissionsMap)?.map((category) => ({
      category,
      value: categoryEmissionsMap[category],
    }));
  }
  const emissionFromSupplyCategoryPieChart = groupEmissionsByCategory(
    currentYearData?.emissionByMaterialConsumptionSuppliers || []
  );
  //#endregion
  //#region LineChart
  function groupEmissionsByYearMonthCategory(data: any[]): any[] {
    const groupedEmissionsMap: GroupedEmissionsMap = {};

    data?.forEach((entry) => {
      const yearMonthKey = `${entry.year}-${entry.month}`;
      const category =
        entry.supplier_category === null || entry.supplier_category === "null"
          ? "self"
          : entry.supplier_category;

      if (!groupedEmissionsMap[yearMonthKey]) {
        groupedEmissionsMap[yearMonthKey] = {
          year: entry.year,
          month: entry.month,
        };
      }

      if (groupedEmissionsMap[yearMonthKey][category]) {
        groupedEmissionsMap[yearMonthKey][category] +=
          entry?.kpi_em_MaterialProcurement_Scope3;
      } else {
        groupedEmissionsMap[yearMonthKey][category] =
          entry?.kpi_em_MaterialProcurement_Scope3;
      }
    });

    return Object.values(groupedEmissionsMap)?.map((entry: any) => ({
      year: entry.year,
      month: entry.month,
      ...Object.fromEntries(
        Object.entries(entry)?.filter(
          ([key]) => key !== "year" && key !== "month"
        )
      ),
    }));
  }
  const emissionFromSupplyCategoryLineChart = groupEmissionsByYearMonthCategory(
    currentYearData?.emissionByMaterialConsumptionSuppliers || []
  );
  //#endregion
  //#endregion

  const scopeThreeEmissionData: any[] = getscopeThreeEmissionData();
  const scope3emissionData = {
    ContributionFromUpstreamDownstreamPieChart:
      upstreamDownstreamScope3PieChart,
    monthlyContributionFromUpstreamDownstream:
      monthlyContributionFromUpstreamDownstream,
    contributionFromCategoriesLineChartData: consolidatedEmissions,
    contributionFromCategoriesPieChartData:
      contributionFromCategoriesPieChartDataProp,
    contributionFromSuppliersTable: currentEmisionBySuppliersTable,
    contributionFromSupplyCategoryPieChart: emissionFromSupplyCategoryPieChart,
    monthlyContributionFromSupplyCategory: emissionFromSupplyCategoryLineChart,
    totalEmissionValueBySuppliers,
  };
  //#endregion
  // ===================================================================================================================
  const { main: mainArray } = currentYearData || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};
  return (
    <Box>
      <BlockHeading title="Emission by Critical Factors" />
      <Grid
        gutter="md"
        pt="md"
        id="scope1EmissionsScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <CriticalFactorsBanner
            title="Scope 1 Emission"
            unit={unit}
            theme="green"
            scopeEmission={scopeOneEmissionData}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="scope1ContributorsScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <EmissionContributorBlock
            data={EmissionContributorBlockScope1}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="emissionByFuelTypesScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <FuelConsumptionTrendBlock
            data={FuelConsumptionTreandBlockScope1}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="scope2EmissionsScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <CriticalFactorsBanner
            title="Scope 2 Emission"
            unit={unit}
            theme="lightgreen"
            scopeEmission={scopeTwoEmissionData}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="byPowerPurchaseScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <PowerPurchaseBlock
            data={PowerPurchaseBlockScope2}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="byPowerVendorsScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <PowerVendorsBlock
            data={PowerVendorsBlockScope2}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="byPowerConsumptionScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <PowerCTrendBlock
            data={PowerCTrendBlockScope2}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="emissionsIntensityScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <PCEmissionIntensityBlock
            data={PCEmissionIntensityBlockScope2}
            selectedShowData={props.selectedShowData}
          />
        </Grid.Col>
      </Grid>
      <Grid
        gutter="md"
        pt="md"
        id="scope3EmissionsScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <CriticalFactorsBanner
            title="Scope 3 Emission"
            unit={unit}
            theme="blue"
            scopeEmission={scopeThreeEmissionData}
          />
        </Grid.Col>
      </Grid>

      <Grid
        gutter="md"
        pt="md"
        id="fromUpstreamDownstreamScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <UpDownStreamBlock
            data={scope3emissionData}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>

      <Grid
        gutter="md"
        pt="md"
        id="fromCategoriesScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <ScopeThreeEmissionCategoriesBlock
            data={scope3emissionData}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>

      <Grid
        gutter="md"
        pt="md"
        id="fromSuppliersScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <Card padding="md" radius="md" h="100%">
            <ScopeThreeEmissionTable
              isDownload={props.isDownload}
              selectedShowData={props.selectedShowData}
              emissionData={scope3emissionData}
              unit={unit}
            />
          </Card>
        </Grid.Col>
      </Grid>

      <Grid
        gutter="md"
        pt="md"
        id="fromSupplyCategoriesScrollId"
        className="subScrollIds"
      >
        <Grid.Col span={12}>
          <SupplyCategoryBlock
            data={scope3emissionData}
            selectedShowData={props.selectedShowData}
            unit={unit}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default CriticalFactorsBlock;
