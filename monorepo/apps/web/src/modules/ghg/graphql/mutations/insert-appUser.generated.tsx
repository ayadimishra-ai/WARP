import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertAppUserMutationVariables = Types.Exact<{
  userData: Array<Types.AppUser_Insert_Input> | Types.AppUser_Insert_Input;
}>;

export type InsertAppUserMutation = {
  __typename?: "mutation_root";
  insert_AppUser?: {
    __typename?: "AppUser_mutation_response";
    returning: Array<{
      __typename?: "AppUser";
      id: any;
      name: string;
      email: string;
      organization_id: any;
      role: string;
      metadata?: any | null;
      isRegistered: boolean;
      Organization: { __typename?: "Organization"; name: string };
    }>;
  } | null;
};

export const InsertAppUserDocument = gql`
  mutation insertAppUser($userData: [AppUser_insert_input!]!) {
    insert_AppUser(
      objects: $userData
      on_conflict: { constraint: AppUser_pkey }
    ) {
      returning {
        id
        name
        email
        organization_id
        role
        metadata
        isRegistered
        Organization {
          name
        }
      }
    }
  }
`;
export type InsertAppUserMutationFn = Apollo.MutationFunction<
  InsertAppUserMutation,
  InsertAppUserMutationVariables
>;

/**
 * __useInsertAppUserMutation__
 *
 * To run a mutation, you first call `useInsertAppUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAppUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAppUserMutation, { data, loading, error }] = useInsertAppUserMutation({
 *   variables: {
 *      userData: // value for 'userData'
 *   },
 * });
 */
export function useInsertAppUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertAppUserMutation,
    InsertAppUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertAppUserMutation,
    InsertAppUserMutationVariables
  >(InsertAppUserDocument, options);
}
export type InsertAppUserMutationHookResult = ReturnType<
  typeof useInsertAppUserMutation
>;
export type InsertAppUserMutationResult =
  Apollo.MutationResult<InsertAppUserMutation>;
export type InsertAppUserMutationOptions = Apollo.BaseMutationOptions<
  InsertAppUserMutation,
  InsertAppUserMutationVariables
>;
