import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSupplierMaterialMappingsByOrganizationAddressQueryVariables = Types.Exact<{
  organizationAddressId: Types.Scalars['uuid']['input'];
}>;


export type GetSupplierMaterialMappingsByOrganizationAddressQuery = { __typename?: 'query_root', SupplierMaterialMapping: Array<{ __typename?: 'SupplierMaterialMapping', org_material_master_id: any, From_Year: any, From_Month?: string | null, To_Year: any, To_Month?: string | null, SupplierAddressMapping?: { __typename?: 'SupplierAddressMapping', OrganizationAddress?: { __typename?: 'OrganizationAddress', id: any, address_id: any } | null } | null, Organization: { __typename?: 'Organization', id: any, name: string }, OrgMaterialMaster?: { __typename?: 'OrgMaterialMaster', id: any, code?: string | null, name: string, Material_Description?: string | null } | null }> };


export const GetSupplierMaterialMappingsByOrganizationAddressDocument = gql`
    query getSupplierMaterialMappingsByOrganizationAddress($organizationAddressId: uuid!) {
  SupplierMaterialMapping(
    where: {SupplierAddressMapping: {supplier_organization_address_id: {_eq: $organizationAddressId}}}
  ) {
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    SupplierAddressMapping {
      OrganizationAddress {
        id
        address_id
      }
    }
    Organization {
      id
      name
    }
    OrgMaterialMaster {
      id
      code
      name
      Material_Description
    }
  }
}
    `;

/**
 * __useGetSupplierMaterialMappingsByOrganizationAddressQuery__
 *
 * To run a query within a React component, call `useGetSupplierMaterialMappingsByOrganizationAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierMaterialMappingsByOrganizationAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierMaterialMappingsByOrganizationAddressQuery({
 *   variables: {
 *      organizationAddressId: // value for 'organizationAddressId'
 *   },
 * });
 */
export function useGetSupplierMaterialMappingsByOrganizationAddressQuery(baseOptions: Apollo.QueryHookOptions<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables> & ({ variables: GetSupplierMaterialMappingsByOrganizationAddressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables>(GetSupplierMaterialMappingsByOrganizationAddressDocument, options);
      }
export function useGetSupplierMaterialMappingsByOrganizationAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables>(GetSupplierMaterialMappingsByOrganizationAddressDocument, options);
        }
export function useGetSupplierMaterialMappingsByOrganizationAddressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables>(GetSupplierMaterialMappingsByOrganizationAddressDocument, options);
        }
export type GetSupplierMaterialMappingsByOrganizationAddressQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappingsByOrganizationAddressQuery>;
export type GetSupplierMaterialMappingsByOrganizationAddressLazyQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappingsByOrganizationAddressLazyQuery>;
export type GetSupplierMaterialMappingsByOrganizationAddressSuspenseQueryHookResult = ReturnType<typeof useGetSupplierMaterialMappingsByOrganizationAddressSuspenseQuery>;
export type GetSupplierMaterialMappingsByOrganizationAddressQueryResult = Apollo.QueryResult<GetSupplierMaterialMappingsByOrganizationAddressQuery, GetSupplierMaterialMappingsByOrganizationAddressQueryVariables>;