import { getSdkInstance } from "@/graphql/server/sdk";
import { RegistrationResult, UserInput } from "@/types/interface.types";
import { emailEncrypt } from "@/util/emailEncrypt";
import { globalSetting } from "@/util/globalSetting";
import { passwordEncrypt } from "@/util/passwordEncrypt";
import axios from "axios";
import { getServerEnv } from "@/lib/env/env.server";

export async function registrationService(
  userData: UserInput
): Promise<RegistrationResult> {
  try {
    let userStatus: string = "";
    // Get server environment variables
    const env = await getServerEnv();

    // Input validation
    if (!userData.EmailId?.trim()) {
      return {
        status200OK: 401,
        error: {
          message: "Email is required for registration",
          status: 401
        }
      };
    }

    // Encrypt email
    const encryptedEmailId = emailEncrypt(
      {
        encryptionKey: env.ENCRYPTION_KEY,
        encryptionIV: env.ENCRYPTION_IV
      },
      userData.EmailId
    );

    if (
      typeof encryptedEmailId !== "string" ||
      encryptedEmailId.trim() === ""
    ) {
      return {
        status200OK: 401,
        error: {
          message: "Failed to encrypt email - invalid email format",
          status: 401
        }
      };
    }

    if (!userData.Password) {
      return {
        status200OK: 401,
        error: {
          message: "Password is required for registration",
          status: 401
        }
      };
    }

    let CompanyRoleGuid: string = "";
    let CompanyGuid: string = "";
    let existingUserGuid: string = "";
    // Check for existing user
    const sdk = await getSdkInstance();
    const existingUser = await sdk.GetUserByEmail({ email: encryptedEmailId });
    let userRoleMappingsData;
    if (existingUser?.Tbl_Users?.length > 0) {
      userRoleMappingsData = await sdk.gettbluserrolemappingsdata({
        userguid: existingUser.Tbl_Users?.[0]?.UserGuid
      });

      CompanyRoleGuid =
        existingUser.Tbl_Users?.[0]?.Tbl_UserCompanyMappings?.[0]?.Tbl_Company
          ?.Tbl_CompanyRoleMappings?.[0]?.RoleGuid ?? "";
      CompanyGuid =
        existingUser.Tbl_Users?.[0]?.Tbl_UserCompanyMappings?.[0]
          ?.CompanyGuid ?? "";
      existingUserGuid = existingUser.Tbl_Users?.[0]?.UserGuid ?? "";
      if (userRoleMappingsData?.Tbl_UserRoleMapping?.length > 0) {
        userStatus =
          userRoleMappingsData.Tbl_UserRoleMapping?.[0]?.Tbl_UserStatusMaster
            ?.Status ?? "";

        if (
          userRoleMappingsData.Tbl_UserRoleMapping?.[0]?.Tbl_UserStatusMaster
            ?.Status !== "Created"
        ) {
          return {
            status200OK: 400,
            error: {
              message: "User with this email already exists",
              status: 400
            }
          };
        }
      }
    }

    // Create user
    const encryptedPassword = passwordEncrypt(userData.Password);
    const now = new Date().toISOString();
    const isSubscribed = userData.IsNewsLetterSubscribed ?? false;

    const userInput = {
      EmailId: encryptedEmailId,
      Password: encryptedPassword,
      IsActive: userData.IsActive ?? true,
      CreatedBy: null,
      ModifiedBy: null,
      FirstName: userData.FirstName ?? "",
      LastName: userData.LastName ?? "",
      CompanyName: userData.CompanyName ?? "",
      CompanyWebsite: userData.CompanyWebsite ?? "",
      ParentCompany: userData.ParentCompany ?? "",
      ERPSupplierId: userData.ERPSupplierId ?? "",
      LanguageGuid: userData.LanguageGuid ?? null,
      SystemId: userData.SystemId ?? null,
      IsVerified: true,
      NumberOfFailedLoginAttempts: 0,
      IsLocked: false,
      UserProfileImage: userData.UserProfileImage ?? null,
      CountryGuid: userData.CompanyCountryId ?? null,
      MobileNumber: userData.UserPhoneNo ?? null,
      ReportsTo: userData.ReportsTo ?? null,
      userposition: userData.userposition ?? null,
      IsNewsLetterSubscribed: isSubscribed,
      CpanelUserId: userData.CPanelCompanyId ?? null,
      OPSUserId: null,
      isEmailSubscribed: isSubscribed,
      CreatedDate: now,
      ModifiedDate: now
    };

    if (userStatus !== "Created") {
      // Register user
      const registrationResult = await sdk.registrationUser({
        input: [userInput]
      });

      const userGuid =
        registrationResult.insert_Tbl_Users?.returning[0]?.UserGuid;
      if (!userGuid) {
        return {
          status200OK: 400,
          error: {
            message: "ser registration failed - no user GUID returned",
            status: 400
          }
        };
      }

      // Handle business type and role mapping if BusinessTypeGuid is provided
      if (userData.BusinessTypeGuid) {
        try {
          await handleBusinessTypeAndRoleMapping(
            userData.BusinessTypeGuid,
            userGuid,
            userData
          );
        } catch (mappingError) {
          console.error("Business type and role mapping failed:", mappingError);
          // Continue with registration even if mapping fails
          return {
            status200OK: 400,
            error: {
              message: "Business type and role mapping failed:" + mappingError,
              status: 400
            }
          };
        }
      }

      return {
        status200OK: 200,
        saveresult: "success",
        userguid: userGuid,
        companyGuid:
          registrationResult?.insert_Tbl_Users?.returning[0]?.Tbl_Companies?.[0]
            ?.CompanyGuid ?? ""
      };
    }

    if (userStatus === "Created") {
      const {
        Tbl_CompanyStatusMaster: companyStatus,
        Tbl_UserStatusMaster: userStatus
      } = await sdk.GetCompanyUserStatusMasterByName({
        status: "Registered",
        CompanyRoleGuid: CompanyRoleGuid
      });

      const companyStatusGuid = companyStatus?.[0]?.CompanyStatusGuid;
      // Handle user permissions after role mapping is created
      await handleUserPermissions(existingUserGuid, CompanyRoleGuid);

      await sdk.updateRegistrationStatus({
        companyGuid: CompanyGuid,
        companyStatusGuid,
        userGuid: existingUserGuid,
        statusGuid: userStatus?.[0]?.StatusGuid,
        password: encryptedPassword,
        username: userData.FirstName ?? "",
        phone: userData.UserPhoneNo ?? ""
      });
      // Update user details
      const settings = await globalSetting();
      const apiUrl = settings.accessTokenUrl;

      const data = {
        id: crypto.randomUUID(),
        name: `${userData.FirstName} ${userData.LastName}`,
        email: userData.EmailId,
        companyId: userData.CPanelCompanyId,
        role: "Invitee", //userRoleMappingsData?.Tbl_UserRoleMapping?.[0]?.Tbl_Role.RoleName,
        created_by: "96b1fe15-c273-416d-bd49-56be5ddeed9e",
        updated_by: "96b1fe15-c273-416d-bd49-56be5ddeed9e",
        phone: userData.UserPhoneNo
      };

      const warpUrl = apiUrl + "api/v1/platform/user";
      const resp = await axios({
        method: "POST",
        url: warpUrl,
        data: [data],
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        timeout: 90000,
        validateStatus: (status) => status >= 200 && status < 500
      });

      const newUser = resp?.data?.data?.[0];
      const object = [];
      if (newUser) {
        object.push({
          where: {
            EmailId: {
              _eq: newUser.email.toUpperCase()
            }
          },
          _set: {
            CpanelUserId: newUser.id
          }
        });

        await sdk.updateUser({
          input: object
        });
      }

      return {
        status200OK: 200,
        saveresult: "success",
        userguid: existingUserGuid,
        companyGuid: CompanyGuid
      };
    }

    return {
      status200OK: 400,
      saveresult: "User with this email already exists",
      userguid: existingUserGuid,
      companyGuid: CompanyGuid
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Registration failed (AxiosError):", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return {
        status200OK: error.response?.status || 400,
        error: {
          message:
            "Registration failed: " +
            (error.response?.data?.message || error.message),
          status: error.response?.status || 400
        }
      };
    } else {
      console.error("Registration failed:", error);
      return {
        status200OK: 400,
        error: {
          message:
            "Registration failed: " +
            (error instanceof Error ? error.message : String(error)),
          status: 400
        }
      };
    }
  }
}

