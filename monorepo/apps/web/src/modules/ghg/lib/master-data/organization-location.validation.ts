import { type typeToFlattenedError } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  OrganizationLocationFormSchema,
  TOrganizationLocationForm,
} from "@/modules/ghg/schemas/organization-locations.schema";
import { insertAddressBodytype } from "./organization-location.service";
export const responseObject: { sucess: boolean; message: string } = {
  sucess: false,
  message: "",
};

export const validateOrganizationFormInput = (
  address: insertAddressBodytype,
  hasWWTP: boolean,
  address_id: string | null = null
) => {
  try {
    const schema = OrganizationLocationFormSchema(hasWWTP, !!address_id, true);
    const result = schema.safeParse(address);

    const errors = result.error?.flatten()?.fieldErrors;

    if (result.success) {
      return {
        success: true,
        errors: null,
      };
    } else {
      return {
        success: false,
        errors: errors,
      };
    }
  } catch (err) {
    console.error("Error in validateOrganizationFormInput:", err);
    return {
      success: false,
      errors: err,
    };
  }
};

export const validateInsertRequestData = async (
  address: TOrganizationLocationForm,
  organization_id: string
) => {
  const sdk = await getGraphQlServerSDK();

  let result = await sdk.GetAddressesByLocationCodeAndName({
    organizationId: organization_id,
    locationName: address.name.trim(),
  });

  if (result.OrganizationAddress && result.OrganizationAddress.length > 0) {
    return {
      success: false,
      errors: {
        name: ["Location already exists."],
      } as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
    };
  }

  if (address?.code && address?.code?.length > 0) {
    const codeExists = await sdk.GetAddressesByLocationCode({
      organizationId: organization_id,
      locationCode: address.code.trim(),
    });

    if (
      codeExists?.OrganizationAddress &&
      codeExists?.OrganizationAddress.length > 0
    ) {
      return {
        success: false,
        errors: {
          code: ["Location code already exists."],
        } as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
      };
    }
  }

  return {
    success: true,
    errors: null,
  };
};

export const validateUpdateRequestData = async (
  address: TOrganizationLocationForm,
  organization_id: string
) => {
  const sdk = await getGraphQlServerSDK();

  let resp = await sdk.GetOrganizationAddressIdByAddressId({
    addressId: address.address_id,
    organizationId: organization_id,
  });

  if (resp.OrganizationAddress.length < 1) {
    return {
      success: false,
      errors: {
        address_id: ["Address not found."],
        name: ["Address not found."],
      } as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
    };
  }

  if (address?.code && address?.code?.length > 0) {
    const codeExists = await sdk.GetAddressesByLocationCode({
      organizationId: organization_id,
      locationCode: address.code.trim(),
    });

    if (
      codeExists?.OrganizationAddress &&
      codeExists?.OrganizationAddress.length > 0
    ) {
      for (const loc of codeExists.OrganizationAddress) {
        if (loc?.Address?.id !== address?.address_id) {
          return {
            success: false,
            errors: {
              code: ["Location code already exists."],
            } as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
          };
        }
      }
    }
  }

  const organizationAddress = resp.OrganizationAddress[0];

  const organizationAddressData =
    await sdk.GetActivityDataByOrganizationAddressID({
      organization_address_id: organizationAddress.id,
    });

  let addressHasData = false;

  if (
    organizationAddressData.ActivityTaskRequest.length > 0 ||
    organizationAddressData.DataImportHistory.length > 0 ||
    organizationAddressData.TaskRequest.length > 0
  ) {
    addressHasData = true;
  }

  if (addressHasData) {
    return {
      success: false,
      errors: {
        address_id: ["Address is being used in activity data."],
        name: ["Address is being used in activity data."],
      } as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
    };
  }

  const getAddressDetails = await sdk.getOrganizationAddressOtherThanUpdate({
    organizationId: organization_id,
    addressId: address.address_id,
    updateAddressName: address.name.trim(),
  });

  const doesAddressExistWithSameName =
    getAddressDetails?.OrganizationAddress &&
    getAddressDetails?.OrganizationAddress.length > 0 &&
    !!getAddressDetails?.OrganizationAddress[0].Address;

  if (doesAddressExistWithSameName) {
    return {
      success: false,
      errors: {
        name: ["Address already exists."],
      } as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
    };
  }

  return {
    success: true,
    errors:
      {} as typeToFlattenedError<TOrganizationLocationForm>["fieldErrors"],
  };
};
