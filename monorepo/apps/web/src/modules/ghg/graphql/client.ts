import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { clientEnv } from "@/modules/ghg/utils/env/env.client";

export const getApolloClient = () => {
  const httpLink = createHttpLink({
    uri: String(clientEnv.NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL),
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("access_token");
    let authHeaders: any = {};
    if (token) authHeaders["authorization"] = `Bearer ${token}`;

    return {
      headers: {
        ...headers,
        ...authHeaders,
        // "x-hasura-admin-secret": clientEnv.HASURA_ADMIN_SECRET,
      },
    };
  });

  const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return apolloClient;
};
