import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetinterimwarninglogsbyInvitationIdDocument = gql`
    query getinterimwarninglogsbyInvitationId($invitationId: [uuid!]!) {
  ValidationWarningLogs(
    where: {InvitationId: {_in: $invitationId}, IsActive: {_eq: true}, Logtype: {_eq: "recommendation"}}
    order_by: {created_at: desc}
  ) {
    Id
    OldValue
    NewValue
    Ratio
    formFieldId
    QuestionId
    InvitationId
    values
    Logtype
    created_by
    updated_by
  }
}
    `;

/**
 * __useGetinterimwarninglogsbyInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetinterimwarninglogsbyInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetinterimwarninglogsbyInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetinterimwarninglogsbyInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetinterimwarninglogsbyInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetinterimwarninglogsbyInvitationIdQuery, Types.GetinterimwarninglogsbyInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetinterimwarninglogsbyInvitationIdQuery, Types.GetinterimwarninglogsbyInvitationIdQueryVariables>(GetinterimwarninglogsbyInvitationIdDocument, options);
      }
export function useGetinterimwarninglogsbyInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetinterimwarninglogsbyInvitationIdQuery, Types.GetinterimwarninglogsbyInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetinterimwarninglogsbyInvitationIdQuery, Types.GetinterimwarninglogsbyInvitationIdQueryVariables>(GetinterimwarninglogsbyInvitationIdDocument, options);
        }
export type GetinterimwarninglogsbyInvitationIdQueryHookResult = ReturnType<typeof useGetinterimwarninglogsbyInvitationIdQuery>;
export type GetinterimwarninglogsbyInvitationIdLazyQueryHookResult = ReturnType<typeof useGetinterimwarninglogsbyInvitationIdLazyQuery>;
export type GetinterimwarninglogsbyInvitationIdQueryResult = Apollo.QueryResult<Types.GetinterimwarninglogsbyInvitationIdQuery, Types.GetinterimwarninglogsbyInvitationIdQueryVariables>;