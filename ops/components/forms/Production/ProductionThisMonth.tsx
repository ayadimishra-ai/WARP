import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Grid, GridCol, Stack } from "@mantine/core";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import MultiSelectDropdown from "../FormComponent/MultiselectDropdown";
import NumberInputField from "../FormComponent/NumberInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import TextInputField from "../FormComponent/TextInput";
import FormHeader from "../FormComponent/formHeader";
import FormTextBanner from "../FormTextBanner/FormTextBanner";

const schema = z.object({
  productsThisMonth: z
    .string()
    .min(1, { message: "Product is required" })
    .nullable()
    .refine((val) => val !== null, {
      message: "Product is required",
    }),
  productId: z.string(),
  skuId: z.string(),
  unitsOfSKU: z
    .string()
    .min(1, { message: "Units of SKU Manufactured is required" }),
  totalWeight: z.string(),
  processesEmployed: z.array(z.string()),
  SKUsManufactured: z
    .string()
    .min(1, { message: "SKUs Manufactured is required" })
    .nullable()
    .refine((val) => val !== null, {
      message: "SKUs Manufactured is required",
    }),

  totalProductionPercentage: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;

const ProductionThisMonth = () => {
  const {
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    control,
    register,
    reset,
    setValue,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      productsThisMonth: null!,
      productId: "",
      skuId: "",
      unitsOfSKU: "",
      totalWeight: "",
      processesEmployed: [],
      SKUsManufactured: null!,
      totalProductionPercentage: "",
    },
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Function to handle file change
  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const onSubmit: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log("productTable:", data);
    // console.log("uploadedFiles:", uploadedFiles);
    const formDataWithFiles = { ...data, files: uploadedFiles };
    // console.log(formDataWithFiles, "allFormdtaProduct");
    setTimeout(() => {
      reset();
    }, 2000);
  };

  const clearData = () => {
    reset();
  };

  const tableData = (data: any) => {
    if (data.length > 0) {
      setValue("productId", data[0].original.productID);
      setValue("skuId", data[0].original.sku_id);
      setValue("totalWeight", data[0].original.weight);
      setValue("SKUsManufactured", data[0].original.sku_manufactured);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md" px="md">
          <FormHeader
            header="Production Details this Month"
            text="Provide details of products manufactured at this facility for selected month."
          />
          <Grid>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="productsThisMonth"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    value={field.value}
                    onChange={field.onChange}
                    register={register("productsThisMonth")}
                    label="Products Manufactured this Month"
                    withAsterisk={true}
                    options={[
                      "Shampoo Bottle",
                      "option 2",
                      "option 3",
                      "option 4",
                      "option 5",
                      "option 6",
                      "option 7",
                    ]}
                    placeholder="Products Manufactured this Month"
                    error={
                      errors.productsThisMonth &&
                      errors.productsThisMonth.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    label="Product ID"
                    placeholder="Product ID"
                    disabled={false}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="processesEmployed"
                control={control}
                render={({ field }) => (
                  <MultiSelectDropdown
                    onChange={field.onChange}
                    label="Processes Employed"
                    options={["Mass Production", "option 2", "option 3"]}
                    placeholder="Processes Employed"
                    value={field.value}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormTextBanner
                theme="#FFF1DF"
                text={true}
                confirmationHeader={false}
                confirmationText={false}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="SKUsManufactured"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    value={field.value}
                    onChange={field.onChange}
                    register={register("SKUsManufactured")}
                    label="SKUs Manufactured"
                    withAsterisk
                    options={["Leather-Jacket", "Leather-Jacket-1"]}
                    placeholder="SKUs Manufactured"
                    error={
                      errors.SKUsManufactured && errors.SKUsManufactured.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="skuId"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    label="SKU ID"
                    placeholder="SKU ID"
                    disabled={true}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="unitsOfSKU"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Units of SKU Manufactured"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Units of SKU Manufactured"
                    withAsterisk
                    error={errors.unitsOfSKU && errors.unitsOfSKU.message}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="totalWeight"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Total Weight"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Total Weight"
                    disabled
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Flex gap={20}>
                <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                  Update Data
                </Button>
                <Button
                  onClick={clearData}
                  variant="default"
                  size="xs"
                  radius="xl"
                  color="#666666"
                >
                  Clear Data
                </Button>
              </Flex>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormTextBanner
                theme="#D0FFDC"
                text={false}
                confirmationHeader={true}
                confirmationText={true}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              {/* <ProductionTable tableData={tableData} /> */}
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Controller
                name="totalProductionPercentage"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="What Percentage of Total Production Represents Production of Client Organization's SKUs?"
                    showLabelOnly
                    actionIcon
                    popoverText="What Percentage of Total Production Represents Production of Client Organization's SKUs?"
                  />
                )}
              />
              <Grid mt="xs">
                <GridCol span={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="totalProductionPercentage"
                    control={control}
                    render={({ field }) => (
                      <NumberInputField
                        label=""
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter percentage"
                        allowDecimal
                        allowNegative
                        popoverText=""
                        showInputOnly
                      />
                    )}
                  />
                </GridCol>
              </Grid>
            </GridCol>
          </Grid>
          <FileUploadBlock onFilesChange={handleFilesChange} />
        </Stack>
      </form>
    </>
  );
};
export default ProductionThisMonth;
