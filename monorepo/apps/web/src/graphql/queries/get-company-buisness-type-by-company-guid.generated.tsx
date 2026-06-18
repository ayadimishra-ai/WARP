import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyBusinessTypeByCompanyGuidQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyBusinessTypeByCompanyGuidQuery = {
  __typename?: "query_root";
  Tbl_CompanyBusinessType: Array<{
    __typename?: "Tbl_CompanyBusinessType";
    BusinessTypeGuid?: any | null;
  }>;
};

export const GetCompanyBusinessTypeByCompanyGuidDocument = gql`
  query GetCompanyBusinessTypeByCompanyGuid($companyGuid: uuid!) {
    Tbl_CompanyBusinessType(where: { CompanyGuid: { _eq: $companyGuid } }) {
      BusinessTypeGuid
    }
  }
`;

/**
 * __useGetCompanyBusinessTypeByCompanyGuidQuery__
 *
 * To run a query within a React component, call `useGetCompanyBusinessTypeByCompanyGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyBusinessTypeByCompanyGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyBusinessTypeByCompanyGuidQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *   },
 * });
 */
export function useGetCompanyBusinessTypeByCompanyGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyBusinessTypeByCompanyGuidQuery,
    GetCompanyBusinessTypeByCompanyGuidQueryVariables
  > &
    (
      | {
          variables: GetCompanyBusinessTypeByCompanyGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyBusinessTypeByCompanyGuidQuery,
    GetCompanyBusinessTypeByCompanyGuidQueryVariables
  >(GetCompanyBusinessTypeByCompanyGuidDocument, options);
}
export function useGetCompanyBusinessTypeByCompanyGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyBusinessTypeByCompanyGuidQuery,
    GetCompanyBusinessTypeByCompanyGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyBusinessTypeByCompanyGuidQuery,
    GetCompanyBusinessTypeByCompanyGuidQueryVariables
  >(GetCompanyBusinessTypeByCompanyGuidDocument, options);
}
// @ts-ignore
export function useGetCompanyBusinessTypeByCompanyGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyBusinessTypeByCompanyGuidQuery,
    GetCompanyBusinessTypeByCompanyGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyBusinessTypeByCompanyGuidQuery,
  GetCompanyBusinessTypeByCompanyGuidQueryVariables
>;
export function useGetCompanyBusinessTypeByCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyBusinessTypeByCompanyGuidQuery,
        GetCompanyBusinessTypeByCompanyGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyBusinessTypeByCompanyGuidQuery | undefined,
  GetCompanyBusinessTypeByCompanyGuidQueryVariables
>;
export function useGetCompanyBusinessTypeByCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyBusinessTypeByCompanyGuidQuery,
        GetCompanyBusinessTypeByCompanyGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyBusinessTypeByCompanyGuidQuery,
    GetCompanyBusinessTypeByCompanyGuidQueryVariables
  >(GetCompanyBusinessTypeByCompanyGuidDocument, options);
}
export type GetCompanyBusinessTypeByCompanyGuidQueryHookResult = ReturnType<
  typeof useGetCompanyBusinessTypeByCompanyGuidQuery
>;
export type GetCompanyBusinessTypeByCompanyGuidLazyQueryHookResult = ReturnType<
  typeof useGetCompanyBusinessTypeByCompanyGuidLazyQuery
>;
export type GetCompanyBusinessTypeByCompanyGuidSuspenseQueryHookResult =
  ReturnType<typeof useGetCompanyBusinessTypeByCompanyGuidSuspenseQuery>;
export type GetCompanyBusinessTypeByCompanyGuidQueryResult = Apollo.QueryResult<
  GetCompanyBusinessTypeByCompanyGuidQuery,
  GetCompanyBusinessTypeByCompanyGuidQueryVariables
>;
