import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertFormSubmissionDocument = gql`
    mutation bulkInsertFormSubmission($formSubmissionInput: [FormSubmission_insert_input!]!) {
  insert_FormSubmission(
    objects: $formSubmissionInput
    on_conflict: {constraint: FormSubmission_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export type BulkInsertFormSubmissionMutationFn = Apollo.MutationFunction<Types.BulkInsertFormSubmissionMutation, Types.BulkInsertFormSubmissionMutationVariables>;

/**
 * __useBulkInsertFormSubmissionMutation__
 *
 * To run a mutation, you first call `useBulkInsertFormSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertFormSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertFormSubmissionMutation, { data, loading, error }] = useBulkInsertFormSubmissionMutation({
 *   variables: {
 *      formSubmissionInput: // value for 'formSubmissionInput'
 *   },
 * });
 */
export function useBulkInsertFormSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertFormSubmissionMutation, Types.BulkInsertFormSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertFormSubmissionMutation, Types.BulkInsertFormSubmissionMutationVariables>(BulkInsertFormSubmissionDocument, options);
      }
export type BulkInsertFormSubmissionMutationHookResult = ReturnType<typeof useBulkInsertFormSubmissionMutation>;
export type BulkInsertFormSubmissionMutationResult = Apollo.MutationResult<Types.BulkInsertFormSubmissionMutation>;
export type BulkInsertFormSubmissionMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertFormSubmissionMutation, Types.BulkInsertFormSubmissionMutationVariables>;