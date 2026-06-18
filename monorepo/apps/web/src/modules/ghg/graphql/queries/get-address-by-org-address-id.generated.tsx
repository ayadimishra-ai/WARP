import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAddressByOrgAddressIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetAddressByOrgAddressIdQuery = {
  __typename?: "query_root";
  OrganizationAddress: Array<{
    __typename?: "OrganizationAddress";
    id: any;
    organization_id: any;
    address_id: any;
    Address: {
      __typename?: "Addresses";
      id: any;
      name: string;
      code?: string | null;
      full_address: string;
      ownership_type?: string | null;
      facility_type?: string | null;
      is_wwtp: string;
      type?: string | null;
    };
  }>;
};

export const GetAddressByOrgAddressIdDocument = gql`
  query GetAddressByOrgAddressId($organizationId: uuid!) {
    OrganizationAddress(where: { organization_id: { _eq: $organizationId } }) {
      id
      organization_id
      address_id
      Address {
        id
        name
        code
        full_address
        ownership_type
        facility_type
        is_wwtp
        type
      }
    }
  }
`;

/**
 * __useGetAddressByOrgAddressIdQuery__
 *
 * To run a query within a React component, call `useGetAddressByOrgAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressByOrgAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressByOrgAddressIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetAddressByOrgAddressIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAddressByOrgAddressIdQuery,
    GetAddressByOrgAddressIdQueryVariables
  > &
    (
      | { variables: GetAddressByOrgAddressIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAddressByOrgAddressIdQuery,
    GetAddressByOrgAddressIdQueryVariables
  >(GetAddressByOrgAddressIdDocument, options);
}
export function useGetAddressByOrgAddressIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAddressByOrgAddressIdQuery,
    GetAddressByOrgAddressIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAddressByOrgAddressIdQuery,
    GetAddressByOrgAddressIdQueryVariables
  >(GetAddressByOrgAddressIdDocument, options);
}
// @ts-ignore
export function useGetAddressByOrgAddressIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetAddressByOrgAddressIdQuery,
    GetAddressByOrgAddressIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetAddressByOrgAddressIdQuery,
  GetAddressByOrgAddressIdQueryVariables
>;
export function useGetAddressByOrgAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAddressByOrgAddressIdQuery,
        GetAddressByOrgAddressIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetAddressByOrgAddressIdQuery | undefined,
  GetAddressByOrgAddressIdQueryVariables
>;
export function useGetAddressByOrgAddressIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAddressByOrgAddressIdQuery,
        GetAddressByOrgAddressIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAddressByOrgAddressIdQuery,
    GetAddressByOrgAddressIdQueryVariables
  >(GetAddressByOrgAddressIdDocument, options);
}
export type GetAddressByOrgAddressIdQueryHookResult = ReturnType<
  typeof useGetAddressByOrgAddressIdQuery
>;
export type GetAddressByOrgAddressIdLazyQueryHookResult = ReturnType<
  typeof useGetAddressByOrgAddressIdLazyQuery
>;
export type GetAddressByOrgAddressIdSuspenseQueryHookResult = ReturnType<
  typeof useGetAddressByOrgAddressIdSuspenseQuery
>;
export type GetAddressByOrgAddressIdQueryResult = Apollo.QueryResult<
  GetAddressByOrgAddressIdQuery,
  GetAddressByOrgAddressIdQueryVariables
>;
