import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables =
  Types.Exact<{
    organizationAddressId: Types.Scalars["uuid"]["input"];
  }>;

export type GetGhgProductShareAttributionDataByOrganizationAddressQuery = {
  __typename?: "query_root";
  GHGProductShareAttribution: Array<{
    __typename?: "GHGProductShareAttribution";
    task_request_id: any;
    organization_address_id: any;
    Material_Code?: string | null;
    Material_Name?: string | null;
    TaskRequest: {
      __typename?: "TaskRequest";
      id: any;
      month: string;
      year?: number | null;
    };
  }>;
};

export const GetGhgProductShareAttributionDataByOrganizationAddressDocument = gql`
  query getGHGProductShareAttributionDataByOrganizationAddress(
    $organizationAddressId: uuid!
  ) {
    GHGProductShareAttribution(
      where: { organization_address_id: { _eq: $organizationAddressId } }
      order_by: { Material_Code: asc }
    ) {
      task_request_id
      organization_address_id
      Material_Code
      Material_Name
      TaskRequest {
        id
        month
        year
      }
    }
  }
`;

/**
 * __useGetGhgProductShareAttributionDataByOrganizationAddressQuery__
 *
 * To run a query within a React component, call `useGetGhgProductShareAttributionDataByOrganizationAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgProductShareAttributionDataByOrganizationAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgProductShareAttributionDataByOrganizationAddressQuery({
 *   variables: {
 *      organizationAddressId: // value for 'organizationAddressId'
 *   },
 * });
 */
export function useGetGhgProductShareAttributionDataByOrganizationAddressQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  > &
    (
      | {
          variables: GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  >(GetGhgProductShareAttributionDataByOrganizationAddressDocument, options);
}
export function useGetGhgProductShareAttributionDataByOrganizationAddressLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  >(GetGhgProductShareAttributionDataByOrganizationAddressDocument, options);
}
// @ts-ignore
export function useGetGhgProductShareAttributionDataByOrganizationAddressSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgProductShareAttributionDataByOrganizationAddressQuery,
  GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
>;
export function useGetGhgProductShareAttributionDataByOrganizationAddressSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgProductShareAttributionDataByOrganizationAddressQuery,
        GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgProductShareAttributionDataByOrganizationAddressQuery | undefined,
  GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
>;
export function useGetGhgProductShareAttributionDataByOrganizationAddressSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgProductShareAttributionDataByOrganizationAddressQuery,
        GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  >(GetGhgProductShareAttributionDataByOrganizationAddressDocument, options);
}
export type GetGhgProductShareAttributionDataByOrganizationAddressQueryHookResult =
  ReturnType<
    typeof useGetGhgProductShareAttributionDataByOrganizationAddressQuery
  >;
export type GetGhgProductShareAttributionDataByOrganizationAddressLazyQueryHookResult =
  ReturnType<
    typeof useGetGhgProductShareAttributionDataByOrganizationAddressLazyQuery
  >;
export type GetGhgProductShareAttributionDataByOrganizationAddressSuspenseQueryHookResult =
  ReturnType<
    typeof useGetGhgProductShareAttributionDataByOrganizationAddressSuspenseQuery
  >;
export type GetGhgProductShareAttributionDataByOrganizationAddressQueryResult =
  Apollo.QueryResult<
    GetGhgProductShareAttributionDataByOrganizationAddressQuery,
    GetGhgProductShareAttributionDataByOrganizationAddressQueryVariables
  >;
