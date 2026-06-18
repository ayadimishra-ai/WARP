import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, GridCol, Stack } from "@mantine/core";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import FileUploadBlock from "../FileUploadBlock/FileUploadBlock";
import MonthPicker from "../FormComponent/MonthPicker";
import NumberInputField from "../FormComponent/NumberInput";
import TextInputField from "../FormComponent/TextInput";
import FormHeader from "../FormComponent/formHeader";

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  lastModified: z.date(),
});
const schema = z.object({
  numberOfEmployees: z
    .string()
    .min(1, { message: "Number of employees is required" }),
  numberOfOperationalDays: z
    .string()
    .min(1, { message: "Number Of operational days is required" }),
  locationName: z.string(),
  locationId: z.string(),
  locationPin: z.string(),
  locationType: z.string(),
  monthYear: z.date(),
  files: z.array(fileSchema),
});

type FormSchemaType = z.infer<typeof schema>;

const GeneralDetails = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
    control,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      numberOfEmployees: "",
      numberOfOperationalDays: "",
      locationName: "",
      locationId: "",
      locationPin: "",
      locationType: "",
      monthYear: new Date(),
      files: [],
    },
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Function to handle file change
  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const onSubmit: SubmitHandler<FormSchemaType> = (data: any) => {
    // console.log("generalDetails:", data);
    // console.log("uploadedFiles:", uploadedFiles);
    const formDataWithFiles = { ...data, files: uploadedFiles };
    // console.log(formDataWithFiles, "allFormdta");
    reset();
  };

  const tableData = (data: any) => {
    // console.log("123", data);
  };
  // useEffect(() => {
  //   if (isSubmitSuccessful) {
  //     reset(); // Reset the form if submission was successful
  //   }
  // }, [isSubmitSuccessful, reset]);
  // console.log("isSubmitSuccessful:", isSubmitSuccessful);
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md" px="md">
          <FormHeader
            header="General Details"
            text="Provide details on employee strength and operational days in selected facility."
          />
          <Grid>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="numberOfEmployees"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Number of Employees"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("numberOfEmployees")}
                    error={
                      errors.numberOfEmployees &&
                      errors.numberOfEmployees.message
                    }
                    placeholder="Enter Number of Employees"
                    withAsterisk
                    actionIcon={true}
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="numberOfOperationalDays"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Number of Operational Days"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("numberOfOperationalDays")}
                    error={
                      errors.numberOfOperationalDays &&
                      errors.numberOfOperationalDays.message
                    }
                    placeholder="Number of Operational Days"
                    allowDecimal
                    withAsterisk
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="locationName"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("locationName")}
                    label="Location Name"
                    placeholder="Enter Location"
                    disabled
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("locationId")}
                    label="Location ID or Code"
                    placeholder="Enter Location"
                    disabled
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="locationPin"
                control={control}
                render={({ field }) => (
                  <NumberInputField
                    label="Location Pin Code"
                    value={field.value}
                    onChange={field.onChange}
                    register={register("locationPin")}
                    placeholder="Pin code"
                    disabled
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="locationType"
                control={control}
                render={({ field }) => (
                  <TextInputField
                    value={field.value}
                    onChange={field.onChange}
                    register={register("locationType")}
                    label="Location Type"
                    disabled
                    placeholder="Location Type"
                  />
                )}
              />
            </GridCol>
            <GridCol span={{ xs: 12, sm: 6 }}>
              <Controller
                name="monthYear"
                control={control}
                render={({ field }) => (
                  <>
                    <MonthPicker
                      label="Month & Year"
                      register={register("monthYear")}
                      placeholder="Enter Month & Year"
                      onChange={(value: any) => field.onChange(value)}
                      disabled
                    />
                  </>
                )}
              />
            </GridCol>
          </Grid>
          <FileUploadBlock onFilesChange={handleFilesChange} />
        </Stack>
        {/* <Stack justify="center" align="start" pl={15}>
          <Button type="submit" size="xs" radius="xl">
            Add Data
          </Button>
        </Stack> */}
        {/* <Stack pl={3} pr={3}>
          <CommonTable tableData={tableData} />
        </Stack> */}
      </form>
    </>
  );
};
export default GeneralDetails;
