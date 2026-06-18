import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgWasteByTaskRequestIdsQueryVariables = Types.Exact<{
  taskRequestId: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetGhgWasteByTaskRequestIdsQuery = { __typename?: 'query_root', GHGWaste: Array<{ __typename?: 'GHGWaste', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, Types_of_Waste_Generated?: string | null, Waste_Disposal_Managed_by?: string | null, Name_of_Third_Party?: string | null, Quantity_of_Waste?: any | null, Quantity_of_Waste_UoM?: string | null, Disposal_Mechanism?: string | null, Location_of_Waste_Disposal?: string | null, Location_pin_or_zip_code?: string | null, Who_Managed_Transportation_of_Waste?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation?: string | null, DistOf_WasteDisposalLoction_from_FacilityLocation_UoM?: string | null, kpi_DistanceTravlled_For_WasteManagement?: any | null, kpi_DistanceTravlled_For_WasteManagement_uom?: string | null, kpi_em_EmissionBy_TransportFor_WasteManagement?: any | null, kpi_emf_EmissionBy_TransportFor_WasteManagement?: any | null, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, kpi_em_EmissionBy_Generation_of_Waste_Type?: any | null, kpi_emf_EmissionBy_Generation_of_Waste_Type?: any | null, TaskRequest: { __typename?: 'TaskRequest', month: string, year?: number | null }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> };


export const GetGhgWasteByTaskRequestIdsDocument = gql`
    query getGHGWasteByTaskRequestIds($taskRequestId: [uuid!]!) {
  GHGWaste(where: {task_request_id: {_in: $taskRequestId}}) {
    id
    task_request_id
    organization_address_id
    activity_task_request_id
    Types_of_Waste_Generated
    Waste_Disposal_Managed_by
    Name_of_Third_Party
    Quantity_of_Waste
    Quantity_of_Waste_UoM
    Disposal_Mechanism
    Location_of_Waste_Disposal
    Location_pin_or_zip_code
    Who_Managed_Transportation_of_Waste
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    DistOf_WasteDisposalLoction_from_FacilityLocation
    DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
    kpi_DistanceTravlled_For_WasteManagement
    kpi_DistanceTravlled_For_WasteManagement_uom
    kpi_em_EmissionBy_TransportFor_WasteManagement
    kpi_emf_EmissionBy_TransportFor_WasteManagement
    created_at
    updated_at
    created_by
    updated_by
    kpi_em_EmissionBy_Generation_of_Waste_Type
    kpi_emf_EmissionBy_Generation_of_Waste_Type
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
}
    `;

/**
 * __useGetGhgWasteByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetGhgWasteByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgWasteByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgWasteByTaskRequestIdsQuery({
 *   variables: {
 *      taskRequestId: // value for 'taskRequestId'
 *   },
 * });
 */
export function useGetGhgWasteByTaskRequestIdsQuery(baseOptions: Apollo.QueryHookOptions<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables> & ({ variables: GetGhgWasteByTaskRequestIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables>(GetGhgWasteByTaskRequestIdsDocument, options);
      }
export function useGetGhgWasteByTaskRequestIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables>(GetGhgWasteByTaskRequestIdsDocument, options);
        }
export function useGetGhgWasteByTaskRequestIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables>(GetGhgWasteByTaskRequestIdsDocument, options);
        }
export type GetGhgWasteByTaskRequestIdsQueryHookResult = ReturnType<typeof useGetGhgWasteByTaskRequestIdsQuery>;
export type GetGhgWasteByTaskRequestIdsLazyQueryHookResult = ReturnType<typeof useGetGhgWasteByTaskRequestIdsLazyQuery>;
export type GetGhgWasteByTaskRequestIdsSuspenseQueryHookResult = ReturnType<typeof useGetGhgWasteByTaskRequestIdsSuspenseQuery>;
export type GetGhgWasteByTaskRequestIdsQueryResult = Apollo.QueryResult<GetGhgWasteByTaskRequestIdsQuery, GetGhgWasteByTaskRequestIdsQueryVariables>;