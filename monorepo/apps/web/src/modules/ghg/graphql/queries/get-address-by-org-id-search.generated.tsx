import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetAddressByOrgIdSearchQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  limit?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  offset?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  searchTerm: Types.Scalars["String"]["input"];
}>;

export type GetAddressByOrgIdSearchQuery = {
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
      ownership_type: string;
      facility_type?: string | null;
      is_wwtp: string;
      type: string;
    };
  }>;
  totalCount: {
    __typename?: "OrganizationAddress_aggregate";
    aggregate?: {
      __typename?: "OrganizationAddress_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetAddressByOrgIdSearchDocument = gql`
  query GetAddressByOrgIdSearch(
    $organizationId: uuid!
    $limit: Int
    $offset: Int
    $searchTerm: String!
  ) {
    OrganizationAddress(
      where: {
        organization_id: { _eq: $organizationId }
        _or: [
          { Address: { name: { _ilike: $searchTerm } } }
          { Address: { code: { _ilike: $searchTerm } } }
          { Address: { full_address: { _ilike: $searchTerm } } }
          { Address: { ownership_type: { _ilike: $searchTerm } } }
          { Address: { facility_type: { _ilike: $searchTerm } } }
          { Address: { type: { _ilike: $searchTerm } } }
        ]
      }
      limit: $limit
      offset: $offset
    ) {
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
    totalCount: OrganizationAddress_aggregate(
      where: {
        organization_id: { _eq: $organizationId }
        _or: [
          { Address: { name: { _ilike: $searchTerm } } }
          { Address: { code: { _ilike: $searchTerm } } }
          { Address: { full_address: { _ilike: $searchTerm } } }
          { Address: { ownership_type: { _ilike: $searchTerm } } }
          { Address: { facility_type: { _ilike: $searchTerm } } }
          { Address: { type: { _ilike: $searchTerm } } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetAddressByOrgIdSearchQuery__
 *
 * To run a query within a React component, call `useGetAddressByOrgIdSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressByOrgIdSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressByOrgIdSearchQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      searchTerm: // value for 'searchTerm'
 *   },
 * });
 */
export function useGetAddressByOrgIdSearchQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAddressByOrgIdSearchQuery,
    GetAddressByOrgIdSearchQueryVariables
  > &
    (
      | { variables: GetAddressByOrgIdSearchQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAddressByOrgIdSearchQuery,
    GetAddressByOrgIdSearchQueryVariables
  >(GetAddressByOrgIdSearchDocument, options);
}
export function useGetAddressByOrgIdSearchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAddressByOrgIdSearchQuery,
    GetAddressByOrgIdSearchQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAddressByOrgIdSearchQuery,
    GetAddressByOrgIdSearchQueryVariables
  >(GetAddressByOrgIdSearchDocument, options);
}
export function useGetAddressByOrgIdSearchSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetAddressByOrgIdSearchQuery,
        GetAddressByOrgIdSearchQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetAddressByOrgIdSearchQuery,
    GetAddressByOrgIdSearchQueryVariables
  >(GetAddressByOrgIdSearchDocument, options);
}
export type GetAddressByOrgIdSearchQueryHookResult = ReturnType<
  typeof useGetAddressByOrgIdSearchQuery
>;
export type GetAddressByOrgIdSearchLazyQueryHookResult = ReturnType<
  typeof useGetAddressByOrgIdSearchLazyQuery
>;
export type GetAddressByOrgIdSearchSuspenseQueryHookResult = ReturnType<
  typeof useGetAddressByOrgIdSearchSuspenseQuery
>;
export type GetAddressByOrgIdSearchQueryResult = Apollo.QueryResult<
  GetAddressByOrgIdSearchQuery,
  GetAddressByOrgIdSearchQueryVariables
>;
