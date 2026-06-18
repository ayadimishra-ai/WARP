import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAuthUserDetailsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  email: Types.Scalars['String']['input'];
}>;


export type GetAuthUserDetailsQuery = { __typename?: 'query_root', AppUser: Array<{ __typename?: 'AppUser', id: any, email: string, role: string, is_AI_enabled?: boolean | null }>, UserOrganizationAddressMapping: Array<{ __typename?: 'UserOrganizationAddressMapping', user_id: any, activities: any, AppUser: { __typename?: 'AppUser', email: string, role: string, is_AI_enabled?: boolean | null }, OrganizationAddress?: { __typename?: 'OrganizationAddress', id: any, address_id: any } | null }> };


export const GetAuthUserDetailsDocument = gql`
    query getAuthUserDetails($organizationId: uuid!, $email: String!) {
  AppUser(
    where: {_and: [{organization_id: {_eq: $organizationId}}, {email: {_eq: $email}}]}
  ) {
    id
    email
    role
    is_AI_enabled
  }
  UserOrganizationAddressMapping(
    where: {_and: [{organization_id: {_eq: $organizationId}}, {AppUser: {email: {_eq: $email}}}]}
  ) {
    user_id
    AppUser {
      email
      role
      is_AI_enabled
    }
    OrganizationAddress {
      id
      address_id
    }
    activities
  }
}
    `;

/**
 * __useGetAuthUserDetailsQuery__
 *
 * To run a query within a React component, call `useGetAuthUserDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAuthUserDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAuthUserDetailsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetAuthUserDetailsQuery(baseOptions: Apollo.QueryHookOptions<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables> & ({ variables: GetAuthUserDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables>(GetAuthUserDetailsDocument, options);
      }
export function useGetAuthUserDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables>(GetAuthUserDetailsDocument, options);
        }
export function useGetAuthUserDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables>(GetAuthUserDetailsDocument, options);
        }
export type GetAuthUserDetailsQueryHookResult = ReturnType<typeof useGetAuthUserDetailsQuery>;
export type GetAuthUserDetailsLazyQueryHookResult = ReturnType<typeof useGetAuthUserDetailsLazyQuery>;
export type GetAuthUserDetailsSuspenseQueryHookResult = ReturnType<typeof useGetAuthUserDetailsSuspenseQuery>;
export type GetAuthUserDetailsQueryResult = Apollo.QueryResult<GetAuthUserDetailsQuery, GetAuthUserDetailsQueryVariables>;