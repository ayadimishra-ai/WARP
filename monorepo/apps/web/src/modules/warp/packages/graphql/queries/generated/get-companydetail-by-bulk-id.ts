import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyDetailByBulkIdDocument = gql`
    query getCompanyDetailByBulkId($companyIds: [uuid!]) {
  Company(where: {id: {_in: $companyIds}, isActive: {_eq: true}}) {
    id
    name
    primaryContact
    details
    platformId
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
    }
  }
}
    `;

/**
 * __useGetCompanyDetailByBulkIdQuery__
 *
 * To run a query within a React component, call `useGetCompanyDetailByBulkIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDetailByBulkIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDetailByBulkIdQuery({
 *   variables: {
 *      companyIds: // value for 'companyIds'
 *   },
 * });
 */
export function useGetCompanyDetailByBulkIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>(GetCompanyDetailByBulkIdDocument, options);
      }
export function useGetCompanyDetailByBulkIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>(GetCompanyDetailByBulkIdDocument, options);
        }
// @ts-ignore
export function useGetCompanyDetailByBulkIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>;
export function useGetCompanyDetailByBulkIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetCompanyDetailByBulkIdQuery | undefined, Types.GetCompanyDetailByBulkIdQueryVariables>;
export function useGetCompanyDetailByBulkIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>(GetCompanyDetailByBulkIdDocument, options);
        }
export type GetCompanyDetailByBulkIdQueryHookResult = ReturnType<typeof useGetCompanyDetailByBulkIdQuery>;
export type GetCompanyDetailByBulkIdLazyQueryHookResult = ReturnType<typeof useGetCompanyDetailByBulkIdLazyQuery>;
export type GetCompanyDetailByBulkIdSuspenseQueryHookResult = ReturnType<typeof useGetCompanyDetailByBulkIdSuspenseQuery>;
export type GetCompanyDetailByBulkIdQueryResult = Apollo.QueryResult<Types.GetCompanyDetailByBulkIdQuery, Types.GetCompanyDetailByBulkIdQueryVariables>;