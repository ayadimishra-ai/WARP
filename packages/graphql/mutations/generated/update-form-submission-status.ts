import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormSubmissionStatusDocument = gql`
    mutation updateFormSubmissionStatus($submissionId: uuid!, $status: String!) {
  update_FormSubmission_by_pk(
    pk_columns: {id: $submissionId}
    _set: {status: $status}
  ) {
    id
    status
  }
}
    `;
export type UpdateFormSubmissionStatusMutationFn = Apollo.MutationFunction<Types.UpdateFormSubmissionStatusMutation, Types.UpdateFormSubmissionStatusMutationVariables>;

/**
 * __useUpdateFormSubmissionStatusMutation__
 *
 * To run a mutation, you first call `useUpdateFormSubmissionStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormSubmissionStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormSubmissionStatusMutation, { data, loading, error }] = useUpdateFormSubmissionStatusMutation({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateFormSubmissionStatusMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormSubmissionStatusMutation, Types.UpdateFormSubmissionStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormSubmissionStatusMutation, Types.UpdateFormSubmissionStatusMutationVariables>(UpdateFormSubmissionStatusDocument, options);
      }
export type UpdateFormSubmissionStatusMutationHookResult = ReturnType<typeof useUpdateFormSubmissionStatusMutation>;
export type UpdateFormSubmissionStatusMutationResult = Apollo.MutationResult<Types.UpdateFormSubmissionStatusMutation>;
export type UpdateFormSubmissionStatusMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormSubmissionStatusMutation, Types.UpdateFormSubmissionStatusMutationVariables>;