import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetExistingSupplierMaterialMappingsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetExistingSupplierMaterialMappingsQuery = {
  __typename?: "query_root";
  SupplierMaterialMapping: Array<{
    __typename?: "SupplierMaterialMapping";
    supplier_address_mapping_id: any;
    org_material_master_id: any;
    From_Year: any;
    From_Month?: string | null;
    To_Year: any;
    To_Month?: string | null;
  }>;
};

export const GetExistingSupplierMaterialMappingsDocument = gql`
  query getExistingSupplierMaterialMappings($organizationId: uuid!) {
    SupplierMaterialMapping(
      where: {
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
    ) {
      supplier_address_mapping_id
      org_material_master_id
      From_Year
      From_Month
      To_Year
      To_Month
    }
  }
`;

/**
 * __useGetExistingSupplierMaterialMappingsQuery__
 *
 * To run a query within a React component, call `useGetExistingSupplierMaterialMappingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingSupplierMaterialMappingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingSupplierMaterialMappingsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetExistingSupplierMaterialMappingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetExistingSupplierMaterialMappingsQuery,
    GetExistingSupplierMaterialMappingsQueryVariables
  > &
    (
      | {
          variables: GetExistingSupplierMaterialMappingsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetExistingSupplierMaterialMappingsQuery,
    GetExistingSupplierMaterialMappingsQueryVariables
  >(GetExistingSupplierMaterialMappingsDocument, options);
}
export function useGetExistingSupplierMaterialMappingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetExistingSupplierMaterialMappingsQuery,
    GetExistingSupplierMaterialMappingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetExistingSupplierMaterialMappingsQuery,
    GetExistingSupplierMaterialMappingsQueryVariables
  >(GetExistingSupplierMaterialMappingsDocument, options);
}
// @ts-ignore
export function useGetExistingSupplierMaterialMappingsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetExistingSupplierMaterialMappingsQuery,
    GetExistingSupplierMaterialMappingsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetExistingSupplierMaterialMappingsQuery,
  GetExistingSupplierMaterialMappingsQueryVariables
>;
export function useGetExistingSupplierMaterialMappingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetExistingSupplierMaterialMappingsQuery,
        GetExistingSupplierMaterialMappingsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetExistingSupplierMaterialMappingsQuery | undefined,
  GetExistingSupplierMaterialMappingsQueryVariables
>;
export function useGetExistingSupplierMaterialMappingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetExistingSupplierMaterialMappingsQuery,
        GetExistingSupplierMaterialMappingsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetExistingSupplierMaterialMappingsQuery,
    GetExistingSupplierMaterialMappingsQueryVariables
  >(GetExistingSupplierMaterialMappingsDocument, options);
}
export type GetExistingSupplierMaterialMappingsQueryHookResult = ReturnType<
  typeof useGetExistingSupplierMaterialMappingsQuery
>;
export type GetExistingSupplierMaterialMappingsLazyQueryHookResult = ReturnType<
  typeof useGetExistingSupplierMaterialMappingsLazyQuery
>;
export type GetExistingSupplierMaterialMappingsSuspenseQueryHookResult =
  ReturnType<typeof useGetExistingSupplierMaterialMappingsSuspenseQuery>;
export type GetExistingSupplierMaterialMappingsQueryResult = Apollo.QueryResult<
  GetExistingSupplierMaterialMappingsQuery,
  GetExistingSupplierMaterialMappingsQueryVariables
>;
