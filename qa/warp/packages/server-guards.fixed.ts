// FIXED: packages/server/guards/api-hasura-webhook-guard.ts
//
// [CRITICAL] Hardcoded webhook secret `AUTH_KEY` committed in source code.
//   Any developer or CI system with repo access has the key. Fix: env var.
// [HIGH] `req.headers["authorization"] !== AUTH_KEY` — timing-unsafe string
//   comparison. Fix: crypto.timingSafeEqual() for constant-time comparison.

import { CustomError } from "@warp/shared/utils/custom-error.util";
import { NextApiHandler } from "next";
import { timingSafeEqual } from "crypto";

// FIX: Read from environment variable — not hardcoded in source.
// Set HASURA_WEBHOOK_SECRET in the deployment environment (AWS Secrets Manager,
// Vercel env vars, etc.) to a long random string.
const getWebhookSecret = (): string => {
  const secret = process.env.HASURA_WEBHOOK_SECRET;
  if (!secret) {
    // Crash loudly at startup if the secret is missing — better than silently
    // serving unauthenticated webhook calls.
    throw new Error("HASURA_WEBHOOK_SECRET environment variable is not configured");
  }
  return secret;
};

type ApiErrorGuardType = (handler: NextApiHandler) => NextApiHandler;

const ApiHasuraWebhookGuard: ApiErrorGuardType =
  (handler) => async (req, res) => {
    if (!handler)
      throw CustomError({
        code: 500,
        message: "Invalid error guard implementation.",
      });

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw CustomError({ code: 401, message: "Unauthorized" });
    }

    const webhookSecret = getWebhookSecret();

    // FIX: Use timingSafeEqual to prevent timing attacks.
    // String !== comparison reveals the position of the first differing character
    // through response-time differences, enabling key enumeration.
    const incoming = Buffer.from(String(authHeader));
    const expected = Buffer.from(webhookSecret);
    const isValid =
      incoming.length === expected.length &&
      timingSafeEqual(incoming, expected);

    if (!isValid) {
      throw CustomError({ code: 401, message: "Unauthorized" });
    }

    return await handler(req, res);
  };

export default ApiHasuraWebhookGuard;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: packages/server/guards/api-method.guard.ts
// [LOW] Remove console.log on every request — production log pollution
// ─────────────────────────────────────────────────────────────────────────────

// import { NextApiHandler } from "next";
// import { ApiMethodType } from "@warp/shared/constants/api.constants";
// import { CustomError } from "@warp/shared/utils/custom-error.util";
//
// type WithApiMethodType = (
//   handler: NextApiHandler,
//   method: ApiMethodType[] | ApiMethodType
// ) => NextApiHandler;
//
// const ApiMethodGuard: WithApiMethodType =
//   (handler, method = "GET") =>
//   async (req, res) => {
//     if (!handler || !req.method)
//       throw CustomError({ code: 400, message: "Bad request" });
//
//     let isValid = Array.isArray(method)
//       ? method.map((m) => m.toLowerCase()).includes(req.method?.toLowerCase())
//       : method.toLowerCase() === req.method?.toLowerCase();
//
//     // FIX: Removed console.log({ method, req: req.method, isValid })
//     // — production log pollution on every API call
//
//     if (!isValid) throw CustomError({ statusCode: 404, message: "Not found" });
//     return await handler(req, res);
//   };
//
// export default ApiMethodGuard;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: packages/server/guards/embedded-auth-guard.ts
// [MEDIUM] jwt.decode() before jwt.verify() — unnecessary double-decode.
//   The guard ultimately calls jwt.verify() before accepting the session (good),
//   but the initial jwt.decode() allows any crafted JWT with any platformId
//   to trigger a DB lookup. Simplified to verify first, then use the payload.
// ─────────────────────────────────────────────────────────────────────────────

// import { sdk } from "@warp/graphql/generated/server";
// import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
// import jwt from "jsonwebtoken";
// import { GetServerSideProps } from "next";
//
// export const embeddedAuthGuard: GetServerSideProps = async (context) => {
//   try {
//     const accessToken = String(context.query.accessToken);
//     const secret = process.env["HASURA_GRAPHQL_JWT_SECRET"] ?? "";
//
//     // FIX: verify first — jwt.verify() also returns the decoded payload.
//     // Previously jwt.decode() (no signature check) was called first, allowing
//     // any crafted JWT to trigger a DB lookup for the embedded platformId.
//     let verifiedPayload: any;
//     try {
//       verifiedPayload = jwt.verify(accessToken, secret);
//     } catch {
//       return { props: { session: null } };
//     }
//
//     const session = parseHasuraClaims(verifiedPayload, accessToken);
//     const platformId: any = session?.platform?.id;
//
//     const results = await sdk.getPlatformApikeyByPlatformIdAndOrigin({ platformId });
//     const platform = results?.Platform[0];
//
//     if (platform) {
//       return { props: { session } };
//     }
//   } catch (e) {
//     console.log(e);
//   }
//
//   return { props: { session: null } };
// };
