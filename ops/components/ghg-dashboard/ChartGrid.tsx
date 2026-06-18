// "use client";
// import {
//   ActionIcon,
//   AppShell,
//   Box,
//   Burger,
//   Card,
//   Container,
//   Divider,
//   Flex,
//   Grid,
//   Group,
//   LoadingOverlay,
//   Text,
// } from "@mantine/core";
// import { useDisclosure, useMediaQuery } from "@mantine/hooks";
// import html2canvas from "html2canvas";
// import { useEffect, useRef, useState } from "react";
// import { ShowDataValue } from "~/lib/shared/constants/ghgdashboard.constant";
// import DownloadIcon from "../icons/DownloadIcon";
// import GreenBullet from "../icons/GreenBullet";
// import RangeIcon from "../icons/RangeIcon";
// import Sidebar from "./Sidebar";
// import EmissionCardBlock from "./common/EmissionCardBlock";
// import NavbarFilters from "./common/NavbarFilters";
// import CriticalFactorsBlock from "./critical-factors/CriticalFactorsBlock";
// import EmissionContributorsBlock from "./emission-contributors/EmissionContributorsBlock";
// import TotalEmissionProductsTable from "./emission-contributors/TotalEmissionByProductsTable";
// import EmissionIntensityInsightBlock from "./emission-intensity-insights/EmissionIntensityInsightBlock";
// import MapChartLocationBlock from "./emission-location-map/MapChartLocationBlock";
// import EmissionByScopeBlock from "./emissionbyscope/EmissionByScopeBlock";
// import EmissionTrendBlock from "./total-emissions/EmissionTrendBlock";
// interface SelectedShowDataDataType {
//   isYearly: boolean;
//   isQuarterly: boolean;
//   isMonthly: boolean;
// }

