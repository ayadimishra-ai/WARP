import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Grid, GridCol, Stack } from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
// import FuelPurchasedGenerateEnergyGeneralPurposeTable from "@/modules/ghg/components/common-table/FuelPurchasedGP";
// import FuelPurchasedGenerateEnergyHeatingPurposeTable from "@/modules/ghg/components/common-table/FuelPurchasedHP";
// import ListOfAuxiliaryFuelsPurchasedTable from "@/modules/ghg/components/common-table/ListAuxFuelPurchased";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import FormSectionHeader from "../FormComponent/FormSectionHeader";
import NumberInputField from "../FormComponent/NumberInput";
import RadioInput from "../FormComponent/RadioInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import TextInputField from "../FormComponent/TextInput";
import FormHeader from "../FormComponent/formHeader";

const schemaOne = z.object({
  typeOfFuelPurchased: z
    .string()
    .min(1, { message: "Type of fuel consumption is required" }),
  quantityofFuelConsumed: z
    .string()
    .min(1, { message: "Quantity of fuel consumed is required" }),
  uomForLPG: z.string(),
  uomForDieselGasoline: z.string(),
  uomForCNG: z.string(),
  qualityOfFuel: z.string(),
  pointOfConsumption: z.string(),
});

const schemaTwo = z.object({
  typeOfFuelPurchased: z
    .string()
    .min(1, { message: "Type of fuel consumption is required" }),
  qualityOfFuel: z.string(),
  usedSkus: z.string().min(1, { message: "Used for which SKU's is required" }),
  quantityofFuelConsumed: z
    .string()
    .min(1, { message: "Quantity of fuel consumed is required" }),
  uomForLPG: z.string(),
  uomForDieselGasoline: z.string(),
  uomForCNG: z.string(),
});

const schemaThree = z.object({
  auxiliaryFuelUsed: z
    .string()
    .min(1, { message: "Type of auxiliary fuel is required" }),
  usedSkus: z.string().min(1, { message: "Used for which SKU's is required" }),
  quantityofFuelConsumed: z
    .string()
    .min(1, { message: "Quantity of fuel consumed is required" }),
  uomForGaseousNitrogen: z.string(),
  uomForLiquidNitrogen: z.string(),
  uomForCompressedAir: z.string(),
  uomForDiesel: z.string(),
});

type FormSchemaTypeOne = z.infer<typeof schemaOne>;
type FormSchemaTypeTwo = z.infer<typeof schemaTwo>;
type FormSchemaTypeThree = z.infer<typeof schemaThree>;

