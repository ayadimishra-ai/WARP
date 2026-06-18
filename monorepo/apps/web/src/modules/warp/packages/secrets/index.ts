import { secretsManagerService } from "./secrets-manager.service";

export { secretsManagerService } from "./secrets-manager.service";
export { loadEnvironment } from "./load-environment";

/**
 * Load all secrets from AWS Secrets Manager
 * This is the main function to call at application startup
 */
export async function loadSecretsFromAWS(): Promise<Record<string, string>> {
    return await secretsManagerService.loadSecretsFromAWS();
}

/**
 * Get a specific secret by key
 */
export async function getSecret(key: string): Promise<string | undefined> {
    return await secretsManagerService.getSecret(key);
}


/**
 * Get all secrets
 */
export async function getAllSecrets(): Promise<Record<string, string>> {
    return await secretsManagerService.getAllSecrets();
}

/**
 * Clear the secrets cache (useful for testing or manual refresh)
 */
export function clearSecretsCache(): void {
    secretsManagerService.clearCache();
}
