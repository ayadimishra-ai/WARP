import axios from "axios";
import { getSdkInstance } from "@/graphql/server/sdk";

/**
 * Get company details by company GUID
 * @param companyGuid Company GUID
 * @returns Company details or null
 */
const getCompanyDetails = async (companyGuid: string) => {
  try {
    // Ensure companyGuid is properly formatted
    const formattedGuid = companyGuid.toLowerCase();
    const sdk = await getSdkInstance();

    const companyData = await sdk.GetCompanyDetails({
      companyGuid: formattedGuid
    });

    return companyData?.Tbl_Companies?.[0] || null;
  } catch (error) {
    console.error("Error fetching company details:", error);
    return null;
  }
};

/**
 * Generates a WARP access token for a user
 * @param emailId User's email
 * @param companyGuid Company GUID
 * @param warpCompanyId Optional WARP company ID
 * @returns Access token or error
 */
export async function generateWarpToken(
  emailId: string,
  companyGuid: string,
  warpCompanyId: string = ""
) {
  try {
    const sdk = await getSdkInstance();
    // Get the settings for the Warp access token API
    const globalSettings = await sdk.GetGlobalSettings();

    const settingsData = globalSettings.Tbl_GlobalSettings;

    if (settingsData && settingsData.length > 0) {
      // Extract the access token URL, client ID and client secret from the settings
      const accessTokenUrl = settingsData.find(
        (x) => x.SettingsKey === "WARP_ACCESS_TOKEN_URL"
      )?.SettingsValue;
      const clientId = settingsData.find(
        (x) => x.SettingsKey === "WARP_PLATFORM_ID"
      )?.SettingsValue;
      const clientSecret = settingsData.find(
        (x) => x.SettingsKey === "WARP_PLATFORM_SECRET"
      )?.SettingsValue;

      // If the warp company ID is not provided, try to get it from the company GUID
      let warpCompanyIdValue = warpCompanyId;
      if (!warpCompanyIdValue && companyGuid) {
        // Get the company details from the company GUID
        const companyDetails = await getCompanyDetails(companyGuid);
        if (companyDetails) {
          // Set the warp company ID to the CPanel company ID
          const cpanelId = companyDetails?.cpanelCompanyId;
          if (cpanelId) {
            warpCompanyIdValue = cpanelId.toString();
          }
        }
      }

      // If the warp company ID and email are valid, call the Warp API to get the access token
      if (warpCompanyIdValue && emailId && accessTokenUrl && clientId && clientSecret) {
        const requestBody = {
          companyId: warpCompanyIdValue,
          // userEmail: decrypt({
          //   encryptionKey: process.env.ENCRYPTION_KEY!,
          //   encryptionIV: process.env.ENCRYPTION_IV!
          // }, emailId)
          userEmail: emailId
        };

        try {
          // Call the Warp API to get the access token
          const response = await axios.post(
            `${accessTokenUrl}api/v1/platform/auth/signin`,
            requestBody,
            {
              headers: {
                "x-warp-shared-key": clientId,
                "x-warp-shared-secret": clientSecret,
                "Content-Type": "application/json"
              }
            }
          );

          // If the access token is valid, return it
          if (response.data.error === null) {
            return {
              accessToken: response.data.data.accessToken,
              status: 200
            };
          }
          return {
            error: "Failed to retrieve access token from WARP API",
            status: 401
          };
        } catch (error) {
          console.error("Error in WARP API call:", error);
          return {
            error: "Error calling WARP API",
            status: 500
          };
        }
      }

      return {
        error: "Missing required parameters or settings",
        status: 400
      };
    }

    return {
      error: "Global settings not found",
      status: 404
    };
  } catch (error) {
    console.error("Error in WARP token generation:", error);
    return {
      error: "Internal Server Error",
      status: 500
    };
  }
}
