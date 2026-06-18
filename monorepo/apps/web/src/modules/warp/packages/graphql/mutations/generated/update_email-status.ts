import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateStatusOfEmailDocument = gql`
    mutation updateStatusOfEmail($emailData: [EmailNotifications_updates!]!) {
  update_EmailNotifications_many(updates: $emailData) {
    returning {
      id
    }
  }
}
    `;
export type UpdateStatusOfEmailMutationFn = Apollo.MutationFunction<Types.UpdateStatusOfEmailMutation, Types.UpdateStatusOfEmailMutationVariables>;

/**
 * __useUpdateStatusOfEmailMutation__
 *
 * To run a mutation, you first call `useUpdateStatusOfEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStatusOfEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateStatusOfEmailMutation, { data, loading, error }] = useUpdateStatusOfEmailMutation({
 *   variables: {
 *      emailData: // value for 'emailData'
 *   },
 * });
 */
export function useUpdateStatusOfEmailMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateStatusOfEmailMutation, Types.UpdateStatusOfEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateStatusOfEmailMutation, Types.UpdateStatusOfEmailMutationVariables>(UpdateStatusOfEmailDocument, options);
      }
export type UpdateStatusOfEmailMutationHookResult = ReturnType<typeof useUpdateStatusOfEmailMutation>;
export type UpdateStatusOfEmailMutationResult = Apollo.MutationResult<Types.UpdateStatusOfEmailMutation>;
export type UpdateStatusOfEmailMutationOptions = Apollo.BaseMutationOptions<Types.UpdateStatusOfEmailMutation, Types.UpdateStatusOfEmailMutationVariables>;