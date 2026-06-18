import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMaterialMasterByOrganizationQueryVariables = Types.Exact<{
  organization_id: Types.Scalars["uuid"]["input"];
}>;

export type GetMaterialMasterByOrganizationQuery = {
  __typename?: "query_root";
  OrgMaterialMaster: Array<{
    __typename?: "OrgMaterialMaster";
    id: any;
    name: string;
    code?: string | null;
    type: string;
    Material_Weight_Per_Unit?: any | null;
    UoM_Material_Weight?: string | null;
    Material_Classification?: string | null;
    Material_Description?: string | null;
    Additional_Information?: string | null;
    organization_id: any;
  }>;
};

export const GetMaterialMasterByOrganizationDocument = gql`
  query getMaterialMasterByOrganization($organization_id: uuid!) {
    OrgMaterialMaster(
      where: {
        organization_id: { _eq: $organization_id }
        is_deleted: { _eq: false }
      }
    ) {
      id
      name
      code
      type
      Material_Weight_Per_Unit
      UoM_Material_Weight
      Material_Classification
      Material_Description
      Additional_Information
      organization_id
    }
  }
`;

/**
 * __useGetMaterialMasterByOrganizationQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterByOrganizationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterByOrganizationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterByOrganizationQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetMaterialMasterByOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMaterialMasterByOrganizationQuery,
    GetMaterialMasterByOrganizationQueryVariables
  > &
    (
      | {
          variables: GetMaterialMasterByOrganizationQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMaterialMasterByOrganizationQuery,
    GetMaterialMasterByOrganizationQueryVariables
  >(GetMaterialMasterByOrganizationDocument, options);
}
export function useGetMaterialMasterByOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMaterialMasterByOrganizationQuery,
    GetMaterialMasterByOrganizationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMaterialMasterByOrganizationQuery,
    GetMaterialMasterByOrganizationQueryVariables
  >(GetMaterialMasterByOrganizationDocument, options);
}
// @ts-ignore
export function useGetMaterialMasterByOrganizationSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMaterialMasterByOrganizationQuery,
    GetMaterialMasterByOrganizationQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMaterialMasterByOrganizationQuery,
  GetMaterialMasterByOrganizationQueryVariables
>;
export function useGetMaterialMasterByOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialMasterByOrganizationQuery,
        GetMaterialMasterByOrganizationQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMaterialMasterByOrganizationQuery | undefined,
  GetMaterialMasterByOrganizationQueryVariables
>;
export function useGetMaterialMasterByOrganizationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMaterialMasterByOrganizationQuery,
        GetMaterialMasterByOrganizationQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMaterialMasterByOrganizationQuery,
    GetMaterialMasterByOrganizationQueryVariables
  >(GetMaterialMasterByOrganizationDocument, options);
}
export type GetMaterialMasterByOrganizationQueryHookResult = ReturnType<
  typeof useGetMaterialMasterByOrganizationQuery
>;
export type GetMaterialMasterByOrganizationLazyQueryHookResult = ReturnType<
  typeof useGetMaterialMasterByOrganizationLazyQuery
>;
export type GetMaterialMasterByOrganizationSuspenseQueryHookResult = ReturnType<
  typeof useGetMaterialMasterByOrganizationSuspenseQuery
>;
export type GetMaterialMasterByOrganizationQueryResult = Apollo.QueryResult<
  GetMaterialMasterByOrganizationQuery,
  GetMaterialMasterByOrganizationQueryVariables
>;
