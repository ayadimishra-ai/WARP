import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrganizationAddressByIdQueryVariables = Types.Exact<{
  organizationAddressId: Types.Scalars["uuid"]["input"];
}>;

export type GetOrganizationAddressByIdQuery = {
  __typename?: "query_root";
  OrganizationAddress: Array<{
    __typename?: "OrganizationAddress";
    id: any;
    address_id: any;
    Address: {
      __typename?: "Addresses";
      Country?: { __typename?: "Country"; region_code?: string | null } | null;
    };
  }>;
};

export const GetOrganizationAddressByIdDocument = gql`
  query getOrganizationAddressById($organizationAddressId: uuid!) {
    OrganizationAddress(where: { id: { _eq: $organizationAddressId } }) {
      id
      address_id
      Address {
        Country {
          region_code
        }
      }
    }
  }
`;

/**
 * __useGetOrganizationAddressByIdQuery__
 *
 * To run a query within a React component, call `useGetOrganizationAddressByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationAddressByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationAddressByIdQuery({
 *   variables: {
 *      organizationAddressId: // value for 'organizationAddressId'
 *   },
 * });
 */
export function useGetOrganizationAddressByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrganizationAddressByIdQuery,
    GetOrganizationAddressByIdQueryVariables
  > &
    (
      | { variables: GetOrganizationAddressByIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationAddressByIdQuery,
    GetOrganizationAddressByIdQueryVariables
  >(GetOrganizationAddressByIdDocument, options);
}
export function useGetOrganizationAddressByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationAddressByIdQuery,
    GetOrganizationAddressByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationAddressByIdQuery,
    GetOrganizationAddressByIdQueryVariables
  >(GetOrganizationAddressByIdDocument, options);
}
// @ts-ignore
export function useGetOrganizationAddressByIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationAddressByIdQuery,
    GetOrganizationAddressByIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationAddressByIdQuery,
  GetOrganizationAddressByIdQueryVariables
>;
export function useGetOrganizationAddressByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationAddressByIdQuery,
        GetOrganizationAddressByIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationAddressByIdQuery | undefined,
  GetOrganizationAddressByIdQueryVariables
>;
export function useGetOrganizationAddressByIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationAddressByIdQuery,
        GetOrganizationAddressByIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationAddressByIdQuery,
    GetOrganizationAddressByIdQueryVariables
  >(GetOrganizationAddressByIdDocument, options);
}
export type GetOrganizationAddressByIdQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressByIdQuery
>;
export type GetOrganizationAddressByIdLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressByIdLazyQuery
>;
export type GetOrganizationAddressByIdSuspenseQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressByIdSuspenseQuery
>;
export type GetOrganizationAddressByIdQueryResult = Apollo.QueryResult<
  GetOrganizationAddressByIdQuery,
  GetOrganizationAddressByIdQueryVariables
>;
