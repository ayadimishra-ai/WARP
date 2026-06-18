"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Container,
  Flex,
  Group,
  Radio,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useUserSession } from "~/hooks/use-user-session";

const LocationFormSchema = z.object({
  locationCode: z.string().min(2).max(100),
  locationName: z.string().min(2).max(100),
  locationType: z.string().min(2).max(100),
  ownershipType: z.string().min(2).max(100),
  facilityType: z.string().min(2).max(100),
  fullAddress: z.string().min(2).max(200),
  countryId: z.string().min(2).max(100),
  stateId: z.string().min(2).max(100),
  cityId: z.string().min(2).max(100),
  pincode: z.string().min(2).max(10),
  hasWasteWaterTreatmentPlant: z.enum(["Yes", "No"]),
});

type TLocationForm = z.infer<typeof LocationFormSchema>;

const OrganizationLocationsFormPage = () => {
  const session = useUserSession();
  const searchParams = useSearchParams();
  const address_id = searchParams.get("address_id");
  const isSubmitting = false;

  const form = useForm<TLocationForm>({
    resolver: zodResolver(LocationFormSchema),
  });

  const onSubmitHandler: SubmitHandler<TLocationForm> = (data) => {
    console.log(data);
  };

  const fieldStyles = {
    input: {
      fontSize: "12px",
      padding: "9px 12px",
      height: "36px",
      color: "#ADB5BD",
    },
  };

  return (
    <div>
      <h1>Organization Locations Form</h1>
      <Container px={0} size="100%">
        <Card style={{ padding: "0px 5px" }}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)}>
            <Text size="14px" fw={400} mb={0} c="#444444">
              {address_id
                ? "Update the existing location details below."
                : "Fill the form below to add a new location."}
            </Text>
            <Group grow gap="xl" mt={20}>
              <TextInput
                placeholder="Location Code*"
                withAsterisk
                styles={fieldStyles}
                {...form.register("locationCode")}
              />
            </Group>
            <Group grow gap="xl" mt={20}>
              <TextInput
                placeholder="Location Name*"
                withAsterisk
                styles={fieldStyles}
                {...form.register("locationName")}
              />
            </Group>

            {/* Location Type and Ownership Type */}
            <Group grow gap="xl" mt={20}>
              <Controller
                control={form.control}
                name="locationType"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    placeholder="Select Location Type*"
                    withAsterisk
                    styles={fieldStyles}
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </Group>
            <Group grow gap="xl" mt={20}>
              <Controller
                control={form.control}
                name="ownershipType"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    placeholder="Select Ownership Type*"
                    withAsterisk
                    styles={fieldStyles}
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </Group>

            {/* Facility Type */}
            <Group grow gap="xl" mt={20}>
              <Controller
                control={form.control}
                name="facilityType"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    placeholder="Select Facility Type*"
                    withAsterisk
                    styles={fieldStyles}
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </Group>

            {/* Full Address */}
            <Group grow gap="xl" mt={20}>
              <Textarea
                placeholder="Enter Location Full Address*"
                withAsterisk
                rows={2}
                styles={{
                  label: {
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#444444",
                    marginBottom: "8px",
                  },
                  input: {
                    fontSize: "14px",
                    padding: "12px 16px",
                    minHeight: "80px",
                  },
                }}
                {...form.register("fullAddress")}
              />
            </Group>

            {/* Country and State */}
            <Group grow gap="xl" mt={20}>
              <Controller
                control={form.control}
                name="countryId"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    placeholder="Select Country*"
                    withAsterisk
                    styles={fieldStyles}
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </Group>
            <Group grow gap="xl" mt={20}>
              <Controller
                control={form.control}
                name="stateId"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    withAsterisk
                    placeholder="Select State*"
                    styles={fieldStyles}
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </Group>

            {/* City and Pin Code */}
            <Group grow gap="xl" mt={20}>
              <Controller
                control={form.control}
                name="cityId"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    withAsterisk
                    placeholder="Select City*"
                    styles={fieldStyles}
                    error={fieldState?.error?.message}
                  />
                )}
              />
            </Group>
            <Group grow gap="xl" mt={20}>
              <TextInput
                placeholder="Enter Pin or Zip Code*"
                withAsterisk
                {...form.register("pincode")}
              />
            </Group>

            {/* Wastewater Treatment Plant */}
            <Group mt={20}>
              <div>
                <Text size="12px" fw={500} mb={12} c="#444444">
                  Do you have a wastewater treatment plant?
                  <span style={{ color: "red" }}> *</span>
                </Text>
                <Controller
                  control={form.control}
                  name="hasWasteWaterTreatmentPlant"
                  render={({ field, fieldState, formState }) => (
                    <Radio.Group
                      onChange={field.onChange}
                      value={field.value}
                      error={fieldState.error?.message}
                    >
                      <Group mt="xs">
                        <Radio
                          color="#005C81"
                          variant="outline"
                          value={"yes"}
                          label="Yes"
                          disabled={isSubmitting}
                          styles={{
                            label: {
                              fontWeight: 400,
                              fontSize: 12,
                              color: "#444444",
                            },
                          }}
                        />
                        <Radio
                          color="#005C81"
                          variant="outline"
                          value="no"
                          label="No"
                          disabled={isSubmitting}
                          styles={{
                            label: {
                              fontWeight: 400,
                              fontSize: 12,
                              color: "#444444",
                            },
                          }}
                        />
                      </Group>
                    </Radio.Group>
                  )}
                />
              </div>
            </Group>

            {/* Action Buttons */}
            <Flex gap="md" mt={40} justify="flex-end">
              <Button
                variant="outline"
                fw={600}
                fz={12}
                h={36}
                px={32}
                radius="24px"
                onClick={() => {
                  //   postParentMessage(addEditLocation(false, ""));
                }}
                color="#003B52"
                disabled={isSubmitting}
                styles={{
                  root: {
                    "&:hover:not([data-disabled])": {
                      backgroundColor: "#D9D9D9",
                    },
                  },
                }}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                variant="unstyled"
                className="filledGradientButton"
                fw={600}
                fz={12}
                h={36}
                px={32}
                radius="24px"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                SUBMIT
              </Button>
            </Flex>
          </form>
        </Card>
      </Container>
    </div>
  );
};

export default OrganizationLocationsFormPage;
