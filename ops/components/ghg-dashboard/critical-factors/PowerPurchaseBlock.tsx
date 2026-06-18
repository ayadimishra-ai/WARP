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
import LineLableChart from "../common/LineLableChart";
import PieLabelChart from "../common/PieLabelChart";

interface pieChartDataType {
  category: string;
  value: number;
}

interface lineChartDataType {
  category: string;
  RenewableSources: number;
  NonRenewableSources: number;
}

type PowerPurchaseBlockProps = {
  data: {
    year: number;
    month: number;
    RenewableSources: number;
    NonRenewableSources: number;
  }[];
  selectedShowData: Array<SelectedShowDataDataType>;
  unit: string;
};

function PowerPurchaseBlock(props: PowerPurchaseBlockProps) {
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
  const [chartDataLine, setChartDataLine] = useState<Array<lineChartDataType>>(
    []
  );

  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);
  useMemo(() => {
    if (!!props.selectedShowData.length) {
      setMonthlyClick(props.selectedShowData[0].isMonthly);
      setYearlyClick(props.selectedShowData[0].isYearly);
      setIsQuarterly(props.selectedShowData[0].isQuarterly);
      setisActive(props.selectedShowData[0].activeState);
    }
  }, [props.selectedShowData]);

  useEffect(() => {
    setChartDataPie([
      {
        category: "Renewable",
        value: Array.isArray(props.data)
          ? parseFloat(
              props.data
                .reduce((acc, ele) => acc + ele.RenewableSources, 0)
                .toFixed(1)
            ) || 0
          : 0,
      },
      {
        category: "Non-Renewable",
        value: Array.isArray(props.data)
          ? parseFloat(
              props.data
                .reduce((acc, ele) => acc + ele.NonRenewableSources, 0)
                .toFixed(1)
            ) || 0
          : 0,
      },
    ]);
  }, [props.data]);

  useEffect(() => {
    if (isQuarterly) {
      setChartDataLine(
        (calculateQuaterly(props.data) as lineChartDataType[]) || []
      );
    } else if (isYearly) {
      setChartDataLine(
        (calculateYearlyNew(props.data) as lineChartDataType[]) || []
      );
    } else if (isMonthly) {
      setChartDataLine(
        (calculateMonthly(props.data) as lineChartDataType[]) || []
      );
    }
  }, [isYearly, isMonthly, isQuarterly, props.data]);

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
    // For Emission by Power Purchase
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Power Purchase"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission by Power Purchase Trends
    const totalEmissionTrendSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Power Purchase Trends"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }

  const chartDataLineMemo = useGetGroupByChartData(
    chartDataLine,
    "Emission by Power Purchase Trends(in tco2e)"
  );

  return (
    <Box>
      <Grid gutter="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission by Power Purchase"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Emission by Power Purchase", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Emission by Power Purchase", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataPie],
                  ["Emission by Power Purchase"],
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
              title="Emission by Power Purchase Trends"
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
                  "Emission by Power Purchase Trends",
                  "png"
                )
              }
              downloadPDF={() =>
                DownloadChart(
                  chartRef1,
                  "Emission by Power Purchase Trends",
                  "pdf"
                )
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataLineMemo],
                  ["Emission by Power Purchase Trends"]
                )
              }
              chartRef={chartRef1}
            />
            <LineLableChart data={chartDataLineMemo} />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default PowerPurchaseBlock;
