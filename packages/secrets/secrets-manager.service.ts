import {
    GetSecretValueCommand,
    SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "snowkap-warp-live";
const REGION = "ap-south-1";
const DEFAULT_CACHE_TTL = 300000; // 5 minutes in milliseconds

interface SecretsCache {
    secrets: Record<string, string>;
    timestamp: number;
    ttl: number;
}

class SecretsManagerService {
    private client: SecretsManagerClient;
    private cache: SecretsCache | null = null;

    constructor() {
        this.client = new SecretsManagerClient({
            region: REGION,
        });
    }

    /**
     * Load all secrets from AWS Secrets Manager
     * Returns cached secrets if cache is valid
     */
    async loadSecretsFromAWS(): Promise<Record<string, string>> {
        // Return cached secrets if still valid
        if (this.cache && this.isCacheValid()) {
            console.log("✓ Using cached secrets from AWS Secrets Manager");
            return this.cache.secrets;
        }

        try {
            console.log("Loading secrets from AWS Secrets Manager...");

            const response = await this.client.send(
                new GetSecretValueCommand({
                    SecretId: SECRET_NAME,
                    VersionStage: "AWSCURRENT",
                })
            );

            if (!response.SecretString) {
                throw new Error("Secret value is empty");
            }

            // Parse the JSON string to get all secrets
            const secrets = JSON.parse(response.SecretString) as Record<string, string>;

            // Update cache
            const cacheTTL = this.getCacheTTL();
            this.cache = {
                secrets,
                timestamp: Date.now(),
                ttl: cacheTTL,
            };

            console.log(`✓ Loaded ${Object.keys(secrets).length} secrets from AWS Secrets Manager (cached for ${cacheTTL / 1000}s)`);

            return secrets;
        } catch (error) {
            console.error("Failed to load secrets from AWS Secrets Manager:", error);

            // If we have cached data (even if expired), use it as fallback
            if (this.cache) {
                console.warn("⚠ Using expired cached secrets as fallback");
                return this.cache.secrets;
            }

            throw error;
        }
    }

    /**
     * Get a specific secret value by key
     * Loads from AWS if not cached
     */
    async getSecret(key: string): Promise<string | undefined> {
        const secrets = await this.loadSecretsFromAWS();
        return secrets[key];
    }

    /**
     * Get all secrets
     * Loads from AWS if not cached
     */
    async getAllSecrets(): Promise<Record<string, string>> {
        return await this.loadSecretsFromAWS();
    }

    /**
     * Clear the cache (useful for testing or manual refresh)
     */
    clearCache(): void {
        this.cache = null;
        console.log("Cache cleared");
    }

    /**
     * Check if cache is still valid based on TTL
     */
    private isCacheValid(): boolean {
        if (!this.cache) return false;

        const age = Date.now() - this.cache.timestamp;
        return age < this.cache.ttl;
    }

    /**
     * Get cache TTL from environment variable or use default
     */
    private getCacheTTL(): number {
        const envTTL = process.env.SECRETS_CACHE_TTL;
        if (envTTL) {
            const ttl = parseInt(envTTL, 10);
            if (!isNaN(ttl) && ttl > 0) {
                return ttl * 1000; // Convert seconds to milliseconds
            }
        }
        return DEFAULT_CACHE_TTL;
    }
}

// Export singleton instance
export const secretsManagerService = new SecretsManagerService();
