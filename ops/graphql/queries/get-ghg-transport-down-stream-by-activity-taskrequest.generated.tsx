import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetghgTransportDownStreamByActivityTaskRequestQueryVariables = Types.Exact<{
  task_request_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetghgTransportDownStreamByActivityTaskRequestQuery = { __typename?: 'query_root', GHGTransport_Downstream: Array<{ __typename?: 'GHGTransport_Downstream', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Which_Products?: string | null, Which_SKUs?: string | null, Destination_Location_Name?: string | null, Destination_pin_or_zip_code?: string | null, Transport_Managed_by?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, Distance_per_trip?: any | null, Distance_per_trip_UoM?: string | null, Quantity_of_Fuel_Consumed?: any | null, Quantity_of_Fuel_Consumed_UoM?: string | null, supporting_docs?: any | null, kpi_Distance_Travelled?: any | null, kpi_Distance_Travelled_uom?: string | null, kpi_em_EmissionBy_TravelledDistance?: any | null, kpi_emf_EmissionBy_TravelledDistance?: any | null, updated_at: any, updated_by?: any | null, Number_of_Trips?: number | null, Number_of_Skus_Transported?: number | null, created_at: any, created_by?: any | null, total_distance_travelled?: any | null, total_distance_travelled_uom?: string | null, kpi_total_weight_transported?: any | null, kpi_total_weight_transported_uom?: string | null, TaskRequest: { __typename?: 'TaskRequest', month: string, year?: number | null }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', country_id?: any | null, Country?: { __typename?: 'Country', region_code?: string | null } | null } } }> };


export const GetghgTransportDownStreamByActivityTaskRequestDocument = gql`
    query getghgTransportDownStreamByActivityTaskRequest($task_request_id: [uuid!]!) {
  GHGTransport_Downstream(where: {task_request_id: {_in: $task_request_id}}) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Which_Products
    Which_SKUs
    Destination_Location_Name
    Destination_pin_or_zip_code
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Distance_per_trip
    Distance_per_trip_UoM
    Quantity_of_Fuel_Consumed
    Quantity_of_Fuel_Consumed_UoM
    supporting_docs
    kpi_Distance_Travelled
    kpi_Distance_Travelled_uom
    kpi_em_EmissionBy_TravelledDistance
    kpi_emf_EmissionBy_TravelledDistance
    updated_at
    updated_by
    Number_of_Trips
    Number_of_Skus_Transported
    created_at
    created_by
    total_distance_travelled
    total_distance_travelled_uom
    kpi_total_weight_transported
    kpi_total_weight_transported_uom
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
 * __useGetghgTransportDownStreamByActivityTaskRequestQuery__
 *
 * To run a query within a React component, call `useGetghgTransportDownStreamByActivityTaskRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetghgTransportDownStreamByActivityTaskRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetghgTransportDownStreamByActivityTaskRequestQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetghgTransportDownStreamByActivityTaskRequestQuery(baseOptions: Apollo.QueryHookOptions<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables> & ({ variables: GetghgTransportDownStreamByActivityTaskRequestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables>(GetghgTransportDownStreamByActivityTaskRequestDocument, options);
      }
export function useGetghgTransportDownStreamByActivityTaskRequestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables>(GetghgTransportDownStreamByActivityTaskRequestDocument, options);
        }
export function useGetghgTransportDownStreamByActivityTaskRequestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables>(GetghgTransportDownStreamByActivityTaskRequestDocument, options);
        }
export type GetghgTransportDownStreamByActivityTaskRequestQueryHookResult = ReturnType<typeof useGetghgTransportDownStreamByActivityTaskRequestQuery>;
export type GetghgTransportDownStreamByActivityTaskRequestLazyQueryHookResult = ReturnType<typeof useGetghgTransportDownStreamByActivityTaskRequestLazyQuery>;
export type GetghgTransportDownStreamByActivityTaskRequestSuspenseQueryHookResult = ReturnType<typeof useGetghgTransportDownStreamByActivityTaskRequestSuspenseQuery>;
export type GetghgTransportDownStreamByActivityTaskRequestQueryResult = Apollo.QueryResult<GetghgTransportDownStreamByActivityTaskRequestQuery, GetghgTransportDownStreamByActivityTaskRequestQueryVariables>;