// const data = [
//   {
//     "2022-23": {
//       Maharashtra: {
//         Mumbai: {
//           organization_id: 1,
//           region_id: 101,
//           address_id: 1001,
//           month: 1,
//           year: 2023,
//           timestamp: "2023-05-28T12:34:56Z",
//           kpi_em_uom: "kgCO2e",
//           kpi_em_Total_Emission: 5000,
//           kpi_em_Total_Emission_Scope1: 2000,
//           kpi_em_Total_Emission_Scope2: 1500,
//           kpi_em_Total_Emission_Scope3: 1500,
//           kpi_em_TopEmission_Category: { name: "Transport", value: "1234" },
//           kpi_em_TopEmission_Product: { name: "Dabur Honey", value: "100" },
//           kpi_em_CurrentEmissionIntensity_PerTonProduction: 50,
//           kpi_em_CurrentEmissionIntensity_PerEmployee: 5,
//           kpi_em_CurrentEmissionIntensity_PerProduct: 10,
//           metadata: {},
//         },
//         Mandi: {
//           organization_id: 2,
//           region_id: 102,
//           address_id: 1002,
//           month: 2,
//           year: 2023,
//           timestamp: "2023-05-28T12:34:56Z",
//           kpi_em_uom: "kgCO2e",
//           kpi_em_Total_Emission: 10000,
//           kpi_em_Total_Emission_Scope1: 1500,
//           kpi_em_Total_Emission_Scope2: 1200,
//           kpi_em_Total_Emission_Scope3: 1300,
//           kpi_em_TopEmission_Category: { name: "Transport", value: "1234" },
//           kpi_em_TopEmission_Product: { name: "Dabur Honey", value: "5000" },
//           kpi_em_CurrentEmissionIntensity_PerTonProduction: 40,
//           kpi_em_CurrentEmissionIntensity_PerEmployee: 4,
//           kpi_em_CurrentEmissionIntensity_PerProduct: 8,
//           metadata: "Data for Pune, Maharashtra",
//         },
//         Dehradun: {
//           organization_id: 2,
//           region_id: 102,
//           address_id: 1002,
//           month: 2,
//           year: 2023,
//           timestamp: "2023-05-28T12:34:56Z",
//           kpi_em_uom: "kgCO2e",
//           kpi_em_Total_Emission: 10030,
//           kpi_em_Total_Emission_Scope1: 130,
//           kpi_em_Total_Emission_Scope2: 12000,
//           kpi_em_Total_Emission_Scope3: 15300,
//           kpi_em_TopEmission_Category: { name: "Transport", value: "3098" },
//           kpi_em_TopEmission_Product: { name: "Dabur Honey", value: "7000" },
//           kpi_em_CurrentEmissionIntensity_PerTonProduction: 40,
//           kpi_em_CurrentEmissionIntensity_PerEmployee: 4,
//           kpi_em_CurrentEmissionIntensity_PerProduct: 8,
//           metadata: "Data for Pune, Maharashtra",
//         },
//       },
//     },
//     "2023-24": {
//       Maharashtra: {
//         Mumbai: {
//           organization_id: 1,
//           region_id: 101,
//           address_id: 1001,
//           month: 1,
//           year: 2023,
//           timestamp: "2023-05-28T12:34:56Z",
//           kpi_em_uom: "kgCO2e",
//           kpi_em_Total_Emission: 5000,
//           kpi_em_Total_Emission_Scope1: 2000,
//           kpi_em_Total_Emission_Scope2: 1500,
//           kpi_em_Total_Emission_Scope3: 1500,
//           kpi_em_TopEmission_Category: { name: "Transport", value: "1234" },
//           kpi_em_TopEmission_Product: { name: "Dabur Honey", value: "100" },
//           kpi_em_CurrentEmissionIntensity_PerTonProduction: 50,
//           kpi_em_CurrentEmissionIntensity_PerEmployee: 5,
//           kpi_em_CurrentEmissionIntensity_PerProduct: 10,
//           metadata: {},
//         },
//         Mandi: {
//           organization_id: 2,
//           region_id: 102,
//           address_id: 1002,
//           month: 2,
//           year: 2023,
//           timestamp: "2023-05-28T12:34:56Z",
//           kpi_em_uom: "kgCO2e",
//           kpi_em_Total_Emission: 10000,
//           kpi_em_Total_Emission_Scope1: 1500,
//           kpi_em_Total_Emission_Scope2: 1200,
//           kpi_em_Total_Emission_Scope3: 1300,
//           kpi_em_TopEmission_Category: { name: "Transport", value: "1234" },
//           kpi_em_TopEmission_Product: { name: "Dabur Honey", value: "5000" },
//           kpi_em_CurrentEmissionIntensity_PerTonProduction: 40,
//           kpi_em_CurrentEmissionIntensity_PerEmployee: 4,
//           kpi_em_CurrentEmissionIntensity_PerProduct: 8,
//           metadata: "Data for Pune, Maharashtra",
//         },
//         Dehradun: {
//           organization_id: 2,
//           region_id: 102,
//           address_id: 1002,
//           month: 2,
//           year: 2023,
//           timestamp: "2023-05-28T12:34:56Z",
//           kpi_em_uom: "kgCO2e",
//           kpi_em_Total_Emission: 10030,
//           kpi_em_Total_Emission_Scope1: 130,
//           kpi_em_Total_Emission_Scope2: 12000,
//           kpi_em_Total_Emission_Scope3: 15300,
//           kpi_em_TopEmission_Category: { name: "Transport", value: "3098" },
//           kpi_em_TopEmission_Product: { name: "Dabur Honey", value: "7000" },
//           kpi_em_CurrentEmissionIntensity_PerTonProduction: 40,
//           kpi_em_CurrentEmissionIntensity_PerEmployee: 4,
//           kpi_em_CurrentEmissionIntensity_PerProduct: 8,
//           metadata: "Data for Pune, Maharashtra",
//         },
//       },
//     },
//   },
// ];
// function ChartGrid() {
//   const [filteredData, setFilteredData] = useState({});
//   const [fullData, setFullData] = useState({});
//   const [opened, { toggle }] = useDisclosure();
//   const [lastUpdated, setLastUpdated] = useState(new Date());
//   const [isDownload, setIsDownload] = useState<boolean>(false);
//   const [selectedShowData, setSelectedShowData] = useState<
//     Array<SelectedShowDataDataType>
//   >([{ isYearly: false, isQuarterly: true, isMonthly: true }]);
//   const formatDate = (date: any) => {
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       year: "numeric",
//     });
//   };
//   // const filterObject = (datas: any, criteria: any) => {
//   //   console.log(datas, criteria, "datas,criteria");

//   //   let maxTotalEmission = 0;
//   //   let totalEmission = 0;
//   //   let totalEmissionCity = "";
//   //   let maxTopEmissionCategoryValue = 0;
//   //   let totalTopEmissionProductValue = 0;
//   //   let kpi_em_Total_Emission_Scope1 = 0;
//   //   let kpi_em_Total_Emission_Scope2 = 0;
//   //   let kpi_em_Total_Emission_Scope3 = 0;

//   //   for (const item of datas) {
//   //     if (
//   //       item[criteria.yearRange] &&
//   //       item[criteria.yearRange][criteria.state]
//   //     ) {
//   //       const stateData = item[criteria.yearRange][criteria.state];
//   //       for (const city of criteria.cities) {
//   //         const cityData = stateData[city];
//   //         if (cityData) {
//   //           totalEmission += cityData.kpi_em_Total_Emission;
//   //           kpi_em_Total_Emission_Scope1 +=
//   //             cityData.kpi_em_Total_Emission_Scope1;
//   //           kpi_em_Total_Emission_Scope2 +=
//   //             cityData.kpi_em_Total_Emission_Scope2;
//   //           kpi_em_Total_Emission_Scope3 +=
//   //             cityData.kpi_em_Total_Emission_Scope3;

