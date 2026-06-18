import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string(),
  NEXT_PUBLIC_APP_BASE_URL: z.string(),
  HASURA_GRAPHQL_ENDPOINT: z.string(), // Use same endpoint as server
});

// Client-side environment configuration
// NOTE: Client environment variables should be passed from server components
// as AWS Secrets Manager cannot be accessed directly from the browser

let clientEnvCache: z.infer<typeof envSchema> | null = null;

/**
 * Get client environment variables 
 * 
 * WARNING: This function should NOT be called directly in browser components.
 * Instead, environment variables should be passed from server components as props.
 * 
 * This function is kept for server-side usage only (like in layout.tsx)
 */
export const getClientEnv = async (): Promise<z.infer<typeof envSchema>> => {
  // In browser environment, throw a helpful error
  if (typeof window !== 'undefined') {
    throw new Error(`
      getClientEnv() cannot be called in the browser. 
      AWS Secrets Manager requires server-side credentials.
      
      Solutions:
      1. Call this function only in server components
      2. Pass the environment variables as props from server to client components
      3. Use Next.js public environment variables (NEXT_PUBLIC_*) for browser access
    `);
  }

  if (clientEnvCache) {
    return clientEnvCache;
  }

  // This should only run on the server
  const { getSecrets } = await import("../util/secrete/secrets-manager.service");
  const secrets = await getSecrets();

  const clientEnvData = {
    NEXT_PUBLIC_API_BASE_URL: secrets.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_BASE_URL: secrets.NEXT_PUBLIC_APP_BASE_URL,
    HASURA_GRAPHQL_ENDPOINT: secrets.HASURA_GRAPHQL_ENDPOINT,
  };

  const _env = envSchema.safeParse(clientEnvData);

  if (_env.success === false) {
    console.error("Invalid client environment variables:", _env.error.format());
    throw new Error("Invalid client environment variables");
  }

  clientEnvCache = _env.data;
  return clientEnvCache;
};

/**
 * Clear the client environment cache (useful for testing)
 */
export const clearClientEnvCache = (): void => {
  clientEnvCache = null;
};
