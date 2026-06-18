import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierAddressMappingsQueryVariables = Types.Exact<{
  orgId: Types.Scalars["uuid"]["input"];
}>;

export type GetSupplierAddressMappingsQuery = {
  __typename?: "query_root";
  Organization: Array<{
    __typename?: "Organization";
    id: any;
    name: string;
    OrganizationAddresses: Array<{
      __typename?: "OrganizationAddress";
      id: any;
      organization_id: any;
      Address: {
        __typename?: "Addresses";
        id: any;
        name: string;
        code?: string | null;
      };
    }>;
  }>;
};

export const GetSupplierAddressMappingsDocument = gql`
  query GetSupplierAddressMappings($orgId: uuid!) {
    Organization(where: { id: { _eq: $orgId } }) {
      id
      name
      OrganizationAddresses {
        id
        organization_id
        Address {
          id
          name
          code
        }
      }
    }
  }
`;

/**
 * __useGetSupplierAddressMappingsQuery__
 *
 * To run a query within a React component, call `useGetSupplierAddressMappingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierAddressMappingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierAddressMappingsQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *   },
 * });
 */
export function useGetSupplierAddressMappingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierAddressMappingsQuery,
    GetSupplierAddressMappingsQueryVariables
  > &
    (
      | { variables: GetSupplierAddressMappingsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierAddressMappingsQuery,
    GetSupplierAddressMappingsQueryVariables
  >(GetSupplierAddressMappingsDocument, options);
}
export function useGetSupplierAddressMappingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierAddressMappingsQuery,
    GetSupplierAddressMappingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierAddressMappingsQuery,
    GetSupplierAddressMappingsQueryVariables
  >(GetSupplierAddressMappingsDocument, options);
}
// @ts-ignore
export function useGetSupplierAddressMappingsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierAddressMappingsQuery,
    GetSupplierAddressMappingsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierAddressMappingsQuery,
  GetSupplierAddressMappingsQueryVariables
>;
export function useGetSupplierAddressMappingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierAddressMappingsQuery,
        GetSupplierAddressMappingsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierAddressMappingsQuery | undefined,
  GetSupplierAddressMappingsQueryVariables
>;
export function useGetSupplierAddressMappingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierAddressMappingsQuery,
        GetSupplierAddressMappingsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierAddressMappingsQuery,
    GetSupplierAddressMappingsQueryVariables
  >(GetSupplierAddressMappingsDocument, options);
}
export type GetSupplierAddressMappingsQueryHookResult = ReturnType<
  typeof useGetSupplierAddressMappingsQuery
>;
export type GetSupplierAddressMappingsLazyQueryHookResult = ReturnType<
  typeof useGetSupplierAddressMappingsLazyQuery
>;
export type GetSupplierAddressMappingsSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierAddressMappingsSuspenseQuery
>;
export type GetSupplierAddressMappingsQueryResult = Apollo.QueryResult<
  GetSupplierAddressMappingsQuery,
  GetSupplierAddressMappingsQueryVariables
>;
