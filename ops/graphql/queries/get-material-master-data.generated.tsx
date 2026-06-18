import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetMaterialMasterDataQueryVariables = Types.Exact<{
  masterId: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetMaterialMasterDataQuery = { __typename?: 'query_root', OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', id: any, client_master_id?: string | null, type: string, name: string }> };


export const GetMaterialMasterDataDocument = gql`
    query getMaterialMasterData($masterId: [String!]!) {
  OrgMaterialMaster(where: {client_master_id: {_in: $masterId}}) {
    id
    client_master_id
    type
    name
  }
}
    `;

/**
 * __useGetMaterialMasterDataQuery__
 *
 * To run a query within a React component, call `useGetMaterialMasterDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialMasterDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialMasterDataQuery({
 *   variables: {
 *      masterId: // value for 'masterId'
 *   },
 * });
 */
export function useGetMaterialMasterDataQuery(baseOptions: Apollo.QueryHookOptions<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables> & ({ variables: GetMaterialMasterDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables>(GetMaterialMasterDataDocument, options);
      }
export function useGetMaterialMasterDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables>(GetMaterialMasterDataDocument, options);
        }
export function useGetMaterialMasterDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables>(GetMaterialMasterDataDocument, options);
        }
export type GetMaterialMasterDataQueryHookResult = ReturnType<typeof useGetMaterialMasterDataQuery>;
export type GetMaterialMasterDataLazyQueryHookResult = ReturnType<typeof useGetMaterialMasterDataLazyQuery>;
export type GetMaterialMasterDataSuspenseQueryHookResult = ReturnType<typeof useGetMaterialMasterDataSuspenseQuery>;
export type GetMaterialMasterDataQueryResult = Apollo.QueryResult<GetMaterialMasterDataQuery, GetMaterialMasterDataQueryVariables>;