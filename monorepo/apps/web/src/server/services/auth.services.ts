import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "@/types/interface.types";
import { getServerEnv } from "@/lib/env/env.server";

// This needs to be initialized lazily since getServerEnv is async
let mockUsersCache: User[] | null = null;

export async function getMockUsers(): Promise<User[]> {
  if (!mockUsersCache) {
    const env = await getServerEnv();
    mockUsersCache = [
      {
        id: "1",
        email: env.DEFAULT_EMAIL,
        passwordHash: env.DEFAULT_PASSWORD
      }
    ].filter((user) => user.email && user.passwordHash) as User[];
  }
  return mockUsersCache;
}

// Keep this for backwards compatibility, but it's now async

export async function validateCredentials(
  email: string,
  password: string
): Promise<User | null> {
  if (!email || !password) return null;

  const env = await getServerEnv();
  const mockUsers = await getMockUsers();

  if (mockUsers.length === 0) return null;

  const user = mockUsers.find((u) => u.email === email);
  if (!user) return null;

  if (env.SKIP_PASSWORD_CHECK === "true") {
    return user;
  }

  return password === user.passwordHash ? user : null;
}

export async function signJwt(user: User): Promise<{ tokenId: string; expires_in: number }> {
  const env = await getServerEnv();

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const expiresIn = 60 * 60 * 24; // 24 hours in seconds

  const payload = {
    sub: "EwizGreen_Services", // Subject
    jti: crypto.randomUUID(), // Unique token identifier
    iat: now, // Issued at
    nbf: now, // Not before
    exp: now + expiresIn, // Expires in 24 hours (86400 seconds)
    iss: "DemoIssuer", // Issuer
    aud: "DemoAudience", // Audience
    userId: user.id, // Your custom user ID
    email: user.email // Your custom email claim
  };

  const token = jwt.sign(payload, env.JWT_SECRET);

  return {
    tokenId: token,
    expires_in: expiresIn
  };
}
