import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryMasterQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetCountryMasterQuery = {
  __typename?: "query_root";
  Tbl_CountryMaster: Array<{
    __typename?: "Tbl_CountryMaster";
    CountryGuid: any;
    CountryName: string;
    CountryCode: string;
    Image?: string | null;
    MobileCode?: string | null;
    RegionGuid?: any | null;
    IsActive?: boolean | null;
    StatusForSupplier?: boolean | null;
  }>;
};

export const GetCountryMasterDocument = gql`
  query GetCountryMaster {
    Tbl_CountryMaster(where: { StatusForSupplier: { _eq: true } }) {
      CountryGuid
      CountryName
      CountryCode
      Image
      MobileCode
      RegionGuid
      IsActive
      StatusForSupplier
    }
  }
`;

/**
 * __useGetCountryMasterQuery__
 *
 * To run a query within a React component, call `useGetCountryMasterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryMasterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryMasterQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCountryMasterQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCountryMasterQuery,
    GetCountryMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCountryMasterQuery, GetCountryMasterQueryVariables>(
    GetCountryMasterDocument,
    options
  );
}
export function useGetCountryMasterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryMasterQuery,
    GetCountryMasterQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCountryMasterQuery,
    GetCountryMasterQueryVariables
  >(GetCountryMasterDocument, options);
}
// @ts-ignore
export function useGetCountryMasterSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryMasterQuery,
    GetCountryMasterQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryMasterQuery,
  GetCountryMasterQueryVariables
>;
export function useGetCountryMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryMasterQuery,
        GetCountryMasterQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryMasterQuery | undefined,
  GetCountryMasterQueryVariables
>;
export function useGetCountryMasterSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryMasterQuery,
        GetCountryMasterQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryMasterQuery,
    GetCountryMasterQueryVariables
  >(GetCountryMasterDocument, options);
}
export type GetCountryMasterQueryHookResult = ReturnType<
  typeof useGetCountryMasterQuery
>;
export type GetCountryMasterLazyQueryHookResult = ReturnType<
  typeof useGetCountryMasterLazyQuery
>;
export type GetCountryMasterSuspenseQueryHookResult = ReturnType<
  typeof useGetCountryMasterSuspenseQuery
>;
export type GetCountryMasterQueryResult = Apollo.QueryResult<
  GetCountryMasterQuery,
  GetCountryMasterQueryVariables
>;
