import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryDataQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetCountryDataQuery = {
  __typename?: "query_root";
  Country: Array<{
    __typename?: "Country";
    id: any;
    name: string;
    code: string;
  }>;
};

export const GetCountryDataDocument = gql`
  query getCountryData {
    Country {
      id
      name
      code
    }
  }
`;

/**
 * __useGetCountryDataQuery__
 *
 * To run a query within a React component, call `useGetCountryDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCountryDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCountryDataQuery,
    GetCountryDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCountryDataQuery, GetCountryDataQueryVariables>(
    GetCountryDataDocument,
    options
  );
}
export function useGetCountryDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryDataQuery,
    GetCountryDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCountryDataQuery, GetCountryDataQueryVariables>(
    GetCountryDataDocument,
    options
  );
}
// @ts-ignore
export function useGetCountryDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryDataQuery,
    GetCountryDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryDataQuery,
  GetCountryDataQueryVariables
>;
export function useGetCountryDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryDataQuery,
        GetCountryDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryDataQuery | undefined,
  GetCountryDataQueryVariables
>;
export function useGetCountryDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryDataQuery,
        GetCountryDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryDataQuery,
    GetCountryDataQueryVariables
  >(GetCountryDataDocument, options);
}
export type GetCountryDataQueryHookResult = ReturnType<
  typeof useGetCountryDataQuery
>;
export type GetCountryDataLazyQueryHookResult = ReturnType<
  typeof useGetCountryDataLazyQuery
>;
export type GetCountryDataSuspenseQueryHookResult = ReturnType<
  typeof useGetCountryDataSuspenseQuery
>;
export type GetCountryDataQueryResult = Apollo.QueryResult<
  GetCountryDataQuery,
  GetCountryDataQueryVariables
>;
