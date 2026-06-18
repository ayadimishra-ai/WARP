import { GraphQLClient } from "graphql-request";
import { getSdk } from "./sdk";
import { secretsManagerService } from "@/modules/warp/packages/secrets";
import { getGraphqlApiUrl } from "@/modules/warp/packages/configs/api.config";

type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;

const client = new GraphQLClient(getGraphqlApiUrl(), {
  requestMiddleware: async (request) => {
    const secret = await secretsManagerService.getSecret("HASURA_GRAPHQL_ADMIN_SECRET");
    return {
      ...request,
      headers: {
        ...((request.headers as Record<string, string>) ?? {}),
        "x-hasura-admin-secret": secret ?? "",
      },
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
