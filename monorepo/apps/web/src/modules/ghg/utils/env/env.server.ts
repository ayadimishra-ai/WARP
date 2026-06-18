import { z } from "zod";
import loadSecrets from "../../scripts/load-secrets";

export const ServerEnvSchema = z
  .object({
    /* ───────────────── Hasura ───────────────── */
    NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL: z.string().url(),
    HASURA_ADMIN_SECRET: z.string().min(1),
    HASURA_JWT_SECRET: z.string().min(32),

    /* ───────────────── Database ─────────────── */
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),

    /* ───────────────── App ──────────────────── */
    NEXT_PUBLIC_API_BASE_URL: z.string().url().transform((url) => url+"/ghg"),
    NEXT_PUBLIC_APP_BASE_URL: z.string().url().transform((url) => url+"/ghg"),
    NEXT_PUBLIC_SITE_URL: z.string().url(),

    /* ───────────────── AWS S3 ───────────────── */
    S3_BUCKET: z.string().min(1),
    S3_BUCKET_REGION: z.string().min(1),
    S3_BUCKET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_ACCESS_KEY_SECRET: z.string().min(1),
    S3_PUBLIC_BASE_URL: z.string().url(),

    /* ───────────────── ClickHouse ───────────── */
    CLICKHOUSE_HOST: z.string().min(1),
    CLICKHOUSE_USER: z.string().min(1),
    CLICKHOUSE_PASSWORD: z.string().min(1),

    /* ───────────────── SK Services ───────────── */
    NEXT_PUBLIC_SITE_API_BASE_URL: z.string().min(1).url().transform((url) => url+"/ghg"),
    SK_SERVICES_AUTH_TOKEN: z.string().min(1),

    /* ───────────────── Email / SMTP ─────────── */
    EMAIL_SMTP_HOST: z.string().min(1),
    EMAIL_SMTP_PORT: z.coerce.number().int().positive(),
    EMAIL_SMTP_SECURE: z.coerce.boolean(),
    EMAIL_SMTP_USER: z.string().min(1),
    EMAIL_SMTP_PASSWORD: z.string().min(1),
    EMAIL_FROM_EMAIL: z.string().email(),

    /* ───────────────── Affinda ──────────────── */
    AFFINDA_API_URL: z.string().url(),
    AFFINDA_API_KEY: z.string().min(1),
    AFFINDA_WORKSPACE_ID: z.string().min(1),
    AFFINDA_WEBHOOK_SIGNATURE_KEY: z.string().min(1),
    AFFINDA_ORGANIZATION_ID: z.string().min(1),

    /* ───────────────── Other ───────────────── */
    SUREPASS_API_KEY: z.string().min(1).default("demo-test-key"),

    /* ───────────────── CRON ────────────────── */
    // Shared secret for external CRON service authentication.
    CRON_SECRET: z.string().min(16),
  })
  .transform((env) => ({
    ...env,
 DATABASE_URL: `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}?sslmode=require`
  }));
 
  // .transform((env) => ({
  //   ...env,
  //   DATABASE_URL: `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
  // }));

type ServerEnv = z.infer<typeof ServerEnvSchema>;

declare global {
  // eslint-disable-next-line no-var
  var __SERVER_ENV__: ServerEnv | undefined;
}

async function loadFromSecretsManager(): Promise<ServerEnv> {
  const secrets = await loadSecrets();
  const serverEnv = ServerEnvSchema.safeParse(secrets);

  if (!serverEnv.success) {
    console.log("serverEnv", JSON.stringify(serverEnv.error, null, 2));
    throw new Error("Server environment variables are not defined");
  }
  return serverEnv.data;
}

export async function getEnv(): Promise<ServerEnv> {
  if (global.__SERVER_ENV__) {
    return global.__SERVER_ENV__;
  }

  const env = await loadFromSecretsManager();

  global.__SERVER_ENV__ = env;
  return env;
}

export const getServerEnv = async () => {
  const env = await getEnv();
  // console.log({ env });
  // console.log("OP Env",{ env });

  if (!!process.env.NEXT_PUBLIC_APP_BASE_URL) {
    env.NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;
  }
  if (!!process.env.NEXT_PUBLIC_API_BASE_URL) {
    env.NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (!!process.env.NEXT_PUBLIC_SITE_API_BASE_URL) {
    env.NEXT_PUBLIC_SITE_API_BASE_URL = process.env.NEXT_PUBLIC_SITE_API_BASE_URL;
  }
  if (!!process.env.NEXT_PUBLIC_SITE_URL) {
    env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  }

  return env;
};
