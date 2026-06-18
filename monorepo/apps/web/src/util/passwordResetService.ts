import { MetaDataStatus } from "@/constants/app.constants";
import { getSdkInstance } from "@/graphql/server/sdk";
import jwt from "jsonwebtoken";
import { getServerEnv } from "@/lib/env/env.server";

/**
 * Interface for password reset token validation result
 */
export interface TokenValidationResult {
  isValid: boolean;
  message: string;
  userId?: string;
  email?: string;
  expiresAt?: Date;
  issuedAt?: Date;
}

//isOpsToken param is sent for the new user, if new user whos not registered yet then he should stay on set new password page instead of login or home page
//just sent a new flag to keep older logic as it is for other scenarios.
export async function validatePasswordResetToken(
  token?: string | null,
  isOpsToken?: boolean
): Promise<TokenValidationResult> {
  // Check for null or undefined token
  if (token === null || token === undefined) {
    return {
      isValid: false,
      message: "Token cannot be null"
    };
  }

  // Check for empty token
  if (token.trim() === "") {
    return {
      isValid: false,
      message: "Token cannot be empty"
    };
  }

  try {
    // Check if JWT_SECRET environment variable is configured
    const env = await getServerEnv();
    if (!env.JWT_SECRET) {
      return {
        isValid: false,
        message: "JWT configuration error"
      };
    }

    // Check if token has expired
    const now = Math.floor(Date.now() / 1000);

    let email = "";
    let exp: Date | undefined = undefined;
    let iat: Date | undefined = undefined;
    let userId = "";

    if (!!isOpsToken) {
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      // Check for standard JWT expiration
      // if (decoded.exp && decoded.exp < now) {
      //   return {
      //     isValid: false,
      //     message: "Token has expired"
      //   };
      // }

      email = decoded["https://hasura.io/jwt/claims"][
        "x-hasura-user-email"
      ] as string;
      exp = decoded.exp ? new Date(decoded.exp * 1000) : undefined;
      iat = decoded.iat ? new Date(decoded.iat * 1000) : undefined;
      userId =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"] ||
        ("" as string);
    } else {
      // Verify the token
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      //// Check token type is for password reset
      // if (
      //   decoded.type !== "password_reset" ||
      //   decoded.sub !== "password_reset"
      // ) {
      //   return {
      //     isValid: false,
      //     message: "Invalid token type"
      //   };
      // }

      // Check for standard JWT expiration
      // if (decoded.exp && decoded.exp < now) {
      //   return {
      //     isValid: false,
      //     message: "Token has expired"
      //   };
      // }

      email = decoded["https://hasura.io/jwt/claims"][
        "x-hasura-user-email"
      ] as string;
      token = token;
      exp = decoded.exp ? new Date(decoded.exp * 1000) : undefined;
      iat = decoded.iat ? new Date(decoded.iat * 1000) : undefined;
      userId = decoded["https://hasura.io/jwt/claims"][
        "x-hasura-user-id"
      ] as string;
    }

    // Additional check for 24-hour expiration from issue time
    // if (decoded.iat) {
    //   const issuedAt = decoded.iat as number;
    //   const twentyFourHoursInSeconds = 24 * 60 * 60;

    //   if ((now - issuedAt) > twentyFourHoursInSeconds) {
    //     return {
    //       isValid: false,
    //       message: "Token expired (older than 24 hours)"
    //     };
    //   }
    // }

    //=================================================
    // Check Record In DB
    const sdk = await getSdkInstance();
    const result = await sdk.GetPasswordManageMasterByEmailandToken({
      email,
      token
    });

    if (
      !isOpsToken &&
      !!result &&
      result.Tbl_PasswordManageMaster &&
      result.Tbl_PasswordManageMaster.length > 0
    ) {
      return {
        isValid: false,
        message: "Your password reset request is already used or invalid"
      };
    }

    //=================================================

    // Token is valid
    return {
      isValid: true,
      message: "Valid token",
      userId: userId as string,
      email: email as string,
      expiresAt: exp,
      issuedAt: iat
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return {
      isValid: false,
      message: error instanceof Error ? error.message : "Invalid token format"
    };
  }
}

// NOTE : 'generatePasswordResetToken' is not used currently. Instead, SetPasswordToken is stored in DB.
export async function generatePasswordResetToken(
  email: string,
  isOPSUser?: boolean
): Promise<{ token: string; expiresAt: Date }> {
  const env = await getServerEnv();
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const expiresIn = 60 * 60 * 24; // 24 hours in seconds
  const expiresAt = new Date((now + expiresIn) * 1000); // Convert to milliseconds for Date

  let emailObject;
  if (typeof isOPSUser !== "undefined" && isOPSUser) {
    emailObject = {
      "x-hasura-user-email": email,
      "x-hasura-IsInternalRequest": "IsInternalRequest"
    };
  } else {
    emailObject = {
      "x-hasura-user-email": email,
      "x-hasura-IsInternalRequest": "IsInternalRequest",
      "x-hasura-formid": "formid"
    };
  }
  const payload = {
    "https://hasura.io/jwt/claims": emailObject,
    sub: "password_reset",
    jti: crypto.randomUUID(), // Unique token identifier
    iat: now, // Issued at
    nbf: now, // Not before
    exp: now + expiresIn,
    email: email,
    type: "password_reset"
  };

  const token = jwt.sign(payload, env.JWT_SECRET);

  return {
    token,
    expiresAt
  };
}

export async function setActiveUserSessionToInactive(userId: string) {
  // Check Record In DB
  const sdk = await getSdkInstance();
  const message = "Your password has been updated. Please log in again.";
  const result = await sdk.updateActiveUserSessionForPasswordReset({
    userId,
    statusMetadata: { reason: MetaDataStatus.PasswordReset, message }
  });

  if (!!result) {
    return {
      success: true,
      message: message
    };
  }
}
