import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Grid, GridCol, Stack } from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
// import EnergyCaptivePowerDetailsNonRenewable from "~/components/common-table/EnergyCPDNonRenewable";
// import EnergyCaptivePowerDetailsRenewable from "~/components/common-table/EnergyCPDRenewable";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import CheckboxMantine from "../FormComponent/Checkbox";
import FormSectionHeader from "../FormComponent/FormSectionHeader";
import NumberInputField from "../FormComponent/NumberInput";
import RadioInput from "../FormComponent/RadioInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import TextInputField from "../FormComponent/TextInput";
import YearPicker from "../FormComponent/YearPicker";
import FormHeader from "../FormComponent/formHeader";

const schema1 = z.object({
  CaptivePower: z.string().min(1, { message: "Captive power is required" }),
  CaptivePowerType: z.string().array(),
  TypeofTechnologyUsed: z
    .string()
    .min(1, { message: "Type of Technology used is required" }),
  YearofInstallation: z.date(),
  UnitofEnergyGenerated: z
    .string()
    .min(1, { message: "Unit of energy is required" }),
});
const schema2 = z.object({
  TypeofFuel: z.string().min(1, { message: "Type of Fuel is required" }),
  QuantityofFuel: z.string().min(1, { message: "QuantityofFuel is required" }),
  UoMForCoal: z.string(),
  UoMForDiesel: z.string(),
  UoMForNaturalGas: z.string(),
  QualityOfFuel: z.string(),
  UnitofEnergy: z.string().min(1, { message: "Units of energy is required" }),
});

type FormSchemaType = z.infer<typeof schema1>;
type FormSchemaType2 = z.infer<typeof schema2>;

