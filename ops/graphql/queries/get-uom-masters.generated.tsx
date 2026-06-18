import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUomMastersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUomMastersQuery = { __typename?: 'query_root', UomMaster: Array<{ __typename?: 'UomMaster', key?: string | null, code?: string | null, label?: string | null, alias?: any | null }>, FuelTypeMaster: Array<{ __typename?: 'FuelTypeMaster', code: string, label: string }> };


export const GetUomMastersDocument = gql`
    query getUomMasters @cached(ttl: 3600) {
  UomMaster {
    key
    code
    label
    alias: metadata(path: "$.alias")
  }
  FuelTypeMaster(where: {is_deleted: {_neq: true}}) {
    code
    label
  }
}
    `;

/**
 * __useGetUomMastersQuery__
 *
 * To run a query within a React component, call `useGetUomMastersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUomMastersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUomMastersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUomMastersQuery(baseOptions?: Apollo.QueryHookOptions<GetUomMastersQuery, GetUomMastersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUomMastersQuery, GetUomMastersQueryVariables>(GetUomMastersDocument, options);
      }
export function useGetUomMastersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUomMastersQuery, GetUomMastersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUomMastersQuery, GetUomMastersQueryVariables>(GetUomMastersDocument, options);
        }
export function useGetUomMastersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUomMastersQuery, GetUomMastersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUomMastersQuery, GetUomMastersQueryVariables>(GetUomMastersDocument, options);
        }
export type GetUomMastersQueryHookResult = ReturnType<typeof useGetUomMastersQuery>;
export type GetUomMastersLazyQueryHookResult = ReturnType<typeof useGetUomMastersLazyQuery>;
export type GetUomMastersSuspenseQueryHookResult = ReturnType<typeof useGetUomMastersSuspenseQuery>;
export type GetUomMastersQueryResult = Apollo.QueryResult<GetUomMastersQuery, GetUomMastersQueryVariables>;