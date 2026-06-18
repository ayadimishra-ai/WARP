import { decodeToken } from "./client";

export const ROLE_LOCATION_EXECUTIVE = "LocationExecutive";
export const ROLE_ORGANIZATION_ADMIN = "OrganizationAdmin";

/**
 * Decodes a JWT access token and extracts the user roles from the Hasura claims.
 * @param accessToken The JWT access token (string or string[])
 * @returns The array of allowed roles, or undefined if not present.
 */
export function getUserRoleFromToken(
  accessToken: string | string[] | undefined
): string | undefined {
  const decodedToken = decodeToken(
    Array.isArray(accessToken) ? accessToken[0] : accessToken || ""
  );
  const userRole =
    decodedToken &&
    typeof decodedToken === "object" &&
    "https://hasura.io/jwt/claims" in decodedToken
      ? (decodedToken as Record<string, any>)["https://hasura.io/jwt/claims"]?.[
          "x-hasura-allowed-roles"
        ]
      : undefined;
  return userRole;
}

/**
 * Decodes a JWT access token and extracts the organization ID from the Hasura claims.
 * @param accessToken The JWT access token (string or string[])
 * @returns The organization ID as a string, or undefined if not present.
 */
export function getOrganizationIdFromToken(
  accessToken: string | string[] | undefined
): string | undefined {
  const decodedToken = decodeToken(
    Array.isArray(accessToken) ? accessToken[0] : accessToken || ""
  );
  const orgId =
    decodedToken &&
    typeof decodedToken === "object" &&
    "https://hasura.io/jwt/claims" in decodedToken
      ? (decodedToken as Record<string, any>)["https://hasura.io/jwt/claims"]?.[
          "x-hasura-org-id"
        ]
      : undefined;
  return orgId;
}

/**
 * Decodes a JWT access token and checks if AI is enabled from the Hasura claims.
 * @param accessToken The JWT access token (string or string[])
 * @returns True if AI is enabled, false otherwise.
 */
export function isAIEnable(accessToken: string | string[]): boolean {
  const decodedToken = decodeToken(
    Array.isArray(accessToken) ? accessToken[0] : accessToken || ""
  );
  const isAIEnabledStr =
    decodedToken &&
    typeof decodedToken === "object" &&
    "https://hasura.io/jwt/claims" in decodedToken
      ? (decodedToken as Record<string, any>)["https://hasura.io/jwt/claims"]?.[
          "x-hasura-is-AI-enabled"
        ]
      : undefined;
  return isAIEnabledStr === "true";
}

/**
 * Decodes a JWT access token and extracts the user ID from the Hasura claims.
 * @param accessToken The JWT access token (string or string[])
 * @returns The user ID as a string, or undefined if not present.
 */
export function getUserIdFromToken(
  accessToken: string | string[] | undefined
): string | undefined {
  const decodedToken = decodeToken(
    Array.isArray(accessToken) ? accessToken[0] : accessToken || ""
  );
  const userId =
    decodedToken &&
    typeof decodedToken === "object" &&
    "https://hasura.io/jwt/claims" in decodedToken
      ? (decodedToken as Record<string, any>)["https://hasura.io/jwt/claims"]?.[
          "x-hasura-user-id"
        ]
      : undefined;
  return userId;
}