async function handleBusinessTypeAndRoleMapping(
  businessTypeGuid: string,
  userGuid: string,
  userData: any
): Promise<void | { error: { message: string; status: number } }> {
  // Get business type
  const sdk = await getSdkInstance();
  const businessTypeResult = await sdk.GetBusinessTypeMasterAndUserStatusMaster(
    {
      BusinessTypeGuid: businessTypeGuid
    }
  );

  const businessType = businessTypeResult?.Tbl_BusinessTypeMaster?.[0];
  if (!businessType) {
    return {
      error: {
        message: "Business type not found",
        status: 401
      }
    };
  }

  // Get role and status
  const roleAndStatus = await sdk.getRoleAndStatus({
    roleName: businessType.BusinessTypeName
  });

  const role = roleAndStatus?.Tbl_Roles?.[0];
  const status = roleAndStatus?.Tbl_UserStatusMaster?.[0];

  if (!role || !status) {
    return {
      error: {
        message: "Role or status not found",
        status: 401
      }
    };
  }

  // Insert user role mapping
  await sdk.insertUserRoleMapping({
    input: [
      {
        UserGuid: userGuid,
        RoleGuid: role.RoleGuid,
        StatusGuid: status.StatusGuid,
        CreatedBy: userGuid
      }
    ]
  });

  // Handle user permissions after role mapping is created
  await handleUserPermissions(userGuid, role.RoleGuid);

  if (userData.CompanyName) {
    await handleCompanyAndUserMapping({
      companyName: userData.CompanyName,
      userRoleGuid: role.RoleGuid,
      userId: userGuid,
      countryGuid: userData.CompanyCountryId!
    });
  }
}

