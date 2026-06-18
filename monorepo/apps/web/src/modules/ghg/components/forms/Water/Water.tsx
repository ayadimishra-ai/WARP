import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Grid, GridCol, Stack } from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import NumberInputField from "../FormComponent/NumberInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import TextInputField from "../FormComponent/TextInput";
import FormHeader from "../FormComponent/formHeader";

const schema = z.object({
  ManpowerNoofEmployees: z
    .string()
    .min(1, { message: "Manpower (No. of Employees) is required" }),
  RawFreshWaterWithdrawal: z
    .string()
    .min(1, { message: "Raw/Fresh Water Withdrawal is required" }),
  UoMRawWater: z.string().min(1, { message: "UoM Raw Water is required" }),
  SourceofRawFreshWater: z
    .string()
    .min(1, { message: "Select Source of Raw/Fresh Water" }),
  TreatmentFacilityAvailable: z
    .string()
    .min(1, { message: "Select Treatment Facility Available" }),
  InfluentQuantity: z
    .string()
    .min(1, { message: "Influent Quantity is required" }),
  UoMInfluent: z.string().min(1, { message: "UoM Influent is required" }),
  EffluentQuantity: z
    .string()
    .min(1, { message: "Effluent Quantity is required" }),
  UoMEffluent: z.string().min(1, { message: "UoM Effluent is required" }),
  WaterRecycledReclaimed: z
    .string()
    .min(1, { message: "Enter Water Recycled/Reclaimed" }),
  UoM_Recycled: z.string().min(1, { message: "UoM Recycled is required" }),
  PointofUsage: z.string().min(1, { message: "Point of Usage is required" }),
  QuantityofWWGenerated: z.string(),
  UoMWWGenerated: z.string(),
  TypeofWWgenerated: z.string(),
  SourceofWWGeneration: z.string(),
  TypeofTreatment: z.string(),
  InfluentBODConcentration: z.string(),
  UoM_BODin: z.string(),
  InfluentCODConcentration: z.string(),
  UoM_CODin: z.string(),
  EffluentBODConcentration: z.string(),
  UoM_BODout: z.string(),
  EffluentCODConcentration: z.string(),
  UoM_CODout: z.string(),
  WaterforIrrigation: z.string(),
  UoM: z.string(),
  SourceofWaterforIrrigation: z.string(),
  QuantityofWaterDischarged: z.string(),
  UOMQuantityofWaterDischarged: z.string(),
  PointofDischarge: z.string(),
  QuantityofWaterHarvested: z.string(),
  UOMQuantityofWaterHarvested: z.string(),
  TechniqueUsed: z.string(),
  QuantityofSludgeGenerated: z.string(),
  UOMQuantityofSludgeGenerated: z.string(),
  SludgeTreatment: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;

const Water = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      ManpowerNoofEmployees: "",
      RawFreshWaterWithdrawal: "",
      UoMRawWater: "",
      SourceofRawFreshWater: "",
      QuantityofWWGenerated: "",
      UoMWWGenerated: "",
      TypeofWWgenerated: "",
      SourceofWWGeneration: "",
      TreatmentFacilityAvailable: "",
      TypeofTreatment: "",
      InfluentQuantity: "",
      UoMInfluent: "",
      InfluentBODConcentration: "",
      UoM_BODin: "",
      InfluentCODConcentration: "",
      UoM_CODin: "",
      EffluentQuantity: "",
      UoMEffluent: "",
      EffluentBODConcentration: "",
      UoM_BODout: "",
      EffluentCODConcentration: "",
      UoM_CODout: "",
      WaterRecycledReclaimed: "",
      UoM_Recycled: "",
      PointofUsage: "",
      WaterforIrrigation: "",
      UoM: "",
      SourceofWaterforIrrigation: "",
      QuantityofWaterDischarged: "",
      UOMQuantityofWaterDischarged: "",
      PointofDischarge: "",
      QuantityofWaterHarvested: "",
      UOMQuantityofWaterHarvested: "",
      TechniqueUsed: "",
      QuantityofSludgeGenerated: "",
      UOMQuantityofSludgeGenerated: "",
      SludgeTreatment: "",
    },
  });

  const onSubmitForm: SubmitHandler<FormSchemaType> = (data: any) => {
    console.log("watereForm", data);
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack gap="md" px="md">
          <FormHeader header="Water Details" text="" />
          <Grid>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="ManpowerNoofEmployees"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Manpower (No. of Employees)"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("ManpowerNoofEmployees")}
                    placeholder="Enter Manpower (No. of Employees)"
                    error={
                      errors.ManpowerNoofEmployees &&
                      errors.ManpowerNoofEmployees.message
                    }
                    withAsterisk
                    // allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="RawFreshWaterWithdrawal"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("RawFreshWaterWithdrawal")}
                    label="Raw/Fresh Water Withdrawal"
                    placeholder="Enter Raw/Fresh Water Withdrawal"
                    error={
                      errors.RawFreshWaterWithdrawal &&
                      errors.RawFreshWaterWithdrawal.message
                    }
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoMRawWater"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Raw Water"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoMRawWater")}
                    placeholder="Enter UoM Raw Water"
                    error={errors.UoMRawWater && errors.UoMRawWater.message}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="SourceofRawFreshWater"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="Source of Raw/Fresh Water"
                    options={["Ground Water", "Municipal Water Supply"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("SourceofRawFreshWater")}
                    error={
                      errors.SourceofRawFreshWater &&
                      errors.SourceofRawFreshWater.message
                    }
                    placeholder="Select Source of Raw/Fresh Water"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QuantityofWWGenerated"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of WW Generated"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("QuantityofWWGenerated")}
                    placeholder="Enter Quanity of WW Generated"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoMWWGenerated"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Quantity of WW Generated"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoMWWGenerated")}
                    placeholder="Select Quantity of WW Generated"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="TypeofWWgenerated"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="Type of WW Generated"
                    options={[
                      "Sewage",
                      "Industrial WW",
                      "Greywater",
                      "BlackWater",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TypeofWWgenerated")}
                    placeholder="Select Type of WW Generated"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="SourceofWWGeneration"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("SourceofWWGeneration")}
                    label="Source of WW Generation"
                    placeholder="Enter Source of WW Generation"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="TreatmentFacilityAvailable"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="Treatment Facility Available"
                    options={["ETP", "STP", "CETP", "WTP", "NA"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TreatmentFacilityAvailable")}
                    error={
                      errors.TreatmentFacilityAvailable &&
                      errors.TreatmentFacilityAvailable.message
                    }
                    placeholder="Select Treatment Facility Available"
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="TypeofTreatment"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TypeofTreatment")}
                    label="Type of Treatment"
                    placeholder="Enter Type of Treatment"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="InfluentQuantity"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Influent Quantity"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("InfluentQuantity")}
                    placeholder="Enter Influent Quantity"
                    error={
                      errors.InfluentQuantity && errors.InfluentQuantity.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoMInfluent"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Influent"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoMInfluent")}
                    placeholder="Select UoM Influent"
                    error={errors.UoMInfluent && errors.UoMInfluent.message}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="InfluentBODConcentration"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Influent BOD Concentration"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("InfluentBODConcentration")}
                    placeholder="Enter Influent BOD Concentration"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoM_BODin"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM BOD In"
                    options={["mg/L", "g/L"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoM_BODin")}
                    placeholder="Select UoM BOD In"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="InfluentCODConcentration"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Influent COD Concentration"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("InfluentCODConcentration")}
                    placeholder="Enter Influent COD Concentration"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoM_CODin"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM COD In"
                    options={["mg/L", "g/L"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoM_CODin")}
                    placeholder="Select UoM COD In"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="EffluentQuantity"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Effluent Quantity"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("EffluentQuantity")}
                    placeholder="Enter Effluent Quantity"
                    error={
                      errors.EffluentQuantity && errors.EffluentQuantity.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoMEffluent"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Effluent"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoMEffluent")}
                    placeholder="Select UoM Influent"
                    error={errors.UoMEffluent && errors.UoMEffluent.message}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="EffluentBODConcentration"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Effluent BOD Concentration"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("EffluentBODConcentration")}
                    placeholder="Enter Effluent BOD Concentration"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoM_BODout"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM BOD Out"
                    options={["mg/L", "g/L"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoM_BODout")}
                    placeholder="Select UoM BOD Out"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="EffluentCODConcentration"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Effluent COD Concentration"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("EffluentCODConcentration")}
                    placeholder="Enter Effluent COD Concentration"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoM_CODout"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM COD Out"
                    options={["mg/L", "g/L"]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoM_CODout")}
                    placeholder="Select UoM COD Out"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="WaterRecycledReclaimed"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Water Recycled/Reclaimed"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("WaterRecycledReclaimed")}
                    placeholder="Enter Water Recycled/Reclaimed"
                    error={
                      errors.WaterRecycledReclaimed &&
                      errors.WaterRecycledReclaimed.message
                    }
                    withAsterisk
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoM_Recycled"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Recycled"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoM_Recycled")}
                    placeholder="Select UoM Recycled"
                    error={errors.UoM_Recycled && errors.UoM_Recycled.message}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="PointofUsage"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    label="Point of Usage"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("PointofUsage")}
                    placeholder="Enter Point of Usage"
                    error={errors.PointofUsage && errors.PointofUsage.message}
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="WaterforIrrigation"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    label="Water for Irrigation"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("WaterforIrrigation")}
                    placeholder="Enter Water for Irrigation"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UoM"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UoM")}
                    label="UoM"
                    placeholder="UoM"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="SourceofWaterforIrrigation"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("SourceofWaterforIrrigation")}
                    label="Source of Water for Irrigation"
                    placeholder="Enter Source of Water for Irrigation"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QuantityofWaterDischarged"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of Water Discharged"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("QuantityofWaterDischarged")}
                    placeholder="Enter Quantity of Water Discharged"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UOMQuantityofWaterDischarged"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Quantity of Water Discharged"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UOMQuantityofWaterDischarged")}
                    placeholder="Select Quantity of Water Discharged"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="PointofDischarge"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    label="Point of Discharge"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("PointofDischarge")}
                    placeholder="Enter Point of Discharge"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QuantityofWaterHarvested"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of Water Harvested"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("QuantityofWaterHarvested")}
                    placeholder="Enter Quantity of Water Harvested"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UOMQuantityofWaterHarvested"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Quantity of Water Harvested"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UOMQuantityofWaterHarvested")}
                    placeholder="Select UoM Quantity of Water Harvested"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="TechniqueUsed"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("TechniqueUsed")}
                    label="Technique Used"
                    placeholder="Enter Technique Used"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="QuantityofSludgeGenerated"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Quantity of Sludge Generated"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("QuantityofSludgeGenerated")}
                    placeholder="Enter Quantity of Sludge Generated"
                    allowDecimal
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="UOMQuantityofSludgeGenerated"
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    label="UoM Quantity of Sludge Generated"
                    options={[
                      "Litre",
                      "Gallon",
                      "Million Litres",
                      "KLD",
                      "MLD",
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    register={register("UOMQuantityofSludgeGenerated")}
                    placeholder="Select UoM Quantity of Sludge Generated"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="SludgeTreatment"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("SludgeTreatment")}
                    label="Sludge Treatment"
                    placeholder="Enter Sludge Treatment"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Flex gap={20} mt="sm">
                <Button type="submit" size="xs" radius="xl" color="#72D0C6">
                  Add Data
                </Button>
              </Flex>
            </GridCol>
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default Water;
