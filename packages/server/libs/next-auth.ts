import {
  Account_Insert_Input,
  User_Insert_Input,
  User_Set_Input,
} from "@warp/graphql/generated/sdk";
import { sdk } from "@warp/graphql/generated/server";
import { Account } from "next-auth";
import {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

export function HasuraNextAuthAdapter(): Adapter {
  return {
    createUser: async (user) => {
      const newUser: User_Insert_Input = { ...user };
      const result = sdk
        .CreateNextAuthUserMutation({ user: newUser })
        .then((data) => {
          if (!data?.insert_User_one) throw new Error("Create user failed");
          const { __typename, ...createdUser } = data.insert_User_one;
          return createdUser as AdapterUser;
        });
      return result;
    },
    getUser: (id) =>
      sdk.GetNextAuthUserQuery({ id }).then((data) => {
        if (data?.User && data.User.length > 0) {
          const { __typename, ...user } = data.User[0];
          return user as AdapterUser;
        }
        return null;
      }),
    getUserByEmail: (email) =>
      sdk.GetNextAuthUserByEmailQuery({ email }).then((data) => {
        if (data?.User && data.User.length > 0) {
          const { __typename, ...user } = data.User[0];
          return user as AdapterUser;
        }
        return null;
      }),
    updateUser: (user) => {
      const { id, ...rest } = user;
      const _user: User_Set_Input = { ...rest };
      const result = sdk
        .UpdateNextAuthUserMutation({ id, user: _user })
        .then((data) => {
          if (
            !data?.update_User?.returning ||
            data?.update_User?.returning.length < 1
          ) {
            throw new Error("Update user failed");
          }

          const { __typename, ...updatedUser } =
            data?.update_User?.returning[0];

          return updatedUser as AdapterUser;
        });
      return result;
    },
    deleteUser: async (userId) => {
      await sdk.DeleteNextAuthUserMutation({ id: userId }).then((data) => {
        if (
          !data?.delete_User?.returning ||
          data?.delete_User?.returning.length < 1
        ) {
          throw new Error("Update user failed");
        }

        const { __typename, ...deletedUser } = data?.delete_User?.returning[0];

        return deletedUser as AdapterUser;
      });
    },
    linkAccount: async (account) => {
      const newAccount: Account_Insert_Input = { ...account };
      const result = sdk
        .LinkNextAuthUserAccountMutation({
          account: newAccount,
        })
        .then((data) => {
          if (!data?.insert_Account_one)
            throw new Error("Failed to create account");

          const { __typename, id, ...restAccount } = data.insert_Account_one;

          return restAccount as Account;
        });

      return result;
    },
    unlinkAccount: async (account) => {
      const result = await sdk.UnlinkNextAuthUserAccountMutation(account);
      if (!result?.delete_Account || !result?.delete_Account?.affected_rows)
        return undefined;

      const { __typename, id, ...deletedAccount } =
        result?.delete_Account.returning[0];

      return deletedAccount as Account;
    },
    getUserByAccount: async (account) => {
      const { provider, providerAccountId } = account;

      const result = sdk
        .GetNextAuthUserByAccountQuery({
          provider,
          providerAccountId,
        })
        .then((data) => {
          if (!data?.Account || data?.Account.length < 1) return null;
          const { __typename, ...user } = data.Account[0].User;
          return user as AdapterUser;
        });

      return result;
    },
    createSession: async (session) => {
      const result = await sdk.CreateNextAuthSessionMutation({ session });
      if (!result?.insert_Session_one) throw Error("Failed to create session");

      const { __typename, ...adapterSession } = result.insert_Session_one;
      return adapterSession as AdapterSession;
    },
    getSessionAndUser: async (sessionToken) => {
      const result = await sdk.GetNextAuthSessionAndUserQuery({ sessionToken });
      if (!result?.Session || result?.Session.length < 1) return null;

      // remove unwanted typenames
      delete result.__typename;
      delete result.Session[0].__typename;

      const { User: user, ...session } = result.Session[0];

      return { session: session as AdapterSession, user: user as AdapterUser };
    },
    updateSession: async (session) => {
      const result = await sdk.UpdateNextAuthSessionMutation({
        sessionToken: session.sessionToken,
        session,
      });

      if (
        !result?.update_Session?.returning ||
        result.update_Session.returning.length < 1
      ) {
        return null;
      }

      delete result.update_Session.returning[0].__typename;

      const updatedSession: AdapterSession = result.update_Session.returning[0];

      return updatedSession;
    },
    deleteSession: async (sessionToken) => {
      const result = await sdk.DeleteNextAuthSessionMutation({ sessionToken });
      if (!result?.delete_Session?.returning?.length) return null;

      const deletedSession = result.delete_Session.returning[0];
      delete deletedSession.__typename;

      return deletedSession as AdapterSession;
    },
    async createVerificationToken(verificationToken) {
      const result = await sdk.CreateNextAuthVerificationTokenMutation({
        verificationToken,
      });
      if (!result?.insert_VerificationToken_one) return null;

      const { __typename, ...newVerificationToken } =
        result.insert_VerificationToken_one;

      return newVerificationToken as VerificationToken;
    },
    async useVerificationToken(params) {
      const result = await sdk.UseNextAuthVerificationTokenMutation(params);
      if (!result?.delete_VerificationToken?.affected_rows) return null;

      const { __typename, ...deletedVerificationToken } =
        result?.delete_VerificationToken.returning[0];

      return deletedVerificationToken as VerificationToken;
    },
  };
}
