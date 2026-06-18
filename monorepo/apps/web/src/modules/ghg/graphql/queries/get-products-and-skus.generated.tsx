import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetProductAndSkusQueryVariables = Types.Exact<{
  productMasterIdList:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  skuMasterIdList:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetProductAndSkusQuery = {
  __typename?: "query_root";
  OrgProductMaster: Array<{
    __typename?: "OrgProductMaster";
    id: any;
    name: string;
    code?: string | null;
    organization_address_id?: any | null;
    client_master_id?: string | null;
    OrgSKUMasters: Array<{
      __typename?: "OrgSKUMaster";
      id: any;
      name: string;
      code?: string | null;
      weight: any;
      weight_uom?: string | null;
      client_master_id?: string | null;
      org_product_master_id: any;
      organization_id: any;
    }>;
  }>;
};

export const GetProductAndSkusDocument = gql`
  query getProductAndSkus(
    $productMasterIdList: [String!]!
    $skuMasterIdList: [String!]!
  ) {
    OrgProductMaster(
      where: {
        _and: {
          client_master_id: { _in: $productMasterIdList }
          is_deleted: { _eq: false }
        }
      }
    ) {
      id
      name
      code
      organization_address_id
      client_master_id
      OrgSKUMasters(
        where: {
          _and: {
            client_master_id: { _in: $skuMasterIdList }
            is_deleted: { _eq: false }
          }
        }
      ) {
        id
        name
        code
        weight
        weight_uom
        client_master_id
        org_product_master_id
        organization_id
      }
    }
  }
`;

/**
 * __useGetProductAndSkusQuery__
 *
 * To run a query within a React component, call `useGetProductAndSkusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductAndSkusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductAndSkusQuery({
 *   variables: {
 *      productMasterIdList: // value for 'productMasterIdList'
 *      skuMasterIdList: // value for 'skuMasterIdList'
 *   },
 * });
 */
export function useGetProductAndSkusQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetProductAndSkusQuery,
    GetProductAndSkusQueryVariables
  > &
    (
      | { variables: GetProductAndSkusQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetProductAndSkusQuery,
    GetProductAndSkusQueryVariables
  >(GetProductAndSkusDocument, options);
}
export function useGetProductAndSkusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductAndSkusQuery,
    GetProductAndSkusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetProductAndSkusQuery,
    GetProductAndSkusQueryVariables
  >(GetProductAndSkusDocument, options);
}
// @ts-ignore
export function useGetProductAndSkusSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProductAndSkusQuery,
    GetProductAndSkusQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetProductAndSkusQuery,
  GetProductAndSkusQueryVariables
>;
export function useGetProductAndSkusSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductAndSkusQuery,
        GetProductAndSkusQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetProductAndSkusQuery | undefined,
  GetProductAndSkusQueryVariables
>;
export function useGetProductAndSkusSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductAndSkusQuery,
        GetProductAndSkusQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetProductAndSkusQuery,
    GetProductAndSkusQueryVariables
  >(GetProductAndSkusDocument, options);
}
export type GetProductAndSkusQueryHookResult = ReturnType<
  typeof useGetProductAndSkusQuery
>;
export type GetProductAndSkusLazyQueryHookResult = ReturnType<
  typeof useGetProductAndSkusLazyQuery
>;
export type GetProductAndSkusSuspenseQueryHookResult = ReturnType<
  typeof useGetProductAndSkusSuspenseQuery
>;
export type GetProductAndSkusQueryResult = Apollo.QueryResult<
  GetProductAndSkusQuery,
  GetProductAndSkusQueryVariables
>;
