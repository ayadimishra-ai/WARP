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
  FormMode,
  getMonthOptionsForYear,
  getUomLabelFromValue,
  getUomOptionsForFuelType,
  useDeleteMessageHandler,
  useEnergyCaptivePowerNonRenewableFuelFormMode,
  useEnergyCaptivePowerNonRenewableFuelServerData,
} from "./hooks";

type RowData = Record<string, string | number | null | undefined | any>;

interface CaptivePowerNonRenewableFuelListingProps {
  onDataLoaded?: (hasData: boolean) => void;
}

const CaptivePowerNonRenewableFuelListing = ({ onDataLoaded }: CaptivePowerNonRenewableFuelListingProps = {}) => {
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
    useEnergyCaptivePowerNonRenewableFuelFormMode();

  // Admin users always use standard mode (readonly, no prepopulated skeleton rows)
  const FORM_MODE = isOrganizationAdmin ? FORM_MODE_STANDARD : rawFormMode;

  // Server-side state management
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Replace uploadType with custom activeTab to support "Pending Data"
  const [activeTab, setActiveTab] = useState<string>("all");

  const accessToken = params?.accessToken || "";
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // ========================================================================
  // Server-side data fetching with pre-population
  // ========================================================================
  const {
    data: mergedData,
    loading,
    totalCount,
    locationOptions,
    addNewEntryLocationOptions,
    fuelTypeOptions,
    fuelUnitOptionsMap,
    baselineYear,
    financialYearMonth,
    counts: tabCounts,
    refetch,
    shouldDisableAddNewEntry,
  } = useEnergyCaptivePowerNonRenewableFuelServerData({
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

  // Notify parent when data load status is determined
  useEffect(() => {
    if (!loading && !formModeLoading) {
      onDataLoaded?.(tabCounts.all - tabCounts.pending_data > 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formModeLoading, tabCounts.all, tabCounts.pending_data]);

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

  // Helper function to check if a row has AI extracted data
  const hasAIExtractedData = useCallback((rowData: RowData): boolean => {
    try {
      const metadata = rowData.metadata as any;
      if (!metadata) return false;
      if (typeof metadata === "string") {
        const parsed = JSON.parse(metadata);
        return (
          parsed?.AIExtractedData &&
          Object.keys(parsed.AIExtractedData).length > 0
        );
      }
      return !!(
        metadata?.AIExtractedData &&
        Object.keys(metadata.AIExtractedData).length > 0
      );
    } catch {
      return false;
    }
  }, []);

  const clearFieldError = (fieldKey: string) => {
    setFieldErrors((prev) => {
      const { [fieldKey]: _, ...rest } = prev;
      return rest;
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
      // setFieldErrors({});
      setIsSaving(true);

      // Get location name from row data
      let locationName: string | undefined;
      if (newData && newData.length > 0) {
        locationName = newData[newData.length - 1]?.location;
      } else if (updatedValues) {
        locationName = updatedValues?.location;
      }

      if (!locationName) {
        setError("Location not found");
        return false;
      }

      // Try to find by label first, then by value (since row data may contain UUID instead of label)
      let organizationAddressId = locationOptions.find(
        (option: { label: string; value: string }) =>
          option.label === locationName
      )?.value;

      // If not found by label, try by value (UUID)
      if (!organizationAddressId) {
        organizationAddressId = locationOptions.find(
          (option: { label: string; value: string }) =>
            option.value === locationName
        )?.value;
      }

      if (!organizationAddressId) {
        setError(
          `Location address not found for "${locationName}". Available locations: ${locationOptions.map((o) => o.label).join(", ")}`
        );
        return false;
      }

      let rowToSave: RowData | null = null;
      let originalRowDataForAPI: RowData | null = null;

      if (newData) {
        // Create new entry (from ADD NEW ENTRY button)
        // Use the last element which is the newly added entry (matches Grid Power pattern)
        rowToSave = newData[newData.length - 1] || null;
      } else if (updatedValues && originalData) {
        // Update existing entry OR save pre-populated row for the first time
        // Use updatedValues directly - it already contains the merged inline edited values from ManualEntryTable
        rowToSave = updatedValues;
        // Only set originalRowDataForAPI if this is an actual update (has real ID, not pre-populated)
        const isPrePopulatedRow =
          (originalData as any)?._isPrePopulated === true;
        if (!isPrePopulatedRow && originalData.id) {
          originalRowDataForAPI = originalData;
        }
      }

      if (rowToSave) {
        // Get the UoM label from value (API expects label, not value)
        const uomValue = rowToSave.UoMForTheQuantityOfFuelConsumed || "";
        const uomLabel = getUomLabelFromValue(
          uomValue,
          fuelUnitOptionsMap,
          rowToSave.typeOfFuelUsed
        );

        const response = await apiClientWithAuth.post(
          `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/non-renewable-fuel`,
          {
            data: {
              location: rowToSave.location,
              locationId: organizationAddressId,
              year: parseInt(String(rowToSave.year)),
              month: rowToSave.month,
              typeOfFuelUsed: rowToSave.typeOfFuelUsed || "",
              quantityOfFuelConsumed: parseFloat(
                String(rowToSave.quantityOfFuelConsumed || 0)
              ),
              UoM_for_the_quantity_of_fuel_consumed: uomLabel,
              qualityOfFuel: rowToSave.qualityOfFuel || "",
              unitOfEnergyGeneratedInKwh: parseFloat(
                String(rowToSave.unitOfEnergyGenerated || 0)
              ),
            },
            organizationAddressId: organizationAddressId,
            ...(originalRowDataForAPI && {
              originalData: originalRowDataForAPI,
            }),
          }
        );

        if (response.status === 200) {
          postParentMessage(
            energyCaptivePowerFormUpdated(false, "non-renewable-fuel")
          );

          // // In prepopulate mode: Don't refetch to preserve validationErrors for other rows
          // // In standard mode: Refetch to ensure data is in sync
          // if ((FORM_MODE as FormMode) !== FORM_MODE_PREPOPULATE) {
          await refetch();
          // }

          return true;
        } else {
          setError(response.data?.message || "Failed to save data");
          return false;
        }
      }

      return true;
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
            "UoM for the Quantity of Fuel consumed":
              "UoMForTheQuantityOfFuelConsumed",
            UoM_for_the_quantity_of_fuel_consumed:
              "UoMForTheQuantityOfFuelConsumed",
            "Type of Fuel Used": "typeOfFuelUsed",
            "Quantity of Fuel Consumed": "quantityOfFuelConsumed",
            "Quantity of fuel consumed": "quantityOfFuelConsumed",
            "Quality of Fuel": "qualityOfFuel",
            "Quality of fuel": "qualityOfFuel",
            "Unit of Energy Generated": "unitOfEnergyGenerated",
            "Unit of Energy Generated (in Kwh)": "unitOfEnergyGenerated",
            Location: "location",
            location: "location",
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
      // Ensure setIsSaving is always reset, regardless of which code path was taken
      setIsSaving(false);
    }
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

      // Filter out AI-extracted rows - only allow deletion of non-AI rows
      const nonAIRowsToDelete = rowsToDelete.filter(
        (row) => !hasAIExtractedData(row)
      );

      if (nonAIRowsToDelete.length === 0) {
        setError(
          "Cannot delete AI-extracted rows. Only manual entries can be deleted."
        );
        return false;
      }

      // If some rows were filtered out, show a warning
      if (nonAIRowsToDelete.length < rowsToDelete.length) {
        setError(
          `${rowsToDelete.length - nonAIRowsToDelete.length} AI-extracted row(s) were skipped and cannot be deleted. Only ${nonAIRowsToDelete.length} manual entry row(s) will be deleted.`
        );
      }

      // Extract IDs from rows to delete
      const selectedRowIdsToDelete = nonAIRowsToDelete
        .map((row) => row.id as string)
        .filter(Boolean);

      if (selectedRowIdsToDelete.length === 0) {
        return false;
      }

      // Get location name from the first row
      const firstRow = nonAIRowsToDelete[0];
      const locationName = firstRow?.location;

      if (!locationName) {
        setError("Location not found on row");
        return false;
      }
      // Try to find by label first, then by value (since row data may contain UUID instead of label)
      let organizationAddressId = locationOptions.find(
        (option: { label: string; value: string }) =>
          option.label === locationName
      )?.value;

      // If not found by label, try by value (UUID)
      if (!organizationAddressId) {
        organizationAddressId = locationOptions.find(
          (option: { label: string; value: string }) =>
            option.value === locationName
        )?.value;
      }

      if (!organizationAddressId) {
        setError(
          `Location address not found for "${locationName}". Available locations: ${locationOptions.map((o) => o.label).join(", ")}`
        );
        return false;
      }

      // Send parent message to request delete confirmation with IDs
      // This follows the same pattern as Grid Power
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
    const years: Array<{ label: string; value: number }> = [];
    for (let year = currentYear; year >= startYear; year--) {
      years.push({ label: year.toString(), value: year });
    }
    return years;
  }, [baselineYear]);

  // Lock location/year/month for ALL skeleton rows (configured or not) and all existing saved rows.
  // Configured locations additionally lock the fuel type field (via shouldLockFuelType).
  const shouldLockIdentifyingFields = useCallback(
    (rowData: RowData) => {
      if ((FORM_MODE as FormMode) !== FORM_MODE_PREPOPULATE) return false;
      return (
        rowData._isPrePopulated === true || rowData.hasExistingData === true
      );
    },
    [FORM_MODE]
  );

  // Lock typeOfFuelUsed only if this row's fuel value is one of the OrgActivityMaster
  // values for its location. Other fuel types (e.g. historical data not in master)
  // remain editable even for configured locations.
  const shouldLockFuelType = useCallback(
    (rowData: RowData) => {
      if ((FORM_MODE as FormMode) !== FORM_MODE_PREPOPULATE) return false;
      return rowData._isMasterDataValue === true;
    },
    [FORM_MODE]
  );

  // Get UoM options based on selected fuel type
  const getUomOptions = useCallback(
    (selectedFuelType: string | undefined | null) => {
      return getUomOptionsForFuelType(selectedFuelType, fuelUnitOptionsMap);
    },
    [fuelUnitOptionsMap]
  );

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
        getIsDisabled: shouldLockIdentifyingFields,
      },
      {
        name: "Year",
        key: "year",
        hide: false,
        required: true,
        options: yearOptions,
        type: "single-select" as const,
        placeholder: "Select Year",
        getIsDisabled: shouldLockIdentifyingFields,
      },
      {
        name: "Month",
        key: "month",
        hide: false,
        required: true,
        type: "single-select" as const,
        placeholder: "Select Month",
        getIsDisabled: shouldLockIdentifyingFields,
      },
      {
        name: "Type of Fuel Used",
        key: "typeOfFuelUsed",
        hide: false,
        required: true,
        options: fuelTypeOptions,
        type: "single-select" as const,
        placeholder: "Select Fuel Type",
        getIsDisabled: shouldLockFuelType,
      },
      {
        name: "Quantity of Fuel Consumed",
        key: "quantityOfFuelConsumed",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: true,
      },
      {
        name: "UoM for the Quantity of Fuel consumed",
        key: "UoMForTheQuantityOfFuelConsumed",
        hide: false,
        required: true,
        type: "single-select" as const,
        placeholder: "Select UoM",
      },
      {
        name: "Quality of fuel",
        key: "qualityOfFuel",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
      },
      {
        name: "Unit of Energy Generated (in Kwh)",
        key: "unitOfEnergyGenerated",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: true,
      },
    ];

    return baseColumns;
  }, [
    locationOptions,
    yearOptions,
    fuelTypeOptions,
    shouldLockIdentifyingFields,
    shouldLockFuelType,
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
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE
            ? addNewEntryLocationOptions
            : undefined
        }
        baselineYear={baselineYear}
        financialYearMonth={financialYearMonth}
        getMonthOptions={getMonthOptionsForYear}
        getUomOptions={getUomOptions}
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
        hasAIExtractedData={hasAIExtractedData}
        globalFilter={globalFilter}
        // Standard mode: show delete button; Prepopulate mode: hide it
        hideDeleteButton={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD ? false : true
        }
        // Standard mode: show checkboxes; Prepopulate mode: hide them
        hideCheckboxes={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD ? false : true
        }
        // Captive Power: Show only "All" tab for both standard and prepopulate modes
        // No AI Uploaded or Manual Entry tabs for this activity type
        customTabs={[{ label: "All", value: "all", count: tabCounts.all }]}
        activeCustomTab={activeTab}
        onCustomTabChange={setActiveTab}
        // Hide upload type tabs - we use custom tabs instead
        showUploadTypeTabs={true}
        // Locking is handled per-row via getIsDisabled on each column.
        // Rows from configured locations (_locationHasMasterData=true) lock all 4 key fields.
        // Rows from unconfigured locations (Add New Entry) remain fully editable.
        alwaysLockedFields={[]}
        prePopulatedLockedFields={undefined}
        disabledWhenPreFilledFields={undefined}
        // Enable inline editing for pre-populated rows (editable textbox fields for quantity, UoM, quality, energy)
        enableInlineEditForPrePopulated={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE ? true : false
        }
        // Role-based access control
        isOrganizationAdmin={isOrganizationAdmin}
        onTableInstanceReady={handleTableInstanceReady}
        // Disable add button if no locations available for new entries
        disableAddButton={shouldDisableAddNewEntry}
      />
    </Box>
  );
};

export default CaptivePowerNonRenewableFuelListing;
