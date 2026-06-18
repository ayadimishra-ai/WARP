import { getSdkInstance } from "@/graphql/server/sdk";
import {
  Tbl_Permissions_Bool_Exp,
  Tbl_UserPermissions_Insert_Input
} from "@/graphql/types";
import {
  getDefaultUserPermissionsByRoleName,
  getUserPermissionsByUserGuid,
  getUserWithPermissions
} from "./ghg-esg-user.service";

export type opsUserRequest = {
  name: string;
  email: string;
  mobile: string;
  companyGuid: string;
  userGuid: string;
  userRole: string;
  companyPanNumber: string;
  companyName: string;
};
export async function checkUserDataService(data: opsUserRequest) {
  // debugger;
  try {
    const getResponse = (
      payload: any,
      code: number,
      message: any,
      error: any = null,
      isError = false
    ) => {
      return [{ data: payload, code, message, error, isError }];
      // return [{ data: payload, code, message, error, isError }];
    };

    const sdk = await getSdkInstance();
    const userData = data;

    if (!data || !data) {
      throw new Error("Invalid input data");
    }

    const emailId = userData?.email;
    const OPSCompanyIdRequest = userData?.companyGuid;
    const OPSUserIdRequest = userData?.userGuid;
    const role = String(userData?.userRole).toUpperCase();
    const userCompanyPanNumber = userData?.companyPanNumber;
    const companyName = userData?.companyName;

    if (!emailId || !OPSCompanyIdRequest || !companyName) {
      throw new Error(
        "Missing required fields: email, companyGuid, or companyName"
      );
    }

    // Call the GetUserByEmail GraphQL query using the sdk
    const result = await sdk.GetUserDetailsByEmailId({ EmailId: emailId });
    const doesUserExists = !!result && result.Tbl_Users.length > 0;

    if (doesUserExists) {
      const OPSCompanyIdDB =
        result.Tbl_Users[0]?.Tbl_UserCompanyMappings[0]?.Tbl_Company
          ?.OPSCompanyId;
      const OPSUserId = result.Tbl_Users[0]?.OPSUserId;
      const userId = result.Tbl_Users[0]?.UserGuid;
      const roleData = await sdk.GetRoleByName({ roleName: role });
      const roleGuid = roleData.Tbl_Roles[0].RoleGuid;

      const companyPanNumberDB =
        result.Tbl_Users[0]?.Tbl_UserCompanyMappings[0]?.Tbl_Company
          ?.Tbl_CompanyGeneralDetails[0]?.PANCardNumber;

      const companyNameDB =
        result.Tbl_Users[0]?.Tbl_UserCompanyMappings[0]?.Tbl_Company
          ?.CompanyName;

      // const hasOpsCompanyId = !!OPSCompanyIdDB;
      const isCompanyIdMatching = OPSCompanyIdDB === OPSCompanyIdRequest;

      if (!isCompanyIdMatching) {
        return getResponse(
          null,
          6,
          { email: "Email already registered with different company" },
          null,
          false
        );
      }

      // if (!companyName || !companyNameDB) {
      //   return getResponse(
      //     null,
      //     6,
      //     {
      //       email: "Invalid request, company name is missing"
      //     },
      //     null,
      //     false
      //   );
      // }

      // const isCompanyNameMatching =
      //   companyNameDB?.trim().toUpperCase() ===
      //   companyName.trim().toUpperCase();

      // if (!isCompanyNameMatching) {
      //   return getResponse(
      //     null,
      //     6,
      //     { email: "Email already registered with different company" },
      //     null,
      //     false
      //   );
      // }

      // if (!companyPanNumberDB || !userCompanyPanNumber) {
      //   return getResponse(
      //     null,
      //     6,
      //     { email: "User already registered with different company" },
      //     null,
      //     false
      //   );
      // }

      // const isPanNumberMatching =
      //   companyPanNumberDB.trim().toUpperCase() ===
      //   userCompanyPanNumber.trim().toUpperCase();

      // if (!isPanNumberMatching) {
      //   return getResponse(
      //     null,
      //     6,
      //     { email: "Provided PAN number does not match with our records" },
      //     null,
      //     false
      //   );
      // }

      if (
        !!userId &&
        !!OPSCompanyIdRequest &&
        !!companyName &&
        !!companyNameDB
      ) {
        const userPermissionInsertion: Tbl_UserPermissions_Insert_Input[] = [];

        const existingUserPermissions =
          await getUserPermissionsByUserGuid(userId);

        const defaultPermissionsByRole =
          await getDefaultUserPermissionsByRoleName(
            roleData.Tbl_Roles[0].RoleName
          );

        for (const permission of existingUserPermissions) {
          userPermissionInsertion.push({
            UserGuid: userId,
            PermissionGuid: permission?.PermissionGuid,
            Rights: permission?.Rights || "W" // Retain existing rights or default to Write
          });
        }

        for (const permission of defaultPermissionsByRole) {
          // Skip if permission already exists from existingUserPermissions
          const alreadyHasPermission = userPermissionInsertion.some(
            (p) =>
              p.PermissionGuid === permission.PermissionGuid &&
              p.UserGuid === userId
          );

          if (alreadyHasPermission) {
            continue;
          }

          userPermissionInsertion.push({
            UserGuid: userId,
            PermissionGuid: permission?.PermissionGuid,
            Rights: "W" // Retain existing rights or default to Write
          });
        }

        // Update OPSUserId in Tbl_Users
        if (!OPSUserId) {
          await sdk.updateOPSUserId({
            userGuid: userId,
            opsUserId: OPSUserIdRequest
          });
        }

        // Update user role
        if (!OPSUserId) {
          await sdk.updateUserRoleByUserId({
            userGuid: userId,
            roleGuid: roleGuid
          });
        }

        if (userPermissionInsertion.length > 0) {
          // Upsert user permissions
          await sdk.upsertUserPermissions({
            userguid: userId,
            input: userPermissionInsertion
          });
        }

        const isNewUser = !OPSUserId && !!OPSUserIdRequest;

        if (isNewUser) {
          return getResponse(
            null,
            200,
            { email: "OP Permissions Updated" },
            null,
            false
          );
        }

        return getResponse(null, 6, { email: "Invalid request" }, null, true);
      } else {
        // return { status200OK: 200, saveresult: "Email already registered with different company" };
        return getResponse(null, 6, { email: "Invalid request" }, null, true);
      }
    } else {
      // return { status200OK: 200, saveresult: "New User" };
      return getResponse(null, 6, { email: "New User" }, null, false);
    }
  } catch (error) {
    console.error("Error in checkUserDataService:", error);
    // return { status200OK: 500, saveresult: "Internal server error.", error: error.message };
  }
}
