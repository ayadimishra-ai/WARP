import { secretsManagerService } from "./secrets-manager.service";

/**
 * Loads environment variables from AWS Secrets Manager
 * Always loads secrets from AWS - no conditional flag needed
 * @returns Promise that resolves when environment is loaded
 */
export async function loadEnvironment(): Promise<void> {
    try {
        console.log("Loading secrets from AWS Secrets Manager...");
        const secrets = await secretsManagerService.loadSecretsFromAWS();

        // Merge secrets into process.env (don't overwrite existing platform-set values)
        Object.entries(secrets).forEach(([key, value]) => {
            if (!process.env[key]) {
                process.env[key] = value;
            }
        });

        console.log(`✓ Loaded secrets from AWS Secrets Manager`);
    } catch (error) {
        console.error(
            "Failed to load from AWS Secrets Manager:",
            error
        );
        throw error; // Fail fast if AWS secrets can't be loaded
    }
}
