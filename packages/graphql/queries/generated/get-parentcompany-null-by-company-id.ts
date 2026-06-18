import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetParentCompanyByCompanyIdNullDocument = gql`
    query GetParentCompanyByCompanyIdNull($companyId: uuid, $platformId: uuid) {
  Company(
    where: {_and: [{isActive: {_eq: true}}, {platformId: {_eq: $platformId}}, {id: {_eq: $companyId}}], ParentCompanyMappings: {_or: [{ParentCompanyId: {_is_null: true}}], _and: {isActive: {_eq: true}}}}
  ) {
    id
    name
    country
    primaryContact
    isActive
    parentCompanyId
    ParentCompanyMappings {
      ParentCompanyId
    }
  }
}
    `;

/**
 * __useGetParentCompanyByCompanyIdNullQuery__
 *
 * To run a query within a React component, call `useGetParentCompanyByCompanyIdNullQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParentCompanyByCompanyIdNullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParentCompanyByCompanyIdNullQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      platformId: // value for 'platformId'
 *   },
 * });
 */
export function useGetParentCompanyByCompanyIdNullQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetParentCompanyByCompanyIdNullQuery, Types.GetParentCompanyByCompanyIdNullQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetParentCompanyByCompanyIdNullQuery, Types.GetParentCompanyByCompanyIdNullQueryVariables>(GetParentCompanyByCompanyIdNullDocument, options);
      }
export function useGetParentCompanyByCompanyIdNullLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetParentCompanyByCompanyIdNullQuery, Types.GetParentCompanyByCompanyIdNullQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetParentCompanyByCompanyIdNullQuery, Types.GetParentCompanyByCompanyIdNullQueryVariables>(GetParentCompanyByCompanyIdNullDocument, options);
        }
export type GetParentCompanyByCompanyIdNullQueryHookResult = ReturnType<typeof useGetParentCompanyByCompanyIdNullQuery>;
export type GetParentCompanyByCompanyIdNullLazyQueryHookResult = ReturnType<typeof useGetParentCompanyByCompanyIdNullLazyQuery>;
export type GetParentCompanyByCompanyIdNullQueryResult = Apollo.QueryResult<Types.GetParentCompanyByCompanyIdNullQuery, Types.GetParentCompanyByCompanyIdNullQueryVariables>;