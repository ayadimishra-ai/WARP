import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { setContext } from "@apollo/client/link/context";
import { getLocalStorageSession } from "@/modules/warp/packages/shared/utils/auth-session.util";
import { getGraphqlApiUrl } from "../../configs/api.config";

let apolloClient: ApolloClient<NormalizedCacheObject>;

const initApolloClient = () => {
  const httpLink = new HttpLink({ uri: getGraphqlApiUrl() });

  const authLink = setContext(async (_, { headers }) => {
    const authHeader: any = {};

    const adminSecret =
      process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ADMIN_SECRET ||
      process.env.HASURA_GRAPHQL_ADMIN_SECRET;

    if (adminSecret) {
      authHeader["x-hasura-admin-secret"] = adminSecret;
    }

    // 2. On client-side, also try to get session token if secret is not enough
    if (typeof window !== "undefined") {
      try {
        const session = getLocalStorageSession(window.localStorage);
        if (session?.accessToken) {
          // If we had a session token, we could use it here:
          // authHeader.authorization = "Bearer " + session.accessToken;
        }
      } catch (error) {
        console.warn("Apollo: Failed to get session", error);
      }
    }

    return {
      headers: {
        ...headers,
        ...authHeader,
        Accept: "application/json",
      },
    };
  });

  const batchLink = new BatchHttpLink({
    uri: getGraphqlApiUrl(),
    batchMax: 15, // Maximum number of operations to include in one batch
    batchInterval: 50, // Wait time in milliseconds before sending the batch
  });

  // Combine the links using ApolloLink.from
  const link = ApolloLink.from([authLink, batchLink]);

  //Define custom type policies for more granular control over the cache.
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          items: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  });

  apolloClient = new ApolloClient({
    cache: cache,
    link: link,
  });

  // apolloClient = new ApolloClient({
  //   cache: cache,
  //   link: authLink.concat(httpLink),
  // });

  return apolloClient;
};

initApolloClient();

export { apolloClient as client, initApolloClient as initClient };

