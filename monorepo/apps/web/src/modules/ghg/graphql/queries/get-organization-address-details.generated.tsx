import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetorganizationAddressDetailsQueryVariables = Types.Exact<{
  where: Types.OrganizationAddress_Bool_Exp;
}>;

export type GetorganizationAddressDetailsQuery = {
  __typename?: "query_root";
  OrganizationAddress: Array<{
    __typename?: "OrganizationAddress";
    id: any;
    organization_id: any;
    address_id: any;
    Address: {
      __typename?: "Addresses";
      country_id?: any | null;
      Country?: { __typename?: "Country"; region_code?: string | null } | null;
    };
  }>;
};

export const GetorganizationAddressDetailsDocument = gql`
  query getorganizationAddressDetails($where: OrganizationAddress_bool_exp!) {
    OrganizationAddress(where: $where) {
      id
      organization_id
      address_id
      Address {
        country_id
        Country {
          region_code
        }
      }
    }
  }
`;

/**
 * __useGetorganizationAddressDetailsQuery__
 *
 * To run a query within a React component, call `useGetorganizationAddressDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetorganizationAddressDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetorganizationAddressDetailsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetorganizationAddressDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetorganizationAddressDetailsQuery,
    GetorganizationAddressDetailsQueryVariables
  > &
    (
      | {
          variables: GetorganizationAddressDetailsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetorganizationAddressDetailsQuery,
    GetorganizationAddressDetailsQueryVariables
  >(GetorganizationAddressDetailsDocument, options);
}
export function useGetorganizationAddressDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetorganizationAddressDetailsQuery,
    GetorganizationAddressDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetorganizationAddressDetailsQuery,
    GetorganizationAddressDetailsQueryVariables
  >(GetorganizationAddressDetailsDocument, options);
}
// @ts-ignore
export function useGetorganizationAddressDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetorganizationAddressDetailsQuery,
    GetorganizationAddressDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetorganizationAddressDetailsQuery,
  GetorganizationAddressDetailsQueryVariables
>;
export function useGetorganizationAddressDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetorganizationAddressDetailsQuery,
        GetorganizationAddressDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetorganizationAddressDetailsQuery | undefined,
  GetorganizationAddressDetailsQueryVariables
>;
export function useGetorganizationAddressDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetorganizationAddressDetailsQuery,
        GetorganizationAddressDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetorganizationAddressDetailsQuery,
    GetorganizationAddressDetailsQueryVariables
  >(GetorganizationAddressDetailsDocument, options);
}
export type GetorganizationAddressDetailsQueryHookResult = ReturnType<
  typeof useGetorganizationAddressDetailsQuery
>;
export type GetorganizationAddressDetailsLazyQueryHookResult = ReturnType<
  typeof useGetorganizationAddressDetailsLazyQuery
>;
export type GetorganizationAddressDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetorganizationAddressDetailsSuspenseQuery
>;
export type GetorganizationAddressDetailsQueryResult = Apollo.QueryResult<
  GetorganizationAddressDetailsQuery,
  GetorganizationAddressDetailsQueryVariables
>;
