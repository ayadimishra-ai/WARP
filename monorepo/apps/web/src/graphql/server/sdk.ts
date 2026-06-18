import { GraphQLClient, type RequestDocument, type Variables, type RequestOptions } from "graphql-request";
import { getSdk, SdkFunctionWrapper } from "./generated";
import { getServerEnv } from "@/lib/env/env.server";

// Cache the SDK instance
let cachedSdk: ReturnType<typeof getSdk> | null = null;

/**
 * Get or create the GraphQL SDK instance using AWS Secrets Manager
 * This function fetches configuration from AWS Secrets Manager at runtime and caches the SDK instance
 * 
 * @returns Promise<SDK> - The GraphQL SDK instance
 * @example
 * const sdk = await getSdkInstance();
 * const result = await sdk.GetUser({ id: "123" });
 */
export const getSdkInstance = async () => {
  if (cachedSdk) return cachedSdk;

  const env = await getServerEnv();

  // Initialize the client with the endpoint and headers from AWS Secrets Manager
  const client = new GraphQLClient(env.HASURA_GRAPHQL_ENDPOINT, {
    headers: {
      "x-hasura-admin-secret": env.HASURA_GRAPHQL_ADMIN_SECRET,
      "Content-Type": "application/json",
    },
  });

  // Store the original request method
  const originalRequest = client.request.bind(client);

  // Override the request method with our implementation
  client.request = async <T, V extends Variables = Variables>(
    documentOrOptions: RequestDocument | RequestOptions<V, any>,
    ...variablesAndRequestHeaders: any[]
  ): Promise<T> => {
    const startTime = Date.now();

    // Handle both object and string-style requests
    const isObjectRequest = typeof documentOrOptions === 'object' && 'document' in documentOrOptions;
    const document = isObjectRequest
      ? (documentOrOptions as RequestOptions<V, any>).document
      : documentOrOptions as RequestDocument;

    const variables = isObjectRequest
      ? (documentOrOptions as RequestOptions<V, any>).variables
      : variablesAndRequestHeaders[0];

    const requestHeaders = isObjectRequest
      ? (documentOrOptions as RequestOptions<V, any>).requestHeaders
      : variablesAndRequestHeaders[1];

    const operationName = typeof document === 'string'
      ? document.split('{')[0].trim()
      : 'anonymous';

    try {
      console.log(`GraphQL Request [${operationName}]:`, {
        variables: JSON.stringify(variables || {})
      });

      // Add timeout handling
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const requestOptions = {
          document,
          variables,
          requestHeaders: {
            ...(requestHeaders || {}),
            signal: controller.signal,
          },
        };

        const result = await originalRequest<T>(requestOptions);

        const duration = Date.now() - startTime;
        console.log(`GraphQL Request [${operationName}] completed in ${duration}ms`);

        return result;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.response?.errors?.[0]?.message || error.message;

      console.error(`GraphQL Request [${operationName}] failed after ${duration}ms:`, {
        error: errorMessage,
        operation: operationName,
        variables: JSON.stringify(variables || {}),
        stack: error.stack
      });

      throw new Error(`GraphQL request failed: ${errorMessage}`);
    }
  };

  const clientWrapper: SdkFunctionWrapper = async <T>(
    action: () => Promise<T>,
    operationName: string,
    operationType: string | undefined,
    variables: any
  ): Promise<T> => {
    const startTime = Date.now();

    try {
      console.log(`Executing ${operationType} operation: ${operationName}`, {
        variables: JSON.stringify(variables || {})
      });

      const result = await action();

      const duration = Date.now() - startTime;
      console.log(`Operation ${operationName} completed in ${duration}ms`);

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`Error in operation ${operationName} after ${duration}ms:`, {
        error: error.message,
        operationType,
        operationName,
        stack: error.stack
      });

      throw error;
    }
  };

  cachedSdk = getSdk(client, clientWrapper);
  return cachedSdk;
};

/**
 * @deprecated Use getSdkInstance() instead for proper async initialization with AWS Secrets Manager
 * This export is kept for backward compatibility but will throw an error if accessed directly
 */
export const sdk = new Proxy({} as ReturnType<typeof getSdk>, {
  get() {
    throw new Error(
      'Direct SDK access is no longer supported. Use "await getSdkInstance()" to properly initialize with AWS Secrets Manager.'
    );
  }
});
