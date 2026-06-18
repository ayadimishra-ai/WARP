// File: /services/user.service.ts

import { v4 as uuidv4 } from "uuid";
import { getSdkInstance } from "@/graphql/server/sdk";
import { passwordEncrypt } from "@/util/passwordEncrypt";
import { any, string } from "zod";
import {
  Tbl_Permissions_Bool_Exp,
  Tbl_UserCompanyMapping_Insert_Input,
  Tbl_UserPermissions_Insert_Input,
  Tbl_UserRoleMapping,
  Tbl_UserRoleMapping_Insert_Input,
  Tbl_Users,
  Tbl_Users_Insert_Input,
  Tbl_Users_Updates
} from "@/graphql/types";
import { permission } from "process";
export type opsUserRequest = {
  CreatedBy: string;
  name: string;
  email: string;
  mobile: string;
  companyGuid: string;
  userGuid: string;
  userRole: string;
  setNewPasswordToken: string | null;
};
export async function CreateUser(Managedata: any) {
  const { op, data } = Managedata;
  const newUser = data.new;
  const oldUser = data.old;
  let userFound = false;
  let responseData = null;

  const getResponse = (
    payload: any,
    code: number,
    message = "",
    error: any = null,
    isError = false
  ) => {
    return { data: payload, code, message, error, isError };
  };
  const sdk = await getSdkInstance();

  try {
    switch (op) {
      case "INSERT": {
        // Validation
        if (!newUser.id) {
          return getResponse(null, 11, "id should not be empty", null, true);
        }
        if (!newUser.companyId) {
          return getResponse(
            null,
            7,
            "companyId should not be empty",
            null,
            true
          );
        }
        if (!newUser.email) {
          return getResponse(null, 9, "email should not be empty", null, true);
        }
        if (!newUser.created_by) {
          return getResponse(
            null,
            12,
            "created_by should not be empty",
            null,
            true
          );
        }

        try {
          // Check if company exists
          const { Tbl_Companies } = await sdk.GetCompanyByCpanelId({
            cpanelCompanyId: newUser.companyId
          });
          const company = Tbl_Companies?.[0];
          if (!company) {
            return getResponse(null, 1, "CompanyId does not exist", null, true);
          }

          // Check if email already exists
          const { Tbl_Users: emailUsers } = await sdk.GetUserByEmail({
            email: newUser.email.toUpperCase()
          });
          if (emailUsers?.length > 0) {
            return getResponse(null, 3, "Email already exists", null, true);
          }

          // Check if mobile number exists if provided
          if (newUser.phone) {
            const { Tbl_Users: mobileUsers } = await sdk.GetUserByMobile({
              mobile: newUser.phone
            });
            if (mobileUsers?.length > 0) {
              return getResponse(
                null,
                4,
                "Mobile Number already exists",
                null,
                true
              );
            }
          }

          // Get created by user
          const { Tbl_Users: creatorUsers } = await sdk.GetUserByCpanelId({
            cpanelUserId: newUser.created_by
          });
          const creator = creatorUsers?.[0];
          if (!creator) {
            return getResponse(
              null,
              12,
              "created_by does not exist",
              null,
              true
            );
          }

          // Get default password from global settings
          const { Tbl_GlobalSettings } = await sdk.GetGlobalSettingByKey({
            settingsKey: "UPS_PASSWORD"
          });
          const defaultPassword = Tbl_GlobalSettings?.[0]?.SettingsValue || "";

          // Get company role and status mapping
          let userRoleGuid = null;
          let userStatusGuid = uuidv4(); // Default status GUID

          const { Tbl_CompanyRoleMapping } = await sdk.GetCompanyRoleMapping({
            companyGuid: company.CompanyGuid
          });
          const companyRoleMapping = Tbl_CompanyRoleMapping?.[0];
          
            

          if (companyRoleMapping) {
            if (companyRoleMapping?.Tbl_Role?.RoleName) {
              if (String(companyRoleMapping?.Tbl_Role?.RoleName).toUpperCase() ===
                "CARBONACCOUNTANT" || String(companyRoleMapping?.Tbl_Role?.RoleName).toUpperCase() ===
                "ORGANIZATIONADMIN") { 
                  const { Tbl_Roles } = await sdk.GetRoleByName({
                  roleName: "LOCATIONEXECUTIVE"
                });
                  userRoleGuid = Tbl_Roles?.[0]?.RoleGuid;
              } else {
                // If role is not CARBONACCOUNTANT, assign BUYER role
                  userRoleGuid = companyRoleMapping?.Tbl_Role?.RoleGuid;
              }
            }

            // Get company status name
            const { Tbl_CompanyStatusMaster } =
              await sdk.GetCompanyStatusMaster({
                companyStatusGuid:
                  companyRoleMapping?.Tbl_CompanyStatusMaster?.CompanyStatusGuid
              });
            const companyStatus = Tbl_CompanyStatusMaster?.[0];

            if (companyStatus) {
              // Get corresponding user status GUID
              const { Tbl_UserStatusMaster } =
                await sdk.GetUserStatusMasterByName({
                  status: companyStatus.CompanyStatusName
                });
              if (Tbl_UserStatusMaster?.length > 0) {
                userStatusGuid = Tbl_UserStatusMaster[0].StatusGuid;
              }
            }
          }

          // If no role found, get default BUYER role
          if (!userRoleGuid) {
            const { Tbl_Roles } = await sdk.GetRoleByName({
              roleName: "SUPPLIER"
            });
            userRoleGuid = Tbl_Roles?.[0]?.RoleGuid;
          }

          // Create user
          const userGuid = uuidv4();

          // Create user
          const createdUser = await sdk.createUser({
            object: {
              UserGuid: userGuid,
              FirstName: newUser.name,
              EmailId: newUser.email.toUpperCase(),
              MobileNumber: newUser.phone,
              Password: passwordEncrypt(defaultPassword),
              UserProfileImage: newUser.image,
              IsActive: true,
              CpanelUserId: newUser.id,
              IsVerified: newUser.emailVerified,
              CreatedBy: creator.UserGuid,
              ModifiedBy: creator.UserGuid,
              CompanyName: company.CompanyName,
              CreatedDate: new Date().toISOString(),
              SetPasswordToken: newUser.id?.toString()?.replaceAll("-", "")
            }
          });

          // Create user-company mapping
          await sdk.createUserCompanyMapping({
            object: {
              UserGuid: userGuid,
              CompanyGuid: company.CompanyGuid,
              IsActive: true,
              CreatedBy: creator.UserGuid,
              CreatedDate: new Date().toISOString()
            }
          });

          // Create user-role mapping
          if (userRoleGuid) {
            await sdk.createUserRoleMapping({
              object: {
                UserGuid: userGuid,
                RoleGuid: userRoleGuid,
                StatusGuid: userStatusGuid,
                CreatedBy: creator.UserGuid,
                CreatedDate: new Date().toISOString()
              }
            });
          }

          return getResponse(
            {
              userGuid,
              companyGuid: company.CompanyGuid,
              companyName: company.CompanyName,
              userName: newUser.name,
              mobile: newUser.phone || "",
              email: newUser.email.toUpperCase(),
              opsUserId:
                createdUser?.insert_Tbl_Users?.returning?.[0]?.OPSUserId,
              setPasswordToken:
                createdUser?.insert_Tbl_Users?.returning?.[0]?.SetPasswordToken
            },
            200
          );
        } catch (error) {
          console.error("Error in INSERT operation:", error);
          return getResponse(
            null,
            500,
            "Internal server error 172" + error,
            error,
            true
          );
        }
      }

      case "UPDATE": {
        // Validation
        if (!newUser.id) {
          return getResponse(null, 11, "id should not be empty", null, true);
        }
        if (!newUser.companyId) {
          return getResponse(
            null,
            7,
            "companyId should not be empty",
            null,
            true
          );
        }
        if (!newUser.email) {
          return getResponse(null, 9, "email should not be empty", null, true);
        }

        // Check if company exists
        const { Tbl_Companies } = await sdk.GetCompanyByCpanelId({
          cpanelCompanyId: newUser.companyId
        });
        const company = Tbl_Companies?.[0];
        if (!company) {
          return getResponse(null, 1, "CompanyId does not exist", null, true);
        }

        // Get updater user
        const updaterCpanelId = newUser.updated_by || newUser.created_by;
        if (!updaterCpanelId) {
          return getResponse(
            null,
            12,
            "updated_by/created_by is required",
            null,
            true
          );
        }

        const { Tbl_Users: updaterUsers } = await sdk.GetUserByCpanelId({
          cpanelUserId: updaterCpanelId
        });
        const updater = updaterUsers?.[0];
        if (!updater) {
          return getResponse(null, 12, "Updater user not found", null, true);
        }

        // Find existing user
        const { Tbl_Users } = await sdk.GetUserByCpanelId({
          cpanelUserId: newUser.id
        });
        const user = Tbl_Users?.[0];

        if (user) {
          // Update existing user
          const object = [];
          object.push({
            where: {
              UserGuid: {
                _eq: user.UserGuid
              }
            },
            _set: {
              FirstName: newUser.name,
              MobileNumber: newUser.phone,
              EmailId: newUser.email.toUpperCase(),
              UserProfileImage: newUser.image,
              IsVerified: true,
              IsActive: newUser.isActive,
              ModifiedBy: updater.UserGuid,
              ModifiedDate: new Date().toISOString()
            }
          });

          await sdk.updateUser({
            input: object
          });

          return getResponse(
            {
              userGuid: user.UserGuid,
              userName: newUser.name,
              email: newUser.email,
              mobile: newUser.phone || "",
              opsUserId: user?.OPSUserId,
              setPasswordToken: user?.SetPasswordToken
            },
            200
          );
        } else {
          // Check if user exists by email in the same company
          const { Tbl_UserCompanyMapping } =
            await sdk.GetUserCompanyMappingByCompanyGuid({
              companyGuid: company.CompanyGuid
            });

          for (const mapping of Tbl_UserCompanyMapping || []) {
            const { Tbl_Users: companyUsers } = await sdk.GetUserByGuid({
              userGuid: mapping.UserGuid
            });
            const companyUser = companyUsers?.[0];

            if (
              companyUser?.EmailId?.toUpperCase() ===
              newUser.email.toUpperCase()
            ) {
              // Check if mobile matches if provided
              if (newUser.phone && companyUser.MobileNumber !== newUser.phone) {
                continue;
              }

              // Check if name and image match if provided
              if (newUser.name && companyUser.FirstName !== newUser.name) {
                continue;
              }

              if (
                newUser.image &&
                companyUser.UserProfileImage !== newUser.image
              ) {
                continue;
              }

              // Update the user

              const object = [];
              object.push({
                where: {
                  UserGuid: {
                    _eq: companyUser.UserGuid
                  }
                },
                _set: {
                  FirstName: newUser.name,
                  MobileNumber: newUser.phone,
                  EmailId: newUser.email.toUpperCase(),
                  UserProfileImage: newUser.image,
                  IsActive:
                    newUser.isActive !== undefined
                      ? newUser.isActive
                      : companyUser.IsActive,
                  CpanelUserId: newUser.id,
                  ModifiedBy: updater.UserGuid,
                  ModifiedDate: new Date().toISOString(),
                  IsVerified: true
                }
              });

              await sdk.updateUser({
                input: object
              });

              return getResponse(
                {
                  userGuid: companyUser.UserGuid,
                  userName: newUser.name,
                  email: newUser.email.toUpperCase(),
                  mobile: newUser.phone || "",
                  opsUserId: companyUser?.OPSUserId,
                  setPasswordToken: companyUser?.SetPasswordToken
                },
                200
              );
            }

            responseData = {
              userGuid: companyUser.UserGuid,
              companyGuid: company.CompanyGuid,
              companyName: company.CompanyName,
              userName: newUser.name,
              mobile: newUser.phone || "",
              email: newUser.email.toUpperCase(),
              opsUserId: companyUser?.OPSUserId,
              setPasswordToken: companyUser?.SetPasswordToken
            };

            userFound = true;
            break;
          }
        }

        if (!userFound) {
          return getResponse(
            null,
            2,
            "No matching user found to update",
            null,
            true
          );
        }

        return getResponse(responseData, 0, "", null, false);
      }

      case "DELETE": {
        // Validation
        if (!oldUser) {
          return getResponse(null, 11, "id should not be empty", null, true);
        }
        if (!oldUser.id) {
          return getResponse(null, 11, "id should not be empty", null, true);
        }

        // Get deleter user (tries updated_by first, falls back to created_by)
        const deleterCpanelId = oldUser.updated_by || oldUser.created_by;
        if (!deleterCpanelId) {
          return getResponse(
            null,
            12,
            "updated_by/created_by is required",
            null,
            true
          );
        }

        const { Tbl_Users: deleterUsers } = await sdk.GetUserByCpanelId({
          cpanelUserId: deleterCpanelId
        });
        const deleter = deleterUsers?.[0];
        if (!deleter) {
          return getResponse(null, 12, "Deleter user not found", null, true);
        }

        // Try to find user by CpanelUserId first
        const { Tbl_Users } = await sdk.GetUserByCpanelId({
          cpanelUserId: oldUser.id
        });
        const user = Tbl_Users?.[0];

        if (user) {
          // Update user's IsActive status
          await sdk.updateUser({
            input: [
              {
                where: {
                  UserGuid: {
                    _eq: user.UserGuid
                  }
                },
                _set: {
                  IsActive: oldUser.isActive,
                  ModifiedBy: deleter.UserGuid,
                  ModifiedDate: new Date().toISOString()
                }
              }
            ]
          });

          return getResponse(
            {
              userGuid: user.UserGuid,
              userName: user.FirstName,
              email: user.EmailId,
              mobile: user.MobileNumber || "",
              opsUserId: user?.OPSUserId,
              setPasswordToken: user.SetPasswordToken
            },
            200
          );
        } else {
          // If user not found by CpanelUserId, try to find by email in company
          const { Tbl_Companies } = await sdk.GetCompanyByCpanelId({
            cpanelCompanyId: oldUser.id
          });
          const company = Tbl_Companies?.[0];

          if (!company) {
            return getResponse(null, 1, "Company not found", null, true);
          }

          // Get all users in the company
          const { Tbl_UserCompanyMapping } =
            await sdk.GetUserCompanyMappingByCompanyGuid({
              companyGuid: company.CompanyGuid
            });

          let userToUpdate = null;

          // Find user by email in the company
          if (oldUser.email) {
            for (const mapping of Tbl_UserCompanyMapping || []) {
              const { Tbl_Users: companyUsers } = await sdk.GetUserByGuid({
                userGuid: mapping.UserGuid
              });
              const companyUser = companyUsers?.[0];

              if (
                companyUser?.EmailId?.toLowerCase() ===
                oldUser.email.toLowerCase()
              ) {
                userToUpdate = companyUser;
                break;
              }
            }
          }

          if (!userToUpdate) {
            return getResponse(null, 404, "User not found", null, true);
          }

          // Update the found user
          await sdk.updateUser({
            input: [
              {
                where: {
                  UserGuid: {
                    _eq: userToUpdate.UserGuid
                  }
                },
                _set: {
                  IsActive: oldUser.isActive,
                  CpanelUserId: oldUser.id,
                  ModifiedBy: deleter.UserGuid,
                  ModifiedDate: new Date().toISOString()
                }
              }
            ]
          });

          return getResponse(
            {
              userGuid: userToUpdate.UserGuid,
              companyGuid: company.CompanyGuid,
              companyName: company.CompanyName,
              userName: userToUpdate.FirstName,
              mobile: userToUpdate.MobileNumber || "",
              email: userToUpdate.EmailId,
              opsUserId: userToUpdate?.OPSUserId,
              setPasswordToken: userToUpdate.SetPasswordToken
            },
            200
          );
        }
      }

      default:
        return getResponse(null, 400, "Invalid operation", null, true);
    }
  } catch (err: any) {
    return getResponse(
      null,
      500,
      "Internal server error 451" + err,
      err?.message || err,
      true
    );
  }
}

