import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables = Types.Exact<{
  orgAddressId: Types.Scalars['uuid']['input'];
  month: Types.Scalars['String']['input'];
  year: Types.Scalars['Int']['input'];
}>;


export type GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery = { __typename?: 'query_root', GHGEnergy_CaptivePower_NonRenewable: Array<{ __typename?: 'GHGEnergy_CaptivePower_NonRenewable', id: any, Type_of_Fuel_Used?: string | null, Quantity_of_fuel_consumed?: any | null, Quantity_of_fuel_consumed_uom?: string | null, Quality_of_fuel?: any | null, Unit_of_Energy_Generated_in_Kwh?: any | null, GHGEnergyConsumption_CaptivePower_id: any, created_by?: any | null, updated_by?: any | null, GHGEnergy_CaptivePower: { __typename?: 'GHGEnergy_CaptivePower', id: any, task_request_id: any, Type_of_Captive_Power?: string | null, TaskRequest: { __typename?: 'TaskRequest', id: any, year?: number | null, month: string, organization_address_id: any } } }> };


export const GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdDocument = gql`
    query getCaptivePowerNonRenewableFuelByYearMonthOrgAddressId($orgAddressId: uuid!, $month: String!, $year: Int!) {
  GHGEnergy_CaptivePower_NonRenewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_eq: $orgAddressId}, month: {_eq: $month}, year: {_eq: $year}}}}
  ) {
    id
    Type_of_Fuel_Used
    Quantity_of_fuel_consumed
    Quantity_of_fuel_consumed_uom
    Quality_of_fuel
    Unit_of_Energy_Generated_in_Kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      TaskRequest {
        id
        year
        month
        organization_address_id
      }
    }
  }
}
    `;

/**
 * __useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery__
 *
 * To run a query within a React component, call `useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery({
 *   variables: {
 *      orgAddressId: // value for 'orgAddressId'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery(baseOptions: Apollo.QueryHookOptions<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables> & ({ variables: GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables>(GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdDocument, options);
      }
export function useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables>(GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdDocument, options);
        }
export function useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables>(GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdDocument, options);
        }
export type GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryHookResult = ReturnType<typeof useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery>;
export type GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdLazyQueryHookResult = ReturnType<typeof useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdLazyQuery>;
export type GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdSuspenseQueryHookResult = ReturnType<typeof useGetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdSuspenseQuery>;
export type GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryResult = Apollo.QueryResult<GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQuery, GetCaptivePowerNonRenewableFuelByYearMonthOrgAddressIdQueryVariables>;