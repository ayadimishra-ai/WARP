import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserPasswordMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  password: Types.Scalars["String"]["input"];
}>;

export type UpdateUserPasswordMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users_by_pk?: {
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    IsVerified?: boolean | null;
  } | null;
};

export const UpdateUserPasswordDocument = gql`
  mutation UpdateUserPassword($userGuid: uuid!, $password: String!) {
    update_Tbl_Users_by_pk(
      pk_columns: { UserGuid: $userGuid }
      _set: { Password: $password, IsVerified: true }
    ) {
      UserGuid
      EmailId
      IsVerified
    }
  }
`;
export type UpdateUserPasswordMutationFn = Apollo.MutationFunction<
  UpdateUserPasswordMutation,
  UpdateUserPasswordMutationVariables
>;

/**
 * __useUpdateUserPasswordMutation__
 *
 * To run a mutation, you first call `useUpdateUserPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPasswordMutation, { data, loading, error }] = useUpdateUserPasswordMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useUpdateUserPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserPasswordMutation,
    UpdateUserPasswordMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserPasswordMutation,
    UpdateUserPasswordMutationVariables
  >(UpdateUserPasswordDocument, options);
}
export type UpdateUserPasswordMutationHookResult = ReturnType<
  typeof useUpdateUserPasswordMutation
>;
export type UpdateUserPasswordMutationResult =
  Apollo.MutationResult<UpdateUserPasswordMutation>;
export type UpdateUserPasswordMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserPasswordMutation,
  UpdateUserPasswordMutationVariables
>;
