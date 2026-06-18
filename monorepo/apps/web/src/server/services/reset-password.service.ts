import { getSdkInstance } from "@/graphql/server/sdk";
import { Tbl_Users_Updates } from "@/graphql/types";

/**
 * Interface for user details retrieved by password token
 */
export interface UserDetailsByToken {
  UserGuid: string;
  EmailId: string;
  MobileNumber?: string;
  FirstName?: string;
  LastName?: string;
  IsActive: boolean;
  CompanyName?: string;
  Password?: string;
  CreatedDate: string;
  SetPasswordToken?: string;
  OPSUserId?: string;
}

/**
 * Interface for the service response
 */
export interface GetUserDetailsByTokenResult {
  success: boolean;
  message: string;
  user?: UserDetailsByToken;
}

/**
 * Get user details by password reset token
 * @param token - The password reset token
 * @returns Promise containing user details or error message
 */
export async function getUserDetailsByPasswordToken(
  token?: string | null
): Promise<GetUserDetailsByTokenResult> {
  // Check for null or undefined token
  if (token === null || token === undefined) {
    return {
      success: false,
      message: "Token cannot be null"
    };
  }

  // Check for empty token
  if (token.trim() === "") {
    return {
      success: false,
      message: "Token cannot be empty"
    };
  }

  try {
    const sdk = await getSdkInstance();
    // Query the database using the SDK
    const result = await sdk.GetUserDetailsByPasswordToken({
      SetPasswordToken: token
    });

    if (!result || !result.Tbl_Users || result.Tbl_Users.length === 0) {
      return {
        success: false,
        message: "Invalid or expired token"
      };
    }

    const user = result.Tbl_Users[0];

    return {
      success: true,
      message: "User details retrieved successfully",
      user: user as UserDetailsByToken
    };
  } catch (error) {
    console.error("Error getting user details by password token:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve user details"
    };
  }
}

/**
 * Interface for updating user password token
 */
export interface UpdatePasswordTokenResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Update user's SetPasswordToken by OPSUserId
 * @param opsUserIds - The OPS User ID array to identify the user
 * @returns Promise containing operation result
 */
export async function updateUserPasswordTokenByOpsUserId(
  extractedOpsUserIds?: string[] | null
): Promise<UpdatePasswordTokenResult> {
  // Validate OPSUserId
  if (
    !extractedOpsUserIds ||
    !Array.isArray(extractedOpsUserIds) ||
    extractedOpsUserIds.length === 0
  ) {
    return {
      success: false,
      message: "OPSUserId is required and must be a non-empty array"
    };
  }

  // Check if all elements in the array are valid strings
  if (extractedOpsUserIds.some((id) => !id || id.trim() === "")) {
    return {
      success: false,
      message: "All OPSUserId elements must be non-empty strings"
    };
  }

  try {
    // Update the user's password token using the SDK
    const object: Tbl_Users_Updates[] = extractedOpsUserIds?.map((opUserId) => {
      return {
        where: {
          OPSUserId: {
            _eq: opUserId
          }
        },
        _set: {
          SetPasswordToken: opUserId?.toString()?.replaceAll("-", "")
        }
      };
    });

    const sdk = await getSdkInstance();
    const result = await sdk.updateUser({
      input: object
    });

    if (!result || result.update_Tbl_Users_many?.length === 0) {
      return {
        success: false,
        message: "User not found or no changes made"
      };
    }

    return {
      success: true,
      message: "Set Password token updated successfully",
      data: result?.update_Tbl_Users_many?.[0]?.returning
    };
  } catch (error) {
    console.error("Error updating user password token by OPSUserId:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update password token"
    };
  }
}
