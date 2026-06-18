import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierMaterialMappingListQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.SupplierMaterialMapping_Bool_Exp>;
  order_by?: Types.InputMaybe<
    | Array<Types.SupplierMaterialMapping_Order_By>
    | Types.SupplierMaterialMapping_Order_By
  >;
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
}>;

export type GetSupplierMaterialMappingListQuery = {
  __typename?: "query_root";
  SupplierMaterialMapping: Array<{
    __typename?: "SupplierMaterialMapping";
    id: any;
    organization_id: any;
    supplier_address_mapping_id: any;
    org_material_master_id: any;
    From_Year: any;
    From_Month?: string | null;
    To_Year: any;
    To_Month?: string | null;
    meta_data?: any | null;
    created_at: any;
    updated_at: any;
    SupplierAddressMapping?: {
      __typename?: "SupplierAddressMapping";
      id: any;
      OrgSupplierMaster: {
        __typename?: "OrgSupplierMaster";
        id: any;
        name: string;
        code?: string | null;
      };
    } | null;
    OrgMaterialMaster?: {
      __typename?: "OrgMaterialMaster";
      id: any;
      name: string;
      code?: string | null;
      type: string;
    } | null;
  }>;
  SupplierMaterialMapping_aggregate: {
    __typename?: "SupplierMaterialMapping_aggregate";
    aggregate?: {
      __typename?: "SupplierMaterialMapping_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetSupplierMaterialMappingListDocument = gql`
  query getSupplierMaterialMappingList(
    $where: SupplierMaterialMapping_bool_exp
    $order_by: [SupplierMaterialMapping_order_by!]
    $limit: Int
    $offset: Int
  ) {
    SupplierMaterialMapping(
      where: $where
      order_by: $order_by
      limit: $limit
      offset: $offset
    ) {
      id
      organization_id
      supplier_address_mapping_id
      org_material_master_id
      From_Year
      From_Month
      To_Year
      To_Month
      meta_data
      created_at
      updated_at
      SupplierAddressMapping {
        id
        OrgSupplierMaster {
          id
          name
          code
        }
      }
      OrgMaterialMaster {
        id
        name
        code
        type
      }
    }
    SupplierMaterialMapping_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetSupplierMaterialMappingListQuery__
 *
 * To run a query within a React component, call `useGetSupplierMaterialMappingListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierMaterialMappingListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierMaterialMappingListQuery({
 *   variables: {
 *      where: // value for 'where'
 *      order_by: // value for 'order_by'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetSupplierMaterialMappingListQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSupplierMaterialMappingListQuery,
    GetSupplierMaterialMappingListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierMaterialMappingListQuery,
    GetSupplierMaterialMappingListQueryVariables
  >(GetSupplierMaterialMappingListDocument, options);
}
export function useGetSupplierMaterialMappingListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierMaterialMappingListQuery,
    GetSupplierMaterialMappingListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierMaterialMappingListQuery,
    GetSupplierMaterialMappingListQueryVariables
  >(GetSupplierMaterialMappingListDocument, options);
}
// @ts-ignore
export function useGetSupplierMaterialMappingListSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierMaterialMappingListQuery,
    GetSupplierMaterialMappingListQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierMaterialMappingListQuery,
  GetSupplierMaterialMappingListQueryVariables
>;
export function useGetSupplierMaterialMappingListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierMaterialMappingListQuery,
        GetSupplierMaterialMappingListQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierMaterialMappingListQuery | undefined,
  GetSupplierMaterialMappingListQueryVariables
>;
export function useGetSupplierMaterialMappingListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierMaterialMappingListQuery,
        GetSupplierMaterialMappingListQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierMaterialMappingListQuery,
    GetSupplierMaterialMappingListQueryVariables
  >(GetSupplierMaterialMappingListDocument, options);
}
export type GetSupplierMaterialMappingListQueryHookResult = ReturnType<
  typeof useGetSupplierMaterialMappingListQuery
>;
export type GetSupplierMaterialMappingListLazyQueryHookResult = ReturnType<
  typeof useGetSupplierMaterialMappingListLazyQuery
>;
export type GetSupplierMaterialMappingListSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierMaterialMappingListSuspenseQuery
>;
export type GetSupplierMaterialMappingListQueryResult = Apollo.QueryResult<
  GetSupplierMaterialMappingListQuery,
  GetSupplierMaterialMappingListQueryVariables
>;