//   //           if (cityData.kpi_em_Total_Emission > maxTotalEmission) {
//   //             maxTotalEmission = cityData.kpi_em_Total_Emission;
//   //             totalEmissionCity = city;
//   //           }

//   //           const topEmissionCategoryValue = parseInt(
//   //             cityData.kpi_em_TopEmission_Category.value
//   //           );
//   //           if (topEmissionCategoryValue > maxTopEmissionCategoryValue) {
//   //             maxTopEmissionCategoryValue =
//   //               cityData.kpi_em_TopEmission_Category;
//   //           }

//   //           const topEmissionProductValue = parseInt(
//   //             cityData.kpi_em_TopEmission_Product.value
//   //           );
//   //           if (topEmissionProductValue > totalTopEmissionProductValue) {
//   //             totalTopEmissionProductValue =
//   //               cityData.kpi_em_TopEmission_Product;
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }

//   //   let tempansDataJson = {
//   //     maxTotalEmission,
//   //     totalEmission,
//   //     totalEmissionCity,
//   //     maxTopEmissionCategoryValue,
//   //     totalTopEmissionProductValue,
//   //     kpi_em_Total_Emission_Scope1,
//   //     kpi_em_Total_Emission_Scope2,
//   //     kpi_em_Total_Emission_Scope3,
//   //   };

//   //   return tempansDataJson;
//   //   // setFilteredData(tempansDataJson);
//   //   // console.log(filteredData, "ffffff");
//   // };

//   // Example usage:

//   // const filterObject = (datas: any, criteria: any) => {
//   //   let maxTotalEmission = 0;
//   //   let totalEmission = 0;
//   //   let totalEmissionCity = "";
//   //   let maxTopEmissionCategoryValue = 0;
//   //   let totalTopEmissionProductValue = 0;
//   //   let kpi_em_Total_Emission_Scope1 = 0;
//   //   let kpi_em_Total_Emission_Scope2 = 0;
//   //   let kpi_em_Total_Emission_Scope3 = 0;

//   //   // Variables to store data from 2022-2023 for comparison
//   //   let prevMaxTotalEmission = 0;
//   //   let prevTotalEmission = 0;
//   //   let prevTotalEmissionCity = "";
//   //   let prevMaxTopEmissionCategoryValue = 0;
//   //   let prevTotalTopEmissionProductValue = 0;
//   //   let prevKpi_em_Total_Emission_Scope1 = 0;
//   //   let prevKpi_em_Total_Emission_Scope2 = 0;
//   //   let prevKpi_em_Total_Emission_Scope3 = 0;

//   //   for (const item of datas) {
//   //     if (item["2022-23"] && item["2022-23"][criteria.state]) {
//   //       const stateData = item["2022-23"][criteria.state];
//   //       for (const city of criteria.cities) {
//   //         const cityData = stateData[city];
//   //         if (cityData) {
//   //           prevTotalEmission += cityData.kpi_em_Total_Emission;
//   //           prevKpi_em_Total_Emission_Scope1 +=
//   //             cityData.kpi_em_Total_Emission_Scope1;
//   //           prevKpi_em_Total_Emission_Scope2 +=
//   //             cityData.kpi_em_Total_Emission_Scope2;
//   //           prevKpi_em_Total_Emission_Scope3 +=
//   //             cityData.kpi_em_Total_Emission_Scope3;

//   //           if (cityData.kpi_em_Total_Emission > prevMaxTotalEmission) {
//   //             prevMaxTotalEmission = cityData.kpi_em_Total_Emission;
//   //             prevTotalEmissionCity = city;
//   //           }

//   //           const topEmissionCategoryValue = parseInt(
//   //             cityData.kpi_em_TopEmission_Category.value
//   //           );
//   //           if (topEmissionCategoryValue > prevMaxTopEmissionCategoryValue) {
//   //             prevMaxTopEmissionCategoryValue =
//   //               cityData.kpi_em_TopEmission_Category;
//   //           }

//   //           const topEmissionProductValue = parseInt(
//   //             cityData.kpi_em_TopEmission_Product.value
//   //           );
//   //           if (topEmissionProductValue > prevTotalTopEmissionProductValue) {
//   //             prevTotalTopEmissionProductValue =
//   //               cityData.kpi_em_TopEmission_Product;
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }

