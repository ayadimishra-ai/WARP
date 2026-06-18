import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables = Types.Exact<{
  master_key: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  organizationAddressId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type GetActivityMasterDataByKeyAndOrganizationAddressIdQuery = { __typename?: 'query_root', ActivityMaster: Array<{ __typename?: 'ActivityMaster', master_key: string, master_data: any }> };


export const GetActivityMasterDataByKeyAndOrganizationAddressIdDocument = gql`
    query getActivityMasterDataByKeyAndOrganizationAddressId($master_key: [String!]!, $organizationAddressId: uuid) {
  ActivityMaster(
    where: {master_key: {_in: $master_key}, organization_address_id: {_eq: $organizationAddressId}}
  ) {
    master_key
    master_data
  }
}
    `;

/**
 * __useGetActivityMasterDataByKeyAndOrganizationAddressIdQuery__
 *
 * To run a query within a React component, call `useGetActivityMasterDataByKeyAndOrganizationAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityMasterDataByKeyAndOrganizationAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityMasterDataByKeyAndOrganizationAddressIdQuery({
 *   variables: {
 *      master_key: // value for 'master_key'
 *      organizationAddressId: // value for 'organizationAddressId'
 *   },
 * });
 */
export function useGetActivityMasterDataByKeyAndOrganizationAddressIdQuery(baseOptions: Apollo.QueryHookOptions<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables> & ({ variables: GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables>(GetActivityMasterDataByKeyAndOrganizationAddressIdDocument, options);
      }
export function useGetActivityMasterDataByKeyAndOrganizationAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables>(GetActivityMasterDataByKeyAndOrganizationAddressIdDocument, options);
        }
export function useGetActivityMasterDataByKeyAndOrganizationAddressIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables>(GetActivityMasterDataByKeyAndOrganizationAddressIdDocument, options);
        }
export type GetActivityMasterDataByKeyAndOrganizationAddressIdQueryHookResult = ReturnType<typeof useGetActivityMasterDataByKeyAndOrganizationAddressIdQuery>;
export type GetActivityMasterDataByKeyAndOrganizationAddressIdLazyQueryHookResult = ReturnType<typeof useGetActivityMasterDataByKeyAndOrganizationAddressIdLazyQuery>;
export type GetActivityMasterDataByKeyAndOrganizationAddressIdSuspenseQueryHookResult = ReturnType<typeof useGetActivityMasterDataByKeyAndOrganizationAddressIdSuspenseQuery>;
export type GetActivityMasterDataByKeyAndOrganizationAddressIdQueryResult = Apollo.QueryResult<GetActivityMasterDataByKeyAndOrganizationAddressIdQuery, GetActivityMasterDataByKeyAndOrganizationAddressIdQueryVariables>;