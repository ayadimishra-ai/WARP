import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialWithActivityUsageQueryVariables = Types.Exact<{
  where: Types.OrgMaterialMaster_Bool_Exp;
  materialCodes:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  orgAddressIds:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
}>;

export type GetMaterialWithActivityUsageQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    name: string;
    code?: string | null;
    type: string;
    Material_Weight_Per_Unit?: any | null;
    UoM_Material_Weight?: string | null;
    Material_Classification?: string | null;
    Material_Description?: string | null;
    Additional_Information?: string | null;
    organization_id: any;
  }>;
  MaterialProcurement: Array<{
    __typename?: "GHGMaterialProcurement";
    Material_Code?: string | null;
    Material_Quantity_Procured_uom?: string | null;
    organization_address_id: any;
  }>;
  CapitalGoods: Array<{
    __typename?: "GHGCapital_Goods";
    Material_Code?: string | null;
    Quantity_Procured_uom?: string | null;
    organization_address_id: any;
  }>;
  UpstreamTransport: Array<{
    __typename?: "GHGTransport_Upstream";
    Material_ID?: string | null;
    Material_Quantity_Procured_uom?: string | null;
    organization_address_id: any;
  }>;
};

export const GetMaterialWithActivityUsageDocument = gql`
  query getMaterialWithActivityUsage(
    $where: OrgMaterialMaster_bool_exp!
    $materialCodes: [String!]!
    $orgAddressIds: [uuid!]!
  ) {
    OrgMaterialMaster(where: $where) {
      id
      name
      code
      type
      Material_Weight_Per_Unit
      UoM_Material_Weight
      Material_Classification
      Material_Description
      Additional_Information
      organization_id
    }
    MaterialProcurement: GHGMaterialProcurement(
      where: {
        Material_Code: { _in: $materialCodes }
        organization_address_id: { _in: $orgAddressIds }
      }
    ) {
      Material_Code
      Material_Quantity_Procured_uom
      organization_address_id
    }
    CapitalGoods: GHGCapital_Goods(
      where: {
        Material_Code: { _in: $materialCodes }
        organization_address_id: { _in: $orgAddressIds }
      }
    ) {
      Material_Code
      Quantity_Procured_uom
      organization_address_id
    }
    UpstreamTransport: GHGTransport_Upstream(
      where: {
        Material_ID: { _in: $materialCodes }
        organization_address_id: { _in: $orgAddressIds }
      }
    ) {
      Material_ID
      Material_Quantity_Procured_uom
      organization_address_id
    }
  }
`;

/**
 * __useGetMaterialWithActivityUsageQuery__
 *
 * To run a query within a React component, call `useGetMaterialWithActivityUsageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialWithActivityUsageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialWithActivityUsageQuery({
 *   variables: {
 *      where: // value for 'where'
 *      materialCodes: // value for 'materialCodes'
 *      orgAddressIds: // value for 'orgAddressIds'
 *   },
 * });
 */
export function useGetMaterialWithActivityUsageQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialWithActivityUsageQuery,
    GetMaterialWithActivityUsageQueryVariables
  > &
    (
      | {
          variables: GetMaterialWithActivityUsageQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMaterialWithActivityUsageQuery,
    GetMaterialWithActivityUsageQueryVariables
  >(GetMaterialWithActivityUsageDocument, options);
}
export function useGetMaterialWithActivityUsageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialWithActivityUsageQuery,
    GetMaterialWithActivityUsageQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialWithActivityUsageQuery,
    GetMaterialWithActivityUsageQueryVariables
  >(GetMaterialWithActivityUsageDocument, options);
}
// @ts-ignore
export function useGetMaterialWithActivityUsageSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialWithActivityUsageQuery,
    GetMaterialWithActivityUsageQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialWithActivityUsageQuery,
  GetMaterialWithActivityUsageQueryVariables
>;
export function useGetMaterialWithActivityUsageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialWithActivityUsageQuery,
        GetMaterialWithActivityUsageQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialWithActivityUsageQuery | undefined,
  GetMaterialWithActivityUsageQueryVariables
>;
export function useGetMaterialWithActivityUsageSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialWithActivityUsageQuery,
        GetMaterialWithActivityUsageQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialWithActivityUsageQuery,
    GetMaterialWithActivityUsageQueryVariables
  >(GetMaterialWithActivityUsageDocument, options);
}
export type GetMaterialWithActivityUsageQueryHookResult = ReturnType<
  typeof useGetMaterialWithActivityUsageQuery
>;
export type GetMaterialWithActivityUsageLazyQueryHookResult = ReturnType<
  typeof useGetMaterialWithActivityUsageLazyQuery
>;
export type GetMaterialWithActivityUsageSuspenseQueryHookResult = ReturnType<
  typeof useGetMaterialWithActivityUsageSuspenseQuery
>;
export type GetMaterialWithActivityUsageQueryResult = Apollo.QueryResult<
  GetMaterialWithActivityUsageQuery,
  GetMaterialWithActivityUsageQueryVariables
>;