//   //   for (const item of datas) {
//   //     if (
//   //       item[criteria.yearRange] &&
//   //       item[criteria.yearRange][criteria.state]
//   //     ) {
//   //       const stateData = item[criteria.yearRange][criteria.state];
//   //       for (const city of criteria.cities) {
//   //         const cityData = stateData[city];
//   //         if (cityData) {
//   //           totalEmission += cityData.kpi_em_Total_Emission;
//   //           kpi_em_Total_Emission_Scope1 +=
//   //             cityData.kpi_em_Total_Emission_Scope1;
//   //           kpi_em_Total_Emission_Scope2 +=
//   //             cityData.kpi_em_Total_Emission_Scope2;
//   //           kpi_em_Total_Emission_Scope3 +=
//   //             cityData.kpi_em_Total_Emission_Scope3;

//   //           if (cityData.kpi_em_Total_Emission > maxTotalEmission) {
//   //             maxTotalEmission = cityData.kpi_em_Total_Emission;
//   //             totalEmissionCity = city;
//   //           }

//   //           const topEmissionCategoryValue = parseInt(
//   //             cityData.kpi_em_TopEmission_Category.value
//   //           );
//   //           if (topEmissionCategoryValue > maxTopEmissionCategoryValue) {
//   //             maxTopEmissionCategoryValue =
//   //               cityData.kpi_em_TopEmission_Category;
//   //           }

//   //           const topEmissionProductValue = parseInt(
//   //             cityData.kpi_em_TopEmission_Product.value
//   //           );
//   //           if (topEmissionProductValue > totalTopEmissionProductValue) {
//   //             totalTopEmissionProductValue =
//   //               cityData.kpi_em_TopEmission_Product;
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }

//   //   // Calculate percentage changes
//   //   const calculatePercentageChange = (newValue: number, prevValue: number) => {
//   //     return ((newValue - prevValue) / prevValue) * 100;
//   //   };

//   //   let tempansDataJson = {
//   //     maxTotalEmission,
//   //     totalEmission,
//   //     totalEmissionCity,
//   //     maxTopEmissionCategoryValue,
//   //     totalTopEmissionProductValue,
//   //     kpi_em_Total_Emission_Scope1,
//   //     kpi_em_Total_Emission_Scope2,
//   //     kpi_em_Total_Emission_Scope3,
//   //     percentageChangeMaxTotalEmission: calculatePercentageChange(
//   //       maxTotalEmission,
//   //       prevMaxTotalEmission
//   //     ),
//   //     percentageChangeTotalEmission: calculatePercentageChange(
//   //       totalEmission,
//   //       prevTotalEmission
//   //     ),
//   //     percentageChangeTopEmissionCategoryValue: calculatePercentageChange(
//   //       maxTopEmissionCategoryValue,
//   //       prevMaxTopEmissionCategoryValue
//   //     ),
//   //     percentageChangeTotalTopEmissionProductValue: calculatePercentageChange(
//   //       totalTopEmissionProductValue,
//   //       prevTotalTopEmissionProductValue
//   //     ),
//   //     percentageChangeKpi_em_Total_Emission_Scope1: calculatePercentageChange(
//   //       kpi_em_Total_Emission_Scope1,
//   //       prevKpi_em_Total_Emission_Scope1
//   //     ),
//   //     percentageChangeKpi_em_Total_Emission_Scope2: calculatePercentageChange(
//   //       kpi_em_Total_Emission_Scope2,
//   //       prevKpi_em_Total_Emission_Scope2
//   //     ),
//   //     percentageChangeKpi_em_Total_Emission_Scope3: calculatePercentageChange(
//   //       kpi_em_Total_Emission_Scope3,
//   //       prevKpi_em_Total_Emission_Scope3
//   //     ),
//   //   };
//   //   console.log(tempansDataJson, "checking the data with last compare data");
//   //   return tempansDataJson;
//   // };

//   const filterObject = (datas: any, criteria: any) => {
//     let maxTotalEmission = 0;
//     let totalEmission = 0;
//     let totalEmissionCity = "";
//     let maxTopEmissionCategoryValue = 0;
//     let totalTopEmissionProductValue = 0;
//     let kpi_em_Total_Emission_Scope1 = 0;
//     let kpi_em_Total_Emission_Scope2 = 0;
//     let kpi_em_Total_Emission_Scope3 = 0;

//     // Variables to store data from 2022-2023 for comparison
//     let prevMaxTotalEmission = 0;
//     let prevTotalEmission = 0;
//     let prevTotalEmissionCity = "";
//     let prevMaxTopEmissionCategoryValue = 0;
//     let prevTotalTopEmissionProductValue = 0;
//     let prevKpi_em_Total_Emission_Scope1 = 0;
//     let prevKpi_em_Total_Emission_Scope2 = 0;
//     let prevKpi_em_Total_Emission_Scope3 = 0;

