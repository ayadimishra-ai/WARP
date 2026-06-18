import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables =
  Types.Exact<{
    organizationId: Types.Scalars["uuid"]["input"];
    mpOr?: Types.InputMaybe<
      | Array<Types.GhgMaterialProcurement_Bool_Exp>
      | Types.GhgMaterialProcurement_Bool_Exp
    >;
    tuOr?: Types.InputMaybe<
      | Array<Types.GhgTransport_Upstream_Bool_Exp>
      | Types.GhgTransport_Upstream_Bool_Exp
    >;
    cgOr?: Types.InputMaybe<
      Array<Types.GhgCapital_Goods_Bool_Exp> | Types.GhgCapital_Goods_Bool_Exp
    >;
    mmOr?: Types.InputMaybe<
      Array<Types.OrgMaterialMaster_Bool_Exp> | Types.OrgMaterialMaster_Bool_Exp
    >;
  }>;

export type GetDistinctUoMsMaterialProcurementByMaterialCodesQuery = {
  __typename?: "query_root";
  GHGMaterialProcurement: Array<{
    __typename?: "GHGMaterialProcurement";
    organization_address_id: any;
    Material_Code?: string | null;
    Material_Quantity_Procured_uom?: string | null;
  }>;
  GHGTransport_Upstream: Array<{
    __typename?: "GHGTransport_Upstream";
    organization_address_id: any;
    Material_Quantity_Procured_uom?: string | null;
    Material_Code?: string | null;
  }>;
  GHGCapital_Goods: Array<{
    __typename?: "GHGCapital_Goods";
    organization_address_id: any;
    Material_Code?: string | null;
    Material_Quantity_Procured_uom?: string | null;
  }>;
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    Material_Weight_Per_Unit?: any | null;
    Material_Code?: string | null;
    Material_Quantity_Procured_uom?: string | null;
  }>;
};

export const GetDistinctUoMsMaterialProcurementByMaterialCodesDocument = gql`
  query getDistinctUOMsMaterialProcurementByMaterialCodes(
    $organizationId: uuid!
    $mpOr: [GHGMaterialProcurement_bool_exp!]
    $tuOr: [GHGTransport_Upstream_bool_exp!]
    $cgOr: [GHGCapital_Goods_bool_exp!]
    $mmOr: [OrgMaterialMaster_bool_exp!]
  ) {
    GHGMaterialProcurement(
      where: {
        OrganizationAddress: { organization_id: { _eq: $organizationId } }
        _and: [
          { Material_Quantity_Procured_uom: { _is_null: false } }
          { _or: $mpOr }
        ]
      }
      distinct_on: [Material_Quantity_Procured_uom]
      order_by: { Material_Quantity_Procured_uom: asc }
    ) {
      organization_address_id
      Material_Code
      Material_Quantity_Procured_uom
    }
    GHGTransport_Upstream(
      where: {
        OrganizationAddress: { organization_id: { _eq: $organizationId } }
        _and: [
          { Material_Quantity_Procured_uom: { _is_null: false } }
          { _or: $tuOr }
        ]
      }
      distinct_on: [Material_Quantity_Procured_uom]
      order_by: { Material_Quantity_Procured_uom: asc }
    ) {
      organization_address_id
      Material_Code: Material_ID
      Material_Quantity_Procured_uom
    }
    GHGCapital_Goods(
      where: {
        OrganizationAddress: { organization_id: { _eq: $organizationId } }
        _and: [{ Quantity_Procured_uom: { _is_null: false } }, { _or: $cgOr }]
      }
      distinct_on: [Quantity_Procured_uom]
      order_by: { Quantity_Procured_uom: asc }
    ) {
      organization_address_id
      Material_Code
      Material_Quantity_Procured_uom: Quantity_Procured_uom
    }
    OrgMaterialMaster(
      where: {
        organization_id: { _eq: $organizationId }
        _and: [{ _or: $mmOr }]
      }
    ) {
      Material_Code: code
      Material_Weight_Per_Unit
      Material_Quantity_Procured_uom: UoM_Material_Weight
      Material_Weight_Per_Unit
    }
  }
`;

/**
 * __useGetDistinctUoMsMaterialProcurementByMaterialCodesQuery__
 *
 * To run a query within a React component, call `useGetDistinctUoMsMaterialProcurementByMaterialCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDistinctUoMsMaterialProcurementByMaterialCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDistinctUoMsMaterialProcurementByMaterialCodesQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      mpOr: // value for 'mpOr'
 *      tuOr: // value for 'tuOr'
 *      cgOr: // value for 'cgOr'
 *      mmOr: // value for 'mmOr'
 *   },
 * });
 */
export function useGetDistinctUoMsMaterialProcurementByMaterialCodesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  > &
    (
      | {
          variables: GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  >(GetDistinctUoMsMaterialProcurementByMaterialCodesDocument, options);
}
export function useGetDistinctUoMsMaterialProcurementByMaterialCodesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  >(GetDistinctUoMsMaterialProcurementByMaterialCodesDocument, options);
}
// @ts-ignore
export function useGetDistinctUoMsMaterialProcurementByMaterialCodesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
  GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
>;
export function useGetDistinctUoMsMaterialProcurementByMaterialCodesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
        GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetDistinctUoMsMaterialProcurementByMaterialCodesQuery | undefined,
  GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
>;
export function useGetDistinctUoMsMaterialProcurementByMaterialCodesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
        GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  >(GetDistinctUoMsMaterialProcurementByMaterialCodesDocument, options);
}
export type GetDistinctUoMsMaterialProcurementByMaterialCodesQueryHookResult =
  ReturnType<typeof useGetDistinctUoMsMaterialProcurementByMaterialCodesQuery>;
export type GetDistinctUoMsMaterialProcurementByMaterialCodesLazyQueryHookResult =
  ReturnType<
    typeof useGetDistinctUoMsMaterialProcurementByMaterialCodesLazyQuery
  >;
export type GetDistinctUoMsMaterialProcurementByMaterialCodesSuspenseQueryHookResult =
  ReturnType<
    typeof useGetDistinctUoMsMaterialProcurementByMaterialCodesSuspenseQuery
  >;
export type GetDistinctUoMsMaterialProcurementByMaterialCodesQueryResult =
  Apollo.QueryResult<
    GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
    GetDistinctUoMsMaterialProcurementByMaterialCodesQueryVariables
  >;
