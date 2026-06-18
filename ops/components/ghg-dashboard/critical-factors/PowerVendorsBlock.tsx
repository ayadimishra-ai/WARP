import { Box, Card, Grid } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthly,
  calculateQuaterly,
  calculateYearlyNew,
  findBetweenFromMonthYears,
  findFirstAndLastMonth,
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
  [key: string]: any;
}

interface TTPowerVendorBlock {
  year: number;
  month: number;
  [key: string]: any;
}

interface VendorData {
  year: number;
  month: number;
  value: number;
}
interface PowerVendorsBlockProps {
  data: {
    [key: string]: VendorData[];
  };
  selectedShowData: Array<SelectedShowDataDataType>;
  unit: string;
}

function PowerVendorsBlock(props: PowerVendorsBlockProps) {
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

  useEffect(() => {
    setChartDataPie(
      typeof props.data === "object"
        ? Object.entries(props.data).map(([key, value]) => ({
            category: key,
            value: Array.isArray(value)
              ? parseFloat(
                  value.reduce((acc, curr) => acc + curr.value, 0).toFixed(1)
                ) || 0
              : 0,
          }))
        : []
    );
  }, [props.data]);

  const getPWLineChartData = () => {
    const combinedData: any[] = [];
    if (typeof props.data === "object" && props.data !== null) {
      Object.keys(props.data).forEach((key) => {
        const dataForKey = props.data[key];
        if (Array.isArray(dataForKey)) {
          dataForKey.forEach((item) => {
            combinedData.push(item);
          });
        }
      });
    }

    const { yearFrom, monthFrom, yearTo, monthTo } =
      findFirstAndLastMonth(combinedData);
    const allMonthYears = findBetweenFromMonthYears(
      yearFrom,
      monthFrom,
      yearTo,
      monthTo
    );

    const result: TTPowerVendorBlock[] = [];

    // allMonthYears?.forEach(
    //   ({ year, month }: { year: number; month: number }) => {
    //     const obj: TTPowerVendorBlock = { year, month };
    //     for (const key of Object.keys(props.data)) {
    //       const value = props.data[key].find(
    //         (item: any) => item.year === year && item.month === month
    //       );
    //       obj[key] = value ? value.value : "undefined";
    //     }
    //     if (
    //       obj.Adani !== "undefined" ||
    //       obj.Adani !== "undefined" ||
    //       obj.Greenco !== "undefined" ||
    //       obj.NTPC !== "undefined" ||
    //       obj["Renew power"] !== "undefined" ||
    //       obj.Solaris !== "undefined" ||
    //       obj["Tata Power"] !== "undefined" ||
    //       obj.others !== "undefined"
    //     )
    //       result.push(obj);
    //   }
    // );
    allMonthYears?.forEach(
      ({ year, month }: { year: number; month: number }) => {
        const obj: TTPowerVendorBlock = { year, month };
        for (const key of Object.keys(props.data)) {
          const value = props.data[key]
            .filter((item: any) => item.year === year && item.month === month)
            .reduce((sum: number, item: any) => sum + item.value, 0);
          // const value = props.data[key].find(
          //   (item: any) => item.year === year && item.month === month
          // );
          obj[key] = value ? value : 0;
        }
        result.push(obj);
      }
    );
    return result;
  };

  const PWLineChartData = getPWLineChartData();
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
      setChartDataLine(calculateQuaterly(PWLineChartData));
    } else if (isYearly) {
      setChartDataLine(calculateYearlyNew(PWLineChartData));
    } else if (isMonthly) {
      setChartDataLine(calculateMonthly(PWLineChartData));
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
    // For Emission by Power Vendors
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Power Vendors"
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
          desc.category === "Emission by Power Vendors Trends"
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
    "Emission by Power Vendors Trends(in tco2e)"
  );
  return (
    <Box>
      <Grid gutter="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission by Power Vendors"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Emission by Power Vendors", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Emission by Power Vendors", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataPie],
                  ["Emission by Power Vendors"],
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
              title="Emission by Power Vendors Trends"
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
                  "Emission by Power Vendors Trends",
                  "png"
                )
              }
              downloadPDF={() =>
                DownloadChart(
                  chartRef1,
                  "Emission by Power Vendors Trends",
                  "pdf"
                )
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataLineMemo],
                  ["Emission by Power Vendors Trends"]
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

export default PowerVendorsBlock;
