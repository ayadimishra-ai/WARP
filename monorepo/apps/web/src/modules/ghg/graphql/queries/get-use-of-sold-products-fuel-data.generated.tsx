import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUseOfSoldProductsFuelDataQueryVariables = Types.Exact<{
  task_request_id?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetUseOfSoldProductsFuelDataQuery = {
  __typename?: "query_root";
  GHGUseOfSoldProducts_Fuel: Array<{
    __typename?: "GHGUseOfSoldProducts_Fuel";
    id: any;
    task_request_id?: any | null;
    Date?: any | null;
    Type_of_Fuel_Consumed: string;
    Product_Code: string;
    Lifetime_of_Product?: string | null;
    Rationale?: string | null;
    Quantity_of_Fuel_Consumed?: any | null;
    UoM_of_Fuel_Consumed?: string | null;
    Additional_comments?: string | null;
    Remarks?: string | null;
    metadata?: any | null;
  }>;
};

export const GetUseOfSoldProductsFuelDataDocument = gql`
  query getUseOfSoldProductsFuelData($task_request_id: [uuid!]) {
    GHGUseOfSoldProducts_Fuel(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      task_request_id
      Date
      Type_of_Fuel_Consumed
      Product_Code
      Lifetime_of_Product
      Rationale
      Quantity_of_Fuel_Consumed
      UoM_of_Fuel_Consumed
      Additional_comments
      Remarks
      metadata
    }
  }
`;

/**
 * __useGetUseOfSoldProductsFuelDataQuery__
 *
 * To run a query within a React component, call `useGetUseOfSoldProductsFuelDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUseOfSoldProductsFuelDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUseOfSoldProductsFuelDataQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetUseOfSoldProductsFuelDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUseOfSoldProductsFuelDataQuery,
    GetUseOfSoldProductsFuelDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUseOfSoldProductsFuelDataQuery,
    GetUseOfSoldProductsFuelDataQueryVariables
  >(GetUseOfSoldProductsFuelDataDocument, options);
}
export function useGetUseOfSoldProductsFuelDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUseOfSoldProductsFuelDataQuery,
    GetUseOfSoldProductsFuelDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUseOfSoldProductsFuelDataQuery,
    GetUseOfSoldProductsFuelDataQueryVariables
  >(GetUseOfSoldProductsFuelDataDocument, options);
}
// @ts-ignore
export function useGetUseOfSoldProductsFuelDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUseOfSoldProductsFuelDataQuery,
    GetUseOfSoldProductsFuelDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsFuelDataQuery,
  GetUseOfSoldProductsFuelDataQueryVariables
>;
export function useGetUseOfSoldProductsFuelDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsFuelDataQuery,
        GetUseOfSoldProductsFuelDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsFuelDataQuery | undefined,
  GetUseOfSoldProductsFuelDataQueryVariables
>;
export function useGetUseOfSoldProductsFuelDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsFuelDataQuery,
        GetUseOfSoldProductsFuelDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUseOfSoldProductsFuelDataQuery,
    GetUseOfSoldProductsFuelDataQueryVariables
  >(GetUseOfSoldProductsFuelDataDocument, options);
}
export type GetUseOfSoldProductsFuelDataQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsFuelDataQuery
>;
export type GetUseOfSoldProductsFuelDataLazyQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsFuelDataLazyQuery
>;
export type GetUseOfSoldProductsFuelDataSuspenseQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsFuelDataSuspenseQuery
>;
export type GetUseOfSoldProductsFuelDataQueryResult = Apollo.QueryResult<
  GetUseOfSoldProductsFuelDataQuery,
  GetUseOfSoldProductsFuelDataQueryVariables
>;
