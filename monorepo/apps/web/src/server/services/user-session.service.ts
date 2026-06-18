import { SessionStatus } from "@/constants/app.constants";
import { getSdkInstance } from "@/graphql/server/sdk";
import { INTERNAL_AUTH_TOKEN, API_BASE_URL } from "@/constants/auth.constants";
import { userSessionDataResult, SessionInput } from "@/types/interface.types";
import { generateOpsToken } from "./opstoken.service";
import { generateWarpToken } from "./warptoken.service";
import * as jose from "jose";
import { getEmailEncryptDecrypt } from "./get-email-encrypt-decrypt";

/**
 * Verify JWT token by calling internal API route
 */
async function verifyToken(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/internal/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-auth": INTERNAL_AUTH_TOKEN
      },
      body: JSON.stringify({ token })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    const err = error as Error;
    return {
      isValid: false,
      error: err.message || "Token verification failed"
    };
  }
}

export const getSessionDetails = async (
  userId: string
): Promise<userSessionDataResult> => {
  // Input validation - early return for invalid input
  if (!userId || userId === "null" || userId === "undefined") {
    return {
      status200OK: 401,
      error: {
        message: "UserId can not be null/empty",
        status: 401
      },
      success: false,
    };
  }
  const sdk = await getSdkInstance();

  // Fetch active sessions from database
  const result = await sdk.GetActiveSessions({ userId });

  return {
    status200OK: 200,
    saveresult: "Session Retrieved successfully",
    success: true,
    data: result
  };
}

export async function saveUserSessionService(
  userSessionData: SessionInput
): Promise<userSessionDataResult> {
  const sdk = await getSdkInstance();
  try {
    // Input validation - early return for invalid input
    if (!userSessionData.UserId) {
      return {
        status200OK: 401,
        error: {
          message: "UserId can not be null/empty",
          status: 401
        },
        success: false,
      }
    }

    // Check for existing active sessions
    /*const { Tbl_UserSessions } = await sdk.GetExistingSessions({
      userId: userSessionData.UserId,
      browserToken: userSessionData.BrowserToken
    });*/

    // Handle existing sessions with matching criteria
    /*if (Tbl_UserSessions?.length > 0) {
      // Update the existing session to inactive status
      const updateInput = {
        // where: {
        //   PlatformToken: { _eq: userSessionData.PlatformToken?.toString() }
        // },
        where: {
          id: { _eq: Tbl_UserSessions[0].id}
        },
        _set: {
          Status: SessionStatus.Active,
          WarpToken: userSessionData.WarpToken ?? null,
          OpsToken: userSessionData.OpsToken ?? null,
          ModifiedDate: new Date().toISOString()
        }
      };

      const updateResult = await sdk.updateUserSession({ input: updateInput });

      return {
        status200OK: 200,
        saveresult: "Session Already Active",
        success: true,
        data: { sessions: updateResult.update_Tbl_UserSessions_many || [] }
      };
    }*/

    // Create a new session
    const timestamp = new Date().toISOString();
    const sessionObject = {
      UserId: userSessionData.UserId,
      PlatformToken: userSessionData.PlatformToken ?? null,
      WarpToken: userSessionData.WarpToken ?? null,
      OpsToken: userSessionData.OpsToken ?? null,
      BrowserToken: userSessionData.BrowserToken ?? null,
      Status: SessionStatus.Active,
      Metadata: {
        BrowserName: userSessionData.BrowserName || null,
        ClientIp: userSessionData.ClientIp || null,
      },
      StatusMetadata: {
        reason: userSessionData.LoggedIn || userSessionData.PasswordReset || null,
        message: userSessionData.LoggedIn?"User logged in successfully": userSessionData.PasswordReset?"Password has been reset successfully": null
      },
      CreatedBy: userSessionData.UserId,
      ModifiedBy: userSessionData.UserId,
      CreatedDate: timestamp,
      ModifiedDate: timestamp
    };

    // Save new session to database
    const saveResult = await sdk.saveUserSession({ object: sessionObject });
    const affectedRows = saveResult.insert_Tbl_UserSessions?.affected_rows || 0;

    // Return success or error based on operation result
    return affectedRows > 0
      ? {
        status200OK: 200,
        saveresult: "Session Added successfully",
        success: true,
        data: saveResult.insert_Tbl_UserSessions?.returning[0]
      }
      : {
        status200OK: 400,
        saveresult: "Failed to add session to database",
        success: false
      };
  } catch (error) {
    return {
      status200OK: 400,
      error: {
        message: error instanceof Error ? error.message : String(error) + " something went wrong",
        status: 400
      },
      success: false,
    }
  }
}

