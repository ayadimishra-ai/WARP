import { getSdkInstance } from "@/graphql/server/sdk";
import { UserLoginLog } from "@/types/interface.types";

export async function createUserLoginLog(
  userGuid: string,
  clientIp: string
): Promise<string> {
  try {
    // Create login log entry
    const loginLog: UserLoginLog = {
      UserLoginLogsGuid: crypto.randomUUID(),
      UserGuid: userGuid,
      LoginDate: new Date().toISOString(),
      ClientIP: clientIp
    };
    const sdk = await getSdkInstance();

    // Insert login log using GraphQL mutation
    await sdk.InsertUserLoginLogs({
      object: loginLog
    });

    await sdk.UpdateUserLoginDateTime({
      userGuid,
      loginDateTime: new Date().toISOString()
    });

    return "Log entry added successfully";
  } catch (error) {
    console.error("Error in createUserLoginLog service:", error);
    throw error;
  }
}
