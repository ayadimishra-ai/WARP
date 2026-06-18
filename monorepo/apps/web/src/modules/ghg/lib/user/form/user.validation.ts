import { z } from "zod";
import { userActivityMappingRow } from "@/modules/ghg/components/common-table/userAndActivityMapping";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { userDetailsType } from "./user.service";
export type apiReturnMessage = {
  sucess: boolean;
  message: { [key: string]: string };
  formattedErrors?: { [key: string]: any };
};
// Zod schema for the AppUser table
const AppUserSchema = (isUpdate: boolean) => {
  return z.object({
    id: isUpdate
      ? z.string().uuid({ message: "Invalid UUID format for id" })
      : z.string().optional(),
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(255, { message: "Name cannot exceed 255 characters" }),
    email: z
      .string()
      .email({ message: "Invalid email format" })
      .max(255, { message: "Email cannot exceed 255 characters" }),
    role: z
      .string({ message: "Invalid role" })
      .max(255, { message: "Role cannot exceed 255 characters" }),
    mobile: z
      .string({ message: "Invalid mobile" })
      .max(20, { message: "Mobile number cannot exceed 20 digits." }),
  });
};

const AppUserActivityPermissionSchema = () => {
  return z.object({
    id: z.string().optional(),
    user_id: z.string().uuid({ message: "Invalid UUID format for userId" }),
    userName: z.string().optional(),
    organization_address_id: z
      .string()
      .uuid({ message: "Invalid UUID format for organization_address_id" }),
    location_name: z
      .string()
      .min(1, { message: "locationName is required" })
      .max(255, { message: "locationName cannot exceed 255 characters" }),
    activities: z.array(z.string(), {
      required_error: "Activity is required",
      invalid_type_error: "Activity must be an array of strings",
    }),
  });
};

