import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables = Types.Exact<{
  orgAddressId: Types.Scalars['uuid']['input'];
  month: Types.Scalars['String']['input'];
  year: Types.Scalars['Int']['input'];
}>;


export type GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery = { __typename?: 'query_root', GHGEnergy_CaptivePower_Renewable: Array<{ __typename?: 'GHGEnergy_CaptivePower_Renewable', id: any, Type_of_Technology_Used?: string | null, Year_of_installation?: number | null, Unit_of_Energy_Generated_in_Kwh?: any | null, GHGEnergyConsumption_CaptivePower_id: any, created_by?: any | null, updated_by?: any | null, GHGEnergy_CaptivePower: { __typename?: 'GHGEnergy_CaptivePower', id: any, task_request_id: any, Type_of_Captive_Power?: string | null, TaskRequest: { __typename?: 'TaskRequest', id: any, year?: number | null, month: string, organization_address_id: any } } }> };


export const GetCaptivePowerRenewableByYearMonthOrgAddressIdDocument = gql`
    query getCaptivePowerRenewableByYearMonthOrgAddressId($orgAddressId: uuid!, $month: String!, $year: Int!) {
  GHGEnergy_CaptivePower_Renewable(
    where: {GHGEnergy_CaptivePower: {TaskRequest: {organization_address_id: {_eq: $orgAddressId}, month: {_eq: $month}, year: {_eq: $year}}}}
  ) {
    id
    Type_of_Technology_Used
    Year_of_installation
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
 * __useGetCaptivePowerRenewableByYearMonthOrgAddressIdQuery__
 *
 * To run a query within a React component, call `useGetCaptivePowerRenewableByYearMonthOrgAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCaptivePowerRenewableByYearMonthOrgAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCaptivePowerRenewableByYearMonthOrgAddressIdQuery({
 *   variables: {
 *      orgAddressId: // value for 'orgAddressId'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetCaptivePowerRenewableByYearMonthOrgAddressIdQuery(baseOptions: Apollo.QueryHookOptions<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables> & ({ variables: GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables>(GetCaptivePowerRenewableByYearMonthOrgAddressIdDocument, options);
      }
export function useGetCaptivePowerRenewableByYearMonthOrgAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables>(GetCaptivePowerRenewableByYearMonthOrgAddressIdDocument, options);
        }
export function useGetCaptivePowerRenewableByYearMonthOrgAddressIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables>(GetCaptivePowerRenewableByYearMonthOrgAddressIdDocument, options);
        }
export type GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryHookResult = ReturnType<typeof useGetCaptivePowerRenewableByYearMonthOrgAddressIdQuery>;
export type GetCaptivePowerRenewableByYearMonthOrgAddressIdLazyQueryHookResult = ReturnType<typeof useGetCaptivePowerRenewableByYearMonthOrgAddressIdLazyQuery>;
export type GetCaptivePowerRenewableByYearMonthOrgAddressIdSuspenseQueryHookResult = ReturnType<typeof useGetCaptivePowerRenewableByYearMonthOrgAddressIdSuspenseQuery>;
export type GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryResult = Apollo.QueryResult<GetCaptivePowerRenewableByYearMonthOrgAddressIdQuery, GetCaptivePowerRenewableByYearMonthOrgAddressIdQueryVariables>;