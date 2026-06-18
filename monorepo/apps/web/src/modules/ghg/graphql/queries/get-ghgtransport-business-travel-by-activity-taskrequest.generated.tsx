import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables =
  Types.Exact<{
    task_request_id:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
  }>;

export type GetGhgTransportBusinessTravelByActivityTaskRequestQuery = {
  __typename?: "query_root";
  GHGTransport_BusinessTravel: Array<{
    __typename?: "GHGTransport_BusinessTravel";
    id: any;
    organization_address_id: any;
    task_request_id: any;
    activity_task_request_id: any;
    Mode_of_Transport?: string | null;
    Vehicle_Type_Used_for_Road_Transport?: string | null;
    Fuel_Used?: string | null;
    supporting_docs?: any | null;
    kpi_Distance_Travelled?: any | null;
    kpi_Distance_Travelled_uom?: string | null;
    kpi_em_EmissionBy_TravelledDistance?: any | null;
    kpi_emf_EmissionBy_TravelledDistance?: any | null;
    updated_at: any;
    updated_by?: any | null;
    Number_of_Trips?: any | null;
    created_at: any;
    created_by?: any | null;
    Trip_From_Pincode?: string | null;
    Trip_To_Pincode?: string | null;
    Trip_Distance?: any | null;
    Trip_From_Country?: string | null;
    Trip_To_Country?: string | null;
    Trip_No_of_Employees_Travelled?: any | null;
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

export const GetGhgTransportBusinessTravelByActivityTaskRequestDocument = gql`
  query getGHGTransportBusinessTravelByActivityTaskRequest(
    $task_request_id: [uuid!]!
  ) {
    GHGTransport_BusinessTravel(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Mode_of_Transport
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      supporting_docs
      kpi_Distance_Travelled
      kpi_Distance_Travelled_uom
      kpi_em_EmissionBy_TravelledDistance
      kpi_emf_EmissionBy_TravelledDistance
      updated_at
      updated_by
      Number_of_Trips
      created_at
      created_by
      Trip_From_Pincode
      Trip_To_Pincode
      Trip_Distance
      Trip_From_Country
      Trip_To_Country
      Trip_No_of_Employees_Travelled
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
 * __useGetGhgTransportBusinessTravelByActivityTaskRequestQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportBusinessTravelByActivityTaskRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportBusinessTravelByActivityTaskRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportBusinessTravelByActivityTaskRequestQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetGhgTransportBusinessTravelByActivityTaskRequestQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  > &
    (
      | {
          variables: GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  >(GetGhgTransportBusinessTravelByActivityTaskRequestDocument, options);
}
export function useGetGhgTransportBusinessTravelByActivityTaskRequestLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  >(GetGhgTransportBusinessTravelByActivityTaskRequestDocument, options);
}
// @ts-ignore
export function useGetGhgTransportBusinessTravelByActivityTaskRequestSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
  GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
>;
export function useGetGhgTransportBusinessTravelByActivityTaskRequestSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
        GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportBusinessTravelByActivityTaskRequestQuery | undefined,
  GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
>;
export function useGetGhgTransportBusinessTravelByActivityTaskRequestSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
        GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  >(GetGhgTransportBusinessTravelByActivityTaskRequestDocument, options);
}
export type GetGhgTransportBusinessTravelByActivityTaskRequestQueryHookResult =
  ReturnType<typeof useGetGhgTransportBusinessTravelByActivityTaskRequestQuery>;
export type GetGhgTransportBusinessTravelByActivityTaskRequestLazyQueryHookResult =
  ReturnType<
    typeof useGetGhgTransportBusinessTravelByActivityTaskRequestLazyQuery
  >;
export type GetGhgTransportBusinessTravelByActivityTaskRequestSuspenseQueryHookResult =
  ReturnType<
    typeof useGetGhgTransportBusinessTravelByActivityTaskRequestSuspenseQuery
  >;
export type GetGhgTransportBusinessTravelByActivityTaskRequestQueryResult =
  Apollo.QueryResult<
    GetGhgTransportBusinessTravelByActivityTaskRequestQuery,
    GetGhgTransportBusinessTravelByActivityTaskRequestQueryVariables
  >;
