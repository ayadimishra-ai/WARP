import { AppRoles } from "../constants/app.constants";

export type AuthSessionType = {
  platform?: { id: string };
  user?: { id: string; email: string; role: keyof typeof AppRoles };
  company?: { id: string };
  accessToken?: string;
  GlobalMaster?: [];
} | null;
