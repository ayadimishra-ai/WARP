import { passwordEncrypt } from "@/util/passwordEncrypt";
import { getSdkInstance } from "@/graphql/server/sdk";
import { globalSetting } from "@/util/globalSetting";
import axios from "axios";
import { generateOpsToken } from "./opstoken.service";
import { emailDecrypt } from "@/util/emailDecrypt";
import { getServerEnv } from "@/lib/env/env.server";

export interface UserData {
  UserGuid: string;
  EmailId: string;
  IsVerified: boolean;
  CpanelUserId?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  MobileNumber?: string | null;
  OPSUserId?: string | null;
  Tbl_UserCompanyMappings?: Array<{
    CompanyGuid?: string | null;
    Tbl_Company?: {
      Tbl_CompanyRoleMappings?: Array<{
        Tbl_Role?: {
          RoleName: string;
          RoleGuid?: string;
        };
      }>;
    };
  }>;
}

export async function SetNewPasswordForInternalAssessment(
  encryptedEmailId: string,
  password: string,
  formid: string
) {
  try {
    const env = await getServerEnv();
    const sdk = await getSdkInstance();
    // 1. Get user data
    const userResult = await sdk.GetUserByEmail({
      email: encryptedEmailId.toLocaleUpperCase()
    });

    const user = userResult.Tbl_Users?.[0] as UserData | undefined;

    if (!user) {
      return { status200OK: 404, saveresult: "User not found" };
    }

    if (user.IsVerified) {
      return {
        status200OK: 400,
        saveresult: "Your password has already been updated."
      };
    }

    // 2. Get user's company mappings to find role
    const userCompanyResult = await sdk.GetUserCompanyMappingsDetailsByEmail({
      email: encryptedEmailId.toLocaleUpperCase()
    });

    const userData = userCompanyResult.Tbl_Users?.[0] as UserData | undefined;
    const companyMappings = userData?.Tbl_UserCompanyMappings;

    const userRoleMappingResult = await sdk.GetUserRoleMappingByUserGuid({
      userGuid: user.UserGuid
    });
    const userRoleMapping = userRoleMappingResult.Tbl_UserRoleMapping?.[0];
    const companyRole = userRoleMapping?.Tbl_Role?.RoleName;
    const userRoleGuid = userRoleMapping?.RoleGuid;

    if (!companyRole) {
      return { status200OK: 404, saveresult: "User role not found" };
    }

    // 3. Update user password by attempting to log in with new credentials
    const encryptedPassword = passwordEncrypt(password);

    try {
      // This will update the last login time but not the password
      // We need a proper password update mutation
      if (!user.IsVerified) {
        const statusData = await sdk.GetUserStatusMasterByName({
          status: "Registered"
        });

        const updateResult = await sdk.updateUser({
          input: [
            {
              where: { UserGuid: { _eq: user.UserGuid } },
              _set: {
                isResetPasswordDone: true,
                IsVerified: true,
                Password: encryptedPassword,
                SetPasswordToken: null
              }
            }
          ]
        });

        sdk.updateUserRoleMappingStatus({
          userGuid: user.UserGuid,
          statusGuid:
            !!statusData?.Tbl_UserStatusMaster &&
            statusData?.Tbl_UserStatusMaster.length > 0
              ? statusData?.Tbl_UserStatusMaster[0]?.StatusGuid
              : ""
        });
        if (updateResult.update_Tbl_Users_many?.length === 0) {
          console.error("Password update did not affect any rows");
          return { status200OK: 500, saveresult: "Failed to update password" };
        }
      } else {
        return {
          status200OK: 400,
          saveresult: "Your password has already been updated."
        };
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      return { status200OK: 500, saveresult: "Failed to update password" };
    }

    // 4. Assign role-based permissions
    const roleName = companyRole.toUpperCase();

    if (["BUYER", "SUPPLIER", "CARBONACCOUNTANT", "LOCATIONEXECUTIVE"].includes(roleName)) {
      const roleId = userRoleGuid;

      if (roleId) {
        try {
          // Determine page keys based on form_type (Report vs Assessment)
          let pageKeys: string[];

          if (formid && formid.trim() !== "") {
            const formIds = [...new Set(formid.split(",").map((id) => id.trim()).filter(Boolean))];

            // Fetch all forms in parallel; skip IDs that return no result
            const formResponses = await Promise.all(
              formIds.map((id) =>
                sdk.GetWarpFormById({ formId: id }).catch(() => null)
              )
            );

            // Collect the union of form types across all resolved forms
            const formTypes = new Set(
              formResponses
                .map((res) => res?.Tbl_WarpForms?.[0]?.formtype)
                .filter((ft): ft is string => !!ft)
            );

            // Build the union of page keys for every form type found
            const pageKeySet = new Set<string>(["dashboard", "ChatWithSnowkapAI"]);
            if (formTypes.has("Report")) pageKeySet.add("Assessments_reporting");
            if (formTypes.has("Assessment")) pageKeySet.add("Assessments");
            // DocumentRepository is only accessible when the form type is Report or Assessment
            if (formTypes.has("Report") || formTypes.has("Assessment")) pageKeySet.add("DocumentRepository");
            pageKeys = [...pageKeySet];
          } else {
            pageKeys = ["dashboard", "Assessments", "DocumentRepository", "ChatWithSnowkapAI"];
          }

          // Get permissions for role and pages
          const permissionResult = await sdk.GetPermissionsByRoleAndPages({
            roleGuid: roleId,
            pageKeys: pageKeys
          });

          const permissions = permissionResult.Tbl_Permissions || [];

          // Add user permissions only if they don't already exist
          if (permissions.length > 0) {
            for (const permission of permissions) {
              const { Tbl_UserPermissions } =
                await sdk.GetUserPermissionsByUserAndPermissionGuid({
                  userGuid: user.UserGuid,
                  permissionGuids: [permission.PermissionGuid]
                });

              if (!Tbl_UserPermissions?.length) {
                await sdk.InsertUserPermission({
                  object: {
                    UserGuid: user.UserGuid,
                    PermissionGuid: permission.PermissionGuid,
                    Rights: "W",
                    CreatedDate: new Date().toISOString()
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error("Error assigning permissions:", error);
        }
      }
    } else if (roleName === "VENTURECAPITALIST") {
      if (formid && formid.trim() !== "") {
        // Split formid string into unique trimmed IDs
        const formIds = [...new Set(formid.split(",").map((id) => id.trim()))];

        // Batch fetch forms
        const formsResponse = await Promise.all(
          formIds.map((formId) =>
            sdk
              .GetWarpFormById({ formId })
              .then((res) => ({
                formId,
                form: res.Tbl_WarpForms?.[0] ?? null
              }))
              .catch(() => ({ formId, form: null }))
          )
        );

        const formsMap = new Map(
          formsResponse
            .filter((item) => item.form)
            .map((item) => [item.formId, item.form])
        );

        // ⚡ Pick first form (instead of wrong formsMap.get(formid))
        const form = formsMap.get(formIds[0]);
        const form_type = form?.formtype || "";

        // Pages to check
        const pageKeys = [
          "Assessments",
          "dashboard",
          "Assess",
          "Assessments_reporting",
          "DocumentRepository",
          "ChatWithSnowkapAI"
        ];

        const pagesResponse = await Promise.all(
          pageKeys.map((key) =>
            sdk
              .GetPageByKey({ pageKey: key })
              .then((res) => ({
                key,
                page: res.Tbl_Pages?.[0] ?? null
              }))
              .catch(() => ({ key, page: null }))
          )
        );

        const pages = pagesResponse
          .filter((item) => item.page)
          .map((item) => ({
            pageKey: item.key,
            pageGuid: item.page!.PageGuid
          }));

        // Fetch permissions for all pages
        const permissionsResponse = await Promise.all(
          pages.map((page) =>
            sdk
              .GetPermissionsByRoleAndPagesGuid({
                roleGuid: userRoleGuid,
                pageGuid: page.pageGuid
              })
              .then((res) => ({
                pageGuid: page.pageGuid,
                permission: res.Tbl_Permissions?.[0] ?? null
              }))
              .catch(() => ({ pageGuid: page.pageGuid, permission: null }))
          )
        );
        const permissionMap = new Map(
          permissionsResponse
            .filter((item) => item.permission)
            .map((item) => [item.pageGuid, item.permission])
        );

        // Assign permissions based on form_type & pageKey
        const permissionPromises = pages.map(async (page) => {
          const shouldAssign =
            (form_type === "Report" &&
              page.pageKey === "Assessments_reporting") ||
            (form_type === "Assessment" &&
              (page.pageKey === "Assessments")) ||
            page.pageKey === "dashboard" ||
            page.pageKey === "DocumentRepository" ||
            page.pageKey === "ChatWithSnowkapAI";

          if (!shouldAssign) return;

          const permission = permissionMap.get(page.pageGuid);
          if (!permission) return;

          const { Tbl_UserPermissions } =
            await sdk.GetUserPermissionsByUserAndPermissionGuid({
              userGuid: user.UserGuid,
              permissionGuids: [permission.PermissionGuid]
            });

          if (!Tbl_UserPermissions?.length) {
            await sdk.InsertUserPermission({
              object: {
                UserGuid: user.UserGuid,
                PermissionGuid: permission.PermissionGuid,
                Rights: "W"
              }
            });
          }
        });

        await Promise.all(permissionPromises);
      } else {
        const permissionGuids = [
          "246f9e24-0f62-4679-bf79-d725f9cb3548",
          "fe687e2b-efb2-4eb5-a6c2-0aafa2f96003"
          //,"ef545b92-55d6-40f0-ad99-1404fe40ec8e"
        ];

        if (permissionGuids.length > 0) {
          try {
            // Check existing permissions before inserting
            const userPermissionResponse =
              await sdk.GetUserPermissionsByUserAndPermissionGuid({
                userGuid: user.UserGuid,
                permissionGuids: permissionGuids
              });

            const existingPermissions =
              userPermissionResponse?.Tbl_UserPermissions || [];

            // Find missing permissions
            const missingPermissions = permissionGuids.filter(
              (permissionGuid) =>
                !existingPermissions.some(
                  (perm) => perm.PermissionGuid === permissionGuid
                )
            );

            // Only insert permissions that don't already exist
            for (const permissionGuid of missingPermissions) {
              await sdk.InsertUserPermission({
                object: {
                  UserGuid: user.UserGuid,
                  PermissionGuid: permissionGuid,
                  Rights: "W",
                  CreatedDate: new Date().toISOString()
                }
              });
            }
          } catch (error) {
            console.error("Error assigning permissions:", error);
          }
        }
      }
    }

    // 5. Call WARP API to update reset password flag if needed
    if (user.CpanelUserId) {
      try {
        const settings = await globalSetting();
        const apiUrl = settings.accessTokenUrl;
        const clientSecret = settings.clientSecret;
        const clientId = settings.clientId;
        const warpUrl = apiUrl + "api/v1/platform/user/UpdateResetPasswordFlag";
        const warpResponse = await axios({
          method: "PUT",
          url: warpUrl,
          headers: {
            Accept: "*/*",
            "x-warp-shared-secret": clientSecret,
            "x-warp-shared-key": clientId,
            "Content-Type": "application/json"
          },
          data: JSON.stringify({ id: user.CpanelUserId })
        });

        if (!warpResponse.status) {
          console.error("Failed to update WARP reset password flag");
        }
      } catch (error) {
        console.error("Error calling WARP API:", error);
      }
    }
    if (user?.OPSUserId && companyMappings?.[0]?.CompanyGuid) {
      try {
        //NOTE : Manage to handle "isRegistered" flag on OP to handle that user has reset password but not logged in yet
        const decryptedEmailId = emailDecrypt(
          {
            encryptionKey: env.ENCRYPTION_KEY,
            encryptionIV: env.ENCRYPTION_IV
          },
          encryptedEmailId
        );
        await generateOpsToken(
          decryptedEmailId,
          companyMappings?.[0]?.CompanyGuid || ""
        );
      } catch (error) {
        console.error(" Error in generating op token");
      }
    }

    return {
      success: true,
      message: "Password updated successfully",
      saveresult: "Success"
    };
  } catch (error) {
    console.error("Error in SetNewPasswordForInternalAssessment:", error);
    return {
      success: false,
      message: "An error occurred while updating the password"
    };
  }
}
