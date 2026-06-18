import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateValidationWarningLogsDocument = gql`
    mutation updateValidationWarningLogs($formfieldId: uuid, $invitationId: uuid) {
  update_ValidationWarningLogs(
    _set: {IsActive: false}
    where: {_and: [{formFieldId: {_eq: $formfieldId}}, {InvitationId: {_eq: $invitationId}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateValidationWarningLogsMutationFn = Apollo.MutationFunction<Types.UpdateValidationWarningLogsMutation, Types.UpdateValidationWarningLogsMutationVariables>;

/**
 * __useUpdateValidationWarningLogsMutation__
 *
 * To run a mutation, you first call `useUpdateValidationWarningLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateValidationWarningLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateValidationWarningLogsMutation, { data, loading, error }] = useUpdateValidationWarningLogsMutation({
 *   variables: {
 *      formfieldId: // value for 'formfieldId'
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useUpdateValidationWarningLogsMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateValidationWarningLogsMutation, Types.UpdateValidationWarningLogsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateValidationWarningLogsMutation, Types.UpdateValidationWarningLogsMutationVariables>(UpdateValidationWarningLogsDocument, options);
      }
export type UpdateValidationWarningLogsMutationHookResult = ReturnType<typeof useUpdateValidationWarningLogsMutation>;
export type UpdateValidationWarningLogsMutationResult = Apollo.MutationResult<Types.UpdateValidationWarningLogsMutation>;
export type UpdateValidationWarningLogsMutationOptions = Apollo.BaseMutationOptions<Types.UpdateValidationWarningLogsMutation, Types.UpdateValidationWarningLogsMutationVariables>;