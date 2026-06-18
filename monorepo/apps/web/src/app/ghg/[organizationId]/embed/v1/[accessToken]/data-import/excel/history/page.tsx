"use client";

import { Box, Flex, Tabs, Text, Tooltip } from "@mantine/core";
import classes from "@/modules/ghg/components/activity-data-records/CSS.module.css";
import DataImportHistory from "@/modules/ghg/components/dataimporthistory";
import AIDataImportHistoryTable from "@/modules/ghg/components/tables/AIDataImportHistoryTable";
import CaptivePowerNonRenewableFuelListing from "@/modules/ghg/features/manual-data-entry/energy-captive-power/non-renewable-fuel/listing";
import CaptivePowerRenewableListing from "@/modules/ghg/features/manual-data-entry/energy-captive-power/renewable/listing";
import EnergyGridPowerListing from "@/modules/ghg/features/manual-data-entry/energy-grid-power/listing";
import FuelConsumptionListing from "@/modules/ghg/features/manual-data-entry/fuel-consumption/listing";
import WasteDataListing from "@/modules/ghg/features/manual-data-entry/waste-data/listing";
import { useExcelHistoryPage } from "@/modules/ghg/hooks/use-excel-history-page";
import {
  ACTIVITY_CODES,
  CAPTIVE_SUB_TABS,
  TAB_VALUES,
} from "@/modules/ghg/lib/shared/constants/dataimporthistory.constant";


const CaptivePowerFormsContent = ({ subTab }: { subTab: string }) => (
  <Box>
    {subTab === CAPTIVE_SUB_TABS.RENEWABLE && <CaptivePowerRenewableListing />}
    {subTab === CAPTIVE_SUB_TABS.FUEL_NON_RENEWABLE && <CaptivePowerNonRenewableFuelListing />}
  </Box>
);

const FormsContent = ({
  activityCode,
  captiveSubTab,
}: {
  activityCode: string | null;
  captiveSubTab: string;
}) => {
  if (activityCode === ACTIVITY_CODES.ENERGY_GRID_POWER) return <EnergyGridPowerListing />;
  if (activityCode === ACTIVITY_CODES.ENERGY_CAPTIVE_POWER)
    return <CaptivePowerFormsContent subTab={captiveSubTab} />;
  if (activityCode === ACTIVITY_CODES.ENERGY_FUEL_PURCHASED) return <FuelConsumptionListing />;
  if (activityCode === ACTIVITY_CODES.WASTE) return <WasteDataListing />;
  return null;
};

const CaptiveSubTabs = ({
  captiveSubTab,
  setCaptiveSubTab,
  classes,
}: {
  captiveSubTab: string;
  setCaptiveSubTab: (v: any) => void;
  classes: Record<string, string>;
}) => (
  <Tabs
    variant="unstyled"
    classNames={{ tab: classes.aiTab }}
    value={captiveSubTab}
    onChange={setCaptiveSubTab as any}
    px={30}
    pt={10}
  >
    <Tabs.List>
      <Tabs.Tab value={CAPTIVE_SUB_TABS.RENEWABLE}>Technology Renewable</Tabs.Tab>
      <Tabs.Tab value={CAPTIVE_SUB_TABS.FUEL_NON_RENEWABLE}>Non Renewable</Tabs.Tab>
    </Tabs.List>
  </Tabs>
);

const FormsPanel = ({
  activityCodeFromParent,
  captiveSubTab,
  setCaptiveSubTab,
  classes,
}: {
  activityCodeFromParent: string | null;
  captiveSubTab: string;
  setCaptiveSubTab: (v: any) => void;
  classes: Record<string, string>;
}) => (
  <Box>
    <Flex justify="space-between" align="center" mb={5}>
      {activityCodeFromParent === ACTIVITY_CODES.ENERGY_CAPTIVE_POWER ? (
        <CaptiveSubTabs
          captiveSubTab={captiveSubTab}
          setCaptiveSubTab={setCaptiveSubTab}
          classes={classes}
        />
      ) : (
        <Box />
      )}
    </Flex>
    <FormsContent activityCode={activityCodeFromParent} captiveSubTab={captiveSubTab} />
  </Box>
);

