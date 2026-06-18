import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialMasterWithPaginationQueryVariables = Types.Exact<{
  where: Types.OrgMaterialMaster_Bool_Exp;
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  order_by?: Types.InputMaybe<
    Array<Types.OrgMaterialMaster_Order_By> | Types.OrgMaterialMaster_Order_By
  >;
}>;

export type GetMaterialMasterWithPaginationQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    client_master_id?: string | null;
    name: string;
    code?: string | null;
    type: string;
    organization_id: any;
    Material_Weight_Per_Unit?: any | null;
    UoM_Material_Weight?: string | null;
    Material_Description?: string | null;
    Material_Classification?: string | null;
    Additional_Information?: string | null;
    created_at: any;
    updated_at: any;
    is_deleted: boolean;
  }>;
  totalMaterialsCount: {
    __typename?: "OrgMaterialMaster_aggregate";
    aggregate?: {
      __typename?: "OrgMaterialMaster_aggregate_fields";
      totalRows: number;
    } | null;
  };
};

export const GetMaterialMasterWithPaginationDocument = gql`
  query getMaterialMasterWithPagination(
    $where: OrgMaterialMaster_bool_exp!
    $limit: Int
    $offset: Int
    $order_by: [OrgMaterialMaster_order_by!]
  ) {
    OrgMaterialMaster(
      where: $where
      order_by: $order_by
      limit: $limit
      offset: $offset
    ) {
      id
      client_master_id
      name
      code
      type
      organization_id
      Material_Weight_Per_Unit
      UoM_Material_Weight
      Material_Description
      Material_Classification
      Additional_Information
      created_at
      updated_at
      is_deleted
    }
    totalMaterialsCount: OrgMaterialMaster_aggregate(where: $where) {
      aggregate {
        totalRows: count
      }
    }
  }
`;

/**
 * __useGetMaterialMasterWithPaginationQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterWithPaginationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterWithPaginationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterWithPaginationQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetMaterialMasterWithPaginationQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialMasterWithPaginationQuery,
    GetMaterialMasterWithPaginationQueryVariables
  > &
    (
      | {
          variables: GetMaterialMasterWithPaginationQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMaterialMasterWithPaginationQuery,
    GetMaterialMasterWithPaginationQueryVariables
  >(GetMaterialMasterWithPaginationDocument, options);
}
export function useGetMaterialMasterWithPaginationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialMasterWithPaginationQuery,
    GetMaterialMasterWithPaginationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialMasterWithPaginationQuery,
    GetMaterialMasterWithPaginationQueryVariables
  >(GetMaterialMasterWithPaginationDocument, options);
}
// @ts-ignore
export function useGetMaterialMasterWithPaginationSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialMasterWithPaginationQuery,
    GetMaterialMasterWithPaginationQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialMasterWithPaginationQuery,
  GetMaterialMasterWithPaginationQueryVariables
>;
export function useGetMaterialMasterWithPaginationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialMasterWithPaginationQuery,
        GetMaterialMasterWithPaginationQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialMasterWithPaginationQuery | undefined,
  GetMaterialMasterWithPaginationQueryVariables
>;
export function useGetMaterialMasterWithPaginationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialMasterWithPaginationQuery,
        GetMaterialMasterWithPaginationQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialMasterWithPaginationQuery,
    GetMaterialMasterWithPaginationQueryVariables
  >(GetMaterialMasterWithPaginationDocument, options);
}
export type GetMaterialMasterWithPaginationQueryHookResult = ReturnType<
  typeof useGetMaterialMasterWithPaginationQuery
>;
export type GetMaterialMasterWithPaginationLazyQueryHookResult = ReturnType<
  typeof useGetMaterialMasterWithPaginationLazyQuery
>;
export type GetMaterialMasterWithPaginationSuspenseQueryHookResult = ReturnType<
  typeof useGetMaterialMasterWithPaginationSuspenseQuery
>;
export type GetMaterialMasterWithPaginationQueryResult = Apollo.QueryResult<
  GetMaterialMasterWithPaginationQuery,
  GetMaterialMasterWithPaginationQueryVariables
>;