const CaptivePowerDetails = () => {
  // const [radioValue, setRadioValue] = useState("");
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema1),
    defaultValues: {
      CaptivePower: "",
      CaptivePowerType: [],
      TypeofTechnologyUsed: "",
      YearofInstallation: new Date(),
      UnitofEnergyGenerated: "",
    },
  });

  const {
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    control: control2,
    register: register2,
    reset: reset2,
  } = useForm<FormSchemaType2>({
    resolver: zodResolver(schema2),
    defaultValues: {
      TypeofFuel: "",
      QuantityofFuel: "",
      UoMForCoal: "",
      UoMForDiesel: "",
      UoMForNaturalGas: "",
      QualityOfFuel: "",
      UnitofEnergy: "",
    },
  });

  const onSubmitForm1: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log(data);
    reset();
  };
  const onSubmitForm2: SubmitHandler<FormSchemaType2> = (data: any) => {
    // console.log(data);
    reset2();
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm1)}>
        <Stack gap="md" px="md">
          <FormHeader
            header="Energy Usage through Captive Sources"
            text="Provide details of the captive power generation in this facility."
          />
          <Grid>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormSectionHeader
                headerText="A. General"
                actionIcon={false}
                resourceType={null}
                popoverText="General"
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="CaptivePower"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="Do You Generate Captive Power for Own Use?"
                    options={[
                      { label: "Yes", value: "yes", disabled: false },
                      { label: "No", value: "no", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("CaptivePower")}
                    error={errors.CaptivePower && errors.CaptivePower.message}
                    withAsterisk={true}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="CaptivePowerType"
                control={control}
                render={({ field }) => (
                  <CheckboxMantine
                    label="Type of Captive Power"
                    options={[
                      {
                        label: "Renewable",
                        value: "renewable",
                        disabled: false,
                      },
                      {
                        label: "Non-renewable",
                        value: "non-renewable",
                        disabled: false,
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("CaptivePowerType")}
                    error={
                      errors.CaptivePowerType && errors.CaptivePowerType.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Divider my="2px" />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormSectionHeader
                headerText="B. Captive Power Details"
                actionIcon={true}
                resourceType="Renewable"
                popoverText="Captive Power Details"
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="TypeofTechnologyUsed"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="Type of Technology Used"
                    options={[
                      { label: "Solar", value: "solar", disabled: false },
                      { label: "Wind", value: "wind", disabled: false },
                      { label: "Hydro", value: "hydro", disabled: false },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TypeofTechnologyUsed")}
                    error={
                      errors.TypeofTechnologyUsed &&
                      errors.TypeofTechnologyUsed.message
                    }
                    withAsterisk={true}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="YearofInstallation"
                control={control}
                render={({ field }) => (
                  <YearPicker
                    label="Year of Installation"
                    withAsterisk
                    placeholder="Year of Installation"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("YearofInstallation")}
                    error={
                      errors.YearofInstallation &&
                      errors.YearofInstallation.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UnitofEnergyGenerated"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Unit of Energy Generated"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UnitofEnergyGenerated")}
                    error={
                      errors.UnitofEnergyGenerated &&
                      errors.UnitofEnergyGenerated.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Button size="xs" type="submit" radius="xl" color="#72D0C6">
                Add Data
              </Button>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              {/* <EnergyCaptivePowerDetailsRenewable /> */}
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Divider pb="xs" />
            </GridCol>
          </Grid>
        </Stack>
        {/* <GridCol span={{ xs: 12, sm: 12 }} p={0}>
          <Input_EnergyCaptivePowerDetailsRenewable />
        </GridCol> */}
      </form>
      <form onSubmit={handleSubmit2(onSubmitForm2)}>
        <Stack gap="md" px="md">
          <Grid>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <FormSectionHeader
                headerText="C. Captive Power Details"
                actionIcon={true}
                resourceType="Non-Renewable"
                popoverText="Captive Power Details"
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="TypeofFuel"
                control={control2}
                render={({ field }) => (
                  <SelectDropdown
                    label="Type of Fuel Used"
                    withAsterisk={true}
                    options={["Coal", "Diesel"]}
                    placeholder="Type of Fuel Used"
                    value={field.value}
                    onChange={field.onChange}
                    register={register2("TypeofFuel")}
                    error={errors2.TypeofFuel && errors2.TypeofFuel.message}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QuantityofFuel"
                control={control2}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of Fuel Consumed"
                    placeholder="Enter Quantity of Fuel Consumed"
                    value={field.value}
                    onChange={field.onChange}
                    register={register2("QuantityofFuel")}
                    error={
                      errors2.QuantityofFuel && errors2.QuantityofFuel.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol>
              <Controller
                name="UoMForCoal"
                control={control2}
                render={({ field }) => (
                  <RadioInput
                    label={"UoM"}
                    options={[
                      {
                        label: "Kilogram(kg)",
                        value: "kilogram",
                        disabled: false,
                      },
                      { label: "Gram(g)", value: "gram", disabled: false },
                      {
                        label: "Milligram(mg)",
                        value: "milligram",
                        disabled: false,
                      },
                      { label: "Tonne(t)", value: "tonne", disabled: false },
                      { label: "Pound(lb)", value: "pound", disabled: false },
                      { label: "Ounce(oz)", value: "ounce", disabled: false },
                    ]}
                    description="For Coal, Petcoke, Bagasse, Biomass"
                    value={field.value}
                    onChange={field.onChange}
                    register={register2("UoMForCoal")}
                    error={errors2.UoMForCoal && errors2.UoMForCoal.message}
                  />
                )}
              />
              <Controller
                name="UoMForDiesel"
                control={control2}
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
                    register={register2("UoMForDiesel")}
                    error={errors2.UoMForDiesel && errors2.UoMForDiesel.message}
                  />
                )}
              />
              <Controller
                name="UoMForNaturalGas"
                control={control2}
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
                        label: "Cubic Feet (ft³)",
                        value: "cubic feet",
                        disabled: false,
                      },
                      {
                        label: "Thousands of cubic feet (Mcf)",
                        value: "thousands of cubic feet",
                        disabled: false,
                      },
                    ]}
                    description="For Natural Gas"
                    value={field.value}
                    onChange={field.onChange}
                    register={register2("UoMForNaturalGas")}
                    error={
                      errors2.UoMForNaturalGas &&
                      errors2.UoMForNaturalGas.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QualityOfFuel"
                control={control2}
                render={({ field }) => (
                  <TextInputField
                    label="Quality of Fuel"
                    placeholder="Enter Quality of Fuel"
                    value={field.value}
                    onChange={field.onChange}
                    register={register2("QualityOfFuel")}
                    error={
                      errors2.QualityOfFuel && errors2.QualityOfFuel.message
                    }
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UnitofEnergy"
                control={control2}
                defaultValue=""
                render={({ field }) => (
                  <NumberInputField
                    label="Unit of Energy Generated"
                    placeholder="Enter Unit of Energy Generated (in Kwh)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register2("UnitofEnergy")}
                    error={errors2.UnitofEnergy && errors2.UnitofEnergy.message}
                    withAsterisk
                    allowDecimal
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
              {/* <EnergyCaptivePowerDetailsNonRenewable /> */}
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Divider pb="xs" />
            </GridCol>
            {/* <GridCol span={{ xs: 12, sm: 12 }} p={0}>
              <Input_EnergyCaptivePowerDetailsNonRenewable />
            </GridCol> */}
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default CaptivePowerDetails;
