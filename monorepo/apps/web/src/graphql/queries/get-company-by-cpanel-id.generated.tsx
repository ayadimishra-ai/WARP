import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyByCpanelIdQueryVariables = Types.Exact<{
  cpanelCompanyId: Types.Scalars["String"]["input"];
}>;

export type GetCompanyByCpanelIdQuery = {
  __typename?: "query_root";
  Tbl_Companies: Array<{
    __typename?: "Tbl_Companies";
    CompanyGuid: any;
    CPanelCompanyId?: string | null;
    CompanyName?: string | null;
    StatusGuid?: any | null;
    IsActive?: boolean | null;
    IsManufacturing?: boolean | null;
    CPanelCompanyIndustry?: string | null;
    CountryGuid?: any | null;
    OPSCompanyId?: string | null;
  }>;
};

export const GetCompanyByCpanelIdDocument = gql`
  query GetCompanyByCpanelId($cpanelCompanyId: String!) {
    Tbl_Companies(where: { CPanelCompanyId: { _eq: $cpanelCompanyId } }) {
      CompanyGuid
      CPanelCompanyId
      CompanyName
      StatusGuid
      IsActive
      IsManufacturing
      CPanelCompanyIndustry
      CountryGuid
      OPSCompanyId
    }
  }
`;

/**
 * __useGetCompanyByCpanelIdQuery__
 *
 * To run a query within a React component, call `useGetCompanyByCpanelIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyByCpanelIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyByCpanelIdQuery({
 *   variables: {
 *      cpanelCompanyId: // value for 'cpanelCompanyId'
 *   },
 * });
 */
export function useGetCompanyByCpanelIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyByCpanelIdQuery,
    GetCompanyByCpanelIdQueryVariables
  > &
    (
      | { variables: GetCompanyByCpanelIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyByCpanelIdQuery,
    GetCompanyByCpanelIdQueryVariables
  >(GetCompanyByCpanelIdDocument, options);
}
export function useGetCompanyByCpanelIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyByCpanelIdQuery,
    GetCompanyByCpanelIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyByCpanelIdQuery,
    GetCompanyByCpanelIdQueryVariables
  >(GetCompanyByCpanelIdDocument, options);
}
// @ts-ignore
export function useGetCompanyByCpanelIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyByCpanelIdQuery,
    GetCompanyByCpanelIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyByCpanelIdQuery,
  GetCompanyByCpanelIdQueryVariables
>;
export function useGetCompanyByCpanelIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyByCpanelIdQuery,
        GetCompanyByCpanelIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyByCpanelIdQuery | undefined,
  GetCompanyByCpanelIdQueryVariables
>;
export function useGetCompanyByCpanelIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyByCpanelIdQuery,
        GetCompanyByCpanelIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyByCpanelIdQuery,
    GetCompanyByCpanelIdQueryVariables
  >(GetCompanyByCpanelIdDocument, options);
}
export type GetCompanyByCpanelIdQueryHookResult = ReturnType<
  typeof useGetCompanyByCpanelIdQuery
>;
export type GetCompanyByCpanelIdLazyQueryHookResult = ReturnType<
  typeof useGetCompanyByCpanelIdLazyQuery
>;
export type GetCompanyByCpanelIdSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyByCpanelIdSuspenseQuery
>;
export type GetCompanyByCpanelIdQueryResult = Apollo.QueryResult<
  GetCompanyByCpanelIdQuery,
  GetCompanyByCpanelIdQueryVariables
>;
