import { getGraphQlServerSDK } from "~/graphql/server";
import { CustomError } from "~/shared/error/custom-error";
import {
  buildTokenForResetPassword,
  decodeToken,
  generateToken,
} from "~/utils/jwt/server";

import { encryptionDecryption } from "~/hooks/encryption-decryption";
import { getServerEnv } from "~/utils/env/env.server";
import {
  TTokenClaims,
  TUserClaims,
  TUserSession,
  getHasuraClaims,
  hasuraClaimsKey,
} from "./auth.client";

const getUserSessionFromDecodedClaims = async (claims: TUserClaims) => {
  const userRole = claims[hasuraClaimsKey]["x-hasura-default-role"];
  const userId = claims[hasuraClaimsKey]["x-hasura-user-id"];
  const organizationId = claims[hasuraClaimsKey]["x-hasura-org-id"];
  const userEmail = claims["user_email"];
  const isAiEnabled = claims[hasuraClaimsKey]["x-hasura-is-AI-enabled"];
  const server = await getGraphQlServerSDK();

  const authUserDetails = await server.getAuthUserDetails({
    organizationId: organizationId,
    email: userEmail,
  });

  const mappings =
    authUserDetails?.UserOrganizationAddressMapping?.map((m) => ({
      organization_address_id: m.OrganizationAddress?.id,
      activities: m.activities,
    })) || [];

  return { organizationId, userRole, userId, userEmail, mappings, isAiEnabled };
};

export const getAccessToken = async (organizationId: string, email: string) => {
  const server = await getGraphQlServerSDK();

  const userDetails = await server.getAuthUserDetails({
    organizationId,
    email,
  });

  if (userDetails.AppUser.length < 1) {
    throw CustomError({
      statusCode: 401,
      code: 401,
      message: "No user details found",
    });
  }

  await server.updateAppUserByEmail({
    email: email,
    orgId: organizationId,
    data: {
      isRegistered: true,
    },
  });

  //  const firstData = userDetails.UserOrganizationAddressMapping[0];

  const user_id = userDetails?.AppUser[0]?.id;
  const user_role = userDetails?.AppUser[0]?.role;
  const user_email = userDetails?.AppUser[0]?.email;
  const is_AI_enabled = userDetails?.AppUser[0]?.is_AI_enabled || false;

  // const mappings = userDetails.UserOrganizationAddressMapping.map((m: any) => ({
  //   organization_address_id: m.OrganizationAddress?.id,
  //   activities: m.activities,
  // }));

  const hasuraClaims = getHasuraClaims(
    organizationId,
    user_id,
    user_role,
    String(is_AI_enabled)
  );

  const claims: TTokenClaims = {
    "https://hasura.io/jwt/claims": hasuraClaims[hasuraClaimsKey],
    user_email,
  };

  const env = await getServerEnv();
  const token = generateToken(claims, String(env.HASURA_JWT_SECRET));

  return token;
};

export const getUserSession = async (accessToken: string) => {
  try {
    const env = await getServerEnv();
    const claims: any = decodeToken(accessToken, String(env.HASURA_JWT_SECRET));
    if (!claims) throw CustomError({ message: "No claims found" });

    const userSession = (await getUserSessionFromDecodedClaims(
      claims
    )) as TUserSession;

    return userSession;
  } catch (error) {
    console.error("decodeToken error:", error);
    throw CustomError({ message: "Failed to get user session" });
  }
};

export const generateUserPasswordSetNewPasswordLink = async (
  userEmail: string
) => {
  const { choosemethod } = encryptionDecryption();
  const env = await getServerEnv();
  const jwtClaims = buildTokenForResetPassword(
    choosemethod(String(userEmail), "encrypt") as string,
    "IsInternalRequest"
  );

  const resetToken = generateToken(
    jwtClaims,
    String(env.HASURA_JWT_SECRET),
    "24h"
  );

  const resetLink = new URL(
    `${env.NEXT_PUBLIC_SITE_URL}/setnewpassword?email=${resetToken}`
  );

  resetLink.pathname = resetLink.pathname.replace(/\/{2,}/g, "/");

  return resetLink.toString();
};
