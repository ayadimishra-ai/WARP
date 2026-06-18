import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetTransportUpstreamDataQueryVariables = Types.Exact<{
  task_request_id:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetTransportUpstreamDataQuery = {
  __typename?: "query_root";
  GHGTransport_Upstream: Array<{
    __typename?: "GHGTransport_Upstream";
    id: any;
    activity_task_request_id: any;
    organization_address_id: any;
    task_request_id: any;
    Material_ID?: string | null;
    Material_Procured?: string | null;
    Supplier_code?: string | null;
    Supplier_Status?: string | null;
    Locations_Procured_From?: string | null;
    Transport_Managed_by?: string | null;
    Mode_of_Transport?: string | null;
    Third_Party_Suppliers_of_Material?: string | null;
    Vehicle_Type_Used_for_Road_Transport?: string | null;
    Fuel_Used?: string | null;
    Location_pin_or_zip_code?: string | null;
    Material_Quantity_Procured?: any | null;
    Material_Quantity_Procured_uom?: string | null;
    Distance_per_Trip?: any | null;
    Distance_per_Trip_uom?: string | null;
    Number_of_Trips?: any | null;
    Quantity_of_Fuel_Consumed?: any | null;
    Quantity_of_Fuel_Consumed_uom?: string | null;
    kpi_Distance_Travelled_uom?: string | null;
    kpi_em_EmissionBy_TravelledDistance?: any | null;
    kpi_emf_EmissionBy_TravelledDistance?: any | null;
    created_at: any;
    updated_at: any;
    created_by?: any | null;
    updated_by?: any | null;
    kpi_em_EmissionBy_MaterialProcured?: any | null;
    kpi_emf_EmissionBy_MaterialProcured?: any | null;
    kpi_Distance_Travelled?: any | null;
    supporting_docs?: any | null;
    TaskRequest: {
      __typename?: "TaskRequest";
      month: string;
      year?: number | null;
    };
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    };
  }>;
};

export const GetTransportUpstreamDataDocument = gql`
  query getTransportUpstreamData($task_request_id: [uuid!]!) {
    GHGTransport_Upstream(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      activity_task_request_id
      organization_address_id
      task_request_id
      Material_ID
      Material_Procured
      Supplier_code
      Supplier_Status
      Locations_Procured_From
      Transport_Managed_by
      Mode_of_Transport
      Third_Party_Suppliers_of_Material
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      Location_pin_or_zip_code
      Material_Quantity_Procured
      Material_Quantity_Procured_uom
      Distance_per_Trip
      Distance_per_Trip_uom
      Number_of_Trips
      Quantity_of_Fuel_Consumed
      Quantity_of_Fuel_Consumed_uom
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      created_at
      updated_at
      created_by
      updated_by
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      kpi_Distance_Travelled
      supporting_docs
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
 * __useGetTransportUpstreamDataQuery__
 *
 * To run a query within a React component, call `useGetTransportUpstreamDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransportUpstreamDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransportUpstreamDataQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetTransportUpstreamDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTransportUpstreamDataQuery,
    GetTransportUpstreamDataQueryVariables
  > &
    (
      | { variables: GetTransportUpstreamDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTransportUpstreamDataQuery,
    GetTransportUpstreamDataQueryVariables
  >(GetTransportUpstreamDataDocument, options);
}
export function useGetTransportUpstreamDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTransportUpstreamDataQuery,
    GetTransportUpstreamDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTransportUpstreamDataQuery,
    GetTransportUpstreamDataQueryVariables
  >(GetTransportUpstreamDataDocument, options);
}
// @ts-ignore
export function useGetTransportUpstreamDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTransportUpstreamDataQuery,
    GetTransportUpstreamDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetTransportUpstreamDataQuery,
  GetTransportUpstreamDataQueryVariables
>;
export function useGetTransportUpstreamDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTransportUpstreamDataQuery,
        GetTransportUpstreamDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetTransportUpstreamDataQuery | undefined,
  GetTransportUpstreamDataQueryVariables
>;
export function useGetTransportUpstreamDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTransportUpstreamDataQuery,
        GetTransportUpstreamDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTransportUpstreamDataQuery,
    GetTransportUpstreamDataQueryVariables
  >(GetTransportUpstreamDataDocument, options);
}
export type GetTransportUpstreamDataQueryHookResult = ReturnType<
  typeof useGetTransportUpstreamDataQuery
>;
export type GetTransportUpstreamDataLazyQueryHookResult = ReturnType<
  typeof useGetTransportUpstreamDataLazyQuery
>;
export type GetTransportUpstreamDataSuspenseQueryHookResult = ReturnType<
  typeof useGetTransportUpstreamDataSuspenseQuery
>;
export type GetTransportUpstreamDataQueryResult = Apollo.QueryResult<
  GetTransportUpstreamDataQuery,
  GetTransportUpstreamDataQueryVariables
>;
