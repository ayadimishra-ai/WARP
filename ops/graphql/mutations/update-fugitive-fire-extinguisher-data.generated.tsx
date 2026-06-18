import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateFugitiveFireExtinguisherDataMutationVariables = Types.Exact<{
  GhgGHGFireExtinguisherUpdation: Array<Types.GhgFireExtinguisher_Updates> | Types.GhgFireExtinguisher_Updates;
}>;


export type UpdateFugitiveFireExtinguisherDataMutation = { __typename?: 'mutation_root', update_GHGFireExtinguisher_many?: Array<{ __typename?: 'GHGFireExtinguisher_mutation_response', returning: Array<{ __typename?: 'GHGFireExtinguisher', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any }> } | null> | null };


export const UpdateFugitiveFireExtinguisherDataDocument = gql`
    mutation updateFugitiveFireExtinguisherData($GhgGHGFireExtinguisherUpdation: [GHGFireExtinguisher_updates!]!) {
  update_GHGFireExtinguisher_many(updates: $GhgGHGFireExtinguisherUpdation) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
    }
  }
}
    `;
export type UpdateFugitiveFireExtinguisherDataMutationFn = Apollo.MutationFunction<UpdateFugitiveFireExtinguisherDataMutation, UpdateFugitiveFireExtinguisherDataMutationVariables>;

/**
 * __useUpdateFugitiveFireExtinguisherDataMutation__
 *
 * To run a mutation, you first call `useUpdateFugitiveFireExtinguisherDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFugitiveFireExtinguisherDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFugitiveFireExtinguisherDataMutation, { data, loading, error }] = useUpdateFugitiveFireExtinguisherDataMutation({
 *   variables: {
 *      GhgGHGFireExtinguisherUpdation: // value for 'GhgGHGFireExtinguisherUpdation'
 *   },
 * });
 */
export function useUpdateFugitiveFireExtinguisherDataMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFugitiveFireExtinguisherDataMutation, UpdateFugitiveFireExtinguisherDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFugitiveFireExtinguisherDataMutation, UpdateFugitiveFireExtinguisherDataMutationVariables>(UpdateFugitiveFireExtinguisherDataDocument, options);
      }
export type UpdateFugitiveFireExtinguisherDataMutationHookResult = ReturnType<typeof useUpdateFugitiveFireExtinguisherDataMutation>;
export type UpdateFugitiveFireExtinguisherDataMutationResult = Apollo.MutationResult<UpdateFugitiveFireExtinguisherDataMutation>;
export type UpdateFugitiveFireExtinguisherDataMutationOptions = Apollo.BaseMutationOptions<UpdateFugitiveFireExtinguisherDataMutation, UpdateFugitiveFireExtinguisherDataMutationVariables>;