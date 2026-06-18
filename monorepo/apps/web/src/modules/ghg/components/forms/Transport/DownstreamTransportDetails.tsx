import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Grid, GridCol, Stack } from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import NumberInputField from "../FormComponent/NumberInput";
import RadioInput from "../FormComponent/RadioInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import FormHeader from "../FormComponent/formHeader";

const schema = z.object({
  WhichProducts: z.string().min(1, { message: "Select Product" }),
  WhichSkus: z.string().min(1, { message: "Select Skus" }),
  DestinationLocationName: z.string().min(1, { message: "Select Skus" }),
  TransportManagedBy: z
    .string()
    .min(1, { message: "Transport Managed By is required" }),
  ModeOfTransport: z
    .string()
    .min(1, { message: "Mode of Transport is required" }),
  VehicleTypeUsed: z
    .string()
    .min(1, { message: "Vehicle Type Used For Road Transport is required" }),
  ForRoad: z.string().min(1, { message: "Fuel Used for Road is required" }),
  ForRail: z.string().min(1, { message: "Fuel Used for Rail is required" }),
  ForAir: z
    .string()
    .min(1, { message: "Fuel Used for Air-Freight is required" }),
  ForFuelJetSAF: z.string(),
  ForCNG: z.string(),
  ForElectric: z.string(),
  DestinationLocationPin: z.string(),
  DistancePerTrip: z
    .string()
    .min(1, { message: "Enter Distance per Trip (in Kms)" }),
  NumberOfTrips: z.string().min(1, { message: "Enter Number of Trips" }),
  QuantityofFuelConsumed: z.string(),
  UoMinKMile: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;

const DownstreamTransportDetails = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      WhichProducts: "",
      WhichSkus: "",
      DestinationLocationName: "",
      TransportManagedBy: "",
      ModeOfTransport: "",
      VehicleTypeUsed: "",
      ForRoad: "",
      ForRail: "",
      ForAir: "",
      ForFuelJetSAF: "",
      ForCNG: "",
      ForElectric: "",
      DestinationLocationPin: "",
      DistancePerTrip: "",
      NumberOfTrips: "",
      QuantityofFuelConsumed: "",
      UoMinKMile: "",
    },
  });

  const onSubmitForm: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log("DiwnstreamForm", data);
    reset();
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack gap="md" px="md">
          <FormHeader header="Downstream Transport Details" text="" />
          <Grid>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="WhichProducts"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="Which Products"
                    options={["Product 1", "Product 2", "Product 3"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("WhichProducts")}
                    error={errors.WhichProducts && errors.WhichProducts.message}
                    placeholder="Select Products"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="WhichSkus"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="Which SKUs"
                    options={["SKU 1", "SKU 2", "SKU 3"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("WhichSkus")}
                    error={errors.WhichSkus && errors.WhichSkus.message}
                    placeholder="Select SKUs"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="DestinationLocationName"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="Destination Location Name"
                    options={["Pune", "Mumbai", "Ahmedabad"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("DestinationLocationName")}
                    error={
                      errors.DestinationLocationName &&
                      errors.DestinationLocationName.message
                    }
                    placeholder="Location Name"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="DestinationLocationPin"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Destination pin code"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("DestinationLocationPin")}
                    placeholder="Pin code"
                    disabled
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="TransportManagedBy"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="Transport Managed By"
                    options={[
                      { label: "Self", value: "self", disabled: false },
                      {
                        label: "Third Party",
                        value: "thirdparty",
                        disabled: false,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TransportManagedBy")}
                    error={
                      errors.TransportManagedBy &&
                      errors.TransportManagedBy.message
                    }
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="ModeOfTransport"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="Transport Managed By"
                    options={[
                      { label: "Road", value: "road", disabled: false },
                      { label: "Rail", value: "rail", disabled: false },
                      { label: "Water", value: "water", disabled: false },
                      { label: "Air", value: "air", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("ModeOfTransport")}
                    error={
                      errors.ModeOfTransport && errors.ModeOfTransport.message
                    }
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="VehicleTypeUsed"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="Vehicle Type Used For Road Transport"
                    options={[
                      { label: "LDV", value: "ldv", disabled: false },
                      { label: "MDV", value: "mdv", disabled: false },
                      { label: "HDV", value: "hdv", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("VehicleTypeUsed")}
                    error={
                      errors.VehicleTypeUsed && errors.VehicleTypeUsed.message
                    }
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12 }}>
              <Grid gutter="xs">
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="ForRoad"
                    control={control}
                    render={({ field }) => (
                      <RadioInput
                        label="Fuel Used"
                        options={[
                          { label: "Diesel", value: "diesel", disabled: false },
                          { label: "CNG", value: "cng", disabled: false },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        register={register("ForRoad")}
                        error={errors.ForRoad && errors.ForRoad.message}
                        withAsterisk
                        description="For Road"
                      />
                    )}
                  />
                </GridCol>
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Box mt={{ base: "0", xs: "0", sm: "lg" }}>
                    <Controller
                      name="ForRail"
                      control={control}
                      render={({ field }) => (
                        <RadioInput
                          label=""
                          options={[
                            {
                              label: "Diesel",
                              value: "diesel",
                              disabled: false,
                            },
                            {
                              label: "Electric",
                              value: "electric",
                              disabled: false,
                            },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          register={register("ForRail")}
                          error={errors.ForRail && errors.ForRail.message}
                          description="For Rail"
                        />
                      )}
                    />
                  </Box>
                </GridCol>
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Box mt={{ base: "0", xs: "0", sm: "lg" }}>
                    <Controller
                      name="ForAir"
                      control={control}
                      render={({ field }) => (
                        <RadioInput
                          label=""
                          options={[
                            {
                              label: "Air Fuel",
                              value: "air-fuel",
                              disabled: false,
                            },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          register={register("ForAir")}
                          error={errors.ForAir && errors.ForAir.message}
                          description="For Air-Freight"
                        />
                      )}
                    />
                  </Box>
                </GridCol>
              </Grid>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="DistancePerTrip"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Distance per Trip (in Kms)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("DistancePerTrip")}
                    error={
                      errors.DistancePerTrip && errors.DistancePerTrip.message
                    }
                    placeholder="Enter Distance per Trip (in Kms)"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="UoMinKMile"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    isSiblingGrid
                    label="UoM"
                    options={[
                      {
                        label: "Kilometer (Km)",
                        value: "kilometer",
                        disabled: false,
                      },
                      { label: "Mile (mi)", value: "mile", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoMinKMile")}
                    error={errors.UoMinKMile && errors.UoMinKMile.message}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="NumberOfTrips"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Number of Trips"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("NumberOfTrips")}
                    error={errors.NumberOfTrips && errors.NumberOfTrips.message}
                    placeholder="Enter Number of Trips"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QuantityofFuelConsumed"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of Fuel Consumed"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("QuantityofFuelConsumed")}
                    error={
                      errors.QuantityofFuelConsumed &&
                      errors.QuantityofFuelConsumed.message
                    }
                    placeholder="Enter Quantity of Fuel Consumed"
                  />
                )}
              />
            </GridCol>
            <GridCol>
              <Controller
                name="ForFuelJetSAF"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Cubic meter (m3)",
                        value: "cubic meter",
                        disabled: false,
                      },
                      { label: "Litre (L)", value: "litre", disabled: false },
                      {
                        label: "Millilitre (mL)",
                        value: "millilitre",
                        disabled: false,
                      },
                      {
                        label: "Gallon (gal)",
                        value: "gallon",
                        disabled: false,
                      },
                      {
                        label: "Cubic foot (ft3)",
                        value: "cubic foot",
                        disabled: false,
                      },
                      {
                        label: "Fluid ounce (fl oz)",
                        value: "fluid ounce",
                        disabled: false,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("ForFuelJetSAF")}
                    error={errors.ForFuelJetSAF && errors.ForFuelJetSAF.message}
                    description="For Fuel, Jet Fuel and SAF"
                  />
                )}
              />
              <Grid mt="xs">
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="ForCNG"
                    control={control}
                    render={({ field }) => (
                      <RadioInput
                        label=""
                        options={[
                          {
                            label: "Cubic Meters (cm)",
                            value: "cubic meters",
                            disabled: false,
                          },
                          {
                            label: "Kilogram (Kg)",
                            value: "kilogram",
                            disabled: false,
                          },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        register={register("ForCNG")}
                        error={errors.ForCNG && errors.ForCNG.message}
                        description="For CNG"
                      />
                    )}
                  />
                </GridCol>
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="ForElectric"
                    control={control}
                    render={({ field }) => (
                      <RadioInput
                        label=""
                        options={[
                          {
                            label: "Kwh",
                            value: "Kwh",
                            disabled: false,
                          },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        register={register("ForElectric")}
                        error={errors.ForElectric && errors.ForElectric.message}
                        description="For Electric"
                      />
                    )}
                  />
                </GridCol>
              </Grid>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Flex gap={20} mt="sm">
                <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                  Add Data
                </Button>
              </Flex>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              {/* <TransportDetailsOfDownstreamActivitiesTable /> */}
            </GridCol>
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default DownstreamTransportDetails;
