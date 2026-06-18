import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetProductbyskucodeQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetProductbyskucodeQuery = {
  __typename?: "query_root";
  OrgSKUMaster: Array<{
    __typename?: "OrgSKUMaster";
    id: any;
    name: string;
    code?: string | null;
    weight: any;
    weight_uom?: string | null;
    client_master_id?: string | null;
    org_product_master_id: any;
    organization_id: any;
    created_at: any;
    OrgProductMaster: {
      __typename?: "OrgProductMaster";
      id: any;
      code?: string | null;
      name: string;
      client_master_id?: string | null;
    };
    OrgSkuBomMasters_aggregate: {
      __typename?: "OrgSkuBomMaster_aggregate";
      aggregate?: {
        __typename?: "OrgSkuBomMaster_aggregate_fields";
        count: number;
      } | null;
    };
  }>;
  OrgProductMaster: Array<{
    __typename?: "OrgProductMaster";
    id: any;
    code?: string | null;
    name: string;
    created_at: any;
    client_master_id?: string | null;
  }>;
};

export const GetProductbyskucodeDocument = gql`
  query getProductbyskucode($organizationId: uuid!) {
    OrgSKUMaster(where: { organization_id: { _eq: $organizationId } }) {
      id
      name
      code
      weight
      weight_uom
      client_master_id
      org_product_master_id
      organization_id
      created_at
      OrgProductMaster {
        id
        code
        name
        client_master_id
      }
      OrgSkuBomMasters_aggregate {
        aggregate {
          count
        }
      }
    }
    OrgProductMaster(where: { organization_id: { _eq: $organizationId } }) {
      id
      code
      name
      created_at
      client_master_id
    }
  }
`;

/**
 * __useGetProductbyskucodeQuery__
 *
 * To run a query within a React component, call `useGetProductbyskucodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductbyskucodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductbyskucodeQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetProductbyskucodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetProductbyskucodeQuery,
    GetProductbyskucodeQueryVariables
  > &
    (
      | { variables: GetProductbyskucodeQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetProductbyskucodeQuery,
    GetProductbyskucodeQueryVariables
  >(GetProductbyskucodeDocument, options);
}
export function useGetProductbyskucodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductbyskucodeQuery,
    GetProductbyskucodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetProductbyskucodeQuery,
    GetProductbyskucodeQueryVariables
  >(GetProductbyskucodeDocument, options);
}
// @ts-ignore
export function useGetProductbyskucodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProductbyskucodeQuery,
    GetProductbyskucodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetProductbyskucodeQuery,
  GetProductbyskucodeQueryVariables
>;
export function useGetProductbyskucodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductbyskucodeQuery,
        GetProductbyskucodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetProductbyskucodeQuery | undefined,
  GetProductbyskucodeQueryVariables
>;
export function useGetProductbyskucodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductbyskucodeQuery,
        GetProductbyskucodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetProductbyskucodeQuery,
    GetProductbyskucodeQueryVariables
  >(GetProductbyskucodeDocument, options);
}
export type GetProductbyskucodeQueryHookResult = ReturnType<
  typeof useGetProductbyskucodeQuery
>;
export type GetProductbyskucodeLazyQueryHookResult = ReturnType<
  typeof useGetProductbyskucodeLazyQuery
>;
export type GetProductbyskucodeSuspenseQueryHookResult = ReturnType<
  typeof useGetProductbyskucodeSuspenseQuery
>;
export type GetProductbyskucodeQueryResult = Apollo.QueryResult<
  GetProductbyskucodeQuery,
  GetProductbyskucodeQueryVariables
>;
