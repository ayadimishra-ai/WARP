import _ from "lodash";
import dynamic from "next/dynamic";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import {
  useEmissionByFuelConsumption,
  useEmissionByPowerConsumption,
  useEmissionByTransportation,
  useEmissionMain,
} from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/global.store";
import {
  calculatePercentageDataForCML,
  findHighestValue,
  getSelectedDurationValues,
  highestEmissionSubLocation,
  highestEmLocation,
  highestEmProduct,
  topEmissionCategory,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { sanitize_compare_str_v3 } from "~/utils/comapre.util";
import { months } from "~/utils/date.util";
const EmissionCardBlock = dynamic(
  () => import("~/components/ghg-dashboard/common/EmissionCardBlock"),
  {
    ssr: false,
  }
);
const EmissionTrendBlock = dynamic(
  () => import("~/components/ghg-dashboard/total-emissions/EmissionTrendBlock"),
  {
    ssr: false,
  }
);
const EmissionByScopeBlock = dynamic(
  () =>
    import("~/components/ghg-dashboard/emissionbyscope/EmissionByScopeBlock"),
  {
    ssr: false,
  }
);

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
  productionDetail: any[];
};

type ScopeData = {
  value?: number;
  change?: number;
  category?: { name: string; value: number; change?: number };
  product?: { name: string; value: number; change?: number };
  location?: { name: string; value: number; change?: number };
  subLocation?: { name: string; value: number; change?: number };
  subCategory?: { name: string; value: number; change?: number };
};

export interface emissionCardBlockProps {
  snapshotType?: string;
  scopeEmission: ScopeData[];
  productName: string;
  productArea: string;
  categoryName: string;
  isDataAvailable: Boolean;
}

