import _ from "lodash";
import dynamic from "next/dynamic";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { useEmissionMainOrgLevel } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/global.store";
import {
  findHighestValue,
  highestEmissionSubLocation,
  highestEmLocation,
  highestEmProduct,
  topEmissionCategory,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
const EmissionCardBlock = dynamic(
  () => import("~/components/ghg-dashboard/common/EmissionCardBlock"),
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
};

type ScopeData = {
  value?: number;
  change?: number;
  category?: { name: string; value: number; change?: number };
  product?: { name: string; value: number; change?: number };
  location?: { name: string; value: number; change?: number };
  subLocation?: { name: string; value: number; change?: number };
};

export interface emissionCardBlockProps {
  snapshotType?: string;
  scopeEmission: ScopeData[];
  productName: string;
  productArea: string;
  categoryName: string;
  isDataAvailable: Boolean;
}

const SnapshotOrgLevel = () => {
  const { current } = useDashboardStore((state) => ({
    current: state.current,
  }));

  const kpiEmissionMainOrgLevel = useEmissionMainOrgLevel();

  const {
    currentYear,
    organizationLevelKPIData: organizationCurrentYearData,
    previousYearOrganizationLevelKPIMain: organizationPreviousYearData,
  } = current || {};
  const currentYearData = currentYear as KPIData;
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
  const currentValue = organizationCurrentYearData?.reduce(
    (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
    0
  );
  const previousValue = organizationPreviousYearData?.reduce(
    (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
    0
  );

  const change =
    !!currentValue && !!previousValue && previousValue !== 0
      ? ((currentValue - previousValue) * 100) / previousValue
      : 0;

  const orgCategoryData = topEmissionCategory(
    organizationCurrentYearData as Record<string, any>[],
    organizationPreviousYearData as Record<string, any>[]
  );

  const productData = highestEmProduct(
    current?.organisationLevelKPIEmissionByProducts as Record<string, any>[],
    current?.previousYearorganisationLevelKPIEmissionByProducts as Record<
      string,
      any
    >[],
    currentValue
  );

  const category = {
    name: !!orgCategoryData?.currentYear.length
      ? orgCategoryData?.currentYear[0].name
      : "",
    value: !!orgCategoryData?.currentYear.length
      ? orgCategoryData?.currentYear[0].value
      : 0,
    change:
      !!orgCategoryData?.currentYear.length &&
      !!orgCategoryData?.previousYear.length &&
      orgCategoryData?.previousYear[0]?.value > 0
        ? ((orgCategoryData?.currentYear[0].value -
            orgCategoryData?.previousYear.filter(
              (items) => items.name == orgCategoryData?.currentYear[0].name
            )[0]?.value) *
            100) /
          orgCategoryData?.previousYear[0]?.value
        : 0,
  };

  const product = {
    name:
      !!productData && !!productData.currentYearData.length
        ? productData.currentYearData[0]?.product_name
        : "",
    value:
      !!productData && !!productData.currentYearData.length
        ? productData.currentYearData[0]?.emission
        : 0,
    change:
      !!productData &&
      !!productData.currentYearData.length &&
      !!productData.previousYearData.length &&
      productData.previousYearData[0]?.emission > 0
        ? ((productData.currentYearData[0]?.emission -
            productData.previousYearData[0]?.emission) *
            100) /
          productData.previousYearData[0]?.emission
        : 0,
  };

  const topEmissionLocation = highestEmLocation(
    organizationCurrentYearData as Record<string, any>[],
    organizationPreviousYearData as Record<string, any>[]
  );

  const location = {
    name: !!topEmissionLocation?.currentYearData.length
      ? topEmissionLocation?.currentYearData[0]?.name
      : "",
    value: !!topEmissionLocation?.currentYearData.length
      ? topEmissionLocation?.currentYearData[0]?.emission
      : 0,
    change:
      !!topEmissionLocation?.currentYearData.length &&
      !!topEmissionLocation?.previousYearData.length &&
      topEmissionLocation?.previousYearData[0]?.emission > 0
        ? ((topEmissionLocation?.currentYearData[0]?.emission -
            topEmissionLocation?.previousYearData.filter(
              (items) =>
                items.name == topEmissionLocation?.currentYearData[0].name
            )[0]?.emission) *
            100) /
          topEmissionLocation?.previousYearData[0]?.emission
        : 0,
  };

  const addressIdLocationLevelHighest = !!topEmissionLocation?.currentYearData
    ?.length
    ? topEmissionLocation?.currentYearData[0]?.address_id
    : "";

  const sumEmissionOfPower = _.sum(
    kpiEmissionMainOrgLevel?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Energy)
  );

  const sumEmissionOfTransport = _.sum(
    kpiEmissionMainOrgLevel?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Transport)
  );

  const sumEmissionOfWaste = _.sum(
    kpiEmissionMainOrgLevel?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Waste)
  );

  const sumEmissionOfMaterial = _.sum(
    kpiEmissionMainOrgLevel?.currentYearData
      ?.filter((m) => m.address_id === addressIdLocationLevelHighest)
      .map((m) => m.kpi_em_Cont_TotalEmission_Categories_Material)
  );

  const data = [
    {
      category: "Energy",
      value: sumEmissionOfPower || 0,
      ...kpiEmissionMainOrgLevel,
    },
    {
      category: "Transport",
      value: sumEmissionOfTransport || 0,
      ...kpiEmissionMainOrgLevel,
    },
    {
      category: "Waste",
      value: sumEmissionOfWaste || 0,
      ...kpiEmissionMainOrgLevel,
    },
    {
      category: "Material",
      value: sumEmissionOfMaterial || 0,
      ...kpiEmissionMainOrgLevel,
    },
  ];

  const highestEmissionForSubLocation = findHighestValue(data);

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

  const organizationLevelData: emissionCardBlockProps = {
    scopeEmission: [
      {
        value: currentValue,
        change: change,
        category,
        product,
        location,
        subLocation,
      },
    ],
    productName: product?.name ?? "",
    productArea: location?.name ?? "",
    categoryName: category?.name ?? "",
    isDataAvailable: isDataAvailable,
  };

  const { main: mainArray } = currentYearData || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};

  return (
    <EmissionCardBlock
      data={organizationLevelData}
      unit={unit}
      forlocation={false}
    />
  );
};

export default SnapshotOrgLevel;
