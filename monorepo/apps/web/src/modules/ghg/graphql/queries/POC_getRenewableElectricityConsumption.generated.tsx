import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEsgRenewableElectricityConsumptionQueryVariables = Types.Exact<{
  fromDate: Types.Scalars["date"]["input"];
  toDate: Types.Scalars["date"]["input"];
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetEsgRenewableElectricityConsumptionQuery = {
  __typename?: "query_root";
  poc_view_electricity_consumption_renewable: Array<{
    __typename?: "poc_view_electricity_consumption_renewable";
    organization_id?: any | null;
    year?: number | null;
    month?: number | null;
    period_date?: any | null;
    consumption?: any | null;
  }>;
};

export const GetEsgRenewableElectricityConsumptionDocument = gql`
  query getESGRenewableElectricityConsumption(
    $fromDate: date!
    $toDate: date!
    $organizationId: uuid!
  ) {
    poc_view_electricity_consumption_renewable(
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
      consumption
    }
  }
`;

/**
 * __useGetEsgRenewableElectricityConsumptionQuery__
 *
 * To run a query within a React component, call `useGetEsgRenewableElectricityConsumptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgRenewableElectricityConsumptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgRenewableElectricityConsumptionQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgRenewableElectricityConsumptionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  > &
    (
      | {
          variables: GetEsgRenewableElectricityConsumptionQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  >(GetEsgRenewableElectricityConsumptionDocument, options);
}
export function useGetEsgRenewableElectricityConsumptionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  >(GetEsgRenewableElectricityConsumptionDocument, options);
}
// @ts-ignore
export function useGetEsgRenewableElectricityConsumptionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEsgRenewableElectricityConsumptionQuery,
  GetEsgRenewableElectricityConsumptionQueryVariables
>;
export function useGetEsgRenewableElectricityConsumptionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgRenewableElectricityConsumptionQuery,
        GetEsgRenewableElectricityConsumptionQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEsgRenewableElectricityConsumptionQuery | undefined,
  GetEsgRenewableElectricityConsumptionQueryVariables
>;
export function useGetEsgRenewableElectricityConsumptionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgRenewableElectricityConsumptionQuery,
        GetEsgRenewableElectricityConsumptionQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  >(GetEsgRenewableElectricityConsumptionDocument, options);
}
export type GetEsgRenewableElectricityConsumptionQueryHookResult = ReturnType<
  typeof useGetEsgRenewableElectricityConsumptionQuery
>;
export type GetEsgRenewableElectricityConsumptionLazyQueryHookResult =
  ReturnType<typeof useGetEsgRenewableElectricityConsumptionLazyQuery>;
export type GetEsgRenewableElectricityConsumptionSuspenseQueryHookResult =
  ReturnType<typeof useGetEsgRenewableElectricityConsumptionSuspenseQuery>;
export type GetEsgRenewableElectricityConsumptionQueryResult =
  Apollo.QueryResult<
    GetEsgRenewableElectricityConsumptionQuery,
    GetEsgRenewableElectricityConsumptionQueryVariables
  >;
