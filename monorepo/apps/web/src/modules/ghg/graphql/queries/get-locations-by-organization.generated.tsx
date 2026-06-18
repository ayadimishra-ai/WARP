import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetLocationsByOrganizationQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetLocationsByOrganizationQuery = {
  __typename?: "query_root";
  OrganizationAddress: Array<{
    __typename?: "OrganizationAddress";
    id: any;
    Address: {
      __typename?: "Addresses";
      id: any;
      name: string;
      code?: string | null;
    };
  }>;
};

export const GetLocationsByOrganizationDocument = gql`
  query GetLocationsByOrganization($organizationId: uuid!) {
    OrganizationAddress(
      where: {
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
    ) {
      id
      Address {
        id
        name
        code
      }
    }
  }
`;

/**
 * __useGetLocationsByOrganizationQuery__
 *
 * To run a query within a React component, call `useGetLocationsByOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLocationsByOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLocationsByOrganizationQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetLocationsByOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLocationsByOrganizationQuery,
    GetLocationsByOrganizationQueryVariables
  > &
    (
      | { variables: GetLocationsByOrganizationQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLocationsByOrganizationQuery,
    GetLocationsByOrganizationQueryVariables
  >(GetLocationsByOrganizationDocument, options);
}
export function useGetLocationsByOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLocationsByOrganizationQuery,
    GetLocationsByOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLocationsByOrganizationQuery,
    GetLocationsByOrganizationQueryVariables
  >(GetLocationsByOrganizationDocument, options);
}
// @ts-ignore
export function useGetLocationsByOrganizationSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetLocationsByOrganizationQuery,
    GetLocationsByOrganizationQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetLocationsByOrganizationQuery,
  GetLocationsByOrganizationQueryVariables
>;
export function useGetLocationsByOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLocationsByOrganizationQuery,
        GetLocationsByOrganizationQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetLocationsByOrganizationQuery | undefined,
  GetLocationsByOrganizationQueryVariables
>;
export function useGetLocationsByOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLocationsByOrganizationQuery,
        GetLocationsByOrganizationQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetLocationsByOrganizationQuery,
    GetLocationsByOrganizationQueryVariables
  >(GetLocationsByOrganizationDocument, options);
}
export type GetLocationsByOrganizationQueryHookResult = ReturnType<
  typeof useGetLocationsByOrganizationQuery
>;
export type GetLocationsByOrganizationLazyQueryHookResult = ReturnType<
  typeof useGetLocationsByOrganizationLazyQuery
>;
export type GetLocationsByOrganizationSuspenseQueryHookResult = ReturnType<
  typeof useGetLocationsByOrganizationSuspenseQuery
>;
export type GetLocationsByOrganizationQueryResult = Apollo.QueryResult<
  GetLocationsByOrganizationQuery,
  GetLocationsByOrganizationQueryVariables
>;
