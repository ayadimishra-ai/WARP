import { Box, Card, Grid } from "@mantine/core";
import _ from "lodash";
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
  Diesel: number;
  Gasoline: number;
  Biodiesel: number;
  Ethanol: number;
  LPG: number;
  CNG: number;
  GaseousNitrogen: number;
  GaseousOxygen: number;
  LiquidNitrogen: number;
  CompressedAir: number;
  Electric: number;
  JetFuel: number;
  SAF: number;
  Coal: number;
  Petcoke: number;
  NaturalGas: number;
  Biomass: number;
  Bagasse: number;
  Kerosene: number;
}

type FuelConsumptionTreandBlockProps = {
  unit: string;
  data: {
    year: number;
    month: number;
    Diesel: number;
    Gasoline: number;
    Biodiesel: number;
    Ethanol: number;
    LPG: number;
    CNG: number;
    GaseousNitrogen: number;
    GaseousOxygen: number;
    LiquidNitrogen: number;
    CompressedAir: number;
    Electric: number;
    JetFuel: number;
    SAF: number;
    Coal: number;
    Petcoke: number;
    NaturalGas: number;
    Biomass: number;
    Bagasse: number;
    Kerosene: number;
  }[];
  selectedShowData: Array<SelectedShowDataDataType>;
};

