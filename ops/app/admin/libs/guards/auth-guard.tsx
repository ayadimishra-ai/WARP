import { unauthorized } from "next/navigation";
import { getSession } from "../auth/auth-helpers";
import type { TEmbedLayoutProps } from "../helpers/route-helpers";

const SuperAdminAuthGuard: React.FC<
  React.PropsWithChildren<TEmbedLayoutProps>
> = async (props) => {
  const searchParams = await props.searchParams;

  const accessToken = searchParams?.accessToken;

  if (!accessToken) {
    return unauthorized();
    // throw new Error("Access Denied: No Access Token");
  }

  const session = await getSession(accessToken);
  if (session.isAdmin !== true) {
    return unauthorized();
    // throw new Error("Access Denied: Super Admins Only");
  }

  return <div>{props.children}</div>;
};

export default SuperAdminAuthGuard;
