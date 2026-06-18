import { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "mantine-react-table";
import { useMemo, useState } from "react";
import { z } from "zod";
import { URL_UOM_CONVERSION } from "@/app/ghg//admin/api/api-routes";
import { TGetUserConversionFactorsSuccess } from "@/app/ghg//admin/libs/common/types";
import {
  useOPFetcher_GET,
  useOPFetcher_POST,
} from "@/app/ghg//admin/libs/fetcher/use-fetcher";

export const useDataTable = () => {
  const { data, loading, error, refetch } =
    useOPFetcher_GET<TGetUserConversionFactorsSuccess>(URL_UOM_CONVERSION);

  const {
    loading: isSaving,
    error: saveError,
    execute: saveNewUomConversion,
  } = useOPFetcher_POST<TGetUserConversionFactorsSuccess>(URL_UOM_CONVERSION);

  // console.log({ saveError, error });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const uomSelectData = useMemo(() => {
    if (loading || data == null || !data.success) return [];

    const { uomConversionFactors, uomMasters } = data.data;

    if (!uomMasters || uomMasters.length === 0) return [];

    const _uoms: Record<string, string> = {};

    // Add master data - use label as both key and value since that's what's stored in the row data
    uomMasters.forEach((u) => {
      if (u.code && u.label) {
        _uoms[u.code] = u.label;
      }
    });

    // Add any additional UOMs from existing data
    uomConversionFactors.forEach((d) => {
      if (d.from_uom_code && !_uoms[d.from_uom_code]) {
        _uoms[d.from_uom_code] = d.from_uom;
      }

      if (d.to_uom_code && !_uoms[d.to_uom_code]) {
        _uoms[d.to_uom_code] = d.to_uom;
      }
    });

    return Object.entries(_uoms).map(([value, label]) => ({
      label: label,
      value: label,
      original: { label, value },
    }));
  }, [data, loading]);

  const fuelsSelectData = useMemo(() => {
    if (loading || data == null || !data.success) return [];

    const { uomConversionFactors } = data.data;
    if (!uomConversionFactors || uomConversionFactors.length < 1) return;

    const fuelsSet = new Set<string>();

    uomConversionFactors.forEach((d) => {
      if (d.fuel) {
        fuelsSet.add(d.fuel);
      }
    });

    return Array.from(fuelsSet).map((fuel) => ({
      label: fuel,
      value: fuel,
    }));
  }, [data, loading]);

  type DataType =
    TGetUserConversionFactorsSuccess["data"]["uomConversionFactors"][0];

  const columns = useMemo<MRT_ColumnDef<DataType>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Id",
      },
      {
        accessorKey: "from_uom", //access nested data with dot notation
        header: "From UOM",
        editVariant: "select",
        mantineEditSelectProps: {
          disabled: isSaving,
          required: true,
          data: uomSelectData,
          searchable: true,
          error: validationErrors?.from_uom,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              from_uom: undefined,
            }),
        },
      },
      {
        accessorKey: "to_uom",
        editVariant: "select",
        header: "To UOM",
        mantineEditSelectProps: {
          disabled: isSaving,
          required: true,
          data: uomSelectData,
          error: validationErrors?.to_uom,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              to_uom: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "factor",
        header: "Factor",
        editVariant: "text",
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          disabled: isSaving,
          error: validationErrors?.factor,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              factor: undefined,
            }),
        },
      },
      {
        accessorKey: "fuel",
        header: "Fuel",
        editVariant: "select",
        mantineEditSelectProps: {
          disabled: isSaving,
          type: "select",
          data: fuelsSelectData,
          error: validationErrors?.fuel,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              fuel: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
    ];
  }, [uomSelectData, validationErrors, fuelsSelectData]);

  const UomValidationSchema = z.object({
    from_uom: z.string().min(1, "From UOM is required"),
    to_uom: z.string().min(1, "To UOM is required"),
    factor: z.number().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Factor must be a positive number",
    }),
    fuel: z.string().optional().nullable(),
  });

  const upsertUOMConversion = async ({
    table,
    row,
    values: _values,
    exitEditingMode,
  }: {
    table: MRT_TableInstance<DataType>;
    row: MRT_Row<DataType>;
    values: any;
    exitEditingMode: () => void;
  }) => {
    try {
      const original = row.original;
      const id = original.id;
      const uomConversionFactors = data?.data.uomConversionFactors;
      const uomMasters = data?.data.uomMasters;
      const requestType = id ? "Update" : "Create";
      let values: z.infer<typeof UomValidationSchema> = {
        ..._values,
        factor: Number(_values.factor),
      };

      // Check if values are updated or not if not then return
      if (
        original.from_uom === values.from_uom &&
        original.to_uom === values.to_uom &&
        original.fuel === values.fuel &&
        original.factor === values.factor
      ) {
        return;
      }

      // Validate values
      const validationResult = UomValidationSchema.safeParse(values);
      if (!validationResult.success) {
        const errors: Record<string, string | undefined> = {};
        const formatedErrors = validationResult.error.format();
        Object.entries(formatedErrors).forEach(([key, value]) => {
          if (key !== "_errors") {
            errors[key] = (value as any)._errors?.[0];
          }
        });
        setValidationErrors(errors);
        return;
      }

      values = validationResult.data;

      const exists = uomConversionFactors
        ?.filter((d) => d.id !== id)
        .find((d) => {
          const valueFuel = values.fuel || "";
          const existingFuel = d.fuel || "";

          return (
            d.from_uom === values.from_uom &&
            d.to_uom === values.to_uom &&
            existingFuel === valueFuel &&
            Number(d.factor) === Number(values.factor)
          );
        });

      if (exists) {
        setValidationErrors({
          from_uom: "Conversion factor already exists.",
          to_uom: "Conversion factor already exists.",
          fuel: "Conversion factor already exists.",
          factor: "Conversion factor already exists.",
        });
        return null;
      }

      let updateData: any = null;
      let insertData: any = null;

      if (requestType === "Create") {
        const hasFuel = values.fuel;

        if (!hasFuel) {
          insertData = {
            from_key:
              uomMasters?.find((u) => u.label === values.from_uom)?.code || "",
            to_key:
              uomMasters?.find((u) => u.label === values.to_uom)?.code || "",
            factor: Number(values.factor),
          };
        } else {
          const searchRecordToBeUpdated = uomConversionFactors?.find(
            (d) =>
              d.from_uom === values.from_uom &&
              d.to_uom === values.to_uom &&
              Number(d.factor) === Number(values.factor) &&
              !!d.fuel
          );

          if (searchRecordToBeUpdated) {
            const fuels = Array.from(
              new Set([
                ...(searchRecordToBeUpdated.original.metadata?.fuels || []),
                values.fuel,
              ])
            );

            updateData = {
              id: searchRecordToBeUpdated.original.id,
              from_key: searchRecordToBeUpdated.original.from_key,
              to_key: searchRecordToBeUpdated.original.to_key,
              factor: searchRecordToBeUpdated.original.factor,
              metadata: {
                fuels,
              },
            };
          } else {
            insertData = {
              from_key:
                uomMasters?.find((u) => u.label === values.from_uom)?.code ||
                "",
              to_key:
                uomMasters?.find((u) => u.label === values.to_uom)?.code || "",
              factor: Number(values.factor),
              metadata: { fuels: [values.fuel] },
            };
          }
        }
      } else if (requestType === "Update") {
        const originalFuels = original?.original.metadata?.fuels || [];
        const originalHasMultipleFuels = originalFuels.length > 1;
        const originalHasSingleFuel = originalFuels.length === 1;
        const originalHasNoFuels = originalFuels.length === 0;

        const id = row.original.original.id;
        const from_key =
          uomMasters?.find((u) => u.label === values.from_uom)?.code || "";
        const to_key =
          uomMasters?.find((u) => u.label === values.to_uom)?.code || "";
        const factor = Number(values.factor);

        if (originalHasNoFuels || originalHasSingleFuel) {
          const fuels = values.fuel ? [values.fuel] : [];
          updateData = {
            id,
            from_key,
            to_key,
            factor,
            metadata: { fuels },
          };
        }

        if (originalHasMultipleFuels) {
          const isFromToFactorUpdated =
            values.factor != original.factor ||
            values.from_uom != original.from_uom ||
            values.to_uom != original.to_uom;

          const isFuelUpdated = values.fuel != original.fuel;

          if (isFromToFactorUpdated) {
            let fuels = values.fuel ? [values.fuel] : [];
            insertData = { from_key, to_key, factor, metadata: { fuels } };

            fuels = originalFuels.filter((f: string) => f !== original.fuel);
            updateData = { id, from_key, to_key, factor, metadata: { fuels } };
          } else if (isFuelUpdated) {
            if (!values.fuel) {
              const fuels = originalFuels.filter(
                (f: string) => f !== original.fuel
              );

              insertData = {
                from_key,
                to_key,
                factor,
              };
              updateData = {
                id,
                from_key,
                to_key,
                factor,
                metadata: { fuels },
              };
            } else {
              const fuels = originalFuels.filter(
                (f: string) => f !== values.fuel
              );
              updateData = {
                id,
                from_key,
                to_key,
                factor,
                metadata: { fuels },
              };
            }
          }
        }
      }

      // clear errors
      if (insertData == null && updateData == null) return;

      if (insertData) {
        const doesRecordExists = uomConversionFactors?.find(
          (d) =>
            d.from_uom === values.from_uom &&
            d.to_uom === values.to_uom &&
            !d.fuel &&
            !values.fuel
        );

        if (doesRecordExists) {
          setValidationErrors({
            from_uom: "Conversion factor already exists.",
            to_uom: "Conversion factor already exists.",
          });
          return null;
        }
      }

      if (insertData) await saveNewUomConversion(insertData);
      if (updateData) await saveNewUomConversion(updateData);

      await refetch();
      setValidationErrors({});
      exitEditingMode();
    } catch (error) {
      console.error("Error upserting UOM conversion:", error);
    }

    // console.log("Upsert UOM conversion:", {
    //   updateData,
    //   insertData,
    //   requestType,
    //   exists,
    //   values,
    // });
  };

  return {
    columns,
    handleCreateNewUomConversion: async ({
      table,
      row,
      values,
      exitCreatingMode,
    }: {
      table: MRT_TableInstance<DataType>;
      row: MRT_Row<DataType>;
      values: any;
      exitCreatingMode: () => void;
    }) => {
      await upsertUOMConversion({
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
      table: MRT_TableInstance<DataType>;
      row: MRT_Row<DataType>;
      values: any;
      exitEditingMode: () => void;
    }) => {
      await upsertUOMConversion({
        exitEditingMode,
        row,
        table,
        values,
      });
    },
    validationErrors,
    setValidationErrors,
    fuelsSelectData,
    loading,
    data: data?.data,
    isSaving,
  };
};
