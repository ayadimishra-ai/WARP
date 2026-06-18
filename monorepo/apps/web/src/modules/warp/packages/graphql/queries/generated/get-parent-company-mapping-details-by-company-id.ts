import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetParentCompanyMappingDetailsByCompanyIdDocument = gql`
    query getParentCompanyMappingDetailsByCompanyId($companyId: uuid) {
  ParentCompanyMapping(
    where: {_and: [{CompanyId: {_eq: $companyId}}, {isActive: {_eq: true}}]}
  ) {
    Id
    CompanyId
    ParentCompanyId
    isActive
  }
}
    `;

/**
 * __useGetParentCompanyMappingDetailsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetParentCompanyMappingDetailsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParentCompanyMappingDetailsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParentCompanyMappingDetailsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetParentCompanyMappingDetailsByCompanyIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>(GetParentCompanyMappingDetailsByCompanyIdDocument, options);
      }
export function useGetParentCompanyMappingDetailsByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>(GetParentCompanyMappingDetailsByCompanyIdDocument, options);
        }
// @ts-ignore
export function useGetParentCompanyMappingDetailsByCompanyIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>;
export function useGetParentCompanyMappingDetailsByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetParentCompanyMappingDetailsByCompanyIdQuery | undefined, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>;
export function useGetParentCompanyMappingDetailsByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>(GetParentCompanyMappingDetailsByCompanyIdDocument, options);
        }
export type GetParentCompanyMappingDetailsByCompanyIdQueryHookResult = ReturnType<typeof useGetParentCompanyMappingDetailsByCompanyIdQuery>;
export type GetParentCompanyMappingDetailsByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetParentCompanyMappingDetailsByCompanyIdLazyQuery>;
export type GetParentCompanyMappingDetailsByCompanyIdSuspenseQueryHookResult = ReturnType<typeof useGetParentCompanyMappingDetailsByCompanyIdSuspenseQuery>;
export type GetParentCompanyMappingDetailsByCompanyIdQueryResult = Apollo.QueryResult<Types.GetParentCompanyMappingDetailsByCompanyIdQuery, Types.GetParentCompanyMappingDetailsByCompanyIdQueryVariables>;