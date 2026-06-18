import { getSdkInstance } from "@/graphql/server/sdk";
import { passwordEncrypt } from "@/util/passwordEncrypt";
import { ResetPasswordResponse } from "@/types/interface.types";
import { setActiveUserSessionToInactive } from "@/util/passwordResetService";

export const setNewPasswordForSupplier = async (
  encryptedEmailId: string | null,
  password: string | null
): Promise<ResetPasswordResponse> => {
  // Check if required parameters are present
  if (!encryptedEmailId || !password) {
    return {
      status200OK: 400,
      saveresult: "EmailId and Password are required"
    };
  }

  try {
    // Encrypt the password
    const encryptedPassword = passwordEncrypt(password);

    if (!encryptedPassword) {
      return {
        status200OK: 500,
        saveresult: "Failed to encrypt password"
      };
    }

    const sdk = await getSdkInstance();
    // Fetch user details with roles using the encrypted email
    const userResponse = await sdk.GetUserByEmailAndRoles({
      email: encryptedEmailId.toLocaleUpperCase()
    });

    // Fetch additional user details
    const _userDetails = await sdk.GetUserByEmail({
      email: encryptedEmailId.toLocaleUpperCase()
    });

    // Check if user details were found
    if (!_userDetails?.Tbl_Users?.[0]) {
      return {
        status200OK: 404,
        saveresult: "User details not found"
      };
    }

    const userDetails = _userDetails.Tbl_Users;

    // Check if user exists
    if (!userResponse?.Tbl_Users?.[0]) {
      return {
        status200OK: 404,
        saveresult: "Details Does not exists"
      };
    }

    const user = userResponse.Tbl_Users[0];
    const userCompanyGuid = user.Tbl_UserCompanyMappings[0].CompanyGuid;
    const userRole = user.Tbl_UserRoleMappings[0].Tbl_Role.RoleName;

    // Check if user is active
    if (!user.IsActive) {
      return {
        status200OK: 403,
        saveresult:
          "You are no more operational in the business. Please contact admin for next steps"
      };
    }

    let isExistPassword = false;

    // Fetch password management details
    const passwordManageResponse = await sdk.GetPasswordManageMasterByEmail({
      email: encryptedEmailId.toLocaleUpperCase()
    });

    // Check if password management record exists
    if (passwordManageResponse?.Tbl_PasswordManageMaster?.length > 0) {
      const startDate = Date.now();
      let endDate = Date.now();
      const lastThreePasswords = 3;
      const passwordRecords = passwordManageResponse.Tbl_PasswordManageMaster;

      // Check password history for the last 3 passwords
      for (let i = 0; i < passwordRecords.length; i++) {
        if (passwordRecords[i].Password === encryptedPassword) {
          isExistPassword = true;
          if (passwordRecords[i].CreatedDate) {
            endDate = new Date(passwordRecords[i].CreatedDate).getTime();
          }
        }

        if (lastThreePasswords - 1 === i) {
          break;
        }
      }

      // Check if password exists in history
      if (isExistPassword) {
        return {
          status200OK: 400,
          saveresult:
            "You cannot set the same password as used in the last three password changes. Please try another password."
        };
      } else {
        if (
          userCompanyGuid.toLowerCase() ==
          "3c5d4558-2161-4052-b0d9-fdd70d653bed" &&
          userRole.toUpperCase() == "VENTURECAPITALIST"
        ) {
          // need to discuss in this condition.

          for (const user of userDetails) {
            user.Password = encryptedPassword;
            user.IsVerified = true;
            // await context.saveChanges();
          }

          // Create password management record
          const passwordRecord = {
            ChangePasswordGuid: crypto.randomUUID(), // Generates a new UUID
            EmailId: encryptedEmailId, // Using the encrypted email ID from the function parameters
            Password: encryptedPassword,
            PasswordCreateDate: new Date().toISOString()
          };

          // Add to password management master
          await sdk.InsertPasswordManageMaster({
            object: passwordRecord
          });

          //const permissionGuids = ["246f9e24-0f62-4679-bf79-d725f9cb3548", "ef545b92-55d6-40f0-ad99-1404fe40ec8e"];
          const permissionGuids = [
            "246f9e24-0f62-4679-bf79-d725f9cb3548",
            "fe687e2b-efb2-4eb5-a6c2-0aafa2f96003"
          ];
          // Check existing permissions
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

          // Add missing permissions
          for (const permissionGuid of missingPermissions) {
            await sdk.InsertUserPermission({
              object: {
                UserPermissionGuid: crypto.randomUUID(),
                UserGuid: user.UserGuid,
                PermissionGuid: permissionGuid,
                Rights: "W"
              }
            });
          }
        } else {
          for (const user of userDetails) {
            user.Password = encryptedPassword;
            user.IsVerified = true;
            // await context.saveChanges();
          }

          // Create password management record
          const passwordRecord = {
            ChangePasswordGuid: crypto.randomUUID(), // Generates a new UUID
            EmailId: encryptedEmailId.toLocaleUpperCase(), // Using the encrypted email ID from the function parameters
            Password: encryptedPassword,
            PasswordCreateDate: new Date().toISOString()
          };

          // Add to password management master
          await sdk.InsertPasswordManageMaster({
            object: passwordRecord
          });

          await sdk.updateUser({
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
        }

        // Call the session service but we don't need to use the result
        await setActiveUserSessionToInactive(user.UserGuid);

        return {
          status200OK: 200,
          saveresult: "Success"
        };
      }
    } else {
      if (
        passwordManageResponse?.Tbl_PasswordManageMaster.length == 0 &&
        (userRole == "SUPPLIERSUPPORTPERSON" ||
          userRole == "SUPPLIERRELATIONSHIPMANAGER")
      ) {
        if (userDetails[0].Password === encryptedPassword) {
          // Create password management record
          const passwordRecord = {
            ChangePasswordGuid: crypto.randomUUID(), // Generates a new UUID
            EmailId: encryptedEmailId, // Using the encrypted email ID from the function parameters
            Password: encryptedPassword,
            PasswordCreateDate: userDetails[0].CreatedDate
          };

          // Add to password management master
          await sdk.InsertPasswordManageMaster({
            object: passwordRecord
          });

          isExistPassword = true;

          return {
            status200OK: 400,
            saveresult:
              "You cannot set same password as used in last three setting, Please try another password."
          };
        } else {
          const passwordRecord = {
            ChangePasswordGuid: crypto.randomUUID(), // Generates a new UUID
            EmailId: encryptedEmailId.toLocaleUpperCase(), // Using the encrypted email ID from the function parameters
            Password: encryptedPassword,
            PasswordCreateDate: new Date().toISOString()
          };

          // Add to password management master
          await sdk.InsertPasswordManageMaster({
            object: passwordRecord
          });

          await sdk.UpdateUserPasswordByEmail({
            email: encryptedEmailId.toLocaleUpperCase(),
            password: encryptedPassword
          });

          await setActiveUserSessionToInactive(user.UserGuid);

          return {
            status200OK: 200,
            saveresult: "Success"
          };
        }
      } else {
        if (
          userCompanyGuid.toLowerCase() ==
          "3c5d4558-2161-4052-b0d9-fdd70d653bed" &&
          userRole.toUpperCase() == "VENTURECAPITALIST"
        ) {
          for (const user of userDetails) {
            user.Password = encryptedPassword;
            user.IsVerified = true;
            // await context.saveChanges();
          }

          // Create password management record
          const passwordRecord = {
            ChangePasswordGuid: crypto.randomUUID(), // Generates a new UUID
            EmailId: encryptedEmailId, // Using the encrypted email ID from the function parameters
            Password: encryptedPassword,
            PasswordCreateDate: new Date().toISOString()
          };

          // Add to password management master
          await sdk.InsertPasswordManageMaster({
            object: passwordRecord
          });

          //const permissionGuids = ["246f9e24-0f62-4679-bf79-d725f9cb3548", "ef545b92-55d6-40f0-ad99-1404fe40ec8e"];
          const permissionGuids = [
            "246f9e24-0f62-4679-bf79-d725f9cb3548",
            "fe687e2b-efb2-4eb5-a6c2-0aafa2f96003"
          ];

          // Check existing permissions
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

          // Add missing permissions
          for (const permissionGuid of missingPermissions) {
            await sdk.InsertUserPermission({
              object: {
                UserPermissionGuid: crypto.randomUUID(),
                UserGuid: user.UserGuid,
                PermissionGuid: permissionGuid,
                Rights: "W"
              }
            });
          }
        } else {
          const passwordRecord = {
            ChangePasswordGuid: crypto.randomUUID(), // Generates a new UUID
            EmailId: encryptedEmailId.toLocaleUpperCase(), // Using the encrypted email ID from the function parameters
            Password: encryptedPassword,
            PasswordCreateDate: new Date().toISOString()
          };

          // Add to password management master
          await sdk.InsertPasswordManageMaster({
            object: passwordRecord
          });

          await sdk.updateUser({
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
        }

        await setActiveUserSessionToInactive(user.UserGuid);

        return {
          status200OK: 200,
          saveresult: "Success"
        };
      }
    }
  } catch (error) {
    console.error("Error in setNewPasswordForSupplier service:", error);
    return {
      status200OK: 500,
      saveresult: "Internal server error"
    };
  }
};
