import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import NextAuth, { User as IUser, NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}

// Email/password login is not implemented. Production auth uses JWT accessToken via
// POST /api/v1/platform/auth/signin. This provider exists only as a NextAuth scaffold.
const emailPasswordLoginProvider: Provider = CredentialsProvider({
  id: "email-password-login",
  name: "Login with email and password",
  type: "credentials",
  credentials: {
    email: { label: "Email", placeholder: "example@mail.com", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: () => {
    return null;
  },
});

const tokenMaxAge = 30 * 24 * 60 * 60;

const nextAuthoptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: tokenMaxAge },
  providers: [emailPasswordLoginProvider],
  secret: nextAuthSecret,
  callbacks: {
    jwt: async (params) => {
      const { token, user } = params;
      if (user) {
        return { ...token, ...user };
      }
      return token;
    },
    session: async (params) => {
      const { session, token } = params;
      if (token) {
        session.user = token;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
    error: "auth/error",
  },
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  NextAuth(nextAuthoptions),
  {
    limitInterval: 1,
    maxRequestCount: 30,
    progressiveDelay: true,
  }
);

export const dynamic = "force-dynamic";
