import { Box, Text } from "@mantine/core";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionIntensityInsight } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  calculateMonthlyIntensity,
  calculateQuaterlyIntensity,
  calculateYearlyIntensity,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { useGetGroupByChartData } from "~/lib/ghg-dashboard/hooks";
import BoxIcon from "../../icons/BoxIcon";
import GearIcon from "../../icons/GearIcon";
import UserIcon from "../../icons/UserIcon";

interface ChartDataType {
  organization_id?: string;
  region_id?: string;
  address_id?: string;
  month?: number;
  year?: number;
  timestamp?: string;
  category: string;
  kpi_em_CurrentEmissionIntensity_PerTonProduction: number;
  kpi_em_CurrentEmissionIntensity_PerEmployee: number;
  kpi_em_CurrentEmissionIntensity_PerProduct: number;
}
interface IntensityData {
  Icon: React.FC;
  value: number;
  label: any;
}

interface CSVEmissionIntensity {
  "Emission Intensity": string;
  Value: number;
}

export interface CSVEmissionIntensityTrend {
  Category: string;
  "Per Tonne Production": number;
  "Per Employee": number;
  "Per Product": number;
}

function EmissionIntensityInsightBlock(props: any) {
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
  const getStoreData = useDashboardStore((store: any) => store.current);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const [chartDataOverall, setChartDataOverall] = useState<
    Array<IntensityData>
  >([]);
  const [csvData, setCsvData] = useState<CSVEmissionIntensity[]>([]);
  const [chartData, setChartData] = useState<Array<ChartDataType>>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);

  const sumOverallEmissionIntensity = () => {
    const grouped = _.groupBy(getStoreData?.currentYear?.main, "address_id");
    const EmissionIntensityAverages = _.map(grouped, (values, key) => {
      return {
        id: key,
        pertonneaverage:
          _.sumBy(values, "kpi_em_CurrentEmissionIntensity_PerTonProduction") /
          values.length,
        peremployeeaverage:
          _.sumBy(values, "kpi_em_CurrentEmissionIntensity_PerEmployee") /
          values.length,
        perproductaverage:
          _.sumBy(values, "kpi_em_CurrentEmissionIntensity_PerProduct") /
          values.length,
      };
    });

    // This object is used to export Emission Intensity to CSV
    const csvData = [
      {
        "Emission Intensity": "Per Tonne of Production",
        Value:
          EmissionIntensityAverages.length > 0
            ? _.sumBy(EmissionIntensityAverages, "pertonneaverage") /
              EmissionIntensityAverages.length
            : 0,
      },
      {
        "Emission Intensity": "Per Employee",
        Value:
          EmissionIntensityAverages.length > 0
            ? _.sumBy(EmissionIntensityAverages, "peremployeeaverage") /
              EmissionIntensityAverages.length
            : 0,
      },
      {
        "Emission Intensity": "Per Product",
        Value:
          EmissionIntensityAverages.length > 0
            ? _.sumBy(EmissionIntensityAverages, "perproductaverage") /
              EmissionIntensityAverages.length
            : 0,
      },
    ];
    setCsvData(csvData);

    setChartDataOverall([
      {
        Icon: GearIcon,
        label: (
          <Text size="12px" fw={600} pt="0" lh="16px">
            Per Tonne
            <Text size="12px" fw={600} lh="16px">
              of Production
            </Text>
          </Text>
        ),
        value: parseFloat(
          (EmissionIntensityAverages.length > 0
            ? _.sumBy(EmissionIntensityAverages, "pertonneaverage") /
              EmissionIntensityAverages.length
            : 0
          ).toFixed(1)
        ),
      },
      {
        Icon: UserIcon,
        label: (
          <Text size="12px" fw={600} pt="0" lh="16px">
            Per
            <Text size="12px" fw={600} lh="16px">
              Employee
            </Text>
          </Text>
        ),
        value: parseFloat(
          (EmissionIntensityAverages.length > 0
            ? _.sumBy(EmissionIntensityAverages, "peremployeeaverage") /
              EmissionIntensityAverages.length
            : 0
          ).toFixed(1)
        ),
      },
      {
        Icon: BoxIcon,
        label: (
          <Text size="12px" fw={600} pt="0" lh="16px">
            Per
            <Text size="12px" fw={600} lh="16px">
              Product
            </Text>
          </Text>
        ),
        value: parseFloat(
          (EmissionIntensityAverages.length > 0
            ? _.sumBy(EmissionIntensityAverages, "perproductaverage") /
              EmissionIntensityAverages.length
            : 0
          ).toFixed(1)
        ),
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
      return {
        year: item.year,
        month: item.month,
        kpi_em_CurrentEmissionIntensity_PerTonProduction:
          item.kpi_em_CurrentEmissionIntensity_PerTonProduction,
        kpi_em_CurrentEmissionIntensity_PerEmployee:
          item.kpi_em_CurrentEmissionIntensity_PerEmployee,
        kpi_em_CurrentEmissionIntensity_PerProduct:
          item.kpi_em_CurrentEmissionIntensity_PerProduct,
        address_id: item.address_id,
      };
    });
    if (isQuarterly) {
      setChartData((calculateQuaterlyIntensity(data) as any[]) || []);
    } else if (isYearly) {
      setChartData((calculateYearlyIntensity(data) as any[]) || []);
    } else if (isMonthly) {
      setChartData((calculateMonthlyIntensity(data) as any[]) || []);
    }
    sumOverallEmissionIntensity();
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
    totalEmissionPopoverContent: string = "",
    totalEmissionTrendDescription: string = "",
    totalEmissionTrendPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_intensity_insights } = kpiDescription || {};
  if (emission_intensity_insights && emission_intensity_insights.length > 0) {
    // For Emission Intensity
    const totalEmissionSnapshot: EmissionIntensityInsight | undefined =
      emission_intensity_insights.find(
        (desc: EmissionIntensityInsight) =>
          desc.category === "Emission Intensity"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission Intensity Trend
    const totalEmissionTrendSnapshot: EmissionIntensityInsight | undefined =
      emission_intensity_insights.find(
        (desc: EmissionIntensityInsight) =>
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
    chartData,
    "Emission Intensity Trend(in tco2e)",
    true
  );

  // This Function is used to generate the csv data for Emission Intensity Trend
  const getCsvTrendChartData = (): CSVEmissionIntensityTrend[] => {
    return chartDataMemo?.map((item) => ({
      Category: item.category,
      "Per Tonne Production":
        item.kpi_em_CurrentEmissionIntensity_PerTonProduction,
      "Per Employee": item.kpi_em_CurrentEmissionIntensity_PerEmployee,
      "Per Product": item.kpi_em_CurrentEmissionIntensity_PerProduct,
    }));
  };

  return (
    <Box id="emissionIntensityTrendScrollId" className="scrollIds">
      {/* <BlockHeading title="Emission Intensity Insights" />
      <Grid gutter="md" pt="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} p="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission Intensity"
              unit={`in ${unit}`}
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
                  [csvData],
                  ["Emission Intensity"],
                  [true]
                )
              }
              chartRef={chartRef}
            />
            <EmissionIntensity emissionIntensity={chartDataOverall} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <Card ref={chartRef1} p="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission Intensity Trend"
              unit={`in ${unit}`}
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
                  [getCsvTrendChartData()],
                  ["Emission Intensity Trend"]
                )
              }
              chartRef={chartRef1}
            />
            <EmissionIntensityTrend data={chartDataMemo} isIntensity />
          </Card>
        </Grid.Col>
      </Grid> */}
    </Box>
  );
}
export default EmissionIntensityInsightBlock;
