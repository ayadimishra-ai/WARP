import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterDataForInviterFormAutoAppoverDocument = gql`
    query GetGlobalMasterDataForInviterFormAutoAppover {
  GlobalMaster(where: {type: {_eq: "InviterFormAutoAppover"}}) {
    id
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterDataForInviterFormAutoAppoverQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterDataForInviterFormAutoAppoverQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterDataForInviterFormAutoAppoverQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterDataForInviterFormAutoAppoverQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalMasterDataForInviterFormAutoAppoverQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>(GetGlobalMasterDataForInviterFormAutoAppoverDocument, options);
      }
export function useGetGlobalMasterDataForInviterFormAutoAppoverLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>(GetGlobalMasterDataForInviterFormAutoAppoverDocument, options);
        }
// @ts-ignore
export function useGetGlobalMasterDataForInviterFormAutoAppoverSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>;
export function useGetGlobalMasterDataForInviterFormAutoAppoverSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery | undefined, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>;
export function useGetGlobalMasterDataForInviterFormAutoAppoverSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>(GetGlobalMasterDataForInviterFormAutoAppoverDocument, options);
        }
export type GetGlobalMasterDataForInviterFormAutoAppoverQueryHookResult = ReturnType<typeof useGetGlobalMasterDataForInviterFormAutoAppoverQuery>;
export type GetGlobalMasterDataForInviterFormAutoAppoverLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterDataForInviterFormAutoAppoverLazyQuery>;
export type GetGlobalMasterDataForInviterFormAutoAppoverSuspenseQueryHookResult = ReturnType<typeof useGetGlobalMasterDataForInviterFormAutoAppoverSuspenseQuery>;
export type GetGlobalMasterDataForInviterFormAutoAppoverQueryResult = Apollo.QueryResult<Types.GetGlobalMasterDataForInviterFormAutoAppoverQuery, Types.GetGlobalMasterDataForInviterFormAutoAppoverQueryVariables>;