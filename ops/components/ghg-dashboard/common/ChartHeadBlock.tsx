import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Menu,
  Popover,
  Text,
} from "@mantine/core";
import React from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import {
  activeState,
  getSelectedDurationValues,
} from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import InfoIcon from "../../icons/InfoIcon";
import Standing3Dots from "../../icons/Standing3Dots";

export interface CardHeadProps {
  title: string;
  unit?: string;
  description: string;
  popoverContent: string;
  tabs: boolean;
  yearlyData?: () => void;
  quarterlyData?: () => void;
  monthlyData?: () => void;
  DownloadChart?: (val: React.RefObject<HTMLDivElement>) => void;
  downloadPDF?: (val: React.RefObject<HTMLDivElement>) => void;
  chartRef?: React.RefObject<HTMLDivElement>;
  istable?: boolean;
  DownloadCSV?: () => void;
  singleBlock?: boolean;
  isShow: activeState;
}

const ChartHeadBlock: React.FC<CardHeadProps> = ({
  title,
  unit,
  description,
  popoverContent,
  tabs,
  yearlyData,
  quarterlyData,
  monthlyData,
  DownloadChart,
  downloadPDF,
  chartRef,
  istable,
  DownloadCSV,
  singleBlock,
  isShow,
}) => {
  const getGlobalDuration = useDashboardStore(
    (store: any) => store.globalFilters
  );
  const duration = getSelectedDurationValues(
    getGlobalDuration?.selectedDuration
  );
  const ChartButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    label: string;
    isShow: boolean;
  }> = ({ onClick, isActive, label, isShow }) => (
    <Button
      onClick={onClick}
      variant="filled"
      color={isActive ? "#ACE3DD" : "#ECF1F5"}
      size="compact-xs"
      w="70px"
      style={{ display: isShow ? "block" : "none" }}
    >
      <Text size="11px" fw={isActive ? 700 : 400} c="#333333">
        {label}
      </Text>
    </Button>
  );
  return (
    <Box mb={singleBlock ? "0" : "sm"}>
      <Flex
        justify="space-between"
        direction={{ base: "column", sm: "row" }}
        align="flex-start"
      >
        <Text
          fz={{ base: 13, xl: 14 }}
          fw={700}
          mih={25}
          mah={32}
          h={"max-content"}
          c="#000000"
          pr="25px"
        >
          {title}
          {unit && (
            <Text component="span" fz={{ base: 13, xl: 14 }} ml="2px" fw={400}>
              ({unit === "in tco2e" ? "in tCO2e" : unit})
            </Text>
          )}
          {popoverContent && (
            <Popover
              width={200}
              trapFocus
              position="bottom"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                <ActionIcon
                  variant="transparent"
                  radius="xs"
                  ml="5px"
                  size={16}
                  pos="absolute"
                  mt="2px"
                >
                  <InfoIcon />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="xs" c="#666666">
                  {popoverContent}
                </Text>
              </Popover.Dropdown>
            </Popover>
          )}
        </Text>
        {tabs && (
          <Flex gap="6px" pr="18px" align="flex-end">
            {yearlyData && (
              <ChartButton
                onClick={yearlyData}
                isActive={isShow == activeState.isYearly ? true : false}
                label="Yearly"
                // isShow={!!selectedShowData && selectedShowData[0].isYearly}
                isShow={duration.isYearly}
              />
            )}
            {quarterlyData && (
              <ChartButton
                onClick={quarterlyData}
                isActive={isShow == activeState.isQuarterly ? true : false}
                label="Quarterly"
                // isShow={!!selectedShowData && selectedShowData[0].isQuarterly}
                isShow={duration.isQuarterly}
              />
            )}
            {monthlyData && (
              <ChartButton
                onClick={monthlyData}
                isActive={isShow == activeState.isMonthly ? true : false}
                label="Monthly"
                // isShow={!!selectedShowData && selectedShowData[0].isMonthly}
                isShow={duration.isMonthly}
              />
            )}
          </Flex>
        )}
        {!istable && (
          <Menu shadow="md" width={130} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="transparent"
                size="25px"
                style={{ position: "absolute", top: 15, right: 10 }}
              >
                <Standing3Dots />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown className="pdfCsvDownload">
              <Menu.Label>Download as</Menu.Label>
              <Divider />
              <Menu.Item
                onClick={() =>
                  chartRef && DownloadChart && DownloadChart(chartRef)
                }
              >
                PNG
              </Menu.Item>
              <Menu.Item
                onClick={() => chartRef && downloadPDF && downloadPDF(chartRef)}
              >
                PDF
              </Menu.Item>
              <Menu.Item onClick={() => DownloadCSV && DownloadCSV()}>
                CSV
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Flex>
      {description && (
        <Text
          size="xs"
          c="#666666"
          mt={!tabs ? 5 : 7}
          mih={singleBlock ? "auto" : "33px"}
        >
          {description}
        </Text>
      )}
    </Box>
  );
};

export default ChartHeadBlock;
