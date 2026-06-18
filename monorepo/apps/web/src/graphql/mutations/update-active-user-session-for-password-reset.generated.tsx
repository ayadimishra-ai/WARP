import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateActiveUserSessionForPasswordResetMutationVariables =
  Types.Exact<{
    userId: Types.Scalars["uuid"]["input"];
    statusMetadata: Types.Scalars["jsonb"]["input"];
  }>;

export type UpdateActiveUserSessionForPasswordResetMutation = {
  __typename?: "mutation_root";
  update_Tbl_UserSessions?: {
    __typename?: "Tbl_UserSessions_mutation_response";
    affected_rows: number;
    returning: Array<{ __typename?: "Tbl_UserSessions"; id: any }>;
  } | null;
};

export const UpdateActiveUserSessionForPasswordResetDocument = gql`
  mutation updateActiveUserSessionForPasswordReset(
    $userId: uuid!
    $statusMetadata: jsonb!
  ) {
    update_Tbl_UserSessions(
      _set: { Status: "Inactive", StatusMetadata: $statusMetadata }
      where: { UserId: { _eq: $userId }, Status: { _eq: "Active" } }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
export type UpdateActiveUserSessionForPasswordResetMutationFn =
  Apollo.MutationFunction<
    UpdateActiveUserSessionForPasswordResetMutation,
    UpdateActiveUserSessionForPasswordResetMutationVariables
  >;

/**
 * __useUpdateActiveUserSessionForPasswordResetMutation__
 *
 * To run a mutation, you first call `useUpdateActiveUserSessionForPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateActiveUserSessionForPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateActiveUserSessionForPasswordResetMutation, { data, loading, error }] = useUpdateActiveUserSessionForPasswordResetMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      statusMetadata: // value for 'statusMetadata'
 *   },
 * });
 */
export function useUpdateActiveUserSessionForPasswordResetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateActiveUserSessionForPasswordResetMutation,
    UpdateActiveUserSessionForPasswordResetMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateActiveUserSessionForPasswordResetMutation,
    UpdateActiveUserSessionForPasswordResetMutationVariables
  >(UpdateActiveUserSessionForPasswordResetDocument, options);
}
export type UpdateActiveUserSessionForPasswordResetMutationHookResult =
  ReturnType<typeof useUpdateActiveUserSessionForPasswordResetMutation>;
export type UpdateActiveUserSessionForPasswordResetMutationResult =
  Apollo.MutationResult<UpdateActiveUserSessionForPasswordResetMutation>;
export type UpdateActiveUserSessionForPasswordResetMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateActiveUserSessionForPasswordResetMutation,
    UpdateActiveUserSessionForPasswordResetMutationVariables
  >;
