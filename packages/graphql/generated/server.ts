import { getGraphqlApiUrl } from "@warp/configs/api.config";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "./sdk";

type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;
console.log("getGraphqlApiUrl()", getGraphqlApiUrl());

const client = new GraphQLClient(getGraphqlApiUrl(), {
  headers: () => {
    // Will be Removed
    // if (process.env.HASURA_GRAPHQL_ADMIN_SECRET)

    return {
      "x-hasura-admin-secret": process.env["HASURA_GRAPHQL_ADMIN_SECRET"] ?? "",
    };
  },
});

const clientTimingWrapper: SdkFunctionWrapper = async <T>(
  action: () => Promise<T>
): Promise<T> => {
  console.time("request duration (ms)");
  const result = await action();
  console.timeEnd("request duration (ms)");
  return result;
};

export const sdk = getSdk(client, clientTimingWrapper);
