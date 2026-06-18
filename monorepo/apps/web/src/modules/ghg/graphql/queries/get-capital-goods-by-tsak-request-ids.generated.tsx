import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCapitalGoodsByTaskRequestIdsQueryVariables = Types.Exact<{
  where: Types.GhgCapital_Goods_Bool_Exp;
}>;

export type GetCapitalGoodsByTaskRequestIdsQuery = {
  __typename?: "query_root";
  GHGCapital_Goods: Array<{
    __typename?: "GHGCapital_Goods";
    id: any;
    organization_address_id: any;
    task_request_id: any;
    activity_task_request_id: any;
    Supplier_Code?: string | null;
    Material_Code?: string | null;
    Quantity_Procured?: any | null;
    Quantity_Procured_uom?: string | null;
    kpi_material_weight_kg?: any | null;
    supporting_docs?: any | null;
    meta_data?: any | null;
    created_at: any;
    updated_at: any;
    created_by?: any | null;
    updated_by?: any | null;
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: { __typename?: "Addresses"; country_id?: any | null };
    };
    TaskRequest: {
      __typename?: "TaskRequest";
      month: string;
      year?: number | null;
    };
  }>;
};

export const GetCapitalGoodsByTaskRequestIdsDocument = gql`
  query getCapitalGoodsByTaskRequestIds($where: GHGCapital_Goods_bool_exp!) {
    GHGCapital_Goods(where: $where) {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Supplier_Code
      Material_Code
      Quantity_Procured
      Quantity_Procured_uom
      kpi_material_weight_kg
      supporting_docs
      meta_data
      created_at
      updated_at
      created_by
      updated_by
      OrganizationAddress {
        Address {
          country_id
        }
      }
      TaskRequest {
        month
        year
      }
    }
  }
`;

/**
 * __useGetCapitalGoodsByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetCapitalGoodsByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCapitalGoodsByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCapitalGoodsByTaskRequestIdsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCapitalGoodsByTaskRequestIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCapitalGoodsByTaskRequestIdsQuery,
    GetCapitalGoodsByTaskRequestIdsQueryVariables
  > &
    (
      | {
          variables: GetCapitalGoodsByTaskRequestIdsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCapitalGoodsByTaskRequestIdsQuery,
    GetCapitalGoodsByTaskRequestIdsQueryVariables
  >(GetCapitalGoodsByTaskRequestIdsDocument, options);
}
export function useGetCapitalGoodsByTaskRequestIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCapitalGoodsByTaskRequestIdsQuery,
    GetCapitalGoodsByTaskRequestIdsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCapitalGoodsByTaskRequestIdsQuery,
    GetCapitalGoodsByTaskRequestIdsQueryVariables
  >(GetCapitalGoodsByTaskRequestIdsDocument, options);
}
// @ts-ignore
export function useGetCapitalGoodsByTaskRequestIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCapitalGoodsByTaskRequestIdsQuery,
    GetCapitalGoodsByTaskRequestIdsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCapitalGoodsByTaskRequestIdsQuery,
  GetCapitalGoodsByTaskRequestIdsQueryVariables
>;
export function useGetCapitalGoodsByTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCapitalGoodsByTaskRequestIdsQuery,
        GetCapitalGoodsByTaskRequestIdsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCapitalGoodsByTaskRequestIdsQuery | undefined,
  GetCapitalGoodsByTaskRequestIdsQueryVariables
>;
export function useGetCapitalGoodsByTaskRequestIdsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCapitalGoodsByTaskRequestIdsQuery,
        GetCapitalGoodsByTaskRequestIdsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCapitalGoodsByTaskRequestIdsQuery,
    GetCapitalGoodsByTaskRequestIdsQueryVariables
  >(GetCapitalGoodsByTaskRequestIdsDocument, options);
}
export type GetCapitalGoodsByTaskRequestIdsQueryHookResult = ReturnType<
  typeof useGetCapitalGoodsByTaskRequestIdsQuery
>;
export type GetCapitalGoodsByTaskRequestIdsLazyQueryHookResult = ReturnType<
  typeof useGetCapitalGoodsByTaskRequestIdsLazyQuery
>;
export type GetCapitalGoodsByTaskRequestIdsSuspenseQueryHookResult = ReturnType<
  typeof useGetCapitalGoodsByTaskRequestIdsSuspenseQuery
>;
export type GetCapitalGoodsByTaskRequestIdsQueryResult = Apollo.QueryResult<
  GetCapitalGoodsByTaskRequestIdsQuery,
  GetCapitalGoodsByTaskRequestIdsQueryVariables
>;
