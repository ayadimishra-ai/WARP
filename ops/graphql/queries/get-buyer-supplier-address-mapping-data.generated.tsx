import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetBuyerSupplierAddressMappingDataQueryVariables = Types.Exact<{
  where: Types.BuyerSupplierAddressMappings_Bool_Exp;
}>;


export type GetBuyerSupplierAddressMappingDataQuery = { __typename?: 'query_root', BuyerSupplierAddressMappings: Array<{ __typename?: 'BuyerSupplierAddressMappings', metadata?: any | null, status?: string | null, buyerOrgid?: any | null, id: any, supplierOrgid?: any | null, supplierOrgAddresId?: any | null, BuyerSupplierAddresId?: any | null, Organization?: { __typename?: 'Organization', name: string } | null, organizationBySupplierorgid?: { __typename?: 'Organization', name: string } | null }> };


export const GetBuyerSupplierAddressMappingDataDocument = gql`
    query GetBuyerSupplierAddressMappingData($where: BuyerSupplierAddressMappings_bool_exp!) {
  BuyerSupplierAddressMappings(where: $where) {
    metadata
    status
    buyerOrgid
    id
    supplierOrgid
    supplierOrgAddresId
    BuyerSupplierAddresId
    Organization {
      name
    }
    organizationBySupplierorgid {
      name
    }
  }
}
    `;

/**
 * __useGetBuyerSupplierAddressMappingDataQuery__
 *
 * To run a query within a React component, call `useGetBuyerSupplierAddressMappingDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuyerSupplierAddressMappingDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuyerSupplierAddressMappingDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetBuyerSupplierAddressMappingDataQuery(baseOptions: Apollo.QueryHookOptions<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables> & ({ variables: GetBuyerSupplierAddressMappingDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables>(GetBuyerSupplierAddressMappingDataDocument, options);
      }
export function useGetBuyerSupplierAddressMappingDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables>(GetBuyerSupplierAddressMappingDataDocument, options);
        }
export function useGetBuyerSupplierAddressMappingDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables>(GetBuyerSupplierAddressMappingDataDocument, options);
        }
export type GetBuyerSupplierAddressMappingDataQueryHookResult = ReturnType<typeof useGetBuyerSupplierAddressMappingDataQuery>;
export type GetBuyerSupplierAddressMappingDataLazyQueryHookResult = ReturnType<typeof useGetBuyerSupplierAddressMappingDataLazyQuery>;
export type GetBuyerSupplierAddressMappingDataSuspenseQueryHookResult = ReturnType<typeof useGetBuyerSupplierAddressMappingDataSuspenseQuery>;
export type GetBuyerSupplierAddressMappingDataQueryResult = Apollo.QueryResult<GetBuyerSupplierAddressMappingDataQuery, GetBuyerSupplierAddressMappingDataQueryVariables>;