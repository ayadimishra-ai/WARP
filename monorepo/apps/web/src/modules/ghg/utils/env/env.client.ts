import { z } from "zod";

// const _path = path.resolve(process.cwd(), `.env.${process.env.APP_ENV!}`);

// const out = config({ path: _path });

// console.log({ _path,out });

export const envSchema = z.object({
  // Hasura (public endpoint only)
  NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL: z
    .string()
    .url()
    .default("https://5bjdy5kqr2.ap-south-1.awsapprunner.com/v1/graphql"),
  // App
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("https://smppthkqwy.ap-south-1.awsapprunner.com/ghg"),
  NEXT_PUBLIC_APP_BASE_URL: z
    .string()
    .url()
    .default("https://smppthkqwy.ap-south-1.awsapprunner.com/ghg"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://login.snowkap.com/"),
  NEXT_PUBLIC_SITE_API_BASE_URL: z
    .string()
    .default("https://smppthkqwy.ap-south-1.awsapprunner.com"),
});

const env = envSchema.parse({});

if (!!process.env.NEXT_PUBLIC_APP_BASE_URL) {
    env.NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL + "/ghg";
  }
  if (!!process.env.NEXT_PUBLIC_API_BASE_URL) {
    env.NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/ghg";
  }
  if (!!process.env.NEXT_PUBLIC_SITE_API_BASE_URL) {
    env.NEXT_PUBLIC_SITE_API_BASE_URL = process.env.NEXT_PUBLIC_SITE_API_BASE_URL;
  }
  if (!!process.env.NEXT_PUBLIC_SITE_URL) {
    env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  }

export const clientEnv = env;
