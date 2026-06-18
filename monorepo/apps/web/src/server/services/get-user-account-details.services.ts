import { getSdkInstance } from "@/graphql/server/sdk";
import { emailDecrypt } from "@/util/emailDecrypt";
import { getServerEnv } from "@/lib/env/env.server";
import {
  GetUserAccountDetailsRequest,
  UserAccount,
  DynamicResponse
} from "@/types/interface.types";

export const getUserAccountDetails = async (
  request: GetUserAccountDetailsRequest
) => {
  try {
    const sdk = await getSdkInstance();
    const env = await getServerEnv();
    const dataset = await sdk.GetUserAccountDetails({
      userGuid: request.userGuid,
      languageGuid: request.languageGuid
    });

    // Create dynamic table arrays based on user account data
    const formattedResponse: DynamicResponse = {};

    if (dataset.userAccount?.length) {
      // Create table arrays for each user account
      dataset.userAccount.forEach((user: UserAccount, index) => {
        const tableName = `table${index + 1}`;
        formattedResponse[tableName] = [
          {
            userGuid: user.UserGuid,
            emailId: emailDecrypt(
              {
                encryptionKey: env.ENCRYPTION_KEY,
                encryptionIV: env.ENCRYPTION_IV
              },
              user.EmailId
            ),
            roleName: dataset.userRoles[0].Tbl_Role.RoleName,
            name: `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
            organization:
              dataset?.userCompanyMapping[0]?.Tbl_Company?.CompanyName || "",
            countryName:
              dataset?.userCompanyMapping[0]?.Tbl_Company
                ?.Tbl_CompanyCountries?.[0]?.Tbl_CountryMaster?.CountryName ||
              "",
            userProfileImage: user.UserProfileImage || null
          }
        ];
      });
    }

    // Add empty tables if needed
    const totalTables = dataset.userAccount?.length || 0;
    for (let i = totalTables + 1; i <= 2; i++) {
      formattedResponse[`table${i}`] = [];
    }
    return formattedResponse;
  } catch (error) {
    throw new Error("Failed to fetch user account details");
  }
};
