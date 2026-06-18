"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Container,
  Flex,
  Group,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { AxiosError } from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { typeToFlattenedError } from "zod";
import { useOrganizationDetails } from "~/hooks/use-organizaion-details";
import { useUserSession } from "~/hooks/use-user-session";
import { apiClientWithAuth } from "~/lib/fetcher";
import {
  OrganizationLocationFormSchema,
  TOrganizationLocationForm,
} from "~/schemas/organization-locations.schema";
import {
  addEditLocation,
  locationFormSubmitted,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import Spinner from "~/shared/UI/spinner/spinner";
import { sanitiseFormReturnValues } from "~/utils/dom-purifier/dom-purify.client.util";
import { clientEnv } from "~/utils/env/env.client";
import { useCaptchaValidationBeforeSubmit } from "../../hooks/google-invisible-recaptcha";
import "./addLocationForm.css";
const AddLocationForm = () => {
  const organizationDetails = useOrganizationDetails();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(organizationDetails.loading);
  const session = useUserSession();

  const searchParams = useSearchParams();
  const address_id = searchParams.get("address_id");
  const [countries, setCountries] = useState<
    { label: string; value: string }[]
  >([]);
  const [states, setStates] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const form = useForm<TOrganizationLocationForm>({
    resolver: zodResolver(
      OrganizationLocationFormSchema(
        // !!organizationDetails.hasWaterActivity === true ? true : false,
        // !!organizationDetails.hasWWTP,
        !!organizationDetails.hasWWTP && !!organizationDetails.hasWaterActivity,
        !!address_id
      )
    ),
    defaultValues:{
      code:""
    }
  });

  // Watch form values for dependent fields
  const watchedOwnershipType = form.watch("ownership_type");
  const watchedType = form.watch("type");
  const watchedCountryId = form.watch("country_id");
  const watchedStateId = form.watch("state_id");

  // Options for select fields
  // const locationTypeOptions = [
  //   { value: "Manufacturing", label: "Manufacturing" },
  //   { value: "NonManufacturing", label: "Non Manufacturing" },
  // ];

  const getlocationTypeOptions = () => {
    if (watchedOwnershipType === "Contract") {
      return [{ value: "Manufacturing", label: "Manufacturing" }];
    }
    return [
      { value: "Manufacturing", label: "Manufacturing" },
      { value: "NonManufacturing", label: "Non Manufacturing" },
    ];
  };

  // Filter ownership type options based on location type
  const getOwnershipTypeOptions = () => {
    if (watchedType === "NonManufacturing") {
      return [{ value: "Own", label: "Own" }];
    }
    return [
      { value: "Own", label: "Own" },
      { value: "Contract", label: "Contract" },
    ].sort((a, b) => a.label.localeCompare(b.label));
  };

  const facilityTypeOptions = [
    { value: "Registered Office", label: "Registered Office" },
    { value: "Factory", label: "Factory" },
    { value: "Warehouse", label: "Warehouse" },
  ];

  const fetchCountries = async () => {
    try {
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/org-master-data/country"
      );

      if (response.status === 200) {
        const { data } = response.data;

        const countries = data.Country.map((c: any) => ({
          value: c.id,
          label: c.name,
        }));

        setCountries(countries);
        form.setValue("state_id", "");
        form.setValue("city_id", "");
      }
    } catch (err) {
      console.error("Error fetching countries", err);
      setCountries([]);
    }
  };

  const fetchStates = async (countryId: string, isEditMode = false) => {
    try {
      setStates([]);
      setCities([]);
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/org-master-data/state",
        {
          method: "GET",
          headers: {
            country_id: String(countryId),
          },
        }
      );

      if (response.status === 200) {
        const { data } = response.data;
        const states = data.State.map((c: any) => ({
          value: c.id,
          label: c.name,
        }));

        setStates(states);

        // Only reset city values if not in edit mode
        if (!isEditMode) {
          form.setValue("city_id", "");
          setCities([]);
        }
      }
    } catch (err) {
      console.error("Error fetching states", err);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      setCities([]);
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/org-master-data/city",
        {
          method: "GET",
          headers: {
            state_id: String(stateId),
          },
        }
      );

      if (response.status === 200) {
        const { data } = response.data;
        const cities = data.City.map((c: any) => ({
          value: c.id,
          label: c.name,
        }));
        setCities(cities);
      }
    } catch (err) {
      console.error("Error fetching cities", err);
    }
  };

  // Fetch countries on mount
  useEffect(() => {
    console.log("useEffect-fetchCountries");
    fetchCountries();
  }, []); // Fetch states when country changes

  // useEffect(() => {
  //   if (address_id) {
  //     return;
  //   }
  //   console.log("useEffect-fetchstate", { watchedCountryId });
  //   if (!watchedCountryId) {
  //     // setStates([]);
  //     // setCities([]);
  //     return;
  //   }

  //   fetchStates(watchedCountryId);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [watchedCountryId]);

  // // Fetch cities when state changes
  // useEffect(() => {
  //   if (address_id) {
  //     return;
  //   }
  //   console.log("useEffect-fetchcity", { watchedStateId });
  //   if (!watchedStateId) {
  //     // setCities([]);
  //     return;
  //   }
  //   fetchCities(watchedStateId);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [watchedStateId, editAddressDetails, address_id]);

  // Form validation and management
  // inside AddLocationForm

  useEffect(() => {
    if (!!address_id) {
      getAddressData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAddressData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/organization-locations/form",
        {
          headers: {
            address_id: String(address_id),
          },
        }
      );

      if (response.status === 200) {
        if (!response.data.success) {
          console.error("Failed to fetch address data");
          return;
        }

        const addressData = response.data.data;

        // Set basic form values first
        form.setValue("address_id", addressData.id);
        form.setValue("code", addressData.code);
        form.setValue("name", addressData.name);
        form.setValue("type", addressData.type);
        form.setValue("ownership_type", addressData.ownership_type);
        form.setValue("facility_type", addressData.facility_type);
        form.setValue("full_address", addressData.full_address);
        form.setValue("pincode", addressData.pincode);
        form.setValue("is_wwtp", addressData.is_wwtp?.toLowerCase());

        // Set country first
        form.setValue("country_id", addressData.country_id);

        // Fetch states for the selected country, then set state
        if (addressData.country_id) {
          await fetchStates(addressData.country_id, true); // Pa
          form.setValue("state_id", addressData.state_id);

          // Fetch cities for the selected state, then set city
          if (addressData.state_id) {
            await fetchCities(addressData.state_id);
            form.setValue("city_id", addressData.city_id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching address data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(
    async (values: TOrganizationLocationForm) => {
      setIsLoading(true);
      setIsSubmitting(true);
      captchaValidationBeforeSubmitHandler(async () => {
        const formData = sanitiseFormReturnValues(form);
        const isValidate = await formData.trigger();
        if (isValidate) {
          // For PUT requests (editing), we need to include the id in the request body
          const formValues = formData.getValues();

          formValues.is_wwtp =
            !!organizationDetails.hasWWTP &&
            !!organizationDetails.hasWaterActivity
              ? formValues.is_wwtp
              : "no";

          // Clean up the code field - remove if empty or undefined
          if (!formValues.code || formValues.code.trim() === "") {
            delete formValues.code;
          }

          const requestBody = !!address_id
            ? {
                ...formValues,
                address_id: address_id, // Use address_id as the id for the update
              }
            : formValues;

          try {
            const res = await apiClientWithAuth(
              clientEnv.NEXT_PUBLIC_API_BASE_URL +
                "/api/v1/master-data/organization-locations/form",
              {
                method: !!address_id ? "PUT" : "POST",
                data: requestBody,
              }
            );

            // success
            postParentMessage(locationFormSubmitted(false));
            form.reset();
          } catch (error: any) {
            if (error instanceof AxiosError) {
              if (error.status === 400) {
                const errors: typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"] =
                  error.response?.data?.errors;

                if (errors) {
                  setFormErrors(errors);
                }
              }
            }
            console.error(error);
          } finally {
            setIsLoading(false);
            setIsSubmitting(false);
          }
        } else {
          setIsLoading(false);
          setIsSubmitting(false);
        }
      });
    }
  );

  const setFormErrors = (
    errors: typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"]
  ) => {
    Object.keys(errors).forEach((field, index) => {
      const fieldErrors = errors[field as keyof TOrganizationLocationForm];
      if (fieldErrors && fieldErrors.length > 0) {
        if (index === 0) {
          form.setFocus(field as keyof TOrganizationLocationForm);
        }
        form.setError(field as keyof TOrganizationLocationForm, {
          type: "manual",
          message: fieldErrors[0],
        });
      }
    });
  };

  const handleCancel = () => {
    form.reset();
  };

  const fieldStyles = {
    input: {
      fontSize: "12px",
      padding: "9px 12px",
      height: "36px",
    },
  };

  return isLoading || organizationDetails.loading ? (
    <Spinner />
  ) : (
    <Container px={0} size="100%">
      <Card style={{ padding: "0px 5px" }}>
        <form onSubmit={handleSubmit}>
          <Text size="14px" fw={400} mb={0} c="#444444">
            {address_id
              ? "Update the existing location details below."
              : "Fill the form below to add a new location."}
          </Text>
          {/* Location Code and Name */}
          <Group grow gap="xl" mt={20}>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  placeholder="Location Code"
                  {...field}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                />
              )}
            />
          </Group>
          <Group grow gap="xl" mt={20}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  placeholder="Location Name*"
                  withAsterisk
                  {...field}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                />
              )}
            />
          </Group>

          {/* Location Type and Ownership Type */}
          <Group grow gap="xl" mt={20}>
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  placeholder="Select Location Type*"
                  withAsterisk
                  data={getlocationTypeOptions()}
                  {...field}
                  onChange={(value) => {
                    field.onChange(value);
                    // If location type is changed to NonManufacturing and ownership_type is Contract, reset it
                    const ownershipType = form.getValues("ownership_type");

                    // Update the logic to reset dropdown values vice versa
                    if (
                      (value === "NonManufacturing" &&
                        ownershipType === "Contract") ||
                      (value === "Contract" &&
                        form.getValues("type") === "NonManufacturing")
                    ) {
                      form.setValue("type", "");
                      form.setValue("ownership_type", "");
                    }
                  }}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  allowDeselect={false}
                />
              )}
            />
          </Group>
          <Group grow gap="xl" mt={20}>
            <Controller
              name="ownership_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  placeholder="Select Ownership Type*"
                  withAsterisk
                  data={getOwnershipTypeOptions()}
                  {...field}
                  // onChange={(value) => {
                  //   field.onChange(value);
                  // }}
                  onChange={(value) => {
                    field.onChange(value);
                    // Update the logic to reset dropdown values vice versa
                    if (
                      value === "Contract" &&
                      form.getValues("type") === "NonManufacturing"
                    ) {
                      form.setValue("type", "");
                      form.setValue("ownership_type", "");
                    }
                  }}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  allowDeselect={false}
                />
              )}
            />
          </Group>

          {/* Facility Type */}
          <Group grow gap="xl" mt={20}>
            <Controller
              name="facility_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  placeholder="Select Facility Type*"
                  withAsterisk
                  data={facilityTypeOptions.sort((a, b) =>
                    a.label.localeCompare(b.label)
                  )}
                  {...field}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  allowDeselect={false}
                />
              )}
            />
          </Group>

          {/* Full Address */}
          <Group grow gap="xl" mt={20}>
            <Controller
              name="full_address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Textarea
                  placeholder="Enter Location Full Address*"
                  withAsterisk
                  rows={2}
                  {...field}
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
                  error={fieldState.error?.message}
                />
              )}
            />
          </Group>

          {/* Country and State */}
          <Group grow gap="xl" mt={20}>
            <Controller
              name="country_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  placeholder="Select Country*"
                  withAsterisk
                  data={
                    countries?.sort((a, b) => a.label.localeCompare(b.label)) ||
                    []
                  }
                  {...field}
                  onChange={async (value) => {
                    field.onChange(value);
                    // Reset dependent fields when country changes
                    form.resetField("state_id");
                    form.resetField("city_id");
                    setStates([]);
                    setCities([]);
                    if (value) await fetchStates(value);
                  }}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  allowDeselect={false}
                  searchable
                />
              )}
            />
          </Group>
          <Group grow gap="xl" mt={20}>
            <Controller
              name="state_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  placeholder="Select State*"
                  withAsterisk
                  data={
                    states?.sort((a, b) => a.label.localeCompare(b.label)) || []
                  }
                  {...field}
                  value={field.value || null}
                  key={`state-${watchedCountryId}`}
                  onChange={async (value) => {
                    field.onChange(value);
                    // Reset dependent field when state changes
                    form.resetField("city_id");
                    setCities([]);
                    if (value) await fetchCities(value);
                  }}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  allowDeselect={false}
                  searchable
                  disabled={!watchedCountryId}
                />
              )}
            />
          </Group>

          {/* City and Pin Code */}
          <Group grow gap="xl" mt={20}>
            <Controller
              name="city_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  placeholder="Select City*"
                  withAsterisk
                  data={
                    cities?.sort((a, b) => a.label.localeCompare(b.label)) || []
                  }
                  {...field}
                  value={field.value || null}
                  key={`city-${watchedStateId}`}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  allowDeselect={false}
                  searchable
                  disabled={!watchedStateId}
                />
              )}
            />
          </Group>
          <Group grow gap="xl" mt={20}>
            <Controller
              name="pincode"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  placeholder="Enter Pin or Zip Code*"
                  withAsterisk
                  {...field}
                  styles={fieldStyles}
                  error={fieldState.error?.message}
                  maxLength={20}
                />
              )}
            />
          </Group>

          {/* Wastewater Treatment Plant */}
          {!organizationDetails.error &&
            organizationDetails.data &&
            organizationDetails.hasWWTP &&
            organizationDetails.hasWaterActivity && (
              <Group grow gap="xl" mt={20}>
                <Controller
                  name="is_wwtp"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Select
                      placeholder="Do you have a wastewater treatment plant?*"
                      withAsterisk
                      data={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                      {...field}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      styles={fieldStyles}
                      error={fieldState.error?.message}
                      allowDeselect={false}
                    />
                  )}
                />
              </Group>
            )}

          {/* Action Buttons */}
          <Flex gap="md" mt={40} justify="flex-end">
            <Button
              variant="outline"
              color="#005C81"
              fw={600}
              fz={12}
              h={36}
              px={32}
              radius="24px"
              onClick={() => {
                postParentMessage(addEditLocation(false, ""));
                handleCancel();
              }}
              disabled={isSubmitting}
              className="noAnimationButton"
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
              fw={600}
              fz={12}
              h={36}
              px={32}
              radius="24px"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="noAnimationButton filledGradientButton"
            >
              SUBMIT
            </Button>
          </Flex>
        </form>
      </Card>
    </Container>
  );
};

export default AddLocationForm;
