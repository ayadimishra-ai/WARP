import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckCaptivePowerChildRecordsQueryVariables = Types.Exact<{
  captivePowerId: Types.Scalars["uuid"]["input"];
}>;

export type CheckCaptivePowerChildRecordsQuery = {
  __typename?: "query_root";
  renewable: {
    __typename?: "GHGEnergy_CaptivePower_Renewable_aggregate";
    aggregate?: {
      __typename?: "GHGEnergy_CaptivePower_Renewable_aggregate_fields";
      count: number;
    } | null;
  };
  nonRenewable: {
    __typename?: "GHGEnergy_CaptivePower_NonRenewable_aggregate";
    aggregate?: {
      __typename?: "GHGEnergy_CaptivePower_NonRenewable_aggregate_fields";
      count: number;
    } | null;
  };
  renewableFuel: {
    __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel_aggregate";
    aggregate?: {
      __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel_aggregate_fields";
      count: number;
    } | null;
  };
};

export const CheckCaptivePowerChildRecordsDocument = gql`
  query checkCaptivePowerChildRecords($captivePowerId: uuid!) {
    renewable: GHGEnergy_CaptivePower_Renewable_aggregate(
      where: { GHGEnergyConsumption_CaptivePower_id: { _eq: $captivePowerId } }
    ) {
      aggregate {
        count
      }
    }
    nonRenewable: GHGEnergy_CaptivePower_NonRenewable_aggregate(
      where: { GHGEnergyConsumption_CaptivePower_id: { _eq: $captivePowerId } }
    ) {
      aggregate {
        count
      }
    }
    renewableFuel: GHGEnergy_CaptivePower_Renewable_Fuel_aggregate(
      where: { GHGEnergyConsumption_CaptivePower_id: { _eq: $captivePowerId } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useCheckCaptivePowerChildRecordsQuery__
 *
 * To run a query within a React component, call `useCheckCaptivePowerChildRecordsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckCaptivePowerChildRecordsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckCaptivePowerChildRecordsQuery({
 *   variables: {
 *      captivePowerId: // value for 'captivePowerId'
 *   },
 * });
 */
export function useCheckCaptivePowerChildRecordsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckCaptivePowerChildRecordsQuery,
    CheckCaptivePowerChildRecordsQueryVariables
  > &
    (
      | {
          variables: CheckCaptivePowerChildRecordsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckCaptivePowerChildRecordsQuery,
    CheckCaptivePowerChildRecordsQueryVariables
  >(CheckCaptivePowerChildRecordsDocument, options);
}
export function useCheckCaptivePowerChildRecordsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckCaptivePowerChildRecordsQuery,
    CheckCaptivePowerChildRecordsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckCaptivePowerChildRecordsQuery,
    CheckCaptivePowerChildRecordsQueryVariables
  >(CheckCaptivePowerChildRecordsDocument, options);
}
// @ts-ignore
export function useCheckCaptivePowerChildRecordsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckCaptivePowerChildRecordsQuery,
    CheckCaptivePowerChildRecordsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckCaptivePowerChildRecordsQuery,
  CheckCaptivePowerChildRecordsQueryVariables
>;
export function useCheckCaptivePowerChildRecordsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckCaptivePowerChildRecordsQuery,
        CheckCaptivePowerChildRecordsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckCaptivePowerChildRecordsQuery | undefined,
  CheckCaptivePowerChildRecordsQueryVariables
>;
export function useCheckCaptivePowerChildRecordsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckCaptivePowerChildRecordsQuery,
        CheckCaptivePowerChildRecordsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckCaptivePowerChildRecordsQuery,
    CheckCaptivePowerChildRecordsQueryVariables
  >(CheckCaptivePowerChildRecordsDocument, options);
}
export type CheckCaptivePowerChildRecordsQueryHookResult = ReturnType<
  typeof useCheckCaptivePowerChildRecordsQuery
>;
export type CheckCaptivePowerChildRecordsLazyQueryHookResult = ReturnType<
  typeof useCheckCaptivePowerChildRecordsLazyQuery
>;
export type CheckCaptivePowerChildRecordsSuspenseQueryHookResult = ReturnType<
  typeof useCheckCaptivePowerChildRecordsSuspenseQuery
>;
export type CheckCaptivePowerChildRecordsQueryResult = Apollo.QueryResult<
  CheckCaptivePowerChildRecordsQuery,
  CheckCaptivePowerChildRecordsQueryVariables
>;
