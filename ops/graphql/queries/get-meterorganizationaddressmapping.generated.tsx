import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMeterOrganizationAddressMappingQueryVariables = Types.Exact<{
  where: Types.MeterOrganizationAddressMapping_Bool_Exp;
}>;


export type GetMeterOrganizationAddressMappingQuery = { __typename?: 'query_root', MeterOrganizationAddressMapping: Array<{ __typename?: 'MeterOrganizationAddressMapping', id: any, meter_number: string, organization_address_id: any, MeterData: Array<{ __typename?: 'MeterData', id: any, filedata_id: any, meter_number: string, organization_address_id: any }> }> };


export const GetMeterOrganizationAddressMappingDocument = gql`
    query GetMeterOrganizationAddressMapping($where: MeterOrganizationAddressMapping_bool_exp!) {
  MeterOrganizationAddressMapping(where: $where) {
    id
    meter_number
    organization_address_id
    MeterData {
      id
      filedata_id
      meter_number
      organization_address_id
    }
  }
}
    `;

/**
 * __useGetMeterOrganizationAddressMappingQuery__
 *
 * To run a query within a React component, call `useGetMeterOrganizationAddressMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeterOrganizationAddressMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeterOrganizationAddressMappingQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetMeterOrganizationAddressMappingQuery(baseOptions: Apollo.QueryHookOptions<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables> & ({ variables: GetMeterOrganizationAddressMappingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables>(GetMeterOrganizationAddressMappingDocument, options);
      }
export function useGetMeterOrganizationAddressMappingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables>(GetMeterOrganizationAddressMappingDocument, options);
        }
export function useGetMeterOrganizationAddressMappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables>(GetMeterOrganizationAddressMappingDocument, options);
        }
export type GetMeterOrganizationAddressMappingQueryHookResult = ReturnType<typeof useGetMeterOrganizationAddressMappingQuery>;
export type GetMeterOrganizationAddressMappingLazyQueryHookResult = ReturnType<typeof useGetMeterOrganizationAddressMappingLazyQuery>;
export type GetMeterOrganizationAddressMappingSuspenseQueryHookResult = ReturnType<typeof useGetMeterOrganizationAddressMappingSuspenseQuery>;
export type GetMeterOrganizationAddressMappingQueryResult = Apollo.QueryResult<GetMeterOrganizationAddressMappingQuery, GetMeterOrganizationAddressMappingQueryVariables>;