//     for (const item of datas) {
//       if (item["2022-23"] && item["2022-23"][criteria.state]) {
//         const stateData = item["2022-23"][criteria.state];
//         for (const city of criteria.cities) {
//           const cityData = stateData[city];
//           if (cityData) {
//             prevTotalEmission += cityData.kpi_em_Total_Emission;
//             prevKpi_em_Total_Emission_Scope1 +=
//               cityData.kpi_em_Total_Emission_Scope1;
//             prevKpi_em_Total_Emission_Scope2 +=
//               cityData.kpi_em_Total_Emission_Scope2;
//             prevKpi_em_Total_Emission_Scope3 +=
//               cityData.kpi_em_Total_Emission_Scope3;

//             if (cityData.kpi_em_Total_Emission > prevMaxTotalEmission) {
//               prevMaxTotalEmission = cityData.kpi_em_Total_Emission;
//               prevTotalEmissionCity = city;
//             }

//             const topEmissionCategoryValue = parseInt(
//               cityData.kpi_em_TopEmission_Category.value
//             );
//             if (topEmissionCategoryValue > prevMaxTopEmissionCategoryValue) {
//               prevMaxTopEmissionCategoryValue =
//                 cityData.kpi_em_TopEmission_Category;
//             }

//             const topEmissionProductValue = parseInt(
//               cityData.kpi_em_TopEmission_Product.value
//             );
//             if (topEmissionProductValue > prevTotalTopEmissionProductValue) {
//               prevTotalTopEmissionProductValue =
//                 cityData.kpi_em_TopEmission_Product;
//             }
//           }
//         }
//       }
//     }

//     for (const item of datas) {
//       if (
//         item[criteria.yearRange] &&
//         item[criteria.yearRange][criteria.state]
//       ) {
//         const stateData = item[criteria.yearRange][criteria.state];
//         for (const city of criteria.cities) {
//           const cityData = stateData[city];
//           if (cityData) {
//             totalEmission += cityData.kpi_em_Total_Emission;
//             kpi_em_Total_Emission_Scope1 +=
//               cityData.kpi_em_Total_Emission_Scope1;
//             kpi_em_Total_Emission_Scope2 +=
//               cityData.kpi_em_Total_Emission_Scope2;
//             kpi_em_Total_Emission_Scope3 +=
//               cityData.kpi_em_Total_Emission_Scope3;

//             if (cityData.kpi_em_Total_Emission > maxTotalEmission) {
//               maxTotalEmission = cityData.kpi_em_Total_Emission;
//               totalEmissionCity = city;
//             }

//             const topEmissionCategoryValue = parseInt(
//               cityData.kpi_em_TopEmission_Category.value
//             );
//             if (topEmissionCategoryValue > maxTopEmissionCategoryValue) {
//               maxTopEmissionCategoryValue =
//                 cityData.kpi_em_TopEmission_Category;
//             }

//             const topEmissionProductValue = parseInt(
//               cityData.kpi_em_TopEmission_Product.value
//             );
//             if (topEmissionProductValue > totalTopEmissionProductValue) {
//               totalTopEmissionProductValue =
//                 cityData.kpi_em_TopEmission_Product;
//             }
//           }
//         }
//       }
//     }

//     const calculatePercentageChange = (newValue: number, prevValue: number) => {
//       if (prevValue === 0) {
//         return newValue === 0 ? 0 : 100;
//       }
//       return ((newValue - prevValue) / prevValue) * 100;
//     };

//     let tempansDataJson = {
//       maxTotalEmission,
//       totalEmission,
//       totalEmissionCity,
//       maxTopEmissionCategoryValue,
//       totalTopEmissionProductValue,
//       kpi_em_Total_Emission_Scope1,
//       kpi_em_Total_Emission_Scope2,
//       kpi_em_Total_Emission_Scope3,
//       percentageChangeMaxTotalEmission: calculatePercentageChange(
//         maxTotalEmission,
//         prevMaxTotalEmission
//       ),
//       percentageChangeTotalEmission: calculatePercentageChange(
//         totalEmission,
//         prevTotalEmission
//       ),
//       percentageChangeTopEmissionCategoryValue: calculatePercentageChange(
//         maxTopEmissionCategoryValue,
//         prevMaxTopEmissionCategoryValue
//       ),
//       percentageChangeTotalTopEmissionProductValue: calculatePercentageChange(
//         totalTopEmissionProductValue,
//         prevTotalTopEmissionProductValue
//       ),
//       percentageChangeKpi_em_Total_Emission_Scope1: calculatePercentageChange(
//         kpi_em_Total_Emission_Scope1,
//         prevKpi_em_Total_Emission_Scope1
//       ),
//       percentageChangeKpi_em_Total_Emission_Scope2: calculatePercentageChange(
//         kpi_em_Total_Emission_Scope2,
//         prevKpi_em_Total_Emission_Scope2
//       ),
//       percentageChangeKpi_em_Total_Emission_Scope3: calculatePercentageChange(
//         kpi_em_Total_Emission_Scope3,
//         prevKpi_em_Total_Emission_Scope3
//       ),
//     };

