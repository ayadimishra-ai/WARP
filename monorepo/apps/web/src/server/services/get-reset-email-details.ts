import { getSdkInstance } from "@/graphql/server/sdk";

export async function getResetEmailDetails(email: string, token: string) {

  const sdk = await getSdkInstance();
  // Fetch active sessions from database
  const result = await sdk.GetPasswordManageMasterByEmailandToken({ email, token });

  return {
    status200OK: 200,
    saveresult: "Session Retrieved successfully",
    success: true,
    data: result
  };
}