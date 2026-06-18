import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyByNameDocument = gql`
    query GetCompanyByName($where: Company_bool_exp) {
  Company(where: $where) {
    id
    name
    primaryContact
    ParentCompanyMappings(where: {isActive: {_eq: true}}) {
      ParentCompanyId
    }
    metadata
    IsManufacturing
  }
}
    `;

/**
 * __useGetCompanyByNameQuery__
 *
 * To run a query within a React component, call `useGetCompanyByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyByNameQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCompanyByNameQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetCompanyByNameQuery, Types.GetCompanyByNameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyByNameQuery, Types.GetCompanyByNameQueryVariables>(GetCompanyByNameDocument, options);
      }
export function useGetCompanyByNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyByNameQuery, Types.GetCompanyByNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyByNameQuery, Types.GetCompanyByNameQueryVariables>(GetCompanyByNameDocument, options);
        }
export type GetCompanyByNameQueryHookResult = ReturnType<typeof useGetCompanyByNameQuery>;
export type GetCompanyByNameLazyQueryHookResult = ReturnType<typeof useGetCompanyByNameLazyQuery>;
export type GetCompanyByNameQueryResult = Apollo.QueryResult<Types.GetCompanyByNameQuery, Types.GetCompanyByNameQueryVariables>;