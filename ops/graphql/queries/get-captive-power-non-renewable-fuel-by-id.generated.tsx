import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCaptivePowerNonRenewableFuelByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetCaptivePowerNonRenewableFuelByIdQuery = { __typename?: 'query_root', GHGEnergy_CaptivePower_NonRenewable: Array<{ __typename?: 'GHGEnergy_CaptivePower_NonRenewable', id: any, Type_of_Fuel_Used?: string | null, Quantity_of_fuel_consumed?: any | null, Quantity_of_fuel_consumed_uom?: string | null, Quality_of_fuel?: any | null, Unit_of_Energy_Generated_in_Kwh?: any | null, supporting_docs?: any | null, kpi_em_Emission_EnergyGenerated_kwh?: any | null, kpi_emf_Emission_EnergyGenerated_kwh?: any | null, GHGEnergyConsumption_CaptivePower_id: any, created_by?: any | null, updated_by?: any | null, GHGEnergy_CaptivePower: { __typename?: 'GHGEnergy_CaptivePower', id: any, task_request_id: any, Type_of_Captive_Power?: string | null, organization_address_id: any, Do_You_Generate_Captive_Power_for_Own_Use?: string | null, TaskRequest: { __typename?: 'TaskRequest', id: any, year?: number | null, month: string, organization_address_id: any } } }> };


export const GetCaptivePowerNonRenewableFuelByIdDocument = gql`
    query getCaptivePowerNonRenewableFuelById($id: uuid!) {
  GHGEnergy_CaptivePower_NonRenewable(where: {id: {_eq: $id}}) {
    id
    Type_of_Fuel_Used
    Quantity_of_fuel_consumed
    Quantity_of_fuel_consumed_uom
    Quality_of_fuel
    Unit_of_Energy_Generated_in_Kwh
    supporting_docs
    kpi_em_Emission_EnergyGenerated_kwh
    kpi_emf_Emission_EnergyGenerated_kwh
    GHGEnergyConsumption_CaptivePower_id
    created_by
    updated_by
    GHGEnergy_CaptivePower {
      id
      task_request_id
      Type_of_Captive_Power
      organization_address_id
      Do_You_Generate_Captive_Power_for_Own_Use
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
 * __useGetCaptivePowerNonRenewableFuelByIdQuery__
 *
 * To run a query within a React component, call `useGetCaptivePowerNonRenewableFuelByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCaptivePowerNonRenewableFuelByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCaptivePowerNonRenewableFuelByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCaptivePowerNonRenewableFuelByIdQuery(baseOptions: Apollo.QueryHookOptions<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables> & ({ variables: GetCaptivePowerNonRenewableFuelByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables>(GetCaptivePowerNonRenewableFuelByIdDocument, options);
      }
export function useGetCaptivePowerNonRenewableFuelByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables>(GetCaptivePowerNonRenewableFuelByIdDocument, options);
        }
export function useGetCaptivePowerNonRenewableFuelByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables>(GetCaptivePowerNonRenewableFuelByIdDocument, options);
        }
export type GetCaptivePowerNonRenewableFuelByIdQueryHookResult = ReturnType<typeof useGetCaptivePowerNonRenewableFuelByIdQuery>;
export type GetCaptivePowerNonRenewableFuelByIdLazyQueryHookResult = ReturnType<typeof useGetCaptivePowerNonRenewableFuelByIdLazyQuery>;
export type GetCaptivePowerNonRenewableFuelByIdSuspenseQueryHookResult = ReturnType<typeof useGetCaptivePowerNonRenewableFuelByIdSuspenseQuery>;
export type GetCaptivePowerNonRenewableFuelByIdQueryResult = Apollo.QueryResult<GetCaptivePowerNonRenewableFuelByIdQuery, GetCaptivePowerNonRenewableFuelByIdQueryVariables>;