import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateSourcesByIdDocument = gql`
    mutation updateSourcesById($id: uuid!, $_set: Sources_set_input!) {
  update_Sources_by_pk(pk_columns: {id: $id}, _set: $_set) {
    id
    sourceFilesId
    updated_at
  }
}
    `;
export type UpdateSourcesByIdMutationFn = Apollo.MutationFunction<Types.UpdateSourcesByIdMutation, Types.UpdateSourcesByIdMutationVariables>;

/**
 * __useUpdateSourcesByIdMutation__
 *
 * To run a mutation, you first call `useUpdateSourcesByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSourcesByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSourcesByIdMutation, { data, loading, error }] = useUpdateSourcesByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      _set: // value for '_set'
 *   },
 * });
 */
export function useUpdateSourcesByIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateSourcesByIdMutation, Types.UpdateSourcesByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateSourcesByIdMutation, Types.UpdateSourcesByIdMutationVariables>(UpdateSourcesByIdDocument, options);
      }
export type UpdateSourcesByIdMutationHookResult = ReturnType<typeof useUpdateSourcesByIdMutation>;
export type UpdateSourcesByIdMutationResult = Apollo.MutationResult<Types.UpdateSourcesByIdMutation>;
export type UpdateSourcesByIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateSourcesByIdMutation, Types.UpdateSourcesByIdMutationVariables>;