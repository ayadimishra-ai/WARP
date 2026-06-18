import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrgProductMasterByCodesInsensitiveQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.OrgProductMaster_Bool_Exp>;
}>;


export type GetOrgProductMasterByCodesInsensitiveQuery = { __typename?: 'query_root', OrgProductMaster: Array<{ __typename?: 'OrgProductMaster', id: any, client_master_id?: string | null, name: string, code?: string | null, organization_id: any }> };


export const GetOrgProductMasterByCodesInsensitiveDocument = gql`
    query getOrgProductMasterByCodesInsensitive($where: OrgProductMaster_bool_exp) {
  OrgProductMaster(where: $where) {
    id
    client_master_id
    name
    code
    organization_id
  }
}
    `;

/**
 * __useGetOrgProductMasterByCodesInsensitiveQuery__
 *
 * To run a query within a React component, call `useGetOrgProductMasterByCodesInsensitiveQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrgProductMasterByCodesInsensitiveQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrgProductMasterByCodesInsensitiveQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetOrgProductMasterByCodesInsensitiveQuery(baseOptions?: Apollo.QueryHookOptions<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>(GetOrgProductMasterByCodesInsensitiveDocument, options);
      }
export function useGetOrgProductMasterByCodesInsensitiveLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>(GetOrgProductMasterByCodesInsensitiveDocument, options);
        }
export function useGetOrgProductMasterByCodesInsensitiveSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>(GetOrgProductMasterByCodesInsensitiveDocument, options);
        }
export type GetOrgProductMasterByCodesInsensitiveQueryHookResult = ReturnType<typeof useGetOrgProductMasterByCodesInsensitiveQuery>;
export type GetOrgProductMasterByCodesInsensitiveLazyQueryHookResult = ReturnType<typeof useGetOrgProductMasterByCodesInsensitiveLazyQuery>;
export type GetOrgProductMasterByCodesInsensitiveSuspenseQueryHookResult = ReturnType<typeof useGetOrgProductMasterByCodesInsensitiveSuspenseQuery>;
export type GetOrgProductMasterByCodesInsensitiveQueryResult = Apollo.QueryResult<GetOrgProductMasterByCodesInsensitiveQuery, GetOrgProductMasterByCodesInsensitiveQueryVariables>;