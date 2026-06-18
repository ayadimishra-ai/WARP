import { Flex, Progress, Stack, Text, Tooltip } from "@mantine/core";
import React from "react";
import { colorList } from "~/utils/date.util";

export interface EmissionIntensityData {
  Icon: React.FC;
  value: number;
  label: string;
}

export interface Props {
  emissionIntensity: EmissionIntensityData[];
}
type intWithPercentagesType = {
  Icon: React.FC;
  value: number;
  label: string;
  color?: string;
  per: number;
}[];

const EmissionIntensity: React.FC<Props> = ({ emissionIntensity }) => {
  const total =
    emissionIntensity?.reduce(
      (acc, ele) => acc + (parseFloat(ele.value.toString()) || 0),
      0
    ) || 1;
  const IntWithPercentages: intWithPercentagesType = emissionIntensity.map(
    (ele) => {
      return {
        Icon: ele.Icon,
        label: ele.label,
        value: ele.value,
        per: (parseFloat(ele.value.toString()) / total) * 100 || 0,
      };
    }
  );

  //const colorArray = ["#FF9907", "#444444", "#9E9E9E"];
  const maxValue = Math.max(...emissionIntensity.map((item) => item.value));

  const colors = colorList(IntWithPercentages.length);
  colors.map((colorValue: string, index: number) => {
    if (IntWithPercentages.length > 0)
      IntWithPercentages.sort((a, b) => a.value - b.value)[index].color =
        colorValue;
  });
  const sortedData = [...emissionIntensity].sort((a, b) => a.value - b.value);
  return (
    <Flex h="300px" direction="column" justify="space-around">
      {IntWithPercentages?.map(({ Icon, value, label, per }, index) => (
        <Stack key={index} gap="4px">
          <Flex align="center" gap="sm" justify="space-between">
            <Flex gap="4px" align="center">
              <Flex align="center">{Icon && <Icon />}</Flex>
              <Text fz={{ base: 10, xl: 12 }} fw={600} pt="0" lh="16px">
                {label}
              </Text>
            </Flex>
            <Tooltip
              withArrow
              position="bottom-start"
              arrowOffset={13}
              arrowSize={10}
              label={value}
            >
              <Text fz={{ base: 20, xl: 24 }} ta="center" fw={600}>
                {Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)}
              </Text>
            </Tooltip>
          </Flex>
          <Progress.Root size="sm">
            <Progress.Section
              value={per}
              color={IntWithPercentages[index].color || colors[index]}
            ></Progress.Section>
          </Progress.Root>
        </Stack>
      ))}
    </Flex>
  );
};

export default EmissionIntensity;
