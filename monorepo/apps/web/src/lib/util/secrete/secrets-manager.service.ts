import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

/**
 * AWS Secrets Manager Service
 *
 * This service fetches secrets from AWS Secrets Manager and caches them in memory.
 * ALL configuration is loaded from AWS Secrets Manager - no local env files.
 *
 * Usage:
 * 1. Set AWS_SECRETS_NAME and AWS_REGION environment variables (only for AWS connection)
 * 2. Call `await getSecrets()` to get all secrets as an object
 * 3. All application configuration comes from AWS Secrets Manager
 */

// Type definition for the expected secret structure
export interface AppSecrets {
    // Client-side public variables (these will still be prefixed with NEXT_PUBLIC_)
    NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_APP_BASE_URL: string;

    // Server-side database credentials
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;

    // Authentication & Encryption
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    ENCRYPTION_IV: string;

    // Hasura Configuration
    HASURA_GRAPHQL_ENDPOINT: string;
    HASURA_GRAPHQL_ADMIN_SECRET: string;

    // Application URLs & Configuration
    WEBSITE_URL: string;
    COMPANY_NAME: string;

    // External Services
    AI_SERVICES_AUTHORIZATION: string;
    RECAPTCHA_SECRET_KEY: string;

    // Development/Auth Configuration
    DEFAULT_EMAIL: string;
    DEFAULT_PASSWORD: string;
    SKIP_PASSWORD_CHECK?: string; // Optional with default
    NODE_ENV?: string; // Optional with default

    // AWS Configuration (for connecting to Secrets Manager)
    AWS_REGION?: string;
    AWS_SECRETS_NAME?: string;

    // Computed values
    DATABASE_URL?: string;

    WARP_ACCESS_TOKEN_URL?: string;
}

// Cached secrets instance
let cachedSecrets: AppSecrets | null = null;

// Secrets Manager client instance
let secretsClient: SecretsManagerClient | null = null;

/**
 * Get or create the Secrets Manager client
 */
const getSecretsClient = (): SecretsManagerClient => {
    if (!secretsClient) {

        const region = "ap-south-1";
        secretsClient = new SecretsManagerClient({ region });
    }
    return secretsClient;
};

/**
 * Fetch secrets from AWS Secrets Manager - THE ONLY SOURCE OF CONFIGURATION
 */
const fetchSecretsFromAWS = async (): Promise<AppSecrets> => {

    const secretName = "snowkap-monorepo-live";

    const client = getSecretsClient();

    const command = new GetSecretValueCommand({
        SecretId: secretName,
    });

    try {
        const response = await client.send(command);

        if (!response.SecretString) {
            throw new Error(`Secret ${secretName} does not contain a string value`);
        }

        const secrets = JSON.parse(response.SecretString) as AppSecrets;

        // Compute DATABASE_URL from individual components if not provided
        if (!secrets.DATABASE_URL && secrets.DB_HOST) {
            secrets.DATABASE_URL = `postgres://${secrets.DB_USER}:${secrets.DB_PASSWORD}@${secrets.DB_HOST}:${secrets.DB_PORT}/${secrets.DB_NAME}`;
        }

        //         APP_ENV=live
        // WEBSITE_URL="http://localhost:3001"
        // NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
        // NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"
        // WARP_ACCESS_TOKEN_URL="http://localhost:3000"

        if (process.env.WEBSITE_URL!)
            secrets.WEBSITE_URL = process.env.WEBSITE_URL;
        
        if (process.env.NEXT_PUBLIC_API_BASE_URL!)
            secrets.NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (process.env.NEXT_PUBLIC_APP_BASE_URL!)
            secrets.NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;
        
        if (process.env.WARP_ACCESS_TOKEN_URL!)
            secrets.WARP_ACCESS_TOKEN_URL = process.env.WARP_ACCESS_TOKEN_URL

        return secrets;
    } catch (error) {
        console.error("Failed to fetch secrets from AWS Secrets Manager:", error);
        console.error("Make sure AWS credentials are configured and the secret exists");
        throw new Error(`Failed to load configuration from AWS Secrets Manager: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Get all secrets - fetches from AWS Secrets Manager ONLY
 *
 * This function caches the secrets in memory after the first fetch.
 * NO FALLBACK - AWS Secrets Manager is the single source of truth.
 */
export const getSecrets = async (): Promise<AppSecrets> => {
    // Return cached secrets if available
    if (cachedSecrets) {
        return cachedSecrets;
    }

    // Fetch from AWS Secrets Manager - this is the ONLY source
    cachedSecrets = await fetchSecretsFromAWS();
    return cachedSecrets;
};

/**
 * Get a single secret value by key
 *
 * @param key - The secret key to retrieve
 * @returns The secret value
 */
export const getSecret = async <K extends keyof AppSecrets>(
    key: K
): Promise<AppSecrets[K]> => {
    const secrets = await getSecrets();
    return secrets[key];
};

/**
 * Clear the cached secrets (useful for testing or forced refresh)
 */
export const clearSecretsCache = (): void => {
    cachedSecrets = null;
};

/**
 * Preload secrets into cache
 * Call this at application startup to ensure secrets are loaded before first use
 */
export const preloadSecrets = async (): Promise<void> => {
    await getSecrets();
};
