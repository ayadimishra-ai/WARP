import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Grid, GridCol, Stack } from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import NumberInputField from "../FormComponent/NumberInput";
import RadioInput from "../FormComponent/RadioInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import TextInputField from "../FormComponent/TextInput";
import FormHeader from "../FormComponent/formHeader";

const schema = z.object({
  materialProcured: z.string(),
  materialId: z.string(),
  supplierStatus: z.string(),
  thirdPartySuppliersOfMaterial: z
    .string()
    .min(1, { message: "Third Party Suppliers of Material is required" }),
  supplierCode: z.string(),
  locationsProcuredFrom: z.string(),
  locationPinCode: z.string(), // pin code validation
  transportManagedBy: z
    .string()
    .min(1, { message: "Transport Managed is required" }),
  modeOfTransport: z
    .string()
    .min(1, { message: "Mode of Transport is required" }),
  vehicleTypeUsedForRoadTransport: z
    .string()
    .min(1, { message: "Vehicle Type Used for Road Transport is required" }),
  fuelUsed: z.string().min(1, { message: "Fuel Used is required" }),
  materialQuantityProcured: z
    .string()
    .min(1, { message: "Material Quantity Procured is required" }),
  distancePerTrip: z
    .string()
    .min(1, { message: "Distance Per Trip is required" }),
  uomDropdown: z.string(),
  uomRadio: z.string(),
  numberOfTrips: z.string().min(1, { message: "Number of Trips is required" }),
  quantityOfFuelConsumed: z.string(),
  uomForDieselFuelSaf: z.string(),
  uomForCng: z.string(),
  uomForElectric: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;

const UpstreamTransportDetails = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      materialProcured: "",
      materialId: "",
      supplierStatus: "",
      thirdPartySuppliersOfMaterial: "",
      supplierCode: "",
      locationsProcuredFrom: "",
      locationPinCode: "",
      transportManagedBy: "",
      modeOfTransport: "",
      vehicleTypeUsedForRoadTransport: "",
      fuelUsed: "",
      materialQuantityProcured: "",
      distancePerTrip: "",
      uomDropdown: "",
      uomRadio: "",
      numberOfTrips: "",
      quantityOfFuelConsumed: "",
      uomForDieselFuelSaf: "",
      uomForCng: "",
      uomForElectric: "",
    },
  });

  const onSubmitForm: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log(data);
    reset();
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack gap="md" px="md">
          <FormHeader
            header="Trip Details for Movement of Goods and Material for all the Upstream Activity"
            text=""
          />
          <Grid>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="materialProcured"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Material Procured"}
                    options={["Plastic Bottle", "option2", "option3"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("materialProcured")}
                    placeholder="Select Material Procured"
                    actionIcon
                    popoverText="Material Procured"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="materialId"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Material ID"}
                    options={["#PP0025", "#PP002", "option3"]}
                    placeholder={"Select Material ID"}
                    disabled={true}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("materialId")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="supplierStatus"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Supplier Status"}
                    options={["Self, third party", "option2", "option3"]}
                    placeholder={"Select Supplier Status"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("supplierStatus")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="thirdPartySuppliersOfMaterial"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Third Party Suppliers of Material"}
                    withAsterisk
                    options={["ABC Supplier", "ABC Supplier2", "option3"]}
                    placeholder={"Select Third Party Suppliers of Material"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("thirdPartySuppliersOfMaterial")}
                    error={
                      errors.thirdPartySuppliersOfMaterial &&
                      errors.thirdPartySuppliersOfMaterial.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="supplierCode"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    label={"Supplier Code"}
                    actionIcon={false}
                    disabled={true}
                    placeholder={"Enter Supplier Code"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("supplierCode")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="locationsProcuredFrom"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Locations Procured From"}
                    options={[
                      "Andheri West, Mumbai",
                      "Andheri East, Mumbai",
                      "option3",
                    ]}
                    placeholder={"Select Locations Procured From"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("locationsProcuredFrom")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="locationPinCode"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label={"Location pin code"}
                    placeholder="Enter Location pin code"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("locationPinCode")}
                    // error={
                    //   errors.locationPinCode && errors.locationPinCode.message
                    // }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="transportManagedBy"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Transport Managed By"}
                    withAsterisk
                    options={["Self", "option2", "option3"]}
                    placeholder={"Select Transport Managed By"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("transportManagedBy")}
                    error={
                      errors.transportManagedBy &&
                      errors.transportManagedBy.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="modeOfTransport"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Mode of Transport"}
                    options={["Road", "Air", "Water"]}
                    withAsterisk
                    placeholder={"Select Transport Managed By"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("modeOfTransport")}
                    error={
                      errors.modeOfTransport && errors.modeOfTransport.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="vehicleTypeUsedForRoadTransport"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Vehicle Type Used for Road Transport"}
                    withAsterisk
                    options={["LDV", "option 2", "option 3"]}
                    actionIcon
                    popoverText="Vehicle Type Used for Road Transport"
                    placeholder={"Select Vehicle Type Used for Road Transport"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("vehicleTypeUsedForRoadTransport")}
                    error={
                      errors.vehicleTypeUsedForRoadTransport &&
                      errors.vehicleTypeUsedForRoadTransport.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="fuelUsed"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Fuel Used"}
                    withAsterisk
                    options={["Diesel", "option 2", "option 3"]}
                    placeholder={"Select Fuel Used"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("fuelUsed")}
                    error={errors.fuelUsed && errors.fuelUsed.message}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="materialQuantityProcured"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label={"Material Quantity Procured"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("materialQuantityProcured")}
                    error={
                      errors.materialQuantityProcured &&
                      errors.materialQuantityProcured.message
                    }
                    placeholder={"Enter Material Quantity "}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 4 }}>
              <Controller
                name="uomDropdown"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"UoM"}
                    options={["Kilogram (kg)", "option 2", "option 3"]}
                    placeholder={"Select options"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("uomDropdown")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="distancePerTrip"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label={"Distance per Trip (kms)"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("distancePerTrip")}
                    error={
                      errors.distancePerTrip && errors.distancePerTrip.message
                    }
                    placeholder={"Distance per Trip (kms)"}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="uomRadio"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    isSiblingGrid
                    label={"UoM"}
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
                    register={register("uomRadio")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="numberOfTrips"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label={"Number of Trips"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("numberOfTrips")}
                    error={errors.numberOfTrips && errors.numberOfTrips.message}
                    placeholder={"Number of Trips"}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="quantityOfFuelConsumed"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label={"Quantity of Fuel Consumed"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("quantityOfFuelConsumed")}
                    placeholder={"Quantity of Fuel Consumed"}
                  />
                )}
              />
            </GridCol>
            <GridCol>
              <Controller
                name="uomForDieselFuelSaf"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="UoM"
                    options={[
                      {
                        label: "Cubic metre(m3)",
                        value: "cubic metre",
                        disabled: false,
                      },
                      { label: "Litre(L)", value: "litre", disabled: false },
                      {
                        label: "Millilitre(mL)",
                        value: "millilitre",
                        disabled: false,
                      },
                      {
                        label: "Gallon(gal)",
                        value: "gallon",
                        disabled: false,
                      },
                      {
                        label: "Fluid ounce(fl oz)",
                        value: "fluid ounce",
                        disabled: false,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("uomForDieselFuelSaf")}
                    description="For Diesel, Jet Fuel and SAF"
                  />
                )}
              />
              <Grid>
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="uomForCng"
                    control={control}
                    render={({ field }) => (
                      <RadioInput
                        label=""
                        options={[
                          {
                            label: "Cubic Meters (cm)",
                            value: "cubic metres",
                            disabled: false,
                          },
                          {
                            label: "Kilogram (kg)",
                            value: "kilogram",
                            disabled: false,
                          },
                        ]}
                        description="For CNG"
                        value={field.value}
                        onChange={field.onChange}
                        register={register("uomForCng")}
                      />
                    )}
                  />
                </GridCol>
                <GridCol span={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="uomForElectric"
                    control={control}
                    render={({ field }) => (
                      <RadioInput
                        label=""
                        options={[
                          { label: "Kwh", value: "kwh", disabled: false },
                        ]}
                        description="For Electric"
                        value={field.value}
                        onChange={field.onChange}
                        register={register("uomForElectric")}
                      />
                    )}
                  />
                </GridCol>
              </Grid>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                Add Data
              </Button>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              {/* <TripDetailsMovementUpstreamActivityTable /> */}
            </GridCol>
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default UpstreamTransportDetails;
