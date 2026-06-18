"use client";

import {
  ApolloClient,
  ApolloProvider as Provider,
  InMemoryCache,
  createHttpLink,
  createQueryPreloader,
} from "@apollo/client";

interface ApolloProviderProps {
  children: React.ReactNode;
  graphqlEndpoint: string;
}

export const ApolloProvider = ({ children, graphqlEndpoint }: ApolloProviderProps) => {
  const client = new ApolloClient({
    link: createHttpLink({
      uri: graphqlEndpoint,
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });

  return <Provider client={client}>{children}</Provider>;
};
