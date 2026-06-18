import { DefaultAccount, DefaultProfile, DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

type UserType = {
  id: string;
  roles: string[];
} & DefaultSession["user"];

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: UserType;
    accessToken?: String;
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends UserType {
    roles: string[];
  }
  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  interface Account extends DefaultAccount {}
  /** The OAuth profile returned from your provider */
  interface Profile extends DefaultProfile {}
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT, UserType {
    /** OpenID ID Token */
    accessToken?: string;
  }
}
