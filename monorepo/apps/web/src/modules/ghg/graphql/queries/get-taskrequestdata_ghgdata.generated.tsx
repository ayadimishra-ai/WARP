import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetTaskRequestghgDataQueryVariables = Types.Exact<{
  where: Types.TaskRequest_Bool_Exp;
}>;

export type GetTaskRequestghgDataQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    id: any;
    month: string;
    year?: number | null;
    organization_address_id: any;
    ActivityTaskRequests: Array<{
      __typename?: "ActivityTaskRequest";
      id: any;
      task_request_id: any;
      Activity: { __typename?: "Activity"; name: string; code: string };
      GHGTransport_Upstreams: Array<{
        __typename?: "GHGTransport_Upstream";
        id: any;
      }>;
      GHGTransport_Downstreams: Array<{
        __typename?: "GHGTransport_Downstream";
        id: any;
      }>;
      GHGWastes: Array<{ __typename?: "GHGWaste"; id: any }>;
      GHGTransport_BusinessTravels: Array<{
        __typename?: "GHGTransport_BusinessTravel";
        id: any;
      }>;
      GHGTransport_EmployeeTravels: Array<{
        __typename?: "GHGTransport_EmployeeTravel";
        id: any;
      }>;
      GHGEnergy_CaptivePowers: Array<{
        __typename?: "GHGEnergy_CaptivePower";
        id: any;
      }>;
      GHGEnergyConsumption_FuelPurchaseds: Array<{
        __typename?: "GHGEnergyConsumption_FuelPurchased";
        id: any;
      }>;
      GHGEnergyConsumption_GridPowers: Array<{
        __typename?: "GHGEnergyConsumption_GridPower";
        id: any;
      }>;
    }>;
  }>;
};

export const GetTaskRequestghgDataDocument = gql`
  query getTaskRequestghgData($where: TaskRequest_bool_exp!) {
    TaskRequest(where: $where) {
      id
      month
      year
      organization_address_id
      ActivityTaskRequests {
        id
        task_request_id
        Activity {
          name
          code
        }
        GHGTransport_Upstreams {
          id
        }
        GHGTransport_Downstreams {
          id
        }
        GHGWastes {
          id
        }
        GHGTransport_BusinessTravels {
          id
        }
        GHGTransport_EmployeeTravels {
          id
        }
        GHGEnergy_CaptivePowers {
          id
        }
        GHGEnergyConsumption_FuelPurchaseds {
          id
        }
        GHGEnergyConsumption_GridPowers {
          id
        }
      }
    }
  }
`;

/**
 * __useGetTaskRequestghgDataQuery__
 *
 * To run a query within a React component, call `useGetTaskRequestghgDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskRequestghgDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskRequestghgDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetTaskRequestghgDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskRequestghgDataQuery,
    GetTaskRequestghgDataQueryVariables
  > &
    (
      | { variables: GetTaskRequestghgDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTaskRequestghgDataQuery,
    GetTaskRequestghgDataQueryVariables
  >(GetTaskRequestghgDataDocument, options);
}
export function useGetTaskRequestghgDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskRequestghgDataQuery,
    GetTaskRequestghgDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTaskRequestghgDataQuery,
    GetTaskRequestghgDataQueryVariables
  >(GetTaskRequestghgDataDocument, options);
}
// @ts-ignore
export function useGetTaskRequestghgDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetTaskRequestghgDataQuery,
    GetTaskRequestghgDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestghgDataQuery,
  GetTaskRequestghgDataQueryVariables
>;
export function useGetTaskRequestghgDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestghgDataQuery,
        GetTaskRequestghgDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetTaskRequestghgDataQuery | undefined,
  GetTaskRequestghgDataQueryVariables
>;
export function useGetTaskRequestghgDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetTaskRequestghgDataQuery,
        GetTaskRequestghgDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetTaskRequestghgDataQuery,
    GetTaskRequestghgDataQueryVariables
  >(GetTaskRequestghgDataDocument, options);
}
export type GetTaskRequestghgDataQueryHookResult = ReturnType<
  typeof useGetTaskRequestghgDataQuery
>;
export type GetTaskRequestghgDataLazyQueryHookResult = ReturnType<
  typeof useGetTaskRequestghgDataLazyQuery
>;
export type GetTaskRequestghgDataSuspenseQueryHookResult = ReturnType<
  typeof useGetTaskRequestghgDataSuspenseQuery
>;
export type GetTaskRequestghgDataQueryResult = Apollo.QueryResult<
  GetTaskRequestghgDataQuery,
  GetTaskRequestghgDataQueryVariables
>;
