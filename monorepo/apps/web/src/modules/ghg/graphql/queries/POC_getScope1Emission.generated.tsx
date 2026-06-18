import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEsgScope1EmissionQueryVariables = Types.Exact<{
  fromDate: Types.Scalars["date"]["input"];
  toDate: Types.Scalars["date"]["input"];
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetEsgScope1EmissionQuery = {
  __typename?: "query_root";
  poc_view_emission_by_scope: Array<{
    __typename?: "poc_view_emission_by_scope";
    organization_id?: any | null;
    year?: any | null;
    month?: any | null;
    period_date?: any | null;
    em_scope1?: any | null;
  }>;
};

export const GetEsgScope1EmissionDocument = gql`
  query getESGScope1Emission(
    $fromDate: date!
    $toDate: date!
    $organizationId: uuid!
  ) {
    poc_view_emission_by_scope(
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
      em_scope1
    }
  }
`;

/**
 * __useGetEsgScope1EmissionQuery__
 *
 * To run a query within a React component, call `useGetEsgScope1EmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgScope1EmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgScope1EmissionQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgScope1EmissionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEsgScope1EmissionQuery,
    GetEsgScope1EmissionQueryVariables
  > &
    (
      | { variables: GetEsgScope1EmissionQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEsgScope1EmissionQuery,
    GetEsgScope1EmissionQueryVariables
  >(GetEsgScope1EmissionDocument, options);
}
export function useGetEsgScope1EmissionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEsgScope1EmissionQuery,
    GetEsgScope1EmissionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEsgScope1EmissionQuery,
    GetEsgScope1EmissionQueryVariables
  >(GetEsgScope1EmissionDocument, options);
}
// @ts-ignore
export function useGetEsgScope1EmissionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEsgScope1EmissionQuery,
    GetEsgScope1EmissionQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEsgScope1EmissionQuery,
  GetEsgScope1EmissionQueryVariables
>;
export function useGetEsgScope1EmissionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgScope1EmissionQuery,
        GetEsgScope1EmissionQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEsgScope1EmissionQuery | undefined,
  GetEsgScope1EmissionQueryVariables
>;
export function useGetEsgScope1EmissionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgScope1EmissionQuery,
        GetEsgScope1EmissionQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEsgScope1EmissionQuery,
    GetEsgScope1EmissionQueryVariables
  >(GetEsgScope1EmissionDocument, options);
}
export type GetEsgScope1EmissionQueryHookResult = ReturnType<
  typeof useGetEsgScope1EmissionQuery
>;
export type GetEsgScope1EmissionLazyQueryHookResult = ReturnType<
  typeof useGetEsgScope1EmissionLazyQuery
>;
export type GetEsgScope1EmissionSuspenseQueryHookResult = ReturnType<
  typeof useGetEsgScope1EmissionSuspenseQuery
>;
export type GetEsgScope1EmissionQueryResult = Apollo.QueryResult<
  GetEsgScope1EmissionQuery,
  GetEsgScope1EmissionQueryVariables
>;
