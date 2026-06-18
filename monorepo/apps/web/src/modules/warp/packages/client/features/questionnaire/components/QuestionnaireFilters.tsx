import { Autocomplete, Box, Button, Flex } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useDebouncedValue } from "@mantine/hooks";
import { IconRefresh } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import SearchIcon from "../../../components/svgIcons/SearchIcon";
import { useQuestionnaireFilters, useQuestionnaireList } from "../hooks";

export const QuestionnaireFilters: React.FC = () => {
  const { filters, setTextFilter, setSelectFilter, resetFilters } =
    useQuestionnaireFilters();

  // Get data for extracting filter options
  const allFilters = { ...filters, limit: 999 }; // Use a large limit to get all items for options
  const { questionnaires, loading } = useQuestionnaireList(allFilters);

  // Extract unique types from the data
  const filterOptions = useMemo(() => {
    const types = new Set<string>();

    // Default options in case data isn't loaded yet
    if (loading || questionnaires.length === 0) {
      return {
        types: [],
      };
    }

    // Debug - log the first questionnaire to see the data structure
    if (questionnaires.length > 0) {
      console.log("Debug - first questionnaire:", {
        id: questionnaires[0].id,
        title: questionnaires[0].title,
        formtype: questionnaires[0].formtype,
      });
    }

    // Define interface for questionnaire items
    interface Questionnaire {
      id: string;
      title: string;
      formtype?: string;
    }

    (questionnaires as Questionnaire[]).forEach((item: Questionnaire) => {
      // Add formtype
      if (item.formtype) {
        types.add(item.formtype);
      }
    });

    return {
      types: Array.from(types),
    };
  }, [questionnaires, loading]);

  const [titleValue, setTitleValue] = React.useState(filters.title || "");
  const [formTypeValue, setFormTypeValue] = React.useState(filters.type || "");
  const [debouncedTitle] = useDebouncedValue(titleValue, 300);
  const [debouncedFormType] = useDebouncedValue(formTypeValue, 300);

  // Update filters when debounced values change
  React.useEffect(() => {
    if (debouncedTitle !== filters.title) {
      setTextFilter("title", debouncedTitle);
    }
  }, [debouncedTitle, filters.title, setTextFilter]);

  React.useEffect(() => {
    if (debouncedFormType !== filters.type) {
      setSelectFilter("type", debouncedFormType || undefined);
    }
  }, [debouncedFormType, filters.type, setSelectFilter]);

  const hasActiveFilters = Boolean(filters.title || filters.type);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const useStyles = createStyles((theme) => ({
    searchInputWrapper: {
      "&:hover": {
        borderColor: "#005c81 !important",
        color: "#424143 !important",
      },
      "&:focus": {
        borderColor: "#005c81 !important",
        background: "#ffffff !important",
        color: "#424143 !important",
        letterSpacing: "0.02em !important",
      },
    },
  }));
  const { classes } = useStyles();

  // Shared autocomplete props to reduce duplication
  const getAutocompleteProps = (inputId: string) => ({
    style: { flex: 1, minWidth: 200 },
    icon: (
      <SearchIcon color={focusedInput === inputId ? "#005C81" : "#666666"} />
    ),
    classNames: {
      root: `${
        focusedInput === inputId
          ? "SearchInputBoxFocus"
          : "mantine-Autocomplete-root SearchInputBox"
      }`,
    },
    radius: 0 as const,
    variant: "unstyled" as const,
    sx: {
      width: "100%",
      backgroundColor: "#F1F3F6",
      borderRadius: "30px",
      border: "1px solid #F1F3F6",
      padding: "0px",
      paddingRight: 22,
      paddingLeft: 10,
      color: "#424143",
    },
    className: classes.searchInputWrapper,
    onFocus: () => setFocusedInput(inputId),
    onBlur: () => setFocusedInput(null),
    data: [],
  });

  return (
    <Box>
      {/* <Group align="flex-start" spacing="md">
        <Text
          size="sm"
          weight={500}
          mb="xs"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <IconFilter size={16} />
          Filters
        </Text>
      </Group> */}

      <Flex gap="md" align="center">
        <Autocomplete
          placeholder="Search by questionnaire name..."
          value={titleValue}
          onChange={setTitleValue}
          {...getAutocompleteProps("title")}
        />

        <Autocomplete
          placeholder="Search by Reporting Framework/Assessment..."
          value={formTypeValue}
          onChange={setFormTypeValue}
          {...getAutocompleteProps("formType")}
        />

        {hasActiveFilters && (
          <Button
            color="solidBtn"
            leftSection={<IconRefresh size={16} />}
            onClick={async () => {
              const resetValues = await resetFilters();
              // Reset local state to match the reset filters
              setTitleValue(resetValues.title || "");
              setFormTypeValue(resetValues.type || "");
            }}
          >
            Reset Filters
          </Button>
        )}
      </Flex>

      {/* <Group grow spacing="md" mb="md">
        <Select
          placeholder={loading ? "Loading frameworks..." : "Select framework"}
          data={filterOptions.types.map((type: string) => ({
            value: type,
            label:
              type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
          }))}
          value={filters.type}
          onChange={(value) => setSelectFilter("type", value || undefined)}
          clearable
          size="sm"
          disabled={loading}
        />
      </Group> */}

      {/* <Group spacing="sm"> */}
      {/* <Box ml="auto">
          <Text size="xs" c="dimmed">
            {hasActiveFilters ? "Filters applied" : "No filters applied"}
          </Text>
        </Box> */}
      {/* </Group> */}
    </Box>
  );
};
