import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserCompanyMappingsDetailsByMobileQueryVariables = Types.Exact<{
  mobile: Types.Scalars["String"]["input"];
}>;

export type GetUserCompanyMappingsDetailsByMobileQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    FirstName?: string | null;
    EmailId: string;
    MobileNumber?: string | null;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      CompanyGuid?: any | null;
      Tbl_Company?: {
        __typename?: "Tbl_Companies";
        CPanelCompanyId?: string | null;
      } | null;
    }>;
  }>;
};

export const GetUserCompanyMappingsDetailsByMobileDocument = gql`
  query GetUserCompanyMappingsDetailsByMobile($mobile: String!) {
    Tbl_Users(where: { MobileNumber: { _eq: $mobile } }) {
      UserGuid
      FirstName
      EmailId
      MobileNumber
      Tbl_UserCompanyMappings {
        CompanyGuid
        Tbl_Company {
          CPanelCompanyId
        }
      }
    }
  }
`;

/**
 * __useGetUserCompanyMappingsDetailsByMobileQuery__
 *
 * To run a query within a React component, call `useGetUserCompanyMappingsDetailsByMobileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserCompanyMappingsDetailsByMobileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserCompanyMappingsDetailsByMobileQuery({
 *   variables: {
 *      mobile: // value for 'mobile'
 *   },
 * });
 */
export function useGetUserCompanyMappingsDetailsByMobileQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  > &
    (
      | {
          variables: GetUserCompanyMappingsDetailsByMobileQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  >(GetUserCompanyMappingsDetailsByMobileDocument, options);
}
export function useGetUserCompanyMappingsDetailsByMobileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  >(GetUserCompanyMappingsDetailsByMobileDocument, options);
}
// @ts-ignore
export function useGetUserCompanyMappingsDetailsByMobileSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingsDetailsByMobileQuery,
  GetUserCompanyMappingsDetailsByMobileQueryVariables
>;
export function useGetUserCompanyMappingsDetailsByMobileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingsDetailsByMobileQuery,
        GetUserCompanyMappingsDetailsByMobileQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingsDetailsByMobileQuery | undefined,
  GetUserCompanyMappingsDetailsByMobileQueryVariables
>;
export function useGetUserCompanyMappingsDetailsByMobileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingsDetailsByMobileQuery,
        GetUserCompanyMappingsDetailsByMobileQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  >(GetUserCompanyMappingsDetailsByMobileDocument, options);
}
export type GetUserCompanyMappingsDetailsByMobileQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingsDetailsByMobileQuery
>;
export type GetUserCompanyMappingsDetailsByMobileLazyQueryHookResult =
  ReturnType<typeof useGetUserCompanyMappingsDetailsByMobileLazyQuery>;
export type GetUserCompanyMappingsDetailsByMobileSuspenseQueryHookResult =
  ReturnType<typeof useGetUserCompanyMappingsDetailsByMobileSuspenseQuery>;
export type GetUserCompanyMappingsDetailsByMobileQueryResult =
  Apollo.QueryResult<
    GetUserCompanyMappingsDetailsByMobileQuery,
    GetUserCompanyMappingsDetailsByMobileQueryVariables
  >;
