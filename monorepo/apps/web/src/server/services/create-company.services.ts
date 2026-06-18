import { getSdkInstance } from "@/graphql/server/sdk";
import { v4 as uuidv4 } from "uuid";

export const createCompany = async (body: any) => {
  const { op, data } = body;
  const newData = data?.new;
  const oldData = data?.old;

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
        if (!newData.id) {
          return getResponse(null, 11, "id should not be empty", null, true);
        }
        if (!newData.name) {
          return getResponse(
            null,
            7,
            "Company Name should not be empty",
            null,
            true
          );
        }
        if (!newData.primaryContact) {
          return getResponse(
            null,
            8,
            "primaryContact should not be empty",
            null,
            true
          );
        }
        if (!newData.primaryContact.email) {
          return getResponse(null, 9, "email should not be empty", null, true);
        }
        // if (!newData.primaryContact.name) {
        //     return getResponse(null, 13, "primaryContact - name should not be empty", null, true);
        // }
        if (!newData.created_by) {
          return getResponse(
            null,
            12,
            "created_by should not be empty",
            null,
            true
          );
        }

        try {
          // Check if company name already exists
          const existingCompany = await sdk.GetCompanyByName({
            companyName: newData.name
          });
          if (existingCompany?.Tbl_Companies?.length > 0) {
            return getResponse(
              null,
              1,
              "Company Name already exists",
              null,
              true
            );
          }

          // Check if email already exists
          const existingUser = await sdk.GetUserByEmail({
            email: newData.primaryContact.email.toUpperCase()
          });
          if (existingUser?.Tbl_Users?.length > 0) {
            return getResponse(null, 3, "Email already exists", null, true);
          }

          // Check if mobile number exists if provided
          if (newData.primaryContact.phone) {
            const existingMobile = await sdk.GetUserByMobile({
              mobile: newData.primaryContact.phone
            });
            if (existingMobile?.Tbl_Users?.length > 0) {
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
            cpanelUserId: newData.created_by
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

          // Get country info (default to India if not provided)
          const countryCode = newData.country || "IN";
          const { Tbl_CountryMaster: countries } =
            await sdk.GetCountryMasterByCountryCode({
              countryCode
            });
          const country = countries?.[0];
          if (!country) {
            return getResponse(null, 500, "Invalid country code", null, true);
          }

          // Generate GUIDs
          const companyGuid = uuidv4();
          const userGuid = uuidv4();
          const timestamp = new Date().toISOString();
          const CompanyRoleMappingGuid = uuidv4();

          // Get default role (BUYER)
          const { Tbl_Roles } = await sdk.GetRoleByName({
            roleName: "SUPPLIER"
          });
          const defaultRoleGuid = Tbl_Roles?.[0]?.RoleGuid;
          if (!defaultRoleGuid) {
            return getResponse(null, 500, "Default role not found", null, true);
          }

          // Get company status (CREATED)
          const { Tbl_CompanyStatusMaster: companyStatus } =
            await sdk.GetCompanyStatusMasterByName({
              status: "Created"
            });
          const statusGuid = companyStatus?.[0]?.CompanyStatusGuid || uuidv4();

          // Create company
          await sdk.InsertCompany({
            companyInput: {
              CompanyGuid: companyGuid,
              CompanyName: newData.name,
              CountryGuid: country.CountryGuid,
              IsActive: true,
              CPanelCompanyId: newData.id,
              IsManufacturing: newData.IsManufacturing || false,
              CPanelCompanyIndustry: newData.metadata?.industry || null,
              CreatedBy: creator.UserGuid,
              CreatedDate: timestamp
            }
          });

          // Create company role mapping
          await sdk.createCompanyRoleMapping({
            object: {
              CompanyRoleMappingGuid: CompanyRoleMappingGuid,
              CompanyGuid: companyGuid,
              RoleGuid: defaultRoleGuid,
              StatusGuid: statusGuid,
              CreatedBy: creator.UserGuid,
              CreatedDate: timestamp
            }
          });

          // Create user
          await sdk.createUser({
            object: {
              UserGuid: userGuid,
              FirstName: newData.primaryContact.name,
              EmailId: newData.primaryContact.email.toUpperCase(),
              MobileNumber: newData.primaryContact.phone || null,
              CountryGuid: country.CountryGuid,
              Password: "",
              IsActive: true,
              CreatedBy: creator.UserGuid,
              CreatedDate: timestamp
            }
          });

          // Create user-company mapping
          await sdk.createUserCompanyMapping({
            object: {
              UserGuid: userGuid,
              CompanyGuid: companyGuid,
              IsActive: true,
              CreatedBy: creator.UserGuid,
              CreatedDate: timestamp
            }
          });

          // Get user status (CREATED)
          const { Tbl_UserStatusMaster: userStatuses } =
            await sdk.GetUserStatusMasterByName({
              status: "Created"
            });
          const userStatusGuid = userStatuses?.[0]?.StatusGuid || uuidv4();

          // Create user role mapping
          await sdk.createUserRoleMapping({
            object: {
              UserGuid: userGuid,
              RoleGuid: defaultRoleGuid,
              StatusGuid: userStatusGuid,
              CreatedBy: creator.UserGuid,
              CreatedDate: timestamp
            }
          });

          // Create company business type (BUYER)
          const { Tbl_BusinessTypeMaster: businessTypes } =
            await sdk.GetBusinessTypeByName({
              businessTypeName: "SUPPLIER"
            });
          const businessTypeGuid = businessTypes?.[0]?.BusinessTypeGuid;

          if (businessTypeGuid) {
            await sdk.createCompanyBusinessType({
              object: {
                CompanyGuid: companyGuid,
                BusinessTypeGuid: businessTypeGuid,
                CreatedBy: creator.UserGuid,
                CreatedDate: timestamp
              }
            });
          }

          return getResponse(
            {
              country: country.CountryCode,
              companyGuid,
              companyName: newData.name,
              userGuid,
              userName: newData.primaryContact.name,
              mobile: newData.primaryContact.phone || "",
              email: newData.primaryContact.email.toUpperCase()
            },
            0,
            "",
            null,
            false
          );
        } catch (error) {
          console.error("Error in company creation:", error);
          return getResponse(null, 500, "Internal server error", error, true);
        }
      }

      case "UPDATE": {
        // Validation
        if (!newData?.id) {
          return getResponse(null, 11, "id should not be empty", null, true);
        }
        if (!newData?.name) {
          return getResponse(
            null,
            7,
            "Company Name should not be empty",
            null,
            true
          );
        }
        if (!newData?.primaryContact?.email) {
          return getResponse(null, 9, "email should not be empty", null, true);
        }

        try {
          // Get updater user (fallback to created_by if updated_by not provided)
          const updatedBy = newData.updated_by || newData.created_by;
          if (!updatedBy) {
            return getResponse(
              null,
              12,
              "created_by/updated_by does not exist",
              null,
              true
            );
          }

          // Get updater user details
          const {
            Tbl_Users: [updaterUser]
          } = await sdk.GetUserByCpanelId({
            cpanelUserId: updatedBy
          });
          if (!updaterUser) {
            return getResponse(
              null,
              12,
              "created_by/updated_by user not found",
              null,
              true
            );
          }

          // Check if company exists
          const {
            Tbl_Companies: [existingCompany]
          } = await sdk.GetCompanyByCpanelId({
            cpanelCompanyId: newData.id
          });
          if (!existingCompany) {
            return getResponse(null, 5, "Company not found", null, true);
          }

          // Check for duplicate company name
          const { Tbl_Companies: duplicateCompanies } =
            await sdk.GetCompanyByName({
              companyName: newData.name
            });
          if (duplicateCompanies?.length > 0) {
            if (
              duplicateCompanies[0].CPanelCompanyId !== newData.id
            ) {
              return getResponse(
                null,
                1,
                "Company Name already exists",
                null,
                true
              );
            }
          }

          // Get country info
          const countryCode = newData.country || "IN";
          const {
            Tbl_CountryMaster: [country]
          } = await sdk.GetCountryMasterByCountryCode({
            countryCode
          });
          if (!country) {
            return getResponse(null, 500, "Invalid country code", null, true);
          }

          // Check for existing email (only if changed)
          if (
            oldData?.primaryContact?.email?.toUpperCase() !==
            newData.primaryContact.email.toUpperCase()
          ) {
            const { Tbl_Users: existingEmails } = await sdk.GetUserByEmail({
              email: newData.primaryContact.email.toUpperCase()
            });
            if (existingEmails?.length > 0) {
              return getResponse(null, 3, "Email already exists", null, true);
            }
          }

          // Check for existing mobile (if provided and changed)
          if (
            newData.primaryContact.phone &&
            oldData?.primaryContact?.phone !== newData.primaryContact.phone
          ) {
            const { Tbl_Users: existingMobiles } = await sdk.GetUserByMobile({
              mobile: newData.primaryContact.phone
            });
            if (existingMobiles?.length > 0) {
              return getResponse(
                null,
                4,
                "Mobile Number already exists",
                null,
                true
              );
            }
          }

          // Check if any changes are needed
          const companyUserMappings =
            await sdk.GetUserCompanyMappingByCompanyGuid({
              companyGuid: existingCompany.CompanyGuid
            });

          let hasChanges = false;
          const userMapping = companyUserMappings?.Tbl_UserCompanyMapping?.[0];
          if (userMapping) {
            const {
              Tbl_Users: [user]
            } = await sdk.GetUserByGuid({
              userGuid: userMapping.UserGuid
            });

            if (user) {
              const nameChanged =
                user.FirstName !== newData.primaryContact.name;
              const emailChanged =
                user.EmailId.toUpperCase() !==
                newData.primaryContact.email.toUpperCase();
              const phoneChanged =
                user.MobileNumber !== newData.primaryContact.phone;
              const companyNameChanged =
                existingCompany.CompanyName !== newData.name;
              const isActiveChanged =
                existingCompany.IsActive !== newData.isActive;
              const isManufacturingChanged =
                existingCompany.IsManufacturing !== newData.IsManufacturing;
              const industryChanged =
                existingCompany.CPanelCompanyIndustry !==
                newData.metadata?.industry;
              const countryChanged =
                existingCompany.CountryGuid !== country.CountryGuid;

              hasChanges =
                nameChanged ||
                emailChanged ||
                phoneChanged ||
                companyNameChanged ||
                isActiveChanged ||
                isManufacturingChanged ||
                industryChanged ||
                countryChanged;

              if (!hasChanges) {
                return getResponse(null, 2, "No changes found", null, true);
              }
            }
          }

          // Update company
          await sdk.updateCompany({
            input: [
              {
                where: {
                  CompanyGuid: {
                    _eq: existingCompany.CompanyGuid
                  }
                },
                _set: {
                  CompanyName: newData.name,
                  CountryGuid: country.CountryGuid,
                  IsActive: newData.isActive,
                  IsManufacturing: newData.IsManufacturing,
                  CPanelCompanyIndustry: newData.metadata?.industry,
                  ModifiedBy: updaterUser.UserGuid,
                  ModifiedDate: new Date().toISOString()
                }
              }
            ]
          });

          // Update user if exists
          let updatedUser = null;
          if (userMapping) {
            updatedUser = await sdk.updateUser({
              input: [
                {
                  where: {
                    UserGuid: {
                      _eq: userMapping.UserGuid
                    }
                  },
                  _set: {
                    FirstName: newData.primaryContact.name,
                    EmailId: newData.primaryContact.email.toUpperCase(),
                    MobileNumber: newData.primaryContact.phone,
                    CountryGuid: country.CountryGuid,
                    ModifiedBy: updaterUser.UserGuid,
                    ModifiedDate: new Date().toISOString()
                  }
                }
              ]
            });
          }

          // Update user-company mapping if needed
          if (userMapping && !userMapping.IsActive) {
            await sdk.updateUserCompanyMapping({
              input: [
                {
                  where: {
                    UserGuid: {
                      _eq: userMapping.UserGuid
                    }
                  },
                  _set: {
                    IsActive: true,
                    ModifiedBy: updaterUser.UserGuid,
                    ModifiedDate: new Date().toISOString()
                  }
                }
              ]
            });
          }
          return getResponse(
            {
              country: country.CountryCode,
              companyGuid: existingCompany.CompanyGuid,
              companyName: newData.name,
              userGuid:
                updatedUser?.update_Tbl_Users_many?.[0]?.returning?.[0]
                  ?.UserGuid,
              userName: newData.primaryContact.name,
              mobile: newData.primaryContact.phone || "",
              email: newData.primaryContact.email.toUpperCase()
            },
            0,
            "",
            null,
            false
          );
        } catch (error) {
          console.error("Error updating company:", error);
          return getResponse(null, 500, "Internal server error", error, true);
        }
      }

      case "DELETE": {
        const { id, updated_by, created_by } = oldData;
        const modifier = updated_by || created_by;

        if (!id)
          return getResponse(null, 11, "id should not be empty", null, true);

        // Get modifier user details
        const modifierUser = await sdk.GetUserByCpanelId({
          cpanelUserId: modifier
        });
        if (!modifierUser?.Tbl_Users?.length) {
          return getResponse(null, 12, "Modifier does not exist", null, true);
        }
        const modifierGuid = modifierUser.Tbl_Users[0].UserGuid;

        try {
          // Get company by CPanel ID
          const companyResult = await sdk.GetCompanyByCpanelId({
            cpanelCompanyId: id
          });
          const company = companyResult?.Tbl_Companies?.[0];

          if (!company) {
            return getResponse(null, 13, "Company not found", null, true);
          }

          // Update company's active status and modifier info
          await sdk.updateCompany({
            input: [
              {
                where: {
                  CPanelCompanyId: { _eq: id }
                },
                _set: {
                  IsActive: oldData.isActive || false,
                  ModifiedBy: modifierGuid,
                  ModifiedDate: new Date().toISOString()
                }
              }
            ]
          });

          // Get all user-company mappings for this company
          const userMappings = await sdk.GetUserCompanyMappingByCompanyGuid({
            companyGuid: company.CompanyGuid
          });

          const responseData: any = {
            companyGuid: company.CompanyGuid,
            companyName: company.CompanyName,
            userGuid: "",
            userName: "",
            mobile: "",
            email: ""
          };

          // Update all associated users' active status
          if (userMappings?.Tbl_UserCompanyMapping?.length > 0) {
            const userIds = userMappings.Tbl_UserCompanyMapping.filter(
              (mapping) => mapping?.UserGuid
            ).map((mapping) => mapping.UserGuid) as string[];

            // Get user details for the primary contact email match
            const usersResult = await Promise.all(
              userIds.map((guid) =>
                sdk
                  .GetUserByGuid({ userGuid: guid })
                  .then((res) => res.Tbl_Users?.[0])
                  .catch(() => null)
              )
            );
            const primaryContact = usersResult.find(
              (user: any) =>
                user?.EmailId?.toUpperCase() ===
                oldData.primaryContact?.email?.toUpperCase()
            );

            if (primaryContact) {
              // Update the primary contact user
              await sdk.updateUser({
                input: [
                  {
                    where: { UserGuid: { _eq: primaryContact.UserGuid } },
                    _set: {
                      IsActive: oldData.isActive || false,
                      ModifiedBy: modifierGuid,
                      ModifiedDate: new Date().toISOString()
                    }
                  }
                ]
              });

              // Update response with user details
              responseData.userGuid = primaryContact.UserGuid;
              responseData.userName = primaryContact.FirstName || "";
              responseData.mobile = primaryContact.MobileNumber || "";
              responseData.email = primaryContact.EmailId || "";
            }
          }

          return getResponse(responseData, 0, "", null, false);
        } catch (error) {
          console.error("Error in DELETE company:", error);
          return getResponse(null, 500, "Internal server error", error, true);
        }
      }

      default:
        return getResponse(null, 400, "Invalid operation type", null, true);
    }
  } catch (error: any) {
    return getResponse(
      null,
      500,
      "Internal server error",
      error?.message || error,
      true
    );
  }
};
