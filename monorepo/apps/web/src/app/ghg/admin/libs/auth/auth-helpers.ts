import { getUserSession } from "@/modules/ghg/lib/auth/auth.server";
import {
  isLocationExecutive,
  isOrganizationAdmin,
  isSuperAdmin,
} from "@/modules/ghg/shared/constants/user-roles.constant";

export type ISession = {
  userEmail: string;
  userId: string;
  userRole: string;
  isAdmin: boolean;
  isOrgAdmin: boolean;
  isLocationExec: boolean;
  organizationId: string;
};

export const getSession = async (accessToken: string | undefined) => {
  if (!accessToken) throw new Error("Access Denied : No access token found");

  const { userEmail, userId, userRole, organizationId } = await getUserSession(
    accessToken
  ).catch((err) => {
    throw new Error("Access Denied");
  });

  const isAdmin = isSuperAdmin(userRole);
  const isOrgAdmin = isOrganizationAdmin(userRole);
  const isLocationExec = isLocationExecutive(userRole);

  return {
    userEmail,
    userId,
    userRole,
    isAdmin,
    isOrgAdmin,
    isLocationExec,
    organizationId,
  };
};