export default saveUserSessionService;


export async function checkSessionExpiration(
  BrowserToken: string,
  userId: string,
  opsCompanyId: string,
  warpCompanyId: string,
  companyId: string,
  emailId: string
) {
  const sdk = await getSdkInstance();
  try {
    // Call SDK to check session expiration
    const result = await getSessionDetails(userId);
    if (!result) {
      return {
        status200OK: 404,
        error: {
          message: "Session not found",
          status: 404
        },
        success: false,
      };
    }

    const dbData = result.data?.Tbl_UserSessions;

    dbData?.map(async (item: any) => {
      if (item.BrowserToken === BrowserToken) {
        const objPlatformToken = await verifyToken(item.PlatformToken ?? "");
        const expirationDateTime = objPlatformToken.isValid === true ?
          (objPlatformToken?.payload?.exp ? new Date(objPlatformToken.payload.exp * 1000)
            : null)
          : null;
        console.log("Exp time-", expirationDateTime);
        if (expirationDateTime && expirationDateTime < new Date()) {
          console.log("Session has expired");
          return {
            status200OK: 200,
            message: "Session has expired"
          }
        } else {
          console.log("Platform Session is active");
          const objOpsToken = item.OpsToken ? jose.decodeJwt(item.OpsToken) : null;
          const objWarpToken = item.WarpToken ? jose.decodeJwt(item.WarpToken) : null;

          const opsExpirationDateTime = objOpsToken?.exp ? new Date(objOpsToken?.exp * 1000) : null;
          console.log("Ops Exp time-", opsExpirationDateTime);

          const warpExpirationDateTime = objWarpToken?.exp ? new Date(objWarpToken?.exp * 1000) : null;
          console.log("Warp Exp time-", warpExpirationDateTime);

          let newOpsToken:any = null;
          let newWarpToken:any = null;
          const decryptedEmailId = await getEmailEncryptDecrypt({ "email": emailId, "type": "decrypt" });
          if (opsExpirationDateTime && opsExpirationDateTime < new Date()) {
            newOpsToken = await generateOpsToken(decryptedEmailId.saveresult, companyId, opsCompanyId);
          }

          if (warpExpirationDateTime && warpExpirationDateTime < new Date()) {
            newWarpToken = await generateWarpToken(decryptedEmailId.saveresult, companyId, warpCompanyId);
          }

          if (newOpsToken?.accessToken || newWarpToken?.accessToken) {
            const recordToUpdate = {
              where: { id: { _eq: item.id } },
              _set: {
                OpsToken: newOpsToken?.accessToken || null,
                WarpToken: newWarpToken?.accessToken || null
              }
            };

            const updateResult = await sdk.updateUserSession({ input: [recordToUpdate] });

            return {
              status200OK: 200,
              message: "Session updated successfully",
              success: true,
              data: updateResult.update_Tbl_UserSessions_many || []
            };
          }

        }
      } else {
        return {
          status200OK: 401,
          error: {
            message: "BrowserToken does not match session record",
            status: 401
          },
          success: false,
        };
      }
    })


  } catch (error) {
    return {
      status200OK: 400,
      error: {
        message: error + " something went wrong",
        status: 400
      },
      success: false,
    };
  }
}

