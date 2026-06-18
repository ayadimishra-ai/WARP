import { Box, Grid, Text } from "@mantine/core";
import Image from "next/image";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import {
  MyViewSnapshot,
  OrganizationLevelSnapshot,
} from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import MaterialIcon from "~/components/icons/MaterialIcon";
import TransportIcon from "~/components/icons/TransportIcon";
import WasteIcon from "~/components/icons/WasteIcon";
import EnergyIcon from "../../icons/EnergyIcon";
import FactoryIcon from "../../icons/FactoryIcon.svg";
import PackageIcon from "../../icons/PackageIcon";
import EmissionSnapshotCard, {
  ScopeEmissionBlockData,
} from "./EmissionSnapshotCard";

type ScopeData = {
  value?: number;
  change?: number;
  category?: { name: string; value: number; change?: number };
  product?: { name: string; value: number; change?: number };
  location?: { name: string; value: number; change?: number };
  subLocation?: { name: string; value: number; change?: number };
  subCategory?: { name: string; value: number; change?: number };
};
export interface emissionCardBlockProps {
  data: {
    snapshotType?: string;
    scopeEmission: ScopeData[];
    productName: string;
    productArea: string;
    categoryName: string;
    isDataAvailable: Boolean;
  };
  unit: string;
  forlocation: boolean;
}

