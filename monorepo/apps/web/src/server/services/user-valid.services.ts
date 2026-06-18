import { emailEncrypt } from "@/util/emailEncrypt";
import { passwordEncrypt } from "@/util/passwordEncrypt";
import { getSdkInstance } from "@/graphql/server/sdk";
import {
  IsUserValidResponse,
  PermissionVM,
  ServiceResponse,
  SessionInput
} from "@/types/interface.types";
import { saveUserSessionService } from "./user-session.service";
import { MetaDataStatus } from "@/constants/app.constants";
import { signJwt } from "./auth.services";
import { getServerEnv } from "@/lib/env/env.server";
import { generateWarpToken } from "./warptoken.service";
import { generateOpsToken } from "./opstoken.service";

export async function validateUser(
  EmailId: string,
  Password: string,
  BrowserToken?: string,
  BrowserName?: string
): Promise<ServiceResponse<IsUserValidResponse>> {
  const sdk = await getSdkInstance();
  let encryptedEmailId: string | undefined;

  if (EmailId) {
    const env = await getServerEnv();
    encryptedEmailId = emailEncrypt(
      {
        encryptionKey: env.ENCRYPTION_KEY,
        encryptionIV: env.ENCRYPTION_IV
      },
      EmailId
    );
  }

  const encryptedPassword = passwordEncrypt(Password);

  // Use SDK to authenticate user
  let result;
  try {
    result = await sdk.GetUserAutoLoginDetails({
      email: encryptedEmailId,
      password: encryptedPassword
    });
  } catch (error) {
    console.error("Authentication failed:", error);
    const env = await getServerEnv();
    return {
      success: false,
      error: {
        message: "Invalid credentials",
        status: 401,
        details: env.NODE_ENV === "development" ? error : undefined
      }
    };
  }

  if (!result || !result.Tbl_Users || result.Tbl_Users.length === 0) {
    return {
      success: false,
      error: {
        message: "Authentication service unavailable",
        status: 503
      }
    };
  }

  const user = result.Tbl_Users[0];
  if (!user) {
    return {
      success: false,
      error: {
        message: "Invalid credentials",
        status: 401
      }
    };
  }

  const companyGuid =
    user.Tbl_UserCompanyMappings?.[0]?.Tbl_Company?.CompanyGuid;

  let warpToken = null;
  let opsToken = null;

  if (companyGuid) {
    const [warpResult, opsResult] = await Promise.all([
      generateWarpToken(EmailId, companyGuid),
      generateOpsToken(EmailId, companyGuid)
    ]);

    if (warpResult.accessToken) {
      warpToken = warpResult.accessToken;
    } else {
      console.warn("[validateUser] warpToken not minted:", warpResult);
    }

    if (opsResult.accessToken) {
      opsToken = opsResult.accessToken;
    } else {
      console.warn("[validateUser] opsToken not minted:", opsResult);
    }
  }

  const newTokenAfterLoginData = await signJwt({
    id: user.UserGuid,
    email: user.EmailId || EmailId,
    passwordHash: encryptedPassword
  });

  const userRoleMappingsData = await sdk.gettbluserrolemappingsdata({
    userguid: user.UserGuid
  });

  const userInitial = user.FirstName
    ? user.FirstName.charAt(0).toUpperCase()
    : "";

  const permissionsVM: PermissionVM[] = (user.Tbl_UserPermissions || []).map(
    (permission) => ({
      userGuid: user.UserGuid,
      pageKey: permission.Tbl_Permission?.Tbl_Page?.PageKey || "",
      rights: "W",
      platformType: permission.Tbl_Permission?.Tbl_Page?.PlatformType ?? "IQ"
    })
  );

  const userSessionData: SessionInput = {
    UserId: user.UserGuid,
    PlatformToken: newTokenAfterLoginData?.tokenId,
    WarpToken: warpToken,
    OpsToken: opsToken,
    BrowserToken: BrowserToken,
    BrowserName: BrowserName,
    LoggedIn: MetaDataStatus.LoggedIn
    // Removed CreatedBy and ModifiedBy which are not in the SessionInput interface
  };

  // Call the session service but we don't need to use the result
  await saveUserSessionService(userSessionData);

  const responseData: IsUserValidResponse = {
    status200OK: 200,
    user: {
      usersVM: {
        userGuid: user.UserGuid,
        emailId: user.EmailId,
        languageGuid: user.LanguageGuid,
        companyGuid: companyGuid || "",
        firstName: user.FirstName || "",
        lastName: user.LastName || "",
        userInitial,
        showGradeLevel: user.ShowGradeLevel || false,
        parentGuid: "00000000-0000-0000-0000-000000000000",
        userStatus:
          userRoleMappingsData.Tbl_UserRoleMapping?.[0]?.Tbl_UserStatusMaster
            ?.Status ?? "",
        isNewsLetterSubscribed: user.IsNewsLetterSubscribed || false,
        companyLogo: "",
        isManufacturing: false,
        location: "",
        opsUrl: ""
      },
      rolesVM: {
        roleGuid:
          userRoleMappingsData?.Tbl_UserRoleMapping[0]?.Tbl_Role.RoleGuid || "",
        rolePriority:
          String(
            userRoleMappingsData?.Tbl_UserRoleMapping[0]?.Tbl_Role.Priority
          ) || "0",
        roleName:
          userRoleMappingsData?.Tbl_UserRoleMapping[0]?.Tbl_Role.RoleName || ""
      },
      permissionsVM,
      userMappedCountryVM: [
        {
          countryGuid:
            user.Tbl_UserCompanyMappings?.[0]?.Tbl_Company
              ?.Tbl_CompanyCountries?.[0]?.Tbl_CountryMaster?.CountryGuid || "",
          countryName:
            user.Tbl_UserCompanyMappings?.[0]?.Tbl_Company
              ?.Tbl_CompanyCountries?.[0]?.Tbl_CountryMaster?.CountryName || ""
        }
      ],
      userStatusVM: {
        checkStatus:
          userRoleMappingsData.Tbl_UserRoleMapping?.[0]?.Tbl_UserStatusMaster
            ?.Status ?? ""
      },
      warpToken,
      opsToken,
      opsUrl: null,
      platform_token: newTokenAfterLoginData.tokenId,
      platform_token_expires_in: newTokenAfterLoginData.expires_in
    }
  };

  return {
    success: true,
    data: responseData
  };
}
