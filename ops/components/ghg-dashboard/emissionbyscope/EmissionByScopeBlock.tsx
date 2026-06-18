"use client";
import { Box, Card, Grid } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByScopeType } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import BlockHeading from "../common/BlockHeading";
import ChartHeadBlock from "../common/ChartHeadBlock";
import DownloadCSV from "../common/DownloadCSV";
import { DownloadChart } from "../common/DownloadChart";
import EmissionByScopeProgress from "../common/TotalEmissionRingProgress";
import EmissionByScope from "./EmissionByScope";
interface ScopeChartDataType {
  category: string;
  scope1?: number;
  scope2?: number;
  scope3?: number;
}
type ScopeData = {
  value: number;
  name: string;
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

function EmissionByScopeBlock(props: any) {
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
  const [scopeChartData, setScopeChartData] = useState<
    Array<ScopeChartDataType>
  >([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);

  const getStoreData = useDashboardStore((store) => store.current);
  const currentYearData: KPIData = getStoreData?.currentYear as KPIData;
  const currentYearDataModified = currentYearData?.main?.map((ele) => ({
    year: ele.year,
    month: ele.month,
    scope1: ele.kpi_em_Total_Emission_Scope1,
    scope2: ele.kpi_em_Total_Emission_Scope2,
    scope3: ele.kpi_em_Total_Emission_Scope3,
  }));
  const previousYearData: KPIData = getStoreData?.previousYear as KPIData;
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

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

  const TotalEmissionByScope: ScopeData[] = [
    {
      name: "Scope 1",
      value: currentYearData?.main?.reduce(
        (acc, ele) => acc + ele.kpi_em_Total_Emission_Scope1,
        0
      ),
    },
    {
      name: "Scope 2",
      value: currentYearData?.main?.reduce(
        (acc, ele) => acc + ele.kpi_em_Total_Emission_Scope2,
        0
      ),
    },
    {
      name: "Scope 3",
      value: currentYearData?.main?.reduce(
        (acc, ele) => acc + ele.kpi_em_Total_Emission_Scope3,
        0
      ),
    },
  ];

  const getQuarter = (month: any) => {
    if (month <= 3) return "Q1";
    if (month <= 6) return "Q2";
    if (month <= 9) return "Q3";
    return "Q4";
  };
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
      setScopeChartData(
        (calculateQuaterly(currentYearDataModified) as ScopeChartDataType[]) ||
          []
      );
    } else if (isYearly) {
      setScopeChartData(
        (calculateYearlyNew(currentYearDataModified) as ScopeChartDataType[]) ||
          []
      );
    } else if (isMonthly) {
      setScopeChartData(
        (calculateMonthly(currentYearDataModified) as ScopeChartDataType[]) ||
          []
      );
    }
  }, [isYearly, isMonthly, isQuarterly, getStoreData, props.selectedShowData]);

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
  const { emission_by_scope } = kpiDescription || {};
  if (emission_by_scope && emission_by_scope.length > 0) {
    // For Total Emission
    const totalEmissionSnapshot: EmissionByScopeType | undefined =
      emission_by_scope.find(
        (desc: EmissionByScopeType) =>
          desc.category === "Total Emission by Scope"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission by Scope Trend
    const totalEmissionTrendSnapshot: EmissionByScopeType | undefined =
      emission_by_scope.find(
        (desc: EmissionByScopeType) =>
          desc.category === "Emission by Scope Trend"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }

  return (
    <Box id="EmissionsbyScopeScrollId" className="scrollIds">
      <BlockHeading title="Emission by Scope" />
      <Grid gutter="md" pt="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} p="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Total Emission by Scope"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Total Emission by Scope", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Total Emission by Scope", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [
                    TotalEmissionByScope.map((ele) => ({
                      name: ele.name,
                      value: ele.value,
                    })),
                  ],
                  ["Total Emission by Scope"],
                  [true]
                )
              }
              chartRef={chartRef}
            />
            <Box h="300px">
              <EmissionByScopeProgress totalEmission={TotalEmissionByScope} />
            </Box>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <Card ref={chartRef1} p="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission by Scope Trend"
              unit={`in ${unit}`}
              description={totalEmissionTrendDescription}
              popoverContent={totalEmissionTrendPopoverContent}
              tabs={true}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef1, "Emission by Scope Trend", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef1, "Emission by Scope Trend", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [scopeChartData],
                  ["Emission by Scope Trend"]
                )
              }
              chartRef={chartRef1}
            />
            <EmissionByScope data={scopeChartData} />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
export default EmissionByScopeBlock;
