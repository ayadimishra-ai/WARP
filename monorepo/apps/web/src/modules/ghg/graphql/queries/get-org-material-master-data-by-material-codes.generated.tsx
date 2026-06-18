import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrgMaterialMasterByMaterialCodesQueryVariables = Types.Exact<{
  materialCodes:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetOrgMaterialMasterByMaterialCodesQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    client_master_id?: string | null;
    name: string;
    code?: string | null;
    type: string;
    organization_id: any;
  }>;
};

export const GetOrgMaterialMasterByMaterialCodesDocument = gql`
  query getOrgMaterialMasterByMaterialCodes(
    $materialCodes: [String!]!
    $organizationId: uuid!
  ) {
    OrgMaterialMaster(
      where: {
        code: { _in: $materialCodes }
        organization_id: { _eq: $organizationId }
        is_deleted: { _eq: false }
      }
    ) {
      id
      client_master_id
      name
      code
      type
      organization_id
    }
  }
`;

/**
 * __useGetOrgMaterialMasterByMaterialCodesQuery__
 *
 * To run a query within a React component, call `useGetOrgMaterialMasterByMaterialCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrgMaterialMasterByMaterialCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrgMaterialMasterByMaterialCodesQuery({
 *   variables: {
 *      materialCodes: // value for 'materialCodes'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetOrgMaterialMasterByMaterialCodesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOrgMaterialMasterByMaterialCodesQuery,
    GetOrgMaterialMasterByMaterialCodesQueryVariables
  > &
    (
      | {
          variables: GetOrgMaterialMasterByMaterialCodesQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrgMaterialMasterByMaterialCodesQuery,
    GetOrgMaterialMasterByMaterialCodesQueryVariables
  >(GetOrgMaterialMasterByMaterialCodesDocument, options);
}
export function useGetOrgMaterialMasterByMaterialCodesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrgMaterialMasterByMaterialCodesQuery,
    GetOrgMaterialMasterByMaterialCodesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrgMaterialMasterByMaterialCodesQuery,
    GetOrgMaterialMasterByMaterialCodesQueryVariables
  >(GetOrgMaterialMasterByMaterialCodesDocument, options);
}
// @ts-ignore
export function useGetOrgMaterialMasterByMaterialCodesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrgMaterialMasterByMaterialCodesQuery,
    GetOrgMaterialMasterByMaterialCodesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrgMaterialMasterByMaterialCodesQuery,
  GetOrgMaterialMasterByMaterialCodesQueryVariables
>;
export function useGetOrgMaterialMasterByMaterialCodesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrgMaterialMasterByMaterialCodesQuery,
        GetOrgMaterialMasterByMaterialCodesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrgMaterialMasterByMaterialCodesQuery | undefined,
  GetOrgMaterialMasterByMaterialCodesQueryVariables
>;
export function useGetOrgMaterialMasterByMaterialCodesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrgMaterialMasterByMaterialCodesQuery,
        GetOrgMaterialMasterByMaterialCodesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrgMaterialMasterByMaterialCodesQuery,
    GetOrgMaterialMasterByMaterialCodesQueryVariables
  >(GetOrgMaterialMasterByMaterialCodesDocument, options);
}
export type GetOrgMaterialMasterByMaterialCodesQueryHookResult = ReturnType<
  typeof useGetOrgMaterialMasterByMaterialCodesQuery
>;
export type GetOrgMaterialMasterByMaterialCodesLazyQueryHookResult = ReturnType<
  typeof useGetOrgMaterialMasterByMaterialCodesLazyQuery
>;
export type GetOrgMaterialMasterByMaterialCodesSuspenseQueryHookResult =
  ReturnType<typeof useGetOrgMaterialMasterByMaterialCodesSuspenseQuery>;
export type GetOrgMaterialMasterByMaterialCodesQueryResult = Apollo.QueryResult<
  GetOrgMaterialMasterByMaterialCodesQuery,
  GetOrgMaterialMasterByMaterialCodesQueryVariables
>;
