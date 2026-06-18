import { GraphQLClient } from "graphql-request";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";
import { getSdk } from "./shared/sdk";

// Per-request timeout for Hasura calls. Aborting at 25s frees the App Runner
// worker so it can serve other requests instead of dying under back-pressure.
const HASURA_REQUEST_TIMEOUT_MS = 25_000;

// Lazy singleton — one GraphQLClient per process, reused across all requests.
// Avoids reallocating undici dispatcher state on every call and lets HTTP
// keep-alive actually do its job.
let sdkPromise: Promise<ReturnType<typeof getSdk>> | null = null;

export const getGraphQlServerSDK = async () => {
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const serverEnv = await getServerEnv();
      const client = new GraphQLClient(
        serverEnv.NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL,
        {
          headers: {
            "x-hasura-admin-secret": serverEnv.HASURA_ADMIN_SECRET,
          },
          // graphql-request v6 forwards `fetch` to each request. Wrapping the
          // native fetch with AbortSignal.timeout enforces a hard per-request
          // ceiling without changing any call sites.
          fetch: ((input: any, init: any = {}) =>
            fetch(input, {
              ...init,
              signal: init?.signal ?? AbortSignal.timeout(HASURA_REQUEST_TIMEOUT_MS),
            })) as typeof fetch,
        }
      );
      return getSdk(client);
    })().catch((err) => {
      // Don't pin a failed construction — let the next call retry.
      sdkPromise = null;
      throw err;
    });
  }
  return sdkPromise;
};
