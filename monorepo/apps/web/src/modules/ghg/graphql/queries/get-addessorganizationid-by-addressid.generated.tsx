import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrganizationAddressIdByAddressIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  addressId: Types.Scalars["uuid"]["input"];
}>;

export type GetOrganizationAddressIdByAddressIdQuery = {
  __typename?: "query_root";
  OrganizationAddress: Array<{
    __typename?: "OrganizationAddress";
    is_deleted: boolean;
    metadata?: any | null;
    created_at: any;
    updated_at: any;
    address_id: any;
    created_by?: any | null;
    id: any;
    organization_id: any;
    updated_by?: any | null;
  }>;
};

export const GetOrganizationAddressIdByAddressIdDocument = gql`
  query GetOrganizationAddressIdByAddressId(
    $organizationId: uuid!
    $addressId: uuid!
  ) {
    OrganizationAddress(
      where: {
        organization_id: { _eq: $organizationId }
        address_id: { _eq: $addressId }
      }
    ) {
      is_deleted
      metadata
      created_at
      updated_at
      address_id
      created_by
      id
      organization_id
      updated_by
    }
  }
`;

/**
 * __useGetOrganizationAddressIdByAddressIdQuery__
 *
 * To run a query within a React component, call `useGetOrganizationAddressIdByAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationAddressIdByAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationAddressIdByAddressIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      addressId: // value for 'addressId'
 *   },
 * });
 */
export function useGetOrganizationAddressIdByAddressIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrganizationAddressIdByAddressIdQuery,
    GetOrganizationAddressIdByAddressIdQueryVariables
  > &
    (
      | {
          variables: GetOrganizationAddressIdByAddressIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationAddressIdByAddressIdQuery,
    GetOrganizationAddressIdByAddressIdQueryVariables
  >(GetOrganizationAddressIdByAddressIdDocument, options);
}
export function useGetOrganizationAddressIdByAddressIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationAddressIdByAddressIdQuery,
    GetOrganizationAddressIdByAddressIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationAddressIdByAddressIdQuery,
    GetOrganizationAddressIdByAddressIdQueryVariables
  >(GetOrganizationAddressIdByAddressIdDocument, options);
}
// @ts-ignore
export function useGetOrganizationAddressIdByAddressIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationAddressIdByAddressIdQuery,
    GetOrganizationAddressIdByAddressIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationAddressIdByAddressIdQuery,
  GetOrganizationAddressIdByAddressIdQueryVariables
>;
export function useGetOrganizationAddressIdByAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationAddressIdByAddressIdQuery,
        GetOrganizationAddressIdByAddressIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationAddressIdByAddressIdQuery | undefined,
  GetOrganizationAddressIdByAddressIdQueryVariables
>;
export function useGetOrganizationAddressIdByAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationAddressIdByAddressIdQuery,
        GetOrganizationAddressIdByAddressIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationAddressIdByAddressIdQuery,
    GetOrganizationAddressIdByAddressIdQueryVariables
  >(GetOrganizationAddressIdByAddressIdDocument, options);
}
export type GetOrganizationAddressIdByAddressIdQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressIdByAddressIdQuery
>;
export type GetOrganizationAddressIdByAddressIdLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressIdByAddressIdLazyQuery
>;
export type GetOrganizationAddressIdByAddressIdSuspenseQueryHookResult =
  ReturnType<typeof useGetOrganizationAddressIdByAddressIdSuspenseQuery>;
export type GetOrganizationAddressIdByAddressIdQueryResult = Apollo.QueryResult<
  GetOrganizationAddressIdByAddressIdQuery,
  GetOrganizationAddressIdByAddressIdQueryVariables
>;
