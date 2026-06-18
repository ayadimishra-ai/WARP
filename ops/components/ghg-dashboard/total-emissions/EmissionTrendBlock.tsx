import { Box, Card, Grid } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionSnapshot } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  SelectedShowDataDataType,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { short_months } from "~/utils/date.util";
import ChartHeadBlock from "../common/ChartHeadBlock";
import DownloadCSV from "../common/DownloadCSV";
import { DownloadChart } from "../common/DownloadChart";
import {
  getQuarterName,
  getYearCategoryNameNumber,
} from "../common/NumberFormat";
import LineChartPrediction from "./LineChartPrediction";
import TotalEmission from "./TotalEmission";
type Totals = {
  category: string;
  [key: string]: any;
};
type LineChartData = {
  year: number;
  month: number;
  [key: string]: number;
};
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
interface linePredictionChartDataType {
  category: string;
  observed?: number;
  baseline?: number;
  easing?: number;
  projection?: number;
  stricter?: number;
}

type ScopeData = {
  value: number;
  change?: number;
  category?: string;
};

interface EmissionTrendBlockProps {
  selectedShowData: Array<SelectedShowDataDataType>;
}

function EmissionTrendBlock({ selectedShowData }: EmissionTrendBlockProps) {
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
  const [lineChartData, setLineChartData] = useState<
    Array<linePredictionChartDataType>
  >([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);

  const getStoreData = useDashboardStore((store) => store.current);
  const currentYearData: KPIData = getStoreData?.currentYear as KPIData;
  const previousYearData: KPIData = getStoreData?.previousYear as KPIData;
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const totalEm: LineChartData[] = currentYearData?.main?.map((entry) => ({
    year: entry?.year,
    month: entry?.month,
    observed: entry?.kpi_em_Total_Emission,
  }));
  const totalEmBaseline = getStoreData?.baselineLocationKPIMainData?.reduce(
    (acc, ele: any) => acc + ele?.kpi_em_Total_Emission,
    0
  );

  const getTotalEmissionData = () => {
    const currentYearTotalEm = currentYearData?.main?.reduce(
      (acc, ele) => acc + ele.kpi_em_Total_Emission,
      0
    );
    if (previousYearData?.main?.length === 0)
      return [{ value: currentYearTotalEm }];
    else {
      const previousYearTotalEm = previousYearData?.main?.reduce(
        (acc, ele) => acc + ele?.kpi_em_Total_Emission,
        0
      );
      const change = !!previousYearTotalEm
        ? ((currentYearTotalEm - previousYearTotalEm) * 100) /
          previousYearTotalEm
        : 0;

      return [{ value: currentYearTotalEm, change }];
    }
  };
  const totalEmissionData: ScopeData[] = getTotalEmissionData();
  useMemo(() => {
    if (!!selectedShowData.length) {
      setMonthlyClick(selectedShowData[0].isMonthly);
      setYearlyClick(selectedShowData[0].isYearly);
      setIsQuarterly(selectedShowData[0].isQuarterly);
      setisActive(selectedShowData[0].activeState);
    }
  }, [selectedShowData]);
  useEffect(() => {
    if (isQuarterly) {
      const quarterlyTotals: Totals[] = [];
      totalEm?.forEach((entry) => {
        const quarterName = getQuarterName(entry.month, entry.year);
        let quarterIndex = quarterlyTotals.findIndex(
          (item) => item.category === quarterName
        );
        if (quarterIndex === -1) {
          const quarterObj: Totals = {
            category: quarterName,
            baseline: totalEmBaseline ? totalEmBaseline / 4 : 0,
          };

          Object.keys(entry).forEach((key) => {
            if (key !== "year" && key !== "month") {
              quarterObj[key] = entry[key];
            }
          });

          quarterlyTotals.push(quarterObj);
        } else {
          Object.keys(entry).forEach((key) => {
            if (
              key &&
              key !== "year" &&
              key !== "month" &&
              key !== "baseline"
            ) {
              quarterlyTotals[quarterIndex][key] =
                (quarterlyTotals[quarterIndex][key] || 0) + (entry[key] || 0);
            }
          });
        }
      });
      setLineChartData(quarterlyTotals);
    } else if (isYearly) {
      const yearlyTotals: Totals[] = [];
      totalEm?.forEach((entry) => {
        const yrname = getYearCategoryNameNumber(entry.month, entry.year);
        const yearIndex = yearlyTotals.findIndex(
          (item) => item.category === yrname
        );

        if (yearIndex === -1) {
          const yearObj: Totals = {
            category: yrname,
            baseline: totalEmBaseline || 0,
          };

          Object.keys(entry).forEach((key) => {
            if (key && key !== "year" && key !== "month") {
              yearObj[key] = entry[key];
            }
          });

          yearlyTotals.push(yearObj);
        } else {
          Object.keys(entry)?.forEach((key) => {
            if (
              key &&
              key !== "year" &&
              key !== "month" &&
              key !== "baseline"
            ) {
              yearlyTotals[yearIndex][key] =
                (yearlyTotals[yearIndex][key] || 0) + (entry[key] || 0);
            }
          });
        }
      });
      setLineChartData(yearlyTotals);
    } else if (isMonthly) {
      const monthlyTotals: Totals[] = [];
      totalEm.forEach((entry) => {
        const monthName = short_months[entry.month - 1];
        const categoryName = `${monthName} ${entry.year}`;

        let monthIndex = monthlyTotals.findIndex(
          (item) => item.category.toString() === categoryName
        );

        if (monthIndex === -1) {
          const monthObj: Totals = {
            category: categoryName,
            baseline: totalEmBaseline ? totalEmBaseline / 12 : 0,
          };

          Object.keys(entry).forEach((key) => {
            if (key !== "year" && key !== "month") {
              monthObj[key] = entry[key];
            }
          });

          monthlyTotals.push(monthObj);
        } else if (typeof monthIndex === "number") {
          Object.keys(entry).forEach((key) => {
            if (
              key &&
              key !== "year" &&
              key !== "month" &&
              key !== "baseline"
            ) {
              monthlyTotals[monthIndex][key] =
                (monthlyTotals[monthIndex][key] || 0) + (entry[key] || 0);
            }
          });
        }
      });
      setLineChartData(monthlyTotals);
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

  const { main: mainArray } = currentYearData || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "",
    totalEmissionTrendDescription: string = "",
    totalEmissionTrendPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_snapshot } = kpiDescription || {};
  if (emission_snapshot && emission_snapshot.length > 0) {
    // For Total Emission
    const totalEmissionSnapshot: EmissionSnapshot | undefined =
      emission_snapshot.find(
        (desc: EmissionSnapshot) => desc.category === "Total Emission"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission Trend
    const totalEmissionTrendSnapshot: EmissionSnapshot | undefined =
      emission_snapshot.find(
        (desc: EmissionSnapshot) => desc.category === "Emission Trend"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }
  return (
    <Box>
      <Grid gutter="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Total Emission"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Total Emission", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Total Emission", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [totalEmissionData],
                  ["Total Emission"],
                  [true]
                )
              }
              chartRef={chartRef}
            />
            <TotalEmission scopeEmission={totalEmissionData} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <Card padding="md" radius="md" ref={chartRef1} h="100%">
            <ChartHeadBlock
              title="Emission Trend"
              unit={`in ${unit}`}
              description={totalEmissionTrendDescription}
              popoverContent={totalEmissionTrendPopoverContent}
              tabs={true}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef1, "Emission Trend", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef1, "Emission Trend", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [
                    lineChartData.map((ele) => ({
                      category: ele.category,
                      "Actual Total Emission": ele.observed,
                      baseline: ele.baseline,
                    })),
                  ],
                  ["Emission Trend"]
                )
              }
              chartRef={chartRef1}
            />
            <LineChartPrediction data={lineChartData} />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default EmissionTrendBlock;
