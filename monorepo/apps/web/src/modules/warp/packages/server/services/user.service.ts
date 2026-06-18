import { encryptionDecryption } from "@/modules/warp/packages/client/hooks/encryption-decryption";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  CreateUserMutationVariables,
  UpdateUserDetailByIdMutationVariables,
} from "@/modules/warp/packages/graphql/generated/types";
import { userSchema } from "@/modules/warp/packages/shared/validation/user.validation";
const { choosemethod } = encryptionDecryption();

type userCreateType = (body: object) => Promise<any>;
type updateUser = (body: object) => Promise<any>;
type deleteUser = (id: any) => Promise<any>;
type UpdateResetPasswordFlag = (id: any) => Promise<any>;

export const createUser: userCreateType = async (body: any) => {
  // User Details yup Validation
  const result = await userSchema.validate(body);
  body[0].email = await choosemethod(body[0].email, "encrypt");
  if (!result || result === undefined) return;

  // Need to check Duplidate data
  const UserList = result.map((data) => data.email);

  const duplicateUserList = result
    .map((item, index) => {
      if (UserList.indexOf(item.email) !== index) return item;
      return null;
    })
    .filter((item) => !!item);

  if (!duplicateUserList || duplicateUserList.length > 0) {
    throw {
      message: "Some User are duplicate.",
      stack: { data: duplicateUserList },
    };
  }

  // Need to check existing data in db
  let userEmailList: string[] = result.map((index) => index.email);

  const userDetail = await sdk.getUserDetailByEmail({
    newEmail: userEmailList,
  });

  if (userDetail.User.length > 0) {
    throw {
      message: "User Details already exist.",
      stack: { data: userDetail },
    };
  }

  // Insert Record in db
  const userFinalArrayList: CreateUserMutationVariables = {
    input: [],
  };

  userFinalArrayList.input = result.map((response: any) => {
    let userData = {
      ...response,
      UserRoles: {
        data: {
          roleName: response.role,
        },
      },
    };
    delete userData.role;
    return userData;
  });

  const responseData = await sdk.createUser(userFinalArrayList);

  if (!responseData) {
    throw new Error("Failed to create User.");
  } else {
    const compDetails = await sdk.getCompanyDetailById({
      id: body[0].companyId,
    });

    let email = compDetails.Company[0]?.primaryContact.email
      ? compDetails.Company[0]?.primaryContact.email
      : "";
    let name = body[0].name ? body[0].name : "";
    let phone = body[0].phone ? body[0].phone : "";
    let companysize = compDetails.Company[0]?.primaryContact.companysize
      ? compDetails.Company[0]?.primaryContact.companysize
      : "";
    let cpanelId = body[0].companyId ? body[0].companyId : "";

    const primaryContactData = {
      name: `${name}`.trim(),
      email: email,
      phone: phone,
      companysize: companysize,
    };

    const res = await sdk.UpdateCompanyPrimaryContact({
      companyId: cpanelId,
      primaryContact: primaryContactData,
    });
  }

  // Return Response in api
  const newUser = responseData.insert_User?.returning.map((response) => {
    delete response.__typename;
    return response;
  });

  return newUser;
};

export const updateUser: updateUser = async (body) => {
  // User Details yup validation
  const result = await userSchema.validate(body);

  if (!result || result === undefined) return;

  // Need to check Id Duplidate data
  const userIdList = result.map((index: any) => index.id);
  const userEmailList = result.map((index: any) => index.email);

  const duplicateUserIdData = result
    .map((item, index) => {
      if (userIdList.indexOf(item.id) !== index) return item;
      if (userEmailList.indexOf(item.email) !== index) return item;
      return null;
    })
    .filter((item) => !!item);

  if (!duplicateUserIdData || duplicateUserIdData.length > 0) {
    throw {
      message: "Some User details are duplicate.",
      stack: { data: duplicateUserIdData },
    };
  }

  // Need to check existing data in db
  let UserBulkId: string[] = result.map((index: any) => index.id);

  const userDetail = await sdk.getUserDetailByBulkId({
    id: UserBulkId,
  });

  if (UserBulkId.length !== userDetail.User.length) {
    throw new Error("Some user details not exist.");
  }

  // Insert Record in db
  const userFinalArrayList: UpdateUserDetailByIdMutationVariables = {
    input: [],
  };

  userFinalArrayList.input = result.map((response: any) => {
    let data = {
      where: {
        id: {
          _eq: response.id,
        },
      },
      _set: {
        ...response,
      },
    };
    delete data._set.id;
    return { ...data };
  });

  const responseData = await sdk.updateUserDetailById(userFinalArrayList);

  if (!responseData) {
    throw new Error("Failed to Update User.");
  }

  // Return Response in api
  const updatedUser = responseData.update_User_many?.map((response) => {
    delete response?.__typename;
    return response;
  });

  return updatedUser;
};

export const deleteUser: deleteUser = async (id) => {
  const { update_User } = await sdk.deleteUserDetailById({
    id: id,
  });

  if (!update_User) {
    throw new Error("Failed to Delete User.");
  }

  // Return Response in api
  const deletedUser = update_User?.returning.flatMap((response) => {
    delete response.__typename;
    return response;
  });

  return deletedUser;
};

export const UpdateResetPassword: UpdateResetPasswordFlag = async (body) => {
  // Check User Exist or not
  const IsUserExist = await sdk.getUserDetailById({
    id: body.id,
  });

  if (!IsUserExist) {
    throw {
      message: "Some User details not exist.",
      stack: { data: body },
    };
  }

  // Insert Record in db
  const responseData = await sdk.updateUserResetPasswordFlag({
    id: body.id,
  });

  if (!responseData) {
    throw new Error("Failed to Update User.");
  }

  // Return Response in api
  // const updatedUser = responseData.update_User?.map((response: any) => {
  //   return response;
  // });

  return responseData;
};
