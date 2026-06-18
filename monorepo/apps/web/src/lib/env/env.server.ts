import { z } from "zod";
import { getSecrets } from "../util/secrete/secrets-manager.service";

const envSchema = z.object({
  // Public URLs
  NEXT_PUBLIC_API_BASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_BASE_URL: z.string().min(1),

  // Database Configuration
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // Authentication & Encryption
  JWT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  ENCRYPTION_IV: z.string().min(1),

  // Hasura Configuration
  HASURA_GRAPHQL_ENDPOINT: z.string().min(1),
  HASURA_GRAPHQL_ADMIN_SECRET: z.string().min(1),

  // Application Configuration
  WEBSITE_URL: z.string().min(1),
  COMPANY_NAME: z.string().min(1),

  // External Services
  AI_SERVICES_AUTHORIZATION: z.string().min(1),
  RECAPTCHA_SECRET_KEY: z.string().min(1),

  // Development/Auth Configuration
  DEFAULT_EMAIL: z.string().min(1),
  DEFAULT_PASSWORD: z.string().min(1),
  SKIP_PASSWORD_CHECK: z.string().optional().default("false"),
  NODE_ENV: z.string().optional().default("development"),
});

// Server-side environment configuration using AWS Secrets Manager
let serverEnvCache: z.infer<typeof envSchema> | null = null;

/**
 * Get server environment variables from AWS Secrets Manager
 * This is the main function to use in server components and API routes
 */
export const getServerEnv = async (): Promise<z.infer<typeof envSchema>> => {
  if (serverEnvCache) {
    return serverEnvCache;
  }

  const secrets = await getSecrets();

  const serverEnvData = {
    // Public URLs
    NEXT_PUBLIC_API_BASE_URL: secrets.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_BASE_URL: secrets.NEXT_PUBLIC_APP_BASE_URL,

    // Database Configuration
    DB_HOST: secrets.DB_HOST,
    DB_PORT: secrets.DB_PORT,
    DB_USER: secrets.DB_USER,
    DB_PASSWORD: secrets.DB_PASSWORD,
    DB_NAME: secrets.DB_NAME,
    DATABASE_URL: secrets.DATABASE_URL || `postgres://${secrets.DB_USER}:${secrets.DB_PASSWORD}@${secrets.DB_HOST}:${secrets.DB_PORT}/${secrets.DB_NAME}`,

    // Authentication & Encryption
    JWT_SECRET: secrets.JWT_SECRET,
    ENCRYPTION_KEY: secrets.ENCRYPTION_KEY,
    ENCRYPTION_IV: secrets.ENCRYPTION_IV,

    // Hasura Configuration
    HASURA_GRAPHQL_ENDPOINT: secrets.HASURA_GRAPHQL_ENDPOINT,
    HASURA_GRAPHQL_ADMIN_SECRET: secrets.HASURA_GRAPHQL_ADMIN_SECRET,

    // Application Configuration
    WEBSITE_URL: secrets.WEBSITE_URL,
    COMPANY_NAME: secrets.COMPANY_NAME,

    // External Services
    AI_SERVICES_AUTHORIZATION: secrets.AI_SERVICES_AUTHORIZATION,
    RECAPTCHA_SECRET_KEY: secrets.RECAPTCHA_SECRET_KEY,

    // Development/Auth Configuration
    DEFAULT_EMAIL: secrets.DEFAULT_EMAIL,
    DEFAULT_PASSWORD: secrets.DEFAULT_PASSWORD,
    SKIP_PASSWORD_CHECK: secrets.SKIP_PASSWORD_CHECK || "false",
    NODE_ENV: secrets.NODE_ENV || "development",
  };

  const _env = envSchema.safeParse(serverEnvData);

  if (_env.success === false) {
    console.error("Invalid server environment variables:", _env.error.format());
    throw new Error("Invalid server environment variables");
  }

  serverEnvCache = _env.data;
  return serverEnvCache;
};

/**
 * Clear the server environment cache (useful for testing)
 */
export const clearServerEnvCache = (): void => {
  serverEnvCache = null;
};
