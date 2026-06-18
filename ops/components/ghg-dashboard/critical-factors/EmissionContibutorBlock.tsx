"use client";
import { Box, Card, Grid } from "@mantine/core";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import {
  activeState,
  SelectedShowDataDataType,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { short_months } from "~/utils/date.util";
import ChartHeadBlock from "../common/ChartHeadBlock";
import DownloadCSV from "../common/DownloadCSV";
import { DownloadChart } from "../common/DownloadChart";
import LineLableChart from "../common/LineLableChart";
import {
  getQuarterName,
  getYearCategoryNameNumber,
} from "../common/NumberFormat";
import EmissionByScopeProgress from "../common/TotalEmissionRingProgress";

interface ScopeChartDataType {
  category: string;
  power: number;
  fuel: number;
  transport: number;
  waste: number;
}
type ScopeData = {
  value: number;
  name: string;
};
type TEmissionContributorBlockMonthlyData = {
  year: number;
  month: number;
  power: number;
  fuel: number;
  transport: number;
  waste: number;
};

type EmissionContributorBlockProps = {
  data: {
    power: {
      year: number;
      month: number;
      em_PowerConsumption: number;
    }[];
    fuel: {
      year: number;
      month: number;
      em_FuelConsumption: number;
    }[];
    transport: {
      year: number;
      month: number;
      em_Transport: number;
    }[];
    waste: {
      year: number;
      month: number;
      em_WasteGeneration: number;
    }[];
  };
  selectedShowData: Array<SelectedShowDataDataType>;
  unit: string;
};

//by satej
type FinalFormat = {
  year: number;
  month: number;
  power: number;
  fuel: number;
  transport: number;
  waste: number;
};

function EmissionContributorBlock(props: EmissionContributorBlockProps) {
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
  const [totalEmissionByScope, settotalEmissionByScope] = useState<
    Array<ScopeData>
  >([]);
  const [scopeChartData, setScopeChartData] = useState<
    Array<ScopeChartDataType>
  >([]);

  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const chartRef1 = useRef<HTMLDivElement>(null);

  const power = props.data?.power ?? [];
  const fuel = props.data?.fuel ?? [];
  const transport = props.data?.transport ?? [];
  const waste = props.data?.waste ?? [];
  const { unit } = props || {};

  // =========================================================================================
  // changes by satej goes here

  const monthlyData = (): any[] => {
    const allData = [...fuel, ...power, ...transport, ...waste];
    const finalData: FinalFormat[] = [];

    const dateSet = new Set<string>();
    allData
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      })
      .forEach((item) => dateSet.add(`${item.year}-${item.month}`));

    dateSet.forEach((date) => {
      const [year, month] = date.split("-").map(Number);
      const finalItem: FinalFormat = {
        year,
        month,
        power: 0,
        fuel: 0,
        transport: 0,
        waste: 0,
      };

      fuel.forEach((item) => {
        if (item.year === year && item.month === month) {
          finalItem.fuel = finalItem.fuel + item.em_FuelConsumption;
        }
      });

      power.forEach((item) => {
        if (item.year === year && item.month === month) {
          finalItem.power = finalItem.power + item.em_PowerConsumption;
        }
      });

      transport.forEach((item) => {
        if (item.year === year && item.month === month) {
          finalItem.transport = finalItem.transport + item.em_Transport;
        }
      });

      waste.forEach((item) => {
        if (item.year === year && item.month === month) {
          finalItem.waste = finalItem.waste + item.em_WasteGeneration;
        }
      });
      finalData.push(finalItem);
    });

    return finalData;
  };
  useMemo(() => {
    if (!!props.selectedShowData.length) {
      setMonthlyClick(props.selectedShowData[0].isMonthly);
      setYearlyClick(props.selectedShowData[0].isYearly);
      setIsQuarterly(props.selectedShowData[0].isQuarterly);
      setisActive(props.selectedShowData[0].activeState);
    }
  }, [props.selectedShowData]);

  const finalResultMonthly = monthlyData();

  const getCategory = (year: number, quarter: number): string => {
    const startYear = parseInt(year.toString().slice(2));
    const endYear = startYear + 1;
    return `${startYear}-${endYear} Q${quarter}`;
  };

  const quartelyData = (
    fuel: any[],
    power: any[],
    transport: any[],
    waste: any[]
  ): any[] => {
    const allData = [...fuel, ...power, ...transport, ...waste];
    const finalDataMap: Map<string, any> = new Map();

    allData
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      })
      .forEach((item) => {
        const category = getQuarterName(item.month, item.year);

        if (!finalDataMap.has(category)) {
          finalDataMap.set(category, {
            power: 0,
            fuel: 0,
            transport: 0,
            waste: 0,
            category,
          });
        }

        const finalItem = finalDataMap.get(category)!;

        if (item.em_FuelConsumption !== undefined) {
          finalItem.fuel += item.em_FuelConsumption;
        }
        if (item.em_PowerConsumption !== undefined) {
          finalItem.power += item.em_PowerConsumption;
        }
        if (item.em_Transport !== undefined) {
          finalItem.transport += item.em_Transport;
        }
        if (item.em_WasteGeneration !== undefined) {
          finalItem.waste += item.em_WasteGeneration;
        }
      });

    return Array.from(finalDataMap.values());
  };

  const finalResultQaurterly = quartelyData(fuel, power, transport, waste);

  const yearlyData = (
    fuel: any[],
    power: any[],
    transport: any[],
    waste: any[]
  ): any[] => {
    const allData = [...fuel, ...power, ...transport, ...waste];
    const finalDataMap: Map<unknown, any> = new Map();

    allData
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.month - b.month;
      })
      .forEach((item) => {
        const category = getYearCategoryNameNumber(item.month, item.year);
        const key = category;
        if (!finalDataMap.has(key)) {
          finalDataMap.set(key, {
            power: 0,
            fuel: 0,
            transport: 0,
            waste: 0,
            category: category,
          });
        }

        const finalItem = finalDataMap.get(key)!;

        if (item.em_FuelConsumption !== undefined) {
          finalItem.fuel += item.em_FuelConsumption;
        }
        if (item.em_PowerConsumption !== undefined) {
          finalItem.power += item.em_PowerConsumption;
        }
        if (item.em_Transport !== undefined) {
          finalItem.transport += item.em_Transport;
        }
        if (item.em_WasteGeneration !== undefined) {
          finalItem.waste += item.em_WasteGeneration;
        }
      });

    return Array.from(finalDataMap.values());
  };

  const finalYearlyResult = yearlyData(fuel, power, transport, waste);

  // ===================================================================================================

  useEffect(() => {
    settotalEmissionByScope([
      {
        name: "Power",
        value: Array.isArray(power)
          ? power.reduce((acc, ele) => acc + ele.em_PowerConsumption, 0)
          : 0,
      },
      {
        name: "Fuel",
        value: Array.isArray(fuel)
          ? fuel.reduce((acc, ele) => acc + ele.em_FuelConsumption, 0)
          : 0,
      },
      {
        name: "Transport",
        value: Array.isArray(transport)
          ? transport.reduce((acc, ele) => acc + ele.em_Transport, 0)
          : 0,
      },
      {
        name: "Waste",
        value: Array.isArray(waste)
          ? waste.reduce((acc, ele) => acc + ele.em_WasteGeneration, 0)
          : 0,
      },
    ]);
  }, [props.data]);

  useEffect(() => {
    if (isQuarterly) {
      setScopeChartData(finalResultQaurterly);
    } else if (isYearly) {
      setScopeChartData(finalYearlyResult);
    } else if (isMonthly) {
      setScopeChartData(
        finalResultMonthly.map((item) => ({
          category: `${short_months[item.month - 1]} ${item.year}`,
          fuel: item.fuel,
          transport: item.transport,
          power: item.power,
          waste: item.waste,
        }))
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
    // For Emission Contributors
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission Contributors"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }

    //For Emission Contributors Trend
    const totalEmissionTrendSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category === "Emission Contributors Trend"
      );
    if (totalEmissionTrendSnapshot) {
      const { description: desc = "", info = "" } =
        totalEmissionTrendSnapshot || {};
      totalEmissionTrendDescription = desc;
      totalEmissionTrendPopoverContent = info;
    }
  }

  const scopeChartDataMemo = useMemo(() => {
    if (!scopeChartData?.length) return [];

    let keys = Object.keys(scopeChartData[0]).filter(
      (key) => key != "category"
    );

    const grouped = _.groupBy(scopeChartData, "category");

    const result = _.map(grouped, (items, category) => {
      const obj = keys.reduce(
        (acc: any, key: any) => {
          acc[key] = _.sumBy(items, key);
          return acc;
        },
        { category }
      );

      return obj;
    });
    return result;
  }, [scopeChartData]);

  return (
    <Box>
      <Grid gutter="md">
        <Grid.Col span={{ md: 12, lg: 4 }}>
          <Card ref={chartRef} p="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission Contributors"
              unit={`in ${unit}`}
              description={totalEmissionDescription}
              popoverContent={totalEmissionPopoverContent}
              tabs={false}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef, "Emission Contributors", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef, "Emission Contributors", "pdf")
              }
              DownloadCSV={() => {
                DownloadCSV<Record<string, any>>(
                  [
                    totalEmissionByScope.map((ele) => ({
                      name: ele.name,
                      value: ele.value,
                    })),
                  ],
                  ["Emission Contributors"],
                  [true]
                );
              }}
              chartRef={chartRef}
            />
            <EmissionByScopeProgress totalEmission={totalEmissionByScope} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ md: 12, lg: 8 }}>
          <Card ref={chartRef1} p="md" radius="md" h="100%">
            <ChartHeadBlock
              title="Emission Contributors Trend"
              unit={`in ${unit}`}
              description={totalEmissionTrendDescription}
              popoverContent={totalEmissionTrendPopoverContent}
              tabs={true}
              yearlyData={handleYearly}
              quarterlyData={handleQuarterly}
              monthlyData={handleMonthly}
              isShow={isActive}
              DownloadChart={() =>
                DownloadChart(chartRef1, "Emission Contributors Trend", "png")
              }
              downloadPDF={() =>
                DownloadChart(chartRef1, "Emission Contributors Trend", "pdf")
              }
              DownloadCSV={() =>
                DownloadCSV<Record<string, any>>(
                  [scopeChartDataMemo],
                  ["Emission Contributors Trend"]
                )
              }
              chartRef={chartRef1}
            />
            <LineLableChart data={scopeChartDataMemo} />
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
export default EmissionContributorBlock;
