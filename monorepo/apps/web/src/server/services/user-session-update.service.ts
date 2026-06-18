import { SessionStatus } from "@/constants/app.constants";
import { getSdkInstance } from "@/graphql/server/sdk";
import { Tbl_UserSessions, Tbl_UserSessions_Updates } from "@/graphql/types";
import { userSessionDataResult } from "@/types/interface.types";

export async function userSessionUpdateService(
  PlatformToken: string,
  userId: string,
  browserToken: string
): Promise<userSessionDataResult> {
  try {
    // Validate data availability
    if (!PlatformToken) {
      return {
        status200OK: 401,
        error: { message: "No PlatformToken provided", status: 401 },
        success: false,
      };
    }
    const sdk = await getSdkInstance();

    let userInput: Tbl_UserSessions_Updates[] = [];
    if (!!userId && !!browserToken) {
      const result = await sdk.GetActiveSessionsByBrowserToken({ userId, browserToken });

      // Check if there are active sessions
      if (result.Tbl_UserSessions && result.Tbl_UserSessions.length > 0) {
        // Filter active sessions that don't match the current PlatformToken
        // const sessionsToUpdate = result.Tbl_UserSessions
        //   .filter(session => 
        //     !!session.PlatformToken && session.Status === SessionStatus.Active &&  session.PlatformToken !== PlatformToken.toString()
        //   ) as Tbl_UserSessions[];

        const sessionsToUpdate = result.Tbl_UserSessions
          .filter(session =>
            session.Status === SessionStatus.Active
          ) as Tbl_UserSessions[];

        // Create userInput array with conditions for each session to update
        userInput = sessionsToUpdate.map(session => ({
          where: { id: { _eq: session.id } },
          _set: {
            Status: SessionStatus.Inactive,
            ModifiedDate: new Date().toISOString()
          }
        }));
      }
    } else {
      userInput.push({
        where: { PlatformToken: { _neq: PlatformToken.toString() }, UserId: { _eq: userId }, Status: { _eq: "Active" } },
        _set: {
          Status: SessionStatus.Inactive,
          ModifiedDate: new Date().toISOString()
        }
      });
    }

    // Update sessions in database
    const saveResult = await sdk.updateUserSession({ input: userInput });

    return {
      status200OK: 200,
      saveresult: "Session Updated successfully",
      success: true,
      data: { sessions: saveResult.update_Tbl_UserSessions_many || [] }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status200OK: 400,
      error: { message: `${errorMessage} - something went wrong`, status: 400 },
      success: false,
    };
  }
}

export default userSessionUpdateService;