import { emailEncrypt } from "@/util/emailEncrypt";
import { passwordEncrypt } from "@/util/passwordEncrypt";
import { getSdkInstance } from "@/graphql/server/sdk";
import {
  IsUserValidResponse,
  PermissionVM,
  ServiceResponse,
  SessionInput
} from "@/types/interface.types";
import saveUserSessionService from "./user-session.service";
import { MetaDataStatus } from "@/constants/app.constants";
import { getMockUsers, signJwt } from "./auth.services";
import { getServerEnv } from "@/lib/env/env.server";
import { User } from "@/types/interface.types";

export async function validateUserAutoLogin(
  EmailId: string,
  Password: string,
  BrowserToken?: string,
  BrowserName?: string
): Promise<ServiceResponse<IsUserValidResponse>> {
  const env = await getServerEnv();
  const sdk = await getSdkInstance();
  let encryptedEmailId: string | undefined;
  if (EmailId) {
    encryptedEmailId = emailEncrypt(
      {
        encryptionKey: env.ENCRYPTION_KEY,
        encryptionIV: env.ENCRYPTION_IV
      },
      EmailId
    );
  }

  const encryptedPassword = passwordEncrypt(Password);
  let userResult;
  try {
    userResult = await sdk.GetUserAutoLoginDetails({
      email: encryptedEmailId,
      password: encryptedPassword
    });
  } catch (error) {
    console.error("Authentication failed:", error);
    return {
      success: false,
      error: {
        message: "Invalid credentials",
        status: 401,
        details: env.NODE_ENV === "development" ? error : undefined
      }
    };
  }

  const user = userResult?.Tbl_Users?.[0];
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

  let warpToken = "";
  let opsToken = null;

  const mockUserData: User[] = await getMockUsers();

  if(mockUserData?.length===0){
    throw new Error("Invalid credentials");
  }

  const newTokenAfterLoginData = await signJwt({
    id: mockUserData[0].id,
    email: mockUserData[0].email,
    passwordHash: mockUserData[0].passwordHash
  });

  if (companyGuid) {
    const baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
    const warpUrl = `${baseUrl}/api/signIn/warpToken`;
    const opsUrl = `${baseUrl}/api/signIn/OPsToken`;
    const [warpResponse, opsResponse] = await Promise.all([
      fetch(warpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: EmailId, companyGuid: companyGuid })
      }),
      fetch(opsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: EmailId, companyGuid: companyGuid })
      })
    ]);

    if (warpResponse.ok) {
      const warpData = await warpResponse.json();
      warpToken = warpData.accessToken;
    }

    if (opsResponse.ok) {
      const opsData = await opsResponse.json();
      opsToken = opsData.accessToken;
    }
  }

  const userInitial = user.FirstName
    ? user.FirstName.charAt(0).toUpperCase()
    : "";

  type UserPermission = {
    Tbl_Permission: {
      Tbl_Page: { PageKey: string };
      MenuType?: string | null;
    } | null;
  };

  const permissionsVM: PermissionVM[] = (user.Tbl_UserPermissions || []).map(
    (permission: UserPermission) => ({
      userGuid: user.UserGuid,
      pageKey: permission.Tbl_Permission?.Tbl_Page?.PageKey || "",
      rights: "W",
      platformType: permission.Tbl_Permission?.MenuType || "IQ"
    })
  );
  // Use role data directly from userResult with type assertion
  const roleData = user.Tbl_UserRoleMappings?.[0] || {
    Tbl_Role: {
      RoleGuid: "",
      RoleName: "",
      Priority: 0,
      IsActive: false,
      CreatedDateUtc: ""
    },
    Tbl_UserStatusMaster: {
      StatusGuid: "",
      Status: ""
    }
  };

  console.log("Raw roleData:", JSON.stringify(roleData, null, 2)); // Debug log
  // Extract role information from the nested structure
  const roleInfo = {
    roleGuid: roleData.Tbl_Role?.RoleGuid || "",
    roleName: roleData.Tbl_Role?.RoleName || "",
    rolePriority: roleData.Tbl_Role?.Priority || 0,
    isActive: roleData.Tbl_Role?.IsActive || false,
    status: roleData.Tbl_UserStatusMaster?.Status || "",
    statusGuid: roleData.Tbl_UserStatusMaster?.StatusGuid || ""
  };

  console.log("Role Info:", JSON.stringify(roleInfo, null, 2)); // Debug log

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
        userStatus: roleData.Tbl_UserStatusMaster?.Status || "",
        isNewsLetterSubscribed: user.IsNewsLetterSubscribed || false,
        companyLogo: "",
        isManufacturing: false,
        location: "",
        opsUrl: ""
      },
      rolesVM: {
        roleGuid: roleInfo.roleGuid,
        rolePriority: roleInfo.rolePriority?.toString() || "0",
        roleName: roleInfo.roleName
      },
      permissionsVM,
      userMappedCountryVM: [
        {
          countryGuid:
            user.Tbl_UserCompanyMappings?.[0]?.Tbl_Company
              ?.Tbl_CompanyCountries?.[0]?.Tbl_CountryMaster?.CountryGuid ?? "",
          countryName:
            user.Tbl_UserCompanyMappings?.[0]?.Tbl_Company
              ?.Tbl_CompanyCountries?.[0]?.Tbl_CountryMaster?.CountryName ?? ""
        }
      ],
      userStatusVM: {
        checkStatus: roleData.Tbl_UserStatusMaster?.Status || ""
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
