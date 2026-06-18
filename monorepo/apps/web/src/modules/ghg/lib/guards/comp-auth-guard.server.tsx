import UnauthorizedPleaseLoginAgain from "@/modules/ghg/components/ui/UnauthorizedPleaseLoginAgain";
import { getUserSession } from "../auth/auth.server";

const ComponentAuthGuardWrapper: React.FC<
  React.PropsWithChildren<{ accessToken: string }>
> = async ({ children, accessToken }) => {
  let session = null;

  try {
    session = await getUserSession(accessToken);
  } catch (error) {}

  if (!session) return <UnauthorizedPleaseLoginAgain />;
  return <>{children}</>;
};

export default ComponentAuthGuardWrapper;
