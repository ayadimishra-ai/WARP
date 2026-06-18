import { getSdkInstance } from "@/graphql/server/sdk";
import { updateCompanyMobileNumberRequest, updateCompanyMobileNumberResponse, UserInput } from "@/types/interface.types";
import { emailEncrypt } from "@/util/emailEncrypt";
import { globalSetting } from "@/util/globalSetting";
import axios from "axios";
import { getServerEnv } from "@/lib/env/env.server";

export async function updateCompanyMobileNumber(
  cmpData: updateCompanyMobileNumberRequest
): Promise<updateCompanyMobileNumberResponse> {
  try {
    // let userStatus: string = "";
    // Input validation
    if (!cmpData.mobileNumber?.trim()) {
      return {
        status200OK: 400,
        saveresult: 'Mobile Number is required'
      };
    }

    // Get server environment variables
    const env = await getServerEnv();

    // Encrypt email
    const encryptedEmailId = emailEncrypt(
      {
        encryptionKey: env.ENCRYPTION_KEY,
        encryptionIV: env.ENCRYPTION_IV
      },
      cmpData.email
    );

    let existingUserGuid: string = "";
    const sdk = await getSdkInstance();
    // Check for existing user
    const existingUser = await sdk.GetUserByEmail({ email: encryptedEmailId });
    existingUserGuid = existingUser.Tbl_Users?.[0]?.UserGuid ?? "";

    // if (userStatus === "Created") {

    await sdk.UpdateUserMobileNumber({
      userGuid: existingUserGuid,
      phone: cmpData.mobileNumber ?? ""
    });
    // Update warp company mobile number

    const settings = await globalSetting();
    const apiUrl = settings.accessTokenUrl;

    const data = {
      companyId: cmpData.CPanelCompanyId,
      phone: cmpData.mobileNumber,
      name: cmpData.userName,
      email: cmpData.email
    };
    const warpUrl = apiUrl + "api/v1/platform/company/UpdateCompanyMobileNumber";
    const resp = await axios({
      method: "PUT",
      url: warpUrl,
      data: [data],
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      timeout: 90000,
      validateStatus: (status) => status >= 200 && status < 500
    });

    if (resp.status !== 200) {
      return {
        status200OK: 400,
        saveresult: 'Failed to update WARP user'
      };
    }

    return {
      status200OK: 200,
      saveresult: "success"
    };
    // } else {
    //   return {
    //     status200OK: 400,
    //     saveresult: 'User not found'
    //   };
    // }

  } catch (error) {
    console.error('Error in updateCompanyMobileNumber service:', error);
    return {
      status200OK: 500,
      saveresult: 'Internal server error'
    };
  }
}