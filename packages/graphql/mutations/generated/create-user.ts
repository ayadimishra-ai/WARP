import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const CreateUserDocument = gql`
    mutation createUser($input: [User_insert_input!]!) {
  insert_User(objects: $input, on_conflict: {constraint: User_email_key}) {
    affected_rows
    returning {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
      image
      details
      companyId
      created_by
      updated_by
      UserRoles {
        roleName
        Role {
          id
          isActive
        }
      }
    }
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<Types.CreateUserMutation, Types.CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateUserMutation, Types.CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateUserMutation, Types.CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<Types.CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<Types.CreateUserMutation, Types.CreateUserMutationVariables>;