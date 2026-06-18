import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterByTypeListDocument = gql`
    query getGlobalMasterByTypeList($type: [String!]) {
  GlobalMaster(where: {type: {_in: $type}}) {
    id
    platformId
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterByTypeListQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterByTypeListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterByTypeListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterByTypeListQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetGlobalMasterByTypeListQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>(GetGlobalMasterByTypeListDocument, options);
      }
export function useGetGlobalMasterByTypeListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>(GetGlobalMasterByTypeListDocument, options);
        }
// @ts-ignore
export function useGetGlobalMasterByTypeListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>;
export function useGetGlobalMasterByTypeListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterByTypeListQuery | undefined, Types.GetGlobalMasterByTypeListQueryVariables>;
export function useGetGlobalMasterByTypeListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>(GetGlobalMasterByTypeListDocument, options);
        }
export type GetGlobalMasterByTypeListQueryHookResult = ReturnType<typeof useGetGlobalMasterByTypeListQuery>;
export type GetGlobalMasterByTypeListLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterByTypeListLazyQuery>;
export type GetGlobalMasterByTypeListSuspenseQueryHookResult = ReturnType<typeof useGetGlobalMasterByTypeListSuspenseQuery>;
export type GetGlobalMasterByTypeListQueryResult = Apollo.QueryResult<Types.GetGlobalMasterByTypeListQuery, Types.GetGlobalMasterByTypeListQueryVariables>;