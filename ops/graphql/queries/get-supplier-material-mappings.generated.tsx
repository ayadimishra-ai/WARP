import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSupplierMaterialMappigQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetSupplierMaterialMappigQuery = { __typename?: 'query_root', SupplierMaterialMapping: Array<{ __typename?: 'SupplierMaterialMapping', id: any, organization_id: any, supplier_address_mapping_id: any, org_material_master_id: any, From_Year: any, From_Month?: string | null, To_Year: any, To_Month?: string | null, meta_data?: any | null }> };


export const GetSupplierMaterialMappigDocument = gql`
    query getSupplierMaterialMappig($organizationId: uuid!) {
  SupplierMaterialMapping(where: {organization_id: {_eq: $organizationId}}) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    meta_data
  }
}
    `;

/**
 * __useGetSupplierMaterialMappigQuery__
 *
 * To run a query within a React component, call `useGetSupplierMaterialMappigQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierMaterialMappigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierMaterialMappigQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetSupplierMaterialMappigQuery(baseOptions: Apollo.QueryHookOptions<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables> & ({ variables: GetSupplierMaterialMappigQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables>(GetSupplierMaterialMappigDocument, options);
      }
export function useGetSupplierMaterialMappigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables>(GetSupplierMaterialMappigDocument, options);
        }
export function useGetSupplierMaterialMappigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables>(GetSupplierMaterialMappigDocument, options);
        }
export type GetSupplierMaterialMappigQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappigQuery>;
export type GetSupplierMaterialMappigLazyQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappigLazyQuery>;
export type GetSupplierMaterialMappigSuspenseQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappigSuspenseQuery>;
export type GetSupplierMaterialMappigQueryResult = Apollo.QueryResult<GetSupplierMaterialMappigQuery, GetSupplierMaterialMappigQueryVariables>;