//     console.log(tempansDataJson, "checmingthedatawithlastyear");
//     return tempansDataJson;
//   };

//   const FullfilterObject = (datas: any) => {
//     let maxTotalEmission = 0;
//     let totalEmission = 0;
//     let totalEmissionCity = "";
//     let maxTopEmissionCategory = { name: "", value: 0 };
//     let maxTopEmissionProduct = { name: "", value: 0 };
//     let kpi_em_Total_Emission_Scope1 = 0;
//     let kpi_em_Total_Emission_Scope2 = 0;
//     let kpi_em_Total_Emission_Scope3 = 0;
//     let prevMaxTotalEmission = 0;
//     let prevTotalEmission = 0;
//     let prevTotalEmissionCity = "";
//     let prevMaxTopEmissionCategory = { name: "", value: 0 };
//     let prevMaxTopEmissionProduct = { name: "", value: 0 };
//     let prevKpi_em_Total_Emission_Scope1 = 0;
//     let prevKpi_em_Total_Emission_Scope2 = 0;
//     let prevKpi_em_Total_Emission_Scope3 = 0;

//     const compareData = (data: any, isPrevious: any) => {
//       for (const state in data) {
//         for (const city in data[state]) {
//           const cityData = data[state][city];
//           totalEmission += cityData.kpi_em_Total_Emission;
//           kpi_em_Total_Emission_Scope1 += cityData.kpi_em_Total_Emission_Scope1;
//           kpi_em_Total_Emission_Scope2 += cityData.kpi_em_Total_Emission_Scope2;
//           kpi_em_Total_Emission_Scope3 += cityData.kpi_em_Total_Emission_Scope3;

//           if (cityData.kpi_em_Total_Emission > maxTotalEmission) {
//             maxTotalEmission = cityData.kpi_em_Total_Emission;
//             totalEmissionCity = city;
//           }

//           const topEmissionCategoryValue = parseInt(
//             cityData.kpi_em_TopEmission_Category.value
//           );
//           if (topEmissionCategoryValue > maxTopEmissionCategory.value) {
//             maxTopEmissionCategory = cityData.kpi_em_TopEmission_Category;
//           }

//           const topEmissionProductValue = parseInt(
//             cityData.kpi_em_TopEmission_Product.value
//           );
//           if (topEmissionProductValue > maxTopEmissionProduct.value) {
//             maxTopEmissionProduct = cityData.kpi_em_TopEmission_Product;
//           }

//           if (isPrevious) {
//             prevTotalEmission += cityData.kpi_em_Total_Emission;
//             prevKpi_em_Total_Emission_Scope1 +=
//               cityData.kpi_em_Total_Emission_Scope1;
//             prevKpi_em_Total_Emission_Scope2 +=
//               cityData.kpi_em_Total_Emission_Scope2;
//             prevKpi_em_Total_Emission_Scope3 +=
//               cityData.kpi_em_Total_Emission_Scope3;

//             if (cityData.kpi_em_Total_Emission > prevMaxTotalEmission) {
//               prevMaxTotalEmission = cityData.kpi_em_Total_Emission;
//               prevTotalEmissionCity = city;
//             }

//             if (topEmissionCategoryValue > prevMaxTopEmissionCategory.value) {
//               prevMaxTopEmissionCategory = cityData.kpi_em_TopEmission_Category;
//             }

//             if (topEmissionProductValue > prevMaxTopEmissionProduct.value) {
//               prevMaxTopEmissionProduct = cityData.kpi_em_TopEmission_Product;
//             }
//           }
//         }
//       }
//     };

//     datas.forEach((item: any, index: any) => {
//       if (index === 0) {
//         compareData(item["2022-23"], true);
//       }
//       compareData(item["2023-24"], false);
//     });

//     const calculatePercentageChange = (newValue: number, prevValue: number) => {
//       if (prevValue === 0) {
//         return newValue === 0 ? 0 : 100;
//       }
//       return ((newValue - prevValue) / prevValue) * 100;
//     };

