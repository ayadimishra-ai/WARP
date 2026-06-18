import { loadEnvironment } from "@warp/secrets";
import { z } from "zod";

// Wait for environment to load
let _env: any = null;
let _loading: Promise<any> | null = null;

// Start loading immediately
const loadEnv = async () => {
    if (_env) return _env; // Already loaded
    if (_loading) return _loading; // Already loading

    _loading = (async () => {
        try {
            await loadEnvironment();

            const envSchema = z
                .object({
                    // GraphQL
                    NEXT_PUBLIC_GRAPHQL_API_URL: z.string().min(1),
                    HASURA_GRAPHQL_ADMIN_SECRET: z.string().min(1),
                    HASURA_GRAPHQL_JWT_SECRET: z.string().min(1),
                    // APP
                    NEXTAUTH_URL: z.string().min(1),
                    NEXTAUTH_SECRET: z.string().min(1),
                    NEXT_PUBLIC_API_BASE_URL: z.string().min(1),
                    //SMTP
                    EMAIL_SMTP_HOST: z.string().min(1),
                    EMAIL_SMTP_PORT: z.string().min(1),
                    EMAIL_SMTP_SECURE: z.string().min(1),
                    EMAIL_SMTP_USER: z.string().min(1),
                    EMAIL_SMTP_PASSWORD: z.string().min(1),

                    // AWS S3
                    S3_BUCKET: z.string().min(1),
                    S3_BUCKET_REGION: z.string().min(1),
                    S3_BUCKET_ACCESS_KEY: z.string().min(1),
                    S3_BUCKET_SECRET_ACCESS_KEY: z.string().min(1),

                    NEXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
                    NEXT_PUBLIC_SITE_API_BASE_URL: z
                        .string()
                        .default("https://z8ss5gerr8.ap-south-1.awsapprunner.com"),
                    SK_SERVICES_AUTH_TOKEN: z.string().min(1).default("EzqUt3IXQxidMdRA"),
                })
                .transform((env: any) => ({
                    ...env,
                    DATABASE_URL: `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
                }));

            _env = envSchema.parse(process.env);
            console.log("✓ Environment variables loaded and validated");
            return _env;
        } catch (error) {
            console.error("Failed to load environment:", error);
            throw error;
        }
    })();

    return _loading;
};

// Start loading immediately when module is imported
loadEnv();

export const serverEnv = _env;
export { loadEnv };

