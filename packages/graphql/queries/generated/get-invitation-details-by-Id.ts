import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitationDetailsByIdDocument = gql`
    query getInvitationDetailsById($invitationId: uuid, $questionId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    id
    AssesseeUserMappings(where: {questionId: {_eq: $questionId}}) {
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
 * __useGetInvitationDetailsByIdQuery__
 *
 * To run a query within a React component, call `useGetInvitationDetailsByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationDetailsByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationDetailsByIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useGetInvitationDetailsByIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInvitationDetailsByIdQuery, Types.GetInvitationDetailsByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitationDetailsByIdQuery, Types.GetInvitationDetailsByIdQueryVariables>(GetInvitationDetailsByIdDocument, options);
      }
export function useGetInvitationDetailsByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitationDetailsByIdQuery, Types.GetInvitationDetailsByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitationDetailsByIdQuery, Types.GetInvitationDetailsByIdQueryVariables>(GetInvitationDetailsByIdDocument, options);
        }
export type GetInvitationDetailsByIdQueryHookResult = ReturnType<typeof useGetInvitationDetailsByIdQuery>;
export type GetInvitationDetailsByIdLazyQueryHookResult = ReturnType<typeof useGetInvitationDetailsByIdLazyQuery>;
export type GetInvitationDetailsByIdQueryResult = Apollo.QueryResult<Types.GetInvitationDetailsByIdQuery, Types.GetInvitationDetailsByIdQueryVariables>;