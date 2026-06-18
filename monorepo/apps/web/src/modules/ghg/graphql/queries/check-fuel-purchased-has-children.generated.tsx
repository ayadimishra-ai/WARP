import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckFuelPurchasedHasChildrenQueryVariables = Types.Exact<{
  parentIds:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type CheckFuelPurchasedHasChildrenQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_FuelPurchased: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased";
    id: any;
    GHGEnergyConsumption_FuelPurchased_Generals_aggregate: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_General_aggregate";
      aggregate?: {
        __typename?: "GHGEnergyConsumption_FuelPurchased_General_aggregate_fields";
        count: number;
      } | null;
    };
    GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate";
      aggregate?: {
        __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate_fields";
        count: number;
      } | null;
    };
    GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate: {
      __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate";
      aggregate?: {
        __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate_fields";
        count: number;
      } | null;
    };
  }>;
};

export const CheckFuelPurchasedHasChildrenDocument = gql`
  query checkFuelPurchasedHasChildren($parentIds: [uuid!]!) {
    GHGEnergyConsumption_FuelPurchased(where: { id: { _in: $parentIds } }) {
      id
      GHGEnergyConsumption_FuelPurchased_Generals_aggregate {
        aggregate {
          count
        }
      }
      GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate {
        aggregate {
          count
        }
      }
      GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

/**
 * __useCheckFuelPurchasedHasChildrenQuery__
 *
 * To run a query within a React component, call `useCheckFuelPurchasedHasChildrenQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckFuelPurchasedHasChildrenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckFuelPurchasedHasChildrenQuery({
 *   variables: {
 *      parentIds: // value for 'parentIds'
 *   },
 * });
 */
export function useCheckFuelPurchasedHasChildrenQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckFuelPurchasedHasChildrenQuery,
    CheckFuelPurchasedHasChildrenQueryVariables
  > &
    (
      | {
          variables: CheckFuelPurchasedHasChildrenQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckFuelPurchasedHasChildrenQuery,
    CheckFuelPurchasedHasChildrenQueryVariables
  >(CheckFuelPurchasedHasChildrenDocument, options);
}
export function useCheckFuelPurchasedHasChildrenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckFuelPurchasedHasChildrenQuery,
    CheckFuelPurchasedHasChildrenQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckFuelPurchasedHasChildrenQuery,
    CheckFuelPurchasedHasChildrenQueryVariables
  >(CheckFuelPurchasedHasChildrenDocument, options);
}
// @ts-ignore
export function useCheckFuelPurchasedHasChildrenSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckFuelPurchasedHasChildrenQuery,
    CheckFuelPurchasedHasChildrenQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckFuelPurchasedHasChildrenQuery,
  CheckFuelPurchasedHasChildrenQueryVariables
>;
export function useCheckFuelPurchasedHasChildrenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckFuelPurchasedHasChildrenQuery,
        CheckFuelPurchasedHasChildrenQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckFuelPurchasedHasChildrenQuery | undefined,
  CheckFuelPurchasedHasChildrenQueryVariables
>;
export function useCheckFuelPurchasedHasChildrenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckFuelPurchasedHasChildrenQuery,
        CheckFuelPurchasedHasChildrenQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckFuelPurchasedHasChildrenQuery,
    CheckFuelPurchasedHasChildrenQueryVariables
  >(CheckFuelPurchasedHasChildrenDocument, options);
}
export type CheckFuelPurchasedHasChildrenQueryHookResult = ReturnType<
  typeof useCheckFuelPurchasedHasChildrenQuery
>;
export type CheckFuelPurchasedHasChildrenLazyQueryHookResult = ReturnType<
  typeof useCheckFuelPurchasedHasChildrenLazyQuery
>;
export type CheckFuelPurchasedHasChildrenSuspenseQueryHookResult = ReturnType<
  typeof useCheckFuelPurchasedHasChildrenSuspenseQuery
>;
export type CheckFuelPurchasedHasChildrenQueryResult = Apollo.QueryResult<
  CheckFuelPurchasedHasChildrenQuery,
  CheckFuelPurchasedHasChildrenQueryVariables
>;