async function handleUserPermissions(
  userGuid: string,
  roleGuid: string
): Promise<void | { error: { message: string; status: number } }> {
  try {
    // Get permissions for the role and specific page keys
    const sdk = await getSdkInstance();
    const permissions = await sdk.GetPermissionsByRoleAndPages({
      roleGuid,
      pageKeys: ["dashboard", "Assessments", "Assess", "DocumentRepository", "ChatWithSnowkapAI"]
    });

    if (permissions.Tbl_Permissions.length === 0) {
      console.warn(
        `No permissions found for role ${roleGuid} and specified pages`
      );
      return;
    }

    // Prepare permissions to insert
    const permissionInserts = permissions.Tbl_Permissions.map((permission) => ({
      UserGuid: userGuid,
      PermissionGuid: permission.PermissionGuid,
      Rights: "W" // Default to Write access
    }));

    // Insert user permissions
    await sdk.insertUserPermissions({
      input: permissionInserts
    });

    console.log(
      `Successfully inserted ${permissionInserts.length} permissions for user ${userGuid}`
    );
  } catch (error) {
    console.error("Error in handleUserPermissions:", error);
    return {
      error: {
        message: "Error in handleUserPermissions" + error,
        status: 401
      }
    };
  }
}

interface CompanyAndUserMappingInput {
  companyName: string;
  userRoleGuid: string;
  userId: string;
  countryGuid: string;
}

