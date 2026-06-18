import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GettransportupstreamlocationdataQueryVariables = Types.Exact<{
  materialmasterid: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  procuredlocationmasterid: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  activitylocationmasterid: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GettransportupstreamlocationdataQuery = { __typename?: 'query_root', procuredlocationaddress: Array<{ __typename?: 'Addresses', id: any, client_master_id?: string | null, name: string, pincode?: string | null, latitude?: any | null, longitude?: any | null, OrganizationAddresses: Array<{ __typename?: 'OrganizationAddress', id: any }> }>, activitylocationaddress: Array<{ __typename?: 'Addresses', id: any, client_master_id?: string | null, name: string, pincode?: string | null, latitude?: any | null, longitude?: any | null, OrganizationAddresses: Array<{ __typename?: 'OrganizationAddress', id: any }> }>, OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, client_master_id?: string | null, type: string }>, VehicleTypeMaster: Array<{ __typename?: 'VehicleTypeMaster', category: string, name: string, code?: string | null, configuration_value?: any | null }>, UomConversionMaster: Array<{ __typename?: 'UomConversionMaster', from_key: string, to_key: string, factor: any, metadata?: any | null }> };


export const GettransportupstreamlocationdataDocument = gql`
    query gettransportupstreamlocationdata($materialmasterid: [String!]!, $procuredlocationmasterid: [String!]!, $activitylocationmasterid: [String!]!) {
  procuredlocationaddress: Addresses(
    where: {client_master_id: {_in: $procuredlocationmasterid}}
  ) {
    id
    client_master_id
    name
    pincode
    latitude
    longitude
    OrganizationAddresses {
      id
    }
  }
  activitylocationaddress: Addresses(
    where: {client_master_id: {_in: $activitylocationmasterid}}
  ) {
    id
    client_master_id
    name
    pincode
    latitude
    longitude
    OrganizationAddresses {
      id
    }
  }
  OrgMaterialMaster(
    where: {_and: {client_master_id: {_in: $materialmasterid}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
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
 * __useGettransportupstreamlocationdataQuery__
 *
 * To run a query within a React component, call `useGettransportupstreamlocationdataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGettransportupstreamlocationdataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGettransportupstreamlocationdataQuery({
 *   variables: {
 *      materialmasterid: // value for 'materialmasterid'
 *      procuredlocationmasterid: // value for 'procuredlocationmasterid'
 *      activitylocationmasterid: // value for 'activitylocationmasterid'
 *   },
 * });
 */
export function useGettransportupstreamlocationdataQuery(baseOptions: Apollo.QueryHookOptions<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables> & ({ variables: GettransportupstreamlocationdataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables>(GettransportupstreamlocationdataDocument, options);
      }
export function useGettransportupstreamlocationdataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables>(GettransportupstreamlocationdataDocument, options);
        }
export function useGettransportupstreamlocationdataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables>(GettransportupstreamlocationdataDocument, options);
        }
export type GettransportupstreamlocationdataQueryHookResult = ReturnType<typeof useGettransportupstreamlocationdataQuery>;
export type GettransportupstreamlocationdataLazyQueryHookResult = ReturnType<typeof useGettransportupstreamlocationdataLazyQuery>;
export type GettransportupstreamlocationdataSuspenseQueryHookResult = ReturnType<typeof useGettransportupstreamlocationdataSuspenseQuery>;
export type GettransportupstreamlocationdataQueryResult = Apollo.QueryResult<GettransportupstreamlocationdataQuery, GettransportupstreamlocationdataQueryVariables>;