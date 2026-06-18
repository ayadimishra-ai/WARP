"use client";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  createTheme,
  Flex,
  Loader,
  MantineProvider,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCaretDownFilled,
  IconCaretUpDownFilled,
  IconCaretUpFilled,
  IconCheck,
  IconCircleX,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_GlobalFilterTextInput,
  MRT_Icons,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
} from "mantine-react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableState,
} from "mantine-react-table";
import SearchIcon from "@/modules/ghg/components/icons/SearchIcon";

import EditIconDisabled from "@/modules/ghg/components/icons/EditIconDisabled";
import { GRID_POWER_STATUS, UPLOAD_TYPES, UploadType } from "@/modules/ghg/shared/constants/activity.constant";
import {
  manualEntryConfirmCancel,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import EditIcon from "../../../components/icons/EditIcon";

// Types based on input.constant
type RowData = Record<
  string,
  string | number | null | undefined | boolean | any
>;

interface DataChangePayload {
  updatedValues?: RowData;
  originalData?: RowData;
  newData?: RowData[];
}
type ColumnDefinition = {
  name: string;
  key: string;
  hide?: boolean;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  type?:
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "single-select"
  | "multi-select"
  | "autocomplete";
  decimalPlaces?: boolean;
  error?: string;
  placeholder?: string;
  /**
   * Optional callback to provide dynamic options for a dropdown based on current row data.
   * Useful for "dependent dropdowns" (e.g., UoM options changing based on selected Fuel Type).
   */
  getOptions?: (rowData: RowData) => Array<{ label: string; value: any }>;
  // getOptions?: (rowData: any) => Array<{ label: string; value: any }>;
  /**
   * Optional callback to determine if a field is required based on current row data.
   */
  getIsRequired?: (rowData: any) => boolean;
  /**
   * Optional callback to determine if a field should be disabled based on current row data.
   */
  getIsDisabled?: (rowData: any) => boolean;
  /**
   * Optional callback to determine if a field should be hidden based on current row data.
   */
  getIsHidden?: (rowData: any) => boolean;
  /**
   * Optional override options for this column when a new row is being created.
   * When set, these options replace col.options in the "Add New Entry" row only.
   */
  addNewEntryOptions?: Array<{ label: string; value: any }>;
  /**
   * Optional list of field keys to reset when this field's value changes.
   */
  resetFields?: string[];
  /**
   * Optional list of field keys to re-validate when this field's value changes.
   * Useful for cross-field dependency validation (e.g., UoM and Distance).
   */
  validateFields?: string[];
};

type TableColumn = {
  key: string;
  label: string;
  code: string;
  type?: ColumnDefinition["type"];
  required: boolean;
  decimalPlaces: boolean;
  error?: string;
  readOnly: boolean;
  placeholder?: string;
  getOptions?: (rowData: any) => Array<{ label: string; value: any }>;
  getIsRequired?: (rowData: any) => boolean;
  getIsDisabled?: (rowData: any) => boolean;
  getIsHidden?: (rowData: any) => boolean;
  resetFields?: string[];
  validateFields?: string[];
  options: string[];
  valueMap: Record<string, any>;
  addNewEntryOptions?: Array<{ label: string; value: any }>;
};

interface ManualEntryTableProps {
  columns: ColumnDefinition[];
  initialData?: RowData[];
  onDataChange?: (payload: DataChangePayload) => Promise<boolean>;
  onDeleteRows?: (selectedRowIndices: number[]) => Promise<boolean>;
  locationOptions?: Array<{ value: string; label: string }>;
  addNewEntryLocationOptions?: Array<{ value: string; label: string }>; // Filtered location options for "Add new entry" form
  baselineYear?: number;
  financialYearMonth?: string;
  getMonthOptions?: (
    selectedYear: string | number | undefined | null,
    baselineYear?: number,
    financialYearMonth?: string
  ) => string[];
  getUomOptions?: (
    selectedFuelType: string | undefined | null
  ) => Array<{ value: string; label: string }>;
  onClearFieldError?: (fieldKey: string) => void;
  /**
 * Fires after the user confirms cancelling an edit/create/inline-edit.
 * Used by parent listings to clear banner-level errors (e.g. the
 * "Data has already been approved..." 422 message) so they don't linger
 * after the user backs out of the row that produced them.
 */
  onCancelEdit?: () => void;
  fieldErrors?: Record<string, string>;
  isValidating?: boolean;
  // Server-side props
  rowCount?: number;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  onPaginationChange?: (
    updater:
      | MRT_PaginationState
      | ((old: MRT_PaginationState) => MRT_PaginationState)
  ) => void;
  onSortingChange?: (
    updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState)
  ) => void;
  onGlobalFilterChange?: (updater: string | ((old: string) => string)) => void;
  state?: Partial<MRT_TableState<RowData>>;
  hasAIExtractedData?: (rowData: RowData) => boolean;
  // Upload type filter
  uploadType?: UploadType;
  onUploadTypeChange?: (uploadType: UploadType) => void;
  uploadTypeCounts?: {
    All: number;
    "AI Uploaded": number;
    "Manual Entry": number;
  };
  globalFilter?: string;
  // Whether to show the upload type filter tabs (All, AI Uploaded, Manual Entry)
  showUploadTypeTabs?: boolean;
  // Role-based access control
  isOrganizationAdmin?: boolean;
  // Whether to hide the mandatory text (useful if page header already provides it)
  hideMandatoryText?: boolean;
  // Optional callback to expose the internal table instance once ready
  // Optional callback to expose the internal table instance once ready
  // Fields to lock (render read-only) for pre-populated rows only
  // (pre-populated rows are identified via row.original._isPrePopulated === true)
  prePopulatedLockedFields?: string[];
  // Fields to always lock (render read-only) for ALL rows, regardless of whether they are pre-populated
  alwaysLockedFields?: string[];
  // Fields that are editable but disabled when they have a pre-filled value (e.g., from master data)
  // These fields show as inputs but with disabled state when pre-filled
  disabledWhenPreFilledFields?: string[];
  // Optional hook used by parent to capture MRT instance
  onTableInstanceReady?: (table: any) => void;
  // Backward/forward compatibility: some listing pages pass these props
  autoEditFirstEmptyRow?: boolean;
  // Enable inline editing for pre-populated rows (empty fields show as inputs, filled fields show as labels)
  enableInlineEditForPrePopulated?: boolean;

  // Overrides to hide features
  hideAddButton?: boolean;
  disableAddButton?: boolean;
  hideDeleteButton?: boolean;
  hideCheckboxes?: boolean;
  disableSelectAll?: boolean;
  // Custom tabs override (e.g. for "Pending Data" injects)
  customTabs?: Array<{ label: string; value: string; count?: number }>;
  activeCustomTab?: string;
  onCustomTabChange?: (tab: string) => void;
}

const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <IconCaretUpDownFilled size={6.5} {...props} />
  ),
  IconSortAscending: (props: any) => (
    <IconCaretUpFilled size={6.5} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <IconCaretDownFilled size={6.5} {...props} />
  ),
  IconDeviceFloppy: (props: any) => <IconDeviceFloppy {...props} />,
};

