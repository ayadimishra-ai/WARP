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
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { useWarpContentSize } from "@/modules/ghg/hooks/use-warp-content-size";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import { UPLOAD_TYPES, UploadType } from "@/modules/ghg/shared/constants/activity.constant";
import {
    confirmDeleteFormEntry,
    energyFuelPurchasedFormUpdated,
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
    useFuelConsumptionFormMode,
    useFuelConsumptionGeneralData,
    usePrePopulatedFuelConsumptionData,
} from "./hooks";

type RowData = Record<string, string | number | null | undefined>;

interface FuelConsumptionListingProps {
  onDataLoaded?: (hasData: boolean) => void;
}

const FuelConsumptionListing = ({ onDataLoaded }: FuelConsumptionListingProps = {}) => {
  useWarpContentSize();
  const params = useParams();
  const session = useUserSession();
  const organizationId = params?.organizationId as string;

  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isOrganizationAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [uploadType, setUploadType] = useState<UploadType>(UPLOAD_TYPES.ALL);
  const accessToken = params?.accessToken || "";
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Check form mode dynamically
  const { formMode: rawFormMode, loading: formModeLoading } =
    useFuelConsumptionFormMode();

  // Admin users always use standard mode
  const FORM_MODE = isOrganizationAdmin ? FORM_MODE_STANDARD : rawFormMode;

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

  // Fetch pre-populated data if in prepopulate mode
  const prePopulatedData = usePrePopulatedFuelConsumptionData({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    pagination,
    sorting,
    globalFilter,
    statusFilter: uploadType,
    enabled: FORM_MODE === FORM_MODE_PREPOPULATE && !formModeLoading,
  });

  // Fetch standard data if not in prepopulate mode
  const standardData = useFuelConsumptionGeneralData({
    organizationId,
    userId: session?.userId || "",
    pagination,
    sorting,
    globalFilter,
    uploadType,
    isOrganizationAdmin,
  });

  // Use appropriate data based on form mode
  const {
    data,
    loading,
    rowCount,
    locationOptions,
    refetch,
    allCount,
    typeOfFuelPurchasedOptions,
    quantityOfFuelConsumedUomOptions,
    pointOfConsumptionOptions,
    uomGrouping,
  } = FORM_MODE === FORM_MODE_PREPOPULATE ? prePopulatedData : standardData;

  // Get baseline year and financial month - from prepopulate endpoint or from org data
  const prePopulateData =
    FORM_MODE === FORM_MODE_PREPOPULATE ? prePopulatedData : null;
  const addNewEntryLocationOptions =
    FORM_MODE === FORM_MODE_PREPOPULATE
      ? prePopulatedData.addNewEntryLocationOptions
      : [];
  const shouldDisableAddNewEntry =
    FORM_MODE === FORM_MODE_PREPOPULATE
      ? prePopulatedData.shouldDisableAddNewEntry
      : false;
  const locationsWithOrgActivityMasterData = useMemo(() => {
    if (FORM_MODE !== FORM_MODE_PREPOPULATE) {
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
  }, [FORM_MODE, addNewEntryLocationOptions, locationOptions]);
  const baselineYear =
    prePopulateData?.baselineYear || standardData.baselineYear;
  const financialYearMonth =
    prePopulateData?.financialYearMonth || standardData.financialYearMonth;

  // Notify parent when data load status is determined (prepopulate mode only)
  useEffect(() => {
    if (!loading && !formModeLoading) {
      const _allCount = FORM_MODE === FORM_MODE_PREPOPULATE
        ? prePopulatedData.allCount
        : 0;
      const _pendingCount = FORM_MODE === FORM_MODE_PREPOPULATE
        ? prePopulatedData.pendingCount
        : 0;
      onDataLoaded?.(_allCount - _pendingCount > 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formModeLoading, FORM_MODE, prePopulatedData.allCount, prePopulatedData.pendingCount]);

  useDeleteMessageHandler({
    organizationId,
    accessToken: typeof accessToken === "string" ? accessToken : "",
    refetch,
    onError: setError,
    onSavingChange: setIsSaving,
    onRefetchCompleted: handleRefetchCompleted,
  });

  const uploadTypeCounts = {
    All: allCount,
    "AI Uploaded": 0,
    "Manual Entry": 0,
  };

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

    // Use the last element for new rows — ManualEntryTable always appends new rows at the end.
    // find((m) => !m.id) is wrong in prepopulate mode because skeleton rows also lack an id,
    // causing the first skeleton row (wrong location) to be picked instead of the new row.
    const locationName =
      updatedValues?.location || newData?.[newData.length - 1]?.location;

    // locationName may be the display label or the UUID value (when selected via
    // addNewEntryLocationOptions whose Select stores the option value, not label).
    const organizationAddressId = locationOptions.find(
      (option) => option.label === locationName || option.value === locationName
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

        // Transform UoM value to label before sending to API
        // The table stores the internal value (e.g., "cubic_metre") but API expects the label (e.g., "Cubic Metre")
        if (rowToSave.quantityOfFuelConsumedUom) {
          const uomOption = uomGrouping.find(
            (uom: any) => uom.value === rowToSave.quantityOfFuelConsumedUom
          );
          if (uomOption) {
            rowToSave.quantityOfFuelConsumedUom =
              uomOption.label || uomOption.value;
          }
        }

        const apiPayload: any = {
          data: rowToSave,
          organizationAddressId: organizationAddressId,
        };

        if (originalRowDataForAPI) {
          apiPayload.originalData = originalRowDataForAPI;
        }

        if (apiPayload.data) apiPayload.data.locationId = organizationAddressId;

        const response = await apiClientWithAuth
          .post(
            `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-fuel-consumption/general-purpose`,
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

          // Trigger a parent generic form update to notify app of save
          postParentMessage(energyFuelPurchasedFormUpdated(false));
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
                "Type of Fuel Consumption": "typeOfFuelPurchased",
                "Quantity of Fuel Consumption": "quantityOfFuelConsumed",
                "UoM for Fuel Consumption": "quantityOfFuelConsumedUom",
                "Quality of Fuel": "qualityOfFuel",
                "Point of Consumption": "pointOfConsumption",
                Month: "month",
                Year: "year",
                Location: "location",
              };
              const mappedErrors: Record<string, string> = {};
              responseData.validationErrors.forEach((issue: any) => {
                const fieldKey = fieldKeyMap[issue.field] || issue.field;
                mappedErrors[fieldKey] = issue.message;
              });

              // Location, Month, and Year are not part of the excel payload so the server
              // never returns field errors for them. Propagate any duplicate error to all three.
              const duplicateMessage = Object.values(mappedErrors).find((msg) =>
                msg.startsWith("Duplicate Entry")
              );
              if (duplicateMessage) {
                mappedErrors["location"] = duplicateMessage;
                mappedErrors["month"] = duplicateMessage;
                mappedErrors["year"] = duplicateMessage;
              }

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
        .map((index) => data[index])
        .filter(Boolean);
      if (rowsToDelete.length === 0) return false;

      const selectedRowIdsToDelete = rowsToDelete
        .map((row) => row.id as string)
        .filter(Boolean);

      if (selectedRowIdsToDelete.length === 0) return false;

      const firstRow = rowsToDelete[0];
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

  // Build a map of fuelTypeLabel → UoM options from uomGrouping
  // This ensures UoM options are only shown for their associated fuel types
  const fuelUnitOptionsMap = useMemo(() => {
    if (!uomGrouping || uomGrouping.length === 0) {
      return {};
    }

    // Create a map: fuelTypeLabel -> UoM options
    const optionsMap: Record<
      string,
      Array<{ value: string; label: string }>
    > = {};

    // Initialize map with all fuel types (use label as key since that's what's selected in dropdown)
    typeOfFuelPurchasedOptions.forEach((fuelType: any) => {
      const fuelTypeLabel = fuelType.label || fuelType.value;
      const fuelTypeValue = fuelType.value || fuelType.label;

      optionsMap[fuelTypeLabel] = [];

      // Find UoM options that belong to this fuel type
      uomGrouping.forEach((uom: any) => {
        const uomGroups = uom.group || [];

        // Check if this UoM belongs to the current fuel type
        // Try both exact match and case-insensitive match
        const fuelTypeValueLower = String(fuelTypeValue).toLowerCase();
        const matchesGroup =
          Array.isArray(uomGroups) &&
          (uomGroups.includes(fuelTypeValue) ||
            uomGroups.includes(fuelTypeValueLower) ||
            uomGroups.some(
              (groupValue: string) =>
                String(groupValue).toLowerCase() === fuelTypeValueLower
            ));

        if (matchesGroup) {
          optionsMap[fuelTypeLabel].push({
            value: uom.value || uom.label,
            label: uom.label || uom.value,
          });
        }
      });
    });

    return optionsMap;
  }, [uomGrouping, typeOfFuelPurchasedOptions]);

  // Get UoM options based on selected fuel type
  const getUomOptions = useCallback(
    (selectedFuelType: string | undefined | null) => {
      if (!selectedFuelType) {
        return [];
      }
      return fuelUnitOptionsMap[selectedFuelType] || [];
    },
    [fuelUnitOptionsMap]
  );

  const shouldLockIdentifyingFields = useCallback(
    (rowData: RowData) => {
      if (FORM_MODE !== FORM_MODE_PREPOPULATE) {
        return false;
      }

      const locationIdFromRow =
        (rowData.locationId as string | undefined) ||
        locationOptions.find((option) => option.label === rowData.location)
          ?.value;

      const hasOrgActivityMasterData = !!(
        locationIdFromRow &&
        locationsWithOrgActivityMasterData.has(locationIdFromRow)
      );

      const isPrePopulatedRow = rowData._isPrePopulated === 1;

      const isExistingSavedRow =
        rowData._isPrePopulated === 0 || Boolean(rowData.id);

      return hasOrgActivityMasterData || isPrePopulatedRow || isExistingSavedRow;
    },
    [FORM_MODE, locationOptions, locationsWithOrgActivityMasterData]
  );

  const shouldLockFuelType = useCallback(
    (rowData: RowData) => {
      if (FORM_MODE !== FORM_MODE_PREPOPULATE) {
        return false;
      }
      return rowData._isMasterDataValue === 1;
    },
    [FORM_MODE]
  );

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
        name: "Type of Fuel Consumption",
        key: "typeOfFuelPurchased",
        hide: false,
        required: true,
        type: "single-select" as const,
        options: typeOfFuelPurchasedOptions,
        placeholder: "Select Fuel Type",
        resetFields: ["quantityOfFuelConsumedUom"],
        getIsDisabled: shouldLockFuelType,
      },
      {
        name: "Quantity of Fuel Consumption",
        key: "quantityOfFuelConsumed",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: true,
      },
      {
        name: "UoM for Fuel Consumption",
        key: "quantityOfFuelConsumedUom",
        hide: false,
        required: true,
        type: "single-select" as const,
        options: quantityOfFuelConsumedUomOptions,
        /**
         * Dynamic UoM filtering logic:
         * 1. Get the selected fuel type from the current row.
         * 2. Find the internal master data value of that fuel type.
         * 3. Filter the UoM master data using 'uomGrouping' (matching group vs fuel value).
         * 4. This prevents invalid options like 'Kilogram' appearing for 'Diesel'.
         */
        getOptions: (rowData: any) => {
          const selectedFuelLabel = rowData?.typeOfFuelPurchased;

          // If no fuel type selected, return empty array (user must select fuel type first)
          if (!selectedFuelLabel) {
            return [];
          }

          // Find the value of the selected fuel to match against UoM groups
          const fuelValue = typeOfFuelPurchasedOptions.find(
            (f) => f.label === selectedFuelLabel
          )?.value;

          // If no fuel value found or uomGrouping is empty, return empty array
          if (!fuelValue || !uomGrouping || uomGrouping.length === 0) {
            return [];
          }

          // Filter UoM options based on the fuel type's group
          // Only include UoMs where the fuel value is in the group array
          const filtered = uomGrouping
            .filter((uom: any) => {
              const uomGroups = uom.group || [];
              // Check if this UoM belongs to the current fuel type
              return Array.isArray(uomGroups) && uomGroups.includes(fuelValue);
            })
            .map((uom: any) => ({
              label: uom.label || uom.value,
              value: uom.value || uom.label,
            }));

          // Return filtered results (no fallback to avoid showing all options)
          return filtered;
        },
        placeholder: "Select UoM",
      },
      {
        name: "Quality of Fuel",
        key: "qualityOfFuel",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
      },
      {
        name: "Point of Consumption",
        key: "pointOfConsumption",
        hide: false,
        required: false,
        type: "single-select" as const,
        options: pointOfConsumptionOptions,
        placeholder: "Select Point of Consumption",
      },
    ];

    return baseColumns;
  }, [
    locationOptions,
    yearOptions,
    typeOfFuelPurchasedOptions,
    quantityOfFuelConsumedUomOptions,
    pointOfConsumptionOptions,
    uomGrouping,
    shouldLockIdentifyingFields,
    shouldLockFuelType,
  ]);

  return (
    <Box>
      {error ? <Text c="red">{error}</Text> : null}
      <ManualEntryTable
        columns={columns}
        initialData={data}
        onDataChange={handleDataChange}
        onDeleteRows={handleDeleteRows}
        baselineYear={baselineYear}
        financialYearMonth={financialYearMonth}
        getMonthOptions={getMonthOptionsForYear}
        getUomOptions={getUomOptions}
        onClearFieldError={clearFieldError}
        onCancelEdit={() => setError(null)}
        fieldErrors={fieldErrors}
        isValidating={isSaving}
        uploadType={uploadType}
        onUploadTypeChange={setUploadType}
        uploadTypeCounts={uploadTypeCounts}
        globalFilter={globalFilter}
        // Server-side props
        rowCount={rowCount}
        manualPagination
        manualSorting
        manualFiltering
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={handleGlobalFilterChange}
        state={{
          pagination,
          sorting,
          globalFilter,
          isLoading: loading || formModeLoading,
        }}
        // Role-based access control
        isOrganizationAdmin={isOrganizationAdmin}
        showUploadTypeTabs={true}
        hideMandatoryText={true}
        onTableInstanceReady={handleTableInstanceReady}
        // Locking is handled per-row via getIsDisabled on these 4 identifying columns.
        // Covered locations (present in OrgActivityMaster) lock location, year, month,
        // and typeOfFuelPurchased. Uncovered locations added via Add New Entry stay editable.
        alwaysLockedFields={[]}
        prePopulatedLockedFields={undefined}
        disabledWhenPreFilledFields={undefined}
        // Enable inline editing for pre-populated rows
        enableInlineEditForPrePopulated={FORM_MODE === FORM_MODE_PREPOPULATE}
        // Prepopulate mode: hide delete button and checkboxes
        hideDeleteButton={FORM_MODE === FORM_MODE_PREPOPULATE}
        hideCheckboxes={FORM_MODE === FORM_MODE_PREPOPULATE}
        addNewEntryLocationOptions={
          FORM_MODE === FORM_MODE_PREPOPULATE
            ? addNewEntryLocationOptions
            : undefined
        }
        disableAddButton={
          FORM_MODE === FORM_MODE_PREPOPULATE && shouldDisableAddNewEntry
        }
        // Show only "All" tab for fuel consumption
        customTabs={[
          {
            label: "All",
            value: UPLOAD_TYPES.ALL,
            count: allCount,
          },
        ]}
        activeCustomTab={uploadType}
        onCustomTabChange={(tab) => setUploadType(tab as UploadType)}
      />
    </Box>
  );
};

export default FuelConsumptionListing;
