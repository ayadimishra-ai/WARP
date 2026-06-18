import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserPasswordByEmailMutationVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
  password: Types.Scalars["String"]["input"];
}>;

export type UpdateUserPasswordByEmailMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users?: {
    __typename?: "Tbl_Users_mutation_response";
    returning: Array<{
      __typename?: "Tbl_Users";
      UserGuid: any;
      EmailId: string;
      Password?: string | null;
    }>;
  } | null;
};

export const UpdateUserPasswordByEmailDocument = gql`
  mutation UpdateUserPasswordByEmail($email: String!, $password: String!) {
    update_Tbl_Users(
      where: { EmailId: { _eq: $email } }
      _set: { Password: $password }
    ) {
      returning {
        UserGuid
        EmailId
        Password
      }
    }
  }
`;
export type UpdateUserPasswordByEmailMutationFn = Apollo.MutationFunction<
  UpdateUserPasswordByEmailMutation,
  UpdateUserPasswordByEmailMutationVariables
>;

/**
 * __useUpdateUserPasswordByEmailMutation__
 *
 * To run a mutation, you first call `useUpdateUserPasswordByEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPasswordByEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPasswordByEmailMutation, { data, loading, error }] = useUpdateUserPasswordByEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useUpdateUserPasswordByEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserPasswordByEmailMutation,
    UpdateUserPasswordByEmailMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserPasswordByEmailMutation,
    UpdateUserPasswordByEmailMutationVariables
  >(UpdateUserPasswordByEmailDocument, options);
}
export type UpdateUserPasswordByEmailMutationHookResult = ReturnType<
  typeof useUpdateUserPasswordByEmailMutation
>;
export type UpdateUserPasswordByEmailMutationResult =
  Apollo.MutationResult<UpdateUserPasswordByEmailMutation>;
export type UpdateUserPasswordByEmailMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserPasswordByEmailMutation,
    UpdateUserPasswordByEmailMutationVariables
  >;
