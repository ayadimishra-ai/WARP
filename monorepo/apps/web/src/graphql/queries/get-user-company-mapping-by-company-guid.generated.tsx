import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserCompanyMappingByCompanyGuidQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserCompanyMappingByCompanyGuidQuery = {
  __typename?: "query_root";
  Tbl_UserCompanyMapping: Array<{
    __typename?: "Tbl_UserCompanyMapping";
    UserCompanyMappingGuid: any;
    UserGuid?: any | null;
    CompanyGuid?: any | null;
    IsActive?: boolean | null;
  }>;
};

export const GetUserCompanyMappingByCompanyGuidDocument = gql`
  query GetUserCompanyMappingByCompanyGuid($companyGuid: uuid!) {
    Tbl_UserCompanyMapping(where: { CompanyGuid: { _eq: $companyGuid } }) {
      UserCompanyMappingGuid
      UserGuid
      CompanyGuid
      IsActive
    }
  }
`;

/**
 * __useGetUserCompanyMappingByCompanyGuidQuery__
 *
 * To run a query within a React component, call `useGetUserCompanyMappingByCompanyGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserCompanyMappingByCompanyGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserCompanyMappingByCompanyGuidQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *   },
 * });
 */
export function useGetUserCompanyMappingByCompanyGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserCompanyMappingByCompanyGuidQuery,
    GetUserCompanyMappingByCompanyGuidQueryVariables
  > &
    (
      | {
          variables: GetUserCompanyMappingByCompanyGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserCompanyMappingByCompanyGuidQuery,
    GetUserCompanyMappingByCompanyGuidQueryVariables
  >(GetUserCompanyMappingByCompanyGuidDocument, options);
}
export function useGetUserCompanyMappingByCompanyGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserCompanyMappingByCompanyGuidQuery,
    GetUserCompanyMappingByCompanyGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserCompanyMappingByCompanyGuidQuery,
    GetUserCompanyMappingByCompanyGuidQueryVariables
  >(GetUserCompanyMappingByCompanyGuidDocument, options);
}
// @ts-ignore
export function useGetUserCompanyMappingByCompanyGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserCompanyMappingByCompanyGuidQuery,
    GetUserCompanyMappingByCompanyGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingByCompanyGuidQuery,
  GetUserCompanyMappingByCompanyGuidQueryVariables
>;
export function useGetUserCompanyMappingByCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingByCompanyGuidQuery,
        GetUserCompanyMappingByCompanyGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingByCompanyGuidQuery | undefined,
  GetUserCompanyMappingByCompanyGuidQueryVariables
>;
export function useGetUserCompanyMappingByCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingByCompanyGuidQuery,
        GetUserCompanyMappingByCompanyGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserCompanyMappingByCompanyGuidQuery,
    GetUserCompanyMappingByCompanyGuidQueryVariables
  >(GetUserCompanyMappingByCompanyGuidDocument, options);
}
export type GetUserCompanyMappingByCompanyGuidQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingByCompanyGuidQuery
>;
export type GetUserCompanyMappingByCompanyGuidLazyQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingByCompanyGuidLazyQuery
>;
export type GetUserCompanyMappingByCompanyGuidSuspenseQueryHookResult =
  ReturnType<typeof useGetUserCompanyMappingByCompanyGuidSuspenseQuery>;
export type GetUserCompanyMappingByCompanyGuidQueryResult = Apollo.QueryResult<
  GetUserCompanyMappingByCompanyGuidQuery,
  GetUserCompanyMappingByCompanyGuidQueryVariables
>;
