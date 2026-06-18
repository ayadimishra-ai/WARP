"use client";

import dynamic from "next/dynamic";

const SnapshotMyView = dynamic(
  () => import("~/components/ghg-dashboard/snapshot-my-view/snapshot-my-view"),
  {
    ssr: false,
  }
);
// type ScopeData = {
//   value?: number;
//   change?: number;
//   category?: { name: string; value: number; change?: number };
//   product?: { name: string; value: number; change?: number };
//   location?: { name: string; value: number; change?: number };
// };
// export interface emissionCardBlockProps {
//   snapshotType?: string;
//   scopeEmission: ScopeData[];
//   productName: string;
//   productArea: string;
//   categoryName: string;
// }

// type KPIData = {
//   emissionByFuelConsumption: any[];
//   emissionByMaterialConsumption: any[];
//   emissionByPowerConsumption: any[];
//   emissionByTransportation: any[];
//   emissionByWasteGeneration: any[];
//   main: any[];
//   emissionByMaterialConsumptionSuppliers: any[];
//   emissionByPowerConsumption_Vendors: any[];
//   emissionByProducts: any[];
// };
// const EmissionCardBlock = dynamic(
//   () => import("~/components/ghg-dashboard/common/EmissionCardBlock"),
//   {
//     ssr: false,
//   }
// );
// const NavbarFilters = dynamic(
//   () => import("~/components/ghg-dashboard/common/NavbarFilters"),
//   {
//     ssr: false,
//   }
// );
// const EmissionTrendBlock = dynamic(
//   () => import("~/components/ghg-dashboard/total-emissions/EmissionTrendBlock"),
//   {
//     ssr: false,
//   }
// );
// const EmissionByScopeBlock = dynamic(
//   () =>
//     import("~/components/ghg-dashboard/emissionbyscope/EmissionByScopeBlock"),
//   {
//     ssr: false,
//   }
// );

