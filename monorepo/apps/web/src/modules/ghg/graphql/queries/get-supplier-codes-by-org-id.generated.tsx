import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierCodesByOrgIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetSupplierCodesByOrgIdQuery = {
  __typename?: "query_root";
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    id: any;
    code?: string | null;
  }>;
};

export const GetSupplierCodesByOrgIdDocument = gql`
  query getSupplierCodesByOrgId($organizationId: uuid!) {
    OrgSupplierMaster(
      where: {
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
      order_by: { updated_at: desc }
    ) {
      id
      code
    }
  }
`;

/**
 * __useGetSupplierCodesByOrgIdQuery__
 *
 * To run a query within a React component, call `useGetSupplierCodesByOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierCodesByOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierCodesByOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetSupplierCodesByOrgIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierCodesByOrgIdQuery,
    GetSupplierCodesByOrgIdQueryVariables
  > &
    (
      | { variables: GetSupplierCodesByOrgIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierCodesByOrgIdQuery,
    GetSupplierCodesByOrgIdQueryVariables
  >(GetSupplierCodesByOrgIdDocument, options);
}
export function useGetSupplierCodesByOrgIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierCodesByOrgIdQuery,
    GetSupplierCodesByOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierCodesByOrgIdQuery,
    GetSupplierCodesByOrgIdQueryVariables
  >(GetSupplierCodesByOrgIdDocument, options);
}
// @ts-ignore
export function useGetSupplierCodesByOrgIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierCodesByOrgIdQuery,
    GetSupplierCodesByOrgIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierCodesByOrgIdQuery,
  GetSupplierCodesByOrgIdQueryVariables
>;
export function useGetSupplierCodesByOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierCodesByOrgIdQuery,
        GetSupplierCodesByOrgIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierCodesByOrgIdQuery | undefined,
  GetSupplierCodesByOrgIdQueryVariables
>;
export function useGetSupplierCodesByOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierCodesByOrgIdQuery,
        GetSupplierCodesByOrgIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierCodesByOrgIdQuery,
    GetSupplierCodesByOrgIdQueryVariables
  >(GetSupplierCodesByOrgIdDocument, options);
}
export type GetSupplierCodesByOrgIdQueryHookResult = ReturnType<
  typeof useGetSupplierCodesByOrgIdQuery
>;
export type GetSupplierCodesByOrgIdLazyQueryHookResult = ReturnType<
  typeof useGetSupplierCodesByOrgIdLazyQuery
>;
export type GetSupplierCodesByOrgIdSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierCodesByOrgIdSuspenseQuery
>;
export type GetSupplierCodesByOrgIdQueryResult = Apollo.QueryResult<
  GetSupplierCodesByOrgIdQuery,
  GetSupplierCodesByOrgIdQueryVariables
>;
