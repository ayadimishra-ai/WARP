import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateIsEmailSubscribedDocument = gql`
    mutation updateIsEmailSubscribed($emailId: String, $isEmailSubscribed: Boolean) {
  update_User(
    where: {email: {_eq: $emailId}}
    _set: {isEmailSubscribed: $isEmailSubscribed}
  ) {
    affected_rows
  }
}
    `;
export type UpdateIsEmailSubscribedMutationFn = Apollo.MutationFunction<Types.UpdateIsEmailSubscribedMutation, Types.UpdateIsEmailSubscribedMutationVariables>;

/**
 * __useUpdateIsEmailSubscribedMutation__
 *
 * To run a mutation, you first call `useUpdateIsEmailSubscribedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIsEmailSubscribedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIsEmailSubscribedMutation, { data, loading, error }] = useUpdateIsEmailSubscribedMutation({
 *   variables: {
 *      emailId: // value for 'emailId'
 *      isEmailSubscribed: // value for 'isEmailSubscribed'
 *   },
 * });
 */
export function useUpdateIsEmailSubscribedMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateIsEmailSubscribedMutation, Types.UpdateIsEmailSubscribedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateIsEmailSubscribedMutation, Types.UpdateIsEmailSubscribedMutationVariables>(UpdateIsEmailSubscribedDocument, options);
      }
export type UpdateIsEmailSubscribedMutationHookResult = ReturnType<typeof useUpdateIsEmailSubscribedMutation>;
export type UpdateIsEmailSubscribedMutationResult = Apollo.MutationResult<Types.UpdateIsEmailSubscribedMutation>;
export type UpdateIsEmailSubscribedMutationOptions = Apollo.BaseMutationOptions<Types.UpdateIsEmailSubscribedMutation, Types.UpdateIsEmailSubscribedMutationVariables>;