const GhgDashboardMyView = (props: any) => {
  // const [filteredData, setFilteredData] = useState({});
  // const [selectedShowData, setSelectedShowData] = useState<
  //   Array<SelectedShowDataDataType>
  // >([
  //   {
  //     isYearly: false,
  //     isQuarterly: true,
  //     isMonthly: true,
  //     activeState: activeState.isQuarterly,
  //   },
  // ]);
  // const smallDevice = useMediaQuery("(max-width: 768px)");

  // const { data: getorganizationData } = useGetOrgDataQuery();

  // const { current, changeDashboardHandler, setDurationGlobalFilter } =
  //   useDashboardStore((state) => ({
  //     current: state.current,
  //     changeDashboardHandler: state.changeDashboardHandler,
  //     setDurationGlobalFilter: state.setDurationGlobalFilter,
  //   }));

  // useEffect(() => {
  //   if (current) {
  //     window?.parent.postMessage("noLoading", "*");
  //   }
  // }, [current]);

  // const handleChildEvent = (
  //   childMessage: any,
  //   selectedRegion: any,
  //   selectedDuration: any
  // ) => {
  //   let currentYear = new Date().getFullYear();

  //   const criteria = {
  //     region: selectedRegion,
  //     addresses: childMessage,
  //     from_year: current.baseLineYear || 2021,
  //     from_month: 4,
  //     to_year: currentYear,
  //     to_month: 3,
  //     previous_from_year: current.baseLineYear || 2021,
  //     previous_to_year: currentYear,
  //     previous_from_month: 4,
  //     previous_to_month: 3,
  //     baseline_from_year: current.baseLineYear || 2021,
  //     baseline_to_year: new Date().getFullYear(),
  //     baseline_from_month: current.baseLineMonth,
  //     baseline_to_month: new Date().getMonth(),
  //     selectedDuration,
  //     baseline_from_year_current: current.baseLineYear
  //       ? current.baseLineYear
  //       : 2021,
  //     baseline_to_year_current: current.baseLineYear
  //       ? current.baseLineYear + 1
  //       : 2022,
  //     baseline_from_month_current: 4,
  //     baseline_to_month_current: 3,
  //   };

  //   switch (selectedDuration) {
  //     case "threemonths": {
  //       criteria.from_month = ((new Date().getMonth() + 9) % 12) + 1;
  //       criteria.from_year =
  //         new Date().getMonth() > 3
  //           ? new Date().getFullYear()
  //           : new Date().getFullYear() - 1;
  //       criteria.to_year =
  //         new Date().getMonth() < 3
  //           ? criteria.from_year - 1
  //           : criteria.from_year;
  //       criteria.to_month = new Date().getMonth();
  //       criteria.previous_from_year = new Date().getFullYear();
  //       criteria.previous_from_month = new Date().getMonth() + 1;
  //       criteria.previous_to_year = new Date().getFullYear();
  //       criteria.previous_to_month = new Date().getMonth() + 1;
  //       setSelectedShowData([
  //         {
  //           isYearly: false,
  //           isQuarterly: false,
  //           isMonthly: true,
  //           activeState: activeState.isMonthly,
  //         },
  //       ]);
  //       break;
  //     }
  //     case "sixmonths": {
  //       criteria.from_month = ((new Date().getMonth() + 6) % 12) + 1;
  //       criteria.from_year =
  //         new Date().getMonth() > 5
  //           ? new Date().getFullYear()
  //           : new Date().getFullYear() - 1;
  //       criteria.to_year =
  //         criteria.from_month < 5 ? criteria.from_year : criteria.from_year + 1;
  //       criteria.to_month = new Date().getMonth();
  //       criteria.previous_from_year = new Date().getFullYear();
  //       criteria.previous_from_month = new Date().getMonth() + 1;
  //       criteria.previous_to_year = new Date().getFullYear();
  //       criteria.previous_to_month = new Date().getMonth() + 1;
  //       setSelectedShowData([
  //         {
  //           isYearly: false,
  //           isQuarterly: false,
  //           isMonthly: true,
  //           activeState: activeState.isMonthly,
  //         },
  //       ]);
  //       break;
  //     }
  //     case "thisquarter": {
  //       const currentMonth = new Date().getMonth();
  //       const quarterStartMonth = Math.floor(currentMonth / 3) * 3 + 1;
  //       const quarterEndMonth = quarterStartMonth + 2;
  //       criteria.from_year = new Date().getFullYear();
  //       criteria.from_month = quarterStartMonth;
  //       criteria.to_year = criteria.from_year;
  //       criteria.to_month = quarterEndMonth;
  //       criteria.previous_from_year = new Date().getFullYear();
  //       criteria.previous_from_month = new Date().getMonth() + 1;
  //       criteria.previous_to_year = new Date().getFullYear();
  //       criteria.previous_to_month = new Date().getMonth() + 1;
  //       setSelectedShowData([
  //         {
  //           isYearly: false,
  //           isQuarterly: true,
  //           isMonthly: true,
  //           activeState: activeState.isQuarterly,
  //         },
  //       ]);
  //       break;
  //     }
  //     case "thisyear": {
  //       criteria.from_month = 4;
  //       criteria.from_year =
  //         new Date().getMonth() > 3
  //           ? new Date().getFullYear()
  //           : new Date().getFullYear() - 1;
  //       criteria.to_year = criteria.from_year + 1;
  //       criteria.to_month = 3;
  //       criteria.previous_from_year = criteria.from_year - 1;
  //       criteria.previous_from_month = 4;
  //       criteria.previous_to_year = criteria.previous_from_year + 1;
  //       criteria.previous_to_month = 3;
  //       setSelectedShowData([
  //         {
  //           isYearly: true,
  //           isQuarterly: true,
  //           isMonthly: true,
  //           activeState: activeState.isQuarterly,
  //         },
  //       ]);
  //       break;
  //     }
  //     case "lastyear": {
  //       criteria.from_month = 4;
  //       criteria.from_year =
  //         new Date().getMonth() > 3
  //           ? new Date().getFullYear() - 1
  //           : new Date().getFullYear() - 2;
  //       criteria.to_year = criteria.from_year + 1;
  //       criteria.to_month = 3;
  //       criteria.previous_from_year = criteria.from_year - 1;
  //       criteria.previous_from_month = 4;
  //       criteria.previous_to_year = criteria.previous_from_year + 1;
  //       criteria.previous_to_month = 3;
  //       setSelectedShowData([
  //         {
  //           isYearly: true,
  //           isQuarterly: true,
  //           isMonthly: true,
  //           activeState: activeState.isQuarterly,
  //         },
  //       ]);
  //       break;
  //     }
  //     case "baseline": {
  //       // criteria.baseline_from_year = current.baseLineYear;
  //       // criteria.baseline_to_year = current.baseLineYear + 1;
  //       // criteria.baseline_from_month = current.baseLineMonth;
  //       // criteria.baseline_to_month = 4;
  //       criteria.from_year = current.baseLineYear || 2021;
  //       criteria.from_month = current.baseLineMonth || 4;
  //       criteria.to_year = new Date().getFullYear();
  //       criteria.to_month = new Date().getMonth();
  //       criteria.previous_from_year = new Date().getFullYear();
  //       criteria.previous_from_month = new Date().getMonth() + 1;
  //       criteria.previous_to_year = new Date().getFullYear();
  //       criteria.previous_to_month = new Date().getMonth() + 1;
  //       setSelectedShowData([
  //         {
  //           isYearly: false,
  //           isQuarterly: true,
  //           isMonthly: false,
  //           activeState: activeState.isQuarterly,
  //         },
  //       ]);
  //       break;
  //     }
  //     default:
  //       break;
  //   }
  //   getAllKPIData(criteria);
  // };
  // const fetchKPIData = useGetKpiDataLazyQuery()[0];
  // const getAllKPIData = async (criteria: any) => {
  //   let variables = {
  //     organization_id: getorganizationData?.Organization[0]?.id,
  //     address_id: criteria.addresses,
  //     region_id: criteria.region,
  //     from_year: criteria.from_year,
  //     to_year: criteria.to_year,
  //     from_month: criteria.from_month,
  //     to_month: criteria.to_month,
  //     previous_from_year: criteria.previous_from_year,
  //     previous_to_year: criteria.previous_to_year,
  //     previous_from_month: criteria.previous_from_month,
  //     previous_to_month: criteria.previous_to_month,
  //     baseline_from_year: criteria.baseline_from_year,
  //     baseline_to_year: criteria.baseline_to_year,
  //     baseline_from_month: criteria.baseline_from_month,
  //     baseline_to_month: criteria.baseline_to_month,
  //     baseline_from_year_current: criteria.baseline_from_year_current,
  //     baseline_to_year_current: criteria.baseline_to_year_current,
  //     baseline_from_month_current: criteria.baseline_from_month_current,
  //     baseline_to_month_current: criteria.baseline_to_month_current,
  //   };

  //   await fetchKPIData({
  //     variables: variables,
  //   }).then((response: any) => {
  //     let data = {
  //       currentYearData: response?.data?.currentYearKPIMain,
  //       previosYearData: response?.data?.previousYearKPIMain,
  //     };
  //     let prevYear = {
  //       emissionByFuelConsumption:
  //         response?.data?.previousYearKPIEmissionByFuelConsumption,
  //       emissionByMaterialConsumption:
  //         response?.data?.previousYearKPIEmissionByMaterialConsumption,
  //       emissionByPowerConsumption:
  //         response?.data?.previousYearKPIEmissionByPowerConsumption,
  //       emissionByTransportation:
  //         response?.data?.previousYearKPIEmissionByTransportation,
  //       emissionByWasteGeneration:
  //         response?.data?.previousYearKPIEmissionByWasteGeneration,
  //       main: response?.data?.previousYearKPIMain,
  //       emissionByMaterialConsumptionSuppliers:
  //         response?.data?.previousYearKPIEmissionByMaterialConsumptionSuppliers,
  //       emissionByPowerConsumption_Vendors:
  //         response?.data?.previousYearKPIEmissionByPowerConsumption_Vendors,
  //       emissionByProducts: response?.data?.previousYearKPIEmissionByProducts,
  //     };
  //     let currentYear = {
  //       emissionByFuelConsumption:
  //         response?.data?.currentYearKPIEmissionByFuelConsumption,
  //       emissionByMaterialConsumption:
  //         response?.data?.currentYearKPIEmissionByMaterialConsumption,
  //       emissionByPowerConsumption:
  //         response?.data?.currentYearKPIEmissionByPowerConsumption,
  //       emissionByTransportation:
  //         response?.data?.currentYearKPIEmissionByTransportation,
  //       emissionByWasteGeneration:
  //         response?.data?.currentYearKPIEmissionByWasteGeneration,
  //       main: response?.data?.currentYearKPIMain,
  //       emissionByMaterialConsumptionSuppliers:
  //         response?.data?.currentYearKPIEmissionByMaterialConsumptionSuppliers,
  //       emissionByPowerConsumption_Vendors:
  //         response?.data?.currentYearKPIEmissionByPowerConsumption_Vendors,
  //       emissionByProducts: response?.data?.currentYearKPIEmissionByProducts,
  //     };
  //     let baselineKPIMainData = response?.data?.baselineYearKPIMain;
  //     let baseLineCurrentYearKPIMainData =
  //       response?.data?.baselineCurrentYearKPIMain;
  //     let organisationLevelKPIMain = response?.data?.organisationLevelKPIMain;
  //     let previousYearOrganisationLevelKPIMain =
  //       response?.data?.previousYearOrganisationLevelKPIMain;
  //     let organisationLevelKPIEmissionByProducts =
  //       response?.data?.organisationLevelKPIEmissionByProducts;
  //     let previousYearorganisationLevelKPIEmissionByProducts =
  //       response?.data?.previousYearorganisationLevelKPIEmissionByProducts;
  //     let baselineLocationKPIMainData =
  //       response?.data?.baselineLocationKPIMainData;
  //     changeDashboardHandler(
  //       currentYear,
  //       prevYear,
  //       current.baseLineYear,
  //       current.baseLineMonth,
  //       baselineKPIMainData,
  //       baseLineCurrentYearKPIMainData,
  //       organisationLevelKPIMain,
  //       previousYearOrganisationLevelKPIMain,
  //       organisationLevelKPIEmissionByProducts,
  //       previousYearorganisationLevelKPIEmissionByProducts,
  //       baselineLocationKPIMainData
  //     );
  //     setDurationGlobalFilter(criteria?.selectedDuration);
  //     setFilteredData(data);
  //   });
  // };

  // const currentYearData: KPIData = current.currentYear as KPIData;
  // const previousYearData: KPIData = current.previousYear as KPIData;

  // const currentYearData = current.currentYear;
  // const previousYearData = current.previousYear;
  // const organizationCurrentYearData = current.organizationLevelKPIData;
  // const organizationPreviousYearData =
  //   current.previousYearOrganisationLevelKPIMain;

  // const currentValue = organizationCurrentYearData?.reduce(
  //   (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
  //   0
  // );
  // const previousValue = organizationPreviousYearData?.reduce(
  //   (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
  //   0
  // );

  //#region organisation Top Emission Category
  // const topEmissionCategory = (
  //   currentYearData: Record<string, any>[],
  //   previousYearData: Record<string, any>[]
  // ) => {
  //   let currentYearCatValues: Record<string, any>[] = [];
  //   let previousYearCatValues: Record<string, any>[] = [];
  //   currentYearCatValues.push({
  //     name: "Energy",
  //     value: currentYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Energy,
  //       0
  //     ),
  //   });
  //   currentYearCatValues.push({
  //     name: "Waste",
  //     value: currentYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Waste,
  //       0
  //     ),
  //   });
  //   currentYearCatValues.push({
  //     name: "Transport",
  //     value: currentYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Transport,
  //       0
  //     ),
  //   });
  //   currentYearCatValues.push({
  //     name: "Material",
  //     value: currentYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Material,
  //       0
  //     ),
  //   });
  //   currentYearCatValues = currentYearCatValues?.sort((a: any, b: any) =>
  //     a.value > b.value ? -1 : 1
  //   );
  //   previousYearCatValues.push({
  //     name: "Energy",
  //     value: previousYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Energy,
  //       0
  //     ),
  //   });
  //   previousYearCatValues.push({
  //     name: "Waste",
  //     value: previousYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Waste,
  //       0
  //     ),
  //   });
  //   previousYearCatValues.push({
  //     name: "Transport",
  //     value: previousYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Transport,
  //       0
  //     ),
  //   });
  //   previousYearCatValues.push({
  //     name: "Material",
  //     value: previousYearData?.reduce(
  //       (acc: any, ele: any) =>
  //         acc + ele.kpi_em_Cont_TotalEmission_Categories_Material,
  //       0
  //     ),
  //   });
  //   previousYearCatValues = previousYearCatValues?.sort((a: any, b: any) =>
  //     a.value > b.value ? -1 : 1
  //   );
  //   return {
  //     currentYear: currentYearCatValues,
  //     previousYear: previousYearCatValues,
  //   };
  // };
  //#endregion
  // const change =
  //   !!currentValue && !!previousValue && previousValue !== 0
  //     ? ((currentValue - previousValue) * 100) / previousValue
  //     : 0;
  // const orgCategoryData = topEmissionCategory(
  //   organizationCurrentYearData as Record<string, any>[],
  //   organizationPreviousYearData as Record<string, any>[]
  // );
  // const category = {
  //   name: !!orgCategoryData?.currentYear.length
  //     ? orgCategoryData?.currentYear[0].name
  //     : "",
  //   value: !!orgCategoryData?.currentYear.length
  //     ? orgCategoryData?.currentYear[0].value
  //     : 0,
  //   change:
  //     !!orgCategoryData?.currentYear.length &&
  //     !!orgCategoryData?.previousYear.length &&
  //     orgCategoryData?.previousYear[0]?.value > 0
  //       ? ((orgCategoryData?.currentYear[0].value -
  //           orgCategoryData?.previousYear[0]?.value) *
  //           100) /
  //         orgCategoryData?.previousYear[0]?.value
  //       : 0,
  // };

  // const highestEmProduct = (
  //   currentYearData: Record<string, any>[],
  //   previousYearData: Record<string, any>[],
  //   emissionValue: number
  // ) => {
  //   let currentYearProductEmissionData: Record<string, any>[] = [];
  //   let previousYearproductEmissionData: Record<string, any>[] = [];
  //   if (!!currentYearData && !!currentYearData.length) {
  //     const currentYearProductData = _(currentYearData)
  //       .groupBy((item) => `${item.product_id}_${item.product_name}`)
  //       .map((items, key) => {
  //         const [product_id, product_name] = key.split("_");
  //         return {
  //           product_id,
  //           product_name,
  //           total_kpi_weight: _.sumBy(items, "kpi_weight") / 1000,
  //         };
  //       })
  //       .orderBy("total_kpi_weight", "desc")
  //       .value();
  //     const totalWeight = currentYearProductData?.reduce(
  //       (acc: any, ele: any) => acc + ele.total_kpi_weight,
  //       0
  //     );
  //     currentYearProductEmissionData.push({
  //       product_name: currentYearProductData[0]?.product_name,
  //       emission:
  //         emissionValue *
  //         (currentYearProductData[0]?.total_kpi_weight / totalWeight),
  //     });
  //   }
  //   if (!!previousYearData && !!previousYearData.length) {
  //     const previousYearproductData = _(previousYearData)
  //       .groupBy((item) => `${item.product_id}_${item.product_name}`)
  //       .map((items, key) => {
  //         const [product_id, product_name] = key.split("_");
  //         return {
  //           product_id,
  //           product_name,
  //           total_kpi_weight: _.sumBy(items, "kpi_weight") / 1000,
  //         };
  //       })
  //       .orderBy("total_kpi_weight", "desc")
  //       .value();
  //     const totalWeight = previousYearproductData?.reduce(
  //       (acc: any, ele: any) => acc + ele.total_kpi_weight,
  //       0
  //     );
  //     previousYearproductEmissionData.push({
  //       product_name: previousYearproductData[0]?.product_name,
  //       emission:
  //         emissionValue *
  //         (previousYearproductData[0]?.total_kpi_weight / totalWeight),
  //     });
  //   }
  //   return {
  //     currentYearData: currentYearProductEmissionData,
  //     previousYearData: previousYearproductEmissionData,
  //   };
  // };
  // const productData = highestEmProduct(
  //   current?.organisationLevelKPIEmissionByProducts as Record<string, any>[],
  //   current?.previousYearorganisationLevelKPIEmissionByProducts as Record<
  //     string,
  //     any
  //   >[],
  //   currentValue
  // );
  // const product = {
  //   name:
  //     !!productData && !!productData.currentYearData.length
  //       ? productData.currentYearData[0]?.product_name
  //       : "",
  //   value:
  //     !!productData && !!productData.currentYearData.length
  //       ? productData.currentYearData[0]?.emission
  //       : 0,
  //   change:
  //     !!productData &&
  //     !!productData.currentYearData.length &&
  //     !!productData &&
  //     !!productData.previousYearData.length &&
  //     productData.previousYearData[0]?.emission > 0
  //       ? ((productData.currentYearData[0]?.emission -
  //           productData.previousYearData[0]?.emission) *
  //           100) /
  //         productData.previousYearData[0]?.emission
  //       : 0,
  // };
  // const highestEmLocation = (
  //   currentYearData: Record<string, any>[],
  //   previousYearData: Record<string, any>[]
  // ) => {
  //   const currentYearlocationWiseEmissionData: Record<string, any>[] = [];
  //   const previousYearlocationWiseEmissionData: Record<string, any>[] = [];
  //   if (!!currentYearData && !!currentYearData.length) {
  //     const currentYearUniqueAddressId = currentYearData
  //       .map((items) => items.address_id)
  //       .filter(
  //         (item, index, self) => index === self.findIndex((t) => t === item)
  //       );
  //     currentYearUniqueAddressId.forEach((addressData) => {
  //       const currentLocation = currentYearData.filter(
  //         (items) => items.address_id == addressData
  //       );
  //       currentYearlocationWiseEmissionData.push({
  //         name: currentLocation[0]?.OrganizationAddress?.Address?.name,
  //         emission: currentLocation?.reduce(
  //           (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
  //           0
  //         ),
  //       });
  //     });
  //   }
  //   if (!!previousYearData && !!previousYearData.length) {
  //     const previousYearUniqueAddressId = previousYearData
  //       .map((items) => items.address_id)
  //       .filter(
  //         (item, index, self) => index === self.findIndex((t) => t === item)
  //       );
  //     previousYearUniqueAddressId.forEach((addressData) => {
  //       const currentLocation = previousYearData.filter(
  //         (items) => items.address_id == addressData
  //       );
  //       previousYearlocationWiseEmissionData.push({
  //         name: currentLocation[0]?.OrganizationAddress?.Address?.name,
  //         emission: currentLocation?.reduce(
  //           (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
  //           0
  //         ),
  //       });
  //     });
  //   }
  //   return {
  //     currentYearData: currentYearlocationWiseEmissionData?.sort(
  //       (a: any, b: any) => (a.emission > b.emission ? -1 : 1)
  //     ),
  //     previousYearData: previousYearlocationWiseEmissionData?.sort(
  //       (a: any, b: any) => (a.emission > b.emission ? -1 : 1)
  //     ),
  //   };
  // };
  // const topEmissionLocation = highestEmLocation(
  //   organizationCurrentYearData as Record<string, any>[],
  //   organizationPreviousYearData as Record<string, any>[]
  // );
  // const location = {
  //   name: !!topEmissionLocation?.currentYearData.length
  //     ? topEmissionLocation?.currentYearData[0]?.name
  //     : "",
  //   value: !!topEmissionLocation?.currentYearData.length
  //     ? topEmissionLocation?.currentYearData[0]?.emission
  //     : 0,
  //   change:
  //     !!topEmissionLocation?.currentYearData.length &&
  //     !!topEmissionLocation?.currentYearData.length &&
  //     topEmissionLocation?.previousYearData[0]?.emission > 0
  //       ? ((topEmissionLocation?.currentYearData[0]?.emission -
  //           topEmissionLocation?.previousYearData[0]?.emission) *
  //           100) /
  //         topEmissionLocation?.previousYearData[0]?.emission
  //       : 0,
  // };

  // const organizationLevelData: emissionCardBlockProps = {
  //   scopeEmission: [
  //     {
  //       value: currentValue,
  //       change: change,
  //       category,
  //       product,
  //       location,
  //     },
  //   ],
  //   productName: product?.name ?? "",
  //   productArea: location?.name ?? "",
  //   categoryName: category?.name ?? "",
  // };
  //-------------------------------------------Location Level Starts--------------------

  // const LcurrentValue = currentYearData?.main?.reduce(
  //   (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
  //   0
  // );
  // const LpreviousValue = previousYearData?.main?.reduce(
  //   (acc: any, ele: any) => acc + ele.kpi_em_Total_Emission,
  //   0
  // );
  // const Lchange =
  //   !!LcurrentValue && !!LpreviousValue && LpreviousValue !== 0
  //     ? ((LcurrentValue - LpreviousValue) * 100) / LpreviousValue
  //     : undefined;
  // const LCategoryData = topEmissionCategory(
  //   currentYearData?.main as Record<string, any>[],
  //   previousYearData?.main as Record<string, any>[]
  // );
  // const Lcategory = {
  //   name: !!LCategoryData?.currentYear.length
  //     ? LCategoryData?.currentYear[0].name
  //     : "",
  //   value: !!LCategoryData?.currentYear.length
  //     ? LCategoryData?.currentYear[0].value
  //     : 0,
  //   change:
  //     !!LCategoryData?.currentYear.length &&
  //     !!LCategoryData?.previousYear.length &&
  //     LCategoryData?.previousYear[0]?.value > 0
  //       ? ((LCategoryData?.currentYear[0].value -
  //           LCategoryData?.previousYear.filter(
  //             (items) => items.name == LCategoryData?.currentYear[0].name
  //           )[0]?.value) *
  //           100) /
  //         LCategoryData?.previousYear[0]?.value
  //       : 0,
  // };
  // const LproductData = highestEmProduct(
  //   currentYearData?.emissionByProducts,
  //   previousYearData?.emissionByProducts,
  //   LcurrentValue
  // );
  // const Lproduct = {
  //   name:
  //     !!LproductData && !!LproductData.currentYearData.length
  //       ? LproductData.currentYearData[0]?.product_name
  //       : "",
  //   value:
  //     !!LproductData && !!LproductData.currentYearData.length
  //       ? LproductData.currentYearData[0]?.emission
  //       : 0,
  //   change:
  //     !!LproductData &&
  //     !!LproductData.currentYearData.length &&
  //     !!LproductData &&
  //     !!LproductData.previousYearData.length &&
  //     LproductData.previousYearData[0]?.emission > 0
  //       ? ((LproductData.currentYearData[0]?.emission -
  //           LproductData.previousYearData[0]?.emission) *
  //           100) /
  //         LproductData.previousYearData[0]?.emission
  //       : 0,
  // };
  // const locationtopEmissionLocation = highestEmLocation(
  //   currentYearData?.main as Record<string, any>[],
  //   previousYearData?.main as Record<string, any>[]
  // );

  // const Llocation = {
  //   name: !!locationtopEmissionLocation?.currentYearData.length
  //     ? locationtopEmissionLocation?.currentYearData[0]?.name
  //     : "",
  //   value: !!locationtopEmissionLocation?.currentYearData.length
  //     ? locationtopEmissionLocation?.currentYearData[0]?.emission
  //     : 0,
  //   change:
  //     !!locationtopEmissionLocation?.currentYearData.length &&
  //     !!locationtopEmissionLocation?.currentYearData.length &&
  //     locationtopEmissionLocation?.previousYearData[0]?.emission > 0
  //       ? ((locationtopEmissionLocation?.currentYearData[0]?.emission -
  //           locationtopEmissionLocation?.previousYearData[0]?.emission) *
  //           100) /
  //         locationtopEmissionLocation?.previousYearData[0]?.emission
  //       : 0,
  // };

  // const locationLevelData: emissionCardBlockProps = {
  //   snapshotType: "myview",
  //   scopeEmission: [
  //     {
  //       value: LcurrentValue,
  //       change: Lchange,
  //       category: Lcategory,
  //       product: Lproduct,
  //       location: Llocation,
  //     },
  //   ],
  //   productName: Lproduct?.name ?? "",
  //   productArea: Llocation?.name ?? "",
  //   categoryName: Lcategory?.name ?? "",
  // };
  // const { main: mainArray } = currentYearData || {};
  // const [main] = mainArray || [];
  // const { kpi_em_uom: unit = "tco2e" } = main || {};
  return (
    <>
      <SnapshotMyView />
      {/* <EmissionCardBlock
        data={organizationLevelData}
        unit={unit}
        forlocation={false}
      />

      <Container px="md" fluid>
        <Text
          fz={{ base: 14, xl: 16 }}
          c="#000000"
          fw={700}
          pos={smallDevice ? "relative" : "absolute"}
          mt={20}
        >
          GHG Emission Snapshot - My View
        </Text>
        <Box
          style={{
            position: smallDevice ? "relative" : "sticky",
            zIndex: smallDevice ? 99 : 9999,
            top: smallDevice ? "0px" : "10px",
            float: smallDevice ? "left" : "right",
          }}
        >
          <NavbarFilters handleSelectedShowData={handleSelectedShowData} />
        </Box>
      </Container>
      <Container px="md" fluid>
        <EmissionCardBlock
          data={locationLevelData}
          unit={unit}
          forlocation={true}
        />
        <EmissionTrendBlock
          selectedShowData={selectedShowData}
          // filteredDataofTotalEmission={(filteredData as any)?.totalEmission}
        />
        <EmissionByScopeBlock
          selectedShowData={selectedShowData}
          scopeData={filteredData}
        />
      </Container> */}
    </>
  );
};
export default GhgDashboardMyView;
