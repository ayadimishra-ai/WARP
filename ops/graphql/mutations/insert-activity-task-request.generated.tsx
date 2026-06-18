import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertActivityTaskRequestMutationVariables = Types.Exact<{
  input: Array<Types.ActivityTaskRequest_Insert_Input> | Types.ActivityTaskRequest_Insert_Input;
}>;


export type InsertActivityTaskRequestMutation = { __typename?: 'mutation_root', insert_ActivityTaskRequest?: { __typename?: 'ActivityTaskRequest_mutation_response', returning: Array<{ __typename?: 'ActivityTaskRequest', id: any, task_request_id: any, activity_id: any, organization_address_id: any, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, pincode?: string | null } } }> } | null };


export const InsertActivityTaskRequestDocument = gql`
    mutation InsertActivityTaskRequest($input: [ActivityTaskRequest_insert_input!]!) {
  insert_ActivityTaskRequest(objects: $input) {
    returning {
      id
      task_request_id
      activity_id
      organization_address_id
      OrganizationAddress {
        Address {
          name
          pincode
        }
      }
    }
  }
}
    `;
export type InsertActivityTaskRequestMutationFn = Apollo.MutationFunction<InsertActivityTaskRequestMutation, InsertActivityTaskRequestMutationVariables>;

/**
 * __useInsertActivityTaskRequestMutation__
 *
 * To run a mutation, you first call `useInsertActivityTaskRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertActivityTaskRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertActivityTaskRequestMutation, { data, loading, error }] = useInsertActivityTaskRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertActivityTaskRequestMutation(baseOptions?: Apollo.MutationHookOptions<InsertActivityTaskRequestMutation, InsertActivityTaskRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertActivityTaskRequestMutation, InsertActivityTaskRequestMutationVariables>(InsertActivityTaskRequestDocument, options);
      }
export type InsertActivityTaskRequestMutationHookResult = ReturnType<typeof useInsertActivityTaskRequestMutation>;
export type InsertActivityTaskRequestMutationResult = Apollo.MutationResult<InsertActivityTaskRequestMutation>;
export type InsertActivityTaskRequestMutationOptions = Apollo.BaseMutationOptions<InsertActivityTaskRequestMutation, InsertActivityTaskRequestMutationVariables>;