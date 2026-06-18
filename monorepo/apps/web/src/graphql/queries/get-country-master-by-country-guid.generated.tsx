import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryMasterByCountryGuidQueryVariables = Types.Exact<{
  countryGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCountryMasterByCountryGuidQuery = {
  __typename?: "query_root";
  Tbl_CountryMaster: Array<{
    __typename?: "Tbl_CountryMaster";
    CountryGuid: any;
    CountryName: string;
    CountryCode: string;
  }>;
};

export const GetCountryMasterByCountryGuidDocument = gql`
  query GetCountryMasterByCountryGuid($countryGuid: uuid!) {
    Tbl_CountryMaster(where: { CountryGuid: { _eq: $countryGuid } }) {
      CountryGuid
      CountryName
      CountryCode
    }
  }
`;

/**
 * __useGetCountryMasterByCountryGuidQuery__
 *
 * To run a query within a React component, call `useGetCountryMasterByCountryGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryMasterByCountryGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryMasterByCountryGuidQuery({
 *   variables: {
 *      countryGuid: // value for 'countryGuid'
 *   },
 * });
 */
export function useGetCountryMasterByCountryGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCountryMasterByCountryGuidQuery,
    GetCountryMasterByCountryGuidQueryVariables
  > &
    (
      | {
          variables: GetCountryMasterByCountryGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCountryMasterByCountryGuidQuery,
    GetCountryMasterByCountryGuidQueryVariables
  >(GetCountryMasterByCountryGuidDocument, options);
}
export function useGetCountryMasterByCountryGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryMasterByCountryGuidQuery,
    GetCountryMasterByCountryGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCountryMasterByCountryGuidQuery,
    GetCountryMasterByCountryGuidQueryVariables
  >(GetCountryMasterByCountryGuidDocument, options);
}
// @ts-ignore
export function useGetCountryMasterByCountryGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryMasterByCountryGuidQuery,
    GetCountryMasterByCountryGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryMasterByCountryGuidQuery,
  GetCountryMasterByCountryGuidQueryVariables
>;
export function useGetCountryMasterByCountryGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryMasterByCountryGuidQuery,
        GetCountryMasterByCountryGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryMasterByCountryGuidQuery | undefined,
  GetCountryMasterByCountryGuidQueryVariables
>;
export function useGetCountryMasterByCountryGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryMasterByCountryGuidQuery,
        GetCountryMasterByCountryGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryMasterByCountryGuidQuery,
    GetCountryMasterByCountryGuidQueryVariables
  >(GetCountryMasterByCountryGuidDocument, options);
}
export type GetCountryMasterByCountryGuidQueryHookResult = ReturnType<
  typeof useGetCountryMasterByCountryGuidQuery
>;
export type GetCountryMasterByCountryGuidLazyQueryHookResult = ReturnType<
  typeof useGetCountryMasterByCountryGuidLazyQuery
>;
export type GetCountryMasterByCountryGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetCountryMasterByCountryGuidSuspenseQuery
>;
export type GetCountryMasterByCountryGuidQueryResult = Apollo.QueryResult<
  GetCountryMasterByCountryGuidQuery,
  GetCountryMasterByCountryGuidQueryVariables
>;
