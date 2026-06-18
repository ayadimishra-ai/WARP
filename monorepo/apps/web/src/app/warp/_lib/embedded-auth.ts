import jwt from "jsonwebtoken";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import type { AuthSessionType } from "@/modules/warp/packages/shared/types/auth.types";
import { secretsManagerService } from "@/modules/warp/packages/secrets";

export type WarpEmbedResult = { session: AuthSessionType | null };

const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

const normalizeAccessToken = (raw: string | undefined | null): string | null => {
  if (raw === undefined || raw === null) return null;
  let token = String(raw).trim();
  if (!token || token === "undefined" || token === "null") return null;

  // Strip Bearer/JWT scheme prefix (case-insensitive) if the SPA forwards the header value verbatim.
  token = token.replace(/^(bearer|jwt)\s+/i, "").trim();

  // The SPA may URL-encode the token; decode only if it still looks encoded.
  if (token.includes("%")) {
    try {
      token = decodeURIComponent(token);
    } catch {
      // leave as-is; the shape check below will reject it
    }
  }

  // Final guard: must look like a compact JWS (three base64url segments).
  if (!JWT_SHAPE.test(token)) return null;
  return token;
};

export async function runEmbeddedAuthGuard(
  accessToken: string | undefined | null
): Promise<WarpEmbedResult> {
  const token = normalizeAccessToken(accessToken);
  if (!token) return { session: null };

  try {
    const decoded = jwt.decode(token);
    if (!decoded) return { session: null };

    const session = parseHasuraClaims(decoded as any, token);
    const platformId = session?.platform?.id;
    if (!platformId) return { session: null };

    const results = await sdk.getPlatformApikeyByPlatformIdAndOrigin({ platformId: platformId as any });
    const platform = results?.Platform?.[0];
    if (!platform) return { session: null };

    const HASURA_GRAPHQL_JWT_SECRET = await secretsManagerService
      .getAllSecrets()
      .then((secrets) => secrets["HASURA_GRAPHQL_JWT_SECRET"]);
    const secret = HASURA_GRAPHQL_JWT_SECRET ?? "";
    if (!secret) {
      console.warn("WARP embedded-auth: missing HASURA_GRAPHQL_JWT_SECRET");
      return { session: null };
    }

    try {
      const verified = jwt.verify(token, secret);
      if (!verified) return { session: null };
    } catch (verifyError) {
      console.warn("WARP embedded-auth: token verify failed", (verifyError as Error)?.message);
      return { session: null };
    }

    return { session };
  } catch (e) {
    console.warn("WARP embedded-auth: unexpected failure", e);
    return { session: null };
  }
}