export const CreateOPsUser = async (createUserData: {
  data: opsUserRequest[];
  process: string;
}) => {
  const getResponse = (
    payload: any,
    code: number,
    message: any,
    error: any = null,
    isError = false
  ) => {
    return { data: payload, code, message, error, isError };
  };
  const sdk = await getSdkInstance();
  try {
    if (
      createUserData?.data?.filter(
        (items) =>
          items?.companyGuid == null ||
          items?.companyGuid == undefined ||
          items?.companyGuid == ""
      )?.length > 0
    ) {
      return getResponse(
        null,
        1,
        { organization: "companyGuid should not be empty" },
        null,
        true
      );
    }
    if (
      createUserData?.data?.filter(
        (items) =>
          items?.email == null ||
          items?.email == undefined ||
          items?.email == ""
      )?.length > 0
    ) {
      return getResponse(
        null,
        2,
        { email: "email should not be empty" },
        null,
        true
      );
    }
    if (
      createUserData?.data?.filter(
        (items) =>
          items?.userGuid == null ||
          items?.userGuid == undefined ||
          items?.userGuid == ""
      )?.length > 0
    ) {
      return getResponse(
        null,
        3,
        { userGuid: "userGuid should not be empty" },
        null,
        true
      );
    }
    if (
      createUserData?.data?.filter(
        (items) =>
          items?.userRole == null ||
          items?.userRole == undefined ||
          items?.userRole == ""
      )?.length > 0
    ) {
      return getResponse(
        null,
        4,
        { userRole: "userRole should not be empty" },
        null,
        true
      );
    }
    const uniqueUserRoles = createUserData?.data
      ?.map((items) => String(items.userRole).toUpperCase())
      .filter(
        (item, index, self) => index === self.findIndex((t) => t === item)
      );
    const roleDetails = await sdk.GetRoleDetails({
      roleName: uniqueUserRoles as string[]
    });
    // Check if company exists
    const { Tbl_Companies } = await sdk.GetCompanyDetailsByDynamicColumns({
      where: {
        _or: createUserData?.data?.map((items) => {
          return {
            OPSCompanyId: { _eq: items?.companyGuid }
          };
        })
      }
    });
    const company = Tbl_Companies?.[0];
    if (!company) {
      return getResponse(
        null,
        5,
        { organization: "CompanyId does not exist" },
        null,
        true
      );
    }

    const permissiondetails: Tbl_Permissions_Bool_Exp[] =
      roleDetails?.Tbl_Roles?.map((items) => {
        return {
          RoleGuid: { _eq: items?.RoleGuid },
          Tbl_Page: {
            PageKey: {
              _in:
                items?.RoleName == "LOCATIONEXECUTIVE"
                  ? [
                    "dashboard",
                    "MonthlyActivityData",
                    "GHGActivity",
                    "Measure",
                    "corporatedashboardops",
                    "Analyse"
                  ]
                  : [
                    "dashboard",
                    "MonthlyActivityData",
                    "GHGActivity",
                    "Measure",
                    "corporatedashboardops",
                    "Analyse",
                    "EnterpriseSetup",
                    "Goal Settings"
                  ]
            }
          },
          IsActive: { _eq: true }
        };
      });
    const permissions = await sdk.GetPermissionsDetails({
      where: {
        _or: permissiondetails
      }
    });

    if (permissions.Tbl_Permissions.length === 0) {
      return getResponse(
        null,
        7,
        { permission: "No permissions found" },
        null,
        true
      );
    }

    const createdByUser = await sdk.GetUserDetailsByDynamicColumns({
      where: {
        _or: createUserData?.data?.map((items) => {
          return {
            OPSUserId: { _eq: items?.CreatedBy }
          };
        })
      }
    });
    const statusData = await sdk.GetUserStatusMasterByName({
      status: "Registered"
    });
    switch (createUserData?.process) {
      case "INSERT": {
        try {
          // Check if email already exists
          const { Tbl_Users: emailUsers } =
            await sdk.GetUserDetailsByDynamicColumns({
              where: {
                _or: createUserData?.data?.map((items) => {
                  return {
                    EmailId: { _eq: items?.email }
                  };
                })
              }
            });
          if (emailUsers?.length > 0) {
            return getResponse(
              null,
              6,
              { email: "Email already exists" },
              null,
              false
            );
          }
          // Check if mobile number exists if provided
          const { Tbl_Users: mobileUsers } =
            await sdk.GetUserDetailsByDynamicColumns({
              where: {
                _or: createUserData?.data
                  .filter((items) => !!items?.mobile)
                  ?.map((items) => {
                    return {
                      MobileNumber: { _eq: items?.mobile }
                    };
                  })
              }
            });
          if (mobileUsers?.length > 0) {
            return getResponse(
              null,
              8,
              { mobile: "Mobile Number already exists" },
              null,
              false
            );
          }
          // Create user
          const createUser: Tbl_Users_Insert_Input[] =
            createUserData?.data?.map((items) => {
              const creatorUser = createdByUser?.Tbl_Users?.filter(
                (dataItems) => dataItems?.OPSUserId === items?.CreatedBy
              );
              return {
                FirstName: items?.name,
                EmailId: items?.email.toUpperCase(),
                MobileNumber: items?.mobile,
                IsActive: true,
                OPSUserId: items?.userGuid,
                CreatedBy:
                  !!creatorUser && creatorUser?.length > 0
                    ? creatorUser[0].UserGuid
                    : "",
                ModifiedBy:
                  !!creatorUser && creatorUser?.length > 0
                    ? creatorUser[0].UserGuid
                    : "",
                CompanyName: company.CompanyName,
                CreatedDate: new Date().toISOString(),
                SetPasswordToken: items?.userGuid
                  ?.toString()
                  ?.replaceAll("-", "")
              };
            });
          const userDetails = await sdk.createUser({
            object: createUser
          });
          // Create user-company mapping
          if (
            !!userDetails.insert_Tbl_Users &&
            userDetails.insert_Tbl_Users?.returning?.length > 0
          ) {
            const userCompanyMapping: Tbl_UserCompanyMapping_Insert_Input[] =
              userDetails?.insert_Tbl_Users?.returning?.map((items) => {
                return {
                  UserGuid: items?.UserGuid,
                  CompanyGuid: company.CompanyGuid,
                  IsActive: true,
                  CreatedBy: items?.CreatedBy,
                  CreatedDate: new Date().toISOString()
                };
              });
            await sdk.createUserCompanyMapping({
              object: userCompanyMapping
            });
            // Create user-role mapping
            const userRoleMapping: Tbl_UserRoleMapping_Insert_Input[] =
              userDetails?.insert_Tbl_Users?.returning?.map((items) => {
                const requestuserDetails = createUserData?.data?.filter(
                  (item) => item?.userGuid === items?.OPSUserId
                );
                const userRole = roleDetails?.Tbl_Roles?.filter(
                  (dataItems) =>
                    String(dataItems?.RoleName).toUpperCase() ===
                    String(requestuserDetails[0]?.userRole).toUpperCase()
                );
                return {
                  UserGuid: items?.UserGuid,
                  RoleGuid:
                    !!userRole && userRole?.length > 0
                      ? userRole[0]?.RoleGuid
                      : "",
                  StatusGuid:
                    !!statusData?.Tbl_UserStatusMaster &&
                      statusData?.Tbl_UserStatusMaster.length > 0
                      ? statusData?.Tbl_UserStatusMaster[0]?.StatusGuid
                      : "",
                  CreatedBy: items.CreatedBy,
                  CreatedDate: new Date().toISOString()
                };
              });

            await sdk.createUserRoleMapping({
              object: userRoleMapping
            });
          }
          // Prepare permissions to insert
          const userPermissionInsertion: Tbl_UserPermissions_Insert_Input[] =
            [];
          permissions.Tbl_Permissions.forEach((permission) => {
            const currentRoleData = createUserData?.data?.filter(
              (items) =>
                String(items?.userRole).toLowerCase() ===
                String(permission?.Tbl_Role?.RoleName).toLowerCase()
            );
            currentRoleData.forEach((roleItem) => {
              const currentUserDetails =
                userDetails?.insert_Tbl_Users?.returning?.filter(
                  (dataItems) => dataItems?.OPSUserId == roleItem?.userGuid
                );
              userPermissionInsertion.push({
                UserGuid:
                  !!currentUserDetails && currentUserDetails.length > 0
                    ? currentUserDetails[0]?.UserGuid
                    : "",
                PermissionGuid: permission?.PermissionGuid,
                Rights: "W" // Default to Write access
              });
            });
          });
          // Upsert user permissions
          await sdk.upsertUserPermissions({
            userguid: userDetails?.insert_Tbl_Users?.returning?.map(
              (items) => items?.UserGuid
            ),
            input: userPermissionInsertion
          });
          return getResponse(
            userDetails?.insert_Tbl_Users?.returning?.map((items) => {
              return {
                userGuid: items?.UserGuid,
                companyGuid: company.CompanyGuid,
                companyName: company.CompanyName,
                userName: items?.FirstName,
                mobile: items?.MobileNumber || "",
                email: items?.EmailId.toUpperCase(),
                setPasswordToken: items?.SetPasswordToken || null,
                opsUserId: items?.OPSUserId
              };
            }),
            200,
            { user: "User created successfully" },
            "",
            false
          );
        } catch (error) {
          console.error("Error in INSERT operation:", error);
          return getResponse(
            null,
            500,
            "Internal server error 172" + error,
            error,
            true
          );
        }
      }

      case "UPDATE": {
        // Check if email already exists
        const tblUserDetails = await sdk.GetUserDetailsByDynamicColumns({
          where: {
            _or: createUserData?.data?.map((items) => {
              return {
                OPSUserId: { _eq: items?.userGuid }
              };
            })
          }
        });

        if (
          !!tblUserDetails?.Tbl_Users &&
          tblUserDetails?.Tbl_Users.length > 0
        ) {
          // Update existing user
          const object: Tbl_Users_Updates[] = tblUserDetails?.Tbl_Users?.map(
            (items) => {
              const opsData = createUserData?.data?.find(
                (opsItem) => opsItem.userGuid === items?.OPSUserId
              );
              const creatorUser = createdByUser?.Tbl_Users?.filter(
                (dataItems) => dataItems?.OPSUserId === opsData?.CreatedBy
              );
              return {
                where: {
                  UserGuid: {
                    _eq: items?.UserGuid
                  }
                },
                _set: {
                  FirstName: opsData?.name,
                  MobileNumber: opsData?.mobile,
                  ModifiedBy:
                    !!creatorUser && creatorUser?.length > 0
                      ? creatorUser[0].UserGuid
                      : "",
                  ModifiedDate: new Date().toISOString()
                }
              };
            }
          );

          const updateData = await sdk.updateUser({
            input: object
          }); // Create user-role mapping
          const userRoleMappingInsertion =
            updateData?.update_Tbl_Users_many?.map((items) => {
              const requestuserDetails = createUserData?.data?.filter(
                (item) => item?.userGuid === items?.returning[0]?.OPSUserId
              );
              const creatorUser = createdByUser?.Tbl_Users?.filter(
                (dataItems) =>
                  dataItems?.OPSUserId === requestuserDetails[0]?.CreatedBy
              );
              const userRole = roleDetails?.Tbl_Roles?.filter(
                (dataItems) =>
                  String(dataItems?.RoleName).toUpperCase() ===
                  String(requestuserDetails[0]?.userRole).toUpperCase()
              );
              return {
                UserGuid: items?.returning[0]?.UserGuid,
                RoleGuid:
                  !!userRole && userRole?.length > 0
                    ? userRole[0]?.RoleGuid
                    : "",
                StatusGuid:
                  !!statusData?.Tbl_UserStatusMaster &&
                    statusData?.Tbl_UserStatusMaster.length > 0
                    ? statusData?.Tbl_UserStatusMaster[0]?.StatusGuid
                    : "",
                CreatedBy:
                  !!creatorUser && creatorUser?.length > 0
                    ? creatorUser[0].UserGuid
                    : "",
                ModifiedBy:
                  !!creatorUser && creatorUser?.length > 0
                    ? creatorUser[0].UserGuid
                    : "",
                CreatedDate: new Date().toISOString()
              };
            }) as Tbl_UserRoleMapping_Insert_Input[];

          await sdk.upsertUserRoleMapping({
            userguid: userRoleMappingInsertion.map((item) => item.UserGuid),
            object: userRoleMappingInsertion
          });
          // Prepare permissions to insert
          const userPermissionInsertion: Tbl_UserPermissions_Insert_Input[] =
            [];
          permissions.Tbl_Permissions.forEach((permission) => {
            const currentRoleData = createUserData?.data?.filter(
              (items) =>
                String(items?.userRole).toLowerCase() ===
                String(permission?.Tbl_Role?.RoleName).toLowerCase()
            );
            currentRoleData.forEach((roleItem) => {
              const currentUserDetails =
                updateData?.update_Tbl_Users_many?.filter(
                  (dataItems) =>
                    dataItems?.returning[0]?.OPSUserId == roleItem?.userGuid
                );
              userPermissionInsertion.push({
                UserGuid:
                  !!currentUserDetails && currentUserDetails.length > 0
                    ? currentUserDetails[0]?.returning[0]?.UserGuid
                    : "",
                PermissionGuid: permission?.PermissionGuid,
                Rights: "W" // Default to Write access
              });
            });
          });

          // Upsert user permissions
          await sdk.upsertUserPermissions({
            userguid: updateData?.update_Tbl_Users_many?.map(
              (items) => items?.returning[0]?.UserGuid
            ),
            input: userPermissionInsertion
          });
          return getResponse(
            updateData?.update_Tbl_Users_many?.map((items) => {
              return {
                userGuid: items?.returning[0]?.UserGuid,
                userName: items?.returning[0]?.FirstName,
                email: items?.returning[0]?.EmailId,
                mobile: items?.returning[0]?.MobileNumber || "",
                opsUserId: items?.returning[0]?.OPSUserId,
                setPasswordToken: items?.returning[0]?.SetPasswordToken
              };
            }),
            200,
            { user: "User updated successfully" },
            "",
            false
          );
        } else {
          return getResponse(
            null,
            2,
            { user: "No matching user found to update" },
            null,
            true
          );
        }
      }

      default:
        return getResponse(null, 400, "Invalid operation", null, true);
    }
  } catch (err) {
    return getResponse(null, 500, "Internal server error 451" + err, err, true);
  }
};
