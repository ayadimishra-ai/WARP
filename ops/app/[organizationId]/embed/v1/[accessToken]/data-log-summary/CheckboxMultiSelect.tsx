"use client";

import {
  Anchor,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Combobox,
  Flex,
  Group,
  InputBase,
  ScrollArea,
  Text,
  Tooltip,
  useCombobox,
} from "@mantine/core";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface CheckboxMultiSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  data: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  style?: React.CSSProperties;
  height?: number;
}

const CheckboxMultiSelect = ({
  value,
  onChange,
  data,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  style,
  height,
}: CheckboxMultiSelectProps) => {
  const [pendingValue, setPendingValue] = useState<string[]>(value);
  const [sortOrder, setSortOrder] = useState<string[]>(value);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex("active");
      setPendingValue(value);
      setSortOrder(value);
    },
  });

  // Keep pendingValue in sync when the value prop changes externally while the
  // dropdown is closed (e.g. parent loads all locations after initial mount).
  // Without this, pendingValue stays stale from mount-time and allSelected
  // stays false on the very first dropdown open, so "Only This" never appears
  // until the user closes and reopens the dropdown.
  useEffect(() => {
    if (!combobox.dropdownOpened) {
      setPendingValue(value);
      setSortOrder(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (combobox.dropdownOpened) {
      scrollViewportRef.current?.scrollTo({ top: 0 });
    }
  }, [combobox.dropdownOpened]);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleValueSelect = (val: string) => {
    if (pendingValue.includes(val)) {
      setPendingValue(pendingValue.filter((v) => v !== val));
    } else {
      setPendingValue([...pendingValue, val]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setPendingValue([]);
    } else {
      setPendingValue(data.map((item) => item.value));
    }
  };

  const handleClear = () => {
    setPendingValue([]);
    onChange([]);
    setSearch("");
  };

  const handleApply = () => {
    onChange(pendingValue);
    setSearch("");
    combobox.closeDropdown();
  };

  // Filter by search, then sort so selected items always appear at the top.
  // This ensures a location selected deep in a 100-item list is immediately
  // visible when the dropdown is re-opened.
  const filteredData = useMemo(() => {
    const filtered = data.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase().trim())
    );
    const selected = filtered.filter((item) => sortOrder.includes(item.value));
    const unselected = filtered.filter((item) => !sortOrder.includes(item.value));
    return [...selected, ...unselected];
  }, [data, search, sortOrder]);

  const allSelected = pendingValue.length === data.length && data.length > 0;
  const someSelected = pendingValue.length > 0 && pendingValue.length < data.length;

  const displayText =
    value.length === 0
      ? "No locations available"
      : value.length === data.length
        ? "All Locations"
        : `${value.length} Selected`;

  const MAX_LABEL_LENGTH = 80;

  const options = filteredData.map((item) => {
    const isTruncated = item.label.length > MAX_LABEL_LENGTH;
    const displayLabel = isTruncated
      ? item.label.slice(0, MAX_LABEL_LENGTH) + "..."
      : item.label;

    return (
      <Combobox.Option value={item.value} key={item.value} active={false}>
        <Group gap="xs" wrap="nowrap" justify="space-between">
          <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Checkbox
              checked={pendingValue.includes(item.value)}
              onChange={() => {}}
              aria-hidden
              tabIndex={-1}
              style={{ pointerEvents: "none" }}
              size="xs"
              color="#42AF8E"
            />
            <Tooltip
              label={item.label}
              disabled={!isTruncated}
              withArrow
              withinPortal
              maw={320}
              multiline
            >
              <Text fz={14} c="#212529">
                {displayLabel}
              </Text>
            </Tooltip>
          </Group>
          {/* 'Only This' shortcut: only shown when all locations are selected AND
              a search query is active — saves the user from having to deselect all
              and then re-select the single location they want. */}
          {allSelected && search.trim().length > 0 && (
            <Tooltip
              label="Select only this location"
              withArrow
              withinPortal
            >
            <Anchor
              component="button"
              fz={11}
              c="#42AF8E"
              fw={500}
              underline="always"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                setPendingValue([item.value]);
              }}
            >
              Only This
            </Anchor>
            </Tooltip>
          )}
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={
            <IconChevronDown
              size={16}
              style={{
                transform: combobox.dropdownOpened
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          }
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          style={{
            height: 36,
            borderColor: "#dee2e6",
            backgroundColor: "#fff",
            color: value.length > 0 ? "#000" : "#868e96",
            fontWeight: 400,
            ...style,
          }}
        >
          {displayText}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown p={0}>
        <Autocomplete
          className="search-autocomplete"
          value={search}
          onChange={(value) => setSearch(value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={searchPlaceholder}
          leftSection={
            <IconSearch size={20} color={searchFocused ? "#005C81" : "#666"} />
          }
          data={[]}
          px={12}
          py={10}
          clearable
        />
        <ScrollArea.Autosize mah={height || 230} type="auto" pl={4} viewportRef={scrollViewportRef} offsetScrollbars scrollbarSize={8}>
          <Box>
            {/* Select All Option */}
            <Box
              px={12}
              py={8}
              style={{
                backgroundColor: "#E6F3FF",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectAll();
              }}
            >
              <Group gap="xs" wrap="nowrap">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={() => {}}
                  aria-hidden
                  tabIndex={-1}
                  style={{ pointerEvents: "none" }}
                  size="xs"
                  color="#42AF8E"
                />
                <Text fz={14} fw={500} c="#003B52">
                  Select All Locations
                </Text>
              </Group>
            </Box>

            <Combobox.Options>
              {options.length > 0 ? (
                options
              ) : (
                <Combobox.Empty>
                  <Text ta="center" py="md" c="dimmed" fz={14}>
                    No locations found
                  </Text>
                </Combobox.Empty>
              )}
            </Combobox.Options>
          </Box>
        </ScrollArea.Autosize>

        {/* Footer */}
        <Group
          justify="space-between"
          align="center"
          style={{
            borderTop: "1px solid #dee2e6",
            backgroundColor: "#f8f9fa",
          }}
          gap={0}
          grow
        >
          <Button
            variant="outline"
            size="xs"
            radius={0}
            color="#122f47"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            disabled={pendingValue.length === 0}
            styles={{
              root: {
                borderColor: pendingValue.length === 0 ? "#dee2e6" : "#122f47"
              }
            }}
          >
            Clear All
          </Button>
          <Button
              variant="outline"
              size="xs"
              radius={0}
              color="#122f47"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleApply();
              }}
              disabled={pendingValue.length === 0}
              styles={{
                root: {
                  borderColor: pendingValue.length === 0 ? "#dee2e6" : "#122f47"
                }
              }}
            >
              Apply
            </Button>
        </Group>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default CheckboxMultiSelect;
