import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgEnergyCaptivePowerRenewableQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgEnergy_CaptivePower_Renewable_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  size?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orderBy?: Types.InputMaybe<
    | Array<Types.GhgEnergy_CaptivePower_Renewable_Order_By>
    | Types.GhgEnergy_CaptivePower_Renewable_Order_By
  >;
}>;

export type GetGhgEnergyCaptivePowerRenewableQuery = {
  __typename?: "query_root";
  GHGEnergy_CaptivePower_Renewable: Array<{
    __typename?: "GHGEnergy_CaptivePower_Renewable";
    id: any;
    GHGEnergyConsumption_CaptivePower_id: any;
    Type_of_Technology_Used?: string | null;
    Year_of_installation?: number | null;
    Unit_of_Energy_Generated_in_Kwh?: any | null;
    supporting_docs?: any | null;
    kpi_em_Emission_EnergyGenerated_kwh?: any | null;
    kpi_emf_Emission_EnergyGenerated_kwh?: any | null;
  }>;
  totalCount: {
    __typename?: "GHGEnergy_CaptivePower_Renewable_aggregate";
    aggregate?: {
      __typename?: "GHGEnergy_CaptivePower_Renewable_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetGhgEnergyCaptivePowerRenewableDocument = gql`
  query getGHGEnergyCaptivePowerRenewable(
    $activityFilter: GHGEnergy_CaptivePower_Renewable_bool_exp
    $start: Int
    $size: Int
    $orderBy: [GHGEnergy_CaptivePower_Renewable_order_by!]
  ) {
    GHGEnergy_CaptivePower_Renewable(
      where: $activityFilter
      offset: $start
      limit: $size
      order_by: $orderBy
    ) {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
    }
    totalCount: GHGEnergy_CaptivePower_Renewable_aggregate(
      where: $activityFilter
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetGhgEnergyCaptivePowerRenewableQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyCaptivePowerRenewableQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyCaptivePowerRenewableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyCaptivePowerRenewableQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgEnergyCaptivePowerRenewableQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGhgEnergyCaptivePowerRenewableQuery,
    GetGhgEnergyCaptivePowerRenewableQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgEnergyCaptivePowerRenewableQuery,
    GetGhgEnergyCaptivePowerRenewableQueryVariables
  >(GetGhgEnergyCaptivePowerRenewableDocument, options);
}
export function useGetGhgEnergyCaptivePowerRenewableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgEnergyCaptivePowerRenewableQuery,
    GetGhgEnergyCaptivePowerRenewableQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgEnergyCaptivePowerRenewableQuery,
    GetGhgEnergyCaptivePowerRenewableQueryVariables
  >(GetGhgEnergyCaptivePowerRenewableDocument, options);
}
// @ts-ignore
export function useGetGhgEnergyCaptivePowerRenewableSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgEnergyCaptivePowerRenewableQuery,
    GetGhgEnergyCaptivePowerRenewableQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyCaptivePowerRenewableQuery,
  GetGhgEnergyCaptivePowerRenewableQueryVariables
>;
export function useGetGhgEnergyCaptivePowerRenewableSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyCaptivePowerRenewableQuery,
        GetGhgEnergyCaptivePowerRenewableQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyCaptivePowerRenewableQuery | undefined,
  GetGhgEnergyCaptivePowerRenewableQueryVariables
>;
export function useGetGhgEnergyCaptivePowerRenewableSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyCaptivePowerRenewableQuery,
        GetGhgEnergyCaptivePowerRenewableQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgEnergyCaptivePowerRenewableQuery,
    GetGhgEnergyCaptivePowerRenewableQueryVariables
  >(GetGhgEnergyCaptivePowerRenewableDocument, options);
}
export type GetGhgEnergyCaptivePowerRenewableQueryHookResult = ReturnType<
  typeof useGetGhgEnergyCaptivePowerRenewableQuery
>;
export type GetGhgEnergyCaptivePowerRenewableLazyQueryHookResult = ReturnType<
  typeof useGetGhgEnergyCaptivePowerRenewableLazyQuery
>;
export type GetGhgEnergyCaptivePowerRenewableSuspenseQueryHookResult =
  ReturnType<typeof useGetGhgEnergyCaptivePowerRenewableSuspenseQuery>;
export type GetGhgEnergyCaptivePowerRenewableQueryResult = Apollo.QueryResult<
  GetGhgEnergyCaptivePowerRenewableQuery,
  GetGhgEnergyCaptivePowerRenewableQueryVariables
>;
