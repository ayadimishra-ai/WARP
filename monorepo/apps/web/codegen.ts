import { getServerEnv } from "./src/lib/env/env.server";
import type { CodegenConfig } from "@graphql-codegen/cli";

const createConfig = async (): Promise<CodegenConfig> => {
  const serverEnv = await getServerEnv();
  // console.log({ serverEnv });

  return {
    schema: {
      [serverEnv.HASURA_GRAPHQL_ENDPOINT]: {
        headers: {
          "x-hasura-admin-secret": serverEnv.HASURA_GRAPHQL_ADMIN_SECRET
        }
      }
    },
    documents: [
      "src/graphql/queries/*.gql",
      "src/graphql/queries/*.graphql",
      "src/graphql/mutations/*.gql"
    ],
    hooks: {
      // afterAllFileWrite: [
      //   "prettier --write src/graphql/**/*.generated.tsx src/graphql/types.ts src/graphql/server/generated.ts --ignore-unknown || true",
      // ],
    },
    generates: {
      "./src/graphql/types.ts": {
        plugins: ["typescript"]
      },
      "./src/graphql": {
        preset: "near-operation-file",
        presetConfig: {
          extension: ".generated.tsx",
          baseTypesPath: "types.ts"
        },
        plugins: ["typescript-operations", "typescript-react-apollo"],
        config: {
          reactApolloVersion: 3,
          withMutationFn: true,
          useTypeImports: true
        }
      },
      "./src/graphql/server/generated.ts": {
        plugins: [
          "typescript",
          "typescript-operations",
          "typescript-graphql-request"
        ],
        config: {}
      }
    }
  };
};

export default createConfig();
