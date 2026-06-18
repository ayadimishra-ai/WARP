import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFormInvitationbyStatusDocument = gql`
    query getFormInvitationbyStatus($status: String!, $curationStatus: String!) {
  FormInvitation(where: {status: {_eq: $status}}) {
    WebCurations(where: {status: {_eq: $curationStatus}}) {
      id
      status
    }
    id
    status
    companyId
  }
}
    `;

/**
 * __useGetFormInvitationbyStatusQuery__
 *
 * To run a query within a React component, call `useGetFormInvitationbyStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormInvitationbyStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormInvitationbyStatusQuery({
 *   variables: {
 *      status: // value for 'status'
 *      curationStatus: // value for 'curationStatus'
 *   },
 * });
 */
export function useGetFormInvitationbyStatusQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables> & ({ variables: Types.GetFormInvitationbyStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>(GetFormInvitationbyStatusDocument, options);
      }
export function useGetFormInvitationbyStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>(GetFormInvitationbyStatusDocument, options);
        }
// @ts-ignore
export function useGetFormInvitationbyStatusSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>;
export function useGetFormInvitationbyStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetFormInvitationbyStatusQuery | undefined, Types.GetFormInvitationbyStatusQueryVariables>;
export function useGetFormInvitationbyStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>(GetFormInvitationbyStatusDocument, options);
        }
export type GetFormInvitationbyStatusQueryHookResult = ReturnType<typeof useGetFormInvitationbyStatusQuery>;
export type GetFormInvitationbyStatusLazyQueryHookResult = ReturnType<typeof useGetFormInvitationbyStatusLazyQuery>;
export type GetFormInvitationbyStatusSuspenseQueryHookResult = ReturnType<typeof useGetFormInvitationbyStatusSuspenseQuery>;
export type GetFormInvitationbyStatusQueryResult = Apollo.QueryResult<Types.GetFormInvitationbyStatusQuery, Types.GetFormInvitationbyStatusQueryVariables>;