function FuelConsumptionTreandBlock(props: FuelConsumptionTreandBlockProps) {
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
    setChartDataPie(
      [
        {
          category: "Biodiesel",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Biodiesel, 0)
            : 0,
        },
        {
          category: "CNG",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.CNG, 0)
            : 0,
        },
        {
          category: "Compressed Air",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.CompressedAir, 0)
            : 0,
        },
        {
          category: "Diesel",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Diesel, 0)
            : 0,
        },
        {
          category: "Electric",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Electric, 0)
            : 0,
        },
        {
          category: "Ethanol",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Ethanol, 0)
            : 0,
        },
        {
          category: "Gaseous Nitrogen",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.GaseousNitrogen, 0)
            : 0,
        },
        {
          category: "Gaseous Oxygen",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.GaseousOxygen, 0)
            : 0,
        },
        {
          category: "Gasoline",
          value: Array.isArray(props?.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Gasoline, 0)
            : 0,
        },
        {
          category: "Jet Fuel",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.JetFuel, 0)
            : 0,
        },
        {
          category: "LPG",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.LPG, 0)
            : 0,
        },
        {
          category: "Liquid Nitrogen",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.LiquidNitrogen, 0)
            : 0,
        },
        {
          category: "SAF",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.SAF, 0)
            : 0,
        },
        {
          category: "Coal",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Coal, 0)
            : 0,
        },
        {
          category: "NaturalGas",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.NaturalGas, 0)
            : 0,
        },
        {
          category: "Petcoke",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Petcoke, 0)
            : 0,
        },
        {
          category: "Biomass",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Biomass, 0)
            : 0,
        },
        {
          category: "Bagasse",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Bagasse, 0)
            : 0,
        },
        {
          category: "Kerosene",
          value: Array.isArray(props.data)
            ? props?.data?.reduce((acc, ele) => acc + ele.Kerosene, 0)
            : 0,
        },
      ].filter((item) => item.value != 0)
    );
  }, [props.data]);

  useEffect(() => {
    if (isQuarterly) {
      const quarterlyData = calculateQuaterly(props.data);
      let sums: any = {};
      let deleteKeyList: any = [];
      quarterlyData.forEach((obj) => {
        Object.keys(obj).forEach((key) => {
          if (key !== "category") {
            if (!sums[key]) {
              sums[key] = 0;
            }
            sums[key] += obj[key];
          }
        });
      });
      Object.keys(sums).forEach((key) => {
        if (sums[key] === 0) {
          deleteKeyList.push(key);
        }
      });

      quarterlyData.forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (deleteKeyList.includes(key)) {
            delete item[key];
          }
        });
      });
      setChartDataLine((quarterlyData as lineChartDataType[]) || []);
    } else if (isYearly) {
      const yearlyData = calculateYearlyNew(props.data);
      let sums: any = {};
      let deleteKeyList: any = [];
      yearlyData.forEach((obj) => {
        Object.keys(obj).forEach((key) => {
          if (key !== "category") {
            if (!sums[key]) {
              sums[key] = 0;
            }
            sums[key] += obj[key];
          }
        });
      });
      Object.keys(sums).forEach((key) => {
        if (sums[key] === 0) {
          deleteKeyList.push(key);
        }
      });

      yearlyData.forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (deleteKeyList.includes(key)) {
            delete item[key];
          }
        });
      });
      setChartDataLine((yearlyData as lineChartDataType[]) || []);
    } else if (isMonthly) {
      const monthlyData = calculateMonthly(props.data);
      let sums: any = {};
      let deleteKeyList: any = [];
      monthlyData.forEach((obj) => {
        Object.keys(obj).forEach((key) => {
          if (key !== "category") {
            if (!sums[key]) {
              sums[key] = 0;
            }
            sums[key] += obj[key];
          }
        });
      });
      Object.keys(sums).forEach((key) => {
        if (sums[key] === 0) {
          deleteKeyList.push(key);
        }
      });

      monthlyData.forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (deleteKeyList.includes(key)) {
            delete item[key];
          }
        });
      });
      setChartDataLine((monthlyData as lineChartDataType[]) || []);
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
    // For Emission by Fuel Types
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Fuel Types"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission by Fuel Consumption Trends
    const totalEmissionTrendSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission by Fuel Consumption Trends"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }

  const chartDataLineMemo = useMemo(() => {
    if (!chartDataLine?.length) return [];

    const grouped = _.groupBy(chartDataLine, "category");

    const result = _.map(grouped, (items, category) => ({
      category,
      Bagasse: _.sumBy(items, "Bagasse"),
      Biodiesel: _.sumBy(items, "Biodiesel"),
      Biomass: _.sumBy(items, "Biomass"),
      CNG: _.sumBy(items, "CNG"),
      Coal: _.sumBy(items, "Coal"),
      CompressedAir: _.sumBy(items, "CompressedAir"),
      Diesel: _.sumBy(items, "Diesel"),
      Electric: _.sumBy(items, "Electric"),
      Ethanol: _.sumBy(items, "Ethanol"),
      GaseousNitrogen: _.sumBy(items, "GaseousNitrogen"),
      GaseousOxygen: _.sumBy(items, "GaseousOxygen"),
      Gasoline: _.sumBy(items, "Gasoline"),
      JetFuel: _.sumBy(items, "JetFuel"),
      LPG: _.sumBy(items, "LPG"),
      LiquidNitrogen: _.sumBy(items, "LiquidNitrogen"),
      NaturalGas: _.sumBy(items, "NaturalGas"),
      Petcoke: _.sumBy(items, "Petcoke"),
      SAF: _.sumBy(items, "SAF"),
      Kerosene: _.sumBy(items, "Kerosene"),
    }));

    return result?.map((item: any) => {
      Object.keys(item).forEach((key) => {
        if (item[key] == undefined) {
          delete item[key];
        }
      });
      return item;
    });
  }, [chartDataLine]);

  return (
    <Box>
      <Grid gutter="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} padding="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission by Fuel Types"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Emission by Fuel Types", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Emission by Fuel Types", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataPie],
                  ["Emission by Fuel Types"],
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
              title="Emission by Fuel Consumption Trends"
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
                  "Emission by Fuel Consumption Trends",
                  "png"
                )
              }
              downloadPDF={() =>
                DownloadChart(
                  chartRef1,
                  "Emission by Fuel Consumption Trends",
                  "pdf"
                )
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [chartDataLineMemo],
                  ["Emission by Fuel Consumption Trends"]
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

export default FuelConsumptionTreandBlock;
