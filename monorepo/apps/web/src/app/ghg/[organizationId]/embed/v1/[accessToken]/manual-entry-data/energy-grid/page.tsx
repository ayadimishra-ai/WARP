"use client";
import { Box, Flex, Text } from "@mantine/core";
import EnergyGridPowerListing from "@/modules/ghg/features/manual-data-entry/energy-grid-power/listing";
import { useWarpContentSize } from "@/modules/ghg/hooks/use-warp-content-size";
const EnergyGridManualEntryActivityDataRecords = () => {
  useWarpContentSize();
  return (
    <Box>
      <Flex align="center" justify="space-between" gap="sm" wrap="wrap">
        <Text fz="24px" c="#162F4B" fw="400" lh="normal">
          Energy Grid
        </Text>
      </Flex>
      <EnergyGridPowerListing />
    </Box>
  );
};
export default EnergyGridManualEntryActivityDataRecords;
