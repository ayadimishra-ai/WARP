import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrgMaterialMasterByCodesInsensitiveQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.OrgMaterialMaster_Bool_Exp>;
}>;


export type GetOrgMaterialMasterByCodesInsensitiveQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, client_master_id?: string | null, name: string, code?: string | null, type: string, organization_id: any, Material_Weight_Per_Unit?: any | null, UoM_Material_Weight?: string | null }> };


export const GetOrgMaterialMasterByCodesInsensitiveDocument = gql`
    query getOrgMaterialMasterByCodesInsensitive($where: OrgMaterialMaster_bool_exp) {
  OrgMaterialMaster(where: $where) {
    id
    client_master_id
    name
    code
    type
    organization_id
    Material_Weight_Per_Unit
    UoM_Material_Weight
  }
}
    `;

/**
 * __useGetOrgMaterialMasterByCodesInsensitiveQuery__
 *
 * To run a query within a React component, call `useGetOrgMaterialMasterByCodesInsensitiveQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrgMaterialMasterByCodesInsensitiveQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrgMaterialMasterByCodesInsensitiveQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetOrgMaterialMasterByCodesInsensitiveQuery(baseOptions?: Apollo.QueryHookOptions<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>(GetOrgMaterialMasterByCodesInsensitiveDocument, options);
      }
export function useGetOrgMaterialMasterByCodesInsensitiveLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>(GetOrgMaterialMasterByCodesInsensitiveDocument, options);
        }
export function useGetOrgMaterialMasterByCodesInsensitiveSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>(GetOrgMaterialMasterByCodesInsensitiveDocument, options);
        }
export type GetOrgMaterialMasterByCodesInsensitiveQueryHookResult = ReturnType<typeof useGetOrgMaterialMasterByCodesInsensitiveQuery>;
export type GetOrgMaterialMasterByCodesInsensitiveLazyQueryHookResult = ReturnType<typeof useGetOrgMaterialMasterByCodesInsensitiveLazyQuery>;
export type GetOrgMaterialMasterByCodesInsensitiveSuspenseQueryHookResult = ReturnType<typeof useGetOrgMaterialMasterByCodesInsensitiveSuspenseQuery>;
export type GetOrgMaterialMasterByCodesInsensitiveQueryResult = Apollo.QueryResult<GetOrgMaterialMasterByCodesInsensitiveQuery, GetOrgMaterialMasterByCodesInsensitiveQueryVariables>;