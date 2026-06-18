import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetValidationDataForDownstreamExcelQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  organizationaddressId: Types.Scalars['uuid']['input'];
  skucode: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  destinationLocationMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetValidationDataForDownstreamExcelQuery = { __typename?: 'query_root', products_skus: Array<{ __typename?: 'OrgSKUMaster', id: any, client_master_id?: string | null, code?: string | null, weight: any, weight_uom?: string | null, OrgProductMaster: { __typename?: 'OrgProductMaster', id: any, client_master_id?: string | null, code?: string | null } }>, destination_locations: Array<{ __typename?: 'Addresses', id: any, pincode?: string | null, name: string, latitude?: any | null, longitude?: any | null, client_master_id?: string | null }>, activity_locations: Array<{ __typename?: 'OrganizationAddress', id: any, address_id: any, Address: { __typename?: 'Addresses', id: any, pincode?: string | null, name: string, latitude?: any | null, longitude?: any | null, client_master_id?: string | null } }>, VehicleTypeMaster: Array<{ __typename?: 'VehicleTypeMaster', category: string, name: string, code?: string | null, configuration_value?: any | null }>, UomConversionMaster: Array<{ __typename?: 'UomConversionMaster', from_key: string, to_key: string, factor: any }> };


export const GetValidationDataForDownstreamExcelDocument = gql`
    query getValidationDataForDownstreamExcel($organizationId: uuid!, $organizationaddressId: uuid!, $skucode: [String!]!, $destinationLocationMasterIds: [String!]!) {
  products_skus: OrgSKUMaster(where: {code: {_in: $skucode}}) {
    id
    client_master_id
    code
    weight
    weight_uom
    OrgProductMaster {
      id
      client_master_id
      code
    }
  }
  destination_locations: Addresses(
    where: {_and: [{name: {_in: $destinationLocationMasterIds}}, {_or: [{SupplierAddressMappings: {OrgSupplierMaster: {organization_id: {_eq: $organizationId}, category: {_eq: "Finished Goods"}}}}, {OrganizationAddresses: {organization_id: {_eq: $organizationId}}}]}]}
  ) {
    id
    pincode
    name
    latitude
    longitude
    client_master_id
  }
  activity_locations: OrganizationAddress(
    where: {id: {_eq: $organizationaddressId}}
  ) {
    id
    address_id
    Address {
      id
      pincode
      name
      latitude
      longitude
      client_master_id
    }
  }
  VehicleTypeMaster {
    category
    name
    code
    configuration_value
  }
  UomConversionMaster {
    from_key
    to_key
    factor
  }
}
    `;

/**
 * __useGetValidationDataForDownstreamExcelQuery__
 *
 * To run a query within a React component, call `useGetValidationDataForDownstreamExcelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidationDataForDownstreamExcelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidationDataForDownstreamExcelQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      organizationaddressId: // value for 'organizationaddressId'
 *      skucode: // value for 'skucode'
 *      destinationLocationMasterIds: // value for 'destinationLocationMasterIds'
 *   },
 * });
 */
export function useGetValidationDataForDownstreamExcelQuery(baseOptions: Apollo.QueryHookOptions<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables> & ({ variables: GetValidationDataForDownstreamExcelQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables>(GetValidationDataForDownstreamExcelDocument, options);
      }
export function useGetValidationDataForDownstreamExcelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables>(GetValidationDataForDownstreamExcelDocument, options);
        }
export function useGetValidationDataForDownstreamExcelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables>(GetValidationDataForDownstreamExcelDocument, options);
        }
export type GetValidationDataForDownstreamExcelQueryHookResult = ReturnType<typeof useGetValidationDataForDownstreamExcelQuery>;
export type GetValidationDataForDownstreamExcelLazyQueryHookResult = ReturnType<typeof useGetValidationDataForDownstreamExcelLazyQuery>;
export type GetValidationDataForDownstreamExcelSuspenseQueryHookResult = ReturnType<typeof useGetValidationDataForDownstreamExcelSuspenseQuery>;
export type GetValidationDataForDownstreamExcelQueryResult = Apollo.QueryResult<GetValidationDataForDownstreamExcelQuery, GetValidationDataForDownstreamExcelQueryVariables>;