"use client";
import { Box, Text } from "@mantine/core";
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ManualEntryTable from "~/features/manual-data-entry/Common/ManualEntryTable";
import { apiClientWithAuth } from "~/lib/fetcher";
import {
  confirmDeleteFormEntry,
  energyCaptivePowerFormUpdated,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "~/utils/const";
import {
  getUserRoleFromToken,
  ROLE_ORGANIZATION_ADMIN,
} from "~/utils/jwt/getUserDataFromToken";
import {
  getMonthOptionsForYear,
  useDeleteMessageHandler,
  useEnergyCaptivePowerRenewableFormMode,
  usePrePopulatedRenewableData,
} from "./hooks";

type RowData = Record<string, string | number | null | undefined | any>;

interface CaptivePowerRenewableListingProps {
  onDataLoaded?: (hasData: boolean) => void;
}

const CaptivePowerRenewableListing = ({ onDataLoaded }: CaptivePowerRenewableListingProps = {}) => {
  const params = useParams();
  const organizationId = params?.organizationId as string;

  // Get user role from token to check if organization admin
  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isOrganizationAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  // Dynamically determine form mode based on organization activity master entry
  const { formMode: rawFormMode, loading: formModeLoading } =
    useEnergyCaptivePowerRenewableFormMode();

  // Admin users always use standard mode (readonly, no prepopulated skeleton rows)
  const FORM_MODE = isOrganizationAdmin ? FORM_MODE_STANDARD : rawFormMode;

  const accessToken = params?.accessToken || "";
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  // Replace uploadType with custom activeTab to support "Pending Data"
  const [activeTab, setActiveTab] = useState<string>("all");

  // ========================================================================
  // Server-side data fetching with pre-population
  // ========================================================================
  const {
    data: mergedData,
    loading,
    totalCount,
    locationOptions,
    addNewEntryLocationOptions,
    technologyOptions,
    addNewEntryTechnologyOptions,
    baselineYear,
    financialYearMonth,
    counts: tabCounts,
    refetch,
    shouldDisableAddNewEntry,
    prepopulateMode,
  } = usePrePopulatedRenewableData({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    pagination,
    sorting,
    globalFilter,
    uploadType: activeTab,
    activity: "energy",
    formMode: FORM_MODE,
    skip: formModeLoading, // Skip data fetching while form mode is loading
  });

  // Handle message events for delete operations
  // Notify parent when data load status is determined
  useEffect(() => {
    if (!loading && !formModeLoading) {
      onDataLoaded?.(tabCounts.allCount - tabCounts.pendingCount > 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formModeLoading, tabCounts.allCount, tabCounts.pendingCount]);

  const tableRef = useRef<any>(null);

  const handleRefetchCompleted = useCallback(() => {
    try {
      const tbl = tableRef.current;
      if (!tbl) return;

      if (typeof tbl.resetRowSelection === "function") {
        tbl.resetRowSelection();
        return;
      }
    } catch (err) {
      console.warn("resetRowSelection failed:", err);
    }
  }, []);

  const handleTableInstanceReady = useCallback((table: any) => {
    tableRef.current = table;
  }, []);

  // Enable delete functionality
  useDeleteMessageHandler({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    refetch,
    onError: setError,
    onSavingChange: setIsSaving,
    onRefetchCompleted: handleRefetchCompleted,
  });

  // Handle global filter change - reset pagination to page 1
  const handleGlobalFilterChange = (
    value: string | ((old: string) => string)
  ) => {
    const newFilter = typeof value === "function" ? value(globalFilter) : value;
    setGlobalFilter(newFilter);
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  const clearFieldError = (fieldKey: string) => {
    setFieldErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldKey];
      delete updated[fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)];
      return updated;
    });
  };

  const handleDataChange = async (payload: {
    updatedValues?: RowData;
    originalData?: RowData;
    newData?: RowData[];
  }): Promise<boolean> => {
    const { updatedValues, originalData, newData } = payload;

    try {
      setError(null);
      // Don't clear fieldErrors - preserve errors from other rows
      // ManualEntryTable's internal logic will handle row-specific error mapping
      setIsSaving(true);

      // Prefer the stable backend id already on the row; only fall back to a
      // label lookup for brand-new rows that don't yet carry an address id.
      const organizationAddressId: string | undefined =
        (updatedValues?.organizationAddressId as string | undefined) ||
        (originalData?.organizationAddressId as string | undefined) ||
        (() => {
          // Use the last element — ManualEntryTable always appends new rows at the end.
          // find((m) => !m.id) is wrong in prepopulate mode because skeleton rows also
          // lack an id, causing the wrong (first skeleton) row to be picked.
          const newRow = newData?.[newData.length - 1];
          if (!newRow) return undefined;
          if (newRow.organizationAddressId)
            return newRow.organizationAddressId as string;
          const locationName = newRow.location as string | undefined;
          // locationName may be the display label ("beta05") or the raw UUID value,
          // depending on whether the row was pre-populated (label) or just added via
          // the "Add New Entry" Select which stores the option value (UUID). Match both.
          return locationOptions.find(
            (option: { label: string; value: string }) =>
              option.label === locationName || option.value === locationName
          )?.value;
        })();

      if (!organizationAddressId) {
        setError("Location not found");
        return false;
      }

      let rowToSave: RowData | null = null;
      let originalRowDataForAPI: RowData | null = null;

      if (newData) {
        // Create new entry
        rowToSave = newData[newData.length - 1] || null;
      } else if (updatedValues && originalData) {
        // Update existing entry
        rowToSave = updatedValues;
        // Only set originalRowDataForAPI if this is an actual update (has real ID, not pre-populated)
        const isPrePopulatedRow =
          (originalData as any)?._isPrePopulated === true;
        if (!isPrePopulatedRow && originalData.id) {
          originalRowDataForAPI = originalData;
        }
      }

      if (rowToSave) {
        const response = await apiClientWithAuth.post(
          `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/renewable`,
          {
            data: {
              location: rowToSave.location,
              locationId: organizationAddressId,
              year: parseInt(String(rowToSave.year)),
              month: rowToSave.month,
              typeOfTechnologyUsed: rowToSave.typeOfTechnologyUsed || "",
              yearOfInstallation: parseInt(
                String(rowToSave.yearOfInstallation || 0)
              ),
              unitOfEnergyGeneratedInKwh: parseFloat(
                String(rowToSave.unitOfEnergyGeneratedInKwh || 0)
              ),
            },
            organizationAddressId: organizationAddressId,
            ...(originalRowDataForAPI && {
              originalData: originalRowDataForAPI,
            }),
          }
        );

        if (response.status === 200) {
          postParentMessage(energyCaptivePowerFormUpdated(false, "renewable"));

          // In prepopulate mode: Don't refetch to preserve validationErrors for other rows
          // In standard mode: Refetch to ensure data is in sync
          // if (FORM_MODE !== FORM_MODE_PREPOPULATE) {
          await refetch();
          // }

          return true;
        } else {
          setError(response.data?.message || "Failed to save data");
          return false;
        }
      }
    } catch (err: any) {
      console.error("Error saving data:", err);

      if (err.response) {
        const errorData = err.response.data;

        // Handle validation errors (array format from API)
        if (
          errorData?.validationErrors &&
          Array.isArray(errorData.validationErrors)
        ) {
          // Map API field names to frontend field keys
          const fieldKeyMap: Record<string, string> = {
            "Type of Technology Used": "typeOfTechnologyUsed",
            "Year of Installation": "yearOfInstallation",
            "Installation Year": "yearOfInstallation",
            "Unit of Energy Generated (in Kwh)": "unitOfEnergyGeneratedInKwh",
            Location: "location",
            Year: "year",
            Month: "month",
          };

          const mappedErrors: Record<string, string> = {};
          errorData.validationErrors.forEach(
            (error: { field: string; message: string }) => {
              const apiField = error.field;
              const message = error.message;
              // Map the API field name to frontend field key
              const frontendKey = fieldKeyMap[apiField] || apiField;
              mappedErrors[frontendKey] = message;
            }
          );

          // Clear all previous field errors before setting new API errors
          setFieldErrors({});

          // Set new errors from API response
          setFieldErrors(mappedErrors);
        }

        // Handle general error message
        if (errorData?.message) {
          setError(errorData.message);
        } else if (errorData?.error?.message) {
          setError(errorData.error.message);
        } else {
          setError("An unexpected error occurred");
        }
      } else {
        setError("An unexpected error occurred");
      }
      return false;
    } finally {
      setIsSaving(false);
    }

    return true;
  };

  const handleDeleteRows = async (
    selectedIndices: number[]
  ): Promise<boolean> => {
    try {
      setError(null);

      // Get the rows to delete based on selected indices
      const rowsToDelete = selectedIndices
        .map((index) => mergedData[index])
        .filter(Boolean);

      if (rowsToDelete.length === 0) {
        return false;
      }

      // Extract IDs from rows to delete
      const selectedRowIdsToDelete = rowsToDelete
        .map((row) => row.id as string)
        .filter(Boolean);

      if (selectedRowIdsToDelete.length === 0) {
        return false;
      }

      // Get organization address ID from the first row.
      // Prefer the stable backend id already on the row; only fall back to a
      // label lookup if the row doesn't carry organizationAddressId.
      const firstRow = rowsToDelete[0];
      const organizationAddressId: string | undefined =
        (firstRow?.organizationAddressId as string | undefined) ||
        locationOptions.find(
          (option: { label: string; value: string }) =>
            option.label === (firstRow?.location as string | undefined)
        )?.value;

      if (!organizationAddressId) {
        return false;
      }

      // Send parent message to request delete confirmation with IDs
      postParentMessage(
        confirmDeleteFormEntry({
          selectedRowIdsToDelete: selectedRowIdsToDelete,
          organizationAddressId: organizationAddressId,
        })
      );

      return true;
    } catch (err) {
      console.error("Error deleting rows:", err);
      return false;
    }
  };

  // Generate year options from baseline to current year
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = baselineYear || currentYear - 10;
    const years = [];
    for (let year = currentYear; year >= startYear; year--) {
      years.push({ label: String(year), value: year });
    }
    return years;
  }, [baselineYear]);

  // In key-based prepopulate mode, locations returned in addNewEntryLocationOptions
  // are the locations WITHOUT OrgActivityMaster config. So covered locations are:
  // all locations - addNewEntry locations.
  const locationsWithOrgActivityMasterData = useMemo(() => {
    if (prepopulateMode !== "prepopulate_with_key") {
      return new Set<string>();
    }

    const addNewLocationIds = new Set(
      (addNewEntryLocationOptions ?? []).map((option) => option.value)
    );

    return new Set(
      (locationOptions ?? [])
        .map((option) => option.value)
        .filter((locationId) => !addNewLocationIds.has(locationId))
    );
  }, [prepopulateMode, addNewEntryLocationOptions, locationOptions]);

  // Define table columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        name: "Location",
        key: "location",
        hide: false,
        required: true,
        options: locationOptions,
        type: "single-select" as const,
        placeholder: "Select Location",
      },
      {
        name: "Year",
        key: "year",
        hide: false,
        required: true,
        options: yearOptions,
        type: "single-select" as const,
        placeholder: "Select Year",
      },
      {
        name: "Month",
        key: "month",
        hide: false,
        required: true,
        type: "single-select" as const,
        placeholder: "Select Month",
      },
      {
        name: "Type of Technology Used",
        key: "typeOfTechnologyUsed",
        hide: false,
        required: true,
        options: technologyOptions,
        addNewEntryOptions: addNewEntryTechnologyOptions,
        type: "single-select" as const,
        placeholder: "Select Technology",
        validateFields: ["typeOfTechnologyUsed"],
        getIsDisabled: (rowData: RowData) => {
          if (
            FORM_MODE !== FORM_MODE_PREPOPULATE ||
            prepopulateMode !== "prepopulate_with_key"
          ) {
            return false;
          }
          return rowData._isMasterDataValue === 1;
        },
      },
      {
        name: "Year of Installation",
        key: "yearOfInstallation",
        hide: false,
        required: true,
        type: "number" as const,
        // decimalPlaces: false,
        decimalPlaces: true,
        validateFields: ["yearOfInstallation"],
      },
      {
        name: "Unit of Energy Generated (in Kwh)",
        key: "unitOfEnergyGeneratedInKwh",
        hide: false,
        required: true,
        type: "number" as const,
        // decimalPlaces: false,
        decimalPlaces: true,
        validateFields: ["unitOfEnergyGeneratedInKwh"],
      },
    ];

    return baseColumns;
  }, [
    FORM_MODE,
    prepopulateMode,
    locationOptions,
    yearOptions,
    technologyOptions,
    addNewEntryTechnologyOptions,
    locationsWithOrgActivityMasterData,
  ]);
  return (
    <Box>
      {error && error.toLocaleLowerCase() !== "validation failed" && (
        <Text c="red" size="sm" mb="md">
          {error}
        </Text>
      )}
      <ManualEntryTable
        columns={columns}
        initialData={mergedData}
        onDataChange={handleDataChange}
        onDeleteRows={handleDeleteRows}
        addNewEntryLocationOptions={
          FORM_MODE === FORM_MODE_PREPOPULATE
            ? addNewEntryLocationOptions
            : undefined
        }
        baselineYear={baselineYear}
        financialYearMonth={financialYearMonth}
        getMonthOptions={getMonthOptionsForYear}
        onClearFieldError={clearFieldError}
        onCancelEdit={() => setError(null)}
        fieldErrors={fieldErrors}
        isValidating={isSaving}
        // Server-side props
        rowCount={totalCount}
        manualPagination={true}
        manualSorting={true}
        manualFiltering={true}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={handleGlobalFilterChange}
        state={{
          pagination,
          sorting,
          globalFilter,
          isLoading: loading || formModeLoading,
        }}
        globalFilter={globalFilter}
        // Standard mode: show delete button; Prepopulate mode: hide it
        hideDeleteButton={FORM_MODE === FORM_MODE_PREPOPULATE}
        // Standard mode: show checkboxes; Prepopulate mode: hide them
        hideCheckboxes={FORM_MODE === FORM_MODE_PREPOPULATE}
        // Captive Power Renewable: Show only "All" tab for both standard and prepopulate modes
        customTabs={[{ label: "All", value: "all", count: tabCounts.allCount }]}
        activeCustomTab={activeTab}
        onCustomTabChange={setActiveTab}
        // Hide upload type tabs - we use custom tabs instead
        showUploadTypeTabs={true}
        // Standard mode: no fields locked.
        // prepopulate_general: lock location/year/month only for pre-populated rows.
        // prepopulate_with_key: lock location/year/month for all rows, typeOfTechnologyUsed only for pre-populated rows.
        alwaysLockedFields={
          FORM_MODE === FORM_MODE_PREPOPULATE
            ? ["location", "year", "month"]
            : []
        }
        // prePopulatedLockedFields only needs to cover skeleton rows (_isPrePopulated: 1).
        // In prepopulate_with_key mode, typeOfTechnologyUsed is locked only for skeleton rows,
        // allowing it to be editable for existing data rows.
        prePopulatedLockedFields={
          FORM_MODE === FORM_MODE_PREPOPULATE ? [] : undefined
        }
        disabledWhenPreFilledFields={
          FORM_MODE === FORM_MODE_PREPOPULATE ? [] : undefined
        }
        // Enable inline editing for pre-populated rows
        enableInlineEditForPrePopulated={FORM_MODE === FORM_MODE_PREPOPULATE}
        // For prepopulate mode: put all rows in editing mode (table edit mode)
        // alwaysInEditingMode={FORM_MODE === FORM_MODE_PREPOPULATE}
        // Role-based access control
        isOrganizationAdmin={isOrganizationAdmin}
        onTableInstanceReady={handleTableInstanceReady}
        // Disable add button if no locations available for new entries
        disableAddButton={shouldDisableAddNewEntry}
      />
    </Box>
  );
};

export default CaptivePowerRenewableListing;
