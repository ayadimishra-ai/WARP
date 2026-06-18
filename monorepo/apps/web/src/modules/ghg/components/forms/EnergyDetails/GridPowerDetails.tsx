import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Grid, GridCol, LoadingOverlay, Stack } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";
import NumberInputField from "../FormComponent/NumberInput";
import TextInputField from "../FormComponent/TextInput";
import FormHeader from "../FormComponent/formHeader";

const schema = z.object({
  powerConsumedThroughGrid: z
    .string()
    .min(1, { message: "Units of power is required" }),
  nameOfDistributionCompany: z.string(),
  powerPurchasedThroughPPARenewable: z.string(),
  nameOfCompanyPPARenewable: z.string(),
  powerPurchasedThroughPPANonRenewable: z.string(),
  nameOfCompanyPPANonRenewable: z.string(),
  powerPurchasedThroughREC: z.string(),
  nameOfCompanyREC: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;

const GridPowerDetails = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset,
    setValue,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      powerConsumedThroughGrid: "",
      nameOfDistributionCompany: "",
      powerPurchasedThroughPPARenewable: "",
      nameOfCompanyPPARenewable: "",
      powerPurchasedThroughPPANonRenewable: "",
      nameOfCompanyPPANonRenewable: "",
      powerPurchasedThroughREC: "",
      nameOfCompanyREC: "",
    },
  });
  const params = useParams();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastClose, setToastClose] = useState<boolean>(false);
  const [paramLocation, setParamLocation] = useState("");
  const ref = useClickOutside(() => toast.dismiss());
  const resetRef = useRef<() => void>(null);
  // Function to handle file change
  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const onSubmit: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log("generalDetails:", data);
    // console.log("uploadedFiles:", uploadedFiles);
    const formDataWithFiles = { ...data, files: uploadedFiles };
    // console.log(formDataWithFiles, "allFormdtaGridPower");
    setTimeout(() => {
      reset({
        powerConsumedThroughGrid: "",
        nameOfDistributionCompany: "",
        powerPurchasedThroughPPARenewable: "",
        nameOfCompanyPPARenewable: "",
        powerPurchasedThroughPPANonRenewable: "",
        nameOfCompanyPPANonRenewable: "",
        powerPurchasedThroughREC: "",
        nameOfCompanyREC: "",
      });
    }, 2000);
  };

  const tableData = (data: any) => {
    if (data.length > 0) {
      setValue(
        "powerConsumedThroughGrid",
        data[0].original.power_consumed_grid.toString()
      );
      setValue(
        "nameOfDistributionCompany",
        data[0].original.distribution_company
      );
      setValue(
        "powerPurchasedThroughPPARenewable",
        data[0].original.power_purchased_ppa.toString()
      );
      setValue("nameOfCompanyPPARenewable", data[0].original.company_name_ppa);
      setValue(
        "powerPurchasedThroughREC",
        data[0].original.power_purchased_rec.toString()
      );
    }
  };

  return (
    <>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 0.5 }}
      />
      <Box ref={ref}>
        <ToastContainer
          style={{ width: "auto" }}
          autoClose={false}
          theme="dark"
          position="top-center"
        />
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md" px="md" pos={"relative"}>
          <FormHeader
            header="Energy Usage through Grid Power Details"
            text="Add grid power consumption details provided by one or multiple companies as applicable."
          />
          <Grid align="end">
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="powerConsumedThroughGrid"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Units of Power Consumed Through Grid"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("powerConsumedThroughGrid")}
                    error={
                      errors.powerConsumedThroughGrid &&
                      errors.powerConsumedThroughGrid.message
                    }
                    actionIcon
                    placeholder="Units of Power Consumed Through Grid"
                    popoverText="Units of Power Consumed Through Grid"
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="nameOfDistributionCompany"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("nameOfDistributionCompany")}
                    label="Name of Distribution Company"
                    placeholder="Name of Distribution Company"
                    popoverText="Name of Distribution Company"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="powerPurchasedThroughPPARenewable"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Units of Power Purchased Through PPA"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("powerPurchasedThroughPPARenewable")}
                    resourceType="Renewable"
                    actionIcon
                    placeholder="Units of Power Purchased Through PPA"
                    popoverText="Units of Power Purchased Through PPA"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="nameOfCompanyPPARenewable"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("nameOfCompanyPPARenewable")}
                    resourceType="Renewable"
                    actionIcon
                    label="Name of Company for PPA "
                    placeholder="Name of Company for PPA "
                    popoverText="Name of Company for PPA"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="powerPurchasedThroughPPANonRenewable"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Units of Power Purchased Through PPA"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("powerPurchasedThroughPPANonRenewable")}
                    resourceType="Non-Renewable"
                    actionIcon
                    placeholder="Units of Power Purchased Through PPA"
                    popoverText="Units of Power Purchased Through PPA"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="nameOfCompanyPPANonRenewable"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    label="Name of Company for PPA"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("nameOfCompanyPPANonRenewable")}
                    resourceType="Non-Renewable"
                    actionIcon
                    placeholder="Name of Company for PPA "
                    popoverText="Name of Company for PPA "
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="powerPurchasedThroughREC"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Units of power purchased through REC"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("powerPurchasedThroughREC")}
                    actionIcon
                    placeholder="Units of power purchased through REC"
                    popoverText="Units of power purchased through REC"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5.5 }}>
              <Controller
                name="nameOfCompanyREC"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("nameOfCompanyREC")}
                    actionIcon
                    label="Name of Company for REC"
                    placeholder="Name of Company for REC"
                    popoverText="Name of Company for REC"
                  />
                )}
              />
            </GridCol>
            {/*<Flex gap={20}>
                <Button size="xs" type="submit" radius="xl" color="#72D0C6">
                  Add Data
                </Button>
              </Flex>
            </GridCol> */}
            {/* <GridCol span={{ xs: 12, sm: 12 }}>
              <EnergyGridPowerDetailsTable tableData={tableData} />
            </GridCol> */}
          </Grid>
          {/* <FileUploadBlock onFilesChange={handleFilesChange} /> */}
        </Stack>
      </form>
    </>
  );
};
export default GridPowerDetails;
