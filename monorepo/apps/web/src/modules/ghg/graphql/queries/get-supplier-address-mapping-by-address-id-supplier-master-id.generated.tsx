import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables =
  Types.Exact<{
    supplierMasterIds?: Types.InputMaybe<
      Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
    >;
  }>;

export type GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery = {
  __typename?: "query_root";
  SupplierAddressMapping: Array<{
    __typename?: "SupplierAddressMapping";
    id: any;
    org_supplier_master_id: any;
    address_id: any;
    metadata?: any | null;
  }>;
};

export const GetSupplierAddressMappingByAddressIdSupplierMasterIdDocument = gql`
  query GetSupplierAddressMappingByAddressIdSupplierMasterId(
    $supplierMasterIds: [uuid!]
  ) {
    SupplierAddressMapping(
      where: { org_supplier_master_id: { _in: $supplierMasterIds } }
    ) {
      id
      org_supplier_master_id
      address_id
      metadata
    }
  }
`;

/**
 * __useGetSupplierAddressMappingByAddressIdSupplierMasterIdQuery__
 *
 * To run a query within a React component, call `useGetSupplierAddressMappingByAddressIdSupplierMasterIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierAddressMappingByAddressIdSupplierMasterIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierAddressMappingByAddressIdSupplierMasterIdQuery({
 *   variables: {
 *      supplierMasterIds: // value for 'supplierMasterIds'
 *   },
 * });
 */
export function useGetSupplierAddressMappingByAddressIdSupplierMasterIdQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >(GetSupplierAddressMappingByAddressIdSupplierMasterIdDocument, options);
}
export function useGetSupplierAddressMappingByAddressIdSupplierMasterIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >(GetSupplierAddressMappingByAddressIdSupplierMasterIdDocument, options);
}
// @ts-ignore
export function useGetSupplierAddressMappingByAddressIdSupplierMasterIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
  GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
>;
export function useGetSupplierAddressMappingByAddressIdSupplierMasterIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
        GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery | undefined,
  GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
>;
export function useGetSupplierAddressMappingByAddressIdSupplierMasterIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
        GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >(GetSupplierAddressMappingByAddressIdSupplierMasterIdDocument, options);
}
export type GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryHookResult =
  ReturnType<
    typeof useGetSupplierAddressMappingByAddressIdSupplierMasterIdQuery
  >;
export type GetSupplierAddressMappingByAddressIdSupplierMasterIdLazyQueryHookResult =
  ReturnType<
    typeof useGetSupplierAddressMappingByAddressIdSupplierMasterIdLazyQuery
  >;
export type GetSupplierAddressMappingByAddressIdSupplierMasterIdSuspenseQueryHookResult =
  ReturnType<
    typeof useGetSupplierAddressMappingByAddressIdSupplierMasterIdSuspenseQuery
  >;
export type GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryResult =
  Apollo.QueryResult<
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQuery,
    GetSupplierAddressMappingByAddressIdSupplierMasterIdQueryVariables
  >;
