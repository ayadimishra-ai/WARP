import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailsByInvitationIdDocument = gql`
    query getUserDetailsByInvitationId($invitationId: uuid!) {
  FormInvitation(
    where: {_and: [{id: {_eq: $invitationId}}, {isActive: {_eq: true}}]}
  ) {
    id
    email
    Company {
      id
      name
    }
    ParentCompanyMapping {
      User {
        id
        email
        name
      }
    }
  }
}
    `;

/**
 * __useGetUserDetailsByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetUserDetailsByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailsByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailsByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetUserDetailsByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetUserDetailsByInvitationIdQuery, Types.GetUserDetailsByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailsByInvitationIdQuery, Types.GetUserDetailsByInvitationIdQueryVariables>(GetUserDetailsByInvitationIdDocument, options);
      }
export function useGetUserDetailsByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailsByInvitationIdQuery, Types.GetUserDetailsByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailsByInvitationIdQuery, Types.GetUserDetailsByInvitationIdQueryVariables>(GetUserDetailsByInvitationIdDocument, options);
        }
export type GetUserDetailsByInvitationIdQueryHookResult = ReturnType<typeof useGetUserDetailsByInvitationIdQuery>;
export type GetUserDetailsByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetUserDetailsByInvitationIdLazyQuery>;
export type GetUserDetailsByInvitationIdQueryResult = Apollo.QueryResult<Types.GetUserDetailsByInvitationIdQuery, Types.GetUserDetailsByInvitationIdQueryVariables>;