import { Box, Card, Group, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionContributor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import { activeState } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import ChartHeadBlock from "../common/ChartHeadBlock";
import DownloadCSV from "../common/DownloadCSV";
import { DownloadChart } from "../common/DownloadChart";
import MapChartLocation from "./MapChartLocation";

export interface MapLocationData {
  name: string;
  address?: string;
  value: number;
  latitude?: any;
  longitude?: any;
}

const MapChartLocationBlock = (props: any) => {
  const [isMonthly, setMonthlyClick] = useState<boolean>(false);
  const [isYearly, setYearlyClick] = useState<boolean>(false);
  const [isQuarterly, setIsQuarterly] = useState<boolean>(true);
  const [isActive, setisActive] = useState<activeState>(
    props.selectedShowData[0].activeState
  );
  const [mapData, setMapData] = useState<Array<MapLocationData>>([]);
  const [csvLocationData, setCsvLocationData] = useState<
    Array<MapLocationData>
  >([]);
  const getStoreData = useDashboardStore((store: any) => store.current);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const chartRef = useRef<HTMLDivElement>(null);

  const handleQuarterly = () => {
    setIsQuarterly(true);
    setYearlyClick(false);
    setMonthlyClick(false);
  };

  const handleYearly = () => {
    setYearlyClick(true);
    setIsQuarterly(false);
    setMonthlyClick(false);
  };

  const handleMonthly = () => {
    setYearlyClick(false);
    setIsQuarterly(false);
    setMonthlyClick(true);
  };

  useEffect(() => {
    const createMainData = getStoreData?.currentYear?.main?.map(
      (item: any) => ({
        ...item,
        // name: item?.OrganizationAddress?.Address?.City?.name,
        name: item?.OrganizationAddress?.Address?.name,
        address: item?.OrganizationAddress?.Address?.full_address,
        latitude: item?.OrganizationAddress?.Address?.latitude,
        longitude: item?.OrganizationAddress?.Address?.longitude,
        value: parseFloat(item?.kpi_em_Total_Emission).toFixed(1),
      })
    );
    const updatedData = createMainData?.filter(
      (item: any) => item.address !== undefined && item.name !== undefined
    );
    const totalEmissionsByLocation = calculateTotalEmissions(updatedData);

    if (totalEmissionsByLocation && totalEmissionsByLocation.length > 0) {
      // csvData is used to generate csv data for locations
      const csvData: MapLocationData[] = [];
      totalEmissionsByLocation?.map((item) => {
        csvData.push({
          name: item.name,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          value: item.value,
        });
      });
      setCsvLocationData(csvData);
      setMapData(totalEmissionsByLocation);
    } else {
      setCsvLocationData([]);
      setMapData([]);
    }
  }, [isYearly, isMonthly, isQuarterly, getStoreData]);

  function calculateTotalEmissions(data: any) {
    const result: any[] = [];

    // To store data group by location name
    const emissionTotals: any = {};

    data?.forEach((entry: any) => {
      const name = entry?.name;
      const emission = entry?.kpi_em_Total_Emission;

      // If name already exists in emissionTotals, add to the existing total, otherwise initialize
      if (emissionTotals[name]) {
        emissionTotals[name] += emission;
      } else {
        emissionTotals[name] = emission;
      }
    });

    // Sum to value for total emission
    Object.keys(emissionTotals)?.forEach((name) => {
      const totalEmission = emissionTotals[name];
      const addressEntry = data?.find((entry: any) => entry.name === name);
      if (addressEntry) {
        result.push({
          ...addressEntry,
          value: parseFloat(totalEmission).toFixed(1),
        });
      }
    });

    return result;
  }

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
    // For Contribution in Total Emission by Locations
    const totalEmissionSnapshot: EmissionContributor | undefined =
      emission_contributors?.find(
        (desc: EmissionContributor) =>
          desc.category === "Contribution in Total Emission by Locations"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }
  }

  // console.log("mapdata", mapData);

  return (
    <Card ref={chartRef} padding="md" radius="md" h="100%">
      <ChartHeadBlock
        title="Contribution in Total Emission by Locations"
        unit={`in ${unit}`}
        description={totalEmissionDescription}
        popoverContent={totalEmissionPopoverContent}
        tabs={false}
        yearlyData={handleYearly}
        quarterlyData={handleQuarterly}
        monthlyData={handleMonthly}
        isShow={isActive}
        DownloadChart={() =>
          DownloadChart(
            chartRef,
            "Contribution in Total Emission by Locations",
            "png"
          )
        }
        downloadPDF={() =>
          DownloadChart(
            chartRef,
            "Contribution in Total Emission by Locations",
            "pdf"
          )
        }
        DownloadCSV={() =>
          DownloadCSV<Record<string, any>>(
            [csvLocationData],
            ["Contribution in Total Emission by Locations"],
            [true]
          )
        }
        chartRef={chartRef}
        singleBlock
      />
      <Box mt="md">
        {mapData?.length === 0 ? (
          <Group h="300px" align="center" justify="center">
            <Text
              opacity={0.5}
              fz={14}
              styles={{
                root: {
                  textShadow: "black 0px 0px",
                },
              }}
            >
              No data available
            </Text>
          </Group>
        ) : (
          <MapChartLocation mapLocationData={mapData} />
        )}
      </Box>
    </Card>
  );
};

export default MapChartLocationBlock;
