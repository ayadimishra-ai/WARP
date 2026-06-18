import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEsgHealthAndSafetyByPeriodQueryVariables = Types.Exact<{
  fromDate: Types.Scalars["date"]["input"];
  toDate: Types.Scalars["date"]["input"];
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetEsgHealthAndSafetyByPeriodQuery = {
  __typename?: "query_root";
  poc_view_esg_health_and_safety: Array<{
    __typename?: "poc_view_esg_health_and_safety";
    organization_id?: any | null;
    year?: number | null;
    month?: number | null;
    period_date?: any | null;
    workforce_category?: string | null;
    total_lost_time_injuries?: any | null;
    total_hours_worked?: any | null;
  }>;
};

export const GetEsgHealthAndSafetyByPeriodDocument = gql`
  query getESGHealthAndSafetyByPeriod(
    $fromDate: date!
    $toDate: date!
    $organizationId: uuid!
  ) {
    poc_view_esg_health_and_safety(
      where: {
        period_date: { _gte: $fromDate, _lte: $toDate }
        organization_id: { _eq: $organizationId }
      }
      order_by: { period_date: asc }
    ) {
      organization_id
      year
      month
      period_date
      workforce_category
      total_lost_time_injuries
      total_hours_worked
    }
  }
`;

/**
 * __useGetEsgHealthAndSafetyByPeriodQuery__
 *
 * To run a query within a React component, call `useGetEsgHealthAndSafetyByPeriodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgHealthAndSafetyByPeriodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgHealthAndSafetyByPeriodQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgHealthAndSafetyByPeriodQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEsgHealthAndSafetyByPeriodQuery,
    GetEsgHealthAndSafetyByPeriodQueryVariables
  > &
    (
      | {
          variables: GetEsgHealthAndSafetyByPeriodQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEsgHealthAndSafetyByPeriodQuery,
    GetEsgHealthAndSafetyByPeriodQueryVariables
  >(GetEsgHealthAndSafetyByPeriodDocument, options);
}
export function useGetEsgHealthAndSafetyByPeriodLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEsgHealthAndSafetyByPeriodQuery,
    GetEsgHealthAndSafetyByPeriodQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEsgHealthAndSafetyByPeriodQuery,
    GetEsgHealthAndSafetyByPeriodQueryVariables
  >(GetEsgHealthAndSafetyByPeriodDocument, options);
}
// @ts-ignore
export function useGetEsgHealthAndSafetyByPeriodSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEsgHealthAndSafetyByPeriodQuery,
    GetEsgHealthAndSafetyByPeriodQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEsgHealthAndSafetyByPeriodQuery,
  GetEsgHealthAndSafetyByPeriodQueryVariables
>;
export function useGetEsgHealthAndSafetyByPeriodSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgHealthAndSafetyByPeriodQuery,
        GetEsgHealthAndSafetyByPeriodQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEsgHealthAndSafetyByPeriodQuery | undefined,
  GetEsgHealthAndSafetyByPeriodQueryVariables
>;
export function useGetEsgHealthAndSafetyByPeriodSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgHealthAndSafetyByPeriodQuery,
        GetEsgHealthAndSafetyByPeriodQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEsgHealthAndSafetyByPeriodQuery,
    GetEsgHealthAndSafetyByPeriodQueryVariables
  >(GetEsgHealthAndSafetyByPeriodDocument, options);
}
export type GetEsgHealthAndSafetyByPeriodQueryHookResult = ReturnType<
  typeof useGetEsgHealthAndSafetyByPeriodQuery
>;
export type GetEsgHealthAndSafetyByPeriodLazyQueryHookResult = ReturnType<
  typeof useGetEsgHealthAndSafetyByPeriodLazyQuery
>;
export type GetEsgHealthAndSafetyByPeriodSuspenseQueryHookResult = ReturnType<
  typeof useGetEsgHealthAndSafetyByPeriodSuspenseQuery
>;
export type GetEsgHealthAndSafetyByPeriodQueryResult = Apollo.QueryResult<
  GetEsgHealthAndSafetyByPeriodQuery,
  GetEsgHealthAndSafetyByPeriodQueryVariables
>;
