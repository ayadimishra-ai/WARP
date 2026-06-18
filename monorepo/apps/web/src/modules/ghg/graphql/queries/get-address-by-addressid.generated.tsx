import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAddressDetailByAddresssIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  AddressId: Types.Scalars["uuid"]["input"];
}>;

export type GetAddressDetailByAddresssIdQuery = {
  __typename?: "query_root";
  Addresses: Array<{
    __typename?: "Addresses";
    id: any;
    name: string;
    code?: string | null;
    full_address: string;
    pincode?: string | null;
    country_id?: any | null;
    state_id?: any | null;
    city_id?: any | null;
    type?: string | null;
    metadata?: any | null;
    ownership_type?: string | null;
    facility_type?: string | null;
    updated_at: any;
    updated_by?: any | null;
    is_deleted: boolean;
    is_wwtp: string;
  }>;
};

export const GetAddressDetailByAddresssIdDocument = gql`
  query getAddressDetailByAddresssId(
    $organizationId: uuid!
    $AddressId: uuid!
  ) {
    Addresses(
      where: {
        id: { _eq: $AddressId }
        OrganizationAddresses: { organization_id: { _eq: $organizationId } }
      }
    ) {
      id
      name
      code
      full_address
      pincode
      country_id
      state_id
      city_id
      type
      metadata
      ownership_type
      facility_type
      updated_at
      updated_by
      is_deleted
      is_wwtp
    }
  }
`;

/**
 * __useGetAddressDetailByAddresssIdQuery__
 *
 * To run a query within a React component, call `useGetAddressDetailByAddresssIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressDetailByAddresssIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressDetailByAddresssIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      AddressId: // value for 'AddressId'
 *   },
 * });
 */
export function useGetAddressDetailByAddresssIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAddressDetailByAddresssIdQuery,
    GetAddressDetailByAddresssIdQueryVariables
  > &
    (
      | {
          variables: GetAddressDetailByAddresssIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAddressDetailByAddresssIdQuery,
    GetAddressDetailByAddresssIdQueryVariables
  >(GetAddressDetailByAddresssIdDocument, options);
}
export function useGetAddressDetailByAddresssIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAddressDetailByAddresssIdQuery,
    GetAddressDetailByAddresssIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAddressDetailByAddresssIdQuery,
    GetAddressDetailByAddresssIdQueryVariables
  >(GetAddressDetailByAddresssIdDocument, options);
}
// @ts-ignore
export function useGetAddressDetailByAddresssIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAddressDetailByAddresssIdQuery,
    GetAddressDetailByAddresssIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAddressDetailByAddresssIdQuery,
  GetAddressDetailByAddresssIdQueryVariables
>;
export function useGetAddressDetailByAddresssIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAddressDetailByAddresssIdQuery,
        GetAddressDetailByAddresssIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAddressDetailByAddresssIdQuery | undefined,
  GetAddressDetailByAddresssIdQueryVariables
>;
export function useGetAddressDetailByAddresssIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAddressDetailByAddresssIdQuery,
        GetAddressDetailByAddresssIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAddressDetailByAddresssIdQuery,
    GetAddressDetailByAddresssIdQueryVariables
  >(GetAddressDetailByAddresssIdDocument, options);
}
export type GetAddressDetailByAddresssIdQueryHookResult = ReturnType<
  typeof useGetAddressDetailByAddresssIdQuery
>;
export type GetAddressDetailByAddresssIdLazyQueryHookResult = ReturnType<
  typeof useGetAddressDetailByAddresssIdLazyQuery
>;
export type GetAddressDetailByAddresssIdSuspenseQueryHookResult = ReturnType<
  typeof useGetAddressDetailByAddresssIdSuspenseQuery
>;
export type GetAddressDetailByAddresssIdQueryResult = Apollo.QueryResult<
  GetAddressDetailByAddresssIdQuery,
  GetAddressDetailByAddresssIdQueryVariables
>;