const ExcelHistoryPage = () => {
  const {
    activityCodeFromParent,
    activityName,
    activeTab,
    setActiveTab,
    captiveSubTab,
    setCaptiveSubTab,
    showAiTab,
    showFormsTab,
    showBulkTab,
    formsOnlyMode,
    elementRef,
  } = useExcelHistoryPage();

  return (
    <Box ref={elementRef} p={0} pt="30px">
      <Flex align="center" gap="xl" mb={10} mx="30px">
        <Text className="sora-font" size="24px" c="#162F4B" fw="400">
          {activityName}
        </Text>
        {!formsOnlyMode && (showAiTab || showFormsTab) && (
          <Tabs
            variant="unstyled"
            classNames={{ tab: classes.aiTab }}
            value={activeTab}
            onChange={setActiveTab as any}
          >
            <Tabs.List grow>
              {showAiTab && (
                <Tabs.Tab value={TAB_VALUES.AI} w={120}>
                  <Tooltip
                    label="View all uploads made using AI mode"
                    offset={12}
                    position="bottom"
                    multiline
                    withinPortal
                  >
                    <span>AI POWERED</span>
                  </Tooltip>
                </Tabs.Tab>
              )}
              {showBulkTab && (
                <Tabs.Tab value={TAB_VALUES.BULK} w={120}>
                  <Tooltip
                    label="View all uploads made using bulk upload"
                    offset={12}
                    position="bottom"
                    multiline
                    withinPortal
                  >
                    <span>BULK UPLOAD</span>
                  </Tooltip>
                </Tabs.Tab>
              )}
              {showFormsTab && (
                <Tabs.Tab value={TAB_VALUES.FORMS} w={100}>
                  <Tooltip
                    label="Enter data using form"
                    offset={12}
                    position="bottom"
                    multiline
                    withinPortal
                  >
                    <span>FORM</span>
                  </Tooltip>
                </Tabs.Tab>
              )}
            </Tabs.List>
          </Tabs>
        )}
        {showAiTab && activeTab === TAB_VALUES.FORMS && (
          <Flex align="center" gap={6} ml="auto">
            <Box
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background:
                  "linear-gradient(94.76deg, rgba(249, 218, 255, 0.8) 0.57%, rgba(218, 241, 255, 0.8) 95%)",
                border: "1.5px solid #c084fc",
                flexShrink: 0,
              }}
            />
            <Text fz={12} c="#666666">
              AI Uploaded Data
            </Text>
          </Flex>
        )}
      </Flex>
      <Box>
        {formsOnlyMode ? (
          <FormsPanel
            activityCodeFromParent={activityCodeFromParent}
            captiveSubTab={captiveSubTab}
            setCaptiveSubTab={setCaptiveSubTab}
            classes={classes}
          />
        ) : (
          <>
            {showAiTab && activeTab === TAB_VALUES.AI && <AIDataImportHistoryTable />}
            {activeTab === TAB_VALUES.FORMS && (
              <FormsPanel
                activityCodeFromParent={activityCodeFromParent}
                captiveSubTab={captiveSubTab}
                setCaptiveSubTab={setCaptiveSubTab}
                classes={classes}
              />
            )}
            {/* Keep DataImportHistory mounted so session/data/locations survive tab switches.
                Unmounting it caused a full re-init cycle on every return to the Bulk tab,
                and the async session re-fetch could silently fail (no API calls, no logs). */}
            <Box mx={0}
              style={{
                display:
                  activeTab !== TAB_VALUES.FORMS &&
                  !(activeTab === TAB_VALUES.AI && showAiTab)
                    ? undefined
                    : "none",
              }}
            >
              <DataImportHistory
                initialActivityCode={activityCodeFromParent}
                showSearch={true}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
export default ExcelHistoryPage;
