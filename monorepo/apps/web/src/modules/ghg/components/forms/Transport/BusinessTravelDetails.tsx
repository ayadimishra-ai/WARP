import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Grid, GridCol, Stack } from "@mantine/core";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import CheckboxMantine from "../FormComponent/Checkbox";
import NumberInputField from "../FormComponent/NumberInput";
import RadioInput from "../FormComponent/RadioInput";
import SelectDropdown from "../FormComponent/SelectDropdown";
import FormHeader from "../FormComponent/formHeader";

const schema = z.object({
  ModeOfTransport: z.string(),
  VehicleTypeUsedForTransport: z
    .string()
    .min(1, { message: "Select Vehicle Type Used for Transport" }),
  ForRail: z
    .string()
    .min(1, { message: "Vehicle Tranport Used for Rail is required" }),
  ForAir: z
    .string()
    .min(1, { message: "Vehicle Tranport Used for Air is required" }),
  FuelUsedForRoad: z
    .string()
    .min(1, { message: "Fuel Used for Road is required" }),
  FuelUsedForRail: z
    .string()
    .min(1, { message: "Fuel Used for Rail is required" }),
  FuelUsedForAir: z
    .string()
    .min(1, { message: "Fuel Used for Air-Freight is required" }),
  DistancePerTrip: z
    .string()
    .min(1, { message: "Enter Distance per Trip (in Kms)" }),
  NumberOfTrips: z.string().min(1, { message: "Enter Number of Trips" }),
  UoMinKMile: z.string(),
});

type FormSchemaType = z.infer<typeof schema>;

