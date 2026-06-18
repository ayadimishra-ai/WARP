import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppUserOrgByEmailQueryVariables = Types.Exact<{
  emails: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetAppUserOrgByEmailQuery = { __typename?: 'query_root', AppUser: Array<{ __typename?: 'AppUser', email: string, id: any, organization_id: any, Organization: { __typename?: 'Organization', name: string, metadata?: any | null } }> };


export const GetAppUserOrgByEmailDocument = gql`
    query getAppUserOrgByEmail($emails: [String!]!) {
  AppUser(where: {email: {_in: $emails}, is_deleted: {_eq: false}}) {
    email
    id
    organization_id
    Organization {
      name
      metadata
    }
  }
}
    `;

/**
 * __useGetAppUserOrgByEmailQuery__
 *
 * To run a query within a React component, call `useGetAppUserOrgByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserOrgByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserOrgByEmailQuery({
 *   variables: {
 *      emails: // value for 'emails'
 *   },
 * });
 */
export function useGetAppUserOrgByEmailQuery(baseOptions: Apollo.QueryHookOptions<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables> & ({ variables: GetAppUserOrgByEmailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables>(GetAppUserOrgByEmailDocument, options);
      }
export function useGetAppUserOrgByEmailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables>(GetAppUserOrgByEmailDocument, options);
        }
export function useGetAppUserOrgByEmailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables>(GetAppUserOrgByEmailDocument, options);
        }
export type GetAppUserOrgByEmailQueryHookResult = ReturnType<typeof useGetAppUserOrgByEmailQuery>;
export type GetAppUserOrgByEmailLazyQueryHookResult = ReturnType<typeof useGetAppUserOrgByEmailLazyQuery>;
export type GetAppUserOrgByEmailSuspenseQueryHookResult = ReturnType<typeof useGetAppUserOrgByEmailSuspenseQuery>;
export type GetAppUserOrgByEmailQueryResult = Apollo.QueryResult<GetAppUserOrgByEmailQuery, GetAppUserOrgByEmailQueryVariables>;