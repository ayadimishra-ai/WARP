import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  size?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orderBy?: Types.InputMaybe<
    | Array<Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Order_By>
    | Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Order_By
  >;
}>;

export type GetGhgEnergyFuelPurchasedHeatingWaterQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_FuelPurchased_HeatingWater: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater";
    Type_of_Fuel_Purchased?: string | null;
    Quality_of_fuel?: any | null;
    Used_for_Which_SKUs?: string | null;
    Quantity_of_fuel_consumed?: any | null;
  }>;
  totalCount: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate";
    aggregate?: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetGhgEnergyFuelPurchasedHeatingWaterDocument = gql`
  query getGHGEnergyFuelPurchasedHeatingWater(
    $activityFilter: GHGEnergyConsumption_FuelPurchased_HeatingWater_bool_exp
    $start: Int
    $size: Int
    $orderBy: [GHGEnergyConsumption_FuelPurchased_HeatingWater_order_by!]
  ) {
    GHGEnergyConsumption_FuelPurchased_HeatingWater(
      where: $activityFilter
      offset: $start
      limit: $size
      order_by: $orderBy
    ) {
      Type_of_Fuel_Purchased
      Quality_of_fuel
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
    }
    totalCount: GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate(
      where: $activityFilter
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetGhgEnergyFuelPurchasedHeatingWaterQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyFuelPurchasedHeatingWaterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyFuelPurchasedHeatingWaterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyFuelPurchasedHeatingWaterQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgEnergyFuelPurchasedHeatingWaterQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >(GetGhgEnergyFuelPurchasedHeatingWaterDocument, options);
}
export function useGetGhgEnergyFuelPurchasedHeatingWaterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >(GetGhgEnergyFuelPurchasedHeatingWaterDocument, options);
}
// @ts-ignore
export function useGetGhgEnergyFuelPurchasedHeatingWaterSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyFuelPurchasedHeatingWaterQuery,
  GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
>;
export function useGetGhgEnergyFuelPurchasedHeatingWaterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyFuelPurchasedHeatingWaterQuery,
        GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyFuelPurchasedHeatingWaterQuery | undefined,
  GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
>;
export function useGetGhgEnergyFuelPurchasedHeatingWaterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyFuelPurchasedHeatingWaterQuery,
        GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >(GetGhgEnergyFuelPurchasedHeatingWaterDocument, options);
}
export type GetGhgEnergyFuelPurchasedHeatingWaterQueryHookResult = ReturnType<
  typeof useGetGhgEnergyFuelPurchasedHeatingWaterQuery
>;
export type GetGhgEnergyFuelPurchasedHeatingWaterLazyQueryHookResult =
  ReturnType<typeof useGetGhgEnergyFuelPurchasedHeatingWaterLazyQuery>;
export type GetGhgEnergyFuelPurchasedHeatingWaterSuspenseQueryHookResult =
  ReturnType<typeof useGetGhgEnergyFuelPurchasedHeatingWaterSuspenseQuery>;
export type GetGhgEnergyFuelPurchasedHeatingWaterQueryResult =
  Apollo.QueryResult<
    GetGhgEnergyFuelPurchasedHeatingWaterQuery,
    GetGhgEnergyFuelPurchasedHeatingWaterQueryVariables
  >;
