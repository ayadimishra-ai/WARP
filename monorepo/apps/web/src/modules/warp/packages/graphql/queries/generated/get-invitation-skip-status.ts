import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetinvitationSkipStatusDocument = gql`
    query getinvitationSkipStatus($formInvitationId: uuid!) {
  FormInvitation(where: {id: {_eq: $formInvitationId}}) {
    status
  }
}
    `;

/**
 * __useGetinvitationSkipStatusQuery__
 *
 * To run a query within a React component, call `useGetinvitationSkipStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetinvitationSkipStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetinvitationSkipStatusQuery({
 *   variables: {
 *      formInvitationId: // value for 'formInvitationId'
 *   },
 * });
 */
export function useGetinvitationSkipStatusQuery(baseOptions: Apollo.QueryHookOptions<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables> & ({ variables: Types.GetinvitationSkipStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>(GetinvitationSkipStatusDocument, options);
      }
export function useGetinvitationSkipStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>(GetinvitationSkipStatusDocument, options);
        }
// @ts-ignore
export function useGetinvitationSkipStatusSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>;
export function useGetinvitationSkipStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetinvitationSkipStatusQuery | undefined, Types.GetinvitationSkipStatusQueryVariables>;
export function useGetinvitationSkipStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>(GetinvitationSkipStatusDocument, options);
        }
export type GetinvitationSkipStatusQueryHookResult = ReturnType<typeof useGetinvitationSkipStatusQuery>;
export type GetinvitationSkipStatusLazyQueryHookResult = ReturnType<typeof useGetinvitationSkipStatusLazyQuery>;
export type GetinvitationSkipStatusSuspenseQueryHookResult = ReturnType<typeof useGetinvitationSkipStatusSuspenseQuery>;
export type GetinvitationSkipStatusQueryResult = Apollo.QueryResult<Types.GetinvitationSkipStatusQuery, Types.GetinvitationSkipStatusQueryVariables>;