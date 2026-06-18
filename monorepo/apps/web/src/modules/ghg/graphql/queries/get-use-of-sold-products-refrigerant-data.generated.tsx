import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUseOfSoldProductsRefrigerantDataQueryVariables = Types.Exact<{
  task_request_id?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetUseOfSoldProductsRefrigerantDataQuery = {
  __typename?: "query_root";
  GHGUseOfSoldProducts_Refrigerant: Array<{
    __typename?: "GHGUseOfSoldProducts_Refrigerant";
    id: any;
    task_request_id?: any | null;
    Date?: any | null;
    Product_Code: string;
    Lifetime_of_Product?: string | null;
    Rationale?: string | null;
    Refrigerant_type_used_in_sold_product: string;
    Quantity_of_Refrigerant_consumed?: any | null;
    UoM_of_Refrigerant_consumed?: string | null;
    Additional_comments?: string | null;
    Remarks?: string | null;
    metadata?: any | null;
  }>;
};

export const GetUseOfSoldProductsRefrigerantDataDocument = gql`
  query getUseOfSoldProductsRefrigerantData($task_request_id: [uuid!]) {
    GHGUseOfSoldProducts_Refrigerant(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      task_request_id
      Date
      Product_Code
      Lifetime_of_Product
      Rationale
      Refrigerant_type_used_in_sold_product
      Quantity_of_Refrigerant_consumed
      UoM_of_Refrigerant_consumed
      Additional_comments
      Remarks
      metadata
    }
  }
`;

/**
 * __useGetUseOfSoldProductsRefrigerantDataQuery__
 *
 * To run a query within a React component, call `useGetUseOfSoldProductsRefrigerantDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUseOfSoldProductsRefrigerantDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUseOfSoldProductsRefrigerantDataQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetUseOfSoldProductsRefrigerantDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUseOfSoldProductsRefrigerantDataQuery,
    GetUseOfSoldProductsRefrigerantDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUseOfSoldProductsRefrigerantDataQuery,
    GetUseOfSoldProductsRefrigerantDataQueryVariables
  >(GetUseOfSoldProductsRefrigerantDataDocument, options);
}
export function useGetUseOfSoldProductsRefrigerantDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUseOfSoldProductsRefrigerantDataQuery,
    GetUseOfSoldProductsRefrigerantDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUseOfSoldProductsRefrigerantDataQuery,
    GetUseOfSoldProductsRefrigerantDataQueryVariables
  >(GetUseOfSoldProductsRefrigerantDataDocument, options);
}
// @ts-ignore
export function useGetUseOfSoldProductsRefrigerantDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUseOfSoldProductsRefrigerantDataQuery,
    GetUseOfSoldProductsRefrigerantDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsRefrigerantDataQuery,
  GetUseOfSoldProductsRefrigerantDataQueryVariables
>;
export function useGetUseOfSoldProductsRefrigerantDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsRefrigerantDataQuery,
        GetUseOfSoldProductsRefrigerantDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsRefrigerantDataQuery | undefined,
  GetUseOfSoldProductsRefrigerantDataQueryVariables
>;
export function useGetUseOfSoldProductsRefrigerantDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsRefrigerantDataQuery,
        GetUseOfSoldProductsRefrigerantDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUseOfSoldProductsRefrigerantDataQuery,
    GetUseOfSoldProductsRefrigerantDataQueryVariables
  >(GetUseOfSoldProductsRefrigerantDataDocument, options);
}
export type GetUseOfSoldProductsRefrigerantDataQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsRefrigerantDataQuery
>;
export type GetUseOfSoldProductsRefrigerantDataLazyQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsRefrigerantDataLazyQuery
>;
export type GetUseOfSoldProductsRefrigerantDataSuspenseQueryHookResult =
  ReturnType<typeof useGetUseOfSoldProductsRefrigerantDataSuspenseQuery>;
export type GetUseOfSoldProductsRefrigerantDataQueryResult = Apollo.QueryResult<
  GetUseOfSoldProductsRefrigerantDataQuery,
  GetUseOfSoldProductsRefrigerantDataQueryVariables
>;
