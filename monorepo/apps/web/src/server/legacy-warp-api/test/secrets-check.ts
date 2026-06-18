// Test API route to verify secrets are loaded
import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { secretsManagerService } from "@/modules/warp/packages/secrets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Guard: this route exposes secret presence metadata — require the
    // internal shared key before responding.
    const expectedKey = process.env["WARP_INTERNAL_SHARED_KEY"];
    const incomingKey = req.headers["x-warp-shared-key"];
    if (
        !expectedKey ||
        typeof incomingKey !== "string" ||
        !incomingKey ||
        !crypto.timingSafeEqual(Buffer.from(incomingKey), Buffer.from(expectedKey))
    ) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Read directly from the WARP secrets cache. The legacy `serverEnv`
        // export from `@/modules/warp/env/env` captures `_env` synchronously
        // at module evaluation, before the async loader resolves, so it is
        // always null — that path was the source of the previous
        // "Cannot read properties of null" failure.
        const env = await secretsManagerService.loadSecretsFromAWS();

        const secretsStatus = {
            hasNextAuthSecret: !!env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length > 0,
            hasHasuraAdminSecret: !!env.HASURA_GRAPHQL_ADMIN_SECRET && env.HASURA_GRAPHQL_ADMIN_SECRET.length > 0,
            hasHasuraJWTSecret: !!env.HASURA_GRAPHQL_JWT_SECRET && env.HASURA_GRAPHQL_JWT_SECRET.length > 0,
            hasEmailPassword: !!env.EMAIL_SMTP_PASSWORD && env.EMAIL_SMTP_PASSWORD.length > 0,
            hasS3AccessKey: !!env.S3_BUCKET_ACCESS_KEY && env.S3_BUCKET_ACCESS_KEY.length > 0,
            hasS3SecretKey:
                (!!env.S3_BUCKET_SECRET_ACCESS_KEY && env.S3_BUCKET_SECRET_ACCESS_KEY.length > 0) ||
                (!!env.S3_BUCKET_ACCESS_KEY_SECRET && env.S3_BUCKET_ACCESS_KEY_SECRET.length > 0),
        };

        const allSecretsLoaded = Object.values(secretsStatus).every((status) => status === true);

        res.status(200).json({
            success: allSecretsLoaded,
            message: allSecretsLoaded
                ? "✅ All secrets loaded successfully from AWS Secrets Manager"
                : "⚠ Some secrets are missing",
            secretsStatus,
            // Useful for debugging upload-flow bucket mix-ups: report the
            // bucket the WARP secret resolves to (and what process.env
            // currently holds, which the GHG/OPs loader may have clobbered).
            warpBucketFromSecret: env.S3_BUCKET ?? null,
            warpBucketRegionFromSecret: env.S3_BUCKET_REGION ?? null,
            processEnvS3Bucket: process.env.S3_BUCKET ?? null,
            processEnvS3Region: process.env.S3_BUCKET_REGION ?? null,
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
