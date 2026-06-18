import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import NextAuth, { User as IUser, NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

const emailPasswordLoginProvider: Provider = CredentialsProvider({
  id: "email-password-login",
  name: "Login with email and password",
  type: "credentials",
  credentials: {
    email: {
      label: "Email",
      placeholder: "example@mail.com",
      type: "email",
    },
    password: { label: "Password", type: "password" },
  },
  authorize: (credentials, req) => {
    // console.log("CredentialsProvider:authorize", { credentials });

    return null;
  },
});

const tokenMaxAge = 30 * 24 * 60 * 60;

// const jwtAuth = {
//   async encode(secret, maxAge, claims: JWT) {

//           const jwtClaims = {
//             sub: claims?.id,
//             name: claims?.name,
//             email: claims?.email,
//             iat: Date.now() / 1000,
//             exp: Math.floor(Date.now() / 1000) + (maxAge ?? 30 * 24 * 60 * 60),
//             "https://hasura.io/jwt/claims": {
//               "x-hasura-allowed-roles": claims?.roles ?? [],
//               "x-hasura-default-role": claims?.id,
//               "x-hasura-role": claims?.id,
//               "x-hasura-user-id": claims?.user?.id,
//             },
//           };
//           const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: "HS256" });
//           return encodedToken;
//         },
//         decode({ secret, token }) {
//           if (!token) return null;

//           const decodedToken = jwt.verify(token, secret, { algorithms: ["HS256"] });
//           return decodedToken as any;
//         },
//       },
// }

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
        // const accessToken = jwt.sign(token, nextAuthSecret, {
        //   algorithm: "HS256",
        // });

        // session.accessToken = accessToken;
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

// export default NextAuth({
//   // Configure one or more authentication providers

//   providers: [],
//   callbacks: {
//     jwt: async (params) => {
//       console.log("callback:jwt", params);

//       const { token, user, account } = params;

//       if (user) {
//         token.user = user;
//       }

//       return token;
//     },
//     session: async ({ session, user, token }) => {
//       console.log("callbacks:session", { session, user, token });

//       const encodedToken = jwt.sign(token, nextAuthSecret, {
//         algorithm: "HS256",
//       });

//       session.id = token.id;
//       session.token = encodedToken;
//       session.user.roles = user?.roles ?? [];

//       return session;
//     },
//   },
//   secret: nextAuthSecret,
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   jwt: {
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//     async encode(params) {
//       console.log("jwt:encode", params);

//       const { token, secret, maxAge } = params;

//       const jwtClaims = {
//         sub: token?.user?.id,
//         name: token?.user?.name,
//         email: token?.user?.email,
//         iat: Date.now() / 1000,
//         exp: Math.floor(Date.now() / 1000) + (maxAge ?? 30 * 24 * 60 * 60),
//         "https://hasura.io/jwt/claims": {
//           "x-hasura-allowed-roles": token?.user?.roles ?? [],
//           "x-hasura-default-role": "user",
//           "x-hasura-role": "user",
//           "x-hasura-user-id": token?.user?.id,
//         },
//       };
//       const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: "HS256" });
//       return encodedToken;
//     },
//     decode({ secret, token }) {
//       if (!token) return null;

//       const decodedToken = jwt.verify(token, secret, { algorithms: ["HS256"] });
//       return decodedToken as any;
//     },
//   },
// });

export default withEmailOrIpRateLimitWithProgressiveDelay(
  NextAuth(nextAuthoptions),
  {
    limitInterval: 1, // in minutes
    maxRequestCount: 30,
    progressiveDelay: false,
  }
);

export const dynamic = "force-dynamic";
