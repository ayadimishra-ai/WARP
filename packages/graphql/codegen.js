const path = require("path");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// Function to load environment and return config
async function getConfig() {
  // Load environment from AWS Secrets Manager
  try {
    console.log("Loading secrets from AWS Secrets Manager...");
    const client = new SecretsManagerClient({ region: "ap-south-1" });
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: "snowkap-warp-live",
        VersionStage: "AWSCURRENT",
      }),
    );

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      // Merge secrets into process.env
      Object.entries(secrets).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });
      console.log("✓ Loaded secrets from AWS Secrets Manager");
    }
  } catch (error) {
    console.error("Failed to load secrets:", error);
    // Continue with fallback URL if secrets fail
  }

  const graphqlApiUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
    "https://2bcfdg2um2.ap-south-1.awsapprunner.com/v1/graphql";

  if (!graphqlApiUrl) {
    throw new Error(
      "NEXT_PUBLIC_GRAPHQL_API_URL is not set. Please check your AWS Secrets Manager configuration.",
    );
  }

  /** @type {import("@graphql-codegen/plugin-helpers").Types.Config} */
  const codegenConfig = {
    overwrite: true,
    schema: [
      {
        [graphqlApiUrl]: {
          headers: {
            "x-hasura-admin-secret": process.env["HASURA_GRAPHQL_ADMIN_SECRET"],
          },
        },
      },
    ],
    documents: [
      "./fragments/*.{gql,graphql}",
      "./queries/*.{gql,graphql}",
      "./mutations/*.{gql,graphql}",
      "./subscriptions/*.{gql,graphql}",
    ],
    generates: {
      "./generated/types.ts": {
        plugins: ["typescript", "typescript-operations"],
      },
      "./generated/apollo-helpers.ts": {
        plugins: ["typescript-apollo-client-helpers"],
      },
      "./generated/sdk.ts": {
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
      "./generated": {
        preset: "near-operation-file",
        presetConfig: {
          extension: ".ts",
          baseTypesPath: "types.ts",
          folder: "generated",
        },
        plugins: ["typescript-react-apollo"],
        config: {
          importOperationTypesFrom: "Types",
        },
      },
    },
  };

  return codegenConfig;
}

module.exports = getConfig();
