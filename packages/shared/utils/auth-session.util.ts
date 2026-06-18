import { AppRoles } from "../constants/app.constants";
import { AuthSessionType } from "../types/auth.types";

export const localStorageSessionKey = "warp_session";

export const parseHasuraClaims = (
  decodedToken: any,
  accessToken: string = ""
) => {
  const claims = decodedToken
    ? decodedToken["https://hasura.io/jwt/claims"]
    : null;

  if (!!claims) {
    const session: AuthSessionType | null = {
      company: { id: claims["x-hasura-company-id"] },
      platform: { id: claims["x-hasura-platform-id"] },
      user: {
        id: claims["x-hasura-user-id"],
        email: claims["x-hasura-user-email"],
        role: claims["x-hasura-role"],
      },
      accessToken,
    };
    return session;
  }

  return null;
};

export type AIPlanName = "DocumentCuration" | "WebCuration" | string;
export interface AIPlanDetail {
  formId: string;
  plan: AIPlanName;
  isActive: boolean;
}
export const buildHasuraClaims = (
  platformId: string,
  userId: string,
  companyId: string,
  userEmail: string,
  userRole: keyof typeof AppRoles,
  userAIDetails: { isUserAI: string; aiPlanDetails: AIPlanName[] },
  defaultRole?: string,
  allowedRoles: string[] = [
    "Creator",
    "Inviter",
    "Invitee",
    "Approver",
    "Analytics",
  ]
) => {
  return {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": allowedRoles,
      "x-hasura-default-role": userRole,
      "x-hasura-role": defaultRole ?? userRole,
      "x-hasura-user-id": userId,
      "x-hasura-user-email": userEmail,
      "x-hasura-platform-id": platformId,
      "x-hasura-company-id": companyId,
      "x-user-ai-details": userAIDetails,
    },
  };
};

export const getLocalStorageSession = (localStorage: any) => {
  try {
    if (!localStorage || typeof localStorage === "undefined") return null;

    const session: AuthSessionType | null = JSON.parse(
      localStorage.getItem(localStorageSessionKey) ?? "null"
    );

    return session;
  } catch (error) {
    console.log("WARP : Error", "getLocalStorageSession", error);
  }
  return null;
};

export const setLocalStorageSession = (localStorage: any, session: any) => {
  try {
    if (!localStorage || typeof localStorage === "undefined") return null;
    const sessionData = !!session ? JSON.stringify(session) : null;
    localStorage.setItem(localStorageSessionKey, sessionData);
    return session;
  } catch (error) {
    console.log("WARP : Error", "setLocalStorageSession", error);
  }
};

export const setLocalStorageData = (
  localStorage: any,
  dataKey: string,
  data: any
) => {
  try {
    if (!localStorage || typeof localStorage === "undefined") return null;
    localStorage.setItem(dataKey, data);
    return data;
  } catch (error) {
    console.log("WARP : Error", "setLocalStorageData", error);
  }
};

export const getLocalStorageData = (localStorage: any, dataKey: any) => {
  try {
    if (!localStorage || typeof localStorage === "undefined") return null;

    const data: any | null =
      localStorage.getItem(dataKey) ?? JSON.parse("null");

    return data === "null" ? null : data;
  } catch (error) {
    console.log("WARP : Error", "getLocalStorageData", error);
  }
  return null;
};

// Note : This build token is NOT used for password reset flow.
export const buildTokenForKhaitan = (
  userEmail: string,
  IsInternalRequest: string,
  formid: string
) => {
  return {
    "https://hasura.io/jwt/claims": {
      "x-hasura-user-email": userEmail,
      "x-hasura-IsInternalRequest": IsInternalRequest,
      "x-hasura-formid": formid,
    },
  };
};

export const setLocalStorageGlobalMasterSession = (
  localStorage: any,
  session: any,
  globalMasterData?: any
) => {
  try {
    if (!localStorage || typeof localStorage === "undefined") return null;
    if (!!globalMasterData) {
      session.GlobalMaster = globalMasterData;
      const sessionData = !!session ? JSON.stringify(session) : null;
      localStorage.setItem(localStorageSessionKey, sessionData);
      return session;
    }
  } catch (error) {
    console.log("WARP : Error", "setLocalStorageGlobalMasterSession", error);
  }
};