async function handleCompanyAndUserMapping({
  companyName,
  userRoleGuid,
  userId,
  countryGuid
}: CompanyAndUserMappingInput): Promise<
  string | { error: { message: string; status: number } }
> {
  try {
    const sdk = await getSdkInstance();
    const { createdStatus, registeredStatus } =
      await sdk.GetCompanyStatusesByRole({
        roleGuid: userRoleGuid
      });

    if (
      !createdStatus?.[0]?.CompanyStatusGuid ||
      !registeredStatus?.[0]?.CompanyStatusGuid
    ) {
      return {
        error: {
          message: "Could not find required company statuses",
          status: 401
        }
      };
    }

    const createdStatusGuid = createdStatus[0].CompanyStatusGuid;
    const registeredStatusGuid = registeredStatus[0].CompanyStatusGuid;
    // Check if company exists by name
    const existingCompany = await sdk.CheckCompanyExists({
      companyName: companyName.trim().toLowerCase()
    });

    let companyGuid: string;

    if (existingCompany.Tbl_Companies.length > 0) {
      // Company exists, use existing company
      companyGuid = existingCompany.Tbl_Companies[0].CompanyGuid;

      // Update user's company name
      await sdk.UpdateUserCompanyName({
        userGuid: userId,
        companyName: companyName.trim()
      });
    } else {
      // Create new company
      const newCompany = await sdk.InsertCompany({
        companyInput: {
          CompanyGuid: undefined, // Let DB generate
          CompanyName: companyName.trim(),
          CountryGuid: countryGuid,
          CreatedBy: userId,
          IsActive: true,
          CreatedDate: new Date().toISOString()
        }
      });

      if (!newCompany.insert_Tbl_Companies_one?.CompanyGuid) {
        return {
          error: {
            message: "Failed to create company",
            status: 401
          }
        };
      }

      companyGuid = newCompany.insert_Tbl_Companies_one.CompanyGuid;
    }
    // After creating the company (new or existing), use the combined mutation
    const result = await sdk.RegisterCompanyAndMappings({
      companyRoleMappingInput: {
        CompanyRoleMappingGuid: crypto.randomUUID(), // Generate a new GUID
        CompanyGuid: companyGuid,
        RoleGuid: userRoleGuid,
        StatusGuid: registeredStatusGuid,
        BusinessReady: false,
        CreatedDate: new Date().toISOString(),
        CreatedBy: userId
      },
      companyStatusLogInput: {
        CompanyGuid: companyGuid,
        OldStatusGuid: createdStatusGuid,
        NewStatusGuid: registeredStatusGuid,
        Comment: "",
        CreatedBy: userId,
        RoleGuid: userRoleGuid
      },
      userCompanyMappingInput: {
        CompanyGuid: companyGuid,
        UserGuid: userId,
        IsActive: true,
        CreatedBy: userId
      },
      companyCountryInput: {
        CompanyGuid: companyGuid,
        CountryGuid: countryGuid,
        IsActive: true,
        CreatedDate: new Date().toISOString(),
        CreatedBy: userId
      }
    });

    // Check if all operations were successful
    if (
      !result.companyRoleMapping?.returning?.[0]?.CompanyRoleMappingGuid ||
      !result.companyStatusLog?.returning?.[0]?.CompanyStatusLogGuid ||
      !result.userCompanyMapping?.returning?.[0]?.UserCompanyMappingGuid ||
      !result.companyCountry?.returning?.[0]?.CompanyCountryGuid
    ) {
      return {
        error: {
          message: "Failed to create one or more company mappings",
          status: 401
        }
      };
    }
    return companyGuid;
  } catch (error) {
    console.error("Error in handleCompanyAndUserMapping:", error);
    return {
      error: {
        message: "Error in Handle CompanyAndUserMapping" + error,
        status: 401
      }
    };
  }
}

export default registrationService;
