"use client";
import { Box } from "@mantine/core";
import dynamic from "next/dynamic";
import { getSelectedDurationValues } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { useDashboardStore } from "../../data-import/store/dashboard.store";
const EmissionContributorsBlock = dynamic(
  () =>
    import(
      "~/components/ghg-dashboard/emission-contributors/EmissionContributorsBlock"
    ),
  {
    ssr: false,
  }
);
const EmissionIntensityInsightBlockPage = () => {
  const getGlobalDuration = useDashboardStore(
    (store: any) => store.globalFilters
  );
  const duration = getSelectedDurationValues(
    getGlobalDuration?.selectedDuration
  );
  return (
    <Box>
      <EmissionContributorsBlock selectedShowData={[duration]} />
    </Box>
  );
};
export default EmissionIntensityInsightBlockPage;
