import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUomFromActivityMasterQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUomFromActivityMasterQuery = { __typename?: 'query_root', ActivityMaster: Array<{ __typename?: 'ActivityMaster', master_data: any }> };


export const GetUomFromActivityMasterDocument = gql`
    query getUomFromActivityMaster {
  ActivityMaster(where: {master_key: {_ilike: "%uom%"}}) {
    master_data
  }
}
    `;

/**
 * __useGetUomFromActivityMasterQuery__
 *
 * To run a query within a React component, call `useGetUomFromActivityMasterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUomFromActivityMasterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUomFromActivityMasterQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUomFromActivityMasterQuery(baseOptions?: Apollo.QueryHookOptions<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>(GetUomFromActivityMasterDocument, options);
      }
export function useGetUomFromActivityMasterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>(GetUomFromActivityMasterDocument, options);
        }
export function useGetUomFromActivityMasterSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>(GetUomFromActivityMasterDocument, options);
        }
export type GetUomFromActivityMasterQueryHookResult = ReturnType<typeof useGetUomFromActivityMasterQuery>;
export type GetUomFromActivityMasterLazyQueryHookResult = ReturnType<typeof useGetUomFromActivityMasterLazyQuery>;
export type GetUomFromActivityMasterSuspenseQueryHookResult = ReturnType<typeof useGetUomFromActivityMasterSuspenseQuery>;
export type GetUomFromActivityMasterQueryResult = Apollo.QueryResult<GetUomFromActivityMasterQuery, GetUomFromActivityMasterQueryVariables>;