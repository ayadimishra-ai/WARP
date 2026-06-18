import type {
  GetUserByEmailQuery,
  GetUserByMobileQuery
} from "@/graphql/server/generated";
import { getSdkInstance } from "@/graphql/server/sdk";
import { UserExistResponse } from "@/types/interface.types";

type UserWithStatus =
  | GetUserByEmailQuery["Tbl_Users"][0]
  | GetUserByMobileQuery["Tbl_Users"][0];

export async function getUserByEmailOrMobile(
  Email?: string,
  Mobile?: string
): Promise<UserExistResponse> {
  const sdk = await getSdkInstance();
  let result:
    | Awaited<ReturnType<typeof sdk.GetUserByEmail>>
    | Awaited<ReturnType<typeof sdk.GetUserByMobile>>;

  // Ensure at least one identifier is provided
  if ((!Email || Email.trim() === "") && (!Mobile || Mobile.trim() === "")) {
    return {
      status200OK: 400,
      saveresult: {
        tblUsers: {
          userGuid: "",
          firstName: null,
          cpanelUserId: null,
          opsUserId: null,
          emailId: null,
          mobileNumber: null,
          isVerified: null
        },
        listTblRoles: [],
        userStatusVM: {
          checkStatus: ""
        }
      }
    };
  }

  try {
    // Query the database using the appropriate GraphQL query based on the provided identifier
    if (Email?.trim()) {
      result = await sdk.GetUserByEmail({ email: Email.trim() });
    } else if (Mobile?.trim()) {
      result = await sdk.GetUserByMobile({ mobile: Mobile.trim() });
    } else {
      return {
        status200OK: 400,
        saveresult: {
          tblUsers: {
            userGuid: "",
            firstName: null,
            cpanelUserId: null,
            opsUserId: null,
            emailId: null,
            mobileNumber: null,
            isVerified: null
          },
          listTblRoles: [],
          userStatusVM: {
            checkStatus: ""
          }
        }
      };
    }

    if (!result?.Tbl_Users?.[0]) {
      console.error("User not found with the provided credentials");
      return {
        status200OK: 404,
        saveresult: {
          tblUsers: {
            userGuid: "",
            firstName: null,
            cpanelUserId: null,
            opsUserId: null,
            emailId: null,
            mobileNumber: null,
            isVerified: null
          },
          listTblRoles: [],
          userStatusVM: {
            checkStatus: ""
          }
        }
      };
    }

    const user = result.Tbl_Users[0];
    const typedUser = user as UserWithStatus;

    // Get user role mappings data
    const userRoleMappingsData = await sdk.gettbluserrolemappingsdata({
      userguid: typedUser.UserGuid
    });

    // Prepare the success response
    const responseData: UserExistResponse = {
      status200OK: 200,
      saveresult: {
        tblUsers: {
          userGuid: typedUser.UserGuid || "",
          firstName: typedUser.FirstName || null,
          cpanelUserId:
            typedUser.CpanelUserId != null
              ? Number(typedUser.CpanelUserId)
              : null,
          opsUserId:
            typedUser.OPSUserId != null ? Number(typedUser.OPSUserId) : null,
          emailId: typedUser.EmailId || null,
          mobileNumber: typedUser.MobileNumber || null,
          isVerified: (typedUser as any).IsVerified || null
        },
        listTblRoles:
          userRoleMappingsData.Tbl_UserRoleMapping?.map((mapping) => ({
            roleGuid: mapping.Tbl_Role?.RoleGuid,
            roleName: mapping.Tbl_Role?.RoleName,
            isActive: mapping.Tbl_Role?.IsActive,
            createdDateUtc: mapping.Tbl_Role?.CreatedDateUtc
          })) || [],
        userStatusVM: {
          checkStatus:
            userRoleMappingsData.Tbl_UserRoleMapping?.[0]?.Tbl_UserStatusMaster
              ?.Status ?? ""
        }
      }
    };

    return responseData;
  } catch (error: any) {
    console.error("Error in getUserByEmailOrMobile service:", error);
    return {
      status200OK: 500,
      saveresult: {
        tblUsers: {
          userGuid: "",
          firstName: null,
          cpanelUserId: null,
          opsUserId: null,
          emailId: null,
          mobileNumber: null,
          isVerified: null
        },
        listTblRoles: [],
        userStatusVM: {
          checkStatus: ""
        }
      }
    };
  }
}

export async function getUserByOpsUserIds(opsUserIds?: string[]): Promise<any> {
  const sdk = await getSdkInstance();
  // Ensure opsUserIds is provided and not empty
  if (
    !opsUserIds ||
    opsUserIds.length === 0 ||
    opsUserIds.every((id) => !id || id.trim() === "")
  ) {
    return {
      status200OK: 400,
      saveresult: {
        tblUsers: []
      }
    };
  }

  try {
    // Filter out empty or null IDs and trim valid ones
    const validOpsUserIds = opsUserIds
      .filter((id) => id && id.trim() !== "")
      .map((id) => id.trim());

    if (validOpsUserIds.length === 0) {
      return {
        status200OK: 400,
        saveresult: {
          tblUsers: []
        }
      };
    }

    // Query the database using the GraphQL query for OPS User IDs
    const result = await sdk.GetUserDetailsByOpsUserIds({
      OPSUserIds: validOpsUserIds
    });

    if (!result?.Tbl_Users || result.Tbl_Users.length === 0) {
      console.error("No users found with the provided OPS User IDs");
      return {
        status200OK: 404,
        saveresult: {
          tblUsers: []
        }
      };
    }

    // Map all users to the response format
    const users = result.Tbl_Users.map((user) => ({
      userGuid: user.UserGuid || "",
      emailId: user.EmailId || null,
      mobileNumber: user.MobileNumber || null,
      firstName: user.FirstName || null,
      lastName: user.LastName || null,
      isActive: user.IsActive || null,
      companyName: user.CompanyName || null,
      password: user.Password || null,
      createdDate: user.CreatedDate || null,
      setPasswordToken: user.SetPasswordToken || null,
      opsUserId: user.OPSUserId || null
    }));

    // Prepare the success response
    const responseData = {
      status200OK: 200,
      saveresult: {
        tblUsers: users
      }
    };

    return responseData;
  } catch (error: any) {
    console.error("Error in getUserByOpsUserId service:", error);
    return {
      status200OK: 500,
      saveresult: {
        tblUsers: []
      }
    };
  }
}
