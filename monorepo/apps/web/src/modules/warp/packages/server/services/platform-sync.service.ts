import { encryptionDecryption } from "@/modules/warp/packages/client/hooks/encryption-decryption";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  BulkInsertCompaniesWithUsersMutationVariables,
  BulkUpdateCompaniesWithUsersMutationVariables,
} from "@/modules/warp/packages/graphql/generated/types";
import { CustomError } from "@/modules/warp/packages/shared/utils/custom-error.util";
import {
  BulkInsertCompanySchema,
  BulkInsertUsersSchema,
} from "@/modules/warp/packages/shared/validation/bulk-insert-company-with-users.schema";
const { choosemethod } = encryptionDecryption();
let companyEncryptedArray: any = [];
let userEncryptedArray: any = [];
const encryptdecrypt = async (data: any, method: string, type: string) => {
  companyEncryptedArray = [];
  userEncryptedArray = [];
  switch (type.toLowerCase()) {
    case "user":
      companyEncryptedArray = await choosemethod(data, method);
      break;
    case "company":
      userEncryptedArray = await choosemethod(data, method);
      break;
  }
};
export const bulkInsertCompanyWithUsers = async (body: any) => {
  const inputData = body;
  const companiesInput = inputData.map((data: any) => data.company);

  const usersInput = inputData.flatMap((data: any) =>
    data.users.map((_user: any) => ({ ..._user, companyId: data.company.id }))
  );
  // Yup validation
  const validatedCompanyData = await BulkInsertCompanySchema.validate(
    companiesInput
  );
  const validatedUserData = await BulkInsertUsersSchema.validate(usersInput);

  for (let i = 0; i < companiesInput.length; i++) {
    companiesInput[i].primaryContact.email = await choosemethod(
      companiesInput[i].primaryContact.email,
      "encrypt"
    );
  }
  for (let i = 0; i < usersInput.length; i++) {
    usersInput[i].email = await choosemethod(usersInput[i].email, "encrypt");
  }

  // checking of duplicate data for company and users
  const companyNameList = validatedCompanyData.map((data) => data.name);
  const userEmailList = validatedUserData.map((data) => data.email);

  const duplicateCompanyData = validatedCompanyData
    .map((item, index) => {
      if (companyNameList.indexOf(item.name) !== index) return item;
      return null;
    })
    .filter((item) => !!item);

  if (!duplicateCompanyData || duplicateCompanyData.length > 0) {
    throw CustomError({
      data: null,
      code: 409,
      message: "Some company are duplicate",
    });
  }

  const duplicateUserEmail = validatedUserData
    .map((item, index) => {
      if (userEmailList.indexOf(item.email) !== index) return item;
      return null;
    })
    .filter((item) => !!item);

  if (!duplicateUserEmail || duplicateUserEmail.length > 0) {
    throw CustomError({
      data: null,
      code: 409,
      message: "Some user are duplicate",
    });
  }

  // DB Validation
  const companiesIdArray: string[] = validatedCompanyData.flatMap(
    (companies) => companies.id
  );
  const userIdArray: string[] = validatedUserData.flatMap((user) => user.id);

  const existingCompanyAndUsers =
    await sdk.getExistingCompaniesOrUsersRecordById({
      companyId: companiesIdArray,
      usersId: userIdArray,
    });

  const companyId = existingCompanyAndUsers.Company.map((comRec) => comRec.id);
  const UserId = existingCompanyAndUsers.User.map((userRec) => userRec.id);

  // Filter Update and Insert Record for Company
  let CompanyDataForUpdate: any = [];
  let CompanyDataForInsert: any = [];
  validatedCompanyData
    .map((item, index) => {
      if (companyId.indexOf(item.id) >= 0) {
        CompanyDataForUpdate.push(item);
        return null;
      } else {
        CompanyDataForInsert.push(item);
        return null;
      }
    })
    .filter((item) => item);

  // Filter Update and Insert Record for User
  let UserDataForUpdate: any = [];
  let UserDataForInsert: any = [];
  validatedUserData
    .map((item, index) => {
      if (UserId.indexOf(item.id) >= 0) {
        UserDataForUpdate.push(item);
        return null;
      } else {
        UserDataForInsert.push(item);
        return null;
      }
    })
    .filter((item) => item);

  let ParentCompanyDataForUpdate: any = [];
  let ParentCompanyDataForInsert: any = [];

  validatedCompanyData
    .map((item, index) => {
      if (companyId.indexOf(item.id) >= 0) {
        ParentCompanyDataForUpdate.push(item);
        return null;
      } else {
        ParentCompanyDataForInsert.push(item);
        return null;
      }
    })
    .filter((item) => item);

  // Set Array structure for Insert
  const finalArrayDataForInsert: BulkInsertCompaniesWithUsersMutationVariables =
    {
      companyInput: [],
      userInput: [],
      parentCompanyInput: [],
    };
  finalArrayDataForInsert.companyInput = CompanyDataForInsert.map(
    (response: any) => {
      return response;
    }
  );

  finalArrayDataForInsert.userInput = UserDataForInsert.map((response: any) => {
    const updateData = {
      ...response,
      UserRoles: {
        data: {
          roleName: response.role,
        },
      },
    };
    delete updateData.role;
    return updateData;
  });
  finalArrayDataForInsert.parentCompanyInput = ParentCompanyDataForInsert.map(
    (response: any) => {
      return response;
    }
  );

  // Set Array structure for Update
  const finalArrayDataForUpdate: BulkUpdateCompaniesWithUsersMutationVariables =
    {
      companyUpdate: [],
      userUpdate: [],
      userroleUpdate: [],
      parentCompanyMapping: [],
    };

  finalArrayDataForUpdate.companyUpdate = CompanyDataForUpdate.map(
    (response: any) => {
      let companyData = {
        where: {
          id: {
            _eq: response.id,
          },
        },
        _set: {
          ...response,
        },
      };
      delete companyData._set.id;
      return companyData;
    }
  );

  finalArrayDataForUpdate.userUpdate = UserDataForUpdate.map(
    (response: any) => {
      const userData = {
        where: {
          id: {
            _eq: response.id,
          },
        },
        _set: {
          ...response,
        },
      };
      delete userData._set.id;
      delete userData._set.role;
      return userData;
    }
  );

  finalArrayDataForUpdate.userroleUpdate = UserDataForUpdate.map(
    (response: any) => {
      const userRoleData = {
        where: {
          userId: {
            _eq: response.id,
          },
        },
        _set: {
          roleName: response.role,
        },
      };
      return userRoleData;
    }
  );

  finalArrayDataForUpdate.parentCompanyMapping = ParentCompanyDataForUpdate.map(
    (response: any) => {
      let companyData = {
        where: {
          id: {
            _eq: response.id,
          },
        },
        _set: {
          ...response,
        },
      };
      delete companyData._set.id;
      return companyData;
    }
  );

  // // Insert Record in db
  const insertResponseData = await sdk.BulkInsertCompaniesWithUsers(
    finalArrayDataForInsert
  );

  if (!insertResponseData) {
    throw CustomError({
      data: null,
      code: 400,
      message: "Failed to Insert Record.",
    });
  }

  // // Update Record in db
  const updateResponseData = await sdk.BulkUpdateCompaniesWithUsers(
    finalArrayDataForUpdate
  );

  if (!updateResponseData) {
    throw CustomError({
      data: null,
      code: 400,
      message: "Failed to Update Record.",
    });
  }

  // Return api response
  const insertCompany = insertResponseData.insert_Company?.returning.map(
    (item) => {
      let user = insertResponseData?.insert_User?.returning.map((_user) => {
        if (item?.id === _user?.companyId) {
          return _user;
        } else {
          return null;
        }
      });
      let company = {
        Company: item,
        Users: user,
      };
      return company;
    }
  );

  const userAllData = Array.isArray(updateResponseData?.update_User_many)
    ? updateResponseData?.update_User_many?.map((item) => {
        return item?.returning[0];
      })
    : [];

  const updateCompany = Array.isArray(updateResponseData?.update_Company_many)
    ? updateResponseData.update_Company_many?.flatMap((item) => {
        let user = userAllData?.map((_user: any) => {
          if (item?.returning[0]?.id === _user?.companyId) {
            return _user;
          }
        });
        let updateCompanyOrUserData = {
          Company: item?.returning[0],
          Users: user?.filter((object: any) => {
            return object != null;
          }),
        };
        return { ...updateCompanyOrUserData };
      })
    : null;

  const data: any = [];
  if (insertCompany) data.push(...insertCompany);
  if (updateCompany) data.push(...updateCompany);

  return data;
};
