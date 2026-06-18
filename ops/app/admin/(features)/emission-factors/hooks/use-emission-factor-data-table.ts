import { ComboboxItem } from "@mantine/core";
import { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { URL_EMMISION_FACTOR } from "~/app/admin/api/api-routes";
import {
  Co2EmissionFactorMasterListData,
  Co2EmissionFactorMaterialMasterListData,
  TGetUserConversionFactorsSuccess,
} from "~/app/admin/libs/common/types";
import {
  useOPFetcher_GET,
  useOPFetcher_POST,
} from "~/app/admin/libs/fetcher/use-fetcher";
import {
  ManageCommonEmissionFactorDataQuery,
  ManageMaterialEmissionFactorDataQuery,
} from "~/graphql/shared/types";
import { minimumYearforEmissionFactor } from "~/shared/constants/input.constant";
import {
  sanitize_compare_str_v1,
  sanitize_compare_str_v3,
} from "~/utils/comapre.util";
import { months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

const regularExpressionForFactorUOM = /^(?!.*\/\/)[A-Za-z0-9/-]+$/;
const validationErrormessageForFactorUOM = "Invalid unit entered.";

const emissionFactorValidationSchema = (
  isUpdate: boolean,
  isMaterial: boolean,
  geographyData: ComboboxItem[],
  organizationData: ComboboxItem[],
  Category: string
) => {
  return z.object({
    id: isUpdate ? z.string() : z.string().optional(),
    year: z
      .string()
      .min(1, "Year is required")
      .transform((val) => Number(val))
      .refine(
        (val) =>
          !isNaN(Number(val)) &&
          Number(val) > 0 &&
          Number(val) <= new Date().getFullYear() &&
          Number(val) >= minimumYearforEmissionFactor,
        {
          message: `Year should be between ${minimumYearforEmissionFactor} and ${new Date().getFullYear()}`,
        }
      ),
    month: z
      .string()
      .min(1, "Month is required")
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && months[val - 1] !== undefined, {
        message: "Invalid Month",
      }),
    geography: z
      .string()
      .min(1, "Geography is required")
      .refine(
        (val) => {
          if (!!val) {
            if (
              geographyData.filter((items) => items.value === val).length === 0
            ) {
              return false;
            }
          }
          return true;
        },
        {
          message: "Invalid geography selected",
        }
      ),
    category: z.string().min(1, "Category is required"),
    activity: z.string().min(1, "Activity is required"),
    sub_activity:
      isMaterial || Category === "Fugitive"
        ? z.string().optional()
        : z.string().min(1, "Sub Activity is required"),
    type: z.string().nullable().optional(),
    sub_type: z.string().nullable().optional(),
    factor: z
      .string()
      .refine(
        (val) => {
          if (!!val) {
            if (isNaN(Number(val)) || Number(val) < 0) {
              return false;
            }
          } else {
            return false;
          }
          return true;
        },
        {
          message: "Factor is required",
        }
      )
      .transform((val) => Number(val)),
    factor_uom: z
      .string()
      .min(1, "Factor UOM is required")
      .refine(
        (val) => {
          if (!!val && !regularExpressionForFactorUOM.test(val)) {
            return false;
          }
          return true;
        },
        {
          message: validationErrormessageForFactorUOM,
        }
      ),
    isDefault: isMaterial
      ? z.string().optional()
      : z.string().refine((val) => val === "Yes" || val === "No", {
          message: "Default must be either Yes or No",
        }),
    activitySpecific: z.string().nullable().optional(),
    organization_id: isMaterial
      ? z
          .string()
          .min(1, "Organization is required")
          .refine(
            (val) => {
              if (!!val) {
                if (
                  organizationData.filter((items) => items.value === val)
                    .length === 0
                ) {
                  return false;
                }
              } else {
                return false;
              }
              return true;
            },
            {
              message: "Invalid Organization selected",
            }
          )
      : z.string().optional(),
  });
};
const buildFilterParams = (filters: Array<{ id: string; value: any }>) => {
  const params = new URLSearchParams();
  filters.forEach((filter) => {
    if (
      filter.value !== undefined &&
      filter.value !== null &&
      filter.value !== ""
    ) {
      params.append(`filter_${filter.id}`, String(filter.value));
    }
  });
  return params.toString();
};
export const useEmissionFactorDataTable = (
  isMaterial: boolean,
  activeTab: string,
  initialPagination: { pageIndex: number; pageSize: number },
  globalFilter?: string
) => {
  const [pagination, setPagination] = useState(initialPagination);
  const [totalCount, setTotalCount] = useState(0);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>(
    () => []
  );
  const [columnFilters, setColumnFilters] = useState<
    Array<{ id: string; value: any }>
  >(() => []);

  const { data, loading, error, refetch } = useOPFetcher_GET<{
    success: boolean;
    data: {
      emissionFactorList: Co2EmissionFactorMasterListData[];
      pagination: {
        totalCount: number;
        pageIndex: number;
        pageSize: number;
      };
      emissionFactorPageAllRequiredData: ManageCommonEmissionFactorDataQuery;
    };
    error: any;
  }>(
    `${URL_EMMISION_FACTOR}?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&sortBy=${sorting.length > 0 ? sorting[0].id : ""}&sortDirection=${sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : ""}&${buildFilterParams(columnFilters)}${globalFilter ? `&globalFilter=${encodeURIComponent(globalFilter)}` : ""}`
  );

  const {
    loading: isSaving,
    error: saveError,
    execute: saveEmissionFactor,
  } = useOPFetcher_POST<TGetUserConversionFactorsSuccess>(URL_EMMISION_FACTOR);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  useEffect(() => {
    if (!isMaterial) {
      refetch();
    }
  }, [activeTab, isMaterial, refetch]);

  useEffect(() => {
    if (!!data) {
      setTotalCount(data?.data?.pagination.totalCount);
    }
  }, [data]);

  useEffect(() => {
    if (!isMaterial) {
      refetch();
    }
  }, [sorting, columnFilters, globalFilter, refetch, isMaterial]);

  //#region data loading on useMemo
  const dbDropDownSelectData = useMemo<{
    geography: ComboboxItem[];
  }>(() => {
    let geographyData: ComboboxItem[] = [];
    if (loading || data == null || !data?.success) {
      return {
        geography: geographyData,
      };
    }
    const otherGeographyData =
      data?.data?.emissionFactorPageAllRequiredData?.EmissionFactorGeographyHierarchy.map(
        (items) => {
          return {
            label: items.geography,
            value: items.geography,
          };
        }
      );
    const countrydata =
      data?.data?.emissionFactorPageAllRequiredData?.EmissionFactorGeographyHierarchy.map(
        (items) => {
          return {
            label: items.Country?.name,
            value: items.Country?.name,
          };
        }
      );
    geographyData = [...otherGeographyData, ...countrydata].filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item))
    );
    return { geography: geographyData };
  }, [data, loading]);
  //#endregion

  //#region columns for Common Emission Factor Table
  const commonEmissionFactorTableColumns = useMemo<
    MRT_ColumnDef<Co2EmissionFactorMasterListData>[]
  >(() => {
    return [
      {
        accessorKey: "id",
        header: "Id",
      },
      {
        accessorKey: "geography", //access nested data with dot notation
        header: "Geography",
        editVariant: "select",
        enableRowSelection: false,
        mantineEditSelectProps: ({ cell, row }) => ({
          disabled: isSaving,
          required: true,
          data: dbDropDownSelectData?.geography,
          searchable: true,
          error: validationErrors?.geography,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              geography: undefined,
            }),
        }),
      },
      {
        accessorKey: "year",
        header: "Year",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          disabled: isSaving,
          min: minimumYearforEmissionFactor,
          max: new Date().getFullYear(),
          error: validationErrors?.year,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              year: undefined,
            }),
        },
      },
      {
        accessorKey: "month", //access nested data with dot notation
        editVariant: "select",
        header: "Month",
        enableRowSelection: false,
        Cell: ({ cell, row }) => months[Number(cell.getValue()) - 1],
        filterFn: (row, id, filterValue) => {
          return months[Number(row.getValue(id)) - 1]
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        },
        mantineEditSelectProps: {
          disabled: isSaving,
          required: true,
          data: months.map((m, index) => ({
            label: m,
            value: String(index + 1),
          })),
          searchable: true,
          error: validationErrors?.month,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              month: undefined,
            }),
        },
      },
      {
        accessorKey: "category", //access nested data with dot notation
        header: "Category",
        editVariant: "select",
        enableRowSelection: false,
        mantineEditSelectProps: {
          disabled: isSaving,
          required: true,
          data: data?.data?.emissionFactorPageAllRequiredData?.Activity?.filter(
            (items) => !!items?.metadata?.showinEmissionTable
          ).map((items) => {
            return {
              label: items.metadata?.ui?.listing?.column_name,
              value: items.metadata?.ui?.listing?.column_name,
            };
          }),
          searchable: true,
          error: validationErrors?.category,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              category: undefined,
            }),
        },
      },
      {
        accessorKey: "activity",
        header: "Activity",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isSaving,
          error: validationErrors?.activity,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              activity: undefined,
            }),
        },
      },
      {
        accessorKey: "sub_activity",
        header: "Sub Activity",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isSaving,
          error: validationErrors?.sub_activity,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              sub_activity: undefined,
            }),
        },
      },
      {
        accessorKey: "activitySpecific",
        header: "Activity Specific",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isSaving,
          error: validationErrors?.activitySpecific,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              activitySpecific: undefined,
            }),
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          disabled: isSaving,
          error: validationErrors?.type,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              type: undefined,
            }),
        },
      },
      {
        accessorKey: "sub_type",
        header: "Sub Type",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          disabled: isSaving,
          error: validationErrors?.sub_type,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              sub_type: undefined,
            }),
        },
      },
      {
        accessorKey: "factor",
        header: "Factor",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          disabled: isSaving,
          error: validationErrors?.factor,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              factor: undefined,
            }),
        },
      },
      {
        accessorKey: "factor_uom",
        header: "Factor UOM",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isSaving,
          error: validationErrors?.factor_uom,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          onChange: (event) => {
            const value = event.currentTarget.value;

            // Check if the value matches the regex pattern
            if (!!value && !regularExpressionForFactorUOM.test(value)) {
              setValidationErrors({
                ...validationErrors,
                factor_uom: validationErrormessageForFactorUOM,
              });
            } else {
              // Clear the error if validation passes
              setValidationErrors({
                ...validationErrors,
                factor_uom: undefined,
              });
            }
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              factor_uom: undefined,
            }),
        },
      },
      {
        accessorKey: "isDefault", //access nested data with dot notation
        header: "Default",
        editVariant: "select",
        enableRowSelection: false,
        Cell: ({ cell, row }) => row.original.isDefault,
        mantineEditSelectProps: ({ cell, row }) => ({
          disabled: isSaving,
          data: [
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ],
          searchable: true,
          error: validationErrors?.isDefault,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              isDefault: undefined,
            }),
        }),
      },
    ];
  }, [
    dbDropDownSelectData,
    validationErrors,
    data?.data?.emissionFactorPageAllRequiredData?.Activity,
    isSaving,
  ]);
  //#endregion

  //#region upsert Emission Factor Row Data
  const upsertEmissionFactorRowData = async ({
    table,
    row,
    values: _values,
    exitEditingMode,
  }: {
    table: MRT_TableInstance<Co2EmissionFactorMasterListData>;
    row: MRT_Row<Co2EmissionFactorMasterListData>;
    values: any;
    exitEditingMode: () => void;
  }) => {
    let hasChanges = false;
    let allClear = true;
    if (!!row?.original?.id) {
      Object.keys(_values).forEach((key) => {
        if (
          row?.original[key as keyof Co2EmissionFactorMasterListData] !==
          _values[key as keyof Co2EmissionFactorMasterListData]
        ) {
          if (hasChanges === false) {
            hasChanges = true;
          }
        }
      });
    } else {
      hasChanges = true;
    }

    if (hasChanges) {
      _values.id = row?.original?.id;
      _values.year = String(_values.year);
      _values.month = String(_values.month);
      _values.factor = String(_values.factor);
      _values.isDefault = !!_values.isDefault ? _values.isDefault : "No";
      const parseResult = emissionFactorValidationSchema(
        !!row?.original?.id,
        false,
        dbDropDownSelectData?.geography,
        [],
        _values.category
      ).safeParse(_values);
      if (!parseResult.success) {
        allClear = false;
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>).forEach(
          (key) => {
            setValidationErrors((prev) => ({
              ...prev,
              [key]: fieldErrors[key]?.[0],
            }));
          }
        );
      } else {
        const alreadyExistingRow = data?.data?.emissionFactorList.filter(
          (items) => {
            if (
              items.year == Number(_values.year) &&
              Number(items.month) == Number(_values.month) &&
              sanitize_compare_str_v3(
                String(items.geography),
                String(_values.geography)
              ) &&
              sanitize_compare_str_v3(
                String(items.category),
                String(_values.category)
              ) &&
              sanitize_compare_str_v3(
                String(items.activity),
                String(_values.activity)
              ) &&
              sanitize_compare_str_v3(
                String(items.sub_activity),
                String(_values.sub_activity)
              ) &&
              sanitize_compare_str_v3(
                String(items.type),
                String(_values.type)
              ) &&
              sanitize_compare_str_v3(
                String(items.sub_type),
                String(_values.sub_type)
              ) &&
              items.factor === Number(_values.factor) &&
              sanitize_compare_str_v1(
                String(items.factor_uom),
                String(_values.factor_uom)
              ) &&
              items.id !== row?.original?.id
            ) {
              if (!!items?.metadata && items?.metadata?.length > 0) {
                if (!!items?.metadata[0]["Default"]) {
                  if (items?.metadata[0]["Default"] == _values.isDefault) {
                    if (
                      !!items?.metadata[0]["Activity Specific"] ||
                      items?.metadata[0]["Activity Specific"] == ""
                    ) {
                      if (
                        sanitizeString.v3(
                          items?.metadata[0]["Activity Specific"]
                        ) == sanitizeString.v3(_values.activitySpecific)
                      ) {
                        return items;
                      }
                    }
                  }
                } else {
                  if (
                    !!items?.metadata[0]["Activity Specific"] ||
                    items?.metadata[0]["Activity Specific"] == ""
                  ) {
                    if (
                      sanitizeString.v3(
                        items?.metadata[0]["Activity Specific"]
                      ) == sanitizeString.v3(_values.activitySpecific)
                    ) {
                      return items;
                    }
                  }
                }
              } else {
                return items;
              }
            }
          }
        );
        if (alreadyExistingRow != null && alreadyExistingRow.length > 0) {
          allClear = false;
          (Object.keys(_values) as Array<keyof typeof _values>).forEach(
            (key) => {
              setValidationErrors((prev) => ({
                ...prev,
                [key]: "Already Exist",
              }));
            }
          );
        } else {
          if (_values.isDefault === "Yes") {
            const alreadyExistingRowforDefaultValue =
              data?.data?.emissionFactorList.filter((items) => {
                if (
                  items.year == Number(_values.year) &&
                  Number(items.month) == Number(_values.month) &&
                  sanitize_compare_str_v3(
                    String(items.geography),
                    String(_values.geography)
                  ) &&
                  sanitize_compare_str_v3(
                    String(items.category),
                    String(_values.category)
                  ) &&
                  sanitize_compare_str_v3(
                    String(items.activity),
                    String(_values.activity)
                  ) &&
                  sanitize_compare_str_v3(
                    String(items.sub_activity),
                    String(_values.sub_activity)
                  ) &&
                  sanitize_compare_str_v3(
                    String(items.type),
                    String(_values.type)
                  ) &&
                  sanitize_compare_str_v3(
                    String(items.sub_type),
                    String(_values.sub_type)
                  ) &&
                  sanitize_compare_str_v1(
                    String(items.factor_uom),
                    String(_values.factor_uom)
                  ) &&
                  items.id !== row?.original?.id
                ) {
                  if (!!items?.metadata && items?.metadata?.length > 0) {
                    if (
                      !!items?.metadata[0]["Activity Specific"] ||
                      items?.metadata[0]["Activity Specific"] == ""
                    ) {
                      if (
                        sanitizeString.v3(
                          items?.metadata[0]["Activity Specific"]
                        ) == sanitizeString.v3(_values.activitySpecific)
                      ) {
                        return items;
                      }
                    }
                  } else {
                    return items;
                  }
                }
              });
            if (
              !!alreadyExistingRowforDefaultValue &&
              alreadyExistingRowforDefaultValue?.length > 0
            ) {
              if (
                alreadyExistingRowforDefaultValue.filter(
                  (items) =>
                    !!items?.metadata &&
                    items?.metadata[0]["Default"] == _values.isDefault
                ).length > 0
              ) {
                allClear = false;
                (Object.keys(_values) as Array<keyof typeof _values>).forEach(
                  (key) => {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [key]:
                        key == "geography"
                          ? "Duplicate record is not allowed"
                          : !!_values[key]
                            ? "Duplicate record is not allowed"
                            : "",
                    }));
                  }
                );
              }
            }
          }
        }
      }
    }
    if (hasChanges && allClear) {
      await saveEmissionFactor({ data: _values, isMaterial: false });
      await refetch();
      setValidationErrors({});
    }
    if (allClear) {
      exitEditingMode();
    }
  };
  //#endregion

  return {
    commonEmissionFactorTableColumns,
    handleCreateNewEmissionFactor: async ({
      table,
      row,
      values,
      exitCreatingMode,
    }: {
      table: MRT_TableInstance<Co2EmissionFactorMasterListData>;
      row: MRT_Row<Co2EmissionFactorMasterListData>;
      values: any;
      exitCreatingMode: () => void;
    }) => {
      console.log({ row, table, values });
      await upsertEmissionFactorRowData({
        exitEditingMode: exitCreatingMode,
        row,
        table,
        values,
      });
    },
    handleEditRowSave: async ({
      table,
      row,
      values,
      exitEditingMode,
    }: {
      table: MRT_TableInstance<Co2EmissionFactorMasterListData>;
      row: MRT_Row<Co2EmissionFactorMasterListData>;
      values: any;
      exitEditingMode: () => void;
    }) => {
      await upsertEmissionFactorRowData({
        exitEditingMode,
        row,
        table,
        values,
      });
    },
    validationErrors,
    setValidationErrors,
    loading,
    commonEmissionFactorData: data?.data,
    isSaving,
    pagination,
    setPagination,
    totalCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
  };
};

