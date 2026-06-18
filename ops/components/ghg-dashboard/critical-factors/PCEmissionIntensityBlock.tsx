import { Box, Grid } from "@mantine/core";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  SelectedShowDataDataType,
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { useGetGroupByChartData } from "~/lib/ghg-dashboard/hooks";

interface pieChartDataType {
  category: string;
  value: number;
}

interface lineChartDataType {
  category: string;
  captive: number;
  purchased: number;
}

type PCEmissionIntensityBlockProps = {
  data: {
    year: number;
    month: number;
    captive: number;
    purchased: number;
    // CaptivePower: number;
    // TotalPowerPurchased: number;
    // CaptivePowerUnits: number;
    // TotalPowerPurchasedUnits: number;
  }[];
  selectedShowData: Array<SelectedShowDataDataType>;
};

function PCEmissionIntensityBlock(props: PCEmissionIntensityBlockProps) {
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

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);

  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  useEffect(() => {
    setChartDataPie([
      {
        category: "Captive",
        value: Array.isArray(props.data)
          ? parseFloat(
              props.data.reduce((acc, ele) => acc + ele.captive, 0).toFixed(4)
            ) || 0
          : 0,
      },
      {
        category: "Purchased",
        value: Array.isArray(props.data)
          ? parseFloat(
              props.data.reduce((acc, ele) => acc + ele.purchased, 0).toFixed(4)
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

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "",
    totalEmissionTrendDescription: string = "",
    totalEmissionTrendPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_by_critical_factors } = kpiDescription || {};
  if (emission_by_critical_factors && emission_by_critical_factors.length > 0) {
    // For Emission Intensity
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission Intensity"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission Intensity Trend
    const totalEmissionTrendSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission Intensity Trend"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }

  const chartDataMemo = useGetGroupByChartData(
    chartDataLine,
    "Emission Intensity Trend",
    true
  );

  const chartDataPieMemo = useMemo(() => {
    const data = [
      {
        category: "Captive",
        value: _.sum(chartDataMemo.map((m) => m.captive)),
      },
      {
        category: "Purchased",
        value: _.sum(chartDataMemo.map((m) => m.purchased)),
      },
    ];
    return data;
  }, [chartDataMemo]);

  // console.log("Emission Intensity Trend(Per kWh of Power Consumption)", {
  //   "props.data": props.data,
  //   chartDataMemo,
  //   chartDataLine,
  //   chartDataPieMemo,
  // });

  return (
    <Box>
      <Grid gutter="md">
        {/* <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission Intensity"
              unit="Per kWh of Power Consumption"
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Emission Intensity", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Emission Intensity", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataPieMemo],
                  ["Emission Intensity"],
                  [true]
                )
              }
              chartRef={chartRef}
            />
            <PieLabelChart
              data={chartDataPieMemo}
              powerconsumption
              isIntensity
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <Card ref={chartRef1} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission Intensity Trend"
              unit="Per kWh of Power Consumption"
              description={totalEmissionTrendDescription}
              popoverContent={totalEmissionTrendPopoverContent}
              tabs={true}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef1, "Emission Intensity Trend", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef1, "Emission Intensity Trend", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataMemo],
                  ["Emission Intensity Trend"]
                )
              }
              chartRef={chartRef1}
            />
            <LineLableChart data={chartDataMemo} isIntensity />
          </Card>
        </Grid.Col> */}
      </Grid>
    </Box>
  );
}

export default PCEmissionIntensityBlock;
