import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const RaraCompanyAccessDocument = gql`
    query raraCompanyAccess($companyIdList: [uuid!]!, $companyId: uuid!) {
  ParentCompanyMapping(
    where: {ParentCompanyId: {_in: $companyIdList}, CompanyId: {_eq: $companyId}, isActive: {_eq: true}}
  ) {
    CompanyId
    ParentCompanyId
    Id
    __typename
  }
}
    `;

/**
 * __useRaraCompanyAccessQuery__
 *
 * To run a query within a React component, call `useRaraCompanyAccessQuery` and pass it any options that fit your needs.
 * When your component renders, `useRaraCompanyAccessQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRaraCompanyAccessQuery({
 *   variables: {
 *      companyIdList: // value for 'companyIdList'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useRaraCompanyAccessQuery(baseOptions: Apollo.QueryHookOptions<Types.RaraCompanyAccessQuery, Types.RaraCompanyAccessQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.RaraCompanyAccessQuery, Types.RaraCompanyAccessQueryVariables>(RaraCompanyAccessDocument, options);
      }
export function useRaraCompanyAccessLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.RaraCompanyAccessQuery, Types.RaraCompanyAccessQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.RaraCompanyAccessQuery, Types.RaraCompanyAccessQueryVariables>(RaraCompanyAccessDocument, options);
        }
export type RaraCompanyAccessQueryHookResult = ReturnType<typeof useRaraCompanyAccessQuery>;
export type RaraCompanyAccessLazyQueryHookResult = ReturnType<typeof useRaraCompanyAccessLazyQuery>;
export type RaraCompanyAccessQueryResult = Apollo.QueryResult<Types.RaraCompanyAccessQuery, Types.RaraCompanyAccessQueryVariables>;