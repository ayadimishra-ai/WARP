import { Card, Grid } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionContributor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
  sumFields,
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
  organization_id?: string;
  region_id?: string;
  address_id?: string;
  month?: number;
  year?: number;
  timestamp?: string;
  category: string;
  energy: number;
  material: number;
  transport: number;
  waste: number;
}

function TotalEmissionCat(props: any) {
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
  const getStoreData = useDashboardStore((store: any) => store.current);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );
  const chartRef = useRef<HTMLDivElement>(null);
  const sumOverallWorkStreamBlock = () => {
    const fieldsToSum = [
      "kpi_em_Cont_TotalEmission_Categories_Energy",
      "kpi_em_Cont_TotalEmission_Categories_Material",
      "kpi_em_Cont_TotalEmission_Categories_Transport",
      "kpi_em_Cont_TotalEmission_Categories_Waste",
    ];
    const yearQuarter = sumFields(getStoreData?.currentYear?.main, fieldsToSum);
    setChartDataPie([
      {
        category: "Energy",
        value: yearQuarter?.kpi_em_Cont_TotalEmission_Categories_Energy,
      },
      {
        category: "Material",
        value: yearQuarter?.kpi_em_Cont_TotalEmission_Categories_Material,
      },
      {
        category: "Transport",
        value: yearQuarter?.kpi_em_Cont_TotalEmission_Categories_Transport,
      },
      {
        category: "Waste",
        value: yearQuarter?.kpi_em_Cont_TotalEmission_Categories_Waste,
      },
    ]);
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
    const data = getStoreData?.currentYear?.main?.map((item: any) => {
      let data = {
        year: item.year,
        month: item.month,
        energy: item.kpi_em_Cont_TotalEmission_Categories_Energy,
        material: item.kpi_em_Cont_TotalEmission_Categories_Material,
        transport: item.kpi_em_Cont_TotalEmission_Categories_Transport,
        waste: item.kpi_em_Cont_TotalEmission_Categories_Waste,
      };
      return data;
    });

    if (isQuarterly) {
      setChartDataLine((calculateQuaterly(data) as lineChartDataType[]) || []);
      sumOverallWorkStreamBlock();
    } else if (isYearly) {
      setChartDataLine((calculateYearlyNew(data) as lineChartDataType[]) || []);
      sumOverallWorkStreamBlock();
    } else if (isMonthly) {
      setChartDataLine((calculateMonthly(data) as lineChartDataType[]) || []);
      sumOverallWorkStreamBlock();
    }
  }, [isYearly, isMonthly, isQuarterly, getStoreData, props.selectedShowData]);

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

  const { currentYear } = getStoreData || {};
  const { main: mainArray } = currentYear || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_contributors } = kpiDescription || {};
  if (emission_contributors && emission_contributors.length > 0) {
    // For Contribution in Total Emission by Categories
    const totalEmissionSnapshot: EmissionContributor | undefined =
      emission_contributors.find(
        (desc: EmissionContributor) =>
          desc.category === "Contribution in Total Emission by Categories"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }
  }

  const chartDataMemo = useGetGroupByChartData(
    chartDataLine,
    "Contribution in Total Emission by Categories(in tco2e)"
  );

  return (
    <Card ref={chartRef} padding="md" radius="md" h="100%">
      <ChartHeadBlock
        title="Contribution in Total Emission by Categories"
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
            "Contribution in Total Emission by Categories",
            "png"
          )
        }
        downloadPDF={() =>
          DownloadChart(
            chartRef,
            "Contribution in Total Emission by Categories",
            "pdf"
          )
        }
        DownloadCSV={() =>
          DownloadCSV<Record<string, any>>(
            [chartDataPie, chartDataMemo],
            [
              "Contribution in Total Emission by Categories - PieChart",
              "Contribution in Total Emission by Categories - LineChart",
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

export default TotalEmissionCat;
