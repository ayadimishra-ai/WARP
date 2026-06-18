import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertMakerCheckerRemarkDocument = gql`
    mutation InsertMakerCheckerRemark($reviewerDetailsMappingId: uuid!, $remark: String!, $status: String!, $createdBy: uuid!, $Ismailsent: Boolean!) {
  insert_MakerCheckerRemarks_one(
    object: {ReviewerDetailsMappingId: $reviewerDetailsMappingId, remark: $remark, status: $status, created_by: $createdBy, Ismailsent: $Ismailsent}
  ) {
    id
    remark
    status
  }
}
    `;
export type InsertMakerCheckerRemarkMutationFn = Apollo.MutationFunction<Types.InsertMakerCheckerRemarkMutation, Types.InsertMakerCheckerRemarkMutationVariables>;

/**
 * __useInsertMakerCheckerRemarkMutation__
 *
 * To run a mutation, you first call `useInsertMakerCheckerRemarkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertMakerCheckerRemarkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertMakerCheckerRemarkMutation, { data, loading, error }] = useInsertMakerCheckerRemarkMutation({
 *   variables: {
 *      reviewerDetailsMappingId: // value for 'reviewerDetailsMappingId'
 *      remark: // value for 'remark'
 *      status: // value for 'status'
 *      createdBy: // value for 'createdBy'
 *      Ismailsent: // value for 'Ismailsent'
 *   },
 * });
 */
export function useInsertMakerCheckerRemarkMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertMakerCheckerRemarkMutation, Types.InsertMakerCheckerRemarkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertMakerCheckerRemarkMutation, Types.InsertMakerCheckerRemarkMutationVariables>(InsertMakerCheckerRemarkDocument, options);
      }
export type InsertMakerCheckerRemarkMutationHookResult = ReturnType<typeof useInsertMakerCheckerRemarkMutation>;
export type InsertMakerCheckerRemarkMutationResult = Apollo.MutationResult<Types.InsertMakerCheckerRemarkMutation>;
export type InsertMakerCheckerRemarkMutationOptions = Apollo.BaseMutationOptions<Types.InsertMakerCheckerRemarkMutation, Types.InsertMakerCheckerRemarkMutationVariables>;