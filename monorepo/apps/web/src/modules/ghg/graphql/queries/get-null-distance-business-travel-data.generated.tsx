import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetNullDistanceBusinessTravelDataQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetNullDistanceBusinessTravelDataQuery = {
  __typename?: "query_root";
  GHGTransport_BusinessTravel: Array<{
    __typename?: "GHGTransport_BusinessTravel";
    id: any;
    task_request_id: any;
    Trip_From_Country?: string | null;
    Trip_To_Country?: string | null;
    Trip_From_Pincode?: string | null;
    Trip_To_Pincode?: string | null;
    Mode_of_Transport?: string | null;
  }>;
};

export const GetNullDistanceBusinessTravelDataDocument = gql`
  query getNullDistanceBusinessTravelData {
    GHGTransport_BusinessTravel(
      where: { Trip_Distance: { _is_null: true } }
      limit: 3800
    ) {
      id
      task_request_id
      Trip_From_Country
      Trip_To_Country
      Trip_From_Pincode
      Trip_To_Pincode
      Mode_of_Transport
    }
  }
`;

/**
 * __useGetNullDistanceBusinessTravelDataQuery__
 *
 * To run a query within a React component, call `useGetNullDistanceBusinessTravelDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNullDistanceBusinessTravelDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNullDistanceBusinessTravelDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetNullDistanceBusinessTravelDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetNullDistanceBusinessTravelDataQuery,
    GetNullDistanceBusinessTravelDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetNullDistanceBusinessTravelDataQuery,
    GetNullDistanceBusinessTravelDataQueryVariables
  >(GetNullDistanceBusinessTravelDataDocument, options);
}
export function useGetNullDistanceBusinessTravelDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetNullDistanceBusinessTravelDataQuery,
    GetNullDistanceBusinessTravelDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetNullDistanceBusinessTravelDataQuery,
    GetNullDistanceBusinessTravelDataQueryVariables
  >(GetNullDistanceBusinessTravelDataDocument, options);
}
// @ts-ignore
export function useGetNullDistanceBusinessTravelDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetNullDistanceBusinessTravelDataQuery,
    GetNullDistanceBusinessTravelDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetNullDistanceBusinessTravelDataQuery,
  GetNullDistanceBusinessTravelDataQueryVariables
>;
export function useGetNullDistanceBusinessTravelDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetNullDistanceBusinessTravelDataQuery,
        GetNullDistanceBusinessTravelDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetNullDistanceBusinessTravelDataQuery | undefined,
  GetNullDistanceBusinessTravelDataQueryVariables
>;
export function useGetNullDistanceBusinessTravelDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetNullDistanceBusinessTravelDataQuery,
        GetNullDistanceBusinessTravelDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetNullDistanceBusinessTravelDataQuery,
    GetNullDistanceBusinessTravelDataQueryVariables
  >(GetNullDistanceBusinessTravelDataDocument, options);
}
export type GetNullDistanceBusinessTravelDataQueryHookResult = ReturnType<
  typeof useGetNullDistanceBusinessTravelDataQuery
>;
export type GetNullDistanceBusinessTravelDataLazyQueryHookResult = ReturnType<
  typeof useGetNullDistanceBusinessTravelDataLazyQuery
>;
export type GetNullDistanceBusinessTravelDataSuspenseQueryHookResult =
  ReturnType<typeof useGetNullDistanceBusinessTravelDataSuspenseQuery>;
export type GetNullDistanceBusinessTravelDataQueryResult = Apollo.QueryResult<
  GetNullDistanceBusinessTravelDataQuery,
  GetNullDistanceBusinessTravelDataQueryVariables
>;
