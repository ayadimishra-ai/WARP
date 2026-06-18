import { Card, Grid } from "@mantine/core";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { useGetGroupByChartData } from "~/lib/ghg-dashboard/hooks";
import ChartHeadBlock from "../common/ChartHeadBlock";
import DownloadCSV from "../common/DownloadCSV";
import { DownloadChart } from "../common/DownloadChart";
import LineLableChart from "../common/LineLableChart";
import PieLabelChart from "../common/PieLabelChart";
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
interface pieChartDataType {
  category: string;
  value: number;
}

type TSupplyCategoryData = {
  year: number;
  month: number;
  [key: string]: any;
};
interface lineChartDataType {
  category: string;
  // supply_c1: number;
  // supply_c2: number;
  [key: string]: any;
}

interface SupplyCategoryBlockProps {
  selectedShowData: any;
  data: any;
  unit: string;
}
enum GlobalFilters {
  THREEMONTHS,
  SIXMONTHS,
  THISQTR,
  THISYEAR,
  LASTYEAR,
  FROMBASELINE,
}
type TGlobalFilters = {
  duration: GlobalFilters;
};

// function SupplyCategoryBlock(props: any) {
function SupplyCategoryBlock({
  selectedShowData,
  data,
  unit,
}: SupplyCategoryBlockProps) {
  const [isMonthly, setMonthlyClick] = useState<boolean>(
    selectedShowData[0].isMonthly
  );
  const [isYearly, setYearlyClick] = useState<boolean>(
    selectedShowData[0].isYearly
  );
  const [isQuarterly, setIsQuarterly] = useState<boolean>(
    selectedShowData[0].isQuarterly
  );
  const [isActive, setisActive] = useState<activeState>(
    selectedShowData[0].activeState
  );
  const [chartDataPie, setChartDataPie] = useState<Array<pieChartDataType>>([]);
  const [chartDataLine, setChartDataLine] = useState<Array<lineChartDataType>>(
    []
  );
  const [globalFilters, setGlobalFilters] = useState<TGlobalFilters>({
    duration: GlobalFilters.THISYEAR,
  });
  const getStoreData = useDashboardStore((store) => store.current);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const currentYearData: KPIData = getStoreData.currentYear as KPIData;
  const getSupplyCategoryData = () => {
    const grouped = _.groupBy(
      currentYearData?.emissionByMaterialConsumptionSuppliers,
      (item) => `${item.year}-${item?.month}-${item.supplier_category}`
    );
    const SupplyCategoryData = _.map(grouped, (items, key) => {
      return {
        year: items[0].year,
        month: items[0].month,
        supplier_category: items[0].supplier_category,
        kpi_em: _.sumBy(items, "kpi_em_MaterialProcurement_Scope3"),
      };
    });
    let supply_categories: string[] = [];
    SupplyCategoryData?.forEach((ele: any) => {
      if (!supply_categories.includes(ele.supplier_category))
        supply_categories.push(ele.supplier_category);
    });
    let categoryData: TSupplyCategoryData[] = [];
    SupplyCategoryData?.forEach((ele: any) => {
      let obj: TSupplyCategoryData = {
        year: ele.year,
        month: ele.month,
      };
      supply_categories?.forEach(
        (cat) =>
          (obj[cat] = cat === ele.supplier_category ? ele.kpi_em || 0 : 0)
      );
      categoryData.push(obj);
    });
    return categoryData;
  };

  const chartRef = useRef<HTMLDivElement>(null);
  useMemo(() => {
    if (!!selectedShowData.length) {
      setMonthlyClick(selectedShowData[0].isMonthly);
      setYearlyClick(selectedShowData[0].isYearly);
      setIsQuarterly(selectedShowData[0].isQuarterly);
      setisActive(selectedShowData[0].activeState);
    }
  }, [selectedShowData]);

  useEffect(() => {
    const { contributionFromSupplyCategoryPieChart } = data;
    contributionFromSupplyCategoryPieChart?.forEach((item: any) => {
      item.value = parseFloat(item.value.toFixed(1));
    });

    if (isYearly) {
      setChartDataPie(contributionFromSupplyCategoryPieChart);
    } else if (isMonthly) {
      setChartDataPie(contributionFromSupplyCategoryPieChart);
    } else if (isQuarterly) {
      setChartDataPie(contributionFromSupplyCategoryPieChart);
    }
  }, [globalFilters, getStoreData, selectedShowData]);

  useEffect(() => {
    const data = getSupplyCategoryData();
    if (isQuarterly) {
      setChartDataLine(calculateQuaterly(data) as lineChartDataType[]);
    } else if (isYearly) {
      setChartDataLine(calculateYearlyNew(data) as lineChartDataType[]);
    } else if (isMonthly) {
      setChartDataLine(calculateMonthly(data) as lineChartDataType[]);
    }
  }, [isYearly, isMonthly, isQuarterly, getStoreData, selectedShowData]);

  const handleQuarterly = () => {
    setIsQuarterly(true);
    setYearlyClick(false);
    setMonthlyClick(false);
    setisActive(activeState.isQuarterly);
  };

  const handleYearly = () => {
    setYearlyClick(true);
    setIsQuarterly(false);
    setMonthlyClick(false);
    setisActive(activeState.isYearly);
  };

  const handleMonthly = () => {
    setYearlyClick(false);
    setIsQuarterly(false);
    setMonthlyClick(true);
    setisActive(activeState.isMonthly);
  };

  // const calculateQuarterlyData = (): any[] => {
  //   const quarterlyData: lineChartDataType[] = [];
  //   let supplyCategoryQuarterly: { [key: string]: number } = {};
  //   const monthlyData = data.monthlyContributionFromSupplyCategory;

  //   const getQuarter = (month: number): number => {
  //     return Math.floor((month - 1) / 3) + 1;
  //   };

  //   let currentYearRange = "";
  //   let currentQuarter = 0;

  //   const allKeys = new Set<string>();

  //   monthlyData?.forEach((element: any) => {
  //     Object.keys(element).forEach((key) => {
  //       const sanitizedKey = key.replace(/\s+/g, "");
  //       if (sanitizedKey !== "year" && sanitizedKey !== "month") {
  //         allKeys.add(sanitizedKey);
  //       }
  //     });
  //   });

  //   for (let i = 0; i < monthlyData?.length; i++) {
  //     const element = monthlyData[i];

  //     Object.keys(element).forEach((key) => {
  //       const sanitizedKey = key.replace(/\s+/g, "");
  //       if (sanitizedKey !== "year" && sanitizedKey !== "month") {
  //         if (!supplyCategoryQuarterly[sanitizedKey]) {
  //           supplyCategoryQuarterly[sanitizedKey] = 0;
  //         }
  //         supplyCategoryQuarterly[sanitizedKey] += element[key] as number;
  //       }
  //     });

  //     const yearRange = `${element.year % 100}-${(element.year + 1) % 100}`;
  //     const quarter = getQuarter(element.month);

  //     if (yearRange !== currentYearRange) {
  //       currentYearRange = yearRange;
  //       currentQuarter = quarter;
  //     }

  //     if ((i + 1) % 3 === 0 || i === monthlyData.length - 1) {
  //       const yearQuarter = `${currentYearRange} Q${currentQuarter}`;
  //       const quarterlyEntry: lineChartDataType = {
  //         category: yearQuarter,
  //       };

  //       allKeys.forEach((sanitizedKey) => {
  //         if (sanitizedKey in supplyCategoryQuarterly) {
  //           quarterlyEntry[sanitizedKey] =
  //             supplyCategoryQuarterly[sanitizedKey];
  //         } else {
  //           quarterlyEntry[sanitizedKey] = 0;
  //         }
  //       });

  //       quarterlyData.push(quarterlyEntry);

  //       supplyCategoryQuarterly = {};
  //       currentQuarter = quarter + 1;
  //     }
  //   }

  //   return quarterlyData;
  // };

  // const calculateYearlyData = (): any[] => {
  //   const yearlyData: lineChartDataType[] = [];
  //   let supplyCategoryYearly: { [key: string]: number } = {};
  //   let currentYear = -1;
  //   const monthlyData = data.monthlyContributionFromSupplyCategory;

  //   const allKeys = new Set<string>();

  //   monthlyData?.forEach((element: any) => {
  //     Object.keys(element).forEach((key) => {
  //       const sanitizedKey = key.replace(/\s+/g, "");
  //       if (sanitizedKey !== "year" && sanitizedKey !== "month") {
  //         allKeys.add(sanitizedKey);
  //       }
  //     });
  //   });

  //   for (let i = 0; i < monthlyData?.length; i++) {
  //     const element = monthlyData[i];

  //     Object.keys(element).forEach((key) => {
  //       const sanitizedKey = key.replace(/\s+/g, "");
  //       if (sanitizedKey !== "year" && sanitizedKey !== "month") {
  //         if (!supplyCategoryYearly[sanitizedKey]) {
  //           supplyCategoryYearly[sanitizedKey] = 0;
  //         }
  //         supplyCategoryYearly[sanitizedKey] += element[key] as number;
  //       }
  //     });

  //     if (currentYear === -1 || currentYear !== element.year) {
  //       if (currentYear !== -1) {
  //         const yearlyEntry: lineChartDataType = {
  //           category: `${currentYear}`,
  //         };
  //         allKeys.forEach((sanitizedKey) => {
  //           if (sanitizedKey in supplyCategoryYearly) {
  //             yearlyEntry[sanitizedKey] = supplyCategoryYearly[sanitizedKey];
  //           } else {
  //             yearlyEntry[sanitizedKey] = 0;
  //           }
  //         });
  //         yearlyData.push(yearlyEntry);
  //       }
  //       supplyCategoryYearly = {};
  //       currentYear = element.year;
  //     }

  //     if (i === monthlyData.length - 1) {
  //       const yearlyEntry: lineChartDataType = {
  //         category: `${currentYear}`,
  //       };
  //       allKeys.forEach((sanitizedKey) => {
  //         if (sanitizedKey in supplyCategoryYearly) {
  //           yearlyEntry[sanitizedKey] = supplyCategoryYearly[sanitizedKey];
  //         } else {
  //           yearlyEntry[sanitizedKey] = 0;
  //         }
  //       });
  //       yearlyData.push(yearlyEntry);
  //     }
  //   }

  //   return yearlyData;
  // };

  // const calculateMonthlyData = (): any[] => {
  //   const monthlyDataOutput: lineChartDataType[] = [];
  //   const monthlyData = data.monthlyContributionFromSupplyCategory;

  //   const allKeys = new Set<string>();

  //   monthlyData?.forEach((monthData: any) => {
  //     Object.keys(monthData).forEach((key) => {
  //       if (key !== "year" && key !== "month") {
  //         allKeys.add(key);
  //       }
  //     });
  //   });

  //   for (let i = 0; i < monthlyData?.length; i++) {
  //     const monthData = monthlyData[i];
  //     const monthlyEntry: lineChartDataType = {
  //       category: `${short_months[monthData.month - 1]} ${monthData.year}`,
  //     };

  //     allKeys.forEach((sanitizedKey) => {
  //       if (sanitizedKey in monthData) {
  //         monthlyEntry[sanitizedKey] = monthData[sanitizedKey] as number;
  //       } else {
  //         monthlyEntry[sanitizedKey] = 0;
  //       }
  //     });

  //     monthlyDataOutput.push(monthlyEntry);
  //   }

  //   return monthlyDataOutput;
  // };

  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "";
  // This code is to get description and popover content from global master table
  // Data will be from store

  const { kpiDescription } = dashboardDescription || {};
  const { emission_by_critical_factors } = kpiDescription || {};
  if (emission_by_critical_factors && emission_by_critical_factors.length > 0) {
    // For Scope 3 Emission Details Contribution from Supply Category
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category ===
          "Scope 3 Emission Details Contribution from Supply Category"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }
  }

  const chartDataMemo = useGetGroupByChartData(
    chartDataLine,
    "Scope 3 Emission Details Contribution from Supply Category(in tco2e)"
  );

  return (
    <Card ref={chartRef} padding="md" radius="md" h="100%">
      <ChartHeadBlock
        title="Scope 3 Emission Details Contribution from Supply Category"
        unit={`in ${unit}`}
        description={totalEmissionDescription}
        popoverContent={totalEmissionPopoverContent}
        tabs={true}
        yearlyData={handleYearly}
        quarterlyData={handleQuarterly}
        monthlyData={handleMonthly}
        isShow={isActive}
        DownloadChart={() =>
          DownloadChart(
            chartRef,
            "Scope 3 Emission Details Contribution from Supply Category",
            "png"
          )
        }
        downloadPDF={() =>
          DownloadChart(
            chartRef,
            "Scope 3 Emission Details Contribution from Supply Category",
            "pdf"
          )
        }
        DownloadCSV={() =>
          DownloadCSV<Record<string, any>>(
            [chartDataPie, chartDataMemo],
            [
              "Scope 3 Emission Details Contribution from Supply Category - PieChart",
              "Scope 3 Emission Details Contribution from Supply Category - LineChart",
            ],
            [true]
          )
        }
        chartRef={chartRef}
        singleBlock
      />
      <Grid gutter="md" pt="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <PieLabelChart data={chartDataPie} />
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <LineLableChart data={chartDataMemo} />
        </Grid.Col>
      </Grid>
    </Card>
  );
}

export default SupplyCategoryBlock;
