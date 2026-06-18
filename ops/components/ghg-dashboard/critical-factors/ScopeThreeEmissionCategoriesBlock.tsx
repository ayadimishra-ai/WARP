import { Card, Grid } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
  removedZerosKeys,
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
  upstreamTransport: number;
  downstreamTransport: number;
  employeeTravel: number;
  businessTravel: number;
  transportForWasteMgt: number;
  materialProcurement: number;
  wasteGeneration: number;
  contractManufacturing: number;
}

interface ContributionCategoriesBlockProps {
  data: any;
  selectedShowData: Array<SelectedShowDataDataType>;
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

// function ScopeThreeEmissionCategoriesBlock(props: any) {
function ScopeThreeEmissionCategoriesBlock({
  data,
  selectedShowData,
  unit,
}: ContributionCategoriesBlockProps) {
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

  const chartRef = useRef<HTMLDivElement>(null);

  const categoryNameMapping = {
    upstreamTransport: "Upstream Transport",
    downstreamTransport: "Downstream Transport",
    employeeTravel: "Employee Travel",
    businessTravel: "Business Travel",
    transportForWasteMgt: "Transport for Waste Mgt.",
    materialProcurement: "Material Procurement",
    wasteGeneration: "Waste Generation",
    contractManufacturing: "Contract Manufacturing",
  };

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

  //   ===============================================================
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
      setChartDataPie(
        transformData(data.contributionFromCategoriesPieChartData)
      );
      handleQuarterly();
    } else if (isYearly) {
      setChartDataPie(
        transformData(data.contributionFromCategoriesPieChartData)
      );
    } else if (isMonthly) {
      setChartDataPie(
        transformData(data.contributionFromCategoriesPieChartData)
      );
    }
  }, [globalFilters, getStoreData, selectedShowData]);

  useEffect(() => {
    if (isQuarterly) {
      const calculatedData: lineChartDataType[] = calculateQuaterly(
        data.contributionFromCategoriesLineChartData
      ) as lineChartDataType[];
      if (calculatedData.length > 0) {
        setChartDataLine(
          removedZerosKeys(calculatedData) as lineChartDataType[]
        );
      } else {
        setChartDataLine([]);
      }
    } else if (isYearly) {
      const calculatedData = calculateYearlyNew(
        data.contributionFromCategoriesLineChartData
      ) as lineChartDataType[];
      setChartDataLine(removedZerosKeys(calculatedData) as lineChartDataType[]);
    } else if (isMonthly) {
      const calculatedData = calculateMonthly(
        data.contributionFromCategoriesLineChartData
      ) as lineChartDataType[];
      setChartDataLine(removedZerosKeys(calculatedData) as lineChartDataType[]);
    }
  }, [isYearly, isMonthly, isQuarterly, getStoreData]);

  const transformData = (rawData: any) => {
    const transformedData = Object.keys(rawData).map((key) => ({
      category:
        categoryNameMapping[key as keyof typeof categoryNameMapping] || key,
      value: rawData[key],
    }));
    return transformedData.filter((i) => i.value !== 0);
  };

  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "";
  // This code is to get description and popover content from global master table
  // Data will be from store

  const { kpiDescription } = dashboardDescription || {};
  const { emission_by_critical_factors } = kpiDescription || {};
  if (emission_by_critical_factors && emission_by_critical_factors.length > 0) {
    // For Scope 3 Emission Details Contribution from Categories
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category ===
          "Scope 3 Emission Details Contribution from Categories"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }
  }

  const chartDataMemo = useGetGroupByChartData(
    chartDataLine,
    "Scope 3 Emission Details Contribution from Categories (in tco2e)"
  );

  // console.log("Scope 3 Emission Details Contribution from Categories", {
  //   chartDataMemo,
  //   chartDataPie,
  // });

  return (
    <Card ref={chartRef} padding="md" radius="md" h="100%">
      <ChartHeadBlock
        title="Scope 3 Emission Details Contribution from Categories"
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
            "Scope 3 Emission Details Contribution from Categories",
            "png"
          )
        }
        downloadPDF={() =>
          DownloadChart(
            chartRef,
            "Scope 3 Emission Details Contribution from Categories",
            "pdf"
          )
        }
        DownloadCSV={() =>
          DownloadCSV<Record<string, any>>(
            [chartDataPie, chartDataMemo],
            [
              "Scope 3 Emission Details Contribution from Categories - PieChart",
              "Scope 3 Emission Details Contribution from Categories - LineChart",
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

export default ScopeThreeEmissionCategoriesBlock;
