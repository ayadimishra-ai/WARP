"use client";
import {
  ActionIcon,
  Affix,
  AppShell,
  Box,
  Burger,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import NavbarContainer from "~/components/ghg-dashboard/navbar/navbar-container";
import { useGetRegionLocationAndAppGlobalMasterDataQuery } from "~/graphql/queries/get-region-location-and-app-global-master-data.generated";
import { useUserSession } from "~/hooks/use-user-session";
import {
  activeState,
  SelectedShowDataDataType,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { getModuleGlobalConfig } from "~/lib/op-database/op-service.server";
import { useDashboardStore } from "../data-import/store/dashboard.store";
const GreenBullet = dynamic(() => import("~/components/icons/GreenBullet"), {
  ssr: false,
});
const RangeIcon = dynamic(() => import("~/components/icons/RangeIcon"), {
  ssr: false,
});
const DownloadIcon = dynamic(() => import("~/components/icons/DownloadIcon"), {
  ssr: false,
});
const Sidebar = dynamic(() => import("~/components/ghg-dashboard/Sidebar"), {
  ssr: false,
});

type TEmbedLayoutProps = {
  children: React.ReactNode;
  ghg_snapshot_org: React.ReactNode;
  ghg_snapshot_my_view: React.ReactNode;
  emission_by_critical_factors: React.ReactNode;
  emission_intensity_insight_block: React.ReactNode;
  //left_sidebar: React.ReactNode;
  emission_contributors_block: React.ReactNode;
  TotalEmissionProductsTable: React.ReactNode;
  MapChartLocationBlock: React.ReactNode;
};

const DashboardLayout: React.FC<React.PropsWithChildren<TEmbedLayoutProps>> = ({
  children,
  ghg_snapshot_org,
  emission_by_critical_factors,
  ghg_snapshot_my_view,
  emission_intensity_insight_block,
  //left_sidebar,
  emission_contributors_block,
  TotalEmissionProductsTable,
  MapChartLocationBlock,
}) => {
  const [opened, { toggle }] = useDisclosure();
  const smallDevice = useMediaQuery("(max-width: 768px)");
  const smallLaptop = useMediaQuery("(max-width: 1366px)");
  const mediaFilters = useMediaQuery("(max-width: 1200px)");
  const [captureInProgress, setCaptureInProgress] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedShowData, setSelectedShowData] = useState<
    Array<SelectedShowDataDataType>
  >([
    {
      isYearly: true,
      isQuarterly: true,
      isMonthly: true,
      activeState: activeState.isQuarterly,
    },
  ]);
  const [activeMenuItem, setActiveMenuItem] = useState("OverviewScrollId");

  const formatDate = (date: any) => {
    const lastUpdated = new Date(date);
    if (lastUpdated && lastUpdated.toString() !== "Invalid Date") {
      return lastUpdated?.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else {
      return "N/A";
    }
  };

  const handleCaptureAndDownload = () => {
    window.parent.postMessage("loading", "*");
    setCaptureInProgress(true);
    setTimeout(() => {
      if (!captureRef.current) return;
      html2canvas(captureRef.current).then((canvas: any) => {
        const dataUrl = canvas.toDataURL();
        const link = document.createElement("a");
        link.download = "Report.png";
        link.href = dataUrl;
        link.click();
        setCaptureInProgress(false);
        window.parent.postMessage("noLoading", "*");
      });
    }, 4000);
  };

  const {
    current,
    refreshDBData,
    setDashboardDescription,
    setRegionsGlobalFilter,
    setLocationsGlobalFilter,
    setRegionData,
    setLocationData,
    setOrganizationData,
  } = useDashboardStore((state) => ({
    current: state.current,
    refreshDBData: state.refreshDBData,
    setDashboardDescription: state.setDashboardDescription,
    setRegionsGlobalFilter: state.setRegionsGlobalFilter,
    setLocationsGlobalFilter: state.setLocationsGlobalFilter,
    setRegionData: state.setRegionData,
    setLocationData: state.setLocationData,
    setOrganizationData: state.setOrganizationData,
  }));

  const { baseLineKPIData } = current || {};

  //===================================================================================
  const session = useUserSession();
  const { userId = null, organizationId = null } = session || {};

  const { data: regionsLocationsAndGlobalMasterData } =
    useGetRegionLocationAndAppGlobalMasterDataQuery({
      variables: {
        key: "kpi_description_dashboard_key",
        type: "dashboard-kpis-descriptions",
        organizationId,
        userId,
      },
      skip: !userId || !organizationId,
    });

  let AppGlobalMaster: any = [];
  useEffect(() => {
    const fetchConfigData = async () => {
      const configData: any = await getModuleGlobalConfig();
      AppGlobalMaster = [
        {
          data: configData?.GlobalConfigs?.[0]?.configuration,
          key: configData?.GlobalConfigs?.[0]?.type,
        },
      ];
    };
    fetchConfigData();
    setDashboardDescription({ kpiDescription: AppGlobalMaster?.data });
  }, [setDashboardDescription]);

  const regionData = regionsLocationsAndGlobalMasterData?.Region;
  const locationData =
    regionsLocationsAndGlobalMasterData?.UserOrganizationAddressMapping;
  // const AppGlobalMaster = regionsLocationsAndGlobalMasterData?.AppGlobalMaster;
  const organizationData = regionsLocationsAndGlobalMasterData?.Organization;

  //below code is added by satej for loading time optimization purpose
  useEffect(() => {
    if (organizationData) {
      setOrganizationData(organizationData);
    }
    if (regionData) {
      const allRegions = regionData?.map((obj: any) => obj.id);
      if (allRegions && allRegions.length > 0) {
        setRegionsGlobalFilter(allRegions);
      }
      setRegionData(regionData);
    }
  }, [regionData, organizationData]);

  useEffect(() => {
    if (locationData) {
      let locationsArr = locationData?.map((loc: any) => {
        return {
          value: loc?.organization_address_id,
          label: loc?.OrganizationAddress?.Address?.name,
        };
      });
      setLocationData(locationsArr);
      setLocationsGlobalFilter(locationsArr?.map((obj: any) => obj.value));
    }
  }, [locationData]);

  //===================================================================================

  useEffect(() => {
    if (!baseLineKPIData || baseLineKPIData.length === 0) return;

    const maxTimestamp = new Date(
      Math.max(
        ...(baseLineKPIData as { timestamp: string }[]).map((d) =>
          new Date(d.timestamp).getTime()
        )
      )
    );
    setLastUpdated(maxTimestamp);
  }, [baseLineKPIData]);

  let lastScrollTop = 0;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop < lastScrollTop) {
        window.parent.postMessage("up", "*");
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
      lastScrollTop = scrollTop;
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //====================================================
  const containers = useMemo(
    () => [
      { name: "Overview", id: "OverviewScrollId", main: true },
      {
        name: "Emission by Scope",
        id: "EmissionsbyScopeScrollId",
        main: true,
      },
      { name: "Scope 1 Emission", id: "scope1EmissionsScrollId", main: false },
      {
        name: "Scope 1 Contributors",
        id: "scope1ContributorsScrollId",
        main: false,
      },
      // {
      //   name: "Emission by Fuel Types",
      //   id: "emissionByFuelTypesScrollId",
      //   main: false,
      // },
      { name: "Scope 2 Emission", id: "scope2EmissionsScrollId", main: false },
      { name: "By Power Purchase", id: "byPowerPurchaseScrollId", main: false },
      { name: "By Power Vendors", id: "byPowerVendorsScrollId", main: false },
      {
        name: "By Power Consumption",
        id: "byPowerConsumptionScrollId",
        main: false,
      },
      // {
      //   name: "Emission Intensity",
      //   id: "emissionsIntensityScrollId",
      //   main: false,
      // },
      { name: "Scope 3 Emission", id: "scope3EmissionsScrollId", main: false },
      {
        name: "From Upstream & Downstream",
        id: "fromUpstreamDownstreamScrollId",
        main: false,
      },
      { name: "From Categories", id: "fromCategoriesScrollId", main: false },
      { name: "From Suppliers", id: "fromSuppliersScrollId", main: false },
      {
        name: "From Supply Categories",
        id: "fromSupplyCategoriesScrollId",
        main: false,
      },
      // {
      //   name: "Emission Intensity Insights",
      //   id: "emissionIntensityTrendScrollId",
      //   main: true,
      // },
      {
        name: "Emission Contributors",
        id: "emissionContributorsScrollId",
        main: true,
      },
      { name: "By Work Streams", id: "byWorkStreamsScrollId", main: false },
      { name: "By Categories", id: "byCategoriesScrollId", main: false },
      { name: "By Regions", id: "byRegionsScrollId", main: false },
      { name: "By Products", id: "byProductsScrollId", main: false },
      { name: "By Locations", id: "byLocationsScrollId", main: false },
    ],
    []
  );
  const handleScroll = () => {
    let foundActiveItem = "";
    containers.forEach((container) => {
      const containerElement = document.getElementById(container.id);
      if (containerElement) {
        const { top } = containerElement.getBoundingClientRect();
        if (top <= 70) {
          foundActiveItem = container.id;
        }
      }
    });
    setActiveMenuItem(foundActiveItem);
  };

  useEffect(() => {
    if (captureInProgress) {
      if (containers.length > 0) {
        const firstContainerId = containers[0].id;
        const firstContainerElement = document.getElementById(firstContainerId);
        if (firstContainerElement) {
          const offset = 70;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = firstContainerElement.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "auto",
          });

          setActiveMenuItem(firstContainerId);
        }
      }
      return;
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [captureInProgress, containers, setActiveMenuItem]);

  const handleScrollUpDown = (direction: "up" | "down") => {
    const currentIndex = containers.findIndex(
      (container) => container.id === activeMenuItem
    );

    const getNextIndex = (currentIndex: number): number | null => {
      if (direction === "up" && currentIndex > 0) {
        return currentIndex - 1;
      } else if (direction === "down" && currentIndex < containers.length - 1) {
        return currentIndex + 1;
      }
      return null;
    };

    const nextIndex = getNextIndex(currentIndex);
    if (nextIndex !== null) {
      const nextContainer = containers[nextIndex];
      const nextContainerElement = document.getElementById(nextContainer.id);
      if (nextContainerElement) {
        const offset = smallLaptop
          ? nextContainer.main === false
            ? 65
            : 50
          : nextContainer.main === false
            ? 50
            : 30;
        const containerTop =
          nextContainerElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: containerTop - offset, behavior: "auto" });
      }
    }
  };

  const isFirstItem =
    containers.findIndex((container) => container.id === activeMenuItem) === 0;
  const isLastItem =
    containers.findIndex((container) => container.id === activeMenuItem) ===
    containers.length - 1;

  return (
    <Box>
      <AppShell
        header={{ height: { base: 70, xl: 50 } }}
        navbar={{
          width: 320,
          breakpoint: "md",
          collapsed: { mobile: !opened },
        }}
        ref={captureRef}
        className="no-scrollbar"
      >
        <Affix position={{ bottom: 120, right: 5 }}>
          <ActionIcon
            onClick={() => handleScrollUpDown("up")}
            radius="xl"
            size="lg"
            className="upDownArrow"
            disabled={isFirstItem}
          >
            <IconArrowUp width={18} height={18} />
          </ActionIcon>
        </Affix>
        <Affix position={{ bottom: 80, right: 5 }}>
          <ActionIcon
            onClick={() => handleScrollUpDown("down")}
            radius="xl"
            size="lg"
            className="upDownArrow"
            disabled={isLastItem}
          >
            <IconArrowDown width={18} height={18} />
          </ActionIcon>
        </Affix>
        <AppShell.Header>
          <Group
            px="md"
            justify="space-between"
            align="center"
            h={{ base: 70, xl: 50 }}
            py={{ base: 10, xl: 13 }}
          >
            <Flex
              gap={{ base: 0, xl: "sm" }}
              direction={{ base: "column", xl: "row" }}
            >
              <Text fz={20} fw={600} c="#1A1A1A">
                GHG Emission Insights
              </Text>
              {!smallDevice && (
                <Flex gap={{ base: "xs", xl: "sm" }}>
                  <Flex align="center" gap="xs">
                    <Text fz={11} c="#666666">
                      Last Updated: {formatDate(lastUpdated)}
                    </Text>
                    <GreenBullet />
                  </Flex>
                  <Flex align="center" gap="xs">
                    <Text fz={11} c="#666666">
                      Emission Range:
                    </Text>
                    <Text fz={11} c="#666666">
                      Low
                    </Text>
                    <RangeIcon />
                    <Text fz={11} c="#666666">
                      High
                    </Text>
                  </Flex>
                </Flex>
              )}
            </Flex>
            <Flex gap="5px" align="center" mr="xl">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Divider
                orientation="vertical"
                size="sm"
                h={{ base: 38, xl: 28 }}
              />
              <ActionIcon
                onClick={handleCaptureAndDownload}
                variant="transparent"
              >
                <DownloadIcon />
              </ActionIcon>
            </Flex>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar
          p="sm"
          pr="5"
          bg={captureInProgress ? "#f7f9fb" : "#ffffff"}
          withBorder={captureInProgress ? false : true}
        >
          {/* {left_sidebar} */}
          <ScrollArea
            scrollbars="y"
            offsetScrollbars
            styles={{
              scrollbar: { transform: "none" },
              thumb: { backgroundColor: "#eaeef2", transform: "none" },
            }}
            scrollHideDelay={0}
          >
            <Box pr="5" pb="20px">
              <Sidebar
                currentScrolledSection={activeMenuItem}
                scrollcontainers={containers}
                captureInProgress={captureInProgress}
              />
            </Box>
          </ScrollArea>
        </AppShell.Navbar>
        <AppShell.Main bg="#F7F9FB" id="OverviewScrollId" className="scrollIds">
          <Box>{ghg_snapshot_org}</Box>

          <Container px="md" mr="xl" fluid>
            <Text
              fz={{ base: 14, xl: 16 }}
              c="#000000"
              fw={700}
              pos={mediaFilters ? "relative" : "absolute"}
              mt={20}
            >
              GHG Emission Snapshot - My View
            </Text>
            <Box
              style={{
                zIndex: mediaFilters ? 99 : 9999,
                float: mediaFilters ? "left" : "right",
              }}
              top={mediaFilters ? "0px" : { base: "5px", xl: "-5px" }}
              pos={mediaFilters ? "relative" : "sticky"}
              mr={"40px"}
              mb={mediaFilters ? "lg" : "0"}
            >
              <NavbarContainer />
            </Box>
            <Box>{ghg_snapshot_my_view}</Box>
            <Box>{emission_by_critical_factors}</Box>
            <Box id="emissionsIntensityScrollId" className="scrollIds">
              {emission_intensity_insight_block}
            </Box>
            <Box id="emissionContributorsScrollId" className="scrollIds">
              {emission_contributors_block}
            </Box>
            <Grid
              gutter="md"
              pt="md"
              id="byProductsScrollId"
              className="subScrollIds"
            >
              <Grid.Col span={12}>
                <Card padding="md" radius="md">
                  {TotalEmissionProductsTable}
                </Card>
              </Grid.Col>
            </Grid>
            <Grid
              gutter="md"
              py="md"
              mb="lg"
              id="byLocationsScrollId"
              className="subScollIds"
            >
              <Grid.Col span={12}>{MapChartLocationBlock}</Grid.Col>
            </Grid>
          </Container>
        </AppShell.Main>
      </AppShell>
    </Box>
  );
};

export default DashboardLayout;