export const useMaterialEmissionFactorDataTable = (
  isMaterial: boolean,
  orgId: string,
  activeTab: string,
  initialPagination: { pageIndex: number; pageSize: number },
  globalFilter?: string
) => {
  const [pagination, setPagination] = useState(initialPagination);
  const [totalCount, setTotalCount] = useState(0);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>(
    () => []
  );
  const [columnFilters, setColumnFilters] = useState<
    Array<{ id: string; value: any }>
  >(() => []);
  const {
    data,
    loading: materialLoading,
    error,
    refetch,
  } = useOPFetcher_GET<{
    success: boolean;
    data: {
      materialEmissionFactorList: Co2EmissionFactorMaterialMasterListData[];
      pagination: {
        totalCount: number;
        pageIndex: number;
        pageSize: number;
      };
      emissionFactorPageAllRequiredData: ManageMaterialEmissionFactorDataQuery;
    };
    error: any;
  }>(
    `${URL_EMMISION_FACTOR}?organization_id=${orgId}&pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&sortBy=${sorting.length > 0 ? sorting[0].id : ""}&sortDirection=${sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : ""}&${buildFilterParams(columnFilters)}${globalFilter ? `&globalFilter=${encodeURIComponent(globalFilter)}` : ""}`
  );

  const {
    loading: isMaterialSaving,
    error: saveError,
    execute: saveEmissionFactor,
  } = useOPFetcher_POST<TGetUserConversionFactorsSuccess>(URL_EMMISION_FACTOR);

  const [materialValidationErrors, setMaterialValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  useEffect(() => {
    if (isMaterial) {
      refetch();
    }
  }, [activeTab, orgId, isMaterial, refetch]);

  useEffect(() => {
    if (isMaterial) {
      refetch();
    }
  }, [sorting, columnFilters, globalFilter, refetch, isMaterial]);

  useEffect(() => {
    if (!!data) {
      setTotalCount(data?.data?.pagination.totalCount);
    }
  }, [data]);
  //#region master loading on useMemo
  const dbDropDownSelectData = useMemo<{
    geography: ComboboxItem[];
    organization: ComboboxItem[];
  }>(() => {
    let geographyData: ComboboxItem[] = [];
    let organizationData: ComboboxItem[] = [];
    if (materialLoading || data == null || !data?.success) {
      return {
        geography: geographyData,
        organization: organizationData,
      };
    }
    const otherGeographyData =
      data?.data?.emissionFactorPageAllRequiredData?.EmissionFactorGeographyHierarchy.map(
        (items) => {
          return {
            label: items.geography,
            value: items.geography,
          };
        }
      );
    const countrydata =
      data?.data?.emissionFactorPageAllRequiredData?.EmissionFactorGeographyHierarchy.map(
        (items) => {
          return {
            label: items.Country?.name,
            value: items.Country?.name,
          };
        }
      );
    geographyData = [...otherGeographyData, ...countrydata].filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item))
    );
    organizationData =
      data?.data?.emissionFactorPageAllRequiredData?.Organization.map(
        (items) => {
          return {
            label: items.name,
            value: items.id,
          };
        }
      );
    return {
      geography: geographyData,
      organization: organizationData,
    };
  }, [data, materialLoading]);
  //#endregion

  //#region columns for Material Emission Factor Table
  const materialEmissionFactorTableColumns = useMemo<
    MRT_ColumnDef<Co2EmissionFactorMaterialMasterListData>[]
  >(() => {
    return [
      {
        accessorKey: "id",
        header: "Id",
      },
      {
        accessorKey: "geography", //access nested data with dot notation
        header: "Geography",
        editVariant: "select",
        enableRowSelection: false,
        mantineEditSelectProps: ({ cell, row }) => ({
          disabled: isMaterialSaving,
          required: true,
          data: dbDropDownSelectData?.geography,
          searchable: true,
          error: materialValidationErrors?.geography,
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              geography: undefined,
            }),
        }),
      },
      {
        accessorKey: "year",
        header: "Year",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          disabled: isMaterialSaving,
          min: minimumYearforEmissionFactor,
          max: new Date().getFullYear(),
          error: materialValidationErrors?.year,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              year: undefined,
            }),
        },
      },
      {
        accessorKey: "month", //access nested data with dot notation
        editVariant: "select",
        header: "Month",
        enableRowSelection: false,
        Cell: ({ cell, row }) => months[Number(cell.getValue()) - 1],
        filterFn: (row, id, filterValue) => {
          return months[Number(row.getValue(id)) - 1]
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        },
        mantineEditSelectProps: {
          disabled: isMaterialSaving,
          required: true,
          data: months.map((m, index) => ({
            label: m,
            value: String(index + 1),
          })),
          searchable: true,
          error: materialValidationErrors?.month,
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              month: undefined,
            }),
        },
      },
      {
        accessorKey: "activity",
        header: "Activity",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isMaterialSaving,
          error: materialValidationErrors?.activity,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              activity: undefined,
            }),
        },
      },
      {
        accessorKey: "activitySpecific",
        header: "Activity Specific",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isMaterialSaving,
          error: materialValidationErrors?.activitySpecific,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              activitySpecific: undefined,
            }),
        },
      },
      {
        accessorKey: "factor",
        header: "Factor",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          disabled: isMaterialSaving,
          error: materialValidationErrors?.factor,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              factor: undefined,
            }),
        },
      },
      {
        accessorKey: "factor_uom",
        header: "Factor UOM",
        editVariant: "text",
        enableRowSelection: false,
        mantineEditTextInputProps: {
          required: true,
          disabled: isMaterialSaving,
          error: materialValidationErrors?.factor_uom,
          styles: {
            wrapper: {
              width: "100%",
            },
          },
          onChange: (event) => {
            const value = event.currentTarget.value;

            // Check if the value matches the regex pattern
            if (!!value && !regularExpressionForFactorUOM.test(value)) {
              setMaterialValidationErrors({
                ...materialValidationErrors,
                factor_uom: validationErrormessageForFactorUOM,
              });
            } else {
              // Clear the error if validation passes
              setMaterialValidationErrors({
                ...materialValidationErrors,
                factor_uom: undefined,
              });
            }
          },
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setMaterialValidationErrors({
              ...materialValidationErrors,
              factor_uom: undefined,
            }),
        },
      },
    ];
  }, [dbDropDownSelectData, materialValidationErrors, isMaterialSaving]);
  //#endregion

  //#region upsert Material Emission Factor Row Data
  const upsertMaterialEmissionFactorRowData = async ({
    table,
    row,
    values: _values,
    exitEditingMode,
  }: {
    table: MRT_TableInstance<Co2EmissionFactorMaterialMasterListData>;
    row: MRT_Row<Co2EmissionFactorMaterialMasterListData>;
    values: any;
    exitEditingMode: () => void;
  }) => {
    let hasChanges = false;
    let allClear = true;
    if (!!row?.original?.id) {
      Object.keys(_values).forEach((key) => {
        if (
          row?.original[
            key as keyof Co2EmissionFactorMaterialMasterListData
          ] !== _values[key as keyof Co2EmissionFactorMaterialMasterListData]
        ) {
          if (hasChanges === false) {
            hasChanges = true;
          }
        }
      });
    } else {
      hasChanges = true;
    }

    if (hasChanges) {
      _values.id = row?.original?.id;
      _values.category = "Material";
      _values.year = String(_values.year);
      _values.month = String(_values.month);
      _values.factor = String(_values.factor);
      _values.organization_id = orgId;
      const parseResult = emissionFactorValidationSchema(
        !!row?.original?.id,
        true,
        dbDropDownSelectData?.geography,
        dbDropDownSelectData?.organization,
        _values.category
      ).safeParse(_values);
      if (!parseResult.success) {
        allClear = false;
        const fieldErrors = parseResult.error.flatten().fieldErrors;
        (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>).forEach(
          (key) => {
            setMaterialValidationErrors((prev) => ({
              ...prev,
              [key]: fieldErrors[key]?.[0],
            }));
          }
        );
      } else {
        const alreadyExistingRow =
          data?.data?.materialEmissionFactorList.filter((items) => {
            if (
              items.year == Number(_values.year) &&
              Number(items.month) == Number(_values.month) &&
              sanitize_compare_str_v3(
                String(items.geography),
                String(_values.geography)
              ) &&
              sanitize_compare_str_v3(
                String(items.activity),
                String(_values.activity)
              ) &&
              sanitize_compare_str_v1(
                String(items.factor_uom),
                String(_values.factor_uom)
              ) &&
              items.id !== row?.original?.id &&
              items?.organization_id === _values.organization_id
            ) {
              if (!!items?.metadata && items?.metadata?.length > 0) {
                if (
                  !!items?.metadata[0]["Activity Specific"] ||
                  items?.metadata[0]["Activity Specific"] == ""
                ) {
                  if (
                    sanitizeString.v3(
                      items?.metadata[0]["Activity Specific"]
                    ) == sanitizeString.v3(_values.activitySpecific)
                  ) {
                    return items;
                  }
                }
              } else {
                return items;
              }
            }
          });
        if (alreadyExistingRow != null && alreadyExistingRow.length > 0) {
          allClear = false;
          (Object.keys(_values) as Array<keyof typeof _values>).forEach(
            (key) => {
              setMaterialValidationErrors((prev) => ({
                ...prev,
                [key]: "Already Exist",
              }));
            }
          );
        }
      }
    }
    if (hasChanges && allClear) {
      await saveEmissionFactor({ data: _values, isMaterial: true });
      await refetch();
      setMaterialValidationErrors({});
    }
    if (allClear) {
      exitEditingMode();
    }
  };
  //#endregion
  return {
    materialEmissionFactorTableColumns,
    handleCreateNewMaterialEmissionFactor: async ({
      table,
      row,
      values,
      exitCreatingMode,
    }: {
      table: MRT_TableInstance<Co2EmissionFactorMaterialMasterListData>;
      row: MRT_Row<Co2EmissionFactorMaterialMasterListData>;
      values: any;
      exitCreatingMode: () => void;
    }) => {
      await upsertMaterialEmissionFactorRowData({
        exitEditingMode: exitCreatingMode,
        row,
        table,
        values,
      });
    },
    handleEditMaterialRowSave: async ({
      table,
      row,
      values,
      exitEditingMode,
    }: {
      table: MRT_TableInstance<Co2EmissionFactorMaterialMasterListData>;
      row: MRT_Row<Co2EmissionFactorMaterialMasterListData>;
      values: any;
      exitEditingMode: () => void;
    }) => {
      await upsertMaterialEmissionFactorRowData({
        exitEditingMode,
        row,
        table,
        values,
      });
    },
    setMaterialValidationErrors,
    materialLoading,
    materialEmissionFactorData: data?.data,
    isMaterialSaving,
    pagination,
    setPagination,
    totalCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
  };
};
