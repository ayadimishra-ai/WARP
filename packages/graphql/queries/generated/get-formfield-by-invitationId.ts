import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormFieldDataByInvitationIdDocument = gql`
    query getFormFieldDataByInvitationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    Form {
      FormFields {
        id
        fieldOptions
        displayRules
        questionId
        Question {
          key
        }
      }
    }
  }
}
    `;

/**
 * __useGetFormFieldDataByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetFormFieldDataByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormFieldDataByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormFieldDataByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFormFieldDataByInvitationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetFormFieldDataByInvitationIdQuery, Types.GetFormFieldDataByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormFieldDataByInvitationIdQuery, Types.GetFormFieldDataByInvitationIdQueryVariables>(GetFormFieldDataByInvitationIdDocument, options);
      }
export function useGetFormFieldDataByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormFieldDataByInvitationIdQuery, Types.GetFormFieldDataByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormFieldDataByInvitationIdQuery, Types.GetFormFieldDataByInvitationIdQueryVariables>(GetFormFieldDataByInvitationIdDocument, options);
        }
export type GetFormFieldDataByInvitationIdQueryHookResult = ReturnType<typeof useGetFormFieldDataByInvitationIdQuery>;
export type GetFormFieldDataByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetFormFieldDataByInvitationIdLazyQuery>;
export type GetFormFieldDataByInvitationIdQueryResult = Apollo.QueryResult<Types.GetFormFieldDataByInvitationIdQuery, Types.GetFormFieldDataByInvitationIdQueryVariables>;