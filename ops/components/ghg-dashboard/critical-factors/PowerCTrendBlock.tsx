import { Box, Card, Grid } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
  SelectedShowDataDataType,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { useGetGroupByChartData } from "~/lib/ghg-dashboard/hooks";
import ChartHeadBlock from "../common/ChartHeadBlock";
import DownloadCSV from "../common/DownloadCSV";
import { DownloadChart } from "../common/DownloadChart";
import PieLabelChart from "../common/PieLabelChart";
import PowerCTrend from "./PowerCTrend";

interface pieChartDataType {
  category: string;
  value: number;
}
interface ChartDataType {
  category: string;
  captive: number;
  purchased: number;
  total: number;
}

type PowerCTrendBlockProps = {
  data: {
    year: number;
    month: number;
    captive: number;
    purchased: number;
    total: number;
  }[];
  selectedShowData: Array<SelectedShowDataDataType>;
  unit: string;
};
function PowerCTrendBlock(props: PowerCTrendBlockProps) {
  const [isMonthly, setMonthlyClick] = useState<boolean>(
    props.selectedShowData[0].isMonthly
  );
  const [isYearly, setYearlyClick] = useState<boolean>(
    props.selectedShowData[0].isYearly
  );
  const [isQuarterly, setIsQuarterly] = useState<boolean>(
    props.selectedShowData[0].isQuarterly
  );
  const [isActive, setisActive] = useState<activeState>(
    props.selectedShowData[0].activeState
  );
  const [chartDataPie, setChartDataPie] = useState<Array<pieChartDataType>>([]);
  const [chartData, setChartData] = useState<Array<ChartDataType>>([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);
  const getStoreData = useDashboardStore((store: any) => store.current);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  useEffect(() => {
    setChartDataPie([
      {
        category: "Captive",
        value: Array.isArray(props.data)
          ? parseFloat(
              props.data?.reduce((acc, ele) => acc + ele.captive, 0).toFixed(1)
            ) || 0
          : 0,
      },
      {
        category: "Purchased",
        value: Array.isArray(props.data)
          ? parseFloat(
              props.data
                ?.reduce((acc, ele) => acc + ele.purchased, 0)
                .toFixed(1)
            ) || 0
          : 0,
      },
    ]);
  }, [props.data]);
  useMemo(() => {
    if (!!props.selectedShowData.length) {
      setMonthlyClick(props.selectedShowData[0].isMonthly);
      setYearlyClick(props.selectedShowData[0].isYearly);
      setIsQuarterly(props.selectedShowData[0].isQuarterly);
      setisActive(props.selectedShowData[0].activeState);
    }
  }, [props.selectedShowData]);
  useEffect(() => {
    if (isQuarterly) {
      setChartData((calculateQuaterly(props.data) as ChartDataType[]) || []);
    } else if (isYearly) {
      setChartData((calculateYearlyNew(props.data) as ChartDataType[]) || []);
    } else if (isMonthly) {
      setChartData((calculateMonthly(props.data) as ChartDataType[]) || []);
    }
  }, [isYearly, isMonthly, isQuarterly, props.data, props.selectedShowData]);

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

  const { unit } = props || {};

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "",
    totalEmissionTrendDescription: string = "",
    totalEmissionTrendPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_by_critical_factors } = kpiDescription || {};
  if (emission_by_critical_factors && emission_by_critical_factors.length > 0) {
    // For Emission by Power Consumption
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Power Consumption"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission by Power Consumption Trend
    const totalEmissionTrendSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Power Consumption Trend"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }

  const chartDataMemo = useGetGroupByChartData(
    chartData,
    "Emission by Power Consumption Trend(in tco2e)"
  );

  return (
    <Box>
      <Grid gutter="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission by Power Consumption"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Emission by Power Consumption", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Emission by Power Consumption", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataPie],
                  ["Emission by Power Consumption"],
                  [true]
                )
              }
              chartRef={chartRef}
            />
            <PieLabelChart data={chartDataPie} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <Card ref={chartRef1} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission by Power Consumption Trend"
              unit={`in ${unit}`}
              description={totalEmissionTrendDescription}
              popoverContent={totalEmissionTrendPopoverContent}
              tabs={true}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(
                  chartRef1,
                  "Emission by Power Consumption Trend",
                  "png"
                )
              }
              downloadPDF={() =>
                DownloadChart(
                  chartRef1,
                  "Emission by Power Consumption Trend",
                  "pdf"
                )
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataMemo],
                  ["Emission by Power Consumption Trend"]
                )
              }
              chartRef={chartRef1}
            />
            <PowerCTrend data={chartDataMemo} />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default PowerCTrendBlock;
