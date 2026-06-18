import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetRegionLocationAndAppGlobalMasterDataQueryVariables = Types.Exact<{
  key: Types.Scalars['String']['input'];
  type: Types.Scalars['String']['input'];
  organizationId: Types.Scalars['uuid']['input'];
  userId: Types.Scalars['uuid']['input'];
}>;


export type GetRegionLocationAndAppGlobalMasterDataQuery = { __typename?: 'query_root', Region: Array<{ __typename?: 'Region', id: any, name: string, code: string }>, AppGlobalMaster: Array<{ __typename?: 'AppGlobalMaster', key: string, data: any }>, Organization: Array<{ __typename?: 'Organization', id: any, Baselineyear: number, FinancialYearMonth: string, metadata?: any | null }>, UserOrganizationAddressMapping: Array<{ __typename?: 'UserOrganizationAddressMapping', organization_address_id?: any | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', id: any, Address: { __typename?: 'Addresses', id: any, name: string, City?: { __typename?: 'City', name: string } | null } } | null }> };


export const GetRegionLocationAndAppGlobalMasterDataDocument = gql`
    query getRegionLocationAndAppGlobalMasterData($key: String!, $type: String!, $organizationId: uuid!, $userId: uuid!) {
  Region {
    id
    name
    code
  }
  AppGlobalMaster(where: {_and: [{type: {_eq: $type}}, {key: {_eq: $key}}]}) {
    key
    data
  }
  Organization(where: {id: {_eq: $organizationId}}) {
    id
    Baselineyear
    FinancialYearMonth
    metadata
  }
  UserOrganizationAddressMapping(
    where: {organization_id: {_eq: $organizationId}, user_id: {_eq: $userId}}
  ) {
    organization_address_id
    OrganizationAddress {
      id
      Address {
        id
        name
        City {
          name
        }
      }
    }
  }
}
    `;

/**
 * __useGetRegionLocationAndAppGlobalMasterDataQuery__
 *
 * To run a query within a React component, call `useGetRegionLocationAndAppGlobalMasterDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegionLocationAndAppGlobalMasterDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegionLocationAndAppGlobalMasterDataQuery({
 *   variables: {
 *      key: // value for 'key'
 *      type: // value for 'type'
 *      organizationId: // value for 'organizationId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetRegionLocationAndAppGlobalMasterDataQuery(baseOptions: Apollo.QueryHookOptions<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables> & ({ variables: GetRegionLocationAndAppGlobalMasterDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables>(GetRegionLocationAndAppGlobalMasterDataDocument, options);
      }
export function useGetRegionLocationAndAppGlobalMasterDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables>(GetRegionLocationAndAppGlobalMasterDataDocument, options);
        }
export function useGetRegionLocationAndAppGlobalMasterDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables>(GetRegionLocationAndAppGlobalMasterDataDocument, options);
        }
export type GetRegionLocationAndAppGlobalMasterDataQueryHookResult = ReturnType<typeof useGetRegionLocationAndAppGlobalMasterDataQuery>;
export type GetRegionLocationAndAppGlobalMasterDataLazyQueryHookResult = ReturnType<typeof useGetRegionLocationAndAppGlobalMasterDataLazyQuery>;
export type GetRegionLocationAndAppGlobalMasterDataSuspenseQueryHookResult = ReturnType<typeof useGetRegionLocationAndAppGlobalMasterDataSuspenseQuery>;
export type GetRegionLocationAndAppGlobalMasterDataQueryResult = Apollo.QueryResult<GetRegionLocationAndAppGlobalMasterDataQuery, GetRegionLocationAndAppGlobalMasterDataQueryVariables>;