"use client";
import { Box, Flex, Tabs, Text } from "@mantine/core";
import { useState } from "react";
import classes from "~/components/activity-data-records/CSS.module.css";
import CaptivePowerNonRenewableFuelListing from "~/features/manual-data-entry/energy-captive-power/non-renewable-fuel/listing";
import CaptivePowerRenewableListing from "~/features/manual-data-entry/energy-captive-power/renewable/listing";
import { useWarpContentSize } from "~/hooks/use-warp-content-size";
const CaptivePowerManualEntryActivityDataRecords = () => {
  const [activeTab, setActiveTab] = useState("renewable");
  useWarpContentSize();
  return (
    <Box>
      <Flex align="center" gap="xl" justify="space-between">
        <Flex align="center" gap="xl">
          <Text fz="24px" c="#162F4B" fw="400" lh="normal">
            Energy Captive Power
          </Text>
          <Tabs
            variant="unstyled"
            classNames={{ tab: classes.aiTab }}
            value={activeTab}
            onChange={setActiveTab as any}
          >
            <Tabs.List grow>
              <Tabs.Tab value="renewable">Technology Renewable</Tabs.Tab>
              {/* <Tabs.Tab value="fuel-renewable">Fuel - Renewable</Tabs.Tab> */}
              {/* TODO: change below to "Fuel - Non Renewable" */}
              <Tabs.Tab value="fuel-non-renewable">Non Renewable</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Flex>
      </Flex>
      {activeTab === "renewable" && <CaptivePowerRenewableListing />}
      {/* {activeTab === "fuel-renewable" && <CaptivePowerRenewableFuelListing />} */}
      {activeTab === "fuel-non-renewable" && (
        <CaptivePowerNonRenewableFuelListing />
      )}
    </Box>
  );
};
export default CaptivePowerManualEntryActivityDataRecords;
