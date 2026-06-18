"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { getSelectedDurationValues } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { useDashboardStore } from "../../data-import/store/dashboard.store";

const CriticalFactorsBlock = dynamic(
  () =>
    import("~/components/ghg-dashboard/critical-factors/CriticalFactorsBlock"),
  {
    ssr: false,
  }
);
const CriticalFactorsBlockPage = () => {
  const [isDownload, setIsDownload] = useState<boolean>(false);
  const getGlobalDuration = useDashboardStore(
    (store: any) => store.globalFilters
  );
  const duration = getSelectedDurationValues(
    getGlobalDuration?.selectedDuration
  );
  return (
    <>
      {/* <div>CriticalFactorsBlockPage</div> */}
      <CriticalFactorsBlock
        isDownload={isDownload}
        selectedShowData={[duration]}
      />
    </>
  );
};
export default CriticalFactorsBlockPage;
