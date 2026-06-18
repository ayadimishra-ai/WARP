import * as Types from '../../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetActivityDataEnergyGridPowerQueryVariables = Types.Exact<{
  organization_address_id: Types.Scalars['uuid']['input'];
}>;


export type GetActivityDataEnergyGridPowerQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', month: string, year?: number | null, energy_grid_power: Array<{ __typename?: 'GHGEnergyConsumption_GridPower', grid_provider?: string | null, grid_kwh?: any | null, ppa_renewable_provider?: string | null, ppa_renewable_kwh?: any | null, ppa_nonrenewable_provider?: string | null, ppa_nonrenewable_kwh?: any | null, rec_provider?: string | null, rec_kwh?: any | null }> }>, emission_factors: Array<{ __typename?: 'CO2EmissionFactorMaster', year: number, activity?: string | null, sub_activity?: string | null, factor: any, factor_uom: string, activity_specific?: any | null, is_default?: any | null, Region?: { __typename?: 'Region', name: string } | null }> };


export const GetActivityDataEnergyGridPowerDocument = gql`
    query getActivityDataEnergyGridPower($organization_address_id: uuid!) {
  TaskRequest(where: {organization_address_id: {_eq: $organization_address_id}}) {
    month
    year
    energy_grid_power: GHGEnergyConsumption_GridPowers {
      grid_provider: Name_of_Distribution_Company
      grid_kwh: PowerConsumed_through_Grid_Kwh
      ppa_renewable_provider: NameOfCompany_PPA_Renewable
      ppa_renewable_kwh: PowerPurchased_through_PPA_Kwh_Renewable
      ppa_nonrenewable_provider: NameOfCompany_PPA_NonRenewable
      ppa_nonrenewable_kwh: PowerPurchased_through_PPA_Kwh_NonRenewable
      rec_provider: Name_of_company_for_REC
      rec_kwh: PowerPurchased_through_REC_Kwh
    }
  }
  emission_factors: CO2EmissionFactorMaster(
    where: {_and: [{category: {_ilike: "energy"}}, {activity: {_ilike: "grid"}}]}
  ) {
    year
    Region {
      name
    }
    activity
    sub_activity
    activity_specific: metadata(path: "$.[0].['Activity Specific']")
    factor
    factor_uom
    is_default: metadata(path: "$.[0].['Default']")
  }
}
    `;

/**
 * __useGetActivityDataEnergyGridPowerQuery__
 *
 * To run a query within a React component, call `useGetActivityDataEnergyGridPowerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataEnergyGridPowerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataEnergyGridPowerQuery({
 *   variables: {
 *      organization_address_id: // value for 'organization_address_id'
 *   },
 * });
 */
export function useGetActivityDataEnergyGridPowerQuery(baseOptions: Apollo.QueryHookOptions<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables> & ({ variables: GetActivityDataEnergyGridPowerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables>(GetActivityDataEnergyGridPowerDocument, options);
      }
export function useGetActivityDataEnergyGridPowerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables>(GetActivityDataEnergyGridPowerDocument, options);
        }
export function useGetActivityDataEnergyGridPowerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables>(GetActivityDataEnergyGridPowerDocument, options);
        }
export type GetActivityDataEnergyGridPowerQueryHookResult = ReturnType<typeof useGetActivityDataEnergyGridPowerQuery>;
export type GetActivityDataEnergyGridPowerLazyQueryHookResult = ReturnType<typeof useGetActivityDataEnergyGridPowerLazyQuery>;
export type GetActivityDataEnergyGridPowerSuspenseQueryHookResult = ReturnType<typeof useGetActivityDataEnergyGridPowerSuspenseQuery>;
export type GetActivityDataEnergyGridPowerQueryResult = Apollo.QueryResult<GetActivityDataEnergyGridPowerQuery, GetActivityDataEnergyGridPowerQueryVariables>;