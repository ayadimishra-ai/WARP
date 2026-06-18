"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Select,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconChevronDown, IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import CheckboxMultiSelect from "./CheckboxMultiSelect";
import {
  buildFinancialYearOptions,
  buildMonthBadges,
  MONTH_BADGE_TO_FULL,
} from "./MainFilterBlockUtils";

const MONTH_NAME_TO_NUM: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/** Returns true if the given month badge falls strictly after the current month. */
function isMonthInFuture(
  badge: string,
  fyStartYear: number,
  startMonth: number
): boolean {
  const fullMonth = (MONTH_BADGE_TO_FULL[badge] ?? badge).toLowerCase();
  const monthNum = MONTH_NAME_TO_NUM[fullMonth] ?? 1;
  // Months before the FY start month belong to the NEXT calendar year
  const calYear = monthNum < startMonth ? fyStartYear + 1 : fyStartYear;
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStart = new Date(calYear, monthNum - 1, 1);
  return monthStart > currentMonthStart;
}

type SelectOption = { value: string; label: string };

interface MainFilterBlockProps {
  baselineYear?: number;
  yearOptions?: SelectOption[];
  financialYearStartMonth?: number; // 1-based; from org settings
  selectedYear?: string | null; // FY start year (string) for future-month detection
  selectedLocations: string[]; // array of selected location IDs
  onLocationsChange: (values: string[]) => void;
  locationOptions: SelectOption[];
  selectedFinancialYear: string | null;
  onFinancialYearChange: (value: string | null) => void;
  selectedMonths: string[];
  onMonthsChange: (updater: (prev: string[]) => string[]) => void;
  onResetToDefault: () => void;
  monthsWithData: string[]; // lowercase full month names that have data (e.g. ["april", "may"])
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  /** Currently active status badge filter; null = all. */
  selectedStatus?: "pending" | "approved" | null;
  /** Called when user clicks a status badge; receives null when toggled off. */
  onStatusChange?: (status: "pending" | "approved" | null) => void;
}

interface SummaryBarProps {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  selectedStatus?: "pending" | "approved" | null;
  onStatusChange?: (status: "pending" | "approved" | null) => void;
}

const SummaryBar = ({ summary, selectedStatus, onStatusChange }: SummaryBarProps) => {
  const items: {
    key: "total" | "pending" | "approved";
    label: string;
    count: number;
    textColor: string;
    badgeColor: string;
  }[] = [
    { key: "total",    label: "Total",                count: summary.total,    textColor: "#003b52", badgeColor: "#c2dde8" },
    { key: "pending",  label: "Pending For Approval", count: summary.pending,  textColor: "#d08700", badgeColor: "#fef9c2" },
    { key: "approved", label: "Approved",             count: summary.approved, textColor: "#00a63e", badgeColor: "#dbfce7" },
  ];

  return (
    <Flex align="center" gap={0} wrap="wrap">
      {items.map((item, i) => {
        const isActive = item.key === "total"
          ? selectedStatus === null || selectedStatus === undefined
          : selectedStatus === item.key;

        return (
          <Flex key={item.key} align="center" gap={0}>
            {i > 0 && <Divider orientation="vertical" my="6px" size="xs" mx={8} />}
            <Button
              variant="transparent"
              px={10}
              radius="md"
              onClick={() => onStatusChange?.(item.key === "total" ? null : item.key as "pending" | "approved")}
              styles={{root: {border:"none", boxShadow: isActive ? `0 2px 0px ${item.textColor}` : "none"}}}
            >
              <Text fz={14} lh="14px" c={item.textColor} tt="uppercase" fw={400} mr={10} lts="0.8px">
                {item.label}
              </Text>
              <Badge color={item.badgeColor} c={item.textColor} size="lg"
                style={{
                  cursor: "pointer",
                }}
              >
                {item.count}
              </Badge>
            </Button>
          </Flex>
        );
      })}
    </Flex>
  );
};

const LEGEND_ITEMS = [
  {
    label: "Data Available",
    borderColor: "#00c950",
    background: "#ffffff",
  },
  {
    label: "No Data",
    borderColor: "#d1d5dc",
    background: "#f6f3f4",
  },
  {
    label: "Selected",
    borderColor: "#003b52",
    background: "#e9f3ff",
  },
];

