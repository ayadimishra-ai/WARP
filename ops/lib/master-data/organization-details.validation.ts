import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "../auth/auth.client";
import { TUserDetailsType } from "./organization-details.service";

const getOrganizationSchema = z.object({
  userId: z.string().uuid({ message: "Invalid UUID format for id" }),
  organizationId: z.string().uuid({ message: "Invalid UUID format for id" }),
});

//==========================================================================================================
//Regex for firsta name and last name where only characters are allowed.
//  Digits and spl. characters are not allowed.
const nameRegex = /^[A-Za-z\s]+$/;

// PAN Regex: 5 letters, 4 digits, 1 letter
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// GST Regex: 2 digits, PAN (10 chars), 1 char (entity), 1 Z, 1 alphanumeric
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// CIN Regex: 21-character corporate identifier
const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

//actual schema
const appUserValidationSchema = z.object({
  first_name: z
    .string()
    .min(2, { message: "First Name is required." })
    .max(50, { message: "First Name should be less than 50 characters." })
    .regex(nameRegex, {
      message: "First Name should contain only letters and spaces.",
    }),
  // last_name: z
  //   .string()
  //   .optional()
  //   .transform((val) => (val === "" ? undefined : val))
  //   .refine(
  //     (val): val is string => !val || (val.length >= 2 && val.length <= 50),
  //     {
  //       message: "Last Name should be between 2 and 50 characters."
  //     }
  //   )
  //   .refine(
  //     (val): val is string => !val || nameRegex.test(val),
  //     {
  //       message: "Last Name should contain only letters and spaces."
  //     }
  //   ),
  last_name: z
    .string()
    .nullable() // Add this to accept null values
    .optional()
    .transform((val) => (val === "" || val === null ? undefined : val)) // Handle both empty string and null
    .refine(
      (val): val is string => !val || (val.length >= 2 && val.length <= 50),
      {
        message: "Last Name should be between 2 and 50 characters.",
      }
    )
    .refine((val): val is string => !val || nameRegex.test(val), {
      message: "Last Name should contain only letters and spaces.",
    }),
  phonenumber: z
    .string()
    .min(1, { message: "Mobile No is required." })
    .max(20, { message: "Mobile number cannot exceed 20 digits." }),
  gstNo: z.string().min(1, { message: "GST No is required." }),
  // .min(15, { message: "GST No should be 15 characters long." })
  // .max(15, { message: "GST No should be 15 characters long." })
  // .regex(gstRegex, { message: "Invalid GST No format." })
});

export const validateGetOrganizationSchema = async (
  userDetailsBody: TUserSession
) => {
  const schema = getOrganizationSchema;
  const result = schema.safeParse(userDetailsBody);
  const formattedErrors = result.error?.format();

  return {
    success: result.success,
    data: result.data,
    errors: formattedErrors,
  };
};

export const validateUpdateAppUserData = async (
  userDetailsBody: TUserDetailsType,
  userSession: TUserSession
) => {
  //zod validation
  const result = appUserValidationSchema.safeParse(userDetailsBody);
  const formattedErrors = result.error?.format();
  if (!result.success) {
    return {
      success: result.success,
      data: result.data,
      errors: formattedErrors,
    };
  }

  // data validation
  const sdk = await getGraphQlServerSDK();
  const userdetails = await sdk.GetAppUserDataAndOrganizationById({
    id: userDetailsBody?.id,
  });

  if (!userdetails) {
    return {
      success: false,
      message: "User not found.",
    };
  } else if (
    userdetails.AppUser[0].organization_id != userSession.organizationId
  ) {
    return {
      success: false,
      message:
        "Current user not allowed to complete this request. Please try again with valid credentials.",
    };
  }

  //check if provided gstno already exist in db or not
  const isGSTNoExistPreviously = await sdk.GetOrganizationByGSTNo({
    gstNo: userDetailsBody.gstNo,
  });

  if (
    isGSTNoExistPreviously?.Organization?.length > 0 &&
    isGSTNoExistPreviously?.Organization[0]?.id !== userSession.organizationId
  ) {
    return {
      success: false,
      message: "GST/License number already exists.",
    };
  }

  //check if provided phonenumber already exist in db or not
  const isPhoneNumberExistPreviously = await sdk.GetAppUserByMobileNo({
    mobileNo: userDetailsBody.phonenumber || "",
  });

  if (
    isPhoneNumberExistPreviously?.AppUser?.length > 0 &&
    isPhoneNumberExistPreviously?.AppUser[0]?.id !== userDetailsBody.id
  ) {
    return {
      success: false,
      message: "Phone Number already exists for another user.",
    };
  }

  return { success: true };
};
