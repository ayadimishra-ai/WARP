import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CheckCompanyExistsQueryVariables = Types.Exact<{
  companyName: Types.Scalars["String"]["input"];
}>;

export type CheckCompanyExistsQuery = {
  __typename?: "query_root";
  Tbl_Companies: Array<{
    __typename?: "Tbl_Companies";
    CompanyGuid: any;
    CompanyName?: string | null;
    CountryGuid?: any | null;
    IsActive?: boolean | null;
  }>;
};

export const CheckCompanyExistsDocument = gql`
  query CheckCompanyExists($companyName: String!) {
    Tbl_Companies(where: { CompanyName: { _ilike: $companyName } }, limit: 1) {
      CompanyGuid
      CompanyName
      CountryGuid
      IsActive
    }
  }
`;

/**
 * __useCheckCompanyExistsQuery__
 *
 * To run a query within a React component, call `useCheckCompanyExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckCompanyExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckCompanyExistsQuery({
 *   variables: {
 *      companyName: // value for 'companyName'
 *   },
 * });
 */
export function useCheckCompanyExistsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CheckCompanyExistsQuery,
    CheckCompanyExistsQueryVariables
  > &
    (
      | { variables: CheckCompanyExistsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CheckCompanyExistsQuery,
    CheckCompanyExistsQueryVariables
  >(CheckCompanyExistsDocument, options);
}
export function useCheckCompanyExistsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CheckCompanyExistsQuery,
    CheckCompanyExistsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CheckCompanyExistsQuery,
    CheckCompanyExistsQueryVariables
  >(CheckCompanyExistsDocument, options);
}
// @ts-ignore
export function useCheckCompanyExistsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CheckCompanyExistsQuery,
    CheckCompanyExistsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  CheckCompanyExistsQuery,
  CheckCompanyExistsQueryVariables
>;
export function useCheckCompanyExistsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckCompanyExistsQuery,
        CheckCompanyExistsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  CheckCompanyExistsQuery | undefined,
  CheckCompanyExistsQueryVariables
>;
export function useCheckCompanyExistsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CheckCompanyExistsQuery,
        CheckCompanyExistsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CheckCompanyExistsQuery,
    CheckCompanyExistsQueryVariables
  >(CheckCompanyExistsDocument, options);
}
export type CheckCompanyExistsQueryHookResult = ReturnType<
  typeof useCheckCompanyExistsQuery
>;
export type CheckCompanyExistsLazyQueryHookResult = ReturnType<
  typeof useCheckCompanyExistsLazyQuery
>;
export type CheckCompanyExistsSuspenseQueryHookResult = ReturnType<
  typeof useCheckCompanyExistsSuspenseQuery
>;
export type CheckCompanyExistsQueryResult = Apollo.QueryResult<
  CheckCompanyExistsQuery,
  CheckCompanyExistsQueryVariables
>;
