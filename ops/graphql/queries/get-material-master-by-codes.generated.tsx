import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMaterialMasterByCodesQueryVariables = Types.Exact<{
  where: Types.OrgMaterialMaster_Bool_Exp;
}>;


export type GetMaterialMasterByCodesQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, type: string, Material_Weight_Per_Unit?: any | null, UoM_Material_Weight?: string | null, Material_Classification?: string | null, Material_Description?: string | null, Additional_Information?: string | null, organization_id: any }> };


export const GetMaterialMasterByCodesDocument = gql`
    query getMaterialMasterByCodes($where: OrgMaterialMaster_bool_exp!) {
  OrgMaterialMaster(where: $where) {
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
 * __useGetMaterialMasterByCodesQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterByCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterByCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterByCodesQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetMaterialMasterByCodesQuery(baseOptions: Apollo.QueryHookOptions<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables> & ({ variables: GetMaterialMasterByCodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables>(GetMaterialMasterByCodesDocument, options);
      }
export function useGetMaterialMasterByCodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables>(GetMaterialMasterByCodesDocument, options);
        }
export function useGetMaterialMasterByCodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables>(GetMaterialMasterByCodesDocument, options);
        }
export type GetMaterialMasterByCodesQueryHookResult = ReturnType<typeof useGetMaterialMasterByCodesQuery>;
export type GetMaterialMasterByCodesLazyQueryHookResult = ReturnType<typeof useGetMaterialMasterByCodesLazyQuery>;
export type GetMaterialMasterByCodesSuspenseQueryHookResult = ReturnType<typeof useGetMaterialMasterByCodesSuspenseQuery>;
export type GetMaterialMasterByCodesQueryResult = Apollo.QueryResult<GetMaterialMasterByCodesQuery, GetMaterialMasterByCodesQueryVariables>;