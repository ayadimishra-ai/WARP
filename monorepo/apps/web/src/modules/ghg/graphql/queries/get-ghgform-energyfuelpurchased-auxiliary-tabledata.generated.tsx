import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgEnergyFuelPurchasedAuxillaryQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  size?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orderBy?: Types.InputMaybe<
    | Array<Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Order_By>
    | Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Order_By
  >;
}>;

export type GetGhgEnergyFuelPurchasedAuxillaryQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_FuelPurchased_Auxiliary: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary";
    Type_of_Auxiliary_Fuel_Purchased?: string | null;
    Used_for_Which_SKUs?: string | null;
    Quantity_of_fuel_consumed?: any | null;
  }>;
  totalCount: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate";
    aggregate?: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetGhgEnergyFuelPurchasedAuxillaryDocument = gql`
  query getGHGEnergyFuelPurchasedAuxillary(
    $activityFilter: GHGEnergyConsumption_FuelPurchased_Auxiliary_bool_exp
    $start: Int
    $size: Int
    $orderBy: [GHGEnergyConsumption_FuelPurchased_Auxiliary_order_by!]
  ) {
    GHGEnergyConsumption_FuelPurchased_Auxiliary(
      where: $activityFilter
      offset: $start
      limit: $size
      order_by: $orderBy
    ) {
      Type_of_Auxiliary_Fuel_Purchased
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
    }
    totalCount: GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate(
      where: $activityFilter
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetGhgEnergyFuelPurchasedAuxillaryQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyFuelPurchasedAuxillaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyFuelPurchasedAuxillaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyFuelPurchasedAuxillaryQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgEnergyFuelPurchasedAuxillaryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGhgEnergyFuelPurchasedAuxillaryQuery,
    GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgEnergyFuelPurchasedAuxillaryQuery,
    GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
  >(GetGhgEnergyFuelPurchasedAuxillaryDocument, options);
}
export function useGetGhgEnergyFuelPurchasedAuxillaryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgEnergyFuelPurchasedAuxillaryQuery,
    GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgEnergyFuelPurchasedAuxillaryQuery,
    GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
  >(GetGhgEnergyFuelPurchasedAuxillaryDocument, options);
}
// @ts-ignore
export function useGetGhgEnergyFuelPurchasedAuxillarySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgEnergyFuelPurchasedAuxillaryQuery,
    GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyFuelPurchasedAuxillaryQuery,
  GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
>;
export function useGetGhgEnergyFuelPurchasedAuxillarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyFuelPurchasedAuxillaryQuery,
        GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyFuelPurchasedAuxillaryQuery | undefined,
  GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
>;
export function useGetGhgEnergyFuelPurchasedAuxillarySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyFuelPurchasedAuxillaryQuery,
        GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgEnergyFuelPurchasedAuxillaryQuery,
    GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
  >(GetGhgEnergyFuelPurchasedAuxillaryDocument, options);
}
export type GetGhgEnergyFuelPurchasedAuxillaryQueryHookResult = ReturnType<
  typeof useGetGhgEnergyFuelPurchasedAuxillaryQuery
>;
export type GetGhgEnergyFuelPurchasedAuxillaryLazyQueryHookResult = ReturnType<
  typeof useGetGhgEnergyFuelPurchasedAuxillaryLazyQuery
>;
export type GetGhgEnergyFuelPurchasedAuxillarySuspenseQueryHookResult =
  ReturnType<typeof useGetGhgEnergyFuelPurchasedAuxillarySuspenseQuery>;
export type GetGhgEnergyFuelPurchasedAuxillaryQueryResult = Apollo.QueryResult<
  GetGhgEnergyFuelPurchasedAuxillaryQuery,
  GetGhgEnergyFuelPurchasedAuxillaryQueryVariables
>;