const EmissionCardBlock: React.FC<emissionCardBlockProps> = ({
  data,
  unit,
  forlocation,
}) => {
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const {
    snapshotType,
    categoryName,
    productArea,
    productName,
    scopeEmission,
    isDataAvailable,
  } = data;

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionOrgSnapshotPopoverContent: string = "",
    totalEmissionProductOrgSnapshotPopoverContent: string = "",
    totalEmissionLocationOrgSnapshotPopoverContent: string = "",
    totalEmissionCategoryMyViewSnapshotPopoverContent: string = "",
    totalEmissionProductMyViewSnapshotPopoverContent: string = "",
    totalEmissionLocationMyViewSnapshotPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { organization_level_snapshot, my_view_snapshot } =
    kpiDescription || {};

  if (organization_level_snapshot && organization_level_snapshot.length > 0) {
    // For Total Emission - Organizational Level
    const totalEmissionOrgSnapshot: OrganizationLevelSnapshot | undefined =
      organization_level_snapshot.find(
        (desc: OrganizationLevelSnapshot) => desc.category === "Total Emission"
      );
    if (totalEmissionOrgSnapshot) {
      const { info = "" } = totalEmissionOrgSnapshot || {};
      totalEmissionOrgSnapshotPopoverContent = info;
    }

    // For Top Emission Product - Organizational Level
    const totalEmissionProductOrgSnapshot:
      | OrganizationLevelSnapshot
      | undefined = organization_level_snapshot.find(
      (desc: OrganizationLevelSnapshot) =>
        desc.category === "Top Emission Product"
    );
    if (totalEmissionProductOrgSnapshot) {
      const { info = "" } = totalEmissionProductOrgSnapshot || {};
      totalEmissionProductOrgSnapshotPopoverContent = info;
    }

    // For Top Emission Location - Organizational Level
    const totalEmissionLocationOrgSnapshot:
      | OrganizationLevelSnapshot
      | undefined = organization_level_snapshot.find(
      (desc: OrganizationLevelSnapshot) =>
        desc.category === "Top Emission Location"
    );
    if (totalEmissionLocationOrgSnapshot) {
      const { info = "" } = totalEmissionLocationOrgSnapshot || {};
      totalEmissionLocationOrgSnapshotPopoverContent = info;
    }
  }

  if (my_view_snapshot && my_view_snapshot.length > 0) {
    // For Top Emission Category - My View
    const totalEmissionCategoryMyViewSnapshot: MyViewSnapshot | undefined =
      my_view_snapshot.find(
        (desc: MyViewSnapshot) => desc.category === "Top Emission Category"
      );
    if (totalEmissionCategoryMyViewSnapshot) {
      const { info = "" } = totalEmissionCategoryMyViewSnapshot || {};
      totalEmissionCategoryMyViewSnapshotPopoverContent = info;
    }

    // For Top Emission Product - My View
    const totalEmissionProductMyViewSnapshot: MyViewSnapshot | undefined =
      my_view_snapshot.find(
        (desc: MyViewSnapshot) => desc.category === "Top Emission Product"
      );
    if (totalEmissionProductMyViewSnapshot) {
      const { info = "" } = totalEmissionProductMyViewSnapshot || {};
      totalEmissionProductMyViewSnapshotPopoverContent = info;
    }

    // For Top Emission Location - My View
    const totalEmissionLocationMyViewSnapshot: MyViewSnapshot | undefined =
      my_view_snapshot.find(
        (desc: MyViewSnapshot) => desc.category === "Top Emission Location"
      );
    if (totalEmissionLocationMyViewSnapshot) {
      const { info = "" } = totalEmissionLocationMyViewSnapshot || {};
      totalEmissionLocationMyViewSnapshotPopoverContent = info;
    }
  }
  const getIcon = (categoryData: ScopeEmissionBlockData) => {
    switch (categoryData.name) {
      case "Energy":
        return <EnergyIcon />;
      case "Waste":
        return <WasteIcon />;
      case "Transport":
        return <TransportIcon />;
      case "Material":
        return <MaterialIcon />;
    }
  };
  return (
    <Box
      mt="0"
      bg={snapshotType === "myview" ? "transparent" : "#142335"}
      pt={snapshotType === "myview" ? 0 : { base: 20, xl: 25 }}
      pb={25}
      px={snapshotType === "myview" ? 0 : "md"}
    >
      {snapshotType === "myview" ? (
        <></>
      ) : (
        <Text fz={{ base: 15, xl: 16 }} fw={"bold"} c="#FFFFFF">
          GHG Emission Snapshot - Organisational Level
        </Text>
      )}
      <Grid
        gutter="md"
        pt={snapshotType === "myview" ? 0 : "md"}
        mr={snapshotType === "myview" ? 0 : "xl"}
      >
        <Grid.Col span={{ base: 12, sm: 6, md: 12, lg: 4 }}>
          <EmissionSnapshotCard
            title={
              snapshotType === "myview"
                ? "Top Emission Category"
                : "Total Emission"
            }
            unit={unit}
            theme="orangeGradient"
            data={scopeEmission[0]?.category as ScopeEmissionBlockData}
            emchange={scopeEmission[0]?.change!}
            emvalue={scopeEmission[0]?.value!}
            icon={
              snapshotType === "myview"
                ? getIcon(scopeEmission[0]?.category as ScopeEmissionBlockData)
                : null
            }
            categoryName={categoryName}
            popoverInfo={
              snapshotType === "myview"
                ? totalEmissionCategoryMyViewSnapshotPopoverContent
                : totalEmissionOrgSnapshotPopoverContent
            }
            forlocation={forlocation}
            subData={scopeEmission[0]?.subCategory}
            isDataAvailable={isDataAvailable}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 12, lg: 4 }}>
          <EmissionSnapshotCard
            title="Top Emission Product"
            unit={unit}
            theme="brownGradient"
            data={scopeEmission[0]?.product as ScopeEmissionBlockData}
            icon={<PackageIcon />}
            productName={productName}
            popoverInfo={
              snapshotType === "myview"
                ? totalEmissionProductMyViewSnapshotPopoverContent
                : totalEmissionProductOrgSnapshotPopoverContent
            }
            forlocation={forlocation}
            isDataAvailable={isDataAvailable}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 12, lg: 4 }}>
          <EmissionSnapshotCard
            title="Top Emission Location"
            unit={unit}
            theme="greenGradient"
            data={scopeEmission[0]?.location as ScopeEmissionBlockData}
            icon={
              <Image width={36} height={36} alt="Factory" src={FactoryIcon} />
            }
            productArea={productArea}
            popoverInfo={
              snapshotType === "myview"
                ? totalEmissionLocationMyViewSnapshotPopoverContent
                : totalEmissionLocationOrgSnapshotPopoverContent
            }
            forlocation={forlocation}
            subData={scopeEmission[0]?.subLocation}
            isDataAvailable={isDataAvailable}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default EmissionCardBlock;
