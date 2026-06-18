import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetLocationTransportDownstreamQueryVariables = Types.Exact<{
  destinationLocationMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  activitylocationmasterid: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetLocationTransportDownstreamQuery = { __typename?: 'query_root', destination_locations: Array<{ __typename?: 'Addresses', id: any, name: string, code?: string | null, client_master_id?: string | null, pincode?: string | null, full_address: string, latitude?: any | null, longitude?: any | null }>, activitylocationaddress: Array<{ __typename?: 'Addresses', id: any, name: string, code?: string | null, client_master_id?: string | null, pincode?: string | null, full_address: string, latitude?: any | null, longitude?: any | null }>, VehicleTypeMaster: Array<{ __typename?: 'VehicleTypeMaster', category: string, name: string, code?: string | null, configuration_value?: any | null }>, UomConversionMaster: Array<{ __typename?: 'UomConversionMaster', from_key: string, to_key: string, factor: any, metadata?: any | null }> };


export const GetLocationTransportDownstreamDocument = gql`
    query getLocationTransportDownstream($destinationLocationMasterIds: [String!]!, $activitylocationmasterid: [String!]!) {
  destination_locations: Addresses(
    where: {client_master_id: {_in: $destinationLocationMasterIds}}
  ) {
    id
    name
    code
    client_master_id
    pincode
    full_address
    latitude
    longitude
  }
  activitylocationaddress: Addresses(
    where: {client_master_id: {_in: $activitylocationmasterid}}
  ) {
    id
    name
    code
    client_master_id
    pincode
    full_address
    latitude
    longitude
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
    metadata
  }
}
    `;

/**
 * __useGetLocationTransportDownstreamQuery__
 *
 * To run a query within a React component, call `useGetLocationTransportDownstreamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLocationTransportDownstreamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLocationTransportDownstreamQuery({
 *   variables: {
 *      destinationLocationMasterIds: // value for 'destinationLocationMasterIds'
 *      activitylocationmasterid: // value for 'activitylocationmasterid'
 *   },
 * });
 */
export function useGetLocationTransportDownstreamQuery(baseOptions: Apollo.QueryHookOptions<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables> & ({ variables: GetLocationTransportDownstreamQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables>(GetLocationTransportDownstreamDocument, options);
      }
export function useGetLocationTransportDownstreamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables>(GetLocationTransportDownstreamDocument, options);
        }
export function useGetLocationTransportDownstreamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables>(GetLocationTransportDownstreamDocument, options);
        }
export type GetLocationTransportDownstreamQueryHookResult = ReturnType<typeof useGetLocationTransportDownstreamQuery>;
export type GetLocationTransportDownstreamLazyQueryHookResult = ReturnType<typeof useGetLocationTransportDownstreamLazyQuery>;
export type GetLocationTransportDownstreamSuspenseQueryHookResult = ReturnType<typeof useGetLocationTransportDownstreamSuspenseQuery>;
export type GetLocationTransportDownstreamQueryResult = Apollo.QueryResult<GetLocationTransportDownstreamQuery, GetLocationTransportDownstreamQueryVariables>;