//     let result = {
//       maxTotalEmission,
//       totalEmission,
//       totalEmissionCity,
//       maxTopEmissionCategory,
//       maxTopEmissionProduct,
//       kpi_em_Total_Emission_Scope1,
//       kpi_em_Total_Emission_Scope2,
//       kpi_em_Total_Emission_Scope3,
//       percentageChangeMaxTotalEmission: calculatePercentageChange(
//         maxTotalEmission,
//         prevMaxTotalEmission
//       ),
//       percentageChangeTotalEmission: calculatePercentageChange(
//         totalEmission,
//         prevTotalEmission
//       ),
//       percentageChangeTopEmissionCategoryValue: calculatePercentageChange(
//         maxTopEmissionCategory.value,
//         prevMaxTopEmissionCategory.value
//       ),
//       percentageChangeTopEmissionProductValue: calculatePercentageChange(
//         maxTopEmissionProduct.value,
//         prevMaxTopEmissionProduct.value
//       ),
//       percentageChangeKpi_em_Total_Emission_Scope1: calculatePercentageChange(
//         kpi_em_Total_Emission_Scope1,
//         prevKpi_em_Total_Emission_Scope1
//       ),
//       percentageChangeKpi_em_Total_Emission_Scope2: calculatePercentageChange(
//         kpi_em_Total_Emission_Scope2,
//         prevKpi_em_Total_Emission_Scope2
//       ),
//       percentageChangeKpi_em_Total_Emission_Scope3: calculatePercentageChange(
//         kpi_em_Total_Emission_Scope3,
//         prevKpi_em_Total_Emission_Scope3
//       ),
//     };

//     setFullData(result);
//     console.log(fullData, "checkingdatawiththe");
//     // return result;
//   };

//   const smallDevice = useMediaQuery("(max-width: 768px)");

//   const captureRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     FullfilterObject(data);
//     if (!captureRef.current) return;
//     const resizeObserver = new ResizeObserver(() => {
//       window.parent.postMessage(lastScrollTop, "*");
//     });
//     resizeObserver.observe(captureRef.current);
//     return () => resizeObserver.disconnect(); // clean up
//   }, []);

//   let lastScrollTop = 0;

//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollTop = window.scrollY || document.documentElement.scrollTop;

//       if (scrollTop < lastScrollTop) {
//         window.parent.postMessage("up", "*");
//       }

//       // eslint-disable-next-line react-hooks/exhaustive-deps
//       lastScrollTop = scrollTop;
//     };
//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   const handleCaptureAndDownload = () => {
//     setIsDownload(true);
//     setTimeout(() => {
//       if (!captureRef.current) return;
//       html2canvas(captureRef.current).then((canvas) => {
//         const dataUrl = canvas.toDataURL();
//         const link = document.createElement("a");
//         link.download = "Report.png";
//         link.href = dataUrl;
//         link.click();
//         setIsDownload(false);
//       });
//     }, 4000);
//   };

//   const handleChildEvent = (
//     childMessage: any,
//     selectedRegion: any,
//     selectedDuration: any
//   ) => {
//     switch (childMessage) {
//       case ShowDataValue.ThreeMonths: {
//         setSelectedShowData([
//           { isYearly: false, isQuarterly: false, isMonthly: true },
//         ]);
//         break;
//       }

//       case ShowDataValue.SixMonths: {
//         setSelectedShowData([
//           { isYearly: false, isQuarterly: true, isMonthly: true },
//         ]);
//         break;
//       }

//       case ShowDataValue.ThisQuarter: {
//         setSelectedShowData([
//           { isYearly: false, isQuarterly: true, isMonthly: false },
//         ]);
//         break;
//       }
//       case ShowDataValue.ThisYear: {
//         setSelectedShowData([
//           { isYearly: false, isQuarterly: true, isMonthly: true },
//         ]);
//         break;
//       }

//       case ShowDataValue.LastYear: {
//         setSelectedShowData([
//           { isYearly: false, isQuarterly: true, isMonthly: true },
//         ]);
//         break;
//       }
//       case ShowDataValue.Baseline: {
//         setSelectedShowData([
//           { isYearly: true, isQuarterly: true, isMonthly: true },
//         ]);
//         break;
//       }
//       default:
//         break;
//     }
//     const criteria = {
//       yearRange: selectedDuration,
//       state: selectedRegion,
//       cities: childMessage,
//     };
//     const datas = filterObject(data, criteria);
//     console.log(datas, "datas");
//     setFilteredData(datas);
//   };
//   useEffect(() => {
//     getEmissionTrendBlock();
//     return () => {
//       console.log("Component unmounted");
//     };
//   }, []);
//   function getEmissionTrendBlock() {}

