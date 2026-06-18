import { GetGlobalSettingsDocument } from "@/graphql/server/generated";
import { GlobalSetting } from "@/lib/interfaces";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { getServerEnv } from "@/lib/env/env.server";

// Cache the Apollo client instance
let client: ApolloClient<any> | null = null;

/**
 * Get or create the Apollo Client instance using AWS Secrets Manager
 */
async function getClient() {
    if (client) return client;

    const env = await getServerEnv();

    client = new ApolloClient({
        uri: env.HASURA_GRAPHQL_ENDPOINT,
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": env.HASURA_GRAPHQL_ADMIN_SECRET,
        },
        cache: new InMemoryCache()
    });

    return client;
}

const setting_Keys = ['WARP_ACCESS_TOKEN_URL', 'WARP_PLATFORM_ID', 'WARP_PLATFORM_SECRET', 'WARP_GRAPHQL_URL', 'WARP_GRAPHQL_ADMIN_SECRET'];
export async function globalSetting(): Promise<Record<string, string>> {
    const apolloClient = await getClient();
    const result = await apolloClient.query({
        query: GetGlobalSettingsDocument,
        variables: { settingsKey: setting_Keys }
    }).catch(error => {
        console.error('GraphQL query error:', error);
        return null;
    });

  const resultData = result;
  const data = resultData?.data;

  const accessTokenUrl = data.Tbl_GlobalSettings.find(
    (x: GlobalSetting) => x.SettingsKey === "WARP_ACCESS_TOKEN_URL"
  )?.SettingsValue;
  const clientId = data.Tbl_GlobalSettings.find(
    (x: GlobalSetting) => x.SettingsKey === "WARP_PLATFORM_ID"
  )?.SettingsValue;
  const clientSecret = data.Tbl_GlobalSettings.find(
    (x: GlobalSetting) => x.SettingsKey === "WARP_PLATFORM_SECRET"
  )?.SettingsValue;
  const warpGraphqlUrl = data.Tbl_GlobalSettings.find(
    (x: GlobalSetting) => x.SettingsKey === "WARP_GRAPHQL_URL"
  )?.SettingsValue;
  const warpGraphqlAdminSecret = data.Tbl_GlobalSettings.find(
    (x: GlobalSetting) => x.SettingsKey === "WARP_GRAPHQL_ADMIN_SECRET"
  )?.SettingsValue;

  return {
    accessTokenUrl,
    clientId,
    clientSecret,
    warpGraphqlUrl,
    warpGraphqlAdminSecret
  };
}
