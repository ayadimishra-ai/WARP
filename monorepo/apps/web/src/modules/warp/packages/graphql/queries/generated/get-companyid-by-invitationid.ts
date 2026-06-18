import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetcompanyidbyinvitationidDocument = gql`
    query getcompanyidbyinvitationid($invitationId: uuid) {
  FormInvitation(where: {id: {_eq: $invitationId}}) {
    companyId
    id
    formId
  }
}
    `;

/**
 * __useGetcompanyidbyinvitationidQuery__
 *
 * To run a query within a React component, call `useGetcompanyidbyinvitationidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetcompanyidbyinvitationidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetcompanyidbyinvitationidQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetcompanyidbyinvitationidQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>(GetcompanyidbyinvitationidDocument, options);
      }
export function useGetcompanyidbyinvitationidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>(GetcompanyidbyinvitationidDocument, options);
        }
// @ts-ignore
export function useGetcompanyidbyinvitationidSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>;
export function useGetcompanyidbyinvitationidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetcompanyidbyinvitationidQuery | undefined, Types.GetcompanyidbyinvitationidQueryVariables>;
export function useGetcompanyidbyinvitationidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>(GetcompanyidbyinvitationidDocument, options);
        }
export type GetcompanyidbyinvitationidQueryHookResult = ReturnType<typeof useGetcompanyidbyinvitationidQuery>;
export type GetcompanyidbyinvitationidLazyQueryHookResult = ReturnType<typeof useGetcompanyidbyinvitationidLazyQuery>;
export type GetcompanyidbyinvitationidSuspenseQueryHookResult = ReturnType<typeof useGetcompanyidbyinvitationidSuspenseQuery>;
export type GetcompanyidbyinvitationidQueryResult = Apollo.QueryResult<Types.GetcompanyidbyinvitationidQuery, Types.GetcompanyidbyinvitationidQueryVariables>;