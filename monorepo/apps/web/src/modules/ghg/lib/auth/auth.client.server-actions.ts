"use server";

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { decodeToken } from "@/modules/ghg/utils/jwt/client";
import { hasuraClaimsKey, TUserClaims } from "./auth.client";

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

export const getUserSession = async (accessToken: string) => {
  const claims: any = decodeToken(accessToken);

  if (!claims) throw new Error("No user claims found");

  const userSession = await getUserSessionFromDecodedClaims(claims);

  return userSession;
};
