import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateTimestampAfterEmailSendDocument = gql`
    mutation updateTimestampAfterEmailSend($id: [uuid!]!, $reminderIntervalAfterDueDate: timestamp!) {
  updateTimestampAfterEmailSend: update_Interim_Recommendation(
    where: {id: {_in: $id}}
    _set: {ReminderIntervalAfterDueDate: $reminderIntervalAfterDueDate}
  ) {
    affected_rows
  }
}
    `;
export type UpdateTimestampAfterEmailSendMutationFn = Apollo.MutationFunction<Types.UpdateTimestampAfterEmailSendMutation, Types.UpdateTimestampAfterEmailSendMutationVariables>;

/**
 * __useUpdateTimestampAfterEmailSendMutation__
 *
 * To run a mutation, you first call `useUpdateTimestampAfterEmailSendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTimestampAfterEmailSendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTimestampAfterEmailSendMutation, { data, loading, error }] = useUpdateTimestampAfterEmailSendMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reminderIntervalAfterDueDate: // value for 'reminderIntervalAfterDueDate'
 *   },
 * });
 */
export function useUpdateTimestampAfterEmailSendMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateTimestampAfterEmailSendMutation, Types.UpdateTimestampAfterEmailSendMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateTimestampAfterEmailSendMutation, Types.UpdateTimestampAfterEmailSendMutationVariables>(UpdateTimestampAfterEmailSendDocument, options);
      }
export type UpdateTimestampAfterEmailSendMutationHookResult = ReturnType<typeof useUpdateTimestampAfterEmailSendMutation>;
export type UpdateTimestampAfterEmailSendMutationResult = Apollo.MutationResult<Types.UpdateTimestampAfterEmailSendMutation>;
export type UpdateTimestampAfterEmailSendMutationOptions = Apollo.BaseMutationOptions<Types.UpdateTimestampAfterEmailSendMutation, Types.UpdateTimestampAfterEmailSendMutationVariables>;