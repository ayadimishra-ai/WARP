import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateSubmissionStatusDocument = gql`
    mutation updateSubmissionStatus($submissionId: uuid!, $submissionStatus: String!) {
  update_FormSubmission_by_pk(
    pk_columns: {id: $submissionId}
    _set: {status: $submissionStatus}
  ) {
    id
    invitationId
    status
  }
}
    `;
export type UpdateSubmissionStatusMutationFn = Apollo.MutationFunction<Types.UpdateSubmissionStatusMutation, Types.UpdateSubmissionStatusMutationVariables>;

/**
 * __useUpdateSubmissionStatusMutation__
 *
 * To run a mutation, you first call `useUpdateSubmissionStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSubmissionStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSubmissionStatusMutation, { data, loading, error }] = useUpdateSubmissionStatusMutation({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *      submissionStatus: // value for 'submissionStatus'
 *   },
 * });
 */
export function useUpdateSubmissionStatusMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateSubmissionStatusMutation, Types.UpdateSubmissionStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateSubmissionStatusMutation, Types.UpdateSubmissionStatusMutationVariables>(UpdateSubmissionStatusDocument, options);
      }
export type UpdateSubmissionStatusMutationHookResult = ReturnType<typeof useUpdateSubmissionStatusMutation>;
export type UpdateSubmissionStatusMutationResult = Apollo.MutationResult<Types.UpdateSubmissionStatusMutation>;
export type UpdateSubmissionStatusMutationOptions = Apollo.BaseMutationOptions<Types.UpdateSubmissionStatusMutation, Types.UpdateSubmissionStatusMutationVariables>;