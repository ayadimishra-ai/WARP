import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrganizationActivitiesAndAddressQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
  organizationAddressId: Types.Scalars["uuid"]["input"];
}>;

export type GetOrganizationActivitiesAndAddressQuery = {
  __typename?: "query_root";
  OrganizationActivityMapping: Array<{
    __typename?: "OrganizationActivityMapping";
    Activity: { __typename?: "Activity"; id: any; code: string };
  }>;
  Organization: Array<{
    __typename?: "Organization";
    OrganizationAddresses: Array<{
      __typename?: "OrganizationAddress";
      id: any;
      Address: {
        __typename?: "Addresses";
        id: any;
        name: string;
        code?: string | null;
        pincode?: string | null;
        type?: string | null;
        ownership_type?: string | null;
      };
    }>;
  }>;
};

export const GetOrganizationActivitiesAndAddressDocument = gql`
  query getOrganizationActivitiesAndAddress(
    $organizationId: uuid!
    $organizationAddressId: uuid!
  ) {
    OrganizationActivityMapping(
      where: { organization_id: { _eq: $organizationId } }
    ) {
      Activity {
        id
        code
      }
    }
    Organization(where: { id: { _eq: $organizationId } }) {
      OrganizationAddresses(where: { id: { _eq: $organizationAddressId } }) {
        id
        Address {
          id
          name
          code
          pincode
          type
          ownership_type
        }
      }
    }
  }
`;

/**
 * __useGetOrganizationActivitiesAndAddressQuery__
 *
 * To run a query within a React component, call `useGetOrganizationActivitiesAndAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationActivitiesAndAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationActivitiesAndAddressQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      organizationAddressId: // value for 'organizationAddressId'
 *   },
 * });
 */
export function useGetOrganizationActivitiesAndAddressQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrganizationActivitiesAndAddressQuery,
    GetOrganizationActivitiesAndAddressQueryVariables
  > &
    (
      | {
          variables: GetOrganizationActivitiesAndAddressQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationActivitiesAndAddressQuery,
    GetOrganizationActivitiesAndAddressQueryVariables
  >(GetOrganizationActivitiesAndAddressDocument, options);
}
export function useGetOrganizationActivitiesAndAddressLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationActivitiesAndAddressQuery,
    GetOrganizationActivitiesAndAddressQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationActivitiesAndAddressQuery,
    GetOrganizationActivitiesAndAddressQueryVariables
  >(GetOrganizationActivitiesAndAddressDocument, options);
}
// @ts-ignore
export function useGetOrganizationActivitiesAndAddressSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationActivitiesAndAddressQuery,
    GetOrganizationActivitiesAndAddressQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationActivitiesAndAddressQuery,
  GetOrganizationActivitiesAndAddressQueryVariables
>;
export function useGetOrganizationActivitiesAndAddressSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationActivitiesAndAddressQuery,
        GetOrganizationActivitiesAndAddressQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationActivitiesAndAddressQuery | undefined,
  GetOrganizationActivitiesAndAddressQueryVariables
>;
export function useGetOrganizationActivitiesAndAddressSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationActivitiesAndAddressQuery,
        GetOrganizationActivitiesAndAddressQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationActivitiesAndAddressQuery,
    GetOrganizationActivitiesAndAddressQueryVariables
  >(GetOrganizationActivitiesAndAddressDocument, options);
}
export type GetOrganizationActivitiesAndAddressQueryHookResult = ReturnType<
  typeof useGetOrganizationActivitiesAndAddressQuery
>;
export type GetOrganizationActivitiesAndAddressLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationActivitiesAndAddressLazyQuery
>;
export type GetOrganizationActivitiesAndAddressSuspenseQueryHookResult =
  ReturnType<typeof useGetOrganizationActivitiesAndAddressSuspenseQuery>;
export type GetOrganizationActivitiesAndAddressQueryResult = Apollo.QueryResult<
  GetOrganizationActivitiesAndAddressQuery,
  GetOrganizationActivitiesAndAddressQueryVariables
>;