const FuelPurchased = () => {
  const {
    register,
    handleSubmit: handleSubmitForm1,
    formState: { errors, isSubmitSuccessful },
    control,
    reset,
    // setValue:setValueForm1
  } = useForm<FormSchemaTypeOne>({
    resolver: zodResolver(schemaOne),
    defaultValues: {
      typeOfFuelPurchased: "",
      quantityofFuelConsumed: "",
      uomForLPG: "",
      uomForDieselGasoline: "",
      uomForCNG: "",
      qualityOfFuel: "",
      pointOfConsumption: "",
    },
  });

  const {
    handleSubmit: handleSubmitForm2,
    formState: { errors: errorsForm2 },
    control: controlForm2,
    register: registerForm2,
    reset: resetForm2,
  } = useForm<FormSchemaTypeTwo>({
    resolver: zodResolver(schemaTwo),
    defaultValues: {
      typeOfFuelPurchased: "",
      qualityOfFuel: "",
      usedSkus: "",
      quantityofFuelConsumed: "",
      uomForLPG: "",
      uomForDieselGasoline: "",
      uomForCNG: "",
    },
  });

  const {
    handleSubmit: handleSubmitForm3,
    formState: { errors: errorsForm3 },
    control: controlForm3,
    register: registerForm3,
    reset: resetForm3,
  } = useForm<FormSchemaTypeThree>({
    resolver: zodResolver(schemaThree),
    defaultValues: {
      auxiliaryFuelUsed: "",
      usedSkus: "",
      quantityofFuelConsumed: "",
      uomForGaseousNitrogen: "",
      uomForLiquidNitrogen: "",
      uomForCompressedAir: "",
      uomForDiesel: "",
    },
  });

  const onSubmitForm1: SubmitHandler<FormSchemaTypeOne> = (data: any) => {
    // console.log("FuelPurchasedForm1:", data);
    reset();
    // setValueForm1('typeOfFuelPurchased', "");
  };
  const onSubmitForm2: SubmitHandler<FormSchemaTypeTwo> = (data: any) => {
    // console.log(data);
    resetForm2();
  };
  const onSubmitForm3: SubmitHandler<FormSchemaTypeThree> = (data: any) => {
    // console.log(data);
    resetForm3();
  };

  // useEffect(() => {
  //   if (isSubmitSuccessful) {
  //     reset(); // Reset the form if submission was successful
  //   }
  // }, []);
  // console.log("isSubmitSuccessful:", isSubmitSuccessful);
  return (
    <>
      <form onSubmit={handleSubmitForm1(onSubmitForm1)}>
        <Stack gap="md" px="md">
          <FormHeader
            header="Energy generated using fuels"
            text="Select type of fuel consumption for general purpose"
          />
          <Grid>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormSectionHeader
                headerText="A. General Purpose"
                actionIcon={false}
                resourceType={null}
                popoverText="General Purpose"
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="typeOfFuelPurchased"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Type of Fuel Consumption"}
                    withAsterisk
                    options={["Option1", "option2", "option3"]}
                    placeholder={"Select Type of Fuel Consumption"}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("typeOfFuelPurchased")}
                    error={
                      errors.typeOfFuelPurchased &&
                      errors.typeOfFuelPurchased.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="quantityofFuelConsumed"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of fuel Consumed"
                    placeholder="Enter Quantity of fuel Consumed"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("quantityofFuelConsumed")}
                    error={
                      errors.quantityofFuelConsumed &&
                      errors.quantityofFuelConsumed.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12 }}>
              <Controller
                name="uomForLPG"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label={"UoM"}
                    options={[
                      {
                        label: "Kilogram(kg)",
                        value: "kilogram",
                        disabled: false,
                      },
                      { label: "Tonne(t)", value: "tonne", disabled: false },
                    ]}
                    description="For LPG"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("uomForLPG")}
                  />
                )}
              />
              <Controller
                name="uomForCNG"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label={""}
                    options={[
                      {
                        label: "Cubic Meters (m³)",
                        value: "cubic meters",
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
                    register={register("uomForCNG")}
                  />
                )}
              />{" "}
              <Controller
                name="uomForDieselGasoline"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label={""}
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
                        label: "Cubic foot(ft3)",
                        value: "cubic foot",
                        disabled: false,
                      },
                      {
                        label: "Fluid ounce(fl oz)",
                        value: "fluid ounce",
                        disabled: false,
                      },
                    ]}
                    description="For Diesel, Gasoline, Biodiesel, Ethanol"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("uomForDieselGasoline")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="qualityOfFuel"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("qualityOfFuel")}
                    disabled={false}
                    label={"Quality of fuel"}
                    placeholder="Enter Quality of fuel"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="pointOfConsumption"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    isSiblingGrid={true}
                    label={"Point of Consumption"}
                    options={[
                      { label: "Direct", value: "direct", disabled: false },
                      { label: "DG Set", value: "dg set", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("pointOfConsumption")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                Add Data
              </Button>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              {/* <FuelPurchasedGenerateEnergyGeneralPurposeTable /> */}
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Divider pb="xs" />
            </GridCol>
          </Grid>
        </Stack>
      </form>
      <form onSubmit={handleSubmitForm2(onSubmitForm2)}>
        <Stack gap="md" px="md">
          <Grid>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormSectionHeader
                headerText="B. For Heating Water"
                actionIcon={false}
                resourceType={null}
                popoverText="For Heating Water"
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="typeOfFuelPurchased"
                control={controlForm2}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Type of Fuel Consumption"}
                    withAsterisk={true}
                    options={["Option1", "option2", "option3"]}
                    placeholder={"Select Type of Fuel Consumption"}
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm2("typeOfFuelPurchased")}
                    error={
                      errorsForm2.typeOfFuelPurchased &&
                      errorsForm2.typeOfFuelPurchased.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="qualityOfFuel"
                control={controlForm2}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm2("qualityOfFuel")}
                    disabled={false}
                    label={"Quality of fuel"}
                    placeholder="Enter Quality of fuel"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="usedSkus"
                control={controlForm2}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Used for Which SKUs"}
                    withAsterisk={true}
                    options={["SKU1", "Sku2", "SKU3"]}
                    placeholder={"Select SKU's"}
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm2("usedSkus")}
                    error={errorsForm2.usedSkus && errorsForm2.usedSkus.message}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="quantityofFuelConsumed"
                control={controlForm2}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of fuel Consumed"
                    placeholder="Enter Quantity of fuel Consumed"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm2("quantityofFuelConsumed")}
                    error={
                      errorsForm2.quantityofFuelConsumed &&
                      errorsForm2.quantityofFuelConsumed.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12 }}>
              <Controller
                name="uomForLPG"
                control={controlForm2}
                render={({ field }) => (
                  <RadioInput
                    label={"UoM"}
                    options={[
                      {
                        label: "Kilogram(kg)",
                        value: "kilogram",
                        disabled: false,
                      },
                      { label: "Tonne(t)", value: "tonne", disabled: false },
                    ]}
                    description="For LPG"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm2("uomForLPG")}
                  />
                )}
              />
              <Controller
                name="uomForDieselGasoline"
                control={controlForm2}
                render={({ field }) => (
                  <RadioInput
                    label={""}
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
                        label: "Cubic foot(ft3)",
                        value: "cubic foot",
                        disabled: false,
                      },
                      {
                        label: "Fluid ounce(fl oz)",
                        value: "fluid ounce",
                        disabled: false,
                      },
                    ]}
                    description="For Diesel, Gasoline, Biodiesel, Ethanol"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm2("uomForDieselGasoline")}
                  />
                )}
              />
              <Controller
                name="uomForCNG"
                control={controlForm2}
                render={({ field }) => (
                  <RadioInput
                    label={""}
                    options={[
                      {
                        label: "Cubic Meters (m³)",
                        value: "cubic meters",
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
                    register={registerForm2("uomForCNG")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                Add Data
              </Button>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              {/* <FuelPurchasedGenerateEnergyHeatingPurposeTable /> */}
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Divider pb="xs" />
            </GridCol>
          </Grid>
        </Stack>
      </form>
      <form onSubmit={handleSubmitForm3(onSubmitForm3)}>
        <Stack gap="md" px="md">
          <Grid>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormSectionHeader
                headerText="C. Auxiliary"
                actionIcon={true}
                resourceType=""
                popoverText={"Auxiliary"}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="auxiliaryFuelUsed"
                control={controlForm3}
                render={({ field }) => (
                  <SelectDropdown
                    label="Type of Auxiliary Fuel Consumption"
                    withAsterisk={true}
                    options={["option1", "option2", "option3"]}
                    placeholder="Select the options"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm3("auxiliaryFuelUsed")}
                    error={
                      errorsForm3.auxiliaryFuelUsed &&
                      errorsForm3.auxiliaryFuelUsed.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}></GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="usedSkus"
                control={controlForm3}
                render={({ field }) => (
                  <SelectDropdown
                    label={"Used for Which SKUs"}
                    withAsterisk={true}
                    options={["SKU1", "Sku2", "SKU3"]}
                    placeholder={"Select SKU's"}
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm3("usedSkus")}
                    error={errorsForm3.usedSkus && errorsForm3.usedSkus.message}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="quantityofFuelConsumed"
                control={controlForm3}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of fuel Consumed"
                    placeholder="Enter Quantity of fuel Consumed"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm3("quantityofFuelConsumed")}
                    error={
                      errorsForm3.quantityofFuelConsumed &&
                      errorsForm3.quantityofFuelConsumed.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol>
              <Controller
                name="uomForGaseousNitrogen"
                control={controlForm3}
                render={({ field }) => (
                  <RadioInput
                    label={"UoM"}
                    options={[
                      {
                        label: "Standard cubic meter (Nm³)",
                        value: "standard cubic metre",
                        disabled: false,
                      },
                      {
                        label: "Kilogram (kg)",
                        value: "kilogram",
                        disabled: false,
                      },
                      {
                        label: "Normal cubic foot (scf)",
                        value: "normal cubic foot",
                        disabled: false,
                      },
                    ]}
                    description="For Gaseous Nitrogen, Gaseous Oxygen"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm3("uomForGaseousNitrogen")}
                  />
                )}
              />
              <Grid>
                <GridCol span={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="uomForLiquidNitrogen"
                    control={controlForm3}
                    render={({ field }) => (
                      <RadioInput
                        label={""}
                        options={[
                          {
                            label: "Kilogram(kg)",
                            value: "kilogram",
                            disabled: false,
                          },
                          {
                            label: "Litre(L)",
                            value: "litre",
                            disabled: false,
                          },
                          {
                            label: "Cubic metre(m3)",
                            value: "cubic metre",
                            disabled: false,
                          },
                        ]}
                        description="For Liquid Nitrogen"
                        value={field.value}
                        onChange={field.onChange}
                        register={registerForm3("uomForLiquidNitrogen")}
                      />
                    )}
                  />
                </GridCol>
                <GridCol span={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="uomForCompressedAir"
                    control={controlForm3}
                    render={({ field }) => (
                      <RadioInput
                        label={""}
                        options={[
                          {
                            label: "Standard cubic meter (Nm³)",
                            value: "standard cubic metre",
                            disabled: false,
                          },
                          { label: "Bar (bar)", value: "bar", disabled: false },
                        ]}
                        description="For Compressed Air"
                        value={field.value}
                        onChange={field.onChange}
                        register={registerForm3("uomForCompressedAir")}
                      />
                    )}
                  />
                </GridCol>
              </Grid>

              <Controller
                name="uomForDiesel"
                control={controlForm3}
                render={({ field }) => (
                  <RadioInput
                    label={""}
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
                        label: "Cubic foot(ft3)",
                        value: "cubic foot",
                        disabled: false,
                      },
                      {
                        label: "Fluid ounce(fl oz)",
                        value: "fluid ounce",
                        disabled: false,
                      },
                    ]}
                    description="For Diesel"
                    value={field.value}
                    onChange={field.onChange}
                    register={registerForm3("uomForDiesel")}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                Add Data
              </Button>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              {/* <ListOfAuxiliaryFuelsPurchasedTable /> */}
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Divider pb="xs" />
            </GridCol>
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default FuelPurchased;
