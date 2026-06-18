import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateSubmissionStatusForInProgressDocument = gql`
    mutation updateSubmissionStatusForInProgress($submissionId: uuid!, $submissionStatus: String!) {
  update_FormSubmission_by_pk(
    pk_columns: {id: $submissionId}
    _set: {status: $submissionStatus, remarks: $submissionStatus}
  ) {
    id
    invitationId
    status
  }
}
    `;
export type UpdateSubmissionStatusForInProgressMutationFn = Apollo.MutationFunction<Types.UpdateSubmissionStatusForInProgressMutation, Types.UpdateSubmissionStatusForInProgressMutationVariables>;

/**
 * __useUpdateSubmissionStatusForInProgressMutation__
 *
 * To run a mutation, you first call `useUpdateSubmissionStatusForInProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSubmissionStatusForInProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSubmissionStatusForInProgressMutation, { data, loading, error }] = useUpdateSubmissionStatusForInProgressMutation({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *      submissionStatus: // value for 'submissionStatus'
 *   },
 * });
 */
export function useUpdateSubmissionStatusForInProgressMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateSubmissionStatusForInProgressMutation, Types.UpdateSubmissionStatusForInProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateSubmissionStatusForInProgressMutation, Types.UpdateSubmissionStatusForInProgressMutationVariables>(UpdateSubmissionStatusForInProgressDocument, options);
      }
export type UpdateSubmissionStatusForInProgressMutationHookResult = ReturnType<typeof useUpdateSubmissionStatusForInProgressMutation>;
export type UpdateSubmissionStatusForInProgressMutationResult = Apollo.MutationResult<Types.UpdateSubmissionStatusForInProgressMutation>;
export type UpdateSubmissionStatusForInProgressMutationOptions = Apollo.BaseMutationOptions<Types.UpdateSubmissionStatusForInProgressMutation, Types.UpdateSubmissionStatusForInProgressMutationVariables>;