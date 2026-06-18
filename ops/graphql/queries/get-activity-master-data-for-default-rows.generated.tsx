import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetActivityMasterDataForDefaultRowsQueryVariables = Types.Exact<{
  organizationId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
  organizationAddressIds?: Types.InputMaybe<Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input']>;
  masterKeys: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetActivityMasterDataForDefaultRowsQuery = { __typename?: 'query_root', ActivityMaster: Array<{ __typename?: 'ActivityMaster', master_key: string, master_data: any }>, OrgActivityMaster: Array<{ __typename?: 'OrgActivityMaster', organization_id: any, organization_address_id?: any | null, master_key: string, master_data: any }> };


export const GetActivityMasterDataForDefaultRowsDocument = gql`
    query getActivityMasterDataForDefaultRows($organizationId: uuid, $organizationAddressIds: [uuid!], $masterKeys: [String!]!) {
  ActivityMaster(where: {master_key: {_in: $masterKeys}}) {
    master_key
    master_data
  }
  OrgActivityMaster(
    where: {master_key: {_in: $masterKeys}, _or: [{organization_id: {_eq: $organizationId}}, {organization_address_id: {_in: $organizationAddressIds}}]}
  ) {
    organization_id
    organization_address_id
    master_key
    master_data
  }
}
    `;

/**
 * __useGetActivityMasterDataForDefaultRowsQuery__
 *
 * To run a query within a React component, call `useGetActivityMasterDataForDefaultRowsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityMasterDataForDefaultRowsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityMasterDataForDefaultRowsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      organizationAddressIds: // value for 'organizationAddressIds'
 *      masterKeys: // value for 'masterKeys'
 *   },
 * });
 */
export function useGetActivityMasterDataForDefaultRowsQuery(baseOptions: Apollo.QueryHookOptions<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables> & ({ variables: GetActivityMasterDataForDefaultRowsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables>(GetActivityMasterDataForDefaultRowsDocument, options);
      }
export function useGetActivityMasterDataForDefaultRowsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables>(GetActivityMasterDataForDefaultRowsDocument, options);
        }
export function useGetActivityMasterDataForDefaultRowsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables>(GetActivityMasterDataForDefaultRowsDocument, options);
        }
export type GetActivityMasterDataForDefaultRowsQueryHookResult = ReturnType<typeof useGetActivityMasterDataForDefaultRowsQuery>;
export type GetActivityMasterDataForDefaultRowsLazyQueryHookResult = ReturnType<typeof useGetActivityMasterDataForDefaultRowsLazyQuery>;
export type GetActivityMasterDataForDefaultRowsSuspenseQueryHookResult = ReturnType<typeof useGetActivityMasterDataForDefaultRowsSuspenseQuery>;
export type GetActivityMasterDataForDefaultRowsQueryResult = Apollo.QueryResult<GetActivityMasterDataForDefaultRowsQuery, GetActivityMasterDataForDefaultRowsQueryVariables>;