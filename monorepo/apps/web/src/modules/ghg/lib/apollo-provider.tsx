"use client";

import { ApolloProvider } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { getApolloClient } from "@/modules/ghg/graphql/client";

export const ApolloWrapper: React.FC<
  React.PropsWithChildren<{ organizationId: string; accessToken: string }>
> = ({ children, accessToken }) => {
  const clientRef = useRef<ReturnType<typeof getApolloClient> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      const client = getApolloClient();
      if (!client) throw new Error("No graphql client found");
      clientRef.current = client as any;
      window.localStorage.setItem("access_token", accessToken);
    } else {
      clientRef.current = null;
      window.localStorage.setItem("access_token", "");
    }
    setLoading(false);
  }, [accessToken]);

  if (loading || !clientRef.current) return <></>;

  return <ApolloProvider client={clientRef.current}>{children}</ApolloProvider>;
};
