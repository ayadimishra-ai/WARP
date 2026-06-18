import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateMakerCheckerRemarksDocument = gql`
    mutation UpdateMakerCheckerRemarks($where: MakerCheckerRemarks_bool_exp!, $_set: MakerCheckerRemarks_set_input!) {
  update_MakerCheckerRemarks(where: $where, _set: $_set) {
    affected_rows
  }
}
    `;
export type UpdateMakerCheckerRemarksMutationFn = Apollo.MutationFunction<Types.UpdateMakerCheckerRemarksMutation, Types.UpdateMakerCheckerRemarksMutationVariables>;

/**
 * __useUpdateMakerCheckerRemarksMutation__
 *
 * To run a mutation, you first call `useUpdateMakerCheckerRemarksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMakerCheckerRemarksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMakerCheckerRemarksMutation, { data, loading, error }] = useUpdateMakerCheckerRemarksMutation({
 *   variables: {
 *      where: // value for 'where'
 *      _set: // value for '_set'
 *   },
 * });
 */
export function useUpdateMakerCheckerRemarksMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateMakerCheckerRemarksMutation, Types.UpdateMakerCheckerRemarksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateMakerCheckerRemarksMutation, Types.UpdateMakerCheckerRemarksMutationVariables>(UpdateMakerCheckerRemarksDocument, options);
      }
export type UpdateMakerCheckerRemarksMutationHookResult = ReturnType<typeof useUpdateMakerCheckerRemarksMutation>;
export type UpdateMakerCheckerRemarksMutationResult = Apollo.MutationResult<Types.UpdateMakerCheckerRemarksMutation>;
export type UpdateMakerCheckerRemarksMutationOptions = Apollo.BaseMutationOptions<Types.UpdateMakerCheckerRemarksMutation, Types.UpdateMakerCheckerRemarksMutationVariables>;