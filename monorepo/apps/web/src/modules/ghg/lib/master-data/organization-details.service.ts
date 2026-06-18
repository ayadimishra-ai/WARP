import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GetAppUserDataAndOrganizationByIdQuery } from "@/modules/ghg/graphql/shared/types";
import { YearStartMonth, YearTypeValue } from "@/modules/ghg/utils/enums";
import { TUserSession } from "../auth/auth.client";

export type TGetOrganizationDetailsType = {
  userId_id: UUID;
  organization_id: UUID;
};

export type TUserDetailsType = {
  gstNo: string;
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  organization_id?: string;
  role?: string;
  metadata?: any;
  is_deleted?: boolean;
  created_by?: string;
  updated_by?: string;
  is_spoc?: boolean;
  phonenumber?: string;
  mobileCountryCode?: string;
  industryType: string;
  hasWasteWaterTreatmentPlant: boolean;
  is_review_saved: boolean;
  parentCompany: string;
  registeredCountry: string;
  registeredState: string;
  yearType: string;
  baselineYear?: number;
};

//get organization as well as user's details who is SPOC person for that organization
export async function getOrganizationDetail(userSession: TUserSession) {
  const sdk = await getGraphQlServerSDK();

  //get specified users and organizations details
  const userOrgDetails = await sdk.GetAppUserDataAndOrganizationById({
    id: userSession.userId,
  });

  //get all industry types from master table
  const industryDetails = await sdk.getIndustryTypeMaster();

  //get all states and countries from master table. at least 1 state should be mapped to get that particular country in dropdown.
  const stateCountryDetails = await sdk.getStatesWithCountry();

  //get all countries for dropdown.
  const countryDetails = await sdk.getCountryData();

  //get default country and states by user email id.
  const getDefaultCountryState = await sdk.getCountryStateCityByUserEmail({
    email: userOrgDetails?.AppUser?.[0]?.email?.toString() || "",
  });

  //get organizations Activity details
  const OrgActivityDetails = await sdk.getActivitiesByOrganization({
    OrgId: userSession.organizationId,
  });

  if (
    userOrgDetails?.AppUser?.length > 0 &&
    industryDetails?.IndustryTypeMaster?.length > 0 &&
    stateCountryDetails?.State?.length > 0 &&
    countryDetails?.Country?.length > 0
  ) {
    return {
      AppUser: userOrgDetails?.AppUser,
      industryTypeMaster: industryDetails?.IndustryTypeMaster,
      stateCountryMaster: stateCountryDetails?.State,
      countryMaster: countryDetails?.Country,
      defaultCountryStateData: getDefaultCountryState?.AppUser,
      OrgActivityDetails: OrgActivityDetails?.OrganizationActivityMapping,
    };
  }

  return null;
}

export async function updateUserDetailsAndOrganizationDetails(
  userdetails: TUserDetailsType,
  userSession: TUserSession
) {
  const sdk = await getGraphQlServerSDK();
  const existingData = await sdk.GetAppUserDataAndOrganizationById({
    id: userdetails.id,
  });

  let userResponse = null;
  if (existingData.AppUser.length > 0) {
    userResponse = await updateAppUserDetail(
      userdetails,
      userSession,
      existingData
    );
  }

  const industryTypesString = Array.isArray(userdetails?.industryType)
    ? userdetails?.industryType?.join(",")
    : "";
  const organizationResponse = await updateOrganizationDetails(
    userdetails,
    userSession,
    existingData
  );

  return {
    userResponse: userResponse,
    organizationResponse: organizationResponse,
  };
}

async function updateAppUserDetail(
  userdetails: TUserDetailsType,
  userSession: TUserSession,
  existingData: GetAppUserDataAndOrganizationByIdQuery
) {
  const sdk = await getGraphQlServerSDK();
  // const data = existingData.AppUser[0].metadata || [];

  // // Convert metadata to array format with robust handling
  // let updatedMetadata: any[] = [];

  // if (data !== null && data !== undefined) {
  //   if (Array.isArray(data)) {
  //     // Filter out null, undefined, or invalid items from array
  //     updatedMetadata = data.filter(
  //       (item) =>
  //         item !== null &&
  //         item !== undefined &&
  //         typeof item === "object" &&
  //         Object.keys(item).length > 0
  //     );
  //   } else if (typeof data === "object" && Object.keys(data).length > 0) {
  //     // If it's a valid non-empty object, wrap it in an array
  //     updatedMetadata = [data];
  //   }
  //   // If data is an empty object {} or invalid type, updatedMetadata remains empty array
  // }
  // const phoneIndex = updatedMetadata.findIndex(
  //   (item) =>
  //     item !== null &&
  //     item !== undefined &&
  //     typeof item === "object" &&
  //     item.phonenumber !== undefined
  // );

  // if (phoneIndex !== -1) {
  //   updatedMetadata[phoneIndex].phonenumber = userdetails.phonenumber;
  // } else {
  //   updatedMetadata.push({ phonenumber: userdetails.phonenumber });
  // }

  try {
    const resp = await sdk.updateAppUserById({
      id: userdetails.id,
      data: {
        first_name: userdetails.first_name,
        last_name: userdetails.last_name,
        // is_spoc: userdetails.is_spoc,
        updated_by: userSession.userId,
        metadata: {
          mobile: userdetails.phonenumber,
          mobileCountryCode: userdetails.mobileCountryCode,
        },
      },
    });

    if (!resp.update_AppUser)
      return {
        success: false,
        data: "something went wrong while updating the user",
      };

    return {
      success: true,
      data: resp?.update_AppUser?.returning[0],
    };
  } catch (error) {
    console.error("Error while updating the user:", error);
    return {
      success: false,
      message: "Failed to update user details.",
    };
  }
}

