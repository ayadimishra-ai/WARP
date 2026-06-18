import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUseOfSoldProductsDataQueryVariables = Types.Exact<{
  task_request_id?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetUseOfSoldProductsDataQuery = {
  __typename?: "query_root";
  GHGUseOfSoldProducts_Fuel: Array<{
    __typename?: "GHGUseOfSoldProducts_Fuel";
    id: any;
    task_request_id?: any | null;
    activity_task_request_id?: any | null;
    organization_address_id?: any | null;
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
  GHGUseOfSoldProducts_Electricity: Array<{
    __typename?: "GHGUseOfSoldProducts_Electricity";
    id: any;
    task_request_id?: any | null;
    activity_task_request_id?: any | null;
    organization_address_id?: any | null;
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
  GHGUseOfSoldProducts_Refrigerant: Array<{
    __typename?: "GHGUseOfSoldProducts_Refrigerant";
    id: any;
    task_request_id?: any | null;
    activity_task_request_id?: any | null;
    organization_address_id?: any | null;
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

export const GetUseOfSoldProductsDataDocument = gql`
  query getUseOfSoldProductsData($task_request_id: [uuid!]) {
    GHGUseOfSoldProducts_Fuel(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
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
    GHGUseOfSoldProducts_Electricity(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
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
    GHGUseOfSoldProducts_Refrigerant(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      id
      task_request_id
      activity_task_request_id
      organization_address_id
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
 * __useGetUseOfSoldProductsDataQuery__
 *
 * To run a query within a React component, call `useGetUseOfSoldProductsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUseOfSoldProductsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUseOfSoldProductsDataQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetUseOfSoldProductsDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUseOfSoldProductsDataQuery,
    GetUseOfSoldProductsDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUseOfSoldProductsDataQuery,
    GetUseOfSoldProductsDataQueryVariables
  >(GetUseOfSoldProductsDataDocument, options);
}
export function useGetUseOfSoldProductsDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUseOfSoldProductsDataQuery,
    GetUseOfSoldProductsDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUseOfSoldProductsDataQuery,
    GetUseOfSoldProductsDataQueryVariables
  >(GetUseOfSoldProductsDataDocument, options);
}
// @ts-ignore
export function useGetUseOfSoldProductsDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUseOfSoldProductsDataQuery,
    GetUseOfSoldProductsDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsDataQuery,
  GetUseOfSoldProductsDataQueryVariables
>;
export function useGetUseOfSoldProductsDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsDataQuery,
        GetUseOfSoldProductsDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUseOfSoldProductsDataQuery | undefined,
  GetUseOfSoldProductsDataQueryVariables
>;
export function useGetUseOfSoldProductsDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUseOfSoldProductsDataQuery,
        GetUseOfSoldProductsDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUseOfSoldProductsDataQuery,
    GetUseOfSoldProductsDataQueryVariables
  >(GetUseOfSoldProductsDataDocument, options);
}
export type GetUseOfSoldProductsDataQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsDataQuery
>;
export type GetUseOfSoldProductsDataLazyQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsDataLazyQuery
>;
export type GetUseOfSoldProductsDataSuspenseQueryHookResult = ReturnType<
  typeof useGetUseOfSoldProductsDataSuspenseQuery
>;
export type GetUseOfSoldProductsDataQueryResult = Apollo.QueryResult<
  GetUseOfSoldProductsDataQuery,
  GetUseOfSoldProductsDataQueryVariables
>;