const SnapshotMyView = () => {
  const { current, globalFilters } = useDashboardStore((store) => ({
    current: store.current,
    globalFilters: store.globalFilters,
  }));
  const kpiEmissionMain = useEmissionMain();
  const kpiEmissionByPowerConsumption = useEmissionByPowerConsumption();
  const kpiEmissionByTransportation = useEmissionByTransportation();
  const kpiEmissionByFuelConsumption = useEmissionByFuelConsumption();

  const duration = getSelectedDurationValues(globalFilters?.selectedDuration);

  const currentYearData: KPIData = current.currentYear as KPIData;
  const previousYearData: KPIData = current.previousYear as KPIData;
  let isDataAvailable: Boolean = true;
  if (
    !!currentYearData &&
    currentYearData.emissionByFuelConsumption.length == 0 &&
    currentYearData.emissionByMaterialConsumption.length == 0 &&
    currentYearData.emissionByPowerConsumption.length == 0 &&
    currentYearData.emissionByTransportation.length == 0 &&
    currentYearData.emissionByWasteGeneration.length == 0 &&
    currentYearData.main.length == 0 &&
    currentYearData.emissionByMaterialConsumptionSuppliers.length == 0 &&
    currentYearData.emissionByPowerConsumption_Vendors.length == 0 &&
    currentYearData.emissionByProducts.length == 0
  ) {
    isDataAvailable = false;
  }
  const grouped = _.groupBy(
    currentYearData?.productionDetail,
    (item) =>
      `${item.TaskRequest?.year}%${item.TaskRequest?.month}%${item.OrganizationAddress?.id}`
  );
  const cmlPercentageData: any = _.map(grouped, (items, key) => {
    const [year, month, address_id] = key.split("%");
    return {
      year: parseInt(year),
      month:
        Number(
          months.findIndex((item) => sanitize_compare_str_v3(item, month))
        ) + 1,
      address_id: address_id,
      percentageOfProduction:
        _.sumBy(items, "Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU") /
        items.length,
    };
  });
  const LcurrentValue = currentYearData?.main?.reduce(
    (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
    0
  );
  const LpreviousValue = previousYearData?.main?.reduce(
    (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
    0
  );

  const Lchange =
    !!LcurrentValue && !!LpreviousValue && LpreviousValue !== 0
      ? ((LcurrentValue - LpreviousValue) * 100) / LpreviousValue
      : 0;

  const LCategoryData = topEmissionCategory(
    currentYearData?.main as Record<string, any>[],
    previousYearData?.main as Record<string, any>[]
  );

  const Lcategory = {
    name: !!LCategoryData?.currentYear.length
      ? LCategoryData?.currentYear[0].name
      : "",
    value: !!LCategoryData?.currentYear.length
      ? LCategoryData?.currentYear[0].value
      : 0,
    change:
      !!LCategoryData?.currentYear.length &&
      !!LCategoryData?.previousYear.length &&
      LCategoryData?.previousYear[0]?.value > 0
        ? ((LCategoryData?.currentYear[0].value -
            LCategoryData?.previousYear.filter(
              (items) => items.name == LCategoryData?.currentYear[0].name
            )[0]?.value) *
            100) /
          LCategoryData?.previousYear[0]?.value
        : 0,
  };

  const LproductData = highestEmProduct(
    currentYearData?.emissionByProducts,
    previousYearData?.emissionByProducts,
    LcurrentValue
  );

  const Lproduct = {
    name:
      !!LproductData && !!LproductData.currentYearData.length
        ? LproductData.currentYearData[0]?.product_name
        : "",
    value:
      !!LproductData && !!LproductData.currentYearData.length
        ? LproductData.currentYearData[0]?.emission
        : 0,
    change:
      !!LproductData &&
      !!LproductData.currentYearData.length &&
      !!LproductData.previousYearData.length &&
      LproductData.previousYearData[0]?.emission > 0
        ? ((LproductData.currentYearData[0]?.emission -
            LproductData.previousYearData[0]?.emission) *
            100) /
          LproductData.previousYearData[0]?.emission
        : 0,
  };

  const locationtopEmissionLocation = highestEmLocation(
    currentYearData?.main as Record<string, any>[],
    previousYearData?.main as Record<string, any>[]
  );

  const Llocation = {
    name: !!locationtopEmissionLocation?.currentYearData.length
      ? locationtopEmissionLocation?.currentYearData[0]?.name
      : "",
    value: !!locationtopEmissionLocation?.currentYearData.length
      ? locationtopEmissionLocation?.currentYearData[0]?.emission
      : 0,
    change:
      !!locationtopEmissionLocation?.currentYearData.length &&
      !!locationtopEmissionLocation?.previousYearData.length &&
      locationtopEmissionLocation?.previousYearData[0]?.emission > 0
        ? ((locationtopEmissionLocation?.currentYearData[0]?.emission -
            locationtopEmissionLocation?.previousYearData.filter(
              (items) =>
                items.name ==
                locationtopEmissionLocation?.currentYearData[0].name
            )[0]?.emission) *
            100) /
          locationtopEmissionLocation?.previousYearData[0]?.emission
        : 0,
  };

  const addressIdLocationLevelHighest = !!locationtopEmissionLocation
    ?.currentYearData?.length
    ? locationtopEmissionLocation?.currentYearData[0]?.address_id
    : "";
  //#region snapshot card subcategorydata
  const sumCaptivePower = calculatePercentageDataForCML(
    kpiEmissionByPowerConsumption?.currentYearData,
    kpiEmissionByPowerConsumption?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_CaptivePower"
  );
  const sumTotalPowerPurchased = calculatePercentageDataForCML(
    kpiEmissionByPowerConsumption?.currentYearData,
    kpiEmissionByPowerConsumption?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_TotalPowerPurchased"
  );
  const sumEmUpstreamTransport = calculatePercentageDataForCML(
    kpiEmissionByTransportation?.currentYearData,
    kpiEmissionByTransportation?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_UpstreamTransport"
  );
  const sumEmDownStreamTransport = calculatePercentageDataForCML(
    kpiEmissionByTransportation?.currentYearData,
    kpiEmissionByTransportation?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_DownstreamTransport"
  );
  const sumEmEmployeeTravelTransport = calculatePercentageDataForCML(
    kpiEmissionByTransportation?.currentYearData,
    kpiEmissionByTransportation?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_EmployeeTravel"
  );

  const sumEmBusinessTravelTransport = calculatePercentageDataForCML(
    kpiEmissionByTransportation?.currentYearData,
    kpiEmissionByTransportation?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_BusinessTravel"
  );

  const sumEmWasteManagementTransport = calculatePercentageDataForCML(
    kpiEmissionByTransportation?.currentYearData,
    kpiEmissionByTransportation?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_Transport_WasteManagement"
  );
  const sumEmissionOfFuel = calculatePercentageDataForCML(
    kpiEmissionByFuelConsumption?.currentYearData,
    kpiEmissionByFuelConsumption?.previousYearData,
    kpiEmissionMain.currentYearData,
    globalFilters,
    cmlPercentageData,
    "kpi_em_TotalEmission_FuelConsumption"
  );
  const sumEmissionOfCategoriesPower = _.sum(
    kpiEmissionMain?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Energy)
  );

  const sumEmissionOfCategoriesTransport = _.sum(
    kpiEmissionMain?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Transport)
  );

  const sumEmissionOfCategoriesWaste = _.sum(
    kpiEmissionMain?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Waste)
  );

  const sumEmissionOfCategoriesMaterial = _.sum(
    kpiEmissionMain?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Material)
  );

  // For Sub Location
  const subLocationObjectForOrgLevel = [
    {
      category: "Energy",
      value: sumEmissionOfCategoriesPower || 0,
      ...kpiEmissionMain,
    },
    {
      category: "Transport",
      value: sumEmissionOfCategoriesTransport || 0,
      ...kpiEmissionMain,
    },
    {
      category: "Waste",
      value: sumEmissionOfCategoriesWaste || 0,
      ...kpiEmissionMain,
    },
    {
      category: "Material",
      value: sumEmissionOfCategoriesMaterial || 0,
      ...kpiEmissionMain,
    },
  ];
  const highestEmissionForSubLocation = findHighestValue(
    subLocationObjectForOrgLevel
  );

  const {
    currentYearData: currentYearDataSubLoc = [],
    previousYearData: previousYearDataSubLoc = [],
    category: categorySubLoc,
  } = highestEmissionForSubLocation || {};

  const subLocationHigh = highestEmissionSubLocation(
    currentYearDataSubLoc,
    previousYearDataSubLoc,
    categorySubLoc,
    addressIdLocationLevelHighest
  );

  const subLocation = {
    name: categorySubLoc ? categorySubLoc : "",
    value: !!subLocationHigh?.currentYearData.length
      ? subLocationHigh?.currentYearData[0]?.emission
      : 0,
    change:
      !!subLocationHigh?.currentYearData.length &&
      !!subLocationHigh?.previousYearData.length &&
      subLocationHigh?.previousYearData[0]?.emission > 0
        ? ((subLocationHigh?.currentYearData[0]?.emission -
            subLocationHigh?.previousYearData.filter(
              (items) => items.name == subLocationHigh?.currentYearData[0].name
            )[0]?.emission) *
            100) /
          subLocationHigh?.previousYearData[0]?.emission
        : 0,
  };

  // For Sub Categories

  const subCategoryObjectForLocLevel = [
    ...(Lcategory?.name === "Energy"
      ? [
          {
            category: "Energy By Grid Power",
            value: sumTotalPowerPurchased.currentYearValue,
            data: sumTotalPowerPurchased,
          },
        ]
      : []),
    ...(Lcategory?.name === "Energy"
      ? [
          {
            category: "Energy By Captive Power",
            value: sumCaptivePower.currentYearValue,
            data: sumCaptivePower,
          },
        ]
      : []),
    ...(Lcategory?.name === "Energy"
      ? [
          {
            category: "Energy By Fuel Consumption",
            value: sumEmissionOfFuel.currentYearValue,
            data: sumEmissionOfFuel,
          },
        ]
      : []),
    ...(Lcategory?.name === "Transport"
      ? [
          {
            category: "Transport By Upstream",
            value: sumEmUpstreamTransport.currentYearValue,
            data: sumEmUpstreamTransport,
          },
        ]
      : []),
    ...(Lcategory?.name === "Transport"
      ? [
          {
            category: "Transport By Downstream",
            value: sumEmDownStreamTransport.currentYearValue,
            data: sumEmDownStreamTransport,
          },
        ]
      : []),
    ...(Lcategory?.name === "Transport"
      ? [
          {
            category: "Transport By Employee Travel",
            value: sumEmEmployeeTravelTransport.currentYearValue,
            data: sumEmEmployeeTravelTransport,
          },
        ]
      : []),
    ...(Lcategory?.name === "Transport"
      ? [
          {
            category: "Transport By Business Travel",
            value: sumEmBusinessTravelTransport.currentYearValue,
            data: sumEmBusinessTravelTransport,
          },
        ]
      : []),
    ...(Lcategory?.name === "Transport"
      ? [
          {
            category: "Transport By Waste Management",
            value: sumEmWasteManagementTransport.currentYearValue,
            data: sumEmWasteManagementTransport,
          },
        ]
      : []),
  ];

  const highestEmForSubCategory = findHighestValue(
    subCategoryObjectForLocLevel
  );

  const subCategory = {
    name: !!highestEmForSubCategory ? highestEmForSubCategory?.category : "",
    value: !!highestEmForSubCategory ? highestEmForSubCategory?.value : 0,
    change:
      !!highestEmForSubCategory?.data.currentYearValue &&
      !!highestEmForSubCategory?.data.previousYearValue &&
      highestEmForSubCategory?.data.previousYearValue > 0
        ? ((highestEmForSubCategory?.data.currentYearValue -
            highestEmForSubCategory?.data.previousYearValue) *
            100) /
          highestEmForSubCategory?.data.previousYearValue
        : 0,
  };

  const locationLevelData: emissionCardBlockProps = {
    snapshotType: "myview",
    scopeEmission: [
      {
        value: LcurrentValue,
        change: Lchange,
        category: Lcategory,
        product: Lproduct,
        location: Llocation,
        subCategory,
        subLocation,
      },
    ],
    productName: Lproduct?.name ?? "",
    productArea: Llocation?.name ?? "",
    categoryName: Lcategory?.name ?? "",
    isDataAvailable: isDataAvailable,
  };

  const { main: mainArray } = currentYearData || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};

  return (
    <>
      <EmissionCardBlock
        data={locationLevelData}
        unit={unit}
        forlocation={true}
      />
      <EmissionTrendBlock selectedShowData={[duration]} />
      <EmissionByScopeBlock selectedShowData={[duration]} />
    </>
  );
};

export default SnapshotMyView;
