import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyGeneralDetailsByCompanyGuidQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyGeneralDetailsByCompanyGuidQuery = {
  __typename?: "query_root";
  Tbl_CompanyGeneralDetails: Array<{
    __typename?: "Tbl_CompanyGeneralDetails";
    CompanyGuid: any;
    GSTNumber?: string | null;
    CompanyRegistrationNumber?: string | null;
    YearEstablished?: number | null;
    LegalStructureGuid?: any | null;
  }>;
};

export const GetCompanyGeneralDetailsByCompanyGuidDocument = gql`
  query GetCompanyGeneralDetailsByCompanyGuid($companyGuid: uuid!) {
    Tbl_CompanyGeneralDetails(where: { CompanyGuid: { _eq: $companyGuid } }) {
      CompanyGuid
      GSTNumber
      CompanyRegistrationNumber
      YearEstablished
      LegalStructureGuid
    }
  }
`;

/**
 * __useGetCompanyGeneralDetailsByCompanyGuidQuery__
 *
 * To run a query within a React component, call `useGetCompanyGeneralDetailsByCompanyGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyGeneralDetailsByCompanyGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyGeneralDetailsByCompanyGuidQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *   },
 * });
 */
export function useGetCompanyGeneralDetailsByCompanyGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  > &
    (
      | {
          variables: GetCompanyGeneralDetailsByCompanyGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  >(GetCompanyGeneralDetailsByCompanyGuidDocument, options);
}
export function useGetCompanyGeneralDetailsByCompanyGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  >(GetCompanyGeneralDetailsByCompanyGuidDocument, options);
}
// @ts-ignore
export function useGetCompanyGeneralDetailsByCompanyGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyGeneralDetailsByCompanyGuidQuery,
  GetCompanyGeneralDetailsByCompanyGuidQueryVariables
>;
export function useGetCompanyGeneralDetailsByCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyGeneralDetailsByCompanyGuidQuery,
        GetCompanyGeneralDetailsByCompanyGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyGeneralDetailsByCompanyGuidQuery | undefined,
  GetCompanyGeneralDetailsByCompanyGuidQueryVariables
>;
export function useGetCompanyGeneralDetailsByCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyGeneralDetailsByCompanyGuidQuery,
        GetCompanyGeneralDetailsByCompanyGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  >(GetCompanyGeneralDetailsByCompanyGuidDocument, options);
}
export type GetCompanyGeneralDetailsByCompanyGuidQueryHookResult = ReturnType<
  typeof useGetCompanyGeneralDetailsByCompanyGuidQuery
>;
export type GetCompanyGeneralDetailsByCompanyGuidLazyQueryHookResult =
  ReturnType<typeof useGetCompanyGeneralDetailsByCompanyGuidLazyQuery>;
export type GetCompanyGeneralDetailsByCompanyGuidSuspenseQueryHookResult =
  ReturnType<typeof useGetCompanyGeneralDetailsByCompanyGuidSuspenseQuery>;
export type GetCompanyGeneralDetailsByCompanyGuidQueryResult =
  Apollo.QueryResult<
    GetCompanyGeneralDetailsByCompanyGuidQuery,
    GetCompanyGeneralDetailsByCompanyGuidQueryVariables
  >;
