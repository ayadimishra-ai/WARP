import { getSdkInstance } from "@/graphql/server/sdk";
import { ChangePasswordParams } from "@/types/interface.types";
import { passwordEncrypt } from "@/util/passwordEncrypt";

export async function changePasswordService({
  UserGuid,
  Password
}: ChangePasswordParams) {
  try {
    const encryptedPasword = passwordEncrypt(Password);
    const sdk = await getSdkInstance();

    const userData = await sdk.GetUserByGuid({ userGuid: UserGuid });

    const result = userData.Tbl_Users[0];

    const roleData = await sdk.GetUserRoleMappingByUserGuid({
      userGuid: UserGuid
    });

    const userRole = roleData.Tbl_UserRoleMapping[0]?.Tbl_Role?.RoleName;

    if (result != null) {
      let isExistPassword = false;

      const passwordData = await sdk.GetPasswordManageMasterByEmail({
        email: result.EmailId
      });

      const TblPasswordManageMaster = passwordData.Tbl_PasswordManageMaster;

      if (TblPasswordManageMaster.length > 0) {
        const startDate = new Date();
        let endDate = new Date();
        const lastThreePasswords = 3;

        for (let i = 0; i < TblPasswordManageMaster.length; i++) {
          if (TblPasswordManageMaster[i].Password === encryptedPasword) {
            isExistPassword = true;
            if (TblPasswordManageMaster[i].PasswordCreateDate) {
              endDate = new Date(TblPasswordManageMaster[i].PasswordCreateDate);
            }
          }

          if (lastThreePasswords - 1 === i) {
            break;
          }
        }

        if (isExistPassword) {
          const differenceInDays = Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          // const differenceInHours = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

          return {
            status200OK: 400,
            saveresult:
              "You cannot set same password as used in last three setting, Please try another password."
          };
        } else {
          // Update user password

          await sdk.UpdateUserPassword({
            userGuid: UserGuid,
            password: encryptedPasword
          });

          // Create new password history entry
          await sdk.InsertPasswordManageMaster({
            object: {
              ChangePasswordGuid: crypto.randomUUID(),
              EmailId: result.EmailId,
              Password: encryptedPasword,
              PasswordCreateDate: new Date().toISOString()
            }
          });

          return { status200OK: 200, saveresult: "success" };
        }
      } else {
        if (
          TblPasswordManageMaster.length == 0 &&
          (userRole === "SUPPLIERSUPPORTPERSON" ||
            userRole === "SUPPLIERRELATIONSHIPMANAGER")
        ) {
          const userPwd = result.Password;
          if (userPwd === encryptedPasword) {
            // Create new password history entry with user's creation date
            await sdk.InsertPasswordManageMaster({
              object: {
                ChangePasswordGuid: crypto.randomUUID(),
                EmailId: result.EmailId,
                Password: encryptedPasword,
                PasswordCreateDate: result.CreatedDate
              }
            });

            return {
              status200OK: 400,
              saveresult:
                "You cannot set same password as used in last three setting, Please try another password."
            };
          }
        } else {
          // Update user password

          await sdk.UpdateUserPassword({
            userGuid: UserGuid,
            password: encryptedPasword
          });

          // Create new password history entry
          await sdk.InsertPasswordManageMaster({
            object: {
              ChangePasswordGuid: crypto.randomUUID(),
              EmailId: result.EmailId,
              Password: encryptedPasword,
              PasswordCreateDate: new Date().toISOString()
            }
          });

          return { status200OK: 200, saveresult: "success" };
        }
      }
    }
  } catch (error) {
    console.error("Change password error:", error);
    return {
      status200OK: 500,
      saveresult: "An error occurred while changing the password."
    };
  }
}
