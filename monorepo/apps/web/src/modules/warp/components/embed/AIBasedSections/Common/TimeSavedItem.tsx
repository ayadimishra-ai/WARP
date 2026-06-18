import { Badge, Center, Flex, Text } from "@mantine/core";
import Image from "next/image";
import React from "react";
import IconSparkles from "@/modules/warp/public/images/IconSparkles.svg";
import InfoItem from "./InfoItem";
interface TimeSavedItemProps {
  timeSavedValue: number;
  timeSavedUnit: String;
}
const TimeSavedItem: React.FC<TimeSavedItemProps> = ({
  timeSavedValue,
  timeSavedUnit,
}) => {
  return (
    <Center>
      <Badge bg="#067871" px="30px" h="56px">
        <Flex justify="center" align="center" gap="lg">
          <Image width={23} height={23} src={IconSparkles} alt="icon" />
          <InfoItem
            c="#ffffff"
            fz="14px"
            lh="17.75px"
            fw={600}
            lts="15%"
            tt="uppercase"
            label="Total Time Saved using AI"
            info="An estimate of the time saved by using AI to curate data from public sources, allowing faster completion of the questionnaire."
            iconColor="#99A7AD"
            infoIconTop="-2px"
          />
          <Text c="#ffffff" fz="36px" lh="45.65px" fw="500" ml="20px" tt="none">
            {timeSavedValue} {timeSavedUnit}
          </Text>
        </Flex>
      </Badge>
    </Center>
  );
};

export default TimeSavedItem;
