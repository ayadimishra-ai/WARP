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
            return this.cache.secrets;
        }

        try {
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

            // Update process.env with the secrets (important for other modules relying on process.env)
            Object.entries(secrets).forEach(([key, value]) => {
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            });

            // Update cache
            const cacheTTL = this.getCacheTTL();
            this.cache = {
                secrets,
                timestamp: Date.now(),
                ttl: cacheTTL,
            };

            console.log(`✓ Loaded secrets from AWS Secrets Manager (cached for ${cacheTTL / 1000}s)`);

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
        return secrets[key] || process.env[key];
    }

    /**
     * Synchronously read a secret from the in-memory cache.
     * Returns undefined if the cache has not been populated yet.
     * Use this in sync contexts (e.g. axios interceptors) where awaiting is not possible;
     * the cache is populated by the first await of loadSecretsFromAWS/getSecret/getAllSecrets.
     */
    getCachedSecret(key: string): string | undefined {
        return this.cache?.secrets[key] ?? process.env[key];
    }

    /**
     * Get all secrets
     * Loads from AWS if not cached
     */
    async getAllSecrets(): Promise<Record<string, string>> {
        const secrets = await this.loadSecretsFromAWS();
        return { ...process.env, ...secrets } as Record<string, string>;
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
