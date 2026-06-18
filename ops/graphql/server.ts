import { GraphQLClient } from "graphql-request";
import { getServerEnv } from "~/utils/env/env.server";
import { getSdk } from "./shared/sdk";

export const getGraphQlServerSDK = async () => {
  const serverEnv = await getServerEnv();
  const client = new GraphQLClient(serverEnv.NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL, {
    headers: {
      "x-hasura-admin-secret": serverEnv.HASURA_ADMIN_SECRET,
    },
  });

  return getSdk(client);
};
