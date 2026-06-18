import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMaterialMasterByOrgIdAndCodesQueryVariables = Types.Exact<{
  where: Types.OrgMaterialMaster_Bool_Exp;
}>;


export type GetMaterialMasterByOrgIdAndCodesQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, client_master_id?: string | null, name: string, type: string, organization_id: any, code?: string | null, created_at: any, updated_at: any, Material_Weight_Per_Unit?: any | null, UoM_Material_Weight?: string | null }> };


export const GetMaterialMasterByOrgIdAndCodesDocument = gql`
    query getMaterialMasterByOrgIdAndCodes($where: OrgMaterialMaster_bool_exp!) {
  OrgMaterialMaster(where: $where) {
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
 * __useGetMaterialMasterByOrgIdAndCodesQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterByOrgIdAndCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterByOrgIdAndCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterByOrgIdAndCodesQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetMaterialMasterByOrgIdAndCodesQuery(baseOptions: Apollo.QueryHookOptions<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables> & ({ variables: GetMaterialMasterByOrgIdAndCodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables>(GetMaterialMasterByOrgIdAndCodesDocument, options);
      }
export function useGetMaterialMasterByOrgIdAndCodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables>(GetMaterialMasterByOrgIdAndCodesDocument, options);
        }
export function useGetMaterialMasterByOrgIdAndCodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables>(GetMaterialMasterByOrgIdAndCodesDocument, options);
        }
export type GetMaterialMasterByOrgIdAndCodesQueryHookResult = ReturnType<typeof useGetMaterialMasterByOrgIdAndCodesQuery>;
export type GetMaterialMasterByOrgIdAndCodesLazyQueryHookResult = ReturnType<typeof useGetMaterialMasterByOrgIdAndCodesLazyQuery>;
export type GetMaterialMasterByOrgIdAndCodesSuspenseQueryHookResult = ReturnType<typeof useGetMaterialMasterByOrgIdAndCodesSuspenseQuery>;
export type GetMaterialMasterByOrgIdAndCodesQueryResult = Apollo.QueryResult<GetMaterialMasterByOrgIdAndCodesQuery, GetMaterialMasterByOrgIdAndCodesQueryVariables>;