import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetValidationDataForTransportDownstreamQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  userId: Types.Scalars['uuid']['input'];
  skuClientMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  activityLocationMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  destinationLocationMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetValidationDataForTransportDownstreamQuery = { __typename?: 'query_root', products_skus: Array<{ __typename?: 'OrgSKUMaster', id: any, client_master_id?: string | null, OrgProductMaster: { __typename?: 'OrgProductMaster', id: any, client_master_id?: string | null } }>, activity_locations: Array<{ __typename?: 'Addresses', id: any, client_master_id?: string | null }>, destination_locations: Array<{ __typename?: 'Addresses', id: any, client_master_id?: string | null }>, activity_masters: Array<{ __typename?: 'ActivityMaster', master_key: string, master_data: any }> };


export const GetValidationDataForTransportDownstreamDocument = gql`
    query getValidationDataForTransportDownstream($organizationId: uuid!, $userId: uuid!, $skuClientMasterIds: [String!]!, $activityLocationMasterIds: [String!]!, $destinationLocationMasterIds: [String!]!) {
  products_skus: OrgSKUMaster(
    where: {client_master_id: {_in: $skuClientMasterIds}}
  ) {
    id
    client_master_id
    OrgProductMaster {
      id
      client_master_id
    }
  }
  activity_locations: Addresses(
    where: {_and: [{client_master_id: {_in: $activityLocationMasterIds}}, {OrganizationAddresses: {_and: [{organization_id: {_eq: $organizationId}}, {UserOrganizationAddressMappings: {user_id: {_eq: $userId}, activities: {_contains: ["transport"]}}}]}}, {type: {_eq: "Manufacturing"}}]}
  ) {
    id
    client_master_id
  }
  destination_locations: Addresses(
    where: {_and: [{client_master_id: {_in: $destinationLocationMasterIds}}, {_or: [{SupplierAddressMappings: {OrgSupplierMaster: {organization_id: {_eq: $organizationId}, category: {_eq: "Finished Goods"}}}}, {OrganizationAddresses: {organization_id: {_eq: $organizationId}}}]}]}
  ) {
    id
    client_master_id
  }
  activity_masters: ActivityMaster(
    where: {master_key: {_in: ["transport_downstream_quantity_of_fuel_consumed_UOM", "transport_downstream_transport_managed_by", "transport_downstream_mode_of_transport", "transport_downstream_road_vehicle_type", "transport_downstream_fuel_used"]}}
  ) {
    master_key
    master_data
  }
}
    `;

/**
 * __useGetValidationDataForTransportDownstreamQuery__
 *
 * To run a query within a React component, call `useGetValidationDataForTransportDownstreamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidationDataForTransportDownstreamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidationDataForTransportDownstreamQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      userId: // value for 'userId'
 *      skuClientMasterIds: // value for 'skuClientMasterIds'
 *      activityLocationMasterIds: // value for 'activityLocationMasterIds'
 *      destinationLocationMasterIds: // value for 'destinationLocationMasterIds'
 *   },
 * });
 */
export function useGetValidationDataForTransportDownstreamQuery(baseOptions: Apollo.QueryHookOptions<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables> & ({ variables: GetValidationDataForTransportDownstreamQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables>(GetValidationDataForTransportDownstreamDocument, options);
      }
export function useGetValidationDataForTransportDownstreamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables>(GetValidationDataForTransportDownstreamDocument, options);
        }
export function useGetValidationDataForTransportDownstreamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables>(GetValidationDataForTransportDownstreamDocument, options);
        }
export type GetValidationDataForTransportDownstreamQueryHookResult = ReturnType<typeof useGetValidationDataForTransportDownstreamQuery>;
export type GetValidationDataForTransportDownstreamLazyQueryHookResult = ReturnType<typeof useGetValidationDataForTransportDownstreamLazyQuery>;
export type GetValidationDataForTransportDownstreamSuspenseQueryHookResult = ReturnType<typeof useGetValidationDataForTransportDownstreamSuspenseQuery>;
export type GetValidationDataForTransportDownstreamQueryResult = Apollo.QueryResult<GetValidationDataForTransportDownstreamQuery, GetValidationDataForTransportDownstreamQueryVariables>;