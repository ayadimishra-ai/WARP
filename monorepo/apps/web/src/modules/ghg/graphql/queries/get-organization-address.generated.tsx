import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrganizationAddressByUserIdOrgIdQueryVariables = Types.Exact<{
  organizationId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
  userId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetOrganizationAddressByUserIdOrgIdQuery = {
  __typename?: "query_root";
  UserOrganizationAddressMapping: Array<{
    __typename?: "UserOrganizationAddressMapping";
    OrganizationAddress?: {
      __typename?: "OrganizationAddress";
      id: any;
      organization_id: any;
      address_id: any;
      Address: {
        __typename?: "Addresses";
        id: any;
        name: string;
        code?: string | null;
        ownership_type?: string | null;
        type?: string | null;
        pincode?: string | null;
      };
      Organization: {
        __typename?: "Organization";
        name: string;
        Baselineyear: number;
        FinancialYearMonth: string;
      };
    } | null;
  }>;
};

export const GetOrganizationAddressByUserIdOrgIdDocument = gql`
  query getOrganizationAddressByUserIdOrgId(
    $organizationId: uuid
    $userId: uuid
  ) {
    UserOrganizationAddressMapping(
      where: {
        organization_id: { _eq: $organizationId }
        user_id: { _eq: $userId }
      }
    ) {
      OrganizationAddress {
        id
        organization_id
        address_id
        Address {
          id
          name
          code
          ownership_type
          type
          pincode
        }
        Organization {
          name
          Baselineyear
          FinancialYearMonth
        }
      }
    }
  }
`;

/**
 * __useGetOrganizationAddressByUserIdOrgIdQuery__
 *
 * To run a query within a React component, call `useGetOrganizationAddressByUserIdOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationAddressByUserIdOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationAddressByUserIdOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetOrganizationAddressByUserIdOrgIdQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOrganizationAddressByUserIdOrgIdQuery,
    GetOrganizationAddressByUserIdOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationAddressByUserIdOrgIdQuery,
    GetOrganizationAddressByUserIdOrgIdQueryVariables
  >(GetOrganizationAddressByUserIdOrgIdDocument, options);
}
export function useGetOrganizationAddressByUserIdOrgIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationAddressByUserIdOrgIdQuery,
    GetOrganizationAddressByUserIdOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationAddressByUserIdOrgIdQuery,
    GetOrganizationAddressByUserIdOrgIdQueryVariables
  >(GetOrganizationAddressByUserIdOrgIdDocument, options);
}
// @ts-ignore
export function useGetOrganizationAddressByUserIdOrgIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationAddressByUserIdOrgIdQuery,
    GetOrganizationAddressByUserIdOrgIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationAddressByUserIdOrgIdQuery,
  GetOrganizationAddressByUserIdOrgIdQueryVariables
>;
export function useGetOrganizationAddressByUserIdOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationAddressByUserIdOrgIdQuery,
        GetOrganizationAddressByUserIdOrgIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationAddressByUserIdOrgIdQuery | undefined,
  GetOrganizationAddressByUserIdOrgIdQueryVariables
>;
export function useGetOrganizationAddressByUserIdOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationAddressByUserIdOrgIdQuery,
        GetOrganizationAddressByUserIdOrgIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationAddressByUserIdOrgIdQuery,
    GetOrganizationAddressByUserIdOrgIdQueryVariables
  >(GetOrganizationAddressByUserIdOrgIdDocument, options);
}
export type GetOrganizationAddressByUserIdOrgIdQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressByUserIdOrgIdQuery
>;
export type GetOrganizationAddressByUserIdOrgIdLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationAddressByUserIdOrgIdLazyQuery
>;
export type GetOrganizationAddressByUserIdOrgIdSuspenseQueryHookResult =
  ReturnType<typeof useGetOrganizationAddressByUserIdOrgIdSuspenseQuery>;
export type GetOrganizationAddressByUserIdOrgIdQueryResult = Apollo.QueryResult<
  GetOrganizationAddressByUserIdOrgIdQuery,
  GetOrganizationAddressByUserIdOrgIdQueryVariables
>;
