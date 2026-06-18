import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyStatusMasterByNameQueryVariables = Types.Exact<{
  status: Types.Scalars["String"]["input"];
}>;

export type GetCompanyStatusMasterByNameQuery = {
  __typename?: "query_root";
  Tbl_CompanyStatusMaster: Array<{
    __typename?: "Tbl_CompanyStatusMaster";
    CompanyStatusGuid: any;
    CompanyStatusName: string;
  }>;
};

export const GetCompanyStatusMasterByNameDocument = gql`
  query GetCompanyStatusMasterByName($status: String!) {
    Tbl_CompanyStatusMaster(where: { CompanyStatusName: { _ilike: $status } }) {
      CompanyStatusGuid
      CompanyStatusName
    }
  }
`;

/**
 * __useGetCompanyStatusMasterByNameQuery__
 *
 * To run a query within a React component, call `useGetCompanyStatusMasterByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyStatusMasterByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyStatusMasterByNameQuery({
 *   variables: {
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetCompanyStatusMasterByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyStatusMasterByNameQuery,
    GetCompanyStatusMasterByNameQueryVariables
  > &
    (
      | {
          variables: GetCompanyStatusMasterByNameQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyStatusMasterByNameQuery,
    GetCompanyStatusMasterByNameQueryVariables
  >(GetCompanyStatusMasterByNameDocument, options);
}
export function useGetCompanyStatusMasterByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyStatusMasterByNameQuery,
    GetCompanyStatusMasterByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyStatusMasterByNameQuery,
    GetCompanyStatusMasterByNameQueryVariables
  >(GetCompanyStatusMasterByNameDocument, options);
}
// @ts-ignore
export function useGetCompanyStatusMasterByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyStatusMasterByNameQuery,
    GetCompanyStatusMasterByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusMasterByNameQuery,
  GetCompanyStatusMasterByNameQueryVariables
>;
export function useGetCompanyStatusMasterByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusMasterByNameQuery,
        GetCompanyStatusMasterByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusMasterByNameQuery | undefined,
  GetCompanyStatusMasterByNameQueryVariables
>;
export function useGetCompanyStatusMasterByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusMasterByNameQuery,
        GetCompanyStatusMasterByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyStatusMasterByNameQuery,
    GetCompanyStatusMasterByNameQueryVariables
  >(GetCompanyStatusMasterByNameDocument, options);
}
export type GetCompanyStatusMasterByNameQueryHookResult = ReturnType<
  typeof useGetCompanyStatusMasterByNameQuery
>;
export type GetCompanyStatusMasterByNameLazyQueryHookResult = ReturnType<
  typeof useGetCompanyStatusMasterByNameLazyQuery
>;
export type GetCompanyStatusMasterByNameSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyStatusMasterByNameSuspenseQuery
>;
export type GetCompanyStatusMasterByNameQueryResult = Apollo.QueryResult<
  GetCompanyStatusMasterByNameQuery,
  GetCompanyStatusMasterByNameQueryVariables
>;
