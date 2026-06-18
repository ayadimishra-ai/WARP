import { ApolloProvider } from "@apollo/client";
import { FC, PropsWithChildren } from "react";
import { client } from "./init-client";
type ClientProviderPropsType = PropsWithChildren<Record<string, unknown>> & {};

const ClientProvider: FC<ClientProviderPropsType> = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ClientProvider;
