"use client";
import { Box } from "@mantine/core";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  activeState,
  SelectedShowDataDataType,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";

const MapChartLocationBlock = dynamic(
  () =>
    import(
      "~/components/ghg-dashboard/emission-location-map/MapChartLocationBlock"
    ),
  {
    ssr: false,
  }
);
const EmissionContributionByLocation = () => {
  const [selectedShowData, setSelectedShowData] = useState<
    Array<SelectedShowDataDataType>
  >([
    {
      isYearly: false,
      isQuarterly: true,
      isMonthly: true,
      activeState: activeState.isQuarterly,
    },
  ]);
  return (
    <Box>
      <MapChartLocationBlock selectedShowData={selectedShowData} />
    </Box>
  );
};
export default EmissionContributionByLocation;