export const validateGetAppUsersSchema = async (
  userDetailsBody: userDetailsType[],
  isUpdate: boolean
) => {
  const responseObject: apiReturnMessage[] = [];
  userDetailsBody?.forEach((element) => {
    const result = AppUserSchema(isUpdate).safeParse(element);
    const formattedErrors = result.error?.format();
    responseObject.push({
      sucess: result.success,
      message: {
        zodevalidation: result.success
          ? "validation Schema sucessfull."
          : "validation Schema fail.",
      },
      formattedErrors: formattedErrors,
    });
  });
  return responseObject;
};
export const validateAppUserData = async (
  userDetailsBody: userDetailsType[],
  organizationId: string,
  userId: string,
  isUpdate: boolean
) => {
  const responseObject: apiReturnMessage[] = [];
  const sdk = await getGraphQlServerSDK();
  const whereConditionForEmail: Record<string, any>[] = userDetailsBody?.map(
    (items) => {
      if (isUpdate) {
        return {
          email: { _eq: items?.email },
          id: { _neq: items?.id },
          is_deleted: { _eq: false },
        };
      } else {
        return {
          email: { _eq: items?.email },
          is_deleted: { _eq: false },
        };
      }
    }
  );
  const userDetails = await sdk.getAppUserData({
    where: { _or: whereConditionForEmail },
  });
  let respOrganization = await sdk.getOrgData({
    organizationId: organizationId,
  });
  if (userDetails?.AppUser.length > 0) {
    responseObject.push({
      sucess: false,
      message: {
        email: "EmailId is already present.",
      },
    });
    return responseObject;
  }

  const whereConditionForMobile: Record<string, any>[] = userDetailsBody
    ?.filter((items) => !!items?.mobile)
    ?.map((items) => {
      if (isUpdate) {
        return {
          metadata: { _contains: { mobile: items.mobile } },
          id: { _neq: items?.id },
          is_deleted: { _eq: false },
        };
      } else {
        return {
          metadata: { _contains: { mobile: items.mobile } },
          is_deleted: { _eq: false },
        };
      }
    });
  const userDetailsbyMobile = await sdk.getAppUserData({
    where: { _or: whereConditionForMobile },
  });
  if (userDetailsbyMobile?.AppUser.length > 0) {
    responseObject.push({
      sucess: false,
      message: {
        mobile: "Mobile number is already present.",
      },
    });
    return responseObject;
  }
  if (
    responseObject?.filter(
      (items: Record<string, any>) => items?.sucess == false
    )?.length > 0
  ) {
    if (respOrganization.Organization.length == 0) {
      responseObject.push({
        sucess: false,
        message: {
          organization: "Please use correct organization.",
        },
      });
      return responseObject;
    }
  }

  return responseObject;
};
export const validateGetAppUsersActivityPermissionSchema = async (
  userActivityPermissionBody: userActivityMappingRow[]
) => {
  const responseObject: apiReturnMessage[] = [];
  userActivityPermissionBody?.forEach((element) => {
    const result = AppUserActivityPermissionSchema().safeParse(element);
    responseObject.push({
      sucess: result.success,
      message: {
        zodevalidation: result.success
          ? "validation Schema sucessfull."
          : "validation Schema fail.",
      },
    });
  });
  return responseObject;
};
export const validateInsertAppUserActivityPermissionData = async (
  userActivityPermissionDetailsBody: userActivityMappingRow[],
  organizationId: string
) => {
  const responseObject: apiReturnMessage[] = [];
  const multipleEntry: any[] = [];
  if (
    userActivityPermissionDetailsBody?.filter((items) => items?.isAdd).length >
    0
  ) {
    userActivityPermissionDetailsBody
      ?.filter((items) => items?.isAdd)
      ?.forEach((element) => {
        if (
          userActivityPermissionDetailsBody
            ?.filter((items) => items?.isAdd)
            ?.filter(
              (items) =>
                items?.organization_address_id ==
                  element?.organization_address_id &&
                items?.user_id == element?.user_id &&
                JSON.stringify(
                  items?.activities
                    ?.filter((activityItem: string) => activityItem !== "All")
                    ?.sort((a: string, b: string) => (a < b ? -1 : 1))
                ) ==
                  JSON.stringify(
                    element?.activities
                      ?.filter((activityItem: string) => activityItem !== "All")
                      ?.sort((a: string, b: string) => (a < b ? -1 : 1))
                  )
            ).length > 1
        ) {
          multipleEntry.push({
            organization_address_id: element?.organization_address_id,
            user_id: element?.user_id,
            activities: element?.activities,
          });
        }
      });
    if (multipleEntry.length > 0) {
      responseObject.push({
        sucess: false,
        message: {
          error:
            multipleEntry
              .map(
                (items) =>
                  items?.user_id +
                  "~" +
                  items?.organization_address_id +
                  "~" +
                  JSON.stringify(items?.activities)
              )
              .join(",") + " are duplicate entries.",
        },
      });
    } else {
      const sdk = await getGraphQlServerSDK();

      const userPermissionDetails = await sdk.getAppUserPermissionData({
        where: {
          _or: [
            {
              organization_id: { _eq: organizationId },
            },
          ],
        },
      });
      let respOrganization = await sdk.getOrgData({
        organizationId: organizationId,
      });
      if (userPermissionDetails?.UserOrganizationAddressMapping.length > 0) {
        const alreadyExist =
          userPermissionDetails?.UserOrganizationAddressMapping.filter(
            (items) =>
              userActivityPermissionDetailsBody
                ?.filter((items) => items?.isAdd)
                ?.some(
                  (item) =>
                    item?.user_id == items?.AppUser?.id &&
                    items?.organization_id == organizationId &&
                    item.organization_address_id ==
                      items?.OrganizationAddress?.id &&
                    JSON.stringify(
                      item?.activities
                        ?.filter(
                          (activityItem: string) => activityItem !== "All"
                        )
                        ?.sort((a: string, b: string) => (a < b ? -1 : 1))
                    ) ==
                      JSON.stringify(
                        items?.activities
                          ?.filter(
                            (activityItem: string) => activityItem !== "All"
                          )
                          ?.sort((a: string, b: string) => (a < b ? -1 : 1))
                      )
                )
          );
        if (!!alreadyExist && alreadyExist.length > 0) {
          responseObject.push({
            sucess: false,
            message: {
              error:
                alreadyExist
                  .map(
                    (items) =>
                      items?.AppUser?.id +
                      "~" +
                      items?.OrganizationAddress?.id +
                      "~" +
                      JSON.stringify(items?.activities)
                  )
                  .join(",") + " are already present.",
            },
          });
        }
      }
      if (
        responseObject?.filter((items) => items?.sucess == false)?.length > 0
      ) {
        if (respOrganization.Organization.length == 0) {
          responseObject.push({
            sucess: false,
            message: {
              organization: "Please use correct organization.",
            },
          });
        }
      }
    }
  }
  return { responseObject };
};
