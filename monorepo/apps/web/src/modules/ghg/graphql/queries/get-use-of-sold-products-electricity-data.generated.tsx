import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUseOfSoldProductsElectricityDataQueryVariables = Types.Exact<{
  task_request_id?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetUseOfSoldProductsElectricityDataQuery = {
  __typename?: "query_root";
  GHGUseOfSoldProducts_Electricity: Array<{
    __typename?: "GHGUseOfSoldProducts_Electricity";
    id: any;
    task_request_id?: any | null;
    Date?: any | null;
    Product_Code: string;
    Lifetime_of_Product?: string | null;
    Rationale?: string | null;
    Region: string;
    Units_of_Electricity_consumed_in_kWh?: any | null;
    Additional_comments?: string | null;
    Remarks?: string | null;
    metadata?: any | null;
  }>;
};

export const GetUseOfSoldProductsElectricityDataDocument = gql`
  query getUseOfSoldProductsElectricityData($task_request_id: [uuid!]) {
    GHGUseOfSoldProducts_Electricity(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      task_request_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Region
      Units_of_Electricity_consumed_in_kWh
      Additional_comments
      Remarks
      metadata
    }
  }
`;

/**
 * __useGetUseOfSoldProductsElectricityDataQuery__
 *
 * To run a query within a React component, call `useGetUseOfSoldProductsElectricityDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUseOfSoldProductsElectricityDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUseOfSoldProductsElectricityDataQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetUseOfSoldProductsElectricityDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUseOfSoldProductsElectricityDataQuery,
    GetUseOfSoldProductsElectricityDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUseOfSoldProductsElectricityDataQuery,
    GetUseOfSoldProductsElectricityDataQueryVariables
  >(GetUseOfSoldProductsElectricityDataDocument, options);
}
export function useGetUseOfSoldProductsElectricityDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUseOfSoldProductsElectricityDataQuery,
    GetUseOfSoldProductsElectricityDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUseOfSoldProductsElectricityDataQuery,
    GetUseOfSoldProductsElectricityDataQueryVariables
  >(GetUseOfSoldProductsElectricityDataDocument, options);
}
// @ts-ignore
export function useGetUseOfSoldProductsElectricityDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUseOfSoldProductsElectricityDataQuery,
    GetUseOfSoldProductsElectricityDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsElectricityDataQuery,
  GetUseOfSoldProductsElectricityDataQueryVariables
>;
export function useGetUseOfSoldProductsElectricityDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsElectricityDataQuery,
        GetUseOfSoldProductsElectricityDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsElectricityDataQuery | undefined,
  GetUseOfSoldProductsElectricityDataQueryVariables
>;
export function useGetUseOfSoldProductsElectricityDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsElectricityDataQuery,
        GetUseOfSoldProductsElectricityDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUseOfSoldProductsElectricityDataQuery,
    GetUseOfSoldProductsElectricityDataQueryVariables
  >(GetUseOfSoldProductsElectricityDataDocument, options);
}
export type GetUseOfSoldProductsElectricityDataQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsElectricityDataQuery
>;
export type GetUseOfSoldProductsElectricityDataLazyQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsElectricityDataLazyQuery
>;
export type GetUseOfSoldProductsElectricityDataSuspenseQueryHookResult =
  ReturnType<typeof useGetUseOfSoldProductsElectricityDataSuspenseQuery>;
export type GetUseOfSoldProductsElectricityDataQueryResult = Apollo.QueryResult<
  GetUseOfSoldProductsElectricityDataQuery,
  GetUseOfSoldProductsElectricityDataQueryVariables
>;
