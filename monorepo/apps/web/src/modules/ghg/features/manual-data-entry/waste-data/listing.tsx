// features/manual-data-entry/waste-data/listing.tsx
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
  postParentMessage,
  wasteDataFormUpdated,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import { FORM_MODE_PREPOPULATE, FORM_MODE_STANDARD } from "@/modules/ghg/utils/const";
import {
  getUserRoleFromToken,
  ROLE_ORGANIZATION_ADMIN,
} from "@/modules/ghg/utils/jwt/getUserDataFromToken";
import {
  getMonthOptionsForYear,
  useDeleteMessageHandler,
  useWasteFormMode,
  useWasteMasterOptions,
  useWasteServerData,
} from "./hooks";

type RowData = Record<string, string | number | null | undefined>;

// Activity Form Modes: "standard" (no pre-populated data) or "prepopulate" (with pre-populated data)
export type FormMode = "standard" | "prepopulate";

interface WasteDataListingProps {
  onDataLoaded?: (hasData: boolean) => void;
}

const WasteDataListing = ({ onDataLoaded }: WasteDataListingProps = {}) => {
  useWarpContentSize();
  const params = useParams();
  const organizationId = params?.organizationId as string;

  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isOrganizationAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  // Dynamically determine form mode based on PlatformFeatureFlags
  const { formMode: rawFormMode, loading: formModeLoading } =
    useWasteFormMode();

  // Admin users always use standard mode
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
    baselineYear,
    financialYearMonth,
    counts: tabCounts,
    refetch,
    shouldDisableAddNewEntry,
  } = useWasteServerData({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    pagination,
    sorting,
    globalFilter,
    uploadType: activeTab,
    activity: "waste",
    formMode: FORM_MODE,
    skip: formModeLoading,
  });

  // Notify parent when data load status is determined
  useEffect(() => {
    if (!loading && !formModeLoading) {
      onDataLoaded?.(tabCounts.all - tabCounts.pending_data > 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formModeLoading, tabCounts.all, tabCounts.pending_data]);

  // Master data options for column dropdowns
  const {
    wasteDisposalManagedByOptions,
    wasteQuantityUomOptions,
    wasteDisposalLocationDistanceUomOptions,
    wasteDisposalTransportFuelUsedOptions,
    wasteDisposalTransportRoadVehicleTypeOptions,
    wasteTransportationManagedByOptions,
    wasteDisposalTransportModeOfTransportOptions,
    wasteDisposalMechanismOptions,
    wasteTypeOptions,
    refetchWasteTypes,
  } = useWasteMasterOptions();

  // tableRef to reset rows selection after delete operation
  const tableRef = useRef<any>(null);

  const handleRefetchCompleted = useCallback(() => {
    try {
      const tbl = tableRef.current;
      if (!tbl) return;

      if (typeof tbl.resetRowSelection === "function") {
        tbl.resetRowSelection();
        return;
      }

      console.warn("Could not reset table selection: unknown table API", tbl);
    } catch (err) {
      console.warn("resetRowSelection failed:", err);
    }
  }, []);

  const handleTableInstanceReady = useCallback((table: any) => {
    tableRef.current = table;
  }, []);

  useDeleteMessageHandler({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    refetch,
    onError: setError,
    onSavingChange: setIsSaving,
    onRefetchCompleted: handleRefetchCompleted,
    FORM_MODE,
  });

  const handleGlobalFilterChange = (
    value: string | ((old: string) => string)
  ) => {
    const newFilter = typeof value === "function" ? value(globalFilter) : value;
    setGlobalFilter(newFilter);
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

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
        Object.keys(metadata?.AIExtractedData).length > 0
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

    // Use the last element for new rows — ManualEntryTable always appends new rows at the end.
    // find((m) => !m.id) is wrong in prepopulate mode because skeleton rows also lack an id,
    // causing the first skeleton row (wrong location) to be picked instead of the new row.
    const locationName =
      updatedValues?.location || newData?.[newData.length - 1]?.location;

    // locationName may be the display label or the UUID value (when selected via
    // addNewEntryLocationOptions whose Select stores the option value, not label).
    const organizationAddressId = locationOptions.find(
      (option: { label: string; value: string }) =>
        option.label === locationName || option.value === locationName
    )?.value;

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

        const apiPayload: any = {
          data: rowToSave,
          organizationAddressId: organizationAddressId,
          formMode: FORM_MODE,
        };

        if (originalRowDataForAPI) {
          apiPayload.originalData = originalRowDataForAPI;
        }

        if (apiPayload.data) apiPayload.data.locationId = organizationAddressId;

        const response = await apiClientWithAuth
          .post(
            `/${organizationId}/embed/v1/${accessToken}/data-import/forms/waste`,
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
          refetchWasteTypes();
          setIsSaving(false);
          postParentMessage(wasteDataFormUpdated(false));
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
            if (
              responseData?.validationErrors &&
              Array.isArray(responseData.validationErrors)
            ) {
              const fieldKeyMap: Record<string, string> = {
                "Types of Waste Generated": "Types_of_Waste_Generated",
                "Waste Disposal Managed by": "Waste_Disposal_Managed_by",
                "Name of Third Party": "Name_of_Third_Party",
                "Quantity of Waste": "Quantity_of_Waste",
                "Quantity of Waste UoM": "Quantity_of_Waste_UoM",
                UoM_Waste: "Quantity_of_Waste_UoM",
                "Disposal Mechanism": "Disposal_Mechanism",
                "Location of Waste Disposal": "Location_of_Waste_Disposal",
                "Who Managed Transportation of Waste":
                  "Who_Managed_Transportation_of_Waste",
                "Waste Transportation Managed By":
                  "Who_Managed_Transportation_of_Waste",
                "Mode of Transport": "Mode_of_Transport",
                "Vehicle Type Used for Road Transport":
                  "Vehicle_Type_Used_for_Road_Transport",
                "Fuel Used": "Fuel_Used",
                "Distance from Facility":
                  "DistOf_WasteDisposalLoction_from_FacilityLocation",
                "Distance of Waste Disposal Location from Facility":
                  "DistOf_WasteDisposalLoction_from_FacilityLocation",
                "Distance UoM":
                  "DistOf_WasteDisposalLoction_from_FacilityLocation_UoM",
                UoM: "DistOf_WasteDisposalLoction_from_FacilityLocation_UoM",
                Month: "Month",
                Year: "Year",
                Location: "Location",
              };
              const mappedErrors: Record<string, string> = {};
              responseData.validationErrors.forEach((issue: any) => {
                const fieldKey = fieldKeyMap[issue.field] || issue.field;
                mappedErrors[fieldKey] = issue.message;
              });
              setFieldErrors(mappedErrors);
              errorMessage = "";
            } else if (
              responseData?.message &&
              responseData.message !== "Validation failed"
            ) {
              errorMessage = responseData.message;
            } else if (responseData?.error?.message) {
              errorMessage = responseData.error.message;
            } else {
              errorMessage = err.message;
            }
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Error saving data:", err);
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
      const rowsToDelete = selectedIndices
        .map((index) => mergedData[index])
        .filter(Boolean);
      if (rowsToDelete.length === 0) return false;

      const nonAIRowsToDelete = rowsToDelete.filter(
        (row) => !hasAIExtractedData(row)
      );

      if (nonAIRowsToDelete.length === 0) {
        setError(
          "Cannot delete AI-extracted rows. Only manual entries can be deleted."
        );
        return false;
      }

      if (nonAIRowsToDelete.length < rowsToDelete.length) {
        setError(
          `${rowsToDelete.length - nonAIRowsToDelete.length} AI-extracted row(s) were skipped and cannot be deleted. Only ${nonAIRowsToDelete.length} manual entry row(s) will be deleted.`
        );
      }

      const selectedRowIdsToDelete = nonAIRowsToDelete
        .map((row) => row.id as string)
        .filter(Boolean);

      if (selectedRowIdsToDelete.length === 0) return false;

      const firstRow = nonAIRowsToDelete[0];
      const organizationAddressId = locationOptions.find(
        (option) => option.label === firstRow?.location
      )?.value;
      if (!organizationAddressId) return false;

      postParentMessage(
        confirmDeleteFormEntry({
          selectedRowIdsToDelete,
          organizationAddressId,
        })
      );
      return true;
    } catch (err) {
      console.error("Error deleting rows:", err);
      return false;
    }
  };

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = baselineYear || currentYear - 10;
    const years = [];
    for (let year = currentYear; year >= startYear; year--) {
      years.push({ label: String(year), value: year });
    }
    return years;
  }, [baselineYear]);

  const columns = useMemo(() => {
    return [
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
        error: fieldErrors.Year || fieldErrors.year,
      },
      {
        name: "Month",
        key: "month",
        hide: false,
        required: true,
        type: "single-select" as const,
        placeholder: "Select Month",
        error: fieldErrors.Month || fieldErrors.month,
      },
      {
        name: "Types of Waste Generated",
        key: "Types_of_Waste_Generated",
        hide: false,
        required: true,
        type: "autocomplete" as const,
        options: wasteTypeOptions,
        placeholder: "Select or type Waste Generated",
      },
      {
        name: "Waste Disposal Managed by",
        key: "Waste_Disposal_Managed_by",
        hide: false,
        required: true,
        type: "single-select" as const,
        options: wasteDisposalManagedByOptions,
        resetFields: ["Name_of_Third_Party"],
        placeholder: "Select Managed by",
      },
      {
        name: "Name of Third Party",
        key: "Name_of_Third_Party",
        hide: false,
        required: false,
        type: "string" as const,
        getIsRequired: (rowData: any) => {
          return rowData.Waste_Disposal_Managed_by === "Third Party";
        },
        getIsDisabled: (rowData: any) => {
          return rowData.Waste_Disposal_Managed_by === "Self";
        },
        placeholder: "Enter Third Party Name",
      },
      {
        name: "Quantity of Waste",
        key: "Quantity_of_Waste",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: true,
      },
      {
        name: "UoM_Waste",
        key: "Quantity_of_Waste_UoM",
        hide: false,
        required: true,
        type: "single-select" as const,
        options: wasteQuantityUomOptions,
        placeholder: "Select UoM",
      },
      {
        name: "Disposal Mechanism",
        key: "Disposal_Mechanism",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: wasteDisposalMechanismOptions,
        placeholder: "Select Mechanism",
      },
      {
        name: "Location of Waste Disposal",
        key: "Location_of_Waste_Disposal",
        hide: false,
        required: false,
        type: "string" as const,
      },
      {
        name: "Waste Transportation Managed By",
        key: "Who_Managed_Transportation_of_Waste",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: wasteTransportationManagedByOptions,
        placeholder: "Select Managed by",
      },
      {
        name: "Mode of Transport",
        key: "Mode_of_Transport",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: wasteDisposalTransportModeOfTransportOptions,
        resetFields: ["Fuel_Used", "Vehicle_Type_Used_for_Road_Transport"],
        placeholder: "Select Mode",
      },
      {
        name: "Vehicle Type Used for Road Transport",
        key: "Vehicle_Type_Used_for_Road_Transport",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: wasteDisposalTransportRoadVehicleTypeOptions,
        getOptions: (rowData: any) => {
          const mode = rowData.Mode_of_Transport;
          if (mode?.toLowerCase() === "road") {
            return (wasteDisposalTransportRoadVehicleTypeOptions || []).map((opt) => ({
              label: opt.label,
              value: opt.label,
            }));
          }
          return [];
        },
        getIsRequired: (rowData: any) => {
          return rowData.Mode_of_Transport?.toLowerCase() === "road";
        },
        getIsDisabled: (rowData: any) => {
          const mode = rowData.Mode_of_Transport;
          return !!mode && mode.toLowerCase() !== "road";
        },
        placeholder: "Select Vehicle Type",
      },
      {
        name: "Fuel Used",
        key: "Fuel_Used",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: wasteDisposalTransportFuelUsedOptions,
        getOptions: (rowData: any) => {
          const selectedMode = rowData.Mode_of_Transport;
          if (!selectedMode) return [];

          const modeOption = wasteDisposalTransportModeOfTransportOptions.find(
            (m) => m.value?.toLowerCase() === selectedMode?.toLowerCase()
          );

          if (!modeOption) return [];

          return (wasteDisposalTransportFuelUsedOptions || [])
            .filter((option) => option.group?.includes(modeOption.value))
            .map((opt) => ({ label: opt.label, value: opt.label }));
        },
        placeholder: "Select Fuel",
      },
      {
        name: "Distance of Waste Disposal Location from Facility",
        key: "DistOf_WasteDisposalLoction_from_FacilityLocation",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
        getIsRequired: (rowData: any) => {
          return !!rowData.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM;
        },
      },
      {
        name: "Distance UoM",
        key: "DistOf_WasteDisposalLoction_from_FacilityLocation_UoM",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: wasteDisposalLocationDistanceUomOptions,
        validateFields: ["DistOf_WasteDisposalLoction_from_FacilityLocation"],
        placeholder: "Select UoM",
      },
    ];
  }, [
    fieldErrors,
    locationOptions,
    yearOptions,
    wasteTypeOptions,
    wasteDisposalManagedByOptions,
    wasteQuantityUomOptions,
    wasteDisposalMechanismOptions,
    wasteTransportationManagedByOptions,
    wasteDisposalTransportModeOfTransportOptions,
    wasteDisposalTransportRoadVehicleTypeOptions,
    wasteDisposalTransportFuelUsedOptions,
    wasteDisposalLocationDistanceUomOptions,
  ]);

  return (
    <Box>
      {error ? <Text c="red">{error}</Text> : null}
      <ManualEntryTable
        key={`waste-${FORM_MODE}-${activeTab}`}
        columns={columns}
        initialData={mergedData}
        onDataChange={handleDataChange}
        // Delete functionality enabled only for standard mode
        onDeleteRows={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD
            ? handleDeleteRows
            : undefined
        }
        hideAddButton={false}
        disableAddButton={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE &&
          shouldDisableAddNewEntry
        }
        // Standard mode: show delete button; Prepopulate mode: hide it
        hideDeleteButton={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD ? false : true
        }
        // Standard mode: show checkboxes; Prepopulate mode: hide them
        hideCheckboxes={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD ? false : true
        }
        // Filtered location options for "Add new entry" dropdown in prepopulate mode
        addNewEntryLocationOptions={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE
            ? addNewEntryLocationOptions
            : undefined
        }
        // Custom tabs with counts from server
        customTabs={
          (FORM_MODE as FormMode) === FORM_MODE_STANDARD
            ? [
                { label: "All", value: "all", count: tabCounts.all },
                // {
                //   label: "AI Uploaded",
                //   value: "ai_uploaded",
                //   count: tabCounts.ai_uploaded,
                // },
                // {
                //   label: "Manual Entry",
                //   value: "manual_entry",
                //   count: tabCounts.manual_entry,
                // },
              ]
            : [{ label: "All", value: "all", count: tabCounts.all }]
        }
        activeCustomTab={activeTab}
        onCustomTabChange={setActiveTab}
        // Pre-population mode specific props
        alwaysLockedFields={
          (FORM_MODE as FormMode) === FORM_MODE_PREPOPULATE
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
        onCancelEdit={() => setError(null)}
        fieldErrors={fieldErrors}
        isValidating={isSaving}
        hasAIExtractedData={hasAIExtractedData}
        globalFilter={globalFilter}
        // Server-side pagination enabled
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
        isOrganizationAdmin={isOrganizationAdmin}
        onTableInstanceReady={handleTableInstanceReady}
      />
    </Box>
  );
};

export default WasteDataListing;
