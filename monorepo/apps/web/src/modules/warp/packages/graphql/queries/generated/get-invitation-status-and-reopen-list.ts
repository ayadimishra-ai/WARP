import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetinvitationstatusandreopenlistDocument = gql`
    query getinvitationstatusandreopenlist($invitationId: uuid!, $type: String) {
  FormInvitation(where: {_and: [{id: {_eq: $invitationId}}]}) {
    id
    formId
    status
    companyByParentcompanyid {
      id
    }
  }
  GlobalMaster(where: {type: {_eq: $type}}) {
    data
    id
  }
}
    `;

/**
 * __useGetinvitationstatusandreopenlistQuery__
 *
 * To run a query within a React component, call `useGetinvitationstatusandreopenlistQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetinvitationstatusandreopenlistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetinvitationstatusandreopenlistQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetinvitationstatusandreopenlistQuery(baseOptions: Apollo.QueryHookOptions<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables> & ({ variables: Types.GetinvitationstatusandreopenlistQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>(GetinvitationstatusandreopenlistDocument, options);
      }
export function useGetinvitationstatusandreopenlistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>(GetinvitationstatusandreopenlistDocument, options);
        }
// @ts-ignore
export function useGetinvitationstatusandreopenlistSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>;
export function useGetinvitationstatusandreopenlistSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetinvitationstatusandreopenlistQuery | undefined, Types.GetinvitationstatusandreopenlistQueryVariables>;
export function useGetinvitationstatusandreopenlistSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>(GetinvitationstatusandreopenlistDocument, options);
        }
export type GetinvitationstatusandreopenlistQueryHookResult = ReturnType<typeof useGetinvitationstatusandreopenlistQuery>;
export type GetinvitationstatusandreopenlistLazyQueryHookResult = ReturnType<typeof useGetinvitationstatusandreopenlistLazyQuery>;
export type GetinvitationstatusandreopenlistSuspenseQueryHookResult = ReturnType<typeof useGetinvitationstatusandreopenlistSuspenseQuery>;
export type GetinvitationstatusandreopenlistQueryResult = Apollo.QueryResult<Types.GetinvitationstatusandreopenlistQuery, Types.GetinvitationstatusandreopenlistQueryVariables>;