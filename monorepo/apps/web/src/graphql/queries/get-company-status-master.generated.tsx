import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyStatusMasterQueryVariables = Types.Exact<{
  companyStatusGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyStatusMasterQuery = {
  __typename?: "query_root";
  Tbl_CompanyStatusMaster: Array<{
    __typename?: "Tbl_CompanyStatusMaster";
    CompanyStatusGuid: any;
    CompanyStatusName: string;
    RoleGuid?: any | null;
  }>;
};

export const GetCompanyStatusMasterDocument = gql`
  query GetCompanyStatusMaster($companyStatusGuid: uuid!) {
    Tbl_CompanyStatusMaster(
      where: { CompanyStatusGuid: { _eq: $companyStatusGuid } }
    ) {
      CompanyStatusGuid
      CompanyStatusName
      RoleGuid
    }
  }
`;

/**
 * __useGetCompanyStatusMasterQuery__
 *
 * To run a query within a React component, call `useGetCompanyStatusMasterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyStatusMasterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyStatusMasterQuery({
 *   variables: {
 *      companyStatusGuid: // value for 'companyStatusGuid'
 *   },
 * });
 */
export function useGetCompanyStatusMasterQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyStatusMasterQuery,
    GetCompanyStatusMasterQueryVariables
  > &
    (
      | { variables: GetCompanyStatusMasterQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyStatusMasterQuery,
    GetCompanyStatusMasterQueryVariables
  >(GetCompanyStatusMasterDocument, options);
}
export function useGetCompanyStatusMasterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyStatusMasterQuery,
    GetCompanyStatusMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyStatusMasterQuery,
    GetCompanyStatusMasterQueryVariables
  >(GetCompanyStatusMasterDocument, options);
}
// @ts-ignore
export function useGetCompanyStatusMasterSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyStatusMasterQuery,
    GetCompanyStatusMasterQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusMasterQuery,
  GetCompanyStatusMasterQueryVariables
>;
export function useGetCompanyStatusMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusMasterQuery,
        GetCompanyStatusMasterQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusMasterQuery | undefined,
  GetCompanyStatusMasterQueryVariables
>;
export function useGetCompanyStatusMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusMasterQuery,
        GetCompanyStatusMasterQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyStatusMasterQuery,
    GetCompanyStatusMasterQueryVariables
  >(GetCompanyStatusMasterDocument, options);
}
export type GetCompanyStatusMasterQueryHookResult = ReturnType<
  typeof useGetCompanyStatusMasterQuery
>;
export type GetCompanyStatusMasterLazyQueryHookResult = ReturnType<
  typeof useGetCompanyStatusMasterLazyQuery
>;
export type GetCompanyStatusMasterSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyStatusMasterSuspenseQuery
>;
export type GetCompanyStatusMasterQueryResult = Apollo.QueryResult<
  GetCompanyStatusMasterQuery,
  GetCompanyStatusMasterQueryVariables
>;
