import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUoMconversionFactordataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUoMconversionFactordataQuery = { __typename?: 'query_root', UomConversionMaster: Array<{ __typename?: 'UomConversionMaster', id: any, from_key: string, to_key: string, factor: any, metadata?: any | null }> };


export const GetUoMconversionFactordataDocument = gql`
    query getUOMconversionFactordata {
  UomConversionMaster {
    id
    from_key
    to_key
    factor
    metadata
  }
}
    `;

/**
 * __useGetUoMconversionFactordataQuery__
 *
 * To run a query within a React component, call `useGetUoMconversionFactordataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUoMconversionFactordataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUoMconversionFactordataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUoMconversionFactordataQuery(baseOptions?: Apollo.QueryHookOptions<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>(GetUoMconversionFactordataDocument, options);
      }
export function useGetUoMconversionFactordataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>(GetUoMconversionFactordataDocument, options);
        }
export function useGetUoMconversionFactordataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>(GetUoMconversionFactordataDocument, options);
        }
export type GetUoMconversionFactordataQueryHookResult = ReturnType<typeof useGetUoMconversionFactordataQuery>;
export type GetUoMconversionFactordataLazyQueryHookResult = ReturnType<typeof useGetUoMconversionFactordataLazyQuery>;
export type GetUoMconversionFactordataSuspenseQueryHookResult = ReturnType<typeof useGetUoMconversionFactordataSuspenseQuery>;
export type GetUoMconversionFactordataQueryResult = Apollo.QueryResult<GetUoMconversionFactordataQuery, GetUoMconversionFactordataQueryVariables>;