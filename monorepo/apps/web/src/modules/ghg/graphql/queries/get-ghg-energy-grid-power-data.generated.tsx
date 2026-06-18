import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgEnergyGridPowerDataQueryVariables = Types.Exact<{
  where: Types.GhgEnergyConsumption_GridPower_Bool_Exp;
}>;

export type GetGhgEnergyGridPowerDataQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_GridPower: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    task_request_id: any;
    organization_address_id: any;
    id: any;
    activity_task_request_id: any;
    metadata?: any | null;
  }>;
};

export const GetGhgEnergyGridPowerDataDocument = gql`
  query getGHGEnergyGridPowerData(
    $where: GHGEnergyConsumption_GridPower_bool_exp!
  ) {
    GHGEnergyConsumption_GridPower(where: $where) {
      task_request_id
      organization_address_id
      id
      activity_task_request_id
      metadata
    }
  }
`;

/**
 * __useGetGhgEnergyGridPowerDataQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyGridPowerDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyGridPowerDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyGridPowerDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetGhgEnergyGridPowerDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgEnergyGridPowerDataQuery,
    GetGhgEnergyGridPowerDataQueryVariables
  > &
    (
      | { variables: GetGhgEnergyGridPowerDataQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgEnergyGridPowerDataQuery,
    GetGhgEnergyGridPowerDataQueryVariables
  >(GetGhgEnergyGridPowerDataDocument, options);
}
export function useGetGhgEnergyGridPowerDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgEnergyGridPowerDataQuery,
    GetGhgEnergyGridPowerDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgEnergyGridPowerDataQuery,
    GetGhgEnergyGridPowerDataQueryVariables
  >(GetGhgEnergyGridPowerDataDocument, options);
}
// @ts-ignore
export function useGetGhgEnergyGridPowerDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgEnergyGridPowerDataQuery,
    GetGhgEnergyGridPowerDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyGridPowerDataQuery,
  GetGhgEnergyGridPowerDataQueryVariables
>;
export function useGetGhgEnergyGridPowerDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyGridPowerDataQuery,
        GetGhgEnergyGridPowerDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyGridPowerDataQuery | undefined,
  GetGhgEnergyGridPowerDataQueryVariables
>;
export function useGetGhgEnergyGridPowerDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyGridPowerDataQuery,
        GetGhgEnergyGridPowerDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgEnergyGridPowerDataQuery,
    GetGhgEnergyGridPowerDataQueryVariables
  >(GetGhgEnergyGridPowerDataDocument, options);
}
export type GetGhgEnergyGridPowerDataQueryHookResult = ReturnType<
  typeof useGetGhgEnergyGridPowerDataQuery
>;
export type GetGhgEnergyGridPowerDataLazyQueryHookResult = ReturnType<
  typeof useGetGhgEnergyGridPowerDataLazyQuery
>;
export type GetGhgEnergyGridPowerDataSuspenseQueryHookResult = ReturnType<
  typeof useGetGhgEnergyGridPowerDataSuspenseQuery
>;
export type GetGhgEnergyGridPowerDataQueryResult = Apollo.QueryResult<
  GetGhgEnergyGridPowerDataQuery,
  GetGhgEnergyGridPowerDataQueryVariables
>;
