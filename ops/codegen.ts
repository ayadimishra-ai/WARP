import type { CodegenConfig } from "@graphql-codegen/cli";
import { getServerEnv } from "./utils/env/env.server";

const config = (async () => {
  const serverEnv = await getServerEnv();

  return {
    overwrite: true,
    schema: serverEnv.NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL,
    config: {
      headers: {
        "X-Hasura-Admin-Secret": serverEnv.HASURA_ADMIN_SECRET,
      },
    },
    documents: [
      "./graphql/queries/**/*.gql",
      "./graphql/mutations/**/*.gql",
      "./graphql/subscriptions/**/*.gql",
    ],
    generates: {
      "./graphql/shared/types.ts": {
        plugins: ["typescript", "typescript-operations"],
      },
      "./graphql": {
        preset: "near-operation-file",
        presetConfig: {
          extension: ".generated.tsx",
          baseTypesPath: "./shared/types.ts",
        },
        plugins: ["typescript-operations", "typescript-react-apollo"],
      },
      "./graphql/shared/sdk.ts": {
        preset: "import-types",
        presetConfig: {
          typesPath: "./types",
          importTypesNamespace: "types",
        },
        plugins: ["typescript-graphql-request"],
        config: {
          importOperationTypesFrom: "types",
        },
      },
    },
    emitLegacyCommonJSImports: false,
    ignoreNoDocuments: true,
  } as CodegenConfig;
})();

export default config;