const ManualEntryTable = ({
  columns: columnsProp,
  initialData = [],
  onDataChange,
  onDeleteRows,
  addNewEntryLocationOptions,
  baselineYear,
  financialYearMonth,
  getMonthOptions,
  getUomOptions,
  onClearFieldError,
  onCancelEdit,
  fieldErrors = {},
  isValidating = false,
  // Server-side props with defaults
  rowCount = 0,
  hasAIExtractedData,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  state: externalState,
  // Upload type filter
  uploadType = UPLOAD_TYPES.ALL,
  onUploadTypeChange,
  uploadTypeCounts,
  globalFilter = "",
  // Whether to show upload type tabs (defaults to true for backward compatibility)
  showUploadTypeTabs = true,
  // Role-based access control
  isOrganizationAdmin = false,
  // New prop to hide the mandatory text
  hideMandatoryText = false,
  // Lock specific fields for pre-populated rows only
  prePopulatedLockedFields = [],
  // Fields to always lock (render read-only) for ALL rows
  alwaysLockedFields = [],
  // Fields that are disabled when pre-filled (editable but disabled when value exists)
  disabledWhenPreFilledFields = [],
  // Optional callback used by parent to capture the table instance
  onTableInstanceReady,
  // Compatibility props (not currently used for logic)
  autoEditFirstEmptyRow,
  // Enable inline editing for pre-populated rows
  enableInlineEditForPrePopulated = false,

  // Feature overrides
  hideAddButton = false,
  disableAddButton = false,
  hideDeleteButton = false,
  hideCheckboxes = false,
  disableSelectAll = false,
  customTabs,
  activeCustomTab,
  onCustomTabChange,
}: ManualEntryTableProps) => {
  const [data, setData] = useState<RowData[]>(initialData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [selectedYearPerRow, setSelectedYearPerRow] = useState<
    Record<string, string | number | null>
  >({});
  const [selectedFuelTypePerRow, setSelectedFuelTypePerRow] = useState<
    Record<string, string | null>
  >({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [recentlyEditedRowIds, setRecentlyEditedRowIds] = useState<Set<string>>(
    new Set()
  );
  const [highlightFadeTimeouts, setHighlightFadeTimeouts] = useState<
    Map<string, number>
  >(new Map());
  const [pendingCancelAction, setPendingCancelAction] = useState<{
    type: "creating" | "editing" | "inline-editing";
    row?: Record<string, any>;
    table: Record<string, any> | null;
  } | null>(null);

  const pendingHighlightRef = useRef<{
    type: "by-identity";
    location: any;
    year: any;
    month: any;
  } | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [creatingRow, setCreatingRow] = useState<any>(null);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const editingRowRef = useRef<any>(null);

  // State to track inline edited values for pre-populated rows
  // Key is rowId, value is an object of fieldKey -> value
  const [inlineEditedValues, setInlineEditedValues] = useState<
    Record<string, Record<string, any>>
  >({});

  // Track which row is currently being saved so fieldErrors map to the correct row
  const [currentSavingRowId, setCurrentSavingRowId] = useState<string | null>(
    null
  );
  // Update data when initialData changes (pagination/filter/refresh).
  // For inline editing mode, we preserve inlineEditedValues so user's ongoing edits
  // don't get lost when data refetches (e.g., after saving another row).
  // We only clear them if user explicitly cancels or the user navigates away from inline editing.
  useEffect(() => {
    setData(initialData);
    // Only reset inline-edit state if NOT in inline editing mode
    // In inline editing mode, preserve user's edits even when data refetches
    if (!enableInlineEditForPrePopulated) {
      setInlineEditedValues({});
    }
    setCurrentSavingRowId(null);
    setValidationErrors({});

    if (pendingHighlightRef.current) {
      // Standard mode only: row moves to top after refetch (sorted by updated_at desc).
      // Find its new position in the refreshed initialData and highlight it.
      const { location, year, month } = pendingHighlightRef.current;
      pendingHighlightRef.current = null;
      const newIndex = initialData.findIndex(
        (row: any) =>
          row.location === location && row.year === year && row.month === month
      );
      if (newIndex !== -1) {
        // Inline the highlight to avoid a forward-reference dependency on
        // addRecentEditHighlight (which is declared after this useEffect)
        const rowId = `row-${newIndex}`;
        setRecentlyEditedRowIds((prev) => new Set([...prev, rowId]));
        const timeoutId = window.setTimeout(() => {
          setRecentlyEditedRowIds((prev) => {
            const next = new Set(prev);
            next.delete(rowId);
            return next;
          });
          setHighlightFadeTimeouts((prev) => {
            const next = new Map(prev);
            next.delete(rowId);
            return next;
          });
        }, 3000);
        setHighlightFadeTimeouts(
          (prev) => new Map([...prev, [rowId, timeoutId]])
        );
      }
    }
  }, [initialData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      highlightFadeTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, [highlightFadeTimeouts]);

  // Function to add highlight to recently edited row
  const addRecentEditHighlight = useCallback(
    (rowId: string) => {
      // Clear any existing timeout for this row
      const existingTimeout = highlightFadeTimeouts.get(rowId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Add to highlighted rows
      setRecentlyEditedRowIds((prev) => new Set([...prev, rowId]));

      // Set timeout to remove highlight after 3 seconds
      const timeoutId = window.setTimeout(() => {
        setRecentlyEditedRowIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(rowId);
          return newSet;
        });
        setHighlightFadeTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(rowId);
          return newMap;
        });
      }, 3000);

      // Store timeout reference
      setHighlightFadeTimeouts(
        (prev) => new Map([...prev, [rowId, timeoutId]])
      );
    },
    [highlightFadeTimeouts]
  );

  // Apply field errors from props (from API validation)
  // We store a ref of the last-applied fieldErrors to detect when individual keys
  // are cleared by the user (via onClearFieldError) vs. when new errors arrive.
  const prevFieldErrorsRef = useRef<Record<string, string>>({});

  // Clear a specific API-applied validation error for a given rowId/fieldKey
  const clearApiValidationError = useCallback(
    (rowId: string, fieldKey: string) => {
      setValidationErrors((prev) => {
        const newPrev = { ...prev };
        if (!newPrev[rowId]) return prev;
        const rowErrors = { ...newPrev[rowId] };
        delete rowErrors[fieldKey];
        if (Object.keys(rowErrors).length === 0) {
          delete newPrev[rowId];
        } else {
          newPrev[rowId] = rowErrors;
        }
        return newPrev;
      });
      // Also remove from our prev applied ref so useEffect doesn't re-apply it
      prevFieldErrorsRef.current = Object.fromEntries(
        Object.entries(prevFieldErrorsRef.current).filter(
          ([k]) => k !== fieldKey
        )
      );
    },
    []
  );

  useEffect(() => {
    const targetRowId = currentSavingRowId;
    if (!targetRowId) return;

    const currentKeys = Object.keys(fieldErrors);
    const prevKeys = Object.keys(prevFieldErrorsRef.current);

    if (currentKeys.length === 0 && prevKeys.length > 0) {
      // All field errors have been cleared (user cleared them or save succeeded)
      // Remove only the previously-applied API errors from validationErrors for this row
      setValidationErrors((prev) => {
        const rowErrors = { ...prev[targetRowId] };
        prevKeys.forEach((key) => {
          delete rowErrors[key];
        });
        const newErrors = { ...prev };
        if (Object.keys(rowErrors).length === 0) {
          delete newErrors[targetRowId];
        } else {
          newErrors[targetRowId] = rowErrors;
        }
        return newErrors;
      });
      prevFieldErrorsRef.current = {};
    } else if (currentKeys.length > 0) {
      // New errors arrived or errors still present — only apply on fresh arrival
      // (i.e. when the set of keys differs from what was previously applied, indicating
      //  a new API response rather than the user clearing individual keys)
      const isNewErrorBatch =
        prevKeys.length === 0 ||
        currentKeys.length > prevKeys.length ||
        currentKeys.some((k) => !prevFieldErrorsRef.current[k]);

      if (isNewErrorBatch) {
        setValidationErrors((prev) => ({
          ...prev,
          [targetRowId]: { ...prev[targetRowId], ...fieldErrors },
        }));
        prevFieldErrorsRef.current = { ...fieldErrors };
      } else {
        // User is clearing individual keys — remove cleared keys from validationErrors
        const removedKeys = prevKeys.filter((k) => !fieldErrors[k]);
        if (removedKeys.length > 0) {
          setValidationErrors((prev) => {
            const rowErrors = { ...prev[targetRowId] };
            removedKeys.forEach((key) => {
              delete rowErrors[key];
            });
            const newErrors = { ...prev };
            if (Object.keys(rowErrors).length === 0) {
              delete newErrors[targetRowId];
            } else {
              newErrors[targetRowId] = rowErrors;
            }
            return newErrors;
          });
          prevFieldErrorsRef.current = { ...fieldErrors };
        }
      }
    }
  }, [fieldErrors, currentSavingRowId]);

  // Handle popup confirmation response
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const messageData = JSON.parse(event.data);

      if (
        messageData.type === "manual-entry-confirm-cancel-response" &&
        pendingCancelAction
      ) {
        const { confirmedDiscard } = messageData.data;
        const { type, row, table } = pendingCancelAction;

        if (confirmedDiscard) {
          // Clear external field errors
          if (onClearFieldError) {
            Object.keys(fieldErrors).forEach((key) => onClearFieldError(key));
          }
          // Notify the parent listing so it can clear banner-level errors
          // (e.g. the 422 "data has already been approved" message that
          // would otherwise linger after the user backs out of the row).
          onCancelEdit?.();
          // Clear saving row tracking
          setCurrentSavingRowId(null);

          if (type === "creating" && table) {
            table.setCreatingRow(null);
            setValidationErrors({});
          } else if (type === "editing" && row && table) {
            // Reset the row data back to original before closing edit mode
            row._valuesCache = { ...row.original };
            table.setEditingRow(null);
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[row.id];
              return newErrors;
            });
          } else if (type === "inline-editing" && row) {
            // Handle inline edit cancel - clear inline edits and validation errors
            const rowId = row.id;
            setInlineEditedValues((prev) => {
              const newState = { ...prev };
              delete newState[rowId];
              return newState;
            });
            setValidationErrors((prev) => {
              const newPrev = { ...prev };
              delete newPrev[rowId];
              return newPrev;
            });
            // Also clear tracking states (fuel type, year) so they revert to original row data
            setSelectedFuelTypePerRow((prev) => {
              const newState = { ...prev };
              delete newState[rowId];
              return newState;
            });
            setSelectedYearPerRow((prev) => {
              const newState = { ...prev };
              delete newState[rowId];
              return newState;
            });
            // Reset the row data cache back to original for inline edit cancel too
            // This prevents accidental mutations from sticking after cancel
            if (row && row._valuesCache) {
              row._valuesCache = { ...row.original };
            }
          }
        }
        setPendingCancelAction(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pendingCancelAction, fieldErrors, onClearFieldError,onCancelEdit]);

  // Build columns from columnsProp
  const tableColumns = useMemo(() => {
    if (!columnsProp || columnsProp.length === 0) return [];

    return columnsProp
      .filter((col) => !col.hide)
      .map((col) => ({
        key: col.key,
        label: col.name,
        code: col.key,
        type: col.type,
        required: col.required ?? false,
        decimalPlaces: col.decimalPlaces ?? false,
        error: col.error,
        readOnly: (col as any).readOnly ?? false,
        placeholder: col.placeholder,
        getOptions: col.getOptions,
        getIsRequired: col.getIsRequired,
        getIsDisabled: col.getIsDisabled,
        getIsHidden: col.getIsHidden,
        resetFields: col.resetFields,
        validateFields: col.validateFields,
        options: col.options?.map((opt) => opt.label) || [],
        valueMap: col.options?.reduce(
          (acc, opt) => {
            acc[opt.label] = opt.value;
            return acc;
          },
          {} as Record<string, any>
        ),
        addNewEntryOptions: col.addNewEntryOptions,
      }));
  }, [columnsProp]);

  // Helper function to count non-space characters
  const countNonSpaceChars = (text: string): number => {
    return (text || "").replace(/\s/g, "").length;
  };

  // Validate a single field - memoized to avoid stale closures in columns useMemo
  const validateField = useCallback(
    (rowId: string, fieldKey: string, value: any): boolean => {
      const column = tableColumns.find((col) => col.key === fieldKey);
      if (!column) return true;

      let hasError = false;
      let errorMessage = "Field is Required";

      const rowData = {
        ...data.find((r) => r.id === rowId),
        ...editingRowRef.current?._valuesCache,
      } as RowData;

      const isRequired = column.getIsRequired
        ? column.getIsRequired(rowData)
        : column.required;

      if (isRequired) {
        // Check for null, undefined, or empty string (0 is valid for numeric fields)
        hasError =
          value === null || value === undefined || String(value).trim() === "";

        // Generate custom error messages based on field key or label
        if (hasError) {
          const fieldLabel = column.label.toLowerCase();
          if (fieldKey === "year") {
            errorMessage = "Please select a valid year";
          } else if (fieldKey === "location" || fieldLabel === "location") {
            errorMessage = "Please select a valid location";
          } else if (fieldKey === "month" || fieldLabel.includes("month")) {
            errorMessage = "Please select a valid month name";
          } else if (column.type === "single-select") {
            errorMessage = `Please select a ${fieldLabel}`;
          } else {
            errorMessage = `${column.label} is required`;
          }
        }
      }

      // Character length validation for Name_of_Third_Party and Location_of_Waste_Disposal (max 300 chars, excluding spaces)
      if (
        !hasError &&
        (fieldKey === "Name_of_Third_Party" ||
          fieldKey === "Location_of_Waste_Disposal") &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        const nonSpaceCharCount = countNonSpaceChars(String(value));
        if (nonSpaceCharCount > 300) {
          hasError = true;
          errorMessage = "Max 300 characters are allowed";
        }
      }

      // Special validation for yearOfInstallation - must be exactly 4 digits
      if (
        !hasError &&
        (fieldKey === "yearOfInstallation" ||
          column.label.includes("Year of Installation")) &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        const yearString = String(value).trim();
        const digitsOnly = yearString.replace(/[.-]/g, "");

        if (digitsOnly.length !== 4 || !/^\d{4}$/.test(digitsOnly)) {
          hasError = true;
          errorMessage = "Please enter a valid 4-digit year";
        }
      }

      // Check digit length for number fields (max 15 digits - decimal point doesn't count)
      if (
        !hasError &&
        column.type === "number" &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        const numString = String(value).trim();

        // Check for negative values
        if (numString.startsWith("-") || parseFloat(numString) < 0) {
          hasError = true;
          errorMessage = "Negative values should not be accepted";
        }

        // Remove decimal point and minus sign - count only digits
        const digitsOnly = numString.replace(/[.-]/g, "");
        if (!hasError && digitsOnly.length > 15) {
          hasError = true;
          errorMessage = "Maximum 15 digits allowed";
        }
      }

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (!newErrors[rowId]) newErrors[rowId] = {};

        if (hasError) {
          newErrors[rowId][fieldKey] = errorMessage;
        } else {
          delete newErrors[rowId][fieldKey];
        }

        // Clean up empty objects
        if (Object.keys(newErrors[rowId]).length === 0) {
          delete newErrors[rowId];
        }

        return newErrors;
      });

      return !hasError;
    },
    [tableColumns, data]
  );

  // Helper function to highlight matching search text
  const highlightMatchingText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) {
      return <Text>{text}</Text>;
    }

    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <Text>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              style={{ backgroundColor: "#FFEB3B", fontWeight: "bold" }}
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </Text>
    );
  };

  // Helper function to truncate error messages to 2 lines and add tooltip if needed
  const getErrorMessage = useCallback((fullMessage: string | undefined) => {
    if (!fullMessage) return undefined;

    // Approximate max characters per line for typical error display (roughly 50-60 chars depending on font)
    const maxCharsPerLine = 8;
    const maxLines = 2;
    const maxTotalChars = maxCharsPerLine * maxLines;

    // If message is short enough, return as-is without truncation
    if (fullMessage.length <= maxTotalChars) {
      return fullMessage;
    }

    // Truncate message and add ellipsis
    const truncatedMessage =
      fullMessage.substring(0, maxTotalChars).trim() + "...";

    // Return a JSX element with tooltip that shows full message on hover
    return (
      <Tooltip
        label={fullMessage}
        multiline
        maw={300}
        withArrow
        position="bottom"
      >
        <span>{truncatedMessage}</span>
      </Tooltip>
    );
  }, []);

  // Helper function to format numeric values to 4 decimal places
  const formatNumberTo4Decimals = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    const numValue = parseFloat(String(value));
    if (isNaN(numValue)) {
      return String(value);
    }

    // Cap to 4 decimal places
    const fixed = numValue.toFixed(4);
    return parseFloat(fixed).toString();
  };

  const getRowDataForCondition = useCallback((row: any) => {
    return {
      ...row.original,
      ...row._valuesCache,
    } as RowData;
  }, []);
  // Helper function to render inline edit input for pre-populated rows
  // This is used when enableInlineEditForPrePopulated is true
  const renderInlineEditInput = useCallback(
    (
      col: any,
      cell: any,
      row: any,
      table: any,
      isPreFilledDisabled: boolean = false
    ) => {
      const rowId = row.id;
      // Get value from inline edited state, or fall back to cell value
      const inlineValue = inlineEditedValues[rowId]?.[col.key];
      const value = inlineValue !== undefined ? inlineValue : cell.getValue();
      const hasError = !!validationErrors[rowId]?.[col.key] || !!col.error;
      const errorMessage = validationErrors[rowId]?.[col.key] || col.error;
      const displayErrorMessage = getErrorMessage(errorMessage as string);

      // Merge original row data with inline-edited values for dynamic callbacks
      const currentRowData = { ...row.original, ...inlineEditedValues[rowId] };

      // Determine if field should be disabled
      const isDynamicallyDisabled = col.getIsDisabled
        ? col.getIsDisabled(currentRowData)
        : false;
      const isFieldDisabled =
        isValidating || isPreFilledDisabled || isDynamicallyDisabled;

      const handleChange = (newValue: any) => {
        // Don't allow changes if field is disabled
        if (isPreFilledDisabled) return;

        setInlineEditedValues((prev) => {
          const updated: Record<string, any> = {
            ...prev[rowId],
            [col.key]: newValue,
          };
          // Apply resetFields — clear dependent fields when this column changes
          if (col.resetFields && col.resetFields.length > 0) {
            col.resetFields.forEach((fieldKey: string) => {
              updated[fieldKey] = "";
            });
          }
          return { ...prev, [rowId]: updated };
        });
        validateField(rowId, col.key, newValue);
        onClearFieldError?.(col.key);
        // Also clear any API-applied validation error for this field on this row
        clearApiValidationError(rowId, col.key);

        // Clear field errors for reset fields
        if (col.resetFields && col.resetFields.length > 0) {
          col.resetFields.forEach((fieldKey: string) => {
            onClearFieldError?.(fieldKey);
            clearApiValidationError(rowId, fieldKey);
          });
        }

        // If fuel type changed, track it for UoM filtering and clear UoM value
        if (col.key === "typeOfFuelUsed" || col.key === "typeOfFuelPurchased") {
          setSelectedFuelTypePerRow((prev) => ({
            ...prev,
            [rowId]: newValue,
          }));
          // Clear the UoM value when fuel type changes (support all UoM key formats)
          setInlineEditedValues((prev) => ({
            ...prev,
            [rowId]: {
              ...prev[rowId],
              UoM_for_the_quantity_of_fuel_consumed: "",
              UoMForTheQuantityOfFuelConsumed: "",
              quantityOfFuelConsumedUom: "",
            },
          }));
        }
      };

      switch (col.type) {
        case "single-select": {
          // Get options - handle dynamic options for UoM based on fuel type
          let selectOptions: (string | { label: string; value: any })[] =
            col.options || [];

          // For non-skeleton rows, use addNewEntryOptions if set (ActivityMaster-only).
          // Skeleton rows (_isPrePopulated === 1) keep col.options (OrgActivityMaster-based).
          if (col.addNewEntryOptions) {
            const isSkeletonRow = row.original._isPrePopulated === 1;
            if (!isSkeletonRow) {
              selectOptions = col.addNewEntryOptions;
            }
          }

          // Generic getOptions callback (highest priority, covers mode-of-transport → fuel filtering etc.)
          if (col.getOptions) {
            const rawOptions = col.getOptions(currentRowData) || [];
            selectOptions = rawOptions.map((opt: any) =>
              typeof opt === "string"
                ? opt
                : { label: opt.label, value: opt.value ?? opt.label }
            );
          }

          // Dynamic UoM filtering based on selected fuel type
          if (
            (col.key === "UoM_for_the_quantity_of_fuel_consumed" ||
              col.key === "UoMForTheQuantityOfFuelConsumed" ||
              col.key === "quantityOfFuelConsumedUom") &&
            getUomOptions
          ) {
            // currentRowData merges row.original with inlineEditedValues[rowId],
            // so it always reflects the latest fuel type even before save.
            const fuelTypeValue =
              currentRowData.typeOfFuelUsed ??
              currentRowData.typeOfFuelPurchased;

            selectOptions = getUomOptions(fuelTypeValue as string);
          }

          // Dynamic month filtering based on selected year
          if (col.key === "month" && getMonthOptions) {
            const yearValue =
              selectedYearPerRow[rowId] ??
              row.getValue("year") ??
              row._valuesCache?.year ??
              row.original?.year;

            selectOptions = getMonthOptions(
              yearValue as string | number,
              baselineYear,
              financialYearMonth
            );
          }

          const normalizedOptions = (selectOptions || []).map((opt) =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
          );

          const selectValue = normalizedOptions.find(
            (o) => o.value === value || o.label === value
          )?.value;

          return (
            <Select
              value={selectValue ?? null}
              onChange={handleChange}
              data={normalizedOptions}
              placeholder={col.placeholder || col.label}
              error={hasError ? displayErrorMessage : undefined}
              disabled={isFieldDisabled}
              searchable
              clearable
              withScrollArea={true}
              maxDropdownHeight={226}
              scrollAreaProps={{ type: "auto", scrollbarSize: 8, }}
              styles={{
                input: {
                  minWidth: 140,
                  cursor: isPreFilledDisabled ? "not-allowed" : undefined,
                  backgroundColor: isPreFilledDisabled ? "#f5f5f5" : undefined,
                },
              }}
            />
          );
        }
        case "autocomplete": {
          let autoOptions: string[] = [];
          if (col.getOptions) {
            const rawOptions = col.getOptions(currentRowData) || [];
            autoOptions = rawOptions.map((opt: any) =>
              typeof opt === "string" ? opt : opt.label
            );
          } else if (col.options) {
            autoOptions = (col.options as any[]).map((opt: any) =>
              typeof opt === "string"
                ? opt
                : opt.label || opt.value || String(opt)
            );
          }
          return (
            <Autocomplete
              value={String(value ?? "")}
              onChange={handleChange}
              data={autoOptions}
              placeholder={col.placeholder || col.label}
              error={hasError ? displayErrorMessage : undefined}
              disabled={isFieldDisabled}
              clearable
              styles={{
                input: {
                  minWidth: 140,
                  cursor:
                    isDynamicallyDisabled || isPreFilledDisabled
                      ? "not-allowed"
                      : undefined,
                  backgroundColor:
                    isDynamicallyDisabled || isPreFilledDisabled
                      ? "#f5f5f5"
                      : undefined,
                },
              }}
            />
          );
        }
        case "number":
          return (
            <TextInput
              type="number"
              value={value ?? ""}
              onChange={(e) => {
                let inputValue = e.target.value;

                // Allow empty values
                if (inputValue === "" || inputValue === "-") {
                  handleChange("");
                  return;
                }

                // Reject inputs containing exponent or plus signs (e, E, +)
                if (/[eE+]/.test(inputValue)) return;

                // Reject negative values
                if (inputValue.startsWith("-")) {
                  return;
                }

                // Only allow digits and at most one decimal point
                // Remove any characters other than digits and '.'
                inputValue = inputValue.replace(/[^0-9.]/g, "");

                // If more than one decimal point, reject
                const dotCount = (inputValue.match(/\./g) || []).length;
                if (dotCount > 1) return;

                // Check decimal places if decimalScale is set
                if (col.decimalPlaces) {
                  const parts = inputValue.split(".");
                  if (parts.length > 1) {
                    const decimalPlaces = parts[1].length;
                    if (decimalPlaces > 4) return; // Too many decimal places
                  }
                }

                // Count only digit characters for length enforcement
                const digitsOnly = inputValue.replace(/\D/g, "");

                // If integer digits are already at limit (15), disallow adding a trailing dot
                const isTrailingDotWhenMaxDigits =
                  digitsOnly.length === 15 && inputValue.endsWith(".");

                if (digitsOnly.length <= 15 && !isTrailingDotWhenMaxDigits) {
                  const numValue =
                    inputValue === "" ? null : parseFloat(inputValue);
                  validateField(row.id, col.key, numValue);
                  onClearFieldError?.(col.key);
                  // Update the input field to display the validated value
                  handleChange(inputValue);
                }
                // If exceeds 15 digits, silently reject - don't update the input
              }}
              onKeyDown={(e) => {
                // Prevent minus, exponent and plus characters from being entered
                const blocked = ["-", "+", "e", "E"];
                if (blocked.includes(e.key)) {
                  e.preventDefault();
                  return;
                }

                // Prevent typing a dot when integer digits are already at limit
                if (e.key === ".") {
                  const current = (e.target as HTMLInputElement).value || "";
                  const currentDigitsOnly = current.replace(/\D/g, "");
                  if (currentDigitsOnly.length >= 15) {
                    e.preventDefault();
                  }
                }
              }}
              onPaste={(e) => {
                // Sanitize pasted content to prevent 'e', '+', or invalid formats
                const paste = (
                  e.clipboardData || (window as any).clipboardData
                ).getData("text");
                if (!paste) return;

                // If pasted content contains exponent or plus signs, prevent paste
                if (/[eE+]/.test(paste)) {
                  e.preventDefault();
                  return;
                }

                // Remove any characters other than digits and '.'
                const cleaned = paste.replace(/[^0-9.]/g, "");
                const dotCount = (cleaned.match(/\./g) || []).length;
                const digitsOnly = cleaned.replace(/\D/g, "");

                // If multiple dots or too many digits, prevent and optionally set a trimmed value
                // prevent a trailing dot when integer digits are already at 15
                if (
                  dotCount > 1 ||
                  digitsOnly.length > 15 ||
                  (digitsOnly.length === 15 && cleaned.endsWith("."))
                ) {
                  e.preventDefault();

                  // If the issue is too many digits, build a safe trimmed value: take first 15 digits and preserve one decimal if present
                  if (digitsOnly.length > 15) {
                    const intAndDec = cleaned.split(".");
                    const intPart = intAndDec[0]
                      .replace(/\D/g, "")
                      .slice(0, 15);
                    const decPart = intAndDec[1]
                      ? intAndDec[1].replace(/\D/g, "")
                      : "";
                    const final = decPart ? `${intPart}.${decPart}` : intPart;
                    const numValue = final === "" ? null : parseFloat(final);
                    validateField(row.id, col.key, numValue);
                    onClearFieldError?.(col.key);
                  }
                  // If the issue is a trailing dot when digits are maxed, simply prevent paste and do not set value
                }
                // Otherwise allow paste to proceed (browser will insert cleaned value via onChange logic)
              }}
              onBlur={(e) => {
                const blurValue = e.target.value;
                if (blurValue !== "" && blurValue !== "-") {
                  // Format to 4 decimal places on blur for consistency
                  if (col.decimalPlaces) {
                    const formatted = formatNumberTo4Decimals(blurValue);
                    if (formatted !== String(value ?? "")) {
                      handleChange(formatted);
                    }
                  }
                }
              }}
              placeholder={col.placeholder || col.label}
              error={hasError ? displayErrorMessage : undefined}
              disabled={isFieldDisabled}
              styles={{
                input: {
                  minWidth: 120,
                  cursor: isPreFilledDisabled ? "not-allowed" : undefined,
                  backgroundColor: isPreFilledDisabled ? "#f5f5f5" : undefined,
                },
              }}
            />
          );
        case "string":
        default: {
          const isExtendedTextField =
            col.key === "Name_of_Third_Party" ||
            col.key === "Location_of_Waste_Disposal";
          const charLimit = isExtendedTextField ? 300 : 100;
          return (
            <TextInput
              value={value ?? ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue.length <= charLimit) {
                  handleChange(inputValue);
                }
              }}
              onBlur={(e) => {
                // Trim leading/trailing spaces when leaving the field
                const trimmed = (e.target.value ?? "").toString().trim();
                if (trimmed !== e.target.value) {
                  handleChange(trimmed);
                }
              }}
              placeholder={col.placeholder || col.label}
              error={hasError ? displayErrorMessage : undefined}
              disabled={isFieldDisabled}
              styles={{
                input: {
                  minWidth: 120,
                  cursor: isPreFilledDisabled ? "not-allowed" : undefined,
                  backgroundColor: isPreFilledDisabled ? "#f5f5f5" : undefined,
                },
              }}
              maxLength={charLimit}
            />
          );
        }
      }
    },
    [
      validationErrors,
      validateField,
      onClearFieldError,
      clearApiValidationError,
      isValidating,
      getErrorMessage,
      inlineEditedValues,
      getUomOptions,
      selectedFuelTypePerRow,
      getMonthOptions,
      selectedYearPerRow,
      baselineYear,
      financialYearMonth,
    ]
  );

  // Dynamically generate MRT columns from tableColumns
  const columns = useMemo<MRT_ColumnDef<RowData>[]>(() => {
    return tableColumns.map((col) => {
      const column: MRT_ColumnDef<RowData> = {
        accessorKey: col.key,
        header: col.label + (col.required ? " *" : ""),
        Header: col.required
          ? () => (
            <span>
              {col.label} <span style={{ color: "red" }}>*</span>
            </span>
          )
          : undefined,
        size: col.key === "location" ? 200 : 160,
        Cell: ({ cell, row, table }) => {
          const isPrePopulatedRow = !!(row.original as any)?._isPrePopulated;
          // Lock fields if they are in alwaysLockedFields (all rows) OR in prePopulatedLockedFields (only pre-populated rows)
          const isLockedField =
            alwaysLockedFields?.includes(col.key as string) ||
            (isPrePopulatedRow &&
              prePopulatedLockedFields?.includes(col.key as string));
          const isDisabledWhenPreFilled = disabledWhenPreFilledFields?.includes(
            col.key as string
          );
          const cellValue = cell.getValue();
          const isEmptyValue =
            cellValue === null || cellValue === undefined || cellValue === "";

          // When inline editing is enabled:
          // - For locked fields: always show as text (non-editable)
          // - For dynamically disabled fields (via getIsDisabled): show as readonly text
          // - For disabledWhenPreFilled fields: show input but disabled if value exists
          // - For other fields: show editable input (always allow editing in inline edit mode)
          if (enableInlineEditForPrePopulated && !isLockedField) {
            // Approved rows are read-only — show text instead of editable inputs
            if ((row.original as any)?.status === GRID_POWER_STATUS.APPROVED) {
              const inlineVal = inlineEditedValues[row.id]?.[col.key as string];
              const displayVal = inlineVal !== undefined ? inlineVal : cellValue;
              return highlightMatchingText(String(displayVal ?? ""), globalFilter);
            }

            // Merge original row data with inline-edited values for dynamic callbacks
            const currentRowData = {
              ...row.original,
              ...inlineEditedValues[row.id],
            };

            // Check if this field is dynamically disabled (e.g., via getIsDisabled callback)
            const isDynamicallyDisabled = col.getIsDisabled
              ? col.getIsDisabled(currentRowData)
              : false;

            // If field is dynamically disabled, show as readonly text instead of input
            if (isDynamicallyDisabled) {
              // Prefer inline-edited value (may have been reset to "") over the original cell value
              const inlineVal = inlineEditedValues[row.id]?.[col.key as string];
              const displayVal =
                inlineVal !== undefined ? inlineVal : cellValue;
              return highlightMatchingText(
                String(displayVal || ""),
                globalFilter
              );
            }

            // Check if this field should be disabled (only for pre-populated rows with pre-filled master data)
            const shouldDisableField =
              isPrePopulatedRow && isDisabledWhenPreFilled && !isEmptyValue;

            // In inline edit mode, ALWAYS show input for non-locked fields
            // (whether the field is empty or has a value, and whether it's pre-populated or existing data)
            return renderInlineEditInput(
              col,
              cell,
              row,
              table,
              shouldDisableField
            );
          }
          // Format display for updatedAt column even when not editing
          if (col.key === "updatedAt") {
            const value = cell.getValue();
            if (value) {
              try {
                const date = new Date(value as string);
                const formattedDate = date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                return highlightMatchingText(formattedDate, globalFilter);
              } catch {
                return highlightMatchingText(String(value), globalFilter);
              }
            }
            return <Text>N/A</Text>;
          }

          // For created/updated by columns show N/A when empty (e.g., creating row)
          if (
            col.key === "createdByUserName" ||
            col.key === "updatedByUserName"
          ) {
            const val = cell.getValue();
            return val ? (
              highlightMatchingText(String(val), globalFilter)
            ) : (
              <Text>N/A</Text>
            );
          }

          // For numeric fields, ensure 0 values are displayed (handle both number 0 and string "0")
          if (col.type === "number" && (cellValue === 0 || cellValue === "0")) {
            return highlightMatchingText("0", globalFilter);
          }

          // Handle null, undefined, or empty string for non-zero numeric values
          if (isEmptyValue) {
            return highlightMatchingText("", globalFilter);
          }

          // For numeric columns, format to 4 decimal places (removes trailing zeros)
          if (col.type === "number") {
            const formattedValue = formatNumberTo4Decimals(cellValue);
            return highlightMatchingText(formattedValue, globalFilter);
          }

          const rowData = getRowDataForCondition(row);
          if (col.getIsHidden && col.getIsHidden(rowData)) {
            return null;
          }

          return highlightMatchingText(String(cellValue), globalFilter);
        },
        Edit: ({ cell, column, row, table }) => {
          const rowData = getRowDataForCondition(row);
          if (col.getIsHidden && col.getIsHidden(rowData)) {
            return null;
          }
          const isPrePopulatedRow = !!(row.original as any)?._isPrePopulated;
          // Check if this is a new row being created (ADD NEW ENTRY)
          // For creating rows, alwaysLockedFields should NOT apply - all fields should be editable
          const isCreatingNewRow = row.id.startsWith("mrt-row-create");

          // Lock fields if they are in alwaysLockedFields (for pre-populated rows only, NOT for new entries)
          // OR in prePopulatedLockedFields (only pre-populated rows)
          const isLockedByPrePopulated =
            (!isCreatingNewRow &&
              alwaysLockedFields?.includes(col.key as string)) ||
            (isPrePopulatedRow &&
              prePopulatedLockedFields?.includes(col.key as string));

          // Skip rendering edit component for readOnly columns
          if (col.readOnly || isLockedByPrePopulated) {
            // Special formatting for updatedAt column
            if (col.key === "updatedAt") {
              const value = cell.getValue();
              if (value) {
                try {
                  const date = new Date(value as string);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return <Text>{formattedDate}</Text>;
                } catch {
                  return <Text>{String(value)}</Text>;
                }
              }
              return <Text>N/A</Text>;
            }
            // created/updated by - show N/A when missing
            if (
              col.key === "createdByUserName" ||
              col.key === "updatedByUserName"
            ) {
              const val = cell.getValue();
              return <Text>{val ? String(val) : "N/A"}</Text>;
            }

            // For numeric read-only columns, format to 4 decimal places
            if (col.type === "number") {
              const formattedValue = formatNumberTo4Decimals(cell.getValue());
              return <Text>{formattedValue}</Text>;
            }

            return <Text>{String(cell.getValue())}</Text>;
          }

          // Get value from _valuesCache (edited state) or fall back to cell value (original state)
          const value =
            row._valuesCache?.[col.key] !== undefined
              ? row._valuesCache[col.key]
              : cell.getValue();
          const hasError = !!validationErrors[row.id]?.[col.key] || !!col.error;
          const errorMessage = validationErrors[row.id]?.[col.key] || col.error;
          const displayErrorMessage = getErrorMessage(errorMessage as string);

          // Check if this row has AI extracted data
          const hasAI = hasAIExtractedData && hasAIExtractedData(row.original);

          // Define locked fields for AI rows
          const lockedFieldsForAI = [
            "location",
            "year",
            "month",
            "powerConsumedThroughGridKwh",
          ];

          // Disable fields only when a save operation is in progress OR for locked AI fields
          const isDisabled =
            !!isValidating ||
            (hasAI && lockedFieldsForAI.includes(col.key)) ||
            (col.getIsDisabled && col.getIsDisabled(rowData));

          const isRequired = col.getIsRequired
            ? col.getIsRequired(rowData)
            : !!col.required;

          const handleChange = (newValue: any) => {
            row._valuesCache[col.key] = newValue;
            validateField(row.id, col.key, newValue);

            // Clear external field error when value changes
            onClearFieldError?.(col.key);
            // Also clear any API-applied validation error for this field on this row
            clearApiValidationError(row.id, col.key);

            // Handle generic field resets
            if (col.resetFields && col.resetFields.length > 0) {
              col.resetFields.forEach((fieldKey) => {
                row._valuesCache[fieldKey] = "";
                onClearFieldError?.(fieldKey);
              });
            }

            // Handle cross-field validation triggers
            if (col.validateFields && col.validateFields.length > 0) {
              col.validateFields.forEach((fieldKey: string) => {
                const depValue =
                  row._valuesCache[fieldKey] ?? row.getValue(fieldKey);
                // Only re-validate dependent if current field is being cleared
                // This avoids showing an error as soon as a unit is selected,
                // but ensures errors are cleared when a unit is unselected.
                if (!newValue) {
                  validateField(row.id, fieldKey, depValue);
                }
              });
            }

            // If year changed, track it for month filtering
            if (col.key === "year") {
              setSelectedYearPerRow((prev) => ({
                ...prev,
                [row.id]: newValue,
              }));
              // When year changes, clear any previously-selected month in the row's edit cache
              // to avoid showing a stale month that may not be valid for the newly selected year.
              row._valuesCache["month"] = "";
              // Re-validate month and clear any external field error for month
              // validateField(row.id, "month", "");
              onClearFieldError?.("month");
            }

            // If fuel type changed, track it for UoM filtering and clear UoM value
            if (
              col.key === "typeOfFuelUsed" ||
              col.key === "typeOfFuelPurchased"
            ) {
              setSelectedFuelTypePerRow((prev) => ({
                ...prev,
                [row.id]: newValue,
              }));
              // Clear the UoM value when fuel type changes (support all UoM key formats)
              row._valuesCache["UoM_for_the_quantity_of_fuel_consumed"] = "";
              row._valuesCache["UoMForTheQuantityOfFuelConsumed"] = "";
              row._valuesCache["quantityOfFuelConsumedUom"] = "";
              // Validate the cleared UoM field to remove any existing errors
              // validateField(
              //   row.id,
              //   "UoM_for_the_quantity_of_fuel_consumed",
              //   ""
              // );
            }
          };

          switch (col.type) {
            case "single-select": {
              /**
               * Dynamic options handling:
               * Priority 0: For location field in creating mode, use filtered location options
               * Priority 1: Custom getOptions callback (passed from individual module listings)
               * Priority 2: Month-specific filtering logic (built-in legacy support)
               * Priority 3: Static options defined in the column configuration
               */
              let selectOptions: (string | { label: string; value: string })[] =
                col.options || [];

              // Priority 0a: For non-skeleton rows (existing data + new entry), use addNewEntryOptions.
              // Skeleton rows (_isPrePopulated === 1) keep col.options (OrgActivityMaster-based).
              if (col.addNewEntryOptions) {
                const isSkeletonRow = row.original._isPrePopulated === 1;
                if (!isSkeletonRow) {
                  selectOptions = col.addNewEntryOptions;
                }
              }

              // Priority 0: For location field in creating mode, use filtered location options
              if (col.key === "location" && addNewEntryLocationOptions) {
                const isCreatingMode =
                  row.id.includes("creating") || !row.original.id;
                if (isCreatingMode) {
                  selectOptions = addNewEntryLocationOptions;
                }
              }

              // Priority 1: Custom getOptions callback
              if (col.getOptions) {
                // Merge original row data with current unsaved edits from cache
                const rowData = {
                  ...row.original,
                  ...row._valuesCache,
                } as RowData;
                const rawOptions = col.getOptions(rowData) || [];
                // Strip non-standard properties (e.g. `group`) so Mantine v8 Select
                // does not mistake these objects for SelectGroup items.
                selectOptions = rawOptions.map((opt: any) =>
                  typeof opt === "string"
                    ? opt
                    : { label: opt.label, value: opt.value }
                );
              }
              // Priority 2: Dynamic month filtering based on selected year and baseline
              else if (col.key === "month" && getMonthOptions) {
                const yearValue =
                  selectedYearPerRow[row.id] ??
                  row.getValue("year") ??
                  row._valuesCache?.year;

                selectOptions = getMonthOptions(
                  yearValue as string | number,
                  baselineYear,
                  financialYearMonth
                );
              }

              // Priority 3: Dynamic UoM filtering based on selected fuel type
              if (
                (col.key === "UoM_for_the_quantity_of_fuel_consumed" ||
                  col.key === "UoMForTheQuantityOfFuelConsumed" ||
                  col.key === "quantityOfFuelConsumedUom") &&
                getUomOptions
              ) {
                // selectedFuelTypePerRow is React state updated on each fuel-type change,
                // so it is always fresh on the re-render triggered by that change.
                // Fall back to _valuesCache / original for the initial edit-open case.
                const fuelTypeValue =
                  selectedFuelTypePerRow[row.id] ??
                  row._valuesCache?.typeOfFuelUsed ??
                  row.original?.typeOfFuelUsed ??
                  row._valuesCache?.typeOfFuelPurchased ??
                  row.original?.typeOfFuelPurchased;

                selectOptions = getUomOptions(fuelTypeValue as string);
              }

              const normalizedOptions = (selectOptions || []).map((opt) =>
                typeof opt === "string" ? { label: opt, value: opt } : opt
              );

              const selectValue = normalizedOptions.find(
                (o) => o.value === value || o.label === value
              )?.value;

              return (
                <Select
                  value={selectValue ?? null}
                  onChange={handleChange}
                  data={normalizedOptions}
                  placeholder={col.placeholder || col.label}
                  error={
                    hasError && !isDisabled ? displayErrorMessage : undefined
                  }
                  disabled={isDisabled}
                  searchable={selectOptions.length > 0}
                  readOnly={selectOptions.length === 0 && !!col.getOptions}
                  clearable
                  withScrollArea={true}
                  maxDropdownHeight={226}
                  scrollAreaProps={{ type: "auto", scrollbarSize: 8, }}
                />
              );
            }

            case "multi-select": {
              return (
                <MultiSelect
                  value={value as string[]}
                  onChange={handleChange}
                  data={col.options as string[]}
                  placeholder={col.placeholder || col.label}
                  error={
                    hasError && !isDisabled ? displayErrorMessage : undefined
                  }
                  disabled={isDisabled}
                  withScrollArea={true}
                  maxDropdownHeight={226}
                  scrollAreaProps={{ type: "auto", scrollbarSize: 8, }}
                />
              );
            }

            case "number":
              return (
                <TextInput
                  type="number"
                  value={
                    value !== null && value !== undefined ? String(value) : ""
                  }
                  onChange={(e) => {
                    let inputValue = e.target.value;

                    // Allow empty values
                    if (inputValue === "" || inputValue === "-") {
                      handleChange("");
                      return;
                    }

                    // Reject inputs containing exponent or plus signs (e, E, +)
                    if (/[eE+]/.test(inputValue)) return;

                    // Reject negative values
                    if (inputValue.startsWith("-")) {
                      return;
                    }

                    // Only allow digits and at most one decimal point
                    // Remove any characters other than digits and '.'
                    inputValue = inputValue.replace(/[^0-9.]/g, "");

                    // If more than one decimal point, reject
                    const dotCount = (inputValue.match(/\./g) || []).length;
                    if (dotCount > 1) return;

                    // Check decimal places if decimalScale is set
                    if (col.decimalPlaces) {
                      const parts = inputValue.split(".");
                      if (parts.length > 1) {
                        const decimalPlaces = parts[1].length;
                        if (decimalPlaces > 4) return; // Too many decimal places
                      }
                    }

                    // Count only digit characters for length enforcement
                    const digitsOnly = inputValue.replace(/\D/g, "");

                    // If integer digits are already at limit (15), disallow adding a trailing dot
                    const isTrailingDotWhenMaxDigits =
                      digitsOnly.length === 15 && inputValue.endsWith(".");

                    if (
                      digitsOnly.length <= 15 &&
                      !isTrailingDotWhenMaxDigits
                    ) {
                      const numValue =
                        inputValue === "" ? null : parseFloat(inputValue);
                      row._valuesCache[col.key] = numValue;
                      validateField(row.id, col.key, numValue);
                      onClearFieldError?.(col.key);
                      // Update the input field to display the validated value
                      handleChange(inputValue);
                    }
                    // If exceeds 15 digits, silently reject - don't update the input
                  }}
                  onKeyDown={(e) => {
                    // Prevent minus, exponent and plus characters from being entered
                    const blocked = ["-", "+", "e", "E"];
                    if (blocked.includes(e.key)) {
                      e.preventDefault();
                      return;
                    }

                    // Prevent typing a dot when integer digits are already at limit
                    if (e.key === ".") {
                      const current =
                        (e.target as HTMLInputElement).value || "";
                      const currentDigitsOnly = current.replace(/\D/g, "");
                      if (currentDigitsOnly.length >= 15) {
                        e.preventDefault();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    // Sanitize pasted content to prevent 'e', '+', or invalid formats
                    const paste = (
                      e.clipboardData || (window as any).clipboardData
                    ).getData("text");
                    if (!paste) return;

                    // If pasted content contains exponent or plus signs, prevent paste
                    if (/[eE+]/.test(paste)) {
                      e.preventDefault();
                      return;
                    }

                    // Remove any characters other than digits and '.'
                    const cleaned = paste.replace(/[^0-9.]/g, "");
                    const dotCount = (cleaned.match(/\./g) || []).length;
                    const digitsOnly = cleaned.replace(/\D/g, "");

                    // If multiple dots or too many digits, prevent and optionally set a trimmed value
                    // prevent a trailing dot when integer digits are already at 15
                    if (
                      dotCount > 1 ||
                      digitsOnly.length > 15 ||
                      (digitsOnly.length === 15 && cleaned.endsWith("."))
                    ) {
                      e.preventDefault();

                      // If the issue is too many digits, build a safe trimmed value: take first 15 digits and preserve one decimal if present
                      if (digitsOnly.length > 15) {
                        const intAndDec = cleaned.split(".");
                        const intPart = intAndDec[0]
                          .replace(/\D/g, "")
                          .slice(0, 15);
                        const decPart = intAndDec[1]
                          ? intAndDec[1].replace(/\D/g, "")
                          : "";
                        const final = decPart
                          ? `${intPart}.${decPart}`
                          : intPart;
                        const numValue =
                          final === "" ? null : parseFloat(final);
                        row._valuesCache[col.key] = numValue;
                        validateField(row.id, col.key, numValue);
                        onClearFieldError?.(col.key);
                      }
                      // If the issue is a trailing dot when digits are maxed, simply prevent paste and do not set value
                    }
                    // Otherwise allow paste to proceed (browser will insert cleaned value via onChange logic)
                  }}
                  onBlur={(e) => {
                    const blurValue = e.target.value;
                    if (blurValue !== "" && blurValue !== "-") {
                      // Format to 4 decimal places on blur for consistency
                      if (col.decimalPlaces) {
                        const formatted = formatNumberTo4Decimals(blurValue);
                        if (formatted !== String(value ?? "")) {
                          handleChange(formatted);
                        }
                      }
                    }
                  }}
                  placeholder={col.placeholder || col.label}
                  error={
                    hasError && !isDisabled ? displayErrorMessage : undefined
                  }
                  disabled={isDisabled}
                />
              );

            case "autocomplete": {
              let autoOptions: string[] = col.options || [];
              if (col.getOptions) {
                const rawOptions = col.getOptions(rowData) || [];
                autoOptions = rawOptions.map((opt: any) =>
                  typeof opt === "string" ? opt : opt.label
                );
              }

              return (
                <Autocomplete
                  value={String(value || "")}
                  onChange={handleChange}
                  data={autoOptions}
                  placeholder={col.placeholder || col.label}
                  error={
                    hasError && !isDisabled ? displayErrorMessage : undefined
                  }
                  disabled={isDisabled}
                  clearable
                />
              );
            }

            case "boolean": {
              // Disable checkbox if any row is being edited (including this one during save)
              const isAnyRowEditing = !!table.getState().editingRow;
              const checkboxDisabled = isDisabled || isAnyRowEditing;

              return (
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleChange(e.currentTarget.checked)}
                  label={col.label}
                  error={
                    hasError && !checkboxDisabled
                      ? displayErrorMessage
                      : undefined
                  }
                  disabled={checkboxDisabled}
                  color="#42AF8E"
                />
              );
            }

            case "date":
              return (
                <TextInput
                  type="date"
                  value={value as string}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={col.placeholder || col.label}
                  error={
                    hasError && !isDisabled ? displayErrorMessage : undefined
                  }
                  disabled={isDisabled}
                />
              );

            case "string":
            default: {
              const isExtendedTextField =
                col.key === "Name_of_Third_Party" ||
                col.key === "Location_of_Waste_Disposal";
              const charLimit = isExtendedTextField ? 300 : 100;
              return (
                <TextInput
                  value={value as string}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.length <= charLimit) {
                      handleChange(inputValue);
                    }
                  }}
                  onBlur={(e) => {
                    // Trim leading/trailing spaces when leaving the field
                    const trimmed = (e.target.value ?? "").toString().trim();
                    if (trimmed !== e.target.value) {
                      handleChange(trimmed);
                    }
                  }}
                  placeholder={col.label}
                  error={
                    hasError && !isDisabled ? displayErrorMessage : undefined
                  }
                  disabled={isDisabled}
                  maxLength={charLimit}
                />
              );
            }
          }
        },
      };

      return column;
    });
  }, [
    tableColumns,
    validationErrors,
    selectedYearPerRow,
    selectedFuelTypePerRow,
    baselineYear,
    financialYearMonth,
    validateField,
    onClearFieldError,
    clearApiValidationError,
    isValidating,
    getMonthOptions,
    getUomOptions,
    hasAIExtractedData,
    globalFilter,
    enableInlineEditForPrePopulated,
    alwaysLockedFields,
    prePopulatedLockedFields,
    disabledWhenPreFilledFields,
    renderInlineEditInput,
    getErrorMessage,
    getRowDataForCondition,
    addNewEntryLocationOptions,
    inlineEditedValues,
  ]);

  // Validate entire row based on input.constant rules
  const validateRowData = useCallback(
    (row: RowData, rowId: string): boolean => {
      const errorMessages: Record<string, string> = {};

      tableColumns.forEach((col) => {
        const value = row[col.key];

        // Check required fields.
        // Merge order: original data < standard edit cache < the row values passed
        // to this function (which already includes inline-edit values for prepopulate mode).
        const rowData = {
          ...data.find((r) => r.id === rowId),
          ...editingRowRef.current?._valuesCache,
          ...row,
        } as RowData;

        const isRequired = col.getIsRequired
          ? col.getIsRequired(rowData)
          : col.required;

        if (isRequired) {
          // Check for null, undefined, or empty string (0 is valid for numeric fields)
          if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
          ) {
            // Generate custom error messages based on field key or label
            const fieldLabel = col.label.toLowerCase();
            if (col.key === "year") {
              errorMessages[col.key] = "Please select a valid year";
            } else if (col.key === "location" || fieldLabel === "location") {
              errorMessages[col.key] = "Please select a valid location";
            } else if (col.key === "month" || fieldLabel.includes("month")) {
              errorMessages[col.key] = "Please select a valid month name";
            } else if (col.type === "single-select") {
              errorMessages[col.key] = `Please select a ${fieldLabel}`;
            } else {
              errorMessages[col.key] = `${col.label} is required`;
            }
          }
        }

        // Special validation for yearOfInstallation - must be exactly 4 digits
        if (
          !errorMessages[col.key] &&
          (col.key === "yearOfInstallation" ||
            col.label.includes("Year of Installation")) &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          const yearString = String(value).trim();
          const digitsOnly = yearString.replace(/[.-]/g, "");

          if (digitsOnly.length !== 4 || !/^\d{4}$/.test(digitsOnly)) {
            errorMessages[col.key] = "Please enter a valid 4-digit year";
          }
        }

        // Check digit length for number fields (max 15 digits - decimal point doesn't count)
        if (
          !errorMessages[col.key] &&
          col.type === "number" &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          const numString = String(value).trim();

          // Check for negative values
          if (numString.startsWith("-") || parseFloat(numString) < 0) {
            errorMessages[col.key] = "Negative values should not be accepted";
          }

          // Remove decimal point and minus sign - count only digits
          const digitsOnly = numString.replace(/[.-]/g, "");
          if (!errorMessages[col.key] && digitsOnly.length > 15) {
            errorMessages[col.key] = "Maximum 15 digits allowed";
          }
        }
      });

      const hasErrors = Object.keys(errorMessages).length > 0;

      if (hasErrors) {
        setValidationErrors((prev) => ({
          ...prev,
          [rowId]: errorMessages,
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[rowId];
          return newErrors;
        });
      }

      return !hasErrors;
    },
    [tableColumns, data]
  );

  // Handle cancel confirmation for creating/editing rows
  const handleCancelConfirmation = useCallback(
    (type: "creating" | "editing", row?: any, table?: any) => {
      setPendingCancelAction({ type, row, table });
      Promise.resolve().then(() =>
        postParentMessage(manualEntryConfirmCancel())
      );
    },
    []
  );

  // Helper to sanitize/trims string fields before validation/save
  const sanitizeStringFields = useCallback(
    (obj: RowData) => {
      const copy: RowData = { ...obj };
      tableColumns.forEach((col) => {
        if (col.type === "string") {
          const v = copy[col.key];
          if (v !== null && v !== undefined && typeof v === "string") {
            copy[col.key] = v.trim();
          }
        }
      });
      return copy;
    },
    [tableColumns]
  );

  // Helper function to highlight matching search text
  const handleCreateRow: MRT_TableOptions<RowData>["onCreatingRowSave"] =
    useCallback(
      async ({
        values,
        table,
        row,
      }: Parameters<
        NonNullable<MRT_TableOptions<RowData>["onCreatingRowSave"]>
      >[0]) => {
        const rowId = row.id;
        // Trim leading/trailing spaces for free-text fields before validation/save
        const sanitizedValues = sanitizeStringFields(values);
        const isValid = validateRowData(sanitizedValues, rowId);

        if (!isValid) {
          return; // Don't save if validation fails
        }

        // Use the correct data source based on mode
        const currentData = manualPagination ? initialData : data;
        const newData = [...currentData, sanitizedValues];
        if (!manualPagination) {
          setData(newData);
        }

        // Track which row is being saved so fieldErrors map to the correct row
        setCurrentSavingRowId(rowId);
        prevFieldErrorsRef.current = {};

        // Call onDataChange and wait for result
        const success = await onDataChange?.({ newData: newData });

        // Only clear creating row on success
        if (success) {
          setCurrentSavingRowId(null);
          table.setCreatingRow(null);
          // Standard mode: row moves to top after refetch (sorted by updated_at desc).
          // Store identity so useEffect([initialData]) finds the new position.
          pendingHighlightRef.current = {
            type: "by-identity",
            location: sanitizedValues.location,
            year: sanitizedValues.year,
            month: sanitizedValues.month,
          };
        }
      },
      [
        data,
        initialData,
        manualPagination,
        onDataChange,
        validateRowData,
        sanitizeStringFields,
        addRecentEditHighlight,
      ]
    );

  // Handle editing row
  const handleEditRow: MRT_TableOptions<RowData>["onEditingRowSave"] =
    useCallback(
      async ({
        values,
        table,
        row,
      }: Parameters<
        NonNullable<MRT_TableOptions<RowData>["onEditingRowSave"]>
      >[0]) => {
        const rowId = row.id;
        // Trim leading/trailing spaces for free-text fields before validation/save
        const sanitizedValues = sanitizeStringFields(values);
        // Ensure any pre-populated locked fields are preserved in the payload
        // (those columns don't render editable inputs in the UI)
        const originalRow: any = row.original as any;
        if (prePopulatedLockedFields?.length && originalRow?._isPrePopulated) {
          prePopulatedLockedFields.forEach((key) => {
            if (originalRow?.[key] !== undefined) {
              (sanitizedValues as any)[key] = originalRow[key];
            }
          });
        }
        const isValid = validateRowData(sanitizedValues, rowId);

        if (!isValid) {
          return; // Don't save if local validation fails
        }

        // Track which row is being saved so fieldErrors map to the correct row
        setCurrentSavingRowId(rowId);
        prevFieldErrorsRef.current = {};

        // Call onDataChange and wait for the API result.
        const success = await onDataChange?.({
          updatedValues: sanitizedValues,
          originalData: row.original,
        });

        // If the save was successful, exit editing mode.
        // If it failed, the table remains in editing mode with the invalid values,
        // allowing the user to see the errors from the parent component.
        if (success) {
          setCurrentSavingRowId(null);
          table.setEditingRow(null);
          // Standard mode: row moves to top after refetch (sorted by updated_at desc).
          // Store identity (sanitizedValues includes locked fields) so
          // useEffect([initialData]) finds the new position.
          pendingHighlightRef.current = {
            type: "by-identity",
            location: sanitizedValues.location,
            year: sanitizedValues.year,
            month: sanitizedValues.month,
          };
        }
      },
      [
        data,
        onDataChange,
        validateRowData,
        sanitizeStringFields,
        prePopulatedLockedFields,
        addRecentEditHighlight,
      ]
    );

  // State to track saving status for individual pre-populated rows
  const [savingRowIds, setSavingRowIds] = useState<Set<string>>(new Set());

  // Handle saving inline-edited pre-populated row
  const handleSaveInlineRow = useCallback(
    async (row: any) => {
      const rowId = row.id;
      const originalRow = row.original as any;

      // Collect values from the row, including inline edited values from state
      const values: Record<string, any> = { ...originalRow };

      // Apply inline edited values from state
      const rowInlineEdits = inlineEditedValues[rowId];
      if (rowInlineEdits) {
        Object.assign(values, rowInlineEdits);
      }

      // Trim leading/trailing spaces for free-text fields before validation/save
      const sanitizedValues = sanitizeStringFields(values);

      // Ensure pre-populated locked fields are preserved
      if (prePopulatedLockedFields?.length && originalRow?._isPrePopulated) {
        prePopulatedLockedFields.forEach((key) => {
          if (originalRow?.[key] !== undefined) {
            sanitizedValues[key] = originalRow[key];
          }
        });
      }

      // Validate the row
      const isValid = validateRowData(sanitizedValues, rowId);
      if (!isValid) {
        return; // Don't save if local validation fails
      }

      // Set saving state for this row
      setSavingRowIds((prev) => new Set(prev).add(rowId));

      // Track which row is being saved so fieldErrors map to the correct row
      setCurrentSavingRowId(rowId);
      prevFieldErrorsRef.current = {};

      try {
        // Call onDataChange and wait for the API result
        const success = await onDataChange?.({
          updatedValues: sanitizedValues,
          originalData: originalRow,
        });

        if (success) {
          setCurrentSavingRowId(null);
          // In prepopulate mode, clear all unsaved inline drafts after a successful save
          // so partially-entered rows don't keep stale values and enabled actions.
          setInlineEditedValues({});
          setValidationErrors({});
          setSelectedFuelTypePerRow({});
          setSelectedYearPerRow({});
          // Prepopulate mode: rows stay at the same position after refetch
          // (sorted by year/month/location, not updated_at). Highlight the row
          // directly — recentlyEditedRowIds is NOT cleared by the initialData
          // useEffect, so the highlight survives the parent refetch.
          addRecentEditHighlight(rowId);
        }
      } finally {
        // Clear saving state
        setSavingRowIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(rowId);
          return newSet;
        });
      }
    },
    [
      data,
      onDataChange,
      validateRowData,
      sanitizeStringFields,
      prePopulatedLockedFields,
      inlineEditedValues,
      addRecentEditHighlight,
    ]
  );

  // Handle cancel/discard inline edits for a row (pre-populated mode)
  const handleCancelInlineEdit = useCallback((row: any) => {
    // Use the same confirmation flow as regular cancel
    // But mark it as inline cancel so we know what to do after confirmation
    setPendingCancelAction({
      type: "inline-editing",
      row,
      table: null,
    });
    Promise.resolve().then(() => postParentMessage(manualEntryConfirmCancel()));
  }, []);

  // Mantine React Table configuration
  const table = useMantineReactTable({
    icons: faIcons,
    columns,
    data: manualPagination ? initialData : data, // Use initialData directly for server-side mode
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: true,
    // enableFilterMatchHighlighting: false,
    enableHiding: false,
    enableTopToolbar: true,
    enablePagination: true,
    // sortDescFirst: false, // First click sorts ascending for all columns
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableEditing: true,
    onEditingRowChange: (updater) => {
      setEditingRow((prev: any) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        editingRowRef.current = next;
        return next;
      });
    },
    onCreatingRowChange: (updater) => {
      setCreatingRow((prev: any) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        editingRowRef.current = next;
        return next;
      });
    },
    getRowId: (row, index) => {
      if (row.id) return String(row.id);
      const composite = [row.location, row.year, row.month, row.typeOfFuelUsed ?? row.typeOfFuelPurchased ?? row.typeOfTechnology]
        .filter(Boolean)
        .join("|");
      return composite || `row-${index}`;
    },
    paginationDisplayMode: "pages",
    localization: {
      rowsPerPage: "Items per page",
      noRecordsToDisplay: "No data available",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search...",
      className: isFocused
        ? "search-custmize-focused search-custmize-div"
        : "search-custmize-div",
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      // className: classes.searchInputClass,
      styles: {
        wrapper: { width: 251 },
        input: {
          border: isFocused ? "1px solid #005C81" : "",
          color: "#666" + "!important",
          opacity: 1,
          // marginLeft: "5px",
          borderRadius: 20,
          paddingLeft: 40,
          "&::placeholder": {
            color: "#223354" + "!important",
          },
        },
      },
      leftSection: <SearchIcon color={isFocused ? "#005C81" : "#666666"} />,
    },
    enableStickyHeader: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    enableRowNumbers: true,
    enableRowSelection: !isOrganizationAdmin && !hideCheckboxes
      ? (row) => {
        const hasAI = hasAIExtractedData ? hasAIExtractedData(row.original) : false;
        return !hasAI && (row.original as any)?.status !== GRID_POWER_STATUS.APPROVED;
      }
      : false,
    enablePinning: true,
    // Custom select all handler to exclude AI-extracted rows
    enableSelectAll: false, // Disable default select all
    // Server-side configuration
    rowCount: manualPagination ? rowCount : undefined,
    manualPagination,
    manualSorting,
    manualFiltering,
    mantineTableBodyRowProps: ({ row }) => {
      const hasAI = hasAIExtractedData && hasAIExtractedData(row.original);
      const isRecentlyEdited = recentlyEditedRowIds.has(row.id);
      return {
        style: {
          opacity: isValidating ? 0.5 : 1,
          pointerEvents: isValidating ? "none" : "auto",
          backgroundColor: isRecentlyEdited
            ? "rgba(255, 193, 7, 0.3)" // Highlight yellow for recently edited
            : undefined,
          transition: "background-color 0.5s ease-out",
          ...(hasAI &&
            !isRecentlyEdited && {
            background:
              "linear-gradient(94.76deg, rgba(249, 218, 255, 0.5) 0.57%, rgba(218, 241, 255, 0.5) 95%)",
          }),
        },
        className: hasAI ? "ai-extracted-row" : "",
      };
    },
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    state: {
      ...externalState,
      columnOrder,
      editingRow,
      creatingRow,
      rowSelection,
    },
    onColumnOrderChange: setColumnOrder,
    displayColumnDefOptions: {
      "mrt-row-select": {
        mantineTableHeadCellProps: ({ table }) => ({
          style: {
            display:
              isOrganizationAdmin || hideCheckboxes ? "none" : "table-cell",
            zIndex: 2,
            pointerEvents:
              !!table.getState().editingRow || !!table.getState().creatingRow
                ? "none"
                : "auto",
          },
        }),
        Header: ({ table }) => {
          const allNonAIRows = table
            .getRowModel()
            .rows.filter((row) => row.getCanSelect());
          const selectedNonAIRows = allNonAIRows.filter(
            (row) => table.getState().rowSelection[row.id]
          );
          const isAllNonAISelected =
            allNonAIRows.length > 0 &&
            selectedNonAIRows.length === allNonAIRows.length;
          const isSomeNonAISelected =
            selectedNonAIRows.length > 0 && !isAllNonAISelected;

          return (
            <Checkbox
              checked={isAllNonAISelected}
              indeterminate={isSomeNonAISelected}
              onChange={(e) => {
                if (isAllNonAISelected) {
                  table.resetRowSelection();
                } else {
                  // Select only non-AI rows
                  const newSelection: Record<string, boolean> = {};
                  allNonAIRows.forEach((row) => {
                    newSelection[row.id] = true;
                  });
                  table.setRowSelection(newSelection);
                }
              }}
              color="#42AF8E"
              disabled={
                disableSelectAll ||
                !!table.getState().editingRow ||
                !!table.getState().creatingRow
              }
            />
          );
        },
        Cell: ({ row, table }) => {
          // Disable checkbox for AI-extracted rows or approved rows
          const hasAI = hasAIExtractedData && hasAIExtractedData(row.original);
          const isApproved = row.original?.status === GRID_POWER_STATUS.APPROVED;
          const isDisabled =
            hasAI ||
            isApproved ||
            !!table.getState().editingRow ||
            !!table.getState().creatingRow;

          const cursor = isApproved ? "default" : isDisabled ? "not-allowed" : "pointer";
          const checkbox = (
            <Checkbox
              checked={!!table.getState().rowSelection[row.id]}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  // Add to selection
                  table.setRowSelection({
                    ...table.getState().rowSelection,
                    [row.id]: true,
                  });
                } else {
                  // Remove from selection
                  const newSelection = { ...table.getState().rowSelection };
                  delete newSelection[row.id];
                  table.setRowSelection(newSelection);
                }
              }}
              color="#42AF8E"
              disabled={isDisabled}
              styles={{
                body: { cursor },
                input: { cursor },
              }}
            />
          );

          // Show tooltip for approved rows
          if (isApproved) {
            return (
              <Tooltip label="Approved data cannot be deleted" color="gray">
                {checkbox}
              </Tooltip>
            );
          }

          // Show tooltip for AI-extracted rows
          if (hasAI) {
            return (
              <Tooltip label="AI-uploaded data cannot be deleted" color="gray">
                {checkbox}
              </Tooltip>
            );
          }

          return checkbox;
        },
        mantineTableBodyCellProps: ({ table }) => {
          return {
            style: {
              display: isOrganizationAdmin ? "none" : "table-cell",
              opacity: !!table.getState().editingRow ? 0.5 : 1,
              pointerEvents: "auto",
            },
          };
        },
      },
      "mrt-row-numbers": { Header: "SN" },
      "mrt-row-actions": {
        size: 100,
        mantineTableHeadCellProps: {
          style: {
            position: "sticky",
            right: 0,
            backgroundColor: "#0B5D76",
            // zIndex: 1,
            zIndex: 3,
          },
        },
        mantineTableBodyCellProps: {
          style: {
            position: "sticky",
            right: 0,
            backgroundColor: "white",
            zIndex: 3,
            boxShadow: "-2px 0 5px -2px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    columnFilterDisplayMode: "popover",
    mantineTableContainerProps: {
      style: {
        borderRadius: "10px",
        boxShadow:
          "rgba(159, 162, 191, 0.18) 0px 9px 16px, rgba(159, 162, 191, 0.32) 0px 2px 2px",
        padding:0,
        marginLeft: 30,
        marginRight: 30,
      },
    },
    renderEmptyRowsFallback: () => (
      <Flex justify="center" align="center" py="2rem" w="100%">
        <Text fz={16} c="#868e96" fs="italic">
          No data available
        </Text>
      </Flex>
    ),
    onCreatingRowCancel: () => {
      // Don't cancel - wait for popup confirmation
      // This handler is overridden to do nothing
    },
    onCreatingRowSave: handleCreateRow,
    onEditingRowCancel: () => {
      // Don't cancel - wait for popup confirmation
      // This handler is overridden to do nothing
    },
    onEditingRowSave: handleEditRow,
    renderRowActions: ({ row, table }) => {
      const isCreatingRow = !!table.getState().creatingRow;
      const rowData = row.original;
      const updatedByUserName = rowData?.updatedByUserName || "N/A";
      const updatedAt = rowData?.updatedAt || rowData?.updated_at;
      const isPrePopulatedRow = !!(rowData as any)?._isPrePopulated;
      const isSavingThisRow = savingRowIds.has(row.id);

      // Format the date if available
      let formattedDate = "N/A";
      if (updatedAt) {
        try {
          const date = new Date(updatedAt);
          formattedDate = date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } catch {
          formattedDate = "N/A";
        }
      }

      const tooltipLabel = (
        <Box>
          <Text size="sm" c="white">
            Last Updated: {formattedDate}
          </Text>
          <Text size="sm" c="white">
            Updated By: {updatedByUserName}
          </Text>
        </Box>
      );

      const isApprovedRow = rowData?.status === GRID_POWER_STATUS.APPROVED;

      // Hide edit action and info icon for organization admins (read-only mode)
      if (isOrganizationAdmin) {
        return (
          <Flex gap={8} align="center">
            {isApprovedRow && (
              <Tooltip label="This is approved data" variant="transparent">
                <ActionIcon variant="transparent" style={{ cursor: "default" }}>
                  <IconCheck size={24} color="#00a63e" stroke={3.5} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label={tooltipLabel} multiline w={280}>
              <ActionIcon variant="subtle" color="gray">
                <IconAlertCircle size={28} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        );
      }

      // When inline editing is enabled, show Save button for all rows (both pre-populated and existing data)
      if (enableInlineEditForPrePopulated) {
        // Check if this row has any inline edits
        const rowInlineEdits = inlineEditedValues[row.id];
        let hasModifications = false;
        if (rowInlineEdits) {
          hasModifications = Object.keys(rowInlineEdits).some((key) => {
            const originalVal = row.original[key];
            const editedVal = rowInlineEdits[key];

            // Handle numeric comparisons (e.g., "0" vs 0, "5.0000" vs 5)
            const isNumeric =
              !isNaN(Number(originalVal)) &&
              !isNaN(Number(editedVal)) &&
              originalVal !== "" &&
              editedVal !== "" &&
              originalVal !== null &&
              editedVal !== null;
            if (isNumeric) {
              return Number(originalVal) !== Number(editedVal);
            }

            const origStr =
              originalVal === null || originalVal === undefined
                ? ""
                : String(originalVal);
            const editedStr =
              editedVal === null || editedVal === undefined
                ? ""
                : String(editedVal);
            return origStr !== editedStr;
          });
        }
        const isButtonsDisabled = isSavingThisRow || !hasModifications;
        // Row-level error (e.g. "Data has already been approved") routed through
        // fieldErrors._rowError so it shows inline here instead of a top banner.
        const rowError = validationErrors[row.id]?._rowError as string | undefined;

        return (
          <Flex direction="column" gap={4} align="flex-start">
            <Flex gap={8} align="center">
              {isApprovedRow ? (
                <Tooltip label="This is approved data" variant="transparent">
                  <ActionIcon variant="transparent" style={{ cursor: "default" }}>
                    <IconCheck size={24} color="#00a63e" stroke={3.5} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <>
                  <Tooltip
                    label={hasModifications ? "Save" : "Edit fields to enable save"}
                  >
                    <ActionIcon
                      onClick={() => !isButtonsDisabled && handleSaveInlineRow(row)}
                      color={isButtonsDisabled ? "gray" : "blue"}
                      variant="subtle"
                      style={{
                        opacity: isButtonsDisabled ? 0.4 : 1,
                        cursor: isButtonsDisabled ? "default" : "pointer",
                      }}
                    >
                      {isSavingThisRow ? (
                        <Loader size={18} />
                      ) : (
                        <IconDeviceFloppy size={22} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    label={hasModifications ? "Cancel" : "Edit fields to enable cancel"}
                  >
                    <ActionIcon
                      onClick={() => !isButtonsDisabled && handleCancelInlineEdit(row)}
                      color={isButtonsDisabled ? "gray" : "red"}
                      variant="subtle"
                      style={{
                        opacity: isButtonsDisabled ? 0.4 : 1,
                        cursor: isButtonsDisabled ? "default" : "pointer",
                      }}
                    >
                      <IconCircleX size={22} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
              <Tooltip label={tooltipLabel} multiline w={280}>
                <ActionIcon variant="subtle" color="gray">
                  <IconAlertCircle size={28} />
                </ActionIcon>
              </Tooltip>
            </Flex>
            {rowError && (
              <Text fz={11} c="red" maw={220} style={{ lineHeight: 1.3, wordBreak: "break-word" }}>
                {rowError}
              </Text>
            )}
          </Flex>
        );
      }

      const isAnyRowEditing = !!table.getState().editingRow;
      const isCurrentRowEditing = table.getState().editingRow?.id === row.id;
      const isEditDisabled =
        isApprovedRow || isCreatingRow || (isAnyRowEditing && !isCurrentRowEditing);
      // Row-level error (e.g. "Data has already been approved") routed through
      // fieldErrors._rowError so it shows inline here instead of a top banner.
      const rowError = validationErrors[row.id]?._rowError as string | undefined;

      return (
        <Flex direction="column" gap={4} align="flex-start">
          <Flex gap={8} align="center">
            <Tooltip
              label={
                isApprovedRow
                  ? "This is approved data"
                  : isCreatingRow
                    ? "Please save or cancel the unsaved New Entry"
                    : isAnyRowEditing && !isCurrentRowEditing
                      ? "Please save or cancel the row being edited"
                      : "Edit"
              }
              variant="transparent"
            >
              <Box component="span" style={{ display: "inline-flex" }}>
                {isApprovedRow ? (
                  <ActionIcon variant="transparent" disabled={false} style={{ cursor: "default" }}>
                    <IconCheck size={24} color="#00a63e" stroke={3.5} />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    onClick={() => {
                      table.setEditingRow(row);
                      table.resetRowSelection();
                    }}
                    disabled={isCreatingRow || (isAnyRowEditing && !isCurrentRowEditing)}
                  >
                    {isCreatingRow || (isAnyRowEditing && !isCurrentRowEditing) ? (
                      <EditIconDisabled />
                    ) : (
                      <EditIcon />
                    )}
                  </ActionIcon>
                )}
              </Box>
            </Tooltip>
            <Tooltip label={tooltipLabel} multiline w={280}>
              <ActionIcon variant="subtle" color="gray">
                <IconAlertCircle size={28} />
              </ActionIcon>
            </Tooltip>
          </Flex>
          {rowError && (
            <Text fz={11} c="red" maw={220} style={{ lineHeight: 1.3, wordBreak: "break-word" }}>
              {rowError}
            </Text>
          )}
        </Flex>
      );
    },
    renderBottomToolbar: ({ table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      // For server-side pagination, use rowCount prop; for client-side, use pre-pagination row count
      const totalRows = manualPagination
        ? rowCount
        : table.getPrePaginationRowModel().rows.length;
      const currentPageRows = table.getRowModel().rows.length;
      const startIndex = currentPageRows > 0 ? pageIndex * pageSize + 1 : 0;
      const endIndex = pageIndex * pageSize + currentPageRows;
      return (
        <Box mx="30px">
          <Flex justify="space-between" align="center">
            <MRT_TablePagination table={table} />
            <Text styles={{ root: { whiteSpace: "nowrap", marginTop: 10 } }}>
              {startIndex}-{endIndex} of {totalRows}
            </Text>
          </Flex>
        </Box>
      );
    },
    renderTopToolbar: ({ table }) => {
      const isCreatingRow = !!table.getState().creatingRow;
      const isEditingRow = !!table.getState().editingRow;
      const isAddButtonDisabled =
        isCreatingRow ||
        isEditingRow ||
        isOrganizationAdmin ||
        disableAddButton;
      const selectedRows = table.getState().rowSelection;
      const selectedRowCount = Object.keys(selectedRows).length;

      const handleDelete = async () => {
        const selectedIndices = table
          .getSelectedRowModel()
          .rows.map((row) => row.index);

        if (onDeleteRows) {
          await onDeleteRows(selectedIndices);
        }
      };

      return (
        <Flex direction="column" mb={15} mx="30px">
          <Flex
            justify="space-between"
            align="end"
            w="100%"
            gap={24}
            wrap="wrap"
          >
            <Stack gap={showUploadTypeTabs ? 4 : 0}>
              {showUploadTypeTabs && (
                <>
                  <Stack gap={showUploadTypeTabs || customTabs ? 4 : 0}>
                    {customTabs ? (
                      <Flex gap={24}>
                        {customTabs.map((tab) => {
                          const shouldShow =
                            tab.count !== 0 || globalFilter.trim() === "";
                          if (!shouldShow) return null;
                          return (
                            <Button
                              key={tab.value}
                              onClick={() => onCustomTabChange?.(tab.value)}
                              variant="transparent"
                              p={0}
                              fw={500}
                              lh="24px"
                              fz={16}
                              tt="capitalize"
                              c={
                                activeCustomTab === tab.value
                                  ? "#FFA93C"
                                  : "#444444"
                              }
                            >
                              {tab.label}{" "}
                              {tab.count !== undefined && `(${tab.count})`}
                            </Button>
                          );
                        })}
                      </Flex>
                    ) : (
                      showUploadTypeTabs && (
                        <Flex gap={24}>
                          {[
                            {
                              type: UPLOAD_TYPES.ALL,
                              label: "All",
                              countKey: "All" as const,
                            },
                            {
                              type: UPLOAD_TYPES.AI_UPLOADED,
                              label: "AI Uploaded",
                              countKey: "AI Uploaded" as const,
                            },
                            {
                              type: UPLOAD_TYPES.MANUAL_ENTRY,
                              label: "Manual Entry",
                              countKey: "Manual Entry" as const,
                            },
                          ].map(({ type, label, countKey }) => {
                            const count = uploadTypeCounts?.[countKey];
                            const shouldShow =
                              count !== 0 || globalFilter.trim() === "";

                            if (!shouldShow) return null;

                            return (
                              <Button
                                key={type}
                                onClick={() => onUploadTypeChange?.(type)}
                                variant="transparent"
                                p={0}
                                fw={500}
                                lh="24px"
                                fz={16}
                                c={uploadType === type ? "#FFA93C" : "#444444"}
                              >
                                {label} {count !== undefined && `(${count})`}
                              </Button>
                            );
                          })}
                        </Flex>
                      )
                    )}
                  </Stack>
                </>
              )}
            </Stack>
            <Flex direction="column" align="flex-end" gap={6}>
              {!hideMandatoryText && (
                <Text fs="italic" c="#000000" fz={12} fw={400} lh="24px">
                  All fields marked with an asterisk (<span style={{ color: "red" }}>*</span>) are mandatory.
                </Text>
              )}
              <Flex gap={14}>
                <MRT_GlobalFilterTextInput table={table} />
                {!isOrganizationAdmin && !hideAddButton && (
                  <Button
                    onClick={() => table.setCreatingRow(true)}
                    variant="unstyled"
                    fw={600}
                    fz={12}
                    h={36}
                    lts="0.15rem"
                    p="0 20px"
                    radius="xl"
                    className="noAnimationButton filledGradientButton"
                    disabled={isAddButtonDisabled}
                  >
                    ADD NEW ENTRY
                  </Button>
                )}
                {!isOrganizationAdmin && !hideDeleteButton && (
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    color="#003B52"
                    fw={600}
                    fz={12}
                    h={36}
                    lts="0.15rem"
                    radius="xl"
                    disabled={selectedRowCount === 0}
                    className="noAnimationButton outlineButtonHover"
                    style={{
                      borderColor: `${selectedRowCount === 0 ? "#C2D0D7" : "#0B5D76"}`,
                    }}
                  >
                    DELETE {selectedRowCount > 0 && `(${selectedRowCount})`}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      );
    },
  });

  // Expose internal table instance to parent if provided
  useEffect(() => {
    if (typeof onTableInstanceReady === "function") {
      try {
        onTableInstanceReady(table);
      } catch (err) {
        console.warn("onTableInstanceReady callback failed:", err);
      }
    }
    // call only after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel creating/editing row, clear inline edit state, and reset row selection when pagination changes
  useEffect(() => {
    const creatingRow = table.getState().creatingRow;
    const editingRow = table.getState().editingRow;

    if (creatingRow || editingRow) {
      table.setCreatingRow(null);
      table.setEditingRow(null);
    }

    // Always clear all inline edit state on page navigation so stale edits
    // from one page don't bleed into the same positional row IDs on another page
    setInlineEditedValues({});
    setValidationErrors({});
    setSelectedFuelTypePerRow({});
    setSelectedYearPerRow({});
    setCurrentSavingRowId(null);

    // Reset row selection so selections from a previous page don't carry over
    table.resetRowSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    externalState?.pagination?.pageIndex,
    externalState?.pagination?.pageSize,
  ]);

  // Intercept cancel button clicks
  useEffect(() => {
    const handleClick = (e: Event) => {
      const button = (e.target as HTMLElement).closest("button");
      if (!button) return;

      // Check for cancel button by aria-label, title, or text content
      const isCancelBtn =
        button.getAttribute("aria-label")?.toLowerCase().includes("cancel") ||
        button.getAttribute("title")?.toLowerCase().includes("cancel") ||
        button.textContent?.toLowerCase().includes("cancel");

      if (
        !isCancelBtn ||
        (!table.getState().editingRow && !table.getState().creatingRow)
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      handleCancelConfirmation(
        table.getState().creatingRow ? "creating" : "editing",
        table.getState().editingRow,
        table
      );
    };

    // Capture phase to intercept before MRT's handlers
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [table, handleCancelConfirmation]);

  // Theme for MRT
  const theme = useMemo(
    () =>
      createTheme({
        components: {
          Text: {
            styles: {
              root: {
                fontSize: "12px",
                fontWeight: 400,
                color: "#444444",
              },
            },
          },
          Table: {
            styles: {
              tbody: {
                borderBottomLeftRadius: "10px",
                borderBottomRightRadius: "10px",
                tr: {
                  "&:hover": {
                    backgroundColor: "#f1f3f6 !important",
                  },
                },
              },
              th: {
                maxHeight: 43,
                fontWeight: "bold",
                padding: "0 10px",
                background: "#003b52",
                color: "#fff",
                fontSize: 12,
                verticalAlign: "middle",
                textTransform: "capitalize",
              },
              td: {
                color: "#444444",
                fontWeight: 400,
                height: 43,
              },
            },
          },
          Popover: {
            styles: {
              dropdown: {
                zIndex: 9999,
              },
            },
          },
          TextInput: {
            styles: {
              wrapper: {
                width: "auto",
              },
              error: {
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
              },
            },
          },
          Tooltip: {
            defaultProps: {
              position: "bottom",
            },
          },
          Select: {
            styles: {
              error: {
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
              },
            },
          },
          NumberInput: {
            styles: {
              error: {
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
              },
            },
          },
          MultiSelect: {
            styles: {
              error: {
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
              },
            },
          },
          Checkbox: {
            defaultProps: {
              color: "#42AF8E",
            },
            styles: {
              input: {
                accentColor: "#42AF8E",
                cursor: "pointer",
                "&:checked": {
                  backgroundColor: "#42AF8E",
                  borderColor: "#42AF8E",
                },
                "&:checked:hover": {
                  backgroundColor: "#42AF8E",
                  borderColor: "#42AF8E",
                },
              },
            },
          },
          ActionIcon: {
            styles: {
              root: {
                color: "#003b52",
                backgroundColor: "transparent",
                "&[data-disabled]": {
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                },
              },
            },
          },
        },
      }),
    []
  );

  return (
    <Box style={{ position: "relative" }} className="themeTable">
      {isValidating && (
        <Flex
          align="center"
          justify="center"
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 255, 255, 0.7)"
          style={{
            zIndex: 1000,
            borderRadius: "10px",
          }}
        >
          <Flex direction="column" align="center" gap="md">
            <Loader size="lg" />
          </Flex>
        </Flex>
      )}
      <Box mih="480px">
        <MantineProvider theme={theme}>
          <MantineReactTable table={table} />
        </MantineProvider>
      </Box>
    </Box>
  );
};

export default ManualEntryTable;
