import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserSessionMutationVariables = Types.Exact<{
  input: Array<Types.Tbl_UserSessions_Updates> | Types.Tbl_UserSessions_Updates;
}>;

export type UpdateUserSessionMutation = {
  __typename?: "mutation_root";
  update_Tbl_UserSessions_many?: Array<{
    __typename?: "Tbl_UserSessions_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserSessions";
      id: any;
      UserId: any;
      PlatformToken?: string | null;
      WarpToken?: string | null;
      OpsToken?: string | null;
      BrowserToken?: string | null;
      Metadata?: any | null;
      StatusMetadata?: any | null;
    }>;
  } | null> | null;
};

export const UpdateUserSessionDocument = gql`
  mutation updateUserSession($input: [Tbl_UserSessions_updates!]!) {
    update_Tbl_UserSessions_many(updates: $input) {
      affected_rows
      returning {
        id
        UserId
        PlatformToken
        WarpToken
        OpsToken
        BrowserToken
        Metadata
        StatusMetadata
      }
    }
  }
`;
export type UpdateUserSessionMutationFn = Apollo.MutationFunction<
  UpdateUserSessionMutation,
  UpdateUserSessionMutationVariables
>;

/**
 * __useUpdateUserSessionMutation__
 *
 * To run a mutation, you first call `useUpdateUserSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserSessionMutation, { data, loading, error }] = useUpdateUserSessionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserSessionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserSessionMutation,
    UpdateUserSessionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserSessionMutation,
    UpdateUserSessionMutationVariables
  >(UpdateUserSessionDocument, options);
}
export type UpdateUserSessionMutationHookResult = ReturnType<
  typeof useUpdateUserSessionMutation
>;
export type UpdateUserSessionMutationResult =
  Apollo.MutationResult<UpdateUserSessionMutation>;
export type UpdateUserSessionMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserSessionMutation,
  UpdateUserSessionMutationVariables
>;
