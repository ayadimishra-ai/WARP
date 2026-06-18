import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyByParentCompanyIdAndPlatformIdDocument = gql`
    query GetCompanyByParentCompanyIdAndPlatformId($parentCompanyId: uuid, $platformId: uuid, $allConsultantCompanyIds: [uuid!]) {
  Company(
    where: {_and: [{isActive: {_eq: true}}, {platformId: {_eq: $platformId}}], ParentCompanyMappings: {ParentCompanyId: {_eq: $parentCompanyId}, isActive: {_eq: true}}, id: {_nin: $allConsultantCompanyIds}}
  ) {
    id
    name
    country
    primaryContact
    isActive
    IsManufacturing
  }
}
    `;

/**
 * __useGetCompanyByParentCompanyIdAndPlatformIdQuery__
 *
 * To run a query within a React component, call `useGetCompanyByParentCompanyIdAndPlatformIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyByParentCompanyIdAndPlatformIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyByParentCompanyIdAndPlatformIdQuery({
 *   variables: {
 *      parentCompanyId: // value for 'parentCompanyId'
 *      platformId: // value for 'platformId'
 *      allConsultantCompanyIds: // value for 'allConsultantCompanyIds'
 *   },
 * });
 */
export function useGetCompanyByParentCompanyIdAndPlatformIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyByParentCompanyIdAndPlatformIdQuery, Types.GetCompanyByParentCompanyIdAndPlatformIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyByParentCompanyIdAndPlatformIdQuery, Types.GetCompanyByParentCompanyIdAndPlatformIdQueryVariables>(GetCompanyByParentCompanyIdAndPlatformIdDocument, options);
      }
export function useGetCompanyByParentCompanyIdAndPlatformIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyByParentCompanyIdAndPlatformIdQuery, Types.GetCompanyByParentCompanyIdAndPlatformIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyByParentCompanyIdAndPlatformIdQuery, Types.GetCompanyByParentCompanyIdAndPlatformIdQueryVariables>(GetCompanyByParentCompanyIdAndPlatformIdDocument, options);
        }
export type GetCompanyByParentCompanyIdAndPlatformIdQueryHookResult = ReturnType<typeof useGetCompanyByParentCompanyIdAndPlatformIdQuery>;
export type GetCompanyByParentCompanyIdAndPlatformIdLazyQueryHookResult = ReturnType<typeof useGetCompanyByParentCompanyIdAndPlatformIdLazyQuery>;
export type GetCompanyByParentCompanyIdAndPlatformIdQueryResult = Apollo.QueryResult<Types.GetCompanyByParentCompanyIdAndPlatformIdQuery, Types.GetCompanyByParentCompanyIdAndPlatformIdQueryVariables>;