import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateNetZeroTargetYearMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  net_zero_metadata?: Types.InputMaybe<Types.Scalars['jsonb']['input']>;
}>;


export type UpdateNetZeroTargetYearMutation = { __typename?: 'mutation_root', update_Organization?: { __typename?: 'Organization_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'Organization', id: any, name: string, Baselineyear: number, net_zero_metadata?: any | null }> } | null };


export const UpdateNetZeroTargetYearDocument = gql`
    mutation updateNetZeroTargetYear($id: uuid!, $net_zero_metadata: jsonb) {
  update_Organization(
    where: {id: {_eq: $id}}
    _set: {net_zero_metadata: $net_zero_metadata}
  ) {
    affected_rows
    returning {
      id
      name
      Baselineyear
      net_zero_metadata
    }
  }
}
    `;
export type UpdateNetZeroTargetYearMutationFn = Apollo.MutationFunction<UpdateNetZeroTargetYearMutation, UpdateNetZeroTargetYearMutationVariables>;

/**
 * __useUpdateNetZeroTargetYearMutation__
 *
 * To run a mutation, you first call `useUpdateNetZeroTargetYearMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNetZeroTargetYearMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNetZeroTargetYearMutation, { data, loading, error }] = useUpdateNetZeroTargetYearMutation({
 *   variables: {
 *      id: // value for 'id'
 *      net_zero_metadata: // value for 'net_zero_metadata'
 *   },
 * });
 */
export function useUpdateNetZeroTargetYearMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNetZeroTargetYearMutation, UpdateNetZeroTargetYearMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateNetZeroTargetYearMutation, UpdateNetZeroTargetYearMutationVariables>(UpdateNetZeroTargetYearDocument, options);
      }
export type UpdateNetZeroTargetYearMutationHookResult = ReturnType<typeof useUpdateNetZeroTargetYearMutation>;
export type UpdateNetZeroTargetYearMutationResult = Apollo.MutationResult<UpdateNetZeroTargetYearMutation>;
export type UpdateNetZeroTargetYearMutationOptions = Apollo.BaseMutationOptions<UpdateNetZeroTargetYearMutation, UpdateNetZeroTargetYearMutationVariables>;