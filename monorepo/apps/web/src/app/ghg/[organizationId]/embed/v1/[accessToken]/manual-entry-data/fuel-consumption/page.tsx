"use client";

import { Box, Flex, Tabs, Text } from "@mantine/core";
import { useState } from "react";
import classes from "@/modules/ghg/components/activity-data-records/CSS.module.css";
import FuelConsumptionListing from "@/modules/ghg/features/manual-data-entry/fuel-consumption/listing";
import { useWarpContentSize } from "@/modules/ghg/hooks/use-warp-content-size";
const ManualEntryActivityDataRecords = () => {
  const [activeTab, setActiveTab] = useState("General");
  useWarpContentSize();
  return (
    <Box>
      <Flex align="center" gap="xl" justify="space-between">
        <Flex align="center" gap="xl">
          <Text fz="24px" c="#162F4B" fw="400" lh="normal">
            Fuel Consumption
          </Text>
          <Tabs
            variant="unstyled"
            classNames={{ tab: classes.aiTab }}
            value={activeTab}
            onChange={setActiveTab as any}
          >
            <Tabs.List grow>
              <Tabs.Tab value="General" style={{ borderRadius: "5px" }}>
                General
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Flex>
      </Flex>
      {activeTab === "General" && <FuelConsumptionListing />}
    </Box>
  );
};
export default ManualEntryActivityDataRecords;
