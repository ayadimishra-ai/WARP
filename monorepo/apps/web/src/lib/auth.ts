import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import * as schema from "./db/auth-schema";
import { jwt, customSession } from "better-auth/plugins";
import { getServerEnv } from "./env/env.server";

// Create auth instance with async initialization
const createAuth = async () => {
  const db = await getDb();
  const env = await getServerEnv();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domains: env.NODE_ENV === "production"
          ? [env.NEXT_PUBLIC_APP_BASE_URL.replace(/^https?:\/\//, '')] // Extract domain from URL
          : ["localhost:5001"],
      },
      defaultCookieAttributes: {
        secure: env.NODE_ENV === "production", // Only HTTPS in production
        httpOnly: true,
        sameSite: "none",
        partitioned: true,
      },
    },
    trustedOrigins: [
      env.NEXT_PUBLIC_API_BASE_URL,
      env.NEXT_PUBLIC_APP_BASE_URL,
      ...(env.NODE_ENV === "development" ? ["http://localhost:5001"] : []),
    ],
    plugins: [
      jwt({
        jwt: {
          issuer: env.NEXT_PUBLIC_API_BASE_URL,
          audience: env.NEXT_PUBLIC_API_BASE_URL,
          expirationTime: "1h",
          getSubject(session) {
            return session.user.id;
          },
          definePayload(session) {
            return {
              sub: session.user.id,
              email: session.user.email,
              name: session.user.name,
            };
          },
        },
      }),
    ],
  });
};

// Export auth instance promise
export const auth = createAuth();