const MainFilterBlock = ({
  baselineYear,
  yearOptions,
  financialYearStartMonth = 4,
  selectedYear,
  selectedLocations,
  onLocationsChange,
  locationOptions,
  selectedFinancialYear,
  onFinancialYearChange,
  selectedMonths,
  onMonthsChange,
  onResetToDefault,
  monthsWithData,
  summary,
  selectedStatus,
  onStatusChange,
}: MainFilterBlockProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const financialYearOptions =
    yearOptions && yearOptions.length > 0
      ? yearOptions
      : buildFinancialYearOptions(baselineYear, financialYearStartMonth);

  const monthBadges = buildMonthBadges(financialYearStartMonth);

  // Derive the numeric FY start year for future-month detection.
  // selectedYear (string) → number; fall back to current year if null.
  const fyStartYear: number = (() => {
    if (!selectedYear) {
      const now = new Date();
      const m = now.getMonth() + 1;
      return m >= financialYearStartMonth
        ? now.getFullYear()
        : now.getFullYear() - 1;
    }
    return parseInt(selectedYear, 10);
  })();

  return (
    <Flex
      direction="column"
      gap={15}
      p={15}
      mb={15}
      styles={{
        root: {
          background: "#fff",
          borderRadius: 10,
          boxShadow:
            "rgba(159, 162, 191, 0.18) 0px 9px 16px, rgba(159, 162, 191, 0.32) 0px 2px 2px",
        },
      }}
    >
      {/* ── Row 1: dropdowns + reset ── */}
      <Flex justify="space-between" align="center" gap={16} wrap="wrap">
        <Flex gap={12} style={{ flex: 1, minWidth: 0 }} align="center">
          <Group>
            <ThemeIcon size={34} variant="transparent" color="#162f4b">
              <IconFilter />
            </ThemeIcon>
            <ActionIcon
              color="#162f4b"
              variant="transparent"
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            >
              <IconChevronDown />
            </ActionIcon>
          </Group>
          {/* Location multi-select */}
          {!isCollapsed && (
            <CheckboxMultiSelect
              value={selectedLocations}
              onChange={onLocationsChange}
              data={locationOptions}
              placeholder="All Locations"
              searchPlaceholder="Search Location..."
              style={{ flex: 1, minWidth: 160 }}
            />
          )}
          {/* Year single-select */}
          {!isCollapsed && (
            <Select
              value={selectedFinancialYear}
              onChange={onFinancialYearChange}
              data={financialYearOptions}
              style={{ flex: 1, minWidth: 160 }}
              maxDropdownHeight={265}
              allowDeselect={false}
              scrollAreaProps={{ type: "auto", scrollbarSize: 8 }}
            />
          )}
          {!isCollapsed && (
            <Button
              variant="unstyled"
              fw={600}
              className="noAnimationButton filledGradientButton"
              fz={12}
              h={36}
              lts="0.15rem"
              radius="xl"
              onClick={onResetToDefault}
            >
              RESET TO DEFAULT
            </Button>
          )}
          {isCollapsed && <SummaryBar summary={summary} selectedStatus={selectedStatus} onStatusChange={onStatusChange} />}
        </Flex>
      </Flex>

      {/* ── Row 2: month tiles ── */}
      {!isCollapsed && (
        <Group gap={12} wrap="wrap" grow>
          {monthBadges.map((month) => {
            const isSelected = selectedMonths.includes(month);
            const isFuture = isMonthInFuture(
              month,
              fyStartYear,
              financialYearStartMonth
            );
            // Convert badge (e.g. "Apr") → lowercase full name (e.g. "april") for lookup
            const fullMonthLower = (
              MONTH_BADGE_TO_FULL[month] ?? month
            ).toLowerCase();
            const hasData =
              !isFuture && monthsWithData.includes(fullMonthLower);
            const isDisabled = isFuture || !hasData;

            // Three visual states (mirrors LEGEND_ITEMS):
            //   Selected + data  → dark blue border #003b52, light blue bg #e9f3ff
            //   Data available   → green border #00c950, white bg #ffffff
            //   No data / future → gray border #d1d5dc, gray bg #f6f3f4, disabled
            const borderColor = isDisabled
              ? "#d1d5dc"
              : isSelected
                ? "#003b52"
                : "#00c950";
            const bgColor = isDisabled
              ? "#f3f4f6"
              : isSelected
                ? "#e9f3ff"
                : "#ffffff";
            const textColor = isDisabled
              ? "#c0c4cc"
              : isSelected
                ? "#163047"
                : "#163047";

            const tooltipLabel = isFuture
              ? "Future month data is unavailable"
              : !hasData
                ? "No data available for this month"
                : "";

            return (
              <Tooltip
                key={month}
                label={tooltipLabel}
                disabled={!isDisabled}
                withArrow
              >
                <Button
                  onClick={() => {
                    if (isDisabled) return;
                    onMonthsChange((prev) =>
                      prev.includes(month)
                        ? prev.filter((m) => m !== month)
                        : [...prev, month]
                    );
                  }}
                  miw={80}
                  ta="center"
                  p="6px 12px"
                  radius={10}
                  bg={bgColor}
                  c={textColor}
                  fz={14}
                  fw={600}
                  lts="1px"
                  style={{
                    border: `2px solid ${borderColor}`,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.45 : 1,
                  }}
                >
                  {month}
                </Button>
              </Tooltip>
            );
          })}
        </Group>
      )}

      {/* ── Row 3: summary counters ── */}
      {!isCollapsed && (
        <Flex align="center" justify="space-between" gap={16} wrap="wrap">
          <SummaryBar summary={summary} selectedStatus={selectedStatus} onStatusChange={onStatusChange} />
          <Flex align="center" gap={16}>
            {/* <Text fz={12} c="#003b52" fw={700}>
              Legends
            </Text> */}
            {LEGEND_ITEMS.map((item) => (
              <Flex key={item.label} align="center" gap={6}>
                <Box
                  w={16}
                  h={16}
                  style={{
                    borderRadius: "50%",
                    borderColor: item.borderColor,
                    borderWidth: 2,
                    borderStyle: "solid",
                    background: item.background,
                  }}
                />
                <Text fz={12} c="#4a5565">
                  {item.label}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default MainFilterBlock;
