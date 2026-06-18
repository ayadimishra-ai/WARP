import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetsupplierMasterByCodesAndOrganizationIdQueryVariables =
  Types.Exact<{
    supplierCodes:
      | Array<Types.Scalars["String"]["input"]>
      | Types.Scalars["String"]["input"];
    organizationId: Types.Scalars["uuid"]["input"];
  }>;

export type GetsupplierMasterByCodesAndOrganizationIdQuery = {
  __typename?: "query_root";
  OrgSupplierMaster: Array<{
    __typename?: "OrgSupplierMaster";
    id: any;
    code?: string | null;
    name: string;
    category?: string | null;
    client_master_id?: string | null;
    organization_id: any;
  }>;
};

export const GetsupplierMasterByCodesAndOrganizationIdDocument = gql`
  query getsupplierMasterByCodesAndOrganizationId(
    $supplierCodes: [String!]!
    $organizationId: uuid!
  ) {
    OrgSupplierMaster(
      where: {
        code: { _in: $supplierCodes }
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
    ) {
      id
      code
      name
      category
      client_master_id
      organization_id
    }
  }
`;

/**
 * __useGetsupplierMasterByCodesAndOrganizationIdQuery__
 *
 * To run a query within a React component, call `useGetsupplierMasterByCodesAndOrganizationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetsupplierMasterByCodesAndOrganizationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetsupplierMasterByCodesAndOrganizationIdQuery({
 *   variables: {
 *      supplierCodes: // value for 'supplierCodes'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetsupplierMasterByCodesAndOrganizationIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  > &
    (
      | {
          variables: GetsupplierMasterByCodesAndOrganizationIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  >(GetsupplierMasterByCodesAndOrganizationIdDocument, options);
}
export function useGetsupplierMasterByCodesAndOrganizationIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  >(GetsupplierMasterByCodesAndOrganizationIdDocument, options);
}
// @ts-ignore
export function useGetsupplierMasterByCodesAndOrganizationIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetsupplierMasterByCodesAndOrganizationIdQuery,
  GetsupplierMasterByCodesAndOrganizationIdQueryVariables
>;
export function useGetsupplierMasterByCodesAndOrganizationIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetsupplierMasterByCodesAndOrganizationIdQuery,
        GetsupplierMasterByCodesAndOrganizationIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetsupplierMasterByCodesAndOrganizationIdQuery | undefined,
  GetsupplierMasterByCodesAndOrganizationIdQueryVariables
>;
export function useGetsupplierMasterByCodesAndOrganizationIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetsupplierMasterByCodesAndOrganizationIdQuery,
        GetsupplierMasterByCodesAndOrganizationIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  >(GetsupplierMasterByCodesAndOrganizationIdDocument, options);
}
export type GetsupplierMasterByCodesAndOrganizationIdQueryHookResult =
  ReturnType<typeof useGetsupplierMasterByCodesAndOrganizationIdQuery>;
export type GetsupplierMasterByCodesAndOrganizationIdLazyQueryHookResult =
  ReturnType<typeof useGetsupplierMasterByCodesAndOrganizationIdLazyQuery>;
export type GetsupplierMasterByCodesAndOrganizationIdSuspenseQueryHookResult =
  ReturnType<typeof useGetsupplierMasterByCodesAndOrganizationIdSuspenseQuery>;
export type GetsupplierMasterByCodesAndOrganizationIdQueryResult =
  Apollo.QueryResult<
    GetsupplierMasterByCodesAndOrganizationIdQuery,
    GetsupplierMasterByCodesAndOrganizationIdQueryVariables
  >;
