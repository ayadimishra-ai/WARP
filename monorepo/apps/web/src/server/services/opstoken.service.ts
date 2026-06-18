import axios from "axios";
import { getSdkInstance } from "@/graphql/server/sdk";
/**
 * Generates an OPS access token for a user
 * @param emailId User's email
 * @param companyGuid Company GUID
 * @param opsCompanyId Optional OPS company ID
 * @returns Access token or error
 */
export async function generateOpsToken(
  emailId: string,
  companyGuid: string,
  opsCompanyId: string = ""
) {
  // Get API details from database
  const sdk = await getSdkInstance();
  const apiData = await sdk.GetOpsCompanyDbDetails({
    companyGuid: companyGuid
  });

  if (!apiData?.Tbl_OPsCompanyDBDetails?.length) {
    return { error: "Company details not found", status: 404 };
  }

  const apiDetails = apiData.Tbl_OPsCompanyDBDetails[0];
  let finalOpsCompanyId = opsCompanyId;

  // If opsCompanyId not provided, try to get it from companyGuid
  if (!finalOpsCompanyId && companyGuid) {
    const companyData = await sdk.GetCompanyDetails({
      companyGuid
    });
    const opsId = companyData?.Tbl_Companies?.[0]?.opsCompanyId;
    if (opsId) {
      finalOpsCompanyId = opsId.toString();
    }
  }

  // If still no opsCompanyId, try to get via user email
  if (!finalOpsCompanyId) {
    const userData = await sdk.GetUser({
      email: emailId
    });

    if (userData?.Tbl_Users?.[0]?.UserGuid) {
      const userGuid = userData.Tbl_Users[0].UserGuid;

      const mappingData = await sdk.GetUserCompanyMapping({
        userGuid
      });

      if (mappingData?.Tbl_UserCompanyMapping?.[0]?.CompanyGuid) {
        const companyGuid = mappingData.Tbl_UserCompanyMapping[0].CompanyGuid;

        const companyData = await sdk.GetCompanyDetails({
          companyGuid
        });

        const cpanelId = companyData?.Tbl_Companies?.[0]?.cpanelCompanyId;
        if (cpanelId) {
          finalOpsCompanyId = cpanelId.toString();
        }
      }
    }
  }

  if (finalOpsCompanyId && emailId) {
    const requestBody = {
      organization_id: finalOpsCompanyId,
      // user_email: decrypt({
      //     encryptionKey: process.env.ENCRYPTION_KEY!,
      //     encryptionIV: process.env.ENCRYPTION_IV!
      // }, emailId)
      user_email: emailId
    };

    try {
      const response = await axios.post(
        `${apiDetails.AccessTokenUrl}api/v1/auth/access-token`,
        requestBody,
        {
          headers: {
            "x-sk-op-access-secret-key": apiDetails.PlatformSecret,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data?.access_token) {
        return { accessToken: response.data.access_token, status: 200 };
      }
      return { error: "No access token received", status: 400 };
    } catch (error) {
      console.error("Error in OPS token generation:", error);
      return { error: "Error calling OPS API", status: 500 };
    }
  }

  return { error: "Missing required parameters", status: 400 };
}
