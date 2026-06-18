import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSupplierMaterialMappingByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetSupplierMaterialMappingByIdQuery = { __typename?: 'query_root', SupplierMaterialMapping: Array<{ __typename?: 'SupplierMaterialMapping', id: any, organization_id: any, supplier_address_mapping_id: any, org_material_master_id: any, From_Year: any, From_Month?: string | null, To_Year: any, To_Month?: string | null, meta_data?: any | null, SupplierAddressMapping?: { __typename?: 'SupplierAddressMapping', id: any, OrgSupplierMaster: { __typename?: 'OrgSupplierMaster', id: any, name: string, code?: string | null } } | null, OrgMaterialMaster?: { __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, type: string } | null }> };


export const GetSupplierMaterialMappingByIdDocument = gql`
    query getSupplierMaterialMappingById($id: uuid!, $organizationId: uuid!) {
  SupplierMaterialMapping(
    where: {id: {_eq: $id}, organization_id: {_eq: $organizationId}, is_deleted: {_eq: false}}
  ) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    meta_data
    SupplierAddressMapping {
      id
      OrgSupplierMaster {
        id
        name
        code
      }
    }
    OrgMaterialMaster {
      id
      name
      code
      type
    }
  }
}
    `;

/**
 * __useGetSupplierMaterialMappingByIdQuery__
 *
 * To run a query within a React component, call `useGetSupplierMaterialMappingByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierMaterialMappingByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierMaterialMappingByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetSupplierMaterialMappingByIdQuery(baseOptions: Apollo.QueryHookOptions<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables> & ({ variables: GetSupplierMaterialMappingByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables>(GetSupplierMaterialMappingByIdDocument, options);
      }
export function useGetSupplierMaterialMappingByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables>(GetSupplierMaterialMappingByIdDocument, options);
        }
export function useGetSupplierMaterialMappingByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables>(GetSupplierMaterialMappingByIdDocument, options);
        }
export type GetSupplierMaterialMappingByIdQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappingByIdQuery>;
export type GetSupplierMaterialMappingByIdLazyQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappingByIdLazyQuery>;
export type GetSupplierMaterialMappingByIdSuspenseQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappingByIdSuspenseQuery>;
export type GetSupplierMaterialMappingByIdQueryResult = Apollo.QueryResult<GetSupplierMaterialMappingByIdQuery, GetSupplierMaterialMappingByIdQueryVariables>;