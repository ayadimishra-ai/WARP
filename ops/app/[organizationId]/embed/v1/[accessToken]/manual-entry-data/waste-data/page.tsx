"use client";
import { Box, Flex, Text } from "@mantine/core";
import WasteDataListing from "~/features/manual-data-entry/waste-data/listing";
import { useWarpContentSize } from "~/hooks/use-warp-content-size";
const EnergyGridManualEntryActivityDataRecords = () => {
  useWarpContentSize();
  return (
    <Box>
      <Flex align="center" justify="space-between" gap="sm" wrap="wrap">
        <Text fz="24px" c="#162F4B" fw="400" lh="normal">
          Waste Data
        </Text>
      </Flex>
      <WasteDataListing />
    </Box>
  );
};
export default EnergyGridManualEntryActivityDataRecords;
