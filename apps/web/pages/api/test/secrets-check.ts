// Test API route to verify secrets are loaded
import type { NextApiRequest, NextApiResponse } from "next";
import { serverEnv } from "../../../env/env";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const incomingKey = req.headers["x-warp-shared-key"];
    if (!incomingKey || String(incomingKey) !== process.env.WARP_CRON_SHARED_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        // Check if critical secrets are loaded
        const secretsStatus = {
            hasNextAuthSecret: !!serverEnv.NEXTAUTH_SECRET && serverEnv.NEXTAUTH_SECRET.length > 0,
            hasHasuraAdminSecret: !!serverEnv.HASURA_GRAPHQL_ADMIN_SECRET && serverEnv.HASURA_GRAPHQL_ADMIN_SECRET.length > 0,
            hasHasuraJWTSecret: !!serverEnv.HASURA_GRAPHQL_JWT_SECRET && serverEnv.HASURA_GRAPHQL_JWT_SECRET.length > 0,
            hasEmailPassword: !!serverEnv.EMAIL_SMTP_PASSWORD && serverEnv.EMAIL_SMTP_PASSWORD.length > 0,
            hasS3AccessKey: !!serverEnv.S3_BUCKET_ACCESS_KEY && serverEnv.S3_BUCKET_ACCESS_KEY.length > 0,
            hasS3SecretKey: !!serverEnv.S3_BUCKET_ACCESS_KEY_SECRET && serverEnv.S3_BUCKET_ACCESS_KEY_SECRET.length > 0,
        };

        const allSecretsLoaded = Object.values(secretsStatus).every((status) => status === true);

        res.status(200).json({
            success: allSecretsLoaded,
            message: allSecretsLoaded
                ? "✅ All secrets loaded successfully from AWS Secrets Manager"
                : "⚠ Some secrets are missing",
            secretsStatus,
            totalSecrets: Object.keys(secretsStatus).length,
            loadedSecrets: Object.values(secretsStatus).filter((s) => s).length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "❌ Error checking secrets",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
