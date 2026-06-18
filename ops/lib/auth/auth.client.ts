import { decodeToken } from "~/utils/jwt/client";

export type TTokenClaims = {
  user_email: string;
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": string;
    "x-hasura-allowed-roles": string[];
    "x-hasura-user-id": string;
    "x-hasura-org-id": string;
    "x-hasura-is-AI-enabled": string;
  };
};

export type TUserClaims = {
  user_email: string;
  mappings: {
    organization_address_id: any;
    activities: string[];
  }[];
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": string;
    "x-hasura-allowed-roles": string[];
    "x-hasura-user-id": string;
    "x-hasura-org-id": string;
    "x-hasura-is-AI-enabled": string;
  };
};

export const hasuraClaimsKey = "https://hasura.io/jwt/claims";

export const getHasuraClaims = (
  organizationId: string,
  userId: string,
  userRole: string,
  is_AI_enabled: string
) => ({
  [hasuraClaimsKey]: {
    "x-hasura-default-role": userRole,
    "x-hasura-allowed-roles": [userRole],
    "x-hasura-user-id": userId,
    "x-hasura-org-id": organizationId,
    "x-hasura-is-AI-enabled": is_AI_enabled,
  },
});

// export type TUserSession = ReturnType<typeof getUserSessionFromDecodedClaims>;
export type TUserSession = {
  organizationId: string;
  userRole: string;
  userId: string;
  userEmail: string;
  isAiEnabled: string;
  mappings: {
    organization_address_id: string;
    activities: string[];
  }[];
};

export const getUserOrganizationId = (accessToken: string) => {
  const claims: any = decodeToken(accessToken);
  if (!claims) throw new Error("No user claims found");
  const organizationId: string = claims[hasuraClaimsKey]["x-hasura-org-id"];
  return organizationId;
};

export const getOrgIdFromAccessToken = (accessToken: string) => {
  const claims: any = decodeToken(accessToken);
  if (!claims) throw new Error("No user claims found");
  const organizationId = claims[hasuraClaimsKey]["x-hasura-org-id"];
  return organizationId;
};
