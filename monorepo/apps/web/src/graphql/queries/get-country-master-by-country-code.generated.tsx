import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryMasterByCountryCodeQueryVariables = Types.Exact<{
  countryCode: Types.Scalars["String"]["input"];
}>;

export type GetCountryMasterByCountryCodeQuery = {
  __typename?: "query_root";
  Tbl_CountryMaster: Array<{
    __typename?: "Tbl_CountryMaster";
    CountryGuid: any;
    CountryName: string;
    CountryCode: string;
  }>;
};

export const GetCountryMasterByCountryCodeDocument = gql`
  query GetCountryMasterByCountryCode($countryCode: String!) {
    Tbl_CountryMaster(where: { CountryCode: { _eq: $countryCode } }) {
      CountryGuid
      CountryName
      CountryCode
    }
  }
`;

/**
 * __useGetCountryMasterByCountryCodeQuery__
 *
 * To run a query within a React component, call `useGetCountryMasterByCountryCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryMasterByCountryCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryMasterByCountryCodeQuery({
 *   variables: {
 *      countryCode: // value for 'countryCode'
 *   },
 * });
 */
export function useGetCountryMasterByCountryCodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCountryMasterByCountryCodeQuery,
    GetCountryMasterByCountryCodeQueryVariables
  > &
    (
      | {
          variables: GetCountryMasterByCountryCodeQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCountryMasterByCountryCodeQuery,
    GetCountryMasterByCountryCodeQueryVariables
  >(GetCountryMasterByCountryCodeDocument, options);
}
export function useGetCountryMasterByCountryCodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryMasterByCountryCodeQuery,
    GetCountryMasterByCountryCodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCountryMasterByCountryCodeQuery,
    GetCountryMasterByCountryCodeQueryVariables
  >(GetCountryMasterByCountryCodeDocument, options);
}
// @ts-ignore
export function useGetCountryMasterByCountryCodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryMasterByCountryCodeQuery,
    GetCountryMasterByCountryCodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryMasterByCountryCodeQuery,
  GetCountryMasterByCountryCodeQueryVariables
>;
export function useGetCountryMasterByCountryCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryMasterByCountryCodeQuery,
        GetCountryMasterByCountryCodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryMasterByCountryCodeQuery | undefined,
  GetCountryMasterByCountryCodeQueryVariables
>;
export function useGetCountryMasterByCountryCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryMasterByCountryCodeQuery,
        GetCountryMasterByCountryCodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryMasterByCountryCodeQuery,
    GetCountryMasterByCountryCodeQueryVariables
  >(GetCountryMasterByCountryCodeDocument, options);
}
export type GetCountryMasterByCountryCodeQueryHookResult = ReturnType<
  typeof useGetCountryMasterByCountryCodeQuery
>;
export type GetCountryMasterByCountryCodeLazyQueryHookResult = ReturnType<
  typeof useGetCountryMasterByCountryCodeLazyQuery
>;
export type GetCountryMasterByCountryCodeSuspenseQueryHookResult = ReturnType<
  typeof useGetCountryMasterByCountryCodeSuspenseQuery
>;
export type GetCountryMasterByCountryCodeQueryResult = Apollo.QueryResult<
  GetCountryMasterByCountryCodeQuery,
  GetCountryMasterByCountryCodeQueryVariables
>;
