import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetghgTransportUpstreamByActivityTaskRequestQueryVariables = Types.Exact<{
  task_request_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetghgTransportUpstreamByActivityTaskRequestQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Material_Procured?: string | null, Material_ID?: string | null, Supplier_Status?: string | null, Third_Party_Suppliers_of_Material?: string | null, Supplier_code?: string | null, Locations_Procured_From?: string | null, Location_pin_or_zip_code?: string | null, Transport_Managed_by?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, Material_Quantity_Procured?: any | null, Material_Quantity_Procured_uom?: string | null, Distance_per_Trip?: any | null, Distance_per_Trip_uom?: string | null, Number_of_Trips?: any | null, Quantity_of_Fuel_Consumed?: any | null, Quantity_of_Fuel_Consumed_uom?: string | null, supporting_docs?: any | null, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, updated_at: any, updated_by?: any | null, created_at: any, created_by?: any | null, total_distance_travelled?: any | null, total_distance_travelled_uom?: string | null, TaskRequest: { __typename?: 'TaskRequest', month: string, year?: number | null }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> };


export const GetghgTransportUpstreamByActivityTaskRequestDocument = gql`
    query getghgTransportUpstreamByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGTransport_Upstream(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Material_Procured
    Material_ID
    Supplier_Status
    Third_Party_Suppliers_of_Material
    Supplier_code
    Locations_Procured_From
    Location_pin_or_zip_code
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Material_Quantity_Procured
    Material_Quantity_Procured_uom
    Distance_per_Trip
    Distance_per_Trip_uom
    Number_of_Trips
    Quantity_of_Fuel_Consumed
    Quantity_of_Fuel_Consumed_uom
    supporting_docs
    kpi_Distance_Travelled
    kpi_Distance_Travelled_uom
    kpi_em_EmissionBy_TravelledDistance
    kpi_emf_EmissionBy_TravelledDistance
    kpi_em_EmissionBy_MaterialProcured
    kpi_emf_EmissionBy_MaterialProcured
    updated_at
    updated_by
    created_at
    created_by
    total_distance_travelled
    total_distance_travelled_uom
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
 * __useGetghgTransportUpstreamByActivityTaskRequestQuery__
 *
 * To run a query within a React component, call `useGetghgTransportUpstreamByActivityTaskRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetghgTransportUpstreamByActivityTaskRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetghgTransportUpstreamByActivityTaskRequestQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetghgTransportUpstreamByActivityTaskRequestQuery(baseOptions: Apollo.QueryHookOptions<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables> & ({ variables: GetghgTransportUpstreamByActivityTaskRequestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables>(GetghgTransportUpstreamByActivityTaskRequestDocument, options);
      }
export function useGetghgTransportUpstreamByActivityTaskRequestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables>(GetghgTransportUpstreamByActivityTaskRequestDocument, options);
        }
export function useGetghgTransportUpstreamByActivityTaskRequestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables>(GetghgTransportUpstreamByActivityTaskRequestDocument, options);
        }
export type GetghgTransportUpstreamByActivityTaskRequestQueryHookResult = ReturnType<typeof useGetghgTransportUpstreamByActivityTaskRequestQuery>;
export type GetghgTransportUpstreamByActivityTaskRequestLazyQueryHookResult = ReturnType<typeof useGetghgTransportUpstreamByActivityTaskRequestLazyQuery>;
export type GetghgTransportUpstreamByActivityTaskRequestSuspenseQueryHookResult = ReturnType<typeof useGetghgTransportUpstreamByActivityTaskRequestSuspenseQuery>;
export type GetghgTransportUpstreamByActivityTaskRequestQueryResult = Apollo.QueryResult<GetghgTransportUpstreamByActivityTaskRequestQuery, GetghgTransportUpstreamByActivityTaskRequestQueryVariables>;