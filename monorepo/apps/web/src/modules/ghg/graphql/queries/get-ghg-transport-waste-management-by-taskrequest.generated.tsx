import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgTransportWasteManagementByTaskRequestQueryVariables =
  Types.Exact<{
    task_request_id:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
  }>;

export type GetGhgTransportWasteManagementByTaskRequestQuery = {
  __typename?: "query_root";
  GHGWaste: Array<{
    __typename?: "GHGWaste";
    id: any;
    organization_address_id: any;
    task_request_id: any;
    activity_task_request_id: any;
    Types_of_Waste_Generated?: string | null;
    Waste_Disposal_Managed_by?: string | null;
    Quantity_of_Waste?: any | null;
    Quantity_of_Waste_UoM?: string | null;
    Disposal_Mechanism?: string | null;
    Name_of_Third_Party?: string | null;
    Location_of_Waste_Disposal?: string | null;
    Location_pin_or_zip_code?: string | null;
    Mode_of_Transport?: string | null;
    Who_Managed_Transportation_of_Waste?: string | null;
    Vehicle_Type_Used_for_Road_Transport?: string | null;
    Fuel_Used?: string | null;
    DistOf_WasteDisposalLoction_from_FacilityLocation?: string | null;
    DistOf_WasteDisposalLoction_from_FacilityLocation_UoM?: string | null;
    supporting_docs?: any | null;
    kpi_DistanceTravlled_For_WasteManagement?: any | null;
    kpi_DistanceTravlled_For_WasteManagement_uom?: string | null;
    kpi_em_EmissionBy_TransportFor_WasteManagement?: any | null;
    kpi_emf_EmissionBy_TransportFor_WasteManagement?: any | null;
    kpi_em_EmissionBy_Generation_of_Waste_Type?: any | null;
    kpi_emf_EmissionBy_Generation_of_Waste_Type?: any | null;
    updated_at: any;
    updated_by?: any | null;
    created_at: any;
    created_by?: any | null;
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

export const GetGhgTransportWasteManagementByTaskRequestDocument = gql`
  query getGHGTransportWasteManagementByTaskRequest(
    $task_request_id: [uuid!]!
  ) {
    GHGWaste(where: { task_request_id: { _in: $task_request_id } }) {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Types_of_Waste_Generated
      Waste_Disposal_Managed_by
      Quantity_of_Waste
      Quantity_of_Waste_UoM
      Disposal_Mechanism
      Name_of_Third_Party
      Location_of_Waste_Disposal
      Location_pin_or_zip_code
      Mode_of_Transport
      Who_Managed_Transportation_of_Waste
      Vehicle_Type_Used_for_Road_Transport
      Fuel_Used
      DistOf_WasteDisposalLoction_from_FacilityLocation
      DistOf_WasteDisposalLoction_from_FacilityLocation_UoM
      supporting_docs
      kpi_DistanceTravlled_For_WasteManagement
      kpi_DistanceTravlled_For_WasteManagement_uom
      kpi_em_EmissionBy_TransportFor_WasteManagement
      kpi_emf_EmissionBy_TransportFor_WasteManagement
      kpi_em_EmissionBy_Generation_of_Waste_Type
      kpi_emf_EmissionBy_Generation_of_Waste_Type
      updated_at
      updated_by
      created_at
      created_by
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
 * __useGetGhgTransportWasteManagementByTaskRequestQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportWasteManagementByTaskRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportWasteManagementByTaskRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportWasteManagementByTaskRequestQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetGhgTransportWasteManagementByTaskRequestQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  > &
    (
      | {
          variables: GetGhgTransportWasteManagementByTaskRequestQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  >(GetGhgTransportWasteManagementByTaskRequestDocument, options);
}
export function useGetGhgTransportWasteManagementByTaskRequestLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  >(GetGhgTransportWasteManagementByTaskRequestDocument, options);
}
// @ts-ignore
export function useGetGhgTransportWasteManagementByTaskRequestSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportWasteManagementByTaskRequestQuery,
  GetGhgTransportWasteManagementByTaskRequestQueryVariables
>;
export function useGetGhgTransportWasteManagementByTaskRequestSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportWasteManagementByTaskRequestQuery,
        GetGhgTransportWasteManagementByTaskRequestQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportWasteManagementByTaskRequestQuery | undefined,
  GetGhgTransportWasteManagementByTaskRequestQueryVariables
>;
export function useGetGhgTransportWasteManagementByTaskRequestSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportWasteManagementByTaskRequestQuery,
        GetGhgTransportWasteManagementByTaskRequestQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  >(GetGhgTransportWasteManagementByTaskRequestDocument, options);
}
export type GetGhgTransportWasteManagementByTaskRequestQueryHookResult =
  ReturnType<typeof useGetGhgTransportWasteManagementByTaskRequestQuery>;
export type GetGhgTransportWasteManagementByTaskRequestLazyQueryHookResult =
  ReturnType<typeof useGetGhgTransportWasteManagementByTaskRequestLazyQuery>;
export type GetGhgTransportWasteManagementByTaskRequestSuspenseQueryHookResult =
  ReturnType<
    typeof useGetGhgTransportWasteManagementByTaskRequestSuspenseQuery
  >;
export type GetGhgTransportWasteManagementByTaskRequestQueryResult =
  Apollo.QueryResult<
    GetGhgTransportWasteManagementByTaskRequestQuery,
    GetGhgTransportWasteManagementByTaskRequestQueryVariables
  >;
