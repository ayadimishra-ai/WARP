import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationDetailsByInviationIdDocument = gql`
    query getInvitationDetailsByInviationId($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    AssesseeUserMappings {
      userByUserid {
        id
        UserRoles(where: {roleName: {_eq: "Responder"}}) {
          User {
            id
            name
            email
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetInvitationDetailsByInviationIdQuery__
 *
 * To run a query within a React component, call `useGetInvitationDetailsByInviationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationDetailsByInviationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationDetailsByInviationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetInvitationDetailsByInviationIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInvitationDetailsByInviationIdQuery, Types.GetInvitationDetailsByInviationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationDetailsByInviationIdQuery, Types.GetInvitationDetailsByInviationIdQueryVariables>(GetInvitationDetailsByInviationIdDocument, options);
      }
export function useGetInvitationDetailsByInviationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationDetailsByInviationIdQuery, Types.GetInvitationDetailsByInviationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationDetailsByInviationIdQuery, Types.GetInvitationDetailsByInviationIdQueryVariables>(GetInvitationDetailsByInviationIdDocument, options);
        }
export type GetInvitationDetailsByInviationIdQueryHookResult = ReturnType<typeof useGetInvitationDetailsByInviationIdQuery>;
export type GetInvitationDetailsByInviationIdLazyQueryHookResult = ReturnType<typeof useGetInvitationDetailsByInviationIdLazyQuery>;
export type GetInvitationDetailsByInviationIdQueryResult = Apollo.QueryResult<Types.GetInvitationDetailsByInviationIdQuery, Types.GetInvitationDetailsByInviationIdQueryVariables>;