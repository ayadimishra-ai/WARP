import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierAddressMappingWithSupplierCodeQueryVariables =
  Types.Exact<{
    supplierCode: Types.Scalars["String"]["input"];
    pincode: Types.Scalars["String"]["input"];
  }>;

export type GetSupplierAddressMappingWithSupplierCodeQuery = {
  __typename?: "query_root";
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    SupplierAddressMappings: Array<{
      __typename?: "SupplierAddressMapping";
      id: any;
    }>;
  }>;
};

export const GetSupplierAddressMappingWithSupplierCodeDocument = gql`
  query GetSupplierAddressMappingWithSupplierCode(
    $supplierCode: String!
    $pincode: String!
  ) {
    OrgSupplierMaster(where: { client_master_id: { _eq: $supplierCode } }) {
      SupplierAddressMappings(
        where: { Address: { pincode: { _eq: $pincode } } }
      ) {
        id
      }
    }
  }
`;

/**
 * __useGetSupplierAddressMappingWithSupplierCodeQuery__
 *
 * To run a query within a React component, call `useGetSupplierAddressMappingWithSupplierCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierAddressMappingWithSupplierCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierAddressMappingWithSupplierCodeQuery({
 *   variables: {
 *      supplierCode: // value for 'supplierCode'
 *      pincode: // value for 'pincode'
 *   },
 * });
 */
export function useGetSupplierAddressMappingWithSupplierCodeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  > &
    (
      | {
          variables: GetSupplierAddressMappingWithSupplierCodeQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  >(GetSupplierAddressMappingWithSupplierCodeDocument, options);
}
export function useGetSupplierAddressMappingWithSupplierCodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  >(GetSupplierAddressMappingWithSupplierCodeDocument, options);
}
// @ts-ignore
export function useGetSupplierAddressMappingWithSupplierCodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierAddressMappingWithSupplierCodeQuery,
  GetSupplierAddressMappingWithSupplierCodeQueryVariables
>;
export function useGetSupplierAddressMappingWithSupplierCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierAddressMappingWithSupplierCodeQuery,
        GetSupplierAddressMappingWithSupplierCodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierAddressMappingWithSupplierCodeQuery | undefined,
  GetSupplierAddressMappingWithSupplierCodeQueryVariables
>;
export function useGetSupplierAddressMappingWithSupplierCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierAddressMappingWithSupplierCodeQuery,
        GetSupplierAddressMappingWithSupplierCodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  >(GetSupplierAddressMappingWithSupplierCodeDocument, options);
}
export type GetSupplierAddressMappingWithSupplierCodeQueryHookResult =
  ReturnType<typeof useGetSupplierAddressMappingWithSupplierCodeQuery>;
export type GetSupplierAddressMappingWithSupplierCodeLazyQueryHookResult =
  ReturnType<typeof useGetSupplierAddressMappingWithSupplierCodeLazyQuery>;
export type GetSupplierAddressMappingWithSupplierCodeSuspenseQueryHookResult =
  ReturnType<typeof useGetSupplierAddressMappingWithSupplierCodeSuspenseQuery>;
export type GetSupplierAddressMappingWithSupplierCodeQueryResult =
  Apollo.QueryResult<
    GetSupplierAddressMappingWithSupplierCodeQuery,
    GetSupplierAddressMappingWithSupplierCodeQueryVariables
  >;
