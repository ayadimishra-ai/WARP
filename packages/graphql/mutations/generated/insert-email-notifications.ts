import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Insert_EmailNotificationsDocument = gql`
    mutation insert_EmailNotifications($emailData: [EmailNotifications_insert_input!]!) {
  insert_EmailNotifications(
    objects: $emailData
    on_conflict: {constraint: EmailNotifications_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export type Insert_EmailNotificationsMutationFn = Apollo.MutationFunction<Types.Insert_EmailNotificationsMutation, Types.Insert_EmailNotificationsMutationVariables>;

/**
 * __useInsert_EmailNotificationsMutation__
 *
 * To run a mutation, you first call `useInsert_EmailNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsert_EmailNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertEmailNotificationsMutation, { data, loading, error }] = useInsert_EmailNotificationsMutation({
 *   variables: {
 *      emailData: // value for 'emailData'
 *   },
 * });
 */
export function useInsert_EmailNotificationsMutation(baseOptions?: Apollo.MutationHookOptions<Types.Insert_EmailNotificationsMutation, Types.Insert_EmailNotificationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.Insert_EmailNotificationsMutation, Types.Insert_EmailNotificationsMutationVariables>(Insert_EmailNotificationsDocument, options);
      }
export type Insert_EmailNotificationsMutationHookResult = ReturnType<typeof useInsert_EmailNotificationsMutation>;
export type Insert_EmailNotificationsMutationResult = Apollo.MutationResult<Types.Insert_EmailNotificationsMutation>;
export type Insert_EmailNotificationsMutationOptions = Apollo.BaseMutationOptions<Types.Insert_EmailNotificationsMutation, Types.Insert_EmailNotificationsMutationVariables>;