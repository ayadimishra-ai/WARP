import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Popover,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import EmissionByScopeProgress from "~/components/ghg-dashboard/common/TotalEmissionRingProgress";
import InfoIcon from "~/components/icons/InfoIcon";
import {
  getInfoDescriptionForSidebar,
  sumFields,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import { formattedNumber } from "./common/NumberFormat";
interface InfoItemProps {
  label: string;
  info: string;
  size: string;
  fw: number;
  color: string;
  unit?: string;
  isInfoVisible: boolean;
  mainHeading?: boolean;
  lhOnlyforSidebar?: number;
}
type BaselineData = {
  value: number;
  name: string;
};
// Component for rendering individual info items
const InfoItem: React.FC<InfoItemProps> = ({
  label,
  info,
  size,
  fw,
  color,
  unit,
  isInfoVisible,
  mainHeading,
  lhOnlyforSidebar,
}) => (
  <Flex
    gap={5}
    justify="flex-start"
    align={mainHeading ? "flex-start" : "center"}
    direction="row"
    wrap="wrap"
    my={mainHeading ? "0" : "12px"}
    style={{ cursor: "pointer" }}
  >
    <Text size={size} c={color} fw={fw} lh={lhOnlyforSidebar}>
      {label}
      {unit && (
        <Text
          fw={400}
          span={!mainHeading}
          ml="2px"
          size={mainHeading ? "11px" : size}
          lh={mainHeading ? "21px" : size}
        >
          ({unit === "in tco2e" ? "in tCO2e" : unit})
        </Text>
      )}
    </Text>
    {isInfoVisible ? (
      <Popover width={200} trapFocus position="bottom" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon variant="transparent" radius="xs" p={0} size={16} hidden>
            <InfoIcon />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Text size="12px" c="#666666">
            {info}
          </Text>
        </Popover.Dropdown>
      </Popover>
    ) : (
      <></>
    )}
  </Flex>
);

// Sidebar component
interface SidebarProps {
  isSidebar?: boolean;
  onSidebarChildEvent?: (value: any) => void;
  currentScrolledSection?: string;
  scrollcontainers?: Scrollcontainers[];
  captureInProgress?: boolean;
}
interface IntensityData {
  value: number;
  label: string;
}
interface Scrollcontainers {
  name: string;
  id: string;
  main: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebar = true,
  onSidebarChildEvent,
  currentScrolledSection,
  scrollcontainers,
  captureInProgress,
}) => {
  const [emissionData, setChartDataOverall] = useState<Array<IntensityData>>(
    []
  );
  const [scopeOverall, setScopeOverall] = useState<Array<BaselineData>>([]);
  const [allScopeOverall, setAllScopeOverall] = useState(0);
  const getStoreData = useDashboardStore((store: any) => store.current);
  const [currentSection, setCurrentSection] = useState<String>("");
  const [sumOfEmissionIntensity, setSumOfEmissionIntensity] =
    useState<number>(0);
  const isSmallLaptop = useMediaQuery(`(max-width: 1366px)`);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );
  const { kpiDescription } = dashboardDescription || {};

  const [viewMore, setViewMore] = useState(false);

  const sumOverallEmissionIntensity = () => {
    const fieldsToSum = [
      "kpi_em_CurrentEmissionIntensity_PerTonProduction",
      "kpi_em_CurrentEmissionIntensity_PerEmployee",
      "kpi_em_CurrentEmissionIntensity_PerProduct",
    ];
    const grouped = _.groupBy(
      getStoreData?.baseLineCurrentYearKPIMainData,
      "address_id"
    );

    // Calculate averages
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

    // Calculate sum of Emission Intensity for Baseline for individual category
    const sumOfPerTonneAverage =
      EmissionIntensityAverages.length > 0
        ? _.sumBy(EmissionIntensityAverages, "pertonneaverage") /
          EmissionIntensityAverages.length
        : 0;

    const sumOfPerEmployeeAverage =
      EmissionIntensityAverages.length > 0
        ? _.sumBy(EmissionIntensityAverages, "peremployeeaverage") /
          EmissionIntensityAverages.length
        : 0;

    const sumOfPerProductAverage =
      EmissionIntensityAverages.length > 0
        ? _.sumBy(EmissionIntensityAverages, "perproductaverage") /
          EmissionIntensityAverages.length
        : 0;

    setSumOfEmissionIntensity(
      parseFloat(
        (
          sumOfPerTonneAverage +
          sumOfPerEmployeeAverage +
          sumOfPerProductAverage
        ).toFixed(1)
      )
    );

    // setChartDataOverall([
    //   {
    //     label: "Per Tonne of Production",
    //     value: parseFloat(sumOfPerTonneAverage.toFixed(1)),
    //   },
    //   {
    //     label: "Per Employee",
    //     value: parseFloat(sumOfPerEmployeeAverage.toFixed(1)),
    //   },
    //   {
    //     label: "Per Product",
    //     value: parseFloat(sumOfPerProductAverage.toFixed(1)),
    //   },
    // ]);
  };
  const sumOverallScope = () => {
    const fieldsToSum = [
      "kpi_em_Total_Emission_Scope1",
      "kpi_em_Total_Emission_Scope2",
      "kpi_em_Total_Emission_Scope3",
    ];
    const yearQuarter = sumFields(
      getStoreData?.baseLineCurrentYearKPIMainData,
      fieldsToSum
    );
    setAllScopeOverall(
      yearQuarter?.kpi_em_Total_Emission_Scope1 +
        yearQuarter?.kpi_em_Total_Emission_Scope2 +
        yearQuarter?.kpi_em_Total_Emission_Scope3
    );
    setScopeOverall([
      {
        name: "Scope 1",
        value: yearQuarter?.kpi_em_Total_Emission_Scope1,
      },
      {
        name: "Scope 2",
        value: yearQuarter?.kpi_em_Total_Emission_Scope2,
      },
      {
        name: "Scope 3",
        value: yearQuarter?.kpi_em_Total_Emission_Scope3,
      },
    ]);
  };

  useEffect(() => {
    sumOverallEmissionIntensity();
    sumOverallScope();
  }, [getStoreData?.baseLineCurrentYearKPIMainData]);

  const handleOnChildEvent = (childMessage: any) => {
    setCurrentSection(childMessage);
    if (onSidebarChildEvent) onSidebarChildEvent(childMessage);
  };

  useEffect(() => {
    setCurrentSection(currentScrolledSection!);
  }, [currentScrolledSection]);

  const [initialViewMore, setInitialViewMore] = useState(false);

  const handleViewMore = () => {
    setViewMore((prev) => !prev);
  };

  useEffect(() => {
    if (captureInProgress) {
      setInitialViewMore(viewMore);
      setViewMore(true);
    } else {
      setViewMore(initialViewMore);
    }
  }, [captureInProgress]);

  const { currentYear, baseLineYear = 2021 } = getStoreData || {};
  const { main: mainArray } = currentYear || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};

  const handleAnchorClick = (
    id: string,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    setCurrentSection(id);
    window.location.hash = id;
  };
  return (
    <Box>
      <Card
        px="sm"
        py={{ base: "sm", xl: "sm" }}
        radius="md"
        bg="#F7F9FB"
        style={{ overflow: "unset" }}
      >
        <Box mt="5px" mb="lg">
          <InfoItem
            label={`Baseline Emission - ${baseLineYear}`}
            info={`${getInfoDescriptionForSidebar({
              category: "Baseline Emission",
              kpiDescription,
            })}`}
            size="16px"
            fw={700}
            color="#000000"
            isInfoVisible={
              !!getInfoDescriptionForSidebar({
                category: "Baseline Emission",
                kpiDescription,
              })
            }
            mainHeading
          />
        </Box>
        <Flex justify="space-between" align="flex-start">
          <InfoItem
            label="Total Emission"
            unit={"in " + unit}
            info={`${getInfoDescriptionForSidebar({
              category: "Total Emission",
              kpiDescription,
            })}`}
            size="14px"
            fw={700}
            color="#000000"
            isInfoVisible={
              !!getInfoDescriptionForSidebar({
                category: "Total Emission",
                kpiDescription,
              })
            }
            mainHeading
          />
          <Text fw={600} fz={16} c="#000000" lh={1}>
            {formattedNumber(allScopeOverall, 1)}
          </Text>
        </Flex>
        {viewMore && (
          <Box className="">
            <EmissionByScopeProgress
              totalEmission={scopeOverall}
              insideSidebar={isSidebar}
            />
          </Box>
        )}
        {/* <Flex justify="space-between" align="flex-start" mt="md">
          <InfoItem
            label="Emission Intensity"
            unit={`in ${unit}`}
            info={`${getInfoDescriptionForSidebar({
              category: "Emission Intensity",
              kpiDescription,
            })}`}
            size="14px"
            fw={700}
            color="#000000"
            isInfoVisible={
              !!getInfoDescriptionForSidebar({
                category: "Emission Intensity",
                kpiDescription,
              })
            }
            mainHeading
          />
          <Text fw={600} fz={16} c="#000000" lh={1}>
            {formattedNumber(sumOfEmissionIntensity, 1)}
          </Text>
        </Flex> */}
        {viewMore && (
          <Box>
            {emissionData.map((item, index) => (
              <Flex
                key={index}
                justify="space-between"
                align="center"
                direction="row"
                wrap="wrap"
                py={5}
              >
                <Text c="#000000" fz={{ base: 12, xl: 14 }}>
                  {item.label}
                </Text>
                <Text c="#000000" fz={{ base: 12, xl: 14 }}>
                  {item.value}
                </Text>
              </Flex>
            ))}
          </Box>
        )}
        <Button
          variant="transparent"
          color="#2C9E92"
          onClick={handleViewMore}
          mt="sm"
          px="0"
          size="12"
          justify="flex-start"
          classNames={{
            label: "viewMoreButton",
          }}
        >
          {viewMore ? "View Less" : "View More"}
        </Button>
      </Card>
      {!captureInProgress && (
        <Stack gap="1px" mt="md">
          {scrollcontainers?.map((item, i) => {
            const info = getInfoDescriptionForSidebar({
              category: item.name,
              kpiDescription,
            });
            const isInfoVisible = !!info || false;
            const previousItem = scrollcontainers[i - 1];
            const isFirstInSequence =
              item.main && (!previousItem?.main || !previousItem.main);
            const shouldHideDivider = i === 0;
            const hideDivider = isFirstInSequence && !shouldHideDivider;

            return (
              <Box key={item.id} px="sm" className="sidebarNavs">
                {hideDivider && <Divider my={0} />}
                <Anchor
                  onClick={(event) => handleAnchorClick(item.id, event)}
                  td="none"
                >
                  <Flex justify="space-between" align="center">
                    <Box pl={item.main === false ? "md" : 0}>
                      <InfoItem
                        label={item.name}
                        info={info}
                        size={
                          isSmallLaptop
                            ? item.main
                              ? "13px"
                              : "12px"
                            : item.main
                              ? "14px"
                              : "13px"
                        }
                        fw={
                          currentSection === item.id || item.main === true
                            ? 700
                            : 400
                        }
                        color={currentSection === item.id ? "#FF9907" : "#000"}
                        isInfoVisible={isInfoVisible}
                        lhOnlyforSidebar={item.main ? 0.9 : 0.5}
                      />
                    </Box>
                    {currentSection === item.id && (
                      <Text fw={700} size="30px" c="#FF9907" mt="-4px">
                        &#8594;
                      </Text>
                    )}
                  </Flex>
                </Anchor>
                {item.main && <Divider my={0} />}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default Sidebar;