//   return (
//     <>
//       <LoadingOverlay
//         visible={isDownload}
//         overlayProps={{ radius: "sm", blur: 1, pos: "fixed" }}
//         loaderProps={{ pos: "fixed" }}
//       />
//       <AppShell
//         header={{ height: 50 }}
//         navbar={{
//           width: 320,
//           breakpoint: "md",
//           collapsed: { mobile: !opened },
//         }}
//         ref={captureRef}
//         className="no-scrollbar"
//       >
//         <AppShell.Header
//           style={{
//             position: isDownload ? "static" : "fixed",
//           }}
//         >
//           <Group px="md" justify="space-between" align="center" h="50px">
//             <Flex align="center" gap="sm">
//               <Text size="20px" fw={600} c="#1A1A1A" lh="25.2px">
//                 GHG Emission Insights
//               </Text>
//               {!smallDevice && (
//                 <Flex align="center" gap="sm">
//                   <Text size="11px" c="#666666" lh="24px">
//                     Last Updated: {formatDate(lastUpdated)}
//                   </Text>
//                   <GreenBullet />
//                   <Text size="11px" c="#666666" lh="24px">
//                     Emission Range:
//                   </Text>
//                   <Flex align="center" gap="xs">
//                     <Text size="11px" c="#666666" lh="24px">
//                       Low
//                     </Text>
//                     <RangeIcon />
//                     <Text size="11px" c="#666666" lh="24px">
//                       High
//                     </Text>
//                   </Flex>
//                 </Flex>
//               )}
//             </Flex>
//             <Flex gap="5px" align="center">
//               <Burger
//                 opened={opened}
//                 onClick={toggle}
//                 hiddenFrom="sm"
//                 size="sm"
//               />

//               <Divider orientation="vertical" size="sm" h="28px" />
//               <ActionIcon
//                 onClick={handleCaptureAndDownload}
//                 variant="transparent"
//               >
//                 <DownloadIcon />
//               </ActionIcon>
//             </Flex>
//           </Group>
//         </AppShell.Header>
//         <AppShell.Navbar
//           style={{
//             position: isDownload ? "static" : "fixed",
//             float: isDownload ? "left" : "none",
//           }}
//           p="md"
//         >
//           <Sidebar />
//         </AppShell.Navbar>

//         {/* dfjusvgdfsugudhfs */}

//         <AppShell.Main>
//           <Box>
//             <EmissionCardBlock dummyData={fullData} />
//           </Box>
//           <Container px="md" fluid bg="#F7F9FB">
//             <Text
//               size="16px"
//               c="#000000"
//               fw={700}
//               pos={smallDevice ? "relative" : "absolute"}
//               mt="lg"
//             >
//               GHG Emission Snapshot - My View
//             </Text>
//             <Box
//               style={{
//                 position: smallDevice ? "relative" : "sticky",
//                 zIndex: smallDevice ? 99 : 9999,
//                 top: smallDevice ? "0px" : "-5px",
//                 float: smallDevice ? "left" : "right",
//               }}
//             >
//               <NavbarFilters onChildEvent={handleChildEvent} />
//             </Box>

//             {filteredData ? (
//               <EmissionCardBlock
//                 snapshotType="myview"
//                 filteredDataJson={filteredData}
//               />
//             ) : (
//               <EmissionCardBlock snapshotType="myview" dummyData={fullData} />
//             )}

//             <EmissionTrendBlock
//               selectedShowData={selectedShowData}
//               filteredDataofTotalEmission={(filteredData as any)?.totalEmission}
//             />
//             <EmissionByScopeBlock
//               selectedShowData={selectedShowData}
//               scopeData={filteredData}
//             />

//             {/* 2nd start from here */}

//             <CriticalFactorsBlock
//               isDownload={isDownload}
//               selectedShowData={selectedShowData}
//             />
//             <EmissionIntensityInsightBlock
//               selectedShowData={selectedShowData}
//             />
//             <EmissionContributorsBlock selectedShowData={selectedShowData} />
//             <Grid gutter="md" pt="md">
//               <Grid.Col span={12}>
//                 <Card shadow="sm" padding="md" radius="md" withBorder>
//                   <TotalEmissionProductsTable
//                     isDownload={isDownload}
//                     selectedShowData={selectedShowData}
//                   />
//                 </Card>
//               </Grid.Col>
//             </Grid>
//             <Grid gutter="md" py="md" mb="lg">
//               <Grid.Col span={12}>
//                 <MapChartLocationBlock selectedShowData={selectedShowData} />
//               </Grid.Col>
//             </Grid>
//           </Container>
//         </AppShell.Main>
//       </AppShell>
//     </>
//   );
// }
// export default ChartGrid;
