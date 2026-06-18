import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckFuelPurchasedChildRecordsQueryVariables = Types.Exact<{
  fuelPurchasedId: Types.Scalars["uuid"]["input"];
}>;

export type CheckFuelPurchasedChildRecordsQuery = {
  __typename?: "query_root";
  general: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_General_aggregate";
    aggregate?: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_General_aggregate_fields";
      count: number;
    } | null;
  };
  auxiliary: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate";
    aggregate?: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate_fields";
      count: number;
    } | null;
  };
  heatingWater: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate";
    aggregate?: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate_fields";
      count: number;
    } | null;
  };
};

export const CheckFuelPurchasedChildRecordsDocument = gql`
  query checkFuelPurchasedChildRecords($fuelPurchasedId: uuid!) {
    general: GHGEnergyConsumption_FuelPurchased_General_aggregate(
      where: {
        GHGEnergyConsumption_FuelPurchased_id: { _eq: $fuelPurchasedId }
      }
    ) {
      aggregate {
        count
      }
    }
    auxiliary: GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate(
      where: {
        GHGEnergyConsumption_FuelPurchased_id: { _eq: $fuelPurchasedId }
      }
    ) {
      aggregate {
        count
      }
    }
    heatingWater: GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate(
      where: {
        GHGEnergyConsumption_FuelPurchased_id: { _eq: $fuelPurchasedId }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useCheckFuelPurchasedChildRecordsQuery__
 *
 * To run a query within a React component, call `useCheckFuelPurchasedChildRecordsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckFuelPurchasedChildRecordsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckFuelPurchasedChildRecordsQuery({
 *   variables: {
 *      fuelPurchasedId: // value for 'fuelPurchasedId'
 *   },
 * });
 */
export function useCheckFuelPurchasedChildRecordsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckFuelPurchasedChildRecordsQuery,
    CheckFuelPurchasedChildRecordsQueryVariables
  > &
    (
      | {
          variables: CheckFuelPurchasedChildRecordsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckFuelPurchasedChildRecordsQuery,
    CheckFuelPurchasedChildRecordsQueryVariables
  >(CheckFuelPurchasedChildRecordsDocument, options);
}
export function useCheckFuelPurchasedChildRecordsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckFuelPurchasedChildRecordsQuery,
    CheckFuelPurchasedChildRecordsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckFuelPurchasedChildRecordsQuery,
    CheckFuelPurchasedChildRecordsQueryVariables
  >(CheckFuelPurchasedChildRecordsDocument, options);
}
// @ts-ignore
export function useCheckFuelPurchasedChildRecordsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckFuelPurchasedChildRecordsQuery,
    CheckFuelPurchasedChildRecordsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckFuelPurchasedChildRecordsQuery,
  CheckFuelPurchasedChildRecordsQueryVariables
>;
export function useCheckFuelPurchasedChildRecordsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckFuelPurchasedChildRecordsQuery,
        CheckFuelPurchasedChildRecordsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckFuelPurchasedChildRecordsQuery | undefined,
  CheckFuelPurchasedChildRecordsQueryVariables
>;
export function useCheckFuelPurchasedChildRecordsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckFuelPurchasedChildRecordsQuery,
        CheckFuelPurchasedChildRecordsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckFuelPurchasedChildRecordsQuery,
    CheckFuelPurchasedChildRecordsQueryVariables
  >(CheckFuelPurchasedChildRecordsDocument, options);
}
export type CheckFuelPurchasedChildRecordsQueryHookResult = ReturnType<
  typeof useCheckFuelPurchasedChildRecordsQuery
>;
export type CheckFuelPurchasedChildRecordsLazyQueryHookResult = ReturnType<
  typeof useCheckFuelPurchasedChildRecordsLazyQuery
>;
export type CheckFuelPurchasedChildRecordsSuspenseQueryHookResult = ReturnType<
  typeof useCheckFuelPurchasedChildRecordsSuspenseQuery
>;
export type CheckFuelPurchasedChildRecordsQueryResult = Apollo.QueryResult<
  CheckFuelPurchasedChildRecordsQuery,
  CheckFuelPurchasedChildRecordsQueryVariables
>;
