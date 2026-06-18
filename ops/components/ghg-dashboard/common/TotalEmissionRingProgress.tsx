import { Anchor, Flex, Grid, RingProgress, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSquareFilled } from "@tabler/icons-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { colorList } from "~/utils/date.util";
import { formattedNumber } from "./NumberFormat";

export interface TotalEmissionData {
  name: string;
  value: number;
  color?: string;
}

export interface Props {
  totalEmission: TotalEmissionData[];
  insideSidebar?: boolean;
}

const EmissionByScopeProgress: React.FC<Props> = ({
  totalEmission,
  insideSidebar,
}) => {
  const [disabledSegments, setDisabledSegments] = useState<string[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState<number>(0);
  const isSmallLaptop = useMediaQuery(`(max-width: 1366px)`);

  // totalEmission.sort((a, b) => a.value - b.value);
  const colors = colorList(totalEmission.length);
  colors.map((colorValue: string, index: number) => {
    if (totalEmission.length > 0)
      totalEmission.sort((a, b) => a.value - b.value)[index].color = colorValue;
  });
  totalEmission?.sort((a: any, b: any) => (a.name < b.name ? -1 : 1));

  let total = 0;
  for (let i = 0; i < totalEmission.length; i++) {
    total += totalEmission[i].value;
  }

  const handleLegendClick = (index: number) => {
    const updatedDisabledSegments = [...disabledSegments];
    const segmentName = totalEmission[index].name;

    if (updatedDisabledSegments.includes(segmentName)) {
      const indexToRemove = updatedDisabledSegments.indexOf(segmentName);
      updatedDisabledSegments.splice(indexToRemove, 1);
    } else {
      updatedDisabledSegments.push(segmentName);
    }

    setDisabledSegments(updatedDisabledSegments);
  };
  useEffect(() => {
    const updateParentWidth = () => {
      if (parentRef.current) {
        setParentWidth(parentRef.current.offsetWidth);
      }
    };

    updateParentWidth();

    window.addEventListener("resize", updateParentWidth);

    return () => {
      window.removeEventListener("resize", updateParentWidth);
    };
  }, []);
  const length = totalEmission.length;
  const size = useMemo(() => {
    if (isSmallLaptop && insideSidebar) {
      return 90;
    } else if (insideSidebar) {
      return 98;
    } else if (isSmallLaptop && !insideSidebar) {
      return length > 3 ? 100 : 90;
    } else {
      return 110;
    }
  }, [isSmallLaptop, insideSidebar, length]);

  const pt = useMemo(() => {
    if (insideSidebar) {
      return 0;
    } else if (isSmallLaptop) {
      return length > 3 ? 35 : 80;
    } else {
      return length > 3 ? 15 : 80;
    }
  }, [insideSidebar, isSmallLaptop, length]);
  return (
    <Flex align="center" justify="space-between" direction="column">
      <Grid
        align="center"
        gutter="0"
        px={length > 3 ? "0" : 0}
        pt={pt}
        w="100%"
      >
        {totalEmission.map((item, index) => {
          const nameValue = (item.value / total) * 100;
          const maxValue = Math.max(
            ...totalEmission.map((emissionValue) => emissionValue.value)
          );
          const isDisabled = disabledSegments.includes(item.name);
          return (
            <Grid.Col key={index} span={length > 3 ? 6 : 4}>
              <Flex align="center" justify="center">
                <RingProgress
                  size={size}
                  style={{
                    cursor: "context-menu",
                    opacity: isDisabled ? 0.5 : 1,
                    transition: "stroke-dashoffset 3s ease-in-out",
                  }}
                  label={
                    <Text
                      fw={700}
                      size="12px"
                      ta="center"
                      c={item.value === maxValue ? "#FF9907" : "#000000"}
                    >
                      {item.name}
                      <Text
                        fz={{ base: 12, xl: 14 }}
                        ta="center"
                        c="#000000"
                        mt="4px"
                      >
                        {isDisabled ? 0 : formattedNumber(item.value, 1)}
                      </Text>
                    </Text>
                  }
                  thickness={insideSidebar ? 5 : 5}
                  sections={[
                    {
                      value: isDisabled ? 0 : nameValue,
                      color: totalEmission[index].color || colors[index],
                    },
                  ]}
                />
              </Flex>
            </Grid.Col>
          );
        })}
      </Grid>
      <Grid pos="absolute" bottom="21px">
        {!insideSidebar && (
          <Grid.Col span={12}>
            <Flex justify="space-around" gap={{ base: "xs", md: "md" }}>
              {totalEmission.map((item, index) => (
                <Flex
                  key="index"
                  gap="3px"
                  align="center"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => handleLegendClick(index)}
                >
                  <IconSquareFilled
                    size="9.5px"
                    color={totalEmission[index].color || colors[index]}
                  />
                  <Anchor
                    size={isSmallLaptop ? "9px" : "10px"}
                    fw="600"
                    c="#000000"
                    underline="never"
                    lh={isSmallLaptop ? "12px" : "10px"}
                  >
                    {item.name}
                  </Anchor>
                </Flex>
              ))}
            </Flex>
          </Grid.Col>
        )}
      </Grid>
    </Flex>
  );
};

export default EmissionByScopeProgress;
