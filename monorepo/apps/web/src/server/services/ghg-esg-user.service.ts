import { getSdkInstance } from "@/graphql/server/sdk";

export const getUserDetails = async (encryptedEmailId: string) => {
  const sdk = await getSdkInstance();
  const result = await sdk.GetUserDetailsByEmailId({
    EmailId: encryptedEmailId
  });
};

export const getUserWithPermissions = async (encryptedEmailId: string) => {
  const sdk = await getSdkInstance();
  const result = await sdk.GetUserDetailsByEmailId({
    EmailId: encryptedEmailId
  });
};

export const getDefaultUserPermissionsByRoleName = async (roleName: string) => {
  // This will be valid for OP only for now. Additonal scenarios will need to be added later.
  const sdk = await getSdkInstance();
  const result = await sdk.getDefaultUserPermissionsByRoleName({
    roleName
  });
  return result.Tbl_Permissions.filter((m) => m.is_default);
};

export const getUserPermissionsByUserGuid = async (userGuid: string) => {
  const sdk = await getSdkInstance();
  const result = await sdk.getUserPermissionsByUserGuid({ userGuid });
  return result.Tbl_UserPermissions;
};