async function updateOrganizationDetails(
  userdetails: TUserDetailsType,
  userSession: TUserSession,
  existingData: GetAppUserDataAndOrganizationByIdQuery
) {
  const sdk = await getGraphQlServerSDK();
  try {
    // const gstNoExists =
    //   existingData &&
    //   existingData.AppUser[0]?.Organization?.metadata?.find(
    //     (item: any) => item.gstNo === gstNo
    //   );

    // if (gstNoExists) {
    //   return {
    //     success: false,
    //     data: "GST number already exists",
    //   };
    // }
    const industryTypesString = Array.isArray(userdetails?.industryType)
      ? userdetails?.industryType?.join(",")
      : "";
    let updatedMetadata: any[] = [];
    const data = existingData.AppUser[0]?.Organization?.metadata;

    if (data) {
      if (Array.isArray(data)) {
        updatedMetadata = data.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (typeof data === "object") {
        updatedMetadata = [data];
      }
    }

    //gst no
    const gstNoIndex = updatedMetadata.findIndex(
      (item) =>
        item !== null &&
        item !== undefined &&
        typeof item === "object" &&
        item.cin_pan_gst !== undefined
    );
    if (gstNoIndex !== -1) {
      updatedMetadata[gstNoIndex].cin_pan_gst = userdetails.gstNo;
    } else {
      updatedMetadata.push({ cin_pan_gst: userdetails.gstNo });
    }

    //registered country
    const regdCountryIndex = updatedMetadata.findIndex(
      (item) =>
        item !== null &&
        item !== undefined &&
        typeof item === "object" &&
        item.CountryOfRegistration !== undefined
    );
    if (regdCountryIndex !== -1) {
      updatedMetadata[regdCountryIndex].CountryOfRegistration =
        userdetails.registeredCountry;
    } else {
      updatedMetadata.push({
        CountryOfRegistration: userdetails.registeredCountry,
      });
    }

    //registered state
    const regdStateIndex = updatedMetadata.findIndex(
      (item) =>
        item !== null &&
        item !== undefined &&
        typeof item === "object" &&
        item.StateOfRegistration !== undefined
    );
    if (regdStateIndex !== -1) {
      updatedMetadata[regdStateIndex].StateOfRegistration =
        userdetails.registeredState;
    } else {
      updatedMetadata.push({
        StateOfRegistration: userdetails.registeredState,
      });
    }

    //parent company
    const parentcompIndex = updatedMetadata.findIndex(
      (item) =>
        item !== null &&
        item !== undefined &&
        typeof item === "object" &&
        item.parentCompany !== undefined
    );
    if (parentcompIndex !== -1) {
      updatedMetadata[parentcompIndex].parentCompany =
        userdetails.parentCompany;
    } else {
      updatedMetadata.push({ parentCompany: userdetails.parentCompany });
    }

    const financialYearMonth =
      YearStartMonth[userdetails?.yearType as YearTypeValue];
    const resp = await sdk.updateOrganizationById({
      id: userSession.organizationId,
      industryType: industryTypesString,
      hasWasteWaterTreatmentPlant: userdetails.hasWasteWaterTreatmentPlant,
      is_review_saved: userdetails.is_review_saved,
      metadata: updatedMetadata,
      name: userdetails.name || "",
      financialYearMonth,
      baselineYear: userdetails?.baselineYear || 0,
    });
    if (!resp.update_Organization)
      return {
        success: false,
        data: "something went wrong while updating the organization details",
      };

    return {
      success: true,
      data: resp?.update_Organization?.returning[0],
    };
  } catch (error) {
    console.error("Error while updating the organization details:", error);
    return {
      success: false,
      message: "Failed to update organization details.",
    };
  }
}

//validate user if already exist
//validate gst no
//validate mobile no if already present
