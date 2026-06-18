import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyStatusLogQueryVariables = Types.Exact<{
  companyGuid?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
  excludeCreatedBy?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetCompanyStatusLogQuery = {
  __typename?: "query_root";
  Tbl_CompanyStatusLog: Array<{
    __typename?: "Tbl_CompanyStatusLog";
    CompanyStatusLogGuid: any;
    CompanyGuid?: any | null;
    Comment?: string | null;
    CreatedBy?: any | null;
  }>;
};

export const GetCompanyStatusLogDocument = gql`
  query GetCompanyStatusLog($companyGuid: uuid, $excludeCreatedBy: uuid) {
    Tbl_CompanyStatusLog(
      where: {
        CompanyGuid: { _eq: $companyGuid }
        CreatedBy: { _neq: $excludeCreatedBy }
      }
      order_by: { CreatedDate: desc }
      limit: 1
    ) {
      CompanyStatusLogGuid
      CompanyGuid
      Comment
      CreatedBy
    }
  }
`;

/**
 * __useGetCompanyStatusLogQuery__
 *
 * To run a query within a React component, call `useGetCompanyStatusLogQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyStatusLogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyStatusLogQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *      excludeCreatedBy: // value for 'excludeCreatedBy'
 *   },
 * });
 */
export function useGetCompanyStatusLogQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCompanyStatusLogQuery,
    GetCompanyStatusLogQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyStatusLogQuery,
    GetCompanyStatusLogQueryVariables
  >(GetCompanyStatusLogDocument, options);
}
export function useGetCompanyStatusLogLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyStatusLogQuery,
    GetCompanyStatusLogQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyStatusLogQuery,
    GetCompanyStatusLogQueryVariables
  >(GetCompanyStatusLogDocument, options);
}
// @ts-ignore
export function useGetCompanyStatusLogSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyStatusLogQuery,
    GetCompanyStatusLogQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusLogQuery,
  GetCompanyStatusLogQueryVariables
>;
export function useGetCompanyStatusLogSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusLogQuery,
        GetCompanyStatusLogQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusLogQuery | undefined,
  GetCompanyStatusLogQueryVariables
>;
export function useGetCompanyStatusLogSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusLogQuery,
        GetCompanyStatusLogQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyStatusLogQuery,
    GetCompanyStatusLogQueryVariables
  >(GetCompanyStatusLogDocument, options);
}
export type GetCompanyStatusLogQueryHookResult = ReturnType<
  typeof useGetCompanyStatusLogQuery
>;
export type GetCompanyStatusLogLazyQueryHookResult = ReturnType<
  typeof useGetCompanyStatusLogLazyQuery
>;
export type GetCompanyStatusLogSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyStatusLogSuspenseQuery
>;
export type GetCompanyStatusLogQueryResult = Apollo.QueryResult<
  GetCompanyStatusLogQuery,
  GetCompanyStatusLogQueryVariables
>;
