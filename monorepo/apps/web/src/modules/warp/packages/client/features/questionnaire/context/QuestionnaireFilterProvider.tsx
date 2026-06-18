import { useRouter } from "next/router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  PaginationState,
  QuestionnaireFilters,
  SortingState,
} from "../types/questionnaire.types";

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_FILTERS: QuestionnaireFilters = {
  limit: DEFAULT_PAGE_SIZE,
  offset: 0,
  sortBy: "created_at",
  sortDirection: "desc",
  title: undefined,
  type: undefined,
};

export interface QuestionnaireFilterContextType {
  filters: QuestionnaireFilters;
  updateFilters: (newFilters: Partial<QuestionnaireFilters>) => void;
  setPagination: (pagination: PaginationState) => void;
  setSorting: (sorting: SortingState) => void;
  setTextFilter: (field: "title" | "description", value: string) => void;
  setSelectFilter: (field: "type", value: string | undefined) => void;
  setTagsFilter: (tags: string[]) => void;
  setDateRangeFilter: (
    dateRange: { start: Date; end: Date } | undefined
  ) => void;
  resetFilters: () => Promise<QuestionnaireFilters>;
  currentPage: number;
  pageSize: number;
}

const QuestionnaireFilterContext = createContext<
  QuestionnaireFilterContextType | undefined
>(undefined);

export const QuestionnaireFilterProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionnaireFilters>(DEFAULT_FILTERS);
  const filtersRef = React.useRef(filters);

  // Keep the ref in sync with state
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Parse URL parameters and set initial filters
  useEffect(() => {
    if (!router.isReady) return;

    const currentFilters = filtersRef.current; // Use the ref instead of state dependency

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
      accessToken,
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
      accessToken: typeof accessToken === "string" ? accessToken : undefined,
    };

    let needsUpdate = false;
    if (parsedFilters.title !== currentFilters.title) needsUpdate = true;
    else if (parsedFilters.description !== currentFilters.description)
      needsUpdate = true;
    else if (parsedFilters.type !== currentFilters.type) needsUpdate = true;
    else if (
      JSON.stringify(parsedFilters.tags) !== JSON.stringify(currentFilters.tags)
    )
      needsUpdate = true;
    else if (parsedFilters.limit !== currentFilters.limit) needsUpdate = true;
    else if (parsedFilters.offset !== currentFilters.offset) needsUpdate = true;
    else if (parsedFilters.sortBy !== currentFilters.sortBy) needsUpdate = true;
    else if (parsedFilters.sortDirection !== currentFilters.sortDirection)
      needsUpdate = true;
    else if (
      (parsedFilters.dateRange && !currentFilters.dateRange) ||
      (!parsedFilters.dateRange && currentFilters.dateRange) ||
      (parsedFilters.dateRange &&
        currentFilters.dateRange &&
        (parsedFilters.dateRange.start?.getTime() !==
          currentFilters.dateRange.start?.getTime() ||
          parsedFilters.dateRange.end?.getTime() !==
            currentFilters.dateRange.end?.getTime()))
    ) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      setFilters(parsedFilters);
    }
  }, [router.query, router.isReady]); // Removed 'filters' to prevent loop

  const updateURL = useCallback(
    (newFilters: QuestionnaireFilters) => {
      if (!router.isReady) return;

      const query: Record<string, string> = {};
      const accessToken = newFilters.accessToken || router.query.accessToken;
      if (accessToken) query.accessToken = String(accessToken);
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

      const currentPageNum =
        Math.floor(
          (newFilters.offset || 0) / (newFilters.limit || DEFAULT_PAGE_SIZE)
        ) + 1;
      if (currentPageNum > 1) query.page = currentPageNum.toString();
      if (newFilters.limit && newFilters.limit !== DEFAULT_PAGE_SIZE)
        query.pageSize = newFilters.limit.toString();

      if (newFilters.dateRange) {
        query.dateFrom = newFilters.dateRange.start.toISOString().split("T")[0];
        query.dateTo = newFilters.dateRange.end.toISOString().split("T")[0];
      }

      const currentQuery = router.query;
      let hasChanges = false;
      for (const key in query) {
        if (query[key] !== currentQuery[key]) {
          hasChanges = true;
          break;
        }
      }

      if (!hasChanges) {
        for (const key in currentQuery) {
          if (key !== "pathname" && key !== "accessToken" && !(key in query)) {
            hasChanges = true;
            break;
          }
        }
      }

      if (hasChanges) {
        router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
        });
      }
    },
    [router]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<QuestionnaireFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      if (
        "title" in newFilters ||
        "description" in newFilters ||
        "type" in newFilters ||
        "tags" in newFilters ||
        "dateRange" in newFilters
      ) {
        updatedFilters.offset = 0;
      }

      if (JSON.stringify(filters) !== JSON.stringify(updatedFilters)) {
        setFilters(updatedFilters);
        updateURL(updatedFilters);
      }
    },
    [filters, updateURL]
  );

  const setPagination = useCallback(
    (pagination: PaginationState) => {
      updateFilters({
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
      });
    },
    [updateFilters]
  );

  const setSorting = useCallback(
    (sorting: SortingState) => {
      updateFilters({
        sortBy: sorting.column,
        sortDirection: sorting.direction,
      });
    },
    [updateFilters]
  );

  const setTextFilter = useCallback(
    (field: "title" | "description", value: string) => {
      updateFilters({ [field]: value || undefined });
    },
    [updateFilters]
  );

  const setSelectFilter = useCallback(
    (field: "type", value: string | undefined) => {
      updateFilters({ [field]: value });
    },
    [updateFilters]
  );

  const setTagsFilter = useCallback(
    (tags: string[]) => {
      updateFilters({ tags: tags.length > 0 ? tags : undefined });
    },
    [updateFilters]
  );

  const setDateRangeFilter = useCallback(
    (dateRange: { start: Date; end: Date } | undefined) => {
      updateFilters({ dateRange });
    },
    [updateFilters]
  );

  const resetFilters = useCallback(async () => {
    const accessToken = router.query.accessToken as string | undefined;
    const freshDefaults = {
      ...DEFAULT_FILTERS,
      accessToken,
    };

    // Update state first for immediate UI feedback
    setFilters(freshDefaults);

    // Then update URL
    await router.replace(
      {
        pathname: router.pathname,
        query: accessToken ? { accessToken } : {},
      },
      undefined,
      { shallow: true }
    );

    return freshDefaults;
  }, [router]);

  const currentPage =
    Math.floor((filters.offset || 0) / (filters.limit || DEFAULT_PAGE_SIZE)) +
    1;

  const value = {
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

  return (
    <QuestionnaireFilterContext.Provider value={value}>
      {children}
    </QuestionnaireFilterContext.Provider>
  );
};

export const useQuestionnaireFilterContext = () => {
  const context = useContext(QuestionnaireFilterContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionnaireFilterContext must be used within a QuestionnaireFilterProvider"
    );
  }
  return context;
};
