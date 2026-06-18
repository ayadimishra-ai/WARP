"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Flex,
  Group,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { opsUserType } from "@/modules/ghg/shared/constants/input.constant";
import {
  addEditUser,
  postParentMessage,
  userFormSubmitted,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import Spinner from "@/modules/ghg/shared/UI/spinner/spinner";
import { clientEnv } from "@/modules/ghg/utils/env/env.client";
import { useCaptchaValidationBeforeSubmit } from "../../hooks/google-invisible-recaptcha";
import PhoneNumberInput from "../ui/PhoneNumberInput";
import "./addUserForm.css";
// Zod validation schema
const addUserSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Only 50 characters are allowed")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed")
    .transform((val) => val.trim()),
  role: z.string().min(1, "User role is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .transform((val) => val.trim()),
  mobile: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleanValue = val.replace(/\s/g, "");
      return /^[0-9]*$/.test(cleanValue);
    }, "Only numbers are allowed")
    .refine((val) => {
      if (!val) return true;
      return val.length <= 20;
    }, "Mobile number cannot exceed 20 digits.")
    .transform((val) => val?.trim() || ""),
  mobileCountryCode: z.string().default("IN"),
});

export type AddUserFormData = z.infer<typeof addUserSchema>;

const AddUserForm = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams?.get("id");
  const session = useUserSession();
  const [isLoading, setIsLoading] = useState(true);
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();

  // User role options
  const userRoleOptions = [
    { value: "", label: "Select User Role*" },
    {
      value: opsUserType?.OrganizationAdmin?.value,
      label: opsUserType?.OrganizationAdmin?.label,
    },
    {
      value: opsUserType?.LocationExecutive?.value,
      label: opsUserType?.LocationExecutive?.label,
    },
  ];

  // Form validation and management
  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema) as unknown as Resolver<AddUserFormData>,
    defaultValues: {
      id: "",
      name: "",
      role: "",
      email: "",
      mobile: "",
      mobileCountryCode: "IN",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!!userId) {
      getUserData();
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await fetch(
        clientEnv.NEXT_PUBLIC_API_BASE_URL +
          "/api/v1/master-data/users/listing",
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-sk-op-authorization": String(params?.accessToken as string),
            organization_id: String(params?.organizationId),
            userId: String(userId),
          },
        }
      ).then((response) => {
        if (response?.statusText == "OK" && response?.status == 200) {
          return response.json();
        }
      });

      if (userData?.data?.userList?.length > 0) {
        const mobile = userData?.data?.userList[0]?.metadata?.mobile || "";
        const mobileCountryCode =
          userData?.data?.userList[0]?.metadata?.mobileCountryCode || "IN";

        form.setValue("id", userData?.data?.userList[0]?.id || "");
        form.setValue("name", userData?.data?.userList[0]?.name || "");
        form.setValue("role", userData?.data?.userList[0]?.role || "");
        form.setValue("email", userData?.data?.userList[0]?.email || "");
        form.setValue("mobile", mobile);
        form.setValue("mobileCountryCode", mobileCountryCode);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const onSubmit = async (values: AddUserFormData) => {
    console.log({ values });

    setIsLoading(true);
    // captchaValidationBeforeSubmitHandler(async () => {
    try {
      const userData = await fetch(
        clientEnv.NEXT_PUBLIC_API_BASE_URL + "/api/v1/master-data/users/form",
        {
          method: !!userId ? "PUT" : "POST",
          headers: {
            "content-type": "application/json",
            "x-sk-op-authorization": String(params?.accessToken as string),
            organization_id: String(params?.organizationId),
            userId: String(userId),
            sessionUserId: String(session?.userId),
          },
          body: JSON.stringify([values]),
        }
      ).then(async (response) => {
        if (response?.statusText == "OK" && response?.status == 200) {
          const responseData = await response.json();
          if (responseData?.data?.length > 0) {
            if (responseData?.data[0].data === null) {
              const serverError = responseData.data[0];
              if (serverError?.message?.email) {
                form.setError("email", {
                  type: "server",
                  message: serverError.message.email,
                });
              }
              setIsLoading(false);
            } else {
              // Set individual field errors from server response
              responseData.data.forEach((item: Record<string, string>) => {
                const fieldName = String(
                  Object.keys(item)[0]
                ) as keyof AddUserFormData;
                const errorMessage = Object.values(item)[0];
                form.setError(fieldName, { message: errorMessage });
              });
            }
          }
          if (responseData?.success) {
            form.reset();
            postParentMessage(userFormSubmitted(false));
          }
        } else {
          postParentMessage(userFormSubmitted(true));
        }
      });
    } catch (error) {
      console.error("Error adding user:", error);
      // Handle error - you might want to show a notification here
    } finally {
      setIsLoading(false);
    }
    // });
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <Card style={{ padding: "0px 24px" }}>
      <Text size="14px" fw={400} mb={0} c="#444444">
        {!!userId
          ? "Fill out the form below to update user."
          : "Fill out the form below to add a new user."}
      </Text>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <input {...form.register("id")} style={{ display: "none" }} />
        {/* Name Field */}
        <Group grow gap="xl" mt={25}>
          <TextInput
            placeholder="Name*"
            withAsterisk
            {...form.register("name")}
            error={form.formState.errors.name?.message}
            styles={{
              input: {
                fontSize: "12px",
                padding: "9px 12px",
                height: "36px",
                color: "#444444", // Color for actual input text
                "&::placeholder": {
                  color: "#ADB5BD", // Color specifically for placeholder
                },
              },
            }}
          />
        </Group>

        {/* User Role Field */}
        <Group grow gap="xl" mt={20}>
          <Select
            placeholder="Select User Role*"
            withAsterisk
            data={userRoleOptions}
            {...form.register("role")}
            value={form.watch("role")}
            onChange={(value) => form.setValue("role", value || "")}
            error={form.formState.errors.role?.message}
            styles={{
              input: {
                fontSize: "12px",
                padding: "9px 12px",
                height: "36px",
                color: "#444444", // Color for actual input text
                "&::placeholder": {
                  color: "#ADB5BD", // Color specifically for placeholder
                },
              },
            }}
          />
        </Group>

        {/* Email Field */}
        <Group grow gap="xl" mt={20}>
          <TextInput
            placeholder="Email Address*"
            withAsterisk
            type="email"
            {...form.register("email")}
            disabled={!!userId}
            error={form.formState.errors.email?.message}
            styles={{
              input: {
                fontSize: "12px",
                padding: "9px 12px",
                height: "36px",
                color: "#444444", // Color for actual input text
                "&::placeholder": {
                  color: "#ADB5BD", // Color specifically for placeholder
                },
              },
            }}
          />
        </Group>

        {/* Mobile Number Field */}
        <Group grow gap="xl" mt={20}>
          <Controller
            name="mobile"
            control={form.control}
            render={({ field, fieldState }) => (
              <Controller
                name="mobileCountryCode"
                control={form.control}
                render={({ field: countryCodeField }) => (
                  <PhoneNumberInput
                    defaultCountry={"IN"}
                    value={{
                      value: field.value || "",
                      countryCode: countryCodeField.value || "IN",
                    }}
                    onChangeHandler={(value, countryCode) => {
                      field.onChange(value);
                      countryCodeField.onChange(countryCode);
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
            )}
          />
        </Group>

        {/* Action Buttons */}
        <Flex gap="md" mt={40} justify="flex-end">
          <Button
            onClick={() => {
              postParentMessage(addEditUser(false, ""));
            }}
            variant="outline"
            fw={600}
            fz={12}
            h={36}
            px={32}
            radius="24px"
            className="noAnimationButton"
            styles={{
              root: {
                borderColor: "#005C81",
                color: "#005C81",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
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
            className="noAnimationButton filledGradientButton"
            // onClick={() => handleSubmit(formData)}
          >
            SUBMIT
          </Button>
        </Flex>
      </form>
    </Card>
  );
};

export default AddUserForm;
