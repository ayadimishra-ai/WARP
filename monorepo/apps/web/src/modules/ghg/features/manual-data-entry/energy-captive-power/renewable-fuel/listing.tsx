"use client";
import { Box, Text } from "@mantine/core";
import axios from "axios";
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import ManualEntryTable from "@/modules/ghg/features/manual-data-entry/Common/ManualEntryTable";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import { Month } from "@/modules/ghg/lib/shared/constants/input.constant";
import { getUserRoleFromToken, ROLE_ORGANIZATION_ADMIN } from "@/modules/ghg/utils/jwt/getUserDataFromToken";
import {
  getMonthOptionsForYear,
  useEnergyCaptivePowerRenewableFuelData,
  useEnergyCaptivePowerRenewableFuelOrgData,
} from "./hooks";

type RowData = Record<string, string | number | null | undefined>;

const CaptivePowerRenewableFuelListing = () => {
  const params = useParams();
  const session = useUserSession();
  const organizationId = params?.organizationId as string;

  
    // Get user role from token to check if organization admin
    const userRole = getUserRoleFromToken(
      params?.accessToken as string | string[] | undefined
    );
    const isOrganizationAdmin =
      Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  // Server-side state management
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const accessToken = params?.accessToken || "";
  const {
    data,
    loading,
    rowCount,
    locationOptions,
    fuelTypeOptions,
    fuelUnitOptions,
    refetch,
  } = useEnergyCaptivePowerRenewableFuelData({
    organizationId,
    userId: session?.userId || "",
    pagination,
    sorting,
    globalFilter,
  });

  const { baselineYear, financialYearMonth } =
    useEnergyCaptivePowerRenewableFuelOrgData();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [previousDataLength, setPreviousDataLength] = useState<number>(0);
  const tableDataRef = useRef<RowData[]>([]);

  const clearFieldError = (fieldKey: string) => {
    setFieldErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldKey];
      // Also try capitalized version
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

    let rowToSave: RowData | null = null;
    let originalRowDataForAPI: RowData | null = null;

    if (newData) {
      // Create operation
      rowToSave = newData[newData.length - 1];
      console.log("Saving new row:", rowToSave);
    } else if (updatedValues && originalData) {
      // Update operation
      rowToSave = updatedValues;
      originalRowDataForAPI = originalData;
      console.log("Row modified:", rowToSave, "Original:", originalRowDataForAPI);
    }

    // Handle saving of manual entry data
    if (rowToSave) {
      try {
        setError(null);
        setFieldErrors({});
        setIsSaving(true);

        // Get organizationAddressId from location name
        const locationName = rowToSave.location as string;
        const organizationAddressId = locationOptions.find(
          (option) => option.label === locationName
        )?.value;

        if (!organizationAddressId) {
          throw new Error(`Location '${locationName}' not found in mapping`);
        }

        // Call API to save only the newly added/modified row
        const apiPayload: any = {
          data: rowToSave, // Send only the newly added/modified row
          organizationAddressId: organizationAddressId,
        };

        // For update operations, include originalData for change detection
        if (originalRowDataForAPI) {
          apiPayload.originalData = originalRowDataForAPI;
        }

        const response = await apiClientWithAuth
          .post(
            `/${organizationId}/embed/v1/${accessToken}/data-import/forms/energy-captive-power/renewable-fuel`,
            apiPayload
          )
          .then((response) => {
            if (response?.statusText == "OK" && response?.status == 200) {
              return response.data;
            }
            throw new Error("API request failed");
          });

        if (response.success) {
          // Check if it's a "no changes" response (for update operations)
          if (response.isNoChange) {
            console.log("No changes detected");
            setIsSaving(false);
            return true;
          }

          // Reset state for new row entry
          setPreviousDataLength(0);

          // Refetch the latest data from the server
          await refetch();
          setIsSaving(false);
          return true;
        } else {
          throw new Error("Save operation failed");
        }
      } catch (err) {
        setIsSaving(false);
        let errorMessage = "An error occurred";

        if (axios.isAxiosError(err)) {
          // Handle API response errors
          const responseData = err.response?.data;

          // Check for field-specific validation errors from API
          if (
            responseData?.validationErrors &&
            Array.isArray(responseData.validationErrors)
          ) {
            // Map field names from API to table column keys
            const fieldKeyMap: Record<string, string> = {
              "Month": "month",
              "Year": "year",
              "Location": "location",
              "Type of Fuel Used": "typeOfFuelUsed",
              "Quantity of Fuel Consumed": "quantityOfFuelConsumed",
              "UoM for the Quantity of Fuel consumed": "UoM_for_the_quantity_of_fuel_consumed",
              "Quality of Fuel": "qualityOfFuel",
              "Unit of Energy Generated in Kwh": "unitOfEnergyGeneratedInKwh",
            };

            const mappedErrors: Record<string, string> = {};
            responseData.validationErrors.forEach((issue: any) => {
              const fieldKey = fieldKeyMap[issue.field] || issue.field;
              mappedErrors[fieldKey] = issue.message;
            });
            
            setFieldErrors(mappedErrors);
            // Don't show error at top if there are field-specific errors
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
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Error saving data:", err);
        return false;
      }
    }
    return false;
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

  // Define table columns
  const columns = useMemo(
    () => [
      {
        name: "Location",
        key: "location",
        hide: false,
        required: true,
        options: locationOptions,
        type: "single-select" as const,
        error: fieldErrors.location,
      },
      {
        name: "Year",
        key: "year",
        hide: false,
        required: true,
        options: yearOptions,
        type: "single-select" as const,
        error: fieldErrors.year,
      },
      {
        name: "Month",
        key: "month",
        hide: false,
        required: true,
        options: Month.map((month) => ({
          value: month.toLowerCase(),
          label: month,
        })),
        type: "single-select" as const,
        error: fieldErrors.month,
      },
      {
        name: "Type of Fuel Used",
        key: "typeOfFuelUsed",
        hide: false,
        required: true,
        options: fuelTypeOptions,
        type: "single-select" as const,
        error: fieldErrors.typeOfFuelUsed,
      },
      {
        name: "Quantity of Fuel Consumed",
        key: "quantityOfFuelConsumed",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: true,
        error: fieldErrors.quantityOfFuelConsumed,
      },
      {
        name: "UoM for the Quantity of Fuel consumed",
        key: "UoM_for_the_quantity_of_fuel_consumed",
        hide: false,
        required: true,
        options: fuelUnitOptions,
        type: "single-select" as const,
        error: fieldErrors.UoM_for_the_quantity_of_fuel_consumed,
      },
      {
        name: "Quality of Fuel",
        key: "qualityOfFuel",
        hide: false,
        required: false,
        type: "number" as const,
        decimalPlaces: true,
        error: fieldErrors.qualityOfFuel,
      },
      {
        name: "Unit of Energy Generated in Kwh",
        key: "unitOfEnergyGeneratedInKwh",
        hide: false,
        required: true,
        type: "number" as const,
        decimalPlaces: false,
        error: fieldErrors.unitOfEnergyGeneratedInKwh,
      },
    ],
    [locationOptions, yearOptions, fuelTypeOptions, fuelUnitOptions, fieldErrors]
  );

  return (
    <Box>
      {error ? <Text c="red">{error}</Text> : null}
      <ManualEntryTable
        columns={columns}
        initialData={data}
        onDataChange={handleDataChange}
        baselineYear={baselineYear}
        financialYearMonth={financialYearMonth}
        getMonthOptions={getMonthOptionsForYear}
        fieldErrors={fieldErrors}
        isValidating={isSaving}
        onClearFieldError={clearFieldError}
        onCancelEdit={() => setError(null)}
        // Server-side props
        rowCount={rowCount}
        manualPagination
        manualSorting
        manualFiltering
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        state={{
          pagination,
          sorting,
          globalFilter,
          isLoading: loading,
        }}
        // Hide upload type tabs (All, AI Uploaded, Manual Entry) - captive power doesn't have AI metadata
        showUploadTypeTabs={false}
        // Role-based access control
        isOrganizationAdmin={isOrganizationAdmin}
      />
    </Box>
  );
};

export default CaptivePowerRenewableFuelListing;
