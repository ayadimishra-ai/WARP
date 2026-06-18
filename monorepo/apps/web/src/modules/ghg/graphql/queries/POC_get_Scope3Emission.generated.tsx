import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEsgScope3EmissionQueryVariables = Types.Exact<{
  fromDate: Types.Scalars["date"]["input"];
  toDate: Types.Scalars["date"]["input"];
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetEsgScope3EmissionQuery = {
  __typename?: "query_root";
  poc_view_emission_by_scope: Array<{
    __typename?: "poc_view_emission_by_scope";
    organization_id?: any | null;
    year?: any | null;
    month?: any | null;
    period_date?: any | null;
    em_scope3?: any | null;
  }>;
};

export const GetEsgScope3EmissionDocument = gql`
  query getESGScope3Emission(
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
      em_scope3
    }
  }
`;

/**
 * __useGetEsgScope3EmissionQuery__
 *
 * To run a query within a React component, call `useGetEsgScope3EmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgScope3EmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgScope3EmissionQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgScope3EmissionQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEsgScope3EmissionQuery,
    GetEsgScope3EmissionQueryVariables
  > &
    (
      | { variables: GetEsgScope3EmissionQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEsgScope3EmissionQuery,
    GetEsgScope3EmissionQueryVariables
  >(GetEsgScope3EmissionDocument, options);
}
export function useGetEsgScope3EmissionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEsgScope3EmissionQuery,
    GetEsgScope3EmissionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEsgScope3EmissionQuery,
    GetEsgScope3EmissionQueryVariables
  >(GetEsgScope3EmissionDocument, options);
}
// @ts-ignore
export function useGetEsgScope3EmissionSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEsgScope3EmissionQuery,
    GetEsgScope3EmissionQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEsgScope3EmissionQuery,
  GetEsgScope3EmissionQueryVariables
>;
export function useGetEsgScope3EmissionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgScope3EmissionQuery,
        GetEsgScope3EmissionQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEsgScope3EmissionQuery | undefined,
  GetEsgScope3EmissionQueryVariables
>;
export function useGetEsgScope3EmissionSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEsgScope3EmissionQuery,
        GetEsgScope3EmissionQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEsgScope3EmissionQuery,
    GetEsgScope3EmissionQueryVariables
  >(GetEsgScope3EmissionDocument, options);
}
export type GetEsgScope3EmissionQueryHookResult = ReturnType<
  typeof useGetEsgScope3EmissionQuery
>;
export type GetEsgScope3EmissionLazyQueryHookResult = ReturnType<
  typeof useGetEsgScope3EmissionLazyQuery
>;
export type GetEsgScope3EmissionSuspenseQueryHookResult = ReturnType<
  typeof useGetEsgScope3EmissionSuspenseQuery
>;
export type GetEsgScope3EmissionQueryResult = Apollo.QueryResult<
  GetEsgScope3EmissionQuery,
  GetEsgScope3EmissionQueryVariables
>;
