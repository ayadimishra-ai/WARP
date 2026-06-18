import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const CreateFormSubmissionDocument = gql`
    mutation createFormSubmission($invitationId: uuid!) {
  insert_FormSubmission_one(object: {invitationId: $invitationId, isActive: true}) {
    id
  }
}
    `;
export type CreateFormSubmissionMutationFn = Apollo.MutationFunction<Types.CreateFormSubmissionMutation, Types.CreateFormSubmissionMutationVariables>;

/**
 * __useCreateFormSubmissionMutation__
 *
 * To run a mutation, you first call `useCreateFormSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFormSubmissionMutation, { data, loading, error }] = useCreateFormSubmissionMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useCreateFormSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateFormSubmissionMutation, Types.CreateFormSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateFormSubmissionMutation, Types.CreateFormSubmissionMutationVariables>(CreateFormSubmissionDocument, options);
      }
export type CreateFormSubmissionMutationHookResult = ReturnType<typeof useCreateFormSubmissionMutation>;
export type CreateFormSubmissionMutationResult = Apollo.MutationResult<Types.CreateFormSubmissionMutation>;
export type CreateFormSubmissionMutationOptions = Apollo.BaseMutationOptions<Types.CreateFormSubmissionMutation, Types.CreateFormSubmissionMutationVariables>;