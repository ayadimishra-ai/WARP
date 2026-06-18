import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyDetailByparentcompanyidDocument = gql`
    query getCompanyDetailByparentcompanyid($companyId: uuid!, $parentCompanyId: uuid!) {
  Company(where: {id: {_eq: $companyId}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    ParentCompanyMappings(
      where: {isActive: {_eq: true}, ParentCompanyId: {_eq: $parentCompanyId}}
    ) {
      ParentCompanyId
    }
    details
    platformId
    metadata
  }
}
    `;

/**
 * __useGetCompanyDetailByparentcompanyidQuery__
 *
 * To run a query within a React component, call `useGetCompanyDetailByparentcompanyidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDetailByparentcompanyidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDetailByparentcompanyidQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      parentCompanyId: // value for 'parentCompanyId'
 *   },
 * });
 */
export function useGetCompanyDetailByparentcompanyidQuery(baseOptions: Apollo.QueryHookOptions<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables> & ({ variables: Types.GetCompanyDetailByparentcompanyidQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>(GetCompanyDetailByparentcompanyidDocument, options);
      }
export function useGetCompanyDetailByparentcompanyidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>(GetCompanyDetailByparentcompanyidDocument, options);
        }
// @ts-ignore
export function useGetCompanyDetailByparentcompanyidSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>;
export function useGetCompanyDetailByparentcompanyidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetCompanyDetailByparentcompanyidQuery | undefined, Types.GetCompanyDetailByparentcompanyidQueryVariables>;
export function useGetCompanyDetailByparentcompanyidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>(GetCompanyDetailByparentcompanyidDocument, options);
        }
export type GetCompanyDetailByparentcompanyidQueryHookResult = ReturnType<typeof useGetCompanyDetailByparentcompanyidQuery>;
export type GetCompanyDetailByparentcompanyidLazyQueryHookResult = ReturnType<typeof useGetCompanyDetailByparentcompanyidLazyQuery>;
export type GetCompanyDetailByparentcompanyidSuspenseQueryHookResult = ReturnType<typeof useGetCompanyDetailByparentcompanyidSuspenseQuery>;
export type GetCompanyDetailByparentcompanyidQueryResult = Apollo.QueryResult<Types.GetCompanyDetailByparentcompanyidQuery, Types.GetCompanyDetailByparentcompanyidQueryVariables>;