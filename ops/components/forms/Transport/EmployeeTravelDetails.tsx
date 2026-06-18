import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, GridCol, Stack } from "@mantine/core";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import ListOfEmployeeTravelDetailsTableInput from "~/components/common-table/TransportETDInput";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
const schema = z.object({
  CompanyOwnedBus: z.string().min(1, { message: "Enter % of Employees" }),
  CompanyContractedBus: z.string().min(1, { message: "Enter % of Employees" }),
  PublicTransportFourWheeler: z
    .string()
    .min(1, { message: "Enter % of Employees" }),
  PublicTransportThreeWheeler: z
    .string()
    .min(1, { message: "Enter % of Employees" }),
  PrivateTransportFourWheeler: z
    .string()
    .min(1, { message: "Enter % of Employees" }),
  PrivateTransportTwoWheeler: z
    .string()
    .min(1, { message: "Enter % of Employees" }),
  RailSuburbanTransport: z.string().min(1, { message: "Enter % of Employees" }),
  AverageCompanyOwnedBus: z
    .string()
    .min(1, { message: "Enter Average Distance in Km" }),
  AverageCompanyContractedBus: z
    .string()
    .min(1, { message: "Enter Average Distance in Km" }),
  AveragePublicTransportFourWheeler: z
    .string()
    .min(1, { message: "Enter Average Distance in Km" }),
  AveragePublicTransportThreeWheeler: z
    .string()
    .min(1, { message: "Enter Average Distance in Km" }),
  AveragePrivateTransportFourWheeler: z
    .string()
    .min(1, { message: "Enter Average Distance in Km" }),
  AveragePrivateTransportTwoWheeler: z
    .string()
    .min(1, { message: "Enter Average Distance in Kms" }),
  AverageRailSuburbanTransport: z
    .string()
    .min(1, { message: "Enter Average Distance in Km" }),
  OwnedBusUoM: z.string(),
  ContractedBusUoM: z.string(),
  FourWheelerPublicUoM: z.string(),
  ThreeWheelerPublicUoM: z.string(),
  FourWheelerPrivateUoM: z.string(),
  ThreeWheelerPrivateUoM: z.string(),
  TwoWheelerPrivateUoM: z.string(),
  RailSuburbanUoM: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;
const EmployeeTravelDetails = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset: reset,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      CompanyOwnedBus: "",
      CompanyContractedBus: "",
      PublicTransportFourWheeler: "",
      PublicTransportThreeWheeler: "",
      PrivateTransportFourWheeler: "",
      PrivateTransportTwoWheeler: "",
      RailSuburbanTransport: "",
      AverageCompanyOwnedBus: "",
      AverageCompanyContractedBus: "",
      AveragePublicTransportFourWheeler: "",
      AveragePublicTransportThreeWheeler: "",
      AveragePrivateTransportFourWheeler: "",
      AveragePrivateTransportTwoWheeler: "",
      AverageRailSuburbanTransport: "",
      OwnedBusUoM: "",
      ContractedBusUoM: "",
      FourWheelerPublicUoM: "",
      ThreeWheelerPublicUoM: "",
      FourWheelerPrivateUoM: "",
      ThreeWheelerPrivateUoM: "",
      TwoWheelerPrivateUoM: "",
      RailSuburbanUoM: "",
    },
  });

  const onSubmitForm: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log("EmployeeForm", data);
    reset();
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack gap="md" px="md">
          {/* <FormHeader header="Employee Travel Details" text="" /> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="CompanyOwnedBus"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Company Owned Bus"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("CompanyOwnedBus")}
                    error={
                      errors.CompanyOwnedBus && errors.CompanyOwnedBus.message
                    }
                    placeholder="Enter % of Employees Travelled by Company Owned Bus"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AverageCompanyOwnedBus"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Company Owned Bus (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AverageCompanyOwnedBus")}
                    error={
                      errors.AverageCompanyOwnedBus &&
                      errors.AverageCompanyOwnedBus.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="OwnedBusUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("OwnedBusUoM")}
                    error={errors.OwnedBusUoM && errors.OwnedBusUoM.message}
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="CompanyContractedBus"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Public Transport/Company Contracted - Bus"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("CompanyContractedBus")}
                    error={
                      errors.CompanyContractedBus &&
                      errors.CompanyContractedBus.message
                    }
                    placeholder="Enter % of Employees"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AverageCompanyContractedBus"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Public Transport/Company Contracted - Bus (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AverageCompanyContractedBus")}
                    error={
                      errors.AverageCompanyContractedBus &&
                      errors.AverageCompanyContractedBus.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="ContractedBusUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("ContractedBusUoM")}
                    error={
                      errors.ContractedBusUoM && errors.ContractedBusUoM.message
                    }
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="PublicTransportFourWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Public Transport - 4 Wheeler"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("PublicTransportFourWheeler")}
                    error={
                      errors.PublicTransportFourWheeler &&
                      errors.PublicTransportFourWheeler.message
                    }
                    placeholder="Enter % of Employees"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AveragePublicTransportFourWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Public Transport - 4 Wheeler (in Kms"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AveragePublicTransportFourWheeler")}
                    error={
                      errors.AveragePublicTransportFourWheeler &&
                      errors.AveragePublicTransportFourWheeler.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="FourWheelerPublicUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("FourWheelerPublicUoM")}
                    error={
                      errors.FourWheelerPublicUoM &&
                      errors.FourWheelerPublicUoM.message
                    }
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="PublicTransportThreeWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Public Transport - 4 Wheeler"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("PublicTransportThreeWheeler")}
                    error={
                      errors.PublicTransportThreeWheeler &&
                      errors.PublicTransportThreeWheeler.message
                    }
                    placeholder="Enter % of Employees"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AveragePublicTransportThreeWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Public Transport - 3 Wheeler (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AveragePublicTransportThreeWheeler")}
                    error={
                      errors.AveragePublicTransportThreeWheeler &&
                      errors.AveragePublicTransportThreeWheeler.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="ThreeWheelerPublicUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("ThreeWheelerPublicUoM")}
                    error={
                      errors.ThreeWheelerPublicUoM &&
                      errors.ThreeWheelerPublicUoM.message
                    }
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="PrivateTransportFourWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Private Transport - 4 Wheeler"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("PrivateTransportFourWheeler")}
                    error={
                      errors.PrivateTransportFourWheeler &&
                      errors.PrivateTransportFourWheeler.message
                    }
                    placeholder="Enter % of Employees"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AveragePrivateTransportFourWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Private Vehicle - 4 Wheeler (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AveragePrivateTransportFourWheeler")}
                    error={
                      errors.AveragePrivateTransportFourWheeler &&
                      errors.AveragePrivateTransportFourWheeler.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="FourWheelerPrivateUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("FourWheelerPrivateUoM")}
                    error={
                      errors.FourWheelerPrivateUoM &&
                      errors.FourWheelerPrivateUoM.message
                    }
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="PrivateTransportTwoWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Private Vehicle - 2 Wheeler"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("PrivateTransportTwoWheeler")}
                    error={
                      errors.PrivateTransportTwoWheeler &&
                      errors.PrivateTransportTwoWheeler.message
                    }
                    placeholder="Enter % of Employees"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AveragePrivateTransportTwoWheeler"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Private Vehicle - 2 Wheeler (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AveragePrivateTransportTwoWheeler")}
                    error={
                      errors.AveragePrivateTransportTwoWheeler &&
                      errors.AveragePrivateTransportTwoWheeler.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="TwoWheelerPrivateUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TwoWheelerPrivateUoM")}
                    error={
                      errors.TwoWheelerPrivateUoM &&
                      errors.TwoWheelerPrivateUoM.message
                    }
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          {/* <Grid>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="RailSuburbanTransport"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Percentage of Employees Travelled by Rail-Suburban"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("RailSuburbanTransport")}
                    error={
                      errors.RailSuburbanTransport &&
                      errors.RailSuburbanTransport.message
                    }
                    placeholder="Enter % of Employees"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="AverageRailSuburbanTransport"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Average Daily Distance Travelled by Rail-Suburban (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("AverageRailSuburbanTransport")}
                    error={
                      errors.AverageRailSuburbanTransport &&
                      errors.AverageRailSuburbanTransport.message
                    }
                    placeholder="Enter Average Distance in Km"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="RailSuburbanUoM"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("RailSuburbanUoM")}
                    error={
                      errors.RailSuburbanUoM && errors.RailSuburbanUoM.message
                    }
                  />
                )}
              />
            </GridCol>
          </Grid> */}
          <Grid>
            {/* <GridCol span={{ xs: 12, sm: 6 }}>
              <Flex gap={20} mt="sm">
                <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                  Add Data
                </Button>
              </Flex>
            </GridCol> */}
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              <ListOfEmployeeTravelDetailsTableInput />
            </GridCol>
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default EmployeeTravelDetails;
