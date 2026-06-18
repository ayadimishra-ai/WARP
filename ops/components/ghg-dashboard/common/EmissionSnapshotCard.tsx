import {
  ActionIcon,
  Box,
  Card,
  Flex,
  Group,
  Popover,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react";
import React, { useEffect } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { globalFilterDurationWithComparison } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import InfoIcon from "../../icons/InfoIcon";

export interface ScopeEmissionData {
  category?: { name: string; value: number; change?: number };
  product?: { name: string; value: number; change?: number };
  location?: { name: string; value: number; change?: number };
  value?: number;
  change?: number;
}
export type ScopeEmissionBlockData = {
  name: string;
  value: number;
  change?: number;
};
export interface CardSnapshotData {
  title: string;
  unit: string;
  theme: string;
  data: ScopeEmissionBlockData;
  emchange?: number;
  emvalue?: number;
  icon?: any;
  productName?: string;
  productArea?: string;
  categoryName?: string;
  totalCount?: string | number;
  popoverInfo: string;
  forlocation: boolean;
  subData?: ScopeEmissionBlockData;
  isDataAvailable: Boolean;
}

type ChangeValue = number | null;

const EmissionSnapshotCard: React.FC<CardSnapshotData> = ({
  title,
  unit,
  theme,
  data,
  emchange,
  emvalue,
  icon,
  productName,
  productArea,
  categoryName,
  totalCount,
  popoverInfo,
  forlocation,
  subData,
  isDataAvailable,
}) => {
  const selectedColor = {
    orangeGradient: "linear-gradient(140deg, #FE9703 -3.64%, #835411 64.89%)",
    brownGradient: "linear-gradient(152deg, #B03A13 15.95%, #440D0B 92.79%)",
    greenGradient: "linear-gradient(128deg, #2B8A80 1.32%, #0E4A44 76.14%)",
    darkBackground: "#142335",
  }[theme];
  const textColor = "#fff";
  const getGlobalDuration = useDashboardStore(
    (store: any) => store.globalFilters
  );
  const ifExist = globalFilterDurationWithComparison.filter(
    (items) => items == getGlobalDuration?.selectedDuration
  );

  useEffect(() => {
    if (isDataAvailable) {
      if (data.change !== undefined) {
        if (data?.value > 0 || data?.change === -100 || data?.change > 0) {
          setTimeout(() => {
            window?.parent.postMessage("noLoading", "*");
          }, 2500);
        }
      }
    } else {
      window?.parent.postMessage("noLoading", "*");
    }
  }, [data?.value, data?.change, data]);
  const smallLaptop = useMediaQuery("(max-width: 1366px)");

  const renderChangeIcon = (value: ChangeValue) => {
    if (value === null) return null;
    return value > 0 ? (
      <IconCaretUp fill="#FFB5B5" strokeWidth={0} />
    ) : (
      <IconCaretDown fill="#FFB5B5" strokeWidth={0} />
    );
  };

  const renderSubTitles = () => {
    return (
      <>
        {title == "Total Emission" && !forlocation && (
          <>
            <Text mt={{ base: 12, xl: 4 }} fz={14} c={"#fff"} fw={400}>
              Top Emission Category: <b>{categoryName}</b>
            </Text>
            <Group gap={15}>
              <Text fz={{ base: 20, xl: 24 }} fw={400} c={"#fff"}>
                {data?.value?.toFixed(1) ?? 0}
              </Text>
              {!!ifExist.length ? (
                data?.value && data?.change ? (
                  <Group gap={5}>
                    <Text
                      fw={400}
                      fz={{ base: 12, xl: 14 }}
                      component="span"
                      c={"#FFB5B5"}
                    >
                      {data?.change == undefined ? 0 : data?.change.toFixed(1)}%
                    </Text>
                    {data.change != null && renderChangeIcon(data.change)}
                  </Group>
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
            </Group>
          </>
        )}
      </>
    );
  };

  const renderPopover = () => {
    return (
      <>
        {popoverInfo && (
          <Popover
            // width={200}
            trapFocus
            position="bottom"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <ActionIcon
                variant="transparent"
                opacity={0.5}
                radius="xs"
                color="#ffffff"
                size={20}
              >
                <InfoIcon color="#ffffff" size={smallLaptop ? 12 : 16} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size={"12px"} c="#666666">
                {popoverInfo}
              </Text>
            </Popover.Dropdown>
          </Popover>
        )}
      </>
    );
  };

  const renderChangesPercentages = () => {
    return (
      <>
        {!!ifExist.length ? (
          data?.value && data?.change ? (
            <Group gap={5}>
              <Text
                fw={400}
                fz={{ base: 12, xl: 14 }}
                component="span"
                c={"#FFB5B5"}
              >
                {data?.change == undefined
                  ? 0
                  : data?.change < 0
                    ? data?.change.toFixed(1)
                    : "+ " + data?.change.toFixed(1)}
                %
              </Text>
              {data.change != null && renderChangeIcon(data.change)}
            </Group>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
      </>
    );
  };

  const renderSubCategoryLocation = () => {
    const { name, value, change } = subData || {};
    return (
      <>
        {!!name ? (
          <Text fz={12} c="#fff" mt={5}>
            {name ? `${name}:` : ""}
            <Text span fz={12} fw={600} mx={2}>
              {value ? value.toFixed(1) : 0}
            </Text>
            {value && change ? (
              <>
                {`(${
                  change == undefined
                    ? 0
                    : change < 0
                      ? change.toFixed(1)
                      : "+ " + change.toFixed(1)
                }%)`}
              </>
            ) : (
              <></>
            )}
          </Text>
        ) : (
          <></>
        )}
      </>
    );
  };

  return (
    <Card p={15} radius="md" bg={selectedColor} c={textColor}>
      <Stack gap={0} h={{ base: 110, xl: 120 }} justify="space-between">
        <>
          <Flex
            gap={5}
            justify="space-between"
            align="center"
            direction="row"
            mb={icon ? 8 : 3}
          >
            <Flex align="center" justify="flex-start" gap="0">
              <Text fz={{ base: 12, xl: 14 }} fw={700}>
                {title}
                <Text
                  component="span"
                  ml={3}
                  fz={{ base: 12, xl: 14 }}
                  fw={400}
                >
                  ({unit === "tco2e" ? "tCO2e" : unit})
                </Text>
              </Text>
              {renderPopover()}
            </Flex>
            {!!ifExist.length && data?.value && data?.change ? (
              <Text fz={{ base: 10, xl: 11 }} c={"#ffffff"} lh={"14px"}>
                YoY
              </Text>
            ) : (
              <></>
            )}
          </Flex>
          {data?.value > 0 ? (
            <Box mb={10}>
              {icon && (
                <Flex wrap="nowrap" gap="sm" align="center">
                  <ThemeIcon
                    variant="white"
                    bg={"#F6F6F6"}
                    size={48}
                    radius={4}
                  >
                    {icon}
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fz={{ base: 14, xl: 18 }} fw={400} c={"#fff"}>
                      {data?.name}
                    </Text>
                    {(title === "Top Emission Category" ||
                      title === "Top Emission Location") && (
                      <Group>
                        <Text
                          fz={{ base: 20, xl: 24 }}
                          lh="24px"
                          fw={400}
                          c="#fff"
                        >
                          {data?.value?.toFixed(1)}
                        </Text>
                        {renderChangesPercentages()}
                      </Group>
                    )}
                  </Stack>
                </Flex>
              )}
              <Group mt={icon ? 10 : 0} gap={15}>
                {title == "Total Emission" ? (
                  <>
                    <Text fz={{ base: 20, xl: 24 }} fw={400} c={"#fff"}>
                      {emvalue?.toFixed(1)}
                    </Text>
                    {!!ifExist.length ? (
                      !!emvalue && !!emchange ? (
                        <Group gap={5}>
                          <Text
                            fw={400}
                            fz={{ base: 12, xl: 14 }}
                            component="span"
                            c={"#FFB5B5"}
                          >
                            {emchange < 0 ? "" : "+ "}
                            {emchange?.toFixed(1)}%
                          </Text>
                          {emchange != null && renderChangeIcon(emchange)}
                        </Group>
                      ) : (
                        <></>
                      )
                    ) : (
                      <></>
                    )}
                  </>
                ) : title === "Top Emission Category" ? (
                  <>{renderSubCategoryLocation()}</>
                ) : title === "Top Emission Location" ? (
                  <>{renderSubCategoryLocation()}</>
                ) : (
                  <>
                    <Text fz={{ base: 20, xl: 24 }} fw={400} c={"#fff"}>
                      {data?.value?.toFixed(1)}
                    </Text>
                    {renderChangesPercentages()}
                  </>
                )}
              </Group>
              {renderSubTitles()}
            </Box>
          ) : (
            <Text m={"auto"} c={"#fff"} opacity={0.5} fz={{ base: 12, xl: 14 }}>
              No data available
            </Text>
          )}
        </>
      </Stack>
    </Card>
  );
};

export default EmissionSnapshotCard;
