import { Flex, Stack, Text } from "@mantine/core";
import React from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { globalFilterDurationWithComparison } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import GreenDownIcon from "../../icons/GreenDownIcon";
import RedUpIcon from "../../icons/RedUpIcon";
import TotalEmissionImage from "../../icons/TotalEmission";
import { formattedNumber } from "../common/NumberFormat";

export interface ScopeEmissionData {
  category?: string;
  value: number;
  change?: number;
}

export interface Props {
  scopeEmission: ScopeEmissionData[];
}

const TotalEmission: React.FC<Props> = ({ scopeEmission }) => {
  const getGlobalDuration = useDashboardStore(
    (store: any) => store.globalFilters
  );
  const ifExist = globalFilterDurationWithComparison.filter(
    (items) => items == getGlobalDuration?.selectedDuration
  );
  return (
    <Flex
      justify="space-around"
      h="300px"
      gap="md"
      align="center"
      direction="column"
      wrap="nowrap"
    >
      {scopeEmission?.map((item, index) => {
        return (
          <Stack gap="sm" justify="center" align="center" key={index}>
            <Text size="24px" fw={700} c="#000000" m="0px">
              {formattedNumber(item.value, 1)}
            </Text>
            {!!ifExist.length ? (
              item.value && item.change ? (
                <Text
                  size="12px"
                  fw={600}
                  c={item.change < 0 ? "#039182" : "#E7122B"}
                  m="0px"
                >
                  {item.change < 0 ? "" : "+ "}
                  {item.change.toFixed(1)}%
                  <Text mx="5px" component="span">
                    {item.change < 0 ? <GreenDownIcon /> : <RedUpIcon />}
                  </Text>
                  YoY
                </Text>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
          </Stack>
        );
      })}
      <TotalEmissionImage />
    </Flex>
  );
};

export default TotalEmission;
