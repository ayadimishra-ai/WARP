import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSupplierCodesByCodesQueryVariables = Types.Exact<{
  where: Types.OrgSupplierMaster_Bool_Exp;
}>;


export type GetSupplierCodesByCodesQuery = { __typename?: 'query_root', OrgSupplierMaster: Array<{ __typename?: 'OrgSupplierMaster', id: any, code?: string | null }> };


export const GetSupplierCodesByCodesDocument = gql`
    query getSupplierCodesByCodes($where: OrgSupplierMaster_bool_exp!) {
  OrgSupplierMaster(where: $where, order_by: {updated_at: desc}) {
    id
    code
  }
}
    `;

/**
 * __useGetSupplierCodesByCodesQuery__
 *
 * To run a query within a React component, call `useGetSupplierCodesByCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierCodesByCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierCodesByCodesQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetSupplierCodesByCodesQuery(baseOptions: Apollo.QueryHookOptions<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables> & ({ variables: GetSupplierCodesByCodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables>(GetSupplierCodesByCodesDocument, options);
      }
export function useGetSupplierCodesByCodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables>(GetSupplierCodesByCodesDocument, options);
        }
export function useGetSupplierCodesByCodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables>(GetSupplierCodesByCodesDocument, options);
        }
export type GetSupplierCodesByCodesQueryHookResult = ReturnType<typeof useGetSupplierCodesByCodesQuery>;
export type GetSupplierCodesByCodesLazyQueryHookResult = ReturnType<typeof useGetSupplierCodesByCodesLazyQuery>;
export type GetSupplierCodesByCodesSuspenseQueryHookResult = ReturnType<typeof useGetSupplierCodesByCodesSuspenseQuery>;
export type GetSupplierCodesByCodesQueryResult = Apollo.QueryResult<GetSupplierCodesByCodesQuery, GetSupplierCodesByCodesQueryVariables>;