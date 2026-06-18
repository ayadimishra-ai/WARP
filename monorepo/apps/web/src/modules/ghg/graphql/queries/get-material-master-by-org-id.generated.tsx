import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialMasterByOrgIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars["uuid"]["input"];
}>;

export type GetMaterialMasterByOrgIdQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    client_master_id?: string | null;
    name: string;
    type: string;
    organization_id: any;
    code?: string | null;
    created_at: any;
    updated_at: any;
    Material_Weight_Per_Unit?: any | null;
    UoM_Material_Weight?: string | null;
  }>;
};

export const GetMaterialMasterByOrgIdDocument = gql`
  query getMaterialMasterByOrgId($organizationId: uuid!) {
    OrgMaterialMaster(where: { organization_id: { _eq: $organizationId } }) {
      id
      client_master_id
      name
      type
      organization_id
      code
      created_at
      updated_at
      Material_Weight_Per_Unit
      UoM_Material_Weight
    }
  }
`;

/**
 * __useGetMaterialMasterByOrgIdQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterByOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterByOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterByOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetMaterialMasterByOrgIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialMasterByOrgIdQuery,
    GetMaterialMasterByOrgIdQueryVariables
  > &
    (
      | { variables: GetMaterialMasterByOrgIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMaterialMasterByOrgIdQuery,
    GetMaterialMasterByOrgIdQueryVariables
  >(GetMaterialMasterByOrgIdDocument, options);
}
export function useGetMaterialMasterByOrgIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialMasterByOrgIdQuery,
    GetMaterialMasterByOrgIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialMasterByOrgIdQuery,
    GetMaterialMasterByOrgIdQueryVariables
  >(GetMaterialMasterByOrgIdDocument, options);
}
// @ts-ignore
export function useGetMaterialMasterByOrgIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialMasterByOrgIdQuery,
    GetMaterialMasterByOrgIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialMasterByOrgIdQuery,
  GetMaterialMasterByOrgIdQueryVariables
>;
export function useGetMaterialMasterByOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialMasterByOrgIdQuery,
        GetMaterialMasterByOrgIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialMasterByOrgIdQuery | undefined,
  GetMaterialMasterByOrgIdQueryVariables
>;
export function useGetMaterialMasterByOrgIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialMasterByOrgIdQuery,
        GetMaterialMasterByOrgIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialMasterByOrgIdQuery,
    GetMaterialMasterByOrgIdQueryVariables
  >(GetMaterialMasterByOrgIdDocument, options);
}
export type GetMaterialMasterByOrgIdQueryHookResult = ReturnType<
  typeof useGetMaterialMasterByOrgIdQuery
>;
export type GetMaterialMasterByOrgIdLazyQueryHookResult = ReturnType<
  typeof useGetMaterialMasterByOrgIdLazyQuery
>;
export type GetMaterialMasterByOrgIdSuspenseQueryHookResult = ReturnType<
  typeof useGetMaterialMasterByOrgIdSuspenseQuery
>;
export type GetMaterialMasterByOrgIdQueryResult = Apollo.QueryResult<
  GetMaterialMasterByOrgIdQuery,
  GetMaterialMasterByOrgIdQueryVariables
>;
