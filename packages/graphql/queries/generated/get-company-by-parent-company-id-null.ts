import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyByParentCompanyIdNullDocument = gql`
    query GetCompanyByParentCompanyIdNull($parentCompanyId: uuid, $platformId: uuid, $allConsultantCompanyIds: [uuid!]) {
  Company(
    where: {_and: [{isActive: {_eq: true}}, {platformId: {_eq: $platformId}}, {id: {_neq: $parentCompanyId}}], ParentCompanyMappings: {_or: [{ParentCompanyId: {_is_null: true}}, {ParentCompanyId: {_neq: $parentCompanyId}}], _and: [{isActive: {_eq: true}}]}, id: {_nin: $allConsultantCompanyIds}}
  ) {
    id
    name
    country
    primaryContact
    isActive
    parentCompanyId
    ParentCompanyMappings {
      ParentCompanyId
      isActive
    }
    IsManufacturing
  }
}
    `;

/**
 * __useGetCompanyByParentCompanyIdNullQuery__
 *
 * To run a query within a React component, call `useGetCompanyByParentCompanyIdNullQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyByParentCompanyIdNullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyByParentCompanyIdNullQuery({
 *   variables: {
 *      parentCompanyId: // value for 'parentCompanyId'
 *      platformId: // value for 'platformId'
 *      allConsultantCompanyIds: // value for 'allConsultantCompanyIds'
 *   },
 * });
 */
export function useGetCompanyByParentCompanyIdNullQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyByParentCompanyIdNullQuery, Types.GetCompanyByParentCompanyIdNullQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyByParentCompanyIdNullQuery, Types.GetCompanyByParentCompanyIdNullQueryVariables>(GetCompanyByParentCompanyIdNullDocument, options);
      }
export function useGetCompanyByParentCompanyIdNullLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyByParentCompanyIdNullQuery, Types.GetCompanyByParentCompanyIdNullQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyByParentCompanyIdNullQuery, Types.GetCompanyByParentCompanyIdNullQueryVariables>(GetCompanyByParentCompanyIdNullDocument, options);
        }
export type GetCompanyByParentCompanyIdNullQueryHookResult = ReturnType<typeof useGetCompanyByParentCompanyIdNullQuery>;
export type GetCompanyByParentCompanyIdNullLazyQueryHookResult = ReturnType<typeof useGetCompanyByParentCompanyIdNullLazyQuery>;
export type GetCompanyByParentCompanyIdNullQueryResult = Apollo.QueryResult<Types.GetCompanyByParentCompanyIdNullQuery, Types.GetCompanyByParentCompanyIdNullQueryVariables>;