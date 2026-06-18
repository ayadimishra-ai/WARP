import { getSdkInstance } from "@/graphql/server/sdk";
import { passwordDecrypt } from "@/util/passwordDecrypt";

export async function getUserPasswordService(userGuid: string) {
  try {
    const sdk = await getSdkInstance();
    // Call the GetUserByGuid GraphQL query using the sdk
    const result = await sdk.GetUserByGuid({ userGuid });

    const password = result.Tbl_Users[0].Password;

    if (!password) {
      return {
        status200OK: 404,
        saveresult: "Password not found for the user."
      };
    }

    const decryptedPassword = passwordDecrypt(password);

    return decryptedPassword;
  } catch (error) {
    return { status200OK: 500, saveresult: "Internal server error." };
  }
}
