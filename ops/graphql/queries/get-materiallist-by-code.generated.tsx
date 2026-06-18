import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMaterialListbycodeQueryVariables = Types.Exact<{
  materialMasterIdList: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetMaterialListbycodeQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, client_master_id?: string | null, type: string, Organization: { __typename?: 'Organization', id: any, name: string, OrgSupplierMasters: Array<{ __typename?: 'OrgSupplierMaster', client_master_id?: string | null, id: any, name: string, code?: string | null }> } }> };


export const GetMaterialListbycodeDocument = gql`
    query getMaterialListbycode($materialMasterIdList: [String!]!) {
  OrgMaterialMaster(
    where: {_and: {code: {_in: $materialMasterIdList}, is_deleted: {_eq: false}}}
  ) {
    id
    name
    code
    client_master_id
    type
    Organization {
      id
      name
      OrgSupplierMasters {
        client_master_id
        id
        name
        code
      }
    }
  }
}
    `;

/**
 * __useGetMaterialListbycodeQuery__
 *
 * To run a query within a React component, call `useGetMaterialListbycodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialListbycodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialListbycodeQuery({
 *   variables: {
 *      materialMasterIdList: // value for 'materialMasterIdList'
 *   },
 * });
 */
export function useGetMaterialListbycodeQuery(baseOptions: Apollo.QueryHookOptions<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables> & ({ variables: GetMaterialListbycodeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables>(GetMaterialListbycodeDocument, options);
      }
export function useGetMaterialListbycodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables>(GetMaterialListbycodeDocument, options);
        }
export function useGetMaterialListbycodeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables>(GetMaterialListbycodeDocument, options);
        }
export type GetMaterialListbycodeQueryHookResult = ReturnType<typeof useGetMaterialListbycodeQuery>;
export type GetMaterialListbycodeLazyQueryHookResult = ReturnType<typeof useGetMaterialListbycodeLazyQuery>;
export type GetMaterialListbycodeSuspenseQueryHookResult = ReturnType<typeof useGetMaterialListbycodeSuspenseQuery>;
export type GetMaterialListbycodeQueryResult = Apollo.QueryResult<GetMaterialListbycodeQuery, GetMaterialListbycodeQueryVariables>;