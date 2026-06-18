import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUoMconversionFactorQueryVariables = Types.Exact<{
  where: Types.UomConversionMaster_Bool_Exp;
}>;


export type GetUoMconversionFactorQuery = { __typename?: 'query_root', UomConversionMaster: Array<{ __typename?: 'UomConversionMaster', id: any, from_key: string, to_key: string, factor: any }> };


export const GetUoMconversionFactorDocument = gql`
    query getUOMconversionFactor($where: UomConversionMaster_bool_exp!) {
  UomConversionMaster(where: $where) {
    id
    from_key
    to_key
    factor
  }
}
    `;

/**
 * __useGetUoMconversionFactorQuery__
 *
 * To run a query within a React component, call `useGetUoMconversionFactorQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUoMconversionFactorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUoMconversionFactorQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetUoMconversionFactorQuery(baseOptions: Apollo.QueryHookOptions<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables> & ({ variables: GetUoMconversionFactorQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables>(GetUoMconversionFactorDocument, options);
      }
export function useGetUoMconversionFactorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables>(GetUoMconversionFactorDocument, options);
        }
export function useGetUoMconversionFactorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables>(GetUoMconversionFactorDocument, options);
        }
export type GetUoMconversionFactorQueryHookResult = ReturnType<typeof useGetUoMconversionFactorQuery>;
export type GetUoMconversionFactorLazyQueryHookResult = ReturnType<typeof useGetUoMconversionFactorLazyQuery>;
export type GetUoMconversionFactorSuspenseQueryHookResult = ReturnType<typeof useGetUoMconversionFactorSuspenseQuery>;
export type GetUoMconversionFactorQueryResult = Apollo.QueryResult<GetUoMconversionFactorQuery, GetUoMconversionFactorQueryVariables>;