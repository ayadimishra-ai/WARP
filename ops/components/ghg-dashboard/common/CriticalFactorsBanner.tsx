import { Card, Flex, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { globalFilterDurationWithComparison } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import GreenDownIcon from "../../icons/GreenDownIcon";
import RedUpIcon from "../../icons/RedUpIcon";
import { formattedNumber } from "./NumberFormat";

export interface ScopeEmissionData {
  category?: string;
  value: number;
  change?: number;
}

export interface CardHeadingProps {
  title: string;
  theme: string;
  unit?: string;
  scopeEmission: ScopeEmissionData[];
}

const CriticalFactorsBanner: React.FC<CardHeadingProps> = ({
  title,
  theme,
  unit,
  scopeEmission,
}) => {
  const selectedBg =
    {
      green: "GreenBg",
      lightgreen: "LightGreenBg",
      blue: "BlueBg",
      lightblue: "GreenBg",
      yellow: "GreenBg",
    }[theme] || "GreenBg";
  const getGlobalDuration = useDashboardStore(
    (store: any) => store.globalFilters
  );
  const ifExist = globalFilterDurationWithComparison.filter(
    (items) => items == getGlobalDuration?.selectedDuration
  );
  return (
    <Card p="md" radius="md" className={`commonBg ${selectedBg}`}>
      <Group justify="flex-start">
        <Text fz={{ base: 14, xl: 16 }} fw={700} c="#000000" mr="xl">
          {title}
          {unit && (
            <Text
              component="span"
              fz={{ base: 14, xl: 16 }}
              c="#000000"
              ml="5px"
            >
              (in {unit === "tco2e" ? "tCO2e" : unit})
            </Text>
          )}
        </Text>
        <Flex
          justify="flex-start"
          align="center"
          direction="column"
          wrap="wrap"
        >
          <Flex gap="xl" align="flex-end">
            {scopeEmission.map((item, index) => {
              //const IconComponent = item.change < 0 ? GreenDownIcon : RedUpIcon;
              //const textColor = item.change < 0 ? "#039182" : "#E7122B";
              return (
                <Stack key={index} gap="0px" h="45px" justify="center">
                  {item.category && (
                    <Text size="12px" fw={700} c="#000000" mt="xs">
                      {item.category}{" "}
                    </Text>
                  )}
                  <Flex
                    gap="sm"
                    justify="flex-start"
                    align="center"
                    direction="row"
                    wrap="wrap"
                  >
                    <Text
                      fz={{ base: 20, xl: 24 }}
                      fw={400}
                      c="#000000"
                      m="0px"
                    >
                      {formattedNumber(item.value, 1)}
                    </Text>
                    {!!ifExist.length ? (
                      !!item.change &&
                      Number(item.change) !== 0 && (
                        <Text
                          size="12px"
                          fw={600}
                          c={Number(item.change) < 0 ? "#039182" : "#E7122B"}
                          mt="5px"
                        >
                          {Number(item.change) < 0 ? "" : "+ "}
                          {Number(item.change).toFixed(1)}%
                          <Text mx="5px" component="span">
                            {Number(item.change) < 0 ? (
                              <GreenDownIcon />
                            ) : (
                              <RedUpIcon />
                            )}
                          </Text>
                          YoY
                        </Text>
                      )
                    ) : (
                      <></>
                    )}
                  </Flex>
                </Stack>
              );
            })}
          </Flex>
        </Flex>
      </Group>
    </Card>
  );
};
export default CriticalFactorsBanner;
