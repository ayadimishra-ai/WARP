import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { API_BASE_URL } from "@/constants/auth.constants";

// Use process.env for client-side Next.js public variables
const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [nextCookies(), jwt()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
