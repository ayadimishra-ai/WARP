import { useRouter } from "next/compat/router";

export type TAdminRouteSearchParams = {
  accessToken: string;
};
export type TEmbedLayoutProps = {
  searchParams: Promise<TAdminRouteSearchParams>;
};

export const getParams = async (
  props: React.PropsWithChildren<TEmbedLayoutProps>
) => {
  const params = await props.searchParams;
  if (!params.accessToken) throw new Error("No access token found");
  return params;
};
