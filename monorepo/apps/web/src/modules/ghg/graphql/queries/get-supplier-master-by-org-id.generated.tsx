import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetsupplierMasterByOrganizationIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetsupplierMasterByOrganizationIdQuery = {
  __typename?: "query_root";
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    id: any;
    code?: string | null;
    name: string;
    category?: string | null;
    client_master_id?: string | null;
    organization_id: any;
    supplier_gst_or_license_number?: string | null;
    supplier_admin_email_id?: string | null;
    supplier_admin_name?: string | null;
    updated_at: any;
  }>;
  Organization: Array<{ __typename?: "Organization"; id: any; name: string }>;
};

export const GetsupplierMasterByOrganizationIdDocument = gql`
  query getsupplierMasterByOrganizationId($organizationId: uuid!) {
    OrgSupplierMaster(
      where: {
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
      order_by: { updated_at: desc }
    ) {
      id
      code
      name
      category
      client_master_id
      organization_id
      supplier_gst_or_license_number
      supplier_admin_email_id
      supplier_admin_name
      updated_at
    }
    Organization(
      where: { id: { _eq: $organizationId }, is_deleted: { _eq: false } }
    ) {
      id
      name
    }
  }
`;

/**
 * __useGetsupplierMasterByOrganizationIdQuery__
 *
 * To run a query within a React component, call `useGetsupplierMasterByOrganizationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetsupplierMasterByOrganizationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetsupplierMasterByOrganizationIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetsupplierMasterByOrganizationIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetsupplierMasterByOrganizationIdQuery,
    GetsupplierMasterByOrganizationIdQueryVariables
  > &
    (
      | {
          variables: GetsupplierMasterByOrganizationIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetsupplierMasterByOrganizationIdQuery,
    GetsupplierMasterByOrganizationIdQueryVariables
  >(GetsupplierMasterByOrganizationIdDocument, options);
}
export function useGetsupplierMasterByOrganizationIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetsupplierMasterByOrganizationIdQuery,
    GetsupplierMasterByOrganizationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetsupplierMasterByOrganizationIdQuery,
    GetsupplierMasterByOrganizationIdQueryVariables
  >(GetsupplierMasterByOrganizationIdDocument, options);
}
// @ts-ignore
export function useGetsupplierMasterByOrganizationIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetsupplierMasterByOrganizationIdQuery,
    GetsupplierMasterByOrganizationIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetsupplierMasterByOrganizationIdQuery,
  GetsupplierMasterByOrganizationIdQueryVariables
>;
export function useGetsupplierMasterByOrganizationIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetsupplierMasterByOrganizationIdQuery,
        GetsupplierMasterByOrganizationIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetsupplierMasterByOrganizationIdQuery | undefined,
  GetsupplierMasterByOrganizationIdQueryVariables
>;
export function useGetsupplierMasterByOrganizationIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetsupplierMasterByOrganizationIdQuery,
        GetsupplierMasterByOrganizationIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetsupplierMasterByOrganizationIdQuery,
    GetsupplierMasterByOrganizationIdQueryVariables
  >(GetsupplierMasterByOrganizationIdDocument, options);
}
export type GetsupplierMasterByOrganizationIdQueryHookResult = ReturnType<
  typeof useGetsupplierMasterByOrganizationIdQuery
>;
export type GetsupplierMasterByOrganizationIdLazyQueryHookResult = ReturnType<
  typeof useGetsupplierMasterByOrganizationIdLazyQuery
>;
export type GetsupplierMasterByOrganizationIdSuspenseQueryHookResult =
  ReturnType<typeof useGetsupplierMasterByOrganizationIdSuspenseQuery>;
export type GetsupplierMasterByOrganizationIdQueryResult = Apollo.QueryResult<
  GetsupplierMasterByOrganizationIdQuery,
  GetsupplierMasterByOrganizationIdQueryVariables
>;
