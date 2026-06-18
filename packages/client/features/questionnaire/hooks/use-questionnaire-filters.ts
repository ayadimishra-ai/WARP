import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import type {
  PaginationState,
  QuestionnaireFilters,
  SortingState,
} from "../types/questionnaire.types";

const DEFAULT_PAGE_SIZE = 10;
// Define DEFAULT_FILTERS outside the component to avoid recreating it on every render
const DEFAULT_FILTERS: QuestionnaireFilters = {
  limit: DEFAULT_PAGE_SIZE,
  offset: 0,
  sortBy: "created_at",
  sortDirection: "desc",
};

export const useQuestionnaireFilters = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionnaireFilters>(DEFAULT_FILTERS);

  // Parse URL parameters and set initial filters
  useEffect(() => {
    // Skip if no query parameters yet or if it's the initial render
    if (!router.isReady) return;

    const {
      title,
      description,
      type,
      tags,
      page = "1",
      pageSize = DEFAULT_PAGE_SIZE.toString(),
      sortBy = "created_at",
      sortDirection = "desc",
      dateFrom,
      dateTo,
    } = router.query;

    const parsedFilters: QuestionnaireFilters = {
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      type: typeof type === "string" ? type : undefined,
      tags: typeof tags === "string" ? tags.split(",") : undefined,
      limit: parseInt(pageSize as string) || DEFAULT_PAGE_SIZE,
      offset:
        (parseInt(page as string) - 1) *
        (parseInt(pageSize as string) || DEFAULT_PAGE_SIZE),
      sortBy: typeof sortBy === "string" ? sortBy : "created_at",
      sortDirection:
        sortDirection === "asc" || sortDirection === "desc"
          ? sortDirection
          : "desc",
      dateRange:
        dateFrom && dateTo
          ? {
              start: new Date(dateFrom as string),
              end: new Date(dateTo as string),
            }
          : undefined,
    };

    // Check if we need to update filters to match URL
    let needsUpdate = false;

    if (parsedFilters.title !== filters.title) needsUpdate = true;
    else if (parsedFilters.description !== filters.description)
      needsUpdate = true;
    else if (parsedFilters.type !== filters.type) needsUpdate = true;
    else if (
      JSON.stringify(parsedFilters.tags) !== JSON.stringify(filters.tags)
    )
      needsUpdate = true;
    else if (parsedFilters.limit !== filters.limit) needsUpdate = true;
    else if (parsedFilters.offset !== filters.offset) needsUpdate = true;
    else if (parsedFilters.sortBy !== filters.sortBy) needsUpdate = true;
    else if (parsedFilters.sortDirection !== filters.sortDirection)
      needsUpdate = true;
    else if (
      (parsedFilters.dateRange && !filters.dateRange) ||
      (!parsedFilters.dateRange && filters.dateRange) ||
      (parsedFilters.dateRange &&
        filters.dateRange &&
        (parsedFilters.dateRange.start.getTime() !==
          filters.dateRange.start.getTime() ||
          parsedFilters.dateRange.end.getTime() !==
            filters.dateRange.end.getTime()))
    ) {
      needsUpdate = true;
    }

    // Only update if needed to prevent infinite loops
    if (needsUpdate) {
      setFilters(parsedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, router.isReady]);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: QuestionnaireFilters) => {
      // Skip URL update during initial mount
      if (!router.isReady) return;

      const query: Record<string, string> = {};

      if (newFilters.title) query.title = newFilters.title;
      if (newFilters.description) query.description = newFilters.description;
      if (newFilters.type) query.type = newFilters.type;
      if (newFilters.tags && newFilters.tags.length > 0)
        query.tags = newFilters.tags.join(",");
      if (newFilters.sortBy && newFilters.sortBy !== DEFAULT_FILTERS.sortBy)
        query.sortBy = newFilters.sortBy;
      if (
        newFilters.sortDirection &&
        newFilters.sortDirection !== DEFAULT_FILTERS.sortDirection
      )
        query.sortDirection = newFilters.sortDirection;

      // Calculate page from offset
      const currentPage =
        Math.floor(
          (newFilters.offset || 0) / (newFilters.limit || DEFAULT_PAGE_SIZE)
        ) + 1;
      if (currentPage > 1) query.page = currentPage.toString();
      if (newFilters.limit && newFilters.limit !== DEFAULT_PAGE_SIZE) {
        query.pageSize = newFilters.limit.toString();
      }

      if (newFilters.dateRange) {
        query.dateFrom = newFilters.dateRange.start.toISOString().split("T")[0];
        query.dateTo = newFilters.dateRange.end.toISOString().split("T")[0];
      }

      // Check if query parameters have actually changed before updating
      const currentQuery = router.query;
      let hasChanges = false;

      // Check if any parameters are different
      for (const key in query) {
        if (query[key] !== currentQuery[key]) {
          hasChanges = true;
          break;
        }
      }

      // Check if any parameters were removed
      if (!hasChanges) {
        for (const key in currentQuery) {
          if (
            key !== "pathname" &&
            key !== "page" &&
            key !== "pageSize" &&
            !(key in query)
          ) {
            hasChanges = true;
            break;
          }
        }
      }

      // Only update URL if there are actual changes
      if (hasChanges) {
        router.push(
          {
            pathname: router.pathname,
            query,
          },
          undefined,
          { shallow: true }
        );
      }
    },
    [router]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<QuestionnaireFilters>) => {
      // Create a deep copy of the current filters
      const updatedFilters = JSON.parse(
        JSON.stringify({ ...filters, ...newFilters })
      );

      // Reset offset when changing non-pagination filters
      if (
        "title" in newFilters ||
        "description" in newFilters ||
        "type" in newFilters ||
        "tags" in newFilters ||
        "dateRange" in newFilters
      ) {
        updatedFilters.offset = 0;
      }

      // Debug output
      console.log("Updating filters:", updatedFilters);

      // Check if filters actually changed before updating
      const currentFiltersStr = JSON.stringify(filters);
      const newFiltersStr = JSON.stringify(updatedFilters);

      if (currentFiltersStr !== newFiltersStr) {
        setFilters(updatedFilters);
        updateURL(updatedFilters);
      }
    },
    [filters, updateURL]
  );

  const setPagination = useCallback(
    (pagination: PaginationState) => {
      console.log("Setting pagination:", pagination);
      const newOffset = (pagination.page - 1) * pagination.pageSize;
      updateFilters({
        limit: pagination.pageSize,
        offset: newOffset,
      });
    },
    [updateFilters]
  );

  const setSorting = useCallback(
    (sorting: SortingState) => {
      console.log("Setting sorting:", sorting);
      updateFilters({
        sortBy: sorting.column,
        sortDirection: sorting.direction,
      });
    },
    [updateFilters]
  );

  const setTextFilter = useCallback(
    (field: "title" | "description", value: string) => {
      updateFilters({
        [field]: value || undefined,
      });
    },
    [updateFilters]
  );

  const setSelectFilter = useCallback(
    (field: "type", value: string | undefined) => {
      updateFilters({
        [field]: value,
      });
    },
    [updateFilters]
  );

  const setTagsFilter = useCallback(
    (tags: string[]) => {
      updateFilters({
        tags: tags.length > 0 ? tags : undefined,
      });
    },
    [updateFilters]
  );

  const setDateRangeFilter = useCallback(
    (dateRange: { start: Date; end: Date } | undefined) => {
      updateFilters({
        dateRange,
      });
    },
    [updateFilters]
  );

  const resetFilters = useCallback(async () => {
    // Create a deep copy of DEFAULT_FILTERS
    const resetFilters = JSON.parse(JSON.stringify(DEFAULT_FILTERS));

    // First update the URL to remove all query parameters
    await router.replace(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true }
    );

    // Then update the local state
    setFilters(resetFilters);

    // Return the reset filters so components can update their local state
    return resetFilters;
  }, [router]);

  // Helper to get current pagination state
  const currentPage =
    Math.floor((filters.offset || 0) / (filters.limit || DEFAULT_PAGE_SIZE)) +
    1;

  return {
    filters,
    updateFilters,
    setPagination,
    setSorting,
    setTextFilter,
    setSelectFilter,
    setTagsFilter,
    setDateRangeFilter,
    resetFilters,
    currentPage,
    pageSize: filters.limit || DEFAULT_PAGE_SIZE,
  };
};
