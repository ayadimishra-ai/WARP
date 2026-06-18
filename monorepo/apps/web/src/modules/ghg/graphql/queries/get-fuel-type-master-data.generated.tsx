import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetFuelTypeMasterDataQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetFuelTypeMasterDataQuery = {
  __typename?: "query_root";
  FuelTypeMaster: Array<{
    __typename?: "FuelTypeMaster";
    id: any;
    label: string;
    code: string;
    description: string;
    metadata: any;
  }>;
};

export const GetFuelTypeMasterDataDocument = gql`
  query getFuelTypeMasterData {
    FuelTypeMaster {
      id
      label
      code
      description
      metadata
    }
  }
`;

/**
 * __useGetFuelTypeMasterDataQuery__
 *
 * To run a query within a React component, call `useGetFuelTypeMasterDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFuelTypeMasterDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFuelTypeMasterDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFuelTypeMasterDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetFuelTypeMasterDataQuery,
    GetFuelTypeMasterDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetFuelTypeMasterDataQuery,
    GetFuelTypeMasterDataQueryVariables
  >(GetFuelTypeMasterDataDocument, options);
}
export function useGetFuelTypeMasterDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFuelTypeMasterDataQuery,
    GetFuelTypeMasterDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetFuelTypeMasterDataQuery,
    GetFuelTypeMasterDataQueryVariables
  >(GetFuelTypeMasterDataDocument, options);
}
// @ts-ignore
export function useGetFuelTypeMasterDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetFuelTypeMasterDataQuery,
    GetFuelTypeMasterDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetFuelTypeMasterDataQuery,
  GetFuelTypeMasterDataQueryVariables
>;
export function useGetFuelTypeMasterDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFuelTypeMasterDataQuery,
        GetFuelTypeMasterDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetFuelTypeMasterDataQuery | undefined,
  GetFuelTypeMasterDataQueryVariables
>;
export function useGetFuelTypeMasterDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetFuelTypeMasterDataQuery,
        GetFuelTypeMasterDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetFuelTypeMasterDataQuery,
    GetFuelTypeMasterDataQueryVariables
  >(GetFuelTypeMasterDataDocument, options);
}
export type GetFuelTypeMasterDataQueryHookResult = ReturnType<
  typeof useGetFuelTypeMasterDataQuery
>;
export type GetFuelTypeMasterDataLazyQueryHookResult = ReturnType<
  typeof useGetFuelTypeMasterDataLazyQuery
>;
export type GetFuelTypeMasterDataSuspenseQueryHookResult = ReturnType<
  typeof useGetFuelTypeMasterDataSuspenseQuery
>;
export type GetFuelTypeMasterDataQueryResult = Apollo.QueryResult<
  GetFuelTypeMasterDataQuery,
  GetFuelTypeMasterDataQueryVariables
>;
