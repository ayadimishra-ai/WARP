import { Card, Grid } from "@mantine/core";
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

interface pieChartDataType {
  category: string;
  value: number;
}

interface lineChartDataType {
  category: string;
  upstream: number;
  downstream: number;
}

// by satej - 23-05-2024
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

// function UpDownStreamBlock(props: any) {
function UpDownStreamBlock({
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

  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const getStoreData = useDashboardStore((store) => store.current);
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
      // calculateYearlyData();
      setChartDataPie(data.ContributionFromUpstreamDownstreamPieChart);
    } else if (isYearly) {
      setChartDataPie(data.ContributionFromUpstreamDownstreamPieChart);
    } else if (isMonthly) {
      // calculateQuarterlyData();
      setChartDataPie(data.ContributionFromUpstreamDownstreamPieChart);
    }
  }, [globalFilters, getStoreData, selectedShowData]);

  useEffect(() => {
    if (isQuarterly) {
      setChartDataLine(
        calculateQuaterly(
          data.monthlyContributionFromUpstreamDownstream
        ) as lineChartDataType[]
      );
    } else if (isYearly) {
      setChartDataLine(
        calculateYearlyNew(
          data.monthlyContributionFromUpstreamDownstream
        ) as lineChartDataType[]
      );
    } else if (isMonthly) {
      setChartDataLine(
        calculateMonthly(
          data.monthlyContributionFromUpstreamDownstream
        ) as lineChartDataType[]
      );
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

  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "";

  // This code is to get description and popover content from global master table
  // Data will be from store

  const { kpiDescription } = dashboardDescription || {};
  const { emission_by_critical_factors } = kpiDescription || {};
  if (emission_by_critical_factors && emission_by_critical_factors.length > 0) {
    // For Scope 3 Emission Details Contribution from Upstream and Downstream
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category ===
          "Scope 3 Emission Details Contribution from Upstream and Downstream"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }
  }

  const chartDataLineMemo = useGetGroupByChartData(
    chartDataLine,
    "Emission Intensity Trend"
  );

  return (
    <Card ref={chartRef} padding="md" radius="md" h="100%">
      <ChartHeadBlock
        title="Scope 3 Emission Details Contribution from Upstream and Downstream"
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
            "Scope 3 Emission Details Contribution from Upstream and Downstream",
            "png"
          )
        }
        downloadPDF={() =>
          DownloadChart(
            chartRef,
            "Scope 3 Emission Details Contribution from Upstream and Downstream",
            "pdf"
          )
        }
        DownloadCSV={() =>
          DownloadCSV<Record<string, any>>(
            [chartDataPie, chartDataLineMemo],
            [
              "Scope 3 Emission Details Contribution from Upstream and Downstream - PieChart",
              "Scope 3 Emission Details Contribution from Upstream and Downstream - LineChart",
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
          <LineLableChart data={chartDataLineMemo} />
        </Grid.Col>
      </Grid>
    </Card>
  );
}

export default UpDownStreamBlock;