const BusinessTravelDetails = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      ModeOfTransport: "",
      ForRail: "",
      ForAir: "",
      FuelUsedForRoad: "",
      FuelUsedForRail: "",
      FuelUsedForAir: "",
      UoMinKMile: "",
    },
  });

  const onSubmitForm: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log("BusinessForm", data);
  };
  const [modeOfTransport, setModeOfTransport] = useState("");

  const handleModeOfTransportChange = (value: string) => {
    setModeOfTransport(value);
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack gap="md" px="md">
          <FormHeader header="Business Travel Details" text="" />
          <Grid>
            <GridCol span={{ xs: 12, sm: 12 }}>
              <Controller
                name="ModeOfTransport"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    label="Mode of Transport"
                    options={[
                      { label: "Road", value: "road", disabled: false },
                      { label: "Rail", value: "rail", disabled: false },
                      { label: "Air", value: "air", disabled: false },
                    ]}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      handleModeOfTransportChange(value);
                    }}
                    register={register("ModeOfTransport")}
                    error={
                      errors.ModeOfTransport && errors.ModeOfTransport.message
                    }
                  />
                )}
              />
            </GridCol>
            {/* {modeOfTransport !== "" && ( */}
            <GridCol span={{ xs: 12 }}>
              <Grid gutter="xs">
                {(modeOfTransport === "" || modeOfTransport === "road") && (
                  <>
                    <GridCol span={{ xs: 12, sm: 5 }}>
                      <Controller
                        name="VehicleTypeUsedForTransport"
                        control={control}
                        render={({ field }) => (
                          <SelectDropdown
                            label="Vehicle Type Used for Transport"
                            options={[
                              "4 Wheeler - Diesel",
                              "4 Wheeler - Petrol",
                              "2 Wheeler - Petrol",
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            register={register("VehicleTypeUsedForTransport")}
                            error={
                              errors.VehicleTypeUsedForTransport &&
                              errors.VehicleTypeUsedForTransport.message
                            }
                            placeholder="Select Vehicle Type Used for Transport"
                            withAsterisk
                            description="For Road"
                          />
                        )}
                      />
                    </GridCol>
                  </>
                )}
                {(modeOfTransport === "" || modeOfTransport === "rail") && (
                  <GridCol span={{ xs: 12, sm: 4 }}>
                    <Box
                      mt={{
                        base: modeOfTransport === "rail" ? "0" : "",
                        xs: modeOfTransport === "rail" ? "0" : "",
                        sm: modeOfTransport === "rail" ? "0" : "12px",
                      }}
                    >
                      <Controller
                        name="ForRail"
                        control={control}
                        render={({ field }) => (
                          <CheckboxMantine
                            isSiblingGrid={
                              modeOfTransport === "rail" ? false : true
                            }
                            value={field.value}
                            label={
                              modeOfTransport === "rail"
                                ? "Vehicle Type Used for Transport"
                                : ""
                            }
                            options={[
                              {
                                label: "Suburban",
                                value: "suburban",
                                disabled: false,
                              },
                              {
                                label: "Non suburban",
                                value: "non suburban",
                                disabled: false,
                              },
                            ]}
                            onChange={field.onChange}
                            register={register("ForRail")}
                            error={errors.ForRail && errors.ForRail.message}
                            description="For Rail"
                            withAsterisk={
                              modeOfTransport === "rail" ? true : false
                            }
                          />
                        )}
                      />
                    </Box>
                  </GridCol>
                )}
                {(modeOfTransport === "" || modeOfTransport === "air") && (
                  <GridCol span={{ xs: 12, sm: 3 }}>
                    <Box
                      mt={{
                        base: modeOfTransport === "air" ? "0" : "",
                        xs: modeOfTransport === "air" ? "0" : "",
                        sm: modeOfTransport === "air" ? "0" : "12px",
                      }}
                    >
                      <Controller
                        name="ForAir"
                        control={control}
                        render={({ field }) => (
                          <CheckboxMantine
                            isSiblingGrid={
                              modeOfTransport === "air" ? false : true
                            }
                            label={
                              modeOfTransport === "air"
                                ? "Vehicle Type Used for Transport"
                                : ""
                            }
                            options={[
                              {
                                label: "Airplane",
                                value: "airplane",
                                disabled: false,
                              },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            register={register("ForAir")}
                            error={errors.ForAir && errors.ForAir.message}
                            description="For Air"
                            withAsterisk={
                              modeOfTransport === "air" ? true : false
                            }
                          />
                        )}
                      />
                    </Box>
                  </GridCol>
                )}
              </Grid>
            </GridCol>
            {/* )} */}
            <GridCol span={{ xs: 12 }}>
              <Grid gutter="xs">
                {(modeOfTransport === "" || modeOfTransport === "road") && (
                  <GridCol span={{ xs: 12, sm: 5 }}>
                    <Controller
                      name="FuelUsedForRoad"
                      control={control}
                      render={({ field }) => (
                        <RadioInput
                          label="Fuel Used"
                          options={[
                            {
                              label: "Diesel",
                              value: "diesel",
                              disabled: false,
                            },
                            {
                              label: "Petrol",
                              value: "petrol",
                              disabled: false,
                            },
                            { label: "CNG", value: "cng", disabled: false },
                            {
                              label: "Electric",
                              value: "electric",
                              disabled: false,
                            },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          register={register("FuelUsedForRoad")}
                          error={
                            errors.FuelUsedForRoad &&
                            errors.FuelUsedForRoad.message
                          }
                          withAsterisk
                          description="For Road"
                        />
                      )}
                    />
                  </GridCol>
                )}
                {(modeOfTransport === "" || modeOfTransport === "rail") && (
                  <GridCol span={{ xs: 12, sm: 3 }}>
                    <Box
                      mt={{
                        base: modeOfTransport === "rail" ? "0" : "",
                        xs: modeOfTransport === "rail" ? "0" : "",
                        sm: modeOfTransport === "rail" ? "0" : "12px",
                      }}
                    >
                      <Controller
                        name="FuelUsedForRail"
                        control={control}
                        render={({ field }) => (
                          <RadioInput
                            label={
                              modeOfTransport === "rail" ? "Fuel Used" : ""
                            }
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
                            register={register("FuelUsedForRail")}
                            error={
                              errors.FuelUsedForRail &&
                              errors.FuelUsedForRail.message
                            }
                            description="For Rail"
                            withAsterisk={
                              modeOfTransport === "rail" ? true : false
                            }
                          />
                        )}
                      />
                    </Box>
                  </GridCol>
                )}
                {(modeOfTransport === "" || modeOfTransport === "air") && (
                  <GridCol span={{ xs: 12, sm: 4 }}>
                    <Box
                      mt={{
                        base: modeOfTransport === "air" ? "0" : "",
                        xs: modeOfTransport === "air" ? "0" : "",
                        sm: modeOfTransport === "air" ? "0" : "12px",
                      }}
                    >
                      <Controller
                        name="FuelUsedForAir"
                        control={control}
                        render={({ field }) => (
                          <RadioInput
                            label={modeOfTransport === "air" ? "Fuel Used" : ""}
                            options={[
                              {
                                label: "Air Fuel",
                                value: "air-fuel",
                                disabled: false,
                              },
                              {
                                label: "SAF (Sustainable aviation fuel)",
                                value: "saf",
                                disabled: false,
                              },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            register={register("FuelUsedForAir")}
                            error={
                              errors.FuelUsedForAir &&
                              errors.FuelUsedForAir.message
                            }
                            description="For Air-Freight"
                            withAsterisk={
                              modeOfTransport === "air" ? true : false
                            }
                          />
                        )}
                      />
                    </Box>
                  </GridCol>
                )}
              </Grid>
            </GridCol>
            <GridCol span={{ xs: 12, sm: 5 }}>
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

            <GridCol span={{ xs: 12, sm: 3 }}>
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
            <GridCol span={{ xs: 12, sm: 4 }}>
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
                    placeholder="Enter Number of trips"
                    withAsterisk
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
              {/* <ListOfBusinessTravelDetailsTable /> */}
            </GridCol>
          </Grid>
          <FileUploadBlock />
        </Stack>
      </form>
    </>
  );
};
export default BusinessTravelDetails;
