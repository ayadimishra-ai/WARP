import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetParentCompanyByCompanyAndParentCompanyIdDocument = gql`
    query getParentCompanyByCompanyAndParentCompanyId($companyId: uuid!, $parentCompanyId: uuid!) {
  ParentCompanyMapping(
    where: {CompanyId: {_eq: $companyId}, ParentCompanyId: {_eq: $parentCompanyId}}
  ) {
    Id
  }
}
    `;

/**
 * __useGetParentCompanyByCompanyAndParentCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetParentCompanyByCompanyAndParentCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParentCompanyByCompanyAndParentCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParentCompanyByCompanyAndParentCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      parentCompanyId: // value for 'parentCompanyId'
 *   },
 * });
 */
export function useGetParentCompanyByCompanyAndParentCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetParentCompanyByCompanyAndParentCompanyIdQuery, Types.GetParentCompanyByCompanyAndParentCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetParentCompanyByCompanyAndParentCompanyIdQuery, Types.GetParentCompanyByCompanyAndParentCompanyIdQueryVariables>(GetParentCompanyByCompanyAndParentCompanyIdDocument, options);
      }
export function useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetParentCompanyByCompanyAndParentCompanyIdQuery, Types.GetParentCompanyByCompanyAndParentCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetParentCompanyByCompanyAndParentCompanyIdQuery, Types.GetParentCompanyByCompanyAndParentCompanyIdQueryVariables>(GetParentCompanyByCompanyAndParentCompanyIdDocument, options);
        }
export type GetParentCompanyByCompanyAndParentCompanyIdQueryHookResult = ReturnType<typeof useGetParentCompanyByCompanyAndParentCompanyIdQuery>;
export type GetParentCompanyByCompanyAndParentCompanyIdLazyQueryHookResult = ReturnType<typeof useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery>;
export type GetParentCompanyByCompanyAndParentCompanyIdQueryResult = Apollo.QueryResult<Types.GetParentCompanyByCompanyAndParentCompanyIdQuery, Types.GetParentCompanyByCompanyAndParentCompanyIdQueryVariables>;