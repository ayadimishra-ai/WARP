"use client";
import { Box, Text } from "@mantine/core";
import axios from "axios";
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ManualEntryTable from "@/modules/ghg/features/manual-data-entry/Common/ManualEntryTable";
import { useWarpContentSize } from "@/modules/ghg/hooks/use-warp-content-size";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import {
  confirmDeleteFormEntry,
  energyGridPowerFormUpdated,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "@/modules/ghg/utils/const";
import {
  getUserRoleFromToken,
  ROLE_ORGANIZATION_ADMIN,
} from "@/modules/ghg/utils/jwt/getUserDataFromToken";
import {
  getMonthOptionsForYear,
  useDeleteMessageHandler,
  useEnergyGridPowerFormMode,
  useEnergyGridPowerServerData,
} from "./hooks";

type RowData = Record<string, string | number | null | undefined | any>;

// Activity Form Modes: "standard" (no pre-populated data) or "prepopulate" (with pre-populated data)
export type FormMode = "standard" | "prepopulate";

interface EnergyGridPowerListingProps {
  onDataLoaded?: (hasData: boolean) => void;
}

const EnergyGridPowerListing = ({ onDataLoaded }: EnergyGridPowerListingProps = {}) => {
  useWarpContentSize();
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
    useEnergyGridPowerFormMode();

  // Admin users always use standard mode (readonly, no prepopulated skeleton rows)
  const FORM_MODE = isOrganizationAdmin ? FORM_MODE_STANDARD : rawFormMode;

  // Debug: Log the dynamic form mode
  console.log(
    "Dynamic Form Mode for Energy Grid Power:",
    FORM_MODE,
    "Loading:",
    formModeLoading
  );

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
    baselineYear,
    financialYearMonth,
    counts: tabCounts,
    refetch,
    shouldDisableAddNewEntry,
  } = useEnergyGridPowerServerData({
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

  // Enable delete functionality for standard mode only

  useDeleteMessageHandler({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    refetch,
    onError: setError,
    onSavingChange: setIsSaving,
    onRefetchCompleted: handleRefetchCompleted,
    FORM_MODE,
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
      return (
        metadata?.AIExtractedData &&
        Object.keys(metadata.AIExtractedData).length > 0
      );
    } catch {
      return false;
    }
  }, []);

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

    const locationIdFromUpdated = updatedValues?.locationId;
    // Use the last element — ManualEntryTable always appends new rows at the end.
    // find((m) => !m.id) is wrong in prepopulate mode because skeleton rows also
    // lack an id, causing the wrong (first skeleton) row to be picked.
    const locationIdFromNew = newData?.[newData.length - 1]?.locationId;

    let organizationAddressId = locationIdFromUpdated || locationIdFromNew;

    // Backwards-compatible fallback
    if (!organizationAddressId) {
      const locationValue =
        updatedValues?.location || newData?.[newData.length - 1]?.location;

      // Case 1: location is already an ID (UUID format or matches value directly)
      const matchedByValue = locationOptions.find(
        (option: { label: string; value: string }) =>
          option.value === locationValue
      );

      if (matchedByValue) {
        organizationAddressId = matchedByValue.value;
      } else {
        // Case 2: location is a label
        const matchedByLabel = locationOptions.find(
          (option: { label: string; value: string }) =>
            option.label === locationValue
        );

        organizationAddressId = matchedByLabel?.value;
      }
    }

    if (!organizationAddressId) return false;

    let rowToSave: RowData | null = null;
    let originalRowDataForAPI: RowData | null = null;

    if (newData) {
      rowToSave = newData[newData.length - 1];
    } else if (updatedValues && originalData) {
      rowToSave = updatedValues;
      originalRowDataForAPI = originalData;
    }

    if (rowToSave) {
      try {
        setError(null);
        setFieldErrors({});
        setIsSaving(true);

        const stringFields = [
          "nameOfDistributionCompany",
          "nameOfCompanyPPARenewable",
          "nameOfCompanyPPANonRenewable",
          "nameOfCompanyForREC",
        ];
        const numberFields = [
          "powerConsumedThroughGridKwh",
          "powerPurchasedThroughPPAKwhRenewable",
          "powerPurchasedThroughPPAKwhNonRenewable",
          "powerPurchasedThroughRECKwh",
        ];

        const sanitizedData = { ...rowToSave };
        stringFields.forEach((field) => {
          if (
            sanitizedData[field] === null ||
            sanitizedData[field] === undefined
          ) {
            sanitizedData[field] = "";
          }
        });
        numberFields.forEach((field) => {
          // In standard mode: convert empty/null to "0" for display and storage consistency
          // In prepopulate mode: keep empty values blank for server validation of dependent fields
          if (
            sanitizedData[field] === null ||
            sanitizedData[field] === undefined ||
            sanitizedData[field] === ""
          ) {
            if (FORM_MODE === FORM_MODE_STANDARD) {
              // Standard mode: convert to "0"
              sanitizedData[field] = "0";
            } else {
              // Prepopulate mode: convert to empty string for validation
              sanitizedData[field] = "";
            }
          }
        });

        const apiPayload: any = {
          data: sanitizedData,
          organizationAddressId: organizationAddressId,
          formMode: FORM_MODE, // Pass the form mode to server for validation
        };

        if (originalRowDataForAPI) {
          apiPayload.originalData = originalRowDataForAPI;
        }

        if (apiPayload.data) apiPayload.data.locationId = organizationAddressId;

        const response = await apiClientWithAuth
          .post(
            `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-grid-power`,
            apiPayload
          )
          .then((response) => {
            if (response?.statusText == "OK" && response?.status == 200) {
              return response.data;
            }
            throw new Error("API request failed");
          });

        if (response.success) {
          if (response.isNoChange) {
            setIsSaving(false);
            return true;
          }
          await refetch();
          setIsSaving(false);
          postParentMessage(energyGridPowerFormUpdated(false));
          return true;
        } else {
          throw new Error("Save operation failed");
        }
      } catch (err) {
        setIsSaving(false);
        let errorMessage = "An error occurred";

        if (axios.isAxiosError(err)) {
          if (!err.response) {
            errorMessage =
              "Save failed due to network error. Please check connection and retry.";
          } else {
            const responseData = err.response?.data;
            if (responseData?.code === "APPROVAL_LOCK") {
              // Route approval-lock errors to the month field so they appear inline
              // on the form just like the "Existing Entry Detected" AI validation message.
              setFieldErrors({
                month:
                  responseData.error?.message ||
                  "This period has already been approved and cannot be modified",
              });
              errorMessage = "";
            } else if (
              responseData?.validationErrors &&
              Array.isArray(responseData.validationErrors)
            ) {
              const fieldKeyMap: Record<string, string> = {
                "Name of Distribution Company": "nameOfDistributionCompany",
                "Units of Power Consumed - Grid (in Kwh)":
                  "powerConsumedThroughGridKwh",
                "PPA Company Name - Renewable": "nameOfCompanyPPARenewable",
                "Units of Renewable power - PPA (in Kwh)":
                  "powerPurchasedThroughPPAKwhRenewable",
                "PPA Company Name - Non Renewable":
                  "nameOfCompanyPPANonRenewable",
                "Units of Non Renewable power - PPA (in Kwh)":
                  "powerPurchasedThroughPPAKwhNonRenewable",
                "REC Company": "nameOfCompanyForREC",
                "Units of power purchased - REC (in Kwh)":
                  "powerPurchasedThroughRECKwh",
                Month: "month",
                Year: "year",
                Location: "location",
                location: "location",
              };

              const mappedErrors: Record<string, string> = {};

              // Map all validation errors using the column key names
              // The ManualEntryTable component internally maps fieldErrors to the correct row
              // via validationErrors[lastRowId] = fieldErrors (see ManualEntryTable.tsx line ~305)
              responseData.validationErrors.forEach((issue: any) => {
                const fieldKey = fieldKeyMap[issue.field] || issue.field;
                mappedErrors[fieldKey] = issue.message;
              });

              errorMessage = "";

              setFieldErrors(mappedErrors);
            } else if (
              responseData?.message &&
              responseData.message !== "Validation failed"
            ) {
              // API-level row error (e.g. "Data has already been approved").
              // Show it inline inside the editing row rather than as a top banner.
              setFieldErrors({ _rowError: responseData.message });
              errorMessage = "";
            } else if (responseData?.error?.message) {
              setFieldErrors({ _rowError: responseData.error.message });
              errorMessage = "";
            } else {
              errorMessage = err.message;
            }
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        if (errorMessage) setError(errorMessage);
        return false;
      }
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

      // Get organization address ID from the first row
      // Prefer server-provided identifier when available (more reliable),
      // otherwise fall back to matching label in locationOptions for backward compatibility.
      const firstRow = nonAIRowsToDelete[0];
      const organizationAddressId =
        firstRow?.locationId ||
        locationOptions.find((option) => option.label === firstRow?.location)
          ?.value;

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
      // setError(errorMessage);
      console.error("Error deleting rows:", err);
      return false;
    }
  };

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = baselineYear || currentYear - 10;
    const years: Array<{ label: string; value: number }> = [];
    for (let year = currentYear; year >= startYear; year--) {
      years.push({ label: String(year), value: year });
    }
    return years;
  }, [baselineYear]);

  const locationsWithOrgActivityMasterData = useMemo(() => {
    if ((FORM_MODE as FormMode) !== FORM_MODE_PREPOPULATE) {
      return new Set<string>();
    }

    const addNewLocationIds = new Set(
      (addNewEntryLocationOptions ?? []).map((option) => option.value)
    );

    // Locations present in full options but missing from add-new options
    // are the locations covered by OrgActivityMaster.
    return new Set(
      (locationOptions ?? [])
        .map((option) => option.value)
        .filter((locationId) => !addNewLocationIds.has(locationId))
    );
  }, [FORM_MODE, addNewEntryLocationOptions, locationOptions]);

  const columns = useMemo(() => {
    // NOTE: Do NOT pass `error` on columns. The ManualEntryTable component handles
    // row-specific errors internally via the `fieldErrors` prop, which maps errors
    // to the correct row via `validationErrors[rowId][fieldKey]`.
    // Passing `error` on columns would show it on ALL rows.

    const isLocationLockedByMasterData = (rowData: RowData) => {
      if ((FORM_MODE as FormMode) !== FORM_MODE_PREPOPULATE) {
        return false;
      }
      return rowData._isMasterDataValue === true;
    };

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
        name: "Name of Distribution Company",
        key: "nameOfDistributionCompany",
        hide: false,
        required: false,
        type: "string" as const,
        getIsDisabled: (rowData: RowData) => {
          // Keep location-master locking, but always allow editing for AI-extracted rows
          return (
            isLocationLockedByMasterData(rowData) &&
            !hasAIExtractedData(rowData)
          );
        },
      },
      {
        name: "Grid Consumed (in Kwh)",
        key: "powerConsumedThroughGridKwh",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: true,
        getIsDisabled: (rowData: RowData) => {
          // Lock this field for all AI-extracted data rows (both standard and prepopulate modes)
          return hasAIExtractedData(rowData);
        },
      },
      {
        name: "PPA Company Name - Renewable",
        key: "nameOfCompanyPPARenewable",
        hide: false,
        required: false,
        type: "string" as const,
        validateFields: ["powerPurchasedThroughPPAKwhRenewable"],
      },
      {
        name: "Units of Renewable Power - PPA (in Kwh)",
        key: "powerPurchasedThroughPPAKwhRenewable",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
        getIsRequired: (rowData: RowData) => {
          // Required if PPA Company Name - Renewable has a value
          return !!(
            rowData?.nameOfCompanyPPARenewable &&
            String(rowData.nameOfCompanyPPARenewable).trim()
          );
        },
      },
      {
        name: "PPA Company Name - Non Renewable",
        key: "nameOfCompanyPPANonRenewable",
        hide: false,
        required: false,
        type: "string" as const,
        validateFields: ["powerPurchasedThroughPPAKwhNonRenewable"],
      },
      {
        name: "Units of Non Renewable power - PPA (in Kwh)",
        key: "powerPurchasedThroughPPAKwhNonRenewable",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
        getIsRequired: (rowData: RowData) => {
          // Required if PPA Company Name - Non Renewable has a value
          return !!(
            rowData?.nameOfCompanyPPANonRenewable &&
            String(rowData.nameOfCompanyPPANonRenewable).trim()
          );
        },
      },
      {
        name: "REC Company",
        key: "nameOfCompanyForREC",
        hide: false,
        required: false,
        type: "string" as const,
        validateFields: ["powerPurchasedThroughRECKwh"],
      },
      {
        name: "Units of power purchased - REC (in Kwh)",
        key: "powerPurchasedThroughRECKwh",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
        getIsRequired: (rowData: RowData) => {
          // Required if REC Company has a value
          return !!(
            rowData?.nameOfCompanyForREC &&
            String(rowData.nameOfCompanyForREC).trim()
          );
        },
      },
    ];

    return baseColumns;
  }, [
    FORM_MODE,
    locationOptions,
    locationsWithOrgActivityMasterData,
    yearOptions,
    hasAIExtractedData,
  ]);

  return (
    <Box>
      {error ? <Text c="red">{error}</Text> : null}
      <ManualEntryTable
        key={`gp-${FORM_MODE}-${activeTab}`}
        columns={columns}
        initialData={mergedData}
        onDataChange={handleDataChange}
        // Delete functionality enabled only for standard mode
        onDeleteRows={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD
            ? handleDeleteRows
            : undefined
        }
        hideAddButton={false} // Always show "Add new entry" button for both modes
        disableAddButton={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE &&
          shouldDisableAddNewEntry
        } // Disable "Add new entry" button in prepopulate mode when all locations have master data
        // Standard mode: hide delete on AI Uploaded tab; Prepopulate mode: always hide
        hideDeleteButton={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD
            ? activeTab === "ai_uploaded"
            : true
        }
        // Standard mode: show checkboxes; Prepopulate mode: hide them
        hideCheckboxes={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD ? false : true
        }
        disableSelectAll={activeTab === "ai_uploaded"}
        // Filtered location options for "Add new entry" dropdown in prepopulate mode
        addNewEntryLocationOptions={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE
            ? addNewEntryLocationOptions
            : undefined
        }
        // Standard mode: show only All, AI Uploaded, Manual Entry tabs (no Pending Data)
        // Prepopulate mode: show all tabs including Pending Data
        customTabs={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD
            ? [
                { label: "All", value: "all", count: tabCounts.all },
                {
                  label: "AI Uploaded",
                  value: "ai_uploaded",
                  count: tabCounts.ai_uploaded,
                },
                {
                  label: "Manual Entry",
                  value: "manual_entry",
                  count: tabCounts.manual_entry,
                },
              ]
            : [
                { label: "All", value: "all", count: tabCounts.all },
                // {
                //   label: "Pending Data",
                //   value: "pending_data",
                //   count: tabCounts.pending_data,
                // },
                {
                  label: "AI Uploaded",
                  value: "ai_uploaded",
                  count: tabCounts.ai_uploaded,
                },
                {
                  label: "Manual Entry",
                  value: "manual_entry",
                  count: tabCounts.manual_entry,
                },
              ]
        }
        activeCustomTab={activeTab}
        onCustomTabChange={setActiveTab}
        // Pre-population mode specific props - only apply when in prepopulate mode
        alwaysLockedFields={
          FORM_MODE === FORM_MODE_PREPOPULATE
            ? ["location", "year", "month"]
            : []
        }
        prePopulatedLockedFields={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE ? [] : undefined
        }
        disabledWhenPreFilledFields={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE ? [] : undefined
        }
        enableInlineEditForPrePopulated={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE ? true : false
        }
        baselineYear={baselineYear}
        financialYearMonth={financialYearMonth}
        getMonthOptions={getMonthOptionsForYear}
        onClearFieldError={clearFieldError}
        onCancelEdit={() => {
          setError(null);
          setFieldErrors({});
        }}
        fieldErrors={fieldErrors}
        isValidating={isSaving}
        hasAIExtractedData={hasAIExtractedData}
        globalFilter={globalFilter}
        // Server-side pagination enabled
        rowCount={totalCount}
        manualPagination={true}
        manualSorting={false}
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
        isOrganizationAdmin={isOrganizationAdmin}
        onTableInstanceReady={handleTableInstanceReady}
      />
    </Box>
  );
};

export default EnergyGridPowerListing;
